const pool = require('./db');

const categories = [
  { name: 'Grains', image_url: 'https://images.unsplash.com/photo-1586201375761-83865001e8ac?w=400&q=80' },
  { name: 'Spices', image_url: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&q=80' },
  { name: 'Pulses', image_url: 'https://images.unsplash.com/photo-1615486171448-4fbaf0c13149?w=400&q=80' },
  { name: 'Oils', image_url: 'https://images.unsplash.com/photo-1474128522363-2284c4ceb755?w=400&q=80' },
];

const products = [
  {
    name: 'Premium Basmati Rice',
    category: 'Grains',
    description: 'Long grain, aromatic basmati rice perfect for biryani and daily use.',
    image_url: 'https://images.unsplash.com/photo-1586201375761-83865001e8ac?w=400&q=80',
    variants: [
      { name: 'Default', sizes: [{ size: '1 Kg', mrp: 150, our_price: 130, shopkeeper_price: 110, stock: 100, code: 'RICE-01' }, { size: '5 Kg', mrp: 700, our_price: 600, shopkeeper_price: 520, stock: 50, code: 'RICE-05' }] }
    ]
  },
  {
    name: 'Whole Wheat Atta',
    category: 'Grains',
    description: '100% whole wheat chakki fresh atta for soft rotis.',
    image_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80',
    variants: [
      { name: 'Default', sizes: [{ size: '5 Kg', mrp: 250, our_price: 220, shopkeeper_price: 190, stock: 200, code: 'ATTA-05' }, { size: '10 Kg', mrp: 480, our_price: 420, shopkeeper_price: 360, stock: 100, code: 'ATTA-10' }] }
    ]
  },
  {
    name: 'Turmeric Powder',
    category: 'Spices',
    description: 'Pure, authentic haldi powder rich in curcumin.',
    image_url: 'https://images.unsplash.com/photo-1615485925600-97237c4fc1ec?w=400&q=80',
    variants: [
      { name: 'Default', sizes: [{ size: '200g', mrp: 60, our_price: 50, shopkeeper_price: 42, stock: 300, code: 'HLD-200' }, { size: '500g', mrp: 140, our_price: 120, shopkeeper_price: 100, stock: 150, code: 'HLD-500' }] }
    ]
  },
  {
    name: 'Red Chilli Powder',
    category: 'Spices',
    description: 'Spicy, bright red chilli powder for authentic Indian curries.',
    image_url: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&q=80',
    variants: [
      { name: 'Default', sizes: [{ size: '250g', mrp: 80, our_price: 70, shopkeeper_price: 58, stock: 250, code: 'RCL-250' }] }
    ]
  },
  {
    name: 'Toor Dal',
    category: 'Pulses',
    description: 'Unpolished, protein-rich arhar dal.',
    image_url: 'https://images.unsplash.com/photo-1615486171448-4fbaf0c13149?w=400&q=80',
    variants: [
      { name: 'Default', sizes: [{ size: '1 Kg', mrp: 180, our_price: 160, shopkeeper_price: 140, stock: 120, code: 'TDAL-01' }] }
    ]
  },
  {
    name: 'Mustard Oil',
    category: 'Oils',
    description: 'Cold-pressed kachi ghani mustard oil.',
    image_url: 'https://images.unsplash.com/photo-1474128522363-2284c4ceb755?w=400&q=80',
    variants: [
      { name: 'Default', sizes: [{ size: '1 Ltr', mrp: 200, our_price: 180, shopkeeper_price: 160, stock: 80, code: 'MOIL-01' }] }
    ]
  }
];

async function seed() {
  try {
    console.log('Running schema migrations...');
    await pool.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS is_festive BOOLEAN DEFAULT FALSE`);
    await pool.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS variants JSONB DEFAULT '[]'`);
    await pool.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS reviews JSONB DEFAULT '[]'`);
    await pool.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS details JSONB DEFAULT '[]'`);
    await pool.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS allow_reviews BOOLEAN DEFAULT TRUE`);
    await pool.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS instagram_reel_url TEXT`);
    console.log('Migrations done.');

    for (const cat of categories) {
      const res = await pool.query('SELECT id FROM categories WHERE name = $1', [cat.name]);
      if (res.rows.length === 0) {
        await pool.query('INSERT INTO categories (name, image_url) VALUES ($1, $2)', [cat.name, cat.image_url]);
        console.log(`Inserted category: ${cat.name}`);
      }
    }

    for (const prod of products) {
      const res = await pool.query('SELECT id FROM products WHERE name = $1', [prod.name]);
      if (res.rows.length === 0) {
        await pool.query(
          'INSERT INTO products (name, category, description, image_url, images, variants, is_active) VALUES ($1, $2, $3, $4, $5, $6, true)',
          [prod.name, prod.category, prod.description, prod.image_url, JSON.stringify([prod.image_url]), JSON.stringify(prod.variants)]
        );
        console.log(`Inserted product: ${prod.name}`);
      }
    }

    console.log('Seeding completed.');
  } catch (err) {
    console.error('Seeding error:', err);
  } finally {
    process.exit();
  }
}

seed();
