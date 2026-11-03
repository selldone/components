<template>
  <div class="b-domain-maintenance text-start">
    <div class="b-domain-maintenance__row">
      <div class="b-domain-maintenance__copy">
        <h3>{{ t("title") }}</h3>
        <p>
          {{
            t(
              external
                ? "unsupported_external"
                : summary?.enabled
                  ? item.enable
                    ? "serving_hint"
                    : "configured_disabled"
                  : "setup_hint",
            )
          }}
        </p>
        <p v-if="!external && summary?.supported === false" role="status">
          {{ t("unavailable") }}
        </p>
      </div>
      <u-smart-toggle
        v-if="!external"
        :model-value="summary?.enabled === true"
        :dark="$vuetify.theme.current.dark"
        :readonly="!canChange || busy"
        :loading="busy && !dialog"
        role="checkbox"
        :aria-label="t('title')"
        :aria-checked="summary?.enabled === true"
        :aria-disabled="!canChange || busy"
        :tabindex="canChange && !busy ? 0 : -1"
        false-gray
        class="sd-modern-control-colors b-domain-maintenance__toggle"
        @update:model-value="toggle($event)"
        @keydown.enter.prevent="toggle(summary?.enabled !== true, $event)"
        @keydown.space.prevent="toggle(summary?.enabled !== true, $event)"
      />
    </div>
    <v-btn
      v-if="!external"
      variant="text"
      color="primary"
      class="sd-modern-button sd-modern-button--inline"
      prepend-icon="description"
      :disabled="busy || disabled"
      @click="openEditor($event)"
      >{{ t(readOnly ? "view_html" : summary?.has_html ? "edit_html" : "add_html") }}</v-btn
    >
    <div v-if="error && !dialog" class="sd-modern-notice" role="alert">
      <v-icon size="18" color="error" aria-hidden="true">error_outline</v-icon>
      <div class="sd-modern-notice__content">{{ error }}</div>
    </div>

    <v-dialog
      :model-value="dialog"
      :aria-label="t('page_title')"
      :persistent="busy"
      max-width="720"
      scrollable
      @update:model-value="!$event && closeEditor()"
    >
      <v-card
        class="b-domain-maintenance__dialog sd-modern-widget text-start"
        :aria-label="t('page_title')"
      >
        <header class="b-domain-maintenance__header">
          <div>
            <h2>{{ t("page_title") }}</h2>
            <p>
              <bdi dir="ltr">{{ item.domain?.domain }}</bdi>
            </p>
          </div>
          <v-btn
            icon
            variant="text"
            class="sd-modern-icon-button"
            :disabled="busy"
            :aria-label="$t('global.actions.close')"
            @click="closeEditor"
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
        <v-card-text class="b-domain-maintenance__body">
          <v-progress-linear
            v-if="busy"
            indeterminate
            color="primary"
            :aria-label="$t('global.commons.loading')"
          />
          <div v-if="error" class="sd-modern-notice" role="alert">
            <v-icon size="18" color="error" aria-hidden="true"
              >error_outline</v-icon
            >
            <div class="sd-modern-notice__content">{{ error }}</div>
          </div>
          <p>{{ t("editor_hint") }}</p>
          <p
            v-if="!pageAvailable && baselineSummary?.has_html"
            class="b-domain-maintenance__hint"
            role="status"
          >
            {{ t("missing_html") }}
          </p>
          <v-checkbox
            v-model="draftEnabled"
            :label="t('title')"
            :disabled="!editable || busy"
            hide-details
            class="sd-modern-control-colors b-domain-maintenance__enable"
          />
          <v-file-input
            :model-value="file"
            accept=".html,.htm,text/html"
            :label="t('choose_file')"
            :disabled="!editable || busy"
            :error-messages="fileError"
            variant="underlined"
            show-size
            class="sd-modern-underlined-field"
            @update:model-value="readFile"
          />
          <v-textarea
            v-model="html"
            :label="t('html_source')"
            :readonly="!editable"
            :disabled="busy"
            :error-messages="htmlError"
            variant="underlined"
            rows="8"
            spellcheck="false"
            dir="ltr"
            class="sd-modern-underlined-field b-domain-maintenance__source"
          />
          <p class="b-domain-maintenance__counter" aria-live="polite">
            {{ t("size_hint", { size: (byteSize / 1024).toFixed(1) }) }}
          </p>
          <v-btn
            v-if="loadFailed"
            variant="text"
            color="primary"
            class="sd-modern-button sd-modern-button--inline"
            :disabled="busy"
            @click="loadPage"
            >{{ $t("global.actions.retry") }}</v-btn
          >
        </v-card-text>
        <v-card-actions class="b-domain-maintenance__actions">
          <v-btn
            variant="text"
            class="sd-modern-button"
            :disabled="busy"
            @click="closeEditor"
            >{{ $t("global.actions.cancel") }}</v-btn
          >
          <v-btn
            v-if="!readOnly"
            color="primary"
            variant="flat"
            class="sd-modern-button sd-modern-button--primary"
            prepend-icon="save"
            :loading="busy"
            :disabled="!canSave"
            @click="savePage"
            >{{ $t("global.actions.save") }}</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts">
