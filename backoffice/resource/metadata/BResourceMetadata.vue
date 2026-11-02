<template>
  <div class="b-resource-metadata text-start" :aria-busy="busy">
    <div class="b-resource-metadata__map">
      <div class="b-resource-metadata__origin">
        <slot name="resource-icon"
          ><v-icon size="18" aria-hidden="true">data_object</v-icon></slot
        >
        <span>{{ resourceLabel }}</span>
      </div>
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
          <svg
            v-if="section.field === 'meta'"
            class="b-resource-metadata__brand"
            viewBox="0 0 141.45 180.69"
            fill="currentColor"
            aria-hidden="true"
            focusable="false"
          >
            <path
              d="M77.43 128.05c-17.68 0-33.69-7.17-45.27-18.75C20.57 97.71 13.4 81.7 13.4 64.02c0-17.67 7.17-33.68 18.76-45.27C43.74 7.17 59.75 0 77.43 0c17.68 0 33.68 7.17 45.27 18.75 11.59 11.59 18.75 27.6 18.75 45.27h-30.13c0-9.36-3.79-17.83-9.92-23.96-6.14-6.14-14.61-9.93-23.97-9.93s-17.84 3.79-23.97 9.93c-6.13 6.13-9.93 14.6-9.93 23.96 0 9.37 3.8 17.84 9.93 23.97a33.764 33.764 0 0 0 23.97 9.93v30.13z"
            />
            <path
              d="M64.02 52.64c17.68 0 33.69 7.17 45.28 18.76 11.58 11.58 18.75 27.59 18.75 45.27 0 17.68-7.17 33.68-18.75 45.27-11.59 11.59-27.6 18.75-45.28 18.75-17.67 0-33.68-7.17-45.27-18.75C7.17 150.35 0 134.35 0 116.67h30.13c0 9.36 3.79 17.83 9.93 23.97 6.13 6.13 14.6 9.92 23.96 9.92 9.37 0 17.84-3.79 23.97-9.92 6.14-6.14 9.93-14.61 9.93-23.97s-3.79-17.84-9.93-23.97c-6.13-6.13-14.6-9.93-23.97-9.93V52.64z"
            />
          </svg>
          <svg
            v-else
            class="b-resource-metadata__section-icon"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.55"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
            focusable="false"
          >
            <template v-if="section.field === 'public_attributes'">
              <circle cx="12" cy="12" r="10" />
              <path
                d="M2 12h20M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"
              />
            </template>
            <template v-else-if="section.field === 'private_attributes'">
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              <circle cx="12" cy="16" r="1" />
            </template>
            <template v-else>
              <rect x="4" y="8" width="16" height="12" rx="3" />
              <path d="M12 8V4H9M2 13v3m20-3v3M8 16h.01M16 16h.01" />
            </template>
          </svg>
          <span class="b-resource-metadata__section-copy">
            <span class="b-resource-metadata__section-title">{{
              $t("resource_metadata." + section.field)
            }}</span>
            <span class="b-resource-metadata__section-audience">{{
              $t("resource_metadata." + section.field + "_audience")
            }}</span>
          </span>
        </button>
      </nav>
    </div>

    <section class="sd-modern-widget b-resource-metadata__workspace">
      <v-progress-linear
        v-if="entry.loading && entry.loaded"
        class="b-resource-metadata__progress"
        indeterminate
      />
      <header class="b-resource-metadata__header">
        <div class="b-resource-metadata__heading">
          <div class="b-resource-metadata__heading-line">
            <h3 class="b-resource-metadata__title">
              {{ $t("resource_metadata." + selected) }}
            </h3>
            <v-tooltip
              location="top"
              content-class="sd-modern-tooltip text-start"
              open-on-hover
              open-on-focus
              open-on-click
            >
              <template #activator="{ props }">
                <button
                  v-bind="props"
                  type="button"
                  class="b-resource-metadata__column-button"
                >
                  <code class="b-resource-metadata__column" dir="ltr">{{
                    selected
                  }}</code>
                </button>
              </template>
              {{ $t("resource_metadata.column_help") }}
            </v-tooltip>
          </div>
          <div class="b-resource-metadata__help-row">
            <p class="sd-modern-subtitle b-resource-metadata__help">
              {{ $t("resource_metadata." + selected + "_help") }}
            </p>
            <v-tooltip
              v-if="canEdit"
              location="top"
              content-class="sd-modern-tooltip text-start"
              open-on-hover
              open-on-focus
              open-on-click
            >
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  class="sd-modern-icon-button sd-modern-info-button"
                  variant="text"
                  icon
                  :aria-label="
                    $t('global.commons.help') +
                    ' · ' +
                    $t('resource_metadata.' + selected)
                  "
                  ><v-icon size="16" aria-hidden="true"
                    >info_outline</v-icon
                  ></v-btn
                >
              </template>
              {{ $t("resource_metadata.advanced_help") }}
            </v-tooltip>
          </div>
        </div>
        <div class="b-resource-metadata__tools">
          <span
            v-if="!canEdit"
            class="sd-modern-status sd-modern-status--plain b-resource-metadata__readonly"
          >
            <v-icon size="12" aria-hidden="true">lock_outline</v-icon
            >{{ $t("resource_metadata.readonly") }}
          </span>
          <template v-if="entry.loaded && !entry.editing">
            <v-btn
              v-if="canEdit && !empty"
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
        class="sd-modern-notice b-resource-metadata__state"
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
          <div
            class="sd-modern-notice b-resource-metadata__advisory"
            role="note"
          >
            <v-icon size="17" aria-hidden="true">info_outline</v-icon>
            <span class="sd-modern-notice__content">{{
              $t("resource_metadata.advanced_help")
            }}</span>
          </div>
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
          <p class="sd-modern-subtitle b-resource-metadata__storage">
            {{ $t("resource_metadata.storage_help") }}
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
          <div
            v-if="empty"
            class="sd-modern-illustration b-resource-metadata__empty"
          >
            <svg
              class="b-resource-metadata__empty-art"
              :class="{
                'b-resource-metadata__empty-art--animated':
                  active && !emptyMotionFinished,
              }"
              viewBox="0 0 220 140"
              fill="none"
              aria-hidden="true"
              focusable="false"
              @animationend.self="emptyMotionFinished = true"
            >
              <ellipse
                cx="110"
                cy="122"
                rx="61"
                ry="7"
                class="b-resource-metadata__art-shadow"
              />
              <g class="b-resource-metadata__art-back">
                <rect
                  x="58"
                  y="23"
                  width="104"
                  height="85"
                  rx="12"
                  class="b-resource-metadata__art-paper-back"
                />
                <path
                  d="M79 45h62M79 57h41"
                  class="b-resource-metadata__art-line"
                />
              </g>
              <g class="b-resource-metadata__art-front">
                <rect
                  x="49"
                  y="43"
                  width="122"
                  height="72"
                  rx="12"
                  class="b-resource-metadata__art-paper"
                />
                <path
                  d="M65 62h90M65 76h90M65 90h90"
                  class="b-resource-metadata__art-dash"
                />
                <rect
                  x="87"
                  y="61"
                  width="46"
                  height="34"
                  rx="9"
                  class="b-resource-metadata__art-paper"
                />
                <text
                  x="110"
                  y="83"
                  text-anchor="middle"
                  class="b-resource-metadata__art-braces"
                >
                  { }
                </text>
              </g>
              <circle
                cx="174"
                cy="38"
                r="4"
                class="b-resource-metadata__art-dot"
              />
              <circle
                cx="43"
                cy="95"
                r="2.5"
                class="b-resource-metadata__art-dot b-resource-metadata__art-dot--small"
              />
            </svg>
            <h4 class="b-resource-metadata__empty-title">
              {{ $t("resource_metadata.empty_" + selected) }}
            </h4>
            <v-btn
              v-if="canEdit"
              class="sd-modern-button sd-modern-button--primary"
              color="primary"
              variant="elevated"
              prepend-icon="add"
              :disabled="busy || parentBusy"
              @click="edit"
              >{{ $t("resource_metadata.add") }}</v-btn
            >
          </div>
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
    </section>
  </div>
