import type { Payload } from 'payload'
import type { Post } from '@/payload-types'

interface SeedUser {
  email: string
  password: string
  name: string
  role: 'admin' | 'editor'
}

interface SeedCategory {
  name: string
  slug: string
  description: string
}

interface SeedTag {
  name: string
  slug: string
}

interface SeedSeries {
  title: string
  slug: string
  description: string
}

interface SeedPost {
  title: string
  slug: string
  excerpt: string
  seriesName: string
  categoryNames: string[]
  tagNames: string[]
  seriesOrder: number
  useRichLexical: boolean
}

const USERS: SeedUser[] = [
  { email: 'admin@test.local', password: 'admin123', name: 'Admin QA', role: 'admin' },
  { email: 'editor@test.local', password: 'editor123', name: 'Editor QA', role: 'editor' },
]

const CATEGORIES: SeedCategory[] = [
  { name: 'Frontend', slug: 'frontend', description: 'HTML, CSS, JavaScript, frameworks y todo lo que corre en el navegador' },
  { name: 'Backend', slug: 'backend', description: 'APIs, servidores, Node.js, bases de datos y lógica del lado del servidor' },
  { name: 'Bases de datos', slug: 'bases-de-datos', description: 'SQL, NoSQL, modelado, migraciones y optimización de consultas' },
  { name: 'IA', slug: 'ia', description: 'Inteligencia artificial, LLMs, prompts, RAG y herramientas para desarrolladores' },
  { name: 'DevOps', slug: 'devops', description: 'Docker, CI/CD, VPS, despliegues, monitoreo e infraestructura como código' },
  { name: 'Tutoriales', slug: 'tutoriales', description: 'Guías paso a paso, workshops y contenido didáctico desde cero' },
  { name: 'Opinión', slug: 'opinion', description: 'Reflexiones, experiencias y puntos de vista sobre la industria del software' },
]

const TAGS: SeedTag[] = [
  { name: 'tutorial', slug: 'tutorial' },
  { name: 'advanced', slug: 'advanced' },
  { name: 'quick-tip', slug: 'quick-tip' },
  { name: 'opinion', slug: 'opinion' },
  { name: 'review', slug: 'review' },
  { name: 'how-to', slug: 'how-to' },
]

const SERIES: SeedSeries[] = [
  {
    title: 'Aprendiendo Next.js desde cero',
    slug: 'aprendiendo-nextjs-desde-cero',
    description: 'Serie completa para dominar Next.js App Router paso a paso, desde el scaffolding hasta el deploy.',
  },
  {
    title: 'TypeScript avanzado',
    slug: 'typescript-avanzado',
    description: 'Genéricos, conditional types, mapped types, infer y patrones avanzados de tipado.',
  },
]

