from datetime import datetime
import psycopg2
from psycopg2.extras import execute_values
import requests
import os
from pathlib import Path
import json
import logging
import shutil

from airflow import DAG
from airflow.operators.python import PythonOperator

from include.db import get_connection
from include.transforms import convert_float

DATA_DIR = Path("/opt/airflow/data/")
TEMP_DIR = Path(f"{DATA_DIR}/tmp/aircraft")

def extract_aircraft_data(**context):
    api_key = os.getenv("API_NINJAS_KEY")

    if not api_key:
        raise ValueError("API_NINJAS_KEY environment variable is missing!")

    # aircraft_manufacturers = ["Boeing", "Airbus", "Embraer", "Piper", "Cessna", "Gulfstream"]

    # response = requests.get(
    #     "https://api.api-ninjas.com/v1/aircraft",
    #     headers={"X-Api-Key": api_key},
    #     params={"manufacturer": "Boeing", "limit": "30"},
    #     timeout=10,
    # )

    # data = response.json()

    DATA_FILE = Path(f"{DATA_DIR}/aircraft_models.json")
    data = []

    with open(DATA_FILE, "r", encoding="utf-8") as file:
        data = json.load(file)

    
    # Create tuple of records to be input into the database
    records = [{"manufacturer": x["manufacturer"], "model": x["model"], "aircraft_class": x["aircraft_class"], "max_speed_knots": x["max_speed_knots"], "range_nautical_miles": x["range_nautical_miles"]} for x in data]

    run_id = context["ts_nodash"]

    output_dir = Path(f"{TEMP_DIR}/{run_id}")
    output_dir.mkdir(parents=True, exist_ok=True)

    output_file = Path(f"{output_dir}/aircraft_models.json")
    
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(records, f, indent=2)

    return str(output_dir)



def transform_aircraft_data(**context):
    output_dir = context["ti"].xcom_pull(task_ids="extract_task")

    try:
        with get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("SELECT manufacturer_id, name FROM aircraft_manufacturers;")
                # Creates e.g. {'boeing': 1, 'airbus': 2, 'embraer': 3, 'piper': 4}
                manufacturer_map = {name.lower(): m_id for m_id, name in cursor.fetchall()}
    finally:
        conn.close()

    data = []
    file_path = Path(f"{output_dir}/aircraft_models.json")
    with open(file_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    records = [{"manufacturer_id": manufacturer_map.get(x["manufacturer"].lower(), -1), "model": x["model"], "aircraft_class": x["aircraft_class"], "max_speed_knots": convert_float(x["max_speed_knots"]), "range_nautical_miles": convert_float(x["range_nautical_miles"])} for x in data]

    output_file = Path(f"{output_dir}/aircraft_models_transformed.json")
        
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(records, f, indent=2)

    return str(output_dir)
    

def load_aircraft_data(**context):
    output_dir = context["ti"].xcom_pull(task_ids="transform_task")

    data = []
    file_path = Path(f"{output_dir}/aircraft_models_transformed.json")
    with open(file_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    try:
        with get_connection() as conn:
            with conn.cursor() as cursor:
                # Batch insert safely without duplicates
                records = [
                    (record["manufacturer_id"], record["model"], record["aircraft_class"], record["max_speed_knots"], record["range_nautical_miles"])
                    for record in data if record["manufacturer_id"] != -1
                ]
                skipped_records = [x for x in data if x["manufacturer_id"] == -1]

                execute_values(cursor, 
                    """
                    INSERT INTO aircraft_models
                        (manufacturer_id, model_name, aircraft_class, max_speed_knots, max_range_nm) 
                        VALUES %s
                        ON CONFLICT(manufacturer_id, model_name) DO UPDATE
                        SET aircraft_class=EXCLUDED.aircraft_class,
                        max_speed_knots=EXCLUDED.max_speed_knots,
                        max_range_nm=EXCLUDED.max_range_nm
                    """,
                    records
                )
                conn.commit()

                # Read back to verify
                cursor.execute("SELECT count(model_id) FROM aircraft_models;")
                logging.info("Rows currently in aircraft_models: %s", cursor.fetchone()[0])

                if len(skipped_records) > 0:
                    logging.info("Skipped records due to unknown manufacturer: %s", len(skipped_records)) 
    finally:
        conn.close()

    shutil.rmtree(output_dir, ignore_errors=True)
    logging.info("Cleaned up run folder: %s", output_dir)

with DAG(
    dag_id="aircraft_data_etl_pipeline",
    start_date=datetime(2025, 1, 1),
    schedule="@daily",
    catchup=False,
) as dag:

    t1 = PythonOperator(task_id="extract_task", python_callable=extract_aircraft_data)
    t2 = PythonOperator(task_id="transform_task", python_callable=transform_aircraft_data)
    t3 = PythonOperator(task_id="load_task", python_callable=load_aircraft_data)

    # Define the pipeline order
    t1 >> t2 >> t3