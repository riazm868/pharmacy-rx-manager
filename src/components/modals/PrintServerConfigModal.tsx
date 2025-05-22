import React from 'react';
import { Dialog } from '@headlessui/react';
import PrintServerConfig from '../print/PrintServerConfig';

interface PrintServerConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PrintServerConfigModal: React.FC<PrintServerConfigModalProps> = ({ isOpen, onClose }) => {
  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="relative z-50"
    >
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      {/* Full-screen container for centering */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-xl rounded bg-white p-6 shadow-xl">
          <Dialog.Title className="text-lg font-medium leading-6 text-gray-900 mb-4">
            Print Server Configuration
          </Dialog.Title>
          
          <PrintServerConfig onClose={onClose} />
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default PrintServerConfigModal;
