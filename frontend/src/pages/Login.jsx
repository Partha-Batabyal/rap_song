import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Toast from '../components/Common/Toast.jsx';
import { Mail, Lock, LogIn, Chrome } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setToast({ message: 'Please fill in all fields', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      await login(email, password, rememberMe);
      setToast({ message: 'Welcome to RapVault!', type: 'success' });
      // Redirect handled by AuthLayout or manually here
      setTimeout(() => navigate('/dashboard'), 500);
    } catch (err) {
      setToast({ message: err.message || 'Invalid credentials', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setToast({ message: 'Google Authentication is currently in demo mode.', type: 'info' });
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

      <h2 className="text-2xl font-bold font-studio text-center text-zinc-100 mb-6 tracking-wide">
        Sign In to Studio
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email Field */}
        <div>
          <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-2 font-mono">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-sm text-zinc-200"
              placeholder="rapper@rapvault.com"
              required
            />
          </div>
        </div>

        {/* Password Field */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-widest font-mono">
              Password
            </label>
            <a 
              href="#forgot" 
              onClick={(e) => {
                e.preventDefault();
                setToast({ message: 'Password recovery flow is sent to your registered email.', type: 'info' });
              }}
              className="text-[10px] text-purple-400 hover:text-purple-300 font-medium"
            >
              Forgot Password?
            </a>
          </div>
          
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-sm text-zinc-200"
              placeholder="••••••••"
              required
            />
          </div>
        </div>

        {/* Remember Me and status */}
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-xs text-zinc-400 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={() => setRememberMe(!rememberMe)}
              className="rounded bg-zinc-900 border-zinc-700 text-purple-600 focus:ring-0 focus:ring-offset-0 w-4 h-4"
            />
            Remember Me
          </label>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-zinc-100 rounded-xl text-sm font-semibold tracking-wider uppercase transition-all duration-300 shadow-lg shadow-purple-500/20 hover:shadow-purple-500/35 flex items-center justify-center gap-2 border border-purple-500/10 disabled:opacity-50"
        >
          {loading ? (
            <span className="w-5 h-5 rounded-full border-2 border-zinc-400 border-t-transparent animate-spin"></span>
          ) : (
            <>
              <LogIn className="w-4 h-4" />
              Tune In
            </>
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="relative my-6 text-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-zinc-800"></div>
        </div>
        <span className="relative px-3 bg-[#11111e]/90 text-[10px] uppercase font-semibold font-mono tracking-widest text-zinc-500">
          Or Spit Freely With
        </span>
      </div>

      {/* Social login buttons */}
      <button
        onClick={handleGoogleLogin}
        className="w-full py-3 px-4 glass-panel-light hover:bg-zinc-800/20 border border-zinc-800 hover:border-zinc-700 rounded-xl text-sm text-zinc-300 transition-all flex items-center justify-center gap-2 font-medium"
      >
        <Chrome className="w-4 h-4 text-purple-400" />
        Continue with Google
      </button>

      {/* Redirect link */}
      <p className="mt-8 text-center text-xs text-zinc-400 font-light">
        New in the scene?{' '}
        <Link to="/register" className="text-purple-400 hover:underline font-semibold">
          Register Spitfire
        </Link>
      </p>
    </div>
  );
};

export default Login;
