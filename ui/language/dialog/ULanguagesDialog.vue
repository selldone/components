<!--
  - Copyright (c) 2023. Selldone® Business OS™
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
    <v-card>
      <v-card-title class="d-flex">
        <v-icon class="me-1">translate</v-icon>
        {{ $t("global.commons.language") }}
      </v-card-title>
      <v-card-text>
        <v-container>
          <v-row no-gutters>
            <v-spacer></v-spacer>
            <v-text-field
              v-model="search"
              :placeholder="$t('global.commons.search')"
              append-inner-icon="search"
              class="max-width-field-mini"
              clearable
              flat
              hide-details
              variant="solo"
            ></v-text-field>
          </v-row>

          <v-row dense>
            <v-col
              v-for="lan in languages"
              :key="lan.code"
              cols="6"
              md="3"
              sm="4"
            >
              <v-btn
                class="font-weight-bold"
                variant="text"
                @click="select(lan)"
              >
                <v-icon
                  v-if="
                    selectedLanguage === lan.code ||
                    (multiple && selectedLanguage?.includes(lan.code))
                  "
                  class="me-2"
                  color="success"
                  >check
                </v-icon>
                <small class="font-weight-light me-1 ms-n1">{{
                  lan.code
                }}</small>
                {{ lan.title }}
                <v-icon
                  v-if="checkedLanguages && checkedLanguages.includes(lan.code)"
                  class="ms-1"
                  color="primary"
                  size="small"
                  >check_circle
                </v-icon>
              </v-btn>
              <v-row
                v-if="show_flags"
                class="max-w-200 mt-1 mx-auto"
                justify="center"
                no-gutters
              >
                <flag
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
            <v-chip
              color="#fafafa"
              @click="show_flags = !show_flags"
              variant="flat"
            >
              <v-icon :color="show_flags ? 'primary' : undefined" start
                >{{
                  show_flags ? "radio_button_checked" : "radio_button_unchecked"
                }}
              </v-icon>
              Show flags
            </v-chip>
          </div>
          <v-list-subheader v-if="show_flags" class="my-5"
            >*Countries are random! Do you have an opinion on languages and
            countries? Please email us.
          </v-list-subheader>
        </v-container>
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
        </div>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { Language } from "@selldone/core-js/enums/language/Language";
import { SetupService } from "@selldone/core-js/server/SetupService";

export default {
  name: "ULanguagesDialog",
  emits: ["update:modelValue", "change"],
  props: {
    modelValue: {},
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
      let out = [];
      if (this.availableLanguages) {
        out = Object.values(Language).filter((i) =>
          this.availableLanguages.includes(i.code),
        );
      } else {
        out = Object.values(Language);
      }

      return out
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
        this.$emit("update:modelValue", false);
      }
    },
  },
};
</script>

<style scoped></style>
