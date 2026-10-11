import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import {
  FaBoxes,
  FaHandshake,
  FaLeaf,
  FaPlusCircle,
  FaArrowRight,
  FaCheckCircle,
  FaChartBar,
} from 'react-icons/fa';

const SellerDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    activeListings: 0,
    pendingOffers: 0,
    completedDeals: 0,
    kgRecycled: 0,
    co2SavedKg: 0,
  });
  const [recentListings, setRecentListings] = useState([]);
  const [recentOffers, setRecentOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [listingsRes, offersRes, dealsRes, impactRes] = await Promise.all([
        API.get('/listings/mine'),
        API.get('/offers/received'),
        API.get('/deals'),
        API.get('/impact/me'),
      ]);

      const myListings = listingsRes.data?.data || [];
      const myOffers = offersRes.data?.data || [];
      const myDeals = dealsRes.data?.data || [];
      const myImpact = impactRes.data?.data || {};

      const activeListingsList = myListings.filter((l) => l.status === 'active');
      const totalRemainingKg = activeListingsList.reduce((acc, l) => acc + (Number(l.quantity) || 0), 0);
      const totalSoldKg = myDeals.reduce((acc, d) => acc + (Number(d.quantity) || 0), 0);

      setStats({
        activeListings: activeListingsList.length,
        totalRemainingKg,
        totalSoldKg,
        pendingOffers: myOffers.filter((o) => o.status === 'pending').length,
        completedDeals: myDeals.filter((d) => d.status === 'completed' || d.status === 'confirmed').length,
        kgRecycled: myImpact.totalKgRecycled || 0,
        co2SavedKg: myImpact.totalCo2SavedKg || 0,
      });

      setRecentListings(myListings.slice(0, 4));
      setRecentOffers(myOffers.slice(0, 4));
    } catch (err) {
      console.warn('Dashboard fetch error:', err.message);
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
              Welcome, {user?.name}
            </h1>
            {user?.verificationStatus === 'verified' && (
              <FaCheckCircle className="text-teal-300 text-lg" title="Verified Industrial Seller" />
            )}
          </div>
          <p className="text-xs sm:text-sm text-teal-100/80">
            {user?.companyName || 'Industrial Scrap Facility'} • {user?.city}, Gujarat
          </p>
        </div>

        <Link
          to="/seller/create-listing"
          className="bg-btn-accent hover:opacity-95 text-white font-bold px-5 py-3 rounded-2xl text-xs sm:text-sm shadow-md shadow-amber-500/20 transition flex items-center gap-2 cursor-pointer shrink-0"
        >
          <FaPlusCircle /> Create New Scrap Listing
        </Link>
      </div>

      {/* KPI Cards with colored left borders and soft gradient tints */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-gradient-to-br from-white to-teal-50/40 p-5 rounded-2xl border border-gray-200/80 border-l-4 border-l-teal-500 shadow-xs">
          <div className="flex justify-between items-center text-gray-400 mb-2">
            <span className="text-xs font-semibold uppercase text-gray-600">Remaining Stock</span>
            <FaBoxes className="text-teal-600 text-lg" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-gray-900">
            {stats.totalRemainingKg?.toLocaleString() || 0} <span className="text-xs sm:text-sm font-semibold text-teal-700">kg/units</span>
          </div>
          <p className="text-[11px] text-gray-500 mt-1 font-medium">
            Across {stats.activeListings} active marketplace lot{stats.activeListings === 1 ? '' : 's'}
          </p>
          <Link to="/seller/listings" className="text-[11px] font-semibold text-teal-600 hover:underline mt-2 block">
            Manage inventory →
          </Link>
        </div>

        <div className="bg-gradient-to-br from-white to-amber-50/40 p-5 rounded-2xl border border-gray-200/80 border-l-4 border-l-amber-500 shadow-xs">
          <div className="flex justify-between items-center text-gray-400 mb-2">
            <span className="text-xs font-semibold uppercase text-gray-600">Pending Bids</span>
            <FaHandshake className="text-amber-500 text-lg" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-gray-900">{stats.pendingOffers}</div>
          <Link to="/seller/offers" className="text-[11px] font-semibold text-amber-600 hover:underline mt-2 block">
            View offer inbox →
          </Link>
        </div>

        <div className="bg-gradient-to-br from-white to-cyan-50/40 p-5 rounded-2xl border border-gray-200/80 border-l-4 border-l-cyan-500 shadow-xs">
          <div className="flex justify-between items-center text-gray-400 mb-2">
            <span className="text-xs font-semibold uppercase text-gray-600">Deals Finalized</span>
            <FaChartBar className="text-cyan-600 text-lg" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-gray-900">{stats.completedDeals}</div>
          <p className="text-[11px] text-cyan-800 mt-1 font-semibold">
            {stats.totalSoldKg?.toLocaleString() || 0} kg goods sold
          </p>
          <Link to="/deals" className="text-[11px] font-semibold text-cyan-700 hover:underline mt-2 block">
            View deal slips →
          </Link>
        </div>

        <div className="bg-gradient-to-br from-teal-50 to-cyan-50 p-5 rounded-2xl border border-teal-200 border-l-4 border-l-teal-600 shadow-xs">
          <div className="flex justify-between items-center text-teal-700 mb-2">
            <span className="text-xs font-bold uppercase">CO₂ Saved</span>
            <FaLeaf className="text-teal-600 text-lg" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-teal-950">
            {stats.co2SavedKg.toLocaleString()} <span className="text-sm font-normal text-teal-700">kg</span>
          </div>
          <span className="text-[11px] text-teal-700 mt-2 block font-medium">
            Calculated LCA impact
          </span>
        </div>
      </div>

      {/* Tables: Recent Listings & Incoming Offers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Listings */}
        <div className="bg-white rounded-3xl border border-gray-200/80 p-6 shadow-xs space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-base text-gray-900">My Recent Listings</h3>
            <Link to="/seller/listings" className="text-xs font-semibold text-teal-600 hover:underline">
              View All
            </Link>
          </div>

          {recentListings.length === 0 ? (
            <p className="text-xs text-gray-400 py-6 text-center">No listings created yet.</p>
          ) : (
            <div className="space-y-3">
              {recentListings.map((l) => (
                <div key={l._id} className="p-3 bg-gray-50 rounded-xl flex items-center justify-between text-xs hover:bg-teal-50/30 transition">
                  <div className="space-y-1">
                    <h4 className="font-semibold text-gray-900 line-clamp-1">{l.title}</h4>
                    <div className="flex items-center gap-2">
                      <span className="text-teal-800 font-bold bg-teal-50 border border-teal-200 px-2 py-0.5 rounded text-[11px]">
                        Remaining: {l.quantity} {l.unit}
                      </span>
                      <span className="text-gray-500 text-[11px]">
                        Rate: ₹{l.pricePerUnit}/{l.unit}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full font-bold uppercase text-[10px] ${
                      l.status === 'active'
                        ? 'bg-emerald-100 text-emerald-800'
                        : l.status === 'sold'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {l.status === 'active' ? 'Active Stock' : l.status === 'sold' ? 'Sold Out' : l.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Incoming Offers */}
        <div className="bg-white rounded-3xl border border-gray-200/80 p-6 shadow-xs space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-base text-gray-900">Incoming Buyer Offers</h3>
            <Link to="/seller/offers" className="text-xs font-semibold text-teal-600 hover:underline">
              View Inbox
            </Link>
          </div>

          {recentOffers.length === 0 ? (
            <p className="text-xs text-gray-400 py-6 text-center">No offers received yet.</p>
          ) : (
            <div className="space-y-3">
              {recentOffers.map((o) => (
                <div key={o._id} className="p-3 bg-gray-50 rounded-xl flex items-center justify-between text-xs hover:bg-teal-50/30 transition">
                  <div>
                    <h4 className="font-semibold text-gray-900 line-clamp-1">{o.listing?.title}</h4>
                    <span className="text-gray-500">
                      Buyer: {o.buyer?.companyName || o.buyer?.name} • Bid: ₹{o.offeredPrice}
                    </span>
                  </div>
                  <Link
                    to="/seller/offers"
                    className="bg-btn-primary hover:opacity-95 text-white font-semibold px-3 py-1.5 rounded-lg text-[11px] shadow-sm transition"
                  >
                    Review
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;
