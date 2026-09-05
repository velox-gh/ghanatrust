import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CaretDown, Lifebuoy, EnvelopeSimple, ChatCircleDots } from '@phosphor-icons/react';
import { Card } from '../components/ui';

const FAQS = [
  {
    q: 'How do I know a provider is genuine?',
    a: 'Every GhanaTrust provider passes Level 1 identity verification (Ghana Card + MoMo phone check) before appearing in search. Many also hold Level 2 skills verification (trade certificates) and earn Level 3 Trusted status after 20+ jobs with a 95%+ completion rate. Check the badges on any profile.',
  },
  {
    q: 'When do I pay for a job?',
    a: 'You pay only after the provider marks the job complete — through secure Paystack checkout (MTN MoMo, Telecel Cash, AT Money or card). GhanaTrust never asks you to pay a provider directly before work is done.',
  },
  {
    q: 'How does GhanaTrust make money?',
    a: 'We take a small 10% commission from completed jobs, which covers verification, payment protection and support. Providers can also optionally upgrade to Pro or Featured plans for higher search visibility.',
  },
  {
    q: 'What if something goes wrong with a job?',
    a: 'Open a dispute from the booking page. Our admin team investigates the evidence from both sides and works toward a fair resolution — including refunds where appropriate.',
  },
  {
    q: 'I\u2019m a provider. How do I get more bookings?',
    a: 'Complete all verification levels, write a detailed bio, respond to requests quickly, and collect reviews after every job. Providers with complete profiles and fast replies rank higher in search. Pro and Featured plans give an extra boost.',
  },
  {
    q: 'My payment went through but the booking still shows unpaid.',
    a: 'No money is ever lost. Open your dashboard or the Payments page — the system re-checks with Paystack automatically and confirms within seconds. If it still shows unpaid after a minute, contact support below with your Paystack reference.',
  },
];

const FAQ = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-card">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full cursor-pointer items-center justify-between gap-4 px-5 py-4 text-left"
      >
        <span className="text-sm font-bold text-navy-900">{q}</span>
        <CaretDown
          aria-hidden="true"
          size={14}
          weight="bold"
          className={`shrink-0 text-slate-400 transition duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <p className="border-t border-slate-100 px-5 py-4 text-sm leading-relaxed text-slate-600">{a}</p>
      )}
    </div>
  );
};

const Help = () => (
  <div className="min-h-screen bg-navy-50 py-12">
    <div className="mx-auto max-w-3xl px-4 sm:px-6">
      <div className="mb-8 text-center">
        <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-trust-200 bg-trust-50 px-4 py-1.5 text-xs font-semibold text-trust-700">
          <Lifebuoy aria-hidden="true" weight="duotone" size={14} />
          Help Centre
        </span>
        <h1 className="text-3xl font-black tracking-tight text-navy-900">How can we help?</h1>
        <p className="mt-2 text-sm text-slate-600">
          Answers to the questions we hear most. Can't find yours? Reach us below.
        </p>
      </div>

      <div className="mb-10 space-y-3">
        {FAQS.map((f) => (
          <FAQ key={f.q} q={f.q} a={f.a} />
        ))}
      </div>

      <Card padding="p-6" className="text-center">
        <h2 className="text-lg font-bold tracking-tight text-navy-900">Still need a human?</h2>
        <p className="mx-auto mt-1 max-w-md text-xs leading-relaxed text-slate-500">
          Our support team responds within one business day. Include your booking ID or Paystack reference
          where relevant — it speeds everything up.
        </p>
        <div className="mt-5 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a
            href="mailto:support@ghanatrust.com"
            className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-trust-600 px-5 py-2.5 text-sm font-bold text-white shadow-cta transition hover:bg-trust-700"
          >
            <EnvelopeSimple aria-hidden="true" weight="bold" size={15} />
            support@ghanatrust.com
          </a>
          <Link
            to="/disputes"
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
          >
            <ChatCircleDots aria-hidden="true" weight="bold" size={15} />
            Open a dispute
          </Link>
        </div>
      </Card>
    </div>
  </div>
);

export default Help;
