import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { PurchaseRequest, Role, PRStatus, Tab, PRHistory, Priority } from '../types';

interface ProcurementContextType {
  role: Role;
  setRole: (role: Role) => void;
  branch: string;
  setBranch: (branch: string) => void;
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  prs: PurchaseRequest[];
  addPR: (pr: any) => void;
  updatePRStatus: (id: string, newStatus: PRStatus, notes?: string, extraData?: Partial<PurchaseRequest>) => void;
  extendTAT: (id: string, additionalHours: number, reason: string, revisedDate?: number) => void;
  getDeptBudget: (dept: string) => { approved: number, consumed: number };
}

const now = Date.now();
const hour = 3600000;
const day = 24 * hour;

const initialState: PurchaseRequest[] = [
  {
    id: 'PR-2025-001', branch: 'Bur Dubai', department: 'Cardiology', category: 'Surgical Instruments', quantity: 50, requester: 'Dr. Ahmed', priority: 'Normal',
    status: 'Pending - Centre In-Charge', createdAt: now - (36 * hour), slaDeadline: now - (12 * hour), smdApproved: false,
    history: [{ id: 'h1', stage: 'Initiation', action: 'Raised PR', timestamp: now - (36 * hour), userRole: 'Sub Store Keeper' }]
  },
  {
    id: 'PR-2025-002', branch: 'Al Quoz', department: 'Emergency', category: 'Life Support Consumables', quantity: 200, requester: 'Nurse Fatima', priority: 'Emergency',
    status: 'Pending - Centre In-Charge', createdAt: now - (2 * hour), slaDeadline: now - (1 * hour), smdApproved: false,
    history: [{ id: 'h2', stage: 'Initiation', action: 'Raised PR', timestamp: now - (2 * hour), userRole: 'Sub Store Keeper' }]
  },
  {
    id: 'PR-2025-003', branch: 'Bur Dubai', department: 'Pharmacy', category: 'Medications', quantity: 500, requester: 'Pharm. Ali', priority: 'High',
    status: 'Pending - Central Store', createdAt: now - (24 * hour), slaDeadline: now + (12 * hour), smdApproved: false,
    history: [
      { id: 'h3', stage: 'Initiation', action: 'Raised PR', timestamp: now - (24 * hour), userRole: 'Sub Store Keeper' },
      { id: 'h4', stage: 'Centre Approval', action: 'Approved', timestamp: now - (20 * hour), userRole: 'Centre In-Charge' }
    ]
  },
  {
    id: 'PR-2025-020', branch: 'Bur Dubai', department: 'ICU', category: 'Consumables', quantity: 150, requester: 'Dr. John', priority: 'High',
    status: 'Dispatch Scheduled', createdAt: now - (48 * hour), slaDeadline: now + (2 * hour), smdApproved: false,
    expectedDeliveryDate: now + (24 * hour),
    history: [
      { id: 'h20', stage: 'Central Store', action: 'Scheduled for Dispatch', timestamp: now - hour, userRole: 'Central Store', notes: 'Transport pending' }
    ]
  },
  {
    id: 'PR-2025-004', branch: 'Al Quoz', department: 'Laboratory', category: 'Consumables', quantity: 1000, requester: 'Tech Sarah', priority: 'Medium',
    status: 'Pending - Procurement', createdAt: now - (48 * hour), slaDeadline: now + (24 * hour), smdApproved: false,
    history: [
      { id: 'h5', stage: 'Initiation', action: 'Raised PR', timestamp: now - (48 * hour), userRole: 'Sub Store Keeper' },
      { id: 'h6', stage: 'Centre Approval', action: 'Approved', timestamp: now - (40 * hour), userRole: 'Centre In-Charge' },
      { id: 'h7', stage: 'Central Store', action: 'Forwarded to Procurement', timestamp: now - (24 * hour), userRole: 'Central Store', notes: 'Stock Unavailable globally' }
    ]
  },
  {
    id: 'PR-2025-005', branch: 'Bur Dubai', department: 'ICU', category: 'Equipment', quantity: 2, requester: 'Dr. Hassan', priority: 'Emergency',
    status: 'Pending - SMD', createdAt: now - (72 * hour), slaDeadline: now + (2 * hour), smdApproved: false,
    smdActionDeadline: now - (68 * hour), // Breached
    history: [
      { id: 'h8', stage: 'Initiation', action: 'Raised PR', timestamp: now - (72 * hour), userRole: 'Sub Store Keeper' },
      { id: 'h9', stage: 'Centre Approval', action: 'Approved', timestamp: now - (70 * hour), userRole: 'Centre In-Charge' },
      { id: 'h10', stage: 'Procurement', action: 'Sourced & Forwarded', timestamp: now - (69 * hour), userRole: 'Procurement Officer', notes: 'Vendor: MedSupply Co.' }
    ]
  },
  {
    id: 'PR-2025-006', branch: 'Al Quoz', department: 'Radiology', category: 'MRI Contrast Agent', quantity: 100, requester: 'Dr. Smith', priority: 'High',
    status: 'Pending - Finance', createdAt: now - (96 * hour), slaDeadline: now + (8 * hour), smdApproved: true,
    isLocked: true,
    history: [
      { id: 'h11', stage: 'Initiation', action: 'Raised PR', timestamp: now - (96 * hour), userRole: 'Sub Store Keeper' },
      { id: 'h12', stage: 'SMD Approval', action: 'Approved', timestamp: now - (24 * hour), userRole: 'SMD' }
    ]
  },
  {
    id: 'PR-2025-009', branch: 'Bur Dubai', department: 'Pediatrics', category: 'Consumables', quantity: 150, requester: 'Dr. Nora', priority: 'Normal',
    status: 'PO Issued', createdAt: now - (10 * hour), slaDeadline: now + (38 * hour), smdApproved: true,
    history: [{ id: 'h18', stage: 'Finance', action: 'Approved', timestamp: now - (2 * hour), userRole: 'Finance' }]
  },
  {
    id: 'PR-2025-010', branch: 'Al Quoz', department: 'Orthopedics', category: 'Implants', quantity: 10, requester: 'Dr. Zayed', priority: 'Emergency',
    status: 'In Transit', createdAt: now - (5 * hour), slaDeadline: now + (19 * hour), smdApproved: true,
    dispatchDate: now - hour, expectedDeliveryDate: now + (2 * hour),
    history: [{ id: 'h19', stage: 'Central Store', action: 'Dispatched', timestamp: now - hour, userRole: 'Central Store' }]
  }
];

