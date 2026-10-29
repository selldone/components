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
  <section v-if="modern" class="b-contact-conversation-modern text-start">
    <header class="b-contact-conversation-modern__header">
      <div class="b-contact-conversation-modern__identity">
        <v-btn
          icon
          variant="text"
          class="sd-modern-icon-button"
          :aria-label="$t('shop_contacts.modern.back_to_conversations')"
          @click="$emit('click:close')"
        >
          <v-icon :icon="$t('icons.chevron_back')" aria-hidden="true" />
          <v-tooltip
            activator="parent"
            location="top"
            content-class="sd-modern-tooltip text-start"
          >
            {{ $t("shop_contacts.modern.back_to_conversations") }}
          </v-tooltip>
        </v-btn>
        <v-avatar size="32" class="hover-scale-small">
          <img
            :src="
              selectedContact.user_id
                ? getUserAvatar(selectedContact.user_id)
                : require('../../../assets/icons/user.svg')
            "
            :alt="customerName"
          />
        </v-avatar>
        <div class="b-contact-conversation-modern__customer">
          <h2 dir="auto">{{ customerName }}</h2>
          <p>
            <span v-if="categoryName">{{ categoryName }} · </span>
            {{
              $t(
                selectedContact.closed
                  ? "shop_contacts.modern.closed"
                  : selectedContact.waiting
                    ? "shop_contacts.modern.awaiting_reply"
                    : "shop_contacts.modern.open_conversation",
              )
            }}
          </p>
        </div>
      </div>
      <div class="b-contact-conversation-modern__actions">
        <v-btn
          icon
          variant="text"
          class="sd-modern-icon-button"
          :aria-label="$t('shop_contacts.modern.context.title')"
          @click="$emit('click:customer')"
        >
          <v-icon icon="view_sidebar" aria-hidden="true" />
          <v-tooltip
            activator="parent"
            location="top"
            content-class="sd-modern-tooltip text-start"
            >{{ $t("shop_contacts.modern.context.title") }}</v-tooltip
          >
        </v-btn>
        <v-btn
          icon
          variant="text"
          class="sd-modern-icon-button"
          :aria-label="$t('shop_contacts.modern.contact_details')"
          @click="show_user_detail = true"
        >
          <v-icon icon="person_outline" aria-hidden="true" />
          <v-tooltip
            activator="parent"
            location="top"
            content-class="sd-modern-tooltip text-start"
          >
            {{ $t("shop_contacts.modern.contact_details") }}
          </v-tooltip>
        </v-btn>
        <v-btn
          :disabled="!canWrite || busy_contact || busy_delete !== null"
          :loading="busy_close"
          :prepend-icon="selectedContact.closed ? 'refresh' : 'check'"
          variant="outlined"
          class="sd-modern-button sd-modern-button--small"
          @click="closeTicket()"
        >
          {{
            $t(
              selectedContact.closed
                ? "global.commons.reopen_ticket"
                : "global.commons.close_ticket",
            )
          }}
        </v-btn>
      </div>
    </header>

    <!-- The same server messages and product previews remain available in the modern view. -->
    <div
      ref="conversation_box"
      class="b-contact-conversation-modern__messages"
      role="log"
      aria-live="polite"
      :aria-label="$t('shop_contacts.modern.conversation_history')"
    >
      <p class="b-contact-conversation-modern__history">
        {{ $t("shop_contacts.modern.conversation_history") }}
      </p>
      <article
        v-for="(item, index) in selectedContact.messages"
        :key="index"
        class="b-contact-conversation-modern__message"
        :class="{
          'b-contact-conversation-modern__message--staff': item.officer,
        }"
      >
        <div class="b-contact-conversation-modern__author">
          <v-avatar size="22" class="hover-scale-small">
            <img
              :src="
                item.user_id
                  ? getUserAvatar(item.user_id)
                  : require('../../../assets/icons/user.svg')
              "
              :alt="item.user || customerName"
            />
          </v-avatar>
          <span>{{ item.user || customerName }}</span>
          <span v-if="item.officer">· {{ $t("global.commons.officer") }}</span>
        </div>
        <div
          v-if="item.message || item.link"
          class="b-contact-conversation-modern__bubble"
        >
          <div
            v-if="item.message"
            class="b-contact-conversation-modern__body"
            dir="auto"
            v-html="smartConvert(item.message)"
          />
          <v-btn
            v-if="item.link"
            :href="item.link"
            target="_blank"
            rel="noopener noreferrer"
            append-icon="north_east"
            color="primary"
            variant="text"
            class="sd-modern-button sd-modern-button--small sd-modern-button--inline"
            >{{ $t("shop_contacts.modern.open_link") }}</v-btn
          >
        </div>
        <s-product-preview-by-id
          v-if="item.product"
          :product-id="item.product"
          class="b-contact-conversation-modern__product"
        />
        <div class="b-contact-conversation-modern__message-meta">
          <time v-if="item.date" :datetime="item.date">{{
            getLocalTimeStringSmall(item.date)
          }}</time>
          <v-menu
            v-if="
              item.message ||
              (item.officer && !selectedContact.closed && canWrite)
            "
            location="top end"
            :offset="6"
            content-class="sd-modern-select-menu"
          >
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                :loading="busy_delete === index"
                :aria-label="$t('shop_contacts.modern.message_actions')"
                icon
                variant="text"
                class="sd-modern-icon-button b-contact-conversation-modern__message-action"
              >
                <v-icon icon="more_horiz" aria-hidden="true" />
                <v-tooltip
                  activator="parent"
                  location="top"
                  content-class="sd-modern-tooltip text-start"
                >
                  {{ $t("shop_contacts.modern.message_actions") }}
                </v-tooltip>
              </v-btn>
            </template>
            <v-list
              density="compact"
              class="b-contact-conversation-modern__message-menu text-start"
            >
              <v-list-item
                v-if="item.message"
                :key="item.message"
                v-copy="item.message"
                tag="button"
                type="button"
                link
                prepend-icon="content_copy"
                :title="$t('shop_contacts.modern.copy_message')"
                class="b-contact-conversation-modern__message-menu-item"
              />
              <v-list-item
                v-if="item.officer && !selectedContact.closed && canWrite"
                :disabled="busy_delete !== null || busy_contact || busy_close"
                prepend-icon="delete_outline"
                :title="$t('shop_contacts.modern.delete_response')"
                class="b-contact-conversation-modern__message-menu-item"
                @click="deleteResponse(index)"
              />
            </v-list>
          </v-menu>
        </div>
      </article>
      <p
        v-if="selectedContact.closed"
        class="b-contact-conversation-modern__closed"
      >
        {{ $t("global.commons.closed_at") }}
        {{ getLocalTimeStringSmall(selectedContact.closed_at) }}
      </p>
    </div>

    <section
      class="b-contact-conversation-modern__composer"
      :aria-label="$t('shop_contacts.modern.reply_to_customer')"
    >
      <div class="b-contact-conversation-modern__composer-heading">
        <span>{{
          $t(
            selectedContact.closed
              ? "shop_contacts.modern.conversation_closed"
              : "shop_contacts.modern.reply_to_customer",
          )
        }}</span>
        <v-btn
          icon
          variant="text"
          class="sd-modern-icon-button sd-modern-info-button"
          :aria-label="$t('shop_contacts.modern.reply_help')"
        >
          <v-icon icon="info_outline" size="16" aria-hidden="true" />
          <v-tooltip
            activator="parent"
            location="top"
            open-on-click
            open-on-focus
            content-class="sd-modern-tooltip text-start"
          >
            {{ $t("shop_contacts.modern.reply_help") }}
          </v-tooltip>
        </v-btn>
      </div>
      <div class="b-contact-conversation-modern__editor">
        <v-textarea
          v-model="contact_message"
          :disabled="
            selectedContact.closed ||
            !canWrite ||
            busy_contact ||
            busy_close ||
            busy_delete !== null
          "
          :placeholder="
            $t(
              selectedContact.closed
                ? 'shop_contacts.modern.reopen_to_reply'
                : 'shop_contacts.modern.reply_placeholder',
            )
          "
          :aria-label="$t('global.commons.message')"
          :rules="[GlobalRules.counter(1024)]"
          maxlength="1024"
          rows="2"
          max-rows="5"
          auto-grow
          hide-details="auto"
          variant="plain"
          class="b-contact-conversation-modern__reply"
        />
        <div class="b-contact-conversation-modern__composer-actions">
          <v-btn
            :disabled="
              selectedContact.closed ||
              !canWrite ||
              busy_contact ||
              busy_close ||
              busy_delete !== null
            "
            prepend-icon="local_mall"
            variant="text"
            class="sd-modern-button sd-modern-button--small sd-modern-button--inline"
            @click="showSelectProduct()"
            >{{ $t("shop_contacts.modern.send_product") }}</v-btn
          >
          <div class="b-contact-conversation-modern__send">
            <span class="b-contact-conversation-modern__counter"
              >{{ (contact_message || "").length }} / 1024</span
            >
            <v-btn
              :disabled="
                selectedContact.closed ||
                !canWrite ||
                busy_close ||
                busy_delete !== null ||
                !contact_message?.trim() ||
                contact_message.length > 1024
              "
              :loading="busy_contact"
              prepend-icon="send"
              color="primary"
              variant="flat"
              class="sd-modern-button sd-modern-button--small sd-modern-button--primary"
              @click="sendResponse()"
              >{{ $t("shop_contacts.modern.send_reply") }}</v-btn
            >
          </div>
        </div>
      </div>
    </section>

    <v-dialog
      v-model="show_user_detail"
      max-width="560"
      content-class="b-contact-conversation-modern-dialog"
    >
      <v-card class="b-contact-conversation-modern__dialog text-start">
        <header class="b-contact-conversation-modern__dialog-header">
          <h2>{{ $t("shop_contacts.modern.contact_details") }}</h2>
          <v-btn
            icon
            variant="text"
            class="sd-modern-icon-button"
            :aria-label="$t('global.actions.close')"
            @click="show_user_detail = false"
          >
            <v-icon icon="close" aria-hidden="true" />
            <v-tooltip
              activator="parent"
              location="top"
              content-class="sd-modern-tooltip text-start"
              >{{ $t("global.actions.close") }}</v-tooltip
            >
          </v-btn>
        </header>
        <v-card-text>
          <dl class="b-contact-conversation-modern__details">
            <div>
              <dt>{{ $t("global.commons.user") }}</dt>
              <dd>{{ customerName }}</dd>
            </div>
            <div v-if="categoryName">
              <dt>{{ $t("global.commons.category") }}</dt>
              <dd>{{ categoryName }}</dd>
            </div>
            <div>
              <dt>{{ $t("global.commons.email") }}</dt>
              <dd>
                <button
                  v-copy
                  type="button"
                  :aria-label="
                    $t('global.actions.copy') +
                    ': ' +
                    $t('global.commons.email')
                  "
                >
                  {{
                    selectedContact.user
                      ? selectedContact.user.email
                      : selectedContact.email
                  }}
                  <v-tooltip
                    activator="parent"
                    location="top"
                    content-class="sd-modern-tooltip text-start"
                    >{{ $t("global.actions.copy") }}</v-tooltip
                  >
                </button>
              </dd>
            </div>
            <div>
              <dt>{{ $t("global.commons.phone") }}</dt>
              <dd>
                <button
                  v-copy
                  type="button"
                  :aria-label="
                    $t('global.actions.copy') +
                    ': ' +
                    $t('global.commons.phone')
                  "
                >
                  {{
                    selectedContact.user
                      ? selectedContact.user.phone
                      : selectedContact.phone
                  }}
                  <v-tooltip
                    activator="parent"
                    location="top"
                    content-class="sd-modern-tooltip text-start"
                    >{{ $t("global.actions.copy") }}</v-tooltip
                  >
                </button>
              </dd>
            </div>
            <div>
              <dt>{{ $t("global.commons.ticket_url") }}</dt>
              <dd>
                <button
                  v-copy
                  type="button"
                  :aria-label="
                    $t('global.actions.copy') +
                    ': ' +
                    $t('global.commons.ticket_url')
                  "
                >
                  {{ selectedContact.url
                  }}<v-tooltip
                    activator="parent"
                    location="top"
                    content-class="sd-modern-tooltip text-start"
                    >{{ $t("global.actions.copy") }}</v-tooltip
                  >
                </button>
              </dd>
            </div>
            <div>
              <dt>{{ $t("global.commons.rate") }}</dt>
              <dd>
                <u-rating-emoji
                  v-model="selectedContact.rate"
                  read-only
                  x-small
                />
              </dd>
            </div>
          </dl>
        </v-card-text>
        <v-card-actions class="b-contact-conversation-modern__dialog-actions">
          <v-btn
            variant="text"
            class="sd-modern-button sd-modern-button--small"
            @click="show_user_detail = false"
            >{{ $t("global.actions.close") }}</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog
      v-model="show_products"
      max-width="620"
      content-class="b-contact-conversation-modern-dialog"
    >
      <v-card class="b-contact-conversation-modern__dialog text-start">
        <header class="b-contact-conversation-modern__dialog-header">
          <h2>{{ $t("shop_contacts.modern.send_product") }}</h2>
          <v-btn
            icon
            variant="text"
            class="sd-modern-icon-button"
            :aria-label="$t('global.actions.close')"
            @click="show_products = false"
          >
            <v-icon icon="close" aria-hidden="true" />
            <v-tooltip
              activator="parent"
              location="top"
              content-class="sd-modern-tooltip text-start"
              >{{ $t("global.actions.close") }}</v-tooltip
            >
          </v-btn>
        </header>
        <v-card-text>
          <b-products-select-box
            v-if="show_products"
            v-model="selected_product_id"
            :shop="shop"
            auto-open-dialog
            simple-mode
            single-product-select
          />
        </v-card-text>
        <v-card-actions class="b-contact-conversation-modern__dialog-actions">
          <v-btn
            variant="text"
            class="sd-modern-button sd-modern-button--small"
            @click="show_products = false"
            >{{ $t("global.actions.back") }}</v-btn
          >
          <v-btn
            :disabled="
              !selected_product_id ||
              selectedContact.closed ||
              !canWrite ||
              busy_close ||
              busy_delete !== null
            "
            :loading="busy_contact"
            prepend-icon="send"
            color="primary"
            variant="flat"
            class="sd-modern-button sd-modern-button--small sd-modern-button--primary"
            @click="sendResponse()"
            >{{ $t("shop_contacts.modern.send_product") }}</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </section>
  <v-fade-transition v-else group hide-on-leave tag="div">
    <v-card
      v-if="show_user_detail"
      key="detail"
      class="text-start shadow-paper"
    >
      <v-card-title class="text-uppercase">
        <v-spacer></v-spacer>

        <v-btn
          :caption="$t('global.actions.close')"
          class="sub-caption -hover"
          icon
          variant="text"
          @click="show_user_detail = false"
        >
          <v-icon> close</v-icon>
        </v-btn>
      </v-card-title>
      <v-card-text>
        <v-avatar
          class="hover-scale-small pointer-pointer me-2"
          size="32"
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

        <u-rating-emoji
          v-model="selectedContact.rate"
          read-only
          x-small
        ></u-rating-emoji>

        <p>
          <b class="me-2">{{ $t("global.commons.ticket_url") }}:</b
          ><span v-copy>{{ selectedContact.url }}</span>
        </p>

        <div class="d-flex text-center">
          <div class="w-50 mb-1 p-1">
            <v-icon class="me-2">mail</v-icon>
            <span v-copy
              >{{
                selectedContact.user
                  ? selectedContact.user.email
                  : selectedContact.email
              }}
            </span>
          </div>
          <div class="w-50 mb-1 p-1">
            <v-icon class="me-2">phone</v-icon>
            <span v-copy
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
        <b-products-select-box
          v-model="selected_product_id"
          :shop="shop"
          auto-open-dialog
          simple-mode
          single-product-select
        >
        </b-products-select-box>

        <v-btn class="m-2" variant="text" @click="show_products = false">
          {{ $t("global.actions.back") }}
        </v-btn>

        <v-btn
          :disabled="!selected_product_id"
          :loading="busy_contact"
          class="m-2"
          color="success"
          @click="sendResponse"
        >
          <v-icon class="me-1" size="small">send</v-icon>
          {{ $t("global.actions.send") }}
        </v-btn>
      </v-card-text>
    </v-card>

    <v-card v-else key="chat" :rounded="false" class="chat-container" flat>
      <!--- --------------- Chat mode --------------- --->

      <v-card-text
        ref="conversation_box"
        :class="{ popup: popup }"
        class="text-start conversation-box"
      >
        <v-fade-transition group leave-absolute>
          <div
            v-for="(item, index) in selectedContact.messages"
            :key="index"
            class="my-2"
          >
            <div
              :class="{
                'same-user':
                  index > 0 &&
                  item.user_id ===
                    selectedContact.messages[index - 1].user_id &&
                  item.officer === selectedContact.messages[index - 1].officer,
              }"
              class="d-flex"
            >
              <v-avatar
                :class="{
                  'avatar-officer': item.officer,
                  'pointer-pointer': !item.officer,
                }"
                class="me-2 flex-grow-0 -hide-on-same"
                size="2rem"
                @click="!item.officer ? (show_user_detail = true) : undefined"
              >
                <img :src="getUserAvatar(item.user_id)" />
              </v-avatar>
              <div class="flex-grow-1">
                <p class="user-name -remove-on-same">{{ item.user }}</p>

                <div
                  :class="{
                    '-its-me': item.officer,
                    'empty-msg': !item.message,
                  }"
                  class="message-box"
                >
                  <v-btn
                    v-if="item.officer"
                    :disabled="busy_delete !== null"
                    :loading="busy_delete === index"
                    :title="$t('global.actions.delete')"
                    class="absolute-top-end -zero"
                    color="red"
                    icon
                    variant="text"
                    @click="deleteResponse(index)"
                  >
                    <v-icon>close</v-icon>
                  </v-btn>

                  <p
                    v-if="item.message"
                    v-html="smartConvert(item.message)"
                  ></p>
                  <v-btn
                    v-if="item.link"
                    :href="item.link"
                    class="my-2"
                    color="success"
                    rounded
                    size="small"
                    target="_blank"
                    variant="flat"
                  >
                    <v-icon class="me-1" size="small">link</v-icon>
                    {{ $t("global.actions.click_here") }}
                  </v-btn>

                  <small
                    v-if="item.date && item.message"
                    class="text-end d-block"
                  >
                    <v-icon size="small">done</v-icon>
                    {{ getLocalTimeStringSmall(item.date) }}</small
                  >
                </div>
              </div>
            </div>
            <!--- --------------- Product --------------- --->
            <s-product-preview-by-id
              v-if="item.product"
              :product-id="item.product"
              class="mt-2 max-w-300 mx-auto shadow-paper"
            >
            </s-product-preview-by-id>

            <!--- --------------- AI Response --------------- --->
          </div>
        </v-fade-transition>

        <!--- --------------- Close --------------- --->

        <p v-if="selectedContact.closed" class="font-weight-bold">
          {{ $t("global.commons.closed_at") }}
          {{ getLocalTimeStringSmall(selectedContact.closed_at) }}
        </p>
        <div class="p-2 widget-buttons">
          <v-btn
            :color="selectedContact.closed ? '#00796B' : '#7B1FA2'"
            :loading="busy_close"
            class="tnt"
            @click="closeTicket()"
          >
            <v-icon v-if="selectedContact.closed" class="me-1">done</v-icon>
            {{
              selectedContact.closed
                ? $t("global.commons.reopen_ticket")
                : $t("global.commons.close_ticket")
            }}
          </v-btn>
        </div>
      </v-card-text>

      <!--- --------------- Actions --------------- --->

      <v-card-actions class="border-top d-block pt-3 text-start z1 bg-white">
        <v-textarea
          v-model="contact_message"
          :disabled="selectedContact.closed"
          :placeholder="$t('global.commons.message')"
          :prepend-icon="'local_mall'"
          :rows="1"
          :rules="[GlobalRules.counter(1024)]"
          auto-grow
          class="small-textarea"
          density="compact"
          flat
          hide-details
          row-height="10px"
          variant="solo"
          @click:prepend="showSelectProduct()"
        >
          <template v-slot:append>
            <v-btn
              :class="{ disabled: !contact_message }"
              :loading="busy_contact"
              :title="$t('global.actions.send')"
              color="blue"
              icon
              rounded
              variant="flat"
              @click="sendResponse()"
            >
              <v-icon class="flip-image-rtl">send</v-icon>
            </v-btn>
          </template>
        </v-textarea>
      </v-card-actions>
    </v-card>
  </v-fade-transition>
