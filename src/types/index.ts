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
  | 'Rejected - Action Required';

export type Tab = 'Dashboard' | 'PR Entry' | 'Stock' | 'Analytics' | 'Admin' | 'Store Management' | 'User Management' | 'Purchase Order';


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
}
