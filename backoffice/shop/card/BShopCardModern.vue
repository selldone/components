<template>
  <article
    class="b-shop-card-modern text-start"
    :class="{ 'b-shop-card-modern--compact': compact }"
    :aria-label="shop.title"
  >
    <div class="b-shop-card-modern__summary">
      <div class="b-shop-card-modern__identity">
        <v-avatar class="b-shop-card-modern__logo" rounded="lg" size="38">
          <img
            v-if="shop.icon"
            :src="getShopImagePath(shop.icon, 128)"
            alt=""
          />
          <v-icon v-else size="22" aria-hidden="true">storefront</v-icon>
        </v-avatar>
        <div class="b-shop-card-modern__name">
          <router-link
            :to="dashboard_to"
            class="b-shop-card-modern__dashboard-link"
            >{{ shop.title }}</router-link
          >
          <div class="b-shop-card-modern__handle-row">
            <span class="b-shop-card-modern__handle" dir="ltr"
              >@{{ shop.name }}</span
            >
            <span
              v-if="isSample"
              class="sd-modern-status sd-modern-status--plain b-shop-card-modern__sample"
            >
              <v-icon size="12" aria-hidden="true">science</v-icon
              >{{ $t("global.commons.demo") }}
            </span>
          </div>
          <span
            v-if="shop.penalty"
            class="sd-modern-status sd-modern-status--plain"
            ><v-icon size="15" color="warning" aria-hidden="true">report</v-icon
            >{{ $t("user_dashboard.shops.modern.penalty") }}</span
          >
        </div>
        <v-menu>
          <template #activator="{ props }">
            <button
              v-bind="props"
              type="button"
              class="sd-modern-icon-button b-shop-card-modern__menu-button"
              aria-haspopup="menu"
              :aria-label="
                $t('user_dashboard.shops.modern.shop_actions') +
                ' · ' +
                shop.title
              "
              v-tooltip="tip('shop_actions')"
            >
              <v-icon size="17" aria-hidden="true">more_horiz</v-icon>
            </button>
          </template>
          <v-list
            class="b-shop-card-modern__sections text-start"
            density="compact"
            :aria-label="$t('user_dashboard.shops.modern.shop_actions')"
          >
            <v-list-item
              v-for="section in shop_sections"
              :key="section.to.name"
              :to="section.to"
              :title="$t(section.label)"
            >
              <template #prepend
                ><v-icon size="18" aria-hidden="true">{{
                  section.icon
                }}</v-icon></template
              >
            </v-list-item>
          </v-list>
        </v-menu>
      </div>

      <div v-if="!compact" class="b-shop-card-modern__context">
        <span class="sd-modern-status sd-modern-status--plain">
          <span
            class="sd-modern-status__dot"
            :class="shop.active ? 'text-success' : 'text-medium-emphasis'"
          />
          {{
            $t(
              shop.active ? "global.commons.active" : "global.commons.inactive",
            )
          }}
        </span>
        <span v-if="business_model">{{ $t(business_model.name) }}</span>
      </div>

      <div class="b-shop-card-modern__access">
        <span
          v-if="is_owner && !permissions.length"
          class="b-shop-card-modern__owner"
        >
          <v-icon size="13" aria-hidden="true">fa:fas fa-crown</v-icon
          >{{ $t("global.commons.owner") }}
        </span>
        <span v-else-if="!permissions.length">—</span>
        <v-tooltip
          v-if="permissions.length"
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
              class="b-shop-card-modern__roles"
              :aria-label="
                is_owner
                  ? $t('global.commons.owner') + ' · ' + permission_names
                  : permission_names
              "
            >
              <v-icon v-if="is_owner" size="13" aria-hidden="true"
                >fa:fas fa-crown</v-icon
              >
              <img
                v-else
                :src="permissions[0].src"
                alt=""
                width="14"
                height="14"
              />
              <span>{{
                is_owner ? $t("global.commons.owner") : $t(permissions[0].text)
              }}</span
              ><span v-if="is_owner || permissions.length > 1"
                >+{{
                  is_owner ? permissions.length : permissions.length - 1
                }}</span
              >
            </button>
          </template>
          <div v-if="is_owner">{{ $t("global.commons.owner") }}</div>
          <div
            v-for="(permission, index) in permissions"
            :key="index"
            class="b-shop-card-modern__permission-detail"
          >
            <img :src="permission.src" alt="" width="14" height="14" />
            {{ $t(permission.text) }} · {{ $t(permission.description) }}
          </div>
        </v-tooltip>
      </div>

      <div class="b-shop-card-modern__license">
        <span
          ><img
            :src="getShopLicenseIcon(shop.license)"
            alt=""
            width="18"
            height="18"
          />{{ getShopLicenseName(shop.license) }}</span
        >
        <v-tooltip
          v-if="compact"
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
              class="b-shop-card-modern__expiry"
              :aria-label="
                $t('user_dashboard.shops.shop_card.expire') +
                ': ' +
                expiry_label
              "
            >
              <v-icon
                v-if="license_expired"
                size="13"
                color="warning"
                aria-hidden="true"
                >schedule</v-icon
              >
              <span>{{ expiry_label }}</span>
            </button>
          </template>
          {{ $t("user_dashboard.shops.shop_card.expire") }}:
          {{
            shop.expire_at
              ? getLocalDateString(shop.expire_at)
              : $t("user_dashboard.shops.modern.no_expiry")
          }}
        </v-tooltip>
      </div>

      <div class="b-shop-card-modern__primary">
        <div class="b-shop-card-modern__metric b-shop-card-modern__products">
          <b-shop-card-products :last-data="last_data" modern />
        </div>
        <div class="b-shop-card-modern__metric b-shop-card-modern__visitors">
          <b-shop-card-visitors :last-data="last_data" modern />
        </div>
      </div>
      <div class="b-shop-card-modern__metric b-shop-card-modern__orders">
        <v-menu v-if="queue_total > 0" :close-on-content-click="true">
          <template #activator="{ props }">
            <button
              v-bind="props"
              type="button"
              class="b-shop-card-modern__orders-button"
            >
              <v-icon size="14" aria-hidden="true">shopping_bag</v-icon>
              {{
                $t(
                  "user_dashboard.shops.modern.orders_to_process",
                  {
                    count: format(queue_total),
                  },
                  queue_total,
                )
              }}
              <v-icon size="14" aria-hidden="true">expand_more</v-icon>
            </button>
          </template>
          <v-card
            class="sd-modern-widget b-shop-card-modern__order-menu text-start"
          >
            <h3 class="sd-modern-title-text">
              {{ $t("user_dashboard.shops.modern.process_orders") }}
            </h3>
            <p class="sd-modern-subtitle">
              {{ $t("user_dashboard.shops.modern.queue_scope") }}
            </p>
            <div
              v-for="item in order_types"
              :key="item.code"
              class="b-shop-card-modern__order-row"
            >
              <router-link
                v-if="item.value > 0"
                :to="{ name: item.route, params: { shop_id: shop.id } }"
              >
                <img :src="item.image" alt="" width="18" height="18" />{{
                  $t(item.label)
                }}
              </router-link>
              <span v-else
                ><img :src="item.image" alt="" width="18" height="18" />{{
                  $t(item.label)
                }}</span
              >
              <span>{{ format(item.value) }}</span>
            </div>
          </v-card>
        </v-menu>
        <span v-else class="b-shop-card-modern__order-status"
          ><v-icon size="14" aria-hidden="true">shopping_bag</v-icon>
          {{
            $t(
              queue_total === 0
                ? "user_dashboard.shops.modern.no_orders_to_process"
                : "user_dashboard.shops.modern.queue_unavailable",
            )
          }}</span
        >
        <button
          v-if="!compact"
          type="button"
          class="b-shop-card-modern__period"
          :aria-label="statistics_help"
          v-tooltip="{
            ...tip('report_scope'),
            text: statistics_help,
            openOnClick: true,
          }"
        >
          {{ report_date }}
        </button>
      </div>
      <button
        v-if="compact"
        type="button"
        class="sd-modern-icon-button b-shop-card-modern__expand"
        :aria-expanded="expanded"
        :aria-controls="details_id"
        :aria-label="
          $t('user_dashboard.shops.modern.details') + ' · ' + shop.title
        "
        v-tooltip="tip('details')"
        @click="expanded = !expanded"
      >
        <v-icon size="20" aria-hidden="true">{{
          expanded ? "expand_less" : "expand_more"
        }}</v-icon>
      </button>
    </div>

    <div
      v-show="!compact || expanded"
      :id="details_id"
      class="b-shop-card-modern__details"
    >
      <section class="b-shop-card-modern__activity">
        <div v-if="compact" class="b-shop-card-modern__context">
          <span class="sd-modern-status sd-modern-status--plain">
            <span
              class="sd-modern-status__dot"
              :class="shop.active ? 'text-success' : 'text-medium-emphasis'"
            />
            {{
              $t(
                shop.active
                  ? "global.commons.active"
                  : "global.commons.inactive",
              )
            }}
          </span>
          <span v-if="business_model">{{ $t(business_model.name) }}</span>
        </div>
        <p v-if="compact" class="b-shop-card-modern__scope">
          {{ report_date }}
          <v-tooltip
            location="top"
            content-class="sd-modern-tooltip text-start"
            :open-on-focus="true"
            :persistent="false"
            open-on-click
          >
            <template #activator="{ props }"
              ><button
                v-bind="props"
                type="button"
                class="sd-modern-info-button"
                :aria-label="$t('global.commons.help')"
              >
                <v-icon size="15" aria-hidden="true">info_outline</v-icon>
              </button></template
            >
            {{ statistics_help }}
          </v-tooltip>
        </p>
        <div
          v-if="showEngagement"
          class="b-shop-card-modern__engagement"
          :aria-label="$t('user_dashboard.shops.shop_card.user_behavior')"
        >
          <v-tooltip
            v-for="item in engagement"
            :key="item.key"
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
                class="b-shop-card-modern__engagement-item"
                :aria-label="
                  $t(item.label) +
                  ': ' +
                  (item.value === null ? '—' : item.value)
                "
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.7"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path :d="item.path" /></svg
                ><span>{{ format(item.value) }}</span>
              </button>
            </template>
            <div>
              {{ $t(item.label) }}:
              {{ item.value === null ? "—" : numeralFormat(item.value, "0,0") }}
            </div>
            <div v-if="item.key !== 'total_views'">{{ report_date }}</div>
          </v-tooltip>
        </div>
      </section>

      <section
        class="b-shop-card-modern__finances"
        :aria-label="$t('user_dashboard.shops.shop_card.finance_report')"
      >
        <div v-for="measure in finance_measures" :key="measure.key">
          <h3 class="b-shop-card-modern__caption">{{ $t(measure.label) }}</h3>
          <div
            v-for="(finance, index) in finances || []"
            :key="finance.currency + '-' + index"
            class="b-shop-card-modern__money"
          >
            <span class="b-shop-card-modern__currency"
              ><u-currency-icon
                :currency="finance.currency"
                flag-only
                small
              />{{ finance.currency }}</span
            >
            <u-price
              v-if="number(finance[measure.key]) !== null"
              :amount="number(finance[measure.key])"
              :currency="finance.currency"
            />
            <span v-else :aria-label="$t('user_dashboard.shops.modern.unknown')"
              >—</span
            >
          </div>
          <p v-if="finances === null" class="b-shop-card-modern__scope">
            {{ $t("user_dashboard.shops.modern.unknown") }}
          </p>
          <p v-else-if="!finances.length" class="b-shop-card-modern__scope">
            {{ $t(measure.empty) }}
          </p>
        </div>
      </section>

      <footer class="b-shop-card-modern__actions">
        <v-tooltip
          v-if="!compact"
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
              class="b-shop-card-modern__expiry"
              :aria-label="
                $t('user_dashboard.shops.shop_card.expire') +
                ': ' +
                expiry_label
              "
            >
              <v-icon
                v-if="license_expired"
                size="13"
                color="warning"
                aria-hidden="true"
                >schedule</v-icon
              ><span>{{ expiry_label }}</span>
            </button>
          </template>
          {{ $t("user_dashboard.shops.shop_card.expire") }}:
          {{
            shop.expire_at
              ? getLocalDateString(shop.expire_at)
              : $t("user_dashboard.shops.modern.no_expiry")
          }}
        </v-tooltip>
        <router-link
          :to="dashboard_to"
          class="b-shop-card-modern__open"
          v-tooltip="tip('open_dashboard')"
          >{{ $t("user_dashboard.shops.modern.open_shop")
          }}<v-icon
            size="14"
            aria-hidden="true"
            class="b-shop-card-modern__arrow"
            :class="{ 'b-shop-card-modern__arrow--rtl': $vuetify.locale.isRtl }"
            >arrow_forward</v-icon
          ></router-link
        >
      </footer>
    </div>
  </article>
