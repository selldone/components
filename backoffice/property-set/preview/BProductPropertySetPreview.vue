<!--
  - Copyright (c) 2024. Selldone® Business OS™
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
  <ol v-if="modern" class="b-product-property-set-options">
    <li v-for="option in options" :key="option.code">
      <v-icon aria-hidden="true" size="18">{{ option.icon }}</v-icon><span>{{ option.name }}</span>
    </li>
  </ol>
  <div v-else class="b--product-property-set-preview">
    <div
      class="-card"
      v-for="group in groups"
      :key="group.caption"
      :data-caption="group.caption"
      :class="{ '-selected': group.selected }"
    >
      <div class="-row">
        <img
          v-for="(img, index) in group.images"
          :key="index"
          :src="img"
          alt="Product Image"
        />
      </div>
      <div class="d-flex flex-wrap mt-1">
        <span v-for="chip in group.chips" :key="chip" class="-chip">
          {{ chip }}
        </span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { ProductVariants, GetVariantNameByCode, GetVariantIconByCode } from "@selldone/core-js/enums/product/ProductVariants.ts";

/**
 * <b-product-property-set-preview>
 */
export default defineComponent({
  name: "BProductPropertySetPreview",

  props: {
    modern: { type: Boolean, default: false },
    propertySet: {
      type: Object,
    },
  },

  data() {
    return {};
  },

  computed: {
    options() {
      const codes = [...new Set([
        ...(this.propertySet?.variants || []).map((variant) => variant.code).filter((code) => Object.hasOwn(ProductVariants, code)),
        ...Object.keys(ProductVariants),
      ])];
      return codes.map((code) => ({
        code,
        name: this.$t(GetVariantNameByCode(code, { property_set: this.propertySet })),
        icon: GetVariantIconByCode(code, { property_set: this.propertySet }),
      }));
    },
    groups() {
      return [
        {
          caption: "Clothing",
          images: [
            require("./assets/clothing/1.jpg"),
            require("./assets/clothing/2.jpg"),
            require("./assets/clothing/3.jpg"),
          ],
          chips: ["Color", "Size", "Fabric"],
        },
        ...(this.propertySet
          ? [
              {
                caption: this.propertySet.title,
                images: this.propertySet.products?.length
                  ? this.propertySet.products.map((x) =>
                      this.getShopImagePath(x.icon, 64),
                    )
                  : [
                      require("./assets/digital-gadgets/1.jpg"),
                      require("./assets/digital-gadgets/2.jpg"),
                      require("./assets/digital-gadgets/3.jpg"),
                    ],
                chips:
                  this.propertySet.variants?.map((x) =>
                    this.$t(
                      GetVariantNameByCode(x.code, {
                        property_set: this.propertySet,
                      }),
                    ),
                  ) || [],
                selected: true,
              },
            ]
          : [
              {
                caption: "Digital Gadgets",
                images: [
                  require("./assets/digital-gadgets/1.jpg"),
                  require("./assets/digital-gadgets/2.jpg"),
                  require("./assets/digital-gadgets/3.jpg"),
                ],
                chips: ["Color", "Body Material"],
              },
            ]),
        {
          caption: "Training Service",
          images: [
            require("./assets/services/1.jpg"),
            require("./assets/services/2.jpg"),
            require("./assets/services/3.jpg"),
          ],
          chips: ["Level", "Duration"],
        },
      ];
    },
  },
});
</script>

<style scoped lang="scss">
.b-product-property-set-options {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0 22px;
  list-style: none;
  margin: 0;
  padding: 0;
  counter-reset: property-option;
  > li {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
    min-height: 48px;
    padding: 10px 2px;
    border-block-end: 1px solid var(--sd-modern-border);
    font-size: 13px;
    font-weight: 400;
    line-height: 21px;
    counter-increment: property-option;
  }
  > li::before { content: counter(property-option); flex: 0 0 13px; color: var(--sd-modern-muted); font-size: 11px; line-height: 18px; font-variant-numeric: tabular-nums; }
  > li > .v-icon { color: var(--sd-modern-muted); flex: 0 0 18px; font-size: 18px; }
  > li > span { min-width: 0; overflow-wrap: anywhere; }
  > li:nth-last-child(-n+2) { border-block-end: 0; }
  @media (max-width: 520px) { column-gap: 16px; > li { gap: 8px; } }
  @media (max-width: 360px) { grid-template-columns: minmax(0, 1fr); > li:nth-last-child(2) { border-block-end: 1px solid var(--sd-modern-border); } }
}
.b--product-property-set-preview {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 2%; /* Adjust the gap between cards as needed */
  max-width: 1200px; /* Optional: set a max width for the container */
  margin: 12px auto 0;

  --background: #f1f1f1;
  --border-color: #f1f1f1;

  .-card {
    width: 32%; /* Three cards side by side: about 3 x 32% = 96%, plus gap */
    background: var(--background);
    border-radius: 8px;
    box-sizing: border-box;

    padding: 16px 8px 8px;
    position: relative;
    border: solid thin var(--border-color);

    &.-selected {
      border: solid thin #3d33cc;

      .-chip {
        background: #3d33cc;
      }

      &:after {
        background-color: #3d33cc;
        color: #fff;
        border: solid thin #3d33cc;
      }
    }

    .-row {
      display: flex;
      flex-wrap: wrap;
      gap: 2%;
      align-items: center;
      justify-content: center;
    }

    img {
      display: block;
      width: 31%;
      max-width: 64px;
      aspect-ratio: 1;
      height: auto;
      border-radius: 4px;
    }

    &:after {
      content: attr(data-caption);
      position: absolute;
      background-color: var(--background);
      color: #333;
      padding: 2px 4px;
      border-radius: 8px;
      top: -9px;
      left: 12px;
      font-size: 8px;
      font-weight: 500;
      border: solid thin var(--border-color);
    }

    .-chip {
      background: #333;
      color: #fff;
      padding: 2px 4px;
      border-radius: 4px;
      font-size: 8px;
      margin: 1px;
      text-wrap: nowrap;
    }

    @media screen and (max-width: 460px) {
      &:after {
        font-size: 6px;
        top: -8px;
      }
      .-chip {
        font-size: 7px;
      }
    }
  }
}
</style>
