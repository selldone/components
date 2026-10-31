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
  <div :class="{ 'b-product-edit-features--modern text-start': modern }">
    <div v-if="modern && IS_VENDOR_PANEL" class="sd-modern-notice b-product-edit-features__vendor-note" role="note">
      <b-product-edit-info-icon name="Info" :size="17" class="sd-modern-notice__icon" />
      <span>{{ $t('add_product.features_modern.vendor_managed') }}</span>
    </div>
    <!-- ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄ Rating Fields ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄ -->
    <b-product-rating-input :product="product" :modern="modern" :read-only="IS_VENDOR_PANEL" :class="modern ? undefined : ['my-5', { disabled: IS_VENDOR_PANEL }]">
    </b-product-rating-input>

    <!-- ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄ Pros ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄ -->
    <b-product-pros-input :product="product" :modern="modern" :read-only="IS_VENDOR_PANEL" :class="modern ? undefined : ['mb-5', { disabled: IS_VENDOR_PANEL }]">
    </b-product-pros-input>

    <!-- ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄ Cons ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄ -->
    <b-product-cons-input :product="product" :modern="modern" :read-only="IS_VENDOR_PANEL" :class="modern ? undefined : ['mb-5', { disabled: IS_VENDOR_PANEL }]">
    </b-product-cons-input>

    <!-- ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄ Badges ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄ -->
    <b-product-badges-manage :product="product" :modern="modern"></b-product-badges-manage>

    <!-- ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄ Tags ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄ -->
    <b-product-tags-input :product="product" :modern="modern"></b-product-tags-input>

    <footer v-if="modern && !externalActionButtons" class="b-product-edit-features__footer">
      <p><b-product-edit-info-icon name="CloudCheck" :size="16" /><span>{{ $t('add_product.features_modern.save_hint') }}</span></p>
      <v-btn class="sd-modern-button sd-modern-button--primary b-product-edit-features__continue" color="primary" variant="elevated" @click="$emit('next')" v-ctrl.s="() => $emit('next')" aria-keyshortcuts="Control+s">
        {{ $t('global.actions.continue') }}
        <template #append><b-product-edit-info-icon name="ArrowRight" :size="16" /></template>
      </v-btn>
    </footer>
    <s-widget-buttons v-else-if="!externalActionButtons" auto-fixed-position class="mb-5 mt-12">
      <v-btn
        color="primary"
        size="x-large"
        variant="elevated"
        @click="$emit('next')"
        v-ctrl.s="()=>{$emit('next')}"
      >
        {{ $t("global.actions.continue") }}

        <v-icon class="ms-2" size="small">
          {{ $t("icons.arrow_end") }}
        </v-icon>
      </v-btn>
    </s-widget-buttons>
  </div>
</template>

<script lang="ts">
import BProductBadgesManage from "../../../product/badges/manage/BProductBadgesManage.vue";
import BProductTagsInput from "../../../product/tags/input/BProductTagsInput.vue";
import BProductRatingInput from "../../../product/rating/input/BProductRatingInput.vue";
import BProductProsInput from "../../../product/pros/input/BProductProsInput.vue";
import BProductConsInput from "../../../product/cons/input/BProductConsInput.vue";
import SWidgetButtons from "../../../../ui/widget/buttons/SWidgetButtons.vue";
import BProductEditInfoIcon from "../info/BProductEditInfoIcon.vue";

export default {
  name: "BProductEditFeatures",
  components: {
    BProductEditInfoIcon,
    SWidgetButtons,
    BProductConsInput,
    BProductProsInput,
    BProductRatingInput,
    BProductTagsInput,
    BProductBadgesManage,
  },
  emits: ["next"],
  props: {
    modern: {
      type: Boolean,
      default: false,
    },
    externalActionButtons: {
      type: Boolean,
      default: false,
    },
    product: {
      required: true,
      type: Object,
    },
  },

  data: () => ({
    tags: null,
  }),

  computed: {
    IS_VENDOR_PANEL() {
      /*🟢 Vendor Panel 🟢*/
      return (
        this.$route.params.vendor_id &&
        this.$route.matched.some((record) => record.meta.vendor)
      );
    },
  },

  methods: {},
  created() {},
};
</script>

