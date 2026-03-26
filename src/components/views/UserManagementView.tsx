import { useState } from 'react';
import { MasterUser, Role } from '../../types';
import { Users, Plus, Search, Edit2, Trash2, X, Eye, EyeOff, Shield, MapPin } from 'lucide-react';
import { useProcurement } from '../../context/ProcurementContext';

const ALL_ROLES: Role[] = [
    'Super Admin', 'Sub Store Keeper', 'Centre In-Charge',
    'Central Store', 'Procurement Officer', 'SMD', 'Finance'
];

const EMPTY_FORM: Omit<MasterUser, 'id'> & { password?: string } = {
    name: '', email: '', phone: '', role: 'Sub Store Keeper',
    branch: 'Bur Dubai', status: 'Active', joined: new Date().toISOString().split('T')[0],
    lastLogin: 'Never'
};

const roleColors: Record<string, string> = {
    'Super Admin': 'bg-violet-100 text-violet-700',
    'SMD': 'bg-rose-50 text-rose-600',
    'Finance': 'bg-emerald-50 text-emerald-700',
    'Procurement Officer': 'bg-blue-50 text-blue-700',
    'Central Store': 'bg-amber-50 text-amber-700',
    'Centre In-Charge': 'bg-indigo-50 text-indigo-700',
    'Sub Store Keeper': 'bg-slate-100 text-slate-600',
};

