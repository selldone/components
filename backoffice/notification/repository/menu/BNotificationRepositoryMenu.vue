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

<template>
  <v-menu
    v-if="notifications?.length || mode === 'unread'"
    v-model="menu"
    width="560"
    max-width="calc(100vw - 16px)"
    location="bottom end"
    :offset="8"
  >
    <template v-slot:activator="{ props }">
      <v-btn
        :color="unread_count > 0 ? 'amber' : '#eee'"
        :loading="busy"
        :aria-label="$t('notification_repository_menu.title')"
        class="mx-2"
        icon
        size="48"
        v-bind="props"
        variant="text"
      >
        <v-badge
          :content="numeralFormat(unread_count, '0a')"
          :model-value="unread_count > 0"
          color="red"
          location="top end"
        >
          <v-icon size="28">notifications</v-icon>
        </v-badge>
      </v-btn>
    </template>

    <!--  ⬬⬬⬬⬬⬬⬬⬬⬬⬬ Notifications ⬬⬬⬬⬬⬬⬬⬬⬬⬬  -->

    <v-sheet
      class="b-notification-menu sd-modern-widget text-start"
      :theme="USER()?.preferences?.dark ? 'dark' : 'light'"
    >
      <header class="b-notification-menu__heading">
        <h2>{{ $t("notification_repository_menu.title") }}</h2>
        <span class="b-notification-menu__total">
          {{
            $t("notification_repository_menu.unread_count", {
              count: unread_count,
            })
          }}
        </span>
      </header>

      <div class="b-notification-menu__toolbar">
        <v-btn-toggle
          v-model="mode"
          class="sd-modern-segmented"
          :aria-label="$t('notification_repository_menu.title')"
          mandatory
        >
          <v-btn
            value="new"
            :aria-pressed="mode === 'new'"
            :loading="busy && mode === 'new'"
            variant="text"
            @click.stop
          >
            {{ $t("notification_repository_menu.new") }}
          </v-btn>
          <v-btn
            value="unread"
            :aria-pressed="mode === 'unread'"
            :loading="busy && mode === 'unread'"
            variant="text"
            @click.stop
          >
            {{ $t("notification_repository_menu.unread") }}
          </v-btn>
        </v-btn-toggle>
        <v-btn
          v-if="shop_id"
          :to="{ name: 'BShopAutomationNotifications' }"
          class="sd-modern-button sd-modern-button--compact sd-modern-button--inline b-notification-menu__all"
          color="primary"
          variant="text"
          exact
        >
          {{ $t("notification_repository_menu.see_all") }}
          <v-icon size="14" end aria-hidden="true">arrow_forward</v-icon>
        </v-btn>
      </div>

      <v-list
        class="b-notification-menu__list"
        density="compact"
        :aria-busy="busy"
      >
        <div
          v-for="item in notifications"
          :key="item.id"
          class="b-notification-menu__item"
        >
          <v-list-item
            :to="helper.getTo(item)"
            class="b-notification-menu__row"
            :class="{
              'sd-modern-clickable-item': !!helper.getTo(item),
              'b-notification-menu__row--read': item.read_at || item.local_read,
            }"
            exact
            @click="onClickNotification(item)"
          >
            <div class="b-notification-menu__layout">
              <div
                class="b-notification-menu__type"
                :style="{ '--notification-color': helper.getColor(item) }"
              >
                <v-icon size="20" aria-hidden="true">{{
                  helper.getIcon(item)
                }}</v-icon>
                <span v-if="item.count > 1" class="b-notification-menu__count">
                  {{ numeralFormat(item.count, "0a") }}
                </span>
              </div>
              <div class="b-notification-menu__copy" @click="onMessageClick">
                <div
                  class="b-notification-menu__title"
                  v-html="messageHtml(helper.getTitle(item))"
                ></div>
                <div
                  class="b-notification-menu__message"
                  v-html="messageHtml(helper.getDescription(item))"
                ></div>

                <!-- Extra > Product IDs -->
                <div
                  v-if="item.data?.product_ids?.length"
                  class="b-notification-menu__media"
                >
                  <products-dense-images-circles-links
                    :ids="item.data.product_ids"
                    :max-count="10"
                    :size="28"
                    :to-product="
                      (id) => ({
                        name: 'BPageProductDashboard',
                        params: { product_id: id, shop_id: item.data.shop?.id },
                      })
                    "
                    class="b-notification-menu__images"
                  ></products-dense-images-circles-links>
                </div>
                <!-- Extra > Category IDs -->
                <div
                  v-if="item.data?.category_ids?.length"
                  class="b-notification-menu__media"
                >
                  <products-dense-images-circles-links
                    :ids="item.data.category_ids.map((id) => 'c-' + id)"
                    :max-count="10"
                    :size="28"
                    :to-category="
                      (id) => ({
                        name: 'BPageShopProductsList',
                        query: { dir: id, shop_id: item.data.shop?.id },
                      })
                    "
                    class="b-notification-menu__images"
                  ></products-dense-images-circles-links>
                </div>
              </div>
              <div class="b-notification-menu__meta">
                <span
                  v-if="!item.read_at && !item.local_read"
                  class="b-notification-menu__unread"
                  role="img"
                  :aria-label="$t('notification_repository_menu.unread')"
                ></span>
                <time>{{ getFromNowString(item.created_at) }}</time>
              </div>
            </div>
          </v-list-item>
        </div>
        <div
          v-if="!notifications?.length && !busy"
          class="b-notification-menu__empty"
          role="status"
        >
          <v-icon size="30" aria-hidden="true">notifications_none</v-icon>
          <h3>{{ $t("notification_repository_menu.empty_title") }}</h3>
          <p>{{ $t("notification_repository_menu.empty_description") }}</p>
        </div>
      </v-list>
    </v-sheet>
  </v-menu>
