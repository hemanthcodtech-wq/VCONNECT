require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function fix() {
  try {
    await pool.query(`ALTER TABLE coupons ADD COLUMN usage_type VARCHAR(20) DEFAULT 'multiple'`);
  } catch(e){}
  try {
    await pool.query(`ALTER TABLE coupons ADD COLUMN min_type VARCHAR(20) DEFAULT 'amount'`);
  } catch(e){}
  try {
    await pool.query(`ALTER TABLE coupons ADD COLUMN min_qty INTEGER DEFAULT 0`);
  } catch(e){}
  try {
    await pool.query(`ALTER TABLE coupons ADD COLUMN applicable_categories JSONB DEFAULT '[]'`);
  } catch(e){}
  try {
    await pool.query(`ALTER TABLE coupons ADD COLUMN applicable_product_codes JSONB DEFAULT '[]'`);
  } catch(e){}
  console.log("Fixed");
  process.exit(0);
}
fix();
