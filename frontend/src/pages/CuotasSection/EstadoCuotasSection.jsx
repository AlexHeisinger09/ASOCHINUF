import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Edit3, Loader, AlertCircle, XCircle, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { API_ENDPOINTS } from '../../config/apiConfig';
import { toast } from 'sonner';
import AdminPaymentModal from './AdminPaymentModal';

const EstadoCuotasSection = ({ containerVariants }) => {
  const { isDarkMode, token, usuario } = useAuth();
  const [todasLasCuotas, setTodasLasCuotas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAdminPaymentModal, setShowAdminPaymentModal] = useState(false);
  const [cuotaPagando, setCuotaPagando] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    cargarTodasLasCuotas();
  }, [token]);

  const cargarTodasLasCuotas = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get(API_ENDPOINTS.CUOTAS.GET_ALL, config);
      setTodasLasCuotas(response.data);
    } catch (err) {
      console.error('Error al cargar cuotas:', err);
      toast.error('Error al cargar las cuotas');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminRegistrarPago = (cuota) => {
    setCuotaPagando(cuota);
    setShowAdminPaymentModal(true);
  };

  // Función para verificar si una cuota está vencida
  const esCuotaVencida = (cuota) => {
    if (cuota.estado === 'pagado') return false;

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const fechaVencimiento = new Date(cuota.fecha_vencimiento);
    fechaVencimiento.setHours(0, 0, 0, 0);

    return fechaVencimiento < hoy;
  };

  // Función para verificar si un usuario tiene cuotas vencidas
  const usuarioTieneCuotasVencidas = (usuarioId) => {
    return todasLasCuotas.some(cuota =>
      cuota.usuario_id === usuarioId && esCuotaVencida(cuota)
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="animate-spin text-[#8c5cff]" size={32} />
      </div>
    );
  }

  // Filtrar usuarios por búsqueda
  const usuariosFiltrados = todasLasCuotas.filter(cuota => {
    if (!searchTerm) return true;
    const nombreCompleto = `${cuota.nombre || ''} ${cuota.apellido || ''}`.toLowerCase();
    const email = (cuota.email || '').toLowerCase();
    const busqueda = searchTerm.toLowerCase();
    return nombreCompleto.includes(busqueda) || email.includes(busqueda);
  });

  return (
    <motion.div
      key="estado-cuotas"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="space-y-6"
    >
      {/* Buscador */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search
            size={20}
            className={`absolute left-3 top-1/2 -translate-y-1/2 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}
          />
          <input
            type="text"
            placeholder="Buscar por nombre o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-10 pr-4 py-2.5 rounded-lg border transition-all ${
              isDarkMode
                ? 'bg-[#1a1c22] border-[#8c5cff]/20 text-white placeholder-gray-500 focus:border-[#8c5cff] focus:ring-2 focus:ring-[#8c5cff]/20'
                : 'bg-white border-purple-200 text-gray-900 placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-200'
            }`}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className={`absolute right-3 top-1/2 -translate-y-1/2 ${
                isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <XCircle size={16} />
            </button>
          )}
        </div>
        <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          {searchTerm ? (
            <>
              Mostrando{' '}
              <span className="font-semibold text-[#8c5cff]">
                {Array.from(new Set(usuariosFiltrados.map(c => c.usuario_id))).length}
              </span>{' '}
              de{' '}
              <span className="font-semibold">
                {Array.from(new Set(todasLasCuotas.map(c => c.usuario_id))).length}
              </span>{' '}
              usuarios
            </>
          ) : (
            <>
              Total:{' '}
              <span className="font-semibold text-[#8c5cff]">
                {Array.from(new Set(todasLasCuotas.map(c => c.usuario_id))).length}
              </span>{' '}
              usuarios
            </>
          )}
        </div>
      </div>

      {/* Tabla de Estado de Cuotas - Todos los Usuarios */}
      {usuariosFiltrados.length === 0 ? (
        <div className={`p-12 text-center rounded-2xl border ${
          isDarkMode ? 'bg-[#1a1c22]/50 border-[#8c5cff]/20' : 'bg-white border-purple-200'
        }`}>
          <Search size={48} className={`mx-auto mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
          <p className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {searchTerm ? 'No se encontraron usuarios' : 'No hay cuotas registradas'}
          </p>
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
            {searchTerm ? 'Intenta con otro término de búsqueda' : 'No hay cuotas registradas en el sistema'}
          </p>
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
                <th className={`px-6 py-3 text-left text-sm font-semibold ${
                  isDarkMode ? 'text-gray-300 bg-[#0f1117]' : 'text-gray-700 bg-purple-50'
                }`}>
                  Usuario
                </th>
                {/* Obtener meses/años únicos y ordenados */}
                {Array.from(
                  new Set(
                    usuariosFiltrados.map(c => `${String(c.mes).padStart(2, '0')}/${c.ano}`)
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
              {/* Obtener usuarios únicos de usuariosFiltrados */}
              {Array.from(
                new Map(
                  usuariosFiltrados.map(c => [
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
                .sort((a, b) => {
                  // Ordenar: primero los que tienen cuotas vencidas
                  const aVencida = usuarioTieneCuotasVencidas(a.id);
                  const bVencida = usuarioTieneCuotasVencidas(b.id);
                  if (aVencida && !bVencida) return -1;
                  if (!aVencida && bVencida) return 1;
                  return `${a.nombre} ${a.apellido}`.localeCompare(`${b.nombre} ${b.apellido}`);
                })
                .map((usuario, idx) => {
                  const tieneVencidas = usuarioTieneCuotasVencidas(usuario.id);

                  return (
                    <tr
                      key={usuario.id}
                      className={`border-b ${
                        tieneVencidas
                          ? isDarkMode
                            ? 'bg-red-500/10 border-red-500/30'
                            : 'bg-red-50/50 border-red-200'
                          : idx % 2 === 0
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
                        <div className="flex items-center gap-2">
                          {tieneVencidas && (
                            <AlertCircle size={18} className="text-red-500 flex-shrink-0" />
                          )}
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
                        </div>
                      </td>
                    {/* Columnas de meses/años */}
                    {Array.from(
                      new Set(
                        usuariosFiltrados.map(c => `${String(c.mes).padStart(2, '0')}/${c.ano}`)
                      )
                    )
                      .sort((a, b) => {
                        const [mesA, anoA] = a.split('/');
                        const [mesB, anoB] = b.split('/');
                        return new Date(anoB, mesB - 1) - new Date(anoA, mesA - 1);
                      })
                      .map(periodo => {
                        const [mes, ano] = periodo.split('/');
                        const cuota = usuariosFiltrados.find(
                          c => c.usuario_id === usuario.id &&
                               c.mes === parseInt(mes) &&
                               c.ano === parseInt(ano)
                        );

                        const isPaid = cuota?.estado === 'pagado';
                        const isVencida = cuota ? esCuotaVencida(cuota) : false;

                        return (
                          <td
                            key={`${usuario.id}-${periodo}`}
                            className={`px-4 py-4 text-center ${
                              isVencida
                                ? isDarkMode
                                  ? 'bg-red-500/20'
                                  : 'bg-red-100'
                                : ''
                            } ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                          >
                            {cuota ? (
                              <div className="flex items-center justify-center">
                                {isPaid ? (
                                  <div className="flex items-center gap-2">
                                    <CheckCircle size={20} className="text-green-500" />
                                    <span className="text-xs text-green-500">Pagada</span>
                                  </div>
                                ) : (
                                  <div className="flex flex-col items-center gap-1">
                                    {isVencida && (
                                      <span className="text-[10px] font-semibold text-red-500 uppercase tracking-wide">
                                        Vencida
                                      </span>
                                    )}
                                    <motion.button
                                      whileHover={{ scale: 1.05 }}
                                      whileTap={{ scale: 0.95 }}
                                      onClick={() => handleAdminRegistrarPago(cuota)}
                                      className={`px-3 py-1.5 rounded-md text-xs font-semibold text-white transition-colors ${
                                        isDarkMode
                                          ? 'bg-[#8c5cff] hover:bg-[#7a4cde]'
                                          : 'bg-purple-600 hover:bg-purple-700'
                                      }`}
                                      title={isVencida ? "Cuota vencida - Registrar pago" : "Registrar pago manual"}
                                    >
                                      <Edit3 size={12} className="inline mr-1" />
                                      Registrar Pago
                                    </motion.button>
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
                  );
                })}
            </tbody>
          </table>
        </div>
      )}

      {/* Admin Payment Modal (para registrar pagos manuales) */}
      <AdminPaymentModal
        isOpen={showAdminPaymentModal}
        cuota={cuotaPagando}
        onClose={() => {
          setShowAdminPaymentModal(false);
          setCuotaPagando(null);
        }}
        onSuccess={() => {
          setShowAdminPaymentModal(false);
          setCuotaPagando(null);
          cargarTodasLasCuotas();
          toast.success('Cuota marcada como pagada');
        }}
      />
    </motion.div>
  );
};

export default EstadoCuotasSection;
