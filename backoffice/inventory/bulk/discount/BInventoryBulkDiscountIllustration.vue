<template>
  <figure class="b-bulk-discount-illustration sd-modern-illustration text-start">
    <figcaption>
      <span class="b-bulk-discount-illustration__label">{{ $t('inventory_list.bulk_discount_dialog.modern.illustration_label') }}</span>
      <h2>{{ $t('inventory_list.bulk_discount_dialog.modern.illustration_title') }}</h2>
    </figcaption>
    <div class="b-bulk-discount-illustration__stage" aria-hidden="true">
      <div class="b-bulk-discount-illustration__card">
        <div class="b-bulk-discount-illustration__caption"><v-icon size="16">inventory_2</v-icon><span>{{ $t('inventory_list.bulk_discount_dialog.modern.illustration_current') }}</span><bdi>P–1024</bdi></div>
        <p class="b-bulk-discount-illustration__sample">{{ $t('inventory_list.bulk_discount_dialog.modern.illustration_sample') }}</p>
        <div class="b-bulk-discount-illustration__row"><span>{{ $t('inventory_list.bulk_discount_dialog.modern.illustration_base') }}</span><bdi>100.00 <small>USD</small></bdi></div>
        <div class="b-bulk-discount-illustration__row"><span>{{ $t('inventory_list.bulk_discount_dialog.modern.illustration_discount') }}</span><bdi>10.00 <small>USD · 10%</small></bdi></div>
        <div class="b-bulk-discount-illustration__total"><span>{{ $t('inventory_list.bulk_discount_dialog.modern.illustration_payable') }}</span><bdi>90.00 <small>USD</small></bdi></div>
      </div>
      <div class="b-bulk-discount-illustration__connection">
        <svg class="b-bulk-discount-illustration__curve" viewBox="0 0 280 80" preserveAspectRatio="none" focusable="false">
          <path class="b-bulk-discount-illustration__track" d="M140 0 C140 18 195 14 184 31 C173 48 88 34 96 54 C102 68 140 63 140 80" />
          <path class="b-bulk-discount-illustration__trace" pathLength="1" d="M140 0 C140 18 195 14 184 31 C173 48 88 34 96 54 C102 68 140 63 140 80" />
        </svg>
        <span class="b-bulk-discount-illustration__rule"><v-icon size="15">auto_fix_high</v-icon><bdi>{{ discountAmount === null ? '—' : percent }}%</bdi></span>
      </div>
      <div class="b-bulk-discount-illustration__card b-bulk-discount-illustration__card--result">
        <div class="b-bulk-discount-illustration__caption"><v-icon size="16">sell</v-icon>{{ $t('inventory_list.bulk_discount_dialog.modern.illustration_after') }}</div>
        <div class="b-bulk-discount-illustration__row"><span>{{ $t('inventory_list.bulk_discount_dialog.modern.illustration_base') }}</span><bdi>100.00 <small>USD</small></bdi></div>
        <div class="b-bulk-discount-illustration__row"><span>{{ $t('inventory_list.bulk_discount_dialog.modern.illustration_discount') }}</span><bdi>{{ formatNumber(discountAmount) }} <small>USD · {{ discountAmount === null ? '—' : percent }}%</small></bdi></div>
        <div class="b-bulk-discount-illustration__total"><span>{{ $t('inventory_list.bulk_discount_dialog.modern.illustration_payable') }}</span><bdi>{{ formatNumber(payable) }} <small>USD</small></bdi></div>
        <div class="b-bulk-discount-illustration__period"><v-icon size="15">schedule</v-icon><span>{{ periodText }}</span></div>
        <div class="b-bulk-discount-illustration__example"><span>{{ $t('inventory_list.bulk_discount_dialog.modern.example_only') }}</span><v-icon size="15">check</v-icon></div>
      </div>
    </div>
    <p class="b-bulk-discount-illustration__summary">{{ summary }}</p>
  </figure>
</template>

<script lang="ts">
import { PriceHelper } from '@selldone/core-js/helper/price/PriceHelper';
import { formatDiscountPeriod } from '../formatDiscountPeriod';

