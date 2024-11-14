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

<template>
  <v-container v-resize="onResize" class="p-0" fluid>
    <v-row :no-gutters="small_mode" style="min-height: 100%">
      <v-col
        v-if="!selectedContact || !small_mode"
        :class="small_mode ? '' : 'border-end'"
        :md="small_mode ? 12 : 3"
        class="d-flex flex-column min-height-60vh"
        cols="12"
      >
        <s-data-iterator-toolbar
          v-model:items-per-page="itemsPerPage"
          v-model:search="search"
          v-model:sort-key="sortBy[0].key"
          v-model:sort-order="sortBy[0].order"
          :base-items-count="6"
          :color="isSmall ? ThemeColorDark : undefined"
          :dark="isSmall"
          :sort-keys="keys"
          class="flex-grow-0"
          dense
          small
          style="margin: 0 !important"
        >
        </s-data-iterator-toolbar>

        <!------------------------------- List ----------------------------------->

        <v-data-iterator
          v-model:options="options"
          v-model:page="page"
          v-model:sort-by="sortBy"
          :class="{ 'chats-list-popup': small_mode }"
          :items="contacts"
          :items-length="totalItems"
          :items-per-page="itemsPerPage"
          :loading="busy_fetch"
          :search="search"
          class="flex-grow-1"
          hide-default-footer
          no-data-text=""
        >
          <template v-slot:loading>
            <u-loading-ellipsis css-mode light></u-loading-ellipsis>
          </template>
          <template v-slot:no-data>
            <v-icon class="center-absolute" color="#ddd" size="80"
              >add_comment
            </v-icon>
          </template>

          <template v-slot:default="{ items }">
            <v-fade-transition group hide-on-leave>
              <v-card
                v-for="item in items"
                :key="item.raw.id"
                :class="{ '-active': item === selectedContact }"
                :color="item === selectedContact ? ThemeColorDark : ''"
                :dark="item === selectedContact"
                class="support-item text-nowrap"
                @click="showContact(item.raw)"
              >
                <v-card-title>
                  <v-avatar class="me-2 hover-scale-small" size="36">
                    <img
                      :src="
                        item.raw.user_id
                          ? getUserAvatar(item.raw.user_id)
                          : require('../../../assets/icons/user.svg')
                      "
                    />
                  </v-avatar>

                  <div class="text-start small">
                    <b>
                      {{ item.raw.user ? item.raw.user.name : item.raw.name }}
                    </b>
                    <u-rating-emoji
                      v-if="item.raw.closed"
                      v-model="item.raw.rate"
                      class="ms-1 inline-block"
                      dense
                      no-stars
                      read-only
                      x-small
                    ></u-rating-emoji>

                    <p v-if="getLastMessage(item.raw)" class="m-0">
                      <small class="me-1 cap">
                        {{
                          getLastMessage(item.raw).officer
                            ? $t("global.commons.officer")
                            : $t("global.commons.user")
                        }}:
                      </small>
                      <small
                        class="limited-text-100px d-inline-block vertical-align-middle"
                      >
                        <span v-if="getLastMessage(item.raw).message">
                          {{ getLastMessage(item.raw).message }}
                        </span>
                        <span v-else-if="getLastMessage(item.raw).product">
                          <v-icon size="small">local_mall</v-icon>
                          {{ $t("global.commons.product") }}
                        </span>
                      </small>
                    </p>
                  </div>

                  <v-spacer></v-spacer>

                  <v-badge v-if="item.raw.mention_id" color="#C2185B" dot>
                    <v-avatar
                      class="hover-scale-small me-1"
                      size="24"
                      title="Mention"
                    >
                      <img :src="getUserAvatar(item.raw.mention_id)" />
                    </v-avatar>
                  </v-badge>

                  <v-badge v-if="item.raw.officer_id" color="blue" dot>
                    <v-avatar
                      class="hover-scale-small"
                      size="24"
                      title="Officer"
                    >
                      <img :src="getUserAvatar(item.raw.officer_id)" />
                    </v-avatar>
                  </v-badge>

                  <v-chip
                    v-if="item.raw.waiting"
                    class="absolute-top-start"
                    color="transparent"
                    size="x-small"
                  >
                    <v-icon
                      class="blink-me"
                      color="#CDDC39"
                      size="x-small"
                      start
                      >lens
                    </v-icon>
                    {{ $t("global.commons.waiting") }}
                  </v-chip>

                  <small
                    v-if="!item.raw.closed"
                    class="absolute-top-end ch-time"
                    >{{ getFromNowString(item.raw.updated_at) }}</small
                  >
                  <small v-else class="absolute-top-end ch-time text-success">
                    <v-icon class="me-1" color="success" size="small"
                      >done_all
                    </v-icon>
                    {{ getFromNowString(item.raw.closed_at) }}</small
                  >
                </v-card-title>

                <v-card-text v-if="details">
                  <div class="d-flex text-center mb-1">
                    <div class="w-50 mb-1 p-1">
                      <v-icon class="me-2" size="small">mail</v-icon>
                      <span v-copy
                        >{{
                          item.raw.user ? item.raw.user.email : item.raw.email
                        }}
                      </span>
                    </div>
                    <div class="w-50 mb-1 p-1">
                      <v-icon class="me-2" size="small">phone</v-icon>
                      <span v-copy
                        >{{
                          item.raw.user ? item.raw.user.phone : item.raw.phone
                        }}
                      </span>
                    </div>
                  </div>

                  <div
                    class="d-flex text-center align-items-center border-between"
                  >
                    <div class="w-50 p-1">
                      <u-rating-emoji
                        v-model="item.raw.rate"
                        dense
                        read-only
                        x-small
                      ></u-rating-emoji>
                    </div>

                    <div class="w-50 p-1">
                      <div>
                        <small>{{ $t("global.commons.created_at") }}: </small
                        >{{ getLocalTimeStringSmall(item.raw.created_at) }}
                      </div>
                      <div>
                        <small>{{ $t("global.commons.updated_at") }}: </small
                        >{{ getLocalTimeStringSmall(item.raw.updated_at) }}
                        <br /><span class="small"
                          >({{ getFromNowString(item.raw.created_at) }})</span
                        >
                      </div>
                    </div>
                  </div>
                </v-card-text>
              </v-card>
            </v-fade-transition>
          </template>

          <template v-slot:bottom>
            <v-pagination
              v-if="pageCount > 1"
              v-model="page"
              :length="pageCount"
              rounded
            />
          </template>
        </v-data-iterator>

        <!--- --------------- Actions --------------- --->

        <v-card-actions
          class="border-top d-block pt-3 text-start bottom-action"
        >
          <v-textarea
            v-model="message"
            :placeholder="$t('global.commons.message')"
            :rows="1"
            :rules="[GlobalRules.counter(1024)]"
            auto-grow
            class="small-textarea"
            density="compact"
            flat
            hide-details
            row-height="10px"
            variant="solo"
          >
            <template v-slot:append>
              <v-btn
                :class="{ disabled: !message }"
                :loading="busy_send"
                :title="$t('global.actions.send')"
                color="blue"
                icon
                rounded
                variant="flat"
                @click="sendForm()"
              >
                <v-icon class="flip-image-rtl">send</v-icon>
              </v-btn>
            </template>
          </v-textarea>
        </v-card-actions>
      </v-col>

      <v-col v-if="selectedContact" :md="small_mode ? 12 : 9" cols="12">
        <!------------------------------- Chat ----------------------------------->
        <s-contact-conversation
          :popup="isSmall"
          :selected-contact="selectedContact"
          @update="(support) => AddOrUpdateItemByID(contacts, support)"
          @update:selectedContact="
            (val) => $emit('update:selectedContact', val)
          "
          @click:close="$emit('update:selectedContact', null)"
        ></s-contact-conversation>
        <div class="widget-buttons">
          <v-btn size="x-large" variant="text" @click="showContact(null)">
            <v-icon class="me-1">{{ $t("icons.chevron_back") }}</v-icon>
            {{ $t("global.actions.back") }}
          </v-btn>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

