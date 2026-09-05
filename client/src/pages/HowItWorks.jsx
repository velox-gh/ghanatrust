import { Link } from 'react-router-dom';
import {
  ShieldCheck, SealCheck, Trophy, ArrowRight, Handshake, Phone,
  IdentificationCard, Certificate, TrendUp, UsersThree, MagnifyingGlass,
  CalendarCheck, Wallet,
} from '@phosphor-icons/react';
import Button from '../components/ui/Button';
import TrustBadge from '../components/ui/TrustBadge';
import CalligraphyWord from '../components/ui/CalligraphyWord';

// Proof-strip content — the numbers behind the trust claim
const PROOF_STATS = [
  { icon: ShieldCheck, value: '3-Level', label: 'Verification System' },
  { icon: UsersThree, value: '1,000+', label: 'Verified Artisans' },
  { icon: TrendUp, value: '95%+', label: 'Job Completion Rate' },
  { icon: Handshake, value: '100%', label: 'Ghana Card Checked' },
];

// What actually happens when you book — the part people ask about first
const BOOKING_STEPS = [
  {
    icon: MagnifyingGlass,
    title: 'Find someone',
    body: 'Search or browse the feed. No account needed to look — filter by your area and see who is verified.',
  },
  {
    icon: CalendarCheck,
    title: 'Book in under a minute',
    body: 'Pick a date, say where the job is, leave your name and phone. That is it — you can book as a guest and create a password later if you want to.',
  },
  {
    icon: Handshake,
    title: 'They accept and do the work',
    body: 'The professional confirms your request and agrees a price with you before anything starts.',
  },
  {
    icon: Wallet,
    title: 'Pay after it is done',
    body: 'Payment is released once the job is complete. If something goes wrong, you can raise a dispute and we step in.',
  },
];

// The 3-level verification ladder — Level 3 earns the gold treatment
const TRUST_LEVELS = [
  {
    level: 1,
    icon: IdentificationCard,
    title: 'Identity Verified',
    points: ['Government-issued Ghana Card validation', 'Phone number verified via MoMo', 'Residence & emergency contact records'],
    badge: 'bg-blue-50 text-blue-700 border-blue-200',
    iconBg: 'bg-blue-100 text-blue-700',
  },
  {
    level: 2,
    icon: Certificate,
    title: 'Profession Verified',
    points: ['Trade certifications checked', 'Master apprenticeship evidence', 'Workplace or shop inspection'],
    badge: 'bg-trust-50 text-trust-700 border-trust-200',
    iconBg: 'bg-trust-100 text-trust-700',
  },
  {
    level: 3,
    icon: Trophy,
    title: 'Trusted Professional',
    points: ['20+ completed jobs on record', '95%+ completion rate', 'Verified customer star reviews'],
    badge: 'bg-gold-50 text-gold-700 border-gold-200',
    iconBg: 'bg-gold-100 text-gold-700',
  },
];

/**
 * The story page. Everything that used to sit between a visitor and the
 * listings now lives here, reached by the people who actually want it.
 */
