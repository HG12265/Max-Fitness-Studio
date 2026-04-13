import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Users, UserCheck, UserX, TrendingUp, Calendar, Dumbbell } from 'lucide-react';
import { motion } from 'motion/react';
import { isAfter, parseISO } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    expired: 0,
    pendingPayment: 0
  });
  const [trainerStats, setTrainerStats] = useState<Record<string, number>>({
    'Unassigned': 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clients, trainers] = await Promise.all([
          api.getClients(),
          api.getTrainers()
        ]);

        const now = new Date();
        const total = clients.length;
        const active = clients.filter((d: any) => d.end_date && isAfter(parseISO(d.end_date), now)).length;
        const expired = total - active;
        const pendingPayment = clients.filter((d: any) => d.payment_status === 'Pending').length;

        const trainerList = trainers.map((d: any) => d.name);
        const trainerCounts: Record<string, number> = { 'Unassigned': 0 };
        trainerList.forEach((name: string) => { trainerCounts[name] = 0; });

        clients.forEach((d: any) => {
          if (d.trainer && trainerCounts.hasOwnProperty(d.trainer)) {
            trainerCounts[d.trainer]++;
          } else {
            trainerCounts['Unassigned']++;
          }
        });

        setStats({ total, active, expired, pendingPayment });
        setTrainerStats(trainerCounts);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const statCards = [
    { label: 'Total Clients', value: stats.total, icon: Users, color: 'bg-blue-500/10 text-blue-500', border: 'border-blue-500/20' },
    { label: 'Active Members', value: stats.active, icon: UserCheck, color: 'bg-emerald-500/10 text-emerald-500', border: 'border-emerald-500/20' },
    { label: 'Expired Members', value: stats.expired, icon: UserX, color: 'bg-red-500/10 text-red-500', border: 'border-red-500/20' },
    { label: 'Pending Payments', value: stats.pendingPayment, icon: TrendingUp, color: 'bg-amber-500/10 text-amber-500', border: 'border-amber-500/20' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight text-white">Dashboard Overview</h2>
        <p className="text-zinc-400">Real-time statistics for Max Fitness Studio</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, idx) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={cn(
              "p-6 rounded-2xl bg-zinc-900/50 border backdrop-blur-sm",
              card.border
            )}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={cn("p-3 rounded-xl", card.color)}>
                <card.icon className="w-6 h-6" />
              </div>
              <span className="text-zinc-500 text-xs font-medium uppercase tracking-wider">Live</span>
            </div>
            <p className="text-zinc-400 text-sm font-medium mb-1">{card.label}</p>
            <h3 className="text-3xl font-bold text-white">{card.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-zinc-900/30 border border-zinc-800 rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <Calendar className="w-5 h-5 text-red-500" />
            <h3 className="text-xl font-semibold text-white">Quick Actions</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button 
              onClick={() => navigate('/dashboard/add-client')}
              className="p-4 bg-zinc-800/50 hover:bg-zinc-800 rounded-xl text-left transition-all group"
            >
              <p className="text-zinc-400 text-sm mb-1">New Member</p>
              <p className="text-white font-medium group-hover:text-red-500 transition-colors">Add Registration</p>
            </button>
            <button 
              onClick={() => navigate('/dashboard/clients')}
              className="p-4 bg-zinc-800/50 hover:bg-zinc-800 rounded-xl text-left transition-all group"
            >
              <p className="text-zinc-400 text-sm mb-1">Reports</p>
              <p className="text-white font-medium group-hover:text-red-500 transition-colors">View All Clients</p>
            </button>
          </div>
        </div>
        
        <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <Dumbbell className="w-5 h-5 text-red-500" />
            <h3 className="text-xl font-semibold text-white">Trainer Load</h3>
          </div>
          <div className="space-y-4">
            {Object.entries(trainerStats).map(([name, count]) => (
              <div key={name} className="flex items-center justify-between p-3 bg-zinc-950 rounded-xl border border-zinc-900">
                <span className="text-zinc-400 text-sm">{name}</span>
                <span className="text-white font-bold">{count} Clients</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

