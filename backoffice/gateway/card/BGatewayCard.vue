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

<template>
  <article
    v-if="modern"
    class="b-gateway-card-modern sd-modern-widget text-start"
  >
    <header class="b-gateway-card-modern__header">
      <component
        :is="gateway ? 'router-link' : 'div'"
        :to="gateway ? detailsRoute : undefined"
        class="b-gateway-card-modern__provider"
      >
        <span class="b-gateway-card-modern__logo" aria-hidden="true">
          <v-img :src="icon" height="40" width="40" />
        </span>
        <div class="b-gateway-card-modern__identity">
          <h2>{{ title_big }}</h2>
          <span dir="ltr">{{ gateway?.code }}</span>
        </div>
        <v-tooltip
          v-if="gateway"
          activator="parent"
          location="top"
          :open-on-focus="true"
          content-class="sd-modern-tooltip text-start"
          >{{
            $t("widget_shop_gateway.modern.open_details", {
              gateway: title_big,
            })
          }}</v-tooltip
        >
      </component>
      <v-btn
        v-if="gateway"
        :to="editRoute"
        variant="text"
        icon
        class="sd-modern-icon-button"
        :aria-label="$t('widget_shop_gateway.modern.edit')"
        @click.stop
      >
        <v-icon icon="tune" aria-hidden="true" />
        <v-tooltip
          activator="parent"
          location="top"
          content-class="sd-modern-tooltip text-start"
          >{{ $t("widget_shop_gateway.modern.edit") }}</v-tooltip
        >
      </v-btn>
    </header>

    <div class="b-gateway-card-modern__state">
      <span class="b-gateway-card-modern__status">
        <v-icon
          v-if="!gateway?.enable"
          icon="error_outline"
          size="16"
          color="error"
          aria-hidden="true"
        />
        <span
          v-else
          class="sd-modern-status__dot"
          :class="
            shopGateway.enable
              ? 'text-success'
              : 'b-gateway-card-modern__inactive'
          "
          aria-hidden="true"
        />
        {{
          $t(
            "widget_shop_gateway.modern." +
              (!gateway?.enable
                ? "provider_unavailable"
                : shopGateway.enable
                  ? "enabled"
                  : "disabled"),
          )
        }}
      </span>
      <span class="b-gateway-card-modern__mode">
        <v-icon
          v-if="!shopGateway.livemode"
          icon="science"
          size="14"
          color="warning"
          aria-hidden="true"
        />
        {{
          shopGateway.livemode
            ? $t("b_gateway_overview.modern.live")
            : $t("b_gateway_overview.modern.test")
        }}
      </span>
    </div>

    <div class="b-gateway-card-modern__capabilities">
      <strong class="b-gateway-card-modern__currency"
        >{{ gateway?.currency }}<u-currency-icon :currency="currency" flag-only
      /></strong>
      <span v-if="gateway?.cod" class="sd-modern-tag">COD</span>
      <span v-if="gateway?.cash" class="sd-modern-tag">{{
        $t("b_gateway_overview.modern.flow.cash")
      }}</span>
      <span v-if="gateway?.dir" class="sd-modern-tag">{{
        $t("b_gateway_overview.modern.flow.direct")
      }}</span>
      <span v-if="gateway?.blockchain" class="sd-modern-tag">{{
        $t("global.commons.blockchain")
      }}</span>
      <span v-if="gateway?.subscription" class="sd-modern-tag">{{
        $t("global.product_types.subscription")
      }}</span>
      <span v-if="gateway?.pos" class="sd-modern-tag">{{
        $t("global.commons.pos")
      }}</span>
    </div>

    <template v-if="extended">
      <slot name="extra-info" />
      <div class="b-gateway-card-modern__wallet">
        <div class="b-gateway-card-modern__wallet-identity">
          <span class="b-gateway-card-modern__label"
            ><v-icon
              icon="account_balance_wallet"
              size="15"
              aria-hidden="true"
            />{{ $t("widget_shop_gateway.modern.wallet") }}</span
          >
          <span>{{
            linked_account_to_shop
              ? linked_account_to_shop.account_name ||
                $t("b_gateway_overview.modern.flow.wallet")
              : $t("widget_shop_gateway.modern.not_connected")
          }}</span>
        </div>
        <div
          v-if="linked_account_to_shop"
          class="b-gateway-card-modern__wallet-value"
        >
          <button
            type="button"
            class="b-gateway-card-modern__balance"
            :aria-label="
              $t('widget_shop_gateway.modern.available_balance') +
              ': ' +
              formatter(free_balance) +
              (free_balance < 0
                ? '. ' + $t('widget_shop_gateway.modern.negative_balance')
                : '')
            "
            @click.stop
          >
            <u-price
              :amount="free_balance"
              :currency="linked_account_to_shop.currency"
            />
            <v-icon
              v-if="free_balance < 0"
              icon="warning_amber"
              size="15"
              color="error"
              :aria-label="$t('widget_shop_gateway.modern.negative_balance')"
            />
            <v-tooltip
              activator="parent"
              location="top"
              :open-on-focus="true"
              :open-on-click="true"
              interactive
              content-class="sd-modern-tooltip text-start"
              :max-width="320"
            >
              <p>{{ $t("widget_shop_gateway.modern.balance_help") }}</p>
              <dl class="b-gateway-card-modern__balances">
                <dt>{{ $t("global.commons.balance") }}</dt>
                <dd>
                  <u-price
                    :amount="linked_account_to_shop.balance"
                    :currency="linked_account_to_shop.currency"
                  />
                </dd>
                <dt>{{ $t("widget_shop_gateway.modern.locked") }}</dt>
                <dd>
                  <u-price
                    :amount="linked_account_to_shop.locked"
                    :currency="linked_account_to_shop.currency"
                  />
                </dd>
                <dt>
                  {{ $t("widget_shop_gateway.modern.available_balance") }}
                </dt>
                <dd>
                  <u-price
                    :amount="free_balance"
                    :currency="linked_account_to_shop.currency"
                  />
                </dd>
              </dl>
              <p v-if="free_balance < 0">
                {{ $t("widget_shop_gateway.modern.negative_balance") }}
              </p>
            </v-tooltip>
          </button>
          <v-btn
            :to="walletRoute"
            :aria-label="
              $t('widget_shop_gateway.modern.open_wallet') +
              ' •••• ' +
              walletLastFour
            "
            variant="text"
            class="sd-modern-button sd-modern-button--inline b-gateway-card-modern__wallet-link"
            @click.stop
          >
            <span dir="ltr">•••• {{ walletLastFour }}</span>
            <v-tooltip
              activator="parent"
              location="top"
              content-class="sd-modern-tooltip text-start"
              >{{ $t("widget_shop_gateway.modern.open_wallet") }}</v-tooltip
            >
          </v-btn>
        </div>
        <v-btn
          v-else
          :to="{ name: 'BPageShopFinanceBill' }"
          variant="text"
          class="sd-modern-button sd-modern-button--inline"
          @click.stop
        >
          {{ $t("widget_shop_gateway.modern.connect_wallet") }}
          <v-tooltip
            activator="parent"
            location="top"
            content-class="sd-modern-tooltip text-start"
            >{{
              $t("widget_shop_gateway.link_account_caution", {
                currency: gateway?.currency,
              })
            }}</v-tooltip
          >
        </v-btn>
      </div>

      <div
        v-if="networkMessage"
        class="b-gateway-card-modern__notice"
        role="status"
      >
        <v-icon
          icon="error_outline"
          size="17"
          color="error"
          aria-hidden="true"
        />
        <span>{{ networkMessage }}</span>
      </div>
      <div
        v-if="is_cod && transportations && !cod_transportations?.length"
        class="b-gateway-card-modern__notice"
        role="status"
      >
        <v-icon
          icon="warning_amber"
          size="17"
          color="warning"
          aria-hidden="true"
        />
        <div>
          <p>{{ $t("widget_shop_gateway.modern.cod_warning") }}</p>
          <v-btn
            :to="{ name: 'BPageShopLogisticShipping' }"
            target="_blank"
            variant="text"
            append-icon="open_in_new"
            class="sd-modern-button sd-modern-button--inline"
            @click.stop
          >
            {{ $t("widget_shop_gateway.modern.shipping_settings") }}
            <v-tooltip
              activator="parent"
              location="top"
              content-class="sd-modern-tooltip text-start"
              >{{
                $t("widget_shop_gateway.modern.shipping_settings")
              }}</v-tooltip
            >
          </v-btn>
        </div>
      </div>

      <b-gateway-card-activity
        v-if="gateway"
        :data-pack="shopGateway.data || []"
        :currency="gateway.currency"
      />

      <details
        v-if="
          description ||
          gateway?.network ||
          (is_cod && cod_transportations?.length)
        "
        class="b-gateway-card-modern__disclosure"
        @click.stop
      >
        <summary>
          {{ $t("widget_shop_gateway.modern.service_details")
          }}<v-icon icon="expand_more" size="17" aria-hidden="true" />
        </summary>
        <p v-if="description">{{ description }}</p>
        <div
          v-if="is_cod && cod_transportations?.length"
          class="b-gateway-card-modern__shipping"
        >
          <span
            v-for="trans in cod_transportations"
            :key="trans.code"
            class="sd-modern-tag"
            ><img
              v-if="trans.src"
              :src="trans.src"
              width="18"
              height="18"
              alt=""
            />{{ trans.name }}</span
          >
        </div>
        <b-gateway-network-status
          v-if="gateway?.network"
          :network="gateway.network"
          class="my-3"
        />
      </details>
    </template>

    <footer class="b-gateway-card-modern__footer">
      <v-btn
        v-if="gateway"
        :to="detailsRoute"
        variant="text"
        append-icon="north_east"
        class="sd-modern-button sd-modern-button--inline"
        @click.stop
      >
        {{ $t("widget_shop_gateway.modern.details") }}
        <v-tooltip
          activator="parent"
          location="top"
          content-class="sd-modern-tooltip text-start"
          >{{
            $t("widget_shop_gateway.modern.open_details", {
              gateway: title_big,
            })
          }}</v-tooltip
        >
      </v-btn>
      <span>{{ paymentTypeLabel }}</span>
    </footer>
  </article>
  <div
    v-else
    class="position-relative c-container -force-rounded pa-2"
    style="height: 100%"
  >
    <s-widget
      :class="[small ? 'm-1' : '', dark ? 'widget-dark' : '']"
      :style="`background: ${color}`"
      :title="`<h5 class='align-items-center pb-1'>    <span class='circle ${class_state} me-1' style='font-size: 6px;'></span>  ${title_big}<span class='ms-1 small'> (${title})</span>  </h5>`"
      body-class="p-0 mt"
      class="text-start elevation-3 widget-hover-dark pointer-pointer pb-0"
      custom-header
      style="border-radius: 8px; min-height: 160px; height: inherit"
    >
      <div
        class="text-center absolute-top-end text-center px-2 pt-1"
        @mouseleave="show_description = false"
        @mouseover="show_description = true"
      >
        <v-img
          :height="small ? 16 : 36"
          :src="icon"
          class="mx-auto"
          width="48px"
        />
      </div>

      <div v-if="!show_description" class="py-3 my-1 d-flex align-center">
        <span class="text-h5 font-weight-black me-1">{{
          gateway?.currency
        }}</span>
        <u-currency-icon
          :currency="currency"
          flag-only
          class="me-1"
        ></u-currency-icon>

        <v-chip
          v-if="!gateway?.enable"
          color="red"
          prepend-icon="gpp_bad"
          size="x-small"
          variant="flat"
        >
          Gateway disabled
        </v-chip>

        <v-chip
          v-else-if="shopGateway.enable && shopGateway.livemode"
          color="green"
          prepend-icon="verified_user"
          size="x-small"
          variant="flat"
        >
          {{ $t("global.status.active") }}
        </v-chip>

        <v-chip
          v-else-if="shopGateway.enable && !shopGateway.livemode"
          color="orange"
          prepend-icon="science"
          size="x-small"
          variant="flat"
        >
          {{ $t("global.status.debug") }}
        </v-chip>

        <v-chip
          v-else
          color="red"
          prepend-icon="report_gmailerrorred"
          size="x-small"
          variant="flat"
        >
          {{ $t("global.status.inactive") }}
          <v-icon class="blink-me" end size="12">circle</v-icon>

          <v-tooltip
            activator="parent"
            content-class="bg-red"
            location="bottom"
          >
            The gateway is inactivated by selldone.
          </v-tooltip>
        </v-chip>

        <v-chip
          v-if="gateway.cod"
          size="x-small"
          color="blue"
          variant="flat"
          class="ms-1"
          >COD</v-chip
        >
        <v-chip
          v-if="gateway.cash"
          size="x-small"
          color="#009688"
          variant="flat"
          class="ms-1"
          >Cash</v-chip
        >
        <v-chip
          v-if="gateway.dir"
          size="x-small"
          color="#303F9F"
          variant="flat"
          class="ms-1"
          >Direct</v-chip
        >
        <v-chip
          v-if="gateway.blockchain"
          size="x-small"
          color="#C2185B"
          variant="flat"
          class="ms-1"
          >Blockchain</v-chip
        >
        <v-chip
          v-if="gateway.subscription"
          size="x-small"
          color="#673AB7"
          variant="flat"
          class="ms-1"
          >Subscription
        </v-chip>
        <v-chip
          v-if="gateway.pos"
          size="x-small"
          color="#000"
          variant="flat"
          class="ms-1"
          >POS</v-chip
        >

        <v-spacer></v-spacer>
        <v-btn
          icon
          title="Edit"
          variant="text"
          @click="goToEditGateway()"
          @click.stop
        >
          <v-icon :color="dark ? '#fff' : '#444'" size="small"> tune</v-icon>
        </v-btn>
      </div>

      <template v-if="extended && !show_description">
        <!-- Block chain sync error -->
        <div
          v-if="
            gateway?.network &&
            gateway.network.blockchain &&
            !gateway.network.synced
          "
          class="text-subtitle-2 mt-2"
        >
          <v-icon class="me-1 blink-me" color="red">error</v-icon>
          {{ $t("global.errors.gateway_blockchain_sync_error") }}

          <b-gateway-network-status
            :network="gateway.network"
            class="my-1 text-center"
          ></b-gateway-network-status>
        </div>
        <!-- Gateway general error -->
        <div
          v-else-if="gateway?.network && !gateway.network.active"
          class="text-subtitle-2 mt-2"
        >
          <v-icon class="me-1 blink-me" color="red">error</v-icon>
          {{ $t("global.errors.gateway_network_error") }}

          <b-gateway-network-status
            :network="gateway.network"
            class="my-1 text-center"
          ></b-gateway-network-status>
        </div>

        <!-- Extra info -->

        <hr class="hr-dashed" />
        <div class="py-2">
          <slot name="extra-info" />
          <div v-if="linked_account_to_shop">
            <small>{{ linked_account_to_shop.account_name }}</small>
            <v-row align="center" dense>
              <v-btn
                :to="{
                  name: 'BPageAccountTransactions',
                  params: {
                    account_number: linked_account_to_shop.account_number,
                  },
                }"
                class="me-1"
                icon
                size="small"
                variant="text"
                @click.stop
              >
                <v-icon>wallet</v-icon>

                <v-tooltip
                  activator="parent"
                  content-class="bg-black"
                  location="bottom"
                >
                  Linked selldone wallet
                  <br />
                  Click to view transactions
                </v-tooltip>
              </v-btn>

              <div class="single-line flex-grow-1">
                {{ formatCard(linked_account_to_shop.account_number) }}
              </div>

              <div class="single-line">
                <u-price
                  :amount="free_balance"
                  :currency="linked_account_to_shop.currency"
                ></u-price>
                <v-icon v-if="free_balance < 0" class="blink-me" color="red"
                  >warning
                </v-icon>
                <v-tooltip
                  activator="parent"
                  content-class="bg-black text-start"
                  location="bottom"
                >
                  Available balance of the connected wallet.

                  <v-table class="bg-transparent" density="compact">
                    <template v-slot:default>
                      <tbody>
                        <tr>
                          <td>Balance</td>
                          <td>
                            <u-price
                              :amount="linked_account_to_shop.balance"
                              :currency="linked_account_to_shop.currency"
                            ></u-price>
                          </td>
                        </tr>
                        <tr>
                          <td>Locked</td>
                          <td>
                            <u-price
                              :amount="linked_account_to_shop.locked"
                              :currency="linked_account_to_shop.currency"
                            ></u-price>
                          </td>
                        </tr>
                      </tbody>
                    </template>
                  </v-table>
                </v-tooltip>
              </div>
            </v-row>
          </div>

          <template v-if="shopGateway.data?.length">
            <inline-chart-by-diff-days
              :chart-group="`${gateway?.id}_group`"
              :chart-id="`${gateway?.id}_payment`"
              :colors="['#FFA000']"
              :data-keys="['amount']"
              :data-labels="['Payment']"
              :data-pack="shopGateway.data"
              :formatter="formatter"
            ></inline-chart-by-diff-days>

            <inline-chart-by-diff-days
              :chart-group="`${gateway?.id}_group`"
              :chart-id="`${gateway?.id}_count`"
              :colors="['#0097A7', '#AFB42B']"
              :data-keys="['count', 'success']"
              :data-labels="['Count', 'Success']"
              :data-pack="shopGateway.data"
              :formatter="formatterCount"
            ></inline-chart-by-diff-days>
          </template>
        </div>

        <div v-if="is_cod && transportations && !cod_transportations?.length">
          <v-icon color="red" class="blink-me">warning</v-icon>
          This shop currently doesn't have a shipping method that supports COD.
          Please add at least one COD-supported shipping method in the settings.
          <br />
          <v-btn
            @click.stop
            size="small"
            class="mt-2"
            append-icon="launch"
            :to="{ name: 'BPageShopLogisticShipping' }"
            target="_blank"
            color="primary"
            >Shippings Methods
          </v-btn>
        </div>
      </template>

      <v-slide-y-reverse-transition hide-on-leave>
        <div v-if="show_description" class="mt-4 text-center">
          <v-img
            :height="42"
            :src="icon"
            class="mx-auto mb-2 zoomIn"
            width="48px"
          />

          <template v-if="is_cod && transportations">
            <v-chip
              v-for="trans in cod_transportations"
              :key="trans.code"
              :prepend-avatar="trans.src"
              class="ma-1"
              size="small"
              color="#eee"
              variant="flat"
              >{{ trans.name }}
            </v-chip>
          </template>

          <p class="my-3 text-subtitle-2">
            {{ description }}
          </p>

          <b-gateway-network-status
            :network="gateway?.network"
            class="my-2 border-top fadeIn pt-2"
          ></b-gateway-network-status>
        </div>
      </v-slide-y-reverse-transition>
    </s-widget>

    <div
      v-if="!linked_account_to_shop"
      :title="
        $t('widget_shop_gateway.link_account_caution', {
          currency: gateway?.currency,
        })
      "
      class="overlay-block clickable --red rounded-xl"
      @click.stop="$router.push({ name: 'BPageShopFinanceBill' })"
    ></div>
  </div>
