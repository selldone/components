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

<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
  <div>
    <!-- ███████████████████ Items ███████████████████ -->

    <div class="widget-box -large mb-5 min-height-50vh">
      <u-widget-header
        :add-caption="
          showAddItem ? $t('virtual_items_list.add_virtual_item') : undefined
        "
        :title="$t('virtual_items_list.title')"
        icon="switch_access_shortcut"
        @click:add="dialog_add = true"
      >
      </u-widget-header>

      <v-list-subheader>
        {{ $t("virtual_items_list.add_virtual_item_desc") }}
      </v-list-subheader>

      <v-row no-gutters>
        <div
          v-if="showFilters"
          class="c-container -force-rounded p-2 m-0 d-inline-block w-auto"
        >
          <v-btn-toggle
            v-model="filter_list"
            density="compact"
            mandatory
            multiple
            rounded="xl"
            selected-class="black-flat"
          >
            <v-btn
              v-for="item in filter_choices"
              :key="item.value"
              :value="item.value"
              variant="flat"
            >
              <v-icon start>{{ item.icon }}</v-icon>
              {{ getStatusString(item.value) }}
            </v-btn>
          </v-btn-toggle>
        </div>

        <v-spacer></v-spacer>
      </v-row>

      <u-loading-progress v-if="busy_fetch"></u-loading-progress>
      <v-data-table-server
        v-model:options="options"
        v-model:page="page"
        v-model:sort-by="sortBy"
        :class="{ disabled: busy_fetch }"
        :header-props="{ sortByText: $t('global.commons.sort_by') }"
        :headers="headers"
        :items="virtual_items"
        :items-length="totalItems"
        :items-per-page="itemsPerPage"
        :mobile="$vuetify.display.xs"
        :row-props="
          (_data) => {
            return { class: 'row-hover' };
          }
        "
        class="bg-transparent"
        density="compact"
        hide-default-footer
        item-key="id"
        @click:row="(_, r) => showDetail(r.item)"
      >
        <!-- ▂▂▂▂▂▂▂▂▂▂▂▂ product_id ▂▂▂▂▂▂▂▂▂▂▂▂ -->

        <template v-slot:item.product_id="{ item }">
          <v-avatar :size="36" :tile="false" class="m-2" color="grey-lighten-4">
            <v-img
              v-if="
                product_variants.find((v) => v.id === item.variant_id)?.image
              "
              :src="
                getShopImagePath(
                  product_variants.find((v) => v.id === item.variant_id).image,
                  128,
                )
              "
            />
            <v-img v-else :src="getShopImagePath(product.icon, 128)" />
          </v-avatar>
        </template>

        <!-- ▂▂▂▂▂▂▂▂▂▂▂▂ variant_id ▂▂▂▂▂▂▂▂▂▂▂▂ -->

        <template v-slot:item.variant_id="{ item }">
          <div v-if="item.variant_id">
            <b class="d-block small">SPV-{{ item.variant_id }}</b>
            <div v-if="item.variant_id">
              <variant-item-view-micro
                v-if="product_variants.find((v) => v.id === item.variant_id)"
                :product-variant="
                  product_variants.find((v) => v.id === item.variant_id)
                "
                class="py-0"
              ></variant-item-view-micro>
              <small v-else class="text-muted">
                <v-icon size="small">delete_outline</v-icon>
                Variant deleted!</small
              >
            </div>
          </div>
          <v-chip v-else color="red" pill size="small" variant="flat">
            <v-icon start>warning</v-icon>
            No variant

            <v-tooltip
              activator="parent"
              content-class="text-start"
              max-width="320"
            >
              Select a variant! Customers can't purchase this item.
            </v-tooltip>
          </v-chip>
        </template>
        <!-- ▂▂▂▂▂▂▂▂▂▂▂▂ data ▂▂▂▂▂▂▂▂▂▂▂▂ -->

        <template v-slot:item.data="{ item }">
          <v-icon
            v-if="product ? product.outputs : item.data"
            color="#388E3C"
            size="small"
          >
            {{
              Object.keys(item.data) >= Object.keys(product.outputs)
                ? "check_circle"
                : "panorama_fish_eye"
            }}
          </v-icon>
          <span v-else>{{ $t("global.not_exist") }}</span>
        </template>

        <!-- ▂▂▂▂▂▂▂▂▂▂▂▂ status ▂▂▂▂▂▂▂▂▂▂▂▂ -->
        <template v-slot:item.status="{ item }">
          <v-chip
            v-if="item.status === 'Canceled'"
            color="red"
            label
            size="small"
          >
            <v-icon start>cancel</v-icon>

            {{ getStatusString(item.status) }}
          </v-chip>

          <v-chip
            v-else-if="item.status === 'Payed'"
            color="green"
            label
            size="small"
          >
            <v-icon start>check_circle</v-icon>

            {{ getStatusString(item.status) }}
          </v-chip>
          <v-chip
            v-else-if="item.status === 'Reserved'"
            color="amber"
            label
            size="small"
          >
            <v-icon start>hourglass_top</v-icon>

            {{ getStatusString(item.status) }}
          </v-chip>
          <v-chip v-else label size="small">
            {{ getStatusString(item.status) }}
          </v-chip>
        </template>
        <!-- ▂▂▂▂▂▂▂▂▂▂▂▂ order ▂▂▂▂▂▂▂▂▂▂▂▂ -->

        <template v-slot:item.order="{ item }">
          <b-order-button-basket
            v-if="item.basket"
            :order="item.basket"
            class="mx-2"
            @click.stop
          >
          </b-order-button-basket>
        </template>
        <!-- ▂▂▂▂▂▂▂▂▂▂▂▂ updated_at ▂▂▂▂▂▂▂▂▂▂▂▂ -->

        <template v-slot:item.updated_at="{ item }">
          <p class="min-width-250 mb-1">
            {{ getFromNowString(item.updated_at) }}
          </p>
          <span class="small">{{ getLocalTimeString(item.updated_at) }}</span>
        </template>

        <!-- ▂▂▂▂▂▂▂▂▂▂▂▂ delete ▂▂▂▂▂▂▂▂▂▂▂▂ -->

        <template v-slot:item.delete="{ item }">
          <v-btn
            v-if="item.status !== 'Payed'"
            :loading="busy_delete === item"
            class="mx-2"
            color="red"
            icon
            variant="text"
            @click.stop="deleteItem(item)"
          >
            <v-icon>close</v-icon>
          </v-btn>
        </template>

        <!-- ▂▂▂▂▂▂▂▂▂▂▂▂ no-data ▂▂▂▂▂▂▂▂▂▂▂▂ -->

        <template v-slot:no-data>
          <p>{{ $t("virtual_items_list.table.nodata") }}</p>
        </template>
        <!-- ▂▂▂▂▂▂▂▂▂▂▂▂ footer ▂▂▂▂▂▂▂▂▂▂▂▂ -->

        <template v-slot:bottom>
          <div class="text-center my-5">
            <v-pagination v-model="page" :length="pageCount" rounded />
          </div>
        </template>
      </v-data-table-server>

      <div v-if="is_marketplace" class="py-5 text-muted">
        <h3 class="mb-3">
          <v-icon class="me-1">support</v-icon>
          Virtual product sales guide in the marketplace
        </h3>

        <ol>
          <li class="mb-2">
            Add vendors to the product. When you set 10 as the vendor inventory,
            the system generates empty virtual items automatically if the sum of
            available virtual items is less than the total product quantity.
          </li>

          <li class="mb-2">
            After a customer purchases this product, the vendor can fill output
            form or send data to you, and it's you who fill output form.
          </li>

          <li class="mb-2">
            Do not fill output values of virtual items in the marketplace,
            especially if the product has more than one vendor!
          </li>
        </ol>
      </div>
    </div>

    <!-- ███████████████████ Variants ███████████████████ -->

    <div class="widget-box -large mb-5">
      <u-widget-header
        :add-text="!hasVariants"
        add-caption="
        Add variant
        "
        icon="style"
        title="Virtual variants"
        @click:add="showEdit(null)"
      >
      </u-widget-header>

      <v-list-subheader>
        <div>
          You can define variants for virtual products. Two types of variants
          are available <b>color</b> and <b>type</b>. After you adding variants
          here, you can select the variant for new virtual items.
        </div>
      </v-list-subheader>

      <div v-if="hasVariants">
        <v-row no-gutters>
          <v-spacer></v-spacer>
          <u-smart-menu
            :with-trashed="withTrashed"
            has-with-trashed
            @update:withTrashed="(val) => $emit('update:withTrashed', val)"
          >
          </u-smart-menu>
        </v-row>

        <u-loading-progress v-if="busy_restore"></u-loading-progress>

        <b-product-variant-item
          v-for="(product_variant, index) in product_variants"
          :key="index"
          ref="variant_items_list"
          :product="product"
          :product-variant="product_variant"
          :validate-variants="[]"
          has-delete
          @delete="
            withTrashed
              ? undefined
              : DeleteItemByID(product_variants, product_variant.id)
          "
          @restore="
            (_variant) => AddOrUpdateItemByID(product_variants, _variant)
          "
          @select="showEdit(product_variant)"
        />
      </div>
    </div>

    <!-- ███████████████████ Dialog > Add ███████████████████ -->

    <v-bottom-sheet
      v-model="dialog_add"
      :content-class="expand ? '' : 'rounded-t-xl'"
      :fullscreen="expand"
      :max-width="expand ? undefined : 840"
      scrollable
    >
      <b-product-virtual-item-add
        v-model:expand="expand"
        :class="expand ? '' : 'rounded-t-xl'"
        :product="product"
        @add="
          (item) => {
            virtual_items.unshift(item);
            totalItems++;
          }
        "
        @close="dialog_add = false"
        @refresh="refreshList"
      />
    </v-bottom-sheet>

    <!-- ███████████████████ Dialog > Edit ███████████████████ -->

    <v-bottom-sheet
      v-model="dialog_edit"
      :fullscreen="expand"
      content-class="rounded-t-xl"
      max-width="840"
      scrollable
    >
      <b-product-virtual-item-add
        v-if="current_item"
        v-model:expand="expand"
        :product="product"
        :virtual-item="current_item"
        class="rounded-t-xl"
        @close="dialog_edit = false"
        @edit="(item) => UpdateItemByID(virtual_items, item)"
      />
    </v-bottom-sheet>

    <!-- ███████████████████ Dialog > Add/Edit Variant ███████████████████ -->

    <v-dialog
      v-model="dialog"
      fullscreen
      scrollable
      transition="dialog-bottom-transition"
    >
      <b-product-variant-add
        v-if="dialog_pre"
        :loading="busy_save"
        :product="product"
        :product-variant="current_item"
        :shop="shop"
        :vendor="vendor"
        has-color
        has-type
        @add="addOrUpdateProductVariant"
        @close="
          dialog = false;
          $router.replace({
            query: null,
          });
        "
        @update="addOrUpdateProductVariant"
      />
    </v-dialog>
  </div>
