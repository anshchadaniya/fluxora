import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import ListingCard from '../components/ListingCard';
import {
  FaRecycle,
  FaSearch,
  FaHandshake,
  FaChartLine,
  FaLeaf,
  FaShieldAlt,
  FaArrowRight,
  FaIndustry,
  FaMapMarkerAlt,
} from 'react-icons/fa';

const Home = () => {
  const [featuredListings, setFeaturedListings] = useState([]);
  const [platformStats, setPlatformStats] = useState({
    totalDeals: 142,
    totalKgRecycled: 54200,
    totalCo2SavedKg: 81300,
    equivalentTreesPlanted: 3870,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [listingsRes, impactRes] = await Promise.all([
          API.get('/listings?limit=6&sort=views'),
          API.get('/impact/platform'),
        ]);

        if (listingsRes.data?.success) {
          setFeaturedListings(listingsRes.data.data);
        }
        if (impactRes.data?.success) {
          setPlatformStats(impactRes.data.data);
        }
      } catch (err) {
        console.warn('Error fetching homepage data:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-hero-gradient text-white py-24 sm:py-32 shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.15),transparent_50%)] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/60 border border-teal-500/40 text-teal-300 text-xs font-semibold mb-6 shadow-inner">
            <FaLeaf className="text-amber-400" /> Gujarat Industrial Scrap & Circular Network
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight max-w-4xl mx-auto mb-6">
            Turn Industrial Waste into{' '}
            <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-teal-200 bg-clip-text text-transparent">
              Verified Revenue
            </span>
          </h1>

          <p className="text-base sm:text-xl text-slate-200 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
            Direct B2B marketplace connecting manufacturing industries with certified recyclers across Vadodara, Ahmedabad, Surat, and Rajkot. Fair market pricing, digital negotiations, and automated CO₂ tracking.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/marketplace"
              className="w-full sm:w-auto bg-btn-accent text-white px-8 py-3.5 rounded-2xl font-bold text-sm shadow-xl shadow-amber-900/30 hover:shadow-amber-500/30 hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2 group cursor-pointer"
            >
              Browse Marketplace <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/register"
              className="w-full sm:w-auto bg-white/10 hover:bg-white/20 border border-white/25 text-white px-8 py-3.5 rounded-2xl font-bold text-sm backdrop-blur-xs transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
            >
              Register as Seller / Buyer
            </Link>
          </div>

          {/* Regional Hub Badges */}
          <div className="mt-12 pt-8 border-t border-white/15 flex flex-wrap justify-center items-center gap-4 text-xs text-slate-300 font-medium">
            <span className="flex items-center gap-1.5"><FaMapMarkerAlt className="text-teal-300" /> Vadodara GIDC</span>
            <span>•</span>
            <span className="flex items-center gap-1.5"><FaMapMarkerAlt className="text-amber-400" /> Ahmedabad Sanand/Vatva</span>
            <span>•</span>
            <span className="flex items-center gap-1.5"><FaMapMarkerAlt className="text-teal-300" /> Surat Textile Hub</span>
            <span>•</span>
            <span className="flex items-center gap-1.5"><FaMapMarkerAlt className="text-amber-400" /> Rajkot Shapar Veraval</span>
          </div>
        </div>
      </section>

      {/* Environmental Impact Statistics Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl p-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="border-l-4 border-teal-600 pl-3 text-left">
            <div className="text-3xl sm:text-4xl font-black text-slate-900">
              {platformStats.totalKgRecycled?.toLocaleString()}
              <span className="text-sm font-semibold text-slate-500 ml-1">kg</span>
            </div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">
              Industrial Scrap Diverted
            </div>
          </div>

          <div className="border-l-4 border-amber-500 pl-3 text-left">
            <div className="text-3xl sm:text-4xl font-black text-amber-600">
              {platformStats.totalCo2SavedKg?.toLocaleString()}
              <span className="text-sm font-semibold text-amber-700 ml-1">kg</span>
            </div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">
              CO₂ Emissions Saved
            </div>
          </div>

          <div className="border-l-4 border-teal-500 pl-3 text-left">
            <div className="text-3xl sm:text-4xl font-black text-teal-600">
              {platformStats.equivalentTreesPlanted?.toLocaleString()}
            </div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">
              Equivalent Trees Planted
            </div>
          </div>

          <div className="border-l-4 border-slate-800 pl-3 text-left">
            <div className="text-3xl sm:text-4xl font-black text-slate-900">
              {platformStats.totalDeals}
            </div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">
              Completed Deals
            </div>
          </div>
        </div>
      </section>

      {/* Featured Scrap Listings */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 mb-8">
          <div>
            <div className="text-xs font-bold text-teal-700 uppercase tracking-wider mb-1">
              Live Industrial Lots
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              Trending Scrap Listings
            </h2>
          </div>
          <Link
            to="/marketplace"
            className="text-sm font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1.5 transition"
          >
            Explore all listings <FaArrowRight className="text-xs" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-64 bg-slate-200/60 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : featuredListings.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-8">
            <p className="text-slate-500">No active listings yet. Run seed script or create one!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredListings.map((listing) => (
              <ListingCard key={listing._id} listing={listing} />
            ))}
          </div>
        )}
      </section>

      {/* How It Works */}
      <section className="bg-white py-16 border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="text-xs font-bold text-teal-700 uppercase tracking-wider mb-2">
              Transparent & Middleman-Free
            </div>
            <h2 className="text-3xl font-black text-slate-900">How Fluxora Works</h2>
            <p className="text-sm text-slate-600 mt-2">
              A structured 4-step digital workflow solving scrap hoarding, opaque pricing, and middleman markups.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                step: '01',
                icon: <FaIndustry />,
                title: 'List Scrap Lots',
                desc: 'Industries upload photos, quantities, and condition. AI classifier auto-fills specs and suggests fair pricing.',
              },
              {
                step: '02',
                icon: <FaSearch />,
                title: 'Material Discovery',
                desc: 'Recyclers filter and discover available material lots across Gujarat industrial manufacturing hubs.',
              },
              {
                step: '03',
                icon: <FaHandshake />,
                title: 'Negotiate & Offer',
                desc: 'Buyers submit structured digital offers or counter-proposals directly to sellers without middleman commissions.',
              },
              {
                step: '04',
                icon: <FaChartLine />,
                title: 'Deal & Impact Track',
                desc: 'Mark deals as completed. System calculates verified CO₂ emissions prevented for green audits.',
              },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-[#F4F7FB] p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-xl hover:-translate-y-1 hover:border-teal-500/50 transition-all duration-300 relative flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center text-xl shadow-inner">
                      {item.icon}
                    </div>
                    <span className="text-2xl font-black text-slate-300">{item.step}</span>
                  </div>
                  <h3 className="font-bold text-base text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Guarantee Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-hero-gradient rounded-3xl p-8 sm:p-12 text-white flex flex-col md:flex-row justify-between items-center gap-8 shadow-2xl">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-300 bg-white/10 px-3 py-1 rounded-full border border-white/10">
              <FaShieldAlt className="text-amber-400" /> Admin-Verified Circular Marketplace
            </div>
            <h3 className="text-2xl sm:text-3xl font-black leading-tight">
              Ready to eliminate scrap disposal bottlenecks?
            </h3>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              Join Gujarat's modern waste network. Trade copper, steel, polymers, cardboard, and electronic assets with zero brokerage.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <Link
              to="/register"
              className="bg-btn-accent text-white font-bold px-6 py-3.5 rounded-xl text-xs sm:text-sm text-center shadow-lg hover:shadow-amber-500/30 transition-all duration-300"
            >
              Register Industry / Recycler
            </Link>
            <Link
              to="/marketplace"
              className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold px-6 py-3.5 rounded-xl text-xs sm:text-sm text-center transition-all duration-300"
            >
              Explore Marketplace
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
