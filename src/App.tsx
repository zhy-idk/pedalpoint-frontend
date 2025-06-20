import './App.css'
import NavBar from './components/Navbar'
import Home from './pages/Home'
import Login from './pages/Login'
import Builder from './pages/Builder'
import Prebuilt from './pages/Prebuilt'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import About from './pages/About'
import Profile from './pages/Profile'
import Purchases from './pages/Purchases'
import Error from './pages/Error'
import Footer from './components/Footer';
import { Routes, Route } from "react-router-dom";

function App() {
  return (
    <>
    <NavBar />
    <main>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="login/" element={<Login />} />
        <Route path="builder/" element={<Builder />} />
        <Route path="prebuilt/" element={<Prebuilt />} />
        <Route path="cart/" element={<Cart />} />
        <Route path="checkout/" element={<Checkout />} />
        <Route path="about/" element={<About />} />
        <Route path="profile/" element={<Profile />} />
        <Route path="purchases/" element={<Purchases />} />
        <Route path="*" element={<Error />} />
      </Routes>
    </main>
    <Footer />
    </>
  )
}

export default App
