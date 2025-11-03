import React from 'react';
import { motion } from 'framer-motion';
import { Home, BookOpen, User, Upload, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const BottomNav = ({ activeTab, setActiveTab }) => {
  const { isDarkMode } = useAuth();

  const menuItems = [
    { id: 'inicio', label: 'Inicio', icon: Home },
    { id: 'cursos', label: 'Cursos', icon: BookOpen },
    { id: 'datos', label: 'Mis Datos', icon: User },
    { id: 'excel', label: 'Excel', icon: Upload },
    { id: 'configuracion', label: 'Config', icon: Settings },
  ];

  return (
    <motion.nav
      initial={{ y: 80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
      className={`md:hidden fixed bottom-0 left-0 right-0 ${
        isDarkMode
          ? 'bg-gradient-to-t from-[#1a1c22] to-[#0f1117] border-[#8c5cff]/20'
          : 'bg-gradient-to-t from-white to-[#f5f5f7] border-purple-200'
      } border-t backdrop-blur-xl z-40`}
    >
      <div className="flex items-center justify-around py-3 px-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <motion.button
              key={item.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab(item.id)}
              title={item.label}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all duration-300 ${
                isActive
                  ? 'text-[#8c5cff]'
                  : isDarkMode
                  ? 'text-gray-400 hover:text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon size={24} className="flex-shrink-0" />
              <span className="text-xs font-semibold whitespace-nowrap">{item.label}</span>
              {isActive && (
                <motion.div
                  layoutId="mobileActiveIndicator"
                  className="h-1 w-12 rounded-full bg-[#8c5cff] mt-1"
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </motion.nav>
  );
};

export default BottomNav;
