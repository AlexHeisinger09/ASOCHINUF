import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Restaurar sesión al cargar
  useEffect(() => {
    const storedToken = localStorage.getItem('asochinuf_token');
    const storedUsuario = localStorage.getItem('asochinuf_usuario');

    if (storedToken && storedUsuario) {
      setToken(storedToken);
      setUsuario(JSON.parse(storedUsuario));
    }

    setIsLoading(false);
  }, []);

  const login = async (email, password) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al iniciar sesión');
      }

      localStorage.setItem('asochinuf_token', data.token);
      localStorage.setItem('asochinuf_usuario', JSON.stringify(data.usuario));

      setToken(data.token);
      setUsuario(data.usuario);

      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const registro = async (email, password, nombre, apellido) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:5000/api/auth/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, nombre, apellido }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al registrarse');
      }

      localStorage.setItem('asochinuf_token', data.token);
      localStorage.setItem('asochinuf_usuario', JSON.stringify(data.usuario));

      setToken(data.token);
      setUsuario(data.usuario);

      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('asochinuf_token');
    localStorage.removeItem('asochinuf_usuario');
    setToken(null);
    setUsuario(null);
    setError(null);
  };

  const obtenerPerfil = async () => {
    if (!token) {
      throw new Error('No hay token disponible');
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 403) {
          logout();
          throw new Error('Sesión expirada');
        }
        throw new Error('Error al obtener perfil');
      }

      const data = await response.json();
      setUsuario(data);
      localStorage.setItem('asochinuf_usuario', JSON.stringify(data));

      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const value = {
    usuario,
    token,
    isLoading,
    error,
    login,
    registro,
    logout,
    obtenerPerfil,
    isAuthenticated: !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }

  return context;
};
