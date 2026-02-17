<!--
  - Copyright (c) 2023-2026. Selldone® Business OS™
  -
  - Author: M.Pajuhaan
  - Web: https://selldone.com
  - ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  -
  - All rights reserved.
  -->

<template>
  <v-card class="apple-card sld-msg-form" rounded="xl" variant="flat">
    <v-card-text class="pa-4 pa-sm-6">
      <!-- Header -->
      <div class="d-flex align-center justify-space-between">
        <div class="d-flex align-center">
          <v-icon class="me-2">mail</v-icon>
          <div class="text-subtitle-1 font-weight-bold">
            {{ titleText }}
          </div>
        </div>

        <v-chip
          v-if="itemTitleSafe"
          size="x-small"
          label
          variant="tonal"
          class="text-truncate"
          style="max-width: 180px"
          :title="itemTitleSafe"
        >
          {{ itemTitleSafe }}
        </v-chip>
      </div>

      <div v-if="subtitleText" class="text-muted small mt-2">
        {{ subtitleText }}
      </div>

      <v-divider class="my-4" />

      <u-loading-progress v-if="busy" />

      <!-- Error -->
      <v-alert
        v-if="error_text"
        type="error"
        variant="tonal"
        border="start"
        class="mb-4"
      >
        {{ error_text }}
      </v-alert>

      <!-- ✅ Sent state -->
      <v-alert
        v-if="sent_success"
        type="success"
        variant="tonal"
        border="start"
        class="mb-0"
      >
        <div class="font-weight-bold">Your message has been sent.</div>
        <div class="text-muted small mt-1">
          The shop owner will respond to your contact email if needed.
        </div>

        <div v-if="allowSendAnother" class="mt-4">
          <v-btn variant="text" @click="resetAfterSent" :disabled="busy">
            <v-icon start>refresh</v-icon>
            Send another message
          </v-btn>
        </div>
      </v-alert>

      <!-- ✅ Login / Form -->
      <template v-else>
        <!-- Not logged-in -->
        <v-alert v-if="!isLoggedIn" type="info" variant="tonal" class="mb-0">
          You need to login to send a message.
          <div class="mt-3">
            <v-btn
              color="black"
              variant="flat"
              size="small"
              @click="NeedLogin()"
            >
              <v-icon start>login</v-icon>
              Login
            </v-btn>
          </div>
        </v-alert>

        <!-- Logged-in form -->
        <template v-else>
          <v-text-field
            v-model="form.name"
            label="Your name"
            variant="underlined"
            :disabled="busy"
          />

          <v-text-field
            v-model="form.tel"
            label="Phone (optional)"
            variant="underlined"
            :disabled="busy"
          />

          <v-text-field
            v-model="form.contact_email"
            label="Contact email"
            variant="underlined"
            :disabled="busy"
            hint="Replies will be sent to this email."
            persistent-hint
          />

          <v-text-field
            v-model="form.subject"
            label="Subject (optional)"
            variant="underlined"
            :disabled="busy"
          />

          <v-textarea
            v-model="form.message"
            label="Message"
            variant="underlined"
            auto-grow
            rows="4"
            :disabled="busy"
          />

          <div class="text-muted small mt-3">
            Please keep it respectful and clear.
          </div>

          <v-btn
            class="mt-4"
            color="black"
            variant="flat"
            block
            :loading="busy"
            :disabled="!canSend || busy"
            @click="send"
          >
            <v-icon start>send</v-icon>
            Send message
          </v-btn>

          <v-btn
            v-if="allowClear"
            class="mt-2"
            variant="text"
            block
            :disabled="busy"
            @click="clearForm"
          >
            Clear
          </v-btn>
        </template>
      </template>
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";
import AuthMixin from "@selldone/components-vue/mixin/auth/AuthMixin.ts";

