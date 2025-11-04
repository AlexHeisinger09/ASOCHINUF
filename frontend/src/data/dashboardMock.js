// Datos mockeados para el Dashboard de Informes Antropométricos

export const dashboardData = {
  planteles: {
    label: "Cantidad de Planteles",
    options: [
      {
        id: "primera",
        label: "Primera División",
        data: [
          { name: "Colo-Colo", value: 35 },
          { name: "Universidad de Chile", value: 32 },
          { name: "Universidad Católica", value: 30 },
          { name: "Ñublense", value: 28 },
          { name: "Deportes Antofagasta", value: 25 },
          { name: "Audax Italiano", value: 26 },
          { name: "O'Higgins", value: 29 },
          { name: "Magallanes", value: 24 },
        ],
        indicadores: {
          total: 229,
          promedio: 28.6,
        },
      },
      {
        id: "segunda",
        label: "Segunda División",
        data: [
          { name: "Deportes Iquique", value: 22 },
          { name: "Rangers", value: 20 },
          { name: "Puerto Montt", value: 19 },
          { name: "Palestino", value: 21 },
          { name: "Huachipato", value: 23 },
          { name: "Cobreloa", value: 18 },
        ],
        indicadores: {
          total: 123,
          promedio: 20.5,
        },
      },
    ],
  },
  peso: {
    label: "Promedio de Peso (kg)",
    options: [
      {
        id: "primera",
        label: "Primera División",
        data: [
          { name: "Colo-Colo", value: 81.5 },
          { name: "Universidad de Chile", value: 79.8 },
          { name: "Universidad Católica", value: 80.2 },
          { name: "Ñublense", value: 78.9 },
          { name: "Deportes Antofagasta", value: 82.1 },
          { name: "Audax Italiano", value: 79.4 },
          { name: "O'Higgins", value: 80.6 },
          { name: "Magallanes", value: 77.3 },
        ],
        indicadores: {
          promedio: 80.0,
          minimo: 77.3,
          maximo: 82.1,
        },
      },
      {
        id: "segunda",
        label: "Segunda División",
        data: [
          { name: "Deportes Iquique", value: 78.2 },
          { name: "Rangers", value: 76.5 },
          { name: "Puerto Montt", value: 77.8 },
          { name: "Palestino", value: 79.1 },
          { name: "Huachipato", value: 80.3 },
          { name: "Cobreloa", value: 75.9 },
        ],
        indicadores: {
          promedio: 77.9,
          minimo: 75.9,
          maximo: 80.3,
        },
      },
    ],
  },
  estatura: {
    label: "Promedio de Estatura (cm)",
    options: [
      {
        id: "primera",
        label: "Primera División",
        data: [
          { name: "Colo-Colo", value: 182.3 },
          { name: "Universidad de Chile", value: 181.9 },
          { name: "Universidad Católica", value: 182.1 },
          { name: "Ñublense", value: 181.2 },
          { name: "Deportes Antofagasta", value: 183.5 },
          { name: "Audax Italiano", value: 181.8 },
          { name: "O'Higgins", value: 182.6 },
          { name: "Magallanes", value: 180.4 },
        ],
        indicadores: {
          promedio: 181.9,
          minimo: 180.4,
          maximo: 183.5,
        },
      },
      {
        id: "segunda",
        label: "Segunda División",
        data: [
          { name: "Deportes Iquique", value: 180.5 },
          { name: "Rangers", value: 179.8 },
          { name: "Puerto Montt", value: 180.2 },
          { name: "Palestino", value: 181.3 },
          { name: "Huachipato", value: 182.1 },
          { name: "Cobreloa", value: 179.6 },
        ],
        indicadores: {
          promedio: 180.6,
          minimo: 179.6,
          maximo: 182.1,
        },
      },
    ],
  },
  grasaCorporal: {
    label: "Promedio de Porcentaje de Grasa (%)",
    options: [
      {
        id: "primera",
        label: "Primera División",
        data: [
          { name: "Colo-Colo", value: 9.5 },
          { name: "Universidad de Chile", value: 8.8 },
          { name: "Universidad Católica", value: 9.1 },
          { name: "Ñublense", value: 8.6 },
          { name: "Deportes Antofagasta", value: 10.2 },
          { name: "Audax Italiano", value: 8.9 },
          { name: "O'Higgins", value: 9.4 },
          { name: "Magallanes", value: 8.3 },
        ],
        indicadores: {
          promedio: 9.1,
          minimo: 8.3,
          maximo: 10.2,
        },
      },
      {
        id: "segunda",
        label: "Segunda División",
        data: [
          { name: "Deportes Iquique", value: 10.1 },
          { name: "Rangers", value: 9.5 },
          { name: "Puerto Montt", value: 9.8 },
          { name: "Palestino", value: 10.3 },
          { name: "Huachipato", value: 10.6 },
          { name: "Cobreloa", value: 9.2 },
        ],
        indicadores: {
          promedio: 9.9,
          minimo: 9.2,
          maximo: 10.6,
        },
      },
    ],
  },
  categorias: {
    label: "Distribución por Categoría de Edad",
    options: [
      {
        id: "todas",
        label: "Todas las Categorías",
        data: [
          { name: "Sub-14", value: 45, color: "#FF6B6B" },
          { name: "Sub-15", value: 67, color: "#4ECDC4" },
          { name: "Sub-16", value: 78, color: "#45B7D1" },
          { name: "Sub-17", value: 82, color: "#FFA07A" },
          { name: "Sub-18", value: 95, color: "#98D8C8" },
          { name: "Senior", value: 201, color: "#8C5CFF" },
        ],
        indicadores: {
          total: 568,
          mayorCategoria: "Senior",
          menorCategoria: "Sub-14",
        },
      },
    ],
  },
};

