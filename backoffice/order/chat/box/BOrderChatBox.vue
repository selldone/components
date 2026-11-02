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

<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
  <!-- █████████████████████ Chat Messages █████████████████████ -->

  <div :class="{ 'sd-modern-content b-order-chat-modern': modern, 'b-order-chat-modern--dialog': isConversationDialog }">
    <template v-if="modern">
      <header v-if="isConversationDialog" class="b-order-chat-modern__dialog-header">
        <span class="b-order-chat-modern__dialog-icon"><v-icon size="20" aria-hidden="true">question_answer</v-icon></span>
        <div class="b-order-chat-modern__dialog-heading">
          <h2>{{ $t('b_order_chat_box.modern.dialog_title') }}</h2>
          <p><bdi>{{ getBasketOrderCode(basket) }}</bdi><span aria-hidden="true">·</span><span>{{ buyer?.name || $t('global.commons.guest') }}</span></p>
        </div>
        <v-btn icon variant="text" class="sd-modern-icon-button" :aria-label="$t('global.actions.close')" @click="$emit('close')">
          <v-icon size="16" aria-hidden="true">close</v-icon>
          <v-tooltip activator="parent" location="top" content-class="sd-modern-tooltip text-start" open-on-focus>{{ $t('global.actions.close') }}</v-tooltip>
        </v-btn>
      </header>
      <header v-else class="sd-modern-header b-order-chat-modern__header">
        <div>
          <div class="sd-modern-title">
            <span class="sd-modern-icon sd-modern-icon--plain"
              ><v-icon aria-hidden="true">question_answer</v-icon></span
            >
            <h1 class="sd-modern-title-text b-order-chat-modern__title">
              {{ $t("b_order_chat_box.modern.title") }}
            </h1>
          </div>
          <div class="b-order-chat-modern__subtitle">
            <p class="sd-modern-subtitle">{{ $t("b_order_chat_box.modern.subtitle") }}</p>
            <v-btn
              icon
              variant="text"
              class="sd-modern-icon-button sd-modern-info-button"
              :aria-label="$t('b_order_chat_box.modern.help_label')"
            >
              <v-icon size="16" aria-hidden="true">info_outline</v-icon>
              <v-tooltip
                activator="parent"
                location="top"
                content-class="sd-modern-tooltip text-start"
                open-on-focus
                open-on-click
                >{{ $t("b_order_chat_box.modern.help") }}</v-tooltip
              >
            </v-btn>
          </div>
        </div>
        <v-btn
          class="sd-modern-button"
          variant="outlined"
          :disabled="!statusEmailRecipient"
          @click="email_preview = true"
        >
          <v-icon start size="18" aria-hidden="true">forward_to_inbox</v-icon
          >{{ $t("b_order_chat_box.modern.email_action") }}
        </v-btn>
      </header>

      <section
        class="sd-modern-widget b-order-chat-modern__conversation"
        :aria-label="$t('global.commons.messages')"
      >
        <header v-if="!isConversationDialog" class="b-order-chat-modern__recipient">
          <div class="b-order-chat-modern__person">
            <v-avatar size="34" class="b-order-chat-modern__avatar"
              ><v-img v-if="basket.user_id" :src="getUserAvatar(basket.user_id)" /><v-icon
                v-else
                size="20"
                aria-hidden="true"
                >person_outline</v-icon
              ></v-avatar
            >
            <div>
              <h2>{{ buyer?.name || $t("global.commons.guest") }}</h2>
              <span>{{ buyer?.email || $t("b_order_chat_box.modern.no_email") }}</span>
            </div>
          </div>
          <span class="b-order-chat-modern__channel"
            ><v-icon size="16" aria-hidden="true">shopping_bag</v-icon
            >{{ $t("b_order_chat_box.modern.order_chat") }} ·
            <bdi>{{ getBasketOrderCode(basket) }}</bdi></span
          >
        </header>
        <div ref="conversationHistory" class="b-order-chat-modern__history" :role="isConversationDialog ? 'region' : undefined" :tabindex="isConversationDialog ? 0 : undefined" :aria-label="$t('b_order_chat_box.modern.history_label')">
          <s-order-chat-message
            v-for="(message, i) in chat"
            :key="i"
            :basket="basket"
            :message="message"
            modern
            is-admin
            has-delete
          />
          <div v-if="!chat?.length" class="b-order-chat-modern__empty">
            <v-icon size="24" aria-hidden="true">forum</v-icon>
            <div>
              <h3>{{ $t("b_order_chat_box.modern.empty_title") }}</h3>
              <p>{{ $t("b_order_chat_box.modern.empty_message") }}</p>
            </div>
          </div>
        </div>
        <form class="b-order-chat-modern__composer" @submit.prevent="addChat">
          <div class="b-order-chat-modern__composer-heading">
            <template v-if="isConversationDialog">
              <label class="b-order-chat-modern__field-label" :for="`order-chat-message-${basket.id}`">{{ $t('b_order_chat_box.modern.write_message') }}</label>
              <v-btn class="sd-modern-button sd-modern-button--compact sd-modern-button--inline" variant="text" :loading="busy_fetch_templates" @click="dialog_templates = true">
                <v-icon start size="16" aria-hidden="true">text_snippet</v-icon>{{ $t('b_order_chat_box.modern.templates_action') }}<v-icon end size="16" aria-hidden="true">expand_more</v-icon>
              </v-btn>
            </template>
            <div v-else class="b-order-chat-modern__sender">
              <v-avatar size="24" class="b-order-chat-modern__avatar"
                ><v-img v-if="USER_ID()" :src="getUserAvatar(USER_ID())" /><v-icon
                  v-else
                  size="16"
                  aria-hidden="true"
                  >person_outline</v-icon
                ></v-avatar
              ><span>{{ $t("b_order_chat_box.modern.reply_as", { name: senderName }) }}</span>
            </div>
            <span v-if="!isConversationDialog">{{ $t("b_order_chat_box.modern.visible_to_customer") }}</span>
          </div>
          <label
            v-if="!isConversationDialog"
            class="b-order-chat-modern__field-label"
            :for="`order-chat-message-${basket.id}`"
            >{{ $t("global.commons.message") }}</label
          >
          <v-textarea
            :id="`order-chat-message-${basket.id}`"
            ref="modernMessage"
            v-model="body_input"
            :aria-describedby="`order-chat-count-${basket.id}`"
            :placeholder="$t('b_order_chat_box.modern.message_placeholder')"
            :readonly="busy_add"
            :maxlength="1024"
            :rows="isConversationDialog ? 3 : 4"
            :max-rows="isConversationDialog ? 8 : undefined"
            auto-grow
            hide-details
            variant="outlined"
            class="b-order-chat-modern__input"
          />
          <div class="b-order-chat-modern__quick-replies">
            <span v-if="templates.length && !isConversationDialog">{{ $t("b_order_chat_box.modern.quick_replies") }}</span>
            <u-smart-suggestion
              :samples="templates"
              :preview-count="isConversationDialog ? 3 : 2"
              modern
              title-key="title"
              value-key="body"
              @select="setTemplate"
            />
            <v-btn
              v-if="!isConversationDialog"
              class="sd-modern-button sd-modern-button--inline"
              variant="text"
              :loading="busy_fetch_templates"
              @click="dialog_templates = true"
              ><v-icon start size="16" aria-hidden="true">tune</v-icon
              >{{ $t("b_order_chat_box.modern.manage_replies") }}</v-btn
            >
          </div>
          <div class="b-order-chat-modern__composer-actions">
            <div v-if="isConversationDialog" class="b-order-chat-modern__dialog-recipient">
              <span>{{ $t('b_order_chat_box.modern.to_name', { name: buyer?.name || $t('global.commons.guest') }) }}</span>
              <bdi v-if="buyer?.email" dir="ltr">{{ buyer.email }}</bdi>
              <span v-else>{{ $t('b_order_chat_box.modern.no_email') }}</span>
            </div>
            <span :id="`order-chat-count-${basket.id}`" class="b-order-chat-modern__count"
              >{{ (body_input || "").length }} / 1,024</span
            >
            <span v-if="buyer?.email && !isConversationDialog" class="b-order-chat-modern__to">{{
              $t("b_order_chat_box.modern.to_customer", { email: buyer.email })
            }}</span>
            <v-btn
              type="submit"
              class="sd-modern-button b-order-chat-modern__send"
              color="primary"
              variant="flat"
              :disabled="!canSendMessage"
              :loading="busy_add"
              ><v-icon start size="18" aria-hidden="true">send</v-icon
              >{{ $t("b_order_chat_box.modern.send_message") }}</v-btn
            >
          </div>
          <div class="b-order-chat-modern__notification">
            <v-icon size="15" aria-hidden="true">notifications_none</v-icon
            ><span>{{
              $t(
                buyer?.email
                  ? "b_order_chat_box.modern.notification_summary"
                  : "b_order_chat_box.modern.no_email_help",
              )
            }}</span
            ><v-btn
              icon
              variant="text"
              class="sd-modern-icon-button sd-modern-info-button"
              :aria-label="$t('b_order_chat_box.modern.notification_help_label')"
              ><v-icon size="16" aria-hidden="true">info_outline</v-icon
              ><v-tooltip
                activator="parent"
                location="top"
                content-class="sd-modern-tooltip text-start"
                open-on-focus
                open-on-click
                >{{ $t("b_order_chat_box.modern.notification_help") }}</v-tooltip
              ></v-btn
            >
          </div>
        </form>
      </section>

      <section v-if="isConversationDialog" class="b-order-chat-modern__tools" :aria-label="$t('b_order_chat_box.modern.order_links_action')">
        <div class="b-order-chat-modern__tool-actions">
          <v-btn class="sd-modern-button sd-modern-button--compact sd-modern-button--inline" variant="text" :aria-expanded="order_links_open" :aria-controls="`order-chat-links-${basket.id}`" @click="order_links_open = !order_links_open">
            <v-icon start size="16" aria-hidden="true">link</v-icon>{{ $t('b_order_chat_box.modern.order_links_action') }}<v-icon end size="16" aria-hidden="true">{{ order_links_open ? 'expand_less' : 'expand_more' }}</v-icon>
          </v-btn>
          <v-btn class="sd-modern-button sd-modern-button--compact sd-modern-button--inline" variant="text" :disabled="!statusEmailRecipient" @click="email_preview = true">
            <v-icon start size="16" aria-hidden="true">mail_outline</v-icon>{{ $t('b_order_chat_box.modern.email_dialog_action') }}
          </v-btn>
        </div>
        <div v-show="order_links_open" :id="`order-chat-links-${basket.id}`" class="b-order-chat-modern__links">
          <b-order-share :basket="basket" modern class="b-order-chat-modern__dialog-access" />
        </div>
      </section>

      <v-dialog
        v-model="dialog_templates"
        max-width="640"
        scrollable
        :aria-label="$t('b_order_chat_box.modern.saved_replies')"
      >
        <v-card class="sd-modern-widget b-order-chat-dialog text-start">
          <header class="b-order-chat-dialog__header">
            <div>
              <h2>{{ $t("b_order_chat_box.modern.saved_replies") }}</h2>
              <p>{{ $t("b_order_chat_box.modern.saved_replies_subtitle") }}</p>
            </div>
            <v-btn
              icon
              variant="text"
              class="sd-modern-icon-button"
              :aria-label="$t('global.actions.close')"
              @click="dialog_templates = false"
              ><v-icon size="16" aria-hidden="true">close</v-icon
              ><v-tooltip
                activator="parent"
                location="top"
                content-class="sd-modern-tooltip text-start"
                open-on-focus
                >{{ $t("global.actions.close") }}</v-tooltip
              ></v-btn
            >
          </header>
          <v-card-text class="b-order-chat-dialog__body">
            <div v-if="templates_failed" class="sd-modern-notice" role="alert">
              <v-icon size="18" aria-hidden="true">error_outline</v-icon
              ><span>{{ $t("b_order_chat_box.modern.template_load_error") }}</span
              ><v-btn
                class="sd-modern-button"
                variant="text"
                :loading="busy_fetch_templates"
                @click="fetchMessageTemplates"
                ><v-icon start size="16" aria-hidden="true">refresh</v-icon
                >{{ $t("b_order_chat_box.modern.retry") }}</v-btn
              >
            </div>
            <p
              v-else-if="!templates.length && !busy_fetch_templates"
              class="b-order-chat-dialog__muted"
            >
              {{ $t("b_order_chat_box.modern.no_replies") }}
            </p>
            <div v-for="it in templates" :key="it.id" class="b-order-chat-dialog__reply">
              <div>
                <h3>{{ it.title }}</h3>
                <p>{{ personalizeTemplate(it.body) }}</p>
              </div>
              <v-btn
                icon
                variant="text"
                class="sd-modern-icon-button"
                :aria-label="$t('b_order_chat_box.modern.edit_reply_label', { title: it.title })"
                @click="showEditTemplateMessage(it)"
                ><v-icon size="16" aria-hidden="true">edit</v-icon
                ><v-tooltip
                  activator="parent"
                  location="top"
                  content-class="sd-modern-tooltip text-start"
                  open-on-focus
                  >{{ $t("b_order_chat_box.modern.edit_reply") }}</v-tooltip
                ></v-btn
              ><v-btn
                class="sd-modern-button sd-modern-button--inline"
                variant="text"
                color="primary"
                @click="setTemplate(it.body)"
                ><v-icon start size="16" aria-hidden="true">edit_note</v-icon
                >{{ $t("b_order_chat_box.modern.use_reply") }}</v-btn
              >
            </div>
          </v-card-text>
          <component :is="isConversationDialog ? 'div' : 'footer'" class="b-order-chat-dialog__actions">
            <v-btn class="sd-modern-button" variant="outlined" @click="showAddTemplateMessage"
              ><v-icon start size="18" aria-hidden="true">add</v-icon
              >{{ $t("b_order_chat_box.modern.add_reply") }}</v-btn
            >
          </component>
        </v-card>
      </v-dialog>
      <v-dialog
        v-model="dialog_replace"
        max-width="480"
        :aria-label="$t('b_order_chat_box.modern.replace_title')"
      >
        <v-card class="sd-modern-widget b-order-chat-dialog text-start"
          ><header class="b-order-chat-dialog__header">
            <h2>{{ $t("b_order_chat_box.modern.replace_title") }}</h2>
          </header>
          <p>{{ $t("b_order_chat_box.modern.replace_message") }}</p>
          <component :is="isConversationDialog ? 'div' : 'footer'" class="b-order-chat-dialog__actions">
            <v-btn class="sd-modern-button" variant="outlined" @click="dialog_replace = false">{{
              $t("global.actions.cancel")
            }}</v-btn
            ><v-btn
              class="sd-modern-button"
              color="primary"
              variant="flat"
              @click="applyPendingTemplate"
              ><v-icon start size="18" aria-hidden="true">edit_note</v-icon
              >{{ $t("b_order_chat_box.modern.replace_action") }}</v-btn
            >
          </component></v-card
        >
      </v-dialog>
    </template>
    <template v-else>
      <div v-if="chat" class="widget-box -large mb-5">
        <u-widget-header :title="$t('global.commons.messages')" icon="3p"></u-widget-header>
        <v-list-subheader>
          {{ $t("global.order_chat.seller.history.subtitle") }}
        </v-list-subheader>
        <s-order-chat-message
          v-for="(message, i) in chat"
          :key="i"
          :basket="basket"
          is-admin
          :message="message"
          class="my-2 c-bubble"
          has-delete
        >
        </s-order-chat-message>
      </div>

      <div class="widget-box -large mb-5">
        <u-widget-header
          :title="$t('global.actions.add_new_message')"
          icon="add_comment"
        ></u-widget-header>
        <v-list-subheader>
          {{ $t("global.order_chat.seller.new_message.subtitle") }}
        </v-list-subheader>

        <div class="d-flex align-center my-3">
          <v-avatar :size="32" class="avatar-gradient -thin -user me-2">
            <v-img v-if="USER_ID()" :src="getUserAvatar(USER_ID())" />
            <v-icon v-else>account_circle</v-icon>
          </v-avatar>

          <div class="flex-grow-1">
            <b>{{
              user?.profile?.name
                ? user.profile.name
                : user
                  ? user.name
                  : $t("global.commons.guest")
            }}</b>
            <small class="d-block">{{ $t("global.commons.now") }}</small>
          </div>
        </div>

        <v-textarea
          v-model="body_input"
          :counter="1024"
          :label="$t('global.commons.message')"
          auto-grow
          bg-color="#fafafa"
          flat
          rounded="xl"
          variant="solo-filled"
          messages=" "
        >
          <template v-slot:message>
            <u-smart-suggestion
              :samples="templates"
              @select="(v) => setTemplate(v)"
              title-key="title"
              value-key="body"
            ></u-smart-suggestion>
          </template>
        </v-textarea>

        <div class="widget-buttons">
          <v-btn
            :class="{ disabled: !body_input }"
            :disabled="!body_input"
            :loading="busy_add"
            color="primary"
            size="x-large"
            variant="elevated"
            @click="addChat"
          >
            <div>
              <div>
                {{ $t("global.actions.send") }}
              </div>
              <div v-if="buyer?.email" class="small tnt mt-1">
                {{ buyer.email }}
              </div>
            </div>

            <v-icon end class="flip-rtl">send</v-icon>
          </v-btn>
        </div>

        <hr class="my-5" />
        <u-widget-header :title="$t('b_order_chat_box.title')" icon="bolt"></u-widget-header>
        <v-list-subheader>
          {{ $t("b_order_chat_box.subtitle") }}
        </v-list-subheader>

        <v-row no-gutters>
          <v-btn
            v-if="buyer?.email"
            class="ma-1 tnt"
            @click="email_preview = true"
            variant="flat"
            rounded="lg"
            prepend-icon="mail_outline"
          >
            <div>
              {{ $t("b_order_chat_box.send_update_email_action") }}

              <div class="small">
                {{ buyer.email }}
              </div>
            </div>
          </v-btn>

          <v-btn
            class="ma-1 tnt"
            @click="showAddTemplateMessage"
            variant="flat"
            rounded="lg"
            prepend-icon="assignment_add"
          >
            {{ $t("b_order_chat_box.add_template_action") }}
          </v-btn>

          <v-btn
            v-for="it in templates"
            :key="it.id"
            @click="setTemplate(it.body)"
            variant="flat"
            rounded="lg"
            class="ma-1 tnt"
            prepend-icon="chat_bubble_outline"
          >
            {{ it.title }}

            <v-icon
              @click.stop="showEditTemplateMessage(it)"
              end
              class="hover-scale-small"
              title="Edit Template"
              >edit
            </v-icon>
          </v-btn>
        </v-row>
      </div>
    </template>
    <!-- █████████████████████ Secure Order Link █████████████████████ -->

    <b-order-share
      v-if="!isConversationDialog"
      :class="modern ? 'b-order-chat-modern__access' : 'mb-5'"
      :basket="basket"
      :modern="modern"
    ></b-order-share>

    <!-- █████████████████████ Dialog > Send order update email █████████████████████ -->
    <component
      :is="modern ? 'VDialog' : 'VBottomSheet'"
      v-if="modern ? statusEmailRecipient : buyer?.email"
      v-model="email_preview"
      content-class="rounded-t-xl"
      width="860"
      max-width="98vw"
      scrollable
    >
      <v-card
        :class="modern ? 'sd-modern-widget b-order-chat-dialog text-start' : 'text-start'"
        rounded="t-xl"
      >
        <v-card-title>
          <v-icon class="me-2">forward_to_inbox</v-icon>
          {{ $t("b_order_chat_box.send_update_email.title") }}
        </v-card-title>

        <v-card-text>
          <template v-if="modern">
            <p class="b-order-chat-dialog__muted">
              {{ $t("b_order_chat_box.modern.email_subtitle") }}
            </p>
            <p class="b-order-chat-dialog__email-to">
              {{ $t("b_order_chat_box.modern.to_customer", { email: statusEmailRecipient }) }}
            </p>
            <div
              v-if="!emailServiceReady"
              class="sd-modern-notice b-order-chat-dialog__notice"
              role="alert"
            >
              <v-icon size="18" aria-hidden="true">error_outline</v-icon>
              <div>
                {{ $t("b_order_chat_box.modern.email_unavailable")
                }}<v-btn
                  class="sd-modern-button sd-modern-button--inline"
                  variant="text"
                  color="primary"
                  :to="{ name: 'BPageShopSettingEmail', query: { tab: 'custom' } }"
                  target="_blank"
                  rel="noopener noreferrer"
                  ><v-icon start size="16" aria-hidden="true">settings</v-icon
                  >{{ $t("b_order_chat_box.modern.email_settings")
                  }}<v-icon end size="16" aria-hidden="true">north_east</v-icon></v-btn
                >
              </div>
            </div>
            <div class="sd-modern-notice b-order-chat-dialog__notice">
              <v-icon size="18" aria-hidden="true">info_outline</v-icon
              ><span>{{ $t("b_order_chat_box.modern.email_help") }}</span>
            </div>
          </template>
          <v-alert
            v-if="!modern && !$shop.mail_service?.enable"
            class="my-3"
            variant="tonal"
            border="start"
            type="error"
            density="compact"
          >
            {{ $t("b_order_chat_box.send_update_email.need_set_service_alert.message") }}

            <div class="py-1 text-end">
              <v-btn
                class="tnt"
                size="small"
                :to="{
                  name: 'BPageShopSettingEmail',
                  query: { tab: 'custom' },
                }"
                target="_blank"
                prepend-icon="settings"
                append-icon="launch"
                color="red"
              >
                {{ $t("b_order_chat_box.send_update_email.need_set_service_alert.action") }}
              </v-btn>
            </div>
          </v-alert>

          <iframe
            v-if="email_render_url"
            :src="email_render_url"
            :title="$t('b_order_chat_box.modern.email_preview_title')"
            :style="{ width: '100%', height: '100%', minHeight: '75vh' }"
            class="thin-scroll rounded-2rem"
            scrolling="yes"
            style="border: none; border-radius: 0"
          >
          </iframe>
        </v-card-text>

        <v-card-actions>
          <div :class="modern ? 'b-order-chat-dialog__actions' : 'widget-buttons'">
            <v-btn
              :size="modern ? 'default' : 'x-large'"
              :class="{ 'sd-modern-button': modern }"
              variant="text"
              @click="email_preview = false"
              prepend-icon="close"
            >
              {{ $t("global.actions.close") }}
            </v-btn>

            <v-btn
              v-if="modern ? statusEmailRecipient : buyer?.email"
              @click="sendOrderUpdateEmail"
              :loading="busy_send_update"
              :disabled="modern && (!emailServiceReady || busy_send_update)"
              :class="{ 'sd-modern-button': modern }"
              variant="elevated"
              color="primary"
              :size="modern ? 'default' : 'x-large'"
            >
              <div>
                {{ $t("b_order_chat_box.send_update_email.send_action") }}

                <div class="small mt-1">
                  {{ modern ? statusEmailRecipient : buyer.email }}
                </div>
              </div>

              <v-icon end class="flip-rtl">send</v-icon>
            </v-btn>
          </div>
        </v-card-actions>
      </v-card>
    </component>

    <!-- █████████████████████ Dialog > Add template message █████████████████████ -->
    <component
      :is="modern ? 'VDialog' : 'VBottomSheet'"
      v-model="dialog_add_template"
      content-class="rounded-t-xl"
      :width="modern ? 640 : 860"
      max-width="98vw"
      scrollable
    >
      <v-card
        :class="modern ? 'sd-modern-widget b-order-chat-dialog text-start' : 'text-start'"
        rounded="t-xl"
      >
        <v-card-title>
          <v-icon class="me-2">assignment_add</v-icon>
          {{
            modern
              ? $t(
                  selected_template
                    ? "b_order_chat_box.modern.edit_reply"
                    : "b_order_chat_box.modern.add_reply",
                )
              : selected_template
                ? $t("b_order_chat_box.add_template.edit_title")
                : $t("b_order_chat_box.add_template.add_title")
          }}
        </v-card-title>

        <v-card-text>
          {{
            $t(
              modern
                ? "b_order_chat_box.modern.template_scope"
                : "b_order_chat_box.add_template.message",
            )
          }}

          <div class="max-widget-width my-5">
            <v-text-field
              v-model="template_title"
              variant="outlined"
              :label="
                $t(
                  modern
                    ? 'b_order_chat_box.modern.template_title'
                    : 'b_order_chat_box.add_template.inputs.title.label',
                )
              "
              :maxlength="modern ? 64 : undefined"
              :placeholder="$t('b_order_chat_box.add_template.inputs.title.placeholder')"
              persistent-placeholder
              counter="64"
              messages=" "
            >
              <template v-slot:message>
                <u-smart-suggestion
                  :samples="$tm('suggestions.template_message.title')"
                  :modern="modern"
                  @select="(v) => (template_title = v)"
                ></u-smart-suggestion>
              </template>
            </v-text-field>

            <v-textarea
              v-model="template_body"
              ref="templateBody"
              :label="
                $t(
                  modern
                    ? 'b_order_chat_box.modern.template_body'
                    : 'b_order_chat_box.add_template.inputs.body.label',
                )
              "
              :maxlength="modern ? 1000 : undefined"
              variant="outlined"
              class="mt-5"
              :placeholder="$t('b_order_chat_box.add_template.inputs.body.placeholder')"
              persistent-placeholder
              auto-grow
              counter="1000"
              :messages="
                modern
                  ? ''
                  : $t('b_order_chat_box.add_template.inputs.body.messages', {
                      order_id: '{order_id}',
                      buyer_name: '{buyer_name}',
                    })
              "
            >
            </v-textarea>
            <u-smart-suggestion
              :samples="$tm('suggestions.template_message.body')"
              :modern="modern"
              @select="(v) => (template_body = v)"
            ></u-smart-suggestion>
            <template v-if="modern">
              <div class="b-order-chat-dialog__variables">
                <span>{{ $t("b_order_chat_box.modern.insert_variable") }}</span
                ><v-btn
                  v-for="variable in ['{buyer_name}', '{order_id}']"
                  :key="variable"
                  variant="text"
                  class="b-order-chat-dialog__variable"
                  @click="insertTemplateVariable(variable)"
                  >{{ variable }}</v-btn
                ><v-btn
                  icon
                  variant="text"
                  class="sd-modern-icon-button sd-modern-info-button"
                  :aria-label="$t('b_order_chat_box.modern.variables_help_label')"
                  ><v-icon size="16" aria-hidden="true">info_outline</v-icon
                  ><v-tooltip
                    activator="parent"
                    location="top"
                    content-class="sd-modern-tooltip text-start"
                    open-on-focus
                    open-on-click
                    >{{ $t("b_order_chat_box.modern.variables_help") }}</v-tooltip
                  ></v-btn
                >
              </div>
              <div class="b-order-chat-dialog__preview">
                <span class="sd-modern-list-header">{{
                  $t("b_order_chat_box.modern.template_preview")
                }}</span>
                <p>
                  {{
                    template_body
                      ? personalizeTemplate(template_body)
                      : $t("b_order_chat_box.modern.template_preview_empty")
                  }}
                </p>
              </div>
            </template>
          </div>
        </v-card-text>

        <v-card-actions>
          <div :class="modern ? 'b-order-chat-dialog__actions' : 'widget-buttons'">
            <v-btn
              :size="modern ? 'default' : 'x-large'"
              :class="{ 'sd-modern-button': modern }"
              variant="text"
              @click="dialog_add_template = false"
              prepend-icon="close"
            >
              {{ $t("global.actions.close") }}
            </v-btn>

            <v-btn
              @click="saveTemplate"
              :loading="busy_save_template"
              :disabled="modern && !canSaveTemplate"
              :class="{ 'sd-modern-button': modern }"
              variant="elevated"
              color="primary"
              :size="modern ? 'default' : 'x-large'"
              :prepend-icon="selected_template ? 'save' : 'add'"
            >
              {{
                modern
                  ? $t(
                      selected_template
                        ? "global.actions.save_changes"
                        : "b_order_chat_box.modern.add_reply",
                    )
                  : selected_template
                    ? $t("b_order_chat_box.add_template.save_action")
                    : $t("b_order_chat_box.add_template.add_action")
              }}
            </v-btn>
          </div>
        </v-card-actions>
      </v-card>
    </component>
  </div>
