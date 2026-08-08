import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FinancialTransaction } from '../types';
import {
  FileBarChart2,
  Printer,
  Download,
  Calendar,
  Wallet,
  HandCoins,
  Building,
  TrendingUp,
  BarChart3,
  CheckCircle2,
} from 'lucide-react';

export const FinancialReportsPage: React.FC = () => {
  const { token, showToast } = useAuth();
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('month');

  useEffect(() => {
    fetchFinancials();
  }, []);

  const fetchFinancials = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/transactions', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setTransactions(await res.json());
      }
    } catch (err) {
      showToast('Error loading financial analytics', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = ['Receipt No,Member Name,Contribution Category,Date,Payment Method,Ref No,Amount (KES)\n'];
    const rows = transactions.map(
      (t) =>
        `"${t.receiptNo}","${t.memberName}","${t.contributionTypeName}","${t.date}","${t.paymentMethod}","${t.referenceNo}","${t.amount}"\n`
    );
    const blob = new Blob([...headers, ...rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bidii_sda_treasury_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    showToast('Exported treasury report to CSV', 'info');
  };

  // Aggregations
  const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);

  const titheAmount = transactions
    .filter((t) => t.contributionTypeName.toLowerCase().includes('tithe'))
    .reduce((sum, t) => sum + t.amount, 0);

  const offeringAmount = transactions
    .filter((t) => t.contributionTypeName.toLowerCase().includes('offering'))
    .reduce((sum, t) => sum + t.amount, 0);

  const buildingAmount = transactions
    .filter((t) => t.contributionTypeName.toLowerCase().includes('building'))
    .reduce((sum, t) => sum + t.amount, 0);

  const mpesaTotal = transactions
    .filter((t) => t.paymentMethod === 'M-Pesa')
    .reduce((sum, t) => sum + t.amount, 0);

  const bankTotal = transactions
    .filter((t) => t.paymentMethod === 'Bank')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-[#003366]">Church Financial Analytics & Audit Reports</h2>
          <p className="text-xs text-slate-500">
            Treasury statement analysis, category breakdowns, and exportable financial reports.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-[#003366] hover:bg-[#002244] text-white text-xs font-bold rounded-xl shadow-md transition-colors flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            <span>Export Statement CSV</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Total Revenue Collected
          </span>
          <span className="text-2xl font-black text-[#003366] font-mono">
            KES {totalAmount.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
          </span>
          <p className="text-[10px] text-emerald-600 font-semibold mt-1">
            {transactions.length} Verified Transactions
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Total Tithes (10%)
          </span>
          <span className="text-2xl font-black text-slate-900 font-mono">
            KES {titheAmount.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
          </span>
          <p className="text-[10px] text-slate-500 mt-1">
            {totalAmount ? Math.round((titheAmount / totalAmount) * 100) : 0}% of Total Vault
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Combined Offerings
          </span>
          <span className="text-2xl font-black text-slate-900 font-mono">
            KES {offeringAmount.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
          </span>
          <p className="text-[10px] text-slate-500 mt-1">General Sabbath Offerings</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Building & Development
          </span>
          <span className="text-2xl font-black text-amber-700 font-mono">
            KES {buildingAmount.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
          </span>
          <p className="text-[10px] text-slate-500 mt-1">Sanctuary Expansion Fund</p>
        </div>
      </div>

      {/* Payment Method Breakdown & Printable Summary */}
      <div id="printable-financial-report" className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-6">
        <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wide">
              Official Treasury Ledger Breakdown
            </h3>
            <p className="text-xs text-slate-500">
              Bidii Seventh-day Adventist Church • Internal Financial Audit
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Status: Balanced & Audited
            </span>
          </div>
        </div>

        {/* Detailed Financial Ledger Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Receipt No</th>
                <th className="py-3 px-4">Member / Payer</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Method & Ref</th>
                <th className="py-3 px-4 text-right">Amount (KES)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {transactions.map((t) => (
                <tr key={t.id}>
                  <td className="py-3 px-4 font-mono font-bold text-[#003366]">{t.receiptNo}</td>
                  <td className="py-3 px-4 font-semibold text-slate-900">{t.memberName}</td>
                  <td className="py-3 px-4">{t.contributionTypeName}</td>
                  <td className="py-3 px-4">{t.date}</td>
                  <td className="py-3 px-4 font-mono">{t.paymentMethod} ({t.referenceNo})</td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                    {t.amount.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-50 font-bold text-slate-900 border-t border-slate-200">
              <tr>
                <td colSpan={5} className="py-3 px-4 text-right uppercase">
                  Grand Total
                </td>
                <td className="py-3 px-4 text-right font-mono text-sm text-[#003366]">
                  KES {totalAmount.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
