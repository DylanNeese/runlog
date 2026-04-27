export function computePace(duration_min, distance_mi) {
  if (typeof duration_min !== 'number' || typeof distance_mi !== 'number' || distance_mi <= 0 || duration_min <= 0) return null;
  return duration_min / distance_mi;
}

export function formatPace(pace) {
  if (pace === null || isNaN(pace)) return '—';
  const mins = Math.floor(pace);
  const secs = Math.round((pace - mins) * 60);
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

export function formatDate(dateStr) {
  if (!dateStr) return 'Unknown date';
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function labelClass(label) {
  const map = { 'easy run': 'easy', 'long run': 'long', 'tempo': 'tempo' };
  return map[label] ?? '';
}

export function isValidRun(run) {
  return (
    run !== null &&
    typeof run === 'object' &&
    typeof run.id === 'number' &&
    typeof run.date === 'string' &&
    typeof run.distance_mi === 'number' &&
    typeof run.duration_min === 'number' &&
    typeof run.label === 'string'
  );
}

export function filterByLabel(runs, label) {
  if (label === 'all') return runs;
  return runs.filter(r => r.label === label);
}

export function sortRuns(runs, key) {
  const copy = [...runs];
  copy.sort((a, b) => {
    if (key === 'date_desc')     return b.date.localeCompare(a.date);
    if (key === 'date_asc')      return a.date.localeCompare(b.date);
    if (key === 'distance_desc') return b.distance_mi - a.distance_mi;
    if (key === 'distance_asc')  return a.distance_mi - b.distance_mi;
    if (key === 'pace') {
      const pa = computePace(a.duration_min, a.distance_mi) ?? Infinity;
      const pb = computePace(b.duration_min, b.distance_mi) ?? Infinity;
      return pa - pb;
    }
    return 0;
  });
  return copy;
}

export function computeStats(runs) {
  if (!runs.length) return { totalRuns: 0, totalMiles: 0, totalTime: 0, avgPace: null };
  const totalMiles = runs.reduce((sum, r) => sum + r.distance_mi, 0);
  const totalTime  = runs.reduce((sum, r) => sum + r.duration_min, 0);
  return {
    totalRuns:  runs.length,
    totalMiles: parseFloat(totalMiles.toFixed(1)),
    totalTime,
    avgPace: computePace(totalTime, totalMiles),
  };
}
