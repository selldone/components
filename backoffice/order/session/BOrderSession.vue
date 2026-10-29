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
  <div v-if="modern" class="b-order-session-modern">
    <header class="sd-modern-header b-order-session-modern__header">
      <div>
        <div class="sd-modern-title">
          <span class="sd-modern-icon sd-modern-icon--plain"
            ><v-icon aria-hidden="true">location_searching</v-icon></span
          >
          <h1 class="sd-modern-title-text">
            {{ $t("b_order_session.modern.title") }}
          </h1>
        </div>
        <div class="b-order-session-modern__subtitle">
          <p class="sd-modern-subtitle">
            {{ $t("b_order_session.modern.subtitle") }}
          </p>
          <v-btn
            icon
            variant="text"
            class="sd-modern-icon-button sd-modern-info-button"
            :aria-label="$t('b_order_session.modern.help_title')"
          >
            <v-icon size="16" aria-hidden="true">info_outline</v-icon>
            <v-tooltip
              activator="parent"
              location="top"
              content-class="sd-modern-tooltip text-start"
              open-on-focus
              open-on-click
              >{{ $t("b_order_session.modern.help") }}</v-tooltip
            >
          </v-btn>
        </div>
      </div>
    </header>

    <section
      v-if="hasSession"
      class="sd-modern-widget b-order-session-modern__widget"
      :aria-label="$t('b_order_session.modern.title')"
    >
      <div class="b-order-session-modern__grid">
        <section class="b-order-session-modern__device">
          <header class="b-order-session-modern__section-heading">
            <h2>{{ $t("b_order_session.modern.device_network") }}</h2>
            <span v-if="orderCode" class="b-order-session-modern__context">{{
              $t("b_order_session.modern.order", { code: orderCode })
            }}</span>
          </header>
          <dl class="b-order-session-modern__facts">
            <div>
              <dt>{{ $t("global.commons.os") }}</dt>
              <dd>
                {{
                  sessionDetails.os || $t("b_order_session.modern.not_recorded")
                }}
              </dd>
            </div>
            <div>
              <dt>{{ $t("global.commons.browser") }}</dt>
              <dd>
                <img
                  v-if="sessionDetails.browser"
                  :src="Browser.getImageByCode(sessionDetails.browser)"
                  alt=""
                  width="18"
                  height="18"
                />
                {{
                  sessionDetails.browser ||
                  $t("b_order_session.modern.not_recorded")
                }}
              </dd>
            </div>
            <div>
              <dt>{{ $t("global.commons.device") }}</dt>
              <dd>
                <v-icon size="18" aria-hidden="true">{{ deviceIcon }}</v-icon>
                <span>{{
                  sessionDetails.device ||
                  $t("b_order_session.modern.not_recorded")
                }}</span>
                <span
                  v-if="sessionDetails.type"
                  class="b-order-session-modern__category"
                  ><i
                    :style="{
                      backgroundColor: deviceType?.color || 'currentColor',
                    }"
                    aria-hidden="true"
                  ></i
                  >{{
                    deviceType
                      ? $t("b_order_session.modern." + deviceType.code)
                      : sessionDetails.type
                  }}</span
                >
              </dd>
            </div>
          </dl>
          <section class="b-order-session-modern__network">
            <div class="b-order-session-modern__network-heading">
              <h3>{{ $t("b_order_session.modern.ip_address") }}</h3>
              <v-btn
                icon
                variant="text"
                class="sd-modern-icon-button sd-modern-info-button"
                :aria-label="$t('b_order_session.modern.ip_help_title')"
              >
                <v-icon size="16" aria-hidden="true">info_outline</v-icon>
                <v-tooltip
                  activator="parent"
                  location="top"
                  content-class="sd-modern-tooltip text-start"
                  open-on-focus
                  open-on-click
                  >{{ $t("b_order_session.modern.ip_help") }}</v-tooltip
                >
              </v-btn>
            </div>
            <div class="b-order-session-modern__ip-row">
              <bdi class="b-order-session-modern__ip">{{
                sessionDetails.ip || $t("b_order_session.modern.not_recorded")
              }}</bdi>
              <v-btn
                v-if="sessionDetails.ip"
                icon
                variant="text"
                class="sd-modern-icon-button"
                :aria-label="$t('b_order_session.modern.copy_ip')"
                @click="copyIp"
              >
                <v-icon size="16" aria-hidden="true">content_copy</v-icon>
                <v-tooltip
                  activator="parent"
                  location="top"
                  content-class="sd-modern-tooltip text-start"
                  >{{ $t("b_order_session.modern.copy_ip") }}</v-tooltip
                >
              </v-btn>
            </div>
            <div
              v-if="sessionDetails.country || countryCode"
              class="b-order-session-modern__country"
            >
              <flag
                v-if="countryCode"
                :iso="countryCode"
                :squared="false"
                aria-hidden="true"
              />
              <span>{{ sessionDetails.country || countryCode }}</span>
            </div>
          </section>
        </section>
        <section class="b-order-session-modern__location">
          <header class="b-order-session-modern__location-heading">
            <div>
              <h2>{{ $t("b_order_session.modern.location") }}</h2>
              <p>{{ $t("b_order_session.modern.location_subtitle") }}</p>
            </div>
            <v-btn
              icon
              variant="text"
              class="sd-modern-icon-button sd-modern-info-button"
              :aria-label="$t('b_order_session.modern.location_help_title')"
            >
              <v-icon size="16" aria-hidden="true">info_outline</v-icon>
              <v-tooltip
                activator="parent"
                location="top"
                content-class="sd-modern-tooltip text-start"
                open-on-focus
                open-on-click
                >{{ $t("b_order_session.modern.location_help") }}</v-tooltip
              >
            </v-btn>
          </header>
          <u-map-view
            v-if="coordinates"
            :key="`${coordinates.lat},${coordinates.lng}`"
            v-model="location_info"
            :center="coordinates"
            :marker-position="coordinates"
            :pin-image="null"
            :zoom="4"
            pin-icon="person_pin_circle"
            class="b-order-session-modern__map"
            show-user-location
          />
          <div v-else class="b-order-session-modern__map-empty">
            <v-icon size="25" aria-hidden="true">location_off</v-icon>
            <h3>{{ $t("b_order_session.modern.location_unavailable") }}</h3>
            <p>{{ $t("b_order_session.modern.location_empty") }}</p>
          </div>
          <div class="b-order-session-modern__map-caption">
            <v-icon size="15" aria-hidden="true">public</v-icon>
            <span>{{
              sessionDetails.country ||
              countryCode ||
              $t("b_order_session.modern.not_recorded")
            }}</span>
            <span class="b-order-session-modern__estimate">{{
              $t("b_order_session.modern.estimate")
            }}</span>
          </div>
        </section>
      </div>
    </section>
    <section v-else class="sd-modern-widget b-order-session-modern__empty">
      <v-icon size="26" aria-hidden="true">devices_other</v-icon>
      <div>
        <h2>{{ $t("b_order_session.modern.session_unavailable") }}</h2>
        <p>{{ $t("b_order_session.modern.session_empty") }}</p>
      </div>
    </section>
  </div>
  <s-widget-box
    v-else-if="session"
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
                      :src="Browser.getImageByCode(session.browser)"
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
import Browser from "@selldone/core-js/enums/analytics/browser/Browser.ts";

