import { useState } from 'react';
import { Store } from '../../types';
import { Building2, Plus, Search, Edit2, Trash2, X, MapPin, Users } from 'lucide-react';

const initialStores: Store[] = [
    { id: 'STR-001', name: 'Bur Dubai Sub Store A', branch: 'Bur Dubai', location: 'Ground Floor, Block A', type: 'Sub Store', incharge: 'Ahmed Khan', capacity: 500, status: 'Active' },
    { id: 'STR-002', name: 'Bur Dubai Sub Store B', branch: 'Bur Dubai', location: '1st Floor, Block B', type: 'Sub Store', incharge: 'Fatima Ali', capacity: 300, status: 'Active' },
    { id: 'STR-003', name: 'Al Quoz Sub Store', branch: 'Al Quoz', location: 'Wing C, Ground Floor', type: 'Sub Store', incharge: 'Sarah Smith', capacity: 400, status: 'Active' },
    { id: 'STR-004', name: 'Central Warehouse – Global', branch: 'Global', location: 'Logistics Hub, Jebel Ali', type: 'Central Store', incharge: 'Omar Farooq', capacity: 5000, status: 'Active' },
    { id: 'STR-005', name: 'Al Quoz Auxiliary Store', branch: 'Al Quoz', location: 'Basement, Wing A', type: 'Sub Store', incharge: 'Dr. Hassan', capacity: 250, status: 'Inactive' },
];

const EMPTY_STORE: Omit<Store, 'id'> = {
    name: '', branch: 'Bur Dubai', location: '', type: 'Sub Store', incharge: '', capacity: 0, status: 'Active'
};

