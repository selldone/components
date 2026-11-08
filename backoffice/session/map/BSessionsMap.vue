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
  <div
    class="b-sessions-map position-relative d-flex flex-column"
    :class="{
      'b-sessions-map--summary': summary,
      'b-sessions-map--modern': modern,
      'b-sessions-map--report': report,
      'b-sessions-map--audience': modern && audience,
    }"
  >
    <template v-if="summary">
      <u-loading-ellipsis
        v-if="busy && !timeSeries"
        class="ma-auto"
        style="min-height: 180px"
      />
      <template v-if="timeSeries">
        <div class="b-sessions-map__summary-head">
          <div class="b-sessions-map__summary-total">
            <span class="sd-modern-eyebrow">{{
              activityLabel || $t("shop_session_widget.total_sessions")
            }}</span>
            <strong>{{ numeralFormat(total_sessions_map, "0,0.[0]a") }}</strong>
          </div>
          <div class="b-sessions-map__summary-period">
            <u-time-span-selector
              v-if="!externalFeed"
              :date-range="report_selector_range"
              :max-days="90"
              variant="text"
              button-class="sd-modern-button sd-modern-button--inline sd-modern-button--secondary"
              menu-class="sd-modern-select-menu"
              @select="selectReportPeriod"
            />
            <span class="b-sessions-map__report-dates">
              {{ getLocalDateString(report_start) }} –
              {{ getLocalDateString(report_end) }}
            </span>
          </div>
        </div>
        <v-progress-linear
          v-if="busy"
          indeterminate
          color="on-surface"
          height="2"
          class="b-sessions-map__summary-busy"
        />
        <!-- Where the sessions came from: the color scale, a hover card per country and the top three. -->
        <div class="b-sessions-map__summary-map" :class="{ disabled: busy }">
          <div
            v-if="!total_sessions_map && !busy"
            class="b-sessions-map__map-note"
            role="status"
          >
            <strong>{{
              $t("admin_shop.dashboard.modern.placeholder_title")
            }}</strong>
            <span>{{ $t("admin_shop.dashboard.modern.placeholder_map") }}</span>
          </div>
          <u-map-countries-heatmap
            :country-data="map_data"
            :high-color="h_color"
            :low-color="modern_map_colors.low"
            :country-stroke-color="modern_map_colors.stroke"
            :default-country-fill-color="modern_map_colors.empty"
            has-tooltip
            class="b-sessions-map__world"
          >
            <template v-slot="{ country }">
              <div
                v-if="country"
                class="b-sessions-map__tip sd-modern-chart-colors"
              >
                <strong>{{
                  numeralFormat(getCountrySessions(country), "0,0")
                }}</strong>
                <span>{{ $t("global.commons.sessions") }}</span>
                <span class="b-sessions-map__tip-meta"
                  >{{ countryShare(country) }} ·
                  {{ countryRank(country) }}</span
                >
                <time-series-inline-chart
                  :colors="[h_color]"
                  :days="days"
                  :height="34"
                  :keys="[country]"
                  :offset_day="offset"
                  :time-series="timeSeries"
                  :value-titles="[getCountryName(country)]"
                  class="b-sessions-map__tip-trend"
                  dir="ltr"
                  flat-color
                  type="line"
                />
              </div>
            </template>
          </u-map-countries-heatmap>
          <div class="b-sessions-map__map-key" aria-hidden="true">
            <span>{{ $t("shop_session_widget.modern.fewer") }}</span
            ><span
              class="b-sessions-map__map-scale"
              :style="{
                '--session-map-low': modern_map_colors.low,
                '--session-map-high': h_color,
              }"
            /><span>{{ $t("shop_session_widget.modern.more_sessions") }}</span>
          </div>
        </div>
        <ol
          v-if="top_countries.length"
          class="b-sessions-map__summary-countries"
        >
          <li v-for="item in top_countries.slice(0, 3)" :key="item[0]">
            <flag :iso="item[0]" :squared="false" />
            <span class="b-sessions-map__country-name">{{
              getCountryName(item[0])
            }}</span>
            <span class="b-sessions-map__share">{{
              countryShare(item[0])
            }}</span>
          </li>
        </ol>
        <dl class="b-sessions-map__devices">
          <div
            v-for="type in types"
            :key="type.code"
            class="b-sessions-map__device"
          >
            <dt>
              <v-icon :icon="type.icon" size="17" aria-hidden="true" />
              {{ $t(type.title) }}
            </dt>
            <dd>
              <strong>{{
                numeralFormat(timeSeries.totalOf(type.code), "0,0.[0]a")
              }}</strong>
              <span
                >{{
                  (total_sessions_keys
                    ? (100 * timeSeries.totalOf(type.code)) /
                      total_sessions_keys
                    : 0
                  ).toFixed(1)
                }}%</span
              >
            </dd>
            <div class="b-sessions-map__device-track" aria-hidden="true">
              <span
                :style="{
                  width: `${total_sessions_keys ? (100 * timeSeries.totalOf(type.code)) / total_sessions_keys : 0}%`,
                  backgroundColor: type.color,
                }"
              />
            </div>
          </div>
        </dl>
      </template>
    </template>
    <template v-else-if="modern">
      <u-loading-ellipsis
        v-if="busy && !timeSeries && !report"
        class="ma-auto"
        style="min-height: 260px"
      />
      <template v-if="timeSeries || report">
        <div v-if="!audience || !externalFeed" class="b-sessions-map__overview">
          <div v-if="report" class="sd-modern-title">
            <v-icon class="sd-modern-icon--plain" size="20" aria-hidden="true"
              >public</v-icon
            >
            <div>
              <h2 class="sd-modern-title-text">
                {{ $t("shop_session_widget.modern.title") }}
              </h2>
              <p class="sd-modern-subtitle">
                {{ $t("shop_session_widget.modern.subtitle") }}
              </p>
            </div>
          </div>
          <div v-else-if="!audience">
            <span class="sd-modern-label">{{
              activityLabel || $t("shop_session_widget.total_sessions")
            }}</span>
            <strong>{{ numeralFormat(total_sessions_map, "0,0.[0]a") }}</strong>
          </div>
          <div v-if="!report && !audience">
            <span class="sd-modern-label">{{
              $t("global.commons.countries")
            }}</span>
            <strong>{{ numeralFormat(countries_count, "0,0") }}</strong>
          </div>
          <div v-if="!externalFeed" class="b-sessions-map__report-controls">
            <u-time-span-selector
              :menu-class="report ? 'sd-modern-select-menu' : undefined"
              :date-range="report_selector_range"
              :max-days="90"
              variant="text"
              :button-class="
                report
                  ? 'sd-modern-button sd-modern-button--inline sd-modern-button--secondary'
                  : 'sd-modern-button sd-modern-button--secondary'
              "
              @select="selectReportPeriod"
            />
            <span class="b-sessions-map__report-dates">
              {{ getLocalDateString(report_start) }} –
              {{ getLocalDateString(report_end) }}
            </span>
            <v-progress-linear
              v-if="busy"
              indeterminate
              color="on-surface"
              height="2"
            />
          </div>
        </div>
        <div
          v-if="report && fetch_error"
          class="sd-modern-notice b-sessions-map__error"
          role="alert"
        >
          <v-icon size="18" aria-hidden="true">info_outline</v-icon>
          <span>{{ $t("shop_session_widget.modern.load_error") }}</span>
          <v-btn
            class="sd-modern-button sd-modern-button--inline"
            variant="text"
            @click="fetchShopSessions(offset, days)"
            >{{ $t("global.actions.refresh") }}</v-btn
          >
        </div>
        <u-loading-ellipsis
          v-if="report && busy && !timeSeries"
          style="min-height: 260px"
          class="ma-auto"
        />
        <div
          v-if="timeSeries"
          class="b-sessions-map__geography"
          :class="{ disabled: busy }"
        >
          <section class="b-sessions-map__map-panel">
            <header class="b-sessions-map__section-header">
              <div
                v-if="report || audience"
                class="b-sessions-map__geographic-total"
              >
                <span class="sd-modern-label"
                  >{{
                    activityLabel ||
                    $t("shop_session_widget.modern.geographic_sessions")
                  }}
                  <v-btn
                    v-if="!activityLabel"
                    class="sd-modern-icon-button sd-modern-info-button"
                    icon
                    variant="text"
                    :aria-label="
                      $t('shop_session_widget.modern.geographic_help')
                    "
                  >
                    <v-icon size="14">info_outline</v-icon>
                    <v-tooltip
                      activator="parent"
                      location="top"
                      open-on-click
                      open-on-focus
                      interactive
                      :max-width="audience ? undefined : 360"
                      content-class="sd-modern-tooltip text-start"
                      >{{
                        $t("shop_session_widget.modern.geographic_help")
                      }}</v-tooltip
                    >
                  </v-btn>
                </span>
                <strong>{{
                  numeralFormat(total_sessions_map, "0,0.[0]a")
                }}</strong>
              </div>
              <h3 v-else class="sd-modern-eyebrow">
                {{ $t("admin_shop.dashboard.modern.session_geography") }}
              </h3>
              <u-smart-toggle
                v-if="shop"
                v-model="service_countries"
                :true-description="$t('global.commons.service_area')"
                class="b-sessions-map__coverage"
                color="success"
                false-gray
                role="switch"
                tabindex="0"
                :aria-checked="service_countries"
                :aria-label="$t('global.commons.service_area')"
                @change="play = false"
                @keydown.space.prevent="
                  service_countries = !service_countries;
                  play = false;
                "
                @keydown.enter.prevent="
                  service_countries = !service_countries;
                  play = false;
                "
              />
            </header>
            <u-map-countries-heatmap
              :country-data="
                service_countries
                  ? map_data_service
                  : ma_data_selected_day
                    ? countriesOf(ma_data_selected_day)
                    : map_data
              "
              :high-color="h_color"
              :low-color="modern_map_colors.low"
              :country-stroke-color="modern_map_colors.stroke"
              :default-country-fill-color="modern_map_colors.empty"
              has-tooltip
              class="b-sessions-map__world"
              @click="(report || audience) && selectCountryFromMap($event)"
            >
              <template v-slot="{ country }">
                <slot :country="country" />
                <div
                  v-if="country && (dashboard || report)"
                  class="b-sessions-map__tip sd-modern-chart-colors"
                >
                  <strong>{{
                    numeralFormat(getCountrySessions(country), "0,0")
                  }}</strong>
                  <span>{{ $t("global.commons.sessions") }}</span>
                  <span class="b-sessions-map__tip-meta"
                    >{{ countryShare(country) }} ·
                    {{ countryRank(country) }}</span
                  >
                  <time-series-inline-chart
                    :colors="[h_color]"
                    :days="days"
                    :height="34"
                    :keys="[country]"
                    :offset_day="offset"
                    :time-series="timeSeries"
                    :value-titles="[getCountryName(country)]"
                    class="b-sessions-map__tip-trend"
                    dir="ltr"
                    flat-color
                    type="line"
                  />
                </div>
                <div v-else-if="country" class="text-start">
                  <p class="mb-1">
                    {{ activityLabel || $t("global.commons.sessions") }}:
                    <strong>{{
                      numeralFormat(getCountrySessions(country), "0,0.[0]a")
                    }}</strong>
                  </p>
                  <time-series-inline-chart
                    v-if="fullDetails"
                    :colors="['#1976D2']"
                    :days="days"
                    :height="30"
                    :keys="[country]"
                    :offset_day="offset"
                    :time-series="timeSeries"
                    :value-titles="[getCountryName(country)]"
                    flat-color
                    type="line"
                  />
                </div>
              </template>
            </u-map-countries-heatmap>
            <div
              v-if="dashboard && !total_sessions_map && !busy"
              class="b-sessions-map__map-note"
              role="status"
            >
              <strong>{{
                $t("admin_shop.dashboard.modern.placeholder_title")
              }}</strong>
              <span>{{
                $t("admin_shop.dashboard.modern.placeholder_map")
              }}</span>
            </div>
            <div
              v-if="dashboard && !service_countries"
              class="b-sessions-map__map-key"
              aria-hidden="true"
            >
              <span>{{ $t("shop_session_widget.modern.fewer") }}</span
              ><span
                class="b-sessions-map__map-scale"
                :style="{
                  '--session-map-low': modern_map_colors.low,
                  '--session-map-high': h_color,
                }"
              /><span>{{
                $t("shop_session_widget.modern.more_sessions")
              }}</span>
            </div>
            <!-- Dashboard and CRM Report: a strip of daily sessions; point at a day to preview it, select to keep it. -->
            <div
              v-if="fullDetails && (dashboard || report) && day_bars.length"
              class="b-sessions-map__days"
            >
              <div class="b-sessions-map__days-head">
                <span>{{
                  ma_data_selected_day
                    ? getLocalDateString(ma_data_selected_day.created_at)
                    : $t("admin_shop.dashboard.modern.session_all_days")
                }}</span>
                <span
                  v-if="ma_data_selected_day"
                  class="b-sessions-map__count"
                  >{{
                    numeralFormat(day_total(ma_data_selected_day), "0,0")
                  }}</span
                >
                <v-btn
                  v-if="custom_selected_day >= 0"
                  class="sd-modern-button sd-modern-button--inline"
                  variant="text"
                  size="small"
                  @click="custom_selected_day = -1"
                  >{{
                    $t("admin_shop.dashboard.modern.session_all_days")
                  }}</v-btn
                >
              </div>
              <div
                ref="dayBars"
                class="b-sessions-map__days-bars"
                role="group"
                :aria-label="$t('admin_shop.dashboard.modern.session_map_day')"
                @mouseleave="day_preview = null"
                @keydown="onDayKey"
              >
                <button
                  v-for="bar in day_bars"
                  :key="bar.day"
                  type="button"
                  class="b-sessions-map__day"
                  :class="{
                    '-selected': custom_selected_day === bar.day,
                    '-dimmed':
                      custom_selected_day >= 0 &&
                      custom_selected_day !== bar.day,
                  }"
                  :tabindex="bar.day === day_focus ? 0 : -1"
                  :aria-pressed="custom_selected_day === bar.day"
                  :aria-label="`${bar.date}: ${numeralFormat(bar.total, '0,0')}`"
                  :title="`${bar.date} · ${numeralFormat(bar.total, '0,0')}`"
                  @mouseenter="day_preview = bar.day"
                  @focus="day_preview = bar.day"
                  @blur="day_preview = null"
                  @click="selectDay(bar.day)"
                >
                  <span :style="{ height: bar.height }" />
                </button>
              </div>
              <div class="b-sessions-map__days-axis" aria-hidden="true">
                <span>{{ day_bars[0].date }}</span>
                <span>{{ day_bars[day_bars.length - 1].date }}</span>
              </div>
            </div>
            <div
              v-else-if="fullDetails && !dashboard && !report"
              class="b-sessions-map__playback"
            >
              <v-slider
                v-model="custom_selected_day"
                :max="timeSeries.days"
                :min="-1"
                :readonly="play"
                :aria-label="$t('admin_shop.dashboard.modern.session_map_day')"
                :messages="
                  ma_data_selected_day
                    ? getLocalDateString(ma_data_selected_day.created_at)
                    : $t('global.commons.all')
                "
                color="on-surface"
                density="compact"
                step="1"
                @update:model-value="service_countries = false"
              >
                <template v-slot:prepend>
                  <v-btn
                    icon
                    variant="text"
                    class="sd-modern-icon-button"
                    :aria-pressed="play"
                    :aria-label="
                      $t(
                        play
                          ? 'admin_shop.dashboard.modern.session_pause'
                          : 'admin_shop.dashboard.modern.session_play',
                      )
                    "
                    @click="play = !play"
                  >
                    <v-icon :icon="play ? 'pause' : 'play_arrow'" size="20" />
                    <v-tooltip
                      activator="parent"
                      location="top"
                      open-on-focus
                      content-class="sd-modern-tooltip text-start"
                    >
                      {{
                        $t(
                          play
                            ? "admin_shop.dashboard.modern.session_pause"
                            : "admin_shop.dashboard.modern.session_play",
                        )
                      }}
                    </v-tooltip>
                  </v-btn>
                </template>
              </v-slider>
            </div>
            <div
              v-if="report && !service_countries"
              class="b-sessions-map__map-key"
              aria-hidden="true"
            >
              <span>{{ $t("shop_session_widget.modern.fewer") }}</span
              ><span
                class="b-sessions-map__map-scale"
                :style="{
                  '--session-map-low': modern_map_colors.low,
                  '--session-map-high': h_color,
                }"
              /><span>{{
                activityLabel || $t("shop_session_widget.modern.more_sessions")
              }}</span>
            </div>
            <div
              v-if="report || audience"
              class="b-sessions-map__selection"
              role="status"
              aria-live="polite"
            >
              <template v-if="selected_country">
                <span class="b-sessions-map__identity"
                  ><flag :iso="selected_country" :squared="false" />{{
                    getCountryName(selected_country)
                  }}</span
                >
                <time-series-inline-chart
                  v-if="fullDetails"
                  :colors="['#1976D2']"
                  :days="days"
                  :height="24"
                  :keys="[selected_country]"
                  :offset_day="offset"
                  :time-series="timeSeries"
                  :value-titles="[getCountryName(selected_country)]"
                  class="b-sessions-map__selection-trend"
                  dir="ltr"
                  flat-color
                  type="line"
                />
                <span class="b-sessions-map__count">{{
                  numeralFormat(
                    getCountrySessions(selected_country),
                    "0,0.[0]a",
                  )
                }}</span>
                <v-btn
                  class="sd-modern-icon-button"
                  icon
                  variant="text"
                  :aria-label="$t('shop_session_widget.modern.clear_country')"
                  @click="selected_country = null"
                >
                  <v-icon size="16">close</v-icon>
                  <v-tooltip
                    activator="parent"
                    location="top"
                    open-on-focus
                    content-class="sd-modern-tooltip text-start"
                    >{{
                      $t("shop_session_widget.modern.clear_country")
                    }}</v-tooltip
                  >
                </v-btn>
              </template>
              <span v-else class="sd-modern-label">{{
                $t(
                  activityLabel
                    ? "shop_session_widget.modern.select_country_activity"
                    : "shop_session_widget.modern.select_country",
                )
              }}</span>
            </div>
          </section>
          <section class="b-sessions-map__country-panel">
            <header class="b-sessions-map__section-header">
              <h3 class="sd-modern-eyebrow">
                {{ $t("admin_shop.dashboard.modern.session_top_countries") }}
              </h3>
              <span v-if="audience" class="sd-modern-label">
                {{ numeralFormat(countries_count, "0,0") }}
                {{ $t("global.commons.countries") }}
              </span>
              <span v-else class="sd-modern-label">{{
                $t("admin_shop.dashboard.modern.session_period")
              }}</span>
            </header>
            <div
              class="b-sessions-map__country-head"
              :class="{
                'b-sessions-map__country-head--compact': !fullDetails,
                'sd-modern-list-header': report || audience || !!activityLabel,
              }"
              aria-hidden="true"
            >
              <span>{{ $t("global.commons.country") }}</span>
              <span v-if="fullDetails">{{
                $t("admin_shop.dashboard.modern.session_daily_trend")
              }}</span>
              <span>{{ $t("admin_shop.dashboard.modern.session_share") }}</span>
              <span>{{ activityLabel || $t("global.commons.sessions") }}</span>
            </div>
            <component
              :is="report || audience ? 'button' : 'div'"
              v-for="item in top_countries"
              :key="item[0]"
              class="b-sessions-map__country"
              :class="{
                'b-sessions-map__country--compact': !fullDetails,
                'sd-modern-clickable-item': report || audience,
              }"
              :type="report || audience ? 'button' : undefined"
              :aria-pressed="
                report || audience ? selected_country === item[0] : undefined
              "
              @click="(report || audience) && selectCountry(item[0])"
            >
              <div class="b-sessions-map__identity">
                <flag v-if="item[0]" :iso="item[0]" :squared="false" />
                <span class="b-sessions-map__country-name">
                  {{ getCountryName(item[0]) }}
                  <small
                    v-if="audience"
                    class="b-sessions-map__country-code"
                    dir="ltr"
                    >{{ item[0] }}</small
                  >
                </span>
              </div>
              <time-series-inline-chart
                v-if="fullDetails"
                :colors="['#1976D2']"
                :days="days"
                :height="24"
                :keys="[item[0]]"
                :offset_day="offset"
                :time-series="timeSeries"
                :value-titles="[getCountryName(item[0])]"
                class="b-sessions-map__country-trend"
                dir="ltr"
                flat-color
                type="line"
              />
              <span class="b-sessions-map__share"
                >{{
                  total_sessions_map
                    ? Number((100 * item[1]) / total_sessions_map).toFixed(2)
                    : "0.00"
                }}%</span
              >
              <strong class="b-sessions-map__count">{{
                numeralFormat(item[1], "0,0.[0]a")
              }}</strong>
            </component>
            <p v-if="!top_countries.length" class="sd-modern-empty-state">
              {{ $t("global.commons.no_data") }}
            </p>
            <p v-if="report" class="b-sessions-map__scope">
              {{ $t("shop_session_widget.modern.period_scope") }}
            </p>
          </section>
        </div>
        <section
          v-if="timeSeries"
          class="b-sessions-map__device-section"
          :class="{ disabled: busy }"
        >
          <header class="b-sessions-map__section-header">
            <h3
              :class="
                report ? 'b-sessions-map__device-title' : 'sd-modern-eyebrow'
              "
            >
              {{ $t("admin_shop.dashboard.modern.session_devices") }}
              <v-btn
                v-if="report && !activityLabel"
                class="sd-modern-icon-button sd-modern-info-button"
                icon
                variant="text"
                :aria-label="$t('shop_session_widget.modern.devices_help')"
              >
                <v-icon size="14">info_outline</v-icon>
                <v-tooltip
                  activator="parent"
                  location="top"
                  open-on-click
                  open-on-focus
                  interactive
                  :max-width="audience ? undefined : 360"
                  content-class="sd-modern-tooltip text-start"
                  >{{
                    $t("shop_session_widget.modern.devices_help")
                  }}</v-tooltip
                >
              </v-btn>
            </h3>
            <span v-if="report" class="sd-modern-label"
              >{{
                activityLabel ||
                $t("shop_session_widget.modern.device_sessions")
              }}
              <span class="b-sessions-map__count">{{
                numeralFormat(total_sessions_keys, "0,0.[0]a")
              }}</span></span
            >
            <span v-else class="sd-modern-label">{{
              $t("admin_shop.dashboard.modern.session_period")
            }}</span>
          </header>
          <div class="b-sessions-map__device-layout">
            <div>
              <div
                class="b-sessions-map__country-head"
                :class="{
                  'b-sessions-map__country-head--compact': !fullDetails,
                  'sd-modern-list-header':
                    report || audience || !!activityLabel,
                }"
                aria-hidden="true"
              >
                <span>{{
                  $t("admin_shop.dashboard.modern.session_devices")
                }}</span>
                <span v-if="fullDetails">{{
                  $t("admin_shop.dashboard.modern.session_daily_trend")
                }}</span>
                <span>{{
                  $t("admin_shop.dashboard.modern.session_share")
                }}</span>
                <span>{{
                  activityLabel || $t("global.commons.sessions")
                }}</span>
              </div>
              <div
                v-for="type in types"
                :key="type.code"
                class="b-sessions-map__device-row"
                :class="{ 'b-sessions-map__device-row--compact': !fullDetails }"
              >
                <span class="b-sessions-map__identity"
                  ><v-icon :icon="type.icon" size="18" aria-hidden="true" />{{
                    $t(type.title)
                  }}</span
                >
                <time-series-inline-chart
                  v-if="fullDetails"
                  :chart-id="`sessions_device_${type.code}`"
                  :colors="[type.color]"
                  :days="days"
                  :height="28"
                  :keys="[type.code]"
                  :offset_day="offset"
                  :time-series="timeSeries"
                  :value-titles="[$t(type.title)]"
                  class="b-sessions-map__device-trend"
                  chart-group="sessions-device"
                  dir="ltr"
                  flat-color
                  type="line"
                />
                <span class="b-sessions-map__share"
                  >{{
                    (total_sessions_keys
                      ? (100 * timeSeries.totalOf(type.code)) /
                        total_sessions_keys
                      : 0
                    ).toFixed(2)
                  }}%</span
                >
                <strong class="b-sessions-map__count">{{
                  numeralFormat(timeSeries.totalOf(type.code), "0,0.[0]a")
                }}</strong>
              </div>
            </div>
            <slot
              name="device-composition"
              :desktop="desktop"
              :mobile="mobile"
              :tablet="tablet"
            >
              <u-chart-donut-leader
                v-if="dashboard || report"
                :slices="device_slices"
                :unit="$t('global.commons.sessions')"
                class="b-sessions-map__device-donut"
              />
              <b-session-devices-pie
                v-else
                :desktop="desktop"
                :full-details="fullDetails"
                :mobile="mobile"
                :tablet="tablet"
                :tick-amount="2"
                modern
                small
                :type="activityLabel && !audience ? 'donut' : 'polarArea'"
                class="b-sessions-map__device-composition"
              />
            </slot>
          </div>
        </section>
      </template>
    </template>
    <template v-else>
      <div v-if="shop" class="absolute-top-start z2 px-2">
        <u-smart-toggle
          v-model="service_countries"
          :true-description="$t('global.commons.service_area')"
          class="m-0"
          color="success"
          false-gray
          @change="play = false"
        >
        </u-smart-toggle>
      </div>
      <u-loading-ellipsis
        v-if="busy && !timeSeries"
        :style="`height: ${fullDetails ? 274 : 200}px`"
        class="ma-auto"
      ></u-loading-ellipsis>

      <v-row v-if="timeSeries" :class="{ disabled: busy }" no-gutters>
        <v-col :lg="fullDetails ? 6 : 12" cols="12">
          <u-map-countries-heatmap
            :country-data="
              service_countries
                ? map_data_service
                : ma_data_selected_day
                  ? ma_data_selected_day
                  : map_data
            "
            :high-color="h_color"
            :style="`height: ${fullDetails ? 250 : 200}px`"
            class="mx-2 my-3"
            country-stroke-color="#ddd"
            default-country-fill-color="#fafafa"
            has-tooltip
            low-color="#eee"
          >
            <template v-slot="{ country }">
              <slot :country="country"></slot>
              <div v-if="timeSeries && country" class="text-start">
                <p>
                  <small>{{ $t("global.commons.sessions") }}:</small>
                  <b class="font-weight-black mx-1">{{
                    numeralFormat(getCountrySessions(country), "0,0.[0]a")
                  }}</b>
                </p>
                <time-series-inline-chart
                  v-if="fullDetails"
                  :colors="['#1976D2']"
                  :days="days"
                  :height="24"
                  :keys="[country]"
                  :offset_day="offset"
                  :time-series="timeSeries"
                  :value-titles="[country]"
                  type="line"
                ></time-series-inline-chart>
              </div>
            </template>
          </u-map-countries-heatmap>

          <v-slider
            v-if="fullDetails"
            v-model="custom_selected_day"
            :max="timeSeries.days"
            :messages="
              ma_data_selected_day
                ? getLocalDateString(ma_data_selected_day.created_at)
                : 'All'
            "
            :min="-1"
            :readonly="play"
            color="blue"
            step="1"
            track-color="#B3E5FC"
            @update:model-value="service_countries = false"
          >
            <template v-slot:prepend>
              <v-btn icon variant="plain" @click="play = !play">
                <v-icon>{{ !play ? "play_arrow" : "pause" }}</v-icon>
              </v-btn>
            </template>
          </v-slider>
        </v-col>

        <v-col :lg="fullDetails ? 6 : 12" cols="12">
          <v-table
            class="bg-transparent"
            density="compact"
            style="min-height: 125px"
          >
            <template v-slot:default>
              <tbody>
                <tr
                  v-for="item in top_countries"
                  :key="item[0]"
                  :title="getCountryName(item[0])"
                >
                  <td class="text-start">
                    <flag v-if="item[0]" :iso="item[0]" :squared="false" />
                  </td>
                  <td class="text-start">
                    <small>{{
                      fullDetails ? item[0] : getCountryName(item[0])
                    }}</small>
                  </td>

                  <td v-if="fullDetails" class="min-width-300">
                    <time-series-inline-chart
                      v-if="timeSeries"
                      :colors="['#1976D2']"
                      :days="days"
                      :height="24"
                      :keys="[item[0]]"
                      :offset_day="offset"
                      :time-series="timeSeries"
                      :value-titles="[item[0]]"
                      class="w-100"
                      type="line"
                    ></time-series-inline-chart>
                  </td>

                  <td class="text-end">
                    <small v-if="total_sessions_map"
                      >{{
                        Number((100 * item[1]) / total_sessions_map).toFixed(2)
                      }}%</small
                    >
                  </td>

                  <td class="text-end font-weight-bold">
                    {{ numeralFormat(item[1], "0,0.[0]a") }}
                  </td>
                </tr>
              </tbody>
            </template>
          </v-table>
        </v-col>
      </v-row>

      <v-list-subheader
        >{{ $t("shop_session_widget.total_sessions") }}
      </v-list-subheader>
      <h5 class="text-start mx-5">
        {{ numeralFormat(total_sessions_map, "0,0.[0]a") }}
      </h5>

      <v-row dense no-gutters>
        <v-col cols="12" sm="8">
          <v-table
            v-if="timeSeries"
            :density="!fullDetails ? 'compact' : undefined"
            class="bg-transparent"
          >
            <template v-slot:default>
              <tbody>
                <tr v-for="type in types" :key="type.code">
                  <td class="text-start">
                    <i
                      :style="`color: ${type.color}`"
                      class="fas fa-circle fa-xs me-1"
                    ></i>
                    {{ $t(type.title) }}
                  </td>
                  <td class="text-end">
                    <v-icon class="float-start" size="small"
                      >{{ type.icon }}
                    </v-icon>
                  </td>
                  <td class="text-end">
                    <small v-if="total_sessions_keys" class="mx-2">
                      {{
                        (
                          (100 * timeSeries.totalOf(type.code)) /
                          total_sessions_keys
                        ).toFixed(2)
                      }}%</small
                    >
                  </td>
                  <td v-if="fullDetails" class="min-width-300 w-100">
                    <time-series-inline-chart
                      v-if="timeSeries"
                      :chart-id="`sessions_device_${type.code}`"
                      :colors="[type.color]"
                      :days="days"
                      :height="40"
                      :keys="[type.code]"
                      :offset_day="offset"
                      :time-series="timeSeries"
                      :value-titles="[$t(type.title)]"
                      chart-group="sessions-device"
                      type="line"
                    ></time-series-inline-chart>
                  </td>

                  <td class="text-end font-weight-bold">
                    {{
                      numeralFormat(timeSeries.totalOf(type.code), "0,0.[0]a")
                    }}
                  </td>
                </tr>
              </tbody>
            </template>
          </v-table>
        </v-col>
        <v-col cols="12" sm="4">
          <b-session-devices-pie
            :desktop="desktop"
            :full-details="fullDetails"
            :mobile="mobile"
            :tablet="tablet"
            :tick-amount="2"
            small
            type="polarArea"
          ></b-session-devices-pie>
        </v-col>
      </v-row>
    </template>
    <u-time-span
      v-if="!externalFeed && !modern"
      v-model:days="days"
      v-model:offset="offset"
      :loading="busy"
      :max-days="90"
      :color="modern ? 'on-surface' : undefined"
      :class="{ 'b-sessions-map__period': modern && !summary }"
      trigger-on-end
      @onChange="fetchShopSessions(offset, days)"
    ></u-time-span>
    <u-time-span-custom-dialog
      v-if="modern && !externalFeed"
      v-model="custom_report_dialog"
      :start="report_start"
      :end="report_end"
      :max-days="90"
      @apply="applyCustomReport"
    />
  </div>
