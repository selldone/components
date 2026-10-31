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

<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
  <div
    class="s-gallery-upload-grid"
    :dir="modern ? ($vuetify.locale?.isRtl ? 'rtl' : 'ltr') : undefined"
    :class="{ 's-gallery-upload-grid--modern text-start': modern, 's-gallery-upload-grid--product': modernProductGallery }"
  >
  <template v-if="modern">
    <div v-if="modernProductGallery" class="s-gallery-upload-grid__product-tools">
      <v-btn class="sd-modern-button sd-modern-button--compact" variant="outlined" :aria-expanded="show_upload" @click="show_upload = !show_upload">
        <b-product-edit-info-icon name="Upload" :size="16" />
        {{ $t('add_product.images_modern.add_images') }}
      </v-btn>
      <v-btn v-if="allowUrlInput" class="sd-modern-button sd-modern-button--compact sd-modern-button--inline" color="primary" variant="text" @click="showUrlDialog()">
        <b-product-edit-info-icon name="Link" :size="16" />
        {{ $t('add_product.images_modern.add_url') }}
      </v-btn>
    </div>
    <s-image-uploader
      ref="uploader"
      v-show="!modernProductGallery || show_upload"
      :max-file-size="maxFileSize"
      :max-files="20"
      :server="uploadPath"
      :idle-label="uploadLabel"
      :disabled="!show_images"
      allow-multiple
      disable-past
      modern
      class="s-gallery-upload-grid__upload"
      min-height="88px"
      rounded="lg"
      @response="handleUploadAppImages"
      @onAddFileStart="modernProductGallery && (busy_upload = true)"
      @onAddFile="refreshUploadBusy"
      @onRemoveFile="refreshUploadBusy"
      @onProcessFileStart="modernProductGallery && (busy_upload = true)"
      @onProcessFileAbort="refreshUploadBusy"
      @onError="refreshUploadBusy"
    />
    <v-btn
      v-if="allowUrlInput && !modernProductGallery"
      class="sd-modern-button mt-3"
      variant="outlined"
      prepend-icon="link"
      @click="showUrlDialog()"
    >Add image URL</v-btn>
    <div v-if="!modernProductGallery" class="s-gallery-upload-grid__heading">
      <h2>{{ $t('global.commons.images') }} <span>{{ images.length }}</span></h2>
      <p v-if="images.length > 1">
        <v-icon size="14" aria-hidden="true">drag_indicator</v-icon>
        {{ $t('global.image_uploader.gallery.reorder') }}
      </p>
    </div>
    <div v-if="!images.length" class="s-gallery-upload-grid__empty sd-modern-empty-state">
      <v-icon size="28" aria-hidden="true">add_photo_alternate</v-icon>
      <h3>{{ $t('global.image_uploader.gallery.empty') }}</h3>
      <p>{{ $t('global.image_uploader.gallery.empty_help') }}</p>
    </div>
  </template>
  <s-grid-draggable-view
    v-if="show_images"
    ref="grid_container"
    :options="grid_options"
    :style="{ 'background-color': modern ? undefined : bgColor }"
    class="b--gallery-grid"
    :class="{ 'rounded-18px': !modern }"
    @dragEnd="dragEnd"
    @dragStart="suppress_handle_click = true"
    @layoutEnd="updateOrder"
  >
    <div
      v-for="(image, index) in images"
      :key="image.id"
      ref="items"
      :image_id="image.id"
      :style="style_value"
      class="item-grid pa-2"
    >
      <v-img
        :aspect-ratio="modernProductGallery ? 1.15 : modern || $vuetify.display.smAndUp ? 1 : 2"
        :alt="modernProductGallery ? (image.alt || '') : modern ? $t('global.image_uploader.gallery.position', { index: imagePosition(image, index) }) : undefined"
        :src="getShopImagePath(image.path)"
        cover
      >
        <template v-slot:placeholder>
          <v-progress-circular
            class="center-absolute"
            color="primary"
            indeterminate
          />
        </template>

        <div
          v-if="(image.width && image.height) || image.size"
          class="absolute-bottom-start x-small text-white text-nowrap usn rounded-lg pa-1 -spec"
        >
          <span v-if="image.width && image.height && (modern || image.size)" class="me-1">{{
            `${image.width}px ✕ ${image.height}px`
          }}</span>
          <div v-if="image.size" class="d-flex align-center">
            <b>{{ numeralFormat(image.size, "0.[0] b") }} </b>

            <v-progress-linear
              :color="
                image.size > 1024 * 1024
                  ? 'red'
                  : image.size > 512 * 1024
                    ? 'amber'
                    : 'green'
              "
              :model-value="(100 * image.size) / (1024 * 1024)"
              bg-color="#000"
              class="mx-1"
              height="2"
              location="start"
              rounded
              style="max-width: 64px"
            ></v-progress-linear>
          </div>
        </div>

        <div v-if="!modernProductGallery" class="absolute-bottom-end d-flex flex-column no-drag">
          <v-chip
            v-if="hasAiBackgroundRemove && isValidHttpUrl(image.path)"
            class="mb-1"
            color="rgba(10,20,60)"
            size="small"
            variant="flat"
            label
            title="External URL"
            prepend-icon="link"
            style="min-height: 28px"
          >
            URL
          </v-chip>

          <v-btn
            v-else-if="hasAiBackgroundRemove"
            class="mb-1"
            color="rgba(10,20,60)"
            size="small"
            title="AI Remove Background"
            variant="flat"
            @click.stop="$emit('click:bg-remove', image)"
          >
            <v-icon class="me-1" size="x-small"
              >{{
                image.path?.endsWith("--transparent.png")
                  ? "check_circle"
                  : "auto_fix_high"
              }}
            </v-icon>

            BGR
          </v-btn>

          <v-btn
            v-if="hasAlt"
            color="rgba(10,20,60)"
            size="small"
            title="Set Alt Text"
            variant="flat"
            @click.stop="$emit('click:alt', image)"
            prepend-icon="edit"

          >
            <v-icon v-if="image.alt" class="me-1" size="x-small"
              >check_circle
            </v-icon>
            ALT
          </v-btn>
        </div>
      </v-img>

      <div v-if="modernProductGallery" class="s-gallery-upload-grid__product-info">
        <span class="s-gallery-upload-grid__alt" :class="{ 's-gallery-upload-grid__alt--empty': !image.alt }" :tabindex="image.alt ? 0 : undefined">
          {{ image.alt || $t('add_product.images_modern.no_alt') }}
          <v-tooltip v-if="image.alt" activator="parent" :text="image.alt" location="top" :open-on-focus="true" content-class="sd-modern-tooltip text-start" />
        </span>
        <div class="s-gallery-upload-grid__product-actions">
          <span class="s-gallery-upload-grid__number"><bdi>{{ String(imagePosition(image, index)).padStart(2, '0') }}</bdi></span>
          <button type="button" class="s-gallery-upload-grid__handle sd-modern-icon-button" :aria-label="$t('add_product.images_modern.arrange') + ' · ' + $t('add_product.images_modern.image_number', { index: imagePosition(image, index) })" @pointerdown="suppress_handle_click = false" @click="onHandleClick">
            <b-product-edit-info-icon name="GripVertical" :size="16" />
            <v-tooltip activator="parent" :text="$t('add_product.images_modern.arrange')" location="top" :open-on-focus="true" content-class="sd-modern-tooltip text-start" />
          </button>
          <v-menu location="bottom end" content-class="sd-modern-menu text-start">
            <template #activator="{ props: menuProps }">
              <v-btn v-bind="menuProps" class="sd-modern-icon-button s-gallery-upload-grid__more no-drag" icon variant="text" :loading="busy_delete === index" :disabled="busy_delete !== false && busy_delete !== null" :aria-label="$t('add_product.images_modern.image_menu', { index: imagePosition(image, index) })">
                <b-product-edit-info-icon name="Ellipsis" :size="16" />
                <v-tooltip activator="parent" :text="$t('add_product.images_modern.image_menu', { index: imagePosition(image, index) })" location="top" :open-on-focus="true" content-class="sd-modern-tooltip text-start" />
              </v-btn>
            </template>
            <v-list class="sd-modern-menu__list s-gallery-upload-grid__menu text-start">
              <v-list-item @click="$emit('click:alt', image)"><template #prepend><b-product-edit-info-icon name="Text" :size="16" /></template><v-list-item-title>{{ $t('add_product.images_modern.alt_action') }}</v-list-item-title></v-list-item>
              <v-list-item v-if="hasAiBackgroundRemove && !isValidHttpUrl(image.path)" @click="$emit('click:bg-remove', image)"><template #prepend><b-product-edit-info-icon name="WandSparkles" :size="16" /></template><v-list-item-title>{{ $t('add_product.images_modern.remove_background') }}</v-list-item-title></v-list-item>
              <v-list-item :disabled="busy_delete !== false && busy_delete !== null" @click="deleteAppImage(image, index)"><template #prepend><b-product-edit-info-icon name="Trash2" :size="16" /></template><v-list-item-title>{{ $t('add_product.images_modern.remove_image') }}</v-list-item-title></v-list-item>
            </v-list>
          </v-menu>
        </div>
      </div>
      <div v-else-if="modern" class="s-gallery-upload-grid__footer no-drag">
        <v-menu location="bottom start" content-class="sd-modern-menu text-start">
          <template #activator="{ props: menuProps }">
            <v-btn
              v-bind="menuProps"
              class="s-gallery-upload-grid__position"
              variant="text"
              :aria-label="$t('global.image_uploader.gallery.move', { index: imagePosition(image, index) })"
            >
              <v-icon size="16" aria-hidden="true">drag_indicator</v-icon>
              <span>{{ String(imagePosition(image, index)).padStart(2, '0') }}</span>
              <v-tooltip
                activator="parent"
                :text="$t('global.image_uploader.gallery.move', { index: imagePosition(image, index) })"
                location="top"
                :open-on-focus="true"
                content-class="sd-modern-tooltip text-start"
              />
            </v-btn>
          </template>
          <v-list class="sd-modern-menu__list text-start">
            <v-list-item
              :disabled="imagePosition(image, index) === 1"
              prepend-icon="arrow_upward"
              :title="$t('global.image_uploader.gallery.earlier')"
              @click="moveImage(image.id, -1)"
            />
            <v-list-item
              :disabled="imagePosition(image, index) === images.length"
              prepend-icon="arrow_downward"
              :title="$t('global.image_uploader.gallery.later')"
              @click="moveImage(image.id, 1)"
            />
          </v-list>
        </v-menu>
        <v-btn
          :loading="busy_delete === index"
          :disabled="busy_delete !== false && busy_delete !== null"
          :aria-label="$t('global.actions.delete')"
          class="sd-modern-icon-button s-gallery-upload-grid__delete"
          icon
          variant="text"
          @click="deleteAppImage(image, index)"
        >
          <v-icon size="16">delete_outline</v-icon>
          <v-tooltip activator="parent" :text="$t('global.actions.delete')" location="top" :open-on-focus="true" content-class="sd-modern-tooltip text-start" />
        </v-btn>
      </div>
      <v-btn
        v-else
        :loading="busy_delete === index"
        :title="$t('global.actions.delete')"
        class="m-2 absolute-top-end no-drag"
        color="#D32F2F"
        icon=""
        size="small"
        variant="flat"
        @click="deleteAppImage(image, index)"
      >
        <v-icon>delete_outline</v-icon>
      </v-btn>
    </div>

    <div v-if="!modern" :style="style_value" class="pa-2 item-grid">
      <s-image-uploader
        :max-file-size="maxFileSize"
        :max-files="20"
        :server="uploadPath"
        allow-multiple
        class="marginal-center"
        dense
        disable-past
        @response="handleUploadAppImages"
        minHeight="190px"
        rounded="lg"
