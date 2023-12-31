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

<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
  <div class="s--product-spec">
    <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Edit Mode ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

    <template v-if="editable">
      <s-smart-toggle
        v-model="auto_save"
        :true-title="$t('spec_view.auto_save_input')"
        color="green"
      ></s-smart-toggle>

      <draggable
        :value="spec"
        :press-delay="150"
        @input="
          (list) => {
            if (auto_save) $emit('save', list);
            else $emit('update', list);
          }
        "
        v-bind="dragOptions"
        tag="div"
        @start="drag = true"
        @end="drag = false"
        :class="{ 'border-between-vertical': editable }"
      >
        <div v-for="(item, index) in spec" :key="index">
          <sortable-item
            v-if="item"
            :item="item"
            :editable="editable"
            @delete="$emit('click-delete', index)"
            :minimize="drag"
            :class="{
              '-border': !(
                index >= spec.length - 1 ||
                spec[index].group /*It's group!*/ ||
                spec[index + 1].group
              ) /*NExt is group so it's last item!*/,
            }"
          />

          <p v-if="!item" class="bg-danger p-3 text--white">
            Error! item is null!
          </p>
        </div>
      </draggable>
    </template>

    <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ View Mode ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

    <v-container v-else fluid>
      <v-row>
        <v-col
          cols="12"
          md="6"
          v-for="(item, index) in spec_grouped"
          :key="'g' + index"
        >
          <sortable-item
            v-if="item.group"
            :item="item.group"
            @update:collapse="collapses.toggle(index)"
            :collapse="collapses.includes(index)"
          />
          <v-expand-transition>
            <div class="-list-items" v-if="!collapses.includes(index)">
              <sortable-item
                v-for="(item, j) in item.items"
                :key="j"
                :item="item"
                dense-values
              />
            </div>
          </v-expand-transition>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import SortableItem from "./SortableItem.vue";

import SSmartToggle from "@components/smart/SSmartToggle.vue";
import draggable from "vuedraggable";

export default {
  name: "ProductSpecView",
  components: {
    SSmartToggle,
    SortableItem,
    draggable,
  },
  event: "click-delete",
  props: {
    spec: {
      required: true,
      type: Array,
    },
    editable: {
      required: false,
      type: Boolean,
      default: false,
    },
  },
  data: () => ({
    auto_save: true,
    drag: false,

    collapses: [],
  }),

  computed: {
    dragOptions() {
      return {
        animation: 200,
        //   group: "description",
        disabled: !this.editable,
        ghostClass: "ghost",
      };
    },

    spec_grouped() {
      if (!this.spec?.length) return [];
      let out = [];

      let group = { group: null, items: [] };

      if (!this.spec[0].group) {
        out.push(group);
      }

      this.spec.forEach((it) => {
        if (!it) return;

        if (it.group) {
          group = { group: it, items: [] };
          out.push(group);
        } else {
          group.items.push(it);
        }
      });

      if (out.length === 1 && !out.some((x) => x.group)) {
        // No grouping! So split to two group.
        const items = out[0].items;

        const break_index = Math.floor(items.length / 2);
        if (break_index >= 3) {
          // At least 10x items!
          const items_1 = items.slice(0, break_index);
          const items_2 = items.slice(break_index + 1);
          out = [
            { group: null, items: items_1 },
            { group: null, items: items_2 },
          ];
        }
      }

      return out;
    },
  },

  watch: {
    spec() {
      this.collapses = [];
    },
  },
  created() {},

  methods: {},
};
</script>

<style lang="scss">
.s--product-spec {
  .list-item {
    // Change default items style
    border-radius: 0;
    background: none;
  }
  .-border {
    border-bottom: solid thin #ccc;
  }

  .-list-items {
    > :not(:last-child) {
      border-bottom: solid 1px #ccc;
    }
  }
}
</style>
