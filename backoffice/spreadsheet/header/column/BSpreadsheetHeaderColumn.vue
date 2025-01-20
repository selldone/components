<!--
  - Copyright (c) 2025. Selldone® Business OS™
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
  <th
    class="text-center"
    :style="[is_variant ? 'box-shadow: inset 0 2px 0 0 #512DA8;background:#F8F5FF' : nyll,is_pricing?'box-shadow: inset 0 2px 0 0 #C2185B;background:#FFFAFC':null]"
  >
    <v-icon class="me-1">{{ icon }}</v-icon>
    <span> {{ title }}</span>

    <template v-if="styler[header]?.tooltip">
      <v-icon class="ms-1" size="12">info</v-icon>
      <v-tooltip
        color="#000"
        content-class="bg-black text-start rounded-xl"
        location="bottom"
        max-width="420"
        activator="parent"
      >
        <div class="py-2">
          <h3 v-if="styler[header].tooltip.title" class="mb-2">
            {{ styler[header].tooltip.title }}
          </h3>
          <p
            v-if="styler[header].tooltip.message"
            class="mb-0"
            v-html="styler[header].tooltip.message"
          ></p>
          <v-img
            v-if="styler[header].tooltip.image"
            :src="styler[header].tooltip.image"
            class="my-2"
            max-height="160"
          ></v-img>
        </div>
      </v-tooltip>
    </template>

    <small v-if="is_variant" class="d-block op-0-6 mt-1">{{ header }}</small>
  </th>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import {
  GetVariantIconByCode,
  GetVariantNameByCode,
} from "@selldone/core-js/enums/product/ProductVariants.ts";

export default defineComponent({
  name: "BSpreadsheetHeaderColumn",
  props: {
    header: {
      required: true,
      type: String,
    },
    styler: {
      required: true,
      type: Object,
    },
  },

  computed: {
    is_variant() {
      return this.header.startsWith("V_");
    },
    variant_code() {
      if (!this.is_variant) return null;
      const variantMap = {
        V_Color: "color",
        V_Style: "style",
        V_Volume: "volume",
        V_Weight: "weight",
        V_Pack: "pack",
        V_Type: "type",
      };
      return variantMap[this.header];
    },

    is_pricing(){
      return ['Price','Currency','Commission','Discount',"Discount Start Date","Discount End Date","Price Input","Valuation Id"].includes(this.header) || this.header.startsWith("Price ") || this.header.startsWith("Qty ");
    },


    icon() {
      return this.variant_code ? GetVariantIconByCode(this.variant_code) : null;
    },
    title() {
      if (this.variant_code) {
        return this.$t(GetVariantNameByCode(this.variant_code));
      }

      return this.header;
    },
  },
});
</script>

<style scoped lang="scss"></style>
