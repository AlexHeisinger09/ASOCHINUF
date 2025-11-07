import pool from '../config/database.js';

const agregarPlantelesEjemplo = async () => {
  try {
    console.log('Iniciando inserción de planteles de ejemplo...');

    const planteles = [
      {
        nombre: 'Colchagua',
        division: 'Segunda División',
        ciudad: 'San Félix de Colchagua',
        region: 'Región del Libertador General Bernardo O\'Higgins'
      },
      {
        nombre: 'Malleco Unido',
        division: 'Primera B',
        ciudad: 'Angol',
        region: 'Región de La Araucanía'
      },
      {
        nombre: 'Naval',
        division: 'Segunda División',
        ciudad: 'Talcahuano',
        region: 'Región del Bío-Bío'
      },
      {
        nombre: 'Deportes Colina',
        division: 'Tercera División A',
        ciudad: 'Colina',
        region: 'Región Metropolitana'
      },
      {
        nombre: 'Comunal Cabrero',
        division: 'Segunda División',
        ciudad: 'Cabrero',
        region: 'Región del Bío-Bío'
      }
    ];

    // Get admin user for usuario_creacion
    const adminUser = await pool.query(
      `SELECT id FROM t_usuarios WHERE tipo_perfil = 'admin' LIMIT 1`
    );

    if (adminUser.rows.length === 0) {
      console.error('No se encontró usuario admin. Por favor, cree un usuario admin primero.');
      process.exit(1);
    }

    const usuarioId = adminUser.rows[0].id;

    for (const plantel of planteles) {
      try {
        const resultado = await pool.query(
          `INSERT INTO t_planteles
           (nombre, division, ciudad, region, usuario_creacion, fecha_creacion, activo)
           VALUES ($1, $2, $3, $4, $5, NOW(), true)
           RETURNING id, nombre`,
          [
            plantel.nombre,
            plantel.division,
            plantel.ciudad,
            plantel.region,
            usuarioId
          ]
        );

        console.log(`✓ Plantel creado: ${resultado.rows[0].nombre} (ID: ${resultado.rows[0].id}) - División: ${plantel.division}`);
      } catch (error) {
        if (error.message.includes('unique constraint')) {
          console.log(`⚠ Plantel ya existe: ${plantel.nombre}`);
        } else {
          throw error;
        }
      }
    }

    console.log('\n✓ Todos los planteles de ejemplo han sido procesados exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('Error al agregar planteles de ejemplo:', error);
    process.exit(1);
  }
};

agregarPlantelesEjemplo();
