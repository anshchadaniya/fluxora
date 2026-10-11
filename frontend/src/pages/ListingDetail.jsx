import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
  FaCheckCircle,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaEnvelope,
  FaRobot,
  FaHandshake,
  FaArrowLeft,
  FaExternalLinkAlt,
  FaBuilding,
  FaShieldAlt,
} from 'react-icons/fa';

const ListingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);

  // Make Offer Modal State
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offeredPrice, setOfferedPrice] = useState('');
  const [offerQuantity, setOfferQuantity] = useState('');
  const [offerMessage, setOfferMessage] = useState('');
  const [submittingOffer, setSubmittingOffer] = useState(false);

  useEffect(() => {
    fetchListing();
  }, [id]);

  const fetchListing = async () => {
    try {
      const res = await API.get(`/listings/${id}`);
      if (res.data?.success) {
        setListing(res.data.data);
        setOfferedPrice(res.data.data.pricePerUnit);
        setOfferQuantity(res.data.data.quantity);
      }
    } catch (err) {
      toast.error('Listing not found or removed');
    } finally {
      setLoading(false);
    }
  };

  const handleMakeOffer = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please login to submit an offer');
      navigate('/login');
      return;
    }

    if (listing.seller?._id === user?._id) {
      toast.error('You cannot make an offer on your own listing');
      return;
    }

    const qtyNum = Number(offerQuantity);
    if (!qtyNum || qtyNum <= 0) {
      toast.error('Please enter a valid quantity greater than 0');
      return;
    }

    if (qtyNum > listing.quantity) {
      toast.error(`Offered quantity cannot exceed available stock of ${listing.quantity} ${listing.unit}`);
      return;
    }

    setSubmittingOffer(true);
    try {
      const res = await API.post('/offers', {
        listingId: listing._id,
        offeredPrice: Number(offeredPrice),
        quantity: qtyNum,
        message: offerMessage,
      });

      if (res.data?.success) {
        toast.success('Offer submitted to seller successfully!');
        setShowOfferModal(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit offer');
    } finally {
      setSubmittingOffer(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="max-w-3xl mx-auto py-20 text-center">
        <h2 className="text-xl font-bold text-gray-800">Scrap Listing Not Found</h2>
        <Link to="/marketplace" className="mt-4 inline-block text-primary-600 font-semibold hover:underline">
          Return to Marketplace
        </Link>
      </div>
    );
  }

  const isOwner = user?._id === listing.seller?._id;
  const lat = listing.location?.lat || 23.0225;
  const lng = listing.location?.lng || 72.5714;
  const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;

  const hasEstimate = listing.estimatedPrice && listing.estimatedPrice > 0;
  const priceDiffPct = hasEstimate
    ? Math.round(((listing.pricePerUnit - listing.estimatedPrice) / listing.estimatedPrice) * 100)
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button */}
      <Link
        to="/marketplace"
        className="inline-flex items-center gap-2 text-xs font-semibold text-gray-600 hover:text-primary-600 transition"
      >
        <FaArrowLeft /> Back to Marketplace
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Photos & Details (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Photo Gallery */}
          <div className="bg-white rounded-3xl border border-gray-200/80 p-4 shadow-xs overflow-hidden">
            <div className="h-80 sm:h-96 rounded-2xl overflow-hidden bg-slate-100 flex items-center justify-center">
              {listing.images && listing.images.length > 0 ? (
                <img
                  src={listing.images[selectedImage]}
                  alt={listing.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center p-8">
                  <span className="text-6xl block mb-2">
                    {listing.category === 'metal' ? '🔩' : listing.category === 'plastic' ? '🧴' : '📦'}
                  </span>
                  <span className="text-xs uppercase font-bold text-gray-400 tracking-wider">
                    {listing.category} Material Lot
                  </span>
                </div>
              )}
            </div>

            {/* Thumbnail selector */}
            {listing.images && listing.images.length > 1 && (
              <div className="flex gap-2 mt-3 overflow-x-auto">
                {listing.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition cursor-pointer shrink-0 ${
                      selectedImage === idx ? 'border-primary-600 shadow-xs' : 'border-transparent opacity-70'
                    }`}
                  >
                    <img src={img} alt="thumb" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Title & Metadata */}
          <div className="bg-white rounded-3xl border border-gray-200/80 p-6 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-primary-100 text-primary-800">
                {listing.category}
              </span>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-gray-100 text-gray-700 capitalize">
                Grade: {listing.condition}
              </span>
              <span className="text-xs font-medium px-3 py-1 rounded-full bg-slate-100 text-slate-600">
                Sub-Type: {listing.subCategory || 'General'}
              </span>
              {listing.status === 'sold' && (
                <span className="text-xs font-extrabold uppercase px-3 py-1 rounded-full bg-red-100 text-red-700">
                  Sold Out
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight">
              {listing.title}
            </h1>

            <div className="pt-2 border-t border-gray-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                Lot Specifications & Description
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                {listing.description}
              </p>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 border-t border-gray-100">
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                <span className="text-[10px] uppercase font-semibold text-gray-400 block">Available Quantity</span>
                <span className="text-sm font-bold text-gray-800">{listing.quantity} {listing.unit}</span>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                <span className="text-[10px] uppercase font-semibold text-gray-400 block">Asking Rate</span>
                <span className="text-sm font-bold text-gray-800">₹{listing.pricePerUnit}/{listing.unit}</span>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                <span className="text-[10px] uppercase font-semibold text-gray-400 block">Total Lot Value</span>
                <span className="text-sm font-bold text-gray-800">
                  ₹{(listing.pricePerUnit * listing.quantity).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Pricing, AI Comparison & Trading Actions */}
        <div className="space-y-6">
          {/* Price & Action Box */}
          <div className="bg-white rounded-3xl border border-gray-200/80 p-6 shadow-xs space-y-5">
            <div>
              <span className="text-xs uppercase font-semibold text-gray-400">Seller's Asking Rate</span>
              <div className="text-3xl font-black text-gray-900 mt-0.5">
                ₹{listing.pricePerUnit.toLocaleString()}
                <span className="text-sm font-normal text-gray-500"> / {listing.unit}</span>
              </div>
            </div>

            {/* AI Benchmark Card */}
            {hasEstimate && (
              <div className="bg-gradient-to-br from-teal-50 to-cyan-50 border border-teal-200 rounded-2xl p-4 text-xs space-y-1.5">
                <div className="flex items-center justify-between font-bold text-teal-950">
                  <span className="flex items-center gap-1.5">
                    <FaRobot className="text-teal-600 text-sm" /> Smart Fair Price Benchmark
                  </span>
                  <span className="text-[10px] bg-teal-200 text-teal-900 px-1.5 py-0.5 rounded font-extrabold uppercase">
                    AI
                  </span>
                </div>
                <div className="text-base font-extrabold text-teal-800">
                  ₹{listing.estimatedPrice.toLocaleString()} / {listing.unit}
                </div>
                <p className="text-[11px] text-gray-600">
                  {priceDiffPct === 0
                    ? 'Listing is priced exactly at the recent 3-month regional scrap average.'
                    : `Asking price is ${Math.abs(priceDiffPct)}% ${
                        priceDiffPct > 0 ? 'above' : 'below'
                      } standard historical rates for ${listing.condition} scrap.`}
                </p>
              </div>
            )}

            {/* Primary Action Buttons */}
            {listing.status === 'active' && !isOwner && (
              <div className="space-y-2.5 pt-2">
                <button
                  onClick={() => setShowOfferModal(true)}
                  className="w-full bg-btn-accent text-white font-bold py-3.5 rounded-2xl text-sm shadow-lg hover:shadow-amber-500/30 hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <FaHandshake /> Make Formal Offer
                </button>
              </div>
            )}

            {isOwner && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 text-center font-medium">
                You are the creator of this listing. View incoming buyer bids in your Offers Inbox.
              </div>
            )}
          </div>

          {/* Verified Seller Profile Card */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">
              Listed by Verified Industry
            </h3>

            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center text-xl shrink-0">
                <FaBuilding />
              </div>
              <div className="overflow-hidden">
                <div className="flex items-center gap-1.5">
                  <h4 className="font-bold text-slate-900 text-sm truncate">
                    {listing.seller?.companyName || listing.seller?.name}
                  </h4>
                  {listing.seller?.verificationStatus === 'verified' && (
                    <FaCheckCircle className="text-emerald-500 text-sm shrink-0" title="Verified Industrial Member" />
                  )}
                </div>
                <span className="text-xs text-slate-500 block truncate">
                  Contact Person: {listing.seller?.name}
                </span>
                <span className="text-[11px] font-bold text-teal-700 uppercase tracking-wider">
                  Status: {listing.seller?.verificationStatus}
                </span>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-600 pt-3 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <FaMapMarkerAlt className="text-slate-400 shrink-0" />
                <span>{listing.city}, Gujarat</span>
              </div>
              {listing.seller?.phone && (
                <div className="flex items-center gap-2">
                  <FaPhoneAlt className="text-slate-400 shrink-0" />
                  <span>{listing.seller.phone}</span>
                </div>
              )}
              {listing.seller?.email && (
                <div className="flex items-center gap-2">
                  <FaEnvelope className="text-slate-400 shrink-0" />
                  <span className="truncate">{listing.seller.email}</span>
                </div>
              )}
            </div>

            {/* Google Maps link */}
            <div className="pt-2">
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition"
              >
                <FaMapMarkerAlt className="text-red-500" /> Open Dispatch Yard in Google Maps{' '}
                <FaExternalLinkAlt className="text-[10px]" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Make Offer Modal */}
      {showOfferModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Make an Offer</h3>
            <p className="text-xs text-slate-500 mb-4">
              Submit your purchase proposal for "{listing.title}" directly to the seller.
            </p>

            <form onSubmit={handleMakeOffer} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Offered Price per {listing.unit} (₹)
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={offeredPrice}
                  onChange={(e) => setOfferedPrice(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block font-semibold text-slate-700">
                    Quantity ({listing.unit})
                  </label>
                  <span className="text-[11px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                    Available: {listing.quantity} {listing.unit}
                  </span>
                </div>
                <input
                  type="number"
                  required
                  min="1"
                  max={listing.quantity}
                  value={offerQuantity}
                  onChange={(e) => setOfferQuantity(e.target.value)}
                  className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${
                    Number(offerQuantity) > listing.quantity ? 'border-red-400 bg-red-50/30' : 'border-slate-200'
                  }`}
                />
                {Number(offerQuantity) > listing.quantity && (
                  <p className="text-[11px] text-red-600 mt-1 font-semibold">
                    Offer quantity cannot exceed seller's available stock ({listing.quantity} {listing.unit}).
                  </p>
                )}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Message / Pickup Notes (Optional)
                </label>
                <textarea
                  rows="3"
                  placeholder="e.g. Can pick up within 2 days using our 10-ton flatbed truck."
                  value={offerMessage}
                  onChange={(e) => setOfferMessage(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                ></textarea>
              </div>

              <div className="bg-teal-50 p-3 rounded-xl border border-teal-200 text-[11px] text-teal-900 font-medium">
                Total Bid Amount: ₹{(Number(offeredPrice) * Number(offerQuantity)).toLocaleString()}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowOfferModal(false)}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingOffer}
                  className="flex-1 py-2.5 bg-btn-accent text-white rounded-xl font-bold transition-all duration-300 shadow-md hover:shadow-amber-500/25 cursor-pointer disabled:opacity-50"
                >
                  {submittingOffer ? 'Submitting...' : 'Send Offer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListingDetail;
