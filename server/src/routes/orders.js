const express = require('express');
const { PrismaClient, Prisma } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

router.use(authMiddleware);

// --- Data Transformation Helper ---
const toFrontendOrder = (dbOrder) => {
  if (!dbOrder) return null;

  // Calculate Total_Price
  const totalPrice = dbOrder.Tb_Order_Product?.reduce((sum, item) => {
    const price = Number(item.Buy_price || 0);
    const quantity = Number(item.Quantity || 0);
    const discount = Number(item.Discount || 0);
    return sum + ((price * quantity) - discount);
  }, 0) || 0;

  return {
    Order_ID: dbOrder.Order_ID,
    Order_Date: dbOrder.Order_Date,
    Sup_ID: dbOrder.Sup_ID,
    Sup_name: dbOrder.Tb_Supplier?.Sup_name,
    status: dbOrder.Status,
    Total_Price: totalPrice,
    Tb_Supplier: dbOrder.Tb_Supplier,
    products: dbOrder.Tb_Order_Product?.map(op => ({
      Pd_ID: op.Tb_Product?.Pd_ID,
      Pd_name: op.Tb_Product?.Pd_name,
      Type: op.Tb_Product?.Type,
      Weight: op.Tb_Product?.Weight,
      makingCharge: op.Tb_Product?.Making_charge,
      price: op.Tb_Product?.Tb_Price,
      quantity: op.Quantity,
      buyPrice: op.Buy_price,
      discount: op.Discount,
    })) || [],
  };
};

// GET all orders
router.get('/', async (req, res) => {
  try {
    const { status } = req.query; // Get status from query params

    const whereClause = {};
    if (status) {
      whereClause.Status = status; // Filter by status if provided
    }
    
    // 1. Fetch the latest gold price
    const latestPrice = await prisma.Tb_Price.findFirst({
      orderBy: {
        Date: 'desc',
      },
    });

    // 2. Fetch all orders with optional filtering
    const orders = await prisma.Tb_Order.findMany({
      where: whereClause, // Apply the filter
      include: {
        Tb_Supplier: true,
        Tb_Order_Product: {
          include: {
            Tb_Product: {
              include: {
                Tb_Price: true,
              },
            },
          },
        },
      },
      orderBy: { Order_Date: 'desc' },
    });

    // 3. Send both back to the client
    res.json({
      orders: orders.map(toFrontendOrder),
      latestPrice: latestPrice, // Send the latest price object
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Error fetching orders' });
  }
});

// POST create a new order
router.post('/', async (req, res) => {
  const { Sup_ID, Order_Date, status, products } = req.body;

  if (!Sup_ID || !Order_Date || !status || !products || !Array.isArray(products) || products.length === 0) {
    return res.status(400).json({ message: 'Missing required fields for order creation.' });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.Tb_Order.create({
        data: {
          Sup_ID,
          Order_Date: new Date(Order_Date),
          Status: status,
        },
      });

      const orderProductsData = products.map(p => ({
        Order_ID: newOrder.Order_ID,
        Pd_ID: p.id,
        Quantity: Number(p.quantity),
        Buy_price: new Prisma.Decimal(p.buyPrice),
        Discount: p.discount,
      }));

      await tx.Tb_Order_Product.createMany({
        data: orderProductsData,
      });

      return newOrder;
    });

    const createdOrder = await prisma.Tb_Order.findUnique({
      where: { Order_ID: result.Order_ID },
      include: {
        Tb_Supplier: true,
        Tb_Order_Product: { include: { Tb_Product: { include: { Tb_Price: true } } } },
      },
    });

    res.status(201).json(toFrontendOrder(createdOrder));
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Failed to create order.' });
  }
});

// PUT update an existing order
router.put('/:id', async (req, res) => {
    const orderId = parseInt(req.params.id, 10);
    const { Sup_ID, Order_Date, status, products } = req.body;

    if (!Sup_ID || !Order_Date || !status || !products || !Array.isArray(products)) {
        return res.status(400).json({ message: 'Missing required fields for order update.' });
    }

    try {
        const result = await prisma.$transaction(async (tx) => {
            const updatedOrder = await tx.Tb_Order.update({
                where: { Order_ID: orderId },
                data: {
                    Sup_ID,
                    Order_Date: new Date(Order_Date),
                    Status: status,
                },
            });

            await tx.Tb_Order_Product.deleteMany({
                where: { Order_ID: orderId },
            });

            if (products.length > 0) {
                const orderProductsData = products.map(p => ({
                    Order_ID: updatedOrder.Order_ID,
                    Pd_ID: p.id,
                    Quantity: Number(p.quantity),
                    Buy_price: new Prisma.Decimal(p.buyPrice),
                    Discount: p.discount,
                }));

                await tx.Tb_Order_Product.createMany({
                    data: orderProductsData,
                });
            }

            return updatedOrder;
        });

        const finalOrder = await prisma.Tb_Order.findUnique({
            where: { Order_ID: result.Order_ID },
            include: {
                Tb_Supplier: true,
                Tb_Order_Product: { include: { Tb_Product: { include: { Tb_Price: true } } } },
            },
        });

        res.json(toFrontendOrder(finalOrder));
    } catch (error) {
        console.error(`Error updating order ${orderId}:`, error);
        res.status(500).json({ message: 'Failed to update order.' });
    }
});


// DELETE an order
router.delete('/:id', async (req, res) => {
    const orderId = parseInt(req.params.id, 10);

    try {
        await prisma.$transaction(async (tx) => {
            await tx.Tb_Order_Product.deleteMany({
                where: { Order_ID: orderId },
            });
            await tx.Tb_Order.delete({
                where: { Order_ID: orderId },
            });
        });
        res.status(204).send();
    } catch (error) {
        console.error(`Error deleting order ${orderId}:`, error);
        res.status(500).json({ message: 'Failed to delete order.' });
    }
});


module.exports = router; 