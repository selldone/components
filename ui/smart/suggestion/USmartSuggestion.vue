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
  <div v-if="Array.isArray(samples) && samples?.length">
    <v-slide-group show-arrows>
      <v-slide-group-item key="o">
        <v-btn
          size="small"
          title="View list of suggestions."
          variant="plain"
          @click="showDialog"
        >
          <v-icon :size="18">pin_invoke</v-icon>
        </v-btn>
      </v-slide-group-item>
      <v-slide-group-item
        v-for="n in samples_processed"
        :key="is_object ? n.value : n"
      >
        <v-btn
          :title="is_object ? n.title : n"
          class="tnt"
          size="small"
          variant="plain"
          @click="$emit('select', is_object ? n.value : n)"
        >
          {{ (is_object ? n.title : n)?.limitWords(4) }}
        </v-btn>
      </v-slide-group-item>
    </v-slide-group>

    <!-- ██████████████████████ Dialog ██████████████████████ -->

    <v-dialog
      v-if="dialog_pre"
      v-model="dialog"
      fullscreen
      scrollable
      transition="dialog-bottom-transition"
    >
      <v-card>
        <v-card-text class="py-16">
          <v-list
            class="max-widget-width mx-auto text-start border-between-vertical overflow-visible"
            lines="two"
          >
            <v-list-item
              v-for="n in samples_processed"
              :key="is_object ? n.value : n"
              class="row-hover"
              @click="
                $emit('select', is_object ? n.value : n);
                closeDialog();
              "
            >
              <v-list-item-title class="typo-body text-wrap">
                {{ is_object ? n.title : n }}
              </v-list-item-title>
              <v-list-item-subtitle v-if="is_object">
                {{ n.value }}
              </v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </v-card-text>

        <v-card-actions>
          <div class="widget-buttons">
            <v-btn size="x-large" variant="text" @click="closeDialog">
              <v-icon start>close</v-icon>
              {{ $t("global.actions.close") }}
            </v-btn>
          </div>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import Seasons from "./Seasons.ts";
import { isObject } from "lodash-es";

export default defineComponent({
  name: "USmartSuggestion",
  components: {},

  emits: ["select"],
  props: {
    samples: {},
    addSession: { type: Boolean },
    noRandom: { type: Boolean },
  },
  data: () => ({
    dialog_pre: false,
    dialog: false,
  }),
  computed: {
    is_object() {
      return this.samples && isObject(this.samples[0]);
    },

    samples_processed() {
      if (this.is_object) return this.samples; // Not available for objects
      let out = this.samples;
      if (this.addSession) {
        // Get current date
        const date = new Date();

        // Get current month and year
        const month = date.getMonth();
        const year = date.getFullYear();

        // Get current season
        const found = Object.values(Seasons).find((s) =>
          s.months.includes(month),
        );
        const currentSeason = found ? this.$t(found.name) : "";

        out = this.samples?.map((n) => n + ` | ${currentSeason} ${year}`);
      }
      if (this.noRandom) return out;

      return out.random();
    },
  },
  methods: {
    showDialog() {
      this.dialog_pre = true;
      this.$nextTick(() => {
        this.dialog = true;
      });
    },
    closeDialog() {
      this.dialog = false;
      this.$nextTick(() => {
        this.dialog_pre = false;
      });
    },
  },
});
</script>

<style lang="scss" scoped></style>
