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
    :class="{ disabled: !login.available }"
  >
    <template v-slot:prepend>
      <v-avatar rounded size="24">
        <img v-if="login.image" :src="login.image" />
        <v-icon v-else color="#333">{{ login.icon }}</v-icon>
      </v-avatar>
    </template>

    <v-list-item-title
      >{{ login.title }}
      <v-chip
        v-if="login.premium"
        class="float-end"
        color="primary"
        label
        size="x-small"
      >
        <v-icon size="x-small" start>add</v-icon>
        {{ $t("global.commons.premium") }}
      </v-chip>
      <v-chip
        v-if="login.paid"
        class="float-end"
        color="#673AB7"
        label
        size="x-small"
      >
        <v-icon size="x-small" start>paid</v-icon>
        {{ $t("global.commons.paid") }}
      </v-chip>
    </v-list-item-title>
    <v-list-item-subtitle v-if="login.subtitle" :title="login.subtitle">
      {{ login.subtitle }}
    </v-list-item-subtitle>
    <v-list-item-subtitle v-if="error_msg">
      <v-icon size="small">error_outline</v-icon>
      {{ error_msg }}
    </v-list-item-subtitle>

    <template v-slot:append>
      <v-btn
        v-if="login.customizable"
        class="me-1"
        icon
        variant="text"
        @click="dialog = true"
        :disabled="!!error_msg"
        :loading="busy_fetch"
      >
        <v-icon>settings</v-icon>
      </v-btn>

      <v-btn
        :class="{ pen: readOnly }"
        :loading="busy_login === login.code"
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
          :model-value="
            login.available &&
            (!options_login || options_login.includes(login.code))
          "
          read-only
        ></u-check>
      </v-btn>
    </template>
  </v-list-item>

  <!-- ███████████████████████ Dialog > Add Affiliate ███████████████████████ -->
  <v-dialog
    v-model="dialog"
    fullscreen
    scrollable
    transition="dialog-bottom-transition"
  >
    <v-card class="text-start">
      <v-card-title>
        <v-avatar class="avatar-gradient -thin -shop me-2" size="32">
          <img :src="getShopImagePath(shop.icon, 96)" />
        </v-avatar>

        <v-icon class="rotate-90-e">cable</v-icon>

        <v-avatar rounded size="24" class="mx-2">
          <v-img v-if="login.image" :src="login.image" />
          <v-icon v-else color="#333">{{ login.icon }}</v-icon>
        </v-avatar>

        {{ login.title }}
      </v-card-title>
      <v-card-text>
        <u-loading-progress v-if="busy_fetch"></u-loading-progress>
        <div class="widget-box mb-5">
          <s-widget-header title="Conditional" icon="token"></s-widget-header>
          <v-list-subheader>
            Please provide your custom OAuth2 client token from the provider. By
            configuring this option, your business logo will appear on your
            store's login page. Note that this requires some technical
            experience and the creation of a developer account with the
            provider.
          </v-list-subheader>

          <u-smart-switch
            v-model="enable"
            true-title="Custom OAuth Client"
            false-title="Selldone OAuth Client"
            true-description="Use your own OAuth2 client token."
            false-description="Use default OAUth client. Selldone maintain technical for you."
            false-icon="gpp_good"
            true-icon="edit"
          >
          </u-smart-switch>

          <v-expand-transition>
            <div v-if="enable">
              <v-text-field
                v-model="client_id"
                label="Client ID"
                variant="underlined"
                class="mt-5"
                persistent-placeholder
                placeholder="Write client ID here..."
              ></v-text-field>
              <v-text-field
                v-model="client_secret"
                label="Client Secret"
                variant="underlined"
                persistent-placeholder
                placeholder="Write client secret here..."
              ></v-text-field>

              <u-text-copy-box
                :value="callback_url"
                small-width-mode
                message="Redirect URL"
              ></u-text-copy-box>
            </div>
          </v-expand-transition>
        </div>
      </v-card-text>
      <v-card-actions>
        <div class="widget-buttons">
          <v-btn size="x-large" variant="text" @click="dialog = false">
            <v-icon start>close</v-icon>
            {{ $t("global.actions.close") }}
          </v-btn>

          <v-btn
            size="x-large"
            variant="elevated"
            @click="save"
            color="primary"
            :loading="busy_save"
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
import SWidgetHeader from "@selldone/components-vue/ui/widget/header/SWidgetHeader.vue";
import USmartSwitch from "@selldone/components-vue/ui/smart/switch/USmartSwitch.vue";
import ULoadingProgress from "@selldone/components-vue/ui/loading/progress/ULoadingProgress.vue";
import UTextCopyBox from "@selldone/components-vue/ui/text/copy-box/UTextCopyBox.vue";

import { SetupService } from "@selldone/core-js";

export default {
  name: "BOptionsLoginMethodRow",
  components: { UTextCopyBox, ULoadingProgress, USmartSwitch, SWidgetHeader },
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
  },

  data: () => ({
    busy_login: null,
    dialog: false,

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
      return `${SetupService.MainServiceUrl()}/shops/${this.shop.id}/login/${this.login.code}/callback`;
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
      this.busy_login = code;
      axios
        .post(window.API.POST_SET_SHOP_OPTIONS_LOGIN_METHODS(this.shop.id), {
          code: code,
          enable: enable,
        })
        .then(({ data }) => {
          if (!data.error) {
            this.shop.options = data.options;
            this.showSuccessAlert(null, "Login methods updated successfully.");
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
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
            this.client_id = data.oauth?.client_id;
            this.client_secret = data.oauth?.client_secret;
            this.enable = !!data.oauth?.enable;
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_fetch = false;
        });
    },

    save() {
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
            this.showErrorAlert(null, data.error_msg);
          } else {
            this.dialog = false;
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_save = false;
        });
    },
  },
};
</script>

<style scoped></style>
