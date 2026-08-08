import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Pledge, Member } from '../types';
import {
  HandCoins,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  DollarSign,
  X,
  CreditCard,
  User,
} from 'lucide-react';

export const PledgesPage: React.FC = () => {
  const { token, user, showToast } = useAuth();

  const [pledges, setPledges] = useState<Pledge[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPledge, setSelectedPledge] = useState<Pledge | null>(null);

  // Create Pledge Form
  const [memberId, setMemberId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [dueDate, setDueDate] = useState('2026-12-31');

  // Pay Pledge Form
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState<'Cash' | 'M-Pesa' | 'Bank' | 'Cheque' | 'Other'>('M-Pesa');
  const [payRef, setPayRef] = useState('');

  const canManage = user?.role === 'SUPER_ADMIN' || user?.role === 'TREASURER';

  useEffect(() => {
    fetchPledgesData();
  }, []);

  const fetchPledgesData = async () => {
    setLoading(true);
    try {
      const [resP, resM] = await Promise.all([
        fetch('/api/pledges', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/members', { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (resP.ok) setPledges(await resP.json());
      if (resM.ok) {
        const mems = await resM.json();
        setMembers(mems);
        if (mems.length > 0) setMemberId(mems[0].id);
      }
    } catch (err) {
      showToast('Error loading pledges records', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePledge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetAmount || parseFloat(targetAmount) <= 0) {
      showToast('Please enter a valid target amount', 'error');
      return;
    }

    try {
      const res = await fetch('/api/pledges', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          memberId,
          title,
          description,
          targetAmount,
          dueDate,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed creating pledge');

      showToast(`Pledge ${data.pledgeCode} created successfully`, 'success');
      setShowAddModal(false);
      setTitle('');
      setDescription('');
      setTargetAmount('');
      fetchPledgesData();
    } catch (err: any) {
      showToast(err.message || 'Error creating pledge', 'error');
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPledge || !payAmount || parseFloat(payAmount) <= 0) {
      showToast('Please enter a valid payment amount', 'error');
      return;
    }

    try {
      const res = await fetch(`/api/pledges/${selectedPledge.id}/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: payAmount,
          paymentMethod: payMethod,
          referenceNo: payRef,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed recording pledge payment');

      showToast(`Pledge payment recorded! Remaining balance: KES ${data.pledge.balance}`, 'success');
      setSelectedPledge(null);
      setPayAmount('');
      setPayRef('');
      fetchPledgesData();
    } catch (err: any) {
      showToast(err.message || 'Error recording pledge payment', 'error');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-[#003366]">Pledge Management & Commitments</h2>
          <p className="text-xs text-slate-500">
            Track member pledges, target building campaigns, and payments.
          </p>
        </div>

        {canManage && (
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold rounded-xl shadow-md transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Pledge</span>
          </button>
        )}
      </div>

      {/* Pledges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {pledges.map((p) => {
          const percent = Math.min(100, Math.round((p.amountPaid / p.targetAmount) * 100));
          return (
            <div
              key={p.id}
              className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-mono text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      {p.pledgeCode}
                    </span>
                    <h3 className="font-bold text-sm text-slate-900 mt-1">{p.title}</h3>
                    <p className="text-xs text-slate-500">{p.memberName} ({p.memberNo})</p>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      p.status === 'Completed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {p.status}
                  </span>
                </div>

                <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  {p.description || 'General Church Development Commitment'}
                </p>

                {/* Progress Bar */}
                <div className="space-y-1 pt-1">
                  <div className="flex justify-between text-xs font-mono font-bold text-slate-800">
                    <span>Paid: KES {p.amountPaid.toLocaleString('en-KE')}</span>
                    <span>Target: KES {p.targetAmount.toLocaleString('en-KE')}</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="bg-[#003366] h-full rounded-full transition-all duration-300"
                      style={{ width: `${percent}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500 pt-0.5">
                    <span>Progress: {percent}%</span>
                    <span className="font-bold text-amber-700">Balance: KES {p.balance.toLocaleString('en-KE')}</span>
                  </div>
                </div>
              </div>

              {canManage && p.status === 'Active' && (
                <button
                  onClick={() => setSelectedPledge(p)}
                  className="w-full py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <HandCoins className="w-4 h-4" />
                  <span>Record Payment for Pledge</span>
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Create Pledge Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-base text-[#003366]">Create Member Pledge</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleCreatePledge} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Select Member *</label>
                <select
                  value={memberId}
                  onChange={(e) => setMemberId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl font-medium"
                >
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.fullName} ({m.memberNo})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Pledge Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. New Sanctuary Construction Pledge"
                  className="w-full p-2.5 bg-slate-50 border rounded-xl"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Target Amount (KES) *</label>
                <input
                  type="number"
                  required
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  placeholder="e.g. 50000"
                  className="w-full p-2.5 bg-slate-50 border rounded-xl font-mono font-bold"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
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
                <button type="submit" className="px-5 py-2.5 bg-[#003366] text-white font-bold rounded-xl">
                  Save Pledge Commitment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {selectedPledge && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-base text-[#003366]">Record Pledge Payment</h3>
              <button onClick={() => setSelectedPledge(null)} className="p-1 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-xs">
              <p className="font-bold text-amber-900">{selectedPledge.title}</p>
              <p className="text-amber-800">Member: {selectedPledge.memberName}</p>
              <p className="font-mono font-bold text-amber-950 mt-1">
                Outstanding Balance: KES {selectedPledge.balance.toLocaleString('en-KE')}
              </p>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Payment Amount (KES) *</label>
                <input
                  type="number"
                  required
                  step="0.01"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  placeholder="e.g. 10000"
                  className="w-full p-2.5 bg-slate-50 border rounded-xl font-mono font-bold"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Payment Method</label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl"
                >
                  <option value="M-Pesa">M-Pesa</option>
                  <option value="Cash">Cash</option>
                  <option value="Bank">Bank</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Transaction Ref Code</label>
                <input
                  type="text"
                  value={payRef}
                  onChange={(e) => setPayRef(e.target.value)}
                  placeholder="e.g. RHK829104Z"
                  className="w-full p-2.5 bg-slate-50 border rounded-xl font-mono"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t">
                <button
                  type="button"
                  onClick={() => setSelectedPledge(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2.5 bg-amber-400 text-slate-950 font-bold rounded-xl">
                  Post Payment & Issue Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
