import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import CartModal from './components/CartModal';
import Home from './pages/Home';
import Checkout from './pages/Checkout';

function App() {
  return (
    <CartProvider>
      <div style={{ position: 'relative' }}>
        <Navbar />
        <CartModal />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/checkout" element={<Checkout />} />
        </Routes>
      </div>
    </CartProvider>
  );
}

export default App;
