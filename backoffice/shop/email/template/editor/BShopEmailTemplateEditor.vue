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
  <s-widget-buttons v-bind="$attrs">
    <v-btn
      size="x-large"
      prepend-icon="architecture"
      @click="dialog = true"
      color="#000"
      :loading="busy"
    >
      Customize Email Template
      <v-chip
        v-if="mail_template?.enable"
        class="mx-2"
        color="#673AB7"
        variant="flat"
      >
        <v-avatar
          v-if="mail_template?.user_id"
          class="avatar-gradient -thin -user"
          title="Last editor"
          start
        >
          <v-img :src="getUserAvatar(mail_template?.user_id)" />
        </v-avatar>

        {{ $t("global.commons.custom") }}
      </v-chip>
    </v-btn>
  </s-widget-buttons>

  <!-- ███████████████████████ Dialog ███████████████████████ -->
  <v-dialog
    v-model="dialog"
    fullscreen
    scrollable
    transition="dialog-bottom-transition"
  >
    <v-card>
      <v-card-title class="d-flex align-center">

        <v-icon class="me-2">mark_email_read</v-icon>

        {{ template.title }}

        <v-spacer></v-spacer>

        <v-btn
          :href="email_render_url"
          target="_blank"
          variant="text"
          append-icon="open_in_new"
        >
          Preview email
        </v-btn>
      </v-card-title>

      <v-card-text>
        <u-loading-progress v-if="busy"></u-loading-progress>

        <div class="widget-box mb-5">
          <u-widget-header title="Status" icon="tune"></u-widget-header>
          <v-list-subheader>
            If you want to use default email content, you can disable this
            template.
          </v-list-subheader>

          <u-smart-toggle
            v-model="enable"
            :false-title="$t('global.commons.disable')"
            :true-title="$t('global.commons.enable')"
            class="my-3"
            false-description="Default email content will be dispatched to your customers."
            false-gray
            false-icon="close"
            true-description="Your customers will receive an email with personalized content."
            true-icon="check"
          ></u-smart-toggle>
        </div>

        <v-expand-transition>
          <div v-if="enable">
            <div class="widget-box mb-5">
              <u-widget-header title="Content" icon="notes"></u-widget-header>

              <v-list-subheader>
                <div v-html="parameters_tip"></div>
              </v-list-subheader>
              <v-text-field
                v-model="subject"
                :placeholder="default_values?.subject"
                counter="256"
                label="Email Subject"
                messages="This will be shown as email subject."
                persistent-placeholder
                variant="underlined"
              ></v-text-field>

              <v-text-field
                v-model="title"
                :messages="'Html code for title.'"
                :placeholder="default_values?.title"
                counter="256"
                label="Title"
                persistent-placeholder
                variant="underlined"
                class="mt-3"
              ></v-text-field>
              <v-text-field
                v-model="category"
                :placeholder="
                  default_values?.category
                    ? default_values.category
                    : 'Optional category...'
                "
                persistent-placeholder
                counter="256"
                label="Category"
                messages="It’s a small subtitle that will appear above the main email title."
                variant="underlined"
                class="mt-3"
              ></v-text-field>
              <v-textarea
                v-model="message"
                :messages="'Html main content of the email.'"
                :placeholder="default_values?.message"
                persistent-placeholder
                label="Message"
                variant="underlined"
                class="mt-3"
              ></v-textarea>
            </div>
            <div class="widget-box mb-5">
              <u-widget-header
                title="Header"
                icon="wallpaper"
              ></u-widget-header>

              <v-list-subheader>
                You can add a header image and show your business logo on the
                center of the header image.
              </v-list-subheader>

              <u-smart-image
                v-model="header_image"
                v-model:file="header_image_file"
                hint="This image will be shown on the email header."
                label="Header image"
                variant="underlined"
              ></u-smart-image>

              <u-smart-toggle
                v-model="header_logo"
                class="my-3"
                false-description="Do not show business logo on the header."
                false-gray
                false-icon="close"
                false-title="Hide"
                true-description="Show your business logo on the center of header image."
                true-icon="check"
                true-title="Show"
              ></u-smart-toggle>
            </div>
            <div class="widget-box mb-5">
              <u-widget-header
                title="Footer"
                icon="call_to_action"
              ></u-widget-header>

              <v-list-subheader>
                You can add a footer image and html content to the footer.
              </v-list-subheader>

              <u-smart-image
                v-model="footer_image"
                v-model:file="footer_image_file"
                hint="This image will be shown under email content."
                label="Footer image"
                variant="underlined"
              ></u-smart-image>

              <v-textarea
                v-model="footer"
                persistent-placeholder
                label="Footer"
                messages="Html content of the footer."
                variant="underlined"
                class="mt-3"
              ></v-textarea>
            </div>
            <div class="widget-box mb-5">
              <u-widget-header
                title="Action"
                icon="smart_button"
              ></u-widget-header>

              <v-list-subheader>
                You can customize the call to action button at the end of the
                email.
              </v-list-subheader>

              <v-text-field
                v-model="action"
                :placeholder="default_values?.action"
                persistent-placeholder
                counter="256"
                label="Button Caption"
                messages="Call to action caption."
                variant="underlined"
              ></v-text-field>
            </div>
          </div>
        </v-expand-transition>
      </v-card-text>
      <v-card-actions>
        <s-widget-buttons>
          <v-btn size="x-large" variant="text" @click="dialog = false">
            <v-icon start>close</v-icon>
            {{ $t("global.actions.close") }}
          </v-btn>

          <v-btn
            :loading="busy_set"
            color="primary"
            size="x-large"
            variant="elevated"
            @click="setMailTemplate"
          >
            <v-icon start>save</v-icon>
            {{ $t("global.actions.save") }}
          </v-btn>
        </s-widget-buttons>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import USmartToggle from "../../../../../ui/smart/toggle/USmartToggle.vue";
