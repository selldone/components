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
  <draggable
    v-model="list"
    :component-data="{
      tag: 'ul',
      type: 'transition-group',
      name: !drag ? 'flip-list' : 'fade',
    }"
    class="list-group list-group-flush"
    style="list-style-type: none"
    tag="transition-group"
    v-bind="dragOptions"
    @end="drag = false"
    @start="drag = true"
    @update:modelValue="$emit('update:modelValue', list)"
  >
    <template v-slot:item="{ element }">
      <li
        :key="item"
        :style="{ 'background-image': `url('${element}')` }"
        class="list-group-item"
      >
        <v-btn
          class="delete-button"
          icon
          size="small"
          variant="text"
          @click.stop="deleteItem(index)"
        >
          <v-icon color="red"> close</v-icon>
        </v-btn>
      </li>
    </template>

    <template v-slot:footer>
      <div class="py-2">
        <v-btn
          v-if="hasAdd"
          rounded
          variant="flat"
          @click.stop="$emit('add-click')"
        >
          <v-icon>add</v-icon>
          Add
        </v-btn>
      </div>
    </template>
  </draggable>
</template>

<script lang="ts">
import { defineAsyncComponent } from "vue";

export default {
  name: "draggableImagesList",
  components: { draggable: defineAsyncComponent(() => import("vuedraggable")) },
  emits: ["update:modelValue", "add-click"],
  props: {
    modelValue: {},
    hasAdd: {
      default: true,
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
.flip-list-move {
  transition: transform 0.5s;
}

.no-move {
  transition: transform 0s;
}

.ghost {
  opacity: 0.5;
  background: #c8ebfb;
}

.list-group {
  min-height: 32px;
  //background-color: #fafafa;
  border-radius: 16px;
  padding: 18px 8px;
  margin: 0;

  .list-group-item {
    cursor: move;
    background: #fff;
    background-position: center;
    height: 64px;
    position: relative;
    display: block;
    padding: 0.4em 0.2em 0.4em 2em;
    margin: 0.5em 12px;
    color: #444;
    text-decoration: none;
    -moz-border-radius: 0.3em;
    -webkit-border-radius: 0.3em;
    border-radius: 2em;
    border: #fff solid;

    &::before {
      content: "⇅";
      position: absolute;
      left: -1em;
      top: 50%;
      margin-top: -1em;
      background: -webkit-gradient(
        linear,
        left top,
        right bottom,
        from(#0097a7),
        to(#0288d1)
      );
      background: linear-gradient(to right bottom, #0097a7, #0288d1);
      height: 2em;
      width: 2em;
      line-height: 1.4em;
      border: 0.3em solid #fff;
      text-align: center;
      font-weight: bold;
      -moz-border-radius: 2em;
      -webkit-border-radius: 2em;
      border-radius: 2em;
      color: #fff;
    }

    transition: all 0.5s !important;

    &:hover {
      transform: translateY(-2px);
      background-color: #fff !important;
      z-index: 3;
    }

    .delete-button {
      position: absolute;
      right: 8px;
      top: 50%;
      transform: translate(0, -50%);
      margin: 0;
      background-color: #fff;
    }
  }
}

.for-rtl {
  .list-group {
    .list-group-item {
      .delete-button {
        left: 8px;
        right: unset;
      }
    }
  }
}
</style>
