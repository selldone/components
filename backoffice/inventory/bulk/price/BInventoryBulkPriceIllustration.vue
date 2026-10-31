<template>
  <figure class="b-bulk-price-illustration sd-modern-illustration text-start">
    <figcaption>
      <span class="b-bulk-price-illustration__label">{{ $t('bulk_price_dialog.modern.illustration_label') }}</span>
      <h2>{{ $t('bulk_price_dialog.modern.illustration_title') }}</h2>
    </figcaption>
    <div class="b-bulk-price-illustration__stage" aria-hidden="true">
      <div v-if="mode === 'marketplace'" class="b-bulk-price-illustration__offers">
        <div><v-icon size="16">storefront</v-icon>{{ $t('global.commons.vendor') }} A <bdi>{{ formatNumber(100) }}</bdi></div>
        <div><v-icon size="16">storefront</v-icon>{{ $t('global.commons.vendor') }} B <bdi>{{ formatNumber(120) }}</bdi></div>
      </div>
      <div class="b-bulk-price-illustration__card">
        <div class="b-bulk-price-illustration__caption"><v-icon size="16">inventory_2</v-icon>{{ $t('bulk_price_dialog.modern.current_base_price') }}</div>
        <div class="b-bulk-price-illustration__amount"><bdi>{{ formatNumber(samplePrice) }}</bdi><span>{{ exampleCurrency }}</span></div>
        <div class="b-bulk-price-illustration__meta"><span>{{ $t('bulk_price_dialog.modern.sample_product') }}</span><bdi>P–1024</bdi></div>
      </div>
      <div class="b-bulk-price-illustration__connection">
        <svg class="b-bulk-price-illustration__curve" viewBox="0 0 320 78" preserveAspectRatio="none" focusable="false">
          <path class="b-bulk-price-illustration__track" d="M160 0 C160 12 189 8 189 20 S160 27 160 39 C160 50 131 48 131 60 S160 68 160 78" />
          <path class="b-bulk-price-illustration__trace" d="M160 0 C160 12 189 8 189 20 S160 27 160 39 C160 50 131 48 131 60 S160 68 160 78" />
        </svg>
        <span class="b-bulk-price-illustration__rule"><v-icon size="15">auto_fix_high</v-icon><bdi>{{ ruleLabel }}</bdi></span>
      </div>
      <div class="b-bulk-price-illustration__card b-bulk-price-illustration__card--result">
        <div class="b-bulk-price-illustration__caption"><v-icon size="16">sell</v-icon>{{ $t('bulk_price_dialog.modern.proposed_base_price') }}</div>
        <div class="b-bulk-price-illustration__amount"><bdi>{{ result === null ? '—' : formatNumber(result) }}</bdi><span>{{ exampleCurrency }}</span></div>
        <div class="b-bulk-price-illustration__meta"><span>{{ $t('bulk_price_dialog.modern.example_only') }}</span><v-icon size="15">check</v-icon></div>
      </div>
    </div>
    <p class="b-bulk-price-illustration__summary">{{ summary }}</p>
    <p v-if="result !== null && result < 0" class="b-bulk-price-illustration__note"><v-icon size="16" aria-hidden="true">warning_amber</v-icon>{{ $t('bulk_price_dialog.modern.negative_example') }}</p>
    <p v-else-if="mode === 'percent' && Number(percent) === 0" class="b-bulk-price-illustration__note">{{ $t('bulk_price_dialog.modern.zero_example') }}</p>
  </figure>
</template>

<script lang="ts">
import { Currency } from '@selldone/core-js/enums/payment/Currency';
import { PriceHelper } from '@selldone/core-js/helper/price/PriceHelper';

export default {
  name: 'BInventoryBulkPriceIllustration',
  props: {
    mode: { type: String, required: true },
    percent: { type: Number, default: 0 },
    constant: { type: Number, default: 0 },
    ending: { type: Number, default: 0 },
    currency: { type: String, default: null },
    strategy: { type: String, default: null },
  },
  computed: {
    exampleCurrency() {
      // Percent uses a fictional USD example; the server preview owns every currency's rounding.
      return this.mode === 'percent' || !this.currency ? 'USD' : this.currency;
    },
    precision() {
      return Currency[this.exampleCurrency]?.floats ?? 2;
    },
    samplePrice() {
      if (this.mode === 'marketplace') return 110;
      return this.mode === 'ending' ? (this.precision ? 24.3 : 24) : 100;
    },
    result() {
      if (this.mode === 'marketplace') return this.strategy === 'min' ? 100 : this.strategy === 'max' ? 120 : null;
      if (this.mode === 'percent') return Number.isFinite(this.percent) ? PriceHelper.FixPrecision(this.samplePrice * (1 + this.percent / 100), 2) : null;
      if (!this.currency) return null;
      if (this.mode === 'constant') return Number.isFinite(this.constant) ? PriceHelper.FixPrecision(this.samplePrice + this.constant, this.precision) : null;
      if (!Number.isFinite(this.ending) || this.ending < 0) return null;
      const ending = PriceHelper.FixPrecision(this.ending, this.precision);
      const block = ending >= 1 ? 10 ** String(Math.floor(ending)).length : 1;
      return PriceHelper.FixPrecision(Math.floor(this.samplePrice / block) * block + ending, this.precision);
    },
    ruleLabel() {
      if (this.mode === 'marketplace') return this.$t(this.strategy ? `bulk_price_dialog.marketplace.strategy.${this.strategy}.title` : 'bulk_price_dialog.marketplace_listing_price');
      const value = this.mode === 'percent' ? this.percent : this.mode === 'constant' ? this.constant : this.ending;
      if (!Number.isFinite(value)) return '—';
      return this.mode === 'percent' ? `${value > 0 ? '+' : ''}${value}%` : `${this.mode === 'constant' && value > 0 ? '+' : ''}${this.formatNumber(value)}`;
    },
    summary() {
      if (this.mode === 'marketplace') return this.$t('bulk_price_dialog.modern.marketplace_help');
      if (this.result === null) return this.$t(`bulk_price_dialog.modern.${this.mode}_rounding`);
      const isolate = (value) => `\u2066${value}\u2069`;
      return this.$t(`bulk_price_dialog.modern.example_${this.mode}`, {
        value: isolate(this.mode === 'percent' ? String(this.percent) : this.formatNumber(this.mode === 'constant' ? this.constant : this.ending)),
        before: isolate(`${this.formatNumber(this.samplePrice)} ${this.exampleCurrency}`),
        after: isolate(`${this.formatNumber(this.result)} ${this.exampleCurrency}`),
      });
    },
  },
  methods: {
    formatNumber(value) {
      return new Intl.NumberFormat('en-US', { minimumFractionDigits: this.precision, maximumFractionDigits: this.precision }).format(value);
    },
  },
};
</script>

