const express = require('express');
const router = express.Router();
const SpecialOrder = require('../models/SpecialOrder');

// Helper function for API responses
const apiResponse = (success, data = null, message = '', status = 200) => ({
  success,
  data,
  message,
  timestamp: new Date().toISOString()
});

// Get all special orders with filters
router.get('/', async (req, res) => {
  try {
    const filters = {
      status: req.query.status,
      urgency: req.query.urgency,
      search: req.query.search,
      start_date: req.query.start_date,
      end_date: req.query.end_date,
      sort_by: req.query.sort_by || 'created_at',
      sort_order: req.query.sort_order || 'desc',
      limit: req.query.limit ? parseInt(req.query.limit) : undefined,
      offset: req.query.offset ? parseInt(req.query.offset) : undefined
    };

    const orders = await SpecialOrder.findAll(filters);
    res.json(apiResponse(true, orders.map(order => order.toJSON())));
  } catch (error) {
    console.error('Error fetching special orders:', error);
    res.status(500).json(apiResponse(false, null, 'Failed to fetch special orders'));
  }
});

// Get special order by ID
router.get('/:id', async (req, res) => {
  try {
    const order = await SpecialOrder.findById(req.params.id);
    if (!order) {
      return res.status(404).json(apiResponse(false, null, 'Special order not found'));
    }
    res.json(apiResponse(true, order.toJSON()));
  } catch (error) {
    console.error('Error fetching special order:', error);
    res.status(500).json(apiResponse(false, null, 'Failed to fetch special order'));
  }
});

// Create new special order
router.post('/', async (req, res) => {
  try {
    const {
      name,
      phone,
      brand,
      model,
      size,
      color,
      budget,
      urgency,
      description,
      images
    } = req.body;

    // Validation
    if (!name || !phone || !brand || !model) {
      return res.status(400).json(apiResponse(false, null, 'Missing required fields: name, phone, brand, model'));
    }

    // Urgency validation
    const validUrgencies = ['normal', 'urgent', 'emergency'];
    if (urgency && !validUrgencies.includes(urgency)) {
      return res.status(400).json(apiResponse(false, null, 'Invalid urgency level'));
    }

    const orderData = {
      name: name.trim(),
      phone: phone.trim(),
      brand: brand.trim(),
      model: model.trim(),
      size: size ? size.trim() : '',
      color: color ? color.trim() : '',
      budget: budget ? budget.trim() : '',
      urgency: urgency || 'normal',
      description: description ? description.trim() : '',
      images: Array.isArray(images) ? images.filter(img => img && img.trim()) : []
    };

    const order = await SpecialOrder.create(orderData);

    // TODO: Send email notification to customer and admin
    console.log(`New special order created: ${order.id} for ${order.email}`);

    res.status(201).json(apiResponse(true, order.toJSON(), 'Special order created successfully'));
  } catch (error) {
    console.error('Error creating special order:', error);
    res.status(500).json(apiResponse(false, null, 'Failed to create special order'));
  }
});

// Update special order
router.put('/:id', async (req, res) => {
  try {
    const order = await SpecialOrder.findById(req.params.id);
    if (!order) {
      return res.status(404).json(apiResponse(false, null, 'Special order not found'));
    }

    const updateData = {};
    const allowedFields = [
      'status', 'admin_notes', 'estimated_price', 'estimated_delivery',
      'found_product_url', 'urgency'
    ];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    // Status validation
    const validStatuses = ['new', 'in_progress', 'quoted', 'confirmed', 'found', 'ordered', 'delivered', 'completed', 'cancelled'];
    if (updateData.status && !validStatuses.includes(updateData.status)) {
      return res.status(400).json(apiResponse(false, null, 'Invalid status'));
    }

    const updatedOrder = await order.update(updateData);
    res.json(apiResponse(true, updatedOrder.toJSON(), 'Special order updated successfully'));
  } catch (error) {
    console.error('Error updating special order:', error);
    res.status(500).json(apiResponse(false, null, 'Failed to update special order'));
  }
});

// Update order status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status, admin_notes } = req.body;

    if (!status) {
      return res.status(400).json(apiResponse(false, null, 'Status is required'));
    }

    const order = await SpecialOrder.findById(req.params.id);
    if (!order) {
      return res.status(404).json(apiResponse(false, null, 'Special order not found'));
    }

    const updatedOrder = await order.updateStatus(status, admin_notes || '');
    res.json(apiResponse(true, updatedOrder.toJSON(), 'Order status updated successfully'));
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json(apiResponse(false, null, 'Failed to update order status'));
  }
});

// Set price and delivery estimate
router.patch('/:id/estimate', async (req, res) => {
  try {
    const { estimated_price, estimated_delivery, admin_notes } = req.body;

    if (!estimated_price) {
      return res.status(400).json(apiResponse(false, null, 'Estimated price is required'));
    }

    const order = await SpecialOrder.findById(req.params.id);
    if (!order) {
      return res.status(404).json(apiResponse(false, null, 'Special order not found'));
    }

    const updatedOrder = await order.setEstimate(estimated_price, estimated_delivery, admin_notes || '');
    res.json(apiResponse(true, updatedOrder.toJSON(), 'Estimate set successfully'));
  } catch (error) {
    console.error('Error setting estimate:', error);
    res.status(500).json(apiResponse(false, null, 'Failed to set estimate'));
  }
});

// Mark order as found
router.patch('/:id/found', async (req, res) => {
  try {
    const { found_product_url, final_price, admin_notes } = req.body;

    if (!found_product_url) {
      return res.status(400).json(apiResponse(false, null, 'Product URL is required'));
    }

    const order = await SpecialOrder.findById(req.params.id);
    if (!order) {
      return res.status(404).json(apiResponse(false, null, 'Special order not found'));
    }

    const updatedOrder = await order.markAsFound(found_product_url, final_price, admin_notes || '');
    res.json(apiResponse(true, updatedOrder.toJSON(), 'Product marked as found'));
  } catch (error) {
    console.error('Error marking as found:', error);
    res.status(500).json(apiResponse(false, null, 'Failed to mark as found'));
  }
});

// Delete special order
router.delete('/:id', async (req, res) => {
  try {
    const order = await SpecialOrder.findById(req.params.id);
    if (!order) {
      return res.status(404).json(apiResponse(false, null, 'Special order not found'));
    }

    await order.delete();
    res.json(apiResponse(true, null, 'Special order deleted successfully'));
  } catch (error) {
    console.error('Error deleting special order:', error);
    res.status(500).json(apiResponse(false, null, 'Failed to delete special order'));
  }
});



// Get urgent orders
router.get('/admin/urgent', async (req, res) => {
  try {
    const orders = await SpecialOrder.getUrgentOrders();
    res.json(apiResponse(true, orders.map(order => order.toJSON())));
  } catch (error) {
    console.error('Error fetching urgent orders:', error);
    res.status(500).json(apiResponse(false, null, 'Failed to fetch urgent orders'));
  }
});

// Get statistics
router.get('/admin/statistics', async (req, res) => {
  try {
    const stats = await SpecialOrder.getStatistics();
    res.json(apiResponse(true, stats));
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json(apiResponse(false, null, 'Failed to fetch statistics'));
  }
});

module.exports = router;
