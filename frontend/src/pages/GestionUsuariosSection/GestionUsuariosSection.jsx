import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, Eye, EyeOff, X, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const GestionUsuariosSection = ({ containerVariants }) => {
  const { isDarkMode, token } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    tipo_perfil: 'cliente',
  });

  const API_URL = 'http://localhost:5001/api/auth';

  // Obtener usuarios
  const obtenerUsuarios = async () => {
    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get(`${API_URL}/usuarios`, config);
      setUsuarios(response.data);
      setError('');
    } catch (err) {
      setError('Error al cargar usuarios');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    obtenerUsuarios();
  }, []);

  // Crear usuario
  const handleCrearUsuario = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.post(`${API_URL}/usuarios`, formData, config);
      setUsuarios([response.data.usuario, ...usuarios]);
      setFormData({
        nombre: '',
        apellido: '',
        email: '',
        password: '',
        tipo_perfil: 'cliente',
      });
      setShowForm(false);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al crear usuario');
    }
  };

  // Actualizar usuario
  const handleActualizarUsuario = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const dataToSend = { ...formData };
      if (!dataToSend.password) delete dataToSend.password;

      const response = await axios.put(
        `${API_URL}/usuarios/${editingId}`,
        dataToSend,
        config
      );

      setUsuarios(
        usuarios.map((u) => (u.id === editingId ? response.data.usuario : u))
      );
      setFormData({
        nombre: '',
        apellido: '',
        email: '',
        password: '',
        tipo_perfil: 'cliente',
      });
      setEditingId(null);
      setShowForm(false);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al actualizar usuario');
    }
  };

  // Eliminar usuario
  const handleEliminarUsuario = async (id) => {
    if (!confirm('¿Está seguro de que desea eliminar este usuario?')) return;

    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(`${API_URL}/usuarios/${id}`, config);
      setUsuarios(usuarios.filter((u) => u.id !== id));
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al eliminar usuario');
    }
  };

  // Editar usuario
  const handleEditarUsuario = (usuario) => {
    setFormData({
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      email: usuario.email,
      password: '',
      tipo_perfil: usuario.tipo_perfil,
    });
    setEditingId(usuario.id);
    setShowForm(true);
  };

  // Cancelar
  const handleCancelar = () => {
    setFormData({
      nombre: '',
      apellido: '',
      email: '',
      password: '',
      tipo_perfil: 'cliente',
    });
    setEditingId(null);
    setShowForm(false);
  };

  const containerVariantsLocal = {
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

  return (
    <motion.div
      variants={containerVariantsLocal}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Gestión de Usuarios
          </h2>
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
            Crear, editar y eliminar usuarios (nutricionistas y administradores)
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            if (!showForm) {
              setFormData({
                nombre: '',
                apellido: '',
                email: '',
                password: '',
                tipo_perfil: 'cliente',
              });
              setEditingId(null);
              setShowForm(true);
            }
          }}
          disabled={showForm}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
            showForm
              ? 'bg-gray-400 cursor-not-allowed'
              : isDarkMode
              ? 'bg-gradient-to-r from-[#8c5cff] to-[#6a3dcf] text-white hover:shadow-lg hover:shadow-[#8c5cff]/50'
              : 'bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:shadow-lg'
          }`}
        >
          <Plus size={20} />
          Nuevo Usuario
        </motion.button>
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-red-500/20 border border-red-500 text-red-600 p-4 rounded-lg flex items-center justify-between"
          >
            <span>{error}</span>
            <button onClick={() => setError('')}>
              <X size={20} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Form */}
      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            onSubmit={editingId ? handleActualizarUsuario : handleCrearUsuario}
            className={`p-6 rounded-2xl border ${
              isDarkMode
                ? 'bg-[#1a1c22]/50 border-[#8c5cff]/20'
                : 'bg-white/50 border-purple-200'
            } space-y-4`}
          >
            <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {editingId ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Nombre *
                </label>
                <input
                  type="text"
                  placeholder="Ingrese el nombre"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  required
                  className={`w-full px-4 py-2 rounded-lg border transition-all ${
                    isDarkMode
                      ? 'bg-[#0f1117] border-[#8c5cff]/20 text-white placeholder-gray-500'
                      : 'bg-white border-purple-200 text-gray-900 placeholder-gray-400'
                  } focus:outline-none focus:border-[#8c5cff]`}
                />
              </div>
              <div>
                <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Apellido *
                </label>
                <input
                  type="text"
                  placeholder="Ingrese el apellido"
                  value={formData.apellido}
                  onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                  required
                  className={`w-full px-4 py-2 rounded-lg border transition-all ${
                    isDarkMode
                      ? 'bg-[#0f1117] border-[#8c5cff]/20 text-white placeholder-gray-500'
                      : 'bg-white border-purple-200 text-gray-900 placeholder-gray-400'
                  } focus:outline-none focus:border-[#8c5cff]`}
                />
              </div>
            </div>

            <div>
              <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Email {editingId && '(no editable)'} *
              </label>
              <input
                type="email"
                placeholder="Ingrese el email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                disabled={!!editingId}
                className={`w-full px-4 py-2 rounded-lg border transition-all ${
                  isDarkMode
                    ? 'bg-[#0f1117] border-[#8c5cff]/20 text-white placeholder-gray-500 disabled:opacity-50'
                    : 'bg-white border-purple-200 text-gray-900 placeholder-gray-400 disabled:opacity-50'
                } focus:outline-none focus:border-[#8c5cff]`}
              />
            </div>

            <div>
              <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Contraseña {editingId && '(dejar en blanco para no cambiar)'} {!editingId && '*'}
              </label>
              <input
                type="password"
                placeholder={editingId ? 'Ingrese nueva contraseña' : 'Ingrese la contraseña'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required={!editingId}
                className={`w-full px-4 py-2 rounded-lg border transition-all ${
                  isDarkMode
                    ? 'bg-[#0f1117] border-[#8c5cff]/20 text-white placeholder-gray-500'
                    : 'bg-white border-purple-200 text-gray-900 placeholder-gray-400'
                } focus:outline-none focus:border-[#8c5cff]`}
              />
            </div>

            <div>
              <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Tipo de Perfil *
              </label>
              <select
                value={formData.tipo_perfil}
                onChange={(e) => setFormData({ ...formData, tipo_perfil: e.target.value })}
                className={`w-full px-4 py-2 rounded-lg border transition-all ${
                  isDarkMode
                    ? 'bg-[#0f1117] border-[#8c5cff]/20 text-white'
                    : 'bg-white border-purple-200 text-gray-900'
                } focus:outline-none focus:border-[#8c5cff]`}
              >
                <option value="cliente">Cliente</option>
                <option value="nutricionista">Nutricionista</option>
                <option value="admin">Administrador</option>
              </select>
            </div>

            <div className="flex gap-3 pt-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                className={`flex items-center gap-2 px-6 py-2 rounded-lg font-semibold transition-all flex-1 ${
                  isDarkMode
                    ? 'bg-gradient-to-r from-[#8c5cff] to-[#6a3dcf] text-white hover:shadow-lg'
                    : 'bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:shadow-lg'
                }`}
              >
                <Check size={18} />
                {editingId ? 'Guardar Cambios' : 'Crear Usuario'}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={handleCancelar}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg font-semibold transition-all flex-1 ${
                  isDarkMode
                    ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <X size={18} />
                Cancelar
              </motion.button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Usuarios List */}
      <div className="space-y-4">
        {loading ? (
          <div className={`p-8 text-center rounded-2xl border ${
            isDarkMode ? 'bg-[#1a1c22]/50 border-[#8c5cff]/20' : 'bg-white/50 border-purple-200'
          }`}>
            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Cargando usuarios...</p>
          </div>
        ) : usuarios.length === 0 ? (
          <div className={`p-8 text-center rounded-2xl border ${
            isDarkMode ? 'bg-[#1a1c22]/50 border-[#8c5cff]/20' : 'bg-white/50 border-purple-200'
          }`}>
            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
              No hay usuarios registrados aún. Crea uno para empezar.
            </p>
          </div>
        ) : (
          <div className="grid gap-3">
            {usuarios.map((usuario) => (
              <motion.div
                key={usuario.id}
                whileHover={{ y: -2 }}
                className={`p-4 rounded-lg border transition-all ${
                  isDarkMode
                    ? 'bg-[#1a1c22]/50 border-[#8c5cff]/20 hover:border-[#8c5cff]/40'
                    : 'bg-white/50 border-purple-200 hover:border-purple-400'
                }`}
              >
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex-1 min-w-0">
                    <h4 className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {usuario.nombre} {usuario.apellido}
                    </h4>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {usuario.email}
                    </p>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                        usuario.tipo_perfil === 'admin'
                          ? isDarkMode
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-red-100 text-red-600'
                          : usuario.tipo_perfil === 'nutricionista'
                          ? isDarkMode
                            ? 'bg-blue-500/20 text-blue-400'
                            : 'bg-blue-100 text-blue-600'
                          : isDarkMode
                          ? 'bg-purple-500/20 text-purple-400'
                          : 'bg-purple-100 text-purple-600'
                      }`}>
                        {usuario.tipo_perfil === 'admin' ? 'Administrador' : usuario.tipo_perfil === 'nutricionista' ? 'Nutricionista' : 'Cliente'}
                      </span>
                      <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                        usuario.activo
                          ? isDarkMode
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-green-100 text-green-600'
                          : isDarkMode
                          ? 'bg-gray-500/20 text-gray-400'
                          : 'bg-gray-200 text-gray-600'
                      }`}>
                        {usuario.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleEditarUsuario(usuario)}
                      className={`p-2 rounded-lg transition-colors ${
                        isDarkMode
                          ? 'text-blue-400 hover:bg-blue-500/20'
                          : 'text-blue-600 hover:bg-blue-100'
                      }`}
                      title="Editar usuario"
                    >
                      <Edit2 size={20} />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleEliminarUsuario(usuario.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        isDarkMode
                          ? 'text-red-400 hover:bg-red-500/20'
                          : 'text-red-600 hover:bg-red-100'
                      }`}
                      title="Eliminar usuario"
                    >
                      <Trash2 size={20} />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default GestionUsuariosSection;
