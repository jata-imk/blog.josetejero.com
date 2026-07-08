import { timingSafeEqual } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

/**
 * Revalidación on-demand del caché ISR (ADR 0031).
 *
 * El build hermético produce una imagen cuyas páginas prerenderizadas
 * (home, listados, sitemap, RSS) nacen vacías. El paso de warm-up del
 * pipeline llama a este endpoint justo después del deploy para regenerar
 * todo con datos reales, en vez de esperar a que expire `revalidate=3600`.
 *
 * Uso: POST con `Authorization: Bearer <REVALIDATE_SECRET>`.
 */
export async function POST(req: NextRequest) {
  const secret = process.env.REVALIDATE_SECRET
  // Sin secret configurado el endpoint queda deshabilitado, nunca abierto.
  if (!secret) {
    return NextResponse.json({ error: 'REVALIDATE_SECRET no configurado' }, { status: 503 })
  }

  const received = Buffer.from(req.headers.get('authorization') ?? '')
  const expected = Buffer.from(`Bearer ${secret}`)
  const authorized = received.length === expected.length && timingSafeEqual(received, expected)
  if (!authorized) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  revalidatePath('/', 'layout')
  revalidatePath('/rss.xml')
  return NextResponse.json({ revalidated: true, now: Date.now() })
}
