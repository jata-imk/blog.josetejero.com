import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Categories } from './collections/Categories'
import { Comments } from './collections/Comments'
import { Media } from './collections/Media'
import { Posts } from './collections/Posts'
import { Series } from './collections/Series'
import { Tags } from './collections/Tags'
import { Users } from './collections/Users'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  editor: lexicalEditor(),

  collections: [Users, Posts, Series, Categories, Tags, Comments, Media],

  secret: process.env.PAYLOAD_SECRET || '',

  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
  }),

  sharp,

  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },

  admin: {
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
})
