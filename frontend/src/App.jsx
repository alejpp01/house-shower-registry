import { useState, useEffect } from 'react';

const API_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:3001';

function App() {
  const [gifts, setGifts] = useState([]);
  const [name, setName] = useState('');
  const [image, setImage] = useState('');
  const [category, setCategory] = useState('');
  const [details, setDetails] = useState('');
  const [buyurl, setBuyurl] = useState('');
  const [price, setPrice] = useState('');
  const [showInVip, setShowInVip] = useState(false);

  // =====================
  // Cargar regalos
  // =====================
  const loadGifts = async () => {
    const res = await fetch(`${API_URL}/api/gifts`);
    const data = await res.json();
    setGifts(data);
  };

  useEffect(() => {
    loadGifts();
  }, []);

  // =====================
  // Agregar regalo
  // =====================
  const addGift = async () => {
    try {
      const res = await fetch(`${API_URL}/api/gifts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          image,
          category,
          details,
          buyurl,
          price,
          isVip: showInVip
        })
      });

      if (!res.ok) {
        throw new Error('Error al crear regalo');
      }

      setName('');
      setImage('');
      setCategory('');
      setDetails('');
      setBuyurl('');
      setPrice('');
      setShowInVip(false);

      loadGifts();
    } catch (err) {
      alert('Error al crear regalo');
      console.error(err);
    }
  };

  // =====================
  // Separar regalos
  // =====================
  const vipGifts = gifts.filter(g => g.is_vip);
  const normalGifts = gifts.filter(g => !g.is_vip);

  return (
    <div style={{ padding: 20 }}>
      <h2>Agregar Regalo</h2>

      <input
        placeholder="Nombre"
        value={name}
        onChange={e => setName(e.target.value)}
      />

      <input
        placeholder="URL imagen"
        value={image}
        onChange={e => setImage(e.target.value)}
      />

      <input
        placeholder="Categoría"
        value={category}
        onChange={e => setCategory(e.target.value)}
      />

      <textarea
        placeholder="Descripción"
        value={details}
        onChange={e => setDetails(e.target.value)}
      />

      <input
        placeholder="Link compra"
        value={buyurl}
        onChange={e => setBuyurl(e.target.value)}
      />

      <input
        type="number"
        placeholder="Precio"
        value={price}
        onChange={e => setPrice(e.target.value)}
      />

      <label style={{ display: 'block', marginTop: 10 }}>
        <input
          type="checkbox"
          checked={showInVip}
          onChange={e => setShowInVip(e.target.checked)}
        />
        Mostrar en Zona VIP 👑
      </label>

      <button onClick={addGift}>🎁 Agregar regalo</button>

      <hr />

      <h2>👑 Zona VIP</h2>
      {vipGifts.map(g => (
        <div key={g.id}>{g.name}</div>
      ))}

      <h2>🎁 Regalos normales</h2>
      {normalGifts.map(g => (
        <div key={g.id}>{g.name}</div>
      ))}
    </div>
  );
}

export default App;
