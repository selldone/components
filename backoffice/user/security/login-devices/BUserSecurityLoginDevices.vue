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

  <div class="widget-box mb-5">
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
export default {
  name: "BUserSecurityLoginDevices",
  components: {},
  props: {},
  data: () => ({
    login_devices: [],
    current_device: null,
    fetching_login_devices: false,
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
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.fetching_login_devices = false;
        });
    },
    getDeviceImage(login_device) {
      const user_agent = login_device.user_agent.toLowerCase();
      if (user_agent.includes("firefox"))
        return require("../../../../assets/trademark/firefox.svg");
      else if (user_agent.includes("chrome"))
        return require("../../../../assets/trademark/chrome.svg");
      else if (user_agent.includes("trident"))
        return require("../../../../assets/trademark/internet-explorer.svg");
      else if (user_agent.includes("applewebkit"))
        return require("../../../../assets/trademark/safari.svg");
      else if (user_agent.includes("android application"))
        return require("../../../../assets/trademark/android.svg");
      else if (user_agent.includes("ios application"))
        return require("../../../../assets/trademark/apple.svg");
      else if (user_agent.includes("selldone"))
        return require("../../../../assets/selldone-logo/selldone.svg");
      else return require("../../../../assets/trademark/information.svg");
    },

    logoutSession(login_device) {
      this.busy_logout_device = login_device;
      axios
        .post(window.API.POST_LOGOUT_DEVICE(), {
          ip_address: login_device.ip_address,
          user_agent: login_device.user_agent,
        })
        .then(({ data }) => {
          if (data.error) return this.showErrorAlert(null, data.error_msg);

          this.fetchLoginDevices();
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_logout_device = null;
        });
    },
  },
};
</script>

<style lang="scss" scoped></style>
