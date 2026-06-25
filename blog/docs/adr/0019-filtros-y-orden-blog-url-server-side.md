# 0019 — Filtros y orden de `/blog` como estado URL server-side

- Estado: aceptada
- Fecha: 2026-06-25
- Decidido por: Frontend (TOD-86)

## Contexto

El listado `/blog` necesita soportar filtrado por categoría, por tag popular, orden cronológico
y un bloque destacado, sin romper SSR ni duplicar lógica entre cliente y servidor.

El conflicto principal es entre velocidad de interacción y coherencia de estado:

- Estado client-side ofrece transiciones locales sin recarga, pero complica SSR, deep-linking
  y sincronización con paginación.
- Estado URL server-side mantiene un único origen de verdad, URLs compartibles e indexables,
  y evita duplicar lógica entre cliente y servidor.

## Opciones consideradas

- **Opción A — filtros controlados solo en cliente.**
  El servidor renderiza una lista base y React recompone localmente.
  Pros: interacciones rápidas. Contras: sin deep-linking, estado perdido al recargar.

- **Opción B — filtros y orden vía `searchParams` en URL.**
  La página SSR lee `page`, `cat`, `tag` y `sort`, llama helpers server-side y renderiza
  el resultado final.
  Pros: URLs compartibles, coherencia SSR, paginación consistente, sin estado local opaco.
  Contras: navega servidor en cada cambio de filtro (aceptable para un sitio editorial).

- **Opción C — híbrido local + sincronización parcial a URL.**
  Parte del estado en cliente, parte en servidor.
  Contras: complejidad sin beneficio claro para el volumen y naturaleza del sitio.

## Decisión

Tomamos la Opción B.

- `/blog` usa `searchParams` como contrato público: `page`, `cat`, `tag`, `sort`.
- La página resuelve filtros y paginación server-side con `getPosts({ category, tag, sort, excludeFeatured })`.
- El `FeaturedCard` solo aparece en el estado base (sin filtros activos); al filtrar,
  se oculta y el grid trabaja con `excludeFeatured: true`. Esto evita duplicados y simplifica
  la lógica.
- Los tabs de categoría y chips de tags navegan por `<a>` links con `href` construido
  en servidor; no hay estado local opaco.
- El badge de serie se deriva de `Boolean(post.series)`; no se persisten flags nuevos.
- El `SortSelect` es el único Client Component de la página: necesita `useRouter` para
  actualizar el param `sort` preservando `cat` y `tag` activos.
- La paginación construye `href` conservando todos los params activos mediante `buildHref`.

## Consecuencias

- Las URLs son compartibles, indexables y coherentes con SSR.
- La paginación conserva filtros sin necesidad de otro almacén de estado.
- El destacado deja de ser "sticky" bajo filtros, lo que simplifica la lógica y evita
  resultados duplicados en el grid.
- El coste es aceptar navegación server-side en cada cambio de filtro/orden, correcto para
  la naturaleza editorial y el tamaño actual del sitio.
- El único Client Component (`SortSelect`) es mínimo: solo `useRouter` + `<select>`.
