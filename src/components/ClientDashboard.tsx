import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  User, 
  Calendar, 
  CreditCard, 
  HeartPulse, 
  PhoneCall, 
  Dumbbell,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight
} from 'lucide-react';
import { motion } from 'motion/react';
import { isAfter, parseISO, format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';

export default function ClientDashboard() {
  const [clientData, setClientData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const clients = await api.getClients();
        // The backend should ideally filter this, but for now we find the one matching the user's email
        // or the backend getClients might already be filtered if it's a client role.
        // Let's assume the backend returns the relevant client(s).
        if (clients && clients.length > 0) {
          setClientData(clients[0]);
        }
      } catch (err) {
        console.error('Error fetching client data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!clientData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-zinc-900/30 border border-zinc-800 rounded-3xl p-12 max-w-xl w-full"
        >
          <div className="inline-flex p-6 bg-red-600/10 rounded-3xl mb-8">
            <Dumbbell className="w-16 h-16 text-red-600" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Start Your Journey</h2>
          <p className="text-zinc-400 mb-10 leading-relaxed">
            You haven't joined Max Fitness Studio yet. Complete your registration to access our world-class facilities, expert trainers, and personalized health tracking.
          </p>
          <button 
            onClick={() => navigate('/dashboard/join')}
            className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-black rounded-2xl transition-all shadow-xl shadow-red-600/20 flex items-center justify-center gap-3 group"
          >
            JOIN OUR GYM
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>
      </div>
    );
  }

  const isActive = clientData.end_date ? isAfter(parseISO(clientData.end_date), new Date()) : false;

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold text-white">My Membership</h2>
          <p className="text-zinc-400">Welcome back, {clientData.name}</p>
        </div>
        <div className={cn(
          "inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-bold",
          isActive ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"
        )}>
          {isActive ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
          {isActive ? 'ACTIVE MEMBERSHIP' : 'MEMBERSHIP EXPIRED'}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-600/10 rounded-lg">
                  <CreditCard className="w-5 h-5 text-red-500" />
                </div>
                <h3 className="font-semibold text-white">Current Plan</h3>
              </div>
              <p className="text-2xl font-bold text-white mb-1">{clientData.plan}</p>
              <p className="text-zinc-500 text-sm">Started on {clientData.start_date}</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-600/10 rounded-lg">
                  <Clock className="w-5 h-5 text-red-500" />
                </div>
                <h3 className="font-semibold text-white">Valid Until</h3>
              </div>
              <p className="text-2xl font-bold text-white mb-1">{clientData.end_date}</p>
              <p className="text-zinc-500 text-sm">Renewal required soon</p>
            </motion.div>
          </div>

          <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-8">
              <HeartPulse className="w-5 h-5 text-red-500" />
              <h3 className="text-xl font-semibold text-white">Health & Fitness</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              <div className="space-y-1">
                <p className="text-zinc-500 text-xs uppercase tracking-widest">Height</p>
                <p className="text-xl font-bold text-white">{clientData.height} cm</p>
              </div>
              <div className="space-y-1">
                <p className="text-zinc-500 text-xs uppercase tracking-widest">Weight</p>
                <p className="text-xl font-bold text-white">{clientData.weight} kg</p>
              </div>
              <div className="space-y-1">
                <p className="text-zinc-500 text-xs uppercase tracking-widest">Age</p>
                <p className="text-xl font-bold text-white">{clientData.age} yrs</p>
              </div>
              <div className="space-y-1">
                <p className="text-zinc-500 text-xs uppercase tracking-widest">Trainer</p>
                <p className="text-xl font-bold text-white">{clientData.trainer || 'None'}</p>
              </div>
            </div>
            {clientData.medical_condition && (
              <div className="mt-8 p-4 bg-zinc-950 rounded-xl border border-zinc-800">
                <p className="text-zinc-500 text-xs uppercase tracking-widest mb-2">Medical Notes</p>
                <p className="text-zinc-300 text-sm">{clientData.medical_condition}</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-8">
          <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-6">Payment Status</h3>
            <div className="flex items-center justify-between p-4 bg-zinc-950 rounded-xl border border-zinc-800">
              <span className="text-zinc-400">Last Payment</span>
              <span className={cn(
                "font-bold",
                clientData.payment_status === 'Paid' ? "text-emerald-500" : "text-amber-500"
              )}>
                {clientData.payment_status}
              </span>
            </div>
            <p className="text-xs text-zinc-500 mt-4 text-center">
              Contact billing for receipt or payment issues.
            </p>
          </div>

          <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-6">Emergency Contact</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-zinc-800 rounded-lg">
                  <User className="w-4 h-4 text-zinc-400" />
                </div>
                <div>
                  <p className="text-white font-medium">{clientData.emergency_contact}</p>
                  <p className="text-zinc-500 text-xs">Primary Contact</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-zinc-800 rounded-lg">
                  <PhoneCall className="w-4 h-4 text-zinc-400" />
                </div>
                <div>
                  <p className="text-white font-medium">{clientData.emergency_phone}</p>
                  <p className="text-zinc-500 text-xs">Phone Number</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
