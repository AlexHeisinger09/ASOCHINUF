import pool from '../config/database.js';

const agregarCursosEjemplo = async () => {
  try {
    console.log('Iniciando inserción de cursos de ejemplo...');

    const cursos = [
      {
        codigo_curso: 'NUT-201',
        nombre: 'Nutrición Deportiva Avanzada',
        descripcion: 'Curso especializado en nutrición para atletas de alto rendimiento. Aprenderás a diseñar planes nutricionales personalizados para diferentes deportes.',
        categoria_id: 1,
        nivel: 'avanzado',
        duracion_horas: 60,
        modalidad: 'mixto',
        fecha_inicio: '2025-03-01',
        fecha_fin: '2025-06-30',
        precio: 250000,
        descuento: 10,
        moneda: 'CLP',
        nombre_instructor: 'Dra. María González',
        imagen_portada: null,
        video_promocional: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
        materiales: 'Manuales PDF, Videos de casos prácticos, Ejercicios interactivos',
        url_curso: 'https://cursos.example.com/nutricion-deportiva-avanzada',
        estado: 'activo'
      },
      {
        codigo_curso: 'NUT-202',
        nombre: 'Nutrición Pediátrica',
        descripcion: 'Especialización en nutrición para niños y adolescentes. Cobrimos desde alimentación complementaria hasta nutrición en edad escolar.',
        categoria_id: 2,
        nivel: 'intermedio',
        duracion_horas: 48,
        modalidad: 'online',
        fecha_inicio: '2025-02-15',
        fecha_fin: '2025-05-15',
        precio: 180000,
        descuento: 5,
        moneda: 'CLP',
        nombre_instructor: 'Dr. Roberto Fernández',
        imagen_portada: null,
        video_promocional: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
        materiales: 'Guías de edad, Tablas de referencia, Casos clínicos',
        url_curso: 'https://cursos.example.com/nutricion-pediatrica',
        estado: 'activo'
      },
      {
        codigo_curso: 'NUT-203',
        nombre: 'Nutrición Clínica y Patologías',
        descripcion: 'Curso dirigido a profesionales sanitarios. Manejo nutricional de enfermedades crónicas, diabetes, obesidad y patologías gastrointestinales.',
        categoria_id: 3,
        nivel: 'avanzado',
        duracion_horas: 72,
        modalidad: 'presencial',
        fecha_inicio: '2025-04-01',
        fecha_fin: '2025-07-31',
        precio: 320000,
        descuento: 15,
        moneda: 'CLP',
        nombre_instructor: 'Prof. Carlos Pérez',
        imagen_portada: null,
        video_promocional: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
        materiales: 'Protocolos clínicos, Estudios de caso, Legislación sanitaria',
        url_curso: 'https://cursos.example.com/nutricion-clinica',
        estado: 'activo'
      },
      {
        codigo_curso: 'NUT-204',
        nombre: 'Nutrición Deportiva Básica',
        descripcion: 'Introducción a los principios fundamentales de la nutrición deportiva. Ideal para entrenadores personales y deportistas aficionados.',
        categoria_id: 1,
        nivel: 'básico',
        duracion_horas: 30,
        modalidad: 'online',
        fecha_inicio: '2025-01-20',
        fecha_fin: '2025-03-20',
        precio: 120000,
        descuento: 0,
        moneda: 'CLP',
        nombre_instructor: 'Lic. Andrea López',
        imagen_portada: null,
        video_promocional: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
        materiales: 'Guía nutricional, Videos cortos, Recetas deportivas',
        url_curso: 'https://cursos.example.com/nutricion-deportiva-basica',
        estado: 'activo'
      }
    ];

    for (const curso of cursos) {
      // Calculate precio_final: precio - (precio * descuento / 100)
      const precioValue = curso.precio || 0;
      const descuentoValue = curso.descuento || 0;
      const precioFinal = precioValue > 0 ? precioValue - (precioValue * (descuentoValue / 100)) : 0;

      const resultado = await pool.query(
        `INSERT INTO t_cursos
         (codigo_curso, nombre, descripcion, categoria_id, nivel, duracion_horas,
          modalidad, fecha_inicio, fecha_fin, precio, descuento, precio_final, moneda,
          nombre_instructor, imagen_portada, video_promocional,
          materiales, url_curso, estado)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
         RETURNING id_curso, nombre`,
        [
          curso.codigo_curso,
          curso.nombre,
          curso.descripcion,
          curso.categoria_id,
          curso.nivel,
          curso.duracion_horas,
          curso.modalidad,
          curso.fecha_inicio,
          curso.fecha_fin,
          curso.precio,
          curso.descuento,
          precioFinal,
          curso.moneda,
          curso.nombre_instructor,
          curso.imagen_portada,
          curso.video_promocional,
          curso.materiales,
          curso.url_curso,
          curso.estado
        ]
      );

      console.log(`✓ Curso creado: ${resultado.rows[0].nombre} (ID: ${resultado.rows[0].id_curso}) - Precio Final: $${precioFinal}`);
    }

    console.log('\n✓ Todos los cursos de ejemplo han sido agregados exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('Error al agregar cursos de ejemplo:', error);
    process.exit(1);
  }
};

agregarCursosEjemplo();
