import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const result = await pool.query(`
        SELECT
          id,
          name,
          category,
          image_url   AS image,
          description AS details,
          buy_url     AS "buyUrl",
          price,
          "isVip"
        FROM gifts
        WHERE active = true
        ORDER BY id DESC
      `);
      return res.status(200).json(result.rows);
    }

  if (req.method === 'POST') {
  const { name, image, category, details, buyUrl, price, isVip } = req.body;

  const result = await pool.query(`
    INSERT INTO gifts
      (name, image_url, category, description, buy_url, price, "isVip", active)
    VALUES
      ($1,$2,$3,$4,$5,$6,$7,true)
    RETURNING *
  `, [
    name,
    image || null,
    category || null,
    details || null,
    buyUrl || null,
    Number(price) || 0,
    Boolean(isVip)
  ]);

  return res.status(201).json(result.rows[0]);
}


    if (req.method === 'PUT') {
      const { id } = req.query;
      const { name, image, category, details, buyUrl, price, isVip } = req.body;

      const result = await pool.query(`
        UPDATE gifts SET
          name=$1,
          image_url=$2,
          category=$3,
          description=$4,
          buy_url=$5,
          price=$6,
          "isVip"=$7
        WHERE id=$8
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

      return res.status(200).json(result.rows[0]);
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      await pool.query('DELETE FROM gifts WHERE id=$1', [id]);
      return res.status(200).json({ success: true });
    }

    res.status(405).json({ error: 'Método no permitido' });
  } catch (err) {
    console.error('❌ /api/gifts', err);
    res.status(500).json({ error: 'Error interno' });
  }
}
