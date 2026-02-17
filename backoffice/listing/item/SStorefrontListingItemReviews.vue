<template>
  <div class="text-start reviews-wrap">
    <v-card class="apple-card reviews-card" rounded="xl" variant="flat">
      <v-card-text class="pa-4 pa-sm-6">
        <div class="d-flex align-center justify-space-between flex-wrap gap-2">
          <div class="d-flex align-center">
            <v-icon class="me-2">rate_review</v-icon>
            <div class="text-subtitle-1 font-weight-bold">Reviews</div>
          </div>

          <div class="d-flex align-center">
            <v-rating
              :model-value="Number(summary.average || 0)"
              readonly
              density="compact"
              half-increments
            />
            <div class="ms-2 text-muted small">
              {{ summaryText }}
            </div>
          </div>
        </div>

        <v-divider class="my-4" />

        <u-loading-progress v-if="busy" />

        <v-alert
          v-if="error_text"
          type="error"
          variant="tonal"
          border="start"
          class="mb-4"
        >
          {{ error_text }}
        </v-alert>

        <!-- Actions -->
        <div class="d-flex align-center justify-space-between flex-wrap gap-2 mb-3">
          <div class="text-muted small">
            {{ totalText }}
          </div>

          <div class="d-flex align-center gap-2">
            <v-btn
              v-if="!my_review"
              color="black"
              variant="flat"
              size="small"
              :disabled="busy_save"
              @click="openCreateForm"
            >
              <v-icon start>edit</v-icon>
              Write a review
            </v-btn>

            <v-btn
              v-else
              variant="outlined"
              size="small"
              :disabled="busy_save"
              @click="openEditForm"
            >
              <v-icon start>edit</v-icon>
              Edit your review
            </v-btn>
          </div>
        </div>

        <!-- Horizontal scroller -->
        <div class="reviews-scroller">
          <!-- Empty card -->
          <v-card
            v-if="!busy && mergedReviews.length === 0"
            class="tile empty-tile"
            rounded="xl"
            variant="flat"
          >
            <v-card-text class="pa-4">
              <div class="d-flex align-center">
                <v-icon class="me-2 text-muted">chat_bubble_outline</v-icon>
                <div class="text-muted">No reviews yet.</div>
              </div>

              <v-btn
                class="mt-4"
                color="black"
                variant="flat"
                block
                size="small"
                :disabled="busy_save"
                @click="openCreateForm"
              >
                <v-icon start>edit</v-icon>
                Be the first to review
              </v-btn>
            </v-card-text>
          </v-card>

          <!-- Review cards -->
          <v-card
            v-for="r in mergedReviews"
            :key="`rv_${r.__id}`"
            class="tile review-tile"
            rounded="xl"
            variant="flat"
          >
            <v-card-text class="pa-4">
              <div class="d-flex align-start">
                <v-avatar size="40" class="me-3">
                  <img
                    v-if="r.user?.id"
                    :src="getUserAvatar(r.user.id)"
                    alt="avatar"
                  />
                  <v-icon v-else>person</v-icon>
                </v-avatar>

                <div class="flex-grow-1 min-w-0">
                  <div class="d-flex align-start justify-space-between gap-2">
                    <div class="min-w-0">
                      <div class="d-flex align-center flex-wrap gap-2">
                        <div class="font-weight-bold text-truncate">
                          {{ r.user?.name || "User" }}
                        </div>

                        <v-chip
                          v-if="r.is_mine"
                          size="x-small"
                          label
                          variant="tonal"
                          class="chip-mine"
                        >
                          Your review
                        </v-chip>

                        <v-chip
                          v-if="r.is_mine && r.is_approved === false"
                          size="x-small"
                          label
                          variant="tonal"
                          class="chip-pending"
                        >
                          Pending
                        </v-chip>
                      </div>

                      <div class="text-muted small mt-1">
                        {{ formatDate(r.created_at) }}
                      </div>
                    </div>

                    <!-- Edit button only for my review -->
                    <v-btn
                      v-if="r.is_mine"
                      icon
                      size="small"
                      variant="text"
                      class="ms-auto"
                      :disabled="busy_save"
                      @click.stop="openEditForm"
                      title="Edit your review"
                    >
                      <v-icon>edit</v-icon>
                    </v-btn>
                  </div>

                  <v-rating
                    :model-value="Number(r.rating || 0)"
                    readonly
                    density="compact"
                    half-increments
                    class="mt-2"
                  />

                  <div v-if="r.title" class="mt-2 font-weight-medium clamp-2">
                    {{ r.title }}
                  </div>

                  <div v-if="r.content" class="mt-1 text-muted clamp-4">
                    {{ r.content }}
                  </div>

                  <div v-if="r.answer" class="answer-box mt-3">
                    <div class="font-weight-bold mb-1">
                      Response
                      <span v-if="r.answered_at" class="text-muted small ms-2">
                        · {{ formatDate(r.answered_at) }}
                      </span>
                    </div>
                    <div class="text-muted clamp-4">
                      {{ r.answer }}
                    </div>
                  </div>
                </div>
              </div>
            </v-card-text>
          </v-card>

          <!-- Load more tile -->
          <v-card
            v-if="hasMore"
            class="tile more-tile"
            rounded="xl"
            variant="flat"
          >
            <v-card-text class="pa-4 d-flex flex-column justify-center">
              <div class="text-muted small mb-3">
                Showing {{ mergedReviews.length }} of {{ total }} reviews
              </div>

              <v-btn
                :loading="busy_more"
                variant="outlined"
                size="small"
                @click="loadMore"
              >
                Load more
              </v-btn>
            </v-card-text>
          </v-card>
        </div>
      </v-card-text>
    </v-card>

    <!-- Review Form Dialog -->
    <v-dialog v-model="form_dialog" max-width="720">
      <v-card rounded="xl">
        <v-card-title class="d-flex align-center">


          <div class="font-weight-black">
            {{ my_review ? "Edit your review" : "Write a review" }}
          </div>

          <v-spacer />

          <v-btn
            icon
            variant="text"
            :disabled="busy_save"
            @click="form_dialog = false"
          >
            <v-icon>close</v-icon>
          </v-btn>
        </v-card-title>

        <u-loading-progress v-if="busy_save" />

        <v-card-text class="text-start">
          <div class="d-flex align-center mb-3">
            <v-avatar size="36" class="me-2">
              <img
                v-if="currentUserId"
                :src="getUserAvatar(currentUserId)"
                alt="avatar"
              />
              <v-icon v-else>person</v-icon>
            </v-avatar>

            <div class="min-w-0">
              <div class="font-weight-bold text-truncate">
                {{ currentUserName }}
              </div>
              <div class="text-muted small">
                Your rating and feedback help others.
              </div>
            </div>
          </div>

          <v-divider class="mb-4" />

          <div class="text-muted small mb-1">Rating</div>
          <v-rating v-model="form.rating" half-increments />

          <v-text-field
            v-model="form.title"
            class="mt-3"
            label="Title (optional)"
            variant="underlined"
            :disabled="busy_save"
          />

          <v-textarea
            v-model="form.content"
            class="mt-2"
            label="Your review"
            variant="underlined"
            auto-grow
            rows="4"
            :disabled="busy_save"
          />

          <div class="text-muted small mt-3">
            Please keep it respectful and useful.
          </div>
        </v-card-text>

        <v-card-actions class="px-4 pb-4">
          <s-widget-buttons>
            <v-btn
              v-if="my_review"
              variant="text"
              color="red"
              :disabled="busy_save"
              @click="removeMyReview"
              size="x-large"
            >
              <v-icon start>delete</v-icon>
              Delete
            </v-btn>

            <v-btn
              variant="text"
              :disabled="busy_save"
              @click="form_dialog = false"
              size="x-large"
            >
              Cancel
            </v-btn>

            <v-btn
              color="black"
              variant="flat"
              :loading="busy_save"
              :disabled="!canSubmit"
              @click="submit"
              size="x-large"
            >
              <v-icon start>send</v-icon>
              {{ my_review ? "Update" : "Submit" }}
            </v-btn>
          </s-widget-buttons>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts">
