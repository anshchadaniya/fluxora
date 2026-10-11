import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import ListingCard from '../components/ListingCard';
import {
  FaSearch,
  FaHandshake,
  FaLeaf,
  FaCheckCircle,
  FaIndustry,
  FaArrowRight,
} from 'react-icons/fa';

const BuyerDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    sentOffers: 0,
    acceptedDeals: 0,
    kgPurchased: 0,
    co2SavedKg: 0,
  });
  const [scrapLots, setScrapLots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBuyerData();
  }, []);

  const fetchBuyerData = async () => {
    try {
      const [offersRes, dealsRes, impactRes, listingsRes] = await Promise.all([
        API.get('/offers/sent'),
        API.get('/deals'),
        API.get('/impact/me'),
        API.get('/listings', { params: { limit: 6, sort: 'newest' } }),
      ]);

      const myOffers = offersRes.data?.data || [];
      const myDeals = dealsRes.data?.data || [];
      const myImpact = impactRes.data?.data || {};

      setStats({
        sentOffers: myOffers.length,
        acceptedDeals: myDeals.filter((d) => d.status === 'completed').length,
        kgPurchased: myImpact.totalKgRecycled || 0,
        co2SavedKg: myImpact.totalCo2SavedKg || 0,
      });

      setScrapLots(listingsRes.data?.data || []);
    } catch (err) {
      console.warn('Buyer dashboard error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-hero-gradient rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-teal-900/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border border-teal-800/40">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              Buyer Portal: {user?.name}
            </h1>
            {user?.verificationStatus === 'verified' && (
              <FaCheckCircle className="text-teal-300 text-lg" title="Verified Recycler" />
            )}
          </div>
          <p className="text-xs sm:text-sm text-teal-100/80">
            {user?.companyName || 'Scrap Recovery & Smelting Partner'} • {user?.city}, Gujarat
          </p>
        </div>

        <Link
          to="/marketplace"
          className="bg-btn-accent hover:opacity-95 text-white font-bold px-5 py-3 rounded-2xl text-xs sm:text-sm shadow-md shadow-amber-500/20 transition flex items-center gap-2 cursor-pointer shrink-0"
        >
          <FaSearch /> Search All Marketplace Lots
        </Link>
      </div>

      {/* KPI Cards with colored left borders and soft gradient tints */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-gradient-to-br from-white to-teal-50/40 p-5 rounded-2xl border border-gray-200/80 border-l-4 border-l-teal-500 shadow-xs">
          <div className="flex justify-between items-center text-gray-400 mb-2">
            <span className="text-xs font-semibold uppercase text-gray-600">Offers Placed</span>
            <FaHandshake className="text-teal-600 text-lg" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-gray-900">{stats.sentOffers}</div>
          <Link to="/buyer/offers" className="text-[11px] font-semibold text-teal-600 hover:underline mt-2 block">
            Track proposals →
          </Link>
        </div>

        <div className="bg-gradient-to-br from-white to-cyan-50/40 p-5 rounded-2xl border border-gray-200/80 border-l-4 border-l-cyan-500 shadow-xs">
          <div className="flex justify-between items-center text-gray-400 mb-2">
            <span className="text-xs font-semibold uppercase text-gray-600">Deals Completed</span>
            <FaCheckCircle className="text-cyan-600 text-lg" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-gray-900">{stats.acceptedDeals}</div>
          <Link to="/deals" className="text-[11px] font-semibold text-cyan-700 hover:underline mt-2 block">
            View transaction slips →
          </Link>
        </div>

        <div className="bg-gradient-to-br from-white to-amber-50/40 p-5 rounded-2xl border border-gray-200/80 border-l-4 border-l-amber-500 shadow-xs">
          <div className="flex justify-between items-center text-gray-400 mb-2">
            <span className="text-xs font-semibold uppercase text-gray-600">Recycled Volume</span>
            <FaLeaf className="text-amber-500 text-lg" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-gray-900">
            {stats.kgPurchased.toLocaleString()} <span className="text-sm font-normal text-gray-500">kg</span>
          </div>
          <span className="text-[11px] text-gray-500 mt-2 block">Recovered material</span>
        </div>

        <div className="bg-gradient-to-br from-teal-50 to-cyan-50 p-5 rounded-2xl border border-teal-200 border-l-4 border-l-teal-600 shadow-xs">
          <div className="flex justify-between items-center text-teal-700 mb-2">
            <span className="text-xs font-bold uppercase">CO₂ Abated</span>
            <FaLeaf className="text-teal-600 text-lg" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-teal-950">
            {stats.co2SavedKg.toLocaleString()} <span className="text-sm font-normal text-teal-700">kg</span>
          </div>
          <span className="text-[11px] text-teal-700 mt-2 block font-medium">LCA carbon offset</span>
        </div>
      </div>

      {/* Scrap Lots Section */}
      <div className="bg-white rounded-3xl border border-gray-200/80 p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <FaIndustry className="text-teal-600 text-lg" />
            <h3 className="font-bold text-base text-gray-900">
              Scrap Lots
            </h3>
          </div>

          <Link
            to="/marketplace"
            className="text-xs font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1.5 transition"
          >
            Browse all scrap lots <FaArrowRight className="text-[10px]" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-slate-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : scrapLots.length === 0 ? (
          <p className="text-xs text-gray-400 py-8 text-center">
            No scrap lots available at the moment.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {scrapLots.map((listing) => (
              <ListingCard key={listing._id} listing={listing} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BuyerDashboard;
