import { useState, useEffect } from 'react';
import { PurchaseRequest, PRStatus, Priority } from '../../types';
import { useProcurement } from '../../context/ProcurementContext';
import { TimelineStepper } from '../shared/TimelineStepper';
import { SLATimer } from '../shared/SLATimer';
import { X, FileText, Check, Ban, Clock, Truck, Barcode, MapPin, Paperclip, AlertTriangle, Lock, TrendingUp } from 'lucide-react';
import { BarcodeScanner } from '../forms/BarcodeScanner';

interface Props {
  pr: PurchaseRequest;
  onClose: () => void;
}

export const PRDetailModal = ({ pr, onClose }: Props) => {
  const { role, updatePRStatus, extendTAT } = useProcurement();
  const [remarks, setRemarks] = useState('');
  const [showRejectReason, setShowRejectReason] = useState(false);
  const [showExtendTAT, setShowExtendTAT] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<number | null>(null);
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);

  // Finance/GRN Specialized Form State
  const [extraFormData, setExtraFormData] = useState({
    paymentMode: 'Bank Transfer',
    structure: '100% Advance',
    timeline: '30',
    ack: false,
    receivedQty: pr.quantity.toString()
  });

  // Procurement Specific States
  const [deliveryLoc, setDeliveryLoc] = useState<any>(pr.deliveryLocation || 'Sub Store');
  const [isQuotationAttached, setIsQuotationAttached] = useState(pr.quotationAttached || false);
  const [selectedPriority, setSelectedPriority] = useState<Priority>(pr.priority);
  const [revisedDate, setRevisedDate] = useState<string>('');

  // SMD Specific States
  const [showBreachHandling, setShowBreachHandling] = useState(false);
  const [delayReason, setDelayReason] = useState('');

  // Success feedback state
  const [successState, setSuccessState] = useState<{ message: string; destination: string } | null>(null);

  // Auto-close modal 2.5 seconds after success
  useEffect(() => {
    if (successState) {
      const timer = setTimeout(() => onClose(), 2500);
      return () => clearTimeout(timer);
    }
  }, [successState, onClose]);

  const isSMDBreach = role === 'SMD' && pr.status === 'Pending - SMD' && pr.smdActionDeadline && Date.now() > pr.smdActionDeadline;

  const REJECTION_REASONS = [
    'Incomplete Specifications',
    'Exceeds Monthly Quota',
    'Alternative Vendor Required',
    'Budget Cap Reached',
    'Policy Non-Compliance',
    'Duplicate Request',
    'Specify in Remarks'
  ];

  const DISPATCH_REMARKS = [
    'Stock dispatched',
    'Delivery scheduled',
    'Pending transport',
    'Forwarded to Procurement Officer'
  ];

  const [selectedReason, setSelectedReason] = useState(REJECTION_REASONS[0]);

  const handleAction = (status: PRStatus, extraData = {}) => {
    if (status === 'Rejected - Action Required' && !remarks) {
      alert('Remarks/Details are mandatory for rejection.');
      return;
    }

    if (status === 'Pending - Centre In-Charge' && pr.status === 'Rejected - Action Required' && !remarks) {
      alert('Remarks are mandatory when re-forwarding a rejected request.');
      return;
    }

    if (status === 'Pending - Procurement' && !remarks && role === 'Central Store') {
      alert('Mandatory remarks required when forwarding to Procurement.');
      return;
    }

    // Procurement Safeguards
    if (status === 'Pending - SMD' && role === 'Procurement Officer') {
      if (!selectedVendor) { alert('Please select a vendor.'); return; }
      if (!isQuotationAttached) { alert('Valid quotation attachment is mandatory.'); return; }
      if (!deliveryLoc) { alert('Delivery location must be specified.'); return; }
    }

    // SMD Breach Safeguard
    if (status === 'Pending - Finance' && role === 'SMD' && isSMDBreach && !delayReason) {
      setShowBreachHandling(true);
      return;
    }

    updatePRStatus(pr.id, status, remarks, {
      ...extraData,
      deliveryLocation: deliveryLoc,
      quotationAttached: isQuotationAttached,
      priority: selectedPriority,
      delayReason: delayReason || pr.delayReason
    });

    // Determine friendly destination label
    const destinationMap: Partial<Record<PRStatus, string>> = {
      'Pending - Central Store': 'Central Store Keeper',
      'Pending - Centre In-Charge': 'Centre In-Charge (Re-submitted)',
      'Pending - Procurement': 'Procurement Officer',
      'Pending - SMD': 'Senior Managing Director',
      'Pending - Finance': 'Finance / Accounts',
      'Dispatched': 'Sub Store Keeper (In Transit)',
      'PO Issued': 'Vendor / Procurement',
      'Closed - Completed': 'Workflow Closed',
      'Rejected - Action Required': 'Sub Store Keeper (Action Required)',
      'Dispatch Scheduled': 'Central Store (Dispatch Queue)',
    };
    setSuccessState({
      message: status.includes('Rejected') ? 'Request Rejected' : status === 'Closed - Completed' ? 'Workflow Closed' : 'Successfully Forwarded',
      destination: destinationMap[status] || status
    });
  };

  const handleExtendTAT = () => {
    if (!remarks) {
      alert('Reason for TAT extension is mandatory.');
      return;
    }
    if (!revisedDate) {
      alert('Revised expected delivery date is mandatory.');
      return;
    }
    extendTAT(pr.id, 24, remarks, new Date(revisedDate).getTime());
    setShowExtendTAT(false);
    setRemarks('');
  };

  // const isFinanceGuardActive = role === 'Finance' && pr.smdApproved && (pr.priority === 'Emergency' || pr.priority === 'High');

  const renderActionButtons = () => {
    if (pr.isLocked && role !== 'SMD' && role !== 'Finance') {
      return (
        <div className="flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-widest bg-slate-100 px-4 py-2 rounded-lg border border-slate-200">
          <Lock className="w-4 h-4" /> This PR is locked for executive processing
        </div>
      );
    }

    switch (role) {
      case 'Sub Store Keeper':
        if (pr.status === 'Rejected - Action Required') {
          const lastRejection = pr.history.filter(h => h.action === 'Rejected').pop();
          return (
            <div className="w-full space-y-4 bg-amber-50 p-5 rounded-2xl border border-amber-200">
              <div className="flex items-center gap-2 text-amber-800 font-black text-[10px] uppercase tracking-widest">
                <Clock className="w-4 h-4" /> Correction & Re-submission Required
              </div>

              {/* Show what was rejected */}
              {lastRejection?.rejectionReason && (
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-4">
                  <p className="text-[9px] font-black text-rose-400 uppercase tracking-widest mb-1">Reason for Rejection</p>
                  <p className="text-xs font-bold text-rose-700">{lastRejection.rejectionReason}</p>
                  {lastRejection.notes && <p className="text-[10px] text-rose-500 mt-1 italic">"{lastRejection.notes}"</p>}
                </div>
              )}

              {/* Clarification options */}
              <div>
                <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest mb-2">Select Correction Made</p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {[
                    'Specification Updated',
                    'Quantity Revised',
                    'Justification Added',
                    'Supporting Docs Attached',
                    'Duplicate Removed',
                    'Budget Re-allocated'
                  ].map(c => (
                    <button
                      key={c}
                      onClick={() => setRemarks(c)}
                      className={`px-3 py-1.5 rounded-full text-[10px] font-bold transition-all border ${remarks === c ? 'bg-amber-700 text-white border-amber-700' : 'bg-white text-amber-700 border-amber-200 hover:border-amber-400'}`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
                <textarea
                  placeholder="Describe the corrections made before re-submitting..."
                  className="w-full border border-amber-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-amber-500 outline-none h-20 bg-white resize-none"
                  value={remarks}
                  onChange={e => setRemarks(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-3 pt-1 border-t border-amber-200">
                <button
                  onClick={() => {
                    updatePRStatus(pr.id, 'Closed - Completed', 'Request closed by Sub Store Keeper without correction.');
                    setSuccessState({ message: 'Workflow Closed', destination: 'Workflow Closed' });
                  }}
                  className="px-5 py-2 text-slate-500 hover:bg-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all border border-slate-200 bg-transparent"
                >
                  Close Without Fix
                </button>
                <button
                  disabled={!remarks}
                  onClick={() => handleAction('Pending - Centre In-Charge')}
                  className="px-6 py-2.5 bg-amber-600 text-white rounded-xl hover:bg-amber-700 text-xs font-black uppercase tracking-widest shadow-lg shadow-amber-200 transition-all disabled:opacity-50"
                >
                  Re-Submit to Centre In-Charge
                </button>
              </div>
            </div>
          );
        }
        if (pr.status === 'PO Issued' || pr.status === 'Dispatched' || pr.status === 'In Transit') {
          return (
            <div className="w-full space-y-6 bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2 text-blue-800 font-black text-xs uppercase tracking-widest">
                  <Check className="w-5 h-5" /> GRN Reconciliation Center
                </div>
                <div className="px-3 py-1 bg-white border border-blue-200 rounded-full text-[10px] font-black text-blue-600 uppercase">
                  PO Qty: {pr.quantity}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white p-4 rounded-xl border border-blue-100 space-y-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Receipt Quantity</label>
                    <input
                      type="number"
                      className="w-full border border-slate-200 rounded-lg p-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500"
                      value={extraFormData.receivedQty}
                      onChange={e => setExtraFormData({ ...extraFormData, receivedQty: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Discrepancy Remarks</label>
                    <input
                      type="text"
                      placeholder="e.g. 5 units damaged"
                      className="w-full border border-slate-200 rounded-lg p-2.5 text-xs outline-none focus:ring-2 focus:ring-blue-500"
                      value={remarks}
                      onChange={e => setRemarks(e.target.value)}
                    />
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-blue-100 space-y-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Expiry Date Verification</label>
                    <input type="date" className="w-full border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500" id="grn-expiry" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Stock Location</label>
                    <select className="w-full border border-slate-200 rounded-lg p-2.5 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500">
                      <option>{pr.branch} Sub Store - Main Rack</option>
                      <option>{pr.branch} Sub Store - Cold Storage</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border-2 border-dashed border-blue-200 shadow-sm text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Scan Barcode to Authenticate & Finalize GRN</p>
                <BarcodeScanner onScan={(code) => {
                  const expiry = (document.getElementById('grn-expiry') as HTMLInputElement)?.value;
                  handleAction('Closed - Completed', {
                    actualDeliveryDate: Date.now(),
                    receivedQuantity: parseInt(extraFormData.receivedQty),
                    discrepancyRemarks: remarks,
                    barcode: code,
                    expiryDate: expiry,
                    notes: `GRN Finalized: ${extraFormData.receivedQty}/${pr.quantity} items receipted. Expiry: ${expiry || 'N/A'}. Discrepancy: ${remarks || 'None'}`
                  });
                }} />
              </div>
            </div>
          );
        }
        return null;

      case 'Centre In-Charge':
        return (
          <div className="w-full space-y-5">
            {/* Remarks Panel - always visible */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
              <div className="flex items-center gap-2 text-slate-500 font-black text-[10px] uppercase tracking-widest mb-3">
                <FileText className="w-3.5 h-3.5" /> Review Remarks (Mandatory for Rejection)
              </div>
              <div className="flex flex-wrap gap-2 mb-3">
                {[
                  'Requirement Verified – Forwarding',
                  'Insufficient Justification',
                  'Duplicate Entry Detected',
                  'Budget Threshold Exceeded',
                  'Stock Available at Central Store – Verify',
                  'Requires Direct Procurement'
                ].map(r => (
                  <button
                    key={r}
                    onClick={() => setRemarks(r)}
                    className={`px-3 py-1.5 rounded-full text-[10px] font-bold transition-all border ${remarks === r ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400'}`}
                  >
                    {r}
                  </button>
                ))}
              </div>
              <textarea
                placeholder="Add remarks or select a reason above..."
                className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white h-20 resize-none"
                value={remarks}
                onChange={e => setRemarks(e.target.value)}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap justify-end gap-3">
              <button
                onClick={() => {
                  if (!remarks) { alert('Remarks are mandatory for rejection.'); return; }
                  setShowRejectReason(true);
                }}
                className="px-6 py-2.5 border border-rose-200 text-rose-600 rounded-xl hover:bg-rose-50 text-xs font-black uppercase tracking-widest transition-all"
              >
                Reject Request
              </button>
              <button
                onClick={() => {
                  if (!remarks) setRemarks('Stock Available at Central Store – Verify');
                  handleAction('Pending - Central Store');
                }}
                className="px-6 py-2.5 bg-slate-800 text-white rounded-xl hover:bg-slate-900 text-xs font-black uppercase tracking-widest transition-all shadow-lg"
              >
                Verify at Central Store
              </button>
              <button
                onClick={() => handleAction('Pending - Procurement')}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-200 transition-all"
              >
                Direct Procurement
              </button>
            </div>
          </div>
        );

      case 'Central Store':
        return (
          <div className="w-full space-y-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2 text-slate-500 font-black text-[10px] uppercase tracking-widest mb-3">
                <FileText className="w-3.5 h-3.5" /> Structured Remarks Panel
              </div>
              <div className="flex flex-wrap gap-2 mb-3">
                {DISPATCH_REMARKS.map(rem => (
                  <button
                    key={rem}
                    onClick={() => setRemarks(rem)}
                    className={`px-3 py-1.5 rounded-full text-[10px] font-bold transition-all border ${remarks === rem ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400'}`}
                  >
                    {rem}
                  </button>
                ))}
              </div>
              <textarea
                placeholder="Add additional comments or select from options above..."
                className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white h-20"
                value={remarks}
                onChange={e => setRemarks(e.target.value)}
              />
            </div>

            {showBarcodeScanner ? (
              <div className="bg-white p-4 rounded-xl border-2 border-dashed border-blue-200 animate-in fade-in zoom-in duration-300">
                <div className="flex justify-between items-center mb-3">
                  <p className="text-xs font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
                    <Barcode className="w-4 h-4" /> Scan Item for Dispatch Issuance
                  </p>
                  <button onClick={() => setShowBarcodeScanner(false)} className="text-[10px] font-bold text-slate-400 hover:text-slate-600">Cancel Scan</button>
                </div>
                <BarcodeScanner onScan={(code) => {
                  handleAction('Dispatched', {
                    barcode: code,
                    dispatchDate: Date.now(),
                    expectedDeliveryDate: Date.now() + (24 * 3600000)
                  });
                }} />
              </div>
            ) : (
              <div className="flex flex-wrap justify-end gap-3">
                <button
                  onClick={() => handleAction('Pending - Procurement')}
                  className="px-4 py-2 border border-amber-200 text-amber-700 rounded-lg hover:bg-amber-50 text-xs font-bold uppercase tracking-widest transition-all"
                >
                  Forward to Procurement
                </button>
                <button
                  onClick={() => handleAction('Dispatch Scheduled', { expectedDeliveryDate: Date.now() + (48 * 3600000) })}
                  className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 text-xs font-bold uppercase tracking-widest transition-all"
                >
                  Schedule Dispatch
                </button>
                <button
                  onClick={() => setShowBarcodeScanner(true)}
                  className="px-5 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg shadow-emerald-100"
                >
                  <Truck className="w-4 h-4" /> Dispatch Consumables
                </button>
              </div>
            )}
          </div>
        );

      case 'Procurement Officer':
        if (showExtendTAT) {
          return (
            <div className="w-full space-y-4 bg-amber-50 p-6 rounded-2xl border border-amber-200 animate-in slide-in-from-top duration-300">
              <h4 className="text-xs font-black text-amber-800 uppercase tracking-widest flex items-center gap-2">
                <Clock className="w-4 h-4" /> Mandatory TAT Extension Control
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Revised Delivery Date</label>
                  <input
                    type="date"
                    className="w-full border border-amber-200 rounded-xl p-3 text-sm focus:ring-4 focus:ring-amber-500/10 outline-none bg-white font-bold"
                    value={revisedDate}
                    onChange={e => setRevisedDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Reason for Extension</label>
                  <select
                    className="w-full border border-amber-200 rounded-xl p-3 text-sm focus:ring-4 focus:ring-amber-500/10 outline-none bg-white font-bold"
                    value={remarks}
                    onChange={e => setRemarks(e.target.value)}
                  >
                    <option value="">Select Reason...</option>
                    <option>Product Unavailable Locally</option>
                    <option>Vendor Lead Time Increase</option>
                    <option>Regulatory/Import Delay</option>
                    <option>Operational Constraint</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button onClick={() => setShowExtendTAT(false)} className="px-5 py-2 text-slate-500 hover:bg-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">Cancel</button>
                <button
                  onClick={handleExtendTAT}
                  disabled={!remarks || !revisedDate}
                  className="px-6 py-2 bg-amber-600 text-white rounded-xl hover:bg-amber-700 text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-amber-200 disabled:opacity-50"
                >
                  Confirm Revised SLA
                </button>
              </div>
            </div>
          );
        }
        return (
          <div className="w-full space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5" /> Delivery Address Decision
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {['Sub Store', 'Central Store'].map(loc => (
                    <button
                      key={loc}
                      onClick={() => setDeliveryLoc(loc)}
                      className={`flex items-center justify-center p-3 rounded-xl border-2 transition-all gap-2 ${deliveryLoc === loc ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-300'}`}
                    >
                      <span className="text-[10px] font-black uppercase tracking-tighter">{loc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5" /> Mission Priority Allocation
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {(['Emergency', 'High', 'Medium', 'Normal'] as Priority[]).map(p => (
                    <button
                      key={p}
                      onClick={() => setSelectedPriority(p)}
                      className={`px-2 py-2 rounded-lg text-[9px] font-black uppercase border-2 transition-all ${selectedPriority === p ? 'bg-slate-800 border-slate-800 text-white' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'}`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                  Evaluation & Sourcing
                </h4>
                <button
                  onClick={() => setIsQuotationAttached(true)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${isQuotationAttached ? 'bg-emerald-50 border-emerald-500 text-emerald-600' : 'bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100'}`}
                >
                  <Paperclip className="w-4 h-4" />
                  {isQuotationAttached ? 'Quotation Verified' : 'Attach Quotation'}
                </button>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {[
                  { id: 1, name: 'MedSupply Co.', price: 4500, days: 2, compliance: 'Compliant' },
                  { id: 2, name: 'Global Health', price: 4200, days: 5, compliance: 'Pending' },
                  { id: 3, name: 'FastCare Inc.', price: 5100, days: 1, compliance: 'Compliant' }
                ].map(v => (
                  <div key={v.id} onClick={() => setSelectedVendor(v.id)} className={`relative p-4 border-2 rounded-2xl cursor-pointer transition-all ${selectedVendor === v.id ? 'border-blue-600 bg-blue-50/50' : 'border-slate-100 bg-slate-50/30 hover:border-blue-200'}`}>
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-black text-xs text-slate-900 uppercase">{v.name}</p>
                      <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase ${v.compliance === 'Compliant' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        {v.compliance}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-bold">AED {v.price}</p>
                    <p className="text-[10px] text-slate-400 font-medium">Delivery: {v.days} Working Days</p>
                    {selectedVendor === v.id && (
                      <div className="absolute -top-2 -right-2 bg-blue-600 text-white rounded-full p-1 shadow-md">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl">
              <button onClick={() => setShowExtendTAT(true)} className="flex items-center gap-2 text-amber-600 hover:text-amber-700 text-[10px] font-black uppercase tracking-widest transition-all">
                <AlertTriangle className="w-4 h-4" /> Exceptional TAT Extension
              </button>

              <div className="flex gap-3">
                <button
                  disabled={!selectedVendor || !isQuotationAttached || !deliveryLoc}
                  onClick={() => handleAction('Pending - SMD', { vendor: 'Selected Vendor', price: 4500 })}
                  className="px-8 py-3 bg-blue-700 text-white rounded-xl hover:bg-blue-800 text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-200 transition-all disabled:opacity-50 disabled:grayscale"
                >
                  Authorize Sourcing & Forward to SMD
                </button>
              </div>
            </div>
          </div>
        );

      case 'SMD':
        if (showBreachHandling) {
          return (
            <div className="w-full space-y-4 bg-rose-50 p-6 rounded-2xl border border-rose-200 animate-in slide-in-from-right duration-300">
              <h4 className="text-xs font-black text-rose-800 uppercase tracking-widest flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> Mandatory SLA Breach Justification
              </h4>
              <div className="space-y-4">
                <textarea
                  placeholder="Provide mandatory reason for internal SLA delay..."
                  className="w-full border border-rose-200 rounded-xl p-3 text-sm focus:ring-4 focus:ring-rose-500/10 outline-none bg-white font-medium h-20"
                  value={delayReason}
                  onChange={e => setDelayReason(e.target.value)}
                />
                <div className="flex justify-end gap-3">
                  <button onClick={() => setShowBreachHandling(false)} className="px-5 py-2 text-slate-500 font-bold uppercase text-[10px]">Cancel</button>
                  <button
                    onClick={() => handleAction('Pending - Finance')}
                    disabled={!delayReason}
                    className="px-6 py-2 bg-rose-600 text-white rounded-xl hover:bg-rose-700 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-rose-200 transition-all disabled:opacity-50"
                  >
                    Authenticate with Governance Remarks
                  </button>
                </div>
              </div>
            </div>
          );
        }
        return (
          <div className="flex flex-col gap-6 w-full">
            {isSMDBreach && (
              <div className="flex items-center gap-3 bg-rose-600 text-white p-4 rounded-xl animate-pulse shadow-lg shadow-rose-200 border-2 border-rose-400">
                <Clock className="w-6 h-6 shrink-0" />
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest">SLA Violation Alert</p>
                  <p className="text-xs font-bold leading-tight">Internal SMD action threshold (4h-3d) has been breached. Mandatory delay remarks required for approval.</p>
                </div>
              </div>
            )}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowRejectReason(true)}
                className="px-6 py-2 border border-rose-200 text-rose-600 rounded-lg hover:bg-rose-50 text-xs font-black uppercase tracking-widest transition-all"
              >
                Reject Request
              </button>
              <button
                onClick={() => handleAction('Pending - Finance')}
                className="px-8 py-2 bg-slate-900 text-white rounded-lg hover:bg-black text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-slate-200 border-2 border-slate-800"
              >
                Final Executive Approval
              </button>
            </div>
          </div>
        );

      case 'Finance':
        const budget = useProcurement().getDeptBudget(pr.department);
        const remaining = budget.approved - budget.consumed;
        const budgetPct = (budget.consumed / budget.approved) * 100;

        return (
          <div className="w-full space-y-6">
            <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl border border-slate-800 relative overflow-hidden">
              <div className="relative z-10">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-500" /> Departmental Budget Consumption
                </h4>
                <div className="grid grid-cols-3 gap-8">
                  <div>
                    <p className="text-[9px] font-black text-slate-500 uppercase">Approved Budget</p>
                    <p className="text-xl font-black text-slate-100 uppercase tracking-tight">AED {budget.approved.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-500 uppercase">Consumed MTD</p>
                    <p className="text-xl font-black text-emerald-400 uppercase tracking-tight">AED {budget.consumed.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-500 uppercase">Remaining Cap</p>
                    <p className={`text-xl font-black uppercase tracking-tight ${remaining < 50000 ? 'text-rose-400' : 'text-blue-400'}`}>AED {remaining.toLocaleString()}</p>
                  </div>
                </div>
                <div className="mt-6 h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div style={{ width: `${budgetPct}%` }} className={`h-full transition-all duration-1000 ${budgetPct > 90 ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]' : 'bg-emerald-500'}`}></div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase mb-1.5 ml-1">Payment Mode Decision</label>
                  <select
                    className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-4 focus:ring-blue-500/10 outline-none bg-white font-bold"
                    value={extraFormData.paymentMode}
                    onChange={e => setExtraFormData({ ...extraFormData, paymentMode: e.target.value })}
                  >
                    <option>Bank Transfer</option>
                    <option>Corporate Cheque</option>
                    <option>Electronic Fund Transfer (EFT)</option>
                    <option>Letter of Credit (LC)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase mb-1.5 ml-1">Payment Release Timeline (Days)</label>
                  <input
                    type="number"
                    placeholder="e.g. 30"
                    className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-4 focus:ring-blue-500/10 outline-none bg-white font-bold"
                    value={extraFormData.timeline}
                    onChange={e => setExtraFormData({ ...extraFormData, timeline: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase mb-1.5 ml-1">Payment Schedule / Structure</label>
                  <select
                    className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-4 focus:ring-blue-500/10 outline-none bg-white font-bold"
                    value={extraFormData.structure}
                    onChange={e => setExtraFormData({ ...extraFormData, structure: e.target.value })}
                  >
                    <option value="100% Advance">100% Advance Payment</option>
                    <option value="50/50">50% Advance / 50% Post-Delivery</option>
                    <option value="On Delivery">Payment on Final Delivery</option>
                    <option value="Terms">30 Days Post Invoice</option>
                    <option value="Milestone">Milestone Based Scheduling</option>
                  </select>
                </div>
                <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-5 h-5 rounded border-blue-300 text-blue-600 focus:ring-blue-500"
                      checked={extraFormData.ack}
                      onChange={e => setExtraFormData({ ...extraFormData, ack: e.target.checked })}
                    />
                    <span className="text-[10px] font-black text-blue-800 uppercase leading-tight">I acknowledge vendor payment terms & compliance documents</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                disabled={!extraFormData.ack || !extraFormData.timeline}
                onClick={() => handleAction('PO Issued', {
                  paymentStructure: extraFormData.structure,
                  paymentReleaseTimeline: parseInt(extraFormData.timeline),
                  vendorAcknowledgment: extraFormData.ack,
                  paymentStatus: 'Scheduled'
                })}
                className="px-10 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 text-[10px] font-black uppercase tracking-widest shadow-xl shadow-emerald-200 transition-all disabled:opacity-50"
              >
                Authorize Payment Execution & Issue PO
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  // Success overlay screen
  if (successState) {
    return (
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-10 flex flex-col items-center text-center animate-in zoom-in-95 duration-300">
          <div className="w-20 h-20 rounded-full bg-emerald-50 border-4 border-emerald-500 flex items-center justify-center mb-6 shadow-xl shadow-emerald-100">
            <Check className="w-10 h-10 text-emerald-500" />
          </div>
          <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-2">{successState.message}</h3>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-5">PR {pr.id} has been routed to</p>
          <div className="bg-blue-50 border border-blue-100 rounded-2xl px-6 py-4 mb-8 w-full">
            <p className="text-sm font-black text-blue-700 uppercase tracking-tight">{successState.destination}</p>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1 overflow-hidden">
            <div className="h-full bg-emerald-500 animate-[shrink_2.5s_linear_forwards]" style={{ width: '100%', animation: 'progress-shrink 2.5s linear forwards' }} />
          </div>
          <p className="text-[9px] font-bold text-slate-300 uppercase mt-3">Closing automatically…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-slate-100 sticky top-0 bg-white z-20">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${pr.status.includes('Rejected') ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600'}`}>
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                {pr.id} {pr.isLocked && <Lock className="w-5 h-5 text-slate-400" />}
              </h2>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{pr.requester} • {pr.department}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {pr.status !== 'Closed - Completed' && <SLATimer deadline={pr.slaDeadline} />}
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>
        </div>

        <div className="p-8 flex-1 overflow-y-auto space-y-10">
          <TimelineStepper currentStatus={pr.status} />

          {/* Dispatch Tracking Section */}
          {(pr.dispatchDate || pr.expectedDeliveryDate) && (
            <div className="bg-blue-50/30 p-5 rounded-2xl border border-blue-100/50 grid grid-cols-3 gap-6">
              <div>
                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Dispatch Date</p>
                <p className="text-sm font-bold text-slate-700">{pr.dispatchDate ? new Date(pr.dispatchDate).toLocaleDateString() : 'Pending'}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Expected Delivery</p>
                <p className="text-sm font-bold text-slate-700">{pr.expectedDeliveryDate ? new Date(pr.expectedDeliveryDate).toLocaleDateString() : 'N/A'}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Actual Delivery</p>
                <p className={`text-sm font-black ${pr.actualDeliveryDate ? 'text-emerald-600' : 'text-slate-300'}`}>
                  {pr.actualDeliveryDate ? new Date(pr.actualDeliveryDate).toLocaleDateString() : 'Awaiting Receipt'}
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-8">
            <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100 shadow-sm">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-100 pb-2">Technical Specifications</h3>
              <dl className="space-y-4 text-sm">
                <div className="flex justify-between items-center group">
                  <dt className="text-slate-400 font-bold uppercase text-[10px] tracking-tighter">Material Description</dt>
                  <dd className="font-black text-slate-800 uppercase">{pr.itemName || pr.category}</dd>
                </div>
                <div className="flex justify-between items-center group">
                  <dt className="text-slate-400 font-bold uppercase text-[10px] tracking-tighter">Segment</dt>
                  <dd className="font-bold text-slate-600">{pr.category}</dd>
                </div>
                <div className="flex justify-between items-center group">
                  <dt className="text-slate-400 font-bold uppercase text-[10px] tracking-tighter">Priority (SLA Base)</dt>
                  <dd className="font-black text-slate-800 uppercase">{pr.priority}</dd>
                </div>
                {pr.deliveryLocation && (
                  <div className="flex justify-between items-center group">
                    <dt className="text-slate-400 font-bold uppercase text-[10px] tracking-tighter">Delivery Target</dt>
                    <dd className="font-black text-blue-600 uppercase flex items-center gap-1.5"><MapPin className="w-3 h-3" /> {pr.deliveryLocation}</dd>
                  </div>
                )}
                <div className="flex justify-between items-center group">
                  <dt className="text-slate-400 font-bold uppercase text-[10px] tracking-tighter">Quantum Required</dt>
                  <dd className="font-black text-blue-600">{pr.quantity} UNITS</dd>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                  <dt className="text-slate-400 font-bold uppercase text-[10px] tracking-tighter">Mission Priority</dt>
                  <dd>
                    <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider shadow-sm ${pr.priority === 'Emergency' ? 'bg-rose-500 text-white' :
                      pr.priority === 'High' ? 'bg-amber-400 text-slate-900' :
                        'bg-blue-500 text-white'
                      }`}>{pr.priority}</span>
                  </dd>
                </div>
              </dl>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-md">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center justify-between">
                <span>Transactional History</span>
                <Clock className="w-3 h-3" />
              </h3>
              <div className="space-y-6 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                {pr.history.map((h, i) => (
                  <div key={h.id} className="flex gap-4 text-sm relative">
                    {i !== pr.history.length - 1 && <div className="absolute left-[11px] top-7 bottom-[-24px] w-[1px] bg-slate-100"></div>}
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 shadow-sm ${h.action.includes('Rejected') ? 'bg-rose-500 text-white' : h.action === 'Re-submitted' ? 'bg-amber-500 text-white' : 'bg-emerald-500 text-white'
                      }`}>
                      {h.action.includes('Rejected') ? <Ban className="w-3 h-3" /> : <Check className="w-3 h-3" />}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex justify-between items-start">
                        <p className="font-black text-slate-800 text-xs uppercase tracking-tight">{h.stage} • {h.action}</p>
                        <span className="text-[9px] font-bold text-slate-300 uppercase">{new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-bold mt-0.5 uppercase tracking-tighter">{h.userRole} at {new Date(h.timestamp).toLocaleDateString()}</p>
                      {h.rejectionReason && (
                        <p className="text-[10px] font-black text-rose-600 mt-2 bg-rose-50 p-2 rounded-lg border border-rose-100 uppercase tracking-tight italic">
                          Reason: {h.rejectionReason}
                        </p>
                      )}
                      {(h.userRole === 'SMD' && pr.delayReason) && (
                        <p className="text-[9px] font-black text-rose-500 mt-1 uppercase">Governance Delay Justification: {pr.delayReason}</p>
                      )}
                      {h.notes && <p className="text-xs text-slate-500 mt-2 bg-slate-50 p-3 rounded-lg border border-slate-100 leading-relaxed">{h.notes}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {pr.status !== 'Closed - Completed' && (
          <div className="p-8 border-t border-slate-100 bg-slate-50/80 flex justify-end gap-3">
            {showRejectReason ? (
              <div className="w-full space-y-4 animate-in slide-in-from-right duration-300">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Rejection Category</label>
                    <select
                      className="w-full border border-rose-200 rounded-xl p-3 text-sm outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 transition-all cursor-pointer bg-white font-bold text-rose-700"
                      value={selectedReason}
                      onChange={e => setSelectedReason(e.target.value)}
                    >
                      {REJECTION_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Detailed Remarks</label>
                    <input
                      type="text"
                      placeholder="Provide specific internal notes..."
                      className="w-full border border-rose-200 rounded-xl p-3 text-sm outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 transition-all bg-white"
                      value={remarks}
                      onChange={e => setRemarks(e.target.value)}
                      autoFocus
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <button onClick={() => { setShowRejectReason(false); setRemarks(''); }} className="px-6 py-2.5 text-slate-500 hover:bg-white rounded-xl text-xs font-black uppercase tracking-widest transition-all">Cancel</button>
                  <button onClick={() => handleAction('Rejected - Action Required', { rejectionReason: selectedReason })} className="px-8 py-2.5 bg-rose-600 text-white rounded-xl hover:bg-rose-700 text-xs font-black uppercase tracking-widest shadow-lg shadow-rose-200 transition-all">Confirm System Rejection</button>
                </div>
              </div>
            ) : (
              renderActionButtons()
            )}
          </div>
        )}
      </div>
    </div>
  );
};
