<!--
  - Copyright (c) 2023-2024. Selldone® Business OS™
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
  <v-dialog
    :model-value="modelValue"
    fullscreen
    scrollable
    :persistent="modern && busy"
    transition="dialog-bottom-transition"
    @update:model-value="onDialogUpdate"
  >
    <v-card
      class="text-start"
      :class="{ 'sd-modern-canvas b-language-override': modern }"
    >
      <v-card-title v-if="modern" class="b-language-override__header">
        <div class="b-language-override__heading">
          <flag
            v-if="language_object"
            :iso="language_object.flag"
            :squared="false"
            aria-hidden="true"
          />
          <div>
            <h2>{{ $t("shop_languages.override_title") }}</h2>
            <p>
              <bdi>{{ language_object?.title || language }}</bdi
              ><span class="ms-2" dir="ltr">{{ language }}</span>
            </p>
          </div>
        </div>
        <v-tooltip
          location="top"
          content-class="sd-modern-tooltip text-start"
          open-on-focus
        >
          <template #activator="{ props }">
            <v-btn
              v-bind="props"
              icon
              variant="text"
              class="sd-modern-icon-button"
              :disabled="busy"
              :aria-label="$t('global.actions.close')"
              @click="requestClose"
            >
              <v-icon aria-hidden="true">close</v-icon>
            </v-btn>
          </template>
          {{ $t("global.actions.close") }}
        </v-tooltip>
      </v-card-title>
      <v-card-title v-else>
        <b class="me-1">
          <v-icon class="me-1" color="#111">translate</v-icon>
          {{ language }}</b
        >
        | Override Language Pack
      </v-card-title>
      <v-card-text :class="{ 'b-language-override__body': modern }">
        <div
          :class="
            modern
              ? 'sd-modern-content sd-modern-widget b-language-override__widget'
              : 'widget-box -large min-height-50vh'
          "
          :aria-busy="busy_fetch || busy || busy_import"
        >
          <u-loading-progress
            v-if="busy_fetch || (modern && busy_import)"
            :class="{ 'b-language-override__loading': modern }"
          ></u-loading-progress>

          <v-row no-gutters :class="{ 'b-language-override__toolbar': modern }">
            <v-select
              :model-value="selected_package"
              :disabled="busy_export || (modern && (busy || busy_fetch || busy_import))"
              :items="PACKAGES"
              :class="
                modern
                  ? 'b-language-override__package sd-modern-underlined-field'
                  : 'max-width-field'
              "
              :item-title="modern ? packageTitle : 'path'"
              item-value="pack"
              :label="
                modern ? $t('shop_languages.override_package') : 'Package'
              "
              prepend-inner-icon="inbox"
              return-object
              :rounded="!modern"
              :variant="modern ? 'underlined' : 'solo'"
              @update:model-value="changePackage"
            >
            </v-select>
            <v-spacer></v-spacer>

            <v-btn
              :class="
                modern ? 'sd-modern-button sd-modern-button--inline' : 'ma-1'
              "
              :disabled="modern && (busy || busy_fetch || busy_import || readOnly || !pack_default)"
              variant="text"
              @click="show_import_file = !show_import_file"
            >
              <v-icon
                class="me-1"
                :size="modern ? 17 : undefined"
                aria-hidden="true"
                >{{ modern ? "file_upload" : "file_download" }}</v-icon
              >
              {{ modern ? $t("shop_languages.override_import") : "Import" }}
            </v-btn>
            <v-btn
              :href="
                window.API.GET_SHOP_DOWNLOAD_OVERRIDE_LANGUAGE_PACK(
                  shop.id,
                  language,
                )
              "
              :class="
                modern ? 'sd-modern-button sd-modern-button--inline' : 'ma-1'
              "
              target="_blank"
              rel="noopener noreferrer"
              variant="text"
            >
              <v-icon
                class="me-1"
                :size="modern ? 17 : undefined"
                aria-hidden="true"
                >{{ modern ? "file_download" : "file_upload" }}</v-icon
              >
              {{ modern ? $t("shop_languages.override_download") : "Download" }}
              <v-icon v-if="modern" end size="15" aria-hidden="true"
                >north_east</v-icon
              >
            </v-btn>
          </v-row>

          <v-expand-transition>
            <div v-if="show_import_file">
              <div
                :class="
                  modern ? 'b-language-override__import' : 'widget-box mb-5'
                "
                :inert="modern && (busy || busy_fetch || busy_import || readOnly)"
              >
                <u-widget-header
                  icon="file_download"
                  :title="
                    modern
                      ? $t('shop_languages.override_import_title')
                      : 'Import language pack'
                  "
                  :class="{ 'sd-modern-form-header': modern }"
                ></u-widget-header>
                <v-list-subheader>{{
                  modern
                    ? $t("shop_languages.override_import_description")
                    : "Choose a language file here to import your custom language pack."
                }}</v-list-subheader>
                <s-drop-zone
                  :modern="modern"
                  extension=".json"
                  :hint="
                    modern
                      ? $t('shop_languages.override_import_hint')
                      : 'Either drag and drop your language pack file here, or click on the input field above to select it.'
                  "
                  icon="translate"
                  :label="
                    modern
                      ? $t('shop_languages.override_import_label')
                      : 'Click & select language file (.json)'
                  "
                  @select:file="
                    (event) => {
                      importPack(event);
                    }
                  "
                ></s-drop-zone>
              </div>
            </div>
          </v-expand-transition>

          <div v-if="modern && load_error" class="sd-modern-notice b-language-override__error" role="alert">
            <v-icon size="19" aria-hidden="true">error_outline</v-icon>
            <div class="sd-modern-notice__content">
              <strong>{{ $t('shop_languages.override_loading_error') }}</strong>
              <p>{{ $t('shop_languages.override_loading_error_description') }}</p>
            </div>
            <v-btn class="sd-modern-button sd-modern-button--inline" color="primary" variant="text" @click="init">
              <v-icon start size="17" aria-hidden="true">refresh</v-icon>{{ $t('shop_languages.override_retry') }}
            </v-btn>
          </div>
          <div v-if="modern && readOnly" class="sd-modern-notice b-language-override__read-only">
            <v-icon size="17" aria-hidden="true">lock_outline</v-icon>
            <span class="sd-modern-notice__content">{{ $t('shop_languages.override_read_only') }}</span>
          </div>
          <b-language-override-workspace
            v-if="modern && pack_override && pack_default"
            :key="`${scope_key}:${load_generation}`"
            v-model="pack_override"
            :structure="pack_default"
            :to="language"
            :read-only="readOnly"
            :disabled="busy || busy_import"
            @changed="pack_dirty = true"
          />
          <b-language-override-table
            v-else-if="!modern && pack_override && pack_default"
            v-model="pack_override"
            :structure="pack_default"
            :to="language"
            :modern="modern"
            :read-only="readOnly"
            :inert="modern && busy"
            dense
            nested
          ></b-language-override-table>
          <p v-if="modern && pack_default && pack_override" class="b-language-override__help">
            {{ $t("shop_languages.override_description") }}
          </p>
        </div>
      </v-card-text>
      <v-card-actions :class="{ 'b-language-override__footer': modern }">
        <div
          :class="
            modern
              ? 'sd-modern-content b-language-override__actions'
              : 'widget-buttons'
          "
        >
          <span v-if="modern" class="b-language-override__dirty" role="status">
            {{ pack_dirty ? $t('shop_languages.override_unsaved_changes') : '' }}
          </span>
          <v-btn
            :size="modern ? undefined : 'x-large'"
            :class="{ 'sd-modern-button': modern }"
            :disabled="modern && busy"
            variant="text"
            @click="requestClose"
          >
            <v-icon start>close</v-icon>
            {{ $t("global.actions.close") }}
          </v-btn>
          <v-btn
            :loading="busy"
            color="primary"
            :size="modern ? undefined : 'x-large'"
            :class="{ 'sd-modern-button sd-modern-button--primary': modern }"
            :disabled="
              modern &&
              (readOnly || busy_fetch || busy_import || load_error || !pack_default || !pack_override)
            "
            variant="elevated"
            @click="saveLanguage"
          >
            <v-icon start>save</v-icon>
            {{ $t("global.actions.save") }}
          </v-btn>
        </div>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import LanguagesRepository from "@selldone/translate/repository/LanguagesRepository.ts";
