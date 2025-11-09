const express = require('express');
const router = express.Router();
const Category = require('../models/Category');

// Get all categories (flat list or tree)
router.get('/', async (req, res) => {
  try {
    const { format } = req.query; // format=tree for hierarchical structure
    
    let categories;
    if (format === 'tree') {
      categories = await Category.findAllTree();
    } else {
      categories = await Category.findAll();
    }

    res.json({
      success: true,
      data: categories.map(category => category.toJSON ? category.toJSON() : category),
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

// Get root categories only
router.get('/root', async (req, res) => {
  try {
    const categories = await Category.findRootCategories();

    res.json({
      success: true,
      data: categories.map(category => category.toJSON()),
      count: categories.length
    });
  } catch (error) {
    console.error('Error fetching root categories:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching root categories',
      error: error.message
    });
  }
});

// Get categories by level
router.get('/level/:level', async (req, res) => {
  try {
    const level = parseInt(req.params.level);
    
    if (isNaN(level) || level < 0 || level > 2) {
      return res.status(400).json({
        success: false,
        message: 'Invalid level. Must be 0 (root), 1 (category), or 2 (subcategory)'
      });
    }

    const categories = await Category.findByLevel(level);

    res.json({
      success: true,
      data: categories.map(category => category.toJSON()),
      count: categories.length
    });
  } catch (error) {
    console.error('Error fetching categories by level:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching categories by level',
      error: error.message
    });
  }
});

// Get children of a category
router.get('/:id/children', async (req, res) => {
  try {
    const children = await Category.findByParent(req.params.id);

    res.json({
      success: true,
      data: children.map(category => category.toJSON()),
      count: children.length
    });
  } catch (error) {
    console.error('Error fetching category children:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching category children',
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
    const { name, description, image, product_type, productType, parent_id, parentId } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required'
      });
    }

    const finalParentId = parent_id || parentId;

    // Validate parent category if provided
    if (finalParentId) {
      const parent = await Category.findById(finalParentId);
      if (!parent) {
        return res.status(400).json({
          success: false,
          message: 'Parent category not found'
        });
      }
      
      // Check if parent is at max level
      if (parent.level >= 2) {
        return res.status(400).json({
          success: false,
          message: 'Cannot create subcategory. Maximum depth (3 levels) reached.'
        });
      }
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
      product_type: product_type || productType || 'footwear',
      parent_id: finalParentId || null
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
    const allowedFields = ['name', 'slug', 'description', 'image', 'product_type', 'productType', 'parent_id', 'parentId'];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        if (field === 'productType') {
          updateData['product_type'] = req.body[field];
        } else if (field === 'parentId') {
          updateData['parent_id'] = req.body[field];
        } else {
          updateData[field] = req.body[field];
        }
      }
    });

    // Validate parent_id if being updated
    if (updateData.parent_id !== undefined) {
      if (updateData.parent_id) {
        // Check parent exists
        const parent = await Category.findById(updateData.parent_id);
        if (!parent) {
          return res.status(400).json({
            success: false,
            message: 'Parent category not found'
          });
        }

        // Prevent circular reference
        if (updateData.parent_id === category.id) {
          return res.status(400).json({
            success: false,
            message: 'Category cannot be its own parent'
          });
        }

        // Check if parent is descendant (would create cycle)
        const descendants = await category.getAllDescendants();
        if (descendants.find(d => d.id === updateData.parent_id)) {
          return res.status(400).json({
            success: false,
            message: 'Cannot set descendant as parent (would create circular reference)'
          });
        }

        // Recalculate level
        updateData.level = parent.level + 1;
        if (updateData.level > 2) {
          return res.status(400).json({
            success: false,
            message: 'Maximum category depth (3 levels) exceeded'
          });
        }
      } else {
        // Setting parent_id to null (making it root)
        updateData.level = 0;
      }
    }

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
    
    if (error.message.includes('Cannot delete category with subcategories')) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete category that has subcategories. Delete subcategories first.'
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
