import * as migration_20261026_170128_initial from './20261026_170128_initial';
import * as migration_20261030_160618_product_variants from './20261030_160618_product_variants';
import * as migration_20261102_160517_contact_details from './20261102_160517_contact_details';

export const migrations = [
  {
    up: migration_20261026_170128_initial.up,
    down: migration_20261026_170128_initial.down,
    name: '20261026_170128_initial',
  },
  {
    up: migration_20261030_160618_product_variants.up,
    down: migration_20261030_160618_product_variants.down,
    name: '20261030_160618_product_variants',
  },
  {
    up: migration_20261102_160517_contact_details.up,
    down: migration_20261102_160517_contact_details.down,
    name: '20261102_160517_contact_details'
  },
];