const recordedText = (value: unknown): string =>
  typeof value === "string" ? value.trim() : "";

export default {
  name: "BOrderSession",
  components: {
    UMapView,
    SWidgetBox,
  },
  props: {
    modern: { type: Boolean, default: false },
    orderCode: { type: String, default: "" },
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
    Browser() {
      return Browser;
    },
    sessionDetails() {
      return Object.fromEntries(
        [
          "os",
          "browser",
          "device",
          "type",
          "ip",
          "country",
          "country_code",
        ].map((key) => [key, recordedText(this.session?.[key])]),
      );
    },
    hasSession() {
      return (
        Object.values(this.sessionDetails).some(Boolean) || !!this.coordinates
      );
    },
    countryCode() {
      return /^[a-z]{2}$/i.test(this.sessionDetails.country_code)
        ? this.sessionDetails.country_code.toLowerCase()
        : "";
    },
    coordinates() {
      const lat = this.session?.lat;
      const lng = this.session?.lon;
      // Missing coordinates must never become a fabricated (0, 0) position.
      if (
        [lat, lng].some(
          (value) =>
            !["number", "string"].includes(typeof value) ||
            String(value).trim() === "",
        )
      )
        return null;
      const position = { lat: Number(lat), lng: Number(lng) };
      return Number.isFinite(position.lat) &&
        Math.abs(position.lat) <= 90 &&
        Number.isFinite(position.lng) &&
        Math.abs(position.lng) <= 180
        ? position
        : null;
    },
    deviceType() {
      return Analytics.DeviceType.find(
        (item) => item.code === this.sessionDetails.type.toLowerCase(),
      );
    },
    deviceIcon() {
      return (
        {
          desktop: "desktop_windows",
          mobile: "smartphone",
          tablet: "tablet_mac",
        }[this.deviceType?.code] || "devices_other"
      );
    },
    device() {
      let out = Analytics.DeviceType.find(
        (item) => item.code === recordedText(this.session?.type).toLowerCase(),
      );
      return out ? out : Analytics.DeviceType[0];
    },
  },

  watch: {
    coordinates: {
      immediate: true,
      handler(position) {
        if (this.modern) this.location_info = { location: position };
      },
    },
    session() {
      if (!this.modern && this.session) {
        this.location_info.location = {
          lat: this.session.lat,
          lng: this.session.lon,
        };
        this.center = { lat: this.session.lat, lng: this.session.lon };
      }
    },
  },
  created() {
    if (!this.modern && this.session) {
      this.location_info.location = {
        lat: this.session.lat,
        lng: this.session.lon,
      };
      this.center = { lat: this.session.lat, lng: this.session.lon };
    }
  },
  unmounted() {},
  methods: {
    copyIp() {
      if (this.sessionDetails.ip) this.copyToClipboard(this.sessionDetails.ip);
    },
  },
};
</script>

