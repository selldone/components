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
  <v-card
    class="font-weight-regular text-start"
    :class="{ 'sd-modern-canvas b-pricing-editor': modern }"
    :theme="modern ? (USER()?.preferences?.dark ? 'dark' : 'light') : undefined"
  >
    <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Focused header (refined) ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->
    <header v-if="modern" class="b-pricing-editor__header">
      <u-avatar-folder
        :src="getShopImagePath(product.icon, 128)"
        :size="40"
        :border-size="4"
        side-icon="sell"
      />
      <div class="b-pricing-editor__heading">
        <h2>{{ t(subscriptionPrice ? "edit_title" : "add_title") }}</h2>
        <p>
          <span>{{ product.title }}</span>
          <b v-if="subscriptionPrice" dir="ltr"
            >PRC{{ subscriptionPrice.id }}</b
          >
          <span
            v-if="subscriptionPrice"
            class="sd-modern-status sd-modern-status--plain b-pricing-editor__state"
            ><span
              class="sd-modern-status__dot"
              :class="
                enable
                  ? 'sd-modern-status__dot--success'
                  : 'sd-modern-status__dot--warning'
              "
              aria-hidden="true"
            ></span
            >{{
              $t(
                enable
                  ? "b_product_pricing.state_available"
                  : "b_product_pricing.state_unavailable",
              )
            }}</span
          >
        </p>
      </div>
      <v-btn
        icon
        variant="text"
        class="sd-modern-icon-button"
        :aria-label="$t('global.actions.close')"
        @click="$emit('close')"
      >
        <v-icon>close</v-icon>
        <v-tooltip
          activator="parent"
          location="top"
          content-class="sd-modern-tooltip text-start"
          >{{ $t("global.actions.close") }}</v-tooltip
        >
      </v-btn>
    </header>
    <template v-else>
      <v-card-title
        >{{ t(subscriptionPrice ? "edit_title" : "add_title") }}
      </v-card-title>
      <v-card-subtitle>
        Unique Product Price Code :
        <b>PRC{{ subscriptionPrice ? subscriptionPrice.id : "-" }}</b>
      </v-card-subtitle>
    </template>

    <v-card-text :class="{ 'b-pricing-editor__body': modern }">
      <div :class="{ 'b-pricing-editor__workspace': modern }">
        <div :class="{ 'b-pricing-editor__form': modern }">
          <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅  Plan ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->
          <div
            :class="
              modern
                ? 'sd-modern-widget b-pricing-editor__group'
                : 'widget-box mb-5'
            "
          >
            <header v-if="modern" class="b-pricing-editor__group-header">
              <v-icon size="20" aria-hidden="true">sell</v-icon>
              <div>
                <h3>{{ t("plan_title") }}</h3>
                <p>{{ t("plan_subtitle") }}</p>
              </div>
            </header>
            <template v-else>
              <u-widget-header
                icon="tune"
                :title="t('plan_title')"
              ></u-widget-header>
              <v-list-subheader>{{ t("plan_subtitle") }}</v-list-subheader>
            </template>

            <u-smart-toggle
              v-model="enable"
              color="success"
              false-gray
              :border="modern"
              :accessible="modern"
              :dark="modern && $vuetify.theme.current.dark"
              :class="{
                'sd-modern-control-colors b-pricing-editor__toggle': modern,
              }"
              :false-description="t('unavailable_help')"
              false-icon="public_off"
              :false-title="t('unavailable')"
              :true-description="t('available_help')"
              true-icon="public"
              :true-title="t('available')"
            ></u-smart-toggle>

            <v-text-field
              v-model="title"
              :label="$t('global.commons.title') + '*'"
              messages=" "
              :placeholder="t('title_hint')"
              required
              variant="underlined"
              :class="{ 'sd-modern-underlined-field': modern }"
            >
              <template v-slot:message>
                <u-smart-suggestion
                  :samples="$tm('suggestions.subscription_price.title')"
                  @select="(v) => (title = v)"
                ></u-smart-suggestion>
              </template>
            </v-text-field>

            <v-text-field
              v-model="sku"
              :counter="64"
              :hint="t('sku_hint')"
              persistent-hint
              label="SKU"
              variant="underlined"
              :class="{ 'sd-modern-underlined-field': modern }"
            >
            </v-text-field>

            <v-text-field
              v-model="description"
              :label="$t('global.commons.description')"
              messages=" "
              :placeholder="t('description_hint')"
              variant="underlined"
              :class="{ 'sd-modern-underlined-field': modern }"
            >
              <template v-slot:message>
                <u-smart-suggestion
                  :samples="$tm('suggestions.subscription_price.description')"
                  @select="(v) => (description = v)"
                ></u-smart-suggestion>
              </template>
            </v-text-field>
          </div>

          <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Recurring price ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

          <div
            :class="
              modern
                ? 'sd-modern-widget b-pricing-editor__group'
                : 'widget-box mb-5'
            "
          >
            <header v-if="modern" class="b-pricing-editor__group-header">
              <v-icon size="20" aria-hidden="true">payments</v-icon>
              <div>
                <h3>{{ t("price_title") }}</h3>
                <p>{{ t("price_subtitle") }}</p>
              </div>
            </header>
            <template v-else>
              <u-widget-header
                icon="sell"
                :title="t('price_title')"
              ></u-widget-header>
              <v-list-subheader>{{ t("price_subtitle") }}</v-list-subheader>
            </template>

            <u-currency-input
              v-model="currency"
              :activeCurrencies="shop.currencies"
              :disabled="!!subscriptionPrice"
              :label="$t('add_product.pricing.currency_input')"
              :messages="$t('add_product.pricing.currency_input_messages')"
              :return-object="false"
              class="sm-suffix price-input"
              :class="{ 'sd-modern-underlined-field': modern }"
            />

            <p
              v-if="modern && busy_billings"
              class="b-pricing-editor__hint"
              role="status"
            >
              <v-progress-circular
                size="14"
                width="2"
                indeterminate
                color="primary"
              />
              {{ t("provider_loading") }}
            </p>
            <u-loading-progress v-else-if="busy_billings"></u-loading-progress>

            <v-expand-transition>
              <div v-if="!busy_billings">
                <template v-if="gateways && gateways.length">
                  <h4 v-if="modern" class="b-pricing-editor__label">
                    {{ t("provider") }}
                  </h4>
                  <u-smart-select
                    v-model="gateway_code"
                    :disabled="!!subscriptionPrice"
                    :item-image="(val) => getShopImagePath(val.icon)"
                    :items="gateways"
                    :class="modern ? 'sd-modern-smart-select' : 'my-3'"
                    :dark="modern && $vuetify.theme.current.dark"
                    :border="modern"
                    :accessible="modern"
                    :force-show-all="modern"
                    :rounded="!modern"
                    item-description="description"
                    item-text="name"
                    item-value="code"
                  >
                  </u-smart-select>
                </template>
                <div
                  v-else-if="currency"
                  :class="
                    modern
                      ? 'sd-modern-notice b-pricing-editor__notice'
                      : 'my-3'
                  "
                  role="status"
                >
                  <v-icon
                    class="me-1"
                    :color="modern ? undefined : 'red'"
                    size="18"
                    >error_outline</v-icon
                  >
                  <span>{{ t("provider_none", { currency }) }}</span>
                </div>
                <div
                  v-else
                  :class="
                    modern
                      ? 'sd-modern-notice b-pricing-editor__notice'
                      : 'my-3'
                  "
                  role="status"
                >
                  <v-icon
                    class="me-1"
                    :color="modern ? undefined : 'red'"
                    size="18"
                    >error_outline</v-icon
                  >
                  <span>{{ t("provider_select_currency") }}</span>
                </div>
              </div>
            </v-expand-transition>

            <u-price-input
              v-model="price"
              :currency="currency"
              :disabled="price_lock"
              :label="$t('add_product.pricing.price_input')"
              class="sm-suffix price-input strong-field"
              :class="{ 'sd-modern-underlined-field': modern }"
              required
            >
              <template v-slot:append-inner>
                <v-tooltip
                  v-if="subscriptionPrice"
                  :content-class="
                    modern ? 'sd-modern-tooltip text-start' : undefined
                  "
                  :color="modern ? undefined : '#000'"
                  :location="modern ? 'top' : 'bottom'"
                  max-width="360"
                  open-on-focus
                >
                  <template v-slot:activator="{ props }">
                    <v-btn
                      icon
                      v-bind="props"
                      variant="text"
                      :class="{
                        'sd-modern-icon-button sd-modern-input-action': modern,
                      }"
                      :aria-label="
                        t(price_lock ? 'unlock_price' : 'lock_price')
                      "
                      @click="price_lock = !price_lock"
                    >
                      <v-icon>{{ price_lock ? "lock" : "lock_open" }}</v-icon>
                    </v-btn>
                  </template>
                  <div class="text-start">{{ t("unlock_help") }}</div>
                </v-tooltip>

                <v-tooltip
                  v-else
                  :content-class="
                    modern ? 'sd-modern-tooltip text-start' : undefined
                  "
                  :color="modern ? undefined : '#000'"
                  :location="modern ? 'top' : 'bottom'"
                  max-width="360"
                  open-on-focus
                >
                  <template v-slot:activator="{ props }">
                    <v-icon v-bind="props" tabindex="0">info_outline</v-icon>
                  </template>
                  <div class="text-start">{{ t("price_subtitle") }}</div>
                </v-tooltip>
              </template>
            </u-price-input>

            <v-select
              v-model="period"
              :disabled="!!subscriptionPrice"
              :item-title="(p) => $t(p.title)"
              :items="BillingPeriod"
              :return-object="false"
              append-icon="pending_actions"
              class="sm-suffix price-input strong-field"
              :class="{ 'sd-modern-underlined-field': modern }"
              item-value="code"
              :label="t('period')"
              required
              variant="underlined"
            />

            <p v-if="modern" class="sd-modern-notice b-pricing-editor__notice">
              <v-icon size="18" aria-hidden="true">info_outline</v-icon>
              <span>{{ t("locked_note") }}</span>
            </p>
          </div>
        </div>

        <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Inert storefront preview (refined) ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->
        <aside
          v-if="modern"
          class="sd-modern-widget b-pricing-editor__aside"
          :aria-label="t('preview_title')"
        >
          <h3>{{ t("preview_title") }}</h3>
          <div
            class="b-pricing-editor__sketch sd-modern-illustration"
            aria-hidden="true"
          >
            <div class="b-pricing-editor__sketch-product">
              <v-avatar rounded="lg" size="40">
                <v-img
                  v-if="product.icon"
                  :src="getShopImagePath(product.icon, 128)"
                  alt=""
                />
                <v-icon v-else size="20">inventory_2</v-icon>
              </v-avatar>
              <div>
                <b>{{ product.title }}</b>
                <span>{{ $t("global.product_types.subscription") }}</span>
              </div>
            </div>
            <div
              class="b-pricing-editor__sketch-plan"
              :class="{ 'b-pricing-editor__sketch-plan--off': !enable }"
            >
              <div>
                <b>{{ title || t("preview_untitled") }}</b>
                <span class="b-pricing-editor__sketch-radio"
                  ><v-icon size="14">check</v-icon></span
                >
              </div>
              <strong
                ><u-price :amount="Number(price) || 0" :currency="currency" />
                <small>/ {{ period_title }}</small></strong
              >
            </div>
            <p v-if="other_plans_count" class="b-pricing-editor__sketch-others">
              {{ t("preview_other_plans", { count: other_plans_count }) }}
            </p>
            <div
              class="b-pricing-editor__sketch-action sd-modern-illustration__action"
            >
              <v-icon size="16">credit_card</v-icon>{{ t("preview_subscribe") }}
            </div>
          </div>
          <dl class="b-pricing-editor__facts">
            <div>
              <dt>{{ t("preview_billed") }}</dt>
              <dd>
                {{
                  t("preview_billed_value", {
                    period: period_title,
                    provider: selected_gateway?.name || "—",
                  })
                }}
              </dd>
            </div>
            <div>
              <dt>{{ t("preview_environment") }}</dt>
              <dd>
                {{
                  selected_shop_gateway
                    ? t(
                        selected_shop_gateway.livemode
                          ? "preview_live"
                          : "preview_sandbox",
                      )
                    : "—"
                }}
              </dd>
            </div>
            <div>
              <dt>{{ t("preview_price_id") }}</dt>
              <dd dir="ltr">{{ provider_price_id || t("preview_pending") }}</dd>
            </div>
          </dl>
        </aside>
      </div>
    </v-card-text>
    <!-- ██████████████████████ Actions ██████████████████████ -->

    <v-card-actions :class="{ 'b-pricing-editor__actions': modern }">
      <div class="widget-buttons">
        <v-btn
          :size="modern ? 'default' : 'x-large'"
          :class="{ 'sd-modern-button': modern }"
          variant="text"
          @click="$emit('close')"
        >
          <v-icon start>close</v-icon>
          {{ $t("global.actions.close") }}
        </v-btn>

        <v-btn
          :class="{
            'sd-modern-button': modern,
            disabled: !gateway_code || !title || !currency || !price,
          }"
          :loading="busy_save"
          color="primary"
          :size="modern ? 'default' : 'x-large'"
          variant="flat"
          @click="addItem()"
        >
          <v-icon class="me-1">{{ subscriptionPrice ? "save" : "add" }}</v-icon>
          {{
            subscriptionPrice
              ? $t("global.actions.save")
              : $t("global.actions.add")
          }}
        </v-btn>
      </div>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts">
