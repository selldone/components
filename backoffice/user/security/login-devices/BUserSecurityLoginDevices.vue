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

<template>
  <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Login devices ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

  <section
    v-if="modern"
    class="b-user-security-login-devices sd-modern-widget text-start"
    :aria-busy="fetching_login_devices"
    :aria-label="$t('user_security_control.modern.devices_title')"
  >
    <header class="sd-modern-header b-user-security-login-devices__header">
      <div class="sd-modern-title">
        <v-icon class="sd-modern-icon--plain" size="19" aria-hidden="true">devices</v-icon>
        <div>
          <h2 class="sd-modern-title-text b-user-security-login-devices__title">
            {{ $t('user_security_control.modern.devices_title') }}
          </h2>
          <p class="sd-modern-subtitle b-user-security-login-devices__subtitle">
            {{ $t('user_security_control.modern.devices_subtitle') }}
          </p>
        </div>
      </div>
      <v-btn
        class="sd-modern-button sd-modern-button--small"
        variant="text"
        :loading="fetching_login_devices"
        :disabled="fetching_login_devices"
        prepend-icon="refresh"
        @click="fetchLoginDevices"
      >
        {{ $t('global.actions.refresh') }}
      </v-btn>
    </header>

    <u-loading-progress v-if="fetching_login_devices" />
    <ul v-else-if="login_devices.length" class="b-user-security-login-devices__list">
      <li
        v-for="(login_device, index) in login_devices"
        :key="index"
        class="b-user-security-login-devices__row"
      >
        <v-avatar class="b-user-security-login-devices__identity" size="24" tile>
          <img :src="getDeviceImage(login_device)" alt="" />
        </v-avatar>
        <div class="b-user-security-login-devices__details">
          <bdi class="b-user-security-login-devices__ip">{{ login_device.ip_address }}</bdi>
          <p class="b-user-security-login-devices__agent">{{ login_device.user_agent }}</p>
        </div>
        <div class="b-user-security-login-devices__activity">
          <span class="sd-modern-list-header">{{ $t('user_security_control.modern.last_activity') }}</span>
          <span>{{ getLocalTimeStringSmall(login_device.last_activity) }}</span>
        </div>
        <div class="b-user-security-login-devices__action">
          <span
            v-if="
              current_device &&
              current_device.user_agent === login_device.user_agent &&
              current_device.ip_address === login_device.ip_address
            "
            class="sd-modern-status sd-modern-status--plain"
          >
            <span class="sd-modern-status__dot sd-modern-status__dot--success" aria-hidden="true" />
            {{ $t('user_security_control.modern.current_device') }}
          </span>
          <v-btn
            v-else
            class="sd-modern-button sd-modern-button--small"
            variant="outlined"
            :loading="busy_logout_device === login_device"
            :disabled="!current_device || !!busy_logout_device"
            prepend-icon="logout"
            @click="logoutSession(login_device)"
          >
            {{ $t('user_security_control.modern.logout') }}
          </v-btn>
        </div>
      </li>
    </ul>
    <p v-else-if="login_devices_loaded" class="sd-modern-empty-state" role="status">
      {{ $t('user_security_control.modern.no_devices') }}
    </p>
  </section>

  <div v-else class="widget-box mb-5">
    <u-widget-header
      :add-caption="$t('global.actions.refresh')"
      :add-loading="fetching_login_devices"
      add-icon="refresh"
      add-text
      icon="devices"
      title="My Devices"
      @click:add="fetchLoginDevices"
    ></u-widget-header>
    <v-list-subheader>List of my active devices.</v-list-subheader>

    <u-loading-progress v-if="fetching_login_devices"></u-loading-progress>

    <v-expand-transition>
      <div v-if="!fetching_login_devices">
        <v-list
          class="mx-auto text-start border border-between-vertical rounded-28px"
          density="compact"
          lines="two"
          max-width="680px"
        >
          <v-list-item
            v-for="(login_device, index) in login_devices"
            :key="index"
            density="compact"
          >
            <template v-slot:prepend>
              <v-avatar size="24" tile>
                <img :src="getDeviceImage(login_device)" />
              </v-avatar>
            </template>

            <v-list-item-title>
              <b>{{ login_device.ip_address }}</b>
            </v-list-item-title>
            <v-list-item-subtitle>
              {{ login_device.user_agent }}
            </v-list-item-subtitle>

            <template v-slot:append>
              <v-list-item-action class="d-flex flex-column align-end" end>
                <small class="mb-1" title="Last activity">
                  {{ getLocalTimeStringSmall(login_device.last_activity) }}
                </small>
                <v-btn
                  v-if="
                    current_device.user_agent === login_device.user_agent &&
                    current_device.ip_address === login_device.ip_address
                  "
                  class="tnt pen"
                  color="success"
                  min-width="100"
                  variant="tonal"
                >
                  <v-icon start>person</v-icon>
                  Current
                </v-btn>
                <v-btn
                  v-else
                  :loading="busy_logout_device === login_device"
                  class="tnt"
                  min-width="100"
                  variant="outlined"
                  @click="logoutSession(login_device)"
                >
                  <v-icon start>logout</v-icon>
                  Logout
                </v-btn>
              </v-list-item-action>
            </template>
          </v-list-item>
        </v-list>
      </div>
    </v-expand-transition>
  </div>
