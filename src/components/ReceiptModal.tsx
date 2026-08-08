import React from 'react';
import { FinancialTransaction } from '../types';
import { X, Printer, Download, CheckCircle2, ShieldCheck, Church } from 'lucide-react';

interface ReceiptModalProps {
  receipt: FinancialTransaction | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ receipt, onClose }) => {
  if (!receipt) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150 my-8">
        {/* Header bar */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <span className="font-semibold text-sm">Verified Official Digital Receipt</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg transition-colors shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>Print / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Content */}
        <div id="printable-receipt" className="p-8 bg-white text-slate-800 space-y-6">
          {/* Church Letterhead */}
          <div className="text-center border-b border-slate-200 pb-6 space-y-1">
            <div className="w-12 h-12 mx-auto bg-[#003366] text-amber-400 rounded-full flex items-center justify-center shadow-md mb-2">
              <Church className="w-7 h-7" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-[#003366] uppercase">
              Bidii Seventh-day Adventist Church
            </h1>
            <p className="text-xs text-amber-700 font-semibold italic">
              "Proclaiming the Everlasting Gospel in Truth and Love"
            </p>
            <p className="text-xs text-slate-500">
              P.O. Box 4500-30100, Kitale / Eldoret Highway, Kenya • Tel: +254 722 000 111
            </p>
            <div className="pt-2">
              <span className="inline-block px-3 py-1 bg-amber-50 text-[#003366] text-xs font-bold uppercase tracking-wider rounded-full border border-amber-200">
                Official Financial Receipt
              </span>
            </div>
          </div>

          {/* Receipt Top Info Grid */}
          <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div>
              <span className="text-slate-500 block">Receipt Number</span>
              <span className="font-mono font-bold text-slate-900 text-sm">{receipt.receiptNo}</span>
            </div>
            <div className="text-right">
              <span className="text-slate-500 block">Transaction Date</span>
              <span className="font-semibold text-slate-900">{receipt.date}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Payment Method</span>
              <span className="font-semibold text-slate-900">{receipt.paymentMethod}</span>
            </div>
            <div className="text-right">
              <span className="text-slate-500 block">Reference / M-Pesa Code</span>
              <span className="font-mono font-semibold text-slate-900">{receipt.referenceNo}</span>
            </div>
          </div>

          {/* Member Details */}
          <div className="space-y-2">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Payer / Member Details</h2>
            <div className="bg-white p-3 rounded-lg border border-slate-200 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Full Name:</span>
                <span className="font-bold text-slate-900">{receipt.memberName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Member No:</span>
                <span className="font-mono font-medium text-slate-700">{receipt.memberNo}</span>
              </div>
            </div>
          </div>

          {/* Contribution Breakdown Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#003366] text-white">
                <tr>
                  <th className="py-2.5 px-4 font-semibold">Contribution Category</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Amount (KES)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-3 px-4 font-medium text-slate-800">
                    {receipt.contributionTypeName}
                    {receipt.notes && <p className="text-[11px] text-slate-500 mt-0.5">{receipt.notes}</p>}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 text-sm">
                    {receipt.amount.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tbody>
              <tfoot className="bg-slate-50 border-t border-slate-200 font-bold text-slate-900">
                <tr>
                  <td className="py-3 px-4 text-right uppercase text-slate-600">Total Received</td>
                  <td className="py-3 px-4 text-right font-mono text-base text-[#003366]">
                    KES {receipt.amount.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Footer Signatures & QR Verification */}
          <div className="pt-4 border-t border-slate-200 grid grid-cols-2 gap-4 items-center">
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Verified by Church Treasury</span>
              </div>
              <p className="text-[11px] text-slate-500">Authorized Officer: {receipt.treasurerName}</p>
              <p className="text-[10px] text-slate-400 italic">"God loves a cheerful giver" — 2 Cor 9:7</p>
            </div>

            {/* QR Code Verification Graphic */}
            <div className="flex flex-col items-end text-center space-y-1">
              <div className="w-20 h-20 bg-slate-100 border border-slate-300 p-1 rounded-lg flex items-center justify-center">
                <div className="w-full h-full bg-slate-900 p-1 flex flex-col justify-between rounded">
                  <div className="flex justify-between">
                    <div className="w-3 h-3 bg-white"></div>
                    <div className="w-3 h-3 bg-white"></div>
                  </div>
                  <div className="text-[8px] text-white font-mono tracking-tighter text-center">BSD-SDA</div>
                  <div className="flex justify-between">
                    <div className="w-3 h-3 bg-white"></div>
                    <div className="w-3 h-3 bg-white"></div>
                  </div>
                </div>
              </div>
              <span className="text-[9px] font-mono text-slate-400">VERIFY-{receipt.receiptNo}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
