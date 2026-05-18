// src/components/HabitCard.jsx
import { useState } from 'react';
import HeatmapGrid from './HeatmapGrid';
import toast from 'react-hot-toast';

function getTodayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function computeStreak(logs) {
  const today = new Date();
  let streak  = 0;
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    if (logs[key]?.done) {
      streak++;
    } else if (i === 0) {
      continue; // today not done yet — keep checking yesterday
    } else {
      break;
    }
  }
  return streak;
}

function computeStats(logs) {
  const entries   = Object.values(logs).filter(v => v?.done);
  const total     = entries.length;
  const today     = getTodayStr();
  const daysAlive = Math.max(1, Math.ceil(
    (new Date() - new Date(Object.keys(logs).sort()[0] || today)) / 86400000
  ) + 1);
  const rate = total === 0 ? 0 : Math.round((total / Math.min(daysAlive, 180)) * 100);

  // Best streak
  const sortedDates = Object.keys(logs).filter(k => logs[k]?.done).sort();
  let best = 0, cur = 0, prev = null;
  for (const d of sortedDates) {
    if (!prev) { cur = 1; }
    else {
      const diff = (new Date(d) - new Date(prev)) / 86400000;
      cur = diff === 1 ? cur + 1 : 1;
    }
    best = Math.max(best, cur);
    prev = d;
  }

  return { total, rate: Math.min(rate, 100), best };
}

export default function HabitCard({ habit, onMarkToday, onDelete }) {
  const [tab,         setTab]         = useState('heatmap'); // 'heatmap' | 'stats'
  const [marking,     setMarking]     = useState(false);
  const [deleting,    setDeleting]    = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const today       = getTodayStr();
  const markedToday = habit.logs?.[today]?.done === true;
  const streak      = computeStreak(habit.logs || {});
  const stats       = computeStats(habit.logs || {});

  async function handleMarkToday() {
    if (markedToday || marking) return;
    setMarking(true);
    try {
      await onMarkToday(habit.id);
      toast.success(`${habit.name} ✓`);
    } catch {
      toast.error('Could not save. Check connection.');
    } finally {
      setMarking(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await onDelete(habit.id);
      toast.success(`"${habit.name}" deleted.`);
    } catch {
      toast.error('Delete failed.');
    } finally {
      setDeleting(false);
      setShowConfirm(false);
    }
  }

  return (
    <article className="hc-card">
      {/* ── Header ── */}
      <div className="hc-header">
        <div className="hc-title-row">
          <span className="hc-color-dot" style={{ backgroundColor: habit.color }} />
          <h3 className="hc-name">{habit.name}</h3>
          {streak > 0 && (
            <span className="hc-streak">{streak}d 🔥</span>
          )}
        </div>
        <div className="hc-actions">
          {!showConfirm ? (
            <button className="hc-delete-btn" onClick={() => setShowConfirm(true)} title="Delete habit">
              ✕
            </button>
          ) : (
            <div className="hc-confirm">
              <span>Delete?</span>
              <button className="hc-confirm-yes" onClick={handleDelete} disabled={deleting}>
                {deleting ? '…' : 'Yes'}
              </button>
              <button className="hc-confirm-no" onClick={() => setShowConfirm(false)}>No</button>
            </div>
          )}
        </div>
      </div>

      {/* ── Tab switcher ── */}
      <div className="hc-tabs">
        <button
          className={`hc-tab ${tab === 'heatmap' ? 'hc-tab--active' : ''}`}
          onClick={() => setTab('heatmap')}
        >
          Activity
        </button>
        <button
          className={`hc-tab ${tab === 'stats' ? 'hc-tab--active' : ''}`}
          onClick={() => setTab('stats')}
        >
          Stats
        </button>
      </div>

      {/* ── Content ── */}
      <div className="hc-content">
        {tab === 'heatmap' ? (
          <HeatmapGrid logs={habit.logs || {}} color={habit.color} />
        ) : (
          <div className="hc-stats">
            <div className="hc-stat-block">
              <span className="hc-stat-value" style={{ color: habit.color }}>{streak}</span>
              <span className="hc-stat-label">Current streak</span>
            </div>
            <div className="hc-stat-divider" />
            <div className="hc-stat-block">
              <span className="hc-stat-value" style={{ color: habit.color }}>{stats.best}</span>
              <span className="hc-stat-label">Best streak</span>
            </div>
            <div className="hc-stat-divider" />
            <div className="hc-stat-block">
              <span className="hc-stat-value" style={{ color: habit.color }}>{stats.total}</span>
              <span className="hc-stat-label">Days logged</span>
            </div>
            <div className="hc-stat-divider" />
            <div className="hc-stat-block">
              <span className="hc-stat-value" style={{ color: habit.color }}>{stats.rate}%</span>
              <span className="hc-stat-label">Consistency</span>
            </div>
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      <div className="hc-footer">
        <button
          id={`mark-today-${habit.id}`}
          className={`hc-mark-btn ${markedToday ? 'hc-mark-btn--done' : ''}`}
          onClick={handleMarkToday}
          disabled={markedToday || marking}
          style={markedToday
            ? { background: habit.color, color: '#fff', borderColor: habit.color }
            : { borderColor: 'rgba(255,255,255,0.25)' }
          }
        >
          {markedToday ? '✓ Done today' : marking ? 'Saving…' : 'Mark Today'}
        </button>
        <span className="hc-today-str">{today}</span>
      </div>
    </article>
  );
}
