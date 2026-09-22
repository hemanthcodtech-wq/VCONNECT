import React, { useEffect, useState } from "react";
import { Users, Mail, Phone, Calendar, Search, Trash2, CheckCircle, XCircle, Plus, X, Truck } from "lucide-react";
import { motion } from "framer-motion";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api";

export function AdminDeliveryVehiclesPage() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [clearing, setClearing] = useState(null);

  // Add Vehicle Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newVehicle, setNewVehicle] = useState({ name: '', vehicle_number: '', email: '', phone: '' });
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch(`${BACKEND_URL}/admin/delivery-vehicles`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => { if (d.partners) setVehicles(d.partners); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const handleAddVehicle = async (e) => {
    e.preventDefault();
    setAdding(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BACKEND_URL}/admin/delivery-vehicles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(newVehicle) 
      });
      const data = await res.json();
      if (res.ok) {
        fetchVehicles();
        setShowAddModal(false);
        setNewVehicle({ name: '', vehicle_number: '', email: '', phone: '' });
      } else {
        alert(data.error || "Failed to add delivery vehicle");
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setAdding(false);
    }
  };

  const handleClearUser = async (vehicle) => {
    if (!window.confirm(`Remove driver "${vehicle.name}" (${vehicle.vehicle_number})?`)) return;
    setClearing(vehicle.id);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BACKEND_URL}/admin/users/${vehicle.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setVehicles(prev => prev.filter(c => c.id !== vehicle.id));
      } else {
        alert(data.error || "Failed to remove employee");
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setClearing(null);
    }
  };

  const filtered = vehicles.filter(c =>
    (!search ||
      (c.name && c.name.toLowerCase().includes(search.toLowerCase())) ||
      (c.email && c.email.toLowerCase().includes(search.toLowerCase())) ||
      (c.phone && c.phone.includes(search)) ||
      (c.vehicle_number && c.vehicle_number.toLowerCase().includes(search.toLowerCase()))
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
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900">Delivery Vehicles</h1>
          <p className="text-gray-900/40 text-xs font-sans mt-0.5">{vehicles.length} total drivers</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-brand-blue text-white px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-brand-blue/90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
        >
          <Plus className="w-4 h-4" /> Add Driver
        </button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-900/40" />
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by driver name, vehicle number, email, or phone..."
          className="w-full pl-9 pr-4 py-3 rounded-xl bg-white border border-brand-blue/10 text-gray-900 font-sans text-sm focus:outline-none focus:border-brand-blue/30 shadow-sm" />
      </div>

      <div className="bg-white rounded-2xl border border-brand-blue/10 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm font-sans min-w-[680px]">
            <thead>
              <tr className="bg-[#FDF8F0] text-gray-900/60 text-xs uppercase tracking-wider border-b border-brand-blue/10">
                <th className="text-left py-4 px-4 sm:px-6 font-semibold">Driver & Vehicle</th>
                <th className="text-left py-4 px-4 sm:px-6 font-semibold">Email</th>
                <th className="text-left py-4 px-4 sm:px-6 font-semibold">Phone</th>
                <th className="text-left py-4 px-4 sm:px-6 font-semibold">Joined</th>
                <th className="py-4 px-4 sm:px-6 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#08183A]/5">
              {filtered.map((vehicle, i) => (
                <motion.tr key={vehicle.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }} className="hover:bg-[#FDF8F0]/50 transition-colors">

                  {/* Driver & Vehicle */}
                  <td className="py-4 px-4 sm:px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#0033a0] text-white flex items-center justify-center font-bold shrink-0">
                        {(vehicle.name || "D")[0].toUpperCase()}
                      </div>
                      <div>
                        <span className="font-semibold text-gray-900 block">{vehicle.name || "Unknown"}</span>
                        {vehicle.vehicle_number && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-brand-blue bg-brand-blue/5 px-2 py-0.5 rounded-md mt-0.5">
                            <Truck className="w-3 h-3" /> {vehicle.vehicle_number}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Email */}
                  <td className="py-4 px-4 sm:px-6">
                    <div className="flex items-center gap-1.5 text-xs text-gray-900/70">
                      <Mail className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate max-w-[160px]">{vehicle.email}</span>
                    </div>
                  </td>

                  {/* Phone */}
                  <td className="py-4 px-4 sm:px-6">
                    {vehicle.phone ? (
                      <div className="flex items-center gap-1.5 text-xs text-gray-900/70">
                        <Phone className="w-3.5 h-3.5 shrink-0" />
                        <span>{vehicle.phone}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-900/30">—</span>
                    )}
                  </td>

                  {/* Joined */}
                  <td className="py-4 px-4 sm:px-6 text-xs text-gray-900/60">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {vehicle.created_at ? new Date(vehicle.created_at).toLocaleDateString("en-IN") : "—"}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-4 sm:px-6 text-right">
                    <button
                      onClick={() => handleClearUser(vehicle)}
                      disabled={clearing === vehicle.id}
                      title="Remove driver"
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
                    No delivery vehicles found
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
              <h2 className="font-serif font-bold text-xl text-gray-900">Add Delivery Vehicle</h2>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddVehicle} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider mb-2">Driver Name *</label>
                <input required type="text" value={newVehicle.name} onChange={e => setNewVehicle({...newVehicle, name: e.target.value})} className="w-full px-4 py-3 bg-[#FDF8F0] border border-brand-blue/10 rounded-xl text-sm focus:outline-none focus:border-[#F29D38]" placeholder="John Doe" />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider mb-2">Vehicle Number *</label>
                <input required type="text" value={newVehicle.vehicle_number} onChange={e => setNewVehicle({...newVehicle, vehicle_number: e.target.value})} className="w-full px-4 py-3 bg-[#FDF8F0] border border-brand-blue/10 rounded-xl text-sm focus:outline-none focus:border-[#F29D38]" placeholder="TS 07 EZ 1234" />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider mb-2">Email Address *</label>
                <input required type="email" value={newVehicle.email} onChange={e => setNewVehicle({...newVehicle, email: e.target.value})} className="w-full px-4 py-3 bg-[#FDF8F0] border border-brand-blue/10 rounded-xl text-sm focus:outline-none focus:border-[#F29D38]" placeholder="john@example.com" />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider mb-2">Phone Number *</label>
                <input required type="text" value={newVehicle.phone} onChange={e => setNewVehicle({...newVehicle, phone: e.target.value})} className="w-full px-4 py-3 bg-[#FDF8F0] border border-brand-blue/10 rounded-xl text-sm focus:outline-none focus:border-[#F29D38]" placeholder="+91 9876543210" />
              </div>

              <div className="pt-2">
                <button type="submit" disabled={adding} className="w-full bg-[#0033a0] text-white font-bold py-3 rounded-xl hover:bg-[#002277] transition-all disabled:opacity-50">
                  {adding ? 'Adding...' : 'Add Vehicle'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
