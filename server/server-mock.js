const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Compression
app.use(compression());

// CORS
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Mock data
const mockCategories = [
  { id: 1, name: 'Мужские кроссовки', slug: 'men', description: 'Стильные и комфортные кроссовки для мужчин' },
  { id: 2, name: 'Женские кроссовки', slug: 'women', description: 'Модные кроссовки для женщин на каждый день' },
  { id: 3, name: 'Детские кроссовки', slug: 'kids', description: 'Удобные и яркие кроссовки для детей' },
  { id: 4, name: 'Спортивные кроссовки', slug: 'sport', description: 'Профессиональные кроссовки для спорта' },
  { id: 5, name: 'Лайфстайл', slug: 'lifestyle', description: 'Повседневные кроссовки для городской жизни' }
];

const mockProducts = [
  {
    id: 1,
    name: 'Nike Air Max 90 Essential',
    brand: 'Nike',
    price: 12990,
    originalPrice: 15990,
    description: 'Классические кроссовки Nike Air Max 90 с легендарной видимой подушкой Air в пятке.',
    images: ['https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/99486859-0ff3-46b4-949b-2d16af2ad421/custom-nike-air-max-90-by-you-shoes.png'],
    sizes: [40, 41, 42, 43, 44, 45],
    category_id: 1,
    stock: 15,
    rating: 4.5,
    reviews_count: 124,
    featured: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 2,
    name: 'Adidas Stan Smith',
    brand: 'Adidas',
    price: 8990,
    originalPrice: 10990,
    description: 'Минималистичные кроссовки adidas Stan Smith - икона спортивного стиля.',
    images: ['https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/ba8375a1c6b1439a8f9aaf8600a7ad03_9366/Stan_Smith_Shoes_White_FX5500_01_standard.jpg'],
    sizes: [38, 39, 40, 41, 42, 43, 44],
    category_id: 5,
    stock: 12,
    rating: 4.7,
    reviews_count: 203,
    featured: true,
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z'
  },
  {
    id: 3,
    name: 'Converse Chuck Taylor All Star',
    brand: 'Converse',
    price: 5990,
    description: 'Легендарные кеды Converse Chuck Taylor All Star - классика, которая никогда не выходит из моды.',
    images: ['https://www.converse.com/dw/image/v2/BCZC_PRD/on/demandware.static/-/Sites-cnv-master-catalog/default/dw855ce97e/images/a_107/M9160C_A_107X1.jpg'],
    sizes: [36, 37, 38, 39, 40, 41, 42, 43],
    category_id: 5,
    stock: 28,
    rating: 4.2,
    reviews_count: 89,
    featured: false,
    created_at: '2024-01-03T00:00:00Z',
    updated_at: '2024-01-03T00:00:00Z'
  },
  {
    id: 4,
    name: 'Vans Old Skool',
    brand: 'Vans',
    price: 7490,
    description: 'Культовые кеды Vans Old Skool с фирменной полосой и прочной конструкцией.',
    images: ['https://images.vans.com/is/image/Vans/D3HY28-HERO?$583x583$'],
    sizes: [37, 38, 39, 40, 41, 42, 43, 44],
    category_id: 5,
    stock: 22,
    rating: 4.3,
    reviews_count: 156,
    featured: false,
    created_at: '2024-01-04T00:00:00Z',
    updated_at: '2024-01-04T00:00:00Z'
  },
  {
    id: 5,
    name: 'Air Jordan 1 Retro High',
    brand: 'Jordan',
    price: 18990,
    description: 'Легендарные баскетбольные кроссовки Air Jordan 1 в классическом высоком силуэте.',
    images: ['https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/b7d9211c-26e7-431a-ac24-b0540fb3c00f/air-jordan-1-retro-high-og-shoes-6xjv8n.png'],
    sizes: [40, 41, 42, 43, 44, 45, 46],
    category_id: 4,
    stock: 8,
    rating: 4.8,
    reviews_count: 287,
    featured: true,
    created_at: '2024-01-05T00:00:00Z',
    updated_at: '2024-01-05T00:00:00Z'
  },
  {
    id: 6,
    name: 'Puma Suede Classic',
    brand: 'Puma',
    price: 6990,
    originalPrice: 8990,
    description: 'Классические замшевые кроссовки Puma Suede - стиль и комфорт в одном.',
    images: ['https://images.puma.com/image/upload/f_auto,q_auto,b_rgb:fafafa,w_2000,h_2000/global/374915/25/sv01/fnd/IND/fmt/png/Suede-Classic-XXI-Sneakers'],
    sizes: [38, 39, 40, 41, 42, 43, 44],
    category_id: 5,
    stock: 18,
    rating: 4.1,
    reviews_count: 92,
    featured: false,
    created_at: '2024-01-06T00:00:00Z',
    updated_at: '2024-01-06T00:00:00Z'
  },
  {
    id: 7,
    name: 'New Balance 990v5',
    brand: 'New Balance',
    price: 19990,
    description: 'Премиальные кроссовки New Balance 990v5 - эталон качества и комфорта.',
    images: ['https://nb.scene7.com/is/image/NB/m990gl5_nb_02_i?$pdpflexf2$&qlt=80&fmt=webp&wid=440&hei=440'],
    sizes: [40, 41, 42, 43, 44, 45],
    category_id: 5,
    stock: 6,
    rating: 4.9,
    reviews_count: 167,
    featured: true,
    created_at: '2024-01-07T00:00:00Z',
    updated_at: '2024-01-07T00:00:00Z'
  },
  {
    id: 8,
    name: 'Nike Pegasus 41',
    brand: 'Nike',
    price: 14990,
    description: 'Профессиональные беговые кроссовки Nike Pegasus 41 с улучшенной амортизацией.',
    images: ['https://static.nike.com/a/images/c_limit,w_592,f_auto/t_product_v1/3ba2b77b-89e0-4f6e-81a1-b5b6f6c81ce5/pegasus-41-mens-road-running-shoes-ph7CJk.png'],
    sizes: [40, 41, 42, 43, 44, 45, 46],
    category_id: 4,
    stock: 18,
    rating: 4.6,
    reviews_count: 89,
    featured: false,
    created_at: '2024-01-08T00:00:00Z',
    updated_at: '2024-01-08T00:00:00Z'
  }
];

