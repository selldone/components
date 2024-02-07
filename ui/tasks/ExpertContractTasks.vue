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
    @start="drag = true"
    @end="drag = false"
    @update:modelValue="$emit('update:modelValue', list)"
    handle=".handle"
    tag="transition-group"
    :component-data="{
      tag: 'ul',
      type: 'transition-group',
      name: !drag ? 'flip-list' : 'fade',
    }"
    v-bind="dragOptions"
    style="list-style-type: none"
  >
    <template v-slot:item="{ element }">
      <li class="list-group-item bg-transparent">
        <v-text-field
          v-if="editable"
          v-model="element.title"
          class="task-title"
          placeholder="Task title..."
          single-line
          flat
          variant="solo"
          hide-details
        >
          <template v-slot:prepend>
            <v-icon
              class="handle"
              :style="{ cursor: editable ? 'move' : undefined }"
            >
              unfold_more
            </v-icon>
          </template>

          <template v-slot:append>
            <v-btn
              icon
              @click="deleteItem(index)"
              @click.stop
              title="Delete item"
            >
              <v-icon color="red"> close </v-icon>
            </v-btn>
          </template>
        </v-text-field>

        <p v-else v-text="element.title" class="task-title"></p>

        <v-progress-linear
          v-model="element.progress"
          @update:model-value="
            element.progress = Math.round(element.progress);
            $emit('change');
          "
          height="18"
          color="blue"
          rounded
          striped
          bg-color="#eee"
          class="pointer-pointer my-2"
          :reverse="$vuetify.rtl"
          :class="{ 'pointer-event-none': viewOnlyProgress }"
        >
        </v-progress-linear>
      </li>
    </template>

    <template v-slot:footer>
      <div v-if="editable" class="widget-buttons">
        <v-btn @click="addItem" size="x-large" variant="outlined">
          <v-icon class="me-1">add</v-icon>
          {{ $t("global.actions.add") }}
        </v-btn>
      </div>
    </template>
  </draggable>
</template>

<script>
import draggable from "vuedraggable";

export default {
  name: "ExpertContractTasks",
  components: { draggable },
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
    this.list = this.modelValue && Array.isArray(this.modelValue) ? this.modelValue : [];
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

<style scoped lang="scss">
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