</template>

<script lang="ts">
import { useId } from "vue";
import { BusinessModel } from "@selldone/core-js/enums/shop/BusinessModel";
import { ProductType } from "@selldone/core-js/enums/product/ProductType";
import {
  ShopPermissions,
  ShopPermissionRegions,
} from "@selldone/core-js/enums/permission/ShopPermissions";
import DateMixin from "@selldone/components-vue/mixin/date/DateMixin.ts";
import LicenseMixin from "@selldone/components-vue/mixin/license/LicenseMixin.ts";
import BShopCardProducts from "./products/BShopCardProducts.vue";
import BShopCardVisitors from "./visitors/BShopCardVisitors.vue";
import UCurrencyIcon from "../../../ui/currency/icon/UCurrencyIcon.vue";
import UPrice from "../../../ui/price/UPrice.vue";

const TYPES = [
  [
    "PHYSICAL",
    "BPageShopOrdersPhysical",
    "user_dashboard.shops.shop_card.menu_orders.physical",
  ],
  [
    "VIRTUAL",
    "BPageShopOrdersVirtual",
    "user_dashboard.shops.shop_card.menu_orders.virtual",
  ],
  [
    "FILE",
    "BPageShopOrdersFile",
    "user_dashboard.shops.shop_card.menu_orders.files",
  ],
  [
    "SERVICE",
    "BPageShopOrdersService",
    "user_dashboard.shops.shop_card.menu_orders.services",
  ],
  [
    "SUBSCRIPTION",
    "BPageShopOrdersSubscription",
    "user_dashboard.shops.shop_card.menu_orders.subscriptions",
  ],
  ["AVOCADO", "BPageShopOrdersAvocado", "global.commons.avocado"],
];
export default {
  name: "BShopCardModern",
  components: { BShopCardProducts, BShopCardVisitors, UCurrencyIcon, UPrice },
  mixins: [DateMixin, LicenseMixin],
  props: {
    shop: { type: Object, required: true },
    to: Object,
    compact: Boolean,
    isSample: Boolean,
    showEngagement: { type: Boolean, default: true },
    initialExpanded: Boolean,
  },
  setup() {
    return { details_id: useId() };
  },
  data() {
    return { expanded: this.initialExpanded };
  },
  computed: {
    report_date() {
      const updated = new Date(this.last_data.updated_at).getTime();
      return this.last_data.updated_at &&
        Number.isFinite(updated) &&
        updated <= Date.now()
        ? this.getFromNowString(this.last_data.updated_at)
        : "—";
    },
    statistics_help() {
      return (
        this.$t("user_dashboard.shops.modern.report_scope") +
        (this.last_data.updated_at
          ? " " +
            this.$t("user_dashboard.shops.modern.statistics_updated", {
              time: this.getLocalDateString(this.last_data.updated_at),
            })
          : "")
      );
    },
    last_data() {
      return this.shop.lastdata || {};
    },
    dashboard_to() {
      return (
        this.to || {
          name: "BPageShopDashboard",
          params: { shop_id: this.shop.id },
        }
      );
    },
    shop_sections() {
      // Destinations load this shop and enforce their native region permissions.
      return [
        ["BPageShopDashboard", ShopPermissionRegions.DASHBOARD],
        ["BPageShopProductsList", ShopPermissionRegions.PRODUCTS],
        ["BPageShopOrders", ShopPermissionRegions.ORDERS],
        ["BPageShopCrmCustomers", ShopPermissionRegions.CUSTOMERS],
        ["BPageShopSettingInfo", ShopPermissionRegions.SETTINGS],
      ].map(([name, region]) => ({
        to: { name, params: { shop_id: this.shop.id } },
        label: region.name,
        icon: region.icon,
      }));
    },
    is_owner() {
      return this.shop.user_id === this.USER_ID();
    },
    permissions() {
      return (this.shop.shop_permissions || [])
        .map((item) => ShopPermissions[item.level])
        .filter(Boolean);
    },
    permission_names() {
      return this.permissions.map((item) => this.$t(item.text)).join(" · ");
    },
    business_model() {
      return Object.values(BusinessModel).find(
        (item) => item.code === this.shop.model,
      );
    },
    license_expired() {
      return (
        this.shop.expire_at &&
        new Date(this.shop.expire_at).getTime() < Date.now()
      );
    },
    expiry_label() {
      return this.shop.expire_at
        ? this.$t(
            this.license_expired
              ? "user_dashboard.shops.modern.expired"
              : "user_dashboard.shops.modern.expires",
            { time: this.getFromNowString(this.shop.expire_at) },
          )
        : this.$t("user_dashboard.shops.modern.no_expiry");
    },
    order_types() {
      return TYPES.map(([code, route, label]) => ({
        code,
        route,
        label,
        image:
          code === "AVOCADO"
            ? require("@selldone/components-vue/assets/icons/avocado.svg")
            : ProductType[code].image,
        value:
          this.queue_total === null
            ? null
            : this.number(this.shop.order_queue.by_type?.[code]),
      }));
    },
    queue_total() {
      // Only the authorized live queue projection describes orders to process.
      return this.number(this.shop.order_queue?.total);
    },
    total_views() {
      // A daily report cannot substitute for the all-history shop projection.
      return this.number(this.shop.total_views);
    },
    engagement() {
      return [
        [
          "likes",
          "M12 20S3 14.5 3 8.5a4.5 4.5 0 0 1 9-1 4.5 4.5 0 0 1 9 1C21 14.5 12 20 12 20Z",
          "user_dashboard.shops.modern.article_likes",
        ],
        ["comments", "M4 4h16v12H9l-5 4V4Z", "widgets.overview.comments"],
        [
          "ratings",
          "M4 4h16v16H4V4Zm4 12v-5m4 5V8m4 8v-6",
          "user_dashboard.shops.modern.ratings",
        ],
        [
          "favorites",
          "m12 3 2.8 5.6 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.5l6.2-.9L12 3Z",
          "user_dashboard.shops.modern.article_favorites",
        ],
        [
          "total_views",
          "M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Zm13 0a3 3 0 1 1-6 0 3 3 0 0 1 6 0",
          "user_dashboard.shops.modern.shop_views",
        ],
        [
          "wishlist",
          "M4 4h16v16H4V4Zm8 4v8m-4-4h8",
          "widgets.overview.wishlist",
        ],
      ].map(([key, path, label]) => ({
        key,
        path,
        label,
        value:
          key === "total_views"
            ? this.total_views
            : this.number(this.last_data[key]),
      }));
    },
    finances() {
      return Array.isArray(this.last_data.finances)
        ? this.last_data.finances
        : null;
    },
    finance_measures() {
      return [
        {
          key: "sell",
          label: "user_dashboard.shops.shop_card.buys",
          empty: "user_dashboard.shops.shop_card.no_purchase",
        },
        {
          key: "pay",
          label: "user_dashboard.shops.shop_card.payments",
          empty: "user_dashboard.shops.shop_card.no_payment",
        },
      ];
    },
  },
  methods: {
    number(value) {
      return (typeof value === "number" ||
        (typeof value === "string" && value.trim() !== "")) &&
        Number.isFinite(Number(value))
        ? Number(value)
        : null;
    },
    format(value) {
      return value === null ? "—" : this.numeralFormat(value, "0.[0]a");
    },
    tip(key) {
      return {
        text: this.$t("user_dashboard.shops.modern." + key),
        location: "top",
        contentClass: "sd-modern-tooltip text-start",
        openOnFocus: true,
        persistent: false,
      };
    },
  },
};
</script>

