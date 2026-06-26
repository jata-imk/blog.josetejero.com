import { NextRequest, NextResponse } from 'next/server'
import { searchAll, normalizeScope } from '@/lib/data'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const q = searchParams.get('q') ?? ''
  const scope = normalizeScope(searchParams.get('scope'))

  const results = await searchAll(q, scope)
  return NextResponse.json(results)
}
