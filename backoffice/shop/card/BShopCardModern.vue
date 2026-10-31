<template>
  <article
    class="b-shop-card-modern text-start"
    :class="{ 'b-shop-card-modern--compact': compact }"
    :aria-label="shop.title"
  >
    <div class="b-shop-card-modern__summary">
      <div class="b-shop-card-modern__identity">
        <v-avatar class="b-shop-card-modern__logo" rounded="lg" size="36">
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
        <div class="b-shop-card-modern__identity-actions">
          <button
            v-if="favorite !== null && !isSample"
            type="button"
            class="sd-modern-icon-button b-shop-card-modern__favorite"
            :aria-label="favorite_label"
            :aria-pressed="favorite"
            :aria-busy="favoriteLoading"
            :disabled="favoriteLoading || favoriteDisabled"
            v-tooltip="{
              ...tip(favorite ? 'remove_favorite' : 'add_favorite'),
              text: favorite_label,
            }"
            @click.stop="toggleFavorite"
          >
            <v-progress-circular
              v-if="favoriteLoading"
              indeterminate
              size="16"
              width="2"
              aria-hidden="true"
            />
            <v-icon v-else size="17" aria-hidden="true">{{
              favorite ? "star" : "star_border"
            }}</v-icon>
          </button>
          <v-menu v-model="menu_open" location="bottom end">
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
                v-tooltip="{ ...tip('shop_actions'), disabled: menu_open }"
              >
                <v-icon size="17" aria-hidden="true">more_horiz</v-icon>
              </button>
            </template>
            <v-list
              class="b-shop-card-modern__sections text-start"
              density="compact"
              :aria-label="$t('user_dashboard.shops.modern.shop_actions')"
            >
              <section class="b-shop-card-modern__website">
                <h3>
                  <v-icon size="15" aria-hidden="true">language</v-icon
                  >{{ $t("user_dashboard.shops.modern.public_website") }}
                </h3>
                <template v-if="public_website">
                  <div class="b-shop-card-modern__website-actions">
                    <a
                      :href="public_website.url"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="b-shop-card-modern__website-open"
                      :aria-label="
                        $t('user_dashboard.shops.modern.open_website') +
                        ' · ' +
                        $t('user_dashboard.shops.modern.open_in_new_tab')
                      "
                      ><span
                        class="b-shop-card-modern__website-address"
                        dir="ltr"
                        >{{ public_website.label }}</span
                      >
                      <span class="b-shop-card-modern__website-open-label"
                        >{{ $t("user_dashboard.shops.modern.open_in_new_tab")
                        }}<v-icon size="14" aria-hidden="true"
                          >north_east</v-icon
                        ></span
                      ></a
                    >
                    <button
                      v-copy="public_website.url"
                      type="button"
                      class="sd-modern-icon-button b-shop-card-modern__copy"
                      :aria-label="
                        $t('user_dashboard.shops.modern.copy_address')
                      "
                      v-tooltip="tip('copy_address')"
                    >
                      <v-icon size="16" aria-hidden="true">content_copy</v-icon>
                    </button>
                  </div>
                </template>
                <p v-else class="b-shop-card-modern__website-domain">
                  {{ $t("user_dashboard.shops.modern.website_unavailable") }}
                </p>
              </section>
              <v-list-item
                v-for="section in shop_sections"
                :key="section.to.name"
                :to="section.to"
                :title="$t(section.label)"
                target="_blank"
                rel="noopener noreferrer"
                :aria-label="
                  $t(section.label) +
                  ' · ' +
                  $t('user_dashboard.shops.modern.open_in_new_tab')
                "
              >
                <template #prepend
                  ><v-icon size="18" aria-hidden="true">{{
                    section.icon
                  }}</v-icon></template
                >
                <template #append
                  ><v-icon size="14" aria-hidden="true"
                    >north_east</v-icon
                  ></template
                >
              </v-list-item>
              <v-list-item
                v-if="can_view_settings"
                :to="{
                  name: 'BPageShopSettingDomain',
                  params: { shop_id: shop.id },
                }"
                :title="$t('user_dashboard.shops.modern.manage_domains')"
                target="_blank"
                rel="noopener noreferrer"
                :aria-label="
                  $t('user_dashboard.shops.modern.manage_domains') +
                  ' · ' +
                  $t('user_dashboard.shops.modern.open_in_new_tab')
                "
              >
                <template #prepend
                  ><v-icon size="18" aria-hidden="true"
                    >language</v-icon
                  ></template
                >
                <template #append
                  ><v-icon size="14" aria-hidden="true"
                    >north_east</v-icon
                  ></template
                >
              </v-list-item>
            </v-list>
          </v-menu>
        </div>
        <div
          class="b-shop-card-modern__business-model"
          :aria-label="$t('user_dashboard.shops.modern.business_model')"
        >
          <v-icon size="15" aria-hidden="true">{{
            business_model?.icon || "storefront"
          }}</v-icon>
          <span>{{
            business_model
              ? $t(business_model.name)
              : $t("user_dashboard.shops.modern.unknown")
          }}</span>
        </div>
      </div>

      <div class="b-shop-card-modern__status">
        <span
          class="sd-modern-status sd-modern-status--plain b-shop-card-modern__context"
        >
          <span
            class="sd-modern-status__dot"
            :class="
              shop.active
                ? 'sd-modern-status__dot--success'
                : 'sd-modern-status__dot--error'
            "
          />
          {{
            $t(
              shop.active ? "global.commons.active" : "global.commons.inactive",
            )
          }}
        </span>
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
                  is_owner
                    ? $t("global.commons.owner")
                    : $t(permissions[0].text)
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

        <v-tooltip
          location="top"
          content-class="sd-modern-tooltip text-start"
          open-on-focus
          open-on-click
        >
          <template #activator="{ props }">
            <button
              v-bind="props"
              type="button"
              class="b-shop-card-modern__license"
              :aria-label="
                getShopLicenseName(shop.license) + ' · ' + expiry_label
              "
            >
              <img
                :src="getShopLicenseIcon(shop.license)"
                alt=""
                width="15"
                height="15"
              />{{ getShopLicenseName(shop.license) }}
              <span
                v-if="license_expiring_soon"
                class="sd-modern-status__dot sd-modern-status__dot--error blink-me-linear b-shop-card-modern__license-expiry-dot"
                aria-hidden="true"
              />
            </button>
          </template>
          {{ $t("user_dashboard.shops.shop_card.expire") }}:
          {{
            shop.expire_at
              ? getLocalDateString(shop.expire_at)
              : $t("user_dashboard.shops.modern.no_expiry")
          }}
          <div>{{ expiry_label }}</div>
        </v-tooltip>
      </div>
      <div v-if="license_expired" class="b-shop-card-modern__expired">
        <v-icon size="15" color="warning" aria-hidden="true">schedule</v-icon>
        <span>{{ $t("user_dashboard.shops.modern.license_expired") }}</span>
        <router-link
          v-if="can_renew_license"
          :to="{
            name: 'BPageShopSettingLicense',
            params: { shop_id: shop.id },
          }"
          class="b-shop-card-modern__renew"
          >{{ $t("user_dashboard.shops.modern.renew_license") }}</router-link
        >
      </div>
      <div class="b-shop-card-modern__orders">
        <div class="b-shop-card-modern__queue">
          <span v-if="queue_total > 0" class="b-shop-card-modern__queue-copy"
            ><span class="b-shop-card-modern__queue-number">{{
              format(queue_total)
            }}</span
            ><span class="b-shop-card-modern__queue-label">{{
              $t("user_dashboard.shops.modern.pending_orders")
            }}</span></span
          >
          <v-menu
            v-if="queue_total > 0"
            open-on-hover
            open-on-focus
            open-on-click
            :open-delay="120"
            :close-delay="180"
            :close-on-content-click="true"
            location="left center"
            :offset="8"
          >
            <template #activator="{ props }">
              <button
                v-bind="props"
                type="button"
                class="sd-modern-icon-button b-shop-card-modern__queue-cart"
                :aria-label="
                  $t(
                    'user_dashboard.shops.modern.orders_to_process',
                    { count: format(queue_total) },
                    queue_total,
                  )
                "
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.7"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                >
                  <path d="M3 3h2l3 12h11l3-9H6M8 15l-1 3h13" />
                  <circle cx="9" cy="21" r="1" />
                  <circle cx="19" cy="21" r="1" />
                </svg>
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
              <router-link
                v-for="item in order_types"
                :key="item.code"
                :to="{ name: item.route, params: { shop_id: shop.id } }"
                target="_blank"
                rel="noopener noreferrer"
                class="b-shop-card-modern__order-row"
                :aria-label="
                  $t(item.label) +
                  ' · ' +
                  $t('user_dashboard.shops.modern.open_in_new_tab')
                "
              >
                <span>
                  <img :src="item.image" alt="" width="18" height="18" />{{
                    $t(item.label)
                  }}
                </span>
                <span class="b-shop-card-modern__order-end"
                  >{{ format(item.value)
                  }}<v-icon size="14" aria-hidden="true"
                    >north_east</v-icon
                  ></span
                >
              </router-link>
            </v-card>
          </v-menu>
          <span v-else class="b-shop-card-modern__order-status"
            ><v-icon size="19" aria-hidden="true">shopping_bag</v-icon
            >{{
              $t(
                queue_total === 0
                  ? "user_dashboard.shops.modern.no_orders_to_process"
                  : "user_dashboard.shops.modern.queue_unavailable",
              )
            }}</span
          >
        </div>
        <div class="b-shop-card-modern__sales-slot">
          <v-tooltip
            v-if="sales_finances.length"
            location="top"
            content-class="sd-modern-tooltip text-start"
            open-on-focus
            open-on-click
            :persistent="false"
          >
            <template #activator="{ props }">
              <button
                v-bind="props"
                type="button"
                class="b-shop-card-modern__sales"
                :aria-label="
                  $t('user_dashboard.shops.modern.sales') + ' · ' + shop.title
                "
              >
                <span class="b-shop-card-modern__sales-caption">{{
                  $t("user_dashboard.shops.modern.sales")
                }}</span>
                <span class="b-shop-card-modern__sales-values">
                  <span
                    v-for="(finance, index) in visible_sales"
                    :key="finance.currency + '-' + index"
                    class="b-shop-card-modern__sales-amount"
                    dir="ltr"
                  >
                    <u-currency-icon
                      :currency="finance.currency"
                      flag-only
                      small
                    />
                    <u-price
                      :amount="number(finance.sell)"
                      :currency="finance.currency"
                      :compact="Math.abs(number(finance.sell)) >= 1000"
                    />
                  </span>
                </span>
                <span
                  v-if="sales_finances.length > visible_sales.length"
                  class="b-shop-card-modern__sales-more"
                  dir="ltr"
                  :aria-label="
                    $t('user_dashboard.shops.modern.more_sales_currencies', {
                      count: sales_finances.length - visible_sales.length,
                    })
                  "
                  >+{{ sales_finances.length - visible_sales.length }}</span
                >
              </button>
            </template>
            <p class="sd-modern-tooltip__body">
              {{ $t("user_dashboard.shops.modern.sales_scope") }}
            </p>
            <div
              v-for="(finance, index) in sales_finances"
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
                :amount="number(finance.sell)"
                :currency="finance.currency"
              />
            </div>
            <p class="sd-modern-tooltip__body b-shop-card-modern__sales-period">
              <template v-if="sales_report_start">
                {{ $t("user_dashboard.shops.modern.sales_report_start") }}:
                <time :datetime="sales_report_start">{{
                  getLocalTimeString(sales_report_start)
                }}</time>
                <span>{{ getFromNowString(sales_report_start) }}</span>
              </template>
              <template v-else>{{
                $t("user_dashboard.shops.modern.sales_report_unavailable")
              }}</template>
            </p>
          </v-tooltip>
          <p v-else class="b-shop-card-modern__sales-empty">
            {{ sales_empty_hint }}
          </p>
        </div>
      </div>
    </div>
    <footer class="b-shop-card-modern__actions">
      <button
        type="button"
        class="b-shop-card-modern__expand"
        :aria-expanded="expanded"
        :aria-controls="details_id"
        :aria-label="
          $t('user_dashboard.shops.modern.details') + ' · ' + shop.title
        "
        v-tooltip="
          tip(expanded ? 'collapse_details_help' : 'expand_details_help')
        "
        @click="expanded = !expanded"
      >
        {{ $t("user_dashboard.shops.modern.details")
        }}<v-icon
          class="b-shop-card-modern__expand-chevron"
          size="14"
          aria-hidden="true"
          >expand_more</v-icon
        >
      </button>
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
    <div v-show="expanded" :id="details_id" class="b-shop-card-modern__details">
      <button
        type="button"
        class="b-shop-card-modern__period"
        :aria-label="statistics_help"
        v-tooltip="{
          ...tip('report_scope'),
          text: statistics_help,
          openOnClick: true,
        }"
      >
        <v-icon size="13" aria-hidden="true">schedule</v-icon
        >{{ statistics_timestamp }}
      </button>
      <div class="b-shop-card-modern__primary">
        <div class="b-shop-card-modern__metric b-shop-card-modern__products">
          <b-shop-card-products :last-data="last_data" modern />
        </div>
        <div class="b-shop-card-modern__metric b-shop-card-modern__visitors">
          <b-shop-card-visitors :last-data="last_data" modern />
        </div>
      </div>
      <section class="b-shop-card-modern__activity">
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
    </div>
  </article>
