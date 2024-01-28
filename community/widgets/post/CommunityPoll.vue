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
      class="p-item fadeIn"
      :style="{ 'animation-delay': 100 + i * 75 + 'ms' }"
      v-for="(item, i) in value"
      :key="i"
    >
      <v-btn
        class="bounceIn"
        :style="{ 'animation-delay': 250 + i * 75 + 'ms' }"
        :disabled="editable"
        :color="isCheck(item) ? 'blue' : undefined"
        icon
        @click="isCheck(item) ? undefined : $emit('click:item', item)"
        :loading="busy === item"
      >
        <v-icon>{{
          isCheck(item) ? "circle" : "radio_button_unchecked"
        }}</v-icon>
      </v-btn>

      <div class="p-con px-2">
        <v-text-field
          v-if="editable"
          v-model="item.title"
          solo
          flat
          placeholder="Answer here..."
          hide-details
        ></v-text-field>
        <div v-else>
          {{ item.title }}
        </div>

        <v-progress-linear
          rounded
          height="6"
          color="blue"
          :value="total ? (100 * item.value) / total : 0"
        ></v-progress-linear>
      </div>
      <div class="p-val">
        <v-btn v-if="editable" icon color="red" @click="remove(value, item)"
          ><v-icon>close</v-icon></v-btn
        >
        <span v-else>{{  numeralFormat(item.value ,"0.[0]a") }}</span>
      </div>
    </div>

    <div>
      <v-btn
              v-if="editable"
              color="success"
              depressed
              class="m-2"
              text
              @click="addItem"
      ><v-icon class="me-1">add</v-icon> Add new poll item</v-btn
      >
    </div>
  </div>
</template>

<script>
export default {
  name: "CommunityPoll",
  props: {
    value: {},

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
      this.value.forEach((i) => (sum += i.value));
      return sum;
    },
  },

  created() {
    if (!this.value || !Array.isArray(this.value)) {
      this.$emit("input", []);
    }
  },

  methods: {
    isCheck(item) {
      return this.userSelectedId === item.id;
    },
    addItem() {
      this.value.push({ title: "", value: 0 });
    },
  },
};
</script>

<style scoped lang="scss">
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
