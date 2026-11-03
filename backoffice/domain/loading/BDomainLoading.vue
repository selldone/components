<template>
  <section
    class="sd-modern-widget b-domain-loading text-start"
    :aria-busy="busy"
  >
    <header class="b-domain-loading__heading">
      <v-icon size="18" aria-hidden="true">hourglass_empty</v-icon>
      <div>
        <h2>{{ t("title") }}</h2>
        <p>{{ t("subtitle") }}</p>
      </div>
    </header>
    <v-progress-linear
      v-if="busy"
      class="b-domain-loading__progress"
      indeterminate
      color="primary"
      :aria-label="$t('global.commons.loading')"
    />
    <p v-if="external">{{ t("external") }}</p>
    <template v-else>
      <div v-if="error" class="sd-modern-notice" role="alert">
        <v-icon size="18" color="error" aria-hidden="true"
          >error_outline</v-icon
        >
        <div class="sd-modern-notice__content">{{ error }}</div>
      </div>
      <p v-if="saved" class="b-domain-loading__feedback" role="status">
        {{ t("saved") }}
      </p>
      <v-btn
        v-if="failed"
        variant="text"
        color="primary"
        class="sd-modern-button sd-modern-button--inline"
        :disabled="busy || disabled"
        @click="load"
        >{{ $t("global.actions.retry") }}</v-btn
      >
      <template v-if="loaded">
        <p v-if="summary?.supported !== true" role="status">
          {{ t("unavailable") }}
        </p>
        <div
          v-else-if="summary.reason === 'invalid_configuration'"
          class="b-domain-loading__recovery"
        >
          <p role="status">{{ t("invalid_configuration") }}</p>
          <v-btn
            v-if="!readOnly && summary.mode !== 'default'"
            variant="text"
            color="primary"
            class="sd-modern-button sd-modern-button--inline"
            :disabled="!editable || busy"
            @click="save(true)"
            >{{ t("restore_default") }}</v-btn
          >
        </div>
        <u-smart-switch
          :model-value="mode === 'custom'"
          :disabled="!editable || busy"
          :true-title="t('custom')"
          :true-description="t('custom_hint')"
          :false-title="t('default')"
          :false-description="t('default_hint')"
          true-icon="code"
          false-icon="hourglass_empty"
          border
          accessible
          class="sd-modern-smart-select b-domain-loading__mode"
          @update:model-value="setMode"
        />
        <div v-show="mode === 'custom'" class="b-domain-loading__fields">
          <p>{{ t("code_hint") }}</p>
          <v-textarea
            v-model="head"
            :label="t('head')"
            :readonly="!editable"
            :disabled="busy"
            :error-messages="headError"
            rows="5"
            variant="underlined"
            spellcheck="false"
            dir="ltr"
            class="sd-modern-underlined-field b-domain-loading__source"
          />
          <p class="b-domain-loading__counter">
            {{ t("bytes", { size: bytes(head), limit: limits.head_bytes }) }}
          </p>
          <v-textarea
            v-model="body"
            :label="t('body')"
            :readonly="!editable"
            :disabled="busy"
            :error-messages="bodyError"
            rows="6"
            variant="underlined"
            spellcheck="false"
            dir="ltr"
            class="sd-modern-underlined-field b-domain-loading__source"
          />
          <p class="b-domain-loading__counter">
            {{ t("bytes", { size: bytes(body), limit: limits.body_bytes }) }}
          </p>
        </div>
        <div
          v-if="!readOnly"
          class="sd-modern-actions b-domain-loading__actions"
        >
          <v-btn
            color="primary"
            variant="flat"
            prepend-icon="save"
            class="sd-modern-button sd-modern-button--primary"
            :disabled="!canSave"
            :loading="saving"
            @click="save()"
            >{{ $t("global.actions.save_changes") }}</v-btn
          >
          <v-btn
            v-if="dirty"
            variant="text"
            class="sd-modern-button"
            :disabled="busy"
            @click="discard"
            >{{ t("discard") }}</v-btn
          >
        </div>
        <div v-if="guide" class="b-domain-loading__guide">
          <div class="b-domain-loading__guide-heading">
            <div>
              <h3>{{ t("guide_title") }}</h3>
              <p>{{ t("guide_hint") }}</p>
            </div>
            <v-btn
              variant="text"
              color="primary"
              prepend-icon="content_copy"
              class="sd-modern-button sd-modern-button--inline"
              @click="copyToClipboard(guide)"
              >{{ t("copy_ai") }}</v-btn
            >
          </div>
          <details>
            <summary>{{ t("technical_details") }}</summary>
            <pre dir="ltr">{{ guide }}</pre>
          </details>
        </div>
      </template>
    </template>
  </section>
