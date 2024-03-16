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
  <div>
    <div v-if="products.length === 0">
      <v-icon class="m-3" size="64"> change_history</v-icon>
      <p class="text-muted">
        {{ $t("product_comparison.list.no_data") }}
      </p>
    </div>

    <div v-show="products.length" class="price-table">
      <ul v-if="compact_mode" style="overflow-x: auto">
        <li
          v-for="(product, i) in products"
          :key="product.key"
          :class="{ active: selected_index === i }"
          class="min-width-150"
          @click="showIndex(i)"
        >
          <button class="button-header">
            <v-img
              :aspect-ratio="1"
              :src="getShopImagePath(product.icon, IMAGE_SIZE_SMALL)"
              class="ma-auto"
              height="48px"
              style="border-radius: 12px"
              width="48px"
            />

            <span>{{ product.title?.limitWords(5) }}</span>
          </button>
        </li>
      </ul>

      <table>
        <thead v-if="!compact_mode">
          <tr>
            <th style="border: unset; background: #fff" />
            <th
              v-for="product in products"
              :key="product.key"
              class="c-header-top"
            >
              <v-img
                :aspect-ratio="1"
                :src="getShopImagePath(product.icon)"
                class="ma-auto pp z1"
                min-width="240px"
                style="border-radius: 18px"
                width="160px"
                @click="
                  () => {
                    goToProduct(product.id);
                    $emit('close');
                  }
                "
              />
            </th>
          </tr>

          <tr>
            <th style="border: unset; background: #fff" />
            <th
              v-for="product in shown_products"
              :key="product.key"
              class="c-header-bottom"
            >
              <div class="z1">
                <p :title="product.title" class="m-1">
                  {{ product.title?.limitWords(5) }}
                </p>
                <small :title="product.title_en">{{
                  product.title_en?.limitWords(8)
                }}</small>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="border: unset" />
            <td v-for="product in shown_products" :key="product.key">
              <v-btn
                v-if="canRemoveFromList"
                class="mx-1"
                color="#D32F2F"
                icon
                variant="text"
                size="small"
                @click="removeFromProductComparison(product, product.variant)"
              >
                <v-icon>close</v-icon>
                <v-tooltip activator="parent" location="bottom"
                  >Remove from list</v-tooltip
                >
              </v-btn>

              <v-btn
                class="mx-1"
                color="#444"
                icon
                variant="text"
                size="small"
                @click="
                  () => {
                    goToProduct(product.id);
                    $emit('close');
                  }
                "
              >
                <v-icon>search</v-icon>
                <v-tooltip activator="parent" location="bottom"
                  >Go to product
                  <v-avatar
                    v-if="product.icon"
                    class="avatar-gradient -thin -product ms-1"
                    size="24"
                  >
                    <v-img :src="getShopImagePath(product.icon, 64)"></v-img>
                  </v-avatar>
                </v-tooltip>
              </v-btn>
            </td>
          </tr>
          <tr v-if="USER()">
            <td style="border: unset" />
            <td v-for="product in shown_products" :key="product.key">
              <!--
        █████████████████████████████████████████████████████████████
        ―――――――――――――――――――――――― Buy Button ―――――――――――――――――――――――
        █████████████████████████████████████████████████████████████
        -->
              <s-shop-buy-button
                :can-buy="true"
                :current-variant="product.variant"
                :product="product"
                @start-buy-virtual="
                  $router.push({
                    name: window.$storefront.routes.PRODUCT_PAGE,
                    params: { product_id: product.id },
                  })
                "
              />
            </td>
          </tr>

          <tr>
            <td>{{ $t("product_comparison.list.price") }}</td>
            <td v-for="product in shown_products" :key="product.key">
              <span class="txt-l">
                <price-view
                  :amount="
                    CalcPriceProductCurrentCurrency(
                      getShop(),
                      product,
                      product.variant,
                    )
                  "
                ></price-view>
              </span>
            </td>
          </tr>

          <tr>
            <td>
              {{ $t("product_comparison.list.type") }}
            </td>
            <td v-for="product in shown_products" :key="product.key">
              <img
                :src="getProductTypeImage(product.type)"
                class="m-1"
                height="16px"
              />
              {{ getProductTypeName(product.type) }}
            </td>
          </tr>

          <tr>
            <td>
              {{ $t("product_comparison.list.brand") }}
            </td>
            <td v-for="product in shown_products" :key="product.key">
              {{ product.brand }}
            </td>
          </tr>

          <tr>
            <td>
              {{ $t("product_comparison.list.warranty") }}
            </td>
            <td v-for="product in shown_products" :key="product.key">
              <v-icon v-if="product.warranty" class="ms-2" color="#444">
                verified_user
              </v-icon>
              <span v-if="product.warranty">{{ product.warranty }}</span>
            </td>
          </tr>

          <tr>
            <td
              :colspan="compact_mode ? 2 : products.length + 1"
              class="c-header"
            >
              {{ $t("product_comparison.list.variants_comparison") }}
            </td>
          </tr>

          <tr v-if="hasVariant('color')">
            <td>
              {{ $t("global.variants.color") }}
            </td>
            <td v-for="product in shown_products" :key="product.key">
              <s-color-circle
                v-if="product.variant && product.variant.color"
                :color="product.variant.color"
                :size="14"
                class="me-1 hover-scale"
              >
              </s-color-circle>
            </td>
          </tr>

          <tr v-if="hasVariant('weight')">
            <td>
              {{ $t("global.variants.weight") }}
            </td>
            <td
              v-for="product in shown_products"
              :key="product.key"
              v-html="
                dictionarySpec(product.variant ? product.variant.weight : null)
              "
            />
          </tr>

          <tr v-if="hasVariant('volume')">
            <td>
              {{ $t("global.variants.volume") }}
            </td>
            <td
              v-for="product in shown_products"
              :key="product.key"
              v-html="
                dictionarySpec(product.variant ? product.variant.volume : null)
              "
            />
          </tr>

          <tr v-if="hasVariant('style')">
            <td>
              {{ $t("global.variants.style") }}
            </td>
            <td
              v-for="product in shown_products"
              :key="product.key"
              v-html="
                dictionarySpec(product.variant ? product.variant.style : null)
              "
            />
          </tr>

          <tr v-if="hasVariant('pack')">
            <td>
              {{ $t("global.variants.count_in_pack") }}
            </td>
            <td
              v-for="product in shown_products"
              :key="product.key"
              v-html="
                dictionarySpec(product.variant ? product.variant.pack : null)
              "
            />
          </tr>

          <tr v-if="hasVariant('type')">
            <td>
              {{ $t("global.variants.type") }}
            </td>
            <td
              v-for="product in shown_products"
              :key="product.key"
              v-html="
                dictionarySpec(product.variant ? product.variant.type : null)
              "
            />
          </tr>

          <tr>
            <td
              :colspan="compact_mode ? 2 : products.length + 1"
              class="c-header"
            >
              {{ $t("product_comparison.list.spec") }}
            </td>
          </tr>

          <tr v-for="sp in specs" :key="sp">
            <td>{{ sp }}</td>
            <td
              v-for="product in shown_products"
              :key="product.key"
              v-html="getSpecValue(product, sp)"
            />
          </tr>

          <tr>
            <td
              :colspan="compact_mode ? 2 : products.length + 1"
              class="c-header"
            >
              {{ $t("product_comparison.list.pros") }}
            </td>
          </tr>

          <tr>
            <td />

            <td
              v-for="product in shown_products"
              :key="product.key"
              class="vertical-align-top"
            >
              <p
                v-for="(pro, key) in product.pros"
                :key="product.key + key"
                class="text-start"
              >
                <v-icon class="vertical-align-middle" color="#aaa" size="12px">
                  fa:fas fa-plus
                </v-icon>
                {{ key }}: <b v-html="dictionarySpec(pro)" />
              </p>
            </td>
          </tr>

          <tr>
            <td
              :colspan="compact_mode ? 2 : products.length + 1"
              class="c-header"
            >
              {{ $t("product_comparison.list.cons") }}
            </td>
          </tr>

          <tr>
            <td />

            <td
              v-for="product in shown_products"
              :key="product.key"
              class="vertical-align-top"
            >
              <p
                v-for="(con, key) in product.cons"
                :key="product.key + key"
                class="text-start"
              >
                <v-icon class="vertical-align-middle" color="#aaa" size="12px">
                  fa:fas fa-minus
                </v-icon>

                {{ key }}: <b v-html="dictionarySpec(con)" />
              </p>
            </td>
          </tr>

          <tr>
            <td
              :colspan="compact_mode ? 2 : products.length + 1"
              class="c-header"
            >
              {{ $t("product_comparison.list.user_review") }}
            </td>
          </tr>

          <tr>
            <td>
              {{ $t("product_comparison.list.rating") }}
            </td>
            <td
              v-for="product in shown_products"
              :key="product.key"
              class="vertical-align-top"
            >
              <s-shop-product-rating-view
                v-if="product.ratings.length"
                :product="product"
              />
            </td>
          </tr>

          <tr>
            <td>
              {{ $t("product_comparison.list.rating_count") }}
            </td>
            <td v-for="product in shown_products" :key="product.key">
              {{ numeralFormat(product.rate_count, "0,0a") }}
            </td>
          </tr>
        </tbody>
      </table>

      <div class="p-2 mt-4">
        <p class="text-start">
          <i class="fas fa-circle text-success" />
          {{ $t("product_comparison.list.info") }}
        </p>

        <s-value-copy-box
          :image="getShopImagePath(getShop()?.icon, 128)"
          :message="$t('product_comparison.list.copy_action')"
          :value="comparison_link"
          class="my-5"
          small-width-mode
        >
        </s-value-copy-box>
      </div>
    </div>
  </div>
