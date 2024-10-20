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
    :class="{
      '-selectable': selectable,
      '-dense': dense,
      dark: dark,
      'text-center': center,
      '-small': small,
      '-single-line':singleLine,
      '-ultra-dense': isUltraDense(colors)
    }"
    :justify="center ? 'center' : null"
    class="product-variant-view"
    @click="$emit('select')"
    no-gutters
  >
    <div
      v-if="colors.length"
      :class="{ dense: dense,'flex-wrap':!singleLine }"
      class="-var-row  align-center"
    >
      <v-icon v-if="!hideIcon"  :color="icon_color" class="me-1 align-self-center"> palette</v-icon>

      <u-color-circle
        v-for="color in colors"
        :key="color"
        :border-less="small"
        :class="{ '-selected': selectedVariant?.color === color }"
        :color="color"
        :size="small ? 14 : 18"
        class="me-1 hover-scale card-badge-color"
        @click="onSelect('color', color)"
        @mouseenter="hoverable ? onSelect('color', color) : undefined"
        @mouseleave="
          hoverable ? $emit('update:selected-variant', null) : undefined
        "
      >
      </u-color-circle>
      <v-icon v-if="colors_more">more_horiz</v-icon>
    </div>

    <div
      v-if="volumes.length"
      :class="{ dense: dense, 'flex-wrap':!singleLine }"
      class="-var-row    "

    >
      <v-icon v-if="!hideIcon" :color="icon_color" class="me-1 align-self-center" > equalizer</v-icon>

      <span
        v-for="volume in volumes"
        :key="volume"
        :class="{ '-selected': selectedVariant?.volume === volume }"
        class="card-badge-info hover-scale"
        dir="auto"
        @click="onSelect('volume', volume)"
      >
        <u-variant-asset-image
          :size="16"
          :value="volume"
        ></u-variant-asset-image>
        {{ volume?.removeVariantAsset() }}
      </span>

      <v-icon v-if="volumes_more">more_horiz</v-icon>

    </div>

    <div
      v-if="packs.length"
      :class="{ dense: dense,'flex-wrap':!singleLine  }"
      class="-var-row    "
    >
      <v-icon v-if="!hideIcon"  :color="icon_color" class="me-1 align-self-center" > all_inbox</v-icon>

      <span
        v-for="pack in packs"
        :key="pack"
        :class="{ '-selected': selectedVariant?.pack === pack }"
        class="card-badge-info hover-scale"
        dir="auto"
        @click="onSelect('pack', pack)"
      >
        <u-variant-asset-image
          :size="16"
          :value="pack"
        ></u-variant-asset-image>
        {{ pack?.removeVariantAsset() }}<span class="text-muted">x</span>
      </span>

      <v-icon v-if="packs_more">more_horiz</v-icon>

    </div>

    <div
      v-if="weights.length"
      :class="{ dense: dense,'flex-wrap':!singleLine  }"
      class="-var-row    "
    >
      <v-icon v-if="!hideIcon"  :color="icon_color" class="me-1 align-self-center" >
        fa:fas fa-weight-hanging
      </v-icon>

      <span
        v-for="weight in weights"
        :key="weight"
        :class="{ '-selected': selectedVariant?.weight === weight }"
        class="card-badge-info hover-scale"
        dir="auto"
        @click="onSelect('weight', weight)"
      >
        <u-variant-asset-image
          :size="16"
          :value="weight"
        ></u-variant-asset-image>
        {{ weight?.removeVariantAsset() }}
      </span>
      <v-icon v-if="weights_more">more_horiz</v-icon>

    </div>

    <div
      v-if="types.length"
      :class="{ dense: dense, 'flex-wrap':!singleLine }"
      class="-var-row   "
    >
      <v-icon v-if="!hideIcon"  :color="icon_color" class="me-1 align-self-center" >
        fa:fas fa-toolbox
      </v-icon>
      <span
        v-for="type in types"
        :key="type"
        :class="{ '-selected': selectedVariant?.type === type }"
        class="card-badge-info hover-scale"
        dir="auto"
        @click="onSelect('type', type)"
      >
        <u-variant-asset-image
          :size="16"
          :value="type"
        ></u-variant-asset-image>
        {{ type?.removeVariantAsset() }}
      </span>

      <v-icon v-if="types_more">more_horiz</v-icon>

    </div>

    <div
      v-if="styles.length"
      :class="{ dense: dense, 'flex-wrap':!singleLine  }"
      class="-var-row   "
    >
      <v-icon  v-if="!hideIcon"  :color="icon_color" class="me-1 align-self-center"> style</v-icon>

      <span
        v-for="style in styles"
        :key="style"
        :class="{ '-selected': selectedVariant?.style === style }"
        class="card-badge-info hover-scale"
        dir="auto"
        @click="onSelect('style', style)"
      >
        <u-variant-asset-image
          :size="16"
          :value="style"
        ></u-variant-asset-image>
        {{ style?.removeVariantAsset() }}
      </span>
      <v-icon v-if="styles_more">more_horiz</v-icon>

    </div>

    <div
      v-if="!small && variants && variants.some((v) => v.price && v.currency)"
      :class="{ dense: dense ,'flex-wrap':!singleLine }"
      class="-var-row   "
    >
      <p class="m-0">
        {{ $t("variants_view.prices") }}
        :
        <span
          v-for="variant in variants"
          :key="variant.id"
          class="card-badge-info text-success hover-scale"
        >
          {{ numeralFormat(variant.price, "0,0") }}
          {{ getCurrencyName(variant.currency) }}
          <small
            >({{ numeralFormat(variant.discount, "0,0") }}
            {{ $t("variants_view.discount") }})</small
          ></span
        >
      </p>
    </div>

    <div
      v-if="!small && quantitys && variants.some((v) => v.quantity || v === 0)"
      :class="{ dense: dense,'flex-wrap':!singleLine  }"
      class="-var-row   "
    >
      <p class="m-0">
        {{ $t("variants_view.inventory") }}
        :
        <span
          v-for="quantity in quantitys"
          :key="quantity"
          class="card-badge-info text-success hover-scale"
        >
          {{ numeralFormat(quantity, "0,0") }}
        </span>
      </p>
    </div>
  </v-row>
