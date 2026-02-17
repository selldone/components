<template>
  <v-dialog v-model="dialog" max-width="920">
    <v-card rounded="xl">
      <v-card-title class="d-flex align-center">
        <v-icon class="me-2">rate_review</v-icon>
        <div class="font-weight-black">Review</div>
        <v-spacer />
        <v-btn icon variant="text" :disabled="busyAny" @click="dialog = false">
          <v-icon>close</v-icon>
        </v-btn>
      </v-card-title>

      <u-loading-progress v-if="busyAny" />

      <v-card-text v-if="review" class="text-start">
        <div class="d-flex align-center justify-space-between flex-wrap">
          <div class="d-flex align-center">
            <v-avatar size="36" class="me-2">
              <img
                v-if="reviewUserId"
                :src="getUserAvatar(reviewUserId)"
                alt="avatar"
              />
              <v-icon v-else>person</v-icon>
            </v-avatar>
            <div class="font-weight-bold">{{ review.user?.name || "User" }}</div>
          </div>

          <div class="text-muted small">
            {{ formatDate(review.created_at) }}
          </div>
        </div>

        <div class="mt-2 d-flex align-center flex-wrap gap-2">
          <v-rating :model-value="Number(review.rating || 0)" readonly density="compact" half-increments />
          <v-chip size="x-small" label variant="tonal">
            {{ review.is_approved ? "Approved" : "Pending" }}
          </v-chip>

          <v-chip v-if="review.deleted_at" size="x-small" label variant="tonal" class="text-red">
            Removed
          </v-chip>
        </div>

        <div class="mt-3 text-muted">
          <div class="font-weight-bold">Item</div>
          <div class="wrap-anywhere">
            {{ review.item?.title || `Item #${review.item_id}` }}
          </div>
        </div>

        <v-divider class="my-4" />

        <div v-if="review.title" class="font-weight-bold wrap-anywhere">
          {{ review.title }}
        </div>

        <div class="mt-2 text-muted wrap-anywhere" style="white-space: pre-wrap">
          {{ review.content || "-" }}
        </div>

        <v-divider class="my-4" />

        <div class="d-flex align-center mb-2">
          <div class="font-weight-bold">Owner reply</div>
          <v-spacer />
          <v-chip v-if="review.answered_at" size="x-small" label variant="tonal">
            {{ formatDate(review.answered_at) }}
          </v-chip>
        </div>

        <v-textarea
          v-model="reply_text"
          label="Reply"
          variant="underlined"
          auto-grow
          rows="3"
          :disabled="busyAny"
        />
      </v-card-text>

      <v-card-text v-else class="text-muted">
        No data.
      </v-card-text>

      <v-card-actions class="px-4 pb-4">
        <s-widget-buttons :auto-fixed-position="false">
          <v-btn variant="text" class="mx-1" :disabled="busyAny" @click="dialog = false"           size="x-large">
            <v-icon start>close</v-icon>
            Close
          </v-btn>

          <v-spacer />

          <v-btn
            v-if="review && !review.deleted_at"
            class="mx-1"
            variant="text"
            color="red"
            :loading="busyAction === 'delete'"
            :disabled="busyAny && busyAction !== 'delete'"
            @click="onDelete"           size="x-large"
          >
            <v-icon start>delete</v-icon>
            Delete
          </v-btn>

          <v-btn
            v-if="review && review.deleted_at"
            class="mx-1"
            variant="text"
            :loading="busyAction === 'restore'"
            :disabled="busyAny && busyAction !== 'restore'"
            @click="onRestore"           size="x-large"
          >
            <v-icon start>settings_backup_restore</v-icon>
            Restore
          </v-btn>

          <!-- Backoffice only -->
          <v-btn
            v-if="review && !IS_VENDOR_PANEL"
            class="mx-1"
            variant="text"
            :loading="busyAction === (review.is_approved ? 'reject' : 'approve')"
            :disabled="busyAny && busyAction !== (review.is_approved ? 'reject' : 'approve')"
            @click="review.is_approved ? onReject() : onApprove()"           size="x-large"
          >
            <v-icon start>verified</v-icon>
            {{ review.is_approved ? "Reject" : "Approve" }}
          </v-btn>

          <v-btn
            class="mx-1"
            color="primary"
            variant="elevated"
            :loading="busyAction === 'reply'"
            :disabled="busyAny && busyAction !== 'reply'"
            @click="onSaveReply"
            size="x-large"
          >
            <v-icon start>save</v-icon>
            Save reply
          </v-btn>
        </s-widget-buttons>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";
import SWidgetButtons from "@selldone/components-vue/ui/widget/buttons/SWidgetButtons.vue";

