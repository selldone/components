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
  <div class="text-start">
    <div v-if="contract">
      <div v-if="in_execution" class="absolute-top-start px-2">
        <v-icon class="me-1" color="green" size="x-small">lens</v-icon>
        {{ $t("contract_view.running") }}
      </div>
      <div v-if="in_cancellation" class="absolute-top-start px-2">
        <v-icon class="me-1" color="red" size="x-small">lens</v-icon>
        {{ $t("contract_view.cancelling") }}
      </div>

      <v-row align="center" class="text-center" justify="center">
        <div>
          <v-avatar class="m-2" color="#fff" size="64">
            <v-img
              :src="
                expert.image
                  ? getShopImagePath(expert.image)
                  : getUserAvatar(expert.user_id)
              "
            />
          </v-avatar>
          <p class="small font-weight-bold m-1 limited-text-100px">
            {{ expert.name }}
          </p>
        </div>
        <img
          class="mx-2 mb-6"
          height="16"
          src="../../../assets/icons/wire.svg"
          width="16"
        />
        <div>
          <v-avatar class="m-2" color="#fff" size="64">
            <v-img :src="getUserAvatar(contract.user_id)" />
          </v-avatar>
          <p class="small font-weight-bold m-1 limited-text-100px">
            {{ user.name }}
          </p>
        </div>
        <img
          class="mx-2 mb-6"
          height="16"
          src="../../../assets/icons/wire.svg"
          width="16"
        />

        <div>
          <v-avatar class="m-2" color="#fff" size="64">
            <v-img :src="getShopIcon(contract.shop_id)" />
          </v-avatar>
          <p class="small font-weight-bold m-1 limited-text-100px">
            {{ shop.name }}
          </p>
        </div>
      </v-row>

      <!-- ......................... Title ......................... -->

      <small class="d-block">{{ $t("contract_view.title") }}:</small>
      <h2 v-if="!edit_mode" class="mb-5">
        {{ contract.title }}
      </h2>
      <v-text-field
        v-else
        v-model="new_title"
        flat
        hide-details
        variant="outlined"
      >
      </v-text-field>

      <!-- ......................... Description ......................... -->

      <small class="d-block">{{ $t("contract_view.description") }}:</small>

      <p v-if="!edit_mode" v-html="smartConvert(contract.description)"></p>
      <v-textarea
        v-else
        v-model="new_description"
        auto-grow
        flat
        hide-details
        variant="outlined"
      >
      </v-textarea>

      <!-- ......................... Tasks ......................... -->

      <p :data-content="$t('global.commons.tasks')" class="hr-text my-5"></p>

      <template v-if="!edit_mode">
        <div v-for="(task, index) in tasks" :key="index" class="my-2 pb-1">
          <p class="font-weight-bold mb-1">
            <v-icon
              class="me-1"
              size="small"
              @click="
                () => {
                  if (can_set_progress) {
                    task.progress = 100;
                    setProgress();
                  }
                }
              "
              >{{
                task.progress > 99
                  ? "check_circle_outline"
                  : "panorama_fish_eye"
              }}
            </v-icon>
            {{ task.title }}
          </p>

          <v-progress-linear
            v-model="task.progress"
            :class="{
              'pointer-pointer': can_set_progress,
              'pointer-event-none': !can_set_progress,
            }"
            :color="task.progress > 99 ? 'green' : 'blue'"
            :reverse="$vuetify.locale.isRtl"
            bg-color="#eee"
            class="my-2"
            height="18"
            rounded
            striped
            @update:model-value="setProgress()"
          >
          </v-progress-linear>
        </div>
      </template>

      <u-tasks-editor v-else v-model="new_tasks" editable>
      </u-tasks-editor>

      <!-- ......................... Permissions ......................... -->

      <p
        :data-content="$t('global.commons.permissions')"
        class="hr-text my-5"
      ></p>

      <v-table v-if="!edit_mode" dense>
        <template v-slot:default>
          <tbody>
            <tr v-for="permission in permissions" :key="permission.code">
              <td class="text-start">
                <img
                  :src="ShopPermissions[permission.code].src"
                  class="float-start me-2 my-2"
                  height="24"
                  width="24"
                />
                <b class="d-block">{{
                  $t(ShopPermissions[permission.code].text)
                }}</b>
                <span class="small">{{
                  $t(ShopPermissions[permission.code].description)
                }}</span>
              </td>

              <td class="text-center">
                <u-check
                  v-if="!can_edit_permissions"
                  :class="{ disabled: !contract.start_at }"
                  :model-value="!!permission.grant_at"
                  class="me-1"
                  read-only
                ></u-check>

                <v-btn
                  v-else
                  :loading="busy_permission === permission.code"
                  class="me-1"
                  variant="text"
                  @click="setPermission(permission, !permission.grant_at)"
                >
                  <u-check
                    :model-value="!!permission.grant_at"
                    class="me-1"
                  ></u-check>
                  {{
                    permission.grant_at
                      ? $t("global.commons.granted")
                      : $t("global.commons.deny")
                  }}
                </v-btn>

                <small class="d-block">{{
                  getLocalTimeString(permission.grant_at)
                }}</small>
              </td>
            </tr>
          </tbody>
        </template>
      </v-table>
      <b-permission-input
        v-if="edit_mode"
        v-model="new_permissions"
        :label="$t('contract_view.permissions_input')"
        :return-object="false"
        class="mt-3"
        multiple
        outlined
      ></b-permission-input>

      <div class="widget-buttons">
        <v-btn
          v-if="edit_mode"
          :loading="busy_save"
          color="success"
          size="x-large"
          @click="saveEdit()"
        >
          <v-icon start>save</v-icon>
          {{ $t("global.actions.save") }}
        </v-btn>
      </div>

      <!-- ......................... Days & Cost ......................... -->

      <p
        :data-content="$t('contract_view.cost_timeline')"
        class="hr-text my-5"
      ></p>

      <v-row>
        <v-col cols="12" sm="6">
          <small class="d-block">{{ $t("global.commons.timespan") }}:</small>
          <p v-if="!edit_mode">
            <span class="text-h3 me-1 font-weight-bold">{{
              contract.days
            }}</span>
            {{ $t("global.commons.day") }}
          </p>

          <u-number-input
            v-else
            v-model="new_days"
            :max="365"
            :min="1"
            :suffix="$t('global.commons.days')"
            flat
            outlined
            solo
          >
          </u-number-input>
        </v-col>
        <v-col cols="12" sm="6">
          <small class="d-block">{{ $t("global.commons.cost") }}:</small>
          <u-price
            v-if="!edit_mode"
            :amount="contract.cost"
            :currency="contract.currency"
            class="text-h3"
          ></u-price>
          <u-price-input
            v-else
            v-model="new_cost"
            :currency="contract.currency"
            flat
            outlined
            solo
          >
          </u-price-input>
        </v-col>
      </v-row>

      <!-- ......................... Customer Actions ......................... -->
      <v-expand-transition class="mb-3">
        <!-- Start Task -->

        <v-btn
          v-if="can_start"
          color="blue"
          size="x-large"
          @click="dialog_pay = true"
        >
          {{ $t("contract_view.pay_now_action") }}

          <u-price
            :amount="contract.cost"
            :currency="contract.currency"
          ></u-price>
        </v-btn>

        <!-- Complete Task -->

        <div v-else-if="can_complete">
          <v-btn
            :loading="busy_complete === 'yes'"
            class="m-1"
            color="success"
            size="x-large"
            @click="completeContract(true)"
          >
            {{ $t("contract_view.complete_action") }}
          </v-btn>
          <v-btn
            :loading="busy_complete === 'no'"
            class="m-1"
            color="red"
            variant="text"
            @click="completeContract(false)"
          >
            {{ $t("contract_view.reject_action") }}
          </v-btn>
        </div>
      </v-expand-transition>

      <!-- ......................... Expert Actions ......................... -->

      <v-expand-transition class="mb-3">
        <!-- End Task -->

        <div v-if="can_end">
          <p>
            {{ $t("contract_view.all_tasks_completed_message") }}
          </p>
          <v-btn
            :loading="busy_end"
            color="blue"
            size="x-large"
            @click="endContract()"
          >
            Complete tasks
          </v-btn>
        </div>
        <div v-else-if="waiting_complete_by_customer">
          <p>
            {{ $t("contract_view.waiting_complete_by_customer_message") }}
          </p>
        </div>
      </v-expand-transition>

      <!-- ......................... Rate & Comment ......................... -->
      <v-expand-transition>
        <div v-if="can_rate && (no_comment_rate || edit_rate)">
          <p class="mb-1 font-weight-bold">{{ $t("contract_view.comment") }}</p>
          <p>{{ $t("contract_view.comment_desc") }}</p>
          <v-rating
            v-model="rate"
            color="grey-darken-1"
            class="inline-block mb-2"
            active-color="yellow-darken-3"
          ></v-rating>
          <v-textarea
            v-model="comment"
            :placeholder="$t('contract_view.comment_placeholder')"
            auto-grow
            label="Comment"
            rounded
            variant="filled"
          >
          </v-textarea>

          <v-btn class="m-1" variant="text" @click="edit_rate = false"
            >{{ $t("global.actions.cancel") }}
          </v-btn>

          <v-btn
            :disabled="!rate"
            :loading="busy_comment"
            class="m-1"
            color="success"
            @click="sendComment()"
            >{{ $t("global.actions.send") }}
          </v-btn>
        </div>
        <div v-else-if="contract.start_at" class="mb-2">
          <!-- Edit button for customer after rate! -->
          <v-btn
            v-if="can_rate"
            class="me-2"
            icon
            @click="
              comment = contract.comment;
              rate = contract.rate;
              edit_rate = true;
            "
          >
            <v-icon size="small">edit_square</v-icon>
          </v-btn>

          <!-- Show rating only for started contract -->
          <v-rating
            :model-value="contract.rate"
            color="grey-darken-1"
            class="inline-block"
            active-color="yellow-darken-3"
            readonly
          ></v-rating>

          <p v-if="contract.comment" class="card-text-normal">
            <v-avatar class="me-1" size="24">
              <img :src="getUserAvatar(contract.user_id)" />
            </v-avatar>
            <span v-html="smartConvert(contract.comment)"></span>
          </p>
        </div>
      </v-expand-transition>
      <!-- Response to comment by expert -->

      <v-expand-transition>
        <div v-if="can_response && (!contract.response || edit_response)">
          <v-textarea
            v-model="response"
            :placeholder="$t('contract_view.response_placeholder')"
            auto-grow
            bg-color="bisque"
            label="Response"
            rounded
            variant="filled"
          >
          </v-textarea>

          <v-btn class="m-1" variant="text" @click="edit_response = false"
            >{{ $t("global.actions.cancel") }}
          </v-btn>
          <v-btn
            :disabled="!response"
            :loading="busy_response"
            class="m-1"
            color="success"
            @click="sendResponse()"
            >{{ $t("global.actions.send") }}
          </v-btn>
        </div>
        <div v-if="contract.response && !edit_response" class="response-box">
          <v-btn
            v-if="can_response"
            class="float-end ms-2"
            icon
            @click="
              response = contract.response;
              edit_response = true;
            "
          >
            <v-icon size="small">edit_square</v-icon>
          </v-btn>

          <p v-if="contract.response" class="card-text-normal">
            <v-avatar class="me-1" size="24">
              <img
                :src="
                  expert.image
                    ? getShopImagePath(expert.image)
                    : getUserAvatar(expert.user_id)
                "
              />
            </v-avatar>

            <span v-html="smartConvert(contract.response)"></span>
          </p>
        </div>
      </v-expand-transition>

      <!-- Show waiting status to expert (Before start the contract by customer) -->
      <p
        v-if="
          isAdmin &&
          !contract.start_at &&
          !contract.end_at &&
          !contract.cancel_at
        "
        class="text-uppercase text-muted"
      >
        {{ $t("contract_view.waiting_for_customer") }}
      </p>

      <v-row>
        <v-col v-if="contract.start_at" class="flex-grow-1" cols="12" md="6">
          <small class="d-block">{{ $t("global.commons.start_date") }}</small>
          <p>{{ getLocalTimeString(contract.start_at) }}</p>
        </v-col>

        <v-col v-if="contract.end_at" class="flex-grow-1" cols="12" md="6">
          <small class="d-block">{{ $t("global.commons.finish_date") }}</small>
          <p>{{ getLocalTimeString(contract.end_at) }}</p>
        </v-col>

        <v-col v-if="contract.complete_at" class="flex-grow-1" cols="12" md="6">
          <small class="d-block">{{
            $t("global.commons.complete_date")
          }}</small>
          <p>{{ getLocalTimeString(contract.complete_at) }}</p>
        </v-col>

        <v-col v-if="contract.cancel_at" class="flex-grow-1" cols="12" md="6">
          <small class="d-block">{{ $t("global.commons.cancel_date") }}</small>
          <p>{{ getLocalTimeString(contract.cancel_at) }}</p>
        </v-col>

        <v-col
          v-if="isAdmin && contract.settle_at"
          class="flex-grow-1"
          cols="12"
          md="6"
        >
          <small class="d-block">{{ $t("global.commons.settle_date") }}</small>
          <p>{{ getLocalTimeString(contract.settle_at) }}</p>
        </v-col>
      </v-row>

      <!-- ......................... Header Absolute ......................... -->

      <v-progress-linear
        v-if="busy_progress"
        class="loader-to-bar"
        indeterminate
      ></v-progress-linear>

      <div v-if="contract.cancel_at" class="top-bar-red"></div>
      <div v-if="contract.complete_at" class="top-bar-green"></div>

      <div class="absolute-top-end">
        <!-- Cancel Task -->

        <v-btn
          v-if="can_cancel"
          :caption="$t('global.actions.cancel')"
          class="m-1 sub-caption -hover"
          color="red"
          icon
          @click="dialog_cancel = true"
        >
          <v-icon size="small">delete</v-icon>
        </v-btn>

        <b v-if="contract.cancel_at" class="small text-red"
          >{{ $t("global.commons.canceled") }}:
          {{ getLocalTimeString(contract.cancel_at) }}</b
        >

        <!-- Edit Task -->

        <v-btn
          v-if="can_edit"
          :caption="$t('global.actions.edit')"
          class="m-1 sub-caption -hover"
          icon
          @click="edit_mode = !edit_mode"
        >
          <v-icon size="small">edit_square</v-icon>
        </v-btn>
      </div>
    </div>

    <v-skeleton-loader
      v-else
      :type="['list-item-two-line','article', 'image']"
    ></v-skeleton-loader>

    <!-- ......................... Dialog > Payment ......................... -->

    <v-bottom-sheet
      v-if="!isAdmin"
      v-model="dialog_pay"
      dark
      inset
      max-width="840"
    >
      <v-card v-if="contract" :color="SaminColorDarkDeep">
        <v-card-title>{{ $t("contract_view.dialog_pay.title") }}</v-card-title>
        <v-card-text>
          <b-account-input
            v-model="account"
            :currency="currency"
            :label="$t('contract_view.account_input')"
            outlined
          ></b-account-input>

          <v-alert
            v-if="insufficient_balance > 0"
            border="start"
            density="compact"
            text
            type="error"
          >
            {{ $t("contract_view.dialog_pay.insufficient_balance") }}
          </v-alert>
        </v-card-text>
        <v-card-actions>
          <div class="widget-buttons">
            <v-btn
              v-if="insufficient_balance > 0"
              :to="{
                name: 'BPageAccountDeposit',
                params: { account_number: account.account_number },
                query: { charge: insufficient_balance },
              }"
              color="blue"
              size="x-large"
              variant="flat"
            >
              {{ $t("global.actions.charge") }}
              <u-price
                :amount="insufficient_balance"
                :currency="currency"
              ></u-price>
            </v-btn>

            <v-btn
              v-else
              :class="{ disabled: !can_pay }"
              :loading="busy_pay"
              color="success"
              size="x-large"
              variant="flat"
              @click="payNow"
            >
              {{ $t("global.actions.pay_now") }}
              <u-price
                :amount="contract.cost"
                :currency="currency"
              ></u-price>
            </v-btn>
          </div>
        </v-card-actions>
      </v-card>
    </v-bottom-sheet>

    <!-- ......................... Dialog > Cancel ......................... -->
    <v-dialog v-model="dialog_cancel" dark max-width="640" scrollable>
      <v-card color="red" dark>
        <v-card-title
          >{{ $t("contract_view.dialog_cancel.title") }}
        </v-card-title>
        <v-card-text class="text-start">
          <p>
            {{ $t("contract_view.dialog_cancel.confirm_code") }}
            :
            <span class="text-h4">{{ confirm_code_ref }}</span>
          </p>
          <v-text-field
            v-model="confirm_code"
            :label="$t('contract_view.dialog_cancel.confirm_code_label')"
            placeholder="XXXXX"
            variant="filled"
          ></v-text-field>
        </v-card-text>
        <v-card-actions>
          <div class="widget-buttons">
            <v-btn size="x-large" variant="text" @click="dialog_cancel = false">
              <v-icon start>close</v-icon>
              {{ $t("global.actions.close") }}
            </v-btn>
            <v-btn
              :disabled="confirm_code !== confirm_code_ref"
              :loading="busy_cancel"
              color="red"
              size="x-large"
              @click="cancelContract()"
            >
              <v-icon class="me-1">check</v-icon>
              {{ $t("contract_view.dialog_cancel.confirm_action") }}
            </v-btn>
          </div>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { SmartConvertTextToHtml } from "@selldone/core-js/helper/html/HtmlHelper";

