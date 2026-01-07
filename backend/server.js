const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();

// =====================
// Middlewares
// =====================
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://chocoro-shower-vacilao.vercel.app'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json());

// =====================
// PostgreSQL
// =====================
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }
    : false
});

// =====================
// GET regalos
// =====================
app.get('/api/gifts', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM gifts WHERE active = true ORDER BY createdat DESC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('❌ Error obteniendo regalos:', err);
    res.status(500).json({ error: 'Error al obtener regalos' });
  }
});

// =====================
// POST crear regalo
// =====================
app.post('/api/gifts', async (req, res) => {
  const {
    name,
    image,
    category,
    details,
    buyurl,
    price,
    isVip
  } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO gifts
      (name, image, category, details, buyurl, price, is_vip)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
      [
        name,
        image,
        category,
        details,
        buyurl,
        price || 0,
        Boolean(isVip)
      ]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error('❌ Error creando regalo:', err);
    res.status(500).json({ error: 'Error al crear regalo' });
  }
});

// =====================
// Servidor
// =====================
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 API corriendo en http://localhost:${PORT}`);
});