export default {
  name: "BShopListingReviewDialog",
  components: { SWidgetButtons },

  inject: ["$shop"],

  props: {
    modelValue: { type: Boolean, default: false },
    review: { type: Object, default: null },
  },

  emits: ["update:modelValue", "updated"],

  data: () => ({
    reply_text: "" as string,
    busyAction: "" as string, // reply|approve|reject|delete|restore
  }),

  computed: {
    shop(): any {
      return (this as any).$shop;
    },

    /*🟢 Vendor Panel 🟢*/
    IS_VENDOR_PANEL(): boolean {
      // @ts-ignore
      return (
        (this as any).$route?.params?.vendor_id &&
        // @ts-ignore
        (this as any).$route?.matched?.some((record: any) => record?.meta?.vendor)
      );
    },

    VENDOR_ID_SAFE(): number | null {
      // @ts-ignore
      const raw = (this as any).$route?.params?.vendor_id;
      const n = raw !== null && raw !== undefined ? parseInt(String(raw), 10) : 0;
      return n > 0 ? n : null;
    },

    dialog: {
      get(): boolean {
        return !!this.modelValue;
      },
      set(v: boolean) {
        this.$emit("update:modelValue", v);
      },
    },

    busyAny(): boolean {
      return !!this.busyAction;
    },

    reviewUserId(): number | null {
      const r: any = (this as any).review;
      const id = r?.user?.id ?? r?.user_id ?? null;
      const n = id !== null && id !== undefined ? parseInt(String(id), 10) : 0;
      return n > 0 ? n : null;
    },
  },

  watch: {
    review: {
      immediate: true,
      handler(r: any) {
        this.reply_text = r?.answer ? String(r.answer) : "";
      },
    },
  },

  methods: {
    formatDate(dt: any) {
      const s = String(dt || "").trim();
      if (!s) return "";
      const d = new Date(s);
      return Number.isNaN(d.getTime()) ? s : d.toLocaleString();
    },

    onSaveReply() {
      if (!this.review?.id) return;

      const shopId = this.shop?.id;
      const vendorId = this.VENDOR_ID_SAFE;

      const url = this.IS_VENDOR_PANEL
        ? window.VAPI.POST_MY_VENDOR_LISTING_REVIEW_REPLY(vendorId, this.review.id)
        : window.API.POST_SHOP_LISTING_REVIEW_REPLY(shopId, this.review.id);

      if (!url) return;

      this.busyAction = "reply";

      axios
        .post(url, { answer: (this.reply_text || "").trim() || null })
        .then(({ data }) => {
          if (data?.error) {
            NotificationService.showErrorAlert(null, data.error_msg);
            return;
          }
          NotificationService.showSuccessAlert(null, "Reply saved.");
          this.$emit("updated", data.review || null);
          this.dialog = false;
        })
        .catch((error) => NotificationService.showLaravelError(error))
        .finally(() => (this.busyAction = ""));
    },

    onApprove() {
      if (!this.review?.id) return;
      const shopId = this.shop?.id;
      if (!shopId) return;

      this.busyAction = "approve";

      axios
        .post(window.API.POST_SHOP_LISTING_REVIEW_APPROVE(shopId, this.review.id))
        .then(({ data }) => {
          if (data?.error) {
            NotificationService.showErrorAlert(null, data.error_msg);
            return;
          }
          NotificationService.showSuccessAlert(null, "Approved.");
          this.$emit("updated", data.review || null);
          this.dialog = false;
        })
        .catch((error) => NotificationService.showLaravelError(error))
        .finally(() => (this.busyAction = ""));
    },

    onReject() {
      if (!this.review?.id) return;
      const shopId = this.shop?.id;
      if (!shopId) return;

      this.busyAction = "reject";

      axios
        .post(window.API.POST_SHOP_LISTING_REVIEW_REJECT(shopId, this.review.id))
        .then(({ data }) => {
          if (data?.error) {
            NotificationService.showErrorAlert(null, data.error_msg);
            return;
          }
          NotificationService.showSuccessAlert(null, "Rejected.");
          this.$emit("updated", data.review || null);
          this.dialog = false;
        })
        .catch((error) => NotificationService.showLaravelError(error))
        .finally(() => (this.busyAction = ""));
    },

    onDelete() {
      if (!this.review?.id) return;

      const shopId = this.shop?.id;
      const vendorId = this.VENDOR_ID_SAFE;

      const url = this.IS_VENDOR_PANEL
        ? window.VAPI.DELETE_MY_VENDOR_LISTING_REVIEW(vendorId, this.review.id)
        : window.API.DELETE_SHOP_LISTING_REVIEW(shopId, this.review.id);

      if (!url) return;

      NotificationService.openDangerAlert(
        "Delete review",
        "Delete this review?",
        "Delete",
        () => {
          this.busyAction = "delete";

          axios
            .delete(url)
            .then(({ data }) => {
              if (data?.error) {
                NotificationService.showErrorAlert(null, data.error_msg);
                return;
              }
              NotificationService.showSuccessAlert(null, "Deleted.");
              this.$emit("updated", { id: this.review.id, deleted_at: new Date().toISOString() });
              this.dialog = false;
            })
            .catch((error) => NotificationService.showLaravelError(error))
            .finally(() => (this.busyAction = ""));
        },
      );
    },

    onRestore() {
      if (!this.review?.id) return;

      const shopId = this.shop?.id;
      const vendorId = this.VENDOR_ID_SAFE;

      const url = this.IS_VENDOR_PANEL
        ? window.VAPI.POST_MY_VENDOR_LISTING_REVIEW_RESTORE(vendorId, this.review.id)
        : window.API.POST_SHOP_LISTING_REVIEW_RESTORE(shopId, this.review.id);

      if (!url) return;

      this.busyAction = "restore";

      axios
        .post(url)
        .then(({ data }) => {
          if (data?.error) {
            NotificationService.showErrorAlert(null, data.error_msg);
            return;
          }
          NotificationService.showSuccessAlert(null, "Restored.");
          this.$emit("updated", data.review || null);
          this.dialog = false;
        })
        .catch((error) => NotificationService.showLaravelError(error))
        .finally(() => (this.busyAction = ""));
    },
  },
};
</script>

<style scoped>
.wrap-anywhere {
  overflow-wrap: anywhere;
  word-break: break-word;
}
</style>
