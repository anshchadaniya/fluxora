import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import toast from 'react-hot-toast';
import { FaHandshake, FaCheck, FaTimes, FaExchangeAlt, FaArrowRight, FaUndo } from 'react-icons/fa';

const MyOffers = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusTab, setStatusTab] = useState('all');
  const [counterInput, setCounterInput] = useState({});

  useEffect(() => {
    fetchSentOffers();
  }, []);

  const fetchSentOffers = async () => {
    try {
      const res = await API.get('/offers/sent');
      if (res.data?.success) {
        setOffers(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load your offers');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptCounter = async (offerId) => {
    try {
      const res = await API.put(`/offers/${offerId}/accept`);
      if (res.data?.success) {
        toast.success(res.data.message || 'Counter offer accepted! Awaiting seller confirmation.');
        fetchSentOffers();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not accept counter offer');
    }
  };

  const handleStayOnBid = async (offerId) => {
    try {
      const res = await API.put(`/offers/${offerId}/counter`, { stayOnOriginal: true });
      if (res.data?.success) {
        toast.success('Reaffirmed your initial bid to the seller!');
        fetchSentOffers();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reaffirm initial bid');
    }
  };

  const handleBuyerCounter = async (offerId) => {
    const price = counterInput[offerId];
    if (!price || Number(price) <= 0) {
      toast.error('Please enter a valid positive counter price');
      return;
    }

    try {
      const res = await API.put(`/offers/${offerId}/counter`, { counterPrice: Number(price) });
      if (res.data?.success) {
        toast.success('Counter proposal sent to seller!');
        setCounterInput((prev) => ({ ...prev, [offerId]: '' }));
        fetchSentOffers();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit counter offer');
    }
  };

  const handleDecline = async (offerId) => {
    try {
      const res = await API.put(`/offers/${offerId}/reject`);
      if (res.data?.success) {
        toast.success('Offer negotiation declined');
        fetchSentOffers();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not decline offer');
    }
  };

  const filteredOffers = offers.filter((o) => {
    if (statusTab === 'all') return true;
    if (statusTab === 'countered') return o.status === 'countered' || o.status === 'counter_accepted';
    return o.status === statusTab;
  });

  const tabList = [
    { id: 'all', label: 'All Sent Bids', count: offers.length },
    { id: 'pending', label: 'Pending', count: offers.filter((o) => o.status === 'pending').length },
    {
      id: 'countered',
      label: 'Countered',
      count: offers.filter((o) => o.status === 'countered' || o.status === 'counter_accepted').length,
    },
    { id: 'accepted', label: 'Accepted', count: offers.filter((o) => o.status === 'accepted').length },
    { id: 'rejected', label: 'Rejected', count: offers.filter((o) => o.status === 'rejected').length },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
          My Sent Offers & Negotiations
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
          Track the status of purchase bids submitted to industrial sellers.
        </p>
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
        <div className="p-12 text-center text-xs text-gray-400">Loading offers...</div>
      ) : filteredOffers.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-gray-200 p-8 shadow-xs">
          <FaHandshake className="text-4xl text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm mb-3">No {statusTab === 'all' ? '' : statusTab} offers found.</p>
          <Link
            to="/marketplace"
            className="text-xs bg-btn-primary hover:opacity-95 text-white font-bold px-5 py-2.5 rounded-xl inline-block shadow-md shadow-teal-500/20 transition"
          >
            Explore Marketplace Lots
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOffers.map((offer) => {
            const isCountered = offer.status === 'countered';
            const isCounterAccepted = offer.status === 'counter_accepted';
            const isAccepted = offer.status === 'accepted';
            const isSellerCounter = isCountered && offer.lastCounterBy === 'seller';
            const isBuyerCounter = isCountered && offer.lastCounterBy === 'buyer';

            return (
              <div
                key={offer._id}
                className="bg-white rounded-3xl border border-gray-200/80 p-6 shadow-xs flex flex-col md:flex-row justify-between gap-6"
              >
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                        isAccepted
                          ? 'bg-emerald-100 text-emerald-800'
                          : isCounterAccepted
                          ? 'bg-teal-100 text-teal-800'
                          : offer.status === 'rejected'
                          ? 'bg-rose-100 text-rose-800'
                          : isCountered
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {isCounterAccepted ? 'Counter Accepted' : offer.status}
                    </span>
                    <span className="text-xs text-gray-400">
                      Submitted on {new Date(offer.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-gray-900">
                    <Link to={`/listing/${offer.listing?._id}`} className="hover:text-teal-600 transition">
                      {offer.listing?.title}
                    </Link>
                  </h3>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-50 p-3 rounded-2xl text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-gray-400 block">Your Bid</span>
                      <span className="font-black text-gray-900">
                        ₹{offer.offeredPrice}/{offer.listing?.unit}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-gray-400 block">Quantity</span>
                      <span className="font-bold text-gray-800">
                        {offer.quantity} {offer.listing?.unit}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-gray-400 block">Asking Rate</span>
                      <span className="text-gray-600">
                        ₹{offer.listing?.pricePerUnit}/{offer.listing?.unit}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-gray-400 block">Seller</span>
                      <span className="font-medium text-gray-700 truncate block">
                        {offer.seller?.companyName || offer.seller?.name || 'Seller'}
                      </span>
                    </div>
                  </div>

                  {offer.message && (
                    <p className="text-xs text-gray-600 italic bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      Note sent with offer: "{offer.message}"
                    </p>
                  )}

                  {/* Seller Counter Action Panel */}
                  {isSellerCounter && (
                    <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl space-y-3">
                      <div>
                        <span className="text-xs font-black text-blue-900 block">
                          Seller Proposed Counter Rate: ₹{offer.counterPrice}/{offer.listing?.unit}
                        </span>
                        <span className="text-[11px] text-blue-700">
                          Total Value: ₹{(offer.counterPrice * offer.quantity).toLocaleString()} (Original Bid: ₹{offer.offeredPrice}/{offer.listing?.unit})
                        </span>
                      </div>

                      {/* Action buttons: Accept Counter, Stay on My Bid, or Counter Again */}
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <button
                          onClick={() => handleAcceptCounter(offer._id)}
                          className="bg-btn-primary hover:opacity-95 text-white font-bold py-2 px-3.5 rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-teal-500/20 transition cursor-pointer"
                        >
                          <FaCheck /> Accept Counter Rate
                        </button>

                        <button
                          onClick={() => handleStayOnBid(offer._id)}
                          className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold py-2 px-3 rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer"
                          title="Reject the counter rate and reaffirm your original bid"
                        >
                          <FaUndo className="text-[10px]" /> Stay on My Bid (₹{offer.offeredPrice})
                        </button>

                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            placeholder="Re-counter ₹"
                            value={counterInput[offer._id] || ''}
                            onChange={(e) =>
                              setCounterInput({ ...counterInput, [offer._id]: e.target.value })
                            }
                            className="w-28 px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold focus:ring-2 focus:ring-primary focus:outline-none"
                          />
                          <button
                            onClick={() => handleBuyerCounter(offer._id)}
                            className="bg-btn-accent hover:opacity-95 text-white font-bold py-1.5 px-3 rounded-xl text-xs flex items-center gap-1 transition cursor-pointer shadow-sm"
                          >
                            <FaExchangeAlt /> Counter
                          </button>
                        </div>

                        <button
                          onClick={() => handleDecline(offer._id)}
                          className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 py-1.5 px-2.5 rounded-xl font-semibold transition cursor-pointer"
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Buyer waiting on seller after re-counter */}
                  {isBuyerCounter && (
                    <div className="bg-slate-50 border border-slate-200 p-3 rounded-2xl">
                      <span className="text-xs font-semibold text-slate-700 block">
                        You proposed ₹{offer.counterPrice}/{offer.listing?.unit}. Waiting for seller response.
                      </span>
                    </div>
                  )}

                  {/* Counter Accepted - Waiting for Seller Deal Confirmation */}
                  {isCounterAccepted && (
                    <div className="bg-teal-50 border border-teal-200 p-3 rounded-2xl">
                      <span className="text-xs font-bold text-teal-800 block flex items-center gap-1.5">
                        <FaCheck className="text-teal-600" /> You accepted counter rate of ₹{offer.counterPrice || offer.offeredPrice}/{offer.listing?.unit}!
                      </span>
                      <span className="text-[11px] text-teal-600 mt-0.5 block">
                        Awaiting seller confirmation to generate the final transaction deal slip.
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col justify-center gap-2.5 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6 min-w-[180px]">
                  {isAccepted ? (
                    <Link
                      to="/deals"
                      className="bg-btn-primary hover:opacity-95 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 transition text-center shadow-md shadow-teal-500/20"
                    >
                      View Generated Deal <FaArrowRight />
                    </Link>
                  ) : (
                    <div className="text-center text-xs text-gray-500 font-medium">
                      Status:{' '}
                      <span className="font-bold capitalize">
                        {isCounterAccepted ? 'Awaiting Seller' : offer.status}
                      </span>
                    </div>
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

export default MyOffers;
