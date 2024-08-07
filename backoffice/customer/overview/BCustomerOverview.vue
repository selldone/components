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
  <v-container v-bind="$attrs">
    <u-loading-ellipsis v-if="busy" css-mode light></u-loading-ellipsis>

    <v-row v-if="customer">
      <v-col :class="{ small: dense }" class="text-start" cols="12" sm="4">
        <h3 class="p-0 font-weight-normal">
          <v-icon class="me-1" size="small">phone</v-icon>
          <span v-if="customer.phone" v-copy>{{ customer.phone }}</span>
          <small v-else>No number!</small>
        </h3>
      </v-col>

      <v-col :class="{ small: dense }" class="text-start" cols="12" sm="4">
        <h3 class="p-0 font-weight-normal">
          <v-icon class="me-1" size="small">email</v-icon>
          <span v-copy>{{ customer.email }}</span>
        </h3>
        <div>
          <v-chip
            v-if="customer.access"
            class="ma-1"
            color="#7C4DFF"
            label
            size="small"
            variant="flat"
          >
            <v-icon start>verified</v-icon>
            Exlusive Access
          </v-chip>

          <v-chip
            v-if="customer.subscribed"
            class="ma-1"
            color="success"
            label
            size="small"
            variant="flat"
          >
            <v-icon start>mark_email_read</v-icon>
            {{ $t("global.commons.subscribed") }}
          </v-chip>

          <v-chip
            v-if="customer.source === 'vendor'"
            class="ma-1"
            color="#000"
            label
            size="small"
            variant="flat"
          >
            <v-icon start>storefront</v-icon>
            {{ $t("global.commons.vendor") }}
          </v-chip>

          <v-chip
            v-for="segment in customer.segments?.limit(3)"
            :key="segment"
            :color="segment.toColor(true)"
            class="ma-1"
            label
            size="small"
            variant="tonal"
          >
            {{ segment }}
          </v-chip>
          <v-btn
            class="ma-1"
            icon
            size="26"
            variant="text"
            @click="showEditSegments()"
          >
            <v-icon> more_horiz</v-icon>
          </v-btn>
        </div>
      </v-col>

      <v-col
        :class="{ small: dense }"
        class="text-center d-flex"
        cols="12"
        sm="4"
      >
        <div class="w-50">
          <small class="d-block">
            <v-icon class="me-1" size="small">diamond</v-icon>
            {{ $t("global.commons.customer_club") }}
          </small>

          <div class="widget-buttons">
            <v-btn size="x-large" variant="text" @click.stop="showSetClub()">
              <template v-if="customer.level">
                <img
                  :src="getCustomerClubLevel(customer.level).icon"
                  class="me-1"
                  height="28"
                  width="28"
                />
                {{ $t(getCustomerClubLevel(customer.level).name) }}
              </template>

              <small v-else> {{ $t("global.commons.no_club") }}</small>
            </v-btn>
          </div>
        </div>

        <div class="w-50">
          <small class="d-block">
            <v-icon class="me-1" size="small">sports_esports</v-icon>
            {{ $t("global.commons.chips") }}
          </small>
          <div class="widget-buttons">
            <v-btn size="x-large" variant="text" @click.stop="showSetChips()">
              <v-icon start>casino</v-icon>
              {{ numeralFormat(customer.chips, "0,0") }}
            </v-btn>
          </div>
        </div>
      </v-col>

      <v-col :class="{ small: dense }" class="text-start" cols="12" sm="4">
        <div class="widget-box min-h-100">
          <v-icon class="me-1" color="#111">celebration</v-icon>
          <b>{{ $t("global.commons.join_at") }}</b>

          <h3 class="text-end">{{ getFromNowString(customer.created_at) }}</h3>
          <small class="d-block text-end">{{
            getLocalTimeString(customer.created_at)
          }}</small>

          <hr class="my-2" />
          <v-icon class="me-1" color="#111">login</v-icon>
          <b>{{ $t("global.commons.last_login") }}</b>

          <h3 class="text-end">{{ getFromNowString(customer.login_at) }}</h3>
          <small class="d-block text-end">{{
            getLocalTimeString(customer.login_at)
          }}</small>

          <template v-if="customer.birthday">
            <hr class="my-2" />
            <v-icon class="me-1" color="#111">cake</v-icon>
            <b>{{ $t("global.commons.birthday") }}</b>

            <h3 class="text-end">
              {{ getLocalDateString(customer.birthday) }}
            </h3>
            <small class="d-block text-end">{{
              getFromNowString(customer.birthday)
            }}</small>
          </template>

          <template v-if="customer.address">
            <hr class="my-2" />
            <v-icon class="me-1" color="#111">arrow_drop_down</v-icon>
            <b>{{ $t("global.commons.address") }}</b>

            <p>
              <flag
                v-if="customer.country"
                :iso="customer.country"
                :squared="false"
                :title="getCountryName(customer.country)"
                class="me-1"
              />

              {{ full_address }}
            </p>
          </template>

          <template v-if="customer.banned">
            <hr class="my-2" />
            <v-icon class="me-1" color="red">front_hand</v-icon>
            <b class="text-red">{{ $t("global.commons.banned") }}</b>
            <p>
              This customer is banned and cannot place new orders or post to the
              community.
            </p>

            <div class="text-end py-1">
              <v-btn
                :to="{ name: 'BPageCustomerEdit' }"
                class="tnt"
                prepend-icon="settings"
                size="small"
                variant="elevated"
                >Change
              </v-btn>
            </div>
          </template>
        </div>
      </v-col>

      <v-col
        v-if="clv"
        :class="{ small: dense }"
        class="text-start"
        cols="12"
        sm="4"
      >
        <div class="widget-box min-h-100">
          <v-icon color="#111">arrow_drop_down</v-icon>
          <b>CLV</b>
          <small class="d-block mb-2">customer lifetime value</small>

          <h3 v-if="!clv.length" class="d-flex align-center">
            <div class="dashed-flex-space"></div>
            0
          </h3>

          <h3 v-for="it in clv" :key="it.currency" class="d-flex">
            <u-currency-icon
              :currency="it.currency"
              class="me-1"
              flag-only
            ></u-currency-icon>
            <span>{{ it.currency }}</span>

            <div class="dashed-flex-space"></div>

            <u-price :amount="it.amount" :currency="it.currency"></u-price>
          </h3>
        </div>
      </v-col>

      <v-col
        v-if="activity"
        :class="{ small: dense }"
        class="text-start"
        cols="12"
        sm="4"
      >
        <div class="widget-box min-h-100">
          <v-icon color="#111">arrow_drop_down</v-icon>
          <b>{{ $t("global.commons.last_activity") }}</b>

          <div
            :title="getFromNowString(activity.updated_at)"
            class="d-flex align-center"
          >
            <small>{{ getLocalTimeString(activity.created_at) }}</small>

            <div
              class="flex-grow-1 mx-2"
              style="border-bottom: solid 3px #81ec16"
            ></div>

            <small class="ms-1">{{
              getLocalTimeOnlyString(activity.updated_at)
            }}</small>
          </div>

          <hr class="my-4" />

          <h3 class="text-center my-2">
            {{ activity.os }} / {{ activity.device }} / {{ activity.type }}
          </h3>

          <v-row class="small mb-2" no-gutters>
            <div :title="$t('global.commons.country')">
              <flag
                :iso="activity.country_code"
                :squared="false"
                class="me-2"
              />

              {{ activity.country }}

              <span v-if="activity.region" class="ms-1">
                / {{ activity.region }}
              </span>
            </div>

            <v-spacer></v-spacer>

            <div title="Browser">
              <img :src="getBrowserImage(activity.browser)" height="18" />
              {{ activity.browser }}
            </div>
          </v-row>

          <div class="d-flex">
            <div>
              <v-icon size="small">swipe_right_alt</v-icon>
              {{ $t("global.commons.origin") }}
            </div>
            <div class="dashed-flex-space"></div>
            <span
              v-if="activity.origin"
              v-copy
              :title="activity.origin"
              class="text-body-2 text-ellipsis max-w-200 p-0"
              >{{ activity.origin }}</span
            >
            <span v-else>{{ $t("global.commons.direct") }}</span>
          </div>
          <div class="d-flex">
            <div>
              <v-icon size="small">swipe_down_alt</v-icon>
              {{ $t("global.commons.landing") }}
            </div>
            <div class="dashed-flex-space"></div>
            <span
              v-copy
              :title="activity.to"
              class="text-body-2 text-ellipsis max-w-200 p-0"
              >{{ activity.to }}</span
            >
          </div>

          <div class="d-flex text-center mt-2">
            <div
              v-for="i in UserActivityKeys"
              :key="i.code"
              :title="$t(i.name)"
              class="w-25"
            >
              <v-icon size="small">{{ i.icon }}</v-icon>
              <div>{{ activity[i.code] }}</div>
            </div>
          </div>
        </div>
      </v-col>

      <!-- ---------------------------------------- Segments ---------------------------------- -->

      <v-col cols="12">
        <div class="widget-box -x-large">
          <s-widget-header
            :title="$t('global.commons.segments')"
            add-caption="Add tag"
            add-text
            icon="label_important"
            @click:add="showEditSegments()"
          >
          </s-widget-header>
          <v-list-subheader
            >You can use segments to filter customers and send emails to
            targeted audiences.
          </v-list-subheader>
          <v-row class="my-3" no-gutters>
            <v-chip
              v-for="segment in customer.segments"
              :key="segment"
              :color="segment.toColor(true)"
              class="ma-1"
              label
              variant="tonal"
            >
              <v-icon :color="segment.toColor(true)" start>circle</v-icon>

              {{ segment }}
            </v-chip>
          </v-row>
        </div>
      </v-col>

      <v-col cols="12">
        <!-- ---------------------------------------- Online ---------------------------------- -->
        <div class="widget-box -x-large mb-5 min-height-20vh">
          <s-widget-header
            :title="$t('global.commons.online_orders')"
            icon="local_mall"
          >
          </s-widget-header>
          <v-list-subheader
            >List of last five online orders by this customer.
          </v-list-subheader>

          <v-data-table
            v-if="customer.baskets && customer.baskets.length"
            :density="dense ? 'compact' : undefined"
            :header-props="{ sortByText: $t('global.commons.sort_by') }"
            :headers="headers"
            :items="customer.baskets"
            :items-per-page="5"
            class="bg-transparent"
            hide-default-footer
          >
            <template v-slot:item.id="{ item }">
              <b-order-button-basket
                :order="item"
                :small="dense"
                target="_blank"
                variant="text"
              ></b-order-button-basket>
            </template>

            <template v-slot:item.price="{ item }">
              <u-price :amount="item.price" :currency="item.currency"></u-price>
            </template>

            <template v-slot:item.reserved_at="{ item }">
              <div class="min-width-75">
                {{ getFromNowString(item.reserved_at) }}<br />
                <small>{{ getLocalTimeString(item.reserved_at) }}</small>
              </div>
            </template>

            <template v-slot:item.status="{ item }">
              <v-icon
                :color="getStatusColor(item.status)"
                class="me-1"
                size="small"
                >fiber_manual_record
              </v-icon>
              <br v-if="dense" />
              <span :class="{ 'x-small': dense }">
                {{ getStatusString(item.status) }}</span
              >
            </template>
          </v-data-table>
          <div
            v-else
            class="text-muted text-start min-height-10vh d-flex flex-column align-center justify-center op-0-3"
          >
            <v-icon size="x-large">emoji_nature</v-icon>
            {{ $t("global.commons.empty") }}
          </div>
        </div>

        <!-- ---------------------------------------- POS ---------------------------------- -->

        <div class="widget-box -x-large mb-5 min-height-20vh">
          <s-widget-header
            :title="$t('global.commons.pos_orders')"
            icon="local_mall"
          >
          </s-widget-header>

          <v-list-subheader
            >List of last five in-person orders by this customer.
          </v-list-subheader>

          <v-data-table
            v-if="customer.pos_baskets && customer.pos_baskets.length"
            :density="dense ? 'compact' : undefined"
            :header-props="{ sortByText: $t('global.commons.sort_by') }"
            :headers="headers"
            :items="customer.pos_baskets"
            :items-per-page="5"
            class="bg-transparent"
            hide-default-footer
          >
            <template v-slot:item.id="{ item }">
              <b-order-button-pos
                :order="item"
                :small="dense"
                target="_blank"
                variant="text"
              ></b-order-button-pos>
            </template>

            <template v-slot:item.price="{ item }">
              <u-price :amount="item.price" :currency="item.currency"></u-price>
            </template>

            <template v-slot:item.reserved_at="{ item }">
              <div class="min-width-75">
                {{ getFromNowString(item.reserved_at) }}<br />
                <small>{{ getLocalTimeString(item.reserved_at) }}</small>
              </div>
            </template>

            <template v-slot:item.status="{ item }">
              <v-icon
                :color="getStatusColor(item.status)"
                class="me-1"
                size="small"
                >fiber_manual_record
              </v-icon>
              <br v-if="dense" />
              <span :class="{ 'x-small': dense }">
                {{ getStatusString(item.status) }}</span
              >
            </template>
          </v-data-table>
          <div
            v-else
            class="text-muted text-start min-height-10vh d-flex flex-column align-center justify-center op-0-3"
          >
            <v-icon size="x-large">emoji_nature</v-icon>
            {{ $t("global.commons.empty") }}
          </div>
        </div>

        <!-- ---------------------------------------- Metadata ---------------------------------- -->

        <div
          v-if="customer.meta"
          class="widget-box -x-large mb-5 min-height-20vh"
        >
          <s-widget-header icon="pix" title="Metadata"></s-widget-header>

          <v-list-subheader
            >We connect your customer with the corresponding 3rd party services
            customer with these metadata.
          </v-list-subheader>

          <v-list
            class="bg-transparent border-between-vertical"
            density="compact"
          >
            <v-list-item v-for="(val, k) in customer.meta" :key="k">
              <template v-slot:prepend>
                <v-avatar color="#fff" rounded>
                  <img v-if="findMetaImage(k)" :src="findMetaImage(k)" />
                  <v-icon v-else>data_object</v-icon>
                </v-avatar>
              </template>
              <v-list-item-subtitle>{{ k }}</v-list-item-subtitle>
              <v-list-item-title>{{ val }}</v-list-item-title>

              <template v-slot:append>
                <v-list-item-action end>
                  <u-smart-menu
                    v-if="getListOfMetaActions(k, val)"
                    :items="getListOfMetaActions(k, val)"
                    :loading="busy_portal === k"
                  >
                  </u-smart-menu>
                </v-list-item-action>
              </template>
            </v-list-item>
          </v-list>
        </div>
      </v-col>
    </v-row>
  </v-container>

  <!-- ------------------------- Dialog Chips ------------------------------- -->
  <v-bottom-sheet
    v-model="show_set_ships"
    max-width="98vw"
    width="640"
    scrollable
    content-class="rounded-t-xl"
  >
    <v-card class="text-start" rounded="t-xl">
      <v-card-title>
        <v-icon class="me-1">casino</v-icon>
        {{ $t("shop_customers.dialog_chips.title") }}
      </v-card-title>
      <v-card-text v-if="customer" class="text-center">
        <v-avatar class="my-2 avatar-gradient -thin -customer" size="68">
          <v-img
            v-if="customer.user_id"
            :src="getUserAvatar(customer.user_id)"
          />
          <v-icon v-else size="large">person_outline</v-icon>
        </v-avatar>

        <p>
          <b class="d-block">{{ customer.name }}</b>
          {{ customer.email }}
        </p>

        <u-number-input
          v-model="chips"
          :label="$t('global.commons.chips')"
          :max="1000"
          :min="0"
          append-icon="casino"
          class="max-width-field mx-auto mt-5"
          variant="outlined"
          rounded
        >
        </u-number-input>
      </v-card-text>
      <v-card-actions>
        <div class="widget-buttons">
          <v-btn
            size="x-large"
            variant="text"
            @click="show_set_ships = false"
            prepend-icon="close"
            >{{ $t("global.actions.close") }}
          </v-btn>
          <v-btn
            :loading="busy_set_chips"
            color="primary"
            size="x-large"
            variant="elevated"
            @click="setChips(chips)"
          >
            <v-icon start>save</v-icon>
            {{ $t("global.actions.set") }}
          </v-btn>
        </div>
      </v-card-actions>
    </v-card>
  </v-bottom-sheet>
  <!-- ███████████████████████ Dialog > Club ███████████████████████ -->

  <v-bottom-sheet
    v-model="show_set_club"
    max-width="98vw"
    width="640"
    scrollable
    content-class="rounded-t-xl"
  >
    <v-card rounded="t-xl" class="text-start">
      <v-card-title>
        <v-icon class="me-1">diamond</v-icon>
        {{ $t("shop_customers.dialog_club.title") }}
      </v-card-title>
      <v-card-text v-if="customer" class="text-center">
        <v-avatar class="my-2 avatar-gradient -thin -customer" size="68">
          <v-img
            v-if="customer.user_id"
            :src="getUserAvatar(customer.user_id)"
          />
          <v-icon v-else size="large">person_outline</v-icon>
        </v-avatar>

        <p>
          <b class="d-block">{{ customer.name }}</b>
          {{ customer.email }}
        </p>

        <b-club-select v-model="level" class="mt-5 mb-3"></b-club-select>
      </v-card-text>
      <v-card-actions>
        <div class="widget-buttons">
          <v-btn size="x-large" variant="text" @click="show_set_club = false"
            >{{ $t("global.actions.close") }}
          </v-btn>
          <v-btn
            :loading="busy_set_chips"
            color="primary"
            size="x-large"
            variant="elevated"
            @click="setClub(level)"
          >
            <v-icon class="me-1">save</v-icon>
            {{ $t("global.actions.set") }}
          </v-btn>
        </div>
      </v-card-actions>
    </v-card>
  </v-bottom-sheet>

  <!-- ███████████████████████ Dialog > Segments ███████████████████████ -->
  <b-customer-segment-dialog
    v-if="customer"
    v-model="show_segments_dialog"
    :customer="customer"
    :shop="shop"
  >
  </b-customer-segment-dialog>
