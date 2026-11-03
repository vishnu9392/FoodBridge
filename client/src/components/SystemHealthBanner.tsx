import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, RefreshCw, HelpCircle, X, Copy, Check } from 'lucide-react';
import { healthService } from '../services/healthService';
import { HealthStatusResponse } from '../types';

export const SystemHealthBanner: React.FC = () => {
  const [health, setHealth] = useState<HealthStatusResponse | null>(null);
  const [checking, setChecking] = useState<boolean>(true);
  const [serverReachable, setServerReachable] = useState<boolean>(true);
  const [showInstructions, setShowInstructions] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const checkStatus = async () => {
    setChecking(true);
    try {
      const data = await healthService.checkHealth();
      setHealth(data);
      setServerReachable(true);
    } catch (err: any) {
      if (err.response?.data) {
        setHealth(err.response.data);
        setServerReachable(true);
      } else {
        setServerReachable(false);
      }
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const sampleExample =
    'mongodb+srv://<db_user>:<db_password>@cluster0.abcde.mongodb.net/foodbridge?retryWrites=true&w=majority';

  const copySample = () => {
    navigator.clipboard.writeText(sampleExample);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (checking && !health) {
    return null;
  }

  if (!serverReachable) {
    return (
      <div className="system-health-banner" style={{ background: '#2d1414', borderBottomColor: '#e74c3c' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <AlertCircle size={18} style={{ color: '#ff6b6b' }} />
          <span>
            <strong>Server Disconnected:</strong> Cannot reach backend API at http://localhost:5000. Start it via <code>npm --prefix server run dev</code>.
          </span>
        </div>
        <button onClick={checkStatus} className="btn btn-secondary btn-sm" style={{ padding: '0.2rem 0.6rem' }}>
          <RefreshCw size={12} /> Retry
        </button>
      </div>
    );
  }

  if (health && !health.database.connected) {
    return (
      <>
        <div className="system-health-banner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
            <AlertCircle size={18} style={{ color: 'var(--primary)', flexShrink: 0 }} />
            <span>
              <strong>MongoDB Atlas Setup Required:</strong> Paste your connection string into <code>server/.env</code>.
            </span>
            <button
              onClick={() => setShowInstructions(true)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--primary)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
                textDecoration: 'underline',
                fontWeight: 600,
                fontSize: '0.86rem',
              }}
            >
              <HelpCircle size={14} /> View Step-by-Step Guide
            </button>
          </div>
          <button onClick={checkStatus} className="btn btn-secondary btn-sm" style={{ padding: '0.2rem 0.6rem' }}>
            <RefreshCw size={12} /> Check Connection
          </button>
        </div>

        {/* Modal Guide */}
        {showInstructions && (
          <div className="modal-overlay" onClick={() => setShowInstructions(false)}>
            <div className="modal-content" style={{ maxWidth: '620px' }} onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>How to Connect Your MongoDB Atlas Cluster</h3>
                <button
                  onClick={() => setShowInstructions(false)}
                  className="btn btn-secondary btn-icon"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="modal-body">
                <ol style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.92rem', color: 'var(--text-secondary)' }}>
                  <li>
                    <strong>Open MongoDB Atlas Dashboard:</strong>
                    <div>Go to <a href="https://cloud.mongodb.com" target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>cloud.mongodb.com</a> and sign in.</div>
                  </li>
                  <li>
                    <strong>Click the "Connect" button:</strong>
                    <div>Under your active Free Cluster (e.g., Cluster0), click <strong>Connect</strong>.</div>
                  </li>
                  <li>
                    <strong>Select Drivers:</strong>
                    <div>Choose <strong>Drivers</strong> &gt; Node.js (version 5.5 or later).</div>
                  </li>
                  <li>
                    <strong>Copy Connection String:</strong>
                    <div>
                      Copy your connection URI and replace <code>&lt;db_password&gt;</code> with your database user password, and set the database name to <code>foodbridge</code>.
                    </div>
                    <div style={{ backgroundColor: 'var(--bg-input)', padding: '0.75rem', borderRadius: 'var(--radius-md)', marginTop: '0.5rem', fontFamily: 'monospace', fontSize: '0.8rem', wordBreak: 'break-all', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                      <span>{sampleExample}</span>
                      <button onClick={copySample} className="btn btn-secondary btn-sm" style={{ padding: '0.2rem 0.5rem' }}>
                        {copied ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                    </div>
                  </li>
                  <li>
                    <strong>Paste into <code>FoodBridge/server/.env</code>:</strong>
                    <div>
                      Open <code>server/.env</code> and paste your URI next to <code>MONGODB_URI=</code>:
                      <pre style={{ backgroundColor: 'var(--bg-input)', padding: '0.6rem', borderRadius: 'var(--radius-sm)', marginTop: '0.4rem', color: 'var(--text-primary)' }}>
MONGODB_URI=mongodb+srv://user:pass@cluster0.abcde.mongodb.net/foodbridge?retryWrites=true&w=majority
                      </pre>
                    </div>
                  </li>
                  <li>
                    <strong>Restart the Backend Server:</strong>
                    <div>
                      The server connects automatically upon startup. Then click <strong>"Check Connection"</strong> or <strong>"Seed MongoDB with Demo Foods"</strong> to populate sample data!
                    </div>
                  </li>
                </ol>
              </div>

              <div className="modal-footer">
                <button onClick={() => setShowInstructions(false)} className="btn btn-primary">
                  Got It
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
