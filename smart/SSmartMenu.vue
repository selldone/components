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
  <span>
    <v-menu offset-y rounded="lg" min-width="240">
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          icon
          v-bind="attrs"
          v-on="on"
          :loading="loading"
          class="z1"
          :title="title"
        >
          <v-icon>{{ icon }}</v-icon>
        </v-btn>
      </template>
      <v-list class="font-weight-medium text-start">
        <v-list-item
          v-for="item in items"
          :key="item.title"
          @click="
            item.click
              ? item.click(returnClickValue ? returnClickValue : item)
              : undefined
          "
          :to="item.to"
          :href="item.href"
          :target="item.target"
          :disabled="!!item.disabled"
        >
          <v-list-item-icon v-if="item.icon" class="me-3"
            ><v-icon>{{ item.icon }}</v-icon></v-list-item-icon
          >
          <v-list-item-content>
            <v-list-item-title class="d-flex align-center"
              ><span>{{ item.title }}</span>

              <v-spacer></v-spacer>
              <img v-if="item.image" :src="item.image" width="24" height="24" />
            </v-list-item-title>
            <v-list-item-subtitle v-if="item.subtitle">
              {{ item.subtitle }}
            </v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>

        <v-list-item
          v-if="hasWithTrashed"
          @click="$emit('update:withTrashed', !withTrashed)"
        >
          <v-list-item-icon class="me-3"
            ><v-icon color="primary">{{
              withTrashed ? "circle" : "radio_button_unchecked"
            }}</v-icon></v-list-item-icon
          >
          <v-list-item-title class="d-flex align-center"
            >Show deleted items
            <v-spacer></v-spacer>
            <v-icon class="ms-1">delete_outline</v-icon>
          </v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
  </span>
</template>

<script>
export default {
  name: "SSmartMenu",
  props: {
    icon: { default: "more_vert" },
    items: { type: Array },
    returnClickValue: {}, // If set return this value in callback instead of returning self item!

    loading: { type: Boolean, default: false },

    hasWithTrashed: { type: Boolean, default: false },
    withTrashed: { type: Boolean, default: false },

    title: {},
  },

  data: function () {
    return {};
  },

  computed: {},
  watch: {},

  methods: {},
};
</script>

<style scoped lang="scss">
.mnh {
  min-height: 40px;
}
</style>
