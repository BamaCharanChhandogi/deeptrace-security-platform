import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, ArrowRight, Sparkles, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { DEMO_USERS } from '../utils/constants';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!email || !password) return;

    setIsSubmitting(true);
    try {
      await login(email, password);
      navigate('/');
    } catch {
      // Handled by toast in AuthContext
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickLogin = async (demoUser) => {
    setEmail(demoUser.email);
    setPassword(demoUser.password);
    setIsSubmitting(true);
    try {
      await login(demoUser.email, demoUser.password);
      navigate('/');
    } catch {
      // Toast handles error
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0E1033] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-8 items-center">
        {/* Left Column: Login Form */}
        <div className="bg-[#18194B] p-8 rounded-2xl border border-[#2C3078] shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-[#009CD9]/15 border border-[#009CD9]/30 flex items-center justify-center text-[#009CD9]">
              <Shield className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-xl font-heading font-bold tracking-tight text-[#FCFCFC]">DEEP TRACE</h1>
              <p className="text-xs text-[#009CD9] font-mono tracking-widest font-semibold">CYBERNETICS</p>
            </div>
          </div>

          <h2 className="text-lg font-heading font-semibold text-[#FCFCFC] mb-1">
            Enterprise Security Portal
          </h2>
          <p className="text-xs text-[#94A3B8] mb-6">
            Authenticate to access your organization's multi-tenant console.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#FCFCFC] mb-1.5">
                Organization Work Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="analyst@cybershield.io"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#10133B] border border-[#2C3078] rounded-lg text-xs text-[#FCFCFC] placeholder-[#94A3B8]/60 focus:outline-none focus:border-[#009CD9] focus:ring-1 focus:ring-[#009CD9] transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#FCFCFC] mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#10133B] border border-[#2C3078] rounded-lg text-xs text-[#FCFCFC] placeholder-[#94A3B8]/60 focus:outline-none focus:border-[#009CD9] focus:ring-1 focus:ring-[#009CD9] transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-2.5 px-4 bg-[#009CD9] hover:bg-[#0084B8] disabled:opacity-50 text-white font-heading font-medium text-xs rounded-lg shadow-lg shadow-[#009CD9]/20 flex items-center justify-center gap-2 transition"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In & Verify Tenant</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: 1-Click Quick Demo Persona Switcher */}
        <div className="space-y-4">
          <div className="p-6 rounded-2xl bg-[#18194B] border border-[#2C3078]">
            <div className="flex items-center gap-2 text-[#009CD9] mb-2">
              <Sparkles className="w-4 h-4" />
              <h3 className="text-xs font-heading font-semibold uppercase tracking-wider">
                Evaluator Instant Access
              </h3>
            </div>
            <p className="text-xs text-[#94A3B8] mb-4">
              Click any role below to immediately test data isolation and permissions without typing:
            </p>

            <div className="space-y-2.5">
              {DEMO_USERS.map((demo) => (
                <button
                  key={demo.email}
                  type="button"
                  onClick={() => handleQuickLogin(demo)}
                  disabled={isSubmitting}
                  className="w-full text-left p-3 rounded-lg border border-[#2C3078] bg-[#10133B] hover:bg-[#18194B] hover:border-[#009CD9] transition group flex items-center justify-between"
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-heading font-semibold text-[#FCFCFC] group-hover:text-[#009CD9] transition">
                        {demo.label}
                      </span>
                    </div>
                    <span className="text-[11px] text-[#94A3B8] block truncate">
                      {demo.desc}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-1 rounded bg-[#18194B] text-[#FCFCFC] group-hover:bg-[#009CD9] group-hover:text-white transition shrink-0">
                    Switch ➔
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#18194B]/60 border border-[#2C3078] text-[11px] text-[#94A3B8]">
            <span className="text-[#009CD9] font-semibold">Security Note:</span> To verify cross-tenant data isolation, sign in as <strong className="text-[#FCFCFC]">Tenant B Admin</strong> above — Tenant A data will be completely inaccessible.
          </div>
        </div>
      </div>
    </div>
  );
}
