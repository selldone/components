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
  <div
    v-bind="$attrs"
    class="b-product-dropshipping-catalog sd-modern-content text-start"
  >
    <header class="sd-modern-header b-product-dropshipping-catalog__heading">
      <div>
        <h1 class="sd-modern-title-text">{{ $t(copy + "title") }}</h1>
        <p class="sd-modern-subtitle">{{ $t(copy + "subtitle") }}</p>
      </div>
    </header>
    <section
      class="sd-modern-widget b-product-dropshipping-catalog__list"
      :aria-busy="busy_fetch"
      :aria-label="$t(copy + 'title')"
    >
      <div
        class="sd-modern-list-toolbar b-product-dropshipping-catalog__toolbar"
      >
        <div class="b-product-dropshipping-catalog__breadcrumb">
          <v-btn
            class="sd-modern-button sd-modern-button--compact sd-modern-button--inline"
            color="primary"
            variant="text"
            @click="$emit('back')"
          >
            <v-icon size="17" aria-hidden="true">{{
              $t("icons.chevron_back")
            }}</v-icon>
            {{ $t(copy + "back") }}
          </v-btn>
          <span class="b-product-dropshipping-catalog__supplier">
            <v-avatar size="24"
              ><v-img
                v-if="wholesalerShop.icon"
                :src="getShopImagePath(wholesalerShop.icon, 64)"
              /><v-icon v-else size="18" aria-hidden="true"
                >storefront</v-icon
              ></v-avatar
            >
            {{ wholesalerShop.title }}
          </span>
        </div>
        <v-text-field
          v-model="search_in_shop"
          :placeholder="$t(copy + 'search')"
          :aria-label="$t(copy + 'search')"
          class="b-product-dropshipping-catalog__search"
          clearable
          hide-details
          prepend-inner-icon="search"
          single-line
          variant="plain"
        />
        <v-select
          :model-value="productSortKey"
          :items="productSortOptions"
          :aria-label="$t(copy + 'sort_label')"
          class="b-product-dropshipping-catalog__sort"
          variant="plain"
          hide-details
          :menu-props="{ contentClass: 'sd-modern-select-menu' }"
          @update:model-value="changeProductSort"
        />
        <v-tooltip content-class="sd-modern-tooltip" location="top">
          <template #activator="{ props }">
            <v-btn
              v-bind="props"
              class="sd-modern-icon-button"
              icon
              variant="text"
              :aria-label="$t(copy + 'reverse_sort')"
              @click="
                sortBy = [
                  {
                    key: sortBy[0]?.key,
                    order: sortBy[0]?.order === 'asc' ? 'desc' : 'asc',
                  },
                ]
              "
              ><v-icon size="17" aria-hidden="true">{{
                sortBy[0]?.order === "asc" ? "arrow_upward" : "arrow_downward"
              }}</v-icon></v-btn
            >
          </template>
          {{ $t(copy + "reverse_sort") }}
        </v-tooltip>
      </div>
      <v-data-table-server
        v-model:page="page"
        v-model:sort-by="sortBy"
        :mobile="$vuetify.display.width < 960"
        :hide-default-header="$vuetify.display.width < 960"
        :header-props="{ sortByText: $t('global.commons.sort_by') }"
        :headers="headers"
        :items="products"
        :items-length="total_products"
        :items-per-page="itemsPerPage"
        :loading="busy_fetch"
        :loading-text="$t('global.commons.waiting_load_data')"
        :row-props="() => ({ class: 'row-hover' })"
        class="sd-modern-data-table b-product-dropshipping-catalog__table"
        density="compact"
        hide-default-footer
        item-value="id"
        @click:row="(_, row) => showAddProduct(row.item)"
      >
        <template #item.title="{ item }">
          <div class="b-product-dropshipping-catalog__identity">
            <u-avatar-folder
              :src="getShopImagePath(item.icon, 128)"
              :is-gray="!item.added_product_id"
              :is-green="!!item.added_product_id"
              :size="38"
              :border-size="0"
              hide-side-icon
            />
            <div class="b-product-dropshipping-catalog__identity-copy">
              <button
                type="button"
                class="b-product-dropshipping-catalog__name"
                @click.stop="showAddProduct(item)"
              >
                {{ item.title }}
              </button>
              <p
                v-if="item.title_en"
                class="b-product-dropshipping-catalog__secondary"
              >
                {{ item.title_en }}
              </p>
              <router-link
                v-if="item.added_product_id"
                :to="{
                  name: 'BPageProductDashboard',
                  params: { product_id: item.added_product_id },
                }"
                class="b-product-dropshipping-catalog__added"
                target="_blank"
                rel="noopener noreferrer"
                :aria-label="$t(copy + 'open_admin')"
                @click.stop
              >
                <span
                  class="sd-modern-status__dot sd-modern-status__dot--success"
                  aria-hidden="true"
                />
                {{ $t(copy + "added") }}
                <v-icon size="13" aria-hidden="true">north_east</v-icon>
              </router-link>
            </div>
          </div>
        </template>
        <template #item.variants="{ item }">
          <product-variants-view
            v-if="item.variants?.length"
            :variants="item.variants"
            small
          />
          <span v-else class="b-product-dropshipping-catalog__secondary">{{
            "—"
          }}</span>
        </template>
        <template #item.brand="{ item }"
          ><span>{{ item.brand || "—" }}</span></template
        >
        <template #item.sku="{ item }">
          <button
            v-if="item.sku"
            v-copy
            type="button"
            class="b-product-dropshipping-catalog__copy"
            :aria-label="$t('global.actions.copy') + ': ' + item.sku"
            @click.stop
          >
            <bdi>{{ item.sku }}</bdi>
          </button>
          <span v-else class="b-product-dropshipping-catalog__secondary">{{
            "—"
          }}</span>
        </template>
        <template #item.price="{ item }"
          ><u-price :amount="item.price" :currency="item.currency"
        /></template>
        <template #item.commission="{ item }"
          ><u-price :amount="item.commission" :currency="item.currency"
        /></template>
        <template #item.quantity="{ item }">{{
          numeralFormat(item.quantity, "0.[0]a")
        }}</template>
        <template #item.action="{ item }">
          <div class="b-product-dropshipping-catalog__actions">
            <v-btn
              class="sd-modern-button sd-modern-button--compact sd-modern-button--inline"
              variant="text"
              color="primary"
              @click.stop="showAddProduct(item)"
              >{{ $t(copy + "review_product") }}</v-btn
            >
            <v-tooltip content-class="sd-modern-tooltip" location="top">
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  class="sd-modern-icon-button"
                  icon
                  variant="text"
                  :href="ShopURLs.GetProductLink(wholesalerShop, item.id)"
                  :aria-label="$t(copy + 'view_storefront')"
                  target="_blank"
                  rel="noopener noreferrer"
                  @click.stop
                  ><v-icon size="17" aria-hidden="true"
                    >north_east</v-icon
                  ></v-btn
                >
              </template>
              {{ $t(copy + "view_storefront") }}
            </v-tooltip>
          </div>
        </template>
        <template #no-data>
          <div
            class="sd-modern-empty-state b-product-dropshipping-catalog__empty"
          >
            <template v-if="busy_fetch">{{
              $t("global.commons.waiting_load_data")
            }}</template>
            <template v-else-if="fetch_error">
              <v-icon size="25" aria-hidden="true">cloud_off</v-icon>
              <h2>{{ $t(copy + "load_error") }}</h2>
              <v-btn
                class="sd-modern-button sd-modern-button--compact"
                color="primary"
                variant="text"
                @click="fetchProducts"
                >{{ $t(copy + "retry") }}</v-btn
              >
            </template>
            <template v-else>
              <v-icon size="25" aria-hidden="true">inventory_2</v-icon>
              <h2>{{ $t(copy + "empty_title") }}</h2>
              <p>{{ $t(copy + "empty_body") }}</p>
              <v-btn
                v-if="search_in_shop"
                class="sd-modern-button sd-modern-button--compact"
                color="primary"
                variant="text"
                @click="search_in_shop = null"
                >{{ $t(copy + "clear_search") }}</v-btn
              >
            </template>
          </div>
        </template>
        <template #bottom>
          <footer
            class="sd-modern-table-footer b-product-dropshipping-catalog__footer"
          >
            <span class="sd-modern-page-summary">{{
              $t(copy + "products_count", { count: total_products })
            }}</span>
            <v-pagination
              v-model="page"
              :length="pageCount"
              :total-visible="5"
              :disabled="busy_fetch || !total_products"
              class="sd-modern-pagination"
              density="comfortable"
              variant="text"
              rounded="lg"
            />
          </footer>
        </template>
      </v-data-table-server>
    </section>
  </div>

  <!-- ------------------------------ Add Product Dialog ----------------------------- -->
  <v-bottom-sheet
    v-model="show_add_dialog"
    scrollable
    max-width="100vw"
    width="760"
    :theme="USER()?.preferences?.dark ? 'dark' : undefined"
    content-class="rounded-b-0"
    :content-props="{ style: { borderRadius: '20px 20px 0 0' } }"
  >
    <v-card
      v-if="selected_product"
      class="b-product-dropshipping-review sd-modern-widget text-start"
      :aria-label="selected_product.title"
    >
      <v-card-title class="b-product-dropshipping-review__header">
        <div class="b-product-dropshipping-review__identity">
          <v-img
            :cover="!selected_product.style?.contain"
            :src="getShopImagePath(selected_product.icon, 128)"
            aspect-ratio="1"
            class="b-product-dropshipping-review__image"
            height="44"
            width="44"
            :alt="selected_product.title"
          />
          <div class="b-product-dropshipping-review__identity-copy">
            <h2>{{ selected_product.title }}</h2>
            <p
              v-if="selected_product.title_en"
              class="b-product-dropshipping-review__secondary-name"
            >
              {{ selected_product.title_en }}
            </p>
            <p>
              {{
                $t(reviewCopy + "subtitle", { supplier: wholesalerShop.title })
              }}
            </p>
          </div>
        </div>
        <v-tooltip content-class="sd-modern-tooltip" location="top">
          <template #activator="{ props }">
            <v-btn
              v-bind="props"
              class="sd-modern-icon-button"
              variant="text"
              icon="close"
              :aria-label="$t('global.actions.close')"
              @click="show_add_dialog = false"
            />
          </template>
          {{ $t("global.actions.close") }}
        </v-tooltip>
      </v-card-title>

      <v-card-text class="b-product-dropshipping-review__body thin-scroll">
        <div class="b-product-dropshipping-review__intro">
          <h3>{{ $t(reviewCopy + "title") }}</h3>
          <p>{{ $t(reviewCopy + "intro") }}</p>
        </div>

        <div class="b-product-dropshipping-review__variant">
          <v-select
            v-if="variants?.length"
            v-model="selected_variant"
            :items="variants"
            :item-title="reviewVariantTitle"
            item-value="id"
            return-object
            :label="$t(reviewCopy + 'variant')"
            :aria-label="$t(reviewCopy + 'variant')"
            class="sd-modern-underlined-field b-product-dropshipping-review__variant-select"
            variant="underlined"
            hide-details
            :menu-props="{
              contentClass:
                'sd-modern-select-menu b-product-dropshipping-review__variant-menu',
              maxWidth: 'calc(100vw - 32px)',
            }"
          >
            <template #selection="{ item }">
              <variant-item-mini
                :product-variant="item.raw"
                force-enable
                class="b-product-dropshipping-review__variant-value"
              />
            </template>
            <template #item="{ item, props }">
              <v-list-item v-bind="props" :title="undefined">
                <template #title>
                  <variant-item-mini
                    :product-variant="item.raw"
                    force-enable
                    class="b-product-dropshipping-review__variant-value"
                  />
                </template>
              </v-list-item>
            </template>
          </v-select>
          <p class="b-product-dropshipping-review__help">
            {{
              $t(
                reviewCopy +
                  (selected_variant?.pricing
                    ? "scope_variant"
                    : variants?.length
                      ? "scope_main"
                      : "scope_single"),
              )
            }}
          </p>
        </div>

        <section
          class="b-product-dropshipping-review__pricing"
          :aria-label="$t(reviewCopy + 'title')"
        >
          <div class="b-product-dropshipping-review__edit">
            <div class="b-product-dropshipping-review__section-heading">
              <h3>{{ $t(reviewCopy + "markup") }}</h3>
            </div>
            <u-price-input
              v-model="selected_product_variant_pricing.commission"
              :key="`${selected_variant?.pricing ? 'variant' : 'product'}-${selected_product_variant_pricing.id}`"
              :currency="selected_product.currency"
              :aria-label="$t(reviewCopy + 'markup')"
              :dark="!!USER()?.preferences?.dark"
              :suffix="selected_product.currency"
              class="sd-modern-underlined-field b-product-dropshipping-review__markup"
              variant="underlined"
              hide-details
            />
            <p class="b-product-dropshipping-review__help">
              {{ $t(reviewCopy + "markup_help") }}
            </p>
          </div>

          <div class="b-product-dropshipping-review__calculation">
            <div class="b-product-dropshipping-review__preview-heading">
              <span>{{ $t(reviewCopy + "customer_price") }}</span>
              <v-tooltip
                content-class="sd-modern-tooltip"
                location="top"
                :open-on-click="true"
              >
                <template #activator="{ props }">
                  <v-btn
                    v-bind="props"
                    class="sd-modern-icon-button sd-modern-info-button"
                    variant="text"
                    icon="info_outline"
                    :aria-label="$t(reviewCopy + 'customer_price')"
                  />
                </template>
                {{ $t(reviewCopy + "customer_price_help") }}
              </v-tooltip>
            </div>
            <div
              class="b-product-dropshipping-review__retail"
              aria-live="polite"
              aria-atomic="true"
            >
              <u-price
                :amount="net_price_without_commission + commission"
                :currency="selected_product.currency"
              />
            </div>
            <p class="b-product-dropshipping-review__help">
              {{ $t(reviewCopy + "excludes_shipping") }}
            </p>
            <dl class="b-product-dropshipping-review__breakdown">
              <div>
                <dt>{{ $t(reviewCopy + "before_discount") }}</dt>
                <dd>
                  <u-price
                    :amount="net_price_without_commission + discount"
                    :currency="selected_product.currency"
                  />
                </dd>
              </div>
              <div>
                <dt class="b-product-dropshipping-review__discount-label">
                  {{ $t(reviewCopy + "discount") }}
                  <v-tooltip
                    content-class="sd-modern-tooltip text-start"
                    location="top"
                    :open-on-click="true"
                  >
                    <template #activator="{ props }">
                      <v-btn
                        v-bind="props"
                        class="sd-modern-icon-button sd-modern-info-button"
                        variant="text"
                        icon="schedule"
                        :aria-label="$t(reviewCopy + 'discount_help')"
                      />
                    </template>
                    <u-time-progress-bar
                      class="b-product-dropshipping-review__schedule"
                      :created-time="created_at"
                      :end-time="dis_end"
                      :start-time="dis_start"
                      modern
                    />
                  </v-tooltip>
                </dt>
                <dd>
                  <u-price
                    :amount="-discount"
                    :currency="selected_product.currency"
                  />
                </dd>
              </div>
              <div class="b-product-dropshipping-review__supplier-line">
                <dt>{{ $t(reviewCopy + "supplier_after") }}</dt>
                <dd>
                  <u-price
                    :amount="net_price_without_commission"
                    :currency="selected_product.currency"
                  />
                </dd>
              </div>
              <div>
                <dt>{{ $t(reviewCopy + "markup") }}</dt>
                <dd>
                  <u-price
                    :amount="commission"
                    :currency="selected_product.currency"
                  />
                </dd>
              </div>
            </dl>
          </div>
        </section>

        <section
          class="b-product-dropshipping-review__destinations"
          :aria-label="$t(reviewCopy + 'shipping_title')"
        >
          <div class="b-product-dropshipping-review__section-heading">
            <h3>
              <v-icon size="18" aria-hidden="true">local_shipping</v-icon
              >{{ $t(reviewCopy + "shipping_title") }}
            </h3>
            <span class="b-product-dropshipping-review__help">{{
              $t(reviewCopy + "per_item", {
                currency: selected_product.currency,
              })
            }}</span>
          </div>
          <p class="b-product-dropshipping-review__help">
            {{ $t(reviewCopy + "shipping_help") }}
          </p>
          <v-table
            v-if="Object.keys(selected_product.shipping || {}).length"
            class="sd-modern-table b-product-dropshipping-review__shipping-table"
          >
            <thead>
              <tr>
                <th scope="col">{{ $t(reviewCopy + "destination") }}</th>
                <th scope="col">{{ $t(reviewCopy + "shipping") }}</th>
                <th scope="col">{{ $t(reviewCopy + "supplier_total") }}</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(shipping, country) in selected_product.shipping"
                :key="country"
              >
                <td
                  class="b-product-dropshipping-review__country"
                  :data-label="$t(reviewCopy + 'destination')"
                >
                  <span
                    ><flag :iso="country" :squared="false" />{{
                      getCountryName(country)
                    }}</span
                  >
                </td>
                <td :data-label="$t(reviewCopy + 'shipping')">
                  <u-price
                    :amount="shipping"
                    :currency="selected_product.currency"
                  />
                </td>
                <td :data-label="$t(reviewCopy + 'supplier_total')">
                  <u-price
                    :amount="
                      net_price_without_commission + (shipping ? shipping : 0)
                    "
                    :currency="selected_product.currency"
                  />
                </td>
              </tr>
            </tbody>
          </v-table>
          <p v-else class="b-product-dropshipping-review__help">
            {{ $t(reviewCopy + "no_shipping") }}
          </p>
        </section>

        <aside class="sd-modern-notice b-product-dropshipping-review__notice">
          <v-icon size="16" aria-hidden="true">info_outline</v-icon>
          <p class="sd-modern-notice__content">
            {{
              $t(reviewCopy + (variants?.length ? "add_help" : "single_help"))
            }}
          </p>
        </aside>
      </v-card-text>

      <v-card-actions class="b-product-dropshipping-review__footer">
        <span class="b-product-dropshipping-review__help">{{
          $t(reviewCopy + (variants?.length ? "footer_scope" : "footer_single"))
        }}</span>
        <div class="b-product-dropshipping-review__actions">
          <v-btn
            class="sd-modern-button sd-modern-button--compact"
            variant="outlined"
            @click="show_add_dialog = false"
            >{{ $t("global.actions.close") }}</v-btn
          >
          <v-btn
            :loading="busy_add"
            class="sd-modern-button sd-modern-button--compact"
            color="primary"
            variant="elevated"
            prepend-icon="add"
            @click="addProduct()"
            >{{ $t(reviewCopy + "add") }}</v-btn
          >
        </div>
      </v-card-actions>
    </v-card>
  </v-bottom-sheet>
