from datetime import datetime
import psycopg2
from psycopg2.extras import execute_values
import requests
import os
from pathlib import Path
import json

from airflow import DAG
from airflow.operators.python import PythonOperator

DATA_DIR = Path("/opt/airflow/data")
TEMP_DIR = Path(f"{DATA_DIR}/tmp")

def extract_aircraft_data(**context):
    api_key = os.getenv("API_NINJAS_KEY")

    if not api_key:
        raise ValueError("API_NINJAS_KEY environment variable is missing!")

    aircraft_manufacturers = ["Boeing", "Airbus", "Embraer", "Piper", "Cessna", "Gulfstream"]

    # response = requests.get(
    #     "https://api-ninjas.com",
    #     headers={"X-Api-Key": api_key},
    #     params={"manufacturer": "Boeing", "limit": "30"},
    #     timeout=10,
    # )

    # data = response.json()

    DATA_FILE = Path(f"{DATA_DIR}/aircraft_models.json")
    data = []

    with open(DATA_FILE, "r", encoding="utf-8") as file:
        data = json.load(file)

    conn = psycopg2.connect(
            host="postgres_target",
            database="skills_warehouse",
            user="analyst",
            password="secretpassword",
        )
    cursor = conn.cursor()

    cursor.execute("SELECT manufacturer_id, name FROM aircraft_manufacturers;")
    # Creates e.g. {'boeing': 1, 'airbus': 2, 'embraer': 3, 'piper': 4}
    manufacturer_map = {name.lower(): m_id for m_id, name in cursor.fetchall()}

    cursor.close()
    conn.close()

    # Create tuple of records to be input into the database
    records = [(manufacturer_map[x["manufacturer"].lower()], x["model"], float(x["max_speed_knots"]), float(x["range_nautical_miles"])) for x in data]

    run_date = context["ds"]  # Airflow automatically provides 'YYYY-MM-DD'

    TEMP_DIR.mkdir(parents=True, exist_ok=True)

    output_path = Path(f"{TEMP_DIR}/transformed_models_{run_date}.json")
    
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(records, f, indent=2)

    return str(output_path)



def transform_aircraft_data(**context):
    # Pull the list returned by extract_task using XCom
    raw_skills = context["ti"].xcom_pull(task_ids="extract_task")
    formatted = [s.upper() for s in raw_skills]
    print("Transformed skills:", formatted)
    return formatted

def load_aircraft_data(**context):
    final_skills = context["ti"].xcom_pull(task_ids="transform_task")
    
    conn = psycopg2.connect(
        host="postgres_target",
        database="skills_warehouse",
        user="analyst",
        password="secretpassword",
    )
    cursor = conn.cursor()

    cursor.execute("""
    """)

    # Batch insert safely without duplicates
    records = [(skill,) for skill in final_skills]
    cursor.executemany(
        "INSERT INTO target_skills (skill) VALUES (%s) ON CONFLICT (skill) DO NOTHING;",
        records,
    )
    conn.commit()

    # Read back to verify
    cursor.execute("SELECT * FROM target_skills;")
    print("Rows currently in PostgreSQL:", cursor.fetchall())

    cursor.close()
    conn.close()

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