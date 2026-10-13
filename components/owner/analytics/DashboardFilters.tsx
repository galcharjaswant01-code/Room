import React from 'react';
import { DateRangeFilter } from '../../../services/analyticsService';
import { Calendar, Download, RefreshCw, FileText, Table } from 'lucide-react';

interface Props {
  dateFilter: DateRangeFilter;
  setDateFilter: (filter: DateRangeFilter) => void;
  onRefresh: () => void;
  onExportCSV: () => void;
  onExportPDF: () => void;
  onExportExcel: () => void;
  isRefreshing: boolean;
}

const DashboardFilters: React.FC<Props> = ({ 
  dateFilter, setDateFilter, onRefresh, onExportCSV, onExportPDF, onExportExcel, isRefreshing 
}) => {
  const [exportOpen, setExportOpen] = React.useState(false);

  const filterOptions: { value: DateRangeFilter, label: string }[] = [
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: '7days', label: 'Last 7 Days' },
    { value: '30days', label: 'Last 30 Days' },
    { value: '90days', label: 'Last 90 Days' },
    { value: '6months', label: 'Last 6 Months' },
    { value: '12months', label: 'Last 12 Months' },
    { value: 'this_year', label: 'This Year' },
  ];

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
      <div>
        <h2 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight">Analytics Overview</h2>
        <p className="text-zinc-500 dark:text-zinc-400 font-medium mt-1">Track your property performance and revenue.</p>
      </div>

      <div className="flex items-center gap-3 w-full sm:w-auto">
        {/* Date Filter */}
        <div className="relative flex-1 sm:flex-none">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Calendar size={16} className="text-zinc-400" />
          </div>
          <select 
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value as DateRangeFilter)}
            className="w-full sm:w-48 appearance-none bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-sm font-medium rounded-xl pl-10 pr-10 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors cursor-pointer"
          >
            {filterOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
            <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
          </div>
        </div>

        {/* Refresh Button */}
        <button 
          onClick={onRefresh}
          disabled={isRefreshing}
          className="p-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
          title="Refresh Data"
        >
          <RefreshCw size={18} className={isRefreshing ? 'animate-spin' : ''} />
        </button>

        {/* Export Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setExportOpen(!exportOpen)}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-indigo-600/20"
          >
            <Download size={16} />
            <span className="hidden sm:inline">Export</span>
          </button>

          {exportOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setExportOpen(false)}></div>
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl z-20 py-2 overflow-hidden animate-in fade-in slide-in-from-top-2">
                <button onClick={() => { onExportCSV(); setExportOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 flex items-center gap-2">
                  <Table size={16} className="text-zinc-400" /> Export CSV
                </button>
                <button onClick={() => { onExportExcel(); setExportOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 flex items-center gap-2">
                  <FileText size={16} className="text-emerald-500" /> Export Excel
                </button>
                <button onClick={() => { onExportPDF(); setExportOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 flex items-center gap-2">
                  <FileText size={16} className="text-rose-500" /> Export PDF
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardFilters;
