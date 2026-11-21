import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, ArrowRight, ShieldCheck, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-screen h-screen min-h-screen bg-gradient-to-br from-[#F8FAFC] via-[#F1F5F9] to-[#E2E8F0] text-gray-900 flex items-center justify-center p-4 relative overflow-hidden select-none">
      
      {/* Soft Ambient Background Elements */}
      <div className="absolute top-12 left-1/4 w-96 h-96 bg-lime-200/50 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-12 right-1/4 w-96 h-96 bg-emerald-200/40 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Container Card (Clean Light Theme) */}
      <div className="w-full max-w-md bg-white/95 backdrop-blur-xl border border-gray-200/80 rounded-4xl p-7 sm:p-9 shadow-2xl shadow-gray-200/60 relative z-10 animate-in fade-in zoom-in-95 duration-300">
        
        {/* Logo & Brand Header */}
        <div className="flex flex-col items-center text-center mb-7">
          <div className="w-12 h-12 rounded-2xl bg-black flex items-center justify-center p-2.5 shadow-md mb-3">
            <svg viewBox="0 0 24 24" className="w-full h-full text-white fill-current">
              <path d="M12 2L3 7v10l9 5 9-5V7l-9-5zm0 2.2l6.8 3.8L12 11.8 5.2 8 12 4.2zM5 9.8l6.8 3.4v6.6l-6-3.3V9.8zm8 10v-6.6l6-3.4v6.7l-6 3.3z" fill="#C7F436" />
            </svg>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-gray-900 flex items-center gap-1.5">
            <span>TaskOrbit</span>
            <span className="text-black font-extrabold text-[11px] bg-[#C7F436] px-2 py-0.5 rounded-full shadow-2xs">
              HRMS
            </span>
          </h1>
          <p className="text-xs text-gray-500 font-medium mt-1">
            Sign in to access your enterprise workspace & workforce portal
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-gray-700 font-bold mb-1.5">Work Email</label>
            <div className="flex items-center gap-2 bg-gray-50 hover:bg-gray-50/80 border border-gray-200 focus-within:border-black focus-within:bg-white rounded-2xl px-3.5 py-2.5 transition">
              <Mail className="w-4 h-4 text-gray-400 shrink-0" />
              <input
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-transparent text-gray-900 placeholder-gray-400 focus:outline-none w-full text-xs font-medium"
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 font-bold mb-1.5">Password</label>
            <div className="flex items-center gap-2 bg-gray-50 hover:bg-gray-50/80 border border-gray-200 focus-within:border-black focus-within:bg-white rounded-2xl px-3.5 py-2.5 transition">
              <Lock className="w-4 h-4 text-gray-400 shrink-0" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-transparent text-gray-900 placeholder-gray-400 focus:outline-none w-full text-xs font-medium"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(prev => !prev)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-3 bg-black hover:bg-neutral-800 text-white font-extrabold text-xs py-3.5 rounded-2xl transition shadow-md active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {submitting ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Connecting... (waking server up)</span>
              </span>
            ) : (
              <>
                <span>Sign In to Workspace</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5] text-[#C7F436]" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-center gap-1.5 text-[11px] text-gray-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Secured with End-to-End Enterprise RBAC</span>
        </div>

        <p className="text-[11px] text-gray-400 text-center mt-2 font-medium">
          Need an account or password reset? Please contact your HR Admin.
        </p>

      </div>
    </div>
  );
}
