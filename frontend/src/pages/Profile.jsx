import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import toast from 'react-hot-toast';
import {
  FaUserCircle,
  FaCheckCircle,
  FaBuilding,
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaLeaf,
  FaShieldAlt,
} from 'react-icons/fa';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    companyName: '',
    phone: '',
    city: '',
  });
  const [phoneError, setPhoneError] = useState('');
  const [impact, setImpact] = useState({ totalKgRecycled: 0, totalCo2SavedKg: 0 });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        companyName: user.companyName || '',
        phone: user.phone || '',
        city: user.city || 'Ahmedabad',
      });
      setPhoneError('');
    }

    API.get('/impact/me')
      .then((res) => {
        if (res.data?.success) setImpact(res.data.data);
      })
      .catch((err) => console.warn(err));
  }, [user]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
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
    if (formData.phone && formData.phone.length !== 10) {
      setPhoneError('Phone number must be exactly 10 digits');
    } else {
      setPhoneError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.phone && formData.phone.length !== 10) {
      setPhoneError('Phone number must be exactly 10 digits');
      toast.error('Phone number must be exactly 10 digits');
      return;
    }

    setSaving(true);
    try {
      await updateProfile(formData);
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Profile Overview Card */}
      <div className="bg-white rounded-3xl border border-gray-200/80 p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div className="w-20 h-20 rounded-3xl bg-teal-50 text-teal-600 border border-teal-100 flex items-center justify-center text-4xl shadow-inner shrink-0">
          <FaUserCircle />
        </div>

        <div className="flex-1 text-center sm:text-left space-y-2">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h1 className="text-2xl font-black text-gray-900">{user?.name}</h1>
            {user?.verificationStatus === 'verified' ? (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                <FaCheckCircle className="text-emerald-500" /> Verified Member
              </span>
            ) : (
              <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                Pending Verification
              </span>
            )}
            <span className="text-[10px] font-extrabold uppercase bg-dark text-teal-300 px-2.5 py-0.5 rounded-full">
              Role: {user?.role}
            </span>
          </div>

          <p className="text-sm font-semibold text-gray-700 flex items-center justify-center sm:justify-start gap-1.5">
            <FaBuilding className="text-teal-600" /> {user?.companyName || 'Industrial Member'}
          </p>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-gray-500 pt-1">
            <span className="flex items-center gap-1"><FaEnvelope className="text-gray-400" /> {user?.email}</span>
            {user?.phone && <span className="flex items-center gap-1"><FaPhoneAlt className="text-gray-400" /> {user.phone}</span>}
            <span className="flex items-center gap-1"><FaMapMarkerAlt className="text-gray-400" /> {user?.city}, Gujarat</span>
          </div>
        </div>
      </div>

      {/* Environmental Contribution Badge */}
      <div className="bg-hero-gradient rounded-3xl p-6 text-white shadow-xl shadow-teal-900/10 flex flex-col sm:flex-row justify-between items-center gap-6 border border-teal-800/40">
        <div className="space-y-1 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-300">
            <FaLeaf className="text-teal-300" /> Verified Environmental Savings Badge
          </div>
          <h3 className="text-xl font-black text-white">Circular Waste Redirection</h3>
          <p className="text-xs text-teal-100/80 max-w-md">
            Tracked across all your completed commercial transactions on Fluxora.
          </p>
        </div>

        <div className="flex gap-4 text-center">
          <div className="bg-white/10 px-4 py-3 rounded-2xl backdrop-blur-xs border border-white/10">
            <span className="text-2xl font-black block text-white">
              {(impact.totalKgRecycled || 0).toLocaleString()} kg
            </span>
            <span className="text-[10px] uppercase font-bold text-teal-200">Waste Recycled</span>
          </div>

          <div className="bg-white/10 px-4 py-3 rounded-2xl backdrop-blur-xs border border-white/10">
            <span className="text-2xl font-black block text-amber-300">
              {(impact.totalCo2SavedKg || 0).toLocaleString()} kg
            </span>
            <span className="text-[10px] uppercase font-bold text-teal-200">CO₂ Saved</span>
          </div>
        </div>
      </div>

      {/* Edit Profile Form */}
      <div className="bg-white rounded-3xl border border-gray-200/80 p-6 sm:p-8 shadow-xs space-y-4">
        <h3 className="font-bold text-base text-gray-900">Update Profile Information</h3>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Company Name</label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Phone Number</label>
              <input
                type="tel"
                inputMode="numeric"
                maxLength={10}
                name="phone"
                autoComplete="off"
                placeholder="Enter 10-digit phone number"
                value={formData.phone}
                onChange={handlePhoneChange}
                onBlur={handlePhoneBlur}
                className={`w-full p-2.5 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 transition ${
                  phoneError ? 'border-red-400 focus:ring-red-400 bg-red-50/20' : 'border-gray-200 focus:ring-primary focus:bg-white'
                }`}
              />
              {phoneError && (
                <p className="text-[11px] text-red-500 mt-1 font-medium">{phoneError}</p>
              )}
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">City (Gujarat Hub)</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="py-3 px-6 bg-btn-primary hover:opacity-95 text-white font-bold rounded-xl transition cursor-pointer disabled:opacity-50 shadow-md shadow-teal-500/20"
          >
            {saving ? 'Updating...' : 'Save Profile Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
