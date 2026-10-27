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
  <v-container
    v-bind="$attrs"
    :class="modern ? 's--shop-dashboard-expert-modern' : 'pa-sm-3'"
    class="s--shop-dashboard-expert text-start pa-0"
  >
    <v-card
      :class="modern ? 'sd-modern-widget' : 'thin-scroll'"
      :max-height="modern ? undefined : 840"
      :style="
        modern
          ? undefined
          : 'background-image: linear-gradient(60deg, #1976d2, #1760a8)'
      "
      :color="modern ? 'surface' : '#1760a8'"
      rounded="xl"
    >
      <header v-if="modern" class="sd-modern-header">
        <div class="sd-modern-title">
          <span class="sd-modern-icon sd-modern-icon--plain"
            ><v-icon icon="handshake" size="20" aria-hidden="true"
          /></span>
          <h2 class="sd-modern-title-text">
            {{ $t("experts_common.expert_contracts") }}
          </h2>
        </div>
        <v-btn
          :to="{ name: 'ExpertsPage' }"
          class="sd-modern-button sd-modern-button--inline"
          variant="text"
          v-tooltip="{ text: $t('experts_common.hire_me_now'), location: 'top', contentClass: 'sd-modern-tooltip text-start' }"
        >
          {{ $t("experts_common.hire_me_now") }}
        </v-btn>
      </header>
      <v-card-title v-else class="d-flex align-center">
        <v-icon class="me-2">emoji_food_beverage</v-icon>
        {{ $t("experts_common.expert_contracts") }}
        <v-spacer></v-spacer>
      </v-card-title>
      <v-card-text>
        <div class="border-between-vertical -dashed">
          <component
            :is="modern ? 'details' : 'div'"
            v-for="(contract, index) in contracts"
            :key="contract.id"
            :open="modern ? index === 0 : undefined"
            :class="{ 's--shop-dashboard-expert-modern__contract': modern }"
          >
            <summary v-if="modern" class="s--shop-dashboard-expert-modern__summary">
              <v-avatar size="32" class="flex-shrink-0">
                <v-img :src="getUserAvatar(contract.user_id)" />
              </v-avatar>
              <span class="s--shop-dashboard-expert-modern__identity">
                <span class="s--shop-dashboard-expert-modern__title">{{ contract.title }}</span>
                <span v-if="contract.start_at || contract.end_at" class="sd-modern-subtitle">
                  <span v-if="contract.start_at">{{ $t("global.commons.start_date") }} · {{ getLocalDateString(contract.start_at) }}</span>
                  <span v-if="contract.end_at"> · {{ $t("global.commons.end_date") }} · {{ getLocalDateString(contract.end_at) }}</span>
                </span>
              </span>
              <span class="sd-modern-status sd-modern-status--plain">{{ $t(contractStatus(contract)) }}</span>
              <u-price :amount="contract.cost" :currency="contract.currency" />
              <v-icon size="18" class="s--shop-dashboard-expert-modern__chevron" aria-hidden="true">expand_more</v-icon>
            </summary>
            <v-row class="position-relative s--shop-dashboard-expert-modern__body">
            <v-col cols="12" md="6">
              <p class="font-weight-bold mb-2">
                <v-avatar
                  class="me-2 hover-scale avatar-gradient -thin -user"
                  color="#fff"
                  size="32"
                >
                  <v-img :src="getUserAvatar(contract.user_id)" />
                </v-avatar>

                {{ contract.title }}
                <v-btn
                  :class="
                    modern
                      ? 'sd-modern-button sd-modern-button--inline'
                      : 'ms-1'
                  "
                  size="small"
                  variant="outlined"
                  rounded
                  v-tooltip="{ text: $t('global.commons.detail'), location: modern ? 'top' : undefined, contentClass: modern ? 'sd-modern-tooltip text-start' : undefined }"
                  @click="showContract(contract)"
                >
                  <v-icon start>info</v-icon>
                  {{ $t("global.commons.detail") }}
                </v-btn>
              </p>

              <div class="mb-2">
                <u-price
                  :amount="contract.cost"
                  :class="{ 'text-success': contract.settle_at && !modern }"
                  :currency="contract.currency"
                  class="flex-grow-1"
                  medium
                ></u-price>
              </div>

              <p v-if="contract.start_at" class="mb-1">
                <span class="me-1 small"
                  >{{ $t("global.commons.start_date") }}:</span
                >{{ getLocalDateString(contract.start_at) }} ({{
                  getFromNowString(contract.start_at)
                }})
              </p>
              <v-chip
                v-if="!contract.payment_at && !contract.cancel_at"
                size="small"
              >
                <v-icon start>hourglass_empty</v-icon>
                {{ $t("experts_common.waiting_pay_and_start") }}
              </v-chip>

              <p v-if="contract.end_at" class="mt-2">
                <span class="me-1 small"
                  >{{ $t("global.commons.end_date") }}:</span
                >{{ getLocalDateString(contract.end_at) }} ({{
                  getFromNowString(contract.end_at)
                }})

                <v-chip
                  v-if="contract.end_at && !contract.complete_at"
                  class="ms-2"
                  size="small"
                  >{{ $t("experts_common.waiting_to_complete") }}
                </v-chip>
              </p>
              <p v-else-if="contract.start_at" class="mt-2">
                <v-icon class="me-1" color="green" size="small"
                  >play_arrow
                </v-icon>
                {{ $t("experts_common.running") }}
              </p>

              <div class="pt-2">
                <v-btn
                  v-if="
                    contract.user_id === USER_ID() &&
                    !contract.start_at &&
                    !contract.cancel_at
                  "
                  :color="modern ? 'primary' : 'success'"
                  :class="{ 'sd-modern-button': modern }"
                  rounded
                  v-tooltip="{ text: $t('experts_common.paY_start_action'), location: modern ? 'top' : undefined, contentClass: modern ? 'sd-modern-tooltip text-start' : undefined }"
                  @click="showContract(contract)"
                >
                  <v-icon class="me-1 blink-me" size="small">lens</v-icon>
                  {{ $t("experts_common.paY_start_action") }}
                </v-btn>
              </div>
            </v-col>

            <v-col cols="12" md="6">
              <div
                v-for="(task, index) in contract.tasks"
                :key="index"
                class="mb-3"
              >
                <div class="text-subtitle-2 mb-1 single-line">
                  {{ index + 1 }}. {{ task.title }}
                </div>
                <v-progress-linear
                  :color="task.progress > 99 ? 'green' : 'blue'"
                  :model-value="task.progress"
                  bg-color="#eee"
                  height="6"
                  rounded
                  striped
                >
                </v-progress-linear>
              </div>

              <v-chip
                v-for="permission in contract.permissions"
                :key="permission.code"
                :title="getLocalTimeString(permission.grant_at)"
                class="m-1"
                :class="{ 'sd-modern-tag': modern }"
                :color="modern ? undefined : '#164f82'"
                :variant="modern ? 'text' : 'flat'"
                size="small"
              >
                <img
                  :src="ShopPermissions[permission.code].src"
                  class="me-1"
                  height="16"
                  width="16"
                />
                {{ $t(ShopPermissions[permission.code].text) }}

                <u-check
                  v-if="contract.start_at"
                  :value="!!permission.grant_at"
                  class="ms-1"
                ></u-check>
                <v-icon v-else class="ms-1" size="small"
                  >panorama_fish_eye
                </v-icon>
              </v-chip>
            </v-col>
            </v-row>
          </component>
        </div>

        <div v-if="!contracts || !contracts.length">
          {{ $t("experts_common.need_help") }}

          <v-btn
            v-if="!modern"
            :to="{ name: 'ExpertsPage' }"
            variant="text"
            v-tooltip="$t('experts_common.hire_me_now')"
            >{{ $t("experts_common.hire_me_now") }}
          </v-btn>
        </div>
      </v-card-text>

      <!-- -------------------------------- Dialog > Contract ------------------------------------- -->
    </v-card>
  </v-container>
  <v-dialog
    v-model="dialog_contract"
    content-class="rounded-xl"
    max-width="840"
    scrollable
  >
    <v-card v-if="selected_contract" class="text-start" rounded="xl">
      <v-card-title></v-card-title>
      <v-card-text class="thin-scroll">
        <expert-contract-view
          v-if="selected_contract"
          :contract-id="selected_contract.id"
          @update:contract="
            (contract) => AddOrUpdateItemByID(contracts, contract)
          "
        ></expert-contract-view>
      </v-card-text>
      <v-card-actions>
        <div class="widget-buttons">
          <v-btn
            variant="text"
            @click="dialog_contract = false"
            size="x-large"
            prepend-icon="close"
            v-tooltip="$t('global.actions.close')"
            >{{ $t("global.actions.close") }}
          </v-btn>
        </div>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { ShopPermissions } from "@selldone/core-js/enums/permission/ShopPermissions";
