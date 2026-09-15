# Menú móvil y CTA "Sobre mí" en el hero

- Fecha: 2026-09-14
- Agente: Claude Code
- Rama: `feat/menu-movil-sobre-mi` (apilada sobre `fix/cuaderno-lint-bootstrap`)
- ADR relacionado: `docs/adr/0036-cuaderno-del-ingeniero-lienzo-personalizable.md` (mismo patrón de `<dialog>`)

## Problema

Bajo 768 px el CSS ocultaba `.site-nav` y `.header-social` sin reemplazo. En móvil no había
**ninguna** forma de navegar desde la cabecera, y tampoco de **buscar**: el botón de búsqueda vivía
dentro de `.header-social`.

## Qué se hizo

- `components/layout/MobileNav.tsx`: botón hamburguesa + hoja lateral desde la derecha.
  - `<dialog>` con `showModal()`: foco atrapado, fondo inerte, `Esc` y clic en el backdrop cierran.
    El evento `close` concentra la limpieza: devuelve el foco al botón y quita el bloqueo de scroll.
  - `aria-expanded` / `aria-haspopup` en el disparador; `aria-current="page"` en la sección activa
    (reusa `matchActive` del Header, una sola fuente de verdad para "qué está activo").
  - Si la ventana crece a desktop con el menú abierto, se cierra (`matchMedia`).
  - Enlaces sociales al pie del panel; título en `--font-sketch` para seguir el tono del Cuaderno.
  - Animación de entrada desactivada con `prefers-reduced-motion`.
- Header: en móvil aparece el botón de búsqueda en `.header-actions` (orden: buscar, cuaderno,
  tema, menú). En desktop nada cambia.
- Hero: el botón secundario pasó de "Ver series" (`/series`) a "Sobre mí" (`/sobre-mi`), con icono
  `user`. Se usa "Sobre mí" y no "Acerca de mí" porque es el nombre que ya tienen la nav, el footer
  y la página; cambiar solo el botón crearía dos nombres para el mismo destino.
- `Ic`: iconos `menu` y `user`.

## Concepto: por qué `<dialog>` y no un `div` con estado

Un menú que tapa la página es un modal. Hacerlo "a mano" exige atrapar el foco con Tab, marcar el
resto como inerte para lectores de pantalla, escuchar `Esc` y apilarlo por encima de todo con
`z-index`. `showModal()` hace todo eso de forma nativa y coloca el diálogo en la *top layer* del
navegador, por encima de cualquier `z-index` (útil aquí porque la cabecera usa `backdrop-filter`,
que crearía un contexto de apilamiento para un `div` fijo).

## Verificación

- `pnpm lint` y `pnpm exec tsc --noEmit`: correctos.
- Playwright a 390×844: abrir menú, sección activa marcada, `Esc` cierra y devuelve foco al botón,
  scroll desbloqueado; la búsqueda abre desde la cabecera móvil.
- 1280×800: cabecera sin cambios, hamburguesa y búsqueda duplicada ocultas; hero con "Sobre mí".