</template>

<script lang="ts">
import { SupportCategory } from "@selldone/core-js/enums/support/SupportCategory";
import URatingEmoji from "../../../ui/rating/emoji/URatingEmoji.vue";
import BProductsSelectBox from "../../../backoffice/product/select-box/BProductsSelectBox.vue";
import SProductPreviewById from "../../../storefront/product/preview-by-id/SProductPreviewById.vue";
import { SmartConvertTextToHtml } from "@selldone/core-js/helper/html/HtmlHelper";
import DateMixin from "@selldone/components-vue/mixin/date/DateMixin.ts";

import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

/**
 * <b-contact-conversation>
 */
export default {
  name: "BContactConversation",
  mixins: [DateMixin],
  components: { SProductPreviewById, BProductsSelectBox, URatingEmoji },
  props: {
    modern: {
      type: Boolean,
      default: false,
    },
    canWrite: {
      type: Boolean,
      default: true,
    },
    shop: {
      required: true,
      type: Object,
    },

    selectedContact: {},

    popup: {
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

  computed: {
    customerName() {
      return (
        this.selectedContact.user?.name ||
        this.selectedContact.name ||
        this.$t("global.commons.user")
      );
    },
    categoryName() {
      const category = SupportCategory[this.selectedContact.category];
      return category ? this.$t(category.name) : this.selectedContact.category;
    },
  },

  mounted() {
    if (!this.modern) return;
    this.$nextTick(() => {
      const conversation = this.$refs.conversation_box;
      if (conversation) conversation.scrollTop = conversation.scrollHeight;
    });
  },

  methods: {
    sendResponse() {
      if (
        this.modern &&
        (!this.canWrite ||
          this.selectedContact.closed ||
          this.busy_contact ||
          this.busy_close ||
          this.busy_delete !== null ||
          (this.contact_message || "").length > 1024)
      )
        return;
      // Can send message product without body:
      if (!this.contact_message && !this.selected_product_id) return;

      if (this.contact_message)
        this.contact_message = this.contact_message.replace(/<[^>]*>?/gm, "");
      if (
        this.modern &&
        !this.contact_message?.trim() &&
        !this.selected_product_id
      )
        return;

      this.busy_contact = true;

      axios
        .put(
          window.API.PUT_SHOP_CONTACT_US_UPDATE_MESSAGE(
            this.shop.id,
            this.selectedContact.id,
          ),

          {
            message: this.contact_message,
            link: this.contact_link,
            mail: this.send_mail,
            product: this.selected_product_id,
          },
        )
        .then(({ data }) => {
          if (!data.error) {
            if (!this.popup)
              // Not show success message in popup mode!
              NotificationService.showSuccessAlert(
                this.modern ? null : "Send message",
                this.modern
                  ? this.$t("shop_contacts.modern.reply_sent")
                  : "Your response sent successfully.",
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
              if (objDiv) objDiv.scrollTop = objDiv.scrollHeight + 80;
            });
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((e) => NotificationService.showLaravelError(e))
        .finally(() => {
          this.busy_contact = false;
        });
    },

    deleteResponse(index) {
      // A closed ticket must be reopened before a staff response can be removed.
      if (
        this.modern &&
        (!this.canWrite ||
          this.selectedContact.closed ||
          !this.selectedContact.messages[index]?.officer ||
          this.busy_contact ||
          this.busy_close ||
          this.busy_delete !== null)
      )
        return;
      const contact = this.selectedContact;
      const response = contact.messages[index];
      NotificationService.openDangerAlert(
        this.modern
          ? this.$t("shop_contacts.modern.delete_title")
          : "Delete message",
        this.modern
          ? this.$t("shop_contacts.modern.delete_message")
          : "Are you sure to delete this response?",
        this.modern
          ? this.$t("shop_contacts.modern.delete_confirm")
          : "Yes, delete now",
        () => {
          if (
            this.modern &&
            (!this.canWrite ||
              this.selectedContact?.id !== contact.id ||
              this.selectedContact.closed ||
              this.selectedContact.messages[index] !== response ||
              this.busy_contact ||
              this.busy_close ||
              this.busy_delete !== null)
          )
            return;
          this.busy_delete = index;
          axios
            .delete(
              window.API.DELETE_SHOP_CONTACT_US_MESSAGE_RESPONSE(
                this.shop.id,
                this.selectedContact.id,
                index,
              ),
            )
            .then(({ data }) => {
              if (!data.error) {
                if (!this.popup)
                  // Not show success message in popup mode!
                  NotificationService.showSuccessAlert(
                    this.modern ? null : "Remove message",
                    this.modern
                      ? this.$t("shop_contacts.modern.response_removed")
                      : "Message response removed successfully.",
                  );
                this.$emit("update:selectedContact", data.contact);
                this.$emit("update", data.contact);
              } else {
                NotificationService.showErrorAlert(null, data.error_msg);
              }
            })
            .catch((e) => NotificationService.showLaravelError(e))
            .finally(() => {
              this.busy_delete = null;
            });
        },
      );
    },

    closeTicket() {
      if (
        this.modern &&
        (!this.canWrite ||
          this.busy_close ||
          this.busy_contact ||
          this.busy_delete !== null)
      )
        return;
      this.busy_close = true;
      axios
        .post(
          window.API.POST_SHOP_CONTACT_US_CLOSE_TICKET(
            this.shop.id,
            this.selectedContact.id,
          ),

          {
            close: !this.selectedContact.closed,
          },
        )
        .then(({ data }) => {
          if (!data.error) {
            if (!this.popup)
              // Not show success message in popup mode!
              NotificationService.showSuccessAlert(
                this.modern ? null : "Ticket closed",
                this.modern
                  ? this.$t(
                      data.contact.closed
                        ? "shop_contacts.modern.closed_success"
                        : "shop_contacts.modern.reopened_success",
                    )
                  : "This ticket closed successfully.",
              );
            this.$emit("update:selectedContact", data.contact);
            this.$emit("update", data.contact);
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((e) => NotificationService.showLaravelError(e))
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
            this.selectedContact.id,
          ),
          {
            rate: rate,
          },
        )
        .then(({ data }) => {
          if (!data.error) {
            NotificationService.showSuccessAlert(
              null,
              "Thanks, Your rate has been saved.",
            );

            this.$emit("update:selectedContact", data.contact);
            this.$emit("update", data.contact);
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((e) => NotificationService.showLaravelError(e))
        .finally(() => {
          this.busy_rate = false;
        });
    },

    showSelectProduct() {
      if (
        this.modern &&
        (!this.canWrite ||
          this.selectedContact.closed ||
          this.busy_contact ||
          this.busy_close ||
          this.busy_delete !== null)
      )
        return;
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

<style lang="scss" scoped>
.b-contact-conversation-modern,
.b-contact-conversation-modern__dialog,
.b-contact-conversation-modern__message-menu {
  --sd-modern-border: rgba(var(--v-theme-on-surface), 0.09);
  --sd-modern-muted: rgba(var(--v-theme-on-surface), 0.66);
  color: rgb(var(--v-theme-on-surface));
  background: rgb(var(--v-theme-surface));
  font-family: inherit;
  font-size: 13px;
  line-height: 21px;
  min-width: 0;
}

.b-contact-conversation-modern {
  display: flex;
  flex-direction: column;
  border-radius: inherit;

  &.b-contacts-messenger__conversation {
    height: 100%;
    min-height: 0;
    overflow: hidden;

    .b-contact-conversation-modern__header,
    .b-contact-conversation-modern__composer {
      flex: 0 0 auto;
    }

    .b-contact-conversation-modern__messages {
      flex: 1 1 auto;
      min-height: 0;
      overflow-y: auto;
      overscroll-behavior: contain;
      scrollbar-width: thin;
    }

    .b-contact-conversation-modern__message,
    .b-contact-conversation-modern__history,
    .b-contact-conversation-modern__closed {
      flex-shrink: 0;
    }
  }

  &__header,
  &__identity,
  &__actions,
  &__composer-actions,
  &__send,
  &__dialog-header,
  &__dialog-actions {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
  }

  &__header {
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 12px;
    padding: 18px 20px;
    min-height: 78px;
    border-block-end: 1px solid var(--sd-modern-border);
  }

  &__identity {
    flex: 1;
  }
  &__customer {
    min-width: 0;
  }
  &__customer h2 {
    margin: 0;
    font-size: 14px;
    line-height: 22px;
    font-weight: 500;
    overflow-wrap: anywhere;
  }
  &__customer p {
    margin: 0;
    font-size: 11px;
    line-height: 17px;
    color: var(--sd-modern-muted);
    overflow-wrap: anywhere;
  }

  &__actions {
    gap: 8px;

    > .sd-modern-button {
      border-color: var(--sd-modern-border);
    }
  }
  &__messages {
    display: flex;
    flex-direction: column;
    gap: 21px;
    min-height: 330px;
    padding: 22px 23px 24px;
  }
  &__history {
    align-self: center;
    margin: 0;
    font-size: 11px;
    line-height: 17px;
    color: var(--sd-modern-muted);
  }
  &__message {
    align-self: flex-start;
    max-width: 91%;
    min-width: 0;
  }
  &__message--staff {
    align-self: flex-end;
  }
  &__author {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 6px;
    margin-block-end: 5px;
    font-size: 11px;
    line-height: 17px;
    color: var(--sd-modern-muted);
  }
  &__message--staff &__author {
    justify-content: flex-end;
  }
  &__bubble {
    padding: 11px 13px;
    border-radius: 11px;
    border-end-start-radius: 3px;
    background: rgba(var(--v-theme-on-surface), 0.035);
    font-size: 13px;
    line-height: 21px;
    overflow-wrap: anywhere;
  }
  &__message--staff &__bubble {
    border-end-start-radius: 11px;
    border-end-end-radius: 3px;
    background: rgba(var(--v-theme-primary), 0.055);
  }
  &__body {
    white-space: pre-line;
    user-select: text;
    :deep(p) {
      margin: 0;
    }
    :deep(a) {
      color: rgb(var(--v-theme-primary));
    }
  }
  &__product {
    width: 280px;
    max-width: 100%;
    margin-block-start: 9px;
    :deep(.widget) {
      display: grid;
      grid-template-columns: 48px minmax(0, 1fr);
      column-gap: 11px;
      align-items: center;
      min-height: 0;
      padding: 11px;
      border: 1px solid var(--sd-modern-border);
      border-radius: 10px;
      background: rgb(var(--v-theme-surface));
      box-shadow: none;
      font-size: 12px;
      line-height: 18px;
    }
    :deep(.widget > .v-img) {
      grid-row: 1 / span 3;
      width: 48px !important;
      height: 48px !important;
      border-radius: 8px;
    }
    :deep(.widget > p) {
      grid-column: 2;
      margin: 0 !important;
      min-width: 0;
      overflow-wrap: anywhere;
      font-size: 12px;
      line-height: 18px;
    }
    :deep(.widget > .font-weight-bold) {
      font-weight: 500 !important;
    }
    :deep(.widget > .product-variant-view) {
      grid-column: 1 / -1;
      margin-block-start: 8px;
    }
  }
  &__message-meta {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 7px;
    margin-block-start: 5px;
    font-size: 11px;
    line-height: 17px;
    color: var(--sd-modern-muted);
    font-variant-numeric: tabular-nums;
  }
  &__closed {
    margin: 0;
    color: var(--sd-modern-muted);
    font-size: 12px;
    line-height: 19px;
    text-align: center;
  }
  &__composer {
    padding: 17px 20px 20px;
    border-block-start: 1px solid var(--sd-modern-border);
  }
  &__editor {
    padding: 10px 12px 9px;
    border: 1px solid var(--sd-modern-border);
    border-radius: 11px;
    background: rgb(var(--v-theme-surface));
    &:focus-within {
      border-color: rgb(var(--v-theme-primary));
    }
  }
  &__composer-heading {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-block-end: 8px;
    font-size: 12px;
    line-height: 19px;
    font-weight: 500;
  }
  &__reply {
    // The editor supplies padding; Vuetify's label mask would hide the first text line.
    :deep(textarea.v-field__input) {
      mask-image: none;
      -webkit-mask-image: none;
    }
    :deep(textarea::placeholder) {
      color: var(--sd-modern-muted);
      opacity: 1;
    }
    :deep(.v-field__input) {
      padding: 0;
      min-height: 76px;
      font-family: inherit;
      font-size: 13px;
      line-height: 21px;
    }
  }
  &__composer-actions {
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 8px;
    margin-block-start: 8px;
  }
  &__send {
    gap: 9px;
    margin-inline-start: auto;
  }
  &__counter {
    color: var(--sd-modern-muted);
    font-size: 11px;
    line-height: 17px;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }
  &__message-action {
    --sd-modern-icon-button-size: 28px;
    :deep(.v-icon) {
      font-size: 16px;
    }
  }
  &__message-menu {
    padding: 5px;
    border: 1px solid var(--sd-modern-border);
    border-radius: 10px;
  }
  &__message-menu-item {
    width: 100%;
    min-height: 36px;
    padding-inline: 8px;
    border-radius: 6px;
    :deep(.v-list-item-title) {
      font-size: 12px;
      line-height: 18px;
    }
    :deep(.v-list-item__prepend > .v-icon) {
      font-size: 18px;
      opacity: 1;
    }
    :deep(.v-list-item__prepend > .v-list-item__spacer) {
      width: 8px;
    }
  }
  &__dialog {
    border-radius: 16px;
  }
  &__dialog-header {
    justify-content: space-between;
    padding: 20px 24px;
    border-block-end: 1px solid var(--sd-modern-border);
    h2 {
      margin: 0;
      font-size: 18px;
      line-height: 26px;
      font-weight: 500;
    }
  }
  &__dialog-actions {
    justify-content: flex-end;
    padding: 16px 24px 20px;
    gap: 10px;
  }
  &__details {
    margin: 0;
    display: grid;
    gap: 18px;
    min-width: 0;
    > div {
      min-width: 0;
    }
    dt {
      color: var(--sd-modern-muted);
      font-size: 12px;
      line-height: 19px;
      margin-block-end: 4px;
    }
    dd {
      margin: 0;
      overflow-wrap: anywhere;
    }
    button {
      text-align: start;
      max-width: 100%;
      overflow-wrap: anywhere;
    }
    button:focus-visible {
      outline: 2px solid rgb(var(--v-theme-primary));
      outline-offset: 3px;
    }
  }

  @media (max-width: 760px) {
    &__header {
      padding: 16px 18px;
    }
    &__identity {
      flex-basis: 100%;
    }
    &__actions {
      width: 100%;
      justify-content: flex-end;
    }
    &__messages {
      padding: 20px 18px;
    }
    &__message {
      max-width: 96%;
    }
    &__composer {
      padding: 17px 18px;
    }
    &__reply :deep(.v-field__input) {
      font-size: 16px;
    }
    &__dialog-header {
      padding: 18px;
    }
    &__dialog-actions {
      padding: 16px 18px;
      flex-wrap: wrap;
    }
    &__details button {
      min-height: 44px;
    }
    &__message-action {
      --sd-modern-icon-button-size: 44px;
    }
  }
}
.b-contact-conversation-modern__message-menu-item {
  @media (max-width: 760px), (pointer: coarse) {
    min-height: 44px;
  }
}
</style>

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
