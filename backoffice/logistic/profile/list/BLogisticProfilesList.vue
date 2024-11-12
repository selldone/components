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
    <v-row no-gutters>
      <v-spacer></v-spacer>
      <v-text-field
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
    <u-loading-progress v-if="busy_fetch"></u-loading-progress>
    <v-data-table-server
      v-model:options="options"
      v-model:page="page"
      v-model:sort-by="sortBy"
      :header-props="{ sortByText: $t('global.commons.sort_by') }"
      :headers="headers"
      :items="profiles"
      :items-length="totalItems"
      :items-per-page="itemsPerPage"
      :loading-text="$t('global.commons.waiting_load_data')"
      :mobile="$vuetify.display.xs"
      :row-props="
        (_data) => {
          return { class: 'row-hover' };
        }
      "
      class="bg-transparent min-height-60vh"
      hide-default-footer
      item-key="id"
      @click:row="(_, r) => select(r.item)"
    >
      <!--  ▀▀▀▀▀▀▀▀▀▀▀▀▀▀ Empty View ▀▀▀▀▀▀▀▀▀▀▀▀▀▀ -->
      <template v-slot:no-data>
        <div v-if="!busy_fetch" class="py-5 usn text-center fadeIn">
          <img
            :src="require('../../../../assets/guides/logistic-profiles.png')"
            class="m-3 op-0-3"
            style="max-height: 400px; object-fit: contain"
            width="85%"
          />
          <h2 class="text-h4 font-weight-thin">List of logistic profiles...</h2>
        </div>
        <div v-else class="text-center px-3 py-5 text-muted">
          <v-icon class="me-1">sentiment_dissatisfied</v-icon>
          {{ $t("global.commons.no_data") }}
        </div>
      </template>
      <!--  ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀ -->

      <template v-slot:item.type="{ item }">
        <v-icon class="me-1"> {{ LogisticProfileType[item.type].icon }}</v-icon>
        <b>{{ $t(LogisticProfileType[item.type].title) }}</b>
      </template>

      <template v-slot:item.info.languages="{ item }">
        <template v-if="item.info && Array.isArray(item.info.languages)">
          <b v-for="lng in item.info.languages" :key="lng" class="pa-1">{{
            getLanguageName(lng)
          }}</b>
        </template>
      </template>

      <template v-slot:item.name="{ item }">
        {{ item.name }}
      </template>

      <template v-slot:item.user_id="{ item }">
        <v-avatar
          :size="32"
          class="hover-scale avatar-gradient -thin -user m-1"
        >
          <v-img :src="getUserAvatar(item.user_id)" />
        </v-avatar>
      </template>

      <template v-slot:item.updated_at="{ item }">
        <div class="min-width-200">
          {{ getFromNowString(item.updated_at) }}<br />
          <small>
            {{ getLocalTimeString(item.updated_at) }}
          </small>
        </div>
      </template>

      <template v-slot:bottom>
        <v-pagination v-model="page" :length="pageCount" rounded />
      </template>
    </v-data-table-server>
  </div>
</template>

<script lang="ts">
import { LogisticProfileType } from "@selldone/core-js/enums/logistic/LogisticProfileType";
import { throttle } from "lodash-es";
import DateMixin from "@selldone/components-vue/mixin/date/DateMixin.ts";

export default {
  name: "BLogisticProfilesList",
  mixins: [DateMixin],
  components: {},
  props: {
    shop: {
      required: true,
      type: Object,
    },
  },

  data: function () {
    return {
      LogisticProfileType: LogisticProfileType,
      busy_fetch: false,

      profiles: [],

      // Pagination:
      page: 1,
      itemsPerPage: 10,
      totalItems: 0,
      options: {},
      sortBy: [{ key: null, order: "desc" }],

      search: null,
    };
  },
  computed: {
    pageCount() {
      return Math.ceil(this.totalItems / this.itemsPerPage);
    },

    headers() {
      return [
        {
          title: this.$t("global.commons.type"),
          align: "start",
          sortable: true,
          value: "type",
        },

        {
          title: this.$t("global.commons.name"),
          align: "start",
          sortable: true,
          value: "name",
        },
        {
          title: this.$t("global.commons.officer"),
          align: "start",
          sortable: true,
          value: "user_id",
        },

        {
          title: this.$t("global.commons.language"),
          align: "start",
          sortable: false,
          value: "info.languages",
        },

        {
          title: this.$t("global.sort.updated_at"),
          align: "start",
          value: "updated_at",
          sortable: true,
        },
      ];
    },
  },
  watch: {
    // Pagination:
    options: {
      handler() {
        const { sortBy, page, itemsPerPage } = this.options;
        this.fetchData(page, sortBy[0]?.key, sortBy[0]?.order === "desc");
      },
      deep: true,
    },

    search: throttle(function (newVal, oldVal) {
      // console.log("this.options", this.options);
      const { sortBy, page, itemsPerPage } = this.options;
      this.page = 1;
      this.fetchData(1, sortBy[0]?.key, sortBy[0]?.order === "desc");
    }, window.SERACH_THROTTLE),
  },
  created() {},

  methods: {
    refresh() {
      const { sortBy, page, itemsPerPage } = this.options;
      this.fetchData(page, sortBy[0]?.key, sortBy[0]?.order === "desc");
    },
    fetchData(page = 0, sortBy = null, sortDesc = true) {
      this.busy_fetch = true;

      axios
        .get(window.API.GET_SHOP_LOGISTIC_PROFILES(this.shop.id), {
          params: {
            offset: (page - 1) * this.itemsPerPage,
            limit: this.itemsPerPage,
            sortBy: sortBy,
            sortDesc: sortDesc,

            search: this.search,
          },
        })
        .then(({ data }) => {
          if (data.error) {
            return this.showErrorAlert(null.error_msg);
          }

          this.profiles = data.profiles;
          this.totalItems = data.total;
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_fetch = false;
        });
    },
    select(profile) {
      this.$router.push({
        name: "LogisticProfilePage_Dashboard",
        params: {
          profile_id: profile.id,
        },
      });
    },
  },
};
</script>

<style lang="scss" scoped></style>
