const express = require('express');
const router = express.Router();
const repurchaseController = require('../controllers/repurchase.controller');
const authMiddleware = require('../middleware/auth');

// GET /api/repurchases - Get all repurchases
router.get('/', authMiddleware, repurchaseController.getAllRepurchases);

// GET /api/repurchases/:id - Get a single repurchase by ID
router.get('/:id', authMiddleware, repurchaseController.getRepurchaseById);

// POST /api/repurchases - Create a new repurchase
router.post('/', authMiddleware, repurchaseController.createRepurchase);

// PUT /api/repurchases/:id - Update a repurchase
router.put('/:id', authMiddleware, repurchaseController.updateRepurchase);

// DELETE /api/repurchases/:id - Delete a repurchase
router.delete('/:id', authMiddleware, repurchaseController.deleteRepurchase);

module.exports = router; 