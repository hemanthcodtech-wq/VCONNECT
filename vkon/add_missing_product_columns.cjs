const pool = require('/Users/hemanthkancharla/manikantabe/db.js');

async function migrate() {
  try {
    await pool.query(`
      ALTER TABLE products
      ADD COLUMN IF NOT EXISTS is_festive BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS variants JSONB DEFAULT '[]',
      ADD COLUMN IF NOT EXISTS reviews JSONB DEFAULT '[]',
      ADD COLUMN IF NOT EXISTS details JSONB DEFAULT '[]',
      ADD COLUMN IF NOT EXISTS allow_reviews BOOLEAN DEFAULT TRUE,
      ADD COLUMN IF NOT EXISTS instagram_reel_url TEXT;
    `);
    console.log("✅ Missing columns added to products table successfully.");
  } catch (error) {
    console.error("❌ Migration failed", error);
  } finally {
    process.exit(0);
  }
}

migrate();
