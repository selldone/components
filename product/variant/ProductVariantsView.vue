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
    :justify="center ? 'center' : null"
    class="product-variant-view"
    :class="[
      center ? ['text-center', 'small'] : '',
      dark ? 'dark' : '',
      { '-selectable': selectable },
    ]"
    @click="$emit('select')"
  >
    <v-flex
      v-if="colors.length"
      align-center
      justify-center
      class="p-1"
      :class="{ dense: dense }"
    >
      <v-icon :color="icon_color" class="me-1" small> palette </v-icon>

      <color-circle
        v-for="color in colors"
        :key="color"
        :color="color"
        :size="small ? 14 : 18"
        :border-less="small"
        class="mr-1 hover-scale card-badge-color"
        :class="{ '-selected': selectedVariant?.color === color }"
        @click.native="onSelect('color', color)"
        @mouseenter.native="hoverable ? onSelect('color', color) : undefined"
        @mouseleave.native="
          hoverable ? $emit('update:selected-variant', null) : undefined
        "
      >
      </color-circle>
    </v-flex>

    <v-flex
      v-if="volumes.length"
      align-center
      justify-center
      class="p-1"
      :class="{ dense: dense }"
    >
      <v-icon :color="icon_color" class="me-1" small> equalizer </v-icon>

      <span
        v-for="volume in volumes"
        :key="volume"
        class="card-badge-info hover-scale"
        dir="auto"
        :class="{ '-selected': selectedVariant?.volume === volume }"
        @click="onSelect('volume', volume)"
      >
        <variant-asset-view
          :shop-id="shop_id"
          :value="volume"
          :size="16"
        ></variant-asset-view>
        {{ volume?.removeVariantAsset() }}
      </span>
    </v-flex>

    <v-flex
      v-if="packs.length"
      align-center
      justify-center
      class="p-1"
      :class="{ dense: dense }"
    >
      <v-icon :color="icon_color" class="me-1" small> all_inbox </v-icon>

      <span
        v-for="pack in packs"
        :key="pack"
        class="card-badge-info hover-scale"
        dir="auto"
        :class="{ '-selected': selectedVariant?.pack === pack }"
        @click="onSelect('pack', pack)"
      >
        <variant-asset-view
          :shop-id="shop_id"
          :value="pack"
          :size="16"
        ></variant-asset-view>
        {{ pack?.removeVariantAsset() }}<span class="text-muted">x</span>
      </span>
    </v-flex>

    <v-flex
      v-if="weights.length"
      align-center
      justify-center
      class="p-1"
      :class="{ dense: dense }"
    >
      <v-icon :color="icon_color" class="me-1" small>
        fas fa-weight-hanging
      </v-icon>

      <span
        v-for="weight in weights"
        :key="weight"
        class="card-badge-info hover-scale"
        dir="auto"
        :class="{ '-selected': selectedVariant?.weight === weight }"
        @click="onSelect('weight', weight)"
      >
        <variant-asset-view
          :shop-id="shop_id"
          :value="weight"
          :size="16"
        ></variant-asset-view>
        {{ weight?.removeVariantAsset() }}
      </span>
    </v-flex>

    <v-flex
      v-if="types.length"
      align-center
      justify-center
      class="p-1"
      :class="{ dense: dense }"
    >
      <v-icon :color="icon_color" class="me-1" small> fas fa-toolbox </v-icon>
      <span
        v-for="type in types"
        :key="type"
        class="card-badge-info hover-scale"
        dir="auto"
        :class="{ '-selected': selectedVariant?.type === type }"
        @click="onSelect('type', type)"
      >
        <variant-asset-view
          :shop-id="shop_id"
          :value="type"
          :size="16"
        ></variant-asset-view>
        {{ type?.removeVariantAsset() }}
      </span>
    </v-flex>

    <v-flex
      v-if="styles.length"
      xs12
      align-center
      justify-center
      class="p-1"
      :class="{ dense: dense }"
    >
      <v-icon :color="icon_color" class="me-1" small> style </v-icon>

      <span
        v-for="style in styles"
        :key="style"
        class="card-badge-info hover-scale"
        dir="auto"
        :class="{ '-selected': selectedVariant?.style === style }"
        @click="onSelect('style', style)"
      >
        <variant-asset-view
          :shop-id="shop_id"
          :value="style"
          :size="16"
        ></variant-asset-view>
        {{ style?.removeVariantAsset() }}
      </span>
    </v-flex>

    <v-flex
      v-if="!small && variants && variants.some((v) => v.price && v.currency)"
      xs12
      align-center
      justify-center
      class="p-1 m-0"
      :class="{ dense: dense }"
    >
      <p class="m-0">
        {{ $t("variants_view.prices") }}
        :
        <span
          v-for="variant in variants"
          :key="variant.id"
          class="card-badge-info text-success hover-scale"
        >
          {{ variant.price | numeralFormat("0,0") }}
          {{ getCurrencyName(variant.currency) }}
          <small
            >({{ variant.discount | numeralFormat("0,0") }}
            {{ $t("variants_view.discount") }})</small
          ></span
        >
      </p>
    </v-flex>

    <v-flex
      v-if="!small && quantitys && variants.some((v) => v.quantity || v === 0)"
      xs6
      md4
      align-center
      justify-center
      class="p-1 m-0"
      :class="{ dense: dense }"
    >
      <p class="m-0">
        {{ $t("variants_view.inventory") }}
        :
        <span
          v-for="quantity in quantitys"
          :key="quantity"
          class="card-badge-info text-success hover-scale"
        >
          {{ quantity | numeralFormat("0,0") }}
        </span>
      </p>
    </v-flex>
  </v-row>
</template>

<script>
import { GetArrayOfValuesInVariants } from "@core/enums/product/ProductVariants";
import VariantAssetView from "@components/ui/variant/VariantAssetView.vue";
import ColorCircle from "@components/ui/color/ColorCircle.vue";

export default {
  name: "ProductVariantsView",
  components: { ColorCircle, VariantAssetView },
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
    weights() {
      return this.getItemsInArray(this.variants, "weight").limit(this.limit);
    },
    volumes() {
      return this.getItemsInArray(this.variants, "volume").limit(this.limit);
    },
    styles() {
      return this.getItemsInArray(this.variants, "style").limit(this.limit);
    },
    packs() {
      return this.getItemsInArray(this.variants, "pack").limit(this.limit);
    },
    quantitys() {
      return this.getItemsInArray(this.variants, "quantity").limit(this.limit);
    },
    prices() {
      return this.getItemsInArray(this.variants, "price").limit(this.limit);
    },
    types() {
      return this.getItemsInArray(this.variants, "type").limit(this.limit);
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
  },
};
</script>

<style scoped lang="scss">
.product-variant-view {
  color: #444;
  font-size: 12px;

  padding: 8px;
  margin: 4px;
  font-weight: 500;

  &.small {
    padding: 0px;
    margin: 0;

    font-size: 11px !important;
  }

  &.dark {
    .card-badge-info {
      color: #fff;
    }
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
  color: #777;
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
    border: solid medium #000;
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
</style>
