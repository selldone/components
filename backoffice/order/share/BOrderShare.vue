<!--
  - Copyright (c) 2024. Selldone® Business OS™
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
  <section
    v-if="order_link && modern"
    class="sd-modern-widget b-order-access text-start"
    :aria-label="$t('b_order_chat_box.modern.access.title')"
  >
    <header class="b-order-access__header">
      <div>
        <h2 class="b-order-access__heading">
          {{ $t("b_order_chat_box.modern.access.title") }}
        </h2>
        <p class="b-order-access__subtitle">
          {{ $t("b_order_chat_box.modern.access.subtitle") }}
        </p>
      </div>
      <v-btn
        icon
        variant="text"
        class="sd-modern-icon-button sd-modern-info-button"
        :aria-label="$t('b_order_chat_box.modern.access.help_label')"
      >
        <v-icon size="16" aria-hidden="true">info_outline</v-icon>
        <v-tooltip
          activator="parent"
          location="top"
          content-class="sd-modern-tooltip text-start"
          open-on-click
          open-on-focus
        >
          {{ $t("b_order_chat_box.modern.access.help") }}
        </v-tooltip>
      </v-btn>
    </header>

    <div
      class="b-order-access__options"
      :class="{ 'b-order-access__options--guest': has_guest_checkout }"
    >
      <div class="b-order-access__option">
        <div class="b-order-access__title">
          <v-icon size="16" aria-hidden="true">lock_outline</v-icon>
          <h3>{{ $t("b_order_chat_box.modern.access.customer_title") }}</h3>
          <span class="b-order-access__meta">
            {{ $t("b_order_chat_box.modern.access.authentication") }}
          </span>
        </div>
        <p class="b-order-access__description">
          {{ $t("b_order_chat_box.modern.access.customer_description") }}
        </p>
        <div class="b-order-access__url-row">
          <span class="b-order-access__url" dir="ltr">{{ order_link }}</span>
          <v-btn
            icon
            variant="text"
            class="sd-modern-icon-button"
            :aria-label="$t('b_order_chat_box.modern.access.copy_customer')"
            @click.stop="copyToClipboard(order_link)"
          >
            <v-icon size="16" aria-hidden="true">content_copy</v-icon>
            <v-tooltip
              activator="parent"
              location="top"
              content-class="sd-modern-tooltip text-start"
              open-on-focus
            >
              {{ $t("b_order_chat_box.modern.access.copy_customer") }}
            </v-tooltip>
          </v-btn>
        </div>
      </div>

      <div v-if="has_guest_checkout" class="b-order-access__option">
        <div class="b-order-access__title">
          <v-icon size="16" aria-hidden="true">link</v-icon>
          <h3>{{ $t("b_order_chat_box.modern.access.guest_title") }}</h3>
          <span class="b-order-access__meta">
            {{ $t("b_order_chat_box.modern.access.validity") }}
          </span>
        </div>
        <p class="b-order-access__description">
          {{ $t("b_order_chat_box.modern.access.guest_description") }}
        </p>
        <div class="b-order-access__guest-control">
          <template v-if="secure_link">
            <span class="b-order-access__ready" role="status">
              <v-icon size="16" aria-hidden="true">check_circle_outline</v-icon>
              {{ $t("b_order_chat_box.modern.access.guest_ready") }}
            </span>
            <v-btn
              icon
              variant="text"
              class="sd-modern-icon-button"
              :aria-label="$t('b_order_chat_box.modern.access.copy_guest')"
              @click.stop="copyToClipboard(secure_link)"
            >
              <v-icon size="16" aria-hidden="true">content_copy</v-icon>
              <v-tooltip
                activator="parent"
                location="top"
                content-class="sd-modern-tooltip text-start"
                open-on-focus
              >
                {{ $t("b_order_chat_box.modern.access.copy_guest") }}
              </v-tooltip>
            </v-btn>
          </template>
          <v-btn
            v-else
            class="sd-modern-button b-order-access__create"
            variant="outlined"
            :loading="busy_secure_link"
            :disabled="busy_secure_link"
            @click="dialog_guest = true"
          >
            <v-icon size="16" start aria-hidden="true">add_link</v-icon>
            {{ $t("b_order_chat_box.modern.access.create_guest") }}
          </v-btn>
          <span class="b-order-access__private">
            <v-icon size="14" aria-hidden="true">verified_user</v-icon>
            {{ $t("b_order_chat_box.modern.access.share_privately") }}
          </span>
        </div>
      </div>
    </div>

    <v-dialog
      v-model="dialog_guest"
      max-width="480"
      :aria-label="$t('b_order_chat_box.modern.access.confirm_title')"
    >
      <v-card class="sd-modern-widget b-order-access-dialog text-start">
        <header class="b-order-access__header">
          <div>
            <h2 class="b-order-access__heading">
              {{ $t("b_order_chat_box.modern.access.confirm_title") }}
            </h2>
            <p class="b-order-access__subtitle">
              {{ $t("b_order_chat_box.modern.access.confirm_description") }}
            </p>
          </div>
          <v-btn
            icon
            variant="text"
            class="sd-modern-icon-button"
            :aria-label="$t('global.actions.close')"
            @click="dialog_guest = false"
          >
            <v-icon size="16" aria-hidden="true">close</v-icon>
            <v-tooltip
              activator="parent"
              location="top"
              content-class="sd-modern-tooltip text-start"
              open-on-focus
            >{{ $t("global.actions.close") }}</v-tooltip>
          </v-btn>
        </header>
        <div class="sd-modern-notice b-order-access-dialog__notice">
          <v-icon size="18" aria-hidden="true">verified_user</v-icon>
          <p>{{ $t("b_order_chat_box.modern.access.security_notice") }}</p>
        </div>
        <div class="b-order-access-dialog__actions">
          <v-btn
            class="sd-modern-button"
            variant="text"
            @click="dialog_guest = false"
          >{{ $t("global.actions.cancel") }}</v-btn>
          <v-btn
            class="sd-modern-button sd-modern-button--primary"
            color="primary"
            :loading="busy_secure_link"
            :disabled="busy_secure_link || !has_guest_checkout"
            @click="createSecureLink"
          >
            <v-icon size="16" start aria-hidden="true">add_link</v-icon>
            {{ $t("b_order_chat_box.modern.access.create_guest") }}
          </v-btn>
        </div>
      </v-card>
    </v-dialog>
  </section>
  <div v-else-if="order_link" class="widget-box -large">
    <u-widget-header
      :title="$t('b_order_share.title')"
      icon="shopping_bag"
    ></u-widget-header>
    <v-list-subheader>
      {{ $t("b_order_share.subtitle") }}

      <span v-if="has_guest_checkout">
        {{ $t("b_order_share.guest_checkout_message") }}
      </span>
    </v-list-subheader>

    <u-text-copy-box
      v-if="order_link"
      :value="order_link"
      message="Customer Order URL"
      small-width-mode
    >
      <template v-slot:append-message>
        <v-chip
          size="x-small"
          color="#673AB7"
          label
          variant="flat"
          class="mx-2"
        >
          {{ $t("b_order_share.authentication") }}
        </v-chip>
      </template>
    </u-text-copy-box>

    <div v-if="has_guest_checkout" class="position-relative">
      <u-text-copy-box
        :value="secure_link"
        message="Secure Order URL"
        small-width-mode
      >
        <template v-slot:append-message>
          <v-chip
            size="x-small"
            color="#C2185B"
            label
            variant="flat"
            class="mx-2"
          >
            {{ $t("b_order_share.guest") }}
          </v-chip>
        </template>
      </u-text-copy-box>
      <div
        v-if="!secure_link"
        style="
          position: absolute;
          left: 8px;
          right: 8px;
          top: 4px;
          bottom: 4px;
          backdrop-filter: blur(8px);
          background-color: #ffffff33;
          border-radius: 18px;
        "
        class="d-flex align-center justify-center text-black pp flex-column"
        @click="createSecureLink"
      >
        {{ $t("b_order_share.click_to_create") }}
        <small>[ {{ $t("b_order_share.valid_for_30_days") }} ]</small>

        <u-loading-progress
          v-if="busy_secure_link"
          color="blue"
        ></u-loading-progress>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import UTextCopyBox from "@selldone/components-vue/ui/text/copy-box/UTextCopyBox.vue";
