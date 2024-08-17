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
  <v-container class="pt-3 pb-16 my-3 text-start">
    <v-list class="overflow-visible" lines="3">
      <v-list-item
        v-for="item in available_types"
        :key="item.code"
        :class="{ disabled: !item.enable }"
        class="widget-hover -gray-bg widget-button"
        @click="$emit('select', item)"
      >
        <template v-slot:prepend>
          <v-avatar rounded="0">
            <img :src="item.image" />
          </v-avatar>
        </template>

        <v-list-item-title>
          {{ $t(item.name) }}
        </v-list-item-title>

        <v-list-item-subtitle>
          {{ $t(item.description) }}
        </v-list-item-subtitle>

        <v-list-item-subtitle class="op-1-0">
          <v-chip
            v-if="item.code === ProductType.SERVICE.code"
            color="green"
            size="x-small"
            variant="tonal"
            class="mt-1"
          >
            ● {{$t('global.commons.installment')}} / {{$t('global.commons.split_payment')}}</v-chip
          >
          <v-chip
            v-if="item.code === ProductType.SUBSCRIPTION.code"
            color="green"
            size="x-small"
            variant="tonal"
            class="mt-1"
          >
            ● {{$t('global.commons.recurring_payment')}} </v-chip
          >
        </v-list-item-subtitle>

        <v-expand-transition>
          <div v-if="expanded_type === item" class="max-widget-width mx-auto">
            <!-- ━━━━━━━━━━━━━ Pods ━━━━━━━━━━━━━ -->
            <order-type-minimal-flow
              :type="item"
              class="mt-2"
            ></order-type-minimal-flow>
            <!-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ -->
            <div class="mt-5 typo-body" style="line-height: 1.5em !important">
              <div v-if="item === ProductType.FILE">
                Use this type for selling files. This allows you to upload your
                files to the Selldone cloud at no cost and sell them using your
                custom domain.
              </div>

              <div v-else-if="item === ProductType.PHYSICAL">
                The physical type is ideal for selling tangible goods. It can
                also be used for selling services with a fixed price, such as
                theatre tickets or home services, essentially treating them as
                physical tokens or vouchers.
              </div>

              <div v-else-if="item === ProductType.VIRTUAL">
                Use the Virtual product type for selling items that require no
                delivery or shipping. This type is also suitable for instances
                where information, such as gift card codes, needs to be sent
                post-purchase.
              </div>

              <div v-else-if="item === ProductType.SERVICE">
                Use this type for order verification, final price determination,
                or checking availability prior to customer payment. Products of
                the Service type undergo an additional verification process.
                This process, to be carried out by the seller, takes place after
                the user completes the order checkout and prior to the final
                payment.
              </div>

              <div v-else-if="item === ProductType.SUBSCRIPTION">
                This type can be used to sell subscription services, products,
                and content. Note that only certain payment gateways, such as
                Stripe, support the subscription model.
              </div>
            </div>
          </div>
        </v-expand-transition>

        <template v-slot:append>
          <v-list-item-action end>
            <!-- ✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜ In App Help (Help Center) ✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜ -->
            <inline-help :code="'SHOP:PRODUCTS:ADD:' + item.code"></inline-help>
            <!-- ✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜ -->
          </v-list-item-action>

          <v-list-item-action>
            <v-btn
              class="ms-2"
              icon
              title="Show more information about this product type."
              variant="plain"
              @click.stop="
                expanded_type = expanded_type === item ? undefined : item
              "
            >
              <v-icon size="small">info</v-icon>
            </v-btn>
          </v-list-item-action>
        </template>
      </v-list-item>

      <v-divider></v-divider>
      <!-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ Select Product From Repository ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ -->

      <v-list-item
        v-if="hasAddSku"
        key="sku"
        class="widget-hover -gray-bg widget-button"
        @click="add_by_sku = !add_by_sku"
      >
        <template v-slot:prepend>
          <v-avatar rounded="0">
            <img src="../../../../assets/icons/sku.svg" />
          </v-avatar>
        </template>

        <v-list-item-title>
          {{ $t("product_studio.by_sku.title") }}
          <v-chip
            class="m-1 pa-1"
            color="#eee"
            label
            size="x-small"
            variant="flat"
            >some countries
          </v-chip>
        </v-list-item-title>

        <v-list-item-subtitle>
          {{ $t("product_studio.by_sku.subtitle") }}

        </v-list-item-subtitle>
      </v-list-item>

      <!-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ Add By Drop shipping ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ -->

      <v-list-item
        v-if="hasAddDropshipping && !IS_VENDOR_PANEL /*🟢 Not Vendor Panel 🟢*/"
        key="ds"
        :class="{ disabled: !can_reselling }"
        class="widget-hover -gray-bg widget-button"
        @click="dropshipping = !dropshipping"
        append-icon="conveyor_belt"
      >
        <template v-slot:prepend>
          <v-avatar rounded="0">
            <img src="../../../../assets/icons/dropshipping-outline.svg" />
          </v-avatar>
        </template>

        <v-list-item-title>
          {{ $t("global.commons.drop_shipping") }}
          <v-chip
            class="m-1 pa-1"
            color="#eee"
            label
            size="x-small"
            variant="flat"
            >wholesalers on
            <img
              class="ms-1"
              height="12"
              src="../../../../assets/selldone-logo/logo-box.svg"
              width="12"
          /></v-chip>
        </v-list-item-title>

        <v-list-item-subtitle>
          {{
            !can_reselling
              ?$t("product_studio.your_license_is_not_eligible")
              : $t("product_studio.drop_shipping.subtitle")
          }}
        </v-list-item-subtitle>
      </v-list-item>

      <!-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ Connect ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ -->

      <v-list-item
        v-if="hasAddConnectOs && !IS_VENDOR_PANEL /*🟢 Not Vendor Panel 🟢*/"
        key="cn"
        :to="{ name: 'BPageShopChannelConnect' }"
        class="widget-hover -gray-bg widget-button"
      >
        <template v-slot:prepend>
          <v-avatar rounded="0">
            <img src="../../../../assets/icons/connect.svg" />
          </v-avatar>
        </template>

        <v-list-item-title>
          {{ $t("global.commons.drop_shipping") }}
          <v-chip
            class="m-1 pa-1"
            color="#eee"
            label
            size="x-small"
            variant="flat"
            >Connect OS
          </v-chip>
        </v-list-item-title>

        <v-list-item-subtitle>
          {{$t("product_studio.by_connect.subtitle")  }}

        </v-list-item-subtitle>
      </v-list-item>
    </v-list>

    <!-- ██████████████████████ Add by SKU ██████████████████████ -->

    <v-dialog
      v-model="add_by_sku"
      fullscreen
      scrollable
      transition="dialog-bottom-transition"
    >
      <v-card class="text-start">
        <v-card-title>
          <v-avatar class="me-2 avatar-gradient -thin -shop" size="36"
            ><v-img :src="getShopImagePath(shop.icon, 128)"
          /></v-avatar>

          {{ shop.title }}
        </v-card-title>

        <v-card-text>

          <v-container class="mb-12" fluid>
            <v-row>
              <v-col
                v-for="item in search_result"
                :key="item.id"
                cols="12"
                lg="3"
                md="4"
                sm="6"
                xl="2"
              >
                <v-card
                  :loading="busy_add_from_repository === item.id"
                  class="min-h-100 overflow-hidden"
                  rounded="lg"
                  variant="outlined"
                  @click="showRepositoryDialog(item)"
                >
                <div class="d-flex align-start pa-2">
                  <v-avatar class="flex-grow-0" rounded size="84">
                    <v-img
                        v-if="item.icon"
                        :src="getShopImagePath(item.icon)"
                    ></v-img>
                    <v-icon v-else>breakfast_dining</v-icon>
                  </v-avatar>

               <div class="ps-2">
                 <div class="text-subtitle-2">
                   {{ item.title }}
                 </div>
                 <div
                     class="font-weight-black pt-1 english-field small"
                     dir="ltr"
                 >
                   SKU: {{ item.sku }}
                 </div>

                 <div v-if="auto_category">
                      <span v-if="item.parent2_category">
                        {{ item.parent2_category }}

                        <v-icon size="small">{{
                            $t("icons.angle_next")
                          }}</v-icon>
                      </span>

                   <span v-if="item.parent_category">
                        {{ item.parent_category }}

                        <v-icon size="small">{{
                            $t("icons.angle_next")
                          }}</v-icon>
                      </span>

                   {{ item.category }}
                 </div>
                 <div v-else>{{$t('product_studio.add_in_current_category')}}</div>

                 <div v-if="item.brand">
                   {{ $t("global.commons.brand") }}: {{ item.brand }}
                 </div>

                 <div v-if="item.price">
                   {{ $t("global.commons.price") }}:
                   <u-price
                       :amount="item.price"
                       :currency="item.currency"
                   ></u-price>
                 </div>

               </div>

                </div>

                </v-card>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>

        <div style="position: fixed;bottom: 0;left: 0;right: 0;z-index: 2;">
          <v-sheet  color="#eee" rounded="t-xl" class="mx-auto pa-4" max-width="98vw" width="640" elevation="3">
            <s-widget-header
                icon="note_add"
                :title="$t('product_studio.sku_dialog.title')"
            ></s-widget-header>
            <v-list-subheader>
              {{ $t('product_studio.sku_dialog.subtitle') }}

            </v-list-subheader>
            <v-text-field
                v-model="sku"
                :label="$t('product_studio.sku_name_input')"
                class="max-width-field-large mx-auto m-2 mt-4 border-green-input"
                clearable
                color="green"
                hide-details
                prepend-inner-icon="qr_code_scanner"
                rounded
                variant="solo"
            >
              <template v-slot:append-inner>
                <v-btn
                    :class="{ disabled: !sku || sku.length < 4 }"
                    :loading="busy_search"
                    color="success"
                    rounded
                    variant="flat"
                    @click="searchSku()"
                >{{ $t("global.actions.search") }}
                </v-btn>
              </template>
            </v-text-field>

            <div class="widget-buttons">
              <v-btn size="x-large" variant="text" @click="add_by_sku = false">
                <v-icon start>close</v-icon>
                {{ $t("global.actions.close") }}
              </v-btn>
            </div>
          </v-sheet>
        </div>



      </v-card>
    </v-dialog>
    <!-- ██████████████████████ Add Drop Shipping ██████████████████████ -->
    <v-dialog
      v-model="dropshipping"
      fullscreen
      scrollable
      transition="dialog-bottom-transition"
    >
      <v-card class="text-start">
        <v-card-title class="d-flex align-center">
          <v-avatar class="me-2 avatar-gradient -thin -shop" size="36"
            ><v-img :src="getShopImagePath(shop.icon, 128)"
          /></v-avatar>


          <div>
            {{ shop.title }}
            <div class="text-subtitle-2">
              {{$t('product_studio.dropshipping_dialog.title') }}

            </div>
          </div>
        </v-card-title>

        <v-card-text>
          <b-product-add-dropshipping
            :shop="shop"
            @back="dropshipping = false"
          >
          </b-product-add-dropshipping>
        </v-card-text>
        <v-card-actions>
          <div class="widget-buttons">
            <v-btn size="x-large" variant="text" @click="dropshipping = false">
              <v-icon start>close</v-icon>
              {{ $t("global.actions.close") }}
            </v-btn>
          </div>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ██████████████████████ Dialog Add From Repository ██████████████████████ -->

    <v-bottom-sheet
      v-model="dialog_repository"
      content-class="rounded-t-xl"
      max-width="840"
      scrollable
    >
      <v-card v-if="selected_repository" class="rounded-t-xl">
        <v-card-title class="text-start">
          <v-avatar class="flex-grow-0 me-2" rounded>
            <v-img
              v-if="selected_repository.icon"
              :src="getShopImagePath(selected_repository.icon)"
            ></v-img>

            <v-icon v-else>breakfast_dining</v-icon>
          </v-avatar>
          {{ selected_repository.title }}
        </v-card-title>
        <v-card-text>
          <div class="widget-box my-5">
            <s-widget-header
              icon="shelves"
              title="Inventory & Price"
            ></s-widget-header>
            <u-number-input
              v-model="quantity"
              :label="$t('product_admin.inventory.variants.count_input')"
              :min="0"
              append-icon="inventory"
              class="strong-field"
            >
            </u-number-input>

            <u-price-input
              v-model="price"
              :label="$t('add_product.pricing.price_input')"
              :rules="[GlobalRules.required()]"
              class="strong-field"
              :currency="currency"
              placeholder="0.00"
              required
            >
            </u-price-input>

            <u-currency-input
              v-model="currency"
              :activeCurrencies="shop.currencies"
            />

            <u-smart-toggle
              v-model="auto_category"
              :false-title="$t('product_studio.add_in_current_category')"
              :true-description="$t('product_studio.category_mode_message')"
              :true-title="$t('product_studio.auto_category')"
            >
            </u-smart-toggle>
            <v-expand-transition>
              <div v-if="auto_category">
                <div class="d-flex align-center py-3">
                  <v-icon class="me-1">folder</v-icon>

                  <span v-if="selected_repository.parent2_category">
                    {{ selected_repository.parent2_category }}

                    <v-icon class="mx-2" size="small">{{
                      $t("icons.angle_next")
                    }}</v-icon>
                  </span>

                  <span v-if="selected_repository.parent_category">
                    {{ selected_repository.parent_category }}

                    <v-icon class="mx-2" size="small">{{
                      $t("icons.angle_next")
                    }}</v-icon>
                  </span>

                  {{ selected_repository.category }}
                </div>
              </div>
              <div v-else>
                <div class="py-3">
                  <v-icon class="me-1">home</v-icon>
                  {{$t('product_studio.add_in_current_category')}}
                </div>
              </div>
            </v-expand-transition>
          </div>
        </v-card-text>
        <v-card-actions>
          <div class="widget-buttons">
            <v-btn
              size="x-large"
              variant="text"
              @click="dialog_repository = false"
            >
              <v-icon start>close</v-icon>
              {{ $t("global.actions.cancel") }}
            </v-btn>

            <v-btn
              :class="{ disabled: !price || !currency }"
              :loading="busy_add_from_repository === selected_repository.id"
              color="primary"
              size="x-large" variant="elevated"
              @click="addFromRepository(selected_repository.id)"
            >
              <v-icon start>add</v-icon>
              {{ $t("global.actions.add") }}
            </v-btn>
          </div>
        </v-card-actions>
      </v-card>
    </v-bottom-sheet>
  </v-container>
