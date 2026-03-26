export type Role =
  | 'Super Admin'
  | 'Sub Store Keeper'
  | 'Centre In-Charge'
  | 'Central Store'
  | 'Procurement Officer'
  | 'SMD'
  | 'Finance';

export type Priority = 'Normal' | 'Medium' | 'High' | 'Emergency';

export type PRStatus =
  | 'Pending - Centre In-Charge'
  | 'Pending - Central Store'
  | 'Pending - Procurement'
  | 'Pending - SMD'
  | 'Pending - Finance'
  | 'PO Issued'
  | 'Order Placed'
  | 'Dispatch Scheduled'
  | 'Dispatched'
  | 'In Transit'
  | 'GRN Pending'
  | 'GRN Completed'
  | 'Delivered'
  | 'Closed - Completed'
  | 'Rejected - Action Required'
  | 'Asset Registered';

export type AssetCategory = 'Medical' | 'IT' | 'Furniture' | 'Vehicles' | 'Facility';
export type AssetStatus = 'Active' | 'Under Maintenance' | 'Down' | 'Disposed';
export type AssetCondition = 'Good' | 'Fair' | 'Poor';


export type Tab = 
  | 'Dashboard' 
  | 'PR Entry' 
  | 'Stock' 
  | 'Analytics' 
  | 'Admin' 
  | 'Store Management' 
  | 'User Management' 
  | 'Purchase Order' 
  | 'Asset Management'
  | 'Asset'
  | 'Maintenance & Compliance'
  | 'Asset Reports'
  | 'Branch Master'
  | 'Department Master'
  | 'Brand Master'
  | 'Category Master';

export interface Branch {
  id: string;
  name: string;
  address: string;
  status: 'Active' | 'Inactive';
}

export interface Department {
  id: string;
  name: string;
  code: string;
  branch: string;
  head: string;
  status: 'Active' | 'Inactive';
}

export interface Brand {
  id: string;
  name: string;
  manufacturer: string;
  type: string;
  status: 'Active' | 'Inactive';
}

export interface Category {
  id: string;
  name: string;
  prefix: string;
  description: string;
  status: 'Active' | 'Inactive';
}

export interface Store {
  id: string;
  name: string;
  branch: string;
  location: string;
  type: 'Sub Store' | 'Central Store';
  incharge: string;
  capacity: number;
  status: 'Active' | 'Inactive';
}

export interface MasterUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  branch: string;
  status: 'Active' | 'On Leave' | 'Suspended';
  joined: string;
  lastLogin: string;
}


export interface PRHistory {
  id: string;
  stage: string;
  action: string;
  timestamp: number;
  userRole: Role;
  notes?: string;
  rejectionReason?: string;
}

export interface PurchaseRequest {
  id: string;
  branch: string;
  department: string;
  category: string;
  itemName?: string;
  batch?: string;
  quantity: number;
  requester: string;
  priority: Priority;
  status: PRStatus;
  createdAt: number;
  receivedAt?: number;
  slaDeadline: number;
  smdApproved: boolean;
  history: PRHistory[];
  vendor?: string;
  price?: number;
  paymentMode?: string;
  expiryDate?: string;
  condition?: 'Good' | 'Damaged' | 'Expired';
  barcode?: string;
  dispatchDate?: number;
  expectedDeliveryDate?: number;
  actualDeliveryDate?: number;
  isReserved?: boolean;
  deliveryLocation?: 'Sub Store' | 'Central Store';
  quotationAttached?: boolean;
  quotationName?: string;
  vendorComplianceStatus?: 'Compliant' | 'Pending Review' | 'Non-Compliant';
  vendorInvoiceNumber?: string;
  revisedDeliveryDate?: number;
  isTATExtended?: boolean;
  isLocked?: boolean;
  delayReason?: string;
  smdActionDeadline?: number;
  smdActionTimestamp?: number;
  paymentStructure?: '100% Advance' | '50/50' | 'On Delivery' | 'Terms' | 'Milestone';
  paymentReleaseTimeline?: number;
  vendorAcknowledgment?: boolean;
  riskNotes?: string;
  paymentStatus?: 'Scheduled' | 'Released' | 'Invoice Pending';
  financeActionDeadline?: number;
  receivedQuantity?: number;
  discrepancyRemarks?: string;
  isAuditLocked?: boolean;
  isAsset?: boolean;
}

export interface MaintenanceLog {
  id: string;
  date: number;
  type: 'PPM' | 'Calibration' | 'Repair' | 'Audit';
  performer: string;
  notes: string;
  status: 'Pass' | 'Fail' | 'Pending';
  nextDue?: number;
}

export interface MovementLog {
  id: string;
  date: number;
  fromLocation: string;
  toLocation: string;
  movedBy: string;
  reason: string;
}

export interface Asset {
  id: string; // Asset ID
  tagNumber: string; // Unique tag number
  name: string;
  category: AssetCategory;
  serialNo: string;
  brandModel: string;
  manufacturerRef: string;
  
  // Procurement Link
  prId: string;
  purchaseDate: number;
  invoiceRef: string;
  price: number;
  vendor: string;
  documentUrl?: string; // Step 2 upload
  
  // Warranty & Compliance
  warrantyStart: string;
  startDate: string; // Added start date for warranty
  warrantyEnd: string;
  alertBeforeExpiry: number; // Days
  ppmSchedule: 'Monthly' | 'Quarterly' | 'Bi-Annual' | 'Annual';
  lastServiceDate?: number;
  nextServiceDue: number;
  isCalibrationRequired: boolean;
  lastCalibrationDate?: number;
  nextCalibrationDue?: number;

  // DHA & Maintenance (Step 6)
  dhaAuditFocus: boolean;
  amcVendor?: string;
  serviceProvider?: string;
  maintenanceLogs: MaintenanceLog[];
  movementLogs: MovementLog[];
  
  // Ownership & Assignment
  assetOwner: string; // Dept / center
  department: string; // Employee / dept
  branch: string; // Added back for compatibility
  assignedTo: string;
  issuedDate: number;
  issuedBy: string;
  returnDate?: number;
  
  // Location
  floor: string;
  buildingWing: string;
  room: string;
  exactLocation?: string;
  rackCorner?: string;
  
  // Status
  status: AssetStatus;
  condition: AssetCondition;
  
  // Documents
  manualUrl?: string;
  warrantyUrl?: string;
  calibrationCertUrl?: string;
}

