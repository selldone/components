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
  <div
    class="s--shop-onboarding"
    :class="{ 's--shop-onboarding--modern text-start': modern }"
  >
    <section
      v-if="modern"
      ref="setup_checklist"
      tabindex="-1"
      class="sd-modern-widget s--shop-onboarding__checklist"
    >
      <header class="sd-modern-header">
        <div class="sd-modern-title">
          <span class="sd-modern-icon sd-modern-icon--plain"
            ><v-icon icon="auto_fix_high" size="20" aria-hidden="true"
          /></span>
          <div>
            <h2 class="sd-modern-title-text">
              {{ $t("admin_shop.dashboard.modern.setup_title") }}
            </h2>
            <p class="sd-modern-subtitle">
              {{
                $t("admin_shop.dashboard.modern.setup_progress", {
                  completed: completed_steps,
                  total: setup_steps.length,
                })
              }}
            </p>
          </div>
        </div>
        <v-btn class="sd-modern-button" variant="text" @click="openSetupTab(7)">
          <v-icon start size="small">play_circle_outline</v-icon>
          {{ $t("admin_shop.dashboard.modern.setup_tutorials") }}
          <v-tooltip
            activator="parent"
            location="top"
            :open-on-focus="true"
            content-class="sd-modern-tooltip text-start"
            >{{ $t("admin_shop.dashboard.modern.setup_tutorials") }}</v-tooltip
          >
        </v-btn>
      </header>
      <v-progress-linear
        :model-value="setup_progress"
        :aria-label="
          $t('admin_shop.dashboard.modern.setup_progress', {
            completed: completed_steps,
            total: setup_steps.length,
          })
        "
        color="primary"
        height="6"
        rounded
        class="s--shop-onboarding__progress"
      />
      <div class="s--shop-onboarding__steps">
        <button
          v-for="(step, index) in setup_steps"
          :key="step.label"
          type="button"
          class="s--shop-onboarding__step text-start"
          :aria-controls="`shop-setup-details-${shop.id}`"
          :aria-expanded="show_step_details && tab === index"
          @click="openSetupTab(index)"
        >
          <span class="s--shop-onboarding__number">{{ index + 1 }}</span>
          <span class="s--shop-onboarding__step-copy">
            <span class="s--shop-onboarding__step-title">{{
              $t(step.label)
            }}</span>
            <span class="s--shop-onboarding__step-status">{{
              $t(
                step.complete
                  ? "global.commons.completed"
                  : next_setup_step === index
                    ? "admin_shop.dashboard.modern.setup_next_step"
                    : "global.commons.pending",
              )
            }}</span>
          </span>
          <v-icon
            :icon="step.complete ? 'check' : 'arrow_forward'"
            :color="step.complete ? 'success' : undefined"
            size="18"
            :class="{ 'flip-rtl': !step.complete }"
            aria-hidden="true"
          />
          <v-tooltip
            activator="parent"
            location="top"
            :open-on-focus="true"
            content-class="sd-modern-tooltip text-start"
            >{{ $t("global.actions.open") }} · {{ $t(step.label) }}</v-tooltip
          >
        </button>
      </div>
      <div class="sd-modern-actions s--shop-onboarding__actions">
        <v-btn
          v-if="next_setup_step >= 0"
          class="sd-modern-button"
          color="primary"
          variant="flat"
          @click="openSetupTab(next_setup_step)"
        >
          {{ $t("global.actions.continue") }} ·
          {{ $t(setup_steps[next_setup_step].label) }}
          <v-icon end size="small" class="flip-rtl">arrow_forward</v-icon>
          <v-tooltip
            activator="parent"
            location="top"
            :open-on-focus="true"
            content-class="sd-modern-tooltip text-start"
            >{{ $t("global.actions.open") }} ·
            {{ $t(setup_steps[next_setup_step].label) }}</v-tooltip
          >
        </v-btn>
        <v-btn
          v-else
          :href="ShopURLs.MainShopUrl(shop)"
          target="_blank"
          rel="noopener"
          class="sd-modern-button"
          color="primary"
          variant="flat"
        >
          {{ $t("onboarding.open_website") }}
          <v-icon end size="small">open_in_new</v-icon>
          <v-tooltip
            activator="parent"
            location="top"
            :open-on-focus="true"
            content-class="sd-modern-tooltip text-start"
            >{{ $t("onboarding.open_website") }}</v-tooltip
          >
        </v-btn>
        <v-btn class="sd-modern-button" variant="text" @click="dismiss()">
          <v-icon start size="small">close</v-icon
          >{{ $t("global.actions.dismiss") }}
          <v-tooltip
            activator="parent"
            location="top"
            :open-on-focus="true"
            content-class="sd-modern-tooltip text-start"
            >{{ $t("global.actions.dismiss") }}</v-tooltip
          >
        </v-btn>
      </div>
    </section>
    <div
      v-show="!modern || show_step_details"
      ref="setup_details"
      :id="modern ? `shop-setup-details-${shop.id}` : undefined"
      :tabindex="modern ? -1 : undefined"
      :class="
        modern
          ? 'sd-modern-widget s--shop-onboarding__details'
          : 'widget-box -x-large mb-5'
      "
    >
      <header v-if="modern" class="sd-modern-header">
        <h2 class="sd-modern-title-text">{{ active_step_title }}</h2>
        <v-btn
          class="sd-modern-icon-button"
          variant="text"
          icon
          :aria-label="$t('global.actions.close')"
          @click="closeSetupDetails()"
        >
          <v-icon icon="close" size="18" />
          <v-tooltip
            activator="parent"
            location="top"
            :open-on-focus="true"
            content-class="sd-modern-tooltip text-start"
            >{{ $t("global.actions.close") }}</v-tooltip
          >
        </v-btn>
      </header>
      <u-widget-header
        v-if="!modern"
        :add-caption="$t('global.actions.dismiss')"
        :title="$t('onboarding.shop.title')"
        add-icon="close"
        icon="tips_and_updates"
        @click:add="dismiss()"
      >
      </u-widget-header>
      <v-list-subheader v-if="!modern">
        {{ $t("onboarding.shop.subtitle") }}
      </v-list-subheader>
      <v-btn
        :href="ShopURLs.MainShopUrl(shop)"
        target="_blank"
        append-icon="open_in_new"
        class="nbt mb-3"
        :class="{ 'sd-modern-button': modern }"
        :variant="modern ? 'text' : undefined"
      >
        <v-avatar class="avatar-gradient -thin -shop ms-n2 me-2" size="24">
          <v-img :src="getShopImagePath(shop.icon, 128)" />
        </v-avatar>
        {{ ShopURLs.MainShopUrl(shop) }}
      </v-btn>
      <v-row>
        <v-col cols="12" lg="3" md="4" sm="5" class="px-0 px-sm-2">
          <v-tabs
            v-model="tab"
            :direction="$vuetify.display.smAndUp ? 'vertical' : 'horizontal'"
            :color="modern ? undefined : '#000'"
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
              <v-icon :color="has_product ? 'success' : undefined" class="me-1">
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

            <v-tab class="justify-start">
              <v-icon class="me-1"> light</v-icon>
              {{ $t("onboarding.overview.title") }}
            </v-tab>
          </v-tabs>
        </v-col>
        <v-col cols="12" lg="9" md="8" sm="7" class="px-0 px-sm-2">
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

            <!-- ------------------------------ Overview ------------------------------ -->
            <v-window-item>
              <u-widget-header
                :title="$t('onboarding.overview.title')"
                icon="light"
              >
              </u-widget-header>
              <v-list-subheader>
                {{ $t("onboarding.overview.subtitle") }}
              </v-list-subheader>

              <u-fade-scroll show-arrow drag-scroll stick-class="v-card">
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
                      <img
                        v-if="shop.icon"
                        :src="getShopImagePath(shop.icon, 128)"
                      />
                      <v-icon v-else>help_outline</v-icon>
                    </v-avatar>

                    <v-card-text class="flex-grow-1">
                      <div class="typo-body mb-2 text-wrap">
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
                        <v-icon class="blink-me" size="x-small" start
                          >lens
                        </v-icon>
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
                        :href="ShopURLs.MainShopUrl(shop)"
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
                      <div class="typo-body mb-2 text-wrap">
                        The ultimate guide to start and make your first sale on
                        your ecommerce.
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
                      class="flex-grow-1"
                      cover
                    />

                    <v-card-text class="flex-grow-1">
                      <div class="typo-body mb-2 text-wrap">
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
            </v-window-item>
          </v-window>
        </v-col>
      </v-row>
    </div>
    <section
      v-if="modern"
      class="sd-modern-widget s--shop-onboarding__migration"
    >
      <header class="sd-modern-header">
        <div class="sd-modern-title">
          <span class="sd-modern-icon sd-modern-icon--plain"
            ><v-icon icon="sync_alt" size="20" aria-hidden="true"
          /></span>
          <div>
            <h2 class="sd-modern-title-text">
              {{ $t("admin_shop.dashboard.modern.setup_migration_title") }}
            </h2>
            <p class="sd-modern-subtitle">
              {{ $t("admin_shop.dashboard.modern.setup_migration_subtitle") }}
            </p>
          </div>
        </div>
      </header>
      <div class="s--shop-onboarding__resources">
        <v-btn class="sd-modern-button" variant="text" @click="openSetupTab(6)">
          <img
            :src="require('./assets/shopify.png')"
            width="22"
            height="22"
            alt=""
            class="me-2"
          />
          {{ $t("global.commons.import") }} · Shopify
          <v-tooltip
            activator="parent"
            location="top"
            :open-on-focus="true"
            content-class="sd-modern-tooltip text-start"
            >{{ $t("onboarding.migration.title") }} · Shopify</v-tooltip
          >
        </v-btn>
        <v-btn class="sd-modern-button" variant="text" @click="openSetupTab(6)">
          <img
            :src="require('./assets/woocommerce.svg')"
            width="22"
            height="22"
            alt=""
            class="me-2"
          />
          {{ $t("global.commons.import") }} · WooCommerce
          <v-tooltip
            activator="parent"
            location="top"
            :open-on-focus="true"
            content-class="sd-modern-tooltip text-start"
            >{{ $t("onboarding.migration.title") }} · WooCommerce</v-tooltip
          >
        </v-btn>
        <v-btn class="sd-modern-button" variant="text" @click="openSetupTab(2)">
          <v-icon start size="small">upload_file</v-icon
          >{{ $t("onboarding.product.step2.import_excel") }}
          <v-tooltip
            activator="parent"
            location="top"
            :open-on-focus="true"
            content-class="sd-modern-tooltip text-start"
            >{{ $t("onboarding.product.step2.import_excel") }}</v-tooltip
          >
        </v-btn>
        <v-btn class="sd-modern-button" variant="text" @click="openSetupTab(7)">
          <v-icon start size="small">play_circle_outline</v-icon
          >{{ $t("admin_shop.dashboard.modern.setup_tutorials") }}
          <v-tooltip
            activator="parent"
            location="top"
            :open-on-focus="true"
            content-class="sd-modern-tooltip text-start"
            >{{ $t("admin_shop.dashboard.modern.setup_tutorials") }}</v-tooltip
          >
        </v-btn>
      </div>
    </section>
  </div>
