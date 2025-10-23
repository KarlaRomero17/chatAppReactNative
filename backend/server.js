const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

//configuraciones a servidor http
app.use(bodyParser.json());
app.use(cors());

mongoose.connect('mongodb://localhost:27017/schatAppReactNative', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Rutas para auth
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// Rutas para paciente
const pacienteRoutes = require('./routes/paciente');
app.use('/api/pacientes', pacienteRoutes); 

// Rutas para citas
const citaRoutes = require('./routes/cita');
app.use('/api/citas', citaRoutes);

const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Servidor ejecutándose en el puerto ${port}`);
});
