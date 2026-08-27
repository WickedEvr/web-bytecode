ALTER TABLE organizations ADD COLUMN country_id UUID REFERENCES countries(id) ON DELETE SET NULL;
