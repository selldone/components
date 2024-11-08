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
    handle=".handle"
    style="list-style-type: none"
    tag="div"
    v-bind="dragOptions"
    @end="drag = false"
    @start="drag = true"
    @update:modelValue="$emit('update:modelValue', list)"
  >
    <template v-slot:item="{ element, index }">
      <li class="list-group-item bg-transparent">
        <v-text-field
          v-if="editable"
          v-model="element.title"
          flat
          hide-details
          placeholder="Write task title here..."
          label="Task Title"
          variant="solo-filled"
          persistent-placeholder
        >
          <template v-slot:prepend>
            <v-icon
              :style="{ cursor: editable ? 'move' : undefined }"
              class="handle"
            >
              unfold_more
            </v-icon>
          </template>

          <template v-slot:append-inner>
            <v-btn
              variant="text"
              icon
              title="Delete item"
              @click="deleteItem(index)"
              @click.stop
            >
              <v-icon color="red"> close</v-icon>
            </v-btn>
          </template>
        </v-text-field>

        <p v-else class="task-title" v-text="element.title"></p>
        <v-progress-linear
          v-model="element.progress"
          clickable
          :class="{ 'pointer-event-none': viewOnlyProgress }"
          :reverse="$vuetify.locale.isRtl"
          bg-color="#aaa"
          class="pointer-pointer my-2 border"
          color="primary"
          height="18"
          rounded
          striped
          @update:model-value="
            element.progress = Math.round(element.progress);
            $emit('change');
          "
        >
          <small v-if="viewOnlyProgress && editable">
            <v-icon class="me-1" size="12">lock</v-icon>
            lock
          </small>
        </v-progress-linear>
      </li>
    </template>

    <template v-slot:footer>
      <div v-if="editable" class="widget-buttons">
        <v-btn size="x-large" variant="flat" color="#000" @click="addItem">
          <v-icon start>add</v-icon>
          <div>
            {{ $t("global.actions.add") }}
            <div class="small mt-1">Create new item for todo list</div>
          </div>
        </v-btn>
      </div>
    </template>
  </draggable>
</template>

<script lang="ts">
import { defineAsyncComponent } from "vue";

export default {
  name: "UTasksEditor",
  components: { draggable: defineAsyncComponent(() => import("vuedraggable")) },
  props: {
    modelValue: {},
    editable: {
      default: false,
      type: Boolean,
    },
    viewOnlyProgress: {
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
    modelValue() {
      this.list = this.modelValue;
    },
  },

  created() {
    this.list =
      this.modelValue && Array.isArray(this.modelValue) ? this.modelValue : [];
  },
  methods: {
    deleteItem(index) {
      this.list.splice(index, 1);
      this.$emit("update:modelValue", this.list);
      this.$emit("change");
    },
    addItem() {
      this.list.push({ title: "", progress: 0 });
      this.$emit("update:modelValue", this.list);
      this.$emit("change");
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

.list-group-item {
  padding: 6px;
  position: relative;
  list-style: none;
  border: none;

  .task-title {
    font-weight: 700;
    font-size: 1rem;
    //line-height: 2rem;
    text-align: start;
  }
}
</style>
