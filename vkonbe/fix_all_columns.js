require('dotenv').config();
const pool = require('./db');

async function fix() {
  try {
    const queries = [
      `ALTER TABLE reviews ADD COLUMN IF NOT EXISTS image_url TEXT;`,
      
      `ALTER TABLE orders 
        ADD COLUMN IF NOT EXISTS razorpay_payment_id VARCHAR(255),
        ADD COLUMN IF NOT EXISTS razorpay_signature VARCHAR(255),
        ADD COLUMN IF NOT EXISTS edit_history JSONB DEFAULT '[]'::jsonb,
        ADD COLUMN IF NOT EXISTS balance_due NUMERIC(10,2) DEFAULT 0,
        ADD COLUMN IF NOT EXISTS payment_link_url TEXT,
        ADD COLUMN IF NOT EXISTS cancelled_items_snapshot JSONB,
        ADD COLUMN IF NOT EXISTS refund_history JSONB DEFAULT '[]'::jsonb,
        ADD COLUMN IF NOT EXISTS cancel_type VARCHAR(50) DEFAULT 'refund',
        ADD COLUMN IF NOT EXISTS order_type VARCHAR(20) DEFAULT 'shipping',
        ADD COLUMN IF NOT EXISTS tracking_id VARCHAR(255),
        ADD COLUMN IF NOT EXISTS tracking_link VARCHAR(255),
        ADD COLUMN IF NOT EXISTS discount_amount NUMERIC(10,2) DEFAULT 0,
        ADD COLUMN IF NOT EXISTS coupon_code VARCHAR(100),
        ADD COLUMN IF NOT EXISTS stripe_last4 VARCHAR(4),
        ADD COLUMN IF NOT EXISTS payment_method VARCHAR(20) DEFAULT 'prepaid',
        ADD COLUMN IF NOT EXISTS advance_paid NUMERIC(10,2) DEFAULT 0,
        ADD COLUMN IF NOT EXISTS stripe_payment_intent_id VARCHAR(255),
        ADD COLUMN IF NOT EXISTS refund_id VARCHAR(255),
        ADD COLUMN IF NOT EXISTS refund_amount NUMERIC(10,2),
        ADD COLUMN IF NOT EXISTS refund_breakdown JSONB,
        ADD COLUMN IF NOT EXISTS shipping_fee NUMERIC(10,2) DEFAULT 0,
        ADD COLUMN IF NOT EXISTS tax_amount NUMERIC(10,2) DEFAULT 0,
        ADD COLUMN IF NOT EXISTS tracking_number VARCHAR(255),
        ADD COLUMN IF NOT EXISTS tracking_url TEXT,
        ADD COLUMN IF NOT EXISTS shipping_label_url TEXT;`,
        
      `ALTER TABLE products
        ADD COLUMN IF NOT EXISTS is_festive BOOLEAN DEFAULT FALSE,
        ADD COLUMN IF NOT EXISTS product_code VARCHAR(100),
        ADD COLUMN IF NOT EXISTS variants JSONB DEFAULT '[]',
        ADD COLUMN IF NOT EXISTS reviews JSONB DEFAULT '[]',
        ADD COLUMN IF NOT EXISTS instagram_reel_url TEXT,
        ADD COLUMN IF NOT EXISTS is_bestseller BOOLEAN DEFAULT FALSE,
        ADD COLUMN IF NOT EXISTS is_trending BOOLEAN DEFAULT FALSE,
        ADD COLUMN IF NOT EXISTS is_offer BOOLEAN DEFAULT FALSE,
        ADD COLUMN IF NOT EXISTS details JSONB DEFAULT '[]';`,
        
      `ALTER TABLE coupons
        ADD COLUMN IF NOT EXISTS usage_type VARCHAR(20) DEFAULT 'multiple',
        ADD COLUMN IF NOT EXISTS min_type VARCHAR(20) DEFAULT 'amount',
        ADD COLUMN IF NOT EXISTS min_qty INTEGER DEFAULT 0,
        ADD COLUMN IF NOT EXISTS used_by INTEGER[] DEFAULT '{}';`,
        
      `ALTER TABLE otps
        ADD COLUMN IF NOT EXISTS type VARCHAR(10) DEFAULT 'email';`
    ];

    for (let q of queries) {
      await pool.query(q);
    }
    
    console.log('✅ Added all missing columns from migrations');
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed:', err);
    process.exit(1);
  }
}

fix();
