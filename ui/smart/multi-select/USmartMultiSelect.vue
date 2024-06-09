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
  <div :class="{ dark: dark }" class="u--smart-multi-select">
    <h3 v-if="label" class="my-2">{{ label }}</h3>
    <v-list-subheader v-if="hint">{{ hint }}</v-list-subheader>

    <v-slide-y-transition
      :class="{ disabled: disabled }"
      class="border-between-vertical rounded-card"
      group
      hide-on-leave
      tag="div"
    >
      <div
        v-for="task in items_show"
        :key="task[itemValue]"
        :class="{ 'bg-dark': dark, 'bg-white': !dark, disabled: task.disabled }"
        class="pa-2 pp row-hover usn"
        @click="toggle(task[itemValue])"
      >
        <div class="d-flex align-center mnh">
          <div
            :class="{ 'avatar-gradient': modelValue.includes(task[itemValue]) }"
            class="me-2 -thin -gray flex-grow-0"
          >
            <v-sheet
              v-if="modelValue.includes(task[itemValue])"
              :color="color"
              class="circle-check zoomIn"
            >
              <!-- Loading -->
              <v-progress-circular
                v-if="loading"
                :color="'#fff'"
                :size="14"
                :width="3"
                class="center-absolute"
                indeterminate
              ></v-progress-circular>
            </v-sheet>
            <div v-else style="width: 28px" class="text-center">
              <v-icon
                :color="dark ? '#fff' : grayUnselected ? '#333' : color"
                size="22"
                >radio_button_unchecked
              </v-icon>
            </div>
          </div>

          <div class="flex-grow-1">
            <b v-html="$t(task[itemText])"> </b>
            <div v-if="itemDescription" class="op-0-7 small">
              {{ $t(task[itemDescription]) }}
            </div>
          </div>

          <v-icon v-if="itemIcon">{{ task[itemIcon] }}</v-icon>
          <img v-if="itemImage" :src="task[itemImage]" height="24" width="24" />
        </div>
      </div>
    </v-slide-y-transition>
  </div>
</template>

<script>
export default {
  name: "USmartMultiSelect",
  emits: ["update:modelValue", "change"],
  props: {
    modelValue: {},
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
    loading: { default: false, type: Boolean },
    color: { default: "primary" },
    grayUnselected: { default: false, type: Boolean },
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
      this.modelValue.toggle(val);

      this.$emit("update:modelValue", this.modelValue);
      this.$emit("change", this.modelValue);
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

<style lang="scss" scoped>
.u--smart-multi-select {
  text-align: start;

  .mnh {
    min-height: 40px;
  }

  .circle-check {
    animation-duration: 250ms;
    width: 20px;
    height: 20px;
    margin: 2px;
    border-radius: 50%;
  }

  .bg-dark {
    background: #000;
  }

  .bg-white {
    background: #fff;
  }
}
</style>
