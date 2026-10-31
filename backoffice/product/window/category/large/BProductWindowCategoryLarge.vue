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
    v-if="modernList"
    :category-id="category.id"
    :class="{ disabled: loading }"
    :aria-busy="loading || undefined"
    class="b-product-category-list"
  >
    <div
      class="b-product-category-list__body sd-modern-clickable-item"
      :class="{ 'b-product-category-list__body--no-image': !compactMode && !extended }"
      @click="$emit('select')"
    >
      <span
        v-if="compactMode || extended"
        class="b-product-category-list__image"
        :drop-image="!compactMode && extended ? 'true' : undefined"
      >
        <v-img
          v-if="category.icon"
          :src="getShopImagePath(category.icon, IMAGE_SIZE_SMALL)"
          class="hover-scale force-top"
          width="100%"
          height="100%"
          cover
          alt=""
        >
          <template #placeholder>
            <v-progress-circular
              class="center-absolute"
              indeterminate
              :size="18"
              :width="2"
            />
          </template>
        </v-img>
        <v-icon v-else icon="folder_open" size="20" aria-hidden="true" />
        <v-progress-circular
          v-if="uploading"
          :model-value="uploading.progress"
          class="center-absolute"
          color="primary"
          :size="24"
          :width="2"
        />
      </span>

      <div class="b-product-category-list__identity">
        <div class="b-product-category-list__header">
          <button
            type="button"
            class="b-product-category-list__title"
            :disabled="loading"
            @click.stop="$emit('select')"
          >
            <v-icon
              v-if="category.star"
              :size="12"
              class="me-1 text-warning"
              role="img"
              :aria-hidden="false"
              :aria-label="$t('global.commons.star')"
            >star</v-icon>
            {{ category.title }}
          </button>
          <div class="b-product-category-list__actions" @click.stop>
            <slot name="actions" />
            <v-btn
              icon
              variant="text"
              :disabled="loading"
              class="sd-modern-icon-button"
              :aria-label="$t('product_panel.workspace.list_view.more_actions')"
              @click.stop="$emit('contextmenu', $event)"
            >
              <v-icon :size="18">more_horiz</v-icon>
              <v-tooltip activator="parent" location="top" content-class="sd-modern-tooltip text-start">{{ $t("product_panel.workspace.list_view.more_actions") }}</v-tooltip>
            </v-btn>
          </div>
        </div>
        <div
          v-if="category.description"
          class="b-product-category-list__description"
          tabindex="0"
        >
          {{ category.description }}
          <v-tooltip
            activator="parent"
            location="top"
            content-class="sd-modern-tooltip text-start"
          >{{ category.description }}</v-tooltip>
        </div>
        <div v-if="category.connect_id" class="b-product-category-list__hints">
          <span class="b-product-category-list__connect" tabindex="0" @click.stop>
            <img :src="getConnectIcon(category.connect_id)" :alt="$t('global.commons.connected')" />
            <v-tooltip activator="parent" location="top" :open-on-click="true" content-class="sd-modern-tooltip text-start">
              {{ $t("product_panel.workspace.list_view.connected_category") }}
            </v-tooltip>
          </span>
        </div>
      </div>
      <v-progress-circular v-if="loading" class="center-absolute" indeterminate :size="24" :width="2" />
    </div>
  </div>
  <div
    v-else
    :category-id="category.id"
    :class="{ disabled: loading }"
    :style="{ '--card-color': isEmpty ? '#959c9f' : ThemeColorDeepDark }"
    class="widget-folder-root"
    @click="$emit('select')"
  >
    <div class="box">
      <s-widget
        :class="{ 'm-1': small, compact: compactMode }"
        :color="isEmpty ? '#959c9f' : ThemeColorDeepDark"
        :title="`<h5 class='align-items-center pb-1 text-white '  style='font-size: 1.16rem;font-weight: 500'>    <span class=' ${star_class} mr-sm text-warning' style='font-size: 12px;'></span>  ${category.title}  </h5>`"
        body-class="p-0 mt"
        class="text-start card"
        custom-header
        dark
        style="border-radius: 8px !important"
      >
        <template v-slot:top-left>
          <v-btn
            v-if="showEditButton"
            icon
            variant="text"
            @click.stop="$emit('click:edit')"
          >
            <v-icon color="#fff" size="small"> edit_square</v-icon>
          </v-btn>
          <circle-image
            v-if="compactMode"
            :size="64"
            :src="getShopImagePath(category.icon, IMAGE_SIZE_SMALL)"
            class="float-left"
            dark
          ></circle-image>
        </template>
        <p
          :class="small ? 'small' : ''"
          :title="category.description"
          class="fw-semi-bold mb-1 small folder-description"
        >
          <v-avatar v-if="category.connect_id" class="me-1" rounded size="24"
            ><img :src="getConnectIcon(category.connect_id)"
          /></v-avatar>

          {{ category.description ? category.description.limitWords(12) : "" }}

          <span v-if="isEmpty" class="mt-1 text-subtitle-2">{{
            $t("global.commons.empty")
          }}</span>
        </p>

        <div
          v-if="!compactMode && extended"
          class="d-flex border-top text-center"
        >
          <div class="w-50 border-end p-1 text-center">
            <v-avatar
              :color="ThemeColorDeepDark"
              :size="70"
              class="folder-icon"
              drop-image="true"
              ><!-- dro-image : active drop area for images fast upload -->
              <v-img :src="getShopImagePath(category.icon, IMAGE_SIZE_SMALL)">
                <template v-slot:placeholder>
                  <v-progress-circular
                    :color="ThemeColorDark"
                    class="center-absolute"
                    indeterminate
                  />
                </template>
                <v-progress-circular
                  v-if="uploading"
                  :model-value="uploading.progress"
                  class="center-absolute"
                  color="blue"
                ></v-progress-circular>
              </v-img>
            </v-avatar>
          </div>

          <div class="w-50 p-3 px-4 text-start" style="font-size: 12px">
            <p
              :title="$t('admin_shop.products.folder_widget.products')"
              class="mb-1"
            >
              <i class="fas fa-box text-muted me-2" />

              <!--  <small class="text-muted mb-0 mx-2"
                >{{ $t('admin_shop.products.folder_widget.products') }}:
              </small>-->

              <span v-if="category.products" class="text-warning"
                >{{ numeralFormat(category.products, "0,0a") }}
                <span class="small">{{
                  $t("admin_shop.products.folder_widget.products_unit")
                }}</span></span
              >
              <span v-else class="text-muted">-</span>
            </p>

            <p
              :title="$t('admin_shop.products.folder_widget.sub_categories')"
              class="mb-1"
            >
              <i class="fas fa-shapes text-muted me-2" />

              <!--    <small class="text-muted mb-0 mx-2"
                >{{ $t('admin_shop.products.folder_widget.sub_categories') }}:
              </small>-->

              <span v-if="category.categories" class="text-warning">
                {{ numeralFormat(category.categories, "0,0a") }}
                <span class="small">{{
                  $t("admin_shop.products.folder_widget.sub_categories_unit")
                }}</span></span
              >
              <span v-else class="text-muted">-</span>
            </p>

            <p
              :title="$t('admin_shop.products.folder_widget.views')"
              class="mb-1"
            >
              <i class="fas fa-eye text-muted me-2" />
              <!-- <small class="text-muted mb-0 mx-2"
                >{{ $t('admin_shop.products.folder_widget.views') }}:
              </small>-->

              <span v-if="category.visits" class="text-warning">
                {{ numeralFormat(category.visits, "0,0a") }}
                <span class="small">{{
                  $t("admin_shop.products.folder_widget.views_unit")
                }}</span></span
              >
              <span v-else class="text-muted">-</span>
            </p>
          </div>
        </div>
      </s-widget>
    </div>

    <v-progress-circular
      v-if="loading"
      class="center-absolute"
      indeterminate
      style="z-index: 99"
    >
    </v-progress-circular>
  </div>
