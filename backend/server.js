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
    const result = await pool.query(`
      SELECT
        id,
        name,
        image,
        category,
        details,
        buyurl,
        price,
        is_vip,
        active,
        createdat AS created_at,
        1 AS available_count
      FROM gifts
      WHERE active = true
      ORDER BY createdat DESC
    `);

    res.json(result.rows);
  } catch (err) {
    console.error('❌ Error GET /api/gifts:', err);
    res.status(500).json({ error: err.message });
  }
});

// =====================
// POST crear regalo
// =====================
app.post('/api/gifts', async (req, res) => {
  const { name, image, category, details, buyurl, price, isVip } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'El nombre es obligatorio' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO gifts
       (name, image, category, details, buyurl, price, is_vip, active)
       VALUES ($1,$2,$3,$4,$5,$6,$7,true)
       RETURNING
         id,
         name,
         image,
         category,
         details,
         buyurl,
         price,
         is_vip,
         active,
         createdat AS created_at,
         1 AS available_count`,
      [
        name,
        image || null,
        category || null,
        details || null,
        buyurl || null,
        Number(price) || 0,
        Boolean(isVip)
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('❌ Error POST /api/gifts:', err);
    res.status(500).json({ error: err.message });
  }
});

// =====================
// PUT editar regalo
// =====================
app.put('/api/gifts/:id', async (req, res) => {
  const { id } = req.params;
  const { name, image, category, details, buyurl, price, isVip } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'El nombre es obligatorio' });
  }

  try {
    await pool.query(
      `UPDATE gifts SET
        name = $1,
        image = $2,
        category = $3,
        details = $4,
        buyurl = $5,
        price = $6,
        is_vip = $7
       WHERE id = $8`,
      [
        name,
        image || null,
        category || null,
        details || null,
        buyurl || null,
        Number(price) || 0,
        Boolean(isVip),
        id
      ]
    );

    res.json({ success: true });
  } catch (err) {
    console.error('❌ Error PUT /api/gifts:', err);
    res.status(500).json({ error: err.message });
  }
});

// =====================
// DELETE regalo (soft delete)
// =====================
app.delete('/api/gifts/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query(
      `UPDATE gifts SET active = false WHERE id = $1`,
      [id]
    );
    res.sendStatus(204);
  } catch (err) {
    console.error('❌ Error DELETE /api/gifts:', err);
    res.status(500).json({ error: err.message });
  }
});

// =====================
// POST confirmar selección
// =====================
app.post('/api/select', async (req, res) => {
  const { username, selections } = req.body;

  if (!username || !selections || selections.length === 0) {
    return res.status(400).json({ error: 'Datos incompletos' });
  }

  try {
    for (const s of selections) {
      await pool.query(
        `INSERT INTO gift_selections (username, gift_id, quantity, createdat)
         VALUES ($1,$2,$3,NOW())`,
        [username, s.giftId, s.quantity || 1]
      );
    }

    res.status(201).json({ success: true });
  } catch (err) {
    console.error('❌ Error POST /api/select:', err);
    res.status(500).json({ error: err.message });
  }
});

// =====================
// GET selecciones
// =====================
app.get('/api/selections', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        username,
        gift_id,
        quantity,
        createdat AS created_at
      FROM gift_selections
      ORDER BY createdat DESC
    `);

    res.json(result.rows);
  } catch (err) {
    console.error('❌ Error GET /api/selections:', err);
    res.status(500).json({ error: err.message });
  }
});

// =====================
// Health check
// =====================
app.get('/health', (req, res) => {
  res.json({ status: 'API running OK' });
});

// =====================
// Start server
// =====================
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 API corriendo en puerto ${PORT}`);
});
