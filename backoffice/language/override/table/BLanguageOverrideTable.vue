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
  <div :class="{ 'b-language-override-table--modern': modern }">
    <v-table
      :key="'key' + key"
      :class="{
        dense: dense,
        'sd-modern-table sd-modern-data-table b-language-override-table__table':
          modern,
      }"
      :dense="dense"
      class="mx-2 bg-transparent"
    >
      <template v-slot:default>
        <thead class="text-start">
          <tr>
            <th class="max-w-120">
              {{ modern ? $t("shop_languages.override_record") : "Record" }}
            </th>
            <th>
              {{ modern ? $t("shop_languages.override_default") : "Default" }}
            </th>
            <th>
              {{ modern ? $t("shop_languages.override_custom") : "Value" }}
            </th>
          </tr>
        </thead>
        <tbody class="text-start">
          <tr
            v-for="(val, key) in structure"
            :key="key"
            :class="{
              'bg-red-soft': !modern && !checkValidParams(key),
              '-edited':
                !modern && modelValue[key] && isString(modelValue[key]),
              'b-language-override-table__group':
                modern && nested && val && isObject(val) && !Array.isArray(val),
              'sd-modern-clickable-item': modern && !readOnly && isString(val),
            }"
            class="row-hover"
            @click.stop="
              structure[key] && isString(structure[key])
                ? editRecord(key)
                : undefined
            "
          >
            <!-- Nested table -->

            <template v-if="nested && val && Array.isArray(val)"></template>

            <td
              v-else-if="
                nested && val && /*Array.isArray(val) || */ isObject(val)
              "
              colspan="3"
            >
              <h3
                :class="
                  modern
                    ? 'b-language-override-table__group-title'
                    : 'mt-3 mb-2 text-blue'
                "
              >
                {{ key }}
              </h3>

              <!-- Table -->
              <b-language-override-table
                v-model="modelValue[key]"
                :dense="dense"
                :nested="nested"
                :structure="val"
                :to="to"
                :modern="modern"
                :read-only="readOnly"
              ></b-language-override-table>
            </td>

            <!-- Print -->
            <template v-else>
              <!-- Key -->

              <td
                class="max-w-120 text-muted"
                :data-label="
                  modern ? $t('shop_languages.override_record') : undefined
                "
              >
                <v-btn
                  v-if="modern && isString(val)"
                  variant="text"
                  class="sd-modern-button sd-modern-button--inline b-language-override-table__edit"
                  :disabled="readOnly"
                  :aria-label="$t('shop_languages.override_edit') + ': ' + key"
                  @click.stop="editRecord(key)"
                >
                  <span>{{ getName(key) }}</span
                  ><v-icon end size="14" aria-hidden="true">edit</v-icon>
                </v-btn>
                <template v-else>{{ getName(key) }}</template>
                <v-tooltip
                  v-if="modern && !checkValidParams(key)"
                  location="top"
                  content-class="sd-modern-tooltip text-start"
                  open-on-focus
                  open-on-click
                >
                  <template #activator="{ props }">
                    <v-btn
                      v-bind="props"
                      icon
                      variant="text"
                      class="sd-modern-icon-button sd-modern-info-button"
                      :aria-label="
                        $t('shop_languages.override_params_mismatch')
                      "
                      @click.stop
                    >
                      <v-icon color="error" aria-hidden="true"
                        >error_outline</v-icon
                      >
                    </v-btn>
                  </template>
                  {{ $t("shop_languages.override_params_mismatch") }}
                </v-tooltip>
                <br v-if="!dense" />
                <small v-if="!dense">{{ key }}</small>
              </td>

              <!-- Original -->
              <td
                :data-label="
                  modern ? $t('shop_languages.override_default') : undefined
                "
              >
                <p v-if="val && Array.isArray(val)">{{ val.join(", ") }}</p>
                <div
                  v-else-if="
                    val &&
                    typeof val === 'object' &&
                    Object.keys(val).length > 0
                  "
                >
                  <p v-for="(d_v, d_K) in val" :key="'d-' + d_K">
                    <b>{{ d_K }}: </b>{{ d_v }}
                  </p>
                </div>
                <u-check
                  v-else-if="typeof val === 'boolean'"
                  :model-value="val"
                ></u-check>
                <span
                  v-else-if="val && (typeof val == 'number' || val.isNumber())"
                  >{{ numeralFormat(val, "0,0.[000]") }}</span
                >
                <span v-else>{{ val }}</span>
              </td>

              <!-- Value -->
              <td
                :dir="language_object.dir"
                :data-label="
                  modern ? $t('shop_languages.override_custom') : undefined
                "
              >
                <p v-if="modelValue[key] && Array.isArray(modelValue[key])">
                  {{ modelValue[key].join(", ") }}
                </p>
                <div
                  v-else-if="
                    modelValue[key] &&
                    typeof modelValue[key] === 'object' &&
                    Object.keys(modelValue[key]).length > 0
                  "
                >
                  <p v-for="(d_v, d_K) in modelValue[key]" :key="'d-' + d_K">
                    <b>{{ d_K }}: </b>{{ d_v }}
                  </p>
                </div>
                <u-check
                  v-else-if="typeof modelValue[key] === 'boolean'"
                  :model-value="modelValue[key]"
                ></u-check>

                <span v-else>
                  <span v-if="modelValue[key]">
                    <span
                      v-if="modern"
                      class="b-language-override-table__edited-dot"
                      aria-hidden="true"
                    ></span>
                    <template v-else>🔵 </template>{{ modelValue[key] }}
                  </span>
                  <small v-else>{{ val }}</small>
                </span>
              </td>
            </template>
          </tr>
        </tbody>
      </template>
    </v-table>

    <!-- ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ Dialog ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ -->

    <v-dialog v-model="dialog" max-width="640">
      <v-card
        v-if="selected_key !== null"
        class="text-start"
        :class="{
          'sd-modern-widget b-language-override-table__dialog': modern,
        }"
        rounded="xl"
      >
        <v-card-title
          :class="{ 'b-language-override-table__dialog-title': modern }"
        >
          {{ modern ? $t("shop_languages.override_edit") : "Edit" }} |
          <bdi>{{ selected_key }}</bdi>
        </v-card-title>
        <v-card-text>
          <v-list-subheader>{{
            modern ? $t("shop_languages.override_default") : "Original value"
          }}</v-list-subheader>
          <p v-copy class="typo-body text-start text--black">
            {{ structure[selected_key] }}
          </p>

          <v-list-subheader>{{
            modern ? $t("shop_languages.override_custom") : "Translated value"
          }}</v-list-subheader>

          <v-text-field
            v-model="input"
            :dir="language_object.dir"
            :label="
              modern ? $t('shop_languages.override_translated') : 'Translated'
            "
            :class="{ 'sd-modern-underlined-field': modern }"
            :variant="modern ? 'underlined' : 'outlined'"
          >
          </v-text-field>

          <div
            v-if="!checkValidParams(selected_key)"
            :class="
              modern
                ? 'b-language-override-table__validation'
                : 'widget-buttons'
            "
          >
            <v-btn
              :color="modern ? undefined : 'black'"
              :size="modern ? undefined : 'x-large'"
              :class="{ 'sd-modern-button': modern }"
              :variant="modern ? 'outlined' : 'elevated'"
              @click="autoFix(selected_key)"
            >
              <v-icon class="me-1">auto_fix_high</v-icon>
              {{ modern ? $t("shop_languages.override_auto_fix") : "Auto fix" }}
            </v-btn>
          </div>
        </v-card-text>
        <v-card-actions>
          <div
            :class="
              modern ? 'b-language-override-table__actions' : 'widget-buttons'
            "
          >
            <v-btn
              :size="modern ? undefined : 'x-large'"
              :class="{ 'sd-modern-button': modern }"
              variant="text"
              @click="dialog = false"
            >
              <v-icon start>close</v-icon>
              {{ $t("global.actions.close") }}
            </v-btn>
            <v-btn
              :loading="busy_save"
              color="primary"
              :size="modern ? undefined : 'x-large'"
              :class="{ 'sd-modern-button sd-modern-button--primary': modern }"
              variant="elevated"
              @click="setValue()"
            >
              <v-icon start>save</v-icon>
              {{ $t("global.actions.set") }}
            </v-btn>
          </div>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts">
