import React from 'react';
import { useApp } from '../../store';
import { mockTransactions } from '../../mockData';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { DollarSign, Clock, Calendar, Download, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

const EarningsTab: React.FC = () => {
  const { transactions } = useApp();

  const displayedTransactions = transactions.length > 0 ? transactions : mockTransactions;
  const totalEarnings = displayedTransactions.reduce((sum, t) => sum + t.amount, 0);
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const pieData = [
    { name: 'Completed Payouts', value: totalEarnings },
    { name: 'Pending Escrow', value: 24500 }
  ];
  const COLORS = ['#10b981', '#f59e0b'];

  const handleDownloadInvoice = () => {
    toast.success("Payout statement downloaded");
  };

  return (
    <div className="animate-in fade-in zoom-in-95 duration-200 pb-12">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-zinc-900 tracking-tight">Financials & Earnings</h2>
          <p className="text-zinc-500 font-medium mt-1">Track room revenues, payment schedules, and payout receipts.</p>
        </div>
        <button 
          type="button"
          onClick={handleDownloadInvoice}
          className="px-4 py-2.5 bg-white border border-zinc-200 hover:border-zinc-300 text-zinc-800 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-xs flex items-center gap-2"
        >
          <Download size={15} />
          <span>Download Statement</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-emerald-50/70 p-6 rounded-3xl border border-emerald-100 flex flex-col justify-center">
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-emerald-700 mb-2">
            <DollarSign size={16} />
            <span>Total Earnings</span>
          </div>
          <p className="text-3xl font-black text-emerald-800">{formatCurrency(totalEarnings)}</p>
          <p className="text-[11px] text-emerald-600 mt-1 font-semibold">100% processed through StayHub Direct</p>
        </div>

        <div className="bg-amber-50/70 p-6 rounded-3xl border border-amber-100 flex flex-col justify-center">
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-amber-700 mb-2">
            <Clock size={16} />
            <span>Pending Payouts</span>
          </div>
          <p className="text-3xl font-black text-amber-800">{formatCurrency(24500)}</p>
          <p className="text-[11px] text-amber-600 mt-1 font-semibold">Scheduled for release upon tenant check-in</p>
        </div>

        <div className="bg-indigo-50/70 p-6 rounded-3xl border border-indigo-100 flex flex-col justify-center">
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-indigo-700 mb-2">
            <Calendar size={16} />
            <span>Next Payout Date</span>
          </div>
          <p className="text-3xl font-black text-indigo-800">Every Friday</p>
          <p className="text-[11px] text-indigo-600 mt-1 font-semibold">Direct transfer to linked bank account</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-3xl border border-zinc-200/80 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-zinc-400">Transaction History</h3>
            <span className="text-xs font-bold text-zinc-500">{displayedTransactions.length} Transactions</span>
          </div>
          <table className="w-full text-left">
            <thead className="bg-zinc-50 text-[10px] font-extrabold uppercase text-zinc-400 tracking-wider">
              <tr>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Transaction ID</th>
                <th className="px-6 py-4">Payment Method</th>
                <th className="px-6 py-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-sm">
              {displayedTransactions.map(t => (
                <tr key={t.id} className="hover:bg-zinc-50/60 transition-colors">
                  <td className="px-6 py-4 text-xs font-semibold text-zinc-500">{t.date}</td>
                  <td className="px-6 py-4 font-mono text-xs text-zinc-700 font-bold">{t.id}</td>
                  <td className="px-6 py-4 font-semibold text-xs text-zinc-900">
                    <span className="px-2.5 py-1 bg-zinc-100 rounded-lg text-zinc-700 font-bold">{t.paymentMethod}</span>
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-emerald-600">{formatCurrency(t.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-white rounded-3xl border border-zinc-200/80 shadow-sm p-6 flex flex-col items-center justify-center">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-zinc-400 w-full text-left mb-4">Revenue Breakdown</h3>
          <div className="w-full h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={pieData} 
                  cx="50%" 
                  cy="50%" 
                  innerRadius={55} 
                  outerRadius={75} 
                  paddingAngle={5} 
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any) => [formatCurrency(Number(value || 0)), 'Amount']}
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid #e4e4e7',
                    backgroundColor: '#ffffff',
                    color: '#18181b',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="w-full flex justify-center gap-6 mt-4 pt-4 border-t border-zinc-100">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
              <span className="text-xs font-bold text-zinc-600">Completed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
              <span className="text-xs font-bold text-zinc-600">Pending Escrow</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EarningsTab;
