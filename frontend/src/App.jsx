import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const CORRECT_PASSWORD = 'Juanchoesgey';

function App() {
  const [currentStep, setCurrentStep] = useState('name');
  const [userName, setUserName] = useState('');
  const [gifts, setGifts] = useState([]);
  const [selectedGifts, setSelectedGifts] = useState([]);
  const [selections, setSelections] = useState([]);

  const [adminPassword, setAdminPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Admin form (crear / editar)
  const [editingGiftId, setEditingGiftId] = useState(null);
  const [name, setName] = useState('');
  const [image, setImage] = useState('');
  const [category, setCategory] = useState('');
  const [details, setDetails] = useState('');
  const [buyurl, setBuyurl] = useState('');
  const [price, setPrice] = useState('');
  const [showInVip, setShowInVip] = useState(false);
  const [availableCount, setAvailableCount] = useState(1);

  // pestaña de regalos (normal / vip)
  const [giftTab, setGiftTab] = useState('normal'); // 'normal' | 'vip'

  // =====================
  // LOAD DATA
  // =====================
  const loadGifts = async () => {
    const res = await fetch(`${API_URL}/api/gifts`);
    const data = await res.json();
    setGifts(data);
  };

  const loadSelections = async () => {
    const res = await fetch(`${API_URL}/api/selections`);
    const data = await res.json();
    setSelections(data);
  };

  useEffect(() => {
    loadGifts();
    loadSelections();
  }, []);

  // =====================
  // HELPERS
  // =====================
  const takenCount = giftId =>
    selections
      .filter(s => s.gift_id === giftId)
      .reduce((sum, s) => sum + s.quantity, 0);

  const remainingCount = gift => {
    const total = gift.available_count ?? gift.availableCount ?? 0;
    return total - takenCount(gift.id);
  };

  const isSoldOut = gift => remainingCount(gift) <= 0;

  // =====================
  // ADMIN LOGIN
  // =====================
  const handlePasswordSubmit = () => {
    if (adminPassword === CORRECT_PASSWORD) {
      setCurrentStep('admin');
      setAdminPassword('');
      setPasswordError('');
    } else {
      setPasswordError('❌ Contraseña incorrecta');
      setAdminPassword('');
    }
  };

  // =====================
  // CRUD REGALOS
  // =====================
  const resetForm = () => {
    setEditingGiftId(null);
    setName('');
    setImage('');
    setCategory('');
    setDetails('');
    setBuyurl('');
    setPrice('');
    setShowInVip(false);
    setAvailableCount(1);
  };

  const fillFormFromGift = gift => {
    setEditingGiftId(gift.id);
    setName(gift.name || '');
    setImage(gift.image || '');
    setCategory(gift.category || '');
    setDetails(gift.details || '');
    setBuyurl(gift.buyurl || '');
    setPrice(gift.price || '');
    setShowInVip(gift.is_vip ?? gift.isVip ?? false);
    setAvailableCount(gift.available_count ?? gift.availableCount ?? 1);
  };

  const saveGift = async () => {
    const payload = {
      name,
      image,
      category,
      details,
      buyurl,
      price,
      isVip: showInVip,
      availableCount: Number(availableCount) || 1
    };

    if (editingGiftId) {
      // UPDATE
      await fetch(`${API_URL}/api/gifts/${editingGiftId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } else {
      // CREATE
      await fetch(`${API_URL}/api/gifts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    }

    resetForm();
    loadGifts();
  };

  const deleteGift = async id => {
    if (!confirm('¿Eliminar regalo?')) return;

    await fetch(`${API_URL}/api/gifts/${id}`, {
      method: 'DELETE'
    });

    // limpiar seleccionados locales de ese gift
    setSelectedGifts(prev => prev.filter(gid => gid !== id));
    loadGifts();
    loadSelections();
  };

  // =====================
  // SELECCIÓN
  // =====================
  const toggleGiftSelection = gift => {
    if (isSoldOut(gift)) {
      alert('Este regalo ya no tiene cupos disponibles.');
      return;
    }
    setSelectedGifts(prev =>
      prev.includes(gift.id)
        ? prev.filter(id => id !== gift.id)
        : [...prev, gift.id]
    );
  };

  const confirmSelection = async () => {
    if (!userName.trim()) {
      alert('Primero escribe tu nombre.');
      return;
    }
    if (selectedGifts.length === 0) {
      alert('Selecciona al menos un regalo.');
      return;
    }

    await fetch(`${API_URL}/api/select`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: userName,
        selections: selectedGifts.map(id => ({
          giftId: id,
          quantity: 1
        }))
      })
    });

    setSelectedGifts([]);
    loadSelections();
    loadGifts();
    alert('Selección registrada');
  };

  // =====================
  // DERIVED
  // =====================
  const vipGifts = gifts.filter(g => g.is_vip || g.isVip);
  const normalGifts = gifts.filter(g => !(g.is_vip || g.isVip));
  const selectedGiftDetails = gifts.filter(g =>
    selectedGifts.includes(g.id)
  );

  // =====================
  // PANTALLA 1: INGRESAR NOMBRE
  // =====================
  if (currentStep === 'name') {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background:
            'radial-gradient(circle at top, #f97316 0, #0f172a 45%, #020617 100%)',
          padding: 16,
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif'
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: 420,
            background: 'rgba(15,23,42,0.95)',
            borderRadius: 20,
            padding: 40,
            boxShadow:
              '0 20px 40px rgba(15,23,42,0.7), 0 0 0 1px rgba(148,163,184,0.2)',
            backdropFilter: 'blur(14px)',
            textAlign: 'center'
          }}
        >
          <h1 style={{ fontSize: 32, marginBottom: 8, color: '#f9fafb' }}>
            🎄 ¡Bienvenido!
          </h1>

          <p style={{ fontSize: 15, color: '#9ca3af', marginBottom: 32 }}>
            Ingresa tu nombre para comenzar a seleccionar tus regalos favoritos.
          </p>

          <input
            placeholder="Tu nombre"
            value={userName}
            onChange={e => setUserName(e.target.value)}
            onKeyPress={e => {
              if (e.key === 'Enter' && userName.trim()) {
                setCurrentStep('selection');
              }
            }}
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: 12,
              border: '1px solid #4b5563',
              background: '#020617',
              color: '#e5e7eb',
              fontSize: 16,
              outline: 'none',
              marginBottom: 20,
              boxSizing: 'border-box'
            }}
          />

          <button
            onClick={() => {
              if (userName.trim()) {
                setCurrentStep('selection');
              }
            }}
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: 999,
              border: 'none',
              background:
                'linear-gradient(135deg, #f97316, #ec4899, #6366f1)',
              color: '#f9fafb',
              fontWeight: 600,
              fontSize: 16,
              cursor: userName.trim() ? 'pointer' : 'not-allowed',
              boxShadow: '0 12px 30px rgba(249,115,22,0.55)',
              opacity: userName.trim() ? 1 : 0.5,
              transition: 'transform 0.1s ease'
            }}
            disabled={!userName.trim()}
          >
            Continuar →
          </button>

          <button
            onClick={() => setCurrentStep('adminPassword')}
            style={{
              marginTop: 20,
              width: '100%',
              padding: '10px 16px',
              borderRadius: 10,
              border: '1px solid rgba(148,163,184,0.3)',
              background: 'rgba(15,23,42,0.6)',
              color: '#9ca3af',
              fontWeight: 500,
              fontSize: 14,
              cursor: 'pointer'
            }}
          >
            Panel Admin ⚙️
          </button>
        </div>
      </div>
    );
  }

  // =====================
  // PANTALLA 1.5: CONTRASEÑA ADMIN
  // =====================
  if (currentStep === 'adminPassword') {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background:
            'radial-gradient(circle at top, #f97316 0, #0f172a 45%, #020617 100%)',
          padding: 16,
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif'
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: 420,
            background: 'rgba(15,23,42,0.95)',
            borderRadius: 20,
            padding: 40,
            boxShadow:
              '0 20px 40px rgba(15,23,42,0.7), 0 0 0 1px rgba(148,163,184,0.2)',
            backdropFilter: 'blur(14px)',
            textAlign: 'center'
          }}
        >
          <h1 style={{ fontSize: 32, marginBottom: 8, color: '#f9fafb' }}>
            🔐 Panel Admin
          </h1>

          <input
            type="password"
            placeholder="Contraseña"
            value={adminPassword}
            onChange={e => {
              setAdminPassword(e.target.value);
              setPasswordError('');
            }}
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: 12,
              border: passwordError
                ? '2px solid #ef4444'
                : '1px solid #4b5563',
              background: '#020617',
              color: '#e5e7eb',
              fontSize: 16
            }}
          />

          {passwordError && (
            <p style={{ color: '#ef4444', marginTop: 8 }}>
              {passwordError}
            </p>
          )}

          <button
            onClick={handlePasswordSubmit}
            style={{
              marginTop: 20,
              width: '100%',
              padding: '12px 16px',
              borderRadius: 999,
              border: 'none',
              background:
                'linear-gradient(135deg, #f97316, #ec4899, #6366f1)',
              color: '#f9fafb',
              fontWeight: 600,
              fontSize: 16
            }}
          >
            Acceder →
          </button>
        </div>
      </div>
    );
  }

  // =====================
  // PANTALLA 2: SELECCIÓN
  // =====================
  if (currentStep === 'selection') {
    const listToShow = giftTab === 'vip' ? vipGifts : normalGifts;

    return (
      <div
        style={{
          minHeight: '100vh',
          padding: '40px 16px',
          background:
            'radial-gradient(circle at top, #f97316 0, #0f172a 45%, #020617 100%)',
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
          color: '#e5e7eb'
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 32
            }}
          >
            <div>
              <h1 style={{ fontSize: 32, marginBottom: 4 }}>
                👋 ¡Hola, {userName}!
              </h1>
              <p style={{ fontSize: 16, color: '#9ca3af' }}>
                Selecciona los regalos que te gustaría recibir
              </p>
            </div>

            <button
              onClick={() => {
                setCurrentStep('name');
                setUserName('');
                setSelectedGifts([]);
              }}
              style={{
                padding: '8px 16px',
                borderRadius: 10,
                border: '1px solid rgba(148,163,184,0.3)',
                background: 'rgba(15,23,42,0.6)',
                color: '#9ca3af',
                fontWeight: 500,
                cursor: 'pointer'
              }}
            >
              ← Cambiar nombre
            </button>
          </div>

          {/* Tabs Normal / VIP */}
          <div
            style={{
              display: 'flex',
              marginBottom: 16,
              gap: 8
            }}
          >
            <button
              onClick={() => setGiftTab('normal')}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: 999,
                border: '1px solid rgba(148,163,184,0.5)',
                background:
                  giftTab === 'normal'
                    ? 'rgba(15,23,42,0.95)'
                    : 'rgba(15,23,42,0.6)',
                color: '#e5e7eb',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              🎁 Regalos normales
            </button>
            <button
              onClick={() => setGiftTab('vip')}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: 999,
                border: '1px solid rgba(250,204,21,0.7)',
                background:
                  giftTab === 'vip'
                    ? 'rgba(250,204,21,0.15)'
                    : 'rgba(15,23,42,0.6)',
                color: '#facc15',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              👑 Zona VIP
            </button>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1fr) minmax(300px, 380px)',
              gap: 24
            }}
          >
            {/* Lista de regalos según tab */}
            <div>
              <section
                style={{
                  background: 'rgba(15,23,42,0.96)',
                  borderRadius: 16,
                  padding: 18,
                  border: '1px solid rgba(148,163,184,0.4)'
                }}
              >
                <h2 style={{ fontSize: 18, marginBottom: 14 }}>
                  {giftTab === 'vip'
                    ? '👑 Regalos VIP'
                    : '🎁 Regalos disponibles'}
                </h2>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns:
                      'repeat(auto-fill, minmax(160px, 1fr))',
                    gap: 12
                  }}
                >
                  {listToShow.map(g => {
                    const soldOut = isSoldOut(g);
                    const selected = selectedGifts.includes(g.id);
                    return (
                      <div
                        key={g.id}
                        onClick={() => toggleGiftSelection(g)}
                        style={{
                          background: selected
                            ? 'rgba(34,197,94,0.15)'
                            : 'rgba(15,23,42,0.98)',
                          border: soldOut
                            ? '1px dashed rgba(148,163,184,0.6)'
                            : '1px solid rgba(31,41,55,1)',
                          borderRadius: 14,
                          padding: 12,
                          cursor: soldOut ? 'not-allowed' : 'pointer',
                          opacity: soldOut ? 0.5 : 1,
                          position: 'relative'
                        }}
                      >
                        <h3
                          style={{
                            fontSize: 13,
                            textDecoration: soldOut
                              ? 'line-through'
                              : 'none'
                          }}
                        >
                          {g.name}
                        </h3>

                        <p
                          style={{
                            marginTop: 4,
                            fontSize: 10,
                            color: '#9ca3af'
                          }}
                        >
                          Cupos restantes: {remainingCount(g)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>

            {/* Sidebar */}
            <aside
              style={{
                background: 'rgba(15,23,42,0.95)',
                borderRadius: 16,
                padding: 20,
                border: '1px solid rgba(148,163,184,0.2)'
              }}
            >
              <h2 style={{ fontSize: 18 }}>✨ Mis deseos</h2>

              <p style={{ fontSize: 12, color: '#9ca3af' }}>
                {selectedGifts.length} seleccionados
              </p>

              <ul style={{ marginTop: 8, fontSize: 13 }}>
                {selectedGiftDetails.map(g => (
                  <li key={g.id}>{g.name}</li>
                ))}
              </ul>

              <button
                onClick={confirmSelection}
                style={{
                  marginTop: 12,
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 10,
                  border: 'none',
                  background:
                    'linear-gradient(135deg, #f97316, #ec4899)',
                  color: '#f9fafb',
                  fontWeight: 600
                }}
              >
                📤 Confirmar lista
              </button>
            </aside>
          </div>
        </div>
      </div>
    );
  }

  // =====================
  // PANEL ADMIN
  // =====================
  return (
    <div
      style={{
        minHeight: '100vh',
        padding: '40px 16px',
        background:
          'radial-gradient(circle at top, #f97316 0, #0f172a 45%, #020617 100%)',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
        color: '#e5e7eb'
      }}
    >
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <h1 style={{ fontSize: 24, marginBottom: 20 }}>
          🎄 Panel Administrador
        </h1>

        {/* Form crear / editar regalo */}
        <div
          style={{
            marginBottom: 24,
            padding: 16,
            borderRadius: 12,
            border: '1px solid rgba(148,163,184,0.5)',
            background: 'rgba(15,23,42,0.9)'
          }}
        >
          <h2 style={{ fontSize: 18, marginBottom: 12 }}>
            {editingGiftId ? '✏️ Editar regalo' : '➕ Nuevo regalo'}
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px,1fr))',
              gap: 10,
              marginBottom: 8
            }}
          >
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Nombre"
              style={{
                padding: 8,
                borderRadius: 8,
                border: '1px solid #4b5563',
                background: '#020617',
                color: '#e5e7eb'
              }}
            />
            <input
              value={image}
              onChange={e => setImage(e.target.value)}
              placeholder="URL imagen"
              style={{
                padding: 8,
                borderRadius: 8,
                border: '1px solid #4b5563',
                background: '#020617',
                color: '#e5e7eb'
              }}
            />
            <input
              value={category}
              onChange={e => setCategory(e.target.value)}
              placeholder="Categoría"
              style={{
                padding: 8,
                borderRadius: 8,
                border: '1px solid #4b5563',
                background: '#020617',
                color: '#e5e7eb'
              }}
            />
            <input
              value={price}
              onChange={e => setPrice(e.target.value)}
              placeholder="Precio"
              style={{
                padding: 8,
                borderRadius: 8,
                border: '1px solid #4b5563',
                background: '#020617',
                color: '#e5e7eb'
              }}
            />
            <input
              value={buyurl}
              onChange={e => setBuyurl(e.target.value)}
              placeholder="URL compra"
              style={{
                padding: 8,
                borderRadius: 8,
                border: '1px solid #4b5563',
                background: '#020617',
                color: '#e5e7eb'
              }}
            />
            <input
              value={details}
              onChange={e => setDetails(e.target.value)}
              placeholder="Detalles"
              style={{
                padding: 8,
                borderRadius: 8,
                border: '1px solid #4b5563',
                background: '#020617',
                color: '#e5e7eb'
              }}
            />
            <input
              type="number"
              min={1}
              value={availableCount}
              onChange={e => setAvailableCount(e.target.value)}
              placeholder="Cantidad disponible"
              style={{
                padding: 8,
                borderRadius: 8,
                border: '1px solid #4b5563',
                background: '#020617',
                color: '#e5e7eb'
              }}
            />
          </div>

          <label
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 13,
              color: '#e5e7eb',
              marginRight: 16
            }}
          >
            <input
              type="checkbox"
              checked={showInVip}
              onChange={e => setShowInVip(e.target.checked)}
            />
            Mostrar en zona VIP
          </label>

          <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
            <button
              onClick={saveGift}
              style={{
                padding: '8px 14px',
                borderRadius: 999,
                border: 'none',
                background:
                  'linear-gradient(135deg, #22c55e, #16a34a)',
                color: '#f9fafb',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {editingGiftId ? 'Guardar cambios' : 'Agregar regalo'}
            </button>
            {editingGiftId && (
              <button
                onClick={resetForm}
                style={{
                  padding: '8px 14px',
                  borderRadius: 999,
                  border: '1px solid rgba(148,163,184,0.5)',
                  background: 'transparent',
                  color: '#e5e7eb',
                  cursor: 'pointer'
                }}
              >
                Cancelar edición
              </button>
            )}
          </div>
        </div>

        {/* Lista de regalos + quién los escogió */}
        {gifts.map(g => (
          <div
            key={g.id}
            style={{
              padding: 12,
              border: '1px solid rgba(148,163,184,0.3)',
              borderRadius: 10,
              marginBottom: 10,
              background: 'rgba(15,23,42,0.9)'
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 8
              }}
            >
              <div>
                <strong>
                  {g.name}{' '}
                  {g.is_vip || g.isVip ? '👑' : ''}
                </strong>
                <div style={{ fontSize: 12, color: '#9ca3af' }}>
                  Cupos totales:{' '}
                  {g.available_count ?? g.availableCount ?? 0} | Usados:{' '}
                  {takenCount(g.id)} | Restantes:{' '}
                  {remainingCount(g)}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => fillFormFromGift(g)}
                  style={{
                    background: '#3b82f6',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 6,
                    padding: '4px 8px',
                    cursor: 'pointer',
                    fontSize: 12
                  }}
                >
                  Editar
                </button>
                <button
                  onClick={() => deleteGift(g.id)}
                  style={{
                    background: '#ef4444',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 6,
                    padding: '4px 8px',
                    cursor: 'pointer',
                    fontSize: 12
                  }}
                >
                  Eliminar
                </button>
              </div>
            </div>

            <div style={{ fontSize: 12, marginTop: 6 }}>
              Seleccionado por:
              <ul style={{ marginTop: 4 }}>
                {selections
                  .filter(s => s.gift_id === g.id)
                  .map(s => (
                    <li key={s.id}>
                      {s.username} ({s.quantity})
                    </li>
                  ))}
                {selections.filter(s => s.gift_id === g.id).length === 0 && (
                  <li>Nadie todavía</li>
                )}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
