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
  <v-item-group
    :value="value"
    @change="(val) => $emit('input', val)"
    :multiple="multiple"
  >
    <v-container>
      <v-row>
        <v-col v-for="level in CustomerClubLevels" :key="level.code">
          <v-item v-slot="{ active, toggle }" :value="level.code">
            <v-card
              :color="active ? 'primary' : ''"
              class="d-flex align-center justify-center flex-column p-2 min-h-100"
              dark
              @click="toggle"
            >
              <img width="36" height="36" class="m-2" :src="level.icon" />
              {{ $t(level.name) }}
            </v-card>
          </v-item>
        </v-col>

        <v-col v-if="noClub" key="no">
          <v-item v-slot="{ active, toggle }" value="no-club">
            <v-card
              :color="active ? 'primary' : ''"
              class="d-flex align-center justify-center flex-column p-2 min-h-100"
              dark
              @click="toggle"
            >
              <v-icon size="36" height="36" class="m-2">face</v-icon>
              {{ $t("global.commons.no_club") }}
            </v-card>
          </v-item>
        </v-col>

        <v-col v-if="clearable" key="all">
          <v-card
            :color="!value ? 'primary' : ''"
            class="d-flex align-center justify-center flex-column p-2 min-h-100"
            dark
            @click="$emit('input', null)"
          >
            {{clearText? clearText:'-' }}
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-item-group>
</template>

<script>
import { CustomerClubLevels } from "@core/enums/customer/CustomerClubLevels";

export default {
  name: "SelectCustomerClub",
  props: {
    value: {},
    multiple: {
      type: Boolean,
      default: false,
    },
    clearable: {
      // Show in all ! no constraint! used in  popups!
      type: Boolean,
      default: false,
    },
    clearText(){

    },
    noClub: {
      type: Boolean,
      default: false,
    },
  },
  data: () => ({
    CustomerClubLevels: CustomerClubLevels,
  }),
};
</script>

<style scoped></style>
