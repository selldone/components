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
          <section
            v-if="canPickSamples"
            class="b-domain-loading__samples"
            :aria-labelledby="fieldId('samples', 'title')"
          >
            <h3 :id="fieldId('samples', 'title')">{{ t("samples_title") }}</h3>
            <p>{{ t("samples_hint") }}</p>
            <div class="b-domain-loading__sample-grid">
              <div
                v-for="sample in samples"
                :key="sample.id"
                class="b-domain-loading__sample"
                :class="{
                  'b-domain-loading__sample--current':
                    sample.id === currentSampleId,
                }"
              >
                <div class="b-domain-loading__thumb">
                  <!-- Trusted sample code, still isolated: no scripts and no same-origin access. -->
                  <iframe
                    :srcdoc="
                      hoveredSample === sample.id ? sample.live : sample.still
                    "
                    sandbox=""
                    referrerpolicy="no-referrer"
                    loading="lazy"
                    tabindex="-1"
                    aria-hidden="true"
                  />
                </div>
                <div class="b-domain-loading__sample-meta">
                  <span>{{ t(`samples.${sample.id}`) }}</span>
                  <span>{{ t("sample_size", { size: sample.size }) }}</span>
                </div>
                <button
                  :id="fieldId('sample', sample.id)"
                  type="button"
                  class="b-domain-loading__pick"
                  :aria-label="
                    t('use_sample', { name: t(`samples.${sample.id}`) })
                  "
                  :aria-pressed="sample.id === currentSampleId"
                  :disabled="!editable || busy"
                  @click="pickSample(sample.id)"
                  @mouseenter="hoveredSample = sample.id"
                  @mouseleave="hoveredSample = null"
                  @focus="hoveredSample = sample.id"
                  @blur="hoveredSample = null"
                />
                <v-icon
                  v-if="sample.id === currentSampleId"
                  class="b-domain-loading__tick"
                  size="20"
                  aria-hidden="true"
                  >check_circle</v-icon
                >
              </div>
            </div>
            <div
              v-if="pendingSample"
              ref="replaceNotice"
              class="sd-modern-notice b-domain-loading__replace"
              role="alert"
              tabindex="-1"
            >
              <v-icon size="18" aria-hidden="true">swap_horiz</v-icon>
              <div class="sd-modern-notice__content">
                <h4>
                  {{
                    t("replace_title", { name: t(`samples.${pendingSample}`) })
                  }}
                </h4>
                <p>{{ t("replace_hint") }}</p>
                <div class="b-domain-loading__replace-actions">
                  <v-btn
                    color="primary"
                    variant="flat"
                    class="sd-modern-button sd-modern-button--primary"
                    :disabled="!editable || busy"
                    @click="closeReplace(true)"
                    >{{ t("replace") }}</v-btn
                  >
                  <v-btn
                    variant="text"
                    class="sd-modern-button"
                    @click="closeReplace(false)"
                    >{{ $t("global.actions.cancel") }}</v-btn
                  >
                </div>
              </div>
            </div>
          </section>
          <h3>{{ t("code_title") }}</h3>
          <p>{{ t("code_hint") }}</p>
          <template v-for="field in codeFields" :key="field.key">
            <div
              class="b-domain-loading__code"
              :class="{ 'b-domain-loading__code--invalid': field.error }"
            >
              <div class="b-domain-loading__code-top">
                <label :for="fieldId(field.key, 'input')">{{
                  t(field.key)
                }}</label>
                <code dir="ltr">&lt;{{ field.key }}&gt;</code>
                <span class="b-domain-loading__counter">{{
                  t("bytes", { size: bytes(field.value), limit: field.limit })
                }}</span>
              </div>
              <div class="b-domain-loading__editor">
                <div
                  class="b-domain-loading__lines"
                  aria-hidden="true"
                  v-text="lineNumbers(field.value, field.rows)"
                />
                <textarea
                  :id="fieldId(field.key, 'input')"
                  :value="field.value"
                  :rows="field.rows"
                  :readonly="!editable"
                  :disabled="busy"
                  :aria-invalid="!!field.error"
                  :aria-describedby="
                    fieldId(field.key, 'help') +
                    (field.error ? ' ' + fieldId(field.key, 'error') : '')
                  "
                  wrap="off"
                  spellcheck="false"
                  autocapitalize="off"
                  autocomplete="off"
                  dir="ltr"
                  @input="setCode(field.key, $event.target.value)"
                  @scroll="syncLines"
                />
              </div>
            </div>
            <div
              :id="fieldId(field.key, 'help')"
              class="b-domain-loading__help"
            >
              {{ t(`${field.key}_hint`) }}
            </div>
            <div
              v-if="field.error"
              :id="fieldId(field.key, 'error')"
              class="b-domain-loading__error"
              role="alert"
            >
              <v-icon size="16" color="error" aria-hidden="true"
                >error_outline</v-icon
              ><span>{{ field.error }}</span>
            </div>
          </template>
        </div>
        <div
          v-if="!readOnly || mode === 'custom'"
          class="sd-modern-actions b-domain-loading__actions"
        >
          <v-btn
            v-if="!readOnly"
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
            v-if="mode === 'custom'"
            ref="previewButton"
            variant="outlined"
            prepend-icon="visibility"
            class="sd-modern-button"
            :disabled="!body.trim()"
            @click="openPreview"
            >{{ t("preview") }}</v-btn
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
        <v-dialog
          :model-value="!!previewSource"
          :aria-label="t('preview_title')"
          max-width="760"
          scrollable
          @update:model-value="!$event && closePreview()"
        >
          <v-card
            class="b-domain-loading__preview sd-modern-widget text-start"
            :aria-label="t('preview_title')"
          >
            <header class="b-domain-loading__preview-header">
              <div class="b-domain-loading__preview-copy">
                <h2>{{ t("preview_title") }}</h2>
                <p>{{ t("preview_hint") }}</p>
              </div>
              <v-btn-group
                class="sd-modern-button-group"
                :aria-label="t('preview_size')"
              >
                <v-btn
                  v-for="size in ['desktop', 'phone']"
                  :key="size"
                  :active="device === size"
                  :aria-pressed="device === size"
                  @click="device = size"
                  >{{ t(`preview_${size}`) }}</v-btn
                >
              </v-btn-group>
              <v-btn
                icon
                variant="text"
                class="sd-modern-icon-button"
                :aria-label="$t('global.actions.close')"
                @click="closePreview"
              >
                <v-icon size="18">close</v-icon>
                <v-tooltip
                  activator="parent"
                  location="top"
                  open-on-focus
                  content-class="sd-modern-tooltip text-start"
                  >{{ $t("global.actions.close") }}</v-tooltip
                >
              </v-btn>
            </header>
            <v-card-text class="b-domain-loading__preview-body">
              <div class="b-domain-loading__stage">
                <div
                  class="b-domain-loading__screen"
                  :class="`b-domain-loading__screen--${device}`"
                >
                  <!-- The storefront's own sandbox: scripts run in an opaque origin, never the dashboard's. -->
                  <iframe
                    v-if="previewSource"
                    :srcdoc="previewSource"
                    sandbox="allow-scripts"
                    referrerpolicy="no-referrer"
                    :title="t('preview_frame')"
                  />
                </div>
              </div>
              <p class="b-domain-loading__preview-note">
                <v-icon size="16" aria-hidden="true">lock</v-icon
                ><span>{{ t("preview_note") }}</span>
              </p>
            </v-card-text>
            <v-card-actions class="b-domain-loading__preview-actions">
              <v-btn
                variant="text"
                class="sd-modern-button"
                @click="closePreview"
                >{{ $t("global.actions.close") }}</v-btn
              >
            </v-card-actions>
          </v-card>
        </v-dialog>
      </template>
    </template>
  </section>
