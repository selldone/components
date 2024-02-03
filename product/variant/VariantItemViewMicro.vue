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
  <div
    class="product-variant-card-micro"
    :class="{ '-center': center }"
    style="position: relative"
  >
    <s-color-circle v-if="color" :color="color" class="me-1" :size="20">
    </s-color-circle>

    <span v-if="volume" class="card-badge-info">
      <variant-asset-view
        :shop-id="shop_id"
        :value="volume"
        :size="24"
      ></variant-asset-view>
      {{ volume?.removeVariantAsset() }}
    </span>

    <span v-if="pack" class="card-badge-info">
      <variant-asset-view
        :shop-id="shop_id"
        :value="pack"
        :size="24"
      ></variant-asset-view>
      {{ pack?.removeVariantAsset() }}<span class="text-muted">x</span>
    </span>

    <span v-if="weight" class="card-badge-info">
      <variant-asset-view
        :shop-id="shop_id"
        :value="weight"
        :size="24"
      ></variant-asset-view
      >{{ weight?.removeVariantAsset() }}
    </span>

    <span v-if="style" class="card-badge-info">
      <variant-asset-view
        :shop-id="shop_id"
        :value="style"
        :size="24"
      ></variant-asset-view>
      {{ style?.removeVariantAsset() }}
    </span>

    <span v-if="type" class="card-badge-info">
      <variant-asset-view
        :shop-id="shop_id"
        :value="type"
        :size="24"
      ></variant-asset-view>
      {{ type?.removeVariantAsset() }}
    </span>
  </div>
</template>

<script>
import VariantAssetView from "@components/ui/variant/VariantAssetView.vue";
import SColorCircle from "@components/ui/color/view/SColorCircle.vue";

export default {
  name: "VariantItemViewMicro",
  components: { SColorCircle, VariantAssetView },
  props: {
    productVariant: {
      required: true,
      type: Object,
    },
    center: Boolean,
  },
  data() {
    return {
      dialog: false,
    };
  },
  computed: {
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

    shop_id() {
      return this.getShop()?.id;
    },
  },
  methods: {},
};
</script>

<style scoped lang="scss">
.product-variant-card-micro {
  display: flex;
  align-items: center;
  justify-content: start;
  padding: 3px;
  border-radius: 4px;
  font-weight: 500;
  //cursor: pointer;

  &.disable {
    background: #ddd;
    opacity: 0.5;
  }

  p {
    margin: 0 !important;
  }

  &.-center {
    justify-content: center;
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
