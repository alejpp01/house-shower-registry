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

  /* =========================
     FETCH GIFTS (CORREGIDO)
     ========================= */
  const fetchGifts = async () => {
    try {
      const res = await fetch(`${API_URL}/api/gifts`);
      const data = await res.json();

      // 🔑 NORMALIZAR isVip A NUMBER
      const normalized = data.map(gift => ({
        ...gift,
        isVip: Number(gift.isVip)
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

    const payload = {
      ...newGift,
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
  };

  const deleteGift = async (id) => {
    await fetch(`${API_URL}/api/gifts/${id}`, { method: 'DELETE' });
    fetchGifts();
  };

  /* =========================
     TOGGLE VIP (CORREGIDO)
     ========================= */
  const toggleGiftVip = async (id) => {
    const gift = gifts.find(g => g.id === id);
    if (!gift) return;

    const payload = {
      ...gift,
      isVip: gift.isVip === 1 ? 0 : 1
    };

    const res = await fetch(`${API_URL}/api/gifts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      alert('Error al actualizar VIP');
      return;
    }

    fetchGifts();
  };

  const isReserved = (giftId) =>
    reservations.some(r => Number(r.giftId) === Number(giftId));

  /* =========================
     FILTROS CORREGIDOS
     ========================= */
  const normalGifts = gifts.filter(g => g.isVip === 0);
  const vipGifts = gifts.filter(g => g.isVip === 1);

  /* =========================
     VISTA VIP
     ========================= */
  if (view === 'vip' && hasEntered) {
    return (
      <div className="min-h-screen bg-black text-white p-10">
        <button onClick={() => setView('public')}>
          ← Regalos Normales
        </button>

        <h1 className="text-4xl my-6">👑 Zona VIP</h1>

        {vipGifts.length === 0 && (
          <p>No hay regalos VIP</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {vipGifts.map(gift => (
            <div key={gift.id} className="border p-4 rounded">
              <h3 className="text-xl">{gift.name}</h3>
              <p>{gift.details}</p>

              {isReserved(gift.id) ? (
                <button onClick={() => setReleaseConfirm(gift.id)}>
                  Liberar
                </button>
              ) : (
                <button onClick={() => reserveGift(gift.id)}>
                  Reservar VIP
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* =========================
     VISTA PUBLICA
     ========================= */
  return (
    <div className="min-h-screen p-10">
      {!hasEntered && (
        <>
          <h1>House Shower</h1>
          <input
            value={guestName}
            onChange={e => setGuestName(e.target.value)}
            placeholder="Tu nombre"
          />
          <button onClick={continueAsGuest}>
            Entrar
          </button>
        </>
      )}

      {hasEntered && (
        <>
          <button onClick={() => setView('vip')}>
            👑 Zona VIP
          </button>

          <h2>🎁 Regalos Normales</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {normalGifts.map(gift => (
              <div key={gift.id} className="border p-4 rounded">
                <h3>{gift.name}</h3>
                <p>{gift.details}</p>

                {isReserved(gift.id) ? (
                  <span>Reservado</span>
                ) : (
                  <button onClick={() => reserveGift(gift.id)}>
                    Reservar
                  </button>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default HouseShowerApp;
