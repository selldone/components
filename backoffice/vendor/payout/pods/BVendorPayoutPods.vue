<!--
  - Copyright (c) 2023. Selldone® Business OS™
  - Author: M.Pajuhaan
  - Web: https://selldone.com
  - All rights reserved.
  -->
<template>
  <figure class="b-vendor-payout-flow text-start" :dir="$vuetify.locale?.isRtl ? 'rtl' : 'ltr'" :aria-label="t('title')">
    <figcaption class="b-vendor-payout-flow__intro">
      <span class="sd-modern-eyebrow">{{ t('illustration') }}</span>
      <p>{{ t('summary') }}</p>
      <v-btn class="sd-modern-icon-button sd-modern-info-button" icon variant="text" :aria-label="t('title')">
        <v-icon aria-hidden="true">info_outline</v-icon>
        <v-tooltip activator="parent" location="top" open-on-focus open-on-click content-class="sd-modern-tooltip text-start">{{ t('intro') }}</v-tooltip>
      </v-btn>
    </figcaption>
    <div class="b-vendor-payout-flow__legend">
      <span><i class="b-vendor-payout-flow__line-key b-vendor-payout-flow__line-key--routing" aria-hidden="true" />{{ t('routing_legend') }}</span>
      <span><i class="b-vendor-payout-flow__line-key" aria-hidden="true" />{{ t('funds_legend') }}</span>
      <span><i class="b-vendor-payout-flow__line-key b-vendor-payout-flow__line-key--ledger" aria-hidden="true" />{{ t('ledger_legend') }}</span>
    </div>
    <div class="b-vendor-payout-flow__diagram">
      <ol class="b-vendor-payout-flow__journey">
        <li v-for="(node, index) in orderNodes" :key="node.key">
          <button type="button" class="b-vendor-payout-flow__node" :class="{ 'b-vendor-payout-flow__node--highlighted': highlighted(node.stage) }" :aria-current="highlighted(node.stage) ? 'location' : undefined" :data-stage="node.stage">
            <span v-if="highlighted(node.stage)" class="b-vendor-payout-flow__highlight no-inv" aria-hidden="true" />
            <span class="b-vendor-payout-flow__identity">
              <img v-if="node.image" :src="node.image" alt="" width="24" height="24" />
              <v-icon v-else size="22" aria-hidden="true">{{ node.icon }}</v-icon>
              <v-icon class="b-vendor-payout-flow__help-mark" size="16" aria-hidden="true">info_outline</v-icon>
            </span>
            <span class="b-vendor-payout-flow__node-title">{{ t(node.key + '_title') }}</span>
            <span class="b-vendor-payout-flow__caption">{{ t(node.key + '_caption') }}</span>
            <span v-if="node.context" class="b-vendor-payout-flow__context" dir="auto">{{ node.context }}</span>
            <v-tooltip activator="parent" location="top" open-on-focus open-on-click content-class="sd-modern-tooltip text-start">{{ t(node.key + '_help') }}</v-tooltip>
          </button>
          <div v-if="index < orderNodes.length - 1" class="b-vendor-payout-flow__connector" :class="index === 2 ? 'b-vendor-payout-flow__connector--ledger' : 'b-vendor-payout-flow__connector--routing'" :style="{ '--flow-delay': `${index * .3}s` }">
            <svg viewBox="0 0 56 32" aria-hidden="true" focusable="false">
              <path class="b-vendor-payout-flow__wire" d="M2 16H52" />
              <path class="b-vendor-payout-flow__travel" pathLength="1" d="M2 16H52" />
              <path class="b-vendor-payout-flow__arrow" d="m48 12 4 4-4 4" />
            </svg>
            <v-btn class="sd-modern-icon-button sd-modern-info-button" icon variant="text" :aria-label="t(node.connection.replace('_help', '_label'))">
              <v-icon aria-hidden="true">info_outline</v-icon>
              <v-tooltip activator="parent" location="top" open-on-focus open-on-click content-class="sd-modern-tooltip text-start">{{ t(node.connection) }}</v-tooltip>
            </v-btn>
          </div>
        </li>
      </ol>
      <div class="b-vendor-payout-flow__settlement">
        <span class="b-vendor-payout-flow__return-head" aria-hidden="true">
          <svg viewBox="0 0 12 8" focusable="false" aria-hidden="true"><path d="m2 6 4-4 4 4" /></svg>
        </span>
        <span class="b-vendor-payout-flow__return-loop" aria-hidden="true" />
        <span class="b-vendor-payout-flow__return-source" aria-hidden="true" />
        <div class="b-vendor-payout-flow__branch">
          <div class="b-vendor-payout-flow__branch-heading">
            <h3 class="b-vendor-payout-flow__routes-title">{{ t('routes_title') }}</h3>
            <v-btn class="sd-modern-icon-button sd-modern-info-button" icon variant="text" :aria-label="t('settlement_label')">
              <v-icon aria-hidden="true">info_outline</v-icon>
              <v-tooltip activator="parent" location="top" open-on-focus open-on-click content-class="sd-modern-tooltip text-start">{{ t('settlement_help') }}</v-tooltip>
            </v-btn>
          </div>
          <span class="b-vendor-payout-flow__branch-rail" aria-hidden="true" />
          <span v-for="side in ['first', 'second']" :key="side" class="b-vendor-payout-flow__branch-drop" :class="`b-vendor-payout-flow__branch-drop--${side}`" aria-hidden="true">
            <svg viewBox="0 0 12 8" focusable="false" aria-hidden="true"><path d="m2 2 4 4 4-4" /></svg>
          </span>
        </div>
        <div class="b-vendor-payout-flow__routes">
          <section v-for="route in settlementRoutes" :key="route.key" class="b-vendor-payout-flow__route">
            <svg class="b-vendor-payout-flow__route-entry" viewBox="0 0 24 12" focusable="false" aria-hidden="true"><path d="M0 6H22m-4-4 4 4-4 4" /></svg>
            <header class="b-vendor-payout-flow__route-heading">
              <div><h4>{{ t(route.key + '_title') }}</h4><p>{{ t(route.key + '_condition') }}</p></div>
              <v-btn class="sd-modern-icon-button sd-modern-info-button" icon variant="text" :aria-label="t(route.key + '_label')">
                <v-icon aria-hidden="true">info_outline</v-icon>
                <v-tooltip activator="parent" location="top" open-on-focus open-on-click content-class="sd-modern-tooltip text-start">{{ t(route.key + '_help') }} <template v-if="route.key === 'manual'">{{ t('manual_note') }}</template></v-tooltip>
              </v-btn>
            </header>
            <ol class="b-vendor-payout-flow__pair">
              <li v-for="(node, index) in route.nodes" :key="node.key">
                <button type="button" class="b-vendor-payout-flow__node" :class="{ 'b-vendor-payout-flow__node--highlighted': highlighted(node.stage) }" :aria-current="highlighted(node.stage) ? 'location' : undefined" :data-stage="node.stage">
                  <span v-if="highlighted(node.stage)" class="b-vendor-payout-flow__highlight no-inv" aria-hidden="true" />
                  <span class="b-vendor-payout-flow__identity">
                    <img v-if="node.image" :src="node.image" alt="" width="46" height="24" />
                    <v-icon v-else size="22" aria-hidden="true">{{ node.icon }}</v-icon>
                    <v-icon class="b-vendor-payout-flow__help-mark" size="16" aria-hidden="true">info_outline</v-icon>
                  </span>
                  <span class="b-vendor-payout-flow__node-title">{{ t(node.key + '_title') }}</span>
                  <v-tooltip activator="parent" location="top" open-on-focus open-on-click content-class="sd-modern-tooltip text-start">{{ t(node.key + '_caption') }}. {{ t(node.key + '_help') }}</v-tooltip>
                </button>
                <div v-if="index === 0" class="b-vendor-payout-flow__connector" :class="{ 'b-vendor-payout-flow__connector--ledger': route.key === 'manual' }" :style="{ '--flow-delay': route.key === 'auto' ? '1.2s' : '1.5s' }">
                  <svg viewBox="0 0 56 32" aria-hidden="true" focusable="false">
                    <path class="b-vendor-payout-flow__wire" d="M2 16H52" />
                    <path class="b-vendor-payout-flow__travel" pathLength="1" d="M2 16H52" />
                    <path class="b-vendor-payout-flow__arrow" d="m48 12 4 4-4 4" />
                  </svg>
                  <v-btn class="sd-modern-icon-button sd-modern-info-button" icon variant="text" :aria-label="t(route.connection.replace('_help', '_label'))">
                    <v-icon aria-hidden="true">info_outline</v-icon>
                    <v-tooltip activator="parent" location="top" open-on-focus open-on-click content-class="sd-modern-tooltip text-start">{{ t(route.connection) }}</v-tooltip>
                  </v-btn>
                </div>
              </li>
            </ol>
            <div v-if="route.key === 'auto'" class="b-vendor-payout-flow__bank-note">
              <v-icon size="18" aria-hidden="true">account_balance</v-icon><span>{{ t('stripe_bank_title') }}</span>
              <v-btn class="sd-modern-icon-button sd-modern-info-button" icon variant="text" :aria-label="t('stripe_bank_label')">
                <v-icon aria-hidden="true">info_outline</v-icon>
                <v-tooltip activator="parent" location="top" open-on-focus open-on-click content-class="sd-modern-tooltip text-start">{{ t('stripe_bank_help') }}</v-tooltip>
              </v-btn>
            </div>
            <p v-else class="b-vendor-payout-flow__manual-note">{{ t('manual_summary') }}</p>
          </section>
        </div>
        <div class="b-vendor-payout-flow__result">
          <svg class="b-vendor-payout-flow__merge" viewBox="0 0 100 28" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path d="M25 0v8q0 5 5 5h40q5 0 5-5V0M50 13v13" /></svg>
          <svg class="b-vendor-payout-flow__merge-arrow" viewBox="0 0 12 8" aria-hidden="true" focusable="false"><path d="m2 2 4 4 4-4" /></svg>
          <svg class="b-vendor-payout-flow__straight" viewBox="0 0 44 32" aria-hidden="true" focusable="false"><path d="M22 0v28m-4-4 4 4 4-4" /></svg>
          <button type="button" class="b-vendor-payout-flow__node b-vendor-payout-flow__result-node" :class="{ 'b-vendor-payout-flow__node--highlighted': highlighted('payout') }" :aria-current="highlighted('payout') ? 'location' : undefined" data-stage="payout">
            <span v-if="highlighted('payout')" class="b-vendor-payout-flow__highlight no-inv" aria-hidden="true" />
            <v-icon size="23" aria-hidden="true">receipt_long</v-icon>
            <span><span class="b-vendor-payout-flow__node-title">{{ t('result_title') }}</span><span class="b-vendor-payout-flow__caption">{{ t('result_caption') }}</span></span>
            <v-icon class="b-vendor-payout-flow__help-mark" size="16" aria-hidden="true">info_outline</v-icon>
            <v-tooltip activator="parent" location="top" open-on-focus open-on-click content-class="sd-modern-tooltip text-start">{{ t('result_help') }} {{ t('result_note') }}</v-tooltip>
          </button>
        </div>
      </div>
    </div>
    <footer class="b-vendor-payout-flow__footer">
      <p>{{ t('context_hint') }}</p>
      <v-btn class="sd-modern-button sd-modern-button--inline" variant="text" prepend-icon="history">
        {{ t('adjustments_title') }}
        <v-tooltip activator="parent" location="top" open-on-focus open-on-click content-class="sd-modern-tooltip text-start">{{ t('adjustments_help') }}</v-tooltip>
      </v-btn>
    </footer>
  </figure>
