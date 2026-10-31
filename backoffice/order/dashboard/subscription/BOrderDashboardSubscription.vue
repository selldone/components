<template>
  <section
    v-if="isSubscription"
    class="sd-modern-widget b-order-subscription text-start"
  >
    <u-widget-header
      icon="autorenew"
      :title="$t('process_center.modern.subscription_title')"
      class="sd-modern-form-header b-order-subscription__header"
    >
      <template #append-actions>
        <span class="sd-modern-status sd-modern-status--plain" role="status">
          <span
            class="sd-modern-status__dot"
            :class="statusDot"
            aria-hidden="true"
          />
          {{ statusLabel }}
        </span>
      </template>
    </u-widget-header>
    <div class="sd-modern-subtitle b-order-subscription__subtitle">
      <p>{{ $t("process_center.modern.subscription_subtitle") }}</p>
      <v-btn
        icon
        variant="text"
        class="sd-modern-icon-button sd-modern-info-button"
        :aria-label="$t('process_center.modern.subscription_title')"
      >
        <v-icon size="15" aria-hidden="true">info_outline</v-icon>
        <v-tooltip
          activator="parent"
          location="top"
          :open-on-focus="true"
          :open-on-click="true"
          content-class="sd-modern-tooltip text-start"
          >{{ $t("process_center.modern.subscription_status_help") }}</v-tooltip
        >
      </v-btn>
    </div>

    <div class="b-order-subscription__plans">
      <div
        v-for="item in items"
        :key="item.id"
        class="b-order-subscription__plan"
      >
        <v-avatar
          class="b-order-subscription__image hover-scale force-top"
          rounded="lg"
          size="48"
        >
          <v-img
            :src="
              getProductImage(
                item.product?.id || item.product_id,
                IMAGE_SIZE_SMALL,
              )
            "
            alt=""
          >
            <template #error><img :src="subscriptionIcon" alt="" /></template>
          </v-img>
        </v-avatar>
        <div class="b-order-subscription__identity">
          <strong>{{
            item.product?.title || $t("global.commons.product")
          }}</strong>
          <div
            v-if="item.subscription_price"
            class="b-order-subscription__plan-title"
          >
            <span>{{
              item.subscription_price.title ||
              $t("process_center.modern.subscription_unnamed_plan")
            }}</span>
            <v-btn
              v-if="item.subscription_price.description"
              icon
              variant="text"
              class="sd-modern-icon-button sd-modern-info-button"
              :aria-label="$t('global.commons.description')"
            >
              <v-icon size="15" aria-hidden="true">info_outline</v-icon>
              <v-tooltip
                activator="parent"
                location="top"
                :open-on-focus="true"
                :open-on-click="true"
                content-class="sd-modern-tooltip text-start"
                >{{ item.subscription_price.description }}</v-tooltip
              >
            </v-btn>
          </div>
          <span v-else class="b-order-subscription__secondary">{{
            $t("process_center.modern.subscription_plan_missing")
          }}</span>
          <span
            v-if="item.product?.title_en"
            class="b-order-subscription__secondary"
            >{{ item.product.title_en }}</span
          >
        </div>
        <div v-if="item.subscription_price" class="b-order-subscription__price">
          <u-price
            v-if="
              item.subscription_price.price !== null &&
              item.subscription_price.price !== undefined &&
              item.subscription_price.currency
            "
            :amount="item.subscription_price.price"
            :currency="item.subscription_price.currency"
          />
          <template
            v-else-if="
              item.subscription_price.price !== null &&
              item.subscription_price.price !== undefined
            "
            ><bdi>{{ item.subscription_price.price }}</bdi
            ><span class="b-order-subscription__secondary">{{
              $t("process_center.modern.subscription_currency_missing")
            }}</span></template
          >
          <span v-else class="b-order-subscription__secondary">{{
            $t("process_center.modern.subscription_price_missing")
          }}</span>
          <span class="b-order-subscription__secondary">{{
            BillingPeriod[item.subscription_price.period]
              ? "/ " + $t(BillingPeriod[item.subscription_price.period].title)
              : $t("process_center.modern.subscription_period_missing")
          }}</span>
        </div>
      </div>
    </div>

    <div v-if="isSubscribed" class="b-order-subscription__next">
      <div>
        <span class="sd-modern-eyebrow">{{
          $t("process_center.modern.subscription_next_estimate")
        }}</span>
        <p>
          {{
            nextPaymentEstimate
              ? getLocalDateString(nextPaymentEstimate)
              : $t("process_center.modern.subscription_next_missing")
          }}
        </p>
      </div>
      <v-btn
        icon
        variant="text"
        class="sd-modern-icon-button sd-modern-info-button"
        :aria-label="$t('process_center.modern.subscription_next_estimate')"
      >
        <v-icon size="15" aria-hidden="true">info_outline</v-icon>
        <v-tooltip
          activator="parent"
          location="top"
          :open-on-focus="true"
          :open-on-click="true"
          content-class="sd-modern-tooltip text-start"
          >{{ $t("process_center.modern.subscription_next_help") }}</v-tooltip
        >
      </v-btn>
    </div>
  </section>
</template>

