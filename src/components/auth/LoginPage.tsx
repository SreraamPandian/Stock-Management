import { useState } from 'react';
import { Building2, Eye, EyeOff, Lock, Mail, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';

const CREDENTIALS = [
    { email: 'superadmin@probiz.ae', password: 'SuperAdmin@2025', role: 'Super Admin', name: 'System Administrator' },
    { email: 'ahmed.k@probiz.ae', password: 'SubStore@2025', role: 'Sub Store Keeper', name: 'Ahmed Khan' },
    { email: 'fatima.a@probiz.ae', password: 'Centre@2025', role: 'Centre In-Charge', name: 'Fatima Ali' },
    { email: 'omar.f@probiz.ae', password: 'Central@2025', role: 'Central Store', name: 'Omar Farooq' },
    { email: 'aisha.r@probiz.ae', password: 'Procure@2025', role: 'Procurement Officer', name: 'Aisha Rahman' },
    { email: 'john.d@probiz.ae', password: 'SMD@2025', role: 'SMD', name: 'John Doe' },
    { email: 'jane.r@probiz.ae', password: 'Finance@2025', role: 'Finance', name: 'Jane Roe' },
];

interface Props {
    onLogin: (role: string, name: string) => void;
}

export const LoginPage = ({ onLogin }: Props) => {
    const [email, setEmail] = useState('superadmin@probiz.ae');
    const [password, setPassword] = useState('SuperAdmin@2025');
    const [showPass, setShowPass] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        await new Promise(r => setTimeout(r, 700));
        const match = CREDENTIALS.find(c => c.email === email && c.password === password);
        if (match) {
            onLogin(match.role, match.name);
        } else {
            setError('Invalid credentials. Please check your email and password.');
            setLoading(false);
        }
    };

    const quickLogin = (c: typeof CREDENTIALS[0]) => {
        setEmail(c.email);
        setPassword(c.password);
        setError('');
    };

    return (
        <div className="min-h-screen flex">
            {/* ── LEFT PANEL ── */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-slate-900 flex-col justify-between p-12">
                {/* Animated background blobs */}
                <div className="absolute inset-0">
                    <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-600/20 blur-[80px] animate-pulse" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full bg-blue-400/10 blur-[60px] animate-pulse" style={{ animationDelay: '1.5s' }} />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-indigo-500/10 blur-[50px]" />
                    <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, #60a5fa 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
                </div>

                {/* Logo */}
                <div className="relative z-10 flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500/20 border border-blue-500/30 rounded-xl flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                        <p className="text-white font-black text-lg leading-none tracking-tight">Pro-Biz</p>
                        <p className="text-slate-500 text-[10px] font-bold tracking-widest uppercase">Medical Fitness Centers</p>
                    </div>
                </div>

                {/* Center content */}
                <div className="relative z-10 space-y-8">
                    <div>
                        <h1 className="text-4xl font-black text-white leading-tight tracking-tight">
                            Centralized<br />
                            <span className="text-blue-400">Procurement</span><br />
                            Management
                        </h1>
                        <p className="text-slate-400 text-sm font-medium mt-4 leading-relaxed max-w-xs">
                            End-to-end procurement workflows, stock visibility, and financial controls — unified across all branches.
                        </p>
                    </div>

                    {/* Feature pills */}
                    <div className="space-y-3">
                        {[
                            { label: 'Multi-role approval workflows', icon: ShieldCheck },
                            { label: 'Real-time SLA monitoring', icon: ShieldCheck },
                            { label: 'Bur Dubai & Al Quoz branches', icon: ShieldCheck },
                        ].map((f, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                                </div>
                                <span className="text-slate-300 text-xs font-medium">{f.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="relative z-10">
                    <p className="text-slate-600 text-[10px] font-bold uppercase tracking-widest">© 2025 Pro-Biz · Secure Portal v2.1</p>
                </div>
            </div>

            {/* ── RIGHT PANEL ── */}
            <div className="w-full lg:w-1/2 flex items-center justify-center bg-white p-8">
                <div className="w-full max-w-md space-y-8">

                    {/* Mobile logo */}
                    <div className="flex items-center gap-3 lg:hidden">
                        <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-blue-600" />
                        </div>
                        <p className="text-slate-900 font-black text-lg">Pro-Biz</p>
                    </div>

                    {/* Heading */}
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Welcome back</h2>
                        <p className="text-slate-400 text-sm font-medium mt-1">Sign in to your workspace</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleLogin} className="space-y-5">
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Email Address</label>
                            <div className="relative">
                                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    required
                                    className="w-full border border-slate-200 text-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all bg-slate-50 focus:bg-white"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Password</label>
                            <div className="relative">
                                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" />
                                <input
                                    type={showPass ? 'text' : 'password'}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                    className="w-full border border-slate-200 text-slate-800 rounded-xl pl-10 pr-12 py-3 text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all bg-slate-50 focus:bg-white"
                                />
                                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500">
                                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 bg-rose-50 border border-rose-100 rounded-xl px-4 py-3 animate-in fade-in duration-200">
                                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                                <p className="text-rose-600 text-xs font-medium">{error}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-70 text-white font-black text-sm uppercase tracking-widest rounded-xl py-3.5 transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2 group"
                        >
                            {loading ? (
                                <>
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Signing in…
                                </>
                            ) : (
                                <>
                                    Sign In
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Quick Role Access */}
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="flex-1 h-px bg-slate-100"></div>
                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest whitespace-nowrap">Quick Role Access</span>
                            <div className="flex-1 h-px bg-slate-100"></div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            {CREDENTIALS.map((c, i) => (
                                <button
                                    key={i}
                                    onClick={() => quickLogin(c)}
                                    className={`text-left px-3 py-2.5 rounded-xl border transition-all group ${email === c.email ? 'border-blue-300 bg-blue-50' : 'border-slate-100 hover:border-blue-200 hover:bg-blue-50/50'}`}
                                >
                                    <p className={`text-[11px] font-black uppercase tracking-tight leading-tight ${email === c.email ? 'text-blue-700' : 'text-slate-700 group-hover:text-blue-600'}`}>{c.role}</p>
                                    <p className="text-[9px] text-slate-400 font-medium mt-0.5 truncate">{c.name}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    <p className="text-center text-slate-300 text-[10px] font-bold uppercase tracking-widest">Secure · Encrypted · Role-Based Access</p>
                </div>
            </div>
        </div>
    );
};