</template>

<script>
import InlineHelp from "../../../help/InlineHelp.vue";
import OrderTypeMinimalFlow from "../../../product/widgets/OrderTypeMinimalFlow.vue";
import { ProductType } from "@selldone/core-js/enums/product/ProductType";
import { ShopOptionsHelper } from "@selldone/core-js/helper/shop/ShopOptionsHelper";
import BProductAddDropshipping from "../../../product/add/drop-shipping/BProductAddDropshipping.vue";
import { Currency } from "@selldone/core-js/enums/payment/Currency";
import { Eligible } from "@selldone/core-js/enums/shop/ShopLicense";
import UPriceInput from "../../../../ui/price/input/UPriceInput.vue";
import UNumberInput from "../../../../ui/number/input/UNumberInput.vue";
import USmartToggle from "../../../../ui/smart/toggle/USmartToggle.vue";
import UCurrencyInput from "../../../../ui/currency/input/UCurrencyInput.vue";
import _ from "lodash-es";

export default {
  name: "BProductEditType",
  components: {
    UCurrencyInput,
    USmartToggle,
    UNumberInput,
    UPriceInput,
    BProductAddDropshipping,
    OrderTypeMinimalFlow,
    InlineHelp,
  },

  props: {
    shop: {
      required: true,
      type: Object,
    },

    hasAddDropshipping: {
      default: false,
      type: Boolean,
    },
    hasAddSku: {
      default: false,
      type: Boolean,
    },
    hasAddConnectOs: {
      default: false,
      type: Boolean,
    },
  },
  data: function () {
    return {
      expanded_type: null,

      add_by_sku: false,
      dropshipping: false,

      //---------------------------
      sku: null,
      busy_search: false,
      search_result: [],
      auto_category: true,
      busy_add_from_repository: null,

      selected_repository: null,
      dialog_repository: false,

      //---------------------------

      quantity: 0,
      currency: null,
      price: 0,
    };
  },
  computed: {
    IS_VENDOR_PANEL() {
      /*🟢 Vendor Panel 🟢*/
      return (
        this.$route.params.vendor_id &&
        this.$route.matched.some((record) => record.meta.vendor)
      );
    },

    option_types() {
      return ShopOptionsHelper.GetActiveTypes(this.shop);
    },

    available_types() {
      return Object.values(ProductType).filter((t) =>
        this.option_types.includes(t.code),
      );
    },

    can_reselling() {
      return Eligible.CanReselling(this.shop);
    },
  },

  mounted() {},

  watch: {
    sku: _.throttle(function (newVal, oldVal) {
      if (newVal.length < 4) return;
      this.searchSku();
    }, 1500),
  },

  methods: {
    searchSku() {
      this.busy_search = true;

      axios
        .get(
          this.IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢*/
            ? window.VAPI.GET_MY_VENDOR_SEARCH_PRODUCT_REPOSITORY_SKU()
            : window.API.GET_SEARCH_PRODUCT_REPOSITORY_SKU(),

          {
            params: {
              sku: this.sku,
            },
          },
        )
        .then(({ data }) => {
          if (data.error) {
            this.showErrorAlert(null, data.error_msg);
          } else {
            this.search_result = data.result;
            if (!data.result.length) {
              this.showWarningAlert(
                null,
                "Product not exist in our repository!",
              );
            }
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_search = false;
        });
    },

    showRepositoryDialog(repository) {
      this.selected_repository = repository;
      this.dialog_repository = true;

      this.currency = Currency[repository.currency];
      this.price = repository.price;
      this.quantity = 100;
    },
    addFromRepository(repository_id) {
      this.busy_add_from_repository = repository_id;

      axios
        .post(
          this.IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢*/
            ? window.VAPI.POST_MY_VENDOR_ADD_PRODUCT_BY_REPOSITORY(
                this.vendor.id,
              )
            : window.API.POST_ADD_PRODUCT_BY_REPOSITORY(this.shop.id),

          {
            repository_id: repository_id,
            auto_category: this.auto_category,
            category_id: this.$route.query.dir,

            quantity: this.quantity,
            currency: this.currency.code,
            price: this.price,
          },
        )
        .then(({ data }) => {
          if (data.error) {
            this.showErrorAlert(null, data.error_msg);
          } else {
            this.showSuccessAlert(null, "The product added successfully.");
            this.dialog_repository = false;
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_add_from_repository = null;
        });
    },
  },
};
</script>

<style lang="scss" scoped></style>
