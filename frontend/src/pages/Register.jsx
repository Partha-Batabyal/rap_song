import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Toast from '../components/Common/Toast.jsx';
import { User, Mail, Lock, UserPlus } from 'lucide-react';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('default');
  
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Predefined avatar selections with descriptions
  const avatarChoices = [
    { id: 'lyricist', name: 'Lyricist', url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&h=150&q=80' },
    { id: 'mc', name: 'MC Flow', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80' },
    { id: 'dj', name: 'Scratch DJ', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80' },
    { id: 'producer', name: 'Beatsmith', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validations
    if (!username || !email || !password || !confirmPassword) {
      setToast({ message: 'All fields are required', type: 'error' });
      return;
    }

    if (password.length < 6) {
      setToast({ message: 'Password must be at least 6 characters long', type: 'error' });
      return;
    }

    if (password !== confirmPassword) {
      setToast({ message: 'Passwords do not match', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      await register(username, email, password, selectedAvatar);
      setToast({ message: 'Account registered! Entering Studio...', type: 'success' });
      setTimeout(() => navigate('/dashboard'), 800);
    } catch (err) {
      setToast({ message: err.message || 'Registration failed', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}

      <h2 className="text-2xl font-bold font-studio text-center text-zinc-100 mb-4 tracking-wide">
        Register Spitfire
      </h2>
      <p className="text-xs text-center text-zinc-400 mb-6 font-light">Set up your profile to secure your vault keys.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Username */}
        <div>
          <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-1.5 font-mono">
            Rapper Tag (Username)
          </label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs text-zinc-200"
              placeholder="lil_spitfire"
              required
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-1.5 font-mono">
            Secure Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs text-zinc-200"
              placeholder="rapper@rapvault.com"
              required
            />
          </div>
        </div>

        {/* Avatar Selector Grid */}
        <div>
          <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-2 font-mono">
            Select Your Avatar Role
          </label>
          <div className="grid grid-cols-4 gap-2">
            {avatarChoices.map((av) => (
              <button
                key={av.id}
                type="button"
                onClick={() => setSelectedAvatar(av.id)}
                className={`p-1 flex flex-col items-center gap-1 rounded-xl border transition-all ${
                  selectedAvatar === av.id 
                    ? 'border-purple-500 bg-purple-500/10 shadow-[0_0_10px_rgba(168,85,247,0.2)]'
                    : 'border-zinc-800 bg-zinc-950/40 hover:border-zinc-700'
                }`}
              >
                <img 
                  src={av.url} 
                  alt={av.name} 
                  className="w-10 h-10 rounded-full object-cover border border-zinc-800"
                />
                <span className="text-[8px] text-zinc-400 font-mono truncate max-w-full">{av.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-1.5 font-mono">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs text-zinc-200"
              placeholder="••••••••"
              required
            />
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-1.5 font-mono">
            Confirm Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs text-zinc-200"
              placeholder="••••••••"
              required
            />
          </div>
        </div>

        {/* Register Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-zinc-100 rounded-xl text-xs font-semibold tracking-wider uppercase transition-all duration-300 shadow-lg shadow-purple-500/20 hover:shadow-purple-500/35 flex items-center justify-center gap-2 border border-purple-500/10 disabled:opacity-50"
        >
          {loading ? (
            <span className="w-5 h-5 rounded-full border-2 border-zinc-400 border-t-transparent animate-spin"></span>
          ) : (
            <>
              <UserPlus className="w-4 h-4" />
              Sign Up Spitfire
            </>
          )}
        </button>
      </form>

      {/* Redirect link */}
      <p className="mt-6 text-center text-xs text-zinc-400 font-light">
        Already in the records?{' '}
        <Link to="/login" className="text-purple-400 hover:underline font-semibold font-mono">
          Spit Login
        </Link>
      </p>
    </div>
  );
};

export default Register;