</template>

<script lang="ts">
import { VDialog, VBottomSheet } from "vuetify/components";
import BOrderShare from "@selldone/components-vue/backoffice/order/share/BOrderShare.vue";
import SOrderChatMessage from "@selldone/components-vue/storefront/order/chat/message/SOrderChatMessage.vue";
import UWidgetHeader from "@selldone/components-vue/ui/widget/header/UWidgetHeader.vue";
import USmartSuggestion from "@selldone/components-vue/ui/smart/suggestion/USmartSuggestion.vue";

import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

export default {
  name: "BOrderChatBox",
  emits: ["close"],
  mixins: [],
  components: {
    VDialog,
    VBottomSheet,
    USmartSuggestion,
    UWidgetHeader,
    BOrderShare,

    SOrderChatMessage,
  },
  inject: ["$shop"],

  props: {
    modern: { type: Boolean, default: false },
    dialogMode: { type: Boolean, default: false },
    basket: {
      require: true,
      type: Object,
    },
  },

  data: () => ({
    busy_add: false,
    body_input: null,

    busy_send_update: false,
    email_preview: false,

    dialog_add_template: false,
    template_body: null,
    template_title: null,
    busy_save_template: false,
    selected_template: null,
    busy_fetch_templates: false,
    templates: [],
    templates_failed: false,
    dialog_templates: false,
    dialog_replace: false,
    pending_template_body: null,
    chat_unmounted: false,
    order_links_open: false,
  }),

  computed: {
    isConversationDialog() {
      return this.modern && this.dialogMode;
    },
    user() {
      return this.USER();
    },
    chat() {
      return this.basket.chat;
    },
    buyer() {
      return this.basket.buyer ? this.basket.buyer : this.basket.customer;
    },
    senderName() {
      return this.user?.profile?.name || this.user?.name || this.$t("global.commons.guest");
    },
    statusEmailRecipient() {
      return this.basket.buyer?.email || this.basket.customer?.email;
    },
    canSendMessage() {
      return !this.busy_add && !!this.body_input?.trim() && this.body_input.length <= 1024;
    },
    canSaveTemplate() {
      return (
        !this.busy_save_template &&
        !!this.template_title?.trim() &&
        this.template_title.length <= 64 &&
        !!this.template_body?.trim() &&
        this.template_body.length <= 1000
      );
    },
    emailServiceReady() {
      return !!this.$shop.mail_service?.enable && Number(this.$shop.mail_service.errors || 0) < 100;
    },
    email_render_url() {
      return (
        window.API.GET_SHOP_EMAIL_RENDER_URL(this.$shop.id, "order-update") +
        "?order_id=" +
        this.basket.id
      );
    },
  },

  watch: {
    "basket.id"() {
      this.resetModernConversation();
    },
    "$shop.id"() {
      if (!this.modern) return;
      this.resetModernConversation();
      this.templates = [];
      this.busy_fetch_templates = this.busy_save_template = false;
      this.fetchMessageTemplates();
    },
  },

  created() {
    this.fetchMessageTemplates();
  },
  mounted() {
    this.scrollConversationToEnd();
  },
  beforeUnmount() {
    this.chat_unmounted = true;
  },

  methods: {
    scrollConversationToEnd() {
      if (!this.isConversationDialog) return;
      this.$nextTick(() => {
        const history = this.$refs.conversationHistory;
        if (!this.chat_unmounted && history) history.scrollTop = history.scrollHeight;
      });
    },
    resetModernConversation() {
      if (!this.modern) return;
      this.order_links_open = false;
      this.body_input = this.pending_template_body = null;
      this.dialog_templates =
        this.dialog_replace =
        this.dialog_add_template =
        this.email_preview =
          false;
      this.busy_add = this.busy_send_update = false;
      this.scrollConversationToEnd();
    },
    addChat() {
      if (this.modern && !this.canSendMessage) return;
      const modern = this.modern;
      const basketId = this.basket.id;
      const shopId = this.$shop.id;
      // A previous order's response must never populate the current conversation.
      const isCurrent = () =>
        !modern ||
        (!this.chat_unmounted && this.basket.id === basketId && this.$shop.id === shopId);
      this.busy_add = true;

      axios
        .post(window.API.POST_BASKET_CHAT_ADD_MESSAGE(this.$shop.id, this.basket.id), {
          body: this.body_input,
        })
        .then(({ data }) => {
          if (!isCurrent()) return;
          if (data.error) {
            NotificationService.showErrorAlert(null, data.error_msg);
          } else {
            this.body_input = null;
            this.basket.chat = data.chat;
            this.scrollConversationToEnd();
            NotificationService.showSuccessAlert(
              null,
              this.$t("b_order_chat_box.notifications.add_chat_success_message"),
            );
          }
        })
        .catch((error) => {
          if (!isCurrent()) return;
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          if (!isCurrent()) return;
          this.busy_add = null;
        });
    },

    sendOrderUpdateEmail() {
      if (
        this.modern &&
        (!this.emailServiceReady || !this.statusEmailRecipient || this.busy_send_update)
      )
        return;
      const modern = this.modern;
      const basketId = this.basket.id;
      const shopId = this.$shop.id;
      const isCurrent = () =>
        !modern ||
        (!this.chat_unmounted && this.basket.id === basketId && this.$shop.id === shopId);
      this.busy_send_update = true;

      axios
        .post(
          window.API.POST_BASKET_SEND_ORDER_UPDATE_STATUS_EMAIL(this.$shop.id, this.basket.id),
          {
            email: true,
          },
        )
        .then(({ data }) => {
          if (!isCurrent()) return;
          if (data.error) {
            NotificationService.showErrorAlert(null, data.error_msg);
          } else {
            this.email_preview = false;
            NotificationService.showSuccessAlert(
              null,
              this.$t("b_order_chat_box.send_update_email.notifications.send_success_message"),
            );
          }
        })
        .catch((error) => {
          if (!isCurrent()) return;
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          if (!isCurrent()) return;
          this.busy_send_update = null;
        });
    },

    fetchMessageTemplates() {
      if (this.busy_fetch_templates) return;
      const modern = this.modern;
      const shopId = this.$shop.id;
      const isCurrent = () => !modern || (!this.chat_unmounted && this.$shop.id === shopId);
      this.busy_fetch_templates = true;
      this.templates_failed = false;

      axios
        .get(window.API.GET_SHOP_TEMPLATE_MESSAGES(this.$shop.id), {
          params: {
            offset: 0,
            limit: 20,
          },
        })
        .then(({ data }) => {
          if (!isCurrent()) return;
          if (data.error) {
            this.templates_failed = true;
            NotificationService.showErrorAlert(null, data.error_msg);
          } else {
            this.templates = data.templates;
          }
        })
        .catch((error) => {
          if (!isCurrent()) return;
          this.templates_failed = true;
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          if (!isCurrent()) return;
          this.busy_fetch_templates = null;
        });
    },

    showAddTemplateMessage() {
      if (this.modern && this.busy_save_template) return;
      this.dialog_templates = false;
      this.template_body = null;
      this.template_title = null;
      this.selected_template = null;
      this.dialog_add_template = true;
    },
    showEditTemplateMessage(template) {
      if (this.modern && this.busy_save_template) return;
      this.dialog_templates = false;
      this.template_body = template.body;
      this.template_title = template.title;
      this.selected_template = template;
      this.dialog_add_template = true;
    },
    saveTemplate() {
      if (this.modern && !this.canSaveTemplate) return;
      const modern = this.modern;
      const shopId = this.$shop.id;
      const isCurrent = () => !modern || (!this.chat_unmounted && this.$shop.id === shopId);
      this.busy_save_template = true;

      const req = this.selected_template
        ? axios.put(
            window.API.PUT_SHOP_TEMPLATE_MESSAGE_EDIT(this.$shop.id, this.selected_template.id),
            {
              title: this.template_title,
              body: this.template_body,
            },
          )
        : axios.post(window.API.POST_SHOP_TEMPLATE_MESSAGE_ADD(this.$shop.id), {
            title: this.template_title,
            body: this.template_body,
          });

      req
        .then(({ data }) => {
          if (!isCurrent()) return;
          if (data.error) {
            NotificationService.showErrorAlert(null, data.error_msg);
          } else {
            this.dialog_add_template = false;
            this.AddOrUpdateItemByID(this.templates, data.template);
            NotificationService.showSuccessAlert(
              null,
              this.$t("b_order_chat_box.add_template.notifications.save_success_message"),
            );
          }
        })
        .catch((error) => {
          if (!isCurrent()) return;
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          if (!isCurrent()) return;
          this.busy_save_template = null;
        });
    },

    setTemplate(template_body) {
      if (this.modern) {
        if (this.busy_add) return;
        this.pending_template_body = template_body;
        if (this.body_input?.trim()) this.dialog_replace = true;
        else this.applyPendingTemplate();
        return;
      }
      // Replacing the placeholder {order_id} with the actual order ID
      this.body_input = template_body
        .replace("{order_id}", this.getBasketOrderCode(this.basket))
        .replace("{buyer_name}", this.buyer?.name);
    },
    personalizeTemplate(body) {
      return String(body || "")
        .replace("{order_id}", this.getBasketOrderCode(this.basket))
        .replace("{buyer_name}", this.buyer?.name || this.$t("global.commons.guest"));
    },
    applyPendingTemplate() {
      if (this.pending_template_body === null || this.busy_add) return;
      this.body_input = this.personalizeTemplate(this.pending_template_body);
      this.pending_template_body = null;
      this.dialog_replace = this.dialog_templates = false;
      this.$nextTick(() => this.$refs.modernMessage?.$el?.querySelector("textarea")?.focus());
    },
    insertTemplateVariable(variable) {
      const field = this.$refs.templateBody?.$el?.querySelector("textarea");
      const body = this.template_body || "";
      const start = field?.selectionStart ?? body.length;
      const end = field?.selectionEnd ?? body.length;
      const next = body.slice(0, start) + variable + body.slice(end);
      if (next.length > 1000) return;
      this.template_body = next;
      this.$nextTick(() => {
        field?.focus();
        field?.setSelectionRange(start + variable.length, start + variable.length);
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.b-order-chat-modern {
  width: calc(100% - 48px);
  max-width: 960px;
  min-width: 0;
  margin: 28px auto 30px;
  color: rgb(var(--v-theme-on-surface));
  font-family: inherit;
  text-align: start;

  &__header {
    gap: 20px;
    margin-block-end: 22px;
  }
  &__title {
    margin: 0;
    font-size: 22px;
    font-weight: 500;
    line-height: 29px;
    letter-spacing: -0.3px;
  }
  &__subtitle {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-block-start: 4px;
    .sd-modern-subtitle {
      margin: 0;
      font-size: 12px;
      font-weight: 400;
      line-height: 20px;
    }
  }
  &__conversation {
    padding: 0;
    border-radius: 15px;
  }
  &__recipient {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 19px 22px;
    border-block-end: 1px solid var(--sd-modern-border);
  }
  &__person {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
    > div {
      min-width: 0;
    }
    h2 {
      margin: 0;
      font-size: 14px;
      font-weight: 500;
      line-height: 22px;
      overflow-wrap: anywhere;
    }
    span {
      color: var(--sd-modern-muted);
      font-size: 12px;
      line-height: 19px;
      overflow-wrap: anywhere;
    }
  }
  &__avatar {
    flex: none;
    color: var(--sd-modern-muted);
    background: var(--sd-modern-inset);
  }
  &__channel {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
    justify-content: flex-end;
    color: var(--sd-modern-muted);
    font-size: 11px;
    line-height: 17px;
  }
  &__history {
    min-width: 0;
    padding: 8px 22px 0;
  }
  &__empty {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 13px;
    min-height: 100px;
    padding-block: 24px 26px;
    > .v-icon {
      color: var(--sd-modern-muted);
    }
    h3 {
      margin: 0;
      font-size: 13px;
      font-weight: 500;
      line-height: 21px;
    }
    p {
      margin: 2px 0 0;
      color: var(--sd-modern-muted);
      font-size: 12px;
      line-height: 20px;
      text-wrap: pretty;
    }
  }
  &__composer {
    padding: 18px 22px 16px;
    border-block-start: 1px solid var(--sd-modern-border);
  }
  &__composer-heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    margin-block-end: 15px;
    color: var(--sd-modern-muted);
    font-size: 11px;
    line-height: 18px;
  }
  &__sender {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    min-width: 0;
    overflow-wrap: anywhere;
  }
  &__field-label {
    display: block;
    margin-block-end: 6px;
    font-size: 12px;
    line-height: 20px;
  }
  &__input {
    :deep(.v-field) {
      border-radius: 10px;
    }
    :deep(textarea) {
      padding: 11px 12px;
      font-family: inherit;
      font-size: 13px;
      font-weight: 400;
      line-height: 21px;
    }
    :deep(textarea::placeholder) {
      color: var(--sd-modern-muted);
      opacity: 1;
    }
    :deep(.v-field__outline) {
      --v-field-border-opacity: 0.12;
    }
    :deep(.v-field--focused .v-field__outline) {
      --v-field-border-opacity: 1;
    }
  }
  &__quick-replies {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
    margin-block-start: 10px;
    > span {
      color: var(--sd-modern-muted);
      font-size: 11px;
      line-height: 17px;
    }
    > .sd-modern-button {
      min-height: 30px;
      padding: 4px 6px;
      font-size: 11px;
      line-height: 18px;
      color: var(--sd-modern-muted);
    }
  }
  &__composer-actions {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 12px;
    margin-block-start: 14px;
  }
  &__count {
    color: var(--sd-modern-muted);
    font-size: 11px;
    line-height: 17px;
    font-variant-numeric: tabular-nums;
  }
  &__to {
    margin-inline-start: auto;
    color: var(--sd-modern-muted);
    font-size: 11px;
    line-height: 17px;
    overflow-wrap: anywhere;
  }
  &__notification {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-block-start: 12px;
    color: var(--sd-modern-muted);
    font-size: 11px;
    line-height: 18px;
    > span {
      min-width: 0;
    }
    > .sd-modern-info-button {
      margin-inline-start: auto;
    }
  }
  &__access {
    margin-block-start: 18px;
  }
  .sd-modern-button {
    font-family: inherit;
    font-size: 13px;
    font-weight: 500;
    line-height: 20px;
    :deep(.v-btn__content) {
      font: inherit;
      letter-spacing: 0;
    }
  }
  &__quick-replies > .sd-modern-button {
    font-size: 11px;
    line-height: 18px;
  }
  @media (max-width: 600px) {
    width: calc(100% - 28px);
    margin-block: 22px 25px;
    &__header {
      align-items: flex-start;
      gap: 12px;
    }
    &__title {
      font-size: 21px;
      line-height: 28px;
    }
    &__recipient {
      padding: 16px;
    }
    &__history {
      padding-inline: 16px;
    }
    &__channel {
      display: none;
    }
    &__composer {
      padding: 16px;
    }
    &__composer-heading > span {
      display: none;
    }
    &__input :deep(textarea) {
      font-size: 16px;
      line-height: 24px;
    }
    &__to {
      display: none;
    }
    &__send {
      margin-inline-start: auto;
    }
    &__empty {
      justify-content: flex-start;
    }
  }
  @media (pointer: coarse) {
    &__quick-replies > .sd-modern-button {
      min-height: 44px;
    }
    &__input :deep(textarea) {
      font-size: 16px;
      line-height: 24px;
    }
  }
}
.b-order-chat-modern--dialog {
  --sd-modern-icon-button-size: 32px;
  width: 100%;
  max-width: none;
  margin: 0;

  .b-order-chat-modern__dialog-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 20px 22px;
    border-block-end: 1px solid var(--sd-modern-border);
  }
  .b-order-chat-modern__dialog-icon {
    display: grid;
    place-items: center;
    flex: 0 0 38px;
    height: 38px;
    border: 1px solid var(--sd-modern-border);
    border-radius: 11px;
    background: var(--sd-modern-inset);
  }
  .b-order-chat-modern__dialog-heading {
    flex: 1;
    min-width: 0;
    h2 { margin: 0; font-size: 19px; font-weight: 500; line-height: 26px; letter-spacing: -.3px; }
    p { display: flex; align-items: center; flex-wrap: wrap; gap: 5px; margin: 2px 0 0; color: var(--sd-modern-muted); font-size: 12px; line-height: 19px; overflow-wrap: anywhere; }
  }
  .b-order-chat-modern__conversation {
    border: 0;
    border-radius: 0;
    box-shadow: none;
  }
  .b-order-chat-modern__history {
    max-height: 320px;
    overflow-y: auto;
    overscroll-behavior: contain;
    padding: 20px 22px 22px;
    &:focus-visible { outline: 2px solid rgb(var(--v-theme-primary)); outline-offset: -3px; }
    :deep(.s-order-chat-message-modern) { padding-block: 0; margin-block-end: 18px; }
    :deep(.s-order-chat-message-modern:last-child) { margin-block-end: 0; }
    :deep(.s-order-chat-message-modern__time) { margin-inline-start: 0; }
    :deep(.s-order-chat-message-modern--staff .s-order-chat-message-modern__body) { padding: 0; background: transparent; border-radius: 0; }
    :deep(.s-order-chat-message-modern:not(.s-order-chat-message-modern--staff) .s-order-chat-message-modern__body) { padding: 10px 12px; background: var(--sd-modern-inset); border-radius: 10px; border-start-start-radius: 0; }
  }
  .b-order-chat-modern__composer { padding: 20px 22px; }
  .b-order-chat-modern__composer-heading { margin-block-end: 10px; }
  .b-order-chat-modern__field-label { margin: 0; color: rgb(var(--v-theme-on-surface)); font-size: 13px; font-weight: 500; line-height: 20px; }
  .b-order-chat-modern__quick-replies { margin-block-start: 9px; }
  .b-order-chat-modern__composer-actions { gap: 12px; margin-block-start: 15px; }
  .b-order-chat-modern__dialog-recipient {
    flex: 1;
    min-width: 0;
    color: var(--sd-modern-muted);
    font-size: 11px;
    line-height: 17px;
    > bdi { display: block; color: rgb(var(--v-theme-on-surface)); font-size: 12px; line-height: 18px; overflow-wrap: anywhere; }
    > span { display: block; }
  }
  .b-order-chat-modern__notification { align-items: flex-start; line-height: 17px; > .v-icon { margin-block-start: 2px; } }
  .b-order-chat-modern__tools { padding: 13px 22px; border-block-start: 1px solid var(--sd-modern-border); background: var(--sd-modern-inset); }
  .b-order-chat-modern__tool-actions { display: flex; align-items: center; flex-wrap: wrap; gap: 7px 12px; }
  .b-order-chat-modern__links { padding-block-start: 13px; margin-block-start: 12px; border-block-start: 1px solid var(--sd-modern-border); }
  .b-order-chat-modern__dialog-access {
    padding: 0;
    background: transparent;
    border: 0;
    border-radius: 0;
    box-shadow: none;
    :deep(.b-order-access__header) { margin-block-end: 12px; }
    :deep(.b-order-access__heading) { font-size: 13px; line-height: 20px; }
    :deep(.b-order-access__options) { grid-template-columns: minmax(0, 1fr); gap: 16px; }
    :deep(.b-order-access__option + .b-order-access__option) { padding-inline-start: 0; padding-block-start: 16px; border-inline-start: 0; border-block-start: 1px solid var(--sd-modern-border); }
  }
  .sd-modern-button { font-size: 12px; line-height: 20px; }
  .sd-modern-button:not(.b-order-chat-modern__send) { color: var(--sd-modern-muted); font-weight: 400; }

  @media (max-width: 600px) {
    .b-order-chat-modern__dialog-header { padding: 16px; gap: 9px; }
    .b-order-chat-modern__dialog-icon { flex-basis: 34px; height: 34px; }
    .b-order-chat-modern__dialog-heading h2 { font-size: 18px; }
    .b-order-chat-modern__history { padding: 16px; max-height: 300px; }
    .b-order-chat-modern__composer { padding: 16px; }
    .b-order-chat-modern__composer-heading > .b-order-chat-modern__field-label { display: block; }
    .b-order-chat-modern__tools { padding-inline: 16px; }
    .b-order-chat-modern__dialog-recipient { flex-basis: 100%; }
  }
  @media (max-width: 600px), (pointer: coarse) {
    --sd-modern-icon-button-size: 44px;
    .sd-modern-button { min-height: 44px; }
  }
}
.b-order-chat-dialog {
  font-family: inherit;
  font-size: 13px;
  line-height: 21px;
  h2 {
    margin: 0;
    font-size: 18px;
    font-weight: 500;
    line-height: 26px;
  }
  h3 {
    margin: 0;
    font-size: 13px;
    font-weight: 500;
    line-height: 21px;
    overflow-wrap: anywhere;
  }
  p {
    margin: 0;
    font-size: 12px;
    line-height: 20px;
    overflow-wrap: anywhere;
  }
  > .v-card-title {
    padding: 0 0 16px;
    font-family: inherit;
    font-size: 18px;
    font-weight: 500;
    line-height: 26px;
    white-space: normal;
  }
  > .v-card-text {
    padding: 0;
    font-family: inherit;
    font-size: 12px;
    line-height: 20px;
  }
  > .v-card-actions {
    display: block;
    padding: 0;
  }
  &__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 14px;
    margin-block-end: 18px;
    p {
      color: var(--sd-modern-muted);
      margin-block-start: 3px;
    }
  }
  &__body {
    min-height: 0;
  }
  &__muted {
    color: var(--sd-modern-muted);
  }
  &__email-to {
    margin-block: 8px 14px !important;
  }
  &__notice {
    align-items: flex-start;
    gap: 9px;
    padding: 12px 14px;
    margin-block: 10px;
    border-radius: 10px;
    font-size: 12px;
    line-height: 20px;
    > div {
      min-width: 0;
    }
  }
  &__reply {
    display: flex;
    align-items: center;
    gap: 10px;
    padding-block: 14px;
    border-block-end: 1px solid var(--sd-modern-border);
    > div {
      flex: 1;
      min-width: 0;
    }
    p {
      margin-block-start: 4px;
      color: var(--sd-modern-muted);
      white-space: pre-wrap;
    }
  }
  &__actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    flex-wrap: wrap;
    gap: 10px;
    padding-block-start: 16px;
    margin-block-start: 16px;
    border-block-start: 1px solid var(--sd-modern-border);
  }
  &__variables {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 6px;
    margin-block-start: 12px;
    color: var(--sd-modern-muted);
    font-size: 12px;
    line-height: 20px;
  }
  &__variable.v-btn {
    height: auto;
    min-height: 30px;
    min-width: 0;
    padding: 5px 7px;
    border-radius: 5px;
    background: var(--sd-modern-inset);
    font-family: monospace;
    font-size: 11px;
    line-height: 18px;
    letter-spacing: 0;
    text-transform: none;
  }
  &__preview {
    padding-block-start: 14px;
    margin-block-start: 18px;
    border-block-start: 1px solid var(--sd-modern-border);
    p {
      margin-block-start: 7px;
      font-size: 13px;
      line-height: 21px;
      white-space: pre-wrap;
    }
  }
  .sd-modern-button {
    font-family: inherit;
    font-size: 13px;
    font-weight: 500;
    line-height: 20px;
    :deep(.v-btn__content) {
      font: inherit;
      letter-spacing: 0;
    }
  }
  :deep(.v-field__input),
  :deep(.v-label) {
    font-family: inherit;
    font-size: 13px;
    font-weight: 400;
    line-height: 21px;
  }
  @media (max-width: 600px) {
    padding: 16px;
    &__reply {
      flex-wrap: wrap;
      > div {
        flex-basis: calc(100% - 54px);
      }
      > .sd-modern-button {
        margin-inline-start: auto;
      }
    }
    :deep(.v-field__input) {
      font-size: 16px;
      line-height: 24px;
    }
  }
  @media (pointer: coarse) {
    &__variable.v-btn {
      min-height: 44px;
    }
    :deep(.v-field__input) {
      font-size: 16px;
      line-height: 24px;
    }
  }
}
.c-bubble {
  background-color: #fff;
  border-radius: 18px;
  text-align: start;
  padding: 8px 12px;
}
</style>
