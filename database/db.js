/* BANCO DE DADOS SQLITE
Banco de dados simples, serve para armazenar os usuários, administradores e as imagens dos imóveis
SQLite é básico e atende o nosso trabalho
*/

const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config();

const dbPath = path.join(__dirname, 'imobiliaria.sqlite');
const db = new sqlite3.Database(dbPath);

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

async function initDatabase() {
  await run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS properties (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      price TEXT NOT NULL,
      specs TEXT,
      location TEXT,
      type TEXT,
      image TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const adminUser = process.env.ADMIN_USER;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const existingUser = await get('SELECT id FROM users WHERE username = ?', [adminUser]);

  if (!existingUser) {
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    await run('INSERT INTO users (username, password_hash) VALUES (?, ?)', [adminUser, passwordHash]);
    console.log('Usuário administrador criado. Usuário:', adminUser);
  }

  const total = await get('SELECT COUNT(*) as total FROM properties');
  if (total.total === 0) {
    const initialProperties = [
      ['AP-2041', 'Apartamento 3 dormitórios com suíte', 'R$ 380.000', '3 dorms • 2 vagas • 87m²', 'Vila Nova', 'Apartamento', 'https://images.unsplash.com/photo-1559329146-807aff9ff1fb?q=80&w=1080'],
      ['CS-1198', 'Casa com piscina e área gourmet', 'R$ 650.000', '4 dorms • 3 vagas • 180m²', 'Jardim Europa', 'Casa', 'https://images.unsplash.com/photo-1711110065992-6d6aff9ae35c?q=80&w=1080'],
      ['ST-0087', 'Studio moderno, mobiliado', 'R$ 185.000', '1 dorm • 1 vaga • 38m²', 'Centro', 'Apartamento', 'https://images.unsplash.com/photo-1774311237295-a65a4c1ff38a?q=80&w=1080'],
      ['RURAL-1234', 'Sítio de fazenda com 500m²', 'R$ 800.000', '10 dorms • 10 vagas • 500m²', 'Interior', 'Rural', 'img/Fz-02.jpg']
    ];

    for (const item of initialProperties) {
      await run('INSERT INTO properties (id, title, price, specs, location, type, image) VALUES (?, ?, ?, ?, ?, ?, ?)', item);
    }
    console.log('Imóveis iniciais cadastrados no banco.');
  }
}

module.exports = { db, run, get, all, initDatabase };
