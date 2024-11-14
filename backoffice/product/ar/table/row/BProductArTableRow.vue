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
  <tr>
    <td colspan="2">
      <b>{{ variant ? "Variant" : "Main product" }}</b>

      <v-icon v-if="hasSrc" class="mx-1" size="16" title="3D Web Render"
        >fa:fab fa-chrome
      </v-icon>
      <v-icon v-if="hasSrc" class="mx-1" size="16" title="AR Android"
        >fa:fab fa-android
      </v-icon>
      <v-icon v-if="hasIos" class="mx-1" size="16" title="AR iPhone"
        >fa:fab fa-apple
      </v-icon>

      <div class="small my-1">
        {{
          variant ? "Product variant 3D model." : "Show as default 3d model."
        }}
      </div>
    </td>
    <td colspan="3">
      <variant-item-view-micro v-if="variant" :product-variant="variant" />
    </td>

    <td>
      <v-btn
        :variant="hasSrc ? 'text' : 'elevated'"
        class="float-end tnt"
        color="primary"
        @click="item_edit = !item_edit"
      >
        <v-icon start>{{ hasSrc ? "edit" : "add" }}</v-icon>
        {{ hasSrc ? $t("global.actions.edit") : $t("global.actions.add") }}
      </v-btn>
    </td>
  </tr>

  <!------------------------------------------>
  <tr v-if="hasSrc" style="background: #f9f9f9">
    <td class="text-start">
      <v-icon title="3D model for browsers and Android devices"
        >3d_rotation
      </v-icon>
    </td>

    <td class="text-left">
      {{ ar.src }}
      <br />
      <small>{{ ar.name_src }}</small>
    </td>
    <td>{{ numeralFormat(ar.size_src, "0.[0] ib") }}</td>

    <td>
      <v-btn
        :href="getFileUrl('src')"
        icon
        target="_blank"
        title="Download"
        variant="text"
      >
        <v-icon>get_app</v-icon>
      </v-btn>
    </td>

    <td>
      <v-btn
        v-if="hasSrc"
        class="ma-1"
        color="primary"
        variant="text"
        @click="show = !show"
      >
        <v-icon>view_in_ar</v-icon>
      </v-btn>
    </td>

    <td>
      <v-btn
        v-if="editable"
        :loading="busy_delete_src"
        class="float-end"
        color="red"
        icon
        variant="text"
        @click="deleteFile('src')"
      >
        <v-icon>close</v-icon>
      </v-btn>
    </td>
  </tr>

  <!------------------------------------------>

  <tr v-if="hasIos" style="background: #f9f9f9">
    <td class="text-start">
      <v-icon title="3D model for iOS">fa:fab fa-apple</v-icon>
    </td>

    <td class="text-left">
      {{ ar.ios }} <br />
      <small>{{ ar.name_src }}</small>
    </td>
    <td>{{ numeralFormat(ar.size_ios, "0.[0] ib") }}</td>

    <td>
      <v-btn
        :href="getFileUrl('ios')"
        icon
        target="_blank"
        title="Download"
        variant="text"
      >
        <v-icon>get_app</v-icon>
      </v-btn>
    </td>

    <td></td>

    <td>
      <v-btn
        v-if="editable"
        :loading="busy_delete_ios"
        class="float-end"
        color="red"
        icon
        variant="text"
        @click="deleteFile('ios')"
      >
        <v-icon>close</v-icon>
      </v-btn>
    </td>
  </tr>

  <v-dialog
    v-if="hasSrc"
    v-model="show"
    fullscreen
    scrollable
    transition="dialog-bottom-transition"
  >
    <v-card color="#eee">
      <v-card-text>
        <v-container style="max-width: 1200px">
          <iframe
            :src="getArViewUrl()"
            allowfullscreen="1"
            frameborder="0"
            scrolling="no"
            style="
              display: block;
              min-height: 320px;
              background: #fff;
              border-radius: 18px;
              height: 70vh;
            "
            title="3D View"
            width="100%"
          ></iframe>
        </v-container>
      </v-card-text>
      <v-card-title>
        <div class="widget-buttons">
          <v-btn size="x-large" variant="text" @click="show = false">
            <v-icon start>close</v-icon>
            {{ $t("global.actions.close") }}
          </v-btn>
        </div>
      </v-card-title>
    </v-card>
  </v-dialog>

  <v-dialog
    v-if="editable"
    v-model="item_edit"
    fullscreen
    scrollable
    transition="dialog-bottom-transition"
  >
    <v-card>
      <v-card-text>
        <div class="widget-box w-100 my-5">
          <u-widget-header icon="cloud_upload" title="Upload 3D models">
          </u-widget-header>

          <v-list-subheader>
            You can upload .glb file for 3D model and .usdz file for iOS
            devices. First you should upload .glb file, we use it to show 3D
            model in browsers and Android devices. Then you can upload .usdz
            file for iOS devices.
          </v-list-subheader>

          <div class="text-center">
            <v-btn-toggle
              v-model="file_type"
              class="widget-toggle h-auto"
              mandatory
              selected-class="blue-flat"
            >
              <v-btn height="48" value="src">
                <v-icon class="mx-2">3d_rotation</v-icon>
                3D file

                <v-chip v-if="!hasSrc" class="ms-1" color="red" size="x-small">
                  <v-icon start>warning</v-icon>
                  Missed
                </v-chip>
              </v-btn>

              <v-btn height="48" value="ios">
                <v-icon class="mx-2">fa:fab fa-apple</v-icon>
                iOS
                <v-chip v-if="!hasIos" class="ms-1" color="red" size="x-small">
                  <v-icon start>warning</v-icon>
                  Missed
                </v-chip>
              </v-btn>
            </v-btn-toggle>
          </div>
          <v-slide-y-transition hide-on-leave>
            <s-ar-model-uploader
              v-if="file_type === 'src'"
              key="src"
              :ar="ar"
              :server="server"
              class="w-100 mt-5"
              label="Select .glb"
              max-file-size="20MB"
              @update:ar="updateAr"
            ></s-ar-model-uploader>
            <s-ar-model-uploader
              v-if="file_type === 'ios'"
              key="ios"
              :ar="ar"
              :server="server"
              class="w-100 mt-5"
              label="Select .usdz file"
              max-file-size="20MB"
              @update:ar="updateAr"
            ></s-ar-model-uploader>
          </v-slide-y-transition>
        </div>
      </v-card-text>

      <v-card-title>
        <div class="widget-buttons">
          <v-btn size="x-large" variant="text" @click="item_edit = false">
            <v-icon start>close</v-icon>
            {{ $t("global.actions.close") }}
          </v-btn>
        </div>
      </v-card-title>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

