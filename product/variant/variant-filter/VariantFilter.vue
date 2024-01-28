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
  <v-flex d-inline-flex style="">
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
        justify="center"
        class="product-variant-filters"
        no-gutters
      >
        <!-- ============== colors ============== -->
        <color-select-slider
          v-if="colors.length"
          :list="colors"
          :value="null"
          :close="mode !== 'color'"
          @select="
            item => {
              color = item;
              onChange();
            }
          "
          @open="mode = 'color'"
        />

        <!-- ============== volume ============== -->
        <text-select-slider
          v-if="volumes.length"
          icon="equalizer"
          :list="volumes"
          :value="null"
          :close="mode !== 'volume'"
          :title="$t('global.variants.volume')"
          @select="
            item => {
              volume = item;
              onChange();
            }
          "
          @open="mode = 'volume'"
        />

        <!-- ============== packs ============== -->

        <text-select-slider
          v-if="packs.length"
          icon="all_inbox"
          :list="packs"
          :value="null"
          :close="mode !== 'packs'"
          :title="$t('global.variants.count_in_pack')"
          @select="
            item => {
              pack = item;
              onChange();
            }
          "
          @open="mode = 'packs'"
        />

        <!-- ============== weights ============== -->

        <text-select-slider
          v-if="weights.length"
          icon="fa:fas fa-weight-hanging"
          :list="weights"
          :value="null"
          :close="mode !== 'weights'"
          :title="$t('global.variants.weight')"
          @select="
            item => {
              weight = item;
              onChange();
            }
          "
          @open="mode = 'weights'"
        />

        <!-- ============== types ============== -->

        <text-select-slider
          v-if="types.length"
          icon="fa:fas fa-toolbox"
          :list="types"
          :value="null"
          :close="mode !== 'types'"
          :title="$t('global.variants.type')"
          @select="
            item => {
              type = item;
              onChange();
            }
          "
          @open="mode = 'types'"
        />

        <!-- ============== styles ============== -->
        <text-select-slider
          v-if="styles.length"
          icon="style"
          :list="styles"
          :value="null"
          :close="mode !== 'styles'"
          :title="$t('global.variants.style')"
          @select="
            item => {
              style = item;
              onChange();
            }
          "
          @open="mode = 'styles'"
        />

        <!-- ============== quantities ============== -->

        <div  class="p-1 m-0 d-flex align-center">


          <v-switch v-model="only_available" inset    class="inline-block ms-2 my-0 py-0 small-label" @change="onChange" color="success" dense  hide-details :label="$t('global.variant_filter.only_available')"></v-switch>

        </div>
      </v-row>
    </v-fade-transition>
  </v-flex>
</template>

<script>
import TextSelectSlider from "./TextSelectSlider.vue";
import ColorSelectSlider from "./ColorSelectSlider.vue";
export default {
  name: "VariantFilter",
  components: { ColorSelectSlider, TextSelectSlider },
  props: {
    variants: {
      required: true,
      type: Array
    }
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
    }
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
        available: this.only_available
      };
      this.$emit("change", out);
    },

    getItemsInArray(array, item_name) {
      let out = [];
      array.forEach(item => {
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
    }
  }
};
</script>

<style scoped lang="scss">
.product-variant-filters {
  font-size: 0.8rem;
  margin-right: 5px;
}
</style>
