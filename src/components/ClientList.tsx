import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Search, Edit2, Trash2, User, Phone, Calendar, ChevronRight, X, Download, Loader2, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format, isAfter, parseISO } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export default function ClientList() {
  const [clients, setClients] = useState<any[]>([]);
  const [trainers, setTrainers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<any | null>(null);
  const [updatingTrainer, setUpdatingTrainer] = useState(false);
  const [tempTrainer, setTempTrainer] = useState('');
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const [clientsData, trainersData] = await Promise.all([
        api.getClients(),
        api.getTrainers()
      ]);
      setClients(clientsData);
      setTrainers(trainersData);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedClient) {
      setTempTrainer(selectedClient.trainer || '');
    }
  }, [selectedClient]);

  const handleUpdateTrainer = async () => {
    if (!selectedClient) return;
    setUpdatingTrainer(true);
    try {
      const updatedClient = await api.updateClient(selectedClient._id, {
        trainer: tempTrainer
      });
      setSelectedClient(updatedClient);
      setClients(clients.map(c => c._id === updatedClient._id ? updatedClient : c));
      alert('Trainer assigned successfully!');
    } catch (error) {
      console.error('Error updating trainer:', error);
      alert('Failed to update trainer.');
    } finally {
      setUpdatingTrainer(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete client "${name}"?`)) {
      try {
        await api.deleteClient(id);
        setClients(clients.filter(c => c._id !== id));
      } catch (error) {
        console.error('Error deleting client:', error);
        alert('Failed to delete client.');
      }
    }
  };

  const filteredClients = clients.filter(client => 
    client.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone?.includes(searchTerm)
  );

  const isMembershipActive = (endDate: string) => {
    if (!endDate) return false;
    return isAfter(parseISO(endDate), new Date());
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Phone', 'Email', 'Plan', 'Start Date', 'End Date', 'Fee', 'Payment Status', 'Trainer'];
    const rows = filteredClients.map(c => [
      c.name, c.phone, c.email, c.plan, c.start_date, c.end_date, c.fee, c.payment_status, c.trainer || 'None'
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `max_fitness_clients_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold text-white">Client Management</h2>
          <p className="text-zinc-400">View and manage all registered gym members</p>
        </div>
        <button 
          onClick={exportToCSV}
          className="flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-lg transition-all border border-zinc-800"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
        <input
          type="text"
          placeholder="Search by name or phone number..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl pl-12 pr-4 py-4 text-white focus:border-red-500 outline-none transition-all backdrop-blur-sm"
        />
      </div>

      <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-950/50 border-b border-zinc-800">
                <th className="px-6 py-4 text-sm font-semibold text-zinc-400">Client</th>
                <th className="px-6 py-4 text-sm font-semibold text-zinc-400">Membership</th>
                <th className="px-6 py-4 text-sm font-semibold text-zinc-400">Trainer</th>
                <th className="px-6 py-4 text-sm font-semibold text-zinc-400">Status</th>
                <th className="px-6 py-4 text-sm font-semibold text-zinc-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {filteredClients.map((client) => (
                <tr key={client._id} className="hover:bg-zinc-800/20 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-red-600/10 flex items-center justify-center text-red-500">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-white font-medium">{client.name}</p>
                        <p className="text-zinc-500 text-xs">{client.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-zinc-300 text-sm">{client.plan}</span>
                      <span className="text-zinc-500 text-xs">Ends: {client.end_date}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-zinc-300 text-sm font-medium">{client.trainer || 'Not Assigned'}</span>
                  </td>
                  <td className="px-6 py-4">
                    {isMembershipActive(client.end_date) ? (
                      <span className="px-2 py-1 bg-emerald-500/10 text-emerald-500 text-xs font-medium rounded-full border border-emerald-500/20">Active</span>
                    ) : (
                      <span className="px-2 py-1 bg-red-500/10 text-red-500 text-xs font-medium rounded-full border border-red-500/20">Expired</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {client.payment_status === 'Paid' ? (
                      <span className="text-emerald-500 text-sm font-medium">Paid</span>
                    ) : (
                      <span className="text-amber-500 text-sm font-medium">Pending</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => setSelectedClient(client)}
                        className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-all"
                        title="View Profile"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => navigate(`/dashboard/edit-client/${client._id}`)}
                        className="p-2 text-zinc-400 hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition-all"
                        title="Edit"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => handleDelete(client._id, client.name)}
                        className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                        title="Delete"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredClients.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                    No clients found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Client Profile Modal */}
      <AnimatePresence>
        {selectedClient && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedClient(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-zinc-900 border border-zinc-800 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl"
              >
                <div className="relative h-32 bg-gradient-to-r from-red-600 to-red-900">
                  <button 
                    onClick={() => setSelectedClient(null)}
                    className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <div className="absolute -bottom-12 left-8">
                    <div className="w-24 h-24 rounded-2xl bg-zinc-900 border-4 border-zinc-900 shadow-xl flex items-center justify-center text-red-500">
                      <User className="w-12 h-12" />
                    </div>
                  </div>
                </div>

                <div className="pt-16 px-8 pb-8">
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <h3 className="text-2xl font-bold text-white">{selectedClient.name}</h3>
                      <p className="text-zinc-400">{selectedClient.gender}, {selectedClient.age} years old</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-zinc-500">Member Since</p>
                      <p className="text-white font-medium">{selectedClient.start_date}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">Contact Info</h4>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3 text-zinc-300">
                            <Phone className="w-4 h-4 text-red-500" />
                            <span>{selectedClient.phone}</span>
                          </div>
                          {selectedClient.email && (
                            <div className="flex items-center gap-3 text-zinc-300">
                              <Calendar className="w-4 h-4 text-red-500" />
                              <span>{selectedClient.email}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">Membership</h4>
                        <div className="p-4 bg-zinc-800/50 rounded-xl border border-zinc-700/50">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-zinc-400 text-sm">Plan</span>
                            <span className="text-white font-semibold">{selectedClient.plan}</span>
                          </div>
                          <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-zinc-700/50">
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Assign Trainer</label>
                            <div className="flex gap-2">
                              <select
                                value={tempTrainer}
                                onChange={(e) => setTempTrainer(e.target.value)}
                                className="flex-1 bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-red-500 transition-all"
                              >
                                <option value="">No Trainer</option>
                                {trainers.map(t => (
                                  <option key={t._id} value={t.name}>{t.name}</option>
                                ))}
                              </select>
                              <button
                                onClick={handleUpdateTrainer}
                                disabled={updatingTrainer || tempTrainer === (selectedClient.trainer || '')}
                                className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all disabled:opacity-50 disabled:bg-zinc-800"
                              >
                                {updatingTrainer ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>
                          <div className="flex items-center justify-between mt-4">
                            <span className="text-zinc-400 text-sm">Status</span>
                            <span className={cn(
                              "text-sm font-bold",
                              isMembershipActive(selectedClient.end_date) ? "text-emerald-500" : "text-red-500"
                            )}>
                              {isMembershipActive(selectedClient.end_date) ? 'ACTIVE' : 'EXPIRED'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">Health Metrics</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-3 bg-zinc-800/30 rounded-lg text-center">
                            <p className="text-zinc-500 text-xs mb-1">Height</p>
                            <p className="text-white font-bold">{selectedClient.height} cm</p>
                          </div>
                          <div className="p-3 bg-zinc-800/30 rounded-lg text-center">
                            <p className="text-zinc-500 text-xs mb-1">Weight</p>
                            <p className="text-white font-bold">{selectedClient.weight} kg</p>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">Emergency</h4>
                        <div className="p-4 bg-red-500/5 rounded-xl border border-red-500/10">
                          <p className="text-white font-medium mb-1">{selectedClient.emergency_contact}</p>
                          <p className="text-zinc-400 text-sm">{selectedClient.emergency_phone}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
