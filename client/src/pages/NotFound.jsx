
import { Compass } from '@phosphor-icons/react';
import { Button } from '../components/ui';

const NotFound = () => {
  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-navy-50 p-4">
      <div className="max-w-md rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-lift">
        <span className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-trust-50 text-trust-600">
          <Compass aria-hidden="true" weight="duotone" size={34} />
        </span>
        <h1 className="mb-2 text-5xl font-black tracking-tight text-navy-900">404</h1>
        <h2 className="mb-2 text-lg font-bold text-navy-900">Page Not Found</h2>
        <p className="mb-6 text-sm leading-relaxed text-slate-500">
          The requested page doesn't exist or has been moved within GhanaTrust.
        </p>
        <div className="flex flex-col justify-center gap-2 sm:flex-row">
          <Button to="/">Return to Homepage</Button>
          <Button to="/services" variant="secondary">Browse Services</Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