import { SupportCategory } from "@selldone/core-js/enums/support/SupportCategory";
import URatingEmoji from "../../../ui/rating/emoji/URatingEmoji.vue";
import SContactConversation from "../conversation/SContactConversation.vue";
import { throttle } from "lodash-es";
import SDataIteratorToolbar from "../../../ui/toolbar/SDataIteratorToolbar.vue";
import ULoadingEllipsis from "@selldone/components-vue/ui/loading/ellipsis/ULoadingEllipsis.vue";
import TemplateMixin from "@selldone/components-vue/mixin/template/TemplateMixin.ts";
import DateMixin from "@selldone/components-vue/mixin/date/DateMixin.ts";


/**
 * <s-contacts-list>
 */
export default {
  name: "SContactsList",
  mixins: [TemplateMixin,DateMixin ],

  components: {
    ULoadingEllipsis,
    SDataIteratorToolbar,
    SContactConversation,
    URatingEmoji,
  },

  inject: ["$shop"],
  props: {
    isSmall: {
      default: false,
      type: Boolean,
    },

    selectedContact: {
      default: null,
      type: Object,
    },
  },

  data: () => ({
    contacts: [],

    offset: 0,
    more: true,

    busy_fetch: false,

    search: "",
    filter: {},
    sortBy: [{ key: null, order: "desc" }],

    // Pagination:
    page: 1,
    itemsPerPage: 10,
    totalItems: 0,
    options: {},

    //------------------

    details: false,

    categories: Object.keys(SupportCategory),
    SupportCategory: SupportCategory,

    //------------------

    windowSize: {
      x: 0,
      y: 0,
    },
    //------------------
    message: null,
    busy_send: false,
  }),

  computed: {
    pageCount() {
      return Math.ceil(this.totalItems / this.itemsPerPage);
    },
    keys() {
      return [
        { label: "global.sort.created_at", value: "created_at" },
        { label: "global.sort.updated_at", value: "updated_at" },
      ];
    },
    small_mode() {
      return this.isSmall || this.windowSize.x < 960;
    },

    headers() {
      return [
        {
          title: "Shop",
          align: "center",
          sortable: true,
          value: "shop_id",
        },
        {
          title: "User",
          align: "start",
          sortable: true,
          value: "user_id",
        },
        {
          title: "Date",
          align: "start",
          sortable: true,
          value: "created_at",
        },
        {
          title: "Closed",
          align: "start",
          sortable: true,
          value: "closed_at",
        },
        {
          title: "Last message",
          align: "start",
          sortable: true,
          value: "messages",
        },

        {
          title: "Status",
          align: "center",
          sortable: false,
        },

        {
          title: "Officer",
          align: "center",
          sortable: true,
          value: "officer_id",
        },

        {
          title: "Mention",
          align: "center",
          sortable: true,
          value: "mention_id",
        },

        {
          title: "Link",
          align: "center",
          sortable: true,
          value: "shop_id",
        },
      ];
    },
  },

  watch: {
    // Pagination:
    options: {
      handler() {
        const { sortBy, page, itemsPerPage } = this.options;
        this.fetchSupports(page, sortBy[0]?.key, sortBy[0]?.order === "desc");
      },
      deep: true,
    },

    search: throttle(function (newVal, oldVal) {
      if (!newVal && !oldVal) return;
      //  console.log("search", newVal);
      const { sortBy, page, itemsPerPage } = this.options;
      this.fetchSupports(1, sortBy[0]?.key, sortBy[0]?.order === "desc", false);
    }, window.SERACH_THROTTLE),

    categories() {
      const { sortBy, page, itemsPerPage } = this.options;
      this.fetchSupports(1, sortBy[0]?.key, sortBy[0]?.order === "desc", false);
    },
  },

  mounted() {
    this.onResize();
  },
  methods: {
    fetchSupports(page, sortBy, sortDesc = true) {
      this.busy_fetch = true;

      axios
        .get(window.XAPI.GET_SHOP_TICKETS_LIST(this.$shop.name), {
          params: {
            offset: (page - 1) * this.itemsPerPage,
            limit: this.itemsPerPage,
            sortBy: sortBy,
            sortDesc: sortDesc,

            search: this.search,

            categories: this.categories,
          },
        })
        .then(({ data }) => {
          this.contacts = data.contacts;
          this.totalItems = data.total;
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => (this.busy_fetch = false));
    },

    showContact(contact) {
      this.$emit("update:selectedContact", contact);
    },

    getLastMessage(contact) {
      return contact.messages[contact.messages.length - 1];
    },

    onResize() {
      this.windowSize = { x: window.innerWidth, y: window.innerHeight };
    },

    //-----------------------------------------------------------------------------------
    sendForm() {
      this.message = this.message.replace(/<[^>]*>?/gm, "");
      if (!this.message) return;

      this.busy_send = true;

      const user = this.USER();

      axios
        .post(window.XAPI.POST_CONTACT_US_FORM(this.$shop.name), {
          name: user.name,
          email: user.email,
          phone: user.phone,
          message: this.message,
          category: this.category,
          url: window.location.href,
        })
        .then(({ data }) => {
          if (!data.error) {
            this.message = "";
            this.category = null;
            this.AddOrUpdateItemByID(this.contacts, data.contact, "id", false);
            this.totalItems++;

            setTimeout(() => {
              this.showContact(data.contact);
            }, 550);

            NotificationService.showSuccessAlert(
              null,
              this.$t("contact_us_form.notifications.success"),
            );
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_send = false;
        });
    },
  },

  created() {},
};
</script>

<style lang="scss" scoped>
.support-item {
  text-align: start;
  padding: 4px 8px 0 8px;
  // border-bottom: solid #ddd thin !important;
  box-shadow: none !important;
  font-weight: 400;
  transition: all 0.3s ease-in-out;
  margin: 8px 0;

  &:hover {
    box-shadow: 0px 10px 50px 0px rgba(96, 96, 96, 0.2) !important;
    border-radius: 8px;
    z-index: 2;
  }

  .-officer {
    border: solid #0f75ac 4px;
  }

  .-mention {
    border: solid #8fc108 4px;
  }

  &.-active {
    box-shadow: 0px 10px 50px 0px rgba(96, 96, 96, 0.2) !important;
    color: #fff !important;
    border-radius: 8px;

    small {
      color: rgba(255, 255, 255, 0.93);
    }

    .v-card__title {
      .cap {
        color: #fff;
      }
    }
  }

  .v-card__title {
    font-size: 1.1rem;

    .v-avatar {
      margin: 4px;
    }
  }

  .v-card__title {
    text-align: left !important;
    line-height: normal !important;

    .cap {
      color: #0c91d3;
    }
  }
}

.chats-list-popup {
  //height: 550px;
  // max-height: calc(100vh - 180px);
  padding: 0 8px;
  scrollbar-width: thin;
  overflow-y: auto;
  background-color: #fafafa;
  padding-bottom: 60px;
  min-height: 50vh;
}

.ch-time {
  font-size: 0.6em !important;
}

.bottom-action {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  background: #fff;
  z-index: 9;
}
</style>
