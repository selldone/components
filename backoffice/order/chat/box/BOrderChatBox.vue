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

  <div>
    <div v-if="chat" class="widget-box -large mb-5">
      <u-widget-header
        :title="$t('global.commons.messages')"
        icon="3p"
      ></u-widget-header>
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
      <u-widget-header
        :title="$t('b_order_chat_box.title')"
        icon="bolt"
      ></u-widget-header>
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

    <!-- █████████████████████ Secure Order Link █████████████████████ -->

    <b-order-share class="mb-5" :basket="basket"></b-order-share>

    <!-- █████████████████████ Dialog > Send order update email █████████████████████ -->
    <v-bottom-sheet
      v-if="buyer?.email"
      v-model="email_preview"
      content-class="rounded-t-xl"
      width="860"
      max-width="98vw"
      scrollable
    >
      <v-card class="text-start" rounded="t-xl">
        <v-card-title>
          <v-icon class="me-2">forward_to_inbox</v-icon>
          {{ $t("b_order_chat_box.send_update_email.title") }}
        </v-card-title>

        <v-card-text>
          <v-alert
            v-if="!$shop.mail_service?.enable"
            class="my-3"
            variant="tonal"
            border="start"
            type="error"
            density="compact"
          >
            {{
              $t(
                "b_order_chat_box.send_update_email.need_set_service_alert.message",
              )
            }}

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
                {{
                  $t(
                    "b_order_chat_box.send_update_email.need_set_service_alert.action",
                  )
                }}
              </v-btn>
            </div>
          </v-alert>

          <iframe
            v-if="email_render_url"
            :src="email_render_url"
            :style="{ width: '100%', height: '100%', minHeight: '75vh' }"
            class="thin-scroll rounded-2rem"
            scrolling="yes"
            style="border: none; border-radius: 0"
          >
          </iframe>
        </v-card-text>

        <v-card-actions>
          <div class="widget-buttons">
            <v-btn
              size="x-large"
              variant="text"
              @click="email_preview = false"
              prepend-icon="close"
            >
              {{ $t("global.actions.close") }}
            </v-btn>

            <v-btn
              v-if="buyer?.email"
              @click="sendOrderUpdateEmail"
              :loading="busy_send_update"
              variant="elevated"
              color="primary"
              size="x-large"
            >
              <div>
                {{ $t("b_order_chat_box.send_update_email.send_action") }}

                <div class="small mt-1">
                  {{ buyer.email }}
                </div>
              </div>

              <v-icon end class="flip-rtl">send</v-icon>
            </v-btn>
          </div>
        </v-card-actions>
      </v-card>
    </v-bottom-sheet>

    <!-- █████████████████████ Dialog > Add template message █████████████████████ -->
    <v-bottom-sheet
      v-model="dialog_add_template"
      content-class="rounded-t-xl"
      width="860"
      max-width="98vw"
      scrollable
    >
      <v-card class="text-start" rounded="t-xl">
        <v-card-title>
          <v-icon class="me-2">assignment_add</v-icon>
          {{
            selected_template
              ? $t("b_order_chat_box.add_template.edit_title")
              : $t("b_order_chat_box.add_template.add_title")
          }}
        </v-card-title>

        <v-card-text>
          {{ $t("b_order_chat_box.add_template.message") }}

          <div class="max-widget-width my-5">
            <v-text-field
              v-model="template_title"
              variant="outlined"
              :label="$t('b_order_chat_box.add_template.inputs.title.label')"
              :placeholder="
                $t('b_order_chat_box.add_template.inputs.title.placeholder')
              "
              persistent-placeholder
              counter="64"
              messages=" "
            >
              <template v-slot:message>
                <u-smart-suggestion
                  :samples="$tm('suggestions.template_message.title')"
                  @select="(v) => (template_title = v)"
                ></u-smart-suggestion>
              </template>
            </v-text-field>

            <v-textarea
              v-model="template_body"
              :label="$t('b_order_chat_box.add_template.inputs.body.label')"
              variant="outlined"
              class="mt-5"
              :placeholder="
                $t('b_order_chat_box.add_template.inputs.body.placeholder')
              "
              persistent-placeholder
              auto-grow
              counter="1000"
              :messages="
                $t('b_order_chat_box.add_template.inputs.body.messages', {
                  order_id: '{order_id}',
                  buyer_name: '{buyer_name}',
                })
              "
            >
            </v-textarea>
            <u-smart-suggestion
              :samples="$tm('suggestions.template_message.body')"
              @select="(v) => (template_body = v)"
            ></u-smart-suggestion>
          </div>
        </v-card-text>

        <v-card-actions>
          <div class="widget-buttons">
            <v-btn
              size="x-large"
              variant="text"
              @click="dialog_add_template = false"
              prepend-icon="close"
            >
              {{ $t("global.actions.close") }}
            </v-btn>

            <v-btn
              @click="saveTemplate"
              :loading="busy_save_template"
              variant="elevated"
              color="primary"
              size="x-large"
              :prepend-icon="selected_template ? 'edit' : 'add'"
            >
              {{
                selected_template
                  ? $t("b_order_chat_box.add_template.save_action")
                  : $t("b_order_chat_box.add_template.add_action")
              }}
            </v-btn>
          </div>
        </v-card-actions>
      </v-card>
    </v-bottom-sheet>
  </div>
