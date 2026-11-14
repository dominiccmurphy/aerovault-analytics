import psycopg2
from psycopg2.extras import execute_values
import os

def get_connection():
    db_name = os.getenv("POSTGRES_DB")
    db_user = os.getenv("POSTGRES_USER")
    db_password = os.getenv("POSTGRES_PASSWORD")

    if not all([db_name, db_user, db_password]):
        raise ValueError("Missing required POSTGRES_* environment variables.")
    
    conn = psycopg2.connect(
        host="postgres_target",
        database=db_name,
        user=db_user,
        password=db_password,
    )

    return conn