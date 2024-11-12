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
    class="s--shop-dashboard-expert text-start pa-0 pa-sm-3"
  >
    <v-card
      class="thin-scroll"
      max-height="840"
      style="background-image: linear-gradient(60deg, #1976d2, #1760a8)"
      color="#1760a8"
      rounded="xl"
    >
      <v-card-title class="d-flex align-center">
        <v-icon class="me-1">emoji_food_beverage</v-icon>
        {{ $t("experts_common.expert_contracts") }}
        <v-spacer></v-spacer>
      </v-card-title>
      <v-card-text>
        <div class="border-between-vertical -dashed">
          <v-row
            v-for="contract in contracts"
            :key="contract.id"
            class="position-relative"
          >
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
                  class="ms-1"
                  size="small"
                  variant="outlined"
                  rounded
                  @click="showContract(contract)"
                >
                  <v-icon start>info</v-icon>
                  Show Contract
                </v-btn>
              </p>

              <div class="mb-2">
                <u-price
                  :amount="contract.cost"
                  :class="{ 'text-success': contract.settle_at }"
                  :currency="contract.currency"
                  class="flex-grow-1"
                  medium
                ></u-price>
              </div>

              <p v-if="contract.start_at" class="mb-1">
                <span class="me-1 small"
                  >{{ $t("global.commons.start_date") }}:</span
                >{{ getLocalDateString(contract.start_at) }}  ({{ getFromNowString(contract.start_at) }})
              </p>
              <v-chip v-if="!contract.payment_at && !contract.cancel_at" size="small">
                <v-icon start>hourglass_empty</v-icon>
                {{ $t("experts_common.waiting_pay_and_start") }}
              </v-chip>

              <p v-if="contract.end_at" class="mt-2">
                <span class="me-1 small"
                  >{{ $t("global.commons.end_date") }}:</span
                >{{ getLocalDateString(contract.end_at) }} ({{ getFromNowString(contract.end_at) }})

                <v-chip v-if="contract.end_at && !contract.complete_at" class="ms-2" size="small"
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
                color="#164f82"
                variant="flat"
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
        </div>

        <div v-if="!contracts || !contracts.length">
          {{ $t("experts_common.need_help") }}

          <v-btn :to="{ name: 'ExpertsPage' }" variant="text"
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
    <v-card v-if="selected_contract" rounded="xl" >
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
</style>
