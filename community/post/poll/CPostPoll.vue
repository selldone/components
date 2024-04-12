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
  <div class="poll">
    <div
      v-for="(item, i) in modelValue"
      :key="i"
      :style="{ 'animation-delay': 100 + i * 75 + 'ms' }"
      class="p-item fadeIn"
    >
      <v-btn
        :color="isCheck(item) ? 'blue' : undefined"
        :disabled="editable"
        :loading="busy === item"
        :style="{ 'animation-delay': 250 + i * 75 + 'ms' }"
        class="bounceIn"
        icon variant="text"
        @click="isCheck(item) ? undefined : $emit('click:item', item)"
      >
        <v-icon
          >{{ isCheck(item) ? "circle" : "radio_button_unchecked" }}
        </v-icon>
      </v-btn>

      <div class="p-con px-2">
        <v-text-field
          v-if="editable"
          v-model="item.title"
          flat
          hide-details
          placeholder="Answer here..."
          variant="solo"
        ></v-text-field>
        <div v-else>
          {{ item.title }}
        </div>

        <v-progress-linear
          :model-value="total ? (100 * item.value) / total : 0"
          color="blue"
          height="6"
          rounded
        ></v-progress-linear>
      </div>
      <div class="p-val">
        <v-btn
          v-if="editable"
          color="red"
          icon variant="text"
          @click="remove(modelValue, item)"
        >
          <v-icon>close</v-icon>
        </v-btn>
        <span v-else>{{ numeralFormat(item.value, "0.[0]a") }}</span>
      </div>
    </div>

    <div>
      <v-btn
        v-if="editable"
        class="m-2"
        color="success"
        variant="text"
        @click="addItem"
      >
        <v-icon start>add</v-icon>
        Add new poll item
      </v-btn>
    </div>
  </div>
</template>

<script>
export default {
  name: "CPostPoll",
  emits: ["click:item", "update:modelValue"],
  props: {
    modelValue: {},

    editable: {
      type: Boolean,
      default: false,
    },
    userSelectedId: {},
    busy: {}, // busy item
  },
  data() {
    return {};
  },

  computed: {
    total() {
      let sum = 0;
      this.modelValue.forEach((i) => (sum += i.modelValue));
      return sum;
    },
  },

  created() {
    if (!this.modelValue || !Array.isArray(this.modelValue)) {
      this.$emit("update:modelValue", []);
    }
  },

  methods: {
    isCheck(item) {
      return this.userSelectedId === item.id;
    },
    addItem() {
      this.modelValue.push({ title: "", value: 0 });
    },
  },
};
</script>

<style lang="scss" scoped>
.poll {
  display: flex;
  flex-direction: column;
  text-align: start;

  .p-item {
    padding: 12px 8px;
    display: flex;
    align-items: center;

    .p-con {
      display: flex;
      flex-direction: column;
      flex-grow: 1;
      font-size: 1.4rem;

      .v-input {
        font-size: 1.4rem;
      }
    }

    .p-val {
      min-width: 50px;
      text-align: center;
      font-weight: 600;
    }
  }
}
</style>
