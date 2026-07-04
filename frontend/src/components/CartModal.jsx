import React from 'react';
import { X, Trash2, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

export default function CartModal() {
  const { isCartOpen, setIsCartOpen, cart, removeFromCart, cartTotal } = useCart();
  const navigate = useNavigate();

  if (!isCartOpen) return null;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const handleCheckout = () => {
    setIsCartOpen(false);
    navigate('/checkout');
  };

  return (
    <div className="modal-overlay" onClick={() => setIsCartOpen(false)}>
      <div className="glass modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={() => setIsCartOpen(false)}>
          <X size={24} />
        </button>
        
        <h2 style={{ marginBottom: '1.5rem' }}>Giỏ hàng của bạn</h2>
        
        {cart.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)' }}>Giỏ hàng đang trống.</p>
        ) : (
          <>
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {cart.map((item) => (
                <div key={item.id} className="cart-item">
                  <img src={item.imageUrl} alt={item.name} />
                  <div className="cart-item-info">
                    <h4>{item.name}</h4>
                    <p style={{ color: 'var(--text-secondary)' }}>
                      {formatPrice(item.price)} x {item.quantity}
                    </p>
                  </div>
                  <button className="btn-icon" onClick={() => removeFromCart(item.id)}>
                    <Trash2 size={18} color="#ef4444" />
                  </button>
                </div>
              ))}
            </div>
            
            <div className="cart-total">
              <span>Tổng cộng:</span>
              <span className="title-gradient">{formatPrice(cartTotal)}</span>
            </div>
            
            <button className="btn" style={{ width: '100%', marginTop: '1.5rem', justifyContent: 'center' }} onClick={handleCheckout}>
              Thanh toán <ArrowRight size={18} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
