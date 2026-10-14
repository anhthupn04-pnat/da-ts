import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  accentColor?: 'blue' | 'emerald' | 'amber' | 'purple' | 'rose';
}

export default function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  accentColor = 'blue'
}: StatCardProps) {
  const getAccentBadge = () => {
    switch (accentColor) {
      case 'emerald':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'amber':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'purple':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'rose':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            {title}
          </span>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {value}
            </span>
            {trend && (
              <span
                className={`text-[11px] font-bold px-1.5 py-0.5 rounded-md ${
                  trend.isPositive ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}
              >
                {trend.value}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="mt-1 text-xs text-slate-400">
              {subtitle}
            </p>
          )}
        </div>

        <div className={`w-11 h-11 rounded-xl flex items-center justify-center border ${getAccentBadge()}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
