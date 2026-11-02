<template>
  <div class="b-shop-layout-editor text-start" :aria-busy="isBusy">
    <section class="sd-modern-widget b-shop-layout-editor__widget">
      <header class="b-shop-layout-editor__heading">
        <div>
          <h2>{{ t(isDefault ? "default_title" : "domain_title") }}</h2>
          <p>{{ t(isDefault ? "default_help" : "domain_help") }}</p>
        </div>
        <v-btn
          v-if="previewLink"
          :href="previewLink"
          target="_blank"
          rel="noopener noreferrer"
          class="sd-modern-button sd-modern-button--inline"
          color="primary"
          variant="text"
          :disabled="saving"
          ><v-icon size="16" start>visibility</v-icon>{{ t("preview")
          }}<v-icon size="16" end>north_east</v-icon></v-btn
        >
      </header>
      <v-progress-linear
        v-if="loading && !pickerOpen"
        indeterminate
        color="primary"
        class="b-shop-layout-editor__progress"
      />
      <div v-if="error" class="sd-modern-notice" role="alert">
        <v-icon size="18">error_outline</v-icon>
        <div class="sd-modern-notice__content">{{ error }}</div>
        <v-btn
          class="sd-modern-button sd-modern-button--inline"
          variant="text"
          :disabled="loading"
          @click="loadOptions()"
          >{{ t("retry") }}</v-btn
        >
      </div>
      <template v-if="loaded">
        <div class="b-shop-layout-editor__current">
          <div
            class="b-shop-layout-editor__image"
            role="img"
            :aria-label="
              t(hasCustomLayout ? 'custom_visual_help' : 'standard_visual_help')
            "
          >
            <v-img
              v-if="displayed.image_url || displayed.image"
              :src="displayed.image_url || getShopImagePath(displayed.image)"
              alt=""
              cover
            /><b-shop-layout-illustration v-else :active="hasCustomLayout" />
          </div>
          <div class="b-shop-layout-editor__identity">
            <span class="b-shop-layout-editor__meta">{{
              t(
                draft.mode === "inherit"
                  ? "inherited"
                  : draft.mode === "standard"
                    ? "standard_kind"
                    : draft.mode,
              )
            }}</span>
            <h3>
              {{
                displayed.name ||
                t(draft.mode === "inherit" ? "shop_default" : "standard")
              }}
            </h3>
            <p
              v-if="displayed.version || displayed.package"
              class="b-shop-layout-editor__meta"
            >
              <bdi>{{ displayed.package }}</bdi
              ><span v-if="displayed.version"
                >{{ displayed.package ? " · " : ""
                }}{{ displayed.version }}</span
              >
            </p>
            <p>
              {{
                t(
                  draft.mode === "inherit"
                    ? "inherit_help"
                    : isDefault
                      ? "default_help"
                      : "override_help",
                )
              }}
            </p>
            <div class="b-shop-layout-editor__current-actions">
              <v-btn
                :id="`layout-picker-activator-${$.uid}`"
                class="sd-modern-button b-shop-layout-editor__change"
                variant="outlined"
                :disabled="!canEdit || isBusy"
                :aria-label="
                  hasCustomLayout
                    ? t('change_selected', {
                        name: displayed.name || t('unavailable'),
                      })
                    : t('change')
                "
                @click="openPicker"
                ><span class="b-shop-layout-editor__change-label"
                  ><v-icon size="16" aria-hidden="true"
                    >dashboard_customize</v-icon
                  >{{ t("change") }}</span
                ><span
                  v-if="hasCustomLayout"
                  class="b-shop-layout-editor__change-name"
                  ><span>{{ displayed.name || t("unavailable") }}</span></span
                ></v-btn
              >
              <v-select
                v-if="draft.mode === 'private' && versionOptions.length"
                v-model="draft.layout_version"
                :items="versionOptions"
                item-title="title"
                item-value="value"
                :aria-label="t('version')"
                :disabled="!canEdit || isBusy"
                class="b-shop-layout-editor__version"
                variant="solo"
                density="compact"
                flat
                single-line
                hide-details
              >
                <template #prepend-inner>
                  <v-icon size="16" aria-hidden="true">inventory_2</v-icon>
                </template>
              </v-select>
              <v-btn
                v-if="!isDefault && draft.mode !== 'inherit'"
                class="sd-modern-button sd-modern-button--inline"
                color="primary"
                variant="text"
                :disabled="!canEdit || isBusy"
                @click="useInherited"
                >{{ t("use_default") }}</v-btn
              >
            </div>
          </div>
        </div>
        <div
          v-if="displayed.available === false"
          class="sd-modern-notice b-shop-layout-editor__unavailable"
          role="status"
        >
          <v-icon size="18" color="warning">warning_amber</v-icon
          ><span class="sd-modern-notice__content">{{
            t("unavailable_help")
          }}</span>
        </div>
        <p v-if="!canEdit" class="b-shop-layout-editor__read-only">
          {{ t("read_only") }}
        </p>
        <div class="b-shop-layout-editor__savebar">
          <span>{{
            t(
              isDirty
                ? "unsaved"
                : isDefault
                  ? "default_scope"
                  : "domain_scope",
            )
          }}</span>
          <div class="b-shop-layout-editor__actions">
            <v-btn
              v-if="isDirty"
              class="sd-modern-button"
              variant="outlined"
              :disabled="saving"
              @click="discard"
              >{{ t("cancel") }}</v-btn
            ><v-btn
              class="sd-modern-button sd-modern-button--primary"
              color="primary"
              variant="elevated"
              :disabled="!canSave"
              :loading="saving"
              @click="save"
              ><v-icon size="16" start>save</v-icon
              >{{ t(isDefault ? "save_default" : "save_domain") }}</v-btn
            >
          </div>
        </div>
      </template>
    </section>
    <section
      v-if="isDefault && loaded"
      class="sd-modern-widget b-shop-layout-editor__widget"
    >
      <h2>{{ t("used_by") }}</h2>
      <p class="b-shop-layout-editor__description">{{ t("used_by_help") }}</p>
      <div class="b-shop-layout-editor__scope-list">
        <div
          v-for="domain in scopeDomains"
          :key="domain.domain?.id || domain.official"
          class="b-shop-layout-editor__scope"
        >
          <v-icon size="16" aria-hidden="true">language</v-icon
          ><bdi>{{ domain.url.replace(/^https?:\/\//, "") }}</bdi
          ><span>{{
            t(
              domain.layout_summary?.inherited !== false
                ? "follows_default"
                : "keeps_override",
            )
          }}</span
          ><b-domain-layout-mark
            :summary="domain.layout_summary"
            :shop-id="shop.id"
            :domain-key="domain.domain?.id || domain.official"
          />
        </div>
      </div>
    </section>
    <v-dialog
      v-model="pickerOpen"
      :activator="`#layout-picker-activator-${$.uid}`"
      :open-on-click="false"
      :aria-labelledby="`${$.uid}-layout-picker-title`"
      fullscreen
      scrollable
      transition="dialog-bottom-transition"
      :persistent="saving"
      @keydown.esc.capture="dismissPickerHelp"
    >
      <v-card class="sd-modern-widget b-shop-layout-editor__picker text-start">
        <header class="b-shop-layout-editor__picker-heading">
          <div>
            <h2 :id="`${$.uid}-layout-picker-title`">{{ t("choose") }}</h2>
            <p>
              {{ t(isDefault ? "choose_default_help" : "choose_domain_help") }}
            </p>
          </div>
          <v-btn
            class="sd-modern-icon-button"
            icon
            variant="text"
            :aria-label="t('close')"
            @click="pickerOpen = false"
            ><v-icon size="16">close</v-icon
            ><v-tooltip
              :model-value="pickerHelp"
              @update:model-value="pickerHelp = $event"
              activator="parent"
              location="top"
              open-on-focus
              content-class="sd-modern-tooltip text-start"
              >{{ t("close") }}</v-tooltip
            ></v-btn
          >
        </header>
        <v-card-text class="sd-modern-canvas b-shop-layout-editor__picker-body">
          <div class="b-shop-layout-editor__picker-content">
            <div v-if="!isDefault" class="b-shop-layout-editor__plain-options">
              <v-btn
                class="b-shop-layout-editor__plain-option"
                :class="{
                  'b-shop-layout-editor__option--selected':
                    pickerSelection.mode === 'inherit',
                }"
                variant="outlined"
                :aria-pressed="pickerSelection.mode === 'inherit'"
                @click="pick({ mode: 'inherit' })"
                ><v-icon size="18" start>{{
                  pickerSelection.mode === "inherit"
                    ? "radio_button_checked"
                    : "radio_button_unchecked"
                }}</v-icon
                ><span
                  >{{ t("shop_default")
                  }}<small>{{ t("inherit_help") }}</small></span
                ></v-btn
              >
            </div>
            <div
              class="sd-modern-list-toolbar b-shop-layout-editor__picker-toolbar"
            >
              <v-tabs
                v-model="sourceTab"
                hide-slider
                class="b-shop-layout-editor__tabs"
                :aria-label="t('source')"
                ><v-tab
                  v-for="source in ['official', 'private']"
                  :key="source"
                  :value="source"
                  :class="{
                    'b-shop-layout-editor__tab--selected': sourceTab === source,
                  }"
                  ><v-icon size="16" aria-hidden="true">{{
                    source === "official" ? "verified" : "code"
                  }}</v-icon>
                  <span>{{
                    t(source === "private" ? "my_layouts" : "official_layouts")
                  }}</span>
                  <span
                    class="b-shop-layout-editor__source-count"
                    :class="{
                      'b-shop-layout-editor__source-count--unknown':
                        (source === 'official'
                          ? officialTotal
                          : privateTotal) == null,
                    }"
                    >{{
                      (source === "official" ? officialTotal : privateTotal) ??
                      "—"
                    }}</span
                  ></v-tab
                ></v-tabs
              ><v-text-field
                v-model="search"
                variant="plain"
                density="compact"
                single-line
                clearable
                hide-details
                maxlength="80"
                prepend-inner-icon="search"
                :placeholder="t('search')"
                :aria-label="t('search')"
                class="b-shop-layout-editor__search"
              />
            </div>
            <div v-if="pickerError" class="sd-modern-notice" role="alert">
              <v-icon size="18">error_outline</v-icon
              ><span class="sd-modern-notice__content">{{ pickerError }}</span
              ><v-btn
                class="sd-modern-button sd-modern-button--inline"
                variant="text"
                @click="loadOptions(true)"
                >{{ t("retry") }}</v-btn
              >
            </div>
            <div class="b-shop-layout-editor__choices" :aria-busy="loading">
              <b-list-loading-state
                v-if="loading && !visibleLayouts.length"
                kind="content"
                :title="t('loading_layouts')"
                :description="t('loading_help')"
                class="b-shop-layout-editor__list-state"
              />
              <v-progress-linear
                v-else-if="loading"
                indeterminate
                color="primary"
                class="b-shop-layout-editor__progress"
              />
              <article
                v-for="layout in visibleLayouts"
                :key="layout.id"
                class="b-shop-layout-editor__choice"
                :class="{
                  'b-shop-layout-editor__option--selected': isPicked(layout),
                }"
              >
                <button
                  type="button"
                  class="b-shop-layout-editor__choice-select"
                  :aria-pressed="isPicked(layout)"
                  @click="pickLayout(layout)"
                >
                  <div class="b-shop-layout-editor__choice-image">
                    <v-img
                      v-if="layout.image_url || layout.image"
                      :src="layout.image_url || getShopImagePath(layout.image)"
                      alt=""
                      :aspect-ratio="1.6"
                      cover
                    /><v-icon v-else size="36" aria-hidden="true"
                      >layers</v-icon
                    >
                  </div>
                  <span class="b-shop-layout-editor__choice-copy"
                    ><span class="b-shop-layout-editor__choice-title"
                      >{{ layout.title || layout.name
                      }}<v-icon
                        v-if="isPicked(layout)"
                        size="18"
                        color="primary"
                        >check_circle</v-icon
                      ></span
                    ><span class="b-shop-layout-editor__meta">{{
                      sourceTab === "official" ? layout.summary : layout.package
                    }}</span
                    ><span class="b-shop-layout-editor__meta">{{
                      layout.version ||
                      layout.version_stable ||
                      layout.version_beta
                    }}</span></span
                  >
                </button>
                <div
                  v-if="sourceTab === 'official' && repositoryUrl(layout)"
                  class="b-shop-layout-editor__choice-actions"
                >
                  <v-btn
                    :href="repositoryUrl(layout)"
                    target="_blank"
                    rel="noopener noreferrer"
                    color="primary"
                    variant="text"
                    class="sd-modern-button sd-modern-button--inline b-shop-layout-editor__source"
                  >
                    {{ t("github_source")
                    }}<v-icon size="14" end aria-hidden="true"
                      >north_east</v-icon
                    >
                    <v-tooltip
                      :model-value="sourceHelp === String(layout.id)"
                      activator="parent"
                      location="top"
                      open-on-focus
                      content-class="sd-modern-tooltip text-start"
                      @update:model-value="setSourceHelp(layout, $event)"
                      >{{ t("github_help") }}</v-tooltip
                    >
                  </v-btn>
                  <v-btn
                    variant="text"
                    class="sd-modern-button sd-modern-button--inline b-shop-layout-editor__customize"
                    @click="openCustomize(layout, $event)"
                  >
                    <v-icon size="16" start aria-hidden="true">tune</v-icon
                    >{{ t("how_customize") }}
                  </v-btn>
                </div>
              </article>
              <b-list-empty-state
                v-if="
                  loaded && !loading && !pickerError && !visibleLayouts.length
                "
                kind="content"
                :title="
                  t(
                    search?.trim()
                      ? 'no_results'
                      : sourceTab === 'private'
                        ? 'empty_private'
                        : 'empty_official',
                  )
                "
                :description="
                  t(
                    search?.trim()
                      ? 'no_results_help'
                      : sourceTab === 'private'
                        ? 'empty_private_help'
                        : 'empty_official_help',
                  )
                "
                class="b-shop-layout-editor__list-state"
              />
            </div>
            <v-btn
              v-if="hasMore"
              class="sd-modern-button sd-modern-button--inline"
              variant="text"
              :disabled="loading"
              @click="loadOptions(true, true)"
              >{{ t("load_more") }}</v-btn
            >
            <p
              v-if="sourceTab === 'private'"
              class="b-shop-layout-editor__description"
            >
              {{ t("private_help") }}
            </p>
            <div class="b-shop-layout-editor__library-actions">
              <v-btn
                href="/custom-layouts"
                target="_blank"
                rel="noopener noreferrer"
                class="sd-modern-button sd-modern-button--inline"
                color="primary"
                variant="text"
                >{{ t("explore")
                }}<v-icon size="16" end>north_east</v-icon></v-btn
              >
              <v-btn
                :to="{ name: 'DeveloperLayoutsListPage' }"
                target="_blank"
                rel="noopener noreferrer"
                class="sd-modern-button sd-modern-button--inline"
                color="primary"
                variant="text"
                >{{ t("manage_private")
                }}<v-icon size="16" end>north_east</v-icon></v-btn
              >
            </div>
          </div>
        </v-card-text>
        <footer class="b-shop-layout-editor__picker-footer">
          <v-btn
            class="sd-modern-button sd-modern-button--inline b-shop-layout-editor__reset"
            variant="text"
            :disabled="!canEdit || isBusy"
            @click="resetToStandard"
            ><v-icon size="16" start aria-hidden="true">restart_alt</v-icon
            >{{ t("reset_standard") }}</v-btn
          >
          <div class="b-shop-layout-editor__actions">
            <v-btn
              class="sd-modern-button"
              variant="outlined"
              @click="pickerOpen = false"
              >{{ t("cancel") }}</v-btn
            ><v-btn
              class="sd-modern-button sd-modern-button--primary"
              color="primary"
              variant="elevated"
              :disabled="loading || !pickerCanSelect"
              @click="confirmPicker"
              ><v-icon size="16" start>check</v-icon>{{ t("select") }}</v-btn
            >
          </div>
          <span class="b-shop-layout-editor__picker-help">{{
            t("select_help")
          }}</span>
        </footer>
      </v-card>
    </v-dialog>
    <b-official-layout-customize-dialog
      v-if="customizeLayout"
      :model-value="!!customizeLayout"
      :layout="customizeLayout"
      @update:model-value="
        (open) => {
          if (!open) closeCustomize();
        }
      "
    />
  </div>
