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
  <div class="text-start" :class="{ disabled: disabled }">
    <v-expand-transition>
      <v-list-item v-if="value" :dark="dark" key="1">
        <v-list-item-avatar rounded>
          <v-img :src="getShopImagePath(value)"></v-img>
        </v-list-item-avatar>
        <v-list-item-content>
          <v-list-item-title>{{ label }}</v-list-item-title>
          <v-list-item-subtitle>{{ hint }}</v-list-item-subtitle>
        </v-list-item-content>
        <v-list-item-action>
          <v-btn @click="$emit('input', null) /*Clear image*/" icon color="red"
            ><v-icon>close</v-icon></v-btn
          >
        </v-list-item-action>
      </v-list-item>
      <v-file-input
        v-else
        key="2"
        :value="file"
        @change="(val) => $emit('update:file', val)"
        color="primary"
        :label="label"
        :placeholder="hint"
        prepend-inner-icon="image"
        prepend-icon=""
        accept="image/*"
        show-size
        :messages="message"
        :dark="dark"
      />
    </v-expand-transition>
  </div>
</template>

<script>
export default {
  name: "SSmartImageInput",
  components: {},
  props: {
    file: {},
    value: {}, // Save value on database (path of image)

    label: {},
    hint: {},

    disabled: {
      default: false,
      type: Boolean,
    },

    dark: {
      default: false,
      type: Boolean,
    },
    message:{default:'Max image size: 2MB'}
  },
  computed: {},

  methods: {},
};
</script>

<style scoped lang="scss"></style>
