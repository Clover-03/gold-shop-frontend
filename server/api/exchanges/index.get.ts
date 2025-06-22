import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  try {
    const exchanges = await prisma.tb_Exchange.findMany({
      include: {
        Tb_Customer: true, // Include related customer data
        Old_Product: true,
        New_Product: true, // Include the new product details
      },
      orderBy: {
        Exch_ID: 'desc', // Show latest exchanges first
      }
    });
    return exchanges;
  } catch (error: any) {
    console.error('Error fetching exchanges with details:', error);
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to fetch exchanges. Error: ${error.message}`,
    });
  }
}); 