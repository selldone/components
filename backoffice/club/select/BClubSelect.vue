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
        <v-item v-if="noClub" v-slot="{ isSelected, toggle }" value="no-club">
          <v-btn
            key="no"
            class="m-1 shadow-box"
            rounded
            :color="isSelected ? '#222' : '#444'"
            :variant="!isSelected ? 'outlined' : 'flat'"
            @click="toggle()"
          >
            <v-icon class="me-2" size="24">face</v-icon>
            {{ $t("global.commons.no_club") }}
          </v-btn>
        </v-item>

        <div v-for="level in CustomerClubLevels" :key="level.code">
          <v-item v-slot="{ isSelected, toggle }" :value="level.code">
            <v-btn
              :color="isSelected ? '#222' : '#444'"
              :variant="!isSelected ? 'outlined' : 'flat'"
              @click="toggle()"
              class="ma-1 shadow-box"
              rounded
            >
              <img :src="level.icon" class="me-2" width="24" />
              {{ $t(level.name) }}
            </v-btn>
          </v-item>
        </div>

        <v-btn
          v-if="clearable"
          key="all"
          :color="!modelValue ? 'primary' : ''"
          @click="$emit('update:modelValue', null)"
          rounded
          class="ma-1"
          variant="flat"
        >
          {{ clearText ? clearText : "-" }}
        </v-btn>
      </v-row>
    </v-container>
  </v-item-group>
</template>

<script>
import { CustomerClubLevels } from "@selldone/core-js/enums/customer/CustomerClubLevels";

export default {
  name: "BClubSelect",
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
