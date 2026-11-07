import * as migration_20261026_170128_initial from './20261026_170128_initial';
import * as migration_20261030_160618_product_variants from './20261030_160618_product_variants';
import * as migration_20261102_160517_contact_details from './20261102_160517_contact_details';
import * as migration_20261106_120000_agarwood_collection from './20261106_120000_agarwood_collection';
import * as migration_20261107_093331_shop_foundations from './20261107_093331_shop_foundations';
import * as migration_20261107_093641_shop_inventory from './20261107_093641_shop_inventory';

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
    name: '20261102_160517_contact_details',
  },
  {
    up: migration_20261106_120000_agarwood_collection.up,
    down: migration_20261106_120000_agarwood_collection.down,
    name: '20261106_120000_agarwood_collection',
  },
  {
    up: migration_20261107_093331_shop_foundations.up,
    down: migration_20261107_093331_shop_foundations.down,
    name: '20261107_093331_shop_foundations',
  },
  {
    up: migration_20261107_093641_shop_inventory.up,
    down: migration_20261107_093641_shop_inventory.down,
    name: '20261107_093641_shop_inventory'
  },
];