</template>

<script lang="ts">
import ShopOnboardingProductTab from "../onboarding/tabs/ShopOnboardingProductTab.vue";
import ShopOnboardingShippingTab from "../onboarding/tabs/ShopOnboardingShippingTab.vue";
import ShopOnboardingDomainTab from "../onboarding/tabs/ShopOnboardingDomainTab.vue";
import ShopOnboardingPaymentTab from "../onboarding/tabs/ShopOnboardingPaymentTab.vue";
import SShopOnboardingCustomization from "../onboarding/customization/SShopOnboardingCustomization.vue";
import ShopOnboardingSetupBusinessTab from "../onboarding/tabs/ShopOnboardingSetupBusinessTab.vue";
import ShopOnboardingMigrationTab from "../onboarding/tabs/ShopOnboardingMigrationTab.vue";
import UFadeScroll from "../../ui/fade-scroll/UFadeScroll.vue";
import { ShopURLs } from "@selldone/core-js/helper";

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
    modern: { type: Boolean, default: false },
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
    show_step_details: false,

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
    setup_steps() {
      return [
        {
          label: "onboarding.customize_theme",
          complete:
            !!this.shop.theme && Object.keys(this.shop.theme).length > 0,
        },
        { label: "onboarding.setup_business", complete: !!this.shop.model },
        { label: "onboarding.add_product", complete: this.has_product },
        { label: "onboarding.setup_shipping", complete: !!this.has_warehouse },
        {
          label: "onboarding.add_domain",
          complete: this.domains.some((domain) => domain.enable),
        },
        {
          label: "onboarding.add_payment",
          complete: this.gateways_online.length > 0,
        },
      ];
    },
    completed_steps() {
      return this.setup_steps.filter((step) => step.complete).length;
    },
    setup_progress() {
      return Math.round((100 * this.completed_steps) / this.setup_steps.length);
    },
    next_setup_step() {
      return this.setup_steps.findIndex((step) => !step.complete);
    },
    active_step_title() {
      return this.$t(
        this.tab === 6
          ? "onboarding.migration.title"
          : this.tab === 7
            ? "onboarding.overview.title"
            : this.setup_steps[this.tab]?.label,
      );
    },
    ShopURLs() {
      return ShopURLs;
    },
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

  watch: {},

  methods: {
    openSetupTab(index) {
      this.tab = index;
      this.show_step_details = true;
      this.$nextTick(() => this.$refs.setup_details?.focus());
    },
    closeSetupDetails() {
      this.show_step_details = false;
      this.$nextTick(() => this.$refs.setup_checklist?.focus());
    },
    dismiss() {
      localStorage.setItem(`shop:${this.shop.id}-setup`, "false");
      this.$router.push({ name: "BPageShopDashboard", hash: "" }); // Go to main dashboard page
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

.s--shop-onboarding--modern {
  display: grid;
  gap: 20px;

  .s--shop-onboarding__progress {
    margin-block-end: 12px;
  }
  .s--shop-onboarding__steps {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    column-gap: 25px;
  }
  .s--shop-onboarding__step {
    display: grid;
    grid-template-columns: 28px minmax(0, 1fr) 22px;
    align-items: center;
    gap: 12px;
    min-width: 0;
    min-height: 60px;
    padding: 10px 8px;
    border-block-end: 1px solid var(--sd-modern-border);
  }
  .s--shop-onboarding__step:nth-last-child(-n + 2) {
    border-block-end: 0;
  }
  .s--shop-onboarding__step:focus-visible {
    outline: 2px solid rgb(var(--v-theme-primary));
    outline-offset: 3px;
    border-radius: 7px;
  }
  .s--shop-onboarding__step:hover {
    background: var(--sd-modern-inset);
    border-radius: 8px;
  }
  .s--shop-onboarding__number {
    display: grid;
    place-items: center;
    width: 28px;
    height: 28px;
    background: var(--sd-modern-inset);
    border-radius: 50%;
    color: var(--sd-modern-muted);
    font-size: 12px;
  }
  .s--shop-onboarding__step-copy {
    display: grid;
    gap: 4px;
    min-width: 0;
  }
  .s--shop-onboarding__step-title {
    font-size: 13px;
    font-weight: 500;
  }
  .s--shop-onboarding__step-status {
    color: var(--sd-modern-muted);
    font-size: 11px;
  }
  .s--shop-onboarding__actions {
    margin-block-start: 20px;
    padding-block-start: 20px;
    border-block-start: 1px solid var(--sd-modern-border);
  }
  .s--shop-onboarding__details:focus-visible,
  .s--shop-onboarding__checklist:focus-visible {
    outline: 2px solid rgb(var(--v-theme-primary));
    outline-offset: 3px;
  }
  .s--shop-onboarding__resources {
    display: grid;
    gap: 8px;
    justify-items: start;
  }

  @media (max-width: 600px) {
    .s--shop-onboarding__steps {
      grid-template-columns: minmax(0, 1fr);
    }
    .s--shop-onboarding__step:nth-last-child(2) {
      border-block-end: 1px solid var(--sd-modern-border);
    }
    .s--shop-onboarding__actions > .v-btn {
      width: 100%;
    }
    .s--shop-onboarding__resources > .v-btn {
      max-width: 100%;
    }
  }
}
</style>
