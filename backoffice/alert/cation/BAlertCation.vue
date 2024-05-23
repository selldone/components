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
  <v-alert
    :title="cation.title"
    :type="cation.type"
    border="start"
    class="text-start"
    closable
    density="compact"
  >
    <v-row align="center" no-gutters>
      <v-btn
        v-if="cation.to"
        :to="cation.to"
        class="mx-2 tnt"
        color="primary"
        size="small"
        variant="text"
        >{{ cation.action }}
        <v-icon class="mx-1" size="small"
          >{{ $t("icons.chevron_next") }}
        </v-icon>
      </v-btn>
    </v-row>

    <p v-if="!Array.isArray(cation.message)">
      {{ cation.message }}
    </p>
    <div v-else>
      <p v-for="mes in cation.message" :key="mes" class="my-1">
        <v-icon class="me-2" size="small">circle</v-icon>
        {{ mes }}
      </p>
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
  </v-alert>
</template>

<script>
import UChartRadialBar from "../../../ui/chart/radial/bar/UChartRadialBar.vue";

export default {
  name: "BAlertCation",
  components: { UChartRadialBar },
  props: {
    cation: {},
  },
};
</script>

<style scoped></style>
