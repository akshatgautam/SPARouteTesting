import React from 'react';
import { Link } from 'react-router-dom';

export function Home() {
  return (
    <div className="page-container home-page">
      <header className="page-header">
        <h1>SDK Testing Ground</h1>
        <p className="subtitle">
          This single-page application is designed to trigger and test every possible client-side navigation and interaction event that a tracking WebSDK needs to capture.
        </p>
      </header>

      <div className="grid grid-2">
        <div className="card glass-card">
          <div className="card-header">
            <span className="card-icon">⚡</span>
            <h2>Scenario 1 & 7: Navigation & Anchors</h2>
          </div>
          <p>
            Use standard routing links or trigger in-page anchor navigation. Anchor updates change the hash sub-route and trigger <code>anchorchange</code> events.
          </p>
          <div className="btn-group">
            <Link to="/#section-a" className="btn btn-primary">
              Scroll to Section A
            </Link>
            <Link to="/#section-b" className="btn btn-secondary">
              Scroll to Section B
            </Link>
          </div>
        </div>

        <div className="card glass-card">
          <div className="card-header">
            <span className="card-icon">👁️</span>
            <h2>Scenario 8: Page Visibility</h2>
          </div>
          <p>
            WebSDKs track when a tab becomes inactive or active. Try switching to a different browser tab and coming back, or minimizing the browser window.
          </p>
          <div className="visibility-guide">
            <span className="pulse-indicator"></span>
            <span>Watch the SDK log update with <code>visibility</code> hidden/visible events.</span>
          </div>
        </div>
      </div>

      <div className="spacer-lg"></div>

      {/* Anchor Targets */}
      <section id="section-a" className="anchor-section">
        <div className="section-content glass-card">
          <span className="section-tag">Target A</span>
          <h2>Section A</h2>
          <p>
            You have navigated to Section A via an in-page anchor link. In a HashRouter, this alters the hash URL to <code>#/foo#section-a</code>, allowing the hook to catch the anchor change without changing routes.
          </p>
          <Link to="/" className="btn btn-outline btn-sm">Back to Top</Link>
        </div>
      </section>

      <div className="spacer-md"></div>

      <section id="section-b" className="anchor-section">
        <div className="section-content glass-card">
          <span className="section-tag bg-purple">Target B</span>
          <h2>Section B</h2>
          <p>
            You have scrolled to Section B. The SDK tracker caught this hash change as well, rendering an <code>anchorchange</code> event in the real-time event logs panel.
          </p>
          <Link to="/" className="btn btn-outline btn-sm">Back to Top</Link>
        </div>
      </section>
      
      <div className="spacer-lg"></div>
    </div>
  );
}

export default Home;
