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
  <v-row justify="center" no-gutters>
    <v-btn
      :class="{ 'img-grayscale': !noClub }"
      :color="noClub ? '#222' : '#aaa'"
      :variant="!noClub ? 'outlined' : 'flat'"
      class="m-1 shadow-box"
      rounded
      @click="$emit('update:noClub', !noClub)"
      >{{ $t("global.commons.no_club") }}
    </v-btn>
    <v-btn
      :class="{ 'img-grayscale': !bronzeClub }"
      :color="bronzeClub ? '#222' : '#aaa'"
      :variant="!bronzeClub ? 'outlined' : 'flat'"
      class="m-1 shadow-box"
      rounded
      @click="$emit('update:bronzeClub', !bronzeClub)"
      ><img :src="CustomerClubLevels.BRONZE.icon" class="me-2" width="24" />
      {{ $t(CustomerClubLevels.BRONZE.name) }}
    </v-btn>
    <v-btn
      :class="{ 'img-grayscale': !silverClub }"
      :color="silverClub ? '#222' : '#aaa'"
      :variant="!silverClub ? 'outlined' : 'flat'"
      class="m-1 shadow-box"
      rounded
      @click="$emit('update:silverClub', !silverClub)"
      ><img :src="CustomerClubLevels.SILVER.icon" class="me-2" width="24" />
      {{ $t(CustomerClubLevels.SILVER.name) }}
    </v-btn>
    <v-btn
      :class="{ 'img-grayscale': !goldClub }"
      :color="goldClub ? '#222' : '#aaa'"
      :variant="!goldClub ? 'outlined' : 'flat'"
      class="m-1 shadow-box"
      rounded
      @click="$emit('update:goldClub', !goldClub)"
      ><img :src="CustomerClubLevels.GOLD.icon" class="me-2" width="24" />
      {{ $t(CustomerClubLevels.GOLD.name) }}
    </v-btn>
    <v-btn
      :class="{ 'img-grayscale': !platinumClub }"
      :color="platinumClub ? '#222' : '#aaa'"
      :variant="!platinumClub ? 'outlined' : 'flat'"
      class="m-1 shadow-box"
      rounded
      @click="$emit('update:platinumClub', !platinumClub)"
      ><img :src="CustomerClubLevels.PLATINUM.icon" class="me-2" width="24" />
      {{ $t(CustomerClubLevels.PLATINUM.name) }}
    </v-btn>
    <v-btn
      :class="{ 'img-grayscale': !diamondClub }"
      :color="diamondClub ? '#222' : '#aaa'"
      :variant="!diamondClub ? 'outlined' : 'flat'"
      class="m-1 shadow-box"
      rounded
      @click="$emit('update:diamondClub', !diamondClub)"
      ><img :src="CustomerClubLevels.DIAMOND.icon" class="me-2" width="24" />
      {{ $t(CustomerClubLevels.DIAMOND.name) }}
    </v-btn>
  </v-row>
</template>

<script>
import { Club } from "@selldone/core-js";

export default {
  name: "BClubConstraint",
  props: {
    noClub: {},
    bronzeClub: {},
    silverClub: {},
    goldClub: {},
    platinumClub: {},
    diamondClub: {},
  },
  data: () => ({
    CustomerClubLevels: Club.Levels,
  }),
};
</script>

<style scoped></style>
