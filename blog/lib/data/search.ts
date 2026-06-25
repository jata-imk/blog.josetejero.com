import 'server-only'
import type { Post, Series, Category, Tag } from '@/payload-types'
import { getPayload } from './getPayload'

export type SearchScope = 'all' | 'posts' | 'series' | 'tags' | 'categories'

export type SearchResults = {
  posts: Post[]
  series: Series[]
  categories: Category[]
  tags: Tag[]
}

export async function searchAll(q: string, scope: SearchScope = 'all'): Promise<SearchResults> {
  if (!q || q.trim().length < 2) {
    return { posts: [], series: [], categories: [], tags: [] }
  }

  const payload = await getPayload()
  const term = q.trim()

  const [posts, series, categories, tags] = await Promise.all([
    (scope === 'all' || scope === 'posts')
      ? payload.find({
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
        }).then((r) => r.docs)
      : Promise.resolve([] as Post[]),

    (scope === 'all' || scope === 'series')
      ? payload.find({
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
        }).then((r) => r.docs)
      : Promise.resolve([] as Series[]),

    (scope === 'all' || scope === 'categories')
      ? payload.find({
          collection: 'categories',
          where: { name: { like: term } },
          limit: 4,
          sort: 'name',
        }).then((r) => r.docs)
      : Promise.resolve([] as Category[]),

    (scope === 'all' || scope === 'tags')
      ? payload.find({
          collection: 'tags',
          where: { name: { like: term } },
          limit: 6,
          sort: 'name',
        }).then((r) => r.docs)
      : Promise.resolve([] as Tag[]),
  ])

  return { posts, series, categories, tags }
}
