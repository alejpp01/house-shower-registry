import { useState, useEffect } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

function HouseShowerApp() {
  const [view, setView] = useState('public')
  const [guestName, setGuestName] = useState(() => localStorage.getItem('guestName') || '')
  const [guestToken, setGuestToken] = useState(() => localStorage.getItem('guestToken') || '')
  const [gifts, setGifts] = useState([])
  const [reservations, setReservations] = useState({})
  const [adminPassword, setAdminPassword] = useState('')
  const [isAdminAuth, setIsAdminAuth] = useState(() => localStorage.getItem('isAdminAuth') === 'true')
  const [adminTab, setAdminTab] = useState('add')
  const [alerts, setAlerts] = useState([])
  const [selectedGift, setSelectedGift] = useState(null)
  const [loading, setLoading] = useState(true)

  // Cargar regalos y reservaciones al iniciar
  useEffect(() => {
    fetchGiftsAndReservations()
  }, [])

  const fetchGiftsAndReservations = async () => {
    try {
      setLoading(true)
      const [giftsRes, reservationsRes] = await Promise.all([
        fetch(`${API_URL}/api/gifts`),
        fetch(`${API_URL}/api/reservations`)
      ])

      if (giftsRes.ok && reservationsRes.ok) {
        const giftsData = await giftsRes.json()
        const reservationsData = await reservationsRes.json()
        setGifts(giftsData)
        setReservations(reservationsData)
      }
    } catch (error) {
      console.error('Error al cargar datos:', error)
      showAlert('Error al conectar con el servidor', 'error')
    } finally {
      setLoading(false)
    }
  }

  const showAlert = (message, type = 'success') => {
    const id = Date.now()
    setAlerts(prev => [...prev, { id, message, type }])
    setTimeout(() => setAlerts(prev => prev.filter(a => a.id !== id)), 3000)
  }

  const handlePublicView = () => {
    if (!guestName.trim()) {
      showAlert('Por favor ingresa tu nombre', 'error')
      return
    }
    setView('public')
  }

  const handleAdminAuth = () => {
    if (adminPassword === 'ADMIN123') {
      setIsAdminAuth(true)
      localStorage.setItem('isAdminAuth', 'true')
      setAdminPassword('')
      showAlert('¡Acceso de admin confirmado!')
    } else {
      showAlert('Clave secreta incorrecta', 'error')
    }
  }

  const handleLogoutAdmin = () => {
    setIsAdminAuth(false)
    localStorage.removeItem('isAdminAuth')
    setAdminPassword('')
    setView('public')
    showAlert('Sesión cerrada')
  }

  const handleGuestNameChange = (name) => {
    setGuestName(name)
    localStorage.setItem('guestName', name)
    if (!guestToken && name.trim()) {
      const token = Math.random().toString(36).substr(2, 9)
      setGuestToken(token)
      localStorage.setItem('guestToken', token)
    }
  }

  const addGift = async (newGift) => {
    try {
      const res = await fetch(`${API_URL}/api/gifts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newGift)
      })

      if (res.ok) {
        const addedGift = await res.json()
        setGifts(prev => [addedGift, ...prev])
        showAlert('¡Regalo agregado!')
      }
    } catch (error) {
      console.error('Error:', error)
      showAlert('Error al agregar regalo', 'error')
    }
  }

  const updateGift = async (id, updated) => {
    try {
      const res = await fetch(`${API_URL}/api/gifts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      })

      if (res.ok) {
        setGifts(prev => prev.map(g => g.id === id ? { ...g, ...updated } : g))
        showAlert('¡Regalo actualizado!')
      }
    } catch (error) {
      console.error('Error:', error)
      showAlert('Error al actualizar regalo', 'error')
    }
  }

  const deleteGift = async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/gifts/${id}`, { method: 'DELETE' })

      if (res.ok) {
        setGifts(prev => prev.filter(g => g.id !== id))
        const newRes = { ...reservations }
        delete newRes[id]
        setReservations(newRes)
        showAlert('¡Regalo eliminado!')
      }
    } catch (error) {
      console.error('Error:', error)
      showAlert('Error al eliminar regalo', 'error')
    }
  }

  const reserveGift = async (giftId) => {
    try {
      const res = await fetch(`${API_URL}/api/reservations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          giftId: parseInt(giftId),
          selectedBy: guestName,
          token: guestToken
        })
      })

      if (res.ok) {
        setReservations(prev => ({
          ...prev,
          [giftId]: { selectedBy: guestName, token: guestToken, timestamp: Date.now() }
        }))
        showAlert(`¡${guestName}, has seleccionado un regalo!`)
      } else {
        showAlert('Este regalo ya fue seleccionado', 'error')
      }
    } catch (error) {
      console.error('Error:', error)
      showAlert('Error al reservar regalo', 'error')
    }
  }

  const releaseGift = async (giftId, token) => {
    try {
      if (reservations[giftId]?.token !== token) {
        showAlert('No puedes liberar este regalo', 'error')
        return
      }

      const res = await fetch(`${API_URL}/api/reservations/${giftId}`, { method: 'DELETE' })

      if (res.ok) {
        const newRes = { ...reservations }
        delete newRes[giftId]
        setReservations(newRes)
        showAlert('¡Regalo liberado correctamente!')
      }
    } catch (error) {
      console.error('Error:', error)
      showAlert('Error al liberar regalo', 'error')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* NAVBAR */}
      <nav className="bg-gradient-to-r from-teal-600 to-teal-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold">🏠 House Shower</h1>
            <div className="flex gap-3">
              <button
                onClick={() => handlePublicView()}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  view === 'public'
                    ? 'bg-white text-teal-600'
                    : 'bg-teal-500 hover:bg-teal-600 text-white'
                }`}
              >
                Ver Regalos
              </button>
              <button
                onClick={() => {
                  if (!isAdminAuth) {
                    setView('admin')
                  } else {
                    setView('admin')
                    setAdminTab('add')
                  }
                }}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  view === 'admin'
                    ? 'bg-white text-teal-600'
                    : 'bg-teal-500 hover:bg-teal-600 text-white'
                }`}
              >
                Panel Admin
              </button>
              {isAdminAuth && (
                <button
                  onClick={handleLogoutAdmin}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-semibold text-white transition-colors"
                >
                  Salir
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* ALERTS */}
      <div className="fixed top-4 right-4 z-40 space-y-2">
        {alerts.map(alert => (
          <div
            key={alert.id}
            className={`alert px-4 py-3 rounded-lg text-white font-semibold shadow-lg ${
              alert.type === 'success' ? 'bg-green-500' : 'bg-red-500'
            }`}
          >
            {alert.message}
          </div>
        ))}
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {view === 'public' ? (
          <PublicView
            guestName={guestName}
            onGuestNameChange={handleGuestNameChange}
            gifts={gifts}
            reservations={reservations}
            onReserve={reserveGift}
            onRelease={releaseGift}
            selectedGift={selectedGift}
            onSelectGift={setSelectedGift}
            showAlert={showAlert}
          />
        ) : isAdminAuth ? (
          <AdminView
            gifts={gifts}
            reservations={reservations}
            adminTab={adminTab}
            onTabChange={setAdminTab}
            onAddGift={addGift}
            onEditGift={updateGift}
            onDeleteGift={deleteGift}
          />
        ) : (
          <AdminLoginView
            onAuth={handleAdminAuth}
            password={adminPassword}
            onPasswordChange={setAdminPassword}
          />
        )}
      </div>
    </div>
  )
}

