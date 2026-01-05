const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();

/* =========================
   CORS
========================= */
app.use(cors({
  origin: [
    'https://chocoro-shower-vacilao.vercel.app',
    'http://localhost:3000',
    'http://localhost:5173'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());

/* =========================
   DATABASE
========================= */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

/* =========================
   HELPER
========================= */
function normalizeIsVip(value) {
  return value === true || value === 'true' || value === 1 || value === '1';
}

/* =========================
   GIFTS
========================= */
app.get('/api/gifts', async (_, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        name,
        category,
        image,
        details,
        buyurl AS "buyUrl",
        price,
        isvip AS "isVip"
      FROM gifts
      ORDER BY id DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener regalos' });
  }
});

app.post('/api/gifts', async (req, res) => {
  const { name, category, image, details, buyUrl, price, isVip } = req.body;

  try {
    const vipValue = normalizeIsVip(isVip);

    const result = await pool.query(`
      INSERT INTO gifts
        (name, category, image, details, buyurl, price, isvip)
      VALUES
        ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [
      name,
      category,
      image,
      details,
      buyUrl,
      price || 0,
      vipValue
    ]);

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear regalo' });
  }
});

app.put('/api/gifts/:id', async (req, res) => {
  const { id } = req.params;
  const { name, category, image, details, buyUrl, price, isVip } = req.body;

  try {
    const vipValue = normalizeIsVip(isVip);

    const result = await pool.query(`
      UPDATE gifts SET
        name = $1,
        category = $2,
        image = $3,
        details = $4,
        buyurl = $5,
        price = $6,
        isvip = $7
      WHERE id = $8
      RETURNING *
    `, [
      name,
      category,
      image,
      details,
      buyUrl,
      price || 0,
      vipValue,
      id
    ]);

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar regalo' });
  }
});

app.delete('/api/gifts/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM gifts WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar regalo' });
  }
});

/* =========================
   RESERVATIONS
========================= */
app.get('/api/reservations', async (_, res) => {
  try {
    const result = await pool.query(`
      SELECT
        gift_id AS "giftId",
        selected_by AS "selectedBy"
      FROM reservations
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener reservas' });
  }
});

app.post('/api/reservations', async (req, res) => {
  const { giftId, selectedBy, token } = req.body;

  try {
    await pool.query(`
      INSERT INTO reservations (gift_id, selected_by, token)
      VALUES ($1, $2, $3)
    `, [giftId, selectedBy, token]);

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al reservar regalo' });
  }
});

app.delete('/api/reservations/:giftId', async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM reservations WHERE gift_id = $1',
      [req.params.giftId]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al liberar reserva' });
  }
});

/* =========================
   SERVER
========================= */
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Backend corriendo en puerto ${PORT}`);
});
