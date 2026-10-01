import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, ArrowRight, ShieldCheck, KeyRound } from 'lucide-react';
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
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 sm:p-6 lg:p-10">
      <div className="w-full max-w-5xl grid md:grid-cols-2 gap-8 items-stretch">
        {/* Left Column: Authentic DeepTrace Clean White Login Card */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-8 sm:p-10 shadow-lg flex flex-col justify-between">
          <div>
            {/* Logo Brand Header */}
            <div className="flex items-center gap-3.5 mb-6">
              <div className="w-12 h-12 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-[#009CD9] shrink-0">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div>
                <span className="font-heading font-bold text-lg tracking-wider text-[#18194B] block leading-none">
                  DEEP TRACE
                </span>
                <span className="text-[11px] text-[#009CD9] font-mono tracking-widest font-semibold block mt-1">
                  CYBERNETICS
                </span>
              </div>
            </div>

            {/* Hero & Section Titles matching website typography */}
            <h1 className="text-3xl sm:text-[36px] sm:leading-[42px] font-heading font-medium text-[#18194B] tracking-tight">
              Security Portal
            </h1>
            <h2 className="text-lg sm:text-[22px] sm:leading-[30px] font-semibold text-[#009CD9] mt-1">
              Protect Your Business with Us
            </h2>
            <p className="text-sm text-slate-500 mt-2 mb-6">
              Multi-tenant security management platform with strict data isolation and role-based access.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
                  Organization Work Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="analyst@cybershield.io"
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#009CD9] focus:ring-2 focus:ring-[#009CD9]/20 text-sm transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#009CD9] focus:ring-2 focus:ring-[#009CD9]/20 text-sm transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-dt-pill w-full justify-center mt-3 py-3 cursor-pointer"
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

          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <span className="text-xs text-slate-400">
              Enterprise Grade • Zero-Trust Multi-Tenancy
            </span>
          </div>
        </div>

        {/* Right Column: Evaluator Instant Persona Switcher */}
        <div className="flex flex-col justify-between space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-8 shadow-lg flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-xl bg-sky-50 text-[#009CD9] flex items-center justify-center shrink-0">
                <KeyRound className="w-5 h-5 stroke-[2]" />
              </div>
              <h3 className="font-semibold text-lg text-[#18194B]">
                Evaluator Instant Access
              </h3>
            </div>
            <p className="text-xs text-slate-500 mb-5">
              Click any persona below to test multi-tenant isolation and permissions immediately:
            </p>

            <div className="space-y-3">
              {DEMO_USERS.map((demo) => (
                <button
                  key={demo.email}
                  type="button"
                  onClick={() => handleQuickLogin(demo)}
                  disabled={isSubmitting}
                  className="w-full text-left p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-sky-50/50 hover:border-[#009CD9] transition-all group flex items-center justify-between cursor-pointer"
                >
                  <div className="min-w-0 pr-2">
                    <div className="font-semibold text-sm text-[#18194B] group-hover:text-[#009CD9] transition">
                      {demo.label}
                    </div>
                    <span className="text-xs text-slate-500 block truncate mt-0.5">
                      {demo.desc}
                    </span>
                  </div>
                  <span className="text-xs font-semibold px-3 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 group-hover:bg-[#009CD9] group-hover:text-white group-hover:border-[#009CD9] transition shrink-0">
                    Switch ➔
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
