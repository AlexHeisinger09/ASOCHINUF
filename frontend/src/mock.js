// Mock data para ASOCHINUF - Asociación de Nutricionistas de Fútbol de Chile

export const mockData = {
  // Hero Section
  hero: {
    title: "ASOCHINUF",
    subtitle: "Asociación Chilena de Nutricionistas de Fútbol",
    description: "Profesionales de la nutrición deportiva especializados en equipos de fútbol profesional de Chile",
    ctaText: "Comencemos",
    rotatingTexts: [
      "Especialización en Nutrición Deportiva",
      "Cursos Certificados Internacionales",
      "Formación en Alto Rendimiento",
      "Nutrición Aplicada al Fútbol Profesional",
      "Capacitación Continua de Excelencia"
    ]
  },

  // Logos de auspiciadores
  sponsors: [
    { id: 1, name: "Universidad de Chile", logo: "U" },
    { id: 2, name: "Colo-Colo", logo: "CC" },
    { id: 3, name: "Universidad Católica", logo: "UC" },
    { id: 4, name: "ANFP", logo: "ANFP" },
    { id: 5, name: "Federación FIFA", logo: "FIFA" },
    { id: 6, name: "CONMEBOL", logo: "CONM" },
    { id: 7, name: "Unión Española", logo: "UE" },
    { id: 8, name: "Palestino", logo: "PAL" },
    { id: 9, name: "Cobreloa", logo: "COB" },
    { id: 10, name: "Everton", logo: "EVE" }
  ],

  // Cursos Section
  cursos: [
    {
      id: 1,
      title: "Nutrición Deportiva Avanzada",
      description: "Curso especializado en nutrición para atletas de alto rendimiento. Aprende las últimas técnicas y estrategias nutricionales aplicadas al fútbol profesional.",
      duration: "12 semanas",
      level: "Avanzado",
      imagePosition: "left"
    },
    {
      id: 2,
      title: "Suplementación en Fútbol",
      description: "Domina el uso de suplementos deportivos y su aplicación correcta en futbolistas profesionales. Protocolo de suplementación basado en evidencia.",
      duration: "8 semanas",
      level: "Intermedio",
      imagePosition: "right"
    },
    {
      id: 3,
      title: "Planificación Nutricional Competitiva",
      description: "Diseña planes nutricionales personalizados para diferentes fases de la temporada deportiva y optimiza el rendimiento de los jugadores.",
      duration: "10 semanas",
      level: "Avanzado",
      imagePosition: "left"
    }
  ],

  // Capacitaciones Section
  capacitaciones: [
    {
      id: 1,
      title: "Evaluación Antropométrica",
      description: "Técnicas profesionales de medición y evaluación de composición corporal en deportistas.",
      icon: "activity",
      duration: "2 días"
    },
    {
      id: 2,
      title: "Nutrición Pre y Post Partido",
      description: "Estrategias nutricionales específicas para optimizar el rendimiento durante competencias.",
      icon: "utensils",
      duration: "1 día"
    },
    {
      id: 3,
      title: "Recuperación Muscular",
      description: "Protocolos nutricionales para acelerar la recuperación y prevenir lesiones deportivas.",
      icon: "heart-pulse",
      duration: "1 día"
    },
    {
      id: 4,
      title: "Hidratación en el Deporte",
      description: "Manejo avanzado de protocolos de hidratación para deportes de alta exigencia física.",
      icon: "droplet",
      duration: "1 día"
    }
  ],

  // Testimonios/Profesionales Section
  testimonios: [
    {
      id: 1,
      name: "Dr. Carlos Muñoz",
      role: "Nutricionista - Club Deportivo Universidad de Chile",
      quote: "ASOCHINUF ha transformado mi práctica profesional. Las capacitaciones y el apoyo constante son invaluables.",
      team: "Universidad de Chile"
    },
    {
      id: 2,
      name: "Dra. María González",
      role: "Nutricionista - Colo-Colo",
      quote: "La red de profesionales y el intercambio de conocimientos han elevado los estándares de nutrición deportiva en Chile.",
      team: "Colo-Colo"
    },
    {
      id: 3,
      name: "Lic. Roberto Silva",
      role: "Nutricionista - Universidad Católica",
      quote: "Ser parte de ASOCHINUF significa estar a la vanguardia de la nutrición deportiva en el fútbol profesional.",
      team: "Universidad Católica"
    }
  ],

  // Organigrama Section
  organigrama: {
    title: "Nuestra Organización",
    subtitle: "Estructura que impulsa la excelencia en nutrición deportiva",
    estructura: [
      {
        id: 1,
        nivel: 1,
        cargo: "Presidente",
        nombre: "Dr. Juan Pérez Rojas",
        area: "Dirección General"
      },
      {
        id: 2,
        nivel: 2,
        cargo: "Vicepresidente",
        nombre: "Dra. Ana María Torres",
        area: "Coordinación Académica"
      },
      {
        id: 3,
        nivel: 2,
        cargo: "Secretario General",
        nombre: "Lic. Pedro Ramírez",
        area: "Administración"
      },
      {
        id: 4,
        nivel: 3,
        cargo: "Director de Capacitación",
        nombre: "Dr. Luis Fernández",
        area: "Formación Continua"
      },
      {
        id: 5,
        nivel: 3,
        cargo: "Director de Investigación",
        nombre: "Dra. Carmen Vega",
        area: "Desarrollo Científico"
      },
      {
        id: 6,
        nivel: 3,
        cargo: "Director de Comunicaciones",
        nombre: "Lic. Francisco Soto",
        area: "Difusión y Marketing"
      }
    ]
  },

  // Footer Links
  footer: {
    navigation: [
      { name: "Inicio", href: "#hero" },
      { name: "Cursos", href: "#cursos" },
      { name: "Capacitaciones", href: "#capacitaciones" },
      { name: "Profesionales", href: "#profesionales" },
      { name: "Organigrama", href: "#organigrama" }
    ],
    social: [
      { name: "Facebook", icon: "facebook", url: "#" },
      { name: "Instagram", icon: "instagram", url: "#" },
      { name: "Twitter", icon: "twitter", url: "#" },
      { name: "LinkedIn", icon: "linkedin", url: "#" }
    ],
    copyright: "© 2025 ASOCHINUF. Todos los derechos reservados."
  }
};
