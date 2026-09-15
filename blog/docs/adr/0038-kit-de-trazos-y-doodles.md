# 0038 — Kit de Trazos & Doodles SVG

- Estado: aceptada
- Fecha: 2026-09-14
- Decidido por: board (José), implementado por Claude Code

## Contexto

Fase 2 del rediseño "Cuaderno del Ingeniero". Con el lienzo (ADR 0036) y el estilo Zine
(ADR 0037) ya en producción faltaban los gestos a mano que dan calidez: subrayados, círculos,
flechas, chispas y cinta adhesiva. Deben:

- hablar el idioma Zine: trazo de 2 px, colores planos, sin blur ni degradados;
- funcionar en claro y oscuro sin duplicar SVG;
- no afectar accesibilidad, SEO ni rendimiento (sin JS en cliente, sin dependencias);
- **no** usarse dentro del cuerpo de los posts (decisión del board: evita un bloque Lexical nuevo,
  que según ADR 0003 requeriría su propio ADR).

## Opciones consideradas

- **Librería de trazos a mano (rough.js u otra)** — trazos generativos / JS en cliente, peso extra,
  resultado distinto en cada render (hidratación inestable).
- **Imágenes SVG sueltas en `/public`** — simples / no heredan color del tema; una variante por tono.
- **SVG inline en Server Components + `currentColor`** — el tono viene de CSS y cambia con el tema;
  cero JS; trazos dibujados a mano una vez y estirados con `preserveAspectRatio="none"` +
  `vector-effect="non-scaling-stroke"` para mantener 2 px a cualquier ancho.

Para la cinta washi:
- SVG con `<pattern>` — necesita ids únicos por instancia (`useId`).
- **Máscara CSS con la silueta rasgada sobre un relleno liso** — sin ids, n cintas por página.

## Decisión

`components/ui/Doodles.tsx` (Server Components puros, todo `aria-hidden`):

| Componente | Uso | Notas |
|---|---|---|
| `ChalkUnderline` | envuelve texto | `variant: single \| double` |
| `ChalkCircle` | envuelve texto | trazo que no cierra, como marcador |
| `DoodleArrow` | suelto | `size`, `flip`, `rotate` |
| `DoodleSparkle` | suelto | estrella rellena + destellos |
| `WashiTape` | posicionado absoluto | `size: sm \| md`, `rotate`, **lisa** (sin rayas, a pedido del board) |

- Tonos `ink | blue | pink | yellow | green | orange` → clases `.doodle-tone-*` → tokens `--chalk-*`,
  migrados de pastel a tintas planas tipo risografía, con variante luminosa en oscuro.
- `animated` opcional: dibuja el trazo al cargar (`pathLength=1` + `stroke-dashoffset`), desactivado
  con `prefers-reduced-motion`. Solo para piezas visibles sin scroll.
- Tarjetas con cinta llevan `.has-tape`: `overflow: visible` y el redondeo pasa a la imagen, para que
  la cinta sobresalga del borde sin recortarse.

Usos en esta fase:
- Cinta washi amarilla: card destacada de `/blog` y primera card de "Posts destacados" en la home.
- Cinta azul pequeña: filtro de categoría activo en `/blog`.
- `ChalkUnderline` azul en los títulos de sección de la home; doble rosa en los `h1` de `/blog`,
  `/series` y `/categorias`.

`DoodleArrow`, `DoodleSparkle` y `ChalkCircle` quedan listos para la Fase 3 (hero) y Fase 4 (collage).

## Consecuencias

- Añadir un doodle nuevo = un componente con trazos en un lienzo fijo + `currentColor`.
- El texto envuelto sigue siendo texto: buscadores y lectores de pantalla no ven los trazos.
- Los trazos estirados se deforman si el texto es muy largo o parte en varias líneas (el subrayado
  queda bajo la caja completa). Usar en títulos cortos.
- `--chalk-*` cambió de valores; cualquier uso futuro asume la paleta riso.
