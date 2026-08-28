ALTER TABLE countries ADD COLUMN phone_regex VARCHAR(255);
ALTER TABLE countries ADD COLUMN phone_format VARCHAR(100);

-- Actualizar los países actuales con sus Regex para teléfono
UPDATE countries SET phone_regex = '^\\d{9}$', phone_format = 'Ej. 987654321' WHERE iso2 = 'PE';
UPDATE countries SET phone_regex = '^\\d{9}$', phone_format = 'Ej. 987654321' WHERE iso2 = 'CL';
UPDATE countries SET phone_regex = '^\\d{10}$', phone_format = 'Ej. 3001234567' WHERE iso2 = 'CO';
UPDATE countries SET phone_regex = '^\\d{10}$', phone_format = 'Ej. 5512345678' WHERE iso2 = 'MX';
UPDATE countries SET phone_regex = '^\\d{10}$', phone_format = 'Ej. 2025550123' WHERE iso2 = 'US';
UPDATE countries SET phone_regex = '^\\d{9}$', phone_format = 'Ej. 612345678' WHERE iso2 = 'ES';
