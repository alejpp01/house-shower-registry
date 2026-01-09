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
    console.error('❌ Error GET /api/gifts:', err);
    res.status(500).json({ error: 'Error al obtener regalos' });
  }
});

// =====================
// POST crear regalo - CORREGIDO PARA COLUMNAS REALES
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

  console.log('📥 POST /api/gifts - Body recibido:', req.body);

  try {
    // Tu tabla real tiene: id, image, category, details, buyurl, price, is_vip, active, createdat
    // Mapeo:
    // - name → details (donde guardamos el nombre del regalo)
    // - category → en buyurl (o crear nueva columna si necesitas)
    // - availableCount → no existe, ignoramos o lo guardamos en otra parte

    const result = await pool.query(
      `INSERT INTO gifts
       (image, details, buyurl, price, is_vip, active)
       VALUES ($1, $2, $3, $4, $5, true)
       RETURNING *`,
      [
        image || '',
        name || '',  // El nombre va en "details"
        category || buyurl || '',  // category va en buyurl si no tiene buyurl
        parseFloat(price) || 0,
        Boolean(isVip)
      ]
    );

    console.log('✅ Regalo creado:', result.rows[0]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error('❌ Error en INSERT /api/gifts:', err);
    res.status(500).json({ error: err.message });
  }
});

// =====================
// PUT editar regalo - CORREGIDO PARA COLUMNAS REALES
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

  console.log('📥 PUT /api/gifts/:id - Body recibido:', req.body);

  try {
    await pool.query(
      `UPDATE gifts SET
        image = $1,
        details = $2,
        buyurl = $3,
        price = $4,
        is_vip = $5
       WHERE id = $6`,
      [
        image || '',
        name || '',  // El nombre va en "details"
        category || buyurl || '',  // category va en buyurl
        parseFloat(price) || 0,
        Boolean(isVip),
        id
      ]
    );

    console.log(`✅ Regalo ${id} actualizado`);
    res.sendStatus(204);
  } catch (err) {
    console.error('❌ Error en UPDATE /api/gifts:', err);
    res.status(500).json({ error: err.message });
  }
});

// =====================
// DELETE regalo
// =====================
app.delete('/api/gifts/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query(
      `UPDATE gifts SET active = false WHERE id = $1`,
      [id]
    );
    console.log(`✅ Regalo ${id} eliminado (soft delete)`);
    res.sendStatus(204);
  } catch (err) {
    console.error('❌ Error en DELETE /api/gifts:', err);
    res.status(500).json({ error: 'Error al eliminar regalo' });
  }
});

// =====================
// POST seleccionar regalos
// =====================
app.post('/api/select', async (req, res) => {
  const { username, selections } = req.body;

  console.log('📥 POST /api/select - Username:', username, 'Selections:', selections);

  try {
    for (const s of selections) {
      await pool.query(
        `INSERT INTO gift_selections (gift_id, username, quantity)
         VALUES ($1, $2, $3)`,
        [s.giftId, username, s.quantity]
      );
    }

    console.log(`✅ ${selections.length} selecciones guardadas para ${username}`);
    res.sendStatus(201);
  } catch (err) {
    console.error('❌ Error en POST /api/select:', err);
    res.status(500).json({ error: err.message });
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
    console.error('❌ Error GET /api/selections:', err);
    res.status(500).json({ error: 'Error obteniendo selecciones' });
  }
});

// =====================
// Health check
// =====================
app.get('/health', (req, res) => {
  res.json({ status: '✅ API funcionando' });
});

// =====================
// Iniciar servidor
// =====================
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 API corriendo en http://localhost:${PORT}`);
});
