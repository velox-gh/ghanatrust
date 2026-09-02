/**
 * Canonical status → { label, tone, icon } tokens for the whole app.
 * Single source of truth — replaces the four drifting per-file maps.
 * Tones are static Tailwind class strings (Tailwind cannot compile dynamic names).
 */
import {
  Clock, CheckCircle, Handshake, CalendarCheck, Wrench, XCircle, Star,
  CurrencyCircleDollar, ArrowsCounterClockwise, WarningCircle, MagnifyingGlass,
  SealCheck, LockSimple, Hourglass, ShieldCheck, User, HardHat,
} from '@phosphor-icons/react';

const TONES = {
  amber: 'bg-amber-100 text-amber-800 border-amber-300',
  blue: 'bg-blue-100 text-blue-800 border-blue-300',
  indigo: 'bg-indigo-100 text-indigo-800 border-indigo-300',
  orange: 'bg-orange-100 text-orange-800 border-orange-300',
  emerald: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  green: 'bg-green-100 text-green-800 border-green-300',
  purple: 'bg-purple-100 text-purple-800 border-purple-300',
  red: 'bg-red-100 text-red-800 border-red-300',
  slate: 'bg-slate-100 text-slate-700 border-slate-300',
  navy: 'bg-navy-900 text-white border-navy-800',
};

export const NEUTRAL_TONE = TONES.slate;

export const STATUS_TOKENS = {
  booking: {
    REQUESTED: { label: 'Requested', tone: TONES.amber, icon: Clock },
    ACCEPTED: { label: 'Accepted', tone: TONES.blue, icon: CheckCircle },
    PRICE_AGREED: { label: 'Price Agreed', tone: TONES.indigo, icon: Handshake },
    SCHEDULED: { label: 'Scheduled', tone: TONES.indigo, icon: CalendarCheck },
    IN_PROGRESS: { label: 'In Progress', tone: TONES.orange, icon: Wrench },
    COMPLETED: { label: 'Completed', tone: TONES.emerald, icon: CheckCircle },
    PAID: { label: 'Paid', tone: TONES.green, icon: CurrencyCircleDollar },
    REVIEWED: { label: 'Reviewed', tone: TONES.purple, icon: Star },
    CANCELLED: { label: 'Cancelled', tone: TONES.red, icon: XCircle },
  },
  payment: {
    PENDING: { label: 'Pending', tone: TONES.amber, icon: Hourglass },
    COMPLETED: { label: 'Completed', tone: TONES.emerald, icon: CheckCircle },
    FAILED: { label: 'Failed', tone: TONES.red, icon: XCircle },
    REFUNDED: { label: 'Refunded', tone: TONES.slate, icon: ArrowsCounterClockwise },
  },
  dispute: {
    OPEN: { label: 'Open', tone: TONES.amber, icon: WarningCircle },
    UNDER_INVESTIGATION: { label: 'Under Investigation', tone: TONES.blue, icon: MagnifyingGlass },
    RESOLVED: { label: 'Resolved', tone: TONES.emerald, icon: SealCheck },
    CLOSED: { label: 'Closed', tone: TONES.slate, icon: LockSimple },
  },
  verification: {
    PENDING: { label: 'Pending Review', tone: TONES.amber, icon: Hourglass },
    VERIFIED: { label: 'Verified', tone: TONES.emerald, icon: SealCheck },
    REJECTED: { label: 'Rejected', tone: TONES.red, icon: XCircle },
  },
  role: {
    ADMIN: { label: 'Admin', tone: TONES.navy, icon: ShieldCheck },
    PROVIDER: { label: 'Provider', tone: TONES.emerald, icon: HardHat },
    CUSTOMER: { label: 'Customer', tone: TONES.blue, icon: User },
  },
};

/** Humanise an unknown status: PRICE_AGREED → "Price agreed" */
export const humaniseStatus = (status) =>
  String(status || '')
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/^\./, '')
    .replace(/^./, (c) => c.toUpperCase());

/**
 * Resolve a status string to its token. Tries `domain` first,
 * then searches every domain (callers can stay domain-agnostic).
 */
export const resolveStatus = (status, domain) => {
  if (!status) return null;
  if (domain && STATUS_TOKENS[domain]?.[status]) return STATUS_TOKENS[domain][status];
  for (const group of Object.values(STATUS_TOKENS)) {
    if (group[status]) return group[status];
  }
  return null;
};
