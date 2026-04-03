import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Dumbbell, Plus, Trash2, Loader2, User, Phone, Award, Edit2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function TrainerManagement() {
  const [trainers, setTrainers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newTrainer, setNewTrainer] = useState({
    name: '',
    specialization: '',
    phone: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchTrainers = async () => {
    try {
      const data = await api.getTrainers();
      setTrainers(data);
    } catch (err) {
      console.error('Error fetching trainers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTrainer.name) return;

    setSubmitting(true);
    try {
      if (editingId) {
        await api.updateTrainer(editingId, newTrainer);
        setEditingId(null);
      } else {
        await api.createTrainer(newTrainer);
      }
      setNewTrainer({ name: '', specialization: '', phone: '' });
      setIsAdding(false);
      fetchTrainers();
    } catch (error) {
      console.error('Error saving trainer:', error);
      alert('Failed to save trainer.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditClick = (trainer: any) => {
    setNewTrainer({
      name: trainer.name,
      specialization: trainer.specialization || '',
      phone: trainer.phone || ''
    });
    setEditingId(trainer._id);
    setIsAdding(true);
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setNewTrainer({ name: '', specialization: '', phone: '' });
  };

  const handleDeleteTrainer = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove trainer "${name}"?`)) {
      try {
        await api.deleteTrainer(id);
        fetchTrainers();
      } catch (error) {
        console.error('Error deleting trainer:', error);
        alert('Failed to delete trainer.');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-12 h-12 text-red-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">Trainer Management</h2>
          <p className="text-zinc-400">Manage your gym's expert training staff</p>
        </div>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-red-600/20"
          >
            <Plus className="w-5 h-5" />
            Add Trainer
          </button>
        )}
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 backdrop-blur-sm"
          >
            <h3 className="text-lg font-bold text-white mb-4">{editingId ? 'Edit Trainer' : 'Add New Trainer'}</h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Trainer Name *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                  <input
                    required
                    type="text"
                    value={newTrainer.name}
                    onChange={(e) => setNewTrainer({ ...newTrainer, name: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-white focus:border-red-500 outline-none transition-all"
                    placeholder="Full Name"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Specialization</label>
                <div className="relative">
                  <Award className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                  <input
                    type="text"
                    value={newTrainer.specialization}
                    onChange={(e) => setNewTrainer({ ...newTrainer, specialization: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-white focus:border-red-500 outline-none transition-all"
                    placeholder="e.g. Bodybuilding, Yoga"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                  <input
                    type="text"
                    value={newTrainer.phone}
                    onChange={(e) => setNewTrainer({ ...newTrainer, phone: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-white focus:border-red-500 outline-none transition-all"
                    placeholder="+1 234 567 890"
                  />
                </div>
              </div>
              <div className="md:col-span-3 flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-2 text-zinc-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-8 py-2 bg-zinc-100 hover:bg-white text-black font-bold rounded-xl transition-all disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (editingId ? 'Update Trainer' : 'Save Trainer')}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {trainers.map((trainer, idx) => (
          <motion.div
            key={trainer._id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-6 flex items-center justify-between group hover:border-red-900/30 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-red-600/10 flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
                <Dumbbell className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">{trainer.name}</h3>
                <div className="flex flex-col gap-1 mt-1">
                  {trainer.specialization && (
                    <span className="text-zinc-400 text-sm flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-zinc-600" />
                      {trainer.specialization}
                    </span>
                  )}
                  {trainer.phone && (
                    <span className="text-zinc-500 text-xs flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-zinc-700" />
                      {trainer.phone}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 transition-all">
              <button
                onClick={() => handleEditClick(trainer)}
                className="p-3 text-zinc-600 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                title="Edit Trainer"
              >
                <Edit2 className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleDeleteTrainer(trainer._id, trainer.name)}
                className="p-3 text-zinc-600 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                title="Remove Trainer"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        ))}
        {trainers.length === 0 && !isAdding && (
          <div className="md:col-span-2 py-20 text-center bg-zinc-900/20 border border-dashed border-zinc-800 rounded-3xl">
            <Dumbbell className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
            <p className="text-zinc-500">No trainers registered yet. Add your first trainer to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}
