# Runbook: Google Search Console + Analytics (GA4)

## Objetivo

Dar de alta las dos piezas de medición del blog (ADR 0030) y saber leer sus informes: **Google
Search Console** (cómo te ve Google — qué búsquedas te traen tráfico) y **Google Analytics 4**
(cuánta gente visita el sitio y qué lee). Ninguna de las dos, por separado, contesta ambas
preguntas — se necesitan las dos.

| Pregunta | Dónde se contesta |
|---|---|
| "¿Qué términos de búsqueda me traen tráfico?" | **Solo** Search Console (Rendimiento → Consultas) |
| "¿Cuáles son mis páginas favoritas (por clics desde Google)?" | Search Console (Rendimiento → Páginas) |
| "¿Cuánta gente me lee en total (LinkedIn, RSS, directo)?" | **Solo** GA4 (Informes → Interacción → Páginas) |
| "¿De dónde llega la gente?" | GA4 (Informes → Adquisición) |

## Parte 1 — Google Search Console

### 1.1 Crear la propiedad

1. Entra a [search.google.com/search-console](https://search.google.com/search-console).
2. **Añadir propiedad** → elige **Dominio** (no "Prefijo de URL"): verifica `josetejero.com`
   completo, incluidos `www` y cualquier subdominio futuro, en un solo paso (ADR 0030).
3. Google te da un **registro TXT** para añadir al DNS del dominio.

### 1.2 Verificar por DNS TXT (Namecheap)

El DNS de `josetejero.com` se administra en **Namecheap** (el registrador), no en CloudPanel ni
en el VPS — son sistemas independientes. CloudPanel solo gestiona el reverse proxy y el
certificado SSL una vez el dominio ya resuelve a la IP del VPS (ver runbook `deploy.md`, sección
"CloudPanel / Nginx"); no interviene para nada en la verificación de Search Console.

1. Inicia sesión en [namecheap.com](https://www.namecheap.com) → **Domain List** → **Manage**
   junto a `josetejero.com`.
2. Ve a la pestaña **Advanced DNS**.
3. En **Host Records**, pulsa **Add New Record** y configura:

   | Type | Host | Value | TTL |
   |---|---|---|---|
   | TXT Record | `@` | `google-site-verification=xxxxxxxxxxxxx` (el valor exacto que dio Search Console) | Automatic |

   > **`Host` debe ser `@`, no vacío ni `josetejero.com`.** En Namecheap, `@` representa la raíz
   > del dominio — es la convención de ese panel para lo que en otros registradores se escribe
   > como el dominio desnudo. No toques el registro **A** existente (el que apunta a la IP del
   > VPS, documentado en `deploy.md`): el TXT es un registro **adicional**, no lo reemplaza.
4. Pulsa el check verde (✓) para guardar la fila. Namecheap no tiene un botón global "Guardar" —
   cada fila se confirma individualmente.
5. Espera la propagación. Namecheap usa TTL "Automatic" (~30 min típico), pero la propagación DNS
   real puede tardar más — hasta un par de horas en casos raros. Puedes confirmar que ya propagó
   sin esperar a Search Console:

   ```bash
   nslookup -type=TXT josetejero.com
   ```

   Busca tu línea `google-site-verification=...` en la salida. Si no aparece, espera más.
6. Vuelve a Search Console y pulsa **Verificar**. Si falla, es casi siempre propagación DNS
   pendiente — no un error de configuración; reintenta más tarde en vez de recrear el registro.

**No hay nada que hacer en CloudPanel ni en el VPS para este paso.** La verificación de dominio
de Search Console es una consulta DNS que Google hace directamente contra el registrador — no
pasa por el servidor web ni por Nginx, así que es independiente de si la app está arriba o no.

### 1.3 Enviar el sitemap

1. Dentro de la propiedad verificada: **Sitemaps** (menú lateral) → pega `sitemap.xml` → **Enviar**.
   Search Console lo resuelve como `https://josetejero.com/sitemap.xml` (ya vivo desde ADR 0029).
2. El estado pasa a "Correcto" cuando Google lo procesa (puede tardar horas/días, no es instantáneo).

### 1.4 (Opcional) Acelerar la indexación inicial

En **Inspección de URLs**, pega la URL de una entrada importante → si dice "URL no está en
Google" → **Solicitar indexación**. Útil para las primeras entradas mientras Google descubre el
sitio por su cuenta vía el sitemap.

### 1.5 Cómo leer los informes que pediste

- **Rendimiento → pestaña Consultas**: esto es "los términos más buscados". Cada fila es una
  búsqueda real de Google que mostró tu sitio, con impresiones (veces que apareciste), clics,
  CTR y posición media. Ordena por clics para ver qué te trae más tráfico.
- **Rendimiento → pestaña Páginas**: tus páginas favoritas *desde la óptica de Google* — las que
  más clics reciben en resultados de búsqueda.
- **Cobertura / Páginas** (menú lateral): qué páginas están indexadas y cuáles tienen errores de
  rastreo — revísalo cada tanto para detectar problemas antes de que se acumulen meses.

Los datos tardan ~2-3 días en empezar a aparecer tras la verificación; no es en tiempo real.

## Parte 2 — Google Analytics 4

### 2.1 Crear la propiedad y obtener el Measurement ID

1. Entra a [analytics.google.com](https://analytics.google.com) → **Administrar** → **Crear
   propiedad**. Nombre sugerido: `josetejero.com`. Zona horaria y moneda: las que prefieras (no
   afectan la medición, solo el formato de fechas/montos en los informes).
2. Al configurar el flujo de datos, elige **Web** → URL del sitio: `https://josetejero.com`.
3. Google genera un **Measurement ID** con formato `G-XXXXXXXXXX`. Cópialo.

### 2.2 Configurar el ID en el proyecto

El ID va en la variable de entorno `NEXT_PUBLIC_GA_ID`. Como es `NEXT_PUBLIC_*`, se incrusta al
**compilar** la imagen Docker — no basta con ponerlo en el `.env` del VPS si no viaja también
como build-arg (ver `docs/runbooks/deploy.md`, ya actualizado con `NEXT_PUBLIC_GA_ID` en los tres
comandos `docker build` documentados).

```env
# .env de producción en el VPS
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

Si construyes manualmente en el VPS (sección "Build en el VPS" del runbook de deploy), agrega el
build-arg:

```bash
docker build --network host \
  --build-arg 'DATABASE_URL=...' \
  --build-arg 'PAYLOAD_SECRET=...' \
  --build-arg 'NEXT_PUBLIC_SITE_URL=https://josetejero.com' \
  --build-arg 'NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX' \
  -t josetejero-blog:local .
docker compose up -d
```

Sin este valor, el sitio no muestra el banner de cookies ni carga ningún script de Google (así
queda dev/local, limpio por defecto).

### 2.3 Verificar que está midiendo

1. Tras el redeploy, abre `https://josetejero.com` en una ventana nueva (o incógnito) y acepta el
   banner de cookies que aparece.
2. En GA4 → **Informes → Tiempo real**: deberías ver tu visita aparecer en segundos.
3. Si no aparece: revisa que `NEXT_PUBLIC_GA_ID` haya llegado al bundle (busca `G-` en el código
   fuente servido de la home) y que hayas aceptado el banner (sin aceptar, GA4 no envía nada — es
   el comportamiento correcto de Consent Mode v2, ver ADR 0030).

### 2.4 Cómo leer los informes que pediste

- **Informes → Interacción → Páginas y pantallas**: tus páginas favoritas *por visitas totales*
  (incluye tráfico de LinkedIn, RSS, enlaces directos — todo lo que Search Console no ve).
- **Informes → Adquisición → Adquisición de tráfico**: de dónde viene la gente (Google orgánico,
  redes sociales, directo, referencias). Complementa a Search Console, que solo ve el tráfico
  *desde* Google.
- **Informes → Público**: países y dispositivos de tus lectores.

### 2.5 El banner de cookies — qué hace y por qué existe

GA4 usa una cookie (`_ga`) para distinguir visitas, lo que la convierte en un dato personal bajo
GDPR/ePrivacy. El sitio arranca en modo "sin medir" (Consent Mode v2, denegado por defecto) y
solo activa GA4 tras que el visitante pulse "Aceptar" en el banner que aparece en su primera
visita. Si rechaza, no se guarda ninguna cookie de analytics y esa visita no cuenta en ningún
informe de GA4 (sí puede seguir contando en Search Console, que no depende de cookies del
navegador). Detalle técnico completo en el ADR 0030 y en `/privacidad`.

## Checklist final

- [ ] Propiedad de dominio creada en Search Console, verificada por DNS TXT.
- [ ] `sitemap.xml` enviado en Search Console.
- [ ] Propiedad GA4 creada, Measurement ID obtenido.
- [ ] `NEXT_PUBLIC_GA_ID` en el `.env` de producción y pasado como build-arg en el próximo deploy.
- [ ] Verificado en Tiempo real (GA4) que una visita de prueba aparece tras aceptar el banner.
- [ ] Esperar 2-3 días y revisar Rendimiento → Consultas en Search Console para ver los primeros
      términos de búsqueda reales.
