import { NextRequest, NextResponse } from 'next/server'
import { createComment } from '@/lib/data'

/**
 * Alta pública de comentarios (ADR 0032).
 *
 * Cuelga de `/api/comments/create` y no de `/api/comments` a propósito: una ruta estática del grupo
 * `(frontend)` ensombrece al catch-all del REST de Payload, y robarle `/api/comments` rompería el
 * listado de la colección en /admin. Bajo `/create` no hay colisión posible (los ids son enteros).
 *
 * El `create` de la colección está cerrado a usuarios autenticados, así que este es el único camino
 * público: honeypot + rate limit + validación antes de tocar la base.
 */

const NAME_MIN = 2
const NAME_MAX = 80
const EMAIL_MAX = 120
const TEXT_MIN = 3
const TEXT_MAX = 3000

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000
const RATE_LIMIT_MAX = 3

/**
 * Rate limit en memoria del proceso. Se reinicia en cada deploy y no se comparte entre réplicas;
 * para el volumen de un blog personal es suficiente y evita meter Redis solo para esto.
 */
const hits = new Map<string, number[]>()

function clientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return req.headers.get('x-real-ip')?.trim() || 'unknown'
}

function rateLimited(ip: string): boolean {
  const now = Date.now()
  const recent = (hits.get(ip) ?? []).filter((at) => now - at < RATE_LIMIT_WINDOW_MS)

  if (recent.length >= RATE_LIMIT_MAX) {
    hits.set(ip, recent)
    return true
  }

  recent.push(now)
  hits.set(ip, recent)

  // Limpieza oportunista: sin esto el Map crece indefinidamente con IPs que ya no vuelven.
  for (const [key, timestamps] of hits) {
    if (timestamps.every((at) => now - at >= RATE_LIMIT_WINDOW_MS)) hits.delete(key)
  }

  return false
}

function asId(value: unknown): number | null {
  const id = typeof value === 'string' ? Number(value) : value
  return typeof id === 'number' && Number.isInteger(id) && id > 0 ? id : null
}

function asText(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function invalid(message: string) {
  return NextResponse.json({ error: message }, { status: 400 })
}

export async function POST(req: NextRequest) {
  let payload: Record<string, unknown>
  try {
    payload = (await req.json()) as Record<string, unknown>
  } catch {
    return invalid('Petición mal formada.')
  }

  // Honeypot: campo invisible para personas. Si viene relleno respondemos como si todo hubiera ido
  // bien, para no darle al bot la señal de que le hemos detectado.
  if (asText(payload.website)) return NextResponse.json({ ok: true }, { status: 201 })

  const postId = asId(payload.postId)
  const parentId = payload.parentId == null ? null : asId(payload.parentId)
  const name = asText(payload.name)
  const email = asText(payload.email)
  const text = asText(payload.text)

  if (postId === null) return invalid('Post no válido.')
  if (payload.parentId != null && parentId === null) return invalid('Comentario padre no válido.')
  if (name.length < NAME_MIN || name.length > NAME_MAX) {
    return invalid(`El nombre debe tener entre ${NAME_MIN} y ${NAME_MAX} caracteres.`)
  }
  if (email.length > EMAIL_MAX || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return invalid('El email no es válido.')
  }
  if (text.length < TEXT_MIN || text.length > TEXT_MAX) {
    return invalid(`El comentario debe tener entre ${TEXT_MIN} y ${TEXT_MAX} caracteres.`)
  }

  if (rateLimited(clientIp(req))) {
    return NextResponse.json(
      { error: 'Has enviado varios comentarios seguidos. Inténtalo de nuevo en unos minutos.' },
      { status: 429 },
    )
  }

  const result = await createComment({ postId, parentId, name, email, text })

  if (!result.ok) {
    if (result.reason === 'post-not-found') return invalid('El post no admite comentarios.')
    if (result.reason === 'invalid-parent') return invalid('El comentario al que respondes ya no está disponible.')
    return NextResponse.json({ error: 'No se pudo guardar el comentario.' }, { status: 500 })
  }

  return NextResponse.json({ ok: true }, { status: 201 })
}
