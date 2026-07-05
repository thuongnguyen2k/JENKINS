import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

test('renders E-Commerce title', () => {
  render(
    <MemoryRouter>
      <App />
    </MemoryRouter>
  );
  
  const titleElement = screen.getByText(/E-Shop Premium/i);
  expect(titleElement).toBeDefined();
});
