<template>
  <section
    class="b-contact-customer-context text-start"
    :aria-label="$t('shop_contacts.modern.context.title')"
  >
    <header class="b-contact-customer-context__header">
      <h2>{{ $t("shop_contacts.modern.context.title") }}</h2>
      <v-btn
        icon
        variant="text"
        class="sd-modern-icon-button"
        :aria-label="$t('shop_contacts.modern.context.close')"
        @click="$emit('close')"
      >
        <v-icon icon="close" aria-hidden="true" />
        <v-tooltip
          activator="parent"
          location="top"
          content-class="sd-modern-tooltip text-start"
          >{{ $t("shop_contacts.modern.context.close") }}</v-tooltip
        >
      </v-btn>
    </header>

    <div class="b-contact-customer-context__body" :aria-busy="busy">
      <div class="b-contact-customer-context__person">
        <v-avatar size="38" class="hover-scale-small">
          <img
            :src="
              contact?.user_id
                ? getUserAvatar(contact.user_id)
                : require('../../../assets/icons/user.svg')
            "
            :alt="senderName"
          />
        </v-avatar>
        <div>
          <h3 dir="auto">{{ senderName }}</h3>
          <p>
            {{
              $t(
                contact?.user_id
                  ? "shop_contacts.modern.context.registered"
                  : "shop_contacts.modern.context.guest",
              )
            }}
          </p>
        </div>
      </div>
      <p
        v-if="senderEmail"
        class="b-contact-customer-context__email"
        dir="auto"
      >
        {{ senderEmail }}
      </p>

      <p
        v-if="busy && !context"
        class="b-contact-customer-context__message"
        role="status"
      >
        {{ $t("shop_contacts.modern.context.loading") }}
      </p>
      <div
        v-else-if="error"
        class="b-contact-customer-context__message"
        role="status"
      >
        <p>{{ $t("shop_contacts.modern.context.load_error") }}</p>
        <button
          class="b-contact-customer-context__link"
          type="button"
          :disabled="busy"
          @click="fetchContext(true)"
        >
          {{ $t("shop_contacts.modern.context.retry") }}
        </button>
      </div>

      <template v-if="customer">
        <router-link
          v-if="context.links?.customer"
          :to="customerRoute('BPageCustomerDashboard')"
          target="_blank"
          rel="noopener noreferrer"
          class="b-contact-customer-context__link"
        >
          {{ $t("shop_contacts.modern.context.profile") }}
          <v-icon icon="north_east" aria-hidden="true" />
        </router-link>
        <dl class="b-contact-customer-context__facts">
          <div>
            <dt>{{ $t("shop_contacts.modern.context.since") }}</dt>
            <dd>{{ dateLabel(customer.created_at) }}</dd>
          </div>
          <div>
            <dt>
              {{ $t("shop_contacts.modern.context.seen") }}
              <v-btn
                icon
                variant="text"
                class="sd-modern-icon-button sd-modern-info-button"
                :aria-label="$t('shop_contacts.modern.context.seen')"
              >
                <v-icon icon="info_outline" aria-hidden="true" />
                <v-tooltip
                  activator="parent"
                  location="top"
                  open-on-click
                  content-class="sd-modern-tooltip text-start"
                  >{{ $t("shop_contacts.modern.context.seen_help") }}</v-tooltip
                >
              </v-btn>
            </dt>
            <dd
              :title="
                customer.login_at
                  ? getLocalTimeString(customer.login_at)
                  : undefined
              "
            >
              {{
                customer.login_at
                  ? getFromNowString(customer.login_at)
                  : $t("shop_contacts.modern.context.not_recorded")
              }}
            </dd>
          </div>
          <div>
            <dt>{{ $t("shop_contacts.modern.context.country") }}</dt>
            <dd dir="auto">
              {{
                customer.country ||
                $t("shop_contacts.modern.context.not_recorded")
              }}
            </dd>
          </div>
          <div>
            <dt>{{ $t("shop_contacts.modern.context.city") }}</dt>
            <dd dir="auto">
              {{
                customer.address_city ||
                $t("shop_contacts.modern.context.not_recorded")
              }}
            </dd>
          </div>
          <div v-if="activity.latest">
            <dt>{{ $t("shop_contacts.modern.context.channel") }}</dt>
            <dd dir="auto">
              {{
                recordedChannel ||
                $t("shop_contacts.modern.context.not_recorded")
              }}
            </dd>
          </div>
          <div v-if="activity.latest">
            <dt>{{ $t("shop_contacts.modern.context.device") }}</dt>
            <dd dir="auto">
              {{
                recordedDevice ||
                $t("shop_contacts.modern.context.not_recorded")
              }}
            </dd>
          </div>
        </dl>

        <section class="b-contact-customer-context__section">
          <div class="b-contact-customer-context__section-title">
            <div class="b-contact-customer-context__inline">
              <h3>{{ $t("shop_contacts.modern.context.payments") }}</h3>
              <v-btn
                icon
                variant="text"
                class="sd-modern-icon-button sd-modern-info-button"
                :aria-label="$t('shop_contacts.modern.context.payments')"
              >
                <v-icon icon="info_outline" aria-hidden="true" />
                <v-tooltip
                  activator="parent"
                  location="top"
                  open-on-click
                  content-class="sd-modern-tooltip text-start"
                  >{{
                    $t("shop_contacts.modern.context.payments_help")
                  }}</v-tooltip
                >
              </v-btn>
            </div>
            <select
              v-if="payments.length"
              v-model="currency"
              class="b-contact-customer-context__currency"
              :aria-label="$t('shop_contacts.modern.context.currency')"
            >
              <option
                v-for="payment in payments"
                :key="payment.currency"
                :value="payment.currency"
              >
                {{ payment.currency }}
              </option>
            </select>
          </div>
          <div
            v-if="selectedPayment"
            class="b-contact-customer-context__payment"
          >
            <u-price
              :amount="selectedPayment.amount"
              :currency="selectedPayment.currency"
            />
          </div>
          <div v-else class="b-contact-customer-context__message" role="status">
            <p>{{ sectionMessage(context.payments_state, "no_payments") }}</p>
            <button
              v-if="context.payments_state === 'error'"
              class="b-contact-customer-context__link"
              type="button"
              :disabled="busy"
              @click="fetchContext(true)"
            >
              {{ $t("shop_contacts.modern.context.retry") }}
            </button>
          </div>
          <div class="b-contact-customer-context__payment-meta">
            <span>{{ $t("shop_contacts.modern.context.last_purchase") }}</span
            ><span>{{ dateLabel(customer.purchase_at) }}</span>
          </div>
        </section>

        <section class="b-contact-customer-context__section">
          <div class="b-contact-customer-context__section-title">
            <h3>{{ $t("shop_contacts.modern.context.orders") }}</h3>
            <router-link
              v-if="context.links?.orders"
              :to="customerRoute('BPageCustomerOrdersPhysical')"
              target="_blank"
              rel="noopener noreferrer"
              class="b-contact-customer-context__link"
              >{{ $t("shop_contacts.modern.context.order_pages") }}
              <v-icon icon="north_east" aria-hidden="true"
            /></router-link>
          </div>
          <div
            v-for="order in orders"
            :key="`${order.channel}-${order.id}`"
            class="b-contact-customer-context__order"
          >
            <div>
              <router-link
                v-if="orderRoute(order)"
                :to="orderRoute(order)"
                target="_blank"
                rel="noopener noreferrer"
                class="b-contact-customer-context__link"
                >#{{ order.id }} <v-icon icon="north_east" aria-hidden="true"
              /></router-link>
              <span v-else>#{{ order.id }}</span>
              <p class="b-contact-customer-context__order-date">
                {{ dateLabel(order.reserved_at || order.created_at) }}
              </p>
              <p class="b-contact-customer-context__order-date">
                {{
                  $t(
                    order.channel === "pos"
                      ? "shop_contacts.modern.context.pos"
                      : "shop_contacts.modern.context.online",
                  )
                }}
              </p>
            </div>
            <div class="b-contact-customer-context__order-end">
              <u-price
                v-if="order.price !== null && order.price !== undefined"
                :amount="order.price"
                :currency="order.currency"
              />
              <span v-else>{{
                $t("shop_contacts.modern.context.not_recorded")
              }}</span>
              <p class="b-contact-customer-context__status">
                <span
                  class="sd-modern-status__dot"
                  :style="{ backgroundColor: getStatusColor(order.status) }"
                />{{
                  getStatusString(order.status) ||
                  $t("shop_contacts.modern.context.not_recorded")
                }}
              </p>
            </div>
          </div>
          <div
            v-if="!orders.length"
            class="b-contact-customer-context__message"
            role="status"
          >
            <p>{{ sectionMessage(context.orders_state, "no_orders") }}</p>
            <button
              v-if="context.orders_state === 'error'"
              class="b-contact-customer-context__link"
              type="button"
              :disabled="busy"
              @click="fetchContext(true)"
            >
              {{ $t("shop_contacts.modern.context.retry") }}
            </button>
          </div>
        </section>

        <section class="b-contact-customer-context__section">
          <div class="b-contact-customer-context__section-title">
            <h3>{{ $t("shop_contacts.modern.context.activity") }}</h3>
            <router-link
              v-if="context.links?.activity"
              :to="customerRoute('BPageCustomerActivity')"
              target="_blank"
              rel="noopener noreferrer"
              class="b-contact-customer-context__link"
              >{{ $t("shop_contacts.modern.context.details") }}
              <v-icon icon="north_east" aria-hidden="true"
            /></router-link>
          </div>
          <template v-if="activityAvailable && activity.totals">
            <details class="b-contact-customer-context__daily">
              <summary
                :aria-label="$t('shop_contacts.modern.context.chart_help')"
              >
                <div class="b-contact-customer-context__plot-label">
                  <span>{{
                    $t("shop_contacts.modern.context.product_views")
                  }}</span
                  ><strong>{{ activity.totals.products_views }}</strong>
                </div>
                <div
                  class="b-contact-customer-context__bars"
                  aria-hidden="true"
                >
                  <span
                    v-for="day in chartDays"
                    :key="day.date"
                    :style="{
                      height: `${day.views === null ? 0 : (day.views / chartPeak) * 100}%`,
                    }"
                    :title="
                      day.views === null
                        ? `${dateLabel(day.date)}: ${$t('shop_contacts.modern.context.not_recorded')}`
                        : $t('shop_contacts.modern.context.daily_views', {
                            date: dateLabel(day.date),
                            count: day.views,
                          })
                    "
                  />
                </div>
                <div
                  class="b-contact-customer-context__axis"
                  aria-hidden="true"
                >
                  <span>{{ shortDate(activity.period_start) }}</span
                  ><span>{{ shortDate(activity.period_end) }}</span
                  ><v-icon icon="expand_more" size="14" />
                </div>
              </summary>
              <p class="b-contact-customer-context__message">
                {{ $t("shop_contacts.modern.context.chart_help") }}
              </p>
              <dl class="b-contact-customer-context__daily-values">
                <div v-for="day in chartDays" :key="day.date">
                  <dt>{{ dateLabel(day.date) }}</dt>
                  <dd>
                    {{
                      day.views === null
                        ? $t("shop_contacts.modern.context.not_recorded")
                        : day.views
                    }}
                  </dd>
                </div>
              </dl>
            </details>
            <div class="b-contact-customer-context__activity-counts">
              <div>
                <strong>{{ activity.totals.products_views }}</strong
                ><span>{{ $t("shop_contacts.modern.context.views") }}</span>
              </div>
              <div>
                <strong>{{ activity.totals.add_baskets }}</strong
                ><span>{{ $t("shop_contacts.modern.context.adds") }}</span>
              </div>
              <div>
                <strong>{{ activity.totals.buys }}</strong>
                <span class="b-contact-customer-context__inline"
                  >{{ $t("shop_contacts.modern.context.buys") }}
                  <v-btn
                    icon
                    variant="text"
                    class="sd-modern-icon-button sd-modern-info-button"
                    :aria-label="$t('shop_contacts.modern.context.buys')"
                  >
                    <v-icon icon="info_outline" aria-hidden="true" />
                    <v-tooltip
                      activator="parent"
                      location="top"
                      open-on-click
                      content-class="sd-modern-tooltip text-start"
                      >{{
                        $t("shop_contacts.modern.context.buys_help")
                      }}</v-tooltip
                    >
                  </v-btn>
                </span>
              </div>
            </div>
          </template>
          <div v-else class="b-contact-customer-context__message" role="status">
            <p>{{ sectionMessage(activity.state, "no_activity") }}</p>
            <button
              v-if="activity.state === 'error'"
              class="b-contact-customer-context__link"
              type="button"
              :disabled="busy"
              @click="fetchContext(true)"
            >
              {{ $t("shop_contacts.modern.context.retry") }}
            </button>
          </div>
        </section>

        <div
          v-if="customer.segments?.length"
          class="b-contact-customer-context__segments"
          :aria-label="$t('shop_contacts.modern.context.segments')"
        >
          <span v-for="segment in customer.segments" :key="segment">{{
            segment
          }}</span>
        </div>
        <details v-if="customer.notes" class="b-contact-customer-context__note">
          <summary>{{ $t("shop_contacts.modern.context.note") }}</summary>
          <p dir="auto">{{ customer.notes }}</p>
        </details>
      </template>

      <template v-else-if="context">
        <dl class="b-contact-customer-context__facts">
          <div v-if="contact?.category">
            <dt>{{ $t("shop_contacts.modern.context.category") }}</dt>
            <dd dir="auto">{{ categoryName }}</dd>
          </div>
          <div v-if="contact?.url">
            <dt>{{ $t("shop_contacts.modern.context.submitted_from") }}</dt>
            <dd dir="auto">{{ contact.url }}</dd>
          </div>
          <div v-if="contact?.phone">
            <dt>{{ $t("shop_contacts.modern.context.phone") }}</dt>
            <dd dir="auto">{{ contact.phone }}</dd>
          </div>
        </dl>
        <div class="b-contact-customer-context__unavailable" role="status">
          <v-icon icon="person_outline" aria-hidden="true" />
          <h3 v-if="context.state !== 'restricted'">
            {{ $t("shop_contacts.modern.context.no_profile") }}
          </h3>
          <p>
            {{
              $t(
                context.state === "restricted"
                  ? "shop_contacts.modern.context.restricted"
                  : context.state === "guest"
                    ? "shop_contacts.modern.context.guest_help"
                    : "shop_contacts.modern.context.missing_help",
              )
            }}
          </p>
        </div>
      </template>
    </div>
  </section>
