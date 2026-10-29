<template>
  <section v-if="active" class="flow-checkout-form-preview text-start">
    <div class="flow-checkout-form-preview__heading">
      <h3>
        {{ $t("shop_configuration.flow_modern.form.focused.preview_title") }}
      </h3>
      <span>{{ countryLabel }}</span>
    </div>
    <p class="flow-checkout-form-preview__hint">
      {{ $t("shop_configuration.flow_modern.form.focused.preview_hint") }}
    </p>
    <div class="flow-checkout-form-preview__window">
      <div class="flow-checkout-form-preview__chrome">
        <v-icon icon="shopping_bag" size="14" aria-hidden="true" /><span>{{
          $t("global.commons.checkout")
        }}</span
        ><v-icon
          class="flow-checkout-form-preview__lock"
          icon="lock_outline"
          size="12"
          aria-hidden="true"
        />
      </div>
      <div class="flow-checkout-form-preview__body">
        <div class="flow-checkout-form-preview__order">
          <span class="flow-checkout-form-preview__product"
            ><v-icon icon="inventory_2" size="18" aria-hidden="true"
          /></span>
          <div>
            <strong>{{
              $t("shop_configuration.flow_modern.form.focused.your_order")
            }}</strong
            ><span>{{
              $t("shop_configuration.flow_modern.form.focused.order_summary")
            }}</span>
          </div>
          <span
            class="flow-checkout-form-preview__summary-line"
            aria-hidden="true"
          />
        </div>
        <h3>
          {{
            $t("shop_configuration.flow_modern.form.focused.additional_details")
          }}
        </h3>
        <v-form ref="previewForm" @submit.prevent="validatePreview">
          <p v-if="!form.length" class="flow-checkout-form-preview__empty">
            {{
              $t("shop_configuration.flow_modern.form.focused.preview_empty")
            }}
          </p>
          <div
            v-for="(field, index) in form"
            :key="index"
            class="flow-checkout-form-preview__field"
          >
            <div
              v-if="field.type === 'note'"
              class="flow-checkout-form-preview__note"
              v-html="sanitizePreviewNote(field.title)"
            />
            <v-text-field
              v-else-if="!field.type || field.type === 'text'"
              v-model="answers[answerKey(field, index)]"
              class="sd-modern-underlined-field"
              :label="fieldLabel(field)"
              :placeholder="
                $t(
                  'shop_configuration.flow_modern.form.focused.answer_placeholder',
                )
              "
              :messages="field.hint || ''"
              :rules="field.required ? [requiredAnswer] : []"
              :aria-required="!!field.required"
              persistent-placeholder
              variant="underlined"
              hide-details="auto"
            />
            <v-select
              v-else-if="field.type === 'select'"
              v-model="answers[answerKey(field, index)]"
              class="sd-modern-underlined-field"
              :items="field.selects || []"
              :label="fieldLabel(field)"
              :multiple="!!field.multiple"
              :chips="!!field.multiple"
              :placeholder="
                $t(
                  'shop_configuration.flow_modern.form.focused.select_placeholder',
                )
              "
              :messages="field.hint || ''"
              :rules="field.required ? [requiredAnswer] : []"
              :aria-required="!!field.required"
              persistent-placeholder
              variant="underlined"
              hide-details="auto"
            />
            <u-smart-switch
              v-else-if="field.type === 'switch'"
              v-model="answers[answerKey(field, index)]"
              class="flow-checkout-form-preview__switch"
              :label="fieldLabel(field)"
              :true-title="$t('global.actions.yes')"
              :false-title="$t('global.actions.no')"
              :true-description="field.hint_true"
              :false-description="field.hint_false"
              true-icon="check"
              false-icon="close"
              accessible
            />
          </div>
          <v-btn
            class="sd-modern-button flow-checkout-form-preview__continue"
            color="primary"
            variant="flat"
            type="submit"
            append-icon="arrow_forward"
            >{{
              $t("shop_configuration.flow_modern.form.focused.continue_payment")
            }}</v-btn
          >
          <p class="flow-checkout-form-preview__feedback" role="status">
            {{ feedback }}
          </p>
        </v-form>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import { FORM_BUILDER_TAGS } from "@selldone/core-js/helper/html/HtmlHelper";
import USmartSwitch from "@selldone/components-vue/ui/smart/switch/USmartSwitch.vue";

