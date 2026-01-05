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
    try {
      const res = await fetch(`${API_URL}/api/gifts`);
      const data = await res.json();

      const normalized = data.map(gift => ({
        ...gift,
        isVip:
          gift.isvip === 1 ||
          gift.isvip === "1" ||
          gift.isvip === true ||
          gift.isvip === "true"
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
    const token = Math.random().toString(36).substr(2) + Date.now().toString(36);
    setGuestToken(token);
    setHasEntered(true);
  };

  const reserveGift = async (giftId) => {
    await fetch(`${API_URL}/api/reservations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ giftId, selectedBy: guestName, token: guestToken })
    });
    fetchGifts();
    fetchReservations();
  };

  const releaseGift = async (giftId) => {
    await fetch(`${API_URL}/api/reservations/${giftId}`, { method: 'DELETE' });
    fetchReservations();
    setReleaseConfirm(null);
  };

  /* ===========================
     ✅ FUNCIÓN CORREGIDA
     =========================== */
  const addGift = async () => {
    if (!newGift.name.trim()) {
      alert('Por favor ingresa el nombre del regalo');
      return;
    }

    const priceNumber = Number(newGift.price);
    if (isNaN(priceNumber)) {
      alert('El precio debe ser un número válido');
      return;
    }

    const payload = {
      name: newGift.name.trim(),
      image: newGift.image || null,
      details: newGift.details || null,
      buyUrl: newGift.buyUrl || null,
      price: priceNumber,
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
    await fetch(`${API_URL}/api/gifts/${id}`, { method: 'DELETE' });
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

    if (res.ok) {
      fetchGifts();
    }
  };

  const isReserved = (giftId) =>
    reservations.some(r => r.giftid == giftId);

  const normalGifts = gifts.filter(g => !g.isVip);
  const vipGifts = gifts.filter(g => g.isVip);

  /* =========
     JSX
     ========= */

  return (
    <div>
      {/* El JSX visual permanece igual al que ya tienes */}
      {/* No se toca porque el error NO estaba en la UI */}
      {/* Tu layout funciona correctamente */}
    </div>
  );
}

export default HouseShowerApp;
