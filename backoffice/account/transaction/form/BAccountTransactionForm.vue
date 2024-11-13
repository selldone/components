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

<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
  <v-container class="text-start" v-bind="$attrs">
    <u-pods-panel color="#fff">
      <u-pod-node is-selldone-icon title="This Wallet"></u-pod-node>
      <u-pod-wire forward></u-pod-wire>

      <u-pod-node is-selldone-icon title="Other Wallet"></u-pod-node>
    </u-pods-panel>

    <h4>{{ $t("transaction_form.title") }}:</h4>
    <p v-if="accountFrom" class="text-h4">
      {{ formatCard(account_from.account_number) }}
    </p>

    <b-account-input
      v-else
      v-model="account_from"
      :currency="currency?.code"
      :label="`${$t('transaction_form.from_input')}*`"
      :messages="$t('transaction_form.from_input_message')"
      class="m-2"
      return-object
      variant="underlined"
    />
    <!-- Account detail -->
    <v-expand-transition>
      <div v-if="account_from">
        <div class="text-center d-flex border-between my-3">
          <div class="p-1 flex-grow-1">
            <small class="d-block mb-1">{{
              $t("transaction_form.account_name")
            }}</small>
            {{ account_from.account_name }}
          </div>

          <div class="p-1 flex-grow-1">
            <small class="d-block mb-1">{{
              $t("transaction_form.currency")
            }}</small>
            {{ getCurrencyName(account_from.currency) }}
          </div>

          <div class="p-1 flex-grow-1">
            <small class="d-block mb-1">{{
              $t("transaction_form.free_balance")
            }}</small>

            <u-price
              :amount="account_from.balance - account_from.locked"
              :currency="currency?.code"
            >
            </u-price>
          </div>
        </div>
      </div>
    </v-expand-transition>

    <h4 class="mt-5">{{ $t("transaction_form.to") }}:</h4>

    <v-text-field
      v-model="account_to"
      v-mask="`####-####-####-####`"
      color="primary"
      :disabled="!!receipt"
      :error="account_to_error"
      :label="`${$t('transaction_form.to_input')}*`"
      :messages="account_to_message"
      persistent-placeholder
      placeholder="####-####-####-####"
      variant="underlined"
    >
      <template v-slot:append-inner>
        <div class="d-flex align-center single-line">
          <v-slide-y-transition group leave-absolute>
            <div v-if="account_to_user_id" class="mx-1 small">
              <v-avatar
                class="avatar-gradient -thin -user mx-1"
                size="26"
                style="vertical-align: middle"
              >
                <v-img :src="getUserAvatar(account_to_user_id)" />
              </v-avatar>
              <span>
                {{ account_to_user_name }}
              </span>
            </div>

            <v-icon
              v-if="account_to_success"
              class="ms-1"
              color="green"
              size="20"
              >check_circle
            </v-icon>

            <v-progress-circular
              v-if="account_to_loading"
              class="ms-1"
              color="info"
              indeterminate
              size="24"
            />
          </v-slide-y-transition>
        </div>
      </template>
    </v-text-field>

    <u-price-input
      v-model="amount"
      :currency="account_to_currency"
      :disabled="!!receipt"
      :label="`${$t('transaction_form.amount')}*`"
      :outlined="false"
      class="mt-3"
      required
      variant="underlined"
    >
    </u-price-input>

    <h4 class="mt-5">
      {{ $t("transaction_form.receipt_title") }}:
      <small>{{ $t("global.commons.optional") }}</small>
    </h4>

    <v-text-field
      v-model="receipt_number"
      :counter="12"
      :disabled="!!receiptNumber"
      :error="receipt_error"
      :label="$t('transaction_form.receipt_input')"
      :messages="receipt_message"
      persistent-placeholder
      placeholder="############"
      variant="underlined"
    >
      <template v-slot:prepend-inner>
        <div class="d-flex align-center single-line">
          <v-fade-transition group leave-absolute>
            <v-icon v-if="receipt_success" class="me-1" color="green" size="20"
              >check_circle
            </v-icon>
            <v-progress-circular
              v-if="receipt_loading"
              color="info"
              indeterminate
              size="24"
            />
          </v-fade-transition>
          <v-icon v-if="receipt && receipt.status !== 'Unpaid'" color="red">
            fa:fas fa-exclamation-circle
          </v-icon>
        </div>
      </template>
    </v-text-field>
    <div v-if="receipt" class="text-start mt-3">
      <p v-if="receipt.status !== 'Unpaid'" class="text-danger">
        <i class="fas fa-exclamation-circle" />

        <span v-if="receipt.status === 'Paid'">
          {{ $t("transaction_form.paid_status") }}
        </span>
        <span v-else-if="receipt.status === 'Canceled'" class="text-danger">
          {{ $t("transaction_form.paid_canceled") }}
        </span>
      </p>

      <p>
        <small>{{ $t("transaction_form.description") }} : </small>
        {{ receipt.description }}
      </p>
      <p>
        <small>{{ $t("transaction_form.created_at") }} : </small>
        {{ getLocalTimeString(receipt.created_at) }}
      </p>

      <p>
        <small>{{ $t("transaction_form.duration") }} : </small>
        <span v-if="receipt.duration">{{
          getLocalTimeStringAddedSeconds(receipt.created_at, receipt.duration)
        }}</span>
        <span v-else> {{ $t("transaction_form.unlimited") }} </span>
      </p>
    </div>

    <!-- ====== Description ===== -->
    <div class="my-5">
      <v-fade-transition hide-on-leave>
        <v-btn
          v-if="!showDescriptionField"
          color="primary"
          size="small"
          variant="text"
          @click.stop="showDescriptionField = true"
        >
          <v-icon class="me-1" size="small"> edit</v-icon>
          {{ $t("transaction_form.add_note_action") }}
        </v-btn>
      </v-fade-transition>

      <v-slide-x-reverse-transition hide-on-leave>
        <div
          v-if="!showDescriptionField && description"
          class="small text-start m-0"
        >
          <small class="d-block mt-3"
            >{{ $t("transaction_form.note") }} :
          </small>
          <span v-html="description" />
        </div>
      </v-slide-x-reverse-transition>
      <v-expand-transition hide-on-leave>
        <div v-if="showDescriptionField">
          <v-textarea
            v-model="description"
            :label="$t('transaction_form.note')"
            :rows="3"
            auto-grow
            variant="underlined"
            @focusout="showDescriptionField = false"
          />
        </div>
      </v-expand-transition>
    </div>

    <!-- ====== Action ===== -->

    <s-widget-buttons auto-fixed-position>
      <v-btn
        :class="{ disabled: !canConfirmTransaction }"
        :disabled="!canConfirmTransaction"
        :loading="busy_createTransaction"
        color="primary"
        size="x-large"
        variant="elevated"
        @click="createTransaction"
      >
        {{ $t("transaction_form.transfer_action") }}

        <v-icon end>{{ $t("icons.chevron_next") }}</v-icon>
      </v-btn>
    </s-widget-buttons>
  </v-container>

  <!-- ========================== Transaction Confirm Dialog ========================== -->
  <v-bottom-sheet
    v-model="TransactionConfirmDialog"
    :width="640"
    max-width="98vw"
    content-class="rounded-t-xl overflow-hidden"
    opacity="0.9"
    scrollable
  >
    <v-card v-if="new_transaction_response" class="text-start" color="#fafafa">
      <v-card-title class="mb-2">
        <v-icon class="me-1" color="green">lock</v-icon>
        {{ $t("transaction_form.confirmation.title") }}
      </v-card-title>
      <v-card-subtitle class="text-wrap">
        <b>{{ $t("transaction_form.confirmation.subtitle") }}</b> |

        {{ $t("transaction_form.confirmation.message") }}
      </v-card-subtitle>
      <v-card-text class="position-relative">
        <img
          class="absolute-top-center mt-8 op-0-1"
          height="auto"
          src="./assets/transaction-flow.svg"
          style="max-width: 80%"
          width="320"
        />

        <div
          class="border -28px p-2 mt-2 mb-4 d-flex align-center text-start shadow-paper-small bg-white max-w-400 mx-auto z1"
          style="border-radius: 44px"
        >
          <v-avatar class="avatar-gradient -customer -thin me-2" size="64">
            <v-img :src="getUserAvatar(USER_ID())" />
          </v-avatar>

          <div class="d-flex flex-column flex-grow-1">
            <small>{{ $t("transaction_form.confirmation.from") }}</small>
            <b class="typo-body">{{
              formatCard(new_transaction_response.from)
            }}</b>
            <small>{{ new_transaction_response.account_from_name }}</small>
          </div>
        </div>

        <!--  Amount -->

        <div
          v-if="new_transaction_response.fee"
          class="mb-4 d-flex text-center"
        >
          <div class="p-1 flex-grow-1">
            <small class="d-block">{{
              $t("transaction_form.confirmation.amount")
            }}</small>

            <u-price
              :amount="new_transaction_response.amount"
              :currency="new_transaction_response.currency"
              >}
            </u-price>
          </div>

          <div class="p-1 flex-grow-1">
            <small class="d-block">{{
              $t("transaction_form.confirmation.fee")
            }}</small>

            <u-price
              :amount="new_transaction_response.fee"
              :currency="new_transaction_response.currency"
              >}
            </u-price>
          </div>
        </div>

        <div class="d-flex mb-4 align-center justify-center text-center z1">
          <!--  Total amount (amount + fee) -->
          <div class="mx-2">
            <u-price
              :amount="
                new_transaction_response.amount + new_transaction_response.fee
              "
              :currency="new_transaction_response.currency"
              class="text-h3 text-black"
              >}
            </u-price>
            <small class="d-block">{{
              $t("transaction_form.confirmation.total_pay")
            }}</small>
          </div>
        </div>

        <div
          class="border p-2 mb-4 d-flex align-center text-start shadow-paper-small bg-white max-w-400 mx-auto z1"
          style="border-radius: 44px"
        >
          <v-avatar
            v-if="new_transaction_response.to_user_id"
            class="avatar-gradient -thin me-2"
            size="64"
          >
            <v-img :src="getUserAvatar(new_transaction_response.to_user_id)" />
          </v-avatar>
          <div class="d-flex flex-column flex-grow-1">
            <small>{{ $t("transaction_form.confirmation.to") }}</small>

            <b class="typo-body">{{
              formatCard(new_transaction_response.to)
            }}</b>

            <div class="font-weight-bold">
              {{ new_transaction_response.to_user_name }}
            </div>
          </div>
        </div>

        <div v-if="receipt" class="z1">
          <small class="d-block">
            {{ $t("transaction_form.confirmation.receipt") }}</small
          >

          <div class="font-weight-black">
            {{ new_transaction_response.receipt }}
          </div>

          <div class="text-success small">{{ receipt.description }}</div>
        </div>

        <div v-if="new_transaction_response.description">
          <small class="d-block">
            {{ $t("transaction_form.confirmation.description") }}</small
          >

          <b>{{ new_transaction_response.description }}</b>
        </div>
      </v-card-text>

      <v-card-actions>
        <div class="widget-buttons">
          <v-btn
            :loading="busy_confirmTransaction"
            color="#0062cc"
            size="x-large"
            variant="elevated"
            @click="confirmTransaction"
          >
            <v-icon start>check_circle</v-icon>
            {{ $t("transaction_form.confirmation.accept_action") }}
          </v-btn>
        </div>
      </v-card-actions>
    </v-card>
  </v-bottom-sheet>
