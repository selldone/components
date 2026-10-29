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
      class="sd-modern-widget s--shop-onboarding__workspace"
    >
      <header class="s--shop-onboarding__intro">
        <div>
          <p class="sd-modern-eyebrow">{{ $t("onboarding.modern.eyebrow") }}</p>
          <h2>{{ $t("onboarding.modern.title") }}</h2>
          <p class="s--shop-onboarding__subtitle">
            {{ $t("onboarding.modern.subtitle") }}
          </p>
        </div>
        <v-btn class="sd-modern-button" variant="text" @click="openSetupTab(7)">
          <v-icon start size="18">help_outline</v-icon
          >{{ $t("onboarding.modern.setup_guide") }}
        </v-btn>
      </header>
      <div class="s--shop-onboarding__progress-label">
        <span>{{ $t("onboarding.modern.progress") }}</span>
        <span>{{
          $t("admin_shop.dashboard.modern.setup_progress", {
            completed: completed_steps,
            total: setup_steps.length,
          })
        }}</span>
      </div>
      <v-progress-linear
        :model-value="setup_progress"
        :aria-label="
          $t('admin_shop.dashboard.modern.setup_progress', {
            completed: completed_steps,
            total: setup_steps.length,
          })
        "
        color="primary"
        height="4"
        rounded
        class="s--shop-onboarding__progress"
      />
      <div class="s--shop-onboarding__next">
        <span
          ><v-icon
            icon="subdirectory_arrow_right"
            size="18"
            class="flip-rtl"
            aria-hidden="true"
          />
          {{
            next_setup_step >= 0
              ? $t("onboarding.modern.next", {
                  step: $t(setup_steps[next_setup_step].modern_label),
                })
              : $t("onboarding.modern.complete")
          }}
        </span>
        <v-btn
          v-if="next_setup_step >= 0"
          class="sd-modern-button"
          color="primary"
          variant="flat"
          @click="openSetupTab(next_setup_step)"
        >
          {{ $t("global.actions.continue") }} ·
          {{ $t(setup_steps[next_setup_step].modern_label)
          }}<v-icon end size="18" class="flip-rtl">arrow_forward</v-icon>
        </v-btn>
        <v-btn
          v-else
          :href="ShopURLs.MainShopUrl(shop)"
          target="_blank"
          rel="noopener noreferrer"
          class="sd-modern-button sd-modern-button--inline"
          color="primary"
          variant="text"
        >
          {{ $t("onboarding.open_website")
          }}<v-icon end size="18">north_east</v-icon>
        </v-btn>
      </div>
      <div class="s--shop-onboarding__layout">
        <nav
          class="s--shop-onboarding__navigation"
          :aria-label="$t('onboarding.modern.progress')"
        >
          <div class="s--shop-onboarding__steps">
            <button
              v-for="(step, index) in setup_steps"
              :key="step.label"
              type="button"
              class="s--shop-onboarding__step text-start"
              :class="{
                'is-selected': tab === index,
                'is-complete': step.complete,
                'is-next': next_setup_step === index,
              }"
              :aria-pressed="tab === index"
              :aria-controls="'shop-setup-details-' + shop.id"
              @click="openSetupTab(index)"
            >
              <span class="s--shop-onboarding__number"
                ><v-icon
                  v-if="step.complete"
                  icon="check"
                  size="16"
                  aria-hidden="true"
                /><template v-else>{{ index + 1 }}</template></span
              >
              <span class="s--shop-onboarding__step-copy">
                <span class="s--shop-onboarding__step-title">{{
                  $t(step.modern_label)
                }}</span>
                <span class="s--shop-onboarding__step-status">{{
                  $t(
                    step.complete
                      ? "global.commons.completed"
                      : next_setup_step === index
                        ? "admin_shop.dashboard.modern.setup_next_step"
                        : "onboarding.modern.to_do",
                  )
                }}</span>
              </span>
            </button>
          </div>
          <div class="s--shop-onboarding__extras">
            <button
              type="button"
              class="s--shop-onboarding__extra text-start"
              :class="{ 'is-selected': tab === 6 }"
              :aria-pressed="tab === 6"
              :aria-controls="'shop-setup-details-' + shop.id"
              @click="openSetupTab(6)"
            >
              <v-icon icon="sync_alt" size="18" aria-hidden="true" />{{
                $t("onboarding.migration.title")
              }}
            </button>
            <button
              type="button"
              class="s--shop-onboarding__extra text-start"
              :class="{ 'is-selected': tab === 7 }"
              :aria-pressed="tab === 7"
              :aria-controls="'shop-setup-details-' + shop.id"
              @click="openSetupTab(7)"
            >
              <v-icon icon="menu_book" size="18" aria-hidden="true" />{{
                $t("onboarding.modern.overview")
              }}
            </button>
          </div>
        </nav>
        <section
          ref="setup_details"
          :id="'shop-setup-details-' + shop.id"
          tabindex="-1"
          class="s--shop-onboarding__detail"
          :aria-labelledby="'shop-setup-title-' + shop.id"
        >
          <header class="s--shop-onboarding__detail-header">
            <h3 :id="'shop-setup-title-' + shop.id">{{ active_step_title }}</h3>
            <span
              v-if="tab < 6"
              class="sd-modern-status sd-modern-status--plain"
            >
              <span
                class="sd-modern-status__dot"
                :class="{
                  's--shop-onboarding__complete-dot': setup_steps[tab].complete,
                }"
              />
              {{
                $t(
                  setup_steps[tab].complete
                    ? "global.commons.completed"
                    : "onboarding.modern.to_do",
                )
              }}
            </span>
          </header>
          <v-window
            v-model="tab"
            :touch="false"
            class="s--shop-onboarding__window"
          >
            <v-window-item
              :value="0"
              :transition="false"
              :reverse-transition="false"
              ><s-shop-onboarding-customization
                :shop="shop"
                :time-series="timeSeries"
                modern
                @ai-build="(path, event) => $emit('ai-build', path, event)"
            /></v-window-item>
            <v-window-item
              :value="1"
              :transition="false"
              :reverse-transition="false"
              ><shop-onboarding-setup-business-tab
                :shop="shop"
                :time-series="timeSeries"
                modern
            /></v-window-item>
            <v-window-item
              :value="2"
              :transition="false"
              :reverse-transition="false"
              ><shop-onboarding-product-tab
                :shop="shop"
                :time-series="timeSeries"
                modern
            /></v-window-item>
            <v-window-item
              :value="3"
              :transition="false"
              :reverse-transition="false"
              ><shop-onboarding-shipping-tab
                :shop="shop"
                :time-series="timeSeries"
                modern
            /></v-window-item>
            <v-window-item
              :value="4"
              :transition="false"
              :reverse-transition="false"
              ><shop-onboarding-domain-tab
                :shop="shop"
                :time-series="timeSeries"
                modern
            /></v-window-item>
            <v-window-item
              :value="5"
              :transition="false"
              :reverse-transition="false"
              ><shop-onboarding-payment-tab
                :shop="shop"
                :time-series="timeSeries"
                modern
            /></v-window-item>
            <v-window-item
              :value="6"
              :transition="false"
              :reverse-transition="false"
              ><shop-onboarding-migration-tab
                :shop="shop"
                :time-series="timeSeries"
                modern
            /></v-window-item>
            <v-window-item
              :value="7"
              :transition="false"
              :reverse-transition="false"
            >
              <div class="s--shop-onboarding__overview">
                <p>{{ $t("onboarding.modern.overview_description") }}</p>
                <div class="s--shop-onboarding__resource-row">
                  <div>
                    <strong>{{ $t("onboarding.modern.store_address") }}</strong
                    ><span
                      class="s--shop-onboarding__store-address"
                      dir="ltr"
                      >{{ ShopURLs.MainShopUrl(shop) }}</span
                    >
                  </div>
                  <v-btn
                    :href="ShopURLs.MainShopUrl(shop)"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="sd-modern-button sd-modern-button--inline"
                    variant="text"
                    color="primary"
                    >{{ $t("onboarding.open_website")
                    }}<v-icon end size="16">north_east</v-icon></v-btn
                  >
                </div>
                <div class="s--shop-onboarding__resource-row">
                  <div>
                    <strong>{{ $t("onboarding.modern.shop_info") }}</strong
                    ><span>{{
                      $t("onboarding.modern.shop_info_description")
                    }}</span>
                  </div>
                  <v-btn
                    :to="{ name: 'BPageShopSettingInfo' }"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="sd-modern-button sd-modern-button--inline"
                    variant="text"
                    color="primary"
                    >{{ $t("onboarding.modern.shop_settings") }}<v-icon end size="16">north_east</v-icon></v-btn
                  >
                </div>
                <div class="s--shop-onboarding__resource-row">
                  <div>
                    <strong>{{ $t("onboarding.modern.handbook") }}</strong
                    ><span>{{
                      $t("onboarding.modern.handbook_description")
                    }}</span>
                  </div>
                  <v-btn
                    href="https://selldone.com/gapi/books/Do-Your-Business-Like-A-Game.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="sd-modern-button sd-modern-button--inline"
                    variant="text"
                    color="primary"
                    >{{ $t("global.actions.download") }} PDF<v-icon
                      end
                      size="16"
                      >north_east</v-icon
                    ></v-btn
                  >
                </div>
                <details class="s--shop-onboarding__learning">
                  <summary>
                    {{ $t("onboarding.modern.setup_guide")
                    }}<v-icon icon="expand_more" size="18" aria-hidden="true" />
                  </summary>
                  <div
                    v-for="(step, index) in setup_steps"
                    :key="step.label"
                    class="s--shop-onboarding__resource-row"
                  >
                    <div>
                      <strong>{{ $t(step.modern_label) }}</strong
                      ><span>{{ $t("onboarding.modern.guide_" + index) }}</span>
                    </div>
                    <v-btn
                      class="sd-modern-button sd-modern-button--inline"
                      color="primary"
                      variant="text"
                      @click="openSetupTab(index)"
                      >{{ $t("global.actions.open")
                      }}<v-icon end size="16" class="flip-rtl"
                        >arrow_forward</v-icon
                      ></v-btn
                    >
                  </div>
                </details>
                <details class="s--shop-onboarding__learning">
                  <summary>
                    {{ $t("onboarding.modern.video_library")
                    }}<v-icon icon="expand_more" size="18" aria-hidden="true" />
                  </summary>
                  <div
                    v-for="item in contents"
                    :key="item.video"
                    class="s--shop-onboarding__resource-row"
                  >
                    <div class="s--shop-onboarding__video-title">
                      <img
                        :src="item.image"
                        alt=""
                        width="64"
                        height="36"
                      /><strong>{{ item.title }}</strong>
                    </div>
                    <v-btn
                      :href="item.video"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="sd-modern-button sd-modern-button--inline"
                      variant="text"
                      color="primary"
                      >{{ $t("global.actions.watch_now")
                      }}<v-icon end size="16">north_east</v-icon></v-btn
                    >
                  </div>
                </details>
              </div>
            </v-window-item>
          </v-window>
        </section>
      </div>
      <footer class="s--shop-onboarding__footer">
        <span>{{ $t("onboarding.modern.saved_progress") }}</span>
        <v-btn
          class="sd-modern-button sd-modern-button--inline"
          variant="text"
          @click="dismiss()"
          >{{ $t("onboarding.modern.back_dashboard")
          }}<v-icon end size="16" class="flip-rtl">arrow_forward</v-icon></v-btn
        >
      </footer>
    </section>
    <div v-else class="widget-box -x-large mb-5">
      <u-widget-header
        :add-caption="$t('global.actions.dismiss')"
        :title="$t('onboarding.shop.title')"
        add-icon="close"
        icon="tips_and_updates"
        @click:add="dismiss()"
      >
      </u-widget-header>
      <v-list-subheader>
        {{ $t("onboarding.shop.subtitle") }}
      </v-list-subheader>
      <v-btn
        :href="ShopURLs.MainShopUrl(shop)"
        target="_blank"
        append-icon="open_in_new"
        class="nbt mb-3"
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
  emits: ["ai-build"],
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
          modern_label: "onboarding.modern.step_customize",
          complete:
            !!this.shop.theme && Object.keys(this.shop.theme).length > 0,
        },
        {
          label: "onboarding.setup_business",
          modern_label: "onboarding.modern.step_business",
          complete: !!this.shop.model,
        },
        {
          label: "onboarding.add_product",
          modern_label: "onboarding.modern.step_products",
          complete: this.has_product,
        },
        {
          label: "onboarding.setup_shipping",
          modern_label: "onboarding.modern.step_shipping",
          complete: !!this.has_warehouse,
        },
        {
          label: "onboarding.add_domain",
          modern_label: "onboarding.modern.step_domain",
          complete: this.domains.some((domain) => domain.enable),
        },
        {
          label: "onboarding.add_payment",
          modern_label: "onboarding.modern.step_payments",
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
            ? this.modern
              ? "onboarding.modern.overview"
              : "onboarding.overview.title"
            : this.setup_steps[this.tab]?.[
                this.modern ? "modern_label" : "label"
              ],
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
      this.$nextTick(() => this.$refs.setup_details?.focus());
    },
    dismiss() {
      localStorage.setItem(`shop:${this.shop.id}-setup`, "false");
      this.$router.push({ name: "BPageShopDashboard", hash: "" }); // Go to main dashboard page
    },
  },

  created() {
    if (this.modern) this.tab = Math.max(0, this.next_setup_step);
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

.s--shop-onboarding--modern {
  font-family: inherit;
  font-size: 13px;
  line-height: 1.6;
  font-weight: 400;
  letter-spacing: normal;
  .s--shop-onboarding__workspace {
    padding: 28px;
    min-width: 0;
  }
  .s--shop-onboarding__intro {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 20px;
    margin-block-end: 25px;
  }
  .s--shop-onboarding__intro h2 {
    margin: 5px 0 7px;
    font-size: 23px;
    line-height: 1.35;
    font-weight: 500;
    letter-spacing: -0.35px;
  }
  .s--shop-onboarding__intro .sd-modern-eyebrow {
    font-size: 11px;
    font-weight: 500;
    line-height: 1.5;
    margin: 0;
  }
  .s--shop-onboarding__subtitle {
    font-size: 13px;
    line-height: 1.65;
    color: var(--sd-modern-muted);
    margin: 0;
  }
  .s--shop-onboarding__progress-label {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    font-size: 12px;
    color: var(--sd-modern-muted);
    margin-block-end: 9px;
  }
  .s--shop-onboarding__progress {
    margin: 0;
  }
  .s--shop-onboarding__next {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    padding-block: 17px 22px;
  }
  .s--shop-onboarding__next > span {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--sd-modern-muted);
    font-size: 12px;
  }
  .s--shop-onboarding__layout {
    display: grid;
    grid-template-columns: 184px minmax(0, 1fr);
    gap: 26px;
    padding-block-start: 22px;
    border-block-start: 1px solid var(--sd-modern-border);
  }
  .s--shop-onboarding__navigation {
    min-width: 0;
    padding-inline-end: 20px;
    border-inline-end: 1px solid var(--sd-modern-border);
  }
  .s--shop-onboarding__steps {
    display: grid;
    gap: 5px;
  }
  .s--shop-onboarding__step {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
    min-height: 59px;
    padding: 10px 8px;
    border-radius: 8px;
    font: inherit;
    color: rgb(var(--v-theme-on-surface));
    transition: background-color 0.16s ease;
  }
  .s--shop-onboarding__step:hover,
  .s--shop-onboarding__extra:hover {
    background: var(--sd-modern-inset);
  }
  .s--shop-onboarding__step.is-selected,
  .s--shop-onboarding__extra.is-selected {
    color: rgb(var(--v-theme-primary));
    background: rgba(var(--v-theme-primary), 0.065);
  }
  .s--shop-onboarding__number {
    flex: 0 0 27px;
    width: 27px;
    height: 27px;
    display: grid;
    place-items: center;
    border: 1px solid var(--sd-modern-border);
    border-radius: 50%;
    color: var(--sd-modern-muted);
    font-size: 11px;
    background: rgb(var(--v-theme-surface));
  }
  .s--shop-onboarding__step.is-complete .s--shop-onboarding__number {
    border-color: transparent;
    color: rgb(var(--v-theme-success));
    background: var(--sd-modern-inset);
  }
  .s--shop-onboarding__step.is-next .s--shop-onboarding__number {
    color: rgb(var(--v-theme-primary));
    border-color: rgb(var(--v-theme-primary));
  }
  .s--shop-onboarding__step-copy {
    display: grid;
    gap: 3px;
    min-width: 0;
  }
  .s--shop-onboarding__step-title {
    font-size: 13px;
    line-height: 1.4;
    font-weight: 400;
  }
  .s--shop-onboarding__step.is-selected .s--shop-onboarding__step-title {
    font-weight: 500;
  }
  .s--shop-onboarding__step-status {
    font-size: 11px;
    line-height: 1.4;
    color: var(--sd-modern-muted);
  }
  .s--shop-onboarding__extras {
    display: grid;
    gap: 6px;
    padding-block-start: 12px;
    margin-block-start: 14px;
    border-block-start: 1px solid var(--sd-modern-border);
  }
  .s--shop-onboarding__extra {
    display: flex;
    align-items: center;
    gap: 8px;
    min-height: 36px;
    padding: 8px;
    border-radius: 8px;
    font: inherit;
    font-size: 12px;
    color: var(--sd-modern-muted);
  }
  .s--shop-onboarding__detail {
    min-width: 0;
  }
  .s--shop-onboarding__detail-header {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 9px;
    margin-block-end: 12px;
  }
  .s--shop-onboarding__detail-header h3 {
    font-size: 18px;
    font-weight: 500;
    line-height: 1.4;
    letter-spacing: -0.15px;
    margin: 0;
  }
  .s--shop-onboarding__detail-header .sd-modern-status {
    font-size: 11px;
    font-weight: 400;
  }
  .s--shop-onboarding__complete-dot {
    background: rgb(var(--v-theme-success));
  }
  .s--shop-onboarding__window {
    overflow: visible;
  }
  .s--shop-onboarding__detail:focus-visible,
  .s--shop-onboarding__step:focus-visible,
  .s--shop-onboarding__extra:focus-visible,
  .s--shop-onboarding__learning summary:focus-visible {
    outline: 2px solid rgb(var(--v-theme-primary));
    outline-offset: 3px;
    border-radius: 8px;
  }
  .s--shop-onboarding__footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 15px;
    border-block-start: 1px solid var(--sd-modern-border);
    margin-block-start: 25px;
    padding-block-start: 16px;
    font-size: 11px;
    color: var(--sd-modern-muted);
  }
  .s--shop-onboarding__overview > p {
    margin: 0 0 18px;
    font-size: 13px;
    color: var(--sd-modern-muted);
  }
  .s--shop-onboarding__resource-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 18px;
    padding-block: 14px;
    border-block-end: 1px solid var(--sd-modern-border);
  }
  .s--shop-onboarding__resource-row > div {
    display: grid;
    gap: 4px;
    min-width: 0;
  }
  .s--shop-onboarding__resource-row strong {
    font-size: 13px;
    font-weight: 500;
    line-height: 1.5;
  }
  .s--shop-onboarding__resource-row span {
    font-size: 12px;
    color: var(--sd-modern-muted);
    line-height: 1.6;
  }
  .s--shop-onboarding__store-address {
    overflow-wrap: anywhere;
  }
  .s--shop-onboarding__learning {
    margin-block-start: 16px;
  }
  .s--shop-onboarding__learning summary {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    min-height: 40px;
    font-size: 13px;
    font-weight: 500;
    list-style: none;
  }
  .s--shop-onboarding__learning summary::-webkit-details-marker {
    display: none;
  }
  .s--shop-onboarding__learning[open] > summary > .v-icon {
    transform: rotate(180deg);
  }
  .s--shop-onboarding__resource-row .s--shop-onboarding__video-title {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .s--shop-onboarding__video-title img {
    object-fit: cover;
    border-radius: 5px;
    flex-shrink: 0;
  }
  :deep(.sd-modern-button) {
    font-family: inherit;
    font-size: 13px;
    font-weight: 500;
    letter-spacing: normal;
    min-height: 36px;
  }
  @media (max-width: 960px) {
    .s--shop-onboarding__layout {
      grid-template-columns: minmax(0, 1fr);
      gap: 23px;
    }
    .s--shop-onboarding__navigation {
      padding-inline-end: 0;
      padding-block-end: 20px;
      border-inline-end: 0;
      border-block-end: 1px solid var(--sd-modern-border);
    }
    .s--shop-onboarding__steps {
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 5px;
    }
    .s--shop-onboarding__extras {
      display: flex;
      flex-wrap: wrap;
      border: 0;
      padding-block-start: 6px;
      margin-block-start: 10px;
      gap: 8px 18px;
    }
  }
  @media (max-width: 600px) {
    .s--shop-onboarding__workspace {
      padding: 22px 16px;
    }
    .s--shop-onboarding__intro {
      flex-wrap: wrap;
      gap: 12px;
      margin-block-end: 22px;
    }
    .s--shop-onboarding__intro h2 {
      font-size: 21px;
    }
    .s--shop-onboarding__intro > .v-btn {
      padding-inline: 0;
    }
    .s--shop-onboarding__next {
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
    }
    .s--shop-onboarding__steps {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    .s--shop-onboarding__step {
      padding: 10px 6px;
      gap: 7px;
    }
    .s--shop-onboarding__step-title {
      font-size: 12px;
    }
    .s--shop-onboarding__number {
      flex-basis: 25px;
      width: 25px;
      height: 25px;
    }
    .s--shop-onboarding__resource-row {
      flex-wrap: wrap;
      gap: 8px;
    }
    .s--shop-onboarding__resource-row > .v-btn {
      max-width: 100%;
    }
    .s--shop-onboarding__footer {
      flex-wrap: wrap;
    }
    :deep(.sd-modern-button),
    .s--shop-onboarding__extra {
      min-height: 44px;
    }
  }
  @media (pointer: coarse) {
    :deep(.sd-modern-button),
    .s--shop-onboarding__extra {
      min-height: 44px;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .s--shop-onboarding__step {
      transition: none;
    }
  }
}
</style>
