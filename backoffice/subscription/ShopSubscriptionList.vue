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

<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
  <div class="widget-box -large">
    <u-widget-header
      :add-caption="$t('shop_license.add')"
      :title="$t('shop_license.licenses_table.title')"
      icon="payments"
      @click:add="
        () => {
          voucher_selected = null;
          sheet = true;
        }
      "
    >
    </u-widget-header>

    <v-list-subheader
      >{{ $t("shop_license.licenses_table.subtitle") }}
    </v-list-subheader>

    <!-- ████████████████████ Shop Subscriptions ████████████████████ -->

    <v-data-table
      :header-props="{ sortByText: $t('global.commons.sort_by') }"
      :headers="headers"
      :items="subscriptions"
      :loading="busy_fetch"
      class="bg-transparent mb-6"
      item-key="id"
      :hide-default-footer="subscriptions.length < 5"
    >
      <template v-slot:item.code="{ item }">
        <div class="min-width-150 p-2">
          <img
            :src="getShopLicenseIcon(item.code)"
            class="me-1"
            height="24"
            width="24"
          />
          {{ item.code }}

          <u-time-progress-bar
            :created-time="item.created_at"
            :end-time="item.end_at"
            :start-time="item.start_at"
          ></u-time-progress-bar>
        </div>
      </template>

      <template v-slot:item.start_at="{ item }">
        <div class="min-width-200">
          <v-icon class="me-1" size="small">play_arrow</v-icon>
          {{ getFromNowString(item.start_at) }}<br />
          <small>{{ getLocalTimeString(item.start_at) }}</small>
        </div>

        <div class="min-width-200">
          <v-icon class="me-1" size="small">stop</v-icon>

          {{ getFromNowString(item.end_at) }}<br />
          <small>{{ getLocalTimeString(item.end_at) }}</small>
        </div>
      </template>

      <template v-slot:item.renewal="{ item }">
        <div v-if="last_subscription === item">
          <v-btn
            :color="item.renewal ? 'green' : undefined"
            :loading="busy_renewal === item"
            :variant="item.renewal ? 'flat' : 'outlined'"
            icon
            size="small"
            @click="toggleRenewal(item)"
          >
            <v-icon>refresh</v-icon>
          </v-btn>
          <br />
          {{ item.renewal ? $t("global.active") : $t("global.inactive") }}
        </div>
        <div v-else>
          <small>{{ $t("shop_license.only_last") }}</small>
        </div>
      </template>

      <template v-slot:item.account.account_number="{ item }">
        <div v-if="item.account" class="min-width-150 p-2">
          {{ formatCard(item.account.account_number) }}
          <v-btn
            :to="{
              name: 'BPageAccountTransactions',
              params: { account_number: item.account.account_number },
            }"
            class="m-2"
            icon
            target="_blank"
            tile
            variant="text"
          >
            <v-icon>open_in_new</v-icon>
          </v-btn>
          <br />
          <small>{{ item.account.account_name }}</small>
        </div>
        <div v-else class="min-width-150">
          <img
            :src="getVoucherImage(item.voucher.code)"
            :title="getVoucherTitle(item.voucher.code)"
            height="64"
          />
          <small class="d-block">{{ item.voucher.comment }}</small>

          <small class="d-block mt-1">
            <v-icon size="small">add</v-icon>
            {{ $t("shop_license.use_date") }}:
          </small>
          <b class="small mb-1">{{
            getLocalTimeStringSmall(item.voucher.used_at)
          }}</b>
        </div>
      </template>

      <template v-slot:item.payment="{ item }">
        <u-price :amount="item.payment" :currency="item.currency"></u-price>
      </template>

      <template v-slot:item.cancel="{ item }">
        <v-btn
          color="red"
          icon
          title="Cancel subscription"
          variant="text"
          @click="cancelSubscription(item.id)"
        >
          <v-icon>close</v-icon>
        </v-btn>
      </template>
    </v-data-table>

    <!-- --------------------------------- Vouchers ----------------------------------- -->

    <h3 class="text-start">
      <v-icon class="me-1" color="#111">pix</v-icon>
      {{ $t("shop_license.vouchers") }}
    </h3>
    <v-slide-group v-if="vouchers.length">
      <v-slide-group-item
        v-for="voucher in vouchers"
        :key="voucher.id"
        v-slot:default=""
        :value="voucher"
      >
        <div
          class="p-3 row-hover rounded-lg my-10 mx-3 text-start"
          @click="selectVoucher(voucher)"
        >
          <v-img
            :src="getVoucherImage(voucher.code)"
            height="96"
            width="200"
          ></v-img>

          <div class="text-center">
            <img
              :src="getVoucherObject(voucher.code).license.icon"
              class="me-2"
              height="24"
              width="24"
            />
            <v-icon
              v-for="i in getVoucherObject(voucher.code).months"
              :key="i"
              color="primary"
              size="x-small"
              >circle
            </v-icon>
          </div>

          <p class="m-1 text-uppercase text-muted small">
            {{ getVoucherTitle(voucher.code) }}
            <v-badge
              :content="voucher.total + 1"
              :model-value="voucher.total + 1 > 1"
              color="deep-purple-accent-4"
              inline
            >
            </v-badge>
          </p>
        </div>
      </v-slide-group-item>
    </v-slide-group>

    <div
      v-if="!vouchers.length"
      class="text-center text-muted text-h3 font-weight-thin py-5 px-2"
    >
      {{ $t("global.commons.empty") }}
    </div>

    <!-- ████████████████████ Bottom Sheet > Add account to shop ████████████████████ -->

    <v-bottom-sheet
      v-model="sheet"
      max-width="98vw"
      :width="860"
      :overlay-opacity="0.9"
      content-class="rounded-t-xl"
      scrollable
    >
      <v-card class="text-start rounded-t-xl">
        <v-card-title class="text-capitalize d-flex align-center">
          <v-avatar class="avatar-gradient -thin -shop me-2" size="36">
            <img :src="getShopImagePath(shop.icon, 96)" />
          </v-avatar>

          {{ $t("shop_license.buy") }}
          <v-spacer></v-spacer>
          <v-btn class="ms-2" icon variant="text" @click="sheet = false">
            <v-icon>close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text>
          <div class="max-widget-width mx-auto">
            <!-- Normal payment mode -->

            <div v-if="!voucher_selected" class="py-5">
              <div class="widget-box mb-5">
                <u-widget-header icon="looks_one" :title="$t('shop_license.add_dialog.wallet.title')">
                  <template v-slot:append-title>
                    <v-icon
                      v-if="!account_selected"
                      class="mx-1 blink-me"
                      color="success"
                      size="small"
                      >circle
                    </v-icon>
                  </template>
                </u-widget-header>
                <v-list-subheader>
                  {{$t('shop_license.add_dialog.wallet.subtitle')}}

                </v-list-subheader>

                <b-account-input v-model="account_selected"></b-account-input>
              </div>

              <div class="widget-box mb-5">
                <u-widget-header
                  :title="$t('shop_license.plan')"
                  class=""
                  icon="looks_two"
                >
                  <template v-slot:append-title>
                    <v-icon
                      v-if="account_selected && !subscription_code"
                      class="mx-1 blink-me"
                      color="success"
                      >circle
                    </v-icon>
                  </template>
                </u-widget-header>

                <v-list-subheader
                  >{{ $t("shop_license.plan_placeholder") }}
                </v-list-subheader>
                <u-smart-select
                  v-model="subscription_code"
                  :items="plans"
                  class="my-3"
                  item-image="icon"
                  item-text="name"
                  item-value="code"
                >
                </u-smart-select>
              </div>
              <div class="widget-box mb-5">
                <u-widget-header
                  :title="$t('shop_license.validity_duration')"
                  class=""
                  icon="looks_3"
                >
                  <template v-slot:append-title>
                    <v-icon
                      v-if="subscription_code && !type"
                      class="mx-1 blink-me"
                      color="success"
                      >circle
                    </v-icon>
                  </template>
                </u-widget-header>

                <v-list-subheader
                  >{{ $t("shop_license.validity_duration_hint") }}
                </v-list-subheader>
                <u-smart-select
                  v-model="type"
                  :disabled="!subscription_code"
                  :items="[
                    { value: 'monthly', title: $t('shop_license.monthly') },
                    {
                      value: 'yearly',
                      title: $t('shop_license.yearly') + ' + 30% off',
                      icon: 'star_purple500',
                    },
                  ]"
                  class="my-3"
                  item-icon="icon"
                  item-text="title"
                  item-value="value"
                >
                </u-smart-select>
              </div>
              <div class="widget-box mb-5">
                <u-widget-header
                  class=""
                  icon="settings_applications"
                  :title="$t('shop_license.add_dialog.options.title') "
                ></u-widget-header>

                <u-smart-toggle
                  v-model="renewal"
                  :true-title="$t('shop_license.add_dialog.auto_renewal.true_title')"
                  class="my-3"
                  false-gray
                  :true-description="$t('shop_license.add_dialog.auto_renewal.true_description') "
                  true-icon="autorenew"
                ></u-smart-toggle>
              </div>
            </div>

            <!-- Voucher mode -->
            <div v-else class="py-5 text-center mb-5">
              <v-img
                :src="getVoucherImage(voucher_selected.code)"
                height="168"
              ></v-img>
              <v-row align="center" class="my-2" justify="center" no-gutters>
                <v-icon
                  v-for="i in selected_voucher_obj.months"
                  :key="i"
                  color="primary"
                  size="small"
                  >circle
                </v-icon>
              </v-row>
              <p class="m-1 text-uppercase">
                <img
                  :src="selected_voucher_obj.license.icon"
                  class="me-1"
                  height="24"
                  width="24"
                />
                {{ getVoucherTitle(voucher_selected.code) }}
              </p>
            </div>

            <div class="widget-box mb-5">
              <u-widget-header
                icon="check_box"
                :title="$t('shop_license.add_dialog.verify.title')"
              ></u-widget-header>

              <v-expand-transition>
                <div v-if="canPay" class="border-top border-bottom">
                  <div class="py-2">
                    <u-text-value-dashed>
                      <template v-slot:label>
                        {{ $t("shop_license.start_date") }}
                      </template>
                      {{ getLocalTimeString(start_at) }}
                    </u-text-value-dashed>

                    <u-text-value-dashed>
                      <template v-slot:label>
                        {{ $t("shop_license.end_date") }}
                      </template>
                      {{ getLocalTimeString(end_at) }}
                    </u-text-value-dashed>

                    <u-text-value-dashed>
                      <template v-slot:label>
                        {{ $t("shop_license.price") }}
                      </template>
                      <u-price :amount="price" :currency="currency"></u-price>
                    </u-text-value-dashed>
                  </div>
                </div>
              </v-expand-transition>

              <u-smart-verify
                v-model="agreement"
                :true-title="$t('shop_license.verify.true_title')"
                :true-description="$t('shop_license.verify.true_description')"
                class="my-3"
              ></u-smart-verify>
            </div>
          </div>
        </v-card-text>

        <u-loading-progress v-if="busy_price"></u-loading-progress>

        <v-card-actions>
          <div class="widget-buttons">
            <v-btn
              v-if="needCharge"
              :to="{
                name: 'BPageAccountDeposit',
                params: { account_number: account_selected.account_number },
                query: { charge: calculated_need_charge },
              }"
              color="primary"
              size="x-large"
              variant="elevated"
            >
              <v-icon class="me-1">info</v-icon>
              {{ $t("shop_license.need_charge") }}

              <u-price
                v-if="currency && price"
                :amount="calculated_need_charge"
                :currency="account_selected.currency"
                class="mx-2"
              ></u-price>
            </v-btn>

            <v-btn
              v-else
              :class="{
                disabled: (!canPay && !voucher_selected) || !agreement,
              }"
              :loading="busy_buy"
              color="primary"
              size="x-large"
              variant="elevated"
              @click="buySubscription()"
            >
              <v-icon v-if="voucher_selected" class="me-1">check</v-icon>
              <img
                v-else-if="subscription_code"
                :src="getShopLicenseIcon(subscription_code)"
                class="me-1"
                height="24"
                width="24"
              />

              {{
                voucher_selected
                  ? $t("shop_license.use_voucher_now")
                  : $t("shop_license.buy_now")
              }}

              <b v-if="currency && price" class="mx-2">
                {{ FormatNumberCurrency(price, currency) }}
                {{ GetUserSelectedCurrencyName(currency) }}
              </b>
            </v-btn>
          </div>
        </v-card-actions>
      </v-card>
    </v-bottom-sheet>
  </div>
