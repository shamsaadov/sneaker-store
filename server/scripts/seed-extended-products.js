const db = require('../config/database');

async function seedExtendedProducts() {
  console.log('🌱 Добавляем расширенный каталог товаров...');

  try {
    // Расширенная коллекция товаров всех категорий
    const products = [
      // === ОБУВЬ (FOOTWEAR) ===
      {
        id: 'prod-nike-air-max',
        name: 'Nike Air Max 270',
        brand: 'Nike',
        price: 12990,
        original_price: 15990,
        description: 'Революционные кроссовки с самой большой видимой подушкой Air в истории Nike.',
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500',
          'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500'
        ]),
        sizes: JSON.stringify([36, 37, 38, 39, 40, 41, 42, 43, 44, 45]),
        category_id: 'cat-footwear',
        stock: 25,
        featured: 1,
        product_type: 'footwear',
        gender: 'unisex',
        color: 'красный',
        footwear_attributes: JSON.stringify({
          footwearType: 'sneakers',
          material: 'mesh',
          season: 'all-season',
          closure: 'laces'
        })
      },
      {
        id: 'prod-adidas-ultraboost',
        name: 'Adidas Ultraboost 22',
        brand: 'Adidas',
        price: 14500,
        description: 'Беговые кроссовки с технологией Boost для максимального возврата энергии.',
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1551107696-a4b57a9d33b8?w=500'
        ]),
        sizes: JSON.stringify([38, 39, 40, 41, 42, 43, 44, 45, 46]),
        category_id: 'cat-footwear',
        stock: 18,
        featured: 1,
        product_type: 'footwear',
        gender: 'men',
        color: 'черный',
        footwear_attributes: JSON.stringify({
          footwearType: 'sports',
          material: 'synthetic',
          season: 'all-season',
          closure: 'laces'
        })
      },
      {
        id: 'prod-converse-chuck',
        name: 'Converse Chuck Taylor All Star',
        brand: 'Converse',
        price: 4990,
        original_price: 6500,
        description: 'Классические высокие кеды - символ молодежной культуры.',
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1515347619252-60a4bf4fff4f?w=500'
        ]),
        sizes: JSON.stringify([35, 36, 37, 38, 39, 40, 41, 42, 43]),
        category_id: 'cat-footwear',
        stock: 30,
        featured: 0,
        product_type: 'footwear',
        gender: 'unisex',
        color: 'белый',
        footwear_attributes: JSON.stringify({
          footwearType: 'casual',
          material: 'canvas',
          season: 'all-season',
          closure: 'laces'
        })
      },
      {
        id: 'prod-kids-sneakers',
        name: 'Детские кроссовки Nike',
        brand: 'Nike',
        price: 3500,
        description: 'Удобные детские кроссовки для активных игр.',
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=500'
        ]),
        sizes: JSON.stringify([19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30]),
        category_id: 'cat-footwear',
        stock: 15,
        featured: 0,
        product_type: 'footwear',
        gender: 'kids',
        color: 'синий',
        footwear_attributes: JSON.stringify({
          footwearType: 'sneakers',
          material: 'synthetic',
          season: 'all-season',
          closure: 'velcro'
        })
      },

      // === ОДЕЖДА (CLOTHING) ===
      {
        id: 'prod-hoodie-adidas',
        name: 'Adidas Essentials Hoodie',
        brand: 'Adidas',
        price: 4500,
        original_price: 5500,
        description: 'Комфортное худи из мягкого хлопка с культовым логотипом Adidas.',
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500'
        ]),
        sizes: JSON.stringify(['S', 'M', 'L', 'XL', 'XXL']),
        category_id: 'cat-clothing',
        stock: 20,
        featured: 1,
        product_type: 'clothing',
        gender: 'unisex',
        color: 'серый',
        clothing_attributes: JSON.stringify({
          clothingType: 'hoodie',
          material: 'cotton',
          season: 'autumn',
          fit: 'regular',
          sleeveLength: 'long'
        })
      },
      {
        id: 'prod-women-dress',
        name: 'Летнее платье H&M',
        brand: 'H&M',
        price: 2990,
        description: 'Легкое летнее платье из натурального льна.',
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=500'
        ]),
        sizes: JSON.stringify(['XS', 'S', 'M', 'L', 'XL']),
        category_id: 'cat-clothing',
        stock: 12,
        featured: 0,
        product_type: 'clothing',
        gender: 'women',
        color: 'розовый',
        clothing_attributes: JSON.stringify({
          clothingType: 'dress',
          material: 'linen',
          season: 'summer',
          fit: 'loose',
          sleeveLength: 'sleeveless'
        })
      },
      {
        id: 'prod-mens-jacket',
        name: 'Куртка Nike Sportswear',
        brand: 'Nike',
        price: 8900,
        description: 'Ветрозащитная куртка для тренировок и повседневной носки.',
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500'
        ]),
        sizes: JSON.stringify(['M', 'L', 'XL', 'XXL']),
        category_id: 'cat-clothing',
        stock: 8,
        featured: 1,
        product_type: 'clothing',
        gender: 'men',
        color: 'черный',
        clothing_attributes: JSON.stringify({
          clothingType: 'jacket',
          material: 'polyester',
          season: 'autumn',
          fit: 'regular',
          sleeveLength: 'long'
        })
      },
      {
        id: 'prod-kids-tshirt',
        name: 'Детская футболка Disney',
        brand: 'Disney',
        price: 1200,
        description: 'Яркая футболка с любимыми персонажами Disney.',
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=500'
        ]),
        sizes: JSON.stringify(['XS', 'S', 'M', 'L']),
        category_id: 'cat-clothing',
        stock: 25,
        featured: 0,
        product_type: 'clothing',
        gender: 'kids',
        color: 'желтый',
        clothing_attributes: JSON.stringify({
          clothingType: 't-shirt',
          material: 'cotton',
          season: 'summer',
          fit: 'regular',
          sleeveLength: 'short'
        })
      },

      // === ИГРУШКИ (TOYS) ===
      {
        id: 'prod-lego-technic',
        name: 'LEGO Technic Суперкар',
        brand: 'LEGO',
        price: 15999,
        original_price: 18999,
        description: 'Сложный конструктор LEGO Technic с функциональными элементами.',
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1558060370-d644479df6ba?w=500'
        ]),
        sizes: JSON.stringify(['One Size']),
        category_id: 'cat-toys',
        stock: 5,
        featured: 1,
        product_type: 'toys',
        gender: 'unisex',
        toys_attributes: JSON.stringify({
          toyType: 'building',
          ageGroup: '13+',
          material: 'plastic',
          batteryRequired: false,
          assemblyRequired: true
        })
      },
      {
        id: 'prod-barbie-doll',
        name: 'Кукла Barbie Dreamhouse',
        brand: 'Mattel',
        price: 2500,
        description: 'Классическая кукла Barbie с множеством аксессуаров.',
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1566133788863-0beb9c6dc75d?w=500'
        ]),
        sizes: JSON.stringify(['One Size']),
        category_id: 'cat-toys',
        stock: 15,
        featured: 0,
        product_type: 'toys',
        gender: 'kids',
        toys_attributes: JSON.stringify({
          toyType: 'doll',
          ageGroup: '3-5',
          material: 'plastic',
          batteryRequired: false,
          assemblyRequired: false
        })
      },
      {
        id: 'prod-remote-car',
        name: 'Радиоуправляемая машинка',
        brand: 'Traxxas',
        price: 8500,
        description: 'Быстрая радиоуправляемая машинка для детей и взрослых.',
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1469461084727-4baba3bc3ba1?w=500'
        ]),
        sizes: JSON.stringify(['One Size']),
        category_id: 'cat-toys',
        stock: 7,
        featured: 1,
        product_type: 'toys',
        gender: 'unisex',
        toys_attributes: JSON.stringify({
          toyType: 'vehicle',
          ageGroup: '9-12',
          material: 'plastic',
          batteryRequired: true,
          assemblyRequired: false
        })
      },
      {
        id: 'prod-puzzle-1000',
        name: 'Пазл "Природа" 1000 элементов',
        brand: 'Ravensburger',
        price: 1200,
        description: 'Красивый пазл с изображением природы, 1000 элементов.',
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=500'
        ]),
        sizes: JSON.stringify(['One Size']),
        category_id: 'cat-toys',
        stock: 20,
        featured: 0,
        product_type: 'toys',
        gender: 'unisex',
        toys_attributes: JSON.stringify({
          toyType: 'puzzle',
          ageGroup: '13+',
          material: 'cardboard',
          batteryRequired: false,
          assemblyRequired: true
        })
      },

      // === АКСЕССУАРЫ (ACCESSORIES) ===
      {
        id: 'prod-nike-backpack',
        name: 'Рюкзак Nike Academy',
        brand: 'Nike',
        price: 3200,
        description: 'Спортивный рюкзак для тренировок и повседневного использования.',
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500'
        ]),
        sizes: JSON.stringify(['One Size']),
        category_id: 'cat-accessories',
        stock: 12,
        featured: 1,
        product_type: 'accessories',
        gender: 'unisex',
        color: 'черный',
        accessories_attributes: JSON.stringify({
          accessoryType: 'bag',
          material: 'synthetic',
          occasion: 'sport'
        })
      },
      {
        id: 'prod-ray-ban-sunglasses',
        name: 'Солнцезащитные очки Ray-Ban',
        brand: 'Ray-Ban',
        price: 12000,
        original_price: 15000,
        description: 'Классические авиаторы Ray-Ban с УФ-защитой.',
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500'
        ]),
        sizes: JSON.stringify(['One Size']),
        category_id: 'cat-accessories',
        stock: 8,
        featured: 1,
        product_type: 'accessories',
        gender: 'unisex',
        accessories_attributes: JSON.stringify({
          accessoryType: 'sunglasses',
          material: 'metal',
          occasion: 'casual'
        })
      },
      {
        id: 'prod-apple-watch',
        name: 'Apple Watch Series 9',
        brand: 'Apple',
        price: 35000,
        description: 'Умные часы Apple Watch с множеством функций для здоровья и фитнеса.',
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=500'
        ]),
        sizes: JSON.stringify(['S', 'M', 'L']),
        category_id: 'cat-accessories',
        stock: 5,
        featured: 1,
        product_type: 'accessories',
        gender: 'unisex',
        accessories_attributes: JSON.stringify({
          accessoryType: 'watch',
          material: 'metal',
          occasion: 'formal'
        })
      },
      {
        id: 'prod-winter-hat',
        name: 'Зимняя шапка Adidas',
        brand: 'Adidas',
        price: 1800,
        description: 'Теплая зимняя шапка из шерсти с логотипом Adidas.',
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1544966503-7bb4573f4b82?w=500'
        ]),
        sizes: JSON.stringify(['One Size']),
        category_id: 'cat-accessories',
        stock: 18,
        featured: 0,
        product_type: 'accessories',
        gender: 'unisex',
        color: 'серый',
        accessories_attributes: JSON.stringify({
          accessoryType: 'hat',
          material: 'fabric',
          occasion: 'casual'
        })
      }
    ];

    // Добавляем товары в базу данных
    for (const product of products) {
      try {
        await db.query(
          `INSERT OR REPLACE INTO products (
            id, name, brand, price, original_price, description, images, sizes,
            category_id, stock, featured, product_type, gender, color,
            footwear_attributes, clothing_attributes, toys_attributes, accessories_attributes
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            product.id, product.name, product.brand, product.price, product.original_price || null,
            product.description, product.images, product.sizes, product.category_id,
            product.stock, product.featured, product.product_type, product.gender, product.color || null,
            product.footwear_attributes || null,
            product.clothing_attributes || null,
            product.toys_attributes || null,
            product.accessories_attributes || null
          ]
        );
        console.log(`✅ Добавлен: ${product.name} (${product.product_type})`);
      } catch (error) {
        console.log(`⚠️  Ошибка при добавлении ${product.name}: ${error.message}`);
      }
    }

    // Выводим статистику
    const stats = await getProductStats();
    console.log('\n📊 СТАТИСТИКА КАТАЛОГА:');
    console.log(`Всего товаров: ${stats.total}`);
    console.log(`Обувь: ${stats.footwear}`);
    console.log(`Одежда: ${stats.clothing}`);
    console.log(`Игрушки: ${stats.toys}`);
    console.log(`Аксессуары: ${stats.accessories}`);
    console.log(`Рекомендуемые: ${stats.featured}`);

    console.log('\n🎉 Расширенный каталог товаров создан успешно!');

  } catch (error) {
    console.error('❌ Ошибка при создании каталога:', error);
    throw error;
  }
}

async function getProductStats() {
  const result = await db.query(`
    SELECT
      COUNT(*) as total,
      SUM(CASE WHEN product_type = 'footwear' THEN 1 ELSE 0 END) as footwear,
      SUM(CASE WHEN product_type = 'clothing' THEN 1 ELSE 0 END) as clothing,
      SUM(CASE WHEN product_type = 'toys' THEN 1 ELSE 0 END) as toys,
      SUM(CASE WHEN product_type = 'accessories' THEN 1 ELSE 0 END) as accessories,
      SUM(CASE WHEN featured = 1 THEN 1 ELSE 0 END) as featured
    FROM products
  `);
  return result.rows[0];
}

// Запуск создания каталога
if (require.main === module) {
  db.init()
    .then(() => seedExtendedProducts())
    .then(() => {
      console.log('✅ Скрипт завершен успешно');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Ошибка выполнения скрипта:', error);
      process.exit(1);
    });
}

module.exports = { seedExtendedProducts };
