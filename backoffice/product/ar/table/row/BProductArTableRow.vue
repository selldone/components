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
  <template v-if="!modern">
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
  </template>
  <template v-else>
    <section v-if="!variant" class="sd-modern-widget b-product-ar-row__main">
      <header class="b-product-ar-row__main-header">
        <div class="b-product-ar-row__main-title">
          <v-avatar rounded="lg" size="40"
            ><img
              v-if="product.icon"
              :src="getShopImagePath(product.icon)"
              :alt="product.title"
            /><v-icon v-else>inventory_2</v-icon></v-avatar
          >
          <div>
            <div class="b-product-ar-row__heading-line">
              <h2>{{ $t("product_ar.main_model") }}</h2>
              <span class="sd-modern-tag">{{
                $t("product_ar.default_model")
              }}</span>
            </div>
            <p>{{ $t("product_ar.main_subtitle") }}</p>
          </div>
        </div>
        <v-btn
          v-if="editable && enabled"
          color="primary"
          variant="flat"
          class="sd-modern-button sd-modern-button--small sd-modern-button--primary"
          prepend-icon="upload"
          @click="openEditor('src')"
          >{{ $t("product_ar.manage_files") }}</v-btn
        >
      </header>
      <b-product-ar-files
        :files="files"
        :editable="editable"
        :enabled="enabled"
        :busy-delete-src="busy_delete_src"
        :busy-delete-ios="busy_delete_ios"
        @preview="openPreview"
        @upload="openEditor"
        @remove="deleteFile"
      />
    </section>
    <template v-else>
      <tr
        class="b-product-ar-row"
        :class="{ 'b-product-ar-row--expanded': expanded }"
      >
        <td class="b-product-ar-row__identity-cell">
          <button
            type="button"
            class="b-product-ar-row__identity"
            :aria-expanded="expanded"
            :aria-controls="detail_id"
            :aria-describedby="`${detail_id}-code`"
            @click="expanded = !expanded"
          >
            <v-icon
              size="14"
              :class="{ 'b-product-ar-row__chevron--open': expanded }"
              >chevron_right</v-icon
            >
            <variant-item-view-micro :product-variant="variant" />
          </button>
        </td>
        <td :id="`${detail_id}-code`" class="b-product-ar-row__code">
          <bdi>SPV{{ variant.id }}</bdi>
        </td>
        <td class="b-product-ar-row__source">
          <span class="b-product-ar-row__state"
            ><i
              :class="{ 'b-product-ar-row__dot--ready': hasSrc || hasIos }"
            ></i
            >{{
              $t(
                hasSrc || hasIos
                  ? "product_ar.own_model"
                  : inherited_ar
                    ? "product_ar.main_model_source"
                    : "product_ar.no_model",
              )
            }}</span
          >
        </td>
        <td class="b-product-ar-row__formats">
          <template v-if="ar"
            ><span
              ><v-icon size="12">{{ hasSrc ? "check" : "remove" }}</v-icon
              ><bdi>{{ files[0].format }}</bdi></span
            ><span
              ><v-icon size="12">{{ hasIos ? "check" : "remove" }}</v-icon
              ><bdi>USDZ</bdi></span
            ></template
          ><span v-else>—</span>
        </td>
        <td class="b-product-ar-row__action">
          <v-btn
            v-if="editable && enabled"
            variant="text"
            color="primary"
            class="sd-modern-button sd-modern-button--small"
            :prepend-icon="hasSrc || hasIos ? 'edit' : 'add'"
            @click="openEditor('src')"
            >{{
              $t(
                hasSrc || hasIos
                  ? "product_ar.edit_files"
                  : "product_ar.add_model",
              )
            }}</v-btn
          >
        </td>
      </tr>
      <tr v-if="expanded" :id="detail_id" class="b-product-ar-row__detail">
        <td colspan="5">
          <b-product-ar-files
            v-if="ar"
            :files="files"
            :editable="editable"
            :enabled="enabled"
            :busy-delete-src="busy_delete_src"
            :busy-delete-ios="busy_delete_ios"
            @preview="openPreview"
            @upload="openEditor"
            @remove="deleteFile"
          />
          <div v-else class="b-product-ar-row__inherited">
            <v-icon size="18">{{
              inherited_ar ? "subdirectory_arrow_right" : "view_in_ar"
            }}</v-icon
            ><span>{{
              $t(
                inherited_ar
                  ? "product_ar.inherited_note"
                  : "product_ar.no_model",
              )
            }}</span>
          </div>
        </td>
      </tr>
    </template>
  </template>

  <v-dialog
    v-if="hasSrc"
    v-model="show"
    fullscreen
    scrollable
    transition="dialog-bottom-transition"
  >
    <v-card
      :color="modern ? undefined : '#eee'"
      :class="modern ? 'sd-modern-canvas b-product-ar-row__dialog' : undefined"
    >
      <header v-if="modern" class="b-product-ar-row__dialog-header">
        <div>
          <h2>{{ $t("product_ar.preview_title") }}</h2>
          <p>
            {{ product.title }}<bdi v-if="variant"> · SPV{{ variant.id }}</bdi>
          </p>
        </div>
        <v-btn
          icon
          variant="text"
          class="sd-modern-icon-button"
          :aria-label="$t('global.actions.close')"
          @click="show = false"
          ><v-icon>close</v-icon></v-btn
        >
      </header>
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
            :title="modern ? $t('product_ar.preview_title') : '3D View'"
            width="100%"
          ></iframe>
        </v-container>
      </v-card-text>
      <v-card-title>
        <div
          :class="
            modern ? 'b-product-ar-row__dialog-actions' : 'widget-buttons'
          "
        >
          <v-btn
            :size="modern ? undefined : 'x-large'"
            :class="
              modern ? 'sd-modern-button sd-modern-button--small' : undefined
            "
            variant="text"
            @click="show = false"
          >
            <v-icon start>close</v-icon>
            {{ $t("global.actions.close") }}
          </v-btn>
        </div>
      </v-card-title>
    </v-card>
  </v-dialog>

  <v-dialog
    v-if="editable && enabled"
    v-model="item_edit"
    fullscreen
    scrollable
    transition="dialog-bottom-transition"
  >
    <v-card
      :class="modern ? 'sd-modern-canvas b-product-ar-row__dialog' : undefined"
    >
      <header v-if="modern" class="b-product-ar-row__dialog-header">
        <div>
          <h2>{{ $t("product_ar.upload_title") }}</h2>
          <p>
            {{ product.title }}<bdi v-if="variant"> · SPV{{ variant.id }}</bdi>
          </p>
        </div>
        <v-btn
          icon
          variant="text"
          class="sd-modern-icon-button"
          :aria-label="$t('global.actions.close')"
          @click="item_edit = false"
          ><v-icon>close</v-icon></v-btn
        >
      </header>
      <v-card-text>
        <div v-if="modern" class="b-product-ar-row__upload sd-modern-form">
          <variant-item-view-micro v-if="variant" :product-variant="variant" />
          <p class="b-product-ar-row__upload-copy">
            {{ $t("product_ar.upload_copy") }}
          </p>
          <div class="b-product-ar-row__upload-cards">
            <section
              v-for="file in files"
              :key="file.type"
              class="sd-modern-widget b-product-ar-row__upload-widget"
              :aria-label="file.type === 'src' ? 'GLB' : 'USDZ'"
            >
              <header class="b-product-ar-row__upload-heading">
                <v-icon size="22">{{
                  file.type === "src" ? "view_in_ar" : "smartphone"
                }}</v-icon>
                <div>
                  <h3>
                    <bdi>{{ file.type === "src" ? "GLB" : "USDZ" }}</bdi>
                  </h3>
                  <p>
                    {{
                      $t(
                        file.type === "src"
                          ? "product_ar.web_android"
                          : "product_ar.ios",
                      )
                    }}
                  </p>
                </div>
              </header>
              <div class="b-product-ar-row__current-file">
                <i
                  class="b-product-ar-row__file-dot"
                  :class="{ 'b-product-ar-row__dot--ready': file.available }"
                ></i>
                <div class="b-product-ar-row__current-details">
                  <span>{{
                    $t(
                      file.available
                        ? "product_ar.current_file"
                        : "product_ar.no_file",
                    )
                  }}</span>
                  <template v-if="file.available">
                    <v-tooltip location="top" content-class="sd-modern-tooltip"
                      ><template #activator="{ props }"
                        ><span
                          v-bind="props"
                          class="b-product-ar-row__current-name"
                          tabindex="0"
                          ><bdi>{{ file.name }}</bdi></span
                        ></template
                      >{{ file.name }}</v-tooltip
                    >
                    <small
                      ><bdi>{{
                        numeralFormat(file.size, "0.[0] ib")
                      }}</bdi></small
                    >
                  </template>
                </div>
              </div>
              <s-ar-model-uploader
                :key="file.type"
                :ar="ar"
                :server="getUploadServer(file.type)"
                :disabled="isOtherUploadBusy(file.type)"
                :label="
                  $t(
                    file.type === 'src'
                      ? 'product_ar.select_glb'
                      : 'product_ar.select_usdz',
                  )
                "
                class="b-product-ar-row__card-uploader"
                max-file-size="20MB"
                @busy="setUploadBusy(file.type, $event)"
                @update:ar="updateAr"
              />
              <p
                class="b-product-ar-row__upload-copy"
                :role="isOtherUploadBusy(file.type) ? 'status' : undefined"
              >
                {{
                  isOtherUploadBusy(file.type)
                    ? $t("product_ar.upload_wait")
                    : file.available
                      ? $t("product_ar.replace_hint")
                      : ""
                }}
              </p>
            </section>
          </div>
          <div class="sd-modern-notice">
            <v-icon>check_circle_outline</v-icon>
            <div class="sd-modern-notice__content">
              {{ $t("product_ar.upload_immediate") }}
            </div>
          </div>
        </div>
        <div v-else class="widget-box w-100 my-5">
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
        <div
          :class="
            modern ? 'b-product-ar-row__dialog-actions' : 'widget-buttons'
          "
        >
          <v-btn
            :size="modern ? undefined : 'x-large'"
            :class="
              modern ? 'sd-modern-button sd-modern-button--small' : undefined
            "
            variant="text"
            @click="item_edit = false"
          >
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
import BProductArFiles from "../files/BProductArFiles.vue";

