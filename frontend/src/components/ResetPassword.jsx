import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, CheckCircle, AlertCircle } from 'lucide-react';
import { API_ENDPOINTS } from '../config/apiConfig';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState(null);

  // Verificar token al cargar
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setTokenValid(false);
        setError('Token no proporcionado');
        return;
      }

      try {
        const response = await fetch(API_ENDPOINTS.AUTH.VERIFICAR_TOKEN(token));
        if (response.ok) {
          setTokenValid(true);
        } else {
          setTokenValid(false);
          setError('Token inválido o expirado');
        }
      } catch (err) {
        setTokenValid(false);
        setError('Error al verificar el token');
      }
    };

    verifyToken();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validaciones
    if (!password) {
      setError('Por favor ingresa una contraseña');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(API_ENDPOINTS.AUTH.RESTABLECER_CONTRASENA, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          nuevaContrasena: password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/');
        }, 3000);
      } else {
        setError(data.error || 'Error al restablecer la contraseña');
      }
    } catch (err) {
      setError('Error de conexión. Por favor intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity }}
            className="inline-block mb-4"
          >
            <Lock size={48} className="text-[#8c5cff]" />
          </motion.div>
          <h1 className="text-3xl font-bold mb-2">Restablecer Contraseña</h1>
          <p className="text-gray-400">Ingresa tu nueva contraseña</p>
        </div>

        {/* Token inválido */}
        {tokenValid === false && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6 flex items-start gap-3"
          >
            <AlertCircle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-400 mb-1">Token Inválido</h3>
              <p className="text-sm text-gray-300">{error}</p>
              <button
                onClick={() => navigate('/')}
                className="mt-2 text-sm text-red-400 hover:text-red-300 underline"
              >
                Volver al inicio
              </button>
            </div>
          </motion.div>
        )}

        {/* Formulario */}
        {tokenValid === true && !success && (
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-start gap-2"
              >
                <AlertCircle size={18} className="text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-300">{error}</p>
              </motion.div>
            )}

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                Nueva Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingresa tu nueva contraseña"
                className="w-full px-4 py-3 bg-[#1a1c22] border border-[#8c5cff]/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#8c5cff] transition-colors"
              />
              {password.length > 0 && password.length < 6 && (
                <p className="text-xs text-yellow-400 mt-1">Mínimo 6 caracteres</p>
              )}
            </div>

            {/* Confirm Password Input */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                Confirmar Contraseña
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirma tu contraseña"
                className="w-full px-4 py-3 bg-[#1a1c22] border border-[#8c5cff]/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#8c5cff] transition-colors"
              />
              {password && confirmPassword && password === confirmPassword && (
                <p className="text-xs text-green-400 mt-1">Las contraseñas coinciden</p>
              )}
              {password && confirmPassword && password !== confirmPassword && (
                <p className="text-xs text-red-400 mt-1">Las contraseñas no coinciden</p>
              )}
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading || !password || !confirmPassword}
              className="w-full bg-gradient-to-r from-[#8c5cff] to-[#6a3dcf] text-white font-semibold py-3 rounded-lg hover:shadow-lg hover:shadow-[#8c5cff]/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 mt-6"
            >
              {loading ? 'Restableciendo...' : 'Restablecer Contraseña'}
            </motion.button>

            {/* Back Link */}
            <button
              type="button"
              onClick={() => navigate('/')}
              className="w-full text-center text-sm text-gray-400 hover:text-white transition-colors"
            >
              Volver al inicio
            </button>
          </motion.form>
        )}

        {/* Success Message */}
        {success && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 0.5 }}
              className="inline-block mb-4"
            >
              <CheckCircle size={48} className="text-green-400" />
            </motion.div>
            <h2 className="text-2xl font-bold mb-2">¡Contraseña Actualizada!</h2>
            <p className="text-gray-400 mb-4">Tu contraseña ha sido restablecida exitosamente.</p>
            <p className="text-sm text-gray-500">Redirigiendo al inicio en unos momentos...</p>
          </motion.div>
        )}

        {/* Loading state */}
        {tokenValid === null && (
          <div className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity }}
              className="inline-block mb-4"
            >
              <div className="w-8 h-8 border-2 border-[#8c5cff] border-t-transparent rounded-full" />
            </motion.div>
            <p className="text-gray-400">Verificando token...</p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ResetPassword;
