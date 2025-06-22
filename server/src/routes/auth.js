const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

// Login route
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'ກະລຸນາປ້ອນຊື່ຜູ້ໃຊ້ ແລະ ລະຫັດຜ່ານ' });
    }

    // Find user by username
    const user = await prisma.tb_User.findUnique({
      where: { username },
      select: {
        User_ID: true,
        username: true,
        Password: true,
        Role: true
      }
    });

    console.log('[DEBUG] Login attempt:', username, '| User found:', !!user);

    if (!user) {
      console.warn('[WARN] User not found:', username);
      return res.status(401).json({ message: 'ຊື່ຜູ້ໃຊ້ ຫຼື ລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.Password);
    console.log('[DEBUG] Password valid:', isValidPassword);
    if (!isValidPassword) {
      console.warn('[WARN] Invalid password for user:', username);
      return res.status(401).json({ message: 'ຊື່ຜູ້ໃຊ້ ຫຼື ລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.User_ID,
        username: user.username,
        role: user.Role
      },
      process.env.JWT_SECRET || 'gold-shop-secret-key-2024',
      { expiresIn: '1d' }
    );

    // Remove password from user object
    const { Password: _, ...userWithoutPassword } = user;

    res.json({
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'ເກີດຂໍ້ຜິດພາດໃນການເຊື່ອມຕໍ່' });
  }
});

module.exports = router; 