import React from 'react';
import { Link } from 'react-router-dom';

const ServiceCard = ({ category }) => {
  return (
    <Link
      to={`/services?categoryId=${category.id}`}
      className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-emerald-300 transition-all duration-300 transform hover:-translate-y-1 flex flex-col justify-between group"
    >
      <div>
        <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition transform">
          {category.icon || '🛠️'}
        </div>
        <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-600 transition mb-1">
          {category.name}
        </h3>
        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
          {category.description || 'Verified local service professionals available for booking across Ghana.'}
        </p>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs">
        <span className="font-semibold text-emerald-700">
          {category._count?.services || 5}+ Services Available
        </span>
        <span className="text-slate-400 group-hover:translate-x-1 transition transform">
          Explore →
        </span>
      </div>
    </Link>
  );
};

export default ServiceCard;