const POSTS: SeedPost[] = [
  {
    title: 'Por qué migré de Astro a Next.js + Payload CMS',
    slug: 'por-que-migre-astro-nextjs-payload',
    excerpt: 'Las razones detrás de la migración de mi blog de Astro + Markdown a Next.js App Router con Payload CMS v3.',
    seriesName: 'Aprendiendo Next.js desde cero',
    categoryNames: ['Frontend', 'Opinión'],
    tagNames: ['opinion'],
    seriesOrder: 1,
    useRichLexical: true,
  },
  {
    title: 'App Router vs Pages Router: lo que necesitas saber',
    slug: 'app-router-vs-pages-router',
    excerpt: 'Comparativa práctica entre el App Router y el Pages Router de Next.js. Server Components, layouts anidados y más.',
    seriesName: 'Aprendiendo Next.js desde cero',
    categoryNames: ['Frontend', 'Tutoriales'],
    tagNames: ['tutorial', 'advanced'],
    seriesOrder: 2,
    useRichLexical: true,
  },
  {
    title: 'Server Components y Server Actions sin magia negra',
    slug: 'server-components-server-actions',
    excerpt: 'Entiende cómo funcionan realmente los React Server Components y las Server Actions en Next.js, sin magia ni confusiones.',
    seriesName: 'Aprendiendo Next.js desde cero',
    categoryNames: ['Frontend', 'Backend', 'IA'],
    tagNames: ['advanced', 'tutorial'],
    seriesOrder: 3,
    useRichLexical: false,
  },
  {
    title: 'Deploy de Next.js con Docker, Caddy y PostgreSQL',
    slug: 'deploy-nextjs-docker-caddy-postgres',
    excerpt: 'Guía paso a paso para desplegar una app Next.js con output standalone en un VPS usando Docker Compose, Caddy como reverse proxy y PostgreSQL.',
    seriesName: 'Aprendiendo Next.js desde cero',
    categoryNames: ['DevOps', 'Bases de datos'],
    tagNames: ['tutorial', 'how-to'],
    seriesOrder: 4,
    useRichLexical: false,
  },
  {
    title: 'Genéricos en TypeScript que no te enseñan en los tutoriales',
    slug: 'genericos-typescript-avanzados',
    excerpt: 'Patrones avanzados de genéricos: constraints, conditional types, infer, y cómo usarlos en código real de producción.',
    seriesName: 'TypeScript avanzado',
    categoryNames: ['Frontend', 'Backend'],
    tagNames: ['advanced'],
    seriesOrder: 1,
    useRichLexical: false,
  },
  {
    title: '5 patrones de React que reducen bugs silenciosos',
    slug: '5-patrones-react-reducen-bugs',
    excerpt: 'Patrones que todo dev React debería conocer para evitar bugs difíciles de detectar en producción.',
    seriesName: '',
    categoryNames: ['Frontend'],
    tagNames: ['quick-tip', 'advanced'],
    seriesOrder: 0,
    useRichLexical: false,
  },
  {
    title: 'Docker para desarrolladores frontend: lo mínimo indispensable',
    slug: 'docker-frontend-minimo-indispensable',
    excerpt: 'No necesitas ser DevOps para usar Docker. Aprende los fundamentos que todo frontend debería manejar.',
    seriesName: '',
    categoryNames: ['DevOps', 'Frontend'],
    tagNames: ['tutorial', 'quick-tip'],
    seriesOrder: 0,
    useRichLexical: false,
  },
]

