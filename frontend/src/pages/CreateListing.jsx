import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import PriceEstimator from '../components/PriceEstimator';
import toast from 'react-hot-toast';
import {
  FaRobot,
  FaUpload,
  FaMapMarkerAlt,
  FaIndustry,
  FaTimes,
  FaTrash,
} from 'react-icons/fa';

const CITIES = [
  { name: 'Ahmedabad', lat: 23.0225, lng: 72.5714 },
  { name: 'Vadodara', lat: 22.3072, lng: 73.1812 },
  { name: 'Surat', lat: 21.1702, lng: 72.8311 },
  { name: 'Rajkot', lat: 22.3039, lng: 70.8022 },
];

const CATEGORIES = [
  { id: 'metal', label: 'Metal & Alloys' },
  { id: 'plastic', label: 'Industrial Plastic' },
  { id: 'cardboard', label: 'Cardboard & Paper' },
  { id: 'ewaste', label: 'E-Waste & Electronics' },
  { id: 'paper', label: 'Paper & Shreds' },
  { id: 'other', label: 'Other Waste' },
];

const CreateListing = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'metal',
    subCategory: '',
    quantity: '',
    unit: 'kg',
    pricePerUnit: '',
    condition: 'clean',
    city: 'Vadodara',
    lat: 22.3072,
    lng: 73.1812,
  });

  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [classifying, setClassifying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [aiReasoning, setAiReasoning] = useState(null);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCityChange = (e) => {
    const cityName = e.target.value;
    const cityObj = CITIES.find((c) => c.name === cityName) || CITIES[0];
    setFormData((prev) => ({
      ...prev,
      city: cityName,
      lat: cityObj.lat,
      lng: cityObj.lng,
    }));
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      // If user uploads a 2nd image, the 1st one is automatically removed and 2nd one remains
      const file = e.target.files[0];
      setImages([file]);
      setImagePreviews([URL.createObjectURL(file)]);
    }
  };

  const handleRemoveImage = () => {
    setImages([]);
    setImagePreviews([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // AI Classification Feature
  const handleAIClassify = async () => {
    const text = `${formData.title} ${formData.description}`.trim();
    if (!text) {
      toast.error('Please enter a listing title or short description to classify');
      return;
    }

    setClassifying(true);
    setAiReasoning(null);
    try {
      const res = await API.post('/ai/classify', { text });
      if (res.data?.success) {
        const c = res.data.data;
        setFormData((prev) => ({
          ...prev,
          category: c.category || prev.category,
          subCategory: c.subCategory || prev.subCategory,
          condition: c.condition || prev.condition,
          unit: c.unit || prev.unit,
          quantity: c.quantity ? String(c.quantity) : prev.quantity,
        }));
        if (c.reasoning) {
          setAiReasoning({
            reasoning: c.reasoning,
            source: c.source || 'llama-3.3-70b',
          });
        }
        toast.success(`AI Classified as ${c.category.toUpperCase()} (${c.subCategory})!`);
      }
    } catch (err) {
      toast.error('Could not auto-classify text');
    } finally {
      setClassifying(false);
    }
  };

  const validateAllFields = () => {
    if (!formData.title || !formData.title.trim()) {
      toast.error('Please enter the listing title');
      return false;
    }
    if (!formData.description || !formData.description.trim()) {
      toast.error('Please enter the detailed lot description');
      return false;
    }
    if (!formData.category || !formData.category.trim()) {
      toast.error('Please select a material category');
      return false;
    }
    if (!formData.subCategory || !formData.subCategory.trim()) {
      toast.error('Please enter the sub-type / alloy');
      return false;
    }
    if (!formData.condition || !formData.condition.trim()) {
      toast.error('Please select the contamination grade');
      return false;
    }
    if (!formData.quantity || String(formData.quantity).trim() === '') {
      toast.error('Please enter the quantity');
      return false;
    }
    const qtyNum = Number(formData.quantity);
    if (isNaN(qtyNum) || !Number.isInteger(qtyNum) || qtyNum <= 0) {
      toast.error('Quantity must be a positive whole number greater than 0');
      return false;
    }
    if (!formData.unit || !formData.unit.trim()) {
      toast.error('Please select the unit');
      return false;
    }
    if (!formData.pricePerUnit || String(formData.pricePerUnit).trim() === '') {
      toast.error('Please enter the asking price');
      return false;
    }
    const priceNum = Number(formData.pricePerUnit);
    if (isNaN(priceNum) || priceNum <= 0) {
      toast.error('Asking price per unit must be a positive number greater than 0');
      return false;
    }
    if (!formData.city || !formData.city.trim()) {
      toast.error('Please select an industrial city location');
      return false;
    }
    if (!images || images.length === 0) {
      toast.error('Please upload an image of the scrap');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateAllFields()) {
      return;
    }

    setLoading(true);

    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      data.append(key, formData[key]);
    });

    images.forEach((img) => {
      data.append('images', img);
    });

    try {
      const res = await API.post('/listings', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data?.success) {
        toast.success('Scrap lot listed successfully!');
        navigate('/seller/dashboard');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to publish listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <div className="flex items-center gap-2 text-xs font-bold text-teal-700 uppercase tracking-wider mb-1">
          <FaIndustry /> Scrap Dispatch Portal
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
          Create New Scrap Listing
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
          List factory offcuts, redundant equipment, or bulk recyclable packaging for Gujarat recyclers.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-6 text-xs">
        {/* Step 1: Material Details & AI Classifier */}
        <div className="bg-white rounded-3xl border border-gray-200/80 p-6 shadow-xs space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-sm text-gray-900">1. Material Description</h3>
            <button
              type="button"
              onClick={handleAIClassify}
              disabled={classifying}
              className="bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold px-3 py-1.5 rounded-xl border border-teal-200 flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
              title="Auto-fill categories and specifications using AI analysis"
            >
              <FaRobot className="text-teal-600" />
              {classifying ? 'Analyzing with LLaMA...' : 'AI Auto-Classify'}
            </button>
          </div>

          {aiReasoning && (
            <div className="bg-violet-50/90 border border-violet-200/80 rounded-2xl p-3 text-xs text-violet-900 flex items-start gap-2.5 shadow-xs">
              <div className="w-6 h-6 rounded-lg bg-violet-200 text-violet-800 flex items-center justify-center shrink-0 text-xs font-bold">
                <FaRobot />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-violet-950">AI Material Classification</span>
                  <span className="text-[10px] bg-violet-200/70 text-violet-800 px-1.5 py-0.2 rounded font-semibold uppercase">
                    {aiReasoning.source === 'llama-3.3-70b' ? 'Meta LLaMA 3.3 70B' : 'Rule-Based Engine'}
                  </span>
                </div>
                <p className="text-[11px] text-violet-800 leading-relaxed">
                  {aiReasoning.reasoning}
                </p>
              </div>
            </div>
          )}

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Listing Title</label>
            <input
              type="text"
              name="title"
              placeholder="e.g. Clean Copper Busbar Offcuts & Machine Wiring"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Detailed Lot Description</label>
            <textarea
              rows="3"
              name="description"
              placeholder="e.g. 99% pure unalloyed copper cables from CNC retrofit. Palletized and dry stored indoors."
              value={formData.description}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Material Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full py-2.5 px-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-800 focus:ring-2 focus:ring-primary focus:bg-white transition"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Sub-Type / Alloy</label>
              <input
                type="text"
                name="subCategory"
                placeholder="e.g. Copper Grade A"
                value={formData.subCategory}
                onChange={handleChange}
                className="w-full py-2.5 px-3.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:ring-2 focus:ring-primary focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Contamination Grade</label>
              <select
                name="condition"
                value={formData.condition}
                onChange={handleChange}
                className="w-full py-2.5 px-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-800 focus:ring-2 focus:ring-primary focus:bg-white transition"
              >
                <option value="clean">Clean (Sorted, zero foreign debris)</option>
                <option value="mixed">Mixed (Multiple scrap sub-types)</option>
                <option value="contaminated">Contaminated (Grease, dust, rust)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Step 2: Quantity, Pricing & AI Price Estimator */}
        <div className="bg-white rounded-3xl border border-gray-200/80 p-6 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-gray-900">2. Quantity & Fair Price Suggestion</h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Quantity</label>
              <input
                type="number"
                step="1"
                min="1"
                name="quantity"
                placeholder="e.g. 500"
                value={formData.quantity}
                onChange={handleChange}
                className="w-full py-2.5 px-3.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:ring-2 focus:ring-primary focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Unit</label>
              <select
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                className="w-full py-2.5 px-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-800 focus:ring-2 focus:ring-primary focus:bg-white transition"
              >
                <option value="kg">Kilograms (kg)</option>
                <option value="ton">Metric Tons (ton)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Asking Price per {formData.unit} (₹)
              </label>
              <input
                type="number"
                step="any"
                min="0.01"
                name="pricePerUnit"
                placeholder="e.g. 450.50"
                value={formData.pricePerUnit}
                onChange={handleChange}
                className="w-full py-2.5 px-3.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-black text-gray-900 focus:ring-2 focus:ring-primary focus:bg-white transition"
              />
            </div>
          </div>

          {/* Embedded AI Price Estimator Component */}
          <PriceEstimator
            category={formData.category}
            subCategory={formData.subCategory}
            quantity={formData.quantity}
            unit={formData.unit}
            condition={formData.condition}
            onApplyPrice={(price) => setFormData((prev) => ({ ...prev, pricePerUnit: String(price) }))}
          />
        </div>

        {/* Step 3: Yard Location & Photos */}
        <div className="bg-white rounded-3xl border border-gray-200/80 p-6 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-gray-900">3. Yard Location & Scrap Photos</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Industrial City / Hub</label>
              <div className="relative">
                <FaMapMarkerAlt className="absolute left-3.5 top-3.5 text-gray-400" />
                <select
                  name="city"
                  value={formData.city}
                  onChange={handleCityChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-800 focus:ring-2 focus:ring-primary transition"
                >
                  {CITIES.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name}, Gujarat
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Upload Scrap Photo
              </label>
              <label className="w-full py-2.5 px-4 bg-gray-50 hover:bg-gray-100 border border-dashed border-gray-300 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition text-gray-600 font-semibold">
                <FaUpload /> {imagePreviews.length > 0 ? 'Change Photo' : 'Choose Photo'}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="sr-only"
                />
              </label>
            </div>
          </div>

          {/* Photo Previews with Delete (Cross) button */}
          {imagePreviews.length > 0 && (
            <div className="pt-2">
              <span className="text-[11px] font-medium text-gray-500 block mb-2">
                Uploaded Photo Preview (Click cross button to delete, or choose another photo to replace):
              </span>
              <div className="flex gap-3 overflow-x-auto">
                {imagePreviews.map((src, i) => (
                  <div
                    key={i}
                    className="relative w-28 h-28 rounded-2xl overflow-hidden border-2 border-teal-500/80 shadow-md shrink-0 group"
                  >
                    <img src={src} alt="Uploaded scrap preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-1.5 right-1.5 bg-red-600/95 hover:bg-red-700 text-white w-6 h-6 rounded-full shadow-lg transition duration-200 cursor-pointer flex items-center justify-center hover:scale-110"
                      title="Delete uploaded image"
                      aria-label="Delete uploaded image"
                    >
                      <FaTimes className="text-xs" />
                    </button>
                    <div className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[9px] text-center py-0.5 truncate px-1">
                      Ready to upload
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-btn-accent hover:opacity-95 text-white rounded-2xl font-bold text-sm shadow-xl shadow-amber-500/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {loading ? 'Publishing Scrap Lot...' : 'Publish Scrap Listing to Marketplace'}
        </button>
      </form>
    </div>
  );
};

export default CreateListing;