</template>

<script>
import SShopProductRatingView from "@components/storefront/product/rating/SShopProductRatingView.vue";
import SShopBuyButton from "@components/storefront/product/button/SShopBuyButton.vue";
import SColorCircle from "@components/ui/color/view/SColorCircle.vue";
import SValueCopyBox from "@components/ui/text/SValueCopyBox.vue";

/**
 * <s-comparison-list>
 */
export default {
  name: "SComparisonList",
  components: {
    SValueCopyBox,
    SColorCircle,
    SShopBuyButton,
    SShopProductRatingView,
  },

  props: {
    products: {
      required: true,
      type: Array,
    },

    canRemoveFromList: {
      required: false,
      type: Boolean,
      default: false,
    },
  },

  data: () => ({
    selected_index: 0,
  }),

  computed: {
    comparison_link() {
      let list = [];
      this.products.forEach((item) => {
        if (item.variant) list.push({ p: item.id, v: item.variant.id });
        else list.push({ p: item.id });
      });

      let list_simplify = JSON.stringify(list);
      // console.log("raw: "+list_simplify)

      list_simplify = list_simplify.replace(/{|}/g, "");
      list_simplify = list_simplify.replace(/"p":/g, "p");
      list_simplify = list_simplify.replace(/,"v":/g, "v");
      list_simplify = list_simplify.replace(/,/g, "_");
      list_simplify = list_simplify.replace("[", "");
      list_simplify = list_simplify.replace("]", "");

      //console.log("list_simplify: "+list_simplify)
      // console.log("encodeURIComponent: "+encodeURIComponent(list_simplify))

      let url = this.$router.resolve({
        name: window.$storefront.routes.COMPARISON_PAGE,
        params: {
          shop_name: this.shop_name,
        },
        query: {
          list: list_simplify,
        },
      }).href;
      let base_url = window.location.origin;
      if (!list.length) return null;
      return `${base_url}${url}`;
    },

    products_count() {
      return this.products ? this.products.length : 0;
    },

    specs() {
      let out = [];
      this.products.forEach((product) => {
        if (!product.spec) return;

        if (Array.isArray(product.spec)) {
          //Old version
          product.spec.forEach((item) => {
            if (!item) return;
            if (!item.group) {
              const key_spec = item[0];
              //const value_spec=item[1];
              if (!out.includes(key_spec)) out.push(key_spec);
            }
          });
        } else {
          // New version
          for (let key in product.spec) {
            let value = product.spec[key];

            if (Array.isArray(value)) {
              //Normal spec value
              if (!out.includes(key)) out.push(key);
            } else {
              // Special item like: Group
              if (value === "group") {
                //Nop!
              }
            }
          }
        }
      });

      return out;
    },

    compact_mode() {
      return this.$vuetify.display.smAndDown;
    },

    shown_products() {
      if (!this.compact_mode) return this.products;

      return this.products && this.products[this.selected_index]
        ? [this.products[this.selected_index]]
        : [];
    },
  },

  watch: {
    compact_mode(compact_mode) {
      if (compact_mode) {
        this.showIndex(0);
      }
    },
  },

  mounted() {},
  methods: {
    showIndex(index) {
      this.selected_index = index;
    },

    hasVariant(key) {
      if (!this.products) return false;
      return this.products.some((product) => {
        return product.variant && product.variant[key];
      });
    },

    quantityOfProduct(product, variant) {
      if (variant) return variant.quantity;
      return product ? product.quantity : 0;
    },

    getSpecValue(product, key) {
      if (!product.spec) return this.dictionarySpec("-");

      let out = null;
      if (Array.isArray(product.spec)) {
        //Old version
        let find = product.spec.find((item) => {
          if (!item.group) {
            return item[0] === key;
          }
        });
        out = find ? find[1] : "-";
      } else {
        // New version
        out = product.spec[key];
      }

      let html_out = "";

      if (Array.isArray(out)) {
        out.forEach((item) => {
          html_out += `<p class="m-0">${this.dictionarySpec(item)}</p>`;
        });
      } else {
        html_out = this.dictionarySpec(out);
      }

      return html_out;
    },

    dictionarySpec(val) {
      if (!val) return `<small>-</small>`;
      else if (
        [false, "false"].includes(val) ||
        this.$t("product_comparison.list.cross_list").includes(val)
      )
        return `<span class="text-danger">✖</span>`;
      else if (
        [true, "true"].includes(val) ||
        this.$t("product_comparison.list.check_list").includes(val)
      )
        return `<span class="text-success">✔</span>`;

      return val;
    },
  },
};
</script>

