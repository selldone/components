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
    class="product-variant-card-mini"
    style="position: relative"
    :class="[
      quantity || forceEnable ? '' : 'disabled',
      selected ? 'selected' : '',
      bordered ? '-bordered' : '',
    ]"
    @click="$emit('select')"
    :style="{ '--theme-dark': activeColor ? activeColor : SaminColorDark }"
  >
    <v-col v-if="color" align-center justify-center class="p-1 text-nowrap">
      <v-icon :color="icon_color" class="me-1" small> palette </v-icon>

      <s-color-circle :color="color" class="mr-1" :size="16">  </s-color-circle>

      <span class="small mr-1">{{ coloName }}</span>
    </v-col>

    <v-col v-if="volume" class="p-1 text-nowrap">
      <v-icon :color="icon_color" class="me-1" small> equalizer </v-icon>

      <span class="card-badge-info"> {{ volume }} </span>
    </v-col>

    <v-col v-if="pack" class="p-1 text-nowrap">
      <v-icon :color="icon_color" class="me-1" small> all_inbox </v-icon>

      <span class="card-badge-info">
        {{ pack }}<span class="text-muted">x</span>
      </span>
    </v-col>

    <v-col v-if="weight" class="p-1 text-nowrap">
      <v-icon :color="icon_color" class="me-1" small>
        fas fa-weight-hanging
      </v-icon>

      <span class="card-badge-info"> {{ weight }} </span>
    </v-col>

    <v-col v-if="style" class="p-1 text-nowrap">
      <v-icon :color="icon_color" class="me-1" small> style </v-icon>

      <span class="card-badge-info"> {{ style }} </span>
    </v-col>

    <v-col v-if="type" class="p-1 text-nowrap">
      <v-icon :color="icon_color" class="me-1" small> fas fa-toolbox </v-icon>
      <span class="card-badge-info"> {{ type }} </span>
    </v-col>

    <div v-if="has_ar" class="d-flex align-items-center text-nowrap me-5 ms-2">
      <v-img
        height="20"
        width="20"
        contain
        :src="require('@components/assets/icons/3d.svg')"
      ></v-img>
    </div>
  </v-row>
</template>

<script>
import SColorCircle from "@components/ui/color/view/SColorCircle.vue";

export default {
  name: "VariantItemMini",
  components: {SColorCircle},
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
      return this.GetNameOfColor(this.color);
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

<style scoped lang="scss">
.product-variant-card-mini {
  background: #fafafa;
  padding: 3px;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;

  .col{
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
