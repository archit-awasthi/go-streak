// src/components/HeatmapGrid.jsx
import { useMemo } from 'react';

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAY_LABELS  = ['M','T','W','T','F','S','S'];

function getTodayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function formatFull(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m-1, d).toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
  });
}

/**
 * Returns an array of cells for a given month.
 * Empty slots (null) are used for padding before the 1st.
 * Uses Monday-first week.
 */
function getMonthCells(year, month) {
  const firstDay  = new Date(year, month, 1);
  const lastDate  = new Date(year, month + 1, 0).getDate();
  const startPad  = (firstDay.getDay() + 6) % 7; // Mon=0 … Sun=6

  const cells = [];
  for (let i = 0; i < startPad; i++) cells.push(null);
  for (let d = 1; d <= lastDate; d++) {
    const yyyy = year;
    const mm   = String(month + 1).padStart(2, '0');
    const dd   = String(d).padStart(2, '0');
    cells.push(`${yyyy}-${mm}-${dd}`);
  }
  return cells;
}

/** Returns last N months as {year, month} objects, oldest first. */
function getLastNMonths(n) {
  const result = [];
  const now    = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    result.push({ year: d.getFullYear(), month: d.getMonth() });
  }
  return result;
}

export default function HeatmapGrid({ logs = {}, color = '#000' }) {
  const today  = getTodayStr();
  const months = useMemo(() => getLastNMonths(6), []);

  return (
    <div className="hm-wrapper">
      {/* Weekday labels */}
      <div className="hm-day-labels">
        {DAY_LABELS.map((l, i) => (
          <span key={i} className="hm-day-label">{l}</span>
        ))}
      </div>

      {/* Month blocks */}
      <div className="hm-months">
        {months.map(({ year, month }) => {
          const cells = getMonthCells(year, month);
          // Pad to complete last row
          const remainder = cells.length % 7;
          const endPad    = remainder === 0 ? 0 : 7 - remainder;
          for (let i = 0; i < endPad; i++) cells.push(null);

          return (
            <div key={`${year}-${month}`} className="hm-month">
              <p className="hm-month-label">{MONTH_NAMES[month]} {year !== new Date().getFullYear() ? year : ''}</p>
              <div className="hm-month-grid">
                {cells.map((dateStr, idx) => {
                  if (!dateStr) {
                    return <div key={idx} className="hm-cell hm-cell--empty" />;
                  }
                  const isDone   = logs[dateStr]?.done === true;
                  const isToday  = dateStr === today;
                  const isFuture = dateStr > today;

                  return (
                    <div
                      key={dateStr}
                      className={[
                        'hm-cell',
                        isDone    ? 'hm-cell--done'   : '',
                        isToday   ? 'hm-cell--today'  : '',
                        isFuture  ? 'hm-cell--future' : '',
                      ].join(' ')}
                      data-tip={formatFull(dateStr) + (isDone ? ' ✓' : '')}
                      style={isDone ? { backgroundColor: color, boxShadow: `0 0 0 1px ${color}` } : isToday ? { borderColor: color } : {}}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
