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
  <div>
    <div class="widget-box mb-5">
      <s-widget-header
        :title="$t('service_design.type')"
        icon="home_repair_service"
      ></s-widget-header>
      <v-list-subheader>
        {{ $t("service_design.type_message") }}
      </v-list-subheader>

      <u-smart-select
        v-model="outputs.type"
        :items="Object.values(types)"
        item-description="desc"
        item-text="title"
        item-value="code"
      >
        <template v-slot:append-title="{ item }">
          <v-chip
            v-for="it in item.form"
            :key="it"
            class="ma-1 px-1"
            label
            size="x-small"
            >{{ it }}
          </v-chip>
        </template>
      </u-smart-select>
    </div>

    <!-- ----------------------- Tasks ----------------------- -->

    <div v-if="has_tasks" class="widget-box mb-5">
      <s-widget-header
        :title="$t('global.service.task.title')"
        icon="playlist_add_check"
      ></s-widget-header>
      <v-list-subheader>
        You can set default tasks for this service, which will automatically be
        added to each order. You can then add or modify tasks for each specific
        order upon receipt.
      </v-list-subheader>

      <u-tasks-editor v-model="outputs.tasks" editable />
    </div>

    <!-- ----------------------- Appointment ----------------------- -->
    <div v-if="has_reserve" class="widget-box mb-5">
      <s-widget-header
        :title="$t('global.service.appointment.title')"
        icon="date_range"
      ></s-widget-header>
      <v-list-subheader>
        You can schedule appointments by specifying the day of the week and
        time. This is beneficial for consultation, medical services, or any
        other service that requires bookings at specific times on specific
        weekdays.
      </v-list-subheader>

      <u-time-week-picker
        v-model="outputs.days"
        class="my-2 max-width-field-large mx-auto"
        editable
      ></u-time-week-picker>
      <v-list-subheader>
        ● Choose the time blocks you want to make available for customer
        selection.
      </v-list-subheader>
    </div>

    <!-- ----------------------- Booking ----------------------- -->
    <div v-if="has_booking" class="widget-box mb-5">
      <s-widget-header
        :title="$t('global.service.booking.title')"
        icon="book_online"
      ></s-widget-header>
      <v-list-subheader>
        You can set available dates and times for check-in and checkout for
        services that require booking.
      </v-list-subheader>

      <v-row align="center" class="text-center my-2" no-gutters>
        <div class="flex-grow-1 p-2">
          <div class="text-muted text-uppercase text-subtitle-2 mb-2">
            Check-in
          </div>
          <u-time-picker
            v-model="outputs.checkin"
            drop-direction="auto"
            format="HH:mm"
            input-width="160px"
            min-height="42px"
          >
          </u-time-picker>
        </div>
        <div class="flex-grow-1 p-2">
          <div class="text-muted text-uppercase mb-2 text-subtitle-2">
            Check-out
          </div>
          <u-time-picker
            v-model="outputs.checkout"
            drop-direction="auto"
            format="HH:mm"
            input-width="160px"
            min-height="42px"
          ></u-time-picker>
        </div>
      </v-row>
      <v-date-picker
        :model-value="outputs.disabled.map((d) => new Date(d))"
        @update:model-value="
          (v) =>
            (outputs.disabled = v
              .filter((x) => x?.isAfterToday() || x?.isToday())
              .map((date) => date))
        "
        title="Unavailable Dates"
        view-mode="month"
        width="100%"
        multiple

        :min="new Date().setStart()"

        bg-color="transparent"
      >
      </v-date-picker>
    </div>

    <!-- ----------------------- Subscription duration ----------------------- -->
    <div v-if="has_subscription" class="widget-box mb-5">
      <s-widget-header
        :title="$t('global.service.subscription.title')"
        icon="timelapse"
      ></s-widget-header>
      <v-list-subheader>
        <div>
          For subscription services, you can specify a duration. This helps
          store information in Selldone, especially if you're using API
          connections for your service. However, if you wish to sell a
          subscription with <b>recurring payments</b>, you should opt for
          creating a <b>Subscription Product</b> instead.
        </div>
      </v-list-subheader>

      <u-number-input
        v-model="outputs.days"
        :decimal="0"
        :min="0"
        label="Subscription period"
        placeholder="Ex. 90 days"
        suffix="days"
      >
      </u-number-input>

      <div class="text-center">
        <v-btn-toggle v-model="outputs.days" rounded selected-class="blue-flat">
          <v-btn
            v-for="(sub, key) in subscription_periods"
            :key="key"
            :value="sub.duration"
            size="large"
          >
            <div class="small mt-1">
              <v-icon size="small">{{ sub.icon }}</v-icon>
              <p class="mb-0 mt-1">
                <b>{{ sub.duration }}</b> days
              </p>
            </div>
          </v-btn>
        </v-btn-toggle>
      </div>
    </div>

    <!-- ----------------------- Charge ----------------------- -->
    <div v-if="has_charge" class="widget-box mb-5">
      <s-widget-header
        :title="$t('global.service.charge.title')"
        icon="data_saver_on"
      ></s-widget-header>
      <v-list-subheader>
        You can assign an initial charge for your service. This is handy when
        integrating your service with an API and using Selldone just for
        handling payments and orders. Moreover, this charge can be consumed via
        API. It is stored in our database for reference.
      </v-list-subheader>

      <u-number-input
        v-model="outputs.charge"
        :decimal="0"
        :min="0"
        label="Initial charge"
        placeholder="Ex. 2000 units"
        suffix="units"
      >
      </u-number-input>
    </div>
  </div>
