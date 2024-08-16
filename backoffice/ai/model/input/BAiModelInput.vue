<!--
  - Copyright (c) 2023-2024. Selldone® Business OS™
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
  <v-select
    :bg-color="backgroundColor"
    :flat="flat"
    :hide-details="hideDetails"
    :items="ai_models"
    :model-value="modelValue"
    :outlined="outlined"
    :single-line="singleLine"
    :variant="variant"
    item-title="title"
    item-value="code"
    label="Model"
    @update:model-value="(val) => $emit('update:modelValue', val)"
  >
    <template v-slot:item="{ item, props }">
      <v-list-item
        :title="$t(item.raw.title)"
        class="text-start"
        v-bind="props"
      >
        <template v-slot:prepend>
          <v-avatar rounded size="32">
            <v-img :src="item.raw.image" />
          </v-avatar>
        </template>
      </v-list-item>
    </template>

    <template v-slot:selection="{ item }">
      <v-avatar rounded="lg" size="24" start>
        <img :src="item.raw.image" />
      </v-avatar>
      <b class="ms-2">{{ $t(item.raw.title) }}</b>
    </template>
  </v-select>
</template>

<script>
export default {
  name: "BAiModelInput",
  emits: ["update:modelValue"],
  props: {
    modelValue: {},
    outlined: { type: Boolean },
    hideDetails: { type: Boolean },
    solo: { type: Boolean },
    flat: { type: Boolean },
    label: {},
    backgroundColor: {},
    variant: {
      default: "underlined",
    },
    singleLine: Boolean,
  },

  data: () => ({
    ai_models: [
      {
        code: "chatgpt",
        title: "GPT 4",
        image: require("./asset/chatgpt.svg"),
      },
    ],
  }),
};
</script>

<style scoped></style>
