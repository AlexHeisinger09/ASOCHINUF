import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { API_ENDPOINTS } from '../../config/apiConfig';
import { toast } from 'sonner';

const CreateCuotaModal = ({ isOpen, onClose, onSuccess }) => {
  const { isDarkMode, token, usuario } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    mes: new Date().getMonth() + 1,
    ano: new Date().getFullYear(),
    monto: '',
    fechaVencimiento: '',
    descripcion: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validar
    if (!formData.monto || !formData.fechaVencimiento) {
      setError('Por favor completa todos los campos requeridos');
      return;
    }

    try {
      setSubmitting(true);
      const config = { headers: { Authorization: `Bearer ${token}` } };
      // Cuota global - se asigna automáticamente a todos los usuarios
      await axios.post(API_ENDPOINTS.CUOTAS.CREATE, {
        mes: parseInt(formData.mes),
        ano: parseInt(formData.ano),
        monto: parseFloat(formData.monto),
        fechaVencimiento: formData.fechaVencimiento,
        descripcion: formData.descripcion
      }, config);

      toast.success('Cuota creada y asignada a todos los usuarios exitosamente');
      onSuccess();
      // Reset form
      setFormData({
        mes: new Date().getMonth() + 1,
        ano: new Date().getFullYear(),
        monto: '',
        fechaVencimiento: '',
        descripcion: ''
      });
    } catch (err) {
      console.error('Error al crear cuota:', err);
      setError(err.response?.data?.error || 'Error al crear cuota');
    } finally {
      setSubmitting(false);
    }
  };

  const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />

          {/* Container centrado - ESTRUCTURA CORRECTA */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`w-full max-w-md rounded-2xl shadow-2xl border ${
                isDarkMode
                  ? 'bg-[#1a1c22] border-[#8c5cff]/20'
                  : 'bg-white border-purple-200'
              }`}
            >
              {/* Header */}
              <div className={`flex items-center justify-between p-6 border-b ${
                isDarkMode ? 'border-[#8c5cff]/20' : 'border-purple-200'
              }`}>
                <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Nueva Cuota
                </h2>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  type="button"
                  className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-[#8c5cff]/20' : 'hover:bg-purple-100'}`}
                >
                  <X size={20} className={isDarkMode ? 'text-gray-400' : 'text-gray-600'} />
                </motion.button>
              </div>

              {/* Body */}
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className={`p-4 rounded-lg border-l-4 border-red-500 flex gap-3 ${
                  isDarkMode ? 'bg-red-500/10' : 'bg-red-50'
                }`}>
                  <AlertCircle size={20} className="text-red-500 flex-shrink-0" />
                  <p className={isDarkMode ? 'text-red-400 text-sm' : 'text-red-700 text-sm'}>{error}</p>
                </div>
              )}

              {/* Mes y Año */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Mes
                  </label>
                  <select
                    name="mes"
                    value={formData.mes}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDarkMode
                        ? 'bg-[#0f1117] border-[#8c5cff]/20 text-white'
                        : 'bg-gray-50 border-purple-200 text-gray-900'
                    } focus:outline-none focus:border-[#8c5cff]`}
                  >
                    {meses.map((mes, idx) => (
                      <option key={idx} value={idx + 1}>{mes}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-semibold mb-2 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Año
                  </label>
                  <select
                    name="ano"
                    value={formData.ano}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDarkMode
                        ? 'bg-[#0f1117] border-[#8c5cff]/20 text-white'
                        : 'bg-gray-50 border-purple-200 text-gray-900'
                    } focus:outline-none focus:border-[#8c5cff]`}
                  >
                    {[2024, 2025, 2026].map(ano => (
                      <option key={ano} value={ano}>{ano}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Monto */}
              <div>
                <label className={`block text-sm font-semibold mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Monto (CLP)
                </label>
                <input
                  type="number"
                  name="monto"
                  value={formData.monto}
                  onChange={handleChange}
                  placeholder="Ej: 50000"
                  step="1000"
                  min="0"
                  required
                  className={`w-full px-4 py-2 rounded-lg border ${
                    isDarkMode
                      ? 'bg-[#0f1117] border-[#8c5cff]/20 text-white'
                      : 'bg-gray-50 border-purple-200 text-gray-900'
                  } focus:outline-none focus:border-[#8c5cff]`}
                />
              </div>

              {/* Fecha Vencimiento */}
              <div>
                <label className={`block text-sm font-semibold mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Fecha de Vencimiento
                </label>
                <input
                  type="date"
                  name="fechaVencimiento"
                  value={formData.fechaVencimiento}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-2 rounded-lg border ${
                    isDarkMode
                      ? 'bg-[#0f1117] border-[#8c5cff]/20 text-white'
                      : 'bg-gray-50 border-purple-200 text-gray-900'
                  } focus:outline-none focus:border-[#8c5cff]`}
                />
              </div>

              {/* Descripción */}
              <div>
                <label className={`block text-sm font-semibold mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Descripción (opcional)
                </label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange}
                  placeholder="Notas sobre esta cuota"
                  rows="3"
                  className={`w-full px-4 py-2 rounded-lg border ${
                    isDarkMode
                      ? 'bg-[#0f1117] border-[#8c5cff]/20 text-white'
                      : 'bg-gray-50 border-purple-200 text-gray-900'
                  } focus:outline-none focus:border-[#8c5cff]`}
                />
              </div>

              {/* Botones */}
              <div className="flex gap-3 pt-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={onClose}
                  className={`flex-1 px-4 py-2 rounded-lg border font-semibold transition-colors ${
                    isDarkMode
                      ? 'border-[#8c5cff]/20 text-gray-300 hover:bg-[#8c5cff]/10'
                      : 'border-purple-200 text-gray-700 hover:bg-purple-50'
                  }`}
                >
                  Cancelar
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={submitting}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold text-white ${
                    submitting
                      ? 'bg-[#8c5cff]/50 cursor-not-allowed'
                      : 'bg-[#8c5cff] hover:bg-[#7a4cde]'
                  }`}
                >
                  {submitting ? (
                    <>
                      <Loader size={18} className="animate-spin" />
                      Creando...
                    </>
                  ) : (
                    'Crear Cuota'
                  )}
                </motion.button>
              </div>
            </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CreateCuotaModal;
