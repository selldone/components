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
  <div :class="{ 'simple-mode': simpleMode, 'products-box': !borderLess }">
    <div class="text-start p-1 mb-2">
      <p v-if="label" class="label-field mx-2 my-0">{{ label }}</p>
      <div
        v-if="messages"
        class="mx-2 font-weight-normal"
        v-text="messages"
      ></div>
    </div>

    <!-- ==================== Categories ==================== -->

    <div
      v-if="categories_detail.length && !busy_fetch"
      class="px-1 thin-scroll -cat-box"
      style="max-height: 480px; overflow-y: auto"
    >
      <b v-if="!simpleMode" class="mx-2"
        >{{ $t("global.commons.categories") }}:</b
      >
      <v-list
        class="border-between-vertical"
        lines="two"
        bg-color="transparent"
      >
        <v-list-item v-for="category in categories_detail" :key="category.id">
          <template v-slot:prepend>
            <v-avatar rounded="lg">
              <v-img
                :src="getShopImagePath(category.icon, IMAGE_SIZE_SMALL)"
                class="-cat"
              ></v-img>
            </v-avatar>
          </template>

          <v-list-item-title
            ><b>{{ category.title?.limitWords(7) }}</b>
          </v-list-item-title>
          <v-list-item-subtitle v-if="category.description"
            >{{ category.description?.limitWords(20) }}
          </v-list-item-subtitle>

          <template v-slot:append>
            <v-list-item-action>
              <v-btn
                icon
                size="40"
                @click.stop="deleteCategory(category.id)"
                variant="text"
              >
                <v-icon size="22">close</v-icon>
              </v-btn>
            </v-list-item-action>
          </template>
        </v-list-item>
      </v-list>
    </div>

    <!-- ==================== Products ==================== -->

    <div
      v-if="products_detail.length && !busy_fetch"
      class="px-1 thin-scroll -prod-box"
      style="max-height: 480px; overflow-y: auto"
    >
      <b v-if="!simpleMode" class="mx-2"
        >{{ $t("global.commons.products") }}:</b
      >

      <v-list
        v-model:opened="open"
        :class="{ 'no-action': singleProductSelect }"
        bg-color="transparent"
        class="border-between-vertical text-start"
        lines="two"
      >
        <v-list-group
          v-for="product in products_detail"
          :key="product.id"
          :append-icon="
            product.product_variants.length ? 'keyboard_arrow_down' : ' '
          "
          :value="product.id"

        >
          <template v-slot:activator="{ props, isOpen }">
            <v-list-item  v-bind="props">
              <template v-slot:prepend>
                <v-avatar rounded="lg">
                  <v-img
                    :src="getShopImagePath(product.icon, IMAGE_SIZE_SMALL)"
                  ></v-img>
                </v-avatar>
              </template>

              <v-list-item-title
                ><b>{{ product.title?.limitWords(7) }}</b>
              </v-list-item-title>

              <v-list-item-subtitle class="d-flex"
                ><span v-if="product.sku" class="w-50"
                  >SKU: {{ product.sku }}
                </span>
                <span v-if="product.mpn" class="w-50"
                  >MPN: {{ product.mpn }}
                </span>
              </v-list-item-subtitle>

              <product-variants-view
                :variants="product.product_variants"
                center
                dense
                small
                :limit="6"
              />

              <template v-slot:append>
                <v-list-item-action end>
                  <v-icon
                    v-if="product.product_variants?.length"
                    :class="{ 'rotate-180': isOpen }"
                    class="mx-1"
                  >
                    expand_more
                  </v-icon>
                  <v-btn
                    icon
                    variant="text"
                    @click.stop="deleteProduct(product.id)"
                  >
                    <v-icon>close</v-icon>
                  </v-btn>
                </v-list-item-action>
              </template>
            </v-list-item>
          </template>

          <template v-if="!singleProductSelect">
            <div
              v-for="variant in product.product_variants"
              :key="'var_' + variant.id" class="pa-1"
            >
              <variant-item-mini
                :class="{ pen: forceNoVariants }"
                :product-variant="variant"
                :selected="
                  !forceNoVariants &&
                  modelValue[product.id].includes(variant.id)
                "
                @select="toggleVariant(product.id, variant.id)"
              ></variant-item-mini>
            </div>
          </template>

          <template v-if="singleProductVariantSelect">
            <v-list-item
              v-for="variant in product.product_variants"
              :key="'var_' + variant.id"
            >
              <variant-item-mini
                :product-variant="variant"
                :selected="variantId === variant.id"
                @select="
                  $emit('update:variantId', variantId ? null : variant.id)
                "
              ></variant-item-mini>
            </v-list-item>
          </template>
        </v-list-group>
      </v-list>
    </div>

    <div v-if="busy_fetch" class="text-center">
      <s-loading css-mode light></s-loading>
    </div>

    <div
      v-else-if="noData && !categories_detail.length && !products_detail.length"
    >
      {{ noData }}
    </div>

    <div class="products-box-add row-hover" @click.stop="dialog = true">
      <div class="center-absolute text-center">
        <v-icon size="large">fa:fas fa-plus</v-icon>
        <div>
          <slot></slot>
        </div>
      </div>

      <!-- ████████████████████ Select product / category dialog ████████████████████ -->

      <v-dialog
        v-model="dialog"
        fullscreen
        scrollable
        transition="dialog-bottom-transition"
      >
        <v-card>
          <v-card-title class="d-flex align-center">
            <v-icon class="me-2">view_comfy</v-icon>
            Select products & Categories
          </v-card-title>

          <v-card-text>
            <b-products-window
              v-if="dialog"
              class="mx-auto"
              style="max-width: 1720px"
              :can-select-category="!singleProductSelect && !productsOnly"
              :selected-list="modelValue ? modelValue : []"
              :shop="shop"
              dialog-mode
              select-mode
              withFullVariant
              @select="selectProduct"
              @select-category="selectCategory"
            />
          </v-card-text>

          <v-divider></v-divider>

          <v-card-actions>
            <div class="widget-buttons">
              <v-btn size="x-large" variant="text" @click="dialog = false">
                <v-icon start>close</v-icon>

                {{ $t("global.actions.close") }}
              </v-btn>
            </div>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
  </div>
