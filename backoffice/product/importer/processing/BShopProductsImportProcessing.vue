<!--
  - Copyright (c) 2023-2024. Selldone® Business OS™
  -
  - Author: M.Pajuhaan
  - Web: https://selldone.com
  - ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  -
  - All rights reserved. In the weave of time, where traditions and innovations intermingle, this content was crafted.
  - From the essence of thought, through the corridors of creativity, each word, and sentiment has been molded.
  - Not just to exist, but to inspire. Like an artist's stroke or a sculptor's chisel, every nuance is deliberate.
  - Our journey is not just about reaching a destination, but about creating a masterpiece.
  - Tread carefully, for you're treading on dreams.
  -->

<template>
  <div
    v-if="importing || images_que"
    class="b-shop-products-import-processing text-start"
    :class="
      modern
        ? 'b-shop-products-import-processing--modern sd-modern-widget'
        : 'widget-box mb-5'
    "
  >
    <div v-if="modern" class="b-shop-products-import-processing__identity">
      <b-shop-products-import-processing-icon
        name="refresh"
        :size="18"
        class="b-shop-products-import-processing__refresh"
      />
      <div class="b-shop-products-import-processing__copy" role="status">
        <p
          class="b-shop-products-import-processing__status sd-modern-status sd-modern-status--plain"
        >
          <span
            class="sd-modern-status__dot sd-modern-status__dot--warning"
            aria-hidden="true"
          />
          {{ $t("product_import_processing.refined_title") }}
        </p>
        <p class="b-shop-products-import-processing__subtitle">
          {{ $t("product_import_processing.refined_subtitle") }}
        </p>
      </div>
    </div>
    <template v-else>
      <p class="font-weight-black mt-2 text-uppercase">
        <i class="fas fa-cog fa-spin me-1"></i>
        {{ $t("product_import_processing.title") }}
      </p>
      <u-loading-progress color="blue" stream></u-loading-progress>

      <v-list-subheader>
        {{ $t("product_import_processing.message") }}
      </v-list-subheader>
    </template>

    <div
      :class="
        modern ? 'b-shop-products-import-processing__queues' : 'widget-buttons'
      "
    >
      <v-btn
        v-if="importing"
        :to="{
          name: IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢*/
            ? 'VendorProductsImportQuePage'
            : 'BPageShopProductsProductsQue',
        }"
        :size="modern ? undefined : 'x-large'"
        :variant="modern ? 'text' : 'flat'"
        :class="{
          'b-shop-products-import-processing__queue sd-modern-button sd-modern-button--inline':
            modern,
        }"
        :aria-label="
          modern
            ? $t('product_import_processing.products_queue') + ': ' + importing
            : undefined
        "
      >
        <template v-if="modern">
          <b-shop-products-import-processing-icon name="package" />
          <span>{{ $t("global.commons.products") }}</span>
          <strong>{{ importing }}</strong>
          <b-shop-products-import-processing-icon
            class="b-shop-products-import-processing__chevron"
            name="chevron-right"
            :size="14"
          />
          <v-tooltip
            activator="parent"
            location="top"
            content-class="sd-modern-tooltip text-start"
            :text="$t('product_import_processing.products_queue')"
            :open-on-focus="true"
          />
        </template>
        <template v-else>
          <v-icon class="me-2">fa:fas fa-box</v-icon>
          <div class="d-flex flex-column">
            <div class="small">
              {{ $t("admin_shop.products.view_que_list") }}
            </div>
            <div>
              {{ $t("global.commons.products") }} | <b>{{ importing }}</b>
            </div>
          </div>
        </template>
      </v-btn>
      <v-btn
        v-if="images_que"
        :to="{
          name: IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢*/
            ? 'VendorProductsImageImportQuePage'
            : 'BPageShopProductsImagesQue',
        }"
        :size="modern ? undefined : 'x-large'"
        :variant="modern ? 'text' : 'flat'"
        :class="{
          'b-shop-products-import-processing__queue sd-modern-button sd-modern-button--inline':
            modern,
        }"
        :aria-label="
          modern
            ? $t('product_import_processing.images_queue') + ': ' + images_que
            : undefined
        "
      >
        <template v-if="modern">
          <b-shop-products-import-processing-icon name="image" />
          <span>{{ $t("global.commons.images") }}</span>
          <strong>{{ images_que }}</strong>
          <b-shop-products-import-processing-icon
            class="b-shop-products-import-processing__chevron"
            name="chevron-right"
            :size="14"
          />
          <v-tooltip
            activator="parent"
            location="top"
            content-class="sd-modern-tooltip text-start"
            :text="$t('product_import_processing.images_queue')"
            :open-on-focus="true"
          />
        </template>
        <template v-else>
          <v-icon class="me-2">fa:fas fa-image</v-icon>
          <div class="d-flex flex-column">
            <div class="small">
              {{ $t("admin_shop.products.view_que_list") }}
            </div>
            <div>
              {{ $t("global.commons.images") }} | <b>{{ images_que }}</b>
            </div>
          </div>
        </template>
      </v-btn>
    </div>

    <template v-if="modern">
      <div
        v-if="$slots.default"
        class="b-shop-products-import-processing__actions"
      >
        <slot />
      </div>
    </template>
    <slot v-else />
  </div>
