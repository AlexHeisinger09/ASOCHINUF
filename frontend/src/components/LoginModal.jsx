import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

const LoginModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Mock login - guardar en localStorage
    localStorage.setItem('asochinuf_user', JSON.stringify({
      name: formData.name,
      email: formData.email,
      loginTime: new Date().toISOString()
    }));
    console.log('Login simulado:', formData);
    alert(`¡Bienvenido ${formData.name}! Login exitoso (mock)`);
    onClose();
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop con blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ 
                duration: 0.4,
                type: "spring",
                stiffness: 300,
                damping: 25
              }}
              className="relative w-full max-w-md bg-[#2a2c33] rounded-2xl shadow-2xl border border-[#8c5cff]/20"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Botón cerrar */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors duration-200 z-10"
              >
                <X size={24} />
              </button>

              {/* Contenido del modal */}
              <div className="p-8">
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-center mb-8"
                >
                  <h2 className="text-3xl font-bold text-white mb-2">¡Bienvenido!</h2>
                  <p className="text-gray-400">Ingresa a tu cuenta ASOCHINUF</p>
                </motion.div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Campo Email */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Label htmlFor="email" className="text-gray-300 mb-2 block">
                      Correo Electrónico
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="tu@email.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="pl-11 bg-[#1a1c22] border-[#8c5cff]/30 text-white placeholder:text-gray-500 focus:border-[#8c5cff] focus:ring-[#8c5cff]/20 transition-all duration-200"
                      />
                    </div>
                  </motion.div>

                  {/* Campo Contraseña */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <Label htmlFor="password" className="text-gray-300 mb-2 block">
                      Contraseña
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        className="pl-11 bg-[#1a1c22] border-[#8c5cff]/30 text-white placeholder:text-gray-500 focus:border-[#8c5cff] focus:ring-[#8c5cff]/20 transition-all duration-200"
                      />
                    </div>
                  </motion.div>

                  {/* Botón Submit */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <Button
                      type="submit"
                      className="w-full bg-[#8c5cff] hover:bg-[#7a4de6] text-white font-semibold py-6 rounded-lg transition-all duration-300 shadow-lg hover:shadow-[#8c5cff]/50"
                    >
                      Iniciar Sesión
                    </Button>
                  </motion.div>
                </form>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="text-center text-gray-500 text-sm mt-6"
                >
                  ¿No tienes cuenta? <span className="text-[#8c5cff] hover:underline cursor-pointer">Regístrate aquí</span>
                </motion.p>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default LoginModal;
