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
    :class="modern ? 'b-spreadsheet-header-column--modern sd-modern-list-header text-start' : 'text-center'"
    :style="modern ? null : [is_variant ? 'box-shadow: inset 0 2px 0 0 #512DA8;background:#F8F5FF' : null,is_pricing?'box-shadow: inset 0 2px 0 0 #C2185B;background:#FFFAFC':null]"
    scope="col"
  >
    <v-icon v-if="icon || !modern" class="me-1" :size="modern ? 16 : undefined" :aria-hidden="modern ? 'true' : undefined">{{ icon }}</v-icon>
    <span> {{ title }}</span>

    <template v-if="styler[header]?.tooltip">
      <v-icon v-if="!modern" class="ms-1" size="12">info</v-icon>
      <v-tooltip
        :color="modern ? undefined : '#000'"
        :content-class="modern ? 'sd-modern-tooltip text-start' : 'bg-black text-start rounded-xl'"
        :location="modern ? 'top' : 'bottom'"
        :max-width="modern ? undefined : 420"
        :activator="modern ? undefined : 'parent'"
        :open-on-click="modern ? true : undefined"
        :open-on-focus="modern ? true : undefined"
      >
        <template v-if="modern" #activator="{ props }">
          <v-btn
            v-bind="props"
            class="sd-modern-icon-button sd-modern-info-button b-spreadsheet-header-column__help"
            variant="text"
            icon="info_outline"
            :aria-label="`${$t('global.commons.help')} · ${title}`"
          />
        </template>
        <div :class="modern ? undefined : 'py-2'">
          <span v-if="modern && styler[header].tooltip.title" class="sd-modern-tooltip__title">
            {{ styler[header].tooltip.title }}
          </span>
          <h3 v-else-if="styler[header].tooltip.title" class="mb-2">
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

    <small v-if="is_variant" :class="modern ? 'sd-modern-list-header b-spreadsheet-header-column__key' : 'd-block op-0-6 mt-1'">{{ header }}</small>
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
    modern: { type: Boolean, default: false },
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

<style scoped lang="scss">
.b-spreadsheet-header-column--modern {
  background: transparent;
  box-shadow: none;

  .b-spreadsheet-header-column__help { margin-inline-start: 4px; }
  .b-spreadsheet-header-column__key { display: block; margin-block-start: 4px; }
}
</style>
