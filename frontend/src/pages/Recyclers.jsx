import { useState, useEffect } from 'react';
import API from '../api/axios';
import { FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaBuilding, FaFilter } from 'react-icons/fa';

const CITIES = ['All', 'Ahmedabad', 'Vadodara', 'Surat', 'Rajkot'];

const Recyclers = () => {
  const [recyclers, setRecyclers] = useState([]);
  const [cityFilter, setCityFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecyclers();
  }, [cityFilter]);

  const fetchRecyclers = async () => {
    setLoading(true);
    try {
      const res = await API.get('/recyclers', {
        params: { city: cityFilter.toLowerCase() === 'all' ? 'all' : cityFilter },
      });
      if (res.data?.success) {
        setRecyclers(res.data.data);
      }
    } catch (err) {
      console.warn('Failed to load recyclers:', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            Recyclers Directory
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Registered scrap dealers, smelters, and polymer reclaimers operating across Gujarat.
          </p>
        </div>

        {/* City Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-1 flex items-center gap-1">
            <FaFilter className="text-[10px]" /> Hub:
          </span>
          {CITIES.map((c) => (
            <button
              key={c}
              onClick={() => setCityFilter(c)}
              className={`text-xs px-3.5 py-1.5 rounded-full font-bold transition-all duration-300 cursor-pointer ${
                cityFilter === c
                  ? 'bg-btn-primary text-white shadow-md shadow-teal-500/25 ring-2 ring-teal-400/40'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-teal-700'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-44 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : recyclers.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 shadow-xs">
          <p className="text-slate-500 text-sm">No registered recyclers found for {cityFilter}.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {recyclers.map((r) => (
            <div
              key={r._id}
              className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:shadow-xl hover:scale-[1.02] hover:border-teal-400 transition-all duration-300 space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center text-lg shadow-inner">
                    <FaBuilding />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{r.companyName || r.name}</h3>
                    <span className="text-[11px] text-slate-500">Rep: {r.name}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <FaMapMarkerAlt className="text-slate-400 shrink-0" />
                  <span>{r.city}, Gujarat</span>
                </div>
                {r.phone && (
                  <div className="flex items-center gap-2">
                    <FaPhoneAlt className="text-slate-400 shrink-0" />
                    <span>{r.phone}</span>
                  </div>
                )}
                {r.email && (
                  <div className="flex items-center gap-2">
                    <FaEnvelope className="text-slate-400 shrink-0" />
                    <span className="truncate">{r.email}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Recyclers;
