import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { useAuth } from './AuthContext';
import { apiUrl } from '../utils/api';

type GameProgress = { stars: number; gamesPlayed: number };

type ProgressMap = {
  'math-puzzle': GameProgress;
  'hebrew-wordle': GameProgress;
  'english-wordle': GameProgress;
};

type ProgressContextType = {
  progress: ProgressMap;
  loading: boolean;
  saveProgress: () => Promise<void>;
  getTotalStars: () => number;
  loadProgressFromServer: () => Promise<void>;
};

const defaultProgress: ProgressMap = {
  'math-puzzle': { stars: 0, gamesPlayed: 0 },
  'hebrew-wordle': { stars: 0, gamesPlayed: 0 },
  'english-wordle': { stars: 0, gamesPlayed: 0 },
};

const ProgressContext = createContext<ProgressContextType | null>(null);

export const ProgressProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, token } = useAuth();
  const [progress, setProgress] = useState<ProgressMap>(() => {
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

  useEffect(() => {
    if (user && token) {
      loadProgressFromServer();
    } else {
      setProgress(defaultProgress);
      localStorage.removeItem('braingames_progress_local');
    }
  }, [user, token]); // eslint-disable-line

  const loadProgressFromServer = async () => {
    if (!user || !token) return;
    setLoading(true);
    try {
      const response = await fetch(apiUrl(`/api/progress/${user.id}`), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setProgress(data.progress);
        localStorage.setItem(
          'braingames_progress_local',
          JSON.stringify(data.progress),
        );
      }
    } catch (err) {
      console.error('Failed to load progress:', err);
    } finally {
      setLoading(false);
    }
  };

  const saveProgress = useCallback(async () => {
    if (user && token) {
      await loadProgressFromServer();
    }
  }, [user, token]); // eslint-disable-line

  const getTotalStars = useCallback(() => {
    return Object.values(progress).reduce(
      (total, p) => total + (p?.stars || 0),
      0,
    );
  }, [progress]);

  return (
    <ProgressContext.Provider
      value={{ progress, loading, saveProgress, getTotalStars, loadProgressFromServer }}
    >
      {children}
    </ProgressContext.Provider>
  );
};

export const useProgress = (): ProgressContextType => {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error('useProgress must be used within ProgressProvider');
  }
  return context;
};

export default ProgressContext;
