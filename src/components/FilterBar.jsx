const FILTERS = [
  { key: 'all',      label: 'All' },
  { key: 'easy run', label: 'Easy' },
  { key: 'long run', label: 'Long' },
  { key: 'tempo',    label: 'Tempo' },
];

const SORT_OPTIONS = [
  { key: 'date_desc',      label: 'Date: Newest First' },
  { key: 'date_asc',       label: 'Date: Oldest First' },
  { key: 'distance_desc',  label: 'Distance: Longest First' },
  { key: 'distance_asc',   label: 'Distance: Shortest First' },
  { key: 'pace',           label: 'Sort: Pace' },
];

export default function FilterBar({ activeFilter, sortKey, onFilter, onSort }) {
  return (
    <div className="controls">
      <span className="controls__label">Filter</span>
      <div className="filter-btns">
        {FILTERS.map(f => (
          <button
            key={f.key}
            className={`filter-btn${activeFilter === f.key ? ' active' : ''}`}
            onClick={() => onFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>
      <select className="sort-select" value={sortKey} onChange={e => onSort(e.target.value)}>
        {SORT_OPTIONS.map(o => (
          <option key={o.key} value={o.key}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}
