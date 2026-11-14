CREATE TABLE IF NOT EXISTS aircraft_manufacturers (
    manufacturer_id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    headquarters VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS aircraft_models (
    model_id SERIAL PRIMARY KEY,
    manufacturer_id INTEGER REFERENCES aircraft_manufacturers(manufacturer_id) NOT NULL,
    model_name VARCHAR(100) NOT NULL,
    aircraft_class VARCHAR(100) NOT NULL,
    max_speed_knots DECIMAL(10, 2) NULL,
    max_range_nm DECIMAL(10, 2) NULL,
    UNIQUE (manufacturer_id, model_name)
);

CREATE TABLE IF NOT EXISTS aircraft_commercial_specs (
    commercial_id SERIAL PRIMARY KEY,
    manufacturer_id INTEGER REFERENCES aircraft_manufacturers(manufacturer_id) NOT NULL,
    model_name VARCHAR(100) NOT NULL,
    passenger_capacity SMALLINT NULL,
    price_millions_usd DECIMAL(10, 2) NULL,
    UNIQUE(manufacturer_id, model_name)
);

CREATE TABLE IF NOT EXISTS live_airspace_snapshots (
    snapshot_date date NOT NULL,
    origin_country VARCHAR(100) NOT NULL,
    active_aircraft_count INTEGER NOT NULL,
    avg_velocity_ms DECIMAL(10, 2) NOT NULL,
    PRIMARY KEY(snapshot_date, origin_country)
);