require('dotenv').config();
const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Configuración Firebase
try {
  const serviceAccount = require('./config/serviceAccountKey.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  console.log('Firebase Admin inicializado');
} catch (error) {
  console.error('Error Firebase:', error.message);
  process.exit(1);
}

// RUTAS DIRECTAS SIN IMPORTAR ARCHIVOS EXTERNOS

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'API funcionando',
    timestamp: new Date().toISOString()
  });
});

// Ruta principal
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API Backend funcionando',
    endpoints: ['/health', '/api/register', '/api/login']
  });
});

// Registrar usuario
app.post('/api/register', async (req, res) => {
  try {
    const { email, password, displayName } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email y password requeridos'
      });
    }

    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: displayName || ''
    });

    res.status(201).json({
      success: true,
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName
      }
    });

  } catch (error) {
    let message = 'Error al crear usuario';
    if (error.code === 'auth/email-already-exists') message = 'Email ya existe';
    if (error.code === 'auth/invalid-email') message = 'Email inválido';
    
    res.status(400).json({ success: false, message });
  }
});

// Verificar token
app.post('/api/verify-token', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token requerido'
      });
    }

    const decodedToken = await admin.auth().verifyIdToken(token);
    const userRecord = await admin.auth().getUser(decodedToken.uid);

    res.json({
      success: true,
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName
      }
    });

  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Token inválido'
    });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor en http://localhost:${PORT}`);
  console.log('Endpoints:');
  console.log('GET  /health');
  console.log('POST /api/register');
  console.log('POST /api/verify-token');
});