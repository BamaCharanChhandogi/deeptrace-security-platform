import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';
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
      // Toast handles error
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
    <div className="min-h-screen bg-[#0E1033] flex items-center justify-center p-4 sm:p-6 lg:p-10">
      <div className="w-full max-w-5xl grid md:grid-cols-2 gap-8 items-center">
        {/* Left Column: Authentic DeepTrace Login Card */}
        <div className="dt-card p-8 sm:p-10 shadow-2xl">
          {/* Logo Brand Header */}
          <div className="flex items-center gap-3.5 mb-8">
            <div className="w-12 h-12 rounded-xl bg-[#009CD9]/15 border border-[#009CD9]/30 flex items-center justify-center text-[#009CD9]">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <span className="font-heading font-bold text-lg tracking-wider text-[#FCFCFC] block leading-none">
                DEEP TRACE
              </span>
              <span className="text-[11px] text-[#009CD9] font-mono tracking-widest font-semibold block mt-1">
                CYBERNETICS
              </span>
            </div>
          </div>

          {/* Hero & Section Titles matching website typography */}
          <h1 className="dt-hero-title mb-2 text-3xl sm:text-[39px] sm:leading-[42px]">
            Security Portal
          </h1>
          <h2 className="dt-section-title mb-3 text-xl sm:text-[24px] sm:leading-[32px]">
            Protect Your Business with Us
          </h2>
          <p className="dt-body mb-6">
            Multi-tenant security management platform with strict data isolation and role-based access.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#FCFCFC] mb-2 font-heading">
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
                  className="dt-input pl-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#FCFCFC] mb-2 font-heading">
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
                  className="dt-input pl-10"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-dt-pill w-full justify-center mt-2 py-3 cursor-pointer"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In & Verify Access</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Evaluator Instant Persona Switcher */}
        <div className="space-y-5">
          <div className="dt-card p-6 sm:p-8">
            <div className="flex items-center gap-2.5 text-[#009CD9] mb-2">
              <Sparkles className="w-5 h-5 text-[#009CD9]" />
              <h3 className="dt-card-title text-[#009CD9]">
                Evaluator Instant Access
              </h3>
            </div>
            <p className="dt-body mb-5">
              Click any persona below to test multi-tenant isolation and permissions immediately:
            </p>

            <div className="space-y-3">
              {DEMO_USERS.map((demo) => (
                <button
                  key={demo.email}
                  type="button"
                  onClick={() => handleQuickLogin(demo)}
                  disabled={isSubmitting}
                  className="w-full text-left p-3.5 rounded-lg border border-[#2C3078] bg-[#10133B] hover:bg-[#18194B] hover:border-[#009CD9] transition group flex items-center justify-between cursor-pointer"
                >
                  <div className="min-w-0 pr-2">
                    <div className="font-heading font-semibold text-sm text-[#FCFCFC] group-hover:text-[#009CD9] transition">
                      {demo.label}
                    </div>
                    <span className="text-xs text-[#94A3B8] block truncate mt-0.5">
                      {demo.desc}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-[#18194B] text-[#FCFCFC] group-hover:bg-[#009CD9] group-hover:text-white transition shrink-0 font-medium">
                    Switch ➔
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#18194B]/70 border border-[#2C3078] text-xs text-[#94A3B8]">
            <span className="text-[#009CD9] font-semibold">Zero-Trust Notice:</span> Sign in as <strong className="text-[#FCFCFC]">Tenant B Admin</strong> to verify that Tenant A campaigns and events return <code className="text-[#009CD9]">404 Not Found</code>.
          </div>
        </div>
      </div>
    </div>
  );
}
