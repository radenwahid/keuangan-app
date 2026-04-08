'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

interface Props {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open, title, message,
  confirmLabel = 'Hapus',
  cancelLabel = 'Batal',
  danger = true,
  onConfirm, onCancel,
}: Props) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onCancel}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.88, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.88, y: 16 }}
            transition={{ type: 'spring', damping: 22, stiffness: 320 }}
            className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 z-10"
          >
            {/* Icon */}
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 ${danger ? 'bg-red-100' : 'bg-amber-100'}`}>
              <AlertTriangle size={28} className={danger ? 'text-red-500' : 'text-amber-500'} />
            </div>

            {/* Text */}
            <h3 className="text-base font-bold text-gray-800 text-center mb-2">{title}</h3>
            <p className="text-sm text-gray-500 text-center leading-relaxed">{message}</p>

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={onCancel}
                className="flex-1 py-2.5 rounded-full border border-pink-200 text-pink-500 text-sm font-medium hover:bg-pink-50 transition-colors"
              >
                {cancelLabel}
              </button>
              <button
                onClick={onConfirm}
                className={`flex-1 py-2.5 rounded-full text-white text-sm font-medium shadow-md transition-colors ${
                  danger
                    ? 'bg-gradient-to-r from-red-500 to-rose-500 shadow-red-200 hover:from-red-600 hover:to-rose-600'
                    : 'bg-gradient-to-r from-amber-500 to-orange-500 shadow-amber-200'
                }`}
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
