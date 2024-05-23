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
        class="p-2 pp row-hover usn"
        @click="toggle(task[itemValue])"
      >
        <div class="d-flex align-center mnh">
          <div class="position-relative me-2" style="min-width: 32px">
            <v-icon
              :class="{
                'avatar-gradient': modelValue.includes(task[itemValue]),
              }"
              class="-thin -gray flex-grow-0 h-auto center-absolute"
              color="primary"
              size="24"
              >{{
                modelValue.includes(task[itemValue])
                  ? "lens"
                  : "radio_button_unchecked"
              }}
            </v-icon>
          </div>

          <div class="flex-grow-1">
            <b v-html="$t(task[itemText])"> </b>
            <v-list-subheader
              v-if="itemDescription"
              class="p-0"
              style="height: auto"
            >
              {{ $t(task[itemDescription]) }}
            </v-list-subheader>
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
.mnh {
  min-height: 40px;
}
</style>
