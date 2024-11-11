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
  <div>
    <v-row align="start" class="m-0 py-16" justify="center">
      <u-button-feature
        :name="$t('global.commons.store')"
        :selected="
          home_page === 'shop' ||
          (!clearable && !home_page) /*Default home page mode!*/
        "
        :src="require('../../../../assets/icons/store.svg')"
        auto-scale-down
        class="zoomIn delay_300"
        @select="
          home_page = 'shop';
          setHomePage();
        "
      >
      </u-button-feature>

      <u-button-feature
        :disabled="!(shop.avocado && shop.avocado.enable)"
        :name="$t('global.commons.avocado')"
        :selected="home_page === 'avocado'"
        :src="require('../../../../assets/icons/avocado.svg')"
        :to-setting="{ name: 'BPageShopChannelAvocado' }"
        auto-scale-down
        class="zoomIn delay_400"
        @select="
          home_page = 'avocado';
          setHomePage();
        "
      >
        <v-tooltip
          v-if="!shop.avocado?.enable"
          activator="parent"
          location="bottom"
        >
          <v-icon class="me-1">warning</v-icon>
          Avocado sales channel not enable!!
        </v-tooltip>
      </u-button-feature>

      <u-button-feature
        :disabled="!(shop.hyper && shop.hyper.enable)"
        :name="$t('global.commons.hyper')"
        :selected="home_page === 'hyper'"
        :src="require('../../../../assets/icons/hyper.svg')"
        :to-setting="{ name: 'BPageShopChannelHyper' }"
        auto-scale-down
        class="zoomIn delay_500"
        @select="
          home_page = 'hyper';
          setHomePage();
        "
      >
        <v-tooltip
          v-if="!shop.hyper?.enable"
          activator="parent"
          location="bottom"
        >
          <v-icon class="me-1">warning</v-icon>
          Hyper sales chanel not enable!!
        </v-tooltip>
      </u-button-feature>

      <u-button-feature
        :disabled="!(shop.community && shop.community.enable)"
        :name="$t('global.commons.community')"
        :selected="home_page === 'community'"
        :src="require('../../../../assets/icons/community.png')"
        :to-setting="{ name: 'BPageShopCommunityTopics' }"
        auto-scale-down
        class="zoomIn delay_600"
        @select="
          home_page = 'community';
          setHomePage();
        "
      >
        <v-tooltip
          v-if="!shop.community?.enable"
          activator="parent"
          location="bottom"
        >
          <v-icon class="me-1">warning</v-icon>
          Community not enable!!
        </v-tooltip>
      </u-button-feature>

      <u-button-feature
        :name="$t('global.commons.blog')"
        :selected="home_page === 'blog'"
        :src="require('../../../../assets/icons/blog.svg')"
        :to-setting="{ name: 'BPageShopBlogsList' }"
        auto-scale-down
        class="zoomIn delay_700"
        @select="
          home_page = 'blog';
          setHomePage();
        "
      >
      </u-button-feature>

      <u-button-feature
        :name="$t('global.commons.map')"
        :selected="home_page === 'map'"
        :src="require('../../../../assets/icons/map-tag.svg')"
        :to-setting="{ name: 'BPageShopChannelMap' }"
        auto-scale-down
        class="zoomIn delay_700"
        @select="
          home_page = 'map';
          setHomePage();
        "
      >
      </u-button-feature>

      <u-button-feature
        :disabled="!pages.length"
        :name="$t('global.commons.landing_page')"
        :selected="landing_page_mode"
        :src="require('../../../../assets/icons/landing-page.svg')"
        :to-setting="{ name: 'BPageShopPagesLandings' }"
        auto-scale-down
        class="zoomIn delay_800"
        @select="
          home_page = pages[0].id;
          setHomePage();
        "
      >
        <v-tooltip v-if="!pages.length" activator="parent" location="bottom">
          <v-icon class="me-1">warning</v-icon>
          No landing page created!
        </v-tooltip>
      </u-button-feature>

      <u-button-feature
        :selected="static_page_mode"
        :src="require('../../../../assets/icons/static-pages.svg')"
        :to-setting="{ name: 'BPageShopPagesStatic' }"
        auto-scale-down
        class="zoomIn delay_900"
        name="Static page"
        @select="
          home_page = '/';
          setHomePage();
        "
      >
      </u-button-feature>
    </v-row>

    <template v-if="static_page_mode">
      <v-text-field
        v-model="home_page"
        :disabled="busy_set"
        class="max-width-field-large mx-auto mt-8 mb-4 fadeIn"
        flat
        label="Page path"
        messages="Paths should begin with a forward slash '/'. For example, to access a specific folder, you can use the path '/Folder1'."
        variant="solo"
        @keydown.enter="setHomePage"
      >
        <template v-slot:append-inner>
          <v-btn
            :disabled="old_page === home_page"
            :loading="busy_set"
            class="ma-1"
            color="primary"
            size="small"
            @click="setHomePage"
          >
            <v-icon start>save</v-icon>
            {{ $t("global.actions.save") }}
          </v-btn>
        </template>
      </v-text-field>

      <div class="max-width-field-large mx-auto my-4">
        <v-btn
          :to="{ name: 'BPageShopPagesStatic' }"
          class="tnt"
          color="primary"
          variant="text"
          >Manage static pages
          <v-icon end>{{ $t("icons.chevron_next") }}</v-icon>
        </v-btn>
      </div>
    </template>

    <v-select
      v-if="landing_page_mode"
      v-model="home_page"
      :disabled="busy_set"
      :items="pages"
      :label="$t('shop_home_edit.default_home')"
      :placeholder="$t('shop_home_edit.default_home_placeholder')"
      :return-object="false"
      class="max-width-field-large mx-auto mt-8 mb-4 fadeIn"
      clearable
      item-title="title"
      item-value="id"
      searchable
      variant="underlined"
      @update:model-value="setHomePage"
    >
      <template v-slot:append-inner>
        <v-progress-circular
          v-if="busy_set || busy_fetch"
          :color="busy_set ? 'green' : 'blue'"
          class="margin-n7px"
          indeterminate
        >
        </v-progress-circular>
      </template>

      <template v-slot:item="{ item, props }">
        <v-list-item class="text-start" v-bind="props">
          <template v-slot:prepend>
            <v-avatar
              :image="getShopImagePath(item.raw.image, IMAGE_SIZE_SMALL)"
              rounded="lg"
              size="24"
            />
          </template>

          <template v-slot:title>
            {{ item.raw.title }}
            <v-icon
              v-if="!item.raw.published"
              color="amber"
              title="Not published!"
              >warning
            </v-icon>
          </template>

          <template v-slot:append>
            <v-icon :color="item.raw.color">fiber_manual_record</v-icon>
          </template>
        </v-list-item>
      </template>

      <template v-slot:selection="{ item }">
        <img
          :src="getShopImagePath(item.raw.image, IMAGE_SIZE_SMALL)"
          class="rounded"
          height="24"
        />

        <span class="mx-2">{{ item.raw.title }}</span>

        <v-icon v-if="!item.raw.published" color="amber" title="Not published!"
          >warning
        </v-icon>

        <v-icon :color="item.raw.color">fiber_manual_record</v-icon>
      </template>
    </v-select>

    <div v-if="clearable" class="widget-buttons mt-5">
      <v-btn
        :loading="busy_set && !home_page"
        size="x-large"
        variant="outlined"
        @click="
          home_page = null;
          setHomePage();
        "
      >
        <v-icon start>restart_alt</v-icon>
        Clear <small>(Set shop default)</small>
      </v-btn>
    </div>
  </div>