<style lang="scss" scoped>
.price-table {
  max-width: 1380px;
  margin: 12px auto 0 auto;
  padding-bottom: 120px;
  @media only screen and (max-width: 1380px) {
    overflow: auto;
  }

  ul {
    display: flex;
    top: 0px;
    z-index: 10;
    padding: 0 0 14px;

    li {
      list-style: none;
      flex: 1;
      padding: 4px;
    }

    li.active .button-header {
      background: #f5f5f5;
      color: #000;
    }

    .button-header {
      width: 100%;
      border: 1px solid #ddd;
      padding: 10px;
      background: #fff;
      font-size: 12px;
      font-weight: bold;
      min-height: 100%;
      border-radius: 10px;

      color: #999;

      span {
        height: 80px;
        line-height: 16px;
        overflow: hidden;
      }
    }
  }

  table {
    border-collapse: collapse;
    table-layout: fixed;
    width: auto;
    min-width: 100%;
  }

  td {
    height: 53px;
    border: 1px solid #ddd;
    padding: 10px;
    empty-cells: show;
  }

  .c-header-top,
  .c-header-bottom {
    position: relative;
    border: unset !important;
    padding: 16px;

    &:before {
      position: absolute;
      content: "";
      left: 4px;
      right: 4px;
      top: 0;
      bottom: 0;
      background: #fafafa;
    }
  }

  .c-header-top {
    &:before {
      border-radius: 16px 16px 0 0;
    }
  }

  .c-header-bottom {
    padding-bottom: 24px !important;

    &:before {
      bottom: 12px;
      border-radius: 0 0 16px 16px;
      padding-bottom: 12px;
    }
  }

  td,
  th {
    text-align: start;
  }

  td + td,
  th + th {
    text-align: center;
  }

  td.default {
    display: table-cell;
  }

  .txt-l {
    font-size: 28px;
    font-weight: bold;
  }

  .txt-top {
    position: relative;
    top: -9px;
    left: -2px;
  }

  .tick {
    font-size: 18px;
    color: #2ca01c;
  }

  .c-header {
    font-weight: 800;
    border-left: unset;
    border-right: unset;
  }
}

.vertical-align-middle {
  vertical-align: middle;
}

.vertical-align-top {
  vertical-align: top;
}
</style>