export function sanitizePreviewNote(value) {
  const message = String(value ?? "");
  if (typeof document === "undefined")
    return message.replace(
      /[&<>"']/g,
      (character) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[character],
    );
  // Template contents stay inert until their tags and attributes have been filtered.
  const template = document.createElement("template");
  template.innerHTML = message;
  const allowedTags = new Set(FORM_BUILDER_TAGS);
  const blockedTags = new Set([
    "script",
    "style",
    "iframe",
    "object",
    "embed",
    "template",
    "base",
    "meta",
    "link",
  ]);
  const safeUrl = (value, allowMail = false) => {
    if (!value || /[\u0000-\u001f\u007f]/.test(value)) return null;
    try {
      const url = new URL(value, document.baseURI);
      if (url.username || url.password) return null;
      if (
        !["http:", "https:", ...(allowMail ? ["mailto:"] : [])].includes(
          url.protocol,
        )
      )
        return null;
      return url.href;
    } catch {
      return null;
    }
  };
  for (const element of Array.from(template.content.querySelectorAll("*"))) {
    const tag = element.tagName.toLowerCase();
    if (
      blockedTags.has(tag) ||
      element.namespaceURI !== "http://www.w3.org/1999/xhtml"
    ) {
      element.remove();
      continue;
    }
    if (!allowedTags.has(tag)) {
      element.replaceWith(...element.childNodes);
      continue;
    }
    const title = element.getAttribute("title");
    const href =
      tag === "a" ? safeUrl(element.getAttribute("href"), true) : null;
    const src = tag === "img" ? safeUrl(element.getAttribute("src")) : null;
    const alt = element.getAttribute("alt") || "";
    for (const attribute of Array.from(element.attributes))
      element.removeAttribute(attribute.name);
    if (title) element.setAttribute("title", title);
    if (href) {
      element.setAttribute("href", href);
      element.setAttribute("target", "_blank");
      element.setAttribute("rel", "noopener noreferrer nofollow");
      element.setAttribute("referrerpolicy", "no-referrer");
    }
    if (tag === "img") {
      if (!src) {
        element.replaceWith(document.createTextNode(alt));
        continue;
      }
      element.setAttribute("src", src);
      element.setAttribute("alt", alt);
      element.setAttribute("referrerpolicy", "no-referrer");
      element.setAttribute("loading", "lazy");
    }
  }
  const textNodes = [];
  const walker = document.createTreeWalker(template.content, 4);
  while (walker.nextNode()) textNodes.push(walker.currentNode);
  for (const node of textNodes) {
    if (
      !/[\r\n]/.test(node.textContent) ||
      node.parentElement?.closest("pre, code")
    )
      continue;
    const lines = node.textContent.split(/\r?\n/);
    const fragment = document.createDocumentFragment();
    lines.forEach((line, index) => {
      if (index) fragment.append(document.createElement("br"));
      fragment.append(document.createTextNode(line));
    });
    node.replaceWith(fragment);
  }
  return template.innerHTML;
}

export default {
  name: "BShopCheckoutFormPreview",
  components: { USmartSwitch },
  props: {
    form: { type: Array, default: () => [] },
    countryLabel: { type: String, default: "" },
    active: { type: Boolean, default: true },
  },
  data: () => ({ answers: {} as Record<string, unknown>, feedback: "" }),
  watch: {
    form: {
      immediate: true,
      deep: true,
      handler(fields) {
        const answers = {};
        (fields || []).forEach((field, index) => {
          answers[this.answerKey(field, index)] =
            field.type === "switch"
              ? !!field.default
              : field.type === "select" && field.multiple
                ? []
                : "";
        });
        this.answers = answers;
        this.feedback = "";
      },
    },
  },
  methods: {
    sanitizePreviewNote,
    answerKey(field, index) {
      return field.name || `draft-field-${index}`;
    },
    fieldLabel(field) {
      return `${field.title || this.$t("shop_configuration.flow_modern.form.untitled")}${field.required ? " *" : ""}`;
    },
    requiredAnswer(value) {
      const present = Array.isArray(value)
        ? value.length > 0
        : value === false ||
          value === true ||
          (value !== undefined &&
            value !== null &&
            String(value).trim().length > 0);
      return (
        present ||
        this.$t("shop_configuration.flow_modern.form.focused.answer_required")
      );
    },
    async validatePreview() {
      this.feedback = "";
      const result = await this.$refs.previewForm.validate();
      if (result.valid)
        this.feedback = this.$t(
          "shop_configuration.flow_modern.form.focused.preview_ready",
        );
    },
  },
};
</script>

<style lang="scss" scoped>
.flow-checkout-form-preview {
  width: 100%;
  max-width: 410px;
  margin-inline: auto;
  color: rgb(var(--v-theme-on-surface));
  font-family: inherit;
  font-size: 12px;
  font-weight: 400;
  line-height: 1.5;
  &__heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    flex-wrap: wrap;
  }
  &__heading h3 {
    margin: 0;
    font-size: 13px;
    font-weight: 500;
    line-height: 1.5;
  }
  &__heading > span,
  &__hint,
  &__empty,
  &__feedback {
    color: var(--sd-modern-muted);
    font-size: 11px;
    line-height: 1.5;
  }
  &__hint {
    margin: 7px 0 17px;
  }
  &__window {
    overflow: hidden;
    border: 1px solid var(--sd-modern-border);
    border-radius: 14px;
    background: rgb(var(--v-theme-surface));
  }
  &__chrome {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 13px 16px;
    border-block-end: 1px solid var(--sd-modern-border);
    background: var(--sd-modern-inset);
    font-size: 12px;
    font-weight: 500;
  }
  &__chrome > .v-icon {
    width: 14px;
    height: 14px;
    color: var(--sd-modern-muted);
    font-size: 14px !important;
  }
  &__chrome > .flow-checkout-form-preview__lock {
    width: 12px;
    height: 12px;
    margin-inline-start: auto;
    font-size: 12px !important;
  }
  &__body {
    padding: 18px 16px;
  }
  &__order {
    display: flex;
    align-items: center;
    gap: 9px;
    margin-block-end: 18px;
    padding-block-end: 18px;
    border-block-end: 1px solid var(--sd-modern-border);
  }
  &__product {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 34px;
    width: 34px;
    height: 34px;
    border-radius: 8px;
    background: var(--sd-modern-inset);
    color: var(--sd-modern-muted);
  }
  &__product > .v-icon {
    font-size: 18px !important;
  }
  &__order strong,
  &__order > div > span {
    display: block;
    font-size: 11px;
    font-weight: 500;
    line-height: 1.5;
  }
  &__order > div > span {
    margin-block-start: 3px;
    color: var(--sd-modern-muted);
    font-weight: 400;
  }
  &__summary-line {
    width: 30px;
    height: 4px;
    margin-inline-start: auto;
    border-radius: 2px;
    background: var(--sd-modern-border);
  }
  &__body h3 {
    margin: 0 0 18px;
    font-size: 13px;
    font-weight: 500;
    line-height: 1.5;
  }
  &__field {
    min-width: 0;
    margin-block-end: 18px;
  }
  &__empty {
    margin-block-end: 22px;
  }
  &__field :deep(.v-field__input) {
    font-size: 12px;
  }
  &__field :deep(.v-messages) {
    font-size: 11px;
    line-height: 1.5;
  }
  &__switch :deep(h3) {
    margin: 0 0 8px;
    font-size: 12px;
    font-weight: 500;
    line-height: 1.5;
  }
  &__switch :deep(.row-hover) {
    padding: 9px 12px !important;
    background: var(--sd-modern-inset) !important;
  }
  &__switch :deep(b) {
    font-size: 12px;
    font-weight: 500;
    line-height: 1.5;
  }
  &__switch :deep(.small) {
    font-size: 11px;
    line-height: 1.5;
  }
  &__note {
    color: var(--sd-modern-muted);
    font-size: 12px;
    line-height: 1.6;
    overflow-wrap: anywhere;
  }
  &__note :deep(img) {
    max-width: 100%;
    height: auto;
  }
  &__note :deep(a) {
    color: rgb(var(--v-theme-primary));
  }
  &__note :deep(h1),
  &__note :deep(h2),
  &__note :deep(h3),
  &__note :deep(h4),
  &__note :deep(h5) {
    margin-block: 10px 6px;
    font-weight: 500;
    line-height: 1.4;
  }
  &__note :deep(h1) {
    font-size: 22px;
  }
  &__note :deep(h2) {
    font-size: 20px;
  }
  &__note :deep(h3) {
    font-size: 18px;
  }
  &__note :deep(h4) {
    font-size: 16px;
  }
  &__note :deep(h5) {
    font-size: 14px;
  }
  &__note :deep(ul),
  &__note :deep(ol) {
    margin-block: 6px;
    padding-inline-start: 20px;
  }
  &__note :deep(ul) {
    list-style-type: disc;
  }
  &__note :deep(ol) {
    list-style-type: decimal;
  }
  &__note :deep(hr) {
    margin-block: 10px;
    border: 0;
    border-block-start: 1px solid var(--sd-modern-border);
  }
  &__note :deep(pre) {
    white-space: pre-wrap;
  }
  &__continue.sd-modern-button {
    width: 100%;
    min-height: 38px;
    height: auto;
    margin-block-start: 6px;
    padding: 0 14px;
    font-size: 12px;
    font-weight: 500;
    line-height: 1.5;
  }
  &__feedback {
    margin: 9px 0 0;
  }
  &:dir(rtl) &__continue :deep(.v-btn__append .v-icon) {
    transform: rotate(180deg);
  }
  @media (max-width: 480px), (pointer: coarse) {
    &__field :deep(.v-field__input) {
      font-size: 16px;
    }
    &__continue.sd-modern-button {
      min-height: 44px;
    }
  }
}
</style>
