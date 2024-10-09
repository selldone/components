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
  <div v-if="spec_array && Object.keys(spec_array).length" class="px-1 px-sm-3">
    <u-product-spec-table class="s--product-spec" :spec="spec_array" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import UProductSpecTable from "@selldone/components-vue/ui/product/spec/table/UProductSpecTable.vue";
import { SpecHelper } from "@selldone/core-js/helper";

export default defineComponent({
  name: "SProductSpec",
  components: { UProductSpecTable },
  inject: ["$product"],

  data() {
    return {};
  },

  computed: {
    spec_array() {
      if (Array.isArray(this.$product.spec)) return this.$product.spec;
      //Old version:
      else
        return SpecHelper.CONVERT_SPEC_JSON_TO_ARRAY(
          this.$product.spec,
          this.$product.spec_order,
        );
    },
  },
});
</script>

<style scoped lang="scss">
.s--product-spec {
  text-align: start;
  background: #e5e5e5;
  border-radius: 12px;
  padding: 16px;
}
</style>
