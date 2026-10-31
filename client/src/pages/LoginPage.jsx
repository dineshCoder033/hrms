import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, User, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('dinesh.hr@taskorbit.com');
  const [password, setPassword] = useState('Password@123');
  const [role, setRole] = useState('HR');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      if (isRegister) {
        await register({ name, email, password, role });
      } else {
        await login(email, password);
      }
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickDemo = (demoEmail, demoRole) => {
    setEmail(demoEmail);
    setPassword('Password@123');
    setRole(demoRole);
    setIsRegister(false);
  };

  return (
    <div className="w-screen h-screen min-h-screen bg-[#0D0F12] text-white flex items-center justify-center p-4 relative overflow-hidden select-none">
      {/* Ambient Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#C7F436]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Main Container Card */}
      <div className="w-full max-w-md bg-[#16191F]/90 backdrop-blur-xl border border-white/10 rounded-4xl p-7 sm:p-9 shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-300">
        
        {/* Logo & Brand Header */}
        <div className="flex flex-col items-center text-center mb-7">
          <div className="w-12 h-12 rounded-2xl bg-black border border-white/10 flex items-center justify-center shadow-lg mb-3">
            <span className="w-4 h-4 rounded-full bg-[#C7F436] inline-block shadow-[0_0_12px_#C7F436]" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-1">
            <span>TaskOrbit</span>
            <span className="text-[#C7F436] font-extrabold text-xs bg-white/10 px-2 py-0.5 rounded-full border border-white/10">HRMS</span>
          </h1>
          <p className="text-xs text-gray-400 font-medium mt-1">
            {isRegister ? 'Create an enterprise workspace account' : 'Sign in to access your workforce dashboard'}
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="grid grid-cols-2 bg-black/40 p-1 rounded-2xl border border-white/5 mb-6 text-xs font-bold">
          <button
            type="button"
            onClick={() => { setIsRegister(false); setError(null); }}
            className={`py-2 rounded-xl transition ${!isRegister ? 'bg-white text-black shadow-md' : 'text-gray-400 hover:text-white'}`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsRegister(true); setError(null); }}
            className={`py-2 rounded-xl transition ${isRegister ? 'bg-white text-black shadow-md' : 'text-gray-400 hover:text-white'}`}
          >
            Create Account
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {isRegister && (
            <div>
              <label className="block text-gray-400 font-semibold mb-1.5">Full Name</label>
              <div className="flex items-center gap-2 bg-black/50 border border-white/10 focus-within:border-[#C7F436] rounded-2xl px-3.5 py-2.5 transition">
                <User className="w-4 h-4 text-gray-500 shrink-0" />
                <input
                  type="text"
                  placeholder="e.g. Alex Miller"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-transparent text-white placeholder-gray-600 focus:outline-none w-full text-xs"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-gray-400 font-semibold mb-1.5">Work Email</label>
            <div className="flex items-center gap-2 bg-black/50 border border-white/10 focus-within:border-[#C7F436] rounded-2xl px-3.5 py-2.5 transition">
              <Mail className="w-4 h-4 text-gray-500 shrink-0" />
              <input
                type="email"
                placeholder="name@taskorbit.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-transparent text-white placeholder-gray-600 focus:outline-none w-full text-xs"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-400 font-semibold mb-1.5">Password</label>
            <div className="flex items-center gap-2 bg-black/50 border border-white/10 focus-within:border-[#C7F436] rounded-2xl px-3.5 py-2.5 transition">
              <Lock className="w-4 h-4 text-gray-500 shrink-0" />
              <input
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-transparent text-white placeholder-gray-600 focus:outline-none w-full text-xs"
                required
              />
            </div>
          </div>

          {isRegister && (
            <div>
              <label className="block text-gray-400 font-semibold mb-1.5">Role Assignment</label>
              <div className="flex items-center gap-2 bg-black/50 border border-white/10 rounded-2xl px-3.5 py-2.5">
                <ShieldCheck className="w-4 h-4 text-gray-500 shrink-0" />
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="bg-transparent text-white focus:outline-none w-full text-xs"
                >
                  <option value="Employee" className="bg-[#16191F]">Employee</option>
                  <option value="Manager" className="bg-[#16191F]">Manager</option>
                  <option value="HR" className="bg-[#16191F]">HR Specialist</option>
                  <option value="Admin" className="bg-[#16191F]">System Admin</option>
                </select>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-2 bg-[#C7F436] hover:bg-[#b8e52b] text-black font-extrabold text-xs py-3 rounded-2xl transition shadow-lg shadow-[#C7F436]/20 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {submitting ? (
              <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>{isRegister ? 'Complete Onboarding' : 'Sign In to Workspace'}</span>
                <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Logins Helper */}
        <div className="mt-6 pt-5 border-t border-white/5">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block text-center mb-2.5">
            Quick Demo Accounts
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemo('dinesh.hr@taskorbit.com', 'HR')}
              className="flex-1 bg-white/5 hover:bg-white/10 border border-white/5 py-1.5 px-2 rounded-xl text-[11px] font-bold text-gray-300 transition text-center"
            >
              Demo as HR
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('sophia.m@taskorbit.com', 'Employee')}
              className="flex-1 bg-white/5 hover:bg-white/10 border border-white/5 py-1.5 px-2 rounded-xl text-[11px] font-bold text-gray-300 transition text-center"
            >
              Demo as Employee
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
