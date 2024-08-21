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
  <u-loading-progress v-if="busy_fetch"></u-loading-progress>

  <v-row v-if="hasClusterFilter || hasSearch" no-gutters>
    <!-- ━━━━━━━━━━━━━━━━━━━━━━━━ 🆑 Cluster Filter ━━━━━━━━━━━━━━━━━━━━━━━━ -->
    <b-cluster-input
      v-if="hasClusterFilter"
      v-model="cluster_id"
      :return-object="false"
      background-color="transparent"
      class="max-w-400"
      clearable
      flat
      hide-details
      icon="workspaces_outline"
      no-home
      placeholder="*.*"
      show-settings-button
      title="Filter articles by resources cluster."
      variant="solo"
    ></b-cluster-input>

    <v-spacer></v-spacer>

    <v-text-field
      v-if="hasSearch"
      v-model="search"
      :label="$t('global.commons.search')"
      class="max-width-field"
      clearable
      hide-details
      prepend-inner-icon="search"
      single-line
      variant="plain"
    ></v-text-field>
  </v-row>

  <!-- ━━━━━━━━━━━━━━━━━━━━━━━━ List ━━━━━━━━━━━━━━━━━━━━━━━━ -->

  <v-data-table-server
    v-model:items-per-page="itemsPerPage"
    v-model:options="options"
    v-model:page="page"
    :class="{ disabled: busy_fetch }"
    :header-props="{ sortByText: $t('global.commons.sort_by') }"
    :headers="headers"
    :items="articles"
    :items-length="totalItems"
    :loading-text="$t('admin_shop.blogs.list.waiting_message')"
    :mobile="$vuetify.display.xs"
    :row-props="
      (_data) => {
        return { class: 'row-hover' };
      }
    "
    class="s--blogs-list-table"
    density="compact"
    item-key="id"
    @click:row="
      (_, r) =>
        $router.push({
          name: 'BPageShopBlogsEdit',
          params: { blog_id: r.item.parent_id },
        })
    "
  >
    <!--  ▀▀▀▀▀▀▀▀▀▀▀▀▀▀ Empty View ▀▀▀▀▀▀▀▀▀▀▀▀▀▀ -->

    <template v-slot:no-data>
      <div v-if="!busy_fetch && !search" class="py-5 usn fadeIn">
        <img
          :src="require('../../../assets/guides/blog-empty.png')"
          class="m-3 op-0-3"
          width="85%"
        />
        <h2 class="text-h4 font-weight-thin">Write blog posts here...</h2>
      </div>
      <div v-else class="text-center px-3 py-5">
        <v-icon class="me-1">sentiment_dissatisfied</v-icon>
        {{ $t("global.commons.no_data") }}
      </div>
    </template>
    <!--  ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀ -->

    <template v-slot:header.power>
      <v-icon size="small">thumb_up</v-icon>
    </template>
    <template v-slot:header.comments_count>
      <v-icon size="small">mode_comment</v-icon>
    </template>
    <template v-slot:header.views>
      <v-icon size="small">leaderboard</v-icon>
    </template>

    <template v-slot:item.image="{ item }">
      <template
        v-if="$vuetify.display.smAndDown && item.parent?.category?.icon"
      >
        <u-avatar-folder
          :caption="item.parent.category.category"
          :src="item.parent.category.icon?getShopImagePath(item.parent.category.icon):undefined"
          class="my-1"
          is-amber
          side-icon="devices_fold"
          elevated
        >
        </u-avatar-folder>

        <img
          class="mx-2"
          height="12"
          src="../../../assets/icons/wire.svg"
          width="12"
        />
      </template>

      <v-avatar
        class="rounded-18px my-1 hover-scale-small"
        color="#ccc"
        size="62"
        variant="outlined"
      >
        <v-img v-if="item.image" :src="getShopImagePath(item.image, 128)" cover>
          <template v-slot:placeholder>
            <s-image-placeholder></s-image-placeholder>
          </template>
        </v-img>
        <v-icon v-else color="#ccc" size="x-large">document_scanner</v-icon>
      </v-avatar>
    </template>

    <template v-slot:item.title="{ item }">
      <div class="min-width-200 max-w-300 py-1">
        {{ item.title }}
      </div>
    </template>

    <template v-slot:item.user_id="{ item }">
      <b-user-box :user="item.user" small></b-user-box>
    </template>

    <template v-slot:item.parent_id="{ item }">
      <u-avatar-folder
        v-if="item.parent?.category?.icon"
        :caption="item.parent.category.category"
        :src="item.parent.category.icon?getShopImagePath(item.parent.category.icon):undefined"
        class="my-1"
        is-amber
        side-icon="devices_fold"
        elevated
      >
      </u-avatar-folder>
    </template>

    <template v-slot:item.power="{ item }">
      {{ numeralFormat(item.power, "0.[0] a") }}
    </template>

    <template v-slot:item.comments_count="{ item }">
      <v-badge
        :content="item.new_comments_count"
        :model-value="item.new_comments_count > 0"
        color="red"
        inline
      >
        <span class="pa-1">{{
          numeralFormat(item.comments_count, "0.[0] a")
        }}</span>
      </v-badge>
    </template>

    <template v-if="$vuetify.display.mdAndUp" v-slot:item.views="{ item }">
      {{ numeralFormat(item.views, "0.[0] a") }}
    </template>
    <template v-else v-slot:item.views="{ item }">
      <div class="min-width-250 text-center d-flex justify-end">
        <v-chip class="ma-1" color="#fff" size="small" variant="flat">
          <v-icon start>favorite</v-icon>
          {{ numeralFormat(item.like, "0.[0] a") }}
        </v-chip>

        <v-chip
          class="ma-1 position-relative"
          color="#fff"
          size="small"
          variant="flat"
        >
          <v-icon start>chat_bubble</v-icon>

          {{ numeralFormat(item.comments_count, "0.[0] a") }}

          <v-sheet
            v-if="item.new_comments_count > 0"
            class="me-n2 ms-2"
            color="red"
            min-width="20"
            rounded="circle"
          >
            {{ item.new_comments_count }}
          </v-sheet>
        </v-chip>
        <v-chip class="ma-1" color="#fff" size="small" variant="flat">
          <v-icon start>visibility</v-icon>
          {{ numeralFormat(item.views, "0.[0] a") }}
        </v-chip>
      </div>
    </template>

    <template v-slot:item.published="{ item }">
      <div class="d-flex justify-space-around flex-md-column text-center">
        <v-chip
          :color="item.published ? 'green' : '#FFA000'"
          :prepend-icon="
            item.published ? 'fa:fas fa-rss' : 'fa:fas fa-pencil-ruler'
          "
          :text="
            item.published
              ? $t('admin_shop.blogs.list.published')
              : $t('admin_shop.blogs.list.draft')
          "
          class="ma-1"
          size="x-small"
        >
        </v-chip>

        <v-chip
          :color="item.private ? 'red' : 'primary'"
          :prepend-icon="
            item.private ? 'fa:fas fa-user-lock' : 'fa:fas fa-globe'
          "
          :text="
            item.private
              ? $t('admin_shop.blogs.list.private')
              : $t('admin_shop.blogs.list.public')
          "
          class="ma-1"
          size="x-small"
        >
        </v-chip>

        <v-chip
          v-if="item.schedule_at"
          :text="getLocalTimeString(item.schedule_at)"
          class="ma-1"
          color="#673AB7"
          prepend-icon="watch_later"
          size="x-small"
        >
        </v-chip>
      </div>
    </template>

    <template v-slot:item.updated_at="{ item }">
      <div class="min-width-150 py-1">
        <v-icon class="me-1" size="small">fa:fas fa-feather</v-icon>
        {{ getFromNowString(item.updated_at) }}
        <small class="d-block">
          {{ getLocalTimeString(item.updated_at) }}
        </small>
      </div>
      <div
        v-if="item.schedule_at"
        :title="`Schedule for ${getLocalTimeString(item.schedule_at)}`"
        class="min-width-150 py-1"
      >
        <v-icon class="me-1" color="red" size="small">schedule_send</v-icon>
        {{ getFromNowString(item.schedule_at) }}
        <small class="d-block">
          {{ getLocalTimeString(item.schedule_at) }}
        </small>
      </div>
    </template>

    <template v-slot:item.action="{ item }">
      <v-btn
        :icon="$vuetify.display.mdAndUp"
        :to="{
          name: window.$storefront.routes.SHOP_BLOG_PAGE,
          params: { shop_name: shop.name, blog_id: item.parent_id },
        }"
        class="my-1"
        color="primary"
        target="_blank"
        variant="text"
        @click.stop
      >
        <template v-if="$vuetify.display.mdAndUp">
          <v-icon size="small">open_in_new</v-icon>
          <div class="tnt absolute-bottom-center x-small" style="bottom: 0px">
            {{$t('global.actions.open')}}
          </div>
        </template>
        <template v-else>
          {{ $vuetify.display.mdAndUp ? "" : "Open Blog Page" }}
          <v-icon end>open_in_new</v-icon>
        </template>
      </v-btn>
    </template>

    <template v-slot:bottom>
      <v-pagination v-model="page" :length="pageCount" rounded />
    </template>
  </v-data-table-server>
