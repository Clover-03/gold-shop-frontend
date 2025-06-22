const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createSamplePrices() {
  try {
    console.log('Creating sample price data...');

    const samplePrices = [
      {
        date: new Date('2024-12-07T10:00:00Z'),
        buyPrice: 30740000,
        sellPrice: 31649000,
      },
      {
        date: new Date('2024-12-06T10:00:00Z'),
        buyPrice: 30650000,
        sellPrice: 31550000,
      },
      {
        date: new Date('2024-12-05T10:00:00Z'),
        buyPrice: 30800000,
        sellPrice: 31700000,
      },
      {
        date: new Date('2024-12-04T10:00:00Z'),
        buyPrice: 30900000,
        sellPrice: 31800000,
      },
      {
        date: new Date('2024-12-03T10:00:00Z'),
        buyPrice: 31000000,
        sellPrice: 31900000,
      }
    ];

    for (const priceData of samplePrices) {
      await prisma.price.create({
        data: priceData,
      });
    }

    console.log('✅ Sample price data created successfully!');
    console.log(`Created ${samplePrices.length} price records.`);

  } catch (error) {
    console.error('❌ Error creating sample prices:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSamplePrices(); 