import NavBar from './components/Navbar'
import Home from './pages/Home'
import Signup from './pages/Signup'
import Login from './pages/Login'
import Product from './pages/Product'
import Repair from './pages/Repair'
import Builder from './pages/Builder'
import Category from './pages/Category'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import About from './pages/About'
import Contact from './pages/Contact'
import Profile from './pages/Profile'
import Purchases from './pages/Purchases'
import Error from './pages/Error'
import Footer from './components/Footer';
import ScrollToTopButton from "./components/ScrollToTopButton";
import { Routes, Route } from "react-router-dom";

function App() {
  return (
    <>
    <NavBar />
    <main className='bg-base-200'>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="signup/" element={<Signup />} />
        <Route path="login/" element={<Login />} />
        <Route path="product/:slug" element={<Product />} />
        <Route path="repair/" element={<Repair />} />
        <Route path="builder/" element={<Builder />} />
        <Route path="category/" element={<Category />} />
        <Route path="cart/" element={<Cart />} />
        <Route path="checkout/" element={<Checkout />} />
        <Route path="about/" element={<About />} />
        <Route path="contact/" element={<Contact />} />
        <Route path="profile/" element={<Profile />} />
        <Route path="purchases/" element={<Purchases />} />
        <Route path="*" element={<Error />} />
      </Routes>
    </main>
    <ScrollToTopButton />
    <Footer />
    </>
  )
}

export default App
