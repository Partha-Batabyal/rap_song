import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { 
  LayoutDashboard, 
  Music, 
  PlusCircle, 
  Archive, 
  User, 
  LogOut, 
  Menu, 
  X, 
  Disc, 
  ChevronLeft, 
  ChevronRight,
  TrendingUp
} from 'lucide-react';

const MainLayout = ({ children }) => {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  // Redirect unauthenticated users to login
  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-studio-black flex items-center justify-center">
        <div className="relative flex flex-col items-center">
          <Disc className="w-16 h-16 text-purple-500 animate-spin" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-studio-black rounded-full border border-purple-500/20"></div>
          <p className="mt-4 text-purple-400 font-studio text-sm tracking-wider uppercase animate-pulse">Entering Vault...</p>
        </div>
      </div>
    );
  }

  // Predefined avatar selections mapping
  const avatars = {
    lyricist: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&h=150&q=80',
    mc: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80',
    dj: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80',
    producer: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80',
    default: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&w=150&h=150&q=80'
  };

  const getAvatarUrl = (img) => {
    if (!img) return avatars.default;
    if (avatars[img]) return avatars[img];
    return img; // custom URL/base64
  };

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'My Songs', path: '/songs', icon: Music },
    { name: 'Create Song', path: '/songs/new', icon: PlusCircle },
    { name: 'Archived Songs', path: '/songs/archived', icon: Archive },
    { name: 'User Profile', path: '/profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-studio-black flex text-zinc-100 overflow-hidden font-sans">
      {/* Background radial glows */}
      <div className="absolute top-0 right-0 w-[50vw] h-[50vh] bg-purple-900/5 rounded-full blur-[120px] pointer-events-none select-none"></div>
      <div className="absolute bottom-0 left-0 w-[40vw] h-[40vh] bg-cyan-900/5 rounded-full blur-[120px] pointer-events-none select-none"></div>

      {/* ==================== DESKTOP SIDEBAR ==================== */}
      <aside 
        className={`hidden md:flex flex-col relative border-r border-zinc-800/80 glass-panel h-screen z-20 transition-all duration-300 ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Toggle Collapse Button */}
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="absolute top-6 -right-3 w-6 h-6 bg-zinc-900 border border-zinc-800 hover:border-purple-500 rounded-full flex items-center justify-center text-zinc-400 hover:text-purple-400 shadow-md transition-all"
        >
          {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>

        {/* Sidebar Header Logo */}
        <div className={`p-6 flex items-center gap-3 border-b border-zinc-800/50 ${collapsed ? 'justify-center' : ''}`}>
          <div className="relative cursor-pointer" onClick={() => navigate('/dashboard')}>
            <Disc className="w-8 h-8 text-purple-500 animate-spin" style={{ animationDuration: '10s' }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-studio-black rounded-full"></div>
          </div>
          {!collapsed && (
            <span className="font-studio font-bold text-lg tracking-wider bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent select-none">
              RAPVAULT
            </span>
          )}
        </div>

        {/* Navigation items */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 group relative ${
                  isActive 
                    ? 'bg-gradient-to-r from-purple-600/30 to-cyan-600/10 text-purple-300 border-l-4 border-purple-500 font-medium'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/30 border-l-4 border-transparent'
                } ${collapsed ? 'justify-center' : ''}`}
                title={collapsed ? item.name : undefined}
              >
                <Icon className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-purple-400' : 'text-zinc-400 group-hover:text-purple-400'}`} />
                {!collapsed && <span>{item.name}</span>}
                
                {/* Active side-glow */}
                {isActive && !collapsed && (
                  <span className="absolute right-3 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)] animate-pulse"></span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Mini Profile Box */}
        <div className="p-4 border-t border-zinc-800/50 flex flex-col gap-3">
          <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
            <img 
              src={getAvatarUrl(user.profileImage)} 
              alt={user.username}
              className="w-10 h-10 rounded-full border border-purple-500/30 object-cover shadow-[0_0_10px_rgba(168,85,247,0.15)]"
            />
            {!collapsed && (
              <div className="overflow-hidden">
                <p className="text-sm font-medium text-zinc-200 truncate">{user.username}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)] animate-pulse"></span>
                  <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">Synced</span>
                </div>
              </div>
            )}
          </div>
          
          <button
            onClick={logout}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl text-zinc-400 hover:text-red-400 hover:bg-red-500/5 border border-transparent hover:border-red-500/20 transition-all ${
              collapsed ? 'justify-center' : ''
            }`}
            title={collapsed ? 'Logout' : undefined}
          >
            <LogOut className="w-5 h-5 text-zinc-400 group-hover:text-red-400" />
            {!collapsed && <span className="text-sm">Logout</span>}
          </button>
        </div>
      </aside>

      {/* ==================== MOBILE HEADER & NAVIGATION ==================== */}
      <div className="flex-1 flex flex-col min-w-0 h-screen relative">
        <header className="md:hidden glass-panel border-b border-zinc-800/80 px-6 py-4 flex items-center justify-between z-30">
          <div className="flex items-center gap-2">
            <Disc className="w-6 h-6 text-purple-500 animate-spin" style={{ animationDuration: '10s' }} />
            <span className="font-studio font-bold text-md tracking-wider bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              RAPVAULT
            </span>
          </div>
          
          <button 
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-100"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </header>

        {/* Mobile Navigation Drawer Backdrop */}
        {mobileOpen && (
          <div 
            onClick={() => setMobileOpen(false)}
            className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />
        )}

        {/* Mobile Drawer Menu */}
        <aside 
          className={`md:hidden fixed top-0 bottom-0 left-0 w-64 glass-panel border-r border-zinc-800 z-50 flex flex-col p-6 transition-transform duration-300 transform ${
            mobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between pb-6 border-b border-zinc-800/50 mb-6">
            <div className="flex items-center gap-2">
              <Disc className="w-6 h-6 text-purple-500 animate-spin" />
              <span className="font-studio font-bold tracking-wider text-purple-400">RAPVAULT</span>
            </div>
            <button 
              onClick={() => setMobileOpen(false)}
              className="p-1 rounded-lg text-zinc-400 hover:text-zinc-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-grow space-y-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 ${
                    isActive 
                      ? 'bg-gradient-to-r from-purple-600/30 to-cyan-600/10 text-purple-300 border-l-4 border-purple-500 font-medium'
                      : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/30 border-l-4 border-transparent'
                  }`}
                >
                  <Icon className="w-5 h-5 text-purple-400" />
                  <span className="text-sm font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          <div className="pt-6 border-t border-zinc-800/50 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <img 
                src={getAvatarUrl(user.profileImage)} 
                alt={user.username}
                className="w-10 h-10 rounded-full border border-purple-500/30 object-cover"
              />
              <div>
                <p className="text-sm font-medium text-zinc-200">{user.username}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)] animate-pulse"></span>
                  <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-mono">Synced</span>
                </div>
              </div>
            </div>
            
            <button
              onClick={logout}
              className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-zinc-400 hover:text-red-400 hover:bg-red-500/5 border border-transparent hover:border-red-500/20 transition-all justify-center"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        </aside>

        {/* ==================== MAIN CONTENT WRAPPER ==================== */}
        <main className="flex-1 overflow-y-auto relative p-6 md:p-10 select-text">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
