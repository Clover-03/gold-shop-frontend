const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// GET latest price
router.get('/latest', async (req, res) => {
  try {
    const latestPrice = await prisma.Tb_Price.findFirst({
      orderBy: {
        Date: 'desc',
      },
    });
    if (!latestPrice) {
      return res.status(404).json({ message: 'No price data found.' });
    }
    res.json(toFrontendPrice(latestPrice));
  } catch (error) {
    console.error('Error fetching latest price:', error);
    res.status(500).json({ message: 'Error fetching latest price' });
  }
});

// Apply authentication middleware to all routes
router.use(authMiddleware);

// --- Data Transformation Helper ---
const toFrontendPrice = (dbPrice) => {
  if (!dbPrice) return null;
  return {
    id: dbPrice.Price_ID,
    date: dbPrice.Date,
    buyPrice: dbPrice.Buy_price,
    sellPrice: dbPrice.Sell_price
  };
};

// GET all prices
router.get('/', async (req, res) => {
  try {
    const prices = await prisma.Tb_Price.findMany({
      orderBy: { Date: 'desc' },
    });
    res.json(prices.map(toFrontendPrice));
  } catch (error) {
    console.error('Error fetching prices:', error);
    res.status(500).json({ message: 'ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນລາຄາ' });
  }
});

// GET single price by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const price = await prisma.Tb_Price.findUnique({
      where: { Price_ID: parseInt(id) },
    });

    if (!price) {
      return res.status(404).json({ message: 'ບໍ່ພົບຂໍ້ມູນລາຄາ' });
    }

    res.json(toFrontendPrice(price));
  } catch (error) {
    console.error('Error fetching price:', error);
    res.status(500).json({ message: 'ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນລາຄາ' });
  }
});

// POST a new price
router.post('/', async (req, res) => {
  try {
    const { buyPrice, sellPrice, date } = req.body;

    if (!buyPrice || !sellPrice) {
      return res.status(400).json({ message: 'ກະລຸນາປ້ອນລາຄາຊື້ແລະລາຄາຂາຍ' });
    }

    const priceData = {
      Buy_price: parseFloat(buyPrice),
      Sell_price: parseFloat(sellPrice),
    };

    if (date) {
      priceData.Date = new Date(date);
    }
    // If no date, Prisma uses the default value from schema

    const newPrice = await prisma.Tb_Price.create({
      data: priceData,
    });

    res.status(201).json(toFrontendPrice(newPrice));
  } catch (error) {
    console.error('Error creating price:', error);
    res.status(500).json({ message: 'ເກີດຂໍ້ຜິດພາດໃນການສ້າງຂໍ້ມູນລາຄາ' });
  }
});

// PUT update price by ID
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { buyPrice, sellPrice, date } = req.body;

    if (!buyPrice || !sellPrice) {
      return res.status(400).json({ message: 'ກະລຸນາປ້ອນລາຄາຊື້ແລະລາຄາຂາຍ' });
    }

    const updateData = {
      Buy_price: parseFloat(buyPrice),
      Sell_price: parseFloat(sellPrice),
    };

    if (date) {
      updateData.Date = new Date(date);
    }

    const updatedPrice = await prisma.Tb_Price.update({
      where: { Price_ID: parseInt(id) },
      data: updateData,
    });

    res.json(toFrontendPrice(updatedPrice));
  } catch (error) {
    console.error('Error updating price:', error);
    res.status(500).json({ message: 'ເກີດຂໍ້ຜິດພາດໃນການອັບເດດຂໍ້ມູນລາຄາ' });
  }
});

// DELETE price by ID
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.Tb_Price.delete({
      where: { Price_ID: parseInt(id) },
    });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting price:', error);
    res.status(500).json({ message: 'ເກີດຂໍ້ຜິດພາດໃນການລຶບຂໍ້ມູນລາຄາ' });
  }
});

// GET latest price
router.get('/latest/current', async (req, res) => {
  try {
    const latestPrice = await prisma.Tb_Price.findFirst({
      orderBy: { Date: 'desc' },
    });

    if (!latestPrice) {
      return res.status(404).json({ message: 'ບໍ່ພົບຂໍ້ມູນລາຄາ' });
    }

    res.json(toFrontendPrice(latestPrice));
  } catch (error) {
    console.error('Error fetching latest price:', error);
    res.status(500).json({ message: 'ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນລາຄາລ່າສຸດ' });
  }
});

module.exports = router; 