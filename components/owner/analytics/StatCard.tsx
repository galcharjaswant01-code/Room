import React, { useEffect, useState } from 'react';
import CountUp from 'react-countup';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number;
  prefix?: string;
  suffix?: string;
  icon: React.ElementType;
  trend?: number;
  isLoading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, prefix = '', suffix = '', icon: Icon, trend, isLoading }) => {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-zinc-800 p-6 shadow-sm flex flex-col h-full transition-colors">
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl">
          <Icon size={20} strokeWidth={2.5} />
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${trend >= 0 ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400'}`}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </div>
        )}
      </div>
      
      <div>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium mb-1">{title}</p>
        <h3 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
          {isLoading ? (
            <div className="h-9 w-24 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
          ) : (
            <div className="flex items-baseline">
               {prefix}
               <CountUp 
                 end={value} 
                 duration={2} 
                 separator="," 
                 decimals={value % 1 !== 0 ? 1 : 0} 
               />
               {suffix}
            </div>
          )}
        </h3>
      </div>
    </div>
  );
};

export default StatCard;
