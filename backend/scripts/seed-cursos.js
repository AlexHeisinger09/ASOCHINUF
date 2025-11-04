import pool from '../config/database.js';

async function seedCursos() {
  try {
    console.log('🔄 Sembrando cursos de ejemplo...\n');

    const cursos = [
      {
        codigo_curso: 'NUTRI-001',
        nombre: 'Fundamentos de Nutrición',
        descripcion: 'Curso básico sobre principios de nutrición y dietética.',
        nivel: 'básico',
        duracion_horas: 40,
        modalidad: 'online',
        precio: 150000,
        descuento: 10,
        moneda: 'CLP',
        nombre_instructor: 'Dr. Juan García',
        estado: 'activo'
      },
      {
        codigo_curso: 'NUTRI-002',
        nombre: 'Nutrición Deportiva Avanzada',
        descripcion: 'Especialización en nutrición para atletas y deportistas.',
        nivel: 'avanzado',
        duracion_horas: 60,
        modalidad: 'mixto',
        precio: 300000,
        descuento: 15,
        moneda: 'CLP',
        nombre_instructor: 'Dr. Carlos López',
        estado: 'activo'
      },
      {
        codigo_curso: 'NUTRI-003',
        nombre: 'Dietética Clínica',
        descripcion: 'Manejo nutricional de pacientes con enfermedades crónicas.',
        nivel: 'intermedio',
        duracion_horas: 50,
        modalidad: 'presencial',
        precio: 250000,
        descuento: 5,
        moneda: 'CLP',
        nombre_instructor: 'Dra. María Rodríguez',
        estado: 'activo'
      },
      {
        codigo_curso: 'NUTRI-004',
        nombre: 'Nutrición Pediátrica',
        descripcion: 'Especialización en nutrición infantil y adolescente.',
        nivel: 'intermedio',
        duracion_horas: 45,
        modalidad: 'online',
        precio: 200000,
        descuento: 0,
        moneda: 'CLP',
        nombre_instructor: 'Dra. Patricia Chen',
        estado: 'activo'
      },
      {
        codigo_curso: 'NUTRI-005',
        nombre: 'Taller de Elaboración de Planes Nutricionales',
        descripcion: 'Práctica en elaboración de planes personalizados.',
        nivel: 'avanzado',
        duracion_horas: 30,
        modalidad: 'mixto',
        precio: 180000,
        descuento: 20,
        moneda: 'CLP',
        nombre_instructor: 'Lic. Roberto Silva',
        estado: 'activo'
      }
    ];

    for (const curso of cursos) {
      try {
        const result = await pool.query(
          `INSERT INTO t_cursos
           (codigo_curso, nombre, descripcion, nivel, duracion_horas, modalidad,
            precio, descuento, moneda, nombre_instructor, estado)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
           RETURNING id_curso, codigo_curso, nombre`,
          [
            curso.codigo_curso,
            curso.nombre,
            curso.descripcion,
            curso.nivel,
            curso.duracion_horas,
            curso.modalidad,
            curso.precio,
            curso.descuento,
            curso.moneda,
            curso.nombre_instructor,
            curso.estado
          ]
        );

        console.log(`✅ Curso creado: ${result.rows[0].nombre} (ID: ${result.rows[0].id_curso})`);
      } catch (error) {
        if (error.message.includes('duplicate key')) {
          console.log(`⚠️ Curso ${curso.codigo_curso} ya existe`);
        } else {
          throw error;
        }
      }
    }

    // Mostrar resumen
    console.log('\n📊 Cursos en base de datos:\n');
    const allCursos = await pool.query(`
      SELECT id_curso, codigo_curso, nombre, nivel, precio, precio_final, estado
      FROM t_cursos
      WHERE estado = 'activo'
      ORDER BY nombre
    `);

    allCursos.rows.forEach(curso => {
      const precioFinal = (curso.precio_final || 0).toLocaleString('es-CL', { style: 'currency', currency: 'CLP' });
      console.log(`  • ${curso.nombre.padEnd(35)} [${curso.nivel.padEnd(11)}] ${precioFinal}`);
    });

    console.log(`\n✅ Total: ${allCursos.rows.length} cursos activos\n`);
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Error al sembrar cursos:', error.message);
    process.exit(1);
  }
}

seedCursos();
