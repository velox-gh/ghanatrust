import { Link } from 'react-router-dom';
import { ShieldCheck, UsersThree, Handshake, ArrowRight, Certificate, CurrencyCircleDollar } from '@phosphor-icons/react';
import { Button } from '../components/ui';

const VALUES = [
  {
    icon: ShieldCheck,
    title: 'Trust before transactions',
    body: 'Every professional on GhanaTrust passes identity verification before they can take a single job. No anonymous strangers — real, checked people.',
  },
  {
    icon: UsersThree,
    title: 'Local first',
    body: 'We start where relationships matter: Kumasi, Accra, Takoradi and beyond. Verified artisans in your community, rated by your neighbours.',
  },
  {
    icon: CurrencyCircleDollar,
    title: 'Fair and transparent',
    body: 'Providers keep the lion\u2019s share of every job. Customers pay through secure Paystack checkout only after work is done — never upfront to strangers.',
  },
];

const About = () => (
  <div className="bg-navy-50">
    <section className="bg-navy-900 py-16 text-white">
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
        <span className="mb-3 inline-block rounded-full border border-navy-700 bg-navy-800/80 px-4 py-1.5 text-xs font-semibold text-trust-300">
          About GhanaTrust
        </span>
        <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
          Ending the <span className="bg-gradient-to-r from-trust-400 to-teal-300 bg-clip-text text-transparent">"who can I trust?"</span> problem in Ghana
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">
          Finding a reliable electrician, plumber or AC technician in Ghana has always been word-of-mouth roulette.
          GhanaTrust replaces guesswork with verified identities, certified skills, and honest reviews — so every
          booking starts with confidence.
        </p>
      </div>
    </section>

    <section className="py-16">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 md:grid-cols-3 lg:px-8">
        {VALUES.map(({ icon: Icon, title, body }) => (
          <div key={title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
            <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-trust-50 text-trust-600">
              <Icon aria-hidden="true" weight="duotone" size={26} />
            </span>
            <h2 className="mb-2 text-lg font-bold tracking-tight text-navy-900">{title}</h2>
            <p className="text-sm leading-relaxed text-slate-600">{body}</p>
          </div>
        ))}
      </div>
    </section>

    <section className="border-t border-slate-200 bg-white py-16">
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
        <Handshake aria-hidden="true" weight="duotone" size={40} className="mx-auto text-trust-600" />
        <h2 className="mt-4 text-2xl font-black tracking-tight text-navy-900">
          Built for Ghana's service economy
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-slate-600">
          From the certified master electrician in Kumasi to the first-time customer in Accra, GhanaTrust exists so
          that skill and honesty win. Providers grow real businesses. Customers get work done without fear.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button to="/services" size="lg">
            Find a Professional <ArrowRight aria-hidden="true" weight="bold" size={15} />
          </Button>
          <Button to="/register" variant="secondary" size="lg">
            Become a Verified Pro
          </Button>
        </div>
        <p className="mt-6 text-xs text-slate-500">
          Questions? Visit the <Link to="/help" className="font-bold text-trust-600 hover:underline">Help Centre</Link>.
        </p>
      </div>
    </section>
  </div>
);

export default About;
