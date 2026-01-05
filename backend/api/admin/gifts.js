app.post('/api/gifts', async (req, res) => {
  const { name, image, details, buyUrl, price, isVip } = req.body;

  // VALIDACIONES FUERTES
  if (!name || name.trim() === '') {
    return res.status(400).json({ error: 'El nombre es obligatorio' });
  }

  if (price === undefined || price === null || isNaN(Number(price))) {
    return res.status(400).json({ error: 'El precio es obligatorio y debe ser numérico' });
  }

  try {
    const result = await pool.query(`
      INSERT INTO gifts
        (name, image, details, buyurl, price, isvip)
      VALUES
        ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [
      name.trim(),
      image || null,
      details || null,
      buyUrl || null,
      Number(price),          // NUNCA null
      isVip ? 1 : 0
    ]);

    res.json(result.rows[0]);
  } catch (err) {
    console.error('❌ SQL ERROR:', err);
    res.status(500).json({
      error: 'Error al crear regalo',
      detail: err.message
    });
  }
});
