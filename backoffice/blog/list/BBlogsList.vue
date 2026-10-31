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
  <div
    class="b-blogs-list s-table-loading text-start"
    :class="{ 'b-blogs-list--modern': modern }"
    :aria-busy="busy_fetch"
  >
    <u-loading-progress v-if="busy_fetch"></u-loading-progress>

    <v-row
      v-if="hasClusterFilter || hasSearch"
      class="b-blogs-list__tools"
      no-gutters
    >
      <!-- ━━━━━━━━━━━━━━━━━━━━━━━━ 🆑 Cluster Filter ━━━━━━━━━━━━━━━━━━━━━━━━ -->
      <b-cluster-input
        v-if="hasClusterFilter"
        v-model="cluster_id"
        :return-object="false"
        background-color="transparent"
        class="b-blogs-list__cluster"
        clearable
        flat
        hide-details
        icon="workspaces_outline"
        no-home
        :placeholder="modern ? $t('global.commons.cluster') : '*.*'"
        :single-line="modern"
        show-settings-button
        :title="$t('admin_shop.blogs.list.modern.cluster_filter')"
        :variant="modern ? 'plain' : 'solo'"
        :menu-props="
          modern
            ? { contentClass: 'sd-modern-select-menu text-start' }
            : undefined
        "
      ></b-cluster-input>

      <v-spacer></v-spacer>

      <v-text-field
        v-if="hasSearch"
        v-model="search"
        :placeholder="$t('global.commons.search')"
        class="b-blogs-list__search"
        clearable
        hide-details
        prepend-inner-icon="search"
        single-line
        variant="plain"
      ></v-text-field>
    </v-row>

    <div
      v-if="modern && $vuetify.display.width <= 760"
      class="b-blogs-list__mobile-sort"
    >
      <v-select
        :model-value="sortBy[0]?.key || 'updated_at'"
        :items="sortOptions"
        :label="$t('global.commons.sort_by')"
        variant="plain"
        hide-details
        single-line
        :menu-props="{ contentClass: 'sd-modern-select-menu text-start' }"
        @update:model-value="toggleSort($event)"
      />
      <v-btn
        class="sd-modern-icon-button b-blogs-list__icon-button"
        icon
        variant="text"
        :aria-label="$t('global.commons.sort_by')"
        @click="toggleSort(sortBy[0]?.key || 'updated_at')"
      >
        <v-icon
          :icon="sortBy[0]?.order === 'asc' ? 'arrow_upward' : 'arrow_downward'"
          size="15"
          aria-hidden="true"
        />
        <v-tooltip
          activator="parent"
          content-class="sd-modern-tooltip text-start"
          location="top"
          :open-on-focus="true"
          >{{ $t("global.commons.sort_by") }}</v-tooltip
        >
      </v-btn>
    </div>

    <div v-if="category" class="b-blogs-list__category-filter" role="status">
      <span>{{ $t("global.commons.category") }}:</span>
      <span class="b-blogs-list__filter-name">{{ category.category }}</span>
      <v-tooltip
        :text="$t('admin_shop.blogs.list.modern.clear_category')"
        content-class="sd-modern-tooltip text-start"
        location="top"
        :open-on-focus="true"
      >
        <template #activator="{ props }">
          <v-btn
            v-bind="props"
            class="sd-modern-icon-button b-blogs-list__icon-button"
            icon
            variant="text"
            :aria-label="$t('admin_shop.blogs.list.modern.clear_category')"
            @click="filterCategory(null)"
            ><v-icon icon="close" size="15" aria-hidden="true"
          /></v-btn>
        </template>
      </v-tooltip>
    </div>

    <div
      v-if="fetch_error"
      class="sd-modern-notice b-blogs-list__error"
      role="alert"
    >
      <v-icon icon="error_outline" size="18" aria-hidden="true" />
      <span>{{ $t("admin_shop.blogs.list.modern.load_error") }}</span>
      <v-btn
        class="sd-modern-button sd-modern-button--inline"
        variant="text"
        @click="refreshArticles"
      >
        {{ $t("global.actions.refresh") }}
        <v-tooltip
          activator="parent"
          content-class="sd-modern-tooltip text-start"
          location="top"
          >{{ $t("global.actions.refresh") }}</v-tooltip
        >
      </v-btn>
    </div>

    <!-- ━━━━━━━━━━━━━━━━━━━━━━━━ List ━━━━━━━━━━━━━━━━━━━━━━━━ -->

    <v-data-table-server
      v-model:items-per-page="itemsPerPage"
      v-model:options="options"
      v-model:page="page"
      v-model:sort-by="sortBy"
      :class="{ disabled: busy_fetch, 'sd-modern-data-table': modern }"
      :header-props="{ sortByText: $t('global.commons.sort_by') }"
      :headers="headers"
      :items="fetch_error ? [] : articles"
      :items-length="totalItems"
      :loading-text="$t('admin_shop.blogs.list.waiting_message')"
      :loading="busy_fetch"
      :mobile="modern ? $vuetify.display.width <= 760 : $vuetify.display.xs"
      :hide-default-header="modern && $vuetify.display.width <= 760"
      :row-props="
        (_data) => {
          return { class: 'row-hover' };
        }
      "
      class="s--blogs-list-table"
      density="compact"
      item-key="id"
      hide-default-footer
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
        <div
          v-if="modern && !busy_fetch && !fetch_error"
          class="sd-modern-empty-state b-blogs-list__empty"
        >
          <v-icon
            :icon="hasFilters ? 'search_off' : 'edit_note'"
            size="25"
            aria-hidden="true"
          />
          <h2>
            {{
              $t(
                hasFilters
                  ? "admin_shop.blogs.list.modern.no_results"
                  : "admin_shop.blogs.list.modern.empty_title",
              )
            }}
          </h2>
          <p>
            {{
              $t(
                hasFilters
                  ? "admin_shop.blogs.list.modern.no_results_description"
                  : "admin_shop.blogs.list.modern.empty_description",
              )
            }}
          </p>
          <v-btn
            v-if="hasFilters"
            class="sd-modern-button sd-modern-button--inline"
            variant="text"
            @click="clearFilters"
          >
            {{ $t("admin_shop.blogs.list.modern.clear_filters") }}
            <v-tooltip
              activator="parent"
              content-class="sd-modern-tooltip text-start"
              location="top"
              >{{ $t("admin_shop.blogs.list.modern.clear_filters") }}</v-tooltip
            >
          </v-btn>
        </div>
        <div
          v-else-if="!modern && !busy_fetch && !search"
          class="py-5 usn fadeIn"
        >
          <img
            :src="require('../../../assets/guides/blog-empty.png')"
            class="m-3 op-0-3"
            width="85%"
          />
          <h2 class="text-h4 font-weight-thin">Write blog posts here...</h2>
        </div>
        <div
          v-else-if="!busy_fetch && !fetch_error"
          class="text-center px-3 py-5"
        >
          <v-icon class="me-1">sentiment_dissatisfied</v-icon>
          {{ $t("global.commons.no_data") }}
        </div>
      </template>
      <!--  ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀ -->

      <template v-if="modern" v-slot:header.title>
        <button
          type="button"
          class="b-blogs-list__category-sort b-blogs-list__title-heading"
          :aria-pressed="sortBy[0]?.key === 'title'"
          @click.stop="toggleSort('title')"
        >
          {{ $t("admin_shop.blogs.list.table.title") }}
          <v-icon
            v-if="sortBy[0]?.key === 'title'"
            :icon="
              sortBy[0].order === 'asc' ? 'arrow_upward' : 'arrow_downward'
            "
            size="12"
            aria-hidden="true"
          />
          <v-tooltip
            activator="parent"
            content-class="sd-modern-tooltip text-start"
            location="top"
            >{{ $t("global.commons.sort_by") }}:
            {{ $t("admin_shop.blogs.list.table.title") }}</v-tooltip
          >
        </button>
        <button
          type="button"
          class="b-blogs-list__category-sort"
          :aria-pressed="sortBy[0]?.key === 'parent_id'"
          @click.stop="toggleSort('parent_id')"
        >
          / {{ $t("global.commons.category") }}
          <v-icon
            v-if="sortBy[0]?.key === 'parent_id'"
            :icon="
              sortBy[0].order === 'asc' ? 'arrow_upward' : 'arrow_downward'
            "
            size="12"
          />
          <v-tooltip
            activator="parent"
            content-class="sd-modern-tooltip text-start"
            location="top"
            >{{ $t("global.commons.sort_by") }}:
            {{ $t("global.commons.category") }}</v-tooltip
          >
        </button>
      </template>

      <template v-if="modern" v-slot:header.activity>
        <div class="b-blogs-list__activity-head">
          <v-tooltip
            v-for="metric in metrics"
            :key="metric.key"
            :text="$t('global.commons.sort_by') + ': ' + metric.title"
            content-class="sd-modern-tooltip text-start"
            location="top"
            :open-on-focus="true"
          >
            <template #activator="{ props }">
              <button
                v-bind="props"
                type="button"
                class="sd-modern-icon-button b-blogs-list__metric-sort"
                :aria-label="$t('global.commons.sort_by') + ': ' + metric.title"
                :aria-pressed="sortBy[0]?.key === metric.key"
                @click.stop="toggleSort(metric.key)"
              >
                <v-icon :icon="metric.icon" size="13" aria-hidden="true" />
                <v-icon
                  v-if="sortBy[0]?.key === metric.key"
                  :icon="
                    sortBy[0].order === 'asc'
                      ? 'arrow_upward'
                      : 'arrow_downward'
                  "
                  size="10"
                  aria-hidden="true"
                />
              </button>
            </template>
          </v-tooltip>
        </div>
      </template>

      <template v-slot:header.power>
        <v-icon size="small">thumb_up</v-icon>
      </template>
      <template v-slot:header.comments_count>
        <v-icon size="small">mode_comment</v-icon>
      </template>
      <template v-slot:header.views>
        <v-icon size="small">leaderboard</v-icon>
      </template>

      <template v-slot:item.title="{ item }">
        <div v-if="modern" class="b-blogs-list__article">
          <v-img
            v-if="item.image"
            :src="getShopImagePath(item.image, 128)"
            class="b-blogs-list__cover"
            width="42"
            height="48"
            cover
            alt=""
          />
          <span
            v-else
            class="b-blogs-list__cover b-blogs-list__cover--empty"
            aria-hidden="true"
            ><v-icon icon="article" size="19"
          /></span>
          <div class="b-blogs-list__article-copy">
            <v-tooltip
              :text="$t('admin_shop.blogs.list.modern.edit_article')"
              content-class="sd-modern-tooltip text-start"
              location="top"
              :open-on-focus="true"
            >
              <template #activator="{ props }">
                <router-link
                  v-bind="props"
                  :to="{
                    name: 'BPageShopBlogsEdit',
                    params: { blog_id: item.parent_id },
                  }"
                  class="b-blogs-list__article-link"
                  @click.stop
                  >{{ item.title }}</router-link
                >
              </template>
            </v-tooltip>
            <v-tooltip
              v-if="item.parent?.category"
              :text="
                $t('admin_shop.blogs.list.modern.filter_category', {
                  category: item.parent.category.category,
                })
              "
              content-class="sd-modern-tooltip text-start"
              location="top"
              :open-on-focus="true"
            >
              <template #activator="{ props }">
                <button
                  v-bind="props"
                  type="button"
                  class="b-blogs-list__category"
                  :aria-pressed="category?.id === item.parent.category.id"
                  @click.stop="filterCategory(item.parent.category)"
                >
                  <u-avatar-folder
                    v-if="item.parent.category.icon"
                    :src="getShopImagePath(item.parent.category.icon, 64)"
                    :size="20"
                    :border-size="2"
                    hide-side-icon
                    is-gray
                    aria-hidden="true"
                    class="b-blogs-list__category-image"
                  />
                  <v-icon
                    v-else
                    icon="folder_open"
                    size="12"
                    aria-hidden="true"
                  />
                  <span>{{ item.parent.category.category }}</span>
                </button>
              </template>
            </v-tooltip>
          </div>
        </div>
        <div v-else class="min-width-200 max-w-300 py-1 d-flex align-center">
          <u-avatar-folder
            class="rounded-18px"
            color="#ccc"
            :size="62"
            is-gray
            :src="getShopImagePath(item.image, 128)"
            placeholder-icon="document_scanner"
            elevated
            side-icon="edit_note"
          >
          </u-avatar-folder>

          <template
            v-if="$vuetify.display.smAndDown && item.parent?.category?.icon"
          >
            <img
              class="mx-2"
              height="12"
              src="../../../assets/icons/wire.svg"
              width="12"
            />
            <u-avatar-folder
              :caption="item.parent.category.category"
              :src="
                item.parent.category.icon
                  ? getShopImagePath(item.parent.category.icon)
                  : undefined
              "
              :size="62"
              is-amber
              side-icon="devices_fold"
              elevated
            >
            </u-avatar-folder>
          </template>

          <div v-if="!$vuetify.display.smAndDown" class="ms-2">
            {{ item.title }}
          </div>
        </div>
        <div v-if="!modern && $vuetify.display.smAndDown" class="text-start">
          {{ item.title }}
        </div>
      </template>

      <template v-slot:item.user_id="{ item }">
        <div class="b-blogs-list__author d-flex align-center text-start w-100">
          <v-tooltip
            v-if="modern && item.user"
            :text="
              [item.user.name, item.user.email].filter(Boolean).join(' · ')
            "
            content-class="sd-modern-tooltip text-start"
            location="top"
            :open-on-focus="true"
          >
            <template #activator="{ props }">
              <b-user-box
                v-bind="props"
                :user="item.user"
                class="b-blogs-list__author-identity me-2"
                small
              />
            </template>
          </v-tooltip>
          <b-user-box
            v-else
            :user="item.user"
            class="b-blogs-list__author-identity me-2"
            small
          />
          <b-blog-author-edit
            :shop="shop"
            :article="item"
            :modern="modern"
            class="ms-auto flex-shrink-0"
          />
        </div>
      </template>

      <template v-if="modern" v-slot:item.activity="{ item }">
        <div class="b-blogs-list__activity">
          <span v-for="metric in metrics" :key="metric.key">
            <span class="b-blogs-list__mobile-label">{{ metric.title }}</span>
            {{ numeralFormat(item[metric.key], "0.[0] a") }}
            <span
              v-if="
                metric.key === 'comments_count' && item.new_comments_count > 0
              "
              class="b-blogs-list__new-comments"
              >{{
                $t("admin_shop.blogs.list.modern.new_comments", {
                  count: item.new_comments_count,
                })
              }}</span
            >
          </span>
        </div>
      </template>

      <template v-slot:item.parent_id="{ item }">
        <u-avatar-folder
          v-if="item.parent?.category?.icon"
          :caption="item.parent.category.category"
          :src="
            item.parent.category.icon
              ? getShopImagePath(item.parent.category.icon)
              : undefined
          "
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
        <div v-if="modern" class="b-blogs-list__states">
          <span
            class="sd-modern-status sd-modern-status--plain b-blogs-list__state"
          >
            <span
              class="sd-modern-status__dot"
              :class="
                item.published
                  ? 'sd-modern-status__dot--success'
                  : 'sd-modern-status__dot--warning'
              "
              aria-hidden="true"
            />
            {{
              $t(
                item.published
                  ? "admin_shop.blogs.list.published"
                  : "admin_shop.blogs.list.draft",
              )
            }}
          </span>
          <span class="b-blogs-list__visibility"
            ><v-icon
              :icon="item.private ? 'lock_outline' : 'public'"
              size="11"
              aria-hidden="true"
            />{{
              $t(
                item.private
                  ? "admin_shop.blogs.list.private"
                  : "admin_shop.blogs.list.public",
              )
            }}</span
          >
          <span v-if="item.schedule_at" class="b-blogs-list__schedule"
            ><v-icon icon="schedule_send" size="12" aria-hidden="true" />{{
              getLocalTimeStringSmall(item.schedule_at)
            }}</span
          >
        </div>
        <div
          v-else
          class="d-flex justify-space-around flex-md-column text-center"
        >
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
            variant="tonal"
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
            variant="tonal"
          >
          </v-chip>

          <v-chip
            v-if="item.schedule_at"
            :text="getLocalTimeString(item.schedule_at)"
            class="ma-1"
            color="#673AB7"
            prepend-icon="watch_later"
            size="x-small"
            variant="tonal"
          >
          </v-chip>
        </div>
      </template>

      <template v-slot:item.updated_at="{ item }">
        <div v-if="modern" class="b-blogs-list__updated">
          <span>{{ getFromNowString(item.updated_at) }}</span>
          <small>{{ getLocalTimeStringSmall(item.updated_at) }}</small>
          <small v-if="item.schedule_at" class="b-blogs-list__scheduled-date"
            ><v-icon icon="schedule_send" size="12" aria-hidden="true" />{{
              getFromNowString(item.schedule_at)
            }}</small
          >
        </div>
        <div v-else class="min-width-150 py-1">
          <v-icon class="me-1" size="small">fa:fas fa-feather</v-icon>
          {{ getFromNowString(item.updated_at) }}
          <small class="d-block">
            {{ getLocalTimeString(item.updated_at) }}
          </small>
        </div>
        <div
          v-if="!modern && item.schedule_at"
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
        <v-tooltip
          v-if="modern"
          :text="$t('admin_shop.blogs.list.modern.open_storefront')"
          content-class="sd-modern-tooltip text-start"
          location="top"
          :open-on-focus="true"
        >
          <template #activator="{ props }">
            <v-btn
              v-bind="props"
              :to="{
                name: window.$storefront.routes.SHOP_BLOG_PAGE,
                params: { shop_name: shop.name, blog_id: item.parent_id },
              }"
              class="sd-modern-icon-button b-blogs-list__icon-button b-blogs-list__open"
              icon
              variant="text"
              target="_blank"
              rel="noopener"
              :aria-label="$t('admin_shop.blogs.list.modern.open_storefront')"
              @click.stop
              ><v-icon icon="open_in_new" size="15" aria-hidden="true"
            /></v-btn>
          </template>
        </v-tooltip>
        <v-btn
          v-else
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
              {{ $t("global.actions.open") }}
            </div>
          </template>
          <template v-else>
            {{ $vuetify.display.mdAndUp ? "" : "Open Blog Page" }}
            <v-icon end>open_in_new</v-icon>
          </template>
        </v-btn>
      </template>

      <template v-slot:bottom>
        <div
          v-if="modern && !fetch_error"
          class="sd-modern-table-footer b-blogs-list__footer"
        >
          <p aria-live="polite">
            {{
              $t("admin_shop.blogs.list.modern.page_range", {
                start: totalItems ? (page - 1) * itemsPerPage + 1 : 0,
                end: Math.min(page * itemsPerPage, totalItems),
                total: totalItems,
              })
            }}
          </p>
          <v-pagination
            v-if="pageCount > 1"
            v-model="page"
            :length="pageCount"
            :total-visible="$vuetify.display.width < 400 ? 2 : 5"
            class="sd-modern-pagination"
          />
        </div>
        <v-pagination
          v-else-if="!modern"
          v-model="page"
          :length="pageCount"
          rounded
        />
      </template>
    </v-data-table-server>
  </div>
