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
  <div class="rounded-lg overflow-hidden" style="border: solid thin #ddd">
    <v-sheet v-if="hasDelete" class="text-end mb-2 pa-1" color="#ddd">
      <v-btn
        class="ma-1"
        color="#000"
        size="x-small"
        variant="plain"
        @click="$emit('click:delete')"
      >
        <v-icon start>delete</v-icon>
        {{ $t("global.actions.delete") }}
      </v-btn>
    </v-sheet>
    <draggable
      :class="{ '-flat': flat }"
      :model-value="list"
      class="list-group list-group-flush py-0"
      style="list-style-type: none"
      tag="div"
      v-bind="dragOptions"
      @end="drag = false"
      @start="drag = true"
      @update:model-value="(val) => $emit('update:modelValue', val)"
    >
      <template v-slot:item="{ element, index }">
        <li :key="index" class="list-group-item d-flex align-center">
          <v-tooltip
            v-if="element.to"
            color="black"
            location="bottom"
            content-class="text-start bg-black"
          >
            <template v-slot:activator="{ props }">
              <v-avatar v-if="element.image" :image="getShopImagePath(element.image,128)" size="20" class="float-right ma-2" v-bind="props"> </v-avatar>
              <v-icon v-else class="float-right ma-2" size="small" v-bind="props"
                >info_outline
              </v-icon>
            </template>
            <b class="mb-1">{{ element.to.name }}</b>
            <div
              v-if="element.to.params && element.to.params.page_name"
              class="small"
            >
              <b>Page:</b> {{ element.to.params.page_name }}
            </div>
          </v-tooltip>

          <v-tooltip
            v-if="element.href"
            color="black"
            location="bottom"
            content-class="text-start bg-black"
          >
            <template v-slot:activator="{ props }">
              <v-icon class="float-right m-2" size="small" v-bind="props"
                >link
              </v-icon>
            </template>
            <b class="mb-1">External Link | {{ element.name }}</b>
            <div class="small"> {{ element.href }}</div>
            <div v-if="element.target" class="small"><b>Target:</b> {{ element.target }}</div>
          </v-tooltip>

          <span
            class="editable-span"
            contenteditable="true"
            @blur="(e) => (element.name = e.target.innerText)"
            v-text="element.name"
          ></span>

          <v-btn
            icon
            title="Delete item"
            variant="text"
            @click="deleteItem(index)"
            @click.stop
          >
            <v-icon color="red"> close</v-icon>
          </v-btn>
        </li>
      </template>

      <template v-slot:footer>
        <div class="py-2">
          <v-btn
            v-if="hasAdd"
            min-height="36px"
            width="100%"
            @click="$emit('add-click')"
            color="#000"
            variant="plain"
          >
            <v-icon start>add_box</v-icon>
            {{ $t("global.actions.add") }}
          </v-btn>
        </div>
      </template>
    </draggable>
  </div>
</template>

<script>
import draggable from "vuedraggable";

export default {
  name: "DraggableMenu",
  components: { draggable },
  emits: ["update:modelValue", "add-click", "click:delete"],
  props: {
    modelValue: {},
    hasAdd: {
      default: true,
      type: Boolean,
    },
    hasDelete: {
      default: false,
      type: Boolean,
    },
    flat: {
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
.list-group {
  min-height: 32px;
  background-color: #fafafa;
  border-radius: 16px;
  padding: 18px 8px;

  &.-flat {
    background-color: unset;

    .list-group-item {
      border: none !important;
      border-radius: 8px;
      margin-bottom: 4px;
    }
  }
}

.list-group-item {
  text-align: center;
  cursor: move;
  padding: 4px;
  position: relative;
  list-style: none;

  .delete-button {
    position: absolute;
    left: 8px;
    top: 50%;
    transform: translate(0, -50%);
    margin: 0;
  }
}

.editable-span {
  cursor: text;
  display: inline-block;
  flex-grow: 1;
  min-height: 29px;
  min-width: 80px;
  padding: 4px 8px;

  &:hover {
    background: #00a89a;
    color: white;
  }
}
</style>
