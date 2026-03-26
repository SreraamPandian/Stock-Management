import { useState } from 'react';
import { Category } from '../../../types';
import { useProcurement } from '../../../context/ProcurementContext';
import { Package, Plus, Search, Edit2, Trash2, X, ClipboardList, Info } from 'lucide-react';

const EMPTY_CAT: Omit<Category, 'id'> = {
  name: '', prefix: '', description: '', status: 'Active'
};

export const CategoryMasterView = () => {
  const { categories, addCategory, updateCategory, deleteCategory } = useProcurement();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [form, setForm] = useState<Omit<Category, 'id'>>(EMPTY_CAT);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const filtered = categories.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.prefix.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => {
    setEditingCat(null);
    setForm(EMPTY_CAT);
    setShowModal(true);
  };

  const openEdit = (c: Category) => {
    setEditingCat(c);
    setForm({ 
      name: c.name, 
      prefix: c.prefix, 
      description: c.description, 
      status: c.status 
    });
    setShowModal(true);
  };

  const save = () => {
    if (!form.name || !form.prefix) return;
    if (editingCat) {
      updateCategory({ ...form, id: editingCat.id });
    } else {
      const newId = `CAT-${String(categories.length + 1).padStart(3, '0')}`;
      addCategory({ ...form, id: newId });
    }
    setShowModal(false);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* ── CATEGORY FORM MODAL ── */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">{editingCat ? 'Edit Category' : 'Add New Category'}</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{editingCat ? editingCat.id : 'Define a new asset classification'}</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-full"><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Category Name *</label>
                <input
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Life Support Systems"
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">ID Prefix *</label>
                <input
                  value={form.prefix}
                  onChange={e => setForm({ ...form, prefix: e.target.value })}
                  placeholder="e.g. LS (max 4 chars)"
                  maxLength={4}
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all uppercase"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Status</label>
                <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as any })} className="w-full border border-slate-200 rounded-xl p-3 text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all">
                  <option>Active</option>
                  <option>Inactive</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Description</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Describe the type of assets in this category..."
                  rows={3}
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-50">
              <button onClick={() => setShowModal(false)} className="px-6 py-2.5 text-slate-500 hover:bg-slate-50 rounded-xl text-xs font-black uppercase tracking-widest">Cancel</button>
              <button
                disabled={!form.name || !form.prefix}
                onClick={save}
                className="px-8 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-200 transition-all disabled:opacity-50"
              >
                {editingCat ? 'Save Changes' : 'Create Category'}
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
            <h3 className="text-lg font-black text-slate-900 uppercase mb-2">Delete Category?</h3>
            <p className="text-sm text-slate-400 font-medium mb-6">This will remove the classification. Existing assets will NOT be deleted but will lose category metadata.</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setDeleteConfirm(null)} className="px-6 py-2.5 text-slate-500 hover:bg-slate-50 rounded-xl text-xs font-black uppercase tracking-widest border border-slate-200">Cancel</button>
              <button onClick={() => { deleteCategory(deleteConfirm); setDeleteConfirm(null); }} className="px-6 py-2.5 bg-rose-600 text-white rounded-xl hover:bg-rose-700 text-xs font-black uppercase tracking-widest shadow-lg shadow-rose-200">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* ── HEADER ── */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <Package className="w-8 h-8 text-blue-600" /> Category Master
          </h1>
          <p className="text-slate-500 mt-1 font-medium italic">Classify and organize assets for better tracking and reporting</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search categories..."
              className="pl-8 pr-4 py-2.5 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400 bg-white w-48"
            />
          </div>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl hover:bg-slate-800 transition-all font-bold text-xs uppercase tracking-widest shadow-xl shadow-slate-200"
          >
            <Plus className="w-4 h-4" /> Add Category
          </button>
        </div>
      </div>

      {/* ── STATS ── */}
      <div className="grid grid-cols-4 gap-6">
        {[
          { label: 'Total Categories', val: categories.length, color: 'text-blue-600', bg: 'bg-blue-50', icon: Package },
          { label: 'Active Classes', val: categories.filter(c => c.status === 'Active').length, color: 'text-emerald-600', bg: 'bg-emerald-50', icon: ClipboardList },
          { label: 'High Priority', val: '2', color: 'text-amber-600', bg: 'bg-amber-50', icon: Info },
          { label: 'System Defined', val: '5', color: 'text-violet-600', bg: 'bg-violet-50', icon: Info },
        ].map((c, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className={`p-3 rounded-xl ${c.bg}`}><c.icon className={`w-5 h-5 ${c.color}`} /></div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{c.label}</p>
              <p className="text-2xl font-black text-slate-900">{c.val}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── CATEGORY TABLE ── */}
      <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 text-[10px] uppercase font-black tracking-widest text-slate-400 border-b border-slate-100">
              <th className="p-5">Category Name</th>
              <th className="p-5">Prefix</th>
              <th className="p-5">Description</th>
              <th className="p-5">Status</th>
              <th className="p-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filtered.map(c => (
              <tr key={c.id} className="hover:bg-blue-50/20 transition-all group">
                <td className="p-5">
                  <p className="font-bold text-slate-800 text-sm group-hover:text-blue-700 transition-colors">{c.name}</p>
                  <p className="text-[10px] text-slate-400 font-mono">{c.id}</p>
                </td>
                <td className="p-5">
                   <span className="font-mono text-xs font-black bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                    {c.prefix}
                  </span>
                </td>
                <td className="p-5 text-xs text-slate-500 max-w-xs truncate">{c.description || 'No description provided'}</td>
                <td className="p-5">
                  <span className={`text-[10px] font-black flex items-center gap-1.5 ${c.status === 'Active' ? 'text-emerald-600' : 'text-slate-400'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${c.status === 'Active' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></span>
                    {c.status}
                  </span>
                </td>
                <td className="p-5">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => openEdit(c)} className="p-2 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all flex items-center gap-1.5 text-[10px] font-black uppercase">
                      <Edit2 className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button onClick={() => setDeleteConfirm(c.id)} className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all flex items-center gap-1.5 text-[10px] font-black uppercase">
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={5} className="p-12 text-center text-slate-400 font-bold text-sm">No categories found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