export const UserManagementView = () => {
    const { users, addUser, updateUser, deleteUser, branches } = useProcurement();
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('All');
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState<MasterUser | null>(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [showPass, setShowPass] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

    const filtered = users.filter(u => {
        const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
            u.email.toLowerCase().includes(search.toLowerCase()) ||
            u.role.toLowerCase().includes(search.toLowerCase());
        const matchRole = roleFilter === 'All' || u.role === roleFilter;
        return matchSearch && matchRole;
    });

    const openAdd = () => {
        setEditingUser(null);
        setForm(EMPTY_FORM);
        setShowModal(true);
    };

    const openEdit = (u: MasterUser) => {
        setEditingUser(u);
        setForm({ 
            name: u.name, email: u.email, phone: u.phone, 
            role: u.role, branch: u.branch, status: u.status, 
            joined: u.joined, lastLogin: u.lastLogin 
        });
        setShowModal(true);
    };

    const save = () => {
        if (!form.name || !form.email) return;
        if (editingUser) {
            updateUser({ ...form as MasterUser, id: editingUser.id });
        } else {
            const newId = `USR-${String(users.length + 1).padStart(3, '0')}`;
            addUser({ ...form as MasterUser, id: newId, lastLogin: 'Never' });
        }
        setShowModal(false);
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">

            {/* ── USER FORM MODAL ── */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">{editingUser ? 'Edit User' : 'Add New User'}</h2>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{editingUser ? editingUser.id : 'Provision portal access'}</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-full"><X className="w-5 h-5 text-slate-400" /></button>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Full Name *</label>
                                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. John Smith"
                                    className="w-full border border-slate-200 rounded-xl p-3 text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold" />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Email *</label>
                                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="user@probiz.ae"
                                    className="w-full border border-slate-200 rounded-xl p-3 text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Phone</label>
                                <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+971-5X-XXX-XXXX"
                                    className="w-full border border-slate-200 rounded-xl p-3 text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Password {editingUser ? '(leave blank)' : ''}</label>
                                <div className="relative">
                                    <input type={showPass ? 'text' : 'password'} value={form.password || ''} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Temp password"
                                        className="w-full border border-slate-200 rounded-xl p-3 pr-10 text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all" />
                                    <button onClick={() => setShowPass(!showPass)} className="absolute right-3 top-3.5 text-slate-300 hover:text-slate-500">
                                        {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Role</label>
                                <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value as Role })}
                                    className="w-full border border-slate-200 rounded-xl p-3 text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold bg-white">
                                    {ALL_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Branch</label>
                                <select value={form.branch} onChange={e => setForm({ ...form, branch: e.target.value })}
                                    className="w-full border border-slate-200 rounded-xl p-3 text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold bg-white">
                                    {branches.map(b => <option key={b.name} value={b.name}>{b.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Status</label>
                                <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as any })}
                                    className="w-full border border-slate-200 rounded-xl p-3 text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold bg-white">
                                    <option>Active</option>
                                    <option>On Leave</option>
                                    <option>Suspended</option>
                                </select>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-50">
                            <button onClick={() => setShowModal(false)} className="px-6 py-2.5 text-slate-500 hover:bg-slate-50 rounded-xl text-xs font-black uppercase tracking-widest">Cancel</button>
                            <button
                                disabled={!form.name || !form.email}
                                onClick={save}
                                className="px-8 py-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 text-xs font-black uppercase tracking-widest shadow-xl shadow-slate-200 transition-all disabled:opacity-50"
                            >
                                {editingUser ? 'Save Changes' : 'Create User'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── DELETE CONFIRM ── */}
            {deleteConfirm && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-sm p-8 text-center animate-in zoom-in-95 duration-200">
                        <div className="w-14 h-14 rounded-full bg-rose-50 flex items-center justify-center mx-auto mb-4">
                            <Trash2 className="w-7 h-7 text-rose-500" />
                        </div>
                        <h3 className="text-lg font-black text-slate-900 uppercase mb-2">Delete User?</h3>
                        <p className="text-sm text-slate-400 font-medium mb-6">This will revoke portal access for this user permanently.</p>
                        <div className="flex gap-3 justify-center">
                            <button onClick={() => setDeleteConfirm(null)} className="px-6 py-2.5 text-slate-500 hover:bg-slate-50 rounded-xl text-xs font-black uppercase tracking-widest border border-slate-200">Cancel</button>
                            <button onClick={() => { deleteUser(deleteConfirm); setDeleteConfirm(null); }} className="px-6 py-2.5 bg-rose-600 text-white rounded-xl hover:bg-rose-700 text-xs font-black uppercase tracking-widest shadow-lg shadow-rose-200">Delete</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── HEADER ── */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <Users className="w-8 h-8 text-blue-600" /> User Management
                    </h1>
                    <p className="text-slate-500 mt-1 font-medium italic">Manage all portal users, roles, and access permissions</p>
                </div>
                <div className="flex gap-3">
                    <div className="relative">
                        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users..."
                            className="pl-8 pr-4 py-2.5 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400 bg-white w-48 shadow-sm font-bold" />
                    </div>
                    <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
                        className="border border-slate-200 rounded-xl px-3 py-2.5 text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400 bg-white text-slate-600 shadow-sm cursor-pointer">
                        <option value="All">All Roles</option>
                        {ALL_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                    <button onClick={openAdd}
                        className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl hover:bg-slate-800 transition-all font-bold text-xs uppercase tracking-widest shadow-xl shadow-slate-200">
                        <Plus className="w-4 h-4" /> Add User
                    </button>
                </div>
            </div>

            {/* ── STATS ── */}
            <div className="grid grid-cols-4 gap-6">
                {[
                    { label: 'Total Users', val: users.length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Active', val: users.filter(u => u.status === 'Active').length, icon: Shield, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { label: 'On Leave', val: users.filter(u => u.status === 'On Leave').length, icon: EyeOff, color: 'text-amber-600', bg: 'bg-amber-50' },
                    { label: 'Roles in Use', val: new Set(users.map(u => u.role)).size, icon: MapPin, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                ].map((c, i) => (
                    <div key={i} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                        <div className={`p-3 rounded-xl ${c.bg}`}><c.icon className={`w-5 h-5 ${c.color}`} /></div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{c.label}</p>
                            <p className="text-2xl font-black text-slate-900">{c.val}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── USER TABLE ── */}
            <div className="bg-white rounded-[32px] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50/80 text-[10px] uppercase font-black tracking-widest text-slate-400 border-b border-slate-100">
                            <th className="p-5">User Profile</th>
                            <th className="p-5">Role</th>
                            <th className="p-5">Branch</th>
                            <th className="p-5">Status</th>
                            <th className="p-5">Last Login</th>
                            <th className="p-5 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {filtered.map(u => (
                            <tr key={u.id} className="hover:bg-blue-50/20 transition-all group cursor-default text-sm font-medium">
                                <td className="p-5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white font-black text-[12px] shadow-lg shrink-0">
                                            {u.name.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <div>
                                            <p className="font-black text-slate-800 group-hover:text-blue-700 transition-colors tracking-tight">{u.name}</p>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{u.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-5">
                                    <span className={`text-[9px] font-black px-2.5 py-1 rounded border uppercase tracking-widest ${roleColors[u.role] ?? 'bg-slate-100 text-slate-600'}`}>
                                        {u.role}
                                    </span>
                                </td>
                                <td className="p-5 text-xs font-black text-slate-600 flex items-center gap-2">
                                  <MapPin className="w-3.5 h-3.5 text-blue-400" /> {u.branch}
                                </td>
                                <td className="p-5">
                                    <span className={`text-[10px] font-black flex items-center gap-1.5 ${u.status === 'Active' ? 'text-emerald-600' : u.status === 'On Leave' ? 'text-amber-500' : 'text-slate-400'}`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${u.status === 'Active' ? 'bg-emerald-500 animate-pulse' : u.status === 'On Leave' ? 'bg-amber-400' : 'bg-slate-300'}`}></span>
                                        {u.status}
                                    </span>
                                </td>
                                <td className="p-5 text-xs text-slate-500 font-bold italic">{u.lastLogin}</td>
                                <td className="p-5">
                                    <div className="flex items-center justify-end gap-2">
                                        <button onClick={() => openEdit(u)} className="p-2 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest">
                                            <Edit2 className="w-3.5 h-3.5" /> Edit
                                        </button>
                                        {u.role !== 'Super Admin' && (
                                            <button onClick={() => setDeleteConfirm(u.id)} className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest">
                                                <Trash2 className="w-3.5 h-3.5" /> Delete
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filtered.length === 0 && (
                            <tr><td colSpan={6} className="p-12 text-center text-slate-400 font-bold text-sm">No users found</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
