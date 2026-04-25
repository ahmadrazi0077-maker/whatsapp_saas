'use client';

import React, { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  deviceId: string | null;
}

export default function QRCodeModal({ isOpen, onClose, deviceId }: QRCodeModalProps) {
  const [qrCode, setQrCode] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && deviceId) {
      fetchQRCode();
      const interval = setInterval(fetchQRCode, 5000);
      return () => clearInterval(interval);
    }
  }, [isOpen, deviceId]);

  const fetchQRCode = async () => {
    try {
      const response = await fetch(`/api/whatsapp/qr/${deviceId}`);
      const data = await response.json();
      if (data.qrCode) {
        setQrCode(data.qrCode);
      }
    } catch (error) {
      console.error('Failed to fetch QR code:', error);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex justify-between items-center mb-4">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                    Scan QR Code
                  </Dialog.Title>
                  <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
                
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-4">
                    Open WhatsApp on your phone → Settings → Linked Devices → Link a Device
                  </p>
                  
                  {qrCode ? (
                    <div className="flex justify-center">
                      <img src={qrCode} alt="QR Code" className="w-64 h-64" />
                    </div>
                  ) : (
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                  )}
                  
                  <p className="text-xs text-gray-400 mt-4">
                    Waiting for connection... This may take a few moments
                  </p>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