import ExpertContractView from "../../../expert/contract/ExpertContractView.vue";
import DateMixin from "@selldone/components-vue/mixin/date/DateMixin.ts";

export default {
  name: "BDashboardShopExpert",
  mixins: [DateMixin],

  components: { ExpertContractView },
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
    ShopPermissions: ShopPermissions,
    selected_contract: null,
    dialog_contract: false,
  }),

  computed: {
    contracts() {
      return this.shop.contracts;
    },
  },

  methods: {
    contractStatus(contract) {
      if (contract.cancel_at) return "global.commons.canceled";
      if (contract.complete_at) return "global.commons.completed";
      if (contract.end_at) return "experts_common.waiting_to_complete";
      if (contract.start_at) return "experts_common.running";
      return "experts_common.waiting_pay_and_start";
    },
    showContract(contract) {
      this.selected_contract = contract;
      this.dialog_contract = true;
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
.s--shop-dashboard-expert {
}
.s--shop-dashboard-expert-modern {
  :deep(.sd-modern-widget > .v-card-text) {
    padding: 0;
  }
  .s--shop-dashboard-expert-modern__contract {
    border-block-end: 1px solid var(--sd-modern-border);
  }
  .s--shop-dashboard-expert-modern__summary {
    display: grid;
    grid-template-columns: 32px minmax(0, 1fr) minmax(100px, 0.5fr) auto 18px;
    align-items: center;
    gap: 12px;
    min-height: 64px;
    padding: 10px 12px;
    border-radius: 8px;
    cursor: pointer;
    list-style: none;
    &::-webkit-details-marker { display: none; }
    &:hover { background: var(--sd-modern-inset); }
    &:focus-visible { outline: 2px solid rgb(var(--v-theme-primary)); }
  }
  .s--shop-dashboard-expert-modern__title {
    font-size: 14px;
    font-weight: 500;
    overflow-wrap: anywhere;
  }
  .s--shop-dashboard-expert-modern__identity { display: grid; gap: 3px; }
  details[open] > summary .s--shop-dashboard-expert-modern__chevron {
    transform: rotate(180deg);
  }
  .s--shop-dashboard-expert-modern__body {
    margin: 0;
    padding-block: 8px 16px;
    font-size: 13px;
    :deep(.font-weight-bold) { font-weight: 500 !important; }
    :deep(.text-subtitle-2) { font-weight: 400; }
  }
  :deep(.u--price) {
    font-size: 14px;
    font-weight: 400;
  }
  @media (max-width: 600px) {
    .s--shop-dashboard-expert-modern__summary {
      grid-template-columns: 32px minmax(0, 1fr) 18px;
      > .sd-modern-status { grid-column: 2; grid-row: 2; }
      > :deep(.u--price) { grid-column: 2; grid-row: 3; }
      > .v-icon { grid-column: 3; grid-row: 1 / span 3; }
    }
  }
}
</style>
