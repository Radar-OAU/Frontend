"use client";

import { useState } from 'react';
import { X, Lock, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import { verifyPinLocally, hasPinSet } from '@/lib/pinPrompt';

/**
 * PinPromptModal - Prompt for PIN to authorize sensitive actions
 * 
 * @param {boolean} isOpen - Whether modal is visible
 * @param {function} onClose - Close modal callback
 * @param {function} onSuccess - Callback when PIN is verified (receives pin value)
 * @param {string} action - Description of action requiring PIN (e.g., "withdraw funds")
 * @param {boolean} requireSetup - If true and no PIN exists, show setup flow
 */
export default function PinPromptModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  action = "this action",
  requireSetup = true 
}) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const hasPin = hasPinSet();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Enforce exactly 4 digits
    if (!pin || pin.length !== 4) {
      setError('PIN must be exactly 4 digits');
      return;
    }

    setLoading(true);

    try {
      // Verify PIN locally (IMPORTANT: await the async function)
      const isValid = await verifyPinLocally(pin);
      
      if (isValid) {
        toast.success('PIN verified');
        onSuccess(pin);
        handleClose();
      } else {
        setError('Incorrect PIN. Please try again.');
      }
    } catch (err) {
      setError('Failed to verify PIN');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPin = async () => {
    setLoading(true);
    try {
      await api.post('/forgot-pin/');
      toast.success('PIN reset link sent to your email');
      handleClose();
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setPin('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  // If PIN not set and setup is required, show setup message
  if (!hasPin && requireSetup) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-sm bg-[#0A0A0A] border border-white/10 rounded-xl p-5 shadow-2xl"
        >
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 p-1 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>

          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 bg-rose-500/10 rounded-lg">
              <Lock className="w-5 h-5 text-rose-500" />
            </div>
            <h2 className="text-lg font-bold text-white">PIN Required</h2>
          </div>

          <div className="space-y-3">
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
              <p className="text-xs text-amber-200">
                Set up a PIN to {action}. Your PIN protects sensitive actions.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleClose}
                className="flex-1 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white text-sm font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleClose();
                  window.location.href = '/dashboard/org/settings?tab=security';
                }}
                className="flex-1 px-3 py-2 bg-rose-600 hover:bg-rose-700 rounded-lg text-white text-sm font-semibold transition-colors"
              >
                Set Up PIN
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Normal PIN entry
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-sm bg-[#0A0A0A] border border-white/10 rounded-xl p-5 shadow-2xl"
      >
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 p-1 hover:bg-white/10 rounded-lg transition-colors"
        >
          <X className="w-4 h-4 text-gray-400" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 bg-rose-500/10 rounded-lg">
            <Lock className="w-5 h-5 text-rose-500" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Enter PIN</h2>
            <p className="text-[10px] text-gray-500">To {action}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {error && (
            <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-lg">
              <p className="text-xs text-rose-200">{error}</p>
            </div>
          )}

          <div>
            <input
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength="4"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
              placeholder="4-digit PIN"
              autoFocus
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-center text-xl tracking-widest focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white text-sm font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || pin.length !== 4}
              className="flex-1 px-3 py-2 bg-rose-600 hover:bg-rose-700 rounded-lg text-white text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Verifying...' : 'Confirm'}
            </button>
          </div>

          <button
            type="button"
            onClick={handleForgotPin}
            disabled={loading}
            className="w-full text-xs text-rose-500 hover:text-rose-400 font-medium transition-colors pt-1"
          >
            Forgot PIN?
          </button>
        </form>
      </motion.div>
    </div>
  );
}
