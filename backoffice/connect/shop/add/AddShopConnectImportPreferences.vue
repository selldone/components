<template>
  <section
    class="b-connect-import-preferences text-start"
    :class="{
      'sd-modern-widget b-connect-import-preferences--standalone': standalone,
    }"
  >
    <header v-if="standalone" class="b-connect-import-preferences__heading">
      <h2>
        <v-icon size="18" aria-hidden="true">download</v-icon
        >{{ $t("shop_connect.settings_flow.import_title") }}
      </h2>
      <p>{{ $t("shop_connect.settings_flow.import_body") }}</p>
    </header>
    <div class="b-connect-import-preferences__body">
      <v-text-field
        v-if="standalone && endpointField"
        v-model="params.endpoint"
        class="sd-modern-underlined-field"
        :readonly="!canWrite"
        :label="endpointField.title"
        :messages="endpointField.hint"
        variant="underlined"
      />
      <u-smart-switch
        :accessible="modern"
        :readonly="!canWrite"
        v-model="params.test"
        :disabled="!connect.enable"
        :false-description="
          $t(
            modern
              ? 'shop_connect.settings_flow.import_all'
              : 'shop_connect.edit.test.false_desc',
          )
        "
        :false-title="$t('shop_connect.edit.test.false_title')"
        :true-description="
          $t(
            modern
              ? 'shop_connect.settings_flow.import_limited'
              : 'shop_connect.edit.test.true_desc',
          )
        "
        :true-title="
          $t(
            modern
              ? 'global.commons.limited'
              : 'shop_connect.edit.test.true_title',
          )
        "
        class="my-3"
        false-icon="all_inclusive"
        :label="modern ? $t('shop_connect.workspace.sync_mode') : 'Sync mode'"
        border
        true-icon="science"
        @change="$forceUpdate()"
      ></u-smart-switch>

      <!-- ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ Cation : Migration ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ -->
      <div
        v-if="mode === 'Migration'"
        class="py-2"
        v-html="$t('shop_connect.edit.migration_tips')"
      ></div>

      <u-smart-switch
        :accessible="modern"
        :readonly="!canWrite"
        v-if="mode === 'Migration'"
        v-model="params.keep_image_urls"
        border
        class="my-5"
        color="primary"
        :false-description="
          modern
            ? $t('shop_connect.workspace.import_images_body')
            : 'Selldone downloads the images, stores them on Selldone storage, and serves them from Selldone CDN.'
        "
        false-icon="cloud_upload"
        :false-title="
          modern
            ? $t('shop_connect.workspace.import_images')
            : 'Import images to Selldone CDN'
        "
        :hint="
          modern
            ? $t('shop_connect.workspace.image_handling_body')
            : 'Choose how Selldone should process product image URLs in this import file.'
        "
        :label="
          modern
            ? $t('shop_connect.workspace.image_handling')
            : 'Image URL handling'
        "
        :true-description="
          modern
            ? $t('shop_connect.workspace.keep_images_body')
            : 'Selldone stores the exact external image URLs in products and galleries without downloading them.'
        "
        true-icon="link"
        :true-title="
          modern
            ? $t('shop_connect.workspace.keep_images')
            : 'Keep original image URLs'
        "
      ></u-smart-switch>

      <u-smart-switch
        :accessible="modern"
        :readonly="!canWrite"
        v-if="connect.read_products"
        v-model="params.import_out_of_stock_products"
        border
        class="my-5"
        color="primary"
        :false-description="
          modern
            ? $t('shop_connect.settings_flow.skip_stock_short')
            : 'Products with zero inventory will be skipped. Existing synced products with zero inventory will be removed when overwrite is enabled.'
        "
        false-icon="inventory_2"
        :false-title="
          modern
            ? $t('shop_connect.workspace.skip_stock')
            : 'Skip out-of-stock products'
        "
        :hint="
          modern
            ? $t('shop_connect.workspace.stock_body')
            : 'Choose whether zero-inventory products should be imported into this shop.'
        "
        :label="
          modern ? $t('shop_connect.workspace.stock') : 'Out-of-stock products'
        "
        :true-description="
          modern
            ? $t('shop_connect.workspace.import_stock_body')
            : 'Products with zero inventory will be imported and kept in your shop as unavailable.'
        "
        true-icon="production_quantity_limits"
        :true-title="
          modern
            ? $t('shop_connect.workspace.import_stock')
            : 'Import out-of-stock products'
        "
      ></u-smart-switch>

      <add-shop-connect-flow
        v-if="modern && shopConnect"
        :side-panel="standalone"
        kind="import"
        :shop="shop"
        :connect="connect"
        :overwrite="overwrite"
        :limited="params.test"
        :import-zero="params.import_out_of_stock_products"
      />

      <v-expand-transition>
        <div v-if="!params.test">
          <u-fade-scroll>
            <div class="my-1 d-flex" dense>
              <v-col v-if="connect?.read_categories" cols="12" sm="6">
                <b-shop-quota-card
                  :quota-key="shopQuota.Category"
                  elevation="0"
                ></b-shop-quota-card>
              </v-col>

              <v-col v-if="connect?.read_products" cols="12" sm="6">
                <b-shop-quota-card
                  :quota-key="shopQuota.Product"
                  elevation="0"
                ></b-shop-quota-card>
              </v-col>

              <v-col v-if="connect?.read_customers" cols="12" sm="6">
                <b-shop-quota-card
                  :quota-key="shopQuota.Customer"
                  elevation="0"
                ></b-shop-quota-card>
              </v-col>
            </div>
          </u-fade-scroll>
        </div>
      </v-expand-transition>
    </div>
  </section>
