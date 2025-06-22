const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const authMiddleware = require('../middleware/auth');

// Apply auth middleware to all product routes
router.use(authMiddleware);

// --- Data Transformation Helpers ---

// Converts a database product object to a frontend-friendly format
const toFrontendProduct = (dbProduct) => {
  if (!dbProduct) return null;
  return {
    id: dbProduct.Pd_ID, // Frontend uses 'id' for keys and PUT/DELETE URLs
    code: dbProduct.Pd_ID,
    name: dbProduct.Pd_name,
    category: dbProduct.Type,
    weight: dbProduct.Weight,
    estimatePrice: dbProduct.Making_charge,
    Re_ID: dbProduct.Re_ID, // Include the Repurchase ID
    status: dbProduct.status,
  };
};

// Converts a frontend product object to a format for Prisma create/update
const toBackendData = (frontendProduct) => {
  // Ensure estimatePrice is a valid number before parsing
  const estimatePrice = frontendProduct.estimatePrice ? 
    parseFloat(String(frontendProduct.estimatePrice).replace(/,/g, '')) : 0;
  
  return {
    Pd_name: frontendProduct.name,
    Type: frontendProduct.category,
    Weight: frontendProduct.weight,
    Making_charge: isNaN(estimatePrice) ? 0 : estimatePrice,
  };
};

// GET all products
router.get('/', async (req, res) => {
  try {
    const products = await prisma.tb_Product.findMany();
    res.json(products.map(toFrontendProduct));
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: 'Something went wrong while fetching products' });
  }
});

// GET all available (unsold) products
router.get('/available', async (req, res) => {
    try {
        const products = await prisma.tb_Product.findMany({
            where: {
                Tb_Sell: null, // Check if the product is not in any sale record
                Re_ID: null, // Check if the product has not been repurchased
            },
            orderBy: {
                Pd_name: 'asc'
            }
        });
        // We don't need to map to frontend format here, 
        // because the 'add sale' page needs the full product object.
        res.json(products);
    } catch (error) {
        console.error("Error fetching available products:", error);
        res.status(500).json({ message: "Could not fetch available products" });
    }
});

// GET product by ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const product = await prisma.tb_Product.findUnique({
            where: { Pd_ID: id },
        });
        if (product) {
            res.json(toFrontendProduct(product));
        } else {
            res.status(404).json({ error: 'Product not found' });
        }
    } catch (error) {
        console.error(`Error fetching product ${id}:`, error);
        res.status(500).json({ error: 'Something went wrong' });
    }
});

// POST create new product
router.post('/', async (req, res) => {
  try {
    const frontendProduct = req.body;
    // For CREATE, we need the ID from the `code` field.
    const newProductData = {
      Pd_ID: frontendProduct.code,
      ...toBackendData(frontendProduct),
    };

    const newProduct = await prisma.tb_Product.create({
      data: newProductData,
    });
    res.status(201).json(toFrontendProduct(newProduct));
  } catch (error) {
    console.error("Error creating product:", error);
    // Check for unique constraint violation (P2002)
    if (error.code === 'P2002') {
      return res.status(409).json({ message: 'ລະຫັດສິນຄ້ານີ້ມີຢູ່ແລ້ວ' });
    }
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// PUT update product
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // For UPDATE, the ID (code) cannot be changed.
    // We only convert the other fields.
    const updatedProductData = toBackendData(req.body);

    const updatedProduct = await prisma.tb_Product.update({
      where: { Pd_ID: id },
      data: updatedProductData,
    });
    res.json(toFrontendProduct(updatedProduct));
  } catch (error) {
    console.error(`Error updating product ${id}:`, error);
    res.status(404).json({ error: 'Product not found or invalid data' });
  }
});

// DELETE product
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.tb_Product.delete({
      where: { Pd_ID: id },
    });
    res.status(204).send();
  } catch (error) {
    res.status(404).json({ error: 'Product not found' });
  }
});

module.exports = router; 

module.exports.toFrontendProduct = toFrontendProduct; 