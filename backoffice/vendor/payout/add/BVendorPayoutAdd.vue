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
  <v-card flat>
    <v-card-title></v-card-title>
    <v-card-text>
      <!-- ███████████████████████ Select vendor ███████████████████████ -->

      <div class="widget-box mb-5">
        <u-widget-header
          icon="store"
          :title="$t('vendor_payout_add.vendor.title')"
        ></u-widget-header>

        <v-list-subheader>
          {{ $t("vendor_payout_add.vendor.subtitle") }}
        </v-list-subheader>

        <!-- Visual fund flow -->
        <div class="text-center d-flex align-center justify-center" dir="ltr">
          <div class="min-width-100">
            <v-icon>wallet</v-icon>
            <small class="d-block">{{
              $t("vendor_payout_add.vendor_wallet")
            }}</small>
          </div>
          <v-icon class="mb-4">trending_flat</v-icon>
          <div class="min-width-100">
            <v-icon>account_balance</v-icon>
            <small class="d-block"
              >{{ $t("vendor_payout_add.vendor_bank_account") }}
            </small>
          </div>
        </div>

        <b-vendor-input
          v-model="vendor_id"
          :disabled="!!payment"
          :shop="shop"
          clearable
          :placeholder="$t('vendor_payout_add.inputs.vendor.placeholder')"
          @click:clear="vendor_id = null"
        ></b-vendor-input>

        <u-loading-progress v-if="busy_fetch"></u-loading-progress>

        <u-smart-select
          v-if="!payment"
          v-model="selected_option"
          :items="options"
          class="my-3"
          item-description="description"
          item-icon="icon"
          item-image="image"
          item-text="title"
          item-value="code"
        >
          <template v-slot:append-title="{ item }">
            <v-chip
              v-if="!item.livemode"
              class="mx-1 pa-1"
              color="amber"
              label
              size="x-small"
              variant="flat"
              >{{ $t("global.commons.debug") }}
            </v-chip>
          </template>
          <template v-slot:description="{ item }">
            <div v-if="item.balances?.length">
              <v-chip
                v-for="b in item.balances"
                :key="b.currency"
                class="me-2"
                color="#111"
                size="small"
                variant="flat"
              >
                <u-currency-icon
                  :currency="b.currency"
                  class="ms-n3"
                  flag-only
                  small
                ></u-currency-icon>
                <u-price :amount="b.amount" :currency="b.currency"></u-price>

                <v-tooltip
                  activator="parent"
                  content-class="bg-black text-start"
                  location="bottom"
                  max-width="320"
                >
                  <div class="d-flex align-center">
                    <v-img
                      :height="24"
                      :src="getShopImagePath(item.image)"
                      :width="24"
                      class="me-2"
                    ></v-img>
                    Available fund in your connected account.
                  </div>

                  <u-price
                    :amount="b.amount"
                    :currency="b.currency"
                    medium
                  ></u-price>

                  <u-currency-icon
                    :currency="b.currency"
                    class="ms-2 float-end"
                    flag
                  ></u-currency-icon>
                </v-tooltip>
              </v-chip>
            </div>
          </template>
        </u-smart-select>
        <v-btn
          v-if="!payment /*Not edit mode!*/"
          class="tnt"
          variant="text"
          @click="with_balance = !with_balance"
        >
          <v-icon
            :color="with_balance ? 'green' : null"
            class="me-1"
            size="x-small"
            >circle
          </v-icon>
          {{
            with_balance
              ? $t("vendor_payout_add.with_balance")
              : $t("vendor_payout_add.without_balance")
          }}

          <v-tooltip
            activator="parent"
            location="bottom"
            content-class="bg-black text-start"
            max-width="320"
          >
            {{ $t("vendor_payout_add.with_balance_tooltip") }}
          </v-tooltip>
        </v-btn>
      </div>
      <!-- ███████████████████████ Transfer Mode > Bank ███████████████████████ -->

      <div v-if="selected_option === 'bank'" class="widget-box mb-5">
        <u-widget-header
          icon="account_balance"
          :title="$t('vendor_payout_add.bank_transfer.title')"
        >
        </u-widget-header>

        <v-list-subheader>
          {{ $t("vendor_payout_add.bank_transfer.subtitle") }}
        </v-list-subheader>

        <u-pods-panel>
          <u-pod-node
            icon="business"
            :title="$t('global.commons.you')"
          ></u-pod-node>
          <u-pod-wire forward></u-pod-wire>
          <u-pod-node
            icon="account_balance"
            :title="$t('vendor_payout_add.vendor_bank')"
          ></u-pod-node>
        </u-pods-panel>

        <b-vendor-payout-bank-info
          v-if="selected_vendor"
          :vendor="selected_vendor"
          class="mt-2"
        ></b-vendor-payout-bank-info>
      </div>
      <!-- ███████████████████████ Transfer Mode > External services ███████████████████████ -->

      <div
        v-else-if="selected_option_obj && selected_vendor"
        class="widget-box mb-5"
      >
        <u-widget-header
          :src="getShopImagePath(selected_option_obj.image)"
          :title="selected_option_obj.title"
        >
        </u-widget-header>

        <v-list-subheader
          >{{ selected_option_obj.description }}
        </v-list-subheader>

        <u-pods-panel>
          <u-pod-node
            icon="business"
            :title="$t('global.commons.you')"
          ></u-pod-node>
          <u-pod-wire forward></u-pod-wire>
          <u-pod-node
            :icon="selected_option_obj.icon"
            :image="selected_option_obj.image"
            :title="`${$t('global.commons.vendor')} ${selected_option_obj.title}`"
          >
          </u-pod-node>
        </u-pods-panel>

        <v-list-subheader v-if="!selected_option_obj.livemode">
          <v-icon class="me-1" color="orange">warning</v-icon>
          {{ $t("vendor_payout_add.gateway_in_debug_mode_warning") }}
        </v-list-subheader>

        <u-text-value-box
          v-for="b in selected_option_obj.balances"
          :key="b.currency"
          :label="b.currency"
          :title="`My balance in the ${selected_option_obj.title}.`"
          vb50
        >
          <div class="d-flex align-center justify-content-around">
            <small>Avail. </small>
            <u-price
              :amount="b.amount"
              :currency="b.currency"
              class="me-2"
            ></u-price>
            <v-spacer></v-spacer>
            <small>Pend. </small>
            <u-price
              :amount="b.pending_amount"
              :currency="b.currency"
              class="me-2"
            ></u-price>
            <v-spacer></v-spacer>
            <small>Res. </small>
            <u-price
              :amount="b.reserved_amount"
              :currency="b.currency"
            ></u-price>
          </div>
        </u-text-value-box>

        <u-text-value-box
          v-for="(it, k) in selected_vendor.meta"
          :key="k"
          :label="getName(k)"
          vb50
          >{{ it }}
        </u-text-value-box>
      </div>
      <!-- ███████████████████████ Payment ███████████████████████ -->

      <div :class="{ disabled: !selected_option }" class="widget-box mb-5">
        <u-widget-header
          icon="paid"
          :title="$t('vendor_payout_add.payment.title')"
        ></u-widget-header>

        <v-list-subheader>
          {{ $t("vendor_payout_add.payment.subtitle") }}
        </v-list-subheader>

        <u-currency-input
          v-model="currency"
          :active-currencies="shop.currencies"
          :disabled="!!payment"
          :label="$t('global.commons.currency')"
          :return-object="false"
          variant="underlined"
        ></u-currency-input>
        <u-price-input
          v-model="amount"
          :currency="currency"
          :disabled="!!payment"
          :label="$t('global.commons.amount')"
          class="strong-field"
          variant="underlined"
        ></u-price-input>

        <v-textarea
          v-model="note"
          :disabled="!!payment"
          :label="$t('global.commons.note')"
          append-inner-icon="sticky_note_2"
          auto-grow
          hide-details
          persistent-placeholder
          :placeholder="$t('vendor_payout_add.inputs.note.placeholder')"
          rows="2"
          variant="underlined"
        >
        </v-textarea>
        <u-smart-suggestion
          v-if="!payment /*Only in add mode!*/"
          :samples="$tm('suggestions.vendor_payment.note')"
          @select="(v) => (note = v)"
        >
        </u-smart-suggestion>
      </div>

      <div v-if="payment?.reversal_detail?.length" class="widget-box mb-5">
        <u-widget-header
          icon="history"
          :title="$t('vendor_payout_add.history.title')"
        ></u-widget-header>
        <v-list-subheader>
          {{ $t("vendor_payout_add.history.subtitle") }}
        </v-list-subheader>
        <b-vendor-payout-history :payment="payment"></b-vendor-payout-history>
      </div>
      <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Delete ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

      <div v-if="payment" class="widget-box mb-5">
        <u-widget-header
          icon="block"
          :title="$t('vendor_payout_add.refund.title')"
        ></u-widget-header>
        <v-list-subheader>
          {{ $t("vendor_payout_add.refund.subtitle") }}
        </v-list-subheader>

        <u-smart-toggle
          v-model="accept_delete"
          class="my-3"
          color="red"
          :true-description="
            $t('vendor_payout_add.inputs.accept_refund.true_description')
          "
          :true-title="$t('vendor_payout_add.inputs.accept_refund.true_title')"
        ></u-smart-toggle>

        <div class="widget-buttons">
          <v-btn
            :class="{ disabled: !accept_delete }"
            :loading="busy_delete"
            color="red"
            size="x-large"
            @click="remove"
          >
            <v-icon class="me-1">remove</v-icon>

            {{ $t("global.actions.refund") }}
          </v-btn>
        </div>
      </div>
    </v-card-text>

    <v-card-actions>
      <div class="widget-buttons">
        <v-btn size="x-large" variant="text" @click="$emit('close')">
          <v-icon start>close</v-icon>
          {{ $t("global.actions.close") }}
        </v-btn>

        <v-btn
          v-if="!payment"
          :class="{ disabled: !vendor_id || !currency || !amount }"
          :loading="busy"
          color="primary"
          size="x-large"
          variant="elevated"
          @click="addPayment"
        >
          <template v-if="selected_option === 'bank'">
            <v-icon start>add</v-icon>
            {{ $t("global.actions.add") }}
          </template>
          <template v-else>
            <v-icon start>add</v-icon>
            {{ $t("global.actions.transfer_fund") }}
          </template>
        </v-btn>
      </div>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts">
