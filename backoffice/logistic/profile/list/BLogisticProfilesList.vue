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
  <div :class="{ 'b-logistic-profiles-list--modern text-start': modern }">
    <v-row :class="{ 'b-logistic-profiles-list__toolbar': modern }" no-gutters>
      <v-spacer></v-spacer>
      <v-text-field
        v-model="search"
        :placeholder="$t('global.commons.search')"
        :aria-label="$t('global.commons.search')"
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
      :mobile="modern ? $vuetify.display.smAndDown : $vuetify.display.xs"
      :row-props="
        (_data) => {
          return { class: 'row-hover' };
        }
      "
      class="bg-transparent"
      :class="modern ? 'sd-modern-data-table sd-modern-data-table--compact' : 'min-height-60vh'"
      :density="modern ? 'compact' : undefined"
      hide-default-footer
      item-key="id"
      @click:row="(_, r) => select(r.item)"
    >
      <!--  ▀▀▀▀▀▀▀▀▀▀▀▀▀▀ Empty View ▀▀▀▀▀▀▀▀▀▀▀▀▀▀ -->
      <template v-slot:no-data>
        <div v-if="!busy_fetch" :class="modern ? 'sd-modern-empty-state' : 'py-5 usn text-center fadeIn'">
          <img
            :src="require('../../../../assets/guides/logistic-profiles.png')"
            class="m-3 op-0-3"
            :style="modern ? 'width: 96px; max-height: 96px; object-fit: contain' : 'max-height: 400px; object-fit: contain; width: 85%'"
            alt=""
          />
          <h2 :class="modern ? 'b-logistic-profiles-list__empty-title' : 'text-h4 font-weight-thin'">{{ modern ? $t('shop_logistic_profiles.subtitle') : 'List of logistic profiles...' }}</h2>
        </div>
        <div v-else class="text-center px-3 py-5 text-muted">
          <v-icon class="me-1">sentiment_dissatisfied</v-icon>
          {{ $t("global.commons.no_data") }}
        </div>
      </template>
      <!--  ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀ -->

      <template v-slot:item.type="{ item }">
        <v-icon class="me-1"> {{ LogisticProfileType[item.type].icon }}</v-icon>
        <span :class="{ 'font-weight-bold': !modern }">{{ $t(LogisticProfileType[item.type].title) }}</span>
      </template>

      <template v-slot:item.info.languages="{ item }">
        <template v-if="item.info && Array.isArray(item.info.languages)">
          <span v-for="lng in item.info.languages" :key="lng" class="pa-1" :class="{ 'font-weight-bold': !modern }">{{
            getLanguageName(lng)
          }}</span>
        </template>
      </template>

      <template v-slot:item.name="{ item }">
        <router-link
          v-if="modern"
          class="b-logistic-profiles-list__name"
          :to="{ name: 'LogisticProfilePage_Dashboard', params: { profile_id: item.id } }"
          @click.stop
        >{{ item.name }}</router-link>
        <template v-else>{{ item.name }}</template>
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
        <div :class="modern ? 'b-logistic-profiles-list__updated' : 'min-width-200'">
          {{ getFromNowString(item.updated_at) }}<br />
          <small>
            {{ getLocalTimeString(item.updated_at) }}
          </small>
        </div>
      </template>

      <template v-slot:bottom>
        <div :class="{ 'sd-modern-table-footer b-logistic-profiles-list__footer': modern }">
          <span v-if="modern" class="sd-modern-page-summary">{{ $t("global.commons.page") }} <bdi>{{ $n(pageCount ? page : 0) }} / {{ $n(pageCount) }}</bdi></span>
          <v-pagination v-model="page" :length="pageCount" :class="{ 'sd-modern-pagination': modern }" :rounded="modern ? undefined : true" />
        </div>
      </template>
    </v-data-table-server>
  </div>
</template>

<script lang="ts">
import { LogisticProfileType } from "@selldone/core-js/enums/logistic/LogisticProfileType";
import { throttle } from "lodash-es";
import DateMixin from "@selldone/components-vue/mixin/date/DateMixin.ts";

import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

export default {
  name: "BLogisticProfilesList",
  mixins: [DateMixin ],
  components: {},
  props: {
    modern: Boolean,
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
            return NotificationService.showErrorAlert(null.error_msg);
          }

          this.profiles = data.profiles;
          this.totalItems = data.total;
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
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

<style lang="scss" scoped>
.b-logistic-profiles-list--modern {
  .b-logistic-profiles-list__toolbar { margin: 0; padding: 12px 18px; border-block-end: 1px solid var(--sd-modern-border); }
  .b-logistic-profiles-list__footer { justify-content: flex-end; padding: 14px 18px; }
  .b-logistic-profiles-list__updated { min-width: 150px; }
  .b-logistic-profiles-list__name { color: inherit; font-weight: 500; text-decoration: none; }
  .b-logistic-profiles-list__name:focus-visible { outline: 2px solid rgb(var(--v-theme-primary)); outline-offset: 4px; }
  .b-logistic-profiles-list__empty-title { max-width: 540px; margin: 0; font-size: 14px; font-weight: 400; line-height: 1.6; }
  :deep(.b-logistic-profiles-list__toolbar .v-field__input) { font-size: 12px; }
  :deep(.v-data-table__td-value > .v-icon) { font-size: 18px; }
}
@media (max-width: 599px) {
  .b-logistic-profiles-list--modern {
    .b-logistic-profiles-list__toolbar { padding-inline: 14px; }
    :deep(.b-logistic-profiles-list__toolbar .v-field__input) { font-size: 16px; }
  }
}
</style>
