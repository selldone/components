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
    v-if="app"
    class="b-app-detail text-start"
    :dir="$vuetify.locale.isRtl ? 'rtl' : 'ltr'"
    :class="{ 'b-app-detail--dark': $vuetify.theme.current.dark }"
    :dark="dark"
    v-bind="$attrs"
  >
    <v-card-title class="b-app-detail__header">
      <v-btn
        class="b-app-detail__text-button b-app-detail__back"
        variant="text"
        :ripple="false"
        @click="close"
      >
        <ArrowLeft :size="15" aria-hidden="true" />{{
          $t("app_detail_modern.app_store")
        }}
      </v-btn>
      <v-btn
        class="b-app-detail__icon-button"
        variant="text"
        icon
        :ripple="false"
        :aria-label="$t('app_detail_modern.close_details')"
        @click="close"
      >
        <X :size="17" aria-hidden="true" />
        <v-tooltip
          activator="parent"
          location="top"
          content-class="sd-modern-tooltip b-app-detail__tooltip"
          >{{ $t("app_detail_modern.close_details") }}</v-tooltip
        >
      </v-btn>
    </v-card-title>

    <v-card-text ref="content" class="b-app-detail__content thin-scroll">
      <div class="b-app-detail__identity">
        <v-avatar class="b-app-detail__icon" size="52">
          <v-img
            v-if="app.icon || app.logo"
            :src="getShopImagePath(app.icon || app.logo)"
            alt=""
          />
        </v-avatar>
        <div class="b-app-detail__identity-copy">
          <h1>{{ app.name }}</h1>
          <p class="b-app-detail__meta">
            <template v-if="getCategory(app.category)"
              >{{ $t(getCategory(app.category).name)
              }}<span aria-hidden="true">·</span></template
            ><bdi>{{ app.code }}</bdi>
          </p>
          <button
            type="button"
            class="b-app-detail__rating"
            @click="scrollToReviews"
          >
            <Star :size="13" aria-hidden="true" /><span>{{
              numeralFormat(app.rate, "0.[0]")
            }}</span>
            <span class="b-app-detail__muted">{{
              $t("app_detail_modern.review_count", {
                count: numeralFormat(app.rate_count, "0,0"),
              })
            }}</span>
          </button>
        </div>
      </div>

      <div class="b-app-detail__top-body">
        <b-app-detail-gallery :key="app.code" :app="app" :dark="dark" />
        <!------------------------- Install / open app ------------------------->
        <div class="b-app-detail__install">
          <div class="b-app-detail__install-copy">
            <p>
              {{
                $t(
                  shopApp
                    ? "app_detail_modern.installed"
                    : "app_detail_modern.add_to_store",
                )
              }}
            </p>
            <p>
              {{
                $t(
                  shopApp
                    ? "app_detail_modern.enabled_hint"
                    : "app_detail_modern.install_hint",
                )
              }}
            </p>
          </div>
          <div class="b-app-detail__actions">
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
              class="b-app-detail__button b-app-detail__button--primary"
              variant="flat"
              :ripple="false"
            >
              <AppWindow :size="16" aria-hidden="true" />{{
                $t("global.actions.open_app")
              }}
            </v-btn>
            <v-dialog
              v-if="shopApp"
              v-model="delete_mode"
              max-width="430"
              content-class="b-app-detail-modal"
              :aria-label="
                $t('app_detail_modern.uninstall_title', { name: app.name })
              "
            >
              <template #activator="{ props: activatorProps }">
                <v-btn
                  v-bind="activatorProps"
                  :disabled="!canEdit || busy_save"
                  :loading="busy_delete"
                  class="b-app-detail__text-button"
                  variant="text"
                  :ripple="false"
                  @click="deleteApp"
                >
                  {{ $t("app_config.uninstall") }}
                </v-btn>
              </template>
              <v-card
                class="b-app-detail b-app-detail__uninstall-dialog text-start"
                :class="{ 'b-app-detail--dark': $vuetify.theme.current.dark }"
              >
                <h2>
                  {{
                    $t("app_detail_modern.uninstall_title", { name: app.name })
                  }}
                </h2>
                <p>{{ $t("app_detail_modern.uninstall_hint") }}</p>
                <div class="b-app-detail__modal-actions">
                  <v-btn
                    class="b-app-detail__button"
                    variant="flat"
                    :ripple="false"
                    @click="delete_mode = false"
                    >{{ $t("global.actions.cancel") }}</v-btn
                  >
                  <v-btn
                    :disabled="!canEdit || busy_save"
                    class="b-app-detail__button b-app-detail__button--danger"
                    variant="flat"
                    :ripple="false"
                    @click="confirm_delete && confirm_delete()"
                  >
                    <Trash2 :size="16" aria-hidden="true" />{{
                      $t("app_detail_modern.uninstall_app")
                    }}
                  </v-btn>
                </div>
              </v-card>
            </v-dialog>
            <v-btn
              v-else
              ref="installButton"
              :disabled="!canEdit"
              :loading="busy_save"
              class="b-app-detail__button b-app-detail__button--primary"
              variant="flat"
              :ripple="false"
              @click="setPlugin"
            >
              <Download :size="16" aria-hidden="true" />{{
                $t("app_config.get_app")
              }}
            </v-btn>
          </div>
        </div>
      </div>
      <p v-if="!shopId" class="b-app-detail__help b-app-detail__scope-note">
        {{ $t("app_detail_modern.select_store") }}
      </p>

      <section
        v-if="app.description || app.note"
        class="b-app-detail__description"
      >
        <h2>{{ $t("app_detail_modern.about") }}</h2>
        <p v-if="app.description">{{ app.description }}</p>
        <details
          v-if="app.note"
          :open="show_note"
          @toggle="show_note = $event.target.open"
        >
          <summary>{{ $t("app_detail_modern.more_about") }}</summary>
          <div class="b-app-detail__note markdown" v-html="note" />
        </details>
      </section>

      <div class="b-app-detail__lower-grid">
        <div class="b-app-detail__main">
          <!------------------------- App configuration ------------------------->
          <section v-if="shopApp" class="b-app-detail__configuration">
            <div class="b-app-detail__section-heading">
              <h2>{{ $t("app_detail_modern.configuration") }}</h2>
              <span
                v-if="!canEdit"
                class="b-app-detail__small b-app-detail__muted"
                >{{ $t("app_detail_modern.read_only") }}</span
              >
            </div>
            <p class="b-app-detail__help">
              {{ $t("app_detail_modern.configuration_hint") }}
            </p>
            <div class="b-app-detail__form">
              <!------------------------- Public Keys ------------------------->
              <v-text-field
                v-for="item in app.public || []"
                :key="'public-' + item.name"
                v-model="public[item.name]"
                :disabled="!canEdit"
                :label="item.title"
                variant="underlined"
                density="compact"
                hide-details="auto"
                class="b-app-detail__field"
                persistent-placeholder
              />
              <!------------------------- Private Keys: preserve app edit access ------------------------->
              <template v-if="app.edit_access">
                <v-text-field
                  v-for="item in app.private || []"
                  :key="'private-' + item.name"
                  v-model="private[item.name]"
                  :disabled="!canEdit"
                  :label="item.title"
                  type="password"
                  variant="underlined"
                  density="compact"
                  hide-details="auto"
                  autocomplete="off"
                  class="b-app-detail__field"
                  persistent-placeholder
                />
              </template>
              <p v-else class="b-app-detail__small b-app-detail__muted">
                {{ $t("app_detail_modern.private_access") }}
              </p>

              <label class="b-app-detail__status-choice">
                <span
                  ><span class="b-app-detail__field-title">{{
                    $t("app_detail_modern.app_status")
                  }}</span
                  ><span class="b-app-detail__small b-app-detail__muted">{{
                    $t("app_detail_modern.status_hint")
                  }}</span></span
                >
                <input
                  v-model="enable"
                  type="checkbox"
                  :disabled="!canEdit"
                  :aria-label="
                    $t('app_detail_modern.enable_app', { name: app.name })
                  "
                />
              </label>

              <!------------------------- Production variables (header scripts) ------------------------->
              <details
                v-if="variables_inputs.length"
                class="b-app-detail__variables"
              >
                <summary>
                  {{ $t("app_detail_modern.production_variables") }}
                </summary>
                <v-text-field
                  v-for="variable in variables_inputs"
                  :key="variable.key"
                  v-model="variables[variable.key]"
                  :disabled="!canEdit"
                  :label="variable.title"
                  variant="underlined"
                  density="compact"
                  hide-details="auto"
                  class="b-app-detail__field"
                  persistent-placeholder
                />
              </details>

              <!------------------------- Save config ------------------------->
              <v-btn
                :disabled="!canEdit || busy_delete"
                :loading="busy_save"
                class="b-app-detail__button b-app-detail__button--primary b-app-detail__save"
                variant="flat"
                :ripple="false"
                @click="setPlugin"
              >
                <Save :size="16" aria-hidden="true" />{{
                  $t("app_detail_modern.save_changes")
                }}
              </v-btn>
            </div>
          </section>

          <!------------------------- Actual app permissions ------------------------->
          <section class="b-app-detail__permissions">
            <div class="b-app-detail__section-heading">
              <h2>{{ $t("app_config.permissions") }}</h2>
              <span class="b-app-detail__small b-app-detail__muted">{{
                $t("app_detail_modern.permissions_requested")
              }}</span>
            </div>
            <p class="b-app-detail__help">
              {{ $t("app_detail_modern.permissions_hint") }}
            </p>
            <ul v-if="app.permissions">
              <li
                v-for="permission in app.permissions"
                :key="
                  typeof permission === 'string'
                    ? permission
                    : permission.code || permission.title
                "
              >
                <ShieldCheck :size="17" aria-hidden="true" />
                <span v-if="typeof permission === 'string'">{{
                  permission
                }}</span>
                <span v-else class="b-app-detail__permission-copy">
                  <span>{{ permission.title || permission.code }}</span>
                  <span
                    v-if="permission.description"
                    class="b-app-detail__small b-app-detail__muted"
                    >{{ permission.description }}</span
                  >
                </span>
              </li>
            </ul>
            <p
              v-else
              class="b-app-detail__help b-app-detail__permission-fallback"
            >
              {{ $t("app_config.basic_profile_permission") }}
            </p>
          </section>

          <!------------------------- Actual reviews and rating ------------------------->
          <section ref="reviews" class="b-app-detail__reviews">
            <div class="b-app-detail__section-heading">
              <h2>{{ $t("app_detail_modern.ratings_reviews") }}</h2>
              <v-dialog
                v-model="rate_mode"
                max-width="430"
                content-class="b-app-detail-modal"
                :aria-label="$t('app_detail_modern.your_review')"
              >
                <template #activator="{ props: activatorProps }">
                  <v-btn
                    v-bind="activatorProps"
                    :disabled="!canReview"
                    class="b-app-detail__text-button b-app-detail__review-button"
                    variant="text"
                    :ripple="false"
                  >
                    {{
                      $t(
                        app.my_review
                          ? "app_detail_modern.edit_review"
                          : "app_detail_modern.write_review",
                      )
                    }}
                  </v-btn>
                </template>
                <v-card
                  class="b-app-detail b-app-detail__review-dialog text-start"
                  :class="{ 'b-app-detail--dark': $vuetify.theme.current.dark }"
                >
                  <form
                    class="b-app-detail__review-form"
                    @submit.prevent="saveAppRate"
                  >
                    <div class="b-app-detail__section-heading">
                      <h2>{{ $t("app_detail_modern.your_review") }}</h2>
                      <v-btn
                        class="b-app-detail__icon-button"
                        variant="text"
                        icon
                        :ripple="false"
                        :aria-label="$t('app_detail_modern.close_review')"
                        @click="rate_mode = false"
                      >
                        <X :size="17" aria-hidden="true" />
                        <v-tooltip
                          activator="parent"
                          location="top"
                          content-class="sd-modern-tooltip b-app-detail__tooltip"
                          >{{ $t("app_detail_modern.close_review") }}</v-tooltip
                        >
                      </v-btn>
                    </div>
                    <label class="b-app-detail__native-field"
                      >{{ $t("app_detail_modern.rating") }}
                      <select v-model.number="user_rate">
                        <option v-if="Number(user_rate) % 1" :value="user_rate">
                          {{ user_rate }}
                        </option>
                        <option :value="5">
                          {{ $t("app_detail_modern.rating_5") }}
                        </option>
                        <option :value="4">
                          {{ $t("app_detail_modern.rating_4") }}
                        </option>
                        <option :value="3">
                          {{ $t("app_detail_modern.rating_3") }}
                        </option>
                        <option :value="2">
                          {{ $t("app_detail_modern.rating_2") }}
                        </option>
                        <option :value="1">
                          {{ $t("app_detail_modern.rating_1") }}
                        </option>
                      </select>
                    </label>
                    <label class="b-app-detail__native-field"
                      >{{ $t("app_detail_modern.experience") }}
                      <textarea
                        v-model="user_message"
                        rows="3"
                        maxlength="640"
                        :placeholder="
                          $t('app_detail_modern.experience_placeholder')
                        "
                      />
                    </label>
                    <p
                      class="b-app-detail__small b-app-detail__muted b-app-detail__character-count"
                    >
                      {{ (user_message || "").length }} / 640
                    </p>
                    <div class="b-app-detail__modal-actions">
                      <v-btn
                        class="b-app-detail__button"
                        variant="flat"
                        :ripple="false"
                        @click="rate_mode = false"
                        >{{ $t("global.actions.cancel") }}</v-btn
                      >
                      <v-btn
                        type="submit"
                        :disabled="!canReview"
                        :loading="busy_review"
                        class="b-app-detail__button b-app-detail__button--primary"
                        variant="flat"
                        :ripple="false"
                        >{{ $t("app_detail_modern.save_review") }}</v-btn
                      >
                    </div>
                  </form>
                </v-card>
              </v-dialog>
            </div>
            <b-app-comments :key="app.code" :app-code="app.code" />
          </section>
        </div>

        <!------------------------- Developer and application information ------------------------->
        <aside class="b-app-detail__developer">
          <h2>{{ $t("app_detail_modern.developer") }}</h2>
          <div
            v-if="company.name || company.logo"
            class="b-app-detail__developer-identity"
          >
            <div class="b-app-detail__developer-mark">
              <v-img
                v-if="company.logo"
                :src="getShopImagePath(company.logo)"
                alt=""
                height="34"
                width="34"
              />
              <Blocks v-else :size="18" aria-hidden="true" />
            </div>
            <p v-if="company.name" class="b-app-detail__field-title">
              {{ company.name }}
            </p>
          </div>
          <div class="b-app-detail__links">
            <a
              v-if="company.website"
              :href="company.website"
              target="_blank"
              rel="noopener noreferrer"
              >{{ $t("app_detail_modern.website")
              }}<ArrowUpRight :size="13" aria-hidden="true"
            /></a>
            <a
              v-if="app.web && app.web !== company.website"
              :href="app.web"
              target="_blank"
              rel="noopener noreferrer"
              >{{ $t("app_detail_modern.app_website")
              }}<ArrowUpRight :size="13" aria-hidden="true"
            /></a>
            <a
              v-if="app.privacy"
              :href="app.privacy"
              target="_blank"
              rel="noopener noreferrer"
              >{{ $t("app_detail_modern.privacy")
              }}<ArrowUpRight :size="13" aria-hidden="true"
            /></a>
            <a v-if="company.email" :href="'mailto:' + company.email"
              >{{ $t("app_detail_modern.contact_developer")
              }}<Mail :size="13" aria-hidden="true"
            /></a>
            <a
              v-if="app.github"
              :href="'https://github.com/' + app.github"
              target="_blank"
              rel="noopener noreferrer"
              >GitHub<ArrowUpRight :size="13" aria-hidden="true"
            /></a>
            <a
              v-if="app.video"
              :href="app.video"
              target="_blank"
              rel="noopener noreferrer"
              >{{ $t("app_detail_modern.video")
              }}<ArrowUpRight :size="13" aria-hidden="true"
            /></a>
          </div>
          <dl>
            <div v-if="getCategory(app.category)">
              <dt>{{ $t("app_config.category") }}</dt>
              <dd>{{ $t(getCategory(app.category).name) }}</dd>
            </div>
            <div v-if="app.updated_at">
              <dt>{{ $t("app_detail_modern.updated") }}</dt>
              <dd>{{ getLocalDateString(app.updated_at) }}</dd>
            </div>
            <div v-if="app.installs != null">
              <dt>{{ $t("app_config.installs") }}</dt>
              <dd>{{ numeralFormat(app.installs, "0,0") }}</dd>
            </div>
            <div v-if="company.address">
              <dt>{{ $t("app_detail_modern.address") }}</dt>
              <dd>{{ company.address }}</dd>
            </div>
          </dl>
        </aside>
      </div>
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
import BAppComments from "../comments/BAppComments.vue";
import { SmartConvertTextToHtml } from "@selldone/core-js/helper/html/HtmlHelper";
import BAppDetailGallery from "./gallery/BAppDetailGallery.vue";
import { Application } from "@selldone/core-js";
import DateMixin from "@selldone/components-vue/mixin/date/DateMixin.ts";
import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";
import {
  AppWindow,
  ArrowLeft,
  ArrowUpRight,
  Blocks,
  Download,
  Mail,
  Save,
  ShieldCheck,
  Star,
  Trash2,
  X,
} from "@lucide/vue";

