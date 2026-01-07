import { useState, useEffect } from 'react';

const API_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:3001';

function App() {
  const [gifts, setGifts] = useState([]);
  const [name, setName] = useState('');
  const [image, setImage] = useState('');
  const [category, setCategory] = useState('');
  const [details, setDetails] = useState('');
  const [buyurl, setBuyurl] = useState('');
  const [price, setPrice] = useState('');
  const [showInVip, setShowInVip] = useState(false);

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
  // Separar regalos
  // =====================
  const vipGifts = gifts.filter(g => g.is_vip);
  const normalGifts = gifts.filter(g => !g.is_vip);

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
            backdropFilter: 'blur(14px)'
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
                  boxShadow: '0 0 0 1px transparent',
                  transition: 'border-color 0.15s, box-shadow 0.15s'
                }}
                onFocus={e => {
                  e.target.style.borderColor = '#f97316';
                  e.target.style.boxShadow = '0 0 0 1px rgba(249,115,22,0.6)';
                }}
                onBlur={e => {
                  e.target.style.borderColor = '#4b5563';
                  e.target.style.boxShadow = '0 0 0 1px transparent';
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
                  outline: 'none'
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
                    outline: 'none'
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
                  outline: 'none'
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
                  outline: 'none'
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
                transition: 'transform 0.1s ease, box-shadow 0.1s ease'
              }}
              onMouseDown={e => {
                e.currentTarget.style.transform = 'translateY(1px) scale(0.99)';
                e.currentTarget.style.boxShadow =
                  '0 6px 18px rgba(249,115,22,0.45)';
              }}
              onMouseUp={e => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow =
                  '0 12px 30px rgba(249,115,22,0.55)';
              }}
            >
              🎁 Agregar regalo
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
