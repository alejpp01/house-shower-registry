import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const r = await pool.query('SELECT * FROM reservations');
      return res.json(r.rows);
    }

    if (req.method === 'POST') {
      const { giftId, selectedBy, token } = req.body;
      const r = await pool.query(
        `INSERT INTO reservations (gift_id, guest_name, guest_token)
         VALUES ($1,$2,$3) RETURNING *`,
        [giftId, selectedBy, token]
      );
      return res.json(r.rows[0]);
    }

    if (req.method === 'DELETE') {
      const { giftId } = req.query;
      await pool.query('DELETE FROM reservations WHERE gift_id=$1', [giftId]);
      return res.json({ success: true });
    }

    res.status(405).json({ error: 'Método no permitido' });
  } catch (err) {
    console.error('❌ /api/reservations', err);
    res.status(500).json({ error: 'Error interno' });
  }
}
