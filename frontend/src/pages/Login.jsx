import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FaRecycle, FaLock, FaEnvelope, FaSignInAlt } from 'react-icons/fa';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Reset inputs on component mount
  useEffect(() => {
    setEmail('');
    setPassword('');
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await login(email, password);
      const user = data?.data;
      toast.success(`Welcome back, ${user?.name || 'User'}!`);

      if (user?.role === 'admin') navigate('/admin/dashboard');
      else if (user?.role === 'seller') navigate('/seller/dashboard');
      else navigate('/marketplace');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed, please check credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200/90 shadow-2xl p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-btn-primary flex items-center justify-center text-white mx-auto shadow-md">
            <FaRecycle className="text-2xl" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Login to Fluxora</h2>
          <p className="text-xs text-slate-500">
            Access your B2B scrap marketplace account and negotiation dashboard
          </p>
        </div>

        <form onSubmit={handleSubmit} autoComplete="off" className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <FaEnvelope className="absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="email"
                required
                name="email"
                autoComplete="off"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:bg-white transition"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <FaLock className="absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="password"
                required
                name="password"
                autoComplete="new-password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:bg-white transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-btn-primary hover:shadow-teal-500/25 text-white rounded-xl font-bold text-xs shadow-md transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              'Signing In...'
            ) : (
              <>
                <FaSignInAlt /> Sign In
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Credentials Autofill */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 text-xs space-y-2">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center">
            Quick Demo Logins (Click to Auto-fill)
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => {
                setEmail('admin@fluxora.com');
                setPassword('admin123');
              }}
              className="py-1.5 px-2 bg-white hover:bg-teal-50 border border-slate-200 hover:border-teal-400 rounded-lg text-slate-700 font-semibold text-[11px] transition cursor-pointer text-center"
            >
              👑 Admin
            </button>
            <button
              type="button"
              onClick={() => {
                setEmail('seller1@test.com');
                setPassword('password123');
              }}
              className="py-1.5 px-2 bg-white hover:bg-teal-50 border border-slate-200 hover:border-teal-400 rounded-lg text-slate-700 font-semibold text-[11px] transition cursor-pointer text-center"
            >
              🏭 Seller
            </button>
            <button
              type="button"
              onClick={() => {
                setEmail('buyer1@test.com');
                setPassword('password123');
              }}
              className="py-1.5 px-2 bg-white hover:bg-teal-50 border border-slate-200 hover:border-teal-400 rounded-lg text-slate-700 font-semibold text-[11px] transition cursor-pointer text-center"
            >
              🚛 Buyer
            </button>
          </div>
        </div>

        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          Don't have an industrial account?{' '}
          <Link to="/register" className="text-amber-600 font-bold hover:underline">
            Register Here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