</template>

<script>
import { GetArrayOfValuesInVariants } from "@selldone/core-js/enums/product/ProductVariants";
import UVariantAssetImage from "../../../ui/variant/asset/image/UVariantAssetImage.vue";
import UColorCircle from "../../../ui/color/circle/UColorCircle.vue";

export default {
  name: "ProductVariantsView",
  components: { UColorCircle, UVariantAssetImage },
  props: {
    variants: {
      required: true,
      type: Array,
    },

    limit: { type: Number, default: -1 /*No limit! Show all!*/ },
    small: {
      required: false,
      type: Boolean,
      default: false,
    },

    center: {
      required: false,
      type: Boolean,
      default: false,
    },
    dense: {
      type: Boolean,
      default: false,
    },
    dark: {
      type: Boolean,
      default: false,
    },
    selectedVariant: { type: Object },
    selectable: {
      type: Boolean,
      default: false,
    },
    hoverable: {
      type: Boolean,
      default: false,
    },
    singleLine:Boolean,
    hideIcon:Boolean,
    forceUltraDense:Boolean
  },
  data() {
    return {
      dialog: false,
    };
  },
  computed: {
    icon_color() {
      return this.dark ? "#fff" : "#444";
    },
    items_count() {
      return this.variants.length;
    },

    colors() {
      return this.getItemsInArray(this.variants, "color").limit(this.limit);
    },
    colors_more() {
      return this.getItemsInArray(this.variants, "color").length>this.limit;
    },
    weights() {
      return this.getItemsInArray(this.variants, "weight").limit(this.limit);
    },
    weights_more() {
      return this.getItemsInArray(this.variants, "weight").length>this.limit;
    },

    volumes() {
      return this.getItemsInArray(this.variants, "volume").limit(this.limit);
    },
    volumes_more() {
      return this.getItemsInArray(this.variants, "volume").length>this.limit;
    },

    styles() {
      return this.getItemsInArray(this.variants, "style").limit(this.limit);
    },
    styles_more() {
      return this.getItemsInArray(this.variants, "style").length>this.limit;
    },

    packs() {
      return this.getItemsInArray(this.variants, "pack").limit(this.limit);
    },
    packs_more() {
      return this.getItemsInArray(this.variants, "pack").length>this.limit;
    },


    types() {
      return this.getItemsInArray(this.variants, "type").limit(this.limit);
    },
    types_more() {
      return this.getItemsInArray(this.variants, "type").length>this.limit;
    },

    quantitys() {
      return this.getItemsInArray(this.variants, "quantity").limit(this.limit);
    },
    quantitys_more() {
      return this.getItemsInArray(this.variants, "quantity").length>this.limit;
    },

    prices() {
      return this.getItemsInArray(this.variants, "price").limit(this.limit);
    },
    prices_more() {
      return this.getItemsInArray(this.variants, "price").length>this.limit;
    },


    shop_id() {
      return this.getShop()?.id;
    },
  },
  methods: {
    getItemsInArray(array, item_name) {
      return GetArrayOfValuesInVariants(array, item_name);
    },

    onSelect(key, value) {
      if (!this.selectable && !this.hoverable) return null;
      // List of variants with same variant value:
      const founds = this.variants.filter((v) => v[key] === value);

      let founded = null;

      if (this.selectedVariant) {
        const other_keys = Object.keys(this.selectedVariant).filter(
          (k) =>
            this.selectedVariant[k] /*Has value*/ &&
            k !== key /*Not the same key*/,
        );

        // Try to find other values be similar:
        founded = founds.find((v) => {
          other_keys.forEach((k) => v[k] === this.selectedVariant[k]);
        });
      }
      if (!founded) {
        founded = founds.length ? founds[0] : null;
      }

      //Just send first found item!
      this.$emit("update:selected-variant", founded);

      // console.log('Select',founded)

      this.$nextTick(() => {
        this.$forceUpdate();
      });
    },

    isUltraDense(items) {
      return this.forceUltraDense || items?.join(" ").length > (this.small?20:50);
    },
  },
};
</script>

