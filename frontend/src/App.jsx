import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

function HouseShowerApp() {
  const [view, setView] = useState('public');
  const [guestName, setGuestName] = useState('');
  const [hasEntered, setHasEntered] = useState(false);
  const [guestToken, setGuestToken] = useState('');
  const [gifts, setGifts] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [adminPassword, setAdminPassword] = useState('');
  const [isAdminAuth, setIsAdminAuth] = useState(false);
  const [adminTab, setAdminTab] = useState('add');
  const [newGift, setNewGift] = useState({
    name: '',
    image: '',
    category: '',
    details: '',
    buyUrl: '',
    price: '',
    isVip: false
  });
  const [releaseConfirm, setReleaseConfirm] = useState(null);

  useEffect(() => {
    fetchGifts();
    fetchReservations();
  }, []);

  const fetchGifts = async () => {
    try {
      const res = await fetch(`${API_URL}/api/gifts`);
      const data = await res.json();

      setGifts(
        data.map(g => ({
          ...g,
          isVip: g.isvip === 1 || g.isvip === true
        }))
      );
    } catch (e) {
      console.error(e);
    }
  };

  const fetchReservations = async () => {
    try {
      const res = await fetch(`${API_URL}/api/reservations`);
      setReservations(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  const addGift = async () => {
    if (!newGift.name.trim()) {
      alert('Nombre requerido');
      return;
    }

    const price = Number(newGift.price);
    if (isNaN(price)) {
      alert('Precio inválido');
      return;
    }

    const payload = {
      name: newGift.name.trim(),
      image: newGift.image || null,
      details: newGift.details || null,
      buyUrl: newGift.buyUrl || null,
      price,
      isVip: newGift.isVip ? 1 : 0
    };

    try {
      const res = await fetch(`${API_URL}/api/gifts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        alert(JSON.stringify(data));
        return;
      }

      alert('✅ Regalo agregado');
      setNewGift({
        name: '',
        image: '',
        category: '',
        details: '',
        buyUrl: '',
        price: '',
        isVip: false
      });
      fetchGifts();
    } catch (err) {
      alert(err.message);
    }
  };

  const deleteGift = async (id) => {
    await fetch(`${API_URL}/api/gifts/${id}`, { method: 'DELETE' });
    fetchGifts();
  };

  const toggleGiftVip = async (id) => {
    const gift = gifts.find(g => g.id === id);
    if (!gift) return;

    await fetch(`${API_URL}/api/gifts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...gift, isVip: gift.isVip ? 0 : 1 })
    });

    fetchGifts();
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-10 rounded-xl shadow-xl w-full max-w-xl">
        <h1 className="text-3xl font-bold mb-6">Admin – Agregar Regalo</h1>

        <input
          className="w-full p-3 border rounded mb-3"
          placeholder="Nombre"
          value={newGift.name}
          onChange={e => setNewGift({ ...newGift, name: e.target.value })}
        />

        <input
          className="w-full p-3 border rounded mb-3"
          placeholder="Precio"
          type="number"
          value={newGift.price}
          onChange={e => setNewGift({ ...newGift, price: e.target.value })}
        />

        <label className="flex items-center gap-2 mb-4">
          <input
            type="checkbox"
            checked={newGift.isVip}
            onChange={e => setNewGift({ ...newGift, isVip: e.target.checked })}
          />
          VIP
        </label>

        <button
          onClick={addGift}
          className="w-full bg-green-600 text-white p-3 rounded font-bold"
        >
          AGREGAR
        </button>
      </div>
    </div>
  );
}

export default HouseShowerApp;