</template>

<script>
import BProductsWindow from "@components/backoffice/product/window/BProductsWindow.vue";
import VariantItemMini from "@components/product/variant/VariantItemMini.vue";
import ProductVariantsView from "../../../product/variant/ProductVariantsView.vue";
import SLoading from "@components/ui/loading/SLoading.vue";

export default {
  name: "BProductsSelectBox",
  components: {
    SLoading,
    ProductVariantsView,
    VariantItemMini,
    BProductsWindow,
  },
  emits: ["update:modelValue", "change", "update:variantId"],
  props: {
    modelValue: {},
    shop: {
      require: true,
      type: Object,
    },
    label: {},
    noData: {},
    messages: {},
    singleProductSelect: {
      type: Boolean,
    },
    productsOnly: {
      type: Boolean,
      default: false,
    },
    forceNoVariants: {
      // User can not select or deselect variants!
      type: Boolean,
      default: false,
    },
    //----------------------------------

    variantId: {},
    singleProductVariantSelect: {
      type: Boolean,
      default: false,
    },
    //----------------------------------

    simpleMode: {
      type: Boolean,
      default: false,
    },
    autoOpenDialog: {
      type: Boolean,
      default: false,
    },

    borderLess: {
      type: Boolean,
      default: false,
    },
  },
  data: () => ({
    open: [],

    dialog: false,

    products_detail: [],
    categories_detail: [],

    busy_fetch: false,

    value_local: null, // keep value updated by this component to prevent re-fetch!
  }),

  computed: {
    product_ids_list() {
      if (this.singleProductSelect)
        return this.modelValue ? [this.modelValue] : [];
      return Object.keys(this.modelValue).filter(
        (item) => !item.startsWith("c-"),
      );
    },

    category_ids_list() {
      if (this.singleProductSelect) return [];
      return Object.keys(this.modelValue)
        .filter((item) => item.startsWith("c-"))
        .map((item) => item.replace("c-", ""));
    },
  },
  watch: {
    modelValue(value) {
      if (value === this.value_local) return; // The value change by this component!
      console.log("CHANGE!", value);
      this.resetToDefault(); // 🞇 Reset to default

      this.value_local = this.modelValue;
      this.fetchProductsList();
      this.fetchCategoriesList();
    },
  },
  created() {
    this.value_local = this.modelValue;

    this.fetchProductsList();
    this.fetchCategoriesList();

    if (this.autoOpenDialog && !this.modelValue) this.dialog = true;
  },
  methods: {
    updateValue(value) {
      this.value_local = value;
      this.$emit("update:modelValue", value);
    },

    selectProduct(product_selected) {
      // console.log("selectProduct", product_selected);

      if (this.singleProductSelect) {
        this.products_detail = [product_selected];
        this.updateValue(product_selected.id);
        this.dialog = false;
        return;
      }

      let obj = Object.assign({}, this.modelValue); // Reset to default!

      //console.log('=========>',obj)
      if (!this.modelValue[product_selected.id]) {
        obj["" + product_selected.id] = product_selected.product_variants.map(
          (a) => a.id,
        );
        this.AddOrUpdateItemByID(this.products_detail, product_selected);
      } else {
        // Toggle!
        delete obj["" + product_selected.id];
        this.DeleteItemByID(this.products_detail, product_selected.id);
      }

      this.updateValue(obj);
      this.$emit("change");
    },

    selectCategory(category_selected) {
      if (this.singleProductSelect) {
        return;
      }
      //console.log("category_selected", category_selected);
      let obj = Object.assign({}, this.modelValue); // Reset to default!

      if (!this.modelValue["c-" + category_selected.id]) {
        obj["c-" + category_selected.id] = {};
        this.AddOrUpdateItemByID(this.categories_detail, category_selected);
      } else {
        // Toggle!
        delete obj["c-" + category_selected.id];
        this.DeleteItemByID(this.categories_detail, category_selected.id);
      }
      //console.log("this.value", this.value);

      this.updateValue(obj);

      this.$emit("change");
    },

    deleteCategory(category_id) {
      this.DeleteItemByID(this.categories_detail, category_id);

      if (this.singleProductSelect) {
        this.updateValue(null);
      } else {
        delete this.modelValue["c-" + category_id];
        this.updateValue(Object.assign({}, this.modelValue));
      }
      this.$emit("change");
    },
    deleteProduct(product_id) {
      this.DeleteItemByID(this.products_detail, product_id);

      if (this.singleProductSelect) {
        this.updateValue(null);
      } else {
        delete this.modelValue[product_id];
        this.updateValue(Object.assign({}, this.modelValue));
      }
      this.$emit("change");
    },

    toggleVariant(product_id, variant_id) {
      if (this.forceNoVariants) return;
      // console.log('=====>',this.value[product_id])

      let obj = Object.assign({}, this.modelValue); // Reset to default!
      const index = obj[product_id].indexOf(variant_id);
      if (index >= 0) {
        obj[product_id].splice(index, 1);
      } else {
        obj[product_id].push(variant_id);
      }

      this.updateValue(this.modelValue);
      this.$emit("change");
    },

    fetchProductsList() {
      if (
        !this.singleProductSelect &&
        (!this.modelValue || Array.isArray(this.modelValue))
      )
        return this.updateValue({});

      // console.log('=========>',product_ids_list)

      if (!this.product_ids_list.length) {
        return;
      }

      if (!window.___CACHED_LOADED_PRDUCTS_LIST_1)
        window.___CACHED_LOADED_PRDUCTS_LIST_1 = {}; // Keep products prevent over loading!
      if (
        !this.product_ids_list.some(
          (id) => !window.___CACHED_LOADED_PRDUCTS_LIST_1["" + id],
        )
      ) {
        // All ids exists!
        this.products_detail = [];
        this.product_ids_list.forEach((id) => {
          this.products_detail.push(___CACHED_LOADED_PRDUCTS_LIST_1["" + id]);
        });
        return;
      }

      this.busy_fetch = true;

      axios
        .get(
          window.API.GET_ALL_MY_PRODUCTS_LIST_BY_PARAMS(
            this.$route.params.shop_id,
          ),
          {
            params: {
              params: ["title", "icon", "sku", "mpn", "quantity"],
              list: this.product_ids_list,
            },
          },
        )
        .then(({ data }) => {
          this.products_detail = data.products;
          data.products.forEach((p) => {
            window.___CACHED_LOADED_PRDUCTS_LIST_1["" + p.id] = p;
          });
        })
        .catch((error) => {})
        .finally(() => {
          this.busy_fetch = false;
        });
    },

    fetchCategoriesList() {
      if (
        !this.singleProductSelect &&
        (!this.modelValue || Array.isArray(this.modelValue))
      )
        return this.updateValue({});

      if (!this.category_ids_list.length) {
        return;
      }

      this.busy_fetch = true;

      axios
        .get(
          window.API.GET_ALL_MY_CATEGORIES_LIST_BY_PARAMS(
            this.$route.params.shop_id,
          ),
          {
            params: {
              params: ["title", "description", "icon"],
              list: this.category_ids_list,
            },
          },
        )
        .then(({ data }) => {
          this.categories_detail = data.categories;
        })
        .catch((error) => {})
        .finally(() => {
          this.busy_fetch = false;
        });
    },
  },
};
</script>

<style lang="scss" scoped>
.label-field {
  font-size: 12px;
  font-weight: 500;
}

.products-box {
  position: relative;
  border: #aaa solid 1px;
  border-radius: 8px;

  &.simple-mode {
    border: none !important;
  }
}

.products-box-add {
  position: relative;
  border: #aaa dashed 1px;
  border-radius: 8px;
  margin: 12px;
  min-height: 84px;
}

.-cat {
  border: #ffa000 solid 2px;
  background: #ffa000;
  border-radius: inherit;
}

.-cat-box {
  border-left: #ffa000 solid 3px;
}

.v-application--is-rtl {
  .-cat-box {
    border-left: unset;
    border-right: #ffa000 solid 3px;
  }

  .-prod-box {
    border-left: unset;
    border-right: #673ab7 solid 3px;
  }
}

.-prod-box {
  border-left: #673ab7 solid 3px;
}
</style>

<style lang="scss">
.no-action {
  .v-list-group {
    .v-list-group__header__append-icon {
      display: none;
    }
  }
}
</style>
