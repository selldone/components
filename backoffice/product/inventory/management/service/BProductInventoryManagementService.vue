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

<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
  <div>
    <!-- ----------------------- Physical------------------------ -->

    <div class="widget-box -large mb-5">
      <s-widget-header :title="$t('global.commons.quantity')" icon="numbers">
      </s-widget-header>
      <v-list-subheader>
        What is the current number of available services? If there isn't a
        specific number for your service at a given moment, feel free to input a
        larger number.
      </v-list-subheader>

      <u-number-input
        v-model="quantity"
        :disabled="add_by_dropShipping"
        :label="$t('product_admin.inventory.variants.count_input')"
        :min="0"
        class="max-width-field mx-auto"
        color="#0288D1"
      >
      </u-number-input>

      <div class="widget-buttons">
        <v-btn
          :loading="busy"
          color="primary"
          size="x-large"
          @click.stop="setDefaultQuantity"
        >
          <v-icon start>save</v-icon>
          {{ $t("product_admin.inventory.variants.count_input_action") }}
        </v-btn>
      </div>
    </div>

    <div v-if="has_booking" class="widget-box -large mb-5">
      <s-widget-header icon="calendar_month" title="Booking Calendar">
      </s-widget-header>

      <v-list-subheader>
        Simply click on the days in the calendar below to mark up to 30 days as
        unavailable.
      </v-list-subheader>
      <u-loading-progress v-if="busy_output"></u-loading-progress>

      <u-calendar-view
        v-model:disabled="outputs.disabled"
        can-disable
        day-level
        @change="updateProductOutput"
      ></u-calendar-view>
    </div>
  </div>
</template>

<script>
import UNumberInput from "../../../../../ui/number/input/UNumberInput.vue";
import UCalendarView from "../../../../../ui/calendar/clendar-view/UCalendarView.vue";
import { ServiceTypes } from "@selldone/core-js/enums/product/ServiceTypes";
import _ from "lodash-es";

export default {
  name: "BProductInventoryManagementService",
  components: {
    UCalendarView,
    UNumberInput,
  },
  props: {
    shop: {
      required: true,
      type: Object,
    },
    product: {
      required: true,
      type: Object,
    },
    forStudio: {
      default: false,
      type: Boolean,
    },
  },
  data() {
    return {
      busy: false,

      quantity: "",

      //--------------------
      outputs: null, // Service: Type and inputs information (Object)
      busy_output: false,
    };
  },

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

    //--------------------

    type() {
      return this.outputs?.type && ServiceTypes[this.outputs.type];
    },
    has_booking() {
      return this.type?.form.includes("booking");
    },
  },

  watch: {},
  created() {
    this.quantity = this.product.quantity;
    this.outputs = Object.assign({}, this.product.outputs);
  },
  methods: {
    //――――――――――――――――――――――― Simple Quantity ―――――――――――――――――――――――

    setDefaultQuantity() {
      this.busy = true;

      axios
        .post(
          window.API.POST_PRODUCT_QUANTITY(
            this.product.shop_id,
            this.product.id,
          ),
          {
            quantity: this.quantity,
          },
        )
        .then((response) => {
          if (!response.data.error) {
            this.showSuccessAlert(
              null,
              this.$t(
                "product_admin.inventory.variants.notifications.save_product_inventory_success",
              ),
            );
            this.product.quantity = response.data.quantity;
            this.$forceUpdate(); // Update vue component!
          } else {
            this.showErrorAlert(null, response.data.error_msg);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy = false;
        });
    },

    updateProductOutput: _.throttle(function () {
      // Debounce: Speed up first load!
      this.busy_output = true;

      axios
        .post(
          this.IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢*/
            ? window.VAPI.POST_MY_VENDOR_PRODUCT_SET_OUTPUTS(
                this.$route.params.vendor_id,
                this.product.id,
              )
            : window.API.POST_PRODUCT_SET_OUTPUTS(
                this.shop.id,
                this.product.id,
              ),
          {
            outputs: this.outputs,
          },
        )
        .then(({ data }) => {
          if (data.error) {
            return this.showErrorAlert(null, data.error_msg);
          }
          this.showSuccessAlert(null, "Two step login inactivated.");

          this.product.outputs = data.outputs;
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_output = false;
        });
    }, 3000),
  },
};
</script>

<style lang="scss" scoped></style>
