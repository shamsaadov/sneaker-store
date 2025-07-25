const express = require('express');
const router = express.Router();
const Category = require('../models/Category');

// Get all categories
router.get('/', async (req, res) => {
  try {
    const categories = await Category.findAll();

    res.json({
      success: true,
      data: categories.map(category => category.toJSON()),
      count: categories.length
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching categories',
      error: error.message
    });
  }
});

// Get category by ID
router.get('/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.json({
      success: true,
      data: category.toJSON()
    });
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching category',
      error: error.message
    });
  }
});

// Get category by slug
router.get('/slug/:slug', async (req, res) => {
  try {
    const category = await Category.findBySlug(req.params.slug);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.json({
      success: true,
      data: category.toJSON()
    });
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching category',
      error: error.message
    });
  }
});

// Get products in category
router.get('/:id/products', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    const filters = {
      search: req.query.search,
      brands: req.query.brands ? req.query.brands.split(',') : null,
      sizes: req.query.sizes ? req.query.sizes.split(',').map(Number) : null,
      min_price: req.query.min_price ? parseFloat(req.query.min_price) : null,
      max_price: req.query.max_price ? parseFloat(req.query.max_price) : null,
      in_stock: req.query.in_stock === 'true',
      sort_by: req.query.sort_by || 'name',
      sort_order: req.query.sort_order || 'asc',
      limit: req.query.limit ? parseInt(req.query.limit) : null,
      offset: req.query.offset ? parseInt(req.query.offset) : null
    };

    const products = await category.getProducts(filters);

    res.json({
      success: true,
      data: {
        category: category.toJSON(),
        products: products.map(product => product.toJSON())
      },
      count: products.length
    });
  } catch (error) {
    console.error('Error fetching category products:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching category products',
      error: error.message
    });
  }
});

// Create new category (admin only)
router.post('/', async (req, res) => {
  try {
    // TODO: Add authentication middleware
    const { name, description, image, product_type, productType } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required'
      });
    }

    // Generate slug from name
    let slug = Category.generateSlug(name);

    // Ensure slug is unique
    let slugCounter = 1;
    let originalSlug = slug;
    while (!(await Category.isSlugUnique(slug))) {
      slug = `${originalSlug}-${slugCounter}`;
      slugCounter++;
    }

    const categoryData = {
      name,
      slug,
      description,
      image,
      product_type: product_type || productType || 'footwear'
    };

    const category = await Category.create(categoryData);

    res.status(201).json({
      success: true,
      data: category.toJSON(),
      message: 'Category created successfully'
    });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating category',
      error: error.message
    });
  }
});

// Update category (admin only)
router.put('/:id', async (req, res) => {
  try {
    // TODO: Add authentication middleware
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    const updateData = {};
    const allowedFields = ['name', 'slug', 'description', 'image', 'product_type', 'productType'];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        if (field === 'productType') {
          updateData['product_type'] = req.body[field];
        } else {
          updateData[field] = req.body[field];
        }
      }
    });

    // If name is being updated, regenerate slug if slug is not provided
    if (updateData.name && !updateData.slug) {
      let newSlug = Category.generateSlug(updateData.name);

      // Ensure slug is unique (excluding current category)
      let slugCounter = 1;
      let originalSlug = newSlug;
      while (!(await Category.isSlugUnique(newSlug, category.id))) {
        newSlug = `${originalSlug}-${slugCounter}`;
        slugCounter++;
      }

      updateData.slug = newSlug;
    }

    // If slug is being updated, check uniqueness
    if (updateData.slug && !(await Category.isSlugUnique(updateData.slug, category.id))) {
      return res.status(400).json({
        success: false,
        message: 'Slug already exists'
      });
    }

    const updatedCategory = await category.update(updateData);

    res.json({
      success: true,
      data: updatedCategory.toJSON(),
      message: 'Category updated successfully'
    });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating category',
      error: error.message
    });
  }
});

// Delete category (admin only)
router.delete('/:id', async (req, res) => {
  try {
    // TODO: Add authentication middleware
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    await category.delete();

    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    if (error.message.includes('Cannot delete category with existing products')) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete category that contains products'
      });
    }

    console.error('Error deleting category:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting category',
      error: error.message
    });
  }
});

module.exports = router;
