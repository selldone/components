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
  <article
    v-if="modern"
    class="b-affiliate-card-modern sd-modern-widget sd-modern-clickable-item text-start"
    :aria-label="affiliate.name"
  >
    <header class="b-affiliate-card-modern__header">
      <v-avatar
        class="b-affiliate-card-modern__logo hover-scale"
        rounded="lg"
        size="39"
      >
        <v-img
          :src="getShopIcon(affiliate.shop_id)"
          :alt="affiliate.shop.title"
        />
      </v-avatar>
      <div class="b-affiliate-card-modern__identity">
        <h2>
          <router-link
            :to="contract_to"
            class="b-affiliate-card-modern__contract-link"
            >{{ affiliate.name }}</router-link
          >
        </h2>
        <div class="b-affiliate-card-modern__shop">
          <span>{{ affiliate.shop.title }}</span
          ><span aria-hidden="true">·</span
          ><span dir="ltr">@{{ affiliate.shop.name }}</span>
        </div>
      </div>
      <span
        class="sd-modern-status sd-modern-status--plain b-affiliate-card-modern__status"
      >
        <span
          class="sd-modern-status__dot"
          :class="
            affiliate.enable
              ? 'sd-modern-status__dot--success'
              : 'sd-modern-status__dot--error'
          "
        />
        {{
          $t(
            affiliate.enable
              ? "global.commons.active"
              : "global.commons.inactive",
          )
        }}
      </span>
    </header>

    <div class="b-affiliate-card-modern__money">
      <div class="b-affiliate-card-modern__metric">
        <div class="b-affiliate-card-modern__label">
          {{ $t("global.commons.balance") }}
          <v-tooltip
            location="top"
            content-class="sd-modern-tooltip text-start"
            :open-on-focus="true"
            :persistent="false"
            open-on-click
          >
            <template #activator="{ props }">
              <button
                v-bind="props"
                type="button"
                class="sd-modern-info-button"
                :aria-label="$t('my_affiliate.balance_help')"
                @click.stop
              >
                <v-icon size="14" aria-hidden="true">info_outline</v-icon>
              </button>
            </template>
            {{ $t("my_affiliate.balance_help") }}
          </v-tooltip>
        </div>
        <u-price
          :amount="affiliate.balance"
          :currency="affiliate.currency"
          class="b-affiliate-card-modern__balance"
        />
        <span class="b-affiliate-card-modern__currency">{{
          affiliate.currency
        }}</span>
      </div>
      <div class="b-affiliate-card-modern__metric">
        <div class="b-affiliate-card-modern__label">
          {{ $t("my_affiliate.total_paid") }}
          <v-tooltip
            location="top"
            content-class="sd-modern-tooltip text-start"
            :open-on-focus="true"
            :persistent="false"
            open-on-click
          >
            <template #activator="{ props }">
              <button
                v-bind="props"
                type="button"
                class="sd-modern-info-button"
                :aria-label="$t('my_affiliate.payment_help')"
                @click.stop
              >
                <v-icon size="14" aria-hidden="true">info_outline</v-icon>
              </button>
            </template>
            {{ $t("my_affiliate.payment_help") }}
          </v-tooltip>
        </div>
        <u-price
          :amount="affiliate.payment"
          :currency="affiliate.currency"
          class="b-affiliate-card-modern__payment"
        />
      </div>
    </div>

    <div class="b-affiliate-card-modern__terms">
      <h3 class="sd-modern-list-header">
        {{ $t("global.commons.commission") }}
      </h3>
      <div
        v-if="affiliate.commission"
        class="b-affiliate-card-modern__per-product"
      >
        <v-icon size="17" aria-hidden="true">grain</v-icon
        >{{ $t("global.commons.per_product") }}
        <v-tooltip
          location="top"
          content-class="sd-modern-tooltip text-start"
          :open-on-focus="true"
          :persistent="false"
          open-on-click
        >
          <template #activator="{ props }">
            <button
              v-bind="props"
              type="button"
              class="sd-modern-info-button"
              :aria-label="$t('my_affiliate.per_product_help')"
              @click.stop
            >
              <v-icon size="14" aria-hidden="true">info_outline</v-icon>
            </button>
          </template>
          {{ $t("my_affiliate.per_product_help") }}
        </v-tooltip>
      </div>
      <template v-else>
        <u-text-value-dashed>
          <template #label>{{ $t("global.commons.fix_commission") }}</template>
          <u-price :amount="affiliate.fix" :currency="affiliate.currency" />
        </u-text-value-dashed>
        <u-text-value-dashed>
          <template #label>{{
            $t("global.commons.percent_commission")
          }}</template>
          <span dir="ltr">{{ affiliate.percent }}%</span>
        </u-text-value-dashed>
      </template>
    </div>

    <div class="b-affiliate-card-modern__scope">
      <div class="b-affiliate-card-modern__scope-label">
        <v-icon size="17" aria-hidden="true">{{
          product_ids.length ? "inventory_2" : "all_inclusive"
        }}</v-icon>
        {{
          $t(
            product_ids.length
              ? "my_affiliate.selected_products"
              : "my_affiliate.all_products",
          )
        }}
      </div>
      <products-dense-images-circles
        v-if="product_ids.length"
        :ids="product_ids"
        class="b-affiliate-card-modern__products"
      />
    </div>

    <div
      v-if="
        affiliate.email ||
        affiliate.web ||
        affiliate.tel ||
        affiliate.address ||
        affiliate.bank
      "
      class="b-affiliate-card-modern__contacts"
    >
      <span v-if="affiliate.email"
        ><v-icon size="15" :aria-label="$t('global.commons.email')"
          >email</v-icon
        >{{ affiliate.email }}</span
      >
      <span v-if="affiliate.web"
        ><v-icon size="15" :aria-label="$t('global.commons.website')"
          >link</v-icon
        >{{ affiliate.web }}</span
      >
      <span v-if="affiliate.tel"
        ><v-icon size="15" :aria-label="$t('global.commons.phone')"
          >local_phone</v-icon
        >{{ affiliate.tel }}</span
      >
      <span v-if="affiliate.address"
        ><v-icon size="15" :aria-label="$t('global.commons.address')"
          >near_me</v-icon
        >{{ affiliate.address }}</span
      >
      <span v-if="affiliate.bank"
        ><v-icon size="15" :aria-label="$t('global.commons.bank')"
          >account_balance</v-icon
        >{{ affiliate.bank }}</span
      >
    </div>

    <div class="b-affiliate-card-modern__link-block">
      <u-text-value-dashed class="b-affiliate-card-modern__code">
        <template #label>{{ $t("global.commons.code") }}</template>
        <span dir="ltr">{{ affiliate.code }}</span>
      </u-text-value-dashed>
      <div class="b-affiliate-card-modern__url-row">
        <span class="b-affiliate-card-modern__url" dir="ltr">{{
          affiliate_link
        }}</span>
        <v-tooltip
          location="top"
          content-class="sd-modern-tooltip text-start"
          :open-on-focus="true"
          :persistent="false"
        >
          <template #activator="{ props }">
            <!-- The copy directive captures its initial value. Refresh it with the link. -->
            <button
              :key="affiliate_link"
              v-bind="props"
              v-copy="affiliate_link"
              type="button"
              class="sd-modern-icon-button b-affiliate-card-modern__copy"
              :aria-label="$t('my_affiliate.copy_link')"
              @click.stop
            >
              <v-icon size="16" aria-hidden="true">content_copy</v-icon>
            </button>
          </template>
          {{ $t("my_affiliate.copy_link") }}
        </v-tooltip>
      </div>
    </div>
    <footer class="b-affiliate-card-modern__footer">
      <span
        >{{ $t("global.commons.created_at") }}
        {{ getLocalTimeString(affiliate.created_at, true) }}</span
      >
      <router-link
        :to="contract_to"
        class="sd-modern-button sd-modern-button--inline sd-modern-button--compact b-affiliate-card-modern__open"
      >
        {{ $t("my_affiliate.view_contract")
        }}<v-icon
          size="16"
          aria-hidden="true"
          :class="{
            'b-affiliate-card-modern__arrow--rtl': $vuetify.locale.isRtl,
          }"
          >arrow_forward</v-icon
        >
      </router-link>
    </footer>
  </article>
  <s-widget
    v-else
    :title="`
