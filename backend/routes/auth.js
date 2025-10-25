const express = require('express');
const { 
  register, 
  login, 
  verifyToken, 
  getProfile,
  updateProfile 
} = require('../controllers/authController');

const router = express.Router();
const admin = require('firebase-admin');

// Middleware para verificar token
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Token de acceso requerido' 
      });
    }

    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    return res.status(401).json({ 
      success: false, 
      message: 'Token inválido o expirado' 
    });
  }
};

// RUTAS PÚBLICAS
router.post('/register', register);          
router.post('/login', login);            
router.post('/verify-token', verifyToken);

// RUTAS PROTEGIDAS
router.get('/profile', authMiddleware, getProfile);
router.put('/profile', authMiddleware, updateProfile);

module.exports = router;