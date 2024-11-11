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
  <div>
    <v-table
      :key="'key' + key"
      :class="{ dense: dense }"
      :dense="dense"
      class="mx-2 bg-transparent"
    >
      <template v-slot:default>
        <thead class="text-start">
          <tr>
            <th class="max-w-120">Record</th>
            <th>Default</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody class="text-start">
          <tr
            v-for="(val, key) in structure"
            :key="key"
            :class="{
              'bg-red-soft': !checkValidParams(key),
              '-edited': modelValue[key] && isString(modelValue[key]),
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
              <h3 class="mt-3 mb-2 text-blue">{{ key }}</h3>

              <!-- Table -->
              <b-language-override-table
                v-model="modelValue[key]"
                :dense="dense"
                :nested="nested"
                :structure="val"
                :to="to"
              ></b-language-override-table>
            </td>

            <!-- Print -->
            <template v-else>
              <!-- Key -->

              <td class="max-w-120 text-muted">
                {{ getName(key) }}<br />
                <small v-if="!dense">{{ key }}</small>
              </td>

              <!-- Original -->
              <td>
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
              <td :dir="language_object.dir">
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
                  <span v-if="modelValue[key]">🔵 {{ modelValue[key] }} </span>
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
      <v-card v-if="selected_key !== null" class="text-start" rounded="xl">
        <v-card-title> Edit | {{ selected_key }}</v-card-title>
        <v-card-text>
          <v-list-subheader>Original value</v-list-subheader>
          <p v-copy class="typo-body text-start text--black">
            {{ structure[selected_key] }}
          </p>

          <v-list-subheader>Translated value</v-list-subheader>

          <v-text-field
            v-model="input"
            :dir="language_object.dir"
            label="Translated"
            variant="outlined"
          >
          </v-text-field>

          <div v-if="!checkValidParams(selected_key)" class="widget-buttons">
            <v-btn
              color="black"
              size="x-large"
              variant="elevated"
              @click="autoFix(selected_key)"
            >
              <v-icon class="me-1">auto_fix_high</v-icon>
              Auto fix
            </v-btn>
          </div>
        </v-card-text>
        <v-card-actions>
          <div class="widget-buttons">
            <v-btn size="x-large" variant="text" @click="dialog = false">
              <v-icon start>close</v-icon>
              {{ $t("global.actions.close") }}
            </v-btn>
            <v-btn
              :loading="busy_save"
              color="primary"
              size="x-large"
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
export default {
  name: "BLanguageOverrideTable",
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
      this.dialog = true;
      this.selected_key = key;
      this.input = this.modelValue[this.selected_key];
      //console.log("editRecord", key, this.dialog);
    },
    setValue() {
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
      let out = this.modelValue[key];

      const paramsPattern = /[^{\}]+(?=})/g;

      const original = this.structure[key];
      const translated = this.modelValue[key];

      let originalParams = original.match(paramsPattern);
      let translatedParams = translated.match(paramsPattern);

      if (translatedParams.length !== originalParams.length) {
        this.showErrorAlert(null, "Params length not equal!");
        return;
      }
      for (let i = 0; i < translatedParams.length; i++) {
        out = out.replace(`{${translatedParams[i]}}`, `{${originalParams[i]}}`);
      }

      console.log("out", out, translatedParams, originalParams);
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
</style>
