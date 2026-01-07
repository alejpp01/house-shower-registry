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
