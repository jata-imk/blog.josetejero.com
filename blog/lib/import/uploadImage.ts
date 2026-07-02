/**
 * Sube una imagen a la colección Media y devuelve el id del documento creado.
 * Idempotente: si ya existe un archivo con el mismo nombre, devuelve su id sin
 * duplicar (dedupe por filename).
 *
 * Soporta:
 * - Rutas locales (absolutas o relativas al cwd del proceso)
 * - URLs http(s) — las descarga con timeout y límite de tamaño antes de subir.
 *   La URL fuente se guarda en el campo `caption` como atribución.
 */

import type { Payload } from 'payload'
import path from 'path'

const MAX_REMOTE_SIZE = 10 * 1024 * 1024 // 10 MB
const FETCH_TIMEOUT_MS = 15_000

/**
 * Sube una imagen al Media desde una URL http(s).
 * Descarga → buffer → payload.create con `file`.
 * Retorna null si falla o excede el límite de tamaño.
 */
export async function uploadImageFromUrl(
  payload: Payload,
  src: string,
): Promise<number | null> {
  const isUrl = /^https?:\/\//i.test(src)

  if (isUrl) {
    return uploadRemote(payload, src)
  }

  // Ruta local — se asume absoluta o relativa al cwd
  return uploadLocal(payload, src)
}

// ---------------------------------------------------------------------------
// Implementaciones internas
// ---------------------------------------------------------------------------

async function dedupe(payload: Payload, filename: string): Promise<number | null> {
  try {
    const { docs } = await payload.find({
      collection: 'media',
      where: { filename: { equals: filename } },
      limit: 1,
      depth: 0,
    })
    return docs[0]?.id ?? null
  } catch {
    return null
  }
}

async function uploadLocal(payload: Payload, src: string): Promise<number | null> {
  // src puede ser /ruta/desde/raiz-web o ruta absoluta del SO
  const filename = path.basename(src)

  // Dedupe
  const existing = await dedupe(payload, filename)
  if (existing != null) return existing

  let filePath = src
  if (!path.isAbsolute(src)) {
    filePath = path.resolve(process.cwd(), src)
  }

  try {
    const doc = await payload.create({
      collection: 'media',
      data: { alt: filename },
      filePath,
    })
    return doc.id as number
  } catch (err) {
    payload.logger.warn(`[import] No se pudo subir imagen local ${src}: ${String(err)}`)
    return null
  }
}

async function uploadRemote(payload: Payload, url: string): Promise<number | null> {
  const urlObj = new URL(url)
  const filename = path.basename(urlObj.pathname) || 'image'

  // Dedupe
  const existing = await dedupe(payload, filename)
  if (existing != null) return existing

  // Descargar con timeout y límite de tamaño
  let buffer: Buffer
  let mimeType: string
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
    const res = await fetch(url, { signal: controller.signal })
    clearTimeout(timer)

    if (!res.ok) {
      payload.logger.warn(`[import] Error descargando ${url}: HTTP ${res.status}`)
      return null
    }

    // Verificar content-type
    const ct = res.headers.get('content-type') ?? ''
    if (!ct.startsWith('image/')) {
      payload.logger.warn(`[import] ${url} no es imagen (content-type: ${ct})`)
      return null
    }
    mimeType = ct.split(';')[0].trim()

    // Verificar tamaño
    const lengthStr = res.headers.get('content-length')
    if (lengthStr && Number(lengthStr) > MAX_REMOTE_SIZE) {
      payload.logger.warn(`[import] ${url} demasiado grande (${lengthStr} bytes)`)
      return null
    }

    const arrayBuffer = await res.arrayBuffer()
    if (arrayBuffer.byteLength > MAX_REMOTE_SIZE) {
      payload.logger.warn(`[import] ${url} demasiado grande (${arrayBuffer.byteLength} bytes)`)
      return null
    }

    buffer = Buffer.from(arrayBuffer)
  } catch (err) {
    payload.logger.warn(`[import] Error descargando ${url}: ${String(err)}`)
    return null
  }

  // Subir a Media
  try {
    const doc = await payload.create({
      collection: 'media',
      data: {
        alt: filename,
        // caption registra la fuente para atribución
        caption: url,
      },
      file: {
        data: buffer,
        mimetype: mimeType,
        name: filename,
        size: buffer.length,
      },
    })
    return doc.id as number
  } catch (err) {
    payload.logger.warn(`[import] No se pudo subir imagen remota ${url}: ${String(err)}`)
    return null
  }
}