<span class='circle ${
      affiliate.enable ? 'bg-success' : 'bg-danger'
    } mr-sm' style='font-size: 6px;'></span>
${affiliate.name}
<small class='float-end ms-2'> @${affiliate.shop.name}</small>`"
    class="widget-hover pointer-pointer"
    custom-header
  >
    <div class="my-2 d-flex align-center">
      <v-avatar class="hover-scale avatar-gradient -thin -shop" size="24">
        <v-img :src="getShopIcon(affiliate.shop_id)" />
      </v-avatar>

      <b class="mx-2">{{ affiliate.shop.title }}</b>
      <v-spacer></v-spacer>
      <small>
        {{ getLocalTimeString(affiliate.created_at, true) }}
      </small>
    </div>

    <u-text-value-dashed>
      <template v-slot:label>
        {{ $t("global.commons.code") }}
      </template>
      {{ affiliate.code }}
    </u-text-value-dashed>

    <div class="mb-2">
      <v-icon class="me-2">link</v-icon>
      <span v-copy @click.stop
        >{{
          affiliate.shop.domain
            ? affiliate.shop.domain
            : `${window.URLS.MainServiceUrl()}/@${affiliate.shop.name}`
        }}?utm_affiliate={{ affiliate.code }}</span
      >
    </div>

    <v-row class="small" dense>
      <v-col v-if="affiliate.email">
        <v-icon>email</v-icon>
        {{ affiliate.email }}
      </v-col>
      <v-col v-if="affiliate.web">
        <v-icon>link</v-icon>
        {{ affiliate.web }}
      </v-col>
      <v-col v-if="affiliate.tel">
        <v-icon>local_phone</v-icon>
        {{ affiliate.tel }}
      </v-col>
      <v-col v-if="affiliate.address">
        <v-icon>near_me</v-icon>
        {{ affiliate.address }}
      </v-col>
      <v-col v-if="affiliate.bank">
        <v-icon>account_balance</v-icon>
        {{ affiliate.bank }}
      </v-col>
    </v-row>

    <products-dense-images-circles
      v-if="affiliate.products && Object.keys(affiliate.products).length"
      :ids="Object.keys(affiliate.products)"
    ></products-dense-images-circles>
    <span v-else>{{ $t("global.commons.apply_for_all_products") }}</span>

    <v-row class="d-flex text-center" dense justify="center">
      <v-col class="d-flex align-center" cols="12">
        <small>{{ $t("global.commons.balance") }}</small>
        <span class="dashed-flex-space"></span>
        <u-price
          :amount="affiliate.balance"
          :currency="affiliate.currency"
          class="text-success"
          x-large
        ></u-price>
      </v-col>

      <v-col
        v-if="affiliate.commission"
        class="border-end d-flex flex-column"
        cols="4"
      >
        <small>{{ $t("global.commons.per_product") }} </small>
        <v-icon color="#111">grain</v-icon>
      </v-col>
      <template v-else>
        <v-col class="border-end d-flex flex-column" cols="4">
          <small>{{ $t("global.commons.fix_commission") }} </small>
          <u-price
            :amount="affiliate.fix"
            :currency="affiliate.currency"
          ></u-price>
        </v-col>

        <v-col class="border-end d-flex flex-column" cols="4">
          <small>{{ $t("global.commons.percent_commission") }} </small>
          {{ affiliate.percent }}%
        </v-col>
      </template>

      <v-col class="d-flex flex-column" cols="4">
        <small>{{ $t("global.commons.total_payment") }} </small>
        <u-price
          :amount="affiliate.payment"
          :currency="affiliate.currency"
        ></u-price>
      </v-col>
    </v-row>
  </s-widget>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import ProductsDenseImagesCircles from "../../../storefront/product/products-dense-images-circles/ProductsDenseImagesCircles.vue";
import UTextValueDashed from "../../../ui/text/value-dashed/UTextValueDashed.vue";
import UPrice from "../../../ui/price/UPrice.vue";
import DateMixin from "@selldone/components-vue/mixin/date/DateMixin.ts";

export default defineComponent({
  name: "BAffiliateCard",
  mixins: [DateMixin],
  components: { UTextValueDashed, ProductsDenseImagesCircles, UPrice },
  props: {
    modern: { type: Boolean, default: false },
    to: { type: [String, Object], default: null },
    affiliate: {
      require: true,
      type: Object,
    },
  },
  computed: {
    contract_to() {
      return (
        this.to || {
          name: "BPageAffiliatorDashboard",
          params: { affiliate_id: this.affiliate.id },
        }
      );
    },
    affiliate_link() {
      return `${this.affiliate.shop.domain || `${window.URLS.MainServiceUrl()}/@${this.affiliate.shop.name}`}?utm_affiliate=${this.affiliate.code}`;
    },
    product_ids() {
      return Object.keys(this.affiliate.products || {});
    },
  },
});
</script>

<style lang="scss" scoped>
.b-affiliate-card-modern {
  position: relative;
  isolation: isolate;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-width: 0;
  padding: 21px 20px 0;
  border: 0;
  border-radius: 17px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 400;
  line-height: 1.5;

  &__header {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    min-width: 0;
  }
  &__logo {
    flex-shrink: 0;
    overflow: visible;
    border-radius: 12px !important;
  }
  &__identity {
    flex: 1;
    min-width: 0;
  }
  &__identity h2 {
    margin: 0;
    font-size: 17px;
    font-weight: 500;
    line-height: 23px;
    letter-spacing: -0.2px;
    overflow-wrap: anywhere;
  }
  &__contract-link {
    color: inherit;
    text-decoration: none;
  }
  &__contract-link::after {
    content: "";
    position: absolute;
    inset: 0;
    z-index: 1;
    border-radius: 17px;
  }
  &__contract-link:focus-visible {
    outline: none;
  }
  &__contract-link:focus-visible::after {
    outline: 2px solid rgb(var(--v-theme-primary));
    outline-offset: 3px;
  }

  // Keep copy, tooltip and product inspection above the native full-card link.
  &__copy,
  &__open,
  &__products,
  .sd-modern-info-button {
    position: relative;
    z-index: 2;
  }
  &__shop {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 4px;
    margin-block-start: 4px;
    color: var(--sd-modern-muted);
    font-size: 12px;
    overflow-wrap: anywhere;
  }
  &__status {
    flex-shrink: 0;
    gap: 5px;
    padding-block-start: 3px;
    font-size: 11px;
    font-weight: 400;
    line-height: 17px;
  }
  &__money {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
    margin-block: 26px 23px;
  }
  &__metric {
    min-width: 0;
  }
  &__label {
    display: flex;
    align-items: center;
    gap: 5px;
    color: var(--sd-modern-muted);
    font-size: 11px;
    font-weight: 400;
    line-height: 17px;
  }
  & &__balance.u--price {
    display: block;
    margin-block-start: 3px;
    font-size: 29px;
    font-weight: 500;
    line-height: 38px;
    letter-spacing: -0.8px;
    font-variant-numeric: tabular-nums;
    overflow-wrap: anywhere;
  }
  & &__balance.u--price :deep(.small) {
    font-size: 16px !important;
    font-weight: 400;
    letter-spacing: -0.2px;
  }
  & &__payment.u--price {
    display: block;
    margin-block-start: 8px;
    font-size: 17px;
    font-weight: 400;
    line-height: 29px;
    font-variant-numeric: tabular-nums;
    overflow-wrap: anywhere;
  }
  & &__payment.u--price :deep(.small) {
    font-size: inherit !important;
    font-weight: inherit;
  }
  &__currency {
    display: block;
    margin-block-start: 1px;
    color: var(--sd-modern-muted);
    font-size: 10px;
    line-height: 15px;
    letter-spacing: 0.5px;
  }
  &__terms {
    flex: 1;
    min-height: 99px;
    padding-block-start: 15px;
    border-block-start: 1px solid var(--sd-modern-border);
  }
  &__terms h3 {
    margin: 0 0 8px;
  }
  &__terms .s--value-dashed {
    font-size: 12px;
  }
  &__per-product {
    display: flex;
    align-items: center;
    gap: 8px;
    padding-block: 5px 10px;
    font-size: 12px;
  }
  &__scope {
    margin-block: 13px 19px;
    color: var(--sd-modern-muted);
    font-size: 12px;
  }
  &__scope-label {
    display: flex;
    align-items: center;
    gap: 7px;
  }
  &__products {
    margin-block: 5px -6px;
    max-width: 100%;
  }
  &__contacts {
    display: grid;
    gap: 6px;
    margin-block-end: 16px;
    font-size: 12px;
  }
  &__contacts > span {
    display: flex;
    align-items: flex-start;
    gap: 7px;
    overflow-wrap: anywhere;
  }
  &__contacts .v-icon {
    flex-shrink: 0;
    margin-block-start: 2px;
    color: var(--sd-modern-muted);
  }
  &__link-block {
    border-block-start: 1px solid var(--sd-modern-border);
    padding-block: 10px 15px;
  }
  &__code {
    color: var(--sd-modern-muted);
    font-size: 11px;
    line-height: 17px;
  }
  &__code > span {
    color: rgb(var(--v-theme-on-surface));
    letter-spacing: 0.2px;
  }
  &__url-row {
    display: flex;
    align-items: center;
    gap: 9px;
    margin-block-start: 5px;
  }
  &__url {
    flex: 1;
    min-width: 0;
    color: var(--sd-modern-muted);
    font-size: 11px;
    line-height: 17px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  &__copy {
    --sd-modern-icon-button-size: 32px;
    border-radius: 8px;
  }
  &__footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 8px;
    min-height: 57px;
    border-block-start: 1px solid var(--sd-modern-border);
    color: var(--sd-modern-muted);
    font-size: 10px;
    line-height: 17px;
  }
  &__open {
    margin-inline-start: auto;
    color: rgb(var(--v-theme-primary));
    font-family: inherit;
    text-decoration: none;
  }
  &__arrow--rtl {
    transform: scaleX(-1);
  }
  .sd-modern-info-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 17px;
    height: 17px;
    padding: 0;
    border: 0;
    border-radius: 50%;
    background: transparent;
    color: var(--sd-modern-muted);
  }
  &__copy:focus-visible,
  &__open:focus-visible,
  .sd-modern-info-button:focus-visible {
    outline: 2px solid rgb(var(--v-theme-primary));
    outline-offset: 3px;
  }

  @media (max-width: 600px), (pointer: coarse) {
    &__copy {
      --sd-modern-icon-button-size: 44px;
    }
    .sd-modern-info-button {
      min-width: 44px;
      min-height: 44px;
      margin-block: -13px;
    }
    &__open {
      min-height: 44px;
    }
  }
}
</style>
