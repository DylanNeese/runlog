import { computePace, formatPace, formatDate, labelClass } from '../utils.js';

export default function RunCard({ run }) {
  const pace    = computePace(run.duration_min, run.distance_mi);
  const paceStr = formatPace(pace);
  const dateStr = formatDate(run.date);
  const cls     = labelClass(run.label);

  return (
    <article
      className="run-card"
      data-label={run.label}
      data-testid="run-card"
    >
      <div className="run-card__header">
        <span className="run-card__date">{dateStr}</span>
        <span className={`run-card__label label--${cls}`}>{run.label ?? 'Untitled'}</span>
      </div>

      <div className="run-card__metrics">
        <div className="metric">
          <span className="metric__value">{run.distance_mi?.toFixed(1) ?? '—'}</span>
          <span className="metric__unit">miles</span>
        </div>
        <div className="metric">
          <span className="metric__value">{run.duration_min ?? '—'}</span>
          <span className="metric__unit">min</span>
        </div>
        <div className="metric">
          <span className="metric__value">{paceStr}</span>
          <span className="metric__unit">/mi pace</span>
        </div>
      </div>

      {run.notes && <p className="run-card__notes" title={run.notes}>{run.notes}</p>}
    </article>
  );
}