function makeBody(topicA: string, topicB: string, rich: boolean): NonNullable<Post['body']> {
  const children: { type: string; version: number; [k: string]: unknown }[] = [
    {
      type: 'heading' as const,
      tag: 'h2' as const,
      version: 1,
      children: [
        {
          type: 'text' as const,
          text: 'Introducción',
          version: 1,
          format: 0,
          style: '',
          mode: 'normal' as const,
          detail: 0,
        },
      ],
      direction: 'ltr' as const,
      format: '',
      indent: 0,
    },
    {
      type: 'paragraph' as const,
      version: 1,
      children: [
        {
          type: 'text' as const,
          text: `Este post explora ${topicA} y ${topicB} desde un enfoque práctico. No es teoría vacía: cada sección incluye código que puedes copiar y probar en tu propio proyecto. Si quieres profundizar, revisa la `,
          version: 1,
          format: 0,
          style: '',
          mode: 'normal' as const,
          detail: 0,
        },
        {
          type: 'link' as const,
          url: 'https://nextjs.org/docs',
          version: 1,
          children: [
            {
              type: 'text' as const,
              text: 'documentación oficial de Next.js',
              version: 1,
              format: 0,
              style: '',
              mode: 'normal' as const,
              detail: 0,
            },
          ],
          direction: 'ltr' as const,
          format: '',
          indent: 0,
          rel: null,
          target: null,
          title: null,
        },
        {
          type: 'text' as const,
          text: ' donde encontrarás más ejemplos.',
          version: 1,
          format: 0,
          style: '',
          mode: 'normal' as const,
          detail: 0,
        },
      ],
      direction: 'ltr' as const,
      format: '',
      indent: 0,
      textFormat: 0,
    },
    {
      type: 'heading' as const,
      tag: 'h3' as const,
      version: 1,
      children: [
        {
          type: 'text' as const,
          text: `Contexto sobre ${topicA}`,
          version: 1,
          format: 0,
          style: '',
          mode: 'normal' as const,
          detail: 0,
        },
      ],
      direction: 'ltr' as const,
      format: '',
      indent: 0,
    },
    {
      type: 'paragraph' as const,
      version: 1,
      children: [
        {
          type: 'text' as const,
          text: `Entender ${topicA} es clave porque afecta directamente el rendimiento, la mantenibilidad y la experiencia de desarrollo. Veamos un ejemplo concreto con TypeScript:`,
          version: 1,
          format: 0,
          style: '',
          mode: 'normal' as const,
          detail: 0,
        },
      ],
      direction: 'ltr' as const,
      format: '',
      indent: 0,
      textFormat: 0,
    },
    {
      type: 'code' as const,
      language: 'typescript',
      version: 1,
      children: [
        {
          type: 'line' as const,
          version: 0,
          children: [
            { type: 'token' as const, text: 'interface ', version: 0, format: 0, style: '', mode: 'normal' as const, detail: 0 },
            { type: 'token' as const, text: 'Config', version: 0, format: 2, style: '', mode: 'normal' as const, detail: 0 },
            { type: 'token' as const, text: ' {', version: 0, format: 0, style: '', mode: 'normal' as const, detail: 0 },
          ],
        },
        {
          type: 'line' as const,
          version: 0,
          children: [
            { type: 'token' as const, text: '  ', version: 0, format: 0, style: '', mode: 'normal' as const, detail: 0 },
            { type: 'token' as const, text: 'name', version: 0, format: 8, style: '', mode: 'normal' as const, detail: 0 },
            { type: 'token' as const, text: ': ', version: 0, format: 0, style: '', mode: 'normal' as const, detail: 0 },
            { type: 'token' as const, text: 'string', version: 0, format: 2, style: '', mode: 'normal' as const, detail: 0 },
          ],
        },
        {
          type: 'line' as const,
          version: 0,
          children: [
            { type: 'token' as const, text: '  ', version: 0, format: 0, style: '', mode: 'normal' as const, detail: 0 },
            { type: 'token' as const, text: 'debug', version: 0, format: 8, style: '', mode: 'normal' as const, detail: 0 },
            { type: 'token' as const, text: '?: ', version: 0, format: 0, style: '', mode: 'normal' as const, detail: 0 },
            { type: 'token' as const, text: 'boolean', version: 0, format: 2, style: '', mode: 'normal' as const, detail: 0 },
          ],
        },
        {
          type: 'line' as const,
          version: 0,
          children: [
            { type: 'token' as const, text: '}', version: 0, format: 0, style: '', mode: 'normal' as const, detail: 0 },
          ],
        },
      ],
      direction: 'ltr' as const,
      format: '',
      indent: 0,
    },
  ]

  if (rich) {
    children.push({
      type: 'block' as const,
      version: 1,
      fields: {
        id: crypto.randomUUID ? crypto.randomUUID() : 'callout-seed-1',
        blockName: null,
        blockType: 'callout',
        variant: 'tip',
        title: 'Consejo práctico',
        content: {
          root: {
            type: 'root' as const,
            format: '' as const,
            indent: 0,
            version: 1,
            direction: 'ltr' as const,
            children: [
              {
                type: 'paragraph' as const,
                version: 1,
                children: [
                  {
                    type: 'text' as const,
                    text: 'Usa siempre ',
                    version: 1,
                    format: 0,
                    style: '',
                    mode: 'normal' as const,
                    detail: 0,
                  },
                  {
                    type: 'text' as const,
                    text: 'strict: true',
                    version: 1,
                    format: 1,
                    style: '',
                    mode: 'normal' as const,
                    detail: 0,
                  },
                  {
                    type: 'text' as const,
                    text: ' en tu ',
                    version: 1,
                    format: 0,
                    style: '',
                    mode: 'normal' as const,
                    detail: 0,
                  },
                  {
                    type: 'link' as const,
                    url: 'https://www.typescriptlang.org/tsconfig',
                    version: 1,
                    children: [
                      {
                        type: 'text' as const,
                        text: 'tsconfig.json',
                        version: 1,
                        format: 0,
                        style: '',
                        mode: 'normal' as const,
                        detail: 0,
                      },
                    ],
                    direction: 'ltr' as const,
                    format: '',
                    indent: 0,
                    rel: null,
                    target: null,
                    title: null,
                  },
                  {
                    type: 'text' as const,
                    text: ' desde el día uno. Los tipos estrictos atrapan bugs que de otra forma solo verías en producción.',
                    version: 1,
                    format: 0,
                    style: '',
                    mode: 'normal' as const,
                    detail: 0,
                  },
                ],
                direction: 'ltr' as const,
                format: '',
                indent: 0,
                textFormat: 0,
              },
            ],
          },
        },
      },
    })
  }

  children.push(
    {
      type: 'heading' as const,
      tag: 'h3' as const,
      version: 1,
      children: [
        {
          type: 'text' as const,
          text: `Integrando con ${topicB}`,
          version: 1,
          format: 0,
          style: '',
          mode: 'normal' as const,
          detail: 0,
        },
      ],
      direction: 'ltr' as const,
      format: '',
      indent: 0,
    },
    {
      type: 'paragraph' as const,
      version: 1,
      children: [
        {
          type: 'text' as const,
          text: `Cuando combinas ${topicA} con ${topicB} obtienes un flujo mucho más robusto. Aquí van los puntos clave que debes recordar:`,
          version: 1,
          format: 0,
          style: '',
          mode: 'normal' as const,
          detail: 0,
        },
      ],
      direction: 'ltr' as const,
      format: '',
      indent: 0,
      textFormat: 0,
    },
    {
      type: 'list' as const,
      listType: 'bullet' as const,
      start: 1,
      version: 1,
      children: [
        {
          type: 'listitem' as const,
          version: 1,
          value: 1,
          children: [
            {
              type: 'text' as const,
              text: 'Mantén la configuración centralizada en un solo archivo.',
              version: 1,
              format: 0,
              style: '',
              mode: 'normal' as const,
              detail: 0,
            },
          ],
          direction: 'ltr' as const,
          format: '',
          indent: 0,
        },
        {
          type: 'listitem' as const,
          version: 1,
          value: 2,
          children: [
            {
              type: 'text' as const,
              text: 'Usa tipos estrictos desde el día uno — luego refactorizar es costoso.',
              version: 1,
              format: 0,
              style: '',
              mode: 'normal' as const,
              detail: 0,
            },
          ],
          direction: 'ltr' as const,
          format: '',
          indent: 0,
        },
        {
          type: 'listitem' as const,
          version: 1,
          value: 3,
          children: [
            {
              type: 'text' as const,
              text: 'Escribe tests para los casos edge ',
              version: 1,
              format: 0,
              style: '',
              mode: 'normal' as const,
              detail: 0,
            },
            {
              type: 'text' as const,
              text: 'antes',
              version: 1,
              format: 1,
              style: '',
              mode: 'normal' as const,
              detail: 0,
            },
            {
              type: 'text' as const,
              text: ' de que se conviertan en bugs de producción.',
              version: 1,
              format: 0,
              style: '',
              mode: 'normal' as const,
              detail: 0,
            },
          ],
          direction: 'ltr' as const,
          format: '',
          indent: 0,
        },
      ],
      direction: 'ltr' as const,
      format: '',
      indent: 0,
    },
    {
      type: 'paragraph' as const,
      version: 1,
      children: [
        {
          type: 'text' as const,
          text: 'En resumen, dominar estos conceptos te ahorrará horas de debugging y hará tu código más mantenible a largo plazo. Si te gustó este artículo, compártelo con tu equipo y déjame un comentario con tus dudas.',
          version: 1,
          format: 0,
          style: '',
          mode: 'normal' as const,
          detail: 0,
        },
      ],
      direction: 'ltr' as const,
      format: '',
      indent: 0,
      textFormat: 0,
    },
  )

  return {
    root: {
      type: 'root' as const,
      format: '' as const,
      indent: 0,
      version: 1,
      direction: 'ltr' as const,
      children,
    },
  }
}

