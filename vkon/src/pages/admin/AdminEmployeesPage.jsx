import React, { useEffect, useState } from "react";
import { Users, Mail, Phone, Calendar, Search, Trash2, CheckCircle, XCircle, Plus, X } from "lucide-react";
import { motion } from "framer-motion";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api";

export function AdminEmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [clearing, setClearing] = useState(null);

  // Add Employee Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEmployee, setNewEmployee] = useState({ name: '', email: '', phone: '', password: '' });
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch(`${BACKEND_URL}/admin/users`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => { if (d.users) setEmployees(d.users); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    setAdding(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BACKEND_URL}/admin/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...newEmployee, role: 'user' }) 
      });
      const data = await res.json();
      if (res.ok) {
        setEmployees([data.user, ...employees]);
        setShowAddModal(false);
        setNewEmployee({ name: '', email: '', phone: '', password: '' });
      } else {
        alert(data.error || "Failed to add employee");
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setAdding(false);
    }
  };

  const handleClearUser = async (employee) => {
    if (!window.confirm(`Remove employee "${employee.name}" (${employee.email})?`)) return;
    setClearing(employee.id);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BACKEND_URL}/admin/users/${employee.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setEmployees(prev => prev.filter(c => c.id !== employee.id));
      } else {
        alert(data.error || "Failed to remove employee");
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setClearing(null);
    }
  };

  const filtered = employees.filter(c =>
    (!search ||
      (c.name && c.name.toLowerCase().includes(search.toLowerCase())) ||
      (c.email && c.email.toLowerCase().includes(search.toLowerCase())) ||
      (c.phone && c.phone.includes(search))
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
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900">Employees</h1>
          <p className="text-gray-900/40 text-xs font-sans mt-0.5">{employees.length} total employees</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 bg-[#0033a0] text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:bg-[#002277] transition-all"
        >
          <Plus className="w-4 h-4" /> Add Employee
        </button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-900/40" />
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email, or phone..."
          className="w-full pl-9 pr-4 py-3 rounded-xl bg-white border border-brand-blue/10 text-gray-900 font-sans text-sm focus:outline-none focus:border-brand-blue/30 shadow-sm" />
      </div>

      <div className="bg-white rounded-2xl border border-brand-blue/10 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm font-sans min-w-[680px]">
            <thead>
              <tr className="bg-[#FDF8F0] text-gray-900/60 text-xs uppercase tracking-wider border-b border-brand-blue/10">
                <th className="text-left py-4 px-4 sm:px-6 font-semibold">Name</th>
                <th className="text-left py-4 px-4 sm:px-6 font-semibold">Email</th>
                <th className="text-left py-4 px-4 sm:px-6 font-semibold">Phone</th>
                <th className="text-left py-4 px-4 sm:px-6 font-semibold">Role</th>
                <th className="text-left py-4 px-4 sm:px-6 font-semibold">Joined</th>
                <th className="py-4 px-4 sm:px-6 font-semibold"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#08183A]/5">
              {filtered.map((employee, i) => (
                <motion.tr key={employee.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }} className="hover:bg-[#FDF8F0]/50 transition-colors">

                  {/* Name */}
                  <td className="py-4 px-4 sm:px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#0033a0] text-white flex items-center justify-center font-bold shrink-0">
                        {(employee.name || "E")[0].toUpperCase()}
                      </div>
                      <span className="font-semibold text-gray-900">{employee.name || "Unknown"}</span>
                    </div>
                  </td>

                  {/* Email */}
                  <td className="py-4 px-4 sm:px-6">
                    <div className="flex items-center gap-1.5 text-xs text-gray-900/70 mb-1">
                      <Mail className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate max-w-[160px]">{employee.email}</span>
                    </div>
                  </td>

                  {/* Phone */}
                  <td className="py-4 px-4 sm:px-6">
                    {employee.phone ? (
                      <div className="flex items-center gap-1.5 text-xs text-gray-900/70 mb-1">
                        <Phone className="w-3.5 h-3.5 shrink-0" />
                        <span>{employee.phone}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-900/30">—</span>
                    )}
                  </td>

                  {/* Role */}
                  <td className="py-4 px-4 sm:px-6">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      employee.role === "admin" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
                    }`}>
                      {employee.role || "user"}
                    </span>
                  </td>

                  {/* Joined */}
                  <td className="py-4 px-4 sm:px-6 text-xs text-gray-900/60">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(employee.created_at).toLocaleDateString("en-IN")}
                    </div>
                  </td>

                  {/* Clear action */}
                  <td className="py-4 px-4 sm:px-6">
                    {employee.role !== "admin" && (
                      <button
                        onClick={() => handleClearUser(employee)}
                        disabled={clearing === employee.id}
                        title="Remove employee"
                        className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </motion.tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-900/50">
                    No employees found
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
              <h2 className="font-serif font-bold text-xl text-gray-900">Add New Employee</h2>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddEmployee} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider mb-2">Full Name</label>
                <input required type="text" value={newEmployee.name} onChange={e => setNewEmployee({...newEmployee, name: e.target.value})} className="w-full px-4 py-3 bg-[#FDF8F0] border border-brand-blue/10 rounded-xl text-sm focus:outline-none focus:border-[#F29D38]" placeholder="John Doe" />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider mb-2">Email Address</label>
                <input required type="email" value={newEmployee.email} onChange={e => setNewEmployee({...newEmployee, email: e.target.value})} className="w-full px-4 py-3 bg-[#FDF8F0] border border-brand-blue/10 rounded-xl text-sm focus:outline-none focus:border-[#F29D38]" placeholder="john@example.com" />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider mb-2">Phone Number</label>
                <input type="text" value={newEmployee.phone} onChange={e => setNewEmployee({...newEmployee, phone: e.target.value})} className="w-full px-4 py-3 bg-[#FDF8F0] border border-brand-blue/10 rounded-xl text-sm focus:outline-none focus:border-[#F29D38]" placeholder="+91 9876543210" />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider mb-2">Password</label>
                <input required type="password" value={newEmployee.password} onChange={e => setNewEmployee({...newEmployee, password: e.target.value})} className="w-full px-4 py-3 bg-[#FDF8F0] border border-brand-blue/10 rounded-xl text-sm focus:outline-none focus:border-[#F29D38]" placeholder="••••••••" />
              </div>

              <div className="pt-2">
                <button type="submit" disabled={adding} className="w-full bg-[#0033a0] text-white font-bold py-3 rounded-xl hover:bg-[#002277] transition-all disabled:opacity-50">
                  {adding ? 'Adding...' : 'Add Employee'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
