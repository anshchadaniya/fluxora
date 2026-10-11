import { Link } from 'react-router-dom';
import { FaRecycle, FaLeaf, FaShieldAlt, FaMapMarkerAlt } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-[#0B1220] text-slate-400 text-sm mt-auto border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Info */}
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <img src="/logo.svg" alt="Fluxora" className="w-8 h-8 object-contain" />
              <span className="text-xl font-black bg-gradient-to-r from-teal-400 to-cyan-300 bg-clip-text text-transparent">Fluxora</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Smart industrial waste marketplace connecting scrap generators directly with verified recyclers across Gujarat and India.
            </p>
            <div className="flex items-center gap-2 text-xs text-amber-400 font-medium">
              <FaLeaf className="text-teal-400" /> <span>Empowering circular economy & zero waste to landfill</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-3 text-xs tracking-wider uppercase">Marketplace</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/marketplace?category=metal" className="hover:text-teal-300 transition">Metals & Alloys</Link></li>
              <li><Link to="/marketplace?category=plastic" className="hover:text-teal-300 transition">Industrial Plastics</Link></li>
              <li><Link to="/marketplace?category=cardboard" className="hover:text-teal-300 transition">Paper & Corrugated</Link></li>
              <li><Link to="/marketplace?category=ewaste" className="hover:text-teal-300 transition">E-Waste & Batteries</Link></li>
              <li><Link to="/recyclers" className="hover:text-teal-300 transition">Recyclers Directory</Link></li>
            </ul>
          </div>

          {/* Platform Features */}
          <div>
            <h4 className="text-white font-semibold mb-3 text-xs tracking-wider uppercase">Features</h4>
            <ul className="space-y-2 text-xs">
              <li><span className="text-slate-400">AI Material Classification</span></li>
              <li><span className="text-slate-400">Smart Price Estimation</span></li>
              <li><span className="text-slate-400">Direct Recycler Procurement</span></li>
              <li><span className="text-slate-400">CO₂ Emission Reduction Tracker</span></li>
            </ul>
          </div>

          {/* Academic Project Notice */}
          <div>
            <h4 className="text-white font-semibold mb-3 text-xs tracking-wider uppercase flex items-center gap-1.5">
              <FaShieldAlt className="text-teal-400" /> Academic Project
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              Built as a comprehensive full-stack circular economy project using MERN and algorithmic AI price modelling.
            </p>
            <div className="text-[11px] text-slate-400 bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
              <div className="flex items-center gap-1 text-slate-300 font-semibold mb-1">
                <FaMapMarkerAlt className="text-amber-400" /> Gujarat Hubs
              </div>
              Vadodara • Ahmedabad • Surat • Rajkot
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 text-xs flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} Fluxora Waste Marketplace. All rights reserved.</p>
          <div className="flex gap-4">
            <span className="text-slate-400">Free Tier Architecture</span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-400">Zero-Secret Fallbacks</span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-400">Gujarat Industrial Belt</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
