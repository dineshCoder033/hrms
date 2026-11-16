import React, { useEffect, useState } from 'react';
import { FileText, Download, CheckCircle2, Clock, AlertCircle, Printer } from 'lucide-react';
import { fetchPayrolls, fetchPayslip } from '../services/api';

export default function MyPayslipsPage() {
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPayslip, setSelectedPayslip] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await fetchPayrolls();
        setPayrolls(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message || 'Failed to load payslips');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleOpenPayslip = async (id) => {
    try {
      const slip = await fetchPayslip(id);
      setSelectedPayslip(slip);
    } catch (err) {
      setError(err.message || 'Unable to load payslip details');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900">My Payslips</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            View and download your monthly salary statements
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium px-4 py-3 rounded-2xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-3xl p-8 text-center text-xs text-gray-400 border border-gray-100">
          Loading your payslips...
        </div>
      ) : payrolls.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 text-center border border-gray-100">
          <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm font-bold text-gray-700">No payslips available yet</p>
          <p className="text-xs text-gray-400 mt-1">
            Your monthly payslips will appear here once HR generates and processes payroll.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {payrolls.map((item) => (
            <div
              key={item._id}
              className="bg-white rounded-3xl p-5 border border-gray-100 shadow-soft-sm flex flex-col justify-between gap-4"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-extrabold text-gray-900">{item.month}</span>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                      item.status === 'Paid'
                        ? 'bg-emerald-50 text-emerald-700'
                        : item.status === 'Failed'
                        ? 'bg-rose-50 text-rose-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}
                  >
                    {item.status === 'Paid' ? (
                      <CheckCircle2 className="w-3 h-3" />
                    ) : (
                      <Clock className="w-3 h-3" />
                    )}
                    {item.status}
                  </span>
                </div>

                <div className="mt-4 space-y-1.5 text-xs">
                  <div className="flex justify-between text-gray-500">
                    <span>Gross Earnings</span>
                    <span className="font-semibold text-gray-800">
                      ₹{Number(item.grossSalary || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Deductions (PF / Tax / LOP)</span>
                    <span className="font-semibold text-rose-600">
                      -₹
                      {Number(
                        (item.pfDeduction || 0) +
                          (item.professionalTax || 0) +
                          (item.tds || 0) +
                          (item.lopDeduction || 0)
                      ).toLocaleString()}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-gray-100 flex justify-between items-center">
                    <span className="font-bold text-gray-700">Net Payable</span>
                    <span className="text-base font-extrabold text-gray-900">
                      ₹{Number(item.netPayable || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleOpenPayslip(item._id)}
                className="w-full py-2.5 rounded-full bg-black text-white text-xs font-bold hover:bg-gray-800 transition flex items-center justify-center gap-2"
              >
                <Download className="w-3.5 h-3.5" />
                View / Print Payslip
              </button>
            </div>
          ))}
        </div>
      )}

      {selectedPayslip && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between border-b border-gray-100 pb-3">
              <div>
                <h2 className="text-base font-extrabold text-gray-900">
                  {selectedPayslip.company?.name || 'Company Payslip'}
                </h2>
                <p className="text-[11px] text-gray-500">{selectedPayslip.company?.address}</p>
                <p className="text-[11px] font-semibold text-gray-600 mt-1">
                  Payslip #{selectedPayslip.payslipNumber} • Month: {selectedPayslip.payroll?.month}
                </p>
              </div>
              <button
                onClick={() => setSelectedPayslip(null)}
                className="text-xs font-bold text-gray-400 hover:text-gray-700"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs bg-gray-50 p-3 rounded-2xl">
              <div>
                <span className="text-gray-400 block">Employee</span>
                <span className="font-bold text-gray-900">
                  {selectedPayslip.payroll?.employeeName}
                </span>
              </div>
              <div>
                <span className="text-gray-400 block">Working Days / Absent</span>
                <span className="font-bold text-gray-900">
                  {selectedPayslip.payroll?.workingDaysInMonth || '-'} /{' '}
                  {selectedPayslip.payroll?.absentDays || 0}
                </span>
              </div>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Basic + HRA + Allowances + Bonus</span>
                <span className="font-bold text-gray-900">
                  ₹{Number(selectedPayslip.payroll?.grossSalary || 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">PF Deduction</span>
                <span className="font-semibold text-rose-600">
                  -₹{Number(selectedPayslip.payroll?.pfDeduction || 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Professional Tax + TDS</span>
                <span className="font-semibold text-rose-600">
                  -₹
                  {Number(
                    (selectedPayslip.payroll?.professionalTax || 0) +
                      (selectedPayslip.payroll?.tds || 0)
                  ).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">LOP Deduction</span>
                <span className="font-semibold text-rose-600">
                  -₹{Number(selectedPayslip.payroll?.lopDeduction || 0).toLocaleString()}
                </span>
              </div>
              <div className="pt-2 border-t border-gray-200 flex justify-between text-sm font-extrabold text-gray-900">
                <span>Net Pay</span>
                <span>₹{Number(selectedPayslip.payroll?.netPayable || 0).toLocaleString()}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-full bg-black text-white text-xs font-bold flex items-center gap-1.5 hover:bg-gray-800"
              >
                <Printer className="w-3.5 h-3.5" />
                Print / Save PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