import UPriceInput from "../../../../ui/price/input/UPriceInput.vue";
import UCurrencyInput from "../../../../ui/currency/input/UCurrencyInput.vue";
import BVendorInput from "../../../vendor/input/BVendorInput.vue";
import USmartSelect from "../../../../ui/smart/select/USmartSelect.vue";
import BVendorPayoutBankInfo from "../../../vendor/payout/bank-info/BVendorPayoutBankInfo.vue";
import UPodsPanel from "../../../../ui/pod/panel/UPodsPanel.vue";
import UPodNode from "../../../../ui/pod/node/UPodNode.vue";
import UPodWire from "../../../../ui/pod/wire/UPodWire.vue";
import UTextValueBox from "../../../../ui/text/value-box/UTextValueBox.vue";
import BVendorPayoutHistory from "../../../vendor/payout/history/BVendorPayoutHistory.vue";
import USmartToggle from "../../../../ui/smart/toggle/USmartToggle.vue";
import USmartSuggestion from "../../../../ui/smart/suggestion/USmartSuggestion.vue";
import UCurrencyIcon from "../../../../ui/currency/icon/UCurrencyIcon.vue";


export default {
  name: "BVendorPayoutAdd",
  mixins: [],
  components: {
    UCurrencyIcon,
    USmartSuggestion,
    USmartToggle,
    BVendorPayoutHistory,
    UTextValueBox,
    UPodWire,
    UPodNode,
    UPodsPanel,
    BVendorPayoutBankInfo,
    USmartSelect,
    BVendorInput,
    UCurrencyInput,
    UPriceInput,
  },
  props: {
    shop: {
      required: true,
    },

    payment: {},

    initialAmount: {},
    initialCurrency: {},
    initialVendor: {},
  },
  data: () => ({
    busy: false,
    busy_delete: false,

    vendor_id: null,
    currency: null,
    amount: 0,

    note: null,

    accept_delete: false,

    options: [],
    selected_vendor: null,
    busy_fetch: false,
    selected_option: null,

    with_balance: !window.vendor_payment_options_fast_mode,
  }),
  computed: {
    selected_option_obj() {
      return this.options?.find((x) => x.code === this.selected_option);
    },
  },

  watch: {
    payment() {
      this.assign();
    },
    vendor_id() {
      if (this.payment) return; // In view mode

      this.fetchAvailablePaymentMethods();
    },
    with_balance(val) {
      window.vendor_payment_options_fast_mode = val;
      if (val) this.fetchAvailablePaymentMethods();
    },
  },

  created() {
    this.assign();
  },

  methods: {
    fetchAvailablePaymentMethods() {
      this.options = [];
      this.selected_option = null;
      this.selected_vendor = null;
      if (!this.vendor_id) return;

      this.busy_fetch = true;

      axios
        .get(
          window.API.GET_SHOP_VENDOR_PAYMENT_OPTIONS(
            this.shop.id,
            this.vendor_id,
          ),
          {
            params: {
              with_balance: this.with_balance,
            },
          },
        )
        .then(({ data }) => {
          if (!data.error) {
            this.selected_vendor = data.vendor;
            this.options = data.options;
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })

        .finally(() => {
          this.busy_fetch = false;
        });
    },
    //――――――――――――――――――――――― Edit Vendor ―――――――――――――――――――――――

    assign() {
      this.resetToDefault(); // 🞇 Reset to default
      this.currency = this.shop.currencies[0];

      // Apply initialized amount and currency:
      this.currency = this.initialCurrency
        ? this.initialCurrency
        : this.currency;
      this.amount = this.initialAmount ? this.initialAmount : this.amount;

      if (this.initialVendor) {
        this.vendor_id = this.initialVendor.id;
        this.selected_vendor = this.initialVendor;
      }

      if (this.payment) {
        this.vendor_id = this.payment.vendor_id;
        this.currency = this.payment.currency;
        this.amount = this.payment.amount;
        this.note = this.payment.note;

        this.selected_option = this.payment.option;

        this.accept_delete = false;
      }
    },

    addPayment() {
      this.busy = true;

      axios
        .post(window.API.POST_SHOP_VENDOR_PAYMENT_ADD(this.shop.id), {
          vendor_id: this.vendor_id,
          currency: this.currency,
          amount: this.amount,
          note: this.note,
          option: this.selected_option,
        })
        .then(({ data }) => {
          if (!data.error) {
            this.$emit("add", data.payment);
            this.$emit("update:account", data.account);
            this.$emit("close");

            NotificationService.showSuccessAlert(
              this.$t("vendor_payout_add.notifications.payout_success.title"),
              this.$t("vendor_payout_add.notifications.payout_success.message"),
            );
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })

        .finally(() => {
          this.busy = false;
        });
    },

    remove() {
      this.busy_delete = true;

      axios
        .delete(
          window.API.DELETE_SHOP_VENDOR_PAYMENT(this.shop.id, this.payment.id),
        )
        .then(({ data }) => {
          if (!data.error) {
            this.$emit("remove", data.id);
            this.$emit("close");
            NotificationService.showSuccessAlert(
              this.$t(
                "vendor_payout_add.notifications.reverse_fund_success.title",
              ),
              this.$t(
                "vendor_payout_add.notifications.reverse_fund_success.message",
              ),
            );
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })

        .finally(() => {
          this.busy_delete = false;
        });
    },
  },
};
</script>

<style scoped></style>
