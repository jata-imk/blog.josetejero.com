export const ABOUT = {
  name: 'José Alejandro Tejero',
  initials: 'JA',
  headline: 'Soy José Alejandro, desarrollador web',
  tagline: 'Ingeniero Mecatrónico · Mérida, MX',
  lead: 'Enfocado en crear soluciones útiles, rápidas y bien estructuradas. Ingeniero mecatrónico que disfruta el código como estilo de vida.',
  bio: [
    'Me gusta mi trabajo, y más allá de verlo como tal, lo disfruto como un estilo de vida. He trabajado en los sectores turístico, financiero y gobierno, incluyendo proyectos con geotecnologías y sistemas de mapas.',
    'Me adapto a lo que se necesite: desde el análisis inicial hasta la implementación final. También le meto a proyectos personales que van desde scrapers con IA hasta sistemas de rastreo vehicular en tiempo real.',
  ],
  social: {
    github:   'https://github.com/jata-imk',
    twitter:  'https://x.com/JoseTejero98',
    linkedin: 'https://www.linkedin.com/in/jatejeroaguilar',
  },
  cv: {
    url:  '/documents/cv.pdf',
    pages: 2,
    updated: 'mar 2026',
  },
} as const

export const EXPERIENCE = [
  {
    org: 'Ayuntamiento de Mérida',
    role: 'Desarrollador Web',
    period: 'Abr 2024 — Actualidad',
    desc: 'Migración y optimización de sistemas cartográficos con MapLibre, geoprocesos y APIs con FastAPI.',
    active: true,
  },
  {
    org: 'Financial Assesment Group',
    role: 'Desarrollador Full-Stack',
    period: 'Jul 2023 — Mar 2024',
    desc: 'Migración de software financiero a Laravel, Vue.js y Docker; despliegues en múltiples servidores.',
    active: false,
  },
  {
    org: 'Lex Go Tours',
    role: 'Desarrollador CRM',
    period: 'Sep 2021 — Jul 2023',
    desc: 'CRM interno con pasarelas de pago, APIs de hotelería y mensajería en tiempo real (WhatsApp Business).',
    active: false,
    last: true,
  },
] as const

export const SKILLS: Record<string, Array<{ name: string; color: string; mark?: string }>> = {
  Lenguajes: [
    { name: 'PHP',        color: '#777bb3' },
    { name: 'Python',     color: '#3776ab' },
    { name: 'JavaScript', color: '#f7df1e', mark: 'JS' },
    { name: 'TypeScript', color: '#3178c6', mark: 'TS' },
    { name: 'SQL',        color: '#0891b2' },
  ],
  Backend: [
    { name: 'Laravel',  color: '#ff2d20' },
    { name: 'FastAPI',  color: '#059669' },
    { name: 'Flask',    color: '#0f172a' },
    { name: 'Node.js',  color: '#10b981' },
    { name: 'Express',  color: '#475569' },
  ],
  Frontend: [
    { name: 'React',    color: '#06b6d4' },
    { name: 'Vue.js',   color: '#42b883' },
    { name: 'Astro',    color: '#7c3aed' },
    { name: 'Tailwind', color: '#06b6d4' },
    { name: 'Inertia',  color: '#9553e9' },
  ],
  'Bases de Datos': [
    { name: 'MySQL',      color: '#00758f' },
    { name: 'PostgreSQL', color: '#336791' },
    { name: 'MongoDB',    color: '#10b981' },
    { name: 'Prisma',     color: '#0f172a' },
  ],
  'DevOps & Infra': [
    { name: 'Linux',  color: '#f59e0b' },
    { name: 'Docker', color: '#2563eb' },
    { name: 'Nginx',  color: '#059669' },
    { name: 'Git',    color: '#e11d48' },
    { name: 'CI/CD',  color: '#7c3aed' },
  ],
  'Inteligencia Artificial': [
    { name: 'OpenAI',       color: '#10b981' },
    { name: 'Claude',       color: '#d97706' },
    { name: 'Web Scraping', color: '#7c3aed' },
    { name: 'Agentes',      color: '#2563eb' },
  ],
}
