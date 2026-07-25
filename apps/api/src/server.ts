import { app } from './app.js';
import { pool } from './db/pool.js';

const PORT = process.env.PORT || 4000;

app.listen(PORT, async () => {
  console.log(`Bytecode API listening on port ${PORT}`);
  
  try {
    const result = await pool.query('SELECT name, email FROM admin_users LIMIT 1');
    console.log('\n--- 🔥 TEST DE BASE DE DATOS EFÍMERA 🔥 ---');
    console.log('✅ Conexión establecida a la BD:', process.env.DATABASE_URL?.split('@')[1] || 'URL no encontrada');
    if (result.rows.length > 0) {
      console.log('✅ Datos de producción restaurados exitosamente.');
      console.log('Muestra aleatoria de admin (Admin 1):', result.rows[0].name);
    } else {
      console.log('⚠️ Conectado, pero la tabla admin_users está vacía.');
    }
    console.log('-------------------------------------------\n');
  } catch (err: any) {
    console.error('❌ ERROR de conexión a BD en el arranque:', err.message);
  }
});
