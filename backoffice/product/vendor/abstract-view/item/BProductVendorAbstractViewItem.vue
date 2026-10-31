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
  <v-expansion-panels
    v-model="expanded"
    class="b--product-vendor-abstract-view"
    :class="{ 'b-product-vendor-refined-item': modern }"
  >
    <v-expansion-panel
      :bg-color="modern ? 'transparent' : expanded === 0 ? '#fff' : 'transparent'"
      elevation="0"
      rounded="xl"
    >
      <v-expansion-panel-title>
        <div class="d-flex align-center py-1">
          <v-avatar
            :class="{ disabled: vendor.enable === false }"
            class="me-2 avatar-gradient -thin -vendor"
            size="36"
          >
            <img v-if="vendor.icon" :src="getShopImagePath(vendor.icon, 128)" />
            <v-icon v-else color="#fff">storefront</v-icon>
          </v-avatar>
          <div class="flex-grow-1">
            <v-row align="center" justify="start" no-gutters>
              <b class="body-title">{{ vendor.name }}</b>
              <span v-if="vendor.country" class="mx-1">
                ●
                <flag :iso="vendor.country" :squared="false" class="mx-1" />
                {{ getCountryName(vendor.country) }}

                <span v-if="vendor.state" class="ms-1">
                  / {{ vendor.state }}</span
                >
              </span>
              <span v-if="modern && ['PENDING', 'REJECTED', 'ACCEPTED'].includes(vendor.status)" class="sd-modern-status sd-modern-status--plain ms-2">
                <i class="sd-modern-status__dot" :class="vendor.status === 'PENDING' ? 'sd-modern-status__dot--warning' : vendor.status === 'REJECTED' ? 'sd-modern-status__dot--error' : 'sd-modern-status__dot--success'"></i>
                {{ $t(`b_product_dashboard.identity.vendor_${vendor.status.toLowerCase()}`) }}
              </span>
              <span v-if="modern && isOwner" class="sd-modern-tag ms-2">{{ $t('global.commons.owner') }}</span>
              <v-chip
                v-if="!modern && vendor.status === 'PENDING'"
                class="mx-2 pa-1"
                color="#F57C00"
                label
                size="x-small"
                title="Pending request to accept by user."
              >
                Pending
              </v-chip>
              <v-chip
                v-if="!modern && vendor.status === 'REJECTED'"
                class="mx-2 pa-1"
                color="red"
                label
                size="x-small"
                title="Rejected request by user."
              >
                Rejected
              </v-chip>
              <v-chip
                v-if="!modern && vendor.status === 'ACCEPTED'"
                class="mx-2 pa-1"
                color="green"
                label
                size="x-small"
                title="Accepted request by user."
              >
                Accepted
              </v-chip>

              <v-chip
                v-if="!modern && isOwner"
                class="mx-2 pa-1"
                color="#673AB7"
                label
                size="x-small"
              >
                Owner
              </v-chip>
            </v-row>

            <div class="lhn mt-1 small">
              {{ vendor.description?.limitWords(10) }}
            </div>
          </div>
        </div>
      </v-expansion-panel-title>
      <v-expansion-panel-text>
        <p v-if="vendor.description?.wordsCount() > 10" class="my-2">
          {{ vendor.description }}
        </p>

        <v-row>
          <v-col cols="12" sm="6">
            <div v-if="vendor.address" class="py-1">
              <v-icon class="me-1" size="small">place</v-icon>
              {{ vendor.address }}
            </div>

            <div v-if="vendor.email" class="py-1">
              <v-icon class="me-1" size="small">email</v-icon>
              {{ vendor.email }}
            </div>

            <div v-if="vendor.tel" class="py-1">
              <v-icon class="me-1" size="small">phone</v-icon>
              {{ vendor.tel }}
            </div>

            <div v-if="vendor.payment_at" class="py-1">
              <v-icon class="me-1" size="small">paid</v-icon>
              <b class="me-1">{{ getFromNowString(vendor.payment_at) }}</b>
              <Small>{{ getLocalTimeString(vendor.payment_at) }}</Small>
            </div>
          </v-col>
          <v-col cols="12" sm="6">
            <v-btn
              v-if="!IS_VENDOR_PANEL"
              :to="{
                name: 'BPageMarketplaceVendors',
                query: { search: vendor.name },
              }"
              :class="modern ? 'sd-modern-button sd-modern-button--small mt-2' : 'nbt mt-2'"
              target="_blank"
              rel="noopener noreferrer"
              :variant="modern ? 'text' : undefined"
              :color="modern ? 'primary' : undefined"
            >
              <v-avatar
                :class="{ disabled: vendor.enable === false }"
                class="me-2 avatar-gradient -thin -vendor"
                size="24"
              >
                <img
                  v-if="vendor.icon"
                  :src="getShopImagePath(vendor.icon, 128)"
                />
                <v-icon v-else color="#fff">storefront</v-icon>
              </v-avatar>

              {{ modern ? $t('b_product_dashboard.identity.vendor_management') : 'Go to vendor management' }}
              <v-icon class="ms-1" size="small">north_east</v-icon>
            </v-btn>
          </v-col>
        </v-row>
      </v-expansion-panel-text>
    </v-expansion-panel>
  </v-expansion-panels>
</template>

<script lang="ts">
import DateMixin from "@selldone/components-vue/mixin/date/DateMixin.ts";

export default {
  name: "BProductVendorAbstractViewItem",
  mixins: [DateMixin],
  components: {},
  props: {
    shop: {
      required: true,
    },

    vendor: {
      required: true,
    },
    isOwner: Boolean,
    modern: Boolean,
  },
  data: () => ({
    expanded: null,
  }),
  computed: {
    IS_VENDOR_PANEL() {
      /*🟢 Vendor Panel 🟢*/
      return (
        this.$route.params.vendor_id &&
        this.$route.matched.some((record) => record.meta.vendor)
      );
    },
  },

  watch: {},

  created() {},

  methods: {},
};
</script>

<style lang="scss" scoped>
.b--product-vendor-abstract-view {
  .v-expansion-panel-title {
    padding-top: 8px;
    padding-bottom: 8px;

    ::v-deep(.v-expansion-panel-title__overlay) {
      background: transparent !important;
    }
  }
}
.b-product-vendor-refined-item {
  font-size: 14px;
  :deep(.v-expansion-panel-title) { padding-inline: 8px; min-height: 56px; text-align: start; }
  :deep(.v-expansion-panel-text__wrapper) { padding: 8px; }
  .body-title { font-size: 14px; font-weight: 500; line-height: 22px; }
  .small { font-size: 12px; line-height: 19px; }
}
</style>