export default {
  name: "BProductArTableRow",
  components: {
    BProductArFiles,
    UWidgetHeader,
    VariantItemViewMicro,
    SArModelUploader,
  },
  props: {
    modern: Boolean,
    enabled: { type: Boolean, default: true },
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
    expanded: false,
    item_edit: false,
    show: false,
    file_type: "src", // src | ios
    upload_busy: { src: false, ios: false },

    busy_delete_src: false,
    busy_delete_ios: false,
  }),
  computed: {
    server() {
      return this.getUploadServer(this.file_type);
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
    // Storefront falls back by AR object, never separately for each file format.
    inherited_ar() {
      return this.variant &&
        !this.variant.ar &&
        (this.product.ar?.src || this.product.ar?.ios)
        ? this.product.ar
        : null;
    },
    detail_id() {
      return `product-ar-${this.product.id}-${this.variant?.id || "default"}-files`;
    },
    files() {
      return ["src", "ios"].map((type) => ({
        type,
        format:
          type === "src"
            ? this.hasSrc && /\.gltf$/i.test(this.ar.src_file || "scene.gltf")
              ? "GLTF"
              : "GLB"
            : "USDZ",
        available: !!this.ar?.[type],
        name:
          this.ar?.[type === "src" ? "name_src" : "name_ios"] ||
          this.ar?.[type === "src" ? "src_file" : "ios_file"] ||
          (type === "src" ? "scene.gltf" : "scene.usdz"),
        folder: this.ar?.[type],
        size: this.ar?.[type === "src" ? "size_src" : "size_ios"],
        url: this.enabled ? this.getFileUrl(type) : undefined,
      }));
    },
  },
  methods: {
    getUploadServer(type) {
      if (!this.editable || !this.enabled || !["src", "ios"].includes(type))
        return null;
      return window.API.POST_UPLOAD_PRODUCT_3D_MODEL(
        this.shop.id,
        this.product.id,
        type,
        this.variant ? this.variant.id : null,
      );
    },
    // The API saves one AR object: keep uploads for its two formats sequential.
    isOtherUploadBusy(type) {
      return this.upload_busy[type === "src" ? "ios" : "src"];
    },
    setUploadBusy(type, busy) {
      this.upload_busy[type] = busy;
    },
    openEditor(type = "src") {
      if (!this.editable || !this.enabled) return;
      this.file_type = type;
      this.item_edit = true;
    },
    openPreview() {
      if (this.enabled && this.hasSrc) this.show = true;
    },
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
      if (!this.editable || !this.enabled) return;
      if (this.variant) this.variant.ar = ar;
      else this.product.ar = ar;

      this.item_edit = true;
    },

    deleteFile(file_type) {
      if (
        !this.editable ||
        !this.enabled ||
        !["src", "ios"].includes(file_type)
      )
        return;
      NotificationService.openDangerAlert(
        this.modern ? this.$t("product_ar.delete_title") : "Delete 3D model",
        this.modern
          ? this.$t("product_ar.delete_message")
          : "Are you sure to remove this file?",
        this.$t("global.actions.delete"),
        () => {
          if (!this.editable || !this.enabled) return;
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

<style scoped lang="scss">
.b-product-ar-row {
  td {
    padding: 7px 12px !important;
    height: 52px !important;
    font-size: 13px;
    line-height: 20px;
    border-radius: 0;
  }
  &--expanded {
    background: var(--sd-modern-inset);
  }
  &__main {
    padding: 0 20px 12px;
  }
  &__main-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 14px;
    padding: 19px 0 16px;
  }
  &__main-title {
    display: flex;
    gap: 10px;
    align-items: flex-start;
    min-width: 0;
  }
  &__main-title .v-avatar {
    flex-shrink: 0;
    background: var(--sd-modern-inset);
    border: 1px solid var(--sd-modern-border);
  }
  &__main-title img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
  &__heading-line {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }
  &__main-header h2 {
    font-size: 16px;
    line-height: 24px;
    font-weight: 500;
  }
  &__main-header p {
    font-size: 13px;
    line-height: 20px;
    color: var(--sd-modern-muted);
    margin: 5px 0 0;
  }
  &__main-header > .v-btn {
    flex-shrink: 0;
  }
  &__identity {
    display: flex;
    align-items: center;
    gap: 9px;
    text-align: start;
    width: 100%;
    color: inherit;
    min-width: 0;
  }
  &__code {
    color: var(--sd-modern-muted);
    font-size: 12px !important;
    white-space: nowrap;
  }
  &__identity > .v-icon {
    flex-shrink: 0;
    color: var(--sd-modern-muted);
  }
  &__identity :deep(.product-variant-card-micro) {
    min-width: 0;
    flex-wrap: wrap;
    gap: 3px;
    font-size: 13px;
    font-weight: 400;
  }
  &__identity:focus-visible {
    outline: 2px solid rgb(var(--v-theme-primary));
    outline-offset: 3px;
    border-radius: 6px;
  }
  &__chevron--open {
    transform: rotate(90deg);
  }
  &__state {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
  }
  &__state i {
    display: inline-block;
    width: 6px;
    height: 6px;
    background: var(--sd-modern-muted);
    border-radius: 50%;
    flex-shrink: 0;
  }
  &__dot--ready {
    background: rgb(var(--v-theme-success)) !important;
  }
  &__formats > span {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    margin-inline-end: 8px;
    font-size: 11px;
    color: var(--sd-modern-muted);
  }
  &__action {
    text-align: end;
  }
  &__detail > td {
    padding: 0 0 12px !important;
    height: auto !important;
    border-bottom: 1px solid var(--sd-modern-border);
  }
  &__detail :deep(.b-product-ar-files) {
    background: var(--sd-modern-inset);
  }
  &__detail :deep(thead) {
    display: none;
  }
  &__inherited {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px;
    background: var(--sd-modern-inset);
    color: var(--sd-modern-muted);
    border-radius: 8px;
    font-size: 12px;
  }
  &__dialog-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 20px max(24px, calc((100% - 1040px) / 2));
    background: rgb(var(--v-theme-surface));
    border-bottom: 1px solid var(--sd-modern-border);
  }
  &__dialog-header h2 {
    font-family: inherit;
    font-size: 20px;
    line-height: 28px;
    font-weight: 500;
    margin: 0;
  }
  &__dialog {
    --sd-modern-icon-button-size: 32px;
    text-align: start;
  }
  &__dialog .sd-modern-button--small {
    font-size: 13px;
    line-height: 20px;
    min-height: 36px;
    padding: 7px 12px;
  }
  &__dialog :deep(.sd-modern-icon-button .v-icon) {
    font-size: 16px;
  }
  &__dialog-header p {
    font-size: 12px;
    line-height: 19px;
    color: var(--sd-modern-muted);
    margin-top: 4px;
  }
  &__dialog :deep(.v-card-text) {
    min-height: 0;
    padding: 28px 20px;
  }
  &__dialog :deep(.v-card-title) {
    padding: 12px max(24px, calc((100% - 1040px) / 2));
    border-top: 1px solid var(--sd-modern-border);
    background: rgb(var(--v-theme-surface));
  }
  &__dialog-actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 8px;
  }
  &__upload {
    width: 100%;
    max-width: 1040px;
    display: grid;
    gap: 18px;
  }
  &__upload-cards {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 18px;
  }
  &__upload-widget {
    display: grid;
    grid-row: span 4;
    grid-template-rows: subgrid;
    min-width: 0;
    padding: 22px;
  }
  &__upload-heading {
    display: flex;
    align-items: flex-start;
    gap: 10px;
  }
  &__upload-heading > .v-icon {
    color: var(--sd-modern-muted);
    margin-top: 2px;
    flex-shrink: 0;
  }
  &__upload-heading p {
    color: var(--sd-modern-muted);
    font-size: 12px;
    line-height: 19px;
    margin: 2px 0 0;
  }
  &__card-uploader {
    width: 100%;
    min-width: 0;
    align-self: start;
  }
  &__upload-copy,
  &__current-file {
    color: var(--sd-modern-muted);
    font-size: 13px;
    line-height: 20px;
    margin: 0;
  }
  &__current-file {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    padding-block: 4px;
  }
  &__current-details {
    min-width: 0;
    flex: 1;
  }
  &__current-name {
    display: block;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: rgb(var(--v-theme-on-surface));
  }
  &__current-details small {
    font-size: 11px;
    line-height: 17px;
  }
  &__file-dot {
    width: 6px;
    height: 6px;
    flex-shrink: 0;
    border-radius: 50%;
    margin-top: 7px;
    background: var(--sd-modern-muted);
  }
  &__upload-widget h3 {
    font-size: 16px;
    font-weight: 500;
    line-height: 24px;
  }
  @media (max-width: 760px) {
    &__upload-cards {
      grid-template-columns: minmax(0, 1fr);
    }
    &__upload-widget {
      padding: 18px;
    }
  }
  @media (max-width: 680px) {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 6px 10px;
    padding: 11px 12px;
    border-bottom: 1px solid var(--sd-modern-border);
    td {
      height: auto !important;
      min-width: 0;
      padding: 0 !important;
      border: 0 !important;
    }
    &__identity-cell {
      grid-column: 1;
    }
    &__code {
      grid-column: 2;
      grid-row: 1;
      text-align: end;
      align-self: center;
    }
    &__source {
      grid-column: 1;
      grid-row: 2;
    }
    &__formats {
      grid-column: 1;
      grid-row: 3;
    }
    &__action {
      grid-column: 2;
      grid-row: 2 / 4;
      align-self: center;
    }
    &__detail {
      display: block;
    }
    &__detail > td {
      display: block;
      width: 100%;
      padding-top: 6px !important;
    }
    &__main {
      padding: 0 14px 10px;
    }
    &__main-header {
      padding-top: 16px;
      flex-wrap: wrap;
      gap: 10px;
    }
    &__main-header > .v-btn {
      margin-inline-start: auto;
    }
    &__dialog-header {
      padding: 17px 18px;
    }
    &__dialog .sd-modern-button--small {
      min-height: 44px;
    }
    &__dialog-header h2 {
      font-size: 18px;
    }
    &__dialog :deep(.v-card-text) {
      padding: 20px 16px;
    }
  }
  @media (pointer: coarse) {
    &__identity {
      min-height: 44px;
    }
    &__dialog {
      --sd-modern-icon-button-size: 44px;
    }
    &__dialog .sd-modern-button--small {
      min-height: 44px;
    }
  }
  @media (max-width: 380px) {
    &__source {
      grid-column: 1 / -1;
    }
    &__formats {
      grid-column: 1 / -1;
      grid-row: 3;
    }
    &__action {
      grid-column: 1 / -1;
      grid-row: 4;
      justify-self: end;
    }
  }
}
:global([dir="rtl"]) .b-product-ar-row__identity > .v-icon {
  transform: scaleX(-1);
}
:global([dir="rtl"])
  .b-product-ar-row__identity
  > .b-product-ar-row__chevron--open {
  transform: rotate(-90deg);
}
</style>