</template>

<script lang="ts">
import CircleImage from "../../../../../ui/image/CircleImage.vue";
import TemplateMixin from "@selldone/components-vue/mixin/template/TemplateMixin.ts";

export default {
  name: "BProductWindowCategoryLarge",
  mixins: [TemplateMixin],
  emits: ["select", "click:edit", "contextmenu"],

  components: { CircleImage },
  props: {
    modernList: {
      type: Boolean,
      default: false,
    },
    category: {
      required: true,
      type: Object,
    },

    small: {
      required: false,
      default: false,
      type: Boolean,
    },
    extended: {
      required: false,
      default: true,
      type: Boolean,
    },

    showEditButton: {
      required: false,
      type: Boolean,
      default: false,
    },

    compactMode: {
      required: false,
      type: Boolean,
      default: false,
    },

    loading: {
      type: Boolean,
      default: false,
    },
    isEmpty: Boolean,
  },

  data() {
    return {};
  },

  computed: {
    star_class() {
      return this.category.star ? "fa:fas fa-star" : "";
    },

    // -------- Uploading image: --------
    uploading() {
      const found = Object.values(this.$store.getters.getUploadingKeeper).find(
        (it) => it.target && it.target.category === this.category.id,
      );
      return found ? found : null;
    },
    // ----------------------------------
  },
  mounted() {},

  methods: {
    getConnectIcon(connect_id: string | number) {
      return window.CDN.GET_CONNECT_ICON(connect_id);
    },
  },
};
</script>

