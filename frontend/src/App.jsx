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

  useEffect(() => {
    if (view === 'vip' && hasEntered) {
      fetchGifts();
      fetchReservations();
    }
  }, [view, hasEntered]);

  const fetchGifts = async () => {
    try {
      const res = await fetch(`${API_URL}/api/gifts`);
      const data = await res.json();

      const normalized = data.map(gift => ({
        ...gift,
        isVip:
          gift.isVip === 1 ||
          gift.isVip === '1' ||
          gift.isVip === true ||
          gift.isVip === 'true'
      }));

      setGifts(normalized);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchReservations = async () => {
    try {
      const res = await fetch(`${API_URL}/api/reservations`);
      const data = await res.json();
      setReservations(data);
    } catch (e) {
      console.error(e);
    }
  };

  const continueAsGuest = () => {
    if (!guestName.trim()) {
      alert('Por favor ingresa tu nombre');
      return;
    }
    const token =
      Math.random().toString(36).substr(2) +
      Date.now().toString(36);

    setGuestToken(token);
    setHasEntered(true);
  };

  const goBack = () => {
    setHasEntered(false);
    setGuestName('');
    setGuestToken('');
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
      alert('Por favor ingresa el nombre del regalo');
      return;
    }

    try {
      const payload = {
        name: newGift.name,
        image: newGift.image,
        category: newGift.category,
        details: newGift.details,
        buyUrl: newGift.buyUrl,
        price: newGift.price || '0',
        isVip: newGift.isVip ? 1 : 0
      };

      const res = await fetch(`${API_URL}/api/gifts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        alert('Error: ' + JSON.stringify(data));
        return;
      }

      alert('✅ ¡Regalo agregado!');
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
    } catch (error) {
      alert('❌ Error: ' + error.message);
    }
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

    const payload = {
      ...gift,
      isVip: gift.isVip ? 0 : 1
    };

    const res = await fetch(`${API_URL}/api/gifts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      alert('❌ Error al actualizar VIP');
      return;
    }

    fetchGifts();
  };

  const isReserved = (giftId) =>
    reservations.some(r => r.giftId == giftId);

  const normalGifts = gifts.filter(g => !g.isVip);
  const vipGifts = gifts.filter(g => g.isVip);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* TODO: JSX EXACTAMENTE IGUAL AL TUYO */}
    </div>
  );
}

export default HouseShowerApp;
