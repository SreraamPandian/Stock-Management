import React, { useState } from 'react';
import { ScanLine, CheckCircle2 } from 'lucide-react';

export const BarcodeScanner = ({ onScan }: { onScan: (code: string) => void }) => {
  const [scannedCode, setScannedCode] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  const handleScan = () => {
    setIsScanning(true);
    // Simulate network/scan delay
    setTimeout(() => {
      const code = Math.floor(100000000000 + Math.random() * 900000000000).toString();
      setScannedCode(code);
      setIsScanning(false);
      onScan(code);
    }, 800);
  };

  return (
    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-md ${scannedCode ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>
          {scannedCode ? <CheckCircle2 className="w-6 h-6" /> : <ScanLine className="w-6 h-6" />}
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-700">Barcode Scanner Simulator</p>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            {scannedCode ? `Scanned: ${scannedCode}` : 'Ready to scan item...'}
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={handleScan}
        disabled={isScanning}
        className="px-4 py-2 bg-white border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-all"
      >
        {isScanning ? 'Scanning...' : 'Simulate Scan'}
      </button>
    </div>
  );
};
