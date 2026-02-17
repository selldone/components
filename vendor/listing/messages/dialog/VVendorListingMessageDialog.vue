<!--
  - Copyright (c) 2023-2026. Selldone® Business OS™
  - Author: M.Pajuhaan
  - Web: https://selldone.com
  - All rights reserved.
-->

<template>
  <v-dialog v-model="dialog" max-width="980">
    <v-card rounded="xl">
      <v-card-title class="d-flex align-center">
        <v-icon class="me-2">mail</v-icon>
        <div class="font-weight-black">Message</div>
        <v-spacer />
        <v-btn icon variant="text" :disabled="busyAny" @click="dialog = false">
          <v-icon>close</v-icon>
        </v-btn>
      </v-card-title>

      <u-loading-progress v-if="busyAny" />

      <v-card-text v-if="message" class="text-start">
        <div class="d-flex align-center justify-space-between flex-wrap gap-2">
          <div class="d-flex align-center min-w-0">
            <v-avatar size="40" class="me-3">
              <img
                v-if="senderUserId"
                :src="getUserAvatar(senderUserId)"
                alt="avatar"
              />
              <v-icon v-else>person</v-icon>
            </v-avatar>

            <div class="min-w-0">
              <div class="font-weight-bold text-truncate">
                {{ senderName }}
              </div>
              <div class="text-muted small text-truncate">
                {{ senderEmail }}
              </div>
            </div>
          </div>

          <div class="text-muted small">
            {{ formatDateTime(message.created_at) }}
          </div>
        </div>

        <div class="mt-3 d-flex align-center flex-wrap gap-2">
          <v-chip size="x-small" label variant="tonal">
            {{ String(message.status || "new") }}
          </v-chip>

          <v-chip
            v-if="message.reply"
            size="x-small"
            label
            variant="tonal"
            class="text-success"
          >
            replied
          </v-chip>

          <v-chip
            v-if="message.deleted_at"
            size="x-small"
            label
            variant="tonal"
            class="text-red"
          >
            removed
          </v-chip>
        </div>

        <v-divider class="my-4" />

        <div v-if="message.subject" class="font-weight-bold wrap-anywhere">
          {{ message.subject }}
        </div>

        <div class="mt-2 text-muted wrap-anywhere" style="white-space: pre-wrap">
          {{ message.message || "-" }}
        </div>

        <v-divider class="my-4" />

        <div class="font-weight-bold mb-2">Reply</div>

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

      <v-card-actions>
        <div class="widget-buttons">
          <v-btn variant="text" :disabled="busyAny" @click="dialog = false" size="x-large" prepend-icon="close">
            Close
          </v-btn>

          <v-btn
            color="black"
            variant="flat"
            :loading="busyAction === 'reply'"
            :disabled="busyAny && busyAction !== 'reply'"
            @click="saveReply"
            size="x-large"
          >
            <v-icon start>save</v-icon>
            Save
          </v-btn>
        </div>

      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

export default {
  name: "VVendorListingMessageDialog",

  props: {
    modelValue: { type: Boolean, default: false },
    vendorId: { type: Number, required: true },
    message: { type: Object, default: null },
  },

  emits: ["update:modelValue", "updated"],

  data: () => ({
    reply_text: "" as string,
    busyAction: "" as string, // reply
  }),

  computed: {
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

    senderUserId(): number | null {
      const m: any = this.message;
      const id = m?.user?.id ?? m?.user_id ?? null;
      const n = id !== null && id !== undefined ? parseInt(String(id), 10) : 0;
      return n > 0 ? n : null;
    },

    senderName(): string {
      const m: any = this.message;
      return String(m?.user?.name ?? m?.name ?? "User");
    },

    senderEmail(): string {
      const m: any = this.message;
      return String(m?.contact_email ?? m?.email ?? "");
    },
  },

  watch: {
    message: {
      immediate: true,
      handler(m: any) {
        // IMPORTANT: dialog may receive partial models; keep it safe.
        this.reply_text = m?.reply ? String(m.reply) : "";
      },
    },
  },

  methods: {
    formatDateTime(dt: any) {
      const s = String(dt || "").trim();
      if (!s) return "";
      const d = new Date(s);
      return Number.isNaN(d.getTime()) ? s : d.toLocaleString();
    },

    saveReply() {
      const vendorId = this.vendorId;
      const id = (this.message as any)?.id;

      if (!vendorId || !id) return;

      this.busyAction = "reply";

      axios
        .post(window.VAPI.POST_MY_VENDOR_LISTING_MESSAGE_REPLY(vendorId, id), {
          reply: (this.reply_text || "").trim() || null,
        })
        .then(({ data }) => {
          if (data?.error) {
            NotificationService.showErrorAlert(null, data.error_msg);
            return;
          }

          NotificationService.showSuccessAlert(null, "Reply saved.");

          // Emit patch (safe) to update list
          const patch =
            data.message ||
            ({
              id,
              reply: (this.reply_text || "").trim() || null,
              status: "replied",
              replied_at: new Date().toISOString(),
            } as any);

          this.$emit("updated", patch);
          this.dialog = false;
        })
        .catch((e) => NotificationService.showLaravelError(e))
        .finally(() => (this.busyAction = ""));
    },
  },
};
</script>

<style lang="scss" scoped>
.wrap-anywhere {
  overflow-wrap: anywhere;
  word-break: break-word;
}
</style>
