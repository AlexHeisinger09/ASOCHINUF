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
    if (usuario?.id) {
      cargarCuotas();
    }
  }, [token, usuario?.id]);

  const cargarCuotas = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${token}` } };

      // Cargar cuotas - para admin retorna todas, para nutricionista retorna solo las suyas
      const response = await axios.get(API_ENDPOINTS.CUOTAS.GET_ALL, config);

      if (isAdmin) {
        // Para admin, todos los datos retornados son todas las cuotas del sistema
        setTodasLasCuotas(response.data);
        // Filtrar solo las cuotas del usuario actual para la sección "Mis Cuotas"
        const cuotasUsuarioActual = response.data.filter(c => c.usuario_id === usuario.id);
        setCuotas(cuotasUsuarioActual);
      } else {
        // Para nutricionista, simplemente mostrar sus cuotas
        setCuotas(response.data);
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

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={containerVariants}
      className="space-y-6"
    >
      {loading ? (
        <div className={`flex justify-center items-center py-12 ${isDarkMode ? 'bg-[#1a1c22]' : 'bg-white'} rounded-xl`}>
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8c5cff]"></div>
        </div>
      ) : (
        <>
          {/* Tabla de Mis Cuotas */}
          {cuotas.length === 0 ? (
            <div className={`p-8 rounded-xl border-2 border-dashed text-center ${
              isDarkMode ? 'bg-[#1a1c22] border-[#8c5cff]/20 text-gray-400' : 'bg-purple-50 border-purple-200 text-gray-600'
            }`}>
              <CheckCircle size={48} className="mx-auto mb-4 opacity-50" />
              <p>No tienes cuotas asignadas</p>
            </div>
          ) : (
            <div className={`overflow-x-auto rounded-xl border ${
              isDarkMode
                ? 'bg-[#1a1c22] border-[#8c5cff]/20'
                : 'bg-white border-purple-200'
            }`}>
              <table className="w-full">
                <thead>
                  <tr className={`border-b ${
                    isDarkMode ? 'border-[#8c5cff]/20' : 'border-purple-200'
                  }`}>
                    <th className={`px-6 py-4 text-left text-sm font-semibold ${
                      isDarkMode ? 'text-gray-300 bg-[#0f1117]' : 'text-gray-700 bg-purple-50'
                    }`}>
                      Período
                    </th>
                    <th className={`px-6 py-4 text-left text-sm font-semibold ${
                      isDarkMode ? 'text-gray-300 bg-[#0f1117]' : 'text-gray-700 bg-purple-50'
                    }`}>
                      Monto
                    </th>
                    <th className={`px-6 py-4 text-left text-sm font-semibold ${
                      isDarkMode ? 'text-gray-300 bg-[#0f1117]' : 'text-gray-700 bg-purple-50'
                    }`}>
                      Vencimiento
                    </th>
                    <th className={`px-6 py-4 text-left text-sm font-semibold ${
                      isDarkMode ? 'text-gray-300 bg-[#0f1117]' : 'text-gray-700 bg-purple-50'
                    }`}>
                      Estado
                    </th>
                    <th className={`px-6 py-4 text-center text-sm font-semibold ${
                      isDarkMode ? 'text-gray-300 bg-[#0f1117]' : 'text-gray-700 bg-purple-50'
                    }`}>
                      Acción
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {cuotas.map((cuota, idx) => (
                    <tr
                      key={cuota.id}
                      className={`border-b ${
                        idx % 2 === 0
                          ? isDarkMode
                            ? 'bg-[#1a1c22]'
                            : 'bg-white'
                          : isDarkMode
                          ? 'bg-[#0f1117]'
                          : 'bg-purple-50/30'
                      } ${isDarkMode ? 'border-[#8c5cff]/10' : 'border-purple-100'} hover:bg-opacity-75 transition-colors`}
                    >
                      <td className={`px-6 py-4 text-sm font-medium ${
                        isDarkMode ? 'text-gray-200' : 'text-gray-900'
                      }`}>
                        {meses[cuota.mes - 1]} {cuota.ano}
                      </td>
                      <td className={`px-6 py-4 text-sm font-semibold ${
                        isDarkMode ? 'text-[#8c5cff]' : 'text-purple-600'
                      }`}>
                        CLP ${cuota.monto.toLocaleString('es-CL')}
                      </td>
                      <td className={`px-6 py-4 text-sm ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {formatFecha(cuota.fecha_vencimiento)}
                      </td>
                      <td className={`px-6 py-4 text-sm`}>
                        <div className="flex items-center gap-2">
                          {getEstadoIcon(cuota.estado)}
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getEstadoColor(cuota.estado)}`}>
                            {getEstadoLabel(cuota.estado)}
                          </span>
                        </div>
                      </td>
                      <td className={`px-6 py-4 text-sm text-center`}>
                        {cuota.estado !== 'pagado' ? (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handlePagarClick(cuota)}
                            className={`px-4 py-2 rounded-lg font-semibold text-white transition-colors ${
                              isDarkMode
                                ? 'bg-[#8c5cff] hover:bg-[#7a4cde]'
                                : 'bg-purple-600 hover:bg-purple-700'
                            }`}
                          >
                            Pagar
                          </motion.button>
                        ) : (
                          <span className="text-green-600 font-semibold">✓ Pagada</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Tabla de Cuotas para Admin - Vista de todos los usuarios */}
          {isAdmin && todasLasCuotas.length > 0 && (
            <div>
              <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Estado de Cuotas - Todos los Usuarios
              </h2>
              <div className={`overflow-x-auto rounded-xl border ${
                isDarkMode
                  ? 'bg-[#1a1c22] border-[#8c5cff]/20'
                  : 'bg-white border-purple-200'
              }`}>
                <table className="w-full">
                  <thead>
                    <tr className={`border-b ${
                      isDarkMode ? 'border-[#8c5cff]/20' : 'border-purple-200'
                    }`}>
                      <th className={`px-6 py-3 text-left text-sm font-semibold ${
                        isDarkMode ? 'text-gray-300 bg-[#0f1117]' : 'text-gray-700 bg-purple-50'
                      }`}>
                        Usuario
                      </th>
                      {/* Obtener meses/años únicos y ordenados */}
                      {Array.from(
                        new Set(
                          todasLasCuotas.map(c => `${String(c.mes).padStart(2, '0')}/${c.ano}`)
                        )
                      )
                        .sort((a, b) => {
                          const [mesA, anoA] = a.split('/');
                          const [mesB, anoB] = b.split('/');
                          return new Date(anoB, mesB - 1) - new Date(anoA, mesA - 1);
                        })
                        .map(periodo => (
                          <th
                            key={periodo}
                            className={`px-4 py-3 text-center text-xs font-semibold whitespace-nowrap ${
                              isDarkMode ? 'text-gray-300 bg-[#0f1117]' : 'text-gray-700 bg-purple-50'
                            }`}
                          >
                            {periodo}
                          </th>
                        ))}
                    </tr>
                  </thead>
                  <tbody>
                    {/* Obtener usuarios únicos de todasLasCuotas */}
                    {Array.from(
                      new Map(
                        todasLasCuotas.map(c => [
                          c.usuario_id,
                          {
                            id: c.usuario_id,
                            nombre: c.nombre,
                            apellido: c.apellido,
                            tipo_perfil: c.tipo_perfil
                          }
                        ])
                      ).values()
                    )
                      .sort((a, b) => `${a.nombre} ${a.apellido}`.localeCompare(`${b.nombre} ${b.apellido}`))
                      .map((usuario, idx) => (
                        <tr
                          key={usuario.id}
                          className={`border-b ${
                            idx % 2 === 0
                              ? isDarkMode
                                ? 'bg-[#1a1c22]'
                                : 'bg-white'
                              : isDarkMode
                              ? 'bg-[#0f1117]'
                              : 'bg-purple-50/30'
                          } ${isDarkMode ? 'border-[#8c5cff]/10' : 'border-purple-100'}`}
                        >
                          <td className={`px-6 py-4 text-sm font-medium ${
                            isDarkMode ? 'text-gray-200' : 'text-gray-900'
                          }`}>
                            <div>
                              {usuario.nombre} {usuario.apellido}
                              <span className={`ml-2 text-xs px-2 py-1 rounded-full ${
                                usuario.tipo_perfil === 'admin'
                                  ? isDarkMode
                                    ? 'bg-red-500/20 text-red-300'
                                    : 'bg-red-100 text-red-700'
                                  : isDarkMode
                                  ? 'bg-blue-500/20 text-blue-300'
                                  : 'bg-blue-100 text-blue-700'
                              }`}>
                                {usuario.tipo_perfil}
                              </span>
                            </div>
                          </td>
                          {/* Columnas de meses/años */}
                          {Array.from(
                            new Set(
                              todasLasCuotas.map(c => `${String(c.mes).padStart(2, '0')}/${c.ano}`)
                            )
                          )
                            .sort((a, b) => {
                              const [mesA, anoA] = a.split('/');
                              const [mesB, anoB] = b.split('/');
                              return new Date(anoB, mesB - 1) - new Date(anoA, mesA - 1);
                            })
                            .map(periodo => {
                              const [mes, ano] = periodo.split('/');
                              const cuota = todasLasCuotas.find(
                                c => c.usuario_id === usuario.id &&
                                     c.mes === parseInt(mes) &&
                                     c.ano === parseInt(ano)
                              );

                              const isPaid = cuota?.estado === 'pagado';
                              const isOverdue = cuota?.estado === 'vencido';

                              return (
                                <td
                                  key={`${usuario.id}-${periodo}`}
                                  className={`px-4 py-4 text-center ${
                                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                  }`}
                                >
                                  {cuota ? (
                                    <div className="flex items-center justify-center">
                                      {isPaid ? (
                                        <div className="flex items-center gap-2">
                                          <CheckCircle size={20} className="text-green-500" />
                                          <span className="text-xs text-green-500">Pagada</span>
                                        </div>
                                      ) : (
                                        <div className="flex items-center gap-2">
                                          <AlertCircle
                                            size={20}
                                            className={isOverdue ? 'text-red-500' : 'text-yellow-500'}
                                          />
                                          <span className={`text-xs ${isOverdue ? 'text-red-500' : 'text-yellow-500'}`}>
                                            {isOverdue ? 'Vencida' : 'Pendiente'}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                      -
                                    </span>
                                  )}
                                </td>
                              );
                            })}
                        </tr>
                      ))}
                  </tbody>
                </table>
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
