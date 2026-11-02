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
  <s-widget-buttons
    v-bind="$attrs"
    class="b-shop-email-template-editor__launcher"
  >
    <v-btn
      class="sd-modern-button sd-modern-button--form b-shop-email-template-editor__button"
      variant="outlined"
      prepend-icon="edit"
      @click="dialog = true"
      :loading="busy"
    >
      {{ $t("b_shop_email_template_editor.customize") }}
      <span
        v-if="mail_template?.enable"
        class="sd-modern-status sd-modern-status--plain b-shop-email-template-editor__custom ms-2"
      >
        <v-avatar
          v-if="mail_template?.user_id"
          class="avatar-gradient -thin -user"
          :title="$t('b_shop_email_template_editor.last_editor')"
          size="20"
        >
          <v-img :src="getUserAvatar(mail_template?.user_id)" />
        </v-avatar>
        {{ $t("global.commons.custom") }}
      </span>
    </v-btn>
  </s-widget-buttons>

  <!-- ███████████████████████ Dialog ███████████████████████ -->
  <v-dialog
    v-model="dialog"
    fullscreen
    scrollable
    transition="dialog-bottom-transition"
  >
    <v-card class="b-shop-email-template-editor sd-modern-canvas text-start">
      <v-card-title class="b-shop-email-template-editor__header">
        <div class="sd-modern-title">
          <v-icon
            class="sd-modern-icon sd-modern-icon--plain"
            aria-hidden="true"
            >edit_note</v-icon
          >
          <div>
            <h2 class="sd-modern-title-text">
              {{ $t("b_shop_email_template_editor.title") }}
            </h2>
            <p class="sd-modern-subtitle">{{ template.title }}</p>
          </div>
        </div>
        <v-btn
          :href="email_render_url"
          target="_blank"
          rel="noopener noreferrer"
          variant="text"
          class="sd-modern-button sd-modern-button--inline b-shop-email-template-editor__preview"
          color="primary"
          append-icon="north_east"
        >
          {{ $t("b_shop_email_template_editor.preview") }}
        </v-btn>
      </v-card-title>

      <v-card-text class="b-shop-email-template-editor__body" :aria-busy="busy">
        <u-loading-progress v-if="busy"></u-loading-progress>
        <div class="sd-modern-content b-shop-email-template-editor__content">
          <section
            class="sd-modern-widget b-shop-email-template-editor__status"
          >
            <u-smart-toggle
              v-model="enable"
              accessible
              :false-title="$t('b_shop_email_template_editor.default_content')"
              :true-title="$t('b_shop_email_template_editor.custom_content')"
              :false-description="
                $t('b_shop_email_template_editor.default_content_description')
              "
              :true-description="
                $t('b_shop_email_template_editor.custom_content_description')
              "
              false-gray
              false-icon="close"
              true-icon="check"
            ></u-smart-toggle>
          </section>

          <v-expand-transition>
            <div v-if="enable">
              <div class="b-shop-email-template-editor__workspace">
                <nav
                  class="sd-modern-section-nav b-shop-email-template-editor__nav"
                  :aria-label="
                    $t('b_shop_email_template_editor.sections_label')
                  "
                >
                  <button
                    v-for="section in editor_sections"
                    :key="section.key"
                    type="button"
                    class="sd-modern-section-nav__item"
                    :aria-current="
                      active_section === section.key ? 'location' : undefined
                    "
                    @click="active_section = section.key"
                  >
                    <v-icon size="18" aria-hidden="true">{{
                      section.icon
                    }}</v-icon>
                    {{ section.label }}
                  </button>
                </nav>
                <section
                  class="sd-modern-widget b-shop-email-template-editor__panel"
                  :aria-label="current_section.title"
                >
                  <header class="b-shop-email-template-editor__panel-heading">
                    <v-icon size="18" aria-hidden="true">{{
                      current_section.icon
                    }}</v-icon>
                    <div>
                      <h3 class="b-shop-email-template-editor__section-title">
                        {{ current_section.title }}
                      </h3>
                      <p class="sd-modern-subtitle">
                        {{ current_section.description }}
                      </p>
                    </div>
                  </header>
                  <div
                    v-show="active_section === 'content'"
                    class="b-shop-email-template-editor__section"
                  >
                    <div
                      class="sd-modern-form-grid b-shop-email-template-editor__fields"
                    >
                      <v-text-field
                        v-model="subject"
                        :placeholder="default_values?.subject"
                        counter="256"
                        :label="$t('b_shop_email_template_editor.subject')"
                        :messages="
                          $t('b_shop_email_template_editor.subject_help')
                        "
                        persistent-placeholder
                        variant="underlined"
                        class="sd-modern-underlined-field b-shop-email-template-editor__full"
                      ></v-text-field>

                      <v-text-field
                        v-model="title"
                        :messages="
                          $t('b_shop_email_template_editor.title_help')
                        "
                        :placeholder="default_values?.title"
                        counter="256"
                        :label="
                          $t('b_shop_email_template_editor.content_title')
                        "
                        persistent-placeholder
                        variant="underlined"
                        class="sd-modern-underlined-field"
                      ></v-text-field>
                      <v-text-field
                        v-model="category"
                        :placeholder="
                          default_values?.category
                            ? default_values.category
                            : $t(
                                'b_shop_email_template_editor.category_placeholder',
                              )
                        "
                        persistent-placeholder
                        counter="256"
                        :label="$t('b_shop_email_template_editor.category')"
                        :messages="
                          $t('b_shop_email_template_editor.category_help')
                        "
                        variant="underlined"
                        class="sd-modern-underlined-field"
                      ></v-text-field>
                      <v-textarea
                        v-model="message"
                        :messages="
                          $t('b_shop_email_template_editor.message_help')
                        "
                        :placeholder="default_values?.message"
                        persistent-placeholder
                        :label="$t('b_shop_email_template_editor.message')"
                        variant="underlined"
                        class="sd-modern-underlined-field b-shop-email-template-editor__full"
                      ></v-textarea>
                    </div>
                    <div
                      class="sd-modern-notice b-shop-email-template-editor__parameters"
                    >
                      <v-icon size="18" aria-hidden="true">data_object</v-icon>
                      <div class="sd-modern-notice__content">
                        <p>
                          {{
                            $t("b_shop_email_template_editor.parameters_help")
                          }}
                        </p>
                        <div
                          class="b-shop-email-template-editor__tokens"
                          dir="ltr"
                        >
                          <code
                            v-for="parameter in parameter_names"
                            :key="parameter"
                            >:{{ parameter }}</code
                          >
                        </div>
                      </div>
                    </div>
                  </div>
                  <div
                    v-show="active_section === 'header'"
                    class="b-shop-email-template-editor__section"
                  >
                    <u-smart-image
                      v-model="header_image"
                      v-model:file="header_image_file"
                      :hint="
                        $t('b_shop_email_template_editor.header_image_help')
                      "
                      :label="$t('b_shop_email_template_editor.header_image')"
                      variant="underlined"
                      class="b-shop-email-template-editor__image"
                    ></u-smart-image>

                    <u-smart-toggle
                      v-model="header_logo"
                      accessible
                      class="my-3"
                      :false-description="
                        $t('b_shop_email_template_editor.hide_logo_help')
                      "
                      false-gray
                      false-icon="close"
                      :false-title="
                        $t('b_shop_email_template_editor.hide_logo')
                      "
                      :true-description="
                        $t('b_shop_email_template_editor.show_logo_help')
                      "
                      true-icon="check"
                      :true-title="$t('b_shop_email_template_editor.show_logo')"
                    ></u-smart-toggle>
                  </div>
                  <div
                    v-show="active_section === 'footer'"
                    class="b-shop-email-template-editor__section"
                  >
                    <u-smart-image
                      v-model="footer_image"
                      v-model:file="footer_image_file"
                      :hint="
                        $t('b_shop_email_template_editor.footer_image_help')
                      "
                      :label="$t('b_shop_email_template_editor.footer_image')"
                      variant="underlined"
                      class="b-shop-email-template-editor__image"
                    ></u-smart-image>

                    <v-textarea
                      v-model="footer"
                      persistent-placeholder
                      :label="$t('b_shop_email_template_editor.footer')"
                      :messages="
                        $t('b_shop_email_template_editor.footer_content_help')
                      "
                      variant="underlined"
                      class="sd-modern-underlined-field mt-3"
                    ></v-textarea>
                  </div>
                  <div
                    v-show="active_section === 'action'"
                    class="b-shop-email-template-editor__section"
                  >
                    <v-text-field
                      v-model="action"
                      :placeholder="default_values?.action"
                      persistent-placeholder
                      counter="256"
                      :label="$t('b_shop_email_template_editor.button_caption')"
                      :messages="
                        $t('b_shop_email_template_editor.button_caption_help')
                      "
                      variant="underlined"
                      class="sd-modern-underlined-field mt-3"
                    ></v-text-field>
                  </div>
                </section>
                <aside
                  class="sd-modern-illustration b-shop-email-template-editor__aside"
                >
                  <h3>
                    {{ $t("b_shop_email_template_editor.structure_title") }}
                  </h3>
                  <div
                    class="b-shop-email-template-editor__anatomy"
                    aria-hidden="true"
                  >
                    <div
                      v-for="section in structure_sections"
                      :key="section.key"
                      class="b-shop-email-template-editor__anatomy-piece"
                      :class="[
                        `b-shop-email-template-editor__anatomy-piece--${section.key}`,
                        {
                          'b-shop-email-template-editor__anatomy-piece--active':
                            active_section === section.key,
                        },
                      ]"
                    >
                      <span
                        v-if="section.key === 'action'"
                        class="sd-modern-illustration__action b-shop-email-template-editor__example-action"
                        >{{
                          $t("b_shop_email_template_editor.example_action")
                        }}</span
                      >
                      <template v-else>{{ section.label }}</template>
                      <div
                        v-if="section.key === 'content'"
                        class="b-shop-email-template-editor__anatomy-lines"
                      >
                        <span></span><span></span><span></span>
                      </div>
                    </div>
                  </div>
                  <ol class="d-sr-only">
                    <li
                      v-for="section in structure_sections"
                      :key="section.key"
                    >
                      {{ section.label }}
                    </li>
                  </ol>
                  <p class="b-shop-email-template-editor__structure-caption">
                    {{
                      $t("b_shop_email_template_editor.structure_caption", {
                        section: current_section.title,
                      })
                    }}
                  </p>
                </aside>
              </div>
            </div>
          </v-expand-transition>
          <section
            v-if="!enable && default_values"
            class="sd-modern-widget b-shop-email-template-editor__default"
          >
            <v-icon size="22" aria-hidden="true">mark_email_read</v-icon>
            <div>
              <h3>{{ $t("b_shop_email_template_editor.default_title") }}</h3>
              <p class="sd-modern-subtitle">
                {{ $t("b_shop_email_template_editor.default_help") }}
              </p>
            </div>
          </section>
        </div>
      </v-card-text>
      <v-card-actions
        class="sd-modern-form-actions b-shop-email-template-editor__actions"
      >
        <div class="b-shop-email-template-editor__action-layout">
          <p class="b-shop-email-template-editor__save-hint">
            {{ $t("b_shop_email_template_editor.save_hint") }}
          </p>
          <s-widget-buttons>
            <v-btn
              class="sd-modern-button sd-modern-button--form b-shop-email-template-editor__button"
              variant="outlined"
              prepend-icon="close"
              @click="dialog = false"
            >
              {{ $t("global.actions.close") }}
            </v-btn>

            <v-btn
              :loading="busy_set"
              color="primary"
              class="sd-modern-button sd-modern-button--form sd-modern-button--primary b-shop-email-template-editor__button"
              variant="elevated"
              prepend-icon="save"
              :disabled="busy"
              @click="setMailTemplate"
            >
              {{ $t("global.actions.save") }}
            </v-btn>
          </s-widget-buttons>
        </div>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import USmartToggle from "../../../../../ui/smart/toggle/USmartToggle.vue";
