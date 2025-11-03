import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

const DashboardSection = ({ containerVariants, itemVariants }) => {
  const { usuario, isDarkMode } = useAuth();

  return (
    <motion.div
      key="inicio"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="space-y-8"
    >
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
};

export default DashboardSection;