</template>

<script lang="ts">
import { NotificationRepositoryType } from "@selldone/core-js/enums/notification/NotificationRepositoryType";
import ProductsDenseImagesCirclesLinks from "../../../../storefront/product/products-dense-images-circles/ProductsDenseImagesCirclesLinks.vue";
import { NotificationHelper } from "@selldone/core-js/enums/notification/NotificationHelper";
import DateMixin from "@selldone/components-vue/mixin/date/DateMixin.ts";

export default {
  name: "BNotificationRepositoryMenu",
  mixins: [DateMixin],
  components: { ProductsDenseImagesCirclesLinks },
  props: {},
  data: () => ({
    notifications: [],
    busy: false,
    menu: false,

    busy_read: false,
    read_at: null, // Keep last read date.

    mode: "new",
  }),
  computed: {
    helper() {
      return new NotificationHelper(this);
    },

    shop_id() {
      return this.$route.params.shop_id;
    },

    unread_count() {
      return this.unread_ids.length;
    },
    unread_ids() {
      const read_at = this.read_at;
      return this.notifications
        .filter((n) => !n.read_at && !n.local_read)
        .map((n) => n.id);
    },
    unread_ids_without_click() {
      const read_at = this.read_at;
      return this.notifications
        .filter(
          (n) =>
            !n.read_at &&
            !n.local_read &&
            !NotificationRepositoryType[n.type]?.to, // Auto read notifications without link!
        )
        .map((n) => n.id);
    },
  },
  watch: {
    shop_id(_old, _new) {
      if (parseInt(_old) !== parseInt(_new)) this.fetch();
    },
    menu(menu) {
      if (menu) this.readNotifications(this.unread_ids_without_click);
    },
    mode() {
      this.fetch();
    },
  },
  created() {
    this.fetch();
  },
  methods: {
    messageHtml(value) {
      const html = typeof value === "string" ? value : "";
      if (typeof document === "undefined")
        return html.replace(
          /[&<>"']/g,
          (character) =>
            ({
              "&": "&amp;",
              "<": "&lt;",
              ">": "&gt;",
              '"': "&quot;",
              "'": "&#39;",
            })[character],
        );
      // Notification messages can contain merchant text; retain formatting, never executable markup.
      const template = document.createElement("template");
      template.innerHTML = html;
      const allowed = new Set([
        "p",
        "div",
        "span",
        "br",
        "hr",
        "b",
        "strong",
        "i",
        "em",
        "u",
        "small",
        "code",
        "pre",
        "ol",
        "ul",
        "li",
        "a",
      ]);
      const blocked = new Set([
        "script",
        "style",
        "iframe",
        "object",
        "embed",
        "template",
        "base",
        "meta",
        "link",
      ]);
      for (const element of Array.from(
        template.content.querySelectorAll("*"),
      )) {
        const tag = element.tagName.toLowerCase();
        if (
          blocked.has(tag) ||
          element.namespaceURI !== "http://www.w3.org/1999/xhtml"
        ) {
          element.remove();
          continue;
        }
        if (!allowed.has(tag)) {
          element.replaceWith(...element.childNodes);
          continue;
        }
        const href = tag === "a" ? element.getAttribute("href") : null;
        for (const attribute of Array.from(element.attributes))
          element.removeAttribute(attribute.name);
        if (href && !/[\u0000-\u001f\u007f]/.test(href)) {
          try {
            const url = new URL(href, document.baseURI);
            if (
              ["http:", "https:", "mailto:"].includes(url.protocol) &&
              !url.username &&
              !url.password
            ) {
              element.setAttribute("href", href);
              if (
                url.protocol !== "mailto:" &&
                url.origin !== new URL(document.baseURI).origin
              ) {
                element.setAttribute("target", "_blank");
                element.setAttribute("rel", "noopener noreferrer");
              }
            }
          } catch {
            // Invalid links keep their readable text.
          }
        }
      }
      return template.innerHTML;
    },
    onMessageClick(event) {
      const link = event.target.closest("a");
      if (link && event.currentTarget.contains(link)) event.stopPropagation();
    },
    fetch() {
      this.busy = true;

      axios
        .get(window.API.GET_MY_NOTIFICATIONS_REPOSITORY(), {
          params: {
            shop_id: this.shop_id,
            mode: this.mode,
          },
        })
        .then(({ data }) => {
          if (data.error) return;
          this.notifications = data.notifications;
        })
        .catch((err) => {
          console.log(err);
        })
        .finally(() => (this.busy = false));
    },

    onClickNotification(notification) {
      if (notification.read_at || notification.local_read) return;

      this.readNotifications([notification.id]);
    },

    readNotifications(ids) {
      if (this.busy_read || !ids.length) return;

      this.busy_read = true;

      axios
        .post(window.API.POST_READ_MY_NOTIFICATIONS_REPOSITORY(), {
          shop_id: this.shop_id,
          ids: ids,
        })
        .then(({ data }) => {
          if (data.error) return;

          // Update read notifications:
          this.notifications
            .filter((n) => ids.includes(n.id))
            .forEach((n) => {
              n.read_at = data.read_at;
              n.local_read = true;
            });
          if (this.mode === "unread")
            this.notifications = this.notifications.filter(
              (n) => !n.read_at && !n.local_read,
            );
          this.read_at = data.read_at; // Force update (re compute)
        })
        .catch((err) => {
          console.log(err);
        })
        .finally(() => (this.busy_read = false));
    },
  },
};
</script>

<style lang="scss" scoped>
.b-notification-menu.sd-modern-widget {
  padding: 0;
  border-radius: 20px;
  max-block-size: calc(100dvh - 80px);
  overflow-y: auto;
  overscroll-behavior: contain;
  box-shadow: 0 16px 42px rgba(var(--v-theme-on-surface), 0.1);
}

.b-notification-menu {
  text-align: start;
  font-family: inherit;

  &__heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 20px 22px 14px;

    h2 {
      margin: 0;
      font-size: 21px;
      font-weight: 600;
      line-height: 28px;
      letter-spacing: -0.55px;
    }
  }

  &__total {
    color: var(--sd-modern-muted);
    font-size: 12px;
    line-height: 18px;
    white-space: nowrap;
  }
  &__toolbar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    padding: 0 20px 14px;

    .sd-modern-segmented {
      flex: 0 0 auto;
    }
  }
  &__all {
    flex: 0 0 auto;
    margin-inline-start: auto;
  }
  &__list {
    padding: 0 10px 8px;
    border-block-start: 1px solid var(--sd-modern-border);
    background: transparent;
    overflow: visible;
  }
  &__item {
    border-block-end: 1px solid var(--sd-modern-border);
  }
  &__item:last-child {
    border-block-end: 0;
  }
  &__row.v-list-item {
    margin-block: 3px;
    min-height: 0;
    padding: 7px 12px;
    border-radius: 12px;
    overflow: visible;
  }
  &__row :deep(> .v-list-item__content) {
    min-inline-size: 0;
    overflow: visible;
  }
  &__layout {
    display: grid;
    grid-template-columns: 38px minmax(0, 1fr) 72px;
    align-items: start;
    gap: 14px;
  }
  &__type {
    position: relative;
    display: grid;
    place-items: center;
    inline-size: 38px;
    block-size: 38px;
    margin-block-start: 2px;
    border-radius: 11px;
    color: var(--notification-color);
    background: var(--sd-modern-inset);
  }
  &__count {
    position: absolute;
    inset-inline-end: -5px;
    inset-block-end: -4px;
    min-inline-size: 18px;
    block-size: 18px;
    padding-inline: 3px;
    border: 2px solid rgb(var(--v-theme-surface));
    border-radius: 9px;
    background: rgb(var(--v-theme-surface));
    box-shadow: 0 0 0 1px var(--sd-modern-border);
    font-size: 10px;
    line-height: 14px;
    font-weight: 600;
    text-align: center;
  }
  &__copy {
    min-inline-size: 0;
    overflow-wrap: anywhere;
  }
  &__title {
    font-size: 14px;
    font-weight: 500;
    line-height: 20px;
    letter-spacing: -0.12px;
  }
  &__message {
    margin-block-start: 3px;
    color: var(--sd-modern-muted);
    font-size: 13px;
    font-weight: 400;
    line-height: 19px;
  }
  &__title,
  &__message {
    :deep(p),
    :deep(div) {
      margin: 0;
    }
    :deep(b),
    :deep(strong) {
      color: rgb(var(--v-theme-on-surface));
      font-weight: 500;
    }
    :deep(ul),
    :deep(ol) {
      margin-block: 4px;
      padding-inline-start: 20px;
    }
    :deep(a[href]) {
      color: rgb(var(--v-theme-primary));
    }
  }
  &__media {
    position: relative;
    margin-block-start: 4px;
  }
  &__images.circles-container {
    flex-wrap: wrap;
    padding: 0 !important;
  }
  &__images :deep(.v-avatar) {
    border-radius: 9px;
    border: 2px solid rgb(var(--v-theme-surface));
    box-shadow: 0 0 0 1px var(--sd-modern-border);
  }
  &__images :deep(.citm:focus-visible) {
    outline: 2px solid rgb(var(--v-theme-primary));
    outline-offset: 3px;
    transform: scale(1.5);
    z-index: 2;
  }
  &__meta {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 8px;
    padding-block-start: 4px;
    color: var(--sd-modern-muted);
    font-size: 11px;
    line-height: 15px;
    text-align: end;
  }
  &__unread {
    flex: 0 0 auto;
    inline-size: 6px;
    block-size: 6px;
    border-radius: 50%;
    background: rgb(var(--v-theme-error));
  }
  &__row--read {
    .b-notification-menu__title,
    .b-notification-menu__type {
      color: var(--sd-modern-muted);
      font-weight: 400;
    }
    .b-notification-menu__media {
      opacity: 0.7;
    }
  }
  &__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 46px 24px;
    text-align: center;
  }
  &__empty > .v-icon {
    color: var(--sd-modern-muted);
    margin-block-end: 6px;
  }
  &__empty h3 {
    margin: 0;
    font-size: 15px;
    line-height: 22px;
    font-weight: 500;
  }
  &__empty p {
    margin: 0;
    color: var(--sd-modern-muted);
    font-size: 13px;
    line-height: 19px;
  }

  &.v-theme--dark {
    .b-notification-menu__all,
    .b-notification-menu__title :deep(a[href]),
    .b-notification-menu__message :deep(a[href]) {
      color: color-mix(
        in srgb,
        rgb(var(--v-theme-primary)) 65%,
        rgb(var(--v-theme-on-surface))
      ) !important;
    }
  }

  @media (max-width: 479px) {
    &__heading {
      padding: 18px 16px 13px;
      flex-wrap: wrap;
      gap: 4px 12px;
    }
    &__toolbar {
      padding-inline: 14px;
      gap: 6px;
    }
    &__list {
      padding-inline: 4px;
    }
    &__layout {
      grid-template-columns: 32px minmax(0, 1fr);
      gap: 6px 10px;
    }
    &__type {
      inline-size: 32px;
      block-size: 32px;
    }
    &__meta {
      grid-column: 2;
      flex-direction: row;
      align-items: center;
      gap: 6px;
      padding-block-start: 0;
      text-align: start;
    }
  }

  @media (max-width: 599px), (pointer: coarse) {
    &__all {
      min-height: 44px !important;
    }
    &__images {
      gap: 4px;
    }
    &__images :deep(.citm) {
      display: grid;
      place-items: center;
      min-inline-size: 44px;
      min-block-size: 44px;
      margin: 0 !important;
    }
    &__images :deep(.citm:hover),
    &__images :deep(.citm:focus-visible) {
      transform: none;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    &__images :deep(.citm) {
      transition: none;
    }
  }
}
</style>
