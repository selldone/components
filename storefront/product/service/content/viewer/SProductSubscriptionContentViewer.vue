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

<template>
  <v-container
    class="s--shop-product-membership-content-viewer p-lg-5 p-md-4 p-3 master-article-container"
  >
    <u-loading-progress v-if="busy_fetch"></u-loading-progress>

    <!-- ███████████████████████ Folders ███████████████████████ -->

    <div
      v-if="!selected_content"
      class="article min-height-60vh samin-article-content my-4 text-start"
    >
      <div class="h1 px-2">Contents list</div>

      <v-row class="my-3" no-gutters>
        <v-spacer></v-spacer>

        <v-text-field
          v-model="search"
          :label="$t('global.commons.search')"
          class="min-width-150 max-width-field"
          clearable
          hide-details
          prepend-inner-icon="search"
          single-line
          variant="plain"
        ></v-text-field>
      </v-row>

      <v-slide-y-transition
        class="border-between-vertical"
        group
        leave-absolute
        tag="v-list"
        three-line
      >
        <v-list-item
          v-for="content in contents"
          :key="content.id"
          class="bg-white"
          @click="
            selected_content = content;
            current_rate = content.rate;
          "
        >
          <template v-slot:prepend>
            <v-icon color="amber" size="large">folder</v-icon>
          </template>

          <v-list-item-title>
            <b>{{ content.title }}</b>
          </v-list-item-title>
          <v-list-item-subtitle class="small">
            <b>{{ getFromNowString(content.created_at) }}</b> ●
            {{ getLocalDateString(content.created_at) }}
          </v-list-item-subtitle>
          <v-list-item-subtitle>
            {{ content.description }}
          </v-list-item-subtitle>

          <v-list-item-action>
            <s-files-group
              :files="content.files"
              class="text-end"
            ></s-files-group>
          </v-list-item-action>
        </v-list-item>
      </v-slide-y-transition>

      <div class="my-3">
        <v-pagination
          v-model="page"
          :length="pageCount"
          rounded
          @change="(val) => fetchContents(val)"
        />
      </div>
    </div>

    <!-- ███████████████████████ Files ███████████████████████ -->
    <div
      v-else
      class="article min-height-60vh samin-article-content my-4 text-start"
    >
      <div class="h1 px-2">
        {{ $t("global.commons.files_list") }}
      </div>

      <v-row class="my-3" no-gutters>
        <v-btn
          class="tnt fadeIn"
          color="#1976D2"
          size="large"
          variant="text"
          @click="selected_content = null"
        >
          <v-icon class="me-1">{{ $t("icons.chevron_back") }}</v-icon>
          Back to contents list
        </v-btn>

        <v-spacer></v-spacer>
        <v-rating
          v-model="current_rate"
          :class="{ disabled: busy_rate }"
          :size="$vuetify.display.smAndDown ? 'small' : undefined"
          active-color="yellow-darken-3"
          class="mb-2"
          color="grey-darken-1"
          density="compact"
          dir="ltr"
          hover
          @update:model-value="(val) => setMyRate(selected_content, val)"
        />
      </v-row>

      <s-shop-product-files-list
        :files="selected_content.files"
        purchased
      ></s-shop-product-files-list>
    </div>
  </v-container>
</template>

<script>
import SShopProductFilesList from "@components/storefront/product/file/SShopProductFilesList.vue";
import SFilesGroup from "@components/ui/file/group/SFilesGroup.vue";
import _ from "lodash-es";

export default {
  name: "SProductSubscriptionContentViewer",
  components: { SFilesGroup, SShopProductFilesList },
  props: {
    product: {
      require: true,
    },
  },

  data: () => ({
    // ―――――――― 🗘 Sync list. ――――――――
    busy_fetch: false,

    contents: [],

    search: "",

    // Pagination:
    page: 1,
    itemsPerPage: 10,
    totalItems: 0,

    selected_content: null,
    current_rate: 1,

    busy_rate: false,
  }),

  computed: {
    pageCount() {
      return Math.ceil(this.totalItems / this.itemsPerPage);
    },
  },

  watch: {
    search: _.throttle(function (newVal, oldVal) {
      if (!newVal && !oldVal) return;
      this.page = 1;
      this.fetchContents(this.page);
    }, window.SERACH_THROTTLE),
  },

  created() {
    this.fetchContents(1);
  },

  methods: {
    fetchContents(page, sortBy = "id", sortDesc = true) {
      this.busy_fetch = true;

      const handleSuccessResponse = ({ contents, total }) => {
        this.totalItems = total;
        this.contents = contents;
      };

      window.$storefront.products.subscription
        .optimize(60)
        .getContents(
          this.product.id,
          (page - 1) * this.itemsPerPage,
          this.itemsPerPage,
          {
            search: this.search,
            sortBy: sortBy,
            sortDesc: sortDesc,
          },
        )
        .cache(handleSuccessResponse)
        .then(handleSuccessResponse)
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_fetch = false;
        });
    },

    setMyRate(content, rate) {
      this.busy_rate = true;

      axios
        .post(
          window.XAPI.POST_PRODUCT_MEMBERSHIP_CONTENTS_SEND_MY_RATING(
            this.getShop().name,
            this.product.id,
            content.id,
          ),
          {
            rate: rate,
            // TODO: add 'review' message in the future if seller wants it! Available in database.
          },
        )
        .then(({ data }) => {
          if (!data.error) {
            content.rate = data.rate;
            content.rate_count = data.rate_count;

            this.showSuccessAlert(
              null,
              "Thanks for your feedback. We received your content quality rating.",
            );
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_rate = false;
        });
    },
  },
};
</script>

<style lang="scss" scoped>
/*
━━━━━━━━━━━━━━━━━━━━ 🎺 Variables ━━━━━━━━━━━━━━━━━━━━
 */
.s--shop-product-membership-content-viewer {
}

/*
━━━━━━━━━━━━━━━━━━━━ 🪅 Classes ━━━━━━━━━━━━━━━━━━━━
 */
.s--shop-product-membership-content-viewer {
}
</style>