</template>

<script lang="ts">
import InlineChartByDiffDays from "../../chart/InlineChartByDiffDays.vue";
import BGatewayNetworkStatus from "../../gateway/network-status/BGatewayNetworkStatus.vue";
import UCurrencyIcon from "../../../ui/currency/icon/UCurrencyIcon.vue";
import { ShopTransportations } from "@selldone/core-js/enums/logistic/ShopTransportations";
import CurrencyMixin from "@selldone/components-vue/mixin/currency/CurrencyMixin.ts";
import AccountMixin from "@selldone/components-vue/mixin/account/AccountMixin.ts";
import BGatewayCardActivity from "./BGatewayCardActivity.vue";

export default {
  name: "BGatewayCard",
  mixins: [CurrencyMixin, AccountMixin],
  components: {
    BGatewayCardActivity,
    UCurrencyIcon,
    BGatewayNetworkStatus,
    InlineChartByDiffDays,
  },
  props: {
    modern: { type: Boolean, default: false },
    shop: {
      required: true,
      type: Object,
    },

    shopGateway: {
      required: true,
      type: Object,
    },

    dark: {
      required: false,
      default: false,
      type: Boolean,
    },
    color: {
      required: false,
      default: "white",
      type: String,
    },

    small: {
      required: false,
      default: false,
      type: Boolean,
    },
    extended: {
      required: false,
      default: false,
      type: Boolean,
    },
    iconColor: {
      required: false,
      type: String,
      default: "#333",
    },
  },

  data() {
    return {
      show_description: false,

      formatter: (value, timestamp, index) => {
        return (
          this.FormatNumberCurrency(value, this.gateway?.currency) +
          " " +
          this.GetUserSelectedCurrencyName(this.gateway?.currency)
        );
      },
    };
  },
  computed: {
    editRoute() {
      return {
        name: "BPageGatewayEdit",
        params: { gateway_code: this.gateway?.code },
      };
    },
    detailsRoute() {
      return {
        name: "BPageGatewayDashboard",
        params: { gateway_code: this.gateway?.code },
      };
    },
    walletRoute() {
      return {
        name: "BPageAccountTransactions",
        params: { account_number: this.linked_account_to_shop?.account_number },
      };
    },
    walletLastFour() {
      return String(this.linked_account_to_shop?.account_number ?? "")
        .replace(/[\s-]/g, "")
        .slice(-4);
    },
    networkMessage() {
      const network = this.gateway?.network;
      if (network?.blockchain && !network.synced)
        return this.$t("global.errors.gateway_blockchain_sync_error");
      if (network && !network.active)
        return this.$t("global.errors.gateway_network_error");
      return null;
    },
    paymentTypeLabel() {
      const key = this.gateway?.cod
        ? "cod"
        : this.gateway?.cash
          ? "cash"
          : this.gateway?.dir
            ? "direct"
            : this.gateway?.blockchain
              ? "blockchain"
              : "online";
      return this.$t("b_gateway_overview.modern.flow." + key);
    },
    currency() {
      return this.GetCurrency(this.gateway?.currency);
    },

    linked_account_to_shop() {
      return this.shop.accounts.find(
        (account) => account.currency === this.gateway?.currency,
      );
    },

    free_balance() {
      return (
        this.linked_account_to_shop.balance - this.linked_account_to_shop.locked
      );
    },
    gateway() {
      return this.shopGateway.gateway;
    },
    icon() {
      return this.getShopImagePath(this.gateway?.icon);
    },
    url() {
      return this.gateway?.url;
    },

    title() {
      if (!this.gateway) return "⛔";
      return this.gateway.code;
    },

    title_big() {
      if (!this.gateway) return "⛔ Removed Gateway";

      let extra = "";
      if (this.shopGateway.config?.connect) extra = " Connect";

      return this.gateway.name + extra;
    },

    title_big_span() {
      return this.shopGateway?.enable
        ? this.$t("global.active")
        : this.$t("global.inactive");
    },

    description() {
      return this.gateway?.description;
    },

    class_state() {
      return this.gateway?.enable ? "bg-success" : "bg-danger"; //bg-warning
    },
    transportations() {
      return this.shop.transportations;
    },
    cod_transportations() {
      return this.transportations
        ?.filter((item) => {
          return item.enable && item.cod;
        })

        .map((item) => {
          const t = ShopTransportations[item.type];
          return {
            src: item.logo ? this.getShopImagePath(item.logo) : t?.icon,
            name: item.title ? item.title : this.$t(t?.name),
            code: item.type,
          };
        });
    },

    is_cod() {
      return this.gateway?.cod;
    },
  },
  created() {},
  mounted() {},
  methods: {
    goToEditGateway() {
      this.$router.push({
        name: "BPageGatewayEdit",
        params: { gateway_code: this.gateway?.code },
      });
    },

    formatterCount: (value, timestamp, index) => {
      return `${value} times`;
    },
  },
};
</script>