</template>

<script lang="ts">
import BOrderButtonBasket from "../../../../order/button/basket/BOrderButtonBasket.vue";

import { BusinessModel } from "@selldone/core-js/enums/shop/BusinessModel";
import BProductVariantAdd from "../../../../product/variants/add/BProductVariantAdd.vue";
import BProductVariantItem from "../../../../product/variants/item/BProductVariantItem.vue";
import VariantItemViewMicro from "../../../../../storefront/product/variant/VariantItemViewMicro.vue";
import USmartMenu from "../../../../../ui/smart/menu/USmartMenu.vue";
import BProductVirtualItemAdd from "../../../../product/virtual/item/add/BProductVirtualItemAdd.vue";
import DateMixin from "@selldone/components-vue/mixin/date/DateMixin.ts";
import OrderMixin from "@selldone/components-vue/mixin/order/OrderMixin.ts";

import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

export default {
  name: "BProductInventoryManagementVirtual",
  mixins: [DateMixin,OrderMixin ],
  components: {
    BProductVirtualItemAdd,
    USmartMenu,
    VariantItemViewMicro,
    BProductVariantItem,
    BProductVariantAdd,

    BOrderButtonBasket,
  },
  props: {
    shop: {
      required: true,
      type: Object,
    },
    vendor: {
      /*🟢 Vendor Panel 🟢*/ required: false,
    },
    product: {
      required: true,
      type: Object,
    },
    showFilters: {
      required: false,
      type: Boolean,
      default: false,
    },
    showAddItem: {
      required: false,
      type: Boolean,
      default: false,
    },
    withTrashed: {
      default: false,
      type: Boolean,
    },
  },
  data: () => ({
    filter_list: ["Open", "Payed", "Canceled", "Reserved"],
    filter_choices: [
      { value: "Open", icon: "assignment_turned_in" },
      { value: "Payed", icon: "payment" },
      { value: "Canceled", icon: "cancel" },
      { value: "Reserved", icon: "lock_reset" },
    ],

    // ----------- Filters -----------
    status_Open: false,
    status_Sold: true,
    status_Cancel: false,

    //--------------------------------
    virtual_items: [],

    current_item: null,

    busy_fetch: false,

    // Pagination:
    page: 1,
    itemsPerPage: 10,
    totalItems: 0,
    options: {},
    sortBy: [{ key: null, order: "desc" }],

    busy_delete: null,
    busy_restore: null,

    //------------------------------
    dialog_edit: false,
    dialog_add: false,
    expand: false, // Full dialog mode
    //------------------------------
    dialog: false,
    dialog_pre: false,
    product_variants: [],
    busy_save: false,
  }),

  computed: {
    pageCount() {
      return Math.ceil(this.totalItems / this.itemsPerPage);
    },
    IS_VENDOR_PANEL() {
      /*🟢 Vendor Panel 🟢*/
      return (
        this.$route.params.vendor_id &&
        this.$route.matched.some((record) => record.meta.vendor)
      );
    },

    is_marketplace() {
      return (
        this.shop.model === BusinessModel.MARKETPLACE.code &&
        this.shop.marketplace &&
        this.shop.marketplace.enable
      );
    },

    headers() {
      return [
        {
          title: this.$t("virtual_items_list.table.product"),
          align: "center",
          value: "product_id",
          sortable: false,
        },

        ...(this.hasVariants
          ? [
              {
                title: this.$t("global.commons.variant"),
                align: "start",
                value: "variant_id",
              },
            ]
          : []),
        {
          title: this.$t("virtual_items_list.table.data"),
          align: "center",
          value: "data",
        },

        {
          title: this.$t("virtual_items_list.table.status"),
          align: "center",
          value: "status",
        },

        {
          title: this.$t("virtual_items_list.table.order"),
          align: "center",
          sortable: false,
          value: "order",
        },

        {
          title: this.$t("virtual_items_list.table.updated_at"),
          align: "start",
          value: "updated_at",
        },
        {
          title: this.$t("virtual_items_list.table.delete"),
          align: "center",
          sortable: false,
          value: "delete",
        },
      ];
    },

    hasVariants() {
      return this.product_variants && this.product_variants.length;
    },
  },

  watch: {
    // Pagination:
    options: {
      handler() {
        const { sortBy, page, itemsPerPage } = this.options;
        this.fetchVirtualItems(
          page,
          sortBy[0]?.key,
          sortBy[0]?.order === "desc",
        );
      },
      deep: true,
    },
    filter_list() {
      const { sortBy, page, itemsPerPage } = this.options;
      this.fetchVirtualItems(page, sortBy[0]?.key, sortBy[0]?.order === "desc");
    },

    // Update route to keep variant (Can open variant directly by the url)
    current_item(current_item) {
      if (
        current_item &&
        this.getId(this.$route.query.variant_id) === current_item.id
      )
        return;
      this.$router.replace({
        query: current_item ? { variant_id: current_item.id } : null,
      });
    },
  },

  created() {
    this.product_variants = this.product.product_variants;
    if (!this.product_variants) this.product_variants = [];

    // Auto open variant by query parameter:
    if (this.$route.query.variant_id) {
      this.current_item = this.product_variants.find(
        (item) => item.id === Number(this.$route.query.variant_id),
      );
      if (this.current_item) {
        this.dialog_pre = true;
        this.dialog = true;
      }
    }
  },

  methods: {
    deleteItem(item) {
      this.busy_delete = item;

      axios
        .delete(
          window.API.DELETE_VIRTUAL_ITEM(
            this.product.shop_id,
            this.product.id,
            item.id,
          ),
        )
        .then(({ data }) => {
          if (!data.error) {
            this.DeleteItemByID(this.virtual_items, data.id);
            NotificationService.showSuccessAlert(
              null,
              this.$t("virtual_items_list.notifications.delete_success"),
            );
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_delete = null;
        });
    },

    refreshList() {
      this.page = 1;
      const { sortBy, page, itemsPerPage } = this.options;
      this.fetchVirtualItems(1, sortBy[0]?.key, sortBy[0]?.order === "desc");
    },

    fetchVirtualItems(page, sortBy, sortDesc = true) {
      this.busy_fetch = true;

      axios
        .get(
          window.API.GET_ALL_VIRTUAL_ITEMS(
            this.product.shop_id,
            this.product.id,
          ),
          {
            params: {
              status_filter: this.filter_list,

              offset: (page - 1) * this.itemsPerPage,
              limit: this.itemsPerPage,
              sortBy: sortBy,
              sortDesc: sortDesc,
            },
          },
        )
        .then(({ data }) => {
          this.virtual_items = data.virtual_items;
          this.totalItems = data.total;
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_fetch = false;
        });
    },

    showDetail(item) {
      this.current_item = item;
      this.dialog_edit = true;
      this.$emit("onSelect", item);
    },

    showEdit(product_variant) {
      this.current_item = product_variant;
      this.dialog_pre = false;
      this.$nextTick(() => {
        this.dialog_pre = true;
        this.dialog = true;
      });
    },

    //――――――――――――――――――――――― Variant ▶ Add ―――――――――――――――――――――――

    addOrUpdateProductVariant(variant) {
      this.busy_save = true;

      let url = null;

      if (this.IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢*/) {
        url = variant.id
          ? window.VAPI.POST_MY_VENDOR_EDIT_VARIANT(
              this.product.vendor_id,
              this.product.id,
              variant.id,
            )
          : window.API.POST_MY_VENDOR_ADD_VARIANT(
              this.product.vendor_id,
              this.product.id,
            );
      } else {
        url = variant.id
          ? window.API.POST_EDIT_VARIANT(
              this.product.shop_id,
              this.product.id,
              variant.id,
            )
          : window.API.POST_ADD_VARIANT(this.product.shop_id, this.product.id);
      }

      axios
        .post(url, {
          sku: variant.sku,
          mpn: variant.mpn,

          color: variant.color,
          type: variant.type,

          pricing: variant.pricing,

          price: variant.price,
          currency: variant.currency,
          commission: variant.commission,
          discount: variant.discount,

          dis_start: variant.dis_start,
          dis_end: variant.dis_end,

          price_label: variant.price_label,

          quantity: variant.quantity,
          image: variant.image,
          enable: variant.enable,
        })
        .then(({ data }) => {
          if (!data.error) {
            NotificationService.showSuccessAlert(
              null,
              this.$t(
                "product_admin.inventory.variants.notifications.add_success",
              ),
            );
            this.product.variants = data.variants;
            this.product.quantity = data.quantity;

            // Update in local list:
            this.AddOrUpdateItemByID(
              this.product_variants,
              data.product_variant,
            );

            // Update in main product:
            if (
              !this.product.product_variants ||
              !Array.isArray(this.product.product_variants)
            ) {
              this.product.product_variants = [];
            }

            this.AddOrUpdateItemByID(
              this.product.product_variants,
              data.product_variant,
            );

            this.dialog = false;

            this.$forceUpdate(); // Update vue component!
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_save = false;
        });
    },

    //――――――――――――――――――――――― Variant ▶ Delete ―――――――――――――――――――――――

    deleteProductVariant(variant_id) {
      this.busy_delete = true;

      axios
        .delete(
          this.IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢*/
            ? window.VAPI.DELETE_MY_VENDOR_VARIANT(
                this.product.vendor_id,
                this.product.id,
                variant_id,
              )
            : window.API.DELETE_VARIANT(
                this.product.shop_id,
                this.product.id,
                variant_id,
              ),
        )
        .then(({ data }) => {
          if (!data.error) {
            NotificationService.showSuccessAlert(
              null,
              this.$t(
                "product_admin.inventory.variants.notifications.delete_success",
              ),
            );
            this.product.variants = data.variants;
            this.product.quantity = data.quantity;

            this.DeleteItemByID(this.product_variants, variant_id);

            this.dialog = false;

            this.$forceUpdate(); // Update vue component!
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_delete = false;
        });
    },

    //――――――――――――――――――――――― Variant ▶ Restore ―――――――――――――――――――――――

    restoreProductVariant(variant_id) {
      this.busy_restore = variant_id;

      axios
        .post(
          this.IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢*/
            ? window.VAPI.POST_MY_VENDOR_RESTORE_DELETED_VARIANT(
                this.product.vendor_id,
                this.product.id,
                variant_id,
              )
            : window.API.POST_RESTORE_DELETED_VARIANT(
                this.product.shop_id,
                this.product.id,
                variant_id,
              ),
        )
        .then(({ data }) => {
          if (!data.error) {
            NotificationService.showSuccessAlert(
              null,
              "The product variant was restored successfully.",
            );
            this.product.variants = data.variants;
            this.product.quantity = data.quantity;

            this.AddOrUpdateItemByID(
              this.product_variants,
              data.product_variant,
            );

            this.$forceUpdate(); // Update vue component!
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_restore = null;
        });
    },
  },
};
</script>

<style lang="scss" scoped></style>
