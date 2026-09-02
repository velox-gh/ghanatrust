
import { Link } from 'react-router-dom';
import { ArrowRight } from '@phosphor-icons/react';
import { getCategoryIcon } from './ui/categoryIcons';

const ServiceCard = ({ category }) => {
  const Icon = getCategoryIcon(category.name);

  return (
    <Link
      to={`/services?categoryId=${category.id}`}
      className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-card transition duration-200 hover:-translate-y-1 hover:border-trust-300 hover:shadow-lift motion-reduce:transform-none"
    >
      <div>
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-trust-100 bg-trust-50 text-trust-600 transition duration-200 group-hover:scale-110 motion-reduce:group-hover:scale-100">
          <Icon aria-hidden="true" weight="duotone" size={30} />
        </div>
        <h3 className="mb-1 text-lg font-bold tracking-tight text-navy-900 transition group-hover:text-trust-700">
          {category.name}
        </h3>
        <p className="mb-4 line-clamp-2 min-h-8 text-xs leading-relaxed text-slate-500">
          {category.description || 'Verified local service professionals available for booking across Ghana.'}
        </p>
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 pt-4 text-xs">
        <span className="font-semibold text-trust-700 tabular-nums">
          {category._count?.services || 5}+ Services Available
        </span>
        <span className="flex items-center gap-1 font-bold text-slate-400 transition group-hover:translate-x-1 group-hover:text-trust-600 motion-reduce:group-hover:translate-x-0">
          Explore <ArrowRight aria-hidden="true" weight="bold" size={12} />
        </span>
      </div>
    </Link>
  );
};

export default ServiceCard;