</template>

<script lang="ts">
import StripeLogo from "../../../../assets/trademark/stripe.svg";

const stages = ["order", "fulfillment", "collection", "wallet", "stripe", "bank", "manual", "payout", "transactions"];

export default {
  name: "BVendorPayoutPods",
  props: {
    shop: { type: Object, required: true },
    vendor: { type: Object, default: null },
    activeStage: { type: String, default: null, validator: value => value === null || stages.includes(value) },
    // Retain existing callers' presentation/highlight props during gradual adoption.
    modern: Boolean,
    highlightWallet: Boolean,
    highlightPayout: Boolean,
    highlightTransactions: Boolean,
  },
  computed: {
    currentStage() {
      return this.activeStage ?? (this.highlightWallet ? "wallet" : this.highlightPayout ? "payout" : this.highlightTransactions ? "transactions" : null);
    },
    orderNodes() {
      return [
        { key: "order", stage: "order", icon: "shopping_bag", connection: "split_help" },
        { key: "fulfillment", stage: "fulfillment", icon: "inventory_2", connection: "collection_link_help" },
        { key: "collection", stage: "collection", icon: "storefront", context: this.shop.title, image: this.shop.icon ? this.getShopImagePath(this.shop.icon, 64) : null, connection: "credit_help" },
        { key: "wallet", stage: "wallet", icon: "account_balance_wallet", context: this.vendor?.name },
      ];
    },
    settlementRoutes() {
      return [
        { key: "auto", connection: "stripe_transfer_help", nodes: [
          { key: "stripe_source", stage: "collection", image: StripeLogo },
          { key: "stripe_account", stage: "stripe", image: StripeLogo },
        ] },
        { key: "manual", connection: "bank_record_link_help", nodes: [
          { key: "external", stage: "bank", icon: "account_balance" },
          { key: "record", stage: "manual", icon: "edit_note" },
        ] },
      ];
    },
  },
  methods: {
    t(key) { return this.$t(`vendor_money_flow.${key}`); },
    highlighted(stage) {
      return this.currentStage === stage || (this.currentStage === "transactions" && (stage === "wallet" || stage === "payout"));
    },
  },
};
</script>

