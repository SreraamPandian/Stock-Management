import { useState, useRef } from 'react';
import { useProcurement } from '../../context/ProcurementContext';
import { PurchaseRequest } from '../../types';
import { FileText, Download, Eye, CheckCircle, Clock, AlertCircle, Filter, Search, Printer, X, Building2, Package, User, MapPin, Calendar } from 'lucide-react';

// ── PO Generator ──────────────────────────────────────────
const PODocument = ({ pr, poNumber }: { pr: PurchaseRequest; poNumber: string }) => (
    <div id="po-print-area" className="bg-white p-10 font-sans text-slate-800" style={{ minWidth: 700 }}>
        {/* Header */}
        <div className="flex items-start justify-between mb-8 pb-6 border-b-2 border-slate-900">
            <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">PURCHASE ORDER</h1>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-1">Pro-Biz Medical Fitness Centers</p>
            </div>
            <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">PO Number</p>
                <p className="text-xl font-black text-blue-700 font-mono">{poNumber}</p>
                <p className="text-[10px] text-slate-400 mt-1">{new Date().toLocaleDateString('en-AE', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
            </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Bill To / Ship To</p>
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-1">
                    <p className="font-black text-slate-800">Pro-Biz — {pr.branch}</p>
                    <p className="text-sm text-slate-600">{pr.department} Department</p>
                    <p className="text-sm text-slate-500">Requested by: {pr.requester}</p>
                </div>
            </div>
            <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Vendor Details</p>
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-1">
                    <p className="font-black text-slate-800">{pr.vendor || 'TBD — Procurement to assign'}</p>
                    <p className="text-sm text-slate-500">Invoice Ref: {pr.vendorInvoiceNumber || '—'}</p>
                    <p className="text-sm text-slate-500">Payment: {pr.paymentMode || pr.paymentStructure || '—'}</p>
                </div>
            </div>
        </div>

        {/* Line Items */}
        <table className="w-full border-collapse mb-8">
            <thead>
                <tr className="bg-slate-900 text-white text-[11px] font-black uppercase tracking-widest">
                    <th className="p-3 text-left rounded-tl-lg">#</th>
                    <th className="p-3 text-left">Item Description</th>
                    <th className="p-3 text-left">Category</th>
                    <th className="p-3 text-center">Qty</th>
                    <th className="p-3 text-right">Unit Price (AED)</th>
                    <th className="p-3 text-right rounded-tr-lg">Total (AED)</th>
                </tr>
            </thead>
            <tbody>
                <tr className="border-b border-slate-100">
                    <td className="p-3 text-sm text-slate-500">01</td>
                    <td className="p-3 text-sm font-bold text-slate-800">{pr.itemName || pr.category}</td>
                    <td className="p-3 text-sm text-slate-500">{pr.category}</td>
                    <td className="p-3 text-sm text-center font-bold">{pr.quantity}</td>
                    <td className="p-3 text-sm text-right">{pr.price ? (pr.price / pr.quantity).toFixed(2) : '—'}</td>
                    <td className="p-3 text-sm text-right font-black text-blue-700">{pr.price ? pr.price.toLocaleString('en-AE', { minimumFractionDigits: 2 }) : '—'}</td>
                </tr>
            </tbody>
            <tfoot>
                <tr className="bg-slate-50">
                    <td colSpan={5} className="p-3 text-right text-sm font-black text-slate-700 uppercase tracking-widest">Grand Total</td>
                    <td className="p-3 text-right font-black text-blue-700 text-lg">{pr.price ? `AED ${pr.price.toLocaleString('en-AE', { minimumFractionDigits: 2 })}` : 'AED —'}</td>
                </tr>
            </tfoot>
        </table>

        {/* Reference */}
        <div className="grid grid-cols-3 gap-4 mb-8 text-[11px]">
            {[
                { label: 'PR Reference', val: pr.id },
                { label: 'Priority', val: pr.priority },
                { label: 'Delivery Location', val: pr.deliveryLocation || pr.branch },
                { label: 'SMD Approved', val: pr.smdApproved ? 'Yes — Authorized' : 'No' },
                { label: 'Expected Delivery', val: pr.expectedDeliveryDate ? new Date(pr.expectedDeliveryDate).toLocaleDateString('en-AE') : '—' },
                { label: 'PO Status', val: 'Issued — Pending GRN' },
            ].map((r, i) => (
                <div key={i} className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                    <p className="font-black text-slate-400 uppercase tracking-widest text-[9px]">{r.label}</p>
                    <p className="font-bold text-slate-800 mt-0.5">{r.val}</p>
                </div>
            ))}
        </div>

        {/* Signatures */}
        <div className="grid grid-cols-3 gap-6 mt-10 pt-6 border-t border-slate-200">
            {['Finance Officer', 'Procurement Officer', 'Authorized Signatory (SMD)'].map((s, i) => (
                <div key={i} className="text-center">
                    <div className="border-b-2 border-slate-300 h-8 mb-2"></div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s}</p>
                </div>
            ))}
        </div>

        <p className="text-center text-[10px] text-slate-300 font-bold uppercase tracking-widest mt-8">
            This is a system-generated document · Pro-Biz Procurement Portal v2.1 · Confidential
        </p>
    </div>
);

// ── Main View ──────────────────────────────────────────────
export const PurchaseOrderView = () => {
    const { prs, updatePRStatus, role } = useProcurement();
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [selectedPR, setSelectedPR] = useState<PurchaseRequest | null>(null);
    const [showPO, setShowPO] = useState(false);

    // PRs eligible for PO (Finance approved or already PO issued)
    const eligiblePRs = prs.filter(pr =>
        ['Pending - Finance', 'PO Issued', 'Order Placed', 'GRN Pending', 'GRN Completed', 'In Transit', 'Delivered', 'Closed - Completed'].includes(pr.status)
    );

    const filtered = eligiblePRs.filter(pr => {
        const matchSearch = pr.id.toLowerCase().includes(search.toLowerCase()) ||
            pr.department.toLowerCase().includes(search.toLowerCase()) ||
            (pr.vendor || '').toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter === 'All' || pr.status === statusFilter;
        return matchSearch && matchStatus;
    });

    const poNumber = (pr: PurchaseRequest) => `PO-${pr.id.replace('PR-', '')}-${pr.branch.slice(0, 2).toUpperCase()}`;

    const issuePO = (pr: PurchaseRequest) => {
        updatePRStatus(pr.id, 'PO Issued', 'Purchase Order issued and sent to vendor.', {
            vendor: pr.vendor || 'MedSupply Gulf',
            price: pr.price || pr.quantity * 150,
        });
        setSelectedPR(null);
    };

    const handlePrint = () => {
        const content = document.getElementById('po-print-area');
        if (!content) return;
        const w = window.open('', '_blank');
        if (!w) return;
        w.document.write(`<html><head><title>PO</title><style>
      body{font-family:sans-serif;margin:0;padding:0} 
      table{border-collapse:collapse;width:100%}
      th,td{padding:10px 12px;text-align:left}
      thead tr{background:#0f172a;color:white}
      tfoot tr{background:#f8fafc}
      @media print{body{-webkit-print-color-adjust:exact}}
    </style></head><body>${content.innerHTML}</body></html>`);
        w.document.close();
        w.print();
    };

    const statusColors: Record<string, string> = {
        'Pending - Finance': 'bg-amber-50 text-amber-700 border-amber-200',
        'PO Issued': 'bg-blue-50 text-blue-700 border-blue-200',
        'Order Placed': 'bg-indigo-50 text-indigo-700 border-indigo-200',
        'GRN Pending': 'bg-orange-50 text-orange-700 border-orange-200',
        'GRN Completed': 'bg-emerald-50 text-emerald-700 border-emerald-200',
        'In Transit': 'bg-purple-50 text-purple-700 border-purple-200',
        'Delivered': 'bg-teal-50 text-teal-700 border-teal-200',
        'Closed - Completed': 'bg-slate-50 text-slate-500 border-slate-200',
    };

    const stats = [
        { label: 'Pending Finance', val: eligiblePRs.filter(p => p.status === 'Pending - Finance').length, color: 'text-amber-600', bg: 'bg-amber-50', icon: Clock },
        { label: 'PO Issued', val: eligiblePRs.filter(p => ['PO Issued', 'Order Placed'].includes(p.status)).length, color: 'text-blue-600', bg: 'bg-blue-50', icon: FileText },
        { label: 'GRN In Progress', val: eligiblePRs.filter(p => ['GRN Pending', 'In Transit', 'Dispatch Scheduled'].includes(p.status)).length, color: 'text-orange-600', bg: 'bg-orange-50', icon: Package },
        { label: 'Closed This Month', val: eligiblePRs.filter(p => p.status === 'Closed - Completed').length, color: 'text-emerald-600', bg: 'bg-emerald-50', icon: CheckCircle },
    ];

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <FileText className="w-8 h-8 text-blue-600" /> Purchase Orders
                    </h1>
                    <p className="text-slate-500 mt-1 font-medium text-sm">Generate, issue and track all Purchase Orders across PRs</p>
                </div>
                <div className="flex gap-2">
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search PO / PR / Vendor…" className="pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all w-56" />
                    </div>
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500">
                        {['All', 'Pending - Finance', 'PO Issued', 'Order Placed', 'GRN Pending', 'GRN Completed', 'Delivered', 'Closed - Completed'].map(s => <option key={s}>{s}</option>)}
                    </select>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
                {stats.map((s, i) => (
                    <div key={i} className={`bg-white rounded-2xl border border-slate-100 p-5 flex items-center gap-4 shadow-sm`}>
                        <div className={`p-3 rounded-xl ${s.bg} ${s.color} shrink-0`}><s.icon className="w-5 h-5" /></div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
                            <p className={`text-2xl font-black ${s.color}`}>{s.val}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
                <div className="p-5 border-b border-slate-50 flex items-center justify-between">
                    <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <Filter className="w-3.5 h-3.5" /> {filtered.length} Purchase Orders
                    </h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/70 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                                <th className="p-4">PO Number</th>
                                <th className="p-4">PR Reference</th>
                                <th className="p-4">Department / Branch</th>
                                <th className="p-4">Vendor</th>
                                <th className="p-4">Amount (AED)</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filtered.length === 0 ? (
                                <tr><td colSpan={7} className="p-16 text-center text-slate-400 font-medium">No purchase orders found</td></tr>
                            ) : filtered.map(pr => (
                                <tr key={pr.id} className="hover:bg-blue-50/20 transition-all group">
                                    <td className="p-4">
                                        <span className="font-mono font-black text-blue-700 text-sm">{poNumber(pr)}</span>
                                    </td>
                                    <td className="p-4">
                                        <span className="font-mono font-bold text-slate-600 text-xs">{pr.id}</span>
                                        <p className="text-[10px] text-slate-400 mt-0.5">{pr.category}</p>
                                    </td>
                                    <td className="p-4">
                                        <p className="text-xs font-bold text-slate-700">{pr.department}</p>
                                        <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-0.5">
                                            <MapPin className="w-3 h-3" /> {pr.branch}
                                        </div>
                                    </td>
                                    <td className="p-4 text-sm text-slate-600 font-medium">{pr.vendor || <span className="text-slate-300 italic">Not assigned</span>}</td>
                                    <td className="p-4 text-sm font-black text-slate-800">
                                        {pr.price ? `AED ${pr.price.toLocaleString('en-AE')}` : <span className="text-slate-300">—</span>}
                                    </td>
                                    <td className="p-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border ${statusColors[pr.status] || 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                                            <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70"></span>
                                            {pr.status.replace('Pending - ', '')}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2 justify-end">
                                            {pr.status === 'Pending - Finance' && role !== 'Procurement Officer' && (
                                                <button
                                                    onClick={() => issuePO(pr)}
                                                    className="px-3 py-1.5 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-blue-700 transition-all shadow-md shadow-blue-200"
                                                >
                                                    Issue PO
                                                </button>
                                            )}
                                            <button
                                                onClick={() => { setSelectedPR(pr); setShowPO(true); }}
                                                className="p-1.5 hover:bg-blue-50 rounded-lg text-slate-400 hover:text-blue-600 transition-all"
                                                title="View PO"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* PO Preview Modal */}
            {showPO && selectedPR && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="flex items-center justify-between p-4 border-b border-slate-100 shrink-0">
                            <h3 className="font-black text-slate-900 uppercase tracking-tight text-sm flex items-center gap-2">
                                <FileText className="w-4 h-4 text-blue-600" /> {poNumber(selectedPR)}
                            </h3>
                            <div className="flex items-center gap-2">
                                <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-slate-800 transition-all">
                                    <Printer className="w-3.5 h-3.5" /> Print / Download
                                </button>
                                <button onClick={() => setShowPO(false)} className="p-1.5 hover:bg-slate-100 rounded-full">
                                    <X className="w-4 h-4 text-slate-400" />
                                </button>
                            </div>
                        </div>
                        <div className="overflow-y-auto flex-1">
                            <PODocument pr={selectedPR} poNumber={poNumber(selectedPR)} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
