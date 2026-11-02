<template>
  <div class="u-service-date-availability">
    <div class="u-service-date-availability__heading">
      <span>{{ monthLabel }}</span>
      <div>
        <v-tooltip location="top" content-class="sd-modern-tooltip">
          <template #activator="{ props }">
            <button v-bind="props" type="button" class="u-service-date-availability__navigation" :disabled="previousDisabled" :aria-label="$t('service_design.refined.previous_month')" @click="moveMonth(-1)">
              <v-icon size="18" aria-hidden="true">{{ getCurrentLanguage().dir === 'rtl' ? 'chevron_right' : 'chevron_left' }}</v-icon>
            </button>
          </template>
          {{ $t('service_design.refined.previous_month') }}
        </v-tooltip>
        <v-tooltip location="top" content-class="sd-modern-tooltip">
          <template #activator="{ props }">
            <button v-bind="props" type="button" class="u-service-date-availability__navigation" :disabled="disabled" :aria-label="$t('service_design.refined.next_month')" @click="moveMonth(1)">
              <v-icon size="18" aria-hidden="true">{{ getCurrentLanguage().dir === 'rtl' ? 'chevron_left' : 'chevron_right' }}</v-icon>
            </button>
          </template>
          {{ $t('service_design.refined.next_month') }}
        </v-tooltip>
      </div>
    </div>
    <div ref="calendar" class="u-service-date-availability__calendar" role="group" :aria-label="$t(editable ? 'service_design.refined.unavailable_dates' : 'service_design.refined.dates_title')">
      <small v-for="day in weekdays" :key="day">{{ day }}</small>
      <span v-for="empty in leadingDays" :key="`empty-${empty}`" aria-hidden="true"></span>
      <button
        v-for="key in month.dates"
        :key="key"
        type="button"
        :data-date="key"
        :disabled="!isSelectable(key)"
        :aria-pressed="selected.includes(key)"
        :aria-current="key === today ? 'date' : undefined"
        :aria-label="dateLabel(key)"
        :class="{ 'u-service-date-availability__day--blocked': blockedDates.includes(key) }"
        @click="selectDate(key)"
        @keydown="moveDayFocus($event, key)"
      >{{ dayLabel(key) }}</button>
    </div>
    <div class="u-service-date-availability__legend">
      <span><i aria-hidden="true"></i>{{ $t('service_design.refined.available') }}</span>
      <span><i class="u-service-date-availability__blocked-symbol" aria-hidden="true"></i>{{ $t('service_design.refined.blocked') }}</span>
    </div>
    <div v-if="editable" class="u-service-date-availability__selection">
      <p aria-live="polite">{{ selected.length ? $t('service_design.refined.selected_dates', { count: selected.length }) : $t('service_design.refined.select_dates') }}</p>
      <div>
        <button type="button" :disabled="disabled || !selected.length" @click="applyAvailability(true)">{{ $t('service_design.refined.make_available') }}</button>
        <button type="button" :disabled="disabled || !selected.length" @click="applyAvailability(false)">{{ $t('service_design.refined.block_dates') }}</button>
        <button type="button" class="u-service-date-availability__clear" :disabled="disabled || !selected.length" @click="setSelection([])">{{ $t('service_design.refined.clear_selection') }}</button>
      </div>
    </div>
    <p v-if="rangeError" role="alert" class="u-service-date-availability__error">{{ $t('service_design.refined.blocked_range') }}</p>
  </div>
</template>

<script lang="ts">
import { addServiceDays, serviceCalendarMonth, serviceDateKey, serviceDateRange } from "./service-calendar";

