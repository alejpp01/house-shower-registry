const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();

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

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

/* =========================
   GET GIFTS
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

/* =========================
   POST GIFT
========================= */
app.post('/api/gifts', async (req, res) => {
  const { name, category, image, details, buyUrl, price, isVip } = req.body;

  try {
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
      Boolean(isVip)
    ]);

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear regalo' });
  }
});

/* =========================
   PUT GIFT
========================= */
app.put('/api/gifts/:id', async (req, res) => {
  const { id } = req.params;
  const { name, category, image, details, buyUrl, price, isVip } = req.body;

  try {
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
      Boolean(isVip),
      id
    ]);

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar regalo' });
  }
});

/* =========================
   DELETE GIFT
========================= */
app.delete('/api/gifts/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM gifts WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar regalo' });
  }
});

/* =========================
   SERVER
========================= */
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Backend corriendo en puerto ${PORT}`);
});
