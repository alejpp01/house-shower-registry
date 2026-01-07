import React, { useState, useEffect } from 'react';

// app.jsx completo: selección con cantidades, zona VIP separada, CRUD de regalos,
// panel admin muestra quién seleccionó cada objeto y permite modificar/eliminar,
// los objetos seleccionados por alguien aparecen tachados.

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const CORRECT_PASSWORD = 'Juanchoesgey';

export default function App() {
  const [currentStep, setCurrentStep] = useState('name'); // 'name' | 'selection' | 'vip' | 'adminPassword' | 'admin'
  const [userName, setUserName] = useState('');

  // Data from server
  const [gifts, setGifts] = useState([]);
  const [selections, setSelections] = useState([]); // { id, giftId, userName, qty, createdAt }

  // Selection local state: map giftId => qty
  const [selectedQty, setSelectedQty] = useState({});

  // Admin / add-edit form
  const [adminPassword, setAdminPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const [form, setForm] = useState({
    id: null,
    name: '',
    image: '',
    category: '',
    details: '',
    buyurl: '',
    price: '',
    isVip: false,
    available_count: 1 // cuántos hay disponibles
  });

  // Load gifts and selections
  const loadGifts = async () => {
    try {
      const res = await fetch(`${API_URL}/api/gifts`);
      if (!res.ok) throw new Error('error fetching gifts');
      const data = await res.json();
      // expect gifts to have: id, name, image, category, details, buyurl, price, is_vip, available_count
      setGifts(data);
    } catch (err) {
      console.error(err);
      // keep empty array
    }
  };

  const loadSelections = async () => {
    try {
      const res = await fetch(`${API_URL}/api/selections`);
      if (!res.ok) throw new Error('error fetching selections');
      const data = await res.json();
      setSelections(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadGifts();
    loadSelections();
  }, []);

  // Helpers
  const vipGifts = gifts.filter(g => g.is_vip);
  const normalGifts = gifts.filter(g => !g.is_vip);

  // For a gift determine how many have already been selected (reserved)
  const reservedCountFor = (giftId) => selections
    .filter(s => s.giftId === giftId)
    .reduce((sum, s) => sum + (s.qty || 0), 0);

  // =====================
  // ADMIN PASSWORD
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
  // CRUD: agregar, actualizar, eliminar regalo
  // =====================
  const addGift = async () => {
    try {
      const payload = {
        name: form.name,
        image: form.image,
        category: form.category,
        details: form.details,
        buyurl: form.buyurl,
        price: form.price,
        is_vip: !!form.isVip,
        available_count: Number(form.available_count) || 1
      };
      const res = await fetch(`${API_URL}/api/gifts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('error creating');
      await loadGifts();
      setForm({ id: null, name: '', image: '', category: '', details: '', buyurl: '', price: '', isVip: false, available_count: 1 });
    } catch (err) {
      console.error(err);
      alert('Error creando regalo');
    }
  };

  const updateGift = async () => {
    try {
      if (!form.id) return;
      const payload = {
        name: form.name,
        image: form.image,
        category: form.category,
        details: form.details,
        buyurl: form.buyurl,
        price: form.price,
        is_vip: !!form.isVip,
        available_count: Number(form.available_count) || 1
      };
      const res = await fetch(`${API_URL}/api/gifts/${form.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('error updating');
      await loadGifts();
      await loadSelections();
      setForm({ id: null, name: '', image: '', category: '', details: '', buyurl: '', price: '', isVip: false, available_count: 1 });
    } catch (err) {
      console.error(err);
      alert('Error actualizando regalo');
    }
  };

  const deleteGift = async (id) => {
    if (!confirm('¿Eliminar regalo? Esta acción es irreversible.')) return;
    try {
      const res = await fetch(`${API_URL}/api/gifts/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('error deleting');
      await loadGifts();
      await loadSelections();
    } catch (err) {
      console.error(err);
      alert('Error eliminando regalo');
    }
  };

  // Admin: cargar regalo en formulario para editar
  const editGift = (g) => {
    setForm({
      id: g.id,
      name: g.name || '',
      image: g.image || '',
      category: g.category || '',
      details: g.details || '',
      buyurl: g.buyurl || '',
      price: g.price || '',
      isVip: !!g.is_vip,
      available_count: g.available_count ?? 1
    });
    // keep admin view
  };

  // =====================
  // SELECCIÓN USUARIO
  // =====================
  // modificar cantidad local seleccionada
  const setSelectedQuantity = (giftId, qty) => {
    setSelectedQty(prev => {
      const next = { ...prev };
      if (!qty || qty <= 0) {
        delete next[giftId];
      } else {
        next[giftId] = qty;
      }
      return next;
    });
  };

  // increment/decrement with limit checks
  const incSelected = (gift) => {
    const reserved = reservedCountFor(gift.id);
    const available = (gift.available_count ?? 1) - reserved;
    const current = selectedQty[gift.id] || 0;
    if (current < available) setSelectedQuantity(gift.id, current + 1);
  };
  const decSelected = (gift) => {
    const current = selectedQty[gift.id] || 0;
    if (current > 1) setSelectedQuantity(gift.id, current - 1);
    else setSelectedQuantity(gift.id, 0);
  };

  // Confirmar selección -> enviar al servidor
  const confirmSelection = async () => {
    const items = Object.entries(selectedQty).map(([id, qty]) => ({ giftId: Number(id), qty: Number(qty) }));
    if (items.length === 0) return alert('No seleccionaste nada');
    if (!userName || !userName.trim()) return alert('Ingresa tu nombre antes de confirmar');

    try {
      const res = await fetch(`${API_URL}/api/selections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userName: userName.trim(), items })
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'error posting selections');
      }

      // server should update gift available_count or create selection records
      await loadGifts();
      await loadSelections();
      setSelectedQty({});
      alert('Selección registrada. Gracias!');
    } catch (err) {
      console.error(err);
      alert('Error al confirmar selección. Es posible que no haya stock suficiente.');
      // reload to reflect server state
      await loadGifts();
      await loadSelections();
    }
  };

  // Admin: manually adjust available_count for a gift (quick inline update)
  const setAvailableCount = async (giftId, newCount) => {
    try {
      const res = await fetch(`${API_URL}/api/gifts/${giftId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ available_count: Number(newCount) })
      });
      if (!res.ok) throw new Error('error');
      await loadGifts();
    } catch (err) {
      console.error(err);
      alert('No se pudo actualizar la cantidad disponible');
    }
  };

  // =====================
  // UI: vistas
  // =====================

  // PANTALLA NOMBRE
  if (currentStep === 'name') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-orange-400 via-slate-900 to-black p-6">
        <div className="w-full max-w-md bg-slate-900/95 rounded-2xl p-10 shadow-xl text-center">
          <h1 className="text-3xl text-white mb-2">Bienvenido</h1>
          <p className="text-sm text-slate-300 mb-6">Ingresa tu nombre para comenzar a seleccionar regalos.</p>

          <input
            className="w-full p-3 rounded-lg bg-slate-800 text-white border border-slate-700 mb-4"
            placeholder="Tu nombre"
            value={userName}
            onChange={e => setUserName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && userName.trim()) setCurrentStep('selection'); }}
          />

          <button
            onClick={() => { if (userName.trim()) setCurrentStep('selection'); }}
            className={`w-full py-3 rounded-full text-white font-semibold ${userName.trim() ? 'bg-gradient-to-r from-orange-500 to-pink-500 shadow' : 'opacity-60'}`}>
            Continuar
          </button>

          <button
            onClick={() => setCurrentStep('adminPassword')}
            className="mt-3 w-full py-2 rounded-lg border border-slate-700 text-slate-300"
          >Panel Admin</button>
        </div>
      </div>
    );
  }

  // PANTALLA CONTRASEÑA ADMIN
  if (currentStep === 'adminPassword') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-orange-400 via-slate-900 to-black p-6">
        <div className="w-full max-w-md bg-slate-900/95 rounded-2xl p-10 shadow-xl text-center">
          <h1 className="text-2xl text-white mb-2">Panel Admin</h1>
          <p className="text-sm text-slate-300 mb-6">Introduce la contraseña para acceder.</p>
          <input
            type="password"
            className="w-full p-3 rounded-lg bg-slate-800 text-white border border-slate-700 mb-4"
            placeholder="Contraseña"
            value={adminPassword}
            onChange={e => { setAdminPassword(e.target.value); setPasswordError(''); }}
            onKeyDown={e => { if (e.key === 'Enter') handlePasswordSubmit(); }}
          />
          {passwordError && <div className="text-red-400 mb-2">{passwordError}</div>}
          <div className="flex gap-2">
            <button onClick={handlePasswordSubmit} className="flex-1 py-2 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 text-white">Acceder</button>
            <button onClick={() => setCurrentStep('name')} className="flex-1 py-2 rounded-lg border border-slate-700 text-slate-300">Volver</button>
          </div>
        </div>
      </div>
    );
  }

  // PANTALLA VIP (separada)
  if (currentStep === 'vip') {
    return (
      <div className="min-h-screen p-8 bg-gradient-to-b from-orange-400 via-slate-900 to-black text-white">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl">Zona VIP</h1>
            <div className="flex gap-2">
              <button onClick={() => setCurrentStep('selection')} className="py-2 px-3 rounded bg-slate-800/80">Volver</button>
              <button onClick={() => { setCurrentStep('adminPassword'); }} className="py-2 px-3 rounded bg-slate-800/60">Admin</button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {vipGifts.length === 0 && <div className="text-slate-300">No hay regalos VIP</div>}
            {vipGifts.map(g => {
              const reserved = reservedCountFor(g.id);
              const available = (g.available_count ?? 1) - reserved;
              const selected = selectedQty[g.id] || 0;
              const isTachado = reserved > 0; // alguien ya lo seleccionó

              return (
                <div key={g.id} className={`p-4 rounded-lg bg-slate-900/90 border ${isTachado ? 'line-through opacity-60' : 'border-yellow-400/30'}`}>
                  {g.image && <img src={g.image} alt="" className="w-full h-36 object-cover rounded mb-2" />}
                  <h3 className="font-semibold">{g.name}</h3>
                  <div className="text-sm text-slate-300 mb-2">{g.category}</div>
                  <div className="flex items-center gap-2 mb-2">
                    <button onClick={() => decSelected(g)} className="px-2 py-1 rounded bg-slate-700">-</button>
                    <div className="w-8 text-center">{selected}</div>
                    <button onClick={() => incSelected(g)} className="px-2 py-1 rounded bg-slate-700">+</button>
                    <div className="ml-auto text-sm">Disp: {available}</div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => confirmSelection()} className="flex-1 py-2 rounded bg-gradient-to-r from-orange-500 to-pink-500">Confirmar</button>
                    <button onClick={() => setSelectedQty(prev => { const next = { ...prev }; delete next[g.id]; return next; })} className="py-2 px-3 rounded border">Limpiar</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // PANTALLA SELECCION (principal)
  if (currentStep === 'selection') {
    return (
      <div className="min-h-screen p-8 bg-gradient-to-b from-orange-400 via-slate-900 to-black text-white">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h1 className="text-2xl">Hola, {userName}</h1>
                <p className="text-slate-300">Selecciona los regalos que te gustaría recibir.</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setSelectedQty({}); setUserName(''); setCurrentStep('name'); }} className="py-2 px-3 rounded border">Cambiar nombre</button>
                <button onClick={() => setCurrentStep('vip')} className="py-2 px-3 rounded bg-yellow-400 text-black font-semibold">Ver zona VIP</button>
                <button onClick={() => setCurrentStep('adminPassword')} className="py-2 px-3 rounded border">Admin</button>
              </div>
            </div>

            {/* VIP section inline preview */}
            <div className="mb-6">
              <h2 className="text-lg">👑 Regalos VIP</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-3">
                {vipGifts.length === 0 && <div className="text-slate-400">No hay regalos VIP</div>}
                {vipGifts.map(g => {
                  const reserved = reservedCountFor(g.id);
                  const available = (g.available_count ?? 1) - reserved;
                  const selected = selectedQty[g.id] || 0;
                  const isTachado = reserved > 0;

                  return (
                    <div key={g.id} className={`p-3 rounded-lg bg-slate-900/90 border ${isTachado ? 'line-through opacity-60' : 'border-yellow-400/20'}`}>
                      {g.image && <img src={g.image} className="w-full h-28 object-cover rounded mb-2" />}
                      <div className="flex items-start gap-2">
                        <div style={{flex:1}}>
                          <div className="font-semibold">{g.name}</div>
                          <div className="text-sm text-slate-300">{g.category}</div>
                          <div className="text-sm mt-1">Disp: {available}</div>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                          <div className="flex items-center gap-1">
                            <button onClick={() => decSelected(g)} className="px-2 py-1 rounded bg-slate-700">-</button>
                            <div className="w-8 text-center">{selected}</div>
                            <button onClick={() => incSelected(g)} className="px-2 py-1 rounded bg-slate-700">+</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Normal gifts */}
            <section>
              <h2 className="text-lg">🎁 Regalos disponibles</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-3">
                {normalGifts.length === 0 && <div className="text-slate-400">No hay regalos disponibles</div>}
                {normalGifts.map(g => {
                  const reserved = reservedCountFor(g.id);
                  const available = (g.available_count ?? 1) - reserved;
                  const selected = selectedQty[g.id] || 0;
                  const isTachado = reserved > 0;

                  return (
                    <div key={g.id} className={`p-3 rounded-lg bg-slate-900/95 border ${isTachado ? 'line-through opacity-60' : 'border-slate-800'}`}>
                      {g.image && <img src={g.image} className="w-full h-28 object-cover rounded mb-2" />}
                      <div className="flex items-start gap-2">
                        <div style={{flex:1}}>
                          <div className="font-semibold">{g.name}</div>
                          <div className="text-sm text-slate-300">{g.category}</div>
                          <div className="text-sm mt-1">Disp: {available}</div>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                          <div className="flex items-center gap-1">
                            <button onClick={() => decSelected(g)} className="px-2 py-1 rounded bg-slate-700">-</button>
                            <div className="w-8 text-center">{selected}</div>
                            <button onClick={() => incSelected(g)} className="px-2 py-1 rounded bg-slate-700">+</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          {/* Sidebar: mi selección */}
          <aside className="bg-slate-900/95 rounded-lg p-4">
            <h3 className="text-lg">Mis deseos</h3>
            <p className="text-sm text-slate-300">{Object.keys(selectedQty).length} artículo(s) seleccionado(s)</p>

            <div className="mt-3 space-y-2 max-h-80 overflow-auto">
              {Object.keys(selectedQty).length === 0 && <div className="text-slate-400">Selecciona artículos haciendo clic en +</div>}
              {Object.entries(selectedQty).map(([id, qty]) => {
                const gift = gifts.find(g => g.id === Number(id)) || { name: 'Objeto eliminado' };
                return (
                  <div key={id} className="flex items-center gap-2 bg-slate-800/60 p-2 rounded">
                    <div className="flex-1">
                      <div className="font-medium">{gift.name}</div>
                      <div className="text-sm text-slate-300">Cantidad: {qty}</div>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => setSelectedQuantity(Number(id), Number(qty) - 1)} className="px-2 py-1 rounded bg-red-600">-</button>
                      <button onClick={() => setSelectedQuantity(Number(id), Number(qty) + 1)} className="px-2 py-1 rounded bg-green-600">+</button>
                      <button onClick={() => { const next = { ...selectedQty }; delete next[id]; setSelectedQty(next); }} className="px-2 py-1 rounded border">x</button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4">
              <div className="flex justify-between text-sm mb-2">
                <span>Total items</span>
                <span>{Object.values(selectedQty).reduce((s, v) => s + Number(v), 0)}</span>
              </div>

              <button onClick={confirmSelection} className="w-full py-2 rounded bg-gradient-to-r from-orange-500 to-pink-500">📤 Confirmar lista</button>
              <button onClick={() => setSelectedQty({})} className="w-full mt-2 py-2 rounded border">Limpiar selección</button>
            </div>
          </aside>
        </div>
      </div>
    );
  }

  // PANTALLA ADMIN
  // mostramos formulario (agregar/editar) y la lista con opciones de editar/eliminar
  // además mostramos, para cada regalo, quién lo seleccionó (selections)
  return (
    <div className="min-h-screen p-8 bg-gradient-to-b from-orange-400 via-slate-900 to-black text-white">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-slate-900/95 rounded-lg p-4">
          <h2 className="text-xl mb-2">Formulario de regalo</h2>
          <div className="space-y-2">
            <input className="w-full p-2 rounded bg-slate-800" placeholder="Nombre" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            <input className="w-full p-2 rounded bg-slate-800" placeholder="URL imagen" value={form.image} onChange={e => setForm(f => ({ ...f, image: e.target.value }))} />
            <input className="w-full p-2 rounded bg-slate-800" placeholder="Categoría" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} />
            <input className="w-full p-2 rounded bg-slate-800" placeholder="Precio" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} />
            <textarea className="w-full p-2 rounded bg-slate-800" placeholder="Detalles" value={form.details} onChange={e => setForm(f => ({ ...f, details: e.target.value }))} />
            <input className="w-full p-2 rounded bg-slate-800" placeholder="Link compra" value={form.buyurl} onChange={e => setForm(f => ({ ...f, buyurl: e.target.value }))} />
            <div className="flex gap-2">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.isVip} onChange={e => setForm(f => ({ ...f, isVip: e.target.checked }))} /> Mostrar en VIP
              </label>
              <label className="flex items-center gap-2 ml-auto">
                <span>Disponibles</span>
                <input type="number" min={0} className="w-20 p-1 rounded bg-slate-800" value={form.available_count} onChange={e => setForm(f => ({ ...f, available_count: Number(e.target.value) }))} />
              </label>
            </div>

            <div className="flex gap-2">
              {form.id ? (
                <>
                  <button onClick={updateGift} className="flex-1 py-2 rounded bg-yellow-500 text-black">Guardar cambios</button>
                  <button onClick={() => setForm({ id: null, name: '', image: '', category: '', details: '', buyurl: '', price: '', isVip: false, available_count: 1 })} className="flex-1 py-2 rounded border">Cancelar</button>
                </>
              ) : (
                <button onClick={addGift} className="w-full py-2 rounded bg-gradient-to-r from-orange-500 to-pink-500">Agregar regalo</button>
              )}
            </div>

            <button onClick={() => { setCurrentStep('name'); }} className="w-full mt-2 py-2 rounded border">← Volver</button>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <section className="bg-slate-900/95 rounded-lg p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg">Zona VIP ({vipGifts.length})</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {vipGifts.map(g => (
                <div key={g.id} className="p-3 rounded bg-slate-800/70 border">
                  <div className="flex items-start gap-3">
                    {g.image && <img src={g.image} className="w-16 h-16 object-cover rounded" />}
                    <div style={{flex:1}}>
                      <div className="font-semibold">{g.name}</div>
                      <div className="text-sm text-slate-300">{g.category} — Precio: ${g.price}</div>
                      <div className="text-sm text-slate-300">Disponibles: {g.available_count} — Seleccionados: {reservedCountFor(g.id)}</div>

                      <div className="flex gap-2 mt-2">
                        <button onClick={() => editGift(g)} className="py-1 px-2 rounded border">Editar</button>
                        <button onClick={() => deleteGift(g.id)} className="py-1 px-2 rounded bg-red-600">Eliminar</button>
                        <div className="ml-auto text-sm">ID: {g.id}</div>
                      </div>

                      {/* Quién seleccionó este regalo */}
                      <div className="mt-3 text-sm">
                        <strong>Seleccionado por:</strong>
                        <ul className="list-disc ml-5 mt-1">
                          {selections.filter(s => s.giftId === g.id).length === 0 && <li className="text-slate-400">Nadie aun</li>}
                          {selections.filter(s => s.giftId === g.id).map(s => (
                            <li key={s.id}>{s.userName} — cantidad: {s.qty} — {new Date(s.createdAt).toLocaleString()}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-slate-900/95 rounded-lg p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg">Regalos normales ({normalGifts.length})</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {normalGifts.map(g => (
                <div key={g.id} className="p-3 rounded bg-slate-800/70 border">
                  <div className="flex items-start gap-3">
                    {g.image && <img src={g.image} className="w-16 h-16 object-cover rounded" />}
                    <div style={{flex:1}}>
                      <div className="font-semibold">{g.name}</div>
                      <div className="text-sm text-slate-300">{g.category} — Precio: ${g.price}</div>
                      <div className="text-sm text-slate-300">Disponibles: {g.available_count} — Seleccionados: {reservedCountFor(g.id)}</div>

                      <div className="flex gap-2 mt-2">
                        <button onClick={() => editGift(g)} className="py-1 px-2 rounded border">Editar</button>
                        <button onClick={() => deleteGift(g.id)} className="py-1 px-2 rounded bg-red-600">Eliminar</button>
                        <div className="ml-auto text-sm">ID: {g.id}</div>
                      </div>

                      <div className="mt-3 text-sm">
                        <strong>Seleccionado por:</strong>
                        <ul className="list-disc ml-5 mt-1">
                          {selections.filter(s => s.giftId === g.id).length === 0 && <li className="text-slate-400">Nadie aun</li>}
                          {selections.filter(s => s.giftId === g.id).map(s => (
                            <li key={s.id}>{s.userName} — cantidad: {s.qty} — {new Date(s.createdAt).toLocaleString()}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </section>
        </div>
      </div>
    </div>
  );
}