import SArModelUploader from "../../../../../ui/uploader/SArModelUploader.vue";
import VariantItemViewMicro from "../../../../../storefront/product/variant/VariantItemViewMicro.vue";
import UWidgetHeader from "../../../../../ui/widget/header/UWidgetHeader.vue";

export default {
  name: "BProductArTableRow",
  components: {
    UWidgetHeader,
    VariantItemViewMicro,
    SArModelUploader,
  },
  props: {
    product: {
      required: true,
      type: Object,
    },
    variant: {
      required: false,
      type: Object,
    },
    shop: {
      required: true,
    },
    editable: {
      type: Boolean,
      default: false,
    },
  },
  data: () => ({
    item_edit: false,
    show: false,
    file_type: "src", // src | ios

    busy_delete_src: false,
    busy_delete_ios: false,
  }),
  computed: {
    server() {
      return window.API.POST_UPLOAD_PRODUCT_3D_MODEL(
        this.shop.id,
        this.product.id,
        this.file_type,
        this.variant ? this.variant.id : null,
      );
    },

    ar() {
      return this.variant ? this.variant.ar : this.product.ar;
    },

    hasSrc() {
      return this.ar && this.ar.src;
    },

    hasIos() {
      return this.ar && this.ar.ios;
    },
  },
  methods: {
    getFileUrl(type) {
      if (!this.ar || !this.ar[type]) return null;

      return (
        this.getShop3DModelPath(
          this.shop.name,
          this.product.id,
          this.variant ? this.variant.id : "default",
          this.ar[type],
          type === "src"
            ? this.ar.src_file
              ? this.ar.src_file
              : "scene.gltf" // Depricated gltf! only glb supported!
            : this.ar.ios_file
              ? this.ar.ios_file
              : "scene.usdz", // scene.glb  scene.gltf   scene.usdz
        ) + "?download=true"
      ); // Force download file!
    },

    getShop3DModelPath(
      shop_name: string,
      product_id: number,
      variant_id: number | null,
      folder_name: string,
      file_name: string,
    ) {
      return window.CDN.GET_SHOP_3D_MODEL_PATH(
        shop_name,
        product_id,
        variant_id,
        folder_name,
        file_name,
      );
    },

    getArViewUrl() {
      if (!this.ar) return null;

      return this.window.URLS.ARViewURL(
        this.shop.name,
        this.product.id,
        this.variant ? this.variant.id : "default",
        this.ar.src,
      );
    },
    updateAr(ar) {
      if (this.variant) this.variant.ar = ar;
      else this.product.ar = ar;

      this.item_edit = true;
    },

    deleteFile(file_type) {
      NotificationService.openDangerAlert(
        "Delete 3D model",
        "Are you sure to remove this file?",
        "Delete",
        () => {
          if (file_type === "src") this.busy_delete_src = true;
          else this.busy_delete_ios = true;

          window.$backoffice.product.ar
            .remove(
              this.shop.id,
              this.product.id,
              file_type,
              this.variant ? this.variant.id : null,
            )

            .then(({ ar }) => {
              if (this.variant) {
                this.variant.ar = ar;
              } else {
                this.product.ar = ar;
              }
            })
            .catch((e) => {
              NotificationService.showLaravelError(e);
            })
            .finally(() => {
              if (file_type === "src") this.busy_delete_src = false;
              else this.busy_delete_ios = false;
            });
        },
      );
    },
  },
};
</script>

<style scoped></style>
