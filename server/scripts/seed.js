const db = require('../config/database');
const Category = require('../models/Category');
const Product = require('../models/Product');

const seedData = async () => {
  try {
    console.log('Starting database seed...');

    // Initialize database
    await db.init();

    // Clear existing data
    console.log('Clearing existing data...');
    await db.query('DELETE FROM products');
    await db.query('DELETE FROM categories');

    // Create categories
    console.log('Creating categories...');
    const categories = [
      {
        name: 'Мужские кроссовки',
        slug: 'men',
        description: 'Стильные и комфортные кроссовки для мужчин',
        image: 'https://static.nike.com/a/images/c_limit,w_592,f_auto/t_product_v1/4f37fca8-6bce-43e7-ad07-f57ae3c13142/air-force-1-07-mens-shoes-jBrhbr.png'
      },
      {
        name: 'Женские кроссовки',
        slug: 'women',
        description: 'Модные кроссовки для женщин на каждый день',
        image: 'https://static.nike.com/a/images/c_limit,w_592,f_auto/t_product_v1/i1-665455a5-45de-40fb-945f-c1852b82400d/air-force-1-07-womens-shoes-b19lhq.png'
      },
      {
        name: 'Детские кроссовки',
        slug: 'kids',
        description: 'Удобные и яркие кроссовки для детей',
        image: 'https://static.nike.com/a/images/c_limit,w_592,f_auto/t_product_v1/178b2a46-3ee4-492b-882e-f71efdd53a36/force-1-le-younger-kids-shoes-92Xhqp.png'
      },
      {
        name: 'Спортивные кроссовки',
        slug: 'sport',
        description: 'Профессиональные кроссовки для спорта',
        image: 'https://static.nike.com/a/images/c_limit,w_592,f_auto/t_product_v1/3ba2b77b-89e0-4f6e-81a1-b5b6f6c81ce5/pegasus-41-mens-road-running-shoes-ph7CJk.png'
      },
      {
        name: 'Лайфстайл',
        slug: 'lifestyle',
        description: 'Повседневные кроссовки для городской жизни',
        image: 'https://static.nike.com/a/images/c_limit,w_592,f_auto/t_product_v1/a8b2b6a3-df4e-4b1e-9b4b-8b3a2a2a2a2a/air-max-90-mens-shoes-6ZKjSh.png'
      }
    ];

    const createdCategories = [];
    for (const categoryData of categories) {
      const category = await Category.create(categoryData);
      createdCategories.push(category);
      console.log(`Created category: ${category.name}`);
    }

    // Create products
    console.log('Creating products...');
    const products = [
      // Nike products
      {
        name: 'Nike Air Max 90 Essential',
        brand: 'Nike',
        price: 12990,
        original_price: 15990,
        description: 'Классические кроссовки Nike Air Max 90 с легендарной видимой подушкой Air в пятке. Обеспечивают максимальный комфорт и стиль.',
        images: [
          'https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/99486859-0ff3-46b4-949b-2d16af2ad421/custom-nike-air-max-90-by-you-shoes.png',
          'https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/a8b2b6a3-df4e-4b1e-9b4b-8b3a2a2a2a2a/air-max-90-mens-shoes-6ZKjSh.png'
        ],
        sizes: [40, 41, 42, 43, 44, 45],
        category_id: createdCategories[0].id,
        stock: 15,
        rating: 4.5,
        reviews_count: 124,
        featured: true
      },
      {
        name: 'Nike Air Force 1 07',
        brand: 'Nike',
        price: 9990,
        original_price: 11990,
        description: 'Легендарные баскетбольные кроссовки Nike Air Force 1 в классическом белом цвете. Универсальный выбор для любого стиля.',
        images: [
          'https://static.nike.com/a/images/c_limit,w_592,f_auto/t_product_v1/4f37fca8-6bce-43e7-ad07-f57ae3c13142/air-force-1-07-mens-shoes-jBrhbr.png'
        ],
        sizes: [39, 40, 41, 42, 43, 44, 45],
        category_id: createdCategories[0].id,
        stock: 25,
        rating: 4.7,
        reviews_count: 256,
        featured: true
      },
      {
        name: 'Nike Pegasus 41',
        brand: 'Nike',
        price: 14990,
        description: 'Профессиональные беговые кроссовки Nike Pegasus 41 с улучшенной амортизацией для длительных пробежек.',
        images: [
          'https://static.nike.com/a/images/c_limit,w_592,f_auto/t_product_v1/3ba2b77b-89e0-4f6e-81a1-b5b6f6c81ce5/pegasus-41-mens-road-running-shoes-ph7CJk.png'
        ],
        sizes: [40, 41, 42, 43, 44, 45, 46],
        category_id: createdCategories[3].id,
        stock: 18,
        rating: 4.6,
        reviews_count: 89,
        featured: false
      },

      // Adidas products
      {
        name: 'Adidas Stan Smith',
        brand: 'Adidas',
        price: 8990,
        original_price: 10990,
        description: 'Минималистичные кроссовки adidas Stan Smith - икона спортивного стиля. Классический белый дизайн с зелеными деталями.',
        images: [
          'https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/ba8375a1c6b1439a8f9aaf8600a7ad03_9366/Stan_Smith_Shoes_White_FX5500_01_standard.jpg'
        ],
        sizes: [38, 39, 40, 41, 42, 43, 44],
        category_id: createdCategories[4].id,
        stock: 12,
        rating: 4.7,
        reviews_count: 203,
        featured: true
      },
      {
        name: 'Adidas Ultraboost 22',
        brand: 'Adidas',
        price: 16990,
        description: 'Технологичные беговые кроссовки adidas Ultraboost 22 с революционной подошвой Boost для максимального возврата энергии.',
        images: [
          'https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/fbaf991a8dae4057b3a7ae5a013064fc_9366/Ultraboost_22_Shoes_Black_GZ0127_01_standard.jpg'
        ],
        sizes: [40, 41, 42, 43, 44, 45],
        category_id: createdCategories[3].id,
        stock: 8,
        rating: 4.8,
        reviews_count: 142,
        featured: true
      },

      // Converse products
      {
        name: 'Converse Chuck Taylor All Star Classic',
        brand: 'Converse',
        price: 5990,
        description: 'Легендарные кеды Converse Chuck Taylor All Star - классика, которая никогда не выходит из моды. Высокие черные кеды.',
        images: [
          'https://www.converse.com/dw/image/v2/BCZC_PRD/on/demandware.static/-/Sites-cnv-master-catalog/default/dw855ce97e/images/a_107/M9160C_A_107X1.jpg'
        ],
        sizes: [36, 37, 38, 39, 40, 41, 42, 43],
        category_id: createdCategories[4].id,
        stock: 28,
        rating: 4.2,
        reviews_count: 89,
        featured: false
      },

      // Vans products
      {
        name: 'Vans Old Skool',
        brand: 'Vans',
        price: 7490,
        description: 'Культовые кеды Vans Old Skool с фирменной полосой и прочной конструкцией. Идеальны для скейтбординга и повседневной носки.',
        images: [
          'https://images.vans.com/is/image/Vans/D3HY28-HERO?$583x583$'
        ],
        sizes: [37, 38, 39, 40, 41, 42, 43, 44],
        category_id: createdCategories[4].id,
        stock: 22,
        rating: 4.3,
        reviews_count: 156,
        featured: false
      },

      // Puma products
      {
        name: 'Puma Suede Classic',
        brand: 'Puma',
        price: 6990,
        original_price: 8990,
        description: 'Классические замшевые кроссовки Puma Suede - стиль и комфорт в одном. Винтажный дизайн с современными технологиями.',
        images: [
          'https://images.puma.com/image/upload/f_auto,q_auto,b_rgb:fafafa,w_2000,h_2000/global/374915/25/sv01/fnd/IND/fmt/png/Suede-Classic-XXI-Sneakers'
        ],
        sizes: [38, 39, 40, 41, 42, 43, 44],
        category_id: createdCategories[4].id,
        stock: 18,
        rating: 4.1,
        reviews_count: 92,
        featured: false
      },

      // Jordan products
      {
        name: 'Air Jordan 1 Retro High OG',
        brand: 'Jordan',
        price: 18990,
        description: 'Легендарные баскетбольные кроссовки Air Jordan 1 в классическом высоком силуэте. Иконическая модель от Michael Jordan.',
        images: [
          'https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/b7d9211c-26e7-431a-ac24-b0540fb3c00f/air-jordan-1-retro-high-og-shoes-6xjv8n.png'
        ],
        sizes: [40, 41, 42, 43, 44, 45, 46],
        category_id: createdCategories[3].id,
        stock: 8,
        rating: 4.8,
        reviews_count: 287,
        featured: true
      },

      // New Balance products
      {
        name: 'New Balance 990v5',
        brand: 'New Balance',
        price: 19990,
        description: 'Премиальные кроссовки New Balance 990v5 - эталон качества и комфорта. Сделано в США с использованием лучших материалов.',
        images: [
          'https://nb.scene7.com/is/image/NB/m990gl5_nb_02_i?$pdpflexf2$&qlt=80&fmt=webp&wid=440&hei=440'
        ],
        sizes: [40, 41, 42, 43, 44, 45],
        category_id: createdCategories[4].id,
        stock: 6,
        rating: 4.9,
        reviews_count: 167,
        featured: true
      },

      // Women's products
      {
        name: 'Nike Air Force 1 07 Women',
        brand: 'Nike',
        price: 9490,
        description: 'Женская версия легендарных Nike Air Force 1 в стильном белом цвете. Классический дизайн с женственными пропорциями.',
        images: [
          'https://static.nike.com/a/images/c_limit,w_592,f_auto/t_product_v1/i1-665455a5-45de-40fb-945f-c1852b82400d/air-force-1-07-womens-shoes-b19lhq.png'
        ],
        sizes: [35, 36, 37, 38, 39, 40, 41],
        category_id: createdCategories[1].id,
        stock: 20,
        rating: 4.6,
        reviews_count: 178,
        featured: true
      },

      // Kids products
      {
        name: 'Nike Force 1 LE Kids',
        brand: 'Nike',
        price: 6990,
        description: 'Детская версия легендарных Nike Air Force 1. Удобные и стильные кроссовки для маленьких модников.',
        images: [
          'https://static.nike.com/a/images/c_limit,w_592,f_auto/t_product_v1/178b2a46-3ee4-492b-882e-f71efdd53a36/force-1-le-younger-kids-shoes-92Xhqp.png'
        ],
        sizes: [27, 28, 29, 30, 31, 32, 33, 34, 35],
        category_id: createdCategories[2].id,
        stock: 15,
        rating: 4.4,
        reviews_count: 95,
        featured: false
      }
    ];

    for (const productData of products) {
      const product = await Product.create(productData);
      console.log(`Created product: ${product.name}`);
    }

    console.log('Database seeded successfully!');
    console.log(`Created ${createdCategories.length} categories and ${products.length} products`);

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await db.close();
  }
};

// Run seed if this file is executed directly
if (require.main === module) {
  seedData();
}

module.exports = seedData;
