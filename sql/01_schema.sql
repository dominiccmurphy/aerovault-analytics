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

CREATE TABLE IF NOT EXISTS airlines (
    icao_code VARCHAR(10) PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS live_airspace_snapshots (
    snapshot_date date NOT NULL,
    origin_country VARCHAR(100) NOT NULL,
    active_aircraft_count INTEGER NOT NULL,
    avg_velocity_ms DECIMAL(10, 2) NOT NULL,
    PRIMARY KEY(snapshot_date, origin_country)
);

CREATE TABLE IF NOT EXISTS live_airline_snapshots (
    snapshot_date date NOT NULL,
    icao_code VARCHAR(10) NOT NULL,
    active_aircraft_count INTEGER NOT NULL,
    avg_velocity_ms DECIMAL(10, 2) NOT NULL,
    PRIMARY KEY(snapshot_date, icao_code)
);


CREATE OR REPLACE VIEW vw_aircraft_analytics AS
SELECT
    md.model_id             AS model_id
    ,mf.name                AS manufacturer
    ,mf.headquarters        AS headquarters
    ,md.model_name          AS model_name
    ,md.aircraft_class      AS aircraft_class
    ,md.max_speed_knots     AS max_speed_knots
    ,md.max_range_nm        AS max_range_nm
    ,cs.passenger_capacity  AS passenger_capacity
    ,cs.price_millions_usd  AS price_millions_usd
    ,ROUND(price_millions_usd / NULLIF(passenger_capacity, 0), 4)   AS cost_per_seat_millions_usd
FROM
    aircraft_manufacturers mf
    INNER JOIN aircraft_models md on mf.manufacturer_id=md.manufacturer_id
    LEFT JOIN aircraft_commercial_specs cs on md.manufacturer_id=cs.manufacturer_id and lower(md.model_name)=lower(cs.model_name);



CREATE OR REPLACE VIEW vw_airline_snapshots AS
SELECT
    als.snapshot_date               AS snapshot_date
    ,als.icao_code                  AS icao_code
    ,coalesce(al.name, als.icao_code)   AS airline_name
    ,als.active_aircraft_count      AS active_aircraft_count
    ,als.avg_velocity_ms            AS avg_velocity_ms
FROM
    live_airline_snapshots als 
    LEFT JOIN airlines al on lower(als.icao_code)=lower(al.icao_code);


CREATE OR REPLACE VIEW vw_country_snapshots AS
SELECT
    als.snapshot_date               AS snapshot_date
    ,als.origin_country                  AS origin_country
    ,als.active_aircraft_count      AS active_aircraft_count
    ,als.avg_velocity_ms            AS avg_velocity_ms
FROM
    live_airspace_snapshots als;