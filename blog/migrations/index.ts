import * as migration_20260702_230412 from './20260702_230412';

export const migrations = [
  {
    up: migration_20260702_230412.up,
    down: migration_20260702_230412.down,
    name: '20260702_230412'
  },
];
