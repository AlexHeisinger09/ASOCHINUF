import React from 'react';
import { motion } from 'framer-motion';
import { Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const ConfiguracionSection = ({ containerVariants }) => {
  const { isDarkMode } = useAuth();

  return (
    <motion.div
      key="configuracion"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <h2 className={`text-3xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Configuración</h2>
      <div
        className={`${
          isDarkMode ? 'bg-[#1a1c22]/50 border-[#8c5cff]/20' : 'bg-white/50 border-purple-200'
        } border rounded-2xl p-8 text-center backdrop-blur-xl`}
      >
        <Settings size={48} className="mx-auto text-[#8c5cff] mb-4" />
        <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Gestiona tus preferencias aquí</p>
      </div>
    </motion.div>
  );
};

export default ConfiguracionSection;