export default {
  name: 'BInventoryBulkDiscountIllustration',
  props: {
    percent: { type: Number, default: 0 },
    start: { type: [Date, String, Number], default: null },
    end: { type: [Date, String, Number], default: null },
  },
  computed: {
    discountAmount() {
      // Fictional USD 100 example; actual amounts use the server's currency rounding.
      return Number.isFinite(this.percent) && this.percent >= 0 && this.percent <= 90
        ? PriceHelper.FixPrecision(100 * this.percent / 100, 2) : null;
    },
    payable() {
      return this.discountAmount === null ? null : PriceHelper.FixPrecision(100 - this.discountAmount, 2);
    },
    periodText() {
      return formatDiscountPeriod(this.start, this.end, this.$i18n?.locale || 'en', this.$t);
    },
    summary() {
      if (this.discountAmount === null) return this.$t('inventory_list.bulk_discount_dialog.modern.rounding_help');
      const isolate = (value) => `\u2066${value}\u2069`;
      return this.$t('inventory_list.bulk_discount_dialog.modern.example_summary', {
        percent: isolate(String(this.percent)),
        discount: isolate(`${this.formatNumber(this.discountAmount)} USD`),
        payable: isolate(`${this.formatNumber(this.payable)} USD`),
      });
    },
  },
  methods: {
    formatNumber(value) {
      return value === null ? '—' : new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
    },
  },
};
</script>

<style lang="scss" scoped>
.b-bulk-discount-illustration {
  margin: 0;
  color: rgb(var(--v-theme-on-surface));

  &__label { color: var(--sd-modern-muted); font-size: 11px; font-weight: 400; line-height: 17px; letter-spacing: .6px; text-transform: uppercase; }
  h2 { font-size: 15px; font-weight: 500; line-height: 23px; margin: 5px 0 0; }
  &__stage { margin-block-start: 20px; }
  &__card { position: relative; padding: 18px; background: rgb(var(--v-theme-surface)); border: 1px solid var(--sd-modern-border); border-radius: 18px; }
  &__card--result { border-radius: 14px; border-color: rgba(var(--sd-modern-illustration-accent-rgb), .3); }
  &__caption { display: flex; align-items: center; gap: 8px; font-size: 13px; line-height: 20px; color: var(--sd-modern-muted); }
  &__caption > bdi { margin-inline-start: auto; font-size: 11px; }
  &__sample { margin: 12px 0 14px; font-size: 12px; line-height: 20px; color: var(--sd-modern-muted); }
  &__row { display: flex; align-items: baseline; justify-content: space-between; flex-wrap: wrap; gap: 4px 10px; margin-block-start: 9px; font-size: 13px; line-height: 21px; }
  bdi { font-variant-numeric: tabular-nums; }
  small { font-size: 11px; font-weight: 400; color: var(--sd-modern-muted); }
  &__total { margin-block-start: 15px; padding-block-start: 13px; border-block-start: 1px solid var(--sd-modern-border); }
  &__total > span { display: block; font-size: 12px; line-height: 20px; color: var(--sd-modern-muted); }
  &__total > bdi { display: block; font-size: 29px; font-weight: 500; line-height: 39px; margin-block-start: 3px; overflow-wrap: anywhere; }
  &__total small { font-size: 12px; }
  &__connection { height: 80px; position: relative; display: grid; place-items: center; }
  &__curve { position: absolute; inset: 0; width: 100%; height: 100%; fill: none; pointer-events: none; }
  &__track,
  &__trace { stroke: rgb(var(--sd-modern-illustration-accent-rgb)); stroke-width: 1.1; stroke-linecap: round; vector-effect: non-scaling-stroke; }
  &__track { opacity: .15; }
  &__trace { stroke-dasharray: 1; stroke-dashoffset: 0; animation: b-discount-rule-flow 2.2s ease-out 1; }
  &__rule { display: inline-flex; align-items: center; gap: 7px; position: relative; max-width: 90%; padding: 5px 10px; border-radius: 7px; background: rgb(var(--v-theme-surface)); color: rgb(var(--sd-modern-illustration-accent-rgb)); font-size: 12px; line-height: 20px; }
  &__period { display: flex; align-items: flex-start; gap: 7px; margin-block-start: 12px; color: var(--sd-modern-muted); font-size: 12px; line-height: 20px; }
  &__period .v-icon { margin-block-start: 2px; flex-shrink: 0; }
  &__example { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-block-start: 14px; font-size: 12px; line-height: 20px; color: var(--sd-modern-muted); }
  &__summary { margin: 14px 0 0; color: var(--sd-modern-muted); font-size: 13px; line-height: 21px; }

  @media (max-width: 760px) {
    &__stage { max-width: 460px; margin-inline: auto; }
  }
}

@keyframes b-discount-rule-flow { from { stroke-dashoffset: 1; } to { stroke-dashoffset: 0; } }
@media (prefers-reduced-motion: reduce) { .b-bulk-discount-illustration__trace { animation: none; stroke-dashoffset: 0; } }
</style>
