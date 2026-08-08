import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FinancialTransaction, Pledge } from '../types';
import { ReceiptModal } from '../components/ReceiptModal';
import {
  User,
  Wallet,
  HandCoins,
  Receipt,
  CheckCircle2,
  Phone,
  ShieldCheck,
  Calendar,
  Building,
  Award,
  Sparkles,
} from 'lucide-react';

export const MemberDashboard: React.FC = () => {
  const { member, token, showToast } = useAuth();
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [pledges, setPledges] = useState<Pledge[]>([]);
  const [selectedReceipt, setSelectedReceipt] = useState<FinancialTransaction | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMemberData();
  }, [member]);

  const fetchMemberData = async () => {
    if (!member) return;
    setLoading(true);
    try {
      const [resT, resP] = await Promise.all([
        fetch('/api/transactions', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/pledges', { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (resT.ok) setTransactions(await resT.json());
      if (resP.ok) setPledges(await resP.json());
    } catch (err) {
      showToast('Error loading personal record history', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!member) {
    return (
      <div className="p-8 text-center text-slate-500">
        Member record link required. Contact church secretariat.
      </div>
    );
  }

  // Personal metrics calculations
  const myTithes = transactions
    .filter((t) => t.contributionTypeName.toLowerCase().includes('tithe'))
    .reduce((sum, t) => sum + t.amount, 0);

  const myOfferings = transactions
    .filter((t) => t.contributionTypeName.toLowerCase().includes('offering'))
    .reduce((sum, t) => sum + t.amount, 0);

  const myTotalContributions = transactions.reduce((sum, t) => sum + t.amount, 0);

  const myActivePledges = pledges.filter((p) => p.status === 'Active');
  const myPledgeBalance = pledges.reduce((sum, p) => sum + p.balance, 0);

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Card Banner */}
      <div className="bg-gradient-to-r from-[#002244] via-[#003366] to-[#004080] rounded-3xl p-6 md:p-8 text-white shadow-xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <img
            src={
              member.photoUrl ||
              'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&auto=format&fit=crop&q=80'
            }
            alt={member.fullName}
            className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover border-4 border-amber-400 shadow-xl shrink-0"
          />
          <div className="space-y-1 text-center md:text-left">
            <span className="px-3 py-1 bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-bold uppercase tracking-wider rounded-full">
              Registered Church Member • {member.memberNo}
            </span>
            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              Welcome back, {member.fullName}
            </h2>
            <p className="text-xs text-slate-300 flex items-center gap-2 justify-center md:justify-start pt-1">
              <span>Department: {member.departmentName || 'General Sabbath School'}</span>
              <span>•</span>
              <span className="text-emerald-400 font-semibold">{member.baptismStatus}</span>
            </p>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/20 text-center md:text-right">
          <span className="text-[11px] font-semibold text-amber-300 uppercase block">
            Verified Member Status
          </span>
          <span className="text-lg font-bold text-white font-mono">{member.status}</span>
        </div>
      </div>

      {/* Member Details & Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            My Total Tithe Given
          </span>
          <span className="text-2xl font-black text-[#003366] font-mono">
            KES {myTithes.toLocaleString('en-KE')}
          </span>
          <p className="text-[10px] text-emerald-600 font-semibold">10% Holy Tithe Recorded</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            My Combined Offerings
          </span>
          <span className="text-2xl font-black text-slate-900 font-mono">
            KES {myOfferings.toLocaleString('en-KE')}
          </span>
          <p className="text-[10px] text-slate-500">General Sabbath offerings</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Total Contributions
          </span>
          <span className="text-2xl font-black text-emerald-700 font-mono">
            KES {myTotalContributions.toLocaleString('en-KE')}
          </span>
          <p className="text-[10px] text-slate-500">All church contributions</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Pledge Outstanding
          </span>
          <span className="text-2xl font-black text-amber-600 font-mono">
            KES {myPledgeBalance.toLocaleString('en-KE')}
          </span>
          <p className="text-[10px] text-slate-500">{myActivePledges.length} Active Pledges</p>
        </div>
      </div>

      {/* Active Pledges Section */}
      {pledges.length > 0 && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <HandCoins className="w-4 h-4 text-amber-600" />
            <span>My Active Pledges & Commitments</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pledges.map((pledge) => {
              const percent = Math.min(100, Math.round((pledge.amountPaid / pledge.targetAmount) * 100));
              return (
                <div key={pledge.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-xs text-slate-900">{pledge.title}</h4>
                      <p className="text-[11px] text-slate-500">{pledge.description}</p>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        pledge.status === 'Completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {pledge.status}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-mono font-semibold text-slate-700">
                      <span>Paid: KES {pledge.amountPaid.toLocaleString('en-KE')}</span>
                      <span>Target: KES {pledge.targetAmount.toLocaleString('en-KE')}</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full rounded-full" style={{ width: `${percent}%` }}></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Personal Contribution & Receipt History Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">My Financial Contributions & Digital Receipts</h3>
            <p className="text-xs text-slate-500">View and print official receipts for your tithes and offerings.</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Receipt No</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Payment Method</th>
                <th className="py-3 px-4">Amount (KES)</th>
                <th className="py-3 px-4 text-center">Digital Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No financial transaction receipts recorded yet.
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[#003366]">{tx.receiptNo}</td>
                    <td className="py-3 px-4 font-medium">{tx.date}</td>
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
                        className="px-3 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-lg font-bold transition-colors inline-flex items-center gap-1.5 text-[11px]"
                      >
                        <Receipt className="w-3.5 h-3.5 text-amber-600" />
                        <span>View / Print</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Digital Receipt Modal */}
      <ReceiptModal receipt={selectedReceipt} onClose={() => setSelectedReceipt(null)} />
    </div>
  );
};
