-- 1. Actualizar el country_id de los customers basándose en el prefijo de su número de teléfono (primary_phone)
-- Se hace coincidir el prefijo más largo posible con el dial_code de la tabla countries
UPDATE customers c
SET 
    country_id = (
        SELECT id
        FROM countries cou
        WHERE c.primary_phone LIKE cou.dial_code || '%'
        ORDER BY LENGTH(cou.dial_code) DESC
        LIMIT 1
    ),
    updated_at = NOW()
WHERE 
    c.country_id IS NULL 
    AND c.primary_phone IS NOT NULL
    AND c.primary_phone != '';
