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
  <div>
    <!-- --------------------------------- Environment ------------------------------ -->
    <div class="widget-box mb-5">
      <h2>
        <v-icon class="me-1">tune</v-icon>
        General Configuration
      </h2>

      <v-list-subheader>Application environment</v-list-subheader>

      <h3 v-if="app">
        <img :src="app_mode_object.src" class="me-1" height="36" width="36" />
        {{ app_mode_object.title }}
      </h3>

      <v-item-group v-if="!app" v-model="mode" mandatory>
        <v-container>
          <v-row justify="center">
            <v-col
              v-for="app_mode in AppMode"
              :key="app_mode.code"
              :class="{ disabled: !canSelectMode(app_mode.code) }"
              cols="12"
              md="4"
            >
              <v-item
                v-slot:default="{ active, toggle }"
                :value="app_mode.code"
              >
                <v-card
                  :color="active ? 'primary' : ''"
                  class="d-flex align-center"
                  dark
                  height="200"
                  @click="toggle"
                >
                  <v-scroll-y-transition>
                    <div class="text-center flex-grow-1">
                      <v-img
                        :src="app_mode.src"
                        class="mx-auto my-2"
                        contain
                        height="64"
                        width="64"
                      ></v-img>
                      {{ app_mode.title }}
                    </div>
                  </v-scroll-y-transition>
                </v-card>
              </v-item>
            </v-col>
          </v-row>
        </v-container>
      </v-item-group>

      <v-text-field
        v-model="code"
        :label="$t('add_app.code_input')"
        append-icon="fa:fas fa-copyright"
      />

      <v-switch
        v-model="enable"
        :label="$t('add_app.enable_input')"
        color="green"
        inset
      />
    </div>

    <!-- --------------------------------- Client ------------------------------ -->
    <div class="widget-box mb-5">
      <h2>
        <v-icon class="me-1">code</v-icon>
        Client
      </h2>
      <v-list-subheader
        >Oauth2 authentication and API access to users and shops
      </v-list-subheader>

      <v-textarea
        v-model="redirect"
        :rows="2"
        auto-grow
        label="Return urls"
        messages="Separate by comma (,)"
      />
    </div>

    <!-- --------------------------------- Public Information ------------------------------ -->
    <div class="widget-box mb-5">
      <h2>
        <v-icon class="me-1">public</v-icon>
        Public Information
      </h2>

      <v-select
        v-model="category"
        :item-title="
          (item) => {
            return $t(item.name);
          }
        "
        :items="categories"
        :label="$t('add_app.category_input')"
        item-value="code"
      />

      <v-text-field v-model="name" :label="$t('add_app.name_input')" />

      <v-textarea
        v-model="description"
        :counter="256"
        :label="$t('add_app.description_input')"
        :rows="2"
        auto-grow
      />

      <v-textarea
        v-model="note"
        :counter="4000"
        :rows="5"
        auto-grow
        label="Long description"
      />

      <v-btn
        class="mb-2"
        color="blue"
        variant="text"
        @click="note_prev = !note_prev"
        >{{ note_prev ? "Hide preview" : "Show preview" }}
      </v-btn>

      <v-expand-transition>
        <div v-if="note_prev">
          <div
            class="mb-5 border p-3 overflow-y-auto rounded markdown"
            style="max-height: 260px; min-height: 120px"
            v-html="note_preview"
          ></div>
        </div>
      </v-expand-transition>
    </div>

    <!-- --------------------------------- Permissions ------------------------------ -->
    <div class="widget-box mb-5">
      <h2>
        <v-icon class="me-1">add_moderator</v-icon>
        Permissions
      </h2>

      <v-select
        v-model="permissions"
        :items="scopes"
        :return-object="false"
        chips
        flat
        item-value="code"
        label="Permission scopes"
        multiple
        placeholder="Basic user profile"
      >
        <template v-slot:item="{ item ,props}">
          <v-list-item v-bind="props" :prepend-icon="item.raw.icon" :title="$t(item.raw.name)" :subtitle="$t(item.raw.description)">

          </v-list-item>
        </template>

        <template v-slot:chip="{ item,props }">
          <v-chip v-bind="props" :title="$t(item.raw.description)" color="#fff">
            <v-icon class="mx-1" size="small" v-text="item.raw.icon"></v-icon>
            <span class="px-3"> {{ $t(item.raw.name) }}</span></v-chip
          >
        </template>
      </v-select>
    </div>

    <!-- --------------------------------- Socials ------------------------------ -->
    <div class="widget-box mb-5">
      <h2>
        <v-icon class="me-1">link</v-icon>
        Social & Sources
      </h2>

      <v-text-field
        v-model="github"
        append-icon="fa:fab fa-github"
        label="Github"
        prefix="https://github.com/"
      />

      <v-text-field
        v-model="video"
        :label="$t('add_app.video_input')"
        append-icon="fa:fab fa-youtube"
      />
      <v-text-field v-model="web" label="Developer website" />

      <v-text-field v-model="privacy" label="Privacy url" />
    </div>
    <!-- --------------------------------- Public form ------------------------------ -->

    <s-form-builder
      v-model:structure="public_form"
      :title="$t('add_app.public_form')"
      class="mb-5"
    />
    <!-- --------------------------------- Private form ------------------------------ -->

    <s-form-builder
      v-model:structure="private_form"
      :title="$t('add_app.private_form')"
      class="mb-5"
    />
    <!-- --------------------------------- Actions ------------------------------ -->

    <div class="widget-buttons">
      <v-btn
        v-if="app"
        :loading="busy"
        color="primary"
        dark
        size="x-large"
        variant="flat"
        @click="editApp"
      >
        <v-icon start>save</v-icon>
        {{ $t("add_app.edit_action") }}
      </v-btn>
      <v-btn
        v-else
        :loading="busy"
        color="primary"
        dark
        size="x-large"
        variant="flat"
        @click="addApp"
      >
        <v-icon start>add</v-icon>
        {{ $t("add_app.create_action") }}
      </v-btn>

      <v-btn v-if="hasBack" size="x-large" variant="text" @click="back">
        {{ $t("global.actions.cancel") }}
      </v-btn>
    </div>
  </div>