</template>

<script lang="ts">
import USmartSwitch from "../../../ui/smart/switch/USmartSwitch.vue";
import { DOMAIN_LOADING_SAMPLES } from "./domain-loading-samples.ts";

const DEFAULT_LIMITS = { head_bytes: 15 * 1024, body_bytes: 3 * 1024 };
// Same document as App\Shop\Loading\DomainLoading::document() in the shops repository, which serves storefronts.
const FRAME_POLICY =
  "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline' https:; img-src https:; font-src https:; connect-src 'none'; form-action 'none'; frame-src 'none'; object-src 'none'; base-uri 'none'";
const frameDocument = (head, body) =>
  `<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="${FRAME_POLICY}"><meta name="referrer" content="no-referrer"><meta name="viewport" content="width=device-width, initial-scale=1">${head}</head><body>${body}</body></html>`;
// Gallery thumbnails rest on one mid-animation frame and play only while hovered or focused.
const STILL_FRAME =
  "<style>*,*::before,*::after{animation-play-state:paused!important;animation-delay:-0.6s!important}</style>";
const escapeText = (value) =>
  String(value).replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);
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
    pendingSample: null,
    hoveredSample: null,
    previewSource: "",
    device: "desktop",
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
    canPickSamples() {
      return (
        this.loaded &&
        !this.readOnly &&
        !this.external &&
        this.summary?.supported === true
      );
    },
    samples() {
      const values = {
        name: this.shop.title || this.shop.name || "",
        loading: `${this.$t("global.commons.loading")}…`,
      };
      return DOMAIN_LOADING_SAMPLES.map((sample) => {
        const [head, body] = [sample.head, sample.body].map((code) =>
          code.replace(/\{\{(name|loading)\}\}/g, (_, key) =>
            escapeText(values[key]),
          ),
        );
        return {
          id: sample.id,
          head,
          body,
          size: ((this.bytes(head) + this.bytes(body)) / 1024).toFixed(1),
          live: frameDocument(head, body),
          still: frameDocument(head + STILL_FRAME, body),
        };
      });
    },
    currentSampleId() {
      return (
        this.samples.find(
          (sample) => sample.head === this.head && sample.body === this.body,
        )?.id || null
      );
    },
    codeFields() {
      return [
        {
          key: "head",
          value: this.head,
          rows: 9,
          limit: this.limits.head_bytes,
          error: this.headError,
        },
        {
          key: "body",
          value: this.body,
          rows: 7,
          limit: this.limits.body_bytes,
          error: this.bodyError,
        },
      ];
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
      this.pendingSample = null;
      this.hoveredSample = null;
      this.previewSource = "";
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
      this.pendingSample = null;
      this.error = "";
      this.saved = false;
    },
    fieldId(field, part) {
      return `b-domain-loading-${this.$.uid}-${field}-${part}`;
    },
    setCode(field, value) {
      this[field] = value;
    },
    lineNumbers(value, rows) {
      const count = Math.max(value.split("\n").length, rows);
      return Array.from({ length: count }, (_, index) => index + 1).join("\n");
    },
    syncLines(event) {
      event.target.previousElementSibling.scrollTop = event.target.scrollTop;
    },
    pickSample(id) {
      if (!this.editable || this.busy || id === this.currentSampleId) return;
      // An unmodified sample can be swapped freely; other code may be the merchant's own work.
      if ((this.head.trim() || this.body.trim()) && !this.currentSampleId) {
        this.pendingSample = id;
        this.$nextTick(() => this.$refs.replaceNotice?.focus());
      } else this.applySample(id);
    },
    applySample(id) {
      const sample = this.samples.find((item) => item.id === id);
      if (!sample || !this.editable || this.busy) return;
      this.head = sample.head;
      this.body = sample.body;
      this.pendingSample = null;
    },
    closeReplace(apply) {
      const id = this.pendingSample;
      if (apply) this.applySample(id);
      this.pendingSample = null;
      this.$nextTick(() =>
        this.$el.querySelector(`#${this.fieldId("sample", id)}`)?.focus(),
      );
    },
    openPreview() {
      if (this.body.trim())
        this.previewSource = frameDocument(this.head, this.body);
    },
    closePreview() {
      if (!this.previewSource) return;
      this.previewSource = "";
      // Opened from code, so Vuetify has no activator to return focus to.
      this.$nextTick(() => this.$refs.previewButton?.$el?.focus());
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
  h4 {
    font: inherit;
    font-size: 14px;
    font-weight: 500;
    line-height: 22px;
    margin: 0;
  }
  &__fields {
    margin-top: 28px;
  }
  &__samples {
    margin-bottom: 30px;
  }
  &__sample-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
    margin-top: 14px;
  }
  &__sample {
    position: relative;
    overflow: hidden;
    border: 1px solid var(--sd-modern-border);
    border-radius: 12px;
    background: rgb(var(--v-theme-surface));
    transition: border-color 0.15s;
  }
  &__sample:hover {
    border-color: rgba(var(--v-theme-on-surface), 0.28);
  }
  &__sample--current,
  &__sample--current:hover {
    border-color: rgb(var(--v-theme-primary));
    box-shadow: 0 0 0 1px rgb(var(--v-theme-primary));
  }
  // Loading frames sit on the storefront's white page, as on the live site.
  &__thumb {
    position: relative;
    aspect-ratio: 16 / 10;
    overflow: hidden;
    border-bottom: 1px solid var(--sd-modern-border);
    background: #fff;
  }
  &__thumb iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 160%;
    height: 160%;
    border: 0;
    transform: scale(0.625);
    transform-origin: 0 0;
    pointer-events: none;
  }
  &__sample-meta {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 8px;
    padding: 7px 10px 8px;
    font-size: 12px;
    line-height: 18px;
  }
  &__sample-meta span:first-child {
    min-width: 0;
    overflow: hidden;
    font-weight: 500;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  &__sample-meta span:last-child {
    color: var(--sd-modern-muted);
    white-space: nowrap;
  }
  &__pick {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
    border: 0;
    border-radius: 12px;
    background: transparent;
    cursor: pointer;
  }
  &__pick:disabled {
    cursor: default;
  }
  &__pick:focus-visible,
  &__replace:focus-visible {
    outline: 2px solid rgb(var(--v-theme-primary));
    outline-offset: -2px;
  }
  &__tick {
    position: absolute;
    top: 7px;
    inset-inline-end: 7px;
    border-radius: 50%;
    background: rgb(var(--v-theme-surface));
    color: rgb(var(--v-theme-primary));
  }
  &__replace {
    margin-top: 14px;
  }
  &__replace-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 10px;
  }
  &__code {
    margin-top: 16px;
    overflow: hidden;
    border: 1px solid var(--sd-modern-border);
    border-radius: 12px;
    background: var(--sd-modern-inset);
  }
  &__code:focus-within {
    border-color: rgb(var(--v-theme-primary));
    box-shadow: 0 0 0 1px rgb(var(--v-theme-primary));
  }
  &__code--invalid {
    border-color: rgb(var(--v-theme-error));
  }
  &__code-top {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px 8px;
    padding: 8px 12px;
    border-bottom: 1px solid var(--sd-modern-border);
    background: rgb(var(--v-theme-surface));
  }
  &__code-top label {
    font-size: 13px;
    font-weight: 500;
    line-height: 20px;
  }
  &__code-top code {
    padding: 2px 6px;
    border-radius: 6px;
    background: var(--sd-modern-inset);
    color: var(--sd-modern-muted);
    font:
      500 11px/16px ui-monospace,
      monospace;
  }
  &__counter {
    margin-inline-start: auto;
    color: var(--sd-modern-muted);
    font-size: 12px;
    line-height: 18px;
    font-variant-numeric: tabular-nums;
  }
  // Code stays left-to-right with numbered lines in every interface language.
  &__editor {
    display: flex;
    direction: ltr;
  }
  &__lines,
  &__editor textarea {
    font:
      12.5px/20px ui-monospace,
      SFMono-Regular,
      Menlo,
      Consolas,
      monospace;
  }
  &__lines {
    flex: none;
    min-width: 30px;
    padding: 10px 8px 10px 10px;
    overflow: hidden;
    border-right: 1px solid var(--sd-modern-border);
    color: var(--sd-modern-muted);
    text-align: right;
    white-space: pre;
    user-select: none;
  }
  &__editor textarea {
    flex: 1;
    min-width: 0;
    padding: 10px 12px;
    border: 0;
    outline: 0;
    resize: vertical;
    overflow: auto;
    background: transparent;
    color: rgb(var(--v-theme-on-surface));
    white-space: pre;
    overflow-wrap: normal;
    tab-size: 2;
  }
  &__help,
  &__error {
    margin-top: 7px;
    font-size: 12px;
    line-height: 18px;
  }
  &__help {
    color: var(--sd-modern-muted);
  }
  &__error {
    display: flex;
    align-items: flex-start;
    gap: 6px;
  }
  &__error .v-icon {
    margin-top: 1px;
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
  &__preview.sd-modern-widget {
    padding: 0;
    border-radius: 17px;
  }
  // Vuetify's dialog card text keeps its own 16px top padding below this header.
  &__preview-header {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    gap: 12px;
    padding: 22px 24px 0;
  }
  &__preview-copy {
    flex: 1 1 240px;
    min-width: 0;
  }
  &__preview-header h2 {
    font: inherit;
    font-size: 18px;
    font-weight: 500;
    line-height: 27px;
    margin: 0;
  }
  &__preview-header p {
    margin: 4px 0 0;
    color: var(--sd-modern-muted);
    font-size: 13px;
    line-height: 21px;
  }
  &__stage {
    display: grid;
    place-items: center;
    padding: 16px;
    border: 1px solid var(--sd-modern-border);
    border-radius: 12px;
    background: var(--sd-modern-inset);
  }
  &__screen {
    position: relative;
    overflow: hidden;
    border-radius: 8px;
    outline: 1px solid var(--sd-modern-border);
    background: #fff;
  }
  &__screen--desktop {
    width: 100%;
    aspect-ratio: 16 / 9;
  }
  &__screen--phone {
    width: 195px;
    height: 390px;
  }
  // Render at twice the box size, then scale down, so the loader sees a realistic viewport.
  &__screen iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 200%;
    height: 200%;
    border: 0;
    transform: scale(0.5);
    transform-origin: 0 0;
  }
  &__preview-note {
    display: flex;
    align-items: flex-start;
    gap: 6px;
    margin: 12px 0 0;
    color: var(--sd-modern-muted);
    font-size: 12px;
    line-height: 18px;
  }
  &__preview-note .v-icon {
    margin-top: 1px;
  }
  &__preview-actions.v-card-actions {
    padding: 0 24px 20px;
    justify-content: flex-end;
  }
  @media (max-width: 600px) {
    &__sample-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 10px;
    }
  }
  @media (max-width: 480px) {
    &__lines,
    &__editor textarea {
      font-size: 16px;
      line-height: 22px;
    }
    &__preview-header,
    &__preview-actions.v-card-actions {
      padding-inline: 16px;
    }
  }
}
</style>
