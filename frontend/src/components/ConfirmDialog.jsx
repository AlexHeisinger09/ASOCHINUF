import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ConfirmDialog = ({ isOpen, title, message, onConfirm, onCancel, confirmText = 'Confirmar', cancelText = 'Cancelar', isDanger = false }) => {
  const { isDarkMode } = useAuth();

  const dialogVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.2 },
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      transition: { duration: 0.15 },
    },
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onCancel}
            className="fixed inset-0 bg-black/50 z-40"
          />

          {/* Dialog */}
          <motion.div
            variants={dialogVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className={`w-full max-w-md rounded-2xl shadow-2xl ${
                isDarkMode
                  ? 'bg-[#1a1c22] border border-[#8c5cff]/20'
                  : 'bg-white border border-purple-200'
              }`}
            >
              {/* Content */}
              <div className="p-6 space-y-4">
                {/* Icon and Title */}
                <div className="flex items-start gap-4">
                  <div
                    className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                      isDanger
                        ? isDarkMode
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-red-100 text-red-600'
                        : isDarkMode
                        ? 'bg-[#8c5cff]/20 text-[#8c5cff]'
                        : 'bg-purple-100 text-purple-600'
                    }`}
                  >
                    <AlertCircle size={24} />
                  </div>
                  <div>
                    <h2 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {title}
                    </h2>
                    <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {message}
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div
                className={`flex gap-3 p-6 border-t ${
                  isDarkMode ? 'border-[#8c5cff]/20' : 'border-purple-200'
                }`}
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onCancel}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all flex-1 ${
                    isDarkMode
                      ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  <X size={18} />
                  {cancelText}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onConfirm}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all flex-1 ${
                    isDanger
                      ? isDarkMode
                        ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/50'
                        : 'bg-red-100 text-red-600 hover:bg-red-200 border border-red-300'
                      : isDarkMode
                      ? 'bg-gradient-to-r from-[#8c5cff] to-[#6a3dcf] text-white hover:shadow-lg'
                      : 'bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:shadow-lg'
                  }`}
                >
                  <Check size={18} />
                  {confirmText}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ConfirmDialog;
