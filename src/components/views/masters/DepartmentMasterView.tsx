import { useState } from 'react';
import { Department } from '../../../types';
import { useProcurement } from '../../../context/ProcurementContext';
import { Building2, Plus, Search, Edit2, Trash2, X, Users, MapPin } from 'lucide-react';

const EMPTY_DEPT: Omit<Department, 'id'> = {
  name: '', code: '', branch: 'Bur Dubai', head: '', status: 'Active'
};

export const DepartmentMasterView = () => {
  const { departments, branches, addDepartment, updateDepartment, deleteDepartment } = useProcurement();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [form, setForm] = useState<Omit<Department, 'id'>>(EMPTY_DEPT);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const filtered = departments.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.code.toLowerCase().includes(search.toLowerCase()) ||
    d.head.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => {
    setEditingDept(null);
    setForm(EMPTY_DEPT);
    setShowModal(true);
  };

  const openEdit = (d: Department) => {
    setEditingDept(d);
    setForm({ 
      name: d.name, 
      code: d.code, 
      branch: d.branch, 
      head: d.head, 
      status: d.status 
    });
    setShowModal(true);
  };

  const save = () => {
    if (!form.name || !form.code || !form.head) return;
    if (editingDept) {
      updateDepartment({ ...form, id: editingDept.id });
    } else {
      const newId = `DEPT-${String(departments.length + 1).padStart(3, '0')}`;
      addDepartment({ ...form, id: newId });
    }
    setShowModal(false);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* ── DEPT FORM MODAL ── */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">{editingDept ? 'Edit Department' : 'Add New Department'}</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{editingDept ? editingDept.id : 'Create a new clinical or admin department'}</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-full"><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Department Name *</label>
                <input
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Radiology"
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Department Code *</label>
                <input
                  value={form.code}
                  onChange={e => setForm({ ...form, code: e.target.value })}
                  placeholder="e.g. RAD-01"
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Branch</label>
                <select value={form.branch} onChange={e => setForm({ ...form, branch: e.target.value })} className="w-full border border-slate-200 rounded-xl p-3 text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all">
                  {branches.map(b => <option key={b.name}>{b.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Head of Dept (HOD) *</label>
                <input
                  value={form.head}
                  onChange={e => setForm({ ...form, head: e.target.value })}
                  placeholder="Dr. Name"
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
                disabled={!form.name || !form.code || !form.head}
                onClick={save}
                className="px-8 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-200 transition-all disabled:opacity-50"
              >
                {editingDept ? 'Save Changes' : 'Create Department'}
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
            <h3 className="text-lg font-black text-slate-900 uppercase mb-2">Delete Department?</h3>
            <p className="text-sm text-slate-400 font-medium mb-6">This will permanently remove the department record.</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setDeleteConfirm(null)} className="px-6 py-2.5 text-slate-500 hover:bg-slate-50 rounded-xl text-xs font-black uppercase tracking-widest border border-slate-200">Cancel</button>
              <button onClick={() => { deleteDepartment(deleteConfirm); setDeleteConfirm(null); }} className="px-6 py-2.5 bg-rose-600 text-white rounded-xl hover:bg-rose-700 text-xs font-black uppercase tracking-widest shadow-lg shadow-rose-200">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* ── HEADER ── */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <Building2 className="w-8 h-8 text-blue-600" /> Department Master
          </h1>
          <p className="text-slate-500 mt-1 font-medium italic">Manage clinical and administrative organizational units</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search departments..."
              className="pl-8 pr-4 py-2.5 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400 bg-white w-48"
            />
          </div>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl hover:bg-slate-800 transition-all font-bold text-xs uppercase tracking-widest shadow-xl shadow-slate-200"
          >
            <Plus className="w-4 h-4" /> Add Dept
          </button>
        </div>
      </div>

      {/* ── STATS ── */}
      <div className="grid grid-cols-4 gap-6">
        {[
          { label: 'Total Depts', val: departments.length, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Active', val: departments.filter(d => d.status === 'Active').length, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Avg Depts / Branch', val: (departments.length / (branches.length || 1)).toFixed(1), color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Medical Heads', val: departments.length, color: 'text-violet-600', bg: 'bg-violet-50' },
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

      {/* ── DEPT TABLE ── */}
      <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 text-[10px] uppercase font-black tracking-widest text-slate-400 border-b border-slate-100">
              <th className="p-5">Department</th>
              <th className="p-5">Code</th>
              <th className="p-5"><MapPin className="w-3 h-3 inline mr-1" />Branch</th>
              <th className="p-5"><Users className="w-3 h-3 inline mr-1" />Head of Dept</th>
              <th className="p-5">Status</th>
              <th className="p-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filtered.map(d => (
              <tr key={d.id} className="hover:bg-blue-50/20 transition-all group">
                <td className="p-5">
                  <p className="font-bold text-slate-800 text-sm group-hover:text-blue-700 transition-colors">{d.name}</p>
                  <p className="text-[10px] text-slate-400 font-mono">{d.id}</p>
                </td>
                <td className="p-5 text-xs font-mono text-slate-500 uppercase">{d.code}</td>
                <td className="p-5 text-xs font-bold text-slate-600">{d.branch}</td>
                <td className="p-5 text-xs font-bold text-slate-700">{d.head}</td>
                <td className="p-5">
                  <span className={`text-[10px] font-black flex items-center gap-1.5 ${d.status === 'Active' ? 'text-emerald-600' : 'text-slate-400'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${d.status === 'Active' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></span>
                    {d.status}
                  </span>
                </td>
                <td className="p-5">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => openEdit(d)} className="p-2 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all flex items-center gap-1.5 text-[10px] font-black uppercase">
                      <Edit2 className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button onClick={() => setDeleteConfirm(d.id)} className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all flex items-center gap-1.5 text-[10px] font-black uppercase">
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="p-12 text-center text-slate-400 font-bold text-sm">No departments found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
