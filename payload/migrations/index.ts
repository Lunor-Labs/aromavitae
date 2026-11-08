import * as migration_20261026_170128_initial from './20261026_170128_initial';
import * as migration_20261030_160618_product_variants from './20261030_160618_product_variants';
import * as migration_20261102_160517_contact_details from './20261102_160517_contact_details';
import * as migration_20261106_120000_agarwood_collection from './20261106_120000_agarwood_collection';
import * as migration_20261107_093331_shop_foundations from './20261107_093331_shop_foundations';
import * as migration_20261107_093641_shop_inventory from './20261107_093641_shop_inventory';
import * as migration_20261107_095359_shop_customers from './20261107_095359_shop_customers';
import * as migration_20261107_100007_shop_shipping_zones from './20261107_100007_shop_shipping_zones';
import * as migration_20261107_100853_shop_orders from './20261107_100853_shop_orders';
import * as migration_20261107_110943_shop_email from './20261107_110943_shop_email';
import * as migration_20261107_112000_shop_low_stock_alert from './20261107_112000_shop_low_stock_alert';
import * as migration_20261108_135903_order_items_stock_taken from './20261108_135903_order_items_stock_taken';

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
    name: '20261107_093641_shop_inventory',
  },
  {
    up: migration_20261107_095359_shop_customers.up,
    down: migration_20261107_095359_shop_customers.down,
    name: '20261107_095359_shop_customers',
  },
  {
    up: migration_20261107_100007_shop_shipping_zones.up,
    down: migration_20261107_100007_shop_shipping_zones.down,
    name: '20261107_100007_shop_shipping_zones',
  },
  {
    up: migration_20261107_100853_shop_orders.up,
    down: migration_20261107_100853_shop_orders.down,
    name: '20261107_100853_shop_orders',
  },
  {
    up: migration_20261107_110943_shop_email.up,
    down: migration_20261107_110943_shop_email.down,
    name: '20261107_110943_shop_email',
  },
  {
    up: migration_20261107_112000_shop_low_stock_alert.up,
    down: migration_20261107_112000_shop_low_stock_alert.down,
    name: '20261107_112000_shop_low_stock_alert',
  },
  {
    up: migration_20261108_135903_order_items_stock_taken.up,
    down: migration_20261108_135903_order_items_stock_taken.down,
    name: '20261108_135903_order_items_stock_taken'
  },
];
