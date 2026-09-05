import { useState, useEffect, useCallback } from 'react';
import { savedAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

// Module-level shared cache — one fetch for the whole app, optimistic toggles.
let cache = { ids: null };
let inflight = null;
const listeners = new Set();
const notify = () => listeners.forEach((l) => l());

export default function useSavedProviders() {
  const { user, isAuthenticated } = useAuth();
  const isCustomer = isAuthenticated && user?.role === 'CUSTOMER';
  const [, force] = useState(0);

  useEffect(() => {
    const l = () => force((n) => n + 1);
    listeners.add(l);
    return () => listeners.delete(l);
  }, []);

  useEffect(() => {
    if (!isCustomer) {
      cache.ids = null;
      return undefined;
    }
    if (cache.ids === null && !inflight) {
      inflight = savedAPI
        .list()
        .then((res) => {
          cache.ids = new Set((res.data.providers || []).map((p) => p.id));
          notify();
        })
        .catch(() => {
          cache.ids = new Set();
        })
        .finally(() => {
          inflight = null;
        });
    }
    return undefined;
  }, [isCustomer]);

  const isSaved = useCallback((id) => !!(cache.ids && cache.ids.has(id)), []);

  const toggle = useCallback(async (id) => {
    if (!cache.ids) return;
    const wasSaved = cache.ids.has(id);
    if (wasSaved) cache.ids.delete(id); else cache.ids.add(id);
    notify();
    try {
      if (wasSaved) await savedAPI.unsave(id); else await savedAPI.save(id);
    } catch {
      if (wasSaved) cache.ids.add(id); else cache.ids.delete(id);
      notify();
    }
  }, []);

  return { isSaved, toggle, isCustomer };
}
