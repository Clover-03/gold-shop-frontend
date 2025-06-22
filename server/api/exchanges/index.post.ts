import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function generateProductId() {
  const prefix = 'PD';
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, '0');
  return `${prefix}${timestamp}${random}`.slice(0, 10);
}

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);

    const {
      Cust_ID,
      New_Pd_ID,
      Exch_Date,
      Old_Product_Value,
      New_Product_Value,
      Gold_Change_Fee,
      Lost_Weight_Fee,
      Different_price,
      Notes,
      // These are the details for the old product that we will create
      Old_Pd_Description,
      Old_Pd_Actual_Weight,
      Old_Pd_Type,
    } = body;

    // Validate required fields
    if (!Cust_ID || !New_Pd_ID || !Exch_Date || !Old_Pd_Description || !Old_Pd_Actual_Weight) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required fields for exchange.',
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create the new product record for the old item being exchanged
      const oldProduct = await tx.tb_Product.create({
        data: {
          Pd_ID: generateProductId(),
          Pd_name: Old_Pd_Description,
          Weight: String(Old_Pd_Actual_Weight),
          Type: Old_Pd_Type || 'ສິນຄ້າແລກປ່ຽນ', // Default type for exchanged items
          status: 'EXCHANGED',
        },
      });

      // 2. Create the exchange record, linking the old and new products
      const exchange = await tx.tb_Exchange.create({
        data: {
          Cust_ID,
          New_Pd_ID,
          Old_Pd_ID: oldProduct.Pd_ID, // Link to the newly created old product
          Exch_Date: new Date(Exch_Date),
          Old_Product_Value,
          New_Product_Value,
          Gold_Change_Fee,
          Lost_Weight_Fee,
          Different_price,
          Notes,
        },
      });

      // 3. Update the status of the new product being sold to 'SOLD'
      await tx.tb_Product.update({
        where: { Pd_ID: New_Pd_ID },
        data: { status: 'SOLD' },
      });

      return { exchange };
    });

    return result;
  } catch (error) {
    console.error('Error creating exchange:', error);
    // Properly handle Prisma-specific errors or other errors
    const errorMessage = error.data?.message || error.message || 'Could not create exchange.';
    throw createError({
        statusCode: 500,
        statusMessage: `Failed to create exchange. Error: ${errorMessage}`,
    });
  }
}); 