import ULoadingProgress from "@selldone/components-vue/ui/loading/progress/ULoadingProgress.vue";
import { ShopOptionsHelper, ShopURLs } from "@selldone/core-js/helper";
import { Product } from "@selldone/core-js/models";

import ProductType = Product.ProductType;
import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

export default defineComponent({
  name: "BOrderShare",
  mixins: [],
  components: { ULoadingProgress, UTextCopyBox },
  inject: ["$shop"],
  props: {
    basket: { type: Object, required: true },
    modern: { type: Boolean, default: false },
  },
  data: () => ({
    secure_link: null,
    busy_secure_link: false,
    dialog_guest: false,
    context_unmounted: false,
  }),

  computed: {
    has_guest_checkout() {
      return ShopOptionsHelper.HasGuestCheckout(this.$shop);
    },

    order_link() {
      if (this.basket.type === ProductType.PHYSICAL) {
        return (
          ShopURLs.MainShopUrl(this.$shop) +
          `/orders/physical/SM-${this.basket.id}`
        );
      } else if (this.basket.type === ProductType.VIRTUAL) {
        return (
          ShopURLs.MainShopUrl(this.$shop) +
          `/orders/virtual/SV-${this.basket.id}`
        );
      } else if (this.basket.type === ProductType.FILE) {
        return (
          ShopURLs.MainShopUrl(this.$shop) + `/orders/file/SF-${this.basket.id}`
        );
      } else if (this.basket.type === ProductType.SERVICE) {
        return (
          ShopURLs.MainShopUrl(this.$shop) +
          `/orders/service/SS-${this.basket.id}`
        );
      } else if (this.basket.type === ProductType.SUBSCRIPTION) {
        return (
          ShopURLs.MainShopUrl(this.$shop) +
          `/orders/subscription/SN-${this.basket.id}`
        );
      } else if (this.basket.type === "POS") {
        return (
          ShopURLs.MainShopUrl(this.$shop) + `/orders/pos/POS-${this.basket.id}`
        );
      }

      return null;
    },
  },
  watch: {
    "basket.id"() {
      if (!this.modern) return;
      // A guest link must never carry over into another order's access widget.
      this.secure_link = null;
      this.dialog_guest = false;
      this.busy_secure_link = false;
    },
    "$shop.id"() {
      if (!this.modern) return;
      this.secure_link = null;
      this.dialog_guest = false;
      this.busy_secure_link = false;
    },
  },
  beforeUnmount() {
    this.context_unmounted = true;
  },
  methods: {
    createSecureLink() {
      if (this.busy_secure_link || (this.modern && !this.has_guest_checkout)) return;
      const modern = this.modern;
      const basket_id = this.basket.id;
      const shop_id = this.$shop.id;
      this.busy_secure_link = true;

      axios
        .post(
          this.basket.type === "POS"
            ? window.API.POST_POS_BASKET_CREATE_SECURE_LINK(
                this.$shop.id,
                this.basket.id,
              )
            : window.API.POST_BASKET_CREATE_SECURE_LINK(
                this.$shop.id,
                this.basket.id,
              ),
        )
        .then(({ data }) => {
          // Ignore late access credentials after the merchant changes orders or shops.
          if (modern && (this.context_unmounted || this.basket.id !== basket_id || this.$shop.id !== shop_id)) return;
          if (data.error) {
            NotificationService.showErrorAlert(null, data.error_msg);
          } else {
            this.secure_link = data.url;
            this.dialog_guest = false;
            NotificationService.showSuccessAlert(
              null,
              this.$t("b_order_share.notifications.secure_link_created"),
            );
          }
        })
        .catch((error) => {
          if (modern && (this.context_unmounted || this.basket.id !== basket_id || this.$shop.id !== shop_id)) return;
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          if (modern && (this.context_unmounted || this.basket.id !== basket_id || this.$shop.id !== shop_id)) return;
          this.busy_secure_link = null;
        });
    },
  },
});
</script>

