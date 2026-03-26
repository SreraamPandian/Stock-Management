import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { PurchaseRequest, Role, PRStatus, Tab, PRHistory, Priority, Asset, Branch, Department, Brand, Category, MasterUser, MovementLog } from '../types';

export type MaintenanceLog = {
  id: string;
  date: number;
  type: 'PPM' | 'Calibration' | 'Repair' | 'Audit' | 'Update';
  performer: string;
  notes: string;
  status: 'Pass' | 'Fail' | 'Pending';
  nextDue?: number; // Added nextDue to MaintenanceLog type
};

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
  assets: Asset[];
  registerAsset: (asset: Asset) => void;
  updateAsset: (asset: Asset) => void;
  updateAssetStatus: (id: string, status: Asset['status'], condition: Asset['condition']) => void;
  logMaintenance: (id: string, notes: string) => void;
  transferAsset: (id: string, floor: string, room: string) => void;
  // Masters
  branches: Branch[];
  addBranch: (branch: Branch) => void;
  updateBranch: (branch: Branch) => void;
  deleteBranch: (id: string) => void;
  departments: Department[];
  addDepartment: (dept: Department) => void;
  updateDepartment: (dept: Department) => void;
  deleteDepartment: (id: string) => void;
  brands: Brand[];
  addBrand: (brand: Brand) => void;
  updateBrand: (brand: Brand) => void;
  deleteBrand: (id: string) => void;
  categories: Category[];
  addCategory: (cat: Category) => void;
  updateCategory: (cat: Category) => void;
  deleteCategory: (id: string) => void;
  users: MasterUser[];
  addUser: (user: MasterUser) => void;
  updateUser: (user: MasterUser) => void;
  deleteUser: (id: string) => void;
  currentUserId: string;
}

const now = Date.now();
const hour = 3600000;
const day = 24 * hour;

const generateMockPRs = (): PurchaseRequest[] => {
  const stages: { status: PRStatus; label: string; notes: string }[] = [
    { status: 'Pending - Centre In-Charge', label: 'PR Created', notes: 'Initial requirement raised' },
    { status: 'Pending - Central Store', label: 'Centre Review', notes: 'Forwarded for central review' },
    { status: 'Pending - Central Store', label: 'Store Verification', notes: 'Verifying global stock availability' },
    { status: 'Pending - Procurement', label: 'Sourcing & Quotation', notes: 'Item not in stock, sourcing initiated' },
    { status: 'Pending - SMD', label: 'Mgmt Approval', notes: 'Quotes received, pending management sign-off' },
    { status: 'PO Issued', label: 'PO Issued', notes: 'Finance approved, PO sent to vendor' },
    { status: 'In Transit', label: 'In Transit', notes: 'Vendor dispatched items' },
    { status: 'Closed - Completed', label: 'Delivered', notes: 'Goods received and verified' }
  ];

  const branches = ['Bur Dubai', 'Al Quoz'];
  const depts = ['Cardiology', 'Emergency', 'Pharmacy', 'Laboratory', 'Radiology', 'ICU', 'Pediatrics', 'Orthopedics'];
  const categories = ['Consumables', 'Equipment', 'Medications', 'Instruments'];
  const mockPRs: PurchaseRequest[] = [];

  branches.forEach(branch => {
    stages.forEach((stage, sIdx) => {
      for (let i = 1; i <= 10; i++) {
        const id = `PR-${branch.substring(0, 1)}-${sIdx + 1}${i.toString().padStart(2, '0')}`;
        const createdAt = now - (Math.random() * 10 * day);
        const dept = depts[Math.floor(Math.random() * depts.length)];
        const cat = categories[Math.floor(Math.random() * categories.length)];
        
        mockPRs.push({
          id,
          branch,
          department: dept,
          category: cat,
          itemName: `${cat} Item ${id}`,
          quantity: Math.floor(Math.random() * 500) + 10,
          requester: `User ${i}`,
          priority: (['Normal', 'Medium', 'High', 'Emergency'] as Priority[])[Math.floor(Math.random() * 4)],
          status: stage.status,
          createdAt,
          slaDeadline: createdAt + (3 * day),
          smdApproved: sIdx > 4,
          vendor: sIdx > 3 ? 'Gulf Medical Supplies' : undefined,
          price: sIdx > 3 ? Math.floor(Math.random() * 50000) : undefined,
          history: [
            { id: `h-${id}-0`, stage: 'Initiation', action: 'Raised PR', timestamp: createdAt, userRole: 'Sub Store Keeper' },
            ...(sIdx > 0 ? [{ id: `h-${id}-1`, stage: 'Review', action: stage.label, timestamp: createdAt + hour, userRole: 'Centre In-Charge' as Role, notes: stage.notes }] : [])
          ]
        });
      }
    });
  });

  return mockPRs.sort((a, b) => b.createdAt - a.createdAt);
};

