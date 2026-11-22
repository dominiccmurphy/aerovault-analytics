from datetime import datetime, timedelta
import psycopg2
from psycopg2.extras import execute_values
import requests
import os
from pathlib import Path
import json
import logging
import shutil
from collections import defaultdict
from dataclasses import dataclass
from typing import Optional


from airflow import DAG
from airflow.operators.python import PythonOperator

from include.db import get_connection
from include.transforms import convert_float

DATA_DIR = Path("/opt/airflow/data/")
TEMP_DIR = Path(f"{DATA_DIR}/tmp/opensky")

DEFAULT_ARGS = {
    "owner": "aerovault",
    "retries": 2,
    "retry_delay": timedelta(minutes=2),
}

@dataclass
class FlightState:
    icao24: str
    callsign: Optional[str]
    origin_country: str
    on_ground: bool
    velocity: Optional[float]

    @classmethod
    def from_raw(cls, row: list) -> "FlightState":
        return cls(
            icao24=row[0],
            callsign=row[1].strip().upper() if row[1] else None,
            origin_country=row[2],
            on_ground=bool(row[8]),
            velocity=float(row[9]) if row[9] is not None else None,
        )

def extract_opensky_data(**context):
    api_key = os.getenv("API_OPENSKY_KEY")

    if not api_key:
        raise ValueError("API_OPENSKY_KEY environment variable is missing!")
    
    # response = requests.get(
    #     "https://api.api-ninjas.com/v1/aircraft",
    #     headers={"X-Api-Key": api_key},
    #     params={"manufacturer": "Boeing", "limit": "30"},
    #     timeout=10,
    # )

    # data = response.json()

    DATA_FILE = Path(f"{DATA_DIR}/opensky_data.json")
    data = []

    with open(DATA_FILE, "r", encoding="utf-8") as file:
        data = json.load(file)

    run_id = context["ts_nodash"]

    output_dir = Path(f"{TEMP_DIR}/{run_id}")
    output_dir.mkdir(parents=True, exist_ok=True)

    output_file = Path(f"{output_dir}/opensky_records.json")
    
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)

    return str(output_dir)


