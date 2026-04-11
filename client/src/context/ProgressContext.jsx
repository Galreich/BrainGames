import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext'; // Direct import to avoid circular dependency

const ProgressContext = createContext(null);

const defaultProgress = {
  math: { stars: 0, gamesPlayed: 0 },
  hebrew: { stars: 0, gamesPlayed: 0 },
  english: { stars: 0, gamesPlayed: 0 },
};

export const ProgressProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [progress, setProgress] = useState(() => {
    // Load local progress from localStorage
    const saved = localStorage.getItem('braingames_progress_local');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return defaultProgress;
      }
    }
    return defaultProgress;
  });
  const [loading, setLoading] = useState(false);

  // Load progress from server when user logs in
  useEffect(() => {
    if (user && token) {
      loadProgressFromServer();
    }
  }, [user, token]); // eslint-disable-line

  const loadProgressFromServer = async () => {
    if (!user || !token) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/progress/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setProgress(data.progress);
        localStorage.setItem('braingames_progress_local', JSON.stringify(data.progress));
      }
    } catch (err) {
      console.error('Failed to load progress:', err);
    } finally {
      setLoading(false);
    }
  };

  const saveProgress = useCallback(async (subject, starsEarned) => {
    // Update local state immediately
    setProgress((prev) => {
      const updated = {
        ...prev,
        [subject]: {
          stars: (prev[subject]?.stars || 0) + starsEarned,
          gamesPlayed: (prev[subject]?.gamesPlayed || 0) + 1,
        },
      };
      localStorage.setItem('braingames_progress_local', JSON.stringify(updated));
      return updated;
    });

    // Save to server if logged in
    if (user && token) {
      try {
        await fetch('/api/progress/save', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ subject, stars: starsEarned, gamesPlayed: 1 }),
        });
      } catch (err) {
        console.error('Failed to save progress to server:', err);
      }
    }
  }, [user, token]);

  const getTotalStars = useCallback(() => {
    return Object.values(progress).reduce((total, p) => total + (p?.stars || 0), 0);
  }, [progress]);

  return (
    <ProgressContext.Provider value={{ progress, loading, saveProgress, getTotalStars, loadProgressFromServer }}>
      {children}
    </ProgressContext.Provider>
  );
};

export const useProgress = () => {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error('useProgress must be used within ProgressProvider');
  }
  return context;
};

export default ProgressContext;
