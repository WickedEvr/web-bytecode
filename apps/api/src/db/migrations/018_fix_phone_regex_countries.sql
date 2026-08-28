-- Fix: Quitar doble backslash de las regex de telefono

UPDATE countries SET phone_regex = '^\d{9}$' WHERE iso2 = 'PE';
UPDATE countries SET phone_regex = '^\d{9}$' WHERE iso2 = 'CL';
UPDATE countries SET phone_regex = '^\d{10}$' WHERE iso2 = 'CO';
UPDATE countries SET phone_regex = '^\d{10}$' WHERE iso2 = 'MX';
UPDATE countries SET phone_regex = '^\d{10}$' WHERE iso2 = 'US';
UPDATE countries SET phone_regex = '^\d{9}$' WHERE iso2 = 'ES';
