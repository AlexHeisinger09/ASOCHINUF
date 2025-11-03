import React from 'react';
import { motion } from 'framer-motion';
import { User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const DatosSection = ({ containerVariants }) => {
  const { isDarkMode } = useAuth();

  return (
    <motion.div
      key="datos"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <h2 className={`text-3xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Mi Informe Antropométrico</h2>
      <div
        className={`${
          isDarkMode ? 'bg-[#1a1c22]/50 border-[#8c5cff]/20' : 'bg-white/50 border-purple-200'
        } border rounded-2xl p-8 text-center backdrop-blur-xl`}
      >
        <User size={48} className="mx-auto text-[#8c5cff] mb-4" />
        <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Aquí verás tus medidas registradas</p>
      </div>
    </motion.div>
  );
};

export default DatosSection;
