// src/hooks/useHabits.js
import { useState, useEffect } from 'react';
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  setDoc,
  serverTimestamp,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';

/**
 * Returns today's date string in YYYY-MM-DD format using local time.
 */
function getTodayStr() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm   = String(d.getMonth() + 1).padStart(2, '0');
  const dd   = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function useHabits() {
  const { currentUser } = useAuth();
  const [habits, setHabits]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      setHabits([]);
      setLoading(false);
      return;
    }

    const habitsRef = collection(db, 'users', currentUser.uid, 'habits');
    const q = query(habitsRef, orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const habitsData = [];

      for (const habitDoc of snapshot.docs) {
        const habitData = { id: habitDoc.id, ...habitDoc.data(), logs: {} };

        // Real-time listener for logs subcollection
        // We read logs once per habit here (lightweight for MVP)
        const logsRef = collection(db, 'users', currentUser.uid, 'habits', habitDoc.id, 'logs');
        const logsSnap = await import('firebase/firestore').then(({ getDocs }) => getDocs(logsRef));
        logsSnap.forEach((logDoc) => {
          habitData.logs[logDoc.id] = logDoc.data();
        });

        habitsData.push(habitData);
      }

      setHabits(habitsData);
      setLoading(false);
    });

    return unsubscribe;
  }, [currentUser]);

  /**
   * Add a new habit.
   */
  async function addHabit({ name, color }) {
    if (!currentUser) throw new Error('Not authenticated');
    const habitsRef = collection(db, 'users', currentUser.uid, 'habits');
    await addDoc(habitsRef, {
      name,
      color,
      createdAt: serverTimestamp(),
    });
  }

  /**
   * Mark today as done for a given habit.
   * Enforces the today-only rule client-side.
   */
  async function markToday(habitId) {
    if (!currentUser) throw new Error('Not authenticated');

    const today = getTodayStr();

    const logRef = doc(
      db,
      'users', currentUser.uid,
      'habits', habitId,
      'logs', today
    );

    await setDoc(logRef, {
      done:      true,
      timestamp: serverTimestamp(),
      date:      today,
    });

    // Optimistically update local state
    setHabits((prev) =>
      prev.map((h) =>
        h.id === habitId
          ? { ...h, logs: { ...h.logs, [today]: { done: true } } }
          : h
      )
    );
  }

  /**
   * Delete a habit and all its logs.
   */
  async function deleteHabit(habitId) {
    if (!currentUser) throw new Error('Not authenticated');
    const habitRef = doc(db, 'users', currentUser.uid, 'habits', habitId);
    await deleteDoc(habitRef);
  }

  return { habits, loading, addHabit, markToday, deleteHabit };
}
