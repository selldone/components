<template>
  <div class="px-2 mb-4 d-flex flex-grow-0">

    <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Type ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->
    <div class="flex-grow-0 flex-sm-grow-1 pe-1">
      <!-- <span class="hide-on-small-900 me-1">{{ $t("product_info.type") }}:</span>-->
      <img
        :src="getProductTypeImage(product.type)"
        height="16"
        width="16"
        class="m-1 me-2"
      />
      <span class="d-none d-sm-inline-block">{{ getProductTypeName(product.type) }}</span>

    </div>


    <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Brand ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

    <div v-if="product.brand" class="flex-grow-1 pe-1"  style="max-width: 50%"
      ><!--<span class="hide-on-small-900 me-1">{{ $t("product_info.brand") }}:</span>-->
      <component
        :is="!window.ExternalWidget ? 'router-link' : 'a'"
        :to="{
          name: 'ShopPage',
          query: { search: product.brand },
        }"
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
        class="link-underlined single-line d-inline-block"

        :title="$t('product_info.brand')"
        >{{ product.brand }}</component
      >
    </div>

    <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Category ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

    <v-tooltip
      v-if="product.category"
      bottom
      max-width="460px"
      class="flex-grow-1"
      color="#111"
      :disabled="!product.category.description"
    >
      <template v-slot:activator="{ on }">
        <div class="mx-3 single-line" v-on="on">
          <!--  <span class="hide-on-small-900 me-1">{{ $t("product_info.category") }}:</span>-->
          <circle-image
            v-if="product.category.icon"
            :src="getShopImagePath(product.category.icon, 128)"
            :size="20"
            scale-on-hover
          />

          <component
            :is="!window.ExternalWidget ? 'router-link' : 'a'"
            :to="
              !window.ExternalWidget
                ? {
                    name: 'ShopCategoryPage',
                    params: {
                      category_name: product.category.name,
                    },
                  }
                : undefined
            "
            v-bind="
              window.ExternalWidget
                ? {
                    href: getCategoryLink(shop,product.category.name),
                    target: '_blank',
                  }
                : {}
            "
            class="mx-1 link-underlined"
          >
            {{ product.category.title }}
          </component>
        </div>
      </template>
      <v-icon small dark class="mx-2"> info </v-icon>
      <span>{{ product.category.description }}</span>
    </v-tooltip>
  </div>
</template>

<script>
import CircleImage from "@/Components/ui/image/CircleImage.vue";
export default {
  name: "ProductSectionBoxGeneralInfo",
  components: { CircleImage },
  props: {
    shop:{
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

<style scoped lang="scss">
.link-underlined {
  color: #1ca2bd !important;

  border-bottom: 2px dotted #1ca2bd;
  padding-bottom: 2px;

  :hover {
  }
}
</style>