const deptBudgets: Record<string, { approved: number, consumed: number }> = {
  'Cardiology': { approved: 250000, consumed: 120000 },
  'Emergency': { approved: 500000, consumed: 410000 },
  'Pharmacy': { approved: 1000000, consumed: 600000 },
  'Laboratory': { approved: 300000, consumed: 150000 },
  'ICU': { approved: 450000, consumed: 380000 },
  'Radiology': { approved: 200000, consumed: 180000 },
  'Pediatrics': { approved: 150000, consumed: 50000 },
  'Orthopedics': { approved: 250000, consumed: 210000 },
  'OPD': { approved: 100000, consumed: 85000 },
  'ENT': { approved: 80000, consumed: 40000 }
};

const ProcurementContext = createContext<ProcurementContextType | undefined>(undefined);

export const ProcurementProvider = ({ children }: { children: ReactNode }) => {
  const [role, setRole] = useState<Role>(() => {
    const saved = localStorage.getItem('procurement_role');
    return (saved as Role) || 'Sub Store Keeper';
  });
  const [branch, setBranch] = useState<string>(() => {
    const saved = localStorage.getItem('procurement_branch');
    return saved || 'Bur Dubai';
  });
  const [activeTab, setActiveTab] = useState<Tab>('Dashboard');
  const [prs, setPrs] = useState<PurchaseRequest[]>(() => {
    const saved = localStorage.getItem('procurement_prs');
    return saved ? JSON.parse(saved) : initialState;
  });

  useEffect(() => {
    localStorage.setItem('procurement_prs', JSON.stringify(prs));
  }, [prs]);

  useEffect(() => {
    localStorage.setItem('procurement_role', role);
  }, [role]);

  useEffect(() => {
    localStorage.setItem('procurement_branch', branch);
  }, [branch]);

  useEffect(() => {
    const checkEscalations = () => {
      prs.forEach(pr => {
        // SMD Role Specific Escalations
        if (pr.status === 'Pending - SMD' && pr.smdActionDeadline && Date.now() > pr.smdActionDeadline) {
          console.warn(`SMD SLA BREACH: ${pr.id} (${pr.priority}). Immediate Alert triggered!`);
        }

        // Finance Role Specific Escalations (1 Day TAT)
        if (pr.status === 'Pending - Finance' && pr.financeActionDeadline && Date.now() > pr.financeActionDeadline) {
          console.warn(`FINANCE SLA BREACH: ${pr.id}. Escalation alert sent to SMD.`);
        }

        // General TAT Escalations
        if ((pr.status === 'Pending - Centre In-Charge' && (Date.now() - pr.createdAt > day)) ||
          (Date.now() > pr.slaDeadline && pr.status !== 'Closed - Completed' && !pr.status.includes('Rejected'))) {
          console.warn(`SYSTEM ALERT: ${pr.id} TAT/SLA breach detected.`);
        }
      });
    };
    const timer = setInterval(checkEscalations, 60000);
    checkEscalations();
    return () => clearInterval(timer);
  }, [prs]);

  const calculateSLA = (priority: Priority) => {
    const map = {
      'Emergency': 2 * day,
      'High': 4 * day,
      'Medium': 7 * day,
      'Normal': 10 * day
    };
    return Date.now() + map[priority];
  };

  const calculateSmdDeadline = (priority: Priority) => {
    const map = {
      'Emergency': 4 * hour,
      'High': 1 * day,
      'Medium': 2 * day,
      'Normal': 3 * day
    };
    return Date.now() + map[priority];
  };

  const getDeptBudget = (dept: string) => deptBudgets[dept] || { approved: 0, consumed: 0 };

  const addPR = (prData: any) => {
    const newPR: PurchaseRequest = {
      ...prData,
      id: `PR-${new Date().getFullYear()}-${String(prs.length + 1).padStart(3, '0')}`,
      createdAt: Date.now(),
      slaDeadline: calculateSLA(prData.priority || 'Normal'),
      smdApproved: false,
      isLocked: false,
      history: [{
        id: Math.random().toString(36).substr(2, 9),
        stage: 'Initiation',
        action: prData.status === 'Closed - Completed' ? 'Issued' : 'Raised PR',
        timestamp: Date.now(),
        userRole: role,
        notes: prData.notes || 'Requirement entered into system.'
      }]
    };
    setPrs([newPR, ...prs]);
    setActiveTab('Dashboard');
  };

  const updatePRStatus = (id: string, newStatus: PRStatus, notes?: string, extraData?: Partial<PurchaseRequest>) => {
    setPrs(currentPrs => currentPrs.map(pr => {
      if (pr.id === id) {
        if (pr.isAuditLocked) return pr;

        const stage = newStatus.split(' - ')[0] || newStatus;
        let action = newStatus.includes('Rejected')
          ? 'Rejected'
          : (newStatus.includes('Pending') && pr.status.includes('Rejected'))
            ? 'Re-submitted'
            : newStatus === 'Dispatched'
              ? 'Consumables Dispatched'
              : newStatus === 'Dispatch Scheduled'
                ? 'Scheduled for Dispatch'
                : newStatus === 'Closed - Completed'
                  ? 'Workflow Finalized'
                  : 'Approved/Forwarded';

        let newSlaDeadline = pr.slaDeadline;
        let newSmdActionDeadline = pr.smdActionDeadline;
        let newFinanceActionDeadline = pr.financeActionDeadline;

        if (extraData?.priority && extraData.priority !== pr.priority) {
          newSlaDeadline = calculateSLA(extraData.priority);
          action = `Priority Updated to ${extraData.priority}`;
        }

        if (newStatus === 'Pending - SMD') {
          newSmdActionDeadline = calculateSmdDeadline(extraData?.priority || pr.priority);
        }

        if (newStatus === 'Pending - Finance') {
          newFinanceActionDeadline = Date.now() + day; // 1 Day TAT
        }

        const newHistoryItem: PRHistory = {
          id: Math.random().toString(36).substr(2, 9),
          stage,
          action,
          timestamp: Date.now(),
          userRole: role,
          notes,
          rejectionReason: (extraData as any)?.rejectionReason
        };

        if (newStatus === 'Closed - Completed') {
          console.log(`WORKFLOW CLOSURE: Notifications sent to SMD, Finance, Procurement, and Department.`);
        }

        if (extraData?.receivedQuantity !== undefined && extraData.receivedQuantity < pr.quantity) {
          console.error(`GRN DISCREPANCY: PR ${pr.id} shortfall detected. Alerts triggered for Procurement.`);
        }

        return {
          ...pr,
          status: newStatus,
          history: [...pr.history, newHistoryItem],
          smdApproved: role === 'SMD' && (newStatus === 'Pending - Finance' || newStatus === 'PO Issued') ? true : pr.smdApproved,
          isLocked: role === 'SMD' && (newStatus === 'Pending - Finance' || newStatus === 'PO Issued') ? true : pr.isLocked,
          isAuditLocked: newStatus === 'Closed - Completed' ? true : pr.isAuditLocked,
          isReserved: newStatus === 'Dispatched' || newStatus === 'In Transit' ? true : pr.isReserved,
          slaDeadline: newSlaDeadline,
          smdActionDeadline: newSmdActionDeadline,
          financeActionDeadline: newFinanceActionDeadline,
          smdActionTimestamp: role === 'SMD' ? Date.now() : pr.smdActionTimestamp,
          ...extraData
        };
      }
      return pr;
    }));
  };

  const extendTAT = (id: string, additionalHours: number, reason: string, revisedDate?: number) => {
    setPrs(currentPrs => currentPrs.map(pr => {
      if (pr.id === id) {
        const newHistoryItem: PRHistory = {
          id: Math.random().toString(36).substr(2, 9),
          stage: 'TAT Extension',
          action: 'Extended SLA',
          timestamp: Date.now(),
          userRole: role,
          notes: `Extended by ${additionalHours}h. Reason: ${reason}`
        };

        return {
          ...pr,
          slaDeadline: revisedDate || pr.slaDeadline + (additionalHours * hour),
          history: [...pr.history, newHistoryItem],
          isTATExtended: true,
          revisedDeliveryDate: revisedDate
        };
      }
      return pr;
    }));
  };

  return (
    <ProcurementContext.Provider value={{ role, setRole, branch, setBranch, activeTab, setActiveTab, prs, addPR, updatePRStatus, extendTAT, getDeptBudget }}>
      {children}
    </ProcurementContext.Provider>
  );
};

export const useProcurement = () => {
  const context = useContext(ProcurementContext);
  if (!context) throw new Error('useProcurement must be used within a ProcurementProvider');
  return context;
};
