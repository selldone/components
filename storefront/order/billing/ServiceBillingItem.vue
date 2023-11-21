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
  <div class="text-start">
    <div class="d-flex align-items-center pp" @click="expand = !expand">
      <v-img
        :src="getProductImage(product.id, IMAGE_SIZE_SMALL)"
        width="64"
        height="64"
        class="rounded-18px flex-grow-0"
      >
      </v-img>
      <div class="flex-grow-1 ps-3">
        <div class="mb-1">
          <b>{{ product.title }}</b>
          <v-chip
            v-if="type"
            label
            x-small
            class="ma-1"
            :title="$t(type.desc)"
            >{{ $t(type.title) }}</v-chip
          >
        </div>
        <div class="subtitle-2 m-0">
          {{ product.title_en }}
        </div>

        <v-row no-gutters align="center">


          <price-view
            v-if="service_item?.price"
            :amount="service_item.price"
            :currency="service_item.currency"
            class="me-2"
            title="Pricing of this item by seller."
          ></price-view>
          <small v-else class="me-2">Not pricing yet!</small>

          <div v-if="start_at" class="ma-1" title="Checkin date.">
            <v-icon small class="mx-1">login</v-icon>
            {{ getLocalDateString(start_at) }}
          </div>
          <div v-if="end_at" class="ma-1" title="Checkout date.">
            <v-icon small class="mx-1">logout</v-icon>
            {{ getLocalDateString(end_at) }}
          </div>
        </v-row>
      </div>

      <v-icon :class="{ 'rotate-180': expand }">expand_more</v-icon>
    </div>

    <v-expand-transition>
      <div v-if="expand">
        <v-subheader> </v-subheader>
        <!-- ----------------------- Tasks ----------------------- -->
        <div
          v-if="has_tasks"
          :class="{ 'border-bottom': editing }"
          class="widget-box -large mb-5"
        >
          <widget-header :title="$t('service_bill.task.title')" icon="rule">
          </widget-header>

          <v-subheader>
            {{ $t("service_bill.task.message") }}
          </v-subheader>

          <expert-contract-tasks
            v-model="tasks"
            :editable="editing"
            @change="updateTasks"
            :view-only-progress="viewOnlyProgress"
          />
        </div>
        <!-- ----------------------- Date ----------------------- -->
        <div
          v-if="has_reserve"
          :class="{ 'border-bottom': editing }"
          class="widget-box -large mb-5"
        >
          <widget-header
            :title="$t('global.service.appointment.title')"
            icon="event_available"
          >
          </widget-header>

          <date-time-picker-global
            v-model="reserved_at"
            color="#2196f3"
            rounded
            return-utc
            :min="new Date().toISOString()"
            label="Appointment"
            class="max-width-field mx-auto mb-3"
            :jump-minute="15"
          >
          </date-time-picker-global>

          <week-day-time-table
            v-model="preferences.days"
            :restrictions="outputs.days"
            :pointed-time-utc="reserved_at"
            class="my-2 max-width-field-large mx-auto"
            dis-color="#ddd"
          ></week-day-time-table>
        </div>

        <!-- ----------------------- Booking ----------------------- -->
        <div
          v-if="has_booking"
          class="widget-box -large mb-5"
          :class="{ 'border-bottom': editing }"
        >
          <widget-header
            :title="$t('service_bill.booking.title')"
            icon="date_range"
            :add-caption="
              editing ? $t('service_bill.booking.show_calendar') : undefined
            "
            @click:add="show_cal = !show_cal"
            add-text
            add-icon="calendar_today"
          >
          </widget-header>
          <v-subheader>
            {{ $t("service_bill.booking.message") }}
          </v-subheader>

          <div
            class="subtitle-2 d-flex text-center border-between checks justify-content-center"
          >

            <!-- Checkin Date -->

            <div class="flex-grow-1">
              <v-icon color="#111" small class="me-1">login</v-icon>
              {{ $t("service_bill.booking.selected_checkin") }}:
              <div v-if="preferences.dates[0]" class="mt-1">
                <div>
                  <div
                    v-if="
                      getLocalDateString(start_at) !==
                      getLocalDateString(preferences.dates[0])
                    "
                    style="text-decoration-line: line-through"
                    title="User selected this date but you change it!"
                  >
                    {{
                      getLocalTimeString(
                        preferences.dates[0],
                        false,
                        false,
                        true
                      )
                    }}

                    <v-btn
                        v-if="editing"
                      icon
                      @click="start_at = preferences.dates[0]"
                      class="mx-1"
                      :title="
                        'Reset to user selected date: ' +
                        getLocalTimeString(preferences.dates[0])
                      "
                    >
                      <v-icon small>autorenew</v-icon>
                    </v-btn>
                  </div>

                  <div class="font-weight-bold">
                    {{ getLocalTimeString(start_at, false, false, true) }}

                    <span class="ms-5">
                      {{ $t("global.commons.time") }}:
                      <b v-if="outputs.checkin" dir="ltr"
                        >{{ outputs.checkin["HH"] }} :
                        {{ outputs.checkin["mm"] }}</b
                      >
                    </span>
                  </div>
                </div>
              </div>
              <div v-else class="mt-1">
                <v-icon color="#111" small class="me-1">help_center</v-icon>

                {{ $t("global.commons.not_selected") }}
              </div>
            </div>

            <!-- Checkout Date -->
            <div class="flex-grow-1">
              <v-icon color="#111" small class="me-1">logout</v-icon>

              {{ $t("service_bill.booking.selected_checkout") }}:


              <div v-if="preferences.dates[1]" class="mt-1">
                <div>
                  <div
                      v-if="
                      getLocalDateString(end_at) !==
                      getLocalDateString(preferences.dates[1])
                    "
                      style="text-decoration-line: line-through"
                      title="User selected this date but you change it!"
                  >
                    {{
                      getLocalTimeString(
                          preferences.dates[1],
                          false,
                          false,
                          true
                      )
                    }}

                    <v-btn
                        v-if="editing"
                        icon
                        @click="end_at = preferences.dates[1]"
                        class="mx-1"
                        :title="
                        'Reset to user selected date: ' +
                        getLocalTimeString(preferences.dates[1])
                      "
                    >
                      <v-icon small>autorenew</v-icon>
                    </v-btn>
                  </div>

                  <div class="font-weight-bold">
                    {{ getLocalTimeString(end_at, false, false, true) }}

                    <span class="ms-5">
                      {{ $t("global.commons.time") }}:
                      <b v-if="outputs.checkout" dir="ltr"
                      >{{ outputs.checkout["HH"] }} :
                        {{ outputs.checkout["mm"] }}</b
                      >
                    </span>
                  </div>
                </div>
              </div>
              <div v-else class="mt-1">

                <v-icon color="#111" small class="me-1">help_center</v-icon>
                {{ $t("global.commons.not_selected") }}
              </div>


            </div>
            <!-- Days -->

            <div class="flex-grow-0 p-3">
              <h2 class="display-1">{{ Math.round(diff_days) }}</h2>
              <small>{{ $t("global.commons.days") }}</small>
            </div>
          </div>

          <template v-if="editing">
            <p>
              {{ $t("service_bill.booking.change_days_question") }}

              <v-btn color="primary" text @click="change_dates = !change_dates">
                <v-icon small class="me-1">published_with_changes</v-icon>
                {{ $t("global.actions.click_here") }}
              </v-btn>
            </p>

            <v-expand-transition>
              <v-container v-if="change_dates">
                <v-row class="m-0">
                  <v-col cols="12" sm="6">
                    <date-time-picker-global
                      v-model="start_at"
                      color="#2196f3"
                      rounded
                      return-utc
                      :min="new Date().toISOString()"
                      label="Check-in"
                      class="max-width-field mx-auto border rounded-lg pt-5 bg-white widget-hover"
                      format="YYYY-MM-DD"
                      type="date"
                    >
                    </date-time-picker-global>
                  </v-col>
                  <v-col cols="12" sm="6">
                    <date-time-picker-global
                      v-model="end_at"
                      color="#2196f3"
                      rounded
                      return-utc
                      :min="start_at"
                      label="Check-out"
                      class="max-width-field mx-auto border rounded-lg pt-5 bg-white widget-hover"
                      format="YYYY-MM-DD"
                      type="date"
                    >
                    </date-time-picker-global>
                  </v-col>
                </v-row>
              </v-container>
            </v-expand-transition>

            <v-bottom-sheet
              v-model="show_cal"
              max-width="840"
              content-class="rounded-t-xl"
            >
              <v-card class="rounded-t-xl" tile>
                <v-card-title> </v-card-title>
                <v-card-text>
                  <calendar-table
                    :disabled="outputs.disabled"
                    :new-event="new_event"
                    day-level
                    class="my-3"
                  ></calendar-table>
                </v-card-text>
                <v-card-actions>
                  <div class="widget-buttons">
                    <v-btn x-large text @click="show_cal = false"
                      ><v-icon class="me-1">close</v-icon> Close</v-btn
                    >
                  </div>
                </v-card-actions>
              </v-card>
            </v-bottom-sheet>
          </template>
        </div>
        <!-- ----------------------- Subscription duration ----------------------- -->
        <div
          v-if="has_subscription"
          :class="{ 'border-bottom': editing }"
          class="widget-box -large mb-5"
        >
          <widget-header
            :title="$t('service_bill.subscription.title')"
            icon="extension"
          >
          </widget-header>
          <v-subheader>
            {{ $t("service_bill.subscription.message") }}
          </v-subheader>

          <s-number-input
            v-model="subscription"
            :decimal="0"
            :min="0"
            :label="$t('service_bill.subscription.duration')"
            placeholder="Ex. 90 days"
            filled
            rounded
            :suffix="$t('global.commons.days')"
            class="max-width-field mx-auto"
          >
          </s-number-input>
        </div>

        <!-- ----------------------- Charge ----------------------- -->
        <div
          v-if="has_charge"
          :class="{ 'border-bottom': editing }"
          class="widget-box -large mb-5"
        >
          <widget-header
            :title="$t('service_bill.charge.title')"
            icon="generating_tokens"
          >
          </widget-header>
          <v-subheader>
            {{ $t("service_bill.charge.message") }}
          </v-subheader>

          <s-number-input
            v-model="charge"
            :decimal="0"
            :min="0"
            :label="$t('service_bill.subscription.charge')"
            placeholder="Ex. 2000 units"
            filled
            rounded
            :suffix="$t('global.commons.units')"
            class="max-width-field mx-auto"
          >
          </s-number-input>
        </div>

        <!-- ----------------------- Set Price ----------------------- -->

        <div v-if="editing" class="widget-box -large mb-5">
          <widget-header
            :title="$t('service_bill.pricing.title')"
            icon="price_change"
          >
          </widget-header>
          <v-subheader>
            {{ $t("service_bill.pricing.message") }}
          </v-subheader>

          <s-price-input
            v-model="price"
            class="max-width-field mx-auto my-2 strong-field"
            :label="$t('add_product.pricing.price_input')"
            placeholder="0.00"
            required
            :decimal="currency.floats"
            :disabled="!currency"
            :rules="[GlobalRules.required()]"
            :suffix="$t(currency.name)"
          >
          </s-price-input>

          <div class="widget-buttons">
            <v-btn
              :color="service_item ? 'primary' : 'success'"
              dark
              x-large
              :loading="busy_set"
              @click="setServiceItem"
              :large="!service_item"
              :depressed="!!service_item"
            >
              <v-icon class="me-1">{{
                service_item ? "save" : "check"
              }}</v-icon>
              {{ $t("service_bill.save_item") }}
            </v-btn>
          </div>
        </div>
      </div>
    </v-expand-transition>
  </div>