</template>

<script>
import BClusterInput from "../../cluster/input/BClusterInput.vue";
import _ from "lodash-es";
import SImagePlaceholder from "../../../ui/image/placeholder/SImagePlaceholder.vue";
import UAvatarFolder from "../../../ui/avatar/folder/UAvatarFolder.vue";
import BUserBox from "../../user/box/BUserBox.vue";

export default {
  name: "BBlogsList",
  components: { BUserBox, UAvatarFolder, SImagePlaceholder, BClusterInput },
  props: {
    shop: {
      required: true,
      type: Object,
    },
    hasClusterFilter: {
      default: true,
      type: Boolean,
    },
    hasSearch: {
      default: true,
      type: Boolean,
    },
  },
  data: () => ({
    // ―――――――― 🗘 Sync endless list. ――――――――
    busy_fetch: false,

    articles: [],

    search: "",
    cluster_id: null,

    // Pagination:
    page: 1,
    itemsPerPage: 10,
    totalItems: 0,
    options: {},
  }),

  computed: {
    pageCount() {
      return Math.ceil(this.totalItems / this.itemsPerPage);
    },

    headers() {
      return [
        {
          title: "",
          align: "center",
          sortable: false,
          value: "image",
          width: 100,
          nowrap: true,
        },
        {
          title: this.$t("admin_shop.blogs.list.table.title"),
          align: "start",
          sortable: false,
          value: "title",
        },
        {
          title: this.$t("admin_shop.blogs.list.table.author"),
          align: "center",
          sortable: true,
          value: "user_id",
        },

        ...(this.$vuetify.display.mdAndUp
          ? [
              {
                title: this.$t("global.commons.category"),
                align: "center",
                sortable: true,
                value: "parent_id",
              },

              {
                title: this.$t("admin_shop.blogs.list.table.claps"),
                align: "center",
                value: "power",
                sortable: true,
              },
              /*  {
                title: this.$t("admin_shop.blogs.list.table.like"),
                align: "center",
                value: "like",
                sortable: true,
              },*/
              {
                title: this.$t("admin_shop.blogs.list.table.comments"),
                align: "center",
                value: "comments_count",
                sortable: true,
              },
              {
                title: this.$t("admin_shop.blogs.list.table.views"),
                align: "center",
                value: "views",
                sortable: true,
              },
            ]
          : [
              {
                title: this.$t("global.commons.feedback"),
                align: "center",
                value: "views",
                sortable: true,
              },
            ]),

        {
          title: this.$t("admin_shop.blogs.list.table.publish_state"),
          align: "center",
          value: "published",
          sortable: true,
        },
        {
          title: this.$t("admin_shop.blogs.list.table.updated_at"),
          align: "start",
          value: "updated_at",
          sortable: true,
        },

        {
          title: "",
          align: "center",
          sortable: false,
          value: "action",
        },
      ];
    },
  },

  watch: {
    // Pagination:
    options: {
      handler() {
        const { sortBy, page, itemsPerPage } = this.options;
        const sort = sortBy[0];
        this.fetchArticles(page, sort?.key, sort?.order);
      },
      deep: true,
    },
    search: _.throttle(function (newVal, oldVal) {
      this.page = 1;
      const { sortBy, page, itemsPerPage } = this.options;
      const sort = sortBy[0];
      this.fetchArticles(this.page, sort?.key, sort?.order);
    }, window.SERACH_THROTTLE),

    cluster_id() {
      this.page = 1;
      const { sortBy, page, itemsPerPage } = this.options;
      const sort = sortBy[0];
      this.fetchArticles(1, sort?.key, sort?.order);
    },
  },

  created() {},

  methods: {
    fetchArticles(page, sortBy, sortDesc = true) {
      this.busy_fetch = true;

      const handleSuccessResponse = ({ articles, total }) => {
        this.totalItems = total;
        this.articles = articles;
      };

      window.$backoffice.blog
        .optimize(60)
        .cancellation(true)

        .list(this.shop.id, (page - 1) * this.itemsPerPage, this.itemsPerPage, {
          search: this.search,

          sortBy: sortBy,
          sortDesc: sortDesc,

          cluster_id: this.cluster_id, // Filter by resource cluster
        })
        .cache(handleSuccessResponse)
        .then(handleSuccessResponse)
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_fetch = false;
        });
    },
  },
};
</script>

<style lang="scss" scoped>
.s--blogs-list-table {
  min-height: 60vh;
  margin: 0 8px;
  background-color: transparent;
}
</style>