</template>

<script lang="ts">
import UMapCountriesHeatmap from "../../../ui/map/countries/heatmap/UMapCountriesHeatmap.vue";
import ULoadingEllipsis from "../../../ui/loading/ellipsis/ULoadingEllipsis.vue";
import { TimeSeries } from "@selldone/core-js/timeserie/TimeSeries";
import TimeSeriesInlineChart from "../../chart/TimeSeriesInlineChart.vue";
import UTimeSpan from "../../../ui/time/span/UTimeSpan.vue";
import UTimeSpanSelector from "../../../ui/time/span/selector/UTimeSpanSelector.vue";
import UTimeSpanCustomDialog from "../../../ui/time/span/custom/UTimeSpanCustomDialog.vue";
import { calendarDayNumber } from "../../../ui/time/span/custom/customRange.ts";
import { DateConverter } from "@selldone/core-js/helper/date/DateConverter";
import BSessionDevicesPie from "../../session/devices/pie/BSessionDevicesPie.vue";
import USmartToggle from "../../../ui/smart/toggle/USmartToggle.vue";
import { Analytics } from "@selldone/core-js";
import { CountriesResourceHelper } from "@selldone/components-vue/utils/country/CountriesResourceHelper.ts";
import DateMixin from "@selldone/components-vue/mixin/date/DateMixin.ts";
import { mix } from "chroma-js";
import UChartDonutLeader from "../../../ui/chart/donut-leader/UChartDonutLeader.vue";

