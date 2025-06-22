const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');
const { toFrontendProduct } = require('./products.js');

const router = express.Router();
const prisma = new PrismaClient();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// --- Data Transformation Helpers ---

// Converts a database customer object to a frontend-friendly format
const toFrontendCustomer = (dbCustomer) => {
  if (!dbCustomer) return null;
  return {
    id: dbCustomer.Cust_ID, // Frontend uses 'id' for keys
    code: dbCustomer.Cust_ID,
    name: dbCustomer.Cust_name,
    phone: dbCustomer.Phone,
    address: dbCustomer.Address,
  };
};

// Converts a frontend customer object to a format for Prisma create/update
const toBackendData = (frontendCustomer) => {
  return {
    Cust_name: frontendCustomer.name,
    Phone: frontendCustomer.phone,
    Address: frontendCustomer.address,
  };
};

// GET all customers
router.get('/', async (req, res) => {
  try {
    const customers = await prisma.tb_Customer.findMany({
      orderBy: { Cust_name: 'asc' },
    });
    res.json(customers.map(toFrontendCustomer));
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ message: 'ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນລູກຄ້າ' });
  }
});

// GET single customer by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const customer = await prisma.tb_Customer.findUnique({
      where: { Cust_ID: id },
    });
    if (!customer) {
      return res.status(404).json({ message: 'ບໍ່ພົບຂໍ້ມູນລູກຄ້າ' });
    }
    res.json(toFrontendCustomer(customer));
  } catch (error) {
    console.error(`Error fetching customer ${id}:`, error);
    res.status(500).json({ message: 'ເກີດຂໍ້ຜິດພາດ' });
  }
});

// GET all products sold to a specific customer that are available for repurchase
router.get('/:id/products', async (req, res) => {
  const { id: custId } = req.params;
  try {
    // Step 1: Find all sale records for the given customer
    const sales = await prisma.tb_Sell.findMany({
      where: {
        Cust_ID: custId,
        // Ensure the sale has an associated product
        // Pd_ID: { not: null }, // Removed this line
      },
      select: {
        Pd_ID: true, // Select only the product IDs
      },
    });

    if (sales.length === 0) {
      return res.json([]); // Return an empty array if the customer has bought nothing
    }

    const productIds = sales.map(sale => sale.Pd_ID);

    // Step 2: Find all products from the sales list that have NOT been repurchased yet
    const productsForRepurchase = await prisma.tb_Product.findMany({
      where: {
        Pd_ID: { in: productIds },
        Re_ID: null, // This is the crucial filter
      },
    });

    // Step 3: Transform data to frontend format before sending
    res.json(productsForRepurchase.map(toFrontendProduct));

  } catch (error) {
    console.error(`Error fetching products for customer ${custId}:`, error);
    res.status(500).json({ message: 'ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນສິນຄ້າຂອງລູກຄ້າ' });
  }
});

// POST a new customer
router.post('/', async (req, res) => {
  try {
    const frontendCustomer = req.body;
    const newCustomerData = {
      Cust_ID: frontendCustomer.code, // Get ID from frontend 'code' field
      ...toBackendData(frontendCustomer),
    };
    const newCustomer = await prisma.tb_Customer.create({
      data: newCustomerData,
    });
    res.status(201).json(toFrontendCustomer(newCustomer));
  } catch (error) {
    console.error('Error creating customer:', error);
    if (error.code === 'P2002') {
      return res.status(409).json({ message: 'ລະຫັດລູກຄ້ານີ້ມີຢູ່ແລ້ວ' });
    }
    res.status(500).json({ message: 'ເກີດຂໍ້ຜິດພາດໃນການສ້າງຂໍ້ມູນລູກຄ້າ' });
  }
});

// PUT update customer by ID
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = toBackendData(req.body);
    const updatedCustomer = await prisma.tb_Customer.update({
      where: { Cust_ID: id },
      data: updateData,
    });
    res.json(toFrontendCustomer(updatedCustomer));
  } catch (error) {
    console.error(`Error updating customer ${id}:`, error);
    res.status(500).json({ message: 'ເກີດຂໍ້ຜິດພາດໃນການອັບເດດຂໍ້ມູນລູກຄ້າ' });
  }
});

// DELETE customer by ID
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.tb_Customer.delete({
      where: { Cust_ID: id },
    });
    res.status(204).send();
  } catch (error) {
    console.error(`Error deleting customer ${id}:`, error);
    res.status(500).json({ message: 'ເກີດຂໍ້ຜິດພາດໃນການລຶບຂໍ້ມູນລູກຄ້າ' });
  }
});

module.exports = router; 