<style scoped lang="scss">
.b-shop-card-modern {
  position: relative;
  isolation: isolate;
  color: rgb(var(--v-theme-on-surface));
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgba(var(--v-theme-on-surface), 0.1);
  border-radius: 18px;
  padding: 17px 17px 0;
  min-width: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  container-type: inline-size;
  font-size: 13px;
  font-weight: 400;
  line-height: 1.45;
  transition:
    box-shadow 160ms ease,
    transform 160ms ease;
  @media (hover: hover) and (pointer: fine) {
    &:not(.b-shop-card-modern--compact):hover {
      box-shadow:
        0 4px 14px rgba(var(--v-theme-on-surface), 0.12),
        0 1px 3px rgba(var(--v-theme-on-surface), 0.06);
    }
  }
  @media (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference) {
    &:not(.b-shop-card-modern--compact):hover {
      transform: translateY(-2px);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
  button,
  a {
    font-family: inherit;
  }
  &__dashboard-link {
    &::after {
      content: "";
      position: absolute;
      inset: 0;
      z-index: 1;
      border-radius: 18px;
    }
    &:focus-visible {
      outline: 0;
      &::after {
        outline: 2px solid rgb(var(--v-theme-primary));
        outline-offset: 3px;
      }
    }
  }
  // Keep native controls and informational activators above the dashboard hit area.
  :deep(
    :is(
      a,
      button,
      input,
      select,
      textarea,
      summary,
      [role="button"],
      [tabindex],
      [title],
      [aria-describedby]
    ):not(.b-shop-card-modern__dashboard-link)
  ) {
    position: relative;
    z-index: 2;
  }
  &__summary {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px 15px;
    align-items: center;
  }
  &__identity {
    display: flex;
    gap: 10px;
    align-items: flex-start;
    min-width: 0;
    grid-column: 1 / -1;
  }
  &__menu-button {
    --sd-modern-icon-button-size: 32px;
    flex-shrink: 0;
    align-self: start;
    margin-inline-start: auto;
    margin-inline-end: -7px;
    margin-block-start: -4px;
    color: var(--sd-modern-muted, rgba(var(--v-theme-on-surface), 0.66));
    border: 0;
    border-radius: 8px;
    background: transparent;
    &:hover {
      color: rgb(var(--v-theme-on-surface));
      background: var(
        --sd-modern-inset,
        rgba(var(--v-theme-on-surface), 0.025)
      );
    }
  }
  &__sections {
    min-width: 210px;
    border: 1px solid rgba(var(--v-theme-on-surface), 0.1);
    border-radius: 12px;
    :deep(.v-list-item) {
      min-height: 44px;
      color: rgb(var(--v-theme-on-surface));
    }
    :deep(.v-list-item-title) {
      font-size: 13px;
      font-weight: 400;
    }
  }
  &__logo {
    background: rgba(var(--v-theme-on-surface), 0.05);
    border-radius: 11px;
    flex-shrink: 0;
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
  &__name {
    min-width: 0;
    flex: 1;
    a {
      color: inherit;
      display: block;
      overflow-wrap: anywhere;
      font-size: 15px;
      font-weight: 500;
      text-decoration: none;
    }
  }
  &__handle-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 4px 6px;
    margin-top: 3px;
    font-size: 11px;
  }
  &__handle {
    display: block;
    min-width: 0;
    max-width: 100%;
    color: rgba(var(--v-theme-on-surface), 0.6);
    font-size: 11px;
    overflow-wrap: anywhere;
  }
  &__sample {
    gap: 4px;
    color: var(--sd-modern-muted, rgba(var(--v-theme-on-surface), 0.66));
    font-size: 10px;
    font-weight: 400;
    line-height: inherit;
    letter-spacing: 0.4px;
    white-space: nowrap;
    flex-shrink: 0;
  }
  &__access {
    display: flex;
    flex-wrap: nowrap;
    gap: 2px 8px;
    min-width: 0;
    font-size: 11px;
    min-height: 20px;
    color: var(--sd-modern-muted, rgba(var(--v-theme-on-surface), 0.6));
  }
  &__owner,
  &__roles {
    display: inline-flex;
    gap: 5px;
    align-items: center;
  }
  &__roles {
    text-align: start;
    background: transparent;
    border: 0;
    color: inherit;
    padding: 0;
    min-height: 20px;
    max-width: 100%;
    min-width: 0;
    font-size: inherit;
    white-space: nowrap;
    span:first-of-type {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
  &__license {
    text-align: end;
    font-size: 11px;
    min-width: 0;
    min-height: 20px;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 3px;
    flex-wrap: wrap;
    > span {
      display: inline-flex;
      align-items: center;
      gap: 5px;
    }
  }
  &__expiry {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    border: 0;
    background: transparent;
    color: rgba(var(--v-theme-on-surface), 0.6);
    font: inherit;
    line-height: 1.35;
    text-align: inherit;
    min-height: 20px;
    padding: 0;
    max-width: 100%;
  }
  &__permission-detail {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  &__caption {
    display: block;
    color: rgba(var(--v-theme-on-surface), 0.6);
    font-size: 11px;
    font-weight: 400;
    margin-bottom: 3px;
  }
  &__order-status,
  &__orders-button {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    font-weight: 400;
    font-variant-numeric: tabular-nums;
  }
  &__order-status {
    color: rgba(var(--v-theme-on-surface), 0.6);
  }
  &__orders-button {
    color: rgb(var(--v-theme-primary));
    background: transparent;
    border: 0;
    padding: 0;
    text-align: start;
    min-height: 30px;
  }
  &__metric {
    min-width: 0;
    align-self: start;
  }
  &__primary {
    grid-column: 1 / -1;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 15px;
    border-top: 1px solid rgba(var(--v-theme-on-surface), 0.1);
    margin-top: 7px;
    padding-top: 13px;
  }
  &__orders {
    grid-column: 1 / -1;
    display: flex;
    align-items: center;
    gap: 6px;
    min-height: 36px;
    flex-wrap: wrap;
  }
  &__period {
    margin-inline-start: auto;
    color: rgba(var(--v-theme-on-surface), 0.6);
    font-size: 10px;
    text-align: end;
    background: transparent;
    border: 0;
    padding: 0;
    flex-shrink: 0;
  }
  &__details {
    flex: 1;
    display: flex;
    flex-direction: column;
  }
  &__context {
    grid-column: 1 / -1;
    display: flex;
    flex-wrap: wrap;
    gap: 8px 14px;
    align-items: center;
    justify-content: space-between;
    font-size: 11px;
    margin-top: 6px;
    min-height: 18px;
    .sd-modern-status {
      gap: 6px;
      font-size: 11px;
      font-weight: 400;
      line-height: inherit;
    }
    .sd-modern-status__dot {
      flex-basis: 5px;
      width: 5px;
      height: 5px;
    }
    > span:last-child:not(.sd-modern-status) {
      color: var(--sd-modern-muted, rgba(var(--v-theme-on-surface), 0.6));
    }
  }
  &__scope {
    font-size: 12px;
    color: rgba(var(--v-theme-on-surface), 0.6);
    margin: 7px 0;
  }
  &__engagement {
    display: flex;
    justify-content: space-between;
    gap: 5px;
    margin: 3px 0 0;
    padding: 7px 0 12px;
  }
  &__engagement-item {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    min-width: 0;
    min-height: 22px;
    background: transparent;
    border: 0;
    padding: 3px 0;
    color: rgba(var(--v-theme-on-surface), 0.65);
    font-size: 11px;
    font-weight: 400;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
    svg {
      flex-shrink: 0;
    }
  }
  &__finances {
    flex: 1;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
    border-top: 1px solid rgba(var(--v-theme-on-surface), 0.1);
    padding: 12px 0;
    min-height: 82px;
    .b-shop-card-modern__caption {
      margin-bottom: 5px;
    }
    .b-shop-card-modern__scope {
      font-size: 11px;
      margin: 0;
      padding-top: 2px;
    }
  }
  &__money {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 4px;
    min-height: 21px;
    font-size: 11px;
    flex-wrap: wrap;
    :deep(.u--price) {
      font-size: 11px;
      font-weight: 400;
      .small {
        font-weight: 400;
      }
    }
  }
  &__currency {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    color: rgba(var(--v-theme-on-surface), 0.6);
    font-size: 10px;
    :deep(.imc) {
      width: 13px;
      min-width: 13px;
      line-height: 1;
    }
    :deep(.imc .-flag),
    :deep(.imc > img) {
      width: 13px;
      height: 13px;
      border: 0;
      // The native currency identity includes a Bootstrap utility margin.
      margin-inline-end: 0 !important;
    }
  }
  &__actions {
    display: flex;
    justify-content: space-between;
    gap: 8px;
    align-items: center;
    border-top: 1px solid rgba(var(--v-theme-on-surface), 0.1);
    margin-top: 0;
    padding-top: 0;
    min-height: 43px;
    font-size: 11px;
    > a,
    > a:visited,
    > a:hover,
    > a:focus {
      color: rgb(var(--v-theme-primary));
    }
  }
  &__open {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    padding: 8px 0;
    margin-inline-start: auto;
    flex-shrink: 0;
    text-decoration: none;
    font-size: 12px;
    font-weight: 400;
    line-height: 1.4;
  }
  &__arrow--rtl {
    transform: scaleX(-1);
  }
  &__expand {
    justify-self: end;
  }
  &__order-menu {
    max-width: min(480px, calc(100vw - 24px));
  }
  &__order-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    padding: 10px 0;
    border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.08);
    font-size: 13px;
    > a,
    > span:first-child {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    > span:last-child {
      white-space: nowrap;
    }
  }
  :deep(.b-shop-card-products--modern),
  :deep(.b-shop-card-visitors--modern) {
    width: 100%;
  }
  :deep(.b-shop-card-products--modern h6) {
    line-height: 1.25;
  }
  &--compact {
    height: auto;
    border-radius: 0;
    border: 0;
    border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.1);
    padding: 15px 17px;
    .b-shop-card-modern__dashboard-link {
      &::after {
        border-radius: 0;
      }
      &:focus-visible::after {
        outline-offset: -2px;
      }
    }
    .b-shop-card-modern__summary {
      grid-template-columns:
        minmax(160px, 2.1fr) minmax(100px, 1.2fr) minmax(100px, 1.1fr)
        minmax(50px, 0.65fr) minmax(85px, 0.85fr) minmax(160px, 1.5fr) 40px;
      gap: 12px;
    }
    .b-shop-card-modern__identity,
    .b-shop-card-modern__access,
    .b-shop-card-modern__license {
      grid-column: auto;
    }
    .b-shop-card-modern__identity {
      align-items: center;
    }
    .b-shop-card-modern__menu-button {
      margin-inline-end: 0;
      margin-block-start: 0;
    }
    .b-shop-card-modern__primary {
      display: contents;
    }
    .b-shop-card-modern__orders {
      grid-column: auto;
      display: block;
      min-height: 0;
    }
    .b-shop-card-modern__name a {
      font-size: 13px;
    }
    .b-shop-card-modern__logo {
      width: 34px !important;
      height: 34px !important;
      border-radius: 9px;
    }
    .b-shop-card-modern__access,
    .b-shop-card-modern__license {
      min-height: 41px;
    }
    .b-shop-card-modern__license {
      display: block;
      text-align: start;
      .b-shop-card-modern__expiry {
        display: block;
        margin-top: 4px;
      }
    }
    .b-shop-card-modern__details {
      display: grid;
      grid-template-columns: 1.3fr 1fr;
      gap: 8px 28px;
      border-top: 1px solid rgba(var(--v-theme-on-surface), 0.1);
      padding-top: 15px;
      margin-top: 15px;
    }
    .b-shop-card-modern__finances {
      padding: 0;
      border: 0;
      min-height: 0;
    }
    .b-shop-card-modern__engagement {
      margin-bottom: 0;
      max-width: 370px;
    }
    .b-shop-card-modern__scope {
      font-size: 10px;
    }
    .b-shop-card-modern__actions {
      grid-column: 1 / -1;
      margin-top: 0;
    }
    :deep(.b-shop-card-products--modern h6),
    :deep(.b-shop-card-visitors--modern h6) {
      font-size: 13px;
      letter-spacing: normal;
    }
  }
  a:not(.b-shop-card-modern__dashboard-link):focus-visible,
  button:focus-visible {
    outline: 2px solid rgb(var(--v-theme-primary));
    outline-offset: 3px;
    border-radius: 4px;
  }
  @container (max-width: 760px) {
    &--compact {
      .b-shop-card-modern__summary {
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }
      .b-shop-card-modern__identity {
        grid-column: 1 / 3;
      }
      .b-shop-card-modern__access {
        grid-row: 2;
        grid-column: 1 / -1;
      }
      .b-shop-card-modern__license {
        grid-row: 3;
        grid-column: 1 / -1;
        display: flex;
      }
      .b-shop-card-modern__expand {
        grid-column: 3;
        grid-row: 1;
      }
      .b-shop-card-modern__details {
        grid-template-columns: minmax(0, 1fr);
      }
      .b-shop-card-modern__finances {
        border-top: 1px solid rgba(var(--v-theme-on-surface), 0.1);
        padding-top: 12px;
      }
      .b-shop-card-modern__actions {
        grid-column: auto;
      }
    }
  }
  @container (max-width: 284px) {
    &__engagement {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
  }
  @media (max-width: 960px) {
    &--compact {
      border: 1px solid rgba(var(--v-theme-on-surface), 0.1);
      border-radius: 18px;
    }
    &__roles,
    &__orders-button,
    &__expand {
      min-height: 44px;
    }
  }
  @media (max-width: 799px), (pointer: coarse) {
    &__menu-button {
      --sd-modern-icon-button-size: 44px;
    }
    &__open,
    &__expiry,
    &__period,
    &__engagement-item {
      min-height: 44px;
    }
  }
  @media (max-width: 660px) {
    &__engagement {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 6px 12px;
    }
  }
  @media (pointer: coarse) {
    &__roles,
    &__orders-button,
    &__expand,
    &__engagement-item,
    &__expiry,
    &__open,
    &__period {
      min-height: 44px;
    }
    &__engagement {
      gap: 0;
    }
    &__engagement-item {
      flex-wrap: wrap;
    }
    &__expand {
      min-width: 44px;
    }
  }
}
</style>