// Helper functions
const filterProducts = (products, filters = {}) => {
  let filtered = [...products];

  if (filters.search) {
    const query = filters.search.toLowerCase();
    filtered = filtered.filter(product =>
      product.name.toLowerCase().includes(query) ||
      product.brand.toLowerCase().includes(query) ||
      product.description.toLowerCase().includes(query)
    );
  }

  if (filters.brands) {
    const brands = filters.brands.split(',');
    filtered = filtered.filter(product => brands.includes(product.brand));
  }

  if (filters.sizes) {
    const sizes = filters.sizes.split(',').map(Number);
    filtered = filtered.filter(product =>
      sizes.some(size => product.sizes.includes(size))
    );
  }

  if (filters.min_price) {
    filtered = filtered.filter(product => product.price >= parseFloat(filters.min_price));
  }

  if (filters.max_price) {
    filtered = filtered.filter(product => product.price <= parseFloat(filters.max_price));
  }

  if (filters.featured === 'true') {
    filtered = filtered.filter(product => product.featured);
  }

  // Sorting
  const sortBy = filters.sort_by || 'name';
  const sortOrder = filters.sort_order || 'asc';

  filtered.sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case 'price':
        comparison = a.price - b.price;
        break;
      case 'rating':
        comparison = a.rating - b.rating;
        break;
      case 'newest':
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        break;
      case 'name':
      default:
        comparison = a.name.localeCompare(b.name);
        break;
    }

    return sortOrder === 'desc' ? -comparison : comparison;
  });

  return filtered;
};

// API Routes

// Products
app.get('/api/products', (req, res) => {
  try {
    const filtered = filterProducts(mockProducts, req.query);
    res.json({
      success: true,
      data: filtered,
      count: filtered.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching products',
      error: error.message
    });
  }
});

app.get('/api/products/:id', (req, res) => {
  try {
    const product = mockProducts.find(p => p.id === parseInt(req.params.id));
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching product',
      error: error.message
    });
  }
});

app.get('/api/products/search/:term', (req, res) => {
  try {
    const searchTerm = req.params.term;
    const filtered = filterProducts(mockProducts, { search: searchTerm });
    const limited = filtered.slice(0, parseInt(req.query.limit) || 20);

    res.json({
      success: true,
      data: limited,
      count: limited.length,
      search_term: searchTerm
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error searching products',
      error: error.message
    });
  }
});

app.get('/api/products/featured/list', (req, res) => {
  try {
    const featured = mockProducts.filter(p => p.featured);
    const limited = featured.slice(0, parseInt(req.query.limit) || 8);

    res.json({
      success: true,
      data: limited,
      count: limited.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching featured products',
      error: error.message
    });
  }
});

app.get('/api/products/filters/brands', (req, res) => {
  try {
    const brands = [...new Set(mockProducts.map(p => p.brand))].sort();
    res.json({
      success: true,
      data: brands
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching brands',
      error: error.message
    });
  }
});

app.get('/api/products/filters/sizes', (req, res) => {
  try {
    const allSizes = mockProducts.flatMap(p => p.sizes);
    const uniqueSizes = [...new Set(allSizes)].sort((a, b) => a - b);
    res.json({
      success: true,
      data: uniqueSizes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching sizes',
      error: error.message
    });
  }
});

app.get('/api/products/filters/price-range', (req, res) => {
  try {
    const prices = mockProducts.map(p => p.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    res.json({
      success: true,
      data: { min, max }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching price range',
      error: error.message
    });
  }
});

// Categories
app.get('/api/categories', (req, res) => {
  try {
    res.json({
      success: true,
      data: mockCategories,
      count: mockCategories.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching categories',
      error: error.message
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Mock server is running on port ${PORT}`);
  console.log(`Health check available at http://localhost:${PORT}/api/health`);
});
