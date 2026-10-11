import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import toast from 'react-hot-toast';
import { FaHandshake, FaCheck, FaTimes, FaExchangeAlt, FaArrowRight } from 'react-icons/fa';

const OffersInbox = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [counterInput, setCounterInput] = useState({});
  const [statusTab, setStatusTab] = useState('all');

  useEffect(() => {
    fetchReceivedOffers();
  }, []);

  const fetchReceivedOffers = async () => {
    try {
      const res = await API.get('/offers/received');
      if (res.data?.success) {
        setOffers(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load offers inbox');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (offerId) => {
    try {
      const res = await API.put(`/offers/${offerId}/accept`);
      if (res.data?.success) {
        toast.success(res.data.message || 'Deal confirmed and generated!');
        fetchReceivedOffers();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not accept offer');
    }
  };

  const handleReject = async (offerId) => {
    try {
      const res = await API.put(`/offers/${offerId}/reject`);
      if (res.data?.success) {
        toast.success('Offer negotiation declined');
        fetchReceivedOffers();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not decline offer');
    }
  };

  const handleCounter = async (offerId) => {
    const price = counterInput[offerId];
    if (!price || Number(price) <= 0) {
      toast.error('Please enter a valid counter price');
      return;
    }

    try {
      const res = await API.put(`/offers/${offerId}/counter`, { counterPrice: Number(price) });
      if (res.data?.success) {
        toast.success('Counter offer sent to buyer');
        setCounterInput((prev) => ({ ...prev, [offerId]: '' }));
        fetchReceivedOffers();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit counter offer');
    }
  };

  const filteredOffers = offers.filter((o) => {
    if (statusTab === 'all') return true;
    if (statusTab === 'countered') return o.status === 'countered' || o.status === 'counter_accepted';
    return o.status === statusTab;
  });

  const tabList = [
    { id: 'all', label: 'All Offers', count: offers.length },
    { id: 'pending', label: 'Pending', count: offers.filter((o) => o.status === 'pending').length },
    {
      id: 'countered',
      label: 'Countered',
      count: offers.filter((o) => o.status === 'countered' || o.status === 'counter_accepted').length,
    },
    { id: 'accepted', label: 'Accepted Deals', count: offers.filter((o) => o.status === 'accepted').length },
    { id: 'rejected', label: 'Rejected', count: offers.filter((o) => o.status === 'rejected').length },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            Offers & Negotiations Inbox
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Review incoming buyer bids, accept proposals, or counter negotiate directly.
          </p>
        </div>
      </div>

      {/* Status Tabs with Teal Active Highlighting */}
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
        <div className="p-12 text-center text-xs text-gray-400">Loading incoming offers...</div>
      ) : filteredOffers.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-gray-200 p-8 shadow-xs">
          <FaHandshake className="text-4xl text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">No {statusTab === 'all' ? '' : statusTab} buyer offers found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOffers.map((offer) => {
            const isPending = offer.status === 'pending';
            const isCountered = offer.status === 'countered';
            const isCounterAccepted = offer.status === 'counter_accepted';
            const isAccepted = offer.status === 'accepted';
            const isBuyerCounter = isCountered && offer.lastCounterBy === 'buyer';
            const isSellerCounter = isCountered && offer.lastCounterBy === 'seller';

            return (
              <div
                key={offer._id}
                className="bg-white rounded-3xl border border-gray-200/80 p-6 shadow-xs flex flex-col md:flex-row justify-between gap-6"
              >
                {/* Left: Offer & Material Info */}
                <div className="space-y-3 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                        isAccepted
                          ? 'bg-emerald-100 text-emerald-800'
                          : isCounterAccepted
                          ? 'bg-teal-100 text-teal-800 font-extrabold'
                          : isPending
                          ? 'bg-amber-100 text-amber-800'
                          : isCountered
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {isCounterAccepted ? 'Counter Accepted by Buyer' : offer.status}
                    </span>
                    <span className="text-gray-400 text-xs">•</span>
                    <span className="text-xs text-gray-500">
                      Received {new Date(offer.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-gray-900">
                      Offer for:{' '}
                      <Link to={`/listing/${offer.listing?._id}`} className="hover:text-teal-600 underline">
                        {offer.listing?.title}
                      </Link>
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Buyer: <span className="font-semibold text-gray-800">{offer.buyer?.name}</span> (
                      {offer.buyer?.companyName || 'Recycling Enterprise'} • {offer.buyer?.city})
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-4 pt-1">
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-gray-400 block">Initial Offered Rate</span>
                      <span className="font-black text-gray-900 text-sm">
                        ₹{offer.offeredPrice}/{offer.listing?.unit}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-semibold text-gray-400 block">Requested Weight</span>
                      <span className="font-bold text-gray-800">
                        {offer.quantity} {offer.listing?.unit}
                      </span>
                    </div>

                    {offer.listing && (
                      <div>
                        <span className="text-[10px] uppercase font-semibold text-teal-600 block">Listing Stock Available</span>
                        <span className="font-bold text-teal-700">
                          {offer.listing.quantity} {offer.listing.unit}
                        </span>
                      </div>
                    )}

                    {offer.counterPrice && (
                      <div>
                        <span className="text-[10px] uppercase font-semibold text-amber-600 block">Active Negotiated Rate</span>
                        <span className="font-black text-amber-700 text-sm">
                          ₹{offer.counterPrice}/{offer.listing?.unit}
                        </span>
                      </div>
                    )}
                  </div>

                  {!isAccepted && offer.listing && offer.quantity > offer.listing.quantity && (
                    <div className="text-xs text-rose-700 bg-rose-50 border border-rose-200 p-2.5 rounded-xl font-medium">
                      ⚠️ Buyer's requested quantity ({offer.quantity} {offer.listing.unit}) exceeds currently available stock ({offer.listing.quantity} {offer.listing.unit}).
                    </div>
                  )}

                  {!isAccepted && offer.listing && offer.quantity <= offer.listing.quantity && (
                    <div className="text-[11px] text-teal-800 bg-teal-50/60 border border-teal-100 p-2 rounded-xl">
                      Accepting this offer will deduct {offer.quantity} {offer.listing.unit}. Remaining {offer.listing.quantity - offer.quantity} {offer.listing.unit} will stay active in the marketplace.
                    </div>
                  )}

                  {isAccepted && offer.listing && (
                    <div className="text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-200 p-2 rounded-xl font-medium">
                      ✓ Deal confirmed for {offer.quantity} {offer.listing.unit}. Remaining stock on listing: {offer.listing.quantity} {offer.listing.unit}.
                    </div>
                  )}

                  {offer.message && (
                    <div className="text-xs text-gray-600 bg-slate-50 p-3 rounded-xl border border-slate-100 italic">
                      "{offer.message}"
                    </div>
                  )}

                  {/* Buyer accepted counter alert */}
                  {isCounterAccepted && (
                    <div className="bg-teal-50 border border-teal-200 p-3 rounded-2xl">
                      <span className="text-xs font-bold text-teal-900 block flex items-center gap-1.5">
                        <FaCheck className="text-teal-600" /> Buyer accepted your counter rate of ₹{offer.counterPrice}/{offer.listing?.unit}!
                      </span>
                      <span className="text-[11px] text-teal-700 mt-0.5 block">
                        Total Agreed Value: ₹{(offer.counterPrice * offer.quantity).toLocaleString()}. Please confirm to finalize deal or decline.
                      </span>
                    </div>
                  )}

                  {/* Buyer re-countered */}
                  {isBuyerCounter && (
                    <div className="text-xs font-semibold text-blue-900 bg-blue-50 p-3 rounded-2xl border border-blue-200">
                      Buyer Proposed Counter Rate: ₹{offer.counterPrice}/{offer.listing?.unit} (Total: ₹{(offer.counterPrice * offer.quantity).toLocaleString()})
                    </div>
                  )}

                  {/* Seller awaiting buyer */}
                  {isSellerCounter && (
                    <div className="text-xs font-medium text-slate-600 bg-slate-50 p-2.5 rounded-2xl border border-slate-200">
                      You proposed counter rate: ₹{offer.counterPrice}/{offer.listing?.unit}. Waiting for buyer to accept, re-counter, or stay on bid.
                    </div>
                  )}
                </div>

                {/* Right: Actions */}
                <div className="flex flex-col justify-center gap-3 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6 min-w-[210px]">
                  {/* Case 1: Buyer accepted counter -> seller must confirm or decline */}
                  {isCounterAccepted && (
                    <>
                      <button
                        onClick={() => handleAccept(offer._id)}
                        className="w-full bg-btn-primary hover:opacity-95 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-md shadow-teal-500/20"
                      >
                        <FaCheck /> Confirm Deal (₹{offer.counterPrice})
                      </button>

                      <button
                        onClick={() => handleReject(offer._id)}
                        className="w-full bg-gray-100 hover:bg-red-50 hover:text-red-700 text-gray-700 font-semibold py-2 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                      >
                        <FaTimes /> Decline Deal
                      </button>
                    </>
                  )}

                  {/* Case 2: Pending or Countered (e.g. buyer proposed rate or initial bid) */}
                  {(isPending || isCountered) && !isCounterAccepted && (
                    <>
                      <button
                        onClick={() => handleAccept(offer._id)}
                        className="w-full bg-btn-primary hover:opacity-95 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-md shadow-teal-500/20"
                      >
                        <FaCheck /> Accept & Create Deal {offer.counterPrice ? `(₹${offer.counterPrice})` : `(₹${offer.offeredPrice})`}
                      </button>

                      {/* Counter Proposal Box */}
                      <div className="flex gap-2">
                        <input
                          type="number"
                          placeholder="Counter ₹"
                          value={counterInput[offer._id] || ''}
                          onChange={(e) =>
                            setCounterInput({ ...counterInput, [offer._id]: e.target.value })
                          }
                          className="w-24 px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-primary focus:outline-none"
                        />
                        <button
                          onClick={() => handleCounter(offer._id)}
                          className="flex-1 bg-btn-accent hover:opacity-95 text-white font-bold py-1.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1 transition cursor-pointer shadow-sm"
                        >
                          <FaExchangeAlt /> {isCountered ? 'Counter Again' : 'Counter'}
                        </button>
                      </div>

                      <button
                        onClick={() => handleReject(offer._id)}
                        className="w-full bg-gray-100 hover:bg-red-50 hover:text-red-700 text-gray-700 font-semibold py-2 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                      >
                        <FaTimes /> Decline
                      </button>
                    </>
                  )}

                  {/* Case 3: Accepted Deal */}
                  {isAccepted && (
                    <Link
                      to="/deals"
                      className="w-full bg-btn-primary hover:opacity-95 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 transition text-center shadow-md shadow-teal-500/20"
                    >
                      View Generated Deal <FaArrowRight />
                    </Link>
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

export default OffersInbox;
