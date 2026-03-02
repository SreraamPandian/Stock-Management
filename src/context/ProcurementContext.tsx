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
  // ── BUR DUBAI PRs ──────────────────────────────
  {
    id: 'PR-2025-001', branch: 'Bur Dubai', department: 'Cardiology', category: 'Surgical Instruments',
    itemName: 'Scalpel Set #10', quantity: 50, requester: 'Dr. Ahmed', priority: 'Normal',
    status: 'Pending - Centre In-Charge', createdAt: now - (36 * hour), slaDeadline: now - (12 * hour), smdApproved: false,
    history: [{ id: 'h1', stage: 'Initiation', action: 'Raised PR', timestamp: now - (36 * hour), userRole: 'Sub Store Keeper' }]
  },
  {
    id: 'PR-2025-003', branch: 'Bur Dubai', department: 'Pharmacy', category: 'Medications',
    itemName: 'Paracetamol 500mg x500', quantity: 500, requester: 'Pharm. Ali', priority: 'High',
    status: 'Pending - Central Store', createdAt: now - (24 * hour), slaDeadline: now + (12 * hour), smdApproved: false,
    history: [
      { id: 'h3', stage: 'Initiation', action: 'Raised PR', timestamp: now - (24 * hour), userRole: 'Sub Store Keeper' },
      { id: 'h4', stage: 'Centre Approval', action: 'Approved & Forwarded', timestamp: now - (20 * hour), userRole: 'Centre In-Charge' }
    ]
  },
  {
    id: 'PR-2025-005', branch: 'Bur Dubai', department: 'ICU', category: 'Equipment',
    itemName: 'Ventilator Filter Set', quantity: 2, requester: 'Dr. Hassan', priority: 'Emergency',
    status: 'Pending - SMD', createdAt: now - (72 * hour), slaDeadline: now + (2 * hour), smdApproved: false,
    smdActionDeadline: now - (68 * hour),
    history: [
      { id: 'h8', stage: 'Initiation', action: 'Raised PR', timestamp: now - (72 * hour), userRole: 'Sub Store Keeper' },
      { id: 'h9', stage: 'Centre Approval', action: 'Approved', timestamp: now - (70 * hour), userRole: 'Centre In-Charge' },
      { id: 'h10', stage: 'Procurement', action: 'Sourced & Forwarded', timestamp: now - (69 * hour), userRole: 'Procurement Officer', notes: 'Vendor: MedSupply Co.' }
    ]
  },
  {
    id: 'PR-2025-009', branch: 'Bur Dubai', department: 'Pediatrics', category: 'Consumables',
    itemName: 'Pediatric Oxygen Mask', quantity: 150, requester: 'Dr. Nora', priority: 'Normal',
    status: 'PO Issued', createdAt: now - (10 * hour), slaDeadline: now + (38 * hour), smdApproved: true,
    vendor: 'MedLine Gulf', price: 4500.00, paymentMode: 'On Delivery',
    history: [
      { id: 'h18a', stage: 'Initiation', action: 'Raised PR', timestamp: now - (10 * hour), userRole: 'Sub Store Keeper' },
      { id: 'h18b', stage: 'Finance', action: 'Clearance Issued', timestamp: now - (2 * hour), userRole: 'Finance' }
    ]
  },
  {
    id: 'PR-2025-020', branch: 'Bur Dubai', department: 'ICU', category: 'Consumables',
    itemName: 'IV Cannula 18G x150', quantity: 150, requester: 'Dr. John', priority: 'High',
    status: 'Dispatch Scheduled', createdAt: now - (48 * hour), slaDeadline: now + (2 * hour), smdApproved: true,
    expectedDeliveryDate: now + (24 * hour),
    history: [
      { id: 'h20a', stage: 'Initiation', action: 'Raised PR', timestamp: now - (48 * hour), userRole: 'Sub Store Keeper' },
      { id: 'h20b', stage: 'Central Store', action: 'Scheduled for Dispatch', timestamp: now - hour, userRole: 'Central Store', notes: 'Transport vehicle assigned' }
    ]
  },
  {
    id: 'PR-2025-021', branch: 'Bur Dubai', department: 'OPD', category: 'Consumables',
    itemName: 'Disposable Gloves L x400', quantity: 400, requester: 'Nurse Hana', priority: 'Normal',
    status: 'Closed - Completed', createdAt: now - (7 * day), slaDeadline: now - (5 * day), smdApproved: true,
    vendor: 'SafeMed Supplies', price: 1200, paymentMode: '100% Advance', barcode: 'BC-2025-021',
    receivedQuantity: 400, condition: 'Good',
    history: [
      { id: 'h21a', stage: 'Initiation', action: 'Raised PR', timestamp: now - (7 * day), userRole: 'Sub Store Keeper' },
      { id: 'h21b', stage: 'GRN', action: 'Goods Received & Verified', timestamp: now - (5 * day), userRole: 'Sub Store Keeper' }
    ]
  },
  {
    id: 'PR-2025-022', branch: 'Bur Dubai', department: 'ENT', category: 'Equipment',
    itemName: 'Otoscope Set', quantity: 3, requester: 'Dr. Bilal', priority: 'Medium',
    status: 'Pending - Procurement', createdAt: now - (3 * day), slaDeadline: now + (2 * day), smdApproved: false,
    history: [
      { id: 'h22a', stage: 'Initiation', action: 'Raised PR', timestamp: now - (3 * day), userRole: 'Sub Store Keeper' },
      { id: 'h22b', stage: 'Centre Approval', action: 'Approved', timestamp: now - (2 * day), userRole: 'Centre In-Charge' },
      { id: 'h22c', stage: 'Central Store', action: 'Forwarded to Procurement', timestamp: now - day, userRole: 'Central Store' }
    ]
  },
  {
    id: 'PR-2025-023', branch: 'Bur Dubai', department: 'Cardiology', category: 'Medications',
    itemName: 'Aspirin 75mg x200', quantity: 200, requester: 'Dr. Ahmed', priority: 'Normal',
    status: 'Rejected - Action Required', createdAt: now - (5 * day), slaDeadline: now - (3 * day), smdApproved: false,
    history: [
      { id: 'h23a', stage: 'Initiation', action: 'Raised PR', timestamp: now - (5 * day), userRole: 'Sub Store Keeper' },
      { id: 'h23b', stage: 'Centre Approval', action: 'Rejected — Incomplete specification', timestamp: now - (4 * day), userRole: 'Centre In-Charge', rejectionReason: 'Item specification incomplete. Brand/generic not specified.' }
    ]
  },
  // ── AL QUOZ PRs ──────────────────────────────
  {
    id: 'PR-2025-002', branch: 'Al Quoz', department: 'Emergency', category: 'Life Support Consumables',
    itemName: 'Ambu Bag Adult', quantity: 200, requester: 'Nurse Fatima', priority: 'Emergency',
    status: 'Pending - Centre In-Charge', createdAt: now - (2 * hour), slaDeadline: now - (1 * hour), smdApproved: false,
    history: [{ id: 'h2', stage: 'Initiation', action: 'Raised PR', timestamp: now - (2 * hour), userRole: 'Sub Store Keeper' }]
  },
  {
    id: 'PR-2025-004', branch: 'Al Quoz', department: 'Laboratory', category: 'Consumables',
    itemName: 'Lab Test Strips x1000', quantity: 1000, requester: 'Tech Sarah', priority: 'Medium',
    status: 'Pending - Procurement', createdAt: now - (48 * hour), slaDeadline: now + (24 * hour), smdApproved: false,
    history: [
      { id: 'h5', stage: 'Initiation', action: 'Raised PR', timestamp: now - (48 * hour), userRole: 'Sub Store Keeper' },
      { id: 'h6', stage: 'Centre Approval', action: 'Approved', timestamp: now - (40 * hour), userRole: 'Centre In-Charge' },
      { id: 'h7', stage: 'Central Store', action: 'Forwarded to Procurement', timestamp: now - (24 * hour), userRole: 'Central Store', notes: 'Stock Unavailable globally' }
    ]
  },
  {
    id: 'PR-2025-006', branch: 'Al Quoz', department: 'Radiology', category: 'MRI Contrast Agent',
    itemName: 'Gadolinium 10ml Vials', quantity: 100, requester: 'Dr. Smith', priority: 'High',
    status: 'Pending - Finance', createdAt: now - (96 * hour), slaDeadline: now + (8 * hour), smdApproved: true,
    isLocked: true, vendor: 'MedChem Gulf', price: 28000,
    history: [
      { id: 'h11', stage: 'Initiation', action: 'Raised PR', timestamp: now - (96 * hour), userRole: 'Sub Store Keeper' },
      { id: 'h12', stage: 'SMD Approval', action: 'Approved', timestamp: now - (24 * hour), userRole: 'SMD' }
    ]
  },
  {
    id: 'PR-2025-010', branch: 'Al Quoz', department: 'Orthopedics', category: 'Implants',
    itemName: 'Titanium Bone Plate Set', quantity: 10, requester: 'Dr. Zayed', priority: 'Emergency',
    status: 'In Transit', createdAt: now - (5 * hour), slaDeadline: now + (19 * hour), smdApproved: true,
    dispatchDate: now - hour, expectedDeliveryDate: now + (2 * hour),
    vendor: 'OrthoProfix', price: 52000,
    history: [
      { id: 'h19', stage: 'Central Store', action: 'Dispatched to Al Quoz', timestamp: now - hour, userRole: 'Central Store' }
    ]
  },
  {
    id: 'PR-2025-024', branch: 'Al Quoz', department: 'Pharmacy', category: 'Medications',
    itemName: 'Metformin 500mg x500', quantity: 500, requester: 'Pharm. Riya', priority: 'Normal',
    status: 'Closed - Completed', createdAt: now - (10 * day), slaDeadline: now - (8 * day), smdApproved: true,
    vendor: 'PharmaDist UAE', price: 3400, barcode: 'BC-2025-024',
    receivedQuantity: 500, condition: 'Good',
    history: [
      { id: 'h24a', stage: 'Initiation', action: 'Raised PR', timestamp: now - (10 * day), userRole: 'Sub Store Keeper' },
      { id: 'h24b', stage: 'GRN', action: 'Goods Received & Verified', timestamp: now - (8 * day), userRole: 'Sub Store Keeper' }
    ]
  },
  {
    id: 'PR-2025-025', branch: 'Al Quoz', department: 'Emergency', category: 'Equipment',
    itemName: 'Defibrillator AED', quantity: 1, requester: 'Dr. Omar', priority: 'Emergency',
    status: 'Pending - SMD', createdAt: now - (4 * hour), slaDeadline: now + (4 * hour), smdApproved: false,
    smdActionDeadline: now + (3 * hour),
    history: [
      { id: 'h25a', stage: 'Initiation', action: 'Raised PR', timestamp: now - (4 * hour), userRole: 'Sub Store Keeper' },
      { id: 'h25b', stage: 'Centre Approval', action: 'Approved — Emergency', timestamp: now - (3 * hour), userRole: 'Centre In-Charge' },
      { id: 'h25c', stage: 'Procurement', action: 'Vendor Sourced: MedTech UAE', timestamp: now - (2 * hour), userRole: 'Procurement Officer' }
    ]
  },
  {
    id: 'PR-2025-026', branch: 'Al Quoz', department: 'Laboratory', category: 'Consumables',
    itemName: 'PCR Test Kits x200', quantity: 200, requester: 'Tech James', priority: 'High',
    status: 'Delivered', createdAt: now - (6 * day), slaDeadline: now - (4 * day), smdApproved: true,
    actualDeliveryDate: now - (4 * day), receivedQuantity: 198, condition: 'Good',
    history: [
      { id: 'h26a', stage: 'Initiation', action: 'Raised PR', timestamp: now - (6 * day), userRole: 'Sub Store Keeper' },
      { id: 'h26b', stage: 'Delivery', action: 'Delivered & GRN Filed', timestamp: now - (4 * day), userRole: 'Sub Store Keeper' }
    ]
  },
  {
    id: 'PR-2025-027', branch: 'Al Quoz', department: 'Orthopedics', category: 'Consumables',
    itemName: 'Surgical Drapes x100', quantity: 100, requester: 'Dr. Zayed', priority: 'Medium',
    status: 'Pending - Central Store', createdAt: now - (2 * day), slaDeadline: now + (day), smdApproved: false,
    history: [
      { id: 'h27a', stage: 'Initiation', action: 'Raised PR', timestamp: now - (2 * day), userRole: 'Sub Store Keeper' },
      { id: 'h27b', stage: 'Centre Approval', action: 'Approved', timestamp: now - (day + 12 * hour), userRole: 'Centre In-Charge' }
    ]
  },
  // ── OLDER PRs for Velocity Chart spread ──────────────────────────────
  {
    id: 'PR-2025-011', branch: 'Bur Dubai', department: 'Pharmacy', category: 'Medications',
    itemName: 'Amoxicillin 250mg x300', quantity: 300, requester: 'Pharm. Ali', priority: 'Normal',
    status: 'Closed - Completed', createdAt: now - (14 * day), slaDeadline: now - (12 * day), smdApproved: true,
    history: [{ id: 'h11x', stage: 'Initiation', action: 'Raised PR', timestamp: now - (14 * day), userRole: 'Sub Store Keeper' }]
  },
  {
    id: 'PR-2025-012', branch: 'Al Quoz', department: 'Emergency', category: 'Consumables',
    itemName: 'Oxygen Cylinder Regulator', quantity: 5, requester: 'Nurse Fatima', priority: 'High',
    status: 'Closed - Completed', createdAt: now - (21 * day), slaDeadline: now - (19 * day), smdApproved: true,
    history: [{ id: 'h12x', stage: 'Initiation', action: 'Raised PR', timestamp: now - (21 * day), userRole: 'Sub Store Keeper' }]
  },
  {
    id: 'PR-2025-013', branch: 'Bur Dubai', department: 'ICU', category: 'Equipment',
    itemName: 'Pulse Oximeter', quantity: 4, requester: 'Dr. John', priority: 'High',
    status: 'Closed - Completed', createdAt: now - (28 * day), slaDeadline: now - (26 * day), smdApproved: true,
    history: [{ id: 'h13x', stage: 'Initiation', action: 'Raised PR', timestamp: now - (28 * day), userRole: 'Sub Store Keeper' }]
  },
  {
    id: 'PR-2025-014', branch: 'Al Quoz', department: 'Radiology', category: 'Consumables',
    itemName: 'X-Ray Film 35x43cm x50', quantity: 50, requester: 'Dr. Smith', priority: 'Normal',
    status: 'Closed - Completed', createdAt: now - (42 * day), slaDeadline: now - (40 * day), smdApproved: true,
    history: [{ id: 'h14x', stage: 'Initiation', action: 'Raised PR', timestamp: now - (42 * day), userRole: 'Sub Store Keeper' }]
  },
  {
    id: 'PR-2025-015', branch: 'Bur Dubai', department: 'Cardiology', category: 'Medications',
    itemName: 'Clopidogrel 75mg x100', quantity: 100, requester: 'Dr. Ahmed', priority: 'Medium',
    status: 'Closed - Completed', createdAt: now - (56 * day), slaDeadline: now - (54 * day), smdApproved: true,
    history: [{ id: 'h15x', stage: 'Initiation', action: 'Raised PR', timestamp: now - (56 * day), userRole: 'Sub Store Keeper' }]
  },
  {
    id: 'PR-2025-016', branch: 'Al Quoz', department: 'Laboratory', category: 'Consumables',
    itemName: 'Specimen Containers x500', quantity: 500, requester: 'Tech Sarah', priority: 'Normal',
    status: 'Closed - Completed', createdAt: now - (63 * day), slaDeadline: now - (61 * day), smdApproved: true,
    history: [{ id: 'h16x', stage: 'Initiation', action: 'Raised PR', timestamp: now - (63 * day), userRole: 'Sub Store Keeper' }]
  },
  {
    id: 'PR-2025-017', branch: 'Bur Dubai', department: 'ENT', category: 'Equipment',
    itemName: 'Audiometer Calibration Kit', quantity: 1, requester: 'Dr. Bilal', priority: 'Normal',
    status: 'Closed - Completed', createdAt: now - (77 * day), slaDeadline: now - (75 * day), smdApproved: true,
    history: [{ id: 'h17x', stage: 'Initiation', action: 'Raised PR', timestamp: now - (77 * day), userRole: 'Sub Store Keeper' }]
  },
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
    return (saved as Role) || 'Super Admin';
  });
  const [branch, setBranch] = useState<string>(() => {
    const saved = localStorage.getItem('procurement_branch');
    return saved || 'Bur Dubai';
  });
  const [activeTab, setActiveTab] = useState<Tab>('Dashboard');
  const [prs, setPrs] = useState<PurchaseRequest[]>(() => {
    try {
      const saved = localStorage.getItem('procurement_prs');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Version guard: if stored data is old/sparse (< 15 PRs), reload fresh initialState
        if (Array.isArray(parsed) && parsed.length >= 15) return parsed;
      }
    } catch { /* ignore parse errors */ }
    return initialState;
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
