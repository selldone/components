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
  <div class="s--shop-onboarding">
    <div class="widget-box -large mb-5">
      <s-widget-header
        :add-caption="$t('global.actions.dismiss')"
        :title="$t('onboarding.shop.title')"
        add-icon="close"
        icon="tips_and_updates"
        @click:add="dismiss()"
      >
      </s-widget-header>
      <v-list-subheader>
        {{ $t("onboarding.shop.subtitle") }}
      </v-list-subheader>

      <v-container>
        <v-row>
          <v-col cols="12" lg="3" md="4" sm="5">
            <v-tabs
              v-model="tab"
              :direction="$vuetify.display.smAndUp ? 'vertical' : 'horizontal'"
              color="#000"
              show-arrows
            >
              <v-tab class="justify-start">
                <v-icon class="me-1"> architecture</v-icon>
                {{ $t("onboarding.customize_theme") }}
              </v-tab>

              <v-tab class="justify-start">
                <v-icon class="me-1"> work_outline</v-icon>
                {{ $t("onboarding.setup_business") }}
              </v-tab>

              <v-tab class="justify-start">
                <v-icon
                  :color="has_product ? 'success' : undefined"
                  class="me-1"
                >
                  {{ has_product ? "task_alt" : "queue" }}
                </v-icon>
                {{ $t("onboarding.add_product") }}
              </v-tab>

              <v-tab class="justify-start">
                <v-icon
                  :color="has_warehouse ? 'success' : undefined"
                  class="me-1"
                >
                  {{ has_warehouse ? "task_alt" : "delivery_dining" }}
                </v-icon>
                {{ $t("onboarding.setup_shipping") }}
              </v-tab>

              <v-tab class="justify-start">
                <v-icon
                  :color="domains.length ? 'success' : undefined"
                  class="me-1"
                >
                  {{ domains.length > 0 ? "task_alt" : "add_link" }}
                </v-icon>
                {{ $t("onboarding.add_domain") }}
              </v-tab>

              <v-tab class="justify-start">
                <v-icon
                  :color="gateways_online.length ? 'success' : undefined"
                  class="me-1"
                >
                  {{ gateways_online.length > 0 ? "task_alt" : "attach_money" }}
                </v-icon>
                {{ $t("onboarding.add_payment") }}
              </v-tab>

              <v-tab class="justify-start">
                <v-icon class="me-1" size="small">sync_alt</v-icon>

                {{ $t("onboarding.migration.title") }}
                <img
                  class="ms-1"
                  height="24"
                  src="./assets/shopify.png"
                  width="24"
                />
                <img
                  class="ms-1"
                  height="24"
                  src="./assets/woocommerce.svg"
                  width="24"
                />
              </v-tab>
            </v-tabs>
          </v-col>
          <v-col cols="12" lg="9" md="8" sm="7">
            <v-window v-model="tab">
              <!-- ------------------------------ customize website ------------------------------ -->
              <v-window-item>
                <s-shop-onboarding-customization
                  :shop="shop"
                  :time-series="timeSeries"
                ></s-shop-onboarding-customization>
              </v-window-item>

              <!-- ------------------------------ Setup Business ------------------------------ -->
              <v-window-item>
                <shop-onboarding-setup-business-tab
                  :shop="shop"
                  :time-series="timeSeries"
                ></shop-onboarding-setup-business-tab>
              </v-window-item>

              <!-- ------------------------------ Add product ------------------------------ -->
              <v-window-item>
                <shop-onboarding-product-tab
                  :shop="shop"
                  :time-series="timeSeries"
                ></shop-onboarding-product-tab>
              </v-window-item>
              <!-- ------------------------------ Add shipping ------------------------------ -->
              <v-window-item>
                <shop-onboarding-shipping-tab
                  :shop="shop"
                  :time-series="timeSeries"
                ></shop-onboarding-shipping-tab>
              </v-window-item>

              <!-- ------------------------------ Add domain ------------------------------ -->
              <v-window-item>
                <shop-onboarding-domain-tab
                  :shop="shop"
                  :time-series="timeSeries"
                ></shop-onboarding-domain-tab>
              </v-window-item>

              <!-- ------------------------------ Payment ------------------------------ -->
              <v-window-item>
                <shop-onboarding-payment-tab
                  :shop="shop"
                  :time-series="timeSeries"
                ></shop-onboarding-payment-tab>
              </v-window-item>

              <!-- ------------------------------ Migration ------------------------------ -->
              <v-window-item>
                <shop-onboarding-migration-tab
                  :shop="shop"
                  :time-series="timeSeries"
                ></shop-onboarding-migration-tab>
              </v-window-item>
            </v-window>
          </v-col>
        </v-row>
      </v-container>

      <!-- ------------------------------- Intro dialog ---------------------------------- -->
      <v-dialog
        v-model="intro_dialog"
        max-width="600"
        scrollable
        transition="scroll-y-transition"
      >
        <v-card>
          <v-card-title></v-card-title>

          <v-img
            :src="
              require('../onboarding/assets/help-button.jpg')
            "
            class="mb-3"
            eager
            height="300px"
            width="100%"
          ></v-img>

          <v-card-text class="text-start typo-body">
            {{ $t("onboarding.intro_inline_help_message") }}
          </v-card-text>

          <v-card-actions>
            <div class="widget-buttons">
              <v-btn
                size="x-large"
                variant="text"
                @click="intro_dialog = false"
              >
                <v-icon class="me-1">check</v-icon>
                {{ $t("global.actions.close") }}
              </v-btn>
            </div>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>

    <div class="widget-box -large mb-5" style="--background: #fff">
      <s-widget-header
        :title="$t('onboarding.overview.title')"
        icon="storefront"
      >
      </s-widget-header>
      <v-list-subheader>
        {{ $t("onboarding.overview.subtitle") }}
      </v-list-subheader>

      <u-fade-scroll show-arrow stick-class="v-card">
        <div class="d-flex align-stretch text-center">
          <v-card
            class="ma-2 border d-flex flex-column"
            elevation="0"
            max-width="220"
            min-width="220"
            rounded="xl"
            width="220"
          >
            <v-avatar
              class="my-3 mx-auto avatar-gradient -thin -shop"
              size="64"
            >
              <img v-if="shop.icon" :src="getShopImagePath(shop.icon, 128)" />
              <v-icon v-else>help_outline</v-icon>
            </v-avatar>

            <v-card-text class="flex-grow-1">
              <div class="typo-body mb-2">
                {{ shop.title }}
              </div>
              <v-chip
                v-if="shop.active"
                :to="{ name: 'BPageShopSettingInfo' }"
                class="ms-2 text-lowercase"
                color="primary"
                label
                size="small"
              >
                <v-icon class="blink-me" size="x-small" start>lens</v-icon>
                {{ $t("global.commons.livemode") }}
              </v-chip>
              <v-chip
                v-else
                :to="{ name: 'BPageShopSettingInfo' }"
                class="ms-2 text-lowercase"
                color="#E64A19"
                label
                size="small"
              >
                <v-icon size="x-small" start>pause</v-icon>
                {{ $t("global.commons.paused") }}
              </v-chip>
            </v-card-text>

            <div class="widget-buttons flex-grow-0 w-100">
              <v-btn
                :href="getShopMainUrl(shop)"
                color="#000"
                size="large"
                target="_blank"
                variant="flat"
              >
                <v-icon class="me-1" size="small">open_in_new</v-icon>

                {{ $t("onboarding.open_website") }}
              </v-btn>
            </div>
          </v-card>

          <v-card
            class="ma-2 border d-flex flex-column"
            elevation="0"
            max-width="220"
            min-width="220"
            rounded="xl"
            width="220"
          >
            <img
              class="my-3 mx-auto"
              height="64"
              src="../../assets/icons/pdf.svg"
              width="64"
            />

            <v-card-text class="flex-grow-1">
              <div class="typo-body mb-2">
                The ultimate guide to start and make your first sale on your
                ecommerce.
              </div>
            </v-card-text>

            <div class="widget-buttons flex-grow-0 w-100">
              <v-btn
                color="#000"
                href="https://selldone.com/gapi/books/Do-Your-Business-Like-A-Game.pdf"
                size="large"
                target="_blank"
                variant="flat"
              >
                <v-icon class="me-1" size="small">download</v-icon>

                {{ $t("global.actions.download_now") }}
              </v-btn>
            </div>
          </v-card>
          <v-card
            v-for="item in contents"
            :key="item.title"
            class="ma-2 border d-flex flex-column"
            elevation="0"
            max-width="220"
            min-width="220"
            rounded="xl"
            width="220"
          >
            <v-img
              :src="item.image"
              aspect-ratio="2"
              class="  flex-grow-1" cover
            />

            <v-card-text class="flex-grow-1">
              <div class="typo-body mb-2">
                {{ item.title }}
              </div>
            </v-card-text>

            <div class="widget-buttons flex-grow-0 w-100">
              <v-btn
                :href="item.video"
                color="#d22600"
                size="large"
                target="_blank"
                variant="flat"
              >
                <v-icon class="me-1" size="small">smart_display</v-icon>
                {{ $t("global.actions.watch_now") }}
              </v-btn>
            </div>
          </v-card>
        </div>
      </u-fade-scroll>
    </div>
  </div>
