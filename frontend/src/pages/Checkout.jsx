import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

export default function Checkout() {
  const { cart, cartTotal, setCart } = useCart();
  const navigate = useNavigate();
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', address: '' });

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Tạo payload gửi xuống backend
    const orderData = {
      customerName: formData.name,
      customerEmail: formData.email,
      shippingAddress: formData.address,
      totalAmount: cartTotal,
      itemsSummary: JSON.stringify(cart.map(i => ({ id: i.id, name: i.name, qty: i.quantity })))
    };

    fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    })
    .then(res => res.json())
    .then(() => {
      setIsSuccess(true);
      setCart([]); // Xóa giỏ hàng
      setTimeout(() => { navigate('/'); }, 3000);
    })
    .catch(err => console.error("Lỗi khi đặt hàng:", err));
  };

  if (isSuccess) {
    return (
      <div className="container" style={{ textAlign: 'center', paddingTop: '5rem' }}>
        <CheckCircle size={64} color="#10b981" style={{ margin: '0 auto', marginBottom: '2rem' }} />
        <h1 className="title-gradient">Đặt hàng thành công!</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '1rem' }}>
          Cảm ơn bạn đã mua sắm. Đơn hàng đang được xử lý.
        </p>
        <p style={{ marginTop: '2rem', fontSize: '0.9rem' }}>Đang quay lại trang chủ...</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: '800px', paddingTop: '3rem' }}>
      <h1 style={{ marginBottom: '2rem' }}>Thanh toán</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div className="glass" style={{ padding: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>Thông tin giao hàng</h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input 
              type="text" 
              placeholder="Họ và tên" 
              required
              style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.2)', color: 'white' }}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
            <input 
              type="email" 
              placeholder="Email" 
              required
              style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.2)', color: 'white' }}
              onChange={e => setFormData({...formData, email: e.target.value})}
            />
            <textarea 
              placeholder="Địa chỉ giao hàng" 
              required
              rows="3"
              style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.2)', color: 'white' }}
              onChange={e => setFormData({...formData, address: e.target.value})}
            ></textarea>
            
            <button type="submit" className="btn" style={{ marginTop: '1rem', justifyContent: 'center' }}>
              Xác nhận Đặt hàng
            </button>
          </form>
        </div>

        <div className="glass" style={{ padding: '2rem', height: 'fit-content' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>Tóm tắt đơn hàng</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {cart.map(item => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
                <span>{item.quantity}x {item.name}</span>
                <span>{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem', fontWeight: 'bold', fontSize: '1.25rem' }}>
            <span>Tổng cộng:</span>
            <span className="title-gradient">{formatPrice(cartTotal)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
