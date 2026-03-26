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

const initialState: PurchaseRequest[] = [
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
    status: 'Order Placed', createdAt: now - (10 * hour), slaDeadline: now + (38 * hour), smdApproved: true,
    vendor: 'MedLine Gulf', price: 4500.00, paymentMode: 'On Delivery', deliveryLocation: 'Sub Store',
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
