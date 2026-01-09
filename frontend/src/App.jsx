import { useState, useEffect } from 'react';


const CORRECT_PASSWORD = 'Juanchoesgey';

function App() {
  const [currentStep, setCurrentStep] = useState('name');
  const [userName, setUserName] = useState('');
  const [gifts, setGifts] = useState([]);
  const [selectedGifts, setSelectedGifts] = useState([]);
  const [selections, setSelections] = useState([]);

  const [adminPassword, setAdminPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const [editingGiftId, setEditingGiftId] = useState(null);
  const [name, setName] = useState('');
  const [image, setImage] = useState('');
  const [category, setCategory] = useState('');
  const [details, setDetails] = useState('');
  const [buyurl, setBuyurl] = useState('');
  const [price, setPrice] = useState('');
  const [showInVip, setShowInVip] = useState(false);
  const [availableCount, setAvailableCount] = useState(1);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [apiError, setApiError] = useState('');
  const [debugInfo, setDebugInfo] = useState('');

  const [giftTab, setGiftTab] = useState('normal');

  // =====================
  // API HELPER
  // =====================
  const apiCall = async (endpoint, options = {}) => {
    try {
      console.log(`📡 Llamando: ${API_URL}${endpoint}`);
      
      const response = await fetch(`${API_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json'
        },
        ...options
      });

      console.log(`📊 Status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Error ${response.status}:`, errorText);
        throw new Error(`HTTP ${response.status}: ${errorText.slice(0, 100)}`);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      console.error('❌ API Error:', err);
      throw err;
    }
  };

  // =====================
  // LOAD DATA
  // =====================
  const loadGifts = async () => {
    try {
      console.log('🔄 Cargando regalos...');
      setDebugInfo('Cargando regalos...');
      const data = await apiCall('/api/gifts');
      console.log('✅ Regalos:', data);
      setGifts(data || []);
      setApiError('');
      setDebugInfo('');
    } catch (err) {
      console.error('❌ Error:', err.message);
      setApiError(err.message);
      setDebugInfo(`Error: ${err.message}`);
      setGifts([]);
    }
  };

  const loadSelections = async () => {
    try {
      const data = await apiCall('/api/selections');
      console.log('✅ Selecciones:', data);
      setSelections(data || []);
    } catch (err) {
      console.error('❌ Error cargando selecciones:', err);
      setSelections([]);
    }
  };

  useEffect(() => {
    console.log('🚀 App iniciando. API_URL:', API_URL);
    loadGifts();
    loadSelections();
    
    const interval = setInterval(() => {
      loadSelections();
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);

  // =====================
  // HELPERS
  // =====================
  const getGiftSelectionCount = (giftId) => {
    return selections.filter(s => s.gift_id === giftId).reduce((sum, s) => sum + s.quantity, 0);
  };

  const getGiftSelectionInfo = (giftId) => {
    return selections.filter(s => s.gift_id === giftId);
  };

  // =====================
  // ADMIN
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
    setError('');
  };

  const fillFormFromGift = gift => {
    setEditingGiftId(gift.id);
    setName(gift.name || '');
    setImage(gift.image || '');
    setCategory(gift.category || '');
    setDetails(gift.details || '');
    setBuyurl(gift.buyurl || '');
    setPrice(gift.price || '');
    setShowInVip(gift.is_vip ?? false);
    setAvailableCount(gift.available_count || 1);
  };

  const saveGift = async () => {
    if (!name.trim()) {
      setError('❌ El nombre es requerido');
      return;
    }

    setLoading(true);
    setError('');

    const payload = {
      name: name.trim(),
      image,
      category,
      details,
      buyurl,
      price: Number(price) || 0,
      isVip: showInVip,
      availableCount: Number(availableCount) || 1
    };

    try {
      const url = editingGiftId ? `/api/gifts/${editingGiftId}` : '/api/gifts';
      const method = editingGiftId ? 'PUT' : 'POST';

      await apiCall(url, {
        method,
        body: JSON.stringify(payload)
      });

      resetForm();
      await loadGifts();
      alert(editingGiftId ? '✅ Regalo actualizado' : '✅ Regalo agregado');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteGift = async id => {
    if (!confirm('¿Eliminar regalo?')) return;
    try {
      await apiCall(`/api/gifts/${id}`, { method: 'DELETE' });
      await loadGifts();
      await loadSelections();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  // =====================
  // SELECCIÓN
  // =====================
  const toggleGiftSelection = gift => {
    setSelectedGifts(prev => {
      if (prev.includes(gift.id)) {
        return prev.filter(id => id !== gift.id);
      }
      return [...prev, gift.id];
    });
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

    try {
      await apiCall('/api/select', {
        method: 'POST',
        body: JSON.stringify({
          username: userName,
          selections: selectedGifts.map(id => ({
            giftId: id,
            quantity: 1
          }))
        })
      });

      setSelectedGifts([]);
      await loadSelections();
      await loadGifts();
      alert('✅ Selección registrada');
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  // =====================
  // DERIVED
  // =====================
  const vipGifts = gifts.filter(g => g.is_vip);
  const normalGifts = gifts.filter(g => !g.is_vip);
  const selectedGiftDetails = gifts.filter(g => selectedGifts.includes(g.id));

  // =====================
  // ERROR SCREEN
  // =====================
  if (apiError && currentStep === 'name') {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'radial-gradient(circle at top, #f97316 0, #0f172a 45%, #020617 100%)',
          padding: 16,
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif'
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: 500,
            background: 'rgba(15,23,42,0.95)',
            borderRadius: 20,
            padding: 40,
            boxShadow: '0 20px 40px rgba(15,23,42,0.7), 0 0 0 1px rgba(148,163,184,0.2)',
            backdropFilter: 'blur(14px)',
            textAlign: 'center'
          }}
        >
          <h1 style={{ fontSize: 32, marginBottom: 8, color: '#ef4444' }}>
            ⚠️ Error de conexión
          </h1>

          <p style={{ fontSize: 14, color: '#9ca3af', marginBottom: 16, wordBreak: 'break-word' }}>
            {apiError}
          </p>

          <div style={{ 
            background: 'rgba(0,0,0,0.3)', 
            padding: 12, 
            borderRadius: 8, 
            marginBottom: 20,
            textAlign: 'left',
            fontSize: 11,
            color: '#9ca3af',
            fontFamily: 'monospace',
            overflow: 'auto',
            maxHeight: 150
          }}>
            <strong>API URL:</strong> {API_URL}
            <br />
            <strong>Estado:</strong> {debugInfo}
          </div>

          <button
            onClick={() => {
              setApiError('');
              setDebugInfo('');
              loadGifts();
              loadSelections();
            }}
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: 999,
              border: 'none',
              background: 'linear-gradient(135deg, #f97316, #ec4899, #6366f1)',
              color: '#f9fafb',
              fontWeight: 600,
              fontSize: 16,
              cursor: 'pointer'
            }}
          >
            Reintentar →
          </button>
        </div>
      </div>
    );
  }

  // =====================
  // PANTALLA 1: NOMBRE
  // =====================
  if (currentStep === 'name') {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'radial-gradient(circle at top, #f97316 0, #0f172a 45%, #020617 100%)',
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
            boxShadow: '0 20px 40px rgba(15,23,42,0.7), 0 0 0 1px rgba(148,163,184,0.2)',
            backdropFilter: 'blur(14px)',
            textAlign: 'center'
          }}
        >
          <h1 style={{ fontSize: 32, marginBottom: 8, color: '#f9fafb' }}>
            🎄 ¡Bienvenido!
          </h1>

          <p style={{ fontSize: 15, color: '#9ca3af', marginBottom: 32 }}>
            Ingresa tu nombre para seleccionar tus regalos favoritos.
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
              background: 'linear-gradient(135deg, #f97316, #ec4899, #6366f1)',
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
  // PANTALLA 1.5: PASSWORD
  // =====================
  if (currentStep === 'adminPassword') {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'radial-gradient(circle at top, #f97316 0, #0f172a 45%, #020617 100%)',
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
            boxShadow: '0 20px 40px rgba(15,23,42,0.7), 0 0 0 1px rgba(148,163,184,0.2)',
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
            onKeyPress={e => {
              if (e.key === 'Enter') {
                handlePasswordSubmit();
              }
            }}
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: 12,
              border: passwordError ? '2px solid #ef4444' : '1px solid #4b5563',
              background: '#020617',
              color: '#e5e7eb',
              fontSize: 16,
              marginBottom: 12,
              boxSizing: 'border-box'
            }}
          />

          {passwordError && (
            <p style={{ color: '#ef4444', marginTop: 8, marginBottom: 12 }}>
              {passwordError}
            </p>
          )}

          <button
            onClick={handlePasswordSubmit}
            style={{
              marginBottom: 12,
              width: '100%',
              padding: '12px 16px',
              borderRadius: 999,
              border: 'none',
              background: 'linear-gradient(135deg, #f97316, #ec4899, #6366f1)',
              color: '#f9fafb',
              fontWeight: 600,
              fontSize: 16,
              cursor: 'pointer'
            }}
          >
            Acceder →
          </button>

          <button
            onClick={() => {
              setCurrentStep('name');
              setPasswordError('');
              setAdminPassword('');
            }}
            style={{
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
            ← Volver
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
          background: 'radial-gradient(circle at top, #f97316 0, #0f172a 45%, #020617 100%)',
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
              marginBottom: 32,
              flexWrap: 'wrap',
              gap: 16
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
                background: giftTab === 'normal' ? 'rgba(15,23,42,0.95)' : 'rgba(15,23,42,0.6)',
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
                background: giftTab === 'vip' ? 'rgba(250,204,21,0.15)' : 'rgba(15,23,42,0.6)',
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
                  {giftTab === 'vip' ? '👑 Regalos VIP' : '🎁 Regalos disponibles'}
                </h2>

                {listToShow.length === 0 ? (
                  <p style={{ color: '#9ca3af' }}>
                    No hay regalos en esta sección aún.
                  </p>
                ) : (
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                      gap: 12
                    }}
                  >
                    {listToShow.map(g => {
                      const selected = selectedGifts.includes(g.id);
                      const selectionCount = getGiftSelectionCount(g.id);
                      const selectionInfo = getGiftSelectionInfo(g.id);
                      
                      return (
                        <div
                          key={g.id}
                          onClick={() => toggleGiftSelection(g)}
                          style={{
                            background: selected ? 'rgba(34,197,94,0.15)' : 'rgba(15,23,42,0.98)',
                            border: selected ? '2px solid rgba(34,197,94,0.8)' : '1px solid rgba(31,41,55,1)',
                            borderRadius: 14,
                            padding: 12,
                            cursor: 'pointer',
                            position: 'relative',
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            flexDirection: 'column'
                          }}
                        >
                          {g.image && (
                            <img
                              src={g.image}
                              alt={g.details}
                              style={{
                                width: '100%',
                                height: 120,
                                objectFit: 'cover',
                                borderRadius: 10,
                                marginBottom: 8
                              }}
                            />
                          )}

                          <h3
                            style={{
                              fontSize: 13,
                              color: '#e5e7eb',
                              margin: 0,
                              marginBottom: 4,
                              flex: 1
                            }}
                          >
                            {g.details}
                          </h3>

                          {selected && (
                            <div style={{ fontSize: 12, color: '#22c55e', fontWeight: 600, marginBottom: 4 }}>
                              ✅ Seleccionado por ti
                            </div>
                          )}

                          {selectionCount > 0 && !selected && (
                            <div style={{ fontSize: 11, color: '#fbbf24', fontWeight: 600, marginBottom: 4 }}>
                              ⚠️ {selectionCount} seleccionado{selectionCount > 1 ? 's' : ''}
                            </div>
                          )}

                          {selectionInfo.length > 0 && !selected && (
                            <div
                              style={{
                                fontSize: 10,
                                color: '#9ca3af',
                                marginTop: 4,
                                borderTop: '1px solid rgba(148,163,184,0.2)',
                                paddingTop: 4
                              }}
                            >
                              {selectionInfo.map((s, idx) => (
                                <div key={idx}>👤 {s.username}</div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            </div>

            <aside
              style={{
                background: 'rgba(15,23,42,0.95)',
                borderRadius: 16,
                padding: 20,
                border: '1px solid rgba(148,163,184,0.2)'
              }}
            >
              <h2 style={{ fontSize: 18, marginBottom: 12 }}>✨ Mis deseos</h2>

              <p style={{ fontSize: 12, color: '#9ca3af', marginBottom: 12 }}>
                {selectedGifts.length} seleccionados
              </p>

              <ul style={{ marginTop: 8, fontSize: 13, marginLeft: 16, marginBottom: 16 }}>
                {selectedGiftDetails.map(g => (
                  <li key={g.id}>{g.details}</li>
                ))}
              </ul>

              <button
                onClick={confirmSelection}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 10,
                  border: 'none',
                  background: 'linear-gradient(135deg, #f97316, #ec4899)',
                  color: '#f9fafb',
                  fontWeight: 600,
                  cursor: 'pointer'
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
  // ADMIN PANEL
  // =====================
  return (
    <div
      style={{
        minHeight: '100vh',
        padding: '40px 16px',
        background: 'radial-gradient(circle at top, #f97316 0, #0f172a 45%, #020617 100%)',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
        color: '#e5e7eb'
      }}
    >
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h1 style={{ fontSize: 24 }}>🎄 Panel Administrador</h1>
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
            ← Salir
          </button>
        </div>

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

          {error && (
            <div style={{ padding: 8, borderRadius: 8, background: 'rgba(239,68,68,0.2)', color: '#ef4444', marginBottom: 12 }}>
              {error}
            </div>
          )}

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
              placeholder="Nombre del regalo *"
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
              value={details}
              onChange={e => setDetails(e.target.value)}
              placeholder="Descripción"
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
              type="number"
              value={availableCount}
              onChange={e => setAvailableCount(e.target.value)}
              placeholder="Cantidad disponible"
              min="1"
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
              disabled={loading}
              style={{
                padding: '8px 14px',
                borderRadius: 999,
                border: 'none',
                background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                color: '#f9fafb',
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1
              }}
            >
              {loading ? '⏳ Guardando...' : editingGiftId ? 'Guardar cambios' : 'Agregar regalo'}
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

        <h2 style={{ fontSize: 18, marginBottom: 12 }}>
          📋 Regalos ({gifts.length})
        </h2>
        
        {gifts.length === 0 ? (
          <p style={{ color: '#9ca3af' }}>No hay regalos aún. Crea uno arriba.</p>
        ) : (
          gifts.map(g => {
            const selectionInfo = getGiftSelectionInfo(g.id);
            const totalSelected = getGiftSelectionCount(g.id);
            
            return (
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
                    gap: 8,
                    flexWrap: 'wrap',
                    marginBottom: 8
                  }}
                >
                  <div>
                    <strong>
                      {g.details} {g.is_vip ? '👑' : ''}
                    </strong>
                    <div style={{ fontSize: 12, color: '#9ca3af' }}>
                      ID: {g.id} | Stock: {g.available_count} | Seleccionados: <span style={{ color: '#fbbf24' }}>{totalSelected}</span>
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

                <div style={{ fontSize: 12 }}>
                  <strong>Seleccionado por:</strong>
                  <ul style={{ marginTop: 4, marginBottom: 0 }}>
                    {selectionInfo.length === 0 ? (
                      <li style={{ color: '#9ca3af' }}>Nadie todavía</li>
                    ) : (
                      selectionInfo.map(s => (
                        <li key={s.id}>
                          👤 <strong>{s.username}</strong> (cantidad: {s.quantity})
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default App;