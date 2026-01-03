const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Conexión a Neon
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// GET: Obtener todos los regalos
app.get('/api/gifts', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM gifts ORDER BY id DESC');
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener regalos' });
  }
});

// GET: Obtener todas las reservaciones
app.get('/api/reservations', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM reservations');
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener reservaciones' });
  }
});

// POST: Agregar regalo
app.post('/api/gifts', async (req, res) => {
  const { name, image, category, details, buyUrl } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO gifts (name, image, category, details, buyUrl) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, image, category, details, buyUrl]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al agregar regalo' });
  }
});

// POST: Reservar regalo
app.post('/api/reservations', async (req, res) => {
  const { giftId, selectedBy, token } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO reservations (giftId, selectedBy, token) VALUES ($1, $2, $3) RETURNING *',
      [giftId, selectedBy, token]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al reservar' });
  }
});

// DELETE: Liberar regalo
app.delete('/api/reservations/:giftId', async (req, res) => {
  const { giftId } = req.params;
  try {
    await pool.query('DELETE FROM reservations WHERE giftId = $1', [giftId]);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al liberar' });
  }
});

// DELETE: Eliminar regalo
app.delete('/api/gifts/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM gifts WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar' });
  }
});

// PUT: Actualizar regalo
app.put('/api/gifts/:id', async (req, res) => {
  const { id } = req.params;
  const { name, image, category, details, buyUrl } = req.body;
  try {
    const result = await pool.query(
      'UPDATE gifts SET name = $1, image = $2, category = $3, details = $4, buyUrl = $5 WHERE id = $6 RETURNING *',
      [name, image, category, details, buyUrl, id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar' });
  }
});

app.listen(3001, () => console.log('API en puerto 3001'));
    