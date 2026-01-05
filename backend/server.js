const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();

// ===============================
// CORS
// ===============================
app.use(cors({
  origin: [
    'https://chocoro-shower-vacilao.vercel.app',
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:3001'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// ===============================
// PostgreSQL
// ===============================
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// ===============================
// GET: Gifts (NORMAL + VIP)
// ===============================
app.get('/api/gifts', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        name,
        category,
        image_url   AS image,
        description AS details,
        buy_url     AS "buyUrl",
        price,
        isVip
      FROM gifts
      WHERE active = true
      ORDER BY id DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('❌ GET /api/gifts', error);
    res.status(500).json({ error: 'Error al obtener regalos' });
  }
});

// ===============================
// POST: Crear regalo
// ===============================
app.post('/api/gifts', async (req, res) => {
  const { name, image, category, details, buyUrl, price, isVip } = req.body;

  try {
    const result = await pool.query(`
      INSERT INTO gifts
        (name, image_url, category, description, buy_url, price, isVip)
      VALUES
        ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [
      name,
      image,
      category,
      details,
      buyUrl,
      price || 0,
      Boolean(isVip)
    ]);

    res.json(result.rows[0]);
  } catch (error) {
    console.error('❌ POST /api/gifts', error);
    res.status(500).json({ error: 'Error al crear regalo' });
  }
});

// ===============================
// PUT: Actualizar regalo
// ===============================
app.put('/api/gifts/:id', async (req, res) => {
  const { id } = req.params;
  const { name, image, category, details, buyUrl, price, isVip } = req.body;

  try {
    const result = await pool.query(`
      UPDATE gifts SET
        name = $1,
        image_url = $2,
        category = $3,
        description = $4,
        buy_url = $5,
        price = $6,
        isVip = $7,
        updated_at = NOW()
      WHERE id = $8
      RETURNING *
    `, [
      name,
      image,
      category,
      details,
      buyUrl,
      price || 0,
      Boolean(isVip),
      id
    ]);

    if (!result.rows.length) {
      return res.status(404).json({ error: 'Regalo no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('❌ PUT /api/gifts/:id', error);
    res.status(500).json({ error: 'Error al actualizar regalo' });
  }
});

// ===============================
// DELETE: Eliminar regalo
// ===============================
app.delete('/api/gifts/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM gifts WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    console.error('❌ DELETE /api/gifts', error);
    res.status(500).json({ error: 'Error al eliminar regalo' });
  }
});

// ===============================
// RESERVATIONS
// ===============================
app.get('/api/reservations', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM reservations');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener reservas' });
  }
});

app.post('/api/reservations', async (req, res) => {
  const { giftId, selectedBy, token } = req.body;

  try {
    const result = await pool.query(`
      INSERT INTO reservations (gift_id, guest_name, guest_token)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [giftId, selectedBy, token]);

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error al reservar' });
  }
});

app.delete('/api/reservations/:giftId', async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM reservations WHERE gift_id = $1',
      [req.params.giftId]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Error al liberar reserva' });
  }
});

// ===============================
// Health check
// ===============================
app.get('/', (_, res) => {
  res.json({ status: 'Backend OK' });
});

// ===============================
// Start server
// ===============================
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ API corriendo en puerto ${PORT}`);
});
