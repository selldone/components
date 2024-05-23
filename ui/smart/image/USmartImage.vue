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
  <div :class="{ disabled: disabled }" class="text-start">
    <v-expand-transition>
      <v-list-item v-if="modelValue" key="1" :dark="dark">
        <template v-slot:prepend>
          <v-avatar rounded="lg">
            <v-img :src="getShopImagePath(modelValue)"></v-img>
          </v-avatar>
        </template>
        <v-list-item-title>{{ label }}</v-list-item-title>
        <v-list-item-subtitle>{{ hint }}</v-list-item-subtitle>

        <template v-slot:append>
          <v-list-item-action end>
            <v-btn
              color="red"
              icon
              variant="text"
              @click="$emit('update:modelValue', null) /*Clear image*/"
            >
              <v-icon>close</v-icon>
            </v-btn>
          </v-list-item-action>
        </template>
      </v-list-item>
      <v-file-input
        v-else
        key="2"
        :label="label"
        :messages="message"
        :model-value="file"
        :placeholder="hint"
        :variant="variant"
        accept="image/*"
        color="primary"
        prepend-icon=""
        prepend-inner-icon="image"
        show-size
        @update:model-value="(val) => $emit('update:file', val)"
      />
    </v-expand-transition>
  </div>
</template>

<script>
export default {
  name: "USmartImage",
  components: {},
  emits: ["update:file", "update:modelValue"],
  props: {
    file: {},
    modelValue: {}, // Save value on database (path of image)

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
    message: { default: "Max image size: 2MB" },
    variant: {
      default: "underlined",
    },
  },
  computed: {},

  methods: {},
};
</script>

<style lang="scss" scoped></style>
