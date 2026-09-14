import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Store, Plus, ArrowRight, Search } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import brandLogo from '../assets/logo.png';

export function SelectStorePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';
  
  const { stores, fetchStores, setSelectedStore, createStore, user } = useAuthStore();
  const [isCreating, setIsCreating] = useState(false);
  const [newStore, setNewStore] = useState({ name: '', owner_name: '', email: '', phone: '', address: '' });
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  const handleSelect = (store) => {
    setSelectedStore(store);
    navigate(redirect);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newStore.name.trim()) return;
    const store = await createStore(newStore);
    if (store) {
      handleSelect(store);
    }
  };

  const filteredStores = stores.filter(store => 
    store.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (store.phone && store.phone.includes(searchQuery))
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-xl w-full max-w-md p-8 border border-gray-100"
      >
        <div className="flex flex-col items-center mb-6">
          <img src={brandLogo} alt="VConnect" className="h-14 mb-2 drop-shadow-md" />
          <h1 className="text-2xl font-bold text-gray-900">Welcome, {user?.name || 'Employee'}</h1>
          <p className="text-sm text-gray-500 text-center mt-1">Please select the store you are working at today, or create a new one.</p>
        </div>

        {!isCreating ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Available Stores</h2>
            </div>
            
            <div className="relative mb-4">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search stores by name or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue"
              />
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
              {filteredStores.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">No stores found.</p>
              ) : (
                filteredStores.map((store) => (
                  <button
                    key={store.id}
                    onClick={() => handleSelect(store)}
                    className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:border-brand-blue hover:bg-brand-blue/5 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-brand-blue/10 flex items-center justify-center">
                        <Store className="w-5 h-5 text-brand-blue" />
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-gray-900">{store.name}</p>
                        <p className="text-xs text-gray-500">{store.address || 'No address specified'}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-brand-blue transition-colors" />
                  </button>
                ))
              )}
            </div>

            <div className="pt-4 mt-4 border-t border-gray-100">
              <button
                onClick={() => setIsCreating(true)}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl border-2 border-dashed border-gray-300 text-gray-600 hover:border-brand-blue hover:text-brand-blue hover:bg-brand-blue/5 transition-all font-semibold"
              >
                <Plus className="w-5 h-5" />
                Create New Store
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleCreate} className="space-y-4">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Create New Store</h2>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Store Name *</label>
              <input
                type="text"
                required
                value={newStore.name}
                onChange={(e) => setNewStore({...newStore, name: e.target.value})}
                placeholder="e.g. Downtown Branch"
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Owner / Contact Name</label>
              <input
                type="text"
                value={newStore.owner_name}
                onChange={(e) => setNewStore({...newStore, owner_name: e.target.value})}
                placeholder="e.g. John Doe"
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={newStore.email}
                  onChange={(e) => setNewStore({...newStore, email: e.target.value})}
                  placeholder="store@example.com"
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Phone</label>
                <input
                  type="text"
                  value={newStore.phone}
                  onChange={(e) => setNewStore({...newStore, phone: e.target.value})}
                  placeholder="+91 9876543210"
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Address (Optional)</label>
              <textarea
                value={newStore.address}
                onChange={(e) => setNewStore({...newStore, address: e.target.value})}
                placeholder="123 Main St..."
                rows={2}
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10 resize-none"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="flex-1 py-3.5 rounded-xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-brand-blue to-green-700 text-white font-bold hover:shadow-lg transition-all"
              >
                Create & Select
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}
