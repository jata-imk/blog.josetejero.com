# [BORRADOR PARA NOTION — Recent Content, tag: In Progress]

> Instrucciones: pegar en el Creator's Companion → Recent Content. Status/tag: **In Progress**.
> Si el Notion MCP queda instalado, Claude puede publicarlo directamente en la próxima sesión.

---

# CI/CD para mi blog: qué es un pipeline, cómo lo construí y cuándo NO deberías hacerlo

*Escrito para alguien que está empezando a programar. Si ya sabes qué es GitHub Actions, salta
directo a "La decisión de diseño interesante". Si no, quédate: vamos despacio.*

## Primero: ¿qué problema estamos resolviendo?

Mi blog ([josetejero.com](https://josetejero.com)) corre en un servidor pequeño que alquilo (un
VPS). La aplicación vive dentro de un contenedor de Docker — piensa en Docker como una caja
sellada que contiene la aplicación con todo lo que necesita para funcionar, de modo que se
comporta igual en cualquier máquina.

Hasta esta semana, publicar una nueva versión del blog (un "deploy") era un ritual manual:

1. Entrar al servidor por SSH (una terminal remota).
2. `git pull` — descargar el código nuevo.
3. `docker build ...` — **compilar la aplicación en el propio servidor**.
4. `docker compose up -d` — arrancar la versión nueva.

Funciona. De hecho, funcionó durante semanas. Pero tiene tres problemas que fui acumulando:

**Problema 1: el build castiga al servidor en producción.** Compilar Next.js + Payload CMS es
pesado: consume CPU y memoria durante varios minutos. Y lo hacía en el mismo servidor modesto que
está sirviendo el blog a los visitantes en ese momento. Es como remodelar la cocina de un
restaurante en plena hora de la comida: se puede, pero los clientes lo notan.

**Problema 2: no hay marcha atrás rápida.** Si la versión nueva sale mal, no existe una "versión
anterior" guardada a la que volver con un clic. Hay que revertir el código y volver a compilar
todo — con el sitio roto mientras tanto.

**Problema 3: depende de mi memoria.** Mi propio runbook (el documento donde anoto cómo se hace
el deploy) tenía advertencias como *"usa `--no-cache` si solo cambió contenido"*, *"corre las
migraciones ANTES del build"*, *"no olvides `--network host`"*. Cada una de esas notas existe
porque algún día lo hice mal. Un proceso que depende de que un humano recuerde pasos en el orden
correcto es un proceso que eventualmente fallará.

## Qué es CI/CD, sin humo

**CI (Integración Continua)**: cada vez que subes código, una máquina lo verifica automáticamente
(¿compila?, ¿pasa el linter?, ¿pasan los tests?). **CD (Despliegue Continuo)**: si todo pasa, esa
misma máquina publica la versión nueva sin intervención humana.

Un "pipeline" es simplemente la cadena de pasos automatizados. El mío ahora es esta:

```
git push a main
     │
     ▼
┌────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────┐
│  lint  │ →  │   build + push  │ →  │     deploy      │ →  │   warm-up   │
│ ¿el có-│    │ compila la ima- │    │ entra por SSH   │    │ "despierta" │
│ digo   │    │ gen Docker y la │    │ al servidor:    │    │ las páginas │
│ está   │    │ guarda en un    │    │ descarga imagen │    │ del sitio   │
│ limpio?│    │ almacén (GHCR)  │    │ y la arranca    │    │             │
└────────┘    └─────────────────┘    └─────────────────┘    └─────────────┘
```

Todo esto lo ejecuta **GitHub Actions**: máquinas de GitHub que se prenden cuando hago push,
corren los pasos definidos en un archivo YAML dentro del repo, y se apagan. Para un repo como el
mío, gratis (2,000 minutos al mes en el plan free; mi pipeline gasta ~5-8 minutos por deploy).

La imagen compilada se guarda en **GHCR** (GitHub Container Registry): un almacén de imágenes
Docker. Cada imagen queda etiquetada con el identificador exacto del commit que la produjo. Eso
significa que **cada versión que alguna vez desplegué sigue existiendo**, lista para volver a
usarse. ¿Deploy roto? Vuelvo a la imagen anterior en menos de un minuto. Ese es el rollback que
antes no tenía.

## La decisión de diseño interesante: el build "hermético"

Aquí está la parte que más me gustó del proyecto, porque ilustra cómo se piensa un problema de
ingeniería de verdad.

Mi blog usa una técnica llamada prerenderizado: al compilar, Next.js **ejecuta** las páginas
(la portada, las listas de categorías, el sitemap...) y guarda el HTML resultante, para servirlo
instantáneamente a los visitantes. El detalle: para ejecutar esas páginas necesita **consultar la
base de datos** — ¿qué posts existen?, ¿qué categorías?

Eso creaba un dilema: la base de datos vive en mi servidor, y ahora el build corre en las
máquinas de GitHub. Dos opciones:

**Opción A — darle a GitHub acceso a mi base de datos** (mediante un túnel SSH). Funciona, pero
significa guardar llaves de acceso a mi servidor de producción en GitHub, más complejidad, y un
punto de fallo nuevo: si el túnel falla, el build falla.

**Opción B — el build hermético**: que el build NO necesite ninguna base de datos. Modifiqué las
funciones que consultan datos para que, durante el build (y solo durante el build, mediante una
variable `BUILD_WITHOUT_DB=1`), devuelvan listas vacías sin intentar conectarse a nada.

Elegí la B. ¿El precio? Las páginas prerenderizadas salen del horno **vacías** — la imagen recién
compilada tiene una portada sin posts. ¿La solución al precio? El último paso del pipeline
(warm-up): apenas la versión nueva arranca, el pipeline llama a un endpoint secreto del blog que
le dice "regenera todas tus páginas ya", y las visita una por una. Las páginas se rellenan con
datos reales en unos 10-30 segundos.

¿Por qué me gusta esta decisión? Porque cambié un problema de seguridad y complejidad permanente
(llaves de producción en el CI, túnel que puede fallar en cada build) por un costo pequeñísimo y
acotado (medio minuto de páginas vacías durante cada deploy de un blog personal). Bonus
inesperado: los secretos de la base de datos ya ni siquiera participan en el build, así que
tampoco quedan rastros de ellos en la imagen Docker.

Ingeniería es eso: no eliminar todos los costos — elegir cuáles puedes pagar.

## Lo que cambió en el día a día

| Antes | Ahora |
|---|---|
| SSH + 4 comandos + rezar | `git push` |
| Build de ~10 min sobre el servidor en vivo | El servidor solo descarga y arranca (segundos) |
| ¿Deploy roto? Revertir y recompilar todo | Rollback a la imagen anterior en <1 min |
| Gotchas en mi memoria (y en notas) | Gotchas codificados en el pipeline |
| ¿Qué versión está en producción? 🤷 | Cada deploy ligado a un commit exacto, auditable |

## Cuándo SÍ vale la pena montar CI/CD

Después de hacerlo, mi criterio honesto. Móntalo cuando reconozcas **dos o más** de estas señales:

1. **Despliegas con frecuencia** (semanal o más). El ahorro se multiplica por cada deploy. Yo
   publico cambios de código varias veces por semana.
2. **El proceso manual castiga producción** — como mi build comiéndose la CPU del servidor que
   sirve el sitio.
3. **Tienes gotchas anotados.** Si tu runbook dice "no olvides X" o "cuidado con Y", eso es un
   bug del proceso, y los pipelines existen exactamente para eso: una máquina nunca olvida el
   orden de los pasos.
4. **Necesitas rollback.** Si un deploy roto significa sitio caído hasta recompilar, tener
   imágenes versionadas es un seguro baratísimo.
5. **Hay más de una persona desplegando** (o la habrá). El pipeline es el proceso documentado y
   ejecutable; nadie depende del que "sabe cómo se hace".

## Cuándo es sobreingeniería

Y con la misma honestidad — señales de que montar CI/CD **hoy** es procrastinación disfrazada de
productividad:

1. **Despliegas una vez al trimestre.** Un proceso manual de 15 minutos, 4 veces al año, es una
   hora anual. Vas a gastar más que eso solo manteniendo el pipeline.
2. **Tu plataforma ya lo trae.** ¿Sitio en Vercel, Netlify o GitHub Pages? Ya *tienes* CI/CD:
   push y se publica. Montar Actions encima es duplicar lo que la plataforma regala. (Mi caso es
   distinto justo porque me salí de esas plataformas hacia un VPS propio — el CI/CD "de regalo"
   se quedó atrás y tocaba reponerlo.)
3. **Es un prototipo sin usuarios.** Si nadie sufre cuando el sitio se cae 10 minutos, el
   rollback instantáneo no resuelve ningún dolor real. Primero consigue el problema; luego la
   solución.
4. **Aún no tienes claro tu proceso manual.** El pipeline automatiza un proceso que ya entiendes.
   Si todavía no has hecho el deploy a mano suficientes veces para conocer sus esquinas, vas a
   automatizar tus malentendidos. Yo hice ~10 deploys manuales primero — de ahí salieron los
   gotchas que el pipeline ahora codifica.
5. **Lo haces por el CV, no por el proyecto.** Kubernetes para un blog personal. Ya sabes.

La regla resumida: **automatiza cuando el dolor del proceso manual sea recurrente y conocido, no
antes.** El deploy manual no era un error — fue la fase necesaria que me enseñó qué automatizar.
El roadmap de mejoras del blog puso CI/CD en el puesto 4 de 5, *después* de SEO, analytics y
backups, precisamente porque "el deploy manual funciona mientras tanto". Prioridad no es qué es
más interesante técnicamente; es qué duele más.

## Estado

- [x] Build hermético implementado y verificado (compila sin base de datos)
- [x] Workflow de GitHub Actions escrito (lint → build → GHCR → deploy SSH → warm-up)
- [x] Runbook `ci-cd.md` + ADR 0031 documentados en el repo
- [ ] Secrets configurados en GitHub (VPS_HOST, VPS_USER, VPS_SSH_KEY, REVALIDATE_SECRET)
- [ ] Primer run del pipeline completo contra producción
- [ ] Prueba de rollback real

*Actualizaré esta entrada a "Published" cuando el primer deploy automático toque producción.*
