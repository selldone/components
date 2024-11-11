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
  <v-card
    :class="{
      'border-top-thick': shopApp,
      '-red': shopApp && !shopApp.enable,
      '-green': shopApp && shopApp.enable,
    }"
    :dark="dark"
    class="text-start"
    v-bind="$attrs"
  >
    <v-card-title class="d-flex align-center">
      <img
        :height="24"
        :src="getShopImagePath(app.logo)"
        class="me-2"
        width="auto"
      />
      <v-spacer></v-spacer>
      <v-btn class="ms-2" color="default" variant="text" @click="close()">
        <v-icon start>close</v-icon>
        {{ $t("global.actions.close") }}
      </v-btn>
    </v-card-title>

    <v-card-text class="px-0 thin-scroll">
      <v-container class="px-0">
        <v-row>
          <v-col
            class="pp text-center"
            cols="12"
            lg="2"
            md="3"
            sm="4"
            @click.stop="rate_mode = !!shopId"
          >
            <v-avatar class="mx-auto my-2 fadeInUp" rounded size="48">
              <img :src="getShopImagePath(app.icon)" />
            </v-avatar>

            <v-rating
              :model-value="app.rate"
              active-color="yellow-darken-3"
              class="fadeInUp delay_100"
              color="grey-darken-1"
              density="compact"
              half-increments
              readonly
            ></v-rating>

            <div class="fadeInUp delay_200">
              <b class="me-2">{{ numeralFormat(app.rate, "0.[0]") }}</b>
              <small
                >({{ numeralFormat(app.rate_count, "0,0") }}
                {{ $t("app_config.reviews") }})</small
              >
            </div>

            <div class="mt-2 fadeIn delay_300">
              <v-btn
                v-if="app.my_review"
                color="#ddd"
                variant="outlined"
                @click.stop="rate_mode = true"
              >
                <v-avatar class="me-2" size="18">
                  <img :src="getUserAvatar(USER_ID())" />
                </v-avatar>
                <v-rating
                  :model-value="app.my_review.rate"
                  active-color="yellow-darken-3"
                  color="grey-darken-1"
                  density="compact"
                  half-increments
                  readonly
                  size="x-small"
                ></v-rating>
              </v-btn>
              <v-btn v-else variant="outlined" @click="rate_mode = true">
                {{ $t("app_config.rate_now") }}
              </v-btn>
            </div>
          </v-col>
          <v-col
            class="text-start fadeIn delay_200"
            cols="12"
            lg="10"
            md="9"
            sm="8"
          >
            <h5>{{ app.name }}</h5>
            <div class="mb-3">
              {{ $t("app_config.category") }}:
              <v-icon class="mx-1" size="small"
                >{{ getCategory(app.category).icon }}
              </v-icon>
              {{ $t(getCategory(app.category).name) }}
            </div>

            <p>
              {{ app.description }}
              <v-btn size="small" variant="text" @click="show_note = !show_note"
                >{{
                  show_note
                    ? $t("global.actions.collapse")
                    : $t("global.actions.more")
                }}
              </v-btn>
            </p>

            <v-expand-transition>
              <div v-if="show_note" class="markdown" v-html="note"></div>
            </v-expand-transition>

            <div class="d-flex justify-end">
              <v-btn
                v-if="
                  shopApp &&
                  !(
                    $route.name === 'BPageApplication' &&
                    $route.params.app_code === app.code
                  )
                "
                :to="{
                  name: 'BPageApplication',
                  params: { shop_id: shopApp.shop_id, app_code: app.code },
                }"
                class="me-3 zoomIn delay_500"
                color="blue"
                prepend-icon="launch"
                variant="flat"
              >
                {{ $t("global.actions.open_app") }}
              </v-btn>

              <!------------------------- Uninstall App------------------------->

              <v-btn
                v-if="shopApp"
                :class="{ disabled: !app.edit_access }"
                :loading="busy_delete"
                class="zoomIn delay_600"
                color="red"
                prepend-icon="delete"
                variant="outlined"
                @click="deleteApp"
              >
                {{ $t("app_config.uninstall") }}
              </v-btn>

              <!------------------------- Install App------------------------->

              <v-btn
                v-else
                :class="{ disabled: !app.edit_access }"
                :loading="busy_save"
                class="zoomIn delay_600"
                color="green"
                prepend-icon="get_app"
                size="large"
                variant="flat"
                @click="setPlugin()"
              >
                {{ $t("app_config.get_app") }}
              </v-btn>
            </div>

            <div>
              <v-btn
                v-if="app.github"
                :href="`https://github.com/${app.github}`"
                class="ma-2"
                icon
                target="_blank"
                variant="text"
              >
                <v-icon>fa:fab fa-github</v-icon>
                <v-tooltip activator="parent" location="bottom">
                  Github
                </v-tooltip>
              </v-btn>

              <v-btn
                v-if="app.web"
                :href="app.web"
                class="ma-2"
                icon
                target="_blank"
                variant="text"
              >
                <v-icon>link</v-icon>

                <v-tooltip activator="parent" location="bottom">
                  Website
                </v-tooltip>
              </v-btn>

              <v-btn
                v-if="app.privacy"
                :href="app.privacy"
                class="ma-2"
                icon
                target="_blank"
                variant="text"
              >
                <v-icon>security</v-icon>

                <v-tooltip activator="parent" location="bottom">
                  Privacy
                </v-tooltip>
              </v-btn>

              <v-btn
                v-if="app.video"
                :href="app.video"
                class="ma-2"
                icon
                target="_blank"
                variant="text"
              >
                <v-icon>theaters</v-icon>

                <v-tooltip activator="parent" location="bottom">
                  Video
                </v-tooltip>
              </v-btn>
            </div>
          </v-col>

          <v-col class="px-0 position-relative" cols="12">
            <!-- swiper -->
            <b-app-detail-gallery
              :app="app"
              :dark="dark"
              class="fadeIn delay_1s"
            >
            </b-app-detail-gallery>
          </v-col>

          <v-expand-transition>
            <v-col v-if="shopApp" class="text-start" cols="12">
              <!------------------------- Public Keys ------------------------->

              <template v-if="app.public.length">
                <p class="font-weight-black mt-4">
                  <i class="fas fa-globe-asia text-primary" />
                  {{ $t("app_config.public_keys") }}
                </p>

                <div v-for="item in app.public" :key="item.name">
                  <v-text-field
                    v-model="public[item.name]"
                    :label="item.title"
                    class="max-width-field mx-auto"
                    density="compact"
                    rounded
                    variant="filled"
                  />
                </div>
              </template>

              <!------------------------- Private Keys ------------------------->

              <template v-if="app.edit_access && app.private.length">
                <p class="font-weight-black mt-4">
                  <i class="fas fa-user-shield text-success" />
                  {{ $t("app_config.private_keys") }}
                </p>

                <div v-for="item in app.private" :key="item.name">
                  <v-text-field
                    v-model="private[item.name]"
                    :label="item.title"
                    class="max-width-field mx-auto"
                    density="compact"
                    rounded
                    variant="filled"
                  />
                </div>
              </template>

              <p v-if="!app.edit_access" class="text-start">
                You have no access to the private keys of the store's apps!
              </p>

              <v-divider></v-divider>

              <!------------------------- App config ------------------------->

              <p class="small m-0">{{ $t("app_config.config") }}</p>

              <v-switch
                v-model="enable"
                :disabled="!app.edit_access"
                :label="`${$t('app_config.app_status')}: ${
                  enable
                    ? $t('global.commons.active')
                    : $t('global.commons.inactive')
                }`"
                color="success"
                inset
              />

              <!------------------------- App variables (use in header scripts) ------------------------->

              <v-text-field
                v-for="variable in variables_inputs"
                :key="variable.key"
                v-model="variables[variable.key]"
                :disabled="!app.edit_access"
                :label="variable.title"
                class="max-width-field mx-auto"
                density="compact"
                rounded
                variant="filled"
              >
              </v-text-field>

              <!------------------------- Save config ------------------------->

              <v-btn
                :disabled="!app.edit_access"
                :loading="busy_save"
                color="blue"
                variant="flat"
                @click="setPlugin()"
              >
                <v-icon class="me-2" size="small">save</v-icon>
                {{ $t("global.actions.save") }}
              </v-btn>
            </v-col>
          </v-expand-transition>

          <v-col cols="12">
            <v-divider></v-divider>
            <p class="small m-0 text-start">{{ $t("app_config.app_info") }}</p>
          </v-col>

          <!--------------------------------------------------->
          <v-col cols="6" md="4">
            <p class="font-weight-bold m-1">{{ $t("app_config.update_at") }}</p>
            <p>{{ getLocalDateString(app.updated_at) }}</p>

            <div>
              <v-btn
                v-if="company.website"
                :href="company.website"
                class="m-1"
                size="small"
                target="_blank"
                variant="text"
              >
                <v-icon size="small" start>link</v-icon>
                {{ $t("app_config.visit_website") }}
              </v-btn>
            </div>

            <div>
              <v-btn
                v-if="app.privacy"
                :href="app.privacy"
                class="m-1"
                size="small"
                target="_blank"
                variant="text"
                >{{ $t("app_config.privacy") }}
              </v-btn>
            </div>
          </v-col>

          <!--------------------------------------------------->

          <v-col cols="6" md="4">
            <p class="font-weight-bold m-1">{{ $t("app_config.installs") }}</p>
            <p>{{ numeralFormat(app.installs, "0,0") }}</p>

            <p class="font-weight-bold m-1">
              {{ $t("app_config.permissions") }}
            </p>
            <div v-if="app.permissions">
              <v-chip
                v-for="permission in app.permissions"
                :key="permission"
                class="m-1"
                size="small"
                >{{ permission }}
              </v-chip>
            </div>
            <p v-else>{{ $t("app_config.basic_profile_permission") }}</p>
          </v-col>

          <!--------------------------------------------------->

          <v-col cols="6" md="4">
            <p class="font-weight-bold m-1">
              {{ $t("global.common.company") }}
            </p>

            <v-avatar class="my-1" size="48" tile>
              <v-img :src="getShopImagePath(company.logo)"></v-img>
            </v-avatar>
            <p class="font-weight-bold mb-1">
              {{ company.name }}
            </p>

            <p class="m-1">{{ company.email }}</p>
            <p class="m-1">{{ company.address }}</p>
          </v-col>
        </v-row>

        <v-divider></v-divider>

        <b-app-comments :app-code="app.code"></b-app-comments>
      </v-container>
    </v-card-text>
  </v-card>

  <v-dialog v-model="rate_mode" max-width="640">
    <div class="p-3">
      <v-avatar class="mb-n8 s--shadow-no-padding" color="#fff" size="84">
        <img :src="getShopImagePath(app.icon)" class="p-2" />
      </v-avatar>

      <div
        class="bg-white mb-3 mx-3 pt-8 px-3 pb-3 s--shadow-no-padding rounded-2rem"
      >
        <v-rating
          v-model="user_rate"
          active-color="yellow-darken-3"
          class="my-3 zoomIn"
          color="grey-darken-1"
          hover
        ></v-rating>

        <v-textarea
          v-model="user_message"
          :counter="640"
          class="zoomIn delay_100"
          flat
          placeholder="Comment..."
          variant="solo"
        >
        </v-textarea>

        <div class="widget-buttons">
          <v-btn size="x-large" variant="text" @click="rate_mode = false"
            >{{ $t("global.actions.cancel") }}
          </v-btn>
          <v-btn
            :loading="busy_review"
            color="success"
            size="x-large"
            variant="flat"
            @click="saveAppRate()"
            >{{ $t("global.actions.accept") }}
          </v-btn>
        </div>
      </div>
    </div>
  </v-dialog>
</template>

<script lang="ts">
import BAppComments from "../comments/BAppComments.vue";
import { SmartConvertTextToHtml } from "@selldone/core-js/helper/html/HtmlHelper";
import BAppDetailGallery from "../../app/detail/gallery/BAppDetailGallery.vue";
import { Application } from "@selldone/core-js";

export default {
  name: "BAppDetail",
  components: { BAppDetailGallery, BAppComments },
  props: {
    shopId: {}, // Optional

    app: {
      required: true,
      type: Object,
    },
    shopApp: {
      required: false,
      type: Object,
    },
    dark: {
      default: false,
      type: Boolean,
    },
  },
  data: () => ({
    busy_save: false,
    busy_delete: false,

    enable: true,
    public: {},
    private: {},

    variables: {},

    show_note: false,

    //---------------
    rate_mode: false,
    busy_review: false,
    user_rate: 3,
    user_message: "",

    type: "production",
  }),

  computed: {
    company() {
      return this.app.company;
    },
    release() {
      return this.app[this.type];
    },

    variables_inputs() {
      return this.release ? this.release.variables : [];
    },
    available_types() {
      const out = [];
      if (this.app.production) out.push("production");
      if (this.app.beta) out.push("beta");
      if (this.app.alpha) out.push("alpha");

      return out;
    },

    note() {
      return SmartConvertTextToHtml(this.app.note, true, true);
    },
  },
  watch: {
    shopApp() {
      this.assignFromProps();
    },
  },
  created() {
    this.assignFromProps();

    this.user_rate = this.app.my_review ? this.app.my_review.rate : 3;
    this.user_message = this.app.my_review ? this.app.my_review.message : "";
  },
  mounted() {},
  methods: {
    saveAppRate() {
      this.busy_review = true;
      axios
        .put(window.API.PUT_SET_REVIEW(this.shopId, this.app.code), {
          rate: this.user_rate,
          message: this.user_message,
        })
        .then(({ data }) => {
          if (!data.error) {
            this.showSuccessAlert(null, `App's review has been saved.`);
            this.app.my_review = data.app_review;
            this.rate_mode = false;
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_review = false;
        });
    },

    getCategory(cat) {
      return Application.ApplicationCategories[cat];
    },
    assignFromProps() {
      if (this.shopApp) {
        this.public = this.shopApp.public ? this.shopApp.public : {};
        this.private = this.shopApp.private ? this.shopApp.private : {};
        this.enable = this.shopApp.enable;

        this.variables = this.shopApp.variables ? this.shopApp.variables : {};

        if (Array.isArray(this.public)) this.public = {};
        if (Array.isArray(this.private)) this.private = {};
        if (Array.isArray(this.variables)) this.variables = {};
      } else {
        this.public = {};
        this.private = {};
        this.enable = true;
      }
    },

    setPlugin() {
      this.busy_save = true;

      let t = this;

      axios
        .post(window.API.POST_SET_APP_INFO(this.shopId, this.app.code), {
          private: this.private,
          public: this.public,
          enable: this.enable,

          variables: this.variables,
        })
        .then(({ data }) => {
          if (!data.error) {
            t.showSuccessAlert(null, `App's config has been saved.`);
            if (!data.shop_app.public) data.shop_app.public = {};
            if (!data.shop_app.private) data.shop_app.private = {};
            if (!data.shop_app.variables) data.shop_app.variables = {};

            this.$emit("update:shopApp", data.shop_app);

            //this.close();
          } else {
            t.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          t.showLaravelError(error);
        })
        .finally(() => {
          t.busy_save = false;
        });
    },

    deleteApp() {
      this.openDangerAlert(
        this.$t("app_config.delete_dialog.title"),
        this.$t("app_config.delete_dialog.message"),
        this.$t("app_config.delete_dialog.action"),
        () => {
          this.busy_delete = true;
          axios
            .delete(window.API.DELETE_APP(this.shopId, this.app.code))
            .then(({ data }) => {
              if (!data.error) {
                this.showSuccessAlert(
                  null,
                  this.$t("app_config.notifications.uninstall_success"),
                );
                this.$emit("delete", data.id);
                this.$emit("update:shopApp", null);

                //t.close();
              } else {
                this.showErrorAlert(null, data.error_msg);
              }
            })
            .catch((error) => {
              this.showLaravelError(error);
            })
            .finally(() => {
              this.busy_delete = false;
            });
        },
      );
    },

    close() {
      this.$emit("close");
    },
  },
};
</script>

<style scoped></style>
