import { app } from './app.js';
import { pool } from './db/pool.js';

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Bytecode API listening on port ${PORT}`);
});
