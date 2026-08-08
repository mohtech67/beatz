import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Church,
  ShieldCheck,
  User,
  Lock,
  Phone,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

export const Login: React.FC = () => {
  const { loginAdmin, loginMember, showToast } = useAuth();
  const [activeTab, setActiveTab] = useState<'admin' | 'member'>('admin');

  // Form states
  const [identifier, setIdentifier] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleTabSwitch = (tab: 'admin' | 'member') => {
    setActiveTab(tab);
    setErrorMsg('');
    if (tab === 'admin') {
      setIdentifier('admin');
      setPassword('admin123');
    } else {
      setIdentifier('0712345678');
      setPassword('member123');
    }
  };

  const autofillDemo = (role: 'admin' | 'treasurer' | 'secretary' | 'member') => {
    setErrorMsg('');
    if (role === 'admin') {
      setActiveTab('admin');
      setIdentifier('admin');
      setPassword('admin123');
    } else if (role === 'treasurer') {
      setActiveTab('admin');
      setIdentifier('treasurer');
      setPassword('treasurer123');
    } else if (role === 'secretary') {
      setActiveTab('admin');
      setIdentifier('secretary');
      setPassword('secretary123');
    } else if (role === 'member') {
      setActiveTab('member');
      setIdentifier('0712345678');
      setPassword('member123');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      if (activeTab === 'admin') {
        const res = await fetch('/api/auth/login-admin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identifier, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Admin authentication failed');
        loginAdmin(data.token, data.user);
      } else {
        const res = await fetch('/api/auth/login-member', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identifier, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Member authentication failed');
        loginMember(data.token, data.user, data.member);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed. Please check credentials.');
      showToast(err.message || 'Login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Subtle Background Glow Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-900/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-amber-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-4xl w-full bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-12 relative z-10">
        
        {/* Left Side: Branding & Info Banner */}
        <div className="md:col-span-5 bg-gradient-to-br from-[#001D3D] via-[#002855] to-[#003366] p-8 flex flex-col justify-between relative overflow-hidden text-white border-b md:border-b-0 md:border-r border-slate-800">
          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-amber-500/20">
                <Church className="w-7 h-7" />
              </div>
              <div>
                <h1 className="font-bold text-base leading-tight tracking-wide text-white">
                  BIDII SDA CHURCH
                </h1>
                <p className="text-xs text-amber-300 font-medium">Management System</p>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <h2 className="text-xl font-black text-slate-100 tracking-tight leading-snug">
                Proclaiming the Gospel in Truth & Love
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                Secure enterprise portal for member contributions, tithes, financial reporting, and church administrative management.
              </p>
            </div>

            {/* Quick Demo Login Preset Buttons */}
            <div className="space-y-2 bg-slate-950/50 p-4 rounded-2xl border border-slate-800/80">
              <p className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Quick Demo Accounts</span>
              </p>
              <div className="grid grid-cols-2 gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => autofillDemo('admin')}
                  className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-slate-800/80 hover:bg-amber-500 hover:text-slate-950 text-slate-200 transition-colors text-left truncate"
                >
                  ⚡ Super Admin
                </button>
                <button
                  type="button"
                  onClick={() => autofillDemo('treasurer')}
                  className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-slate-800/80 hover:bg-amber-500 hover:text-slate-950 text-slate-200 transition-colors text-left truncate"
                >
                  ⚡ Treasurer
                </button>
                <button
                  type="button"
                  onClick={() => autofillDemo('secretary')}
                  className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-slate-800/80 hover:bg-amber-500 hover:text-slate-950 text-slate-200 transition-colors text-left truncate"
                >
                  ⚡ Secretary
                </button>
                <button
                  type="button"
                  onClick={() => autofillDemo('member')}
                  className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-slate-800/80 hover:bg-amber-500 hover:text-slate-950 text-slate-200 transition-colors text-left truncate"
                >
                  ⚡ Member Portal
                </button>
              </div>
            </div>
          </div>

          <div className="pt-6 relative z-10 text-[11px] text-slate-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Encrypted Session • PDO MySQL Ready</span>
          </div>
        </div>

        {/* Right Side: Dual-Panel Authentication Interface */}
        <div className="md:col-span-7 p-8 md:p-10 flex flex-col justify-center">
          
          {/* Two-Sided Tab Switcher */}
          <div className="grid grid-cols-2 p-1.5 bg-slate-950 rounded-2xl border border-slate-800 mb-8">
            <button
              type="button"
              onClick={() => handleTabSwitch('admin')}
              className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'admin'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>ADMIN / STAFF</span>
            </button>
            <button
              type="button"
              onClick={() => handleTabSwitch('member')}
              className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'member'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <User className="w-4 h-4" />
              <span>MEMBER PORTAL</span>
            </button>
          </div>

          <div className="mb-6 space-y-1">
            <h3 className="text-lg font-bold text-white tracking-tight">
              {activeTab === 'admin' ? 'Staff & Administration Login' : 'Member Portal Login'}
            </h3>
            <p className="text-xs text-slate-400">
              {activeTab === 'admin'
                ? 'Sign in with your administrator, treasurer, or secretary credentials.'
                : 'Sign in using your registered Phone Number or National ID Number.'}
            </p>
          </div>

          {errorMsg && (
            <div className="mb-6 p-3.5 bg-red-950/80 border border-red-800 rounded-xl text-red-200 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Identifier Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">
                {activeTab === 'admin' ? 'Username or Email Address' : 'Phone Number or National ID'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  {activeTab === 'admin' ? <User className="w-4 h-4" /> : <Phone className="w-4 h-4" />}
                </div>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={
                    activeTab === 'admin' ? 'e.g. admin or treasurer' : 'e.g. 0712345678 or 28475920'
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">Password</label>
                <a href="#forgot" onClick={(e) => { e.preventDefault(); showToast('Contact church secretariat to reset your password.', 'info'); }} className="text-[11px] text-amber-400 hover:underline font-medium">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all transform active:scale-[0.99] disabled:opacity-50"
            >
              {loading ? (
                <span>Authenticating Credentials...</span>
              ) : (
                <>
                  <span>Sign In to {activeTab === 'admin' ? 'Admin System' : 'Member Portal'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer help hint */}
          <div className="mt-6 pt-4 border-t border-slate-800/80 text-center text-[11px] text-slate-500">
            Bidii SDA Church System • Built for XAMPP & Production MySQL
          </div>
        </div>
      </div>
    </div>
  );
};
