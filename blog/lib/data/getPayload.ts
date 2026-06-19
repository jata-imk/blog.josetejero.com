import 'server-only'
import { getPayload as getPayloadBase } from 'payload'
import config from '@payload-config'
import type { Payload } from 'payload'

let cached: Payload | null = null

export async function getPayload(): Promise<Payload> {
  if (cached) return cached
  cached = await getPayloadBase({ config })
  return cached
}
