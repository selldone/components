<!-- Copyright (c) Selldone® Business OS™. -->
<template>
  <div
    class="b-live-view text-start"
    :class="{ 'b-live-view--report': report }"
  >
    <header
      v-if="report"
      class="sd-modern-widget sd-modern-header b-live-view__report-header"
    >
      <div class="sd-modern-title">
        <span class="sd-modern-icon sd-modern-icon--plain"
          ><v-icon size="20" aria-hidden="true">sensors</v-icon></span
        >
        <div>
          <h2 class="sd-modern-title-text">{{ $t("geo_map.live.title") }}</h2>
          <p class="b-live-view__connection" role="status">
            <span
              class="sd-modern-status sd-modern-status--plain"
              :class="{ 'b-live-view__connected': connection === 'live' }"
              ><span class="sd-modern-status__dot" />{{
                $t("geo_map.live." + connection)
              }}</span
            >
            <span>{{
              snapshot
                ? $t("geo_map.live.updated_at", { time: time(snapshot.as_of) })
                : $t("geo_map.live.waiting_first")
            }}</span>
            <span
              v-if="snapshot?.simulated"
              class="sd-modern-status sd-modern-status--plain"
              ><v-icon size="14" aria-hidden="true">science</v-icon
              >{{ $t("geo_map.live.sample_data") }}</span
            >
          </p>
        </div>
      </div>
      <div class="sd-modern-actions">
        <label v-if="windowControl" class="b-live-view__report-window">
          <select
            v-model.number="selectedMinutes"
            :aria-label="$t('geo_map.live.activity_window')"
          >
            <option :value="5">
              {{ $t("geo_map.live.window_scope", { minutes: 5 }) }}
            </option>
            <option :value="15">
              {{ $t("geo_map.live.window_scope", { minutes: 15 }) }}
            </option>
          </select>
        </label>
        <v-btn
          icon
          variant="text"
          class="sd-modern-icon-button"
          :aria-label="
            $t(paused ? 'geo_map.live.resume' : 'geo_map.live.pause')
          "
          v-tooltip="
            tooltip($t(paused ? 'geo_map.live.resume' : 'geo_map.live.pause'))
          "
          @click="togglePause"
          ><v-icon size="18" aria-hidden="true">{{
            paused ? "play_arrow" : "pause"
          }}</v-icon></v-btn
        >
        <v-btn
          icon
          variant="text"
          class="sd-modern-icon-button"
          :loading="loading"
          :disabled="paused || !visible || !online"
          :aria-label="$t('geo_map.live.refresh')"
          v-tooltip="tooltip($t('geo_map.live.refresh'))"
          @click="refresh"
          ><v-icon size="18" aria-hidden="true">refresh</v-icon></v-btn
        >
      </div>
    </header>
    <div v-if="windowControl && !report" class="b-live-view__window">
      <label
        >{{ $t("geo_map.live.activity_window")
        }}<select
          v-model.number="selectedMinutes"
          v-tooltip="tooltip($t('geo_map.live.activity_window'))"
        >
          <option :value="5">
            {{ $t("geo_map.live.window_scope", { minutes: 5 }) }}
          </option>
          <option :value="15">
            {{ $t("geo_map.live.window_scope", { minutes: 15 }) }}
          </option>
        </select></label
      >
    </div>
    <section
      class="sd-modern-widget b-live-view__metrics"
      :aria-label="$t('geo_map.live.metrics')"
    >
      <div
        v-for="metric in metrics"
        :key="metric.key"
        class="b-live-view__metric"
      >
        <div class="b-live-view__metric-label">
          <span>{{ $t("geo_map.live." + metric.key) }}</span
          ><v-btn
            icon
            variant="text"
            class="sd-modern-icon-button sd-modern-info-button"
            :aria-label="$t('geo_map.live.' + metric.key)"
            v-tooltip="{
              ...tooltip($t('geo_map.live.' + metric.help)),
              openOnClick: true,
            }"
            ><v-icon size="16" aria-hidden="true">info_outline</v-icon></v-btn
          >
        </div>
        <strong>{{ format(metric.value) }}</strong>
        <p>
          {{
            metric.presence
              ? $t("geo_map.live.presence_scope", {
                  seconds: snapshot?.presence_window_seconds || 60,
                })
              : windowLabel
          }}
        </p>
        <svg
          class="b-live-view__spark"
          viewBox="0 0 180 24"
          aria-hidden="true"
          :class="metric.key"
        >
          <path
            v-if="metric.history.length > 1"
            :d="miniPath(metric.history)"
          />
        </svg>
      </div>
    </section>
    <section class="sd-modern-widget b-live-view__activity">
      <header v-if="!report" class="sd-modern-header">
        <div class="sd-modern-title">
          <span class="sd-modern-icon sd-modern-icon--plain"
            ><v-icon aria-hidden="true">public</v-icon></span
          >
          <div>
            <h2 class="sd-modern-title-text">{{ $t("geo_map.live.title") }}</h2>
            <p class="b-live-view__connection" role="status">
              <span
                class="sd-modern-status sd-modern-status--plain"
                :class="{ 'b-live-view__connected': connection === 'live' }"
                ><span class="sd-modern-status__dot" />{{
                  $t("geo_map.live." + connection)
                }}</span
              ><span>{{
                snapshot
                  ? $t("geo_map.live.updated_at", {
                      time: time(snapshot.as_of),
                    })
                  : $t("geo_map.live.waiting_first")
              }}</span>
              <span
                v-if="snapshot?.simulated"
                class="sd-modern-status sd-modern-status--plain"
              >
                <v-icon size="14" aria-hidden="true">science</v-icon>
                {{ $t("geo_map.live.sample_data") }}
              </span>
            </p>
          </div>
        </div>
        <div class="sd-modern-actions">
          <v-btn
            variant="text"
            class="sd-modern-button"
            @click="togglePause"
            v-tooltip="
              tooltip($t(paused ? 'geo_map.live.resume' : 'geo_map.live.pause'))
            "
            ><v-icon start size="18" aria-hidden="true">{{
              paused ? "play_arrow" : "pause"
            }}</v-icon
            >{{
              $t(paused ? "geo_map.live.resume" : "geo_map.live.pause")
            }}</v-btn
          ><v-btn
            icon
            variant="text"
            class="sd-modern-icon-button"
            :loading="loading"
            :disabled="paused || !visible || !online"
            :aria-label="$t('geo_map.live.refresh')"
            v-tooltip="tooltip($t('geo_map.live.refresh'))"
            @click="refresh"
            ><v-icon aria-hidden="true">refresh</v-icon></v-btn
          >
        </div>
      </header>
      <div :class="{ 'b-live-view__report-notices': report }">
        <p v-if="snapshot?.simulated" class="b-live-view__notice-copy">
          {{ $t("geo_map.live.sample_help") }}
        </p>
        <div
          v-if="loadError"
          class="sd-modern-notice b-live-view__notice"
          role="alert"
        >
          <v-icon size="19" aria-hidden="true">error_outline</v-icon>
          <div>
            <p>{{ $t("geo_map.live.load_error") }}</p>
            <p v-if="snapshot">{{ $t("geo_map.live.showing_last") }}</p>
          </div>
          <v-btn
            class="sd-modern-button"
            variant="text"
            :disabled="paused || !visible || !online"
            v-tooltip="tooltip($t('geo_map.live.retry'))"
            @click="refresh"
            >{{ $t("geo_map.live.retry") }}</v-btn
          >
        </div>
        <p
          v-else-if="
            snapshot && connection !== 'live' && connection !== 'snapshot_mode'
          "
          class="b-live-view__notice-copy"
        >
          {{ $t("geo_map.live.showing_last") }}
        </p>
        <p
          v-if="report && snapshot?.truncated"
          class="b-live-view__notice-copy"
        >
          {{ $t("geo_map.live.truncated") }}
        </p>
      </div>
      <div class="b-live-view__map-layout">
        <div
          class="b-live-view__map-side"
          :class="{ 'sd-modern-widget': report }"
        >
          <div ref="mapStage" class="b-live-view__map-stage">
            <svg
              ref="mapSvg"
              class="b-live-view__world"
              :viewBox="'0 0 ' + mapWidth + ' ' + mapHeight"
              role="img"
              :aria-label="$t('geo_map.live.map_label')"
            >
              <title>{{ $t("geo_map.live.map_label") }}</title>
              <g :transform="mapTransform" class="b-live-view__land">
                <path
                  v-for="country in landPaths"
                  :key="country.id"
                  :d="country.d"
                />
              </g>
              <g :transform="mapTransform" aria-hidden="true">
                <circle
                  v-for="pulse in pulses"
                  :key="pulse.key"
                  :cx="pulse.x"
                  :cy="pulse.y"
                  :r="9 / transform.k"
                  class="b-live-view__pulse"
                  :class="pulse.type"
                />
              </g>
            </svg>
            <div class="b-live-view__markers">
              <button
                v-for="cluster in clusters"
                :key="cluster.id"
                type="button"
                class="b-live-view__marker"
                :class="{
                  'has-cart': cluster.add_to_cart > 0,
                  'has-order': cluster.orders_placed > 0,
                  'is-selected': cluster.ids.some((id) =>
                    selectedIds.includes(id),
                  ),
                }"
                :style="{ left: cluster.x + 'px', top: cluster.y + 'px' }"
                :aria-label="clusterLabel(cluster)"
                :aria-pressed="
                  cluster.ids.some((id) => selectedIds.includes(id))
                "
                v-tooltip="tooltip(clusterLabel(cluster))"
                @click="selectCluster(cluster)"
              >
                <span>{{ format(cluster.active_sessions) }}</span></button
              ><span
                v-if="userPoint"
                class="b-live-view__user-point"
                :style="{ left: userPoint[0] + 'px', top: userPoint[1] + 'px' }"
                role="img"
                :aria-label="$t('geo_map.live.locate')"
              />
            </div>
            <div class="b-live-view__map-controls">
              <v-btn
                v-for="control in mapControls"
                :key="control.action"
                icon
                variant="text"
                class="sd-modern-icon-button"
                :aria-label="$t('geo_map.live.' + control.label)"
                v-tooltip="tooltip($t('geo_map.live.' + control.label))"
                :loading="control.action === 'locate' && locating"
                @click="mapAction(control.action)"
                ><v-icon size="19" aria-hidden="true">{{
                  control.icon
                }}</v-icon></v-btn
              >
            </div>
            <div
              v-if="snapshot && !locations.length"
              class="b-live-view__map-empty"
            >
              <v-icon size="28" aria-hidden="true">sensors</v-icon
              ><strong>{{ $t("geo_map.live.map_empty_title") }}</strong
              ><span>{{ $t("geo_map.live.map_empty_message") }}</span>
            </div>
            <span class="b-live-view__map-credit">Natural Earth</span>
          </div>
          <div class="b-live-view__map-key">
            <span
              ><i class="b-live-view__key-dot" />{{
                $t("geo_map.live.active_sessions")
              }}</span
            ><span
              ><i class="b-live-view__key-ring" />{{
                $t("geo_map.live.add_to_cart")
              }}</span
            ><span
              ><i class="b-live-view__key-square" />{{
                $t("geo_map.live.orders_placed")
              }}</span
            ><v-btn
              icon
              variant="text"
              class="sd-modern-icon-button sd-modern-info-button"
              :aria-label="$t('geo_map.live.approximate')"
              v-tooltip="{
                ...tooltip($t('geo_map.live.map_help')),
                openOnClick: true,
              }"
              ><v-icon size="16" aria-hidden="true">info_outline</v-icon></v-btn
            ><small>{{ $t("geo_map.live.approximate") }}</small>
          </div>
          <div class="b-live-view__location-detail" aria-live="polite">
            <div>
              <strong
                ><v-icon size="16" aria-hidden="true">place</v-icon
                >{{ selectionTitle }}</strong
              >
              <p>
                {{
                  selectedCountry
                    ? $t("geo_map.live.country_presence", {
                        count: format(
                          countries.find(
                            (country) =>
                              country.country_code === selectedCountry,
                          )?.active_sessions,
                        ),
                      })
                    : selectedIds.length
                      ? clusterSummary(selectedSummary)
                      : snapshot
                        ? $t("geo_map.live.mapped_summary", {
                            mapped: format(snapshot.mapped_sessions),
                            unlocated: format(snapshot.unlocated_sessions),
                          })
                        : "—"
                }}
              </p>
            </div>
            <v-btn
              v-if="selectedIds.length || selectedCountry"
              icon
              variant="text"
              class="sd-modern-icon-button"
              :aria-label="$t('geo_map.live.clear_location')"
              v-tooltip="tooltip($t('geo_map.live.clear_location'))"
              @click="clearSelection"
              ><v-icon size="18" aria-hidden="true">close</v-icon></v-btn
            >
            <ul
              v-if="selectedCountries.length > 1"
              class="b-live-view__country-subtotals"
            >
              <li
                v-for="country in selectedCountries"
                :key="country.code || 'unknown'"
              >
                <span
                  ><flag
                    v-if="country.code"
                    :iso="country.code"
                    :squared="false"
                  />{{ countryName(country.code) }}</span
                ><span>{{ clusterSummary(country) }}</span>
              </li>
            </ul>
          </div>
          <p v-if="geoError" class="b-live-view__notice-copy" role="status">
            {{ $t("geo_map.live.locate_error") }}
          </p>
          <p
            v-if="snapshot?.other_locations_sessions"
            class="b-live-view__notice-copy"
          >
            {{
              $t("geo_map.live.other_locations", {
                count: format(snapshot.other_locations_sessions),
              })
            }}
          </p>
        </div>
        <aside
          class="b-live-view__events"
          :class="{ 'sd-modern-widget': report }"
          :aria-label="$t('geo_map.live.recent_activity')"
        >
          <header>
            <h3>{{ $t("geo_map.live.recent_activity") }}</h3>
            <v-btn
              icon
              variant="text"
              class="sd-modern-icon-button sd-modern-info-button"
              :aria-label="$t('geo_map.live.recent_activity')"
              v-tooltip="{
                ...tooltip($t('geo_map.live.events_help')),
                openOnClick: true,
              }"
              ><v-icon size="16" aria-hidden="true">info_outline</v-icon></v-btn
            >
          </header>
          <p class="b-live-view__event-scope">{{ windowLabel }}</p>
          <ol>
            <li
              v-for="event in events"
              :key="event.at + event.type + event.country_code"
            >
              <v-icon size="18" aria-hidden="true">{{
                eventIcons[event.type]
              }}</v-icon>
              <div>
                <p>
                  {{ $t("geo_map.live." + event.type) }}
                  <span>{{ format(event.count) }}</span>
                </p>
                <small
                  ><flag
                    v-if="event.country_code"
                    :iso="event.country_code"
                    :squared="false"
                  />{{ countryName(event.country_code) }}</small
                >
              </div>
              <time
                :datetime="event.at"
                tabindex="0"
                v-tooltip="
                  tooltip(
                    $t('geo_map.live.minute_group', { time: time(event.at) }),
                  )
                "
                >{{ time(event.at, false) }}</time
              >
            </li>
          </ol>
          <p v-if="snapshot && !events.length" class="sd-modern-empty-state">
            {{ $t("geo_map.live.empty_events") }}
          </p>
          <dl class="b-live-view__secondary">
            <div v-for="key in secondaryMetrics" :key="key">
              <dt>
                {{ $t("geo_map.live." + key)
                }}<v-btn
                  v-if="key === 'purchase_actions'"
                  icon
                  variant="text"
                  class="sd-modern-icon-button sd-modern-info-button"
                  :aria-label="$t('geo_map.live.purchase_actions')"
                  v-tooltip="{
                    ...tooltip($t('geo_map.live.purchase_help')),
                    openOnClick: true,
                  }"
                  ><v-icon size="16" aria-hidden="true"
                    >info_outline</v-icon
                  ></v-btn
                >
              </dt>
              <dd>{{ format(activity?.totals?.[key]) }}</dd>
            </div>
          </dl>
        </aside>
      </div>
      <p v-if="!report && snapshot?.truncated" class="b-live-view__notice-copy">
        {{ $t("geo_map.live.truncated") }}
      </p>
    </section>
    <div class="b-live-view__bottom">
      <section class="sd-modern-widget">
        <header class="sd-modern-header">
          <div class="sd-modern-title">
            <span class="sd-modern-icon sd-modern-icon--plain"
              ><v-icon aria-hidden="true">show_chart</v-icon></span
            >
            <div>
              <h2 class="sd-modern-title-text">
                {{ $t("geo_map.live.trend_title") }}
              </h2>
              <p class="sd-modern-subtitle">
                {{
                  $t("geo_map.live.trend_scope", { minutes: selectedMinutes })
                }}
              </p>
            </div>
          </div>
          <v-btn
            icon
            variant="text"
            class="sd-modern-icon-button sd-modern-info-button"
            :aria-label="$t('geo_map.live.trend_title')"
            v-tooltip="{
              ...tooltip($t('geo_map.live.trend_help')),
              openOnClick: true,
            }"
            ><v-icon size="16" aria-hidden="true">info_outline</v-icon></v-btn
          >
        </header>
        <svg
          ref="trendSvg"
          direction="ltr"
          class="b-live-view__trend"
          :viewBox="'0 0 ' + trendWidth + ' 190'"
          role="img"
          :aria-label="$t('geo_map.live.trend_title')"
        >
          <g
            v-for="tick in trend.yTicks"
            :key="tick.value"
            class="b-live-view__chart-grid"
          >
            <line x1="30" :x2="trendWidth - 12" :y1="tick.y" :y2="tick.y" />
            <text x="23" :y="tick.y + 4" text-anchor="end">
              {{ format(tick.value) }}
            </text>
          </g>
          <text
            v-for="tick in trend.xTicks"
            :key="tick.value"
            :x="tick.x"
            y="183"
            :text-anchor="tick.anchor"
            class="b-live-view__chart-label"
          >
            {{ time(tick.value, false) }}
          </text>
          <g
            v-for="series in trend.series"
            :key="series.key"
            :class="series.key"
            v-show="visibleSeries[series.key]"
          >
            <path :d="series.path" class="b-live-view__trend-line" />
            <circle
              v-for="point in series.points"
              :key="point.at"
              :cx="point.x"
              :cy="point.y"
              r="3"
              tabindex="0"
              role="img"
              :aria-label="point.label"
              v-tooltip="tooltip(point.label)"
            >
              <title>{{ point.label }}</title>
            </circle>
          </g>
        </svg>
        <div class="b-live-view__trend-key">
          <button
            v-for="key in ['add_to_cart', 'orders_placed']"
            :key="key"
            type="button"
            :class="[key, { 'is-muted': !visibleSeries[key] }]"
            :aria-pressed="visibleSeries[key]"
            v-tooltip="tooltip($t('geo_map.live.' + key))"
            @click="visibleSeries[key] = !visibleSeries[key]"
          >
            <i />{{ $t("geo_map.live." + key) }}
          </button>
        </div>
      </section>
      <section class="sd-modern-widget b-live-view__countries">
        <header class="sd-modern-header">
          <div class="sd-modern-title">
            <span class="sd-modern-icon sd-modern-icon--plain"
              ><v-icon aria-hidden="true">travel_explore</v-icon></span
            >
            <div>
              <h2 class="sd-modern-title-text">
                {{ $t("geo_map.live.active_locations") }}
              </h2>
              <p class="sd-modern-subtitle">
                {{
                  $t("geo_map.live.presence_scope", {
                    seconds: snapshot?.presence_window_seconds || 60,
                  })
                }}
              </p>
            </div>
          </div>
        </header>
        <div class="b-live-view__table-scroll">
          <table class="sd-modern-table">
            <thead>
              <tr>
                <th scope="col">{{ $t("geo_map.live.location") }}</th>
                <th scope="col">{{ $t("geo_map.live.sessions") }}</th>
                <th scope="col">{{ $t("geo_map.live.share") }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="country in countries" :key="country.country_code">
                <td>
                  <button
                    type="button"
                    :class="{ 'sd-modern-clickable-item': report }"
                    v-tooltip="
                      tooltip(
                        $t('geo_map.live.select_country', {
                          country: countryName(country.country_code),
                        }),
                      )
                    "
                    :aria-pressed="selectedCountry === country.country_code"
                    @click="selectCountry(country.country_code)"
                  >
                    <flag :iso="country.country_code" :squared="false" />{{
                      countryName(country.country_code)
                    }}
                  </button>
                </td>
                <td>{{ format(country.active_sessions) }}</td>
                <td>{{ share(country.active_sessions) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p v-if="snapshot && !countries.length" class="sd-modern-empty-state">
          {{ $t("geo_map.live.empty_title") }}
        </p>
        <p class="b-live-view__notice-copy">
          {{
            snapshot
              ? $t("geo_map.live.mapped_summary", {
                  mapped: format(snapshot.mapped_sessions),
                  unlocated: format(snapshot.unlocated_sessions),
                })
              : "—"
          }}
        </p>
      </section>
    </div>
  </div>
</template>
<script lang="ts">
import { markRaw } from "vue";
import {
  geoNaturalEarth1,
  geoPath,
  select,
  zoom,
  zoomIdentity,
  line,
  scaleLinear,
} from "d3";
import Echo from "laravel-echo";
import Pusher from "pusher-js";
import { SetupService } from "@selldone/core-js/server/SetupService";
import { getCountryName } from "@selldone/core-js/models/general/country/country-helper";
import world from "./world-countries.geo.json";
import {
  acceptsSnapshot,
  liveLocations,
  clusterLocations,
} from "./liveViewData";
import type { LiveSnapshot, LiveCluster } from "./liveViewData";
const eventIcons = {
  add_to_cart: "add_shopping_cart",
  remove_from_cart: "remove_shopping_cart",
  product_views: "visibility",
  purchase_actions: "payment",
  orders_placed: "shopping_bag",
};
const mapControls = [
  { action: "in", label: "zoom_in", icon: "add" },
  { action: "out", label: "zoom_out", icon: "remove" },
  { action: "fit", label: "fit_world", icon: "fit_screen" },
  { action: "locate", label: "locate", icon: "my_location" },
];
export default {
  name: "GeoMap",
  inheritAttrs: false,
  props: {
    modern: Boolean,
    report: Boolean,
    shop: { type: Object, default: null },
    windowMinutes: {
      type: Number,
      default: 5,
      validator: (value) => [5, 15].includes(value),
    },
    windowControl: { type: Boolean, default: true },
  },
  data() {
    return {
      snapshot: null as LiveSnapshot | null,
      selectedMinutes: this.windowMinutes === 15 ? 15 : 5,
      paused: false,
      visible: true,
      online: true,
      loading: false,
      loadError: false,
      connection: "connecting",
      presenceHistory: [] as { at: string; active: number; signedIn: number }[],
      mapWidth: 800,
      mapHeight: 350,
      trendWidth: 600,
      transform: { x: 0, y: 0, k: 1 },
      selectedIds: [] as string[],
      selectedCountry: null as string | null,
      userLocation: null as number[] | null,
      locating: false,
      geoError: false,
      reducedMotion: false,
      pulses: [] as { key: string; x: number; y: number; type: string }[],
      visibleSeries: { add_to_cart: true, orders_placed: true },
      eventIcons,
      mapControls,
      secondaryMetrics: [
        "product_views",
        "remove_from_cart",
        "purchase_actions",
      ],
      runtime: markRaw({
        mounted: false,
        generation: 0,
        timer: null,
        pulseTimer: null,
        observer: null,
        resizeFrame: null,
        resizeGeneration: 0,
        zoom: null,
        echo: null,
        pusher: null,
        channel: "",
        subscribed: false,
        lastSocket: 0,
        lastWatch: 0,
        shopId: 0,
        viewerId: "",
        pending: false,
        controllers: new Set<AbortController>(),
        media: null,
      }),
    };
  },
  computed: {
    shopId() {
      const id = Number(this.shop?.id || this.$route?.params?.shop_id);
      return Number.isSafeInteger(id) && id > 0 ? id : 0;
    },
    shouldWatch() {
      return (
        this.runtime.mounted &&
        this.shopId > 0 &&
        !this.paused &&
        this.visible &&
        this.online
      );
    },
    windowLabel() {
      return this.$t("geo_map.live.window_scope", {
        minutes: this.selectedMinutes,
      });
    },
    activity() {
      return this.snapshot?.windows[String(this.selectedMinutes)] || null;
    },
    locations() {
      return liveLocations(this.snapshot, this.selectedMinutes);
    },
    countries() {
      return [...(this.snapshot?.countries || [])].sort(
        (a, b) => b.active_sessions - a.active_sessions,
      );
    },
    metrics() {
      return [
        {
          key: "active_sessions",
          help: "active_help",
          presence: true,
          value: this.snapshot?.active_sessions,
          history: this.presenceHistory.map((item) => item.active),
        },
        {
          key: "signed_in_customers",
          help: "signed_in_help",
          presence: true,
          value: this.snapshot?.signed_in_customers,
          history: this.presenceHistory.map((item) => item.signedIn),
        },
        {
          key: "add_to_cart",
          help: "cart_help",
          value: this.activity?.totals?.add_to_cart,
          history: (this.activity?.trend || []).map((item) => item.add_to_cart),
        },
        {
          key: "orders_placed",
          help: "orders_help",
          value: this.activity?.totals?.orders_placed,
          history: (this.activity?.trend || []).map(
            (item) => item.orders_placed,
          ),
        },
      ];
    },
    projection() {
      return geoNaturalEarth1().fitExtent(
        [
          [14, 12],
          [this.mapWidth - 14, this.mapHeight - 12],
        ],
        world as any,
      );
    },
    landPaths() {
      const path = geoPath(this.projection);
      return world.features.map((country) => ({
        id: country.properties.id,
        d: path(country as any),
      }));
    },
    mapTransform() {
      return `translate(${this.transform.x},${this.transform.y}) scale(${this.transform.k})`;
    },
    clusters() {
      return clusterLocations(
        this.locations,
        this.projection,
        this.transform,
        this.mapWidth,
        this.mapHeight,
      );
    },
    userPoint() {
      if (!this.userLocation) return null;
      const point = this.projection(this.userLocation);
      return point
        ? [
            point[0] * this.transform.k + this.transform.x,
            point[1] * this.transform.k + this.transform.y,
          ]
        : null;
    },
    selectedLocations() {
      return this.locations.filter((item) =>
        this.selectedCountry
          ? item.country_code === this.selectedCountry
          : this.selectedIds.includes(item.id),
      );
    },
    selectedSummary() {
      return this.selectedLocations.reduce(
        (sum, item) => ({
          active_sessions: sum.active_sessions + item.active_sessions,
          add_to_cart: sum.add_to_cart + item.add_to_cart,
          orders_placed: sum.orders_placed + item.orders_placed,
        }),
        { active_sessions: 0, add_to_cart: 0, orders_placed: 0 },
      );
    },
    selectedCountries() {
      const groups = new Map();
      for (const item of this.selectedLocations) {
        const key = item.country_code || "";
        const group = groups.get(key) || {
          code: item.country_code,
          active_sessions: 0,
          add_to_cart: 0,
          orders_placed: 0,
        };
        group.active_sessions += item.active_sessions;
        group.add_to_cart += item.add_to_cart;
        group.orders_placed += item.orders_placed;
        groups.set(key, group);
      }
      return [...groups.values()];
    },
    selectionTitle() {
      return this.selectedCountry
        ? this.countryName(this.selectedCountry)
        : this.selectedIds.length
          ? this.selectedCountries
              .map((item) => this.countryName(item.code))
              .join(" · ")
          : this.$t("geo_map.live.worldwide");
    },
    events() {
      return (this.activity?.events || [])
        .filter(
          (event) =>
            eventIcons[event.type] &&
            Number.isFinite(event.count) &&
            event.count > 0 &&
            Number.isFinite(Date.parse(event.at)),
        )
        .slice(0, 5);
    },
    trend() {
      const rows = [...(this.activity?.trend || [])]
        .filter((row) => Number.isFinite(Date.parse(row.at)))
        .sort((a, b) => Date.parse(a.at) - Date.parse(b.at));
      if (!rows.length) return { series: [], xTicks: [], yTicks: [] };
      const start = Date.parse(this.activity.start),
        end = Date.parse(this.activity.end);
      const x = scaleLinear()
        .domain([start, Math.max(start + 1, end)])
        .range([30, this.trendWidth - 12]);
      const keys = ["add_to_cart", "orders_placed"],
        maximum = Math.max(
          1,
          ...rows.flatMap((row) =>
            keys.map((key) => (Number.isFinite(row[key]) ? row[key] : 0)),
          ),
        );
      const y = scaleLinear()
        .domain([0, maximum * 1.1])
        .nice()
        .range([158, 12]);
      return {
        yTicks: y
          .ticks(3)
          .filter(Number.isInteger)
          .map((value) => ({ value, y: y(value) })),
        xTicks: [start, (start + end) / 2, end].map((value, index) => ({
          value,
          x: x(value),
          anchor: ["start", "middle", "end"][index],
        })),
        series: keys.map((key) => ({
          key,
          path:
            line<any>()
              .defined((row) => Number.isFinite(row[key]))
              .x((row) => x(Date.parse(row.at)))
              .y((row) => y(row[key]))(rows) || "",
          points: rows
            .filter((row) => Number.isFinite(row[key]))
            .map((row) => ({
              at: row.at,
              x: x(Date.parse(row.at)),
              y: y(row[key]),
              label: `${this.time(row.at, false)} · ${this.$t("geo_map.live." + key)}: ${this.format(row[key])}`,
            })),
        })),
      };
    },
  },
  watch: {
    windowMinutes(value) {
      this.selectedMinutes = value === 15 ? 15 : 5;
    },
    shopId() {
      this.stopWatching();
      this.snapshot = null;
      this.presenceHistory = [];
      this.clearSelection();
      this.loadError = false;
      this.startWatching();
    },
  },
  mounted() {
    this.runtime.mounted = true;
    this.visible = !document.hidden;
    this.online = navigator.onLine !== false;
    this.connection = this.online ? "connecting" : "offline";
    this.runtime.media = window.matchMedia("(prefers-reduced-motion: reduce)");
    this.onMotion();
    this.runtime.media.addEventListener("change", this.onMotion);
    document.addEventListener("visibilitychange", this.onVisibility);
    window.addEventListener("online", this.onNetwork);
    window.addEventListener("offline", this.onNetwork);
    this.runtime.observer = new ResizeObserver(this.scheduleResize);
    this.runtime.observer.observe(this.$refs.mapStage);
    this.runtime.observer.observe(this.$refs.trendSvg);
    this.scheduleResize();
    this.startWatching();
  },
  beforeUnmount() {
    this.runtime.mounted = false;
    this.stopWatching();
    this.runtime.observer?.disconnect();
    cancelAnimationFrame(this.runtime.resizeFrame);
    this.runtime.resizeFrame = null;
    this.runtime.resizeGeneration++;
    select(this.$refs.mapSvg).on(".zoom", null);
    this.runtime.media?.removeEventListener("change", this.onMotion);
    document.removeEventListener("visibilitychange", this.onVisibility);
    window.removeEventListener("online", this.onNetwork);
    window.removeEventListener("offline", this.onNetwork);
  },
  methods: {
    tooltip(text) {
      return {
        text,
        location: "top",
        contentClass: "sd-modern-tooltip text-start",
        openOnFocus: true,
      };
    },
    liveUrl(shopId = this.shopId) {
      return window.API.GET_SHOP_REALTIME_DATA(shopId).replace(
        /\/real-time$/,
        "/live-view",
      );
    },
    format(value) {
      return Number.isFinite(value)
        ? new Intl.NumberFormat(this.$i18n?.locale || undefined).format(value)
        : "—";
    },
    time(value, seconds = true) {
      const date = new Date(value);
      return Number.isFinite(date.getTime())
        ? new Intl.DateTimeFormat(this.$i18n?.locale || undefined, {
            hour: "2-digit",
            minute: "2-digit",
            ...(seconds ? { second: "2-digit" } : {}),
          }).format(date)
        : "—";
    },
    countryName(code) {
      if (!code) return this.$t("geo_map.live.unknown_location");
      const key = "countries." + code,
        translated = this.$t(key);
      return translated === key ? getCountryName(code) || code : translated;
    },
    share(value) {
      return this.snapshot?.active_sessions > 0
        ? new Intl.NumberFormat(this.$i18n?.locale || undefined, {
            style: "percent",
            maximumFractionDigits: 1,
          }).format(value / this.snapshot.active_sessions)
        : "—";
    },
    clusterSummary(cluster) {
      return this.$t("geo_map.live.cluster_summary", {
        sessions: this.format(cluster.active_sessions),
        cart: this.format(cluster.add_to_cart),
        orders: this.format(cluster.orders_placed),
      });
    },
    clusterLabel(cluster) {
      return (
        (cluster.countries.length
          ? cluster.countries.map((code) => this.countryName(code)).join(" · ")
          : this.$t("geo_map.live.unknown_location")) +
        " · " +
        this.clusterSummary(cluster)
      );
    },
    miniPath(values) {
      const max = Math.max(1, ...values.filter(Number.isFinite));
      return (
        line<number>()
          .defined(Number.isFinite)
          .x((_, i) => (i * 180) / Math.max(1, values.length - 1))
          .y((value) => 22 - (value / max) * 20)(values) || ""
      );
    },
    onMotion() {
      this.reducedMotion = this.runtime.media?.matches || false;
      if (this.reducedMotion) this.pulses = [];
    },
    onVisibility() {
      this.visible = !document.hidden;
      if (this.visible) this.startWatching();
      else {
        this.stopWatching();
        this.connection = "paused";
      }
    },
    onNetwork() {
      this.online = navigator.onLine !== false;
      if (this.paused) {
        this.connection = "paused";
        return;
      }
      if (this.online) this.startWatching();
      else {
        this.stopWatching();
        this.connection = "offline";
      }
    },
    togglePause() {
      this.paused = !this.paused;
      if (this.paused) {
        this.stopWatching();
        this.connection = "paused";
      } else this.startWatching();
    },
    startWatching() {
      if (!this.shouldWatch || this.runtime.timer) return;
      this.runtime.generation++;
      this.runtime.shopId = this.shopId;
      this.runtime.viewerId = window.crypto.randomUUID();
      this.runtime.lastWatch = 0;
      this.connection = "connecting";
      this.runtime.timer = setInterval(() => {
        if (!this.shouldWatch) return this.stopWatching();
        const renew = Date.now() - this.runtime.lastWatch >= 20000;
        if (
          renew ||
          !this.runtime.subscribed ||
          Date.now() - this.runtime.lastSocket > 30000
        )
          this.requestSnapshot(renew);
      }, 10000);
      this.requestSnapshot(true);
    },
    stopWatching() {
      const { shopId, viewerId } = this.runtime;
      this.runtime.generation++;
      clearInterval(this.runtime.timer);
      clearTimeout(this.runtime.pulseTimer);
      this.runtime.timer = null;
      this.runtime.pulseTimer = null;
      this.pulses = [];
      this.loading = false;
      this.locating = false;
      for (const controller of this.runtime.controllers) controller.abort();
      this.runtime.controllers.clear();
      this.runtime.pending = false;
      this.disconnectTransport();
      this.runtime.viewerId = "";
      this.runtime.shopId = 0;
      // Best effort only; the server's 40-second lease also expires after a lost page.
      if (shopId && viewerId)
        axios
          .post(this.liveUrl(shopId) + "/watch", {
            viewer_id: viewerId,
            watching: false,
          })
          .catch(() => {});
    },
    refresh() {
      if (!this.shouldWatch) return;
      if (!this.runtime.timer) this.startWatching();
      else this.requestSnapshot(true);
    },
    async requestSnapshot(watch = false) {
      if (!this.shouldWatch || this.runtime.pending) return;
      const generation = this.runtime.generation,
        shopId = this.runtime.shopId,
        controller = new AbortController();
      this.runtime.controllers.add(controller);
      this.runtime.pending = true;
      this.loading = true;
      try {
        const base = this.liveUrl(shopId);
        const response = watch
          ? await axios.post(
              base + "/watch",
              { viewer_id: this.runtime.viewerId, watching: true },
              { signal: controller.signal },
            )
          : await axios.get(base, { signal: controller.signal });
        if (generation !== this.runtime.generation || !this.shouldWatch) return;
        if (watch) this.runtime.lastWatch = Date.now();
        this.receiveSnapshot(response.data.snapshot);
      } catch (error) {
        if (generation !== this.runtime.generation || controller.signal.aborted)
          return;
        this.loadError = true;
        this.connection = this.online ? "reconnecting" : "offline";
        // 🔒 A revoked report permission must stop protected reads and clear its view.
        if ([401, 403].includes(error.response?.status)) {
          this.stopWatching();
          this.snapshot = null;
          this.presenceHistory = [];
        }
      } finally {
        this.runtime.controllers.delete(controller);
        if (generation === this.runtime.generation) {
          this.runtime.pending = false;
          this.loading = false;
        }
      }
    },
    receiveSnapshot(snapshot: LiveSnapshot) {
      if (
        !this.shouldWatch ||
        !acceptsSnapshot(snapshot, this.shopId, this.snapshot)
      )
        return;
      const previous = this.snapshot;
      this.snapshot = snapshot;
      this.loadError = false;
      const locationIds = new Set(
        this.locations.map((location) => location.id),
      );
      this.selectedIds = this.selectedIds.filter((id) => locationIds.has(id));
      if (!previous || snapshot.as_of !== previous.as_of) {
        this.presenceHistory.push({
          at: snapshot.as_of,
          active: snapshot.active_sessions,
          signedIn: snapshot.signed_in_customers,
        });
        this.presenceHistory = this.presenceHistory.slice(-20);
        if (previous) this.eventPulses(previous, snapshot);
      }
      this.syncTransport(snapshot.transport);
    },
    disconnectTransport() {
      if (this.runtime.channel) this.runtime.echo?.leave(this.runtime.channel);
      this.runtime.echo?.disconnect();
      this.runtime.echo = null;
      this.runtime.pusher = null;
      this.runtime.channel = "";
      this.runtime.subscribed = false;
      this.runtime.lastSocket = 0;
    },
    syncTransport(transport) {
      if (!transport?.enabled) {
        this.disconnectTransport();
        this.connection = "snapshot_mode";
        return;
      }
      const host = SetupService.EchoServer(),
        port = Number(SetupService.EchoPort());
      if (
        !host ||
        !port ||
        transport.auth_endpoint !== `/shops/${this.shopId}/live-view/auth` ||
        transport.event !== ".snapshot" ||
        typeof transport.channel !== "string" ||
        !transport.channel
      ) {
        this.disconnectTransport();
        this.connection = "reconnecting";
        return;
      }
      const generation = this.runtime.generation;
      if (!this.runtime.echo) {
        const client = new Pusher("meta.socket", {
          cluster: "",
          wsHost: host,
          wsPort: port,
          wssPort: port,
          forceTLS: window.location.protocol === "https:",
          disableStats: true,
          enabledTransports: ["ws", "wss"],
          channelAuthorization: {
            customHandler: (params, callback) => {
              // 🔒 Use native session/CSRF headers only for this currently authorized topic.
              if (
                !this.shouldWatch ||
                generation !== this.runtime.generation ||
                params.channelName !== "private-" + this.runtime.channel
              ) {
                callback(new Error("Inactive live-view subscription"), null);
                return;
              }
              const controller = new AbortController();
              this.runtime.controllers.add(controller);
              axios
                .post(
                  this.liveUrl() + "/auth",
                  {
                    socket_id: params.socketId,
                    channel_name: params.channelName,
                  },
                  { signal: controller.signal },
                )
                .then(({ data }) => {
                  if (
                    generation !== this.runtime.generation ||
                    params.channelName !== "private-" + this.runtime.channel ||
                    !this.shouldWatch
                  )
                    callback(
                      new Error("Inactive live-view subscription"),
                      null,
                    );
                  else callback(null, data);
                })
                .catch(() =>
                  callback(new Error("Live-view authorization failed"), null),
                )
                .finally(() => this.runtime.controllers.delete(controller));
            },
          },
        });
        this.runtime.pusher = markRaw(client);
        // An owned connection must not install global Axios/socket interceptors.
        this.runtime.echo = markRaw(
          new Echo({
            broadcaster: "pusher",
            key: "meta.socket",
            client,
            withoutInterceptors: true,
          }),
        );
        client.connection.bind("state_change", (state) => {
          if (generation !== this.runtime.generation || !this.shouldWatch)
            return;
          if (state.current !== "connected") {
            this.runtime.subscribed = false;
            this.connection = this.online ? "reconnecting" : "offline";
          }
        });
      }
      if (transport.channel === this.runtime.channel) {
        if (this.runtime.subscribed) this.connection = "live";
        return;
      }
      if (this.runtime.channel) this.runtime.echo.leave(this.runtime.channel);
      this.runtime.channel = transport.channel;
      this.runtime.subscribed = false;
      this.connection = "connecting";
      const channel = transport.channel;
      this.runtime.echo
        .private(channel)
        .subscribed(() => {
          if (
            generation === this.runtime.generation &&
            channel === this.runtime.channel &&
            this.shouldWatch
          ) {
            this.runtime.subscribed = true;
            this.runtime.lastSocket = Date.now();
            this.connection = "live";
          }
        })
        .error(() => {
          if (
            generation === this.runtime.generation &&
            channel === this.runtime.channel &&
            this.shouldWatch
          ) {
            this.runtime.subscribed = false;
            this.connection = "reconnecting";
          }
        })
        .listen(".snapshot", (event) => {
          if (
            generation === this.runtime.generation &&
            channel === this.runtime.channel &&
            this.shouldWatch
          ) {
            this.runtime.lastSocket = Date.now();
            this.receiveSnapshot(event.snapshot);
          }
        });
    },
    eventPulses(previous, snapshot) {
      if (this.reducedMotion || snapshot.sequence <= previous.sequence) return;
      const prior = new Map(
          liveLocations(previous, this.selectedMinutes).map((item) => [
            item.id,
            item,
          ]),
        ),
        pulses = [];
      for (const location of liveLocations(snapshot, this.selectedMinutes)) {
        const old = prior.get(location.id);
        for (const type of ["add_to_cart", "orders_placed"]) {
          if (location[type] <= (old?.[type] || 0)) continue;
          const point = this.projection([location.lon, location.lat]);
          if (point)
            pulses.push({
              key: `${snapshot.sequence}:${location.id}:${type}`,
              x: point[0],
              y: point[1],
              type,
            });
        }
      }
      this.pulses = pulses;
      clearTimeout(this.runtime.pulseTimer);
      this.runtime.pulseTimer = setTimeout(() => {
        this.pulses = [];
      }, 1300);
    },
    scheduleResize() {
      if (!this.runtime.mounted || this.runtime.resizeFrame !== null) return;
      this.runtime.resizeFrame = requestAnimationFrame(() => {
        this.runtime.resizeFrame = null;
        this.resize();
      });
    },
    resize() {
      if (!this.runtime.mounted) return;
      const stage = this.$refs.mapStage,
        trend = this.$refs.trendSvg,
        svg = this.$refs.mapSvg,
        width = stage?.clientWidth,
        height = stage?.clientHeight || 350,
        mapChanged =
          width && (width !== this.mapWidth || height !== this.mapHeight),
        trendWidth = trend?.clientWidth;
      if (trendWidth && trendWidth !== this.trendWidth)
        this.trendWidth = trendWidth;
      if (!width || !svg || (!mapChanged && this.runtime.zoom)) return;
      this.mapWidth = width;
      this.mapHeight = height;
      const generation = ++this.runtime.resizeGeneration;
      this.$nextTick(() => {
        if (
          !this.runtime.mounted ||
          generation !== this.runtime.resizeGeneration ||
          svg !== this.$refs.mapSvg
        )
          return;
        this.runtime.zoom = zoom()
          .extent([
            [0, 0],
            [this.mapWidth, this.mapHeight],
          ])
          .translateExtent([
            [0, 0],
            [this.mapWidth, this.mapHeight],
          ])
          .scaleExtent([1, 5])
          .on("zoom", (event) => {
            this.transform = {
              x: event.transform.x,
              y: event.transform.y,
              k: event.transform.k,
            };
          });
        select(svg)
          .call(this.runtime.zoom)
          .call(this.runtime.zoom.transform, zoomIdentity);
      });
    },
    mapAction(action) {
      const svg = select(this.$refs.mapSvg);
      if (!this.runtime.zoom) return;
      if (action === "fit") {
        svg.call(this.runtime.zoom.transform, zoomIdentity);
        this.clearSelection();
      } else if (action === "locate") this.locate();
      else svg.call(this.runtime.zoom.scaleBy, action === "in" ? 1.5 : 1 / 1.5);
    },
    locate() {
      if (!navigator.geolocation) {
        this.geoError = true;
        return;
      }
      const generation = this.runtime.generation;
      this.locating = true;
      this.geoError = false;
      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (generation !== this.runtime.generation || !this.runtime.mounted)
            return;
          this.locating = false;
          this.userLocation = [
            position.coords.longitude,
            position.coords.latitude,
          ];
          const point = this.projection(this.userLocation);
          if (point)
            select(this.$refs.mapSvg).call(
              this.runtime.zoom.transform,
              zoomIdentity
                .translate(
                  this.mapWidth / 2 - point[0] * 2,
                  this.mapHeight / 2 - point[1] * 2,
                )
                .scale(2),
            );
        },
        () => {
          if (generation === this.runtime.generation) {
            this.locating = false;
            this.geoError = true;
          }
        },
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 },
      );
    },
    selectCluster(cluster: LiveCluster) {
      this.selectedCountry = null;
      this.selectedIds = [...cluster.ids];
    },
    selectCountry(code) {
      this.selectedCountry = code;
      this.selectedIds = [];
    },
    clearSelection() {
      this.selectedIds = [];
      this.selectedCountry = null;
    },
  },
};
</script>
<style lang="scss" scoped>
.b-live-view.b-live-view--report {
  grid-template-columns: minmax(0, 1.05fr) minmax(0, 1fr);
  grid-template-areas: "header header" "metrics metrics" "notices notices" "map countries" "events trend";
  gap: 0;

  .sd-modern-widget {
    font-size: 13px;
  }
  .sd-modern-title-text {
    font-size: 18px;
    font-weight: 600;
    line-height: 26px;
  }
  .b-live-view__report-header {
    grid-area: header;
    margin: 0;
    padding: 22px 22px 0;
    border-block-end: 0;
    border-end-start-radius: 0;
    border-end-end-radius: 0;
  }
  .b-live-view__report-window select {
    min-height: 36px;
    padding: 6px 0;
    color: inherit;
    background: transparent;
    border: 0;
    font: inherit;
    font-size: 12px;
  }
  .b-live-view__report-window option {
    background: rgb(var(--v-theme-surface));
  }
  .b-live-view__metrics {
    grid-area: metrics;
    margin: 0;
    border-block: 0;
    border-radius: 0;
    padding: 18px 22px;
    row-gap: 0;
  }
  .b-live-view__metric {
    display: grid;
    grid-template-rows: subgrid;
    grid-row: span 4;
  }
  .b-live-view__metric + .b-live-view__metric {
    border-inline-start: 1px solid var(--sd-modern-border);
    padding-inline-start: 20px;
  }
  .b-live-view__metric-label {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    min-block-size: 28px;
    font-size: 12px;
    line-height: 18px;
    align-items: center;
  }
  .b-live-view__metric strong {
    font-size: 25px;
    line-height: 32px;
    margin-block: 3px;
  }
  .b-live-view__metric p {
    font-size: 11px;
  }
  .b-live-view__spark {
    margin-block-start: 8px;
  }
  .b-live-view__activity,
  .b-live-view__map-layout,
  .b-live-view__bottom {
    display: contents;
  }
  .b-live-view__report-notices {
    grid-area: notices;
    background: rgb(var(--v-theme-surface));
    border-inline: 1px solid var(--sd-modern-border);
    padding-inline: 22px;
  }
  .b-live-view__map-side {
    grid-area: map;
    padding: 4px 22px 22px;
    border-block-start: 0;
    border-inline-end: 0;
    border-radius: 0;
    border-end-start-radius: 18px;
  }
  .b-live-view__countries {
    grid-area: countries;
    padding: 4px 22px 22px;
    border-block-start: 0;
    border-inline-start: 0;
    border-radius: 0;
    border-end-end-radius: 18px;
  }
  .b-live-view__countries .sd-modern-header {
    margin-block-end: 12px;
  }
  .b-live-view__countries .sd-modern-title-text {
    font-size: 13px;
    font-weight: 500;
    line-height: 20px;
  }
  .b-live-view__countries .sd-modern-subtitle {
    font-size: 11px;
  }
  .b-live-view__map-stage {
    height: 330px;
  }
  .b-live-view__map-controls {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    inset-inline: auto 4px;
    inset-block-start: 4px;
  }
  .b-live-view__location-detail {
    padding-inline: 0;
    border-radius: 0;
    background: transparent;
    border-block-start: 1px solid var(--sd-modern-border);
  }
  .b-live-view__events {
    grid-area: events;
    margin-block-start: 18px;
    padding: 22px;
    border-inline-end: 0;
    border-start-end-radius: 0;
    border-end-end-radius: 0;
  }
  .b-live-view__events h3 {
    font-size: 18px;
    font-weight: 600;
    line-height: 26px;
  }
  .b-live-view__events li {
    padding-block: 10px;
  }
  .b-live-view__events ol {
    display: block;
  }
  .b-live-view__secondary {
    display: block;
  }
  .b-live-view__bottom > section:first-child {
    grid-area: trend;
    margin-block-start: 18px;
    padding: 22px;
    border-inline-start: 0;
    border-start-start-radius: 0;
    border-end-start-radius: 0;
  }
  .b-live-view__countries td button {
    min-height: 44px;
  }
  .b-live-view__countries .sd-modern-table td {
    padding-block: 0;
    font-size: 12px;
  }

  @media (max-width: 780px) {
    grid-template-columns: minmax(0, 1fr);
    grid-template-areas: "header" "metrics" "notices" "map" "countries" "events" "trend";
    .b-live-view__map-side {
      border-inline-end: 1px solid var(--sd-modern-border);
      border-radius: 0;
    }
    .b-live-view__countries {
      border-inline-start: 1px solid var(--sd-modern-border);
      border-block-start: 0;
      border-start-start-radius: 0;
      border-start-end-radius: 0;
      border-end-start-radius: 18px;
      border-end-end-radius: 18px;
    }
    .b-live-view__events {
      border-inline-end: 1px solid var(--sd-modern-border);
      border-end-start-radius: 0;
      border-end-end-radius: 0;
      border-start-start-radius: 18px;
      border-start-end-radius: 18px;
    }
    .b-live-view__bottom > section:first-child {
      margin-block-start: 0;
      border-inline-start: 1px solid var(--sd-modern-border);
      border-block-start: 0;
      border-start-start-radius: 0;
      border-start-end-radius: 0;
      border-end-start-radius: 18px;
      border-end-end-radius: 18px;
    }
  }
  @media (max-width: 600px) {
    .b-live-view__metric-label {
      min-block-size: 44px;
    }
    .b-live-view__report-header {
      padding: 17px 15px 0;
    }
    .b-live-view__metrics {
      padding: 18px 15px;
      gap: 0 15px;
    }
    .b-live-view__metric + .b-live-view__metric {
      border-inline-start: 0;
      padding-inline-start: 0;
    }
    .b-live-view__metric:nth-child(n + 3) {
      margin-block-start: 15px;
    }
    .b-live-view__map-stage {
      height: 270px;
    }
    .b-live-view__map-side,
    .b-live-view__countries,
    .b-live-view__events,
    .b-live-view__bottom > section:first-child {
      padding-inline: 15px;
    }
    .b-live-view__report-notices {
      padding-inline: 15px;
    }
  }
  @media (max-width: 600px), (pointer: coarse) {
    .b-live-view__report-window select {
      min-height: 44px;
      font-size: 16px;
    }
  }
}
.b-live-view {
  --live-cart: rgb(var(--v-theme-warning));
  --live-order: rgb(var(--v-theme-success));
  display: grid;
  gap: 20px;
  min-width: 0;
  font-family: inherit;
  font-size: 13px;
  .sd-modern-widget {
    min-width: 0;
  }
  .sd-modern-header {
    align-items: start;
  }
  .sd-modern-title-text {
    font-size: 18px;
  }
  .sd-modern-subtitle {
    font-size: 13px;
  }
  &__window {
    display: flex;
    justify-content: end;
  }
  &__window label {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    color: var(--sd-modern-muted);
  }
  &__window select {
    padding: 8px;
    color: rgb(var(--v-theme-on-surface));
    background: transparent;
    border: 0;
    font: inherit;
  }
  &__window option {
    background: rgb(var(--v-theme-surface));
  }
  &__metrics {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 24px;
  }
  &__metric {
    min-width: 0;
  }
  &__metric-label {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 4px;
    color: var(--sd-modern-muted);
    font-size: 13px;
  }
  &__metric strong {
    display: block;
    margin-block: 8px 2px;
    font-size: 28px;
    line-height: 1.3;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
  }
  &__metric p {
    margin: 0;
    color: var(--sd-modern-muted);
    font-size: 12px;
  }
  &__spark {
    display: block;
    width: 100%;
    height: 24px;
    margin-block-start: 12px;
    overflow: visible;
  }
  &__spark path {
    fill: none;
    stroke: rgb(var(--v-theme-primary));
    stroke-width: 1.5;
    stroke-linejoin: round;
    vector-effect: non-scaling-stroke;
  }
  &__spark.add_to_cart path {
    stroke: var(--live-cart);
  }
  &__spark.orders_placed path {
    stroke: var(--live-order);
  }
  &__connection {
    display: flex;
    flex-wrap: wrap;
    gap: 8px 12px;
    margin-block: 6px 0;
    color: var(--sd-modern-muted);
    font-size: 12px;
    font-weight: 400;
  }
  &__connected .sd-modern-status__dot {
    background: rgb(var(--v-theme-success));
  }
  &__notice {
    margin-block-end: 16px;
  }
  &__notice p {
    margin: 0;
  }
  &__notice-copy {
    margin: 10px 0 0;
    color: var(--sd-modern-muted);
    font-size: 12px;
    line-height: 1.6;
  }
  &__map-layout {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 270px;
    gap: 20px;
  }
  &__map-side {
    min-width: 0;
  }
  &__map-stage {
    position: relative;
    height: 350px;
    overflow: hidden;
    isolation: isolate;
  }
  &__world {
    display: block;
    width: 100%;
    height: 100%;
    touch-action: none;
  }
  &__land path {
    fill: rgba(var(--v-theme-on-surface), 0.065);
    stroke: rgb(var(--v-theme-surface));
    stroke-width: 0.6;
    vector-effect: non-scaling-stroke;
  }
  &__markers {
    position: absolute;
    inset: 0;
    pointer-events: none;
    direction: ltr;
  }
  &__marker {
    position: absolute;
    transform: translate(-50%, -50%);
    display: grid;
    place-items: center;
    min-width: 44px;
    height: 44px;
    padding: 4px;
    pointer-events: auto;
    border: 0;
    border-radius: 50%;
    color: rgb(var(--v-theme-primary));
    background: transparent;
    font: inherit;
    font-size: 12px;
    font-variant-numeric: tabular-nums;
  }
  &__marker > span {
    position: relative;
    display: grid;
    place-items: center;
    min-width: 36px;
    height: 36px;
    padding: 4px;
    border: 1px solid rgba(var(--v-theme-primary), 0.3);
    border-radius: 50%;
    background: rgb(var(--v-theme-surface));
    box-shadow: 0 2px 8px rgba(var(--v-theme-on-surface), 0.08);
  }
  &__marker.has-cart > span::after {
    content: "";
    position: absolute;
    inset: -4px;
    border: 1px solid var(--live-cart);
    border-radius: 50%;
    pointer-events: none;
  }
  &__marker.has-order > span {
    box-shadow: 3px 3px 0 color-mix(in srgb, var(--live-order) 55%, transparent);
  }
  &__marker.is-selected > span {
    color: rgb(var(--v-theme-surface));
    background: rgb(var(--v-theme-primary));
  }
  &__user-point {
    position: absolute;
    width: 10px;
    height: 10px;
    border: 2px solid rgb(var(--v-theme-surface));
    border-radius: 50%;
    background: rgb(var(--v-theme-primary));
    transform: translate(-50%, -50%);
  }
  &__map-controls {
    position: absolute;
    inset-inline-end: 5px;
    inset-block-start: 8px;
    display: grid;
    gap: 4px;
  }
  &__map-controls .sd-modern-icon-button {
    background: rgb(var(--v-theme-surface));
  }
  &__map-credit {
    position: absolute;
    inset-inline-start: 6px;
    inset-block-end: 4px;
    color: var(--sd-modern-muted);
    font-size: 11px;
  }
  &__map-empty {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 24px 48px;
    pointer-events: none;
    text-align: center;
  }
  &__map-empty strong {
    font-size: 15px;
    font-weight: 500;
  }
  &__map-empty span {
    color: var(--sd-modern-muted);
    font-size: 12px;
  }
  &__map-key {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px 14px;
    margin-block: 8px 12px;
    color: var(--sd-modern-muted);
    font-size: 12px;
  }
  &__map-key > span {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
  &__map-key small {
    margin-inline-start: auto;
    font-size: 12px;
  }
  &__key-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: rgb(var(--v-theme-primary));
  }
  &__key-ring {
    width: 9px;
    height: 9px;
    border: 1px solid var(--live-cart);
    border-radius: 50%;
  }
  &__key-square {
    width: 7px;
    height: 7px;
    border-radius: 1px;
    background: var(--live-order);
  }
  &__location-detail {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    border-radius: 9px;
    background: var(--sd-modern-inset);
    font-size: 12px;
  }
  &__location-detail > div {
    min-width: 0;
    flex: 1;
  }
  &__location-detail strong {
    display: flex;
    align-items: center;
    gap: 5px;
    font-weight: 500;
  }
  &__location-detail p {
    margin: 4px 0 0;
    color: var(--sd-modern-muted);
  }
  &__location-detail:has(ul) {
    flex-wrap: wrap;
  }
  &__country-subtotals {
    width: 100%;
    margin: 0;
    padding: 0;
    list-style: none;
  }
  &__country-subtotals li {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    gap: 4px 12px;
    padding-block: 5px;
  }
  &__country-subtotals li > span:first-child {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  &__events {
    min-width: 0;
    padding-inline-start: 20px;
    border-inline-start: 1px solid var(--sd-modern-border);
  }
  &__events > header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }
  &__events h3 {
    margin: 0;
    font-size: 14px;
    font-weight: 500;
  }
  &__event-scope {
    margin: 3px 0 6px;
    color: var(--sd-modern-muted);
    font-size: 12px;
  }
  &__events ol {
    margin: 0;
    padding: 0;
    list-style: none;
  }
  &__events li {
    display: grid;
    grid-template-columns: 18px minmax(0, 1fr) auto;
    align-items: start;
    gap: 8px;
    padding-block: 12px;
    border-block-end: 1px solid var(--sd-modern-border);
  }
  &__events li > .v-icon {
    margin-block-start: 2px;
    color: var(--sd-modern-muted);
  }
  &__events li p {
    margin: 0;
    font-size: 13px;
    line-height: 1.5;
  }
  &__events li p span {
    margin-inline-start: 5px;
    font-variant-numeric: tabular-nums;
  }
  &__events li small {
    display: flex;
    align-items: center;
    gap: 5px;
    margin-block-start: 3px;
    color: var(--sd-modern-muted);
    font-size: 12px;
  }
  &__events time {
    padding-block-start: 2px;
    color: var(--sd-modern-muted);
    font-size: 11px;
    white-space: nowrap;
  }
  &__secondary {
    margin: 14px 0 0;
  }
  &__secondary > div {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    padding-block: 5px;
  }
  &__secondary dt {
    display: flex;
    align-items: center;
    gap: 4px;
    color: var(--sd-modern-muted);
    font-size: 12px;
  }
  &__secondary dd {
    margin: 0;
    font-size: 13px;
    font-weight: 400;
    font-variant-numeric: tabular-nums;
  }
  &__bottom {
    display: grid;
    grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
    gap: 20px;
  }
  &__trend {
    display: block;
    width: 100%;
    height: 190px;
    overflow: visible;
  }
  &__chart-grid line {
    stroke: var(--sd-modern-border);
    stroke-dasharray: 2 4;
  }
  &__chart-grid text,
  &__chart-label {
    fill: var(--sd-modern-muted);
    font-size: 11px;
  }
  &__trend-line {
    fill: none;
    stroke-width: 1.7;
    stroke-linejoin: round;
  }
  &__trend .add_to_cart {
    stroke: var(--live-cart);
    fill: var(--live-cart);
  }
  &__trend .orders_placed {
    stroke: var(--live-order);
    fill: var(--live-order);
  }
  &__trend circle {
    stroke: rgb(var(--v-theme-surface));
    stroke-width: 1.5;
  }
  &__trend-key {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 8px 18px;
    margin-block-start: 8px;
  }
  &__trend-key button {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px;
    border-radius: 7px;
    color: var(--sd-modern-muted);
    font: inherit;
    font-size: 12px;
  }
  &__trend-key i {
    width: 14px;
    height: 2px;
    background: var(--live-cart);
  }
  &__trend-key .orders_placed i {
    background: var(--live-order);
  }
  &__trend-key .is-muted {
    opacity: 0.5;
  }
  &__table-scroll {
    max-height: 290px;
    overflow-y: auto;
  }
  &__countries table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
  }
  &__countries th,
  &__countries td {
    padding: 3px 0;
    text-align: start;
    border-block-end: 1px solid var(--sd-modern-border);
  }
  &__countries th:nth-child(n + 2),
  &__countries td:nth-child(n + 2) {
    text-align: end;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }
  &__countries td:nth-child(n + 2) {
    font-weight: 400;
  }
  &__countries td button {
    display: flex;
    align-items: center;
    gap: 7px;
    min-height: 38px;
    padding: 4px 7px;
    margin-inline-start: -7px;
    color: inherit;
    border-radius: 7px;
    font: inherit;
    text-align: start;
  }
  &__countries td button:hover {
    background: var(--sd-modern-inset);
  }
  &__countries td button.sd-modern-clickable-item {
    padding-inline: 12px;
    margin-inline-start: -12px;
  }
  &__pulse {
    fill: none;
    stroke: var(--live-cart);
    stroke-width: 2;
    vector-effect: non-scaling-stroke;
    transform-box: fill-box;
    transform-origin: center;
    animation: live-view-pulse 1.1s ease-out 1;
  }
  &__pulse.orders_placed {
    stroke: var(--live-order);
  }
  button:focus-visible,
  select:focus-visible,
  circle:focus-visible,
  time:focus-visible {
    outline: 2px solid rgb(var(--v-theme-primary));
    outline-offset: 3px;
  }
  @keyframes live-view-pulse {
    from {
      transform: scale(1);
      opacity: 0.85;
    }
    to {
      transform: scale(3);
      opacity: 0;
    }
  }
  @media (max-width: 1000px) {
    &__map-layout {
      grid-template-columns: minmax(0, 1fr);
    }
    &__events {
      border-inline-start: 0;
      padding-inline-start: 0;
      border-block-start: 1px solid var(--sd-modern-border);
      padding-block-start: 16px;
    }
    &__events ol {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      column-gap: 20px;
    }
    &__secondary {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      gap: 10px 20px;
    }
    &__bottom {
      grid-template-columns: minmax(0, 1fr);
    }
  }
  @media (max-width: 600px) {
    &__metrics {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 20px 14px;
    }
    &__metric strong {
      font-size: 26px;
    }
    &__map-stage {
      height: 285px;
    }
    &__map-empty {
      padding-inline-start: 16px;
      padding-inline-end: 58px;
    }
    &__marker {
      min-width: 44px;
      height: 44px;
    }
    &__map-key small {
      width: 100%;
      margin: 0;
    }
    &__events ol {
      grid-template-columns: minmax(0, 1fr);
    }
    &__secondary {
      display: block;
    }
    &__countries td button,
    &__trend-key button,
    &__window select {
      min-height: 44px;
    }
    &__location-detail {
      align-items: start;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    &__pulse {
      animation: none;
      display: none;
    }
  }
  @media (max-width: 380px) {
    &__metric-label {
      min-block-size: 88px;
      align-content: start;
      align-items: start;
      line-height: 1.5;
    }
  }
}
</style>
