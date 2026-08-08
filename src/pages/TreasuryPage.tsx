import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FinancialTransaction, Member, ContributionType } from '../types';
import { ReceiptModal } from '../components/ReceiptModal';
import {
  Wallet,
  PlusCircle,
  Receipt,
  Search,
  Filter,
  DollarSign,
  Printer,
  CheckCircle2,
  X,
  CreditCard,
  Building2,
} from 'lucide-react';

export const TreasuryPage: React.FC = () => {
  const { token, user, showToast } = useAuth();

  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<FinancialTransaction | null>(null);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  // Form State
  const [memberId, setMemberId] = useState('');
  const [amount, setAmount] = useState('');
  const [contributionTypeId, setContributionTypeId] = useState('ct-1');
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'M-Pesa' | 'Bank' | 'Cheque' | 'Other'>('M-Pesa');
  const [referenceNo, setReferenceNo] = useState('');
  const [notes, setNotes] = useState('');

  const canRecord = user?.role === 'SUPER_ADMIN' || user?.role === 'TREASURER';

  useEffect(() => {
    fetchTreasuryData();
  }, []);

  const fetchTreasuryData = async () => {
    setLoading(true);
    try {
      const [resT, resM] = await Promise.all([
        fetch('/api/transactions', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/members', { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (resT.ok) setTransactions(await resT.json());
      if (resM.ok) {
        const mems = await resM.json();
        setMembers(mems);
        if (mems.length > 0) setMemberId(mems[0].id);
      }
    } catch (err) {
      showToast('Error loading treasury data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRecordTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      showToast('Please enter a valid amount', 'error');
      return;
    }

    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          memberId,
          amount,
          contributionTypeId,
          paymentMethod,
          referenceNo: referenceNo || `REF-${Math.floor(Math.random() * 899999 + 100000)}`,
          notes,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed recording transaction');

      showToast(`Receipt ${data.receiptNo} generated successfully!`, 'success');
      setShowAddModal(false);
      setAmount('');
      setReferenceNo('');
      setNotes('');
      fetchTreasuryData();

      // Launch Digital Receipt Modal instantly
      setSelectedReceipt(data);
    } catch (err: any) {
      showToast(err.message || 'Error saving financial record', 'error');
    }
  };

  const filteredTx = transactions.filter((t) => {
    const matchesSearch =
      t.receiptNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.referenceNo.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter ? t.contributionTypeId === typeFilter : true;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-[#003366]">Treasury & Digital Receipts</h2>
          <p className="text-xs text-slate-500">
            Record Tithes, Offerings, Building Funds, and issue verified digital receipts.
          </p>
        </div>

        {canRecord && (
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold rounded-xl shadow-md transition-colors flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Record Tithe / Offering</span>
          </button>
        )}
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search Receipt No, Member, M-Pesa Ref..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#003366]"
          />
        </div>

        <div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#003366]"
          >
            <option value="">All Contribution Types</option>
            <option value="ct-1">Tithe (10%)</option>
            <option value="ct-2">Combined Offering</option>
            <option value="ct-3">Church Building & Development</option>
            <option value="ct-4">Evangelism & Mission</option>
            <option value="ct-5">Youth Department</option>
            <option value="ct-6">Dorcas / Welfare Fund</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#003366] text-white font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Receipt No</th>
                <th className="py-3.5 px-4">Member Name</th>
                <th className="py-3.5 px-4">Contribution Category</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Payment Method</th>
                <th className="py-3.5 px-4">Amount (KES)</th>
                <th className="py-3.5 px-4 text-center">Digital Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredTx.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-[#003366]">{tx.receiptNo}</td>
                  <td className="py-3 px-4 font-semibold text-slate-900">{tx.memberName}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-800 rounded-md font-medium border border-blue-200">
                      {tx.contributionTypeName}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-medium">{tx.date}</td>
                  <td className="py-3 px-4 font-mono font-medium">{tx.paymentMethod} ({tx.referenceNo})</td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-900 text-sm">
                    KES {tx.amount.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => setSelectedReceipt(tx)}
                      className="px-3 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-lg font-bold transition-colors inline-flex items-center gap-1 text-[11px]"
                    >
                      <Receipt className="w-3.5 h-3.5 text-amber-600" />
                      <span>View Receipt</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Contribution Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-base text-[#003366]">Record Contribution & Issue Receipt</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleRecordTransaction} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Select Church Member *</label>
                <select
                  value={memberId}
                  onChange={(e) => setMemberId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl font-medium"
                >
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.fullName} ({m.memberNo} - {m.phone})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Contribution Type *</label>
                <select
                  value={contributionTypeId}
                  onChange={(e) => setContributionTypeId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl font-medium"
                >
                  <option value="ct-1">Tithe (10%)</option>
                  <option value="ct-2">Combined Offering</option>
                  <option value="ct-3">Church Building & Development</option>
                  <option value="ct-4">Evangelism & Mission</option>
                  <option value="ct-5">Youth Department</option>
                  <option value="ct-6">Dorcas / Welfare Fund</option>
                  <option value="ct-7">Thanksgiving Offering</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Amount (KES) *</label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="e.g. 15000"
                    className="w-full p-2.5 bg-slate-50 border rounded-xl font-mono font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Payment Method *</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl font-medium"
                  >
                    <option value="M-Pesa">M-Pesa</option>
                    <option value="Cash">Cash</option>
                    <option value="Bank">Bank Transfer</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  M-Pesa Reference / Bank Transaction Code
                </label>
                <input
                  type="text"
                  value={referenceNo}
                  onChange={(e) => setReferenceNo(e.target.value)}
                  placeholder="e.g. RHK829102X"
                  className="w-full p-2.5 bg-slate-50 border rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Notes / Remarks</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. August Sabbath Tithe"
                  className="w-full p-2.5 bg-slate-50 border rounded-xl"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#003366] text-white font-bold rounded-xl shadow-md"
                >
                  Generate Official Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Digital Receipt Modal */}
      <ReceiptModal receipt={selectedReceipt} onClose={() => setSelectedReceipt(null)} />
    </div>
  );
};
