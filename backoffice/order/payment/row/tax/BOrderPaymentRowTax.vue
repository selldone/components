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
  <tr class="text-start">
    <td colspan="4">
      <v-table class="bg-transparent my-5" dense>
        <template v-slot:default>
          <thead>
            <tr>
              <th>Item</th>
              <th>Rate</th>
              <th>Tax</th>
              <th>Mode</th>
              <th class="text-center">Profile</th>

              <th>Detail</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in items" :key="item.name">
              <td>
                <v-avatar class="ma-1 hover-scale" rounded size="24"
                  ><img :src="getProductImage(item.product_id)"
                /></v-avatar>
                <span class="small">{{
                  item.product?.title?.limitWords(8)
                }}</span>
              </td>
              <td>{{ item.tax.tax_rate * 100 }}%</td>

              <td>
                <u-price
                  :amount="item.tax.amount"
                  :currency="item.currency"
                ></u-price>
              </td>

              <td>
                <v-chip
                  :color="item.tax.included ? '#FFC107' : '#8BC34A'"
                  class="mx-2"
                  label
                  size="x-small"
                  >{{ item.tax.included ? "inclusive" : "exclusive" }}
                </v-chip>
              </td>

              <td class="text-center">
                <b-tax-profile-chip
                  v-if="item.tax.profile"
                  :profile-id="item.tax.profile"
                  :shop="shop"
                  class="my-1"
                  dark
                  small
                ></b-tax-profile-chip>
              </td>

              <td>
                <span v-if="item.tax.country" class="small">
                  <flag :iso="item.tax.country" :squared="false" class="me-1" />
                  {{ item.tax.country }}
                </span>

                <span v-if="item.tax.region" class="small">
                  <v-icon class="mx-1" color="#111">{{
                    $t("icons.chevron_next")
                  }}</v-icon>
                  <s-state-flag
                    :country="item.tax.country"
                    :height="14"
                    :region="item.tax.region"
                    class="me-1"
                  />
                  {{ item.tax.region }}
                </span>
              </td>
            </tr>

            <!-- Default (Others) -->
            <tr v-if="others_tax" key="other">
              <td>
                <v-icon class="ma-1" color="#111">shopping_bag</v-icon>
                <small>Other items</small>
              </td>
              <td></td>

              <td>
                <u-price
                  :amount="others_tax"
                  :currency="order.currency"
                ></u-price>
              </td>

              <td>
                <v-chip
                  :color="others_tax.tax_included ? '#FFC107' : '#8BC34A'"
                  class="mx-2"
                  label
                  size="x-small"
                  >{{ others_tax.tax_included ? "inclusive" : "exclusive" }}
                </v-chip>
              </td>

              <td class="text-center">
                <small>default</small>
              </td>

              <td>
                <span v-if="order.billing?.country" class="small">
                  <flag
                    :iso="order.billing.country"
                    :squared="false"
                    class="me-1"
                  />
                  {{ order.billing.country }}
                </span>

                <span v-if="order.billing?.state" class="small">
                  <v-icon class="mx-1" color="#111">{{
                    $t("icons.chevron_next")
                  }}</v-icon>
                  <s-state-flag
                    :country="order.billing.country"
                    :height="14"
                    :region="order.billing.state"
                    class="me-1"
                  />
                  {{ order.billing.state }}
                </span>
              </td>
            </tr>
          </tbody>
        </template>
      </v-table>
    </td>
  </tr>
</template>

<script lang="ts">
import BTaxProfileChip from "../../../../tax/profile/chip/BTaxProfileChip.vue";
import SStateFlag from "@selldone/components-vue/ui/country/state-flag/SStateFlag.vue";

export default {
  name: "BOrderPaymentRowTax",
  components: {
    SStateFlag,
    BTaxProfileChip,
  },

  props: {
    shop: {
      require: true,
      type: Object,
    },
    order: {
      require: true,
      type: Object,
    },
  },
  data: function () {
    return {};
  },
  computed: {
    items() {
      return this.order.items.filter((i) => i.tax?.amount);
    },

    sum_items_tax() {
      let out = 0;
      this.items.forEach((i) => (out += i.tax.amount));
      return out;
    },
    others_tax() {
      return this.order.tax - this.sum_items_tax;
    },
  },
};
</script>

<style scoped></style>