<style lang="scss" scoped>
.b-product-edit-features--modern {
  width: 100%;
  max-width: 760px;
  margin-inline: auto;
  font-family: inherit;
  font-size: 14px;
  line-height: 21px;
  color: rgb(var(--v-theme-on-surface));

  // Each existing editor keeps its requests and local draft inside its own disclosure.
  :deep(.b-product-edit-features__panel) {
    width: 100%;
    max-width: none;
    padding: 0;
    margin: 0 0 14px !important;
    border: 1px solid var(--sd-modern-border);
    border-radius: 16px;
    background: rgb(var(--v-theme-surface)) !important;
    color: inherit;
    box-shadow: none;
    overflow: visible;
  }

  :deep(.b-product-edit-features__summary) {
    box-sizing: border-box;
    display: flex;
    align-items: center;
    gap: 12px;
    min-height: 84px;
    padding: 20px 23px;
    border-radius: 16px;
    list-style: none;

    &::-webkit-details-marker { display: none; }
    > svg { flex: 0 0 auto; color: var(--sd-modern-muted); }
  }

  :deep(.b-product-edit-features__summary-title) {
    display: block;
    margin: 0;
    font-size: 14px;
    font-weight: 500;
    line-height: 21px;
    text-transform: none;
  }

  :deep(.b-product-edit-features__summary-copy) { flex: 1; min-width: 0; }
  :deep(.b-product-edit-features__chevron) { flex: 0 0 auto; color: var(--sd-modern-muted); }
  :deep(.b-product-edit-features__panel[open] > .b-product-edit-features__summary .b-product-edit-features__chevron) { transform: rotate(180deg); }

  :deep(.b-product-edit-features__digest) {
    display: block;
    margin-block-start: 3px;
    color: var(--sd-modern-muted);
    font-size: 12px;
    font-weight: 400;
    line-height: 18px;
    overflow-wrap: anywhere;
    unicode-bidi: plaintext;
  }

  :deep(.b-product-edit-features__count) {
    color: var(--sd-modern-muted);
    font-size: 11px;
    font-weight: 400;
    line-height: 18px;
    white-space: nowrap;
    font-variant-numeric: tabular-nums;
  }

  :deep(.b-product-edit-features__panel[open] > .b-product-edit-features__summary) {
    min-height: 69px;
    padding-block-end: 12px;

    .b-product-edit-features__summary-title { font-size: 16px; line-height: 24px; letter-spacing: -0.15px; }
    .b-product-edit-features__digest { display: none; }
  }

  :deep(.b-product-edit-features__panel-content) { padding: 0 23px 23px; }
  :deep(.b-product-edit-features__intro) { margin-block: 0 17px; color: var(--sd-modern-muted); font-size: 12px; line-height: 19px; }
  :deep(.v-input) { min-width: 0; margin: 0 !important; }
  // Legacy content-box defaults otherwise add padding to the shared field and row heights.
  :deep(.v-field__input),
  :deep(.b-product-rating-input__row) { box-sizing: border-box; }
  :deep(.v-input__details) { padding-inline: 0; font-size: 12px; line-height: 19px; }
  :deep(.v-field-label--floating) { color: var(--sd-modern-muted); font-size: 12px; font-weight: 400; line-height: 18px; }
  :deep(.sd-modern-button) { font-family: inherit; font-size: 13px; font-weight: 500; line-height: 20px; }
  :deep(.sd-modern-icon-button:not(.sd-modern-info-button)) { width: 32px; height: 32px; min-height: 32px; padding: 0; }
  :deep(.sd-modern-info-button) { box-sizing: border-box; flex-shrink: 0; }
  :deep(.sd-modern-icon-button .v-icon) { font-size: 16px; }
  :deep(.v-alert) { background: var(--sd-modern-inset) !important; color: rgb(var(--v-theme-on-surface)) !important; }

  .b-product-edit-features__footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;
    margin-block: 25px 15px;

    > p { display: flex; align-items: center; gap: 7px; margin: 0; color: var(--sd-modern-muted); font-size: 12px; line-height: 19px; }
    > .v-btn { min-height: 42px; padding-inline: 16px; }
  }

  .b-product-edit-features__vendor-note { display: flex; align-items: flex-start; gap: 9px; margin-block-end: 14px; font-size: 13px; line-height: 20px; }
  &:dir(rtl) .b-product-edit-features__continue :deep(.v-btn__append svg) { transform: scaleX(-1); }

  @media (max-width: 600px) {
    :deep(.b-product-edit-features__summary) { padding: 18px; gap: 10px; }
    :deep(.b-product-edit-features__panel-content) { padding: 0 18px 20px; }
    .b-product-edit-features__footer { align-items: flex-start; }
    .b-product-edit-features__footer > p { max-width: 180px; }
  }
  @media (max-width: 680px), (pointer: coarse) {
    :deep(.sd-modern-icon-button:not(.sd-modern-info-button)) { width: 44px; height: 44px; min-height: 44px; }
    .b-product-edit-features__footer > .v-btn { min-height: 44px; }
  }
}
</style>
