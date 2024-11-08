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
        class="rounded-18px flex-grow-0"
        height="64"
        width="64"
      >
      </v-img>
      <div class="flex-grow-1 ps-3">
        <div class="mb-1 d-flex align-center">
          <b>{{ product.title }}</b>
          <v-chip
            v-if="type"
            :title="$t(type.desc)"
            class="ms-2"
            label
            size="x-small"
            >{{ $t(type.title) }}
          </v-chip>

          <v-btn
            v-if="!viewOnlyProgress /*Admin Panel Only!*/"
            size="x-small"
            variant="elevated"
            class="ms-2 tnt"
            target="_blank"
            append-icon="open_in_new"
            :to="{
              name: IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢*/
                ? 'Vendor_ProductDashboard'
                : 'BPageProductDashboard',
              params: { product_id: product.id },
            }"
            >Product Admin
          </v-btn>
        </div>
        <div class="text-subtitle-2 m-0">
          {{ product.title_en }}
        </div>

        <v-row align="center" no-gutters>
          <u-price
            v-if="service_item?.price"
            :amount="service_item.price"
            :currency="service_item.currency"
            class="me-2"
            title="Pricing of this item by seller."
          ></u-price>
          <v-chip
            v-else
            class="me-2"
            color="#FFA000"
            variant="elevated"
            size="small"
            prepend-icon="hourglass_top"
            >Not pricing yet!
          </v-chip>

          <div
            v-if="start_at"
            class="ma-1 text-subtitle-2"
            title="Checkin date."
          >
            <v-icon class="mx-1" size="small">login</v-icon>
            {{ getLocalDateString(start_at) }}
          </div>
          <div
            v-if="end_at"
            class="ma-1 text-subtitle-2"
            title="Checkout date."
          >
            <v-icon class="mx-1" size="small">logout</v-icon>
            {{ getLocalDateString(end_at) }}
          </div>

          <v-chip
            v-for="task in tasks"
            size="x-small"
            class="ma-1"
            variant="flat"
            color="#000"
            prepend-icon="add_task"
          >
            {{ task.title?.limitWords(3) }}
            <v-progress-circular
              :model-value="task.progress"
              class="me-n1 ms-2"
              size="16"
              color="#fff"
              bg-color="#aaa"
            ></v-progress-circular>
          </v-chip>
        </v-row>
      </div>

      <v-icon :class="{ 'rotate-180': expand }">expand_more</v-icon>
    </div>

    <v-expand-transition>
      <div v-if="expand">
        <v-list-subheader></v-list-subheader>
        <!-- ----------------------- Tasks ----------------------- -->
        <div
          v-if="has_tasks"
          :class="{ 'border-bottom': editing }"
          class="widget-box -large mb-5"
        >
          <u-widget-header :title="$t('service_bill.task.title')" icon="rule">
          </u-widget-header>

          <v-list-subheader>
            {{ $t("service_bill.task.message") }}
          </v-list-subheader>

          <u-tasks-editor
            v-model="tasks"
            :editable="editing"
            :view-only-progress="viewOnlyProgress"
            @change="updateTasks"
          />
        </div>
        <!-- ----------------------- Date ----------------------- -->
        <div
          v-if="has_reserve"
          :class="{ 'border-bottom': editing }"
          class="widget-box -large mb-5"
        >
          <u-widget-header
            :title="$t('global.service.appointment.title')"
            icon="event_available"
          >
          </u-widget-header>

          <u-date-input
            v-model="reserved_at"
            :jump-minute="15"
            :min="new Date().toISOString()"
            class="max-width-field mx-auto mb-3"
            color="#2196f3"
            label="Appointment"
            return-utc
            rounded
          >
          </u-date-input>

          <u-time-week-picker
            v-model="preferences.days"
            :pointed-time-utc="reserved_at"
            :restrictions="outputs.days"
            class="my-2 max-width-field-large mx-auto"
            dis-color="#ddd"
          ></u-time-week-picker>
        </div>

        <!-- ----------------------- Booking ----------------------- -->
        <div
          v-if="has_booking"
          :class="{ 'border-bottom': editing }"
          class="widget-box -large mb-5"
        >
          <u-widget-header
            :add-caption="
              editing ? $t('service_bill.booking.show_calendar') : undefined
            "
            :title="$t('service_bill.booking.title')"
            add-icon="calendar_today"
            add-text
            icon="date_range"
            @click:add="show_cal = !show_cal"
          >
          </u-widget-header>
          <v-list-subheader>
            {{ $t("service_bill.booking.message") }}
          </v-list-subheader>

          <div
            class="text-subtitle-2 d-flex text-center border-between checks justify-center"
          >
            <!-- Checkin Date -->

            <div class="flex-grow-1">
              <v-icon class="me-1" color="#111" size="small">login</v-icon>
              {{ $t("service_bill.booking.selected_checkin") }}:
              <div
                v-if="preferences.dates && preferences.dates[0]"
                class="mt-1"
              >
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
                        true,
                      )
                    }}

                    <v-btn
                      v-if="editing"
                      :title="
                        'Reset to user selected date: ' +
                        getLocalTimeString(preferences.dates[0])
                      "
                      class="mx-1"
                      icon
                      variant="text"
                      @click="start_at = preferences.dates[0]"
                    >
                      <v-icon size="small">autorenew</v-icon>
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
                <v-icon class="me-1" color="#111" size="small"
                  >help_center
                </v-icon>

                {{ $t("global.commons.not_selected") }}
              </div>
            </div>

            <!-- Checkout Date -->
            <div class="flex-grow-1">
              <v-icon class="me-1" color="#111" size="small">logout</v-icon>

              {{ $t("service_bill.booking.selected_checkout") }}:

              <div v-if="preferences.date && preferences.dates[1]" class="mt-1">
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
                        true,
                      )
                    }}

                    <v-btn
                      v-if="editing"
                      :title="
                        'Reset to user selected date: ' +
                        getLocalTimeString(preferences.dates[1])
                      "
                      class="mx-1"
                      icon
                      variant="text"
                      @click="end_at = preferences.dates[1]"
                    >
                      <v-icon size="small">autorenew</v-icon>
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
                <v-icon class="me-1" color="#111" size="small"
                  >help_center
                </v-icon>
                {{ $t("global.commons.not_selected") }}
              </div>
            </div>
            <!-- Days -->

            <div class="flex-grow-0 p-3">
              <h2 class="text-h4">{{ Math.round(diff_days) }}</h2>
              <small>{{ $t("global.commons.days") }}</small>
            </div>
          </div>

          <template v-if="editing">
            <p>
              {{ $t("service_bill.booking.change_days_question") }}

              <v-btn
                color="primary"
                variant="text"
                @click="change_dates = !change_dates"
              >
                <v-icon class="me-1" size="small"
                  >published_with_changes
                </v-icon>
                {{ $t("global.actions.click_here") }}
              </v-btn>
            </p>

            <v-expand-transition>
              <v-container v-if="change_dates">
                <v-row class="m-0">
                  <v-col cols="12" sm="6">
                    <u-date-input
                      v-model="start_at"
                      :min="new Date().toISOString()"
                      class="max-width-field mx-auto border rounded-lg pa-3 bg-white widget-hover"
                      color="#2196f3"
                      format="YYYY-MM-DD"
                      label="Check-in"
                      return-utc
                      rounded
                      type="date"
                      variant="plain"
                    >
                    </u-date-input>
                  </v-col>
                  <v-col cols="12" sm="6">
                    <u-date-input
                      v-model="end_at"
                      :min="start_at"
                      class="max-width-field mx-auto border rounded-lg pa-3 bg-white widget-hover"
                      color="#2196f3"
                      format="YYYY-MM-DD"
                      label="Check-out"
                      return-utc
                      rounded
                      type="date"
                      variant="plain"
                    >
                    </u-date-input>
                  </v-col>
                </v-row>
              </v-container>
            </v-expand-transition>

            <v-bottom-sheet
              v-model="show_cal"
              content-class="rounded-t-xl"
              max-width="840"
            >
              <v-card class="rounded-t-xl" rounded="0">
                <v-card-title></v-card-title>
                <v-card-text>
                  <v-date-picker
                    :model-value="[new Date(start_at), new Date(end_at)]"
                    multiple="range"
                    :allowed-dates="
                      (d) =>
                        !outputs.disabled?.some((x) => d.isSameDay(new Date(x)))
                    "
                    :new-event="new_event"
                    class="my-3"
                    view-mode="month"
                    width="100%"
                    title="Booking Calendar"
                  ></v-date-picker>
                </v-card-text>
                <v-card-actions>
                  <div class="widget-buttons">
                    <v-btn
                      size="x-large"
                      variant="text"
                      @click="show_cal = false"
                    >
                      <v-icon start>close</v-icon>
                      Close
                    </v-btn>
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
          <u-widget-header
            :title="$t('service_bill.subscription.title')"
            icon="extension"
          >
          </u-widget-header>
          <v-list-subheader>
            {{ $t("service_bill.subscription.message") }}
          </v-list-subheader>

          <u-number-input
            v-model="subscription"
            :decimal="0"
            :label="$t('service_bill.subscription.duration')"
            :min="0"
            :suffix="$t('global.commons.days')"
            class="max-width-field mx-auto"
            filled
            placeholder="Ex. 90 days"
            rounded
          >
          </u-number-input>
        </div>

        <!-- ----------------------- Charge ----------------------- -->
        <div
          v-if="has_charge"
          :class="{ 'border-bottom': editing }"
          class="widget-box -large mb-5"
        >
          <u-widget-header
            :title="$t('service_bill.charge.title')"
            icon="generating_tokens"
          >
          </u-widget-header>
          <v-list-subheader>
            {{ $t("service_bill.charge.message") }}
          </v-list-subheader>

          <u-number-input
            v-model="charge"
            :decimal="0"
            :label="$t('service_bill.subscription.charge')"
            :min="0"
            :suffix="$t('global.commons.units')"
            class="max-width-field mx-auto"
            filled
            placeholder="Ex. 2000 units"
            rounded
          >
          </u-number-input>
        </div>

        <!-- ----------------------- Set Price ----------------------- -->

        <div v-if="editing" class="widget-box -large mb-5">
          <u-widget-header
            :title="$t('service_bill.pricing.title')"
            icon="price_change"
          >
          </u-widget-header>
          <v-list-subheader>
            {{ $t("service_bill.pricing.message") }}
          </v-list-subheader>

          <u-price-input
            v-model="price"
            :currency="currency"
            :disabled="!currency"
            :label="$t('add_product.pricing.price_input')"
            :rules="[GlobalRules.required()]"
            class="max-width-field mx-auto my-2 strong-field"
            placeholder="0.00"
            variant="solo"
            rounded="xl"
            required
          >
            <template v-slot:append-inner>
              <v-icon
                v-if="!price || price <= 0"
                color="red"
                class="blink-me ms-2"
                >warning
              </v-icon>
            </template>
          </u-price-input>

          <s-widget-buttons>
            <v-btn
              :color="service_item ? 'primary' : 'success'"
              :loading="busy_set"
              :size="!service_item ? 'large' : 'x-large'"
              :variant="!!service_item ? 'elevated' : 'outlined'"
              @click="setServiceItem"
            >
              <v-icon class="me-1"
                >{{ service_item ? "save" : "check" }}
              </v-icon>
              {{ $t("service_bill.save_item") }}
            </v-btn>
          </s-widget-buttons>
        </div>
      </div>
    </v-expand-transition>
  </div>