// Two-letter keys of a sessions row that are not countries.
const NOT_COUNTRIES = ["id", "pc"];

export default {
  name: "BSessionsMap",
  mixins: [DateMixin],

  components: {
    UChartDonutLeader,
    USmartToggle,
    BSessionDevicesPie,
    UTimeSpan,
    UTimeSpanSelector,
    UTimeSpanCustomDialog,
    TimeSeriesInlineChart,
    ULoadingEllipsis,
    UMapCountriesHeatmap,
  },
  props: {
    modern: Boolean,
    audience: Boolean,
    report: Boolean,
    summary: Boolean,
    activityLabel: String,
    shop: {
      required: false,
      type: Object,
    },

    //-------- Fetch Mode ------------

    fullDetails: {
      type: Boolean,
      default: false,
    },
    url: {
      required: false,
    },
    datKey: {
      required: false,
    },
    //-------- External Feed ------------
    externalFeed: {
      type: Boolean,
      default: false,
    },
    externalTimeSeries: {},
  },
  data: () => ({
    busy: false,
    fetch_error: false,
    types: Analytics.DeviceType,

    timeSeries: null,

    offset: 0,
    days: 30,
    session_request: 0,
    custom_report_dialog: false,

    service_countries: false,

    custom_selected_day: -1,

    play: false,
    selected_country: null,
    // Dashboard day strip: the day under the pointer or keyboard focus, previewed on the map.
    day_preview: null,
  }),

  computed: {
    // The shop dashboard's own layout (not CRM Report, audiences or activity maps).
    dashboard() {
      return (
        this.modern && !this.report && !this.audience && !this.activityLabel
      );
    },
    device_slices() {
      return this.types.map((type) => ({
        key: type.code,
        label: this.$t(type.title),
        value: this.timeSeries?.totalOf(type.code) || 0,
        color: type.color,
      }));
    },
    // Rank of each country by sessions in the period, 1 for the most.
    country_ranks() {
      return new Map(
        this.top_all_countries.map(([code], index) => [code, index + 1]),
      );
    },
    top_all_countries() {
      return Object.entries(this.map_data)
        .filter(([code, value]) => code !== "base" && value > 0)
        .sort((a, b) => b[1] - a[1]);
    },
    // Oldest day first; `day` counts days before today, like the map's selected day.
    day_bars() {
      if (!this.timeSeries || !(this.dashboard || this.report)) return [];
      const bars = [];
      for (let day = this.timeSeries.days; day >= 0; day--) {
        const row = this.timeSeries.findDataOnDay(this.timeSeries.offset + day);
        bars.push({
          day,
          total: row ? this.day_total(row) : 0,
          date: row
            ? this.getLocalDateString(row.created_at)
            : this.getLocalDateString(
                DateConverter.GetStartOfDateBefore(
                  this.timeSeries.offset + day,
                ),
              ),
        });
      }
      const max = Math.max(1, ...bars.map((bar) => bar.total));
      return bars.map((bar) => ({
        ...bar,
        height: `${bar.total ? Math.max(8, (100 * bar.total) / max) : 3}%`,
      }));
    },
    // The one bar in the tab order: the selected day, else the newest.
    day_focus() {
      return this.custom_selected_day >= 0 ? this.custom_selected_day : 0;
    },
    report_start() {
      return DateConverter.GetStartOfDateBefore(this.offset + this.days);
    },
    report_end() {
      return DateConverter.GetEndOfDateBefore(this.offset);
    },
    report_selector_range() {
      return [this.offset, this.offset + (this.days === 0 ? 0 : this.days + 1)];
    },
    countries_count() {
      return Object.keys(this.map_data).filter(
        (key) => key !== "base" && key !== "id" && this.map_data[key] > 0,
      ).length;
    },
    modern_map_colors() {
      const theme = this.$vuetify.theme;
      const colors =
        theme.computedThemes?.[theme.name]?.colors || theme.current.colors;
      const surface =
        colors.surface || (theme.current.dark ? "#22242a" : "#ffffff");
      const onSurface =
        colors["on-surface"] || (theme.current.dark ? "#f1f2f6" : "#24272e");
      return {
        low: this.activityLabel
          ? mix(surface, this.h_color, 0.22).hex()
          : mix(surface, onSurface, 0.045).hex(),
        empty: mix(surface, onSurface, this.activityLabel ? 0.12 : 0.035).hex(),
        stroke: mix(surface, onSurface, 0.12).hex(),
      };
    },
    desktop() {
      if (!this.timeSeries) return 0;
      return this.timeSeries.totalOf("desktop");
    },
    tablet() {
      if (!this.timeSeries) return 0;
      return this.timeSeries.totalOf("tablet");
    },
    mobile() {
      if (!this.timeSeries) return 0;
      return this.timeSeries.totalOf("mobile");
    },

    h_color() {
      return this.service_countries ? "#388E3C" : "#1976D2";
    },

    total_sessions_map() {
      let out = 0;
      const values = Object.values(this.map_data);
      values.forEach((item) => {
        out += item;
      });

      return out;
    },

    total_sessions_keys() {
      if (!this.timeSeries) return 0;

      return this.desktop + this.tablet + this.mobile;
    },
    map_data_service() {
      let out = { base: 0 };

      if (!this.shop) return out;

      const countries = this.shop.countries
        ? this.shop.countries
        : this.$store.getters.getCountries;

      if (this.shop.countries) {
        this.shop.countries.forEach((item) => {
          out[item] = 100;
        });
      } else {
        this.$store.getters.getCountries.forEach((item) => {
          out[item.alpha2] = 100;
        });
      }

      return out;
    },

    ma_data_selected_day() {
      const day = this.day_preview ?? this.custom_selected_day;
      if (day >= 0) {
        const item = this.timeSeries.findDataOnDay(
          this.timeSeries.offset + day,
        );
        // console.log('find:',this.custom_selected_day,item)
        return item ? item : { base: 0 };
      }
      return null;
    },

    devices_data() {
      return this.timeSeries?.getTotalAllKeys(["mobile", "tablet", "pc"]);
    },

    map_data() {
      if (!this.timeSeries) return {};

      const sum_array = this.timeSeries.getTotalAllKeys(
        this.report || this.audience || this.activityLabel ? ["id", "pc"] : [],
      );

      sum_array.base = 0;

      return sum_array;
    },

    top_countries() {
      let sortable = [];
      for (const item in this.map_data) {
        if (item !== "base") sortable.push([item, this.map_data[item]]);
      }
      let out = sortable.sort(function (a, b) {
        return b[1] - a[1];
      });

      return out.splice(0, this.fullDetails ? 10 : 5);
    },
  },

  watch: {
    externalTimeSeries(series) {
      if (this.externalFeed) this.syncExternalTimeSeries(series);
    },
    play(play) {
      if (play) {
        if (this.report || this.audience || this.activityLabel)
          this.service_countries = false;
        this.startAnimate();
      } else this.stopAnimate();
    },
  },
  created() {
    CountriesResourceHelper.FetchCountries(this);

    if (this.externalFeed) this.syncExternalTimeSeries(this.externalTimeSeries);
    else if (this.modern) this.fetchShopSessions(0, 29);
  },
  beforeUnmount() {
    this.stopAnimate();
  },
  methods: {
    syncExternalTimeSeries(series) {
      this.stopAnimate();
      this.play = false;
      this.timeSeries = series;
      this.offset = series?.offset ?? 0;
      this.days = series?.days ?? 30;
      this.custom_selected_day = -1;
      this.selected_country = null;
      this.service_countries = false;
    },
    selectCountry(country) {
      if (typeof country !== "string" || !/^[a-z]{2}$/i.test(country)) return;
      this.selected_country =
        this.selected_country === country ? null : country;
    },
    selectCountryFromMap(event) {
      const path = event.target?.closest?.("path.land");
      if (path) this.selectCountry(path.id);
    },
    calendarDayNumber(value) {
      return calendarDayNumber(value);
    },
    selectReportPeriod(item) {
      if (item.title === "time_spans.custom") {
        this.custom_report_dialog = true;
        return;
      }
      this.fetchShopSessions(item.to, Math.max(0, item.from - item.to - 1));
    },
    // The shared Custom dialog hands over the same {offset, days} window the presets use.
    applyCustomReport({ offset, days }) {
      this.fetchShopSessions(offset, days);
    },
    startAnimate() {
      this.stopAnimate();

      this.interval = setInterval(() => {
        ++this.custom_selected_day;
        // Report windows include both calendar boundaries.
        const lastDay =
          this.timeSeries.days + (this.report || this.audience ? 1 : 0);
        if (this.custom_selected_day >= lastDay) this.custom_selected_day = 0;
      }, 250);
    },
    stopAnimate() {
      if (this.interval) {
        clearInterval(this.interval);
      }
    },

    getCountrySessions(country) {
      if (
        (this.report ||
          this.audience ||
          this.activityLabel ||
          this.dashboard) &&
        !this.service_countries &&
        this.ma_data_selected_day
      )
        return this.ma_data_selected_day[country] || 0;
      return this.map_data[country] ? this.map_data[country] : 0;
    },
    // A day's row carries device counters too; the map and its scale read countries only.
    countriesOf(row) {
      const out = { base: 0 };
      Object.keys(row || {}).forEach((key) => {
        if (key.length === 2 && !NOT_COUNTRIES.includes(key))
          out[key] = row[key];
      });
      return out;
    },
    day_total(row) {
      return Object.values(this.countriesOf(row)).reduce(
        (sum, value) => sum + (Number(value) || 0),
        0,
      );
    },
    countryShare(country) {
      const total = this.ma_data_selected_day
        ? this.day_total(this.ma_data_selected_day)
        : this.total_sessions_map;
      const share = total
        ? (100 * this.getCountrySessions(country)) / total
        : 0;
      return `${share.toFixed(1)}%`;
    },
    countryRank(country) {
      const rank = this.country_ranks.get(country);
      return rank
        ? this.$t("admin_shop.dashboard.modern.session_rank", {
            rank,
            count: this.top_all_countries.length,
          })
        : this.$t("global.commons.no_data");
    },
    selectDay(day) {
      this.service_countries = false;
      this.custom_selected_day = this.custom_selected_day === day ? -1 : day;
    },
    // Arrows walk the days in reading order (newest last), Home/End jump, Escape shows all days.
    onDayKey(event) {
      if (event.key === "Escape") {
        this.custom_selected_day = -1;
        return;
      }
      const older = this.$vuetify.locale.isRtl ? "ArrowRight" : "ArrowLeft";
      const newer = this.$vuetify.locale.isRtl ? "ArrowLeft" : "ArrowRight";
      const last = this.timeSeries.days;
      const day = {
        [older]: this.day_focus + 1,
        [newer]: this.day_focus - 1,
        Home: last,
        End: 0,
      }[event.key];
      if (day === undefined) return;
      event.preventDefault();
      this.service_countries = false;
      this.custom_selected_day = Math.min(last, Math.max(0, day));
      this.$nextTick(() =>
        this.$refs.dayBars?.querySelector('[tabindex="0"]')?.focus(),
      );
    },

    fetchShopSessions(offset, days) {
      const exactRange = this.modern;
      const request = ++this.session_request;
      this.busy = true;
      this.fetch_error = false;
      this.offset = offset;
      this.days = days;
      if (exactRange) {
        this.play = false;
        this.custom_selected_day = -1;
      }

      return axios
        .get(this.url, {
          params: {
            offset: offset,
            // The API's lower boundary is strict; fetch one extra day then retain exact calendar dates.
            days: exactRange ? days + 1 : days,
            details: this.fullDetails || exactRange,
          },
        })
        .then(({ data }) => {
          if (exactRange && request !== this.session_request) return;
          let rows = data[this.datKey];
          if (exactRange) {
            const today = this.calendarDayNumber(new Date());
            rows = rows.filter((row) => {
              const day = this.calendarDayNumber(row.created_at);
              return (
                day != null &&
                day >= today - offset - days &&
                day <= today - offset
              );
            });
          }
          if (this.fullDetails || exactRange)
            this.timeSeries = new TimeSeries(rows, "Sessions", offset, days);
          else
            this.timeSeries = new TimeSeries(
              [data[this.datKey]],
              "Sessions",
              offset,
              days,
            );
        })
        .catch((error) => {
          if (!this.report) throw error;
          if (request === this.session_request) this.fetch_error = true;
        })
        .finally(() => {
          if (!exactRange || request === this.session_request)
            this.busy = false;
        });
    },
  },
};
</script>

