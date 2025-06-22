const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// --- Data Transformation Helpers ---

// Converts a database supplier object to a frontend-friendly format
const toFrontendSupplier = (dbSupplier) => {
  if (!dbSupplier) return null;
  return {
    id: dbSupplier.Sup_ID, // Frontend uses 'id'
    code: dbSupplier.Sup_ID,
    name: dbSupplier.Sup_name,
    phone: dbSupplier.Phone,
    address: dbSupplier.Address,
  };
};

// Converts a frontend supplier object to a format for Prisma create/update
const toBackendData = (frontendSupplier) => {
  return {
    Sup_name: frontendSupplier.name,
    Phone: frontendSupplier.phone,
    Address: frontendSupplier.address,
  };
};

// GET all suppliers
router.get('/', async (req, res) => {
  try {
    const suppliers = await prisma.tb_Supplier.findMany({
      orderBy: { Sup_name: 'asc' },
    });
    res.json(suppliers.map(toFrontendSupplier));
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    res.status(500).json({ message: 'ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນຜູ້ສະໜອງ' });
  }
});

// POST a new supplier
router.post('/', async (req, res) => {
  try {
    const frontendSupplier = req.body;
    const newSupplierData = {
      Sup_ID: frontendSupplier.code, // Get ID from frontend 'code' field
      ...toBackendData(frontendSupplier),
    };
    const newSupplier = await prisma.tb_Supplier.create({
      data: newSupplierData,
    });
    res.status(201).json(toFrontendSupplier(newSupplier));
  } catch (error) {
    console.error('Error creating supplier:', error);
    if (error.code === 'P2002') {
      return res.status(409).json({ message: 'ລະຫັດຜູ້ສະໜອງນີ້ມີຢູ່ແລ້ວ' });
    }
    res.status(500).json({ message: 'ເກີດຂໍ້ຜິດພາດໃນການສ້າງຂໍ້ມູນຜູ້ສະໜອງ' });
  }
});

// PUT update supplier by ID
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = toBackendData(req.body);
    const updatedSupplier = await prisma.tb_Supplier.update({
      where: { Sup_ID: id },
      data: updateData,
    });
    res.json(toFrontendSupplier(updatedSupplier));
  } catch (error) {
    console.error(`Error updating supplier ${id}:`, error);
    res.status(500).json({ message: 'ເກີດຂໍ້ຜິດພາດໃນການອັບເດດຂໍ້ມູນຜູ້ສະໜອງ' });
  }
});

// DELETE supplier by ID
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.tb_Supplier.delete({
      where: { Sup_ID: id },
    });
    res.status(204).send();
  } catch (error) {
    console.error(`Error deleting supplier ${id}:`, error);
    res.status(500).json({ message: 'ເກີດຂໍ້ຜິດພາດໃນການລຶບຂໍ້ມູນຜູ້ສະໜອງ' });
  }
});

module.exports = router; 