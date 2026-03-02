import { useState } from 'react';
import { Users, Shield, Key, UserPlus, ShieldCheck, Clock, X, Edit2, Search, Activity, Download, Eye, EyeOff } from 'lucide-react';

const mockUsers = [
  { id: 'USR-001', name: 'Ahmed Khan', role: 'Sub Store Keeper', branch: 'Bur Dubai', email: 'ahmed.k@probiz.ae', status: 'Active', lastLogin: '10 mins ago', joined: '2024-01-15', phone: '+971-52-111-2233' },
  { id: 'USR-002', name: 'Fatima Ali', role: 'Centre In-Charge', branch: 'Bur Dubai', email: 'fatima.a@probiz.ae', status: 'Active', lastLogin: '2h ago', joined: '2023-08-20', phone: '+971-55-977-8821' },
  { id: 'USR-003', name: 'Sarah Smith', role: 'Sub Store Keeper', branch: 'Al Quoz', email: 'sarah.s@probiz.ae', status: 'Active', lastLogin: '5h ago', joined: '2024-03-10', phone: '+971-54-212-3344' },
  { id: 'USR-004', name: 'Dr. Hassan', role: 'Centre In-Charge', branch: 'Al Quoz', email: 'hassan.d@probiz.ae', status: 'Active', lastLogin: '1d ago', joined: '2022-12-05', phone: '+971-50-445-6677' },
  { id: 'USR-005', name: 'Omar Farooq', role: 'Central Store', branch: 'Global', email: 'omar.f@probiz.ae', status: 'Active', lastLogin: '30 mins ago', joined: '2023-04-18', phone: '+971-52-889-0011' },
  { id: 'USR-006', name: 'Aisha Rahman', role: 'Procurement Officer', branch: 'Global', email: 'aisha.r@probiz.ae', status: 'Active', lastLogin: '15 mins ago', joined: '2023-09-01', phone: '+971-55-321-4455' },
  { id: 'USR-007', name: 'John Doe', role: 'SMD', branch: 'Global', email: 'john.d@probiz.ae', status: 'Active', lastLogin: '3h ago', joined: '2021-06-15', phone: '+971-50-777-8899' },
  { id: 'USR-008', name: 'Jane Roe', role: 'Finance', branch: 'Global', email: 'jane.r@probiz.ae', status: 'On Leave', lastLogin: '3 days ago', joined: '2022-02-28', phone: '+971-54-654-3322' },
  { id: 'USR-009', name: 'Zayed Mansoor', role: 'SMD', branch: 'Global', email: 'zayed.m@probiz.ae', status: 'Active', lastLogin: 'Just now', joined: '2020-11-10', phone: '+971-52-123-9988' },
  { id: 'USR-010', name: 'Maya Jamila', role: 'Finance', branch: 'Global', email: 'maya.j@probiz.ae', status: 'Active', lastLogin: '4h ago', joined: '2023-07-22', phone: '+971-55-567-4433' },
];

const mockAuditLogs = [
  { id: 'AUD-2025-001', user: 'Aisha Rahman', action: 'PR Submitted', target: 'PR-2025-100', time: '2026-03-02 14:55', severity: 'Info', ip: '192.168.1.12' },
  { id: 'AUD-2025-002', user: 'John Doe', action: 'PR Approved (SMD)', target: 'PR-2025-099', time: '2026-03-02 14:30', severity: 'Info', ip: '10.0.0.5' },
  { id: 'AUD-2025-003', user: 'Jane Roe', action: 'Finance Clearance Issued', target: 'PR-2025-097', time: '2026-03-02 13:15', severity: 'Info', ip: '10.0.0.8' },
  { id: 'AUD-2025-004', user: 'Unknown', action: 'Authentication Failed', target: 'Session: 882', time: '2026-03-02 12:50', severity: 'Warning', ip: '172.16.4.21' },
  { id: 'AUD-2025-005', user: 'Fatima Ali', action: 'PR Rejected', target: 'PR-2025-095', time: '2026-03-02 11:00', severity: 'Warning', ip: '192.168.1.15' },
  { id: 'AUD-2025-006', user: 'Omar Farooq', action: 'Stock Dispatched', target: 'ITM-0034', time: '2026-03-02 10:20', severity: 'Info', ip: '192.168.2.30' },
  { id: 'AUD-2025-007', user: 'System', action: 'SLA Breach Detected', target: 'PR-2025-090', time: '2026-03-02 09:00', severity: 'Critical', ip: 'Internal' },
  { id: 'AUD-2025-008', user: 'Ahmed Khan', action: 'GRN Submitted', target: 'PR-2025-088', time: '2026-03-02 08:45', severity: 'Info', ip: '192.168.1.12' },
  { id: 'AUD-2025-009', user: 'System Admin', action: 'User Provisioned', target: 'USR-010 (Maya Jamila)', time: '2026-03-01 17:30', severity: 'Info', ip: '10.0.0.1' },
  { id: 'AUD-2025-010', user: 'John Doe', action: 'Policy Updated', target: 'Procurement TAT Policy v2.3', time: '2026-03-01 15:00', severity: 'Warning', ip: '10.0.0.5' },
];