</template>

<script lang="ts">
import BOrderShare from "@selldone/components-vue/backoffice/order/share/BOrderShare.vue";
import SOrderChatMessage from "@selldone/components-vue/storefront/order/chat/message/SOrderChatMessage.vue";
import UWidgetHeader from "@selldone/components-vue/ui/widget/header/UWidgetHeader.vue";
import USmartSuggestion from "@selldone/components-vue/ui/smart/suggestion/USmartSuggestion.vue";

import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

export default {
  name: "BOrderChatBox",
  mixins: [],
  components: {
    USmartSuggestion,
    UWidgetHeader,
    BOrderShare,

    SOrderChatMessage,
  },
  inject: ["$shop"],

  props: {
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
  }),

  computed: {
    user() {
      return this.USER();
    },
    chat() {
      return this.basket.chat;
    },
    buyer() {
      return this.basket.buyer ? this.basket.buyer : this.basket.customer;
    },
    email_render_url() {
      return (
        window.API.GET_SHOP_EMAIL_RENDER_URL(this.$shop.id, "order-update") +
        "?order_id=" +
        this.basket.id
      );
    },
  },

  watch: {},

  created() {
    this.fetchMessageTemplates();
  },

  methods: {
    addChat() {
      this.busy_add = true;

      axios
        .post(
          window.API.POST_BASKET_CHAT_ADD_MESSAGE(
            this.$shop.id,
            this.basket.id,
          ),
          {
            body: this.body_input,
          },
        )
        .then(({ data }) => {
          if (data.error) {
            NotificationService.showErrorAlert(null, data.error_msg);
          } else {
            this.body_input = null;
            this.basket.chat = data.chat;
            NotificationService.showSuccessAlert(
              null,
              this.$t(
                "b_order_chat_box.notifications.add_chat_success_message",
              ),
            );
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_add = null;
        });
    },

    sendOrderUpdateEmail() {
      this.busy_send_update = true;

      axios
        .post(
          window.API.POST_BASKET_SEND_ORDER_UPDATE_STATUS_EMAIL(
            this.$shop.id,
            this.basket.id,
          ),
          {
            email: true,
          },
        )
        .then(({ data }) => {
          if (data.error) {
            NotificationService.showErrorAlert(null, data.error_msg);
          } else {
            this.email_preview = false;
            NotificationService.showSuccessAlert(
              null,
              this.$t(
                "b_order_chat_box.send_update_email.notifications.send_success_message",
              ),
            );
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_send_update = null;
        });
    },

    fetchMessageTemplates() {
      this.busy_fetch_templates = true;

      axios
        .get(window.API.GET_SHOP_TEMPLATE_MESSAGES(this.$shop.id), {
          params: {
            offset: 0,
            limit: 20,
          },
        })
        .then(({ data }) => {
          if (data.error) {
            NotificationService.showErrorAlert(null, data.error_msg);
          } else {
            this.templates = data.templates;
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_fetch_templates = null;
        });
    },

    showAddTemplateMessage() {
      this.template_body = null;
      this.template_title = null;
      this.selected_template = null;
      this.dialog_add_template = true;
    },
    showEditTemplateMessage(template) {
      this.template_body = template.body;
      this.template_title = template.title;
      this.selected_template = template;
      this.dialog_add_template = true;
    },
    saveTemplate() {
      this.busy_save_template = true;

      const req = this.selected_template
        ? axios.put(
            window.API.PUT_SHOP_TEMPLATE_MESSAGE_EDIT(
              this.$shop.id,
              this.selected_template.id,
            ),
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
          if (data.error) {
            NotificationService.showErrorAlert(null, data.error_msg);
          } else {
            this.dialog_add_template = false;
            this.AddOrUpdateItemByID(this.templates, data.template);
            NotificationService.showSuccessAlert(
              null,
              this.$t(
                "b_order_chat_box.add_template.notifications.save_success_message",
              ),
            );
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_save_template = null;
        });
    },

    setTemplate(template_body) {
      // Replacing the placeholder {order_id} with the actual order ID
      this.body_input = template_body
        .replace("{order_id}", this.getBasketOrderCode(this.basket))
        .replace("{buyer_name}", this.buyer?.name);
    },
  },
};
</script>

<style lang="scss" scoped>
.c-bubble {
  background-color: #fff;
  border-radius: 18px;
  text-align: start;
  padding: 8px 12px;
}
</style>
