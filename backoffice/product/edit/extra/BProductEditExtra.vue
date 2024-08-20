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
  <div class="mt-5">
    <template v-if="product.type === ProductType.PHYSICAL.code">
      <div class="widget-box mb-5">
        <s-widget-header
          :add-caption="!IS_VENDOR_PANEL ? 'Edit units' : undefined"
          :title="$t('add_product.extra_edit.physical.title')"
          :to="{ name: 'BPageShopLogisticWarehouse' }"
          add-icon="straighten"
          add-text
          icon="local_shipping"
        ></s-widget-header>

        <v-list-subheader>
          {{ $t("add_product.extra_edit.physical.sub_title") }}
        </v-list-subheader>
      </div>

      <b-product-extra-input
        v-model:bulk="bulk"
        :class="{ disabled: add_by_dropShipping }"
        :default-lead-time="lead"
        :extra="extra"
        :shop="shop"
        class="mb-5"
        has-bulk-action
        @onLeadChange="
          (value) => {
            lead = value;
          }
        "
      />

      <div class="widget-box mb-5">
        <s-widget-header
          :title="
            $t('add_product.extra_edit.order_limit.title')  +
            (limit_min ? ` | Min: ${limit_min}` : '') +
            (limit_max ? ` | Max: ${limit_max}` : '')
          "
          icon="running_with_errors"
        ></s-widget-header>
        <v-list-subheader
          >

          {{ $t('add_product.extra_edit.order_limit.subtitle') }}


        </v-list-subheader>

        <v-slide-y-reverse-transition leave-absolute>
          <div v-if="!limit_min" class="widget-buttons mt-1">
            <v-btn
              size="x-large"
              variant="flat"
              @click="limit_min = Math.ceil(Math.max(100, limit_max) / 10)"
            >
              <div class="d-flex flex-column align-center">
                <b>{{$t('add_product.extra_edit.order_limit.no_limit') }}</b>
                <small class="mt-1">{{$t('add_product.extra_edit.order_limit.minimum_purchase_quantity') }}</small>
              </div>
            </v-btn>
          </div>

          <u-number-input
            v-else
            v-model="limit_min"
            class="mx-auto mt-5"
            clearable
            flat
            hide-details
            label="Minimum purchase quantity"
            rounded="lg"
            variant="solo"
          ></u-number-input>
        </v-slide-y-reverse-transition>
        <v-slide-y-reverse-transition leave-absolute>
          <div v-if="!limit_max" class="widget-buttons mt-1">
            <v-btn
              size="x-large"
              variant="flat"
              @click="limit_max = Math.max(10, limit_min) * 10"
            >
              <div class="d-flex flex-column align-center">
                <b>{{$t('add_product.extra_edit.order_limit.no_limit') }}</b>
                <small class="mt-1">{{$t('add_product.extra_edit.order_limit.maximum_purchase_quantity') }}</small>
              </div>
            </v-btn>
          </div>
          <u-number-input
            v-else
            v-model="limit_max"
            class="mx-auto mt-5"
            clearable
            flat
            hide-details
            label="Maximum purchase quantity"
            rounded="lg"
            variant="solo"
          ></u-number-input>
        </v-slide-y-reverse-transition>

        <v-expand-transition>
          <div v-if="limit_min > product.quantity">
            <v-alert class="small" color="red" text type="error"
              >Your inventory (<b>{{ product.quantity }}</b
              >) is currently lower than the minimum order limit, so your
              product is unavailable for purchase.
            </v-alert>
          </div>
        </v-expand-transition>
      </div>
    </template>

    <s-widget-buttons auto-fixed-position class="my-5">
      <v-btn
        :loading="busy"
        color="primary"
        size="x-large"
        variant="elevated"
        @click="setExtraInfo()"
      >
        {{ $t("global.actions.save_continue") }}

        <v-icon class="ms-2" size="small">
          {{ $t("icons.arrow_end") }}
        </v-icon>
      </v-btn>
    </s-widget-buttons>
  </div>
</template>

<script>
import BProductExtraInput from "../../extra/input/BProductExtraInput.vue";
import UNumberInput from "../../../../ui/number/input/UNumberInput.vue";
import SWidgetButtons from "../../../../ui/widget/buttons/SWidgetButtons.vue";

export default {
  name: "BProductEditExtra",
  components: { SWidgetButtons, UNumberInput, BProductExtraInput },
  props: {
    shop: {
      required: true,
      type: Object,
    },
    product: {
      required: true,
      type: Object,
    },
  },
  data: () => ({
    busy: false,
    bulk: false,

    limit_min: 0,
    limit_max: 0,

    extra: {},
    lead: null,
  }),

  computed: {
    IS_VENDOR_PANEL() {
      /*🟢 Vendor Panel 🟢*/
      return (
        this.$route.params.vendor_id &&
        this.$route.matched.some((record) => record.meta.vendor)
      );
    },

    add_by_dropShipping() {
      return !!this.product.parent_id;
    },
  },

  watch: {
    product() {
      this.assign();
    },
  },

  created() {
    this.assign();
  },

  methods: {
    assign() {
      this.extra = {};
      if (this.isObject(this.product.extra))
        this.extra = Object.assign({}, this.product.extra);

      this.lead = this.product.lead;

      this.limit_min = this.product.limit_min;
      this.limit_max = this.product.limit_max;
    },

    setExtraInfo() {
      if (this.add_by_dropShipping) {
        this.$emit("next");
        return;
      }

      this.busy = true;

      axios
        .put(
          this.IS_VENDOR_PANEL
            ? window.VAPI.PUT_MY_VENDOR_PRODUCT_EXTRA(
                this.$route.params.vendor_id,
                this.product.id,
              )
            : window.API.PUT_PRODUCT_EXTRA(
                this.product.shop_id,
                this.product.id,
              ),
          {
            extra: {
              weight: this.extra.weight,
              width: this.extra.width,
              length: this.extra.length,
              height: this.extra.height,
            },
            lead: this.lead,

            limit_min: this.limit_min,
            limit_max: this.limit_max,

            bulk: this.bulk, // true: Set same for all variants
          },
        )
        .then(({ data }) => {
          if (!data.error) {
            this.showSuccessAlert(
              this.$t("add_product.extra_edit.notifications.save_title"),
              this.$t("add_product.extra_edit.notifications.save_msg"),
            );

            this.product.extra = data.extra;
            this.product.lead = data.lead;

            this.product.limit_min = data.limit_min;
            this.product.limit_max = data.limit_max;

            this.$emit("next");
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy = false;
        });
    },
  },
};
</script>

<style scoped></style>
