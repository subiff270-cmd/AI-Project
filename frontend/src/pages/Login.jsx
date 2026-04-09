import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Wallet, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const { dark } = useTheme();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex ${dark ? 'bg-slate-950' : 'bg-slate-50'}`}>
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-950 relative overflow-hidden border-r border-slate-800">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-primary-600/10 rounded-full blur-[100px] -translate-x-1/4 -translate-y-1/4" />
          <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-accent-500/10 rounded-full blur-[100px] translate-x-1/4 translate-y-1/4" />
        </div>
        <div className="relative z-10 flex flex-col justify-center px-16 text-white w-full">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-14 h-14 bg-white/5 border border-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <Wallet className="w-7 h-7 text-primary-400" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">ExpenseAI</h1>
          </div>
          <h2 className="text-4xl font-bold leading-tight mb-4">
            Smart expense tracking<br />with AI insights
          </h2>
          <p className="text-lg text-white/80 max-w-md">
            Track, analyze, and optimize your spending with intelligent recommendations
            and predictive analytics.
          </p>
          <div className="mt-12 grid grid-cols-3 gap-6">
            {[
              { label: 'AI Insights', value: 'Smart' },
              { label: 'Categories', value: '6+' },
              { label: 'Export', value: 'CSV' },
            ].map((item) => (
              <div key={item.label} className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 shadow-inner shadow-white/5">
                <p className="text-2xl font-bold text-white mb-1">{item.value}</p>
                <p className="text-sm font-medium text-slate-400">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-md animate-fade-in-up">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shadow-sm">
              <Wallet className="w-6 h-6 text-primary-500" />
            </div>
            <h1 className="text-2xl font-bold">ExpenseAI</h1>
          </div>

          <h2 className="text-2xl font-bold mb-1">Welcome back</h2>
          <p className={`text-sm mb-8 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
            Sign in to your account to continue
          </p>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-2 uppercase tracking-wider opacity-60">
                Email
              </label>
              <div className="relative">
                <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${dark ? 'text-slate-400' : 'text-slate-400'}`} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input pl-11"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-2 uppercase tracking-wider opacity-60">
                Password
              </label>
              <div className="relative">
                <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${dark ? 'text-slate-400' : 'text-slate-400'}`} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input pl-11"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3.5 text-base mt-2"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className={`mt-6 text-center text-sm ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary-500 font-semibold hover:text-primary-400 transition-colors">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
