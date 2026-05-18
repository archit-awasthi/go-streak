// src/components/AddHabitModal.jsx
import { useState } from 'react';
import toast from 'react-hot-toast';

const PRESET_COLORS = [
  { hex: '#22c55e', label: 'Green'  },
  { hex: '#3b82f6', label: 'Blue'   },
  { hex: '#f59e0b', label: 'Amber'  },
  { hex: '#ec4899', label: 'Pink'   },
  { hex: '#06b6d4', label: 'Cyan'   },
  { hex: '#f97316', label: 'Orange' },
  { hex: '#a855f7', label: 'Purple' },
  { hex: '#ef4444', label: 'Red'    },
];

export default function AddHabitModal({ onClose, onAdd }) {
  const [name,    setName]    = useState('');
  const [color,   setColor]   = useState('#22c55e');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) { toast.error('Enter a habit name'); return; }
    setLoading(true);
    try {
      await onAdd({ name: trimmed, color });
      toast.success(`"${trimmed}" created!`);
      onClose();
    } catch {
      toast.error('Failed to create habit.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="am-overlay" onClick={onClose}>
      <div className="am-card" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="am-header">
          <h2 className="am-title">New Habit</h2>
          <button className="am-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="am-form">
          <div className="am-field">
            <label className="am-label" htmlFor="habit-name">Name</label>
            <input
              id="habit-name"
              type="text"
              className="am-input"
              placeholder="e.g. Workout, Read, Meditate…"
              value={name}
              onChange={e => setName(e.target.value)}
              autoFocus
              maxLength={40}
            />
          </div>

          <div className="am-field">
            <label className="am-label">Streak color</label>
            <div className="am-colors">
              {PRESET_COLORS.map(({ hex, label }) => (
                <button
                  key={hex}
                  type="button"
                  title={label}
                  className={`am-swatch ${color === hex ? 'am-swatch--active' : ''}`}
                  style={{ backgroundColor: hex }}
                  onClick={() => setColor(hex)}
                />
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="am-preview">
            <span className="am-preview-dot" style={{ backgroundColor: color }} />
            <span className="am-preview-name">{name || 'Habit name preview'}</span>
          </div>

          <button type="submit" id="add-habit-submit" className="am-submit" disabled={loading}>
            {loading ? 'Creating…' : 'Create Habit'}
          </button>
        </form>
      </div>
    </div>
  );
}
