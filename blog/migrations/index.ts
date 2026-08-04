import * as migration_20260702_230412 from './20260702_230412';
import * as migration_20260804_202934_add_media_content_size from './20260804_202934_add_media_content_size';

export const migrations = [
  {
    up: migration_20260702_230412.up,
    down: migration_20260702_230412.down,
    name: '20260702_230412',
  },
  {
    up: migration_20260804_202934_add_media_content_size.up,
    down: migration_20260804_202934_add_media_content_size.down,
    name: '20260804_202934_add_media_content_size'
  },
];
