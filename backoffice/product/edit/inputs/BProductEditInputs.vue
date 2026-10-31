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
  <div :class="modern ? 'b-product-edit-inputs--modern text-start' : undefined">
    <template v-if="modern">
      <p v-if="add_by_dropShipping" class="sd-modern-notice b-product-edit-inputs__inherited"><b-product-edit-info-icon name="Info" :size="17" class="sd-modern-notice__icon" /><span class="sd-modern-notice__content">{{ $t('add_product.inputs_modern.inherited') }}</span></p>
      <details class="sd-modern-widget sd-modern-disclosure b-product-edit-inputs__instructions" :open="instructionsOpen" @toggle="instructionsOpen = $event.target.open">
        <summary class="sd-modern-disclosure__summary" @pointerenter="measureInstructions" @focus="measureInstructions">
          <b-product-edit-info-icon name="MessageSquareText" />
          <span class="b-product-edit-inputs__summary-copy"><span class="b-product-edit-inputs__summary-title">{{ $t('add_product.inputs_modern.instructions') }}</span><span v-if="!instructionsOpen" ref="instructionsDigest" class="b-product-edit-inputs__digest">{{ product.message || $t('add_product.inputs_modern.no_instructions') }}</span></span>
          <b-product-edit-info-icon name="ChevronDown" :size="16" class="b-product-edit-inputs__chevron" />
          <v-tooltip activator="parent" :disabled="instructionsOpen || !instructionsClipped" location="top" :open-on-click="true" content-class="sd-modern-tooltip text-start">{{ product.message }}</v-tooltip>
        </summary>
        <div class="b-product-edit-inputs__instructions-body">
          <div class="b-product-edit-inputs__intro"><p>{{ $t('add_product.inputs_modern.instructions_intro') }}</p><v-btn class="sd-modern-icon-button sd-modern-info-button" icon variant="text" :aria-label="$t('add_product.inputs_modern.instructions_about')"><b-product-edit-info-icon name="Info" :size="16" /><v-tooltip activator="parent" location="top" :open-on-click="true" content-class="sd-modern-tooltip text-start">{{ $t('add_product.inputs_modern.instructions_help') }}</v-tooltip></v-btn></div>
          <v-textarea v-model="message" class="sd-modern-underlined-field" :disabled="readOnly" :label="$t('add_product.inputs_modern.your_instructions')" :messages="$t('add_product.inputs_modern.instructions_hint')" :counter="true" persistent-counter persistent-placeholder placeholder=" " auto-grow rows="3" variant="underlined" />
        </div>
      </details>

      <section class="sd-modern-widget b-product-edit-inputs__fields">
        <s-form-builder ref="builder" v-model:structure="inputs" modern focused compact has-file :read-only="readOnly" :title="$t('add_product.inputs_modern.fields')" :hint="$t('add_product.inputs_modern.fields_intro')" @dialog-change="arrangeOpen = $event">
          <template #toolbar-actions>
            <v-btn ref="previewButton" class="sd-modern-button sd-modern-button--inline" color="primary" variant="text" :disabled="!!busy" @click="previewOpen = true"><template #prepend><b-product-edit-info-icon name="Eye" :size="16" /></template>{{ $t('add_product.inputs_modern.preview') }}</v-btn>
            <v-btn class="sd-modern-icon-button sd-modern-info-button" icon variant="text" :aria-label="$t('add_product.inputs_modern.fields_about')"><b-product-edit-info-icon name="Info" :size="16" /><v-tooltip activator="parent" location="top" :open-on-click="true" content-class="sd-modern-tooltip text-start">{{ $t('add_product.inputs_modern.fields_help') }}</v-tooltip></v-btn>
          </template>
        </s-form-builder>
      </section>
      <footer class="b-product-edit-inputs__footer">
        <div class="b-product-edit-inputs__status"><p role="status" aria-live="polite"><b-product-edit-info-icon :name="hasUnsavedChanges ? 'Circle' : 'CircleCheck'" :size="16" />{{ $t(hasUnsavedChanges ? 'add_product.inputs_modern.unsaved' : 'add_product.inputs_modern.saved') }}</p><small>{{ $t('add_product.inputs_modern.save_scope') }}</small></div>
        <div class="b-product-edit-inputs__actions">
          <v-btn class="sd-modern-button sd-modern-button--inline" variant="text" :disabled="readOnly || !hasUnsavedChanges || saveBlocked" @click="discardChanges">{{ $t('add_product.inputs_modern.discard') }}</v-btn>
          <v-btn v-if="!externalActionButtons" class="sd-modern-button sd-modern-button--primary" color="primary" variant="elevated" :loading="!!busy" :disabled="saveBlocked" aria-keyshortcuts="Control+s" @click="submit" v-ctrl.s="submit"><template #prepend><b-product-edit-info-icon name="Save" :size="16" /></template>{{ $t('global.actions.save_continue') }}<template #append><b-product-edit-info-icon name="ArrowRight" :size="16" class="b-product-edit-inputs__direction" /></template></v-btn>
        </div>
      </footer>
      <b-product-inputs-preview v-model="previewOpen" :product="product" />
    </template>
    <template v-else>
    <div class="widget-box mb-5 mt-5">
      <u-widget-header
        :title="$t('add_product.inputs_edit.title')"
        icon="feed"
      ></u-widget-header>
      <v-list-subheader
        >{{ $t("add_product.inputs_edit.sub_title") }}
      </v-list-subheader>

      <v-textarea
        v-model="product.message"
        :counter="256"
        :disabled="add_by_dropShipping"
        :label="$t('add_product.inputs_edit.message_input')"
        :messages="$t('add_product.inputs_edit.message_input_message')"
        auto-grow
        rows="3"
        variant="underlined"
      />
    </div>

    <s-form-builder
      v-if="product.inputs"
      v-model:structure="product.inputs"
      :class="{ disabled: add_by_dropShipping }"
      :title="$t('add_product.inputs_edit.inputs_form')"
      class="mb-5"
      has-file
      :hint="$t('add_product.inputs_edit.inputs_hint')"
      icon="input"
    />

    <s-widget-buttons v-if="!externalActionButtons" auto-fixed-position class="mt-8">
      <v-btn
        :loading="busy"
        color="primary"
        size="x-large"
        variant="elevated"
        @click="$emit('next')"
        v-ctrl.s="()=>{$emit('next')}"
      >
        {{ $t("global.actions.save_continue") }}

        <v-icon end>
          {{ $t("icons.arrow_end") }}
        </v-icon>
      </v-btn>
    </s-widget-buttons>
    </template>
  </div>
