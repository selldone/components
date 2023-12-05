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
    class="widget-folder-root pointer-pointer"
    @click="$emit('select')"
    :class="{ disabled: loading }"
  >
    <div class="box">
      <s-widget
        class="text-start card"
        style="border-radius: 8px"
        :class="{ 'm-1': small, compact: compactMode }"
        :title="`<h5 class='align-items-center pb-1 text-white '  style='font-size: 1.16rem;font-weight: 500'>    <span class=' ${star_class} mr-sm text-warning' style='font-size: 12px;'></span>  ${category.title}  </h5>`"
        body-class="p-0 mt"
        custom-header
      >
        <template slot="top-left">
          <v-btn v-if="showEditButton" icon @click.stop="$emit('click:edit')">
            <v-icon small color="#fff"> fas fa-edit </v-icon>
          </v-btn>
          <circle-image
            v-if="compactMode"
            :size="64"
            dark
            :src="getShopImagePath(category.icon, IMAGE_SIZE_SMALL)"
            class="float-left"
          ></circle-image>
        </template>

        <p
          class="fw-semi-bold mb-1 small folder-description"
          :class="small ? 'small' : ''"
          :title="category.description"
        >
          <v-avatar v-if="category.connect_id" size="24" rounded class="me-1"
          ><img :src="getConnectIcon(category.connect_id)"
          /></v-avatar>

          {{category.description? category.description.limitWords(12):'' }}
        </p>

        <div
          v-if="!compactMode && extended"
          class="d-flex border-top text-center"
        >
          <div class="w-50 border-end p-1 text-center">
            <v-avatar
              :size="70"
              :color="SaminColorDarkDeep"
              class="folder-icon transition-fast-in-fast-out"
              drop-image="true"
              ><!-- dro-image : active drop area for images fast upload -->
              <v-img :src="getShopImagePath(category.icon, IMAGE_SIZE_SMALL)">
                <template v-slot:placeholder>
                  <v-layout fill-height align-center justify-center ma-0>
                    <v-progress-circular
                      indeterminate
                      :color="SaminColorDark"
                    />
                  </v-layout>
                </template>
                <v-progress-circular
                  v-if="uploading"
                  :value="uploading.progress"
                  class="center-absolute"
                  color="blue"
                ></v-progress-circular>
              </v-img>
            </v-avatar>
          </div>

          <div class="w-50 p-3 px-4 text-start" style="font-size: 12px">
            <p
              class="mb-1"
              :title="$t('admin_shop.products.folder_widget.products')"
            >
              <i class="fas fa-box text-muted me-2" />

              <!--  <small class="text-muted mb-0 mx-2"
                >{{ $t('admin_shop.products.folder_widget.products') }}:
              </small>-->

              <span v-if="category.products" class="text-warning"
                >{{ category.products | numeralFormat("0,0a") }}
                <span class="small">{{
                  $t("admin_shop.products.folder_widget.products_unit")
                }}</span></span
              >
              <span v-else class="text-muted">-</span>
            </p>

            <p
              class="mb-1"
              :title="$t('admin_shop.products.folder_widget.sub_categories')"
            >
              <i class="fas fa-shapes text-muted me-2" />

              <!--    <small class="text-muted mb-0 mx-2"
                >{{ $t('admin_shop.products.folder_widget.sub_categories') }}:
              </small>-->

              <span v-if="category.categories" class="text-warning">
                {{ category.categories | numeralFormat("0,0a") }}
                <span class="small">{{
                  $t("admin_shop.products.folder_widget.sub_categories_unit")
                }}</span></span
              >
              <span v-else class="text-muted ">-</span>
            </p>

            <p
              class="mb-1"
              :title="$t('admin_shop.products.folder_widget.views')"
            >
              <i class="fas fa-eye text-muted me-2" />
              <!-- <small class="text-muted mb-0 mx-2"
                >{{ $t('admin_shop.products.folder_widget.views') }}:
              </small>-->

              <span v-if="category.visits" class="text-warning">
                {{ category.visits | numeralFormat("0,0a") }}
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

<script>
import CircleImage from "@components/ui/image/CircleImage.vue";
export default {
  name: "WidgetFolderCard",
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
  },

  data() {
    return {};
  },

  computed: {
    star_class() {
      return this.category.star ? "fas fa-star" : "";
    },

    // -------- Uploading image: --------
    uploading() {
      const found = Object.values(this.$store.getters.getUploadingKeeper).find(
        (it) => it.target && it.target.category === this.category.id
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

.widget-folder-root {
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

  background: var(--theme-dark);
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
  background: var(--theme-dark);
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
</style>