export default {
  name: "BAppDetail",
  mixins: [DateMixin],
  components: {
    BAppDetailGallery,
    BAppComments,
    AppWindow,
    ArrowLeft,
    ArrowUpRight,
    Blocks,
    Download,
    Mail,
    Save,
    ShieldCheck,
    Star,
    Trash2,
    X,
  },
  emits: ["close", "update:shopApp", "delete"],
  props: {
    shopId: {}, // Optional: public app details have no selected shop.
    app: { required: true, type: Object },
    shopApp: { required: false, type: Object },
    dark: { default: false, type: Boolean },
  },
  data: () => ({
    busy_save: false,
    busy_delete: false,
    busy_review: false,
    delete_mode: false,
    confirm_delete: null,
    enable: true,
    public: {},
    private: {},
    variables: {},
    show_note: false,
    rate_mode: false,
    user_rate: 3,
    user_message: "",
    type: "production",
    context_version: 0,
    edit_version: 0,
  }),
  computed: {
    company() {
      return this.app?.company || {};
    },
    release() {
      return this.app?.[this.type];
    },
    variables_inputs() {
      return this.release?.variables || [];
    },
    note() {
      return SmartConvertTextToHtml(this.app?.note || "", true, true);
    },
    canEdit() {
      return Boolean(this.shopId && this.app?.code && this.app.edit_access);
    },
    // Reviews use their existing shop read permission, independently of app edit access.
    canReview() {
      return Boolean(this.shopId && this.app?.code);
    },
  },
  watch: {
    delete_mode(open) {
      if (!open) this.confirm_delete = null;
    },
    shopApp() {
      this.assignFromProps();
    },
    "app.code"() {
      this.resetContext();
    },
    shopId() {
      this.resetContext();
    },
    "app.edit_access"() {
      this.edit_version++;
      this.delete_mode = false;
      this.confirm_delete = null;
      this.busy_save = false;
      this.busy_delete = false;
      this.private =
        this.app?.edit_access &&
        this.shopApp?.private &&
        !Array.isArray(this.shopApp.private)
          ? { ...this.shopApp.private }
          : {};
    },
  },
  created() {
    this.assignFromProps();
    this.assignReview();
  },
  beforeUnmount() {
    this.context_version++;
  },
  methods: {
    scrollToReviews() {
      const content = this.$refs.content?.$el;
      const reviews = this.$refs.reviews;
      if (content && reviews)
        if (content.scrollHeight > content.clientHeight) {
          content.scrollTop +=
            reviews.getBoundingClientRect().top -
            content.getBoundingClientRect().top;
        } else {
          reviews.scrollIntoView({ block: "nearest" });
        }
    },
    assignReview() {
      this.user_rate = this.app?.my_review ? this.app.my_review.rate : 3;
      this.user_message = this.app?.my_review ? this.app.my_review.message : "";
    },
    resetContext() {
      // A response or danger-confirmation from another app/shop must not affect this one.
      this.context_version++;
      this.busy_save = this.busy_delete = this.busy_review = false;
      this.show_note = this.rate_mode = false;
      this.delete_mode = false;
      this.confirm_delete = null;
      this.assignFromProps();
      this.assignReview();
    },
    getCategory(cat) {
      return Application.ApplicationCategories[cat];
    },
    assignFromProps() {
      // Local drafts must not mutate the parent's saved maps before a successful save.
      this.public =
        this.shopApp?.public && !Array.isArray(this.shopApp.public)
          ? { ...this.shopApp.public }
          : {};
      this.private =
        this.app?.edit_access &&
        this.shopApp?.private &&
        !Array.isArray(this.shopApp.private)
          ? { ...this.shopApp.private }
          : {};
      this.variables =
        this.shopApp?.variables && !Array.isArray(this.shopApp.variables)
          ? { ...this.shopApp.variables }
          : {};
      this.enable = this.shopApp ? this.shopApp.enable : true;
    },
    saveAppRate() {
      if (!this.canReview || this.busy_review) return;
      const version = this.context_version;
      this.busy_review = true;
      return axios
        .put(window.API.PUT_SET_REVIEW(this.shopId, this.app.code), {
          rate: this.user_rate,
          message: this.user_message,
        })
        .then(({ data }) => {
          if (version !== this.context_version) return;
          if (!data.error) {
            NotificationService.showSuccessAlert(
              null,
              this.$t("app_detail_modern.review_saved"),
            );
            this.app.my_review = data.app_review;
            this.rate_mode = false;
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          if (version === this.context_version)
            NotificationService.showLaravelError(error);
        })
        .finally(() => {
          if (version === this.context_version) this.busy_review = false;
        });
    },
    setPlugin() {
      // Keep the existing app edit-access gate; Laravel rechecks the current shop write permission.
      if (!this.canEdit || this.busy_save || this.busy_delete) return;
      const version = this.context_version;
      const editVersion = this.edit_version;
      this.busy_save = true;
      return axios
        .post(window.API.POST_SET_APP_INFO(this.shopId, this.app.code), {
          private: this.private,
          public: this.public,
          enable: this.enable,
          variables: this.variables,
        })
        .then(({ data }) => {
          if (
            version !== this.context_version ||
            editVersion !== this.edit_version ||
            !this.canEdit
          )
            return;
          if (!data.error) {
            NotificationService.showSuccessAlert(
              null,
              this.$t("app_detail_modern.config_saved"),
            );
            if (!data.shop_app.public) data.shop_app.public = {};
            if (!data.shop_app.private) data.shop_app.private = {};
            if (!data.shop_app.variables) data.shop_app.variables = {};
            this.$emit("update:shopApp", data.shop_app);
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          if (
            version === this.context_version &&
            editVersion === this.edit_version
          )
            NotificationService.showLaravelError(error);
        })
        .finally(() => {
          if (
            version === this.context_version &&
            editVersion === this.edit_version
          )
            this.busy_save = false;
        });
    },
    deleteApp() {
      if (!this.canEdit || !this.shopApp || this.busy_save || this.busy_delete)
        return;
      const version = this.context_version;
      const editVersion = this.edit_version;
      const shopId = this.shopId;
      const appCode = this.app.code;
      this.confirm_delete = () => {
        if (
          !this.delete_mode ||
          version !== this.context_version ||
          editVersion !== this.edit_version ||
          !this.canEdit ||
          !this.shopApp ||
          this.busy_save ||
          this.busy_delete
        )
          return;
        this.delete_mode = false;
        this.busy_delete = true;
        return axios
          .delete(window.API.DELETE_APP(shopId, appCode))
          .then(({ data }) => {
            if (
              version !== this.context_version ||
              editVersion !== this.edit_version ||
              !this.canEdit
            )
              return;
            if (!data.error) {
              NotificationService.showSuccessAlert(
                null,
                this.$t("app_config.notifications.uninstall_success"),
              );
              this.$emit("delete", data.id);
              this.$emit("update:shopApp", null);
              this.$nextTick(() => {
                if (version === this.context_version)
                  this.$refs.installButton?.$el?.focus();
              });
            } else {
              NotificationService.showErrorAlert(null, data.error_msg);
            }
          })
          .catch((error) => {
            if (
              version === this.context_version &&
              editVersion === this.edit_version
            )
              NotificationService.showLaravelError(error);
          })
          .finally(() => {
            if (
              version === this.context_version &&
              editVersion === this.edit_version
            )
              this.busy_delete = false;
          });
      };
      this.delete_mode = true;
    },
    close() {
      this.$emit("close");
    },
  },
};
</script>

<style scoped>
.b-app-detail {
  --ad-canvas: #f4f5f7;
  --ad-surface: #fff;
  --ad-inset: #f3f4f6;
  --ad-ink: #22262d;
  --ad-muted: #68717e;
  --ad-border: #e3e6eb;
  --ad-blue: #2563d9;
  --ad-on-blue: #fff;
  --ad-danger: #a83b42;
  --ad-on-danger: #fff;
  background: var(--ad-surface);
  color: var(--ad-ink);
  border: 1px solid var(--ad-border);
  border-radius: 18px;
  font-family: inherit;
  font-size: 14px;
  line-height: 21px;
  font-weight: 400;
}
.b-app-detail--dark {
  --ad-canvas: #181b20;
  --ad-surface: #23272e;
  --ad-inset: #2d323a;
  --ad-ink: #edf0f5;
  --ad-muted: #abb4c2;
  --ad-border: #3b424d;
  --ad-blue: #aacaff;
  --ad-on-blue: #152b4c;
  --ad-danger: #ffb5b9;
  --ad-on-danger: #451419;
  color-scheme: dark;
}
.b-app-detail h1,
.b-app-detail h2,
.b-app-detail p {
  margin: 0;
}
.b-app-detail h1 {
  font-size: 24px;
  line-height: 30px;
  font-weight: 500;
  letter-spacing: -0.4px;
  overflow-wrap: anywhere;
}
.b-app-detail h2 {
  font-size: 14px;
  line-height: 20px;
  font-weight: 500;
}
.b-app-detail svg {
  flex-shrink: 0;
}
.b-app-detail__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 22px;
  border-block-end: 1px solid var(--ad-border);
  gap: 12px;
}
.b-app-detail .b-app-detail__content {
  padding: 22px;
  font-size: 14px;
  line-height: 21px;
  font-weight: 400;
  letter-spacing: normal;
}
.b-app-detail .b-app-detail__button,
.b-app-detail .b-app-detail__text-button,
.b-app-detail .b-app-detail__icon-button {
  height: auto;
  min-width: 0;
  box-shadow: none;
  letter-spacing: normal;
  text-indent: 0;
  text-transform: none;
  font-family: inherit;
}
.b-app-detail .b-app-detail__button {
  min-block-size: 42px;
  padding: 10px 14px;
  border: 1px solid var(--ad-border);
  border-radius: 9px;
  background: var(--ad-surface);
  color: var(--ad-ink);
  font-size: 13px;
  font-weight: 500;
  line-height: 20px;
}
.b-app-detail .b-app-detail__button--primary {
  color: var(--ad-on-blue);
  background: var(--ad-blue);
  border-color: var(--ad-blue);
}
.b-app-detail .b-app-detail__button--danger {
  color: var(--ad-on-danger);
  background: var(--ad-danger);
  border-color: var(--ad-danger);
}
.b-app-detail .b-app-detail__text-button {
  min-block-size: 34px;
  padding: 5px 8px;
  border: 0;
  border-radius: 7px;
  background: transparent;
  color: var(--ad-blue);
  font-size: 13px;
  line-height: 20px;
  font-weight: 400;
}
.b-app-detail .b-app-detail__icon-button {
  inline-size: 34px;
  block-size: 34px;
  min-block-size: 34px;
  padding: 0;
  border: 0;
  border-radius: 9px;
  background: transparent;
  color: var(--ad-ink);
}
.b-app-detail__button :deep(.v-btn__content) {
  gap: 7px;
}
.b-app-detail__button :deep(.v-btn__content),
.b-app-detail__text-button :deep(.v-btn__content),
.b-app-detail__icon-button :deep(.v-btn__content) {
  font: inherit;
  letter-spacing: inherit;
  text-indent: inherit;
}
.b-app-detail__text-button :deep(.v-btn__content) {
  gap: 6px;
}
.b-app-detail :deep(.v-btn__overlay),
.b-app-detail :deep(.v-btn__underlay) {
  display: none;
}
.b-app-detail .b-app-detail__text-button:hover,
.b-app-detail .b-app-detail__icon-button:hover {
  background: var(--ad-inset);
}
.b-app-detail .v-btn--disabled {
  opacity: 0.5;
}
.b-app-detail button:focus-visible,
.b-app-detail a:focus-visible,
.b-app-detail summary:focus-visible,
.b-app-detail select:focus-visible,
.b-app-detail textarea:focus-visible,
.b-app-detail input:focus-visible {
  outline: 2px solid var(--ad-blue);
  outline-offset: 3px;
}
.b-app-detail__identity {
  display: flex;
  gap: 14px;
  align-items: flex-start;
  margin-block-end: 24px;
}
.b-app-detail__icon {
  flex: 0 0 52px;
  border-radius: 13px;
  background: var(--ad-inset);
  color: var(--ad-blue);
}
.b-app-detail__icon :deep(.v-img) {
  flex: 0 0 29px;
  inline-size: 29px;
  block-size: 29px;
}
.b-app-detail__identity-copy {
  min-inline-size: 0;
}
.b-app-detail .b-app-detail__meta {
  color: var(--ad-muted);
  font-size: 12px;
  line-height: 18px;
  margin-block-start: 4px;
  overflow-wrap: anywhere;
}
.b-app-detail__meta > span {
  padding-inline: 4px;
}
.b-app-detail__rating {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 0 0;
  border: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  font-size: 12px;
  line-height: 18px;
  cursor: pointer;
}
.b-app-detail__rating .b-app-detail__muted {
  margin-inline-start: 2px;
}
.b-app-detail__muted {
  color: var(--ad-muted);
}
.b-app-detail__small {
  font-size: 12px;
  line-height: 18px;
}
.b-app-detail__top-body {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.b-app-detail__install {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  min-inline-size: 0;
}
.b-app-detail__install-copy {
  flex: 1;
  min-inline-size: 0;
}
.b-app-detail__install-copy > p:first-child {
  font-size: 13px;
  line-height: 20px;
  font-weight: 500;
}
.b-app-detail__install-copy > p + p {
  margin-block-start: 3px;
  color: var(--ad-muted);
  font-size: 12px;
  line-height: 18px;
}
.b-app-detail__actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.b-app-detail__help {
  color: var(--ad-muted);
  font-size: 12px;
  line-height: 19px;
}
.b-app-detail .b-app-detail__scope-note {
  margin-block-start: 10px;
}
.b-app-detail__description {
  margin-block: 24px;
}
.b-app-detail__description > p {
  margin-block-start: 8px;
  font-size: 13px;
  line-height: 21px;
  overflow-wrap: anywhere;
}
.b-app-detail details {
  margin-block-start: 10px;
}
.b-app-detail summary {
  font-size: 12px;
  line-height: 20px;
  color: var(--ad-blue);
  padding-block: 4px;
  cursor: pointer;
}
.b-app-detail__note {
  margin-block-start: 8px;
  color: var(--ad-muted);
  font-size: 13px;
  line-height: 21px;
  overflow-wrap: anywhere;
}
.b-app-detail__note :deep(img) {
  max-inline-size: 100%;
}
.b-app-detail__lower-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 192px;
  gap: 28px;
  padding-block-start: 24px;
  border-block-start: 1px solid var(--ad-border);
}
.b-app-detail__main {
  display: grid;
  gap: 26px;
  align-content: start;
  min-inline-size: 0;
}
.b-app-detail__section-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
  margin-block-end: 10px;
}
.b-app-detail__form {
  display: grid;
  gap: 18px;
  margin-block-start: 18px;
}
.b-app-detail__field :deep(.v-field) {
  padding: 25px 0 0;
  color: var(--ad-ink);
  --v-field-padding-start: 0px;
  --v-field-padding-end: 0px;
  --v-field-padding-bottom: 0px;
  --v-field-padding-top: 0px;
}
.b-app-detail__field :deep(.v-field__field) {
  display: grid;
  gap: 7px;
}
.b-app-detail__field :deep(.v-label.v-field-label) {
  display: none;
}
.b-app-detail__field :deep(.v-label.v-field-label--floating) {
  display: block;
  position: absolute;
  inset-block-start: 0;
  inset-inline-start: 0;
  transform: none;
  opacity: 1;
  padding: 0;
  margin: 0;
  font-size: 12px;
  line-height: 18px;
  color: var(--ad-ink);
  font-weight: 400;
  max-width: 100%;
}
.b-app-detail__field :deep(.v-field__input) {
  min-height: 38px;
  padding: 8px 0;
  font-family: inherit;
  font-size: 14px;
  line-height: 21px;
  font-weight: 400;
}
.b-app-detail__field :deep(.v-field__outline::before) {
  border-color: var(--ad-border);
  opacity: 1;
}
.b-app-detail__field :deep(.v-field__outline::after) {
  border-color: var(--ad-blue);
}
.b-app-detail__field :deep(.v-field__overlay) {
  display: none;
}
.b-app-detail__field :deep(.v-input__details) {
  padding: 0;
}
.b-app-detail__field-title {
  display: block;
  font-size: 13px;
  line-height: 20px;
  font-weight: 500;
}
.b-app-detail__status-choice {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  cursor: pointer;
}
.b-app-detail__status-choice > span {
  display: grid;
  gap: 2px;
}
.b-app-detail__status-choice > input {
  inline-size: 18px;
  block-size: 18px;
  accent-color: var(--ad-blue);
  flex-shrink: 0;
  cursor: pointer;
}
.b-app-detail__variables .b-app-detail__field {
  margin-block-start: 12px;
}
.b-app-detail__form > .b-app-detail__save {
  justify-self: start;
  margin-block-start: 4px;
}
.b-app-detail__permissions ul {
  display: grid;
  gap: 15px;
  list-style: none;
  margin: 17px 0 0;
  padding: 0;
}
.b-app-detail__permissions li {
  display: flex;
  gap: 11px;
  align-items: flex-start;
  font-size: 13px;
  line-height: 20px;
  font-weight: 500;
  overflow-wrap: anywhere;
}
.b-app-detail__permissions li > svg {
  margin-block-start: 1px;
  color: var(--ad-muted);
}
.b-app-detail__permission-copy {
  display: grid;
  gap: 2px;
}
.b-app-detail .b-app-detail__permission-fallback {
  margin-block-start: 17px;
}
.b-app-detail__developer {
  min-inline-size: 0;
}
.b-app-detail__developer-identity {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-block-start: 15px;
  overflow-wrap: anywhere;
}
.b-app-detail__developer-mark {
  display: grid;
  place-items: center;
  inline-size: 34px;
  block-size: 34px;
  flex: 0 0 34px;
  border-radius: 8px;
  background: var(--ad-inset);
  overflow: hidden;
}
.b-app-detail__links {
  display: grid;
  justify-items: start;
  gap: 7px;
  margin-block-start: 16px;
}
.b-app-detail__links a {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: var(--ad-blue);
  font-size: 12px;
  line-height: 20px;
  text-decoration: none;
  overflow-wrap: anywhere;
}
.b-app-detail__links a:hover {
  text-decoration: underline;
}
.b-app-detail__developer dl {
  display: grid;
  gap: 13px;
  margin: 20px 0 0;
  font-size: 12px;
  line-height: 18px;
}
.b-app-detail__developer dt {
  color: var(--ad-muted);
}
.b-app-detail__developer dd {
  margin: 3px 0 0;
  overflow-wrap: anywhere;
}
.b-app-detail__back:dir(rtl) svg {
  transform: scaleX(-1);
}
.b-app-detail__review-dialog {
  padding: 24px;
  border-radius: 15px;
}
.b-app-detail__uninstall-dialog {
  padding: 24px;
  border-radius: 15px;
}
.b-app-detail__uninstall-dialog h2 {
  font-size: 19px;
  line-height: 26px;
}
.b-app-detail__uninstall-dialog > p {
  margin-block-start: 12px;
  font-size: 13px;
  line-height: 21px;
}
.b-app-detail__uninstall-dialog .b-app-detail__modal-actions {
  margin-block-start: 22px;
}
.b-app-detail__review-dialog h2 {
  font-size: 19px;
  line-height: 26px;
}
.b-app-detail__review-form {
  display: grid;
  gap: 18px;
}
.b-app-detail__review-form .b-app-detail__section-heading {
  margin: 0;
}
.b-app-detail__native-field {
  display: grid;
  gap: 7px;
  font-size: 12px;
  line-height: 18px;
}
.b-app-detail__native-field select,
.b-app-detail__native-field textarea {
  min-inline-size: 0;
  inline-size: 100%;
  padding: 8px 0;
  border: 0;
  border-block-end: 1px solid var(--ad-border);
  border-radius: 0;
  background: transparent;
  color: var(--ad-ink);
  font-family: inherit;
  font-size: 14px;
  line-height: 21px;
}
.b-app-detail__native-field textarea {
  resize: vertical;
}
.b-app-detail__native-field textarea::placeholder {
  color: var(--ad-muted);
  opacity: 1;
}
.b-app-detail__native-field select option {
  background: var(--ad-surface);
  color: var(--ad-ink);
}
.b-app-detail__character-count {
  text-align: end;
}
.b-app-detail__modal-actions {
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 8px;
}
:global(.b-app-detail__tooltip) {
  background: rgb(var(--v-theme-surface));
  color: rgb(var(--v-theme-on-surface));
  border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  font-size: 12px;
  line-height: 19px;
}
:global(.v-dialog > .v-overlay__content.b-app-detail-modal) {
  width: calc(100% - 36px);
  max-height: calc(100% - 36px);
  margin: 18px;
}
:global(.v-dialog > .v-overlay__content.b-app-detail-modal > .b-app-detail) {
  border-radius: 15px;
}
@media (max-width: 600px) {
  .b-app-detail__lower-grid {
    grid-template-columns: minmax(0, 1fr);
    gap: 26px;
  }
  .b-app-detail__developer {
    border-block-start: 1px solid var(--ad-border);
    padding-block-start: 24px;
  }
  .b-app-detail__links {
    display: flex;
    flex-wrap: wrap;
    gap: 14px;
  }
  .b-app-detail__developer dl {
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }
}
@media (max-width: 420px) {
  .b-app-detail__header {
    padding: 12px 14px;
  }
  .b-app-detail .b-app-detail__content {
    padding: 20px 14px;
  }
  .b-app-detail h1 {
    font-size: 22px;
    line-height: 28px;
  }
  .b-app-detail .b-app-detail__icon {
    inline-size: 44px !important;
    block-size: 44px !important;
    flex-basis: 44px;
    border-radius: 11px;
  }
  .b-app-detail__icon :deep(.v-img) {
    flex-basis: 25px;
    inline-size: 25px;
    block-size: 25px;
  }
  .b-app-detail__identity {
    gap: 11px;
    margin-block-end: 20px;
  }
  .b-app-detail__install {
    flex-wrap: wrap;
    gap: 14px;
  }
  .b-app-detail__install-copy {
    flex-basis: 155px;
  }
  .b-app-detail .b-app-detail__icon-button {
    inline-size: 44px;
    block-size: 44px;
    min-block-size: 44px;
  }
  .b-app-detail .b-app-detail__button,
  .b-app-detail .b-app-detail__text-button {
    min-block-size: 44px;
  }
  .b-app-detail__field :deep(.v-field__input),
  .b-app-detail__native-field select,
  .b-app-detail__native-field textarea {
    font-size: 16px;
  }
  .b-app-detail__review-dialog {
    padding: 20px;
  }
  .b-app-detail__uninstall-dialog {
    padding: 20px;
  }
  .b-app-detail__modal-actions .b-app-detail__button {
    flex: 1;
  }
}
@media (pointer: coarse) {
  .b-app-detail .b-app-detail__icon-button {
    inline-size: 44px;
    block-size: 44px;
    min-block-size: 44px;
  }
  .b-app-detail .b-app-detail__button,
  .b-app-detail .b-app-detail__text-button,
  .b-app-detail__rating,
  .b-app-detail summary,
  .b-app-detail__links a,
  .b-app-detail__status-choice {
    min-block-size: 44px;
  }
  .b-app-detail__field :deep(.v-field__input),
  .b-app-detail__native-field select,
  .b-app-detail__native-field textarea {
    font-size: 16px;
  }
}
</style>
