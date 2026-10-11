import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FaHandshake, FaCheckCircle, FaLeaf } from 'react-icons/fa';

const Deals = () => {
  const { user, isSeller, isAdmin } = useAuth();
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusTab, setStatusTab] = useState('all'); // 'all', 'confirmed', 'completed'

  useEffect(() => {
    fetchDeals();
  }, []);

  const fetchDeals = async () => {
    try {
      const res = await API.get('/deals');
      if (res.data?.success) {
        setDeals(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load transaction deals');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteDeal = async (dealId) => {
    try {
      const res = await API.put(`/deals/${dealId}/complete`);
      if (res.data?.success) {
        toast.success('Deal marked as Completed! CO₂ savings recorded.');
        fetchDeals();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not complete deal');
    }
  };

  const filteredDeals = deals.filter((d) => {
    if (statusTab === 'all') return true;
    return d.status === statusTab;
  });

  const tabList = [
    { id: 'all', label: 'All Deals', count: deals.length },
    { id: 'confirmed', label: 'Confirmed Dispatch', count: deals.filter((d) => d.status === 'confirmed').length },
    { id: 'completed', label: 'Completed & Audited', count: deals.filter((d) => d.status === 'completed').length },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            Commercial Scrap Deals & Dispatch Records
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Confirmed B2B transactions and verified circular environmental impact certificates.
          </p>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 overflow-x-auto pb-1 scrollbar-none">
        {tabList.map((tab) => {
          const isActive = statusTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setStatusTab(tab.id)}
              className={`px-4 py-2 rounded-t-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
                isActive
                  ? 'text-teal-700 bg-teal-50 border-teal-600 shadow-xs'
                  : 'text-gray-600 border-transparent hover:text-teal-700 hover:bg-gray-50'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                  isActive ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-gray-400">Loading deals...</div>
      ) : filteredDeals.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-gray-200 p-8 shadow-xs">
          <FaHandshake className="text-4xl text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">No {statusTab === 'all' ? '' : statusTab} transaction deals found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredDeals.map((deal) => {
            const isCompleted = deal.status === 'completed';
            const canComplete = (isSeller || isAdmin) && !isCompleted;

            return (
              <div
                key={deal._id}
                className="bg-white rounded-3xl border border-gray-200/80 p-6 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition duration-300"
              >
                <div>
                  <div className="flex justify-between items-start gap-2 mb-3">
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                        isCompleted
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {deal.status}
                    </span>
                    <span className="text-[11px] text-gray-400 font-mono">
                      Ref: #{deal._id.slice(-6).toUpperCase()}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-gray-900 line-clamp-1">
                    {deal.listing?.title || 'Scrap Material Lot'}
                  </h3>

                  {/* Parties & Amounts */}
                  <div className="grid grid-cols-2 gap-3 bg-gray-50 p-3.5 rounded-2xl text-xs mt-3">
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-gray-400 block">Seller</span>
                      <span className="font-bold text-gray-800 truncate block">
                        {deal.seller?.companyName || deal.seller?.name}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-semibold text-gray-400 block">Buyer / Recycler</span>
                      <span className="font-bold text-gray-800 truncate block">
                        {deal.buyer?.companyName || deal.buyer?.name}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-semibold text-gray-400 block">Agreed Rate</span>
                      <span className="font-black text-gray-900">
                        ₹{deal.finalPrice} / {deal.listing?.unit || 'kg'}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-semibold text-gray-400 block">Total Volume</span>
                      <span className="font-bold text-gray-800">
                        {deal.quantity} {deal.listing?.unit || 'kg'}
                      </span>
                    </div>
                  </div>

                  {/* Environmental Impact Certificate Pill */}
                  <div className="mt-3 bg-teal-50/80 border border-teal-200/80 p-3 rounded-2xl text-xs flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center text-sm shrink-0">
                        <FaLeaf />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-teal-800 block">
                          Verified CO₂ Savings
                        </span>
                        <span className="font-black text-teal-950 text-sm">
                          {deal.impact?.co2SavedKg || 0} kg CO₂ Abated
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] text-teal-700 font-bold uppercase tracking-wider">
                      {isCompleted ? '✓ Audited' : 'Estimated'}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-3">
                  <span className="text-[11px] text-gray-400">
                    Created: {new Date(deal.createdAt).toLocaleDateString()}
                  </span>

                  {canComplete && (
                    <button
                      onClick={() => handleCompleteDeal(deal._id)}
                      className="bg-btn-primary hover:opacity-95 text-white text-xs font-bold px-4 py-2 rounded-xl transition flex items-center gap-1.5 shadow-md shadow-teal-500/20 cursor-pointer"
                    >
                      <FaCheckCircle /> Mark Deal Completed
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Deals;
