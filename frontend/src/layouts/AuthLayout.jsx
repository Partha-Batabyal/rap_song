import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Disc } from 'lucide-react';

const AuthLayout = ({ children }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-studio-black flex items-center justify-center">
        <div className="relative flex flex-col items-center">
          <Disc className="w-16 h-16 text-purple-500 animate-spin" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-studio-black rounded-full border border-purple-500/20"></div>
          <p className="mt-4 text-purple-400 font-studio text-sm tracking-wider uppercase animate-pulse">Syncing Studio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-studio-black overflow-hidden flex items-center justify-center p-4">
      {/* Dynamic Background Glowing Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-900/20 rounded-full blur-[150px] animate-pulse-slow"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyan-900/10 rounded-full blur-[150px] animate-pulse-slow delay-1000"></div>
      
      {/* Decorative vinyl details */}
      <div className="absolute top-10 right-10 opacity-5 pointer-events-none rotate-45 select-none hidden md:block">
        <Disc className="w-96 h-96 text-white animate-spin-slow" style={{ animationDuration: '30s' }} />
      </div>
      
      <div className="w-full max-w-md z-10">
        {/* App Logo / Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="relative">
              <Disc className="w-10 h-10 text-purple-500 animate-spin" style={{ animationDuration: '8s' }} />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-studio-black rounded-full"></div>
            </div>
            <span className="text-3xl font-bold font-studio tracking-wider bg-gradient-to-r from-purple-400 via-pink-500 to-cyan-400 bg-clip-text text-transparent">
              RAPVAULT
            </span>
          </div>
          <p className="text-slate-400 text-sm font-light">Where Rhymes Find Safe Keeping</p>
        </div>

        {/* Content Box with glassmorphism */}
        <div className="glass-panel rounded-2xl p-8 shadow-2xl relative border border-white/5 glow-purple-hover transition-all duration-300">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-purple-500 via-transparent to-cyan-400 rounded-t-2xl"></div>
          {children}
        </div>
        
        {/* Footer info */}
        <p className="text-center text-xs text-zinc-600 mt-6 select-none font-light">
          © {new Date().getFullYear()} RapVault Inc. Locked & Encrypted.
        </p>
      </div>
    </div>
  );
};

export default AuthLayout;
