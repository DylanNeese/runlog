import { useState } from 'react';
import { computePace, filterByLabel, sortRuns, isValidRun, labelClass } from '../utils.js';

export default function TestPanel({ allRuns, filtered }) {
  const [results, setResults] = useState(null);

  function runTests() {
    const tests = [];

    function assert(description, condition, detail = '') {
      tests.push({ description, passed: !!condition, detail });
      console.assert(condition, `[RunLog FAIL] ${description}`);
    }

    // 1. Happy path: API returned data
    assert('API returned at least one run', Array.isArray(allRuns) && allRuns.length > 0, `length=${allRuns?.length}`);

    // 2. Happy path: every run has required fields
    const allValid = Array.isArray(allRuns) && allRuns.every(isValidRun);
    assert('Every run has required fields (id, date, distance_mi, duration_min, label)', allValid);

    // 3. Happy path: pace is a positive number for every run
    const pacesValid = Array.isArray(allRuns) && allRuns.every(r => {
      const p = computePace(r.duration_min, r.distance_mi);
      return typeof p === 'number' && p > 0;
    });
    assert('Pace computes to a positive number for every run', pacesValid);

    // 4. UI: rendered card count matches filtered data length
    const domCards = document.querySelectorAll('[data-testid="run-card"]').length;
    assert('Rendered card count matches filtered data length', domCards === filtered.length, `DOM=${domCards}, filtered=${filtered.length}`);

    // 5. Non-mutation: filterByLabel does not modify original array
    const snap1 = JSON.stringify(allRuns);
    filterByLabel(allRuns, 'tempo');
    assert('filterByLabel() does not mutate the original array', JSON.stringify(allRuns) === snap1);

    // 6. Non-mutation: sortRuns does not modify original array
    const snap2 = JSON.stringify(allRuns);
    sortRuns(allRuns, 'distance_desc');
    assert('sortRuns() does not mutate the original array', JSON.stringify(allRuns) === snap2);

    // 7. Edge case: unknown label returns empty array, no crash
    const impossible = filterByLabel(allRuns, '__nope__');
    assert('Filtering unknown label returns empty array safely', Array.isArray(impossible) && impossible.length === 0);

    // 8. Edge case: isValidRun rejects object missing label field
    const brokenRun = { id: 99, date: '2026-01-01', distance_mi: 3, duration_min: 30 };
    assert('isValidRun() returns false for run missing label field', !isValidRun(brokenRun));

    setResults(tests);
    const passed = tests.filter(t => t.passed).length;
    console.log(`[RunLog Tests] ${passed}/${tests.length} passed`);
  }

  const passCount = results?.filter(t => t.passed).length ?? 0;
  const failCount = results ? results.length - passCount : 0;

  return (
    <section className="test-panel">
      <div className="test-panel__header">
        <h2 className="test-panel__title">Test Assertions</h2>
        <button className="run-tests-btn" onClick={runTests}>▶ Run Tests</button>
        {results && (
          <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: failCount === 0 ? 'var(--easy)' : 'var(--tempo)' }}>
            {passCount} passed · {failCount} failed
          </span>
        )}
      </div>

      {results && (
        <div className="test-results">
          <div className="test-results__summary" style={{ color: failCount === 0 ? 'var(--easy)' : 'var(--tempo)' }}>
            {failCount === 0 ? `✓ All ${passCount} tests passed` : `✗ ${failCount} of ${results.length} failed`}
          </div>
          {results.map((r, i) => (
            <div key={i} className={`test-result-item ${r.passed ? 'pass' : 'fail'}`}>
              <span className="test-result-item__icon">{r.passed ? '✓' : '✗'}</span>
              <span className="test-result-item__desc">
                {r.description}
                {r.detail && <span style={{ color: 'var(--text-muted)', fontSize: '0.8em' }}> — {r.detail}</span>}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
