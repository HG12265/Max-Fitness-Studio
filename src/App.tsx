import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { api } from './services/api';
import Home from './components/Home';
import Auth from './components/Auth';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import ClientDashboard from './components/ClientDashboard';
import ClientForm from './components/ClientForm';
import ClientList from './components/ClientList';
import TrainerManagement from './components/TrainerManagement';
import { Loader2 } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<any | null>(null);
  const [role, setRole] = useState<'admin' | 'client' | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const userData = await api.getMe();
        setUser(userData);
        setRole(userData.role);
      } catch (err) {
        console.error('Auth check failed:', err);
        localStorage.removeItem('token');
        setUser(null);
        setRole(null);
      }
    } else {
      setUser(null);
      setRole(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    checkAuth();
    
    // Listen for auth changes from other components
    window.addEventListener('auth-change', checkAuth);
    return () => window.removeEventListener('auth-change', checkAuth);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-red-600 animate-spin" />
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Home />} />
        <Route path="/auth" element={user ? <Navigate to="/dashboard" replace /> : <Auth />} />
        
        <Route 
          path="/dashboard/*" 
          element={
            user ? (
              <Layout user={user} role={role}>
                <Routes>
                  {role === 'admin' ? (
                    <>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/add-client" element={<ClientForm />} />
                      <Route path="/edit-client/:id" element={<ClientForm />} />
                      <Route path="/clients" element={<ClientList />} />
                      <Route path="/trainers" element={<TrainerManagement />} />
                    </>
                  ) : (
                    <>
                      <Route path="/" element={<ClientDashboard />} />
                      <Route path="/join" element={<ClientForm isClientSelfJoin={true} />} />
                    </>
                  )}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Layout>
            ) : (
              <Navigate to="/auth" replace />
            )
          } 
        />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
