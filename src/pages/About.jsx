import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export function About() {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(10);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);

  // Auto-redirect timer countdown
  useEffect(() => {
    if (isPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          // Scenario 3: Programmatic navigation
          navigate('/products/1', { replace: true });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, navigate]);

  const handleGoHome = () => {
    // Scenario 3: Programmatic navigation
    navigate('/');
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  const cancelTimer = () => {
    setIsPaused(true);
    setCountdown(10);
  };

  return (
    <div className="page-container about-page">
      <header className="page-header">
        <h1>Programmatic Navigation & Timers</h1>
        <p className="subtitle">
          Observe how the SDK records programmatically triggered URL updates, redirection patterns, and browser back/forward history states.
        </p>
      </header>

      <div className="grid grid-2">
        {/* Scenario 3: Programmatic Navigate button */}
        <div className="card glass-card">
          <div className="card-header">
            <span className="card-icon">🖱️</span>
            <h2>Scenario 3: Programmatic navigate()</h2>
          </div>
          <p>
            Standard router links are triggered by clicking elements. Programmatic navigation happens via code execution, such as event handlers or response triggers.
          </p>
          <div className="button-demo">
            <button onClick={handleGoHome} className="btn btn-primary btn-block">
              Navigate to Home page via code
            </button>
          </div>
        </div>

        {/* Scenario 3: Auto-redirect countdown */}
        <div className="card glass-card">
          <div className="card-header">
            <span className="card-icon">⏱️</span>
            <h2>Scenario 3: Auto-Redirect Timer</h2>
          </div>
          <p>
            An auto-redirect modifies the history state programmatically after a countdown, typically replacing the current entry to prevent history loops.
          </p>
          
          <div className="timer-display">
            {countdown > 0 ? (
              <div className="countdown-ring">
                <span className="countdown-number">{countdown}</span>
                <span className="countdown-text">seconds until redirect</span>
              </div>
            ) : (
              <div className="countdown-ring redirecting">
                <span className="countdown-text">Redirecting...</span>
              </div>
            )}
          </div>

          <div className="timer-controls btn-group">
            <button onClick={togglePause} className={`btn ${isPaused ? 'btn-primary' : 'btn-secondary'} btn-sm`}>
              {isPaused ? '▶ Resume Timer' : '⏸ Pause Timer'}
            </button>
            <button onClick={cancelTimer} className="btn btn-outline btn-sm">
              Reset / Stop
            </button>
          </div>
        </div>
      </div>

      <div className="spacer-md"></div>

      {/* Scenario 4: Browser history instructions */}
      <div className="card glass-card popstate-card">
        <div className="card-header">
          <span className="card-icon">🔄</span>
          <h2>Scenario 4: popstate (Back & Forward)</h2>
        </div>
        <p>
          When you click the browser's Back or Forward buttons (or the Simulator buttons in the nav bar), the browser fires a <code>popstate</code> event. WebSDKs monitor this to track when a user moves backward or forward through their history stack.
        </p>
        <p className="text-secondary">
          Try clicking <strong>← Back</strong> then <strong>Forward →</strong> in the simulator or browser header to watch popstate events fire with their corresponding state.
        </p>
      </div>
    </div>
  );
}

export default About;
