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
  <u-fade-scroll
    v-bind="$attrs"
    drag-scroll
    show-arrow
    stick-class="min-width-250"
  >
    <div class="d-flex px-3 py-10">
      <v-card
        v-for="(item, i) in items"
        :key="item.title"
        width="250"
        min-width="250"
        min-height="250"
        variant="flat"
        rounded="xl"
        class="me-2"
        @click="select(item, i)"
        v-track:click="`Onboarding ● Tour ● ${item.title}`"
      >
        <v-img :src="item.image" rounded="xl" class="ma-1" height="150"></v-img>

        <v-card-title class="text-subtitle-2 text-wrap">
          {{ item.title }}
        </v-card-title>
      </v-card>
    </div>
  </u-fade-scroll>
  <!-- ███████████████████████ Dialog > Withdraw ███████████████████████ -->
  <v-dialog
    v-model="dialog"
    fullscreen
    scrollable
    transition="dialog-bottom-transition"
  >
    <v-card class="text-start">
      <v-card-text>
        <v-carousel
          v-model="index"
          show-arrows="hover"
          height="100%"
          hide-delimiters
        >
          <v-carousel-item
            v-for="item in items"
            :key="item.title"
            :src="item.image"
            draggable
          >
          </v-carousel-item>
        </v-carousel>

        <v-sheet
          style="
            position: absolute;
            bottom: 88px;
            left: 8px;
            right: 8px;
            backdrop-filter: blur(8px);
          "
          class="pa-3 mx-auto typo-body"
          rounded="sm"
          color="#ffffffdd"
          max-width="800"
          border
        >
          <b class="d-block mb-2"> {{ items[index]?.title }}</b>
          {{ items[index]?.description }}

          <div v-if="items[index].action" class="py-2 text-end">
            <v-btn
              class="tnt"
              size="large"
              append-icon="open_in_new"
              :href="items[index].action.href"
              target="_blank"
              v-track:click="
                `Onboarding ● Tour ● ${items[index].title} ● Action`
              "
            >
              {{ items[index].action.title }}
            </v-btn>
          </div>
        </v-sheet>
      </v-card-text>
      <v-card-actions>
        <div class="widget-buttons">
          <v-btn size="x-large" variant="text" @click="dialog = false">
            <v-icon start>close</v-icon>
            {{ $t("global.actions.close") }}
          </v-btn>
        </div>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import UFadeScroll from "../../../ui/fade-scroll/UFadeScroll.vue";

export default {
  name: "BShopOnboardingTour",
  components: { UFadeScroll },
  props: {
    shop: {
      required: true,
      type: Object,
    },
  },

  data: () => ({
    index: 0,

    dialog: false,
    selected_item: false,
  }),

  computed: {
    items() {
      return [
        {
          title: this.$t("onboarding.customize.tour.avocado.title"),
          description: this.$t("onboarding.customize.tour.avocado.description"),
          image: require("./assets/avocado.jpg"),
          action: {
            title: this.$t("onboarding.customize.tour.avocado.action"),
            href: "https://selldone.com/blog/avocado-social-sell-tool-116",
          },
        },

        {
          title: this.$t("onboarding.customize.tour.marketplace.title"),
          description: this.$t(
            "onboarding.customize.tour.marketplace.description",
          ),
          image: require("./assets/marketplace.jpg"),
          action: {
            title: this.$t("onboarding.customize.tour.marketplace.action"),
            href: "https://selldone.com/blog/stripe-connect-payout-marketplace-120",
          },
        },
        {
          title: this.$t("onboarding.customize.tour.business_model.title"),
          description: this.$t(
            "onboarding.customize.tour.business_model.description",
          ),
          image: require("./assets/business-model.jpg"),
        },
        {
          title: this.$t("onboarding.customize.tour.gift_shopping.title"),
          description: this.$t(
            "onboarding.customize.tour.gift_shopping.description",
          ),
          image: require("./assets/product-location.jpg"),
        },
      ];
    },
  },

  watch: {},

  methods: {
    select(item, index) {
      this.index = index;
      this.selected_item = item;
      this.dialog = true;
    },
  },

  created() {},
};
</script>

<style lang="scss" scoped>
/*
━━━━━━━━━━━━━━━━━━━━ 🎺 Variables ━━━━━━━━━━━━━━━━━━━━
 */

/*
━━━━━━━━━━━━━━━━━━━━ 🪅 Classes ━━━━━━━━━━━━━━━━━━━━
 */
</style>