</template>

<script lang="ts">
import USmartSwitch from "../../../ui/smart/switch/USmartSwitch.vue";

const DEFAULT_LIMITS = { head_bytes: 15 * 1024, body_bytes: 3 * 1024 };
// Match native HTTP TrimStrings, including Laravel's invisible edge characters.
const CODE_EDGE_SPACE = String.raw`[\s\x00\u0085\u00ad\u034f\u061c\u115f\u1160\u17b4\u17b5\u180e\u200b-\u200f\u2060-\u2065\u206a-\u206f\u2800\u3164\uffa0\u{1d159}\u{1d173}-\u{1d17a}\u{e0020}]`;
const TRIM_CODE_EDGES = new RegExp(
  `^${CODE_EDGE_SPACE}+|${CODE_EDGE_SPACE}+$`,
  "gu",
);

export default {
  name: "BDomainLoading",
  components: { USmartSwitch },
  props: {
    shop: { type: Object, required: true },
    item: { type: Object, required: true },
    active: { type: Boolean, default: false },
    readOnly: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
  },
  emits: ["saved", "state"],
  data: () => ({
    loaded: false,
    busy: false,
    saving: false,
    failed: false,
    error: "",
    saved: false,
    mode: "default",
    head: "",
    body: "",
    baseline: null,
    summary: null,
    limits: { ...DEFAULT_LIMITS },
    guide: "",
    request: 0,
  }),
  computed: {
    resourceKey() {
      return `${this.shop.id}:${this.item.domain?.id}`;
    },
    external() {
      return !!this.item.domain?.externally_hosted;
    },
    editable() {
      return (
        this.loaded &&
        !this.readOnly &&
        !this.disabled &&
        !this.external &&
        this.summary?.supported === true
      );
    },
    dirty() {
      return (
        this.loaded &&
        !!this.baseline &&
        ["mode", "head", "body"].some(
          (field) => this[field] !== this.baseline[field],
        )
      );
    },
    headError() {
      return this.mode !== "custom" && this.head === this.baseline?.head
        ? ""
        : this.validateCode(this.head, this.limits.head_bytes);
    },
    bodyError() {
      if (this.mode !== "custom" && this.body === this.baseline?.body)
        return "";
      return (
        this.validateCode(this.body, this.limits.body_bytes) ||
        (this.mode === "custom" && !this.body.trim()
          ? this.t("body_required")
          : "")
      );
    },
    canSave() {
      return (
        this.editable &&
        !this.busy &&
        this.dirty &&
        !this.headError &&
        !this.bodyError
      );
    },
  },
  watch: {
    disabled(value) {
      if (!value && this.active && !this.loaded && !this.busy) this.load();
    },
    active: {
      immediate: true,
      handler(value) {
        if (value && !this.loaded && !this.busy) this.load();
      },
    },
    resourceKey() {
      this.request++;
      this.loaded = false;
      this.busy = false;
      this.saving = false;
      this.failed = false;
      this.error = "";
      this.saved = false;
      this.baseline = null;
      this.summary = null;
      this.mode = "default";
      this.head = "";
      this.body = "";
      this.guide = "";
      if (this.active) this.load();
    },
    dirty() {
      this.emitState();
      this.saved = false;
    },
    busy() {
      this.emitState();
    },
  },
  beforeUnmount() {
    this.request++;
  },
  methods: {
    t(key, values = {}) {
      return this.$t(`domains_modern.loading.${key}`, values);
    },
    bytes(value) {
      return new TextEncoder().encode(value).byteLength;
    },
    normalized(value) {
      return value.replace(TRIM_CODE_EDGES, "");
    },
    validSummary(value) {
      return (
        !!value &&
        typeof value.supported === "boolean" &&
        typeof value.has_code === "boolean" &&
        ["default", "custom", null].includes(value.mode) &&
        ["head_bytes", "body_bytes"].every(
          (field) =>
            value[field] === null ||
            (Number.isInteger(value[field]) &&
              value[field] >= 0 &&
              value[field] <= DEFAULT_LIMITS[field]),
        ) &&
        (value.updated_at === null ||
          (typeof value.updated_at === "string" &&
            value.updated_at.length <= 64)) &&
        [
          null,
          "builtin",
          "externally_hosted",
          "migration_required",
          "invalid_configuration",
        ].includes(value.reason)
      );
    },
    validateCode(value, limit) {
      if (this.bytes(value) > limit) return this.t("too_large", { limit });
      return value.includes("\0") ||
        /\bdata\s*:(?:[a-z0-9.+-]+\/[a-z0-9.+-]+|;|,)|\bbase64\s*,/i.test(value)
        ? this.t("invalid_code")
        : "";
    },
    emitState() {
      this.$emit("state", { dirty: this.dirty, busy: this.busy });
    },
    setMode(custom) {
      if (this.editable && !this.busy && typeof custom === "boolean")
        this.mode = custom ? "custom" : "default";
    },
    discard() {
      if (this.busy || !this.baseline) return;
      Object.assign(this, this.baseline);
      this.error = "";
      this.saved = false;
    },
    async load() {
      if (this.busy || this.disabled || this.external || !this.item.domain?.id)
        return;
      const request = ++this.request,
        key = this.resourceKey;
      this.busy = true;
      this.error = "";
      this.failed = false;
      try {
        const { data } = await axios.get(
          window.API.GET_DOMAIN_LOADING(this.shop.id, this.item.domain.id),
          { params: { include_code: true } },
        );
        if (request !== this.request || key !== this.resourceKey) return;
        if (
          !this.validSummary(data?.loading_summary) ||
          typeof data.implementation_guide !== "string" ||
          !data.limits ||
          Object.keys(DEFAULT_LIMITS).some(
            (field) =>
              !Number.isInteger(data.limits[field]) ||
              data.limits[field] < 1 ||
              data.limits[field] > DEFAULT_LIMITS[field],
          ) ||
          (data.code !== null &&
            (!data.code ||
              typeof data.code.head !== "string" ||
              typeof data.code.body !== "string"))
        )
          throw Error();
        this.summary = data.loading_summary;
        this.mode =
          data.loading_summary.mode === "custom" ? "custom" : "default";
        this.head = data.code?.head || "";
        this.body = data.code?.body || "";
        this.limits = data.limits;
        this.guide = data.implementation_guide;
        this.baseline = { mode: this.mode, head: this.head, body: this.body };
        this.loaded = true;
      } catch {
        if (request === this.request && key === this.resourceKey) {
          this.error = this.t("load_failed");
          this.failed = true;
        }
      } finally {
        if (request === this.request && key === this.resourceKey)
          this.busy = false;
      }
    },
    async save(reset = false) {
      if (reset === true ? !this.editable || this.busy : !this.canSave) return;
      const payload =
        reset === true
          ? { mode: "default" }
          : this.summary.reason === "invalid_configuration"
            ? { mode: this.mode, head: this.head, body: this.body }
            : Object.fromEntries(
                ["mode", "head", "body"]
                  .filter((field) => this[field] !== this.baseline[field])
                  .map((field) => [field, this[field]]),
              );
      const request = ++this.request,
        key = this.resourceKey;
      this.busy = true;
      this.saving = true;
      this.saved = false;
      this.error = "";
      try {
        const { data } = await axios.post(
          window.API.POST_DOMAIN_LOADING(this.shop.id, this.item.domain.id),
          payload,
        );
        if (
          request !== this.request ||
          key !== this.resourceKey ||
          this.readOnly ||
          this.disabled ||
          this.external
        )
          return;
        if (
          data?.success !== true ||
          data.domain?.id !== this.item.domain.id ||
          !this.validSummary(data.loading_summary) ||
          data.loading_summary.supported !== true ||
          !["default", "custom"].includes(data.loading_summary.mode) ||
          (payload.mode && data.loading_summary.mode !== payload.mode) ||
          (data.loading_summary.mode === "custom" &&
            !data.loading_summary.has_code) ||
          ["head", "body"].some(
            (field) =>
              field in payload &&
              data.loading_summary[field + "_bytes"] !==
                this.bytes(this.normalized(payload[field])),
          )
        )
          throw Error();
        this.summary = data.loading_summary;
        this.mode = data.loading_summary.mode;
        for (const field of ["head", "body"])
          if (field in payload) this[field] = this.normalized(payload[field]);
        this.baseline = {
          mode: this.mode,
          head: "head" in payload ? this.head : this.baseline.head,
          body: "body" in payload ? this.body : this.baseline.body,
        };
        this.$emit("saved", data);
        this.$nextTick(() => {
          if (request === this.request && key === this.resourceKey)
            this.saved = true;
        });
      } catch {
        if (request === this.request && key === this.resourceKey)
          this.error = this.t("save_failed");
      } finally {
        if (request === this.request && key === this.resourceKey) {
          this.busy = false;
          this.saving = false;
        }
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.b-domain-loading {
  position: relative;
  &__heading {
    display: flex;
    align-items: flex-start;
    gap: 13px;
    margin-bottom: 24px;
  }
  &__heading > .v-icon {
    margin-top: 3px;
    color: var(--sd-modern-muted);
  }
  h2 {
    font: inherit;
    font-size: 15px;
    font-weight: 500;
    line-height: 24px;
    margin: 0;
  }
  h3 {
    font: inherit;
    font-size: 14px;
    font-weight: 500;
    line-height: 22px;
    margin: 0;
  }
  p {
    margin: 4px 0 0;
    font-size: 13px;
    line-height: 21px;
    color: var(--sd-modern-muted);
  }
  &__progress {
    position: absolute;
    inset: 0 0 auto;
  }
  &__mode {
    margin-top: 20px;
  }
  &__fields {
    margin-top: 24px;
  }
  &__fields > p:first-child {
    margin-bottom: 18px;
  }
  &__source :deep(textarea) {
    font:
      13px/20px ui-monospace,
      monospace;
  }
  &__counter {
    text-align: end;
    margin-bottom: 20px !important;
  }
  &__actions {
    margin-top: 24px;
    flex-wrap: wrap;
  }
  &__guide {
    margin-top: 28px;
    padding-top: 20px;
    border-top: 1px solid var(--sd-modern-border);
  }
  &__guide-heading {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;
  }
  details {
    margin-top: 16px;
  }
  summary {
    cursor: pointer;
    font-size: 13px;
    line-height: 22px;
  }
  summary:focus-visible {
    outline: 2px solid rgb(var(--v-theme-primary));
    outline-offset: 4px;
  }
  pre {
    font:
      13px/20px ui-monospace,
      monospace;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
    margin: 16px 0 0;
    padding: 14px;
    border-radius: 8px;
    background: var(--sd-modern-inset);
    color: rgb(var(--v-theme-on-surface));
  }
  &__feedback {
    margin-bottom: 16px;
  }
  @media (max-width: 480px) {
    &__source :deep(textarea) {
      font-size: 16px;
    }
  }
}
</style>
