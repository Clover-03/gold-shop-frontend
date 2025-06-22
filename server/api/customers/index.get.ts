import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  try {
    const customers = await prisma.tb_Customer.findMany({
      orderBy: {
        Cust_name: 'asc',
      },
    });
    return customers;
  } catch (error) {
    console.error('Error fetching customers:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch customers',
    });
  }
}); 