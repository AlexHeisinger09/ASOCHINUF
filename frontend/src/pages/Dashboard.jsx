import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, User, BookOpen, Upload, Settings, Home, ChevronLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('inicio');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const menuItems = [
    { id: 'inicio', label: 'Inicio', icon: Home },
    { id: 'cursos', label: 'Cursos', icon: BookOpen },
    { id: 'datos', label: 'Mis Datos', icon: User },
    { id: 'excel', label: 'Cargar Excel', icon: Upload },
    { id: 'configuracion', label: 'Configuración', icon: Settings },
  ];

  const containerVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3 },
    },
    exit: {
      opacity: 0,
      x: -20,
      transition: { duration: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-[#1a1c22] to-[#0f1117] border-b border-[#8c5cff]/20 backdrop-blur-xl"
      >
        <div className="mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 md:hidden">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-[#8c5cff]/20 rounded-lg"
            >
              <ChevronLeft size={24} className={`transition-transform ${sidebarOpen ? 'rotate-180' : ''}`} />
            </motion.button>
          </div>

          <div className="flex-1 md:flex-initial">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2 cursor-pointer w-fit"
              onClick={() => setActiveTab('inicio')}
            >
              <img
                src="/logos/logo.png"
                alt="ASOCHINUF"
                className="h-9 w-auto"
              />
              <h1 className="text-lg font-bold bg-gradient-to-r from-white via-[#8c5cff] to-white bg-clip-text text-transparent">
                ASOCHINUF
              </h1>
            </motion.div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#8c5cff] to-[#6a3dcf] flex items-center justify-center text-sm font-bold">
                {usuario?.nombre[0]}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold">{usuario?.nombre} {usuario?.apellido}</p>
                <p className="text-xs text-gray-400 capitalize">{usuario?.tipo_perfil}</p>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="p-2 hover:bg-[#8c5cff]/20 rounded-lg transition-colors duration-300"
              title="Cerrar sesión"
            >
              <LogOut size={20} className="text-[#8c5cff]" />
            </motion.button>
          </div>
        </div>
      </motion.header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <AnimatePresence>
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="hidden md:flex md:w-64 bg-gradient-to-b from-[#1a1c22] to-[#0f1117] border-r border-[#8c5cff]/20 flex-col p-6 gap-8 overflow-y-auto"
          >
            {/* Sidebar Header - Logo y nombre */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-3 cursor-pointer pb-6 border-b border-[#8c5cff]/20"
              onClick={() => setActiveTab('inicio')}
            >
              <img
                src="/logos/logo.png"
                alt="ASOCHINUF"
                className="h-12 w-auto"
              />
              <div>
                <h2 className="text-lg font-bold bg-gradient-to-r from-white via-[#8c5cff] to-white bg-clip-text text-transparent">
                  ASOCHINUF
                </h2>
                <p className="text-xs text-gray-400">Panel de Control</p>
              </div>
            </motion.div>

            {/* Menu Items */}
            <nav className="flex flex-col gap-3 flex-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <motion.button
                    key={item.id}
                    whileHover={{ x: 5 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 w-full ${
                      isActive
                        ? 'bg-gradient-to-r from-[#8c5cff] to-[#6a3dcf] text-white shadow-lg shadow-[#8c5cff]/25'
                        : 'text-gray-400 hover:text-white hover:bg-[#8c5cff]/10'
                    }`}
                  >
                    <Icon size={20} />
                    <span className="font-semibold">{item.label}</span>
                    {isActive && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="ml-auto w-2 h-2 rounded-full bg-white"
                      />
                    )}
                  </motion.button>
                );
              })}
            </nav>

            {/* Sidebar Footer */}
            <motion.button
              whileHover={{ scale: 1.02, x: 5 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-400/10 transition-all duration-300 w-full border-t border-[#8c5cff]/20 pt-4"
            >
              <LogOut size={20} />
              <span className="font-semibold">Cerrar sesión</span>
            </motion.button>
          </motion.aside>
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-10">
          <AnimatePresence mode="wait">
            {/* Inicio Tab */}
            {activeTab === 'inicio' && (
              <motion.div
                key="inicio"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-8">
              <div>
                <h2 className="text-4xl font-bold mb-2">
                  ¡Bienvenido, {usuario?.nombre}!
                </h2>
                <p className="text-gray-400">
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
                    className={`bg-gradient-to-br ${card.color} to-transparent p-6 rounded-2xl border border-[#8c5cff]/20 backdrop-blur-xl`}
                  >
                    <p className="text-gray-300 text-sm mb-2">{card.title}</p>
                    <h3 className="text-3xl font-bold mb-1">{card.value}</h3>
                    <p className="text-gray-400 text-sm">{card.description}</p>
                  </motion.div>
                ))}
              </div>

              {/* Últimas actividades */}
              <motion.div variants={itemVariants} className="bg-[#1a1c22]/50 border border-[#8c5cff]/20 rounded-2xl p-6 backdrop-blur-xl">
                <h3 className="text-xl font-bold mb-4">Últimas Actividades</h3>
                <div className="space-y-4">
                  {[
                    { title: 'Registro de medidas actualizado', fecha: 'Hoy a las 10:30' },
                    { title: 'Nuevo curso disponible: Nutrición Avanzada', fecha: 'Ayer a las 14:00' },
                    { title: 'Mensaje de tu nutricionista', fecha: 'Hace 2 días' },
                  ].map((activity, idx) => (
                    <div key={idx} className="flex items-center gap-4 pb-4 border-b border-[#8c5cff]/10 last:border-0">
                      <div className="w-2 h-2 rounded-full bg-[#8c5cff]" />
                      <div className="flex-1">
                        <p className="text-white font-medium">{activity.title}</p>
                        <p className="text-gray-400 text-sm">{activity.fecha}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
              </motion.div>
            )}

            {/* Cursos Tab */}
            {activeTab === 'cursos' && (
              <motion.div
                key="cursos"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit">
              <h2 className="text-3xl font-bold mb-6">Mis Cursos</h2>
              <div className="bg-[#1a1c22]/50 border border-[#8c5cff]/20 rounded-2xl p-8 text-center backdrop-blur-xl">
                <BookOpen size={48} className="mx-auto text-[#8c5cff] mb-4" />
                <p className="text-gray-400">Los cursos se mostrarán aquí</p>
              </div>
              </motion.div>
            )}

            {/* Datos Tab */}
            {activeTab === 'datos' && (
              <motion.div
                key="datos"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit">
              <h2 className="text-3xl font-bold mb-6">Mis Datos Antropológicos</h2>
              <div className="bg-[#1a1c22]/50 border border-[#8c5cff]/20 rounded-2xl p-8 text-center backdrop-blur-xl">
                <User size={48} className="mx-auto text-[#8c5cff] mb-4" />
                <p className="text-gray-400">Aquí verás tus medidas registradas</p>
              </div>
              </motion.div>
            )}

            {/* Excel Tab */}
            {activeTab === 'excel' && (
              <motion.div
                key="excel"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit">
              <h2 className="text-3xl font-bold mb-6">Cargar Excel</h2>
              <div className="bg-[#1a1c22]/50 border border-[#8c5cff]/20 rounded-2xl p-8 text-center backdrop-blur-xl">
                <Upload size={48} className="mx-auto text-[#8c5cff] mb-4" />
                <p className="text-gray-400">Funcionalidad para cargar archivos Excel</p>
              </div>
              </motion.div>
            )}

            {/* Configuración Tab */}
            {activeTab === 'configuracion' && (
              <motion.div
                key="configuracion"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit">
                <h2 className="text-3xl font-bold mb-6">Configuración</h2>
                <div className="bg-[#1a1c22]/50 border border-[#8c5cff]/20 rounded-2xl p-8 text-center backdrop-blur-xl">
                  <Settings size={48} className="mx-auto text-[#8c5cff] mb-4" />
                  <p className="text-gray-400">Gestiona tus preferencias aquí</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
