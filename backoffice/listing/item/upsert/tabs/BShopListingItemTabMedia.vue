<!--
  - Copyright (c) 2026. Selldone® Business OS™
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
  <div :class="modern ? 'b-listing-item-media text-start' : undefined">
    <div
      :class="
        modern ? 'b-listing-item-media__upload' : 'widget-box -large mb-5'
      "
    >
      <header
        v-if="modern"
        class="sd-modern-header b-listing-item-media__header"
      >
        <div class="sd-modern-title">
          <v-icon
            class="sd-modern-icon sd-modern-icon--plain"
            size="22"
            aria-hidden="true"
            >photo_library</v-icon
          >
          <div>
            <h2 class="sd-modern-title-text">
              {{ $t("global.commons.media") }}
            </h2>
            <p class="sd-modern-subtitle">
              {{ $t("shop_listing.item_editor.media_subtitle") }}
            </p>
          </div>
        </div>
        <v-btn
          variant="text"
          class="sd-modern-button sd-modern-button--inline"
          prepend-icon="refresh"
          :loading="busy_fetch"
          @click.stop="fetchMedia"
          >{{ $t("global.actions.refresh") }}</v-btn
        >
      </header>
      <u-widget-header
        v-else
        :title="$t('global.commons.media')"
        icon="photo_library"
      >
        <template v-slot:actions>
          <v-btn
            size="small"
            variant="text"
            :loading="busy_fetch"
            @click.stop="fetchMedia"
          >
            <v-icon start>refresh</v-icon>
            {{ $t("global.actions.refresh") }}
          </v-btn>
        </template>
      </u-widget-header>

      <v-list-subheader v-if="!modern">
        Upload images or add URL media. Set MAIN, edit alt/url/sort, and delete.
      </v-list-subheader>

      <u-loading-progress v-if="busy_fetch" />

      <v-expansion-panels
        v-model="panels"
        multiple
        :class="
          modern ? 'b-listing-item-media__panels' : 'mt-2 max-w-640 mx-auto'
        "
        :variant="modern ? 'default' : 'inset'"
      >
        <v-expansion-panel
          value="upload"
          :class="
            modern
              ? 'b-listing-item-media__resource sd-modern-widget'
              : undefined
          "
        >
          <v-expansion-panel-title class="text-start">
            <v-icon class="me-2">photo_camera</v-icon>
            <div class="d-flex flex-column">
              <div class="font-weight-bold">
                {{
                  modern
                    ? $t("shop_listing.item_editor.upload_images")
                    : "Upload images"
                }}
              </div>
              <small class="text-muted">{{
                modern
                  ? $t("shop_listing.item_editor.upload_images_subtitle")
                  : "Add one or multiple images for this item."
              }}</small>
            </div>

            <template v-slot:actions>
              <v-chip
                v-if="upload_files.length"
                size="x-small"
                label
                class="ms-2"
                :variant="modern ? 'text' : undefined"
              >
                {{
                  modern
                    ? $t("shop_listing.item_editor.selected_count", {
                        count: $n(upload_files.length),
                      })
                    : upload_files.length + " selected"
                }}
              </v-chip>
              <v-icon>expand_more</v-icon>
            </template>
          </v-expansion-panel-title>

          <v-expansion-panel-text>
            <v-file-input
              v-model="upload_files"
              multiple
              show-size
              counter
              :label="
                modern
                  ? $t('shop_listing.item_editor.select_images')
                  : 'Select images'
              "
              prepend-inner-icon="photo_camera"
              prepend-icon=""
              :class="modern ? 'sd-modern-underlined-field' : undefined"
              variant="underlined"
              accept="image/*"
              clearable
            />

            <div v-if="upload_files.length" class="d-flex flex-wrap mt-2">
              <v-chip
                v-for="(f, i) in upload_files"
                :key="i"
                size="x-small"
                class="ma-1"
                label
                :variant="modern ? 'text' : 'tonal'"
              >
                <span
                  :class="modern ? 'b-listing-item-media__filename' : undefined"
                  :tabindex="modern ? 0 : undefined"
                  >{{ f?.name || "file" }}
                  <v-tooltip
                    v-if="modern"
                    activator="parent"
                    location="top"
                    content-class="sd-modern-tooltip text-start"
                    >{{ f?.name || "file" }}</v-tooltip
                  >
                </span>
              </v-chip>
            </div>

            <div class="text-muted mt-2">
              {{
                modern
                  ? $t("shop_listing.item_editor.first_main_hint")
                  : "Tip: If no main image exists, the first uploaded image becomes MAIN automatically."
              }}
            </div>

            <s-widget-buttons
              :auto-fixed-position="modern ? false : undefined"
              :class="modern ? 'sd-modern-form-actions' : undefined"
            >
              <v-btn
                :loading="busy_upload"
                color="primary"
                variant="elevated"
                :class="
                  modern
                    ? 'sd-modern-button sd-modern-button--primary'
                    : undefined
                "
                @click.stop="uploadImages"
                :size="modern ? undefined : 'x-large'"
              >
                <v-icon start>cloud_upload</v-icon>
                {{ $t("global.actions.upload") }}
              </v-btn>
            </s-widget-buttons>
          </v-expansion-panel-text>
        </v-expansion-panel>

        <v-expansion-panel
          value="url"
          :class="
            modern
              ? 'b-listing-item-media__resource sd-modern-widget'
              : undefined
          "
        >
          <v-expansion-panel-title class="text-start">
            <v-icon class="me-2">add_link</v-icon>
            <div class="d-flex flex-column">
              <div class="font-weight-bold">
                {{
                  modern
                    ? $t("shop_listing.item_editor.add_url_media")
                    : "Add link / video / file"
                }}
              </div>
              <small class="text-muted">{{
                modern
                  ? $t("shop_listing.item_editor.url_media_subtitle")
                  : "Attach external media by URL."
              }}</small>
            </div>
            <template v-slot:actions>
              <v-icon>expand_more</v-icon>
            </template>
          </v-expansion-panel-title>

          <v-expansion-panel-text>
            <v-select
              v-model="url_form.type"
              :items="urlTypeOptions"
              item-title="title"
              item-value="value"
              :label="
                modern ? $t('shop_listing.item_editor.media_type') : 'Type'
              "
              :class="modern ? 'sd-modern-underlined-field' : undefined"
              variant="underlined"
              clearable
            />

            <v-text-field
              v-model="url_form.url"
              label="URL"
              :class="modern ? 'sd-modern-underlined-field' : undefined"
              variant="underlined"
              placeholder="https://..."
            />

            <u-smart-toggle
              v-model="url_form.is_main"
              :true-title="
                modern ? $t('shop_listing.item_editor.set_main') : 'Set as MAIN'
              "
              false-gray
            />

            <v-text-field
              v-model="url_form.alt"
              :label="$t('global.commons.alt')"
              :class="modern ? 'sd-modern-underlined-field' : undefined"
              variant="underlined"
              :placeholder="
                modern
                  ? $t('shop_listing.item_editor.alt_hint')
                  : 'Short description (optional)'
              "
            />

            <div class="text-muted mt-2">
              <template v-if="modern">{{
                $t("shop_listing.item_editor.video_url_hint")
              }}</template
              ><template v-else
                >Tip: Use <b>video</b> for YouTube/Vimeo URLs. MAIN is tracked
                per type.</template
              >
            </div>

            <s-widget-buttons
              :auto-fixed-position="modern ? false : undefined"
              :class="modern ? 'sd-modern-form-actions' : undefined"
            >
              <v-btn
                :loading="busy_add_url"
                color="primary"
                variant="elevated"
                :class="
                  modern
                    ? 'sd-modern-button sd-modern-button--primary'
                    : undefined
                "
                @click="addUrlMedia"
                :size="modern ? undefined : 'x-large'"
              >
                <v-icon start>add</v-icon>
                {{ $t("global.actions.add") }}
              </v-btn>
            </s-widget-buttons>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </div>

    <div
      :class="
        modern
          ? 'b-listing-item-media__library sd-modern-widget'
          : 'widget-box -large min-h-6rem'
      "
    >
      <div class="d-flex align-center">
        <v-icon class="me-2">collections</v-icon>
        <div class="font-weight-bold">
          {{
            modern
              ? $t("shop_listing.item_editor.media_library")
              : "Media library"
          }}
          <small class="text-muted ms-2"
            >({{
              modern
                ? $t("shop_listing.item_editor.total_count", {
                    count: $n(mediaCounts.all),
                  })
                : mediaCounts.all + " total"
            }})</small
          >
        </div>

        <v-spacer />

        <v-chip
          size="x-small"
          class="me-1"
          label
          :variant="modern ? 'text' : 'tonal'"
          >{{ modern ? $t("shop_listing.item_editor.images") : "Images" }}:
          <b class="ms-1">{{ mediaCounts.image }}</b></v-chip
        >
        <v-chip
          size="x-small"
          class="me-1"
          label
          :variant="modern ? 'text' : 'tonal'"
          >{{ modern ? $t("shop_listing.item_editor.links") : "Links" }}:
          <b class="ms-1">{{ mediaCounts.link }}</b></v-chip
        >
        <v-chip
          size="x-small"
          class="me-1"
          label
          :variant="modern ? 'text' : 'tonal'"
          >{{ modern ? $t("shop_listing.item_editor.videos") : "Videos" }}:
          <b class="ms-1">{{ mediaCounts.video }}</b></v-chip
        >
        <v-chip size="x-small" label :variant="modern ? 'text' : 'tonal'"
          >{{ modern ? $t("shop_listing.item_editor.files") : "Files" }}:
          <b class="ms-1">{{ mediaCounts.file }}</b></v-chip
        >
      </div>

      <div class="mt-2">
        <v-chip-group
          v-model="media_filter"
          :class="modern ? 'b-listing-item-media__filters' : undefined"
          mandatory
        >
          <v-chip
            value="all"
            size="small"
            label
            class="ma-1"
            :variant="modern ? 'text' : undefined"
            >{{ modern ? $t("global.commons.all") : "All" }}</v-chip
          >
          <v-chip
            value="image"
            size="small"
            label
            class="ma-1"
            :variant="modern ? 'text' : undefined"
            >{{
              modern ? $t("shop_listing.item_editor.images") : "Images"
            }}</v-chip
          >
          <v-chip
            value="link"
            size="small"
            label
            class="ma-1"
            :variant="modern ? 'text' : undefined"
            >{{
              modern ? $t("shop_listing.item_editor.links") : "Links"
            }}</v-chip
          >
          <v-chip
            value="video"
            size="small"
            label
            class="ma-1"
            :variant="modern ? 'text' : undefined"
            >{{
              modern ? $t("shop_listing.item_editor.videos") : "Videos"
            }}</v-chip
          >
          <v-chip
            value="file"
            size="small"
            label
            class="ma-1"
            :variant="modern ? 'text' : undefined"
            >{{
              modern ? $t("shop_listing.item_editor.files") : "Files"
            }}</v-chip
          >
        </v-chip-group>
      </div>

      <v-divider v-if="!modern" class="my-3" />

      <v-row v-if="filteredMedia.length" class="mt-1">
        <v-col
          v-for="m in filteredMedia"
          :key="m.id"
          cols="12"
          md="6"
          :lg="modern ? 6 : 4"
        >
          <v-card
            class="media-card"
            :rounded="modern ? 'lg' : 'xl'"
            variant="flat"
          >
            <template v-if="m.type === 'image'">
              <v-img
                :src="resolveMediaImage(m)"
                :height="modern ? 180 : 220"
                cover
                class="media-thumb"
              >
                <div class="media-topbar">
                  <div class="d-flex align-center">
                    <span
                      v-if="modern && m.is_main"
                      class="sd-modern-status sd-modern-status--plain me-1"
                      ><span
                        class="sd-modern-status__dot sd-modern-status__dot--success"
                        aria-hidden="true"
                      />{{ $t("shop_listing.item_editor.main") }}</span
                    >
                    <v-chip
                      v-if="!modern && m.is_main"
                      size="x-small"
                      color="green"
                      label
                      class="me-1"
                      :variant="modern ? 'text' : undefined"
                      >{{
                        modern ? $t("shop_listing.item_editor.main") : "MAIN"
                      }}</v-chip
                    >
                    <v-chip
                      size="x-small"
                      label
                      :variant="modern ? 'text' : 'tonal'"
                      >{{
                        modern ? $t("shop_listing.item_editor.images") : "image"
                      }}</v-chip
                    >
                  </div>

                  <u-smart-menu
                    :modern="modern"
                    :title="
                      modern
                        ? $t('shop_listing.modern.record_actions')
                        : undefined
                    "
                    :loading="busy_media_action === m.id"
                    :items="mediaMenuItems(m)"
                  />
                </div>
              </v-img>

              <div class="pa-3">
                <div class="d-flex align-center">
                  <div
                    class="text-truncate"
                    :class="{ 'b-listing-item-media__identity': modern }"
                  >
                    <b v-if="m.alt">{{ m.alt }}</b>
                    <span v-else class="text-muted">{{
                      modern ? $t("shop_listing.item_editor.no_alt") : "No alt"
                    }}</span>
                  </div>
                  <v-spacer />
                  <v-chip
                    size="x-small"
                    label
                    :variant="modern ? 'text' : 'tonal'"
                    >{{
                      modern
                        ? $t("shop_listing.item_editor.sort_order")
                        : "Sort"
                    }}: <b class="ms-1">{{ m.sort_order }}</b></v-chip
                  >
                </div>

                <div class="text-muted small mt-2">
                  {{
                    modern
                      ? $t("shop_listing.item_editor.provider")
                      : "Provider"
                  }}: <b>{{ m.provider || "local" }}</b>
                </div>
              </div>
            </template>

            <template v-else>
              <div class="pa-3">
                <div class="d-flex align-center">
                  <div
                    class="d-flex align-center"
                    :class="{ 'b-listing-item-media__identity': modern }"
                  >
                    <span
                      v-if="modern && m.is_main"
                      class="sd-modern-status sd-modern-status--plain me-1"
                      ><span
                        class="sd-modern-status__dot sd-modern-status__dot--success"
                        aria-hidden="true"
                      />{{ $t("shop_listing.item_editor.main") }}</span
                    >
                    <v-chip
                      v-if="!modern && m.is_main"
                      size="x-small"
                      color="green"
                      label
                      class="me-1"
                      :variant="modern ? 'text' : undefined"
                      >{{
                        modern ? $t("shop_listing.item_editor.main") : "MAIN"
                      }}</v-chip
                    >
                    <v-chip
                      size="x-small"
                      label
                      :variant="modern ? 'text' : 'tonal'"
                      class="me-2"
                      >{{ m.type }}</v-chip
                    >
                    <v-icon class="me-2">{{ mediaTypeIcon(m.type) }}</v-icon>
                    <div class="font-weight-bold text-truncate">
                      {{
                        m.alt ||
                        (modern
                          ? $t("shop_listing.item_editor.untitled")
                          : "Untitled")
                      }}
                    </div>
                  </div>

                  <v-spacer />

                  <u-smart-menu
                    :modern="modern"
                    :title="
                      modern
                        ? $t('shop_listing.modern.record_actions')
                        : undefined
                    "
                    :loading="busy_media_action === m.id"
                    :items="mediaMenuItems(m)"
                  />
                </div>

                <div class="mt-3 d-flex align-center">
                  <v-icon class="me-2 text-muted">link</v-icon>
                  <div class="text-truncate text-muted" style="max-width: 100%">
                    {{ m.url || "-" }}
                  </div>
                </div>

                <div class="d-flex align-center mt-3">
                  <v-chip
                    size="x-small"
                    label
                    :variant="modern ? 'text' : 'tonal'"
                    >{{
                      modern
                        ? $t("shop_listing.item_editor.sort_order")
                        : "Sort"
                    }}: <b class="ms-1">{{ m.sort_order }}</b></v-chip
                  >
                  <v-spacer />
                  <v-btn
                    v-if="m.url"
                    size="small"
                    variant="text"
                    :class="
                      modern
                        ? 'sd-modern-button sd-modern-button--inline'
                        : undefined
                    "
                    @click.stop="openUrl(m.url)"
                  >
                    <v-icon v-if="!modern" start>open_in_new</v-icon>
                    {{ modern ? $t("global.actions.open") : "Open" }}
                    <v-icon v-if="modern" end aria-hidden="true"
                      >north_east</v-icon
                    >
                  </v-btn>
                </div>
              </div>
            </template>
          </v-card>
        </v-col>
      </v-row>

      <div
        v-else-if="!modern || !busy_fetch"
        :class="
          modern ? 'sd-modern-empty-state' : 'text-center text-muted py-5'
        "
      >
        <v-icon class="me-1">perm_media</v-icon>
        {{
          modern ? $t("shop_listing.item_editor.media_empty") : "No media yet."
        }}
        <div class="mt-2">
          {{
            modern
              ? $t("shop_listing.item_editor.media_empty_subtitle")
              : "Use the panels above to upload images or add URL media."
          }}
        </div>
      </div>

      <v-dialog v-model="edit_dialog" max-width="720">
        <v-card
          rounded="xl"
          class="text-start"
          :class="
            modern ? 'b-listing-item-media__editor sd-modern-widget' : undefined
          "
        >
          <v-card-title class="d-flex align-center">
            <v-icon class="me-2">edit</v-icon>
            <div>
              {{
                modern
                  ? $t("shop_listing.item_editor.edit_media")
                  : "Edit media"
              }}
            </div>
            <v-spacer />
            <v-btn
              icon
              variant="text"
              :class="modern ? 'sd-modern-icon-button' : undefined"
              :aria-label="modern ? $t('global.actions.close') : undefined"
              @click="edit_dialog = false"
              ><v-icon>close</v-icon
              ><v-tooltip
                v-if="modern"
                activator="parent"
                location="top"
                content-class="sd-modern-tooltip text-start"
                >{{ $t("global.actions.close") }}</v-tooltip
              ></v-btn
            >
          </v-card-title>

          <v-card-text>
            <v-text-field
              v-model="edit_form.alt"
              :label="modern ? $t('global.commons.alt') : 'Alt'"
              :class="modern ? 'sd-modern-underlined-field' : undefined"
              :variant="modern ? 'underlined' : 'outlined'"
            />
            <v-text-field
              v-model="edit_form.sort_order"
              type="number"
              :label="
                modern
                  ? $t('shop_listing.item_editor.sort_order')
                  : 'Sort order'
              "
              :class="modern ? 'sd-modern-underlined-field' : undefined"
              :variant="modern ? 'underlined' : 'outlined'"
            />

            <v-text-field
              v-if="edit_form.type !== 'image'"
              v-model="edit_form.url"
              label="URL"
              :class="modern ? 'sd-modern-underlined-field' : undefined"
              :variant="modern ? 'underlined' : 'outlined'"
            />

            <v-file-input
              v-if="edit_form.type === 'image'"
              v-model="replace_file"
              :label="
                modern
                  ? $t('shop_listing.item_editor.replace_image')
                  : 'Replace image file (optional)'
              "
              accept="image/*"
              :class="modern ? 'sd-modern-underlined-field' : undefined"
              :variant="modern ? 'underlined' : 'outlined'"
              prepend-icon="photo_camera"
              show-size
              clearable
            />
          </v-card-text>

          <v-card-actions class="px-4 pb-4">
            <v-spacer />
            <v-btn
              variant="text"
              :class="
                modern ? 'sd-modern-button sd-modern-button--inline' : undefined
              "
              @click="edit_dialog = false"
              >{{ $t("global.actions.cancel") }}</v-btn
            >
            <v-btn
              :loading="busy_save_edit"
              color="primary"
              variant="elevated"
              :class="
                modern
                  ? 'sd-modern-button sd-modern-button--primary'
                  : undefined
              "
              @click="saveEdit"
            >
              <v-icon v-if="modern" start aria-hidden="true">save</v-icon
              >{{ $t("global.actions.save") }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
  </div>
</template>

<script lang="ts">
import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";
import USmartMenu from "@selldone/components-vue/ui/smart/menu/USmartMenu.vue";
import SWidgetButtons from "@selldone/components-vue/ui/widget/buttons/SWidgetButtons.vue";
import USmartToggle from "@selldone/components-vue/ui/smart/toggle/USmartToggle.vue";

export default {
  name: "BShopListingItemTabMedia",
  components: { USmartToggle, SWidgetButtons, USmartMenu },

  inject: ["$shop"],

  props: {
    modern: { type: Boolean, default: false },
    itemId: { type: [Number, String], required: true },
  },

  emits: ["dirty-change", "saving-change"],

  data: () => ({
    media: [] as any[],
    busy_fetch: false,

    panels: ["upload"] as string[],
    media_filter: "all" as "all" | "image" | "link" | "video" | "file",

    upload_files: [] as any[],
    busy_upload: false,

    url_form: {
      type: "link",
      url: "",
      alt: "",
      is_main: false,
    },
    busy_add_url: false,

    busy_media_action: null as number | null,

    edit_dialog: false,
    busy_save_edit: false,
    replace_file: null as any,
    edit_form: {
      id: null as number | null,
      type: "",
      alt: "",
      url: "",
      sort_order: 0,
    },
    edit_original: null as any,
  }),

  computed: {
    hasUnsavedChanges(): boolean {
      if (
        this.upload_files.length ||
        String(this.url_form.url || "").trim() ||
        String(this.url_form.alt || "").trim() ||
        this.url_form.is_main
      )
        return true;

      if (!this.edit_dialog) return false;
      if (this.replace_file || !this.edit_original) return true;

      const values = (form: any) => [
        String(form.alt || "").trim(),
        form.type === "image" ? null : String(form.url || "").trim(),
        parseInt(String(form.sort_order ?? 0), 10) || 0,
      ];
      return (
        JSON.stringify(values(this.edit_form)) !==
        JSON.stringify(values(this.edit_original))
      );
    },

    isSaving(): boolean {
      return (
        this.busy_upload ||
        this.busy_add_url ||
        this.busy_save_edit ||
        !!this.busy_media_action
      );
    },

    shop(): any {
      return (this as any).$shop;
    },

    shopId(): number | null {
      return this.shop?.id ? parseInt(String(this.shop.id), 10) : null;
    },

    safeItemId(): number | null {
      const id = parseInt(String(this.itemId), 10);
      return isNaN(id) ? null : id;
    },

    /*🟢 Vendor Panel 🟢*/
    IS_VENDOR_PANEL(): boolean {
      // @ts-ignore
      return (
        (this as any).$route?.params?.vendor_id &&
        // @ts-ignore
        (this as any).$route?.matched?.some(
          (record: any) => record?.meta?.vendor,
        )
      );
    },

    VENDOR_ID_SAFE(): number | null {
      // @ts-ignore
      const raw = (this as any).$route?.params?.vendor_id;
      const v =
        raw !== null && raw !== undefined ? parseInt(String(raw), 10) : 0;
      return v > 0 ? v : null;
    },

    urlTypeOptions(): any[] {
      return [
        {
          title: this.modern
            ? this.$t("shop_listing.item_editor.links")
            : "link",
          value: "link",
        },
        {
          title: this.modern
            ? this.$t("shop_listing.item_editor.videos")
            : "video",
          value: "video",
        },
        {
          title: this.modern
            ? this.$t("shop_listing.item_editor.files")
            : "file",
          value: "file",
        },
      ];
    },

    mediaCounts(): any {
      const c: any = { all: 0, image: 0, link: 0, video: 0, file: 0 };
      const list = Array.isArray(this.media) ? this.media : [];
      c.all = list.length;

      list.forEach((m: any) => {
        const t = String(m?.type || "").toLowerCase();
        if (Object.prototype.hasOwnProperty.call(c, t)) c[t]++;
      });

      return c;
    },

    filteredMedia(): any[] {
      const list = Array.isArray(this.media) ? this.media : [];
      if (this.media_filter === "all") return list;
      return list.filter(
        (m: any) => String(m?.type || "").toLowerCase() === this.media_filter,
      );
    },
  },

  watch: {
    hasUnsavedChanges: {
      immediate: true,
      handler(value: boolean) {
        if (this.modern) this.$emit("dirty-change", value);
      },
    },
    isSaving: {
      immediate: true,
      handler(value: boolean) {
        if (this.modern) this.$emit("saving-change", value);
      },
    },
    itemId: {
      immediate: true,
      handler() {
        this.fetchMedia();
      },
    },
  },

  methods: {
    // ─────────────────────────────────────────────────────────────
    // Endpoint resolver (API vs VAPI)
    // ─────────────────────────────────────────────────────────────
    getEndpoint(kind: string, mediaId?: number) {
      const itemId = this.safeItemId;
      if (!itemId) return null;

      if (this.IS_VENDOR_PANEL) {
        const vendorId = this.VENDOR_ID_SAFE;
        if (!vendorId) return null;

        // @ts-ignore
        if (kind === "list")
          return window.VAPI.GET_MY_VENDOR_LISTING_ITEM_MEDIA_LIST(
            vendorId,
            itemId,
          );
        // @ts-ignore
        if (kind === "upload")
          return window.VAPI.POST_MY_VENDOR_LISTING_ITEM_MEDIA_IMAGES(
            vendorId,
            itemId,
          );
        // @ts-ignore
        if (kind === "add_url")
          return window.VAPI.POST_MY_VENDOR_LISTING_ITEM_MEDIA_URL(
            vendorId,
            itemId,
          );
        // @ts-ignore
        if (kind === "set_main")
          return window.VAPI.PUT_MY_VENDOR_LISTING_ITEM_MEDIA_MAIN(
            vendorId,
            itemId,
            mediaId,
          );
        // @ts-ignore
        if (kind === "edit")
          return window.VAPI.POST_MY_VENDOR_LISTING_ITEM_MEDIA_EDIT(
            vendorId,
            itemId,
            mediaId,
          );
        // @ts-ignore
        if (kind === "delete")
          return window.VAPI.DELETE_MY_VENDOR_LISTING_ITEM_MEDIA(
            vendorId,
            itemId,
            mediaId,
          );
        return null;
      }

      // Backoffice
      const shopId = this.shopId;
      if (!shopId) return null;

      // @ts-ignore
      if (kind === "list")
        return window.API.GET_SHOP_LISTING_ITEM_MEDIA_LIST(shopId, itemId);
      // @ts-ignore
      if (kind === "upload")
        return window.API.POST_SHOP_LISTING_ITEM_MEDIA_IMAGES(shopId, itemId);
      // @ts-ignore
      if (kind === "add_url")
        return window.API.POST_SHOP_LISTING_ITEM_MEDIA_URL(shopId, itemId);
      // @ts-ignore
      if (kind === "set_main")
        return window.API.PUT_SHOP_LISTING_ITEM_MEDIA_MAIN(
          shopId,
          itemId,
          mediaId,
        );
      // @ts-ignore
      if (kind === "edit")
        return window.API.POST_SHOP_LISTING_ITEM_MEDIA_EDIT(
          shopId,
          itemId,
          mediaId,
        );
      // @ts-ignore
      if (kind === "delete")
        return window.API.DELETE_SHOP_LISTING_ITEM_MEDIA(
          shopId,
          itemId,
          mediaId,
        );
      return null;
    },

    mediaTypeIcon(type: string) {
      const t = String(type || "").toLowerCase();
      if (t === "video") return "smart_display";
      if (t === "file") return "description";
      return "link";
    },

    openUrl(url: string) {
      if (!url) return;
      window.open(url, "_blank", "noopener,noreferrer");
    },

    resolveMediaImage(m: any) {
      if (m?.url) return m.url;
      return m?.path ? this.getShopImagePath(m.path) : "";
    },

    fetchMedia() {
      const url = this.getEndpoint("list");
      if (!url) return;

      this.busy_fetch = true;

      axios
        .get(url)
        .then(({ data }) => {
          if (data?.error) {
            NotificationService.showErrorAlert(null, data.error_msg);
            return;
          }
          this.media = Array.isArray(data.media) ? data.media : [];
        })
        .catch((error) => NotificationService.showLaravelError(error))
        .finally(() => (this.busy_fetch = false));
    },

    uploadImages() {
      const url = this.getEndpoint("upload");
      if (!url) return;

      if (!this.upload_files || !this.upload_files.length) {
        NotificationService.showErrorAlert(
          null,
          "Please select at least one image.",
        );
        return;
      }

      const fd = new FormData();
      this.upload_files.forEach((f: any) => fd.append("photos[]", f));

      this.busy_upload = true;

      axios
        .post(url, fd, { headers: { "Content-Type": "multipart/form-data" } })
        .then(({ data }) => {
          if (data?.error) {
            NotificationService.showErrorAlert(null, data.error_msg);
            return;
          }
          this.upload_files = [];
          this.media = Array.isArray(data.media) ? data.media : this.media;
          NotificationService.showSuccessAlert(
            null,
            "Images uploaded successfully.",
          );
        })
        .catch((error) => NotificationService.showLaravelError(error))
        .finally(() => (this.busy_upload = false));
    },

    addUrlMedia() {
      const url = this.getEndpoint("add_url");
      if (!url) return;

      const type = String(this.url_form.type || "").trim();
      const mediaUrl = String(this.url_form.url || "").trim();

      if (!type)
        return NotificationService.showErrorAlert(null, "Type is required.");
      if (!mediaUrl)
        return NotificationService.showErrorAlert(null, "URL is required.");

      this.busy_add_url = true;

      axios
        .post(url, {
          type,
          url: mediaUrl,
          alt: (this.url_form.alt || "").trim() || null,
          is_main: !!this.url_form.is_main,
        })
        .then(({ data }) => {
          if (data?.error) {
            NotificationService.showErrorAlert(null, data.error_msg);
            return;
          }

          this.url_form.url = "";
          this.url_form.alt = "";
          this.url_form.is_main = false;

          NotificationService.showSuccessAlert(
            null,
            "Media added successfully.",
          );
          this.fetchMedia();
        })
        .catch((error) => NotificationService.showLaravelError(error))
        .finally(() => (this.busy_add_url = false));
    },

    mediaMenuItems(m: any) {
      return [
        {
          title: this.modern
            ? this.$t("shop_listing.item_editor.set_main")
            : "Set as main",
          icon: "star",
          click: () => this.setMain(m),
          disabled: !!m.is_main,
        },
        {
          title: this.$t("global.actions.edit"),
          icon: "edit",
          click: () => this.openEdit(m),
        },
        {
          title: this.$t("global.actions.delete"),
          icon: "clear",
          click: () => this.deleteMedia(m),
        },
      ];
    },

    setMain(m: any) {
      const mediaId = m?.id ? parseInt(String(m.id), 10) : 0;
      if (!mediaId) return;

      const url = this.getEndpoint("set_main", mediaId);
      if (!url) return;

      this.busy_media_action = mediaId;

      axios
        .put(url)
        .then(({ data }) => {
          if (data?.error) {
            NotificationService.showErrorAlert(null, data.error_msg);
            return;
          }
          this.fetchMedia();
        })
        .catch((error) => NotificationService.showLaravelError(error))
        .finally(() => (this.busy_media_action = null));
    },

    openEdit(m: any) {
      this.edit_form = {
        id: m.id,
        type: m.type,
        alt: m.alt || "",
        url: m.url || "",
        sort_order: m.sort_order ?? 0,
      };
      this.edit_original = { ...this.edit_form };
      this.replace_file = null;
      this.edit_dialog = true;
    },

    saveEdit() {
      const mediaId = this.edit_form.id
        ? parseInt(String(this.edit_form.id), 10)
        : 0;
      if (!mediaId) return;

      const url = this.getEndpoint("edit", mediaId);
      if (!url) return;

      // Replace image file (multipart)
      if (this.replace_file) {
        const fd = new FormData();
        fd.append("photo", this.replace_file);
        fd.append("alt", (this.edit_form.alt || "").trim());
        fd.append("sort_order", String(this.edit_form.sort_order ?? 0));

        this.busy_save_edit = true;

        axios
          .post(url, fd, { headers: { "Content-Type": "multipart/form-data" } })
          .then(({ data }) => {
            if (data?.error) {
              NotificationService.showErrorAlert(null, data.error_msg);
              return;
            }
            this.edit_dialog = false;
            this.fetchMedia();
            NotificationService.showSuccessAlert(
              null,
              "Media updated successfully.",
            );
          })
          .catch((error) => NotificationService.showLaravelError(error))
          .finally(() => (this.busy_save_edit = false));

        return;
      }

      // Normal edit (alt/url/sort)
      this.busy_save_edit = true;

      axios
        .post(url, {
          alt: (this.edit_form.alt || "").trim() || null,
          url:
            this.edit_form.type !== "image"
              ? (this.edit_form.url || "").trim() || null
              : null,
          sort_order: parseInt(String(this.edit_form.sort_order ?? 0), 10) || 0,
        })
        .then(({ data }) => {
          if (data?.error) {
            NotificationService.showErrorAlert(null, data.error_msg);
            return;
          }
          this.edit_dialog = false;
          this.fetchMedia();
          NotificationService.showSuccessAlert(
            null,
            "Media updated successfully.",
          );
        })
        .catch((error) => NotificationService.showLaravelError(error))
        .finally(() => (this.busy_save_edit = false));
    },

    deleteMedia(m: any) {
      const mediaId = m?.id ? parseInt(String(m.id), 10) : 0;
      if (!mediaId) return;

      const url = this.getEndpoint("delete", mediaId);
      if (!url) return;

      NotificationService.openDangerAlert(
        this.$t("global.actions.delete"),
        "Delete this media?",
        this.$t("global.actions.delete"),
        () => {
          this.busy_media_action = mediaId;

          axios
            .delete(url)
            .then(({ data }) => {
              if (data?.error) {
                NotificationService.showErrorAlert(null, data.error_msg);
                return;
              }
              this.fetchMedia();
              NotificationService.showSuccessAlert(
                null,
                "Deleted successfully.",
              );
            })
            .catch((error) => NotificationService.showLaravelError(error))
            .finally(() => (this.busy_media_action = null));
        },
      );
    },
  },
};
</script>

<style scoped>
.media-card {
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.06);
}

