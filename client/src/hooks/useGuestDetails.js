import { useState, useCallback } from 'react';

const STORAGE_KEY = 'gt.guest';

const EMPTY = { firstName: '', lastName: '', email: '', phoneNumber: '' };

const read = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    return { ...EMPTY, ...JSON.parse(raw) };
  } catch {
    return EMPTY;
  }
};

/**
 * The contact details a guest types when booking, remembered on their device so
 * a second booking is one tap. Never holds anything secret — name, email and
 * phone only, which is exactly what they are about to hand the provider anyway.
 */
export const useGuestDetails = () => {
  const [details, setDetails] = useState(read);

  const save = useCallback((next) => {
    setDetails(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* Blocked storage just means they retype next time. */
    }
  }, []);

  const forget = useCallback(() => {
    setDetails(EMPTY);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* no-op */
    }
  }, []);

  const hasSaved = Boolean(details.email && details.firstName);

  return { details, setDetails, save, forget, hasSaved };
};

export default useGuestDetails;
