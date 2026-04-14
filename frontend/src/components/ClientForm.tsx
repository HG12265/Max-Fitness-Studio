import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, RotateCcw, ArrowLeft, Loader2, User, MapPin, CreditCard, HeartPulse, PhoneCall } from 'lucide-react';
import { format, addMonths, differenceInYears, parseISO } from 'date-fns';
import { cn } from '../lib/utils';

interface ClientFormProps {
  isClientSelfJoin?: boolean;
}

export default function ClientForm({ isClientSelfJoin = false }: ClientFormProps) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(!!id);
  const [error, setError] = useState<string | null>(null);
  const [trainers, setTrainers] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    gender: 'Male',
    dob: '',
    age: 0,
    phone: '',
    email: '',
    address: '',
    city: '',
    pincode: '',
    plan: '',
    start_date: format(new Date(), 'yyyy-MM-dd'),
    end_date: '',
    fee: 0,
    payment_status: 'Pending',
    height: 0,
    weight: 0,
    medical_condition: '',
    emergency_contact: '',
    emergency_phone: '',
    trainer: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const trainersData = await api.getTrainers();
        setTrainers(trainersData);

        if (id) {
          const clientData = await api.getClient(id);
          setFormData(clientData);
        } else if (isClientSelfJoin) {
          // Pre-fill email for self-join
          const userData = await api.getMe();
          if (userData && userData.email) {
            setFormData(prev => ({ 
              ...prev, 
              email: userData.email,
              name: userData.name || prev.name 
            }));
          }
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        if (id) setError('Client not found');
      } finally {
        setInitialLoading(false);
      }
    };
    fetchData();
  }, [id, isClientSelfJoin]);

  // Auto-calculate age
  useEffect(() => {
    if (formData.dob) {
      const age = differenceInYears(new Date(), parseISO(formData.dob));
      setFormData(prev => ({ ...prev, age }));
    }
  }, [formData.dob]);

  // Auto-calculate end date and fee based on plan and start date
  useEffect(() => {
    if (formData.start_date && formData.plan) {
      let monthsToAdd = 1;
      let fee = 1000; // Default Monthly
      
      if (formData.plan === 'Quarterly') {
        monthsToAdd = 3;
        fee = 2500;
      } else if (formData.plan === 'Half-Yearly') {
        monthsToAdd = 6;
        fee = 4500;
      } else if (formData.plan === 'Yearly') {
        monthsToAdd = 12;
        fee = 8000;
      }

      const endDate = format(addMonths(parseISO(formData.start_date), monthsToAdd), 'yyyy-MM-dd');
      setFormData(prev => ({ ...prev, end_date: endDate, fee }));
    }
  }, [formData.start_date, formData.plan]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (id) {
        await api.updateClient(id, formData);
      } else {
        await api.createClient(formData);
        window.dispatchEvent(new Event('client-updated'));
      }
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Error saving client:', err);
      setError(err.message || 'Failed to save client.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (window.confirm('Are you sure you want to reset the form?')) {
      const resetData = {
        name: '',
        gender: 'Male',
        dob: '',
        age: 0,
        phone: '',
        email: '',
        address: '',
        city: '',
        pincode: '',
        plan: '',
        start_date: format(new Date(), 'yyyy-MM-dd'),
        end_date: '',
        fee: 0,
        payment_status: 'Pending',
        height: 0,
        weight: 0,
        medical_condition: '',
        emergency_contact: '',
        emergency_phone: '',
        trainer: ''
      };

      if (isClientSelfJoin) {
        try {
          const userData = await api.getMe();
          if (userData) {
            resetData.email = userData.email || '';
            resetData.name = userData.name || '';
          }
        } catch (err) {
          console.error('Error re-fetching user data for reset:', err);
        }
      }
      
      setFormData(resetData);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-12 h-12 text-red-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-zinc-900 rounded-lg text-zinc-400 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h2 className="text-3xl font-bold text-white">{id ? 'Edit Client' : 'New Registration'}</h2>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Personal Details */}
        <section className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <User className="w-5 h-5 text-red-500" />
            <h3 className="text-xl font-semibold text-white">Personal Details</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400">Full Name *</label>
              <input
                required
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all"
                placeholder="John Doe"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400">Gender *</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:border-red-500 outline-none transition-all"
              >
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400">Date of Birth *</label>
              <input
                required
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:border-red-500 outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400">Age</label>
              <input
                readOnly
                type="number"
                value={formData.age}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-500 outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400">Phone Number *</label>
              <input
                required
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:border-red-500 outline-none transition-all"
                placeholder="+1 234 567 890"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400">Email {isClientSelfJoin ? '(Read-only)' : '(Optional)'}</label>
              <input
                type="email"
                name="email"
                readOnly={isClientSelfJoin}
                value={formData.email}
                onChange={handleChange}
                className={cn(
                  "w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:border-red-500 outline-none transition-all",
                  isClientSelfJoin && "bg-zinc-900 text-zinc-500 cursor-not-allowed"
                )}
                placeholder="john@example.com"
              />
            </div>
          </div>
        </section>

        {/* Address Details */}
        <section className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <MapPin className="w-5 h-5 text-red-500" />
            <h3 className="text-xl font-semibold text-white">Address Details</h3>
          </div>
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400">Address</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows={3}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:border-red-500 outline-none transition-all resize-none"
                placeholder="Street address, Apartment, Suite..."
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400">City</label>
                <input
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:border-red-500 outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400">Pincode</label>
                <input
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:border-red-500 outline-none transition-all"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Membership Details */}
        <section className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <CreditCard className="w-5 h-5 text-red-500" />
            <h3 className="text-xl font-semibold text-white">Membership Details</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400">Membership Plan *</label>
              <select
                required
                name="plan"
                value={formData.plan}
                onChange={handleChange}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:border-red-500 outline-none transition-all"
              >
                <option value="">Select plan</option>
                <option value="Monthly">Monthly</option>
                <option value="Quarterly">Quarterly</option>
                <option value="Half-Yearly">Half-Yearly</option>
                <option value="Yearly">Yearly</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400">Payment Status {isClientSelfJoin && '(Pending)'}</label>
              <select
                name="payment_status"
                disabled={isClientSelfJoin}
                value={formData.payment_status}
                onChange={handleChange}
                className={cn(
                  "w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:border-red-500 outline-none transition-all",
                  isClientSelfJoin && "bg-zinc-900 text-zinc-500 cursor-not-allowed"
                )}
              >
                <option>Pending</option>
                <option>Paid</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400">Start Date *</label>
              <input
                required
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:border-red-500 outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400">End Date</label>
              <input
                readOnly
                type="date"
                value={formData.end_date}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-500 outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400">Fee Amount *</label>
              <input
                required
                type="number"
                name="fee"
                readOnly={isClientSelfJoin}
                value={formData.fee}
                onChange={handleChange}
                className={cn(
                  "w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:border-red-500 outline-none transition-all",
                  isClientSelfJoin && "bg-zinc-900 text-zinc-500 cursor-not-allowed"
                )}
              />
            </div>
          </div>
        </section>

        {/* Health Details */}
        <section className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <HeartPulse className="w-5 h-5 text-red-500" />
            <h3 className="text-xl font-semibold text-white">Health Details</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400">Height (cm)</label>
              <input
                type="number"
                name="height"
                value={formData.height}
                onChange={handleChange}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:border-red-500 outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400">Weight (kg)</label>
              <input
                type="number"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:border-red-500 outline-none transition-all"
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-medium text-zinc-400">Medical Conditions (Optional)</label>
              <textarea
                name="medical_condition"
                value={formData.medical_condition}
                onChange={handleChange}
                rows={2}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:border-red-500 outline-none transition-all resize-none"
              />
            </div>
          </div>
        </section>

        {/* Emergency Contact */}
        <section className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <PhoneCall className="w-5 h-5 text-red-500" />
            <h3 className="text-xl font-semibold text-white">Emergency Contact</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400">Contact Name</label>
              <input
                name="emergency_contact"
                value={formData.emergency_contact}
                onChange={handleChange}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:border-red-500 outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400">Contact Phone</label>
              <input
                name="emergency_phone"
                value={formData.emergency_phone}
                onChange={handleChange}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:border-red-500 outline-none transition-all"
              />
            </div>
          </div>
        </section>

        <div className="flex items-center justify-end gap-4 pt-6">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-2 px-6 py-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-xl transition-all"
          >
            <RotateCcw className="w-5 h-5" />
            Reset
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-10 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-red-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            {id ? 'Update Client' : 'Register Client'}
          </button>
        </div>
      </form>
    </div>
  );
}
