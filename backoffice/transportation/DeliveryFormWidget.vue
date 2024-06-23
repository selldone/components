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
  <div
    class="text-start p-2 font-weight-regular content-container"
    v-bind="$attrs"
  >
    <!-- ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄  General ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄ -->

    <div class="widget-box mb-5">
      <s-widget-header
        :title="$t('global.commons.general_config')"
        icon="tune"
      ></s-widget-header>

      <v-list-subheader
        >Configuration of the overall shipping settings for the store.
      </v-list-subheader>

      <u-smart-switch
        v-model="transportation.enable"
        :false-title="$t('global.commons.disable')"
        :true-title="$t('global.commons.enable')"
        class="mb-5 mt-3"
        false-description="The shipping method is unavailable."
        false-gray
        false-icon="close"
        true-description="Customers can select this shipping method."
        true-icon="check"
      ></u-smart-switch>

      <u-currency-input
        v-model="transportation.currency"
        :label="$t('admin_shop.logistic.delivery.delivery_form.currency_input')"
        :messages="
          $t(
            'admin_shop.logistic.delivery.delivery_form.currency_input_message',
          )
        "
        :return-object="false"
        variant="underlined"
      ></u-currency-input>
    </div>

    <!-- ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄  Customize ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄ -->
    <div class="widget-box mb-5">
      <s-widget-header
        :title="$t('global.commons.customize')"
        icon="design_services"
      >
      </s-widget-header>
      <v-list-subheader
        >Personalize the name and logo of your transportation service.
      </v-list-subheader>

      <v-text-field
        v-model="transportation.title"
        :label="$t('global.commons.title')"
        variant="underlined"
      ></v-text-field>

      <s-image-uploader
        v-if="transportation.id"
        :image="getShopImagePath(transportation.logo)"
        :server="
          window.API.POST_UPLOAD_TRANSPORTATION_LOGO(shop.id, transportation.id)
        "
        auto-compact
        label="Custom logo"
        maxFileSize="256kb"
        @new-path="(path) => (transportation.logo = path)"
      />
    </div>

    <!-- ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄  Limits ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄ -->

    <div class="widget-box mb-5">
      <s-widget-header
        :title="$t('admin_shop.logistic.delivery.delivery_form.limits')"
        icon="archive"
      ></s-widget-header>

      <v-list-subheader>
        Once these limits are set, we will use them to determine whether a
        particular shipping destination is available for a given product.
      </v-list-subheader>

      <u-number-input
        v-model="transportation.distance"
        :label="$t('admin_shop.logistic.delivery.delivery_form.distance_input')"
        :max="100000"
        :messages="`${$t(
          'admin_shop.logistic.delivery.delivery_form.distance_input_message',
        )}`"
        :min="-1"
        :suffix="getDistanceDimension(shop)"
        prepend-inner-icon="fa:fas fa-drafting-compass"
        variant="underlined"
      />

      <u-number-input
        v-model="transportation.max_weight"
        :label="
          $t('admin_shop.logistic.delivery.delivery_form.max_weight_input')
        "
        :max="100000"
        :messages="`${$t(
          'admin_shop.logistic.delivery.delivery_form.max_weight_input_message',
        )}`"
        :min="-1"
        :suffix="getWeightDimension(shop)"
        prepend-inner-icon="fa:fas fa-weight-hanging"
        variant="underlined"
      />
    </div>
    <!-- ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄ Package Limits ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄ -->

    <div class="widget-box mb-5">
      <s-widget-header
        :title="$t('admin_shop.logistic.delivery.delivery_form.max_size_input')"
        icon="fa:fas fa-ruler-combined"
      ></s-widget-header>

      <v-list-subheader>
        Enter the appropriate dimensions for the maximum packaging size, taking
        into account the size and weight of the products that you sell and the
        capabilities of your shipping carriers.
      </v-list-subheader>

      <u-number-input
        v-model="transportation.max_w"
        :label="$t('admin_shop.logistic.delivery.delivery_form.width')"
        :max="100000"
        :min="-1"
        :suffix="getBoxSizeDimension(shop)"
        variant="underlined"
      />

      <u-number-input
        v-model="transportation.max_l"
        :label="$t('admin_shop.logistic.delivery.delivery_form.length')"
        :max="100000"
        :min="-1"
        :suffix="getBoxSizeDimension(shop)"
        variant="underlined"
      />

      <u-number-input
        v-model="transportation.max_h"
        :label="$t('admin_shop.logistic.delivery.delivery_form.height')"
        :max="100000"
        :min="-1"
        :suffix="getBoxSizeDimension(shop)"
        variant="underlined"
      />

      <u-cube
        :size="200"
        :x="transportation.max_w"
        :y="transportation.max_l"
        :z="transportation.max_h"
      />
    </div>

    <!-- ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄ Week days / time ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄ -->

    <div class="widget-box mb-5">
      <s-widget-header
        :title="$t('admin_shop.logistic.delivery.delivery_form.days_input')"
        icon="date_range"
      ></s-widget-header>

      <v-list-subheader></v-list-subheader>

      <!--  ETA: the estimated time of arrival -->
      <u-smart-select
        v-model="eta"
        :items="Object.values(ETA)"
        class="my-3"
        hint="Ask for estimated time of arrival - preferred weekday, timeframe or date."
        item-description="description"
        item-text="title"
        item-value="code"
        label="ETA Mode"
        variant="underlined"
        @change="transportation.eta = eta"
      ></u-smart-select>

      <v-select
        v-if="[ETA.weekday_timeframe.code, ETA.weekday.code].includes(eta)"
        v-model="transportation.days"
        :item-title="
          (item) => {
            return $t(item.name);
          }
        "
        :items="dayItems"
        :label="$t('global.commons.days')"
        :messages="$t('admin_shop.logistic.delivery.delivery_form.days_input')"
        :no-data-text="
          $t('admin_shop.logistic.delivery.delivery_form.days_input_nodata')
        "
        chips
        item-value="value"
        multiple
        prepend-inner-icon="fa:fas fa-calendar-week"
        variant="underlined"
      >
        <template v-slot:chip="{ item, props }">
          <v-chip class="text-body-2 font-weight-bold" v-bind="props">
            {{ $t(item.raw.name) }}
          </v-chip>
        </template>
      </v-select>

      <v-select
        v-if="[ETA.weekday_timeframe.code, ETA.timeframe.code].includes(eta)"
        v-model="transportation.time_spans"
        :item-title="
          (item) => {
            return $t(item.name);
          }
        "
        :items="timeItems"
        :label="$t('global.commons.timespan')"
        :messages="$t('admin_shop.logistic.delivery.delivery_form.hours_input')"
        :no-data-text="
          $t('admin_shop.logistic.delivery.delivery_form.hours_input_nodata')
        "
        chips
        item-value="value"
        multiple
        prepend-inner-icon="fa:fas fa-clock"
        variant="underlined"
      >
        <template v-slot:chip="{ item, props }">
          <v-chip v-bind="props">
            <v-avatar class="m-0">
              <v-img :src="item.raw.icon" />
            </v-avatar>
            <span class="mx-1 text-body-2 font-weight-bold">{{
              $t(item.raw.name)
            }}</span>
          </v-chip>
        </template>
      </v-select>

      <template v-if="[ETA.date.code, ETA.date_time.code].includes(eta)">
        <u-number-input
          v-model="transportation.etd"
          label="ETD"
          messages="The estimated time of departure."
          prepend-inner-icon="pending_actions"
          suffix="hours"
          variant="underlined"
        >
        </u-number-input>

        <div class="d-flex align-center small text-center">
          <span class="mx-2 text-muted">ETA date</span>

          <v-spacer></v-spacer>
          <b class="mx-2">{{ $t("global.commons.today") }} + </b>
          <div style="width: 90px">
            <div style="background: #000; height: 8px"></div>
            ETD ({{ transportation.etd }} h)
          </div>
          <div style="width: 130px">
            <div style="background: #c20e0e; height: 4px"></div>
            Max lead-time (🛍️)
          </div>
        </div>

        <v-list-subheader>
          <div>
            <b>Example:</b> Suppose a customer has two items in her cart with
            lead times of 48 hours and 12 hours. If you input an estimated time
            of delivery (ETD) of <b>{{ transportation.etd }} hours</b>, the
            customer can choose a delivery date starting from
            <b>{{ transportation.etd + 48 }} hours </b> (48+{{
              transportation.etd
            }}) after today.
          </div>
        </v-list-subheader>
      </template>

      <hr class="my-5" />

      <u-smart-toggle
        v-model="transportation.holidays"
        :false-title="$t('global.actions.no')"
        :label="$t('admin_shop.logistic.delivery.delivery_form.vacation_input')"
        :true-title="$t('global.actions.yes')"
        class="my-3"
        false-description="I only deliver orders on business days."
        true-description="I fulfill and deliver orders throughout the entire week."
      ></u-smart-toggle>
    </div>

    <!-- ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄ Payment options ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄ -->

    <div class="widget-box mb-5">
      <s-widget-header
        :title="$t('admin_shop.logistic.delivery.delivery_form.payment')"
        icon="monetization_on"
      ></s-widget-header>

      <v-list-subheader></v-list-subheader>

      <u-smart-switch
        v-model="transportation.cod"
        :false-title="
          $t('admin_shop.logistic.delivery.delivery_form.cod_false')
        "
        :force-show-all="false"
        :label="$t('admin_shop.logistic.delivery.delivery_form.cod_input')"
        :true-title="$t('admin_shop.logistic.delivery.delivery_form.cod_true')"
        class="max-widget-width mb-3"
        false-description="Customers are restricted to choosing only the online payment method, as the Cash on Delivery (COD) option will not be visible to them."
        false-icon="payment"
        true-description="If the selected shipping method allows for Cash on Delivery (COD) payments, and a COD payment gateway is active for the chosen currency, then the customer can opt for COD payment."
        true-icon="local_atm"
      ></u-smart-switch>
      <v-expand-transition>
        <div v-if="transportation.cod">
          <v-list-subheader
            >{{
              $t("admin_shop.logistic.delivery.delivery_form.cod_true_message")
            }}
          </v-list-subheader>
        </div>
      </v-expand-transition>

      <hr class="my-5" />

      <u-smart-switch
        v-model="transportation.sod"
        :false-title="
          $t('admin_shop.logistic.delivery.delivery_form.sod_false')
        "
        :force-show-all="false"
        :label="
          $t(
            'admin_shop.logistic.delivery.delivery_form.shipping_cost_calculation',
          )
        "
        :true-title="$t('admin_shop.logistic.delivery.delivery_form.sod_true')"
        class="max-widget-width mb-3"
        false-description="The shipping cost is determined during the checkout process."
        false-icon="calculate"
        true-description="Shipping costs are not included in our pricing and will be paid by the customer upon receipt of their order from the courier at the destination."
        true-icon="hail"
      ></u-smart-switch>

      <v-list-subheader v-if="transportation.sod"
        >{{ $t("admin_shop.logistic.delivery.delivery_form.sod_true_message") }}
      </v-list-subheader>
    </div>
    <!-- ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄ Shipping calculation ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄ -->
    <v-expand-transition>
      <div v-if="!transportation.sod" class="widget-box mb-5 pb-5">
        <s-widget-header
          :title="$t('admin_shop.logistic.delivery.delivery_form.pricing')"
          add-caption="Add Country Profile"
          icon="calculate"
          @click:add="showAddNewProfile"
        ></s-widget-header>

        <v-list-subheader
          >Here, you can establish personalized pricing for parcel delivery. If
          costs vary by country, you can set up a new profile for each nation.
        </v-list-subheader>

        <s-country-select
          v-model="selected_country"
          :filter="profile_countries"
          :return-object="false"
          class="rounded-16px mx-0"
          clearable
          flat
          item-value="alpha2"
          messages="Shipping country profile."
          placeholder="Worldwide ● Default"
          solo
          variant="underlined"
        >
          <template v-slot:prepend-inner>
            <v-icon v-if="!selected_country">language</v-icon>
          </template>
        </s-country-select>

        <shipping-cost-form
          v-if="selected_profile"
          v-model="selected_profile"
          :country="selected_country"
          :currency="transportation.currency"
          :shop="shop"
          auto-select-mode
          @selectState="(val) => (selected_state = val)"
        ></shipping-cost-form>
        <shipping-cost-form
          v-else
          v-model="transportation"
          :currency="transportation.currency"
          :shop="shop"
          auto-select-mode
        ></shipping-cost-form>
      </div>
    </v-expand-transition>

    <!-- ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄ Calculator ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄ -->

    <v-expand-transition>
      <div v-if="!transportation.sod">
        <b-transportation-calculator
          :country="selected_country"
          :shop="shop"
          :state="selected_state"
          :transportation="transportation"
        ></b-transportation-calculator>
      </div>
    </v-expand-transition>

    <!-- ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄ Free shipping ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄ -->

    <v-expand-transition>
      <div v-if="!transportation.sod">
        <div class="widget-box mb-5">
          <s-widget-header
            :title="$t('global.commons.free_shipping')"
            icon="cruelty_free"
          ></s-widget-header>

          <v-list-subheader>
            This can be a useful way to encourage customers to purchase more
            items or to spend more money on your shop, as the offer of free
            shipping can be a strong incentive for many shoppers.
          </v-list-subheader>

          <u-smart-toggle
            v-model="transportation.free_shipping"
            :false-title="$t('global.actions.no')"
            :true-title="
              $t(
                'admin_shop.logistic.delivery.delivery_form.free_shipping_input',
              )
            "
            class="mb-5"
            false-gray
          ></u-smart-toggle>

          <v-expand-transition>
            <div v-if="transportation.free_shipping">
              <u-price-input
                v-model="transportation.free_shipping_limit"
                :currency="transportation.currency"
                :decimal="6"
                :label="
                  $t(
                    'admin_shop.logistic.delivery.delivery_form.free_shipping_limit_input',
                  )
                "
                prepend-inner-icon="shopping_bag"
              />
            </div>
          </v-expand-transition>
        </div>
      </div>
    </v-expand-transition>


    <!-- ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄ Free shipping ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄ -->

      <div v-if="IS_MARKETPLACE">
        <div class="widget-box mb-5" style="border-top: solid #6548cc medium">
          <s-widget-header
              title="Marketplace & Vendors"
              icon="storefront"
          ></s-widget-header>

          <v-list-subheader>
            Here you can  enable this shipping method for your vendors.
          </v-list-subheader>

          <u-smart-switch
              v-model="transportation.marketplace"
              false-title="Not Available"
              true-title="Available For Vendors"
              true-description="Vendors can add their shipping services and couriers in their panel."
              class="my-3"
              false-gray
          ></u-smart-switch>
        </div>
      </div>



    <!-- ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄ Actions ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄ -->

    <s-widget-buttons auto-fixed-position>
      <v-btn
        :loading="busy"
        color="primary"
        size="x-large"
        variant="elevated"
        @click="updateDelivery"
      >
        <v-icon start>save</v-icon>

        {{ $t("global.actions.save") }}
      </v-btn>
    </s-widget-buttons>

    <div class="widget-box mb-5 mt-16">
      <h2>
        <v-icon class="me-1">warning</v-icon>
        {{ $t("global.commons.critical_zone") }}
      </h2>
      <v-list-subheader
        >Be cautious while making changes, as your actions can impact the
        functionality of your shop.
      </v-list-subheader>

      <u-smart-verify
        v-model="check_delete"
        color="red"
        true-description="I want to delete this shipping method."
        true-title="Verify removing"
      >
      </u-smart-verify>

      <s-widget-buttons>
        <v-btn
          :class="{ disabled: !check_delete }"
          :loading="busy_delete"
          color="red"
          lang
          size="x-large"
          variant="text"
          @click="deleteTransportation()"
        >
          <v-icon class="me-1">delete</v-icon>

          {{ $t("global.actions.delete") }}
        </v-btn>
      </s-widget-buttons>
    </div>
  </div>

  <!-- ██████████████████████ Dialog ██████████████████████ -->

  <v-dialog
    v-model="dialog_new_profile"
    fullscreen
    scrollable
    transition="dialog-bottom-transition"
  >
    <v-card class="text-start">
      <v-card-title class="d-flex align-center">
        <v-icon class="me-1" color="#111">share_location</v-icon>
        Add new shipping profile
      </v-card-title>
      <v-card-text>
        <div class="widget-box mb-5">
          <s-widget-header
            :title="$t('admin_shop.logistic.delivery.delivery_form.pricing')"
            icon="calculate"
          ></s-widget-header>
          <v-list-subheader
            >The pricing model can be established based on the destination
            country of the order.
          </v-list-subheader>

          <s-country-select
            v-model="new_profile_country"
            :return-object="false"
            item-value="alpha2"
            placeholder="Select a country.."
          >
          </s-country-select>

          <shipping-cost-form
            v-model="new_profile"
            :currency="transportation.currency"
            :shop="shop"
          ></shipping-cost-form>
        </div>
      </v-card-text>

      <v-card-actions>
        <div class="widget-buttons">
          <v-btn
            size="x-large"
            variant="text"
            @click="dialog_new_profile = false"
          >
            <v-icon start>close</v-icon>
            {{ $t("global.actions.close") }}
          </v-btn>

          <v-btn
            color="primary"
            size="x-large"
            variant="elevated"
            @click="addProfile()"
          >
            <v-icon start>save</v-icon>
            {{ $t("global.actions.save") }}
          </v-btn>
        </div>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import UNumberInput from "../../ui/number/input/UNumberInput.vue";
import { WeekDays } from "@selldone/core-js/enums/logistic/WeekDays";
import { TimeSpans } from "@selldone/core-js/enums/logistic/TimeSpans";
import UPriceInput from "../../ui/price/input/UPriceInput.vue";
import UCurrencyInput from "../../ui/currency/input/UCurrencyInput.vue";
import UCube from "../../ui/cube/UCube.vue";
import USmartSwitch from "../../ui/smart/switch/USmartSwitch.vue";
import USmartToggle from "../../ui/smart/toggle/USmartToggle.vue";
import SImageUploader from "../../ui/uploader/SImageUploader.vue";
import USmartVerify from "../../ui/smart/verify/USmartVerify.vue";
import USmartSelect from "../../ui/smart/select/USmartSelect.vue";
import { ETA } from "@selldone/core-js/enums/logistic/ETA";
import SCountrySelect from "../../ui/country/select/SCountrySelect.vue";
import ShippingCostForm from "../transportation/ShippingCostForm.vue";
import BTransportationCalculator from "../transportation/calculator/BTransportationCalculator.vue";
import { LogesticHelper } from "@selldone/core-js/helper/logistic/LogesticHelper";
import SWidgetButtons from "../../ui/widget/buttons/SWidgetButtons.vue";
import { ShopOptionsHelper } from "@selldone/core-js/helper/shop/ShopOptionsHelper";
import {BusinessModel} from "@selldone/core-js/enums/shop/BusinessModel";

export default {
  name: "DeliveryFormWidget",
  components: {
    SWidgetButtons,
    BTransportationCalculator,
    ShippingCostForm,
    SCountrySelect,
    USmartSelect,
    USmartVerify,
    SImageUploader,
    USmartToggle,
    USmartSwitch,
    UCube,
    UCurrencyInput,
    UPriceInput,
    UNumberInput,
  },
  emits: ["update:modelValue", "delete"],
  props: {
    shop: {
      required: true,
      type: Object,
    },

    modelValue: {},
  },

  data: () => ({
    ETA: ETA,

    test: null,
    busy: false,

    dayItems: [
      WeekDays.Saturday,
      WeekDays.Sunday,
      WeekDays.Monday,
      WeekDays.Tuesday,
      WeekDays.Wednesday,
      WeekDays.Thursday,
      WeekDays.Friday,
    ],

    timeItems: [
      TimeSpans.Morning,
      TimeSpans.Evening,
      TimeSpans.Night,
      TimeSpans.Instant,
    ],

    transportation: null,

    //-----------------------
    cal_dis: 0,
    cal_w: 0,
    cal_p: 0,
    val_dw: 0,

    //-----------------------
    check_delete: false,
    busy_delete: false,

    //-----------------------

    eta: null,

    selected_country: null,
    selected_state: null,

    //-----------------------
    new_profile_country: null,
    new_profile: null,
    dialog_new_profile: false,
  }),
  computed: {

    IS_MARKETPLACE() {
      return this.shop.model === BusinessModel.MARKETPLACE.code;
    },


    size_unit() {
      return ShopOptionsHelper.GetSizeUnit(this.shop);
    },

    mass_unit() {
      return ShopOptionsHelper.GetMassUnit(this.shop);
    },

    price_min() {
      return LogesticHelper.calculateShipping(
        this.shop,
        this.GetUserSelectedCurrency().code,
        1,
        1,
        0,
        this.transportation,
      );
    },

    profiles() {
      return this.transportation?.profiles ? this.transportation.profiles : {};
    },
    profile_countries() {
      return Object.keys(this.profiles);
    },
    selected_profile() {
      return (
        this.selected_country &&
        this.profiles &&
        this.profiles[this.selected_country]
      );
    },
  },

  watch: {},
  created() {
    this.transportation = this.modelValue;

    this.eta = this.transportation.eta;
  },

  methods: {
    updateDelivery() {
      this.busy = true;

      axios
        .post(
          window.API.POST_SET_TRANSPORTATION(this.shop.id),
          this.transportation,
        )

        .then(({ data }) => {
          if (!data.error) {
            this.showSuccessAlert(
              null,
              this.$t(
                "admin_shop.logistic.delivery.delivery_form.notifications.update_success",
              ),
            );
            this.transportation = data.transportation;
            this.$emit("update:modelValue", data.transportation);
          } else {
            this.showErrorAlert(null, data.message);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy = false;
        });
    },

    deleteTransportation() {
      this.openDangerAlert(
        "Remove transportation",
        "Are you sure to remove this transportation? This action would not clear the history of transportation.",
        "Yes, Delete Now",
        () => {
          this.busy_delete = true;

          axios
            .delete(
              window.API.DELETE_TRANSPORTATION(
                this.shop.id,
                this.transportation.id,
              ),
            )

            .then(({ data }) => {
              if (!data.error) {
                this.showSuccessAlert(
                  null,
                  "Transportation removed successfully.",
                );
                this.$emit("delete", data.id);
                this.$router.push({
                  name: "BPageShopLogisticShipping",
                });
              } else {
                this.showErrorAlert(null, data.message);
              }
            })
            .catch((error) => {
              this.showLaravelError(error);
            })
            .finally(() => {
              this.busy_delete = false;
            });
        },
      );
    },

    showAddNewProfile() {
      this.new_profile_country = null;
      this.new_profile = {};
      this.dialog_new_profile = true;
    },
    addProfile() {
      if (!this.new_profile_country) {
        return this.showErrorAlert(
          "Select a country!",
          "Please select a country to create a profile.",
        );
      }

      if (
        !this.transportation.profiles ||
        Array.isArray(this.transportation.profiles)
      )
        this.transportation.profiles = {};

      this.transportation.profiles = Object.assign(
        {},
        this.transportation.profiles,
      );
      this.transportation.profiles[this.new_profile_country] = this.new_profile;

      this.dialog_new_profile = false;
      this.selected_country = this.new_profile_country; // Select new profile!
    },
  },
};
</script>

<style lang="scss" scoped>
.content-container {
}

.disabled {
  opacity: 0.5;
  user-select: none;
  pointer-events: none;
}

.cal-card {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-radius: 12px;

  .cal-in {
    max-width: 140px;
    border: solid #aaa thin;
    margin: 0 6px;
  }

  i:not(.large) {
    margin: 0 6px;
    font-size: 100%;
  }
}
</style>
