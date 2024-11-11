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
  <s-widget-box
    v-if="session"
    :title="$t('global.commons.session')"
    active
    icon="location_searching"
  >
    <template v-slot:actions>
      <v-row no-gutters>
        <v-col class="p-2" cols="12" md="6">
          <p class="text-uppercase">{{ $t("global.commons.user_agent") }}</p>

          <v-table class="bg-transparent">
            <template v-slot:default>
              <tbody>
                <tr>
                  <td>{{ $t("global.commons.os") }}</td>
                  <td>{{ session.os }}</td>
                </tr>
                <tr>
                  <td>{{ $t("global.commons.browser") }}</td>
                  <td>
                    <img
                      :src="getBrowserImage(session.browser)"
                      class="me-2"
                      height="18"
                    />
                    {{ session.browser }}
                  </td>
                </tr>
                <tr>
                  <td>
                    {{ $t("global.commons.device") }}
                    <i
                      :style="`color: ${device.color}`"
                      class="fas fa-circle fa-xs me-1"
                    ></i>
                  </td>
                  <td>
                    <v-icon :title="$t(device.title)" class="me-2" size="18"
                      >{{ device.icon }}
                    </v-icon>
                    {{ session.device ? session.device : "" }}
                  </td>
                </tr>

                <tr>
                  <td>{{ $t("global.commons.device_ip") }}</td>
                  <td>
                    {{ session.ip }}
                    <span v-if="session.country" class="mx-2">
                      ({{ session.country }})
                    </span>
                    <flag
                      v-if="session.country_code"
                      :iso="session.country_code"
                      :squared="false"
                    />
                  </td>
                </tr>
              </tbody>
            </template>
          </v-table>
        </v-col>

        <v-col class="p-2" cols="12" md="6">
          <p class="text-uppercase">{{ $t("global.commons.location") }}</p>

          <u-map-view
            v-if="location_info.location"
            v-model="location_info"
            :center="center"
            :marker-position="location_info.location"
            :pin-image="null"
            :zoom="15"
            class="my-2"
            pin-icon="fa:fas fa-street-view"
            show-user-location
            style="width: 100%; height: 200px"
          />
        </v-col>
      </v-row>
    </template>
  </s-widget-box>
</template>

<script lang="ts">
import SWidgetBox from "../../../ui/widget/box/SWidgetBox.vue";
import { Analytics } from "@selldone/core-js";
import UMapView from "@selldone/components-vue/ui/map/view/UMapView.vue";

export default {
  name: "BOrderSession",
  components: {
    UMapView,
    SWidgetBox,
  },
  props: {
    session: {
      require: true,
      type: Object,
    },
  },
  data: function () {
    return {
      center: { lat: 0, lng: 0 },

      location_info: { location: { lat: 0, lng: 0 } },
    };
  },
  computed: {
    device() {
      let out = Analytics.DeviceType.find(
        (item) => item.code === this.session.type.toLowerCase(),
      );
      return out ? out : Analytics.DeviceType[0];
    },
  },

  watch: {
    session() {
      if (this.session) {
        this.location_info.location = {
          lat: this.session.lat,
          lng: this.session.lon,
        };
        this.center = { lat: this.session.lat, lng: this.session.lon };
      }
    },
  },
  created() {
    if (this.session) {
      this.location_info.location = {
        lat: this.session.lat,
        lng: this.session.lon,
      };
      this.center = { lat: this.session.lat, lng: this.session.lon };
    }
  },
  unmounted() {},
  methods: {},
};
</script>

<style scoped lang="scss"></style>
