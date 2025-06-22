const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Use authentication for all invoice routes
router.use(authMiddleware);

// Helper to format invoice data for the frontend
const toFrontendInvoice = (invoice) => {
  return {
    Inv_ID: invoice.Inv_ID,
    Order_ID: invoice.Order_ID,
    Sup_name: invoice.Tb_Order?.Tb_Supplier?.Sup_name || 'N/A',
    Inv_Date: invoice.Inv_Date,
    Total_Price: invoice.Total_Price,
    Status: invoice.Status,
    products: invoice.Tb_Order?.Tb_Order_Product.map(op => ({
      Pd_ID: op.Tb_Product.Pd_ID,
      Pd_name: op.Tb_Product.Pd_name,
      quantity: op.Quantity,
      buyPrice: op.Buy_price,
      weight: op.Tb_Product.Weight,
      discount: op.Discount,
    })) || []
  };
};

// GET all invoices
router.get('/', async (req, res) => {
  try {
    const invoices = await prisma.tb_Invoice.findMany({
      include: {
        Tb_Order: {
          include: {
            Tb_Supplier: true,
            Tb_Order_Product: {
              include: {
                Tb_Product: true,
              }
            }
          }
        }
      },
      orderBy: {
        Inv_Date: 'desc',
      },
    });
    res.json(invoices.map(toFrontendInvoice));
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({ message: 'Error fetching invoices' });
  }
});

// GET a single invoice by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const invoice = await prisma.tb_Invoice.findUnique({
      where: { Inv_ID: parseInt(id) },
      include: {
        Tb_Order: {
          include: {
            Tb_Supplier: true,
            Tb_Order_Product: {
              include: {
                Tb_Product: true,
              }
            }
          }
        }
      }
    });

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    res.json(toFrontendInvoice(invoice));
  } catch (error) {
    console.error(`Error fetching invoice ${id}:`, error);
    res.status(500).json({ message: 'Error fetching invoice details' });
  }
});

// POST to create a new invoice from an order
router.post('/', async (req, res) => {
  const { orderId, invoiceDate } = req.body;

  if (!orderId) {
    return res.status(400).json({ message: 'Order ID is required.' });
  }

  try {
    const order = await prisma.tb_Order.findUnique({
      where: { Order_ID: parseInt(orderId) },
      include: {
        Tb_Order_Product: true,
      },
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }
    
    if (order.Status === 'Completed') {
      return res.status(400).json({ message: 'This order has already been processed.' });
    }

    const total = order.Tb_Order_Product.reduce((sum, item) => {
      return sum + (Number(item.Buy_price) * item.Quantity);
    }, 0);

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create the new invoice
      const newInvoice = await tx.tb_Invoice.create({
        data: {
          Order_ID: order.Order_ID,
          Inv_Date: invoiceDate ? new Date(invoiceDate) : new Date(),
          Total_Price: total,
          Status: 'Pending',
        },
      });

      // 2. Update the original order's status
      await tx.tb_Order.update({
        where: { Order_ID: order.Order_ID },
        data: { Status: 'Completed' },
      });

      return newInvoice;
    });

    res.status(201).json(result);
  } catch (error) {
    console.error('Error creating invoice:', error);
    res.status(500).json({ message: 'Failed to create invoice.' });
  }
});

// PUT update an invoice
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { invoiceDate, status } = req.body;

  if (!invoiceDate && !status) {
    return res.status(400).json({ message: 'No data provided for update.' });
  }

  try {
    const updatedInvoice = await prisma.tb_Invoice.update({
      where: { Inv_ID: parseInt(id) },
      data: {
        Inv_Date: invoiceDate ? new Date(invoiceDate) : undefined,
        Status: status,
      },
    });
    res.json(updatedInvoice);
  } catch (error) {
    console.error(`Error updating invoice ${id}:`, error);
    res.status(500).json({ message: 'Failed to update invoice.' });
  }
});

// DELETE (Cancel) an invoice
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const invoiceToCancel = await prisma.tb_Invoice.findUnique({
      where: { Inv_ID: parseInt(id) },
    });

    if (!invoiceToCancel) {
      return res.status(404).json({ message: 'Invoice not found.' });
    }

    // Use a transaction to ensure data integrity
    await prisma.$transaction(async (tx) => {
      // 1. Update invoice status to CANCELED
      await tx.tb_Invoice.update({
        where: { Inv_ID: parseInt(id) },
        data: { Status: 'Cancelled' },
      });

      // 2. Revert the original order's status to 'Pending' if it exists
      if (invoiceToCancel.Order_ID) {
        await tx.tb_Order.update({
          where: { Order_ID: invoiceToCancel.Order_ID },
          data: { Status: 'Pending' },
        });
      }
    });

    res.status(204).send(); // Success, no content
  } catch (error) {
    console.error(`Error canceling invoice ${id}:`, error);
    res.status(500).json({ message: 'Failed to cancel invoice.' });
  }
});

module.exports = router; 