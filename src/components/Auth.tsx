import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Dumbbell, Mail, Lock, User, Loader2, ArrowRight, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';

export default function Auth() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [isLogin, setIsLogin] = useState(searchParams.get('mode') !== 'register');
  const [isAdminMode, setIsAdminMode] = useState(searchParams.get('mode') === 'admin');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    username: '' // For admin
  });

  useEffect(() => {
    const mode = searchParams.get('mode');
    if (mode === 'register') {
      setIsLogin(false);
      setIsAdminMode(false);
    } else if (mode === 'admin') {
      setIsAdminMode(true);
      setIsLogin(true);
    } else {
      setIsLogin(true);
      setIsAdminMode(false);
    }
  }, [searchParams]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (isAdminMode) {
        // Admin Login
        const res = await api.login({ 
          email: formData.email || 'admin@maxfitness.com', 
          password: formData.password 
        });
        if (res.user.role !== 'admin') {
          throw new Error('Not an admin account');
        }
        localStorage.setItem('token', res.token);
        window.dispatchEvent(new Event('auth-change'));
        navigate('/dashboard');
      } else if (isLogin) {
        // Client Login
        const res = await api.login({ email: formData.email, password: formData.password });
        localStorage.setItem('token', res.token);
        window.dispatchEvent(new Event('auth-change'));
        navigate('/dashboard');
      } else {
        // Client Registration
        await api.register({ 
          name: formData.name, 
          email: formData.email, 
          password: formData.password,
          role: 'client'
        });
        
        setSuccess('Registration successful! Please login with your credentials.');
        setIsLogin(true);
        setSearchParams({ mode: 'login' });
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <button 
          onClick={() => navigate('/')}
          className="mb-8 flex items-center gap-2 text-zinc-500 hover:text-white transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </button>

        <div className="text-center mb-8">
          <div className="inline-flex p-4 bg-red-600 rounded-2xl mb-4 shadow-lg shadow-red-600/20">
            <Dumbbell className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight">Max Fitness</h1>
          <p className="text-zinc-500 mt-2">Studio Management & Client Portal</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl">
          <div className="flex p-1 bg-zinc-950 rounded-xl mb-8">
            <button 
              onClick={() => { setIsAdminMode(false); setIsLogin(true); setError(null); setSuccess(null); setSearchParams({ mode: 'login' }); }}
              className={cn(
                "flex-1 py-2 text-sm font-medium rounded-lg transition-all",
                !isAdminMode ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              Client
            </button>
            <button 
              onClick={() => { setIsAdminMode(true); setIsLogin(true); setError(null); setSuccess(null); setSearchParams({ mode: 'admin' }); }}
              className={cn(
                "flex-1 py-2 text-sm font-medium rounded-lg transition-all",
                isAdminMode ? "bg-red-600 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              Admin
            </button>
          </div>

          {isAdminMode && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
              <p className="text-xs text-red-400 font-medium mb-1">Default Admin Credentials:</p>
              <p className="text-sm text-white font-mono">Email: admin@maxfitness.com</p>
              <p className="text-sm text-white font-mono">Password: admin123</p>
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-5">
            <AnimatePresence mode="wait">
              {isAdminMode ? (
                <motion.div
                  key="admin"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-5"
                >
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Admin Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600" />
                      <input
                        required
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-11 pr-4 py-3 text-white focus:border-red-500 outline-none transition-all"
                        placeholder="admin@maxfitness.com"
                      />
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="client"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-5"
                >
                  {!isLogin && (
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600" />
                        <input
                          required
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-11 pr-4 py-3 text-white focus:border-red-500 outline-none transition-all"
                          placeholder="John Doe"
                        />
                      </div>
                    </div>
                  )}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600" />
                      <input
                        required
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-11 pr-4 py-3 text-white focus:border-red-500 outline-none transition-all"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600" />
                <input
                  required
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-11 pr-4 py-3 text-white focus:border-red-500 outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <p className="text-red-500 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                {error}
              </p>
            )}

            {success && (
              <p className="text-emerald-500 text-sm bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/20">
                {success}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className={cn(
                "w-full py-4 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 shadow-lg",
                isAdminMode ? "bg-red-600 hover:bg-red-700 shadow-red-600/20" : "bg-zinc-100 text-black hover:bg-white shadow-white/5"
              )}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {isAdminMode ? 'Admin Login' : (isLogin ? 'Sign In' : 'Create Account')}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {!isAdminMode && (
            <div className="mt-8 text-center">
              <button 
                onClick={() => { 
                  setIsLogin(!isLogin); 
                  setError(null); 
                  setSuccess(null);
                  setSearchParams({ mode: !isLogin ? 'login' : 'register' });
                }}
                className="text-zinc-500 hover:text-white text-sm transition-colors"
              >
                {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
