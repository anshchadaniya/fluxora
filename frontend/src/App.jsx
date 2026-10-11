import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Global Layout Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Public Pages
import Home from './pages/Home';
import Marketplace from './pages/Marketplace';
import ListingDetail from './pages/ListingDetail';
import Recyclers from './pages/Recyclers';
import Login from './pages/Login';
import Register from './pages/Register';

// Protected Pages (Seller)
import SellerDashboard from './pages/SellerDashboard';
import CreateListing from './pages/CreateListing';
import EditListing from './pages/EditListing';
import MyListings from './pages/MyListings';
import OffersInbox from './pages/OffersInbox';

// Protected Pages (Buyer)
import BuyerDashboard from './pages/BuyerDashboard';
import MyOffers from './pages/MyOffers';

// Protected Pages (Shared)
import Deals from './pages/Deals';
import Profile from './pages/Profile';

// Protected Pages (Admin)
import AdminDashboard from './pages/AdminDashboard';
import VerifyUsers from './pages/VerifyUsers';
import ModerateListings from './pages/ModerateListings';

const App = () => {
  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col bg-bgMain">
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#0B1220',
              color: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid #111C33',
              boxShadow: '0 10px 25px -5px rgba(11, 18, 32, 0.4)',
              fontSize: '13px',
              fontWeight: '600',
            },
            success: {
              iconTheme: {
                primary: '#0D9488',
                secondary: '#FFFFFF',
              },
            },
            error: {
              iconTheme: {
                primary: '#EF4444',
                secondary: '#FFFFFF',
              },
            },
          }}
        />
        <Navbar />

        <main className="flex-1">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/listing/:id" element={<ListingDetail />} />
            <Route path="/recyclers" element={<Recyclers />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Seller Routes */}
            <Route element={<ProtectedRoute allowedRoles={['seller', 'admin']} />}>
              <Route path="/seller/dashboard" element={<SellerDashboard />} />
              <Route path="/seller/create-listing" element={<CreateListing />} />
              <Route path="/seller/edit-listing/:id" element={<EditListing />} />
              <Route path="/seller/listings" element={<MyListings />} />
              <Route path="/seller/offers" element={<OffersInbox />} />
            </Route>

            {/* Buyer Routes */}
            <Route element={<ProtectedRoute allowedRoles={['buyer', 'admin']} />}>
              <Route path="/buyer/dashboard" element={<BuyerDashboard />} />
              <Route path="/buyer/offers" element={<MyOffers />} />
            </Route>

            {/* Shared Authenticated Routes */}
            <Route element={<ProtectedRoute allowedRoles={['seller', 'buyer', 'admin']} />}>
              <Route path="/deals" element={<Deals />} />
              <Route path="/profile" element={<Profile />} />
            </Route>

            {/* Admin Routes */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/verify" element={<VerifyUsers />} />
              <Route path="/admin/moderate" element={<ModerateListings />} />
            </Route>

            {/* 404 Fallback */}
            <Route
              path="*"
              element={
                <div className="py-24 text-center">
                  <h2 className="text-3xl font-black text-gray-900 mb-2">404 - Page Not Found</h2>
                  <p className="text-xs text-gray-500 mb-4">
                    The requested page does not exist or has been relocated.
                  </p>
                  <a
                    href="/"
                    className="bg-btn-primary hover:opacity-95 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md shadow-teal-500/20 transition inline-block"
                  >
                    Return Home
                  </a>
                </div>
              }
            />
          </Routes>
        </main>

        <Footer />
      </div>
    </AuthProvider>
  );
};

export default App;