<style lang="scss" scoped>
.product-variant-view {
  color: #000;
  font-size: 12px;

  padding: 8px;
  margin: 4px;
  font-weight: 500;

  &.-dense {
    padding: 4px;
    margin: 0;
    font-size: 12px !important;
  }

  &.-small {
    padding: 0px;
    margin: 0;
    font-size: 11px !important;
  }

  &.dark {
    color: #fff;
    .card-badge-info {
      color: #fff;
    }
    .card-badge-color {
      border: solid 1px #555;
    }
  }
  .card-badge-color {
    border: solid 1px #aaa;
  }

  &.-selectable {
    .card-badge-info,
    .card-badge-color {
      cursor: pointer;
      pointer-events: all !important;
    }
  }
}

.card-badge-info {

  user-select: none;
  padding: 4px 4px;
  font-weight: 600;

  &:hover {
    border-radius: 8px;
    background: #f4f4f4;
  }

  &.-selected {
    color: #fff;
    background: #000;
    border-radius: 4px;

    &:hover {
      background: #6b809b;
    }
  }
}

.card-badge-color {
  &.-selected {
    border-radius: 50%;
    border: solid medium #000 !important;
  }
}

.hover-scale {
  user-select: none;

  &:hover {
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0, 1);
    transform: scale(1.4, 1.4);
    font-size: 1.03em;
  }
}

.dense {
  max-width: max-content !important;
  margin: 2px 6px;
}
.-var-row{
  display: flex;
  padding: 4px;
  align-items: center;
}
.-ultra-dense {

  .-var-row{
    font-size: 0.5rem;
    padding: 1px;
  }
}
.-single-line{
  .card-badge-info{
    display: inline-block;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }
}
</style>
