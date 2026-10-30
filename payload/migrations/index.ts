import * as migration_20261026_170128_initial from './20261026_170128_initial';
import * as migration_20261030_160618_product_variants from './20261030_160618_product_variants';

export const migrations = [
  {
    up: migration_20261026_170128_initial.up,
    down: migration_20261026_170128_initial.down,
    name: '20261026_170128_initial',
  },
  {
    up: migration_20261030_160618_product_variants.up,
    down: migration_20261030_160618_product_variants.down,
    name: '20261030_160618_product_variants'
  },
];
