import { useState, useEffect } from 'react';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

function HouseShowerApp() {
  const [view, setView] = useState('public');
  const [guestName, setGuestName] = useState('');
  const [hasEntered, setHasEntered] = useState(false);
  const [guestToken, setGuestToken] = useState(localStorage.getItem('guestToken') || '');
  const [gifts, setGifts] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [adminPassword, setAdminPassword] = useState('');
  const [isAdminAuth, setIsAdminAuth] = useState(localStorage.getItem('isAdminAuth') === 'true');
  const [adminTab, setAdminTab] = useState('add');
  const [newGift, setNewGift] = useState({ name: '', image: '', category: '', details: '', buyUrl: '', price: '', isVip: false });
  const [releaseConfirm, setReleaseConfirm] = useState(null);

  useEffect(() => {
    fetchGifts();
    fetchReservations();
    const savedName = localStorage.getItem('guestName');
    const savedToken = localStorage.getItem('guestToken');
    if (savedName && savedToken) {
      setGuestName(savedName);
      setHasEntered(true);
    }
  }, []);

  const fetchGifts = async () => {
    try {
      const res = await fetch(`${API_URL}/api/gifts`);
      const data = await res.json();
      setGifts(data);
    } catch (e) { console.error(e); }
  };

  const fetchReservations = async () => {
    try {
      const res = await fetch(`${API_URL}/api/reservations`);
      const data = await res.json();
      setReservations(data);
    } catch (e) { console.error(e); }
  };

  const continueAsGuest = () => {
    if (!guestName.trim()) {
      alert('Por favor ingresa tu nombre');
      return;
    }
    const token = Math.random().toString(36).substr(2) + Date.now().toString(36);
    localStorage.setItem('guestName', guestName);
    localStorage.setItem('guestToken', token);
    setGuestToken(token);
    setHasEntered(true);
  };

  const goBack = () => {
    setHasEntered(false);
    setGuestName('');
    setGuestToken('');
    localStorage.removeItem('guestName');
    localStorage.removeItem('guestToken');
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

  const addGift = async () => {
    console.log('Starting addGift with:', newGift);
    
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
      
      console.log('Sending payload:', payload);
      
      const res = await fetch(`${API_URL}/api/gifts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      console.log('Response from server:', data);
      
      if (!res.ok) {
        alert('Error: ' + JSON.stringify(data));
        return;
      }

      alert('✅ ¡Regalo agregado!');
      setNewGift({ name: '', image: '', category: '', details: '', buyUrl: '', price: '', isVip: false });
      fetchGifts();
    } catch (error) {
      console.error('Fatal error:', error);
      alert('❌ Error: ' + error.message);
    }
  };

  const deleteGift = async (id) => {
    await fetch(`${API_URL}/api/gifts/${id}`, { method: 'DELETE' });
    fetchGifts();
  };

  const toggleGiftVip = async (id, currentVipStatus) => {
    try {
      const gift = gifts.find(g => g.id === id);
      const res = await fetch(`${API_URL}/api/gifts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...gift,
          isVip: currentVipStatus ? 0 : 1
        })
      });
      const updated = await res.json();
      setGifts(gifts.map(g => g.id === id ? updated : g));
    } catch (error) {
      console.error('Error toggling VIP:', error);
    }
  };

  const isReserved = (giftId) => reservations.some(r => r.giftId == giftId);
  const vipGifts = gifts.filter(g => g.isVip === 1 || g.isVip === true);

  // VISTA VIP
  if (view === 'vip' && hasEntered) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-black to-gray-900 py-20 px-4 text-white">
        <nav className="max-w-6xl mx-auto flex justify-between items-center mb-16">
          <button onClick={() => setView('public')} className="text-amber-400 hover:text-amber-300 font-serif text-xl">← Regalos Normales</button>
          <h1 className="text-4xl font-serif text-amber-400 drop-shadow-2xl">House Shower VIP</h1>
        </nav>
        <div className="max-w-6xl mx-auto">
          <h2 className="text-5xl font-serif text-amber-400 text-center mb-20 drop-shadow-2xl">Zona Exclusiva Premium</h2>
          {vipGifts.length === 0 ? (
            <p className="text-center text-slate-400 text-xl">No hay regalos en zona VIP. ¡Márcalos desde el Admin! 👑</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {vipGifts.map(gift => (
                <div key={gift.id} className="bg-slate-800/50 backdrop-blur-sm border border-amber-500/40 rounded-3xl p-8 shadow-2xl hover:shadow-amber-500/50 hover:-translate-y-3 transition-all duration-500">
                  <img src={gift.image} alt={gift.name} className="w-full h-64 object-cover rounded-2xl mb-6 shadow-2xl" />
                  <div className="text-right mb-4">
                    <span className="bg-amber-500/20 text-amber-400 border border-amber-500/40 px-4 py-2 rounded-full text-lg font-serif font-semibold">
                      👑 Premium
                    </span>
                  </div>
                  <h3 className="text-2xl font-serif text-white mb-4">{gift.name}</h3>
                  <p className="text-slate-300 font-light mb-6 leading-relaxed">{gift.details}</p>
                  {isReserved(gift.id) ? (
                    <button onClick={() => setReleaseConfirm(gift.id)} className="w-full bg-slate-700/50 hover:bg-slate-600 border border-slate-500/50 text-slate-300 py-4 px-6 rounded-2xl font-serif font-semibold transition-all">
                      Liberar Reserva
                    </button>
                  ) : (
                    <button onClick={() => reserveGift(gift.id)} className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-serif font-bold py-4 px-6 rounded-2xl shadow-xl hover:shadow-amber-500/50 hover:scale-105 transition-all duration-300">
                      Reservar Exclusivo ✨
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        {releaseConfirm && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-slate-900 border border-amber-500/40 p-8 rounded-3xl max-w-md w-full mx-4 shadow-2xl">
              <h3 className="text-2xl font-serif text-amber-400 mb-4">Confirmar Liberación</h3>
              <p className="text-slate-300 mb-6">¿Liberar "{gifts.find(g => g.id == releaseConfirm)?.name}"?</p>
              <div className="flex gap-4">
                <button onClick={() => releaseGift(releaseConfirm)} className="flex-1 bg-amber-500 hover:bg-amber-600 text-black font-serif py-3 px-6 rounded-xl font-bold transition-all">
                  Sí, Liberar
                </button>
                <button onClick={() => setReleaseConfirm(null)} className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-300 font-serif py-3 px-6 rounded-xl transition-all">
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* NAVBAR */}
      <nav className="bg-white/80 backdrop-blur-md shadow-lg border-b">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            🎁 House Shower Registry
          </h1>
          <div className="flex gap-4 items-center">
            {hasEntered && (
              <span className="text-sm bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium">
                👋 {guestName}
              </span>
            )}
            <button
              onClick={() => setView(view === 'vip' && hasEntered ? 'public' : 'vip')}
              disabled={!hasEntered}
              className="bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-black font-bold py-2 px-6 rounded-xl shadow-lg hover:shadow-amber-500/50 transition-all duration-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ✨ Zona VIP
            </button>
            <button
              onClick={() => setView(isAdminAuth ? 'admin' : 'admin-login')}
              className="bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 text-white font-bold py-2 px-6 rounded-xl shadow-lg hover:shadow-gray-500/50 transition-all"
            >
              🔐 Admin
            </button>
          </div>
        </div>
      </nav>

      {/* PASO 1: FORM INGRESO NOMBRE */}
      {!hasEntered && view === 'public' && (
        <div className="max-w-md mx-auto mt-32 p-12 bg-white rounded-3xl shadow-2xl border border-gray-200">
          <h2 className="text-4xl font-bold mb-8 text-gray-800">¡Bienvenido al House Shower!</h2>
          <p className="text-gray-600 mb-8 text-lg">Ingresa tu nombre completo para continuar</p>
          <input
            type="text"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && continueAsGuest()}
            className="w-full p-6 border-2 border-gray-200 rounded-3xl text-2xl mb-8 text-center focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all shadow-lg"
            placeholder="Tu nombre completo"
            autoFocus
          />
          <button 
            onClick={continueAsGuest}
            disabled={!guestName.trim()}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-6 px-8 rounded-3xl font-bold text-xl shadow-2xl hover:shadow-blue-500/50 hover:scale-105 transition-all duration-300 disabled:opacity-50"
          >
            ➡️ Continuar
          </button>
        </div>
      )}

      {/* PASO 2: REGALOS */}
      {hasEntered && view === 'public' && (
        <div className="max-w-6xl mx-auto py-20 px-6">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Regalos Disponibles
            </h2>
            <p className="text-xl text-gray-600">¡Elige lo que más te guste! ✨</p>
            <button 
              onClick={goBack}
              className="mt-6 bg-gray-400 hover:bg-gray-500 text-white px-6 py-2 rounded-xl font-bold text-sm"
            >
              ← Cambiar nombre
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {gifts.filter(g => g.isVip !== 1 && g.isVip !== true).map(gift => (
              <div key={gift.id} className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-gray-200">
                <img src={gift.image || 'https://via.placeholder.com/400x300?text=Regalo'} alt={gift.name} className="w-full h-64 object-cover rounded-2xl mb-6 shadow-lg" />
                <h3 className="text-2xl font-bold mb-3 text-gray-800">{gift.name}</h3>
                {gift.price && <div className="text-right mb-4"><span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-lg font-bold">${gift.price}</span></div>}
                <p className="text-gray-600 mb-6 leading-relaxed">{gift.details}</p>
                {isReserved(gift.id) ? (
                  <button className="w-full bg-gray-200 text-gray-700 py-4 px-6 rounded-2xl font-bold text-lg shadow-md cursor-not-allowed">✅ Reservado</button>
                ) : (
                  <button 
                    onClick={() => reserveGift(gift.id)} 
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white py-4 px-6 rounded-2xl font-bold text-lg shadow-xl hover:shadow-blue-500/50 hover:scale-105 transition-all duration-300"
                  >
                    🎁 Reservar Ahora
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* LOGIN ADMIN */}
      {view === 'admin-login' && (
        <div className="max-w-md mx-auto mt-32 p-12 bg-white rounded-3xl shadow-2xl border">
          <h2 className="text-4xl font-bold mb-8 text-gray-800 text-center">🔐 Panel Admin</h2>
          <input
            type="password"
            placeholder="Contraseña admin"
            value={adminPassword}
            onChange={(e) => setAdminPassword(e.target.value)}
            className="w-full p-6 border-2 border-gray-300 rounded-3xl text-xl mb-8 text-center focus:ring-4 focus:ring-indigo-200 focus:border-indigo-500 shadow-lg"
          />
          <button 
            onClick={() => {
              if (adminPassword === 'Juanchoesgey') {
                setIsAdminAuth(true);
                localStorage.setItem('isAdminAuth', 'true');
                setView('admin');
              } else {
                alert('Contraseña incorrecta');
              }
            }}
            className="w-full bg-gradient-to-r from-gray-800 to-gray-900 text-white py-6 px-8 rounded-3xl font-bold text-xl shadow-2xl hover:shadow-gray-500/50 hover:scale-105 transition-all"
          >
            Entrar al Admin
          </button>
          <p className="text-xs text-gray-500 mt-4 text-center">Contraseña: Juanchoesgey</p>
        </div>
      )}

      {/* PANEL ADMIN */}
      {view === 'admin' && isAdminAuth && (
        <div className="max-w-4xl mx-auto mt-12 p-12 bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-gray-200">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              🎛️ Panel de Administración
            </h2>
            <button 
              onClick={() => {
                setIsAdminAuth(false);
                localStorage.removeItem('isAdminAuth');
                setView('public');
              }}
              className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-2xl font-bold shadow-lg hover:shadow-red-500/50 transition-all"
            >
              Cerrar Sesión
            </button>
          </div>

          {/* TABS */}
          <div className="grid grid-cols-2 gap-4 mb-12">
            <button 
              onClick={() => setAdminTab('add')}
              className={`p-6 rounded-2xl font-bold text-xl shadow-lg transition-all ${
                adminTab === 'add' 
                  ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-emerald-500/50 scale-105' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-800 hover:scale-105'
              }`}
            >
              ➕ Agregar Regalo
            </button>
            <button 
              onClick={() => setAdminTab('list')}
              className={`p-6 rounded-2xl font-bold text-xl shadow-lg transition-all ${
                adminTab === 'list' 
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-blue-500/50 scale-105' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-800 hover:scale-105'
              }`}
            >
              📋 Gestionar Regalos
            </button>
          </div>

          {/* FORM AGREGAR */}
          {adminTab === 'add' && (
            <div className="space-y-6">
              <input
                type="text"
                placeholder="Nombre del regalo *"
                value={newGift.name}
                onChange={(e) => setNewGift({...newGift, name: e.target.value})}
                className="w-full p-6 border-2 border-gray-200 rounded-3xl text-xl focus:ring-4 focus:ring-emerald-200 focus:border-emerald-500 transition-all shadow-lg"
              />
              <input
                type="url"
                placeholder="URL imagen"
                value={newGift.image}
                onChange={(e) => setNewGift({...newGift, image: e.target.value})}
                className="w-full p-6 border-2 border-gray-200 rounded-3xl focus:ring-4 focus:ring-emerald-200 focus:border-emerald-500"
              />
              <input
                type="text"
                placeholder="Categoría"
                value={newGift.category}
                onChange={(e) => setNewGift({...newGift, category: e.target.value})}
                className="w-full p-6 border-2 border-gray-200 rounded-3xl focus:ring-4 focus:ring-emerald-200 focus:border-emerald-500"
              />
              <textarea
                placeholder="Descripción"
                value={newGift.details}
                onChange={(e) => setNewGift({...newGift, details: e.target.value})}
                rows="4"
                className="w-full p-6 border-2 border-gray-200 rounded-3xl focus:ring-4 focus:ring-emerald-200 focus:border-emerald-500 resize-vertical"
              />
              <input
                type="url"
                placeholder="Link compra"
                value={newGift.buyUrl}
                onChange={(e) => setNewGift({...newGift, buyUrl: e.target.value})}
                className="w-full p-6 border-2 border-gray-200 rounded-3xl focus:ring-4 focus:ring-emerald-200 focus:border-emerald-500"
              />
              <input
                type="number"
                placeholder="Precio ($)"
                value={newGift.price}
                onChange={(e) => setNewGift({...newGift, price: e.target.value})}
                className="w-full p-6 border-2 border-gray-200 rounded-3xl focus:ring-4 focus:ring-emerald-200 focus:border-emerald-500"
              />
              
              <div className="flex items-center gap-4 p-6 bg-amber-50 border-2 border-amber-300 rounded-3xl">
                <input
                  type="checkbox"
                  id="isVip"
                  checked={newGift.isVip}
                  onChange={(e) => setNewGift({...newGift, isVip: e.target.checked})}
                  className="w-6 h-6 cursor-pointer accent-amber-500"
                />
                <label htmlFor="isVip" className="cursor-pointer text-xl font-bold text-amber-900">
                  👑 Mostrar en Zona VIP
                </label>
              </div>

              <button
                onClick={addGift}
                disabled={!newGift.name.trim()}
                className="w-full bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-500 hover:to-green-600 text-white py-8 px-12 rounded-3xl font-bold text-2xl shadow-2xl hover:shadow-emerald-500/50 hover:scale-105 transition-all duration-300 disabled:opacity-50"
              >
                🎁 ¡AGREGAR REGALO!
              </button>
            </div>
          )}

          {/* LISTA REGALOS */}
          {adminTab === 'list' && (
            <div className="space-y-4">
              {gifts.map(gift => (
                <div key={gift.id} className="flex items-center justify-between p-8 bg-gradient-to-r from-gray-50 to-gray-100 rounded-3xl hover:shadow-lg transition-all border border-gray-200">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <h4 className="text-2xl font-bold text-gray-800">{gift.name}</h4>
                      {gift.isVip === 1 || gift.isVip === true ? (
                        <span className="px-4 py-2 rounded-full text-lg font-bold bg-amber-100 text-amber-800">👑 VIP</span>
                      ) : (
                        <span className="px-4 py-2 rounded-full text-lg font-bold bg-blue-100 text-blue-800">📦 Normal</span>
                      )}
                    </div>
                    <p className="text-gray-600">{gift.details}</p>
                  </div>
                  <div className="flex gap-4 ml-4">
                    <button 
                      onClick={() => toggleGiftVip(gift.id, gift.isVip)}
                      className={`px-6 py-3 rounded-2xl font-bold shadow-lg transition-all whitespace-nowrap ${
                        gift.isVip === 1 || gift.isVip === true
                          ? 'bg-amber-500 hover:bg-amber-600 text-white hover:shadow-amber-500/50'
                          : 'bg-gray-300 hover:bg-gray-400 text-gray-800'
                      }`}
                    >
                      {gift.isVip === 1 || gift.isVip === true ? '👑 Quitar' : '➕ Marcar VIP'}
                    </button>
                    <button 
                      onClick={() => deleteGift(gift.id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg hover:shadow-red-500/50 transition-all whitespace-nowrap"
                    >
                      🗑️ Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL LIBERAR */}
      {releaseConfirm && view !== 'vip' && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-3xl max-w-md w-full mx-4 shadow-2xl">
            <h3 className="text-2xl font-bold mb-4">Confirmar Liberación</h3>
            <div className="flex gap-4">
              <button onClick={() => releaseGift(releaseConfirm)} className="flex-1 bg-red-500 text-white py-3 px-6 rounded-xl font-bold">Sí</button>
              <button onClick={() => setReleaseConfirm(null)} className="flex-1 bg-gray-300 py-3 px-6 rounded-xl font-bold">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HouseShowerApp;