import USmartImage from "../../../../../ui/smart/image/USmartImage.vue";
import SWidgetButtons from "../../../../../ui/widget/buttons/SWidgetButtons.vue";
import ULoadingProgress from "@selldone/components-vue/ui/loading/progress/ULoadingProgress.vue";

import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

export default {
  name: "BShopEmailTemplateEditor",
  mixins: [],
  components: {
    ULoadingProgress,
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
    active_section: "content",

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
    editor_sections() {
      return [
        {
          key: "content",
          label: this.$t("b_shop_email_template_editor.content_tab"),
          title: this.$t("b_shop_email_template_editor.content"),
          icon: "notes",
          description: this.$t("b_shop_email_template_editor.content_help"),
        },
        {
          key: "header",
          label: this.$t("b_shop_email_template_editor.header"),
          title: this.$t("b_shop_email_template_editor.header"),
          icon: "vertical_align_top",
          description: this.$t("b_shop_email_template_editor.header_help"),
        },
        {
          key: "footer",
          label: this.$t("b_shop_email_template_editor.footer"),
          title: this.$t("b_shop_email_template_editor.footer"),
          icon: "vertical_align_bottom",
          description: this.$t("b_shop_email_template_editor.footer_help"),
        },
        {
          key: "action",
          label: this.$t("b_shop_email_template_editor.action_tab"),
          title: this.$t("b_shop_email_template_editor.action"),
          icon: "smart_button",
          description: this.$t("b_shop_email_template_editor.action_help"),
        },
      ];
    },

    current_section() {
      return (
        this.editor_sections.find(
          (section) => section.key === this.active_section,
        ) || this.editor_sections[0]
      );
    },

    structure_sections() {
      return ["header", "content", "footer", "action"].map((key) =>
        this.editor_sections.find((section) => section.key === key),
      );
    },

    parameter_names() {
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

      return params;
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
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
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

            NotificationService.showSuccessAlert(
              null,
              this.$t("b_shop_email_template_editor.saved"),
            );
            this.dialog = false;
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_set = false;
        });
    },
  },
};
</script>

