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
  <v-card flat>
    <v-card-title></v-card-title>
    <v-card-text class="pt-5">
      <v-form ref="form" lazy-validation>
        <div class="widget-box mb-5">
          <s-widget-header
            :title="
              affiliate
                ? $t('affiliate_edit.config.edit')
                : $t('affiliate_edit.config.new')
            "
            icon="tune"
          ></s-widget-header>

          <v-list-subheader>
            {{ $t("affiliate_edit.config.subtitle") }}
          </v-list-subheader>

          <v-text-field
            v-model="name"
            :label="$t('affiliate_edit.inputs.name.label')"
            :rules="[GlobalRules.required()]"
            :messages="$t('affiliate_edit.inputs.name.message')"
            variant="underlined"
          ></v-text-field>

          <u-smart-toggle
            v-model="enable"
            :true-description="
              $t('affiliate_edit.inputs.enable.true_description')
            "
            :true-title="$t('global.commons.enable')"
            class="my-3"
            false-gray
            inset
          ></u-smart-toggle>

          <u-text-copy-box
            v-if="affiliate"
            :message="$t('affiliates.affiliate_code')"
            :value="affiliate.code"
            color="primary"
          ></u-text-copy-box>
        </div>

        <div class="widget-box mb-5">
          <s-widget-header
            :title="$t('affiliate_edit.payment.title')"
            icon="payment"
          ></s-widget-header>

          <v-list-subheader>
            {{ $t("affiliate_edit.payment.subtitle") }}
          </v-list-subheader>

          <u-currency-input
            v-model="currency"
            :disabled="!!affiliate"
            :label="$t('global.commons.currency')"
            :return-object="false"
            variant="underlined"
          ></u-currency-input>

          <u-smart-switch
            v-model="commission"
            class="mb-5"
            :false-description="
              $t('affiliate_edit.inputs.commission.false_description')
            "
            false-icon="calculate"
            :false-title="$t('affiliate_edit.inputs.commission.false_title')"
            :label="$t('affiliate_edit.inputs.commission.label')"
            :true-description="
              $t('affiliate_edit.inputs.commission.true_description')
            "
            true-icon="local_offer"
            :true-title="$t('affiliate_edit.inputs.commission.true_title')"
          >
          </u-smart-switch>

          <v-scroll-y-reverse-transition hide-on-leave>
            <div v-if="commission" key="1">
              <v-sheet class="widget-box mx-auto usn price-prev" theme="dark">
                <u-currency-input
                  v-model="currency"
                  :activeCurrencies="shop.currencies"
                  :label="$t('add_product.pricing.currency_input')"
                  :messages="$t('add_product.pricing.currency_input_messages')"
                  class="sm-suffix pen"
                  dark
                />

                <u-price-input
                  :currency="currency"
                  :label="$t('add_product.pricing.price_input')"
                  :model-value="69.99"
                  class="sm-suffix strong-field pen"
                  dark
                  required
                  variant="underlined"
                />

                <div
                  class="ma-n1 pa-1 position-relative"
                  style="border: solid #f3c50e medium; border-radius: 10px"
                >
                  <u-price-input
                    :currency="currency"
                    :label="$t('add_product.pricing.commission_input')"
                    :model-value="8"
                    class="sm-suffix strong-field pen"
                    dark
                    hide-details
                    variant="underlined"
                  />
                  <div
                    class="absolute-top-center pa-2 rounded-xl"
                    style="background: #f3c50e; top: -20px; color: #000"
                  >
                    {{ $t("affiliate_edit.affiliate_commission") }}
                  </div>
                </div>
              </v-sheet>
            </div>

            <div v-else key="2">
              <u-number-input
                v-model="percent"
                :label="$t('affiliates.percent_commission')"
                :max="100"
                :min="0"
                class="strong-field"
                suffix="%"
                variant="underlined"
              ></u-number-input>

              <u-price-input
                v-model="fix"
                :currency="currency"
                :label="$t('affiliates.fix_commission')"
                class="strong-field"
                variant="underlined"
              ></u-price-input>
            </div>
          </v-scroll-y-reverse-transition>
        </div>

        <div class="widget-box mb-5">
          <s-widget-header
            :title="$t('affiliate_edit.contact.title')"
            icon="person"
          ></s-widget-header>

          <v-list-subheader>
            {{ $t("affiliate_edit.contact.subtitle") }}
          </v-list-subheader>

          <v-expand-transition>
            <s-user-input
              v-if="user_edit"
              v-model:user-id="user_id"
              :label="$t('affiliate_edit.inputs.user.label')"
              :messages="$t('affiliate_edit.inputs.user.message')"
              variant="underlined"
              @update:model-value="
                (val) => {
                  if (!email) email = val;
                }
              "
            ></s-user-input>

            <div v-else class="d-flex align-center">
              <v-avatar class="m-3 avatar-gradient -thin -affiliate" size="38">
                <v-img :src="getUserAvatar(user_id)" />
              </v-avatar>

              <div v-if="affiliate.user" class="flex-grow-1 text-start">
                <b>{{ affiliate.user.name }}</b>
                <small class="d-block">{{ affiliate.user.email }}</small>
              </div>
              <v-btn
                :title="$t('global.actions.edit')"
                icon
                variant="text"
                @click="user_edit = true"
              >
                <v-icon>edit</v-icon>
              </v-btn>
            </div>
          </v-expand-transition>

          <v-text-field
            v-model="email"
            :label="$t('global.commons.email')"
            :rules="[GlobalRules.required()]"
            placeholder="Optional, Ex: affiliate-email@..."
            prepend-inner-icon="alternate_email"
            variant="underlined"
          ></v-text-field>

          <v-text-field
            v-model="web"
            :label="$t('global.commons.website')"
            :placeholder="$t('affiliate_edit.inputs.web.placeholder')"
            prepend-inner-icon="public"
            variant="underlined"
          ></v-text-field>

          <v-text-field
            v-model="address"
            :label="$t('global.commons.address')"
            :placeholder="$t('affiliate_edit.inputs.address.placeholder')"
            prepend-inner-icon="place"
            variant="underlined"
          ></v-text-field>
          <v-text-field
            v-model="tel"
            :label="$t('global.commons.tel')"
            :placeholder="$t('affiliate_edit.inputs.tel.placeholder')"
            prepend-inner-icon="local_phone"
            variant="underlined"
          ></v-text-field>

          <v-textarea
            v-model="bank"
            :label="$t('global.commons.bank_info')"
            :rows="2"
            auto-grow
            :placeholder="$t('affiliate_edit.inputs.bank.placeholder')"
            prepend-inner-icon="account_balance"
            variant="underlined"
          ></v-textarea>
        </div>

        <div class="widget-box mb-5">
          <s-widget-header
            :title="$t('affiliate_edit.restriction.title')"
            icon="border_outer"
          ></s-widget-header>

          <v-list-subheader>
            {{ $t("affiliate_edit.restriction.subtitle") }}
          </v-list-subheader>

          <b-products-select-box
            v-model="products"
            :label="$t('affiliate_edit.inputs.products.label')"
            :messages="
              (has_product_restrictions ? '❌ ' : '✅ ') +
              $t('blank_is_all_products')
            "
            :shop="shop"
            border-less
            >{{ $t('affiliate_edit.inputs.products.select_product')}}
            <b v-if="!has_product_restrictions" class="ms-1"
              >(
              <v-icon class="me-1" size="small">all_inclusive</v-icon>
              {{ $t("global.commons.all") }})</b
            ></b-products-select-box
          >
        </div>

        <div class="widget-box mb-5">
          <s-widget-header
            :title="$t('affiliate_edit.link_domain.title')"
            icon="add_link"
          ></s-widget-header>

          <v-list-subheader>
            {{ $t("affiliate_edit.link_domain.subtitle") }}
          </v-list-subheader>

          <v-select
            v-model="selected_domain"
            :items="domains"
            class="english-field"
            clearable
            item-title="domain"
            item-value="id"
            messages=" "
            return-object
            variant="underlined"
            :placeholder="$t('affiliate_edit.inputs.domain.placeholder')"
          >
            <template v-if="selected_domain" v-slot:message>
              <span v-if="!selected_domain.approved" class="text-red">
                {{ $t("affiliate_edit.link_domain.domain_not_approved_msg") }}
              </span>
              <span v-else-if="!selected_domain.enable" class="text-red">
                {{ $t("affiliate_edit.link_domain.domain_is_not_enable_msg") }}
              </span>
              <span
                v-else-if="
                  selected_domain.affiliate_id &&
                  selected_domain.affiliate_id !== affiliate.id
                "
                class="text-red"
              >
                {{
                  $t(
                    "affiliate_edit.link_domain.domain_is_linked_to_other_affiliate_msg",
                  )
                }}
              </span>
              <div v-else class="text-end">
                <v-btn
                  :href="'https://' + selected_domain.domain"
                  class="mt-1"
                  color="primary"
                  size="small"
                  target="_blank"
                  variant="text"
                >
                  <v-icon class="mx-1" size="small">launch</v-icon>
                  {{ $t("global.actions.view_website") }}
                </v-btn>
              </div>
            </template>
          </v-select>
        </div>

        <div class="widget-box mb-5 pb-5">
          <s-widget-header
            :title="$t('affiliate_pos.title')"
            icon="table_view"
          ></s-widget-header>

          <v-list-subheader>
            {{ $t("affiliate_pos.description") }}
          </v-list-subheader>
          <u-smart-toggle
            v-model="pos"
            class="my-3"
            false-gray
            inset
            :true-description="$t('affiliate_edit.inputs.pos.true_description')"
            true-icon="point_of_sale"
            :true-title="$t('affiliate_edit.inputs.pos.true_title')"
          ></u-smart-toggle>

          <v-expand-transition>
            <div v-if="user_id && pos">
              <b-affiliate-pos-pods
                :shop="shop"
                :user-id="user_id"
                :user-name="name"
              ></b-affiliate-pos-pods>
            </div>
            <div v-else-if="pos">
              <v-icon class="me-1" color="red">warning</v-icon>
              {{ $t("affiliate_edit.set_users_first_message") }}
            </div>
          </v-expand-transition>
        </div>

        <!-- ━━━━━━━━━━━━━━━━━━━━━━━━ 🆑 Cluster ━━━━━━━━━━━━━━━━━━━━━━━━ -->
        <div class="widget-box mb-5">
          <s-widget-header
            :to="{ name: 'BPageShopClassificationClusters' }"
            :add-caption="$t('affiliate_edit.cluster.manage_action')"
            add-icon="settings"
            add-text
            icon="workspaces"
            :title="$t('affiliate_edit.cluster.title')"
          ></s-widget-header>

          <v-list-subheader>
            {{ $t("affiliate_edit.cluster.subtitle") }}
          </v-list-subheader>
          <b-cluster-input
            v-model="cluster_id"
            :return-object="false"
            clearable
            icon="workspaces_filled"
            no-home
          ></b-cluster-input>
        </div>
        <!-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ -->
      </v-form>
    </v-card-text>
    <v-card-actions>
      <s-widget-buttons :auto-fixed-position="!hasBack">
        <v-btn
          v-if="hasBack"
          size="x-large"
          variant="text"
          @click="$emit('close')"
        >
          <v-icon start>close</v-icon>
          {{ $t("global.actions.close") }}
        </v-btn>
        <v-btn
          v-if="affiliate"
          :loading="busy_update"
          color="primary"
          size="x-large"
          variant="elevated"
          @click="updateAffiliate()"
        >
          <v-icon start>save</v-icon>
          {{ $t('affiliate_edit.actions.update') }}
        </v-btn>
        <v-btn
          v-else
          :loading="busy_create"
          color="primary"
          size="x-large"
          variant="elevated"
          @click="createAffiliate()"
        >
          <v-icon start>add</v-icon>
          {{ $t('affiliate_edit.actions.add') }}
        </v-btn>
      </s-widget-buttons>
    </v-card-actions>
  </v-card>
