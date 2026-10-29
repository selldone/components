<!--
  - Copyright (c) 2023. Selldone® Business OS™
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
  <v-card
    color="transparent"
    flat
    :class="{ 's--onboarding-products text-start': modern }"
  >
    <div v-if="modern" class="s--onboarding-products__content">
      <p class="s--onboarding-products__intro">
        {{ $t("onboarding.modern.products.intro") }}
      </p>
      <div class="sd-modern-records s--onboarding-products__rows">
        <div class="sd-modern-record s--onboarding-products__row">
          <div>
            <h3>{{ $t("onboarding.modern.products.catalog") }}</h3>
            <p>{{ $t("onboarding.modern.products.catalog_description") }}</p>
          </div>
          <v-btn
            :to="{ name: 'BPageShopProductsList', hash: '#add' }"
            target="_blank"
            rel="noopener noreferrer"
            exact
            class="sd-modern-button sd-modern-button--inline"
            color="primary"
            variant="text"
            >{{ $t("onboarding.modern.products.add") }}<v-icon end size="16">north_east</v-icon></v-btn
          >
        </div>
        <div
          v-if="has_product"
          class="sd-modern-record s--onboarding-products__row"
        >
          <div>
            <h3>{{ $t("onboarding.modern.products.categories") }}</h3>
            <p>{{ $t("onboarding.modern.products.categories_description") }}</p>
          </div>
          <v-btn
            :to="{ name: 'BPageShopProductsList', hash: '#category' }"
            target="_blank"
            rel="noopener noreferrer"
            exact
            class="sd-modern-button sd-modern-button--inline"
            color="primary"
            variant="text"
            >{{ $t("onboarding.modern.products.manage_categories") }}<v-icon end size="16">north_east</v-icon></v-btn
          >
        </div>
        <div class="sd-modern-record s--onboarding-products__row">
          <div>
            <h3>{{ $t("onboarding.modern.products.import") }}</h3>
            <p>{{ $t("onboarding.modern.products.import_description") }}</p>
          </div>
          <v-btn
            :to="{ name: 'BPageShopProductsList' }"
            target="_blank"
            rel="noopener noreferrer"
            class="sd-modern-button sd-modern-button--inline"
            color="primary"
            variant="text"
            >{{ $t("onboarding.modern.products.import_action") }}<v-icon end size="16">north_east</v-icon></v-btn
          >
        </div>
      </div>
      <div class="sd-modern-actions s--onboarding-products__actions">
        <v-btn
          class="sd-modern-button sd-modern-button--inline"
          color="primary"
          variant="text"
          @click="dialog_sample = true"
        >
          <v-icon start size="16">download</v-icon
          >{{ $t("onboarding.modern.products.templates") }}
        </v-btn>
      </div>
    </div>
    <v-card-text v-else>
      <u-widget-header
        :title="$t('onboarding.product.step1.title')"
        icon="looks_one"
      ></u-widget-header>

      <div class="d-flex align-center">
        <p class="typo-body flex-grow-1">
          {{ $t("onboarding.product.step1.msg") }}
        </p>

        <v-img
          :src="require('../assets/add-product-manually.svg')"
          class="m-2 imgi"
        ></v-img>
      </div>
      <div class="widget-buttons">
        <v-btn
          :to="{ name: 'BPageShopProductsList', hash: '#add' }"
          color="#000"
          exact
          size="x-large"
        >
          <v-icon class="me-1" size="small">add_box</v-icon>
          {{
            has_product
              ? $t("onboarding.product.step1.action_off")
              : $t("onboarding.product.step1.action_on")
          }}
        </v-btn>
      </div>

      <template v-if="has_product">
        <p class="typo-body mt-2">
          {{ $t("onboarding.product.step1.category") }}
        </p>
        <div class="widget-buttons">
          <v-btn
            :to="{ name: 'BPageShopProductsList', hash: '#category' }"
            color="#000"
            exact
            size="x-large"
          >
            <v-icon class="me-1" size="small">create_new_folder</v-icon>
            {{ $t("onboarding.product.step1.add_category") }}
          </v-btn>
        </div>
      </template>

      <hr class="my-5" />

      <u-widget-header
        :title="$t('onboarding.product.step2.title')"
        icon="looks_two"
      ></u-widget-header>

      <div class="d-flex align-center">
        <p class="typo-body flex-grow-1">
          {{ $t("onboarding.product.step2.msg") }}
        </p>
        <v-img
          :src="require('../assets/add-product-excel.svg')"
          class="m-2 imgi"
        ></v-img>
      </div>

      <div class="widget-buttons">
        <v-btn
          :to="{ name: 'BPageShopProductsList' }"
          color="#000"
          size="x-large"
        >
          <v-icon class="me-1" size="small">publish</v-icon>
          {{ $t("onboarding.product.step2.import_excel") }}
        </v-btn>
        <v-btn size="x-large" variant="outlined" @click="dialog_sample = true">
          <v-icon class="me-1" size="small">fa:fas fa-file-excel</v-icon>
          {{ $t("onboarding.product.step2.download_template") }}
        </v-btn>
      </div>
    </v-card-text>

    <!-- ------------------------ Dialog > Sample excel ---------------------- -->
    <b-product-importer-sample-dialog
      v-model="dialog_sample"
      :modern="modern"
    ></b-product-importer-sample-dialog>
  </v-card>
</template>

<script lang="ts">
import BProductImporterSampleDialog from "../../product/importer/sample-dialog/BProductImporterSampleDialog.vue";

export default {
  name: "ShopOnboardingProductTab",
  components: { BProductImporterSampleDialog },
  props: {
    modern: { type: Boolean, default: false },
    shop: {
      required: true,
      type: Object,
    },

    timeSeries: {
      required: true,
      type: Object,
    },
  },

  data: () => ({
    dialog_sample: false,
  }),

  computed: {
    last_data() {
      return this.timeSeries.lastDayData();
    },
    total_products_physical() {
      return this.last_data ? this.last_data.total_products_physical : 0;
    },
    total_products_virtual() {
      return this.last_data ? this.last_data.total_products_virtual : 0;
    },
    total_products_file() {
      return this.last_data ? this.last_data.total_products_file : 0;
    },
    total_products_service() {
      return this.last_data ? this.last_data.total_products_service : 0;
    },
    has_product() {
      return (
        this.total_products_physical +
          this.total_products_virtual +
          this.total_products_file +
          this.total_products_service >
        0
      );
    },
  },

  watch: {},

  methods: {},

  created() {},
};
</script>

<style lang="scss" scoped>
.s--onboarding-products {
  font-family: inherit;
  font-size: 13px;
  font-weight: 400;
  line-height: 1.5;
  min-width: 0;

  &__intro {
    margin: 0;
    color: var(--sd-modern-muted);
  }
  &__rows {
    margin-block-start: 18px;
  }
  &__row {
    grid-template-columns: minmax(0, 1fr) auto;
    padding-block: 14px;
    gap: 10px 16px;

    h3 {
      margin: 0;
      font-family: inherit;
      font-size: 13px;
      font-weight: 500;
      line-height: 1.5;
    }
    p {
      margin: 4px 0 0;
      font-size: 12px;
      color: var(--sd-modern-muted);
    }
  }
  &__actions {
    margin-block-start: 16px;
  }
}
@media (max-width: 600px) {
  .s--onboarding-products__row {
    grid-template-columns: minmax(0, 1fr);
    .sd-modern-button {
      justify-self: start;
    }
  }
}
</style>
