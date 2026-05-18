// src/pages/Dashboard.jsx
import { useState, useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { useHabits } from '../hooks/useHabits';
import HabitCard from '../components/HabitCard';
import AddHabitModal from '../components/AddHabitModal';
import toast from 'react-hot-toast';

function getDateParts() {
  const now = new Date();
  return {
    weekday: now.toLocaleDateString('en-US', { weekday: 'long'  }).toUpperCase(),
    month:   now.toLocaleDateString('en-US', { month:   'short' }).toUpperCase(),
    day:     now.getDate(),
    year:    now.getFullYear(),
  };
}

function getTodayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

export default function Dashboard() {
  const { currentUser } = useAuth();
  const { habits, loading, addHabit, markToday, deleteHabit } = useHabits();
  const [showModal, setShowModal] = useState(false);
  const [isLightMode, setIsLightMode] = useState(() => localStorage.getItem('theme') === 'light');

  useEffect(() => {
    localStorage.setItem('theme', isLightMode ? 'light' : 'dark');
  }, [isLightMode]);

  const today  = getTodayStr();
  const date   = getDateParts();
  const done   = habits.filter(h => h.logs?.[today]?.done).length;
  const total  = habits.length;

  async function handleLogout() {
    try { await signOut(auth); }
    catch { toast.error('Logout failed'); }
  }

  return (
    <div className={`gs-root ${isLightMode ? 'light-mode' : ''}`}>

      {/* ── TOP NAV ── */}
      <header className="gs-nav">
        {/* Brand */}
        <div className="gs-nav__brand">
          <span className="gs-logo">GO.</span>
          <span className="gs-tagline">Streak Tracker</span>
        </div>

        {/* Center: date */}
        <div className="gs-nav__date">
          <span className="gs-nav-weekday">{date.weekday}</span>
          <span className="gs-nav-sep">·</span>
          <span className="gs-nav-date">{date.month} {date.day}, {date.year}</span>
        </div>

        {/* Right: user + actions */}
        <div className="gs-nav__right">
          <button 
            className="gs-theme-toggle" 
            onClick={() => setIsLightMode(!isLightMode)}
            title="Toggle Day/Night Mode"
          >
            {isLightMode ? '🌙' : '☀️'}
          </button>
          {total > 0 && (
            <span className="gs-done-pill">
              {done}/{total} today
            </span>
          )}
          {currentUser?.photoURL ? (
            <img
              src={currentUser.photoURL}
              alt="avatar"
              className="gs-avatar"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="gs-avatar gs-avatar--text">
              {(currentUser?.displayName || currentUser?.email || '?')[0].toUpperCase()}
            </div>
          )}
          <button id="logout-btn" className="gs-signout" onClick={handleLogout}>
            Sign out
          </button>
        </div>
      </header>

      {/* ── MAIN ── */}
      <main className="gs-main">

        {/* Page header */}
        <div className="gs-page-head">
          <div className="gs-page-head__left">
            <h1 className="gs-page-title">My Habits</h1>
            <p className="gs-page-rule">You can only log today's progress</p>
          </div>
          <button
            id="add-habit-btn"
            className="gs-add-btn"
            onClick={() => setShowModal(true)}
          >
            <span className="gs-add-btn__plus">+</span>
            New Habit
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="gs-loading">
            <div className="gs-spinner" />
          </div>
        ) : habits.length === 0 ? (
          <div className="gs-empty">
            <p className="gs-empty__number">00</p>
            <h2 className="gs-empty__heading">No habits tracked yet.</h2>
            <p className="gs-empty__sub">
              Add your first habit below and start building your streak.
            </p>
            <button className="gs-add-btn" onClick={() => setShowModal(true)}>
              <span className="gs-add-btn__plus">+</span>
              Create First Habit
            </button>
          </div>
        ) : (
          <div className="gs-habits">
            {habits.map((habit, i) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                index={i}
                onMarkToday={markToday}
                onDelete={deleteHabit}
              />
            ))}
          </div>
        )}
      </main>

      {showModal && (
        <AddHabitModal
          onClose={() => setShowModal(false)}
          onAdd={addHabit}
        />
      )}
    </div>
  );
}
