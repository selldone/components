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
  <v-list-item
    v-bind="$attrs"
    :key="login.code"
    :class="{ disabled: !login.available, 'b-login-row--modern': modern }"
    class="b-login-row"
    :subtitle="modern ? undefined : oauth?.callback"
  >
    <template v-slot:prepend>
      <v-avatar rounded size="24">
        <img v-if="login.image" :src="login.image" :alt="login.title" />
        <v-icon v-else :color="modern ? undefined : '#333'">{{ login.icon }}</v-icon>
      </v-avatar>
    </template>
    <v-list-item-subtitle v-if="modern && oauth?.callback" class="b-login-row__callback" dir="ltr">
      {{ oauth.callback }}
      <v-tooltip activator="parent" location="top" content-class="sd-modern-tooltip text-start">{{ oauth.callback }}</v-tooltip>
    </v-list-item-subtitle>

    <template v-slot:title
      >{{ login.title }}
      <span v-if="modern" class="b-login-row__tags">
        <span v-if="login.premium">{{ $t('global.commons.premium') }}</span>
        <span v-if="login.paid">{{ $t('global.commons.paid') }}</span>
        <span v-if="enable">{{ $t('shop_configuration.flow_modern.login.custom_client_label') }}</span>
      </span>
      <v-chip
        v-if="login.premium && !modern"
        class="float-end"
        color="#000"
        label
        size="x-small"
        prepend-icon="military_tech"
        variant="elevated"
      >
        {{ $t("global.commons.premium") }}
      </v-chip>
      <v-chip
        v-if="login.paid && !modern"
        class="float-end"
        color="#673AB7"
        label
        size="x-small"
        prepend-icon="paid"
        variant="elevated"
      >
        {{ $t("global.commons.paid") }}
      </v-chip>

      <v-chip
        v-if="enable && !modern"
        class="float-end"
        color="#009688"
        label
        size="x-small"
        prepend-icon="token"
        variant="elevated"
      >
        Custom Token
      </v-chip>
    </template>
    <v-list-item-subtitle v-if="login.subtitle" :title="login.subtitle">
      {{ login.subtitle }}
    </v-list-item-subtitle>
    <v-list-item-subtitle v-if="error_msg" role="alert">
      <v-icon size="small">error_outline</v-icon>
      {{ error_msg }}
    </v-list-item-subtitle>

    <template v-slot:append>
      <v-btn
        v-if="login.customizable"
        :class="modern ? 'sd-modern-icon-button' : 'ms-2'"
        icon
        variant="text"
        @click="dialog = true"
        :disabled="!!error_msg || readOnly || busy_save"
        :loading="busy_fetch"
        :aria-label="$t('shop_configuration.flow_modern.login.configure_google')"
      >
        <v-icon>{{ modern ? 'tune' : 'settings' }}</v-icon>
        <v-tooltip v-if="modern" activator="parent" location="top" content-class="sd-modern-tooltip text-start">{{ $t('shop_configuration.flow_modern.login.configure_google_help') }}</v-tooltip>
      </v-btn>

      <v-btn
        :class="modern ? 'b-login-row__toggle' : 'ms-1'"
        :loading="busy_login === login.code"
        :disabled="readOnly || !login.available || !!busy_login"
        :aria-pressed="login.available && (!options_login || options_login.includes(login.code))"
        :aria-label="$t(login.available && (!options_login || options_login.includes(login.code)) ? 'shop_configuration.flow_modern.login.disable_method' : 'shop_configuration.flow_modern.login.enable_method', { method: login.title })"
        icon
        variant="text"
        @click="
          setOptionLoginMethods(
            login.code,
            !(!options_login || options_login.includes(login.code)),
          )
        "
      >
        <u-check
          :class="{ 'ms-1': !modern }"
          :model-value="
            login.available &&
            (!options_login || options_login.includes(login.code))
          "
          read-only
          :true-icon="modern ? 'check_circle' : 'check'"
          :false-icon="modern ? 'cancel' : 'close'"
          :false-color="modern ? 'var(--sd-modern-muted)' : 'red'"
          :size="modern ? 23 : undefined"
        ></u-check>
        <v-tooltip v-if="modern" activator="parent" location="top" content-class="sd-modern-tooltip text-start">{{ $t(login.available && (!options_login || options_login.includes(login.code)) ? 'shop_configuration.flow_modern.login.disable_method' : 'shop_configuration.flow_modern.login.enable_method', { method: login.title }) }}</v-tooltip>
      </v-btn>
    </template>
  </v-list-item>

  <!-- ███████████████████████ Dialog > OAuth client ███████████████████████ -->
  <v-dialog
    v-model="dialog"
    :fullscreen="!modern"
    :max-width="modern ? 700 : undefined"
    scrollable
    transition="dialog-bottom-transition"
  >
    <v-card class="text-start" :class="{ 'b-login-oauth--modern sd-modern-widget': modern }">
      <v-card-title :class="{ 'b-login-oauth__heading': modern }">
        <template v-if="modern">
          <div class="b-login-oauth__heading-copy">
            <div class="b-login-oauth__brand"><img v-if="login.image" :src="login.image" alt=""><h2>{{ $t('shop_configuration.flow_modern.login.google_dialog_title') }}</h2></div>
            <p>{{ $t('shop_configuration.flow_modern.login.oauth_intro') }}</p>
          </div>
          <v-btn class="sd-modern-icon-button" icon variant="text" :aria-label="$t('global.actions.close')" @click="dialog = false"><v-icon size="18">close</v-icon><v-tooltip activator="parent" location="top" content-class="sd-modern-tooltip text-start">{{ $t('shop_configuration.flow_modern.login.close_google') }}</v-tooltip></v-btn>
        </template>
        <template v-else>
        <v-avatar class="avatar-gradient -thin -shop me-2" size="32">
          <img :src="getShopImagePath(shop.icon, 96)" />
        </v-avatar>

        <v-icon class="rotate-90-e">cable</v-icon>

        <v-avatar rounded size="24" class="mx-2">
          <v-img v-if="login.image" :src="login.image" />
          <v-icon v-else color="#333">{{ login.icon }}</v-icon>
        </v-avatar>

        {{ login.title }}
        </template>
      </v-card-title>
      <v-card-text :class="{ 'b-login-oauth__content': modern }">
        <u-loading-progress v-if="busy_fetch"></u-loading-progress>
        <div :class="{ 'widget-box mb-5': !modern }">
          <u-widget-header v-if="!modern" title="Conditional" icon="token"></u-widget-header>
          <v-list-subheader v-if="!modern">
            Please provide your custom OAuth2 client token from the provider. By
            configuring this option, your business logo will appear on your
            store's login page. Note that this requires some technical
            experience and the creation of a developer account with the
            provider.
          </v-list-subheader>

          <v-alert :type="modern ? undefined : 'warning'" v-if="has_selldone_in_url" class="mb-3" :class="{ 'sd-modern-notice b-login-oauth__notice': modern }" :role="modern ? 'status' : undefined">
            {{ modern ? $t('shop_configuration.flow_modern.login.domain_notice') : "Your main domain contains 'selldone'. You can't use custom OAuth client. Please add your custom domain to use this feature." }}
            <v-btn
              :to="{ name: 'BPageShopSettingDomain' }"
              class="mt-2"
              :class="{ 'sd-modern-button': modern }"
              prepend-icon="dns"
              >{{ $t('shop_configuration.flow_modern.login.manage_domains') }}</v-btn
            >
          </v-alert>

          <u-smart-switch
            :model-value="modern ? !enable : enable"
            @update:model-value="enable = modern ? !$event : $event"
            :accessible="modern"
            :disabled="has_selldone_in_url || readOnly || busy_save"
            :class="{ 'b-login-oauth__choices': modern }"
            :true-title="modern ? $t('shop_configuration.flow_modern.login.default_client') : 'Custom OAuth Client'"
            :false-title="modern ? $t('shop_configuration.flow_modern.login.custom_client') : 'Selldone OAuth Client'"
            :true-description="modern ? $t('shop_configuration.flow_modern.login.default_client_description') : 'Use your own OAuth2 client token.'"
            :false-description="modern ? $t('shop_configuration.flow_modern.login.custom_client_description') : 'Use default OAUth client. Selldone maintain technical for you.'"
            :false-icon="modern ? 'edit' : 'gpp_good'"
            :true-icon="modern ? 'gpp_good' : 'edit'"
          >
          </u-smart-switch>

          <v-expand-transition>
            <div v-if="enable" :class="{ 'b-login-oauth__fields': modern }">
              <div :class="{ 'sd-modern-form-grid b-login-oauth__field-grid': modern }">
              <v-text-field
                v-model="client_id"
                :disabled="has_selldone_in_url || readOnly || busy_save"
                :label="$t('shop_configuration.flow_modern.login.client_id')"
                variant="underlined"
                :class="modern ? 'sd-modern-underlined-field' : 'mt-5'"
                persistent-placeholder
                :placeholder="modern ? $t('shop_configuration.flow_modern.login.client_id_placeholder') : 'Write client ID here...'"
              ></v-text-field>
              <v-text-field
                v-model="client_secret"
                :disabled="has_selldone_in_url || readOnly || busy_save"
                :label="$t('shop_configuration.flow_modern.login.client_secret')"
                :type="modern ? 'password' : 'text'"
                variant="underlined"
                persistent-placeholder
                :class="{ 'sd-modern-underlined-field': modern }"
                :placeholder="modern ? $t('shop_configuration.flow_modern.login.client_secret_placeholder') : 'Write client secret here...'"
              ></v-text-field>
              </div>
              <p v-if="modern" class="b-login-oauth__guidance">{{ $t('shop_configuration.flow_modern.login.credentials_help') }}</p>

              <div v-if="modern" class="b-login-oauth__callback">
                <div class="b-login-oauth__callback-copy"><span>{{ $t('shop_configuration.flow_modern.login.redirect_url') }}</span><div dir="ltr">{{ callback_url }}</div></div>
                <v-btn class="sd-modern-icon-button" icon variant="text" :disabled="has_selldone_in_url" :aria-label="$t('shop_configuration.flow_modern.login.copy_redirect')" @click.stop="copyToClipboard(callback_url)"><v-icon size="18">content_copy</v-icon><v-tooltip activator="parent" location="top" content-class="sd-modern-tooltip text-start">{{ $t('shop_configuration.flow_modern.login.copy_redirect') }}</v-tooltip></v-btn>
              </div>

              <u-text-copy-box
                v-else
                :value="callback_url"
                :disabled="has_selldone_in_url"
                small-width-mode
                message="Redirect URL"
              ></u-text-copy-box>

              <v-alert v-if="callback_url !== oauth?.callback" :type="modern ? undefined : 'warning'" :class="{ 'sd-modern-notice b-login-oauth__notice': modern }" :role="modern ? 'status' : undefined">
                {{ modern ? $t('shop_configuration.flow_modern.login.callback_changed') : 'The new callback URL based on your main domain is not the same as the previous one. Please click save to update the callback URL.' }}
                <div class="b-login-oauth__callback-value"><b>{{ $t('shop_configuration.flow_modern.login.old_callback') }} </b> <span dir="ltr">{{ oauth?.callback }}</span></div>
                <div class="b-login-oauth__callback-value"><b>{{ $t('shop_configuration.flow_modern.login.new_callback') }} </b> <span dir="ltr">{{ callback_url }}</span></div>
              </v-alert>
            </div>
          </v-expand-transition>
        </div>
      </v-card-text>
      <v-card-actions :class="{ 'b-login-oauth__actions': modern }">
        <div :class="modern ? 'b-login-oauth__buttons' : 'widget-buttons'">
          <v-btn :size="modern ? undefined : 'x-large'" :class="{ 'sd-modern-button': modern }" variant="text" @click="dialog = false">
            <v-icon start>close</v-icon>
            {{ $t("global.actions.close") }}
          </v-btn>

          <v-btn
            :size="modern ? undefined : 'x-large'"
            :class="{ 'sd-modern-button b-login-oauth__save': modern }"
            variant="elevated"
            @click="save"
            color="primary"
            :loading="busy_save"
            :disabled="readOnly || busy_fetch || (has_selldone_in_url && enable)"
          >
            <v-icon start>save</v-icon>
            {{ $t("global.actions.save") }}
          </v-btn>
        </div>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { ShopOptionsHelper } from "@selldone/core-js/helper/shop/ShopOptionsHelper";
