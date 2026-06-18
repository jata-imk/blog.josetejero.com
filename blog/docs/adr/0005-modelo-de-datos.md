# 0005 — Modelo de datos y reglas mínimas de acceso para colecciones Payload

- Estado: aceptada
- Fecha: 2026-06-18
- Decidido por: Product Architect

## Contexto
La base de colecciones de Payload ya existe, pero `TOD-11` exige cerrar cuatro decisiones de
modelo que no conviene dejar implícitas:

- cómo representar series sin duplicar la posición visible del post
- cómo mantener el acceso público de `Comments` sin abrir la moderación
- cómo hacer que `role` (`admin | editor`) tenga efecto real sin diseñar un sistema de permisos
- cómo autocompletar `slug` en `Posts`, `Series`, `Categories` y `Tags` sin meter librerías
  externas ni sobrescribir valores editados manualmente

Además, `blog/AGENTS.md` y `data-model.md` ya fijan restricciones importantes: Payload es la única
capa de datos, rige YAGNI, y todo dato derivable debe derivarse en vez de persistirse.

## Opciones consideradas
- **Persistir más estado derivado y resolver permisos colección por colección** — ventaja:
  implementación directa en cada fichero. Desventaja: duplica lógica, abre inconsistencias
  (`position` vs `seriesOrder`) y vuelve más difícil explicar y mantener el sistema.
- **Mantener el modelo mínimo y extraer helpers reutilizables para slug y acceso** — ventaja:
  conserva una sola fuente de verdad, reduce repetición y deja reglas pequeñas y legibles.
  Desventaja: obliga a acordar una convención común para hooks y helpers antes de implementar.

## Decisión
Se mantiene un **modelo mínimo derivado** y se añaden solo dos familias de helpers reutilizables:
uno para `slug` y otro para control de acceso por `role`.

Las reglas quedan así:

- **Series**: `Posts` guarda `series` y `seriesOrder`. La posición visible "N de M" nunca se
  persiste; se deriva ordenando los posts de la serie por `seriesOrder` al renderizar o consultar.
- **Comments**: el acceso público existente no cambia. Crear sigue siendo público y el documento
  entra en `pending`; la lectura pública sigue filtrada a `approved`. La moderación queda para
  usuarios autenticados con permisos de contenido.
- **Roles**: `editor` puede crear y editar contenido (`Posts`, `Series`, `Categories`, `Tags`,
  `Media`) y moderar `Comments`. `admin` hereda eso y además gestiona `Users` y operaciones de
  borrado. La implementación debe vivir en un par de helpers pequeños, no en una matriz de
  permisos compleja.
- **Auto-slug**: `Posts`, `Series`, `Categories` y `Tags` usan un hook `beforeValidate` compartido
  que genera el `slug` solo cuando el campo llega vacío. El hook debe normalizar a minúsculas,
  reemplazar espacios por guiones y eliminar acentos/símbolos sin dependencias externas. Si el
  slug ya existe, se respeta sin regenerarlo.

## Consecuencias
- Más fácil: el modelo sigue alineado con YAGNI y con la regla de "derivar, no duplicar".
- Más fácil: el comportamiento de acceso y de slugs se explica y prueba desde helpers únicos.
- Más fácil: el admin mantiene flexibilidad para editar slugs a mano cuando haga falta.
- Más difícil: Engineer tendrá que revisar con cuidado los hooks de Payload (`beforeValidate` frente
  a `beforeChange`) y aplicar permisos consistentes sin romper el acceso público de `Comments`.
- Deuda asumida: no diseñamos permisos granulares por acción o por campo más allá de lo necesario
  para `admin` y `editor`; si aparecen más roles, hará falta un ADR nuevo.
