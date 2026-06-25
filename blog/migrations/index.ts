import * as migration_20260625_213828_featured_field from './20260625_213828_featured_field';

export const migrations = [
  {
    up: migration_20260625_213828_featured_field.up,
    down: migration_20260625_213828_featured_field.down,
    name: '20260625_213828_featured_field'
  },
];
