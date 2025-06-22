const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'ກະລຸນາເຂົ້າສູ່ລະບົບ' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'gold-shop-secret-key-2024');
    
    // Add user from payload
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'ກະລຸນາເຂົ້າສູ່ລະບົບໃໝ່' });
  }
};

module.exports = authMiddleware; 