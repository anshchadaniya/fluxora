import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import toast from 'react-hot-toast';
import { FaTrash, FaCheck, FaEye } from 'react-icons/fa';

const ModerateListings = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminListings();
  }, []);

  const fetchAdminListings = async () => {
    try {
      const res = await API.get('/admin/listings');
      if (res.data?.success) {
        setListings(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load listings for moderation');
    } finally {
      setLoading(false);
    }
  };

  const handleModerate = async (id) => {
    try {
      const res = await API.put(`/admin/listings/${id}/remove`);
      if (res.data?.success) {
        toast.success(res.data.message);
        fetchAdminListings();
      }
    } catch (err) {
      toast.error('Moderation failed');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
          Scrap Listing Moderation
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
          Review, remove or restore published marketplace lots.
        </p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-gray-400">Loading listings...</div>
      ) : listings.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-gray-200 p-8 shadow-xs">
          <p className="text-gray-500 text-sm">No listings found in the database.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 font-semibold uppercase text-[10px] tracking-wider border-b border-gray-100">
                <tr>
                  <th className="p-4">Title</th>
                  <th className="p-4">Seller Company</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Moderation Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {listings.map((l) => (
                  <tr key={l._id} className="hover:bg-teal-50/20 transition">
                    <td className="p-4 font-bold text-gray-900 max-w-xs truncate">
                      <Link to={`/listing/${l._id}`} className="hover:text-teal-600 transition">
                        {l.title}
                      </Link>
                    </td>
                    <td className="p-4 text-gray-600 font-medium">
                      {l.seller?.companyName || l.seller?.name || '—'}
                    </td>
                    <td className="p-4 capitalize text-gray-600">{l.category}</td>
                    <td className="p-4 font-black text-gray-900">
                      ₹{l.pricePerUnit}/{l.unit}
                    </td>
                    <td className="p-4">
                      <span
                        className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                          l.status === 'active'
                            ? 'bg-emerald-100 text-emerald-800'
                            : l.status === 'sold'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {l.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleModerate(l._id)}
                        className={`font-bold px-3 py-1.5 rounded-lg text-[11px] transition cursor-pointer shadow-sm ${
                          l.status === 'removed'
                            ? 'bg-btn-primary text-white hover:opacity-95'
                            : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                        }`}
                      >
                        {l.status === 'removed' ? 'Restore Active' : 'Remove Listing'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModerateListings;
