const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createMultipleDailyPrices() {
  try {
    console.log('🕒 Creating multiple price data per day...\n');

    // Today's prices (multiple updates throughout the day)
    const today = new Date();
    const todayPrices = [
      {
        date: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 0, 0), // 09:00
        buyPrice: 30800000,
        sellPrice: 31700000,
      },
      {
        date: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 11, 30, 0), // 11:30
        buyPrice: 30850000,
        sellPrice: 31750000,
      },
      {
        date: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 14, 15, 0), // 14:15
        buyPrice: 30900000,
        sellPrice: 31800000,
      },
      {
        date: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 16, 45, 0), // 16:45
        buyPrice: 30880000,
        sellPrice: 31780000,
      }
    ];

    // Yesterday's prices
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayPrices = [
      {
        date: new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 8, 30, 0),
        buyPrice: 30750000,
        sellPrice: 31650000,
      },
      {
        date: new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 12, 0, 0),
        buyPrice: 30800000,
        sellPrice: 31700000,
      },
      {
        date: new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 15, 30, 0),
        buyPrice: 30780000,
        sellPrice: 31680000,
      }
    ];

    // Two days ago prices
    const twoDaysAgo = new Date(today);
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    const twoDaysAgoPrices = [
      {
        date: new Date(twoDaysAgo.getFullYear(), twoDaysAgo.getMonth(), twoDaysAgo.getDate(), 10, 0, 0),
        buyPrice: 30700000,
        sellPrice: 31600000,
      },
      {
        date: new Date(twoDaysAgo.getFullYear(), twoDaysAgo.getMonth(), twoDaysAgo.getDate(), 13, 45, 0),
        buyPrice: 30720000,
        sellPrice: 31620000,
      }
    ];

    const allPrices = [...todayPrices, ...yesterdayPrices, ...twoDaysAgoPrices];

    console.log('Creating prices...');
    for (const priceData of allPrices) {
      const created = await prisma.price.create({
        data: priceData,
      });
      console.log(`✅ Created: ${created.date} - Buy: ${created.buyPrice}, Sell: ${created.sellPrice}`);
    }

    console.log(`\n🎉 Successfully created ${allPrices.length} price records across multiple days!`);
    console.log('\n📊 Summary:');
    console.log(`- Today: ${todayPrices.length} prices`);
    console.log(`- Yesterday: ${yesterdayPrices.length} prices`);
    console.log(`- Two days ago: ${twoDaysAgoPrices.length} prices`);

    // Show latest prices
    console.log('\n🕐 Latest prices (ordered by time):');
    const latestPrices = await prisma.price.findMany({
      orderBy: { date: 'desc' },
      take: 10,
    });
    
    latestPrices.forEach((price, index) => {
      const dateStr = price.date.toLocaleString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
      console.log(`${index + 1}. ${dateStr} - Buy: ${price.buyPrice}, Sell: ${price.sellPrice}`);
    });

  } catch (error) {
    console.error('❌ Error creating prices:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createMultipleDailyPrices(); 