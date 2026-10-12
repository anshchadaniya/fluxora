import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
  FaRecycle,
  FaUser,
  FaEnvelope,
  FaLock,
  FaBuilding,
  FaPhone,
  FaMapMarkerAlt,
  FaUserPlus,
  FaCheckCircle,
} from 'react-icons/fa';

const CITIES = [
  { name: 'Ahmedabad', lat: 23.0225, lng: 72.5714 },
  { name: 'Vadodara', lat: 22.3072, lng: 73.1812 },
  { name: 'Surat', lat: 21.1702, lng: 72.8311 },
  { name: 'Rajkot', lat: 22.3039, lng: 70.8022 },
];

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'seller', // 'seller' or 'buyer'
    companyName: '',
    phone: '',
    city: 'Ahmedabad',
  });
  const [phoneError, setPhoneError] = useState('');
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  // Ensure form state starts completely empty on mount
  useEffect(() => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'seller',
      companyName: '',
      phone: '',
      city: 'Ahmedabad',
    });
    setPhoneError('');
    setPhoneTouched(false);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhoneChange = (e) => {
    const cleanVal = e.target.value.replace(/\D/g, '').slice(0, 10);
    setFormData((prev) => ({ ...prev, phone: cleanVal }));
    if (cleanVal.length > 0 && cleanVal.length !== 10) {
      setPhoneError('Phone number must be exactly 10 digits');
    } else {
      setPhoneError('');
    }
  };

  const handlePhoneBlur = () => {
    setPhoneTouched(true);
    if (formData.phone.length !== 10) {
      setPhoneError('Phone number must be exactly 10 digits');
    } else {
      setPhoneError('');
    }
  };

  const handleRoleSelect = (selectedRole) => {
    setFormData((prev) => ({ ...prev, role: selectedRole }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.phone.length !== 10) {
      setPhoneError('Phone number must be exactly 10 digits');
      toast.error('Phone number must be exactly 10 digits');
      return;
    }

    setLoading(true);

    const selectedCity = CITIES.find((c) => c.name === formData.city) || CITIES[0];
    const payload = {
      ...formData,
      state: 'Gujarat',
      location: { lat: selectedCity.lat, lng: selectedCity.lng },
    };

    try {
      const data = await register(payload);
      const userName = data?.data?.name || formData.name || 'User';
      toast.success(`Account registered! Welcome to Fluxora, ${userName}`);
      if (formData.role === 'seller') navigate('/seller/dashboard');
      else navigate('/marketplace');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-lg w-full bg-white rounded-3xl border border-slate-200/90 shadow-2xl p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-btn-primary flex items-center justify-center text-white mx-auto shadow-md">
            <FaRecycle className="text-2xl" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Create an Account</h2>
          <p className="text-xs text-slate-500">
            Join Gujarat's verified industrial waste trading platform
          </p>
        </div>

        <form onSubmit={handleSubmit} autoComplete="off" className="space-y-4 text-xs">
          {/* Role Selection */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">Registering As:</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleRoleSelect('seller')}
                className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border-2 cursor-pointer transition-all duration-300 text-center relative ${
                  formData.role === 'seller'
                    ? 'bg-btn-primary text-white border-teal-500 shadow-md shadow-teal-500/25 ring-2 ring-teal-400/40'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  {formData.role === 'seller' && (
                    <FaCheckCircle className="text-amber-300 text-sm" />
                  )}
                  <span>🏭 Scrap Seller</span>
                </div>
                <span className={`text-[10px] mt-0.5 ${formData.role === 'seller' ? 'text-teal-100' : 'text-slate-500'}`}>
                  Manufacturing, Mills, Plants
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleSelect('buyer')}
                className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border-2 cursor-pointer transition-all duration-300 text-center relative ${
                  formData.role === 'buyer'
                    ? 'bg-btn-primary text-white border-teal-500 shadow-md shadow-teal-500/25 ring-2 ring-teal-400/40'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  {formData.role === 'buyer' && (
                    <FaCheckCircle className="text-amber-300 text-sm" />
                  )}
                  <span>♻️ Scrap Buyer</span>
                </div>
                <span className={`text-[10px] mt-0.5 ${formData.role === 'buyer' ? 'text-teal-100' : 'text-slate-500'}`}>
                  Recycler, Dealer, Foundry
                </span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Contact Person Name</label>
              <div className="relative">
                <FaUser className="absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="text"
                  required
                  name="name"
                  autoComplete="off"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:bg-white focus:outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Company / Facility Name</label>
              <div className="relative">
                <FaBuilding className="absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="text"
                  required
                  name="companyName"
                  autoComplete="off"
                  placeholder="Enter company name"
                  value={formData.companyName}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:bg-white focus:outline-none transition"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:bg-white focus:outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
              <div className="relative">
                <FaPhone className="absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  required
                  name="phone"
                  autoComplete="off"
                  placeholder="Enter 10-digit phone number"
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  onBlur={handlePhoneBlur}
                  className={`w-full pl-10 pr-3 py-2.5 bg-slate-50 border rounded-xl text-xs focus:ring-2 focus:bg-white focus:outline-none transition ${
                    phoneError ? 'border-red-400 focus:ring-red-400' : 'border-slate-200 focus:ring-teal-500 focus:border-teal-500'
                  }`}
                />
              </div>
              {phoneError && (
                <p className="text-[11px] text-red-500 mt-1 font-medium">{phoneError}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Password (min 6 chars)</label>
              <div className="relative">
                <FaLock className="absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="password"
                  required
                  minLength="6"
                  name="password"
                  autoComplete="new-password"
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:bg-white focus:outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Primary Industrial City</label>
              <div className="relative">
                <FaMapMarkerAlt className="absolute left-3.5 top-3.5 text-slate-400" />
                <select
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:bg-white font-medium focus:outline-none transition"
                >
                  {CITIES.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name}, Gujarat
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-btn-accent text-white rounded-xl font-bold text-xs shadow-lg hover:shadow-amber-500/30 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
          >
            {loading ? (
              'Creating Account...'
            ) : (
              <>
                <FaUserPlus /> Complete Registration
              </>
            )}
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          Already registered?{' '}
          <Link to="/login" className="text-teal-700 font-bold hover:underline">
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
