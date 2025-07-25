const db = require('../config/database');

async function migrateToUniversalModel() {
  console.log('🚀 Начинаем миграцию к универсальной модели товаров...');

  try {
    // Обновляем таблицу products - добавляем новые поля
    const alterQueries = [
      // Добавляем поля для универсальной модели
      `ALTER TABLE products ADD COLUMN product_type TEXT DEFAULT 'footwear' CHECK (product_type IN ('footwear', 'clothing', 'toys', 'accessories'))`,
      `ALTER TABLE products ADD COLUMN gender TEXT DEFAULT 'unisex' CHECK (gender IN ('men', 'women', 'kids', 'unisex'))`,
      `ALTER TABLE products ADD COLUMN color TEXT`,

      // JSON поля для специфических атрибутов каждого типа товара
      `ALTER TABLE products ADD COLUMN footwear_attributes TEXT`, // JSON
      `ALTER TABLE products ADD COLUMN clothing_attributes TEXT`, // JSON
      `ALTER TABLE products ADD COLUMN toys_attributes TEXT`, // JSON
      `ALTER TABLE products ADD COLUMN accessories_attributes TEXT` // JSON
    ];

    // Выполняем миграции одну за другой
    for (let i = 0; i < alterQueries.length; i++) {
      try {
        await db.query(alterQueries[i]);
        console.log(`✅ Выполнена миграция ${i + 1}/${alterQueries.length}`);
      } catch (error) {
        // Игнорируем ошибки "column already exists"
        if (error.message.includes('duplicate column name')) {
          console.log(`⚠️  Поле уже существует, пропускаем миграцию ${i + 1}`);
        } else {
          throw error;
        }
      }
    }

    // Обновляем таблицу categories - добавляем поле product_type
    try {
      await db.query(`ALTER TABLE categories ADD COLUMN product_type TEXT DEFAULT 'footwear' CHECK (product_type IN ('footwear', 'clothing', 'toys', 'accessories'))`);
      console.log('✅ Добавлено поле product_type в categories');
    } catch (error) {
      if (error.message.includes('duplicate column name')) {
        console.log('⚠️  Поле product_type уже существует в categories');
      } else {
        throw error;
      }
    }

    // Создаем индексы для новых полей
    const indexQueries = [
      'CREATE INDEX IF NOT EXISTS idx_products_product_type ON products(product_type)',
      'CREATE INDEX IF NOT EXISTS idx_products_gender ON products(gender)',
      'CREATE INDEX IF NOT EXISTS idx_products_color ON products(color)',
      'CREATE INDEX IF NOT EXISTS idx_categories_product_type ON categories(product_type)'
    ];

    for (const indexQuery of indexQueries) {
      await db.query(indexQuery);
    }
    console.log('✅ Созданы индексы для новых полей');

    // Заполняем тестовые данные для демонстрации
    await seedUniversalProducts();

    console.log('🎉 Миграция к универсальной модели товаров завершена успешно!');

  } catch (error) {
    console.error('❌ Ошибка при миграции:', error);
    throw error;
  }
}

