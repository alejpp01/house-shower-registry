import { useState, useEffect } from 'react';

const API_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:3001';

function App() {
  const [currentStep, setCurrentStep] = useState('name'); // 'name', 'selection', 'admin', 'adminPassword'
  const [userName, setUserName] = useState('');
  const [gifts, setGifts] = useState([]);
  const [selectedGifts, setSelectedGifts] = useState([]);
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

  const CORRECT_PASSWORD = 'Juanchoesgey';

  // =====================
  // Cargar regalos
  // =====================
  const loadGifts = async () => {
    const res = await fetch(`${API_URL}/api/gifts`);
    const data = await res.json();
    setGifts(data);
  };

  useEffect(() => {
    loadGifts();
  }, []);

  // =====================
  // Validar contraseña
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
  // Agregar regalo
  // =====================
  const addGift = async () => {
    try {
      const res = await fetch(`${API_URL}/api/gifts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          image,
          category,
          details,
          buyurl,
          price,
          isVip: showInVip
        })
      });

      if (!res.ok) {
        throw new Error('Error al crear regalo');
      }

      setName('');
      setImage('');
      setCategory('');
      setDetails('');
      setBuyurl('');
      setPrice('');
      setShowInVip(false);

      loadGifts();
    } catch (err) {
      alert('Error al crear regalo');
      console.error(err);
    }
  };

  // =====================
  // Seleccionar regalo
  // =====================
  const toggleGiftSelection = (giftId) => {
    setSelectedGifts(prev =>
      prev.includes(giftId)
        ? prev.filter(id => id !== giftId)
        : [...prev, giftId]
    );
  };

  // =====================
  // Separar regalos
  // =====================
  const vipGifts = gifts.filter(g => g.is_vip);
  const normalGifts = gifts.filter(g => !g.is_vip);
  const selectedGiftDetails = gifts.filter(g => selectedGifts.includes(g.id));

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
          <h1
            style={{
              fontSize: 32,
              marginBottom: 8,
              color: '#f9fafb'
            }}
          >
            🎄 ¡Bienvenido!
          </h1>

          <p
            style={{
              fontSize: 15,
              color: '#9ca3af',
              marginBottom: 32
            }}
          >
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
            onMouseDown={e => {
              if (userName.trim()) {
                e.currentTarget.style.transform = 'translateY(1px) scale(0.99)';
              }
            }}
            onMouseUp={e => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
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
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(148,163,184,0.1)';
              e.currentTarget.style.color = '#e5e7eb';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(15,23,42,0.6)';
              e.currentTarget.style.color = '#9ca3af';
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
          <h1
            style={{
              fontSize: 32,
              marginBottom: 8,
              color: '#f9fafb'
            }}
          >
            🔐 Panel Admin
          </h1>

          <p
            style={{
              fontSize: 15,
              color: '#9ca3af',
              marginBottom: 32
            }}
          >
            ¿QUE BUSCAS? 🤔
          </p>

          <div
            style={{
              marginBottom: 20
            }}
          >
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
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s'
              }}
            />

            {passwordError && (
              <p
                style={{
                  color: '#ef4444',
                  fontSize: 13,
                  marginTop: 8,
                  margin: '8px 0 0 0'
                }}
              >
                {passwordError}
              </p>
            )}
          </div>

          <button
            onClick={handlePasswordSubmit}
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
              cursor: 'pointer',
              boxShadow: '0 12px 30px rgba(249,115,22,0.55)',
              transition: 'transform 0.1s ease'
            }}
            onMouseDown={e => {
              e.currentTarget.style.transform = 'translateY(1px) scale(0.99)';
            }}
            onMouseUp={e => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
            }}
          >
            Acceder →
          </button>

          <button
            onClick={() => {
              setCurrentStep('name');
              setAdminPassword('');
              setPasswordError('');
            }}
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
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(148,163,184,0.1)';
              e.currentTarget.style.color = '#e5e7eb';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(15,23,42,0.6)';
              e.currentTarget.style.color = '#9ca3af';
            }}
          >
            ← Volver
          </button>
        </div>
      </div>
    );
  }

  // =====================
  // PANTALLA 2: SELECCIONAR REGALOS
  // =====================
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
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto'
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 32
            }}
          >
            <div>
              <h1
                style={{
                  fontSize: 32,
                  marginBottom: 4
                }}
              >
                👋 ¡Hola, {userName}!
              </h1>
              <p
                style={{
                  fontSize: 16,
                  color: '#9ca3af'
                }}
              >
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
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(148,163,184,0.1)';
                e.currentTarget.style.color = '#e5e7eb';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(15,23,42,0.6)';
                e.currentTarget.style.color = '#9ca3af';
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
            {/* Zona de regalos disponibles */}
            <div>
              {/* VIP Section */}
              <section
                style={{
                  background:
                    'linear-gradient(135deg, rgba(250,204,21,0.12), rgba(15,23,42,0.95))',
                  borderRadius: 16,
                  padding: 18,
                  border: '1px solid rgba(250,204,21,0.3)',
                  boxShadow: '0 18px 30px rgba(15,23,42,0.65)',
                  marginBottom: 20
                }}
              >
                <h2
                  style={{
                    fontSize: 18,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    marginBottom: 14
                  }}
                >
                  👑 Regalos VIP
                </h2>

                {vipGifts.length === 0 ? (
                  <p
                    style={{
                      fontSize: 13,
                      color: '#9ca3af'
                    }}
                  >
                    No hay regalos VIP disponibles
                  </p>
                ) : (
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
                          border: selectedGifts.includes(g.id)
                            ? '2px solid #facc15'
                            : '1px solid rgba(250,204,21,0.3)',
                          borderRadius: 14,
                          padding: 12,
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          position: 'relative'
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.transform =
                            'translateY(-4px)';
                          e.currentTarget.style.boxShadow =
                            '0 12px 24px rgba(250,204,21,0.2)';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        {selectedGifts.includes(g.id) && (
                          <div
                            style={{
                              position: 'absolute',
                              top: 8,
                              right: 8,
                              width: 24,
                              height: 24,
                              background: '#facc15',
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: 14,
                              fontWeight: 'bold',
                              color: '#000'
                            }}
                          >
                            ✓
                          </div>
                        )}

                        {g.image && (
                          <img
                            src={g.image}
                            alt={g.name}
                            style={{
                              width: '100%',
                              height: 100,
                              borderRadius: 10,
                              objectFit: 'cover',
                              marginBottom: 8,
                              border: '1px solid rgba(250,204,21,0.3)'
                            }}
                          />
                        )}

                        <h3
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: '#fef9c3',
                            marginBottom: 4,
                            minHeight: 36,
                            display: 'flex',
                            alignItems: 'center'
                          }}
                        >
                          {g.name}
                        </h3>

                        {g.category && (
                          <span
                            style={{
                              fontSize: 11,
                              color: '#e5e7eb',
                              opacity: 0.8,
                              display: 'block',
                              marginBottom: 6
                            }}
                          >
                            {g.category}
                          </span>
                        )}

                        {g.price && (
                          <span
                            style={{
                              fontSize: 13,
                              fontWeight: 600,
                              color: '#facc15'
                            }}
                          >
                            ${g.price}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Normales Section */}
              <section
                style={{
                  background: 'rgba(15,23,42,0.96)',
                  borderRadius: 16,
                  padding: 18,
                  border: '1px solid rgba(148,163,184,0.4)',
                  boxShadow: '0 18px 30px rgba(15,23,42,0.7)'
                }}
              >
                <h2
                  style={{
                    fontSize: 18,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    marginBottom: 14
                  }}
                >
                  🎁 Regalos disponibles
                </h2>

                {normalGifts.length === 0 ? (
                  <p
                    style={{
                      fontSize: 13,
                      color: '#9ca3af'
                    }}
                  >
                    No hay regalos disponibles
                  </p>
                ) : (
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
                          border: selectedGifts.includes(g.id)
                            ? '2px solid #22c55e'
                            : '1px solid rgba(31,41,55,1)',
                          borderRadius: 14,
                          padding: 12,
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          position: 'relative'
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.transform =
                            'translateY(-4px)';
                          e.currentTarget.style.boxShadow =
                            '0 12px 24px rgba(34,197,94,0.15)';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        {selectedGifts.includes(g.id) && (
                          <div
                            style={{
                              position: 'absolute',
                              top: 8,
                              right: 8,
                              width: 24,
                              height: 24,
                              background: '#22c55e',
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: 14,
                              fontWeight: 'bold',
                              color: '#000'
                            }}
                          >
                            ✓
                          </div>
                        )}

                        {g.image && (
                          <img
                            src={g.image}
                            alt={g.name}
                            style={{
                              width: '100%',
                              height: 100,
                              borderRadius: 10,
                              objectFit: 'cover',
                              marginBottom: 8,
                              border: '1px solid rgba(31,41,55,1)'
                            }}
                          />
                        )}

                        <h3
                          style={{
                            fontSize: 13,
                            fontWeight: 500,
                            color: '#f9fafb',
                            marginBottom: 4,
                            minHeight: 36,
                            display: 'flex',
                            alignItems: 'center'
                          }}
                        >
                          {g.name}
                        </h3>

                        {g.category && (
                          <span
                            style={{
                              fontSize: 11,
                              color: '#9ca3af',
                              display: 'block',
                              marginBottom: 6
                            }}
                          >
                            {g.category}
                          </span>
                        )}

                        {g.price && (
                          <span
                            style={{
                              fontSize: 13,
                              fontWeight: 600,
                              color: '#22c55e'
                            }}
                          >
                            ${g.price}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>

            {/* Zona seleccionados - Sidebar */}
            <aside
              style={{
                background: 'rgba(15,23,42,0.95)',
                borderRadius: 16,
                padding: 20,
                border: '1px solid rgba(148,163,184,0.2)',
                boxShadow: '0 18px 30px rgba(15,23,42,0.65)',
                height: 'fit-content',
                position: 'sticky',
                top: 20
              }}
            >
              <h2
                style={{
                  fontSize: 18,
                  marginBottom: 4
                }}
              >
                ✨ Mis deseos
              </h2>

              <p
                style={{
                  fontSize: 12,
                  color: '#9ca3af',
                  marginBottom: 16
                }}
              >
                {selectedGifts.length} regalo{selectedGifts.length !== 1 ? 's' : ''} seleccionado{selectedGifts.length !== 1 ? 's' : ''}
              </p>

              <div
                style={{
                  maxHeight: '60vh',
                  overflowY: 'auto',
                  paddingRight: 8,
                  marginBottom: 16
                }}
              >
                {selectedGiftDetails.length === 0 ? (
                  <p
                    style={{
                      fontSize: 13,
                      color: '#6b7280',
                      textAlign: 'center',
                      paddingTop: 20
                    }}
                  >
                    Selecciona regalos haciendo clic en ellos
                  </p>
                ) : (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 10
                    }}
                  >
                    {selectedGiftDetails.map(g => (
                      <div
                        key={g.id}
                        onClick={() => toggleGiftSelection(g.id)}
                        style={{
                          background: g.is_vip
                            ? 'rgba(250,204,21,0.12)'
                            : 'rgba(34,197,94,0.12)',
                          border: g.is_vip
                            ? '1px solid rgba(250,204,21,0.3)'
                            : '1px solid rgba(34,197,94,0.3)',
                          borderRadius: 10,
                          padding: 10,
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.background = g.is_vip
                            ? 'rgba(250,204,21,0.2)'
                            : 'rgba(34,197,94,0.2)';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background = g.is_vip
                            ? 'rgba(250,204,21,0.12)'
                            : 'rgba(34,197,94,0.12)';
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            gap: 8,
                            alignItems: 'flex-start'
                          }}
                        >
                          {g.image && (
                            <img
                              src={g.image}
                              alt={g.name}
                              style={{
                                width: 40,
                                height: 40,
                                borderRadius: 8,
                                objectFit: 'cover',
                                flexShrink: 0
                              }}
                            />
                          )}

                          <div style={{ minWidth: 0, flex: 1 }}>
                            <h4
                              style={{
                                fontSize: 12,
                                fontWeight: 600,
                                color: g.is_vip ? '#fef9c3' : '#e5e7eb',
                                marginBottom: 2,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                              }}
                            >
                              {g.is_vip && '👑 '}
                              {g.name}
                            </h4>

                            {g.price && (
                              <span
                                style={{
                                  fontSize: 11,
                                  color: g.is_vip
                                    ? '#facc15'
                                    : '#22c55e',
                                  fontWeight: 500
                                }}
                              >
                                ${g.price}
                              </span>
                            )}
                          </div>

                          <button
                            onClick={e => {
                              e.stopPropagation();
                              toggleGiftSelection(g.id);
                            }}
                            style={{
                              background: 'rgba(239,68,68,0.8)',
                              border: 'none',
                              borderRadius: 6,
                              color: '#fff',
                              width: 24,
                              height: 24,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: 12,
                              flexShrink: 0,
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={e => {
                              e.currentTarget.style.background =
                                'rgba(239,68,68,1)';
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.background =
                                'rgba(239,68,68,0.8)';
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div
                style={{
                  borderTop: '1px solid rgba(148,163,184,0.2)',
                  paddingTop: 12,
                  marginBottom: 12
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: 14,
                    marginBottom: 8
                  }}
                >
                  <span style={{ color: '#9ca3af' }}>Total estimado:</span>
                  <span style={{ fontWeight: 600, color: '#f9fafb' }}>
                    ${selectedGiftDetails.reduce((sum, g) => sum + (parseFloat(g.price) || 0), 0).toFixed(2)}
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  alert(`${userName} desea estos ${selectedGifts.length} regalo(s)\n\n${selectedGiftDetails.map(g => `- ${g.name} ($${g.price})`).join('\n')}`);
                }}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 10,
                  border: 'none',
                  background: 'linear-gradient(135deg, #f97316, #ec4899)',
                  color: '#f9fafb',
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: selectedGifts.length > 0 ? 'pointer' : 'not-allowed',
                  opacity: selectedGifts.length > 0 ? 1 : 0.5,
                  transition: 'all 0.2s'
                }}
                disabled={selectedGifts.length === 0}
                onMouseDown={e => {
                  if (selectedGifts.length > 0) {
                    e.currentTarget.style.transform = 'scale(0.98)';
                  }
                }}
                onMouseUp={e => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                📤 Confirmar lista
              </button>

              <button
                onClick={() => {
                  setSelectedGifts([]);
                }}
                style={{
                  width: '100%',
                  marginTop: 8,
                  padding: '8px 14px',
                  borderRadius: 10,
                  border: '1px solid rgba(148,163,184,0.3)',
                  background: 'rgba(15,23,42,0.6)',
                  color: '#9ca3af',
                  fontWeight: 500,
                  fontSize: 13,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(148,163,184,0.1)';
                  e.currentTarget.style.color = '#e5e7eb';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(15,23,42,0.6)';
                  e.currentTarget.style.color = '#9ca3af';
                }}
              >
                Limpiar selección
              </button>
            </aside>
          </div>
        </div>
      </div>
    );
  }

  // =====================
  // PANTALLA 3: PANEL ADMIN
  // =====================
  return (
    <div
      style={{
        minHeight: '100vh',
        margin: 0,
        padding: '40px 16px',
        background:
          'radial-gradient(circle at top, #f97316 0, #0f172a 45%, #020617 100%)',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
        color: '#e5e7eb',
        display: 'flex',
        justifyContent: 'center'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 1100,
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 380px) minmax(0, 1fr)',
          gap: 24
        }}
      >
        {/* Panel izquierdo: formulario */}
        <div
          style={{
            background: 'rgba(15,23,42,0.95)',
            borderRadius: 16,
            padding: 24,
            boxShadow:
              '0 20px 40px rgba(15,23,42,0.7), 0 0 0 1px rgba(148,163,184,0.2)',
            backdropFilter: 'blur(14px)',
            height: 'fit-content'
          }}
        >
          <h1
            style={{
              fontSize: 24,
              marginBottom: 4,
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            🎄 Lista de Regalos
          </h1>
          <p
            style={{
              fontSize: 14,
              color: '#9ca3af',
              marginBottom: 20
            }}
          >
            Agrega nuevos regalos a tu lista y márcalos como VIP para destacarlos.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: 13,
                  marginBottom: 4,
                  color: '#e5e7eb'
                }}
              >
                Nombre del regalo
              </label>
              <input
                placeholder="Ej: PlayStation 5"
                value={name}
                onChange={e => setName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 11px',
                  borderRadius: 10,
                  border: '1px solid #4b5563',
                  background: '#020617',
                  color: '#e5e7eb',
                  fontSize: 14,
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: 13,
                  marginBottom: 4,
                  color: '#e5e7eb'
                }}
              >
                URL de la imagen
              </label>
              <input
                placeholder="https://..."
                value={image}
                onChange={e => setImage(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 11px',
                  borderRadius: 10,
                  border: '1px solid #4b5563',
                  background: '#020617',
                  color: '#e5e7eb',
                  fontSize: 14,
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <div style={{ flex: 1 }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: 13,
                    marginBottom: 4,
                    color: '#e5e7eb'
                  }}
                >
                  Categoría
                </label>
                <input
                  placeholder="Tecnología, Hogar..."
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 11px',
                    borderRadius: 10,
                    border: '1px solid #4b5563',
                    background: '#020617',
                    color: '#e5e7eb',
                    fontSize: 14,
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ width: 120 }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: 13,
                    marginBottom: 4,
                    color: '#e5e7eb'
                  }}
                >
                  Precio
                </label>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    borderRadius: 10,
                    border: '1px solid #4b5563',
                    background: '#020617',
                    paddingLeft: 8
                  }}
                >
                  <span
                    style={{
                      color: '#9ca3af',
                      fontSize: 13,
                      marginRight: 4
                    }}
                  >
                    $
                  </span>
                  <input
                    type="number"
                    placeholder="0"
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                    style={{
                      flex: 1,
                      border: 'none',
                      outline: 'none',
                      background: 'transparent',
                      color: '#e5e7eb',
                      padding: '8px 8px 8px 0',
                      fontSize: 14
                    }}
                  />
                </div>
              </div>
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: 13,
                  marginBottom: 4,
                  color: '#e5e7eb'
                }}
              >
                Descripción
              </label>
              <textarea
                placeholder="Detalles, color, tamaño, versiones, etc."
                value={details}
                onChange={e => setDetails(e.target.value)}
                rows={3}
                style={{
                  width: '100%',
                  padding: '9px 11px',
                  borderRadius: 10,
                  border: '1px solid #4b5563',
                  background: '#020617',
                  color: '#e5e7eb',
                  fontSize: 14,
                  resize: 'vertical',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: 13,
                  marginBottom: 4,
                  color: '#e5e7eb'
                }}
              >
                Link de compra
              </label>
              <input
                placeholder="https://tienda.com/producto"
                value={buyurl}
                onChange={e => setBuyurl(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 11px',
                  borderRadius: 10,
                  border: '1px solid #4b5563',
                  background: '#020617',
                  color: '#e5e7eb',
                  fontSize: 14,
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginTop: 4,
                fontSize: 14,
                color: '#fbbf24',
                cursor: 'pointer',
                userSelect: 'none'
              }}
            >
              <input
                type="checkbox"
                checked={showInVip}
                onChange={e => setShowInVip(e.target.checked)}
                style={{
                  width: 16,
                  height: 16,
                  accentColor: '#f97316',
                  cursor: 'pointer'
                }}
              />
              Mostrar en zona VIP 👑
            </label>

            <button
              onClick={addGift}
              style={{
                marginTop: 6,
                width: '100%',
                padding: '10px 14px',
                borderRadius: 999,
                border: 'none',
                background:
                  'linear-gradient(135deg, #f97316, #ec4899, #6366f1)',
                color: '#f9fafb',
                fontWeight: 600,
                fontSize: 15,
                cursor: 'pointer',
                boxShadow: '0 12px 30px rgba(249,115,22,0.55)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                transition: 'transform 0.1s ease'
              }}
              onMouseDown={e => {
                e.currentTarget.style.transform = 'translateY(1px) scale(0.99)';
              }}
              onMouseUp={e => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
              }}
            >
              🎁 Agregar regalo
            </button>

            <button
              onClick={() => {
                setCurrentStep('name');
              }}
              style={{
                marginTop: 8,
                width: '100%',
                padding: '8px 14px',
                borderRadius: 10,
                border: '1px solid rgba(148,163,184,0.3)',
                background: 'rgba(15,23,42,0.6)',
                color: '#9ca3af',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(148,163,184,0.1)';
                e.currentTarget.style.color = '#e5e7eb';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(15,23,42,0.6)';
                e.currentTarget.style.color = '#9ca3af';
              }}
            >
              ← Volver al inicio
            </button>
          </div>
        </div>

        {/* Panel derecho: listas */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* VIP */}
          <section
            style={{
              background:
                'linear-gradient(135deg, rgba(250,204,21,0.12), rgba(15,23,42,0.95))',
              borderRadius: 16,
              padding: 18,
              border: '1px solid rgba(250,204,21,0.3)',
              boxShadow: '0 18px 30px rgba(15,23,42,0.65)'
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 10
              }}
            >
              <h2
                style={{
                  fontSize: 18,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                👑 Zona VIP
              </h2>
              <span
                style={{
                  fontSize: 12,
                  padding: '2px 8px',
                  borderRadius: 999,
                  background: 'rgba(250,204,21,0.16)',
                  color: '#facc15'
                }}
              >
                {vipGifts.length} regalos
              </span>
            </div>

            {vipGifts.length === 0 && (
              <p
                style={{
                  fontSize: 13,
                  color: '#e5e7eb'
                }}
              >
                Todavía no hay regalos VIP. Marca alguno como VIP al crearlo.
              </p>
            )}

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: 10
              }}
            >
              {vipGifts.map(g => (
                <article
                  key={g.id}
                  style={{
                    background: 'rgba(15,23,42,0.95)',
                    borderRadius: 12,
                    padding: 10,
                    border: '1px solid rgba(250,204,21,0.35)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8
                    }}
                  >
                    {g.image && (
                      <img
                        src={g.image}
                        alt={g.name}
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 10,
                          objectFit: 'cover',
                          border: '1px solid rgba(250,204,21,0.5)'
                        }}
                      />
                    )}
                    <div style={{ minWidth: 0 }}>
                      <h3
                        style={{
                          fontSize: 14,
                          fontWeight: 600,
                          color: '#fef9c3',
                          marginBottom: 2,
                          whiteSpace: 'nowrap',
                          textOverflow: 'ellipsis',
                          overflow: 'hidden'
                        }}
                      >
                        {g.name}
                      </h3>
                      {g.category && (
                        <span
                          style={{
                            fontSize: 11,
                            color: '#e5e7eb',
                            opacity: 0.85
                          }}
                        >
                          {g.category}
                        </span>
                      )}
                    </div>
                  </div>
                  {g.price && (
                    <span
                      style={{
                        fontSize: 13,
                        color: '#facc15',
                        marginTop: 2
                      }}
                    >
                      ${g.price}
                    </span>
                  )}
                </article>
              ))}
            </div>
          </section>

          {/* Normales */}
          <section
            style={{
              background: 'rgba(15,23,42,0.96)',
              borderRadius: 16,
              padding: 18,
              border: '1px solid rgba(148,163,184,0.4)',
              boxShadow: '0 18px 30px rgba(15,23,42,0.7)',
              flex: 1,
              minHeight: 0
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 10
              }}
            >
              <h2
                style={{
                  fontSize: 18,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                🎁 Regalos normales
              </h2>
              <span
                style={{
                  fontSize: 12,
                  padding: '2px 8px',
                  borderRadius: 999,
                  background: 'rgba(148,163,184,0.2)',
                  color: '#e5e7eb'
                }}
              >
                {normalGifts.length} regalos
              </span>
            </div>

            {normalGifts.length === 0 && (
              <p
                style={{
                  fontSize: 13,
                  color: '#9ca3af'
                }}
              >
                Empieza agregando tu primer regalo en el formulario de la izquierda.
              </p>
            )}

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: 10
              }}
            >
              {normalGifts.map(g => (
                <article
                  key={g.id}
                  style={{
                    background: 'rgba(15,23,42,0.98)',
                    borderRadius: 12,
                    padding: 10,
                    border: '1px solid rgba(31,41,55,1)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8
                    }}
                  >
                    {g.image && (
                      <img
                        src={g.image}
                        alt={g.name}
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 10,
                          objectFit: 'cover',
                          border: '1px solid rgba(31,41,55,1)'
                        }}
                      />
                    )}
                    <div style={{ minWidth: 0 }}>
                      <h3
                        style={{
                          fontSize: 14,
                          fontWeight: 500,
                          color: '#f9fafb',
                          marginBottom: 2,
                          whiteSpace: 'nowrap',
                          textOverflow: 'ellipsis',
                          overflow: 'hidden'
                        }}
                      >
                        {g.name}
                      </h3>
                      {g.category && (
                        <span
                          style={{
                            fontSize: 11,
                            color: '#9ca3af'
                          }}
                        >
                          {g.category}
                        </span>
                      )}
                    </div>
                  </div>

                  {g.price && (
                    <span
                      style={{
                        fontSize: 13,
                        color: '#22c55e'
                      }}
                    >
                      ${g.price}
                    </span>
                  )}
                </article>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default App;
