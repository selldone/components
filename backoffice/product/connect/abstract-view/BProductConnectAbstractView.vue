<!--
  - Copyright (c) 2024. Selldone® Business OS™
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
  <component
    :is="modern ? 'section' : 's-widget-box'"
    :title="modern ? undefined : `Connect <span class='text-gradient bg-sunny-morning'>OS</span>`"
    :icon="modern ? undefined : 'hub'"
    :class="modern ? 'sd-modern-widget b-product-connect-refined text-start' : undefined"
  >
    <header v-if="modern" class="sd-modern-header"><div class="sd-modern-title"><span class="sd-modern-icon sd-modern-icon--plain"><v-icon>hub</v-icon></span><div><h2 class="sd-modern-title-text">Connect OS</h2><p class="sd-modern-subtitle">{{ $t('b_product_dashboard.identity.connect_subtitle') }}</p></div></div></header>
    <div class="d-flex align-center py-1">
      <router-link
        :to="IS_VENDOR_PANEL ? undefined : { name: 'BPageShopChannelConnect' }"
        :title="modern ? undefined : 'Go to the channels.'"
      >
        <u-avatar-folder
          v-if="connect.icon"
          class="me-2"
          :src="getShopImagePath(connect.icon, 128)"
          side-icon="hub"
          is-green
          :size="modern ? 40 : 64"
          elevated
        >
        </u-avatar-folder>
      </router-link>
      <div class="flex-grow-1">
        <v-row align="center" justify="start" no-gutters>
          <b class="body-title me-1">{{ connect.name }}</b>

          <span v-if="modern && mode_obj" class="sd-modern-tag ms-1" tabindex="0">{{ $t(mode_obj.title) }}<v-tooltip activator="parent" location="top" content-class="sd-modern-tooltip text-start">{{ $t(mode_obj.desc) }}</v-tooltip></span>
          <span v-if="modern && typeof connect.enable === 'boolean'" class="sd-modern-status sd-modern-status--plain ms-2"><i class="sd-modern-status__dot" :class="connect.enable ? 'sd-modern-status__dot--success' : 'sd-modern-status__dot--error'"></i>{{ $t(connect.enable ? 'global.commons.enable' : 'global.commons.disable') }}</span>

          <v-chip
            v-if="!modern && mode_obj"
            class="ms-1 pa-1"
            :color="mode_obj.title.toColor()"
            label
            size="x-small"
            :title="$t(mode_obj.desc)"
          >
            {{ $t(mode_obj.title) }}
          </v-chip>

          <v-chip
            v-if="!modern && connect.enable === true"
            class="ms-1 pa-1"
            color="green"
            label
            size="x-small"
          >
            {{ $t("global.commons.enable") }}
          </v-chip>
          <v-chip
            v-if="!modern && connect.enable === false"
            class="ms-1 pa-1"
            color="red"
            label
            size="x-small"
          >
            {{ $t("global.commons.disable") }}
          </v-chip>

          <v-btn
            v-if="connect.read_products"
            size="x-small"
            :class="modern ? 'sd-modern-button sd-modern-button--small ms-1' : 'ms-1 tnt'"
            prepend-icon="sync"
            :loading="busy_sync"
            :variant="modern ? 'outlined' : 'elevated'"
            :color="modern ? undefined : '#fff'"
            @click="resync"
            >{{ modern ? $t('b_product_dashboard.identity.resync') : 'Re-sync Product' }}
          </v-btn>
        </v-row>
        <div class="small">
          {{ connect.description }}
        </div>
      </div>
    </div>
  </component>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import SWidgetBox from "../../../../ui/widget/box/SWidgetBox.vue";
import UAvatarFolder from "@selldone/components-vue/ui/avatar/folder/UAvatarFolder.vue";
import { Connect } from "@selldone/core-js/models";

import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

export default defineComponent({
  name: "BProductConnectAbstractView",
  mixins: [],
  components: { UAvatarFolder, SWidgetBox },
  inject: ["$shop"],
  props: {
    modern: Boolean,
    product: {
      required: true,
      type: Object,
    },
  },
  data() {
    return {
      busy_sync: false,
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

    connect() {
      return this.product.connect;
    },

    mode_obj() {
      return this.connect && Connect.Modes[this.connect.mode];
    },
  },
  methods: {
    resync() {
      this.busy_sync = true;

      axios
        .post(
          window.API.POST_SHOP_CONNECT_SYNC_PRODUCT(
            this.product.shop_id,
            this.product.id,
          ),
        )
        .then(({ data }) => {
          if (data.error) {
            return NotificationService.showErrorAlert(null, data.error_msg);
          }
          Object.assign(this.product, data.product);
          NotificationService.showSuccessAlert(
            null,
            "Product has been re-synced and updated.",
          );
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_sync = false;
        });
    },
  },
});
</script>

<style lang="scss" scoped>
.b-product-connect-refined.sd-modern-widget {
  padding: 22px;
  border-radius: 15px;
  .sd-modern-header { align-items: flex-start; margin-block-end: 18px; }
  .sd-modern-title { gap: 10px; }
  .sd-modern-title-text { font-size: 16px; font-weight: 500; line-height: 24px; }
  .sd-modern-subtitle { font-size: 12px; line-height: 19px; margin-block-start: 3px; }
  .sd-modern-icon--plain { width: 18px; height: 22px; flex-basis: 18px; :deep(.v-icon) { font-size: 16px; } }
  .body-title { font-size: 14px; font-weight: 500; line-height: 22px; }
  .small { font-size: 12px; line-height: 19px; }
  :deep(.v-row) { gap: 8px 4px; }
}
@media (max-width: 560px) { .b-product-connect-refined.sd-modern-widget { padding: 16px 12px; border-radius: 12px; } }
</style>
