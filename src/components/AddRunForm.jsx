import { useState } from 'react';

const EMPTY = { date: '', distance_mi: '', duration_min: '', label: 'easy run', notes: '' };

export default function AddRunForm({ onAddRun }) {
  const [form, setForm] = useState(EMPTY);

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    onAddRun({
      date:         form.date,
      distance_mi:  parseFloat(form.distance_mi),
      duration_min: parseInt(form.duration_min, 10),
      label:        form.label,
      notes:        form.notes,
    });
    setForm(EMPTY);
  }

  return (
    <section className="add-run-form">
      <h2 className="add-run-form__title">Log a Run</h2>
      <form onSubmit={handleSubmit} className="add-run-form__fields">
        <label className="form-field">
          <span className="form-field__label">Date</span>
          <input
            className="form-field__input"
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            required
          />
        </label>

        <label className="form-field">
          <span className="form-field__label">Distance (mi)</span>
          <input
            className="form-field__input"
            type="number"
            name="distance_mi"
            value={form.distance_mi}
            onChange={handleChange}
            min="0.1"
            step="0.1"
            required
          />
        </label>

        <label className="form-field">
          <span className="form-field__label">Duration (min)</span>
          <input
            className="form-field__input"
            type="number"
            name="duration_min"
            value={form.duration_min}
            onChange={handleChange}
            min="1"
            step="1"
            required
          />
        </label>

        <label className="form-field">
          <span className="form-field__label">Type</span>
          <select
            className="form-field__input"
            name="label"
            value={form.label}
            onChange={handleChange}
          >
            <option value="easy run">Easy Run</option>
            <option value="long run">Long Run</option>
            <option value="tempo">Tempo</option>
          </select>
        </label>

        <label className="form-field form-field--wide">
          <span className="form-field__label">Notes</span>
          <input
            className="form-field__input"
            type="text"
            name="notes"
            value={form.notes}
            onChange={handleChange}
            placeholder="Optional"
          />
        </label>

        <button type="submit" className="add-run-btn">+ Add Run</button>
      </form>
    </section>
  );
}
