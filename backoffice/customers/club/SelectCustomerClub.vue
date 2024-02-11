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
    :model-value="modelValue"
    :multiple="multiple"
    @update:model-value="(val) => $emit('update:modelValue', val)"
  >
    <v-container>
      <v-row>
        <v-col v-for="level in CustomerClubLevels" :key="level.code">
          <v-item v-slot="{ isSelected, toggle }" :value="level.code">
            <v-card
              :color="isSelected ? 'primary' : ''"
              class="d-flex align-center justify-center flex-column p-2 min-h-100"
              dark
              @click="toggle"
            >
              <img :src="level.icon" class="m-2" height="36" width="36" />
              {{ $t(level.name) }}
            </v-card>
          </v-item>
        </v-col>

        <v-col v-if="noClub" key="no">
          <v-item v-slot="{ isSelected, toggle }" value="no-club">
            <v-card
              :color="isSelected ? 'primary' : ''"
              class="d-flex align-center justify-center flex-column p-2 min-h-100"
              dark
              @click="toggle"
            >
              <v-icon class="m-2" height="36" size="36">face</v-icon>
              {{ $t("global.commons.no_club") }}
            </v-card>
          </v-item>
        </v-col>

        <v-col v-if="clearable" key="all">
          <v-card
            :color="!modelValue ? 'primary' : ''"
            class="d-flex align-center justify-center flex-column p-2 min-h-100"
            dark
            @click="$emit('update:modelValue', null)"
          >
            {{ clearText ? clearText : "-" }}
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
  emits: ["update:modelValue"],
  props: {
    modelValue: {},
    multiple: {
      type: Boolean,
      default: false,
    },
    clearable: {
      // Show in all ! no constraint! used in  popups!
      type: Boolean,
      default: false,
    },
    clearText() {},
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
