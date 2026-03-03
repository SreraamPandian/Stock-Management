import { useState } from 'react';
import { Package, Search, ExternalLink, Box } from 'lucide-react';
import { StockDetailModal } from './StockDetailModal';
import { useProcurement } from '../../context/ProcurementContext';

const mockInventory = [
  { id: 'ITM-001', name: 'Surgical Masks (Box of 50)', category: 'Consumables', burDubai: 1200, alQuoz: 850, central: 5000, status: 'In Stock' },
  { id: 'ITM-002', name: 'MRI Contrast Agent 10ml', category: 'Medications', burDubai: 15, alQuoz: 5, central: 100, status: 'Low Stock' },
  { id: 'ITM-003', name: 'Nitrile Gloves (Large)', category: 'Consumables', burDubai: 400, alQuoz: 300, central: 2000, status: 'In Stock' },
  { id: 'ITM-004', name: 'Defibrillator Pads', category: 'Equipment', burDubai: 2, alQuoz: 0, central: 10, status: 'Critical' },
  { id: 'ITM-005', name: 'Syringes 5ml', category: 'Consumables', burDubai: 3500, alQuoz: 2100, central: 10000, status: 'In Stock' },
  { id: 'ITM-006', name: 'Hand Sanitizer 500ml', category: 'Consumables', burDubai: 450, alQuoz: 320, central: 1500, status: 'In Stock' },
  { id: 'ITM-007', name: 'Adhesive Bandages (Assorted)', category: 'Consumables', burDubai: 800, alQuoz: 600, central: 3000, status: 'In Stock' },
  { id: 'ITM-008', name: 'Digital Thermometer', category: 'Equipment', burDubai: 10, alQuoz: 8, central: 50, status: 'In Stock' },
  { id: 'ITM-009', name: 'Blood Pressure Monitor', category: 'Equipment', burDubai: 5, alQuoz: 3, central: 25, status: 'In Stock' },
  { id: 'ITM-010', name: 'Stethoscope (Littmann)', category: 'Equipment', burDubai: 3, alQuoz: 2, central: 15, status: 'Low Stock' },
  { id: 'ITM-011', name: 'Antiseptic Solution 1L', category: 'Consumables', burDubai: 120, alQuoz: 90, central: 400, status: 'In Stock' },
  { id: 'ITM-012', name: 'Gauze Swabs (10x10)', category: 'Consumables', burDubai: 2000, alQuoz: 1500, central: 8000, status: 'In Stock' },
  { id: 'ITM-013', name: 'Face Shields (Medical)', category: 'Consumables', burDubai: 300, alQuoz: 250, central: 1000, status: 'In Stock' },
  { id: 'ITM-014', name: 'Infrared Lamp', category: 'Equipment', burDubai: 2, alQuoz: 1, central: 6, status: 'In Stock' },
];

export const StockView = () => {
  const { role, branch } = useProcurement();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [selectedItem, setSelectedItem] = useState<typeof mockInventory[0] | null>(null);

  const isGlobal = ['Super Admin', 'Central Store', 'Procurement Officer', 'SMD', 'Finance'].includes(role);

  const filteredInventory = mockInventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.id.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;

    // For branch roles, only show items that have >0 stock in their branch (or just show all but hide other branch columns)
    const matchesLocation = isGlobal ||
      (branch === 'Bur Dubai' ? item.burDubai >= 0 : item.alQuoz >= 0);

    return matchesSearch && matchesCategory && matchesLocation;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {selectedItem && (
        <StockDetailModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )}

      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <Package className="w-8 h-8 text-blue-600" />
            Global Inventory
          </h1>
          <p className="text-slate-500 mt-1 font-medium">Real-time stock visibility across all centers and the central hub</p>
        </div>
        <div className="flex gap-3">
          <div className="relative group">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-blue-500" />
            <input
              type="text"
              placeholder="Filter by ID or Name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2.5 border border-slate-200 bg-white rounded-xl text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none w-64 shadow-sm transition-all"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl hover:bg-slate-50 transition-all font-semibold text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none shadow-sm cursor-pointer"
          >
            <option value="All">All Categories</option>
            <option value="Consumables">Consumables</option>
            <option value="Medications">Medications</option>
            <option value="Equipment">Equipment</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden transform transition-all">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-[10px] uppercase font-black tracking-widest text-slate-400">
                <th className="p-5">Material Description</th>
                <th className="p-5">Category</th>
                {(isGlobal || branch === 'Bur Dubai') && <th className="p-5 text-center bg-blue-50/30">Bur Dubai Hub</th>}
                {(isGlobal || branch === 'Al Quoz') && <th className="p-5 text-center bg-blue-50/30">Al Quoz Hub</th>}
                {isGlobal && <th className="p-5 text-center bg-emerald-50/30">Central Reserve</th>}
                <th className="p-5 text-right">Inventory Health</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredInventory.map(item => (
                <tr
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className="hover:bg-blue-50/30 transition-all cursor-pointer group"
                >
                  <td className="p-5">
                    <div className="flex items-center gap-4">
                      <div className="p-2.5 bg-white border border-slate-100 rounded-xl text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                        <Package className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 group-hover:text-blue-700 transition-colors uppercase text-sm">{item.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-slate-400 font-mono tracking-tighter bg-slate-100 px-1.5 py-0.5 rounded">{item.id}</span>
                          <span className="text-[10px] text-blue-500 font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                            <ExternalLink className="w-3 h-3" /> CLICK TO VIEW DETAILS
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-5">
                    <span className="text-[11px] font-bold text-slate-500 uppercase bg-slate-100/50 px-2 py-1 rounded-md">{item.category}</span>
                  </td>
                  {(isGlobal || branch === 'Bur Dubai') && <td className="p-5 text-center font-black text-slate-700 bg-blue-50/10">{item.burDubai}</td>}
                  {(isGlobal || branch === 'Al Quoz') && <td className="p-5 text-center font-black text-slate-700 bg-blue-50/10">{item.alQuoz}</td>}
                  {isGlobal && <td className="p-5 text-center font-black text-emerald-600 bg-emerald-50/10">{item.central}</td>}
                  <td className="p-5 text-right">
                    <span className={`inline-flex items-center px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-sm ${item.status === 'In Stock' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                      item.status === 'Low Stock' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        'bg-rose-50 text-rose-700 border border-rose-100'
                      }`}>
                      <span className={`w-1.5 h-1.5 rounded-full mr-2 ${item.status === 'In Stock' ? 'bg-emerald-500' : item.status === 'Low Stock' ? 'bg-amber-500' : 'bg-rose-500'}`}></span>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredInventory.length === 0 && (
          <div className="p-20 text-center bg-slate-50/50">
            <Box className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <p className="font-bold text-slate-400">NO ITEMS FOUND MATCHING YOUR SEARCH</p>
          </div>
        )}
      </div>
    </div>
  );
};
