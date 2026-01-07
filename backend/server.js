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
      `SELECT *
       FROM gifts
       WHERE active = true
       ORDER BY createdat DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
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
    isVip,
    availableCount
  } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO gifts
      (name, image, category, details, buyurl, price, is_vip, available_count)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      RETURNING *`,
      [
        name,
        image,
        category,
        details,
        buyurl,
        price || 0,
        Boolean(isVip),
        availableCount || 1
      ]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear regalo' });
  }
});

// =====================
// PUT editar regalo
// =====================
app.put('/api/gifts/:id', async (req, res) => {
  const { id } = req.params;
  const {
    name,
    image,
    category,
    details,
    buyurl,
    price,
    isVip,
    availableCount
  } = req.body;

  try {
    await pool.query(
      `UPDATE gifts SET
        name=$1,
        image=$2,
        category=$3,
        details=$4,
        buyurl=$5,
        price=$6,
        is_vip=$7,
        available_count=$8
       WHERE id=$9`,
      [
        name,
        image,
        category,
        details,
        buyurl,
        price,
        Boolean(isVip),
        availableCount,
        id
      ]
    );

    res.sendStatus(204);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar regalo' });
  }
});

// =====================
// DELETE regalo (FIX 404)
// =====================
app.delete('/api/gifts/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query(
      `UPDATE gifts SET active=false WHERE id=$1`,
      [id]
    );
    res.sendStatus(204);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar regalo' });
  }
});

// =====================
// POST seleccionar regalos
// =====================
app.post('/api/select', async (req, res) => {
  const { username, selections } = req.body;

  try {
    for (const s of selections) {
      await pool.query(
        `INSERT INTO gift_selections (gift_id, username, quantity)
         VALUES ($1,$2,$3)`,
        [s.giftId, username, s.quantity]
      );
    }

    res.sendStatus(201);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error guardando selección' });
  }
});

// =====================
// GET selecciones (admin)
// =====================
app.get('/api/selections', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT *
       FROM gift_selections
       ORDER BY createdat DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error obteniendo selecciones' });
  }
});

// =====================
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 API corriendo en http://localhost:${PORT}`);
});
