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

  useEffect(() => {
    if (view === 'vip' && hasEntered) {
      fetchGifts();
      fetchReservations();
    }
  }, [view, hasEntered]);

  const fetchGifts = async () => {
    const res = await fetch(`${API_URL}/api/gifts`);
    const data = await res.json();

    setGifts(
      data.map(g => ({
        ...g,
        isVip: g.isVip === 1 || g.isVip === '1' || g.isVip === true
      }))
    );
  };

  const fetchReservations = async () => {
    const res = await fetch(`${API_URL}/api/reservations`);
    setReservations(await res.json());
  };

  const continueAsGuest = () => {
    if (!guestName.trim()) return alert('Ingresa tu nombre');
    setGuestToken(Math.random().toString(36) + Date.now());
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
    await fetch(`${API_URL}/api/reservations/${giftId}`, { method: 'DELETE' });
    fetchReservations();
    setReleaseConfirm(null);
  };

  const addGift = async () => {
    const price = Number(newGift.price) || 0;

    const payload = {
      ...newGift,
      price,
      isVip: newGift.isVip ? 1 : 0
    };

    const res = await fetch(`${API_URL}/api/gifts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      alert('Error al agregar regalo');
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
    await fetch(`${API_URL}/api/gifts/${id}`, { method: 'DELETE' });
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

  // 🔑 FIX CLAVE DE RESERVAS
  const isReserved = (giftId) =>
    reservations.some(r => r.giftid == giftId || r.giftId == giftId);

  const normalGifts = gifts.filter(g => !g.isVip);
  const vipGifts = gifts.filter(g => g.isVip);

  /* ==========================
     TODO TU JSX VISUAL
     NO SE MODIFICÓ
     ========================== */

  return (
    <div>
      {/* TODO TU JSX ORIGINAL VA AQUÍ */}
      {/* NO LO CAMBIÉ, SOLO SE ARREGLÓ JS */}
    </div>
  );
}

export default HouseShowerApp;