const initialState: PurchaseRequest[] = generateMockPRs();

const initialBranches: Branch[] = [
  { id: 'BR-001', name: 'Bur Dubai', address: 'Sheikh Zayed Rd, Dubai', status: 'Active' },
  { id: 'BR-002', name: 'Al Quoz', address: 'Industrial Area 3, Dubai', status: 'Active' },
  { id: 'BR-003', name: 'Global', address: 'Logistics Hub, Jabel Ali', status: 'Active' }
];

const initialDepartments: Department[] = [
  { id: 'DEPT-001', name: 'Cardiology', code: 'CARD', branch: 'Bur Dubai', head: 'Dr. Ahmed', status: 'Active' },
  { id: 'DEPT-002', name: 'Emergency', code: 'ER', branch: 'Al Quoz', head: 'Nurse Fatima', status: 'Active' },
  { id: 'DEPT-003', name: 'Pharmacy', code: 'PHRM', branch: 'Bur Dubai', head: 'Pharm. Ali', status: 'Active' },
  { id: 'DEPT-004', name: 'Laboratory', code: 'LAB', branch: 'Bur Dubai', head: 'Tech Sarah', status: 'Active' },
  { id: 'DEPT-005', name: 'ICU', code: 'ICU', branch: 'Bur Dubai', head: 'Dr. Hassan', status: 'Active' }
];

const initialBrands: Brand[] = [
  { id: 'BND-001', name: 'MedTech Pro', manufacturer: 'MedTech UAE', type: 'Medical', status: 'Active' },
  { id: 'BND-002', name: 'GE Healthcare', manufacturer: 'GE Global', type: 'Medical', status: 'Active' },
  { id: 'BND-003', name: 'Dell Latitude', manufacturer: 'Dell Inc.', type: 'IT', status: 'Active' },
  { id: 'BND-004', name: 'Philips Medical', manufacturer: 'Philips', type: 'Medical', status: 'Active' }
];