import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";
import SWidgetButtons from "@selldone/components-vue/ui/widget/buttons/SWidgetButtons.vue";

export default {
  name: "SStorefrontListingItemReviews",
  components: { SWidgetButtons },

  inject: ["$shop"],

  props: {
    itemId: { type: Number, required: true },
  },

  data: () => ({
    busy: false,
    busy_save: false,
    busy_more: false,
    error_text: "",

    reviews: [] as any[],
    total: 0,

    page: 1,
    limit: 8,

    summary: { count: 0, average: 0 } as any,
    my_review: null as any | null,

    form_dialog: false,

    form: {
      rating: 5 as any,
      title: "",
      content: "",
    },
  }),

  computed: {
    shop(): any {
      return (this as any).$shop;
    },

    currentUserId(): number | null {
      if(this.USER_ID())return this.USER_ID();
      // We don't rely on any "avatar" column. Frontend uses getUserAvatar(user.id).
      const id =
        this.my_review?.user_id ??
        this.my_review?.user?.id ??
        null;

      const n = id !== null && id !== undefined ? parseInt(String(id), 10) : 0;
      return n > 0 ? n : null;
    },

    currentUserName(): string {
      const name =
        this.my_review?.user?.name ??
        (this.my_review ? "You" : "Guest");
      return String(name || "User");
    },

    summaryText(): string {
      const c = parseInt(String(this.summary?.count || 0), 10);
      const a = Number(this.summary?.average || 0);
      if (!c) return "No ratings";
      return `${a.toFixed(1)} · ${c} review${c > 1 ? "s" : ""}`;
    },

    totalText(): string {
      const t = parseInt(String(this.total || 0), 10) || 0;
      if (!t) return "No reviews yet.";
      return `${t} review${t > 1 ? "s" : ""}`;
    },

    canSubmit(): boolean {
      const r = Number(this.form.rating || 0);
      const content = String(this.form.content || "").trim();
      return r >= 1 && r <= 5 && content.length >= 3;
    },

    hasMore(): boolean {
      return (this.reviews.length || 0) < (this.total || 0);
    },

    /**
     * Reviews scroller list:
     * - Shows public approved reviews
     * - If my_review exists but is not in public list (pending), show it as a card too (with avatar)
     */
    mergedReviews(): any[] {
      const list = Array.isArray(this.reviews) ? [...this.reviews] : [];

      const mine = this.my_review;
      const mineId = mine?.id ? parseInt(String(mine.id), 10) : 0;

      const out = list.map((r: any) => ({
        ...r,
        __id: r?.id,
        is_mine: mineId && r?.id === mineId,
      }));

      if (mineId && !out.some((x: any) => x?.id === mineId)) {
        const uid =
          mine?.user_id ??
          mine?.user?.id ??
          this.currentUserId ??
          null;

        out.unshift({
          __id: mineId,
          id: mineId,
          rating: mine.rating,
          title: mine.title,
          content: mine.content,
          created_at: mine.created_at,
          answered_at: mine.answered_at,
          answer: mine.answer,
          is_approved: mine.is_approved,
          is_mine: true,
          user: {
            id: uid ? parseInt(String(uid), 10) : null,
            name: mine?.user?.name || "You",
          },
        });
      }

      return out.map((x: any) => ({
        ...x,
        __id: x.__id || x.id || Math.random(),
      }));
    },
  },

  watch: {
    itemId: {
      immediate: true,
      handler() {
        this.resetAndFetch();
      },
    },
  },

  methods: {
    formatDate(dt: any) {
      const s = String(dt || "").trim();
      if (!s) return "";
      const d = new Date(s);
      if (Number.isNaN(d.getTime())) return s;
      return d.toLocaleDateString();
    },

    resetAndFetch() {
      this.page = 1;
      this.reviews = [];
      this.total = 0;
      this.fetchReviews(false);
    },

    fetchReviews(append: boolean) {
      const shopName = this.shop?.name;
      const itemId = parseInt(String(this.itemId || 0), 10);
      if (!shopName || !itemId) return;

      if (!append) this.busy = true;
      else this.busy_more = true;

      this.error_text = "";

      axios
        .get(window.XAPI.GET_SHOP_LISTING_ITEM_REVIEWS(shopName, itemId), {
          params: { page: this.page, limit: this.limit },
        })
        .then(({ data }) => {
          if (data?.error) {
            this.error_text = data.error_msg || "Failed to load reviews.";
            return;
          }

          const list = Array.isArray(data.reviews) ? data.reviews : [];
          this.total = parseInt(String(data.total || 0), 10) || 0;
          this.summary = data.summary || { count: 0, average: 0 };
          this.my_review = data.my_review || null;

          if (append) {
            const map = new Map<number, any>();
            (this.reviews || []).forEach((r: any) =>
              map.set(parseInt(String(r.id), 10), r),
            );
            list.forEach((r: any) => map.set(parseInt(String(r.id), 10), r));
            this.reviews = Array.from(map.values());
          } else {
            this.reviews = list;
          }
        })
        .catch((error) => NotificationService.showLaravelError(error))
        .finally(() => {
          this.busy = false;
          this.busy_more = false;
        });
    },

    loadMore() {
      if (!this.hasMore || this.busy_more) return;
      this.page += 1;
      this.fetchReviews(true);
    },

    openCreateForm() {
      this.form = { rating: 5, title: "", content: "" };
      this.form_dialog = true;
    },

    openEditForm() {
      if (!this.my_review) {
        this.openCreateForm();
        return;
      }
      this.form = {
        rating: Number(this.my_review.rating || 5),
        title: String(this.my_review.title || ""),
        content: String(this.my_review.content || ""),
      };
      this.form_dialog = true;
    },

    submit() {
      const shopName = this.shop?.name;
      const itemId = parseInt(String(this.itemId || 0), 10);
      if (!shopName || !itemId) return;

      this.busy_save = true;

      axios
        .post(window.XAPI.POST_SHOP_LISTING_ITEM_REVIEW(shopName, itemId), {
          rating: this.form.rating,
          title: (this.form.title || "").trim() || null,
          content: (this.form.content || "").trim(),
        })
        .then(({ data }) => {
          if (data?.error) {
            NotificationService.showErrorAlert(
              null,
              data.error_msg || "Failed to save review.",
            );
            return;
          }

          NotificationService.showSuccessAlert(null, "Review saved.");
          this.form_dialog = false;
          this.resetAndFetch();
        })
        .catch((error) => {
          if (error?.response?.status === 401) {
            NotificationService.showErrorAlert(
              null,
              "Please login to submit a review.",
            );
            return;
          }
          NotificationService.showLaravelError(error);
        })
        .finally(() => (this.busy_save = false));
    },

    removeMyReview() {
      const shopName = this.shop?.name;
      const itemId = parseInt(String(this.itemId || 0), 10);
      if (!shopName || !itemId) return;

      this.busy_save = true;

      axios
        .delete(window.XAPI.DELETE_SHOP_LISTING_ITEM_REVIEW(shopName, itemId))
        .then(({ data }) => {
          if (data?.error) {
            NotificationService.showErrorAlert(
              null,
              data.error_msg || "Failed to delete review.",
            );
            return;
          }

          NotificationService.showSuccessAlert(null, "Review removed.");
          this.form_dialog = false;
          this.my_review = null;
          this.resetAndFetch();
        })
        .catch((error) => NotificationService.showLaravelError(error))
        .finally(() => (this.busy_save = false));
    },
  },
};
</script>

