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
  <div :class="modern ? 'b-product-edit-images--modern text-start' : 'mt-5'">
    <template v-if="modern">
      <section class="sd-modern-widget b-product-edit-images__card">
        <header class="b-product-edit-images__heading">
          <b-product-edit-info-icon name="Image" />
          <div><h2>{{ $t('add_product.edit_images.title') }}</h2><p>{{ $t('add_product.images_modern.main_intro') }}</p></div>
          <v-btn class="sd-modern-icon-button sd-modern-info-button" icon variant="text" :aria-label="$t('add_product.images_modern.main_about')">
            <b-product-edit-info-icon name="Info" :size="16" />
            <v-tooltip activator="parent" location="top" :open-on-click="true" content-class="sd-modern-tooltip text-start">{{ $t('add_product.images_modern.main_help') }}</v-tooltip>
          </v-btn>
        </header>
        <div class="b-product-edit-images__main-grid">
          <div class="b-product-edit-images__settings">
            <s-image-uploader :key="main_uploader_key" :image="getShopImagePath(product.icon)" :server="upload_main_image_url" modern dense auto-compact border :disabled="busySave || busy_ai || busy_upscale || busy || busy_main_image_url || dialog_replace_bg || dialog_main_image_url" rounded="lg" max-file-size="3MB" min-height="180px" :label="$t('add_product.edit_images.title')" :edit-label="$t('add_product.images_modern.replace_main')" @new-path="handleProcessFile" @onProcessFileStart="main_uploading = true" @onProcessFileAbort="main_uploading = false" @onError="main_uploading = false" @response="main_uploading = false">
              <template #compact-action="{ edit }">
                <v-btn class="sd-modern-icon-button" icon variant="text" :aria-label="$t('add_product.images_modern.replace_main')" @click="edit(); editing_main_image = true">
                  <b-product-edit-info-icon name="Pencil" :size="16" />
                  <v-tooltip activator="parent" location="top" content-class="sd-modern-tooltip text-start">{{ $t('add_product.images_modern.replace_main') }}</v-tooltip>
                </v-btn>
              </template>
            </s-image-uploader>
            <v-btn v-if="editing_main_image && !main_uploading" class="sd-modern-button sd-modern-button--inline" variant="text" @click="cancelMainReplacement">{{ $t('global.actions.cancel') }}</v-btn>
            <p class="b-product-edit-images__micro">{{ $t('add_product.images_modern.main_immediate') }}</p>
            <v-btn class="sd-modern-button sd-modern-button--inline b-product-edit-images__url" color="primary" variant="text" :disabled="mediaBusy || busySave" @click="showMainImageUrlDialog">
              <template #prepend><b-product-edit-info-icon name="Link" :size="15" /></template>{{ $t('add_product.images_modern.use_url') }}
            </v-btn>
            <p v-if="!product.icon" class="b-product-edit-images__help">{{ $t('add_product.edit_images.main_image_input_nodata') }}</p>
            <div v-if="product.icon && !forStudio" class="b-product-edit-images__fit">
              <u-smart-toggle v-model="product.style.contain" :disabled="busySave" accessible false-gray :true-title="$t('add_product.images_modern.fit_title')" :false-title="$t('add_product.images_modern.fit_title')" :true-description="$t('add_product.images_modern.fit_help')" :false-description="$t('add_product.images_modern.fit_help')" @change="refreshPreview" />
              <v-btn class="sd-modern-icon-button sd-modern-info-button" icon variant="text" :aria-label="$t('add_product.images_modern.fit_about')"><b-product-edit-info-icon name="Info" :size="16" /><v-tooltip activator="parent" location="top" :open-on-click="true" content-class="sd-modern-tooltip text-start">{{ $t('add_product.images_modern.fit_details') }}</v-tooltip></v-btn>
            </div>
          </div>
          <div v-if="preview_available" class="b-product-edit-images__preview">
            <p class="b-product-edit-images__preview-label"><b-product-edit-info-icon name="Store" :size="14" />{{ $t('add_product.images_modern.storefront_preview') }}</p>
            <s-shop-product-card :key="product.icon" ref="prev" :product="product" rounded />
          </div>
        </div>
      </section>

      <details v-if="imageToolsAvailable" class="sd-modern-widget sd-modern-disclosure b-product-edit-images__disclosure">
        <summary class="sd-modern-disclosure__summary"><b-product-edit-info-icon name="WandSparkles" /><span class="b-product-edit-images__summary-copy"><span class="b-product-edit-images__summary-title">{{ $t('add_product.images_modern.tools') }}</span><span class="b-product-edit-images__digest">{{ imageToolsDigest }}</span></span><b-product-edit-info-icon name="ChevronDown" :size="16" class="b-product-edit-images__chevron" /></summary>
        <div class="b-product-edit-images__disclosure-body">
          <div class="b-product-edit-images__tool"><b-product-edit-info-icon :name="need_upscale ? 'Maximize2' : 'ScanLine'" /><div><h3>{{ $t(need_upscale ? 'ai.upscale.title' : 'ai.remove_bg.title') }}</h3><p>{{ $t(need_upscale ? 'add_product.images_modern.upscale_help' : 'add_product.images_modern.remove_bg_help') }}</p></div><v-btn class="sd-modern-button" variant="outlined" :loading="need_upscale ? busy_upscale : busy_ai" :disabled="mediaBusy || busySave" @click="need_upscale ? upscaleImage() : removeBackground()">{{ $t(need_upscale ? 'ai.upscale.title' : 'ai.remove_bg.title') }}</v-btn></div>
          <div class="b-product-edit-images__tool"><b-product-edit-info-icon name="Sparkles" /><div><h3>{{ $t('ai.reimagine.title') }}</h3><p>{{ $t('add_product.images_modern.reimagine_help') }}</p></div><v-btn class="sd-modern-button" variant="outlined" :disabled="mediaBusy || busySave" @click="showReplaceBg">{{ $t('ai.reimagine.title') }}</v-btn></div>
          <p class="b-product-edit-images__help">{{ $t('add_product.images_modern.ai_quota') }}</p>
        </div>
      </details>

      <section class="sd-modern-widget b-product-edit-images__card">
        <header class="b-product-edit-images__heading"><b-product-edit-info-icon name="GalleryVerticalEnd" /><div><h2>{{ $t('add_product.images_modern.gallery_title') }}</h2><p>{{ $t('add_product.images_modern.gallery_intro') }}</p></div><span class="b-product-edit-images__count">{{ $t('add_product.images_modern.image_count', { count: product.images?.filter(image => image.variant_id === null).length || 0 }) }}</span></header>
        <b-product-images-gallery ref="images" :product="product" :inert="busySave" modern @activity="gallery_activity = $event" />
        <p class="b-product-edit-images__help b-product-edit-images__gallery-note">{{ $t('add_product.images_modern.gallery_immediate') }}</p>
      </section>

      <details v-if="!forStudio" class="sd-modern-widget sd-modern-disclosure b-product-edit-images__disclosure">
        <summary class="sd-modern-disclosure__summary"><b-product-edit-info-icon name="Video" /><span class="b-product-edit-images__summary-copy"><span class="b-product-edit-images__summary-title">{{ $t('add_product.images_modern.videos') }}</span><span class="b-product-edit-images__digest">{{ videosDigest }}</span></span><b-product-edit-info-icon name="ChevronDown" :size="16" class="b-product-edit-images__chevron" /></summary>
        <div class="b-product-edit-images__disclosure-body">
          <h3>{{ $t('add_product.images_modern.youtube_title') }}</h3><p class="b-product-edit-images__help">{{ $t('add_product.images_modern.youtube_help') }}</p>
          <v-text-field v-model="video_id" :disabled="busySave" class="sd-modern-underlined-field b-product-edit-images__youtube-field" :label="$t('add_product.images_modern.youtube_label')" :messages="$t('add_product.images_modern.youtube_hint')" variant="underlined" clearable @blur="correctVideoId" />
          <u-youtube-preview :video-id="normalizedVideoId" modern />
          <h3 class="b-product-edit-images__upload-title">{{ $t('add_product.images_modern.uploaded_videos') }}</h3>
          <p class="b-product-edit-images__help">{{ $t('add_product.images_modern.video_limits', { count: max_videos_count, size: '20 MB' }) }}</p>
          <div v-if="product.videos?.length" class="b-product-edit-images__videos">
            <div v-for="(product_video, index) in product.videos" :key="product_video.id" class="b-product-edit-images__video-row">
              <a :href="getVideoUrl(product_video.path)" target="_blank" rel="noopener noreferrer" class="b-product-edit-images__video-preview" :aria-label="$t('add_product.images_modern.open_video', { number: index + 1 })"><u-avatar-folder :src="product_video.thumbnail_path ? getShopImagePath(product_video.thumbnail_path) : undefined" :size="48" :border-size="5" elevated is-red placeholder-icon="videocam" side-icon="theaters" /><v-tooltip activator="parent" location="top" content-class="sd-modern-tooltip text-start">{{ $t('add_product.images_modern.open_video', { number: index + 1 }) }}</v-tooltip></a>
              <div class="b-product-edit-images__video-copy"><a :href="getVideoUrl(product_video.path)" target="_blank" rel="noopener noreferrer">{{ $t('add_product.images_modern.video_number', { number: index + 1 }) }}<v-icon icon="north_east" size="14" aria-hidden="true" /></a><p class="b-product-edit-images__video-path" :title="getVideoUrl(product_video.path)">{{ product_video.path?.split('/').pop() }}</p><small>{{ numeralFormat(product_video.size, '0,0.[0] b') }}</small></div>
              <v-btn class="sd-modern-icon-button" icon variant="text" :aria-label="$t('add_product.images_modern.delete_video', { number: index + 1 })" :loading="busy_remove_video === product_video.id" :disabled="mediaBusy || busySave" @click="removeVideo(product_video)"><b-product-edit-info-icon name="Trash2" :size="16" /><v-tooltip activator="parent" location="top" content-class="sd-modern-tooltip text-start">{{ $t('add_product.images_modern.delete_video', { number: index + 1 }) }}</v-tooltip></v-btn>
            </div>
          </div>
          <s-video-uploader v-if="max_videos_count > 0 && (product.videos?.length || 0) < max_videos_count" :server="upload_video_url" class="b-product-edit-images__video-upload" :idle-label="$t('add_product.images_modern.upload_video')" min-height="88px" rounded="lg" :disabled="busySave" auto-compact max-file-size="20MB" @new-item="onUploadVideoItem" @activity="video_uploading = $event" />
          <p v-if="max_videos_count === 0" class="b-product-edit-images__help">{{ $t('add_product.images_modern.upgrade_videos') }}</p>
          <p class="b-product-edit-images__help">{{ $t('add_product.images_modern.video_immediate') }} <a href="https://handbrake.fr" target="_blank" rel="noopener noreferrer">HandBrake<v-icon icon="north_east" size="14" aria-hidden="true" /></a></p>
        </div>
      </details>
      <footer v-if="!forStudio" class="b-product-edit-images__footer">
        <div><p role="status" aria-live="polite"><b-product-edit-info-icon :name="hasUnsavedChanges ? 'Circle' : 'CircleCheck'" :size="16" />{{ $t(hasUnsavedChanges ? 'add_product.images_modern.unsaved' : 'add_product.images_modern.saved') }}</p><small>{{ $t('add_product.images_modern.save_scope') }}</small></div>
        <v-btn v-if="!externalActionButtons" class="sd-modern-button sd-modern-button--primary" color="primary" variant="elevated" :loading="busySave" :disabled="mediaBusy || saveBlocked" aria-keyshortcuts="Control+s" @click="submit" v-ctrl.s="submit"><template #prepend><b-product-edit-info-icon name="Save" :size="16" /></template>{{ $t('global.actions.save_continue') }}<template #append><b-product-edit-info-icon name="ArrowRight" :size="16" class="b-product-edit-images__direction" /></template></v-btn>
      </footer>
    </template>
    <template v-else>
    <!-- ==================== Main Image ==================== -->

    <div class="widget-box -large mb-5">
      <v-row justify="center" no-gutters>
        <v-col class="d-flex flex-column" cols="12" sm="6">
          <h2>
            <v-icon class="me-1">photo_camera</v-icon>
            {{ $t("add_product.edit_images.title") }}
          </h2>
          <v-list-subheader
            >{{ $t("add_product.edit_images.main_image_input_message") }}
          </v-list-subheader>

          <div>
            <s-image-uploader
              :image="getShopImagePath(product.icon)"
              :server="upload_main_image_url"
              class="mt-2"
              max-file-size="3MB"
              @new-path="handleProcessFile"
              auto-compact
              border
              rounded="lg"
            >
            </s-image-uploader>

            <v-btn
              block
              class="mt-3 text-none text-white justify-start"
              color="#111"
              height="72"
              prepend-icon="link"
              rounded="lg"
              size="x-large"
              variant="flat"
              @click="showMainImageUrlDialog()"
            >
              <span
                class="d-flex flex-column text-start flex-grow-1 flex-shrink-1 overflow-hidden"
              >
                <span class="d-flex align-center overflow-hidden">
                  <v-avatar
                    v-if="isValidHttpUrl(product.icon)"
                    class="me-2 bg-white flex-shrink-0"
                    rounded="lg"
                    size="28"
                  >
                    <v-img :src="product.icon" cover />
                  </v-avatar>
                  <b class="text-body-1 font-weight-bold text-truncate"
                    >Set main image by URL</b
                  >
                </span>
                <small
                  class="text-caption font-weight-regular opacity-60 mt-1 text-truncate"
                  >Optional external link. Not stored.</small
                >
              </span>
            </v-btn>
            <v-alert
              v-if="!product.icon"
              class="small mt-3"
              color="info"
              density="compact"
              icon="info"
            >
              {{ $t("add_product.edit_images.main_image_input_nodata") }}
            </v-alert>
          </div>

          <v-expand-transition>
            <div v-if="product.icon && !forStudio">
              <h2 class="mt-5">
                <v-icon class="me-1">tune</v-icon>
                {{ $t("add_product.edit_images.image_style") }}
              </h2>
              <u-smart-toggle
                v-if="product.style"
                v-model="product.style.contain"
                :true-description="
                  $t('add_product.edit_images.background_is_white_msg')
                "
                :true-title="$t('add_product.edit_images.background_is_white')"
                class="m-2 mt-5"
                false-gray
                false-icon="center_focus_strong"
                true-icon="filter_center_focus"
                @change="
                  $refs.prev
                    ? $refs.prev.extRefreshStyle() /*Force update preview!*/
                    : undefined;
                  $forceUpdate();
                "
              ></u-smart-toggle>

              <template
                v-if="
                  product.icon &&
                  !isValidHttpUrl(product.icon) &&
                  !forStudio &&
                  !IS_VENDOR_PANEL /*Not yet implemented to vendors!*/
                "
              >
                <!-- ━━━━━━━━━━━━━━━━━━━━━ Upscale ━━━━━━━━━━━━━━━━━━━━━ -->
                <u-button-ai-large
                  v-if="need_upscale"
                  :loading="busy_upscale"
                  :title="$t('ai.upscale.title')"
                  :sub-title="$t('ai.upscale.subtitle')"
                  @select="upscaleImage()"
                  highlighted
                >
                </u-button-ai-large>

                <!-- ━━━━━━━━━━━━━━━━━━━━━ Remove BG ━━━━━━━━━━━━━━━━━━━━━ -->

                <u-button-ai-large
                  v-else
                  :loading="busy_ai"
                  :title="$t('ai.remove_bg.title')"
                  :sub-title="$t('ai.remove_bg.subtitle')"
                  @select="removeBackground()"
                >
                </u-button-ai-large>
                <!-- ━━━━━━━━━━━━━━━━━━━━━ Reimagin / Replace background ━━━━━━━━━━━━━━━━━━━━━ -->

                <u-button-ai-large
                  :title="$t('ai.reimagine.title')"
                  :sub-title="$t('ai.reimagine.subtitle')"
                  @select="showReplaceBg()"
                >
                </u-button-ai-large>
              </template>
            </div>
          </v-expand-transition>
        </v-col>

        <v-col v-if="preview_available" cols="12" sm="6">
          <div v-if="!$vuetify.display.smAndUp" class="widget-buttons">
            <v-btn
              block
              color="#222"
              size="x-large"
              variant="flat"
              @click="show_preview_card = !show_preview_card"
            >
              <v-icon class="me-1" size="small"
                >{{ show_preview_card ? "visibility" : "visibility_off" }}
              </v-icon>

              {{
                show_preview_card
                  ? $t("global.actions.hide_preview")
                  : $t("global.actions.show_preview")
              }}
            </v-btn>
          </div>

          <!-- ==================== Product card image preview ==================== -->

          <v-expand-transition>
            <div v-if="show_preview_card || $vuetify.display.smAndUp">
              <div class="sample-view">
                <small class="d-block mb-2">
                  <v-icon class="me-1" color="green" size="12">circle</v-icon>
                  {{ $t("add_product.edit_images.preview") }}
                </small>
                <s-shop-product-card
                  :key="product.icon"
                  ref="prev"
                  :product="product"
                  rounded
                >
                </s-shop-product-card>
              </div>
            </div>
          </v-expand-transition>
        </v-col>
      </v-row>
    </div>

    <!-- ==================== Product Images ==================== -->

    <div class="mb-5 widget-box -large">
      <h2>
        <v-icon class="me-1">collections</v-icon>
        {{ $t("add_product.edit_images.images.title") }}
      </h2>
      <v-list-subheader>
        {{ $t("add_product.edit_images.images.sub_title") }}
      </v-list-subheader>
      <b-product-images-gallery
        ref="images"
        :product="product"
        class="m-2 min-height-40vh"
      />
    </div>

    <!-- ==================== Product Video ==================== -->

    <div v-if="!forStudio" class="widget-box -large mb-5">
      <h2>
        <v-icon class="me-1">videocam</v-icon>
        {{ $t("add_product.edit_images.video.title") }}
      </h2>
      <v-list-subheader>
        {{ $t("add_product.edit_images.video.sub_title") }}
      </v-list-subheader>

      <v-text-field
        v-model="video_id"
        append-inner-icon="fa:fab fa-youtube"
        bg-color="#D32F2F"
        class="max-width-field-large mx-auto"
        clearable
        flat
        hide-details
        label="Youtube video"
        messages="Enter youtube video url or video ID"
        rounded="lg"
        variant="solo-filled"
        @blur="correctVideoId"
      >
      </v-text-field>

      <u-youtube-preview
        :video-id="video_id"
        class="max-width-field-large mx-auto"
      ></u-youtube-preview>

      <template v-if="max_videos_count > 0">
        <hr class="my-5" />

        <v-list-subheader>
          You can upload a maximum of {{ max_videos_count }} videos, as determined by your current plan. To reduce and optimize your video size, use this free software:
          <a href="https://handbrake.fr" target="_blank"><b>HandBrake</b> <v-icon size="small">open_in_new</v-icon> </a>.
        </v-list-subheader>


        <v-list
          max-width="640"
          class="mx-auto border-between-vertical"
          bg-color="transparent"
        >
          <v-list-item v-for="product_video in product.videos">
            <template v-slot:prepend>
              <a
                :href="getVideoUrl(product_video.path)"
                target="_blank"
                class="d-block me-3"
              >
                <u-avatar-folder
                  :src="
                    product_video.thumbnail_path
                      ? getShopImagePath(product_video.thumbnail_path)
                      : undefined
                  "
                  :size="64"
                  :border-size="8"
                  elevated
                  is-red
                  placeholder-icon="videocam"
                  side-icon="theaters"
                ></u-avatar-folder>
              </a>
            </template>
            <v-list-item-title class="small">
              {{ getVideoUrl(product_video.path) }}
            </v-list-item-title>
            <v-list-item-subtitle>
              {{ numeralFormat(product_video.size, "0,0.[0] b") }}
            </v-list-item-subtitle>

            <template v-slot:append>
              <v-btn
                icon
                variant="text"
                color="red"
                @click="removeVideo(product_video)"
                :loading="busy_remove_video === product_video.id"
              >
                <v-icon>close</v-icon>
              </v-btn>
            </template>
          </v-list-item>
        </v-list>

        <v-expand-transition>
          <s-video-uploader
            v-if="product.videos.length < max_videos_count"
            :server="upload_video_url"
            auto-compact
            max-file-size="20MB"
            @new-item="onUploadVideoItem"
          ></s-video-uploader>
        </v-expand-transition>
      </template>
      <v-list-subheader v-else class="mt-3">
        <v-icon class="me-1">warning_amber</v-icon>
        Update your shop plan to upload videos for the product.
      </v-list-subheader>
    </div>

    <s-widget-buttons v-if="!forStudio && !externalActionButtons" auto-fixed-position class="my-5">
      <v-btn
        color="primary"
        size="x-large"
        variant="elevated"
        @click="$emit('next')"
        v-ctrl.s="
          () => {
            $emit('next');
          }
        "
      >
        {{ $t("global.actions.save_continue") }}

        <v-icon class="ms-2" size="small">
          {{ $t("icons.arrow_end") }}
        </v-icon>
      </v-btn>
    </s-widget-buttons>

    </template>
    <!-- ███████████████████████ Dialog > AI > Change Background ███████████████████████ -->

    <v-dialog
      v-model="dialog_replace_bg"
      :fullscreen="!modern"
      :max-width="modern ? 610 : undefined"
      scrollable
      transition="dialog-bottom-transition"
    >
      <v-card class="text-start" :class="{ 'b-product-edit-images__dialog sd-modern-widget': modern }">
        <v-card-title class="d-flex align-center">
          <b-product-edit-info-icon v-if="modern" name="Sparkles" />
          <v-icon v-else class="me-1" color="#111">wallpaper</v-icon>
          {{ $t("add_product.edit_images.change_bg_ai.title") }}
          <v-btn v-if="modern" class="sd-modern-icon-button ms-auto" icon variant="text" :aria-label="$t('global.actions.close')" @click="dialog_replace_bg = false"><b-product-edit-info-icon name="X" :size="16" /><v-tooltip activator="parent" location="top" content-class="sd-modern-tooltip text-start">{{ $t('global.actions.close') }}</v-tooltip></v-btn>
        </v-card-title>

        <v-card-text>
          <p v-if="modern" class="b-product-edit-images__help">{{ $t('add_product.images_modern.reimagine_help') }} {{ $t('add_product.images_modern.ai_quota') }}</p>
          <div class="text-center py-5">
            <v-avatar rounded="xl" :size="modern ? 160 : 256" class="bg-tiny-checkers">
              <v-img :src="getShopImagePath(product.icon)"></v-img>
            </v-avatar>
          </div>

          <v-slide-group
            v-model="prompt"
            class="pa-4"
            :selected-class="modern ? 'b-product-edit-images__preset--selected' : 'bg-success'"
            show-arrows
          >
            <v-slide-group-item
              v-for="it in items"
              :key="it.value"
              v-slot="{ isSelected, toggle, selectedClass }"
              :value="it.value"
            >
              <v-card
                :class="['ma-4', selectedClass]"
                :color="modern ? undefined : 'grey-lighten-1'"
                :height="modern ? 108 : 160"
                :width="modern ? 108 : 160"
                @click="toggle"
                :image="it.src"
              >
                <div class="d-flex fill-height align-center justify-center">
                  <v-scale-transition>
                    <v-icon v-if="isSelected" color="white" size="48">
                      check_circle
                    </v-icon>
                  </v-scale-transition>
                  <b>
                    {{ it.title }}
                  </b>
                </div>
              </v-card>
            </v-slide-group-item>
          </v-slide-group>

          <div class="max-widget-width mx-auto">
            <v-textarea
              v-model="prompt"
              :label="
                $t('add_product.edit_images.change_bg_ai.inputs.prompt.label')
              "
              :placeholder="
                $t(
                  'add_product.edit_images.change_bg_ai.inputs.prompt.placeholder',
                )
              "
              persistent-placeholder
              :variant="modern ? 'underlined' : 'outlined'"
              :class="{ 'sd-modern-underlined-field': modern }"
            >
            </v-textarea>
          </div>

          <u-button-ai-large
            v-if="!modern"
            :loading="busy"
            :sub-title="
              !prompt
                ? $t(
                    'add_product.edit_images.change_bg_ai.actions.reimagine.subtitle',
                  )
                : $t(
                    'add_product.edit_images.change_bg_ai.actions.replace.subtitle',
                  )
            "
            :title="
              $t('add_product.edit_images.change_bg_ai.actions.reimagine.title')
            "
            @select="replaceBackground()"
          >
          </u-button-ai-large>
        </v-card-text>

        <v-card-actions>
          <div :class="modern ? 'b-product-edit-images__dialog-actions' : 'widget-buttons'">
            <v-btn
              size="x-large"
              variant="text"
              :class="{ 'sd-modern-button': modern }"
              @click="dialog_replace_bg = false"
            >
              <v-icon start>close</v-icon>
              {{ $t("global.actions.close") }}
            </v-btn>
            <v-btn v-if="modern" class="sd-modern-button sd-modern-button--primary" color="primary" variant="elevated" :loading="busy" :disabled="mediaBusy || busySave" @click="replaceBackground"><template #prepend><b-product-edit-info-icon name="Sparkles" :size="16" /></template>{{ $t('add_product.edit_images.change_bg_ai.actions.reimagine.title') }}</v-btn>
          </div>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ███████████████████████ Dialog > Main Image URL ███████████████████████ -->

    <v-dialog v-model="dialog_main_image_url" :max-width="modern ? 610 : 560" scrollable>
      <v-card class="text-start" :class="{ 'b-product-edit-images__dialog sd-modern-widget': modern }">
        <v-card-title class="d-flex align-center">
          <b-product-edit-info-icon v-if="modern" name="Link" />
          <v-icon v-else class="me-1" color="#111">link</v-icon>
          {{ $t('add_product.images_modern.main_url_title') }}
          <v-btn v-if="modern" class="sd-modern-icon-button ms-auto" icon variant="text" :aria-label="$t('global.actions.close')" @click="dialog_main_image_url = false"><b-product-edit-info-icon name="X" :size="16" /><v-tooltip activator="parent" location="top" content-class="sd-modern-tooltip text-start">{{ $t('global.actions.close') }}</v-tooltip></v-btn>
        </v-card-title>

        <v-card-text>
          <p v-if="modern" class="b-product-edit-images__help">{{ $t('add_product.images_modern.url_help') }}</p>
          <v-text-field
            v-model="main_image_url_input"
            :disabled="busy_main_image_url"
            autofocus
            clearable
            :label="$t('add_product.images_modern.image_url')"
            placeholder="https://example.com/product.jpg"
            prepend-inner-icon="link"
            :variant="modern ? 'underlined' : 'outlined'"
            :class="{ 'sd-modern-underlined-field': modern }"
            @keyup.enter="setMainImageUrl()"
          />

          <v-img
            v-if="isValidHttpUrl(main_image_url_input)"
            :src="main_image_url_input"
            class="bg-tiny-checkers rounded-lg mt-3"
            max-height="260"
          />
        </v-card-text>

        <v-card-actions>
          <div :class="modern ? 'b-product-edit-images__dialog-actions' : 'widget-buttons'">
            <v-btn
              size="x-large"
              variant="text"
              :class="{ 'sd-modern-button': modern }"
              @click="dialog_main_image_url = false"
            >
              <v-icon v-if="!modern" start>close</v-icon>
              {{ $t(modern ? 'global.actions.cancel' : 'global.actions.close') }}
            </v-btn>

            <v-btn
              :loading="busy_main_image_url"
              color="primary"
              size="x-large"
              variant="elevated"
              :class="{ 'sd-modern-button sd-modern-button--primary': modern }"
              :disabled="modern && !isValidHttpUrl(main_image_url_input?.trim())"
              @click="setMainImageUrl()"
            >
              <b-product-edit-info-icon v-if="modern" name="Check" :size="16" class="me-2" />
              <v-icon v-else start>check</v-icon>
              {{ $t(modern ? 'add_product.images_modern.use_image' : 'global.actions.save') }}
            </v-btn>
          </div>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts">
