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
    :category-id="category.id"
    :class="{ disabled: loading }"
    :style="{ '--card-color': isEmpty?'#959c9f':ThemeColorDeepDark }"
    class="widget-folder-root"
    @click="$emit('select')"
  >
    <div class="box">
      <s-widget
        :class="{ 'm-1': small, compact: compactMode }"
        :color="isEmpty?'#959c9f':ThemeColorDeepDark"
        :title="`<h5 class='align-items-center pb-1 text-white '  style='font-size: 1.16rem;font-weight: 500'>    <span class=' ${star_class} mr-sm text-warning' style='font-size: 12px;'></span>  ${category.title}  </h5>`"
        body-class="p-0 mt"
        class="text-start card"
        custom-header
        dark
        style="border-radius: 8px !important;"
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

          <span v-if="isEmpty" class="mt-1 text-subtitle-2">{{$t('global.commons.empty')}}</span>
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

  components: { CircleImage },
  props: {
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
    isEmpty:Boolean

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

  methods: {},
};
</script>

<style lang="scss" scoped>
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
