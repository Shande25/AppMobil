// server.js
const express = require('express');
const NodeRSA = require('node-rsa');
const app = express();
app.use(express.json());

// Generar claves RSA
app.get('/generar-claves', (req, res) => {
  const key = new NodeRSA({ b: 512 });
  const publicKey = key.exportKey('public');
  const privateKey = key.exportKey('private');
  res.json({ publicKey, privateKey });
});

// Cifrar texto con clave pública
app.post('/cifrar', (req, res) => {
  const { texto, publicKey } = req.body;
  const rsaPublic = new NodeRSA(publicKey);
  const encrypted = rsaPublic.encrypt(texto, 'base64');
  res.json({ encrypted });
});

// Descifrar texto con clave privada
app.post('/descifrar', (req, res) => {
  const { textoCifrado, privateKey } = req.body;
  const rsaPrivate = new NodeRSA(privateKey);
  const decrypted = rsaPrivate.decrypt(textoCifrado, 'utf8');
  res.json({ decrypted });
});

// Iniciar el servidor
app.listen(3000, () => {
  console.log('Servidor de cifrado RSA ejecutándose en http://localhost:3000');
});
