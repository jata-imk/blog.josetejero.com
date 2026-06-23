# TOD-65 — Corregir validación del seed de posts Lexical

## Qué hice

Actualicé `lib/seed.ts` para alinear el JSON de Lexical hardcodeado con el shape completo que Payload/lexicalEditor espera actualmente. El seed fallaba con `ValidationError: The following fields are invalid: Cuerpo, Cuerpo > Contenido` porque los nodos Lexical estaban incompletos.

## El problema

`makeBody()` construía el árbol Lexical a mano usando un shape más viejo/simplificado. Faltaban campos obligatorios que Payload v3 + @payloadcms/richtext-lexical v3.85.1 validan:

### Campos faltantes por tipo de nodo

**TextNode** (texto plano y tokens):
- `format`: number (0 = sin formato, 1 = bold, 2 = italic, etc.)
- `style`: string (vacío para sin estilo custom)
- `mode`: "normal" | "token" | "segmented"
- `detail`: number (0 = sin detalles extra)

**ElementNode** (paragraph, heading, list):
- `format`: string (vacío, "left", "center", "right", "justify", "start", "end")
- `indent`: number (nivel de indentación, 0 para ninguno)
- `textFormat`: number (solo para paragraph, formato del texto contenido)

**LinkNode**:
- Todos los campos de ElementNode +
- `version`: number
- `direction`: "ltr" | "rtl" | null
- `rel`: string | null
- `target`: string | null
- `title`: string | null

**ListItemNode**:
- Todos los campos de ElementNode +
- `value`: number (posición en la lista, 1-based)

## La solución

Revisé los tipos en `node_modules/@payloadcms/richtext-lexical/dist/nodeTypes.d.ts` y el shape base de Lexical para identificar todos los campos obligatorios. Luego actualicé `makeBody()` para incluir:

1. **Text nodes** (líneas 151-177, 184-196, etc.): añadí `format: 0`, `style: ''`, `mode: 'normal'`, `detail: 0`
2. **Paragraph nodes**: añadí `format: ''`, `indent: 0`, `textFormat: 0`
3. **Heading nodes**: añadí `format: ''`, `indent: 0`
4. **Link nodes**: añadí `version: 1`, `direction: 'ltr'`, `format: ''`, `indent: 0`, `rel: null`, `target: null`, `title: null`
5. **List node**: añadí `direction: 'ltr'`, `format: ''`, `indent: 0`
6. **ListItem nodes**: añadí `value: 1/2/3` (incrementando por ítem), `direction: 'ltr'`, `format: ''`, `indent: 0`
7. **Token nodes** (dentro de code blocks): añadí los mismos campos que text nodes
8. **Contenido anidado del Callout** (líneas 239-279): apliqué las mismas correcciones al richText `content.root.children`

## Por qué es importante

El seed corre en `payload.config.ts` `onInit` (idempotente). Si el JSON de Lexical no valida, **ningún post se crea**, aunque usuarios/categorías/tags/series sí se insertan. Esto dejaba la BD en un estado parcial donde el seeder "pasaba" pero la tabla de posts quedaba vacía.

Este bug solo era visible al arrancar con BD limpia. Si alguien creó posts manualmente vía admin UI antes, esos posts tenían el shape correcto (generado por el editor de Payload), pero los del seed no.

## Verificación

```bash
pnpm build
```

✅ Compiló sin errores de tipo.

Para confirmar que los posts se crean:
1. Limpiar BD (o usar BD nueva)
2. Arrancar la app (`pnpm dev`)
3. Revisar logs de consola: debe mostrar `[seed] Post: <título>` x7
4. Verificar en admin UI `/admin/collections/posts` que hay 7 posts publicados

## Lecciones para contextos similares

### No hardcodear JSON de Lexical sin verificar el schema actual

Lexical es un AST vivo. Payload valida contra `SerializedLexicalNode` del paquete `lexical` + extensiones de `@payloadcms/richtext-lexical`. Si el shape cambia entre versiones, el JSON hardcodeado rompe.

**Alternativas a hardcodear JSON:**
1. **Crear posts vía API/admin una vez, exportar el JSON real** (más seguro)
2. **Usar helpers/factories** que generen nodos válidos en vez de literales inline
3. **Validar el JSON generado contra el schema de Payload** antes de commitear

En este caso, hardcodear era aceptable para un seed dev de QA, pero el shape debe mantenerse sincronizado con las dependencias.

### Campos comúnmente olvidados

Al construir nodos Lexical a mano, estos campos son easy-miss:

- `mode` y `detail` en text nodes (la gente suele solo poner `type`, `text`, `version`)
- `format`, `indent` en element nodes (se asumen vacíos pero deben estar presentes)
- `textFormat` en paragraph (específico de ese tipo)
- `value` en listitem (se incrementa por ítem, no es solo un array de hijos)
- Campos extra en link (`rel`, `target`, `title`) — aunque sean `null`, deben existir

Si un nodo valida en el editor pero no en el seed, el diff más probable es un campo faltante, no un tipo wrong.

### Cómo debuggear ValidationErrors de Payload

Payload no siempre muestra qué campo específico está mal en un árbol anidado. El error `Cuerpo > Contenido` apunta a que el problema está en el richText anidado del Callout, pero no dice qué nodo ni qué campo.

**Estrategia de debug:**
1. Crear un post válido vía admin UI
2. `console.log(JSON.stringify(post.body, null, 2))` en el seed o en la query
3. Comparar el shape real vs el hardcodeado
4. Buscar campos presentes en el JSON real pero ausentes en el seed

Alternativamente, agregar más logging en `seedPosts` con try/catch por post individual para aislar cuál falla.

## Referencias

- ADR 0012: pipeline Lexical → React (no cubre seed, pero explica cómo se consume el JSON)
- TOD-58: implementación de converters (asume JSON válido como entrada)
- TOD-60: QA que reportó este bug (verificaron que el seed no corría)
