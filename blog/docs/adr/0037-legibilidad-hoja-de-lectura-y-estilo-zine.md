# 0037 — Legibilidad del Cuaderno, hoja de lectura y estilo Zine en componentes

- Estado: aceptada
- Fecha: 2026-09-14
- Decidido por: board (José), con propuesta y pruebas de Claude Code

## Contexto

Tras la Fase 1 del Cuaderno (ADR 0036) el sitio ganó personalidad, pero:

1. **Costaba leer.** La pauta azul al 35 % se repetía cada 28 px, casi igual que el interlineado
   del cuerpo (~30 px): las líneas caían sobre cada renglón. Además la máscara radial dejaba la
   pauta **más intensa en el centro**, justo detrás del texto, y el papel arrugado al 40 % añadía
   manchas grises.
2. **Los componentes no encajaban.** Botones con degradado, chips píldora, inputs lisos y tags
   semitransparentes venían de un diseño SaaS limpio y se veían "pegados" sobre la libreta.

Para el visitante la prioridad es la legibilidad; el carácter no debe costarla.

## Opciones consideradas

Legibilidad:
- Desactivar la pauta por defecto — legible / pierde la identidad para quien entra por primera vez.
- Solo cambiar grosor/color del texto — no ataca la causa (pauta sobre renglones).
- **Pauta tenue con líneas mayores + carril de lectura + textura sutil + hoja para posts** — ataca
  cada causa sin quitar el carácter.

Componentes (prototipos inyectados con Playwright sobre el sitio real, capturas en la revisión):
- A · Bitácora a mano (trazo irregular con `border-image` SVG, sombra de tinta) — cálida, sutil.
- **B · Zine** (bordes de tinta de 2 px, sombras duras desplazadas, resaltador, stickers) — la más
  cohesiva y legible; cercana al neo-brutalismo.
- C · Papelería suave (bordes punteados, cinta washi) — discreta; la cinta requiere SVG dedicado.

## Decisión

1. **Pauta** (`app/globals.css`, sección "Cuaderno del Ingeniero"):
   - líneas finas al 10 % y una línea mayor al 20 % cada 5 cuadros (140 px), en las 4 tintas y
     ambos temas (oscuro al 8 % / 16 %);
   - `data-grid-fade="true"` ahora significa **carril de lectura**: máscara horizontal que baja la
     pauta al 35 % en la columna central (±420 px) y la deja completa en los márgenes. El panel lo
     llama "Despejar zona de lectura".
2. **Textura** por defecto "Sutil" (0.24) en CSS, `CUADERNO_BOOTSTRAP_SCRIPT` y
   `DEFAULT_CUADERNO_SETTINGS`. Quien ya guardó otra intensidad la conserva.
3. **`--ink-3`** en tema claro: #64748b → #536177 (más contraste sobre papel texturizado).
4. **Hoja de lectura**: `.post-article` es una hoja blanca con línea de margen roja. Crece hacia
   afuera con margen negativo (`--sheet-pad`: 56 / 36 / 18 px según ancho) para que el texto conserve
   `--wrap-narrow`. En móvil ocupa todo el ancho, sin línea de margen.
5. **Estilo Zine (B)** como capa al final de `globals.css`, gobernada por tokens
   `--zine-ink`, `--zine-shadow`, `--zine-border`, `--zine-shift(-sm)`, `--zine-radius(-sm)`,
   `--zine-hl`, `--zine-cta-*`. Cubre botones, chips, orden, paginación, campos, tags, badge
   destacado, cat-pill, cards, prev/next, autor, diálogos (panel del Cuaderno, menú móvil) y la paleta
   de búsqueda. El CTA deja el degradado por azul plano (en oscuro, azul claro con texto oscuro para
   mantener contraste). El degradado sigue en logo, avatar y progreso.
6. Se descarta A y C como dirección principal. La cinta washi de C se hará **bien dibujada (SVG)
   y solo en la card destacada** dentro del Kit de Doodles (Fase 2).

## Consecuencias

- Un solo lugar para calibrar el "nivel brutal": bajar `--zine-border` a 1.5px o `--zine-shift` a
  3px suaviza todo el sitio; borrar la sección lo desactiva.
- La capa sobrescribe reglas base con la misma especificidad por orden de cascada: cualquier regla
  nueva de esos componentes debe ir **antes** de la sección Zine o respetar sus tokens.
- **Fase 2 (Doodles)** debe hablar el mismo idioma: trazo de 2 px en `--zine-ink`, colores planos
  (resaltador `--zine-hl`, azul), sin blur ni degradados. Los `--chalk-*` pastel conviene migrarlos a
  una paleta tipo riso más saturada cuando se usen.
- `CommandPalette` usa estilos inline; ahí se leen los tokens Zine directamente (sin clases).
- Contraste del CTA en oscuro validado visualmente; si se cambia `--zine-cta-bg`, revisar WCAG.
