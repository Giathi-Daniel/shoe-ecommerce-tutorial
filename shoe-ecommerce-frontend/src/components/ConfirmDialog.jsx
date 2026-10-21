import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';

export default function ConfirmDialog({ open, title, children, confirmLabel = 'Confirm', danger = false, busy = false, onConfirm, onClose }) {
  return (
    <Dialog open={open} onClose={onClose} className="relative z-[100]">
      <DialogBackdrop className="fixed inset-0 bg-black/50" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-md rounded-lg bg-white p-6 shadow-pop">
          <DialogTitle className="text-lg font-bold">{title}</DialogTitle>
          <div className="mt-2 text-sm text-[#565959]">{children}</div>
          <div className="mt-6 flex justify-end gap-2">
            <button type="button" onClick={onClose} className="btn-light">Cancel</button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={busy}
              className={danger ? 'btn border-[#b12704] bg-[#cc0c39] text-white hover:bg-[#b12704] hover:text-white' : 'btn-cta'}
            >
              {busy ? 'Please wait...' : confirmLabel}
            </button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
