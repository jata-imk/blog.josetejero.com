# 2026-06-17 — Engineer — corregir integración de layouts de Payload y script de lint

## Qué hice

Corregí dos problemas detectados en el scaffolding base del proyecto:

### 1. Integración de layouts (Next.js + Payload RootLayout)

**Problema:** El root layout (`app/layout.tsx`) renderizaba `<html lang="es"><body>...</body></html>`
y el layout de Payload (`app/(payload)/layout.tsx`) también renderizaba su propio `<html>` y `<body>`
vía el componente `<RootLayout>` de `@payloadcms/next/layouts`. Esto producía HTML inválido con
etiquetas `<html>` y `<body>` anidadas:

```html
<!-- root layout -->
<html lang="es">
  <body>
    <!-- payload layout -->
    <html data-theme="light" lang="en">
      <head>...</head>
      <body>...admin panel...</body>
    </html>
  </body>
</html>
```

**Solución:** El root layout ahora retorna simplemente `{children}` (un fragmento). Cada route
group provee su propio `<html>` y `<body>`:
- `(frontend)/layout.tsx` → `<html lang="es"><body>{children}</body></html>`
- `(payload)/layout.tsx` → `<RootLayout>...</RootLayout>` (que ya incluye html/body propios)

Next.js 16 acepta que el root layout sea un fragmento; no requiere `<html>` y `<body>` explícitos
en el root cuando los route groups los proveen.

### 2. Script de lint

**Problema:** El script `"lint": "next lint"` fallaba con:
```
Invalid project directory provided, no such directory: .../blog/lint
```
Esto ocurre porque Next.js 16 eliminó el subcomando `lint`. Al ejecutar `next lint`, Next.js
interpreta "lint" como un argumento `[directory]` y busca una carpeta llamada `lint`.

**Solución:** 
- Instalé `eslint` 10, `@eslint/js` y `typescript-eslint` como devDependencies
- Creé `eslint.config.mjs` con el formato flat config (el estándar de ESLint 9+):
  ```mjs
  import js from '@eslint/js'
  import tseslint from 'typescript-eslint'
  
  export default tseslint.config(
    js.configs.recommended,
    ...tseslint.configs.recommended,
    {
      ignores: ['.next/', 'node_modules/', 'dist/', '.qa-artifacts/', 'design/handoff/'],
    },
  )
  ```
- Cambié el script lint a `"lint": "eslint ."`
- Agregué `.qa-artifacts/` y `*.tsbuildinfo` a `.gitignore`

## Verificación

- `pnpm lint` → 0 errores, 0 warnings
- `npx tsc --noEmit` → sin errores
- `npx next build` → build exitoso, todas las rutas generadas:
  - `/` (static, frontend)
  - `/admin/[[...segments]]` (dynamic, Payload admin)
  - `/api/[...slug]` (dynamic, Payload REST API)
  - `/api/graphql` (dynamic, Payload GraphQL)

## Por qué flat config y no eslint-config-next

`eslint-config-next` no tiene versión estable para Next.js 16 (solo canary). Usar ESLint 10 con
typescript-eslint directamente es más simple, más rápido (flat config), y nos da las reglas
esenciales de TypeScript. Si más adelante queremos reglas específicas de Next.js, se puede agregar
`@next/eslint-plugin-next` cuando salga la versión estable.
