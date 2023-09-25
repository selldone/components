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
  <v-menu v-model="menu" v-if="notifications?.length || mode === 'unread' " offset-y rounded="xl" max-width="820" nudge-width="460">
    <template v-slot:activator="{ on, attrs }">
      <v-badge
        :value="unread_count > 0"
        :content="unread_count | numeralFormat('0a')"
        overlap
        color="red"
        offset-y="20"
        offset-x="20"
      >
        <v-btn
          :color="unread_count > 0 ? 'amber' : '#eee'"
          dark
          v-bind="attrs"
          v-on="on"
          icon
          :loading="busy"
          class="mx-2"
        >
          <v-icon>notifications</v-icon>
        </v-btn>
      </v-badge>
    </template>

    <v-sheet class="text-start" max-width="100vw">
      <div class="px-6 pt-3">
        <h2 class="font-weight-black my-1">Notifications</h2>

        <v-row no-gutters>
          <v-btn
            class="me-1 tnt"
            :color="mode === 'new' ? 'primary' : '#111'"
            text
            @click.stop="mode = 'new'"
            rounded
            :loading="busy && mode === 'new'"
            >New</v-btn
          >
          <v-btn
            class="me-1 tnt"
            :color="mode === 'unread' ? 'primary' : '#111'"
            text
            @click.stop="mode = 'unread'"
            rounded
            :loading="busy && mode === 'unread'"
            >Unread</v-btn
          >
          <v-spacer></v-spacer>
          <v-btn v-if="shop_id" class="tnt" text rounded :to="{name:'ShopNotificationsRepositoryList'}" exact>See All</v-btn>
        </v-row>
      </div>

      <v-list class="d--notification-repository border-between-vertical" dense>
        <v-list-item
          v-for="(item, index) in notifications"
          :key="index"
          :to="helper.getTo(item)"
          exact
          @click.native="onClickNotification(item)"
        >
          <v-list-item-icon>
            <v-badge
              :value="item.count > 1"
              :content="item.count | numeralFormat('0a')"
              bottom
              :color="item.read_at ? '#aaa' :helper.getColor(item)"
              offset-x="12"
              offset-y="8"
            >
              <v-avatar :color="item.read_at?'#eee':helper.getColor(item) " size="40">
                <v-avatar size="36" color="#fff">
                  <v-icon :color="item.read_at ? '#aaa':'#111'" >{{ helper.getIcon(item) }}</v-icon>
                </v-avatar>
              </v-avatar>
            </v-badge>
          </v-list-item-icon>
          <v-list-item-content
            :class="{ 'op-0-8 text-muted': item.read_at || item.local_read }"
          >
            <v-list-item-title
              class="html-style -dense"
              v-html="helper.getTitle(item)"
            ></v-list-item-title>

            <v-list-item-subtitle
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
                      name: 'ProductDashboard',
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
                      name: 'ProductsManagement',
                      query: { dir: id, shop_id: item.data.shop?.id },
                    };
                  }
                "
                class="pa-1"
              ></products-dense-images-circles-links>
            </v-list-item-subtitle>
          </v-list-item-content>
          <v-list-item-action>
            <v-list-item-action-text>
              <small> {{ getFromNowString(item.created_at) }} ●</small>
            </v-list-item-action-text>
            <v-icon v-if="!item.read_at" class="mx-auto" x-small color="red"
              >circle</v-icon
            >
          </v-list-item-action>
        </v-list-item>
      </v-list>

      <div v-if="!notifications?.length" class="pa-5 display-1 font-weight-light text-center op-0-4">
        Empty!
      </div>
    </v-sheet>
  </v-menu>
</template>

<script>
import { NotificationRepositoryType } from "../../../../core/enums/notification/NotificationRepositoryType";
import ProductsDenseImagesCirclesLinks from "@/Components/product/products-dense-images-circles/ProductsDenseImagesCirclesLinks.vue";
import NotificationHelper from "../../../../core/enums/notification/NotificationHelper";

export default {
  name: "ShopNotificationsRepositoryMenu",
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
    helper(){
      return  new NotificationHelper(this)
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
            !NotificationRepositoryType[n.type]?.to // Auto read notifications without link!
        )
        .map((n) => n.id);
    },
  },
  watch: {
    shop_id(_old,_new) {
      if(parseInt(_old)!==parseInt(_new))
      this.fetch();
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

<style scoped lang="scss">
.d--notification-repository {
  text-align: start;
}
</style>