</template>

<script lang="ts">
import { DomainsHelper } from "@selldone/core-js/helper/domain/DomainsHelper";
import threads from "@selldone/core-js/utils/thread/threads";
import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";
import BDomainLayoutMark from "./BDomainLayoutMark.vue";
import BListLoadingState from "@selldone/components-vue/backoffice/loading-state/BListLoadingState.vue";
import BListEmptyState from "@selldone/components-vue/backoffice/empty-state/BListEmptyState.vue";
import BShopLayoutIllustration from "./BShopLayoutIllustration.vue";
import BOfficialLayoutCustomizeDialog, {
  officialLayoutRepository,
} from "./BOfficialLayoutCustomizeDialog.vue";

const selection = (value: any = {}) => {
  const mode = value.mode || "standard";
  return {
    mode,
    layout_id: mode === "private" ? (value.layout_id ?? null) : null,
    official_layout_id:
      mode === "official" ? (value.official_layout_id ?? null) : null,
    layout_version: mode === "private" ? (value.layout_version ?? null) : null,
  };
};
const same = (left, right) =>
  JSON.stringify(selection(left)) === JSON.stringify(selection(right));

export default {
  name: "BShopLayoutEditor",
  components: {
    BDomainLayoutMark,
    BListLoadingState,
    BListEmptyState,
    BShopLayoutIllustration,
    BOfficialLayoutCustomizeDialog,
  },
  props: {
    shop: { type: Object, required: true },
    domainKey: { type: [String, Number], default: "default" },
    domainItem: Object,
    readOnly: Boolean,
  },
  emits: ["saved", "state"],
  data: () => ({
    loaded: false,
    loading: false,
    saving: false,
    error: "",
    pickerError: "",
    requestId: 0,
    baseline: selection(),
    draft: selection(),
    summary: {},
    officialLayouts: [],
    privateLayouts: [],
    officialTotal: null,
    privateTotal: null,
    offset: 0,
    draftRecord: null,
    optionsCanWrite: false,
    previewUrl: "",
    pickerOpen: false,
    pickerHelp: false,
    sourceHelp: null,
    pickerSelection: selection(),
    sourceTab: "official",
    search: "",
    customizeLayout: null,
    customizeActivator: null,
  }),
  computed: {
    isDefault() {
      return this.domainKey === "default";
    },
    scopeKey() {
      return `${this.shop.id}:${this.domainKey}`;
    },
    isDirty() {
      return this.loaded && !same(this.draft, this.baseline);
    },
    isBusy() {
      return this.loading || this.saving;
    },
    canEdit() {
      return this.optionsCanWrite && !this.readOnly;
    },
    canSave() {
      return (
        this.canEdit &&
        this.isDirty &&
        !this.isBusy &&
        this.isSelectable(this.draft)
      );
    },
    pickerCanSelect() {
      return this.canEdit && this.isSelectable(this.pickerSelection);
    },
    hasMore() {
      const total =
        this.sourceTab === "official" ? this.officialTotal : this.privateTotal;
      return total != null && this.visibleLayouts.length < total;
    },
    visibleLayouts() {
      return this.sourceTab === "official"
        ? this.officialLayouts
        : this.privateLayouts;
    },
    displayed() {
      if (!this.isDirty) {
        const candidates =
          this.summary.effective_mode === "official"
            ? this.officialLayouts
            : this.summary.effective_mode === "private"
              ? this.privateLayouts
              : [];
        const selectedId =
          this.summary.effective_mode === "official"
            ? this.summary.official_layout_id
            : this.summary.layout_id;
        const candidate = candidates.find(
          (item) => String(item.id) === String(selectedId),
        );
        return {
          ...candidate,
          ...this.summary,
          name:
            this.summary.effective_mode === "standard"
              ? this.t("standard")
              : this.summary.name,
        };
      }
      if (this.draft.mode === "inherit")
        return {
          ...(this.shop.layout_summary || {}),
          name: this.shop.layout_summary?.name || this.t("shop_default"),
          inherited: true,
        };
      if (this.draft.mode === "standard")
        return { name: this.t("standard"), available: true };
      const candidate = this.findRecord(this.draft);
      return candidate
        ? {
            ...candidate,
            name: candidate.title || candidate.name,
            version:
              this.draft.layout_version ||
              candidate.version ||
              candidate.version_stable ||
              candidate.version_beta,
          }
        : { ...this.summary, available: false };
    },
    hasCustomLayout() {
      return ["official", "private"].includes(
        this.displayed.effective_mode || this.draft.mode,
      );
    },
    versionOptions() {
      const layout = this.findRecord(this.draft);
      const versions = [
        ...new Set(
          [
            ...(layout?.versions || []).map((item) => item.version),
            layout?.version_stable,
            layout?.version_beta,
            this.draft.layout_version,
          ].filter(Boolean),
        ),
      ];
      return [
        { title: this.t("automatic_version"), value: null },
        ...versions.map((value) => ({ title: value, value })),
      ];
    },
    scopeDomains() {
      return DomainsHelper.GetShopDomains(
        this.shop,
        this.shop.domains || [],
      ).filter((item) => !item.domain?.externally_hosted);
    },
    previewLink() {
      if (!this.previewUrl || !this.loaded) return null;
      const url = new URL(this.previewUrl, window.location.origin);
      for (const key of [
        "mode",
        "layout_id",
        "official_layout_id",
        "layout_version",
      ])
        url.searchParams.delete(key);
      Object.entries(this.payload(this.draft)).forEach(([key, value]) => {
        if (value != null) url.searchParams.set(key, String(value));
      });
      return url.href;
    },
  },
  watch: {
    scopeKey: {
      immediate: true,
      handler() {
        this.requestId++;
        this.loaded = false;
        this.loading = false;
        this.saving = false;
        this.pickerOpen = false;
        this.sourceHelp = null;
        this.closeCustomize(false);
        this.search = "";
        this.error = "";
        this.summary = {};
        this.officialLayouts = [];
        this.privateLayouts = [];
        this.officialTotal = this.privateTotal = null;
        this.draftRecord = null;
        this.offset = 0;
        this.loadOptions();
      },
    },
    isDirty() {
      this.emitState();
    },
    isBusy() {
      this.emitState();
    },
    readOnly(value) {
      if (value) this.pickerOpen = false;
    },
    pickerOpen(value) {
      if (!value) {
        this.pickerHelp = false;
        this.sourceHelp = null;
        this.closeCustomize(false);
      }
    },
    visibleLayouts: {
      deep: true,
      handler() {
        this.sourceHelp = null;
      },
    },
    search: threads.debounceSearch(function () {
      this.sourceHelp = null;
      if (this.pickerOpen) this.loadOptions(true);
    }),
  },
  beforeUnmount() {
    this.requestId++;
  },
  methods: {
    repositoryUrl(layout) {
      return officialLayoutRepository(layout?.github_url);
    },
    openCustomize(layout, event) {
      if (
        !this.pickerOpen ||
        this.sourceTab !== "official" ||
        !this.repositoryUrl(layout)
      )
        return;
      this.customizeActivator = event?.currentTarget || null;
      this.sourceHelp = null;
      this.customizeLayout = layout;
    },
    closeCustomize(restoreFocus = true) {
      const activator = this.customizeActivator;
      this.customizeLayout = null;
      this.customizeActivator = null;
      if (restoreFocus)
        this.$nextTick(() => {
          if (this.pickerOpen && activator?.isConnected) activator.focus();
        });
    },
    t(key, values = {}) {
      return this.$t(`domain_layouts.${key}`, values);
    },
    emitState() {
      this.$emit("state", { dirty: this.isDirty, busy: this.saving });
    },
    payload(value) {
      if (value.mode === "official")
        return {
          mode: value.mode,
          official_layout_id: value.official_layout_id,
        };
      if (value.mode === "private")
        return {
          mode: value.mode,
          layout_id: value.layout_id,
          layout_version: value.layout_version,
        };
      return { mode: value.mode };
    },
    isSelectable(value) {
      if (value.mode === "inherit") return !this.isDefault;
      if (value.mode === "standard") return true;
      return (
        !!this.findRecord(value) ||
        (same(value, this.baseline) && this.summary.available !== false)
      );
    },
    findRecord(value) {
      const list =
        value.mode === "official"
          ? this.officialLayouts
          : value.mode === "private"
            ? this.privateLayouts
            : [];
      const id =
        value.mode === "official" ? value.official_layout_id : value.layout_id;
      return (
        list.find((item) => String(item.id) === String(id)) ||
        (this.draftRecord?.mode === value.mode &&
        String(this.draftRecord.id) === String(id)
          ? this.draftRecord
          : null)
      );
    },
    async loadOptions(searchOnly = false, append = false) {
      const requestId = ++this.requestId,
        scope = this.scopeKey;
      const offset = append ? this.offset + 20 : 0;
      this.loading = true;
      if (searchOnly) this.pickerError = "";
      else this.error = "";
      try {
        const url = this.isDefault
          ? window.API.GET_SHOP_LAYOUT_OPTIONS(this.shop.id)
          : window.API.GET_DOMAIN_LAYOUT_OPTIONS(this.shop.id, this.domainKey);
        const { data } = await axios.get(url, {
          params: {
            search: searchOnly ? (this.search || "").slice(0, 80) : undefined,
            offset,
            count: 20,
          },
        });
        if (requestId !== this.requestId || scope !== this.scopeKey) return;
        if (
          data.error ||
          data.success === false ||
          !data.selection ||
          !data.layout_summary
        )
          throw new Error(this.t("load_failed"));
        const merge = (current, next) =>
          append
            ? [
                ...new Map(
                  [...current, ...next].map((item) => [String(item.id), item]),
                ).values(),
              ]
            : next;
        this.officialLayouts = merge(
          this.officialLayouts,
          data.official_layouts || [],
        );
        this.privateLayouts = merge(
          this.privateLayouts,
          data.private_layouts || [],
        );
        this.officialTotal = data.official_total ?? null;
        this.privateTotal = data.private_total ?? null;
        this.offset = offset;
        this.optionsCanWrite = data.can_write === true;
        this.previewUrl = data.preview_url || "";
        if (!searchOnly && !this.isDirty) {
          this.baseline = selection(data.selection);
          this.draft = selection(data.selection);
          this.summary = data.layout_summary;
        }
        this.loaded = true;
      } catch (error) {
        if (requestId !== this.requestId || scope !== this.scopeKey) return;
        if ([401, 403, 404].includes(error?.response?.status)) {
          this.loaded = false;
          this.officialLayouts = [];
          this.privateLayouts = [];
          this.officialTotal = this.privateTotal = null;
          this.pickerOpen = false;
          this.optionsCanWrite = false;
        }
        if (searchOnly) this.pickerError = this.t("load_failed");
        else this.error = this.t("load_failed");
      } finally {
        if (requestId === this.requestId && scope === this.scopeKey)
          this.loading = false;
      }
    },
    openPicker() {
      if (!this.canEdit || this.isBusy) return;
      this.pickerSelection = selection(this.draft);
      this.sourceTab = this.draft.mode === "private" ? "private" : "official";
      this.search = "";
      this.pickerError = "";
      this.pickerOpen = true;
    },
    pick(value) {
      if (!this.canEdit || this.saving) return;
      this.pickerSelection = selection(value);
    },
    pickLayout(layout) {
      this.pick(
        this.sourceTab === "official"
          ? { mode: "official", official_layout_id: layout.id }
          : { mode: "private", layout_id: layout.id },
      );
    },
    isPicked(layout) {
      return (
        this.pickerSelection.mode === this.sourceTab &&
        String(
          this.sourceTab === "official"
            ? this.pickerSelection.official_layout_id
            : this.pickerSelection.layout_id,
        ) === String(layout.id)
      );
    },
    confirmPicker() {
      if (!this.pickerCanSelect || this.isBusy) return;
      const record = this.findRecord(this.pickerSelection);
      this.draftRecord = record
        ? { ...record, mode: this.pickerSelection.mode }
        : null;
      this.draft = selection(this.pickerSelection);
      this.pickerOpen = false;
    },
    resetToStandard() {
      if (!this.canEdit || this.isBusy) return;
      this.pick({ mode: "standard" });
      this.confirmPicker();
    },
    useInherited() {
      if (this.isDefault || !this.canEdit || this.isBusy) return;
      this.draft = selection({ mode: "inherit" });
      this.draftRecord = null;
    },
    discard() {
      if (this.saving) return;
      this.draft = selection(this.baseline);
      this.draftRecord = null;
    },
    dismissPickerHelp(event) {
      if (!this.pickerHelp && this.sourceHelp === null) return;
      event.preventDefault();
      event.stopPropagation();
      this.pickerHelp = false;
      this.sourceHelp = null;
    },
    setSourceHelp(layout, open) {
      const id = String(layout.id);
      if (open) this.sourceHelp = id;
      else if (this.sourceHelp === id) this.sourceHelp = null;
    },
    async save() {
      if (!this.canSave) return;
      const scope = this.scopeKey;
      this.saving = true;
      try {
        const url = this.isDefault
          ? window.API.POST_SET_SHOP_LAYOUT(this.shop.id)
          : window.API.POST_SET_DOMAIN_LAYOUT(this.shop.id, this.domainKey);
        const { data } = await axios.post(url, this.payload(this.draft));
        if (scope !== this.scopeKey) return;
        if (data.error || data.success === false) {
          NotificationService.showErrorAlert(null, data.error_msg);
          return;
        }
        if (!data.selection || !data.layout_summary)
          throw new Error(this.t("save_failed"));
        this.baseline = selection(data.selection);
        this.draft = selection(data.selection);
        this.summary = data.layout_summary;
        this.draftRecord = null;
        this.optionsCanWrite = data.can_write === true;
        this.officialLayouts = data.official_layouts || this.officialLayouts;
        this.privateLayouts = data.private_layouts || this.privateLayouts;
        this.officialTotal = data.official_total ?? null;
        this.privateTotal = data.private_total ?? null;
        this.offset = data.offset ?? 0;
        if (this.isDefault) {
          this.shop.layout_summary = data.layout_summary;
          this.shop.layout_id = data.layout_id ?? data.selection.layout_id;
          this.shop.layout_version = data.selection.layout_version;
          if ("layout" in data) this.shop.layout = data.layout;
          for (const key of ["local", "sub"])
            if (data.domain_summaries?.[key])
              this.shop[key] = {
                ...this.shop[key],
                layout_summary: data.domain_summaries[key],
              };
          for (const domain of this.shop.domains || [])
            if (data.domain_summaries?.[domain.id])
              domain.layout_summary = data.domain_summaries[domain.id];
        } else if (this.domainItem?.domain)
          Object.assign(this.domainItem.domain, data.domain || {}, {
            layout_summary: data.layout_summary,
          });
        else if (["local", "sub"].includes(String(this.domainKey))) {
          const key = String(this.domainKey);
          this.shop[key] = {
            ...this.shop[key],
            ...(data[key] || {}),
            layout_summary: data.layout_summary,
          };
        }
        if (this.domainItem)
          this.domainItem.layout_summary = data.layout_summary;
        this.$emit("saved", data);
        NotificationService.showSuccessAlert(null, this.t("saved"));
      } catch (error) {
        if (scope === this.scopeKey)
          NotificationService.showLaravelError(error);
      } finally {
        if (scope === this.scopeKey) this.saving = false;
      }
    },
  },
};
</script>