export const AdminView = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAuditLog, setShowAuditLog] = useState(false);
  const [editUser, setEditUser] = useState<typeof mockUsers[0] | null>(null);
  const [search, setSearch] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Edit User form state
  const [editForm, setEditForm] = useState({ name: '', email: '', role: '', branch: '', phone: '', status: '' });

  // Add User form state
  const [addForm, setAddForm] = useState({ name: '', email: '', role: 'Sub Store Keeper', branch: 'Bur Dubai', phone: '', password: '' });

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    const special = '!@#$';
    let p = '';
    for (let i = 0; i < 7; i++) p += chars[Math.floor(Math.random() * chars.length)];
    p += special[Math.floor(Math.random() * special.length)];
    return 'Tmp' + p;
  };

  const openEdit = (user: typeof mockUsers[0]) => {
    setEditUser(user);
    setEditForm({ name: user.name, email: user.email, role: user.role, branch: user.branch, phone: user.phone, status: user.status });
  };

  const filteredUsers = mockUsers.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.role.toLowerCase().includes(search.toLowerCase()) ||
    u.branch.toLowerCase().includes(search.toLowerCase())
  );

  const severityColor = (s: string) => ({
    Info: 'bg-blue-50 text-blue-600',
    Warning: 'bg-amber-50 text-amber-700',
    Critical: 'bg-rose-100 text-rose-700',
  }[s] ?? 'bg-slate-100 text-slate-500');

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in slide-in-from-bottom duration-500">

      {/* ── EDIT USER MODAL ── */}
      {editUser && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Edit User Profile</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{editUser.id}</p>
              </div>
              <button onClick={() => setEditUser(null)} className="p-2 hover:bg-slate-100 rounded-full"><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Full Name', key: 'name', type: 'text' },
                { label: 'Email', key: 'email', type: 'email' },
                { label: 'Phone', key: 'phone', type: 'tel' },
              ].map(f => (
                <div key={f.key} className={f.key === 'email' ? 'col-span-2' : ''}>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">{f.label}</label>
                  <input
                    type={f.type}
                    value={(editForm as any)[f.key]}
                    onChange={e => setEditForm({ ...editForm, [f.key]: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl p-3 text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                  />
                </div>
              ))}
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Access Level</label>
                <select value={editForm.role} onChange={e => setEditForm({ ...editForm, role: e.target.value })} className="w-full border border-slate-200 rounded-xl p-3 text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all">
                  {['Sub Store Keeper', 'Centre In-Charge', 'Central Store', 'Procurement Officer', 'SMD', 'Finance'].map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Node / Branch</label>
                <select value={editForm.branch} onChange={e => setEditForm({ ...editForm, branch: e.target.value })} className="w-full border border-slate-200 rounded-xl p-3 text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all">
                  {['Bur Dubai', 'Al Quoz', 'Global'].map(b => <option key={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Account Status</label>
                <select value={editForm.status} onChange={e => setEditForm({ ...editForm, status: e.target.value })} className="w-full border border-slate-200 rounded-xl p-3 text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all">
                  {['Active', 'On Leave', 'Suspended'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-50">
              <button onClick={() => setEditUser(null)} className="px-6 py-2.5 text-slate-500 hover:bg-slate-50 rounded-xl text-xs font-black uppercase tracking-widest">Cancel</button>
              <button onClick={() => { setEditUser(null); }} className="px-8 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-200 transition-all">Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* ── PROVISION NEW USER MODAL ── */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Provision New User</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Create portal access credentials</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-100 rounded-full"><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Full Name</label>
                <input type="text" placeholder="e.g. John Doe" value={addForm.name} onChange={e => setAddForm({ ...addForm, name: e.target.value })} className="w-full border border-slate-200 rounded-xl p-3 text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all" />
              </div>
              <div className="col-span-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Official Email</label>
                <input type="email" placeholder="user@probiz.ae" value={addForm.email} onChange={e => setAddForm({ ...addForm, email: e.target.value })} className="w-full border border-slate-200 rounded-xl p-3 text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Mobile</label>
                <input type="tel" placeholder="+971-5X-XXX-XXXX" value={addForm.phone} onChange={e => setAddForm({ ...addForm, phone: e.target.value })} className="w-full border border-slate-200 rounded-xl p-3 text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Access Level</label>
                <select value={addForm.role} onChange={e => setAddForm({ ...addForm, role: e.target.value })} className="w-full border border-slate-200 rounded-xl p-3 text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all">
                  {['Sub Store Keeper', 'Centre In-Charge', 'Central Store', 'Procurement Officer', 'SMD', 'Finance'].map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Node / Branch</label>
                <select value={addForm.branch} onChange={e => setAddForm({ ...addForm, branch: e.target.value })} className="w-full border border-slate-200 rounded-xl p-3 text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all">
                  {['Bur Dubai', 'Al Quoz', 'Global'].map(b => <option key={b}>{b}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Generated Temp Password</label>
                <div className="relative bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center justify-between">
                  <span className="font-mono text-sm text-blue-800 font-bold tracking-wider">
                    {showPassword ? addForm.password : '•'.repeat(addForm.password.length)}
                  </span>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setShowPassword(!showPassword)} className="text-blue-400 hover:text-blue-700">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button onClick={() => navigator.clipboard?.writeText(addForm.password)} className="text-[10px] font-black text-blue-600 bg-blue-100 hover:bg-blue-200 px-2 py-1 rounded-lg uppercase tracking-widest transition-all">Copy</button>
                  </div>
                </div>
                <p className="text-[9px] text-slate-400 mt-1 font-medium">Share this with the user. They must change it on first login.</p>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-50">
              <button onClick={() => setShowAddModal(false)} className="px-6 py-2.5 text-slate-500 hover:bg-slate-50 rounded-xl text-xs font-black uppercase tracking-widest">Cancel</button>
              <button
                disabled={!addForm.name || !addForm.email}
                onClick={() => { setShowAddModal(false); setAddForm({ name: '', email: '', role: 'Sub Store Keeper', branch: 'Bur Dubai', phone: '', password: '' }); }}
                className="px-8 py-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 text-xs font-black uppercase tracking-widest shadow-xl shadow-slate-200 transition-all disabled:opacity-50"
              >
                Create Account & Send Invite
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── AUDIT LOG DRAWER ── */}
      {showAuditLog && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex justify-end z-[60]">
          <div className="bg-white w-full max-w-2xl h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-600" /> Detailed Audit Log
                </h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">All system events — last 30 days</p>
              </div>
              <div className="flex gap-2">
                <button className="flex items-center gap-2 bg-slate-50 border border-slate-200 text-slate-700 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-100 transition-all">
                  <Download className="w-3.5 h-3.5" /> Export CSV
                </button>
                <button onClick={() => setShowAuditLog(false)} className="p-2 hover:bg-slate-100 rounded-full"><X className="w-5 h-5 text-slate-400" /></button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-3">
              {mockAuditLogs.map((log, i) => (
                <div key={i} className="bg-slate-50 rounded-2xl p-4 border border-slate-100 hover:border-blue-100 hover:bg-white transition-all group">
                  <div className="flex justify-between items-start mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-widest ${severityColor(log.severity)}`}>{log.severity}</span>
                      <span className="text-xs font-black text-slate-900 group-hover:text-blue-700 transition-colors">{log.action}</span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400">{log.time}</span>
                  </div>
                  <div className="flex gap-4 text-[10px] font-bold text-slate-400 mt-1">
                    <span>User: <span className="text-slate-600">{log.user}</span></span>
                    <span>Target: <span className="text-blue-600">{log.target}</span></span>
                    <span>IP: <span className="text-slate-500 font-mono">{log.ip}</span></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── PAGE HEADER ── */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-blue-600" />
            Command Center
          </h1>
          <p className="text-slate-500 mt-1 font-medium italic">Configure core infrastructure, security policies, and user identities</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowAuditLog(true)}
            className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-xl hover:bg-slate-50 transition-all font-bold text-xs uppercase tracking-widest shadow-sm"
          >
            <Activity className="w-4 h-4" /> Detailed Audit Log
          </button>
          <button
            onClick={() => { setAddForm({ name: '', email: '', role: 'Sub Store Keeper', branch: 'Bur Dubai', phone: '', password: generatePassword() }); setShowAddModal(true); }}
            className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl hover:bg-slate-800 transition-all font-bold text-xs uppercase tracking-widest shadow-xl shadow-slate-200"
          >
            <UserPlus className="w-4 h-4" /> Provision New User
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-6">
            {[
              { label: 'Active Sessions', val: '24', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: 'System Health', val: '99.9%', icon: Shield, color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { label: 'Pending Audits', val: '3', icon: Key, color: 'text-amber-600', bg: 'bg-amber-50' },
            ].map((c, i) => (
              <div key={i} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                <div className={`p-3 rounded-xl ${c.bg} ${c.color}`}><c.icon className="w-5 h-5" /></div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{c.label}</p>
                  <p className="text-xl font-black text-slate-900">{c.val}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Search + User Table */}
          <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-50 flex items-center justify-between gap-4">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Global Identity Directory</h3>
              <div className="relative w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-8 pr-4 py-2 border border-slate-100 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400 bg-slate-50"
                />
              </div>
              <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap">{filteredUsers.length} users</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 text-[10px] uppercase font-black tracking-widest text-slate-400 border-b border-slate-50">
                    <th className="p-5">User Profile</th>
                    <th className="p-5">Permission Level</th>
                    <th className="p-5">Node Access</th>
                    <th className="p-5">Connectivity</th>
                    <th className="p-5 text-right">Edit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredUsers.map((user, idx) => (
                    <tr key={idx} className="hover:bg-blue-50/20 transition-all group cursor-default">
                      <td className="p-5">
                        <div className="flex items-center gap-4">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white font-black text-[10px] border-2 border-white shadow-md">
                            {user.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 text-sm group-hover:text-blue-700 transition-colors uppercase">{user.name}</p>
                            <p className="text-[10px] text-slate-400 font-medium tracking-tight">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-5">
                        <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-md uppercase tracking-tighter">
                          {user.role}
                        </span>
                      </td>
                      <td className="p-5 text-[11px] font-bold text-slate-500 uppercase">{user.branch}</td>
                      <td className="p-5">
                        <div className="flex flex-col gap-0.5">
                          <span className={`text-[10px] font-bold flex items-center gap-1.5 ${user.status === 'Active' ? 'text-emerald-500' : 'text-slate-300'}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'Active' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></span>
                            {user.status}
                          </span>
                          <span className="text-[9px] text-slate-400 font-medium italic">seen {user.lastLogin}</span>
                        </div>
                      </td>
                      <td className="p-5 text-right">
                        <button
                          onClick={() => openEdit(user)}
                          className="p-2 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all flex items-center gap-1.5 ml-auto text-[10px] font-black uppercase tracking-widest"
                        >
                          <Edit2 className="w-4 h-4" /> Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Environment Status</h3>
            <div className="space-y-3">
              {[
                { label: 'Database', status: 'Sync Active', ok: true },
                { label: 'API Node', status: 'Stable', ok: true },
                { label: 'Auth Server', status: 'Online', ok: true },
                { label: 'Backup', status: 'Last: 6h ago', ok: true },
                { label: 'Zoho Sync', status: 'Connected', ok: true },
              ].map((s, i) => (
                <div key={i} className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
                  <span className="text-[10px] font-black text-slate-500 uppercase">{s.label}</span>
                  <span className={`text-[10px] font-black flex items-center gap-1.5 ${s.ok ? 'text-emerald-600' : 'text-rose-500'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${s.ok ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
                    {s.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Real-time Traffic</h3>
              <span className="text-[9px] font-black text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded">LIVE</span>
            </div>
            <div className="space-y-5">
              {[
                { log: 'SLA Breach: PR-2025-090', time: '2m', color: 'bg-rose-500' },
                { log: 'PR-2025-010 Dispatched', time: '14m', color: 'bg-blue-500' },
                { log: 'Policy Update Applied', time: '45m', color: 'bg-emerald-500' },
                { log: 'Audit Export (Manual)', time: '1h', color: 'bg-slate-400' },
                { log: 'Auth failure (ID: 882)', time: '2h', color: 'bg-amber-500' },
              ].map((l, i) => (
                <div key={i} className="flex gap-4 group cursor-pointer">
                  <div className="relative">
                    <div className={`w-2 h-2 rounded-full ${l.color} mt-1.5 relative z-10`}></div>
                    {i !== 4 && <div className="absolute top-4 bottom-[-16px] left-[3.5px] w-[1px] bg-slate-100"></div>}
                  </div>
                  <div>
                    <p className="text-[11px] font-black text-slate-700 group-hover:text-blue-600 transition-colors">{l.log}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter mt-0.5"><Clock className="w-3 h-3 inline mr-1" />{l.time} ago</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