import USmartToggle from "../../../ui/smart/toggle/USmartToggle.vue";

const MAX_BYTES = 40 * 1024;

export default {
  name: "BDomainMaintenance",
  components: { USmartToggle },
  props: {
    shop: { type: Object, required: true },
    item: { type: Object, required: true },
    readOnly: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
  },
  emits: ["saved", "state"],
  data: () => ({
    dialog: false,
    busy: false,
    error: "",
    loadFailed: false,
    html: "",
    baselineHtml: "",
    draftEnabled: false,
    baselineSummary: null,
    pageAvailable: false,
    file: null,
    fileError: "",
    request: 0,
    activator: null,
  }),
  computed: {
    summary() {
      return (
        this.item.maintenance_summary ||
        this.item.domain?.maintenance_summary ||
        null
      );
    },
    external() {
      return !!this.item.domain?.externally_hosted;
    },
    resourceKey() {
      return `${this.shop.id}:${this.item.domain?.id}`;
    },
    editable() {
      return (
        !this.readOnly &&
        !this.disabled &&
        !this.external &&
        this.baselineSummary?.supported === true
      );
    },
    canChange() {
      return (
        !this.readOnly &&
        !this.disabled &&
        !this.external &&
        this.summary?.supported === true
      );
    },
    byteSize() {
      return new TextEncoder().encode(this.html).byteLength;
    },
    htmlError() {
      if (this.byteSize > MAX_BYTES) return this.t("too_large");
      return this.html.includes("\0") ? this.t("invalid_html") : "";
    },
    dirty() {
      return (
        this.dialog &&
        (this.html !== this.baselineHtml ||
          this.draftEnabled !== (this.baselineSummary?.enabled === true))
      );
    },
    canSave() {
      return (
        this.editable &&
        !this.busy &&
        !this.loadFailed &&
        this.dirty &&
        !this.htmlError &&
        !this.fileError &&
        (!this.draftEnabled || this.html.trim().length > 0) &&
        (this.html === this.baselineHtml || this.html.trim().length > 0)
      );
    },
  },
  watch: {
    dirty() {
      this.emitState();
    },
    busy() {
      this.emitState();
    },
    resourceKey() {
      this.reset();
    },
  },
  beforeUnmount() {
    this.request++;
  },
  methods: {
    t(key, values = {}) {
      return this.$t(`domains_modern.maintenance.${key}`, values);
    },
    emitState() {
      this.$emit("state", { dirty: this.dirty, busy: this.busy });
    },
    reset() {
      this.request++;
      this.dialog = false;
      this.busy = false;
      this.error = "";
      this.html = "";
      this.baselineHtml = "";
      this.baselineSummary = null;
      this.pageAvailable = false;
      this.file = null;
      this.fileError = "";
      this.loadFailed = false;
    },
    async openEditor(event, enable = null) {
      if (this.busy || this.disabled || this.external || !this.item.domain?.id)
        return;
      const key = this.resourceKey;
      this.activator = event?.currentTarget || document.activeElement;
      this.dialog = true;
      await this.loadPage();
      if (
        key === this.resourceKey &&
        this.dialog &&
        enable !== null &&
        !this.loadFailed
      )
        this.draftEnabled = enable;
    },
    closeEditor() {
      if (this.busy) return;
      this.dialog = false;
      this.error = "";
      this.fileError = "";
      this.file = null;
      this.$nextTick(() => {
        if (this.activator?.isConnected) this.activator.focus();
      });
    },
    async loadPage() {
      const request = ++this.request,
        key = this.resourceKey;
      this.busy = true;
      this.error = "";
      this.loadFailed = false;
      try {
        const { data } = await axios.get(
          window.API.GET_DOMAIN_MAINTENANCE(this.shop.id, this.item.domain.id),
          { params: { include_html: true } },
        );
        if (
          request !== this.request ||
          key !== this.resourceKey ||
          !this.dialog
        )
          return;
        if (
          !data?.maintenance_summary ||
          (data.html !== null && typeof data.html !== "string")
        )
          throw Error();
        this.baselineSummary = data.maintenance_summary;
        this.draftEnabled = data.maintenance_summary.enabled === true;
        this.pageAvailable = typeof data.html === "string";
        this.html = this.pageAvailable ? data.html : "";
        this.baselineHtml = this.html;
        this.file = null;
        this.fileError = "";
      } catch {
        if (request === this.request && key === this.resourceKey) {
          this.error = this.t("load_failed");
          this.loadFailed = true;
        }
      } finally {
        if (request === this.request && key === this.resourceKey)
          this.busy = false;
      }
    },
    async readFile(value) {
      if (!this.editable || this.busy) return;
      this.fileError = "";
      const file = Array.isArray(value) ? value[0] : value;
      this.file = file || null;
      if (!file) return;
      if (file.size > MAX_BYTES) {
        this.fileError = this.t("too_large");
        return;
      }
      const request = this.request,
        key = this.resourceKey,
        previousHtml = this.html;
      try {
        const html = new TextDecoder("utf-8", { fatal: true }).decode(
          await file.arrayBuffer(),
        );
        if (
          request !== this.request ||
          key !== this.resourceKey ||
          this.file !== file ||
          !this.dialog ||
          this.html !== previousHtml
        )
          return;
        if (html.includes("\0")) throw Error();
        this.html = html;
      } catch {
        if (
          request === this.request &&
          key === this.resourceKey &&
          this.file === file &&
          this.dialog &&
          this.html === previousHtml
        )
          this.fileError = this.t("invalid_html");
      }
    },
    toggle(value, event) {
      if (
        !this.canChange ||
        this.busy ||
        typeof value !== "boolean" ||
        value === (this.summary?.enabled === true)
      )
        return;
      if (value && !this.summary?.has_html) return this.openEditor(event, true);
      return this.persist({ enabled: value }, false);
    },
    savePage() {
      if (!this.canSave) return;
      const payload = { enabled: this.draftEnabled };
      if (this.html !== this.baselineHtml) payload.html = this.html;
      return this.persist(payload, true);
    },
    async persist(payload, close) {
      if (
        this.busy ||
        this.readOnly ||
        this.disabled ||
        this.external ||
        !this.item.domain?.id
      )
        return;
      const request = ++this.request,
        key = this.resourceKey;
      this.busy = true;
      this.error = "";
      try {
        const { data } = await axios.post(
          window.API.POST_DOMAIN_MAINTENANCE(this.shop.id, this.item.domain.id),
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
          !data.maintenance_summary ||
          data.domain?.id !== this.item.domain.id ||
          data.maintenance_summary.enabled !== payload.enabled
        )
          throw Error();
        this.$emit("saved", data);
        this.baselineSummary = data.maintenance_summary;
        this.baselineHtml = this.html;
        if (close) {
          this.busy = false;
          this.closeEditor();
        }
      } catch {
        if (request === this.request && key === this.resourceKey)
          this.error = this.t("save_failed");
      } finally {
        if (request === this.request && key === this.resourceKey)
          this.busy = false;
      }
    },
  },
};
</script>

