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
  <!-- ███████████████████████ Dialog Segments ███████████████████████ -->
  <v-bottom-sheet
    :model-value="modelValue"
    max-width="640"
    scrollable
    content-class="rounded-t-xl"
    @update:model-value="(v) => $emit('update:modelValue', v)"
  >
    <v-card rounded="t-xl">
      <v-card-title>
        <b-shop-customer-box :customer="customer"></b-shop-customer-box>
      </v-card-title>

      <v-card-text>
        <div class="my-5">
          <u-widget-header
            icon="join_right"
            title="Customer segments"
          ></u-widget-header>
          <v-list-subheader
            >Start managing your customers smarter by defining segments.
          </v-list-subheader>
          <b-customer-segment-input
            v-model="segments_input"
            :label="$t('global.commons.segments')"
            :shop="shop"
            variant="outlined" class="mt-5"
          ></b-customer-segment-input>
        </div>
      </v-card-text>

      <v-card-actions>
        <div class="widget-buttons">
          <v-btn size="x-large" variant="text" @click="close()">
            <v-icon start>close</v-icon>
            {{ $t("global.actions.close") }}
          </v-btn>

          <v-btn
            :loading="busy_set_segments"
            color="primary"
            size="x-large"
            variant="elevated"
            @click="saveSegments(customer, segments_input)"
          >
            <v-icon start>save</v-icon>
            {{ $t("global.actions.save") }}
          </v-btn>
        </div>
      </v-card-actions>
    </v-card>
  </v-bottom-sheet>
</template>

<script>
import BCustomerSegmentInput from "../../../customer/segment/input/BCustomerSegmentInput.vue";
import BShopCustomerBox from "../../../customer/box/BShopCustomerBox.vue";

export default {
  name: "BCustomerSegmentDialog",
  components: { BShopCustomerBox, BCustomerSegmentInput },

  props: {
    shop: { required: true },
    modelValue: {},
    customer: { required: true },
  },
  data: function () {
    return {
      segments_input: [],
      busy_set_segments: false,
    };
  },

  watch: {
    customer() {
      this.assignValues();
    },
  },
  created() {
    this.assignValues();
  },

  methods: {
    assignValues() {
      this.segments_input =
        this.customer.segments && Array.isArray(this.customer.segments)
          ? this.customer.segments
          : [];
    },

    saveSegments() {
      this.busy_set_segments = true;
      this.busy = true;

      axios
        .put(
          window.API.PUT_SHOP_CUSTOMER_SEGMENTS(this.shop.id, this.customer.id),
          {
            segments: this.segments_input,
          },
        )
        .then(({ data }) => {
          if (!data.error) {
            Object.assign(this.customer, data.customer);
            this.$emit("update", data.customer);
            this.showSuccessAlert(
              data.customer.name,
              "Customer has been updated successfully.",
            );
            this.close();
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_set_segments = false;
        });
    },

    close() {
      this.$emit("update:modelValue", false);
    },
  },
};
</script>

<style scoped></style>
