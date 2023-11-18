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
  <v-container fluid v-resize="onResize" class="p-0">
    <v-row :no-gutters="small_mode" style="min-height: 100%">
      <v-col
        v-if="!selectedContact || !small_mode"
        cols="12"
        :md="small_mode ? 12 : 3"
        :class="small_mode ? '' : 'border-end'"
        class="d-flex flex-column min-height-60vh"
      >
        <s-data-iterator-toolbar-small
          :sort-keys="keys"
          :search.sync="search"
          :sort-by.sync="sortBy"
          :sort-desc.sync="sortDesc"
          :base-items-count="6"
          :items-per-page.sync="itemsPerPage"
          :dark="isSmall"
          style="margin: 0 !important"
          :color="isSmall ? SaminColorDark : undefined"
          class="flex-grow-0"
        >
          <v-menu
            v-if="isAdmin"
            offset-y
            :close-on-content-click="false"
            z-index="99999999"
          >
            <template v-slot:activator="{ on }">
              <v-btn v-on="on" icon small>
                <v-icon>more_vert</v-icon>
              </v-btn>
            </template>

            <v-sheet
              color="#fff"
              class="p-2 text-start small-label"
              rounded
              min-width="220"
            >
              <small class="font-weight-bold">
                {{ $t("global.commons.options") }}
              </small>
              <v-switch
                v-model="details"
                :label="$t('global.commons.show_details')"
                color="blue"
                inset
                dense
                hide-details
              ></v-switch>

              <v-checkbox
                v-model="categories"
                v-for="(category, key) in SupportCategory"
                :key="key"
                :value="category.code"
                :label="$t(category.name)"
                hide-details
                dense
              >
              </v-checkbox>
            </v-sheet>
          </v-menu>
        </s-data-iterator-toolbar-small>

        <!------------------------------- List ----------------------------------->

        <v-data-iterator
          :items="contacts"
          :loading="busy_fetch"
          :search="search"
          :sort-by="sortBy"
          :sort-desc="sortDesc"
          hide-default-footer
          :server-items-length="totalItems"
          :options.sync="options"
          :page.sync="page"
          :items-per-page="itemsPerPage"
          @page-count="pageCount = $event"
          no-data-text=""
          :class="{ 'chats-list-popup': small_mode }"
          class="flex-grow-1"
        >
          <template v-slot:loading>
            <loading css-mode light></loading>
          </template>
          <template v-slot:no-data>
            <v-icon size="80" color="#ddd" class="center-absolute"
              >add_comment</v-icon
            >
          </template>

          <template v-slot:default="{ items }">
            <v-fade-transition group hide-on-leave>
              <v-card
                v-for="item in items"
                :key="item.id"
                class="support-item text-nowrap"
                :class="{ '-active': item === selectedContact }"
                @click="showContact(item)"
                :dark="item === selectedContact"
                :color="item === selectedContact ? SaminColorDark : ''"
              >
                <v-card-title>
                  <v-avatar size="36" class="me-2 hover-scale-small">
                    <img
                      :src="
                        item.user_id
                          ? getUserAvatar(item.user_id)
                          : require('@components/assets/icons/user.svg')
                      "
                    />
                  </v-avatar>

                  <div class="text-start small">
                    <b>
                      {{ item.user ? item.user.name : item.name }}
                    </b>
                    <emoji-rating
                      v-if="item.closed"
                      v-model="item.rate"
                      x-small
                      dense
                      class="ms-1 inline-block"
                      read-only
                      no-stars
                    ></emoji-rating>

                    <p v-if="getLastMessage(item)" class="m-0">
                      <small class="me-1 cap">
                        {{
                          getLastMessage(item).officer
                            ? $t("global.commons.officer")
                            : $t("global.commons.user")
                        }}:
                      </small>
                      <small
                        class="limited-text-100px d-inline-block vertical-align-middle"
                      >
                        <span v-if="getLastMessage(item).message">
                          {{ getLastMessage(item).message }}
                        </span>
                        <span v-else-if="getLastMessage(item).product">
                          <v-icon small>local_mall</v-icon>
                          {{ $t("global.commons.product") }}
                        </span>
                      </small>
                    </p>
                  </div>

                  <v-spacer></v-spacer>

                  <v-badge v-if="item.mention_id" dot color="#C2185B" overlap>
                    <v-avatar
                      size="24"
                      class="hover-scale-small me-1"
                      title="Mention"
                    >
                      <img :src="getUserAvatar(item.mention_id)" />
                    </v-avatar>
                  </v-badge>

                  <v-badge v-if="item.officer_id" dot color="blue" overlap>
                    <v-avatar
                      size="24"
                      class="hover-scale-small"
                      title="Officer"
                    >
                      <img :src="getUserAvatar(item.officer_id)" />
                    </v-avatar>
                  </v-badge>

                  <v-chip
                    x-small
                    v-if="item.waiting"
                    color="transparent"
                    class="absolute-top-start"
                    ><v-icon x-small class="blink-me" left color="#CDDC39"
                      >lens</v-icon
                    >
                    {{ $t("global.commons.waiting") }}
                  </v-chip>

                  <small v-if="!item.closed" class="absolute-top-end ch-time">{{
                    getFromNowString(item.updated_at)
                  }}</small>
                  <small v-else class="absolute-top-end ch-time text-success">
                    <v-icon small class="me-1" color="success">done_all</v-icon>
                    {{ getFromNowString(item.closed_at) }}</small
                  >
                </v-card-title>

                <v-card-text v-if="details">
                  <div class="d-flex text-center mb-1">
                    <div class="w-50 mb-1 p-1">
                      <v-icon class="me-2" small>mail</v-icon
                      ><span v-copy
                        >{{ item.user ? item.user.email : item.email }}
                      </span>
                    </div>
                    <div class="w-50 mb-1 p-1">
                      <v-icon class="me-2" small>phone</v-icon
                      ><span v-copy
                        >{{ item.user ? item.user.phone : item.phone }}
                      </span>
                    </div>
                  </div>

                  <div
                    class="d-flex text-center align-items-center border-between"
                  >
                    <div class="w-50 p-1">
                      <emoji-rating
                        v-model="item.rate"
                        x-small
                        dense
                        read-only
                      ></emoji-rating>
                    </div>

                    <div class="w-50 p-1">
                      <div>
                        <small>{{ $t("global.commons.created_at") }}: </small
                        >{{ getLocalTimeStringSmall(item.created_at) }}
                      </div>
                      <div>
                        <small>{{ $t("global.commons.updated_at") }}: </small
                        >{{ getLocalTimeStringSmall(item.updated_at) }}
                        <br /><span class="small"
                          >({{ getFromNowString(item.created_at) }})</span
                        >
                      </div>
                    </div>
                  </div>
                </v-card-text>
              </v-card>
            </v-fade-transition>
          </template>

          <template v-slot:footer>
            <v-pagination
              v-if="pageCount > 1"
              v-model="page"
              circle
              :length="pageCount"
            />
          </template>
        </v-data-iterator>

        <!--- --------------- Actions --------------- --->

        <v-card-actions
          v-if="!isAdmin"
          class="border-top d-block pt-3 text-start bottom-action"
        >
          <v-textarea
            v-model="message"
            :rows="1"
            auto-grow
            :rules="[GlobalRules.counter(1024)]"
            dense
            hide-details
            :placeholder="$t('global.commons.message')"
            class="small-textarea"
            flat
            solo
            row-height="10px"
          >
            <template v-slot:append-outer>
              <v-btn
                @click="sendForm()"
                :loading="busy_send"
                rounded
                :class="{ disabled: !message }"
                depressed
                color="blue"
                dark
                :title="$t('global.actions.send')"
                icon
                class="mt-n1"
              >
                <v-icon class="flip-image-rtl">send</v-icon>
              </v-btn>
            </template>
          </v-textarea>
        </v-card-actions>
      </v-col>

      <v-col v-if="selectedContact" cols="12" :md="small_mode ? 12 : 9">
        <!------------------------------- Chat ----------------------------------->
        <contact-conversation-box
          :is-admin="isAdmin"
          :shop="shop"
          :selected-contact="selectedContact"
          :popup="isSmall"
          @update:selectedContact="
            (val) => $emit('update:selectedContact', val)
          "
          @update="(support) => AddOrUpdateItemByID(contacts, support)"
          @click:close="$emit('update:selectedContact', null)"
        ></contact-conversation-box>
        <div class="widget-buttons">
          <v-btn x-large text @click="showContact(null)">
            <v-icon class="me-1">{{ $t("icons.chevron_back") }}</v-icon>
            {{$t('global.actions.back')}}
          </v-btn>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { SupportCategory } from "@core/enums/support/SupportCategory";
