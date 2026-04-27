import { useState, useEffect } from 'react';
import RunCard from './components/RunCard.jsx';
import FilterBar from './components/FilterBar.jsx';
import StatsBar from './components/StatsBar.jsx';
import AddRunForm from './components/AddRunForm.jsx';
import TestPanel from './components/TestPanel.jsx';
import { filterByLabel, sortRuns } from './utils.js';

export default function App() {
  const [allRuns,      setAllRuns]      = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [sortKey,      setSortKey]      = useState('date_desc');
  useEffect(() => {
    fetch('/api/runs.json')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        return res.json();
      })
      .then(data => {
        if (!Array.isArray(data)) throw new Error('Expected an array from API');
        setAllRuns(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const filtered = sortRuns(filterByLabel(allRuns, activeFilter), sortKey);

  function handleAddRun(run) {
    const id = allRuns.length ? Math.max(...allRuns.map(r => r.id)) + 1 : 1;
    setAllRuns(prev => [...prev, { id, ...run }]);
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <p className="loading-screen__text">Loading runs…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-screen">
        <p className="error-screen__text">⚠ Could not load runs</p>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{error}</p>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: 8 }}>
          Make sure <code>/api/runs.json</code> is being served by your Pi or Vite dev server.
        </p>
      </div>
    );
  }

  return (
    <div className="app-wrapper">
      <header className="site-header">
        <div>
          <h1 className="site-header__logo">Run<span>Log</span></h1>
          <p className="site-header__tagline">Personal running tracker · Pi-backed</p>
        </div>
      </header>

      <StatsBar runs={filtered} />

      <FilterBar
        activeFilter={activeFilter}
        sortKey={sortKey}
        onFilter={setActiveFilter}
        onSort={setSortKey}
      />

      <p className="run-count">
        Showing <strong>{filtered.length}</strong> of {allRuns.length} runs
      </p>

      <main className="run-grid">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <span className="empty-state__icon">🏃</span>
            <p className="empty-state__text">No runs found</p>
          </div>
        ) : (
          filtered.map(run => (
            <RunCard key={run.id} run={run} />
          ))
        )}
      </main>

      <AddRunForm onAddRun={handleAddRun} />

      <TestPanel allRuns={allRuns} filtered={filtered} />
    </div>
  );
}
