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
    <v-menu content-class="rounded-lg" min-width="240">
      <template v-slot:activator="{ props }">
        <v-btn
          @click.stop
          :loading="loading"
          :title="title"
          class="z1"
          icon
          v-bind="props"
          variant="text"
          density="comfortable"
        >
          <v-icon>{{ icon }}</v-icon>
        </v-btn>
      </template>
      <v-list class="font-weight-medium text-start">
        <v-list-item
          v-for="item in items"
          :key="item.title"
          :disabled="!!item.disabled"
          density="compact"
          slim
          :href="item.href"
          :prepend-icon="item.icon"
          :target="item.target"
          :to="item.to"
          @click="
            item.click
              ? item.click(returnClickValue ? returnClickValue : item)
              : undefined
          "
        >
          <v-list-item-title class="d-flex align-center"
            ><span>{{ item.title }}</span>

            <v-spacer></v-spacer>
            <img v-if="item.image" :src="item.image" height="24" width="24" />
          </v-list-item-title>
          <div v-if="item.subtitle" class="op-0-7 small mt-1">
            {{ item.subtitle }}
          </div>
        </v-list-item>

        <v-divider v-if="hasWithTrashed && items?.length"></v-divider>
        <v-list-item
          v-if="hasWithTrashed"
          :prepend-icon="withTrashed ? 'circle' : 'radio_button_unchecked'"
          @click="$emit('update:withTrashed', !withTrashed)"
        >
          <v-list-item-title class="d-flex align-center text-capitalize"
            >{{$t('smart_menu.show_delete_items')}}
            <v-spacer></v-spacer>
            <v-icon class="ms-1">delete_outline</v-icon>
          </v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
    <slot></slot>
  </span>
</template>

<script lang="ts">
export default {
  name: "USmartMenu",
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

<style lang="scss" scoped>
.mnh {
  min-height: 40px;
}
</style>
