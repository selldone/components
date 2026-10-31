<template>
  <v-dialog
    :model-value="modelValue"
    max-width="610"
    scrollable
    @update:model-value="updateVisibility"
  >
    <v-card class="b-product-inputs-preview sd-modern-widget text-start">
      <v-card-title class="b-product-inputs-preview__heading">
        <b-product-edit-info-icon name="Eye" />
        <h2>{{ $t('add_product.inputs_modern.preview_title') }}</h2>
        <v-btn
          class="sd-modern-icon-button"
          icon
          variant="text"
          :aria-label="$t('add_product.inputs_modern.close_preview')"
          @click="close"
        >
          <b-product-edit-info-icon name="X" :size="16" />
          <v-tooltip
            activator="parent"
            location="top"
            :open-on-focus="true"
            content-class="sd-modern-tooltip text-start"
          >{{ $t('add_product.inputs_modern.close_preview') }}</v-tooltip>
        </v-btn>
      </v-card-title>

      <v-card-text class="b-product-inputs-preview__body">
        <p class="b-product-inputs-preview__intro">{{ $t('add_product.inputs_modern.preview_intro') }}</p>
        <div class="b-product-inputs-preview__product">
          <v-avatar v-if="product.icon" :size="32" rounded="lg">
            <v-img :src="getShopImagePath(product.icon)" :alt="product.title || ''" />
          </v-avatar>
          <b-product-edit-info-icon v-else name="PackageOpen" />
          <span>{{ product.title }}</span>
        </div>

        <template v-if="hasContent">
          <div
            v-if="instructions"
            class="b-product-inputs-preview__instructions"
            v-html="sanitizeNote(instructions)"
          />
          <div
            v-for="(field, index) in fields"
            :key="index"
            class="b-product-inputs-preview__field"
          >
            <div
              v-if="field.type === 'note'"
              class="b-product-inputs-preview__note"
              v-html="sanitizeNote(field.title)"
            />
            <v-text-field
              v-else-if="!field.type || field.type === 'text'"
              v-model="answers[index]"
              :label="field.title"
              :placeholder="field.hint || ''"
              :persistent-placeholder="!!field.hint"
              hide-details="auto"
              variant="underlined"
              class="sd-modern-underlined-field"
            />
            <v-select
              v-else-if="field.type === 'select'"
              v-model="answers[index]"
              :label="field.title"
              :items="field.selects || []"
              :multiple="!!field.multiple"
              :chips="!!field.multiple"
              :placeholder="field.hint || ''"
              :persistent-placeholder="!!field.hint"
              hide-details="auto"
              variant="underlined"
              class="sd-modern-underlined-field"
            />
            <u-smart-switch
              v-else-if="field.type === 'switch'"
              v-model="answers[index]"
              :label="field.title"
              :true-title="$t('global.actions.yes')"
              :false-title="$t('global.actions.no')"
              :true-description="field.hint_true"
              :false-description="field.hint_false"
              true-icon="check"
              false-icon="close"
              accessible
              border
              class="sd-modern-smart-select"
            />
            <template v-else-if="field.type === 'file'">
              <p class="b-product-inputs-preview__file-label">{{ field.title }}</p>
              <div class="b-product-inputs-preview__file" aria-disabled="true">
                <b-product-edit-info-icon name="Upload" :size="22" />
                <span>{{ $t('add_product.inputs_modern.preview_file') }}<small>{{ $t('add_product.inputs_modern.preview_file_size') }}</small></span>
              </div>
              <p v-if="field.hint" class="b-product-inputs-preview__hint">{{ field.hint }}</p>
              <p class="b-product-inputs-preview__hint">{{ $t('add_product.inputs_modern.preview_file_hint') }}</p>
            </template>
          </div>
        </template>
        <div v-else class="b-product-inputs-preview__empty" role="status">
          <p>{{ $t('add_product.inputs_modern.preview_empty') }}</p>
          <p v-if="fields.some(field => field.type === 'note')" class="b-product-inputs-preview__hint">{{ $t('add_product.inputs_modern.preview_note_only') }}</p>
        </div>
      </v-card-text>

      <v-card-actions class="b-product-inputs-preview__actions">
        <p>{{ $t('add_product.inputs_modern.preview_only') }}</p>
        <v-btn class="sd-modern-button" variant="outlined" @click="close">{{ $t('add_product.inputs_modern.close_preview') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import BProductEditInfoIcon from "../info/BProductEditInfoIcon.vue";
import USmartSwitch from "../../../../ui/smart/switch/USmartSwitch.vue";
import { sanitizePreviewNote } from "../../../shop/options/checkout-form/preview/BShopCheckoutFormPreview.vue";

export default {
  name: "BProductInputsPreview",
  components: { BProductEditInfoIcon, USmartSwitch },
  emits: ["update:modelValue"],
  props: {
    product: { type: Object, required: true },
    modelValue: { type: Boolean, default: false },
  },
  data: () => ({ fields: [], instructions: "", answers: [] }),
  computed: {
    hasContent() {
      return !!this.instructions || this.fields.some(field => !field.type || ["text", "select", "switch", "file"].includes(field.type));
    },
  },
  watch: {
    modelValue: {
      immediate: true,
      handler(open) {
        if (open) this.openPreview();
        else this.clearPreview();
      },
    },
    "product.id"() {
      this.close();
    },
  },
  methods: {
    openPreview() {
      this.fields = JSON.parse(JSON.stringify(Array.isArray(this.product.inputs) ? this.product.inputs : []));
      this.instructions = this.product.message || "";
      this.answers = this.fields.map(field => field.type === "switch" ? !!field.default : field.type === "select" && field.multiple ? [] : field.default || "");
    },
    clearPreview() {
      this.fields = [];
      this.instructions = "";
      this.answers = [];
    },
    updateVisibility(open) {
      if (!open) this.clearPreview();
      this.$emit("update:modelValue", open);
    },
    close() {
      this.updateVisibility(false);
    },
    sanitizeNote(value) {
      const html = sanitizePreviewNote(value);
      if (typeof document === "undefined") return html;
      const template = document.createElement("template");
      template.innerHTML = html;
      // Preview content must not fetch merchant-supplied media or navigate away.
      template.content.querySelectorAll("img").forEach(image => image.replaceWith(document.createTextNode(image.getAttribute("alt") || "")));
      template.content.querySelectorAll("a").forEach(link => link.removeAttribute("href"));
      return template.innerHTML;
    },
  },
};
</script>

<style lang="scss" scoped>
.b-product-inputs-preview {
  padding: 0 !important;
  border-radius: 18px !important;
  color: rgb(var(--v-theme-on-surface));
  font-family: inherit;
  font-size: 14px;
  line-height: 21px;

  .b-product-inputs-preview__heading {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 23px 23px 19px;
    white-space: normal;
  }

  h2 { flex: 1; min-width: 0; margin: 0; font-family: inherit; font-size: 18px; font-weight: 500; line-height: 26px; }
  .b-product-inputs-preview__heading > svg { color: var(--sd-modern-muted); flex-shrink: 0; }
  .b-product-inputs-preview__body { padding: 0 23px 23px !important; }
  .b-product-inputs-preview__intro { margin: 0 0 19px; color: var(--sd-modern-muted); font-size: 13px; line-height: 21px; }
  .b-product-inputs-preview__product { display: flex; align-items: center; gap: 10px; min-width: 0; padding-block: 13px; margin-block-end: 18px; border-block-end: 1px solid var(--sd-modern-border); font-size: 13px; line-height: 20px; }
  .b-product-inputs-preview__product > span { min-width: 0; overflow-wrap: anywhere; }
  .b-product-inputs-preview__product > .v-avatar, .b-product-inputs-preview__product > svg { flex-shrink: 0; }
  .b-product-inputs-preview__instructions { margin-block-end: 21px; white-space: normal; overflow-wrap: anywhere; font-size: 13px; line-height: 21px; }
  .b-product-inputs-preview__field + .b-product-inputs-preview__field { margin-block-start: 24px; }
  .b-product-inputs-preview__field { min-width: 0; }
  .b-product-inputs-preview__note { overflow-wrap: anywhere; }
  .b-product-inputs-preview__note :deep(p) { margin: 0 0 12px; }
  .b-product-inputs-preview__file-label { margin: 0 0 8px; font-size: 13px; line-height: 20px; }
  .b-product-inputs-preview__file { display: flex; align-items: center; justify-content: center; gap: 10px; min-height: 84px; padding: 20px; border: 1px dashed var(--sd-modern-border); border-radius: 10px; background: var(--sd-modern-inset); color: var(--sd-modern-muted); font-size: 12px; line-height: 19px; }
  .b-product-inputs-preview__file small { display: block; font-size: 12px; line-height: 19px; margin-block-start: 3px; }
  .b-product-inputs-preview__hint { margin: 8px 0 0; color: var(--sd-modern-muted); font-size: 12px; line-height: 19px; }
  .b-product-inputs-preview__empty p { margin: 0; }
  .b-product-inputs-preview__actions { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; padding: 0 23px 23px; }
  .b-product-inputs-preview__actions > p { margin: 0; color: var(--sd-modern-muted); font-size: 12px; line-height: 19px; }
  .b-product-inputs-preview__actions > .v-btn { min-height: 42px; border-color: var(--sd-modern-border); font-size: 13px; line-height: 20px; }
  .sd-modern-icon-button { --sd-modern-icon-button-size: 32px; flex-shrink: 0; }
  .sd-modern-underlined-field { --sd-modern-field-height: 60px; }
  .sd-modern-underlined-field :deep(.v-field__input) { box-sizing: border-box; min-height: 60px; height: auto; padding-block: 24px 8px; font-size: 14px; line-height: 22px; }
  :deep(.v-field input), :deep(.v-field .v-label) { font-family: inherit; font-size: 14px; line-height: 22px; }

  @media (max-width: 640px), (pointer: coarse) {
    .b-product-inputs-preview__heading { padding: 19px 16px; }
    .b-product-inputs-preview__body { padding-inline: 16px !important; }
    .b-product-inputs-preview__actions { padding-inline: 16px; }
    .b-product-inputs-preview__actions > p { flex-basis: 100%; }
    .b-product-inputs-preview__actions > .v-btn { width: 100%; min-height: 44px; }
    .sd-modern-icon-button { --sd-modern-icon-button-size: 44px; }
    .sd-modern-underlined-field :deep(.v-field__input), :deep(.v-field input) { font-size: 16px; }
  }
}
</style>
