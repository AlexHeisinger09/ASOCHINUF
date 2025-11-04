import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart,
  Bar,
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
import { useAuth } from '../context/AuthContext';
import { dashboardData, posicionData } from '../data/dashboardMock';
import {
  ChevronDown,
  TrendingUp,
  Users,
  BarChart3,
} from 'lucide-react';

const AnthropometricDashboard = () => {
  const { isDarkMode } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('planteles');
  const [selectedOption, setSelectedOption] = useState('primera');

  const currentData = dashboardData[selectedCategory];
  const currentOption = currentData.options.find((opt) => opt.id === selectedOption);

  // Colores para los gráficos
  const COLORS_BARS = ['#8C5CFF', '#6BCB77', '#4D96FF', '#FFD93D', '#FF6B6B', '#FFA07A', '#98D8C8', '#FF69B4'];
  const COLORS_PIE = [
    '#FF6B6B',
    '#4ECDC4',
    '#45B7D1',
    '#FFA07A',
    '#98D8C8',
    '#8C5CFF',
    '#6BCB77',
    '#FFD93D',
  ];

  // Función auxiliar para obtener los 4 indicadores principales según la categoría
  const getIndicadores4 = () => {
    const indicadores = currentOption.indicadores || {};
    const cards = [];

    // Definir los 4 indicadores basados en la categoría seleccionada
    const indicadoresConfig = {
      planteles: [
        { key: 'total', label: 'Total', icon: '∑', color: '#8C5CFF' },
        { key: 'promedio', label: 'Promedio', icon: '≈', color: '#6BCB77' },
        { key: 'placeholder1', label: 'Equipos', icon: '👥', color: '#4D96FF', value: currentData.options?.length || 0 },
        { key: 'placeholder2', label: 'Actualizado', icon: '✓', color: '#FFD93D', value: 'Hoy' },
      ],
      peso: [
        { key: 'promedio', label: 'Promedio (kg)', icon: 'ⓐ', color: '#8C5CFF' },
        { key: 'minimo', label: 'Mínimo (kg)', icon: '⬇', color: '#FF6B6B' },
        { key: 'maximo', label: 'Máximo (kg)', icon: '⬆', color: '#6BCB77' },
        { key: 'placeholder1', label: 'Rango (kg)', icon: '↔', color: '#4D96FF',
          value: indicadores.maximo && indicadores.minimo ? (indicadores.maximo - indicadores.minimo).toFixed(1) : 'N/A' },
      ],
      estatura: [
        { key: 'promedio', label: 'Promedio (cm)', icon: 'ⓐ', color: '#8C5CFF' },
        { key: 'minimo', label: 'Mínimo (cm)', icon: '⬇', color: '#FF6B6B' },
        { key: 'maximo', label: 'Máximo (cm)', icon: '⬆', color: '#6BCB77' },
        { key: 'placeholder1', label: 'Rango (cm)', icon: '↔', color: '#4D96FF',
          value: indicadores.maximo && indicadores.minimo ? (indicadores.maximo - indicadores.minimo).toFixed(1) : 'N/A' },
      ],
      grasaCorporal: [
        { key: 'promedio', label: 'Promedio (%)', icon: 'ⓐ', color: '#8C5CFF' },
        { key: 'minimo', label: 'Mínimo (%)', icon: '⬇', color: '#FF6B6B' },
        { key: 'maximo', label: 'Máximo (%)', icon: '⬆', color: '#6BCB77' },
        { key: 'placeholder1', label: 'Rango (%)', icon: '↔', color: '#4D96FF',
          value: indicadores.maximo && indicadores.minimo ? (indicadores.maximo - indicadores.minimo).toFixed(1) : 'N/A' },
      ],
      categorias: [
        { key: 'total', label: 'Total', icon: '∑', color: '#8C5CFF' },
        { key: 'mayorCategoria', label: 'Mayor Categoría', icon: '⬆', color: '#6BCB77' },
        { key: 'menorCategoria', label: 'Menor Categoría', icon: '⬇', color: '#FF6B6B' },
        { key: 'placeholder1', label: 'Categorías', icon: '📊', color: '#4D96FF', value: '6' },
      ],
    };

    // Obtener la configuración para la categoría actual
    const config = indicadoresConfig[selectedCategory] || indicadoresConfig.planteles;

    // Mapear la configuración a los valores reales
    config.forEach((cardConfig) => {
      let value = cardConfig.value;

      // Si no tiene un valor fijo, intentar obtenerlo de los indicadores
      if (value === undefined) {
        value = indicadores[cardConfig.key];
      }

      // Formatear el valor
      let displayValue = 'N/A';
      if (typeof value === 'number') {
        displayValue = value.toFixed(1);
      } else if (value !== undefined && value !== null) {
        displayValue = String(value);
      }

      cards.push({
        ...cardConfig,
        displayValue,
      });
    });

    return cards;
  };

  const renderIndicadores = () => {
    if (!currentOption.indicadores && selectedCategory !== 'planteles' && selectedCategory !== 'categorias')
      return null;

    const cards = getIndicadores4();

    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {cards.map((card, index) => (
          <motion.div
            key={`${card.label}-${index}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`${
              isDarkMode ? 'bg-[#1a1c22] border-[#8c5cff]/20' : 'bg-white border-purple-200'
            } border rounded-2xl p-4 md:p-6`}
          >
            <div className="flex items-center justify-between mb-3">
              <p
                className={`text-xs md:text-sm font-semibold uppercase tracking-wider ${
                  isDarkMode ? 'text-[#8c5cff]' : 'text-purple-600'
                }`}
              >
                {card.label}
              </p>
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold text-white"
                style={{ backgroundColor: card.color }}
              >
                {card.icon}
              </div>
            </div>
            <p
              className={`text-xl md:text-2xl font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}
            >
              {card.displayValue}
            </p>
          </motion.div>
        ))}
      </div>
    );
  };

  const renderGraficos = () => {
    // Gráfico de barras
    const chartHeight = selectedCategory === 'categorias' ? 300 : 400;

    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Gráfico de Barras */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className={`lg:col-span-2 ${
            isDarkMode ? 'bg-[#1a1c22] border-[#8c5cff]/20' : 'bg-white border-purple-200'
          } border rounded-2xl p-6`}
        >
          <h3
            className={`text-lg font-bold mb-4 flex items-center gap-2 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}
          >
            <BarChart3 size={20} className="text-[#8C5CFF]" />
            Análisis Comparativo
          </h3>
          <ResponsiveContainer width="100%" height={chartHeight}>
            <BarChart
              data={currentOption.data}
              margin={{ top: 20, right: 30, left: 0, bottom: 80 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={isDarkMode ? '#8c5cff/20' : '#e0e0e0'}
              />
              <XAxis
                dataKey="name"
                angle={-45}
                textAnchor="end"
                height={120}
                tick={{ fontSize: 12, fill: isDarkMode ? '#9ca3af' : '#666' }}
              />
              <YAxis tick={{ fontSize: 12, fill: isDarkMode ? '#9ca3af' : '#666' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDarkMode ? '#0f1117' : '#fff',
                  border: `2px solid ${isDarkMode ? '#8c5cff' : '#8C5CFF'}`,
                  borderRadius: '8px',
                  color: isDarkMode ? '#fff' : '#000',
                }}
              />
              <Bar
                dataKey="value"
                fill="#8C5CFF"
                radius={[8, 8, 0, 0]}
                animationDuration={1000}
              />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Gráfico de Torta - Mostrar solo para categorías */}
        {selectedCategory === 'categorias' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className={`${
              isDarkMode ? 'bg-[#1a1c22] border-[#8c5cff]/20' : 'bg-white border-purple-200'
            } border rounded-2xl p-6`}
          >
            <h3
              className={`text-lg font-bold mb-4 flex items-center gap-2 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}
            >
              <TrendingUp size={20} className="text-[#8C5CFF]" />
              Distribución
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={currentOption.data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  animationDuration={800}
                >
                  {currentOption.data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color || COLORS_PIE[index % COLORS_PIE.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDarkMode ? '#0f1117' : '#fff',
                    border: `2px solid ${isDarkMode ? '#8c5cff' : '#8C5CFF'}`,
                    borderRadius: '8px',
                    color: isDarkMode ? '#fff' : '#000',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
      </motion.div>

      {/* Selectors */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8"
      >
        {/* Selector de Categoría */}
        <div>
          <label
            className={`block text-sm font-semibold mb-2 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}
          >
            Tipo de Análisis
          </label>
          <div
            className={`relative ${
              isDarkMode ? 'bg-[#1a1c22] border-[#8c5cff]/20' : 'bg-white border-purple-200'
            } border rounded-xl overflow-hidden`}
          >
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setSelectedOption(dashboardData[e.target.value].options[0].id);
              }}
              className={`w-full px-4 py-3 appearance-none font-semibold transition-colors ${
                isDarkMode
                  ? 'bg-[#1a1c22] text-white focus:bg-[#1a1c22]/80'
                  : 'bg-white text-gray-900 focus:bg-gray-50'
              } focus:outline-none focus:ring-2 focus:ring-[#8C5CFF]`}
            >
              <option value="planteles">Cantidad de Planteles</option>
              <option value="peso">Promedio de Peso</option>
              <option value="estatura">Promedio de Estatura</option>
              <option value="grasaCorporal">Porcentaje de Grasa Corporal</option>
              <option value="categorias">Categorías de Edad</option>
            </select>
            <ChevronDown
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C5CFF] pointer-events-none"
              size={20}
            />
          </div>
        </div>

        {/* Selector de Opción */}
        {currentData.options.length > 1 && (
          <div>
            <label
              className={`block text-sm font-semibold mb-2 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}
            >
              Filtrar por División
            </label>
            <div
              className={`relative ${
                isDarkMode ? 'bg-[#1a1c22] border-[#8c5cff]/20' : 'bg-white border-purple-200'
              } border rounded-xl overflow-hidden`}
            >
              <select
                value={selectedOption}
                onChange={(e) => setSelectedOption(e.target.value)}
                className={`w-full px-4 py-3 appearance-none font-semibold transition-colors ${
                  isDarkMode
                    ? 'bg-[#1a1c22] text-white focus:bg-[#1a1c22]/80'
                    : 'bg-white text-gray-900 focus:bg-gray-50'
                } focus:outline-none focus:ring-2 focus:ring-[#8C5CFF]`}
              >
                {currentData.options.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C5CFF] pointer-events-none"
                size={20}
              />
            </div>
          </div>
        )}
      </motion.div>

      {/* Indicadores */}
      <AnimatePresence mode="wait">{renderIndicadores()}</AnimatePresence>

      {/* Gráficos */}
      <AnimatePresence mode="wait">{renderGraficos()}</AnimatePresence>

      {/* Gráfico de Posiciones - Secundario */}
      {selectedCategory !== 'categorias' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className={`${
            isDarkMode ? 'bg-[#1a1c22] border-[#8c5cff]/20' : 'bg-white border-purple-200'
          } border rounded-2xl p-6`}
        >
          <h3
            className={`text-lg font-bold mb-4 flex items-center gap-2 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}
          >
            <Users size={20} className="text-[#8C5CFF]" />
            Distribución por Posición
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfico de Torta de Posiciones */}
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={posicionData.data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  animationDuration={800}
                >
                  {posicionData.data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDarkMode ? '#0f1117' : '#fff',
                    border: `2px solid ${isDarkMode ? '#8c5cff' : '#8C5CFF'}`,
                    borderRadius: '8px',
                    color: isDarkMode ? '#fff' : '#000',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Lista de Posiciones */}
            <div className="flex flex-col justify-center">
              {posicionData.data.map((pos, index) => (
                <motion.div
                  key={pos.name}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex items-center justify-between p-3 mb-2 rounded-lg ${
                    isDarkMode ? 'bg-[#0f1117]' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: pos.color }}
                    ></div>
                    <span
                      className={`font-semibold ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      {pos.name}
                    </span>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-bold text-lg ${
                        isDarkMode ? 'text-[#8c5cff]' : 'text-purple-600'
                      }`}
                    >
                      {pos.value}
                    </p>
                    <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>
                      {((pos.value / posicionData.total) * 100).toFixed(1)}%
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default AnthropometricDashboard;
