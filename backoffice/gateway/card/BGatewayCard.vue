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
  <div
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
          size="x-small" variant="flat"
        >
          Gateway disabled
        </v-chip>

        <v-chip
          v-else-if="shopGateway.enable && shopGateway.livemode"
          color="green"
          prepend-icon="verified_user"
          size="x-small" variant="flat"
        >
          {{ $t("global.status.active") }}
        </v-chip>

        <v-chip
          v-else-if="shopGateway.enable && !shopGateway.livemode"
          color="orange"
          prepend-icon="science"
          size="x-small" variant="flat"
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

        <v-chip v-if="gateway.cod" size="x-small" color="blue" variant="flat" class="ms-1">COD</v-chip>
        <v-chip v-if="gateway.cash" size="x-small" color="#009688" variant="flat" class="ms-1">Cash</v-chip>
        <v-chip v-if="gateway.dir" size="x-small" color="#303F9F" variant="flat" class="ms-1">Direct</v-chip>
        <v-chip v-if="gateway.blockchain" size="x-small" color="#C2185B" variant="flat" class="ms-1">Blockchain</v-chip>
        <v-chip v-if="gateway.subscription" size="x-small" color="#673AB7" variant="flat" class="ms-1">Subscription</v-chip>
        <v-chip v-if="gateway.pos" size="x-small" color="#000" variant="flat" class="ms-1">POS</v-chip>


        <v-spacer></v-spacer>
        <v-btn
          icon
          title="Edit"
          variant="text"
          @click="goToEditGateway()"
          @click.stop
        >
          <v-icon :color="dark ? '#fff' : '#444'" size="small"> tune </v-icon>
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
          <br>
          <v-btn @click.stop size="small" class="mt-2" append-icon="launch" :to="{name:'BPageShopLogisticShipping'}" target="_blank" color="primary">Shippings Methods</v-btn>
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
      class="overlay-block clickable blink --red text-uppercase rounded-xl"
      @click.stop="$router.push({ name: 'BPageShopFinanceBill' })"
    ></div>
  </div>
</template>

<script lang="ts">
import InlineChartByDiffDays from "../../chart/InlineChartByDiffDays.vue";
import BGatewayNetworkStatus from "../../gateway/network-status/BGatewayNetworkStatus.vue";
import UCurrencyIcon from "../../../ui/currency/icon/UCurrencyIcon.vue";
import { ShopTransportations } from "@selldone/core-js/enums/logistic/ShopTransportations";

export default {
  name: "BGatewayCard",
  components: {
    UCurrencyIcon,
    BGatewayNetworkStatus,
    InlineChartByDiffDays,
  },
  props: {
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
      return this.gateway.cod;
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
</style>