border
      >
      </s-image-uploader>

      <v-btn
        v-if="allowUrlInput"
        block
        class="mt-3 no-drag text-none text-white justify-start"
        color="#111"
        height="72"
        prepend-icon="link"
        rounded="lg"
        size="x-large"
        variant="flat"
        @click.stop="showUrlDialog()"
      >
        <span
          class="d-flex flex-column text-start flex-grow-1 flex-shrink-1 overflow-hidden"
        >
          <b class="text-body-1 font-weight-bold text-truncate"
            >Add image URL</b
          >
          <small
            class="text-caption font-weight-regular opacity-60 mt-1 text-truncate"
            >Optional external link. No upload.</small
          >
        </span>
      </v-btn>
    </div>
  </s-grid-draggable-view>

  <v-dialog v-model="dialog_url" max-width="560" scrollable>
    <v-card class="text-start" :class="{ 's-gallery-upload-grid__dialog sd-modern-widget': modernProductGallery }">
      <v-card-title class="d-flex align-center">
        <b-product-edit-info-icon v-if="modernProductGallery" name="Link" :size="20" />
        <v-icon v-else class="me-1" color="#111">link</v-icon>
        {{ modernProductGallery ? $t('add_product.images_modern.add_url') : 'Add image URL' }}
        <v-spacer v-if="modernProductGallery" />
        <v-btn v-if="modernProductGallery" class="sd-modern-icon-button" icon variant="text" :aria-label="$t('global.actions.close')" @click="dialog_url = false"><b-product-edit-info-icon name="X" :size="16" /><v-tooltip activator="parent" :text="$t('global.actions.close')" location="top" :open-on-focus="true" content-class="sd-modern-tooltip text-start" /></v-btn>
      </v-card-title>

      <v-card-text>
        <p v-if="modernProductGallery" class="s-gallery-upload-grid__dialog-help">{{ $t('add_product.images_modern.gallery_url_help') }}</p>
        <v-text-field
          v-model="url_input"
          :disabled="busy_url"
          autofocus
          clearable
          :label="modernProductGallery ? $t('add_product.images_modern.image_url') : 'Image URL'"
          :placeholder="modernProductGallery ? $t('add_product.images_modern.url_placeholder') : 'https://example.com/product.jpg'"
          :prepend-inner-icon="modernProductGallery ? undefined : 'link'"
          :variant="modernProductGallery ? 'underlined' : 'outlined'"
          :class="{ 'sd-modern-underlined-field': modernProductGallery }"
          @keyup.enter="addImageUrl()"
        />

        <v-img
          v-if="isValidHttpUrl(url_input)"
          :src="url_input"
          class="bg-tiny-checkers rounded-lg mt-3"
          max-height="260"
        />
      </v-card-text>

      <v-card-actions>
        <div :class="modernProductGallery ? 's-gallery-upload-grid__dialog-actions' : 'widget-buttons'">
          <v-btn :size="modernProductGallery ? undefined : 'x-large'" :class="{ 'sd-modern-button': modernProductGallery }" variant="text" @click="dialog_url = false">
            <v-icon v-if="!modernProductGallery" start>close</v-icon>
            {{ $t(modernProductGallery ? 'global.actions.cancel' : 'global.actions.close') }}
          </v-btn>

          <v-btn
            :loading="busy_url"
            :disabled="modernProductGallery && !isValidHttpUrl(url_input?.trim())"
            color="primary"
            :size="modernProductGallery ? undefined : 'x-large'"
            :class="{ 'sd-modern-button sd-modern-button--primary': modernProductGallery }"
            variant="elevated"
            @click="addImageUrl()"
          >
            <b-product-edit-info-icon v-if="modernProductGallery" name="Plus" :size="16" />
            <v-icon v-else start>add</v-icon>
            {{ $t("global.actions.add") }}
          </v-btn>
        </div>
      </v-card-actions>
    </v-card>
  </v-dialog>
  <v-dialog v-if="modernProductGallery" v-model="dialog_order" max-width="560" scrollable>
    <v-card class="s-gallery-upload-grid__dialog s-gallery-upload-grid__order sd-modern-widget text-start">
      <v-card-title class="d-flex align-center">
        <b-product-edit-info-icon name="GripVertical" :size="20" />
        {{ $t('add_product.images_modern.arrange') }}
        <v-spacer />
        <v-btn class="sd-modern-icon-button" icon variant="text" :aria-label="$t('global.actions.close')" @click="dialog_order = false"><b-product-edit-info-icon name="X" :size="16" /><v-tooltip activator="parent" :text="$t('global.actions.close')" location="top" :open-on-focus="true" content-class="sd-modern-tooltip text-start" /></v-btn>
      </v-card-title>
      <v-card-text>
        <p class="s-gallery-upload-grid__dialog-help">{{ $t('add_product.images_modern.order_help') }}</p>
        <div class="s-gallery-upload-grid__order-list">
          <div v-for="(image, index) in orderedImages" :key="image.id" class="s-gallery-upload-grid__order-row">
            <v-img :src="getShopImagePath(image.path)" alt="" width="42" height="42" cover />
            <span>{{ $t('add_product.images_modern.image_number', { index: index + 1 }) }}<small v-if="image.alt">{{ image.alt }}</small></span>
            <div class="s-gallery-upload-grid__order-actions">
              <v-btn class="sd-modern-icon-button" icon variant="text" :disabled="index === 0" :aria-label="$t('add_product.images_modern.move_up') + ' · ' + $t('add_product.images_modern.image_number', { index: index + 1 })" @click="moveImage(image.id, -1)"><b-product-edit-info-icon name="ArrowUp" :size="16" /><v-tooltip activator="parent" :text="$t('add_product.images_modern.move_up')" location="top" :open-on-focus="true" content-class="sd-modern-tooltip text-start" /></v-btn>
              <v-btn class="sd-modern-icon-button" icon variant="text" :disabled="index === orderedImages.length - 1" :aria-label="$t('add_product.images_modern.move_down') + ' · ' + $t('add_product.images_modern.image_number', { index: index + 1 })" @click="moveImage(image.id, 1)"><b-product-edit-info-icon name="ArrowDown" :size="16" /><v-tooltip activator="parent" :text="$t('add_product.images_modern.move_down')" location="top" :open-on-focus="true" content-class="sd-modern-tooltip text-start" /></v-btn>
            </div>
          </div>
        </div>
      </v-card-text>
      <v-card-actions><v-spacer /><v-btn class="sd-modern-button" variant="outlined" @click="dialog_order = false">{{ $t('global.actions.close') }}</v-btn></v-card-actions>
    </v-card>
  </v-dialog>
  </div>
