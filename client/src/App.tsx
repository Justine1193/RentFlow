import { useEffect, useState } from 'react'
import './App.css'

interface HealthResponse {
  ok?: boolean;
  [key: string]: unknown;
}

function App() {
  const [healthStatus, setHealthStatus] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/health')
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Server returned status ${res.status}`);
        }
        return res.json();
      })
      .then((data: HealthResponse) => {
        setHealthStatus(data);
        setLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif' }}>
      <h1>RentFlow</h1>
      <div style={{ marginTop: '1rem', padding: '1.5rem', border: '1px solid #e2e8f0', borderRadius: '8px', minWidth: '320px', textAlign: 'center' }}>
        <h3 style={{ marginBottom: '0.75rem' }}>API Health Status</h3>
        {loading && <p>Checking backend health...</p>}
        {error && <p style={{ color: '#ef4444' }}>Error: {error}</p>}
        {healthStatus && (
          <div>
            <p style={{ color: '#10b981', fontWeight: 600 }}>
              Status: {healthStatus.ok ? 'Connected (ok: true)' : 'Connected'}
            </p>
            <pre style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '4px', textAlign: 'left', marginTop: '0.5rem', fontSize: '0.875rem' }}>
              {JSON.stringify(healthStatus, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
