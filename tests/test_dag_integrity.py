import sys
import pytest

from include.transforms import convert_float
from airflow.models import DagBag

def test_convert_float():
    assert convert_float("450.5") == 450.5
    assert convert_float("test") is None
    assert convert_float(None) is None

def test_dag_loads_cleanly():
    dagbag = DagBag(dag_folder="/opt/airflow/dags", include_examples=False)
    assert len(dagbag.import_errors) == 0
    assert "aircraft_data_etl_pipeline" in dagbag.dags
    assert len(dagbag.dags["aircraft_data_etl_pipeline"].tasks) == 3