<style scoped lang="scss">
.b-order-session-modern {
  text-align: start;
  min-width: 0;
  font-size: 12px;
  line-height: 20px;

  h1,
  h2,
  h3,
  p,
  dl,
  dd {
    margin: 0;
  }
  h1.sd-modern-title-text {
    font-size: 22px;
    line-height: 29px;
    font-weight: 500;
    letter-spacing: -0.3px;
  }
  h2 {
    font-size: 16px;
    line-height: 23px;
    font-weight: 500;
  }
  h3 {
    font-size: 12px;
    line-height: 20px;
    font-weight: 400;
  }
  &__header {
    margin-bottom: 22px;
  }
  .sd-modern-title {
    align-items: center;
    gap: 11px;
  }
  &__subtitle {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 4px;
  }
  &__subtitle .sd-modern-subtitle {
    font-size: 12px;
    line-height: 20px;
  }
  &__widget.sd-modern-widget,
  &__empty.sd-modern-widget {
    padding: 22px;
    border-radius: 15px;
    font-size: 12px;
    line-height: 20px;
  }
  &__grid {
    display: grid;
    grid-template-columns: minmax(0, 0.86fr) minmax(0, 1.14fr);
    gap: 24px;
  }
  &__device,
  &__location {
    min-width: 0;
  }
  &__section-heading,
  &__location-heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }
  &__context {
    font-size: 11px;
    line-height: 17px;
    color: var(--sd-modern-muted);
    text-align: end;
  }
  &__facts {
    margin-top: 8px !important;
  }
  &__facts > div {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1.2fr);
    align-items: center;
    gap: 12px;
    padding-block: 15px;
    border-bottom: 1px solid var(--sd-modern-border);
  }
  &__facts dt {
    color: var(--sd-modern-muted);
  }
  &__facts dd {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
    overflow-wrap: anywhere;
  }
  &__facts img {
    object-fit: contain;
    flex-shrink: 0;
  }
  &__category {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: 11px;
    color: var(--sd-modern-muted);
  }
  &__category i {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    flex: none;
  }
  &__network {
    margin-top: 20px;
  }
  &__network-heading {
    display: flex;
    align-items: center;
    gap: 5px;
  }
  &__ip-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    margin-top: 3px;
  }
  &__ip {
    font-size: 14px;
    line-height: 23px;
    font-weight: 500;
    font-variant-numeric: tabular-nums;
    overflow-wrap: anywhere;
    min-width: 0;
  }
  &__country {
    display: flex;
    align-items: center;
    gap: 7px;
    margin-top: 8px;
  }
  &__country .flag-icon {
    flex-shrink: 0;
  }
  &__location {
    border-inline-start: 1px solid var(--sd-modern-border);
    padding-inline-start: 24px;
  }
  &__location-heading {
    align-items: start;
    margin-bottom: 14px;
  }
  &__location-heading p {
    font-size: 12px;
    line-height: 20px;
    margin-top: 3px;
    color: var(--sd-modern-muted);
  }
  &__map {
    width: 100%;
    height: 258px;
    border-radius: 11px;
    overflow: hidden;
  }
  &__map-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 258px;
    border-radius: 11px;
    padding: 20px;
    text-align: center;
    background: var(--sd-modern-inset);
  }
  &__map-empty h3 {
    font-size: 13px;
    line-height: 21px;
    font-weight: 500;
    margin-top: 12px;
  }
  &__map-empty p {
    color: var(--sd-modern-muted);
    margin-top: 4px;
  }
  &__map-caption {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 9px;
    font-size: 11px;
    line-height: 18px;
    color: var(--sd-modern-muted);
  }
  &__estimate {
    margin-inline-start: auto;
    text-align: end;
  }
  &__empty {
    display: flex;
    align-items: start;
    gap: 14px;
  }
  &__empty h2 {
    font-size: 16px;
    line-height: 23px;
  }
  &__empty p {
    margin-top: 5px;
    color: var(--sd-modern-muted);
  }

  @media (max-width: 650px) {
    h1.sd-modern-title-text {
      font-size: 21px;
      line-height: 28px;
    }
    &__header {
      margin-bottom: 18px;
    }
    &__widget.sd-modern-widget {
      padding: 0;
    }
    &__empty.sd-modern-widget {
      padding: 18px;
    }
    &__grid {
      grid-template-columns: minmax(0, 1fr);
      gap: 0;
    }
    &__device {
      padding: 18px;
    }
    &__location {
      border-inline-start: 0;
      border-top: 1px solid var(--sd-modern-border);
      padding: 18px;
    }
    &__facts > div {
      padding-block: 12px;
      grid-template-columns: minmax(0, 1fr) minmax(0, 1.1fr);
    }
    &__network {
      margin-top: 14px;
    }
    &__map,
    &__map-empty {
      height: 260px;
    }
    &__map-caption {
      flex-wrap: wrap;
    }
    &__estimate {
      margin-inline-start: 0;
    }
  }
}
</style>
