import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, File, CheckCircle, AlertCircle, X, Loader } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const ExcelSection = ({ containerVariants }) => {
  const { isDarkMode, token, usuario } = useAuth();
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [error, setError] = useState('');
  const [uploadHistory, setUploadHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const API_URL = 'http://localhost:5001/api/excel';

  // Cargar historial de cargas
  useEffect(() => {
    cargarHistorial();
  }, []);

  const cargarHistorial = async () => {
    try {
      setLoadingHistory(true);
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get(`${API_URL}/history`, config);
      setUploadHistory(response.data);
    } catch (err) {
      console.error('Error al cargar historial:', err);
      setError('No se pudo cargar el historial de cargas');
    } finally {
      setLoadingHistory(false);
    }
  };

  // Validar que sea nutricionista o admin
  if (usuario?.tipo_perfil !== 'nutricionista' && usuario?.tipo_perfil !== 'admin') {
    return (
      <motion.div
        key="excel"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="space-y-6"
      >
        <div
          className={`p-8 rounded-2xl border text-center ${
            isDarkMode ? 'bg-[#1a1c22]/50 border-red-500/20' : 'bg-red-50 border-red-200'
          }`}
        >
          <AlertCircle
            size={48}
            className={`mx-auto mb-4 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}
          />
          <h3 className={`text-lg font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Acceso Restringido
          </h3>
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
            Solo los nutricionistas y administradores pueden cargar archivos Excel.
          </p>
        </div>
      </motion.div>
    );
  }

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        setSelectedFile(file);
        setError('');
      } else {
        setError('Solo se permiten archivos Excel (.xlsx, .xls)');
      }
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        setSelectedFile(file);
        setError('');
      } else {
        setError('Solo se permiten archivos Excel (.xlsx, .xls)');
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Selecciona un archivo primero');
      return;
    }

    try {
      setIsUploading(true);
      setError('');
      setUploadResult(null);

      const formData = new FormData();
      formData.append('file', selectedFile);

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      };

      const response = await axios.post(`${API_URL}/upload`, formData, config);

      setUploadResult(response.data);
      setSelectedFile(null);

      // Recargar historial
      await cargarHistorial();

      // Limpiar resultado después de 5 segundos
      setTimeout(() => {
        setUploadResult(null);
      }, 5000);
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Error al cargar el archivo';
      setError(errorMessage);
      console.error('Error en upload:', err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <motion.div
      key="excel"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <h2 className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Cargar Excel Antropométrico
        </h2>
        <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
          Carga datos de mediciones antropométricas desde archivos Excel. Solo se aceptan archivos
          con la estructura estándar (.xlsx).
        </p>
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

      {/* Success Message */}
      <AnimatePresence>
        {uploadResult && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-4 rounded-lg border flex items-start gap-3 ${
              isDarkMode
                ? 'bg-green-500/20 border-green-500/50 text-green-400'
                : 'bg-green-100 border-green-300 text-green-700'
            }`}
          >
            <CheckCircle size={24} className="flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold">Carga exitosa</h4>
              <p className="text-sm mt-1">
                Plantel: <strong>{uploadResult.plantel}</strong> • Registros insertados:{' '}
                <strong>{uploadResult.registrosInsertados}</strong>
                {uploadResult.registrosDuplicados > 0 && (
                  <>
                    {' '}
                    • Duplicados: <strong>{uploadResult.registrosDuplicados}</strong>
                  </>
                )}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Drag & Drop Zone */}
      <motion.div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        whileHover={{ scale: 1.01 }}
        className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
          isDragging
            ? isDarkMode
              ? 'border-[#8c5cff]/60 bg-[#8c5cff]/10'
              : 'border-purple-500 bg-purple-50'
            : isDarkMode
            ? 'border-[#8c5cff]/20 bg-[#1a1c22]/50'
            : 'border-purple-200 bg-white/50'
        }`}
      >
        <Upload
          size={48}
          className={`mx-auto mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`}
        />
        <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Arrastra tu archivo aquí
        </h3>
        <p className={`mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          o haz clic para seleccionar un archivo
        </p>

        <label
          className={`inline-block px-6 py-2 rounded-lg font-semibold transition-all cursor-pointer ${
            isDarkMode
              ? 'bg-gradient-to-r from-[#8c5cff] to-[#6a3dcf] text-white hover:shadow-lg hover:shadow-[#8c5cff]/50'
              : 'bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:shadow-lg'
          }`}
        >
          Seleccionar Archivo
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileSelect}
            className="hidden"
          />
        </label>

        {selectedFile && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-4 p-3 rounded-lg flex items-center gap-2 ${
              isDarkMode ? 'bg-[#8c5cff]/20' : 'bg-purple-100'
            }`}
          >
            <File size={20} className="text-[#8c5cff]" />
            <div className="flex-1 text-left">
              <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {selectedFile.name}
              </p>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {(selectedFile.size / 1024).toFixed(2)} KB
              </p>
            </div>
            <button
              onClick={() => setSelectedFile(null)}
              className={`p-1 rounded hover:bg-red-500/20 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}
            >
              <X size={20} />
            </button>
          </motion.div>
        )}
      </motion.div>

      {/* Upload Button */}
      {selectedFile && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleUpload}
          disabled={isUploading}
          className={`w-full py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
            isUploading
              ? 'bg-gray-400 cursor-not-allowed'
              : isDarkMode
              ? 'bg-gradient-to-r from-[#8c5cff] to-[#6a3dcf] text-white hover:shadow-lg hover:shadow-[#8c5cff]/50'
              : 'bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:shadow-lg'
          }`}
        >
          {isUploading ? (
            <>
              <Loader size={20} className="animate-spin" />
              Cargando...
            </>
          ) : (
            <>
              <Upload size={20} />
              Cargar Archivo
            </>
          )}
        </motion.button>
      )}

      {/* Upload History */}
      <div>
        <h3 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Historial de Cargas
        </h3>

        {loadingHistory ? (
          <div
            className={`p-8 text-center rounded-2xl border ${
              isDarkMode ? 'bg-[#1a1c22]/50 border-[#8c5cff]/20' : 'bg-white/50 border-purple-200'
            }`}
          >
            <Loader size={32} className="mx-auto animate-spin text-[#8c5cff]" />
          </div>
        ) : uploadHistory.length === 0 ? (
          <div
            className={`p-8 text-center rounded-2xl border ${
              isDarkMode ? 'bg-[#1a1c22]/50 border-[#8c5cff]/20' : 'bg-white/50 border-purple-200'
            }`}
          >
            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
              No hay cargas registradas aún
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {uploadHistory.map((item) => (
              <motion.div
                key={item.id}
                whileHover={{ y: -2 }}
                className={`p-4 rounded-lg border transition-all ${
                  isDarkMode
                    ? 'bg-[#1a1c22]/50 border-[#8c5cff]/20 hover:border-[#8c5cff]/40'
                    : 'bg-white/50 border-purple-200 hover:border-purple-400'
                }`}
              >
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div className="flex-1 min-w-0">
                    <h4 className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {item.plantel}
                    </h4>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {item.nombre_archivo}
                    </p>
                    <div className="flex flex-wrap gap-4 mt-2 text-xs">
                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                        📅 {new Date(item.fecha_sesion).toLocaleDateString('es-CL')}
                      </span>
                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                        📊 {item.cantidad_registros} registros
                      </span>
                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                        👤 {item.nutricionista_nombre}
                      </span>
                    </div>
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

export default ExcelSection;
