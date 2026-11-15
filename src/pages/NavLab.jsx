import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Preserves programmatic navigation + popstate test scenarios
 * previously hosted on the About page.
 */
export function NavLab() {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(10);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);

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
        <h1>Navigation Lab</h1>
        <p className="subtitle">
          Programmatic redirects, timers, and back/forward history — preserved from
          the original SDK sandbox scenarios.
        </p>
      </header>

      <div className="grid grid-2">
        <div className="card glass-card">
          <div className="card-header">
            <h2>Scenario 3: Programmatic navigate()</h2>
          </div>
          <p>
            Programmatic navigation happens via code execution rather than link
            clicks — useful for redirects and response-driven routing.
          </p>
          <div className="button-demo">
            <button
              type="button"
              onClick={handleGoHome}
              className="btn btn-primary btn-block"
            >
              Navigate to Home via code
            </button>
          </div>
        </div>

        <div className="card glass-card">
          <div className="card-header">
            <h2>Scenario 3: Auto-Redirect Timer</h2>
          </div>
          <p>
            Auto-redirect replaces the current history entry after a countdown to
            avoid redirect loops.
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
            <button
              type="button"
              onClick={togglePause}
              className={`btn ${isPaused ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            >
              {isPaused ? 'Resume Timer' : 'Pause Timer'}
            </button>
            <button
              type="button"
              onClick={cancelTimer}
              className="btn btn-outline btn-sm"
            >
              Reset / Stop
            </button>
          </div>
        </div>
      </div>

      <div className="spacer-md"></div>

      <div className="card glass-card popstate-card">
        <div className="card-header">
          <h2>Scenario 4: popstate (Back &amp; Forward)</h2>
        </div>
        <p>
          Browser Back/Forward (or the simulator in the nav bar) fires{' '}
          <code>popstate</code>. Watch the event stream for history stack moves.
        </p>
        <p className="text-secondary">
          Try <strong>← Back</strong> then <strong>Forward →</strong> in the
          simulator to watch popstate events fire with their state.
        </p>
      </div>
    </div>
  );
}

export default NavLab;