<style scoped lang="scss">
.b-vendor-payout-flow {
  container-type: inline-size;
  margin: 0;
  color: rgb(var(--v-theme-on-surface));
  font-family: inherit;
  font-size: 13px;
  line-height: 20px;
  --flow-wire: rgba(var(--v-theme-on-surface), .28);
  --flow-branch: rgba(var(--v-theme-on-surface), .42);
  --flow-return-gutter: 32px;

  &__intro { display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: center; gap: 2px 12px; > .sd-modern-eyebrow { grid-column: 1; } > p { grid-column: 1; max-width: 820px; margin: 0; font-size: 14px; line-height: 22px; } > .v-btn { grid-column: 2; grid-row: 1 / span 2; } }
  &__legend { display: flex; gap: 8px 24px; flex-wrap: wrap; margin-block: 10px 14px; color: var(--sd-modern-muted, rgba(var(--v-theme-on-surface), .66)); > span { display: flex; align-items: center; gap: 8px; } }
  &__line-key { width: 25px; border-block-start: 1.5px solid var(--flow-wire); }
  &__line-key--ledger { border-block-start-style: dashed; }
  &__line-key--routing { border-block-start-style: dotted; }
  &__diagram { padding-inline-end: var(--flow-return-gutter); }
  // Bottom anchors stay aligned as cards grow; the return means accounting, not returned funds.
  &__settlement { position: relative; padding-block-end: 28px; }
  &__return-head { position: absolute; inset-inline-start: calc(87.5% + 45px); inset-inline-end: calc(-1 * var(--flow-return-gutter)); top: 0; height: 16px; border-inline-start: 1.5px dashed var(--flow-branch); border-block-end: 1.5px dashed var(--flow-branch); border-end-start-radius: 8px; pointer-events: none;
    > svg { position: absolute; inset-inline-start: -6.75px; top: -2px; width: 12px; height: 8px; fill: none; stroke: var(--flow-branch); stroke-width: 1.5; stroke-linecap: round; stroke-linejoin: round; }
  }
  &__return-loop { position: absolute; inset-inline-start: calc(50% + 8px); inset-inline-end: calc(-1 * var(--flow-return-gutter)); top: 16px; bottom: 14px; border-inline-end: 1.5px dashed var(--flow-branch); border-block-end: 1.5px dashed var(--flow-branch); border-end-end-radius: 8px; pointer-events: none; }
  &__return-source { position: absolute; inset-inline-start: 50%; bottom: 14px; width: 8px; height: 14px; border-inline-start: 1.5px dashed var(--flow-branch); border-block-end: 1.5px dashed var(--flow-branch); border-end-start-radius: 8px; pointer-events: none; }
  &__journey, &__pair { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 56px; margin: 0; padding: 0; list-style: none; > li { position: relative; min-width: 0; display: flex; } }
  &__node { position: relative; z-index: 1; box-sizing: border-box; display: grid; flex: 1; grid-template-columns: 26px minmax(0, 1fr) 16px; align-content: center; gap: 2px 8px; width: 100%; min-width: 0; min-height: 88px; padding: 12px; border: 1px solid var(--sd-modern-border, rgba(var(--v-theme-on-surface), .12)); border-radius: 14px; background: rgb(var(--v-theme-surface)); color: inherit; font: inherit; text-align: start; overflow-wrap: anywhere; cursor: help; }
  &__node:hover { background: rgb(var(--v-theme-surface)); }
  &__node:focus-visible { outline: 2px solid rgb(var(--v-theme-primary)); outline-offset: 3px; }
  &__highlight { position: absolute; inset: -1px; z-index: 1; border: 3px solid rgb(var(--v-theme-primary)); border-radius: inherit; pointer-events: none; }
  &__identity { display: contents; > img, > .v-icon:first-child { grid-column: 1; grid-row: 1 / span 2; align-self: start; object-fit: contain; } }
  &__help-mark { grid-column: 3; grid-row: 1; color: var(--sd-modern-muted, rgba(var(--v-theme-on-surface), .66)); }
  &__node > &__node-title { grid-column: 2; grid-row: 1; }
  &__node > &__caption { grid-column: 2; grid-row: 2; }
  &__node > &__context { grid-column: 2; grid-row: 3; }
  &__node-title { display: block; font-size: 14px; font-weight: 500; line-height: 22px; }
  &__caption { display: block; color: var(--sd-modern-muted, rgba(var(--v-theme-on-surface), .66)); font-size: 13px; font-weight: 400; line-height: 20px; }
  &__context { display: block; font-size: 13px; line-height: 20px; }
  &__connector { position: absolute; inset-inline-start: 100%; top: calc(50% - 22px); display: grid; place-items: center; width: 56px; height: 44px; > svg { position: absolute; inset: 6px 0; width: 56px; height: 32px; overflow: visible; fill: none; stroke: var(--flow-wire); stroke-width: 1.3; stroke-linecap: round; stroke-linejoin: round; } > .v-btn { background: rgb(var(--v-theme-surface)); z-index: 1; } }
  &[dir='rtl'] &__connector > svg { transform: scaleX(-1); }
  &__connector--ledger .b-vendor-payout-flow__wire { stroke-dasharray: 5 4; }
  &__connector--routing .b-vendor-payout-flow__wire { stroke-dasharray: 1 4; }
  &__travel { stroke: rgb(var(--v-theme-on-surface)); stroke-dasharray: .14 1; stroke-dashoffset: 1; opacity: 0; animation: vendor-flow-travel 1.2s ease var(--flow-delay, 0s) 1 both; }
  // The shared rail connects the wallet debt to alternative settlement methods, not provider funds.
  &__branch { position: relative; box-sizing: border-box; min-height: 68px; padding-block: 10px 26px; }
  &__branch-heading { display: flex; align-items: center; gap: 8px; max-width: calc(75% - 28px); > .v-btn { flex: 0 0 auto; } }
  &__routes-title { margin: 0; font-size: 14px; font-weight: 500; line-height: 22px; }
  &__branch-rail { position: absolute; inset-inline-start: calc(25% - 4px); inset-inline-end: calc(12.5% - 21px); top: 0; height: 44px; border-inline-end: 1.5px dashed var(--flow-branch); border-block-end: 1.5px dashed var(--flow-branch); border-end-end-radius: 8px; pointer-events: none; }
  &__branch-drop { position: absolute; top: 44px; bottom: 0; border-inline-start: 1.5px dashed var(--flow-branch); pointer-events: none; > svg { position: absolute; inset-inline-start: -6.75px; bottom: -2px; width: 12px; height: 8px; fill: none; stroke: var(--flow-branch); stroke-width: 1.5; stroke-linecap: round; stroke-linejoin: round; } }
  &__branch-drop--first { inset-inline-start: calc(25% - 4px); }
  &__branch-drop--second { inset-inline-start: calc(75% + 4px); }
  &__routes { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; align-items: stretch; }
  &__route { position: relative; min-width: 0; display: grid; grid-template-rows: subgrid; grid-row: span 3; gap: 10px; padding: 14px; border-radius: 16px; background: var(--sd-modern-inset, rgba(var(--v-theme-on-surface), .025)); }
  &__route-entry { display: none; }
  &__route-heading { display: flex; align-items: flex-start; gap: 8px; justify-content: space-between; h4 { margin: 0; font-size: 14px; font-weight: 500; line-height: 22px; } p { margin: 2px 0 0; color: var(--sd-modern-muted, rgba(var(--v-theme-on-surface), .66)); font-size: 13px; line-height: 20px; } }
  &__pair { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 56px; .b-vendor-payout-flow__node { grid-template-columns: minmax(0, 1fr) 16px; min-height: 88px; .b-vendor-payout-flow__identity > img, .b-vendor-payout-flow__identity > .v-icon:first-child { grid-column: 1; grid-row: 1; } .b-vendor-payout-flow__help-mark { grid-column: 2; grid-row: 1; } .b-vendor-payout-flow__node-title { grid-column: 1 / -1; grid-row: 2; } } }
  &__bank-note { display: flex; align-items: flex-start; gap: 8px; min-width: 0; color: var(--sd-modern-muted, rgba(var(--v-theme-on-surface), .66)); > .v-icon { margin-block-start: 3px; flex: 0 0 auto; } > .v-btn { flex: 0 0 auto; margin-inline-start: auto; } }
  &__manual-note { margin: 0; color: var(--sd-modern-muted, rgba(var(--v-theme-on-surface), .66)); font-size: 13px; line-height: 20px; }
  &__result { position: relative; padding-block-start: 4px; > svg { display: block; width: 100%; height: 32px; stroke: var(--flow-wire); stroke-width: 1.3; fill: none; path { vector-effect: non-scaling-stroke; } } > .b-vendor-payout-flow__merge-arrow { position: absolute; inset-inline-start: calc(50% - 6px); top: 28px; width: 12px; height: 8px; } > .b-vendor-payout-flow__straight { display: none; } }
  &__result-node { display: flex; max-width: 560px; min-height: 68px; margin-inline: auto; flex-direction: row; align-items: center; gap: 12px; > span:not(.b-vendor-payout-flow__highlight) { min-width: 0; } .b-vendor-payout-flow__help-mark { margin-inline-start: auto; } .b-vendor-payout-flow__caption { margin-block-start: 3px; } }
  &__footer { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px 20px; margin-block-start: 12px; > p { margin: 0; max-width: 650px; color: var(--sd-modern-muted, rgba(var(--v-theme-on-surface), .66)); font-size: 13px; line-height: 20px; } > .v-btn { gap: 7px; font-size: 13px; } }
}

