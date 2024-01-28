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
      tag="div"
      v-bind="dragOptions"
      @start="drag = true"
      @end="drag = false"
      @change="
        $emit('input', list);
        $nextTick(() => {
          $emit('change', list);
        });
      "
      filter=".ignore"
    >
      <transition-group
        type="transition"
        :name="!drag ? 'flip-list' : null"
        class="border-between-vertical rounded-card"
      >
        <div
          v-for="item in list"
          :key="isString(item)?item:JSON.stringify(item)"
          class="p-2 row-hover usn cursor-move"
          :class="{ 'bg-dark': dark, 'bg-white': !dark, disabled: disabled }"
        >
          <div class="d-flex align-center mnh">
            <v-icon v-if="itemIcon" class="me-1"> {{ itemIcon(item) }} </v-icon>
            <v-img
              v-if="itemImage && itemImage(item)"
              width="24"
              height="24"
              class="me-1 flex-grow-0"
              :src="itemImage(item)"
            >
            </v-img>

            <b
              class="text-capitalize flex-grow-1 me-2 ms-2"
              v-text="itemLabel ? itemLabel(item) : item"
            ></b>

            <span class="me-2">
              <s-smart-menu
                v-if="itemMenu"
                :items="itemMenu"
                :return-click-value="item"
              ></s-smart-menu
            ></span>

            <v-icon> menu </v-icon>
          </div>
        </div>

        <div
          v-if="hasAdd"
          key="_add"
          class="p-2 pp row-hover usn ignore"
          :class="{ 'bg-dark': dark, 'bg-white': !dark, disabled: disabled }"
          @click="$emit('click:add')"
        >
          <div class="d-flex align-center mnh justify-center">
            <v-icon class="me-1"> add_box </v-icon>

            <b class="text-capitalize me-2 ms-2">
              {{ $t("global.actions.add") }}
            </b>
          </div>
        </div>

        <slot name="append-inner"></slot>
      </transition-group>
    </draggable>
  </div>
</template>

<script>
import draggable from "vuedraggable";
import SSmartMenu from "./SSmartMenu.vue";
export default {
  name: "SSmartDraggableList",
  components: { SSmartMenu, draggable },
  props: {
    value: {},
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

    label: {},
    hint: {},

    hasAdd: {
      default: false,
      type: Boolean,
    },
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
    value() {
      this.list = this.value;
    },
  },

  created() {
    this.list = this.value;
  },
  methods: {
    deleteItem(index) {
      this.list.splice(index, 1);
      this.$emit("input", this.list);
    },
  },
};

</script>

<style scoped lang="scss">
.mnh {
  min-height: 40px;
}
</style>
