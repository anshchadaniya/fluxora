import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import toast from 'react-hot-toast';
import { FaPlus, FaEdit, FaTrash, FaBoxes } from 'react-icons/fa';

const MyListings = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyListings();
  }, []);

  const fetchMyListings = async () => {
    try {
      const res = await API.get('/listings/mine');
      if (res.data?.success) {
        setListings(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load listings');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to mark this listing as removed?')) return;
    try {
      const res = await API.delete(`/listings/${id}`);
      if (res.data?.success) {
        toast.success('Listing marked as removed');
        setListings((prev) => prev.map((l) => (l._id === id ? { ...l, status: 'removed' } : l)));
      }
    } catch (err) {
      toast.error('Could not remove listing');
    }
  };

  const totalActiveStock = listings
    .filter((l) => l.status === 'active')
    .reduce((sum, l) => sum + (Number(l.quantity) || 0), 0);
  const activeCount = listings.filter((l) => l.status === 'active').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            My Scrap Listings
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Manage your industrial scrap inventory, track remaining weights, and monitor deal status.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 bg-teal-50 border border-teal-200 px-3 py-2 rounded-xl text-xs font-semibold text-teal-900">
            <FaBoxes className="text-teal-600" />
            <span>Available Stock:</span>
            <span className="font-black text-teal-700">{totalActiveStock.toLocaleString()} kg</span>
            <span className="text-gray-500">({activeCount} active)</span>
          </div>

          <Link
            to="/seller/create-listing"
            className="bg-btn-accent hover:opacity-95 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition shadow-md shadow-amber-500/20 cursor-pointer"
          >
            <FaPlus /> + Create New Listing
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-gray-400">Loading listings...</div>
      ) : listings.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-gray-200 p-8 shadow-xs">
          <p className="text-gray-500 text-sm mb-3">You have not posted any scrap listings yet.</p>
          <Link
            to="/seller/create-listing"
            className="text-xs bg-btn-accent hover:opacity-95 text-white font-bold px-5 py-2.5 rounded-xl inline-block shadow-md shadow-amber-500/20"
          >
            Create Your First Listing
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 font-semibold uppercase text-[10px] tracking-wider border-b border-gray-100">
                <tr>
                  <th className="p-4">Material Title</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Remaining Stock</th>
                  <th className="p-4">Original Rate</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
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
                    <td className="p-4 capitalize text-gray-600">{l.category}</td>
                    <td className="p-4">
                      <span className="font-black text-gray-900 text-sm">
                        {l.quantity} {l.unit}
                      </span>
                      {l.status === 'active' && (
                        <span className="block text-[10px] text-teal-700 font-semibold">available for bids</span>
                      )}
                    </td>
                    <td className="p-4 font-black text-gray-900">
                      ₹{l.pricePerUnit}/{l.unit}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-full font-bold uppercase text-[10px] ${
                          l.status === 'active'
                            ? 'bg-emerald-100 text-emerald-800'
                            : l.status === 'sold'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {l.status === 'active' ? 'Active Stock' : l.status === 'sold' ? 'Sold Out' : l.status}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <Link
                        to={`/seller/edit-listing/${l._id}`}
                        className="text-gray-500 hover:text-teal-600 p-1.5 inline-block transition"
                        title="Edit"
                      >
                        <FaEdit />
                      </Link>
                      {l.status !== 'removed' && (
                        <button
                          onClick={() => handleDelete(l._id)}
                          className="text-gray-400 hover:text-red-600 p-1.5 inline-block cursor-pointer transition"
                          title="Remove"
                        >
                          <FaTrash />
                        </button>
                      )}
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

export default MyListings;
