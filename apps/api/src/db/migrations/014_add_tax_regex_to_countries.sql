ALTER TABLE countries ADD COLUMN tax_id_regex VARCHAR(255);
ALTER TABLE countries ADD COLUMN tax_id_format VARCHAR(100);

-- Actualizar los países actuales con sus Regex oficiales
UPDATE countries SET tax_id_regex = '^\d{11}$', tax_id_format = '11 dígitos (Ej. 20123456789)' WHERE iso2 = 'PE';
UPDATE countries SET tax_id_regex = '^\d{7,8}-[\dKk]$', tax_id_format = 'Ej. 76543210-K' WHERE iso2 = 'CL';
UPDATE countries SET tax_id_regex = '^\d{9}-\d$', tax_id_format = 'Ej. 900123456-1' WHERE iso2 = 'CO';
UPDATE countries SET tax_id_regex = '^([A-ZÑ&]{3,4})\d{6}([A-V1-9][A-Z1-9]\d{0,1})?$', tax_id_format = 'Ej. ABC680524P76' WHERE iso2 = 'MX';
UPDATE countries SET tax_id_regex = '^\d{2}\-\d{7}$', tax_id_format = 'EIN (Ej. 12-3456789)' WHERE iso2 = 'US';
UPDATE countries SET tax_id_regex = '^[A-Z]\d{7}[A-Z0-9]$', tax_id_format = 'Ej. B12345678' WHERE iso2 = 'ES';
