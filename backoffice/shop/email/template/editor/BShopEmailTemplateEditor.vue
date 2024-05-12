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
  <v-expansion-panels
    :class="{ disabled: busy }"
    class="rounded-xl overflow-hidden"
    flat
  >
    <v-expansion-panel>
      <v-expansion-panel-title>
        <div>
          <v-icon class="me-1">architecture</v-icon>

          Customize Email Template

          <v-avatar
            v-if="mail_template?.user_id"
            class="mx-2 avatar-gradient -thin -user hover-scale-small force-top"
            size="28"
            title="Last editor"
            ><img :src="getUserAvatar(mail_template?.user_id)"
          /></v-avatar>

          <v-chip
            v-if="mail_template?.enable"
            class="mx-2"
            color="#673AB7"
            label
            size="small"
            >Custom
          </v-chip>

          <v-progress-circular
            v-if="busy"
            class="mx-2"
            indeterminate
            size="24"
            width="2"
          ></v-progress-circular>
        </div>
      </v-expansion-panel-title>
      <v-expansion-panel-text>
        <v-list-subheader>
          <div v-html="parameters_tip"></div>
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

        <v-text-field
          v-model="subject"
          :placeholder="default_values?.subject"
          counter="256"
          label="Email Subject"
          variant="underlined"
        ></v-text-field>

        <v-text-field
          v-model="title"
          :messages="'Html code for title.'"
          :placeholder="default_values?.title"
          counter="256"
          label="Title"
          variant="underlined"
        ></v-text-field>
        <v-text-field
          v-model="category"
          :placeholder="default_values?.category"
          counter="256"
          label="Category"
          messages="Small title will be shown on top of the email title."
          variant="underlined"
        ></v-text-field>
        <v-textarea
          v-model="message"
          :messages="'Html main content of the email.'"
          :placeholder="default_values?.message"
          label="Message"
          variant="underlined"
        ></v-textarea>

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

        <hr />

        <u-smart-image
          v-model="header_image"
          v-model:file="header_image_file"
          hint="This image will be shown on the email header."
          label="Header image" variant="underlined"
        ></u-smart-image>

        <v-textarea
          v-model="footer"
          label="Footer"
          messages="Html content of the footer."
          variant="underlined"
        ></v-textarea>

        <u-smart-image
          v-model="footer_image"
          v-model:file="footer_image_file"
          hint="This image will be shown under email content."
          label="Footer image" variant="underlined"
        ></u-smart-image>

        <hr />
        <v-text-field
          v-model="action"
          :placeholder="default_values?.action"
          counter="256"
          label="Button Caption"
          messages="Call to action caption."
          variant="underlined"
        ></v-text-field>

        <s-widget-buttons auto-fixed-position class="mt-5">
          <v-btn
            :loading="busy_set"
            color="primary"
            size="x-large"
            @click="setMailTemplate"
          >
            <v-icon start>save</v-icon>
            {{ $t("global.actions.save") }}
          </v-btn>
        </s-widget-buttons>
      </v-expansion-panel-text>
    </v-expansion-panel>
  </v-expansion-panels>
</template>

<script>
import USmartToggle from "../../../../../ui/smart/toggle/USmartToggle.vue";
import USmartImage from "../../../../../ui/smart/image/USmartImage.vue";
import SWidgetButtons from "../../../../../ui/widget/buttons/SWidgetButtons.vue";

export default {
  name: "BShopEmailTemplateEditor",
  components: {
    SWidgetButtons,
    USmartImage,
    USmartToggle,
  },
  props: {
    shop: {
      required: true,
      type: Object,
    },
    code: {},
    params: {}, // Extra dynamic contents
  },

  data: () => ({
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
            this.default_values = data.default;

            this.assign();
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

      if (this.header_image_file?.length)
        formData.append("header_image_file", this.header_image_file[0]);
      if (this.footer_image_file?.length)
        formData.append("footer_image_file", this.footer_image_file[0]);

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
            this.edit_dialog = false;
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
