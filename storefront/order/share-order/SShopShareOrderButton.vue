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
      :color="SaminColorDarkDeep"
      :loading="busy_share"
      class="tnt"
      dark
      rounded
      @click="showShareDialog"
    >
      <v-icon size="small">share</v-icon>
      {{ $t("share_order.action") }}
    </v-btn>

    <!-- █████████████████████ Dialog > Share █████████████████████ -->

    <v-bottom-sheet
      v-model="show_share"
      class="position-relative"
      dark
      inset
      max-width="640"
    >
      <v-card class="text-start">
        <v-card-title>
          <v-icon class="me-2">share</v-icon>
          {{ $t("share_order.title") }}
          <v-chip class="mx-2" color="green" dark label size="small">
            <v-icon size="small" start>lock_clock</v-icon>
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
            dark
            false-icon="local_mall"
            true-icon="local_mall place"
            @change="showShareDialog"
          >
          </u-smart-switch>

          <s-value-copy-box
            :border="false"
            :value="wishlist_url"
            background-color="#343a40"
            class="my-3"
            small-width-mode
          ></s-value-copy-box>

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
              <v-icon start>close </v-icon>
              {{ $t("global.actions.close") }}
            </v-btn>
          </div>
        </v-card-actions>
      </v-card>
    </v-bottom-sheet>
  </div>
</template>

<script>
import SValueCopyBox from "@components/ui/text/SValueCopyBox.vue";
import USmartSwitch from "@components/ui/smart/switch/USmartSwitch.vue";

export default {
  name: "SShopShareOrderButton",
  components: { USmartSwitch, SValueCopyBox },
  props: {
    shop: {
      require: true,
    },
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
            this.shop_name,
            this.basket.id,
          ),
          {
            address: this.share_address,
            code: this.basket.code /*🥶 Guest*/,
          },
        )
        .then(({ data }) => {
          if (!data.error) {
            this.show_share = true;
            this.wishlist_url =
              this.getShopMainUrl(this.shop) +
              "?retrieve=" +
              data.link
                .replace(/[\\/]/g, "_")
                .replace(/[?]/g, "~")
                .replace(/[\\&]/g, "|");
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
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