<style scoped lang="scss">
.b-order-access,
.b-order-access-dialog {
  --sd-modern-icon-button-size: 32px;
  padding: 19px 22px 20px;
  font-family: inherit;

  .sd-modern-icon-button :deep(.v-icon) {
    font-size: 16px;
  }

  .b-order-access__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-block-end: 15px;

    > div { min-width: 0; }
  }

  .b-order-access__heading {
    margin: 0;
    font-family: inherit;
    font-size: 16px;
    font-weight: 500;
    line-height: 23px;
  }

  .b-order-access__subtitle,
  .b-order-access__description {
    margin: 4px 0 0;
    color: var(--sd-modern-muted);
    font-size: 12px;
    font-weight: 400;
    line-height: 20px;
    text-wrap: pretty;
  }
}

.b-order-access {
  &__options {
    display: grid;
    gap: 22px;
  }

  &__options--guest {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  &__option {
    min-width: 0;

    + .b-order-access__option {
      padding-inline-start: 22px;
      border-inline-start: 1px solid var(--sd-modern-border);
    }
  }

  &__title {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 7px;

    > .v-icon { color: var(--sd-modern-muted); }

    > h3 {
      min-width: 0;
      margin: 0;
      font-family: inherit;
      font-size: 13px;
      font-weight: 500;
      line-height: 21px;
    }
  }

  &__meta,
  &__private {
    color: var(--sd-modern-muted);
    font-size: 11px;
    font-weight: 400;
    line-height: 18px;
  }

  &__meta { margin-inline-start: auto; }

  &__url-row,
  &__guest-control {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-block-start: 12px;
    min-height: 42px;
  }

  &__url {
    min-width: 0;
    flex: 1;
    color: var(--sd-modern-muted);
    font-size: 12px;
    font-weight: 400;
    line-height: 20px;
    overflow-wrap: anywhere;
  }

  &__guest-control { flex-wrap: wrap; }

  &__private,
  &__ready {
    display: inline-flex;
    align-items: center;
    gap: 5px;
  }

  &__ready {
    font-size: 12px;
    font-weight: 400;
    line-height: 20px;

    > .v-icon { color: rgb(var(--v-theme-success)); }
  }

  &__create {
    font-size: 13px;
    line-height: 20px;
  }
}

.b-order-access-dialog {
  .b-order-access__heading {
    font-size: 18px;
    line-height: 26px;
  }

  &__notice {
    align-items: flex-start;
    gap: 10px;
    font-size: 12px;
    line-height: 20px;

    > p { flex: 1; min-width: 0; margin: 0; }
  }

  &__actions {
    display: flex;
    justify-content: flex-end;
    flex-wrap: wrap;
    gap: 8px;
    margin-block-start: 20px;
  }
}

@media (max-width: 600px) {
  .b-order-access,
  .b-order-access-dialog { padding-inline: 18px; }

  .b-order-access {
    &__options--guest { grid-template-columns: minmax(0, 1fr); }
    &__option + &__option {
      padding-block-start: 18px;
      padding-inline-start: 0;
      border-block-start: 1px solid var(--sd-modern-border);
      border-inline-start: 0;
    }
  }
}

@media (max-width: 600px), (pointer: coarse) {
  .b-order-access,
  .b-order-access-dialog { --sd-modern-icon-button-size: 44px; }
}
</style>