</template>

<script lang="ts">
import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

import BClusterInput from "../../cluster/input/BClusterInput.vue";
import { throttle } from "lodash-es";
import UAvatarFolder from "../../../ui/avatar/folder/UAvatarFolder.vue";
import BUserBox from "../../user/box/BUserBox.vue";
import DateMixin from "@selldone/components-vue/mixin/date/DateMixin.ts";
import BBlogAuthorEdit from "../author/BBlogAuthorEdit.vue";

export default {
  name: "BBlogsList",
  mixins: [DateMixin],
  components: { BBlogAuthorEdit, BUserBox, UAvatarFolder, BClusterInput },
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
    modern: { type: Boolean, default: false },
  },
  data: () => ({
    // ―――――――― 🗘 Sync endless list. ――――――――
    busy_fetch: false,
    fetch_error: false,
    request_id: 0,

    articles: [],

    search: "",
    cluster_id: null,
    category: null,

    // Pagination:
    page: 1,
    itemsPerPage: 10,
    totalItems: 0,
    options: {},
    sortBy: [],
  }),

  computed: {
    hasFilters() {
      return !!(this.search || this.cluster_id || this.category);
    },
    metrics() {
      return [
        {
          key: "power",
          icon: "thumb_up_off_alt",
          title: this.$t("admin_shop.blogs.list.table.claps"),
        },
        {
          key: "comments_count",
          icon: "chat_bubble_outline",
          title: this.$t("admin_shop.blogs.list.table.comments"),
        },
        {
          key: "views",
          icon: "bar_chart",
          title: this.$t("admin_shop.blogs.list.table.views"),
        },
      ];
    },
    sortOptions() {
      return [
        {
          title: this.$t("admin_shop.blogs.list.table.title"),
          value: "title",
        },
        {
          title: this.$t("admin_shop.blogs.list.table.updated_at"),
          value: "updated_at",
        },
        {
          title: this.$t("admin_shop.blogs.list.table.author"),
          value: "user_id",
        },
        { title: this.$t("global.commons.category"), value: "parent_id" },
        {
          title: this.$t("admin_shop.blogs.list.table.publish_state"),
          value: "published",
        },
        ...this.metrics.map((metric) => ({
          title: metric.title,
          value: metric.key,
        })),
      ];
    },
    pageCount() {
      return Math.ceil(this.totalItems / this.itemsPerPage);
    },

    headers() {
      if (this.modern)
        return [
          {
            title: this.$t("admin_shop.blogs.list.table.title"),
            key: "title",
            align: "start",
            sortable: false,
            width: "31%",
          },
          {
            title: this.$t("admin_shop.blogs.list.table.author"),
            key: "user_id",
            align: "start",
            sortable: true,
            width: "21%",
          },
          {
            title: this.$t("global.commons.feedback"),
            key: "activity",
            align: "center",
            sortable: false,
            width: "13%",
          },
          {
            title: this.$t("admin_shop.blogs.list.table.publish_state"),
            key: "published",
            align: "start",
            sortable: true,
            width: "14%",
          },
          {
            title: this.$t("admin_shop.blogs.list.table.updated_at"),
            key: "updated_at",
            align: "start",
            sortable: true,
            width: "14%",
          },
          {
            title: this.$t("global.actions.open"),
            key: "action",
            align: "end",
            sortable: false,
            width: "7%",
          },
        ];
      return [
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
        this.refreshArticles();
      },
      deep: true,
    },
    search: throttle(function (newVal, oldVal) {
      this.page = 1;
      this.refreshArticles();
    }, window.SERACH_THROTTLE),

    cluster_id() {
      this.page = 1;
      this.refreshArticles();
    },
    "shop.id"() {
      this.request_id++;
      this.category = null;
      this.articles = [];
      this.totalItems = 0;
      this.page = 1;
      this.refreshArticles();
    },
  },

  created() {
    if (this.modern) this.sortBy = [{ key: "updated_at", order: "desc" }];
  },

  beforeUnmount() {
    this.request_id++;
  },

  methods: {
    toggleSort(key) {
      this.page = 1;
      this.sortBy = [
        {
          key,
          order:
            this.sortBy[0]?.key === key && this.sortBy[0]?.order === "desc"
              ? "asc"
              : "desc",
        },
      ];
    },
    filterCategory(category) {
      this.category = category;
      this.page = 1;
      this.refreshArticles();
    },
    clearFilters() {
      this.search = "";
      this.cluster_id = null;
      this.category = null;
      this.page = 1;
      this.refreshArticles();
    },
    refreshArticles() {
      const sort = this.sortBy[0];
      this.fetchArticles(this.page, sort?.key, sort?.order);
    },
    fetchArticles(page, sortBy, sortDesc: boolean | string = true) {
      const request = ++this.request_id;
      this.busy_fetch = true;
      this.fetch_error = false;

      const handleSuccessResponse = ({ articles, total }) => {
        if (request !== this.request_id) return;
        this.totalItems = total;
        this.articles = articles;
      };

      window.$backoffice.blog
        .optimize(60)
        .cancellation(true)

        .list(this.shop.id, (page - 1) * this.itemsPerPage, this.itemsPerPage, {
          search: this.search,

          sortBy: sortBy,
          sortDesc: sortDesc === true || sortDesc === "desc",

          cluster_id: this.cluster_id, // Filter by resource cluster
          category_id: this.category?.id, // Filter before server pagination.
        })
        .cache(handleSuccessResponse)
        .then(handleSuccessResponse)
        .catch((error) => {
          if (request !== this.request_id) return;
          this.fetch_error = true;
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          if (request !== this.request_id) return;
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

.b-blogs-list--modern {
  font-family: inherit;
  font-size: 13px;
  line-height: 1.5;

  .s--blogs-list-table {
    --v-table-header-height: 40px;
    --v-table-row-height: 68px;
    min-height: 0;
    margin: 0;
    font-size: 13px;
  }

  .b-blogs-list__tools {
    align-items: center;
    gap: 14px;
    margin-block-end: 13px;
  }

  .b-blogs-list__cluster {
    flex: 0 1 260px;
    max-width: 300px;
  }
  .b-blogs-list__search {
    flex: 0 1 240px;
    max-width: 240px;
  }

  .b-blogs-list__tools :deep(.v-field) {
    font-family: inherit;
    font-size: 13px;
    line-height: 20px;
    --v-field-input-padding-top: 8px;
    --v-field-input-padding-bottom: 8px;
    --v-field-padding-start: 0px;
    --v-field-padding-end: 0px;
  }

  .b-blogs-list__tools :deep(.v-field__input) {
    min-height: 40px;
    padding-block: 8px;
    font-size: 13px;
    line-height: 20px;
  }
  .b-blogs-list__tools :deep(.v-label) {
    font-size: 13px;
    line-height: 20px;
  }
  .b-blogs-list__tools :deep(.v-field__prepend-inner > .v-icon) {
    font-size: 17px;
  }
  .b-blogs-list__tools :deep(.v-field__prepend-inner > .v-avatar) {
    width: 24px !important;
    height: 24px !important;
  }
  .b-blogs-list__tools :deep(.v-field__prepend-inner > .v-avatar .v-icon) {
    font-size: 17px;
  }
  .b-blogs-list__tools :deep(.v-field__prepend-inner) {
    padding-block-start: 8px;
    align-self: center;
  }
  .b-blogs-list__tools :deep(.v-field__append-inner) {
    padding-block-start: 8px;
    align-self: center;
  }

  :deep(.v-table__wrapper > table) {
    table-layout: fixed;

    > thead > tr > th,
    > tbody > tr > td {
      padding: 10px 7px;
    }

    > tbody > tr > td {
      font-family: inherit;
      font-size: 13px;
      font-weight: 400;
      line-height: 1.5;
    }

    > thead > tr > th:first-child,
    > tbody > tr > td:first-child {
      padding-inline-start: 12px;
    }
    > thead > tr > th:last-child,
    > tbody > tr > td:last-child {
      padding-inline-end: 12px;
    }
    > thead > tr > th:last-child .v-data-table-header__content {
      font-size: 0;
    }
    > tbody > tr:hover {
      background: var(--sd-modern-inset);
    }
  }

  .b-blogs-list__article {
    display: flex;
    align-items: center;
    gap: 11px;
    min-width: 0;
  }
  .b-blogs-list__cover {
    flex: 0 0 42px;
    border: 1px solid var(--sd-modern-border);
    border-radius: 7px;
  }
  .b-blogs-list__cover--empty {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 42px;
    height: 48px;
    background: var(--sd-modern-inset);
    color: var(--sd-modern-muted);
  }
  .b-blogs-list__article-copy {
    min-width: 0;
  }
  .b-blogs-list__article-link {
    display: inline-block;
    color: rgb(var(--v-theme-on-surface));
    font-family: inherit;
    font-size: 13px;
    font-weight: 500;
    line-height: 18px;
    overflow-wrap: anywhere;
    text-decoration: none;
  }
  .b-blogs-list__article-link:hover {
    color: rgb(var(--v-theme-primary));
  }
  .b-blogs-list__category {
    display: flex;
    align-items: center;
    gap: 5px;
    max-width: 100%;
    margin-block-start: 4px;
    padding: 0;
    border: 0;
    background: transparent;
    color: var(--sd-modern-muted);
    font: inherit;
    font-size: 11px;
    line-height: 16px;
    text-align: start;
  }
  .b-blogs-list__category span {
    overflow-wrap: anywhere;
  }
  .b-blogs-list__category:hover,
  .b-blogs-list__category[aria-pressed="true"] {
    color: rgb(var(--v-theme-primary));
  }
  .b-blogs-list__category-image {
    flex-shrink: 0;
  }
  .b-blogs-list__category-sort {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    border: 0;
    background: transparent;
    font: inherit;
    letter-spacing: inherit;
    text-transform: inherit;
    color: inherit;
    text-align: start;
  }
  .b-blogs-list__title-heading {
    white-space: nowrap;
  }
  .b-blogs-list__author {
    gap: 7px;
    min-width: 0;
  }
  .b-blogs-list__author-identity {
    min-width: 0;
    flex: 1;
    gap: 7px;
    margin: 0 !important;
    padding: 0 !important;
  }
  .b-blogs-list__author-identity :deep(.v-avatar) {
    width: 27px !important;
    height: 27px !important;
    min-width: 27px;
    margin: 0 !important;
    flex: 0 0 27px;
  }
  // The nested email/phone columns must shrink too, so ellipsis stays clear of Edit.
  .b-blogs-list__author-identity :deep(.flex-grow-1) {
    min-width: 0;
  }
  .b-blogs-list__author-identity :deep(b) {
    display: flex;
    align-items: center;
    font-size: 12px;
    font-weight: 500;
    line-height: 18px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .b-blogs-list__author-identity :deep(.b-user-box__name) {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .b-blogs-list__author-identity :deep(b .v-icon) {
    font-size: 12px;
    flex-shrink: 0;
  }
  .b-blogs-list__author-identity :deep(.small) {
    font-size: 11px;
    line-height: 17px;
  }
  .b-blogs-list__author-identity :deep(.small .py-1) {
    padding-block: 0 !important;
    display: block;
    max-width: 100%;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  .b-blogs-list__activity,
  .b-blogs-list__activity-head {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 4px;
    text-align: center;
    font-size: 12px;
    font-variant-numeric: tabular-nums;
  }
  .b-blogs-list__activity > span {
    min-width: 0;
  }
  .b-blogs-list__activity-head {
    justify-items: center;
  }
  .b-blogs-list__metric-sort {
    --sd-modern-icon-button-size: 28px;
    gap: 2px;
    border-radius: 8px;
  }
  .b-blogs-list__new-comments {
    display: block;
    font-size: 11px;
    color: rgb(var(--v-theme-primary));
  }
  .b-blogs-list__states {
    display: grid;
    justify-items: start;
    gap: 0;
  }
  .b-blogs-list__state {
    gap: 6px;
    min-height: 0;
    padding: 0;
    font-size: 11px;
    font-weight: 400;
    line-height: 18px;
    white-space: nowrap;
  }
  .b-blogs-list__state .sd-modern-status__dot {
    width: 5px;
    height: 5px;
    flex: 0 0 5px;
  }
  .b-blogs-list__visibility {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 11px;
    line-height: 18px;
    color: var(--sd-modern-muted);
  }
  .b-blogs-list__schedule {
    display: flex;
    align-items: baseline;
    gap: 4px;
    font-size: 11px;
    line-height: 16px;
    color: var(--sd-modern-muted);
    overflow-wrap: anywhere;
  }
  .b-blogs-list__updated {
    font-size: 12px;
    line-height: 18px;
  }
  .b-blogs-list__updated small {
    display: block;
    color: var(--sd-modern-muted);
    font-size: 11px;
    font-weight: 400;
    line-height: 16px;
    overflow-wrap: anywhere;
  }
  .b-blogs-list__scheduled-date {
    margin-block-start: 3px;
  }
  .b-blogs-list__icon-button {
    --sd-modern-icon-button-size: 32px;
    border-radius: 8px;
  }
  .b-blogs-list__icon-button :deep(.v-icon) {
    font-size: 15px;
  }
  .b-blogs-list__footer {
    padding-block: 17px;
    font-size: 11px;
    line-height: 17px;
    color: var(--sd-modern-muted);
  }
  .b-blogs-list__footer p {
    font-size: 11px;
    line-height: 17px;
  }
  .b-blogs-list__category-filter {
    display: flex;
    align-items: center;
    gap: 7px;
    flex-wrap: wrap;
    margin-block-end: 13px;
    font-size: 12px;
    color: var(--sd-modern-muted);
  }
  .b-blogs-list__filter-name {
    color: rgb(var(--v-theme-on-surface));
    overflow-wrap: anywhere;
  }
  .b-blogs-list__error {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 10px;
    margin-block-end: 14px;
    font-size: 13px;
  }
  .b-blogs-list__empty {
    padding: 54px 20px;
    gap: 0;
  }
  .b-blogs-list__empty h2 {
    margin: 14px 0 5px;
    font-family: inherit;
    font-size: 16px;
    font-weight: 500;
    line-height: 23px;
  }
  .b-blogs-list__empty p {
    margin: 0 0 14px;
    color: var(--sd-modern-muted);
    font-size: 13px;
    line-height: 20px;
  }
  .b-blogs-list__mobile-label {
    display: none;
  }

  .b-blogs-list__article-link:focus-visible,
  .b-blogs-list__category:focus-visible,
  .b-blogs-list__category-sort:focus-visible,
  .b-blogs-list__metric-sort:focus-visible {
    outline: 2px solid rgb(var(--v-theme-primary));
    outline-offset: 3px;
    border-radius: 3px;
  }
}

@media (max-width: 760px) {
  .b-blogs-list--modern {
    .b-blogs-list__tools {
      gap: 4px 14px;
    }
    .b-blogs-list__cluster {
      flex-basis: 220px;
    }
    .b-blogs-list__search {
      flex: 1 1 130px;
    }
    .b-blogs-list__mobile-sort {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-block-end: 12px;
      max-width: 100%;
    }
    .b-blogs-list__mobile-sort :deep(.v-field__input),
    .b-blogs-list__mobile-sort :deep(.v-label) {
      font-size: 13px;
      line-height: 20px;
    }
    :deep(.v-table__wrapper > table > tbody > .v-data-table__tr--mobile) {
      border-block-start: 1px solid var(--sd-modern-border);
    }
    :deep(.v-table__wrapper > table > tbody > .v-data-table__tr--mobile > td) {
      grid-template-columns: minmax(68px, 0.3fr) minmax(0, 1fr);
      gap: 10px;
      padding: 7px 0;
      border: 0;
    }
    :deep(
      .v-table__wrapper
        > table
        > tbody
        > .v-data-table__tr--mobile
        > td:first-child
    ) {
      grid-template-columns: minmax(0, 1fr);
      padding-block-start: 17px;
    }
    :deep(
      .v-data-table__tr--mobile > td:first-child > .v-data-table__td-title
    ) {
      display: none;
    }
    :deep(.v-data-table__tr--mobile > td:last-child) {
      padding-block-end: 17px !important;
    }
    :deep(
      .v-data-table__tr--mobile > td:nth-child(3) > .v-data-table__td-title
    ) {
      display: none;
    }
    :deep(.v-data-table__tr--mobile .v-data-table__td-value) {
      text-align: start;
    }
    .b-blogs-list__article-link {
      font-size: 14px;
      line-height: 20px;
    }
    .b-blogs-list__category {
      min-height: 44px;
      font-size: 12px;
    }
    .b-blogs-list__activity {
      display: flex;
      flex-wrap: wrap;
      gap: 8px 14px;
      text-align: start;
    }
    .b-blogs-list__activity > span {
      display: inline-flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 5px;
    }
    .b-blogs-list__mobile-label {
      display: inline;
      color: var(--sd-modern-muted);
      font-size: 11px;
    }
    .b-blogs-list__states {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 6px 14px;
    }
    .b-blogs-list__state,
    .b-blogs-list__visibility,
    .b-blogs-list__schedule {
      font-size: 12px;
    }
    .b-blogs-list__icon-button {
      --sd-modern-icon-button-size: 44px;
    }
    .b-blogs-list__footer {
      gap: 10px;
    }
  }
}

@media (max-width: 480px) {
  .b-blogs-list--modern {
    .b-blogs-list__cluster {
      max-width: 100%;
      flex: 1 1 100%;
    }
    .b-blogs-list__search {
      max-width: none;
      flex: 1 1 100%;
    }
    .b-blogs-list__tools > .v-spacer {
      display: none;
    }
    .b-blogs-list__tools :deep(.v-field__input),
    .b-blogs-list__mobile-sort :deep(.v-field__input) {
      font-size: 16px;
      min-height: 44px;
    }
    :deep(.v-table__wrapper > table > tbody > .v-data-table__tr--mobile > td) {
      grid-template-columns: minmax(0, 1fr);
      gap: 5px;
    }
  }
}

@media (pointer: coarse) {
  .b-blogs-list--modern {
    .b-blogs-list__icon-button {
      --sd-modern-icon-button-size: 44px;
    }
    .b-blogs-list__metric-sort {
      --sd-modern-icon-button-size: 44px;
    }
    .b-blogs-list__activity-head {
      grid-template-columns: repeat(auto-fit, minmax(44px, 1fr));
    }
    .b-blogs-list__category,
    .b-blogs-list__category-sort,
    .b-blogs-list__metric-sort {
      min-height: 44px;
    }
    .b-blogs-list__tools :deep(.v-field__input) {
      font-size: 16px;
    }
  }
}
</style>
