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
  <v-row v-if="network" dense class="gns text-center">
    <v-col cols="3">
      <small>{{ $t("global.commons.active") }}</small>
      <check :value="network.active"></check>
    </v-col>
    <v-col v-if="isBlockchain" cols="3">
      <small>{{ $t("global.commons.sync") }}</small>
      <check :value="network.synced"></check>
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
      cols="12"
      :title="$t('global.commons.price')"
    >
      <div dir="ltr">
        <b>{{ network.price | numeralFormat("0,0.[0000]")  }}</b>
        USD
      </div>
      <v-sparkline
        v-if="network.history.length"
        :smooth="3"
        :gradient="
          network.history[network.history.length - 1] >= network.history[0]
            ? ['#2f976e', '#1ca2d7']
            : ['#847', '#F48']
        "
        :line-width="1"
        :value="network.history"
        auto-draw
        :height="20"
        padding="3"
        stroke-linecap="round"
      >
      </v-sparkline>
    </v-col>

    <v-col v-if="network.error" cols="12" :title="network.error" class="text-start">
      <small
        ><v-icon color="red" small>error</v-icon>
        {{ $t("global.commons.error") }}</small
      >
      {{ network.error?.limitWords(12) }}
    </v-col>
  </v-row>
</template>

<script>
export default {
  name: "SBackofficeGatewayNetworkStatus",
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

<style scoped lang="scss">
.gns {
  small {
    display: block;
  }
}
</style>
