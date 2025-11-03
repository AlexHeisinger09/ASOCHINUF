import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './config/database.js';
import authRoutes from './routes/auth.js';
import excelRoutes from './routes/excel.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/excel', excelRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Backend funcionando correctamente' });
});

// Manejo de errores 404
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Iniciar servidor
const iniciarServidor = async () => {
  try {
    // Probar conexión a BD
    const resultado = await pool.query('SELECT NOW()');
    console.log('✓ Conexión a PostgreSQL exitosa:', resultado.rows[0]);

    app.listen(PORT, () => {
      console.log(`✓ Servidor ejecutándose en puerto ${PORT}`);
      console.log(`✓ URL: http://localhost:${PORT}`);
      console.log(`✓ Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('✗ Error al conectar a PostgreSQL:', error.message);
    process.exit(1);
  }
};

iniciarServidor();

export default app;
