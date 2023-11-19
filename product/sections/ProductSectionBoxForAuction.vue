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
  <div >
    <!-- ********************* 🞇 Discount inform ********************* -->
    <v-sheet
      v-if="!discount_percent && !window.ExternalWidget"
      class="mx-2 mt-1 p-3 rounded-18px position-relative pp"
      :class="{
        'small-label': vertical,
        'align-self-end': $vuetify.breakpoint.xsOnly,
      }"
      :color="forAuction ? '#333' : 'fff'"
      :dark="forAuction"
      @click.stop="
        forAuction ? delete_from_auction() : put_to_waiting_for_auction()
      "
      :title="
        forAuction
          ? $t('product_info.inform_auction')
          : $t('product_info.waiting_for_auction')
      "
    >
      <progress-loading v-if="busy_track_price"></progress-loading>
      <img
        class="fadeIn float-start me-1"
        src="@components/assets/icons/track-price.svg"
        width="28"
        height="28"
        :class="{ 'img-grayscale': !forAuction }"
      />
      <div class="font-weight-black single-line">
        {{ $t("product_info.track_price") }}
      </div>
      <div class="body-2 single-line">
        {{
          forAuction
            ? $t("product_info.inform_auction")
            : $t("product_info.waiting_for_auction")
        }}
      </div>
    </v-sheet>
  </div>
</template>

<script>
export default {
  name: "ProductSectionBoxForAuction",
  components: {},
  props: {
    shop: {
      required: true,
      type: Object,
    },

    product: {
      required: true,
      type: Object,
    },
    currentVariant: {},

    vertical: {
      type: Boolean,
      default: false,
    },
  },

  data: () => ({
    busy_track_price: false,
  }),

  computed: {

    inform() {
      if (!this.product.informs) return null;
      return this.product.informs.find((item) => {
        return (
            item.variant_id ===
            (this.currentVariant ? this.currentVariant.id : null)
        );
      });
    },

    forAuction() {
      return this.inform ? this.inform.auction : false;
    },

    discount_percent() {
      return this.discountProductPercent(
        this.shop,
        this.product,
        this.currentVariant
      );
    },
  },
  methods: {
    // ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ Inform when auction ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬

    put_to_waiting_for_auction() {
      if (!this.USER()) {
        this.NeedLogin();
        return;
      }
      this.busy_track_price = true;
      axios
        .put(
          window.XAPI.PUT_TO_WAITING_FOR_AUCTION(
            this.shop.name,
            this.product.id
          ),
          {
            variant_id: this.currentVariant ? this.currentVariant.id : null,
          }
        )
        .then(({ data }) => {
          if (!data.error) {
            this.showSuccessAlert(
              this.$t("product_info.notifications.congratulation"),
              this.$t("product_info.notifications.waiting_list_add_success")
            );
            this.product.informs = data.informs;
            this.$forceUpdate();
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_track_price = false;
        });
    },

    delete_from_auction() {
      this.busy_track_price = true;
      axios
        .delete(
          window.XAPI.DELETE_FROM_WAITING_FOR_AUCTION(
            this.shop.name,
            this.product.id
          ),
          {
            params: {
              variant_id: this.currentVariant ? this.currentVariant.id : null,
            },
          }
        )
        .then(({ data }) => {
          if (!data.error) {
            this.showSuccessAlert(
              null,
              this.$t("product_info.notifications.waiting_list_delete_success")
            );
            this.product.informs = data.informs;
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_track_price = false;
        });
    },
  },
};
</script>

<style scoped lang="scss"></style>
