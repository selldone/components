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
  <v-fade-transition group hide-on-leave tag="div">
    <v-card
      v-if="show_user_detail"
      class="text-start shadow-paper"
      key="detail"
    >
      <v-card-title class="text-uppercase">
        <v-spacer></v-spacer>

        <v-btn
          @click="show_user_detail = false"
          class="sub-caption -hover"
          :caption="$t('global.actions.close')"
          icon
          ><v-icon> close </v-icon></v-btn
        >
      </v-card-title>
      <v-card-text>
        <v-avatar
          size="32"
          class="hover-scale-small pointer-pointer me-2"
          target="_blank"
        >
          <img :src="getUserAvatar(selectedContact.user_id)" />
        </v-avatar>

        <p class="small">
          {{
            selectedContact.user
              ? selectedContact.user.name
              : selectedContact.name
          }}
        </p>

        <hr />

        <p v-if="selectedContact.category">
          <b>{{ $t("global.commons.category") }}:</b>
          {{ $t(SupportCategory[selectedContact.category].name) }}
        </p>

        <emoji-rating
          v-model="selectedContact.rate"
          x-small
          read-only
        ></emoji-rating>

        <p>
          <b class="me-2">{{ $t("global.commons.ticket_url") }}:</b
          ><span v-copy>{{ selectedContact.url }}</span>
        </p>

        <div class="d-flex text-center">
          <div class="w-50 mb-1 p-1">
            <v-icon class="me-2">mail</v-icon
            ><span v-copy
              >{{
                selectedContact.user
                  ? selectedContact.user.email
                  : selectedContact.email
              }}
            </span>
          </div>
          <div class="w-50 mb-1 p-1">
            <v-icon class="me-2">phone</v-icon
            ><span v-copy
              >{{
                selectedContact.user
                  ? selectedContact.user.phone
                  : selectedContact.phone
              }}
            </span>
          </div>
        </div>
      </v-card-text>
    </v-card>

    <v-card v-else-if="show_products" key="products">
      <v-card-title>
        <v-spacer></v-spacer>
      </v-card-title>

      <v-card-text>
        <product-select-box
          single-product-select
          :shop="shop"
          v-model="selected_product_id"
          simple-mode
          auto-open-dialog
        >
        </product-select-box>

        <v-btn @click="show_products = false" text class="m-2">
          {{ $t("global.actions.back") }}
        </v-btn>

        <v-btn
          color="success"
          class="m-2"
          :loading="busy_contact"
          @click="sendResponse"
          :disabled="!selected_product_id"
        >
          <v-icon class="me-1" small>send</v-icon>
          {{ $t("global.actions.send") }}</v-btn
        >
      </v-card-text>
    </v-card>

    <v-card v-else flat key="chat" :rounded="false" class="chat-container">
      <!--- --------------- Chat mode --------------- --->

      <v-card-text
        class="text-start conversation-box"
        ref="conversation_box"
        :class="{ popup: popup }"
      >
        <v-fade-transition group leave-absolute>
          <div
            v-for="(item, index) in selectedContact.messages"
            :key="index"
            class="my-2"
          >
            <div
              class="d-flex"
              :class="{
                'same-user':
                  index > 0 &&
                  item.user_id ===
                    selectedContact.messages[index - 1].user_id &&
                  item.officer === selectedContact.messages[index - 1].officer,
              }"
            >
              <v-avatar
                size="2rem"
                @click="
                  isAdmin && !item.officer
                    ? (show_user_detail = true)
                    : undefined
                "
                class="me-2 flex-grow-0 -hide-on-same"
                :class="{
                  'avatar-officer': item.officer,
                  'pointer-pointer': !item.officer,
                }"
              >
                <img :src="getUserAvatar(item.user_id)" />
              </v-avatar>
              <div class="flex-grow-1">
                <p class="user-name -remove-on-same">{{ item.user }}</p>

                <div
                  class="message-box"
                  :class="{
                    '-its-me': isAdmin ? item.officer : !item.officer,
                    'empty-msg': !item.message,
                  }"
                >
                  <v-btn
                    v-if="item.officer && isAdmin"
                    @click="deleteResponse(index)"
                    :loading="busy_delete === index"
                    :disabled="busy_delete !== null"
                    color="red"
                    class="absolute-top-end -zero"
                    icon
                    :title="$t('global.actions.delete')"
                    ><v-icon>close</v-icon></v-btn
                  >

                  <p
                    v-if="item.message"
                    v-html="smartConvert(item.message)"
                  ></p>
                  <v-btn
                    v-if="item.link"
                    :href="item.link"
                    target="_blank"
                    color="success"
                    small
                    depressed
                    class="my-2"
                    rounded
                    ><v-icon small class="me-1">link</v-icon
                    >{{ $t("global.actions.click_here") }}</v-btn
                  >

                  <small
                    v-if="item.date && item.message"
                    class="text-end d-block"
                    ><v-icon small>done</v-icon>
                    {{ getLocalTimeStringSmall(item.date) }}</small
                  >
                </div>
              </div>
            </div>
            <!--- --------------- Product --------------- --->
            <simple-auto-product-card
              v-if="item.product"
              :shop="shop"
              :product-id="item.product"
              :to="
                !isAdmin
                  ? {
                      name: window.$storefront.routes.PRODUCT_PAGE,
                      params: { product_id: item.product },
                    }
                  : undefined
              "
              class="mt-2 max-w-300 mx-auto shadow-paper"
            >
            </simple-auto-product-card>

            <!--- --------------- AI Response --------------- --->
          </div>
        </v-fade-transition>

        <!--- --------------- Close --------------- --->

        <p v-if="selectedContact.closed" class="font-weight-bold">
          {{ $t("global.commons.closed_at") }}
          {{ getLocalTimeStringSmall(selectedContact.closed_at) }}
        </p>
        <div v-if="isAdmin || !selectedContact.closed" class="p-2 widget-buttons">
          <v-btn
            :color="selectedContact.closed ? '#00796B' : '#7B1FA2'"
            dark
            @click="closeTicket()"
            :loading="busy_close"
            class="tnt"
          >
            <v-icon v-if="selectedContact.closed" class="me-1">done</v-icon>
            {{
              selectedContact.closed
                ? $t("global.commons.reopen_ticket")
                : $t("global.commons.close_ticket")
            }}</v-btn
          >
        </div>

        <emoji-rating
          v-if="selectedContact.closed && !isAdmin"
          v-model="selectedContact.rate"
          small
          class="box-raiting"
          @input="(val) => sendRate(val)"
          :loading="busy_rate"
        ></emoji-rating>
      </v-card-text>

      <!--- --------------- Actions --------------- --->

      <v-card-actions class="border-top d-block pt-3 text-start z1 bg-white">
        <v-textarea
          :disabled="selectedContact.closed"
          v-model="contact_message"
          :rows="1"
          auto-grow
          :rules="[GlobalRules.counter(1024)]"
          dense
          :prepend-icon="isAdmin ? 'local_mall' : undefined"
          @click:prepend="isAdmin ? showSelectProduct() : undefined"
          hide-details
          :placeholder="$t('global.commons.message')"
          class="small-textarea"
          flat
          solo
          row-height="10px"
        >
          <template v-slot:append-outer>
            <v-btn
              @click="sendResponse()"
              :loading="busy_contact"
              rounded
              :class="{ disabled: !contact_message }"
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
    </v-card>
  </v-fade-transition>
