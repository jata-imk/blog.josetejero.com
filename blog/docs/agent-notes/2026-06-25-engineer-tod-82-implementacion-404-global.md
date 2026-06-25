# TOD-82 — Implementación de 404 global estilada

## Qué hice
- Activé flag experimental `globalNotFound: true` en `next.config.mjs`.
- Creé `app/global-not-found.tsx` con shell completo: `<html>`, `<body>`, imports de `globals.css` y `fonts.ts`, componentes `Header` y `Footer`, y la UI 404 aprobada.
- Eliminé `app/not-found.tsx` para evitar ambigüedad (fuente de verdad única es `global-not-found.tsx`).
- Mantuve `app/(frontend)/not-found.tsx` sin cambios para `notFound()` segmentado.
- Verifiqué con `pnpm build` + `pnpm start` en producción.

## Implementación
Seguí el ADR 0017 y la nota del Architect (TOD-81):

**Estructura final:**
- `app/global-not-found.tsx` → 404 para URLs inexistentes (ruta global)
- `app/(frontend)/not-found.tsx` → 404 para `notFound()` dentro de rutas públicas
- `app/layout.tsx` → mínimo, sin `globals.css` (para no contaminar Payload)

**Shell explícito en `global-not-found.tsx`:**
```tsx
<html lang="es" className={`${inter.variable} ${jetbrainsMono.variable}`}>
  <body className="bg-bg text-ink font-sans">
    <Header />
    <section>{/* UI 404 */}</section>
    <Footer />
  </body>
</html>
```

Este archivo declara explícitamente todas sus dependencias visuales en vez de "heredarlas", que es exactamente lo que buscaba el ADR.

## Verificación
Build exitoso con flag experimental activa:
```
- Experiments (use with caution):
  ✓ globalNotFound
✓ Compiled successfully in 23.7s
```

**URL inexistente (`/pagina-que-no-existe`):**
- ✅ HTTP 404 correcto
- ✅ HTML contiene `<html lang="es">`, `<body class="bg-bg text-ink font-sans">`
- ✅ Clases CSS presentes: `code-404`, `btn-grad`, `site-header`, `site-footer`
- ✅ Variables de fuente Inter y JetBrains Mono cargadas
- ✅ CTAs "Volver al inicio" e "Ir al blog" funcionando

**Admin (`/admin`):**
- ✅ NO contiene `bg-bg`, `btn-grad`, `code-404`
- ✅ Contenido Payload renderiza correctamente
- ✅ Sin contaminación de Tailwind del frontend

## Advertencia detectada
```
⚠ "next start" does not work with "output: standalone" configuration.
Use "node .next/standalone/server.js" instead.
```

Este warning aparece en `pnpm start` pero no afecta la funcionalidad local. El servidor arrancó y la verificación pasó. Para deploy en producción, considerar usar el comando recomendado.

## Desbloquea
Este issue desbloquea [TOD-78](/TOD/issues/TOD-78) (QA de la 404 pública).

## Commits
- `57adbfa` — feat(TOD-82): implementar 404 global con global-not-found.tsx
- `c6cd2bd` — docs(TOD-81): agregar ADR 0017 y nota del Architect sobre 404 global