<style lang="scss" scoped>
.b-product-category-list {
  --sd-modern-icon-button-size: 32px;
  display: flex;
  flex-direction: column;
  height: var(--b-products-list-item-height, auto);
  min-width: 0;
  border-block-start: 1px solid var(--sd-modern-border);

  &__body {
    display: grid;
    flex: 1 0 auto;
    grid-template-columns: 44px minmax(0, 1fr);
    align-content: start;
    align-items: start;
    gap: 9px;
    min-height: var(--b-products-list-row-min-height, 44px);
    padding: 6px 12px;
    border-radius: 9px;
    text-align: start;

    &--no-image { grid-template-columns: minmax(0, 1fr); }
  }

  &__image {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 48px;
    margin-block-start: 2px;
    padding: 2px;
    border: 1px solid var(--sd-modern-border);
    border-radius: 9px;
    overflow: visible;
    background: var(--sd-modern-inset);
    color: var(--sd-modern-muted);

    &::before {
      content: "";
      position: absolute;
      inset-inline-start: 5px;
      inset-block-start: -4px;
      width: 17px;
      height: 5px;
      border: 1px solid var(--sd-modern-border);
      border-block-end: 0;
      border-radius: 4px 4px 0 0;
      background: rgb(var(--v-theme-surface));
    }

    > .v-img { border-radius: 6px; }
  }

  &__identity { min-width: 0; }

  &__header { display: flex; align-items: center; gap: 6px; min-width: 0; }

  &__title {
    display: block;
    flex: 1;
    min-width: 0;
    padding: 0;
    border: 0;
    color: inherit;
    background: transparent;
    font: inherit;
    font-size: 14px;
    font-weight: 500;
    line-height: 21px;
    text-align: start;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    cursor: pointer;
  }

  &__description {
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
    color: var(--sd-modern-muted);
    font-size: 13px;
    line-height: 20px;
  }

  &__hints {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 1px 8px;
    color: var(--sd-modern-muted);
    font-size: 13px;
    line-height: 20px;
  }

  &__connect {
    display: inline-flex;
    align-items: center;
    min-height: 24px;
    img { width: 18px; height: 18px; object-fit: contain; }
  }

  &__actions {
    display: flex;
    flex: 0 0 auto;
    flex-wrap: nowrap;
    align-items: center;
    gap: 6px;
    margin-inline-start: auto;
    > :deep(span) { display: flex; align-items: center; }
    :deep(.sd-modern-icon-button.v-btn) {
      --sd-modern-icon-button-size: 32px;
      flex: 0 0 32px;
      width: 32px !important;
      min-width: 32px !important;
      max-width: 32px !important;
      height: 32px !important;
      min-height: 32px !important;
      max-height: 32px !important;
      margin: 0;
      padding: 0;
    }
    :deep(.sd-modern-icon-button.v-btn .v-icon) { font-size: 18px !important; }
  }

  &__title:focus-visible,
  &__description:focus-visible,
  &__connect:focus-visible {
    outline: 2px solid rgb(var(--v-theme-primary));
    outline-offset: 2px;
    border-radius: 4px;
  }

  @media (max-width: 600px), (pointer: coarse) {
    &__title, &__connect { min-height: 44px; }
    &__actions :deep(.sd-modern-icon-button.v-btn) {
      --sd-modern-icon-button-size: 44px;
      flex-basis: 44px;
      width: 44px !important;
      min-width: 44px !important;
      max-width: 44px !important;
      height: 44px !important;
      min-height: 44px !important;
      max-height: 44px !important;
    }
  }
}

.widget-folder-root {
  cursor: pointer;
  margin: 0;
  padding: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  //min-height: 100vh;
  // background: #212121;
  //font-family: sans-serif;
  color: white;
  position: relative;

  a {
    color: #444;

    &:hover {
      color: #444;
    }
  }

  .folder-icon {
    margin: 8px;
  }

  .folder-description {
    height: 5.6em;
    overflow: hidden;
    font-size: 0.85em;
    line-height: 1.4em;
    font-weight: 400;
  }

  .box {
    z-index: 50;
    width: 100%;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    grid-gap: 15px;
    margin: 0 auto;
    padding: 16px;
  }

  .card {
    position: relative;
    width: 100%;
    height: auto;

    background: var(--card-color);
    margin: 0 auto;
    border-radius: 14px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);

    &.compact {
      height: auto;
    }
  }

  .card:before,
  .card:after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: 4px;
    background: var(--card-color);
    opacity: 0.96;

    transition: 0.5s;
    z-index: -1;
  }

  .card:hover:before {
    transform: rotate(20deg);
    box-shadow: 0 2px 20px rgba(0, 0, 0, 0.2);
  }

  .card:hover:after {
    transform: rotate(10deg);
    box-shadow: 0 2px 20px rgba(0, 0, 0, 0.2);
  }

  .text-muted {
    color: #eee !important;
  }
}
</style>
