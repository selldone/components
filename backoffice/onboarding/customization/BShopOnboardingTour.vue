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
              v-track:click="`Onboarding ● Tour ● ${items[index].title} ● Action`"
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

<script>
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

    items: [
      {
        title: "Avocado - Sell Without Adding Any Product",
        description:
          "With Avocado, you can offer services or products without predefined prices or details. Create a custom form for your customers to request services or products. Once they submit their request, you can set the price and process the payment. Share the form on your social media, allowing customers to add items, upload images, and submit orders easily.",
        image: require("./assets/avocado.jpg"),
        action: {
          title: "Read About Avocado",
          href: "https://selldone.com/blog/avocado-social-sell-tool-116",
        },
      },

      {
        title: "Multi-vendor Marketplace & Auto Payout",
        description:
          "Build a thriving marketplace with Selldone by adding multiple vendors. Vendors can list their products, and you can set a commission rate for each sale. When a customer makes a purchase, the vendor receives the payment directly, manages the order through their dedicated panel, and you earn a commission via the auto payout feature.",
        image: require("./assets/marketplace.jpg"),
        action: {
          title: "Auto Vendors Payout",
          href: "https://selldone.com/blog/stripe-connect-payout-marketplace-120",
        },
      },
      {
        title: "Support Complex Business Models",
        description:
          "Selldone supports both simple and complex business models, allowing you to adapt as needed. Configure everything behind the scenes without installing additional plugins or apps, ensuring seamless transitions and operations.",
        image: require("./assets/business-model.jpg"),
      },
      {
        title: "Product Locations Restriction & Gift Shopping",
        description:
          "Set location restrictions for each product by specifying multiple countries, ZIP codes, and cities. This feature is perfect for creating a personalized gift shopping experience or limiting product availability to specific locations, such as for restaurants.",
        image: require("./assets/product-location.jpg"),
      },
    ],

    dialog: false,
    selected_item: false,
  }),

  computed: {},

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
