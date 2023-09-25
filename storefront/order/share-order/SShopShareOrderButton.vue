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
      rounded dark
      class="tnt"
      @click="showShareDialog"
      :loading="busy_share"
    >
      <v-icon small>share</v-icon>
      {{ $t("share_order.action") }}
    </v-btn>

    <!-- █████████████████████ Dialog > Share █████████████████████ -->

    <v-bottom-sheet
      v-model="show_share"
      max-width="640"
      inset
      class="position-relative"
      dark
    >
      <v-card class="text-start">
        <v-card-title>
          <v-icon class="me-2">share</v-icon>
          {{ $t("share_order.title") }}
          <v-chip color="green" dark label small class="mx-2"
            ><v-icon left small>lock_clock</v-icon>
            {{ $t("global.commons.secure") }}</v-chip
          >
        </v-card-title>

        <v-card-text>
          <p>
            {{ $t('share_order.message') }}
          </p>

          <progress-loading v-if="busy_share"></progress-loading>

          <s-smart-switch
            v-model="share_address"
            true-icon="local_mall place"
            false-icon="local_mall"
            :true-title="$t('share_order.address_included') "
            :false-title="$t('share_order.address_excluded') "
            dark
            @change="showShareDialog"
          >
          </s-smart-switch>

          <s-value-copy-box
            small-width-mode
            :value="wishlist_url"
            class="my-3"
            background-color="#343a40"
            :border="false"
          ></s-value-copy-box>

          <v-subheader>
            <v-icon color="green" class="me-1" small>check_circle</v-icon>
            {{ $t("share_order.valid_period") }}
          </v-subheader>
        </v-card-text>

        <v-card-actions>
          <div class="widget-buttons">
            <v-btn text @click="show_share = false" x-large>
              <v-icon class="me-1">close</v-icon
              >{{ $t("global.actions.close") }}</v-btn
            >
          </div>
        </v-card-actions>
      </v-card>
    </v-bottom-sheet>
  </div>
</template>

<script>
import SValueCopyBox from "@/Components/ui/text/SValueCopyBox.vue";
import SSmartSwitch from "@/Components/smart/SSmartSwitch.vue";
export default {
  name: "SShopShareOrderButton",
  components: {SSmartSwitch, SValueCopyBox},
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
            this.basket.id
          ),
          {
            address: this.share_address,
            code: this.basket.code /*🥶 Guest*/,
          }
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

<style scoped lang="scss">

/*
━━━━━━━━━━━━━━━━━━━━ 🎺 Variables ━━━━━━━━━━━━━━━━━━━━
 */

/*
━━━━━━━━━━━━━━━━━━━━ 🪅 Classes ━━━━━━━━━━━━━━━━━━━━
 */
.s--shop-share-order-button{

}
</style>