</template>

<script lang="ts">
import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";
import BShopProductsImportProcessingIcon from "./BShopProductsImportProcessingIcon.vue";

export default {
  name: "BShopProductsImportProcessing",
  components: { BShopProductsImportProcessingIcon },

  props: {
    modern: {
      type: Boolean,
      default: false,
    },
    shop: {
      required: true,
    },
  },
  data: () => ({
    busy: false,
    interval: null,
  }),

  computed: {
    IS_VENDOR_PANEL() {
      /*🟢 Vendor Panel 🟢*/
      return (
        this.$route.params.vendor_id &&
        this.$route.matched.some((record) => record.meta.vendor)
      );
    },

    importing() {
      return this.shop.importing;
    },
    images_que() {
      return this.shop["images-que"];
    },
  },

  mounted() {
    this.fetchImportingInfo();
    this.interval = setInterval(() => {
      this.fetchImportingInfo();
    }, 30 * 1000);
  },
  beforeUnmount() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  },
  methods: {
    fetchImportingInfo() {
      if (this.busy) return;
      this.busy = true;

      (this.IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢*/
        ? window.$vendor.product.importer.info(this.$route.params.vendor_id)
        : window.$backoffice.product.importer.info(this.shop.id)
      )
        .then((data) => {
          this.shop.importing = data.importing;
          this.shop["images-que"] = data["images-que"];

          if (this.interval && !data.importing && !data["images-que"]) {
            // No new importing!
            clearInterval(this.interval);
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy = false;
        });
    },
  },
};
</script>

<style lang="scss" scoped>
.b-shop-products-import-processing--modern {
  display: flex;
  align-items: center;
  gap: 16px;
  width: 100%;
  max-width: none;
  min-height: 64px;
  margin-block-end: 20px;
  padding: 10px 12px;
  padding-inline-start: 16px;
  border-radius: 12px;
  box-shadow: none;
  font-family: inherit;

  .b-shop-products-import-processing__identity {
    display: flex;
    align-items: center;
    gap: 10px;
    flex: 1;
    min-width: 0;
  }

  .b-shop-products-import-processing__refresh {
    color: var(--sd-modern-muted);
  }

  .b-shop-products-import-processing__copy {
    min-width: 0;
  }

  .b-shop-products-import-processing__status {
    display: flex;
    margin: 0;
    font-size: 14px;
    font-weight: 500;
    line-height: 22px;
  }

  .b-shop-products-import-processing__subtitle {
    margin: 0;
    color: var(--sd-modern-muted);
    font-size: 13px;
    font-weight: 400;
    line-height: 20px;
  }

  .b-shop-products-import-processing__queues {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 12px;
    min-width: 0;
  }

  .b-shop-products-import-processing__queue {
    min-width: 0;
    color: rgb(var(--v-theme-on-surface));
    font-family: inherit;
    font-weight: 400;
    line-height: 20px;

    :deep(> .v-btn__content) {
      gap: 6px;
    }

    strong {
      font-weight: 500;
      font-variant-numeric: tabular-nums;
    }
  }

  .b-shop-products-import-processing__actions {
    display: flex;
    flex: 0 0 auto;
    align-items: center;
  }

  &:dir(rtl) .b-shop-products-import-processing__chevron,
  .v-locale--is-rtl & .b-shop-products-import-processing__chevron {
    transform: scaleX(-1);
  }

  @media (max-width: 600px) {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 4px 8px;
    padding: 10px 12px;

    .b-shop-products-import-processing__identity {
      grid-column: 1;
    }

    .b-shop-products-import-processing__queues {
      grid-column: 1;
      grid-row: 2;
      gap: 8px;
    }

    .b-shop-products-import-processing__actions {
      grid-column: 2;
      grid-row: 1 / 3;
    }

    .b-shop-products-import-processing__chevron {
      display: none;
    }
  }
}
</style>