const HowItWorks = () => (
  <div className="bg-navy-50">
    {/* ============ HERO ============ */}
    <section className="relative overflow-hidden bg-navy-900 py-20 text-white lg:py-28">
      <div className="pointer-events-none absolute -z-0 right-0 top-0 h-96 w-96 rounded-full bg-trust-600/20 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -z-0 bottom-0 left-0 h-96 w-96 rounded-full bg-indigo-600/20 blur-3xl" aria-hidden="true" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-navy-700 bg-navy-800/80 px-4 py-1.5 text-xs font-semibold text-trust-300">
            <ShieldCheck aria-hidden="true" weight="fill" size={14} />
            Ghana&apos;s Trust-First Service Marketplace
          </div>

          <h1 className="mb-6 text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            Who Can You{' '}
            {/* The promise the whole product rests on, written by hand in white ink */}
            <CalligraphyWord className="text-white">Trust</CalligraphyWord>{' '}
            To Do The Job?
          </h1>

          <p className="mx-auto mb-10 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
            Every electrician, plumber, AC technician and carpenter on GhanaTrust is checked before
            you ever see them. Here is exactly how that works — and what protects you when you book.
          </p>

          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button to="/" size="lg">
              Browse professionals
              <ArrowRight aria-hidden="true" weight="bold" size={15} />
            </Button>
            <Button to="/register?role=provider" variant="onDark" size="lg">
              Become a Verified Pro
            </Button>
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-slate-300">
            <span className="flex items-center gap-1.5">
              <ShieldCheck aria-hidden="true" weight="fill" size={13} className="text-trust-400" /> Ghana Card ID Verified
            </span>
            <span className="flex items-center gap-1.5">
              <Phone aria-hidden="true" weight="fill" size={13} className="text-trust-400" /> MoMo Phone Verified
            </span>
            <span className="flex items-center gap-1.5">
              <SealCheck aria-hidden="true" weight="fill" size={13} className="text-trust-400" /> Trade Skill Certified
            </span>
          </div>
        </div>
      </div>
    </section>

    {/* ============ PROOF STRIP ============ */}
    <section aria-label="GhanaTrust by the numbers" className="border-b border-navy-800 bg-navy-950">
      <div className="mx-auto grid max-w-7xl grid-cols-2 divide-navy-800 px-4 py-8 sm:px-6 md:grid-cols-4 md:divide-x lg:px-8">
        {PROOF_STATS.map(({ icon: Icon, value, label }) => (
          <div key={label} className="flex items-center justify-center gap-3 px-4 py-2">
            <Icon aria-hidden="true" weight="duotone" size={28} className="text-trust-500" />
            <div>
              <p className="text-xl font-black tracking-tight text-white tabular-nums">{value}</p>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{label}</p>
            </div>
          </div>
        ))}
      </div>
    </section>

    {/* ============ BOOKING FLOW ============ */}
    <section className="border-b border-slate-200 bg-white py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <span className="mb-1 block text-xs font-bold uppercase tracking-widest text-trust-600">
            Booking a job
          </span>
          <h2 className="text-3xl font-black tracking-tight text-navy-900">Four steps, no account required</h2>
        </div>

        <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {BOOKING_STEPS.map(({ icon: Icon, title, body }, i) => (
            <li
              key={title}
              className="rounded-3xl border border-slate-200 bg-slate-50/60 p-6 shadow-card"
            >
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-trust-100 text-trust-700">
                  <Icon aria-hidden="true" weight="duotone" size={22} />
                </span>
                <span className="text-2xl font-black tabular-nums text-slate-300">{i + 1}</span>
              </div>
              <h3 className="mb-1.5 text-base font-bold tracking-tight text-navy-900">{title}</h3>
              <p className="text-xs leading-relaxed text-slate-600">{body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>

    {/* ============ THE TRUST LADDER ============ */}
    <section id="verification" className="border-b border-slate-200 bg-navy-50 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <span className="mb-1 block text-xs font-bold uppercase tracking-widest text-trust-600">
            The GhanaTrust Differentiator
          </span>
          <h2 className="text-3xl font-black tracking-tight text-navy-900">
            Our 3-Level Verification System
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            We eliminate uncertainty by thoroughly vetting every professional before they serve your
            home or business.
          </p>
        </div>

        <ol className="relative mx-auto max-w-4xl space-y-6">
          {TRUST_LEVELS.map(({ level, icon: Icon, title, points, badge, iconBg }, i) => (
            <li key={level} className="relative">
              {i < TRUST_LEVELS.length - 1 && (
                <span
                  aria-hidden="true"
                  className="absolute left-7 top-16 h-[calc(100%-2rem)] w-px bg-gradient-to-b from-slate-300 to-slate-200"
                />
              )}
              <div className="relative flex gap-5 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-card transition duration-200 hover:shadow-lift sm:p-8">
                <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${iconBg}`}>
                  <Icon aria-hidden="true" weight="duotone" size={28} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <TrustBadge level={level} />
                    <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${badge}`}>
                      Level {level}
                    </span>
                  </div>
                  <h3 className="mb-1.5 text-lg font-bold tracking-tight text-navy-900">{title}</h3>
                  <ul className="grid gap-1.5 sm:grid-cols-3">
                    {points.map((point) => (
                      <li key={point} className="flex items-start gap-1.5 text-xs leading-relaxed text-slate-600">
                        <SealCheck aria-hidden="true" weight="fill" size={13} className="mt-0.5 shrink-0 text-trust-500" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>

    {/* ============ CTA BAND ============ */}
    <section className="bg-navy-900 py-16">
      <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
        <h2 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
          Ready to hire with confidence?
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-slate-300">
          Join thousands of Ghanaian households and businesses who never have to ask
          &ldquo;who can I trust?&rdquo; again.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button to="/" size="lg">
            Find a Professional
            <ArrowRight aria-hidden="true" weight="bold" size={15} />
          </Button>
          <Button to="/register?role=provider" variant="onDark" size="lg">
            Become a Verified Pro
          </Button>
        </div>
        <p className="mt-6 text-xs text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-trust-300 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </section>
  </div>
);

export default HowItWorks;
