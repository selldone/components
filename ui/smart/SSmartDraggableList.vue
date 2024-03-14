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

    <draggable
      v-model="list"
      :class="{
        'rounded-list-xl': rounded,
        'border-between-vertical': borderBetween,
      }"
      :component-data="{
        tag: 'ul',
        type: 'transition-group',
        name: !drag ? 'flip-list' : 'fade',
      }"
      filter=".ignore"
      style="list-style-type: none"
      tag="transition-group"
      v-bind="dragOptions"
      @end="drag = false"
      @start="drag = true"
      @update:modelValue="
        $emit('update:modelValue', list);
        $nextTick(() => {
          $emit('change', list);
        });
      "
    >
      <template v-slot:item="{ element }">
        <li
          :key="isString(element) ? element : JSON.stringify(element)"
          :class="{
            'bg-dark': dark && !transparent,
            'bg-white': !dark && !transparent,
            disabled: disabled,
          }"
          class="p-2 row-hover usn cursor-move"
        >
          <div class="d-flex align-center mnh">
            <v-icon v-if="itemIcon" class="me-1">
              {{ itemIcon(element) }}
            </v-icon>
            <v-img
              v-if="itemImage && itemImage(element)"
              :src="itemImage(element)"
              class="me-1 flex-grow-0"
              height="24"
              width="24"
            >
            </v-img>

            <b
              class="text-capitalize flex-grow-1 me-2 ms-2"
              v-text="itemLabel ? itemLabel(element) : element"
            ></b>

            <span class="me-2">
              <s-smart-menu
                v-if="itemMenu"
                :items="itemMenu"
                :return-click-value="element"
              ></s-smart-menu
            ></span>

            <v-icon> menu</v-icon>
          </div>
        </li>
      </template>
    </draggable>

    <div
      v-if="hasAdd"
      key="_add"
      :class="{
        'bg-dark': dark,
        'bg-white': !dark,
        disabled: disabled,
        'rounded-xl my-2': rounded,
      }"
      class="p-2 pp row-hover usn ignore d-flex align-center justify-center"
      style="min-height: 70px"
      @click="$emit('click:add')"
    >
      <div>
        <v-icon class="me-1"> add_box</v-icon>

        <b class="text-capitalize me-2 ms-2">
          {{ $t("global.actions.add") }}
        </b>
      </div>
    </div>

    <slot name="append-inner"></slot>
  </div>
</template>

<script>
import draggable from "vuedraggable";
import SSmartMenu from "./SSmartMenu.vue";

export default {
  name: "SSmartDraggableList",
  components: { SSmartMenu, draggable },
  emits: ["update:modelValue", "change", "click:add"],
  props: {
    modelValue: {},
    itemLabel: { type: Function },
    itemIcon: { type: Function },
    itemImage: { type: Function },
    itemMenu: { type: Array },

    disabled: {
      default: false,
      type: Boolean,
    },
    dark: {
      default: false,
      type: Boolean,
    },
    transparent:Boolean,
    label: {},
    hint: {},

    hasAdd: {
      default: false,
      type: Boolean,
    },
    rounded: Boolean,
    borderBetween: Boolean,
  },

  data: () => ({
    drag: false,
    index: 0,
    list: [],
  }),

  computed: {
    dragOptions() {
      return {
        animation: 200,
        group: "description",
        disabled: false,
        ghostClass: "ghost",
      };
    },
  },

  watch: {
    modelValue() {
      this.list = this.modelValue;
    },
  },

  created() {
    this.list = this.modelValue;
  },
  methods: {
    deleteItem(index) {
      this.list.splice(index, 1);
      this.$emit("update:modelValue", this.list);
    },
  },
};
</script>

<style lang="scss" scoped>
.mnh {
  min-height: 40px;
}
</style>