</template>

<script>
import BOrderButtonBasket from "../../order/button/basket/BOrderButtonBasket.vue";
import BOrderButtonPos from "../../order/button/pos/BOrderButtonPos.vue";
import { UserActivityKeys } from "@selldone/core-js/enums/user/UserActivityKeys";

import BClubSelect from "../../club/select/BClubSelect.vue";
import UNumberInput from "../../../ui/number/input/UNumberInput.vue";
import { MapHelper } from "@selldone/core-js/helper/map/MapHelper";
import BCustomerSegmentDialog from "../../customer/segment/dialog/BCustomerSegmentDialog.vue";
import USmartMenu from "../../../ui/smart/menu/USmartMenu.vue";
import { URLHelper } from "@selldone/core-js/helper/url/URLHelper";
import UCurrencyIcon from "../../../ui/currency/icon/UCurrencyIcon.vue";
import BOrderButton from "@selldone/components-vue/backoffice/order/button/BOrderButton.vue";

export default {
  name: "BCustomerOverview",
  components: {
    BOrderButton,
    UCurrencyIcon,
    USmartMenu,
    BCustomerSegmentDialog,
    UNumberInput,
    BClubSelect,

    BOrderButtonPos,
    BOrderButtonBasket,
  },
  props: {
    shop: {
      type: Object,
      require: true,
    },

    customerId: { require: false },
    customerValue: { require: false },
    dense: {
      type: Boolean,
      default: false,
    },
  },

  data: () => ({
    UserActivityKeys: UserActivityKeys,

    busy: false,
    customer: null,

    //---------------------------
    show_set_ships: null,
    chips: 0,
    busy_set_chips: false,

    //---------------------------
    busy_set_club: false,
    show_set_club: false,
    level: null,

    //---------------------------
    show_segments_dialog: false,

    //---------------------------
    busy_portal: false,
  }),
  computed: {
    headers() {
      return [
        {
          title: this.$t("global.sort.order_id"),
          align: "start",
          value: "id",
        },
        { title: this.$t("global.sort.price"), value: "price" },
        { title: this.$t("global.sort.date"), value: "reserved_at" },
        {
          title: this.$t("global.sort.status"),
          align: "center",
          value: "status",
        },
      ];
    },

    clv() {
      return this.customer.clv;
    },
    activity() {
      return this.customer.activity;
    },

    full_address() {
      return (
        this.customer.address &&
        MapHelper.GenerateFullAddressFromMapInfo(this.customer.address)
      );
    },
  },

  created() {
    if (!this.customerValue) this.fetchCustomerInfo();
    else this.customer = this.customerValue;
  },

  methods: {
    fetchCustomerInfo() {
      this.busy = true;
      axios
        .get(window.API.GET_SHOP_CUSTOMER_INFO(this.shop.id, this.customerId))
        .then(({ data }) => {
          this.customer = data.customer;
        })

        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy = false;
        });
    },

    //--------------------------------------------------
    showSetChips() {
      this.chips = this.customer.chips;
      this.show_set_ships = true;
    },

    setChips(chips) {
      this.busy_set_chips = true;

      axios
        .put(
          window.API.PUT_SHOP_CUSTOMER_CHIPS(this.shop.id, this.customer.id),
          {
            chips: chips,
          },
        )
        .then(({ data }) => {
          if (!data.error) {
            this.customer.chips = data.chips;
            this.show_set_ships = false;
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((e) => {
          this.showLaravelError(e);
        })
        .finally(() => {
          this.busy_set_chips = false;
        });
    },

    //--------------------------------------------------
    showSetClub() {
      this.level = this.customer.level;
      this.show_set_club = true;
    },

    setClub(level) {
      this.busy_set_club = true;

      axios
        .put(
          window.API.PUT_SHOP_CUSTOMER_CLUB(this.shop.id, this.customer.id),
          {
            level: level,
          },
        )
        .then(({ data }) => {
          if (!data.error) {
            this.customer.level = data.level;
            this.show_set_club = false;
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((e) => {
          this.showLaravelError(e);
        })
        .finally(() => {
          this.busy_set_club = false;
        });
    },

    findMetaImage(key) {
      if (key.startsWith("stripe_"))
        return require("../../../assets/trademark/stripe.svg");
      return null;
    },

    showEditSegments() {
      this.show_segments_dialog = true;
    },

    // -------------------------------------------------------------------------------------

    getListOfMetaActions(key, value) {
      if (key.startsWith("stripe_customer_id_")) {
        return [
          {
            title: "Open customer portal",
            icon: "open_in_new",
            click: () => {
              this.createCustomerPortalUrl(key, value);
            },
          },
        ];
      }
      return null;
    },

    createCustomerPortalUrl(key) {
      this.busy_portal = key;

      axios
        .post(
          window.API.POST_SHOP_CUSTOMER_CREATE_SUBSCRIPTION_PORTAL_URL(
            this.shop.id,
            this.customer.id,
            key,
          ),
        )
        .then(({ data }) => {
          if (!data.error) {
            URLHelper.OpenInNewWindow(data.url);
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((e) => {
          this.showLaravelError(e);
        })
        .finally(() => {
          this.busy_portal = null;
        });
    },
  },
};
</script>

<style scoped></style>
