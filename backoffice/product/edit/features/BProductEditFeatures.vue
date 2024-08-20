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

<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
  <div>
    <!-- ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄ Rating Fields ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄ -->
    <b-product-rating-input :product="product" class="my-5" :class="{disabled:IS_VENDOR_PANEL}">
    </b-product-rating-input>

    <!-- ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄ Pros ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄ -->
    <b-product-pros-input :product="product" class="mb-5" :class="{disabled:IS_VENDOR_PANEL}">
    </b-product-pros-input>

    <!-- ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄ Cons ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄ -->
    <b-product-cons-input :product="product" class="mb-5" :class="{disabled:IS_VENDOR_PANEL}">
    </b-product-cons-input>

    <!-- ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄ Badges ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄ -->
    <b-product-badges-manage :product="product"></b-product-badges-manage>

    <!-- ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄ Tags ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄ -->
    <b-product-tags-input :product="product"></b-product-tags-input>

    <s-widget-buttons auto-fixed-position class="mb-5 mt-12">
      <v-btn
        color="primary"
        size="x-large"
        variant="elevated"
        @click="$emit('next')"
      >
        {{ $t("global.actions.continue") }}

        <v-icon class="ms-2" size="small">
          {{ $t("icons.arrow_end") }}
        </v-icon>
      </v-btn>
    </s-widget-buttons>
  </div>
</template>

<script>
import BProductBadgesManage from "../../../product/badges/manage/BProductBadgesManage.vue";
import BProductTagsInput from "../../../product/tags/input/BProductTagsInput.vue";
import BProductRatingInput from "../../../product/rating/input/BProductRatingInput.vue";
import BProductProsInput from "../../../product/pros/input/BProductProsInput.vue";
import BProductConsInput from "../../../product/cons/input/BProductConsInput.vue";
import SWidgetButtons from "../../../../ui/widget/buttons/SWidgetButtons.vue";

export default {
  name: "BProductEditFeatures",
  components: {
    SWidgetButtons,
    BProductConsInput,
    BProductProsInput,
    BProductRatingInput,
    BProductTagsInput,
    BProductBadgesManage,
  },
  props: {
    product: {
      required: true,
      type: Object,
    },
  },

  data: () => ({
    tags: null,
  }),

  computed: {
    IS_VENDOR_PANEL() {
      /*🟢 Vendor Panel 🟢*/
      return (
        this.$route.params.vendor_id &&
        this.$route.matched.some((record) => record.meta.vendor)
      );
    },
  },

  methods: {},
  created() {},
};
</script>

<style lang="scss" scoped></style>