export default {
  name: "SStorefrontListingMessageForm",
  mixins: [AuthMixin],

  inject: ["$shop"],

  props: {
    /**
     * Optional: attach message to an item.
     */
    itemId: { type: [Number, String], default: null },
    itemTitle: { type: String, default: "" },

    /**
     * Optional UX toggles
     */
    allowClear: { type: Boolean, default: true },

    /**
     * If true, after success user can reopen form and send another message.
     */
    allowSendAnother: { type: Boolean, default: true },
  },

  emits: ["sent"],

  data: () => ({
    busy: false,
    error_text: "",

    // ✅ hides form after send
    sent_success: false,

    form: {
      name: "",
      tel: "",
      contact_email: "",
      subject: "",
      message: "",
    },
  }),

  computed: {
    shop(): any {
      return (this as any).$shop;
    },

    itemTitleSafe(): string {
      return String(this.itemTitle || "").trim();
    },

    titleText(): string {
      return this.itemTitleSafe ? "Contact" : "Send a message";
    },

    subtitleText(): string {
      return this.itemTitleSafe
        ? "Send a message to the shop owner about this profile."
        : "Send a message to the shop owner.";
    },

    isLoggedIn(): boolean {
      // provided by AuthMixin
      // @ts-ignore
      return !!this.USER?.();
    },

    canSend(): boolean {
      const name = String(this.form.name || "").trim();
      const email = String(this.form.contact_email || "").trim();
      const msg = String(this.form.message || "").trim();

      if (!name) return false;
      if (!email) return false;
      if (msg.length < 3) return false;

      return true;
    },
  },

  mounted() {
    this.prefillFromUser();
  },

  methods: {
    prefillFromUser() {
      // @ts-ignore
      const u = this.USER?.();
      if (!u) return;

      if (!this.form.name) this.form.name = String(u.name || "").trim();
      if (!this.form.contact_email) this.form.contact_email = String(u.email || "").trim();

      const tel = String((u.tel || u.phone || u.mobile || "") as any).trim();
      if (tel && !this.form.tel) this.form.tel = tel;
    },

    clearForm() {
      this.error_text = "";
      this.form.subject = "";
      this.form.message = "";
      // keep prefills (name/email/tel)
    },

    resetAfterSent() {
      this.sent_success = false;
      this.error_text = "";
      this.clearForm();
      this.prefillFromUser();
    },

    send() {
      // ✅ Login gate (standard)
      // @ts-ignore
      if (!this.USER?.()) {
        // @ts-ignore
        return this.NeedLogin();
      }

      const shopName = this.shop?.name;
      if (!shopName) return;

      const itemId =
        this.itemId !== null && this.itemId !== undefined
          ? parseInt(String(this.itemId), 10)
          : null;

      const payload: any = {
        name: String(this.form.name || "").trim() || null,
        tel: String(this.form.tel || "").trim() || null,
        contact_email: String(this.form.contact_email || "").trim() || null,
        subject: String(this.form.subject || "").trim() || null,
        message: String(this.form.message || "").trim(),
      };

      if (!payload.name || !payload.contact_email || !payload.message) {
        this.error_text = "Please fill name, contact email, and message.";
        return;
      }

      this.busy = true;
      this.error_text = "";

      // @ts-ignore
      const url = itemId
        // @ts-ignore
        ? window.XAPI.POST_SHOP_LISTING_ITEM_MESSAGE(shopName, itemId)
        // @ts-ignore
        : window.XAPI.POST_SHOP_LISTING_MESSAGE(shopName);

      axios
        .post(url, payload)
        .then(({ data }) => {
          if (data?.error) {
            this.error_text = data.error_msg || "Failed to send message.";
            return;
          }

          // ✅ show success state inside the same card
          this.sent_success = true;

          NotificationService.showSuccessAlert(null, "Message sent.");
          this.$emit("sent", data.message || null);
        })
        .catch((error) => NotificationService.showLaravelError(error))
        .finally(() => (this.busy = false));
    },
  },
};
</script>

<style lang="scss" scoped>
.apple-card {
  background: #fff;
  border: 1px solid rgba(20, 20, 20, 0.08);
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.06);
}

.sld-msg-form {
  overflow: hidden;
}
</style>
