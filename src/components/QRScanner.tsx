'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from "html5-qrcode";
import { Button } from "@/components/ui/button"
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const qrcodeRegionId = "html5qr-code-full-region";

const QRScanner: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const router = useRouter();
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    if (open) {
      const initializeScanner = () => {
        if (!scannerRef.current && document.getElementById(qrcodeRegionId)) {
          scannerRef.current = new Html5QrcodeScanner(
            qrcodeRegionId,
            { 
              fps: 5, 
              qrbox: { width: 150, height: 150 },
              aspectRatio: 1,
            },
            false
          );
          scannerRef.current.render(onScanSuccess, onScanFailure);
        }
      };

      setTimeout(initializeScanner, 100);
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(error => {
          console.error("Failed to clear html5QrcodeScanner. ", error);
        });
        scannerRef.current = null;
      }
    };
  }, [open]);

  const onScanSuccess = (decodedText: string, decodedResult: any) => {
    console.log(`Code matched = ${decodedText}`, decodedResult);
    setIsScanning(true);
    router.push(`/claim?id=${decodedText}`);
  };

  const onScanFailure = (error: any) => {
    // console.warn(`Code scan error = ${error}`);
  };

  return (
    <>
      <Button onClick={() => setOpen(true)} className="w-full">Scan QR Code</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[90vw] sm:min-h-[90vh] md:max-w-[600px] md:max-h-[90vh] bg-white overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-gray-900 text-xl font-bold">Scan QR Code</DialogTitle>
            <DialogClose className="text-gray-700 hover:text-gray-900" />
          </DialogHeader>
          <div className="flex flex-col items-center justify-center h-full">
            {isScanning ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gray-900"></div>
              <p className="mt-4 text-sm text-gray-600">Scanning...</p>
            </div>
            ) : (
                <>
                    <div id={qrcodeRegionId} className="w-full max-w-[300px] h-[300px] sm:h-[400px] overflow-hidden text-gray-900 rounded-xl"></div>
                    <p className="mt-4 text-sm text-gray-600">Position the QR code within the frame to scan</p>
                </>
            )}
            
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default QRScanner;