@container (max-width: 760px) {
  .b-vendor-payout-flow {
    &__return-head { inset-inline-start: calc(25% + 10px); }
    &__journey { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 56px;
      > li:nth-child(3) { grid-column: 2; grid-row: 2; > .b-vendor-payout-flow__connector { inset-inline-start: auto; inset-inline-end: 100%; > svg { transform: scaleX(-1); } } }
      > li:nth-child(4) { grid-column: 1; grid-row: 2; }
      > li:nth-child(2) > .b-vendor-payout-flow__connector { inset-inline-start: calc(50% - 28px); top: 100%; height: 56px; > svg { inset: 12px 0; transform: rotate(90deg); } }
    }
    &[dir='rtl'] &__journey > li:nth-child(3) > .b-vendor-payout-flow__connector > svg { transform: none; }
    &[dir='rtl'] &__journey > li:nth-child(2) > .b-vendor-payout-flow__connector > svg { transform: rotate(90deg); }
    &__branch { padding-block: 22px 12px; }
    &__branch-heading { max-width: none; margin-inline-start: 32px; }
    &__branch-rail { inset-inline-start: 8px; inset-inline-end: calc(75% + 14px); height: 12px; }
    &__branch-drop--first { inset-inline-start: 8px; top: 12px; > svg { display: none; } }
    &__branch-drop--second { display: none; }
    &__routes { grid-template-columns: minmax(0, 1fr); gap: 16px; padding-inline-start: 32px; }
    &__route { grid-template-rows: auto; grid-row: auto;
      &::before { content: ''; position: absolute; inset-inline-start: -24px; top: 0; bottom: -16px; border-inline-start: 1.5px dashed var(--flow-branch); }
      &:last-child::before { bottom: auto; height: 22px; }
    }
    &__route-entry { display: block; position: absolute; inset-inline-start: -24px; top: 16px; width: 24px; height: 12px; fill: none; stroke: var(--flow-branch); stroke-width: 1.5; stroke-linecap: round; stroke-linejoin: round; }
    &[dir='rtl'] &__route-entry { transform: scaleX(-1); }
    &__result > .b-vendor-payout-flow__merge, &__result > .b-vendor-payout-flow__merge-arrow { display: none; }
    &__result > .b-vendor-payout-flow__straight { display: block; width: 44px; margin-inline: auto; }
  }
}

