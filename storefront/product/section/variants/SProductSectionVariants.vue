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

<template>
  <div class="s--product-variants">
    <!-- █████████████████████ 💡 Product Variants █████████████████████ -->
    <template v-if="hasVariants">
      <template v-if="variants_mode === ShopThemeVariantsMode.select.value">
        <variant-filter
          :variants="$product.product_variants"
          @change="
            (filter) => {
              $emit('update:filter', filter);
              show_all = true;
            }
          "
        />
        <v-slide-y-reverse-transition group hide-on-leave>
          <variant-item-mini
            v-for="(product_variant, index) in product_variants"
            :key="index"
            :product-variant="product_variant"
            :selected="product_variant === currentVariant"
            class="ma-1 border"

            force-enable
            @select="$emit('update:currentVariant', product_variant)"
          />
        </v-slide-y-reverse-transition>
        <v-btn
          v-if="$product.product_variants.length > 3"
          class="crossRotate m-1"
          variant="text"
          size="small"
          @click="show_all = !show_all"
        >
          <v-icon>
            {{ show_all ? "keyboard_arrow_up" : "more_horiz" }}
          </v-icon>
          {{
            show_all ? $t("global.actions.collapse") : $t("global.actions.more")
          }}
        </v-btn>
      </template>
      <div v-else class="d-flex flex-column align-stretch">
        <div
          v-for="(it, index) in AvailableProductVariants"
          :key="index"
          :style="{ order: GetVariantOrderIndexByCode(it.code, $product) }"
        >
          <!-- Variant title -->

          <div class="my-2">
            <v-icon class="me-1" color="#111" size="small"
              >{{ GetVariantIconByCode(it.code, $product) }}
            </v-icon>
            <b class="me-2">{{
              $t(GetVariantNameByCode(it.code, $product))
            }}</b>
            <span v-if="currentVariant">{{
              it.code === "color"
                ? GetNameOfColor(currentVariant.color)
                : currentVariant[it.code]?.removeVariantAsset()
            }}</span>
          </div>

          <v-row no-gutters>
            <div
              v-for="selection in getVariantsValuesOf(it.code)"
              :key="selection"
              :class="{
                '-color': it.code === 'color',
                selected: selectionValues.some(
                  (s) => s.code === it.code && s.value === selection,
                ),
                not:
                  !eligible_variants.some((x) => x[it.code] === selection) &&
                  !selectionValues.some(
                    (y) => y.code === it.code,
                  ) /*Do not disable item on when an item selected on the row!*/,
              }"
              class="var-sel"
              @click="selectVarF(it.code, selection)"
              :style="{
                order: GetVariantValueIndexCode(it.code, $product, selection),
              }"
            >
              <!-- Is Color ? -->
              <template v-if="it.code === 'color'">
                <template v-if="image_mode">
                  <v-img
                    :src="
                      getShopImagePath(
                        product_variants.find((v) => v.color === selection)
                          ?.image,
                        IMAGE_SIZE_SMALL,
                      )
                    "
                    class="-var-image"
                    eager
                    fetchpriority="high"
                    height="100%"
                    width="100%"
                  >
                    <u-color-circle
                      :color="selection"
                      :size="12"
                      class="-var-image-color"
                    ></u-color-circle>
                  </v-img>
                </template>
                <template v-else>
                  <u-color-circle :color="selection"></u-color-circle>

                  <span style="font-size: 70%">{{
                    GetNameOfColor(selection)
                  }}</span>
                </template>
              </template>
              <!-- Normal -->
              <span v-else>
                <u-variant-asset-image
                  :class="{
                    '-hover-hide':
                      selection?.removeVariantAsset() /*Has pure text value?*/,
                  }"
                  :selected="
                    selectionValues.some(
                      (s) => s.code === it.code && s.value === selection,
                    )
                  "
                  :value="selection"
                  background
                ></u-variant-asset-image>
                <span>{{ selection?.removeVariantAsset() }}</span>
              </span>
            </div>
          </v-row>
        </div>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import VariantFilter from "../../variant/variant-filter/VariantFilter.vue";
import VariantItemMini from "../../../../storefront/product/variant/VariantItemMini.vue";
import {
  GetVariantIconByCode,
  GetVariantNameByCode,
  GetVariantOrderIndexByCode,
  GetVariantValueIndexCode,
  ProductVariants,
} from "@selldone/core-js/enums/product/ProductVariants";
import UVariantAssetImage from "../../../../ui/variant/asset/image/UVariantAssetImage.vue";
import UColorCircle from "../../../../ui/color/circle/UColorCircle.vue";
import { GetNameOfColor } from "@selldone/core-js/helper/color/ColorHelper.ts";
import { ShopThemeVariantsMode } from "@selldone/core-js/enums/shop/theme/ShopThemeVariantsMode.ts";