</template>

<script lang="ts">
import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";
import Muuri from "muuri";

import SImageUploader from "./SImageUploader.vue";
import SGridDraggableView from "../../ui/grid/draggable-view/SGridDraggableView.vue";
import BProductEditInfoIcon from "../../backoffice/product/edit/info/BProductEditInfoIcon.vue";

export default {
  name: "SGalleryUploadGrid",
  components: { BProductEditInfoIcon, SGridDraggableView, SImageUploader },
  emits: [
    "update:images",
    "add:image",
    "delete:image",
    "click:alt",
    "click:bg-remove",
    "update:orders",
    "activity",
  ],
  props: {
    modern: { type: Boolean, default: false },
    uploadPath: {
      required: true,
    },
    deletePath: {
      required: true,
    },
    images: {
      required: true,
    },

    contain: {
      default: true,
      type: Boolean,
    },
    bgColor: {
      default: "#fafafa",
    },
    hasAlt: {
      type: Boolean,
      default: false,
    },
    maxFileSize: {
      default: "2MB",
    },
    hasAiBackgroundRemove: {
      type: Boolean,
      default: false,
    },
    allowUrlInput: {
      type: Boolean,
      default: false,
    },
  },

  data: () => ({
    selected_gallery: null,

    show_images: false,

    orders: [],

    orders_changed: false,

    busy_delete: false,
    dialog_url: false,
    url_input: null,
    busy_url: false,

    last_orders: null,
    active: true,
    show_upload: false,
    dialog_order: false,
    busy_upload: false,
    suppress_handle_click: false,
  }),

  watch: {
    mediaBusy: { immediate: true, handler() { this.emitActivity(); } },
    hasOpenDialog: { immediate: true, handler() { this.emitActivity(); } },
    "$vuetify.locale.isRtl"() {
      if (this.modern)
        this.$nextTick(() => this.$refs.grid_container?.layout());
    },
    orders() {
      this.orders_changed = true;
    },
  },

  computed: {
    mediaBusy() {
      return this.busy_upload || this.busy_url || (this.busy_delete !== false && this.busy_delete !== null);
    },
    hasOpenDialog() {
      return this.dialog_url || this.dialog_order;
    },
    modernProductGallery() {
      return this.modern && this.hasAlt;
    },
    orderedImages() {
      const positions = new Map(this.orders.map((item, index) => [Number(item.id), index]));
      return this.images.slice().sort((a, b) => (positions.get(Number(a.id)) ?? this.images.indexOf(a)) - (positions.get(Number(b.id)) ?? this.images.indexOf(b)));
    },
    grid_options() {
      if (!this.modern) return undefined;
      return {
        ...SGridDraggableView.props.options.default(),
        layout: this.layoutImages,
        ...(this.modernProductGallery ? { dragHandle: '.s-gallery-upload-grid__handle', dragStartPredicate: { distance: 5, delay: 0 } } : {}),
      };
    },
    uploadLabel() {
      // FilePond owns file selection and its validation; only its idle copy changes.
      const escape = (value) => String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
      return `<span class="s-gallery-upload-grid__drop"><i class="material-icons" aria-hidden="true">cloud_upload</i><span><span class="s-gallery-upload-grid__drop-title">${escape(this.$t('global.image_uploader.gallery.drop'))}</span><span class="s-gallery-upload-grid__drop-hint">${escape(this.$t('global.image_uploader.gallery.limit', { size: this.maxFileSize }))} · ${escape(this.$t('global.image_uploader.gallery.formats'))}</span></span></span><span class="filepond--label-action s-gallery-upload-grid__browse sd-modern-button--primary" role="button" tabindex="0"><i class="material-icons" aria-hidden="true">add</i>${escape(this.$t('global.image_uploader.gallery.choose'))}</span>`;
    },
    style_value() {
      if (this.modern) return undefined;
      if (this.$vuetify.display.mdAndUp)
        return "width: 30%;height: auto;margin: 1.5%";
      if (this.$vuetify.display.smAndUp)
        return "width: 44%;height: auto;margin: 2%";
      return "width: 94%;height: auto;margin: 3%";
    },
  },
  created() {
    this.orders = this.images.map((im) => {
      return { id: im.id, order: im.order };
    });
    this.last_orders = Object.assign([], this.orders);
  },

  mounted() {
    this.show_images = false;

    // Wait all animation ends! (Fix bug in dialog)
    setTimeout(() => {
      this.show_images = true;
    }, 400);
  },
  beforeUnmount() {
    this.active = false;
  },

  methods: {
    emitActivity() {
      if (this.modernProductGallery) this.$emit('activity', { busy: this.mediaBusy, dialog: this.hasOpenDialog });
    },
    refreshUploadBusy() {
      if (!this.modernProductGallery) return;
      this.$nextTick(() => {
        if (!this.active) return;
        const files = this.$refs.uploader?.$refs.pond?.getFiles() || [];
        // FilePond's own loading/queued/processing states preserve multi-file activity.
        this.busy_upload = files.some(file => [1, 3, 7, 9].includes(file.status));
      });
    },
    showOrderDialog() {
      if (this.modernProductGallery) this.dialog_order = true;
    },
    onHandleClick(event) {
      // A completed drag must not also open the keyboard arrangement alternative.
      if (this.suppress_handle_click && event.detail !== 0) {
        this.suppress_handle_click = false;
        return;
      }
      this.suppress_handle_click = false;
      this.showOrderDialog();
    },
    layoutImages(grid, id, items, width, height, callback) {
      // Native packing snapshots each layout's direction without recreating the grid or uploader.
      Muuri.defaultPacker.setOptions({
        fillGaps: true,
        rounding: false,
        alignRight: Boolean(this.$vuetify.locale.isRtl),
      });
      return Muuri.defaultPacker.createLayout(grid, id, items, width, height, callback);
    },
    imagePosition(image, index) {
      const order = this.orders.findIndex((item) => Number(item.id) === Number(image.id));
      return order < 0 ? index + 1 : order + 1;
    },
    moveImage(imageId, offset) {
      if (!this.modern || ![-1, 1].includes(offset)) return;
      const grid = this.$refs.grid_container?.grid;
      if (!grid) return;
      const items = grid.getItems();
      const from = items.findIndex((item) => Number(item.getElement().getAttribute('image_id')) === Number(imageId));
      const to = from + offset;
      if (from < 0 || to < 0 || to >= items.length) return;
      grid.move(from, to);
      this.updateOrder(grid.getItems());
      this.dragEnd();
    },
    updateOrder(items) {
      //console.log("updateOrder");
      this.orders = [];
      let index = 0;

      items.forEach((item) => {
        //  console.log('updateOrder item',item)

        const id = item._element.getAttribute("image_id");
        if (id)
          // Not send uploader component!
          this.orders.push({ id: parseInt(id), order: index++ });
      });
      this.orders_changed = true;
    },

    dragEnd() {
      if (!this.orders_changed) return;

      // console.log(this.last_orders,this.orders)

      if (JSON.stringify(this.last_orders) === JSON.stringify(this.orders))
        return; // No order changes!

      this.last_orders = Object.assign([], this.orders);

      this.orders_changed = false;
      // console.log("dragEnd",this.orders,JSON.stringify(this.orders));

      this.$emit("update:orders", this.orders);
    },

    handleUploadAppImages(response) {
      if (this.modern && !this.active) return;
      this.refreshUploadBusy();
      const clone = this.images.slice();
      const index = clone.length;
      clone.push(response.files.item);
      this.$emit("update:images", clone);
      this.$emit("add:image", response.files.item);

      this.$nextTick(function () {
        if (this.modern && (!this.active || !this.$refs.grid_container || !this.$refs.items)) return;
        const item = this.modern
          ? this.$refs.items.find((element) => Number(element.getAttribute('image_id')) === Number(response.files.item.id))
          : this.$refs.items[index];
        if (this.modern && !item) return;
        this.$refs.grid_container.add(item, {
          index: index,
        });
      });
    },

    showUrlDialog() {
      this.url_input = null;
      this.dialog_url = true;
    },

    isValidHttpUrl(url) {
      if (!url) return false;
      try {
        const parsed = new URL(url);
        return ["http:", "https:"].includes(parsed.protocol);
      } catch (e) {
        return false;
      }
    },

    addImageUrl() {
      if (this.modernProductGallery && this.busy_url) return;
      const url = this.url_input?.trim();
      if (!this.isValidHttpUrl(url)) {
        return NotificationService.showErrorAlert(
          null,
          this.modernProductGallery ? this.$t('add_product.images_modern.url_invalid') : "Enter a valid image URL.",
        );
      }

      this.busy_url = true;
      axios
        .post(this.uploadPath, { url })
        .then(({ data }) => {
          if (data.error) {
            NotificationService.showErrorAlert(null, data.error_msg);
            return;
          }

          if (!data.files?.item) {
            NotificationService.showErrorAlert(null, this.modernProductGallery ? this.$t('add_product.images_modern.url_not_created') : "Image was not created.");
            return;
          }

          this.handleUploadAppImages(data);
          this.dialog_url = false;

          NotificationService.showSuccessAlert(
            null,
            this.modernProductGallery ? this.$t('add_product.images_modern.url_added') : "Image URL added successfully.",
          );
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_url = false;
        });
    },

    deleteAppImage(image_item, index) {
      //console.log('image_item',image_item,'index',index);

      this.busy_delete = index;
      axios
        .delete(this.deletePath(image_item))
        .then(({ data }) => {
          if (this.modern && !this.active) return;
          if (data.error) {
            NotificationService.showErrorAlert(null, data.error_msg);
          } else {
            const clone = this.images.slice();
            this.DeleteItemByID(clone, data.id);

            this.$emit("update:images", clone);
            this.$emit("delete:image", data.id);

            const item = this.modern
              ? this.$refs.grid_container.getItems().find((item) => Number(item.getElement().getAttribute('image_id')) === Number(data.id))
              : this.$refs.grid_container.getItems(index);
            this.$refs.grid_container.remove(item);

            /* this.$nextTick( () =>{
                    this.$refs.grid_container.layout();
                  });*/

            NotificationService.showSuccessAlert(
              "Delete image",
              "Image removed successfully.",
            );
          }
        })
        .catch((error) => {
          if (this.modern && !this.active) return;
          NotificationService.showLaravelError(error);
        })

        .finally(() => {
          if (this.modern && !this.active) return;
          this.busy_delete = null;
        });
    },
  },
};
</script>

