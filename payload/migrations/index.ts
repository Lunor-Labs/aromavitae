import * as migration_20261026_170128_initial from './20261026_170128_initial';

export const migrations = [
  {
    up: migration_20261026_170128_initial.up,
    down: migration_20261026_170128_initial.down,
    name: '20261026_170128_initial'
  },
];