export async function seedDev(payload: Payload): Promise<void> {
  await seedUsers(payload)
  await seedCategories(payload)
  await seedTags(payload)
  await seedSeries(payload)
  await seedPosts(payload)
  payload.logger.info('[seed] Dev seed completo.')
}

async function seedUsers(payload: Payload): Promise<void> {
  for (const user of USERS) {
    const existing = await payload.find({
      collection: 'users',
      where: { email: { equals: user.email } },
      limit: 1,
    })
    if (existing.totalDocs > 0) continue

    await payload.create({
      collection: 'users',
      data: user,
      disableVerificationEmail: true,
    })
    payload.logger.info(`[seed] Usuario: ${user.email} (${user.role})`)
  }
}

async function seedCategories(payload: Payload): Promise<void> {
  for (const cat of CATEGORIES) {
    const existing = await payload.find({
      collection: 'categories',
      where: { slug: { equals: cat.slug } },
      limit: 1,
    })
    if (existing.totalDocs > 0) continue

    await payload.create({ collection: 'categories', data: cat })
    payload.logger.info(`[seed] Categoría: ${cat.name}`)
  }
}

async function seedTags(payload: Payload): Promise<void> {
  for (const tag of TAGS) {
    const existing = await payload.find({
      collection: 'tags',
      where: { slug: { equals: tag.slug } },
      limit: 1,
    })
    if (existing.totalDocs > 0) continue

    await payload.create({ collection: 'tags', data: tag })
    payload.logger.info(`[seed] Tag: ${tag.name}`)
  }
}