<style lang="scss" scoped>
.b-shop-email-template-editor__launcher {
  flex: 0 1 auto;
  min-width: 0;
  width: auto;
  margin: 0;
  padding: 0;
  justify-content: flex-end;
}

.b-shop-email-template-editor__custom {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 400;
}

.b-shop-email-template-editor__button.sd-modern-button {
  --v-btn-height: 42px;
  flex: 0 1 auto;
  min-width: 0;
  max-width: 100%;
  min-height: 42px;
  height: auto;
  max-height: none;
  margin: 0;
  padding: 10px 15px;
  border-radius: 9px;
  font-size: 13px;
  font-weight: 500;
  line-height: 20px;

  &.v-btn--variant-outlined {
    border-color: var(--sd-modern-border);
  }

  :deep(.v-icon) {
    width: 16px;
    height: 16px;
    font-size: 16px;
  }
  :deep(.v-btn__prepend) {
    margin-inline: 0 7px;
  }
}

.b-shop-email-template-editor {
  &__preview :deep(.v-icon) {
    width: 16px;
    height: 16px;
    font-size: 16px;
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 16px;
    padding: 25px 28px;
    white-space: normal;

    .sd-modern-title {
      min-width: 0;
    }

    .sd-modern-title-text {
      font-size: 20px;
      font-weight: 500;
      line-height: 28px;
      letter-spacing: -0.3px;
    }
  }

  &__body {
    position: relative;
    padding: 24px 28px;
  }

  &__content {
    width: 100%;
    max-width: 1040px;
  }

  &__status.sd-modern-widget {
    padding: 8px 10px;
    margin-block-end: 22px;
    border: 0;
    border-radius: 16px;
    box-shadow: none;

    :deep(b) {
      font-size: 13px;
      font-weight: 500;
      line-height: 20px;
    }

    :deep(.small) {
      font-size: 12px;
      line-height: 18px;
    }
  }

  &__workspace {
    display: grid;
    grid-template-columns: 134px minmax(0, 1fr) 205px;
    align-items: start;
    gap: 20px;
    min-width: 0;
  }

  &__panel.sd-modern-widget {
    min-width: 0;
    padding: 24px;
    border: 0;
    box-shadow: none;
  }

  &__panel-heading {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    margin-block-end: 23px;

    > .v-icon {
      flex: 0 0 auto;
      margin-block-start: 3px;
      color: var(--sd-modern-muted);
    }

    > div {
      min-width: 0;
    }
  }

  &__section {
    min-width: 0;
  }

  &__section-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 16px;
    font-weight: 500;
    line-height: 24px;

    .v-icon {
      color: var(--sd-modern-muted);
    }
  }

  &__parameters {
    margin-block: 22px 0;
    font-size: 13px;
    line-height: 21px;
  }

  &__tokens {
    display: flex;
    flex-wrap: wrap;
    gap: 6px 14px;
    margin-block-start: 8px;
    text-align: start;

    code {
      background: transparent;
      font-size: inherit;
      overflow-wrap: anywhere;
    }
  }

  &__fields {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 24px 22px;
  }

  &__full {
    grid-column: 1 / -1;
  }

  &__image {
    margin-block-start: 0;
  }

  &__aside {
    min-width: 0;
    padding-block-start: 7px;

    > h3 {
      margin-block-end: 13px;
      font-size: 13px;
      font-weight: 500;
      line-height: 20px;
    }
  }

  &__anatomy {
    padding: 14px;
    border: 1px solid var(--sd-modern-border);
    border-radius: 15px;
    background: rgb(var(--v-theme-surface));
  }

  &__anatomy-piece {
    padding: 10px 8px;
    border: 1px solid transparent;
    border-radius: 7px;
    color: var(--sd-modern-muted);
    font-size: 11px;
    line-height: 18px;
    transition:
      background-color 160ms ease,
      border-color 160ms ease;

    + .b-shop-email-template-editor__anatomy-piece {
      margin-block-start: 8px;
    }

    &--header {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 52px;
      background: var(--sd-modern-inset);
      text-align: center;
    }

    &--content {
      min-height: 93px;
    }

    &--footer {
      min-height: 47px;
      border-block-start-color: var(--sd-modern-border);
    }

    &--active {
      border-color: rgba(var(--sd-modern-illustration-accent-rgb), 0.5);
      background: rgba(var(--sd-modern-illustration-accent-rgb), 0.055);
    }
  }

  &__anatomy-lines {
    display: grid;
    gap: 6px;
    margin-block-start: 9px;

    > span {
      height: 4px;
      border-radius: 3px;
      background: var(--sd-modern-border);
    }

    > span:last-child {
      width: 68%;
    }
  }

  &__example-action {
    display: inline-block;
    padding: 6px 12px;
    border-radius: 7px;
    font-size: 10px;
    line-height: 16px;
  }

  &__structure-caption {
    margin-block: 12px 0;
    color: var(--sd-modern-muted);
    font-size: 13px;
    line-height: 20px;
  }

  &__default.sd-modern-widget {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    max-width: 760px;
    margin-inline: auto;

    > .v-icon {
      flex: 0 0 auto;
      color: var(--sd-modern-muted);
    }

    h3 {
      font-size: 16px;
      font-weight: 500;
      line-height: 24px;
    }
  }

  &__actions {
    justify-content: center;
    padding: 12px 24px 20px;

    :deep(.widget-buttons) {
      flex: 0 1 auto;
      width: auto;
      margin: 0;
      flex-direction: row;
      justify-content: flex-end;
      align-items: center;
      gap: 10px;
      padding: 0;
    }
  }

  &__action-layout {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 18px;
    width: min(1040px, 100%);
    min-width: 0;
    max-width: 100%;
    margin-inline: auto;
  }

  &__save-hint {
    flex: 1;
    min-width: 0;
    margin: 0;
    color: var(--sd-modern-muted);
    font-size: 12px;
    line-height: 19px;
    white-space: normal;
    overflow-wrap: anywhere;
  }
}

