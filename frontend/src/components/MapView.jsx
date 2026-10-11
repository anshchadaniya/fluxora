import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaMapMarkerAlt, FaExternalLinkAlt, FaInfoCircle, FaCompass } from 'react-icons/fa';

const MapView = ({ listings = [], center = { lat: 23.0225, lng: 72.5714 }, radiusKm = 100 }) => {
  const [selectedListing, setSelectedListing] = useState(null);
  const mapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_KEY;

  return (
    <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-sm mb-8">
      {/* Notice Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 mb-4 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2">
            <FaCompass className="text-teal-600 text-lg" />
            <h2 className="font-bold text-gray-900 text-base">Geographic Scrap Map & Nearby Discovery</h2>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Haversine calculated distance from selected hub (Current: {radiusKm} km radius)
          </p>
        </div>

        <div className="flex items-center gap-2 bg-teal-50 text-teal-800 text-xs px-3 py-1.5 rounded-xl border border-teal-200">
          <FaInfoCircle />
          <span>{mapsApiKey ? 'Google Maps Enabled' : 'Zero-Key Interactive Map View'}</span>
        </div>
      </div>

      {/* Visual Hub Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {listings.map((item) => {
          const lat = item.location?.lat || 23.0225;
          const lng = item.location?.lng || 72.5714;
          const mapLink = `https://www.google.com/maps?q=${lat},${lng}`;

          return (
            <div
              key={item._id}
              className={`p-4 rounded-xl border transition-all ${
                selectedListing?._id === item._id
                  ? 'border-primary bg-teal-50/50 shadow-md ring-2 ring-primary/20'
                  : 'border-gray-200 bg-gray-50 hover:bg-white hover:border-teal-300'
              }`}
              onClick={() => setSelectedListing(item)}
            >
              <div className="flex justify-between items-start gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white border border-gray-200 text-gray-700">
                  {item.category}
                </span>
                <span className="text-xs font-bold text-teal-800 bg-teal-100/70 px-2 py-0.5 rounded-full">
                  {item.distanceKm != null ? `${item.distanceKm} km away` : item.city}
                </span>
              </div>

              <h4 className="font-semibold text-gray-900 text-sm mt-2 line-clamp-1">
                {item.title}
              </h4>

              <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
                <span>{item.quantity} {item.unit}</span>
                <span className="font-bold text-gray-900">₹{item.pricePerUnit}/{item.unit}</span>
              </div>

              <div className="mt-3 pt-2.5 border-t border-gray-200/60 flex items-center justify-between">
                <div className="flex items-center gap-1 text-xs text-gray-600 truncate">
                  <FaMapMarkerAlt className="text-red-500 shrink-0" />
                  <span className="truncate">{item.city}, Gujarat ({lat.toFixed(2)}, {lng.toFixed(2)})</span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={mapLink}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-teal-600 hover:text-teal-800 p-1 flex items-center gap-1 font-semibold"
                    title="Open location directly in Google Maps"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Maps <FaExternalLinkAlt className="text-[10px]" />
                  </a>
                  <Link
                    to={`/listing/${item._id}`}
                    className="text-xs bg-btn-primary hover:opacity-95 text-white px-3 py-1 rounded-lg font-medium shadow-sm transition"
                    onClick={(e) => e.stopPropagation()}
                  >
                    View
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MapView;
