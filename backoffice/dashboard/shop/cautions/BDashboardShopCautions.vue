<!--
  - Copyright (c) 2024. Selldone® Business OS™
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
    v-if="cautions?.length"
    :class="{ 'sd-modern-widget s--shop-dashboard-cations-modern': modern }"
    class="s--shop-dashboard-cations"
  >
    <header v-if="modern" class="sd-modern-header">
      <div class="sd-modern-title">
        <span class="sd-modern-icon sd-modern-icon--plain"
          ><v-icon icon="health_and_safety" size="20" aria-hidden="true"
        /></span>
        <div>
          <h2 class="sd-modern-title-text">
            {{ $t("admin_shop.dashboard.modern.store_health") }}
          </h2>
          <p class="sd-modern-subtitle">
            {{ $t("admin_shop.dashboard.technical.health_subtitle") }}
          </p>
        </div>
      </div>
    </header>
    <ul v-if="modern" class="s--shop-dashboard-cations-modern__list">
      <li
        v-for="cation in cautions"
        :key="cautionKey(cation)"
        class="s--shop-dashboard-cations-modern__row"
        :aria-label="`${$t('global.commons.' + cation.type)} · ${cation.title}`"
      >
        <span
          class="sd-modern-status__dot s--shop-dashboard-cations-modern__dot"
          :class="{
            'sd-modern-status__dot--error': cation.type === 'error',
            'sd-modern-status__dot--warning': cation.type === 'warning',
          }"
          aria-hidden="true"
        />
        <div class="s--shop-dashboard-cations-modern__copy">
          <h3>{{ cation.title }}</h3>
          <details
            v-if="Array.isArray(cation.message)"
            class="s--shop-dashboard-cations-modern__checklist"
          >
            <summary>
              <span>{{
                $t("admin_shop.dashboard.technical.health_checklist", {
                  count: cation.message.length,
                })
              }}</span>
              <span
                v-if="cation.score !== null"
                class="s--shop-dashboard-cations-modern__score"
                >{{
                  $t("admin_shop.dashboard.technical.profile_completion", {
                    score: cation.score,
                  })
                }}</span
              >
              <v-icon size="16" aria-hidden="true">expand_more</v-icon>
            </summary>
            <ul>
              <li v-for="message in cation.message" :key="message">
                <v-icon size="13" aria-hidden="true">circle</v-icon>
                <span>{{ message }}</span>
              </li>
            </ul>
            <v-btn
              v-if="cation.to"
              :to="cation.to"
              class="sd-modern-button sd-modern-button--compact sd-modern-button--inline"
              color="primary"
              variant="text"
            >
              {{ cation.action
              }}<v-icon size="16" class="ms-1" aria-hidden="true">{{
                $t("icons.chevron_next")
              }}</v-icon>
            </v-btn>
          </details>
          <template v-else>
            <p>{{ cation.message }}</p>
            <v-btn
              v-if="cation.to"
              :to="cation.to"
              class="sd-modern-button sd-modern-button--compact sd-modern-button--inline"
              color="primary"
              variant="text"
            >
              {{ cation.action
              }}<v-icon size="16" class="ms-1" aria-hidden="true">{{
                $t("icons.chevron_next")
              }}</v-icon>
            </v-btn>
          </template>
        </div>
        <v-btn
          icon
          variant="text"
          class="sd-modern-icon-button s--shop-dashboard-cations-modern__dismiss"
          :aria-label="
            $t('admin_shop.dashboard.technical.dismiss_reminder', {
              title: cation.title,
            })
          "
          @click="dismiss(cation)"
        >
          <v-icon size="16" aria-hidden="true">close</v-icon>
          <v-tooltip
            activator="parent"
            location="top"
            :open-on-focus="true"
            content-class="sd-modern-tooltip text-start"
            >{{
              $t("admin_shop.dashboard.technical.dismiss_reminder", {
                title: cation.title,
              })
            }}</v-tooltip
          >
        </v-btn>
      </li>
    </ul>
    <v-btn
      v-if="modern && hiddenCautionCount"
      class="sd-modern-button sd-modern-button--compact sd-modern-button--inline s--shop-dashboard-cations-modern__more"
      color="primary"
      variant="text"
      :aria-expanded="expandedCautions"
      @click="expandedCautions = !expandedCautions"
    >
      {{
        $t(
          expandedCautions
            ? "admin_shop.dashboard.technical.show_less"
            : "admin_shop.dashboard.technical.show_more",
          { count: hiddenCautionCount },
        )
      }}
      <v-icon size="16" class="ms-1" aria-hidden="true">{{
        expandedCautions ? "expand_less" : "expand_more"
      }}</v-icon>
    </v-btn>
    <template v-if="!modern">
      <p class="mb-1 small text-muted">
        <v-icon class="me-1">arrow_drop_down</v-icon>
        <b>{{ $t("global.commons.tips") }}: </b>
        {{ $t("cautions.title") }}
      </p>
      <b-alert-cation
        v-for="(cation, index) in cautions"
        :key="index"
        :cation="cation"
        :shop="shop"
        class="mb-2"
      />
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import BAlertCation from "../../../alert/cation/BAlertCation.vue";
import { ShopCautionHelper } from "@selldone/core-js/helper/shop/ShopCautionHelper";
import { getTechnicalCautions } from "./technicalHealthChecks";