</template>

<script lang="ts">
import UTasksEditor from "../../../../ui/task/editor/UTasksEditor.vue";
import UNumberInput from "../../../../ui/number/input/UNumberInput.vue";
import UTimeWeekPicker from "../../../../ui/time/week-picker/UTimeWeekPicker.vue";
import { ServiceTypes } from "@selldone/core-js/enums/product/ServiceTypes";
import UTimePicker from "../../../../ui/time/picker/UTimePicker.vue";
import USmartSelect from "../../../../ui/smart/select/USmartSelect.vue";
import { WeekDays } from "@selldone/core-js/enums/logistic/WeekDays.ts";

export default {
  name: "BProductServiceManage",
  components: {
    USmartSelect,
    UTimePicker,
    UTimeWeekPicker,
    UNumberInput,
    UTasksEditor,
  },
  props: {
    product: {
      required: true,
      type: Object,
    },
  },
  data: () => ({
    WeekDays: WeekDays,

    types: ServiceTypes,

    //--------------------
    subscription_periods: {
      day: { duration: 1, title: "One day", icon: "fa:fas fa-calendar-day" },
      week: { duration: 7, title: "One week", icon: "fa:fas fa-calendar-week" },
      month: {
        duration: 30,
        title: "One month",
        icon: "fa:fas fa-calendar-check",
      },
      three_month: {
        duration: 90,
        title: "Three months",
        icon: "fa:fas fa-calendar-check",
      },
      six_month: {
        duration: 180,
        title: "Six months",
        icon: "fa:fas fa-calendar-alt",
      },
      year: { duration: 365, title: "One year", icon: "fa:fas fa-calendar" },
    },
    //--------------------
    outputs: null,
  }),

  computed: {
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
  },
  watch: {},
  created() {
    //console.log('1 this.product.outputs',this.product.outputs,this.outputs)

    if (
      !this.product.outputs ||
      Array.isArray(this.product.outputs) ||
      !this.product.outputs.type
    ) {
      this.product.outputs = { type: null };
      //console.log('2 this.product.outputs',this.product.outputs,this.outputs)
    }

    this.outputs = this.product.outputs;
  },
  methods: {
    isDisabled(date) {
      console.log("isDisabled", date);
      return this.outputs.disabled && this.outputs.disabled.includes(date);
    },

    isAllowed(date) {
      console.log("isAllowed", date);
      const disabled =
        this.outputs.disabled && this.outputs.disabled.includes(date);

      return !disabled;
    },
  },
};
</script>

<style scoped></style>
