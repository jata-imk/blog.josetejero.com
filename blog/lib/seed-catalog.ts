import type { Payload } from "payload";

/**
 * Seed de CATÁLOGOS para producción: categorías, tags y series.
 *
 * A diferencia de `lib/seed.ts` (seed de desarrollo que además crea usuarios de
 * prueba y posts falsos vía `onInit`), este seed solo siembra taxonomía real y
 * está pensado para ejecutarse a mano en producción con `pnpm seed:catalog`.
 *
 * Idempotente por clave natural (`slug`): si el registro ya existe, no lo toca.
 * Se puede correr varias veces sin duplicar. Los slugs se declaran explícitos
 * para que el lookup de idempotencia sea determinista (no depende de `autoSlug`).
 */

interface CatalogCategory {
  name: string;
  slug: string;
  description: string;
}

interface CatalogTag {
  name: string;
  slug: string;
  description: string;
}

interface CatalogSeries {
  title: string;
  slug: string;
  description: string;
}

const CATEGORIES: CatalogCategory[] = [
  {
    name: "IA y Agentes",
    slug: "ia-y-agentes",
    description:
      "LLMs, agentes autónomos, OpenClaw, routing multi-modelo y video/TTS con IA.",
  },
  {
    name: "DevOps e Infraestructura",
    slug: "devops-e-infraestructura",
    description: "Docker, CI/CD, despliegue en VPS y self-hosting.",
  },
  {
    name: "Linux y Sysadmin",
    slug: "linux-y-sysadmin",
    description:
      "Administración de servidores Linux: SSH, usuarios, systemd y cron.",
  },
  {
    name: "Git y Control de Versiones",
    slug: "git-y-control-de-versiones",
    description:
      "Git Flow, pull/merge requests, branching y autenticación con Git.",
  },
  {
    name: "Desarrollo Web",
    slug: "desarrollo-web",
    description:
      "Frameworks y arquitectura: Laravel, React, Vue y Clean Architecture.",
  },
  {
    name: "Seguridad",
    slug: "seguridad",
    description:
      "Hardening de servidores, gestión de secretos y seguridad en agentes de IA.",
  },
];

const TAGS: CatalogTag[] = [
  {
    name: "OpenClaw",
    slug: "openclaw",
    description: "El asistente de IA personal self-hosted.",
  },
  {
    name: "LLMs",
    slug: "llm",
    description: "Modelos de lenguaje: uso, routing y costes.",
  },
  {
    name: "Agentes de IA",
    slug: "agentes-ia",
    description: "Agentes autónomos, patrones multi-agente y orquestación.",
  },
  {
    name: "Prompt injection",
    slug: "prompt-injection",
    description: "Ataques por inyección de prompt y cómo mitigarlos.",
  },
  {
    name: "Automatización",
    slug: "automatizacion",
    description: "Pipelines y tareas automáticas end-to-end.",
  },
  {
    name: "Self-hosting",
    slug: "self-hosting",
    description: "Correr tus propios servicios en hardware que controlas.",
  },
  {
    name: "VPS",
    slug: "vps",
    description: "Servidores virtuales: aprovisionamiento y operación.",
  },
  {
    name: "Docker",
    slug: "docker",
    description: "Contenedores, imágenes y Docker Compose.",
  },
  {
    name: "Linux",
    slug: "linux",
    description: "El sistema operativo del servidor y sus herramientas.",
  },
  {
    name: "SSH",
    slug: "ssh",
    description: "Acceso remoto seguro, claves y hardening.",
  },
  {
    name: "systemd",
    slug: "systemd",
    description: "Servicios y unidades con systemctl.",
  },
  {
    name: "cron",
    slug: "cron",
    description: "Tareas programadas en Linux.",
  },
  {
    name: "Git",
    slug: "git",
    description: "Control de versiones distribuido.",
  },
  {
    name: "Git Flow",
    slug: "git-flow",
    description: "Estrategias de branching y flujo de trabajo con ramas.",
  },
  {
    name: "CI/CD",
    slug: "ci-cd",
    description: "Integración y despliegue continuos.",
  },
  {
    name: "Deploy",
    slug: "deploy",
    description: "Puesta en producción y estrategias de release.",
  },
  {
    name: "Laravel",
    slug: "laravel",
    description: "Framework PHP para aplicaciones web.",
  },
  {
    name: "PHP",
    slug: "php",
    description: "El lenguaje del backend web clásico.",
  },
  {
    name: "Vue",
    slug: "vue",
    description: "Framework progresivo de frontend.",
  },
  {
    name: "React",
    slug: "react",
    description: "Librería de UI basada en componentes.",
  },
  {
    name: "Clean Architecture",
    slug: "clean-architecture",
    description: "Separación de capas y dependencias hacia adentro.",
  },
  {
    name: "Seguridad",
    slug: "seguridad",
    description: "Buenas prácticas de seguridad aplicada.",
  },
  {
    name: "APIs",
    slug: "api",
    description: "Diseño y consumo de interfaces de programación.",
  },
  {
    name: "TTS",
    slug: "tts",
    description: "Síntesis de voz (text-to-speech).",
  },
  {
    name: "Video con IA",
    slug: "video-ia",
    description: "Generación de video con modelos de IA.",
  },
  {
    name: "Notion",
    slug: "notion",
    description: "Integraciones y automatización con Notion.",
  },
];

const SERIES: CatalogSeries[] = [
  {
    title: "OpenClaw",
    slug: "openclaw",
    description:
      "Monta y conecta tu asistente de IA personal self-hosted, paso a paso: instalación, API keys, mensajería, correo y redes.",
  },
  {
    title: "OpenClaw: Routing y Multiagentes",
    slug: "openclaw-routing-y-multiagentes",
    description:
      "Deja de pagar Opus por todo: routing en capas, agentes especializados y medición real del ahorro.",
  },
  {
    title: "Git, Merge & Deploy",
    slug: "git-merge-deploy",
    description:
      "Metodología DevOps con Git: branching estratégico, pull/merge requests y despliegue.",
  },
];

type CatalogCollection = "categories" | "tags" | "series";

async function existsBySlug(
  payload: Payload,
  collection: CatalogCollection,
  slug: string,
): Promise<boolean> {
  const res = await payload.find({
    collection,
    where: { slug: { equals: slug } },
    limit: 1,
  });
  return res.totalDocs > 0;
}

export async function seedCatalog(payload: Payload): Promise<void> {
  for (const cat of CATEGORIES) {
    if (await existsBySlug(payload, "categories", cat.slug)) continue;
    await payload.create({ collection: "categories", data: cat });
    payload.logger.info(`[seed:catalog] Categoría: ${cat.name}`);
  }

  for (const tag of TAGS) {
    if (await existsBySlug(payload, "tags", tag.slug)) continue;
    await payload.create({ collection: "tags", data: tag });
    payload.logger.info(`[seed:catalog] Tag: ${tag.name}`);
  }

  for (const series of SERIES) {
    if (await existsBySlug(payload, "series", series.slug)) continue;
    await payload.create({ collection: "series", data: series });
    payload.logger.info(`[seed:catalog] Serie: ${series.title}`);
  }

  payload.logger.info("[seed:catalog] Catálogos sembrados.");
}