async function seedSeries(payload: Payload): Promise<void> {
  for (const series of SERIES) {
    const existing = await payload.find({
      collection: 'series',
      where: { slug: { equals: series.slug } },
      limit: 1,
    })
    if (existing.totalDocs > 0) continue

    await payload.create({ collection: 'series', data: series })
    payload.logger.info(`[seed] Serie: ${series.title}`)
  }
}

async function seedPosts(payload: Payload): Promise<void> {
  const [author, cats, tags, allSeries] = await Promise.all([
    payload.find({ collection: 'users', where: { email: { equals: USERS[0].email } }, limit: 1 }),
    payload.find({ collection: 'categories', limit: 100 }),
    payload.find({ collection: 'tags', limit: 100 }),
    payload.find({ collection: 'series', limit: 100 }),
  ])

  const authorId = author.docs[0]?.id as number
  if (!authorId) {
    payload.logger.warn('[seed] Sin autor admin, no se crean posts.')
    return
  }

  for (const post of POSTS) {
    const existing = await payload.find({
      collection: 'posts',
      where: { slug: { equals: post.slug } },
      limit: 1,
    })
    if (existing.totalDocs > 0) continue

    const categoryIds = post.categoryNames
      .map((name) => cats.docs.find((c) => c.name === name)?.id)
      .filter(Boolean) as number[]

    const tagIds = post.tagNames
      .map((name) => tags.docs.find((t) => t.name === name)?.id)
      .filter(Boolean) as number[]

    const seriesDoc = post.seriesName
      ? allSeries.docs.find((s) => (s as { title: string }).title === post.seriesName)
      : null
    const seriesId = seriesDoc?.id as number | undefined

    await payload.create({
      collection: 'posts',
      data: {
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        author: authorId,
        status: 'published' as const,
        publishedAt: new Date().toISOString(),
        body: makeBody(...extractTopics(post.title), post.useRichLexical),
        categories: categoryIds,
        tags: tagIds,
        series: seriesId,
        seriesOrder: post.seriesOrder || undefined,
      },
    })

    payload.logger.info(`[seed] Post: ${post.title}`)
  }
}

function extractTopics(title: string): [string, string] {
  const words = title.split(/[\s:—–-]+/).filter(Boolean)
  const mid = Math.floor(words.length / 2)
  const a = words.slice(0, mid).join(' ').toLowerCase() || 'desarrollo'
  const b = words.slice(mid).join(' ').toLowerCase() || 'web'
  return [a, b]
}