import { ShopPermissions } from "@selldone/core-js/enums/permission/ShopPermissions";
import _ from "lodash-es";
import BPermissionInput from "../../permission/input/BPermissionInput.vue";
import BAccountInput from "../../account/input/BAccountInput.vue";
import UNumberInput from "../../../ui/number/input/UNumberInput.vue";
import UTasksEditor from "../../../ui/task/editor/UTasksEditor.vue";
import UPriceInput from "../../../ui/price/input/UPriceInput.vue";

export default {
  name: "ExpertContractView",
  components: {
    BPermissionInput,
    BAccountInput,
    UNumberInput,
    UTasksEditor,
    UPriceInput,
  },
  props: {
    contractId: {
      require: true,
    },
    preLoadContract: {
      require: false,
      type: Object,
    },

    isAdmin: {
      type: Boolean,
      default: false,
    },
  },

  data: () => ({
    ShopPermissions: ShopPermissions,

    contract: null,
    busy_fetch: false,

    //---------------------
    rate: 0,
    comment: null,
    busy_comment: false,
    edit_rate: false,

    //---------------------
    response: null,
    busy_response: false,
    edit_response: false,

    //---------------------
    busy_progress: false,

    //---------------------
    edit_mode: false,
    new_cost: 0,
    new_title: "",
    new_description: "",
    busy_save: false,
    new_tasks: [],
    new_days: 0,
    new_permissions: [],

    //---------------------
    dialog_pay: false,
    account: null,
    busy_pay: false,
    //---------------------
    dialog_cancel: false,
    confirm_code: null,
    confirm_code_ref: null,
    busy_cancel: false,

    //---------------------
    busy_end: false,
    busy_complete: null,
    //---------------------
    busy_permission: null,
  }),

  computed: {
    expert() {
      return this.contract.expert;
    },
    user() {
      return this.contract.user;
    },
    shop() {
      return this.contract.shop;
    },
    tasks() {
      return this.contract.tasks;
    },
    permissions() {
      return this.contract.permissions;
    },

    is_start() {
      return !!this.contract && this.contract.start_at;
    },

    is_completed() {
      return !!this.contract && this.contract.complete_at;
    },

    can_rate() {
      return !this.isAdmin && this.is_completed;
    },
    no_comment_rate() {
      return !this.contract.rate && !this.contract.comment;
    },
    can_response() {
      return this.isAdmin && !!this.contract.comment;
    },

    can_edit() {
      return this.isAdmin && !this.is_start;
    },
    can_set_progress() {
      return this.isAdmin && this.contract && !this.is_completed;
    },

    can_start() {
      return (
        !this.isAdmin && !this.contract.start_at && !this.contract.cancel_at
      );
    },

    can_complete() {
      return (
        !this.isAdmin && this.contract.end_at && !this.contract.complete_at
      );
    },
    currency() {
      if (!this.contract) return null;
      return this.contract.currency;
    },

    insufficient_balance() {
      if (!this.account) return 0;
      return this.contract.cost - (this.account.balance - this.account.locked);
    },

    can_pay() {
      return (
        this.account &&
        this.account.balance - this.account.locked >= this.contract.cost
      );
    },

    in_execution() {
      return (
        this.contract &&
        this.contract.start_at &&
        !this.contract.end_at &&
        !this.contract.cancel_at
      );
    },
    in_cancellation() {
      return (
        this.contract &&
        this.contract.start_at &&
        !this.contract.end_at &&
        this.contract.cancel_at
      );
    },
    all_tasks_completed() {
      return !this.tasks.some((task) => task.progress < 100);
    },
    can_end() {
      return (
        this.isAdmin &&
        this.all_tasks_completed &&
        !this.contract.end_at &&
        !this.contract.complete_at
      );
    },
    waiting_complete_by_customer() {
      return (
        this.isAdmin &&
        this.all_tasks_completed &&
        this.contract.end_at &&
        !this.contract.complete_at
      );
    },

    can_cancel() {
      return (
        this.isAdmin && !this.contract.complete_at && !this.contract.cancel_at
      );
    },

    can_edit_permissions() {
      return (
        !this.isAdmin &&
        this.contract.start_at &&
        !this.contract.complete_at &&
        !this.contract.cancel_at
      );
    },
  },

  watch: {
    contractId() {
      this.getContractInfo();
    },
    preLoadContract() {
      this.getContractInfo();
    },

    dialog_cancel() {
      this.confirm_code_ref = "" + (10000 + Math.floor(Math.random() * 99999));
    },
  },

  created() {
    this.getContractInfo();
  },

  methods: {
    loadEditForm() {
      //---------- For edit mode ---------
      this.new_cost = this.contract.cost;
      this.new_title = this.contract.title;
      this.new_description = this.contract.description;
      this.new_tasks = this.contract.tasks;
      this.new_days = this.contract.days;
      this.new_permissions =
        this.contract.permissions && Array.isArray(this.contract.permissions)
          ? this.contract.permissions.map((a) => a.code)
          : [];
    },
    // ――――――――――――――― Get Contract ―――――――――――――――

    getContractInfo() {
      if (this.preLoadContract) {
        this.contract = this.preLoadContract;

        this.edit_rate = false;
        this.rate = 0;
        this.comment = "";

        this.edit_response = false;
        this.response = null;

        this.loadEditForm();

        return;
      }
      this.busy_fetch = true;
      this.contract = null;
      axios
        .get(
          this.isAdmin
            ? window.API.GET_EXPERT_JOB_CONTRACT_INFO(this.contractId)
            : window.API.GET_EXPERT_CUSTOMER_CONTRACT_INFO(this.contractId),
        )
        .then(({ data }) => {
          if (!data.error) {
            this.contract = data.contract;
            this.loadEditForm();
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {})
        .finally(() => {
          this.busy_fetch = false;
        });
    },
    smartConvert(message) {
      return SmartConvertTextToHtml(message, true);
    },

    setProgress: _.throttle(function () {
      this.setProgressNow();
    }, 2000),

    // ――――――――――――――― Set Contract Task Progress (by expert) ―――――――――――――――

    setProgressNow() {
      this.busy_progress = true;
      axios
        .put(window.API.PUT_EXPERT_JOB_CONTRACT_SET_TASKS(this.contractId), {
          tasks: this.tasks,
        })
        .then(({ data }) => {
          if (!data.error) {
            this.contract.tasks = data.tasks;
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_progress = false;
        });
    },
    // ――――――――――――――― Edit Contract (by expert) ―――――――――――――――

    saveEdit() {
      this.busy_save = true;
      axios
        .put(window.API.PUT_EXPERT_JOB_CONTRACT_EDIT(this.contractId), {
          cost: this.new_cost,
          title: this.new_title,
          description: this.new_description,
          tasks: this.new_tasks,
          days: this.new_days,
          permissions: this.new_permissions,
        })
        .then(({ data }) => {
          if (!data.error) {
            this.contract.cost = data.contract.cost;
            this.contract.title = data.contract.title;
            this.contract.description = data.contract.description;
            this.contract.tasks = data.contract.tasks;
            this.contract.days = data.contract.days;
            this.contract.permissions = data.contract.permissions;

            this.$emit("update:contract", this.contract);
            this.showSuccessAlert(
              null,
              this.$t("contract_view.notifications.save"),
            );

            this.edit_mode = false;
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_save = false;
        });
    },
    // ――――――――――――――― Pay Contract (by customer) ―――――――――――――――

    payNow() {
      this.busy_pay = true;
      axios
        .post(
          window.API.POST_EXPERT_CUSTOMER_CONTRACT_PAY_NOW(this.contractId),
          {
            account_number: this.account.account_number,
          },
        )
        .then(({ data }) => {
          if (!data.error) {
            this.contract.start_at = data.contract.start_at;
            this.contract.permissions = data.contract.permissions;

            this.$emit("update:contract", this.contract);
            this.showSuccessAlert(
              null,
              this.$t("contract_view.notifications.pay"),
            );

            this.dialog_pay = false;
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_pay = false;
        });
    },
    // ――――――――――――――― End Contract (by expert) ―――――――――――――――

    endContract() {
      this.busy_end = true;
      axios
        .post(window.API.POST_EXPERT_JOB_CONTRACT_END(this.contractId))
        .then(({ data }) => {
          if (!data.error) {
            this.contract.end_at = data.contract.end_at;

            this.$emit("update:contract", this.contract);
            this.showSuccessAlert(
              null,
              this.$t("contract_view.notifications.end"),
            );
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_end = false;
        });
    },

    // ――――――――――――――― Complete Contract (by customer) ―――――――――――――――

    completeContract(accept) {
      this.busy_complete = accept ? "yes" : "no";
      axios
        .post(
          window.API.POST_EXPERT_CUSTOMER_CONTRACT_COMPLETE(this.contractId),
          {
            accept: accept,
          },
        )
        .then(({ data }) => {
          if (!data.error) {
            this.contract.complete_at = data.contract.complete_at;
            this.contract.end_at = data.contract.end_at;
            this.contract.permissions = data.contract.permissions;

            this.$emit("update:contract", this.contract);

            this.showSuccessAlert(
              null,
              accept
                ? this.$t("contract_view.notifications.complete")
                : this.$t("contract_view.notifications.reject"),
            );
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_complete = null;
        });
    },
    // ――――――――――――――― Cancel Contract (by expert) ―――――――――――――――
    cancelContract() {
      this.busy_cancel = true;
      axios
        .post(window.API.POST_EXPERT_JOB_CONTRACT_CANCEL(this.contractId))
        .then(({ data }) => {
          if (!data.error) {
            this.contract.cancel_at = data.contract.cancel_at;

            this.$emit("update:contract", this.contract);

            this.showSuccessAlert(
              null,
              this.$t("contract_view.notifications.cancel"),
            );

            this.dialog_cancel = false;
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_cancel = null;
        });
    },

    // ――――――――――――――― Cancel Contract (by customer) ―――――――――――――――

    setPermission(permission, grant) {
      this.busy_permission = permission.code;
      axios
        .post(
          window.API.POST_EXPERT_CUSTOMER_CONTRACT_PERMISSION(this.contractId),
          {
            permission: permission.code,
            grant: grant,
          },
        )
        .then(({ data }) => {
          if (!data.error) {
            this.contract.permissions = data.contract.permissions;

            this.$emit("update:contract", this.contract);

            this.showSuccessAlert(
              null,
              this.$t("contract_view.notifications.update"),
            );
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_permission = null;
        });
    },

    // ――――――――――――――― Comment (by customer) ―――――――――――――――

    sendComment() {
      this.busy_comment = true;
      axios
        .post(
          window.API.POST_EXPERT_CUSTOMER_CONTRACT_COMMENT(this.contractId),
          {
            comment: this.comment,
            rate: this.rate,
          },
        )
        .then(({ data }) => {
          if (!data.error) {
            this.contract.comment = data.contract.comment;
            this.contract.rate = data.contract.rate;

            this.$emit("update:contract", this.contract);

            this.showSuccessAlert(
              null,
              this.$t("contract_view.notifications.comment"),
            );
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_comment = null;
        });
    },
    // ――――――――――――――― Response to comment (by expert) ―――――――――――――――

    sendResponse() {
      this.busy_response = true;
      axios
        .post(window.API.POST_EXPERT_JOB_CONTRACT_RESPONSE(this.contractId), {
          response: this.response,
        })
        .then(({ data }) => {
          if (!data.error) {
            this.contract.response = data.contract.response;

            this.$emit("update:contract", this.contract);

            this.showSuccessAlert(
              null,
              this.$t("contract_view.notifications.response"),
            );
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_response = null;
        });
    },
  },
};
</script>

<style lang="scss" scoped>
.top-bar-red,
.top-bar-green {
  position: absolute;
  left: 0;
  width: 100%;
  height: 4px;
  top: 0;
}

.top-bar-red {
  background-color: orangered;
}

.top-bar-green {
  background-color: yellowgreen;
}

.response-box {
  background-color: bisque;
  color: #333;
  padding: 12px;
  border-radius: 8px;
  position: relative;
  margin: 8px;
}
</style>