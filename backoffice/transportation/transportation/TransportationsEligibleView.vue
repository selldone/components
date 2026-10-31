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
  <section v-if="modern" class="transportations-eligible-view text-start">
    <header class="transportations-eligible-view__heading">
      <div>
        <h3>{{ $t("add_product.shipping_modern.services_title") }}</h3>
        <p>{{ $t("add_product.shipping_modern.services_intro") }}</p>
      </div>
      <v-btn
        class="sd-modern-icon-button sd-modern-info-button"
        icon
        variant="text"
        :aria-label="$t('add_product.shipping_modern.services_about')"
        ><b-product-edit-info-icon name="Info" :size="16" /><v-tooltip
          activator="parent"
          location="top"
          open-on-click
          content-class="sd-modern-tooltip text-start"
          >{{ $t("add_product.shipping_modern.services_help") }}</v-tooltip
        ></v-btn
      >
    </header>
    <div
      v-if="eligible_transportations?.length"
      class="transportations-eligible-view__list"
    >
      <v-btn
        v-for="transportation in eligible_transportations"
        :key="transportation.id"
        class="transportations-eligible-view__service sd-modern-clickable-item"
        :class="{
          'transportations-eligible-view__service--inactive':
            !transportation.enable,
        }"
        :disabled="busy"
        variant="text"
        @click.stop="
          (event) => setActivator(event.currentTarget, transportation)
        "
      >
        <v-avatar rounded size="16" class="hover-scale-small"
          ><v-img
            :src="
              transportation.logo
                ? getShopImagePath(transportation.logo)
                : ShopTransportations[transportation.type]?.icon
            "
            alt=""
        /></v-avatar>
        <span class="transportations-eligible-view__service-name"
          >{{
            transportation.title ||
            $t(ShopTransportations[transportation.type]?.name)
          }}<small v-if="!transportation.enable">{{
            $t("global.commons.inactive")
          }}</small></span
        ><b-product-edit-info-icon
          name="ChevronRight"
          :size="14"
          class="transportations-eligible-view__direction"
        />
      </v-btn>
    </div>
    <p v-else class="transportations-eligible-view__empty">
      {{ $t("add_product.shipping_modern.services_empty") }}
    </p>
    <v-dialog
      v-model="menu"
      :aria-label="activator_item ? serviceTitle : undefined"
      max-width="540"
      width="calc(100vw - 32px)"
      scrollable
    >
      <v-card
        v-if="activator_item"
        class="sd-modern-widget transportations-eligible-view__dialog text-start"
      >
        <header>
          <v-avatar rounded size="26"
            ><v-img
              :src="
                activator_item.logo
                  ? getShopImagePath(activator_item.logo)
                  : ShopTransportations[activator_item.type]?.icon
              "
              alt=""
          /></v-avatar>
          <h2>{{ serviceTitle }}</h2>
          <v-tooltip location="top" content-class="sd-modern-tooltip text-start"
            ><template #activator="{ props }"
              ><v-btn
                v-bind="props"
                class="sd-modern-icon-button"
                icon
                variant="text"
                :aria-label="$t('global.actions.close')"
                @click="closeDetails"
                ><b-product-edit-info-icon
                  name="X"
                  :size="16" /></v-btn></template
            >{{ $t("global.actions.close") }}</v-tooltip
          >
        </header>
        <v-card-text
          ><p
            class="transportations-eligible-view__dialog-status sd-modern-status sd-modern-status--plain"
          >
            <span
              class="sd-modern-status__dot"
              :class="
                activator_item.enable
                  ? 'sd-modern-status__dot--success'
                  : 'sd-modern-status__dot--error'
              "
            />{{
              $t(
                activator_item.enable
                  ? "global.commons.active"
                  : "global.commons.inactive",
              )
            }}
          </p>
          <b-transportation-overview
            :shop="shop"
            :show-buttons="false"
            :transportation="activator_item"
            modern
          />
          <p class="transportations-eligible-view__dialog-help">
            {{ $t("add_product.shipping_modern.services_help") }}
          </p></v-card-text
        >
        <v-card-actions
          ><v-btn
            class="sd-modern-button"
            variant="outlined"
            @click="closeDetails"
            >{{ $t("global.actions.close") }}</v-btn
          ></v-card-actions
        >
      </v-card>
    </v-dialog>
  </section>
  <div v-else>
    <v-list-subheader>
      {{ $t("transportation_eligible.subtitle") }}
    </v-list-subheader>
    <v-row class="py-3" no-gutters>
      <div
        v-for="transportation in eligible_transportations"
        :key="transportation.id"
        :class="{ 'img-grayscale': !transportation.enable }"
        :title="`Show detail of ${
          transportation.title
            ? transportation.title
            : $t(ShopTransportations[transportation.type]?.name)
        }`"
        class="usn pp small -transportation-item"
        @click.stop="(e) => setActivator(e.target, transportation)"
      >
        <v-avatar rounded size="16" start>
          <v-img
            :src="
              transportation.logo
                ? getShopImagePath(transportation.logo)
                : ShopTransportations[transportation.type]?.icon
            "
          />
        </v-avatar>
        <span class="px-1">{{
          transportation.title
            ? transportation.title
            : $t(ShopTransportations[transportation.type]?.name)
        }}</span>
      </div>
    </v-row>

    <v-menu
      v-if="activator_item"
      v-model="menu"
      :activator="activator"
      location="bottom"
    >
      <v-sheet class="pa-3" color="#111" dark>
        <b-transportation-overview
          :shop="shop"
          :show-buttons="false"
          :transportation="activator_item"
        ></b-transportation-overview>
      </v-sheet>
    </v-menu>
  </div>
</template>

<script lang="ts">
import { ShopTransportations } from "@selldone/core-js/enums/logistic/ShopTransportations";
import BTransportationOverview from "../../transportation/overview/BTransportationOverview.vue";
import { delay } from "lodash-es";
import BProductEditInfoIcon from "../../product/edit/info/BProductEditInfoIcon.vue";

export default {
  name: "TransportationsEligibleView",
  components: { BTransportationOverview, BProductEditInfoIcon },
  emits: ["dialog-change"],
  props: {
    modern: { type: Boolean, default: false },
    busy: { type: Boolean, default: false },
    shop: {
      type: Object,
      required: true,
    },

    weight: {},

    width: {},
    length: {},
    height: {},
  },
  data: () => ({
    ShopTransportations: ShopTransportations,

    activator: null,
    activator_item: null,
    menu: false,
  }),
  created() {},
  watch: {
    menu(value) {
      if (!this.modern) return;
      this.$emit("dialog-change", value);
      if (!value)
        this.$nextTick(() => {
          if (this.activator?.isConnected && !this.activator.disabled)
            this.activator.focus({ preventScroll: true });
        });
    },
  },
  beforeUnmount() {
    if (this.modern && this.menu) this.$emit("dialog-change", false);
  },

  computed: {
    serviceTitle() {
      return (
        this.activator_item.title ||
        this.$t(ShopTransportations[this.activator_item.type]?.name)
      );
    },
    transportations() {
      return this.shop.transportations;
    },
    eligible_transportations() {
      return this.transportations?.filter((t) => {
        return (
          this.weight <= t.max_weight &&
          this.width <= t.max_w &&
          this.length <= t.max_l &&
          this.height <= t.max_h
        );
      });
    },
  },

  methods: {
    closeDetails() {
      this.menu = false;
    },
    setActivator(node, item) {
      if (this.modern) {
        if (this.busy) return;
        this.activator = node;
        this.activator_item = item;
        this.menu = true;
        return;
      }
      this.activator = node;
      this.menu = false;
      delay(() => {
        this.activator_item = item;
        this.menu = true;
      }, 300);
    },
  },
};
</script>

<style lang="scss" scoped>
.-transportation-item {
  margin: 4px;
  transition: all 0.3s ease-in-out;

  &:hover {
    color: #000;
    font-weight: bolder;
  }
}
.transportations-eligible-view {
  margin-block-start: 22px;
  padding-block-start: 21px;
  border-block-start: 1px solid var(--sd-modern-border);
  &__heading {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    margin-block-end: 11px;
    h3 {
      margin: 0;
      font-size: 13px;
      font-weight: 500;
      line-height: 20px;
    }
    p {
      margin: 3px 0 0;
      color: var(--sd-modern-muted);
      font-size: 12px;
      line-height: 19px;
    }
  }
  &__list {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0 22px;
  }
  &__service.v-btn {
    display: flex;
    width: 100%;
    height: auto;
    min-height: 43px;
    padding: 8px 10px;
    justify-content: flex-start;
    text-align: start;
    text-transform: none;
    font-family: inherit;
    font-size: 12px;
    font-weight: 400;
    line-height: 19px;
    letter-spacing: 0;
    border-radius: 8px;
    :deep(.v-btn__content) {
      width: 100%;
      min-width: 0;
      display: flex;
      align-items: center;
      gap: 9px;
      white-space: normal;
    }
  }
  &__service-name {
    flex: 1;
    min-width: 0;
    overflow-wrap: anywhere;
    small {
      display: block;
      color: var(--sd-modern-muted);
      font-size: 11px;
      line-height: 18px;
      margin-block-start: 2px;
    }
  }
  &__service--inactive {
    opacity: 0.65;
  }
  &__direction {
    color: var(--sd-modern-muted);
  }
  &__empty {
    margin: 0;
    font-size: 12px;
    line-height: 19px;
    color: var(--sd-modern-muted);
  }
  &:dir(rtl) &__direction {
    transform: scaleX(-1);
  }
  @media (max-width: 600px), (pointer: coarse) {
    &__service.v-btn {
      min-height: 44px;
    }
  }
  @media (max-width: 600px) {
    &__list {
      grid-template-columns: minmax(0, 1fr);
    }
  }
}
.transportations-eligible-view__dialog {
  padding: 0;
  border-radius: 18px !important;
  --sd-modern-icon-button-size: 32px;
  > header {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 23px 23px 18px;
    h2 {
      flex: 1;
      min-width: 0;
      margin: 0;
      font-size: 18px;
      font-weight: 500;
      line-height: 26px;
      overflow-wrap: anywhere;
    }
  }
  > .v-card-text {
    padding: 0 23px 23px;
  }
  > .v-card-actions {
    padding: 0 23px 23px;
    justify-content: flex-end;
    .v-btn {
      margin: 0;
    }
  }
  &-status {
    margin-block-end: 20px;
  }
  &-help {
    margin: 20px 0 0;
    color: var(--sd-modern-muted);
    font-size: 13px;
    line-height: 21px;
  }
  :deep(.b-transportation-overview) {
    font-size: var(--sd-modern-font-body);
    line-height: 22px;
  }
  :deep(.b-transportation-overview dd) {
    font-size: var(--sd-modern-font-body);
    line-height: 22px;
  }
  :deep(.b-transportation-overview dt),
  :deep(.b-transportation-overview__connection-label) {
    font-size: var(--sd-modern-font-small);
    line-height: 21px;
  }
  @media (max-width: 600px) {
    > header {
      padding: 18px 16px 16px;
    }
    > .v-card-text {
      padding: 0 16px 20px;
    }
    > .v-card-actions {
      padding: 0 16px 18px;
    }
  }
  @media (max-width: 600px), (pointer: coarse) {
    --sd-modern-icon-button-size: 44px;
  }
}
</style>
