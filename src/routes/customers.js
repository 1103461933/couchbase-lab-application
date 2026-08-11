const express = require('express');
const router = express.Router();
const customerService = require('../services/customer.service');
const { validateCustomer } = require('../utils/validators');

// GET /api/v1/customers
router.get('/', async (req, res, next) => {
  try {
    const { country, status, limit = 100 } = req.query;
    const customers = await customerService.getAll({ 
      country, 
      status, 
      limit: parseInt(limit) 
    });
    res.json({
      success: true,
      data: customers,
      count: customers.length
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/customers/:id
router.get('/:id', async (req, res, next) => {
  try {
    const customer = await customerService.getById(req.params.id);
    if (!customer) {
      return res.status(404).json({ 
        success: false, 
        error: 'Customer not found' 
      });
    }
    res.json({ success: true, data: customer });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/customers
router.post('/', async (req, res, next) => {
  try {
    const { error } = validateCustomer(req.body);
    if (error) {
      return res.status(400).json({ 
        success: false, 
        error: error.details[0].message 
      });
    }
    
    const result = await customerService.create(req.body);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

// PUT /api/v1/customers/:id
router.put('/:id', async (req, res, next) => {
  try {
    const result = await customerService.update(req.params.id, req.body);
    if (!result) {
      return res.status(404).json({ 
        success: false, 
        error: 'Customer not found' 
      });
    }
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/v1/customers/:id
router.delete('/:id', async (req, res, next) => {
  try {
    await customerService.delete(req.params.id);
    res.json({ 
      success: true, 
      message: `Customer ${req.params.id} deleted` 
    });
  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(404).json({ 
        success: false, 
        error: 'Customer not found' 
      });
    }
    next(error);
  }
});

module.exports = router;