import USmartImage from "../../../../../ui/smart/image/USmartImage.vue";
import SWidgetButtons from "../../../../../ui/widget/buttons/SWidgetButtons.vue";
import UWidgetHeader from "@selldone/components-vue/ui/widget/header/UWidgetHeader.vue";
import ULoadingProgress from "@selldone/components-vue/ui/loading/progress/ULoadingProgress.vue";

export default {
  name: "BShopEmailTemplateEditor",
  components: {
    ULoadingProgress,
    UWidgetHeader,
    SWidgetButtons,
    USmartImage,
    USmartToggle,
  },
  props: {
    shop: {
      required: true,
      type: Object,
    },
    template: {
      required: true,
      type: Object,
    },
    code: {},
    params: {}, // Extra dynamic contents
  },

  data: () => ({
    dialog: false,

    mail_template: null,
    default_values: null,
    busy: false,

    //----------------------------
    enable: false,
    subject: null,
    title: null,
    category: null,
    message: null,

    header_image: null,
    header_image_file: null,

    footer_image: null,
    footer_image_file: null,

    footer: null,
    action: null,
    header_logo: false,

    busy_set: false,
  }),

  computed: {
    parameters_tip() {
      const params = [
        "shop_title",
        "shop_domain",
        "shop_mail",
        "shop_address",
        "shop_phone",
      ];

      if (this.params?.length) {
        params.push(...this.params);
      }

      return `You can use ${params
        .map((x) => `<b>:${x}</b>`)
        .join(", ")} as dynamic value in subject, title, message and footer.`;
    },

    email_render_url() {
      return window.API.GET_SHOP_EMAIL_RENDER_URL(this.shop.id, this.code);
    },
  },

  watch: {
    code() {
      this.fetchTemplate();
    },
  },
  created() {
    this.fetchTemplate();
  },

  methods: {
    assign() {
      this.header_image_file = null;
      this.footer_image_file = null;

      if (this.mail_template) {
        this.enable = this.mail_template.enable;

        this.subject = this.mail_template.subject;
        this.title = this.mail_template.title;

        this.category = this.mail_template.category;
        this.message = this.mail_template.message;

        this.header_image = this.mail_template.header_image;
        this.footer_image = this.mail_template.footer_image;

        this.footer = this.mail_template.footer;
        this.action = this.mail_template.action;
        this.header_logo = this.mail_template.header_logo;
      } else {
        this.resetToDefault(); // 🞇 Reset to default
      }
    },

    fetchTemplate() {
      this.resetToDefault(); // 🞇 Reset to default

      if (!this.code) return;

      this.busy = true;
      axios
        .get(window.API.GET_SHOP_MAIL_TEMPLATE(this.shop.id, this.code))
        .then(({ data }) => {
          if (!data.error) {
            this.mail_template = data.mail_template;

            this.assign();

            this.default_values = data.default;
            if (!this.subject) {
              this.subject = this.default_values.subject;
            }
            if (!this.title) {
              this.title = this.default_values.title;
            }

            if (!this.message) {
              this.message = this.default_values.message;
            }
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy = false;
        });
    },

    setMailTemplate() {
      this.busy_set = true;

      let formData = new FormData();
      formData.append("code", this.code);
      formData.append("enable", this.enable);

      if (this.subject) formData.append("subject", this.subject);

      if (this.title) formData.append("title", this.title);

      if (this.category) formData.append("category", this.category);

      if (this.message) formData.append("message", this.message);

      if (this.header_image) formData.append("header_image", this.header_image);
      if (this.footer_image) formData.append("footer_image", this.footer_image);

      if (this.header_image_file)
        formData.append("header_image_file", this.header_image_file);
      if (this.footer_image_file)
        formData.append("footer_image_file", this.footer_image_file);

      if (this.footer) formData.append("footer", this.footer);

      if (this.action) formData.append("action", this.action);

      formData.append("header_logo", this.header_logo);

      axios
        .post(
          window.API.POST_SET_SHOP_MAIL_TEMPLATE(this.shop.id),

          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          },
        )
        .then(({ data }) => {
          if (!data.error) {
            this.mail_template = data.mail_template;

            // Update image inputs: (Important)
            this.header_image_file = null;
            this.footer_image_file = null;
            this.header_image = this.mail_template.header_image;
            this.footer_image = this.mail_template.footer_image;

            this.$emit("update", data.mail_template);

            this.showSuccessAlert(
              null,
              "Mail template has been updated successfully!",
            );
            this.dialog = false;
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_set = false;
        });
    },
  },
};
</script>

<style lang="scss" scoped></style>