import UWidgetHeader from "@selldone/components-vue/ui/widget/header/UWidgetHeader.vue";
import USmartSwitch from "@selldone/components-vue/ui/smart/switch/USmartSwitch.vue";
import ULoadingProgress from "@selldone/components-vue/ui/loading/progress/ULoadingProgress.vue";
import UTextCopyBox from "@selldone/components-vue/ui/text/copy-box/UTextCopyBox.vue";
import {ShopURLs} from "@selldone/core-js/helper";

import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

export default {
  name: "BOptionsLoginMethodRow",
  mixins:[],
  components: { UTextCopyBox, ULoadingProgress, USmartSwitch, UWidgetHeader },
  props: {
    shop: {
      required: false,
      type: Object,
    },
    login: {
      required: false,
      type: Object,
    },
    readOnly: Boolean,
    modern: Boolean,
  },

  data: () => ({
    busy_login: null,
    dialog: false,

    oauth: null,
    enable: false,
    client_id: null,
    client_secret: null,
    busy_save: false,
    busy_fetch: false,
    error_msg: null,
  }),

  computed: {
    options_login() {
      let out = ShopOptionsHelper.GetLoginMethods(this.shop);
      return out && Array.isArray(out) ? out : null;
    },

    callback_url() {
      return `${ShopURLs.MainShopUrl(this.shop)}/login/${this.login.code}/callback`;
    },

    has_selldone_in_url() {
      return ShopURLs.MainShopUrl(this.shop).includes("selldone");
    },
  },
  watch: {
    login() {
      this.fetchOptionLoginMethodDetails();
    },
  },

  created() {
    this.fetchOptionLoginMethodDetails();
  },
  methods: {
    setOptionLoginMethods(code, enable) {
      if (this.readOnly || this.busy_login || !this.login.available) return;
      this.busy_login = code;
      axios
        .post(window.API.POST_SET_SHOP_OPTIONS_LOGIN_METHODS(this.shop.id), {
          code: code,
          enable: enable,
        })
        .then(({ data }) => {
          if (!data.error) {
            this.shop.options = data.options;
            NotificationService.showSuccessAlert(null, "Login methods updated successfully.");
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_login = null;
        });
    },

    fetchOptionLoginMethodDetails() {
      if (!this.login.customizable) return;
      this.busy_fetch = true;
      this.error_msg = null;
      axios
        .get(
          window.API.GET_SHOP_OPTION_LOGIN_METHOD_DETAILS(
            this.shop.id,
            this.login.code,
          ),
        )
        .then(({ data }) => {
          if (data.error) {
            this.error_msg =
              "You don't have permission to access this resource.";
          } else {
            this.oauth = data.oauth;

            this.client_id = data.oauth?.client_id;
            this.client_secret = data.oauth?.client_secret;
            this.enable = !!data.oauth?.enable;
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_fetch = false;
        });
    },

    save() {
      if (this.readOnly || this.busy_save || this.busy_fetch || (this.has_selldone_in_url && this.enable)) return;
      this.busy_save = true;
      axios
        .post(
          window.API.POST_SHOP_OPTION_LOGIN_METHOD_CLIENT(
            this.shop.id,
            this.login.code,
          ),
          {
            enable: this.enable,
            client_id: this.client_id,
            client_secret: this.client_secret,
          },
        )
        .then(({ data }) => {
          if (data.error) {
            NotificationService.showErrorAlert(null, data.error_msg);
          } else {
            this.oauth = data.oauth;
            this.dialog = false;
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_save = false;
        });
    },
  },
};
</script>

<style lang="scss" scoped>
.b-login-row--modern {
  min-height: 76px;
  padding: 16px 0;
  border-block-end: 1px solid var(--sd-modern-border);
  color: rgb(var(--v-theme-on-surface));

  &:last-child { padding-block-end: 0; border-block-end: 0; }
  :deep(.v-list-item__spacer) { width: 14px; }
  :deep(.v-list-item__content) { min-width: 0; }
  :deep(.v-list-item-title) { display: flex; flex-wrap: wrap; align-items: center; gap: 6px 10px; overflow: visible; font-size: 14px; font-weight: 500; line-height: 1.4; white-space: normal; }
  :deep(.v-list-item-subtitle) { margin-block-start: 4px; color: var(--sd-modern-muted); opacity: 1; font-size: 12px; line-height: 1.5; -webkit-line-clamp: unset; }
  :deep(.v-list-item__append) { gap: 12px; margin-inline-start: 14px; }
  .b-login-row__tags { display: inline-flex; flex-wrap: wrap; gap: 6px 10px; color: var(--sd-modern-muted); font-size: 11px; font-weight: 400; line-height: 1.4; }
  .b-login-row__callback { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .b-login-row__toggle.v-btn { flex: 0 0 36px; width: 36px; height: 36px; min-width: 36px; padding: 0; }
  .v-avatar img { width: 24px; height: 24px; object-fit: contain; }
}
.b-login-oauth--modern {
  border-radius: 18px !important;
  .b-login-oauth__heading { display: flex; align-items: flex-start; gap: 16px; padding: 0; margin-block-end: 22px; white-space: normal; }
  .b-login-oauth__heading-copy { flex: 1; min-width: 0; }
  .b-login-oauth__brand { display: flex; align-items: center; gap: 9px; margin-block-end: 7px; }
  .b-login-oauth__brand img { width: 22px; height: 22px; object-fit: contain; }
  .b-login-oauth__brand h2 { margin: 0; font-size: 18px; font-weight: 600; line-height: 1.4; }
  .b-login-oauth__heading p { margin: 5px 0 0; color: var(--sd-modern-muted); font-size: 13px; font-weight: 400; line-height: 1.6; }
  .b-login-oauth__content { padding: 0; font-size: 14px; }
  .b-login-oauth__notice { display: block; padding: 14px 16px; border-radius: 12px; margin-block: 14px; font-size: 12px; line-height: 1.65; }
  .b-login-oauth__choices :deep(.border-between-vertical) { overflow: hidden; border-radius: 14px; }
  .b-login-oauth__choices :deep(.row-hover) { min-height: 76px; padding: 15px 14px !important; background: var(--sd-modern-inset) !important; }
  .b-login-oauth__choices :deep(.mnh) { min-height: 44px; }
  .b-login-oauth__choices :deep(b) { font-size: 14px; font-weight: 500; line-height: 1.4; }
  .b-login-oauth__choices :deep(.small) { margin-block-start: 4px; opacity: 1; color: var(--sd-modern-muted); font-size: 12px; line-height: 1.5; }
  .b-login-oauth__choices :deep(.circle-check) { width: 20px; height: 20px; }
  .b-login-oauth__choices :deep(.mnh > .flex-grow-0 .v-icon) { color: var(--sd-modern-muted) !important; }
  .b-login-oauth__choices :deep(.mnh > .v-icon) { color: var(--sd-modern-muted); font-size: 18px; }
  .b-login-oauth__fields { margin-block-start: 22px; }
  .b-login-oauth__field-grid { width: 100%; }
  .b-login-oauth__guidance { margin: 0 0 15px; color: var(--sd-modern-muted); font-size: 12px; line-height: 1.5; }
  .b-login-oauth__callback { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 13px 15px; margin-block: 15px; border-radius: 12px; background: var(--sd-modern-inset); }
  .b-login-oauth__callback-copy { flex: 1; min-width: 0; font-size: 12px; line-height: 1.5; }
  .b-login-oauth__callback-copy > span { display: block; margin-block-end: 4px; }
  .b-login-oauth__callback-copy > div { overflow-wrap: anywhere; }
  .b-login-oauth__callback-value { margin-block-start: 5px; overflow-wrap: anywhere; font-size: 11px; }
  .b-login-oauth__actions { padding: 0; margin-block-start: 18px; }
  .b-login-oauth__buttons { display: flex; justify-content: flex-end; flex-wrap: wrap; gap: 10px; width: 100%; }
  .b-login-oauth__buttons .sd-modern-button { --v-btn-height: 40px; min-height: 40px; padding: 0 18px; font-size: 13px; }
  .b-login-oauth__save { min-width: 132px; }
}
@media (max-width: 600px), (pointer: coarse) {
  .b-login-row--modern {
    min-height: 80px;
    :deep(.v-list-item__append) { gap: 6px; margin-inline-start: 11px; }
    .b-login-row__toggle.v-btn { flex-basis: 44px; width: 44px; height: 44px; min-width: 44px; }
  }
  .b-login-oauth--modern .b-login-oauth__buttons .sd-modern-button { min-height: 44px; }
}
@media (max-width: 600px) {
  .b-login-oauth--modern { padding: 22px 18px; }
}
@media (max-width: 380px) {
  .b-login-row--modern :deep(.v-list-item__append) { flex-direction: column; gap: 2px; }
}
</style>