import EmojiRating from "@components/ui/rating/emoji-rating/EmojiRating.vue";
import ContactConversationBox from "./ContactConversationBox.vue";
import SDataIteratorToolbarSmall from "@components/ui/toolbar/SDataIteratorToolbarSmall.vue";
import _ from "lodash-es";
export default {
  name: "ShopChatsList",
  components: { SDataIteratorToolbarSmall, ContactConversationBox, EmojiRating },

  props: {
    shop: {
      required: true,
      type: Object,
    },
    isSmall: {
      default: false,
      type: Boolean,
    },

    selectedContact: {
      default: null,
      type: Object,
    },

    isAdmin: {
      default: false,
      type: Boolean,
    },
  },

  data: () => ({
    contacts: [],

    offset: 0,
    more: true,

    busy_fetch: false,

    search: "",
    filter: {},
    sortDesc: true,
    sortBy: null,

    // Pagination:
    page: 1,
    pageCount: 0,
    itemsPerPage: 10,
    totalItems: 0,
    options: { sortDesc: [true] },

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
    keys() {
      if (this.isAdmin) {
        return [
          { label: "global.sort.user", value: "user_id" },
          { label: "global.sort.officer", value: "officer_id" },
          { label: "global.sort.mention", value: "mention_id" },
          { label: "global.sort.created_at", value: "created_at" },
          { label: "global.sort.updated_at", value: "updated_at" },
        ];
      } else {
        return [
          { label: "global.sort.created_at", value: "created_at" },
          { label: "global.sort.updated_at", value: "updated_at" },
        ];
      }
    },
    small_mode() {
      return this.isSmall || this.windowSize.x < 960;
    },

    headers() {
      return [
        {
          text: "Shop",
          align: "center",
          sortable: true,
          value: "shop_id",
        },
        {
          text: "User",
          align: "start",
          sortable: true,
          value: "user_id",
        },
        {
          text: "Date",
          align: "start",
          sortable: true,
          value: "created_at",
        },
        {
          text: "Closed",
          align: "start",
          sortable: true,
          value: "closed_at",
        },
        {
          text: "Last message",
          align: "start",
          sortable: true,
          value: "messages",
        },

        {
          text: "Status",
          align: "center",
          sortable: false,
        },

        {
          text: "Officer",
          align: "center",
          sortable: true,
          value: "officer_id",
        },

        {
          text: "Mention",
          align: "center",
          sortable: true,
          value: "mention_id",
        },

        {
          text: "Link",
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
        const { sortBy, sortDesc, page, itemsPerPage } = this.options;
        this.fetchSupports(page, sortBy[0], sortDesc[0]);
      },
      deep: true,
    },

    search: _.throttle(function (newVal, oldVal) {
      //  console.log("search", newVal);
      const { sortBy, sortDesc, page, itemsPerPage } = this.options;
      this.fetchSupports(1, sortBy ? sortBy[0] : null, sortDesc[0], false);
    }, window.SERACH_THROTTLE),

    categories() {
      const { sortBy, sortDesc, page, itemsPerPage } = this.options;
      this.fetchSupports(1, sortBy ? sortBy[0] : null, sortDesc[0], false);
    },
  },

  mounted() {
    this.onResize();
  },
  methods: {
    fetchSupports(page, sortBy, sortDesc = true) {
      this.busy_fetch = true;

      axios
        .get(
          this.isAdmin
            ? window.API.GET_SHOP_CONTACT_US_LIST(this.shop.id)
            : window.XAPI.GET_SHOP_TICKETS_LIST(this.shop.name),
          {
            params: {
              offset: (page - 1) * this.itemsPerPage,
              limit: this.itemsPerPage,
              sortBy: sortBy,
              sortDesc: sortDesc,

              search: this.search,

              categories: this.categories,
            },
          }
        )
        .then(({ data }) => {
          this.contacts = data.contacts;
          this.totalItems = data.total;
        })
        .catch((error) => {
          this.showLaravelError(error);
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
        .post(window.XAPI.POST_CONTACT_US_FORM(this.shop.name), {
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

            this.showSuccessAlert(
              null,
              this.$t("contact_us_form.notifications.success")
            );
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_send = false;
        });
    },
  },

  created() {},
};
</script>

<style scoped lang="scss">
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