// Datos para gráfico de comparación por posición
export const posicionData = {
  label: "Distribución por Posición",
  data: [
    { name: "Porteros", value: 45, color: "#FFD93D" },
    { name: "Defensas", value: 156, color: "#6BCB77" },
    { name: "Mediocampistas", value: 182, color: "#4D96FF" },
    { name: "Delanteros", value: 108, color: "#FF6B6B" },
  ],
  total: 491,
};

// Datos para estadísticas generales del sistema
export const estadisticasGenerales = {
  totalJugadores: 568,
  totalExceles: 24,
  ultimaActualizacion: "2024-11-04",
  jugadoresActualizados: 342,
};

// Datos para últimos excels cargados
export const excelsCargados = [
  {
    id: 1,
    nombre: "Reporte Colo-Colo Nov 2024",
    fecha: "2024-11-03",
    cantidad: 45,
    estado: "completado",
  },
  {
    id: 2,
    nombre: "Datos Universidad de Chile",
    fecha: "2024-11-02",
    cantidad: 38,
    estado: "completado",
  },
  {
    id: 3,
    nombre: "Medidas Universidad Católica",
    fecha: "2024-11-01",
    cantidad: 42,
    estado: "completado",
  },
  {
    id: 4,
    nombre: "Informe Ñublense Oct 2024",
    fecha: "2024-10-28",
    cantidad: 35,
    estado: "completado",
  },
  {
    id: 5,
    nombre: "Datos Deportes Antofagasta",
    fecha: "2024-10-25",
    cantidad: 51,
    estado: "completado",
  },
];

// Datos para gráfico de crecimiento de datos
export const crecimientoDatos = [
  { mes: "Enero", jugadores: 120, excels: 4 },
  { mes: "Febrero", jugadores: 185, excels: 6 },
  { mes: "Marzo", jugadores: 235, excels: 8 },
  { mes: "Abril", jugadores: 290, excels: 10 },
  { mes: "Mayo", jugadores: 340, excels: 12 },
  { mes: "Junio", jugadores: 400, excels: 15 },
  { mes: "Julio", jugadores: 450, excels: 17 },
  { mes: "Agosto", jugadores: 500, excels: 19 },
  { mes: "Septiembre", jugadores: 535, excels: 21 },
  { mes: "Octubre", jugadores: 555, excels: 23 },
  { mes: "Noviembre", jugadores: 568, excels: 24 },
];

// Datos para distribución de usuarios
export const distribucionUsuarios = [
  { name: "Clientes", value: 342, color: "#8C5CFF" },
  { name: "Nutricionistas", value: 18, color: "#6BCB77" },
  { name: "Administradores", value: 3, color: "#FF6B6B" },
];

// Datos para actividades recientes del sistema
export const actividadesRecientes = [
  {
    id: 1,
    accion: "Carga de Excel",
    descripcion: "Reporte Colo-Colo actualizado con 45 registros",
    fecha: "Hoy a las 14:30",
    tipo: "excel",
  },
  {
    id: 2,
    accion: "Nuevo Usuario",
    descripcion: "Cliente registrado: Juan Pérez Gonzalez",
    fecha: "Hoy a las 10:15",
    tipo: "usuario",
  },
  {
    id: 3,
    accion: "Datos Actualizados",
    descripcion: "Medidas antropométricas actualizadas para 38 jugadores",
    fecha: "Ayer a las 16:45",
    tipo: "datos",
  },
  {
    id: 4,
    accion: "Reporte Generado",
    descripcion: "Análisis de peso y estatura - Primera División",
    fecha: "Ayer a las 09:30",
    tipo: "reporte",
  },
  {
    id: 5,
    accion: "Carga de Excel",
    descripcion: "Datos Universidad de Chile - 38 registros",
    fecha: "Hace 2 días",
    tipo: "excel",
  },
];
