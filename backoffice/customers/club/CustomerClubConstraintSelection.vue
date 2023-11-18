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
      class="m-1 shadow-box"
      rounded
      :outlined="!noClub"
      depressed
      :color="noClub ? '#222' : '#aaa'"
      :dark="noClub"
      :class="{ 'img-grayscale': !noClub }"
      @click="$emit('update:noClub',!noClub)"

    >{{ $t("global.commons.no_club") }}</v-btn
    >
    <v-btn
      class="m-1 shadow-box"
      rounded
      :outlined="!bronzeClub"
      depressed
      :color="bronzeClub ? '#222' : '#aaa'"
      :dark="bronzeClub"
      :class="{ 'img-grayscale': !bronzeClub }"
      @click="$emit('update:bronzeClub',!bronzeClub)"

    ><img :src="CustomerClubLevels.BRONZE.icon" width="24" class="me-2" />
      {{ $t(CustomerClubLevels.BRONZE.name) }}</v-btn
    >
    <v-btn
      class="m-1 shadow-box"
      rounded
      :outlined="!silverClub"
      depressed
      :color="silverClub ? '#222' : '#aaa'"
      :dark="silverClub"
      :class="{ 'img-grayscale': !silverClub }"
      @click="$emit('update:silverClub',!silverClub)"

    ><img :src="CustomerClubLevels.SILVER.icon" width="24" class="me-2" />
      {{ $t(CustomerClubLevels.SILVER.name) }}</v-btn
    >
    <v-btn
      class="m-1 shadow-box"
      rounded
      :outlined="!goldClub"
      depressed
      :color="goldClub ? '#222' : '#aaa'"
      :dark="goldClub"
      :class="{ 'img-grayscale': !goldClub }"
      @click="$emit('update:goldClub',!goldClub)"
      ><img :src="CustomerClubLevels.GOLD.icon" width="24" class="me-2" />
      {{ $t(CustomerClubLevels.GOLD.name) }}</v-btn
    >
    <v-btn
      class="m-1 shadow-box"
      rounded
      :outlined="!platinumClub"
      depressed
      :color="platinumClub ? '#222' : '#aaa'"
      :dark="platinumClub"
      :class="{ 'img-grayscale': !platinumClub }"
      @click="$emit('update:platinumClub',!platinumClub)"

    ><img :src="CustomerClubLevels.PLATINUM.icon" width="24" class="me-2" />
      {{ $t(CustomerClubLevels.PLATINUM.name) }}</v-btn
    >
    <v-btn
      class="m-1 shadow-box"
      rounded
      :outlined="!diamondClub"
      depressed
      :color="diamondClub ? '#222' : '#aaa'"
      :dark="diamondClub"
      :class="{ 'img-grayscale': !diamondClub }"
      @click="$emit('update:diamondClub',!diamondClub)"

    ><img :src="CustomerClubLevels.DIAMOND.icon" width="24" class="me-2" />
      {{ $t(CustomerClubLevels.DIAMOND.name) }}</v-btn
    >
  </v-row>
</template>

<script>
import { CustomerClubLevels } from "@core/enums/customer/CustomerClubLevels";

export default {
  name: "CustomerClubConstraintSelection",
  props: {
    noClub: {},
    bronzeClub: {},
    silverClub: {},
    goldClub: {},
    platinumClub: {},
    diamondClub: {},
  },
  data: () => ({
    CustomerClubLevels: CustomerClubLevels,
  }),
};
</script>

<style scoped></style>
