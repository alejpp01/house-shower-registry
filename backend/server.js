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
       ORDER BY created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('❌ Error GET /api/gifts:', err);
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

  console.log('📥 POST /api/gifts - Body:', req.body);

  if (!name) {
    return res.status(400).json({ error: 'El nombre es obligatorio' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO gifts
       (name, image, category, details, buyurl, price, is_vip, available_count, active, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true, NOW())
       RETURNING *`,
      [
        name,
        image || null,
        category || null,
        details || null,
        buyurl || null,
        Number(price) || 0,
        Boolean(isVip),
        Number(availableCount) || 1
      ]
    );

    console.log('✅ Regalo creado:', result.rows[0]);
    res.status(201).json(result.rows[0]);

  } catch (err) {
    console.error('❌ Error POST /api/gifts:', err.message);
    console.error(err.stack);
    res.status(500).json({ error: err.message });
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
    isVip
  } = req.body;

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

    console.log(`✅ Regalo ${id} actualizado`);
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
    console.log(`✅ Regalo ${id} eliminado`);
    res.sendStatus(204);
  } catch (err) {
    console.error('❌ Error DELETE /api/gifts:', err);
    res.status(500).json({ error: 'Error al eliminar regalo' });
  }
});

// =====================
// POST confirmar selección
// =====================
app.post('/api/select', async (req, res) => {
  const { username, selections } = req.body;

  console.log('📥 POST /api/select - Body:', req.body);

  if (!username || !selections || selections.length === 0) {
    return res.status(400).json({ error: 'Usuario y selecciones requeridas' });
  }

  try {
    // Insertar cada selección
    for (const selection of selections) {
      const { giftId, quantity } = selection;
      
      await pool.query(
        `INSERT INTO gift_selections (username, gift_id, quantity, created_at)
         VALUES ($1, $2, $3, NOW())`,
        [username, giftId, quantity || 1]
      );
    }

    console.log(`✅ Selecciones guardadas para ${username}`);
    res.status(201).json({ success: true, message: 'Selecciones guardadas' });

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
    const result = await pool.query(
      `SELECT 
        id,
        username,
        gift_id,
        quantity,
        created_at
       FROM gift_selections
       ORDER BY created_at DESC`
    );

    console.log('✅ Selecciones obtenidas:', result.rows.length);
    res.json(result.rows);
  } catch (err) {
    console.error('❌ Error GET /api/selections:', err);
    res.status(500).json({ error: 'Error al obtener selecciones' });
  }
});

// =====================
// Health check
// =====================
app.get('/health', (req, res) => {
  res.json({ status: '✅ API running' });
});

// =====================
// Start server
// =====================
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 API corriendo en puerto ${PORT}`);
});
