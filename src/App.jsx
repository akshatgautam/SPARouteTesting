import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { usePageTracker } from './hooks/usePageTracker';
import NavBar from './components/NavBar';
import EventLog from './components/EventLog';
import Home from './pages/Home';
import Products from './pages/Products';
import About from './pages/About';

function App() {
  // Initialize the central page tracker hook to capture all 8 scenarios
  usePageTracker();

  return (
    <div className="app-shell">
      <NavBar />
      
      <div className="main-content-layout">
        <div className="page-view-pane">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products/:id" element={<Products />} />
            <Route path="/about" element={<About />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </div>
        
        <EventLog />
      </div>
    </div>
  );
}

export default App;
