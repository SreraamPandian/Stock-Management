import { useProcurement } from '../../context/ProcurementContext';
import { PurchaseRequest } from '../../types';
import { useState } from 'react';
import { CheckCircle, XCircle, Clock, AlertTriangle, FileText, BarChart3, MapPin, ArrowRight } from 'lucide-react';
import { SLATimer } from '../shared/SLATimer';

// Approval queue view for SMD and Finance roles
// Shows only PRs pending their specific action — no PR creation form

export const ApprovalQueueView = () => {
    const { role, branch, prs, updatePRStatus } = useProcurement();
    const [selectedPR, setSelectedPR] = useState<PurchaseRequest | null>(null);
    const [remarks, setRemarks] = useState('');
    const [action, setAction] = useState<'approve' | 'reject' | null>(null);
    const [processing, setProcessing] = useState(false);
    const [done, setDone] = useState<string | null>(null);

    const pendingStatus = role === 'SMD' ? 'Pending - SMD' : 'Pending - Finance';
    const nextStatus = role === 'SMD' ? 'Pending - Finance' : 'PO Issued';

    const queue = prs.filter(pr => pr.status === pendingStatus);
    const urgent = queue.filter(pr => pr.priority === 'Emergency' || pr.priority === 'High');
    const alreadyActed = prs.filter(pr =>
        role === 'SMD'
            ? ['Pending - Finance', 'PO Issued', 'Order Placed', 'GRN Pending', 'GRN Completed', 'In Transit', 'Closed - Completed'].includes(pr.status)
            : ['PO Issued', 'Order Placed', 'GRN Pending', 'GRN Completed', 'In Transit', 'Closed - Completed'].includes(pr.status)
    ).slice(0, 5);

    const handleAction = async () => {
        if (!selectedPR || !action) return;
        setProcessing(true);
        await new Promise(r => setTimeout(r, 600));
        if (action === 'approve') {
            updatePRStatus(selectedPR.id, nextStatus, `${role} approved. ${remarks}`, {
                smdApproved: role === 'SMD' ? true : selectedPR.smdApproved,
            });
            setDone(`✓ ${selectedPR.id} approved and forwarded to ${role === 'SMD' ? 'Finance' : 'PO Issuance'}`);
        } else {
            updatePRStatus(selectedPR.id, 'Rejected - Action Required', `Rejected by ${role}. Reason: ${remarks}`);
            setDone(`✗ ${selectedPR.id} rejected and returned for action`);
        }
        setSelectedPR(null);
        setRemarks('');
        setAction(null);
        setProcessing(false);
        setTimeout(() => setDone(null), 4000);
    };

    const priorityColor = (p: string) =>
        p === 'Emergency' ? 'bg-rose-100 text-rose-700 border-rose-200' :
            p === 'High' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                p === 'Medium' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                    'bg-slate-100 text-slate-600 border-slate-200';

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                    {role === 'SMD'
                        ? <><CheckCircle className="w-8 h-8 text-purple-600" /> SMD Approval Queue</>
                        : <><FileText className="w-8 h-8 text-blue-600" /> Finance Clearance Queue</>
                    }
                </h1>
                <p className="text-slate-500 mt-1 text-sm font-medium">
                    {role === 'SMD'
                        ? 'Executive sign-off required for high-value procurement decisions'
                        : 'Financial authorization and PO generation for approved requisitions'}
                </p>
            </div>

            {/* Success toast */}
            {done && (
                <div className={`flex items-center gap-3 px-5 py-4 rounded-xl font-bold text-sm animate-in slide-in-from-top-2 ${done.startsWith('✓') ? 'bg-emerald-50 border border-emerald-100 text-emerald-700' : 'bg-rose-50 border border-rose-100 text-rose-700'}`}>
                    {done.startsWith('✓') ? <CheckCircle className="w-5 h-5 shrink-0" /> : <XCircle className="w-5 h-5 shrink-0" />}
                    {done}
                </div>
            )}

            {/* KPI row */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: 'Awaiting My Action', val: queue.length, color: 'text-amber-600', bg: 'bg-amber-50', icon: Clock },
                    { label: 'High Priority', val: urgent.length, color: 'text-rose-600', bg: 'bg-rose-50', icon: AlertTriangle },
                    { label: 'Processed (Total)', val: alreadyActed.length, color: 'text-emerald-600', bg: 'bg-emerald-50', icon: BarChart3 },
                ].map((c, i) => (
                    <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 flex items-center gap-4 shadow-sm">
                        <div className={`p-3 rounded-xl ${c.bg} ${c.color} shrink-0`}><c.icon className="w-5 h-5" /></div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{c.label}</p>
                            <p className={`text-2xl font-black ${c.color}`}>{c.val}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main queue */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
                <div className="p-5 border-b border-slate-50">
                    <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest">
                        {queue.length} PR{queue.length !== 1 ? 's' : ''} Pending {role === 'SMD' ? 'Executive Approval' : 'Finance Clearance'}
                    </h2>
                </div>

                {queue.length === 0 ? (
                    <div className="p-16 text-center">
                        <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="w-8 h-8 text-emerald-500" />
                        </div>
                        <p className="font-black text-slate-800 text-lg uppercase">Queue Clear</p>
                        <p className="text-slate-400 text-sm mt-1">No pending approvals at this time.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-50">
                        {queue.map(pr => (
                            <div key={pr.id} className={`p-5 hover:bg-blue-50/20 transition-all group ${pr.priority === 'Emergency' ? 'border-l-4 border-rose-400' : pr.priority === 'High' ? 'border-l-4 border-amber-400' : ''}`}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4 flex-1">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono font-black text-blue-700">{pr.id}</span>
                                                <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${priorityColor(pr.priority)}`}>{pr.priority}</span>
                                            </div>
                                            <p className="text-xs text-slate-500 font-medium mt-0.5">{pr.itemName || pr.category} · Qty: {pr.quantity}</p>
                                        </div>
                                        <div className="hidden md:block text-xs text-slate-500">
                                            <div className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {pr.branch} — {pr.department}</div>
                                            <div className="mt-0.5 text-slate-400">by {pr.requester}</div>
                                        </div>
                                        {pr.price && (
                                            <div className="hidden lg:block">
                                                <p className="text-[10px] text-slate-400 uppercase font-bold">Value</p>
                                                <p className="text-sm font-black text-slate-800">AED {pr.price.toLocaleString('en-AE')}</p>
                                            </div>
                                        )}
                                        <div className="ml-auto mr-4">
                                            <SLATimer deadline={pr.slaDeadline} />
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setSelectedPR(pr)}
                                        className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-slate-800 transition-all shrink-0"
                                    >
                                        Review <ArrowRight className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Recently processed */}
            {alreadyActed.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-slate-50">
                        <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">Recently Processed</h2>
                    </div>
                    <div className="divide-y divide-slate-50">
                        {alreadyActed.map(pr => (
                            <div key={pr.id} className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                                    <div>
                                        <span className="font-mono font-bold text-slate-700 text-sm">{pr.id}</span>
                                        <p className="text-[10px] text-slate-400 mt-0.5">{pr.department} · {pr.branch}</p>
                                    </div>
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-lg">{pr.status.replace('Pending - ', '')}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Action Modal */}
            {selectedPR && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 animate-in zoom-in-95 duration-200">
                        <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-1">{selectedPR.id}</h2>
                        <p className="text-xs text-slate-400 font-bold mb-6">{selectedPR.itemName || selectedPR.category} · {selectedPR.department} · {selectedPR.branch} · Qty {selectedPR.quantity}</p>

                        {/* PR details */}
                        <div className="grid grid-cols-2 gap-3 mb-6">
                            {[
                                { label: 'Priority', val: selectedPR.priority },
                                { label: 'Requester', val: selectedPR.requester },
                                { label: 'Amount', val: selectedPR.price ? `AED ${selectedPR.price.toLocaleString('en-AE')}` : 'TBD' },
                                { label: 'Vendor', val: selectedPR.vendor || 'Not assigned' },
                            ].map((r, i) => (
                                <div key={i} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{r.label}</p>
                                    <p className="text-sm font-bold text-slate-800 mt-0.5">{r.val}</p>
                                </div>
                            ))}
                        </div>

                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                            {action === 'reject' ? 'Rejection Reason (required)' : 'Remarks (optional)'}
                        </label>
                        <textarea
                            value={remarks}
                            onChange={e => setRemarks(e.target.value)}
                            rows={3}
                            placeholder={action === 'reject' ? 'Specify reason for rejection…' : 'Add any notes for the next stage…'}
                            className="w-full border border-slate-200 rounded-xl p-3 text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 resize-none mb-6"
                        />

                        <div className="flex gap-3">
                            <button onClick={() => { setSelectedPR(null); setAction(null); setRemarks(''); }} className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 text-xs font-black uppercase tracking-widest transition-all">Cancel</button>
                            <button
                                onClick={() => { setAction('reject'); setTimeout(handleAction, 50); }}
                                disabled={processing}
                                className="flex-1 py-3 rounded-xl bg-rose-600 text-white hover:bg-rose-700 text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-rose-200 flex items-center justify-center gap-2 disabled:opacity-60"
                            >
                                <XCircle className="w-4 h-4" /> Reject
                            </button>
                            <button
                                onClick={() => { setAction('approve'); setTimeout(handleAction, 50); }}
                                disabled={processing || (action === 'reject' && !remarks.trim())}
                                className="flex-1 py-3 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-emerald-200 flex items-center justify-center gap-2 disabled:opacity-60"
                            >
                                {processing ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                                Approve
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
