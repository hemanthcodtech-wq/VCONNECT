const pool = require('./db');

async function seed() {
  try {
    console.log('Clearing existing categories and products...');
    await pool.query('TRUNCATE TABLE products RESTART IDENTITY CASCADE');
    await pool.query('TRUNCATE TABLE categories RESTART IDENTITY CASCADE');

    const categories = [
      { name: 'Pulses & Dals', image_url: 'https://images.unsplash.com/photo-1585996765851-a0e88cae85c5?w=500&auto=format&fit=crop' },
      { name: 'Rice & Grains', image_url: 'https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?w=500&auto=format&fit=crop' },
      { name: 'Premium Oils', image_url: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&auto=format&fit=crop' },
      { name: 'Spices & Masalas', image_url: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=500&auto=format&fit=crop' },
      { name: 'Sugar & Jaggery', image_url: 'https://images.unsplash.com/photo-1620025732291-76495be3c3f2?w=500&auto=format&fit=crop' }
    ];

    console.log('Seeding categories...');
    for (const cat of categories) {
      await pool.query(
        'INSERT INTO categories (name, models, image_url) VALUES ($1, $2, $3)',
        [cat.name, '[]', cat.image_url]
      );
    }

    console.log('Seeding products...');
    const productsData = [
      // Pulses & Dals
      {
        name: 'Premium Toor Dal',
        description: 'High-quality unpolished Toor Dal rich in protein and fiber.',
        category: 'Pulses & Dals',
        color: 'Yellow',
        sizes: [{ size: '1kg', price: 160 }, { size: '5kg', price: 780 }],
        image_url: 'https://images.unsplash.com/photo-1585996765851-a0e88cae85c5?w=500&auto=format&fit=crop'
      },
      {
        name: 'Organic Moong Dal',
        description: 'Whole green moong dal, perfect for healthy sprouting.',
        category: 'Pulses & Dals',
        color: 'Green',
        sizes: [{ size: '500g', price: 80 }, { size: '1kg', price: 155 }],
        image_url: 'https://images.unsplash.com/photo-1614961907487-8c6b63a06be2?w=500&auto=format&fit=crop'
      },
      {
        name: 'Chana Dal (Bengal Gram)',
        description: 'Unpolished Chana Dal sourced from the best farms.',
        category: 'Pulses & Dals',
        color: 'Yellow',
        sizes: [{ size: '1kg', price: 120 }, { size: '5kg', price: 580 }],
        image_url: 'https://images.unsplash.com/photo-1614735241165-6756e1df61ab?w=500&auto=format&fit=crop'
      },

      // Rice & Grains
      {
        name: 'Aged Basmati Rice',
        description: 'Extra long grain aged Basmati rice with exquisite aroma.',
        category: 'Rice & Grains',
        color: 'White',
        sizes: [{ size: '1kg', price: 250 }, { size: '5kg', price: 1200 }],
        image_url: 'https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?w=500&auto=format&fit=crop'
      },
      {
        name: 'Sona Masoori Rice',
        description: 'Premium quality daily use Sona Masoori rice, aged for a year.',
        category: 'Rice & Grains',
        color: 'White',
        sizes: [{ size: '10kg', price: 650 }, { size: '25kg', price: 1600 }],
        image_url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&auto=format&fit=crop'
      },
      {
        name: 'Organic Quinoa',
        description: 'High-protein, gluten-free organic white quinoa.',
        category: 'Rice & Grains',
        color: 'White',
        sizes: [{ size: '500g', price: 350 }, { size: '1kg', price: 650 }],
        image_url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&auto=format&fit=crop'
      },

      // Premium Oils
      {
        name: 'Cold Pressed Groundnut Oil',
        description: '100% pure wood-pressed groundnut oil retaining natural nutrients.',
        category: 'Premium Oils',
        color: 'Yellow',
        sizes: [{ size: '1L', price: 280 }, { size: '5L', price: 1350 }],
        image_url: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&auto=format&fit=crop'
      },
      {
        name: 'Cold Pressed Mustard Oil',
        description: 'Pungent and authentic kachi ghani mustard oil for everyday cooking.',
        category: 'Premium Oils',
        color: 'Yellow',
        sizes: [{ size: '1L', price: 220 }, { size: '5L', price: 1050 }],
        image_url: 'https://images.unsplash.com/photo-1620706857370-e1b9770e8bb1?w=500&auto=format&fit=crop'
      },

      // Spices & Masalas
      {
        name: 'Turmeric Powder (Haldi)',
        description: 'High curcumin content authentic turmeric powder.',
        category: 'Spices & Masalas',
        color: 'Yellow',
        sizes: [{ size: '200g', price: 65 }, { size: '500g', price: 150 }],
        image_url: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=500&auto=format&fit=crop'
      },
      {
        name: 'Kashmiri Red Chilli Powder',
        description: 'Vibrant red color with mild heat, perfect for rich gravies.',
        category: 'Spices & Masalas',
        color: 'Red',
        sizes: [{ size: '200g', price: 140 }, { size: '500g', price: 320 }],
        image_url: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=500&auto=format&fit=crop'
      },
      {
        name: 'Whole Cardamom (Elaichi)',
        description: 'Premium bold size green cardamom pods from Kerala.',
        category: 'Spices & Masalas',
        color: 'Green',
        sizes: [{ size: '50g', price: 250 }, { size: '100g', price: 480 }],
        image_url: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=500&auto=format&fit=crop'
      },

      // Sugar & Jaggery
      {
        name: 'Organic Brown Sugar',
        description: 'Unrefined natural brown sugar, rich in molasses.',
        category: 'Sugar & Jaggery',
        color: 'Brown',
        sizes: [{ size: '1kg', price: 120 }],
        image_url: 'https://images.unsplash.com/photo-1620025732291-76495be3c3f2?w=500&auto=format&fit=crop'
      },
      {
        name: 'Pure Palm Jaggery',
        description: 'Traditional block jaggery made without chemicals.',
        category: 'Sugar & Jaggery',
        color: 'Brown',
        sizes: [{ size: '500g', price: 80 }, { size: '1kg', price: 150 }],
        image_url: 'https://images.unsplash.com/photo-1620025732291-76495be3c3f2?w=500&auto=format&fit=crop'
      }
    ];

    for (const p of productsData) {
      const sizesJson = JSON.stringify(p.sizes);
      const imagesJson = JSON.stringify([p.image_url]);
      
      await pool.query(
        'INSERT INTO products (name, description, sizes, stock, image_url, images, color, category, is_active, is_bestseller) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)',
        [p.name, p.description, sizesJson, 250, p.image_url, imagesJson, p.color, p.category, true, Math.random() > 0.5]
      );
    }

    console.log('✅ Seeding complete with new products!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
    process.exit(1);
  }
}

seed();
