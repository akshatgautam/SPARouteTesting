import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { usePageTracker } from './hooks/usePageTracker';
import { CartProvider } from './context/CartContext';
import NavBar from './components/NavBar';
import SiteFooter from './components/SiteFooter';
import Home from './pages/Home';
import ProductListing from './pages/ProductListing';
import ProductDetail from './pages/ProductDetail';
import SearchResults from './pages/SearchResults';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';

function AppRoutes() {
  usePageTracker();

  return (
    <div className="app-shell">
      <NavBar />
      <main className="page-view-pane">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<ProductListing />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-confirmation" element={<OrderConfirmation />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
      <SiteFooter />
    </div>
  );
}

function App() {
  return (
    <CartProvider>
      <AppRoutes />
    </CartProvider>
  );
}

export default App;
