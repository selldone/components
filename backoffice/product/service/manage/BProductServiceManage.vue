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
  <div :class="{ 'b-service-config text-start': modern }">
    <template v-if="modern && outputs">
      <p v-if="product.parent_id" class="sd-modern-notice b-service-config__inherited"><v-icon class="sd-modern-notice__icon" size="17">lock</v-icon><span class="sd-modern-notice__content">{{ tr('inherited') }}</span></p>
      <fieldset class="b-service-config__fields" :disabled="readOnly" :inert="readOnly || undefined">
        <section class="sd-modern-widget b-service-config__model">
          <div class="b-service-config__model-heading">
            <v-icon size="24" aria-hidden="true">{{ modelIcons[outputs.type] || 'tune' }}</v-icon>
            <div><small>{{ tr('model') }}</small><h3>{{ type ? tr('models.' + outputs.type + '.title') : tr('choose_model') }}</h3><p>{{ type ? tr('models.' + outputs.type + '.description') : tr('model_help') }}</p></div>
            <v-btn class="sd-modern-button sd-modern-button--inline" color="primary" variant="text" :disabled="readOnly" :aria-expanded="modelPickerOpen" @click="modelPickerOpen = !modelPickerOpen">{{ tr(modelPickerOpen ? 'close_models' : 'change_model') }}<v-icon end size="16">{{ modelPickerOpen ? 'expand_less' : 'expand_more' }}</v-icon></v-btn>
          </div>
          <div v-if="modelPickerOpen || !type" class="b-service-config__models" role="radiogroup" :aria-label="tr('model')">
            <label v-for="item in types" :key="item.code" class="b-service-config__choice" :class="{ 'b-service-config__choice--selected': outputs.type === item.code }">
              <input type="radio" :name="modelInputId" :value="item.code" :checked="outputs.type === item.code" :disabled="readOnly" @change="selectType(item.code)" />
              <v-icon size="19" aria-hidden="true">{{ modelIcons[item.code] }}</v-icon><span><strong>{{ tr('models.' + item.code + '.title') }}</strong><small>{{ tr('models.' + item.code + '.description') }}</small></span>
            </label>
          </div>
        </section>

        <div v-if="type" class="b-service-config__workspace">
          <div class="b-service-config__settings">
            <section v-if="has_reserve || has_booking" class="sd-modern-widget b-service-config__widget">
              <header class="b-service-config__heading"><v-icon size="19" aria-hidden="true">{{ has_reserve ? 'schedule' : 'date_range' }}</v-icon><div><h3>{{ tr(has_reserve ? 'weekly_title' : 'dates_title') }}</h3><p>{{ tr(has_reserve ? 'weekly_help' : 'dates_help') }}</p></div></header>
              <v-autocomplete v-model="outputs.timezone" :items="timezones" :disabled="readOnly" :label="tr('timezone')" :hint="tr(has_booking ? 'dates_timezone_help' : 'timezone_help')" persistent-hint clearable variant="underlined" class="sd-modern-underlined-field b-service-config__timezone" />
              <template v-if="has_reserve">
                <u-time-week-picker v-model="outputs.days" modern editable :class="{ 'disabled-no-filter': readOnly }" />
                <p class="sd-modern-notice b-service-config__notice"><v-icon class="sd-modern-notice__icon" size="16">info_outline</v-icon><span class="sd-modern-notice__content">{{ tr(outputs.timezone ? 'request_help' : 'legacy_weekly_help') }}</span></p>
              </template>
              <template v-else>
                <div class="b-service-config__times">
                  <label><span>{{ tr(outputs.type === 'RENTAL' ? 'pickup' : 'checkin') }}</span><input type="time" :value="timeValue(outputs.checkin)" :disabled="readOnly" required @input="setTime('checkin', $event.target.value)" /></label>
                  <label><span>{{ tr(outputs.type === 'RENTAL' ? 'return' : 'checkout') }}</span><input type="time" :value="timeValue(outputs.checkout)" :disabled="readOnly" required @input="setTime('checkout', $event.target.value)" /></label>
                </div>
                <u-service-date-availability :model-value="outputs.disabled || []" :disabled="readOnly" @update:model-value="outputs.disabled = $event" />
                <p class="b-service-config__help">{{ tr('inventory_separate') }}</p>
              </template>
            </section>

            <section v-if="has_tasks" class="sd-modern-widget b-service-config__widget">
              <header class="b-service-config__heading"><v-icon size="19" aria-hidden="true">checklist</v-icon><div><h3>{{ tr('tasks_title') }}</h3><p>{{ tr('tasks_help') }}</p></div></header>
              <u-tasks-editor v-model="outputs.tasks" modern editable />
            </section>

            <section v-if="has_subscription" class="sd-modern-widget b-service-config__widget">
              <header class="b-service-config__heading"><v-icon size="19" aria-hidden="true">timelapse</v-icon><div><h3>{{ tr('duration_title') }}</h3><p>{{ tr('duration_help') }}</p></div></header>
              <u-number-input v-model="duration" :min="1" :max="36500" :decimal="0" :disabled="readOnly" :label="tr('duration_days')" :suffix="tr('days')" />
              <div class="b-service-config__presets"><v-btn v-for="period in subscription_periods" :key="period.duration" class="sd-modern-button sd-modern-button--inline" variant="text" :aria-pressed="duration === period.duration" :disabled="readOnly" @click="duration = period.duration">{{ $n(period.duration) }} {{ tr('days') }}</v-btn></div>
              <p class="sd-modern-notice b-service-config__notice"><v-icon class="sd-modern-notice__icon" size="16">event_repeat</v-icon><span class="sd-modern-notice__content">{{ tr('subscription_help') }}</span></p>
              <details class="b-service-config__comparison"><summary>{{ tr('recurring_title') }}</summary><p>{{ tr('recurring_help') }}</p></details>
            </section>

            <section v-if="has_charge" class="sd-modern-widget b-service-config__widget">
              <header class="b-service-config__heading"><v-icon size="19" aria-hidden="true">battery_charging_full</v-icon><div><h3>{{ tr('credit_title') }}</h3><p>{{ tr('credit_help') }}</p></div></header>
              <u-number-input v-model="outputs.charge" :min="0" :max="2147483647" :decimal="0" :disabled="readOnly" :label="tr('initial_credit')" :suffix="tr('units')" />
              <p class="sd-modern-notice b-service-config__notice"><v-icon class="sd-modern-notice__icon" size="16">info_outline</v-icon><span class="sd-modern-notice__content">{{ tr('credit_integration') }}</span></p>
            </section>
          </div>

          <aside class="sd-modern-widget b-service-config__preview">
            <div class="b-service-config__preview-label"><v-icon size="16" aria-hidden="true">visibility</v-icon>{{ tr('preview') }}</div>
            <h3>{{ tr('models.' + outputs.type + '.title') }}</h3><p>{{ tr('preview_help') }}</p>
            <s-product-service-form :key="`${product.id}:${outputs.type}:${previewRevision}`" :product="product" :basket="null" modern />
          </aside>
        </div>
      </fieldset>

      <details class="b-service-config__guide">
        <summary><v-icon size="18" aria-hidden="true">alt_route</v-icon><span>{{ tr('guide_title') }}</span><v-icon size="16" aria-hidden="true">expand_more</v-icon></summary>
        <div class="b-service-config__guide-body">
          <section><v-icon size="19" aria-hidden="true">tune</v-icon><div><h3>{{ tr('guide_builtin_title') }}</h3><p>{{ tr('guide_builtin') }}</p><v-btn class="sd-modern-button sd-modern-button--inline" color="primary" variant="text" :disabled="!!disabled" @click="$emit('navigate', 'availability')">{{ tr('open_availability') }}<v-icon end size="16">arrow_forward</v-icon></v-btn></div></section>
          <section><v-icon size="19" aria-hidden="true">web</v-icon><div><h3>{{ tr('guide_layout_title') }}</h3><p>{{ tr('guide_layout') }}</p></div></section>
          <section><v-icon size="19" aria-hidden="true">dns</v-icon><div><h3>{{ tr('guide_server_title') }}</h3><p>{{ tr('guide_server') }}</p></div></section>
          <section><v-icon size="19" aria-hidden="true">data_object</v-icon><div><h3>{{ tr('guide_metadata_title') }}</h3><p>{{ tr('guide_metadata') }}</p><dl><div><dt><v-icon size="15" aria-hidden="true">public</v-icon>{{ tr('public_metadata') }}</dt><dd>{{ tr('public_metadata_help') }}</dd></div><div><dt><v-icon size="15" aria-hidden="true">lock_outline</v-icon>{{ tr('private_metadata') }}</dt><dd>{{ tr('private_metadata_help') }}</dd></div><div><dt><v-icon size="15" aria-hidden="true">smart_toy</v-icon>{{ tr('agent_metadata') }}</dt><dd>{{ tr('agent_metadata_help') }}</dd></div></dl><v-btn v-if="metadataAvailable" class="sd-modern-button sd-modern-button--inline" color="primary" variant="text" :disabled="!!disabled" @click="$emit('navigate', 'metadata')">{{ tr('open_metadata') }}<v-icon end size="16">arrow_forward</v-icon></v-btn></div></section>
        </div>
      </details>
      <p v-if="validationMessage" role="alert" class="sd-modern-notice b-service-config__validation"><v-icon class="sd-modern-notice__icon" size="17">error_outline</v-icon><span class="sd-modern-notice__content">{{ validationMessage }}</span></p>
    </template>
    <template v-else>
    <div class="widget-box mb-5">
      <u-widget-header
        :title="$t('service_design.type')"
        icon="home_repair_service"
      ></u-widget-header>
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
      <u-widget-header
        :title="$t('global.service.task.title')"
        icon="playlist_add_check"
      ></u-widget-header>
      <v-list-subheader>
        You can set default tasks for this service, which will automatically be
        added to each order. You can then add or modify tasks for each specific
        order upon receipt.
      </v-list-subheader>

      <u-tasks-editor v-model="outputs.tasks" editable />
    </div>

    <!-- ----------------------- Appointment ----------------------- -->
    <div v-if="has_reserve" class="widget-box mb-5">
      <u-widget-header
        :title="$t('global.service.appointment.title')"
        icon="date_range"
      ></u-widget-header>
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
      <u-widget-header
        :title="$t('global.service.booking.title')"
        icon="book_online"
      ></u-widget-header>
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
        :model-value="outputs.disabled?.map((d) => new Date(d))"
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
      <u-widget-header
        :title="$t('global.service.subscription.title')"
        icon="timelapse"
      ></u-widget-header>
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
      <u-widget-header
        :title="$t('global.service.charge.title')"
        icon="data_saver_on"
      ></u-widget-header>
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
    </template>
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
import DateMixin from "@selldone/components-vue/mixin/date/DateMixin.ts";
import { useId } from "vue";
import UServiceDateAvailability from "../../../../ui/date/service-availability/UServiceDateAvailability.vue";
import SProductServiceForm from "../../../../storefront/product/service/form/SProductServiceForm.vue";