import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

export default {
  name: "BLanguageOverrideTable",
  mixins: [],
  components: {},
  props: {
    to: {
      required: true,
    },

    structure: {},
    modelValue: {},

    dense: {
      default: false,
      type: Boolean,
    },

    nested: {
      default: false,
      type: Boolean,
    },
    modern: Boolean,
    readOnly: Boolean,
  },
  data: () => ({
    dialog: false,
    selected_key: null,
    input: null,

    busy_translate: false,
    busy_save: false,

    key: null,
  }),

  computed: {
    language_object() {
      return this.getLanguageObject(this.to);
    },
  },

  watch: {
    readOnly(value) {
      if (this.modern && value) {
        this.dialog = false;
        this.selected_key = null;
        this.input = null;
      }
    },
  },

  created() {
    Object.keys(this.structure).forEach((key) => {
      if (!this.modelValue[key]) {
        this.modelValue[key] =
          this.structure[key] && Array.isArray(this.structure[key])
            ? []
            : this.isObject(this.structure[key])
              ? {}
              : "";
      }
    });
  },

  methods: {
    editRecord(key) {
      if (this.modern && this.readOnly) return;
      this.dialog = true;
      this.selected_key = key;
      this.input = this.modelValue[this.selected_key];
      //console.log("editRecord", key, this.dialog);
    },
    setValue() {
      if (this.modern && this.readOnly) return;
      this.modelValue[this.selected_key] = this.input;
      this.dialog = false;
      this.key = Math.random();
    },

    checkValidParams(key) {
      if (!this.modelValue[key] || !this.isString(this.modelValue[key]))
        return true;

      const paramsPattern = /[^{\}]+(?=})/g;

      const original = this.structure[key];
      const translated = this.modelValue[key];

      let originalParams = original.match(paramsPattern);
      let translatedParams = translated.match(paramsPattern);

      // console.log("original params", originalParams,translatedParams) // prints all the names between {} = ["id", "name", "age"]

      // Translated text must contain all params:
      if (
        originalParams &&
        originalParams.some(
          (i) => !translatedParams || !translatedParams.includes(i),
        )
      ) {
        return false;
      }

      return true;
    },

    autoFix(key) {
      if (this.modern && this.readOnly) return;
      let out = this.modelValue[key];

      const paramsPattern = /[^{\}]+(?=})/g;

      const original = this.structure[key];
      const translated = this.modelValue[key];

      let originalParams = original.match(paramsPattern);
      let translatedParams = translated.match(paramsPattern);

      if (
        !translatedParams ||
        !originalParams ||
        translatedParams.length !== originalParams.length
      ) {
        NotificationService.showErrorAlert(
          null,
          this.modern
            ? this.$t("shop_languages.override_params_mismatch")
            : "Params length not equal!",
        );
        return;
      }
      for (let i = 0; i < translatedParams.length; i++) {
        out = out.replace(`{${translatedParams[i]}}`, `{${originalParams[i]}}`);
      }

      this.input = out;
    },
  },
};
</script>

