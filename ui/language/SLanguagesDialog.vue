<template>
  <v-dialog
    fullscreen
    :value="value"
    @input="(val) => $emit('input', val)"
    transition="dialog-bottom-transition"
    scrollable
  >
    <v-card>
      <v-card-title
        ><v-icon class="me-1">translate</v-icon>
        {{ $t("global.commons.language") }}

        <v-spacer></v-spacer>
        <v-text-field
          flat
          solo
          hide-details
          v-model="search"
          :placeholder="$t('global.commons.search')"
          append-icon="search"
          class="max-width-field-mini"
          clearable
        ></v-text-field>
      </v-card-title>
      <v-card-text>
        <v-container>
          <v-row dense>
            <v-col
              v-for="lan in languages"
              :key="lan.code"
              cols="6"
              sm="4"
              md="3"
            >
              <v-btn @click="select(lan)" text class="font-weight-bold">
                <v-icon
                  v-if="
                    selectedLanguage === lan.code ||
                    (multiple && selectedLanguage?.includes(lan.code))
                  "
                  class="me-1"
                  color="success"
                  >check</v-icon
                >
                {{ lan.title }}
                <v-icon
                  v-if="checkedLanguages && checkedLanguages.includes(lan.code)"
                  color="primary"
                  small
                  class="ms-1"
                  >check_circle</v-icon
                >
              </v-btn>
              <v-row
                v-if="show_flags"
                class="max-w-200 mt-1 mx-auto"
                no-gutters
                justify="center"
                ><flag
                  v-for="f in lan.countries"
                  :key="f"
                  :iso="f"
                  :squared="false"
                  class="m-1"
                />
              </v-row>
            </v-col>
          </v-row>

          <div class="text-start mt-5">
            <v-chip @click="show_flags = !show_flags" color="#fafafa">
              <v-icon left :color="show_flags ? 'primary' : undefined">{{
                show_flags ? "radio_button_checked" : "radio_button_unchecked"
              }}</v-icon>
              Show flags
            </v-chip>
          </div>
          <v-subheader class="my-5"
            >*Countries are random! Do you have an opinion on languages and
            countries? Please email us.</v-subheader
          >
        </v-container>
      </v-card-text>

      <v-card-actions>
        <div class="widget-buttons">
          <v-btn x-large text @click="$emit('input', false)">
            <v-icon class="me-1">close</v-icon>
            {{ $t("global.actions.close") }}
          </v-btn>
        </div>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { Language } from "../../../../core/enums/language/Language";
import SetupService from "../../../../core/server/SetupService";

export default {
  name: "SLanguagesDialog",

  props: {
    value: {},
    selectedLanguage: {},
    availableLanguages: {},
    checkedLanguages: {
      // Show a tick after language (Use case: in multi languages articles to show which language exists!)
    },
    multiple: { type: Boolean, default: false },
  },

  data: () => ({
    show_flags: false,
    search: null,
  }),

  computed: {
    languages() {
      if (this.availableLanguages) {
        return Object.values(Language).filter((i) =>
          this.availableLanguages.includes(i.code)
        );
      }

      return Object.values(Language)
        .filter((i) => i.vip || !SetupService.LocalServiceCountry())
        .filter((l) => {
          return (
            !this.search ||
            l.code === this.search ||
            l.title.includes(this.search) ||
            l.countries.includes(this.search.toUpperCase())
          );
        });
    },
  },
  watch: {},

  created() {},

  methods: {
    select(lan) {
      if (this.multiple) {
        let out = [];
        if (this.selectedLanguage && Array.isArray(this.selectedLanguage))
          out = Object.assign([], this.selectedLanguage);

        out.toggle(lan.code);
        this.$emit("update:selectedLanguage", out);
        this.$emit("change", out);
      } else {
        this.$emit("update:selectedLanguage", lan.code);
        this.$emit("change", lan.code);
        this.$emit("input", false);
      }
    },
  },
};
</script>

<style scoped></style>
