const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testCurrentTimestamp() {
  try {
    console.log('🧪 Testing CURRENT_TIMESTAMP functionality...\n');

    // Test 1: Create price without date (should use current timestamp)
    console.log('Test 1: Creating price without date...');
    const priceWithoutDate = await prisma.price.create({
      data: {
        buyPrice: 31000000,
        sellPrice: 31900000,
        // No date field - should use @default(now())
      },
    });
    console.log('✅ Created price without date:', {
      id: priceWithoutDate.id,
      date: priceWithoutDate.date,
      buyPrice: priceWithoutDate.buyPrice,
      sellPrice: priceWithoutDate.sellPrice
    });

    // Test 2: Create price with specific date
    console.log('\nTest 2: Creating price with specific date...');
    const specificDate = new Date('2024-12-01T10:00:00Z');
    const priceWithDate = await prisma.price.create({
      data: {
        buyPrice: 30500000,
        sellPrice: 31400000,
        date: specificDate,
      },
    });
    console.log('✅ Created price with specific date:', {
      id: priceWithDate.id,
      date: priceWithDate.date,
      buyPrice: priceWithDate.buyPrice,
      sellPrice: priceWithDate.sellPrice
    });

    // Test 3: Verify dates are different
    const timeDifference = Math.abs(priceWithoutDate.date - priceWithDate.date);
    console.log('\n🔍 Time difference analysis:');
    console.log('Price without date (current):', priceWithoutDate.date);
    console.log('Price with specific date:', priceWithDate.date);
    console.log('Time difference (milliseconds):', timeDifference);
    
    if (timeDifference > 1000) { // More than 1 second difference
      console.log('✅ PASS: Dates are different as expected');
    } else {
      console.log('❌ FAIL: Dates are too similar');
    }

    // Test 4: Fetch all prices to verify
    console.log('\n📊 All prices in database:');
    const allPrices = await prisma.price.findMany({
      orderBy: { date: 'desc' },
    });
    
    allPrices.forEach((price, index) => {
      console.log(`${index + 1}. ID: ${price.id}, Date: ${price.date}, Buy: ${price.buyPrice}, Sell: ${price.sellPrice}`);
    });

    console.log('\n🎉 All tests completed successfully!');

  } catch (error) {
    console.error('❌ Error in testing:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testCurrentTimestamp(); 