</template>

<script lang="ts">
import DateMixin from "@selldone/components-vue/mixin/date/DateMixin.ts";

import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

export default {
  name: "BUserSecurityLoginDevices",
  mixins: [DateMixin ],

  components: {},
  props: {
    modern: Boolean,
  },
  data: () => ({
    login_devices: [],
    current_device: null,
    fetching_login_devices: false,
    login_devices_loaded: false,
    busy_logout_device: null,
  }),

  computed: {},

  watch: {},
  created() {
    this.fetchLoginDevices();
  },

  methods: {
    fetchLoginDevices() {
      this.fetching_login_devices = true;
      axios
        .get(window.API.GET_LOGIN_DEVICES())
        .then(({ data }) => {
          this.login_devices = data.sessions;
          this.current_device = data.current;
          this.login_devices_loaded = true;
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.fetching_login_devices = false;
        });
    },
    getDeviceImage(login_device) {
      const user_agent = login_device.user_agent.toLowerCase();
      if (user_agent.includes("firefox"))
        return require("@selldone/core-js/assets/trademark/firefox.svg");
      else if (user_agent.includes("chrome"))
        return require("@selldone/core-js/assets/trademark/chrome.svg");
      else if (user_agent.includes("trident"))
        return require("@selldone/core-js/assets/trademark/internet-explorer.svg");
      else if (user_agent.includes("applewebkit"))
        return require("@selldone/core-js/assets/trademark/safari.svg");
      else if (user_agent.includes("android application"))
        return require("@selldone/core-js/assets/trademark/android.svg");
      else if (user_agent.includes("ios application"))
        return require("@selldone/core-js/assets/trademark/apple.svg");
      else if (user_agent.includes("selldone"))
        return require("@selldone/core-js/assets/trademark/selldone.svg");
      else return require("@selldone/core-js/assets/trademark/information.svg");
    },

    logoutSession(login_device) {
      this.busy_logout_device = login_device;
      axios
        .post(window.API.POST_LOGOUT_DEVICE(), {
          ip_address: login_device.ip_address,
          user_agent: login_device.user_agent,
        })
        .then(({ data }) => {
          if (data.error) return NotificationService.showErrorAlert(null, data.error_msg);

          this.fetchLoginDevices();
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_logout_device = null;
        });
    },
  },
};
</script>

<style lang="scss" scoped>
.b-user-security-login-devices {
  &.sd-modern-widget {
    padding: 24px;
  }

  &__header {
    margin-block-end: 18px;
  }

  &__title {
    font-size: 16px;
    line-height: 23px;
    letter-spacing: -0.3px;
  }

  &__subtitle {
    margin-block: 5px 0;
    font-size: 12px;
    line-height: 19px;
  }

  &__list {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  &__row {
    display: grid;
    grid-template-columns: 24px minmax(0, 1fr) minmax(110px, auto) 110px;
    align-items: center;
    gap: 16px;
    padding-block: 18px;

    & + & {
      border-block-start: 1px solid var(--sd-modern-border);
    }
  }

  &__identity {
    align-self: start;
    margin-block-start: 3px;
  }

  &__details {
    min-width: 0;
  }

  &__ip {
    font-size: 13px;
    font-weight: 500;
    line-height: 21px;
    overflow-wrap: anywhere;
  }

  &__agent {
    margin: 4px 0 0;
    color: var(--sd-modern-muted);
    font-size: 12px;
    line-height: 19px;
    overflow-wrap: anywhere;
  }

  &__activity {
    display: grid;
    gap: 5px;
    font-size: 12px;
    line-height: 19px;
  }

  &__action {
    display: flex;
    justify-content: flex-end;
    min-width: 0;
  }

  @media (max-width: 640px) {
    &.sd-modern-widget {
      padding: 20px 17px;
    }

    &__row {
      grid-template-columns: 24px minmax(0, 1fr) auto;
      gap: 12px;
    }

    &__details {
      grid-column: 2 / -1;
    }

    &__activity {
      grid-column: 2;
    }

    &__action {
      grid-column: 3;
    }
  }
}
</style>
