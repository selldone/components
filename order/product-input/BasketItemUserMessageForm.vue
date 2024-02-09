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
  <v-sheet
    v-if="show_inputs"
    style="border-radius: 12px"
    class="py-3 px-2 position-relative text-start"
    :class="{
      'pointer-pointer': !show,
      'hover-bg': !readonly && !forceShow,
      'is-show': show,
    }"
    :color="color"
  >
    <template v-if="!forceShow">
      <div @click.stop="show = !show" class="pointer-pointer">
        <p class="small m-0 not-selectable">
          {{ $t("global.basket_item_message.title") }}
          <v-progress-linear
            v-if="has_fields"
            :model-value="fill_percent"
            rounded
            striped
            color="#000"
            style="max-width: 166px"
          ></v-progress-linear>
        </p>

        <div
          v-if="show"
          v-html="convertToHtml(product.message)"
          class="mb-3 me-5 mt-3 fadeIn typo-body"
        ></div>
      </div>

      <v-icon class="absolute-top-end" :class="{ 'fa-rotate-180': show }"
        >keyboard_arrow_down
      </v-icon>
    </template>

    <v-expand-transition>
      <div v-if="show">
        <s-basket-product-inputs
          :readonly="readonly"
          ref="form"
          v-model="message"
          :product="product"
          v-model:files="files"
          :uploadedFiles="uploaded_files"
          @onDeleteFile="onDeleteFile"
          :is-admin="isAdmin"
          class="max-w-640 mx-auto py-5"
        ></s-basket-product-inputs>
      </div>
    </v-expand-transition>

    <div class="widget-buttons">
      <v-btn
        v-if="show && !readonly && has_fields"
        @click="saveBasketItemMessage(product.id, variantId)"
        size="x-large"
        color="#000"
        :loading="busy"
      >
        <v-icon start>save</v-icon>

        {{ $t("global.basket_item_message.save_actions") }}
      </v-btn>
    </div>
  </v-sheet>
  <div v-else-if="show_inputs_preview" class="text-start">
    <p
      v-if="product.message"
      class="typo-body m-0"
      v-html="convertToHtml(product.message)"
    ></p>
    <div class="text-muted mb-3">
      {{ $t("global.basket_item_message.product_inputs_preview_message") }}
    </div>

    <ul class="border-between-vertical">
      <li
        v-for="input in product.inputs"
        :key="input.name"
        class="py-1"
        v-html="convertToHtml(input.title)"
      ></li>
    </ul>
  </div>
</template>

<script>
import SBasketProductInputs from "./SBasketProductInputs.vue";
import {
  FORM_BUILDER_TAGS,
  SmartConvertTextToHtml,
} from "@core/helper/html/HtmlHelper";