</template>

<script>
import BAccountInput from "../account/input/BAccountInput.vue";
import { ShopLicense } from "@selldone/core-js/enums/shop/ShopLicense";
import UTimeProgressBar from "../../ui/time/progress-bar/UTimeProgressBar.vue";
import { Vouchers } from "@selldone/core-js/enums/shop/Vouchers";
import UTextValueDashed from "../../ui/text/value-dashed/UTextValueDashed.vue";
import USmartSelect from "../../ui/smart/select/USmartSelect.vue";
import USmartToggle from "../../ui/smart/toggle/USmartToggle.vue";
import USmartVerify from "../../ui/smart/verify/USmartVerify.vue";

export default {
  name: "ShopSubscriptionList",
  components: {
    USmartVerify,
    USmartToggle,
    USmartSelect,
    UTextValueDashed,
    UTimeProgressBar,
    BAccountInput,
  },

  props: {
    shop: {
      required: true,
      type: Object,
    },
  },

  data: () => ({
    subscriptions: [],
    busy_fetch: false,

    sheet: false,
    busy_buy: false,

    account_selected: null,
    type: null,
    renewal: false,
    subscription_code: null,
    voucher_selected: null,

    //-------------
    busy_price: false,
    price: 0,
    currency: 0,
    start_at: null,
    end_at: null,

    agreement: true,

    //-------------
    busy_renewal: null,
  }),
  watch: {
    account_selected() {
      this.refreshPrice();
    },
    subscription_code() {
      this.refreshPrice();
    },
    type() {
      this.refreshPrice();
    },
  },

  computed: {
    vouchers() {
      return this.USER().vouchers;
    },
    last_subscription() {
      if (!this.subscriptions.length) return null;
      return this.subscriptions[this.subscriptions.length - 1];
    },

    needCharge() {
      return (
        this.canPay &&
        this.account_selected.balance - this.account_selected.locked <
          this.price
      );
    },

    calculated_need_charge() {
      return (
        this.price -
        (this.account_selected.balance - this.account_selected.locked)
      );
    },

    canPay() {
      return (
        this.account_selected &&
        this.subscription_code &&
        this.price &&
        this.currency
      );
    },
    plans() {
      return [ShopLicense.STARTUP, ShopLicense.COMPANY, ShopLicense.ENTERPRISE];
    },

    headers() {
      return [
        {
          title: this.$t("shop_license.table.plan"),
          align: "center",
          value: "code",
        },
        {
          title: this.$t("shop_license.table.start_date"),
          align: "start",
          value: "start_at",
        },

        {
          title: this.$t("shop_license.table.renewal"),
          align: "center",
          value: "renewal",
          sortable: false,
        },

        {
          title: this.$t("shop_license.table.linked_account"),
          align: "center",
          value: "account.account_number",
        },

        {
          title: this.$t("shop_license.table.payment"),
          align: "center",
          value: "payment",
        },

        {
          title: this.$t("shop_license.table.cancel"),
          align: "center",
          sortable: false,
          value: "cancel",
        },
      ];
    },
    selected_voucher_obj() {
      return this.voucher_selected && Vouchers[this.voucher_selected.code];
    },
  },
  created() {
    this.fetchSubscriptions();
  },

  methods: {
    selectVoucher(voucher) {
      this.voucher_selected = voucher;
      this.account_selected = null;
      this.subscription_code = this.getVoucherSubscription(voucher.code);
      this.sheet = true;
    },

    getVoucherImage(code) {
      return Vouchers[code].image;
    },
    getVoucherTitle(code) {
      return Vouchers[code].title;
    },
    getVoucherObject(code) {
      return Vouchers[code];
    },
    getVoucherSubscription(code) {
      return Vouchers[code].subscription;
    },
    toggleRenewal(subscription) {
      this.busy_renewal = subscription;
      axios
        .put(window.API.PUT_SHOP_SUBSCRIPTION(this.shop.id, subscription.id), {
          renewal: !subscription.renewal,
        })
        .then(({ data }) => {
          if (!data.error) {
            subscription.renewal = data.renewal;
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_renewal = null;
        });
    },

    refreshPrice() {
      if (!this.subscription_code || !this.type || !this.account_selected)
        return;
      this.busy_price = true;

      this.price = null;
      this.currency = null;
      this.start_at = null;
      this.end_at = null;

      axios
        .get(window.API.GET_SHOP_SUBSCRIPTION_PRICE(this.shop.id), {
          params: {
            currency: this.account_selected.currency,
            type: this.type,
            code: this.subscription_code,
          },
        })
        .then(({ data }) => {
          if (!data.error) {
            this.price = data.price;
            this.currency = data.currency;
            this.start_at = data.start_at;
            this.end_at = data.end_at;
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_price = false;
        });
    },

    fetchSubscriptions() {
      this.busy_fetch = true;
      axios
        .get(window.API.GET_SHOP_SUBSCRIPTIONS(this.shop.id))
        .then(({ data }) => {
          if (!data.error) {
            this.subscriptions = data.subscriptions;
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_fetch = false;
        });
    },

    buySubscription() {
      this.busy_buy = true;
      axios
        .post(window.API.POST_ADD_SHOP_SUBSCRIPTION(this.shop.id), {
          type: this.type,
          renewal: this.renewal,
          code: this.subscription_code,
          account_number: this.account_selected
            ? this.account_selected.account_number
            : null,
          voucher_code: this.voucher_selected
            ? this.voucher_selected.code
            : null, //Only send voucher type! not id!
        })
        .then(({ data }) => {
          if (!data.error) {
            this.showSuccessAlert(
              null,
              this.$t("shop_license.notifications.subscribe_success"),
            );
            this.AddOrUpdateItemByID(this.subscriptions, data.subscription);
            this.account_selected = null;
            (this.voucher_selected = null), (this.sheet = false);

            if (data.vouchers) {
              this.USER().vouchers = data.vouchers;
            }

            // Update shop license:
            this.shop.license = data.shop_license;
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_buy = false;
        });
    },

    cancelSubscription(subscription_id) {
      this.openDangerAlert(
        this.$t("shop_license.cancel_dialog.title"),
        this.$t("shop_license.cancel_dialog.message"),
        this.$t("shop_license.cancel_dialog.action"),
        () => {
          axios
            .delete(
              window.API.DELETE_SHOP_SUBSCRIPTION(
                this.shop.id,
                subscription_id,
              ),
            )
            .then(({ data }) => {
              if (!data.error) {
                this.showSuccessAlert(
                  null,
                  this.$t("shop_license.notifications.cancel_success"),
                );
                this.DeleteItemByID(this.subscriptions, data.id);

                if (data.vouchers) {
                  this.USER().vouchers = data.vouchers;
                }

                // Update shop license:
                this.shop.license = data.shop_license;
              } else {
                this.showErrorAlert(null, data.error_msg);
              }
            })
            .catch((error) => {
              this.showLaravelError(error);
            })
            .finally(() => {});
        },
      );
    },
  },
};
</script>

<style lang="scss" scoped></style>
