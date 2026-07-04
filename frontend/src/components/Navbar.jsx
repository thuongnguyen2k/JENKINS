import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';

export default function Navbar() {
  const { cartCount, setIsCartOpen } = useCart();

  return (
    <nav className="glass-nav">
      <Link to="/" style={{ textDecoration: 'none' }}>
        <h1 className="title-gradient" style={{ margin: 0, fontSize: '1.5rem' }}>E-Shop Premium</h1>
      </Link>
      
      <button className="btn-icon" onClick={() => setIsCartOpen(true)}>
        <ShoppingCart size={24} />
        {cartCount > 0 && <span className="badge">{cartCount}</span>}
      </button>
    </nav>
  );
}
