import express from 'express';
import cors from 'cors';
import pkg from 'pg';

const { Pool } = pkg;

const app = express();
const PORT = process.env.PORT || 3001;

/* ===============================
   MIDDLEWARE
================================ */
app.use(cors());
app.use(express.json());

/* ===============================
   DATABASE (NEON)
================================ */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

/* ===============================
   TEST
================================ */
app.get('/', (req, res) => {
  res.send('House Shower Registry API running');
});

/* ===============================
   GIFTS
================================ */
app.get('/api/gifts', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        name,
        image,
        category,
        details,
        "buyUrl",
        price,
        "isVip"
      FROM gifts
      ORDER BY id DESC
    `);

    res.json(result.rows);
  } catch (err) {
    console.error('Error gifts:', err);
    res.status(500).json({ error: 'Error loading gifts' });
  }
});

/* ===============================
   RESERVATIONS  ✅ CORREGIDO
================================ */
app.get('/api/reservations', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        giftid AS "giftId",
        selectedby AS "selectedBy"
      FROM reservations
    `);

    res.json(result.rows);
  } catch (err) {
    console.error('Error reservations:', err);
    res.status(500).json({ error: 'Error loading reservations' });
  }
});

/* ===============================
   CREATE RESERVATION
================================ */
app.post('/api/reservations', async (req, res) => {
  const { giftId, selectedBy, token } = req.body;

  try {
    await pool.query(
      `INSERT INTO reservations (giftid, selectedby, token)
       VALUES ($1, $2, $3)`,
      [giftId, selectedBy, token]
    );

    res.json({ success: true });
  } catch (err) {
    console.error('Error creating reservation:', err);
    res.status(500).json({ error: 'Error creating reservation' });
  }
});

/* ===============================
   SERVER
================================ */
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
