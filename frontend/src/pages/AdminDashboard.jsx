import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import {
  FaUserShield,
  FaUsers,
  FaBoxes,
  FaHandshake,
  FaCheckCircle,
  FaBan,
  FaTrash,
} from 'react-icons/fa';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await API.get('/admin/stats');
      if (res.data?.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.warn('Failed to load admin stats:', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-hero-gradient p-6 sm:p-8 rounded-3xl text-white shadow-xl shadow-teal-900/10 border border-teal-800/40">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-300 bg-white/10 px-3 py-1 rounded-full mb-2">
            <FaUserShield /> System Administration Control Panel
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Admin Oversight Dashboard</h1>
          <p className="text-xs sm:text-sm text-teal-100/80 mt-0.5">
            Monitor industrial participants, verify KYC status, and moderate scrap listings.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <Link
            to="/admin/verify"
            className="bg-btn-accent hover:opacity-95 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-md shadow-amber-500/20 transition"
          >
            Verify Pending Users ({stats?.users?.pending || 0})
          </Link>
          <Link
            to="/admin/moderate"
            className="bg-btn-primary hover:opacity-95 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-md shadow-teal-500/20 transition"
          >
            Moderate Listings
          </Link>
        </div>
      </div>

      {/* Primary KPI Cards with colored left borders */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-gradient-to-br from-white to-teal-50/40 p-5 rounded-2xl border border-gray-200/80 border-l-4 border-l-teal-500 shadow-xs">
          <div className="flex justify-between items-center text-gray-400 mb-2">
            <span className="text-xs font-semibold uppercase text-gray-600">Total Users</span>
            <FaUsers className="text-teal-600 text-lg" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-gray-900">{stats?.users?.total || 0}</div>
          <span className="text-[11px] text-teal-600 font-semibold mt-2 block">
            {stats?.users?.verified || 0} Verified • {stats?.users?.pending || 0} Pending
          </span>
        </div>

        <div className="bg-gradient-to-br from-white to-amber-50/40 p-5 rounded-2xl border border-gray-200/80 border-l-4 border-l-amber-500 shadow-xs">
          <div className="flex justify-between items-center text-gray-400 mb-2">
            <span className="text-xs font-semibold uppercase text-gray-600">Scrap Listings</span>
            <FaBoxes className="text-amber-500 text-lg" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-gray-900">{stats?.listings?.total || 0}</div>
          <span className="text-[11px] text-amber-600 font-semibold mt-2 block">
            {stats?.listings?.active || 0} Active • {stats?.listings?.sold || 0} Sold
          </span>
        </div>

        <div className="bg-gradient-to-br from-white to-cyan-50/40 p-5 rounded-2xl border border-gray-200/80 border-l-4 border-l-cyan-500 shadow-xs">
          <div className="flex justify-between items-center text-gray-400 mb-2">
            <span className="text-xs font-semibold uppercase text-gray-600">Completed Deals</span>
            <FaHandshake className="text-cyan-600 text-lg" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-gray-900">{stats?.deals?.completed || 0}</div>
          <span className="text-[11px] text-cyan-700 font-medium mt-2 block">
            {stats?.deals?.total || 0} Total Initiated
          </span>
        </div>

        <div className="bg-gradient-to-br from-teal-50 to-cyan-50 p-5 rounded-2xl border border-teal-200 border-l-4 border-l-teal-600 shadow-xs">
          <div className="flex justify-between items-center text-teal-700 mb-2">
            <span className="text-xs font-bold uppercase">Total CO₂ Saved</span>
            <FaCheckCircle className="text-teal-600 text-lg" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-teal-950">
            {(stats?.impact?.totalCo2SavedKg || 0).toLocaleString()} <span className="text-sm font-normal">kg</span>
          </div>
          <span className="text-[11px] text-teal-700 font-semibold mt-2 block">
            {(stats?.impact?.totalKgRecycled || 0).toLocaleString()} kg recycled
          </span>
        </div>
      </div>

      {/* Category Distribution Chart */}
      <div className="bg-white rounded-3xl border border-gray-200/80 p-6 shadow-xs space-y-4">
        <h3 className="font-bold text-base text-gray-900">
          Listings Breakdown by Scrap Category
        </h3>

        <div className="h-72 w-full pt-4">
          {loading ? (
            <div className="h-full bg-gray-50 rounded-2xl animate-pulse" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.categoryDistribution || []} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="category" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0B1220',
                    borderRadius: '12px',
                    color: '#fff',
                    border: '1px solid #1e293b',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" fill="#0D9488" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
