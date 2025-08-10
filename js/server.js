const express = require('express');
const mongoose = require('mongoose');
const app = express();

// Conexión a MongoDB Atlas (gratis)
mongoose.connect('mongodb+srv://tuusuario:tucontraseña@cluster0.mongodb.net/culturatoken?retryWrites=true&w=majority');

// Modelo de Usuario
const User = mongoose.model('User', {
  email: String,
  custodialWallet: String, // Dirección generada automáticamente
  nonCustodialWallet: String // Si conecta Phantom/Metamask
});

app.post('/register', async (req, res) => {
  const user = new User({
    email: req.body.email,
    custodialWallet: '0x...' // Generar dirección automática aquí
  });
  await user.save();
  res.send('Usuario registrado');
});

app.listen(3000, () => console.log('Servidor en http://localhost:3000'));