</template>

<script lang="ts">
import VueJsonPretty from "vue-json-pretty";
import "vue-json-pretty/lib/styles.css";

const sections = [
  { field: "public_attributes" },
  { field: "private_attributes" },
  { field: "ai_agent" },
  { field: "meta" },
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
    resourceLabel: { type: String, required: true },
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
    emptyMotionFinished: false,
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
      if (!value) this.emptyMotionFinished = true;
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
      this.emptyMotionFinished = false;
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
        this.entry.editing ||
        this.busy ||
        this.parentBusy
      )
        return;
      this.entry.editing = true;
      this.entry.saved = false;
      if (this.entry.value === null) this.entry.draft = "{}";
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
  container: resource-metadata / inline-size;
  min-width: 0;

  &__map {
    margin-bottom: 25px;
  }
  &__origin {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 9px;
    width: max-content;
    max-width: 100%;
    margin: 0 auto;
    padding: 8px 16px;
    position: relative;
    font-size: 13px;
    line-height: 20px;
    color: rgb(var(--v-theme-on-surface));
    overflow-wrap: anywhere;
    &::after {
      content: "";
      position: absolute;
      inset-block-start: 100%;
      inset-inline-start: 50%;
      block-size: 17px;
      border-inline-start: 1px solid var(--sd-modern-border);
    }
  }
  &__nav {
    position: relative;
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 6px;
    margin-top: 26px;
    padding-block: 6px;
    &::before {
      content: "";
      position: absolute;
      inset-inline: calc(12.5% - 2.25px);
      inset-block-start: -10px;
      border-block-start: 1px solid var(--sd-modern-border);
    }
    > button {
      position: relative;
      justify-content: center;
      width: 100%;
      min-height: 72px;
      padding: 12px 8px;
      border-radius: 12px;
      &::before {
        content: "";
        position: absolute;
        inset-block-start: -17px;
        inset-inline-start: 50%;
        block-size: 16px;
        border-inline-start: 1px solid var(--sd-modern-border);
      }
    }
  }
  &__brand {
    flex: 0 0 14px;
    width: 14px;
    height: 18px;
  }
  &__section-icon {
    flex: 0 0 18px;
  }
  &__section-copy {
    min-width: 0;
  }
  &__section-title {
    display: block;
    font-size: 13px;
    font-weight: 500;
    line-height: 20px;
  }
  &__section-audience {
    display: block;
    margin-top: 2px;
    color: var(--sd-modern-muted);
    font-size: 11px;
    font-weight: 400;
    line-height: 16.5px;
  }
  &__workspace {
    position: relative;
    min-width: 0;
    padding: 24px;
    border-radius: 18px;
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
    gap: 15px;
  }
  &__heading {
    min-width: 0;
  }
  &__heading-line {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 9px;
  }
  &__title {
    margin: 0;
    font-size: 17px;
    font-weight: 500;
    line-height: 25.5px;
  }
  &__column-button {
    display: inline-flex;
    align-items: center;
    min-height: 24px;
    padding: 2px 4px;
    border: 0;
    border-radius: 4px;
    background: none;
    cursor: help;
    &:focus-visible {
      outline: 2px solid rgb(var(--v-theme-primary));
      outline-offset: 2px;
    }
  }
  &__column {
    padding: 0;
    background: none;
    color: var(--sd-modern-muted);
    font:
      11px/16.5px ui-monospace,
      SFMono-Regular,
      Consolas,
      monospace;
    overflow-wrap: anywhere;
  }
  &__help-row {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 5px;
  }
  &__help.sd-modern-subtitle {
    margin-top: 0;
    font-size: 12px;
    line-height: 18px;
  }
  &__tools {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    flex-wrap: wrap;
    flex-shrink: 0;
    gap: 8px;
  }
  &__readonly {
    gap: 5px;
    font-size: 11px;
    line-height: 16.5px;
    white-space: nowrap;
  }
  &__advisory {
    margin-top: 20px;
  }
  &__state {
    display: flex;
    align-items: center;
    gap: 12px;
    min-height: 273px;
    font-size: 14px;
    margin-top: 0;
  }
  &__json {
    max-height: 440px;
    min-height: 273px;
    overflow: auto;
    padding-block: 22px 12px;
    font-size: 13px;
    line-height: 24px;
    text-align: left;
  }
  &__editor {
    margin-top: 20px;
    :deep(textarea) {
      font:
        13px/1.8 ui-monospace,
        SFMono-Regular,
        Consolas,
        monospace;
    }
  }
  &__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    gap: 15px;
    min-height: 273px;
    padding-block: 22px 15px;
    text-align: center;
  }
  &__empty-art {
    display: block;
    width: 190px;
    max-width: 100%;
    height: 121px;
  }
  &__empty-title {
    margin: 0;
    font-size: 13px;
    font-weight: 400;
    line-height: 20px;
    color: var(--sd-modern-muted);
  }
  &__art-shadow {
    fill: rgba(var(--v-theme-on-surface), 0.04);
  }
  &__art-paper-back {
    fill: rgba(var(--v-theme-on-surface), 0.035);
    stroke: var(--sd-modern-border);
  }
  &__art-paper {
    fill: rgb(var(--v-theme-surface));
    stroke: var(--sd-modern-border);
  }
  &__art-line {
    stroke: var(--sd-modern-border);
    stroke-width: 2;
    stroke-linecap: round;
  }
  &__art-dash {
    stroke: var(--sd-modern-border);
    stroke-dasharray: 3 5;
  }
  &__art-braces {
    fill: rgb(var(--sd-modern-illustration-accent-rgb));
    font:
      500 20px ui-monospace,
      Consolas,
      monospace;
  }
  &__art-dot {
    fill: rgb(var(--sd-modern-illustration-accent-rgb));
    opacity: 0.6;
  }
  &__art-dot--small {
    opacity: 0.35;
  }
  &__empty-art--animated {
    animation: metadata-empty-complete 3s linear both;
    .b-resource-metadata__art-back {
      animation: metadata-empty-settle 1.4s ease-out both;
    }
    .b-resource-metadata__art-front {
      animation: metadata-empty-settle 1.8s 0.15s ease-out both;
    }
    .b-resource-metadata__art-dot {
      animation: metadata-empty-dot 2.4s ease-out both;
    }
  }
  &__feedback {
    margin-top: 16px;
    font-size: 14px;
  }
  &__replace,
  &__storage {
    margin-top: 10px;
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

  @container resource-metadata (max-width: 620px) {
    &__header {
      flex-wrap: wrap;
    }
    &__tools {
      margin-inline-start: auto;
    }
  }
  @container resource-metadata (max-width: 520px) {
    &__origin {
      margin: 0;
      padding-inline: 5px;
      &::after {
        display: none;
      }
    }
    &__nav {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 10px;
      margin-top: 8px;
      &::before {
        display: none;
      }
      > button {
        min-height: 65px;
        padding: 10px;
        justify-content: flex-start;
        &::before {
          display: none;
        }
      }
    }
    &__workspace {
      padding: 20px;
    }
    &__header {
      gap: 13px;
    }
    &__tools {
      gap: 5px;
    }
    &__editor :deep(textarea) {
      font-size: 16px;
    }
  }
  @media (pointer: coarse) {
    &__column-button {
      min-width: 44px;
      min-height: 44px;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    &__empty-art--animated,
    &__empty-art--animated * {
      animation: none;
    }
  }
}
@keyframes metadata-empty-complete {
  from {
    opacity: 1;
  }
  to {
    opacity: 1;
  }
}
@keyframes metadata-empty-settle {
  from {
    opacity: 0;
    transform: translateY(9px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
@keyframes metadata-empty-dot {
  from {
    opacity: 0;
    transform: translateY(5px);
  }
  to {
    opacity: 0.6;
    transform: translateY(0);
  }
}
</style>