<style lang="scss" scoped>
.b-sessions-map--modern:not(.b-sessions-map--summary) {
  min-width: 0;

  .b-sessions-map__overview {
    display: flex;
    flex-wrap: wrap;
    gap: 12px 32px;
    margin-block-end: 16px;
  }

  .b-sessions-map__overview strong {
    display: block;
    margin-block-start: 4px;
    font-size: 24px;
    font-weight: 500;
    line-height: 1.35;
    font-variant-numeric: tabular-nums;
  }

  .b-sessions-map__report-controls {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 4px;
    margin-inline-start: auto;
    min-width: 0;
  }

  .b-sessions-map__report-dates {
    color: var(--sd-modern-muted);
    font-size: 12px;
    font-weight: 400;
  }

  .b-sessions-map__geography {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1.12fr);
    align-items: start;
    gap: 24px;
  }

  .b-sessions-map__map-panel,
  .b-sessions-map__country-panel,
  .b-sessions-map__device-layout > * {
    min-width: 0;
  }

  .b-sessions-map__section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 6px 12px;
    margin-block-end: 8px;
  }

  .b-sessions-map__section-header .sd-modern-label {
    font-size: 12px;
  }

  .b-sessions-map__section-header .sd-modern-eyebrow {
    font-weight: 500;
  }

  .b-sessions-map__coverage {
    margin-block: -8px;
  }

  .b-sessions-map__coverage:focus-visible {
    outline: 2px solid rgb(var(--v-theme-primary));
    outline-offset: 2px;
    border-radius: 8px;
  }

  .b-sessions-map__world {
    height: 280px;
    margin: 0;
  }

  .b-sessions-map__world :deep(.map-tooltip) {
    color: rgb(var(--v-theme-on-surface));
    background: rgb(var(--v-theme-surface));
    border: 1px solid var(--sd-modern-border);
    border-radius: 12px;
    box-shadow: 0 6px 24px rgba(var(--v-theme-on-surface), 0.12);
    filter: none;
    font-size: 13px;
    text-shadow: none;
  }

  .b-sessions-map__world :deep(.land:hover) {
    fill: rgb(var(--v-theme-primary)) !important;
    filter: none !important;
  }

  .b-sessions-map__world :deep(.map-tooltip strong) {
    font-weight: 500;
  }

  .b-sessions-map__playback {
    margin-block-start: 4px;
  }

  .b-sessions-map__playback :deep(.v-input__details) {
    color: var(--sd-modern-muted);
    font-size: 12px;
    padding-inline: 0;
  }

  .b-sessions-map__country-head,
  .b-sessions-map__country,
  .b-sessions-map__device-row {
    display: grid;
    grid-template-columns: minmax(0, 1.25fr) minmax(80px, 1fr) 52px 64px;
    align-items: center;
    gap: 10px;
  }

  .b-sessions-map__country-head {
    padding-block-end: 6px;
    border-block-end: 1px solid var(--sd-modern-border);
    color: var(--sd-modern-muted);
    font-size: 11px;
  }

  .b-sessions-map__country-head > :nth-last-child(-n + 2) {
    text-align: end;
  }

  .b-sessions-map__country {
    min-height: 38px;
    padding-block: 3px;
    border-block-end: 1px solid var(--sd-modern-border);
    font-size: 13px;
  }

  .b-sessions-map__country:last-child,
  .b-sessions-map__device-row:last-child {
    border-block-end: 0;
  }

  .b-sessions-map__identity {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
    line-height: 1.45;
  }

  .b-sessions-map__country-name {
    min-width: 0;
    overflow-wrap: break-word;
  }

  .b-sessions-map__identity :deep(.fi),
  .b-sessions-map__identity > .v-icon {
    flex: 0 0 20px;
  }

  .b-sessions-map__country-trend,
  .b-sessions-map__device-trend {
    width: 100%;
    min-width: 0;
  }

  .b-sessions-map__country-trend :deep(.bottom-bar),
  .b-sessions-map__device-trend :deep(.bottom-bar) {
    display: none;
  }

  .b-sessions-map__share,
  .b-sessions-map__count {
    font-variant-numeric: tabular-nums;
    text-align: end;
    white-space: nowrap;
  }

  .b-sessions-map__share {
    color: var(--sd-modern-muted);
    font-size: 12px;
  }

  .b-sessions-map__count {
    font-size: 13px;
    font-weight: 400;
  }

  .b-sessions-map__device-section {
    margin-block-start: 16px;
    padding-block-start: 16px;
    border-block-start: 1px solid var(--sd-modern-border);
  }

  .b-sessions-map__device-layout {
    display: grid;
    grid-template-columns: minmax(0, 1.8fr) minmax(230px, 1fr);
    align-items: center;
    gap: 24px;
  }

  .b-sessions-map__device-row {
    min-height: 38px;
    padding-block: 3px;
    border-block-end: 1px solid var(--sd-modern-border);
    font-size: 13px;
  }

  .b-sessions-map__country-head--compact,
  .b-sessions-map__country--compact,
  .b-sessions-map__device-row--compact {
    grid-template-columns: minmax(0, 1fr) 56px 68px;
  }

  .b-sessions-map__period {
    margin-block-start: 16px;
    padding-block-start: 10px;
    border-block-start: 1px solid var(--sd-modern-border);
  }

  @media (max-width: 1050px) {
    .b-sessions-map__geography {
      grid-template-columns: minmax(0, 1fr);
    }
    .b-sessions-map__world {
      height: 260px;
    }
  }

  @media (max-width: 700px) {
    .b-sessions-map__device-layout {
      grid-template-columns: minmax(0, 1fr);
      gap: 16px;
    }
    .b-sessions-map__country-head,
    .b-sessions-map__country,
    .b-sessions-map__device-row {
      grid-template-columns: minmax(0, 1fr) minmax(68px, 0.9fr) 48px 54px;
      gap: 8px;
    }
    .b-sessions-map__country-head--compact,
    .b-sessions-map__country--compact,
    .b-sessions-map__device-row--compact {
      grid-template-columns: minmax(0, 1fr) 48px 54px;
    }
    .b-sessions-map__world {
      height: 220px;
    }
    .b-sessions-map__device-composition {
      width: 100%;
      max-width: 360px;
      margin-inline: auto;
    }
  }

  @media (max-width: 600px) {
    .b-sessions-map__country-head:not(.b-sessions-map__country-head--compact),
    .b-sessions-map__country:not(.b-sessions-map__country--compact),
    .b-sessions-map__device-row:not(.b-sessions-map__device-row--compact) {
      grid-template-columns: minmax(0, 1fr) 48px 54px;
    }

    .b-sessions-map__country-head:not(.b-sessions-map__country-head--compact)
      > :first-child {
      display: none;
    }

    .b-sessions-map__country:not(.b-sessions-map__country--compact),
    .b-sessions-map__device-row:not(.b-sessions-map__device-row--compact) {
      row-gap: 2px;
      padding-block: 6px;
    }

    .b-sessions-map__country:not(.b-sessions-map__country--compact)
      > .b-sessions-map__identity,
    .b-sessions-map__device-row:not(.b-sessions-map__device-row--compact)
      > .b-sessions-map__identity {
      grid-column: 1 / -1;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .b-sessions-map__world :deep(.land) {
      transition: none !important;
    }
  }
}