function PublicView({ guestName, onGuestNameChange, gifts, reservations, onReserve, onRelease, selectedGift, onSelectGift, showAlert }) {
  const [releaseGiftId, setReleaseGiftId] = useState(null)
  const [releaseConfirmName, setReleaseConfirmName] = useState('')

  const handleReleaseConfirm = (giftId) => {
    const guestToken = localStorage.getItem('guestToken')
    if (releaseConfirmName.trim() === guestName.trim()) {
      onRelease(giftId, guestToken)
      setReleaseGiftId(null)
      setReleaseConfirmName('')
    } else {
      showAlert('El nombre no coincide', 'error')
    }
  }

  return (
    <div>
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-bold text-teal-600 mb-4">Selecciona los Regalos que Deseas</h2>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Tu Nombre *</label>
          <input
            type="text"
            value={guestName}
            onChange={(e) => onGuestNameChange(e.target.value)}
            placeholder="Ingresa tu nombre completo"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-2">
            ✓ Con tu nombre podrás seleccionar y liberar tus propios regalos
          </p>
        </div>
      </div>

      {guestName.trim() && gifts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {gifts.map(gift => {
            const isReserved = !!reservations[gift.id]
            const reservedByMe = reservations[gift.id]?.selectedBy === guestName

            return (
              <div
                key={gift.id}
                className={`bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col ${isReserved ? 'opacity-75 bg-gray-50' : ''}`}
              >
                {gift.image ? (
                  <img
                    src={gift.image}
                    alt={gift.name}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none'
                    }}
                  />
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-400">📦</div>
                )}

                <div className="flex-grow p-4">
                  <h3 className={`text-lg font-bold ${isReserved ? 'line-through text-gray-600' : 'text-teal-600'}`}>
                    {gift.name}
                    {isReserved && <span className="inline-block bg-red-100 text-red-800 text-xs font-semibold px-3 py-1 rounded-full ml-2">Reservado</span>}
                  </h3>
                  {gift.category && (
                    <p className="text-sm text-gray-600 mt-2">
                      <strong>Categoría:</strong> {gift.category}
                    </p>
                  )}
                  {gift.details && (
                    <p className="text-sm text-gray-600 mt-2">{gift.details}</p>
                  )}
                  {reservedByMe && (
                    <p className="text-xs text-green-600 mt-2 font-semibold">
                      ✓ Tú lo seleccionaste
                    </p>
                  )}
                </div>

                <div className="p-4 bg-gray-50 flex gap-2">
                  {!isReserved && (
                    <button
                      onClick={() => {
                        if (!guestName.trim()) {
                          showAlert('Por favor ingresa tu nombre', 'error')
                          return
                        }
                        onSelectGift(gift)
                      }}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors flex-1"
                    >
                      Seleccionar
                    </button>
                  )}
                  {reservedByMe && (
                    <button
                      onClick={() => setReleaseGiftId(gift.id)}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors flex-1"
                    >
                      Liberar
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : guestName.trim() && gifts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xl text-gray-500">No hay regalos disponibles aún</p>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-xl text-gray-500">Ingresa tu nombre para ver los regalos</p>
        </div>
      )}

      {selectedGift && (
        <GiftModal
          gift={selectedGift}
          onClose={() => onSelectGift(null)}
          onConfirm={() => {
            onReserve(selectedGift.id)
            onSelectGift(null)
          }}
        />
      )}

      {releaseGiftId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => { setReleaseGiftId(null); setReleaseConfirmName('') }}>
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => { setReleaseGiftId(null); setReleaseConfirmName('') }}
              className="float-right text-2xl font-bold text-gray-400 hover:text-gray-600 leading-none p-4"
            >
              ×
            </button>
            <div className="p-6 pt-2">
              <h3 className="text-xl font-bold text-red-600 mb-4">⚠️ Liberar Regalo</h3>
              <p className="text-gray-700 mb-4">
                Para liberar este regalo, escribe tu nombre para confirmar:
              </p>
              <input
                type="text"
                value={releaseConfirmName}
                onChange={(e) => setReleaseConfirmName(e.target.value)}
                placeholder={`Escribe: ${guestName}`}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent mb-4"
                autoFocus
              />
              <div className="flex gap-3">
                <button
                  onClick={() => { setReleaseGiftId(null); setReleaseConfirmName('') }}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-semibold transition-colors flex-1"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleReleaseConfirm(releaseGiftId)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors flex-1"
                >
                  Liberar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function AdminLoginView({ onAuth, password, onPasswordChange }) {
  const handleSubmit = (e) => {
    e.preventDefault()
    onAuth()
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-teal-600 mb-6 text-center">Panel de Administrador</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Clave Secreta</label>
            <input
              type="password"
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
              placeholder="Ingresa la clave secreta"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              autoFocus
            />
          </div>
          <button type="submit" className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold transition-colors w-full">
            Acceder
          </button>
        </form>
        <p className="text-xs text-gray-500 text-center mt-4">
          Clave demo: ADMIN123
        </p>
      </div>
    </div>
  )
}

function AdminView({ gifts, reservations, adminTab, onTabChange, onAddGift, onEditGift, onDeleteGift }) {
  const [formData, setFormData] = useState({ name: '', image: '', category: '', details: '', buyUrl: '' })
  const [editingId, setEditingId] = useState(null)

  const handleAddGift = () => {
    if (!formData.name.trim() || !formData.image.trim()) {
      alert('Nombre e imagen son obligatorios')
      return
    }
    onAddGift(formData)
    setFormData({ name: '', image: '', category: '', details: '', buyUrl: '' })
  }

  const handleEditGift = (id) => {
    const gift = gifts.find(g => g.id === id)
    setFormData(gift)
    setEditingId(id)
  }

  const handleSaveEdit = () => {
    onEditGift(editingId, formData)
    setEditingId(null)
    setFormData({ name: '', image: '', category: '', details: '', buyUrl: '' })
  }

  const handleCancel = () => {
    setEditingId(null)
    setFormData({ name: '', image: '', category: '', details: '', buyUrl: '' })
  }

  return (
    <div>
      {/* TABS */}
      <div className="flex gap-6 border-b border-gray-200 mb-6">
        <button
          onClick={() => onTabChange('add')}
          className={`px-4 py-2 font-semibold border-b-2 transition-colors ${adminTab === 'add' ? 'text-teal-600 border-teal-600' : 'text-gray-600 border-transparent hover:border-gray-300'}`}
        >
          ➕ Agregar Regalo
        </button>
        <button
          onClick={() => onTabChange('manage')}
          className={`px-4 py-2 font-semibold border-b-2 transition-colors ${adminTab === 'manage' ? 'text-teal-600 border-teal-600' : 'text-gray-600 border-transparent hover:border-gray-300'}`}
        >
          🎁 Gestionar
        </button>
        <button
          onClick={() => onTabChange('analytics')}
          className={`px-4 py-2 font-semibold border-b-2 transition-colors ${adminTab === 'analytics' ? 'text-teal-600 border-teal-600' : 'text-gray-600 border-transparent hover:border-gray-300'}`}
        >
          📊 Análisis
        </button>
      </div>

      {/* TAB: ADD */}
      {adminTab === 'add' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-teal-600 mb-6">
            {editingId ? 'Editar Regalo' : 'Agregar Nuevo Regalo'}
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Nombre del Regalo *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej: Almohada de lujo"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">URL de Imagen *</label>
              <input
                type="text"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                placeholder="https://ejemplo.com/imagen.jpg"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Categoría</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="Ej: Dormitorio"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Link de Compra</label>
                <input
                  type="text"
                  value={formData.buyUrl}
                  onChange={(e) => setFormData({ ...formData, buyUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Detalles/Descripción</label>
              <textarea
                value={formData.details}
                onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                placeholder="Describe el regalo en detalle..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-vertical min-h-24"
              />
            </div>
            <div className="flex gap-3 pt-4">
              {editingId ? (
                <>
                  <button onClick={handleSaveEdit} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors flex-1">
                    Guardar Cambios
                  </button>
                  <button onClick={handleCancel} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-semibold transition-colors flex-1">
                    Cancelar
                  </button>
                </>
              ) : (
                <button onClick={handleAddGift} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors w-full">
                  Agregar Regalo
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB: MANAGE */}
      {adminTab === 'manage' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-teal-600 mb-6">Gestionar Regalos</h3>
          {gifts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {gifts.map(gift => {
                const isReserved = !!reservations[gift.id]
                const reservedBy = reservations[gift.id]?.selectedBy

                return (
                  <div key={gift.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col">
                    {gift.image ? (
                      <img src={gift.image} alt={gift.name} className="w-full h-48 object-cover" />
                    ) : (
                      <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-400">📦</div>
                    )}
                    <div className="p-4 flex-grow">
                      <h4 className="font-bold text-teal-600">
                        {gift.name}
                        {isReserved && <span className="inline-block bg-red-100 text-red-800 text-xs font-semibold px-3 py-1 rounded-full ml-2">✓ RESERVADO</span>}
                      </h4>
                      {gift.category && <p className="text-sm text-gray-600 mt-2">📂 {gift.category}</p>}
                      {isReserved && (
                        <p className="text-sm text-gray-700 mt-2 font-semibold">
                          👤 Seleccionado por: <span className="text-teal-600">{reservedBy}</span>
                        </p>
                      )}
                    </div>
                    <div className="p-4 bg-gray-50 flex gap-2">
                      <button
                        onClick={() => handleEditGift(gift.id)}
                        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-semibold transition-colors flex-1 text-sm"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('¿Eliminar este regalo?')) {
                            onDeleteGift(gift.id)
                          }
                        }}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors flex-1 text-sm"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">No hay regalos agregados aún</p>
          )}
        </div>
      )}

      {/* TAB: ANALYTICS */}
      {adminTab === 'analytics' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-teal-600 mb-6">Análisis de Selecciones</h3>
          {gifts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-bold text-teal-600">Regalo</th>
                    <th className="text-left py-3 px-4 font-bold text-teal-600">Categoría</th>
                    <th className="text-left py-3 px-4 font-bold text-teal-600">Seleccionado Por</th>
                    <th className="text-left py-3 px-4 font-bold text-teal-600">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {gifts.map(gift => {
                    const isReserved = !!reservations[gift.id]
                    const reservedBy = reservations[gift.id]?.selectedBy || '-'

                    return (
                      <tr key={gift.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 font-semibold">{gift.name}</td>
                        <td className="py-3 px-4">{gift.category || '-'}</td>
                        <td className="py-3 px-4">
                          {isReserved ? (
                            <span className="font-semibold text-teal-600">{reservedBy}</span>
                          ) : (
                            <span className="text-gray-500">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                              isReserved
                                ? 'bg-red-100 text-red-800'
                                : 'bg-green-100 text-green-800'
                            }`}
                          >
                            {isReserved ? '✓ Reservado' : '⭕ Disponible'}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">No hay regalos agregados aún</p>
          )}
        </div>
      )}
    </div>
  )
}

function GiftModal({ gift, onClose, onConfirm }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="float-right text-2xl font-bold text-gray-400 hover:text-gray-600 leading-none p-4"
        >
          ×
        </button>
        <div className="p-6 pt-2">
          <h3 className="text-xl font-bold text-teal-600 mb-4">Confirmar Selección</h3>

          {gift.image && (
            <img
              src={gift.image}
              alt={gift.name}
              className="w-full h-48 object-cover rounded-lg mb-4"
              onError={(e) => {
                e.target.style.display = 'none'
              }}
            />
          )}

          <div className="mb-4">
            <p className="text-lg font-bold text-gray-800">{gift.name}</p>
            {gift.category && <p className="text-sm text-gray-600 mt-2">📂 {gift.category}</p>}
            {gift.details && <p className="text-sm text-gray-600 mt-2">{gift.details}</p>}
            {gift.buyUrl && (
              <a
                href={gift.buyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-teal-600 hover:underline mt-2 inline-block"
              >
                🔗 Ver en tienda
              </a>
            )}
          </div>

          <div className="flex gap-3">
            <button onClick={onClose} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-semibold transition-colors flex-1">
              Cancelar
            </button>
            <button onClick={onConfirm} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors flex-1">
              Confirmar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HouseShowerApp
