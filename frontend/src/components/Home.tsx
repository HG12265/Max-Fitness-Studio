import { useNavigate } from 'react-router-dom';
import { Dumbbell, CheckCircle2, Users, Trophy, ArrowRight, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

export default function Home() {
  const navigate = useNavigate();

  const features = [
    { icon: Users, title: "Expert Trainers", desc: "Work with certified professionals to reach your goals." },
    { icon: Trophy, title: "Modern Equipment", desc: "Access to top-of-the-line fitness technology." },
    { icon: ShieldCheck, title: "Secure Tracking", desc: "Your health data and membership details are safe with us." },
  ];

  return (
    <div className="min-h-screen bg-black text-white selection:bg-red-600/30">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-black/50 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-600 rounded-lg">
              <Dumbbell className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tighter uppercase">Max Fitness</span>
          </div>
          <div className="flex items-center gap-6">
            <button 
              onClick={() => navigate('/auth?mode=admin')}
              className="text-sm font-medium text-zinc-400 hover:text-white transition-colors"
            >
              Staff Login
            </button>
            <button 
              onClick={() => navigate('/auth?mode=register')}
              className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-full transition-all shadow-lg shadow-red-600/20"
            >
              Join Now
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-600/10 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-red-900/10 blur-[120px] rounded-full" />
        </div>

        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 text-sm font-medium mb-8"
          >
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            New Season Registration Open
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.9]"
          >
            PUSH YOUR <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-red-500 to-red-800">LIMITS TODAY.</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-zinc-400 text-xl max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            Experience the ultimate fitness transformation at Max Fitness Studio. 
            State-of-the-art equipment, expert coaching, and a community that drives you.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button 
              onClick={() => navigate('/auth?mode=register')}
              className="group px-10 py-5 bg-red-600 hover:bg-red-700 text-white font-black rounded-2xl transition-all shadow-2xl shadow-red-600/30 flex items-center gap-3"
            >
              BECOME A MEMBER
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={() => navigate('/auth?mode=login')}
              className="px-10 py-5 bg-zinc-900 hover:bg-zinc-800 text-white font-bold rounded-2xl border border-zinc-800 transition-all"
            >
              MEMBER LOGIN
            </button>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-zinc-950/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-8 rounded-3xl bg-zinc-900/30 border border-zinc-800 hover:border-red-900/30 transition-all group"
              >
                <div className="w-14 h-14 bg-red-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-red-600/20 group-hover:scale-110 transition-transform">
                  <f.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                <p className="text-zinc-500 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-600 rounded-lg">
              <Dumbbell className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tighter uppercase">Max Fitness</span>
          </div>
          <div className="flex gap-8 text-zinc-500 text-sm font-medium">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Contact Us</a>
          </div>
          <p className="text-zinc-600 text-sm">© 2026 Max Fitness Studio. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