import { BusinessModel } from "@selldone/core-js/enums/shop/BusinessModel";

import USmartToggle from "../../../../../ui/smart/toggle/USmartToggle.vue";

import UCurrencyInput from "../../../../../ui/currency/input/UCurrencyInput.vue";
import UPriceInput from "../../../../../ui/price/input/UPriceInput.vue";
import BillingPeriod from "@selldone/core-js/enums/subscription/BillingPeriod";
import USmartSelect from "../../../../../ui/smart/select/USmartSelect.vue";
import USmartSuggestion from "../../../../../ui/smart/suggestion/USmartSuggestion.vue";
import UAvatarFolder from "../../../../../ui/avatar/folder/UAvatarFolder.vue";

import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

export default {
  name: "BProductSubscriptionPricingAdd",
  mixins: [],
  components: {
    UAvatarFolder,
    USmartSuggestion,
    USmartSelect,
    UPriceInput,
    UCurrencyInput,

    USmartToggle,
  },
  props: {
    shop: {
      required: true,
    },

    product: {
      required: true,
    },

    subscriptionPrice: {
      required: false,
    },
    // Focused fullscreen editor of the refined Pricings tab; Studio keeps the legacy layout.
    modern: { type: Boolean, default: false },
  },

  data() {
    return {
      BillingPeriod: Object.values(BillingPeriod),

      enable: true,
      title: "",
      sku: "",
      description: null,

      price: 0,
      currency: null,
      period: BillingPeriod.Monthly.code,

      gateway_code: null,

      busy_save: false,

      busy_billings: false,
      gateways: null,

      price_lock: false,
    };
  },

  computed: {
    is_marketplace() {
      return this.shop.model === BusinessModel.MARKETPLACE.code;
    },
    period_title() {
      const period = BillingPeriod[this.period];
      return period ? this.$t(period.title) : "";
    },
    selected_gateway() {
      return (
        (this.gateways || []).find((g) => g.code === this.gateway_code) || null
      );
    },
    selected_shop_gateway() {
      return (
        (this.shop.shop_gateways || []).find(
          (sg) => sg.gateway?.code === this.gateway_code,
        ) || null
      );
    },
    other_plans_count() {
      return (this.product.subscription_prices || []).filter(
        (plan) =>
          plan.enable &&
          !plan.deleted_at &&
          plan.id !== this.subscriptionPrice?.id,
      ).length;
    },
    provider_price_id() {
      const meta = this.subscriptionPrice?.meta;
      return meta && typeof meta === "object" ? meta.id || null : null;
    },
  },

  watch: {
    subscriptionPrice() {
      this.assignFromProp();
    },

    currency(currency) {
      if (currency) {
        this.gateway_code = this.subscriptionPrice
          ? this.subscriptionPrice.gateway_code
          : null; // Only in the edit mode we can change the currency!
        this.fetchBillingOptions(currency);
      }
    },
  },
  created() {
    this.assignFromProp();
  },

  methods: {
    t(key, values) {
      return this.$t(`b_product_pricing.editor.${key}`, values);
    },
    addItem() {
      let item = {};
      if (this.subscriptionPrice) {
        item = Object.assign({}, this.subscriptionPrice);
      }

      item.enable = this.enable;

      item.title = this.title;
      item.description = this.description;
      item.sku = this.sku;

      item.price = parseFloat(this.price);
      item.currency = this.currency;
      item.period = this.period;

      item.gateway_code = this.gateway_code;

      this.addOrUpdateSubscriptionPrice(item);
    },

    assignFromProp() {
      this.resetToDefault(); // 🞇 Reset to default

      if (this.subscriptionPrice) {
        this.enable = this.subscriptionPrice.enable;
        this.title = this.subscriptionPrice.title;
        this.description = this.subscriptionPrice.description;
        this.sku = this.subscriptionPrice.sku;
        this.price = this.subscriptionPrice.price;
        this.currency = this.subscriptionPrice.currency;
        this.period = this.subscriptionPrice.period;
        this.gateway_code = this.subscriptionPrice.gateway_code;

        this.price_lock = true;
      }
    },

    //――――――――――――――――――――――― Subscription Price ▶ Add ―――――――――――――――――――――――

    addOrUpdateSubscriptionPrice(subscription_price) {
      this.busy_save = true;

      const params = {
        enable: subscription_price.enable,
        title: subscription_price.title,

        description: subscription_price.description,
        sku: subscription_price.sku,
        price: subscription_price.price,
        currency: subscription_price.currency,
        period: subscription_price.period,

        gateway_code: subscription_price.gateway_code,
      };

      const promise = subscription_price.id
        ? axios.put(
            window.API.PUT_PRODUCT_EDIT_SUBSCRIPTION_PRICE(
              this.shop.id,
              this.product.id,
              subscription_price.id,
            ),
            params,
          )
        : axios.post(
            window.API.POST_PRODUCT_ADD_SUBSCRIPTION_PRICE(
              this.shop.id,
              this.product.id,
            ),
            params,
          );

      promise
        .then(({ data }) => {
          if (!data.error) {
            NotificationService.showSuccessAlert(
              null,
              this.t("saved") +
                (data.extra?.message ? `<hr>${data.extra.message}` : ""),
            );

            // Update current subscription price:
            if (this.subscriptionPrice)
              Object.assign(this.subscriptionPrice, data.subscription_price);

            // Update current product:
            this.AddOrUpdateItemByID(
              this.product.subscription_prices,
              data.subscription_price,
            );

            // Emit update:
            this.$emit("update", data.subscription_price);

            this.$emit("close");
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_save = false;
        });
    },

    fetchBillingOptions() {
      this.busy_billings = true;

      this.gateways = null;

      axios
        .get(
          window.API.GET_PRODUCT_SUBSCRIPTION_PRICE_AVAILABLE_BILLINGS(
            this.shop.id,
          ),
          { params: { currency: this.currency } },
        )
        .then(({ data }) => {
          if (!data.error) {
            this.gateways = data.gateways;
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_billings = false;
        });
    },
  },
};
</script>

<style lang="scss" scoped>
// Focused fullscreen editor: the same shell as the refined variant editor, with one centered form
// column and an inert storefront preview beside it.
.b-pricing-editor {
  display: flex;
  flex-direction: column;
  min-height: 100%;
  border-radius: 0;
  color: rgb(var(--v-theme-on-surface));
  font-size: 14px;
  line-height: 21px;
  letter-spacing: 0;

  &__header {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-shrink: 0;
    padding-block: 18px;
    padding-inline: max(28px, calc((100% - 1124px) / 2));
    border-block-end: 1px solid var(--sd-modern-border);
    background: rgb(var(--v-theme-surface));
  }
  &__heading {
    min-width: 0;
    flex: 1;
  }
  &__heading h2 {
    margin: 0;
    font-size: 21px;
    line-height: 28px;
    font-weight: 500;
    letter-spacing: -0.3px;
  }
  &__heading p {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
    margin: 3px 0 0;
    color: var(--sd-modern-muted);
    font-size: 12px;
    line-height: 18px;
  }
  &__heading p > span:first-child {
    min-width: 0;
    max-width: 420px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  &__heading b {
    white-space: nowrap;
    font-weight: 500;
  }
  &__state {
    font-size: 11px;
    line-height: 16px;
  }
  &__body.v-card-text {
    flex: 1 1 auto;
    min-height: 0;
    padding: 0 !important;
  }
  &__workspace {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 340px;
    gap: 28px;
    align-items: start;
    width: 100%;
    max-width: 1180px;
    padding: 28px;
    margin-inline: auto;
    box-sizing: border-box;
  }
  &__form {
    display: grid;
    gap: 18px;
    min-width: 0;
  }
  &__group {
    padding: 24px 26px;
    border-radius: 18px;
  }
  &__group-header {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    margin-block-end: 18px;
  }
  &__group-header > .v-icon {
    margin-block-start: 2px;
    color: var(--sd-modern-muted);
  }
  &__group-header h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 500;
    line-height: 24px;
  }
  &__group-header p {
    margin: 4px 0 0;
    color: var(--sd-modern-muted);
    font-size: 13px;
    line-height: 20px;
  }
  &__toggle {
    margin-block-end: 8px;
  }
  &__toggle :deep(.rounded-card) {
    border-radius: 18px !important;
    border-color: var(--sd-modern-border) !important;
    padding: 13px 14px !important;
  }
  &__toggle :deep(.mnh > .flex-grow-1 > b) {
    font-size: 13px;
    font-weight: 500;
    line-height: 20px;
  }
  &__toggle :deep(.mnh > .flex-grow-1 > .small) {
    margin-top: 2px;
    font-size: 12px;
    line-height: 19px;
  }
  &__label {
    margin: 4px 0 8px;
    font-size: 12px;
    font-weight: 400;
    line-height: 18px;
    color: var(--sd-modern-muted);
  }
  :deep(.sd-modern-smart-select > .rounded-card > .pp) {
    padding: 13px 14px !important;
  }
  :deep(.sd-modern-smart-select > .rounded-card > .pp:has(.circle-check)) {
    background-color: var(--sd-modern-inset) !important;
  }
  &__hint {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 4px 0 8px;
    color: var(--sd-modern-muted);
    font-size: 13px;
    line-height: 20px;
  }
  &__notice {
    margin: 12px 0 0;
    padding: 12px 14px;
    font-size: 13px;
    line-height: 20px;
  }
  &__notice > span {
    flex: 1 1 0%;
    min-width: 0;
  }
  &__aside {
    position: sticky;
    top: 28px;
    padding: 20px;
    border-radius: 18px;
    min-width: 0;
  }
  &__aside > h3 {
    margin: 0 0 12px;
    font-size: 14px;
    font-weight: 500;
    line-height: 22px;
  }
  &__sketch {
    padding: 16px;
    border: 1.5px dashed
      rgba(var(--sd-modern-illustration-accent-rgb, 147, 66, 193), 0.45);
    border-radius: 16px;
    background:
      linear-gradient(
        180deg,
        rgba(var(--sd-modern-illustration-accent-rgb, 147, 66, 193), 0.05),
        rgba(var(--sd-modern-illustration-accent-rgb, 147, 66, 193), 0) 60%
      ),
      rgb(var(--v-theme-surface));
    font-size: 12px;
    line-height: 18px;
    user-select: none;
  }
  &__sketch-product {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
  }
  &__sketch-product > div {
    min-width: 0;
  }
  &__sketch-product b {
    display: block;
    font-size: 13px;
    font-weight: 500;
    line-height: 20px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  &__sketch-product span {
    color: var(--sd-modern-muted);
  }
  &__sketch-plan {
    margin-block-start: 14px;
    padding: 12px 14px;
    border: 2px solid rgb(var(--v-theme-primary));
    border-radius: 12px;
    background: rgb(var(--v-theme-surface));
  }
  &__sketch-plan > div {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }
  &__sketch-plan > div > b {
    min-width: 0;
    font-size: 13px;
    font-weight: 600;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  &__sketch-radio {
    display: inline-grid;
    place-items: center;
    width: 22px;
    height: 22px;
    flex: 0 0 22px;
    border-radius: 50%;
    background: rgb(var(--v-theme-primary));
    color: rgb(var(--v-theme-on-primary));
  }
  &__sketch-plan strong {
    display: flex;
    align-items: baseline;
    flex-wrap: wrap;
    gap: 6px;
    margin-block-start: 6px;
    font-size: 20px;
    font-weight: 600;
    letter-spacing: -0.3px;
  }
  &__sketch-plan strong > small {
    font-size: 12px;
    font-weight: 400;
    color: var(--sd-modern-muted);
  }
  &__sketch-plan--off {
    border-color: var(--sd-modern-border);
    opacity: 0.55;
  }
  &__sketch-plan--off .b-pricing-editor__sketch-radio {
    background: transparent;
    border: 1px solid rgba(var(--v-theme-on-surface), 0.3);
    color: transparent;
  }
  &__sketch-others {
    margin: 8px 0 0;
    color: var(--sd-modern-muted);
  }
  &__sketch-action {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-height: 36px;
    margin-block-start: 14px;
    border-radius: 10px;
    background-image: repeating-linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.08) 0 8px,
      transparent 8px 16px
    );
    font-weight: 500;
  }
  &__facts {
    display: grid;
    gap: 8px;
    margin: 16px 0 0;
    font-size: 12px;
    line-height: 18px;
  }
  &__facts > div {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    min-width: 0;
  }
  &__facts dt {
    color: var(--sd-modern-muted);
    flex: none;
  }
  &__facts dd {
    margin: 0;
    min-width: 0;
    text-align: end;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  &__actions {
    flex-shrink: 0;
    padding-block: 14px max(14px, env(safe-area-inset-bottom));
    padding-inline: max(28px, calc((100% - 1124px) / 2));
    border-block-start: 1px solid var(--sd-modern-border);
    background: rgb(var(--v-theme-surface));
  }
  &__actions .widget-buttons {
    display: flex;
    flex-direction: row !important;
    justify-content: flex-end;
    gap: 8px;
    width: 100%;
    max-width: none;
    margin: 0;
  }
  &__actions .widget-buttons > .v-btn {
    flex: 0 1 auto;
    min-width: 104px;
    margin: 0;
  }

  @media (max-width: 1000px) {
    &__workspace {
      grid-template-columns: minmax(0, 1fr);
    }
    &__aside {
      position: static;
      order: -1;
    }
  }
  @media (max-width: 599px) {
    &__header {
      padding-inline: 16px;
    }
    &__workspace {
      padding: 16px;
      gap: 16px;
    }
    &__group {
      padding: 18px 16px;
    }
    &__actions {
      padding-inline: 16px;
    }
    &__actions .widget-buttons > .v-btn {
      min-height: 44px;
    }
  }
}
</style>