import BLanguageOverrideTable from "../../../language/override/table/BLanguageOverrideTable.vue";
import BLanguageOverrideWorkspace from "../workspace/BLanguageOverrideWorkspace.vue";
import SDropZone from "../../../../ui/uploader/SDropZone.vue";
import { FileHelper } from "@selldone/core-js";
import { Language } from "@selldone/core-js/enums/language/Language";
import { markRaw } from "vue";

import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

export default {
  name: "BLanguageOverrideDialog",
  mixins: [],
  components: { SDropZone, BLanguageOverrideTable, BLanguageOverrideWorkspace },
  props: {
    shop: {
      required: false,
      type: Object,
    },
    modelValue: {},
    language: {},
    modern: Boolean,
    readOnly: Boolean,
  },

  data: () => ({
    busy: false,

    search: "",

    selected_package: LanguagesRepository.PACKAGES_SHOP_OVERRIDE[0],
    PACKAGES: LanguagesRepository.PACKAGES_SHOP_OVERRIDE,

    pack_default: null,
    pack_override: null, //override
    busy_export: false,

    busy_fetch: false,
    busy_import: false,
    load_error: false,
    load_generation: 0,
    import_generation: 0,
    pack_dirty: false,

    show_import_file: false,
  }),

  computed: {
    language_object() {
      return Language[this.language];
    },
    scope_key() {
      return JSON.stringify([this.shop?.id, this.language, this.selected_package?.pack_code]);
    },
  },

  watch: {
    readOnly(value) {
      if (this.modern && value) {
        this.show_import_file = false;
        this.import_generation++;
        this.busy_import = false;
      }
    },
    selected_package() {
      this.init();
    },
    language() {
      this.init();
    },
    'shop.id'() {
      this.init();
    },
    modelValue(value) {
      if (!this.modern) return;
      if (value && !this.pack_default && !this.busy_fetch) this.init();
      if (!value) {
        this.load_generation++;
        this.import_generation++;
        this.pack_default = null;
        this.pack_override = null;
        this.busy_fetch = false;
        this.busy_import = false;
      }
    },
  },
  created() {
    this.init();
  },
  beforeUnmount() {
    this.load_generation++;
    this.import_generation++;
    this.pack_default = null;
    this.pack_override = null;
  },

  methods: {
    packageTitle(item) {
      return this.$t(`shop_languages.override_${item.pack_code}`);
    },
    isCurrentScope(generation, scope) {
      return generation === this.load_generation && scope === this.scope_key && (!this.modern || this.modelValue !== false);
    },
    requestClose() {
      if (this.modern && this.busy) return;
      if (this.modern && this.pack_dirty && !window.confirm(this.$t('shop_languages.override_close_confirm'))) return;
      this.$emit('update:modelValue', false);
    },
    onDialogUpdate(value) {
      if (value) this.$emit('update:modelValue', true);
      else this.requestClose();
    },
    changePackage(value) {
      if (!value || value.pack_code === this.selected_package?.pack_code) return;
      if (this.modern && (this.busy || this.busy_fetch || this.busy_import)) return;
      if (this.modern && this.pack_dirty && !window.confirm(this.$t('shop_languages.override_close_confirm'))) return;
      this.selected_package = value;
    },
    filterStrings(data) {
      if (this.modern) {
        if (typeof data === 'string') return data || null;
        if (!data || typeof data !== 'object') return null;
        const output = Object.create(null);
        const stack = [{ source: data, target: output, keys: Object.keys(data), index: 0, parent: null, key: '' }];
        while (stack.length) {
          const frame = stack[stack.length - 1];
          if (frame.index === frame.keys.length) {
            stack.pop();
            if (frame.parent && Object.keys(frame.target).length) {
              Object.defineProperty(frame.parent, frame.key, { value: frame.target, enumerable: true, writable: true, configurable: true });
            }
            continue;
          }
          const key = frame.keys[frame.index++];
          const value = frame.source[key];
          if (typeof value === 'string' && value) {
            Object.defineProperty(frame.target, key, { value, enumerable: true, writable: true, configurable: true });
          } else if (value && typeof value === 'object') {
            // Numeric object keys preserve sparse array positions without JSON nulls overriding defaults.
            const child = Object.create(null);
            stack.push({ source: value, target: child, keys: Object.keys(value), index: 0, parent: frame.target, key });
          }
        }
        return Object.keys(output).length ? output : null;
      }
      if (typeof data === "string") return data;

      if (Array.isArray(data)) {
        const newArray = data
          .map((item) => this.filterStrings(item))
          .filter(Boolean);
        return newArray.length > 0 ? newArray : null;
      }

      if (typeof data === "object" && data !== null) {
        const newObj = Object.entries(data).reduce((result, [key, value]) => {
          const filteredValue = this.filterStrings(value);
          if (filteredValue) {
            result[key] = filteredValue;
          }
          return result;
        }, {});

        return Object.keys(newObj).length > 0 ? newObj : null;
      }

      return null;
    },

    async init() {
      const generation = ++this.load_generation;
      const scope = this.scope_key;
      const language = this.language;
      const selectedPackage = this.selected_package;
      const shopId = this.shop?.id;
      this.import_generation++;
      this.pack_default = null;
      this.pack_override = null;
      this.load_error = false;
      this.pack_dirty = false;
      this.busy = false;
      this.busy_import = false;
      this.show_import_file = false;
      if (!shopId || !language || !selectedPackage || (this.modern && this.modelValue === false)) {
        this.busy_fetch = false;
        return;
      }
      this.busy_fetch = true;
      try {
        const [{ data }, loaded] = await Promise.all([
          axios.get(window.API.GET_SHOP_OVERRIDE_LANGUAGE_PACK(shopId, language, selectedPackage.pack_code)),
          new LanguagesRepository(selectedPackage.pack).load(language),
        ]);
        if (!this.isCurrentScope(generation, scope)) return;
        if (data.error) {
          this.load_error = true;
          NotificationService.showErrorAlert(null, data.error_msg);
          return;
        }
        if (!loaded?.default || typeof loaded.default !== 'object' || Array.isArray(loaded.default)) throw new Error(this.$t('shop_languages.override_loading_error'));
        const overrides = this.isObject(data.pack) && !Array.isArray(data.pack) ? data.pack : {};
        this.pack_default = this.modern ? markRaw(loaded.default) : loaded.default;
        this.pack_override = this.modern ? markRaw(overrides) : overrides;
        // Modern rows read missing overrides directly from defaults instead of cloning the entire pack.
        if (!this.modern) this.emptyClone(this.pack_default, this.pack_override);
      } catch (error) {
        if (!this.isCurrentScope(generation, scope)) return;
        this.load_error = true;
        NotificationService.showLaravelError(error);
      } finally {
        if (this.isCurrentScope(generation, scope)) this.busy_fetch = false;
      }
    },

    saveLanguage() {
      if (
        this.modern &&
        (this.readOnly ||
          this.busy ||
          this.busy_fetch ||
          this.busy_import ||
          this.load_error ||
          !this.pack_default ||
          !this.pack_override)
      )
        return;
      if (!this.shop?.id || !this.language || !this.selected_package) return;
      const generation = this.load_generation;
      const scope = this.scope_key;
      const shopId = this.shop.id;
      const language = this.language;
      const packageCode = this.selected_package.pack_code;
      const pack_override_purify = this.filterStrings(this.pack_override) || (this.modern ? {} : null);
      this.busy = true;

      axios
        .post(
          window.API.POST_SHOP_SAVE_OVERRIDE_LANGUAGE_PACK(
            shopId,
            language,
            packageCode,
          ),
          {
            pack: pack_override_purify,
          },
        )
        .then(({ data }) => {
          if (!this.isCurrentScope(generation, scope) || (this.modern && this.readOnly)) return;
          if (!data.error) {
            this.pack_dirty = false;
            this.$emit("update:modelValue", false);
            NotificationService.showSuccessAlert(
              null,
              this.$t(
                this.modern
                  ? "shop_languages.override_save_success"
                  : "Language package has been override successfully.",
              ),
            );
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          if (this.isCurrentScope(generation, scope) && (!this.modern || !this.readOnly)) NotificationService.showLaravelError(error);
        })
        .finally(() => {
          if (this.isCurrentScope(generation, scope)) this.busy = false;
        });
    },

    /**
     * Clone structure of reference language pack.
     *
     * @param structure
     * @param value
     * @returns {{}}
     */
    emptyClone(structure, value) {
      // Array:
      if (Array.isArray(structure)) {
        if (notMatch(value, structure)) value = [];

        let i = 0;
        const arr = [];
        structure.forEach((it) => {
          arr.push(this.emptyClone(it, value[i]));
          i++;
        });
        value = arr;
      }
      // Object:
      else if (this.isObject(structure)) {
        if (notMatch(value, structure)) value = {};

        Object.keys(structure).forEach((key) => {
          value[key] = this.emptyClone(structure[key], value[key]);
        });
      }
      // String:
      else {
        if (notMatch(value, structure)) value = "";
      }

      return value;

      function notMatch(value, structure) {
        return !value || typeof value !== typeof structure;
      }
    },

    async importPack(event) {
      if (
        !event ||
        (this.modern && (this.readOnly || this.busy || this.busy_fetch || this.busy_import || !this.pack_default))
      )
        return;

      const generation = this.load_generation;
      const scope = this.scope_key;
      const importGeneration = ++this.import_generation;
      const packageCode = this.selected_package.pack_code;
      this.busy_import = true;
      try {
          const json = await FileHelper.LoadFile(event);
          if (!this.isCurrentScope(generation, scope) || importGeneration !== this.import_generation || (this.modern && this.readOnly)) return;
          const imported = json && Object.hasOwn(json, packageCode) ? json[packageCode] : null;
          if (!imported || typeof imported !== 'object' || (this.modern && Array.isArray(imported))) {
            NotificationService.showErrorAlert(
              this.modern
                ? this.$t("shop_languages.override_invalid_file", {
                    package: packageCode,
                  })
                : "Invalid language file | " + packageCode,
              this.modern
                ? this.$t("shop_languages.override_invalid_file_description")
                : "We can not find any data related to current selected pack on the file.",
            );
            return;
          }

          this.pack_override = this.modern ? markRaw(imported) : imported;
          if (!this.modern) this.emptyClone(this.pack_default, this.pack_override);
          this.pack_dirty = true;

          NotificationService.showSuccessAlert(
            this.modern
              ? this.$t("shop_languages.override_file_loaded", {
                  package: packageCode,
                })
              : "File loaded | " + packageCode,
            this.modern
              ? this.$t("shop_languages.override_file_loaded_description")
              : "The language pack has been loaded successfully.",
          );
      } catch (error) {
        if (this.isCurrentScope(generation, scope) && importGeneration === this.import_generation && (!this.modern || !this.readOnly)) NotificationService.showErrorAlert(null, error);
      } finally {
        if (this.isCurrentScope(generation, scope) && importGeneration === this.import_generation) this.busy_import = false;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.b-language-override {
  font-size: var(--sd-modern-font-body, 14px);
  line-height: 1.6;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 24px max(24px, calc((100% - 1040px) / 2));
    white-space: normal;
    flex: 0 0 auto;
  }

  &__heading {
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 0;
  }
  &__heading > .fi {
    width: 24px;
    flex-shrink: 0;
  }
  &__heading h2 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    line-height: 26px;
    letter-spacing: -0.2px;
  }
  &__heading p {
    margin: 4px 0 0;
    color: var(--sd-modern-muted);
    font-size: 13px;
    font-weight: 400;
    line-height: 20px;
  }
  &__body {
    display: flex;
    min-height: 0;
    overflow: hidden !important;
    padding: 0 24px 24px !important;
  }
  &__widget {
    position: relative;
    display: flex;
    flex: 1;
    flex-direction: column;
    min-height: 0;
    max-height: 100%;
    overflow: hidden;
    padding: 22px;
  }
  &__loading {
    position: absolute;
    inset-block-start: 0;
    inset-inline: 0;
  }
  &__toolbar {
    flex: 0 0 auto;
    gap: 12px;
    align-items: center;
    margin-block-end: 24px;
  }
  &__package {
    flex: 0 1 230px;
    min-width: 160px;
  }
  &__import {
    padding-block: 8px 24px;
  }
  &__help {
    flex: 0 0 auto;
    margin: 18px 0 0;
    color: var(--sd-modern-muted);
    font-size: 13px;
    line-height: 21px;
  }
  &__error, &__read-only {
    margin-block-end: 20px;
    font-size: 13px;
    line-height: 21px;
  }
  &__error p { margin: 4px 0 0; }
  &__footer {
    padding: 16px 24px;
    border-block-start: 1px solid var(--sd-modern-border);
    background: rgb(var(--v-theme-surface));
    flex: 0 0 auto;
  }
  &__actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 10px;
  }
  &__dirty {
    flex: 1;
    min-width: 0;
    color: var(--sd-modern-muted);
    font-size: 13px;
    line-height: 21px;
  }

  @media (max-width: 650px), (max-height: 700px) {
    &__body {
      display: block;
      overflow: auto !important;
    }
    &__widget {
      display: block;
      max-height: none;
      overflow: visible;
    }
  }

  @media (max-width: 650px) {
    &__header {
      padding: 20px 16px;
    }
    &__body {
      padding: 0 12px 16px !important;
    }
    &__widget {
      padding: 16px;
    }
    &__toolbar {
      gap: 8px;
    }
    &__package {
      flex-basis: 100%;
    }
    &__toolbar > .v-spacer {
      display: none;
    }
    &__footer {
      padding: 12px;
    }
    &__actions {
      flex-wrap: wrap;
    }
  }
}
</style>