</template>

<script lang="ts">
import DateMixin from "@selldone/components-vue/mixin/date/DateMixin.ts";
import OrderMixin from "@selldone/components-vue/mixin/order/OrderMixin.ts";
import UPrice from "@selldone/components-vue/ui/price/UPrice.vue";
import { SupportCategory } from "@selldone/core-js/enums/support/SupportCategory";

export default {
  name: "BContactCustomerContext",
  components: { UPrice },
  mixins: [DateMixin, OrderMixin],
  emits: ["close"],
  props: {
    shop: { type: Object, required: true },
    contact: { type: Object, default: null },
  },
  data: () => ({
    context: null,
    busy: false,
    error: false,
    currency: null,
    requestId: 0,
  }),
  computed: {
    contextKey() {
      return `${this.shop?.id || ""}:${this.contact?.id || ""}`;
    },
    customer() {
      return this.context?.state === "linked" ? this.context.customer : null;
    },
    senderName() {
      return (
        this.customer?.name ||
        this.contact?.user?.name ||
        this.contact?.name ||
        this.$t("global.commons.user")
      );
    },
    senderEmail() {
      return this.customer?.email || this.contact?.email;
    },
    categoryName() {
      const category = SupportCategory[this.contact?.category];
      return category ? this.$t(category.name) : this.contact?.category;
    },
    payments() {
      return this.context?.payments_state === "available"
        ? this.context.payments || []
        : [];
    },
    selectedPayment() {
      return this.payments.find(
        (payment) => payment.currency === this.currency,
      );
    },
    orders() {
      return this.context?.orders_state === "available"
        ? (this.context.orders || []).slice(0, 3)
        : [];
    },
    activity() {
      return this.context?.activity || { state: "unavailable" };
    },
    activityAvailable() {
      return (
        this.activity.state === "available" || this.activity.state === "empty"
      );
    },
    recordedChannel() {
      const latest = this.activity.latest;
      return (
        latest?.channel ||
        [latest?.source, latest?.medium].filter(Boolean).join(" / ")
      );
    },
    recordedDevice() {
      const latest = this.activity.latest;
      return [latest?.device || latest?.type, latest?.os, latest?.browser]
        .filter(Boolean)
        .join(" · ");
    },
    chartDays() {
      if (!this.activityAvailable || !this.activity.period_start) return [];
      const records = new Map(
        (this.activity.series || []).map((day) => [
          day.date,
          day.products_views,
        ]),
      );
      const start = new Date(`${this.activity.period_start}T00:00:00Z`);
      return Array.from({ length: this.activity.period_days }, (_, index) => {
        const date = new Date(start);
        date.setUTCDate(date.getUTCDate() + index);
        const key = date.toISOString().slice(0, 10);
        return { date: key, views: records.has(key) ? records.get(key) : null };
      });
    },
    chartPeak() {
      return Math.max(1, ...this.chartDays.map((day) => day.views || 0));
    },
  },
  watch: {
    contextKey: {
      immediate: true,
      handler() {
        this.fetchContext();
      },
    },
  },
  beforeUnmount() {
    this.requestId++;
  },
  methods: {
    fetchContext(retry = false) {
      const requestId = ++this.requestId;
      if (!retry) {
        this.context = null;
        this.currency = null;
      }
      this.error = false;
      this.busy = false;
      if (!this.shop?.id || !this.contact?.id) return;
      this.busy = true;
      axios
        .get(
          window.API.GET_SHOP_CONTACT_CUSTOMER_CONTEXT(
            this.shop.id,
            this.contact.id,
          ),
        )
        .then(({ data }) => {
          if (requestId !== this.requestId) return;
          if (data.error) {
            this.context = null;
            this.currency = null;
            throw new Error("Customer context unavailable");
          }
          this.context = data;
          if (
            !this.payments.some((payment) => payment.currency === this.currency)
          )
            this.currency = this.payments[0]?.currency || null;
        })
        .catch((error) => {
          if (requestId !== this.requestId) return;
          if ([401, 403, 404].includes(error.response?.status)) {
            this.context = null;
            this.currency = null;
          }
          this.error = true;
        })
        .finally(() => {
          if (requestId === this.requestId) this.busy = false;
        });
    },
    customerRoute(name) {
      return {
        name,
        params: { shop_id: this.shop.id, customer_id: this.customer.id },
      };
    },
    orderRoute(order) {
      // Support access does not grant access to customer/order pages.
      if (order.channel === "pos")
        return this.context.links?.pos_orders
          ? {
              name: "BPageOrderPosDashboard",
              params: { shop_id: this.shop.id, basket_id: order.id },
            }
          : null;
      if (!this.context.links?.orders) return null;
      const route = this.getBasketOrderProcessTo(order);
      return route
        ? { ...route, params: { ...route.params, shop_id: this.shop.id } }
        : null;
    },
    sectionMessage(state, emptyKey) {
      return this.$t(
        `shop_contacts.modern.context.${state === "restricted" ? "restricted" : state === "error" ? "section_error" : state === "empty" || state === "available" ? emptyKey : "unavailable"}`,
      );
    },
    dateLabel(date) {
      if (!date) return this.$t("shop_contacts.modern.context.not_recorded");
      // Daily buckets are calendar dates, so browser timezone must not move them to another day.
      if (/^\d{4}-\d{2}-\d{2}$/.test(date))
        return new Intl.DateTimeFormat(window.$language?.full_locale, {
          year: "numeric",
          month: "long",
          day: "numeric",
          timeZone: "UTC",
          calendar: window.$language?.calendar?.calendar,
        }).format(new Date(`${date}T00:00:00Z`));
      return this.getLocalDateString(date);
    },
    shortDate(date) {
      return date
        ? new Intl.DateTimeFormat(window.$language?.full_locale, {
            month: "short",
            day: "numeric",
            timeZone: "UTC",
          }).format(new Date(`${date}T00:00:00Z`))
        : "";
    },
  },
};
</script>

