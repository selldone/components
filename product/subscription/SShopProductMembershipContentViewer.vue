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
  <v-container class="s--shop-product-membership-content-viewer p-lg-5 p-md-4 p-3 master-article-container">
    <progress-loading v-if="busy_fetch"></progress-loading>

    <!-- ███████████████████████ Folders ███████████████████████ -->

    <div
      v-if="!selected_content"
      class="article min-height-60vh samin-article-content my-4 text-start"
    >
      <div class="h1 px-2">Contents list</div>

      <v-row no-gutters class="my-3">
        <v-spacer></v-spacer>
        <v-text-field
          v-model="search"
          dense
          prepend-inner-icon="search"
          solo
          flat
          background-color="transparent"
          hide-details
          :label="$t('global.commons.search')"
          single-line
          class="min-width-150 max-width-field"
          clearable
        >
        </v-text-field>
      </v-row>

      <v-slide-y-transition
        tag="v-list"
        group
        leave-absolute
        three-line
        class="border-between-vertical"
      >
        <v-list-item
          v-for="content in contents"
          :key="content.id"
          @click="selected_content = content;current_rate=content.rate"
          class="bg-white"
        >
          <v-list-item-icon>
            <v-icon color="amber" large>folder</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
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
          </v-list-item-content>
          <v-list-item-action>
            <files-list-grouped-view
              :files="content.files"
              class="text-end"
            ></files-list-grouped-view>
          </v-list-item-action>
        </v-list-item>
      </v-slide-y-transition>

      <div class="my-3">
        <v-pagination
          v-model="page"
          circle
          :length="pageCount"
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

      <v-row no-gutters class="my-3">
        <v-btn
          text
          @click="selected_content = null"
          class="tnt fadeIn"
          large
          color="#1976D2"
        >
          <v-icon class="me-1">{{ $t("icons.chevron_back") }}</v-icon>
          Back to contents list
        </v-btn>

        <v-spacer></v-spacer>
        <v-rating
          v-model="current_rate"
          class="mb-2"
          dir="ltr"
          color="yellow darken-3"
          background-color="grey darken-1"
          empty-icon="$vuetify.icons.ratingFull"
          hover
          :small="$vuetify.breakpoint.smAndDown"
          dense
          @input="(val) => setMyRate(selected_content, val)"
          :class="{ disabled: busy_rate }"
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
import FilesListGroupedView from "@app-backoffice/pages/product/widgets/FilesListGroupedView.vue";
import _ from "lodash-es";
export default {
  name: "MembershipContentViewer",
  components: { FilesListGroupedView, SShopProductFilesList },
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
    options: { sortDesc: [true] },

    selected_content: null,
    current_rate:1,

    busy_rate: false,
  }),

  computed: {
    pageCount() {
      return Math.ceil(this.totalItems / this.itemsPerPage);
    },
  },

  watch: {
    search: _.throttle(function (newVal, oldVal) {
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


      const handleSuccessResponse=({contents, total }) => {
        this.totalItems = total;
        this.contents = contents;
      }

      window.$storefront.products.subscription.optimize(60).getContents(this.product.id,(page - 1) * this.itemsPerPage,this.itemsPerPage,
          {
            search: this.search,
            sortBy: sortBy,
            sortDesc: sortDesc,
          }

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
            content.id
          ),
          {
            rate: rate,
            // TODO: add 'review' message in the future if seller wants it! Available in database.
          }
        )
        .then(({ data }) => {
          if (!data.error) {
            content.rate=data.rate
            content.rate_count=data.rate_count

            this.showSuccessAlert(
              null,
              "Thanks for your feedback. We received your content quality rating."
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

<style scoped lang="scss">

/*
━━━━━━━━━━━━━━━━━━━━ 🎺 Variables ━━━━━━━━━━━━━━━━━━━━
 */
.s--shop-product-membership-content-viewer{

}
/*
━━━━━━━━━━━━━━━━━━━━ 🪅 Classes ━━━━━━━━━━━━━━━━━━━━
 */
.s--shop-product-membership-content-viewer{

}
</style>
