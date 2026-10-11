import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import API from '../api/axios';
import FilterBar from '../components/FilterBar';
import ListingCard from '../components/ListingCard';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const Marketplace = () => {
  const [searchParams] = useSearchParams();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  // Ensure any previous dark mode class is cleaned up
  useEffect(() => {
    document.documentElement.classList.remove('dark');
    localStorage.removeItem('theme');
  }, []);

  // Filters state initialized from query params
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || 'all',
    condition: searchParams.get('condition') || 'all',
    city: searchParams.get('city') || 'all',
    maxPrice: searchParams.get('maxPrice') || '',
    sort: searchParams.get('sort') || 'newest',
    page: parseInt(searchParams.get('page'), 10) || 1,
  });

  const [aiSummary, setAiSummary] = useState(null);

  useEffect(() => {
    fetchListings();
  }, [filters]);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const params = {
        page: filters.page,
        limit: 12,
        sort: filters.sort,
      };
      if (filters.search) params.search = filters.search;
      if (filters.category && filters.category !== 'all') params.category = filters.category;
      if (filters.condition && filters.condition !== 'all') params.condition = filters.condition;
      if (filters.city && filters.city !== 'all') params.city = filters.city;
      if (filters.maxPrice) params.maxPrice = filters.maxPrice;

      const res = await API.get('/listings', { params });
      if (res.data?.success) {
        setListings(res.data.data);
        setPagination({
          page: res.data.page,
          pages: res.data.pages,
          total: res.data.total,
        });
      }
    } catch (err) {
      console.warn('Failed to load listings:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      category: 'all',
      condition: 'all',
      city: 'all',
      maxPrice: '',
      sort: 'newest',
      page: 1,
    });
    setAiSummary(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Title */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
          Industrial Scrap Marketplace
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Discover verified surplus material, offcuts, and recycling lots from industries across Gujarat.
        </p>
      </div>

      {/* Filter Bar */}
      <FilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
        aiSummary={aiSummary}
        setAiSummary={setAiSummary}
      />

      {/* Status summary */}
      <div className="flex justify-between items-center text-xs text-slate-500 mb-4 px-1">
        <span>
          Showing <b className="text-slate-900">{listings.length}</b> of{' '}
          <b className="text-slate-900">{pagination.total}</b> active scrap lots
        </span>
      </div>

      {/* Loading Skeleton */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-80 bg-slate-200/70 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : listings.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 shadow-xs">
          <div className="text-5xl mb-3">🔍</div>
          <h3 className="text-base font-bold text-slate-900 mb-1">No scrap listings found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
            No active lots match your filters. Try clearing your search keyword or selecting "All Materials".
          </p>
          <button
            onClick={handleResetFilters}
            className="bg-btn-primary hover:shadow-teal-500/25 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-md transition-all duration-300 cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {listings.map((listing) => (
            <ListingCard key={listing._id} listing={listing} />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {pagination.pages > 1 && (
        <div className="flex justify-center items-center gap-3 mt-10">
          <button
            disabled={filters.page <= 1}
            onClick={() => handleFilterChange({ page: filters.page - 1 })}
            className="p-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 transition cursor-pointer"
          >
            <FaChevronLeft className="text-xs" />
          </button>

          <span className="text-xs font-semibold text-gray-700">
            Page {pagination.page} of {pagination.pages}
          </span>

          <button
            disabled={filters.page >= pagination.pages}
            onClick={() => handleFilterChange({ page: filters.page + 1 })}
            className="p-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 transition cursor-pointer"
          >
            <FaChevronRight className="text-xs" />
          </button>
        </div>
      )}
    </div>
  );
};

export default Marketplace;
