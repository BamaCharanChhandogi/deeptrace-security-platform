import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, Mail, ArrowRight, Sparkles } from 'lucide-react';
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
    <div className="min-h-screen bg-[#090d16] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-8 items-center">
        {/* Left Column: Login Form */}
        <div className="cyber-panel p-8 rounded-2xl border border-slate-800 cyber-panel-glow">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-100">DeepTrace</h1>
              <p className="text-xs text-cyan-400 font-mono tracking-widest">CYBERNETICS PLATFORM</p>
            </div>
          </div>

          <h2 className="text-lg font-semibold text-slate-200 mb-1">Tenant Portal Sign In</h2>
          <p className="text-xs text-slate-400 mb-6">
            Enter credentials to access your organization's security console.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Work Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="analyst@cybershield.io"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-700/80 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-700/80 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-2.5 px-4 bg-cyan-600 hover:bg-cyan-500 disabled:bg-cyan-800 text-white font-medium text-xs rounded-xl shadow-lg shadow-cyan-900/20 flex items-center justify-center gap-2 transition"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Authenticate & Enter</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: 1-Click Quick Demo Persona Switcher */}
        <div className="space-y-4">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center gap-2 text-cyan-400 mb-2">
              <Sparkles className="w-4 h-4" />
              <h3 className="text-xs font-semibold uppercase tracking-wider font-mono">
                Evaluator Quick Demo Access
              </h3>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Click any persona below to instantaneously test role-based access control and multi-tenant isolation.
            </p>

            <div className="space-y-2.5">
              {DEMO_USERS.map((demo) => (
                <button
                  key={demo.email}
                  type="button"
                  onClick={() => handleQuickLogin(demo)}
                  disabled={isSubmitting}
                  className="w-full text-left p-3 rounded-xl border border-slate-800 bg-slate-950/60 hover:bg-slate-900 hover:border-cyan-500/40 transition group flex items-center justify-between"
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300 transition">
                        {demo.label}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 block truncate">
                      {demo.desc}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-1 rounded bg-slate-800 text-slate-300 group-hover:bg-cyan-500/20 group-hover:text-cyan-300 transition shrink-0">
                    Switch ➔
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/80 text-[11px] text-slate-400">
            <span className="text-slate-300 font-semibold">Security Note:</span> Tenant A users cannot access Tenant B campaigns even if they know the resource ID. Test with Tenant B Admin above to verify cross-tenant denial.
          </div>
        </div>
      </div>
    </div>
  );
}
