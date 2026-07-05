/**
 * Regenera los tamaños de imagen de `media` con la config actual de imageSizes
 * (collections/Media.ts). Necesario una sola vez tras corregir `card`/`thumbnail`
 * de retrato (768x1024) a paisaje (960x540 / 480x270, ver ADR/nota de tema oscuro
 * — en realidad esto es un fix de coverImage, no de tema oscuro).
 *
 * Los uploads existentes ya tienen sus archivos -WxH.jpg generados con la config
 * vieja; cambiar Media.ts solo afecta subidas nuevas. Este script:
 *  1. Lee cada doc de `media` vía Local API.
 *  2. Relee el ARCHIVO ORIGINAL desde disco (sin sufijo -WxH) — no un tamaño ya recortado.
 *  3. Reasigna ese buffer como `file` en un `payload.update`, lo que dispara de nuevo
 *     el hook de resize de Payload con los tamaños nuevos.
 *  4. Borra del disco los archivos -WxH.jpg viejos que ya no coincidan con ningún
 *     tamaño de la config actual, para no dejar huérfanos.
 *
 * Ejecutar con: pnpm payload run scripts/regenerate-media-sizes.ts
 * Idempotente: si se corre de nuevo sin cambiar la config, no debería alterar nada
 * (los tamaños generados coincidirán con los que ya existen).
 */
import { getPayload } from 'payload'
import config from '@payload-config'
import fs from 'fs/promises'
import path from 'path'

const payload = await getPayload({ config })

const MEDIA_DIR = path.resolve(process.cwd(), 'media')
const CURRENT_SIZE_NAMES = ['thumbnail', 'card', 'hero'] as const

const { docs } = await payload.find({
  collection: 'media',
  limit: 1000,
  depth: 0,
})

payload.logger.info(`[regenerate-media-sizes] ${docs.length} documentos encontrados`)

for (const doc of docs) {
  const filename = doc.filename
  if (!filename) {
    payload.logger.warn(`[regenerate-media-sizes] doc ${doc.id} sin filename, se omite`)
    continue
  }

  const originalPath = path.join(MEDIA_DIR, filename)

  let buffer: Buffer
  try {
    buffer = await fs.readFile(originalPath)
  } catch {
    payload.logger.warn(`[regenerate-media-sizes] no se encontró el original ${filename}, se omite`)
    continue
  }

  // Nombres de los tamaños viejos que este doc tenía antes de regenerar, para poder
  // borrar los que no vuelvan a generarse con las mismas dimensiones.
  const ext = path.extname(filename)
  const base = filename.slice(0, -ext.length || undefined)
  const oldSizedFiles = (
    await fs.readdir(MEDIA_DIR)
  ).filter((f) => f.startsWith(`${base}-`) && f.endsWith(ext) && f !== filename)

  const updated = await payload.update({
    collection: 'media',
    id: doc.id,
    data: {},
    file: {
      data: buffer,
      mimetype: doc.mimeType ?? 'image/jpeg',
      name: filename,
      size: buffer.length,
    },
  })

  // Tras el update, `updated.sizes` trae los filenames NUEVOS (dimensiones de la config
  // actual). Cualquier archivo viejo que no coincida con estos es huérfano.
  const stillNeeded = new Set(
    CURRENT_SIZE_NAMES.map((name) => {
      const sizeCfg = (updated.sizes as Record<string, { filename?: string | null }> | undefined)?.[name]
      return sizeCfg?.filename
    }).filter(Boolean),
  )

  for (const oldFile of oldSizedFiles) {
    if (!stillNeeded.has(oldFile)) {
      await fs.unlink(path.join(MEDIA_DIR, oldFile)).catch(() => {})
      payload.logger.info(`[regenerate-media-sizes] borrado huérfano ${oldFile}`)
    }
  }

  payload.logger.info(`[regenerate-media-sizes] regenerado ${filename}`)
}

payload.logger.info('[regenerate-media-sizes] listo')
process.exit(0)
