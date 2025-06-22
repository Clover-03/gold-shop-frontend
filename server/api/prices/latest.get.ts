import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    const latestPrice = await prisma.tb_Price.findFirst({
      orderBy: {
        Date: 'desc',
      },
    })
    
    if (!latestPrice) {
      throw createError({
        statusCode: 404,
        statusMessage: 'No price data found',
      })
    }
    
    return latestPrice
  } catch (error) {
    console.error('Error fetching latest price:', error)
    
    // To avoid breaking the frontend, check if it is a known error.
    if (error.statusCode === 404) {
        throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch latest price',
    })
  }
}) 