</template>

<script lang="ts">
import UButtonFeature from "../../../../ui/button/feature/UButtonFeature.vue";
import { throttle } from "lodash-es";

export default {
  name: "BShopHomeSelect",
  components: { UButtonFeature },
  props: {
    shop: {
      required: false,
      type: Object,
    },
    domain: {
      // null: main shop home page
      type: Object,
    },
    clearable: {
      default: false,
      type: Boolean,
    },
  },

  data: () => ({
    busy_fetch: false,
    search: "",
    pages: [],

    home_page: null,
    old_page: null,
    busy_set: false,
  }),

  computed: {
    landing_page_mode() {
      return (
        this.home_page &&
        !this.static_page_mode &&
        !["blog", "avocado", "hyper", "community", "shop", "map"].includes(
          this.home_page,
        )
      );
    },

    static_page_mode() {
      return ("" + this.home_page)?.startsWith("/");
    },
  },

  created() {
    function isNumeric(value) {
      return /^\d+$/.test(value);
    }

    if (this.domain) {
      this.home_page = this.domain.home;
    } else {
      this.home_page = this.shop.home;
    }
    if (isNumeric(this.home_page)) this.home_page = parseInt(this.home_page); // Fix select page by id (string save in database 'home' )

    this.old_page = this.home_page;
    this.fetchPages();
  },
  methods: {
    fetchPages() {
      this.busy_fetch = true;

      axios
        .get(window.API.GET_SHOP_PAGES(this.shop.id), {
          params: {
            offset: 0,
            limit: 100,
            search: this.search,
            compact: true,
          },
        })
        .then(({ data }) => {
          this.pages = data.pages;
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_fetch = false;
        });
    },
    setHomePage: throttle(function () {
      if (this.old_page === this.home_page) return;
      this.old_page = this.home_page;

      this.setHomePageNow();
    }, 1000),

    setHomePageNow() {
      this.busy_set = true;

      axios
        .put(
          this.domain
            ? window.API.PUT_SHOP_DOMAIN_HOME_PAGE(
                this.shop.id,
                this.domain.domain,
              ) /* Other domains custom home page */
            : window.API.PUT_SHOP_HOME_PAGE(
                this.shop.id,
              ) /* Default shop home page */,
          {
            page_id: this.home_page,
          },
        )
        .then(({ data }) => {
          if (!data.error) {
            if (this.domain) {
              this.domain.home = data.home;

              // Update main home page if primary domain has been edited:
              if (this.domain.primary) {
                this.shop.home = data.home;
              }
            } else {
              this.shop.home = data.home;
            }

            this.showSuccessAlert(null, "Home page successfully set up.");
          } else this.showErrorAlert(null, data.error_msg);
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_set = false;
        });
    },
  },
};
</script>

<style scoped></style>
