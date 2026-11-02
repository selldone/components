<template>
  <div class="b-resource-metadata text-start" :aria-busy="busy">
    <figure class="sd-modern-illustration b-resource-metadata__illustration">
      <div class="b-resource-metadata__diagram" aria-hidden="true">
        <div class="b-resource-metadata__node">
          <svg
            class="sd-modern-illustration__icon"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            focusable="false"
          >
            <path d="m3 7 9-4 9 4-9 4-9-4Zm0 5 9 4 9-4M3 17l9 4 9-4" />
          </svg>
          <span>{{ $t("resource_metadata.illustration_resource") }}</span>
        </div>
        <svg
          class="b-resource-metadata__branches"
          viewBox="0 0 100 80"
          fill="none"
          focusable="false"
        >
          <path
            d="M0 40H32Q48 40 48 24V20Q48 12 60 12H100M32 40Q48 40 48 56V60Q48 68 60 68H100"
          />
        </svg>
        <div class="b-resource-metadata__destinations">
          <div class="b-resource-metadata__destination">
            <svg
              class="sd-modern-illustration__icon"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              focusable="false"
            >
              <circle cx="12" cy="12" r="9" />
              <path d="M3 12h18M12 3c-5 5-5 13 0 18 5-5 5-13 0-18Z" /></svg
            ><span
              >{{ $t("resource_metadata.public_attributes")
              }}<small>{{
                $t("resource_metadata.illustration_storefront")
              }}</small></span
            >
          </div>
          <div class="b-resource-metadata__destination">
            <svg
              class="sd-modern-illustration__icon"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              focusable="false"
            >
              <rect x="5" y="10" width="14" height="11" rx="2" />
              <path d="M8 10V7a4 4 0 0 1 8 0v3m-4 4v3" /></svg
            ><span
              >{{ $t("resource_metadata.private_attributes") }} ·
              {{ $t("resource_metadata.ai_agent")
              }}<small>{{
                $t("resource_metadata.illustration_internal")
              }}</small></span
            >
          </div>
        </div>
      </div>
      <figcaption>
        <span class="sd-modern-eyebrow">{{
          $t("resource_metadata.illustration")
        }}</span>
        <p class="sd-modern-subtitle">
          {{ $t("resource_metadata.illustration_summary") }}
        </p>
      </figcaption>
    </figure>

    <nav
      class="sd-modern-section-nav b-resource-metadata__nav"
      :aria-label="$t('resource_metadata.title')"
    >
      <button
        v-for="section in sections"
        :key="section.field"
        type="button"
        class="sd-modern-section-nav__item"
        :aria-current="selected === section.field ? 'location' : undefined"
        :disabled="busy || parentBusy"
        @click="selected = section.field"
      >
        <v-icon size="18" aria-hidden="true">{{ section.icon }}</v-icon>
        {{ $t("resource_metadata." + section.field) }}
      </button>
    </nav>

    <section class="sd-modern-widget b-resource-metadata__workspace">
      <v-progress-linear
        v-if="entry.loading && entry.loaded"
        class="b-resource-metadata__progress"
        indeterminate
      />
      <header class="b-resource-metadata__header">
        <div>
          <h3 class="sd-modern-title-text">
            {{ $t("resource_metadata." + selected) }}
          </h3>
          <p class="sd-modern-subtitle">
            {{ $t("resource_metadata." + selected + "_help") }}
          </p>
          <span class="b-resource-metadata__audience"
            ><v-icon size="14" aria-hidden="true">{{
              currentSection.icon
            }}</v-icon
            >{{ $t("resource_metadata." + selected + "_audience") }}</span
          >
        </div>
        <div class="b-resource-metadata__tools">
          <span
            v-if="!canEdit"
            class="sd-modern-status sd-modern-status--plain"
            >{{ $t("resource_metadata.readonly") }}</span
          >
          <template v-if="entry.loaded && !entry.editing">
            <v-btn
              v-if="selected !== 'meta'"
              class="sd-modern-button sd-modern-button--inline"
              variant="text"
              prepend-icon="refresh"
              :disabled="busy || parentBusy"
              @click="load(selected)"
              >{{ $t("global.actions.refresh") }}</v-btn
            >
            <v-btn
              v-if="canEdit"
              class="sd-modern-button sd-modern-button--inline"
              variant="text"
              prepend-icon="edit"
              :disabled="busy || parentBusy"
              @click="edit"
              >{{ $t("resource_metadata.edit") }}</v-btn
            >
          </template>
        </div>
      </header>

      <div
        v-if="entry.loading && !entry.loaded"
        class="b-resource-metadata__state"
        role="status"
      >
        <v-progress-circular
          indeterminate
          size="20"
          width="2"
          aria-hidden="true"
        />{{ $t("resource_metadata.loading") }}
      </div>
      <div
        v-else-if="entry.error || !entry.loaded"
        class="sd-modern-notice"
        role="status"
      >
        <v-icon aria-hidden="true">info_outline</v-icon>
        <div class="sd-modern-notice__content">
          {{
            $t(
              entry.error
                ? "resource_metadata.load_error"
                : "resource_metadata.unavailable",
            )
          }}
        </div>
        <v-btn
          v-if="selected !== 'meta' && ready"
          class="sd-modern-button sd-modern-button--inline"
          variant="text"
          :disabled="busy || parentBusy"
          @click="load(selected)"
          >{{ $t("resource_metadata.retry") }}</v-btn
        >
      </div>
      <template v-else>
        <template v-if="entry.editing && canEdit">
          <v-textarea
            v-model="entry.draft"
            class="b-resource-metadata__editor"
            :label="$t('resource_metadata.json_label')"
            dir="ltr"
            variant="outlined"
            rows="12"
            :disabled="busy || parentBusy"
            :aria-invalid="!!validation.error"
            spellcheck="false"
            hide-details
          />
          <p
            v-if="validation.error || entry.saveError"
            class="sd-modern-notice b-resource-metadata__feedback"
            role="alert"
          >
            <v-icon aria-hidden="true">error_outline</v-icon
            ><span class="sd-modern-notice__content">{{
              $t(validation.error || entry.saveError)
            }}</span>
          </p>
          <p class="sd-modern-subtitle b-resource-metadata__replace">
            {{ $t("resource_metadata.replace_help") }}
          </p>
          <div class="b-resource-metadata__actions">
            <span v-if="dirty" class="sd-modern-subtitle">{{
              $t("resource_metadata.unsaved")
            }}</span>
            <v-btn
              class="sd-modern-button"
              variant="outlined"
              :disabled="busy || parentBusy"
              @click="discard"
              >{{ $t("resource_metadata.cancel") }}</v-btn
            >
            <v-btn
              class="sd-modern-button sd-modern-button--primary"
              color="primary"
              variant="elevated"
              prepend-icon="save"
              :loading="saving"
              :disabled="
                busy ||
                parentBusy ||
                !dirty ||
                !!validation.error ||
                !!entry.conflict
              "
              @click="save"
              >{{ $t("resource_metadata.save") }}</v-btn
            >
          </div>
        </template>
        <template v-else>
          <p v-if="empty" class="b-resource-metadata__empty">
            {{ $t("resource_metadata.empty") }}
          </p>
          <div
            v-else
            class="b-resource-metadata__json"
            dir="ltr"
            tabindex="0"
            :aria-label="$t('resource_metadata.json_label')"
          >
            <vue-json-pretty
              :data="entry.value"
              :show-icon="false"
              :collapsed-on-click-brackets="false"
              :show-length="true"
              :show-line="false"
            />
          </div>
          <p
            v-if="entry.saved"
            class="b-resource-metadata__feedback"
            role="status"
          >
            {{ $t("resource_metadata.saved") }}
          </p>
        </template>
      </template>
      <p class="sd-modern-subtitle b-resource-metadata__storage">
        {{ $t("resource_metadata.storage_help") }}
      </p>
    </section>
  </div>
