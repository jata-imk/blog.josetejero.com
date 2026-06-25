import { NextRequest, NextResponse } from 'next/server'
import { searchAll, type SearchScope } from '@/lib/data'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const q = searchParams.get('q') ?? ''
  const scope = (searchParams.get('scope') ?? 'all') as SearchScope

  if (!q || q.trim().length < 2) {
    return NextResponse.json({ posts: [], series: [], categories: [], tags: [] })
  }

  const results = await searchAll(q, scope)
  return NextResponse.json(results)
}
