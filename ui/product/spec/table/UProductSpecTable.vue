<!--
  - Copyright (c) 2023-2024. Selldone® Business OS™
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
  <div class="u--product-spec-table">
    <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Edit Mode ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

    <template v-if="editable">
      <u-smart-toggle
        v-model="auto_save"
        :true-title="$t('spec_view.auto_save_input')"
        color="green"
        :true-description="$t('spec_view.auto_save_input_message')"
        false-gray
      ></u-smart-toggle>

      <draggable
        :class="{ 'border-between-vertical': editable }"
        :component-data="{
          tag: 'ul',
          type: 'transition-group',
          name: drag ? 'fade' : undefined,
        }"
        :model-value="spec"
        :press-delay="150"
        style="list-style-type: none"
        tag="transition-group"
        v-bind="dragOptions"
        @end="drag = false"
        @start="drag = true"
        @update:modelValue="
          (list) => {
            $emit('update', list);
            if (auto_save) $emit('save', list);
          }
        "
      >
        <template v-slot:item="{ element, index }">
          <b-product-spec-row
            v-if="element"
            :class="{
              '-border': !(
                index >= spec.length - 1 ||
                element.group /*It's group!*/ ||
                spec[index + 1].group
              ) /*Next is group so it's last item!*/,
            }"
            :editable="editable"
            :item="element"
            :minimize="drag"
            @delete="
              () => {
                $emit('click-delete', element);
                if (auto_save) $emit('save', list);
              }
            "
          />
        </template>
      </draggable>
    </template>

    <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ View Mode ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

    <v-container v-else fluid>
      <v-row no-gutters>
        <v-col
          v-for="(item, index) in spec_grouped"
          :key="'g' + index"
          cols="12"
          md="6"
        >
          <b-product-spec-row
            v-if="item.group"
            :collapse="collapses.includes(index)"
            :item="item.group"
            @update:collapse="collapses.toggle(index)"
          />
          <v-expand-transition>
            <div v-if="!collapses.includes(index)" class="-list-items">
              <b-product-spec-row
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

<script lang="ts">
import BProductSpecRow from "../../../../storefront/product/spec/BProductSpecRow.vue";

import USmartToggle from "../../../smart/toggle/USmartToggle.vue";
import { defineAsyncComponent } from "vue";

export default {
  name: "UProductSpecTable",
  components: {
    USmartToggle,
    BProductSpecRow,
    draggable: defineAsyncComponent(() => import("vuedraggable")),
  },

  emits: ["update", "save", "click-delete"],
  props: {
    autoSave: Boolean,
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
    auto_save(val) {
      this.$emit("autoSave", val);
    },
  },
  created() {
    this.auto_save = this.autoSave;
  },

  methods: {},
};
</script>

<style lang="scss">
.u--product-spec-table {
  font-size: 13px;

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
