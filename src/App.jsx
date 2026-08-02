import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { usePageTracker } from './hooks/usePageTracker';
import { capturePersonalization } from './hooks/useScreenCapture';
import NavBar from './components/NavBar';
import EventLog from './components/EventLog';
import Home from './pages/Home';
import Products from './pages/Products';
import About from './pages/About';

function App() {
  // Initialize the central page tracker hook to capture all 8 scenarios
  usePageTracker();

  const handleCapture = async () => {
    try {
      const result = await capturePersonalization();
      if (result && result.blob) {
        const url = URL.createObjectURL(result.blob);
        window.open(url, '_blank');
      }
    } catch (err) {
      console.error('Capture personalization failed:', err);
    }
  };

  return (
    <div className="app-shell">
      {/* Widget 2: Position fixed div with icon above the fold */}
      <div 
        data-personalization-widget="fixed-above" 
        style={{ position: 'fixed', top: '80px', right: '20px', zIndex: 9999, background: '#ff5722', color: 'white', padding: '10px', borderRadius: '50%', boxShadow: '0 2px 5px rgba(0,0,0,0.3)', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        🔔
      </div>

      {/* Widget 4: Position fixed div with icon below the fold (positioned bottom-right) */}
      <div 
        data-personalization-widget="fixed-below" 
        style={{ position: 'fixed', bottom: '80px', right: '20px', zIndex: 9999, background: '#4caf50', color: 'white', padding: '10px', borderRadius: '50%', boxShadow: '0 2px 5px rgba(0,0,0,0.3)', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        💬
      </div>

      <NavBar />
      
      <div className="main-content-layout">
        <div className="page-view-pane">
          {/* Widget 1: Inline div with image above the fold */}
          <div data-personalization-widget="inline-above" style={{ padding: '10px', margin: '10px', background: '#f0f4f8', borderRadius: '8px', textAlign: 'center' }}>
            <h4>Widget 1: Inline Above Fold</h4>
            <img src="https://picsum.photos/150/80" alt="Inline Above Fold" style={{ borderRadius: '4px' }} />
          </div>

          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products/:id" element={<Products />} />
            <Route path="/about" element={<About />} />
            <Route path="*" element={<Home />} />
          </Routes>

          {/* Spacer to push content below the fold */}
          <div style={{ height: '100vh' }}></div>

          {/* Widget 3: Inline div with image below the fold */}
          <div data-personalization-widget="inline-below" style={{ padding: '10px', margin: '10px', background: '#f5f0f6', borderRadius: '8px', textAlign: 'center' }}>
            <h4>Widget 3: Inline Below Fold</h4>
            <img src="https://picsum.photos/150/90" alt="Inline Below Fold" style={{ borderRadius: '4px' }} />
          </div>

          <div style={{ margin: '10px' }}>
            <button onClick={handleCapture} style={{ padding: '8px 16px', cursor: 'pointer' }}>Capture Screenshot</button>
          </div>
        </div>
        
        <EventLog />
      </div>
    </div>
  );
}

export default App;
