/* Aleliz Blog — sample content used across screens */
const AB_POSTS = {
  notion: {
    cat: 'ia', title: 'Conectar API de Notion a OpenClaw: dale ojos a tu agente para leer tus notas',
    excerpt: 'Cómo exponer tu workspace de Notion a un agente vía API: tokens, scopes y un gateway minimalista para lecturas seguras.',
    date: 'Mar 12, 2026', read: '8 min', comments: 12, tags: ['Notion','API','OpenClaw'], series: false,
    thumbLabel: '// notion → openclaw',
  },
  apikeys: {
    cat: 'devops', title: 'Configurar API Keys en OpenClaw', excerpt: 'Una llave de acceso única: control de cuotas, facturación y seguridad de identidad.',
    date: 'Mar 12, 2026', read: '6 min', comments: 4, tags: ['OpenClaw','API','Seguridad'], series: false, thumbLabel: '// api keys',
  },
  pg: {
    cat: 'backend', title: 'Next.js + PostgreSQL: creando un blog personal rápido',
    excerpt: 'Montar un blog SEO-friendly con rutas dinámicas, Prisma y consultas indexadas que rinden a escala.',
    date: 'Feb 28, 2026', read: '12 min', comments: 23, tags: ['Next.js','PostgreSQL','Prisma'], series: true, thumbLabel: '// nextjs + postgres',
  },
  seo: {
    cat: 'tutoriales', title: 'Cómo estructurar series de artículos para mejorar el SEO',
    excerpt: 'Interlinking, breadcrumbs y schema markup: convierte posts sueltos en clústeres temáticos que rankean.',
    date: 'Feb 20, 2026', read: '9 min', comments: 7, tags: ['SEO','Series'], series: true, thumbLabel: '// seo series',
  },
  comments: {
    cat: 'bases-de-datos', title: 'Comentarios en un blog con PostgreSQL y moderación',
    excerpt: 'Esquema de moderación con estados, triggers y una cola simple para aprobar comentarios sin spam.',
    date: 'Feb 11, 2026', read: '10 min', comments: 15, tags: ['PostgreSQL','API'], series: false, thumbLabel: '// comments db',
  },
  astro: {
    cat: 'frontend', title: 'Astro vs Next.js para blogs técnicos',
    excerpt: 'Islands, hidratación parcial y DX: cuándo conviene cada uno para contenido técnico.',
    date: 'Feb 3, 2026', read: '7 min', comments: 31, tags: ['Astro','React','Next.js'], series: false, thumbLabel: '// astro vs next',
  },
  images: {
    cat: 'frontend', title: 'Optimización de imágenes en blogs modernos',
    excerpt: 'AVIF, lazy loading y el componente Image: cómo servir covers nítidos sin penalizar el LCP.',
    date: 'Jan 24, 2026', read: '6 min', comments: 9, tags: ['Next.js','Rendimiento'], series: false, thumbLabel: '// image optim',
  },
  og: {
    cat: 'backend', title: 'Metadata dinámica y Open Graph en Next.js',
    excerpt: 'Genera OG images por ruta con la API de metadata y satisface a cada red social.',
    date: 'Jan 15, 2026', read: '8 min', comments: 5, tags: ['Next.js','SEO','API'], series: false, thumbLabel: '// dynamic og',
  },
};
const AB_COMMENTS = [
  { name: 'Ana Velasco', date: 'hace 2 días', text: 'Justo lo que buscaba. La parte del gateway me aclaró un montón de dudas sobre los scopes. ¡Gracias!' },
  { name: 'Diego Marín', date: 'hace 5 días', text: '¿Recomiendas guardar el token cifrado en la base de datos o usar un secrets manager? Me preocupa la rotación.' },
  { name: 'Lucía Fernández', date: 'hace 1 semana', text: 'Excelente explicación. Lo apliqué con un workspace grande y voló. Un detalle: ojo con el rate limit de Notion.' },
];
Object.assign(window, { AB_POSTS, AB_COMMENTS });
