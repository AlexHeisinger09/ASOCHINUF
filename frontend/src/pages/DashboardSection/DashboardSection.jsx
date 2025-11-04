import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import AnthropometricDashboard from '../../components/AnthropometricDashboard';
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  BookOpen,
  FileText,
  TrendingUp,
  Users,
  Activity,
  Download,
  Clock,
} from 'lucide-react';
import {
  estadisticasGenerales,
  excelsCargados,
  crecimientoDatos,
  distribucionUsuarios,
  actividadesRecientes,
} from '../../data/dashboardMock';

const DashboardSection = ({ containerVariants, itemVariants }) => {
  const { usuario, isDarkMode } = useAuth();

  // Determinar si es cliente o nutricionista/admin
  const esCliente = usuario?.tipo_perfil === 'cliente';

  // ==================== DASHBOARD CLIENTE ====================
  if (esCliente) {
    return (
      <motion.div
        key="inicio-cliente"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="space-y-8"
      >
        {/* Bienvenida */}
        <div>
          <h2 className={`text-4xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            ¡Bienvenido, {usuario?.nombre}!
          </h2>
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
            Este es tu panel de control de ASOCHINUF
          </p>
        </div>

        {/* Cards de información */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: 'Mis Cursos',
              value: '2',
              description: 'Cursos activos',
              color: 'from-[#8c5cff]',
            },
            {
              title: 'Medidas',
              value: '5',
              description: 'Registros antropológicos',
              color: 'from-[#6a3dcf]',
            },
            {
              title: 'Nutricionista',
              value: 'Ana López',
              description: 'Tu profesional asignada',
              color: 'from-[#a371ff]',
            },
          ].map((card, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -5 }}
              className={`bg-gradient-to-br ${card.color} to-transparent p-6 rounded-2xl ${
                isDarkMode ? 'border-[#8c5cff]/20' : 'border-purple-200'
              } border backdrop-blur-xl`}
            >
              <p className={`text-sm mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{card.title}</p>
              <h3 className={`text-3xl font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{card.value}</h3>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{card.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Últimas actividades */}
        <motion.div
          variants={itemVariants}
          className={`${
            isDarkMode ? 'bg-[#1a1c22]/50 border-[#8c5cff]/20' : 'bg-white/50 border-purple-200'
          } border rounded-2xl p-6 backdrop-blur-xl`}
        >
          <h3 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Últimas Actividades</h3>
          <div className="space-y-4">
            {[
              { title: 'Registro de medidas actualizado', fecha: 'Hoy a las 10:30' },
              { title: 'Nuevo curso disponible: Nutrición Avanzada', fecha: 'Ayer a las 14:00' },
              { title: 'Mensaje de tu nutricionista', fecha: 'Hace 2 días' },
            ].map((activity, idx) => (
              <div
                key={idx}
                className={`flex items-center gap-4 pb-4 ${
                  isDarkMode ? 'border-[#8c5cff]/10' : 'border-purple-100'
                } border-b last:border-0`}
              >
                <div className="w-2 h-2 rounded-full bg-[#8c5cff]" />
                <div className="flex-1">
                  <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{activity.title}</p>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{activity.fecha}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    );
  }

  // ==================== DASHBOARD NUTRICIONISTA/ADMIN ====================
  return (
    <motion.div
      key="inicio-nutricionista"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="space-y-8"
    >
      {/* Bienvenida */}
      <div>
        <h2 className={`text-4xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          ¡Bienvenido, {usuario?.nombre}!
        </h2>
        <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
          Análisis completo de datos antropométricos de jugadores cargados
        </p>
      </div>

      {/* Estadísticas Generales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
          className={`${
            isDarkMode
              ? 'bg-gradient-to-br from-[#8c5cff]/20 border-[#8c5cff]/20'
              : 'bg-gradient-to-br from-purple-50 border-purple-200'
          } border rounded-2xl p-6`}
        >
          <div className="flex items-center justify-between mb-3">
            <p className={`text-sm font-semibold uppercase tracking-wider ${isDarkMode ? 'text-[#8c5cff]' : 'text-purple-600'}`}>
              Total Jugadores
            </p>
            <Users size={20} className="text-[#8C5CFF]" />
          </div>
          <p className={`text-4xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {estadisticasGenerales.totalJugadores}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`${
            isDarkMode
              ? 'bg-gradient-to-br from-[#6BCB77]/20 border-[#6BCB77]/20'
              : 'bg-gradient-to-br from-green-50 border-green-200'
          } border rounded-2xl p-6`}
        >
          <div className="flex items-center justify-between mb-3">
            <p className={`text-sm font-semibold uppercase tracking-wider ${isDarkMode ? 'text-[#6BCB77]' : 'text-green-600'}`}>
              Excels Cargados
            </p>
            <Download size={20} className="text-[#6BCB77]" />
          </div>
          <p className={`text-4xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {estadisticasGenerales.totalExceles}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`${
            isDarkMode
              ? 'bg-gradient-to-br from-[#4D96FF]/20 border-[#4D96FF]/20'
              : 'bg-gradient-to-br from-blue-50 border-blue-200'
          } border rounded-2xl p-6`}
        >
          <div className="flex items-center justify-between mb-3">
            <p className={`text-sm font-semibold uppercase tracking-wider ${isDarkMode ? 'text-[#4D96FF]' : 'text-blue-600'}`}>
              Actualizados Hoy
            </p>
            <TrendingUp size={20} className="text-[#4D96FF]" />
          </div>
          <p className={`text-4xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {estadisticasGenerales.jugadoresActualizados}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`${
            isDarkMode
              ? 'bg-gradient-to-br from-[#FFD93D]/20 border-[#FFD93D]/20'
              : 'bg-gradient-to-br from-yellow-50 border-yellow-200'
          } border rounded-2xl p-6`}
        >
          <div className="flex items-center justify-between mb-3">
            <p className={`text-sm font-semibold uppercase tracking-wider ${isDarkMode ? 'text-[#FFD93D]' : 'text-yellow-600'}`}>
              Última Actualización
            </p>
            <Clock size={20} className="text-[#FFD93D]" />
          </div>
          <p className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {estadisticasGenerales.ultimaActualizacion}
          </p>
        </motion.div>
      </div>

      {/* Dashboard Antropométrico Principal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
      >
        <AnthropometricDashboard />
      </motion.div>

      {/* Gráfico de Crecimiento */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className={`${
          isDarkMode ? 'bg-[#1a1c22] border-[#8c5cff]/20' : 'bg-white border-purple-200'
        } border rounded-2xl p-6`}
      >
        <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          <TrendingUp size={20} className="text-[#8C5CFF]" />
          Crecimiento de Datos (2024)
        </h3>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={crecimientoDatos}>
            <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#8c5cff/20' : '#e0e0e0'} />
            <XAxis dataKey="mes" tick={{ fontSize: 12, fill: isDarkMode ? '#9ca3af' : '#666' }} />
            <YAxis tick={{ fontSize: 12, fill: isDarkMode ? '#9ca3af' : '#666' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: isDarkMode ? '#0f1117' : '#fff',
                border: `2px solid ${isDarkMode ? '#8c5cff' : '#8C5CFF'}`,
                borderRadius: '8px',
                color: isDarkMode ? '#fff' : '#000',
              }}
            />
            <Legend />
            <Line type="monotone" dataKey="jugadores" stroke="#8C5CFF" strokeWidth={3} dot={{ fill: '#8C5CFF', r: 5 }} activeDot={{ r: 7 }} name="Jugadores" />
            <Line type="monotone" dataKey="excels" stroke="#6BCB77" strokeWidth={3} dot={{ fill: '#6BCB77', r: 5 }} activeDot={{ r: 7 }} name="Excels Cargados" />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Dos columnas: Distribución de Usuarios y Últimos Excels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribución de Usuarios */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className={`${isDarkMode ? 'bg-[#1a1c22] border-[#8c5cff]/20' : 'bg-white border-purple-200'} border rounded-2xl p-6`}
        >
          <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            <Users size={20} className="text-[#8C5CFF]" />
            Distribución de Usuarios
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={distribucionUsuarios} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} outerRadius={80} fill="#8884d8" dataKey="value">
                {distribucionUsuarios.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: isDarkMode ? '#0f1117' : '#fff', border: `2px solid ${isDarkMode ? '#8c5cff' : '#8C5CFF'}`, borderRadius: '8px', color: isDarkMode ? '#fff' : '#000' }} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Últimos Excels Cargados */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className={`${isDarkMode ? 'bg-[#1a1c22] border-[#8c5cff]/20' : 'bg-white border-purple-200'} border rounded-2xl p-6`}
        >
          <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            <Download size={20} className="text-[#8C5CFF]" />
            Últimos Excels Cargados
          </h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {excelsCargados.map((excel, idx) => (
              <motion.div key={excel.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.8 + idx * 0.05 }} className={`p-3 rounded-lg border ${isDarkMode ? 'bg-[#0f1117] border-[#8c5cff]/10' : 'bg-gray-50 border-purple-100'}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className={`font-semibold text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{excel.nombre}</p>
                    <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{excel.cantidad} registros • {excel.fecha}</p>
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${excel.estado === 'completado' ? (isDarkMode ? 'bg-[#6BCB77]/20 text-[#6BCB77]' : 'bg-green-100 text-green-700') : isDarkMode ? 'bg-[#FFD93D]/20 text-[#FFD93D]' : 'bg-yellow-100 text-yellow-700'}`}>
                    {excel.estado}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Actividades Recientes del Sistema */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className={`${isDarkMode ? 'bg-[#1a1c22] border-[#8c5cff]/20' : 'bg-white border-purple-200'} border rounded-2xl p-6`}
      >
        <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          <Activity size={20} className="text-[#8C5CFF]" />
          Actividades Recientes del Sistema
        </h3>
        <div className="space-y-4">
          {actividadesRecientes.map((activity, idx) => (
            <motion.div key={activity.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.85 + idx * 0.05 }} className={`flex items-start gap-4 pb-4 ${isDarkMode ? 'border-[#8c5cff]/10' : 'border-purple-100'} border-b last:border-0`}>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${activity.tipo === 'excel' ? (isDarkMode ? 'bg-[#6BCB77]/20' : 'bg-green-100') : activity.tipo === 'usuario' ? (isDarkMode ? 'bg-[#4D96FF]/20' : 'bg-blue-100') : activity.tipo === 'datos' ? (isDarkMode ? 'bg-[#8C5CFF]/20' : 'bg-purple-100') : isDarkMode ? 'bg-[#FFD93D]/20' : 'bg-yellow-100'}`}>
                {activity.tipo === 'excel' ? <Download size={18} className="text-[#6BCB77]" /> : activity.tipo === 'usuario' ? <Users size={18} className="text-[#4D96FF]" /> : activity.tipo === 'datos' ? <FileText size={18} className="text-[#8C5CFF]" /> : <BookOpen size={18} className="text-[#FFD93D]" />}
              </div>
              <div className="flex-1">
                <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{activity.accion}</p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{activity.descripcion}</p>
                <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>{activity.fecha}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default DashboardSection;
