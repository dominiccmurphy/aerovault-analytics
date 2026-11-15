INSERT INTO aircraft_manufacturers (name, headquarters) VALUES
    ('Boeing', 'United States'),
    ('Airbus', 'Netherlands'),
    ('Embraer', 'Brazil'),
    ('Piper', 'United States'),
    ('Cessna', 'United States')
ON CONFLICT (name) DO NOTHING;

INSERT INTO aircraft_commercial_specs (manufacturer_id, model_name, passenger_capacity, price_millions_usd)
SELECT
    m.manufacturer_id
    ,v.model_name
    ,v.passenger_capacity
    ,v.price_millions_usd
FROM
    aircraft_manufacturers m
    INNER JOIN
    (
        VALUES 
        ('737 Max 7', 153, 99.70),
        ('737-700', 126, 89.10),
        ('737-800', 162, 106.10),
        ('737-900ER', 178, 112.40),
        ('747-400', 416, 268.00),
        ('747-400F', NULL, 268.00),
        ('747-8I', 410, 418.40),
        ('757-200', 200, 65.00),
        ('757-300', 243, 80.00),
        ('767-300ER', 218, 217.90),
        ('767-400ER', 245, 248.00),
        ('777-200ER', 301, 306.60),
        ('777-200LR', 317, 346.90),
        ('777-300ER', 396, 375.50),
        ('777F', NULL, 352.30),
        ('787-8 Dreamliner', 242, 248.30),
        ('787-9 Dreamliner', 290, 292.50),
        ('787-10 Dreamliner', 330, 338.40),
        ('737 MAX 8', 178, 121.60),
        ('737 MAX 9', 193, 128.90),
        ('737-300', 128, 35.00),
        ('737-400', 146, 40.00),
        ('737-500', 110, 30.00),
        ('717-200', 106, 36.00),
        ('767-200ER', 181, 160.20)
    ) AS V(model_name, passenger_capacity, price_millions_usd) ON m.name='Boeing'
ON CONFLICT (manufacturer_id, model_name) DO UPDATE
SET passenger_capacity=EXCLUDED.passenger_capacity,
    price_millions_usd=EXCLUDED.price_millions_usd;


INSERT INTO airlines (icao_code, name) VALUES
    ('AAL', 'American Airlines'),
    ('ACA', 'Air Canada'),
    ('AFR', 'Air France'),
    ('AMX', 'Aeroméxico'),
    ('ANA', 'All Nippon Airways'),
    ('ANZ', 'Air New Zealand'),
    ('ASA', 'Alaska Airlines'),
    ('BAW', 'British Airways'),
    ('CPA', 'Cathay Pacific'),
    ('DAL', 'Delta Air Lines'),
    ('DLH', 'Lufthansa'),
    ('EIN', 'Aer Lingus'),
    ('ETD', 'Etihad Airways'),
    ('ETH', 'Ethiopian Airlines'),
    ('EZY', 'EasyJet'),
    ('IBE', 'Iberia'),
    ('JAL', 'Japan Airlines'),
    ('JBU', 'JetBlue'),
    ('KAL', 'Korean Air'),
    ('KLM', 'KLM'),
    ('LAN', 'LATAM Airlines'),
    ('QFA', 'Qantas'),
    ('QTR', 'Qatar Airways'),
    ('RYR', 'Ryanair'),
    ('SAA', 'South African Airways'),
    ('SIA', 'Singapore Airlines'),
    ('SVA', 'Saudia'),
    ('SWA', 'Southwest Airlines'),
    ('THY', 'Turkish Airlines'),
    ('UAE', 'Emirates'),
    ('UAL', 'United Airlines'),
    ('VIR', 'Virgin Atlantic')
ON CONFLICT (icao_code) DO NOTHING;