</template>

<script lang="ts">
import UPriceInput from "../../../../ui/price/input/UPriceInput.vue";
import BAccountInput from "../../../account/input/BAccountInput.vue";
import UPodWire from "../../../../ui/pod/wire/UPodWire.vue";
import UPodsPanel from "../../../../ui/pod/panel/UPodsPanel.vue";
import UPodNode from "../../../../ui/pod/node/UPodNode.vue";
import { throttle } from "lodash-es";
import SWidgetButtons from "../../../../ui/widget/buttons/SWidgetButtons.vue";
import DateMixin from "@selldone/components-vue/mixin/date/DateMixin.ts";
import CurrencyMixin from "@selldone/components-vue/mixin/currency/CurrencyMixin.ts";
import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";


export default {
  name: "BAccountTransactionForm",
  mixins: [DateMixin, CurrencyMixin ],
  components: {
    SWidgetButtons,
    UPodNode,
    UPodsPanel,
    UPodWire,
    BAccountInput,
    UPriceInput,
  },

  props: {
    accountFrom: {
      required: false,
      type: Object,
    },

    receiptNumber: {
      required: false,
      type: String,
    },
  },

  data: () => ({
    description: "",

    account_from: null,
    amount: 0,
    account_to: "",
    receipt_number: "",

    account_to_success: false,
    account_to_error: false,
    account_to_loading: false,
    account_to_message: "",
    account_to_currency: null,

    account_to_user_id: null,
    account_to_user_name: null,

    //-------------------------------
    receipt_success: false,
    receipt_error: false,
    receipt_loading: false,
    receipt_message: "",
    receipt: null,

    //-------------------------------
    new_transaction_response: null,
    TransactionConfirmDialog: false,

    //-------------------------------
    showDescriptionField: false,

    busy_createTransaction: false,
    busy_confirmTransaction: false,
  }),
  computed: {
    currency() {
      if (this.accountFrom) return this.GetCurrency(this.accountFrom.currency);
      if (this.receipt) return this.GetCurrency(this.receipt.currency);

      if (this.account_to_currency)
        return this.GetCurrency(this.account_to_currency);
      if (this.account_from)
        return this.GetCurrency(this.account_from.currency);

      return null;
    },

    canConfirmTransaction() {
      return (
        this.account_to &&
        this.account_to_success &&
        this.amount > 0 &&
        this.account_from &&
        (!this.receipt_number ||
          (this.receipt && this.receipt.status === "Unpaid"))
      );
    },
  },

  watch: {
    account_from: throttle(function (newVal, oldVal) {
      if (this.account_to) this.checkToAccountInfo();
    }, 1000),

    account_to: throttle(function (newVal, oldVal) {
      this.checkToAccountInfo();
    }, 1000),

    receipt_number: throttle(function (newVal, oldVal) {
      this.checkReceiptInfo();
    }, 1000),

    TransactionConfirmDialog(val) {
      this.BlurApp(val);
    },
  },
  created() {
    this.account_from = this.accountFrom;

    if (this.receiptNumber) {
      this.receipt_number = this.receiptNumber;
      this.checkReceiptInfo();
    }
  },

  methods: {
    checkToAccountInfo() {
      this.account_to_success = false;
      this.account_to_error = false;
      this.account_to_user_id = null;
      this.account_to_currency = null;

      if (this.account_to.length !== 19) {
        this.account_to_message = this.$t(
          "transaction_form.enter_account_number",
        );
        return;
      }
      let t = this;

      this.account_to_loading = true;

      axios
        .get(window.API.GET_CHECK_ACCOUNT_NUMBER(this.account_to))
        .then(({ data }) => {
          if (!data.error) {
            if (
              this.account_from &&
              data.currency !== this.account_from.currency
            ) {
              this.account_to_error = true;
              this.account_to_message = this.$t(
                "transaction_form.currency_not_match",
              );
              return;
            }

            this.account_to_success = true;
            this.account_to_message = this.$t(
              "transaction_form.account_number_is_valid",
            );
            this.account_to_user_id = data.user_id;
            this.account_to_user_name = data.user_name;
            this.account_to_currency = data.currency;
          } else {
            this.account_to_error = true;
            this.account_to_message = this.$t(
              "transaction_form.account_number_not_valid",
            );
          }
        })
        .catch((error) => {
          t.showLaravelError(error);
        })
        .finally(() => {
          this.account_to_loading = false;
        });
    },

    checkReceiptInfo() {
      this.receipt_success = false;
      this.receipt_error = false;
      this.receipt_loading = null;
      this.receipt = null;

      if (this.receipt_number.length !== 12) {
        this.receipt_message = this.$t("transaction_form.enter_account_number");
        return;
      }
      let t = this;

      this.receipt_loading = true;

      axios
        .get(window.API.GET_CHECK_RECEIPT_NUMBER(this.receipt_number))
        .then(({ data }) => {
          if (!data.error) {
            if (this.accountFrom && data.receipt.currency !== this.currency) {
              this.receipt_error = true;
              this.receipt_message = this.$t(
                "transaction_form.currency_not_match",
              );
              return;
            }
            this.receipt_success = true;
            this.receipt_message = this.$t("transaction_form.receipt_is_valid");
            this.receipt = data.receipt;
            this.amount = data.receipt.amount;
            this.account_to = data.receipt.account.account_number;
          } else {
            this.receipt_error = true;
            this.receipt_message = this.$t(
              "transaction_form.receipt_not_valid",
            );
          }
        })
        .catch((error) => {
          t.showLaravelError(error);
        })
        .finally(() => {
          this.receipt_loading = false;
        });
    },

    createTransaction() {
      this.busy_createTransaction = true;
      this.new_transaction_response = null;
      let t = this;
      axios
        .post(window.API.POST_CREATE_NEW_TRANSACTION(), {
          from: this.account_from.account_number,
          to: this.account_to.replace(/-/g, ""),
          amount: this.amount,
          receipt_number: this.receipt_number,
          description: this.description,
        })
        .then(({ data }) => {
          if (!data.error) {
            this.new_transaction_response = data;

            this.$nextTick(() => {
              this.TransactionConfirmDialog = true;
            });
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_createTransaction = false;
        });
    },

    confirmTransaction() {
      if (!this.new_transaction_response) return;

      this.busy_confirmTransaction = true;

      let t = this;
      axios
        .post(window.API.POST_CONFIRM_TRANSACTION(), {
          from: this.account_from.account_number,
          to: this.account_to.replace(/-/g, ""),
          amount: this.amount,
          receipt_number: this.receipt_number,
          description: this.description,
          data: this.new_transaction_response.data,
        })
        .then(({ data }) => {
          if (!data.error) {
            this.TransactionConfirmDialog = false;

            NotificationService.showSuccessAlert(
              null,
              this.$t("transaction_form.notifications.confirm_success"),
            );

            t.$router.push({
              name: "BPageAccountTransactions",
              params: { account_number: this.account_from.account_number },
              query: { transaction_number: data.transaction.number },
            });
            t.$emit("completed");
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          console.error(error);

          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_confirmTransaction = false;
        });
    },
  },
};
</script>

<style lang="scss" scoped>
.large-text {
  font-size: 1.4rem;
}
</style>
