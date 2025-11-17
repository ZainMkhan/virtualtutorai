import React from 'react';
import { TrendingUp } from 'lucide-react';

interface StatItem {
  label: string;
  value: number;
  icon: any;
  color: string;
  bgColor: string;
  textColor: string;
  trend?: string;
  trendUp?: boolean;
}

interface StatsGridProps {
  stats: StatItem[];
}

export const StatsGrid: React.FC<StatsGridProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div key={index} className="group relative bg-white border border-slate-200 rounded-xl p-6 hover:border-slate-300 transition-all hover:shadow-md overflow-hidden">
            <div className={`absolute inset-0 bg-gradient-to-r ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity`}></div>
            <div className="relative flex items-start justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">{stat.label}</p>
                <p className="text-4xl font-bold text-slate-900 mt-3">{stat.value}</p>
                {stat.trend && stat.trendUp !== undefined && (
                  <p className={`text-xs font-semibold mt-3 flex items-center space-x-1 ${stat.trendUp ? 'text-emerald-600' : 'text-rose-600'}`}>
                    <TrendingUp className="w-3 h-3" />
                    <span>{stat.trendUp ? '+' : '-'}{stat.trend}</span>
                  </p>
                )}
              </div>
              <div className={`${stat.bgColor} p-4 rounded-lg group-hover:scale-110 transition-transform`}>
                <Icon className={`w-7 h-7 ${stat.textColor}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
