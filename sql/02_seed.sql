INSERT INTO aircraft_manufacturers (name, headquarters) VALUES
    ('Boeing', 'United States'),
    ('Airbus', 'Netherlands'),
    ('Embraer', 'Brazil'),
    ('Piper', 'United States'),
    ('Cessna', 'United States')
ON CONFLICT (name) DO NOTHING;