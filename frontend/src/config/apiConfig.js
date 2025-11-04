// Configuración centralizada de la API
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: `${API_URL}/api/auth/login`,
    REGISTRO: `${API_URL}/api/auth/registro`,
    ME: `${API_URL}/api/auth/me`,
    SOLICITAR_RECUPERACION: `${API_URL}/api/auth/solicitar-recuperacion`,
    VERIFICAR_TOKEN: (token) => `${API_URL}/api/auth/verificar-token/${token}`,
    RESTABLECER_CONTRASENA: `${API_URL}/api/auth/restablecer-contrasena`,
    CAMBIAR_CONTRASENA: `${API_URL}/api/auth/cambiar-contrasena`,
    ACTUALIZAR_FOTO: `${API_URL}/api/auth/actualizar-foto`,
  },
  // Excel
  EXCEL: {
    UPLOAD: `${API_URL}/api/excel/upload`,
    HISTORY: `${API_URL}/api/excel/history`,
    SESSION_DETAILS: (sesionId) => `${API_URL}/api/excel/session/${sesionId}`,
  },
  // Cursos
  CURSOS: {
    GET_ALL: `${API_URL}/api/cursos`,
    GET_ONE: (id) => `${API_URL}/api/cursos/${id}`,
    CREATE: `${API_URL}/api/cursos`,
    UPDATE: (id) => `${API_URL}/api/cursos/${id}`,
    DELETE: (id) => `${API_URL}/api/cursos/${id}`,
    BY_NIVEL: (nivel) => `${API_URL}/api/cursos/nivel/${nivel}`,
    BY_CATEGORIA: (categoriaId) => `${API_URL}/api/cursos/categoria/${categoriaId}`,
    SEARCH: (query) => `${API_URL}/api/cursos/search?q=${query}`,
  },
};

export const BASE = API_URL;

export default API_URL;
