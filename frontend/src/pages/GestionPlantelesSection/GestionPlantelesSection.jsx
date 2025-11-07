import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Edit2,
  Trash2,
  X,
  Search,
  Shield,
  AlertCircle,
  CheckCircle,
  Trophy,
  Users,
  Filter,
  Power
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { API_ENDPOINTS } from '../../config/apiConfig';
import axios from 'axios';
import { toast } from 'sonner';
import ConfirmDialog from '../../components/ConfirmDialog';

const GestionPlantelesSection = ({ containerVariants }) => {
  const { isDarkMode, token, usuario } = useAuth();
  const [planteles, setPlanteles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [plantelAEliminar, setPlantelAEliminar] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroDivision, setFiltroDivision] = useState('todos');
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    nombre: '',
    division: 'Primera División',
    activo: true
  });

  // Verificar que el usuario es admin
  const esAdmin = usuario?.tipo_perfil === 'admin';

  useEffect(() => {
    if (esAdmin) {
      obtenerPlanteles();
    }
  }, [esAdmin]);

  const obtenerPlanteles = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get(API_ENDPOINTS.PLANTELES.GET_ALL, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPlanteles(response.data);
    } catch (err) {
      console.error('Error al obtener planteles:', err);
      setError('Error al cargar los planteles');
      toast.error('Error al cargar los planteles');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (editingId) {
        await axios.put(
          API_ENDPOINTS.PLANTELES.UPDATE(editingId),
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success('Plantel actualizado exitosamente');
      } else {
        await axios.post(
          API_ENDPOINTS.PLANTELES.CREATE,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success('Plantel creado exitosamente');
      }

      setShowModal(false);
      resetForm();
      obtenerPlanteles();
    } catch (err) {
      console.error('Error al guardar plantel:', err);
      toast.error(err.response?.data?.error || 'Error al guardar plantel');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (plantel) => {
    setEditingId(plantel.id);
    setFormData({
      nombre: plantel.nombre,
      division: plantel.division,
      activo: plantel.activo
    });
    setShowModal(true);
  };

  const handleDelete = async () => {
    if (!plantelAEliminar) return;

    try {
      await axios.delete(
        API_ENDPOINTS.PLANTELES.DELETE(plantelAEliminar.id),
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Plantel eliminado/desactivado exitosamente');
      setShowConfirmDialog(false);
      setPlantelAEliminar(null);
      obtenerPlanteles();
    } catch (err) {
      console.error('Error al eliminar plantel:', err);
      toast.error(err.response?.data?.error || 'Error al eliminar plantel');
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      division: 'Primera División',
      activo: true
    });
    setEditingId(null);
  };

  const confirmarEliminar = (plantel) => {
    setPlantelAEliminar(plantel);
    setShowConfirmDialog(true);
  };

  // Filtrar planteles
  const plantelesFiltrados = planteles.filter((plantel) => {
    const matchSearch = plantel.nombre.toLowerCase().includes(searchTerm.toLowerCase());
    const matchDivision = filtroDivision === 'todos' || plantel.division === filtroDivision;
    return matchSearch && matchDivision;
  });

  const getDivisionColor = (division) => {
    const colors = {
      'Primera División': isDarkMode ? 'bg-yellow-500/20 text-yellow-400' : 'bg-yellow-100 text-yellow-700',
      'Segunda División': isDarkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700',
      'Tercera División': isDarkMode ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-700',
      'Amateur': isDarkMode ? 'bg-gray-500/20 text-gray-400' : 'bg-gray-100 text-gray-700'
    };
    return colors[division] || colors['Amateur'];
  };

  if (!esAdmin) {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="min-h-screen flex items-center justify-center"
      >
        <div className={`${isDarkMode ? 'bg-red-500/10 border-red-500/30' : 'bg-red-50 border-red-200'} border rounded-2xl p-8 text-center max-w-md`}>
          <Shield size={48} className={`mx-auto mb-4 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`} />
          <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Acceso Restringido
          </h3>
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
            Solo los administradores pueden acceder a la gestión de planteles.
          </p>
        </div>
      </motion.div>
    );
  }

  if (loading) {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="min-h-screen"
      >
        <h2 className={`text-3xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Gestión de Planteles
        </h2>
        <div className="flex flex-col items-center justify-center py-20">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-[#8c5cff]/30 rounded-full"></div>
            <div className="w-16 h-16 border-4 border-[#8c5cff] border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
          </div>
          <p className={`mt-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Cargando planteles...
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h2 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Gestión de Planteles
          </h2>
          <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Administra los planteles deportivos
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-[#8c5cff] text-white rounded-lg hover:bg-[#7a4de6] transition-colors shadow-lg shadow-[#8c5cff]/30"
        >
          <Plus size={20} />
          Nuevo Plantel
        </button>
      </div>

      {/* Filtros y Búsqueda */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-wrap gap-4">
          {/* Búsqueda */}
          <div className="flex-1 min-w-[250px]">
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} size={20} />
              <input
                type="text"
                placeholder="Buscar por nombre de plantel..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                  isDarkMode
                    ? 'bg-[#1a1c22] border-[#8c5cff]/20 text-white placeholder-gray-500'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                } focus:outline-none focus:ring-2 focus:ring-[#8c5cff]`}
              />
            </div>
          </div>

          {/* Filtro de División */}
          <div className="flex items-center gap-2">
            <Filter size={20} className={isDarkMode ? 'text-gray-400' : 'text-gray-600'} />
            {['todos', 'Primera División', 'Segunda División', 'Tercera División', 'Amateur'].map((div) => (
              <button
                key={div}
                onClick={() => setFiltroDivision(div)}
                className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                  filtroDivision === div
                    ? 'bg-[#8c5cff] text-white shadow-lg shadow-[#8c5cff]/30'
                    : isDarkMode
                    ? 'bg-[#1a1c22]/50 text-gray-400 hover:bg-[#1a1c22] border border-[#8c5cff]/20'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                {div === 'todos' ? 'Todos' : div}
              </button>
            ))}
          </div>
        </div>

        {/* Contador */}
        <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          {plantelesFiltrados.length} plantel{plantelesFiltrados.length !== 1 ? 'es' : ''} encontrado{plantelesFiltrados.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Tabla de Planteles */}
      <div className={`${isDarkMode ? 'bg-[#1a1c22]/50 border-[#8c5cff]/20' : 'bg-white border-gray-200'} border rounded-2xl overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={isDarkMode ? 'bg-[#1a1c22]' : 'bg-gray-50'}>
              <tr>
                <th className={`px-6 py-4 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Plantel
                </th>
                <th className={`px-6 py-4 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  División
                </th>
                <th className={`px-6 py-4 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Estado
                </th>
                <th className={`px-6 py-4 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Creado por
                </th>
                <th className={`px-6 py-4 text-right text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {plantelesFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <Trophy size={48} className={`mx-auto mb-3 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                    <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {searchTerm || filtroDivision !== 'todos'
                        ? 'No se encontraron planteles con los filtros aplicados'
                        : 'No hay planteles registrados aún'}
                    </p>
                  </td>
                </tr>
              ) : (
                plantelesFiltrados.map((plantel) => (
                  <tr
                    key={plantel.id}
                    className={`${isDarkMode ? 'hover:bg-[#1a1c22]/50' : 'hover:bg-gray-50'} transition-colors`}
                  >
                    <td className={`px-6 py-4 ${isDarkMode ? 'text-white' : 'text-gray-900'} font-medium`}>
                      {plantel.nombre}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getDivisionColor(plantel.division)}`}>
                        {plantel.division}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {plantel.activo ? (
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${isDarkMode ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-700'}`}>
                          <CheckCircle size={14} />
                          Activo
                        </span>
                      ) : (
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${isDarkMode ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-700'}`}>
                          <Power size={14} />
                          Inactivo
                        </span>
                      )}
                    </td>
                    <td className={`px-6 py-4 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {plantel.creador_nombre || 'Sistema'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(plantel)}
                          className={`p-2 rounded-lg transition-colors ${
                            isDarkMode
                              ? 'hover:bg-[#8c5cff]/20 text-[#8c5cff]'
                              : 'hover:bg-purple-50 text-purple-600'
                          }`}
                          title="Editar"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => confirmarEliminar(plantel)}
                          className={`p-2 rounded-lg transition-colors ${
                            isDarkMode
                              ? 'hover:bg-red-500/20 text-red-400'
                              : 'hover:bg-red-50 text-red-600'
                          }`}
                          title="Eliminar"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Crear/Editar */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`${isDarkMode ? 'bg-[#0d0e12] border-[#8c5cff]/20' : 'bg-white border-gray-200'} border rounded-2xl p-6 w-full max-w-md shadow-2xl`}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {editingId ? 'Editar Plantel' : 'Nuevo Plantel'}
              </h3>
              <button
                onClick={() => { setShowModal(false); resetForm(); }}
                className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-[#1a1c22]' : 'hover:bg-gray-100'}`}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nombre */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Nombre del Plantel *
                </label>
                <input
                  type="text"
                  required
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  placeholder="Ej: Universidad de Chile"
                  className={`w-full px-4 py-3 rounded-lg border ${
                    isDarkMode
                      ? 'bg-[#1a1c22] border-[#8c5cff]/20 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-[#8c5cff]`}
                />
              </div>

              {/* División */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  División *
                </label>
                <select
                  required
                  value={formData.division}
                  onChange={(e) => setFormData({ ...formData, division: e.target.value })}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    isDarkMode
                      ? 'bg-[#1a1c22] border-[#8c5cff]/20 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-[#8c5cff]`}
                >
                  <option value="Primera División">Primera División</option>
                  <option value="Segunda División">Segunda División</option>
                  <option value="Tercera División">Tercera División</option>
                  <option value="Amateur">Amateur</option>
                </select>
              </div>

              {/* Estado */}
              {editingId && (
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="activo"
                    checked={formData.activo}
                    onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                    className="w-5 h-5 rounded border-gray-300 text-[#8c5cff] focus:ring-[#8c5cff]"
                  />
                  <label htmlFor="activo" className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Plantel activo
                  </label>
                </div>
              )}

              {/* Botones */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors ${
                    isDarkMode
                      ? 'bg-[#1a1c22] text-gray-300 hover:bg-[#1a1c22]/80'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-3 bg-[#8c5cff] text-white rounded-lg font-medium hover:bg-[#7a4de6] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Guardando...' : editingId ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Dialog de Confirmación */}
      <ConfirmDialog
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={handleDelete}
        title="Eliminar Plantel"
        message={`¿Estás seguro de que deseas eliminar el plantel "${plantelAEliminar?.nombre}"? ${
          plantelAEliminar?.sesiones_count > 0
            ? 'Este plantel tiene sesiones de medición asociadas y solo se desactivará.'
            : 'Esta acción no se puede deshacer.'
        }`}
        confirmText="Eliminar"
        isDarkMode={isDarkMode}
      />
    </motion.div>
  );
};

export default GestionPlantelesSection;
