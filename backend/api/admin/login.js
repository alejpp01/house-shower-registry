export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { password } = req.body;
  const ADMIN_SECRET = process.env.ADMIN_SECRET || 'juanchoesgey';

  if (password === ADMIN_SECRET) {
    // En producción, crear JWT aquí
    res.status(200).json({
      success: true,
      message: 'Acceso de admin confirmado',
      token: 'admin-token-' + Date.now()
    });
  } else {
    res.status(401).json({
      success: false,
      error: 'Clave secreta incorrecta'
    });
  }
}