</template>

<script lang="ts">
import { useId } from "vue";
import { BusinessModel } from "@selldone/core-js/enums/shop/BusinessModel";
import { ShopURLs } from "@selldone/core-js/helper/url/ShopURLs";
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

function websiteUrl(raw) {
  try {
    if (typeof raw !== "string" || !raw.trim()) return null;
    const value = raw.trim();
    if (/[\u0000-\u0020\u007f]/.test(value)) return null;
    let candidate = value;
    if (value.startsWith("//")) candidate = "https:" + value;
    else if (!/^https?:\/\//i.test(value)) {
      const hostPort = /^(?:localhost|[^:/?#]+\.[^:/?#]+):\d+(?:[/?#]|$)/i.test(
        value,
      );
      if (/^[a-z][a-z\d+.-]*:/i.test(value) && !hostPort) return null;
      candidate = "https://" + value;
    }
    const url = new URL(candidate);
    if (
      !["http:", "https:"].includes(url.protocol) ||
      !url.hostname ||
      decodeURIComponent(url.hostname).includes("*") ||
      url.username ||
      url.password
    )
      return null;
    return {
      url: url.href,
      label: url.host + (url.pathname === "/" ? "" : url.pathname),
    };
  } catch {
    return null;
  }
}

export default {
  name: "BShopCardModern",
  components: { BShopCardProducts, BShopCardVisitors, UCurrencyIcon, UPrice },
  mixins: [DateMixin, LicenseMixin],
  emits: ["toggle-favorite"],
  props: {
    shop: { type: Object, required: true },
    to: Object,
    compact: Boolean,
    isSample: Boolean,
    showEngagement: { type: Boolean, default: true },
    initialExpanded: Boolean,
    favorite: { type: Boolean, default: null },
    favoriteLoading: { type: Boolean, default: false },
    favoriteDisabled: { type: Boolean, default: false },
  },
  setup() {
    return { details_id: useId() };
  },
  data() {
    return { expanded: this.initialExpanded, menu_open: false };
  },
  computed: {
    public_website() {
      const hasName =
        typeof this.shop.name === "string" && this.shop.name.trim();
      const relatedPrimary = Array.isArray(this.shop.domains)
        ? this.shop.domains.find((domain) => domain.primary)
        : null;
      const hasDomain = this.shop.domains
        ? typeof relatedPrimary?.domain === "string" &&
          relatedPrimary.domain.trim()
        : !!this.website_domain;
      if (!hasDomain && !hasName) return null;
      try {
        if (!relatedPrimary || hasDomain) {
          const primary = websiteUrl(ShopURLs.MainShopUrl(this.shop));
          if (primary) return primary;
        }
      } catch {
        // A malformed custom domain must not hide the native public shop link.
      }
      if (!hasName) return null;
      try {
        return websiteUrl(
          ShopURLs.MainShopUrl({
            ...this.shop,
            domains: undefined,
            domain: null,
          }),
        );
      } catch {
        return null;
      }
    },
    website_domain() {
      const domain =
        (Array.isArray(this.shop.domains)
          ? this.shop.domains.find((domain) => domain.primary)?.domain
          : null) || this.shop.domain;
      return typeof domain === "string" ? domain.trim() : "";
    },
    can_view_settings() {
      // Mirror native Settings READ against this row, not the globally open shop.
      return (
        this.is_owner ||
        this.shop.sample ||
        this.shop.temporary_access ||
        (this.shop.shop_permissions || []).some(
          (permission) =>
            !permission.override ||
            permission.override["SETTINGS-READ"] !== false,
        )
      );
    },
    can_renew_license() {
      if (this.is_owner) return true;
      if (!this.can_view_settings) return false;
      // Renewal requires native Settings WRITE as well as page read access.
      return (this.shop.shop_permissions || []).some(
        (permission) =>
          permission.override?.["SETTINGS-WRITE"] === true ||
          (ShopPermissions[permission.level]?.levels.some(
            (region) => region.code === ShopPermissionRegions.SETTINGS.code,
          ) &&
            permission.override?.["SETTINGS-WRITE"] !== false),
      );
    },
    statistics_timestamp() {
      return this.report_date === "—"
        ? this.$t("user_dashboard.shops.modern.statistics_unavailable")
        : this.$t("user_dashboard.shops.modern.statistics_updated", {
            time: this.getLocalTimeString(this.last_data.updated_at),
          });
    },
    favorite_label() {
      return this.$t(
        this.favorite
          ? "user_dashboard.shops.modern.remove_favorite"
          : "user_dashboard.shops.modern.add_favorite",
        { shop: this.shop.title },
      );
    },
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
    license_expiring_soon() {
      if (!this.shop.expire_at) return false;
      const remaining = new Date(this.shop.expire_at).getTime() - Date.now();
      return (
        Number.isFinite(remaining) &&
        remaining > 0 &&
        remaining < 7 * 24 * 60 * 60 * 1000
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
    sales_finances() {
      // Keep native currencies and signed sales; empty/zero values leave the reserved slot blank.
      return (this.finances || []).filter((finance) => {
        const amount = this.number(finance?.sell);
        return (
          typeof finance?.currency === "string" &&
          finance.currency.trim() &&
          amount !== null &&
          amount !== 0
        );
      });
    },
    visible_sales() {
      return this.sales_finances.slice(0, 2);
    },
    sales_empty_hint() {
      const hints = [
        "sales_hint_product",
        "sales_hint_story",
        "sales_hint_steps",
      ];
      // Stable per shop so copy varies without jumping on every render.
      const index = Number.isSafeInteger(this.shop.id)
        ? Math.abs(this.shop.id) % hints.length
        : 0;
      return this.$t("user_dashboard.shops.modern." + hints[index]);
    },
    sales_report_start() {
      // This is the daily bucket start; parent updated_at is not a finance update time.
      const start = this.last_data.created_at;
      return start && Number.isFinite(new Date(start).getTime()) ? start : null;
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
    toggleFavorite() {
      if (
        this.favorite === null ||
        this.favoriteLoading ||
        this.favoriteDisabled ||
        this.isSample
      )
        return;
      this.$emit("toggle-favorite");
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
  display: flex;
  flex-direction: column;
  min-width: 0;
  height: 100%;
  padding: 18px;
  border: 1px solid
    var(--sd-modern-border, rgba(var(--v-theme-on-surface), 0.1));
  border-radius: 16px;
  color: rgb(var(--v-theme-on-surface));
  background: rgb(var(--v-theme-surface));
  font-family: inherit;
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
      border-radius: 16px;
    }
    &:focus-visible {
      outline: 0;
      &::after {
        outline: 2px solid rgb(var(--v-theme-primary));
        outline-offset: 3px;
      }
    }
  }
  // Keep native controls above the whole-card dashboard link.
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
    display: flex;
    flex-direction: column;
    flex: 1;
    min-width: 0;
  }
  &__identity {
    display: flex;
    align-items: flex-start;
    gap: 9px;
    flex-wrap: wrap;
    min-width: 0;
  }
  &__logo {
    flex-shrink: 0;
    border-radius: 10px;
    background: var(--sd-modern-inset, rgba(var(--v-theme-on-surface), 0.04));
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
  &__name {
    flex: 1;
    min-width: 0;
    a {
      display: block;
      color: inherit;
      font-size: 15px;
      font-weight: 500;
      text-decoration: none;
      overflow-wrap: anywhere;
    }
  }
  &__handle-row {
    display: flex;
    align-items: center;
    gap: 4px 6px;
    flex-wrap: wrap;
    margin-block-start: 3px;
    font-size: 11px;
  }
  &__handle {
    min-width: 0;
    color: var(--sd-modern-muted);
    font-size: 11px;
    overflow-wrap: anywhere;
  }
  &__sample {
    gap: 4px;
    color: var(--sd-modern-muted);
    font-size: 10px;
    font-weight: 400;
  }
  &__identity-actions {
    display: flex;
    gap: 6px;
    margin-inline-start: auto;
    flex-shrink: 0;
  }
  &__favorite,
  &__menu-button,
  &__copy {
    --sd-modern-icon-button-size: 32px;
    flex-shrink: 0;
  }
  &__business-model {
    display: flex;
    align-items: center;
    gap: 7px;
    flex: 1 0 100%;
    padding-block-start: 4px;
    font-size: 12px;
    font-weight: 500;
    .v-icon {
      color: var(--sd-modern-muted);
    }
  }
  &__status {
    display: flex;
    align-items: center;
    gap: 8px 10px;
    flex-wrap: wrap;
    margin-block-start: 10px;
    color: var(--sd-modern-muted);
    font-size: 11px;
  }
  &__context {
    font-size: inherit;
  }
  &__access,
  &__owner,
  &__roles {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    min-width: 0;
    font-size: 11px;
  }
  &__access {
    flex: 1;
  }
  &__roles {
    padding: 0;
    border: 0;
    background: transparent;
    color: inherit;
    text-align: start;
    min-height: 20px;
    max-width: 100%;
    white-space: nowrap;
    span:first-of-type {
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
  &__permission-detail {
    display: flex;
    align-items: center;
    gap: 7px;
    margin-block-start: 7px;
  }
  &__license {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 0;
    border: 0;
    background: transparent;
    color: inherit;
    font-size: 11px;
    white-space: nowrap;
  }
  &__expired {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-block-start: 12px;
    font-size: 12px;
  }
  &__renew {
    min-height: 24px;
    display: inline-flex;
    align-items: center;
    padding-inline: 4px;
    margin-inline-start: auto;
    color: rgb(var(--v-theme-primary));
    font-size: 12px;
    font-weight: 500;
    text-decoration: none;
  }
  &__orders {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    margin-block: 15px 12px;
  }
  &__queue {
    display: flex;
    align-items: center;
    gap: 11px;
    min-height: 86px;
  }
  &__sales-slot {
    height: 44px;
    flex-shrink: 0;
  }
  &__sales-empty {
    display: flex;
    align-items: center;
    height: 100%;
    margin: 0;
    color: var(--sd-modern-muted);
    font-size: 11px;
    line-height: 1.5;
  }
  &__sales {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    height: 44px;
    padding: 0;
    border: 0;
    background: transparent;
    color: var(--sd-modern-muted);
    font-size: 11px;
    text-align: start;
  }
  &__sales-caption,
  &__sales-more {
    flex-shrink: 0;
  }
  &__sales-values {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0 12px;
    min-width: 0;
  }
  &__sales-amount {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    white-space: nowrap;
    line-height: 18px;
    color: rgb(var(--v-theme-on-surface));
    :deep(.u--price) {
      font-size: 12px;
      font-weight: 400;
      line-height: 18px;
    }
    :deep(.imc) {
      width: 13px;
      min-width: 13px;
      height: 13px;
    }
    :deep(.imc .-flag),
    :deep(.imc img) {
      box-sizing: border-box;
      width: 13px;
      height: 13px;
      margin-inline: 0 !important;
    }
  }
  &__sales-period {
    margin-block-start: 10px;
    span {
      display: block;
    }
  }
  &__queue-copy {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }
  &__queue-number {
    font-size: 32px;
    font-weight: 400;
    line-height: 1.2;
    letter-spacing: -1px;
    font-variant-numeric: tabular-nums;
  }
  &__queue-label {
    margin-block-start: 2px;
    font-size: 12px;
    color: var(--sd-modern-muted);
  }
  &__queue-cart {
    --sd-modern-icon-button-size: 32px;
    box-sizing: border-box;
    flex-shrink: 0;
    margin-inline-start: auto;
  }
  &__order-status {
    display: flex;
    align-items: center;
    gap: 9px;
    color: var(--sd-modern-muted);
    font-size: 12px;
  }
  &__order-menu {
    box-sizing: border-box;
    width: 288px;
    max-width: calc(100vw - 32px);
    padding: 16px;
    .sd-modern-title-text {
      margin: 0;
      font-size: 13px;
      line-height: 20px;
      font-weight: 500;
    }
    .sd-modern-subtitle {
      margin: 4px 0 12px;
      font-size: 11px;
      line-height: 1.5;
    }
  }
  &__order-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    min-height: 36px;
    margin-block-start: 2px;
    padding: 4px 6px;
    border-radius: 7px;
    font-size: 12px;
    color: inherit;
    text-decoration: none;
    > span {
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }
    &:focus-visible {
      outline: 2px solid rgb(var(--v-theme-primary));
      outline-offset: 2px;
    }
    &:hover {
      background: var(--sd-modern-inset);
    }
  }
  &__order-end {
    flex-shrink: 0;
    font-variant-numeric: tabular-nums;
  }
  &__actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding-block-start: 12px;
    margin-block-start: auto;
    border-top: 1px solid var(--sd-modern-border);
  }
  &__expand,
  &__open {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    min-height: 32px;
    padding: 6px 0;
    border: 0;
    background: transparent;
    font-weight: 500;
    text-decoration: none;
  }
  &__expand {
    box-sizing: border-box;
    min-width: 0;
    padding: 4px 8px;
    border: 0;
    border-radius: 8px;
    color: rgb(var(--v-theme-on-surface));
    font-size: 11px;
    text-align: start;
    transition: background-color 160ms ease;
    &:hover,
    &:focus-visible,
    &[aria-expanded="true"] {
      background: var(--sd-modern-inset, rgba(var(--v-theme-on-surface), 0.04));
    }
    &:focus-visible {
      border-radius: 8px;
    }
    &[aria-expanded="true"] .b-shop-card-modern__expand-chevron {
      transform: rotate(180deg);
    }
  }
  &__expand-chevron {
    flex-shrink: 0;
    transition: transform 160ms ease;
  }
  &__open {
    color: rgb(var(--v-theme-primary));
    font-size: 12px;
    white-space: nowrap;
  }
  &__arrow--rtl {
    transform: scaleX(-1);
  }
  &__details {
    min-width: 0;
    padding-block-start: 14px;
  }
  &__period {
    display: flex;
    align-items: flex-start;
    gap: 6px;
    min-height: 20px;
    margin: 0 0 14px;
    padding: 0;
    border: 0;
    background: transparent;
    color: var(--sd-modern-muted);
    font-size: 11px;
    text-align: start;
    .v-icon {
      margin-block-start: 2px;
    }
  }
  &__primary {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }
  :deep(.b-shop-card-products--modern h6),
  :deep(.b-shop-card-visitors--modern h6) {
    font-size: 21px;
    font-weight: 400;
    letter-spacing: normal;
  }
  &__activity {
    min-width: 0;
    margin-block-start: 14px;
  }
  &__engagement {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    flex-wrap: wrap;
    padding-block-end: 14px;
    border-bottom: 1px solid var(--sd-modern-border);
  }
  &__engagement-item {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    min-height: 24px;
    padding: 4px 0;
    border: 0;
    background: transparent;
    color: var(--sd-modern-muted);
    font-size: 11px;
    line-height: 1.45;
    font-weight: 400;
  }
  &__finances {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
    padding-block-start: 12px;
    min-width: 0;
  }
  &__caption {
    margin: 0 0 8px;
    color: var(--sd-modern-muted);
    font-size: 11px;
    line-height: 1.5;
    font-weight: 400;
  }
  &__money {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin-block-start: 6px;
    font-size: 12px;
    font-variant-numeric: tabular-nums;
  }
  &__currency {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: 10px;
  }
  &__scope {
    margin: 0;
    font-size: 11px;
    color: var(--sd-modern-muted);
  }
  &__sections {
    box-sizing: border-box;
    width: 288px;
    max-width: calc(100vw - 32px);
    padding: 8px;
    border: 1px solid var(--sd-modern-border);
    border-radius: 12px;
    color: rgb(var(--v-theme-on-surface));
    background: rgb(var(--v-theme-surface));
    box-shadow: 0 3px 12px rgba(var(--v-theme-on-surface), 0.08);
    :deep(.v-list-item) {
      min-height: 36px;
      padding: 8px;
      border-radius: 7px;
      color: inherit;
    }
    :deep(.v-list-item-title) {
      font-family: inherit;
      font-size: 13px;
      font-weight: 400;
      line-height: 18px;
      white-space: normal;
    }
    :deep(.v-list-item__spacer) {
      width: 8px;
    }
  }
  &__website {
    padding: 9px 8px 10px;
    margin-block-end: 6px;
    border-bottom: 1px solid var(--sd-modern-border);
    h3 {
      display: flex;
      align-items: center;
      gap: 7px;
      margin: 0;
      font-size: 12px;
      font-weight: 500;
      line-height: 18px;
    }
  }
  &__website-domain {
    display: block;
    margin: 7px 0 0;
    color: var(--sd-modern-muted);
    font-size: 12px;
    overflow-wrap: anywhere;
  }
  &__website-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-block-start: 8px;
  }
  &__website-open {
    display: inline-flex;
    flex: 1;
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
    min-width: 0;
    min-height: 32px;
    padding: 5px 0;
    color: rgb(var(--v-theme-primary));
    font-size: 12px;
    font-weight: 500;
    text-decoration: none;
  }
  &__website-address {
    max-width: 100%;
    color: rgb(var(--v-theme-on-surface));
    font-weight: 400;
    overflow-wrap: anywhere;
  }
  &__website-open-label {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
  }
  &__website-open:hover &__website-address {
    text-decoration: underline;
  }
  &__copy {
    margin-inline-start: auto;
  }
  a:not(.b-shop-card-modern__dashboard-link):focus-visible,
  button:focus-visible {
    outline: 2px solid rgb(var(--v-theme-primary));
    outline-offset: 3px;
    border-radius: 4px;
  }
  &--compact {
    display: grid;
    grid-template-columns:
      minmax(0, 1.5fr) minmax(140px, 1fr) minmax(140px, 1fr)
      auto;
    align-items: center;
    gap: 10px 20px;
    height: auto;
    border: 0;
    border-bottom: 1px solid var(--sd-modern-border);
    border-radius: 0;
    padding: 17px 18px;
    .b-shop-card-modern__dashboard-link::after {
      border-radius: 0;
    }
    .b-shop-card-modern__summary {
      display: contents;
    }
    .b-shop-card-modern__identity {
      grid-column: 1;
      grid-row: 1 / 3;
      align-items: center;
    }
    .b-shop-card-modern__status {
      grid-column: 2;
      grid-row: 1;
      margin: 0;
      display: block;
    }
    .b-shop-card-modern__access {
      display: flex;
      margin-block-start: 5px;
    }
    .b-shop-card-modern__license {
      margin-block-start: 4px;
    }
    .b-shop-card-modern__expired {
      grid-column: 2;
      grid-row: 2;
      margin: 0;
    }
    .b-shop-card-modern__orders {
      grid-column: 3;
      grid-row: 1 / 3;
      min-height: 0;
      margin: 0;
    }
    .b-shop-card-modern__queue {
      min-height: 44px;
    }
    .b-shop-card-modern__sales-caption {
      display: none;
    }
    .b-shop-card-modern__queue-number {
      font-size: 22px;
      letter-spacing: -0.3px;
    }
    .b-shop-card-modern__actions {
      grid-column: 4;
      grid-row: 1 / 3;
      flex-direction: column-reverse;
      align-items: flex-end;
      gap: 0;
      padding: 0;
      margin: 0;
      border: 0;
    }
    .b-shop-card-modern__details {
      grid-column: 1 / -1;
      border-top: 1px solid var(--sd-modern-border);
      padding-block-start: 15px;
    }
    .b-shop-card-modern__primary {
      grid-template-columns: 120px 120px;
    }
    .b-shop-card-modern__engagement {
      justify-content: flex-start;
      gap: 25px;
    }
    .b-shop-card-modern__finances {
      max-width: 520px;
    }
  }
  @media (max-width: 860px) {
    &--compact {
      grid-template-columns: minmax(0, 1.4fr) minmax(110px, 1fr) auto;
      gap: 12px;
      .b-shop-card-modern__identity {
        grid-row: 1;
      }
      .b-shop-card-modern__status {
        grid-column: 1;
        grid-row: 2;
        padding-inline-start: 45px;
      }
      .b-shop-card-modern__expired {
        grid-column: 1;
        grid-row: 3;
      }
      .b-shop-card-modern__orders {
        grid-column: 2;
        grid-row: 1 / 4;
      }
      .b-shop-card-modern__actions {
        grid-column: 3;
        grid-row: 1 / 4;
      }
    }
  }
  @media (max-width: 599px) {
    padding: 16px;
    &__logo {
      width: 32px !important;
      height: 32px !important;
    }
    &__name a {
      font-size: 14px;
    }
    &__identity {
      gap: 8px;
    }
    &__status {
      margin-block-start: 12px;
    }
    &__orders {
      margin-block: 13px 8px;
    }
    &__queue {
      min-height: 75px;
    }
    &--compact {
      display: flex;
      gap: 0;
      padding: 16px;
      border: 1px solid var(--sd-modern-border);
      border-radius: 14px;
      margin-block-start: 10px;
      .b-shop-card-modern__identity {
        width: 100%;
      }
      .b-shop-card-modern__status {
        width: 100%;
        margin-block-start: 12px;
        padding: 0;
        display: flex;
      }
      .b-shop-card-modern__access {
        margin: 0;
      }
      .b-shop-card-modern__license {
        margin: 0;
      }
      .b-shop-card-modern__expired {
        margin-block-start: 12px;
        width: 100%;
      }
      .b-shop-card-modern__orders {
        width: 100%;
        margin-block: 13px 8px;
      }
      .b-shop-card-modern__queue {
        min-height: 60px;
      }
      .b-shop-card-modern__sales-caption {
        display: inline;
      }
      .b-shop-card-modern__actions {
        flex-direction: row;
        align-items: center;
        width: 100%;
        padding-block-start: 10px;
        border-top: 1px solid var(--sd-modern-border);
      }
      .b-shop-card-modern__primary {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
      .b-shop-card-modern__engagement {
        justify-content: space-between;
        gap: 8px;
      }
    }
  }
  @media (max-width: 599px), (pointer: coarse) {
    &__queue-cart {
      --sd-modern-icon-button-size: 44px;
    }
    &__order-row {
      min-height: 44px;
    }
    &__favorite,
    &__menu-button,
    &__copy {
      --sd-modern-icon-button-size: 44px;
    }
    &__expand,
    &__open,
    &__roles,
    &__license,
    &__period,
    &__renew,
    &__engagement-item,
    &__website-open {
      min-height: 44px;
    }
    &__sections :deep(.v-list-item) {
      min-height: 44px;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    &__license-expiry-dot {
      animation: none;
    }
    &__expand,
    &__expand-chevron {
      transition: none;
    }
  }
}
</style>
