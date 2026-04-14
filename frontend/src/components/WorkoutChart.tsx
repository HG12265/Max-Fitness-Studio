import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { ArrowLeft, Loader2, Dumbbell, CheckCircle2, Clock } from 'lucide-react';
import { cn } from '../lib/utils';

const planOptions = ['Monthly', 'Quarterly', 'Half-Yearly', 'Yearly'] as const;
const periodOptions: Record<typeof planOptions[number], string[]> = {
  Monthly: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
  Quarterly: ['Month 1', 'Month 2', 'Month 3'],
  'Half-Yearly': ['Month 1', 'Month 2', 'Month 3', 'Month 4', 'Month 5', 'Month 6'],
  Yearly: [
    'Month 1', 'Month 2', 'Month 3', 'Month 4', 'Month 5', 'Month 6',
    'Month 7', 'Month 8', 'Month 9', 'Month 10', 'Month 11', 'Month 12'
  ]
};

export default function WorkoutChart() {
  const [clientData, setClientData] = useState<any | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('');
  const [chartResponse, setChartResponse] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClient = async () => {
      try {
        const clients = await api.getClients();
        if (clients && clients.length > 0) {
          setClientData(clients[0]);
        }
      } catch (err) {
        console.error('Failed to load client data:', err);
      }
    };

    fetchClient();
  }, []);

  useEffect(() => {
    if (clientData) {
      const membershipPlan = planOptions.includes(clientData.plan) ? clientData.plan : '';
      setSelectedPlan(membershipPlan);
      setSelectedPeriod(membershipPlan ? periodOptions[membershipPlan][0] : '');
      setChartResponse(null);
      setError('');
    }
  }, [clientData]);

  const handlePeriodClick = async (period: string) => {
    if (!clientData || !selectedPlan) return;
    setSelectedPeriod(period);
    setError('');
    setLoading(true);

    try {
      const result = await api.getWorkoutChart(clientData._id, selectedPlan, period);
      if (!result || typeof result.content !== 'string') {
        throw new Error('Invalid workout chart response received.');
      }
      setChartResponse(result);
    } catch (err: any) {
      setError(err?.message || 'Unable to create workout chart.');
    } finally {
      setLoading(false);
    }
  };

  const currentPeriods = selectedPlan ? periodOptions[selectedPlan as typeof planOptions[number]] : [];
  const planTitle = clientData?.plan ? `${clientData.plan} Membership` : 'Membership Plan';

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-red-500">Workout Chart</p>
          <h1 className="text-4xl font-bold text-white">Personalized Training Timeline</h1>
          <p className="mt-3 text-zinc-400 max-w-2xl">
            Your workout chart follows the membership plan selected during registration. Select a period to generate or load your saved workout routine.
          </p>
        </div>

        <button
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center gap-2 rounded-2xl bg-zinc-900/80 px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section className="space-y-6 rounded-3xl border border-zinc-800 bg-zinc-950/80 p-8 shadow-xl shadow-black/10">
          <div className="flex items-center gap-3 text-white">
            <Dumbbell className="w-5 h-5 text-red-500" />
            <div>
              <h2 className="text-2xl font-semibold">Current Plan</h2>
              <p className="text-sm text-zinc-400">{clientData ? planTitle : 'Loading membership details...'}</p>
            </div>
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-6">
            <div className="flex items-center justify-between gap-4 mb-5">
              <div>
                <h3 className="text-lg font-semibold text-white">Workout plan</h3>
                <p className="text-sm text-zinc-400">Your workout chart is tied to the membership plan selected during registration.</p>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full bg-zinc-800 px-3 py-2 text-sm text-emerald-400">
                {selectedPlan ? `${selectedPlan} only` : 'No plan set'}
              </span>
            </div>

            {selectedPlan ? (
              <p className="text-sm text-zinc-400">This chart follows the {selectedPlan.toLowerCase()} schedule and cannot be changed from this page.</p>
            ) : (
              <p className="text-sm text-red-400">No membership plan found. Please complete your registration with a plan to access workout charts.</p>
            )}
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-6">
            <div className="flex items-center justify-between gap-4 mb-5">
              <div>
                <h3 className="text-lg font-semibold text-white">{selectedPlan || 'Plan not selected'} timeline</h3>
                <p className="text-sm text-zinc-400">Tap a period to generate or view the workout chart.</p>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full bg-zinc-800 px-3 py-2 text-sm text-emerald-400">
                <CheckCircle2 className="w-4 h-4" /> Cached on demand
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {currentPeriods.map((period) => (
                <button
                  key={period}
                  onClick={() => handlePeriodClick(period)}
                  className={cn(
                    'rounded-2xl border px-4 py-3 text-left transition',
                    selectedPeriod === period
                      ? 'border-red-500 bg-red-600/10 text-white'
                      : 'border-zinc-800 bg-zinc-950 text-zinc-300 hover:border-red-500 hover:bg-zinc-900'
                  )}
                >
                  <p className="font-semibold">{period}</p>
                  <p className="text-xs text-zinc-500 mt-1">{selectedPlan === 'Monthly' ? 'Training week' : 'Training month'}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-6">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <p className="text-sm text-zinc-400">Membership dates</p>
                <p className="text-base font-semibold text-white">{clientData?.start_date} → {clientData?.end_date || 'TBD'}</p>
              </div>
              <span className="rounded-full bg-zinc-800 px-3 py-2 text-xs text-zinc-400">{clientData?.payment_status || 'Pending'}</span>
            </div>
            <p className="text-sm text-zinc-400">Selected plan: <span className="text-white">{selectedPlan}</span></p>
          </div>
        </section>

        <section className="rounded-3xl border border-zinc-800 bg-zinc-950/90 p-8 shadow-xl shadow-black/10">
          <div className="flex items-center justify-between gap-3 pb-6 border-b border-zinc-800">
            <div>
              <p className="text-sm text-zinc-400">Workout chart details</p>
              <h2 className="text-2xl font-semibold text-white">{selectedPeriod}</h2>
            </div>
            {chartResponse?.cached ? (
              <span className="rounded-full bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">Loaded from cache</span>
            ) : chartResponse ? (
              <span className="rounded-full bg-blue-500/10 px-3 py-2 text-sm text-blue-300">New generation</span>
            ) : null}
          </div>

          <div className="mt-6 min-h-[260px] rounded-3xl border border-zinc-800 bg-zinc-900/70 p-6">
            {loading ? (
              <div className="flex min-h-[200px] items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-red-500" />
              </div>
            ) : error ? (
              <div className="space-y-3 text-zinc-300">
                <p className="text-sm text-red-400">{error}</p>
                {chartResponse?.content ? (
                  <div className="space-y-4 pt-4 text-zinc-300">
                    <p className="text-sm text-zinc-400">Showing the last valid workout chart while the new request failed.</p>
                    {(chartResponse.content || '').split('\n').map((line: string, index: number) => (
                      <p key={index} className={line.startsWith('-') ? 'text-sm leading-7 text-zinc-300' : 'text-base text-white'}>
                        {line}
                      </p>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-zinc-500">Try clicking the period again or refresh the page.</p>
                )}
              </div>
            ) : chartResponse ? (
              <div className="space-y-4 text-zinc-300">
                {(chartResponse.content || '').split('\n').map((line: string, index: number) => (
                  <p key={index} className={line.startsWith('-') ? 'text-sm leading-7 text-zinc-300' : 'text-base text-white'}>
                    {line}
                  </p>
                ))}
              </div>
            ) : (
              <div className="text-zinc-400">Select a week or month to generate your first workout chart for this plan.</div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
