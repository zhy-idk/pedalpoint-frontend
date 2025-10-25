import NavBar from './components/Navbar'
import Home from './pages/Home'
import Signup from './pages/Signup'
import Login from './pages/Login'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import ProductDetail from './pages/ProductDetail'
import Repair from './pages/Repair'
import Builder from './pages/Builder'
import Category from './pages/Category'
import SearchResult from './pages/SearchResult'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import About from './pages/About'
import Contact from './pages/Contact'
import Profile from './pages/Profile'
import Purchases from './pages/Purchases'
import OrderDetail from './pages/OrderDetail'
import AccountSettings from './pages/AccountSettings'
import PaymentSuccess from './pages/PaymentSuccess'
import PaymentCancel from './pages/PaymentCancel'
import PrivacyPolicy from './pages/PrivacyPolicy'
import Error from './pages/Error'
import Footer from './components/Footer';
import ScrollToTopButton from "./components/ScrollToTopButton";
import Chat from "./components/Chat";
import { CartProvider } from './providers/CartProvider';
import { POSProvider } from './providers/POSProvider';
import { Routes, Route } from "react-router-dom";

// Staff components
import ProtectedStaffRoute from './components/ProtectedStaffRoute';
import ProtectedSuperuserRoute from './components/ProtectedSuperuserRoute';
import StaffLayout from './components/staff/StaffLayout';
import StaffDashboard from './pages/staff/StaffDashboard';
import StaffPOS from './pages/staff/StaffPOS';
import StaffChats from './pages/staff/StaffChats';
import StaffOrders from './pages/staff/StaffOrders';
import StaffListings from './pages/staff/StaffListings';
import StaffInventory from './pages/staff/StaffInventory';
import StaffQueueing from './pages/staff/StaffQueueing';
import StaffUserManagement from './pages/staff/StaffUserManagement';
import StaffReservations from './pages/staff/StaffReservations';
import StaffSales from './pages/staff/StaffSales';
import StaffSuppliers from './pages/staff/StaffSuppliers';

function App() {
  return (
    <CartProvider>
      <Routes>
        {/* Staff routes - protected and separate layout */}
        <Route path="/manage" element={
          <ProtectedStaffRoute>
            <StaffLayout />
          </ProtectedStaffRoute>
        }>
          <Route index element={<StaffDashboard />} />
          <Route path="sales" element={<StaffSales />} />
          <Route path="pos" element={
            <POSProvider>
              <StaffPOS />
            </POSProvider>
          } />
          <Route path="chats" element={<StaffChats />} />
          <Route path="orders" element={<StaffOrders />} />
          <Route path="listings" element={<StaffListings />} />
          <Route path="inventory" element={<StaffInventory />} />
          <Route path="suppliers" element={<StaffSuppliers />} />
          <Route path="reservations" element={<StaffReservations />} />
          <Route path="queueing" element={<StaffQueueing />} />
          <Route path="users" element={
            <ProtectedSuperuserRoute>
              <StaffUserManagement />
            </ProtectedSuperuserRoute>
          } />
        </Route>

        {/* Regular customer routes */}
        <Route path="/*" element={
          <>
            <NavBar />
            <main className='bg-base-200'>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="signup/" element={<Signup />} />
                <Route path="login/" element={<Login />} />
                <Route path="forgot-password/" element={<ForgotPassword />} />
                <Route path="reset-password/:key" element={<ResetPassword />} />
                <Route path="repair/" element={<Repair />} />
                <Route path="builder/" element={<Builder />} />
                <Route path="search" element={<SearchResult />} />
                <Route path="cart/" element={<Cart />} />
                <Route path="checkout/" element={<Checkout />} />
                <Route path="about/" element={<About />} />
                <Route path="contact/" element={<Contact />} />
                <Route path="privacy-policy/" element={<PrivacyPolicy />} />
                <Route path="profile/" element={<Profile />} />
                <Route path="account-settings/" element={<AccountSettings />} />
                <Route path="orders/" element={<Purchases />} />
                <Route path="orders/:id" element={<OrderDetail />} />
                <Route path="payment/success" element={<PaymentSuccess />} />
                <Route path="payment/cancel" element={<PaymentCancel />} />
                <Route path=":categorySlug/:slug" element={<ProductDetail />} />
                <Route path=":categorySlug" element={<Category />} />
                <Route path="*" element={<Error />} />
              </Routes>
            </main>
            <ScrollToTopButton />
            <Chat />
            <Footer />
          </>
        } />
      </Routes>
    </CartProvider>
  )
}

export default App