<script lang="ts">
import { Basket } from "@selldone/core-js";
import { ProductType } from "@selldone/core-js/enums/product/ProductType";
import BillingPeriod from "@selldone/core-js/enums/subscription/BillingPeriod";
import subscriptionIcon from "@selldone/core-js/assets/product-types/subscription.svg";
import DateMixin from "@selldone/components-vue/mixin/date/DateMixin.ts";
import UWidgetHeader from "@selldone/components-vue/ui/widget/header/UWidgetHeader.vue";
import UPrice from "@selldone/components-vue/ui/price/UPrice.vue";

export default {
  name: "BOrderDashboardSubscription",
  components: { UWidgetHeader, UPrice },
  mixins: [DateMixin],
  props: {
    basket: { type: Object, required: true },
    shop: { type: Object, required: true },
  },
  data: () => ({ BillingPeriod, subscriptionIcon }),
  computed: {
    isSubscription() {
      return this.basket.type === ProductType.SUBSCRIPTION.code;
    },
    items() {
      return this.basket.items || [];
    },
    isSubscribed() {
      return this.basket.status === Basket.Status.Payed.code;
    },
    isUnsubscribed() {
      return this.basket.status === Basket.Status.Canceled.code;
    },
    statusLabel() {
      if (this.isSubscribed) return this.$t("global.commons.subscribed");
      if (this.isUnsubscribed) return this.$t("global.commons.unsubscribed");
      const status = Basket.Status[this.basket.status];
      return status
        ? this.$t(status.title)
        : this.$t("process_center.modern.subscription_status_unknown");
    },
    statusDot() {
      if (this.isSubscribed) return "sd-modern-status__dot--success";
      if (this.isUnsubscribed) return "sd-modern-status__dot--error";
      return Basket.Status[this.basket.status]
        ? "sd-modern-status__dot--warning"
        : undefined;
    },
    subscriptionPeriod() {
      return BillingPeriod[
        this.basket.meta?.subscription_period ||
          this.items[0]?.subscription_price?.period
      ];
    },
    nextPaymentEstimate() {
      if (
        !this.isSubscribed ||
        !this.subscriptionPeriod ||
        !this.basket.payment?.payment_at
      )
        return null;
      // Preserve the native fixed-hour estimate; it is not a live provider renewal date.
      const paymentDate = this.basket.payment.payment_at.convertToLocalDate();
      if (!paymentDate || !Number.isFinite(paymentDate.getTime())) return null;
      return paymentDate.addHours(this.subscriptionPeriod.hours);
    },
  },
};
</script>

<style lang="scss" scoped>
.b-order-subscription {
  &.sd-modern-widget {
    padding: 20px;
    margin-block-end: 18px;
    border-radius: 16px;
    font-family: inherit;
    font-size: 12px;
    line-height: 18px;
  }
  &__header {
    align-items: center !important;
    gap: 12px;
  }
  &__header :deep(h2) {
    font-family: inherit;
    font-size: 18px;
    line-height: 24px;
    font-weight: 500;
  }
  &__subtitle {
    display: flex;
    align-items: center;
    gap: 4px;
    margin: 4px 0 20px;
    font-size: 12px;
    line-height: 18px;
  }
  &__subtitle p {
    margin: 0;
  }
  &__plans {
    display: grid;
    gap: 18px;
  }
  &__plan {
    display: flex;
    align-items: center;
    gap: 14px;
    min-width: 0;
  }
  &__plan + &__plan {
    padding-block-start: 18px;
    border-block-start: 1px solid var(--sd-modern-border);
  }
  &__image {
    flex: none;
    background: var(--sd-modern-inset);
    border: 1px solid var(--sd-modern-border);
  }
  &__identity {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
    overflow-wrap: anywhere;
  }
  &__identity > strong {
    font-size: 14px;
    line-height: 21px;
    font-weight: 500;
  }
  &__secondary {
    color: var(--sd-modern-muted);
    font-size: 12px;
    line-height: 18px;
  }
  &__plan-title {
    display: flex;
    align-items: center;
    gap: 4px;
    color: var(--sd-modern-muted);
  }
  &__price {
    display: flex;
    flex-direction: column;
    align-items: end;
    gap: 4px;
    max-width: 40%;
    text-align: end;
  }
  &__price :deep(.u--price) {
    font-size: 14px;
    line-height: 21px;
    font-weight: 500;
  }
  &__price :deep(.u--price .small) {
    font-size: inherit !important;
    font-weight: inherit;
  }
  &__next {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-block-start: 18px;
    padding-block-start: 16px;
    border-block-start: 1px solid var(--sd-modern-border);
  }
  &__next p {
    margin: 5px 0 0;
    font-size: 13px;
    line-height: 20px;
  }
  @media (max-width: 600px) {
    &.sd-modern-widget {
      padding: 17px 13px;
    }
    &__header {
      align-items: stretch !important;
    }
    &__plan {
      flex-wrap: wrap;
      align-items: start;
    }
    &__price {
      flex-basis: 100%;
      max-width: 100%;
      align-items: start;
      padding-inline-start: 62px;
      text-align: start;
    }
  }
}
</style>
