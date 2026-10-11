import { Link } from 'react-router-dom';
import { FaCheckCircle, FaMapMarkerAlt, FaRobot } from 'react-icons/fa';

const CATEGORY_COLORS = {
  metal: 'bg-amber-50 text-amber-800 border-amber-200',
  plastic: 'bg-teal-50 text-teal-800 border-teal-200',
  cardboard: 'bg-orange-50 text-orange-800 border-orange-200',
  ewaste: 'bg-cyan-50 text-cyan-800 border-cyan-200',
  paper: 'bg-teal-50 text-teal-800 border-teal-200',
  other: 'bg-slate-100 text-slate-800 border-slate-200',
};

const CONDITION_COLORS = {
  clean: 'bg-teal-50 text-teal-700 border-teal-200',
  mixed: 'bg-amber-50 text-amber-700 border-amber-200',
  contaminated: 'bg-red-50 text-red-700 border-red-200',
};

const ListingCard = ({ listing }) => {
  const {
    _id,
    title,
    category,
    subCategory,
    quantity,
    unit,
    pricePerUnit,
    estimatedPrice,
    condition,
    images = [],
    city,
    seller,
    distanceKm,
  } = listing;

  const coverImage = images && images.length > 0 ? images[0] : null;

  // Comparison between asking price and AI estimate
  const hasEstimate = estimatedPrice && estimatedPrice > 0;
  const priceDiffPct = hasEstimate
    ? Math.round(((pricePerUnit - estimatedPrice) / estimatedPrice) * 100)
    : 0;

  return (
    <Link
      to={`/listing/${_id}`}
      className="group bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-2xl hover:scale-[1.02] hover:border-teal-400 transition-all duration-300 flex flex-col overflow-hidden"
    >
      {/* Image Preview / Category Placeholder */}
      <div className="relative h-48 bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden flex items-center justify-center">
        {coverImage ? (
          <img
            src={coverImage}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="text-center p-4">
            <span className="text-4xl block mb-1">
              {category === 'metal' ? '🔩' : category === 'plastic' ? '🧴' : category === 'cardboard' ? '📦' : category === 'ewaste' ? '💻' : '♻️'}
            </span>
            <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">
              {category}
            </span>
          </div>
        )}

        {/* Badges Top Bar */}
        <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
          <span
            className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border shadow-xs capitalize ${
              CATEGORY_COLORS[category] || CATEGORY_COLORS.other
            }`}
          >
            {category}
          </span>
          <span
            className={`text-[11px] font-medium px-2 py-0.5 rounded-full border capitalize ${
              CONDITION_COLORS[condition] || CONDITION_COLORS.clean
            }`}
          >
            {condition}
          </span>
        </div>
      </div>

      {/* Card Details */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="truncate font-medium">{subCategory || 'General'}</span>
            <span className="font-bold text-teal-800 bg-teal-50 border border-teal-200/80 px-2 py-0.5 rounded text-[11px]">
              {quantity} {unit} available
            </span>
          </div>

          <h3 className="font-bold text-slate-900 group-hover:text-teal-600 transition line-clamp-2 text-sm leading-snug mb-2">
            {title}
          </h3>
        </div>

        <div>
          {/* Price & AI Comparison */}
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-end justify-between">
            <div>
              <div className="text-[10px] uppercase font-semibold text-slate-400">Asking Price</div>
              <div className="text-lg font-black text-teal-600">
                ₹{pricePerUnit.toLocaleString()}
                <span className="text-xs font-normal text-slate-500">/{unit}</span>
              </div>
            </div>

            {hasEstimate && (
              <div className="text-right">
                <div className="flex items-center justify-end gap-1 text-[10px] font-semibold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">
                  <FaRobot className="text-[9px]" /> AI Est: ₹{estimatedPrice}
                </div>
                <div
                  className={`text-[10px] font-medium mt-0.5 ${
                    priceDiffPct > 0 ? 'text-amber-600' : 'text-teal-600'
                  }`}
                >
                  {priceDiffPct === 0 ? 'At market rate' : `${Math.abs(priceDiffPct)}% ${priceDiffPct > 0 ? 'above' : 'below'} avg`}
                </div>
              </div>
            )}
          </div>

          {/* Seller & Location Footer */}
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-1.5 truncate max-w-[150px]">
              <span className="truncate font-medium text-slate-700">
                {seller?.companyName || seller?.name || 'Industry'}
              </span>
              {seller?.verificationStatus === 'verified' && (
                <FaCheckCircle className="text-emerald-500 text-xs shrink-0" title="Verified Member" />
              )}
            </div>

            <div className="flex items-center gap-1 text-slate-500 text-[11px] shrink-0">
              <FaMapMarkerAlt className="text-slate-400 text-xs" />
              <span>{city}</span>
              {distanceKm != null && (
                <span className="text-teal-600 font-bold ml-0.5">({distanceKm} km)</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ListingCard;