</template>

<script lang="ts">
import { throttle } from "lodash-es";
import UTimeProgressBar from "@selldone/components-vue/ui/time/progress-bar/UTimeProgressBar.vue";
import VariantItemMini from "@selldone/components-vue/storefront/product/variant/VariantItemMini.vue";
import ProductVariantsView from "@selldone/components-vue/storefront/product/variant/ProductVariantsView.vue";
import UPriceInput from "@selldone/components-vue/ui/price/input/UPriceInput.vue";
import UAvatarFolder from "@selldone/components-vue/ui/avatar/folder/UAvatarFolder.vue";
import ProductMixin from "@selldone/components-vue/mixin/product/ProductMixin.ts";
import { Product } from "@selldone/core-js/models";
import { ShopURLs } from "@selldone/core-js/helper";
import { GetNameOfColor } from "@selldone/core-js/helper/color/ColorHelper.ts";

import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

export default {
  name: "BProductAddDropshippingProducts",
  mixins: [ProductMixin],
  components: {
    UAvatarFolder,
    UPriceInput,
    ProductVariantsView,
    UTimeProgressBar,
    VariantItemMini,
  },
  emits: ["back"],
  props: {
    shop: {
      required: true,
    },
    wholesalerShop: {
      required: false,
    },
  },
  data: () => ({
    Product: Product,
    copy: "product_add_dropshipping_products.modern.",
    reviewCopy: "product_add_dropshipping_products.modern.review.",
    fetch_error: false,
    fetch_sequence: 0,
    disposed: false,
    searchThrottled: null,

    busy_fetch: false,

    //---------------------------------------
    products: [],
    total_products: 0,

    categories: [],
    total_categories: 0,

    //---------------------------------------

    selected_folder: null,
    search_in_shop: null,
    sort: null,
    only_available: true,
    parent_folders: [],

    //-----------------------------------------
    selected_product: null,
    show_add_dialog: null,
    selected_variant: null,
    busy_add: false,

    editing: null,

    //-----------------------------------------

    // Pagination:
    page: 1,
    itemsPerPage: 10,
    sortBy: [{ key: null, order: "desc" }],
  }),

  computed: {
    productSortKey() {
      return this.sortBy[0]?.key || "latest";
    },
    productSortOptions() {
      return [
        { title: this.$t(this.copy + "latest_added"), value: "latest" },
        ...this.headers
          .filter((column) => column.sortable)
          .map((column) => ({ title: column.title, value: column.value })),
      ];
    },
    ShopURLs() {
      return ShopURLs;
    },
    headers() {
      return [
        {
          title: this.$t("global.commons.title"),
          align: "start",
          value: "title",
          width: "28%",
          cellProps: { class: "b-product-dropshipping-catalog__identity-cell" },
          sortable: true,
        },
        {
          title: this.$t(this.copy + "variants"),
          align: "start",
          value: "variants",
          width: "14%",
          sortable: false,
        },

        {
          title: this.$t("global.commons.brand"),
          align: "start",
          value: "brand",
          width: "10%",
          sortable: true,
        },
        {
          title: this.$t("global.commons.sku"),
          align: "start",
          value: "sku",
          width: "12%",
          sortable: true,
        },
        {
          title: this.$t(this.copy + "wholesale_price"),
          align: "start",
          value: "price",
          width: "12%",
          sortable: true,
        },
        {
          title: this.$t(this.copy + "quantity"),
          align: "start",
          value: "quantity",
          width: "8%",
          sortable: true,
        },
        {
          title: "",
          align: "end",
          value: "action",
          width: "16%",
          cellProps: { class: "b-product-dropshipping-catalog__actions-cell" },
          sortable: false,
        },
      ];
    },
    pageCount() {
      return Math.max(1, Math.ceil(this.total_products / this.itemsPerPage));
    },

    selected_product_variant_pricing() {
      return this.selected_variant && this.selected_variant.pricing
        ? this.selected_variant
        : this.selected_product;
    },

    commission() {
      return this.selected_product_variant_pricing.commission;
    },
    net_price_without_commission() {
      return (
        this.priceProductByCurrency(
          null,
          this.selected_product,
          this.selected_variant,
          this.selected_product.currency,
        ) - this.commission
      );
    },
    discount() {
      return this.getProductDiscountAmountByCurrency(
        null,
        this.selected_product,
        this.selected_variant,
        this.selected_product.currency,
      );
    },

    created_at() {
      return this.selected_product_variant_pricing.created_at;
    },
    dis_start() {
      return this.selected_product_variant_pricing.dis_start;
    },
    dis_end() {
      return this.selected_product_variant_pricing.dis_end;
    },
    variants() {
      return this.selected_product.product_variants;
    },
  },
  watch: {
    selected_folder() {
      this.fetchProducts();
    },

    sortBy() {
      this.resetProductPage();
    },

    page() {
      this.fetchProducts();
    },

    search_in_shop() {
      this.searchThrottled?.();
    },
  },

  created() {
    this.searchThrottled = throttle(() => this.resetProductPage(), 1000);
    this.fetchProducts();
  },
  beforeUnmount() {
    this.disposed = true;
    this.fetch_sequence++;
    this.searchThrottled?.cancel();
  },

  methods: {
    reviewVariantTitle(variant) {
      return (
        ["color", "volume", "pack", "weight", "style", "type"]
          .map((key) =>
            key === "color"
              ? GetNameOfColor(variant[key])
              : variant[key]?.removeVariantAsset(),
          )
          .filter(Boolean)
          .join(" / ") || `V-${variant.id}`
      );
    },
    changeProductSort(key) {
      this.sortBy = [
        {
          key: key === "latest" ? null : key,
          order: this.sortBy[0]?.order || "desc",
        },
      ];
    },
    resetProductPage() {
      if (this.page !== 1) this.page = 1;
      else return this.fetchProducts();
    },
    fetchProducts() {
      const sequence = ++this.fetch_sequence;
      const shopId = this.shop.id;
      const supplierId = this.wholesalerShop.id;
      this.busy_fetch = true;
      this.fetch_error = false;
      return axios
        .get(
          window.API.GET_DROP_SHIPPING_SHOP_PRODUCTS(
            this.shop.id,
            this.wholesalerShop.id,
          ),
          {
            params: {
              offset: (this.page - 1) * this.itemsPerPage,
              limit: this.itemsPerPage,
              sortBy: this.sortBy[0]?.key,
              sortDesc: this.sortBy[0]?.order === "desc",

              sort: this.sort,
              available: this.only_available,
              search: this.search_in_shop,

              dir: this.selected_folder ? this.selected_folder.id : null,
            },
          },
        )
        .then(({ data }) => {
          if (
            this.disposed ||
            sequence !== this.fetch_sequence ||
            shopId !== this.shop.id ||
            supplierId !== this.wholesalerShop.id
          )
            return;
          if (!data.error) {
            this.products = data.products;
            this.total_products = data.total;
          } else {
            this.fetch_error = true;
            this.products = [];
            this.total_products = 0;
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          if (
            this.disposed ||
            sequence !== this.fetch_sequence ||
            shopId !== this.shop.id ||
            supplierId !== this.wholesalerShop.id
          )
            return;
          this.fetch_error = true;
          this.products = [];
          this.total_products = 0;
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          if (
            !this.disposed &&
            sequence === this.fetch_sequence &&
            shopId === this.shop.id &&
            supplierId === this.wholesalerShop.id
          )
            this.busy_fetch = false;
        });
    },

    fetchCategories() {
      this.busy_fetch = true;
      axios
        .get(
          window.API.GET_DROP_SHIPPING_SHOP_CATEGORIES(
            this.shop.id,
            this.wholesalerShop.id,
          ),
          {
            params: {
              offset: 0,
              limit: 50,
            },
          },
        )
        .then(({ data }) => {
          this.categories = data.categories;
          this.total_categories = data.total;
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .then(() => {
          this.busy_fetch = false;
        });
    },

    showAddProduct(product) {
      this.selected_product = product;
      this.show_add_dialog = true;
      this.selected_variant = null;
      if (this.variants && this.variants.length) {
        this.selected_variant = this.variants[0];
      }
    },
    addProduct() {
      if (this.busy_add || !this.selected_product) return;
      this.busy_add = true;

      let commission = this.selected_product.commission;
      let commissions = {};

      if (this.variants && this.variants.length) {
        this.variants.forEach((variant) => {
          if (variant.pricing) commissions[variant.id] = variant.commission;
        });
      }

      axios
        .post(window.API.POST_ADD_PRODUCT_BY_DROP_SHIPPING(this.shop.id), {
          product_id: this.selected_product.id,
          category_id: this.$route.query.dir,

          commission: commission, // Main product commission
          commissions: commissions, // Variants custom commissions (If enable pricing)
        })
        .then(({ data }) => {
          if (!data.error) {
            this.show_add_dialog = false;
            NotificationService.showSuccessAlert(
              null,
              this.$t("dropshipping_products.notifications.add_product"),
            );
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .then(() => {
          this.busy_add = false;
        });
    },
  },
};
</script>

<style scoped lang="scss">
.b-product-dropshipping-review.v-card {
  --sd-modern-icon-button-size: 32px;
  --sd-modern-inset: color-mix(
    in srgb,
    rgb(var(--v-theme-surface)) 96%,
    rgb(var(--v-theme-on-surface))
  );
  padding: 0;
  max-height: calc(100dvh - 16px);
  border-block-end: 0;
  border-radius: 20px 20px 0 0 !important;
  font-family: inherit;
  font-size: var(--sd-modern-font-body);
  font-weight: 400;
  line-height: 1.55;
  letter-spacing: 0;

  h2,
  h3,
  p,
  dl,
  dd {
    margin: 0;
  }

  h2 {
    font-size: 18px;
    font-weight: 500;
    line-height: 25px;
  }
  h3 {
    font-size: 15px;
    font-weight: 500;
    line-height: 23px;
  }

  .b-product-dropshipping-review__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex: 0 0 auto;
    gap: 16px;
    padding: 20px 24px;
    border-block-end: 1px solid var(--sd-modern-border);
    white-space: normal;
  }

  .b-product-dropshipping-review__identity {
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 0;
  }
  .b-product-dropshipping-review__image {
    flex: 0 0 44px;
    border-radius: 10px;
  }
  .b-product-dropshipping-review__identity-copy {
    min-width: 0;
    overflow-wrap: anywhere;
  }
  .b-product-dropshipping-review__identity-copy p,
  .b-product-dropshipping-review__help {
    color: var(--sd-modern-muted);
    font-size: var(--sd-modern-font-small);
    font-weight: 400;
    line-height: 21px;
  }

  .b-product-dropshipping-review__body {
    display: grid;
    align-content: start;
    gap: 24px;
    padding: 24px;
    font-size: var(--sd-modern-font-body);
    line-height: 22px;
  }
  .b-product-dropshipping-review__intro p {
    margin-block-start: 4px;
    color: var(--sd-modern-muted);
  }
  .b-product-dropshipping-review__variant
    > .b-product-dropshipping-review__help {
    margin-block-start: 7px;
  }
  .b-product-dropshipping-review__variant-select :deep(.v-select__selection) {
    max-width: 100%;
    margin-block: 0;
  }
  .b-product-dropshipping-review__variant-select :deep(.v-field__input) {
    height: auto;
  }
  .b-product-dropshipping-review__pricing {
    display: grid;
    grid-template-columns: minmax(0, 0.95fr) minmax(0, 1.2fr);
    gap: 28px;
  }
  .b-product-dropshipping-review__edit {
    min-width: 0;
    padding-block-start: 3px;
  }
  .b-product-dropshipping-review__section-heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 8px 12px;
  }
  .b-product-dropshipping-review__section-heading h3 {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .b-product-dropshipping-review__section-heading h3 > .v-icon {
    color: var(--sd-modern-muted);
  }
  .b-product-dropshipping-review__markup {
    margin-block: 12px 9px;
  }
  .b-product-dropshipping-review__markup :deep(.v-field__input) {
    min-height: 44px;
    height: 44px;
    padding-block: 6px;
    font-size: 23px;
    font-weight: 400;
    line-height: 32px;
    font-variant-numeric: tabular-nums;
  }
  .b-product-dropshipping-review__markup :deep(.v-field__suffix) {
    font-size: 13px;
    color: var(--sd-modern-muted);
  }
  .b-product-dropshipping-review__calculation {
    min-width: 0;
    padding: 18px;
    background: var(--sd-modern-inset);
    border-radius: 12px;
  }
  .b-product-dropshipping-review__preview-heading {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    line-height: 21px;
  }
  .b-product-dropshipping-review__retail {
    margin-block-start: 5px;
    font-size: 32px;
    font-weight: 500;
    line-height: 42px;
  }
  .b-product-dropshipping-review__retail :deep(.u--price) {
    font-size: inherit;
    font-weight: inherit;
  }
  .b-product-dropshipping-review__retail :deep(.u--price .small) {
    font-size: 0.65em !important;
    font-weight: 400;
  }
  .b-product-dropshipping-review__retail :deep(.u--price .cur-name) {
    font-size: 13px !important;
  }
  .b-product-dropshipping-review__breakdown {
    display: grid;
    gap: 10px;
    padding-block-start: 18px;
    font-size: 13px;
    line-height: 21px;
  }
  .b-product-dropshipping-review__breakdown > div {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 14px;
  }
  .b-product-dropshipping-review__breakdown dt {
    min-width: 0;
    color: var(--sd-modern-muted);
  }
  .b-product-dropshipping-review__breakdown dd {
    flex: 0 0 auto;
  }
  .b-product-dropshipping-review__discount-label {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .b-product-dropshipping-review__supplier-line {
    padding-block-start: 10px;
    border-block-start: 1px solid var(--sd-modern-border);
  }
  .b-product-dropshipping-review__breakdown :deep(.u--price),
  .b-product-dropshipping-review__breakdown :deep(.u--price .small),
  .b-product-dropshipping-review__breakdown :deep(.u--price .cur-name),
  .b-product-dropshipping-review__shipping-table :deep(.u--price),
  .b-product-dropshipping-review__shipping-table :deep(.u--price .small),
  .b-product-dropshipping-review__shipping-table :deep(.u--price .cur-name) {
    font-size: inherit !important;
    font-weight: 400;
    white-space: nowrap;
  }
  .b-product-dropshipping-review__destinations {
    display: grid;
    gap: 8px;
  }
  .b-product-dropshipping-review__shipping-table {
    margin-block-start: 4px;
    border-radius: 0;
  }
  .b-product-dropshipping-review__shipping-table :deep(> .v-table__wrapper) {
    overflow: visible;
  }
  .b-product-dropshipping-review__shipping-table :deep(table) {
    table-layout: fixed;
    th:first-child {
      width: 35%;
    }
    th:first-child,
    td:first-child {
      padding-inline-end: 16px !important;
    }
    th:nth-child(2) {
      width: 22%;
    }
    th:not(:first-child),
    td:not(:first-child) {
      text-align: end;
    }
    td {
      overflow-wrap: anywhere;
      font-size: 14px;
      font-weight: 400;
      line-height: 22px;
    }
    tbody > tr:last-child > td {
      border-block-end: 1px solid var(--sd-modern-border) !important;
    }
  }
  .b-product-dropshipping-review__country > span {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .b-product-dropshipping-review__country :deep(.fi) {
    flex: 0 0 auto;
  }
  .b-product-dropshipping-review__notice {
    padding: 12px 14px;
    gap: 10px;
    border-radius: 10px;
  }
  .b-product-dropshipping-review__notice p {
    font-size: 13px;
    line-height: 21px;
  }
  .b-product-dropshipping-review__notice > .v-icon {
    color: var(--sd-modern-muted);
  }
  .b-product-dropshipping-review__footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex: 0 0 auto;
    flex-wrap: wrap;
    gap: 16px;
    padding: 16px 24px;
    border-block-start: 1px solid var(--sd-modern-border);
  }
  .b-product-dropshipping-review__actions {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-inline-start: auto;
  }
  .b-product-dropshipping-review__actions :deep(.v-btn__content) {
    white-space: nowrap;
  }
  .b-product-dropshipping-review__actions > .v-btn {
    font-size: 13px;
    font-weight: 400;
    line-height: 20px;
  }
  .b-product-dropshipping-review__actions > .v-btn--variant-outlined {
    border-color: var(--sd-modern-border);
  }

  @media (max-width: 540px) {
    .b-product-dropshipping-review__header {
      padding: 18px 16px;
    }
    .b-product-dropshipping-review__body {
      padding: 20px 16px;
      gap: 22px;
    }
    .b-product-dropshipping-review__pricing {
      grid-template-columns: minmax(0, 1fr);
      gap: 20px;
    }
    .b-product-dropshipping-review__footer {
      padding: 16px;
      gap: 12px;
    }
    .b-product-dropshipping-review__footer > span {
      flex-basis: 100%;
    }
    .b-product-dropshipping-review__actions {
      width: 100%;
    }
    .b-product-dropshipping-review__actions > .v-btn:last-child {
      flex: 1;
    }
    .b-product-dropshipping-review__shipping-table :deep(table) {
      display: block;
      thead {
        display: none;
      }
      tbody {
        display: block;
        width: 100%;
      }
      tr {
        display: grid;
        gap: 7px;
        padding-block: 14px;
        border-block-end: 1px solid var(--sd-modern-border);
      }
      td {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: 12px;
        width: 100%;
        padding: 0 !important;
        border: 0 !important;
      }
      td::before {
        content: attr(data-label);
        flex: 1;
        text-align: start;
      }
      td.b-product-dropshipping-review__country {
        margin-block-end: 3px;
      }
      td.b-product-dropshipping-review__country::before {
        display: none;
      }
      tbody > tr:last-child > td {
        border: 0 !important;
      }
    }
  }
}

// These instances also appear inside the select's teleported native menu.
.b-product-dropshipping-review__variant-value {
  min-width: 0;
  min-height: 24px;
  margin: 0;
  padding: 0;
  pointer-events: none;
  color: inherit;
  font-size: 13px;
  font-weight: 400;
  line-height: 21px;
  :deep(.--item) {
    max-width: 100%;
    flex-wrap: wrap;
    white-space: normal !important;
  }
  :deep(.small),
  :deep(.card-badge-info) {
    color: inherit;
    font-size: 13px;
    font-weight: 400;
    line-height: 21px;
    overflow-wrap: anywhere;
  }
  :deep(.v-icon) {
    color: var(--sd-modern-muted, rgba(var(--v-theme-on-surface), 0.66));
    font-size: 16px;
  }
}

.b-product-dropshipping-review__schedule {
  :deep(small),
  :deep(.small) {
    font-size: 13px;
    line-height: 21px;
  }
}

.b-product-dropshipping-catalog {
  --sd-modern-icon-button-size: 32px;
  padding-block: 28px 34px;
  font-family: inherit;
  letter-spacing: 0;
  &__heading {
    margin-block-end: 22px;
  }
  &__heading .sd-modern-title-text {
    margin: 0;
    font-size: 20px;
    font-weight: 500;
    line-height: 26px;
  }
  &__heading .sd-modern-subtitle {
    margin: 7px 0 0;
    color: var(--sd-modern-muted);
    font-size: 13px;
    font-weight: 400;
    line-height: 21px;
  }
  &__list {
    padding: 0;
    border-radius: 16px;
  }
  &__toolbar {
    flex-wrap: wrap;
    padding: 16px 20px;
  }
  &__breadcrumb {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 16px;
    min-width: 0;
  }
  &__breadcrumb > .v-btn {
    flex: 0 0 auto;
    white-space: nowrap;
  }
  &__breadcrumb :deep(.v-btn__content) {
    white-space: nowrap;
  }
  &__sort {
    flex: 0 1 145px;
    width: 145px;
    min-width: 110px;
  }
  &__supplier {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
    font-size: 13px;
    font-weight: 500;
    line-height: 20px;
    overflow-wrap: anywhere;
  }
  &__search {
    flex: 0 1 225px;
    width: 225px;
    min-width: 150px;
    margin-inline-start: auto;
  }
  &__table {
    --sd-modern-table-font-size: 13px;
    --sd-modern-table-line-height: 20px;
    :deep(.u--price),
    :deep(.u--price .small) {
      font-weight: 400;
    }
    :deep(> .v-table__wrapper) {
      overflow: visible;
    }
    :deep(> .v-table__wrapper > table) {
      table-layout: fixed;
      > thead > tr > th,
      > tbody > tr > td {
        padding: 17px 10px !important;
      }
      > thead > tr > th:first-child,
      > tbody > tr > td:first-child {
        padding-inline-start: 20px !important;
      }
      > thead > tr > th:last-child,
      > tbody > tr > td:last-child {
        padding-inline-end: 20px !important;
      }
    }
  }
  &__identity {
    display: flex;
    align-items: center;
    gap: 11px;
    min-width: 0;
  }
  &__identity-copy {
    min-width: 0;
  }
  &__name,
  &__copy {
    padding: 0;
    border: 0;
    background: transparent;
    color: inherit;
    text-align: start;
    font-family: inherit;
    font-size: 13px;
    line-height: 20px;
    overflow-wrap: anywhere;
  }
  &__name {
    display: block;
    font-weight: 500;
  }
  &__secondary {
    margin: 3px 0 0;
    color: var(--sd-modern-muted);
    font-size: 12px;
    font-weight: 400;
    line-height: 19px;
    overflow-wrap: anywhere;
  }
  &__added {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    margin-block-start: 4px;
    color: var(--dropshipping-primary-ink, rgb(var(--v-theme-primary)));
    font-size: 12px;
    font-weight: 400;
    line-height: 19px;
  }
  &__actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 10px;
  }
  &__empty {
    padding: 42px 20px;
    font-size: 13px;
  }
  &__empty h2 {
    margin: 12px 0 7px;
    font-size: 14px;
    font-weight: 500;
    line-height: 21px;
  }
  &__empty p {
    margin: 0 auto 8px;
    max-width: 410px;
    font-size: 13px;
    line-height: 21px;
  }
  &__footer {
    padding: 14px 20px;
  }
  @media (max-width: 959px) {
    &__table :deep(> .v-table__wrapper > table) {
      display: block;
      > tbody {
        display: block;
        width: 100%;
      }
      > tbody > .v-data-table__tr--mobile {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 16px 18px;
        padding: 18px 16px;
        border-block-end: 1px solid var(--sd-modern-border);
        > td {
          display: block;
          width: auto !important;
          min-height: 0;
          padding: 0 !important;
          border: 0;
          text-align: start;
        }
        > td:first-child,
        > td:last-child {
          padding: 0 !important;
        }
        > .b-product-dropshipping-catalog__identity-cell,
        > .b-product-dropshipping-catalog__actions-cell {
          grid-column: 1 / -1;
        }
        > .b-product-dropshipping-catalog__identity-cell
          .v-data-table__td-title,
        > .b-product-dropshipping-catalog__actions-cell
          .v-data-table__td-title {
          display: none;
        }
        .v-data-table__td-title {
          display: block;
          margin-block-end: 5px;
        }
        .v-data-table__td-value {
          display: block;
          width: 100%;
          text-align: start;
        }
      }
      > tbody > tr:not(.v-data-table__tr--mobile) {
        display: block;
        > td {
          display: block;
          width: 100%;
        }
      }
    }
    &__actions {
      justify-content: flex-start;
    }
  }
  @media (max-width: 620px) {
    width: 100%;
    padding-block: 22px;
    &__toolbar {
      padding: 14px 16px;
    }
    &__search {
      flex-basis: 100%;
      width: 100%;
      margin-inline-start: 0;
    }
    &__footer {
      padding-inline: 16px;
    }
  }
}
</style>
