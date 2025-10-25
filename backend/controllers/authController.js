const admin = require('firebase-admin');

// Controlador para registro de usuarios
const register = async (req, res) => {
  try {
    const { email, password, displayName } = req.body;

    // Validar campos requeridos
    if (!email || !password || !displayName) {
      return res.status(400).json({
        success: false,
        message: 'Todos los campos son requeridos: email, password y nombre'
      });
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'El formato del email es inválido'
      });
    }

    // Validar longitud de la contraseña
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña debe tener al menos 6 caracteres'
      });
    }

    console.log('📝 Intentando registrar usuario:', { email, displayName });

    // Crear usuario en Firebase Auth
    const userRecord = await admin.auth().createUser({
      email: email,
      password: password,
      displayName: displayName,
      emailVerified: false
    });

    console.log('✅ Usuario creado exitosamente:', userRecord.uid);

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName,
        createdAt: userRecord.metadata.creationTime
      }
    });

  } catch (error) {
    console.error('❌ Error en registro:', error);

    let message = 'Error al crear usuario';
    
    if (error.code === 'auth/email-already-exists') {
      message = 'El email ya está registrado';
    } else if (error.code === 'auth/invalid-email') {
      message = 'El formato del email es inválido';
    } else if (error.code === 'auth/weak-password') {
      message = 'La contraseña es muy débil (mínimo 6 caracteres)';
    }

    res.status(400).json({
      success: false,
      message: message,
      errorCode: error.code
    });
  }
};

// Controlador para login - ACTUALIZADO
const login = async (req, res) => {
  try {
    // En Firebase, el login se hace en el frontend
    // El backend solo verifica el token generado
    res.json({
      success: true,
      message: 'Para hacer login, usa Firebase Auth en el frontend y luego verifica el token en /api/auth/verify-token',
      instructions: {
        step1: 'En el frontend, usa signInWithEmailAndPassword de Firebase Auth',
        step2: 'Obtén el token con user.getIdToken()',
        step3: 'Envía el token a /api/auth/verify-token para verificar'
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Controlador para verificar token (esto es el "login" del backend)
const verifyToken = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token de Firebase es requerido'
      });
    }

    console.log('🔐 Verificando token...');

    // Verificar el token de Firebase
    const decodedToken = await admin.auth().verifyIdToken(token);
    const userRecord = await admin.auth().getUser(decodedToken.uid);

    console.log('✅ Token verificado para usuario:', userRecord.email);

    res.json({
      success: true,
      message: 'Login exitoso - Token verificado',
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName,
        emailVerified: userRecord.emailVerified,
        photoURL: userRecord.photoURL,
        lastLogin: userRecord.metadata.lastSignInTime,
        createdAt: userRecord.metadata.creationTime
      },
      token: token // Puedes devolverlo o generar uno propio
    });

  } catch (error) {
    console.error('❌ Error verificando token:', error);

    let message = 'Token inválido o expirado';
    if (error.code === 'auth/id-token-expired') {
      message = 'El token ha expirado';
    } else if (error.code === 'auth/id-token-revoked') {
      message = 'El token ha sido revocado';
    }

    res.status(401).json({
      success: false,
      message: message
    });
  }
};

// Controlador para obtener perfil
const getProfile = async (req, res) => {
  try {
    const userRecord = await admin.auth().getUser(req.user.uid);

    res.json({
      success: true,
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName,
        emailVerified: userRecord.emailVerified,
        photoURL: userRecord.photoURL,
        lastLogin: userRecord.metadata.lastSignInTime,
        createdAt: userRecord.metadata.creationTime
      }
    });

  } catch (error) {
    console.error('Error obteniendo perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener perfil del usuario'
    });
  }
};

module.exports = {
  register,
  login,
  verifyToken,
  getProfile
};