</template>

<script lang="ts">
import SFormBuilder from "../../../../ui/form/SFormBuilder.vue";
import SWidgetButtons from "../../../../ui/widget/buttons/SWidgetButtons.vue";
import BProductEditInfoIcon from "../info/BProductEditInfoIcon.vue";
import BProductInputsPreview from "./BProductInputsPreview.vue";

export default {
  name: "ProductEditInputs",
  components: { SWidgetButtons, SFormBuilder, BProductEditInfoIcon, BProductInputsPreview },
  emits: ["next"],
  props: {
    modern: { type: Boolean, default: false },
    externalActionButtons: {
      type: Boolean,
      default: false,
    },
    product: {
      required: true,
      type: Object,
    },
    busy: {},
  },

  data: () => ({
    savedSnapshot: "",
    instructionsOpen: false,
    instructionsClipped: false,
    previewOpen: false,
    arrangeOpen: false,
  }),
  computed: {
    add_by_dropShipping() {
      return !!this.product.parent_id;
    },
    readOnly() {
      return this.add_by_dropShipping || !!this.busy;
    },
    message: {
      get() { return this.product.message; },
      set(value) { if (!this.readOnly) this.product.message = value; },
    },
    inputs: {
      get() { return this.product.inputs || []; },
      set(value) { if (!this.readOnly) this.product.inputs = value; },
    },
    hasUnsavedChanges() {
      return this.savedSnapshot !== this.captureSnapshot();
    },
    saveBlocked() {
      return !!this.busy || this.previewOpen || this.arrangeOpen;
    },
  },
  watch: {
    previewOpen(open, previous) {
      if (!open && previous) this.$nextTick(() => this.$refs.previewButton?.$el?.focus());
    },
    'product.id'() {
      this.previewOpen = false;
      this.arrangeOpen = false;
      this.instructionsOpen = false;
      this.markSaved();
    },
  },
  created() { this.markSaved(); },
  methods: {
    measureInstructions() {
      const digest = this.$refs.instructionsDigest;
      this.instructionsClipped = !!digest && digest.scrollWidth > digest.clientWidth;
    },
    captureSnapshot() {
      return JSON.stringify({ message: this.product.message, inputs: this.product.inputs });
    },
    markSaved() { this.savedSnapshot = this.captureSnapshot(); },
    discardChanges() {
      if (this.readOnly || this.saveBlocked || !this.savedSnapshot) return;
      const saved = JSON.parse(this.savedSnapshot);
      this.product.message = saved.message;
      this.product.inputs = saved.inputs;
    },
    submit() {
      if (!this.saveBlocked) this.$emit('next');
    },
  },
};
</script>

