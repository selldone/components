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
  <div :class="{ dark: dark }" class="text-start">
    <h3 v-if="label" class="my-2">{{ label }}</h3>
    <v-subheader v-if="hint">{{ hint }}</v-subheader>

    <v-slide-y-transition
      tag="div"
      group
      class="border-between-vertical rounded-card"
      :class="{ disabled: disabled }"
      hide-on-leave
    >
      <div
        v-for="task in items_show"
        :key="task[itemValue]"
        class="p-2 pp row-hover usn"
        :class="{ 'bg-dark': dark, 'bg-white': !dark, disabled: task.disabled }"
        @click="toggle(task[itemValue])"
      >
        <div class="d-flex align-center mnh">
          <v-icon
            color="primary"
            class="me-2 -thin -gray flex-grow-0"
            :class="{ 'avatar-gradient': value.includes(task[itemValue]) }"
            >{{
              value.includes(task[itemValue])
                ? "lens"
                : "radio_button_unchecked"
            }}</v-icon
          >
          <div class="flex-grow-1">
            <b v-html="$t(task[itemText])"> </b>
            <v-subheader
              v-if="itemDescription"
              style="height: auto"
              class="p-0"
            >
              {{ $t(task[itemDescription]) }}
            </v-subheader>
          </div>

          <v-icon v-if="itemIcon">{{ task[itemIcon] }}</v-icon>
          <img v-if="itemImage" width="24" height="24" :src="task[itemImage]" />
        </div>
      </div>
    </v-slide-y-transition>
  </div>
</template>

<script>
export default {
  name: "SSmartMultiSelect",
  props: {
    value: {},
    items: { type: Array },
    itemValue: {
      required: true,
    },
    itemText: {
      required: true,
    },
    itemDescription: {},
    itemIcon: {},
    itemImage: {},

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
  },

  data: function () {
    return {};
  },

  computed: {
    items_show() {
      return this.items;
    },
  },
  watch: {},

  methods: {
    toggle(val) {
      this.value.toggle(val);

      this.$emit("input", this.value);
      this.$emit("change", this.value);
      this.signalUpdate();
    },

    signalUpdate() {
      this.$nextTick(() => {
        this.$forceUpdate();
      });
    },
  },
};
</script>

<style scoped lang="scss">
.mnh {
  min-height: 40px;
}
</style>
