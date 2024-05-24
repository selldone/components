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
  <v-container class="s--shop-dashboard-expert pa-0 pa-sm-3">
    <s-widget
      :class="{ '-fullscreen': fullscreen }"
      :title="`<span class='fa:fas fa-caret-down me-1' ></span> ${$t(
        'experts_common.expert_contracts',
      )}`"
      class="text-start contracts-panel thin-scroll widget-dark"
      custom-header
    >
      <v-icon class="absolute-top-end" >emoji_food_beverage</v-icon>
      <v-sheet class="border-between-vertical -dashed" color="transparent" dark>
        <v-row
          v-for="contract in contracts"
          :key="contract.id"
          class="position-relative"
        >
          <v-btn
            v-if="contract.user_id === USER_ID()"
            class="absolute-top-end"
            icon
            @click="showContract(contract)"
          >
            <v-icon>info</v-icon>
          </v-btn>

          <v-col cols="12" md="6">
            <p class="font-weight-bold nb-1">
              <v-avatar class="me-2 hover-scale" color="#fff" size="24">
                <v-img :src="getUserAvatar(contract.user_id)" />
              </v-avatar>

              {{ contract.title }}
            </p>

            <u-price
              :amount="contract.cost"
              :class="{ 'text-success': contract.settle_at }"
              :currency="contract.currency"
              class="flex-grow-1 p-2"
            ></u-price>

            <p v-if="contract.start_at" class="mb-1">
              <small class="me-1">{{ $t("global.commons.start_date") }}:</small
              >{{ getLocalTimeString(contract.start_at) }}
            </p>
            <small v-else>
              <v-icon class="me-1" size="small">hourglass_empty</v-icon>
              {{ $t("experts_common.waiting_pay_and_start") }}
            </small>

            <p v-if="contract.end_at" class="mb-1">
              <small class="me-1">{{ $t("global.commons.end_date") }}:</small
              >{{ getLocalTimeString(contract.end_at) }}

              <small class="ms-2">{{
                $t("experts_common.waiting_to_complete")
              }}</small>
            </p>
            <small v-else-if="contract.start_at">
              <v-icon class="me-1" color="green" size="small"
                >play_arrow
              </v-icon>
              {{ $t("experts_common.running") }}</small
            >

            <div class="pt-2">
              <v-btn
                v-if="
                  contract.user_id === USER_ID() &&
                  !contract.start_at &&
                  !contract.cancel_at
                "
                color="success"
                rounded
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
              class="m-1 text-start text-ellipsis pt-1"
            >
              <small>{{ task.title }}</small>
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
              color="#164f82"
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

        <div v-if="!contracts || !contracts.length">
          {{ $t("experts_common.need_help") }}

          <v-btn :to="{ name: 'ExpertsPage' }" variant="text"
            >{{ $t("experts_common.hire_me_now") }}
          </v-btn>
        </div>
      </v-sheet>

      <!-- -------------------------------- Dialog > Contract ------------------------------------- -->
      <v-dialog
        v-model="dialog_contract"
        content-class="no-shadow-dialog"
        max-width="840"
        scrollable
      >
        <v-card v-if="selected_contract" class="rounded-28px overflow-hidden">
          <v-card-title></v-card-title>
          <v-card-text>
            <expert-contract-view
              v-if="selected_contract"
              :contract-id="selected_contract.id"
              @update:contract="
                (contract) => AddOrUpdateItemByID(contracts, contract)
              "
            ></expert-contract-view>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn variant="text" @click="dialog_contract = false"
              >{{ $t("global.actions.close") }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </s-widget>
  </v-container>
</template>

<script>
import { ShopPermissions } from "@selldone/core-js/enums/permission/ShopPermissions";
import ExpertContractView from "../../../expert/contract/ExpertContractView.vue";

export default {
  name: "BDashboardShopExpert",
  components: { ExpertContractView },
  props: {
    shop: {
      required: true,
      type: Object,
    },

    timeSeries: {
      required: true,
      type: Object,
    },
    fullscreen: {
      default: false,
      type: Boolean,
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
  .contracts-panel {
    max-height: 840px;
    overflow-y: auto;
    background-image: linear-gradient(60deg, #1976d2, #1760a8);

    &.-fullscreen {
      max-height: none;
    }
  }
}
</style>