<style lang="scss" scoped>
.s-gallery-upload-grid--modern {
  --gallery-columns: 3;
  min-width: 0;

  .s-gallery-upload-grid__heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 10px;
    margin-block: 26px 16px;
    h2 {
      margin: 0;
      font-size: 14px;
      line-height: 22px;
      font-weight: 500;
      span { margin-inline-start: 8px; font-size: 12px; font-weight: 400; color: var(--sd-modern-muted); }
    }
    p {
      display: flex;
      align-items: center;
      gap: 6px;
      margin: 0;
      color: var(--sd-modern-muted);
      font-size: 12px;
      line-height: 20px;
    }
  }
  .s-gallery-upload-grid__empty {
    padding: 28px 12px 32px;
    h3 { margin-block: 10px 4px; font-size: 14px; line-height: 22px; font-weight: 500; }
    p { margin: 0; font-size: 13px; line-height: 21px; }
  }
  .b--gallery-grid {
    width: calc(100% + 20px);
    margin-inline: -10px;
    .item-grid {
      width: calc(100% / var(--gallery-columns));
      margin: 0;
      padding: 0 10px 20px !important;
      background: transparent;
    }
    .v-img {
      background: var(--sd-modern-inset);
      border: 1px solid rgba(var(--v-theme-on-surface), 0.2);
    }
    .-spec { font-size: 12px; line-height: 18px; }
  }
  .s-gallery-upload-grid__footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin-block-start: 10px;
  }
  .s-gallery-upload-grid__position.v-btn {
    min-width: 0;
    height: 32px;
    padding: 4px;
    color: var(--sd-modern-muted);
    border-radius: 6px;
    font-size: 12px;
    line-height: 20px;
    font-weight: 400;
    letter-spacing: 0;
    text-indent: 0;
    :deep(.v-btn__content) { gap: 7px; font: inherit; letter-spacing: inherit; }
  }
  .s-gallery-upload-grid__delete { --sd-modern-icon-button-size: 32px; }

  .s-gallery-upload-grid__upload {
    :deep(.uploader-container) {
      max-width: none;
      min-width: 0;
      padding: 0;
      margin: 0 !important;
      background: var(--sd-modern-inset);
      border: 1px dashed var(--sd-modern-border);
      border-radius: 12px;
    }
    :deep(.filepond-style) {
      position: relative;
      min-height: 88px !important;
      margin: 0 !important;
    }
    :deep(.filepond-style .filepond--root) {
      position: relative !important;
      height: auto;
    }
    :deep(.filepond-style .filepond--list-scroller) {
      position: relative;
      top: auto;
      bottom: auto;
      max-height: none;
      pointer-events: auto;
    }
    :deep(.filepond--panel-root) { background: transparent; background-image: none; }
    :deep(.filepond--drop-label) { min-height: 88px; margin: 0 !important; color: rgb(var(--v-theme-on-surface)); }
    :deep(.filepond--drop-label label) {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 20px;
      width: 100%;
      margin: 0;
      padding: 20px;
      text-align: start;
      font-family: inherit;
    }
    :deep(.s-gallery-upload-grid__drop) { display: flex; align-items: center; gap: 14px; min-width: 0; }
    :deep(.s-gallery-upload-grid__drop > .material-icons) { font-size: 26px; color: var(--sd-modern-muted); }
    :deep(.s-gallery-upload-grid__drop-title) { display: block; font-size: 14px; line-height: 22px; font-weight: 500; }
    :deep(.s-gallery-upload-grid__drop-hint) { display: block; margin-block-start: 3px; font-size: 13px; line-height: 21px; font-weight: 400; color: var(--sd-modern-muted); }
    :deep(.s-gallery-upload-grid__browse) {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      min-height: 42px;
      padding: 10px 17px;
      flex-shrink: 0;
      white-space: nowrap;
      color: rgb(var(--v-theme-on-primary));
      background: rgb(var(--v-theme-primary));
      border-radius: 9px;
      text-decoration: none;
      font-size: 13px;
      line-height: 22px;
      font-weight: 500;
      letter-spacing: 0;
    }
    :deep(.s-gallery-upload-grid__browse .material-icons) { font-size: 18px; }
    :deep(.s-gallery-upload-grid__browse:focus-visible) { outline: 2px solid rgb(var(--v-theme-primary)); outline-offset: 3px; }
    // The same native size guidance is included in the full-width idle label.
    :deep(.file-size-limit) { display: none; }
  }
  // FilePond keeps its queue LTR; mirror only the localized idle controls.
  &:dir(rtl) .s-gallery-upload-grid__upload :deep(.filepond--drop-label label) { direction: rtl; }
  @media (max-width: 700px) {
    --gallery-columns: 2;
    .s-gallery-upload-grid__upload {
      :deep(.filepond--drop-label label) { flex-wrap: wrap; padding: 16px; gap: 16px; }
    }
  }
  @media (max-width: 430px) {
    --gallery-columns: 1;
    .s-gallery-upload-grid__upload {
      :deep(.filepond--drop-label label) { flex-direction: column; align-items: stretch; }
    }
  }
  @media (max-width: 700px), (pointer: coarse) {
    .s-gallery-upload-grid__delete { --sd-modern-icon-button-size: 44px; }
    .s-gallery-upload-grid__position.v-btn { height: 44px; padding-inline: 8px; }
    .s-gallery-upload-grid__upload :deep(.s-gallery-upload-grid__browse) { min-height: 44px; }
  }
}

