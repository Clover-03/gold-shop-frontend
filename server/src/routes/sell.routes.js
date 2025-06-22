const express = require('express');
const router = express.Router();
const sellController = require('../controllers/sell.controller');
const authMiddleware = require('../middleware/auth');

// Protect all sell routes
router.use(authMiddleware);

// GET /api/sells - Get all sales records
router.get('/', sellController.getAllSells);

// GET /api/sells/:id - Get a single sale by ID
router.get('/:id', sellController.getSellById);

// POST /api/sells - Create a new sale transaction
router.post('/', sellController.createSell);

// PUT /api/sells/:id - Update a sale
router.put('/:id', sellController.updateSell);

// DELETE /api/sells/:id - Revert a sale
router.delete('/:id', sellController.deleteSell);

module.exports = router; 