</template>

<script>
import DateTimePickerGlobal from "@components/ui/calendar/dateTimePickerGlobal.vue";
import ExpertContractTasks from "@components/ui/tasks/ExpertContractTasks.vue";
import SNumberInput from "@components/ui/input/number/SNumberInput.vue";
import CalendarTable from "@components/ui/calendar/CalendarTable.vue";
import WeekDayTimeTable from "@components/ui/calendar/WeekDayTimeTable.vue";
import { ServiceTypes } from "@core/enums/product/ServiceTypes";
import SPriceInput from "@components/ui/input/price/SPriceInput.vue";
import { Currency } from "@core/enums/payment/Currency";
import WidgetHeader from "@components/widget/WidgetHeader.vue";
import _ from "lodash-es";

export default {
  name: "ServiceBillingItem",
  components: {
    WidgetHeader,
    SPriceInput,
    WeekDayTimeTable,
    CalendarTable,
    SNumberInput,
    ExpertContractTasks,
    DateTimePickerGlobal,
  },
  props: {
    shop: {
      require: true,
      type: Object,
    },
    basket: {
      require: true,
      type: Object,
    },
    item: {
      require: true,
      type: Object,
    },
    product: {
      require: true,
      type: Object,
    },
    editing: {
      default: false,
      type: Boolean,
    },
    initialExpand: {
      default: false,
      type: Boolean,
    },
    viewOnlyProgress: {
      default: false,
      type: Boolean,
    },
  },

  data: function () {
    return {
      expand: false,

      // Set by buyer (inputs of basket item)

      // Set by seller:
      tasks: {},
      reserved_at: null,
      subscription: null,
      charge: null,
      start_at: null,
      end_at: null,

      price: 0,

      //--------------------
      show_cal: false,
      change_dates: false,

      //--------------------
      busy_set: false,

      //-------------------
      service_item: null,

      busy_save: false,
    };
  },

  watch: {
    initialExpand(val) {
      this.expand = val;
    },
  },

  computed: {
    IS_VENDOR_PANEL() {
      /*🟢 Vendor Panel 🟢*/
      return (
        this.$route.params.vendor_id &&
        this.$route.matched.some((record) => record.meta.vendor)
      );
    },

    currency() {
      return Currency[this.basket.currency];
    },

    outputs() {
      return this.product.outputs;
    },
    new_event() {
      return {
        name: "Booking",
        start_at: this.start_at,
        end_at: this.end_at,
      };
    },

    preferences() {
      return this.item.preferences;
    },
    /*  service_item() {
      return this.item.service_item;
    },*/

    type() {
      return (
        this.outputs && this.outputs.type && ServiceTypes[this.outputs.type]
      );
    },

    has_tasks() {
      return this.type && this.type.form.includes("tasks");
    },
    has_reserve() {
      return this.type && this.type.form.includes("reserve");
    },
    has_booking() {
      return this.type && this.type.form.includes("booking");
    },
    has_subscription() {
      return this.type && this.type.form.includes("subscription");
    },
    has_charge() {
      return this.type && this.type.form.includes("charge");
    },

    diff_days() {
      if (this.start_at && this.end_at) {
        const diff_days =
          (new Date(this.end_at).getTime() -
            new Date(this.start_at).getTime()) /
          (1000 * 3600 * 24);
        return Math.abs(diff_days);
      }
      return 0;
    },
  },
  created() {
    this.expand = this.initialExpand;

    this.service_item = this.item.service_item;
    if (this.service_item) {
      // Previously added service item:

      this.tasks = Object.assign([], this.service_item.tasks);
      this.subscription = this.service_item.subscription;
      this.charge = this.service_item.charge;

      this.reserved_at = this.service_item.reserved_at;
      this.start_at = this.service_item.start_at;
      this.end_at = this.service_item.end_at;

      this.price = this.service_item.price;
    } else {
      // Load initial state:

      this.tasks = Object.assign([], this.outputs.tasks);
      this.subscription = this.outputs.subscription;
      this.charge = this.outputs.charge;
    }

    if (this.preferences.dates?.length >= 2) {
      this.start_at = this.start_at ? this.start_at : this.preferences.dates[0];
      this.end_at = this.end_at ? this.end_at : this.preferences.dates[1];
    }
  },
  methods: {
    //----------------------------------------------------------------------------
    setServiceItem() {
      this.busy_set = true;

      axios
        .put(
          window.API.PUT_SERVICE_ITEM(
            this.shop.id,
            this.basket.id,
            this.item.id
          ),
          {
            price: this.price,

            tasks: this.tasks,
            reserved_at: this.reserved_at,
            subscription: this.subscription,
            charge: this.charge,
            start_at: this.start_at,
            end_at: this.end_at,
          }
        )
        .then(({ data }) => {
          if (!data.error) {
            this.service_item = data.service_item; // Update local object
            this.item.service_item = data.service_item; // Update main object
            this.basket.price = data.basket_price; // Recalculate basket price each time update service item.
            this.item.price = data.item_price; // Update basket item price.

            this.showSuccessAlert(
              null,
              "Your service order billing has been saved."
            );
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_set = false;
        });
    },

    //----------------------------------------------------------------------------

    updateTasks: _.throttle(function () {
      if (this.viewOnlyProgress) return;

      this.busy_save = true;

      axios
        .put(
          this.IS_VENDOR_PANEL
            ? window.VAPI.PUT_MY_VENDOR_SERVICE_ITEM_TASKS(
                /*🟢 Vendor Panel 🟢*/
                this.$route.params.vendor_id,
                this.basket.id, // Vendor order ID
                this.item.id
              )
            : window.API.PUT_SERVICE_ITEM_TASKS(
                this.shop.id,
                this.basket.id,
                this.item.id
              ),
          {
            tasks: this.tasks,
          }
        )
        .then(({ data }) => {
          if (!data.error) {
            this.service_item = data.service_item; // Update local object
            this.item.service_item = data.service_item; // Update main object

            this.showSuccessAlert();
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_save = false;
        });
    }, 5000),
  },
};
</script>

<style scoped lang="scss">
@media only screen and (max-width: 600px) {
  .checks {
    font-size: 10px !important;
    p,
    button {
      font-size: 9px !important;
      span,
      i {
        font-size: 9px !important;
      }
    }
  }
}
</style>
