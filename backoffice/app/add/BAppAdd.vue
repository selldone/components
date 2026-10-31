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

<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
  <div class="b-app-add sd-modern-canvas text-start">
    <header v-if="!app" class="b-app-add__top">
      <v-btn
        v-if="hasBack"
        variant="text"
        class="sd-modern-button b-app-add__back"
        :prepend-icon="$vuetify.locale.isRtl ? 'arrow_forward' : 'arrow_back'"
        @click="back"
      >
        {{ $t("add_app.refined.applications") }}
      </v-btn>
      <div v-if="company" class="b-app-add__company">
        <v-avatar rounded="lg" size="30">
          <img
            v-if="company.logo"
            :src="getShopImagePath(company.logo, IMAGE_SIZE_SMALL)"
            width="30"
            height="30"
            alt=""
          />
          <v-icon v-else size="20" aria-hidden="true">business</v-icon>
        </v-avatar>
        <div>
          <bdi>{{ company.name }}</bdi
          ><small>{{
            $t("add_app.refined.company_number", { id: company.id })
          }}</small>
        </div>
      </div>
      <v-tooltip
        v-if="hasBack"
        location="top"
        content-class="sd-modern-tooltip text-start"
        open-on-focus
      >
        <template #activator="{ props }">
          <v-btn
            v-bind="props"
            variant="text"
            class="sd-modern-icon-button"
            icon="close"
            :aria-label="$t('add_app.refined.close')"
            @click="back"
          />
        </template>
        {{ $t("add_app.refined.close") }}
      </v-tooltip>
    </header>
    <div class="b-app-add__content">
      <header class="sd-modern-header b-app-add__heading">
        <div class="sd-modern-title">
          <v-icon class="b-app-add__purpose" aria-hidden="true"
            >web_asset</v-icon
          >
          <div>
            <h1 class="sd-modern-title-text">
              {{
                $t(app ? "add_app.refined.edit_title" : "add_app.refined.title")
              }}
            </h1>
            <p class="sd-modern-subtitle">
              {{
                $t(
                  app
                    ? "add_app.refined.edit_subtitle"
                    : "add_app.refined.subtitle",
                )
              }}
            </p>
          </div>
        </div>
      </header>
      <div class="b-app-add__layout">
        <nav
          class="b-app-add__nav"
          :aria-label="
            $t(app ? 'add_app.refined.edit_title' : 'add_app.refined.title')
          "
        >
          <button
            v-for="item in sections"
            :key="item.id"
            type="button"
            :aria-current="activeSection === item.id ? 'step' : undefined"
            :aria-controls="'b-app-section-' + item.id"
            @click="selectSection(item.id)"
          >
            <v-icon :icon="item.icon" size="17" aria-hidden="true" /><span>{{
              $t("add_app.refined." + item.title)
            }}</span>
            <span
              v-if="
                Object.keys(fieldErrors).some(
                  (field) => fieldSection(field) === item.id,
                )
              "
              class="b-app-add__error-dot"
              aria-hidden="true"
            />
          </button>
        </nav>
        <div class="b-app-add__form">
          <div
            v-if="Object.keys(fieldErrors).length"
            class="sd-modern-notice b-app-add__error"
            role="alert"
          >
            <v-icon size="18" color="error" aria-hidden="true"
              >error_outline</v-icon
            ><span>{{ $t("add_app.refined.review_fields") }}</span>
          </div>
          <div class="sd-modern-widget b-app-add__panel">
            <header class="b-app-add__panel-heading">
              <div>
                <h2 :id="'b-app-heading-' + activeSection">
                  {{ $t("add_app.refined." + currentSection.title) }}
                </h2>
                <p>
                  {{
                    $t(
                      app && activeSection === "general"
                        ? "add_app.refined.configuration_edit_subtitle"
                        : "add_app.refined." +
                            currentSection.title +
                            "_subtitle",
                    )
                  }}
                </p>
              </div>
              <v-tooltip
                location="top"
                content-class="sd-modern-tooltip text-start"
                open-on-focus
                open-on-click
              >
                <template #activator="{ props }"
                  ><v-btn
                    v-bind="props"
                    class="sd-modern-icon-button sd-modern-info-button"
                    variant="text"
                    icon="info_outline"
                    :aria-label="
                      $t('add_app.refined.section_help', {
                        section: $t('add_app.refined.' + currentSection.title),
                      })
                    "
                /></template>
                {{ $t("add_app.refined." + currentSection.help) }}
              </v-tooltip>
            </header>
            <!-- ███████████████████████ Environment ███████████████████████ -->
            <section
              v-show="activeSection === 'general'"
              id="b-app-section-general"
              aria-labelledby="b-app-heading-general"
            >
              <fieldset class="b-app-add__environments">
                <legend>{{ $t("add_app.refined.environment") }}</legend>
                <div v-if="app" class="b-app-add__fixed-mode">
                  <img
                    v-if="app_mode_object.src"
                    :src="app_mode_object.src"
                    alt=""
                    width="24"
                    height="24"
                  />
                  <div>
                    <strong>{{ app_mode_object.title }}</strong>
                    <p>{{ $t("add_app.refined.mode_fixed") }}</p>
                  </div>
                </div>
                <v-radio-group v-else v-model="mode" hide-details>
                  <div class="b-app-add__choices">
                    <label
                      v-for="appMode in AppMode"
                      :key="appMode.code"
                      class="b-app-add__choice"
                      :class="{
                        'is-disabled': !canSelectMode(appMode.code),
                        'is-selected': mode === appMode.code,
                      }"
                    >
                      <v-radio
                        :value="appMode.code"
                        :disabled="!canSelectMode(appMode.code)"
                        :aria-label="appMode.title"
                        color="primary"
                      />
                      <img :src="appMode.src" alt="" width="24" height="24" />
                      <span
                        ><strong>{{ appMode.title }}</strong
                        ><small>{{
                          $t(
                            "add_app.refined." +
                              appMode.code.toLowerCase() +
                              "_description",
                          )
                        }}</small
                        ><small v-if="!canSelectMode(appMode.code)">{{
                          $t(
                            "add_app.refined." +
                              appMode.code.toLowerCase() +
                              "_unavailable",
                          )
                        }}</small></span
                      >
                    </label>
                  </div>
                </v-radio-group>
              </fieldset>
              <v-text-field
                v-model="code"
                class="sd-modern-underlined-field b-app-add__ltr"
                variant="underlined"
                :label="$t('add_app.code_input') + ' *'"
                :messages="
                  $t(
                    app
                      ? 'add_app.refined.code_edit_help'
                      : 'add_app.refined.code_help',
                  )
                "
                :error-messages="fieldMessages('code')"
                required
              />
              <div class="b-app-add__enable">
                <div>
                  <label for="b-app-enable">{{
                    $t("add_app.enable_input")
                  }}</label>
                  <p>{{ $t("add_app.refined.enabled_help") }}</p>
                </div>
                <v-switch
                  id="b-app-enable"
                  v-model="enable"
                  color="primary"
                  inset
                  hide-details
                  :aria-label="$t('add_app.enable_input')"
                />
              </div>
            </section>
            <!-- ███████████████████████ Public information ███████████████████████ -->
            <section
              v-show="activeSection === 'publicInfo'"
              id="b-app-section-publicInfo"
              aria-labelledby="b-app-heading-publicInfo"
            >
              <v-select
                v-model="category"
                class="sd-modern-underlined-field"
                variant="underlined"
                :items="categories"
                :item-title="metadataTitle"
                item-value="code"
                :label="$t('add_app.category_input') + ' *'"
                :error-messages="fieldMessages('category')"
                :menu-props="{ contentClass: 'sd-modern-menu text-start' }"
                :list-props="{ class: 'sd-modern-menu__list' }"
                required
              />
              <v-text-field
                v-model="name"
                class="sd-modern-underlined-field"
                variant="underlined"
                :label="$t('add_app.name_input') + ' *'"
                :error-messages="fieldMessages('name')"
                required
              />
              <v-textarea
                v-model="description"
                class="sd-modern-underlined-field"
                variant="underlined"
                :counter="256"
                :rows="2"
                auto-grow
                :label="$t('add_app.description_input') + ' *'"
                :error-messages="fieldMessages('description')"
                required
              />
              <v-textarea
                v-model="note"
                class="sd-modern-underlined-field"
                variant="underlined"
                :counter="4000"
                :rows="5"
                auto-grow
                :label="$t('add_app.refined.long_description')"
                :messages="$t('add_app.refined.long_description_help')"
                :error-messages="fieldMessages('note')"
              />
              <v-btn
                class="sd-modern-button b-app-add__preview-toggle"
                variant="text"
                color="primary"
                :aria-expanded="note_prev"
                aria-controls="b-app-note-preview"
                @click="note_prev = !note_prev"
                >{{
                  $t(
                    "add_app.refined." +
                      (note_prev ? "hide_preview" : "show_preview"),
                  )
                }}</v-btn
              >
              <div
                v-if="note_prev"
                id="b-app-note-preview"
                class="b-app-add__preview markdown"
              >
                <div v-if="note" v-html="note_preview" />
                <p v-else>{{ $t("add_app.refined.preview_empty") }}</p>
              </div>
            </section>
            <!-- ███████████████████████ Client ███████████████████████ -->
            <section
              v-show="activeSection === 'client'"
              id="b-app-section-client"
              aria-labelledby="b-app-heading-client"
            >
              <v-textarea
                v-model="redirect"
                class="sd-modern-underlined-field b-app-add__ltr"
                variant="underlined"
                :rows="2"
                auto-grow
                :label="$t('add_app.refined.return_urls')"
                :messages="$t('add_app.refined.return_urls_help')"
                :error-messages="fieldMessages('redirect')"
              />
            </section>
            <!-- ███████████████████████ Permissions ███████████████████████ -->
            <section
              v-show="activeSection === 'permissions'"
              id="b-app-section-permissions"
              aria-labelledby="b-app-heading-permissions"
            >
              <v-select
                v-model="permissions"
                class="sd-modern-underlined-field b-app-add__permissions"
                variant="underlined"
                :items="scopes"
                :return-object="false"
                :item-title="metadataTitle"
                item-value="code"
                chips
                closable-chips
                multiple
                :label="$t('add_app.refined.permission_scopes')"
                :placeholder="$t('add_app.refined.permission_placeholder')"
                :error-messages="fieldMessages('permissions')"
                :menu-props="{
                  contentClass: 'sd-modern-menu text-start',
                  maxHeight: 360,
                }"
                :list-props="{ class: 'sd-modern-menu__list' }"
              >
                <template #item="{ item, props }"
                  ><v-list-item
                    v-bind="props"
                    class="b-app-add__scope"
                    :prepend-icon="item.raw?.icon"
                    :title="metadataTitle(item.raw)"
                    :subtitle="metadataDescription(item.raw)"
                /></template>
                <template #chip="{ item, props }">
                  <v-tooltip
                    location="top"
                    content-class="sd-modern-tooltip text-start"
                    open-on-focus
                    :disabled="!metadataDescription(item.raw)"
                  >
                    <template #activator="{ props: helpProps }">
                      <v-chip
                        v-bind="{ ...props, ...helpProps }"
                        variant="tonal"
                        ><v-icon
                          v-if="item.raw?.icon"
                          :icon="item.raw?.icon"
                          size="16"
                          class="me-1"
                        /><span>{{ metadataTitle(item.raw) }}</span></v-chip
                      >
                    </template>
                    {{ metadataDescription(item.raw) }}
                  </v-tooltip>
                </template>
              </v-select>
            </section>
            <!-- ███████████████████████ Socials ███████████████████████ -->
            <section
              v-show="activeSection === 'links'"
              id="b-app-section-links"
              aria-labelledby="b-app-heading-links"
            >
              <v-text-field
                v-model="github"
                class="sd-modern-underlined-field b-app-add__ltr"
                variant="underlined"
                :label="$t('add_app.refined.github')"
                prefix="https://github.com/"
                :error-messages="fieldMessages('github')"
              />
              <v-text-field
                v-model="video"
                class="sd-modern-underlined-field b-app-add__ltr"
                variant="underlined"
                :label="$t('add_app.video_input')"
                :error-messages="fieldMessages('video')"
              />
              <v-text-field
                v-model="web"
                class="sd-modern-underlined-field b-app-add__ltr"
                variant="underlined"
                :label="$t('add_app.refined.developer_website')"
                :error-messages="fieldMessages('web')"
              />
              <v-text-field
                v-model="privacy"
                class="sd-modern-underlined-field b-app-add__ltr"
                variant="underlined"
                :label="$t('add_app.refined.privacy_url')"
                :error-messages="fieldMessages('privacy')"
              />
            </section>
            <!-- Keep both native builders mounted so navigation never discards their local editors. -->
            <section
              v-show="activeSection === 'publicForm'"
              id="b-app-section-publicForm"
              aria-labelledby="b-app-heading-publicForm"
            >
              <s-form-builder
                v-model:structure="public_form"
                modern
                :title="
                  $t('add_app.refined.public_fields') + ' ' + public_form.length
                "
              />
              <p
                v-for="message in fieldMessages('public')"
                :key="message"
                class="b-app-add__field-error"
                role="alert"
              >
                {{ message }}
              </p>
            </section>
            <section
              v-show="activeSection === 'privateForm'"
              id="b-app-section-privateForm"
              aria-labelledby="b-app-heading-privateForm"
            >
              <s-form-builder
                v-model:structure="private_form"
                modern
                :title="
                  $t('add_app.refined.private_fields') +
                  ' ' +
                  private_form.length
                "
              />
              <p
                v-for="message in fieldMessages('private')"
                :key="message"
                class="b-app-add__field-error"
                role="alert"
              >
                {{ message }}
              </p>
            </section>
          </div>
          <footer class="b-app-add__actions">
            <small>{{ $t("add_app.refined.required_fields") }}</small>
            <v-btn
              v-if="hasBack"
              class="sd-modern-button"
              variant="outlined"
              @click="back"
              >{{ $t("global.actions.cancel") }}</v-btn
            >
            <v-btn
              class="sd-modern-button sd-modern-button--primary"
              color="primary"
              variant="flat"
              :prepend-icon="app ? 'save' : 'add'"
              :loading="busy"
              @click="app ? editApp() : addApp()"
              >{{
                $t(
                  app
                    ? "add_app.refined.save_action"
                    : "add_app.refined.create_action",
                )
              }}</v-btn
            >
          </footer>
          <p class="b-app-add__api-note">
            {{ $t("add_app.refined.api_note") }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import SFormBuilder from "../../../ui/form/SFormBuilder.vue";
import { Scopes } from "@selldone/core-js/enums/permission/Scopes";
import { SmartConvertTextToHtml } from "@selldone/core-js/helper/html/HtmlHelper";
import { Application } from "@selldone/core-js";

import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

export default {
  name: "BAppAdd",
  mixins: [],
  components: { SFormBuilder },
  props: {
    company: {
      // available only in add app!
      required: false,
      type: Object,
    },

    app: {
      required: false,
      type: Object,
    },
    hasBack: {
      required: false,
      type: Boolean,
      default: false,
    },
  },

  data: () => ({
    Scopes: Scopes,

    busy: false,
    activeSection: "general",
    fieldErrors: {},

    mode: Application.AppMode.TEST.code,

    category: null,
    enable: false,
    github: "",
    video: "",

    code: "",
    name: "",
    redirect: "",

    description: "",
    note: "",
    note_prev: false,
    web: "",
    privacy: "",
    permissions: [],

    public_form: [],
    private_form: [],

    AppMode: Application.AppMode,
  }),

  computed: {
    sections() {
      return [
        {
          id: "general",
          title: "configuration",
          icon: "tune",
          help: "mode_help",
        },
        {
          id: "publicInfo",
          title: "public_information",
          icon: "public",
          help: "long_description_help",
        },
        {
          id: "client",
          title: "oauth_client",
          icon: "vpn_key",
          help: "return_urls_info",
        },
        {
          id: "permissions",
          title: "permissions",
          icon: "verified_user",
          help: "permissions_help",
        },
        { id: "links", title: "links", icon: "link", help: "links_subtitle" },
        {
          id: "publicForm",
          title: "public_fields",
          icon: "playlist_add",
          help: "form_help",
        },
        {
          id: "privateForm",
          title: "private_fields",
          icon: "lock_outline",
          help: "form_help",
        },
      ];
    },
    currentSection() {
      return this.sections.find((section) => section.id === this.activeSection);
    },
    categories() {
      let out = [];
      for (let key in Application.ApplicationCategories) {
        let item = Application.ApplicationCategories[key];
        out.push(item);
      }
      return out;
    },
    scopes() {
      return Object.values(Scopes);
    },

    app_mode_object() {
      if (!this.app) return null;
      return (
        this.AppMode[this.app.mode] || {
          title: this.app.mode || "—",
          src: null,
        }
      );
    },
    note_preview() {
      return SmartConvertTextToHtml(this.note, true, true);
    },
  },

  watch: {
    app() {
      this.assignFromApp();
    },
  },
  created() {
    this.assignFromApp();
  },

  methods: {
    // Saved values may predate the current category/scope catalog; retain their raw code.
    metadataTitle(item) {
      if (typeof item === "string") return item;
      return typeof item?.name === "string" && item.name
        ? this.$t(item.name)
        : String(item?.code ?? "");
    },
    metadataDescription(item) {
      return typeof item?.description === "string" && item.description
        ? this.$t(item.description)
        : "";
    },
    selectSection(id) {
      this.activeSection = id;
    },
    fieldSection(field) {
      const key = field.split(".")[0];
      if (["category", "name", "description", "note"].includes(key))
        return "publicInfo";
      if (["github", "video", "web", "privacy"].includes(key)) return "links";
      if (key === "redirect") return "client";
      if (key === "permissions") return "permissions";
      if (key === "public") return "publicForm";
      if (key === "private") return "privateForm";
      return "general";
    },
    fieldMessages(field) {
      return Object.entries(this.fieldErrors)
        .filter(([key]) => key === field || key.startsWith(field + "."))
        .flatMap(([, messages]) => messages);
    },
    captureFieldErrors(error) {
      if (error.response?.status !== 422) return;
      const errors = error.response.data?.errors;
      if (!errors || typeof errors !== "object" || Array.isArray(errors))
        return;
      this.fieldErrors = errors;
      const firstField = Object.keys(errors)[0];
      if (!firstField) return;
      this.activeSection = this.fieldSection(firstField);
      this.$nextTick(() => {
        this.$el
          .querySelector(
            "section:not([style*='display: none']) [aria-invalid='true']",
          )
          ?.focus();
      });
    },
    canSelectMode(mode) {
      if (mode === Application.AppMode.TEST.code) return true;
      if (mode === Application.AppMode.ENTERPRISE.code)
        return (
          !!this.company?.register &&
          !!this.company?.developer &&
          !!this.company?.verified
        );
      if (mode === Application.AppMode.PUBLIC.code)
        return !!this.company?.register && !!this.company?.developer;
    },

    handleProcessFileIcon: function (error, file) {
      if (!error) {
        let response = JSON.parse(file.serverId);
        console.log("done", response.files.path);
        this.app.icon = response.files.path;
        return true;
      }
    },

    handleProcessFileLogo: function (error, file) {
      if (!error) {
        let response = JSON.parse(file.serverId);
        console.log("done", response.files.path);
        this.app.logo = response.files.path;
        return true;
      }
    },

    addApp() {
      if (this.busy) return;
      this.fieldErrors = {};
      this.busy = true;
      axios
        .post(window.API.POST_ADD_APP(this.$route.params.company_id), {
          mode: this.mode,

          category: this.category,
          enable: this.enable,
          github: this.github,
          video: this.video,
          code: this.code,
          name: this.name,
          redirect: this.redirect,
          description: this.description,
          note: this.note,
          web: this.web,
          privacy: this.privacy,
          public: this.public_form,
          private: this.private_form,

          permissions: this.permissions,
        })
        .then(({ data }) => {
          if (data.error) {
            NotificationService.showErrorAlert(null, data.error_msg);
          } else {
            NotificationService.showSuccessAlert(
              null,
              this.$t("add_app.notifications.add_success", { name: this.name }),
            );
            this.$emit("add", data.app);
          }
        })
        .catch((error) => {
          this.captureFieldErrors(error);
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy = false;
        });
    },
    editApp() {
      if (this.busy) return;
      this.fieldErrors = {};
      this.busy = true;

      axios
        .put(
          window.API.PUT_EDIT_APP(this.$route.params.company_id, this.app.id),
          {
            category: this.category,
            enable: this.enable,
            github: this.github,
            video: this.video,
            code: this.code,
            name: this.name,
            redirect: this.redirect,
            description: this.description,
            note: this.note,
            web: this.web,
            privacy: this.privacy,
            public: this.public_form,
            private: this.private_form,

            permissions: this.permissions,
          },
        )
        .then(({ data }) => {
          if (data.error) {
            NotificationService.showErrorAlert(null, data.error_msg);
          } else {
            NotificationService.showSuccessAlert(
              null,
              this.$t("add_app.notifications.delete_success"),
            );

            this.$emit("update:app", data.app);

            this.$emit("edit", data.app);
          }
        })
        .catch((error) => {
          this.captureFieldErrors(error);
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy = false;
        });
    },

    back() {
      this.$emit("back");
    },

    assignFromApp() {
      if (!this.app) return;

      this.mode = this.app.mode;

      this.category = this.app.category;
      this.enable = this.app.enable;
      this.github = this.app.github;
      this.video = this.app.video;
      this.code = this.app.code;
      this.name = this.app.name;

      this.description = this.app.description;
      this.note = this.app.note;
      this.web = this.app.web;
      this.privacy = this.app.privacy;

      this.permissions = this.app.permissions;

      this.public_form = this.app.public ? this.app.public : [];
      this.private_form = this.app.private ? this.app.private : [];

      this.redirect = this.app.client ? this.app.client.redirect : "";
    },
  },
};
</script>

<style lang="scss" scoped>
.b-app-add__scope {
  :deep(.v-list-item-title) {
    font-size: 14px;
    line-height: 22px;
    white-space: normal;
  }
  :deep(.v-list-item-subtitle) {
    font-size: 13px;
    line-height: 21px;
    -webkit-line-clamp: unset;
    opacity: 1;
  }
}
.b-app-add {
  min-height: 100%;
  color: rgb(var(--v-theme-on-surface));
  font-family: inherit;
  font-size: 14px;
  line-height: 22px;

  .b-app-add__top {
    display: flex;
    align-items: center;
    gap: 20px;
    padding: 14px 28px;
    border-bottom: 1px solid var(--sd-modern-border);
    background: rgb(var(--v-theme-surface));
  }
  .b-app-add__back {
    padding-inline: 0;
    color: rgb(var(--v-theme-primary));
  }
  .b-app-add__company {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-inline-start: auto;
    font-size: 13px;
    line-height: 21px;
  }
  .b-app-add__company img {
    object-fit: contain;
  }
  .b-app-add__company small {
    display: block;
    color: var(--sd-modern-muted);
    font-size: 12px;
    line-height: 19px;
  }
  .b-app-add__content {
    width: 100%;
    max-width: 1040px;
    margin-inline: auto;
    padding: 32px 26px 42px;
  }
  .b-app-add__heading {
    margin-bottom: 26px;
  }
  .b-app-add__purpose {
    font-size: 22px;
    margin-block-start: 4px;
  }
  .sd-modern-title {
    align-items: flex-start;
    gap: 12px;
  }
  .sd-modern-title-text {
    font-size: 22px;
    line-height: 30px;
    font-weight: 500;
    letter-spacing: 0;
  }
  .sd-modern-subtitle {
    margin: 6px 0 0;
    font-size: 13px;
    line-height: 21px;
  }
  .b-app-add__layout {
    display: grid;
    grid-template-columns: 186px minmax(0, 1fr);
    gap: 24px;
    align-items: start;
  }
  .b-app-add__nav {
    display: grid;
    gap: 6px;
  }
  .b-app-add__nav button {
    display: flex;
    align-items: center;
    gap: 10px;
    min-height: 44px;
    padding: 10px 12px;
    border: 0;
    border-radius: 10px;
    color: inherit;
    background: transparent;
    font: inherit;
    font-size: 13px;
    line-height: 20px;
    text-align: start;
  }
  .b-app-add__nav button:hover,
  .b-app-add__nav button[aria-current] {
    background: rgb(var(--v-theme-surface));
  }
  .b-app-add__nav button[aria-current] {
    box-shadow: var(--sd-modern-selected-shadow);
  }
  .b-app-add__nav .v-icon {
    color: var(--sd-modern-muted);
  }
  .b-app-add__nav button:focus-visible {
    outline: 2px solid rgb(var(--v-theme-primary));
    outline-offset: 2px;
  }
  .b-app-add__error-dot {
    flex: 0 0 5px;
    width: 5px;
    height: 5px;
    margin-inline-start: auto;
    border-radius: 50%;
    background: rgb(var(--v-theme-error));
  }
  .b-app-add__form {
    min-width: 0;
  }
  .b-app-add__panel.sd-modern-widget {
    min-height: 540px;
    padding: 24px;
    border-radius: 18px;
  }
  .b-app-add__panel-heading {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 14px;
    margin-bottom: 24px;
  }
  .b-app-add__panel-heading h2 {
    margin: 0;
    font-size: 16px;
    line-height: 24px;
    font-weight: 500;
    letter-spacing: 0;
  }
  .b-app-add__panel-heading p {
    margin: 6px 0 0;
    color: var(--sd-modern-muted);
    font-size: 13px;
    line-height: 21px;
  }
  .b-app-add__panel section {
    min-width: 0;
  }
  .b-app-add__panel section > .v-input {
    margin-block-end: 22px;
  }
  .b-app-add__panel :deep(.v-input__details),
  .b-app-add__panel :deep(.v-messages__message) {
    font-size: 13px;
    line-height: 21px;
  }
  .b-app-add__panel :deep(.v-counter) {
    font-size: 11px;
    line-height: 18px;
  }
  .b-app-add__ltr :deep(input),
  .b-app-add__ltr :deep(textarea) {
    direction: ltr;
    text-align: start;
  }
  .b-app-add__environments {
    min-width: 0;
    border: 0;
    padding: 0;
    margin: 0 0 24px;
  }
  .b-app-add__environments legend {
    margin-bottom: 10px;
    padding: 0;
    font-size: 13px;
    font-weight: 500;
    line-height: 21px;
  }
  .b-app-add__fixed-mode {
    display: flex;
    align-items: center;
    gap: 12px;
    padding-block: 8px;
  }
  .b-app-add__fixed-mode strong {
    font-size: 14px;
    font-weight: 500;
  }
  .b-app-add__fixed-mode p {
    margin: 4px 0 0;
    color: var(--sd-modern-muted);
    font-size: 13px;
    line-height: 21px;
  }
  .b-app-add__choices {
    border: 1px solid var(--sd-modern-border);
    border-radius: 18px;
    overflow: hidden;
  }
  .b-app-add__choice {
    display: flex;
    align-items: center;
    gap: 12px;
    min-height: 70px;
    padding: 15px 16px;
  }
  .b-app-add__choice + .b-app-add__choice {
    border-top: 1px solid var(--sd-modern-border);
  }
  .b-app-add__choice.is-selected {
    background: var(--sd-modern-inset);
  }
  .b-app-add__choice.is-disabled {
    opacity: 0.58;
  }
  .b-app-add__choice .v-radio {
    flex: 0 0 auto;
  }
  .b-app-add__choice img {
    flex: 0 0 24px;
    object-fit: contain;
  }
  .b-app-add__choice > span {
    min-width: 0;
  }
  .b-app-add__choice strong,
  .b-app-add__choice small {
    display: block;
    font-size: 13px;
    line-height: 21px;
    font-weight: 400;
  }
  .b-app-add__choice strong {
    font-weight: 500;
  }
  .b-app-add__choice small {
    color: var(--sd-modern-muted);
  }
  .b-app-add__enable {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    padding-top: 10px;
  }
  .b-app-add__enable label {
    font-size: 13px;
    font-weight: 500;
  }
  .b-app-add__enable p {
    margin: 6px 0 0;
    color: var(--sd-modern-muted);
    font-size: 13px;
    line-height: 21px;
  }
  .b-app-add__enable > .v-input {
    flex: 0 0 auto;
  }
  .b-app-add__preview-toggle {
    padding-inline: 0;
  }
  .b-app-add__preview {
    margin-top: 16px;
    border-top: 1px solid var(--sd-modern-border);
    padding-top: 16px;
    overflow-wrap: anywhere;
    font-size: 14px;
    line-height: 24px;
  }
  .b-app-add__preview :deep(img) {
    max-width: 100%;
    height: auto;
  }
  .b-app-add__preview :deep(pre) {
    white-space: pre-wrap;
  }
  .b-app-add__permissions :deep(.v-select__selection) {
    max-width: 100%;
  }
  .b-app-add__permissions :deep(.v-chip) {
    max-width: 100%;
    height: auto;
    min-height: 28px;
    font-size: 13px;
  }
  .b-app-add__permissions :deep(.v-chip__content) {
    white-space: normal;
    overflow-wrap: anywhere;
  }
  .b-app-add__panel :deep(.s-form-builder__toolbar) {
    margin-block-start: 0;
    padding-block-start: 0;
    border-top: 0;
  }
  .b-app-add__panel :deep(.s-form-builder__toolbar p),
  .b-app-add__panel :deep(.s-form-builder__empty p),
  .b-app-add__panel :deep(.s-form-builder-row__summary small),
  .b-app-add__panel :deep(.s-form-builder-row__switch .small) {
    font-size: 13px;
    line-height: 21px;
  }
  .b-app-add__panel :deep(.s-form-builder-row--modern) {
    border: 0;
    border-top: 1px solid var(--sd-modern-border);
    border-radius: 0;
    background: transparent;
  }
  .b-app-add__panel :deep(.s-form-builder-row__header) {
    padding-inline: 0;
  }
  .b-app-add__panel :deep(.s-form-builder-row__fields) {
    padding-block: 4px 20px;
    padding-inline: 40px 0;
    border: 0;
  }
  .b-app-add__panel :deep(.s-form-builder-row__main-grid) {
    grid-template-columns: minmax(0, 1fr);
    gap: 0;
  }
  .b-app-add__actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    align-items: center;
    gap: 12px;
    padding-top: 22px;
  }
  .b-app-add__actions > small {
    margin-inline-end: auto;
    color: var(--sd-modern-muted);
    font-size: 12px;
    line-height: 19px;
  }
  .b-app-add__actions > .sd-modern-button {
    min-width: 0;
    font-size: 13px;
    line-height: 20px;
  }
  .b-app-add__actions :deep(.v-btn__content) {
    white-space: normal;
  }
  .b-app-add__api-note {
    margin: 20px 0 0;
    color: var(--sd-modern-muted);
    font-size: 13px;
    line-height: 21px;
  }
  .b-app-add__error {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    margin-bottom: 20px;
    font-size: 13px;
    line-height: 22px;
  }
  .b-app-add__field-error {
    font-size: 13px;
    line-height: 21px;
  }
}
@media (max-width: 700px) {
  .b-app-add {
    .b-app-add__content {
      padding: 24px 16px 32px;
    }
    .b-app-add__top {
      padding: 12px 16px;
      gap: 12px;
    }
    .b-app-add__company small {
      display: none;
    }
    .b-app-add__layout {
      grid-template-columns: minmax(0, 1fr);
      gap: 24px;
    }
    .b-app-add__nav {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 6px;
    }
    .b-app-add__nav button {
      min-width: 0;
      padding-inline: 10px;
    }
    .b-app-add__panel.sd-modern-widget {
      min-height: 0;
      padding: 20px 16px;
    }
    .b-app-add__choice {
      gap: 8px;
      padding-inline: 10px;
    }
    .b-app-add__actions > small {
      flex-basis: 100%;
    }
    .b-app-add__panel :deep(.v-field__input) {
      font-size: 16px;
    }
    .b-app-add__panel :deep(.s-form-builder-row__fields) {
      padding-inline: 0;
    }
  }
}
@media (pointer: coarse), (max-width: 700px) {
  .b-app-add .sd-modern-button {
    min-height: 44px;
  }
  .b-app-add .b-app-add__permissions :deep(.v-chip__close) {
    min-width: 44px;
    min-height: 44px;
  }
}
</style>