@media (max-width: 920px) {
  .b-shop-email-template-editor {
    &__workspace {
      grid-template-columns: 134px minmax(0, 1fr);
    }

    &__aside {
      display: grid;
      grid-column: 2;
      grid-template-columns: minmax(0, 180px) minmax(0, 1fr);
      align-items: center;
      gap: 10px 17px;

      > h3 {
        grid-column: 1 / -1;
        margin: 0;
      }
    }

    &__anatomy {
      grid-column: 1;
      grid-row: 2;
    }
    &__structure-caption {
      margin: 0;
    }
  }
}

@media (max-width: 700px) {
  .b-shop-email-template-editor {
    &__header {
      padding: 20px 16px;
    }

    &__body {
      padding: 20px 16px;
    }

    &__header .sd-modern-title-text {
      font-size: 18px;
      line-height: 26px;
    }

    &__workspace {
      grid-template-columns: minmax(0, 1fr);
      gap: 16px;
    }

    &__nav {
      display: flex;
      flex-wrap: wrap;
    }

    &__nav > .sd-modern-section-nav__item {
      min-height: 44px;
    }

    &__panel.sd-modern-widget {
      padding: 20px 17px;
    }

    &__aside {
      grid-column: 1;
      grid-template-columns: minmax(0, 160px) minmax(0, 1fr);
      padding: 4px 5px 0;
    }

    &__fields {
      gap: 18px;
    }

    &__actions {
      padding: 12px 12px 16px;
    }

    &__action-layout {
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;

      :deep(.widget-buttons) {
        align-self: flex-end;
      }
    }

    &__save-hint {
      flex: none;
      width: 100%;
    }
  }
}

@media (max-width: 410px) {
  .b-shop-email-template-editor {
    &__fields,
    &__aside {
      grid-template-columns: minmax(0, 1fr);
    }

    &__anatomy {
      width: 100%;
      max-width: 245px;
      justify-self: center;
    }
  }
}

@media (max-width: 599px), (pointer: coarse) {
  .b-shop-email-template-editor__button.sd-modern-button {
    --v-btn-height: 44px;
    min-height: 44px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .b-shop-email-template-editor__anatomy-piece {
    transition: none;
  }
}
</style>