.media-thumb {
  position: relative;
}

.media-topbar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;

  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 10px;

  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.55), rgba(0, 0, 0, 0));

  color: #fff;
}

.b-listing-item-media {
  font-size: 14px;
  line-height: 1.6;
}
.b-listing-item-media .sd-modern-title-text {
  font-size: 20px;
  font-weight: 500;
  line-height: 28px;
}
.b-listing-item-media .sd-modern-subtitle {
  margin-block-start: 5px;
  font-size: 13px;
  line-height: 21px;
}
.b-listing-item-media__header {
  margin-block-end: 24px;
}
.b-listing-item-media__library {
  margin-block-start: 16px;
  padding: 24px;
  border: 0;
  border-radius: 16px;
}
.b-listing-item-media__library > .d-flex {
  flex-wrap: wrap;
  gap: 8px;
}
.b-listing-item-media b {
  font-weight: 400;
}
.b-listing-item-media .text-muted,
.b-listing-item-media small {
  color: var(--sd-modern-muted);
  font-size: 13px;
  line-height: 21px;
}
.b-listing-item-media__panels {
  margin: 0;
  gap: 16px;
}
.b-listing-item-media__panels > .b-listing-item-media__resource {
  margin: 0;
  padding: 0;
  color: inherit;
  background: rgb(var(--v-theme-surface));
  border: 0;
  /* These are separate resource cards, rather than adjoining panel edges. */
  border-radius: 16px !important;
  box-shadow: none;
}
.b-listing-item-media__resource::after {
  display: none;
}
.b-listing-item-media__panels :deep(.v-expansion-panel__shadow) {
  display: none;
}
.b-listing-item-media__panels :deep(.v-expansion-panel-title) {
  padding: 20px 24px;
  font-size: 14px;
}
.b-listing-item-media__panels :deep(.v-expansion-panel-text__wrapper) {
  padding: 0 24px 20px;
}
.b-listing-item-media__resource :deep(.v-chip) {
  max-width: 100%;
}
.b-listing-item-media__filename {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.b-listing-item-media__identity {
  min-width: 0;
}
.b-listing-item-media .media-card {
  height: 100%;
  border-color: var(--sd-modern-border);
}
.b-listing-item-media .media-topbar {
  color: rgb(var(--v-theme-on-surface));
  background: rgb(var(--v-theme-surface));
  padding: 8px;
}
.b-listing-item-media :deep(.v-chip) {
  color: inherit;
  background: transparent;
  font-weight: 400;
}
.b-listing-item-media :deep(.v-chip:not(.v-chip--selected) .v-chip__overlay) {
  opacity: 0;
}
.b-listing-item-media__filters :deep(.v-chip--selected) {
  background: rgb(var(--v-theme-surface));
  box-shadow: var(--sd-modern-selected-shadow);
}
.b-listing-item-media__editor {
  padding: 12px;
}
.b-listing-item-media__editor :deep(.v-card-title) {
  font-size: 20px;
  font-weight: 500;
  line-height: 28px;
}
@media (max-width: 600px) {
  .b-listing-item-media__library {
    padding: 18px;
  }
  .b-listing-item-media__panels :deep(.v-expansion-panel-title) {
    padding-inline: 18px;
  }
  .b-listing-item-media__panels :deep(.v-expansion-panel-text__wrapper) {
    padding-inline: 18px;
  }
}
</style>
