import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { API_ENDPOINTS } from '../../config/apiConfig';
import { toast } from 'sonner';
import PaymentModal from './PaymentModal';

const MyQuotasSection = ({ containerVariants }) => {
  const { isDarkMode, token, usuario } = useAuth();
  const [cuotas, setCuotas] = useState([]);
  const [todasLasCuotas, setTodasLasCuotas] = useState([]); // Para admin: todas las cuotas del sistema
  const [loading, setLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [cuotaPagando, setCuotaPagando] = useState(null);
  const isAdmin = usuario?.tipo_perfil === 'admin';

  const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  // Cargar cuotas del usuario actual
  useEffect(() => {
    cargarCuotas();
  }, [token]);

  const cargarCuotas = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${token}` } };

      // Cargar cuotas del usuario actual
      const response = await axios.get(API_ENDPOINTS.CUOTAS.GET_ALL, config);
      setCuotas(response.data);

      // Si es admin, también cargar TODAS las cuotas del sistema
      if (isAdmin) {
        try {
          // Obtener todas las cuotas (endpoint que retorna todas sin filtro)
          const allQuotasResponse = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/cuotas?all=true`, config);
          setTodasLasCuotas(allQuotasResponse.data || response.data);
        } catch (err) {
          // Si falla, usar las mismas cuotas del usuario (fallback)
          setTodasLasCuotas(response.data);
        }
      }
    } catch (err) {
      console.error('Error al cargar cuotas:', err);
      toast.error('Error al cargar las cuotas');
    } finally {
      setLoading(false);
    }
  };

  const formatFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'short',
      day: '2-digit'
    });
  };

  const getEstadoColor = (estado) => {
    switch(estado) {
      case 'pagado':
        return 'bg-green-500/10 text-green-600 border-green-200';
      case 'pendiente':
        return 'bg-yellow-500/10 text-yellow-600 border-yellow-200';
      case 'vencido':
        return 'bg-red-500/10 text-red-600 border-red-200';
      default:
        return 'bg-gray-500/10 text-gray-600 border-gray-200';
    }
  };

  const getEstadoLabel = (estado) => {
    switch(estado) {
      case 'pagado':
        return 'Pagada';
      case 'pendiente':
        return 'Pendiente';
      case 'vencido':
        return 'Vencida';
      default:
        return estado;
    }
  };

  const getEstadoIcon = (estado) => {
    switch(estado) {
      case 'pagado':
        return <CheckCircle size={20} className="text-green-600" />;
      case 'vencido':
        return <AlertCircle size={20} className="text-red-600" />;
      case 'pendiente':
        return <Clock size={20} className="text-yellow-600" />;
      default:
        return null;
    }
  };

  const handlePagarClick = (cuota) => {
    setCuotaPagando(cuota);
    setShowPaymentModal(true);
  };

  const cuotasPendientes = cuotas.filter(c => c.estado !== 'pagado');
  const cuotasPagadas = cuotas.filter(c => c.estado === 'pagado');

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={containerVariants}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <DollarSign size={32} className="text-[#8c5cff]" />
        <div>
          <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Mis Cuotas
          </h1>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Gestiona tus cuotas mensuales y realiza pagos
          </p>
        </div>
      </div>

      {loading ? (
        <div className={`flex justify-center items-center py-12 ${isDarkMode ? 'bg-[#1a1c22]' : 'bg-white'} rounded-xl`}>
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8c5cff]"></div>
        </div>
      ) : (
        <>
          {/* Cuotas Pendientes */}
          <div>
            <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Cuotas Pendientes ({cuotasPendientes.length})
            </h2>
            {cuotasPendientes.length === 0 ? (
              <div className={`p-8 rounded-xl border-2 border-dashed text-center ${
                isDarkMode ? 'bg-[#1a1c22] border-[#8c5cff]/20 text-gray-400' : 'bg-purple-50 border-purple-200 text-gray-600'
              }`}>
                <CheckCircle size={48} className="mx-auto mb-4 opacity-50" />
                <p>¡No tienes cuotas pendientes!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {cuotasPendientes.map((cuota, idx) => (
                  <motion.div
                    key={cuota.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className={`p-6 rounded-xl border ${
                      isDarkMode
                        ? 'bg-[#1a1c22] border-[#8c5cff]/20'
                        : 'bg-white border-purple-200'
                    } hover:shadow-lg transition-shadow`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {meses[cuota.mes - 1]} {cuota.ano}
                        </h3>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Vencimiento: {formatFecha(cuota.fecha_vencimiento)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getEstadoIcon(cuota.estado)}
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getEstadoColor(cuota.estado)}`}>
                          {getEstadoLabel(cuota.estado)}
                        </span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className={`text-2xl font-bold ${isDarkMode ? 'text-[#8c5cff]' : 'text-purple-600'}`}>
                        CLP ${cuota.monto.toLocaleString('es-CL')}
                      </p>
                    </div>

                    {cuota.descripcion && (
                      <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {cuota.descripcion}
                      </p>
                    )}

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handlePagarClick(cuota)}
                      className={`w-full py-2 rounded-lg font-semibold text-white transition-colors ${
                        isDarkMode
                          ? 'bg-[#8c5cff] hover:bg-[#7a4cde]'
                          : 'bg-purple-600 hover:bg-purple-700'
                      }`}
                    >
                      Pagar Ahora
                    </motion.button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Cuotas Pagadas */}
          {cuotasPagadas.length > 0 && (
            <div>
              <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Cuotas Pagadas ({cuotasPagadas.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {cuotasPagadas.map((cuota, idx) => (
                  <motion.div
                    key={cuota.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className={`p-6 rounded-xl border opacity-75 ${
                      isDarkMode
                        ? 'bg-[#1a1c22] border-green-500/20'
                        : 'bg-white border-green-200'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {meses[cuota.mes - 1]} {cuota.ano}
                        </h3>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Pagada el: {cuota.fecha_pago ? formatFecha(cuota.fecha_pago) : 'N/A'}
                        </p>
                      </div>
                      <CheckCircle size={24} className="text-green-600" />
                    </div>

                    <div className="mb-4">
                      <p className={`text-2xl font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                        CLP ${cuota.monto.toLocaleString('es-CL')}
                      </p>
                    </div>

                    {cuota.descripcion && (
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {cuota.descripcion}
                      </p>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        cuota={cuotaPagando}
        onClose={() => {
          setShowPaymentModal(false);
          setCuotaPagando(null);
        }}
        onSuccess={() => {
          setShowPaymentModal(false);
          setCuotaPagando(null);
          cargarCuotas();
        }}
      />
    </motion.div>
  );
};

export default MyQuotasSection;