export default defineComponent({
  name: "BDashboardShopCautions",
  components: { BAlertCation },
  props: {
    modern: { type: Boolean, default: false },
    shop: {
      required: true,
      type: Object,
    },
  },
  data: () => ({ dismissedCautions: [], expandedCautions: false }),
  watch: {
    "shop.id"() {
      this.dismissedCautions = [];
      this.expandedCautions = false;
    },
    availableCautions(cautions) {
      const keys = new Set(cautions.map(this.cautionKey));
      this.dismissedCautions = this.dismissedCautions.filter((key) =>
        keys.has(key),
      );
    },
  },
  computed: {
    availableCautions() {
      if (!this.shop) return [];
      const base = ShopCautionHelper.Generate(this.shop) || [];
      if (!this.modern) return base;
      const cautions = [
        ...getTechnicalCautions(this.shop, (key, params) =>
          this.$t(key, params),
        ),
        ...base,
      ];
      const priority = ["error", "warning", "info"];
      return cautions.sort(
        (a, b) => priority.indexOf(a.type) - priority.indexOf(b.type),
      );
    },
    undismissedCautions() {
      return this.modern
        ? this.availableCautions.filter(
            (cation) =>
              !this.dismissedCautions.includes(this.cautionKey(cation)),
          )
        : this.availableCautions;
    },
    cautions() {
      return this.modern && this.expandedCautions
        ? this.undismissedCautions
        : this.undismissedCautions.slice(0, 3);
    },
    hiddenCautionCount() {
      return Math.max(0, this.undismissedCautions.length - 3);
    },
  },
  methods: {
    cautionKey(cation) {
      return cation.diagnosticKey || JSON.stringify(cation);
    },
    dismiss(cation) {
      this.dismissedCautions.push(this.cautionKey(cation));
    },
  },
});
</script>

<style lang="scss" scoped>
/*
━━━━━━━━━━━━━━━━━━━━ 🎺 Variables ━━━━━━━━━━━━━━━━━━━━
 */

/*
━━━━━━━━━━━━━━━━━━━━ 🪅 Classes ━━━━━━━━━━━━━━━━━━━━
 */
.s--shop-dashboard-cations {
  text-align: start;
}
.s--shop-dashboard-cations-modern {
  padding: 24px;
  border-radius: 15px;

  .sd-modern-title-text {
    font-size: 17px;
    font-weight: 500;
    line-height: 1.45;
  }
  .sd-modern-subtitle {
    font-size: 12px;
    line-height: 1.65;
  }

  &__list {
    padding: 0;
    margin: 0;
    list-style: none;
  }
  &__row {
    display: grid;
    grid-template-columns: 6px minmax(0, 1fr) 32px;
    align-items: start;
    gap: 12px;
    padding: 13px 12px;

    & + & {
      border-block-start: 1px solid var(--sd-modern-border);
    }
  }
  &__dot {
    margin-block-start: 7px;
  }
  &__copy {
    min-width: 0;
    overflow-wrap: anywhere;
    h3 {
      margin: 0;
      font-size: 13px;
      font-weight: 500;
      line-height: 1.5;
    }
    p {
      margin: 4px 0 0;
      color: var(--sd-modern-muted);
      font-size: 12px;
      line-height: 1.65;
    }
    .sd-modern-button {
      margin-block-start: 8px;
    }
  }
  &__checklist {
    margin-block-start: 4px;
    color: var(--sd-modern-muted);
    font-size: 12px;
    line-height: 1.65;

    summary {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 4px 10px;
      min-height: 28px;
      list-style: none;
      cursor: pointer;

      &::-webkit-details-marker {
        display: none;
      }
      &:focus-visible {
        outline: 2px solid rgb(var(--v-theme-primary));
        outline-offset: 3px;
        border-radius: 4px;
      }
      > .v-icon {
        margin-inline-start: auto;
      }
    }
    &[open] > summary > .v-icon {
      transform: rotate(180deg);
    }
    ul {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 6px 22px;
      list-style: none;
      margin: 0;
      padding: 14px 0 0;
    }
    li {
      display: flex;
      gap: 7px;
      align-items: start;
      .v-icon {
        margin-block-start: 3px;
        flex-shrink: 0;
      }
    }
  }
  &__score {
    font-variant-numeric: tabular-nums;
  }
  &__dismiss {
    --sd-modern-icon-button-size: 32px;
    margin-block-start: -4px;
    &:focus-visible {
      outline: 2px solid rgb(var(--v-theme-primary));
      outline-offset: 3px;
    }
  }
  &__more {
    margin-block-start: 12px;
  }

  @media (max-width: 599px), (pointer: coarse) {
    &__row {
      grid-template-columns: 6px minmax(0, 1fr) 44px;
    }
    &__dismiss {
      --sd-modern-icon-button-size: 44px;
    }
    &__checklist summary {
      min-height: 44px;
    }
    &__checklist ul {
      grid-template-columns: minmax(0, 1fr);
    }
  }
}
</style>
