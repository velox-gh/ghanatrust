import { useState, useEffect, useCallback } from 'react';
import { serviceAPI } from '../services/api';

const STORAGE_KEY = 'gt.location';

/** Locations change rarely; re-asking the browser on every visit is noise. */
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

const readStored = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.location || Date.now() - parsed.savedAt > MAX_AGE_MS) return null;
    return parsed.location;
  } catch {
    return null;
  }
};

const writeStored = (location) => {
  try {
    if (location) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ location, savedAt: Date.now() }));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    /* Private mode / blocked storage — the picker still works, it just won't stick. */
  }
};

/**
 * The visitor's serviced location, resolved once and remembered.
 *
 * Deliberately does NOT prompt for geolocation on mount. An unexplained
 * permission dialog on first paint is the fastest way to get denied forever;
 * the user taps "Use my location" and the prompt then has obvious cause.
 * Until they do, or pick manually, location is null and results are nationwide.
 */
export const useUserLocation = () => {
  const [location, setLocation] = useState(readStored);
  const [detecting, setDetecting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    writeStored(location);
  }, [location]);

  const supported = typeof navigator !== 'undefined' && 'geolocation' in navigator;

  const detect = useCallback(() => {
    if (!supported) {
      setError('Your browser cannot share location. Pick your area instead.');
      return;
    }

    setDetecting(true);
    setError('');

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const res = await serviceAPI.getNearestLocation(coords.latitude, coords.longitude);
          if (res.data.location) {
            setLocation(res.data.location);
          } else {
            setError("We don't cover your area yet. Showing all of Ghana.");
          }
        } catch {
          setError('Could not match your location. Pick your area instead.');
        } finally {
          setDetecting(false);
        }
      },
      (err) => {
        setDetecting(false);
        setError(
          err.code === err.PERMISSION_DENIED
            ? 'Location access blocked. Pick your area instead.'
            : 'Could not read your location. Pick your area instead.'
        );
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 10 * 60 * 1000 }
    );
  }, [supported]);

  const clear = useCallback(() => {
    setLocation(null);
    setError('');
  }, []);

  return { location, setLocation, clear, detect, detecting, error, supported };
};

export default useUserLocation;
