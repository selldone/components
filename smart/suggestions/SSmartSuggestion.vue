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
          variant="text"
          title="View list of suggestions."
          @click="showDialog"
        >
          <v-icon>pin_invoke</v-icon>
        </v-btn>
      </v-slide-group-item>
      <v-slide-group-item v-for="n in samples_processed" :key="n" :title="n">
        <v-btn
          class="tnt"
          variant="plain"
          @click="$emit('select', n)"
          size="small"
        >
          {{ n.limitWords(4) }}
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
              :key="n"
              class="row-hover"
              @click="
                $emit('select', n);
                closeDialog();
              "
            >
              <v-list-item-title class="typo-body text-wrap">
                {{ n }}
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </v-card-text>

        <v-card-actions>
          <div class="widget-buttons">
            <v-btn variant="text" size="x-large" @click="closeDialog">
              <v-icon class="me-1">close</v-icon>
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

export default defineComponent({
  name: "SSmartSuggestion",
  components: {},
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
    samples_processed() {
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

<style scoped lang="scss"></style>