</template>

<script lang="ts">
import UDateInput from "../../../ui/date/input/UDateInput.vue";
import UTasksEditor from "../../../ui/task/editor/UTasksEditor.vue";
import UNumberInput from "../../../ui/number/input/UNumberInput.vue";
import UTimeWeekPicker from "../../../ui/time/week-picker/UTimeWeekPicker.vue";
import { ServiceTypes } from "@selldone/core-js/enums/product/ServiceTypes";
import UPriceInput from "../../../ui/price/input/UPriceInput.vue";
import { Currency } from "@selldone/core-js/enums/payment/Currency";

import { throttle } from "lodash-es";
import SWidgetButtons from "@selldone/components-vue/ui/widget/buttons/SWidgetButtons.vue";

export default {
  name: "ServiceBillingItem",
  components: {
    SWidgetButtons,
    UPriceInput,
    UTimeWeekPicker,
    UNumberInput,
    UTasksEditor,
    UDateInput,
  },
  inject: ["$shop"],
  props: {
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
            this.$shop.id,
            this.basket.id,
            this.item.id,
          ),
          {
            price: this.price,

            tasks: this.tasks,
            reserved_at: this.reserved_at,
            subscription: this.subscription,
            charge: this.charge,
            start_at: this.start_at,
            end_at: this.end_at,
          },
        )
        .then(({ data }) => {
          if (!data.error) {
            this.service_item = data.service_item; // Update local object
            this.item.service_item = data.service_item; // Update main object
            this.basket.price = data.basket_price; // Recalculate basket price each time update service item.
            this.item.price = data.item_price; // Update basket item price.

            this.showSuccessAlert(
              null,
              "Your service order billing has been saved.",
            );
            this.expand = false;
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

    updateTasks: throttle(function () {
      if (this.viewOnlyProgress) return;

      this.busy_save = true;

      axios
        .put(
          this.IS_VENDOR_PANEL
            ? window.VAPI.PUT_MY_VENDOR_SERVICE_ITEM_TASKS(
                /*🟢 Vendor Panel 🟢*/
                this.$route.params.vendor_id,
                this.basket.id, // Vendor order ID
                this.item.id,
              )
            : window.API.PUT_SERVICE_ITEM_TASKS(
                this.$shop.id,
                this.basket.id,
                this.item.id,
              ),
          {
            tasks: this.tasks,
          },
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

<style lang="scss" scoped>
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
