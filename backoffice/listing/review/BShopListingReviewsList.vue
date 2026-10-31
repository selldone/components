<!--
  - Copyright (c) 2026. Selldone® Business OS™
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
    v-bind="$attrs"
    :class="
      modern
        ? 'b-listing-reviews sd-modern-content text-start'
        : 'widget-box -large mb-5'
    "
  >
    <header v-if="modern" class="sd-modern-header b-listing-reviews__header">
      <div class="sd-modern-title">
        <v-icon
          class="sd-modern-icon sd-modern-icon--plain"
          size="25"
          aria-hidden="true"
          >rate_review</v-icon
        >
        <div>
          <h1 class="sd-modern-title-text">
            {{ $t("shop_listing.modern.reviews_title") }}
          </h1>
          <p class="sd-modern-subtitle">
            {{ $t("shop_listing.modern.reviews_subtitle") }}
          </p>
        </div>
      </div>
      <v-btn
        variant="outlined"
        class="sd-modern-button"
        prepend-icon="refresh"
        :loading="busy_fetch"
        @click="refresh"
        >{{ $t("global.actions.refresh") }}</v-btn
      >
    </header>
    <template v-else>
      <u-widget-header
        title="Reviews"
        icon="rate_review"
        :add-caption="$t('global.actions.refresh')"
        @click:add="refresh"
        addText
      >
      </u-widget-header>

      <v-list-subheader>
        Manage listing reviews, reply as the owner/vendor, and remove spam.
      </v-list-subheader>
    </template>

    <div
      class="s-table-loading"
      :class="modern ? 'sd-modern-widget b-listing-reviews__widget' : undefined"
      :aria-busy="busy_fetch"
    >
      <!-- Filters -->
      <div
        :class="
          modern
            ? 'sd-modern-list-toolbar b-listing-reviews__toolbar'
            : 'd-flex flex-wrap align-center gap-2 mb-2'
        "
      >
        <v-select
          v-model="filter_status"
          :items="statusOptions"
          item-title="title"
          item-value="value"
          :label="modern ? $t('global.commons.status') : 'Status'"
          :variant="modern ? 'plain' : 'solo'"
          :single-line="modern"
          bg-color="transparent"
          density="comfortable"
          hide-details
          class="max-w-220"
          clearable
          flat
        />

        <v-select
          v-model="filter_has_answer"
          :items="answerOptions"
          item-title="title"
          item-value="value"
          :label="modern ? $t('shop_listing.modern.answer') : 'Answer'"
          :variant="modern ? 'plain' : 'solo'"
          :single-line="modern"
          bg-color="transparent"
          density="comfortable"
          hide-details
          class="max-w-220"
          clearable
          flat
        />

        <v-text-field
          v-model="search"
          :placeholder="$t('global.commons.search')"
          :prepend-icon="modern ? undefined : 'search'"
          :prepend-inner-icon="modern ? 'search' : undefined"
          :aria-label="$t('global.commons.search')"
          :variant="modern ? 'plain' : 'solo'"
          bg-color="transparent"
          hide-details
          :class="modern ? 'b-listing-reviews__search' : 'max-width-field-mini'"
          clearable
          flat
          single-line
        />

        <u-smart-menu
          v-model:with-trashed="with_trashed"
          :class="modern ? undefined : 'ms-auto'"
          has-with-trashed
          :modern="modern"
        />
      </div>

      <u-loading-progress v-if="busy_fetch" />

      <v-data-table-server
        :mobile="modern ? $vuetify.display.smAndDown : $vuetify.display.xs"
        :hide-default-header="modern && $vuetify.display.smAndDown"
        v-model:options="options"
        v-model:page="page"
        v-model:sort-by="sortBy"
        :headers="headers"
        :items="reviews"
        :items-length="totalItems"
        :items-per-page="itemsPerPage"
        :class="
          modern
            ? 'sd-modern-data-table b-listing-reviews__table'
            : 'bg-transparent mb-2 min-height-60vh'
        "
        :loading="modern && busy_fetch"
        :aria-busy="busy_fetch"
        :row-props="
          modern
            ? ({ item }) => ({
                class: 'sd-modern-clickable-item',
                tabindex: 0,
                onKeydown: (event) => {
                  if (
                    event.target === event.currentTarget &&
                    ['Enter', ' '].includes(event.key)
                  ) {
                    event.preventDefault();
                    openDialog(item);
                  }
                },
              })
            : undefined
        "
        density="compact"
        hide-default-footer
        @click:row="(_, r) => openDialog(r.item)"
      >
        <template v-slot:no-data>
          <div
            v-if="modern && !busy_fetch"
            class="sd-modern-empty-state"
            role="status"
          >
            <v-icon size="38" aria-hidden="true">rate_review</v-icon>
            <h2>
              {{
                $t(
                  search ||
                    (filter_status && filter_status !== "all") ||
                    filter_has_answer ||
                    with_trashed
                    ? "shop_listing.modern.no_results"
                    : "shop_listing.modern.reviews_empty_title",
                )
              }}
            </h2>
            <p class="sd-modern-muted">
              {{
                $t(
                  search ||
                    (filter_status && filter_status !== "all") ||
                    filter_has_answer ||
                    with_trashed
                    ? "shop_listing.modern.no_results_hint"
                    : "shop_listing.modern.reviews_empty_hint",
                )
              }}
            </p>
          </div>
          <template v-else-if="!modern">
            <div
              v-if="!busy_fetch && !search"
              class="py-5 usn text-center fadeIn"
            >
              <v-icon size="64" class="op-0-3">rate_review</v-icon>
              <h2 class="text-h5 font-weight-thin mt-2">No reviews</h2>
              <div class="text-muted mt-2">
                Reviews submitted by users will appear here.
              </div>
            </div>

            <div v-else class="text-center px-3 py-5 text-muted">
              <v-icon class="me-1">sentiment_dissatisfied</v-icon>
              {{ $t("global.commons.no_data") }}
            </div>
          </template>
        </template>

        <!-- REVIEW COLUMN (with avatar) -->
        <template v-slot:item.review="{ item }">
          <div class="min-width-260 py-1">
            <div class="d-flex align-start">
              <v-avatar size="32" class="me-2 mt-1">
                <img
                  v-if="getReviewUserId(item)"
                  :src="getUserAvatar(getReviewUserId(item))"
                  alt="avatar"
                />
                <v-icon v-else>person</v-icon>
              </v-avatar>

              <div class="flex-grow-1 min-w-0">
                <div class="d-flex align-center justify-space-between gap-2">
                  <div
                    :class="
                      modern
                        ? 'font-weight-medium text-truncate'
                        : 'font-weight-black text-truncate'
                    "
                  >
                    {{ item.user?.name || "User" }}
                  </div>

                  <v-rating
                    :model-value="Number(item.rating || 0)"
                    readonly
                    density="compact"
                    half-increments
                  />
                </div>

                <div v-if="item.title" class="text-truncate mt-1">
                  {{ item.title }}
                </div>

                <small class="d-block lhn text-muted">
                  {{ (item.content || "").toString().limitWords(14) }}
                </small>
              </div>
            </div>
          </div>
        </template>

        <template v-slot:item.item="{ item }">
          <div class="min-width-240 py-1">
            <div
              :class="
                modern
                  ? 'font-weight-medium text-truncate'
                  : 'font-weight-black text-truncate'
              "
            >
              {{ item.item?.title || `Item #${item.item_id}` }}
            </div>

            <v-chip
              v-if="item.item?.category?.title"
              size="x-small"
              variant="tonal"
              label
              class="mt-1"
              :prepend-avatar="
                item.item.category.icon
                  ? getShopImagePath(item.item.category.icon)
                  : undefined
              "
            >
              {{ item.item.category.title }}
            </v-chip>
          </div>
        </template>

        <template v-slot:item.status="{ item }">
          <template v-if="modern">
            <span class="sd-modern-status sd-modern-status--plain">
              <span
                class="sd-modern-status__dot"
                :class="
                  item.deleted_at
                    ? 'sd-modern-status__dot--error'
                    : item.is_approved
                      ? 'sd-modern-status__dot--success'
                      : 'sd-modern-status__dot--warning'
                "
                aria-hidden="true"
              />
              {{
                item.deleted_at
                  ? $t("global.commons.removed")
                  : $t(
                      item.is_approved
                        ? "shop_listing.modern.statuses.approved"
                        : "shop_listing.modern.statuses.pending",
                    )
              }}
            </span>
            <span
              v-if="item.answer"
              class="sd-modern-status sd-modern-status--plain d-flex mt-1"
              ><span
                class="sd-modern-status__dot sd-modern-status__dot--success"
                aria-hidden="true"
              />{{ $t("shop_listing.modern.replied") }}</span
            >
          </template>
          <template v-else>
            <v-chip
              size="x-small"
              label
              :variant="item.deleted_at ? 'outlined' : 'tonal'"
              :class="statusClass(item)"
            >
              {{
                item.deleted_at
                  ? "Removed"
                  : item.is_approved
                    ? "Approved"
                    : "Pending"
              }}
            </v-chip>

            <v-chip
              v-if="item.answer"
              size="x-small"
              label
              variant="tonal"
              class="mt-1"
            >
              Replied
            </v-chip>
          </template>
        </template>

        <template v-slot:item.created_at="{ item }">
          <div class="min-width-180">
            {{ getFromNowString(item.created_at) }}
            <br />
            <small class="text-muted">{{
              getLocalTimeString(item.created_at)
            }}</small>
          </div>
        </template>

        <template v-slot:item.menu="{ item }">
          <u-smart-menu
            :loading="busy_action_id === item.id"
            :items="menuItems(item)"
            :modern="modern"
          />
        </template>

        <template v-slot:bottom>
          <div v-if="modern" class="sd-modern-table-footer">
            <span class="sd-modern-page-summary"
              >{{ $t("global.commons.total") }}: {{ $n(totalItems) }}</span
            >
            <v-pagination
              v-model="page"
              :length="Math.max(1, pageCount)"
              :disabled="busy_fetch || !pageCount"
              class="sd-modern-pagination"
            />
          </div>
          <v-pagination v-else v-model="page" :length="pageCount" rounded />
        </template>
      </v-data-table-server>
    </div>

    <!-- Dialog (also auto-switches API/VAPI) -->
    <b-shop-listing-review-dialog
      v-model="dialog"
      :review="selected_review"
      @updated="onReviewUpdated"
    />
  </div>
