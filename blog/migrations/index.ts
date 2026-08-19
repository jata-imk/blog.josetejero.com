import * as migration_20260702_230412 from './20260702_230412';
import * as migration_20260804_202934_add_media_content_size from './20260804_202934_add_media_content_size';
import * as migration_20260818_223048_comments_parent from './20260818_223048_comments_parent';

export const migrations = [
  {
    up: migration_20260702_230412.up,
    down: migration_20260702_230412.down,
    name: '20260702_230412',
  },
  {
    up: migration_20260804_202934_add_media_content_size.up,
    down: migration_20260804_202934_add_media_content_size.down,
    name: '20260804_202934_add_media_content_size',
  },
  {
    up: migration_20260818_223048_comments_parent.up,
    down: migration_20260818_223048_comments_parent.down,
    name: '20260818_223048_comments_parent'
  },
];