.s-gallery-upload-grid--product {
  --gallery-columns: 3;
  .s-gallery-upload-grid__product-tools { display: flex; align-items: center; flex-wrap: wrap; gap: 10px 20px; margin-block-end: 18px; }
  .s-gallery-upload-grid__product-tools .v-btn { gap: 7px; height: 38px; min-height: 38px; padding: 9px 13px; font-size: 12px; line-height: 18px; }
  .s-gallery-upload-grid__product-tools .sd-modern-button--inline { padding-inline: 0; }
  .s-gallery-upload-grid__product-tools :deep(.v-btn__content) { gap: 7px; }
  .s-gallery-upload-grid__upload { margin-block-end: 18px; }
  .b--gallery-grid { width: calc(100% + 12px); margin-inline: -6px; }
  .b--gallery-grid .item-grid {
    box-sizing: border-box;
    width: calc(100% / var(--gallery-columns));
    padding: 0 6px 14px !important;
    cursor: default;
    &::before { content: ''; position: absolute; inset: 0 6px 14px; border: 1px solid var(--sd-modern-border); border-radius: 11px; background: rgb(var(--v-theme-surface)); }
    > .v-img { position: relative; margin: 5px 5px 0; width: calc(100% - 10px); border: 0; border-radius: 7px; }
    .-spec { font-size: 10px; line-height: 16px; }
  }
  .s-gallery-upload-grid__product-info { position: relative; padding: 5px 10px 10px; }
  .s-gallery-upload-grid__alt { display: block; max-width: 100%; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; font-size: 11px; line-height: 18px; color: var(--sd-modern-muted); margin-block-end: 8px; }
  .s-gallery-upload-grid__alt:focus-visible { outline: 2px solid rgb(var(--v-theme-primary)); outline-offset: 2px; }
  .s-gallery-upload-grid__product-actions { display: flex; align-items: center; gap: 6px; }
  .s-gallery-upload-grid__number { font-size: 11px; line-height: 18px; color: var(--sd-modern-muted); min-width: 15px; }
  .s-gallery-upload-grid__handle { border: 0; background: transparent; cursor: grab; touch-action: none; }
  .s-gallery-upload-grid__handle:active { cursor: grabbing; }
  .s-gallery-upload-grid__more { margin-inline-start: auto; }
  @media (max-width: 850px) { --gallery-columns: 2; }
  @media (max-width: 520px) {
    .b--gallery-grid { width: calc(100% + 10px); margin-inline: -5px; }
    .b--gallery-grid .item-grid { padding-inline: 5px !important; &::before { inset-inline: 5px; } }
    .s-gallery-upload-grid__product-info { padding: 5px 7px 8px; }
    .s-gallery-upload-grid__product-actions { gap: 3px; flex-wrap: wrap; }
    .s-gallery-upload-grid__number { flex-basis: 100%; min-width: 0; font-size: 10px; margin-block-end: 1px; }
  }
  @media (max-width: 700px), (pointer: coarse) {
    .s-gallery-upload-grid__handle, .s-gallery-upload-grid__more { --sd-modern-icon-button-size: 44px; }
    .s-gallery-upload-grid__product-tools .v-btn { height: 44px; min-height: 44px; }
  }
  @media (max-width: 360px) { .s-gallery-upload-grid__product-info { padding-inline: 4px; } .s-gallery-upload-grid__product-actions { gap: 0; } }
}

