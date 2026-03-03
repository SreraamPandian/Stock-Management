import { X, Package, History, TrendingUp, AlertCircle } from 'lucide-react';

interface StockItem {
    id: string;
    name: string;
    category: string;
    burDubai: number;
    alQuoz: number;
    central: number;
    status: string;
}

interface Props {
    item: StockItem;
    onClose: () => void;
}

export const StockDetailModal = ({ item, onClose }: Props) => {
    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                            <Package className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">{item.name}</h2>
                            <p className="text-sm text-slate-500 font-mono">{item.id} • {item.category}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto space-y-8">
                    {/* Stock Distribution */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                            <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">Bur Dubai (Sub)</p>
                            <p className="text-2xl font-black text-slate-800">{item.burDubai}</p>
                            <p className="text-[10px] text-blue-500 mt-1">Last Issued: 2h ago</p>
                        </div>
                        <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                            <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">Al Quoz (Sub)</p>
                            <p className="text-2xl font-black text-slate-800">{item.alQuoz}</p>
                            <p className="text-[10px] text-blue-500 mt-1">Last Issued: 5h ago</p>
                        </div>
                        <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
                            <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">Central Store</p>
                            <p className="text-2xl font-black text-slate-800">{item.central}</p>
                            <p className="text-[10px] text-emerald-500 mt-1">Next Delivery: Friday</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        {/* Quick Stats */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-emerald-500" /> Usage Analysis
                            </h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500">Monthly Avg Consumption</span>
                                    <span className="font-semibold">450 Units</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500">Peak Demand Dept.</span>
                                    <span className="font-semibold text-blue-600">ICU</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500">Reorder Level</span>
                                    <span className="font-semibold text-amber-600">500 Units</span>
                                </div>
                            </div>
                        </div>

                        {/* Compliance & Alerts */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 text-amber-500" /> Compliance Info
                            </h3>
                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-2">
                                <div className="flex justify-between text-xs">
                                    <span className="text-slate-500">SLA Group</span>
                                    <span className="font-medium">Class A (Critical)</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-slate-500">Audit Status</span>
                                    <span className="text-emerald-600 font-bold">Verified</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Movement History */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                            <History className="w-4 h-4 text-slate-400" /> Recent Inventory Movement
                        </h3>
                        <div className="border border-slate-100 rounded-xl overflow-hidden">
                            <table className="w-full text-left text-xs bg-white">
                                <thead className="bg-slate-50 uppercase text-slate-500 font-bold border-b border-slate-100">
                                    <tr>
                                        <th className="p-3">Action</th>
                                        <th className="p-3">Source/Dest</th>
                                        <th className="p-3">Qty</th>
                                        <th className="p-3">Ref ID</th>
                                        <th className="p-3">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    <tr>
                                        <td className="p-3 text-rose-600 font-medium font-bold">- Issue</td>
                                        <td className="p-3">Bur Dubai → ICU</td>
                                        <td className="p-3 font-semibold">12</td>
                                        <td className="p-3 text-blue-600 font-mono">PR-0982</td>
                                        <td className="p-3 text-slate-400">Mar 02, 10:24 AM</td>
                                    </tr>
                                    <tr>
                                        <td className="p-3 text-emerald-600 font-medium font-bold">+ Receipt</td>
                                        <td className="p-3">Vendor → Central</td>
                                        <td className="p-3 font-semibold">1000</td>
                                        <td className="p-3 text-blue-600 font-mono">PO-5521</td>
                                        <td className="p-3 text-slate-400">Feb 28, 02:45 PM</td>
                                    </tr>
                                    <tr>
                                        <td className="p-3 text-blue-600 font-medium font-bold">~ Transfer</td>
                                        <td className="p-3">Central → Al Quoz</td>
                                        <td className="p-3 font-semibold">150</td>
                                        <td className="p-3 text-blue-600 font-mono">TR-2291</td>
                                        <td className="p-3 text-slate-400">Feb 25, 09:12 AM</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end">
                    <button onClick={onClose} className="px-6 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 font-medium transition-colors text-sm">
                        Close Detail
                    </button>
                </div>
            </div>
        </div>
    );
};
