import { ReactNode, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  UserPlus, 
  Users, 
  LogOut, 
  Menu, 
  X, 
  Dumbbell,
  MessageSquare
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface LayoutProps {
  children: ReactNode;
  user: any;
  role: 'admin' | 'client' | null;
}

export default function Layout({ children, user, role }: LayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      localStorage.removeItem('token');
      window.dispatchEvent(new Event('auth-change'));
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const adminNavItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/dashboard/add-client', icon: UserPlus, label: 'Add Client' },
    { to: '/dashboard/clients', icon: Users, label: 'View Clients' },
    { to: '/dashboard/trainers', icon: Dumbbell, label: 'Manage Trainers' },
  ];

  const clientNavItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'My Membership' },
    { to: '/dashboard/chat', icon: MessageSquare, label: 'Gym Chat' },
  ];

  const navItems = role === 'admin' ? adminNavItems : clientNavItems;

  const displayName = user.name || user.displayName || 'User';
  const userEmail = user.email || '';
  const photoURL = user.photoURL || `https://ui-avatars.com/api/?name=${displayName}`;

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-zinc-950 border-r border-red-900/20 p-6">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="p-2 bg-red-600 rounded-lg">
            <Dumbbell className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">Max Fitness</h1>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/dashboard'}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                  isActive 
                    ? "bg-red-600 text-white shadow-lg shadow-red-600/20" 
                    : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                )
              }
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-zinc-900">
          <div className="flex items-center gap-3 px-2 mb-6">
            <img 
              src={photoURL} 
              alt={displayName} 
              className="w-10 h-10 rounded-full border border-red-900/30"
            />
            <div className="overflow-hidden">
              <p className="text-sm font-semibold truncate">{displayName}</p>
              <p className="text-xs text-zinc-500 truncate">{userEmail}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-zinc-400 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              className="fixed inset-y-0 left-0 w-72 bg-zinc-950 z-50 p-6 md:hidden border-r border-red-900/20"
            >
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-600 rounded-lg">
                    <Dumbbell className="w-6 h-6 text-white" />
                  </div>
                  <h1 className="text-xl font-bold tracking-tight text-white">Max Fitness</h1>
                </div>
                <button onClick={() => setIsSidebarOpen(false)} className="p-2 text-zinc-400">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <nav className="space-y-2">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/dashboard'}
                    onClick={() => setIsSidebarOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
                        isActive 
                          ? "bg-red-600 text-white" 
                          : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                      )
                    }
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </NavLink>
                ))}
              </nav>

              <div className="mt-auto absolute bottom-6 left-6 right-6 pt-6 border-t border-zinc-900">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-4 py-3 text-zinc-400 hover:text-red-500 rounded-xl transition-all"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-red-900/10 bg-zinc-950/50 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-30">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="md:hidden p-2 text-zinc-400 hover:text-white"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-4 ml-auto">
            <span className="text-sm text-zinc-400 hidden sm:inline">Welcome, {displayName}</span>
            <img 
              src={photoURL} 
              alt={displayName} 
              className="w-8 h-8 rounded-full border border-red-900/30 md:hidden"
            />
          </div>
        </header>

        <div className="p-6 md:p-10 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
