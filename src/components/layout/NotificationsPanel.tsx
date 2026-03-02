import { useState, useRef, useEffect } from 'react';
import { Bell, CheckCheck, AlertTriangle, Info, Package, Clock, X } from 'lucide-react';
import { useProcurement } from '../../context/ProcurementContext';

const now = Date.now();
const hour = 3600000;

const STATIC_NOTIFICATIONS = [
    { id: 'n1', type: 'alert', title: 'SLA Breach Detected', body: 'PR-2025-090 has exceeded its SLA deadline by 3 hours.', time: now - 10 * 60000, read: false },
    { id: 'n2', type: 'info', title: 'PR Approved by SMD', body: 'PR-2025-099 was approved by John Doe (SMD) and forwarded to Finance.', time: now - 35 * 60000, read: false },
    { id: 'n3', type: 'success', title: 'GRN Completed', body: 'PR-2025-088 — Goods received and stock updated by Sub Store Keeper.', time: now - 1.5 * hour, read: true },
    { id: 'n4', type: 'alert', title: 'Auth Failure Logged', body: 'Failed login attempt detected for Session ID 882 from 172.16.4.21.', time: now - 2 * hour, read: true },
    { id: 'n5', type: 'info', title: 'Finance Clearance Issued', body: 'PR-2025-097 received finance approval. PO can now be issued.', time: now - 3 * hour, read: true },
    { id: 'n6', type: 'success', title: 'New User Provisioned', body: 'USR-010 (Maya Jamila) was granted Finance access by System Admin.', time: now - 5 * hour, read: true },
    { id: 'n7', type: 'info', title: 'Policy Updated', body: 'Procurement TAT Policy v2.3 has been applied system-wide.', time: now - 24 * hour, read: true },
];

const typeConfig = {
    alert: { icon: AlertTriangle, color: 'text-rose-500', bg: 'bg-rose-50', dot: 'bg-rose-500' },
    info: { icon: Info, color: 'text-blue-500', bg: 'bg-blue-50', dot: 'bg-blue-500' },
    success: { icon: Package, color: 'text-emerald-500', bg: 'bg-emerald-50', dot: 'bg-emerald-500' },
};

const formatTime = (ts: number) => {
    const diff = Math.floor((Date.now() - ts) / 60000);
    if (diff < 1) return 'just now';
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return `${Math.floor(diff / 1440)}d ago`;
};

interface Props { onClose: () => void; }

export const NotificationsPanel = ({ onClose }: Props) => {
    const { prs } = useProcurement();
    const ref = useRef<HTMLDivElement>(null);
    const [notifications, setNotifications] = useState(STATIC_NOTIFICATIONS);

    // Dynamically build live notifications from PR data
    const liveNotifs = prs
        .filter(pr => pr.slaDeadline < Date.now() && pr.status !== 'Closed - Completed')
        .slice(0, 3)
        .map(pr => ({
            id: `live-${pr.id}`,
            type: 'alert' as const,
            title: `SLA Overdue: ${pr.id}`,
            body: `${pr.category} for ${pr.department} — ${pr.priority} priority. Please take action.`,
            time: pr.slaDeadline,
            read: false,
        }));

    const allNotifs = [...liveNotifs, ...notifications];
    const unreadCount = allNotifs.filter(n => !n.read).length;

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) onClose();
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [onClose]);

    const markAllRead = () => setNotifications(n => n.map(x => ({ ...x, read: true })));
    const dismiss = (id: string) => setNotifications(n => n.filter(x => x.id !== id));

    return (
        <div
            ref={ref}
            className="absolute top-12 right-0 w-96 bg-white rounded-2xl shadow-2xl shadow-slate-200/80 border border-slate-100 z-50 animate-in slide-in-from-top-2 duration-200 overflow-hidden"
        >
            {/* Header */}
            <div className="p-4 border-b border-slate-50 flex items-center justify-between bg-white sticky top-0 z-10">
                <div>
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                        <Bell className="w-4 h-4 text-blue-600" /> Notifications
                        {unreadCount > 0 && (
                            <span className="text-[10px] bg-rose-500 text-white font-black px-1.5 py-0.5 rounded-full">{unreadCount}</span>
                        )}
                    </h3>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={markAllRead} className="text-[10px] font-black text-blue-600 hover:text-blue-800 flex items-center gap-1 uppercase tracking-widest">
                        <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                    </button>
                    <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full ml-1">
                        <X className="w-4 h-4 text-slate-400" />
                    </button>
                </div>
            </div>

            {/* Notification List */}
            <div className="max-h-[420px] overflow-y-auto divide-y divide-slate-50">
                {allNotifs.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-sm font-bold">No notifications</div>
                ) : allNotifs.map(n => {
                    const cfg = typeConfig[n.type as keyof typeof typeConfig] ?? typeConfig.info;
                    const Icon = cfg.icon;
                    return (
                        <div
                            key={n.id}
                            className={`flex gap-3 p-4 group transition-all cursor-default ${n.read ? 'bg-white hover:bg-slate-50' : 'bg-blue-50/30 hover:bg-blue-50/60'}`}
                        >
                            <div className={`p-2 rounded-xl ${cfg.bg} shrink-0 h-fit mt-0.5`}>
                                <Icon className={`w-4 h-4 ${cfg.color}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                    <p className={`text-xs font-black ${n.read ? 'text-slate-700' : 'text-slate-900'} leading-tight`}>{n.title}</p>
                                    {!n.read && <span className={`w-2 h-2 rounded-full ${cfg.dot} shrink-0 mt-1`}></span>}
                                </div>
                                <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">{n.body}</p>
                                <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mt-1.5 flex items-center gap-1">
                                    <Clock className="w-2.5 h-2.5" /> {formatTime(n.time)}
                                </p>
                            </div>
                            {!n.id.startsWith('live-') && (
                                <button
                                    onClick={() => dismiss(n.id)}
                                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-200 rounded-full shrink-0 h-fit transition-all"
                                >
                                    <X className="w-3 h-3 text-slate-400" />
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>

        </div>
    );
};
