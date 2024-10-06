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
  <s-widget-box
    :title="`Connect <span class='text-gradient bg-sunny-morning'>OS</span>`"
    icon="hub"
  >
    <div class="d-flex align-center py-1">
      <router-link
        :to="IS_VENDOR_PANEL ? undefined : { name: 'BPageShopChannelConnect' }"
        title="Go to the channels."
      >
        <u-avatar-folder
          v-if="connect.icon"
          class="me-2"
          :src="getShopImagePath(connect.icon, 128)"
          side-icon="hub"
          is-green
          size="64"
          elevated
        >
        </u-avatar-folder>
      </router-link>
      <div class="flex-grow-1">
        <v-row align="center" justify="start" no-gutters>
          <b class="body-title me-1">{{ connect.name }}</b>

          <v-chip
            v-if="mode_obj"
            class="ms-1 pa-1"
            :color="mode_obj.title.toColor()"
            label
            size="x-small"
            :title="$t(mode_obj.desc)"
          >
            {{ $t(mode_obj.title) }}
          </v-chip>

          <v-chip
            v-if="connect.enable === true"
            class="ms-1 pa-1"
            color="green"
            label
            size="x-small"
          >
            {{ $t("global.commons.enable") }}
          </v-chip>
          <v-chip
            v-if="connect.enable === false"
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
            class="ms-1 tnt"
            prepend-icon="sync"
            :loading="busy_sync"
            variant="elevated"
            color="#fff"
            @click="resync"
            >Re-sync Product
          </v-btn>
        </v-row>
        <div class="small">
          {{ connect.description }}
        </div>
      </div>
    </div>
  </s-widget-box>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import SWidgetBox from "../../../../ui/widget/box/SWidgetBox.vue";
import UAvatarFolder from "@selldone/components-vue/ui/avatar/folder/UAvatarFolder.vue";
import { Connect } from "@selldone/core-js/models";

export default defineComponent({
  name: "BProductConnectAbstractView",
  components: { UAvatarFolder, SWidgetBox },
  inject: ["$shop"],
  props: {
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
            return this.showErrorAlert(null, data.error_msg);
          }
          Object.assign(this.product, data.product);
          this.showSuccessAlert(
            null,
            "Product has been re-synced and updated.",
          );
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_sync = false;
        });
    },
  },
});
</script>

<style lang="scss" scoped></style>
