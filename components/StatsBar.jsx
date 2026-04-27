import { computeStats, formatPace } from '../utils.js';

export default function StatsBar({ runs }) {
  const { totalRuns, totalMiles, totalTime, avgPace } = computeStats(runs);
  const hours = Math.floor(totalTime / 60);
  const mins  = totalTime % 60;
  const timeDisplay = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

  return (
    <div className="stats-bar">
      <div className="stat-block">
        <div className="stat-block__value">{totalRuns}</div>
        <div className="stat-block__label">Runs</div>
      </div>
      <div className="stat-block">
        <div className="stat-block__value">{totalMiles}</div>
        <div className="stat-block__label">Total Miles</div>
      </div>
      <div className="stat-block">
        <div className="stat-block__value">{timeDisplay}</div>
        <div className="stat-block__label">Total Time</div>
      </div>
      <div className="stat-block">
        <div className="stat-block__value">{formatPace(avgPace)}</div>
        <div className="stat-block__label">Avg Pace /mi</div>
      </div>
    </div>
  );
}