</template>

<script lang="ts">
import VueJsonPretty from "vue-json-pretty";
import "vue-json-pretty/lib/styles.css";

const sections = [
  { field: "public_attributes", icon: "language" },
  { field: "private_attributes", icon: "lock_outline" },
  { field: "ai_agent", icon: "smart_toy" },
  { field: "meta", icon: "settings" },
];
const newEntry = () => ({
  loaded: false,
  loading: false,
  error: false,
  value: null,
  snapshot: "",
  draft: "",
  editing: false,
  saveError: "",
  conflict: false,
  saved: false,
});
const newEntries = () =>
  Object.fromEntries(sections.map(({ field }) => [field, newEntry()]));

export default {
  name: "BResourceMetadata",
  components: { VueJsonPretty },
  emits: ["saved"],
  props: {
    shop: { type: Object, required: true },
    resource: { type: Object, required: true },
    resourceType: { type: String, required: true },
    readOnly: { type: Boolean, default: true },
    active: { type: Boolean, default: true },
    parentBusy: { type: Boolean, default: false },
  },
  data: () => ({
    sections,
    selected: "public_attributes",
    entries: newEntries(),
    saving: false,
    generation: 0,
    disposed: false,
  }),
  computed: {
    scope() {
      return `${this.shop?.id}/${this.resourceType}/${this.resource?.id}`;
    },
    ready() {
      return (
        /^\d+$/.test(String(this.shop?.id)) &&
        /^\d+$/.test(String(this.resource?.id)) &&
        /^[a-z]+(?:-[a-z]+)*$/.test(this.resourceType)
      );
    },
    entry() {
      return this.entries[this.selected];
    },
    currentSection() {
      return sections.find(({ field }) => field === this.selected);
    },
    busy() {
      return (
        this.saving ||
        Object.values(this.entries).some((entry: any) => entry.loading)
      );
    },
    canEdit() {
      return (
        !this.readOnly &&
        ["public_attributes", "private_attributes"].includes(this.selected)
      );
    },
    empty() {
      return (
        this.entry.value === null ||
        (typeof this.entry.value === "object" &&
          Object.keys(this.entry.value).length === 0)
      );
    },
    dirty() {
      return this.entry.draft !== this.entry.snapshot;
    },
    validation() {
      if (new TextEncoder().encode(this.entry.draft).length > 65536)
        return { error: "resource_metadata.too_large" };
      try {
        const value = JSON.parse(this.entry.draft);
        return value === null || typeof value === "object"
          ? { value, error: "" }
          : { error: "resource_metadata.invalid_json" };
      } catch {
        return { error: "resource_metadata.invalid_json" };
      }
    },
  },
  watch: {
    scope: {
      immediate: true,
      handler() {
        this.reset();
      },
    },
    readOnly() {
      this.reset();
    },
    "resource.meta"() {
      this.entries.meta = newEntry();
      if (this.active && this.selected === "meta") this.load("meta");
    },
    active(value) {
      if (value && !this.entry.loaded) this.load(this.selected);
    },
    selected(field) {
      if (!this.entries[field].loaded) this.load(field);
    },
  },
  beforeUnmount() {
    this.disposed = true;
    this.generation++;
  },
  methods: {
    reset() {
      this.generation++;
      this.entries = newEntries();
      this.saving = false;
      if (this.active) this.load(this.selected);
    },
    url(field) {
      // Use the dashboard's configured API origin and its existing authenticated routes.
      return `${window.API.selldone_api_url}/shops/${this.shop.id}/${this.resourceType}/${this.resource.id}/${field}`;
    },
    current(generation) {
      return !this.disposed && generation === this.generation;
    },
    accept(entry, value) {
      entry.value = value;
      entry.snapshot = JSON.stringify(value, null, 2);
      entry.draft = entry.snapshot;
      entry.loaded = true;
      entry.error = false;
      entry.saveError = "";
      entry.conflict = false;
    },
    revoke(error) {
      if ([401, 403, 404].includes(error?.response?.status)) {
        this.generation++;
        this.entries = newEntries();
        this.entries[this.selected].error = true;
        this.saving = false;
        return true;
      }
      return false;
    },
    async load(field) {
      if (
        !sections.some((section) => section.field === field) ||
        !this.ready ||
        !this.active ||
        this.disposed ||
        this.entries[field].loading ||
        this.entries[field].editing
      )
        return;
      const entry = this.entries[field];
      if (field === "meta") {
        if (
          Object.prototype.hasOwnProperty.call(this.resource, "meta") &&
          this.resource.meta !== undefined
        )
          this.accept(entry, this.resource.meta);
        return;
      }
      const generation = this.generation;
      entry.loading = true;
      entry.error = false;
      try {
        const { data } = await axios.get(this.url(field));
        if (!this.current(generation)) return;
        if (
          data?.success !== true ||
          !Object.prototype.hasOwnProperty.call(data, field) ||
          data[field] === undefined
        )
          throw new Error("Unavailable metadata");
        this.accept(entry, data[field]);
      } catch (error) {
        if (this.current(generation) && !this.revoke(error)) entry.error = true;
      } finally {
        if (this.current(generation)) entry.loading = false;
      }
    },
    edit() {
      if (
        !this.active ||
        !this.canEdit ||
        !this.entry.loaded ||
        this.busy ||
        this.parentBusy
      )
        return;
      this.entry.editing = true;
      this.entry.saved = false;
    },
    discard() {
      if (this.busy || this.parentBusy) return;
      const conflicted = this.entry.conflict;
      this.entry.draft = this.entry.snapshot;
      this.entry.editing = false;
      this.entry.saveError = "";
      this.entry.conflict = false;
      if (conflicted) this.load(this.selected);
    },
    async save() {
      if (
        !this.ready ||
        !this.active ||
        !this.canEdit ||
        !this.entry.loaded ||
        !this.entry.editing ||
        !this.dirty ||
        this.busy ||
        this.parentBusy ||
        this.validation.error ||
        this.entry.conflict
      )
        return;
      const field = this.selected,
        entry = this.entry,
        generation = this.generation;
      const value = this.validation.value;
      const url = this.url(field);
      this.saving = true;
      entry.saveError = "";
      try {
        // PUT replaces a whole column; detect edits made since this snapshot before writing.
        const { data: latest } = await axios.get(url);
        if (
          !this.current(generation) ||
          !this.active ||
          !this.canEdit ||
          this.parentBusy
        )
          return;
        if (
          latest?.success !== true ||
          !Object.prototype.hasOwnProperty.call(latest, field)
        )
          throw new Error("Unavailable metadata");
        if (JSON.stringify(latest[field], null, 2) !== entry.snapshot) {
          entry.conflict = true;
          entry.saveError = "resource_metadata.conflict";
          return;
        }
        const { data } = await axios.put(url, { [field]: value });
        if (!this.current(generation)) return;
        if (
          data?.success !== true ||
          !Object.prototype.hasOwnProperty.call(data, field) ||
          data[field] === undefined
        )
          throw new Error("Metadata was not saved");
        this.accept(entry, data[field]);
        entry.editing = false;
        entry.saved = true;
        this.$emit("saved", { field, value: data[field] });
      } catch (error) {
        if (this.current(generation) && !this.revoke(error))
          entry.saveError = "resource_metadata.save_error";
      } finally {
        if (this.current(generation)) this.saving = false;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.b-resource-metadata {
  min-width: 0;
  &__illustration {
    display: flex;
    align-items: center;
    gap: 32px;
    margin: 0 0 24px;
  }
  &__diagram {
    display: flex;
    align-items: center;
    flex: 0 0 330px;
  }
  &__node,
  &__destination {
    display: flex;
    align-items: center;
    gap: 10px;
    background: rgb(var(--v-theme-surface));
    border: 1px solid rgba(var(--v-theme-on-surface), 0.1);
  }
  &__node {
    flex-direction: column;
    justify-content: center;
    padding: 18px 12px;
    border-radius: 18px;
    font-size: 13px;
  }
  &__node > svg {
    color: rgb(var(--sd-modern-illustration-accent-rgb));
  }
  &__branches {
    flex: 0 0 58px;
    width: 58px;
    height: 90px;
    stroke: rgba(var(--v-theme-on-surface), 0.25);
    stroke-width: 1.5;
  }
  &__destinations {
    display: grid;
    gap: 10px;
    flex: 1;
    min-width: 0;
  }
  &__destination {
    border-radius: 14px;
    padding: 10px 12px;
    font-size: 13px;
    line-height: 20px;
  }
  &__destination small {
    display: block;
    font-size: 12px;
    color: var(--sd-modern-muted);
  }
  &__destination > svg {
    flex-shrink: 0;
  }
  &__destination > span {
    min-width: 0;
    overflow-wrap: anywhere;
  }
  &__nav {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    padding-block: 6px;
    margin-bottom: 14px;
  }
  &__nav > button {
    width: auto;
    min-height: 42px;
  }
  &__workspace {
    min-width: 0;
    position: relative;
  }
  &__progress {
    position: absolute;
    inset-block-start: 0;
    inset-inline: 0;
  }
  &__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 24px;
  }
  &__tools {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    flex-wrap: wrap;
    gap: 8px;
  }
  &__audience {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    margin-top: 10px;
    font-size: 12px;
    color: var(--sd-modern-muted);
  }
  &__state {
    display: flex;
    align-items: center;
    gap: 12px;
    min-height: 100px;
    font-size: 14px;
  }
  &__json {
    max-height: 440px;
    overflow: auto;
    padding-block: 8px;
    font-size: 13px;
    text-align: left;
  }
  &__editor {
    :deep(textarea) {
      font:
        13px/1.7 ui-monospace,
        SFMono-Regular,
        Consolas,
        monospace;
    }
  }
  &__empty {
    padding-block: 24px;
    font-size: 14px;
    color: var(--sd-modern-muted);
  }
  &__feedback {
    margin-top: 16px;
    font-size: 14px;
  }
  &__replace,
  &__storage {
    margin-top: 16px;
  }
  &__actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    flex-wrap: wrap;
    gap: 12px;
    margin-top: 20px;
  }
  &__actions > span {
    margin-inline-end: auto;
  }
  &__json:focus-visible {
    outline: 2px solid rgb(var(--v-theme-primary));
    outline-offset: 4px;
  }
  &:dir(rtl) &__branches {
    transform: scaleX(-1);
  }
  @media (max-width: 700px) {
    &__illustration {
      flex-direction: column;
      align-items: stretch;
      gap: 16px;
    }
    &__diagram {
      flex: 0 1 auto;
      max-width: 360px;
      width: 100%;
    }
    &__header {
      flex-wrap: wrap;
    }
    &__nav > button {
      min-height: 44px;
    }
  }
}
</style>
