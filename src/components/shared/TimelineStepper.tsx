import { PRStatus } from '../../types';
import { Check } from 'lucide-react';

const stages = [
  { id: 'init', label: 'PR Created', match: [] },
  { id: 'centre', label: 'Centre Review', match: ['Pending - Centre In-Charge'] },
  { id: 'store', label: 'Store Verification', match: ['Pending - Central Store'] },
  { id: 'proc', label: 'Sourcing & Quotation', match: ['Pending - Procurement'] },
  { id: 'approval', label: 'Mgmt Approval', match: ['Pending - SMD', 'Pending - Finance'] },
  { id: 'po', label: 'PO Issued', match: ['PO Issued'] },
  { id: 'dispatch', label: 'In Transit', match: ['Dispatch Scheduled', 'Dispatched', 'In Transit', 'Delivered'] },
  { id: 'closed', label: 'Delivered', match: ['Closed - Completed'] },
];

export const TimelineStepper = ({ currentStatus }: { currentStatus: PRStatus }) => {
  let currentIndex = stages.findIndex(s => s.match.includes(currentStatus));

  if (currentIndex === -1) {
    if (currentStatus === 'Closed - Completed') currentIndex = stages.length - 1;
    else if (currentStatus === 'PO Issued') currentIndex = 5;
    else currentIndex = 0;
  }

  return (
    <div className="w-full py-8">
      <div className="flex items-center justify-between relative px-2">
        <div className="absolute left-0 top-[14px] transform w-full h-1 bg-slate-100 rounded-full z-0"></div>
        <div
          className="absolute left-0 top-[14px] transform h-1 bg-blue-500 rounded-full z-0 transition-all duration-700 ease-in-out"
          style={{ width: `${(currentIndex / (stages.length - 1)) * 100}%` }}
        ></div>

        {stages.map((stage, index) => {
          const isCompleted = index < currentIndex || currentStatus === 'Closed - Completed';
          const isActive = index === currentIndex;

          return (
            <div key={stage.id} className="relative z-10 flex flex-col items-center group">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${isCompleted
                ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-100'
                : isActive
                  ? 'bg-white border-blue-600 text-blue-600 shadow-[0_0_0_4px_rgba(37,99,235,0.15)] scale-110'
                  : 'bg-white border-slate-200 text-slate-300'
                }`}>
                {isCompleted ? <Check className="w-3.5 h-3.5" /> : <span className="text-[10px] font-black">{index + 1}</span>}
              </div>
              <div className="absolute -bottom-8 flex flex-col items-center min-w-[80px]">
                <span className={`text-[9px] font-black uppercase tracking-tighter text-center leading-tight transition-colors duration-300 ${isActive ? 'text-blue-700' : isCompleted ? 'text-slate-800' : 'text-slate-300'
                  }`}>
                  {stage.label}
                </span>
                {isActive && (
                  <span className="text-[8px] font-bold text-blue-400 uppercase tracking-widest mt-0.5 animate-pulse">ACTIVE</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
