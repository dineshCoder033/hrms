import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Lock, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { setPasswordApi } from '../services/api';

export default function SetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError('Missing activation token. Please use the link provided in your invitation email.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (!/(?=.*[A-Za-z])(?=.*\d)/.test(password)) {
      setError('Password must contain at least one letter and one number.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      await setPasswordApi({ token, password });
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2500);
    } catch (err) {
      setError(err.message || 'Failed to set password. Token may have expired.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-screen h-screen min-h-screen bg-[#0D0F12] text-white flex items-center justify-center p-4 relative overflow-hidden select-none">
      <div className="w-full max-w-md bg-[#16191F]/90 backdrop-blur-xl border border-white/10 rounded-4xl p-8 shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-300">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-black border border-white/10 flex items-center justify-center shadow-lg mb-3">
            <Lock className="w-5 h-5 text-[#C7F436]" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">Activate Your Account</h1>
          <p className="text-xs text-gray-400 font-medium mt-1">
            Create a secure password to complete your TaskOrbit HRMS onboarding
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-sm text-emerald-300">Password Set Successfully!</h3>
            <p className="text-xs text-gray-400">Redirecting you to the sign in page...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-gray-400 font-semibold mb-1.5">New Password</label>
              <div className="flex items-center gap-2 bg-black/50 border border-white/10 focus-within:border-[#C7F436] rounded-2xl px-3.5 py-2.5 transition">
                <Lock className="w-4 h-4 text-gray-500 shrink-0" />
                <input
                  type="password"
                  placeholder="Min 8 chars with letter & number"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-transparent text-white placeholder-gray-600 focus:outline-none w-full text-xs"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-400 font-semibold mb-1.5">Confirm Password</label>
              <div className="flex items-center gap-2 bg-black/50 border border-white/10 focus-within:border-[#C7F436] rounded-2xl px-3.5 py-2.5 transition">
                <Lock className="w-4 h-4 text-gray-500 shrink-0" />
                <input
                  type="password"
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-transparent text-white placeholder-gray-600 focus:outline-none w-full text-xs"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 bg-[#C7F436] hover:bg-[#b8e52b] text-black font-extrabold text-xs py-3 rounded-2xl transition shadow-lg shadow-[#C7F436]/20 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Activate Account</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

