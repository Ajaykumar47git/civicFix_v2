import React, { useState } from 'react';
import { X, Lock, Mail, User, ShieldCheck, AlertCircle, CheckCircle2, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { backend } from '../backend';
import { UserRole as BackendUserRole } from '../backend/entities/User.entity';
import { User as UserType } from '../types/database';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserType) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [wardId, setWardId] = useState(4);
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  // Validation helpers
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isPasswordValid = password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorBanner(null);
    setSuccessMessage(null);

    if (!isEmailValid) {
      setErrorBanner('Please enter a valid municipal citizen email address.');
      return;
    }

    if (!isPasswordValid) {
      setErrorBanner('Password must be at least 8 characters with at least one uppercase letter and one number.');
      return;
    }

    setIsLoading(true);

    try {
      if (isRegister) {
        if (fullName.trim().length < 2) {
          setErrorBanner('Full legal name must be at least 2 characters.');
          setIsLoading(false);
          return;
        }

        const res: any = await backend.authController.register({
          email: email.trim(),
          password,
          fullName: fullName.trim(),
          phone: phone.trim() || undefined,
          wardId: Number(wardId),
          role: BackendUserRole.CITIZEN
        });

        if (res.status === 201) {
          setSuccessMessage('Registration successful! You can now log in.');
          setIsRegister(false);
        } else {
          setErrorBanner(res.body?.detail || 'Registration failed.');
        }
      } else {
        const res: any = await backend.authController.login({
          email: email.trim(),
          password
        });

        if (res.status === 200) {
          const userPayload = res.data.user;
          // Store token in session storage
          sessionStorage.setItem('civicfix_token', res.data.accessToken);
          
          const adaptedUser: UserType = {
            id: userPayload.id,
            email: userPayload.email,
            fullName: userPayload.fullName,
            role: userPayload.role,
            phoneNumber: userPayload.phone || '+1-202-555-0143',
            status: 'ACTIVE',
            avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };

          onLoginSuccess(adaptedUser);
          onClose();
        } else {
          setErrorBanner(res.body?.detail || 'Invalid email or password credentials.');
        }
      }
    } catch (err: any) {
      setErrorBanner(err.message || 'Network error communicating with backend authentication service.');
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoAccount = (demoEmail: string, demoRoleName: string) => {
    setEmail(demoEmail);
    setPassword('Password123!');
    setIsRegister(false);
    setErrorBanner(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-blue-400" />
            <div>
              <h3 className="font-bold text-sm">
                {isRegister ? 'Register Citizen Account' : 'CivicFix Secure Sign In'}
              </h3>
              <p className="text-[11px] text-slate-400">
                Municipal Identity &amp; Role-Based Access Control
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-white p-1 rounded"
            aria-label="Close authentication modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-200 text-xs">
          <button
            type="button"
            onClick={() => { setIsRegister(false); setErrorBanner(null); }}
            className={`flex-1 py-2.5 font-medium text-center border-b-2 transition-colors ${
              !isRegister ? 'border-blue-600 text-blue-600 font-semibold' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsRegister(true); setErrorBanner(null); }}
            className={`flex-1 py-2.5 font-medium text-center border-b-2 transition-colors ${
              isRegister ? 'border-blue-600 text-blue-600 font-semibold' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Register New Citizen
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
          {errorBanner && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block">Authentication Error</span>
                <span className="text-[11px]">{errorBanner}</span>
              </div>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {isRegister && (
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Full Legal Name *</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Elena Rodriguez"
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>
          )}

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Email Address *</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="resident@example.com"
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block font-semibold text-slate-700">Password *</label>
              {isRegister && (
                <span className="text-[10px] text-slate-400">Min 8 chars, 1 uppercase, 1 digit</span>
              )}
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-9 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {isRegister && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Council Ward *</label>
                <select
                  value={wardId}
                  onChange={(e) => setWardId(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((w) => (
                    <option key={w} value={w}>Ward {w}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-50 mt-2"
          >
            {isLoading ? (
              <span>Authenticating with Municipal Gateway...</span>
            ) : (
              <>
                <span>{isRegister ? 'Create Citizen Account' : 'Authenticate & Sign In'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Account Selector */}
        {!isRegister && (
          <div className="p-4 bg-slate-50 border-t border-slate-200 text-xs">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">
              Quick Test Demo Credentials (Password: Password123!)
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => fillDemoAccount('elena@gmail.com', 'Resident Citizen')}
                className="px-2.5 py-1.5 text-left rounded bg-white hover:bg-blue-50 hover:border-blue-300 border border-slate-200 transition-colors"
              >
                <div className="font-bold text-slate-800">Elena Rodriguez</div>
                <div className="text-[10px] text-slate-500">Citizen (Ward 4)</div>
              </button>
              <button
                type="button"
                onClick={() => fillDemoAccount('marcus@civic.gov', 'Dispatcher')}
                className="px-2.5 py-1.5 text-left rounded bg-white hover:bg-blue-50 hover:border-blue-300 border border-slate-200 transition-colors"
              >
                <div className="font-bold text-slate-800">Marcus Vance</div>
                <div className="text-[10px] text-slate-500">Dispatcher</div>
              </button>
              <button
                type="button"
                onClick={() => fillDemoAccount('carlos@civic.gov', 'Field Worker')}
                className="px-2.5 py-1.5 text-left rounded bg-white hover:bg-blue-50 hover:border-blue-300 border border-slate-200 transition-colors"
              >
                <div className="font-bold text-slate-800">Carlos Mendoza</div>
                <div className="text-[10px] text-slate-500">Field Worker</div>
              </button>
              <button
                type="button"
                onClick={() => fillDemoAccount('admin@civic.gov', 'Director Admin')}
                className="px-2.5 py-1.5 text-left rounded bg-white hover:bg-blue-50 hover:border-blue-300 border border-slate-200 transition-colors"
              >
                <div className="font-bold text-slate-800">Dir. Sarah Jenkins</div>
                <div className="text-[10px] text-slate-500">Administrator</div>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