@container (max-width: 460px) {
  .b-vendor-payout-flow {
    &__return-head { inset-inline-start: calc(50% + 24px); }
    &__branch-rail { inset-inline-end: 50%; }
    &__journey { grid-template-columns: minmax(0, 1fr); gap: 64px; > li:nth-child(n) { grid-column: auto; grid-row: auto; } }
    &__journey > li:nth-child(n) > .b-vendor-payout-flow__connector { inset-inline-start: calc(50% - 28px); inset-inline-end: auto; top: 100%; height: 64px; > svg { inset: 16px auto auto; inset-inline-start: -4px; width: 64px; transform: rotate(90deg); } }
    &[dir='rtl'] &__journey > li:nth-child(n) > .b-vendor-payout-flow__connector > svg { transform: rotate(90deg); }
    &__node { display: grid; grid-template-columns: 40px minmax(0, 1fr) 16px; align-content: center; gap: 4px 10px; min-height: 94px; padding: 14px;
      .b-vendor-payout-flow__identity { display: contents; > img, > .v-icon:first-child { grid-column: 1; grid-row: 1 / span 2; align-self: start; } }
      .b-vendor-payout-flow__help-mark { grid-column: 3; grid-row: 1; margin: 0; }
      .b-vendor-payout-flow__node-title { grid-column: 2; grid-row: 1; }
      > .b-vendor-payout-flow__caption { grid-column: 2; grid-row: 2; }
      > .b-vendor-payout-flow__context { grid-column: 2; grid-row: 3; }
    }
    &__pair { grid-template-columns: minmax(0, 1fr); gap: 64px;
      .b-vendor-payout-flow__node { grid-template-columns: 40px minmax(0, 1fr) 16px; padding: 14px; min-height: 72px;
        .b-vendor-payout-flow__identity > img, .b-vendor-payout-flow__identity > .v-icon:first-child { grid-column: 1; grid-row: 1; }
        .b-vendor-payout-flow__help-mark { grid-column: 3; grid-row: 1; }
        .b-vendor-payout-flow__node-title { grid-column: 2; grid-row: 1; }
      }
      .b-vendor-payout-flow__connector { inset-inline-start: calc(50% - 28px); top: 100%; height: 64px; > svg { inset: 16px auto auto; inset-inline-start: -4px; width: 64px; transform: rotate(90deg); } }
    }
    &[dir='rtl'] &__pair .b-vendor-payout-flow__connector > svg { transform: rotate(90deg); }
    &__result-node { display: flex; flex-direction: row; .b-vendor-payout-flow__help-mark { margin-inline-start: auto; } }
    &__route { padding: 14px; }
    &__footer { align-items: flex-start; }
  }
}

@keyframes vendor-flow-travel {
  0% { opacity: 0; stroke-dashoffset: 1; }
  15%, 75% { opacity: .55; }
  100% { opacity: 0; stroke-dashoffset: 0; }
}
@media (prefers-reduced-motion: reduce) {
  .b-vendor-payout-flow__travel { animation: none; opacity: 0; }
}
</style>
