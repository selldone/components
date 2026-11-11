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
          <v-icon class="b-product-ar-row__purpose" icon="inventory_2" size="18" aria-hidden="true" />
          <div>
            <div class="b-product-ar-row__heading-line">
              <h2>{{ $t("product_ar.main_model") }}</h2>
            </div>
            <p>{{ $t("product_ar.main_subtitle") }}</p>
          </div>
        </div>
        <v-btn icon variant="text" class="sd-modern-icon-button sd-modern-info-button" :aria-label="$t('product_ar.main_about')"><v-icon icon="info_outline" size="15" /><v-tooltip activator="parent" location="top" :open-on-click="true" content-class="sd-modern-tooltip text-start">{{ $t('product_ar.help_main') }}</v-tooltip></v-btn>
      </header>
      <div class="b-product-ar-row__model-layout">
        <b-product-ar-files :files="files" :ar="ar" :editable="editable" :enabled="enabled" :busy-delete-src="busy_delete_src" :busy-delete-ios="busy_delete_ios" @preview="openPreview" @remove="deleteFile" @upload-busy="setUploadBusy" @update:ar="updateAr" />
        <div class="b-product-ar-row__preview-pane">
          <v-icon icon="view_in_ar" size="37" aria-hidden="true" />
          <p>{{ $t(hasSrc ? 'product_ar.preview_ready' : 'product_ar.preview_empty_title') }}</p>
          <v-btn v-if="hasSrc" class="sd-modern-button sd-modern-button--small b-product-ar-row__preview-button" variant="outlined" prepend-icon="visibility" :disabled="!enabled" :aria-label="$t('product_ar.preview')" @click="openPreview">{{ $t('product_ar.preview_model') }}</v-btn>
          <small>{{ $t(hasSrc ? 'product_ar.web_android' : 'product_ar.preview_empty_help') }}</small>
        </div>
      </div>
      <p class="b-product-ar-row__immediate"><v-icon icon="check_circle_outline" size="14" aria-hidden="true" />{{ $t('product_ar.upload_immediate') }}</p>
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
            :disabled="workspaceBusy"
            @click="toggleExpanded"
          >
            <span class="b-product-ar-row__variant-name"><variant-item-view-micro :product-variant="variant" /><small :id="`${detail_id}-code`"><bdi>SPV{{ variant.id }}</bdi></small></span>
          </button>
        </td>
        <td class="b-product-ar-row__source">
          <span class="b-product-ar-row__state"
            ><i
              :class="{ 'b-product-ar-row__dot--ready': hasSrc || hasIos || inherited_ar }"
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
        <td class="b-product-ar-row__action">
          <v-btn
            variant="text"
            icon
            class="sd-modern-icon-button"
            :aria-label="$t('product_ar.variant_files', { code: `SPV${variant.id}` })"
            :aria-expanded="expanded"
            :aria-controls="detail_id"
            :disabled="workspaceBusy"
            @click="toggleExpanded"
            ><v-icon :icon="expanded ? 'expand_less' : 'expand_more'" size="16" /><v-tooltip activator="parent" location="top" :open-on-focus="true" content-class="sd-modern-tooltip text-start">{{ $t('product_ar.variant_files', { code: `SPV${variant.id}` }) }}</v-tooltip></v-btn
          >
        </td>
      </tr>
      <tr v-if="expanded" :id="detail_id" class="b-product-ar-row__detail">
        <td colspan="3">
          <div class="b-product-ar-row__inline-editor">
          <p v-if="!ar" class="b-product-ar-row__inherited"><v-icon :icon="inherited_ar ? 'subdirectory_arrow_right' : 'view_in_ar'" size="18" aria-hidden="true" />{{ $t(inherited_ar ? 'product_ar.inherited_note' : 'product_ar.no_model') }}</p>
          <b-product-ar-files
            :files="files"
            :ar="ar"
            :editable="editable"
            :enabled="enabled"
            :busy-delete-src="busy_delete_src"
            :busy-delete-ios="busy_delete_ios"
            @preview="openPreview"
            @remove="deleteFile"
            @upload-busy="setUploadBusy"
            @update:ar="updateAr"
          />
          </div>
        </td>
      </tr>
    </template>
  </template>

  <v-dialog
    v-if="hasSrc"
    v-model="show"
    :fullscreen="!modern || $vuetify.display.smAndDown"
    :max-width="modern ? 1180 : undefined"
    :aria-labelledby="modern ? `${detail_id}-preview-title` : undefined"
    :scrollable="!modern"
    transition="dialog-bottom-transition"
  >
    <v-card
      :color="modern ? undefined : '#eee'"
      :class="modern ? ['sd-modern-canvas b-product-ar-preview__card text-start', { 'b-product-ar-preview__card--fullscreen': $vuetify.display.smAndDown }] : undefined"
    >
      <header v-if="modern" class="b-product-ar-preview__header">
        <v-icon icon="view_in_ar" size="23" aria-hidden="true" />
        <div class="b-product-ar-preview__heading">
          <h2 :id="`${detail_id}-preview-title`">{{ $t("product_ar.preview_title") }}</h2>
          <p>{{ product.title }}<bdi v-if="variant"> · SPV{{ variant.id }}</bdi></p>
        </div>
        <v-btn
          icon
          variant="text"
          class="sd-modern-icon-button"
          :aria-label="$t('global.actions.close')"
          @click="show = false"
          ><v-icon icon="close" size="18" aria-hidden="true" /><v-tooltip activator="parent" location="top" :open-on-focus="true" content-class="sd-modern-tooltip text-start">{{ $t('global.actions.close') }}</v-tooltip></v-btn
        >
      </header>
      <v-card-text :class="modern ? 'b-product-ar-preview__body' : undefined">
        <component :is="modern ? 'div' : 'v-container'" :class="modern ? 'b-product-ar-preview__stage' : undefined" :style="modern ? undefined : { maxWidth: '1200px' }">
          <iframe
            v-if="!modern || (show && enabled)"
            :src="getArViewUrl()"
            :class="modern ? 'b-product-ar-preview__frame' : undefined"
            allowfullscreen="1"
            frameborder="0"
            scrolling="no"
            :style="modern ? undefined : { display: 'block', minHeight: '320px', background: '#fff', borderRadius: '18px', height: '70vh' }"
            :title="modern ? $t('product_ar.preview_title') : '3D View'"
            width="100%"
          ></iframe>
        </component>
      </v-card-text>
      <v-card-title v-if="!modern">
        <div class="widget-buttons">
          <v-btn
            size="x-large"
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
    v-if="!modern && editable && enabled"
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
  emits: ['activity'],
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
    active: true,
    expanded: false,
    item_edit: false,
    show: false,
    file_type: "src", // src | ios
    upload_busy: { src: false, ios: false },

    busy_delete_src: false,
    busy_delete_ios: false,
  }),
  computed: {
    workspaceBusy() {
      return this.show || this.upload_busy.src || this.upload_busy.ios || this.busy_delete_src || this.busy_delete_ios;
    },
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
        server: this.getUploadServer(type),
        uploadBusy: this.upload_busy[type],
        uploadDisabled: this.isOtherUploadBusy(type) || this.busy_delete_src || this.busy_delete_ios,
      }));
    },
  },
  watch: {
    workspaceBusy: { immediate: true, handler(busy) { this.$emit('activity', busy); } },
  },
  beforeUnmount() {
    this.active = false;
    this.$emit('activity', false);
  },
  methods: {
    toggleExpanded() {
      if (!this.workspaceBusy) this.expanded = !this.expanded;
    },
    getUploadServer(type) {
      if (!this.active || !this.editable || !this.enabled || !["src", "ios"].includes(type))
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
      if (!this.active || !this.editable || !this.enabled) return;
      this.file_type = type;
      if (this.modern) this.expanded = true;
      else this.item_edit = true;
    },
    openPreview() {
      if (this.active && this.enabled && this.hasSrc) this.show = true;
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

      const url = this.window.URLS.ARViewURL(
        this.shop.name,
        this.product.id,
        this.variant ? this.variant.id : "default",
        this.ar.src,
      );
      // The same renderer serves storefronts; only this editor opts into preview controls.
      return this.modern ? `${url}?preview=modern&lang=${this.$i18n?.locale === 'fa' ? 'fa' : 'en'}` : url;
    },
    updateAr(ar) {
      if (!this.active || !this.editable || !this.enabled) return;
      if (this.variant) this.variant.ar = ar;
      else this.product.ar = ar;

      if (!this.modern) this.item_edit = true;
    },

    deleteFile(file_type) {
      if (
        !this.active || !this.editable ||
        !this.enabled ||
        this.upload_busy.src || this.upload_busy.ios || this.busy_delete_src || this.busy_delete_ios ||
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
          if (!this.active || !this.editable || !this.enabled || this.upload_busy.src || this.upload_busy.ios || this.busy_delete_src || this.busy_delete_ios) return;
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
              if (!this.active) return;
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
.b-product-ar-preview__card {
  --sd-modern-icon-button-size: 36px;
  display: grid !important;
  grid-template-rows: auto minmax(0, 1fr);
  flex: none !important;
  height: min(860px, calc(100dvh - 64px));
  max-height: calc(100dvh - 64px);
  min-height: 0;
  overflow: hidden !important;
  border-radius: 20px !important;
  .b-product-ar-preview__header { display: flex; align-items: flex-start; gap: 12px; padding: 19px 21px; border-block-end: 1px solid var(--sd-modern-border); }
  .b-product-ar-preview__header > .v-icon { flex-shrink: 0; margin-block-start: 3px; color: var(--sd-modern-muted); }
  .b-product-ar-preview__heading { flex: 1; min-width: 0; }
  .b-product-ar-preview__heading h2 { margin: 0; font-size: 18px; line-height: 26px; font-weight: 500; }
  .b-product-ar-preview__heading p { margin: 3px 0 0; font-size: 13px; line-height: 20px; color: var(--sd-modern-muted); overflow-wrap: anywhere; }
  .b-product-ar-preview__header > .v-btn { flex-shrink: 0; }
  .b-product-ar-preview__body { min-height: 0; padding: 0 !important; overflow: hidden !important; display: grid; }
  .b-product-ar-preview__stage { display: grid; min-width: 0; min-height: 0; height: 100%; background: var(--sd-modern-inset); }
  .b-product-ar-preview__frame { display: block; width: 100%; height: 100%; min-width: 0; min-height: 0; border: 0; }
  &--fullscreen {
    --sd-modern-icon-button-size: 44px;
    height: 100dvh;
    max-height: 100dvh;
    border-radius: 0 !important;
    .b-product-ar-preview__header { padding-block: calc(13px + env(safe-area-inset-top)) 13px; padding-inline: max(16px, env(safe-area-inset-left), env(safe-area-inset-right)); gap: 10px; }
  }
  @media (pointer: coarse) { --sd-modern-icon-button-size: 44px; }
}
.b-product-ar-row {
  td { padding: 11px 10px !important; height: 59px !important; font-size: 12px; line-height: 19px; border-radius: 0; border-bottom: 1px solid var(--sd-modern-border); }
  &__main { padding: 21px; }
  &__main-header { display: flex; align-items: flex-start; gap: 10px; margin-block-end: 20px; }
  &__main-title { display: flex; align-items: flex-start; gap: 10px; min-width: 0; flex: 1; }
  &__purpose { flex-shrink: 0; color: var(--sd-modern-muted); margin-block-start: 3px; }
  &__main-header h2 { margin: 0; font-size: 15px; line-height: 23px; font-weight: 500; }
  &__main-header p { margin: 3px 0 0; color: var(--sd-modern-muted); font-size: 12px; line-height: 19px; }
  &__model-layout { display: grid; grid-template-columns: minmax(0, 1fr) 220px; align-items: start; gap: 21px; }
  &__preview-pane { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; text-align: center; min-width: 0; min-height: 218px; padding: 17px 10px; background: var(--sd-modern-inset); border-radius: 11px; }
  &__preview-pane > .v-icon { color: var(--sd-modern-muted); }
  &__preview-pane p { margin: 0; font-size: 12px; line-height: 19px; }
  &__preview-pane small { max-width: 145px; color: var(--sd-modern-muted); font-size: 11px; line-height: 18px; }
  &__preview-button { max-inline-size: 100%; min-width: 0; white-space: normal; height: auto; }
  &__preview-button :deep(.v-btn__content) { min-width: 0; white-space: normal; overflow-wrap: anywhere; }
  &__immediate { display: flex; align-items: flex-start; gap: 6px; margin: 14px 0 0; color: var(--sd-modern-muted); font-size: 11px; line-height: 18px; }
  &__immediate .v-icon { flex-shrink: 0; margin-block-start: 2px; }
  &__identity { display: flex; align-items: center; gap: 8px; width: 100%; text-align: start; color: inherit; min-width: 0; }
  &__identity:focus-visible { outline: 2px solid rgb(var(--v-theme-primary)); outline-offset: 3px; border-radius: 6px; }
  &__variant-name { display: block; min-width: 0; }
  &__variant-name small { display: block; margin-block-start: 1px; color: var(--sd-modern-muted); font-size: 10px; line-height: 17px; }
  &__identity :deep(.product-variant-card-micro) { min-width: 0; flex-wrap: wrap; gap: 3px; font-size: 12px; font-weight: 400; }
  &__state { display: inline-flex; align-items: center; gap: 6px; font-size: 11px; line-height: 18px; color: var(--sd-modern-muted); }
  &__state i { width: 5px; height: 5px; flex-shrink: 0; background: var(--sd-modern-muted); border-radius: 50%; }
  &__dot--ready { background: rgb(var(--v-theme-success)) !important; }
  &__action { text-align: end; }
  &__detail > td { height: auto !important; padding: 0 10px 12px !important; }
  &__inline-editor { padding: 17px; background: var(--sd-modern-inset); border-radius: 9px; }
  &__inherited { display: flex; align-items: flex-start; gap: 8px; margin: 0 0 11px; color: var(--sd-modern-muted); font-size: 12px; line-height: 19px; }
  &__inherited .v-icon { flex-shrink: 0; }
  &__dialog { --sd-modern-icon-button-size: 32px; text-align: start; }
  &__dialog-header { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 20px max(24px, calc((100% - 1040px) / 2)); background: rgb(var(--v-theme-surface)); border-bottom: 1px solid var(--sd-modern-border); }
  &__dialog-header h2 { margin: 0; font-family: inherit; font-size: 20px; line-height: 28px; font-weight: 500; }
  &__dialog-header p { margin: 4px 0 0; color: var(--sd-modern-muted); font-size: 12px; line-height: 19px; }
  &__dialog :deep(.v-card-text) { min-height: 0; padding: 28px 20px; }
  &__dialog :deep(.v-card-title) { padding: 12px max(24px, calc((100% - 1040px) / 2)); border-top: 1px solid var(--sd-modern-border); background: rgb(var(--v-theme-surface)); }
  &__dialog-actions { display: flex; justify-content: flex-end; align-items: center; gap: 8px; }
  @media (max-width: 680px) {
    display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) 44px; align-items: center; gap: 8px; padding: 11px 2px; border-bottom: 1px solid var(--sd-modern-border);
    td { height: auto !important; min-width: 0; padding: 0 !important; border: 0 !important; }
    &__detail { display: block; }
    &__detail > td { display: block; width: 100%; padding: 0 0 12px !important; }
    &__main { padding: 17px; }
    &__model-layout { grid-template-columns: minmax(0, 1fr); }
    &__preview-pane { min-height: 135px; }
    &__dialog-header { padding: 17px 18px; }
    &__dialog-header h2 { font-size: 18px; }
    &__dialog :deep(.v-card-text) { padding: 20px 16px; }
  }
  @media (max-width: 680px), (pointer: coarse) {
    &__identity { min-height: 44px; }
    &__dialog { --sd-modern-icon-button-size: 44px; }
  }
}
</style>
