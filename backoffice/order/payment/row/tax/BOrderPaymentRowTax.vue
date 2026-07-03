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
            <tr v-for="item in items" :key="item.id">
              <td>
                <v-avatar class="ma-1 hover-scale" rounded size="24"
                  ><img :src="getProductImage(item.product_id)"
                /></v-avatar>
                <span class="small">{{
                  item.product?.title?.limitWords(8)
                }}</span>
              </td>
              <td>
                <span v-if="hasTaxRate(item)">
                  {{ numeralFormat(item.tax.tax_rate * 100, "0,0.[000]") }}%
                </span>
                <span v-else>-</span>
              </td>

              <td>
                <u-price
                  :amount="taxAmount(item)"
                  :currency="item.currency"
                ></u-price>
              </td>

              <td>
                <v-chip
                  :color="item.tax.error ? 'red' : item.tax.included ? '#95771b' : '#4e7125'"
                  class="mx-2 font-weight-bold"
                  label
                  size="x-small"
                  variant="tonal"
                  >{{ item.tax.error ? "Error" : item.tax.included ? "Inclusive" : "Exclusive" }}
                </v-chip>
              </td>

              <td class="text-center">
                <b-tax-profile-chip
                  v-if="item.tax.profile"
                  :profile-id="item.tax.profile"
                  :shop="shop"
                  class="my-1"
                  dark
                  size="x-small"
                ></b-tax-profile-chip>
                <small v-else>{{
                  item.tax.profile_title?.limitWords(3) || "default"
                }}</small>

                <v-chip
                  v-if="externalProviderLabel(item)"
                  class="ms-1"
                  color="indigo"
                  size="x-small"
                  variant="flat"
                >
                  {{ externalProviderLabel(item) }}
                </v-chip>

                <div
                  v-if="taxAdminMessage(item)"
                  class="tax-admin-message"
                  :class="{ 'text-danger': item.tax.error }"
                >
                  <v-icon
                    :color="item.tax.error ? 'red' : '#b26a00'"
                    class="me-1"
                    size="x-small"
                  >
                    {{ item.tax.error ? "warning" : "info" }}
                  </v-icon>
                  {{ taxAdminMessage(item) }}
                </div>
              </td>

              <td>
                <div v-if="item.tax.error_msg" class="small text-danger">
                  <v-icon color="red" size="x-small">warning</v-icon>
                  {{ item.tax.error_msg }}
                </div>

                <template v-else>
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

                  <div v-if="item.tax.tax_collecting_status" class="small text-muted mt-1">
                    Collection:
                    <b>{{ humanizeTaxStatus(item.tax.tax_collecting_status) }}</b>
                  </div>
                </template>
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
                  :color="order.tax_included ?  '#95771b' : '#4e7125'"
                  class="mx-2 font-weight-bold"
                  size="x-small"
                  label
                  variant="tonal"
                  >{{ order.tax_included ? "Inclusive" : "Exclusive" }}
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
      return this.order.items.filter(
        (i) =>
          i.tax &&
          (i.tax.amount !== undefined ||
            i.tax.shipping !== undefined ||
            i.tax.error),
      );
    },

    sum_items_tax() {
      let out = 0;
      this.items.forEach((i) => (out += this.taxAmount(i)));
      return out;
    },
    others_tax() {
      const out = Number(this.order.tax || 0) - this.sum_items_tax;
      return out > 0.000001 ? out : 0;
    },
  },
  methods: {
    taxAmount(item) {
      const amount = Number(item.tax?.amount);
      return Number.isFinite(amount) ? amount : 0;
    },

    hasTaxRate(item) {
      const rate = Number(item.tax?.tax_rate);
      return Number.isFinite(rate);
    },

    externalProviderLabel(item) {
      const tax = item.tax;
      if (!tax) return null;

      const provider = tax.provider || tax.provider_title;
      if (!provider && tax.source !== "external") return null;
      if (!provider) return "External";

      const normalized = String(provider).toLowerCase();
      if (normalized === "stripe_tax" || normalized === "stripe") {
        return "Stripe Tax";
      }

      return String(provider)
        .replace(/[_-]+/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());
    },

    humanizeTaxStatus(status) {
      return String(status || "")
        .replace(/[_-]+/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());
    },

    taxAdminMessage(item) {
      if (!item.tax) return null;
      if (item.tax.error_msg) return item.tax.error_msg;

      if (item.tax.tax_collecting_enable === false) {
        return item.tax.provider === "stripe_tax"
          ? "Stripe Tax is not collecting tax for this item."
          : "The external tax service is not collecting tax for this item.";
      }

      return null;
    },
  },
};
</script>

<style scoped>
.tax-admin-message {
  margin: 3px auto 0;
  font-size: 0.68rem;
  line-height: 1.25;
  overflow-wrap: anywhere;
  text-align: center;
}
</style>