.b-sessions-map--summary {
  .b-sessions-map__summary-total {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 16px;
    margin-block-end: 24px;

    strong {
      font-size: 26px;
      font-weight: 600;
      font-variant-numeric: tabular-nums;
    }
  }

  .b-sessions-map__devices {
    display: grid;
    gap: 20px;
    margin: 0 0 12px;
  }

  .b-sessions-map__device {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 8px 16px;
    font-size: 13px;

    dt {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    dd {
      display: flex;
      gap: 12px;
      margin: 0;
      font-variant-numeric: tabular-nums;

      span {
        min-width: 44px;
        color: var(--sd-modern-muted);
        text-align: end;
      }
    }
  }

  .b-sessions-map__device-track {
    grid-column: 1 / -1;
    height: 4px;
    overflow: hidden;
    border-radius: 4px;
    background: var(--sd-modern-inset);

    span {
      display: block;
      height: 100%;
      border-radius: inherit;
    }
  }
}

.b-sessions-map--report.b-sessions-map--modern {
  font-size: 13px;

  .b-sessions-map__overview {
    align-items: flex-start;
    gap: 14px;
    margin-block-end: 18px;
  }

  .sd-modern-title-text {
    font-size: 17px;
    font-weight: 600;
    line-height: 24px;
  }

  .sd-modern-subtitle {
    margin-block-start: 4px;
    font-size: 13px;
    line-height: 1.5;
  }

  .b-sessions-map__geography {
    grid-template-columns: minmax(0, 1.05fr) minmax(0, 1fr);
    gap: 27px;
  }

  .b-sessions-map__geographic-total {
    .sd-modern-label {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
    }

    strong {
      display: block;
      font-size: 23px;
      font-weight: 600;
      line-height: 30px;
      font-variant-numeric: tabular-nums;
    }
  }

  .b-sessions-map__world {
    height: 270px;
  }

  .b-sessions-map__country {
    width: 100%;
    min-height: 44px;
    padding-inline: 12px;
    color: inherit;
    background: transparent;
    border: 0;
    border-block-end: 1px solid var(--sd-modern-border);
    border-radius: 0;
    font-family: inherit;
    font-weight: 400;
    text-align: start;

    &[aria-pressed="true"] {
      background: var(--sd-modern-inset);
      border-radius: 7px;
    }

    &:focus-visible {
      outline: 2px solid rgb(var(--v-theme-primary));
      outline-offset: -2px;
    }
  }

  .b-sessions-map__country-head,
  .b-sessions-map__device-row {
    padding-inline: 12px;
  }

  .b-sessions-map__scope {
    margin: 12px 8px 0;
    color: var(--sd-modern-muted);
    font-size: 11px;
    line-height: 1.6;
  }

  .b-sessions-map__map-key {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px;
    margin-block-start: 12px;
    color: var(--sd-modern-muted);
    font-size: 11px;
  }

  .b-sessions-map__map-scale {
    width: 64px;
    height: 5px;
    background: linear-gradient(
      90deg,
      var(--session-map-low),
      var(--session-map-high)
    );
    border-radius: 3px;
  }

  .b-sessions-map__selection {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    min-height: 50px;
    margin-block-start: 15px;
    padding-block: 12px;
    border-block-start: 1px solid var(--sd-modern-border);
    font-size: 12px;

    > .b-sessions-map__identity {
      flex: 1 1 120px;
    }
  }

  .b-sessions-map__selection-trend {
    width: 80px;
    max-width: 100%;
    flex: 0 1 80px;
  }

  .b-sessions-map__device-title {
    display: flex;
    align-items: center;
    gap: 4px;
    margin: 0;
    font-size: 13px;
    font-weight: 500;
  }

  .b-sessions-map__device-row {
    min-height: 44px;
  }

  .b-sessions-map__device-layout {
    grid-template-columns: minmax(0, 1.8fr) minmax(220px, 1fr);
  }

  .b-sessions-map__device-composition {
    min-width: 0;
  }

  .b-sessions-map__error {
    margin-block-end: 18px;
  }

  @media (max-width: 900px) {
    .b-sessions-map__geography {
      grid-template-columns: minmax(0, 1fr);
    }
  }

  @media (max-width: 700px) {
    .b-sessions-map__device-layout {
      grid-template-columns: minmax(0, 1fr);
    }
  }
}

.b-sessions-map--modern.b-sessions-map--summary {
  .b-sessions-map__summary-total strong {
    font-weight: 500;
  }

  .b-sessions-map__device dd strong {
    font-weight: 400;
  }
}

// The audience composition shares the native map and charts with the report view.
.b-sessions-map--modern.b-sessions-map--audience {
  display: grid !important;
  grid-template-columns: minmax(0, 1.65fr) minmax(0, 1fr);
  gap: 22px 26px;
  align-items: stretch;
  font-size: 12px;

  .b-sessions-map__overview {
    grid-column: 1 / -1;
    order: -1;
    margin: 0;
  }

  .b-sessions-map__geography {
    display: contents;
  }

  .b-sessions-map__map-panel {
    grid-column: 1;
    min-width: 0;
  }

  .b-sessions-map__device-section {
    grid-column: 2;
    order: 1;
    margin: 0;
    padding: 0;
    border: 0;
    min-width: 0;
  }

  .b-sessions-map__country-panel {
    grid-column: 1 / -1;
    order: 2;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    column-gap: 24px;
    padding-block-start: 17px;
    border-block-start: 1px solid var(--sd-modern-border);
  }

  .b-sessions-map__country-panel > header,
  .b-sessions-map__country-panel > .sd-modern-empty-state {
    grid-column: 1 / -1;
  }

  .b-sessions-map__country-panel > .b-sessions-map__country-head {
    display: none;
  }

  .b-sessions-map__device-layout {
    display: flex;
    flex-direction: column-reverse;
    align-items: stretch;
    gap: 9px;
  }

  .b-sessions-map__device-composition {
    width: 100%;
    min-width: 0;
  }

  .b-sessions-map__geographic-total .sd-modern-label {
    display: flex;
    align-items: center;
    gap: 5px;
    color: var(--sd-modern-muted);
    font-size: 11px;
    line-height: 17px;
  }

  .b-sessions-map__geographic-total strong {
    display: block;
    margin-block-start: 3px;
    font-size: 22px;
    font-weight: 500;
    line-height: 29px;
    letter-spacing: -0.3px;
    font-variant-numeric: tabular-nums;
  }

  .b-sessions-map__section-header .sd-modern-eyebrow {
    font-size: 10px;
    font-weight: 400;
    line-height: 15px;
    letter-spacing: 0.65px;
  }

  .b-sessions-map__country {
    width: 100%;
    min-height: 40px;
    padding: 7px 12px;
    color: inherit;
    background: transparent;
    border: 0;
    border-radius: 6px;
    font-family: inherit;
    font-size: 11px;
    font-weight: 400;
    line-height: 17px;
    text-align: start;
  }

  .b-sessions-map__country[aria-pressed="true"] {
    background: var(--sd-modern-inset);
  }

  .b-sessions-map__country-head,
  .b-sessions-map__device-row {
    padding-inline: 12px;
  }

  .b-sessions-map__country:focus-visible {
    outline: 2px solid rgb(var(--v-theme-primary));
    outline-offset: 2px;
  }

  .b-sessions-map__country-code {
    display: block;
    color: var(--sd-modern-muted);
    font-size: 10px;
    font-weight: 400;
    line-height: 15px;
  }

  .b-sessions-map__country,
  .b-sessions-map__device-row {
    grid-template-columns: minmax(0, 1fr) 58px 42px 44px;
    gap: 7px;
  }

  .b-sessions-map__device-row,
  .b-sessions-map__count {
    font-size: 11px;
    font-weight: 400;
    line-height: 17px;
  }

  .b-sessions-map__share {
    font-size: 10px;
    line-height: 15px;
  }

  .b-sessions-map__selection {
    display: flex;
    align-items: center;
    gap: 9px;
    flex-wrap: wrap;
    min-height: 44px;
    margin-block-start: 12px;
    padding-block-start: 10px;
    border-block-start: 1px solid var(--sd-modern-border);
    font-size: 11px;
  }

  .b-sessions-map__selection > .b-sessions-map__identity {
    flex: 1 1 100px;
  }

  .b-sessions-map__selection-trend {
    width: 70px;
    flex: 0 1 70px;
  }

  @media (max-width: 800px) {
    grid-template-columns: minmax(0, 1fr);

    .b-sessions-map__map-panel,
    .b-sessions-map__device-section,
    .b-sessions-map__country-panel {
      grid-column: 1;
    }

    .b-sessions-map__country-panel {
      grid-template-columns: minmax(0, 1fr);
    }

    .b-sessions-map__device-composition {
      max-width: 320px;
      margin-inline: auto;
    }

    .b-sessions-map__country-head,
    .b-sessions-map__device-row {
      grid-template-columns: minmax(0, 1fr) 58px 42px 44px;
    }
  }

  @media (max-width: 600px), (pointer: coarse) {
    .b-sessions-map__country,
    .b-sessions-map__device-row {
      min-height: 44px;
    }
  }
}
// Shop dashboard map (Overview and Acquisition): a hover card per country, the color key and,
// on Acquisition, the strip of daily sessions that replaced playback.
.b-sessions-map--modern {
  .b-sessions-map__world :deep(.map-tooltip) {
    width: 232px;
    padding: 10px 12px;
  }

  .b-sessions-map__world :deep(.map-tooltip > .d-flex) {
    align-items: center;
    gap: 8px;
  }

  .b-sessions-map__world :deep(.map-tooltip > .d-flex small) {
    font-size: 13px;
    font-weight: 500;
  }

  .b-sessions-map__tip {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    align-items: baseline;
    gap: 0 6px;
    margin-block-start: 6px;
    text-align: start;

    > strong {
      font-size: 20px;
      font-weight: 500;
      line-height: 1.3;
      font-variant-numeric: tabular-nums;
    }

    > span {
      color: var(--sd-modern-muted);
      font-size: 12px;
    }
  }

  .b-sessions-map__tip-meta,
  .b-sessions-map__tip-trend {
    grid-column: 1 / -1;
  }

  .b-sessions-map__tip-trend {
    margin-block-start: 6px;
  }

  .b-sessions-map__device-donut {
    max-width: 360px;
    margin: auto;
  }

  .b-sessions-map__summary-map,
  .b-sessions-map__map-panel {
    position: relative;
  }

  // No sessions yet: the map stays as a gray outline under a short note.
  .b-sessions-map__map-note {
    position: absolute;
    inset-block-start: 50%;
    inset-inline-start: 50%;
    z-index: 1;
    display: grid;
    justify-items: center;
    gap: 2px;
    width: max-content;
    max-width: min(300px, 86%);
    padding: 8px 14px;
    border-radius: 10px;
    background: rgba(var(--v-theme-surface), 0.88);
    color: var(--sd-modern-muted);
    font-size: 12px;
    line-height: 1.5;
    text-align: center;
    transform: translate(-50%, -50%);

    strong {
      color: rgb(var(--v-theme-on-surface));
      font-size: 13px;
      font-weight: 500;
    }
  }

  .v-locale--is-rtl & .b-sessions-map__map-note {
    transform: translate(50%, -50%);
  }

  .b-sessions-map__map-key {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-block-start: 6px;
    color: var(--sd-modern-muted);
    font-size: 11px;
  }

  .b-sessions-map__map-scale {
    width: 64px;
    height: 5px;
    border-radius: 3px;
    background: linear-gradient(
      90deg,
      var(--session-map-low),
      var(--session-map-high)
    );
  }

  .b-sessions-map__days {
    margin-block-start: 10px;
  }

  .b-sessions-map__days-head {
    display: flex;
    align-items: center;
    gap: 8px;
    min-height: 30px;
    color: var(--sd-modern-muted);
    font-size: 12px;

    .b-sessions-map__count {
      color: rgb(var(--v-theme-on-surface));
    }

    .v-btn {
      margin-inline-start: auto;
    }
  }

  .b-sessions-map__days-bars {
    display: flex;
    align-items: flex-end;
    gap: 2px;
    height: 40px;
  }

  .b-sessions-map__day {
    display: flex;
    flex: 1 1 0;
    align-items: flex-end;
    min-width: 0;
    height: 100%;
    padding: 0;
    border: 0;
    border-radius: 3px;
    background: transparent;
    cursor: pointer;

    > span {
      display: block;
      width: 100%;
      border-radius: 2px 2px 0 0;
      background: rgba(var(--v-theme-primary), 0.32);
      transition: background-color 120ms ease;
    }

    &:hover > span,
    &:focus-visible > span {
      background: rgba(var(--v-theme-primary), 0.65);
    }

    &.-selected > span {
      background: rgb(var(--v-theme-primary));
    }

    &.-dimmed > span {
      opacity: 0.6;
    }

    &:focus-visible {
      outline: 2px solid rgb(var(--v-theme-primary));
      outline-offset: 1px;
    }
  }

  .b-sessions-map__days-axis {
    display: flex;
    justify-content: space-between;
    margin-block-start: 4px;
    color: var(--sd-modern-muted);
    font-size: 11px;
  }

  // Smart invert: the bars keep the primary hue of the light theme.
  .smart-invert & .b-sessions-map__day > span {
    filter: invert(1);
  }

  @media (pointer: coarse) {
    .b-sessions-map__days-bars {
      height: 44px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .b-sessions-map__day > span {
      transition: none;
    }
  }
}

// Overview card: total and period, the map with its key, the top three countries, devices.
.b-sessions-map--modern.b-sessions-map--summary {
  .b-sessions-map__summary-head {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    justify-content: space-between;
    gap: 8px 16px;
  }

  .b-sessions-map__summary-head .b-sessions-map__summary-total {
    display: grid;
    gap: 4px;
    margin: 0;
  }

  .b-sessions-map__summary-period {
    display: grid;
    justify-items: end;
    gap: 2px;
  }

  // Phones wrap the period under the total; it then starts at the card's edge.
  @media (max-width: 600px) {
    .b-sessions-map__summary-period {
      justify-items: start;
    }
  }

  .b-sessions-map__report-dates {
    color: var(--sd-modern-muted);
    font-size: 11px;
  }

  .b-sessions-map__summary-busy {
    margin-block-start: 6px;
  }

  // The map grows into any height its row leaves, so the card ends level with its neighbor.
  .b-sessions-map__summary-map {
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;
    margin-block: 12px 14px;
  }

  .b-sessions-map__world {
    flex: 1 1 190px;
    height: auto;
    min-height: 190px;
    max-height: 320px;
  }

  .b-sessions-map__world :deep(.map-tooltip) {
    color: rgb(var(--v-theme-on-surface));
    background: rgb(var(--v-theme-surface));
    border: 1px solid var(--sd-modern-border);
    border-radius: 12px;
    box-shadow: 0 6px 24px rgba(var(--v-theme-on-surface), 0.12);
    filter: none;
    font-size: 13px;
    text-shadow: none;
  }

  .b-sessions-map__world :deep(.land:hover) {
    fill: rgb(var(--v-theme-primary)) !important;
    filter: none !important;
  }

  .b-sessions-map__summary-countries {
    margin: 0 0 20px;
    padding: 0;
    list-style: none;
    font-size: 13px;

    li {
      display: grid;
      grid-template-columns: 20px minmax(0, 1fr) auto;
      align-items: center;
      gap: 8px;
      min-height: 30px;
      border-block-start: 1px solid var(--sd-modern-border);
    }

    li:last-child {
      border-block-end: 1px solid var(--sd-modern-border);
    }
  }

  .b-sessions-map__country-name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .b-sessions-map__share {
    color: var(--sd-modern-muted);
    font-variant-numeric: tabular-nums;
  }
}
</style>