<style lang="scss" scoped>
.plugin-name {
  font-weight: 600;
  font-size: 1.2em;
}

.b-gateway-card-modern {
  padding: 22px 22px 0;
  height: 100%;
  min-width: 0;
  display: flex;
  flex-direction: column;
  border-radius: 20px;
  font-size: 13px;
  &__header {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  &__provider {
    display: flex;
    align-items: center;
    gap: 12px;
    flex: 1;
    min-width: 0;
    min-height: 44px;
    border-radius: 8px;
    color: inherit;
    text-decoration: none;
    &[href]:hover h2 {
      text-decoration: underline;
      text-underline-offset: 3px;
    }
    &:focus-visible {
      outline: 2px solid rgb(var(--v-theme-primary));
      outline-offset: 3px;
    }
  }
  &__logo {
    display: grid;
    place-items: center;
    width: 42px;
    height: 42px;
    flex: 0 0 42px;
    border-radius: 11px;
    overflow: hidden;
    background: var(--sd-modern-inset);
  }
  &__identity {
    min-width: 0;
    flex: 1;
    h2 {
      font-size: 18px;
      font-weight: 550;
      line-height: 1.35;
      margin: 0;
      overflow-wrap: anywhere;
    }
    > span {
      display: block;
      margin-block-start: 3px;
      color: var(--sd-modern-muted);
      font-size: 11px;
      overflow-wrap: anywhere;
    }
  }
  &__state {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
    margin-block-start: 20px;
    font-size: 12px;
  }
  &__status,
  &__mode {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
  &__status {
    font-weight: 500;
  }
  &__mode,
  &__inactive {
    color: var(--sd-modern-muted);
  }
  &__capabilities {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 6px;
    margin-block: 9px 18px;
    .sd-modern-tag {
      padding: 3px 6px;
      font-size: 11px;
    }
  }
  &__currency {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 14px;
    margin-inline-end: 4px;
  }
  &__wallet {
    display: flex;
    justify-content: space-between;
    align-items: start;
    flex-wrap: wrap;
    gap: 8px;
    padding-block-start: 15px;
    border-block-start: 1px solid var(--sd-modern-border);
    min-height: 77px;
  }
  &__wallet-identity {
    display: flex;
    flex-direction: column;
    gap: 5px;
    min-width: 0;
    > span:last-child {
      overflow-wrap: anywhere;
    }
  }
  &__label {
    display: flex;
    align-items: center;
    gap: 6px;
    color: var(--sd-modern-muted);
    font-size: 12px;
  }
  &__wallet-value {
    text-align: end;
    margin-inline-start: auto;
    display: flex;
    flex-direction: column;
    align-items: end;
  }
  &__balance {
    display: inline-flex;
    gap: 4px;
    align-items: center;
    color: inherit;
    font-size: 13px;
    border-radius: 5px;
    font-variant-numeric: tabular-nums;
  }
  &__wallet-link.v-btn {
    min-height: 28px;
    font-size: 11px;
    color: var(--sd-modern-muted);
  }
  &__notice {
    background: var(--sd-modern-inset);
    border-radius: 9px;
    display: flex;
    gap: 8px;
    align-items: start;
    padding: 11px 12px;
    margin-block-start: 12px;
    font-size: 12px;
    line-height: 1.6;
    p {
      margin: 0;
    }
    > .v-icon {
      margin-block-start: 2px;
    }
  }
  &__disclosure {
    border-block-start: 1px solid var(--sd-modern-border);
    font-size: 12px;
    > summary {
      display: flex;
      align-items: center;
      justify-content: space-between;
      cursor: pointer;
      min-height: 36px;
      color: var(--sd-modern-muted);
      list-style: none;
      &::-webkit-details-marker {
        display: none;
      }
    }
    > p {
      margin-block: 4px 12px;
    }
  }
  &__disclosure[open] > summary .v-icon {
    transform: rotate(180deg);
  }
  &__shipping {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
    margin-block-end: 12px;
  }
  &__footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    margin-block-start: auto;
    border-block-start: 1px solid var(--sd-modern-border);
    padding-block: 9px;
    > span {
      text-align: end;
      color: var(--sd-modern-muted);
      font-size: 11px;
    }
  }
  :is(button, summary):focus-visible {
    outline: 2px solid rgb(var(--v-theme-primary));
    outline-offset: 3px;
  }
  @media (max-width: 600px) {
    padding: 20px 18px 0;
    &__balance,
    &__wallet-link.v-btn,
    &__disclosure > summary {
      min-height: 44px;
    }
  }
}
.b-gateway-card-modern__balances {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 6px 14px;
  margin-block: 10px;
  dd {
    margin: 0;
    text-align: end;
  }
}
</style>