export default {
  name: "BProductServiceManage",
  mixins: [DateMixin],
  components: {
    USmartSelect,
    UTimePicker,
    UTimeWeekPicker,
    UNumberInput,
    UTasksEditor,
    UServiceDateAvailability,
    SProductServiceForm,
  },
  emits: ['navigate'],
  setup() { return { modelInputId: `service-model-${useId()}` }; },
  props: {
    modern: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    metadataAvailable: { type: Boolean, default: false },
    product: {
      required: true,
      type: Object,
    },
  },
  data: () => ({
    modelPickerOpen: false,
    modelDrafts: {},
    savedSnapshot: '',
    validationMessage: '',
    previewRevision: 0,
    modelIcons: { DEMAND: 'home_repair_service', BOOKING: 'date_range', APPOINTMENT: 'event_available', RENTAL: 'key', SUBSCRIPTION: 'timelapse', CHARGE: 'battery_charging_full', CUSTOM: 'checklist' },
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
    readOnly() { return this.disabled || !!this.product.parent_id; },
    hasUnsavedChanges() { return this.savedSnapshot !== JSON.stringify(this.product.outputs); },
    timezones() {
      const supported = typeof Intl.supportedValuesOf === 'function' ? Intl.supportedValuesOf('timeZone') : ['Asia/Dubai', 'Asia/Tehran', 'Europe/London', 'America/New_York'];
      return [...new Set(['UTC', this.outputs?.timezone, ...supported].filter(Boolean))];
    },
    duration: {
      get() { return this.outputs?.subscription ?? (typeof this.outputs?.days === 'number' ? this.outputs.days : null); },
      set(value) {
        if (this.readOnly) return;
        this.outputs.subscription = value;
        delete this.outputs.days;
      },
    },
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
  watch: {
    'product.outputs'(value) { this.outputs = value; },
    product() { this.initialize(); },
    'product.id'() { this.initialize(); },
  },
  created() {
    this.initialize();
  },
  methods: {
    tr(key, values = {}) { return this.$t('service_design.refined.' + key, values); },
    initialize() {
      if (!this.product.outputs || typeof this.product.outputs !== 'object' || Array.isArray(this.product.outputs)) this.product.outputs = { type: null };
      this.outputs = this.product.outputs;
      this.markSaved();
    },
    selectType(code) {
      if (this.readOnly || !ServiceTypes[code] || code === this.outputs.type) return;
      const previous = this.outputs;
      if (previous.type) this.modelDrafts[previous.type] = JSON.parse(JSON.stringify(previous));
      // days is a weekly map for appointments but a number in legacy subscriptions.
      const next = this.modelDrafts[code] ? JSON.parse(JSON.stringify(this.modelDrafts[code])) : { ...previous, type: code };
      const form = ServiceTypes[code].form;
      const legacyDuration = typeof next.days === 'number' ? next.days : null;
      if (form.includes('reserve')) next.days = next.days && typeof next.days === 'object' && !Array.isArray(next.days) ? next.days : {};
      else delete next.days;
      if (form.includes('subscription')) next.subscription = next.subscription ?? legacyDuration ?? 30;
      else delete next.subscription;
      if (form.includes('tasks')) next.tasks = Array.isArray(next.tasks) ? next.tasks : [];
      else delete next.tasks;
      if (form.includes('charge')) next.charge = next.charge ?? 0;
      else delete next.charge;
      if (form.includes('booking')) {
        next.disabled = Array.isArray(next.disabled) ? next.disabled : [];
        next.checkin = next.checkin || { HH: 14, mm: 0 };
        next.checkout = next.checkout || { HH: 11, mm: 0 };
      } else { delete next.disabled; delete next.checkin; delete next.checkout; }
      if (!previous.type && (form.includes('reserve') || form.includes('booking'))) next.timezone = next.timezone || 'UTC';
      this.product.outputs = next;
      this.outputs = next;
      this.modelPickerOpen = false;
      this.validationMessage = '';
      this.previewRevision++;
    },
    timeValue(value) {
      return value && Number.isInteger(Number(value.HH)) && Number.isInteger(Number(value.mm)) ? `${String(value.HH).padStart(2, '0')}:${String(value.mm).padStart(2, '0')}` : '';
    },
    setTime(field, value) {
      if (this.readOnly) return;
      const [HH, mm] = value.split(':').map(Number);
      this.outputs[field] = value ? { HH, mm } : null;
    },
    markSaved() { this.savedSnapshot = JSON.stringify(this.product.outputs); this.modelDrafts = {}; this.validationMessage = ''; },
    discardChanges() {
      if (this.readOnly || !this.savedSnapshot) return;
      this.product.outputs = JSON.parse(this.savedSnapshot);
      this.outputs = this.product.outputs;
      this.modelDrafts = {};
      this.validationMessage = '';
      this.previewRevision++;
    },
    prepareSave() {
      if (this.disabled) return false;
      if (!this.modern || this.product.parent_id) return true;
      let error = '';
      if (!this.type) error = 'choose_model';
      else if (this.outputs.timezone) {
        try { new Intl.DateTimeFormat('en', { timeZone: this.outputs.timezone }).format(); }
        catch { error = 'invalid_timezone'; }
      }
      if (!error && this.has_subscription && (!Number.isInteger(this.duration) || this.duration < 1 || this.duration > 36500)) error = 'invalid_duration';
      if (!error && this.has_charge && (!Number.isInteger(this.outputs.charge) || this.outputs.charge < 0 || this.outputs.charge > 2147483647)) error = 'invalid_credit';
      if (!error && this.has_tasks && (this.outputs.tasks?.length > 100 || this.outputs.tasks?.some(task => !task.title?.trim() || task.title.length > 1000 || !Number.isFinite(task.progress) || task.progress < 0 || task.progress > 100))) error = 'invalid_tasks';
      if (!error && this.has_booking && ['checkin', 'checkout'].some(field => !/^([01]\d|2[0-3]):[0-5]\d$/.test(this.timeValue(this.outputs[field])))) error = 'invalid_time';
      this.validationMessage = error ? this.tr(error) : '';
      if (!error && this.has_subscription) this.duration = this.duration;
      return !error;
    },
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

<style lang="scss" scoped>
.b-service-config {
  color: rgb(var(--v-theme-on-surface)); font-size: 13px; line-height: 20px;
  &__fields { display: grid; gap: 18px; min-inline-size: 0; padding: 0; border: 0; margin: 0; }
  &__model, &__widget, &__preview { padding: 22px; min-inline-size: 0; }
  &__model-heading { display: flex; align-items: center; gap: 12px; > div { flex: 1; min-inline-size: 0; } > .v-icon { flex-shrink: 0; } small { display: block; color: var(--sd-modern-muted); font-size: 11px; margin-block-end: 3px; } }
  h3 { margin: 0; font-size: 15px; font-weight: 500; line-height: 23px; }
  p { margin: 3px 0 0; color: var(--sd-modern-muted); font-size: 13px; line-height: 21px; }
  &__models { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; border-block-start: 1px solid var(--sd-modern-border); padding-block-start: 18px; margin-block-start: 18px; }
  &__choice { display: flex; align-items: flex-start; gap: 10px; padding: 13px; border: 1px solid var(--sd-modern-border); border-radius: 9px; cursor: pointer; > input { flex-shrink: 0; margin-block-start: 4px; accent-color: rgb(var(--v-theme-primary)); } > .v-icon { flex-shrink: 0; margin-block-start: 2px; } > span { min-inline-size: 0; } strong { display: block; font-weight: 500; } small { display: block; margin-block-start: 3px; color: var(--sd-modern-muted); font-size: 11px; line-height: 18px; } }
  &__choice--selected { border-color: rgb(var(--v-theme-primary)); background: var(--sd-modern-inset); }
  &__workspace { display: grid; grid-template-columns: minmax(0, 1fr) 260px; gap: 18px; align-items: start; }
  &__settings { display: grid; gap: 18px; min-inline-size: 0; }
  &__heading { display: flex; align-items: flex-start; gap: 11px; margin-block-end: 20px; > .v-icon { margin-block-start: 2px; color: var(--sd-modern-muted); } > div { min-inline-size: 0; } }
  &__timezone { margin-block-end: 20px; }
  &__times { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px; margin-block-end: 20px; label { display: grid; gap: 5px; font-size: 12px; } input { inline-size: 100%; min-inline-size: 0; min-block-size: 40px; border: 0; border-block-end: 1px solid var(--sd-modern-border); font: inherit; font-size: 14px; color: inherit; background: rgb(var(--v-theme-surface)); padding-block: 7px; } }
  &__notice { margin-block-start: 18px !important; }
  &__help { margin-block-start: 16px !important; font-size: 12px !important; }
  &__presets { display: flex; flex-wrap: wrap; gap: 6px; margin-block-start: 14px; .v-btn[aria-pressed=true] { background: var(--sd-modern-inset); } }
  &__comparison { margin-block-start: 18px; summary { cursor: pointer; font-size: 13px; } p { margin-block-start: 8px; } }
  &__preview { padding: 18px; h3 { font-size: 14px; } p { font-size: 12px; } }
  &__preview-label { display: flex; align-items: center; gap: 7px; margin-block-end: 14px; color: var(--sd-modern-muted); font-size: 11px; }
  &__guide { margin-block-start: 20px; border-block-start: 1px solid var(--sd-modern-border); > summary { display: flex; align-items: center; gap: 9px; padding-block: 17px 0; list-style: none; cursor: pointer; > span { flex: 1; } &::-webkit-details-marker { display: none; } } }
  &__guide-body { display: grid; gap: 18px; margin-block-start: 18px; > section { display: flex; align-items: flex-start; gap: 12px; > .v-icon { color: var(--sd-modern-muted); margin-block-start: 3px; } > div { min-inline-size: 0; } } h3 { font-size: 14px; } dl { display: grid; gap: 10px; margin-block: 12px; } dt { display: flex; align-items: center; gap: 7px; font-size: 12px; } dd { margin: 2px 0 0; color: var(--sd-modern-muted); font-size: 12px; } }
  &__validation { margin-block-start: 18px !important; }
  :deep(.v-label) { font-size: 12px; }
  :deep(.v-messages) { font-size: 12px; line-height: 19px; }
  @container product-service (max-width: 780px) { &__workspace { grid-template-columns: minmax(0, 1fr); } }
  @media (max-width: 900px) { &__workspace { grid-template-columns: minmax(0, 1fr); } }
  @media (max-width: 600px) { &__model, &__widget, &__preview { padding: 18px; } &__models { grid-template-columns: minmax(0, 1fr); } &__model-heading { flex-wrap: wrap; > .v-btn { margin-inline-start: 36px; } } &__times input { font-size: 16px; min-block-size: 44px; } }
}
</style>
