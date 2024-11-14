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
  <v-row
    :class="[
      quantity || forceEnable ? '' : 'disabled',
      selected ? 'selected' : '',
      bordered ? '-bordered' : '',
    ]"
    :style="{ '--theme-dark': activeColor ? activeColor : ThemeColorDark }"
    class="product-variant-card-mini"
    no-gutters
    @click="$emit('select')"
  >
    <div v-if="color" class="--item pa-1 text-nowrap">
      <v-icon :color="icon_color" class="me-1" size="small"> palette</v-icon>

      <u-color-circle :color="color" :size="16" class="me-1"></u-color-circle>

      <span class="small mx-1">{{ coloName }}</span>
    </div>

    <div v-if="volume" class="--item pa-1 text-nowrap">
      <v-icon :color="icon_color" class="me-1" size="small"> equalizer</v-icon>

      <span class="card-badge-info">
        {{ volume.removeVariantAsset() }}

        <u-variant-asset-image
          :size="24"
          :value="volume"
        ></u-variant-asset-image>
      </span>
    </div>

    <div v-if="pack" class="--item pa-1 text-nowrap">
      <v-icon :color="icon_color" class="me-1" size="small"> all_inbox</v-icon>

      <span class="card-badge-info">
        {{ pack.removeVariantAsset() }}
        <u-variant-asset-image :size="24" :value="pack"></u-variant-asset-image>
        <span class="text-muted">x</span>
      </span>
    </div>

    <div v-if="weight" class="--item pa-1 text-nowrap">
      <v-icon :color="icon_color" class="me-1" size="small">
        fa:fas fa-weight-hanging
      </v-icon>

      <span class="card-badge-info">
        {{ weight.removeVariantAsset() }}
        <u-variant-asset-image
          :size="24"
          :value="weight"
        ></u-variant-asset-image>
      </span>
    </div>

    <div v-if="style" class="--item pa-1 text-nowrap">
      <v-icon :color="icon_color" class="me-1" size="small"> style</v-icon>

      <span class="card-badge-info">
        {{ style.removeVariantAsset() }}
        <u-variant-asset-image
          :size="24"
          :value="style"
        ></u-variant-asset-image>
      </span>
    </div>

    <div v-if="type" class="--item pa-1 text-nowrap">
      <v-icon :color="icon_color" class="me-1" size="small">
        fa:fas fa-toolbox
      </v-icon>
      <span class="card-badge-info">
        {{ type.removeVariantAsset() }}
        <u-variant-asset-image :size="24" :value="type"></u-variant-asset-image>
      </span>
    </div>

    <div v-if="has_ar" class="--item text-nowrap me-5 ms-2">
      <v-img
        :src="require('../../../assets/icons/3d.svg')"
        height="20"
        width="20"
      ></v-img>
    </div>
  </v-row>
</template>

<script lang="ts">
import UColorCircle from "../../../ui/color/circle/UColorCircle.vue";
import UVariantAssetImage from "../../../ui/variant/asset/image/UVariantAssetImage.vue";
import {GetNameOfColor} from "@selldone/core-js/helper/color/ColorHelper.ts";
import TemplateMixin from "@selldone/components-vue/mixin/template/TemplateMixin.ts";

export default {
  name: "VariantItemMini",
  mixins: [TemplateMixin],

  components: { UVariantAssetImage, UColorCircle },
  emits: ["select"],
  props: {
    productVariant: {
      required: true,
      type: Object,
    },
    selected: {
      required: false,
      type: Boolean,
      default: false,
    },
    forceEnable: {
      type: Boolean,
      default: false,
    },
    activeColor: {},
    bordered: { type: Boolean, default: false },
  },
  data() {
    return {
      dialog: false,
    };
  },
  computed: {
    coloName() {
      return GetNameOfColor(this.color);
    },

    icon_color() {
      return this.selected ? "#ddd" : "#777";
    },

    color() {
      return this.productVariant.color;
    },
    weight() {
      return this.productVariant.weight;
    },
    volume() {
      return this.productVariant.volume;
    },
    style() {
      return this.productVariant.style;
    },
    pack() {
      return this.productVariant.pack;
    },
    quantity() {
      return this.productVariant.quantity;
    },
    price() {
      return this.productVariant.price;
    },
    type() {
      return this.productVariant.type;
    },
    has_ar() {
      return this.productVariant.ar;
    },
  },
  methods: {},
};
</script>

<style lang="scss" scoped>
.product-variant-card-mini {
  //background: #fafafa;
  padding: 3px;
  border-radius: 18px;
  font-weight: 500;
  cursor: pointer;
  position: relative;
  min-height: 48px;

  .--item {
    display: flex;
    align-items: center;
  }

  &.disable {
    background: #ddd;
    opacity: 0.5;
  }

  &.selected {
    color: #fff;
    background: var(--theme-dark);

    .card-badge-info {
      color: white;
    }

    .text-muted {
      color: #ddd !important;
    }
  }

  p {
    margin: 0 !important;
  }

  &:hover {
    background: #efefef;

    &.disable {
      background: #ddd;
    }

    &.selected {
      background: var(--theme-dark);
    }
  }

  &.-bordered {
    border: solid 3px #4d90fe;
    border-radius: 24px;
  }
}

.card-badge-info {
  color: slategrey;
  user-select: none;
  padding: 0 3px;
  font-weight: 600;
  font-size: 0.8em;
}
</style>
