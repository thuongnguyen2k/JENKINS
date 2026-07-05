import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import App from './App';

test('renders E-Commerce title', () => {
  render(
    <App />
  );
  
  const titleElement = screen.getByText(/TechShop/i);
  expect(titleElement).toBeDefined();
});
