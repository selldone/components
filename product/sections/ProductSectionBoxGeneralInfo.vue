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
  <div class="px-2 mb-4 d-flex flex-grow-0">
    <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Type ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->
    <div class="flex-grow-0 flex-sm-grow-1 pe-1">
      <!-- <span class="hide-on-small-900 me-1">{{ $t("product_info.type") }}:</span>-->
      <img
        :src="getProductTypeImage(product.type)"
        class="m-1 me-2"
        height="16"
        width="16"
      />
      <span class="d-none d-sm-inline-block">{{
        getProductTypeName(product.type)
      }}</span>
    </div>

    <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Brand ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

    <div v-if="product.brand" class="flex-grow-1 pe-1" style="max-width: 50%">
      <!--<span class="hide-on-small-900 me-1">{{ $t("product_info.brand") }}:</span>-->
      <component
        :is="!window.ExternalWidget ? 'router-link' : 'a'"
        :title="$t('product_info.brand')"
        :to="{
          name: 'ShopPage',
          query: { search: product.brand },
        }"
        class="link-underlined single-line d-inline-block"
        v-bind="
          window.ExternalWidget
            ? {
                href: getShopPageLink({
                  search: product.brand,
                }),
                target: '_blank',
              }
            : {}
        "
        >{{ product.brand }}
      </component>
    </div>

    <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Category ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

    <v-tooltip
      v-if="product.category"
      :disabled="!product.category.description"
      class="flex-grow-1"
      color="#111"
      location="bottom"
      max-width="460px"
    >
      <template v-slot:activator="{ props }">
        <div class="mx-3 single-line" v-bind="props">
          <!--  <span class="hide-on-small-900 me-1">{{ $t("product_info.category") }}:</span>-->
          <circle-image
            v-if="product.category.icon"
            :size="20"
            :src="getShopImagePath(product.category.icon, 128)"
            scale-on-hover
          />

          <component
            :is="!window.ExternalWidget ? 'router-link' : 'a'"
            :to="
              !window.ExternalWidget
                ? {
                    name: window.$storefront.routes.SHOP_CATEGORY_PAGE,
                    params: {
                      category_name: product.category.name,
                    },
                  }
                : undefined
            "
            class="mx-1 link-underlined"
            v-bind="
              window.ExternalWidget
                ? {
                    href: getCategoryLink(shop, product.category.name),
                    target: '_blank',
                  }
                : {}
            "
          >
            {{ product.category.title }}
          </component>
        </div>
      </template>
      <v-icon class="mx-2" dark size="small"> info</v-icon>
      <span>{{ product.category.description }}</span>
    </v-tooltip>
  </div>
</template>

<script>
import CircleImage from "@components/ui/image/CircleImage.vue";

export default {
  name: "ProductSectionBoxGeneralInfo",
  data: () => ({}),
  computed: {},
  components: { CircleImage },
  props: {
    shop: {
      required: true,
      type: Object,
    },
    product: {
      required: true,
      type: Object,
    },
  },
};
</script>

<style lang="scss" scoped>
.link-underlined {
  color: #1ca2bd !important;

  border-bottom: 2px dotted #1ca2bd;
  padding-bottom: 2px;

  :hover {
  }
}
</style>