<style scoped lang="scss">
.b-contact-customer-context {
  --context-line: var(
    --sd-modern-border,
    rgba(var(--v-theme-on-surface), 0.09)
  );
  --context-muted: var(
    --sd-modern-muted,
    rgba(var(--v-theme-on-surface), 0.66)
  );
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  height: 100%;
  background: rgb(var(--v-theme-surface));
  color: rgb(var(--v-theme-on-surface));
  font: inherit;
  font-size: 12px;
  line-height: 19px;

  h2,
  h3,
  p,
  dl {
    margin: 0;
  }
  h2 {
    font-size: 13px;
    line-height: 20px;
    font-weight: 500;
  }
  h3 {
    font-size: 12px;
    line-height: 19px;
    font-weight: 500;
  }
  button,
  select {
    font-family: inherit;
  }
  button:focus-visible,
  select:focus-visible,
  summary:focus-visible,
  a:focus-visible {
    outline: 2px solid rgb(var(--v-theme-primary));
    outline-offset: 3px;
  }
  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    min-height: 67px;
    padding: 16px 17px;
    border-bottom: 1px solid var(--context-line);
    flex-shrink: 0;
  }
  &__body {
    min-height: 0;
    overflow-y: auto;
    overscroll-behavior: contain;
    padding: 18px 17px 20px;
    scrollbar-width: thin;
  }
  &__person {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 13px;
    min-width: 0;
  }
  &__person > div:last-child {
    min-width: 0;
  }
  &__person h3 {
    font-size: 14px;
    line-height: 21px;
    overflow-wrap: anywhere;
  }
  &__person p {
    font-size: 11px;
    line-height: 17px;
    color: var(--context-muted);
    margin-top: 2px;
  }
  &__person img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  &__email {
    font-size: 12px;
    line-height: 19px;
    overflow-wrap: anywhere;
    margin-bottom: 11px !important;
  }
  &__link {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    color: rgb(var(--v-theme-primary));
    text-decoration: none;
    font-size: 11px;
    line-height: 18px;
    background: transparent;
  }
  &__link :deep(.v-icon) {
    font-size: 12px;
    color: inherit;
  }
  &__link:disabled {
    opacity: 0.5;
  }
  &__facts {
    display: grid;
    gap: 8px;
    margin-top: 17px !important;
    font-size: 11px;
    line-height: 17px;
  }
  &__facts > div {
    display: grid;
    grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.2fr);
    gap: 10px;
    align-items: start;
  }
  &__facts dt {
    color: var(--context-muted);
    display: flex;
    align-items: center;
    gap: 3px;
  }
  &__facts dd {
    margin: 0;
    text-align: end;
    overflow-wrap: anywhere;
  }
  &__section {
    border-top: 1px solid var(--context-line);
    margin-top: 19px;
    padding-top: 16px;
  }
  &__section-title,
  &__inline {
    display: flex;
    align-items: center;
    gap: 4px;
  }
  &__section-title {
    justify-content: space-between;
    gap: 8px;
    margin-bottom: 8px;
  }
  &__currency {
    max-width: 80px;
    min-height: 28px;
    padding: 2px 0;
    font-size: 11px;
    color: var(--context-muted);
    background: transparent;
  }
  &__currency option {
    background: rgb(var(--v-theme-surface));
    color: rgb(var(--v-theme-on-surface));
  }
  &__payment {
    font-size: 22px;
    line-height: 30px;
    font-weight: 500;
    letter-spacing: -0.4px;
    font-variant-numeric: tabular-nums;
  }
  &__payment :deep(.u--price) {
    font-size: inherit;
    line-height: inherit;
    font-weight: inherit;
  }
  &__payment-meta {
    display: flex;
    justify-content: space-between;
    gap: 8px;
    font-size: 11px;
    line-height: 17px;
    margin-top: 5px;
  }
  &__payment-meta span:first-child {
    color: var(--context-muted);
  }
  &__order {
    display: flex;
    justify-content: space-between;
    gap: 8px;
    padding: 9px 0;
    border-bottom: 1px solid var(--context-line);
    font-size: 11px;
    line-height: 17px;
  }
  &__order:last-child {
    border: 0;
    padding-bottom: 0;
  }
  &__order .b-contact-customer-context__link {
    font-size: 12px;
  }
  &__order-date {
    color: var(--context-muted);
    font-size: 11px;
    margin-top: 2px !important;
  }
  &__order-end {
    text-align: end;
    font-variant-numeric: tabular-nums;
  }
  &__status {
    display: flex;
    align-items: center;
    justify-content: end;
    gap: 4px;
    margin-top: 2px !important;
    font-size: 11px;
    line-height: 17px;
  }
  &__status .sd-modern-status__dot {
    flex-shrink: 0;
    width: 5px;
    height: 5px;
  }
  &__daily summary {
    cursor: pointer;
    list-style: none;
  }
  &__daily summary::-webkit-details-marker {
    display: none;
  }
  &__plot-label {
    display: flex;
    justify-content: space-between;
    gap: 8px;
    color: var(--context-muted);
    font-size: 11px;
    margin: 3px 0 8px;
  }
  &__plot-label strong {
    color: rgb(var(--v-theme-on-surface));
    font-weight: 500;
  }
  &__bars {
    height: 52px;
    display: grid;
    grid-template-columns: repeat(30, minmax(0, 1fr));
    gap: 2px;
    align-items: end;
    border-bottom: 1px solid var(--context-line);
  }
  &__bars > span {
    background: rgb(var(--v-theme-primary));
    opacity: 0.65;
    border-radius: 2px 2px 0 0;
  }
  &__axis {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 4px;
    color: var(--context-muted);
    font-size: 11px;
    line-height: 17px;
    margin-top: 4px;
  }
  &__daily-values {
    max-height: 180px;
    overflow-y: auto;
    margin-top: 8px !important;
  }
  &__daily-values > div {
    display: flex;
    justify-content: space-between;
    gap: 8px;
    padding: 4px 0;
    font-size: 11px;
  }
  &__daily-values dd {
    margin: 0;
    text-align: end;
  }
  &__activity-counts {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 5px;
    margin-top: 11px;
  }
  &__activity-counts strong {
    display: block;
    font-size: 14px;
    font-weight: 500;
    line-height: 22px;
    font-variant-numeric: tabular-nums;
  }
  &__activity-counts span {
    color: var(--context-muted);
    font-size: 11px;
    line-height: 17px;
  }
  &__segments {
    display: flex;
    gap: 5px;
    flex-wrap: wrap;
    margin-top: 18px;
  }
  &__segments > span {
    border: 1px solid var(--context-line);
    border-radius: 5px;
    padding: 2px 6px;
    font-size: 11px;
    line-height: 17px;
    overflow-wrap: anywhere;
  }
  &__note {
    margin-top: 15px;
    font-size: 11px;
    line-height: 18px;
  }
  &__note summary {
    cursor: pointer;
    color: var(--context-muted);
  }
  &__note p {
    padding-top: 8px;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }
  &__message {
    color: var(--context-muted);
    font-size: 11px;
    line-height: 18px;
  }
  &__message .b-contact-customer-context__link {
    margin-top: 5px;
  }
  &__unavailable {
    margin-top: 22px;
    padding: 18px 0;
    border-top: 1px solid var(--context-line);
  }
  &__unavailable > .v-icon {
    color: var(--context-muted);
    font-size: 23px;
    margin-bottom: 8px;
  }
  &__unavailable h3 {
    margin-bottom: 6px;
  }
  &__unavailable p {
    color: var(--context-muted);
    font-size: 11px;
    line-height: 18px;
  }
}
@media (max-width: 700px), (pointer: coarse) {
  .b-contact-customer-context {
    &__link,
    &__currency,
    &__note summary {
      min-height: 44px;
    }
    &__currency {
      font-size: 16px;
    }
    &__note summary {
      display: flex;
      align-items: center;
    }
    &__link {
      align-items: center;
    }
    &__section-title {
      flex-wrap: wrap;
    }
  }
}
</style>
