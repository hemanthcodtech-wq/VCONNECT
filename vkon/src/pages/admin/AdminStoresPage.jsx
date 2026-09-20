import React, { useEffect, useState } from "react";
import { Store, MapPin, Calendar, Search, Trash2, Plus, X } from "lucide-react";
import { motion } from "framer-motion";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api";

export function AdminStoresPage() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [clearing, setClearing] = useState(null);

  // Add Store Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStore, setNewStore] = useState({ name: '', owner_name: '', email: '', phone: '', address: '', certificate_url: '' });
  const [adding, setAdding] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch(`${BACKEND_URL}/stores`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => { if (Array.isArray(d)) setStores(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("image", file);
    
    setUploadingImage(true);
    try {
      const res = await fetch(`${BACKEND_URL}/admin/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setNewStore({ ...newStore, certificate_url: data.url });
      } else {
        alert(data.error || "Failed to upload image");
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleAddStore = async (e) => {
    e.preventDefault();
    setAdding(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BACKEND_URL}/stores`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(newStore)
      });
      const data = await res.json();
      if (res.ok) {
        setStores([data, ...stores]);
        setShowAddModal(false);
        setNewStore({ name: '', owner_name: '', email: '', phone: '', address: '', certificate_url: '' });
      } else {
        alert(data.error || "Failed to add store");
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteStore = async (store) => {
    if (!window.confirm(`Delete store "${store.name}"?`)) return;
    setClearing(store.id);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BACKEND_URL}/stores/${store.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setStores(prev => prev.filter(c => c.id !== store.id));
      } else {
        alert(data.error || "Failed to remove store");
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setClearing(null);
    }
  };

  const filtered = stores.filter(c =>
    (!search ||
      (c.name && c.name.toLowerCase().includes(search.toLowerCase())) ||
      (c.address && c.address.toLowerCase().includes(search.toLowerCase()))
    )
  );

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-4 border-brand-blue/20 border-t-[#08183A] rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="w-full max-w-5xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900">Stores</h1>
          <p className="text-gray-900/40 text-xs font-sans mt-0.5">{stores.length} total stores</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 bg-[#0033a0] text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:bg-[#002277] transition-all"
        >
          <Plus className="w-4 h-4" /> Add Store
        </button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-900/40" />
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by store name or address..."
          className="w-full pl-9 pr-4 py-3 rounded-xl bg-white border border-brand-blue/10 text-gray-900 font-sans text-sm focus:outline-none focus:border-brand-blue/30 shadow-sm" />
      </div>

      <div className="bg-white rounded-2xl border border-brand-blue/10 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm font-sans min-w-[680px]">
            <thead>
              <tr className="bg-[#FDF8F0] text-gray-900/60 text-xs uppercase tracking-wider border-b border-brand-blue/10">
                <th className="text-left py-4 px-4 sm:px-6 font-semibold">Store Name</th>
                <th className="text-left py-4 px-4 sm:px-6 font-semibold">Contact</th>
                <th className="text-left py-4 px-4 sm:px-6 font-semibold">Address</th>
                <th className="text-left py-4 px-4 sm:px-6 font-semibold">Created</th>
                <th className="py-4 px-4 sm:px-6 font-semibold"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#08183A]/5">
              {filtered.map((store, i) => (
                <motion.tr key={store.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }} className="hover:bg-[#FDF8F0]/50 transition-colors">

                  {/* Name */}
                  <td className="py-4 px-4 sm:px-6">
                    <div className="flex items-center gap-3">
                      {store.certificate_url ? (
                        <a href={store.certificate_url} target="_blank" rel="noopener noreferrer" className="shrink-0 cursor-pointer hover:opacity-80 transition-opacity">
                          <img src={store.certificate_url} alt={store.name} className="w-8 h-8 rounded-lg object-cover border border-brand-blue/10" />
                        </a>
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center font-bold shrink-0">
                          <Store className="w-4 h-4" />
                        </div>
                      )}
                      <div>
                        <span className="font-semibold text-gray-900 block">{store.name || "Unknown Store"}</span>
                        {store.owner_name && <span className="text-xs text-gray-900/60 font-medium">By {store.owner_name}</span>}
                      </div>
                    </div>
                  </td>

                  {/* Contact */}
                  <td className="py-4 px-4 sm:px-6">
                    <div className="flex flex-col gap-1 text-xs text-gray-900/70">
                      {store.email && <div><span className="font-semibold text-gray-400">E:</span> {store.email}</div>}
                      {store.phone && <div><span className="font-semibold text-gray-400">P:</span> {store.phone}</div>}
                      {!store.email && !store.phone && <span>—</span>}
                    </div>
                  </td>

                  {/* Address */}
                  <td className="py-4 px-4 sm:px-6">
                    <div className="flex items-start gap-1.5 text-xs text-gray-900/70 mb-1 max-w-[280px]">
                      <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span className="truncate whitespace-normal leading-relaxed">{store.address || '—'}</span>
                    </div>
                  </td>

                  {/* Created */}
                  <td className="py-4 px-4 sm:px-6 text-xs text-gray-900/60">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(store.created_at).toLocaleDateString("en-IN")}
                    </div>
                  </td>

                  {/* Clear action */}
                  <td className="py-4 px-4 sm:px-6 text-right">
                    <button
                      onClick={() => handleDeleteStore(store)}
                      disabled={clearing === store.id}
                      title="Delete store"
                      className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </motion.tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-900/50">
                    No stores found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-serif font-bold text-xl text-gray-900">Add New Store</h2>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddStore} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider mb-2">Store Name</label>
                <input required type="text" value={newStore.name} onChange={e => setNewStore({...newStore, name: e.target.value})} className="w-full px-4 py-3 bg-[#FDF8F0] border border-brand-blue/10 rounded-xl text-sm focus:outline-none focus:border-[#F29D38]" placeholder="e.g. Downtown Branch" />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider mb-2">Owner / Contact Name</label>
                <input type="text" value={newStore.owner_name} onChange={e => setNewStore({...newStore, owner_name: e.target.value})} className="w-full px-4 py-3 bg-[#FDF8F0] border border-brand-blue/10 rounded-xl text-sm focus:outline-none focus:border-[#F29D38]" placeholder="e.g. John Doe" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider mb-2">Email</label>
                  <input type="email" value={newStore.email} onChange={e => setNewStore({...newStore, email: e.target.value})} className="w-full px-4 py-3 bg-[#FDF8F0] border border-brand-blue/10 rounded-xl text-sm focus:outline-none focus:border-[#F29D38]" placeholder="store@example.com" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider mb-2">Phone</label>
                  <input type="text" value={newStore.phone} onChange={e => setNewStore({...newStore, phone: e.target.value})} className="w-full px-4 py-3 bg-[#FDF8F0] border border-brand-blue/10 rounded-xl text-sm focus:outline-none focus:border-[#F29D38]" placeholder="+91 9876543210" />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider mb-2">Store Address</label>
                <textarea required value={newStore.address} onChange={e => setNewStore({...newStore, address: e.target.value})} rows={3} className="w-full px-4 py-3 bg-[#FDF8F0] border border-brand-blue/10 rounded-xl text-sm focus:outline-none focus:border-[#F29D38] resize-none" placeholder="Enter full store address..." />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider mb-2">Shop Establishment Certificate / Store Image</label>
                <div className="flex items-center gap-4">
                  <label className={`cursor-pointer bg-[#FDF8F0] border border-brand-blue/10 rounded-xl px-4 py-3 text-sm flex items-center justify-center gap-2 hover:border-[#F29D38] transition-colors ${uploadingImage ? 'opacity-50 pointer-events-none' : ''}`}>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    <span className="font-semibold text-gray-700">{uploadingImage ? 'Uploading...' : 'Upload Image'}</span>
                  </label>
                  {newStore.certificate_url && (
                    <img src={newStore.certificate_url} alt="Certificate" className="w-12 h-12 rounded-lg object-cover border border-gray-200" />
                  )}
                </div>
              </div>
              
              <div className="pt-2">
                <button type="submit" disabled={adding || uploadingImage} className="w-full bg-[#0033a0] text-white font-bold py-3 rounded-xl hover:bg-[#002277] transition-all disabled:opacity-50">
                  {adding ? 'Adding...' : 'Add Store'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