export const StoreManagementView = () => {
    const [stores, setStores] = useState<Store[]>(initialStores);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingStore, setEditingStore] = useState<Store | null>(null);
    const [form, setForm] = useState<Omit<Store, 'id'>>(EMPTY_STORE);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

    const filtered = stores.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.branch.toLowerCase().includes(search.toLowerCase()) ||
        s.type.toLowerCase().includes(search.toLowerCase())
    );

    const openAdd = () => {
        setEditingStore(null);
        setForm(EMPTY_STORE);
        setShowModal(true);
    };

    const openEdit = (s: Store) => {
        setEditingStore(s);
        setForm({ name: s.name, branch: s.branch, location: s.location, type: s.type, incharge: s.incharge, capacity: s.capacity, status: s.status });
        setShowModal(true);
    };

    const save = () => {
        if (!form.name || !form.location || !form.incharge) return;
        if (editingStore) {
            setStores(prev => prev.map(s => s.id === editingStore.id ? { ...form, id: editingStore.id } : s));
        } else {
            const newId = `STR-${String(stores.length + 1).padStart(3, '0')}`;
            setStores(prev => [...prev, { ...form, id: newId }]);
        }
        setShowModal(false);
    };

    const remove = (id: string) => {
        setStores(prev => prev.filter(s => s.id !== id));
        setDeleteConfirm(null);
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">

            {/* ── STORE FORM MODAL ── */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">{editingStore ? 'Edit Store' : 'Add New Store'}</h2>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{editingStore ? editingStore.id : 'Create a new store location'}</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-full"><X className="w-5 h-5 text-slate-400" /></button>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Store Name *</label>
                                <input
                                    value={form.name}
                                    onChange={e => setForm({ ...form, name: e.target.value })}
                                    placeholder="e.g. Bur Dubai Sub Store C"
                                    className="w-full border border-slate-200 rounded-xl p-3 text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Branch</label>
                                <select value={form.branch} onChange={e => setForm({ ...form, branch: e.target.value })} className="w-full border border-slate-200 rounded-xl p-3 text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all">
                                    {['Bur Dubai', 'Al Quoz', 'Global'].map(b => <option key={b}>{b}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Store Type</label>
                                <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value as any })} className="w-full border border-slate-200 rounded-xl p-3 text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all">
                                    <option>Sub Store</option>
                                    <option>Central Store</option>
                                </select>
                            </div>
                            <div className="col-span-2">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Location / Address *</label>
                                <input
                                    value={form.location}
                                    onChange={e => setForm({ ...form, location: e.target.value })}
                                    placeholder="e.g. 2nd Floor, Block D"
                                    className="w-full border border-slate-200 rounded-xl p-3 text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">In-Charge *</label>
                                <input
                                    value={form.incharge}
                                    onChange={e => setForm({ ...form, incharge: e.target.value })}
                                    placeholder="Staff name"
                                    className="w-full border border-slate-200 rounded-xl p-3 text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Capacity (Units)</label>
                                <input
                                    type="number"
                                    value={form.capacity}
                                    onChange={e => setForm({ ...form, capacity: parseInt(e.target.value) || 0 })}
                                    className="w-full border border-slate-200 rounded-xl p-3 text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Status</label>
                                <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as any })} className="w-full border border-slate-200 rounded-xl p-3 text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all">
                                    <option>Active</option>
                                    <option>Inactive</option>
                                </select>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-50">
                            <button onClick={() => setShowModal(false)} className="px-6 py-2.5 text-slate-500 hover:bg-slate-50 rounded-xl text-xs font-black uppercase tracking-widest">Cancel</button>
                            <button
                                disabled={!form.name || !form.location || !form.incharge}
                                onClick={save}
                                className="px-8 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-200 transition-all disabled:opacity-50"
                            >
                                {editingStore ? 'Save Changes' : 'Create Store'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── DELETE CONFIRM ── */}
            {deleteConfirm && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center animate-in zoom-in-95 duration-200">
                        <div className="w-14 h-14 rounded-full bg-rose-50 flex items-center justify-center mx-auto mb-4">
                            <Trash2 className="w-7 h-7 text-rose-500" />
                        </div>
                        <h3 className="text-lg font-black text-slate-900 uppercase mb-2">Delete Store?</h3>
                        <p className="text-sm text-slate-400 font-medium mb-6">This action cannot be undone. The store record will be permanently removed.</p>
                        <div className="flex gap-3 justify-center">
                            <button onClick={() => setDeleteConfirm(null)} className="px-6 py-2.5 text-slate-500 hover:bg-slate-50 rounded-xl text-xs font-black uppercase tracking-widest border border-slate-200">Cancel</button>
                            <button onClick={() => remove(deleteConfirm)} className="px-6 py-2.5 bg-rose-600 text-white rounded-xl hover:bg-rose-700 text-xs font-black uppercase tracking-widest shadow-lg shadow-rose-200">Delete</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── HEADER ── */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <Building2 className="w-8 h-8 text-blue-600" /> Store Management
                    </h1>
                    <p className="text-slate-500 mt-1 font-medium italic">Manage all store locations across branches</p>
                </div>
                <div className="flex gap-3">
                    <div className="relative">
                        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search stores..."
                            className="pl-8 pr-4 py-2.5 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400 bg-white w-48"
                        />
                    </div>
                    <button
                        onClick={openAdd}
                        className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl hover:bg-slate-800 transition-all font-bold text-xs uppercase tracking-widest shadow-xl shadow-slate-200"
                    >
                        <Plus className="w-4 h-4" /> Add Store
                    </button>
                </div>
            </div>

            {/* ── STATS ── */}
            <div className="grid grid-cols-4 gap-6">
                {[
                    { label: 'Total Stores', val: stores.length, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Active', val: stores.filter(s => s.status === 'Active').length, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { label: 'Sub Stores', val: stores.filter(s => s.type === 'Sub Store').length, color: 'text-amber-600', bg: 'bg-amber-50' },
                    { label: 'Central Stores', val: stores.filter(s => s.type === 'Central Store').length, color: 'text-violet-600', bg: 'bg-violet-50' },
                ].map((c, i) => (
                    <div key={i} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${c.bg}`}><Building2 className={`w-5 h-5 ${c.color}`} /></div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{c.label}</p>
                            <p className="text-2xl font-black text-slate-900">{c.val}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── STORE TABLE ── */}
            <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50/80 text-[10px] uppercase font-black tracking-widest text-slate-400 border-b border-slate-100">
                            <th className="p-5">Store</th>
                            <th className="p-5">Type</th>
                            <th className="p-5">Branch</th>
                            <th className="p-5"><MapPin className="w-3 h-3 inline mr-1" />Location</th>
                            <th className="p-5"><Users className="w-3 h-3 inline mr-1" />In-Charge</th>
                            <th className="p-5">Capacity</th>
                            <th className="p-5">Status</th>
                            <th className="p-5 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {filtered.map(s => (
                            <tr key={s.id} className="hover:bg-blue-50/20 transition-all group">
                                <td className="p-5">
                                    <p className="font-bold text-slate-800 text-sm group-hover:text-blue-700 transition-colors">{s.name}</p>
                                    <p className="text-[10px] text-slate-400 font-mono">{s.id}</p>
                                </td>
                                <td className="p-5">
                                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-tighter ${s.type === 'Central Store' ? 'bg-violet-50 text-violet-700' : 'bg-blue-50 text-blue-700'}`}>
                                        {s.type}
                                    </span>
                                </td>
                                <td className="p-5 text-xs font-bold text-slate-600">{s.branch}</td>
                                <td className="p-5 text-xs text-slate-500">{s.location}</td>
                                <td className="p-5 text-xs font-bold text-slate-700">{s.incharge}</td>
                                <td className="p-5 text-xs font-bold text-slate-600">{s.capacity.toLocaleString()} units</td>
                                <td className="p-5">
                                    <span className={`text-[10px] font-black flex items-center gap-1.5 ${s.status === 'Active' ? 'text-emerald-600' : 'text-slate-400'}`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${s.status === 'Active' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></span>
                                        {s.status}
                                    </span>
                                </td>
                                <td className="p-5">
                                    <div className="flex items-center justify-end gap-2">
                                        <button onClick={() => openEdit(s)} className="p-2 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all flex items-center gap-1.5 text-[10px] font-black uppercase">
                                            <Edit2 className="w-3.5 h-3.5" /> Edit
                                        </button>
                                        <button onClick={() => setDeleteConfirm(s.id)} className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all flex items-center gap-1.5 text-[10px] font-black uppercase">
                                            <Trash2 className="w-3.5 h-3.5" /> Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filtered.length === 0 && (
                            <tr><td colSpan={8} className="p-12 text-center text-slate-400 font-bold text-sm">No stores found</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