export default {
  name: "SProductSectionVariants",
  components: {
    UColorCircle,
    UVariantAssetImage,
    VariantItemMini,
    VariantFilter,
  },
  inject: ["$shop", "$product"],
  props: {
    filter: {},

    currentVariant: {},
    selectionValues: {},
  },

  data: () => ({
    GetVariantNameByCode: GetVariantNameByCode,
    GetVariantIconByCode: GetVariantIconByCode,
    GetVariantOrderIndexByCode: GetVariantOrderIndexByCode,
    GetVariantValueIndexCode: GetVariantValueIndexCode,

    GetNameOfColor: GetNameOfColor,
    show_all: false,

    // ▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁
    ShopThemeVariantsMode: ShopThemeVariantsMode,
  }),

  computed: {
    theme() {
      if (!this.$shop) return null;
      return this.$shop.theme;
    },
    variants_mode() {
      return this.theme?.variants_mode;
    },

    image_mode() {
      return (
        this.AvailableProductVariants.length === 1 &&
        this.AvailableProductVariants[0].code === ProductVariants.color.code && // Only have color variants.
        !this.product_variants.some((v) => !v.image)
      ); // All variants should have image!
    },

    hasVariants() {
      return this.$product.product_variants?.length > 0;
    },

    product_variants() {
      if (!this.$product.product_variants?.length) return [];
      let out = this.$product.product_variants;

      const instance = this.$product.product_variants[0];
      const sort_key = instance.volume
        ? "volume"
        : instance.weight
          ? "weight"
          : instance.pack
            ? "pack"
            : "quantity";

      out = out.sort((a, b) => {
        /*DESC*/
        if (Number(a[sort_key]) > Number(b[sort_key])) return -1;
        if (Number(a[sort_key]) < Number(b[sort_key])) return 1;
        return 0;
      });

      if (this.filter) {
        out = out.filter((item) => {
          // console.log("item = " + item);
          let match = true;
          for (let key in this.filter) {
            let val = this.filter[key];

            if (key === "available" && val) match &= item.quantity > 0;

            if (!val || !item[key]) continue;
            match &= item[key] === val;
          }

          return match;
        });
      }

      // Row mode:
      if (this.variants_mode === ShopThemeVariantsMode.select.value) {
        if (this.show_all) return out;

        return out ? out.slice(0, 3) : [];
      }
      // Standard mode:
      return out ? out : [];
    },

    AvailableProductVariants() {
      return Object.values(ProductVariants).filter((it) => {
        return this.product_variants.some((variant) => !!variant[it.code]);
      });
    },
    eligible_variants() {
      return this.product_variants.filter((variant) => {
        //// TODO: We can make it optional for sellers!  if (variant.quantity <= 0) return false; BETTER: Do it on server side! or make it optional for buyers!

        let accept = true;
        for (let i = 0; i < this.selectionValues.length; i++) {
          const filter = this.selectionValues[i];
          //console.log('eligible','filter',filter,'variant',variant,variant[filter.code],variant[filter.code]!==filter.value)

          if (
            //  (!variant[filter.code]) /*Not Eligible if variant value is null!*/ ||
            variant[filter.code] !== filter.value
          ) {
            accept = false;
            //  console.log('--NOT ELIGIBLE--')

            break;
          }
        }

        return accept;
      });
    },
  },
  methods: {
    //█████████████████████████████████████████████████████████████
    //―――――――――――――――――――――――― Smart Variants Show ――――――――――――――――――――――
    //█████████████████████████████████████████████████████████████

    getVariantsValuesOf(code) {
      return this.product_variants.map((v) => v[code]).unique();
    },

    selectVarF(code, value) {
      this.$emit("update:currentVariant", null);

      if (
        this.selectionValues.some(
          (it) => it.code === code && it.value === value,
        )
      ) {
        this.clearVarF(code);
        return;
      }

      this.AddOrUpdateItemByID(
        this.selectionValues,
        { code: code, value: value },
        "code",
      );

      // Check : If eligible variants iz zero remove all other selectionValues:
      if (!this.eligible_variants.length) {
        const codes = this.selectionValues
          .map((it) => it.code)
          .filter((it) => it !== code);
        codes.forEach((c) => {
          this.clearVarF(c);
        });
      }
      // console.log("eligible_variants",this.eligible_variants);
      // Select variant if eligible variants count is one:
      if (this.eligible_variants.length === 1) {
        // console.log("Auto select variant!");
        this.$emit("update:currentVariant", this.eligible_variants[0]);
      }
    },
    clearVarF(code) {
      this.DeleteItemByID(this.selectionValues, code, "code");
    },
  },
};
</script>

<style lang="scss">
.s--product-variants {
  --radius: 4px;

  .var-sel {
    min-height: 64px;
    min-width: 64px;
    max-width: 150px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: solid thin #ddd;
    border-radius: var(--radius);
    margin: 4px;
    padding: 3px;
    flex-direction: column;
    transition: all 0.35s ease-in-out;
    text-align: center;
    line-height: normal;
    position: relative;
    cursor: pointer;
    user-select: none;
    overflow: hidden;

    small {
      // Color name!
      font-size: 10px;
      margin-top: 3px;
    }

    &.-color {
      justify-content: space-around;
      min-width: 64px;
      max-width: 64px;
    }

    &.selected {
      background: #111;
      color: #fff;
      transform: scale(1.1);

      small {
        color: #fff !important;
      }
    }

    &.not {
      opacity: 0.5;

      &:after {
        position: absolute;
        content: "";
        left: 0px;
        top: 50%;
        right: 0px;
        border-top: 1px solid;
        border-color: #111;

        transform: rotate(-45deg);
      }
    }

    .-hover-hide {
      &:hover {
        opacity: 0;
      }
    }

    .-var-image {
      border-radius: var(--radius);
      position: relative;

      .-var-image-color {
        position: absolute;
        right: 3px;
        bottom: 3px;
      }
    }
  }
}
</style>
