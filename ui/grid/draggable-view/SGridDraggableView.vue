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
  <div :id="id" class="s--grid-view" v-bind="$attrs">
    <slot></slot>
  </div>
</template>

<script lang="ts">
import Muuri from "muuri";

let self = null;
export default {
  name: "SGridDraggableView",
  data() {
    return {
      grid: null,
    };
  },
  props: {
    id: {
      type: String,
      default: "grid",
    },
    options: {
      type: Object,
      default() {
        return {
          items: ".item-grid",
          dragEnabled: true,

          layout: {
            fillGaps: true,
            rounding: false,
          },

          dragStartPredicate: function (item, event) {
            let element = event.target;
            let foundNoDrag = false;

            while (
              element &&
              element !== document &&
              !element.classList.contains("item-grid")
            ) {
              if (element.matches(".no-drag")) {
                foundNoDrag = true;
                break;
              }
              element = element.parentElement;
            }
            // console.log("isNoDrag", foundNoDrag, event.target);

            // If a .no-drag-initiator was found and we didn't reach an .item-grid element, prevent dragging
            return !foundNoDrag;
          },
        };
      },
    },
  },
  watch: {
    options: function (oldOptions, newOptions) {
      Object.keys(newOptions).forEach(function (key) {
        if (this.grid._settings[key] != null)
          this.grid._settings = newOptions[key];
      });
    },
  },
  created() {
    self = this;
  },
  mounted() {
    this.createGrid();
    this.eventListening();
  },
  methods: {
    remove(item_dom) {
      //console.log('remove',item_dom);
      this.grid.remove(item_dom);
    },
    add(item_dom, options = undefined) {
      //console.log('add',item_dom);
      this.grid.add(item_dom, options);
    },
    refresh() {
      //console.log('refresh');
      this.grid.refreshSortData();
    },
    layout() {
      this.grid.layout();
    },
    getItems(val) {
      return this.grid.getItems(val);
    },

    createGrid() {
      this.grid = new Muuri("#" + this.id, this.options);
      self.$emit("gridCreated", this.grid);
    },
    eventListening() {
      this.grid.on("synchronize", function () {
        self.$emit("synchronize");
      });
      this.grid.on("layoutStart", function (items) {
        self.$emit("layoutStart", items);
      });
      this.grid.on("layoutEnd", function (items) {
        self.$emit("layoutEnd", items);
      });
      this.grid.on("add", function (items) {
        self.$emit("add", items);
      });
      this.grid.on("remove", function (indices) {
        self.$emit("remove", indices);
      });
      this.grid.on("showStart", function (items) {
        self.$emit("showStart", items);
      });
      this.grid.on("showEnd", function (items) {
        self.$emit("showEnd", items);
      });
      this.grid.on("hideStart", function (items) {
        self.$emit("hideStart", items);
      });
      this.grid.on("hideEnd", function (items) {
        self.$emit("hideEnd", items);
      });
      this.grid.on("filter", function (shownItems, hiddenItems) {
        self.$emit("filter", shownItems, hiddenItems);
      });
      this.grid.on("sort", function (currentOrder, previousOrder) {
        self.$emit("sort", currentOrder, previousOrder);
      });
      this.grid.on("move", function (data) {
        self.$emit("move", data);
      });
      this.grid.on("send", function (data) {
        self.$emit("send", data);
      });
      this.grid.on("beforeSend", function (data) {
        self.$emit("beforeSend", data);
      });
      this.grid.on("receive", function (data) {
        self.$emit("receive", data);
      });
      this.grid.on("beforeReceive", function (data) {
        self.$emit("beforeReceive", data);
      }),
        this.grid.on("dragInit", function (item, event) {
          self.$emit("dragInit", item, event);
        }),
        this.grid.on("dragStart", function (item, event) {
          self.$emit("dragStart", item, event);
        });
      this.grid.on("dragMove", function (item, event) {
        self.$emit("dragMove", item, event);
      });
      this.grid.on("dragScroll", function (item, event) {
        self.$emit("dragScroll", item, event);
      });
      this.grid.on("dragEnd", function (item, event) {
        self.$emit("dragEnd", item, event);
      });
      this.grid.on("dragReleaseStart", function (item) {
        self.$emit("dragReleaseStart", item);
      });
      this.grid.on("dragReleaseEnd", function (item) {
        self.$emit("dragReleaseEnd", item);
      });
      this.grid.on("destroy", function () {
        self.$emit("destroy");
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.s--grid-view {
  position: relative;
  display: block;

  .muuri-item-dragging {
    z-index: 3;

    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2) !important;
    border: 1px solid white;
  }

  .muuri-releasing {
    z-index: 2;
  }

  .muuri-hidden {
    z-index: 0;
  }

  .item-content {
    position: relative;
    width: 100%;
    height: 100%;
  }
}
</style>
