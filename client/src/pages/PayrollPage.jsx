import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  CreditCard, 
  CheckCircle2, 
  FileText,
  Sparkles,
  Lock,
  Play,
  ShieldCheck,
  AlertCircle,
  X
} from 'lucide-react';
import { 
  fetchPayroll, 
  generatePayrollRun, 
  approvePayrollRun, 
  executeSalaryPayouts, 
  fetchPayslip 
} from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function PayrollPage(props) {
  const context = useOutletContext() || {};
  const { user } = useAuth();
  const [payrolls, setPayrolls] = useState(props.payrolls ?? context.payrolls ?? []);
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().toISOString().slice(0, 7)); // 'YYYY-MM'
  const [selectedSlip, setSelectedSlip] = useState(null);
  const [slipLoading, setSlipLoading] = useState(false);

  const [isGenerating, setIsGenerating] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [isConfirmPayoutOpen, setIsConfirmPayoutOpen] = useState(false);

  const [statusMessage, setStatusMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const isAdmin = user?.role === 'Admin';
  const isHrOrAdmin = ['Admin', 'HR'].includes(user?.role);

  const loadPayrolls = async () => {
    try {
      const data = await fetchPayroll({ month: selectedMonth });
      setPayrolls(data);
    } catch {
      // Ignore
    }
  };

  useEffect(() => {
    loadPayrolls();
  }, [selectedMonth]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setErrorMessage(null);
    setStatusMessage(null);
    try {
      const res = await generatePayrollRun(selectedMonth);
      setStatusMessage(res.message);
      await loadPayrolls();
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApprove = async () => {
    setIsApproving(true);
    setErrorMessage(null);
    setStatusMessage(null);
    try {
      const res = await approvePayrollRun(selectedMonth);
      setStatusMessage(res.message);
      await loadPayrolls();
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setIsApproving(false);
    }
  };

  const handleConfirmPayout = async () => {
    setIsPaying(true);
    setErrorMessage(null);
    setStatusMessage(null);
    try {
      const res = await executeSalaryPayouts(selectedMonth, 'MockProvider');
      setStatusMessage(res.message);
      setIsConfirmPayoutOpen(false);
      await loadPayrolls();
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setIsPaying(false);
    }
  };

  const handleOpenPayslip = async (id) => {
    setSlipLoading(true);
    try {
      const slipData = await fetchPayslip(id);
      setSelectedSlip(slipData);
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setSlipLoading(false);
    }
  };

  const totalPayroll = payrolls.reduce((acc, curr) => acc + (curr.netPayable || 0), 0);
  const totalPaid = payrolls.filter(p => (p.status || p.paymentStatus) === 'Paid').reduce((acc, curr) => acc + (curr.netPayable || 0), 0);
  const approvedList = payrolls.filter(p => (p.status || p.paymentStatus) === 'Approved');
  const approvedAmount = approvedList.reduce((acc, curr) => acc + (curr.netPayable || 0), 0);
  const hasDrafts = payrolls.some(p => (p.status || p.paymentStatus) === 'Draft');

  return (
    <div className="w-full flex flex-col gap-6 animate-in fade-in duration-300 pb-8">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111317] tracking-tight">Payroll & Salary Payouts</h2>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            Draft → Maker-Checker Approval → Direct Idempotent Bank Disbursement
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Month Picker */}
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-white border border-gray-200 rounded-full px-4 py-2 text-xs font-bold text-gray-800 shadow-soft-sm focus:outline-none focus:border-black"
          />

          {isHrOrAdmin && (
            <button 
              onClick={handleGenerate}
              disabled={isGenerating}
              className="flex items-center gap-1.5 bg-white hover:bg-gray-50 text-black border border-gray-200 font-bold text-xs px-4 py-2.5 rounded-full transition shadow-soft-sm active:scale-95 disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5" />
              <span>{isGenerating ? 'Generating...' : 'Generate Draft'}</span>
            </button>
          )}

          {isAdmin && hasDrafts && (
            <button 
              onClick={handleApprove}
              disabled={isApproving}
              className="flex items-center gap-1.5 bg-black hover:bg-neutral-800 text-white font-bold text-xs px-4 py-2.5 rounded-full transition shadow-md active:scale-95 disabled:opacity-50"
            >
              <Lock className="w-3.5 h-3.5 text-[#C7F436]" />
              <span>{isApproving ? 'Locking...' : 'Approve & Lock'}</span>
            </button>
          )}

          {isAdmin && approvedList.length > 0 && (
            <button 
              onClick={() => setIsConfirmPayoutOpen(true)}
              className="flex items-center gap-2 bg-[#C7F436] hover:bg-[#B8E52B] text-black font-extrabold text-xs px-5 py-2.5 rounded-full transition shadow-lime-glow active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>Pay Salaries ({approvedList.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* Notifications */}
      {errorMessage && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 font-bold p-3.5 rounded-2xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {statusMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 font-bold p-3.5 rounded-2xl text-xs flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            {statusMessage}
          </span>
          <span className="text-[10px] bg-black text-[#C7F436] px-2.5 py-0.5 rounded-full">Cycle: {selectedMonth}</span>
        </div>
      )}

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-black text-white p-6 rounded-4xl shadow-soft-lg flex flex-col justify-between">
          <span className="text-xs font-bold text-gray-400">Total Net Disbursement ({selectedMonth})</span>
          <p className="text-3xl sm:text-4xl font-mono font-black text-[#C7F436] mt-2">
            ₹{totalPayroll.toLocaleString()}
          </p>
          <span className="text-[11px] font-semibold text-gray-400 mt-3">{payrolls.length} Employee Cycles</span>
        </div>

        <div className="bg-white p-6 rounded-4xl border border-gray-200/70 shadow-soft-sm flex flex-col justify-between">
          <span className="text-xs font-semibold text-gray-400">Settled & Paid</span>
          <p className="text-3xl font-mono font-black text-gray-900 mt-2">₹{totalPaid.toLocaleString()}</p>
          <p className="text-xs font-bold text-emerald-600 mt-3 flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4" /> Disbursed via Direct Payout
          </p>
        </div>

        <div className="bg-white p-6 rounded-4xl border border-gray-200/70 shadow-soft-sm flex flex-col justify-between">
          <span className="text-xs font-semibold text-gray-400">Approved & Ready for Payout</span>
          <p className="text-3xl font-mono font-black text-amber-600 mt-2">₹{approvedAmount.toLocaleString()}</p>
          <span className="text-xs text-gray-500 mt-3">{approvedList.length} locked records awaiting trigger</span>
        </div>
      </div>

      {/* Payroll Ledger Table */}
      <div className="bg-white p-6 rounded-4xl border border-gray-200/70 shadow-soft-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-extrabold text-base text-gray-900">Employee Compensation Ledger</h3>
          <span className="text-xs font-semibold text-gray-400">Showing records for {selectedMonth}</span>
        </div>

        {payrolls.length === 0 ? (
          <div className="py-12 text-center text-gray-400 text-xs">
            No payroll records generated for {selectedMonth}. Click "Generate Draft" to compute monthly salaries.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="pb-3">Employee</th>
                  <th className="pb-3">Gross Base</th>
                  <th className="pb-3">Bonus / Allow.</th>
                  <th className="pb-3">LOP Days</th>
                  <th className="pb-3">PF & Tax</th>
                  <th className="pb-3">Net Payable</th>
                  <th className="pb-3">Lifecycle Status</th>
                  <th className="pb-3 text-right">Payslip</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 font-medium">
                {payrolls.map((p) => {
                  const status = p.status || p.paymentStatus;
                  return (
                    <tr key={p._id} className="hover:bg-gray-50/70 transition">
                      <td className="py-3.5">
                        <p className="font-bold text-gray-900">{p.employeeName}</p>
                        <p className="text-[11px] text-gray-400">{p.employeeRole}</p>
                      </td>
                      <td className="py-3.5 font-mono text-gray-700">₹{(p.grossSalary || p.baseSalary).toLocaleString()}</td>
                      <td className="py-3.5 font-mono text-emerald-600">+₹{((p.bonus || 0) + (p.allowance || 0)).toLocaleString()}</td>
                      <td className="py-3.5 font-mono text-rose-600">{p.lopDays || 0}d (-₹{(p.lopDeduction || 0).toLocaleString()})</td>
                      <td className="py-3.5 font-mono text-gray-600">-₹{((p.pfDeduction || 0) + (p.taxDeduction || p.tax || 0)).toLocaleString()}</td>
                      <td className="py-3.5 font-mono font-black text-gray-900 text-sm">₹{(p.netPayable || 0).toLocaleString()}</td>
                      <td className="py-3.5">
                        <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${
                          status === 'Paid' ? 'bg-emerald-100 text-emerald-800' :
                          status === 'Approved' ? 'bg-sky-100 text-sky-800' :
                          status === 'Processing' ? 'bg-indigo-100 text-indigo-800' :
                          status === 'Failed' ? 'bg-rose-100 text-rose-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {status}
                        </span>
                      </td>
                      <td className="py-3.5 text-right">
                        <button
                          onClick={() => handleOpenPayslip(p._id)}
                          disabled={slipLoading}
                          className="inline-flex items-center gap-1 text-gray-700 hover:text-black font-bold text-[11px] bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-full transition"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>View Slip</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payout Confirmation Modal */}
      {isConfirmPayoutOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-4xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-black text-[#C7F436] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-gray-900">Confirm Direct Salary Payout</h3>
                <p className="text-xs text-gray-500">Idempotent bank disbursement trigger</p>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Pay Cycle:</span>
                <span className="font-bold text-gray-900">{selectedMonth}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Approved Employees:</span>
                <span className="font-bold text-gray-900">{approvedList.length}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-200 text-sm">
                <span className="font-bold text-gray-900">Total Disbursement:</span>
                <span className="font-mono font-black text-emerald-700">₹{approvedAmount.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setIsConfirmPayoutOpen(false)}
                className="px-4 py-2 rounded-full text-xs font-bold text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmPayout}
                disabled={isPaying}
                className="px-6 py-2.5 rounded-full text-xs font-extrabold bg-[#C7F436] hover:bg-[#B8E52B] text-black shadow-md disabled:opacity-50"
              >
                {isPaying ? 'Disbursing...' : 'Confirm & Pay Salaries'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payslip Detail Modal */}
      {selectedSlip && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-4xl max-w-lg w-full p-7 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between border-b border-gray-100 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                  {selectedSlip.payslipNumber}
                </span>
                <h3 className="text-lg font-black text-gray-900 mt-1">{selectedSlip.company.name}</h3>
                <p className="text-[11px] text-gray-400">{selectedSlip.company.address}</p>
                <p className="text-[10px] text-gray-400 font-mono">Tax ID: {selectedSlip.company.taxId}</p>
              </div>
              <button
                onClick={() => setSelectedSlip(null)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-black"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-gray-50 p-4 rounded-2xl">
              <div>
                <span className="text-gray-400">Employee Name</span>
                <p className="font-bold text-gray-900">{selectedSlip.payroll.employeeName}</p>
              </div>
              <div>
                <span className="text-gray-400">Role / Dept</span>
                <p className="font-bold text-gray-900">{selectedSlip.payroll.employeeRole}</p>
              </div>
              <div>
                <span className="text-gray-400">Pay Period</span>
                <p className="font-bold text-gray-900">{selectedSlip.payroll.month}</p>
              </div>
              <div>
                <span className="text-gray-400">Working Days</span>
                <p className="font-bold text-gray-900">{selectedSlip.payroll.workingDaysInMonth} days</p>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Basic Pay</span>
                <span className="font-mono font-bold">₹{selectedSlip.payroll.basicPay?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">HRA</span>
                <span className="font-mono font-bold">₹{selectedSlip.payroll.hra?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Special Allowance</span>
                <span className="font-mono font-bold">₹{selectedSlip.payroll.specialAllowance?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-emerald-700">
                <span>Bonus & Allowances</span>
                <span className="font-mono font-bold">+₹{((selectedSlip.payroll.bonus || 0) + (selectedSlip.payroll.allowance || 0)).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-rose-600 pt-2 border-t border-gray-100">
                <span>PF + TDS Deductions</span>
                <span className="font-mono font-bold">-₹{((selectedSlip.payroll.pfDeduction || 0) + (selectedSlip.payroll.taxDeduction || 0)).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-rose-600">
                <span>LOP ({selectedSlip.payroll.lopDays || 0} days)</span>
                <span className="font-mono font-bold">-₹{(selectedSlip.payroll.lopDeduction || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between pt-3 border-t border-gray-200 text-base font-black text-gray-900">
                <span>Net Payable</span>
                <span className="font-mono text-emerald-700">₹{selectedSlip.payroll.netPayable?.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
