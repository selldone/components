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
    transition="dialog-bottom-transition"
    @update:model-value="(val) => $emit('update:modelValue', val)"
  >
    <v-card class="text-start">
      <v-card-title>
        <b class="me-1">
          <v-icon class="me-1" color="#111">translate</v-icon>
          {{ language }}</b
        >
        | Override Language Pack
      </v-card-title>
      <v-card-text>
        <div class="widget-box -large min-height-50vh">
          <u-loading-progress v-if="busy_fetch"></u-loading-progress>

          <v-row no-gutters>
            <v-select
              v-model="selected_package"
              :disabled="busy_export"
              :items="PACKAGES"
              class="max-width-field"
              item-title="path"
              item-value="pack"
              label="Package"
              prepend-inner-icon="inbox"
              return-object
              rounded
              variant="solo"
            >
            </v-select>
            <v-spacer></v-spacer>

            <v-btn
              class="ma-1"
              variant="text"
              @click="show_import_file = !show_import_file"
            >
              <v-icon class="me-1">file_download</v-icon>
              Import
            </v-btn>
            <v-btn
              :href="
                window.API.GET_SHOP_DOWNLOAD_OVERRIDE_LANGUAGE_PACK(
                  shop.id,
                  language,
                )
              "
              class="ma-1"
              target="_blank"
              variant="text"
            >
              <v-icon class="me-1">file_upload</v-icon>
              Download
            </v-btn>
          </v-row>

          <v-expand-transition>
            <div v-if="show_import_file">
              <div class="widget-box mb-5">
                <s-widget-header
                  icon="file_download"
                  title="Import language pack"
                ></s-widget-header>
                <v-list-subheader
                  >Choose a language file here to import your custom language
                  pack.
                </v-list-subheader>
                <s-drop-zone
                  extension=".json"
                  hint="Either drag and drop your language pack file here, or click on the input field above to select it."
                  icon="translate"
                  label="Click & select language file (.json)"
                  @select:file="
                    (event) => {
                      importPack(event);
                    }
                  "
                ></s-drop-zone>
              </div>
            </div>
          </v-expand-transition>

          <b-language-override-table
            v-if="pack_override && pack_default"
            v-model="pack_override"
            :structure="pack_default"
            :to="language"
            dense
            nested
          ></b-language-override-table>
        </div>
      </v-card-text>
      <v-card-actions>
        <div class="widget-buttons">
          <v-btn
            size="x-large"
            variant="text"
            @click="$emit('update:modelValue', false)"
          >
            <v-icon start>close</v-icon>
            {{ $t("global.actions.close") }}
          </v-btn>
          <v-btn
            :loading="busy"
            color="primary"
            size="x-large"
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

<script>
import LanguagesRepository from "@selldone/translate/repository/LanguagesRepository.ts";
import BLanguageOverrideTable from "../../../language/override/table/BLanguageOverrideTable.vue";
import SDropZone from "../../../../ui/uploader/SDropZone.vue";

export default {
  name: "BLanguageOverrideDialog",
  components: { SDropZone, BLanguageOverrideTable },
  props: {
    shop: {
      required: false,
      type: Object,
    },
    modelValue: {},
    language: {},
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

    show_import_file: false,
  }),

  computed: {},

  watch: {
    selected_package() {
      this.init();
    },
    language() {
      this.init();
    },
  },
  created() {
    this.init();
  },

  methods: {
    filterStrings(data) {
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
      if (!this.language || !this.selected_package) return;

      this.pack_default = null;
      this.pack_override = null;

      // 3. Load selected language:
      this.busy_fetch = true;
      this.pack_override = await axios
        .get(
          window.API.GET_SHOP_OVERRIDE_LANGUAGE_PACK(
            this.shop.id,
            this.language,
            this.selected_package.pack_code,
          ),
        )
        .then(({ data }) => {
          if (!data.error) {
            return this.isObject(data.pack) ? data.pack : {};
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        });
      //console.log("🧰 Shop pack loaded...", this.pack_override);

      // 3. Load existed language js:
      await this.loadJs();

      // 5. Create empty clone:
      // console.log("▶️ Start empty clone... Override: ", this.pack_override);
      this.emptyClone(this.pack_default, this.pack_override);
      //console.log("End empty clone. Override: ", this.pack_override);

      this.busy_fetch = false;
    },

    async loadJs() {
      //console.log("Load js files...", this.language, this.selected_package);

      const rep = new LanguagesRepository(this.selected_package["pack"]);

      // 1. Reset values:
      this.pack_default = null;

      // 2. Load default language (en):
      try {
        const cal = await rep.load(this.language);

        // console.log("Load pack",this.language, cal.default);
        this.pack_default = cal.default;
      } catch (e) {
        console.error(e);
        this.showErrorAlert(null, e.toString());
      }
    },

    saveLanguage() {
      const pack_override_purify = this.filterStrings(this.pack_override);
      //console.log("Save pack", pack_override_purify);
      this.busy = true;

      axios
        .post(
          window.API.POST_SHOP_SAVE_OVERRIDE_LANGUAGE_PACK(
            this.shop.id,
            this.language,
            this.selected_package.pack_code,
          ),
          {
            pack: pack_override_purify,
          },
        )
        .then(({ data }) => {
          if (!data.error) {
            this.$emit("update:modelValue", false);
            this.showSuccessAlert(
              null,
              this.$t("Language package has been override successfully."),
            );
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy = false;
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

    importPack(event) {
      if (!event) return;

      this.loadFile(event)
        .then((json) => {
          if (!json[this.selected_package.pack_code]) {
            this.showErrorAlert(
              "Invalid language file | " + this.selected_package.pack_code,
              "We can not find any data related to current selected pack on the file.",
            );
            return;
          }

          console.log(
            "🌐 Language | 🟢 Load Language Pack: ",
            this.language,
            this.selected_package.pack_code,
            json,
          );
          this.pack_override = json[this.selected_package.pack_code];
          this.emptyClone(this.pack_default, this.pack_override);

          this.showSuccessAlert(
            "File loaded | " + this.selected_package.pack_code,
            "The language pack has been loaded successfully.",
          );
        })
        .catch((err) => this.showErrorAlert(null, err));
    },
  },
};
</script>

<style lang="scss" scoped></style>
