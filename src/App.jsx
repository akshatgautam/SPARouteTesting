import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { usePageTracker } from './hooks/usePageTracker';
import { CartProvider } from './context/CartContext';
import NavBar from './components/NavBar';
import EventLog from './components/EventLog';
import MiniCart from './components/MiniCart';
import Home from './pages/Home';
import ProductListing from './pages/ProductListing';
import ProductDetail from './pages/ProductDetail';
import SearchResults from './pages/SearchResults';
import NavLab from './pages/NavLab';

function AppRoutes() {
  // Initialize the central page tracker hook to capture all 8 scenarios
  usePageTracker();

  return (
    <div className="app-shell">
      <NavBar />

      <div className="main-content-layout">
        <div className="page-view-pane">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<ProductListing />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/lab" element={<NavLab />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </div>

        <EventLog />
      </div>

      <MiniCart />
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
