/* SERVIDOR BACKEND - NODE + EXPRESS
    site público, cria API para listar, cadastrar, excluir e editar os imóveis.
    fazer login que não é exposto no frontend.*/

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const { run, get, all, initDatabase } = require('./database/db');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'chave_de_estudo_troque_depois';

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'uploads'));
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const safeName = Date.now() + '-' + Math.round(Math.random() * 1e9) + ext;
    cb(null, safeName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: function (req, file, cb) {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Envie apenas arquivos de imagem.'));
    }
    cb(null, true);
  }
});

function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Acesso negado. Faça login.' });
  }

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Token inválido ou expirado.' });
  }
}

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Informe usuário e senha.' });
  }

  const user = await get('SELECT * FROM users WHERE username = ?', [username]);

  if (!user) {
    return res.status(401).json({ error: 'Usuário ou senha incorretos.' });
  }

  const passwordIsValid = await bcrypt.compare(password, user.password_hash);

  if (!passwordIsValid) {
    return res.status(401).json({ error: 'Usuário ou senha incorretos.' });
  }

  const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '2h' });
  res.json({ token, username: user.username });
});

app.get('/api/properties', async (req, res) => {
  const properties = await all('SELECT * FROM properties ORDER BY created_at DESC');
  res.json(properties);
});

app.post('/api/properties', authenticateToken, upload.single('imageFile'), async (req, res) => {
  const { id, title, price, specs, location, type, image } = req.body;

  if (!id || !title || !price) {
    return res.status(400).json({ error: 'Código, título e preço são obrigatórios.' });
  }

  const finalImage = req.file ? `/uploads/${req.file.filename}` : image;

  try {
    await run(
      'INSERT INTO properties (id, title, price, specs, location, type, image) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, title, price, specs, location, type, finalImage]
    );

    const created = await get('SELECT * FROM properties WHERE id = ?', [id]);
    res.status(201).json(created);
  } catch (error) {
    if (error.message.includes('UNIQUE')) {
      return res.status(409).json({ error: 'Já existe imóvel com esse código.' });
    }
    res.status(500).json({ error: 'Erro ao cadastrar imóvel.' });
  }
});

app.put('/api/properties/:id', authenticateToken, upload.single('imageFile'), async (req, res) => {
  const originalId = req.params.id;
  const { id, title, price, specs, location, type, image } = req.body;

  if (!id || !title || !price) {
    return res.status(400).json({ error: 'Código, título e preço são obrigatórios.' });
  }

  const oldProperty = await get('SELECT * FROM properties WHERE id = ?', [originalId]);

  if (!oldProperty) {
    return res.status(404).json({ error: 'Imóvel não encontrado.' });
  }

  const finalImage = req.file ? `/uploads/${req.file.filename}` : image;

  try {
    await run(
      'UPDATE properties SET id = ?, title = ?, price = ?, specs = ?, location = ?, type = ?, image = ? WHERE id = ?',
      [id, title, price, specs, location, type, finalImage, originalId]
    );

    const updated = await get('SELECT * FROM properties WHERE id = ?', [id]);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao editar imóvel.' });
  }
});

app.delete('/api/properties/:id', authenticateToken, async (req, res) => {
  const id = req.params.id;
  const property = await get('SELECT * FROM properties WHERE id = ?', [id]);

  if (!property) {
    return res.status(404).json({ error: 'Imóvel não encontrado.' });
  }

  await run('DELETE FROM properties WHERE id = ?', [id]);

  if (property.image && property.image.startsWith('/uploads/')) {
    const imagePath = path.join(__dirname, property.image);
    if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
  }

  res.json({ message: 'Imóvel excluído com sucesso.' });
});

initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
  });
});