import SShopProductCard from "../../../../storefront/product/card/SShopProductCard.vue";
import BProductImagesGallery from "../../images/gallery/BProductImagesGallery.vue";
import SImageUploader from "../../../../ui/uploader/SImageUploader.vue";
import USmartToggle from "../../../../ui/smart/toggle/USmartToggle.vue";
import UYoutubePreview from "../../../../ui/youtube/preview/UYoutubePreview.vue";
import UButtonAiLarge from "../../../../ui/button/ai/large/UButtonAiLarge.vue";
import { getYoutubeId } from "../../../../ui/youtube/helper/YoutubeHelper";
import SWidgetButtons from "../../../../ui/widget/buttons/SWidgetButtons.vue";
import { ImageHelper } from "@selldone/core-js/utils/image/ImageHelper.ts";
import { BEventBusMixin } from "../../../../utils/events/BEventBusMixin.ts";

import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";
import SVideoUploader from "@selldone/components-vue/ui/uploader/SVideoUploader.vue";
import UAvatarFolder from "@selldone/components-vue/ui/avatar/folder/UAvatarFolder.vue";
import { Eligible } from "@selldone/core-js/enums/shop/ShopLicense.ts";
import BProductEditInfoIcon from "../info/BProductEditInfoIcon.vue";

export default {
  name: "BProductEditImages",
  mixins: [BEventBusMixin],
  inject: ["$shop"],
  components: {
    BProductEditInfoIcon,
    UAvatarFolder,
    SVideoUploader,
    SWidgetButtons,
    UButtonAiLarge,
    UYoutubePreview,
    USmartToggle,
    SImageUploader,
    BProductImagesGallery,
    SShopProductCard,
  },
  props: {
    modern: { type: Boolean, default: false },
    busySave: { type: Boolean, default: false },
    externalActionButtons: {
      type: Boolean,
      default: false,
    },
    product: {
      required: true,
      type: Object,
    },
    forStudio: {
      default: false,
      type: Boolean,
    },
  },

  data: () => ({
    saved_display: null,
    gallery_activity: { busy: false, dialog: false },
    editing_main_image: false,
    main_uploader_key: 0,
    main_uploading: false,
    video_uploading: false,
    image_info_request: 0,
    selected_gallery: null,
    cover_pic: null,

    icon_pic: null,

    video_id: "",
    show_preview_card: false,
    force_preview: false,

    // -------------------
    busy_ai: false,

    need_upscale: false,
    busy_upscale: false,

    dialog_replace_bg: false,
    prompt: null,
    busy: false,
    dialog_main_image_url: false,
    main_image_url_input: null,
    busy_main_image_url: false,

    items: [
      {
        value: "",
        title: "Reimagine",
        src: require("./assets/reimage.webp"),
      },
      {
        value:
          "A softly lit, seamless white backdrop with gentle shadows and a subtle gradient effect, ideal for highlighting clean and modern product designs.",
        src: require("./assets/a-softly-lit-seamless-white-backdrop-with-gentle-shadows.webp"),
      },
      {
        value:
          "A soft pastel-colored studio background with a smooth, curved surface and diffused lighting, creating a calm and inviting atmosphere for delicate or luxury products.",
        src: require("./assets/a-soft-pastel-colored-studio-background-with-a-smooth.webp"),
      },
      {
        value:
          "A neutral-toned studio setup with a light beige backdrop and a subtle spotlight effect, perfect for bringing attention to the details of premium or handcrafted items.",
        src: require("./assets/a-neutral-toned-studio-setup-with-a-light-beige-backdrop .webp"),
      },
      {
        value:
          "A scene , product studio, with colorful persian mosaic tile designs, viewed from the side. The mosaic patterns create a vibrant backdrop,  leaving the center clear for product placement.",
        src: require("./assets/a-product-studio-scene-featuring-colorful-persian-mosaic.webp"),
      },

      {
        value:
          "A minimalist white marble countertop with soft natural sunlight streaming through a large window, casting gentle shadows, perfect for displaying luxury skincare products.",
        src: require("./assets/a-minimalist-white-marble-countertop-with-subtle-veining.webp"),
      },
      {
        value:
          "A rustic wooden table set in a cozy kitchen, with warm, ambient lighting and a vase of fresh flowers in the background, ideal for showcasing handmade kitchenware.",
        src: require("./assets/a-rustic-wooden-table-set-in-a-cozy-warmly-lit-kitchen.webp"),
      },
      {
        value:
          "A sleek, modern living room with a clean-lined sofa and a coffee table, bathed in soft afternoon light, perfect for highlighting contemporary home decor items.",
        src: require("./assets/a-sleek-modern-living-room-featuring-a-clean-lined-minimalist.webp"),
      },
      {
        value:
          "A serene outdoor garden scene with a small wooden deck, surrounded by lush greenery and soft dappled sunlight, ideal for presenting eco-friendly products.",
        src: require("./assets/a-serene-outdoor-garden-scene-featuring-a-small-wooden.webp"),
      },
      {
        value:
          "A stylish bathroom with a marble sink and gold accents, with soft, diffused lighting, perfect for displaying premium grooming or beauty products.",
        src: require("./assets/a-stylish-bathroom-featuring-a-sleek-marble-sink-with-a-polished.webp"),
      },
      {
        value:
          "A modern kitchen island with polished concrete surfaces and subtle under-cabinet lighting, ideal for showcasing high-end kitchen gadgets or appliances.",
        src: require("./assets/a-modern-kitchen-featuring-a-central-island-with-polished.webp"),
      },
      {
        value:
          "A cozy bedroom scene with a neatly made bed, soft linens, and a bedside table with a small lamp, perfect for presenting sleep-related products.",
        src: require("./assets/a-cozy-bedroom-scene-featuring-a-neatly-made-bed.webp"),
      },
      {
        value:
          "A clean, white desk setup with a sleek laptop, a few minimalist office accessories, and soft lighting from a nearby window, ideal for showcasing tech gadgets.",
        src: require("./assets/a-clean-white-desk-setup-featuring-a-sleek-modern-laptop.webp"),
      },
      {
        value:
          "A luxurious dining table set with elegant tableware and a centerpiece of fresh flowers, with ambient evening lighting, perfect for showcasing dining products.",
        src: require("./assets/a-luxurious-dining-table-elegantly-set-with-fine-tableware.webp"),
      },
      {
        value:
          "A calm beach scene with a wooden boardwalk leading to the ocean, with soft sunlight and gentle waves, ideal for presenting outdoor or summer products.",
        src: require("./assets/a-calm-beach-scene-featuring-a-wooden-boardwalk-that-stretches.webp"),
      },
      {
        value:
          "A high-rise city balcony at dusk, with twinkling city lights in the background and a small table set with a cup of coffee, perfect for showcasing urban lifestyle products.",
        src: require("./assets/a-high-rise-city-balcony-at-dusk-overlooking-a-sprawling.webp"),
      },
      {
        value:
          "A vintage-style study with a wooden desk, an antique globe, and warm, ambient lighting from a desk lamp, ideal for displaying classic stationery or books.",
        src: require("./assets/a-vintage-style-study-featuring-a-rich-wooden-desk-with-an-antique-finish.webp"),
      },
      {
        value:
          "A serene yoga studio with a clean wooden floor, soft natural light, and a few strategically placed plants, perfect for showcasing wellness or fitness products.",
        src: require("./assets/a-serene-yoga-studio-with-a-clean-polished-wooden.webp"),
      },
      {
        value:
          "A chic, minimalist coffee shop with modern seating and a barista counter in the background, with soft morning light, ideal for presenting gourmet coffee or accessories.",
        src: require("./assets/a-chic-minimalist-coffee-shop-featuring-sleek-modern.webp"),
      },
    ],

    //------------------------
    busy_remove_video: null,
  }),

  computed: {
    normalizedVideoId() {
      const value = this.video_id?.trim() || '';
      return value.includes('.') ? getYoutubeId(value) || '' : value;
    },
    hasUnsavedChanges() {
      return this.saved_display !== JSON.stringify([!!this.product.style?.contain, this.normalizedVideoId]);
    },
    imageToolsAvailable() {
      return !!this.product.icon && !this.isValidHttpUrl(this.product.icon) && !this.forStudio && !this.IS_VENDOR_PANEL;
    },
    imageToolsDigest() {
      return `${this.$t(this.need_upscale ? 'ai.upscale.title' : 'ai.remove_bg.title')} · ${this.$t('ai.reimagine.title')}`;
    },
    videosDigest() {
      return `${this.$t('add_product.images_modern.uploaded_count', { count: this.product.videos?.length || 0 })} · ${this.$t(this.normalizedVideoId ? 'add_product.images_modern.youtube_linked' : 'add_product.images_modern.youtube_empty')}`;
    },
    mediaBusy() {
      return this.gallery_activity.busy || this.busy || this.busy_ai || this.busy_upscale || this.busy_main_image_url || this.busy_remove_video !== null || this.main_uploading || this.video_uploading;
    },
    saveBlocked() {
      return this.gallery_activity.dialog || this.busySave || this.dialog_main_image_url || this.dialog_replace_bg;
    },
    IS_VENDOR_PANEL() {
      /*🟢 Vendor Panel 🟢*/
      return (
        this.$route.params.vendor_id &&
        this.$route.matched.some((record) => record.meta.vendor)
      );
    },

    preview_available() {
      return this.product.icon || this.force_preview;
    },

    upload_main_image_url() {
      return this.IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢*/
        ? window.VAPI.POST_MY_VENDOR_UPLOAD_PRODUCT_MAIN_IMAGE(
            this.$route.params.vendor_id,
            this.product.id,
          )
        : window.API.POST_UPLOAD_PRODUCT_MAIN_IMAGE(
            this.product.shop_id,
            this.product.id,
          );
    },

    upload_video_url() {
      if (this.IS_VENDOR_PANEL) {
        return window.VAPI.POST_MY_VENDOR_PRODUCT_VIDEO_UPLOAD(
          this.product.vendor_id,
          this.product.id,
        );
      }

      return window.API.POST_PRODUCT_VIDEO_UPLOAD(
        this.product.shop_id,
        this.product.id,
      );
    },

    max_videos_count() {
      return Eligible.MaxUploadVideosForProduct(this.$shop);
    },
  },
  watch: {
    product(product, previous) {
      this.fixStyle();
      if (product !== previous) {
        this.video_id = product.video;
        this.markSaved();
      }
    },
    "product.icon"() {
      this.checkNeedsUpscale();
    },
  },
  created() {
    this.fixStyle();

    this.checkNeedsUpscale();
    this.video_id = this.product.video;
    this.markSaved();
  },
  beforeUnmount() {
    this.image_info_request++;
  },

  methods: {
    markSaved() {
      this.saved_display = JSON.stringify([!!this.product.style?.contain, this.normalizedVideoId]);
    },
    prepareSave() {
      if (this.mediaBusy || this.saveBlocked) return false;
      this.correctVideoId();
      return true;
    },
    submit() {
      if (this.prepareSave()) this.$emit('next');
    },
    refreshPreview() {
      this.$refs.prev?.extRefreshStyle();
      this.$forceUpdate();
    },
    cancelMainReplacement() {
      if (this.main_uploading) return;
      this.editing_main_image = false;
      this.main_uploader_key++;
    },
    async checkNeedsUpscale() {
      const request = ++this.image_info_request;
      this.need_upscale = false;
      if (!this.product?.icon) return;

      const helper = new ImageHelper(this.getShopImagePath(this.product.icon));
      try {
        const { width, height } = await helper.getImageInfo();
        //console.log("need_upscale", width, height);
        if (request === this.image_info_request) this.need_upscale = width < 1000 || height < 1000;
      } catch (e) {
        if (request === this.image_info_request) this.need_upscale = false;
      }
    },

    fixStyle() {
      if (!this.product.style || Array.isArray(this.product.style))
        this.product.style = { contain: false };
    },
    removeBackground() {
      if (this.modern && (this.mediaBusy || this.busySave)) return;
      if (!this.USER().premium) return this.showNeedSubscribePremium();
      NotificationService.openDangerAlert(
        `Remove Main Image Background`,
        "Are you sure you want to remove the background of this image? We will replace the main image with new transparent background.",
        "Yes,Remove it",
        () => {
          this.removeBackgroundNow();
        },
      );
    },

    removeBackgroundNow() {
      if (this.modern && (this.mediaBusy || this.busySave)) return;
      this.busy_ai = true;
      axios
        .post(
          window.API.POST_AI_REMOVE_BACKGROUND_PRODUCT_MAIN_IMAGE(
            this.product.shop_id,
            this.product.id,
          ),
          {},
        )
        .then(({ data }) => {
          if (!data.error) {
            this.product.icon = data.product.icon;
            this.$forceUpdate();
            this.$emit("update:icon", data.product.icon);

            NotificationService.showSuccessAlert(
              null,
              "Background removed successfully!",
            );
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_ai = false;
        });
    },

    upscaleImage() {
      if (this.modern && (this.mediaBusy || this.busySave)) return;
      this.busy_upscale = true;
      axios
        .post(
          window.API.POST_AI_UPSCALE_BACKGROUND_PRODUCT_MAIN_IMAGE(
            this.product.shop_id,
            this.product.id,
          ),
          {},
        )
        .then(({ data }) => {
          if (!data.error) {
            this.product.icon = data.product.icon;
            this.$forceUpdate();
            this.$emit("update:icon", data.product.icon);

            NotificationService.showSuccessAlert(
              null,
              "Image upscaled successfully!",
            );
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_upscale = false;
        });
    },

    showReplaceBg() {
      if (this.modern && (this.mediaBusy || this.busySave)) return;
      this.dialog_replace_bg = true;
      if (!this.prompt)
        this.prompt =
          this.items[Math.floor(Math.random() * this.items.length)].value;
    },
    replaceBackground() {
      if (this.modern && (this.mediaBusy || this.busySave)) return;
      if (!this.USER().premium) return this.showNeedSubscribePremium();

      this.busy = true;
      axios
        .post(
          window.API.POST_AI_CREATE_NEW_PRODUCT_IMAGE(
            this.product.shop_id,
            this.product.id,
          ),
          {
            prompt: this.prompt,
          },
        )
        .then(({ data }) => {
          if (!data.error) {
            if (data.variant) Object.assign(this.variant, data.variant);

            this.AddOrUpdateItemByID(this.product.images, data.image);
            this.$refs.images.forceInitializeImages();

            this.dialog_replace_bg = false;

            NotificationService.showSuccessAlert(
              null,
              "Image created successfully!",
            );
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy = false;
        });
    },

    correctVideoId() {
      if (this.modern) this.video_id = this.normalizedVideoId;
      if (this.video_id) {
        if (this.video_id.includes(".")) {
          this.video_id = getYoutubeId(this.video_id);
        } else {
        }
      }

      this.product.video = this.video_id;
      this.$emit("update:video", this.video_id);
    },

    //-------------------------------- Upload Video --------------------------------
    handleProcessFile(path) {
      this.main_uploading = false;
      this.editing_main_image = false;
      //  console.log("handleProcessFile",path);
      this.force_preview = true;
      this.product.icon = path;
      this.$forceUpdate();
      this.$emit("update:icon", path);
    },

    showMainImageUrlDialog() {
      this.main_image_url_input = this.product.icon?.startsWith("http")
        ? this.product.icon
        : null;
      this.dialog_main_image_url = true;
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

    setMainImageUrl() {
      if (this.modern && (this.mediaBusy || this.busySave)) return;
      const url = this.main_image_url_input?.trim();
      if (!this.isValidHttpUrl(url)) {
        return NotificationService.showErrorAlert(
          null,
          "Enter a valid image URL.",
        );
      }

      this.busy_main_image_url = true;
      axios
        .post(this.upload_main_image_url, { url })
        .then(({ data }) => {
          if (!data.error) {
            const path = data.files?.path ?? url;
            this.handleProcessFile(path);
            this.dialog_main_image_url = false;

            NotificationService.showSuccessAlert(
              null,
              "Main image URL saved successfully.",
            );
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_main_image_url = false;
        });
    },

    getVideoUrl(file_name: string) {
      return window.CDN.GET_VIDEO_URL(file_name);
    },

    onUploadVideoItem(product_video) {
      this.video_uploading = false;
      this.product.videos.push(product_video);
    },
    removeVideo(product_video) {
      if (this.modern && (this.mediaBusy || this.busySave)) return;
      this.busy_remove_video = product_video.id;
      axios
        .delete(
          this.IS_VENDOR_PANEL
            ? window.VAPI.DELETE_MY_VENDOR_PRODUCT_VIDEO(
                this.product.vendor_id,
                this.product.id,
                product_video.id,
              )
            : window.API.DELETE_PRODUCT_VIDEO(
                this.product.shop_id,
                this.product.id,
                product_video.id,
              ),
        )
        .then(({ data }) => {
          if (!data.error) {
            this.DeleteItemByID(this.product.videos, data.id);
            NotificationService.showSuccessAlert(
              null,
              "Video removed successfully!",
            );
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_remove_video = null;
        });
    },
  },
};
</script>

<style lang="scss" scoped>
.b-product-edit-images--modern {
  width: 100%;
  max-width: 760px;
  margin-inline: auto;
  color: rgb(var(--v-theme-on-surface));
  font-family: inherit;
  font-size: 14px;
  line-height: 21px;
  .b-product-edit-images__card,
  .b-product-edit-images__disclosure { margin-block-end: 14px; border: 1px solid var(--sd-modern-border); border-radius: 16px; background: rgb(var(--v-theme-surface)); box-shadow: none; }
  .b-product-edit-images__card { padding: 23px; }
  .b-product-edit-images__heading { display: flex; align-items: flex-start; gap: 10px; margin-block-end: 24px; }
  .b-product-edit-images__heading > svg { color: var(--sd-modern-muted); margin-block-start: 3px; flex-shrink: 0; }
  .b-product-edit-images__heading > div { flex: 1; min-width: 0; }
  h2 { font-family: inherit; font-size: 16px; font-weight: 500; line-height: 24px; letter-spacing: -.15px; margin: 0; }
  h3 { font-family: inherit; font-size: 13px; font-weight: 500; line-height: 20px; margin: 0; }
  .b-product-edit-images__heading p { font-size: 12px; line-height: 19px; color: var(--sd-modern-muted); margin: 5px 0 0; }
  .b-product-edit-images__count { font-size: 11px; line-height: 19px; color: var(--sd-modern-muted); white-space: nowrap; padding-block-start: 3px; }
  .b-product-edit-images__main-grid { display: grid; grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr); gap: 26px; align-items: start; }
  .b-product-edit-images__settings { min-width: 0; }
  .b-product-edit-images__micro { margin: 12px 0 0; color: var(--sd-modern-muted); font-size: 11px; line-height: 18px; }
  .b-product-edit-images__url { margin-block-start: 10px; font-size: 12px; line-height: 19px; padding-inline: 0; }
  .b-product-edit-images__fit { display: flex; align-items: flex-start; gap: 10px; margin-block-start: 25px; }
  .b-product-edit-images__fit > .s--smart-toggle { flex: 1; min-width: 0; }
  .b-product-edit-images__fit :deep(.s--smart-toggle > .pa-2) { padding: 0 !important; }
  .b-product-edit-images__fit :deep(.s--smart-toggle b) { font-size: 13px; font-weight: 500; line-height: 20px; }
  .b-product-edit-images__fit :deep(.s--smart-toggle .small) { font-size: 12px; line-height: 19px; opacity: 1; color: var(--sd-modern-muted); }
  .b-product-edit-images__preview { min-width: 0; }
  .b-product-edit-images__preview-label { display: flex; align-items: center; gap: 6px; font-size: 11px; color: var(--sd-modern-muted); margin: 0 0 9px; }
  .b-product-edit-images__preview > :deep(.s--product-card) { max-width: 258px; margin-inline: auto; }
  .b-product-edit-images__settings :deep(.v-list-item) { min-width: 0; grid-template-columns: auto minmax(0, 1fr) auto; column-gap: 11px; }
  .b-product-edit-images__settings :deep(.v-list-item__prepend > .v-avatar) { margin-inline-end: 0; }
  .b-product-edit-images__settings :deep(.v-list-item__spacer) { width: 0; }
  .b-product-edit-images__settings :deep(.v-list-item-title) { font-size: 12px; line-height: 19px; }
  .b-product-edit-images__settings :deep(.v-list-item-title b) { font-weight: 500; }
  .b-product-edit-images__settings :deep(.v-list-item-subtitle) { font-size: 11px !important; line-height: 17px; white-space: nowrap; text-overflow: ellipsis; overflow: hidden; direction: ltr; }
  .b-product-edit-images__settings :deep(.uploader-container) { border: 1px dashed var(--sd-modern-border) !important; }
  .b-product-edit-images__settings :deep(.file-size-limit) { font-size: 11px; line-height: 18px; }
  .b-product-edit-images__disclosure { padding: 0; }
  .b-product-edit-images__disclosure > summary { box-sizing: border-box; display: flex; align-items: center; gap: 13px; min-height: 84px; padding: 18px 23px; border-radius: 16px; list-style: none; }
  .b-product-edit-images__disclosure > summary::-webkit-details-marker { display: none; }
  .b-product-edit-images__disclosure > summary > svg { color: var(--sd-modern-muted); flex-shrink: 0; }
  .b-product-edit-images__summary-copy { flex: 1; min-width: 0; }
  .b-product-edit-images__summary-title { display: block; font-size: 14px; font-weight: 500; line-height: 21px; }
  .b-product-edit-images__digest { display: block; margin-block-start: 3px; color: var(--sd-modern-muted); font-size: 12px; line-height: 18px; }
  .b-product-edit-images__disclosure[open] > summary { min-height: 69px; }
  .b-product-edit-images__disclosure[open] .b-product-edit-images__summary-title { font-size: 16px; line-height: 24px; }
  .b-product-edit-images__disclosure[open] .b-product-edit-images__digest { display: none; }
  .b-product-edit-images__disclosure[open] .b-product-edit-images__chevron { transform: rotate(180deg); }
  .b-product-edit-images__disclosure-body { padding: 0 23px 21px; }
  .b-product-edit-images__tool { display: flex; align-items: center; gap: 13px; padding-block: 13px; }
  .b-product-edit-images__tool > svg { flex-shrink: 0; color: var(--sd-modern-muted); }
  .b-product-edit-images__tool > div { flex: 1; min-width: 0; }
  .b-product-edit-images__tool p, .b-product-edit-images__help { font-size: 12px; line-height: 19px; color: var(--sd-modern-muted); margin: 5px 0 0; }
  .b-product-edit-images__tool > .v-btn { min-height: 38px; height: auto; font-size: 12px; line-height: 18px; padding: 9px 13px; }
  .b-product-edit-images__gallery-note { margin-block-start: 18px; }
  .b-product-edit-images__youtube-field { margin-block: 17px 12px; }
  .b-product-edit-images__youtube-field :deep(input.v-field__input) { box-sizing: border-box; }
  .b-product-edit-images__upload-title { margin-block-start: 28px; }
  .b-product-edit-images__videos { margin-block: 15px; }
  .b-product-edit-images__video-row { display: flex; align-items: center; gap: 12px; min-width: 0; padding-block: 13px; border-block-end: 1px solid var(--sd-modern-border); }
  .b-product-edit-images__video-preview { flex-shrink: 0; }
  .b-product-edit-images__video-copy { min-width: 0; flex: 1; }
  .b-product-edit-images__video-copy > a { display: inline-flex; gap: 5px; align-items: center; font-size: 13px; line-height: 20px; color: inherit; text-decoration: none; }
  .b-product-edit-images__video-copy > small { font-size: 11px; line-height: 17px; color: var(--sd-modern-muted); }
  .b-product-edit-images__video-upload { margin-block-start: 18px; }
  .b-product-edit-images__video-upload :deep(.uploader-container) { padding: 0; max-width: none; background: var(--sd-modern-inset); border: 1px dashed var(--sd-modern-border); }
  .b-product-edit-images__video-upload :deep(.file-size-limit) { font-size: 11px; line-height: 18px; }
  .b-product-edit-images__video-path { font-size: 11px; line-height: 17px; color: var(--sd-modern-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin: 3px 0 0; direction: ltr; }
  .b-product-edit-images__help a { display: inline-flex; align-items: center; gap: 4px; color: rgb(var(--v-theme-primary)); }
  .b-product-edit-images__footer { display: flex; justify-content: space-between; align-items: center; gap: 18px; padding: 10px 2px 0; }
  .b-product-edit-images__footer p { display: flex; align-items: center; gap: 7px; margin: 0; font-size: 12px; line-height: 19px; }
  .b-product-edit-images__footer small { display: block; margin-block-start: 5px; color: var(--sd-modern-muted); font-size: 11px; line-height: 18px; }
  .b-product-edit-images__footer > .v-btn { font-size: 13px; line-height: 20px; }
  &:dir(rtl) .b-product-edit-images__direction { transform: scaleX(-1); }
  .sd-modern-icon-button { --sd-modern-icon-button-size: 32px; }
  .sd-modern-info-button { --sd-modern-icon-button-size: 28px; }
  @media (max-width: 640px), (pointer: coarse) {
    .sd-modern-icon-button { --sd-modern-icon-button-size: 44px; }
    .b-product-edit-images__card { padding: 19px; }
    .b-product-edit-images__disclosure > summary { padding-inline: 19px; }
    .b-product-edit-images__disclosure-body { padding-inline: 19px; }
    .b-product-edit-images__tool { flex-wrap: wrap; }
    .b-product-edit-images__tool > div { flex-basis: calc(100% - 36px); }
    .b-product-edit-images__tool > .v-btn { margin-inline-start: 31px; min-height: 44px; }
    .b-product-edit-images__youtube-field :deep(input) { font-size: 16px; }
    .b-product-edit-images__footer { align-items: stretch; flex-direction: column; }
    .b-product-edit-images__footer > .v-btn { width: 100%; }
  }
  @media (max-width: 520px) { .b-product-edit-images__main-grid { grid-template-columns: minmax(0, 1fr); } .b-product-edit-images__preview { max-width: 258px; width: 100%; margin-inline: auto; } }
  @media (max-width: 360px) { .b-product-edit-images__card { padding: 15px; } .b-product-edit-images__heading { gap: 7px; } .b-product-edit-images__disclosure > summary, .b-product-edit-images__disclosure-body { padding-inline: 15px; } }
}

.b-product-edit-images__dialog {
  padding: 0;
  border-radius: 18px !important;
  color: rgb(var(--v-theme-on-surface));
  .v-card-title { display: flex; align-items: center; gap: 10px; padding: 20px 23px; font-family: inherit; font-size: 18px; font-weight: 500; line-height: 26px; white-space: normal; }
  .v-card-text { padding: 0 23px 20px !important; }
  .v-card-actions { padding: 0 23px 23px; }
  .b-product-edit-images__help { font-size: 13px; line-height: 20px; color: var(--sd-modern-muted); margin: 0 0 18px; }
  .b-product-edit-images__dialog-actions { display: flex; justify-content: flex-end; flex-wrap: wrap; gap: 9px; width: 100%; }
  .b-product-edit-images__preset--selected { outline: 2px solid rgb(var(--v-theme-primary)); }
  .sd-modern-button { font-size: 13px; line-height: 20px; }
  :deep(.v-text-field input), :deep(.v-textarea textarea) { font-family: inherit; font-size: 14px; line-height: 21px; }
  :deep(input.v-field__input) { box-sizing: border-box; }
  .sd-modern-icon-button { --sd-modern-icon-button-size: 32px; }
  @media (max-width: 640px), (pointer: coarse) { .sd-modern-icon-button { --sd-modern-icon-button-size: 44px; } :deep(.v-text-field input), :deep(.v-textarea textarea) { font-size: 16px; } .v-card-title { padding-inline: 16px; } .v-card-text { padding-inline: 16px !important; } .v-card-actions { padding-inline: 16px; } }
}

.sample-view {
  position: relative;
  padding: 10% 10% 6% 10%;

  margin-left: auto;
  margin-right: auto;

  border-radius: 18px;

  //border: #fff solid 8px !important;
  // box-shadow: 0 2px 43px -4px rgba(0, 0, 0, 0.19);

  @media only screen and (max-width: 520px) {
    padding: 8px;
  }
}

</style>
