const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  try {
    const username = 'admin';
    const password = 'admin123';
    
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.tb_User.upsert({
      where: { username: username },
      update: { Password: hashedPassword },
      create: {
        User_ID: 'U001', // Or generate a unique ID
        username: username,
        Password: hashedPassword,
        Role: 'admin'
      },
    });

    console.log('Admin user has been created/updated successfully:', user);
  } catch (error) {
    console.error('Error creating/updating user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 