const initialCategories: Category[] = [
  { id: 'CAT-001', name: 'Medical Equipment', prefix: 'ME', description: 'Critical healthcare machinery', status: 'Active' },
  { id: 'CAT-002', name: 'IT Infrastructure', prefix: 'IT', description: 'Laptops, Servers, Networking', status: 'Active' },
  { id: 'CAT-003', name: 'Hospital Furniture', prefix: 'HF', description: 'Beds, Chairs, Cabinets', status: 'Active' },
  { id: 'CAT-004', name: 'Consumables', prefix: 'CON', description: 'Daily use medical supplies', status: 'Active' }
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

const initialUsers: MasterUser[] = [
  { id: 'USR-001', name: 'Ahmed Khan', email: 'ahmed.k@probiz.ae', phone: '+971-52-111-2233', role: 'Sub Store Keeper', branch: 'Bur Dubai', status: 'Active', joined: '2024-01-15', lastLogin: '10 mins ago' },
  { id: 'USR-002', name: 'Fatima Ali', email: 'fatima.a@probiz.ae', phone: '+971-55-977-8821', role: 'Centre In-Charge', branch: 'Bur Dubai', status: 'Active', joined: '2023-08-20', lastLogin: '2h ago' },
  { id: 'USR-003', name: 'Sarah Smith', email: 'sarah.s@probiz.ae', phone: '+971-54-212-3344', role: 'Sub Store Keeper', branch: 'Al Quoz', status: 'Active', joined: '2024-03-10', lastLogin: '5h ago' },
  { id: 'USR-004', name: 'Dr. Hassan', email: 'hassan.d@probiz.ae', phone: '+971-50-445-6677', role: 'Centre In-Charge', branch: 'Al Quoz', status: 'Active', joined: '2022-12-05', lastLogin: '1d ago' },
  { id: 'USR-005', name: 'Omar Farooq', email: 'omar.f@probiz.ae', phone: '+971-52-889-0011', role: 'Central Store', branch: 'Global', status: 'Active', joined: '2023-04-18', lastLogin: '30 mins ago' },
  { id: 'USR-006', name: 'Aisha Rahman', email: 'aisha.r@probiz.ae', phone: '+971-55-321-4455', role: 'Procurement Officer', branch: 'Global', status: 'Active', joined: '2023-09-01', lastLogin: '15 mins ago' },
  { id: 'USR-007', name: 'John Doe', email: 'john.d@probiz.ae', phone: '+971-50-777-8899', role: 'SMD', branch: 'Global', status: 'Active', joined: '2021-06-15', lastLogin: '3h ago' },
  { id: 'USR-008', name: 'Jane Roe', email: 'jane.r@probiz.ae', phone: '+971-54-654-3322', role: 'Finance', branch: 'Global', status: 'On Leave', joined: '2022-02-28', lastLogin: '3 days ago' },
  { id: 'USR-009', name: 'Zayed Mansoor', email: 'zayed.m@probiz.ae', phone: '+971-52-123-9988', role: 'SMD', branch: 'Global', status: 'Active', joined: '2020-11-10', lastLogin: 'Just now' },
  { id: 'USR-010', name: 'Maya Jamila', email: 'maya.j@probiz.ae', phone: '+971-55-567-4433', role: 'Finance', branch: 'Global', status: 'Active', joined: '2023-07-22', lastLogin: '4h ago' }
];

const initialAssets: Asset[] = [
  {
    id: 'AST-2025-001', tagNumber: 'TAG-55293', name: 'Ventilator V1', category: 'Medical', serialNo: 'SN-99283-X', brandModel: 'MedTech Pro 500', manufacturerRef: 'MFR-GE-001',
    prId: 'PR-2025-005', purchaseDate: now - (30 * day), invoiceRef: 'INV-2025-9923', price: 45000, vendor: 'MedSupply Co.',
    warrantyStart: '2025-01-01', startDate: '2025-01-01', warrantyEnd: '2026-01-01', alertBeforeExpiry: 30, ppmSchedule: 'Quarterly',
    nextServiceDue: now + (15 * day), isCalibrationRequired: true, nextCalibrationDue: now + (45 * day),
    assetOwner: 'ICU', department: 'Dr. Hassan', branch: 'Bur Dubai', assignedTo: 'Dr. Hassan', issuedBy: 'Admin', issuedDate: now - (25 * day),
    floor: 'Floor 2', buildingWing: 'Main Wing', room: 'ICU-Room 4', status: 'Active', condition: 'Good', dhaAuditFocus: true,
    maintenanceLogs: [
      { id: 'm1', date: now - (90 * day), type: 'PPM', performer: 'Biomed Tech', notes: 'Scheduled checkup, filters replaced.', status: 'Pass', nextDue: now + (15 * day) }
    ],
    movementLogs: [
      { id: 'mv1', date: now - (60 * day), fromLocation: 'Store B', toLocation: 'ICU-Room 4', movedBy: 'Sub Store Keeper', reason: 'Emergency requirement' }
    ]
  },
  {
    id: 'AST-2025-002', tagNumber: 'TAG-77382', name: 'Standard Dell Laptop', category: 'IT', serialNo: 'LT-7738-B', brandModel: 'Dell Latitude 5420', manufacturerRef: 'MFR-DELL-5420',
    prId: 'PR-2025-010', purchaseDate: now - (10 * day), invoiceRef: 'INV-2025-4421', price: 5200, vendor: 'IT Systems Dubai',
    warrantyStart: '2025-02-15', startDate: '2025-02-15', warrantyEnd: '2028-02-15', alertBeforeExpiry: 90, ppmSchedule: 'Annual',
    nextServiceDue: now + (200 * day), isCalibrationRequired: false,
    assetOwner: 'Administration', department: 'Sarah Ali', branch: 'Al Quoz', assignedTo: 'Ahmed Khan', issuedBy: 'IT Manager', issuedDate: now - (8 * day),
    floor: 'Floor 1', buildingWing: 'Al Quoz Hub', room: 'Admin Office', status: 'Active', condition: 'Good', dhaAuditFocus: false,
    maintenanceLogs: [], movementLogs: []
  }
];

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
        if (Array.isArray(parsed) && parsed.length >= 15) return parsed;
      }
    } catch { }
    return initialState;
  });

  const [assets, setAssets] = useState<Asset[]>(() => {
    try {
      const saved = localStorage.getItem('procurement_assets');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // SANITIZE: Ensure logs are always arrays even if loaded from older versions
          return parsed.map((a: any) => ({
            ...a,
            maintenanceLogs: a.maintenanceLogs || [],
            movementLogs: a.movementLogs || []
          }));
        }
      }
    } catch { }
    return initialAssets;
  });

  const [branches, setBranches] = useState<Branch[]>(() => {
    try {
      const saved = localStorage.getItem('master_branches');
      if (saved) return JSON.parse(saved);
    } catch { }
    return initialBranches;
  });

  const [departments, setDepartments] = useState<Department[]>(() => {
    try {
      const saved = localStorage.getItem('master_departments');
      if (saved) return JSON.parse(saved);
    } catch { }
    return initialDepartments;
  });

  const [brands, setBrands] = useState<Brand[]>(() => {
    try {
      const saved = localStorage.getItem('master_brands');
      if (saved) return JSON.parse(saved);
    } catch { }
    return initialBrands;
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const saved = localStorage.getItem('master_categories');
      if (saved) return JSON.parse(saved);
    } catch { }
    return initialCategories;
  });

  const [users, setUsers] = useState<MasterUser[]>(() => {
    try {
      const saved = localStorage.getItem('master_users');
      if (saved) return JSON.parse(saved);
    } catch { }
    return initialUsers;
  });

  useEffect(() => {
    localStorage.setItem('procurement_role', role);
    localStorage.setItem('procurement_branch', branch);
    localStorage.setItem('procurement_prs', JSON.stringify(prs));
    localStorage.setItem('procurement_assets', JSON.stringify(assets));
    localStorage.setItem('master_branches', JSON.stringify(branches));
    localStorage.setItem('master_departments', JSON.stringify(departments));
    localStorage.setItem('master_brands', JSON.stringify(brands));
    localStorage.setItem('master_categories', JSON.stringify(categories));
    localStorage.setItem('master_users', JSON.stringify(users));
  }, [role, branch, prs, assets, branches, departments, brands, categories, users]);

  const addPR = (pr: any) => setPrs([pr, ...prs]);
  const updatePRStatus = (id: string, newStatus: PRStatus, notes?: string, extraData?: Partial<PurchaseRequest>) => {
    setPrs(current => current.map(pr => pr.id === id ? {
      ...pr,
      status: newStatus,
      ...extraData,
      history: [...pr.history, { id: Math.random().toString(36).substr(2, 9), stage: newStatus, action: 'Status Updated', timestamp: Date.now(), userRole: role, notes }]
    } : pr));
  };

  const extendTAT = (id: string, additionalHours: number, reason: string, revisedDate?: number) => {
    setPrs(current => current.map(pr => pr.id === id ? {
      ...pr,
      slaDeadline: revisedDate || (pr.slaDeadline + additionalHours * hour),
      history: [...pr.history, { id: Math.random().toString(36).substr(2, 9), stage: pr.status, action: 'TAT Extended', timestamp: Date.now(), userRole: role, notes: `Reason: ${reason}` }]
    } : pr));
  };

  const getDeptBudget = (dept: string) => deptBudgets[dept] || { approved: 0, consumed: 0 };

  const registerAsset = (asset: Asset) => setAssets(current => [asset, ...current]);
  
  const updateAsset = (updated: Asset) => {
    setAssets(current => current.map(a => {
      if (a.id === updated.id) {
        // Log the change if it's significant
        const log: MaintenanceLog = {
          id: Math.random().toString(36).substr(2, 9),
          date: Date.now(),
          type: 'Update',
          performer: role,
          notes: 'Asset record updated via Maintenance module',
          status: 'Pass'
        };
        return { 
          ...updated, 
          maintenanceLogs: [...(updated.maintenanceLogs || []), log] 
        };
      }
      return a;
    }));
  };
  const updateAssetStatus = (id: string, status: Asset['status'], condition: Asset['condition']) => {
    setAssets(current => current.map(a => a.id === id ? { ...a, status, condition } : a));
  };

  const logMaintenance = (id: string, notes: string) => {
    setAssets(current => current.map(a => {
      if (a.id === id) {
        const intervalMap = { 'Monthly': 30, 'Quarterly': 90, 'Bi-Annual': 180, 'Annual': 365 };
        const days = intervalMap[a.ppmSchedule] || 90;
        const newLog: MaintenanceLog = {
          id: Math.random().toString(36).substr(2, 9),
          date: Date.now(),
          type: 'PPM',
          performer: role,
          notes,
          status: 'Pass',
          nextDue: Date.now() + (days * 24 * 3600000)
        };
        return {
          ...a,
          nextServiceDue: newLog.nextDue!,
          lastServiceDate: Date.now(),
          maintenanceLogs: [...a.maintenanceLogs, newLog]
        };
      }
      return a;
    }));
  };

  const transferAsset = (id: string, floor: string, room: string) => {
    setAssets(current => current.map(a => {
      if (a.id === id) {
        const newLog: MovementLog = {
          id: Math.random().toString(36).substr(2, 9),
          date: Date.now(),
          fromLocation: `${a.floor} - ${a.room}`,
          toLocation: `${floor} - ${room}`,
          movedBy: role,
          reason: 'Manual Transfer'
        };
        return { ...a, floor, room, movementLogs: [...a.movementLogs, newLog] };
      }
      return a;
    }));
  };

  const addBranch = (b: Branch) => setBranches([b, ...branches]);
  const updateBranch = (b: Branch) => setBranches(current => current.map(item => item.id === b.id ? b : item));
  const deleteBranch = (id: string) => setBranches(current => current.filter(item => item.id !== id));

  const addDepartment = (d: Department) => setDepartments([d, ...departments]);
  const updateDepartment = (d: Department) => setDepartments(current => current.map(item => item.id === d.id ? d : item));
  const deleteDepartment = (id: string) => setDepartments(current => current.filter(item => item.id !== id));

  const addBrand = (b: Brand) => setBrands([b, ...brands]);
  const updateBrand = (b: Brand) => setBrands(current => current.map(item => item.id === b.id ? b : item));
  const deleteBrand = (id: string) => setBrands(current => current.filter(item => item.id !== id));

  const addCategory = (c: Category) => setCategories([c, ...categories]);
  const updateCategory = (c: Category) => setCategories(current => current.map(item => item.id === c.id ? c : item));
  const deleteCategory = (id: string) => setCategories(current => current.filter(item => item.id !== id));

  const addUser = (u: MasterUser) => setUsers([u, ...users]);
  const updateUser = (u: MasterUser) => setUsers(current => current.map(item => item.id === u.id ? u : item));
  const deleteUser = (id: string) => setUsers(current => current.filter(item => item.id !== id));

  const currentUserId = role === 'Super Admin' ? 'USR-001' : 
                        role === 'Centre In-Charge' ? 'USR-002' : 'USR-003';

  return (
    <ProcurementContext.Provider value={{ 
      role, setRole, branch, setBranch, activeTab, setActiveTab, prs, addPR, updatePRStatus, extendTAT, getDeptBudget, 
      assets, registerAsset, updateAsset, updateAssetStatus, logMaintenance, transferAsset,
      branches, addBranch, updateBranch, deleteBranch,
      departments, addDepartment, updateDepartment, deleteDepartment,
      brands, addBrand, updateBrand, deleteBrand,
      categories, addCategory, updateCategory, deleteCategory,
      users, addUser, updateUser, deleteUser,
      currentUserId
    }}>
      {children}
    </ProcurementContext.Provider>
  );
};

export const useProcurement = () => {
  const context = useContext(ProcurementContext);
  if (!context) throw new Error('useProcurement must be used within a ProcurementProvider');
  return context;
};
