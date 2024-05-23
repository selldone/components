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
  <u-drop id="drop_area" class="pins-list" @drop="onDrop">
    <u-drag
      v-for="(item, key) in items"
      :key="key + '-' + item.id"
      :class="{ '-drag': editable }"
      :draggable="editable"
      :style="{
        left: item.x + '%',
        top: item.y + '%',
        'animation-delay': 50 + key * 100 + 'ms',
      }"
      :transfer-data="item.id"
      class="-pin zoomIn"
    >
      <v-avatar
        :class="{
          pp: !editable,
          'big-scale': true,
          '-cat': item.id.startsWith('c-'),
        }"
        :color="item.id.startsWith('c-') ? 'amber' : '#ffffffbb'"
        :size="size"
        class="citm"
        @click.stop="
          item.id.startsWith('c-')
            ? $emit('click:category', item.id.replace('c-', ''))
            : $emit('click:product', item.id)
        "
      >
        <img
          v-if="item.id.startsWith('c-')"
          :src="getCategoryIcon(item.id.replace('c-', ''), IMAGE_SIZE_SMALL)"
        />
        <img v-else :src="getProductImage(item.id, IMAGE_SIZE_SMALL)" />
      </v-avatar>
    </u-drag>
  </u-drop>
</template>

<script>
import UDrop from "../../../ui/drag/core/UDrop.vue";
import UDrag from "../../../ui/drag/core/UDrag.vue";

export default {
  name: "UDragPin",
  components: { UDrag, UDrop },
  emits: [
    "click:product",
    "click:category",
    "click:add",
    "change",
    "update:tags",
  ],
  props: {
    modelValue: {},
    initialX: {
      // Percent
      default: 0,
    },
    initialY: {
      // Percent
      default: 0,
    },
    bigScale: {
      type: Boolean,
      default: false,
    },
    editable: {
      default: false,
      type: Boolean,
    },
  },
  data: () => ({
    items: [
      // { id: "1", x: 0, y: 0 },
      // { id: "c-4", x: 10, y: 15 },
    ],
  }),
  computed: {
    size() {
      return this.$vuetify.display.xs ? 56 : 72;
    },
  },
  watch: {
    "modelValue.list"() {
      this.refreshData();
    },
  },
  created() {
    this.refreshData();
  },

  methods: {
    refreshData() {
      //console.log("Pins: refresh data");

      if (this.modelValue && this.modelValue.list) {
        this.items = [];
        let i = 0;
        Object.keys(this.modelValue.list).forEach((id) => {
          const pre_tag =
            this.modelValue.tags &&
            this.modelValue.tags.find((it) => it.id === id);

          this.items.push({
            id: id,
            x: pre_tag ? pre_tag.x : i * 2 + this.initialX,
            y: pre_tag ? pre_tag.y : this.initialY,
          });
          i++;
        });
        this.modelValue.tags = this.items;
        this.$emit("update:modelValue", this.modelValue);
      }
    },

    onDrop(transferData, e) {
      // console.log("onDrop", transferData, e);
      if (e?.target?.id !== "drop_area") return; // Prevent drop on itself!
      const item = this.items.find((it) => it.id === transferData);
      if (item) {
        const width = e.target.clientWidth;
        const height = e.target.clientHeight;

        item.x = Math.round(((e.layerX - this.size / 2) * 100) / width);
        item.y = Math.round(((e.layerY - this.size / 2) * 100) / height);
      }
      this.$emit("change");
      this.$emit("update:tags", this.items);
    },
  },
};
</script>

<style lang="scss" scoped>
.pins-list {
  z-index: 1;
  width: 100%;
  height: 100%;

  .-pin {
    position: absolute;
  }

  .-drag {
    .citm {
      cursor: move !important;
    }
  }

  .citm {
    transition: all 0.5s;
    background-image: linear-gradient(to right, #4facfe 0%, #00f2fe 100%);

    &.-cat {
      background-image: linear-gradient(120deg, #f6d365 0%, #fda085 100%);
    }

    &:after {
      position: absolute;
      left: 3px;
      right: 3px;
      top: 3px;
      bottom: 3px;
      content: " ";
      background-color: #fff;
      border-radius: 50%;
    }

    &:hover {
      transform: scale(1.5);

      &.big-scale {
        transform: scale(2.2);
      }
    }

    img {
      padding: 3px;
      position: relative;
      z-index: 1;
    }
  }
}
</style>
