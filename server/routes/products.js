const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// Get all products with filters
router.get('/', async (req, res) => {
  try {
    console.log("test");
    const filters = {
      search: req.query.search,
      brands: req.query.brands ? req.query.brands.split(',') : null,
      categories: req.query.categories ? req.query.categories.split(',') : null,

      // Новые фильтры для универсальной модели
      product_types: req.query.product_types ? req.query.product_types.split(',') : null,
      gender: req.query.gender ? req.query.gender.split(',') : null,
      colors: req.query.colors ? req.query.colors.split(',') : null,

      // Размеры теперь поддерживают как строки, так и числа
      sizes: req.query.sizes ? req.query.sizes.split(',').map(size =>
        isNaN(size) ? size : parseInt(size)
      ) : null,

      min_price: req.query.min_price ? parseFloat(req.query.min_price) : null,
      max_price: req.query.max_price ? parseFloat(req.query.max_price) : null,
      featured: req.query.featured === 'true',
      in_stock: req.query.in_stock === 'true',
      sort_by: req.query.sort_by || 'name',
      sort_order: req.query.sort_order || 'asc',
      limit: req.query.limit ? parseInt(req.query.limit) : null,
      offset: req.query.offset ? parseInt(req.query.offset) : null
    };

    const products = await Product.findAll(filters);

    res.json({
      success: true,
      data: products.map(product => product.toJSON()),
      count: products.length
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching products',
      error: error.message
    });
  }
});

// Get product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: product.toJSON()
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching product',
      error: error.message
    });
  }
});

// Search products
router.get('/search/:term', async (req, res) => {
  try {
    const searchTerm = req.params.term;
    const limit = req.query.limit ? parseInt(req.query.limit) : 20;

    const products = await Product.search(searchTerm, limit);

    res.json({
      success: true,
      data: products.map(product => product.toJSON()),
      count: products.length,
      search_term: searchTerm
    });
  } catch (error) {
    console.error('Error searching products:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching products',
      error: error.message
    });
  }
});

// Get featured products
router.get('/featured/list', async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 8;
    const products = await Product.getFeatured(limit);

    res.json({
      success: true,
      data: products.map(product => product.toJSON()),
      count: products.length
    });
  } catch (error) {
    console.error('Error fetching featured products:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching featured products',
      error: error.message
    });
  }
});

// Create new product
router.post('/', async (req, res) => {
  try {
    const product = await Product.create(req.body);

    res.status(201).json({
      success: true,
      data: product.toJSON(),
      message: 'Product created successfully'
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating product',
      error: error.message
    });
  }
});

// Update product
router.put('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const updatedProduct = await product.update(req.body);

    res.json({
      success: true,
      data: updatedProduct.toJSON(),
      message: 'Product updated successfully'
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating product',
      error: error.message
    });
  }
});

// Delete product
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const deleted = await product.delete();

    if (deleted) {
      res.json({
        success: true,
        message: 'Product deleted successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Error deleting product'
      });
    }
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting product',
      error: error.message
    });
  }
});

// Get filter options
router.get('/filters/brands', async (req, res) => {
  try {
    const brands = await Product.getBrands();

    res.json({
      success: true,
      data: brands
    });
  } catch (error) {
    console.error('Error fetching brands:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching brands',
      error: error.message
    });
  }
});

router.get('/filters/sizes', async (req, res) => {
  try {
    const sizes = await Product.getSizes();

    res.json({
      success: true,
      data: sizes
    });
  } catch (error) {
    console.error('Error fetching sizes:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching sizes',
      error: error.message
    });
  }
});

router.get('/filters/colors', async (req, res) => {
  try {
    const colors = await Product.getColors();

    res.json({
      success: true,
      data: colors
    });
  } catch (error) {
    console.error('Error fetching colors:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching colors',
      error: error.message
    });
  }
});

router.get('/filters/product-types', async (req, res) => {
  try {
    const productTypes = await Product.getProductTypes();

    res.json({
      success: true,
      data: productTypes
    });
  } catch (error) {
    console.error('Error fetching product types:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching product types',
      error: error.message
    });
  }
});

router.get('/filters/genders', async (req, res) => {
  try {
    const genders = await Product.getGenders();

    res.json({
      success: true,
      data: genders
    });
  } catch (error) {
    console.error('Error fetching genders:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching genders',
      error: error.message
    });
  }
});

router.get('/filters/price-range', async (req, res) => {
  try {
    const priceRange = await Product.getPriceRange();

    res.json({
      success: true,
      data: priceRange
    });
  } catch (error) {
    console.error('Error fetching price range:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching price range',
      error: error.message
    });
  }
});

module.exports = router;