</template>

<script lang="ts">
import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";
import { throttle } from "lodash-es";
import DateMixin from "@selldone/components-vue/mixin/date/DateMixin.ts";
import USmartMenu from "@selldone/components-vue/ui/smart/menu/USmartMenu.vue";
import BShopListingReviewDialog from "@selldone/components-vue/backoffice/listing/review/dialog/BShopListingReviewDialog.vue";

export default {
  name: "BShopListingReviewsList",
  mixins: [DateMixin],

  inject: ["$shop"],

  components: {
    USmartMenu,
    BShopListingReviewDialog,
  },

  props: { modern: Boolean },

  data: () => ({
    reviews: [] as any[],
    totalItems: 0,

    busy_fetch: false,
    busy_action_id: null as number | null,

    // filters
    search: "",
    with_trashed: false,
    filter_status: "all" as string | null,
    filter_has_answer: null as string | null, // "true" | "false" | null

    // pagination/sort
    page: 1,
    itemsPerPage: 12,
    options: {} as any,
    sortBy: [{ key: "created_at", order: "desc" }] as any[],

    // dialog
    dialog: false,
    selected_review: null as any | null,
  }),

  computed: {
    shop(): any {
      return (this as any).$shop;
    },

    /*🟢 Vendor Panel 🟢*/
    IS_VENDOR_PANEL(): boolean {
      // Standard check requested
      // @ts-ignore
      return (
        (this as any).$route?.params?.vendor_id &&
        // @ts-ignore
        (this as any).$route?.matched?.some(
          (record: any) => record?.meta?.vendor,
        )
      );
    },

    VENDOR_ID_SAFE(): number | null {
      // @ts-ignore
      const raw = (this as any).$route?.params?.vendor_id;
      const n =
        raw !== null && raw !== undefined ? parseInt(String(raw), 10) : 0;
      return n > 0 ? n : null;
    },

    pageCount(): number {
      return Math.ceil((this.totalItems || 0) / this.itemsPerPage);
    },

    statusOptions(): any[] {
      return [
        {
          title: this.modern ? this.$t("global.commons.all") : "All",
          value: "all",
        },
        {
          title: this.modern
            ? this.$t("shop_listing.modern.statuses.approved")
            : "Approved",
          value: "approved",
        },
        {
          title: this.modern
            ? this.$t("shop_listing.modern.statuses.pending")
            : "Pending",
          value: "pending",
        },
      ];
    },

    answerOptions(): any[] {
      return [
        {
          title: this.modern ? this.$t("global.commons.all") : "All",
          value: null,
        },
        {
          title: this.modern
            ? this.$t("shop_listing.messages.has_reply_yes")
            : "Has reply",
          value: "true",
        },
        {
          title: this.modern
            ? this.$t("shop_listing.messages.has_reply_no")
            : "No reply",
          value: "false",
        },
      ];
    },

    headers(): any[] {
      return [
        {
          title: this.modern ? this.$t("shop_listing.modern.review") : "Review",
          align: "start",
          sortable: false,
          value: "review",
        },
        {
          title: this.modern ? this.$t("shop_listing.messages.item") : "Item",
          align: "start",
          sortable: false,
          value: "item",
        },
        {
          title: this.modern ? this.$t("global.commons.status") : "Status",
          align: "center",
          sortable: true,
          value: "status",
        },
        {
          title: this.modern ? this.$t("global.sort.created_at") : "Created",
          align: "start",
          sortable: true,
          value: "created_at",
        },
        { title: "", align: "center", sortable: false, value: "menu" },
      ];
    },
  },

  watch: {
    options: {
      handler() {
        const sortKey = this.options?.sortBy?.[0]?.key || "created_at";
        const sortDesc = this.options?.sortBy?.[0]?.order === "desc";
        const page = this.options?.page || 1;
        this.fetchReviews(page, sortKey, sortDesc);
      },
      deep: true,
    },

    search: throttle(
      function () {
        this.page = 1;
        this.refresh();
      },
      (window as any).SERACH_THROTTLE || 600,
    ),

    with_trashed() {
      this.page = 1;
      this.refresh();
    },

    filter_status() {
      this.page = 1;
      this.refresh();
    },

    filter_has_answer() {
      this.page = 1;
      this.refresh();
    },
  },

  methods: {
    getReviewUserId(r: any): number | null {
      const id = r?.user?.id ?? r?.user_id ?? null;
      const n = id !== null && id !== undefined ? parseInt(String(id), 10) : 0;
      return n > 0 ? n : null;
    },

    refresh() {
      const sortKey = this.options?.sortBy?.[0]?.key || "created_at";
      const sortDesc = this.options?.sortBy?.[0]?.order === "desc";
      this.fetchReviews(this.page || 1, sortKey, sortDesc);
    },

    statusClass(item: any) {
      if (item?.deleted_at) return "text-red";
      return item?.is_approved ? "text-success" : "text-warning";
    },

    fetchReviews(page: number, sortBy: string, sortDesc: boolean) {
      const shopId = this.shop?.id;
      const vendorId = this.VENDOR_ID_SAFE;

      if (!this.IS_VENDOR_PANEL && !shopId) return;
      if (this.IS_VENDOR_PANEL && !vendorId) return;

      this.busy_fetch = true;

      const url = this.IS_VENDOR_PANEL
        ? // ✅ Vendor endpoint
          window.VAPI.GET_MY_VENDOR_LISTING_REVIEWS(vendorId)
        : // ✅ Backoffice endpoint
          window.API.GET_SHOP_LISTING_REVIEWS(shopId);

      axios
        .get(url, {
          params: {
            offset: (page - 1) * this.itemsPerPage,
            limit: this.itemsPerPage,
            sortBy,
            sortDesc: sortDesc ? "true" : "false",

            search: (this.search || "").trim() || null,
            status: this.filter_status || "all",
            has_answer: this.filter_has_answer,

            with_trashed: this.with_trashed ? "true" : "false",
          },
        })
        .then(({ data }) => {
          if (data?.error) {
            NotificationService.showErrorAlert(null, data.error_msg);
            return;
          }
          this.reviews = Array.isArray(data.reviews) ? data.reviews : [];
          this.totalItems =
            parseInt(String(data.total || 0), 10) || this.reviews.length;
        })
        .catch((error) => NotificationService.showLaravelError(error))
        .finally(() => (this.busy_fetch = false));
    },

    openDialog(review: any) {
      this.selected_review = review;
      this.dialog = true;
    },

    onReviewUpdated(updated: any) {
      if (!updated) {
        this.refresh();
        return;
      }

      const id = updated?.id ? updated.id : this.selected_review?.id;
      if (!id) {
        this.refresh();
        return;
      }

      const i = this.reviews.findIndex((x) => x?.id === id);
      if (i >= 0) this.reviews.splice(i, 1, { ...this.reviews[i], ...updated });
      else this.refresh();
    },

    menuItems(item: any) {
      const isDeleted = !!item?.deleted_at;
      const approved = !!item?.is_approved;

      // Vendor panel: no approve/reject moderation
      if (this.IS_VENDOR_PANEL) {
        return [
          {
            title: "Open",
            icon: "visibility",
            click: () => this.openDialog(item),
          },

          ...(isDeleted
            ? [
                {
                  title: this.$t("global.actions.restore"),
                  icon: "settings_backup_restore",
                  click: () => this.restoreReview(item),
                },
              ]
            : [
                {
                  title: "Reply",
                  icon: "reply",
                  click: () => this.openDialog(item),
                },
                {
                  title: this.$t("global.actions.delete"),
                  icon: "delete",
                  click: () => this.deleteReview(item),
                },
              ]),
        ];
      }

      // Backoffice: full actions
      return [
        {
          title: "Open",
          icon: "visibility",
          click: () => this.openDialog(item),
        },

        ...(isDeleted
          ? [
              {
                title: this.$t("global.actions.restore"),
                icon: "settings_backup_restore",
                click: () => this.restoreReview(item),
              },
            ]
          : [
              {
                title: approved ? "Reject" : "Approve",
                icon: "verified",
                click: () =>
                  approved ? this.rejectReview(item) : this.approveReview(item),
              },
              {
                title: "Reply",
                icon: "reply",
                click: () => this.openDialog(item),
              },
              {
                title: this.$t("global.actions.delete"),
                icon: "delete",
                click: () => this.deleteReview(item),
              },
            ]),
      ];
    },

    setBusy(id: number, on: boolean) {
      this.busy_action_id = on ? id : null;
    },

    approveReview(item: any) {
      const shopId = this.shop?.id;
      if (!shopId) return;

      this.setBusy(item.id, true);

      axios
        .post(window.API.POST_SHOP_LISTING_REVIEW_APPROVE(shopId, item.id))
        .then(({ data }) => {
          if (data?.error) {
            NotificationService.showErrorAlert(null, data.error_msg);
            return;
          }
          NotificationService.showSuccessAlert(null, "Approved.");
          this.refresh();
        })
        .catch((error) => NotificationService.showLaravelError(error))
        .finally(() => this.setBusy(item.id, false));
    },

    rejectReview(item: any) {
      const shopId = this.shop?.id;
      if (!shopId) return;

      this.setBusy(item.id, true);

      axios
        .post(window.API.POST_SHOP_LISTING_REVIEW_REJECT(shopId, item.id))
        .then(({ data }) => {
          if (data?.error) {
            NotificationService.showErrorAlert(null, data.error_msg);
            return;
          }
          NotificationService.showSuccessAlert(null, "Rejected.");
          this.refresh();
        })
        .catch((error) => NotificationService.showLaravelError(error))
        .finally(() => this.setBusy(item.id, false));
    },

    deleteReview(item: any) {
      const shopId = this.shop?.id;
      const vendorId = this.VENDOR_ID_SAFE;

      const url = this.IS_VENDOR_PANEL
        ? window.VAPI.DELETE_MY_VENDOR_LISTING_REVIEW(vendorId, item.id)
        : window.API.DELETE_SHOP_LISTING_REVIEW(shopId, item.id);

      if (!url) return;

      NotificationService.openDangerAlert(
        "Delete review",
        "Delete this review?",
        "Delete",
        () => {
          this.setBusy(item.id, true);

          axios
            .delete(url)
            .then(({ data }) => {
              if (data?.error) {
                NotificationService.showErrorAlert(null, data.error_msg);
                return;
              }
              NotificationService.showSuccessAlert(null, "Deleted.");
              this.refresh();
            })
            .catch((error) => NotificationService.showLaravelError(error))
            .finally(() => this.setBusy(item.id, false));
        },
      );
    },

    restoreReview(item: any) {
      const shopId = this.shop?.id;
      const vendorId = this.VENDOR_ID_SAFE;

      const url = this.IS_VENDOR_PANEL
        ? window.VAPI.POST_MY_VENDOR_LISTING_REVIEW_RESTORE(vendorId, item.id)
        : window.API.POST_SHOP_LISTING_REVIEW_RESTORE(shopId, item.id);

      if (!url) return;

      this.setBusy(item.id, true);

      axios
        .post(url)
        .then(({ data }) => {
          if (data?.error) {
            NotificationService.showErrorAlert(null, data.error_msg);
            return;
          }
          NotificationService.showSuccessAlert(null, "Restored.");
          this.refresh();
        })
        .catch((error) => NotificationService.showLaravelError(error))
        .finally(() => this.setBusy(item.id, false));
    },
  },
};
</script>

