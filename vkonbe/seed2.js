const pool = require('./db');

const moreProducts = [
  {
    name: 'Green Cardamom (Elaichi)',
    category: 'Spices',
    description: 'Premium quality green cardamom pods with intense aroma.',
    image_url: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&q=80', // Using generic spice macro
    variants: [
      { name: 'Default', sizes: [{ size: '50g', mrp: 150, our_price: 120, shopkeeper_price: 100, stock: 200, code: 'CRD-50' }, { size: '100g', mrp: 280, our_price: 240, shopkeeper_price: 195, stock: 150, code: 'CRD-100' }] }
    ]
  },
  {
    name: 'Black Pepper (Kaali Mirch)',
    category: 'Spices',
    description: 'Fresh, bold whole black peppercorns.',
    image_url: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&q=80',
    variants: [
      { name: 'Default', sizes: [{ size: '100g', mrp: 120, our_price: 95, shopkeeper_price: 80, stock: 300, code: 'BLK-100' }] }
    ]
  },
  {
    name: 'Cumin Seeds (Jeera)',
    category: 'Spices',
    description: 'Aromatic, unadulterated cumin seeds for everyday tempering.',
    image_url: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&q=80',
    variants: [
      { name: 'Default', sizes: [{ size: '200g', mrp: 90, our_price: 75, shopkeeper_price: 65, stock: 250, code: 'CUM-200' }] }
    ]
  },
  {
    name: 'Chana Dal',
    category: 'Pulses',
    description: 'High-quality, unpolished split Bengal gram.',
    image_url: 'https://images.unsplash.com/photo-1615486171448-4fbaf0c13149?w=400&q=80',
    variants: [
      { name: 'Default', sizes: [{ size: '1 Kg', mrp: 130, our_price: 110, shopkeeper_price: 95, stock: 400, code: 'CHN-01' }] }
    ]
  },
  {
    name: 'Urad Dal (White)',
    category: 'Pulses',
    description: 'Premium sortex-cleaned split white urad dal.',
    image_url: 'https://images.unsplash.com/photo-1615486171448-4fbaf0c13149?w=400&q=80',
    variants: [
      { name: 'Default', sizes: [{ size: '1 Kg', mrp: 160, our_price: 135, shopkeeper_price: 115, stock: 200, code: 'URD-01' }] }
    ]
  },
  {
    name: 'Groundnut Oil',
    category: 'Oils',
    description: '100% pure filtered groundnut oil for healthy cooking.',
    image_url: 'https://images.unsplash.com/photo-1474128522363-2284c4ceb755?w=400&q=80',
    variants: [
      { name: 'Default', sizes: [{ size: '1 Ltr', mrp: 220, our_price: 195, shopkeeper_price: 175, stock: 150, code: 'GNO-01' }, { size: '5 Ltr', mrp: 1050, our_price: 950, shopkeeper_price: 850, stock: 50, code: 'GNO-05' }] }
    ]
  },
  {
    name: 'Sona Masoori Rice',
    category: 'Grains',
    description: 'Aged, lightweight and aromatic premium Sona Masoori.',
    image_url: 'https://images.unsplash.com/photo-1586201375761-83865001e8ac?w=400&q=80',
    variants: [
      { name: 'Default', sizes: [{ size: '10 Kg', mrp: 650, our_price: 580, shopkeeper_price: 520, stock: 100, code: 'SMR-10' }] }
    ]
  }
];

async function seedMore() {
  try {
    for (const prod of moreProducts) {
      const res = await pool.query('SELECT id FROM products WHERE name = $1', [prod.name]);
      if (res.rows.length === 0) {
        await pool.query(
          'INSERT INTO products (name, category, description, image_url, images, variants, is_active) VALUES ($1, $2, $3, $4, $5, $6, true)',
          [prod.name, prod.category, prod.description, prod.image_url, JSON.stringify([prod.image_url]), JSON.stringify(prod.variants)]
        );
        console.log(`Inserted product: ${prod.name}`);
      } else {
        console.log(`Product already exists: ${prod.name}`);
      }
    }
    console.log('Additional seeding completed.');
  } catch (err) {
    console.error('Seeding error:', err);
  } finally {
    process.exit();
  }
}

seedMore();