export default {
  name: "BasketItemUserMessageForm",
  components: { SBasketProductInputs },
  props: {
    product: {
      require: true,
    },
    variantId: {
      require: false,
    },
    basket: {
      require: true,
    },
    readonly: {
      default: false,
      type: Boolean,
    },
    isAdmin: {
      default: false,
      type: Boolean,
    },
    forceShow: {
      default: false,
      type: Boolean,
    },
    color: {},
  },
  data: () => ({
    message: {},
    show: false,
    busy: false,
    files: [],
    invalidate: 0,
  }),

  computed: {
    inputs_length() {
      // Just editable fields
      return this.product.inputs?.filter((i) =>
        ["text", "select", "switch", "file", null].includes(i.type),
      ).length;
    },

    has_fields() {
      return this.product.inputs && this.inputs_length;
    },
    show_inputs_preview() {
      return this.has_fields;
    },
    corresponding_basket_item() {
      return this.basket.items.find(
        (item) =>
          item.product_id === this.product.id &&
          item.variant_id === this.variantId,
      );
    },

    show_inputs() {
      return (
        this.corresponding_basket_item &&
        (this.product.message ||
          (this.product.inputs && this.inputs_length > 0))
      );
    },

    fill_percent() {
      const i = this.invalidate;
      if (!this.show_inputs || !this.product.inputs || !this.inputs_length)
        return 0;
      let out = 0;
      const x = 100 / this.inputs_length;
      this.product.inputs.forEach((item) => {
        out +=
          this.message[item.name] || this.isBoolean(this.message[item.name])
            ? x
            : 0;
        out += this.uploaded_files.some((f) => f.key === item.name) ? x : 0;
      });

      return out;
    },

    uploaded_files() {
      return (
        this.corresponding_basket_item && this.corresponding_basket_item.files
      );
    },
  },

  watch: {
    corresponding_basket_item(val) {
      // Find current basket item:
      if (val) this.message = Object.assign({}, val.message);
      // After save in server update basket item user message!
      else this.message = {};
    },
    "corresponding_basket_item.id"() {
      this.show = this.fill_percent < 95 || this.forceShow;
    },
  },
  methods: {
    saveBasketItemMessage(product_id, variant_id) {
      this.busy = true;

      let formData = new FormData();

      formData.append("basket_id", this.basket.id);
      if (variant_id) {
        formData.append("variant_id", variant_id);
      }
      if (this.message) {
        const json = JSON.stringify(this.message);
        formData.append("message", json);
      }

      if (this.files) {
        Object.keys(this.files).forEach((key) => {
          let val = this.files[key];
          if (val && Array.isArray(val)) val = val.length ? val[0] : null; // <v-file-input> return array!
          // console.log("file", val);

          if (val) {
            if (Array.isArray(val)) {
              val.forEach((file) => {
                formData.append("files-" + key + "[]", file); // Multiple files
              });
            } else {
              formData.append("files-" + key, val); // Single file
            }
          }
        });
      }

      axios
        .post(
          window.XAPI.POST_BASKET_ITEM_MESSAGE(this.getShop().name, product_id),
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          },
          /* {
                    basket_id: this.basket.id,
                    variant_id: variant_id,
                    message: this.message,
                  }*/
        )
        .then(({ data }) => {
          if (!data.error) {
            let basket_item = this.basket.items.find(
              (item) => item.id === data.item.id,
            );
            if (!basket_item)
              this.AddOrUpdateItemByID(this.basket.items, data.item);
            else {
              basket_item.message = data.item.message;

              // Force update:
              this.uploaded_files.splice(0, this.uploaded_files.length);
              this.uploaded_files.push(...data.item.files);

              this.files = []; // Reset file inputs!

              this.$forceUpdate();
              if (this.$refs.form) this.$refs.form.$forceUpdate();
            }

            this.invalidate = Math.random(); // Force invalidate completed percent!

            this.showSuccessAlert(
              null,
              this.$t("global.basket_item_message.notifications.success"),
            );
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy = false;
          this.show = this.fill_percent < 95 || this.forceShow;
        });
    },

    onDeleteFile({ item_id, file_id }) {
      let basket_item = this.basket.items.find((item) => item.id === item_id);
      this.DeleteItemByID(basket_item.files, file_id);
      this.$forceUpdate();
      this.invalidate = Math.random(); // Force invalidate completed percent!
    },

    convertToHtml(message) {
      return SmartConvertTextToHtml(message, false, false, FORM_BUILDER_TAGS);
    },
  },

  created() {
    // Find current basket item:
    if (this.corresponding_basket_item)
      this.message = Object.assign({}, this.corresponding_basket_item.message);
    // After save in server update basket item user message!
    else this.message = {};

    this.show = this.fill_percent < 95 || this.forceShow;
  },
};
</script>

<style scoped lang="scss">
.hover-bg {
  border: #000 solid 2px !important;
  transition: box-shadow 0.5s;

  /*  &:not(.is-show){
    border: #00796b solid 2px !important;
  }*/
  //background: #00796b !important;
  &:hover {
    // background: #005c4f !important;
    box-shadow: 0px 10px 50px 0px rgba(0, 0, 0, 0.2) !important;
    z-index: 2;
  }
}
</style>
