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
  >
    <template v-slot:activator="{ props }">
      <v-btn
        :color="unread_count > 0 ? 'amber' : '#eee'"
        :loading="busy"
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

    <v-sheet class="text-start" max-width="100vw" rounded="xl">
      <div class="px-6 pt-3">
        <h2 class="font-weight-black my-1">Notifications</h2>

        <v-row no-gutters>
          <v-btn
            :color="mode === 'new' ? 'primary' : '#111'"
            :loading="busy && mode === 'new'"
            class="me-1 tnt"
            rounded
            variant="text"
            @click.stop="mode = 'new'"
            >New
          </v-btn>
          <v-btn
            :color="mode === 'unread' ? 'primary' : '#111'"
            :loading="busy && mode === 'unread'"
            class="me-1 tnt"
            rounded
            variant="text"
            @click.stop="mode = 'unread'"
            >Unread
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn
            v-if="shop_id"
            :to="{ name: 'BShopAutomationNotifications' }"
            class="tnt"
            exact
            rounded
            variant="text"
            >See All
          </v-btn>
        </v-row>
      </div>

      <v-list
        class="d--notification-repository border-between-vertical"
        density="compact"
        lines="two"
      >
        <v-list-item
          v-for="(item, index) in notifications"
          :key="index"
          :to="helper.getTo(item)"
          exact
          @click="onClickNotification(item)"
        >
          <template v-slot:prepend>
            <v-badge
              :color="item.read_at ? '#aaa' : helper.getColor(item)"
              :content="numeralFormat(item.count, '0a')"
              :model-value="item.count > 1"
              location="bottom end"
              offset-x="2"
              offset-y="2"
            >
              <v-avatar
                :color="item.read_at ? '#eee' : helper.getColor(item)"
                size="40"
              >
                <v-avatar color="#fff" size="36">
                  <v-icon :color="item.read_at ? '#aaa' : '#111'"
                    >{{ helper.getIcon(item) }}
                  </v-icon>
                </v-avatar>
              </v-avatar>
            </v-badge>
          </template>
          <div
            :class="{ 'op-0-8 text-muted': item.read_at || item.local_read }"
          >
            <v-list-item-title
              class="html-style -dense -single-line"
              v-html="helper.getTitle(item)"
            ></v-list-item-title>

            <v-list-item-subtitle
              style="font-size: 12px"
              v-html="helper.getDescription(item)"
            ></v-list-item-subtitle>

            <!-- Extra > Product IDs -->
            <v-list-item-subtitle v-if="item.data?.product_ids?.length">
              <products-dense-images-circles-links
                :ids="item.data.product_ids"
                :max-count="10"
                :to-product="
                  (id) => {
                    return {
                      name: 'BPageProductDashboard',
                      params: { product_id: id, shop_id: item.data.shop?.id },
                    };
                  }
                "
                class="pa-1"
              ></products-dense-images-circles-links>
            </v-list-item-subtitle>
            <!-- Extra > Category IDs -->
            <v-list-item-subtitle v-if="item.data?.category_ids?.length">
              <products-dense-images-circles-links
                :ids="item.data.category_ids.map((id) => 'c-' + id)"
                :max-count="10"
                :to-category="
                  (id) => {
                    return {
                      name: 'BPageShopProductsList',
                      query: { dir: id, shop_id: item.data.shop?.id },
                    };
                  }
                "
                class="pa-1"
              ></products-dense-images-circles-links>
            </v-list-item-subtitle>
          </div>
          <template v-slot:append>
            <v-list-item-action class="d-flex flex-column" end>
              <v-icon
                v-if="!item.read_at"
                class="mx-auto"
                color="red"
                size="x-small"
                >circle
              </v-icon>
              <div class="d-block x-small mt-1 op-0-6">
                {{ getFromNowString(item.created_at) }}
              </div>
            </v-list-item-action>
          </template>
        </v-list-item>
      </v-list>

      <div
        v-if="!notifications?.length"
        class="pa-5 text-h4 font-weight-light text-center op-0-4"
      >
        Empty!
      </div>
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
              n.local_read = true; // Just set a local variable to show red dot of new notifications
            });
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
.d--notification-repository {
  text-align: start;
}
</style>