<style lang="scss" scoped>
.dense {
  p {
    margin: 0;
  }
}

.-edited {
  background-color: rgba(26, 100, 174, 0.1);
}

.b-language-override-table--modern {
  min-width: 0;
  font-size: var(--sd-modern-font-body, 14px);
  line-height: 1.6;

  > .b-language-override-table__table {
    margin-inline: 0 !important;
  }
  > .b-language-override-table__table :deep(> .v-table__wrapper > table) {
    width: 100%;
    table-layout: fixed;
  }
  > .b-language-override-table__table
    :deep(> .v-table__wrapper > table > thead > tr > th:first-child) {
    width: 24%;
    max-width: none !important;
  }
  > .b-language-override-table__table
    :deep(> .v-table__wrapper > table > tbody > tr > td) {
    padding: 14px 12px;
    max-width: none !important;
    overflow-wrap: anywhere;
    vertical-align: top;
    font-size: 14px;
    line-height: 23px;
  }
  > .b-language-override-table__table
    :deep(> .v-table__wrapper > table > tbody > tr > td small) {
    font-size: 13px;
    line-height: 21px;
  }
  .b-language-override-table__group-title {
    margin: 12px 0 16px;
    color: rgb(var(--v-theme-on-surface));
    font-size: 15px;
    font-weight: 600;
    line-height: 23px;
  }
  .b-language-override-table__edit {
    padding-block: 4px;
    white-space: normal;
    max-width: 100%;
    height: auto;
    text-align: start;
  }
  .b-language-override-table__edit :deep(.v-btn__content) {
    white-space: normal;
    overflow-wrap: anywhere;
  }
  .b-language-override-table__edited-dot {
    display: inline-block;
    width: 5px;
    height: 5px;
    margin-inline-end: 5px;
    margin-block-end: 2px;
    border-radius: 50%;
    background: rgb(var(--v-theme-primary));
  }

  @media (max-width: 650px) {
    > .b-language-override-table__table
      :deep(> .v-table__wrapper > table > thead) {
      display: none;
    }
    > .b-language-override-table__table
      :deep(> .v-table__wrapper > table > tbody > tr) {
      display: block;
      padding-block: 12px;
    }
    > .b-language-override-table__table
      :deep(> .v-table__wrapper > table > tbody > tr > td) {
      display: block;
      width: 100%;
      padding: 8px 12px;
      border: 0;
    }
    > .b-language-override-table__table
      :deep(> .v-table__wrapper > table > tbody > tr > td[data-label]::before) {
      content: attr(data-label);
      display: block;
      margin-block-end: 4px;
    }
    > .b-language-override-table__table
      :deep(
        > .v-table__wrapper
          > table
          > tbody
          > tr.b-language-override-table__group
      ) {
      padding: 0;
    }
    > .b-language-override-table__table
      :deep(
        > .v-table__wrapper
          > table
          > tbody
          > tr.b-language-override-table__group
          > td
      ) {
      padding-inline: 0;
    }
  }
}

.b-language-override-table__dialog {
  .b-language-override-table__dialog-title {
    padding: 0 0 16px;
    white-space: normal;
    font-size: 18px;
    font-weight: 600;
    line-height: 26px;
  }
  > :deep(.v-card-text) {
    padding: 0;
    font-size: 14px;
    line-height: 23px;
  }
  > :deep(.v-card-actions) {
    padding: 20px 0 0;
  }
  .b-language-override-table__validation {
    margin-block-start: 16px;
  }
  .b-language-override-table__actions {
    display: flex;
    justify-content: flex-end;
    flex-wrap: wrap;
    gap: 10px;
    width: 100%;
  }
}
</style>
