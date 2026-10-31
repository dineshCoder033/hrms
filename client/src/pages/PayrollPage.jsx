import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  CreditCard, 
  DollarSign, 
  Download, 
  CheckCircle2, 
  Send, 
  FileText,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';

export default function PayrollPage(props) {
  const context = useOutletContext() || {};
  const payrolls = props.payrolls ?? context.payrolls ?? [];
  const onProcessAll = props.onProcessAll ?? context.onProcessPayroll ?? props.onProcessAll;
  const [selectedSlip, setSelectedSlip] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processSuccess, setProcessSuccess] = useState(false);

  const totalPayroll = payrolls.reduce((acc, curr) => acc + curr.netPayable, 0);
  const totalPaid = payrolls.filter(p => p.paymentStatus === 'Paid').reduce((acc, curr) => acc + curr.netPayable, 0);
  const totalPending = payrolls.filter(p => p.paymentStatus === 'Pending').reduce((acc, curr) => acc + curr.netPayable, 0);

  const handleProcessClick = () => {
    setIsProcessing(true);
    setTimeout(() => {
      onProcessAll && onProcessAll();
      setIsProcessing(false);
      setProcessSuccess(true);
      setTimeout(() => setProcessSuccess(false), 4000);
    }, 1200);
  };

  return (
    <div className="w-full flex flex-col gap-6 animate-in fade-in duration-300 pb-8">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111317] tracking-tight">Payroll & Compensation</h2>
          <p className="text-xs text-gray-500 font-medium mt-0.5">Automated salary disbursements, tax deductions, and pay slips</p>
        </div>

        <button 
          onClick={handleProcessClick}
          disabled={isProcessing}
          className="flex items-center gap-2 bg-[#C7F436] hover:bg-[#B8E52B] text-black font-extrabold text-xs px-5 py-2.5 rounded-full transition shadow-lime-glow active:scale-95"
        >
          <Sparkles className="w-4 h-4" />
          <span>{isProcessing ? 'Processing Bank Transfers...' : 'Disburse All Payroll'}</span>
        </button>
      </div>

      {processSuccess && (
        <div className="bg-emerald-500 text-black font-bold p-3 rounded-2xl text-xs flex items-center justify-between animate-in fade-in">
          <span>✓ Direct deposit transfers triggered for all pending payroll accounts!</span>
          <span className="text-[10px] bg-black text-white px-2 py-0.5 rounded-full">ACH Network Sync</span>
        </div>
      )}

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-black text-white p-6 rounded-4xl shadow-soft-lg flex flex-col justify-between">
          <span className="text-xs font-bold text-gray-400">Total Net Disbursement</span>
          <p className="text-3xl sm:text-4xl font-mono font-black text-[#C7F436] mt-2">
            ${totalPayroll.toLocaleString()}
          </p>
          <span className="text-[11px] font-semibold text-gray-400 mt-3">Period: October 2026 Cycle</span>
        </div>

        <div className="bg-white p-6 rounded-4xl border border-gray-200/70 shadow-soft-sm flex flex-col justify-between">
          <span className="text-xs font-semibold text-gray-400">Disbursed (Paid)</span>
          <p className="text-3xl font-mono font-black text-emerald-600 mt-2">
            ${totalPaid.toLocaleString()}
          </p>
          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full inline-block mt-3 w-fit">
            ✓ Successfully Settled
          </span>
        </div>

        <div className="bg-white p-6 rounded-4xl border border-gray-200/70 shadow-soft-sm flex flex-col justify-between">
          <span className="text-xs font-semibold text-gray-400">Pending Execution</span>
          <p className="text-3xl font-mono font-black text-amber-600 mt-2">
            ${totalPending.toLocaleString()}
          </p>
          <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full inline-block mt-3 w-fit">
            ⏱ Ready for Payout
          </span>
        </div>
      </div>

      {/* Payroll Records Table */}
      <div className="bg-white p-6 rounded-4xl border border-gray-200/70 shadow-soft-sm">
        <h3 className="font-extrabold text-base text-gray-900 mb-4">October 2026 Payroll Register</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-100 text-gray-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="pb-3">Employee</th>
                <th className="pb-3">Role</th>
                <th className="pb-3">Base Salary</th>
                <th className="pb-3">Bonus & Allow</th>
                <th className="pb-3">Tax / Deductions</th>
                <th className="pb-3">Net Pay</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 font-medium">
              {payrolls.map((pay) => (
                <tr key={pay.id} className="hover:bg-gray-50/70 transition">
                  <td className="py-3.5 font-bold text-gray-900">{pay.employeeName}</td>
                  <td className="py-3.5 text-gray-500">{pay.employeeRole}</td>
                  <td className="py-3.5 font-mono text-gray-800">${pay.baseSalary.toLocaleString()}</td>
                  <td className="py-3.5 font-mono text-emerald-600 font-bold">+${(pay.bonus + pay.allowance).toLocaleString()}</td>
                  <td className="py-3.5 font-mono text-rose-600">-${(pay.deductions + pay.tax).toLocaleString()}</td>
                  <td className="py-3.5 font-mono font-black text-gray-950 text-sm">${pay.netPayable.toLocaleString()}</td>
                  <td className="py-3.5">
                    <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${
                      pay.paymentStatus === 'Paid' ? 'bg-[#C7F436] text-black' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {pay.paymentStatus}
                    </span>
                  </td>
                  <td className="py-3.5 text-right">
                    <button 
                      onClick={() => setSelectedSlip(pay)}
                      className="px-3 py-1.5 rounded-full bg-gray-100 hover:bg-black hover:text-white text-gray-700 font-bold text-xs transition inline-flex items-center gap-1"
                    >
                      <FileText className="w-3 h-3" /> Payslip
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payslip View Modal */}
      {selectedSlip && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#C7F436]" />
                <h3 className="font-extrabold text-base text-gray-900">TaskOrbit Official Salary Slip</h3>
              </div>
              <button 
                onClick={() => setSelectedSlip(null)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="py-4 space-y-4 text-xs">
              <div className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl">
                <div>
                  <h4 className="font-extrabold text-sm text-gray-900">{selectedSlip.employeeName}</h4>
                  <p className="text-gray-500 font-medium">{selectedSlip.employeeRole}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-gray-400">PAYROLL MONTH</span>
                  <p className="font-bold text-gray-900">{selectedSlip.month}</p>
                </div>
              </div>

              <div className="border border-gray-100 rounded-2xl p-4 divide-y divide-gray-100 space-y-2">
                <div className="flex justify-between py-1">
                  <span className="text-gray-500">Gross Base Salary</span>
                  <span className="font-mono font-bold">${selectedSlip.baseSalary.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1 text-emerald-600">
                  <span>Performance Bonus</span>
                  <span className="font-mono font-bold">+${selectedSlip.bonus.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1 text-emerald-600">
                  <span>Allowances (Travel & Remote)</span>
                  <span className="font-mono font-bold">+${selectedSlip.allowance.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1 text-rose-600">
                  <span>Federal & State Tax Withholding</span>
                  <span className="font-mono font-bold">-${selectedSlip.tax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1 text-rose-600">
                  <span>Health Insurance Deductions</span>
                  <span className="font-mono font-bold">-${selectedSlip.deductions.toLocaleString()}</span>
                </div>
                <div className="flex justify-between pt-3 font-black text-sm text-gray-950">
                  <span>Net Take-Home Pay</span>
                  <span className="font-mono font-black text-[#699E05]">${selectedSlip.netPayable.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-gray-400 px-1">
                <span>Method: {selectedSlip.paymentMethod}</span>
                <span>Status: {selectedSlip.paymentStatus}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
              <button 
                onClick={() => setSelectedSlip(null)}
                className="px-4 py-2 text-xs font-bold rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700"
              >
                Close
              </button>
              <button 
                onClick={() => { alert('Downloading PDF payslip...'); setSelectedSlip(null); }}
                className="px-4 py-2 text-xs font-bold rounded-full bg-black hover:bg-neutral-800 text-white flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