</template>
<script>
import BProductsSelectBox from "../../../backoffice/product/select-box/BProductsSelectBox.vue";
import SUserInput from "../../user/input/SUserInput.vue";
import UPriceInput from "../../../ui/price/input/UPriceInput.vue";
import UCurrencyInput from "../../../ui/currency/input/UCurrencyInput.vue";
import UNumberInput from "../../../ui/number/input/UNumberInput.vue";
import { Currency } from "@selldone/core-js/enums/payment/Currency";
import UTextCopyBox from "../../../ui/text/copy-box/UTextCopyBox.vue";

import BAffiliatePosPods from "../../affiliate/pos/pods/BAffiliatePosPods.vue";
import USmartSwitch from "../../../ui/smart/switch/USmartSwitch.vue";
import USmartToggle from "../../../ui/smart/toggle/USmartToggle.vue";
import BClusterInput from "../../cluster/input/BClusterInput.vue";
import SWidgetButtons from "../../../ui/widget/buttons/SWidgetButtons.vue";
import SWidgetHeader from "@selldone/components-vue/ui/widget/header/SWidgetHeader.vue";

export default {
  name: "BAffiliateEdit",
  components: {
    SWidgetHeader,
    SWidgetButtons,
    BClusterInput,
    USmartToggle,
    USmartSwitch,
    BAffiliatePosPods,

    UTextCopyBox,
    BProductsSelectBox,
    SUserInput,
    UPriceInput,
    UCurrencyInput,
    UNumberInput,
  },

  props: {
    shop: {
      require: true,
      type: Object,
    },
    affiliate: {},
    hasBack: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      //-------------------

      enable: true,
      fix: 0,
      percent: 0,
      currency: Currency.USD.code,
      user_id: null,
      name: null,
      email: null,
      address: null,
      web: null,
      tel: null,
      bank: null,
      products: [],

      commission: false,

      user_edit: false,

      pos: false,

      cluster_id: null,

      //--------------
      busy_create: false,
      busy_update: false,

      //--------------
      selected_domain: null,
    };
  },
  computed: {
    currencyObject() {
      return Currency[this.currency];
    },
    has_product_restrictions() {
      return this.products && Object.keys(this.products).length;
    },
    domains() {
      return this.shop.domains;
    },
  },

  watch: {},

  mounted() {},
  created() {
    this.assign();
  },

  methods: {
    //――――――――――――――――――――――― Edit Affiliate ―――――――――――――――――――――――

    assign() {
      if (this.affiliate) {
        this.enable = this.affiliate.enable;
        this.pos = this.affiliate.pos;

        this.fix = this.affiliate.fix;
        this.percent = this.affiliate.percent;
        this.currency = this.affiliate.currency;
        this.user_id = this.affiliate.user_id;
        this.name = this.affiliate.name;
        this.email = this.affiliate.email;
        this.address = this.affiliate.address;
        this.web = this.affiliate.web;
        this.tel = this.affiliate.tel;
        this.bank = this.affiliate.bank;
        this.products = this.affiliate.products;
        this.commission = this.affiliate.commission;

        this.user_edit = !this.user_id;

        this.selected_domain =
          this.affiliate.domains && this.affiliate.domains.length
            ? this.affiliate.domains[0]
            : null;

        this.cluster_id = this.affiliate.cluster_id;
      } else {
        this.enable = true;
        this.pos = false;
        this.fix = 0;
        this.percent = 0;
        this.user_id = null;
        this.name = null;
        this.email = null;
        this.address = null;
        this.web = null;
        this.tel = null;
        this.bank = null;
        this.products = [];
        this.commission = false;

        this.user_edit = true;

        this.selected_domain = null;

        this.cluster_id = null;
      }
    },
    updateAffiliate() {
      this.$refs.form.validate();

      this.busy_update = true;
      axios
        .put(window.API.PUT_UPDATE_AFFILIATE(this.shop.id, this.affiliate.id), {
          enable: this.enable,
          pos: this.pos,

          fix: this.fix,
          percent: this.percent,
          user_id: this.user_id,
          name: this.name,
          email: this.email,
          address: this.address,
          web: this.web,
          tel: this.tel,
          bank: this.bank,
          products: this.products,
          commission: this.commission,

          domain_id: this.selected_domain ? this.selected_domain.id : null, // Now just one domain attach to an affiliate!

          cluster_id: this.cluster_id,
        })
        .then(({ data }) => {
          if (data.error) {
            this.showErrorAlert(null, data.error_msg);
          } else {
            Object.assign(this.affiliate, data.affiliate);
            this.$emit("edit", data.affiliate);

            this.showSuccessAlert(
              null,
              this.$t("affiliate_edit.notifications.update_success"),
            );

            this.$emit("close");
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_update = false;
        });
    },

    //――――――――――――――――――――――― Add Affiliate ―――――――――――――――――――――――

    createAffiliate() {
      this.$refs.form.validate();

      this.busy_create = true;
      axios
        .post(window.API.POST_CREATE_AFFILIATE(this.shop.id), {
          enable: this.enable,
          pos: this.pos,

          currency: this.currency,

          fix: this.fix,
          percent: this.percent,
          user_id: this.user_id,
          name: this.name,
          email: this.email,
          address: this.address,
          web: this.web,
          tel: this.tel,
          bank: this.bank,
          products: this.products,
          commission: this.commission,

          domain_id: this.selected_domain ? this.selected_domain.id : null, // Now just one domain attach to an affiliate!

          cluster_id: this.cluster_id,
        })
        .then(({ data }) => {
          if (data.error) {
            this.showErrorAlert(null, data.error_msg);
          } else {
            this.$emit("add", data.affiliate);

            this.showSuccessAlert(
              null,
              this.$t("affiliate_edit.notifications.create_success"),
            );

            this.$emit("close");
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_create = false;
        });
    },
  },
};
</script>

<style lang="scss" scoped>
.price-prev {
  background-image: linear-gradient(-60deg, #00796b 0%, #009688 100%);
  color: white;
  border-radius: 24px;
  transform: scale(0.7);
}
</style>
