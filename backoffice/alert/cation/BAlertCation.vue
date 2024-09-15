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
  <v-expand-transition>
    <div v-if="show">
      <v-sheet
        class="b--alert-cation pa-2 pa-sm-4 my-2"
        elevation="5"
        rounded="lg"
        :class="{ '-rtl': $vuetify.locale.isRtl }"
      >
        <v-sheet :color="color" class="b-a-bar"> </v-sheet>

        <v-btn
          icon
          size="32"
          variant="text"
          class="absolute-top-end"
          @click="show = false"
        >
          <v-icon>close</v-icon>
        </v-btn>

        <div class="px-2 px-sm-4 text-subtitle-2">
          <div
            v-if="cation.title"
            class="text-uppercase font-weight-bold mb-2"
            :style="{ color: color }"
          >
            {{ cation.title }}
          </div>
          <p v-if="!Array.isArray(cation.message)" class="  ">
            {{ cation.message }}
          </p>
          <div v-else class="  ">
            <p v-for="mes in cation.message" :key="mes" class="my-1">
              <v-icon class="me-1" size="10">circle</v-icon>
              {{ mes }}
            </p>
          </div>
        </div>

        <div class="pt-2">
          <v-btn
            v-if="cation.to"
            :to="cation.to"
            class="mx-2 tnt"
            color="primary"
            size="small"
            variant="elevated"
            >{{ cation.action }}
            <v-icon class="mx-1" size="small"
              >{{ $t("icons.chevron_next") }}
            </v-icon>
          </v-btn>
        </div>

        <template v-slot:append>
          <u-chart-radial-bar
            v-if="cation.score !== null"
            :colors="['#8BC34A']"
            :height="168"
            :labels="[$t('add_product.completed')]"
            :series="[cation.score]"
            :to-colors="['#AFB42B']"
          >
          </u-chart-radial-bar>
        </template>
      </v-sheet>
    </div>
  </v-expand-transition>
</template>

<script>
import UChartRadialBar from "../../../ui/chart/radial/bar/UChartRadialBar.vue";

export default {
  name: "BAlertCation",
  components: { UChartRadialBar },
  props: {
    cation: {},
  },
  data() {
    return {
      show: true,
    };
  },
  computed: {
    color() {
      return this.cation.type === "error"
        ? "red"
        : this.cation.type === "warning"
          ? "amber"
          : this.cation.type === "info"
            ? "blue"
            : "green";
    },
  },
};
</script>

<style scoped lang="scss">
.b--alert-cation {
  text-align: start;
  position: relative;

  .b-a-bar {
    position: absolute;
    left: 8px;
    top: 8px;
    bottom: 8px;
    width: 3px;
    border-radius: 2px;
  }

  &.-rtl {
    .b-a-bar {
      right: 8px;
      left: auto;
    }
  }
}
</style>
