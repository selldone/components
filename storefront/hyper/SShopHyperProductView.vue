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
  <div class="s--shop-hyper-product-view">
    <v-btn
      @click="showQRScanner"
      color="blue"
      dark
      width="100%"
      depressed
      tile
      large
      class="mb-3"
    >
      <v-icon class="me-1">qr_code_scanner</v-icon>
      {{$t('global.commons.scan_qr_code')}}
    </v-btn>

    <!-- ---------------- Product Info ---------------- -->
    <div v-if="product && !busy" class="default-font product-box">
      <v-img
        :src="getShopImagePath(product.icon)"
        width="100%"
        class="zoomIn delay_500"
      >
      </v-img>

      <!-- Select variant -->

      <div class="my-3 slideInDown delay_200">
        <variant-selector-menu
          v-if="has_available_variants"
          v-model="selected_variant"
          :variants="product_variants"
        ></variant-selector-menu>
      </div>

      <v-row align="center" dense class="mx-0 fadeIn">
        <!-- Price -->

        <v-col cols="12" md="6">
          <p v-if="discount > 0">
            <price-view
              :amount="price + discount"
              class="op-0-8"
              line-through
            ></price-view>

            <v-chip small color="red" dark class="mx-1 float-end"
              >{{ discount_percent }} %
            </v-chip>
          </p>
          <p class="-price">
            <price-view :amount="price"></price-view>
          </p>
        </v-col>

        <!-- Buy button -->

        <v-col cols="12" md="6" class="text-center">
          <v-slide-y-reverse-transition hide-on-leave>
            <number-picker
              v-if="exist_in_basket"
              v-model="count"
              :min="1"
              :max="quantity"
              show-buttons
              rounded
              filled
            ></number-picker>

            <v-btn
              v-else
              color="success"
              x-large
              :class="{disabled:!hyper.currency}"
              rounded
              :loading="busyAdd"
              @click="count = 1"
              >{{$t('global.actions.add_to_cart')}}</v-btn
            >
          </v-slide-y-reverse-transition>
        </v-col>
      </v-row>
    </div>
    <v-skeleton-loader
      v-else-if="busy"
      class="mx-auto"
      max-width="300"
      type="card"
    ></v-skeleton-loader>

    <!-- ---------------------------------------------------------- -->
    <v-dialog
      v-model="show_scanner"
      max-width="680"
      content-class="no-shadow-dialog"
    >
      <v-card class="rounded-28px">
        <v-card-title>{{$t('global.commons.barcode_scanner')}}</v-card-title>
        <v-card-text v-if="show_scanner">
          <barcode-scanner @on-scan="onScan" qr-code></barcode-scanner>
        </v-card-text>
        <v-card-actions>
          <v-btn text @click="show_scanner = false">{{
            $t("global.actions.close")
          }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import VariantSelectorMenu from "../../../Applications/Backoffice/pages/product/widgets/variants/VariantSelectorMenu.vue";
import NumberPicker from "@/Components/ui/input/number/NumberPicker.vue";

export default {
  name: "SShopHyperProductView",
  components: {  NumberPicker, VariantSelectorMenu },
  props: {
    shop: {
      require: true,
      type: Object,
    },

    hyper: {
      require: true,
      type: Object,
    },
    busyAdd: {
      default: false,
      type: Boolean,
    },
  },

  data: () => ({
    busy: false,

    //-------------------
    lock:false,
    count: 0,
    product: null,
    selected_variant: null,

    // ---------------------------
    show_scanner: false,
    model: null,
  }),

  watch: {
    count(count) {
      if(!count || this.busy || this.lock)return; // No delete action here!
      this.$emit("click:add", {
        product_id: this.product.id,
        variant_id: this.selected_variant ? this.selected_variant.id : null,
        count: this.count,
      });
    },
    selected_variant(){
      this.resetCountSafe();

    },
    'hyper.items'(){
      this.resetCountSafe();

    },

  },

  computed: {
    exist_in_basket() {
      return this.hyper.items.some(
        (it) =>
          it.product_id === this.product.id &&
          (!this.has_available_variants ||
            it.variant_id === this.selected_variant.id)
      );
    },
    product_variants() {
      return this.product && this.product.product_variants;
    },

    has_available_variants() {
      return this.product_variants && this.product_variants.length;
    },

    price() {
      if (!this.product) return 0;

      return this.CalcPriceProductCurrentCurrency(
        this.shop,
        this.product,
        this.selected_variant
      );
    },
    discount_percent() {
      return this.discountProductPercent(
        this.shop,
        this.product,
        this.selected_variant
      );
    },

    discount() {
      return this.getProductDiscountAmount(
        this.shop,
        this.product,
        this.selected_variant
      );
    },

    quantity() {
      if (this.selected_variant) return this.selected_variant.quantity;
      return this.product ? this.product.quantity : 0;
    },
  },

  created() {
    // Fetch product if exist in link query:
    if (this.$route.query.product_id) {
      this.getProductInfo(this.$route.query.product_id,this.$route.query.variant_id);
    }
  },

  methods: {
    showQRScanner() {
      this.show_scanner = true;
    },
    onScan(result) {

      const product_id= this.getParameterByName("product_id", result);
      const variant_id= this.getParameterByName("variant_id", result);
      console.log(
        "onScan",
        result,
        this.getParameterByName("product_id", result),
        this.getParameterByName("variant_id", result)
      );
      if(product_id){
        this.getProductInfo(product_id,variant_id);

        this.show_scanner = false;
      }

    },
    getParameterByName(name, url) {
      name = name.replace(/[\[\]]/g, "\\$&");
      var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
      if (!results) return null;
      if (!results[2]) return "";
      return decodeURIComponent(results[2].replace(/\+/g, " "));
    },

    //------------------------------------------------------------------

    resetCountSafe(){
      this.lock=true; // Prevent trigger click:add
      const found=this.hyper.items.find(it=>it.product_id===this.product.id && (!it.variant_id || (this.selected_variant && it.variant_id===this.selected_variant.id)));
      this.count=found?found.count:0; // Reset count!

      this.$nextTick(() => {
        this.lock=false;
      });
    },

    getProductInfo(product_id,variant_id) {


      console.log(
        "********************* Get Product Info **********************"
      );
      this.busy = true;
      axios
        .get(window.XAPI.GET_PRODUCT_INFO_HYPER(this.shop_name, product_id))
        .then(({ data }) => {
          if (!data.error) {
            this.product = data.product;
            this.selected_variant = null;

            if (
              data.product.product_variants &&
              data.product.product_variants.length
            ) {
              this.selected_variant = data.product.product_variants.find(
                (it) => "" + it.id === variant_id
              );

              if (!this.selected_variant)
                this.selected_variant = data.product.product_variants[0];
            }

            this.resetCountSafe();


          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy = false;
        });
    },
  },
};
</script>

<style scoped lang="scss">
/*
━━━━━━━━━━━━━━━━━━━━ 🎺 Variables ━━━━━━━━━━━━━━━━━━━━
 */
.s--shop-hyper-product-view{

}


/*
━━━━━━━━━━━━━━━━━━━━ 🪅 Classes ━━━━━━━━━━━━━━━━━━━━
 */
.s--shop-hyper-product-view{

}
</style>
