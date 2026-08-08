import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FinancialTransaction, Member, ChurchAsset, Pledge } from '../types';
import { ReceiptModal } from '../components/ReceiptModal';
import {
  Users,
  Wallet,
  HandCoins,
  Package,
  TrendingUp,
  ArrowUpRight,
  PlusCircle,
  Receipt,
  Eye,
  CheckCircle2,
  PieChart as PieIcon,
  BarChart3,
  Calendar,
  Filter,
} from 'lucide-react';

interface AdminDashboardProps {
  navigateTo: (tab: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ navigateTo }) => {
  const { token, showToast } = useAuth();

  const [members, setMembers] = useState<Member[]>([]);
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [assets, setAssets] = useState<ChurchAsset[]>([]);
  const [pledges, setPledges] = useState<Pledge[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState<FinancialTransaction | null>(null);
  const [dateRange, setDateRange] = useState('month');

  useEffect(() => {
    fetchDashboardData();
  }, [dateRange]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [resM, resT, resA, resP] = await Promise.all([
        fetch('/api/members', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/transactions', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/assets', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/pledges', { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (resM.ok) setMembers(await resM.json());
      if (resT.ok) setTransactions(await resT.json());
      if (resA.ok) setAssets(await resA.json());
      if (resP.ok) setPledges(await resP.json());
    } catch (err) {
      showToast('Failed loading dashboard statistics', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Calculations
  const totalMembersCount = members.length;
  const activeMembersCount = members.filter((m) => m.status === 'Active').length;
  const maleMembersCount = members.filter((m) => m.gender === 'Male').length;
  const femaleMembersCount = members.filter((m) => m.gender === 'Female').length;
  const baptizedCount = members.filter((m) => m.baptismStatus === 'Baptized').length;

  const totalTithes = transactions
    .filter((t) => t.contributionTypeName.toLowerCase().includes('tithe'))
    .reduce((sum, t) => sum + t.amount, 0);

  const totalOfferings = transactions
    .filter((t) => t.contributionTypeName.toLowerCase().includes('offering'))
    .reduce((sum, t) => sum + t.amount, 0);

  const totalContributions = transactions.reduce((sum, t) => sum + t.amount, 0);

  const totalOutstandingPledges = pledges.reduce((sum, p) => sum + p.balance, 0);
  const totalAssetsValue = assets.reduce((sum, a) => sum + a.totalValue, 0);

  return (
    <div className="space-[#003366] space-y-8 pb-12">
      {/* Top Banner & Date Filter */}
      <div className="bg-gradient-to-r from-[#002244] via-[#003366] to-[#004080] rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-slate-800">
        <div className="space-y-1">
          <span className="px-3 py-1 bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[11px] font-semibold rounded-full uppercase tracking-wider">
            Executive Administrative Portal
          </span>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight">
            Bidii SDA Church Analytics Overview
          </h2>
          <p className="text-xs text-slate-300">
            Real-time financial status, membership statistics, pledges, and asset metrics.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => navigateTo('treasury')}
            className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Record Tithe/Offering</span>
          </button>
          <button
            onClick={() => navigateTo('members')}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-medium text-xs rounded-xl border border-white/20 transition-all flex items-center gap-1.5"
          >
            <Users className="w-4 h-4" />
            <span>Add New Member</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Members Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Members
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#003366] flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-900 font-mono">{totalMembersCount}</span>
            <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
              <span className="text-emerald-600 font-bold">{activeMembersCount} Active</span>
              <span>•</span>
              <span>{baptizedCount} Baptized</span>
            </div>
          </div>
        </div>

        {/* Total Tithes Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Tithe Received
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-[#003366] font-mono">
              KES {totalTithes.toLocaleString('en-KE')}
            </span>
            <div className="flex items-center gap-1 mt-1 text-[11px] text-emerald-600 font-semibold">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>100% Verified in Treasury</span>
            </div>
          </div>
        </div>

        {/* Total Offerings Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Combined Offerings
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <HandCoins className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-900 font-mono">
              KES {totalOfferings.toLocaleString('en-KE')}
            </span>
            <div className="text-[11px] text-slate-500 mt-1">
              General Sabbath contributions
            </div>
          </div>
        </div>

        {/* Total Church Asset Value */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Asset Value
            </span>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-900 font-mono">
              KES {totalAssetsValue.toLocaleString('en-KE')}
            </span>
            <div className="text-[11px] text-slate-500 mt-1">
              {assets.length} Registered Equipment & Items
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Membership Demographics Box */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-[#003366]" />
              <span>Membership Demographics</span>
            </h3>
            <button onClick={() => navigateTo('members')} className="text-[11px] text-[#003366] font-bold hover:underline">
              View All
            </button>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span>Gender Distribution</span>
                <span>
                  {maleMembersCount} Male / {femaleMembersCount} Female
                </span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex">
                <div
                  className="bg-[#003366] h-full"
                  style={{ width: `${totalMembersCount ? (maleMembersCount / totalMembersCount) * 100 : 50}%` }}
                ></div>
                <div
                  className="bg-amber-500 h-full"
                  style={{ width: `${totalMembersCount ? (femaleMembersCount / totalMembersCount) * 100 : 50}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span>Baptism Rate</span>
                <span>
                  {baptizedCount} / {totalMembersCount} ({totalMembersCount ? Math.round((baptizedCount / totalMembersCount) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full"
                  style={{ width: `${totalMembersCount ? (baptizedCount / totalMembersCount) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Pledges Summary Box */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <HandCoins className="w-4 h-4 text-amber-600" />
              <span>Church Pledges Status</span>
            </h3>
            <button onClick={() => navigateTo('pledges')} className="text-[11px] text-[#003366] font-bold hover:underline">
              Manage Pledges
            </button>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-amber-50 rounded-xl border border-amber-200/60 text-xs">
              <div>
                <span className="text-amber-800 font-semibold block">Outstanding Balance</span>
                <span className="text-lg font-black text-amber-950 font-mono">
                  KES {totalOutstandingPledges.toLocaleString('en-KE')}
                </span>
              </div>
              <span className="px-2.5 py-1 bg-amber-200 text-amber-900 font-bold rounded-lg text-[10px]">
                {pledges.filter((p) => p.status === 'Active').length} Active Pledges
              </span>
            </div>

            <div className="text-xs text-slate-600 space-y-1">
              {pledges.slice(0, 2).map((pledge) => (
                <div key={pledge.id} className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-slate-800">{pledge.title}</p>
                    <p className="text-[10px] text-slate-500">{pledge.memberName}</p>
                  </div>
                  <span className="font-mono font-bold text-slate-900">
                    KES {pledge.balance.toLocaleString('en-KE')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Treasury Quick Stats */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-600" />
              <span>Total Financial Vault</span>
            </h3>
            <button onClick={() => navigateTo('reports')} className="text-[11px] text-[#003366] font-bold hover:underline">
              Full Reports
            </button>
          </div>

          <div className="p-4 bg-[#003366] text-white rounded-xl space-y-2">
            <span className="text-xs text-amber-300 font-medium uppercase tracking-wider block">
              Cumulative Church Income
            </span>
            <span className="text-2xl font-black font-mono">
              KES {totalContributions.toLocaleString('en-KE')}
            </span>
            <p className="text-[11px] text-slate-300 pt-1">
              Includes Tithes, Offerings, Building Funds, and Departmental Contributions.
            </p>
          </div>
        </div>
      </div>

      {/* Recent Financial Transactions Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Recent Financial Transactions</h3>
            <p className="text-xs text-slate-500">Live recorded receipts from members and departments.</p>
          </div>
          <button
            onClick={() => navigateTo('treasury')}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl transition-colors"
          >
            View All Transactions
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Receipt No</th>
                <th className="py-3 px-4">Member Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Payment Method</th>
                <th className="py-3 px-4">Amount (KES)</th>
                <th className="py-3 px-4 text-center">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {transactions.slice(0, 5).map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-[#003366]">{tx.receiptNo}</td>
                  <td className="py-3 px-4 font-semibold text-slate-900">{tx.memberName}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-800 rounded-md font-medium border border-blue-200">
                      {tx.contributionTypeName}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-medium">{tx.paymentMethod} ({tx.referenceNo})</td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">
                    KES {tx.amount.toLocaleString('en-KE')}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => setSelectedReceipt(tx)}
                      className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg transition-colors border border-amber-200 inline-flex items-center gap-1 text-[11px] font-bold"
                    >
                      <Receipt className="w-3.5 h-3.5" />
                      <span>View</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Digital Receipt Modal Component */}
      <ReceiptModal receipt={selectedReceipt} onClose={() => setSelectedReceipt(null)} />
    </div>
  );
};
