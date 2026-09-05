import { useState, useEffect, useRef } from 'react';
import { MapPin, CaretDown, Crosshair, X, Check } from '@phosphor-icons/react';
import { serviceAPI } from '../services/api';
import Spinner from './ui/Spinner';

/**
 * The location control that lives in the header, Jiji-style: a chip showing
 * where results are coming from, opening a panel with "use my location" and the
 * full region list.
 *
 * Detection is user-initiated (see useUserLocation) — the browser prompt only
 * appears after they press the button that asks for it.
 */
const LocationPicker = ({ location, onChange, onDetect, detecting, error, className = '' }) => {
  const [open, setOpen] = useState(false);
  const [regions, setRegions] = useState([]);
  const [loadingRegions, setLoadingRegions] = useState(false);
  const panelRef = useRef(null);
  const triggerRef = useRef(null);

  // Regions are only needed once the panel is opened, and opening is an event
  // rather than a state to synchronise — so the fetch hangs off the handler.
  const loadRegions = () => {
    if (regions.length || loadingRegions) return;
    setLoadingRegions(true);
    serviceAPI
      .getLocations()
      .then((res) => setRegions(res.data.regions || []))
      .catch(() => setRegions([]))
      .finally(() => setLoadingRegions(false));
  };

  const toggle = () => {
    setOpen((wasOpen) => {
      if (!wasOpen) loadRegions();
      return !wasOpen;
    });
  };

  // Dismiss on outside click and on Escape.
  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e) => {
      if (panelRef.current?.contains(e.target) || triggerRef.current?.contains(e.target)) return;
      setOpen(false);
    };
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const label = location?.name || 'All Ghana';

  const select = (loc) => {
    onChange(loc);
    setOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-haspopup="dialog"
        className="flex w-full items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-left text-sm font-semibold text-navy-900 transition hover:border-trust-400"
      >
        <MapPin aria-hidden="true" weight="fill" size={16} className="shrink-0 text-trust-600" />
        <span className="min-w-0 flex-1 truncate">{label}</span>
        <CaretDown aria-hidden="true" weight="bold" size={12} className="shrink-0 text-slate-400" />
        <span className="sr-only-x">Change location</span>
      </button>

      {open && (
        <div
          ref={panelRef}
          role="dialog"
          aria-label="Choose your location"
          className="absolute left-0 right-0 z-50 mt-2 max-h-96 w-full min-w-72 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-lift"
        >
          <button
            type="button"
            onClick={onDetect}
            disabled={detecting}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-bold text-trust-700 transition hover:bg-trust-50 disabled:opacity-60"
          >
            {detecting ? (
              <Spinner size="sm" className="text-trust-600" />
            ) : (
              <Crosshair aria-hidden="true" weight="bold" size={16} />
            )}
            {detecting ? 'Finding you…' : 'Use my current location'}
          </button>

          {error && (
            <p role="status" className="px-3 py-2 text-xs leading-relaxed text-amber-700">
              {error}
            </p>
          )}

          {location && (
            <button
              type="button"
              onClick={() => select(null)}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              <X aria-hidden="true" weight="bold" size={16} />
              Show all of Ghana
            </button>
          )}

          <div className="my-1 border-t border-slate-100" />

          {loadingRegions ? (
            <div className="flex justify-center py-6">
              <Spinner className="text-trust-600" />
            </div>
          ) : (
            regions.map((region) => (
              <div key={region.id} className="mb-1">
                <p className="px-3 pb-1 pt-2 text-[10px] font-black uppercase tracking-wider text-slate-400">
                  {region.name}
                </p>
                {region.locations?.map((loc) => {
                  const active = location?.id === loc.id;
                  return (
                    <button
                      key={loc.id}
                      type="button"
                      onClick={() => select({ id: loc.id, name: loc.name, region: { id: region.id, name: region.name } })}
                      aria-current={active ? 'true' : undefined}
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition ${
                        active
                          ? 'bg-trust-50 font-bold text-trust-700'
                          : 'font-medium text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {loc.name}
                      {active && <Check aria-hidden="true" weight="bold" size={14} />}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default LocationPicker;
