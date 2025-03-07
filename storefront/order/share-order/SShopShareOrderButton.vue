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
  <div>
    <v-btn
      :color="ThemeColorDeepDark"
      :loading="busy_share"
      class="tnt"
      rounded
      @click="showShareDialog"
    >
      <v-icon size="small">share</v-icon>
      {{ $t("share_order.action") }}
    </v-btn>
    <!-- █████████████████████ Dialog > Share █████████████████████ -->

    <v-bottom-sheet
      v-model="show_share"
      content-class="rounded-t-xl"
      max-width="98vw"
      width="820"
    >
      <v-card class="text-start" color="#fafafa" rounded="t-xl">
        <v-card-title class="d-flex align-center">
          <v-icon class="me-2">share</v-icon>
          {{ $t("share_order.title") }}
          <v-spacer></v-spacer>
          <v-chip class="mx-2" color="green" size="small" variant="flat">
            <v-icon start>lock_clock</v-icon>
            {{ $t("global.commons.secure") }}
          </v-chip>
        </v-card-title>

        <v-card-text>
          <p>
            {{ $t("share_order.message") }}
          </p>

          <u-loading-progress v-if="busy_share"></u-loading-progress>

          <u-smart-switch
            v-model="share_address"
            :false-title="$t('share_order.address_excluded')"
            :true-title="$t('share_order.address_included')"
            class="my-5"
            false-icon="local_mall"
            true-icon="local_mall place"
            @change="showShareDialog"
          >
          </u-smart-switch>

          <u-text-copy-box
            border
            :value="wishlist_url"
            class="my-5"
            small-width-mode
          ></u-text-copy-box>

          <v-list-subheader>
            <v-icon class="me-1" color="green" size="small"
              >check_circle
            </v-icon>
            {{ $t("share_order.valid_period") }}
          </v-list-subheader>
        </v-card-text>

        <v-card-actions>
          <div class="widget-buttons">
            <v-btn size="x-large" variant="text" @click="show_share = false">
              <v-icon start>close</v-icon>
              {{ $t("global.actions.close") }}
            </v-btn>
          </div>
        </v-card-actions>
      </v-card>
    </v-bottom-sheet>
  </div>
</template>

<script lang="ts">
import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

import UTextCopyBox from "../../../ui/text/copy-box/UTextCopyBox.vue";
import USmartSwitch from "../../../ui/smart/switch/USmartSwitch.vue";
import TemplateMixin from "@selldone/components-vue/mixin/template/TemplateMixin.ts";
import { ShopURLs } from "@selldone/core-js/helper";


export default {
  name: "SShopShareOrderButton",
  mixins: [TemplateMixin ],

  components: { USmartSwitch, UTextCopyBox },
  inject: ["$shop"],
  props: {
    basket: {
      require: true,
    },
  },
  data: () => ({
    //-------------- Share order -------------
    show_share: false,
    wishlist_url: null,
    share_address: true,
    busy_share: false,
  }),

  methods: {
    // ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Share ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅
    showShareDialog() {
      this.busy_share = true;

      axios
        .post(
          window.XAPI.POST_BASKET_GENERATE_SHARE_LINK(
            this.$shop.name,
            this.basket.id,
          ),
          {
            address: this.share_address,
            code: this.basket.code /*🥶 Guest*/,

            /**
                 This property holds the signature from the URL query parameters.
                 The signature is a cryptographic hash that ensures the integrity and authenticity
                 of the URL, preventing tampering. It's typically generated by shop staff when creating
                 secure, time-limited URLs to display order details.
                 */

            signature: this.$route.query.signature,
            /**
                 This property holds the timestamp from the URL query parameters.
                 The timestamp indicates when the URL was created and is used to ensure the URL's validity
                 within a specific time frame. Like the signature, this is also generated by shop staff
                 when creating secure URLs to display order details.
                 */
            timestamp: this.$route.query.timestamp,
          },
        )
        .then(({ data }) => {
          if (!data.error) {
            this.show_share = true;
            this.wishlist_url =
              ShopURLs.MainShopUrl(this.$shop) +
              "?retrieve=" +
              data.link
                .replace(/[\\/]/g, "_")
                .replace(/[?]/g, "~")
                .replace(/[\\&]/g, "|");
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_share = false;
        });
    },
  },
};
</script>

<style lang="scss" scoped>
/*
━━━━━━━━━━━━━━━━━━━━ 🎺 Variables ━━━━━━━━━━━━━━━━━━━━
 */

/*
━━━━━━━━━━━━━━━━━━━━ 🪅 Classes ━━━━━━━━━━━━━━━━━━━━
 */
.s--shop-share-order-button {
}
</style>
