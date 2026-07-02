# Catálogos iniciales, seed de producción y migración inicial

**Fecha:** 2026-07-02 · **Agente:** engineer · **Tarea:** preparar el arranque en producción
(catálogos + seed + migración). ADR relacionado: [0027](../adr/0027-migraciones-y-seed-para-produccion.md).

## Qué se hizo y por qué

Al publicar el blog aparecieron tres cabos sueltos que este trabajo cierra.

### 1. Catálogos iniciales derivados del contenido real
En vez de inventar categorías/tags genéricos, se leyeron las fuentes reales de contenido:
- El blog anterior **`aleliz.xyz/blog/`** (17 entradas, con subposts anidados).
- Las entradas pendientes en **Notion** (vista "In Progress" de *Recent Content*).

De ahí salieron **6 categorías**, **26 tags** y **3 series**. Las dos series de OpenClaw son distintas
a propósito: **"OpenClaw"** (operativa: instalar y conectar) y **"OpenClaw: Routing y Multiagentes"**
(conceptual: routing en capas → agentes especializados → medición del ahorro). La tercera es
**"Git, Merge & Deploy"**, cuyos subposts anidados del blog viejo se representan con
`seriesOrder` + `seriesDepth` en Posts.

Los datos viven en `lib/seed-catalog.ts`. Editar ahí para ajustar la taxonomía.

### 2. Seed de producción separado del de desarrollo
Concepto clave: **había dos "seeds" con propósitos opuestos.**
- `lib/seed.ts` = **seed de desarrollo**. Corre solo en el hook `onInit` de Payload y **únicamente
  cuando `NODE_ENV !== 'production'`**. Mete usuarios de QA (contraseñas en texto plano) y posts
  falsos. En producción **no** corre. Perfecto para dev, veneno para prod.
- `lib/seed-catalog.ts` (nuevo) = **seed de producción de catálogos**. Solo siembra taxonomía real
  (categorías, tags, series). No toca usuarios ni posts.

Es **idempotente por `slug`**: antes de crear cada registro busca si ya existe ese slug; si sí, lo
salta. Por eso se puede correr varias veces sin duplicar. Se dispara a mano:

```
pnpm seed:catalog
```

que por debajo es `payload run scripts/seed-catalog.ts`. `payload run` carga el entorno y la config
de Payload; el script solo obtiene la instancia (`getPayload`) y llama a `seedCatalog`.

### 3. Migración inicial (fin de la pausa del ADR 0026, solo para prod)
**Por qué hacía falta:** Payload mantiene el schema de dos formas. En **desarrollo** usa `push`
(sincroniza las tablas automáticamente desde las colecciones, sin migraciones). En **producción**
`push` está desactivado por defecto → si no hay migraciones, **la BD de prod se queda sin tablas.**
El ADR 0026 había vaciado `migrations/index.ts` a propósito y avisaba de reabrirlo antes del deploy.

La migración inicial se genera del **schema en código**, no de los datos, así que **no hay que borrar
ninguna base**. Comando (lo corre José en su entorno, con el túnel SSH a la BD de dev activo):

```
pnpm payload migrate:create initial_schema
```

Con el historial vacío, Payload genera la creación **completa** del schema como primera migración y
actualiza `migrations/index.ts`. Luego se revisa el SQL y, en el deploy, producción aplica:

```
pnpm payload migrate
```

> Nota operativa: este repo **no tiene `.env` local** (solo `.env.example`) y la BD de dev vive tras
> un túnel SSH, por eso la generación de la migración la ejecuta José, no el agente.

## Secuencia de deploy (resumen)
1. `pnpm payload migrate` — crea el schema en la BD de prod (vacía).
2. Entrar a `/admin` — Payload pide crear el **primer admin** (first-user flow, sin credenciales en
   código).
3. `pnpm seed:catalog` — siembra los catálogos.
4. Importar/redactar posts (el importador MD→Lexical ya existe) y asociarlos a los catálogos.

## Archivos tocados
- **Nuevos:** `lib/seed-catalog.ts`, `scripts/seed-catalog.ts`, `docs/adr/0027-...md`, esta nota.
- **Modificados:** `package.json` (script `seed:catalog`), `docs/adr/0026-...md` (marcado como
  reemplazado parcialmente).
- **Generado por José:** `migrations/<timestamp>_initial_schema.ts` + `migrations/index.ts`.
- **Intactos:** `lib/seed.ts`, colecciones, `payload.config.ts`.
