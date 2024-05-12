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
  <v-row v-if="network" class="gns text-center" dense>
    <v-col cols="3">
      <small>{{ $t("global.commons.active") }}</small>
      <u-check :model-value="network.active" read-only></u-check>
    </v-col>
    <v-col v-if="isBlockchain" cols="3">
      <small>{{ $t("global.commons.sync") }}</small>
      <u-check :model-value="network.synced" read-only></u-check>
    </v-col>
    <v-col v-if="isBlockchain" cols="3">
      <small>{{ $t("global.commons.diff_time") }}</small>
      <span dir="ltr">
        <span title="hour">{{ Math.round(network.diff / (60 * 60)) }}</span> :
        <span title="min">{{ Math.round((network.diff / 60) % 60) }}</span> :
        <span title="sec">{{ Math.round(network.diff % 60) }}</span>
      </span>
    </v-col>

    <v-col v-if="isBlockchain" cols="3">
      <small>{{ $t("global.commons.network") }}</small>
      <span class="text-uppercase">{{ network.name }}</span>
    </v-col>

    <v-col
      v-if="network.history && Array.isArray(network.history)"
      :title="$t('global.commons.price')"
      cols="12"
    >
      <div dir="ltr">
        <b>{{ numeralFormat(network.price, "0,0.[0000]") }}</b>
        USD
      </div>
      <u-sparkline
        v-if="network.history.length"
        :gradient="
          network.history[network.history.length - 1] >= network.history[0]
            ? ['#2f976e', '#1ca2d7']
            : ['#847', '#F48']
        "
        :height="20"
        :line-width="1"
        :smooth="3"
        :value="network.history"
        auto-draw
        padding="3"
        stroke-linecap="round"
      >
      </u-sparkline>
    </v-col>

    <v-col
      v-if="network.error"
      :title="network.error"
      class="text-start"
      cols="12"
    >
      <small>
        <v-icon color="red" size="small">error</v-icon>
        {{ $t("global.commons.error") }}</small
      >
      {{ network.error?.limitWords(12) }}
    </v-col>
  </v-row>
</template>

<script>
import USparkline from "../../../ui/chart/sparkline/USparkline.vue";

export default {
  name: "BGatewayNetworkStatus",
  components: { USparkline },
  props: {
    network: {},
  },
  computed: {
    isBlockchain() {
      return this.network.blockchain;
    },
  },
};
</script>

<style lang="scss" scoped>
.gns {
  small {
    display: block;
  }
}
</style>
