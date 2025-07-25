const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

// Helper function for API responses
const apiResponse = (success, data = null, message = '', status = 200) => ({
  success,
  data,
  message,
  timestamp: new Date().toISOString()
});

// Get all orders with filters
router.get('/', async (req, res) => {
  try {
    const filters = {
      status: req.query.status,
      search: req.query.search,
      start_date: req.query.start_date,
      end_date: req.query.end_date,
      sort_by: req.query.sort_by || 'created_at',
      sort_order: req.query.sort_order || 'desc',
      limit: req.query.limit ? parseInt(req.query.limit) : undefined,
      offset: req.query.offset ? parseInt(req.query.offset) : undefined
    };

    const orders = await Order.findAll(filters);
    res.json(apiResponse(true, orders.map(order => order.toJSON())));
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json(apiResponse(false, null, 'Failed to fetch orders'));
  }
});

// Get order by ID
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json(apiResponse(false, null, 'Order not found'));
    }
    res.json(apiResponse(true, order.toJSON()));
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json(apiResponse(false, null, 'Failed to fetch order'));
  }
});

// Get order by order number
router.get('/number/:orderNumber', async (req, res) => {
  try {
    const order = await Order.findByOrderNumber(req.params.orderNumber);
    if (!order) {
      return res.status(404).json(apiResponse(false, null, 'Order not found'));
    }
    res.json(apiResponse(true, order.toJSON()));
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json(apiResponse(false, null, 'Failed to fetch order'));
  }
});

// Create new order
router.post('/', async (req, res) => {
  try {
    const {
      customer_name,
      customer_phone,
      shipping_address,
      payment_method,
      items,
      notes
    } = req.body;

    // Validation
    if (!customer_name || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json(apiResponse(false, null, 'Missing required fields: customer_name, items'));
    }

    // Validate items
    for (const item of items) {
      if (!item.id || !item.name || !item.price || !item.quantity || item.quantity <= 0) {
        return res.status(400).json(apiResponse(false, null, 'Invalid item data'));
      }
    }

    // Calculate totals
    const totals = Order.calculateTotals(items, 500); // 500 руб за доставку

    const orderData = {
      customer_name: customer_name.trim(),
      customer_phone: customer_phone ? customer_phone.trim() : '',
      shipping_address: shipping_address ? shipping_address.trim() : '',
      payment_method: payment_method || 'cash',
      items,
      notes: notes ? notes.trim() : '',
      ...totals
    };

    const order = await Order.create(orderData);

    console.log(`New order created: ${order.order_number} for ${order.customer_name}`);

    res.status(201).json(apiResponse(true, order.toJSON(), 'Order created successfully'));
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json(apiResponse(false, null, 'Failed to create order'));
  }
});

// Update order
router.put('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json(apiResponse(false, null, 'Order not found'));
    }

    const updateData = {};
    const allowedFields = [
      'customer_name', 'customer_email', 'customer_phone',
      'shipping_address', 'payment_method', 'status', 'notes'
    ];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    // Status validation
    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
    if (updateData.status && !validStatuses.includes(updateData.status)) {
      return res.status(400).json(apiResponse(false, null, 'Invalid status'));
    }

    const updatedOrder = await order.update(updateData);
    res.json(apiResponse(true, updatedOrder.toJSON(), 'Order updated successfully'));
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json(apiResponse(false, null, 'Failed to update order'));
  }
});

// Update order status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status, notes } = req.body;

    if (!status) {
      return res.status(400).json(apiResponse(false, null, 'Status is required'));
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json(apiResponse(false, null, 'Order not found'));
    }

    const updatedOrder = await order.updateStatus(status, notes || '');
    res.json(apiResponse(true, updatedOrder.toJSON(), 'Order status updated successfully'));
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json(apiResponse(false, null, 'Failed to update order status'));
  }
});

// Delete order
router.delete('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json(apiResponse(false, null, 'Order not found'));
    }

    await order.delete();
    res.json(apiResponse(true, null, 'Order deleted successfully'));
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json(apiResponse(false, null, 'Failed to delete order'));
  }
});



// Get pending orders
router.get('/admin/pending', async (req, res) => {
  try {
    const orders = await Order.getPending();
    res.json(apiResponse(true, orders.map(order => order.toJSON())));
  } catch (error) {
    console.error('Error fetching pending orders:', error);
    res.status(500).json(apiResponse(false, null, 'Failed to fetch pending orders'));
  }
});

// Get recent orders
router.get('/admin/recent', async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const orders = await Order.getRecent(limit);
    res.json(apiResponse(true, orders.map(order => order.toJSON())));
  } catch (error) {
    console.error('Error fetching recent orders:', error);
    res.status(500).json(apiResponse(false, null, 'Failed to fetch recent orders'));
  }
});

// Get order statistics
router.get('/admin/statistics', async (req, res) => {
  try {
    const stats = await Order.getStatistics();
    res.json(apiResponse(true, stats));
  } catch (error) {
    console.error('Error fetching order statistics:', error);
    res.status(500).json(apiResponse(false, null, 'Failed to fetch order statistics'));
  }
});

module.exports = router;
