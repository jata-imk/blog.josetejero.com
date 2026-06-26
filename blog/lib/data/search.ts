import 'server-only'
import type { Post, Series, Category, Tag } from '@/payload-types'
import { getPayload } from './getPayload'

export type SearchScope = 'all' | 'posts' | 'series' | 'tags' | 'categories'

export type SearchResultGroup = {
  posts: Post[]
  series: Series[]
  categories: Category[]
  tags: Tag[]
}

export type SearchCounts = {
  posts: number
  series: number
  categories: number
  tags: number
}

export type SearchResults = {
  groups: SearchResultGroup
  counts: SearchCounts
}

export function normalizeScope(raw?: string | null): SearchScope {
  if (raw === 'posts' || raw === 'series' || raw === 'tags' || raw === 'categories') {
    return raw
  }
  if (raw === 'categorias') return 'categories'
  return 'all'
}

const emptyResults: SearchResults = {
  groups: { posts: [], series: [], categories: [], tags: [] },
  counts: { posts: 0, series: 0, categories: 0, tags: 0 },
}

export async function searchAll(q: string, scope: SearchScope = 'all'): Promise<SearchResults> {
  if (!q || q.trim().length < 2) {
    return emptyResults
  }

  const payload = await getPayload()
  const term = q.trim()

  const [postsResult, seriesResult, categoriesResult, tagsResult] = await Promise.all([
    payload.find({
      collection: 'posts',
      where: {
        and: [
          { status: { equals: 'published' } },
          {
            or: [
              { title: { like: term } },
              { excerpt: { like: term } },
            ],
          },
        ],
      },
      depth: 1,
      limit: 8,
      sort: '-publishedAt',
    }),
    payload.find({
      collection: 'series',
      where: {
        or: [
          { title: { like: term } },
          { description: { like: term } },
        ],
      },
      depth: 1,
      limit: 4,
      sort: 'title',
    }),
    payload.find({
      collection: 'categories',
      where: { name: { like: term } },
      limit: 4,
      sort: 'name',
    }),
    payload.find({
      collection: 'tags',
      where: { name: { like: term } },
      limit: 6,
      sort: 'name',
    }),
  ])

  return {
    groups: {
      posts: (scope === 'all' || scope === 'posts') ? postsResult.docs : [],
      series: (scope === 'all' || scope === 'series') ? seriesResult.docs : [],
      categories: (scope === 'all' || scope === 'categories') ? categoriesResult.docs : [],
      tags: (scope === 'all' || scope === 'tags') ? tagsResult.docs : [],
    },
    counts: {
      posts: postsResult.totalDocs,
      series: seriesResult.totalDocs,
      categories: categoriesResult.totalDocs,
      tags: tagsResult.totalDocs,
    },
  }
}
