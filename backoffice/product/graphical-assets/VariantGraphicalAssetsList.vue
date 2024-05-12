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
  <v-container class="text-start">
    <u-loading-progress v-if="busy_fetch"></u-loading-progress>

    <div>
      <b>How it works? </b><br />
      Upload pattern or item images here. To display these images as a variant
      option, add <b>{filename}</b> to the variant value. You can not use the
      code in <b><s>color</s></b> value.
    </div>
    <v-row no-gutters>
      <div class="woven-texture"></div>
      <div class="knitted-texture"></div>
      <div class="leather-texture"></div>
    </v-row>

    <div>
      <b>How set name?</b><br />
      We use the first 12 characters of the uploaded file name as the asset
      name. This option allows you to display customizable aspects of a product,
      such as a motorcycle's tire size or fabric patterns. It is recommended to
      avoid uploading images of variants here due to the limited maximum count
      of variant graphical assets. This option should only be used if the number
      of variant types, such as wood types of furniture, is fewer than 100.
    </div>

    <v-row align="center">
      <v-col key="-add-" cols="12" lg="3" md="4" sm="6">
        <s-image-uploader
          v-if="!IS_VENDOR_PANEL /*Not supported for vendor to add!*/"
          :max-files="20"
          :server="uploadPath"
          allow-multiple
          class="marginal-center"
          dense
          disable-past
          max-file-size="512KB"
          @response="handleUploadAppImages"
        >
        </s-image-uploader>
      </v-col>

      <v-col
        v-for="item in variant_assets"
        :key="item.name"
        cols="6"
        lg="2"
        md="3"
        sm="4"
      >
        <div class="border rounded-28px pa-2 row-hover">
          <v-card
            :image="getShopImagePath(item.path)"
            class="ptr-card"
            flat
            rounded="xl"
            title="Click to copy asset code."
            @click="copyToClipboard(`{${item.name}}`)"
          >
            <v-card-title class="ptr-text">
              {{ item.name }}
            </v-card-title>
            <v-btn
              :loading="item === busy_delete"
              class="absolute-bottom-end hover-scale-small"
              color="red"
              icon
              size="small"
              title="Delete asset"
              variant="flat"
              @click="deleteVariantAssets(item)"
            >
              <v-icon>close</v-icon>
            </v-btn>
          </v-card>
        </div>
      </v-col>
    </v-row>

    <v-pagination
      v-if="page_count > 1"
      v-model="page"
      :length="page_count"
      rounded
    />
  </v-container>
</template>

<script>
import SImageUploader from "../../../ui/uploader/SImageUploader.vue";
import _ from "lodash-es";

export default {
  name: "VariantGraphicalAssetsList",
  components: { SImageUploader },
  props: {
    shop: {
      required: true,
    },
    vendor: {
      /*🟢 Vendor Panel 🟢*/ required: false,
    },
  },

  data: () => ({
    busy_fetch: false,
    busy_delete: null,

    variant_assets: [],

    // Pagination:
    page: 1,
    itemsPerPage: 20,
    totalItems: 0,

    search: null,
  }),

  computed: {
    IS_VENDOR_PANEL() {
      /*🟢 Vendor Panel 🟢*/
      return (
        this.$route.params.vendor_id &&
        this.$route.matched.some((record) => record.meta.vendor)
      );
    },

    uploadPath() {
      return window.API.POST_SHOP_VARIANT_ASSET_UPLOAD(this.shop.id);
    },
    page_count() {
      return Math.ceil(this.totalItems / 10);
    },
  },

  watch: {
    // Pagination:
    page(page) {
      this.fetchVariantAssets(page);
    },

    search: _.throttle(function (newVal, oldVal) {
      this.fetchVariantAssets(1);
    }, window.SERACH_THROTTLE),
  },

  mounted() {
    this.fetchVariantAssets();
  },

  methods: {
    fetchVariantAssets(page = 1) {
      this.busy_fetch = true;

      axios
        .get(window.API.GET_SHOP_VARIANT_ASSETS(this.shop.id), {
          params: {
            offset: (page - 1) * this.itemsPerPage,
            limit: this.itemsPerPage,

            search: this.search,
          },
        })
        .then(({ data }) => {
          if (!data.error) {
            this.variant_assets = data.variant_assets;
            this.totalItems = data.total;
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_fetch = false;
        });
    },
    deleteVariantAssets(asset) {
      this.openDangerAlert(
        "Delete variant asset",
        "Upon removing this asset, any associated variant images will no longer be displayed. However, if you upload a new image with the same file name, the new image will be shown instead.",
        "Yes, Delete now",
        () => {
          this.busy_delete = asset;

          axios
            .delete(
              window.API.DELETE_SHOP_VARIANT_ASSET_UPLOAD(
                this.shop.id,
                asset.id,
              ),
            )
            .then(({ data }) => {
              if (!data.error) {
                this.DeleteItemByID(this.variant_assets, data.id);
                this.totalItems--;
              } else {
                this.showErrorAlert(null, data.error_msg);
              }
            })
            .catch((error) => {
              this.showLaravelError(error);
            })
            .finally(() => {
              this.busy_delete = null;
            });
        },
      );
    },

    handleUploadAppImages(response) {
      if (response.variant_asset) {
        this.AddOrUpdateItemByID(this.variant_assets, response.variant_asset);
        this.totalItems++;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.ptr-card {
  aspect-ratio: 1;

  .ptr-text {
    text-shadow:
      -2px -2px 5px #ffffff,
      2px -2px 5px #ffffff,
      -2px 2px 5px #ffffff,
      2px 2px 5px #ffffff;
  }
}

.woven-texture,
.knitted-texture,
.leather-texture {
  margin: 12px;
  border-radius: 12px;
  width: 48px;
  height: 48px;
  overflow: hidden;
  aspect-ratio: 1;
  border: solid thin #aaa;
}

.woven-texture {
  background-image: repeating-linear-gradient(
    45deg,
    rgba(0, 0, 0, 0.1),
    rgba(0, 0, 0, 0.1) 10px,
    rgba(255, 255, 255, 0.1) 10px,
    rgba(255, 255, 255, 0.1) 20px
  );
}

.knitted-texture {
  background-image: repeating-radial-gradient(
    circle at center,
    rgba(255, 255, 255, 0.2) 0%,
    rgba(255, 255, 255, 0.2) 5%,
    rgba(0, 0, 0, 0.2) 5%,
    rgba(0, 0, 0, 0.2) 10%
  );
}

.leather-texture {
  background-image: repeating-linear-gradient(
    90deg,
    transparent,
    transparent 5px,
    rgba(0, 0, 0, 0.1) 5px,
    rgba(0, 0, 0, 0.1) 10px
  );
}
</style>
