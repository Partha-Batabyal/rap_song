import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { authService } from '../services/api.js';
import Toast from '../components/Common/Toast.jsx';
import { Disc, User, Mail, ShieldAlert, Award, Star, BarChart3 } from 'lucide-react';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('default');
  
  // Security
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Stats
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const avatars = [
    { id: 'lyricist', name: 'Lyricist', url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&h=150&q=80' },
    { id: 'mc', name: 'MC Flow', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80' },
    { id: 'dj', name: 'Scratch DJ', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80' },
    { id: 'producer', name: 'Beatsmith', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80' }
  ];

  const getAvatarUrl = (id) => {
    const match = avatars.find(a => a.id === id);
    return match ? match.url : 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&w=150&h=150&q=80';
  };

  useEffect(() => {
    const loadProfileData = async () => {
      try {
        const response = await authService.getProfile();
        const profile = response.data;
        
        setUsername(profile.user.username);
        setEmail(profile.user.email);
        setSelectedAvatar(profile.user.profileImage || 'default');
        setStats(profile.stats);
      } catch (err) {
        console.error('Error fetching profile data:', err);
        setToast({ message: 'Failed to sync profile statistics.', type: 'error' });
      } finally {
        setLoading(false);
      }
    };

    loadProfileData();
  }, []);

  const handleDetailsSubmit = async (e) => {
    e.preventDefault();
    if (!username || !email) {
      setToast({ message: 'Tag and Email are required.', type: 'error' });
      return;
    }

    setSaving(true);
    try {
      await updateProfile({
        username,
        email,
        profileImage: selectedAvatar
      });
      setToast({ message: 'Profile details updated successfully!', type: 'success' });
    } catch (err) {
      setToast({ message: err.message || 'Failed to update profile.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      setToast({ message: 'Please fill in all security fields.', type: 'error' });
      return;
    }

    if (newPassword.length < 6) {
      setToast({ message: 'New password must be at least 6 characters long.', type: 'error' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setToast({ message: 'New passwords do not match.', type: 'error' });
      return;
    }

    setSaving(true);
    try {
      await updateProfile({
        currentPassword,
        newPassword
      });
      setToast({ message: 'Vault encryption key (password) updated!', type: 'success' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setToast({ message: err.message || 'Failed to update password.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center">
        <Disc className="w-12 h-12 text-purple-500 animate-spin" />
        <p className="mt-4 text-purple-400 font-studio text-sm tracking-widest uppercase animate-pulse">Syncing Profile deck...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}

      {/* ==================== PAGE HEADER ==================== */}
      <div>
        <h1 className="text-3xl font-extrabold font-studio tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
          User Settings
        </h1>
        <p className="text-sm text-zinc-400 mt-1 font-light">
          Manage your secure rapper profile details and analyze studio metrics.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* EDIT DETAIL FORMS (2 Columns) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* PROFILE CARD */}
          <div className="glass-panel rounded-3xl p-6 md:p-8 relative shadow-xl">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-purple-500 to-transparent"></div>
            
            <h2 className="text-lg font-bold font-studio text-zinc-200 mb-6 flex items-center gap-2 select-none border-b border-zinc-800/40 pb-3">
              <Award className="w-5 h-5 text-purple-400" />
              Rapper Profile Details
            </h2>

            <form onSubmit={handleDetailsSubmit} className="space-y-6">
              
              {/* Profile Avatar Selection Grid */}
              <div className="select-none">
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-3.5 font-mono">
                  Current Studio Role
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {avatars.map((av) => (
                    <button
                      key={av.id}
                      type="button"
                      onClick={() => setSelectedAvatar(av.id)}
                      className={`p-3 flex flex-col items-center gap-2 rounded-2xl border transition-all ${
                        selectedAvatar === av.id 
                          ? 'border-purple-500 bg-purple-500/5 shadow-[0_0_15px_rgba(168,85,247,0.15)] text-purple-300'
                          : 'border-zinc-800 bg-zinc-950/20 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                      }`}
                    >
                      <img 
                        src={av.url} 
                        alt={av.name} 
                        className="w-12 h-12 rounded-full object-cover border border-zinc-800 shadow-md"
                      />
                      <span className="text-[10px] font-mono tracking-wide truncate max-w-full">{av.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Rapper Tag */}
              <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-2 font-mono select-none">
                  Rapper Tag (Username)
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-xs text-zinc-200"
                    placeholder="lil_spitfire"
                    required
                  />
                </div>
              </div>

              {/* Secure Email */}
              <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-2 font-mono select-none">
                  Secure Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-xs text-zinc-200 animate-pulse-slow"
                    placeholder="rapper@rapvault.com"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-zinc-100 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-300 shadow-lg shadow-purple-500/20 disabled:opacity-50"
              >
                {saving ? 'Syncing details...' : 'Update Details'}
              </button>
            </form>
          </div>

          {/* SECURITY SECURITY CARD */}
          <div className="glass-panel rounded-3xl p-6 md:p-8 relative shadow-xl">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-500 to-transparent"></div>
            
            <h2 className="text-lg font-bold font-studio text-zinc-200 mb-6 flex items-center gap-2 select-none border-b border-zinc-800/40 pb-3">
              <ShieldAlert className="w-5 h-5 text-cyan-400" />
              Vault Security Key (Password)
            </h2>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-2 font-mono">
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl glass-input text-xs text-zinc-200"
                  placeholder="••••••••"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-2 font-mono">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl glass-input text-xs text-zinc-200"
                  placeholder="••••••••"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-2 font-mono">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl glass-input text-xs text-zinc-200"
                  placeholder="••••••••"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-zinc-100 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-300 shadow-lg shadow-cyan-500/20 disabled:opacity-50 mt-2"
              >
                {saving ? 'Encrypting keys...' : 'Update Password'}
              </button>
            </form>
          </div>

        </div>

        {/* ACCOUNT METRICS & STATS PANEL (1 Column) */}
        <div className="flex flex-col gap-6 select-none">
          
          <div className="glass-panel rounded-3xl p-6 relative shadow-xl">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-pink-500 to-transparent"></div>
            
            <h2 className="text-lg font-bold font-studio text-zinc-200 mb-6 flex items-center gap-2 border-b border-zinc-800/40 pb-3">
              <BarChart3 className="w-5 h-5 text-pink-400" />
              Vault Statistics
            </h2>

            <div className="space-y-6">
              
              {/* Stat 1: Total lyrics */}
              <div className="flex items-center justify-between border-b border-zinc-800/40 pb-3">
                <span className="text-xs text-zinc-500 font-mono uppercase tracking-wider">Tracks Vaulted</span>
                <span className="text-sm font-semibold font-studio text-zinc-200">{stats?.totalSongs || 0}</span>
              </div>

              {/* Stat 2: Total lines */}
              <div className="flex items-center justify-between border-b border-zinc-800/40 pb-3">
                <span className="text-xs text-zinc-500 font-mono uppercase tracking-wider">Total Rhyme Lines</span>
                <span className="text-sm font-semibold font-studio text-zinc-200">{stats?.totalLines || 0}</span>
              </div>

              {/* Stat 3: Total words */}
              <div className="flex items-center justify-between border-b border-zinc-800/40 pb-3">
                <span className="text-xs text-zinc-500 font-mono uppercase tracking-wider">Spit Vocabulary</span>
                <span className="text-sm font-semibold font-studio text-zinc-200">{stats?.totalWords || 0} words</span>
              </div>

              {/* Stat 4: Top Mood */}
              <div className="flex items-center justify-between border-b border-zinc-800/40 pb-3">
                <span className="text-xs text-zinc-500 font-mono uppercase tracking-wider">Primary Mood</span>
                <span className="text-sm font-semibold font-studio text-zinc-200">{stats?.favoriteMood || 'None'}</span>
              </div>

              {/* MOOD DISTRIBUTION GRAPHICS */}
              <div className="pt-2">
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-3 font-mono">
                  Catalog Distribution
                </label>
                
                {stats?.moodCounts && Object.keys(stats.moodCounts).length > 0 ? (
                  <div className="space-y-3">
                    {Object.entries(stats.moodCounts).map(([mood, count]) => {
                      const percentage = stats.totalSongs ? Math.round((count / stats.totalSongs) * 100) : 0;
                      return (
                        <div key={mood} className="space-y-1">
                          <div className="flex items-center justify-between text-[10px] text-zinc-400 font-mono">
                            <span>{mood}</span>
                            <span>{count} track{count > 1 ? 's' : ''} ({percentage}%)</span>
                          </div>
                          <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-800/50">
                            <div 
                              className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 rounded-full" 
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-[10px] text-zinc-600 font-light italic">No lyrics distribution available. Spawn a track to view.</p>
                )}
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Profile;