<style scoped>
.gap-2 {
  gap: 8px;
}
.max-w-220 {
  max-width: 220px;
}
.b-listing-reviews {
  width: 100%;
}
.b-listing-reviews__header {
  margin-block-end: 24px;
}
.b-listing-reviews__header .sd-modern-title-text {
  font-size: 24px;
  font-weight: 500;
  line-height: 32px;
  letter-spacing: -0.4px;
}
.b-listing-reviews__widget {
  padding: 16px 22px 0;
  border-radius: 16px;
}
.b-listing-reviews__toolbar {
  flex-wrap: wrap;
}
.b-listing-reviews__toolbar .max-w-220 {
  flex: 0 1 155px;
  max-width: 155px;
  min-width: 0;
}
.b-listing-reviews__search {
  flex: 0 1 190px;
  max-width: 190px;
  min-width: 0;
  margin-inline-start: auto;
}
.b-listing-reviews__table :deep(.min-width-260) {
  min-width: 210px;
}
.b-listing-reviews__table :deep(.min-width-240) {
  min-width: 180px;
}
.b-listing-reviews__table :deep(.min-width-180) {
  min-width: 150px;
}
.b-listing-reviews__table :deep(.sd-modern-empty-state) {
  min-height: 290px;
}
.b-listing-reviews__table :deep(.sd-modern-empty-state h2) {
  font-size: 16px;
  font-weight: 500;
  line-height: 24px;
}
@media (max-width: 600px) {
  .b-listing-reviews__widget {
    padding-inline: 14px;
  }
  .b-listing-reviews__toolbar .max-w-220 {
    flex: 1 1 140px;
    max-width: none;
  }
  .b-listing-reviews__search {
    flex: 1 1 180px;
    max-width: none;
    margin-inline-start: 0;
  }
  .b-listing-reviews__table :deep(.min-width-260),
  .b-listing-reviews__table :deep(.min-width-240),
  .b-listing-reviews__table :deep(.min-width-180) {
    min-width: 0 !important;
    width: 100%;
  }
}
</style>
