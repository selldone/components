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
  <div
    v-bind="$attrs"
    class="rounded-lg overflow-hidden"
    style="border: solid thin #ddd"
  >
    <v-sheet v-if="hasDelete" class="text-end pa-1" color="#ddd">
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
      class="list-group list-group-flush py-0 mt-2"
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
              <v-avatar
                v-if="element.image"
                :image="getShopImagePath(element.image, 128)"
                size="20"
                class="float-right ma-2"
                v-bind="props"
              ></v-avatar>
              <v-icon
                v-else
                class="float-right ma-2"
                size="small"
                v-bind="props"
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
              <v-icon
                class="float-right m-2"
                size="small"
                v-bind="props"
                @click="showEditLink(element)"
                >link
              </v-icon>
            </template>
            <b class="mb-1">External Link | {{ element.name }}</b>
            <div class="small">{{ element.href }}</div>
            <div v-if="element.target" class="small">
              <b>Target:</b> {{ element.target }}
            </div>
            <br />
            <i>Click to edit more...</i>
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

  <v-bottom-sheet
    v-model="link_dialog"
    content-class="rounded-t-xl"
    max-width="640"
    width="98vw"
  >
    <v-card v-if="selected_item" class="text-start" rounded="t-xl">
      <v-card-title>
        <v-icon class="me-1">link</v-icon>
        {{ $t("global.commons.edit") }}
      </v-card-title>
      <v-card-text>
        <v-text-field
          v-model="selected_item.name"
          :label="$t('global.commons.label')"
          variant="outlined"
        >
        </v-text-field>

        <v-text-field
          v-model="selected_item.href"
          :label="$t('global.commons.link')"
          variant="outlined"
        >
        </v-text-field>

        <u-smart-select
          v-model="selected_item.target"
          :items="[
            { value: '_blank', text: 'Open In New Page', icon: 'open_in_new' },
          ]"
          item-value="value"
          item-text="text"
          item-icon="icon"
          force-show-all
          border
          color="#000"
          clearable
        >
        </u-smart-select>
      </v-card-text>
      <v-card-actions>
        <div class="widget-buttons">
          <v-btn
            size="x-large"
            variant="text"
            @click="link_dialog = false"
            prepend-icon="close"
          >
            {{ $t("global.actions.close") }}
          </v-btn>
        </div>
      </v-card-actions>
    </v-card>
  </v-bottom-sheet>
</template>

<script lang="ts">
import { defineAsyncComponent } from "vue";
import USmartSelect from "@selldone/components-vue/ui/smart/select/USmartSelect.vue";

export default {
  name: "DraggableMenu",
  components: {
    USmartSelect,
    draggable: defineAsyncComponent(() => import("vuedraggable")),
  },
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
    link_dialog: false,
    selected_item: null,
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

    showEditLink(item) {
      this.selected_item = item;
      this.link_dialog = true;
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