<style scoped lang="scss">
.b-shop-layout-editor {
  min-width: 0;
  font-family: inherit;
  font-size: 14px;
  line-height: 22px;
  &__widget {
    position: relative;
    padding: 22px;
    border-radius: 16px;
    + .b-shop-layout-editor__widget {
      margin-block-start: 16px;
    }
  }
  h2 {
    margin: 0;
    font: inherit;
    font-size: 16px;
    font-weight: 500;
    line-height: 24px;
  }
  h3 {
    margin: 4px 0;
    font: inherit;
    font-size: 20px;
    font-weight: 500;
    line-height: 28px;
    overflow-wrap: anywhere;
  }
  p {
    margin: 4px 0 0;
    font-size: 13px;
    line-height: 21px;
    color: var(--sd-modern-muted);
  }
  &__heading,
  &__picker-heading {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;
    margin-block-end: 18px;
  }
  &__current {
    display: grid;
    grid-template-columns: 220px minmax(0, 1fr);
    align-items: center;
    gap: 24px;
  }
  &__image {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 160px;
    background: var(--sd-modern-canvas-color, var(--sd-modern-inset));
    color: var(--sd-modern-muted);
    border-radius: 10px;
    overflow: hidden;
  }
  &__image .v-img {
    height: 100%;
    width: 100%;
  }
  &__identity {
    min-width: 0;
  }
  &__meta {
    display: block;
    color: var(--sd-modern-muted);
    font-size: 12px;
    line-height: 19px;
    overflow-wrap: anywhere;
  }
  &__current-actions,
  &__actions {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }
  &__current-actions {
    align-items: flex-end;
    margin-block-start: 16px;
  }
  &__change.v-btn {
    min-width: 0;
    max-width: 100%;
    height: 42px;
    padding: 0;
    :deep(.v-btn__content) {
      display: flex;
      align-items: stretch;
      min-width: 0;
      max-width: 100%;
      height: 100%;
    }
  }
  &__change-label {
    display: flex;
    align-items: center;
    gap: 8px;
    padding-inline: 14px;
    flex-shrink: 0;
    white-space: nowrap;
  }
  &__change-name {
    display: flex;
    align-items: center;
    min-width: 0;
    max-width: 220px;
    padding-inline: 12px;
    border-inline-start: 1px solid var(--sd-modern-border);
    > span {
      display: block;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
  &__version {
    --b-layout-version-height: 42px;
    flex: 0 1 250px;
    min-width: 200px;
    max-width: 260px;
    margin-block: 0;
    margin-inline-start: auto;
    :deep(.v-field) {
      --v-input-control-height: calc(var(--b-layout-version-height) - 2px);
      --v-field-padding-top: 0px;
      --v-field-padding-bottom: 0px;
      --v-field-input-padding-top: 0px;
      --v-field-input-padding-bottom: 0px;
      border: 1px solid currentColor;
      border-radius: 9px;
      font-family: inherit;
      font-size: 13px;
      font-weight: 500;
      line-height: 20px;
    }
    :deep(.v-field__input) {
      font: inherit;
      flex-wrap: nowrap;
    }
    :deep(.v-field--focused) {
      outline: 2px solid rgb(var(--v-theme-primary));
      outline-offset: 2px;
    }
  }
  &__savebar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
    padding-block-start: 18px;
    font-size: 12px;
    color: var(--sd-modern-muted);
  }
  &__progress {
    position: absolute;
    inset-block-start: 0;
    inset-inline: 0;
  }
  &__unavailable,
  &__read-only {
    margin-block-start: 16px;
  }
  &__scope-list {
    margin-block-start: 18px;
    display: grid;
    gap: 12px;
  }
  &__scope {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 10px;
    font-size: 13px;
    line-height: 21px;
    min-width: 0;
    > bdi {
      overflow-wrap: anywhere;
    }
    > span {
      margin-inline-start: auto;
      color: var(--sd-modern-muted);
    }
  }
  .sd-modern-button {
    font-family: inherit;
    font-size: 13px;
    line-height: 20px;
  }
}
.b-shop-layout-editor__picker.v-card {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  padding: 0;
  border-radius: 0;
  font-family: inherit;
  font-size: 14px;
  line-height: 22px;
  h2 {
    margin: 0;
    font: inherit;
    font-size: 20px;
    font-weight: 500;
    line-height: 28px;
  }
  p {
    margin: 4px 0 0;
    font-size: 13px;
    line-height: 21px;
    color: var(--sd-modern-muted);
  }
  .b-shop-layout-editor__picker-heading {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    padding: 24px;
    width: 100%;
    max-width: 1040px;
    margin-inline: auto;
    flex: 0 0 auto;
    flex-wrap: nowrap;
    > div {
      min-width: 0;
      flex: 1;
    }
    > .v-btn {
      flex-shrink: 0;
    }
  }
  .b-shop-layout-editor__picker-body {
    flex: 1;
    min-height: 0;
    padding: 0;
    overflow-y: auto;
  }
  .b-shop-layout-editor__picker-content {
    width: 100%;
    max-width: 1040px;
    margin-inline: auto;
    padding: 20px;
  }
  .b-shop-layout-editor__plain-options {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 10px;
    margin-block-end: 18px;
  }
  .b-shop-layout-editor__plain-option {
    min-width: 0;
    min-height: 64px;
    height: auto;
    padding: 12px 14px;
    border: 1px solid var(--sd-modern-border);
    border-radius: 10px;
    background: rgb(var(--v-theme-surface));
    color: inherit;
    text-align: start;
    font: inherit;
    font-size: 13px;
    line-height: 20px;
    text-transform: none;
    letter-spacing: 0;
    :deep(.v-btn__content) {
      white-space: normal;
      justify-content: flex-start;
      text-align: start;
    }
    small {
      display: block;
      color: var(--sd-modern-muted);
      font-size: 12px;
      line-height: 19px;
    }
  }
  .b-shop-layout-editor__picker-toolbar {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 280px);
    align-items: center;
    gap: 12px;
    padding-block-end: 0;
    border-block-end: 0;
    margin-block-end: 16px;
  }
  .b-shop-layout-editor__tabs {
    min-width: 0;
    height: auto;
    :deep(.v-slide-group__container) {
      height: auto;
    }
    :deep(.v-slide-group__content) {
      gap: 7px;
      padding: 12px 8px;
    }
    .v-tab {
      min-height: 36px;
      height: 36px;
      text-transform: none;
      letter-spacing: 0;
      font: inherit;
      font-size: 13px;
      border-radius: 9px;
      padding-inline: 12px;
      :deep(.v-btn__content) {
        gap: 6px;
      }
    }
  }
  .b-shop-layout-editor__tab--selected {
    --v-activated-opacity: 0;
    background: rgb(var(--v-theme-surface));
    box-shadow: var(--sd-modern-selected-shadow);
  }
  .b-shop-layout-editor__source-count {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
    min-width: 20px;
    height: 20px;
    padding-inline: 4px;
    border-radius: 5px;
    background: color-mix(in srgb, rgb(var(--v-theme-error)) 80%, black);
    color: rgb(var(--v-theme-on-error));
    font-size: 11px;
    font-weight: 600;
    line-height: 20px;
    font-variant-numeric: tabular-nums;
    &--unknown {
      background: transparent;
      color: var(--sd-modern-muted);
    }
  }
  .b-shop-layout-editor__search {
    min-width: 0;
    font-size: 13px;
  }
  .b-shop-layout-editor__choices {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 14px;
    position: relative;
  }
  .b-shop-layout-editor__choice {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    min-width: 0;
    border: 1px solid var(--sd-modern-border);
    border-radius: 13px;
    background: rgb(var(--v-theme-surface));
    color: inherit;
    overflow: hidden;
    text-align: start;
  }
  .b-shop-layout-editor__choice-select {
    display: flex;
    flex: 1;
    flex-direction: column;
    align-items: stretch;
    min-width: 0;
    padding: 0;
    border: 0;
    background: transparent;
    color: inherit;
    text-align: start;
    font: inherit;
    cursor: pointer;
  }
  .b-shop-layout-editor__choice-actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 4px;
    padding: 8px;
    border-block-start: 1px solid var(--sd-modern-border);
    .v-btn {
      min-width: 0;
      white-space: normal;
    }
  }
  .b-shop-layout-editor__choice-image {
    flex-shrink: 0;
    aspect-ratio: 1.6;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--sd-modern-inset);
    color: var(--sd-modern-muted);
    .v-img {
      height: 100%;
      width: 100%;
    }
  }
  .b-shop-layout-editor__choice-copy {
    display: grid;
    gap: 5px;
    padding: 14px;
  }
  .b-shop-layout-editor__choice-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    font-size: 14px;
    font-weight: 500;
    line-height: 22px;
    overflow-wrap: anywhere;
  }
  .b-shop-layout-editor__meta {
    color: var(--sd-modern-muted);
    font-size: 12px;
    line-height: 19px;
    overflow-wrap: anywhere;
  }
  .b-shop-layout-editor__option--selected {
    border-color: rgb(var(--v-theme-primary));
    box-shadow: inset 0 0 0 1px rgb(var(--v-theme-primary));
  }
  .b-shop-layout-editor__choice-select:focus-visible {
    outline: 2px solid rgb(var(--v-theme-primary));
    outline-offset: -3px;
  }
  .b-shop-layout-editor__list-state {
    grid-column: 1 / -1;
  }
  .b-shop-layout-editor__description {
    margin-block-start: 15px;
  }
  .b-shop-layout-editor__library-actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px 12px;
    margin-block-start: 8px;
  }
  .b-shop-layout-editor__picker-footer {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    gap: 10px 16px;
    padding: 18px 24px;
    width: 100%;
    max-width: 1040px;
    margin-inline: auto;
    flex: 0 0 auto;
    > span {
      color: var(--sd-modern-muted);
      font-size: 12px;
      line-height: 19px;
    }
  }
  .b-shop-layout-editor__reset {
    justify-self: start;
  }
  .b-shop-layout-editor__picker-help {
    grid-column: 1 / -1;
  }
  .b-shop-layout-editor__actions {
    display: flex;
    gap: 8px;
    margin-inline-start: auto;
  }
  .sd-modern-button {
    font-family: inherit;
    font-size: 13px;
    line-height: 20px;
  }
  .b-shop-layout-editor__progress {
    position: absolute;
    inset-block-start: 0;
    inset-inline: 0;
  }
}
@media (max-width: 600px) {
  .b-shop-layout-editor {
    &__widget {
      padding: 18px 16px;
    }
    &__current {
      grid-template-columns: minmax(0, 1fr);
      gap: 16px;
    }
    &__image {
      height: 170px;
    }
    &__scope > span {
      margin-inline-start: 0;
    }
    &__actions {
      width: 100%;
      justify-content: flex-end;
    }
    &__version {
      flex-basis: 100%;
      max-width: none;
    }
  }
  .b-shop-layout-editor__picker.v-card {
    .b-shop-layout-editor__picker-heading {
      padding: 20px 16px;
    }
    .b-shop-layout-editor__picker-content {
      padding: 16px;
    }
    .b-shop-layout-editor__plain-options,
    .b-shop-layout-editor__choices {
      grid-template-columns: minmax(0, 1fr);
    }
    .b-shop-layout-editor__picker-footer {
      padding: 16px;
      grid-template-columns: minmax(0, 1fr);
    }
    .b-shop-layout-editor__search {
      max-width: none;
    }
    .b-shop-layout-editor__picker-toolbar {
      grid-template-columns: minmax(0, 1fr);
      gap: 0;
    }
  }
}
@media (max-width: 600px), (pointer: coarse) {
  .b-shop-layout-editor__version {
    --b-layout-version-height: 44px;
  }
  .b-shop-layout-editor__change.v-btn {
    height: 44px;
  }
  .b-shop-layout-editor__picker.v-card .b-shop-layout-editor__tabs {
    .v-tab {
      min-height: 44px;
      height: 44px;
    }
  }
}
</style>
