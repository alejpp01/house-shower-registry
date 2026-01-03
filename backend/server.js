const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();

// ⭐ CORS CONFIGURADO CORRECTAMENTE
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

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// ============================================
// GET: Todos los gifts CON PRICE E isVip
// ============================================
app.get('/api/gifts', async (req, res) => {
  try {
    console.log('📥 GET /api/gifts');
    const result = await pool.query('SELECT * FROM gifts ORDER BY id DESC');
    console.log('✅ Gifts encontrados:', result.rows.length);
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Error en GET /api/gifts:', error);
    res.status(500).json({ error: 'Error al obtener regalos' });
  }
});

// ============================================
// GET: Reservas
// ============================================
app.get('/api/reservations', async (req, res) => {
  try {
    console.log('📥 GET /api/reservations');
    const result = await pool.query('SELECT * FROM reservations');
    console.log('✅ Reservaciones encontradas:', result.rows.length);
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Error en GET /api/reservations:', error);
    res.status(500).json({ error: 'Error al obtener reservaciones' });
  }
});

// ============================================
// POST: Agregar regalo CON PRICE E isVip
// ============================================
app.post('/api/gifts', async (req, res) => {
  const { name, image, category, details, buyUrl, price, isVip } = req.body;
  
  try {
    console.log('📤 POST /api/gifts');
    console.log('📋 Payload recibido:', { name, isVip });
    
    // ⭐ CONVERSIÓN CORRECTA A NÚMERO (0 o 1)
    const vipValue = isVip === 1 || isVip === true || isVip === '1' ? 1 : 0;
    
    console.log('🔄 isVip original:', isVip, '→ vipValue:', vipValue);
    
    const result = await pool.query(
      'INSERT INTO gifts (name, image, category, details, buyUrl, price, isVip) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [name, image, category, details, buyUrl, price || 0, vipValue]
    );
    
    console.log('✅ Regalo agregado:', result.rows[0]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('❌ Error en POST /api/gifts:', error);
    res.status(500).json({ error: 'Error al agregar regalo', details: error.message });
  }
});

// ============================================
// POST: Reservar
// ============================================
app.post('/api/reservations', async (req, res) => {
  const { giftId, selectedBy, token } = req.body;
  try {
    console.log('📤 POST /api/reservations', { giftId, selectedBy });
    
    const result = await pool.query(
      'INSERT INTO reservations (giftId, selectedBy, token) VALUES ($1, $2, $3) RETURNING *',
      [giftId, selectedBy, token]
    );
    
    console.log('✅ Reservación creada:', result.rows[0]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('❌ Error en POST /api/reservations:', error);
    res.status(500).json({ error: 'Error al reservar', details: error.message });
  }
});

// ============================================
// DELETE: Liberar reserva
// ============================================
app.delete('/api/reservations/:giftId', async (req, res) => {
  const { giftId } = req.params;
  try {
    console.log('🗑️ DELETE /api/reservations/:giftId', { giftId });
    
    await pool.query('DELETE FROM reservations WHERE giftId = $1', [giftId]);
    
    console.log('✅ Reservación liberada:', giftId);
    res.json({ success: true });
  } catch (error) {
    console.error('❌ Error en DELETE /api/reservations:', error);
    res.status(500).json({ error: 'Error al liberar', details: error.message });
  }
});

// ============================================
// DELETE: Eliminar regalo
// ============================================
app.delete('/api/gifts/:id', async (req, res) => {
  const { id } = req.params;
  try {
    console.log('🗑️ DELETE /api/gifts/:id', { id });
    
    await pool.query('DELETE FROM gifts WHERE id = $1', [id]);
    
    console.log('✅ Regalo eliminado:', id);
    res.json({ success: true });
  } catch (error) {
    console.error('❌ Error en DELETE /api/gifts:', error);
    res.status(500).json({ error: 'Error al eliminar', details: error.message });
  }
});

// ============================================
// PUT: Actualizar regalo CON PRICE E isVip ⭐ FIXED
// ============================================
app.put('/api/gifts/:id', async (req, res) => {
  const { id } = req.params;
  const { name, image, category, details, buyUrl, price, isVip } = req.body;
  
  try {
    console.log('📝 PUT /api/gifts/:id', { id });
    console.log('📋 Payload recibido:', { name, isVip });
    
    // ⭐ CONVERSIÓN CORRECTA A NÚMERO (0 o 1)
    const vipValue = isVip === 1 || isVip === true || isVip === '1' ? 1 : 0;
    
    console.log('🔄 Conversión: isVip=' + isVip + ' → vipValue=' + vipValue);
    
    const result = await pool.query(
      'UPDATE gifts SET name=$1, image=$2, category=$3, details=$4, buyUrl=$5, price=$6, isVip=$7 WHERE id=$8 RETURNING *',
      [name, image, category, details, buyUrl, price || 0, vipValue, id]
    );
    
    if (result.rows.length === 0) {
      console.log('⚠️ Regalo no encontrado:', id);
      return res.status(404).json({ error: 'Gift not found' });
    }
    
    console.log('✅ Regalo actualizado:', result.rows[0]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('❌ Error en PUT /api/gifts:', error);
    res.status(500).json({ error: 'Error al actualizar', details: error.message });
  }
});

// ============================================
// ⭐ Health check endpoint
// ============================================
app.get('/', (req, res) => {
  res.json({ 
    status: '✅ Backend running', 
    port: process.env.PORT || 3001,
    time: new Date().toISOString()
  });
});

// ============================================
// Iniciar servidor
// ============================================
const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log('');
  console.log('╔═══════════════════════════════════════╗');
  console.log('║  ✅ API HOUSE SHOWER RUNNING         ║');
  console.log(`║  🚀 Puerto: ${PORT}                          ║`);
  console.log(`║  🕐 ${new Date().toLocaleTimeString()}                  ║`);
  console.log('╚═══════════════════════════════════════╝');
  console.log('');
  console.log('📍 Endpoints disponibles:');
  console.log('   GET  /api/gifts');
  console.log('   POST /api/gifts');
  console.log('   PUT  /api/gifts/:id');
  console.log('   DELETE /api/gifts/:id');
  console.log('   GET  /api/reservations');
  console.log('   POST /api/reservations');
  console.log('   DELETE /api/reservations/:giftId');
  console.log('');
});