</template>

<script>
import { SupportCategory } from "@core/enums/support/SupportCategory";
import EmojiRating from "@components/ui/rating/emoji-rating/EmojiRating.vue";
import ProductSelectBox from "@components/product/input/ProductSelectBox.vue";
import SimpleAutoProductCard from "@components/storefront/chat/SimpleAutoProductCard.vue";
import { SmartConvertTextToHtml } from "@core/helper/html/HtmlHelper";

export default {
  name: "ContactConversationBox",
  components: { SimpleAutoProductCard, ProductSelectBox, EmojiRating },
  props: {
    shop: {
      required: true,
      type: Object,
    },

    selectedContact: {},

    popup: {
      default: false,
      type: Boolean,
    },
    isAdmin: {
      default: false,
      type: Boolean,
    },
  },

  data: () => ({
    contact_message: null,
    contact_link: null,
    busy_contact: false,
    busy_delete: null,

    has_link: false,
    send_mail: true,

    SupportCategory: SupportCategory,

    show_user_detail: false,

    //----------------------------
    show_products: false,
    selected_product_id: null,

    //----------------------------
    busy_close: false,
    busy_rate: false,
  }),

  methods: {
    sendResponse() {
      // Can send message product without body:
      if (!this.contact_message && !this.selected_product_id) return;

      if (this.contact_message)
        this.contact_message = this.contact_message.replace(/<[^>]*>?/gm, "");

      this.busy_contact = true;

      axios
        .put(
          this.isAdmin
            ? window.API.PUT_SHOP_CONTACT_US_UPDATE_MESSAGE(
                this.shop.id,
                this.selectedContact.id
              )
            : window.XAPI.PUT_SHOP_TICKET_UPDATE_MESSAGE(
                this.shop.name,
                this.selectedContact.id
              ),
          {
            message: this.contact_message,
            link: this.contact_link,
            mail: this.send_mail,
            product: this.selected_product_id,
          }
        )
        .then(({ data }) => {
          if (!data.error) {
            if (!this.popup)
              // Not show success message in popup mode!
              this.showSuccessAlert(
                "Send message",
                "Your response sent successfully."
              );

            this.$emit("update:selectedContact", data.contact);
            this.$emit("update", data.contact);

            this.contact_message = null;
            this.contact_link = null;
            this.has_link = false;

            this.selected_product_id = null;
            this.show_products = false;

            this.$nextTick(() => {
              const objDiv = this.$refs.conversation_box;
              objDiv.scrollTop = objDiv.scrollHeight + 80;
            });
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((e) => this.showLaravelError(e))
        .finally(() => {
          this.busy_contact = false;
        });
    },

    deleteResponse(index) {
      this.openDangerAlert(
        "Delete message",
        "Are you sure to delete this response?",
        "Yes, delete now",
        () => {
          this.busy_delete = index;
          axios
            .delete(
              this.isAdmin
                ? window.API.DELETE_SHOP_CONTACT_US_MESSAGE_RESPONSE(
                    this.shop.id,
                    this.selectedContact.id,
                    index
                  )
                : window.XAPI.DELETE_SHOP_TICKET_MESSAGE_RESPONSE(
                    this.shop.name,
                    this.selectedContact.id,
                    index
                  )
            )
            .then(({ data }) => {
              if (!data.error) {
                if (!this.popup)
                  // Not show success message in popup mode!
                  this.showSuccessAlert(
                    "Remove message",
                    "Message response removed successfully."
                  );
                this.$emit("update:selectedContact", data.contact);
                this.$emit("update", data.contact);
              } else {
                this.showErrorAlert(null, data.error_msg);
              }
            })
            .catch((e) => this.showLaravelError(e))
            .finally(() => {
              this.busy_delete = null;
            });
        }
      );
    },

    closeTicket() {
      this.busy_close = true;
      axios
        .post(
          this.isAdmin
            ? window.API.POST_SHOP_CONTACT_US_CLOSE_TICKET(
                this.shop.id,
                this.selectedContact.id
              )
            : window.XAPI.POST_SHOP_TICKET_CLOSE(
                this.shop.name,
                this.selectedContact.id
              ),
          {
            close: !this.selectedContact.closed,
          }
        )
        .then(({ data }) => {
          if (!data.error) {
            if (!this.popup)
              // Not show success message in popup mode!
              this.showSuccessAlert(
                "Ticket closed",
                "This ticket closed successfully."
              );
            this.$emit("update:selectedContact", data.contact);
            this.$emit("update", data.contact);
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((e) => this.showLaravelError(e))
        .finally(() => {
          this.busy_close = false;
        });
    },
    sendRate(rate) {
      this.busy_rate = true;
      axios
        .put(
          window.XAPI.PUT_SHOP_TICKET_RATE(
            this.shop.name,
            this.selectedContact.id
          ),
          {
            rate: rate,
          }
        )
        .then(({ data }) => {
          if (!data.error) {
            this.showSuccessAlert(null, "Thanks, Your rate has been saved.");

            this.$emit("update:selectedContact", data.contact);
            this.$emit("update", data.contact);
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((e) => this.showLaravelError(e))
        .finally(() => {
          this.busy_rate = false;
        });
    },

    showSelectProduct() {
      this.show_products = true;
    },
    smartConvert(message) {
      return SmartConvertTextToHtml(message);

      /*   if (!message) return "";
         function linkify(inputText) {
           var replacedText, replacePattern1, replacePattern2, replacePattern3;

           //URLs starting with http://, https://, or ftp://
           replacePattern1 = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
           replacedText = inputText.replace(
             replacePattern1,
             '<a href="$1" target="_blank">$1</a>'
           );

           //URLs starting with "www." (without // before it, or it'd re-link the ones done above).
           replacePattern2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
           replacedText = replacedText.replace(
             replacePattern2,
             '$1<a href="http://$2" target="_blank">$2</a>'
           );

           //Change email addresses to mailto:: links.
           replacePattern3 = /(([a-zA-Z0-9\-\_\.])+@[a-zA-Z\_]+?(\.[a-zA-Z]{2,6})+)/gim;
           replacedText = replacedText.replace(
             replacePattern3,
             '<a href="mailto:$1">$1</a>'
           );

           return replacedText;
         }
         message = message.replace(/<[^>]*>?/gm, "");

         return linkify(message);*/
    },
  },
};
</script>

<style lang="scss">
.chat-container {
  &:before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    //opacity: 0.1;
    z-index: 0;

    background-size: 300px, cover !important;
    background-image: linear-gradient(to top, #e6e9f0 0%, #eef1f5 100%);
    background-repeat: repeat, no-repeat !important;
  }
}
.conversation-box {
  user-select: none;
  scroll-behavior: smooth;

  max-height: calc(100vh - 186px);
  overflow-y: auto;
  //  background-color: #fafafa;
  scrollbar-width: thin;
  position: relative;

  &.popup {
    height: 565px;
  }
  &:not(.popup) {
    min-height: 70vh;
  }

  .user-name {
    line-height: 2rem;
    font-weight: 500;
    font-size: 0.8em;
    margin: 0;
    //color: #fff;
  }

  .avatar-officer {
    border: solid #1976d2 3px;
  }
  .avatar-ai {
    border: solid #cf92ff 3px;
  }

  .message-box {
    position: relative;
    margin: 0;
    max-width: 480px;
    border-radius: 18px;
    background-color: #fff;
    color: #000;

    font-weight: 400;
    white-space: pre-line;

    padding: 8px 12px 0 12px;
    font-size: 1em;
    line-height: 2em;

    p {
      margin: 0;
      user-select: text !important;
    }

    a {
      color: #333 !important;
      font-weight: 500;

      &:hover {
        text-decoration: none !important;
        color: #0f75ac !important;
        border-bottom: 2.5px dotted #0f75ac;
      }
    }

    &.-its-me:not(.empty-msg) {
      background-color: var(--theme-deep-dark);
      //   background-image: linear-gradient(-225deg, #3D4E81 0%, #5753C9 48%, #6E7FF3 100%);
      color: #fff;

      small {
        color: #fff !important;
      }
      .v-icon {
        color: #fff !important;
      }
      a {
        color: #fff !important;
        font-weight: 500;

        &:hover {
          text-decoration: none !important;
          color: #eee !important;
          border-bottom: 2.5px dotted #eee;
        }
      }
    }
    &.empty-msg {
      background-color: transparent !important;
    }
  }

  .same-user {
    .-hide-on-same {
      opacity: 0;
    }
    .-remove-on-same {
      display: none;
    }
  }

  .box-raiting {
    background: #fff;
    border-radius: 12px;
    padding: 8px;
    box-shadow: 0px 8px 15px 15px rgba(255, 255, 255, 0.36) !important;
    margin: 8px auto;
    max-width: max-content;
  }
}
.small-textarea {
  //  font-size: 0.9em;
}
</style>
