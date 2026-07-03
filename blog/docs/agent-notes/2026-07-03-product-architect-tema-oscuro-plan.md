# 2026-07-03 — Product Architect — plan de tema oscuro

## Qué hice

- Revisé el contexto canónico del proyecto en `blog/AGENTS.md`.
- Inspeccioné el frontend actual para identificar cómo está construida la capa visual.
- Detecté que `app/globals.css` centraliza tokens, pero hoy solo define tema claro.
- Detecté que el header oculta `.header-social` en móvil, así que el switch no puede colgar de ese grupo si debe seguir visible.
- Localicé superficies con estilos inline o colores hardcodeados que requieren auditoría para no romper el dark mode.
- Escribí el ADR `docs/adr/0028-tema-oscuro-publico-por-tokens.md`.

## Decisión tomada

El tema oscuro se implementará solo en el frontend público y se resolverá con `data-theme` en `<html>` más una ampliación de la capa existente de design tokens. El tema claro actual queda como baseline exacto y default inicial. No se añade una librería de theming por ahora.

## Por qué

La app ya tiene una base correcta para esto: tokens CSS centralizados. Meter una dependencia para theming no elimina el trabajo duro, que es definir la paleta dark y limpiar estilos que siguen asumiendo fondo blanco. La decisión más simple y estable es mantener el contrato visual en CSS variables y usar una persistencia mínima para el selector del usuario.

## Subdivisión de trabajo propuesta

- Frontend: infraestructura del tema, switch visible en header, bootstrap anti-flash y tokens dark base.
- Engineer: auditoría y migración de vistas/componentes que aún tienen estilos light-only o inline.
- QA: validación visual y funcional en desktop/móvil, persistencia y contraste básico.

## Riesgos que dejé señalados

- Varias páginas todavía tienen `background`, `color` o `boxShadow` inline con valores de tema claro.
- El layout móvil del header necesita un hueco explícito para el switch.
- El admin de Payload no entra en alcance; mezclarlo en este issue reabriría superficie sin necesidad.