.s-gallery-upload-grid__menu { :deep(.v-list-item) { min-height: 36px; } :deep(.v-list-item__prepend) { margin-inline-end: 8px; } :deep(.v-list-item-title) { font-size: 12px; line-height: 18px; } @media (max-width: 700px), (pointer: coarse) { :deep(.v-list-item) { min-height: 44px; } } }
.s-gallery-upload-grid__dialog.v-card {
  padding: 23px;
  border-radius: 16px;
  :deep(input.v-field__input) { box-sizing: border-box; }
  .v-card-title { display: flex; align-items: center; gap: 10px; padding: 0; font-size: 18px; line-height: 26px; font-weight: 500; white-space: normal; }
  .v-card-title > svg { flex-shrink: 0; color: var(--sd-modern-muted); }
  .v-card-text { padding: 20px 0 0; font-size: var(--sd-modern-font-body); line-height: 22px; }
  .s-gallery-upload-grid__dialog-help { margin-block: 0 16px; color: var(--sd-modern-muted); }
  .v-card-actions { padding: 20px 0 0; gap: 8px; }
  .s-gallery-upload-grid__dialog-actions { display: flex; align-items: center; justify-content: space-between; gap: 8px; flex-wrap: wrap; width: 100%; }
  .s-gallery-upload-grid__dialog-actions > .v-btn { margin: 0; }
  .s-gallery-upload-grid__dialog-actions :deep(.v-btn__content) { gap: 7px; }
  .sd-modern-button { font-size: 13px; line-height: 20px; }
  .s-gallery-upload-grid__order-row { display: flex; align-items: center; gap: 10px; padding-block: 10px; border-block-end: 1px solid var(--sd-modern-border); }
  .s-gallery-upload-grid__order-row:last-child { border-block-end: 0; }
  .s-gallery-upload-grid__order-row > .v-img { flex: 0 0 42px; border-radius: 7px; }
  .s-gallery-upload-grid__order-row > span { flex: 1; min-width: 0; overflow-wrap: anywhere; font-size: 14px; line-height: 21px; }
  .s-gallery-upload-grid__order-row small { display: block; margin-block-start: 2px; font-size: 13px; line-height: 20px; color: var(--sd-modern-muted); }
  .s-gallery-upload-grid__order-actions { display: flex; align-items: center; gap: 6px; }
  @media (max-width: 600px) { padding: 18px 16px; }
  @media (max-width: 520px) { .s-gallery-upload-grid__order-row { flex-wrap: wrap; } .s-gallery-upload-grid__order-row > span { flex-basis: calc(100% - 54px); } .s-gallery-upload-grid__order-actions { margin-inline-start: auto; } }
}

.b--gallery-grid {
  .item-grid {
    cursor: move;
    border-radius: 12px;

    display: block;
    position: absolute;
    z-index: 1;
    background: #fff;

    .v-img {
      border-radius: 12px;
    }
  }

  .-spec {
    background-color: rgba(10, 20, 60, 0.3);
    transition: all 0.4s;

    &:hover {
      background-color: rgba(10, 20, 60, 0.9);
    }
  }
}

</style>