<style lang="scss" scoped>
.b-bulk-price-illustration {
  margin: 0;
  color: rgb(var(--v-theme-on-surface));

  &__label { color: var(--sd-modern-muted); font-size: 10px; font-weight: 400; line-height: 16px; letter-spacing: .65px; text-transform: uppercase; }
  h2 { font-size: 15px; font-weight: 500; line-height: 23px; margin: 4px 0 0; }
  &__stage { margin-block-start: 20px; }
  &__card { position: relative; padding: 18px; background: rgb(var(--v-theme-surface)); border: 1px solid var(--sd-modern-border); border-radius: 18px; }
  &__card--result { border-radius: 14px; border-color: rgba(var(--sd-modern-illustration-accent-rgb), .3); }
  &__caption { display: flex; align-items: center; gap: 8px; font-size: 13px; line-height: 20px; color: var(--sd-modern-muted); }
  &__amount { display: flex; align-items: baseline; flex-wrap: wrap; gap: 9px; margin-block: 10px; direction: ltr; justify-content: flex-start; }
  &__amount bdi { font-size: 30px; font-weight: 500; line-height: 40px; letter-spacing: -.6px; font-variant-numeric: tabular-nums; overflow-wrap: anywhere; min-width: 0; }
  &__amount > span { font-size: 12px; color: var(--sd-modern-muted); }
  &__meta { display: flex; align-items: center; justify-content: space-between; gap: 8px; font-size: 12px; line-height: 19px; color: var(--sd-modern-muted); }
  &__meta > bdi { font-size: 11px; letter-spacing: .4px; }
  &__connection { height: 78px; position: relative; display: grid; place-items: center; }
  &__curve { position: absolute; inset: 0; width: 100%; height: 100%; fill: none; pointer-events: none; }
  &__track,
  &__trace { stroke: rgb(var(--sd-modern-illustration-accent-rgb)); stroke-width: 1.2; stroke-linecap: round; vector-effect: non-scaling-stroke; }
  &__track { opacity: .18; }
  &__trace { opacity: .6; stroke-dasharray: 150; stroke-dashoffset: 0; animation: bulk-price-rule-flow 2.2s ease-out both; }
  &__rule { display: inline-flex; align-items: center; gap: 7px; position: relative; max-width: calc(100% - 32px); padding: 5px 12px; border-radius: 8px; color: rgb(var(--sd-modern-illustration-accent-rgb)); background: rgb(var(--v-theme-surface)); font-size: 13px; line-height: 21px; }
  &__rule > bdi { overflow-wrap: anywhere; }
  &__summary { font-size: 13px; line-height: 21px; color: var(--sd-modern-muted); margin: 15px 0 0; }
  &__note { display: flex; align-items: flex-start; gap: 7px; font-size: 13px; line-height: 21px; margin: 10px 0 0; }
  &__note > .v-icon { flex-shrink: 0; margin-block-start: 3px; color: rgb(var(--v-theme-warning)); }
  &__offers { display: grid; gap: 8px; margin-block-end: 14px; }
  &__offers > div { display: flex; align-items: center; gap: 7px; padding: 10px 12px; border-radius: 10px; background: rgb(var(--v-theme-surface)); font-size: 13px; line-height: 20px; }
  &__offers bdi { margin-inline-start: auto; }

  @media (max-width: 760px) {
    &__stage { max-width: 480px; margin-inline: auto; }
  }
}

@keyframes bulk-price-rule-flow {
  from { stroke-dashoffset: 150; opacity: .15; }
  to { stroke-dashoffset: 0; opacity: .6; }
}

@media (prefers-reduced-motion: reduce) {
  .b-bulk-price-illustration__trace { animation: none; stroke-dashoffset: 0; }
}
</style>