async function seedUniversalProducts() {
  console.log('🌱 Добавляем тестовые товары разных категорий...');

  // Создаем категории для всех типов товаров
  const categories = [
    { id: 'cat-footwear', name: 'Обувь', slug: 'footwear', product_type: 'footwear', description: 'Спортивная и повседневная обувь' },
    { id: 'cat-clothing', name: 'Одежда', slug: 'clothing', product_type: 'clothing', description: 'Спортивная и повседневная одежда' },
    { id: 'cat-toys', name: 'Игрушки', slug: 'toys', product_type: 'toys', description: 'Развивающие и развлекательные игрушки' },
    { id: 'cat-accessories', name: 'Аксессуары', slug: 'accessories', product_type: 'accessories', description: 'Спортивные и модные аксессуары' }
  ];

  for (const category of categories) {
    try {
      await db.query(
        `INSERT OR REPLACE INTO categories (id, name, slug, description, product_type) VALUES (?, ?, ?, ?, ?)`,
        [category.id, category.name, category.slug, category.description, category.product_type]
      );
      console.log(`✅ Добавлена категория: ${category.name}`);
    } catch (error) {
      console.log(`⚠️  Категория ${category.name} уже существует`);
    }
  }

  // Добавляем тестовые товары разных типов
  const products = [
    // Обувь
    {
      id: 'prod-nike-af1',
      name: 'Nike Air Force 1 \'07',
      brand: 'Nike',
      price: 8990,
      original_price: 12990,
      description: 'Легендарные кроссовки Nike Air Force 1 с классическим дизайном',
      images: JSON.stringify(['https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500']),
      sizes: JSON.stringify([39, 40, 41, 42, 43, 44, 45]),
      category_id: 'cat-footwear',
      stock: 15,
      featured: 1,
      product_type: 'footwear',
      gender: 'unisex',
      color: 'белый',
      footwear_attributes: JSON.stringify({
        footwearType: 'sneakers',
        material: 'leather',
        season: 'all-season',
        closure: 'laces'
      })
    },
    // Одежда
    {
      id: 'prod-nike-tshirt',
      name: 'Nike Dri-FIT T-Shirt',
      brand: 'Nike',
      price: 2500,
      original_price: 3200,
      description: 'Спортивная футболка с технологией влагоотведения',
      images: JSON.stringify(['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500']),
      sizes: JSON.stringify(['S', 'M', 'L', 'XL', 'XXL']),
      category_id: 'cat-clothing',
      stock: 25,
      featured: 1,
      product_type: 'clothing',
      gender: 'men',
      color: 'синий',
      clothing_attributes: JSON.stringify({
        clothingType: 't-shirt',
        material: 'polyester',
        season: 'summer',
        fit: 'regular',
        sleeveLength: 'short'
      })
    },
    // Игрушки
    {
      id: 'prod-lego-city',
      name: 'Конструктор LEGO City',
      brand: 'LEGO',
      price: 3500,
      description: 'Набор конструктора LEGO для развития творческих способностей',
      images: JSON.stringify(['https://images.unsplash.com/photo-1558060370-d644479df6ba?w=500']),
      sizes: JSON.stringify(['One Size']),
      category_id: 'cat-toys',
      stock: 30,
      featured: 1,
      product_type: 'toys',
      gender: 'kids',
      toys_attributes: JSON.stringify({
        toyType: 'building',
        ageGroup: '6-8',
        material: 'plastic',
        batteryRequired: false,
        assemblyRequired: true
      })
    },
    // Аксессуары
    {
      id: 'prod-nike-bag',
      name: 'Спортивная сумка Nike',
      brand: 'Nike',
      price: 4500,
      original_price: 5500,
      description: 'Вместительная спортивная сумка для тренировок',
      images: JSON.stringify(['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500']),
      sizes: JSON.stringify(['One Size']),
      category_id: 'cat-accessories',
      stock: 15,
      featured: 1,
      product_type: 'accessories',
      gender: 'unisex',
      color: 'черный',
      accessories_attributes: JSON.stringify({
        accessoryType: 'bag',
        material: 'synthetic',
        occasion: 'sport'
      })
    }
  ];

  for (const product of products) {
    try {
      await db.query(
        `INSERT OR REPLACE INTO products (
          id, name, brand, price, original_price, description, images, sizes,
          category_id, stock, featured, product_type, gender, color,
          footwear_attributes, clothing_attributes, toys_attributes, accessories_attributes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          product.id, product.name, product.brand, product.price, product.original_price,
          product.description, product.images, product.sizes, product.category_id,
          product.stock, product.featured, product.product_type, product.gender, product.color,
          product.footwear_attributes || null,
          product.clothing_attributes || null,
          product.toys_attributes || null,
          product.accessories_attributes || null
        ]
      );
      console.log(`✅ Добавлен товар: ${product.name}`);
    } catch (error) {
      console.log(`⚠️  Товар ${product.name} уже существует или ошибка:`, error.message);
    }
  }

  console.log('🌱 Тестовые данные добавлены');
}

// Запуск миграции
if (require.main === module) {
  db.init()
    .then(() => migrateToUniversalModel())
    .then(() => {
      console.log('✅ Миграция завершена успешно');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Ошибка миграции:', error);
      process.exit(1);
    });
}

module.exports = { migrateToUniversalModel };