</template>
<script lang="ts">
import USmartSwitch from "../../../../ui/smart/switch/USmartSwitch.vue";
import AddShopConnectFlow from "./flow/AddShopConnectFlow.vue";
import shopQuota from "@selldone/core-js/enums/shop/quota/ShopQuota.ts";
import BShopQuotaCard from "@selldone/components-vue/backoffice/shop/quota/card/BShopQuotaCard.vue";
import UFadeScroll from "@selldone/components-vue/ui/fade-scroll/UFadeScroll.vue";
export default {
  name: "AddShopConnectImportPreferences",
  components: { USmartSwitch, AddShopConnectFlow, BShopQuotaCard, UFadeScroll },
  props: {
    modern: Boolean,
    standalone: Boolean,
    canWrite: Boolean,
    overwrite: Boolean,
    shop: { type: Object, required: true },
    connect: { type: Object, required: true },
    shopConnect: { type: Object, default: null },
    params: { type: Object, required: true },
    endpointField: { type: Object, default: null },
  },
  data: () => ({ shopQuota }),
  computed: {
    mode() {
      return this.connect.mode;
    },
  },
};
</script>
<style scoped lang="scss">
.b-connect-import-preferences {
  min-width: 0;
  &--standalone {
    margin-block-end: 20px;
  }
  &__heading {
    margin-block-end: 18px;
    h2 {
      display: flex;
      align-items: center;
      gap: 9px;
      margin: 0;
      font-size: 15px;
      font-weight: 600;
      line-height: 22px;
    }
    p {
      margin: 6px 0 0;
      color: var(--sd-modern-muted);
      font-size: 12px;
      line-height: 20px;
    }
  }
  &__body {
    min-width: 0;
  }
  @media (min-width: 1100px) {
    &--standalone .b-connect-import-preferences__body {
      display: grid;
      grid-template-columns: minmax(0, 1.25fr) minmax(0, 1fr);
      column-gap: 32px;
      align-items: start;
      > :not(.b-shop-connect-flow) {
        grid-column: 1;
      }
      > .b-shop-connect-flow {
        grid-column: 2;
        grid-row: 1 / span 6;
      }
    }
  }
}
</style>
