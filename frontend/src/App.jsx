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

  // Admin form
  const [name, setName] = useState('');
  const [image, setImage] = useState('');
  const [category, setCategory] = useState('');
  const [details, setDetails] = useState('');
  const [buyurl, setBuyurl] = useState('');
  const [price, setPrice] = useState('');
  const [showInVip, setShowInVip] = useState(false);
  const [availableCount, setAvailableCount] = useState(1);

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

  const isTaken = giftId => takenCount(giftId) > 0;

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
  const addGift = async () => {
    await fetch(`${API_URL}/api/gifts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        image,
        category,
        details,
        buyurl,
        price,
        isVip: showInVip,
        availableCount
      })
    });

    setName('');
    setImage('');
    setCategory('');
    setDetails('');
    setBuyurl('');
    setPrice('');
    setShowInVip(false);
    setAvailableCount(1);

    loadGifts();
  };

  const deleteGift = async id => {
    if (!confirm('¿Eliminar regalo?')) return;

    await fetch(`${API_URL}/api/gifts/${id}`, {
      method: 'DELETE'
    });

    loadGifts();
  };

  // =====================
  // SELECCIÓN
  // =====================
  const toggleGiftSelection = giftId => {
    setSelectedGifts(prev =>
      prev.includes(giftId)
        ? prev.filter(id => id !== giftId)
        : [...prev, giftId]
    );
  };

  const confirmSelection = async () => {
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
  const vipGifts = gifts.filter(g => g.is_vip);
  const normalGifts = gifts.filter(g => !g.is_vip);
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

  if (currentStep === 'selection') {
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

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1fr) minmax(300px, 380px)',
              gap: 24
            }}
          >
            <div>
              {/* VIP */}
              <section
                style={{
                  background:
                    'linear-gradient(135deg, rgba(250,204,21,0.12), rgba(15,23,42,0.95))',
                  borderRadius: 16,
                  padding: 18,
                  border: '1px solid rgba(250,204,21,0.3)',
                  marginBottom: 20
                }}
              >
                <h2 style={{ fontSize: 18, marginBottom: 14 }}>
                  👑 Regalos VIP
                </h2>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns:
                      'repeat(auto-fill, minmax(160px, 1fr))',
                    gap: 12
                  }}
                >
                  {vipGifts.map(g => (
                    <div
                      key={g.id}
                      onClick={() => toggleGiftSelection(g.id)}
                      style={{
                        background: selectedGifts.includes(g.id)
                          ? 'rgba(250,204,21,0.2)'
                          : 'rgba(15,23,42,0.95)',
                        border: '1px solid rgba(250,204,21,0.3)',
                        borderRadius: 14,
                        padding: 12,
                        cursor: 'pointer',
                        position: 'relative'
                      }}
                    >
                      <h3 style={{ fontSize: 13, color: '#fef9c3' }}>
                        {g.name}
                      </h3>
                    </div>
                  ))}
                </div>
              </section>

              {/* Normales */}
              <section
                style={{
                  background: 'rgba(15,23,42,0.96)',
                  borderRadius: 16,
                  padding: 18,
                  border: '1px solid rgba(148,163,184,0.4)'
                }}
              >
                <h2 style={{ fontSize: 18, marginBottom: 14 }}>
                  🎁 Regalos disponibles
                </h2>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns:
                      'repeat(auto-fill, minmax(160px, 1fr))',
                    gap: 12
                  }}
                >
                  {normalGifts.map(g => (
                    <div
                      key={g.id}
                      onClick={() => toggleGiftSelection(g.id)}
                      style={{
                        background: selectedGifts.includes(g.id)
                          ? 'rgba(34,197,94,0.15)'
                          : 'rgba(15,23,42,0.98)',
                        border: '1px solid rgba(31,41,55,1)',
                        borderRadius: 14,
                        padding: 12,
                        cursor: 'pointer'
                      }}
                    >
                      <h3 style={{ fontSize: 13 }}>{g.name}</h3>
                    </div>
                  ))}
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
      <h1 style={{ fontSize: 24, marginBottom: 20 }}>
        🎄 Panel Administrador
      </h1>

      {gifts.map(g => (
        <div
          key={g.id}
          style={{
            padding: 12,
            border: '1px solid rgba(148,163,184,0.3)',
            borderRadius: 10,
            marginBottom: 10
          }}
        >
          <strong>{g.name}</strong>

          <button
            onClick={() => deleteGift(g.id)}
            style={{
              marginLeft: 10,
              background: '#ef4444',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              padding: '4px 8px',
              cursor: 'pointer'
            }}
          >
            Eliminar
          </button>

          <div style={{ fontSize: 12, marginTop: 6 }}>
            Seleccionado por:
            <ul>
              {selections
                .filter(s => s.gift_id === g.id)
                .map(s => (
                  <li key={s.id}>
                    {s.username} ({s.quantity})
                  </li>
                ))}
            </ul>
          </div>
        </div>
      ))}
    </div>
  );
}

export default App;
