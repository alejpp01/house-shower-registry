import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

function HouseShowerApp() {
  const [view, setView] = useState('public');
  const [guestName, setGuestName] = useState('');
  const [hasEntered, setHasEntered] = useState(false);
  const [guestToken, setGuestToken] = useState('');
  const [gifts, setGifts] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [releaseConfirm, setReleaseConfirm] = useState(null);

  const [newGift, setNewGift] = useState({
    name: '',
    image: '',
    category: '',
    details: '',
    buyUrl: '',
    price: '',
    isVip: false
  });

  useEffect(() => {
    fetchGifts();
    fetchReservations();
  }, []);

  const fetchGifts = async () => {
    try {
      const res = await fetch(`${API_URL}/api/gifts`);
      const data = await res.json();

      const normalized = data.map(g => ({
        ...g,
        isVip:
          g.isVip === 1 ||
          g.isVip === '1' ||
          g.isVip === true ||
          g.isVip === 'true'
      }));

      setGifts(normalized);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchReservations = async () => {
    try {
      const res = await fetch(`${API_URL}/api/reservations`);
      const data = await res.json();
      setReservations(data);
    } catch (err) {
      console.error(err);
    }
  };

  const continueAsGuest = () => {
    if (!guestName.trim()) {
      alert('Ingresa tu nombre');
      return;
    }

    const token =
      Math.random().toString(36).substring(2) +
      Date.now().toString(36);

    setGuestToken(token);
    setHasEntered(true);
  };

  const reserveGift = async (giftId) => {
    await fetch(`${API_URL}/api/reservations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        giftId,
        selectedBy: guestName,
        token: guestToken
      })
    });

    fetchGifts();
    fetchReservations();
  };

  const releaseGift = async (giftId) => {
    await fetch(`${API_URL}/api/reservations/${giftId}`, {
      method: 'DELETE'
    });

    fetchReservations();
    setReleaseConfirm(null);
  };

  const addGift = async () => {
    if (!newGift.name.trim()) {
      alert('Nombre requerido');
      return;
    }

    const payload = {
      ...newGift,
      price: newGift.price || 0,
      isVip: newGift.isVip ? 1 : 0
    };

    const res = await fetch(`${API_URL}/api/gifts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      alert('Error al crear regalo');
      return;
    }

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
  };

  const deleteGift = async (id) => {
    await fetch(`${API_URL}/api/gifts/${id}`, {
      method: 'DELETE'
    });
    fetchGifts();
  };

  const toggleGiftVip = async (id) => {
    const gift = gifts.find(g => g.id === id);
    if (!gift) return;

    await fetch(`${API_URL}/api/gifts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...gift,
        isVip: gift.isVip ? 0 : 1
      })
    });

    fetchGifts();
  };

  const isReserved = (giftId) =>
    reservations.some(r => r.giftId == giftId);

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      {/* TU JSX DE UI VA AQUÍ SIN CAMBIOS */}
    </div>
  );
}

export default HouseShowerApp;