</template>

<script>
import { ApplicationCategories } from "@selldone/core-js/enums/application/ApplicationCategories";
import SFormBuilder from "../../../ui/form/SFormBuilder.vue";
import { Scopes } from "@selldone/core-js/enums/permission/Scopes";
import { AppMode } from "@selldone/core-js/enums/application/AppMode";
import { SmartConvertTextToHtml } from "@selldone/core-js/helper/html/HtmlHelper";

export default {
  name: "BAppAdd",
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
    busy: false,

    mode: AppMode.TEST.code,

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

    AppMode: AppMode,
  }),

  computed: {
    categories() {
      let out = [];
      for (let key in ApplicationCategories) {
        let item = ApplicationCategories[key];
        out.push(item);
      }
      return out;
    },
    scopes() {
      return Object.values(Scopes);
    },

    app_mode_object() {
      if (!this.app) return null;
      return this.AppMode[this.app.mode];
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
    canSelectMode(mode) {
      if (mode === AppMode.TEST.code) return true;
      if (mode === AppMode.ENTERPRISE.code)
        return (
          this.company.register &&
          this.company.developer &&
          this.company.verified
        );
      if (mode === AppMode.PUBLIC.code)
        return this.company.register && this.company.developer;
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
            this.showErrorAlert(null, data.error_msg);
          } else {
            this.showSuccessAlert(
              null,
              this.$t("add_app.notifications.add_success", { name: this.name }),
            );
            this.$emit("add", data.app);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy = false;
        });
    },
    editApp() {
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
            this.showErrorAlert(null, data.error_msg);
          } else {
            this.showSuccessAlert(
              null,
              this.$t("add_app.notifications.delete_success"),
            );

            this.$emit("update:app", data.app);

            this.$emit("edit", data.app);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
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

<style lang="scss" scoped></style>
