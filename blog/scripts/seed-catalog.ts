/**
 * Entrypoint del seed de catálogos de producción.
 *
 * Ejecutar con:  pnpm seed:catalog
 * (definido en package.json como `payload run scripts/seed-catalog.ts`).
 *
 * `payload run` carga el entorno y la config de Payload; aquí solo obtenemos la
 * instancia y delegamos en `seedCatalog`. Idempotente: se puede correr N veces.
 */
import { getPayload } from "payload";
import config from "@payload-config";

import { seedCatalog } from "@/lib/seed-catalog";

const payload = await getPayload({ config });

await seedCatalog(payload);

process.exit(0);
