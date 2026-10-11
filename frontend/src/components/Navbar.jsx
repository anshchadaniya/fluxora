import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import {
  FaBell,
  FaUserCircle,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaCheckCircle,
  FaPlus,
} from 'react-icons/fa';

const Navbar = () => {
  const { user, isAuthenticated, logout, isSeller, isBuyer, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notificationRef = useRef(null);

  // Close notifications and mobile menu on route change
  useEffect(() => {
    setShowNotifications(false);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Close notifications on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (notificationRef.current && !notificationRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('touchstart', handleOutsideClick);
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [showNotifications]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 20000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const fetchNotifications = async () => {
    try {
      const res = await API.get('/notifications');
      if (res.data?.success) {
        setNotifications(res.data.data);
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch (err) {
      // ignore
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await API.put('/notifications/read-all');
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      // ignore
    } finally {
      setShowNotifications(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinkStyle = ({ isActive }) =>
    `px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 border-b-2 flex items-center gap-1.5 ${
      isActive
        ? 'text-teal-300 bg-white/10 border-amber-400 shadow-xs'
        : 'text-slate-300 border-transparent hover:text-teal-300 hover:bg-white/5'
    }`;

  const mobileNavLinkStyle = ({ isActive }) =>
    `block px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-300 border-l-4 ${
      isActive
        ? 'text-teal-300 bg-teal-950/60 border-amber-400 font-bold'
        : 'text-slate-300 border-transparent hover:text-teal-300 hover:bg-slate-800'
    }`;

  return (
    <nav className="bg-[#0B1220] border-b border-slate-800/80 sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center gap-4">
          {/* Leftmost Corner: Fluxora Logo + Company Name */}
          <div className="flex items-center gap-3">
            {/* Mobile Menu Toggle */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-slate-300 p-2 focus:outline-none hover:bg-slate-800 rounded-xl transition"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <FaTimes className="text-xl" /> : <FaBars className="text-xl" />}
              </button>
            </div>

            <Link
              to="/"
              className="flex items-center gap-2.5 py-1 px-1.5 rounded-2xl hover:bg-white/5 transition group shrink-0"
              title="Fluxora Home"
            >
              <img
                src="/logo.svg"
                alt="Fluxora Logo"
                className="w-9 h-9 sm:w-10 sm:h-10 object-contain drop-shadow-md transition group-hover:scale-105"
              />
              <div className="text-left">
                <span className="text-xl sm:text-2xl font-black tracking-tight bg-gradient-to-r from-teal-400 via-teal-300 to-cyan-300 bg-clip-text text-transparent block leading-none">
                  Fluxora
                </span>
                <span className="text-[9px] sm:text-[10px] block text-amber-400 font-bold tracking-wider uppercase leading-none mt-0.5">
                  Waste Marketplace
                </span>
              </div>
            </Link>
          </div>

          {/* Center / Left-Center: Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-2 lg:gap-3 flex-1 justify-center lg:justify-start lg:ml-4">
            <NavLink to="/marketplace" className={navLinkStyle}>
              Marketplace
            </NavLink>
            <NavLink to="/recyclers" className={navLinkStyle}>
              Recyclers
            </NavLink>

            {/* Role-specific Nav Items */}
            {isSeller && (
              <>
                <NavLink to="/seller/dashboard" className={navLinkStyle}>
                  Dashboard
                </NavLink>
                <NavLink to="/seller/offers" className={navLinkStyle}>
                  Offers
                </NavLink>
                <NavLink
                  to="/seller/create-listing"
                  className="bg-btn-primary hover:shadow-teal-500/25 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-md transition-all duration-300 flex items-center gap-1.5"
                >
                  <FaPlus className="text-[10px]" /> List Scrap
                </NavLink>
              </>
            )}

            {isBuyer && (
              <>
                <NavLink to="/buyer/dashboard" className={navLinkStyle}>
                  Dashboard
                </NavLink>
                <NavLink to="/buyer/offers" className={navLinkStyle}>
                  My Offers
                </NavLink>
              </>
            )}

            {isAdmin && (
              <>
                <NavLink to="/admin/dashboard" className={navLinkStyle}>
                  Admin Panel
                </NavLink>
                <NavLink to="/admin/verify" className={navLinkStyle}>
                  Verify Users
                </NavLink>
              </>
            )}

            {isAuthenticated && (
              <NavLink to="/deals" className={navLinkStyle}>
                Deals
              </NavLink>
            )}
          </div>

          {/* Right Corner: User Auth & Notifications */}
          <div className="flex items-center gap-3 shrink-0">
            {isAuthenticated ? (
              <div className="flex items-center gap-2.5">
                {/* Notification Bell */}
                <div className="relative" ref={notificationRef}>
                  <button
                    onClick={() => setShowNotifications((prev) => !prev)}
                    className="p-2 text-slate-300 hover:text-teal-300 relative rounded-full hover:bg-white/10 transition cursor-pointer"
                    title="Notifications"
                  >
                    <FaBell className="text-base sm:text-lg" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 bg-amber-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notification Dropdown */}
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 bg-[#111C33] rounded-2xl shadow-2xl border border-slate-700 py-2 z-50 text-slate-200">
                      <div className="flex justify-between items-center px-4 py-2 border-b border-slate-700">
                        <span className="font-semibold text-xs text-slate-300 uppercase tracking-wider">
                          Notifications
                        </span>
                        <button
                          onClick={handleMarkAllRead}
                          className="text-xs text-teal-400 hover:underline font-medium cursor-pointer"
                        >
                          Mark all read
                        </button>
                      </div>
                      <div className="max-h-72 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-4 text-center text-xs text-slate-400">
                            No new notifications
                          </div>
                        ) : (
                          notifications.map((n) => (
                            <Link
                              key={n._id}
                              to={n.link || '#'}
                              onClick={() => setShowNotifications(false)}
                              className={`block px-4 py-3 border-b border-slate-800 text-xs hover:bg-slate-800 transition ${
                                !n.isRead ? 'bg-teal-950/40 text-teal-200 font-semibold' : 'text-slate-300'
                              }`}
                            >
                              <p className="text-slate-100">{n.text}</p>
                              <span className="text-[10px] text-slate-400 mt-1 block">
                                {new Date(n.createdAt).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </Link>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Profile Link with Role Badge */}
                <NavLink
                  to="/profile"
                  className={({ isActive }) =>
                    `flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition text-xs font-semibold ${
                      isActive
                        ? 'bg-teal-950/70 border-teal-400 text-teal-300 ring-2 ring-teal-500/30'
                        : 'bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800 hover:border-slate-600'
                    }`
                  }
                >
                  <FaUserCircle className="text-teal-400 text-base" />
                  <span className="hidden sm:inline truncate max-w-[90px]">
                    {user?.name?.split(' ')[0]}
                  </span>
                  {user?.verificationStatus === 'verified' && (
                    <FaCheckCircle className="text-teal-400 text-xs" title="Verified Member" />
                  )}
                  <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-teal-900/80 text-teal-200 border border-teal-700/50">
                    {user?.role}
                  </span>
                </NavLink>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-red-400 rounded-xl hover:bg-white/5 transition cursor-pointer"
                  title="Logout"
                >
                  <FaSignOutAlt />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <NavLink
                  to="/login"
                  className="px-3.5 py-2 text-slate-300 hover:text-white font-semibold text-xs sm:text-sm hover:bg-white/5 rounded-xl transition"
                >
                  Login
                </NavLink>
                <NavLink
                  to="/register"
                  className="bg-btn-accent text-white text-xs sm:text-sm font-semibold px-4 py-2 rounded-xl shadow-md hover:shadow-amber-500/25 transition-all duration-300"
                >
                  Register
                </NavLink>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-[#0B1220] px-4 pt-3 pb-6 space-y-2 text-slate-200">
          <NavLink
            to="/marketplace"
            onClick={() => setMobileMenuOpen(false)}
            className={mobileNavLinkStyle}
          >
            Marketplace
          </NavLink>
          <NavLink
            to="/recyclers"
            onClick={() => setMobileMenuOpen(false)}
            className={mobileNavLinkStyle}
          >
            Recyclers Directory
          </NavLink>

          {isSeller && (
            <>
              <NavLink
                to="/seller/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className={mobileNavLinkStyle}
              >
                Seller Dashboard
              </NavLink>
              <NavLink
                to="/seller/create-listing"
                onClick={() => setMobileMenuOpen(false)}
                className={mobileNavLinkStyle}
              >
                + Create Listing
              </NavLink>
              <NavLink
                to="/seller/offers"
                onClick={() => setMobileMenuOpen(false)}
                className={mobileNavLinkStyle}
              >
                Offers Inbox
              </NavLink>
            </>
          )}

          {isBuyer && (
            <>
              <NavLink
                to="/buyer/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className={mobileNavLinkStyle}
              >
                Buyer Dashboard
              </NavLink>
              <NavLink
                to="/buyer/offers"
                onClick={() => setMobileMenuOpen(false)}
                className={mobileNavLinkStyle}
              >
                My Offers
              </NavLink>
            </>
          )}

          {isAdmin && (
            <NavLink
              to="/admin/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className={mobileNavLinkStyle}
            >
              Admin Dashboard
            </NavLink>
          )}

          {isAuthenticated ? (
            <div className="pt-3 border-t border-slate-800 flex justify-between items-center">
              <NavLink
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-semibold text-teal-300"
              >
                Profile ({user?.name})
              </NavLink>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="text-xs text-red-400 font-semibold cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="pt-3 border-t border-slate-800 flex gap-3">
              <NavLink
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center flex-1 border border-slate-700 py-2 rounded-xl text-sm font-semibold text-slate-200 hover:bg-slate-800"
              >
                Login
              </NavLink>
              <NavLink
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center flex-1 bg-btn-accent text-white py-2 rounded-xl text-sm font-semibold shadow-md"
              >
                Register
              </NavLink>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