<style lang="scss" scoped>
.b-product-edit-inputs--modern {
  inline-size: 100%; max-inline-size: 760px; margin-inline: auto; color: rgb(var(--v-theme-on-surface));
  font-size: 13px; line-height: 20px;
  .b-product-edit-inputs__instructions, .b-product-edit-inputs__fields { margin-block-end: 18px; }
  .b-product-edit-inputs__instructions { padding: 0; }
  .sd-modern-disclosure__summary { box-sizing: border-box; padding: 21px 23px; min-block-size: 84px; gap: 12px; }
  .b-product-edit-inputs__summary-copy { display: flex; flex: 1; flex-direction: column; min-inline-size: 0; gap: 3px; }
  .b-product-edit-inputs__summary-title { font-size: 14px; font-weight: 500; line-height: 21px; }
  .b-product-edit-inputs__digest { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--sd-modern-muted); font-size: 12px; line-height: 18px; }
  .b-product-edit-inputs__chevron { flex-shrink: 0; }
  details[open] > summary { min-block-size: 69px; padding-block-end: 12px; .b-product-edit-inputs__summary-title { font-size: 16px; line-height: 24px; } .b-product-edit-inputs__chevron { transform: rotate(180deg); } }
  .b-product-edit-inputs__instructions-body { padding: 0 23px 23px; }
  .b-product-edit-inputs__intro { display: flex; align-items: center; gap: 8px; margin-block-end: 17px; p { flex: 1; margin: 0; color: var(--sd-modern-muted); font-size: 12px; line-height: 19px; } }
  .b-product-edit-inputs__fields { padding: 23px; }
  .b-product-edit-inputs__inherited { display: flex; align-items: flex-start; gap: 9px; margin-block-end: 18px; svg { flex-shrink: 0; margin-block-start: 2px; } }
  .b-product-edit-inputs__footer { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 4px 0 10px; }
  .b-product-edit-inputs__status { min-inline-size: 0; p { display: flex; align-items: center; gap: 7px; margin: 0 0 3px; font-size: 12px; line-height: 19px; } small { display: block; color: var(--sd-modern-muted); font-size: 12px; line-height: 19px; } }
  .b-product-edit-inputs__actions { display: flex; align-items: center; flex-shrink: 0; gap: 9px; }
  .b-product-edit-inputs__actions > .v-btn { white-space: nowrap; }
  :deep(.sd-modern-button .v-btn__content) { font: inherit; font-size: 13px; font-weight: 500; line-height: 20px; }
  :deep(.sd-modern-underlined-field .v-field.v-field--variant-underlined .v-field__input) { font-family: inherit; font-size: 14px; line-height: 22px; }
  :deep(.v-label) { font-family: inherit; font-size: 12px; font-weight: 500; line-height: 19px; }
  :deep(.v-messages), :deep(.v-counter) { font-family: inherit; font-size: 12px; line-height: 19px; }
  &:dir(rtl) .b-product-edit-inputs__direction { transform: scaleX(-1); }
  @media (max-width: 600px) {
    .sd-modern-disclosure__summary { padding-inline: 19px; }
    .b-product-edit-inputs__instructions-body, .b-product-edit-inputs__fields { padding-inline: 19px; }
    .b-product-edit-inputs__footer { flex-wrap: wrap; }
    .b-product-edit-inputs__status { flex-basis: 100%; }
    .b-product-edit-inputs__actions { flex: 1 1 100%; flex-wrap: wrap; justify-content: flex-end; }
    :deep(.sd-modern-underlined-field .v-field.v-field--variant-underlined .v-field__input) { font-size: 16px; }
  }
  @media (max-width: 360px) {
    .sd-modern-disclosure__summary { padding-inline: 15px; }
    .b-product-edit-inputs__instructions-body, .b-product-edit-inputs__fields { padding-inline: 15px; }
    .b-product-edit-inputs__actions .sd-modern-button--primary { inline-size: 100%; }
  }
}
</style>
