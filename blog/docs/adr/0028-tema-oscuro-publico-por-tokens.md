# ADR 0028 — Tema oscuro público por tokens

**Estado:** Aceptado  
**Fecha:** 2026-07-03  
**Autores:** Product Architect ([TOD-108](/TOD/issues/TOD-108))

## Contexto

[TOD-108](/TOD/issues/TOD-108) pide añadir tema oscuro a la app, mantener el tema claro actual tal cual y mostrar el switch en el header.

El frontend público ya usa una capa centralizada de design tokens en `app/globals.css`, pero hoy está modelada como light-only. No existe infraestructura de theming, no hay dependencia para gestionar temas y varios componentes/páginas aún tienen estilos inline o colores hardcodeados que asumen fondo claro.

Además, el header actual oculta `.header-social` en móvil. Si el switch vive dentro de ese grupo, desaparecería justo en el viewport donde también debe seguir accesible.

El proyecto tiene restricciones explícitas:

- YAGNI: no añadir complejidad de escala que todavía no existe.
- La fuente de verdad visual son los tokens CSS, no colores hardcodeados por componente.
- Payload CMS ya trae su propio sistema visual en admin; este issue describe el sitio público con switch en header, no un rediseño del admin.

## Opciones consideradas

### Opción A — Resolverlo solo con `prefers-color-scheme`

**Pros**
- Cero estado persistido.
- Sin JS específico de tema.

**Contras**
- No cumple el requisito de switch visible en el header.
- El usuario no puede fijar una preferencia distinta a la del sistema.
- Hace más difícil mantener el tema claro actual como baseline explícito.

### Opción B — Añadir una librería de theming (`next-themes` o similar)

**Pros**
- Resuelve persistencia, hidratación y helpers comunes.
- Reduce código propio de infraestructura.

**Contras**
- Introduce una dependencia nueva para un caso pequeño.
- El problema real sigue siendo el mismo: definir tokens oscuros y migrar estilos light-only.
- Va contra YAGNI cuando el contrato necesario cabe en una capa mínima propia.

### Opción C — Tema dual con `data-theme` en `<html>`, tokens CSS y persistencia mínima

**Pros**
- Mantiene la fuente de verdad en `app/globals.css`.
- Permite preservar el tema claro actual como default exacto.
- La preferencia puede persistirse sin dependencia externa.
- Encaja bien con App Router y con componentes server/client ya existentes.

**Contras**
- Requiere un pequeño bootstrap para evitar flash incorrecto antes de hidratar.
- Obliga a auditar estilos inline o hardcodeados fuera de la tokenización.

## Decisión

Se adopta la **Opción C** para el frontend público.

El contrato arquitectónico queda así:

1. El sitio público tendrá dos temas controlados por `data-theme="light|dark"` en `<html>`.
2. **`light` es el default inicial** para conservar el look actual sin reinterpretarlo.
3. La preferencia del usuario se persistirá en cliente y se aplicará antes de la hidratación para evitar FOUC.
4. La implementación se apoyará en la capa existente de tokens CSS. El tema oscuro se define sobrescribiendo variables, no duplicando estilos por componente.
5. El switch va en el header público y debe permanecer visible en desktop y móvil; por eso no depende del contenedor `.header-social` actual.
6. El alcance de este issue cubre el **frontend público** (`app/(frontend)` y sus componentes compartidos). El admin de Payload queda fuera salvo ajuste incidental no invasivo.
7. Los componentes con colores inline o hardcodeados deben migrarse a tokens o a variantes derivadas del tema antes de considerar terminado el trabajo.

## Consecuencias

**Positivas**

- Se conserva el diseño actual de light como baseline verificable.
- El dark mode se vuelve un problema de tokens, no de ramas de estilo dispersas.
- El costo de mantenimiento baja porque los componentes siguen consumiendo la misma API visual.
- La accesibilidad y la revisión visual pueden hacerse de forma sistemática en ambos temas.

**Limitaciones y deuda asumida**

- Hay que auditar y corregir componentes con supuestos de fondo claro, especialmente páginas con estilos inline.
- El header necesitará un ajuste estructural pequeño para alojar el switch sin perderlo en móvil.
- Si más adelante se quiere sincronizar con `prefers-color-scheme`, eso sería una evolución posterior sobre el mismo contrato, no parte de este issue.
