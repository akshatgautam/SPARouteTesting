import React, { useState, useEffect, useRef } from 'react';
import { subscribeToEvents } from '../sdk';

export function EventLog() {
  const [isOpen, setIsOpen] = useState(true);
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const logEndRef = useRef(null);

  // Subscribe to real-time events from the SDK
  useEffect(() => {
    const unsubscribe = subscribeToEvents((newEvent) => {
      setEvents((prev) => [...prev, newEvent]);
    });
    return () => unsubscribe();
  }, []);

  // Auto-scroll to the bottom of the log when new events arrive
  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [events]);

  const clearLogs = () => {
    setEvents([]);
    setSelectedEventId(null);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // Visual indicator can be added later or inline
  };

  const getBadgeColor = (type) => {
    switch (type) {
      case 'pageview':
        return 'badge-pageview';
      case 'querychange':
        return 'badge-query';
      case 'anchorchange':
        return 'badge-anchor';
      case 'visibility':
        return 'badge-visibility';
      case 'pushstate':
        return 'badge-pushstate';
      case 'replacestate':
        return 'badge-replacestate';
      case 'popstate':
        return 'badge-popstate';
      default:
        return 'badge-default';
    }
  };

  return (
    <div className={`event-log-panel ${isOpen ? 'open' : 'collapsed'}`}>
      <button 
        className="toggle-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Collapse event log" : "Expand event log"}
      >
        {isOpen ? '→' : '←'}
        <span className="toggle-badge">{events.length}</span>
      </button>

      <div className="panel-content">
        <div className="panel-header">
          <h3>SDK Event Stream</h3>
          <button onClick={clearLogs} className="btn btn-secondary btn-sm">
            Clear Logs
          </button>
        </div>

        <div className="events-list">
          {events.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📡</div>
              <p>Waiting for SDK events...</p>
              <span className="subtext">Trigger interactions on the page to view events.</span>
            </div>
          ) : (
            events.map((event) => (
              <div 
                key={event.id} 
                className={`event-card ${selectedEventId === event.id ? 'active' : ''}`}
                onClick={() => setSelectedEventId(selectedEventId === event.id ? null : event.id)}
              >
                <div className="event-meta">
                  <span className="timestamp">{event.timestamp}</span>
                  <span className={`badge ${getBadgeColor(event.type)}`}>
                    {event.type}
                  </span>
                </div>
                <div className="event-url">
                  <code>{event.url}</code>
                </div>
                
                {selectedEventId === event.id && (
                  <div className="payload-viewer" onClick={(e) => e.stopPropagation()}>
                    <div className="payload-header">
                      <span>Payload Metadata</span>
                      <button 
                        className="btn-copy" 
                        onClick={() => copyToClipboard(JSON.stringify(event, null, 2))}
                        title="Copy raw JSON"
                      >
                        Copy
                      </button>
                    </div>
                    <pre>
                      <code>{JSON.stringify(event.payload, null, 2)}</code>
                    </pre>
                  </div>
                )}
              </div>
            ))
          )}
          <div ref={logEndRef} />
        </div>
      </div>
    </div>
  );
}

export default EventLog;
