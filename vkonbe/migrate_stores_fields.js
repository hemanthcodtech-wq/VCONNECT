const pool = require('./db');

async function run() {
  try {
    await pool.query('ALTER TABLE stores ADD COLUMN IF NOT EXISTS owner_name VARCHAR(150)');
    await pool.query('ALTER TABLE stores ADD COLUMN IF NOT EXISTS email VARCHAR(150)');
    await pool.query('ALTER TABLE stores ADD COLUMN IF NOT EXISTS phone VARCHAR(20)');
    console.log('Stores table updated successfully');
  } catch (err) {
    console.error('Migration error:', err);
  } finally {
    process.exit();
  }
}
run();
