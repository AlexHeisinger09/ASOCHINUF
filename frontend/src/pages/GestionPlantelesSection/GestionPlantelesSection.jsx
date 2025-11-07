import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Power,
  GripVertical
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { API_ENDPOINTS } from '../../config/apiConfig';
import axios from 'axios';
import { toast } from 'sonner';
import ConfirmDialog from '../../components/ConfirmDialog';
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Componente PlantelItem con soporte drag and drop
const PlantelItem = ({ plantel, isDarkMode, onEdit, onDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    isOver,
  } = useSortable({ id: plantel.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition,
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout
      className={`p-4 rounded-lg border transition-all ${
        isDarkMode
          ? 'bg-[#1a1c22]/50 border-[#8c5cff]/20 hover:border-[#8c5cff]/40'
          : 'bg-white/50 border-purple-200 hover:border-purple-400'
      } ${isDragging ? 'opacity-50 shadow-xl ring-2 ring-[#8c5cff]' : 'opacity-100'} ${
        isOver ? 'ring-2 ring-[#8c5cff]' : ''
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          {...attributes}
          {...listeners}
          className={`cursor-grab active:cursor-grabbing p-1 rounded hover:bg-[#8c5cff]/10 transition-colors ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}
        >
          <GripVertical size={20} />
        </div>

        <div className="flex-1">
          <h4 className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {plantel.nombre}
          </h4>
          <div className="space-y-1 mt-1">
            {plantel.ciudad && (
              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                📍 {plantel.ciudad}
              </p>
            )}
            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {plantel.activo ? '✓ Activo' : '✗ Inactivo'}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onEdit(plantel)}
            className={`p-2 rounded-lg transition-colors ${
              isDarkMode ? 'text-blue-400 hover:bg-blue-500/20' : 'text-blue-600 hover:bg-blue-100'
            }`}
            title="Editar"
          >
            <Edit2 size={16} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onDelete(plantel)}
            className={`p-2 rounded-lg transition-colors ${
              isDarkMode ? 'text-red-400 hover:bg-red-500/20' : 'text-red-600 hover:bg-red-100'
            }`}
            title="Eliminar"
          >
            <Trash2 size={16} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

// Columna de división
const DivisionColumn = ({
  division,
  planteles,
  isDarkMode,
  onEdit,
  onDelete,
  getDivisionColor,
}) => {
  const getDivisionTitle = (div) => {
    return div === 'Primera Division'
      ? '🥇 Primera Division'
      : div === 'Primera B'
      ? '🥈 Primera B'
      : div === 'Segunda División'
      ? '🥉 Segunda División'
      : '⚽ Tercera División A';
  };

  const getDivisionBgColor = (div) => {
    if (isDarkMode) {
      return div === 'Primera Division'
        ? 'bg-yellow-500/10 border-yellow-500/30'
        : div === 'Primera B'
        ? 'bg-blue-500/10 border-blue-500/30'
        : div === 'Segunda División'
        ? 'bg-green-500/10 border-green-500/30'
        : 'bg-purple-500/10 border-purple-500/30';
    }
    return div === 'Primera Division'
      ? 'bg-yellow-50 border-yellow-200'
      : div === 'Primera B'
      ? 'bg-blue-50 border-blue-200'
      : div === 'Segunda División'
      ? 'bg-green-50 border-green-200'
      : 'bg-purple-50 border-purple-200';
  };

  // Crear ID único para el droppable de cada división
  const droppableId = `division-${division.replace(/\s+/g, '-').toLowerCase()}`;

  return (
    <div
      className={`flex-1 min-h-[400px] rounded-xl border-2 p-4 ${getDivisionBgColor(division)}`}
      data-division={division}
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          {getDivisionTitle(division)}
        </h3>
        <span
          className={`text-sm font-bold px-3 py-1 rounded-full ${
            isDarkMode ? 'bg-[#8c5cff]/20 text-[#8c5cff]' : 'bg-purple-100 text-purple-700'
          }`}
        >
          {planteles.length}
        </span>
      </div>

      <div className="space-y-2" data-droppable={division} data-droppable-id={droppableId}>
        {planteles.length === 0 ? (
          <div
            className={`p-6 text-center rounded-lg border-2 border-dashed ${
              isDarkMode
                ? 'border-gray-600 text-gray-400'
                : 'border-gray-300 text-gray-500'
            }`}
          >
            <p className="text-sm">Arrastra planteles aquí</p>
          </div>
        ) : (
          planteles.map((plantel) => (
            <PlantelItem
              key={plantel.id}
              plantel={plantel}
              isDarkMode={isDarkMode}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))
        )}
      </div>
    </div>
  );
};

const GestionPlantelesSection = ({ containerVariants }) => {
  const { isDarkMode, token, usuario } = useAuth();
  const [planteles, setPlanteles] = useState([]);
  const [plantelesCambios, setPlantelesCambios] = useState([]); // Estado local para cambios
  const [haysCambios, setHaysCambios] = useState(false); // Bandera de cambios
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [plantelAEliminar, setPlantelAEliminar] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [guardandoCambios, setGuardandoCambios] = useState(false);
  const [dragOverDivision, setDragOverDivision] = useState(null); // Para tracking de qué división se está sobrevolando

  const [formData, setFormData] = useState({
    nombre: '',
    division: 'Primera Division',
    ciudad: '',
    region: '',
    activo: true
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      distance: 8,
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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
      ciudad: plantel.ciudad || '',
      region: plantel.region || '',
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

  // Rastrear sobre qué división está el cursor durante el drag
  const handleDragOver = (event) => {
    const { active, over } = event;
    if (!over) {
      setDragOverDivision(null);
      return;
    }

    const divisiones = ['Primera Division', 'Primera B', 'Segunda División', 'Tercera División A'];

    // Verificar si over.id es un plantel (y obtener su división)
    const overPlantel = planteles.find((p) => p.id === over.id);
    if (overPlantel) {
      setDragOverDivision(overPlantel.division);
      return;
    }

    // Si no es un plantel, buscar qué división contiene el over.id
    for (const div of divisiones) {
      const plantelesEnDiv = planteles.filter((p) => p.division === div);
      if (plantelesEnDiv.some((p) => p.id === over.id)) {
        setDragOverDivision(div);
        return;
      }
    }

    setDragOverDivision(null);
  };

  // Manejar drag and drop entre divisiones (solo actualizar estado local)
  const handleDragEnd = (event) => {
    const { active, over } = event;

    // Limpiar el tracking de división
    setDragOverDivision(null);

    if (!over) return;

    const plantelId = active.id;
    const plantel = planteles.find((p) => p.id === plantelId);
    if (!plantel) return;

    const divisiones = ['Primera Division', 'Primera B', 'Segunda División', 'Tercera División A'];

    // Determinar la división destino
    let newDivision = null;

    // Caso 1: Si soltamos sobre otro plantel, obtener su división
    const overPlantel = planteles.find((p) => p.id === over.id);
    if (overPlantel) {
      newDivision = overPlantel.division;
    } else {
      // Caso 2: Buscar qué división contiene el over.id
      for (const div of divisiones) {
        const plantelesEnDiv = planteles.filter((p) => p.division === div);
        if (plantelesEnDiv.some((p) => p.id === over.id)) {
          newDivision = div;
          break;
        }
      }

      // Caso 3: Si aún no encontramos, usar dragOverDivision que fue rastreado durante el drag
      if (!newDivision && dragOverDivision) {
        newDivision = dragOverDivision;
      }
    }

    // Final fallback: mantener la división actual
    if (!newDivision) {
      newDivision = plantel.division;
    }

    // Si la división no cambió, no hacer nada
    if (plantel.division === newDivision) return;

    // Actualizar estado local SIN hacer llamada a API
    setPlanteles(
      planteles.map((p) =>
        p.id === plantel.id ? { ...p, division: newDivision } : p
      )
    );

    // Registrar el cambio en la lista de cambios pendientes
    const cambioExistente = plantelesCambios.find((c) => c.id === plantelId);
    if (cambioExistente) {
      // Actualizar cambio existente
      setPlantelesCambios(
        plantelesCambios.map((c) =>
          c.id === plantelId ? { ...c, division: newDivision } : c
        )
      );
    } else {
      // Agregar nuevo cambio
      setPlantelesCambios([...plantelesCambios, { id: plantelId, division: newDivision }]);
    }

    // Marcar que hay cambios pendientes
    setHaysCambios(true);
  };

  // Guardar todos los cambios pendientes
  const handleGuardarCambios = async () => {
    if (plantelesCambios.length === 0) return;

    setGuardandoCambios(true);

    try {
      // Hacer llamadas a la API para cada cambio
      const promises = plantelesCambios.map((cambio) => {
        const plantel = planteles.find((p) => p.id === cambio.id);
        return axios.put(
          API_ENDPOINTS.PLANTELES.UPDATE(cambio.id),
          {
            nombre: plantel.nombre,
            division: cambio.division,
            ciudad: plantel.ciudad,
            region: plantel.region,
            activo: plantel.activo,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      });

      await Promise.all(promises);

      // Limpiar estado de cambios
      setPlantelesCambios([]);
      setHaysCambios(false);

      toast.success(`${plantelesCambios.length} plantel(es) movido(s) exitosamente`);
    } catch (err) {
      console.error('Error al guardar cambios:', err);
      toast.error('Error al guardar los cambios');
    } finally {
      setGuardandoCambios(false);
    }
  };

  // Descartar cambios pendientes
  const handleDescartarCambios = async () => {
    // Recargar planteles desde el servidor
    await obtenerPlanteles();
    setPlantelesCambios([]);
    setHaysCambios(false);
    toast.info('Cambios descartados');
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      division: 'Primera Division',
      ciudad: '',
      region: '',
      activo: true
    });
    setEditingId(null);
  };

  const confirmarEliminar = (plantel) => {
    setPlantelAEliminar(plantel);
    setShowConfirmDialog(true);
  };

  const getDivisionColor = (division) => {
    const colors = {
      'Primera Division': isDarkMode ? 'bg-yellow-500/20 text-yellow-400' : 'bg-yellow-100 text-yellow-700',
      'Primera B': isDarkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700',
      'Segunda División': isDarkMode ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-700',
      'Tercera División A': isDarkMode ? 'bg-gray-500/20 text-gray-400' : 'bg-gray-100 text-gray-700'
    };
    return colors[division] || colors['Tercera División A'];
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

      {/* Búsqueda */}
      <div className="mb-6">
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

      {/* Indicador de Cambios Pendientes y Botones de Guardar/Descartar */}
      {haysCambios && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-6 p-4 rounded-lg border ${
            isDarkMode
              ? 'bg-blue-500/10 border-blue-500/30'
              : 'bg-blue-50 border-blue-200'
          } flex items-center justify-between gap-4`}
        >
          <div className="flex items-center gap-3">
            <AlertCircle
              size={20}
              className={isDarkMode ? 'text-blue-400' : 'text-blue-600'}
            />
            <span className={`font-semibold ${isDarkMode ? 'text-blue-300' : 'text-blue-800'}`}>
              Tienes {plantelesCambios.length} cambio{plantelesCambios.length !== 1 ? 's' : ''} pendiente{plantelesCambios.length !== 1 ? 's' : ''} de guardar
            </span>
          </div>

          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleGuardarCambios}
              disabled={guardandoCambios}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckCircle size={18} />
              {guardandoCambios ? 'Guardando...' : 'Guardar Cambios'}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDescartarCambios}
              disabled={guardandoCambios}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                isDarkMode
                  ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                  : 'bg-red-100 text-red-700 hover:bg-red-200'
              }`}
            >
              <X size={18} />
              Descartar
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Columnas de Divisiones con Drag and Drop */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
      >
        <SortableContext
          items={planteles.map((p) => p.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
            <DivisionColumn
              division="Primera Division"
              planteles={planteles.filter(
                (p) =>
                  p.division === 'Primera Division' &&
                  (searchTerm === '' || p.nombre.toLowerCase().includes(searchTerm.toLowerCase()))
              )}
              isDarkMode={isDarkMode}
              onEdit={handleEdit}
              onDelete={confirmarEliminar}
              getDivisionColor={getDivisionColor}
            />

            <DivisionColumn
              division="Primera B"
              planteles={planteles.filter(
                (p) =>
                  p.division === 'Primera B' &&
                  (searchTerm === '' || p.nombre.toLowerCase().includes(searchTerm.toLowerCase()))
              )}
              isDarkMode={isDarkMode}
              onEdit={handleEdit}
              onDelete={confirmarEliminar}
              getDivisionColor={getDivisionColor}
            />

            <DivisionColumn
              division="Segunda División"
              planteles={planteles.filter(
                (p) =>
                  p.division === 'Segunda División' &&
                  (searchTerm === '' || p.nombre.toLowerCase().includes(searchTerm.toLowerCase()))
              )}
              isDarkMode={isDarkMode}
              onEdit={handleEdit}
              onDelete={confirmarEliminar}
              getDivisionColor={getDivisionColor}
            />

            <DivisionColumn
              division="Tercera División A"
              planteles={planteles.filter(
                (p) =>
                  p.division === 'Tercera División A' &&
                  (searchTerm === '' || p.nombre.toLowerCase().includes(searchTerm.toLowerCase()))
              )}
              isDarkMode={isDarkMode}
              onEdit={handleEdit}
              onDelete={confirmarEliminar}
              getDivisionColor={getDivisionColor}
            />
          </div>
        </SortableContext>
      </DndContext>

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
                  <option value="Primera Division">Primera Division</option>
                  <option value="Primera B">Primera B</option>
                  <option value="Segunda División">Segunda División</option>
                  <option value="Tercera División A">Tercera División A</option>
                </select>
              </div>

              {/* Ciudad y Región (2 columnas) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Ciudad */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Ciudad *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.ciudad}
                    onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
                    placeholder="Ej: Santiago"
                    className={`w-full px-4 py-3 rounded-lg border ${
                      isDarkMode
                        ? 'bg-[#1a1c22] border-[#8c5cff]/20 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#8c5cff]`}
                  />
                </div>

                {/* Región */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Región *
                  </label>
                  <select
                    required
                    value={formData.region}
                    onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      isDarkMode
                        ? 'bg-[#1a1c22] border-[#8c5cff]/20 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#8c5cff]`}
                  >
                    <option value="">Seleccionar región...</option>
                    <option value="Región de Arica y Parinacota">Región de Arica y Parinacota</option>
                    <option value="Región de Tarapacá">Región de Tarapacá</option>
                    <option value="Región de Antofagasta">Región de Antofagasta</option>
                    <option value="Región de Atacama">Región de Atacama</option>
                    <option value="Región de Coquimbo">Región de Coquimbo</option>
                    <option value="Región de Valparaíso">Región de Valparaíso</option>
                    <option value="Región Metropolitana">Región Metropolitana</option>
                    <option value="Región del Libertador General Bernardo O'Higgins">Región del Libertador General Bernardo O'Higgins</option>
                    <option value="Región del Maule">Región del Maule</option>
                    <option value="Región de Ñuble">Región de Ñuble</option>
                    <option value="Región del Biobío">Región del Biobío</option>
                    <option value="Región de La Araucanía">Región de La Araucanía</option>
                    <option value="Región de Los Ríos">Región de Los Ríos</option>
                    <option value="Región de Los Lagos">Región de Los Lagos</option>
                    <option value="Región de Aysén del General Carlos Ibáñez del Campo">Región de Aysén del General Carlos Ibáñez del Campo</option>
                    <option value="Región de Magallanes y de la Antártica Chilena">Región de Magallanes y de la Antártica Chilena</option>
                  </select>
                </div>
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
