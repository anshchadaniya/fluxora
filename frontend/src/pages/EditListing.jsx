import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import toast from 'react-hot-toast';

const EditListing = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    quantity: '',
    pricePerUnit: '',
    condition: 'clean',
    status: 'active',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const res = await API.get(`/listings/${id}`);
        if (res.data?.success) {
          const l = res.data.data;
          setFormData({
            title: l.title,
            description: l.description,
            quantity: l.quantity,
            pricePerUnit: l.pricePerUnit,
            condition: l.condition,
            status: l.status,
          });
        }
      } catch (err) {
        toast.error('Could not load listing');
      } finally {
        setLoading(false);
      }
    };
    fetchListing();
  }, [id]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await API.put(`/listings/${id}`, formData);
      if (res.data?.success) {
        toast.success('Listing updated successfully');
        navigate('/seller/listings');
      }
    } catch (err) {
      toast.error('Failed to update listing');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-xs">Loading listing...</div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-black text-gray-900">Edit Scrap Listing</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-3xl border border-gray-200 space-y-4 text-xs">
        <div>
          <label className="block font-semibold mb-1 text-gray-700">Title</label>
          <input
            type="text"
            required
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition"
          />
        </div>

        <div>
          <label className="block font-semibold mb-1 text-gray-700">Description</label>
          <textarea
            rows="3"
            required
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold mb-1 text-gray-700">Quantity</label>
            <input
              type="number"
              required
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1 text-gray-700">Price per Unit (₹)</label>
            <input
              type="number"
              required
              name="pricePerUnit"
              value={formData.pricePerUnit}
              onChange={handleChange}
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold mb-1 text-gray-700">Condition</label>
            <select
              name="condition"
              value={formData.condition}
              onChange={handleChange}
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition"
            >
              <option value="clean">Clean</option>
              <option value="mixed">Mixed</option>
              <option value="contaminated">Contaminated</option>
            </select>
          </div>
          <div>
            <label className="block font-semibold mb-1 text-gray-700">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition"
            >
              <option value="active">Active</option>
              <option value="sold">Sold</option>
              <option value="removed">Removed</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-3 bg-btn-primary hover:opacity-95 text-white font-bold rounded-xl shadow-md shadow-teal-500/20 transition cursor-pointer"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
};

export default EditListing;
