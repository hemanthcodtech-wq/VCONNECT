const pool = require('./db');

async function clearData() {
  try {
    await pool.query('TRUNCATE orders, stores CASCADE;');
    console.log('✅ Successfully cleared orders and stores.');
  } catch (err) {
    console.error('❌ Error clearing data:', err);
  } finally {
    pool.end();
  }
}

clearData();