<style scoped>
.reviews-wrap {
  margin: 0 auto;
}

.apple-card {
  background: #fff;
  border: 1px solid rgba(20, 20, 20, 0.08);
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.06);
  overflow: visible !important;
}

/* Horizontal scroller */
.reviews-scroller {
  display: flex;
  gap: 14px;
  overflow-x: auto;
  padding-bottom: 10px;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
}

.reviews-scroller::-webkit-scrollbar {
  height: 8px;
}
.reviews-scroller::-webkit-scrollbar-thumb {
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.12);
}
.reviews-scroller::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.04);
}

.tile {
  scroll-snap-align: start;
  flex: 0 0 auto;
  width: 360px;
  max-width: 88vw;
  border: 1px solid rgba(20, 20, 20, 0.08);
}

@media (max-width: 420px) {
  .tile {
    width: 320px;
  }
}

.review-tile {
  background: rgba(0, 0, 0, 0.02);
}

.empty-tile,
.more-tile {
  background: rgba(0, 0, 0, 0.015);
}

/* Chips */
.chip-mine {
  background: rgba(0, 0, 0, 0.06) !important;
}
.chip-pending {
  background: rgba(255, 193, 7, 0.18) !important;
}

/* Reply box */
.answer-box {
  padding: 12px;
  border-radius: 14px;
  border: 1px solid rgba(20, 20, 20, 0.08);
  background: rgba(0, 0, 0, 0.02);
}

/* Nice clamps */
.clamp-2,
.clamp-4 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  white-space: normal;
  overflow-wrap: anywhere;
  word-break: break-word;
}
.clamp-2 {
  -webkit-line-clamp: 2;
}
.clamp-4 {
  -webkit-line-clamp: 4;
}

.gap-2 {
  gap: 8px;
}
</style>
