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
    tag="ul"
    v-bind="dragOptions"
    @start="drag = true"
    @end="drag = false"
    @change="$emit('input', list)"
    handle=".handle"
  >
    <transition-group type="transition" name="flip-list">
      <li v-for="(item, index) in list" :key="index" class="list-group-item bg-transparent">
        <v-text-field
          v-if="editable"
          v-model="item.title"
          class="task-title"
          placeholder="Task title..."
          single-line
          flat
          solo
          hide-details
        >
          <template v-slot:prepend>
            <v-icon class="handle"  :style="{cursor:editable?'move':undefined}"> unfold_more </v-icon>
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

        <p v-else v-text="item.title" class="task-title"></p>

        <v-progress-linear
          v-model="item.progress"
          @change="item.progress=Math.round(item.progress);$emit('change')"
          height="18"
          color="blue"
          rounded
          striped
          background-color="#eee"
          class="pointer-pointer my-2"
          :reverse="$vuetify.rtl"
          :class="{'pointer-event-none':viewOnlyProgress}"

        >
        </v-progress-linear>
      </li>
    </transition-group>


    <template v-slot:bottom>
      <div  v-if="editable" class="widget-buttons" >
        <v-btn

            @click="addItem"
            x-large
            outlined
        >
          <v-icon class="me-1">add</v-icon>
          {{$t('global.actions.add')}}
        </v-btn>
      </div>
    </template>


  </draggable>
</template>

<script>
import draggable from "vuedraggable";

export default {
  name: "ExpertContractTasks",
  components: {  draggable },
  props: {
    value: {},
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
    value() {
      this.list = this.value;
    },
  },

  created() {
    this.list = this.value && Array.isArray(this.value)?this.value:[];
  },
  methods: {
    deleteItem(index) {
      this.list.splice(index, 1);
      this.$emit("input", this.list);
      this.$emit('change')
    },
    addItem() {
      this.list.push({ title: "", progress: 0 });
      this.$emit("input", this.list);
      this.$emit('change')

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