</template>

<script>
import ShopOnboardingProductTab from "../onboarding/tabs/ShopOnboardingProductTab.vue";
import ShopOnboardingShippingTab from "../onboarding/tabs/ShopOnboardingShippingTab.vue";
import ShopOnboardingDomainTab from "../onboarding/tabs/ShopOnboardingDomainTab.vue";
import ShopOnboardingPaymentTab from "../onboarding/tabs/ShopOnboardingPaymentTab.vue";
import SShopOnboardingCustomization from "../onboarding/customization/SShopOnboardingCustomization.vue";
import ShopOnboardingSetupBusinessTab from "../onboarding/tabs/ShopOnboardingSetupBusinessTab.vue";
import ShopOnboardingMigrationTab from "../onboarding/tabs/ShopOnboardingMigrationTab.vue";
import UFadeScroll from "../../ui/fade-scroll/UFadeScroll.vue";
import _ from "lodash-es";

export default {
  name: "SShopOnboarding",
  components: {
    UFadeScroll,
    ShopOnboardingMigrationTab,
    ShopOnboardingSetupBusinessTab,
    SShopOnboardingCustomization,
    ShopOnboardingPaymentTab,
    ShopOnboardingDomainTab,
    ShopOnboardingShippingTab,
    ShopOnboardingProductTab,
  },
  props: {
    shop: {
      required: true,
      type: Object,
    },

    timeSeries: {
      required: true,
      type: Object,
    },
  },

  data: () => ({
    tab: 0,

    intro_dialog: false,
    contents: [
      {
        title: "20 Min 😄 | Work with Selldone",
        image: require("../onboarding/assets/20min-full-vedo-cover.jpg"),
        video: "https://youtu.be/mlw4KxlVFCc",
      },

      {
        title: "Why No-plugin Platform = Business OS!?",
        image: require("../onboarding/assets/video-3j85CI2kRmY.jpg"),
        video: "https://youtu.be/3j85CI2kRmY",
      },

      {
        title: "What is Selldone and How does it work?",
        image: require("../onboarding/assets/video-XpojjG8cbFk.jpg"),
        video: "https://youtu.be/XpojjG8cbFk",
      },
      {
        title: "Selldone Fast Overview",
        image: require("../../assets/guides/video-full-review.jpg"),
        video: "https://youtu.be/8iWXswJxQ7Q",
      },

      {
        title: "Google Merchant Center",
        image: require("../onboarding/assets/video-JIESHSJPdKM.jpg"),
        video: "https://youtu.be/JIESHSJPdKM",
      },
      {
        title: "Printful Online Store in 60sec",
        image: require("../onboarding/assets/video-CqgZG3Vkf64.jpg"),
        video: "https://youtu.be/CqgZG3Vkf64",
      },
      {
        title: "Printify Online Store in 60sec",
        image: require("../onboarding/assets/video-Gj5svwRfo1A.jpg"),
        video: "https://youtu.be/Gj5svwRfo1A",
      },
    ],
  }),

  computed: {
    last_data() {
      return this.timeSeries.lastDayData();
    },
    total_products_physical() {
      return this.last_data ? this.last_data.total_products_physical : 0;
    },
    total_products_virtual() {
      return this.last_data ? this.last_data.total_products_virtual : 0;
    },
    total_products_file() {
      return this.last_data ? this.last_data.total_products_file : 0;
    },
    total_products_service() {
      return this.last_data ? this.last_data.total_products_service : 0;
    },
    has_product() {
      return (
        this.total_products_physical +
          this.total_products_virtual +
          this.total_products_file +
          this.total_products_service >
        0
      );
    },

    domains() {
      return this.shop.domains ? this.shop.domains : [];
    },
    shop_gateways() {
      return this.shop.shop_gateways;
    },
    gateways_cod() {
      return this.shop.shop_gateways.filter((i) => i.gateway.cod);
    },
    gateways_cash() {
      return this.shop.shop_gateways.filter((i) => i.gateway.cash);
    },

    gateways_dir() {
      return this.shop.shop_gateways.filter((i) => i.gateway.dir);
    },
    gateways_online() {
      return this.shop.shop_gateways.filter(
        (i) => !i.gateway.cod && !i.gateway.cash && !i.gateway.dir,
      );
    },

    warehouse() {
      return this.shop.warehouse;
    },
    has_warehouse() {
      return this.warehouse && this.warehouse.location;
    },
  },

  watch: {
    intro_dialog(val) {
      if (!val) localStorage.setItem("intro", "true");
    },
  },

  methods: {
    dismiss() {
      localStorage.setItem(`shop:${this.shop.id}-setup`, "false");
      this.$router.push({ name: "BPageShopDashboard", hash: "" }); // Go to main dashboard page
    },
  },

  created() {
    if (localStorage.getItem("intro") !== "true")
      _.delay(() => {
        this.intro_dialog = true;
      }, 5000);
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
.s--shop-onboarding {
  text-align: start;

  ::v-deep(.imgi) {
    flex-grow: 0;
    width: 96px;
    height: 96px;
    @media only screen and (max-width: 600px) {
      width: 48px !important;
      height: 48px !important;
    }
  }
}
</style>