<style scoped lang="scss">
.b-domain-maintenance {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid var(--sd-modern-border);
  &__row,
  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
  }
  &__copy {
    flex: 1;
    min-width: 0;
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
    overflow-wrap: anywhere;
  }
  &__toggle {
    flex: none;
    border-radius: 8px;
  }
  &__toggle:focus-visible {
    outline: 2px solid rgb(var(--v-theme-primary));
    outline-offset: 3px;
  }
  &__dialog.sd-modern-widget {
    padding: 0;
    border-radius: 17px;
  }
  &__header {
    padding: 22px 24px 16px;
  }
  &__header h2 {
    font: inherit;
    font-size: 18px;
    font-weight: 500;
    line-height: 27px;
    margin: 0;
  }
  &__body.v-card-text {
    position: relative;
    padding: 0 24px 20px;
  }
  &__body > .v-progress-linear {
    position: absolute;
    inset: 0 0 auto;
  }
  &__body > p {
    margin-bottom: 16px;
  }
  &__enable {
    margin-bottom: 12px;
  }
  &__source :deep(textarea) {
    font-family: ui-monospace, monospace;
    font-size: 13px;
    line-height: 20px;
  }
  &__counter {
    text-align: end;
  }
  &__actions.v-card-actions {
    padding: 12px 24px 20px;
    gap: 8px;
    justify-content: flex-end;
  }
  @media (max-width: 480px) {
    &__header {
      padding-inline: 16px;
    }
    &__body.v-card-text {
      padding-inline: 16px;
    }
    &__actions.v-card-actions {
      padding-inline: 16px;
    }
    &__source :deep(textarea) {
      font-size: 16px;
    }
  }
}
</style>