export default {
  name: "UServiceDateAvailability",
  emits: ["update:modelValue", "update:selection", "change"],
  props: {
    modelValue: { type: Array, default: () => [] },
    selection: { type: Array, default: null },
    selectionMode: { type: String, default: "range", validator: (value) => ["range", "single"].includes(value) },
    editable: { type: Boolean, default: true },
    disabled: { type: Boolean, default: false },
    min: { type: [String, Date], default: null },
    allowedDates: { type: Function, default: null },
  },
  data() {
    const today = serviceDateKey(new Date());
    return { today, monthAnchor: serviceDateKey(this.selection?.[0]) || serviceDateKey(this.min) || today, selected: [], rangeError: false };
  },
  computed: {
    calendarType() { return this.getCurrentLanguage().calendar.calendar === "persian" ? "persian" : "gregory"; },
    minimum() { return serviceDateKey(this.min) || this.today; },
    blockedDates() { return this.normalizeDates(this.modelValue); },
    month() { return serviceCalendarMonth(this.monthAnchor, this.calendarType); },
    monthLabel() { return this.formatDate(this.month.start, { month: "long", year: "numeric" }); },
    firstWeekday() { return this.getCurrentLanguage().calendar.first_day_of_week; },
    leadingDays() { return (new Date(`${this.month.start}T12:00:00Z`).getUTCDay() - this.firstWeekday + 7) % 7; },
    weekdays() {
      return Array.from({ length: 7 }, (_, index) => this.formatDate(addServiceDays("2026-11-01", (this.firstWeekday + index) % 7), { weekday: "short" }));
    },
    previousDisabled() { return this.disabled || this.month.start <= serviceCalendarMonth(this.minimum, this.calendarType).start; },
  },
  watch: {
    selection: { immediate: true, deep: true, handler(value) { this.selected = this.normalizeDates(value); this.rangeError = false; } },
    modelValue() { this.selected = this.normalizeDates(this.selection); this.rangeError = false; },
  },
  methods: {
    normalizeDates(value) { return Array.isArray(value) ? [...new Set(value.map(serviceDateKey).filter(Boolean))].sort() : []; },
    formatDate(key, options) { return new Intl.DateTimeFormat(this.getCurrentLanguage().full_locale, { ...options, calendar: this.calendarType, timeZone: "UTC" }).format(new Date(`${key}T12:00:00Z`)); },
    dayLabel(key) { return this.formatDate(key, { day: "numeric" }); },
    dateLabel(key) {
      const available = key >= this.minimum && !this.blockedDates.includes(key) && (this.editable || !this.allowedDates || this.allowedDates(key));
      return `${this.formatDate(key, { dateStyle: "full" })} · ${this.$t(available ? 'service_design.refined.available' : 'service_design.refined.blocked')}`;
    },
    isSelectable(key) { return !this.disabled && key >= this.minimum && (this.editable || !this.blockedDates.includes(key) && (!this.allowedDates || this.allowedDates(key))); },
    moveMonth(offset) {
      if (this.disabled || offset < 0 && this.previousDisabled) return;
      this.monthAnchor = serviceCalendarMonth(this.monthAnchor, this.calendarType, offset).start;
    },
    setSelection(dates) { this.selected = dates; this.rangeError = false; this.$emit("update:selection", [...dates]); },
    selectDate(key) {
      if (!this.isSelectable(key)) return;
      const selected = this.selectionMode === "range" && this.selected.length === 1 ? serviceDateRange(this.selected[0], key) : [key];
      if (selected.some((date) => !this.isSelectable(date))) { this.rangeError = true; return; }
      this.setSelection(selected);
    },
    applyAvailability(available) {
      if (this.disabled || !this.editable || !this.selected.length) return;
      const value = available ? this.blockedDates.filter((key) => !this.selected.includes(key)) : [...new Set([...this.blockedDates, ...this.selected])].sort();
      this.$emit("update:modelValue", value);
      this.$emit("change", value);
      this.setSelection([]);
    },
    moveDayFocus(event, key) {
      const direction = this.getCurrentLanguage().dir === "rtl" ? -1 : 1;
      const offset = { ArrowLeft: -direction, ArrowRight: direction, ArrowUp: -7, ArrowDown: 7 }[event.key];
      if (!offset) return;
      event.preventDefault();
      const next = addServiceDays(key, offset);
      if (!this.isSelectable(next)) return;
      this.monthAnchor = next;
      this.$nextTick(() => this.$refs.calendar?.querySelector(`[data-date="${next}"]`)?.focus());
    },
  },
};
</script>

<style lang="scss" scoped>
.u-service-date-availability {
  min-width: 0;
  color: rgb(var(--v-theme-on-surface));
  font-family: inherit;
  button { font: inherit; font-size: 12px; line-height: 18px; color: inherit; }
  button:focus-visible { outline: 2px solid rgb(var(--v-theme-primary)); outline-offset: 2px; }
  button:disabled { opacity: .4; cursor: default; }
  &__heading { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-block-end: 14px; font-size: 13px; font-weight: 500; }
  &__heading > div { display: flex; gap: 6px; }
  &__navigation { display: inline-flex; align-items: center; justify-content: center; width: 34px; height: 34px; border-radius: 7px; background: transparent; }
  &__navigation:hover { background: rgba(var(--v-theme-on-surface), .05); }
  &__calendar { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 4px; }
  &__calendar > small { padding-block: 4px; text-align: center; font-size: 11px; line-height: 18px; color: rgba(var(--v-theme-on-surface), .65); }
  &__calendar > button { min-width: 0; min-height: 38px; padding: 6px 2px; border-radius: 7px; background: transparent; }
  &__calendar > button:hover:not(:disabled) { background: rgba(var(--v-theme-on-surface), .06); }
  &__calendar > &__day--blocked { background: rgba(var(--v-theme-on-surface), .05); text-decoration: line-through; color: rgba(var(--v-theme-on-surface), .65); }
  &__calendar > button[aria-pressed="true"] { background: rgb(var(--v-theme-on-surface)); color: rgb(var(--v-theme-surface)); text-decoration: none; }
  &__calendar > button[aria-current="date"] { box-shadow: inset 0 0 0 1px rgba(var(--v-theme-on-surface), .3); }
  &__legend { display: flex; flex-wrap: wrap; gap: 15px; margin-block-start: 14px; color: rgba(var(--v-theme-on-surface), .65); font-size: 11px; line-height: 18px; }
  &__legend > span { display: inline-flex; align-items: center; gap: 6px; }
  &__legend i { display: block; width: 13px; height: 13px; border: 1px solid rgba(var(--v-theme-on-surface), .12); border-radius: 3px; }
  &__blocked-symbol { background: rgba(var(--v-theme-on-surface), .05); position: relative; }
  &__blocked-symbol::after { content: ''; position: absolute; inset-inline: 1px; top: 5px; height: 1px; background: currentColor; transform: rotate(-35deg); }
  &__selection { margin-block-start: 16px; padding: 13px; border-radius: 9px; background: rgba(var(--v-theme-on-surface), .04); }
  &__selection p { margin: 0 0 10px; font-size: 12px; line-height: 19px; }
  &__selection > div { display: flex; flex-wrap: wrap; gap: 8px; }
  &__selection button { min-height: 36px; padding: 7px 10px; border: 1px solid rgba(var(--v-theme-on-surface), .12); border-radius: 7px; background: rgb(var(--v-theme-surface)); }
  &__selection &__clear { border: 0; background: transparent; color: rgb(var(--v-theme-primary)); }
  &__error { margin: 12px 0 0; font-size: 12px; line-height: 19px; }
  @media (pointer: coarse) { button { min-height: 44px; } &__navigation { width: 44px; height: 44px; } &__calendar { gap: 2px; } }
}
</style>
