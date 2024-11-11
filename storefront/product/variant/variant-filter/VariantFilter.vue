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
  <v-col class="d-inline-flex">
    <v-btn class="ms-2" icon @click="show_filter = !show_filter">
      <v-icon class="crossRotate">
        {{ show_filter ? "close" : "more_vert" }}
      </v-icon>
    </v-btn>

    <v-slide-x-transition hide-on-leave>
      <small v-if="!show_filter" style="margin: auto">
        <i class="fas fa-arrow-right" />
        {{ $t("global.variant_filter.title") }}
      </small>
    </v-slide-x-transition>

    <v-fade-transition>
      <v-row
        v-show="show_filter"
        class="product-variant-filters"
        justify="center"
        no-gutters
      >
        <!-- ============== colors ============== -->
        <color-select-slider
          v-if="colors.length"
          :close="mode !== 'color'"
          :list="colors"
          :model-value="null"
          @open="mode = 'color'"
          @select="
            (item) => {
              color = item;
              onChange();
            }
          "
        />

        <!-- ============== volume ============== -->
        <text-select-slider
          v-if="volumes.length"
          :close="mode !== 'volume'"
          :list="volumes"
          :model-value="null"
          :title="$t('global.variants.volume')"
          icon="equalizer"
          @open="mode = 'volume'"
          @select="
            (item) => {
              volume = item;
              onChange();
            }
          "
        />

        <!-- ============== packs ============== -->

        <text-select-slider
          v-if="packs.length"
          :close="mode !== 'packs'"
          :list="packs"
          :model-value="null"
          :title="$t('global.variants.count_in_pack')"
          icon="all_inbox"
          @open="mode = 'packs'"
          @select="
            (item) => {
              pack = item;
              onChange();
            }
          "
        />

        <!-- ============== weights ============== -->

        <text-select-slider
          v-if="weights.length"
          :close="mode !== 'weights'"
          :list="weights"
          :model-value="null"
          :title="$t('global.variants.weight')"
          icon="fa:fas fa-weight-hanging"
          @open="mode = 'weights'"
          @select="
            (item) => {
              weight = item;
              onChange();
            }
          "
        />

        <!-- ============== types ============== -->

        <text-select-slider
          v-if="types.length"
          :close="mode !== 'types'"
          :list="types"
          :model-value="null"
          :title="$t('global.variants.type')"
          icon="fa:fas fa-toolbox"
          @open="mode = 'types'"
          @select="
            (item) => {
              type = item;
              onChange();
            }
          "
        />

        <!-- ============== styles ============== -->
        <text-select-slider
          v-if="styles.length"
          :close="mode !== 'styles'"
          :list="styles"
          :model-value="null"
          :title="$t('global.variants.style')"
          icon="style"
          @open="mode = 'styles'"
          @select="
            (item) => {
              style = item;
              onChange();
            }
          "
        />

        <!-- ============== quantities ============== -->

        <div class="p-1 m-0 d-flex align-center">
          <v-switch
            v-model="only_available"
            :label="$t('global.variant_filter.only_available')"
            class="inline-block ms-2 my-0 py-0 small-label"
            color="success"
            density="compact"
            hide-details
            inset
            @update:model-value="onChange"
          ></v-switch>
        </div>
      </v-row>
    </v-fade-transition>
  </v-col>
</template>

<script lang="ts">
import TextSelectSlider from "./TextSelectSlider.vue";
import ColorSelectSlider from "./ColorSelectSlider.vue";

export default {
  name: "VariantFilter",
  components: { ColorSelectSlider, TextSelectSlider },
  props: {
    variants: {
      required: true,
      type: Array,
    },
  },
  data() {
    return {
      show_filter: false,

      dialog: false,
      mode: null,

      color: "",
      weight: "",
      volume: "",
      style: "",
      pack: "",
      quantity: "",
      price: "",
      type: "",
      code: "",
      only_available: true, // Default: show only available variants
    };
  },
  computed: {
    items_count() {
      return this.variants.length;
    },

    colors() {
      return this.getItemsInArray(this.variants, "color");
    },
    weights() {
      return this.getItemsInArray(this.variants, "weight");
    },
    volumes() {
      return this.getItemsInArray(this.variants, "volume");
    },
    styles() {
      return this.getItemsInArray(this.variants, "style");
    },
    packs() {
      return this.getItemsInArray(this.variants, "pack");
    },
    quantitys() {
      return this.getItemsInArray(this.variants, "quantity");
    },
    prices() {
      return this.getItemsInArray(this.variants, "price");
    },
    types() {
      return this.getItemsInArray(this.variants, "type");
    },
  },
  methods: {
    onChange() {
      let out = {
        color: this.color,
        weight: this.weight,
        volume: this.volume,
        style: this.style,
        pack: this.pack,
        quantity: this.quantity,
        price: this.price,
        type: this.type,
        code: this.code,
        available: this.only_available,
      };
      this.$emit("change", out);
    },

    getItemsInArray(array, item_name) {
      let out = [];
      array.forEach((item) => {
        if (item[item_name] && !out.includes(item[item_name]))
          out.push(item[item_name]);
      });
      return out;
    },

    toggle(mode) {
      this.mode = this.mode === mode ? null : mode;
    },
    setColor(color) {
      this.color = color;
      this.mode = null;
    },

    setVolume(volume) {
      this.volume = volume;
      this.mode = null;
    },

    setPack(pack) {
      this.pack = pack;
      this.mode = null;
    },

    setWeight(weight) {
      this.weight = weight;
      this.mode = null;
    },
    setType(type) {
      this.type = type;
      this.mode = null;
    },
  },
};
</script>

<style lang="scss" scoped>
.product-variant-filters {
  font-size: 0.8rem;
  margin-right: 5px;
}
</style>
