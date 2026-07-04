import React from 'react';
import { Plus } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  return (
    <div className="glass product-card">
      <div className="product-img-wrapper">
        <img src={product.imageUrl} alt={product.name} className="product-img" />
      </div>
      <div className="product-info">
        <h3 className="product-title">{product.name}</h3>
        <p className="product-desc">{product.description}</p>
        <div className="product-footer">
          <span className="product-price">{formatPrice(product.price)}</span>
          <button className="btn" onClick={() => addToCart(product)}>
            <Plus size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