def transform_airspace_data(**context):
    output_dir = context["ti"].xcom_pull(task_ids="extract_task")

    data = []
    file_path = Path(f"{output_dir}/opensky_records.json")
    with open(file_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    records_unfiltered = [FlightState.from_raw(x) for x in data.get("states") or []]

    records = [
        x for x in records_unfiltered 
        if x.on_ground == False and x.velocity is not None and x.origin_country
    ]

    logging.info("Records skipped due to either being on ground or invalid velocity or country: %s",
                 len(records_unfiltered) - len(records)
                )

    country_velocities = defaultdict(list)

    for f in records:
        country_velocities[f.origin_country].append(f.velocity)

    country_snapshots = [
        {
            "origin_country": country,
            "active_aircraft_count": len(velocities),
            "avg_velocity_ms": round(sum(velocities) / len(velocities), 4),
        }
        for country, velocities in country_velocities.items()
    ]

    output_file = Path(f"{output_dir}/opensky_records_transformed_airspace.json")
        
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(country_snapshots, f, indent=2)

    return str(output_dir)


def transform_airline_data(**context):
    output_dir = context["ti"].xcom_pull(task_ids="extract_task")

    data = []
    file_path = Path(f"{output_dir}/opensky_records.json")
    with open(file_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    records_unfiltered = [FlightState.from_raw(x) for x in data.get("states") or []]

    records = [
        x for x in records_unfiltered 
        if x.on_ground == False and x.velocity is not None and x.origin_country
    ]

    logging.info("Records skipped due to either being on ground or invalid velocity or country: %s",
                 len(records_unfiltered) - len(records)
                )

    airline_velocities = defaultdict(list)

    for f in records:
        if (
            f.callsign
            and len(f.callsign) >= 4
            and f.callsign[:3].isalpha()
            and f.callsign[3:].isdigit()
        ):
            airline_code = f.callsign[:3]
            airline_velocities[airline_code].append(f.velocity)

    airline_snapshots = [
        {
            "icao_code": icao,
            "active_aircraft_count": len(velocities),
            "avg_velocity_ms": round(sum(velocities) / len(velocities), 4),
        }
        for icao, velocities in airline_velocities.items()
    ]

    output_file = Path(f"{output_dir}/opensky_records_transformed_airline.json")
        
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(airline_snapshots, f, indent=2)

    return str(output_dir)
    

def load_airspace_data(**context):
    output_dir = context["ti"].xcom_pull(task_ids="transform_airspace_task")
    run_date = context["ds"]

    data = []
    file_path = Path(f"{output_dir}/opensky_records_transformed_airspace.json")
    with open(file_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    conn = None
    try:
        with get_connection() as conn:
            with conn.cursor() as cursor:
                # Batch insert safely without duplicates
                records = [(run_date, x["origin_country"], x["active_aircraft_count"], x["avg_velocity_ms"]) for x in data]

                execute_values(cursor, 
                    """
                    INSERT INTO live_airspace_snapshots
                        (snapshot_date, origin_country, active_aircraft_count, avg_velocity_ms) 
                        VALUES %s
                        ON CONFLICT(snapshot_date, origin_country) DO UPDATE
                        SET active_aircraft_count=EXCLUDED.active_aircraft_count,
                        avg_velocity_ms=EXCLUDED.avg_velocity_ms
                    """,
                    records
                )
                conn.commit()

                # Read back to verify
                cursor.execute("SELECT count(snapshot_date) FROM live_airspace_snapshots;")
                logging.info("Rows currently in live_airspace_snapshots: %s", cursor.fetchone()[0])

    finally:
        if conn:
            conn.close()

    return str(output_dir)


def load_airline_data(**context):
    output_dir = context["ti"].xcom_pull(task_ids="transform_airline_task")
    run_date = context["ds"]

    data = []
    file_path = Path(f"{output_dir}/opensky_records_transformed_airline.json")
    with open(file_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    conn = None
    try:
        with get_connection() as conn:
            with conn.cursor() as cursor:
                # Batch insert safely without duplicates
                records = [(run_date, x["icao_code"], x["active_aircraft_count"], x["avg_velocity_ms"]) for x in data]

                execute_values(cursor, 
                    """
                    INSERT INTO live_airline_snapshots
                        (snapshot_date, icao_code, active_aircraft_count, avg_velocity_ms) 
                        VALUES %s
                        ON CONFLICT(snapshot_date, icao_code) DO UPDATE
                        SET active_aircraft_count=EXCLUDED.active_aircraft_count,
                        avg_velocity_ms=EXCLUDED.avg_velocity_ms
                    """,
                    records
                )
                conn.commit()

                # Read back to verify
                cursor.execute("SELECT count(snapshot_date) FROM live_airline_snapshots;")
                logging.info("Rows currently in live_airline_snapshots: %s", cursor.fetchone()[0])

    finally:
        if conn:
            conn.close()

    return str(output_dir)

def cleanup(**context):
    output_dir = context["ti"].xcom_pull(task_ids="extract_task")
    
    shutil.rmtree(output_dir, ignore_errors=True)
    logging.info("Cleaned up run folder: %s", output_dir)

with DAG(
    dag_id="airspace_data_etl_pipeline",
    default_args=DEFAULT_ARGS,
    start_date=datetime(2025, 1, 1),
    schedule="@daily",
    catchup=False,
) as dag:

    t1 = PythonOperator(task_id="extract_task", python_callable=extract_opensky_data)
    transform_airspace = PythonOperator(task_id="transform_airspace_task", python_callable=transform_airspace_data)
    transform_airline = PythonOperator(task_id="transform_airline_task", python_callable=transform_airline_data)
    load_airspace = PythonOperator(task_id="load_airspace_task", python_callable=load_airspace_data)
    load_airline = PythonOperator(task_id="load_airline_task", python_callable=load_airline_data)
    cleanup_task = PythonOperator(task_id="cleanup_task", python_callable=cleanup)
    
    # Define the pipeline order
    t1 >> [transform_airspace, transform_airline]
    transform_airspace >> load_airspace
    transform_airline >> load_airline
    [load_airspace, load_airline] >> cleanup_task