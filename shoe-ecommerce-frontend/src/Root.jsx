import { StrictMode } from 'react';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { CartProvider } from './context/CartContext.jsx';

export default function Root({ router }) {
  return (
    <StrictMode>
      {router(
        <AuthProvider>
          <CartProvider>
            <App />
          </CartProvider>
        </AuthProvider>
      )}
    </StrictMode>
  );
}
