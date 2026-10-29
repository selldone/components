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
  <div
    v-if="modern && !summary"
    class="b-dashboard-customers-detail text-start"
    :class="{ 'b-dashboard-customers-detail--report': report }"
  >
    <section class="sd-modern-widget">
      <header class="sd-modern-header">
        <div class="sd-modern-title">
          <span class="sd-modern-icon sd-modern-icon--plain"
            ><v-icon size="20" aria-hidden="true">people_outline</v-icon></span
          >
          <div>
            <div class="d-flex align-center ga-1">
              <h2 class="sd-modern-title-text">
                {{ $t("admin_shop.dashboard.modern.customer_growth") }}
              </h2>
              <v-btn
                class="sd-modern-icon-button sd-modern-info-button"
                icon
                variant="text"
                :aria-label="$t('admin_shop.dashboard.modern.customer_growth')"
              >
                <v-icon size="16" aria-hidden="true">info_outline</v-icon>
                <v-tooltip
                  activator="parent"
                  location="top"
                  open-on-click
                  open-on-focus
                  interactive
                  :max-width="360"
                  content-class="sd-modern-tooltip text-start"
                  >{{
                    $t("admin_shop.dashboard.modern.customer_help")
                  }}</v-tooltip
                >
              </v-btn>
            </div>
            <p class="sd-modern-subtitle">
              {{ $t("admin_shop.dashboard.modern.customer_growth_subtitle") }}
            </p>
          </div>
        </div>
        <slot v-if="report" name="period" />
        <v-btn
          v-if="!report"
          :to="{ name: 'BPageShopCrmReport' }"
          :active="false"
          class="sd-modern-button"
          variant="text"
        >
          {{ $t("global.commons.detail")
          }}<v-icon end size="18" class="flip-rtl">arrow_forward</v-icon>
          <v-tooltip
            activator="parent"
            location="top"
            open-on-focus
            content-class="sd-modern-tooltip text-start"
            >{{ $t("admin_shop.dashboard.customers.title") }}</v-tooltip
          >
        </v-btn>
      </header>
      <dl class="sd-modern-stat-grid b-dashboard-customers-detail__stats">
        <div>
          <dt>{{ $t("admin_shop.dashboard.modern.customer_total") }}</dt>
          <dd>{{ modern_customer_total }}</dd>
          <dd v-if="report" class="b-dashboard-customers-detail__scope">
            {{ $t("shop_crm_report.latest_customer_stock") }}
          </dd>
        </div>
        <div>
          <dt>{{ $t("admin_shop.dashboard.modern.customer_new_today") }}</dt>
          <dd>{{ numeralFormat(change_today, "0,0a") }}</dd>
        </div>
        <div>
          <dt>
            {{ $t("admin_shop.dashboard.modern.customer_new_last7_days") }}
          </dt>
          <dd>{{ numeralFormat(change_week, "0,0a") }}</dd>
        </div>
      </dl>
      <div v-if="report" class="b-dashboard-customers-detail__plots">
        <section>
          <h3>{{ $t("admin_shop.dashboard.modern.customer_total") }}</h3>
          <p class="b-dashboard-customers-detail__scope">
            {{ $t("shop_crm_report.shop_period") }}
          </p>
          <apexchart
            :key="'stock-' + $i18n.locale + '-' + $vuetify.theme.name"
            :options="report_chart_options.stock"
            :series="[series[0]]"
            :aria-label="$t('admin_shop.dashboard.modern.customer_total')"
            dir="ltr"
            height="300"
            type="line"
            width="100%"
          />
        </section>
        <section>
          <h3>
            {{ $t("admin_shop.dashboard.customers.chart.new_customers") }}
          </h3>
          <p class="b-dashboard-customers-detail__scope">
            {{ $t("shop_crm_report.shop_period") }}
          </p>
          <apexchart
            :key="'added-' + $i18n.locale + '-' + $vuetify.theme.name"
            :options="report_chart_options.added"
            :series="[{ ...series[1], type: 'bar' }]"
            :aria-label="
              $t('admin_shop.dashboard.customers.chart.new_customers')
            "
            dir="ltr"
            height="300"
            type="bar"
            width="100%"
          />
        </section>
      </div>
      <apexchart
        v-else
        :aria-label="$t('admin_shop.dashboard.modern.customer_history')"
        :options="options"
        :series="series"
        dir="ltr"
        height="240"
        type="line"
        width="100%"
      />
    </section>
    <section class="sd-modern-widget">
      <header class="sd-modern-header">
        <div class="sd-modern-title">
          <span class="sd-modern-icon sd-modern-icon--plain"
            ><v-icon size="20" aria-hidden="true"
              >workspace_premium</v-icon
            ></span
          >
          <div>
            <h2 class="sd-modern-title-text">
              {{ $t("admin_shop.dashboard.modern.club_title") }}
            </h2>
            <p class="sd-modern-subtitle">
              {{ $t("admin_shop.dashboard.modern.clubs_subtitle") }}
            </p>
          </div>
        </div>
        <v-btn
          :to="{ name: 'BPageShopCrmClub' }"
          :active="false"
          class="sd-modern-button"
          variant="text"
        >
          {{ $t("admin_shop.dashboard.modern.manage_clubs") }}
          <v-tooltip
            activator="parent"
            location="top"
            open-on-focus
            content-class="sd-modern-tooltip text-start"
            >{{ $t("admin_shop.dashboard.modern.manage_clubs") }}</v-tooltip
          >
        </v-btn>
      </header>
      <template v-if="report">
        <table class="sd-modern-table b-dashboard-customers-detail__club-table">
          <thead>
            <tr>
              <th>{{ $t("admin_shop.dashboard.modern.club_title") }}</th>
              <th>{{ $t("global.commons.users") }}</th>
              <th>{{ $t("shop_crm_report.monthly_threshold") }}</th>
              <th>{{ $t("shop_crm_report.annual_threshold") }}</th>
              <th>{{ $t("global.commons.discount") }}</th>
              <th :aria-label="$t('global.commons.detail')"></th>
            </tr>
          </thead>
          <tbody v-for="level in levels" :key="level.code">
            <tr class="b-dashboard-customers-detail__club-row">
              <td class="b-dashboard-customers-detail__club-id-cell">
                <div class="b-dashboard-customers-detail__club-identity">
                  <img
                    :src="level.icon"
                    :class="{ 'img-grayscale': !level.club }"
                    alt=""
                    width="28"
                    height="28"
                  />
                  <div>
                    <h3>{{ $t(level.name) }}</h3>
                    <span class="sd-modern-status sd-modern-status--plain"
                      ><span
                        class="sd-modern-status__dot"
                        :class="{
                          'b-dashboard-customers-detail__inactive': !level.club,
                        }"
                        aria-hidden="true"
                      />{{
                        $t(level.club ? "global.active" : "global.inactive")
                      }}</span
                    >
                  </div>
                </div>
              </td>
              <td :data-label="$t('global.commons.users')">
                {{ level.club ? numeralFormat(level.club.count, "0,0") : "—" }}
              </td>
              <td :data-label="$t('shop_crm_report.monthly_threshold')">
                <u-price
                  v-if="level.club"
                  :amount="level.club.monthly"
                  :currency="level.club.currency"
                /><span v-else>—</span>
              </td>
              <td :data-label="$t('shop_crm_report.annual_threshold')">
                <u-price
                  v-if="level.club"
                  :amount="level.club.annually"
                  :currency="level.club.currency"
                /><span v-else>—</span>
              </td>
              <td :data-label="$t('global.commons.discount')">
                {{ level.club ? level.club.percent + "%" : "—" }}
              </td>
              <td class="b-dashboard-customers-detail__club-action">
                <v-btn
                  class="sd-modern-icon-button"
                  icon
                  variant="text"
                  :aria-label="
                    $t('shop_crm_report.club_details', { club: $t(level.name) })
                  "
                  :aria-expanded="expanded_clubs.includes(level.code)"
                  :aria-controls="'crm-report-club-' + $.uid + '-' + level.code"
                  @click="toggleClubDetails(level.code)"
                >
                  <v-icon size="18" aria-hidden="true">{{
                    expanded_clubs.includes(level.code)
                      ? "expand_less"
                      : "expand_more"
                  }}</v-icon>
                  <v-tooltip
                    activator="parent"
                    location="top"
                    open-on-focus
                    content-class="sd-modern-tooltip text-start"
                    >{{
                      $t("shop_crm_report.club_details", {
                        club: $t(level.name),
                      })
                    }}</v-tooltip
                  >
                </v-btn>
              </td>
            </tr>
            <tr
              v-show="expanded_clubs.includes(level.code)"
              class="b-dashboard-customers-detail__club-expanded"
            >
              <td
                colspan="6"
                :id="'crm-report-club-' + $.uid + '-' + level.code"
              >
                <div class="b-dashboard-customers-detail__expanded-content">
                  <template v-if="level.club">
                    <span
                      >{{ $t("shop_crm_report.discount_cap") }}:
                      <u-price
                        v-if="level.club.limit"
                        :amount="level.club.limit"
                        :currency="level.club.currency"
                      /><span v-else>{{
                        $t("global.commons.unlimited")
                      }}</span></span
                    >
                    <span v-if="level.club.description">{{
                      level.club.description
                    }}</span>
                  </template>
                  <span v-else>{{ $t("global.inactive") }}</span>
                  <v-btn
                    :to="{ name: 'BPageShopCrmClub' }"
                    :active="false"
                    class="sd-modern-button sd-modern-button--inline"
                    variant="text"
                    >{{ $t("admin_shop.dashboard.modern.manage_clubs") }}</v-btn
                  >
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <p class="b-dashboard-customers-detail__scope">
          {{ $t("shop_crm_report.club_threshold_help") }}
        </p>
      </template>
      <div v-else class="b-dashboard-customers-detail__clubs">
        <section
          v-for="level in levels"
          :key="level.code"
          class="b-dashboard-customers-detail__club"
        >
          <div class="d-flex align-center ga-2">
            <img
              :src="level.icon"
              :class="{ 'img-grayscale': !level.club }"
              alt=""
              width="28"
              height="28"
            />
            <h3>{{ $t(level.name) }}</h3>
          </div>
          <template v-if="level.club">
            <dl class="b-dashboard-customers-detail__benefits">
              <div>
                <dt>{{ $t("global.commons.users") }}</dt>
                <dd>{{ numeralFormat(level.club.count, "0,0") }}</dd>
              </div>
              <div>
                <dt>{{ $t("global.commons.discount") }}</dt>
                <dd>{{ level.club.percent }}%</dd>
              </div>
              <div>
                <dt>{{ $t("global.commons.monthly") }}</dt>
                <dd>
                  <u-price
                    :amount="level.club.monthly"
                    :currency="level.club.currency"
                  />
                </dd>
              </div>
              <div>
                <dt>{{ $t("global.commons.annually") }}</dt>
                <dd>
                  <u-price
                    :amount="level.club.annually"
                    :currency="level.club.currency"
                  />
                </dd>
              </div>
              <div>
                <dt>{{ $t("global.commons.limit") }}</dt>
                <dd>
                  <u-price
                    v-if="level.club.limit"
                    :amount="level.club.limit"
                    :currency="level.club.currency"
                  />
                  <span v-else>{{ $t("global.commons.unlimited") }}</span>
                </dd>
              </div>
            </dl>
            <p
              v-if="level.club.description"
              class="b-dashboard-customers-detail__description"
            >
              {{ level.club.description }}
            </p>
          </template>
          <p v-else class="sd-modern-subtitle">{{ $t("global.inactive") }}</p>
          <v-btn
            :to="{ name: 'BPageShopCrmClub' }"
            :active="false"
            class="sd-modern-button sd-modern-button--inline"
            variant="text"
          >
            {{ $t("admin_shop.dashboard.modern.manage_clubs") }}
            <v-tooltip
              activator="parent"
              location="top"
              open-on-focus
              content-class="sd-modern-tooltip text-start"
              >{{ $t("admin_shop.dashboard.modern.manage_clubs") }} ·
              {{ $t(level.name) }}</v-tooltip
            >
          </v-btn>
        </section>
      </div>
    </section>
  </div>
  <s-widget-box
    v-else
    :active="true"
    :class="{
      's--shop-dashboard-customers-modern sd-modern-widget': modern,
      's--shop-dashboard-customers-modern--summary': modern && summary,
    }"
    :color="modern ? 'rgb(var(--v-theme-surface))' : ThemeColorDeepDark"
    :icon-to="modern ? undefined : { name: 'BPageShopCrmReport' }"
    :title="
      modern
        ? undefined
        : `<h5 class='align-items-center pb-1'>    <span class='circle bg-primary mx-sm' style='font-size: 6px;'></span> ${$t(
            'admin_shop.dashboard.customers.title',
          )}   <span class='fw-normal ml-xs small'> ${$t(
            'admin_shop.dashboard.customers.title_small',
          )} </span>  </h5>`
    "
    :dark="modern ? $vuetify.theme.current.dark : true"
    extended
    :icon="modern ? undefined : 'call_split'"
    icon-color="#fff"
  >
    <template v-slot:actions>
      <header v-if="modern" class="sd-modern-header">
        <div class="sd-modern-title">
          <span class="sd-modern-icon sd-modern-icon--plain"
            ><v-icon icon="people_outline" size="20" aria-hidden="true"
          /></span>
          <div>
            <div class="d-flex align-center ga-1">
              <h2 class="sd-modern-title-text">
                {{ $t("admin_shop.dashboard.customers.title") }}
              </h2>
              <v-btn
                class="sd-modern-icon-button sd-modern-info-button"
                icon
                variant="text"
                :aria-label="$t('admin_shop.dashboard.customers.title')"
              >
                <v-icon icon="info_outline" size="16" aria-hidden="true" />
                <v-tooltip
                  activator="parent"
                  location="top"
                  :max-width="360"
                  open-on-click
                  open-on-focus
                  interactive
                  content-class="sd-modern-tooltip text-start"
                >
                  {{ $t("admin_shop.dashboard.modern.customer_help") }}
                </v-tooltip>
              </v-btn>
            </div>
            <p class="sd-modern-subtitle">
              {{ $t("admin_shop.dashboard.customers.title_small") }}
            </p>
          </div>
        </div>
        <v-btn
          :to="{ name: 'BPageShopCrmReport' }"
          class="sd-modern-button sd-modern-button--inline"
          variant="text"
          v-tooltip="$t('admin_shop.dashboard.customers.title')"
        >
          {{ $t("global.commons.detail") }}
          <v-icon end size="small">arrow_forward</v-icon>
        </v-btn>
      </header>
      <v-container fluid>
        <div v-if="lastdayData && !modern" class="text-start">
          <span class="text-h2 me-3 font-weight-black">{{
            numeralFormat(lastdayData.users, "0,0.[00]a")
          }}</span>
          <div v-if="has_todayData && has_yesterdayData" class="mt-1">
            <small class="me-1"
              >{{ $t("admin_shop.dashboard.customers.new_users") }}:</small
            >
            <b>{{ numeralFormat(todayData.users_add, "0,0.[00]a") }}</b>
            <up-down-icon :value="todayData.users_add"></up-down-icon>
          </div>
        </div>

        <apexchart
          v-if="!summary"
          :options="options"
          :series="series"
          class="mt-3 mx-n6 mx-sm-0"
          dir="ltr"
          height="210"
          type="line"
          width="100%"
        />

        <div
          v-if="modern"
          class="sd-modern-header s--shop-dashboard-customers-modern__clubs-header"
        >
          <h3 class="sd-modern-eyebrow">
            {{ $t("admin_shop.dashboard.modern.club_title") }}
          </h3>
          <v-btn
            :to="{ name: 'BPageShopCrmClub' }"
            class="sd-modern-button sd-modern-button--inline"
            variant="text"
            v-tooltip="$t('admin_shop.dashboard.modern.manage_clubs')"
            >{{ $t("admin_shop.dashboard.modern.manage_clubs") }}</v-btn
          >
        </div>
        <div
          v-if="modern && summary"
          class="s--shop-dashboard-customers-modern__club-summary"
        >
          <router-link
            v-for="level in levels"
            :key="level.code"
            :to="{ name: 'BPageShopCrmClub' }"
            class="s--shop-dashboard-customers-modern__club-summary-row"
            v-tooltip="$t('admin_shop.dashboard.modern.manage_clubs')"
          >
            <img
              :src="level.icon"
              :class="{ 'img-grayscale': !level.club }"
              alt=""
              width="24"
              height="24"
            />
            <div>
              <span
                class="s--shop-dashboard-customers-modern__club-summary-name"
                >{{ $t(level.name) }}</span
              >
              <small v-if="level.club"
                ><b>{{ level.club.count }}</b>
                {{ $t("global.commons.users") }}</small
              >
              <small v-else>{{ $t("global.inactive") }}</small>
            </div>
          </router-link>
        </div>
        <v-row
          v-else
          :class="{ 's--shop-dashboard-customers-modern__clubs': modern }"
          class="mt-2 small"
          dense
          justify="space-around"
        >
          <v-col
            v-for="level in levels"
            :key="level.code"
            :class="{ 's--shop-dashboard-customers-modern__club': modern }"
            class="text-center"
            :cols="modern ? undefined : 6"
            :lg="modern ? undefined : 2"
            :md="modern ? undefined : 4"
          >
            <v-btn
              v-if="modern"
              :to="{ name: 'BPageShopCrmClub' }"
              :aria-label="$t(level.name)"
              class="sd-modern-icon-button mb-1"
              variant="text"
              v-tooltip="level.club?.description || $t(level.name)"
            >
              <img
                :src="level.icon"
                :class="{ 'img-grayscale': !level.club }"
                alt=""
                width="32"
                height="32"
              />
            </v-btn>
            <img
              v-else
              :class="{ 'img-grayscale': !level.club }"
              :src="level.icon"
              :title="
                level.club && level.club.description
                  ? level.club.description
                  : $t(level.name)
              "
              class="pointer-pointer"
              height="32"
              width="32"
              @click="$router.push({ name: 'BPageShopCrmClub' })"
            />
            <p class="m-1 text-subtitle-2">{{ $t(level.name) }}</p>
            <!-- Club info -->
            <template v-if="level.club && !summary">
              <div class="d-flex">
                <div class="w-50">
                  <small class="d-block op-0-6">{{
                    $t("global.commons.monthly")
                  }}</small>
                  <u-price
                    :amount="level.club.monthly"
                    :currency="level.club.currency"
                    class="single-line"
                  ></u-price>
                </div>
                <div class="w-50">
                  <small class="d-block op-0-6">{{
                    $t("global.commons.annually")
                  }}</small>
                  <u-price
                    :amount="level.club.annually"
                    :currency="level.club.currency"
                    class="single-line"
                  ></u-price>
                </div>
              </div>
              <div class="d-flex mt-2">
                <div class="w-50">
                  <small class="d-block op-0-6">{{
                    $t("global.commons.discount")
                  }}</small>
                  <b>%{{ level.club.percent }}</b>
                </div>

                <div class="w-50">
                  <span v-if="level.club.limit" class="text-subtitle-2 d-block">
                    <small class="d-block op-0-6"
                      >{{ $t("global.commons.limit") }}
                    </small>
                    <u-price
                      :amount="level.club.limit"
                      :currency="level.club.currency"
                      class="single-line"
                    ></u-price>
                  </span>
                </div>
              </div>
              <div class="d-flex mt-2">
                <div class="w-100">
                  <small class="d-block op-0-6">{{
                    $t("global.commons.users")
                  }}</small>
                  <b> {{ level.club.count }}</b>
                </div>
              </div>
            </template>
            <p v-else-if="level.club && summary" class="sd-modern-subtitle">
              <b class="sd-modern-value justify-center">{{
                level.club.count
              }}</b>
              {{ $t("global.commons.users") }}
            </p>
            <p v-else-if="modern" class="sd-modern-subtitle">
              {{ $t("global.inactive") }}
            </p>
          </v-col>
        </v-row>
      </v-container>
    </template>

    <template v-slot:bottom>
      <dl
        v-if="modern"
        class="s--shop-dashboard-customers-modern__stats sd-modern-stat-grid text-start"
      >
        <div>
          <dt class="s--shop-dashboard-customers-modern__stat-label">
            <v-icon size="x-small" aria-hidden="true">fa:fas fa-users</v-icon>
            {{ $t("admin_shop.dashboard.modern.customer_total") }}
          </dt>
          <dd class="s--shop-dashboard-customers-modern__stat-value">
            {{ modern_customer_total }}
          </dd>
        </div>
        <div>
          <dt class="s--shop-dashboard-customers-modern__stat-label">
            <v-icon size="x-small" aria-hidden="true"
              >fa:fas fa-calendar-day</v-icon
            >
            {{ $t("admin_shop.dashboard.modern.customer_new_today") }}
          </dt>
          <dd class="s--shop-dashboard-customers-modern__stat-value">
            {{ numeralFormat(change_today, "0,0a") }}
          </dd>
        </div>
        <div>
          <dt class="s--shop-dashboard-customers-modern__stat-label">
            <v-icon size="x-small" aria-hidden="true"
              >fa:fas fa-calendar-week</v-icon
            >
            {{ $t("admin_shop.dashboard.modern.customer_new_last7_days") }}
          </dt>
          <dd class="s--shop-dashboard-customers-modern__stat-value">
            {{ numeralFormat(change_week, "0,0a") }}
          </dd>
        </div>
      </dl>
      <v-row v-else class="border-between text-center mx-0 mt-2 mb-0">
        <v-col cols="4" sm="4">
          <h4 class="text-h4">
            {{ numeralFormat(lastDayData.users, "0,0a") }}
          </h4>
          <div class="d-flex align-center justify-center mt-2">
            <v-icon class="me-1" size="x-small">fa:fas fa-users</v-icon>
            <small>
              {{ $t("admin_shop.dashboard.customers.total_customers") }}
            </small>
          </div>
        </v-col>

        <v-col cols="4" sm="4">
          <h4 class="text-h4">
            {{ numeralFormat(change_today, "0,0a") }}

            <up-down-icon :value="change_today" size="24" small></up-down-icon>
          </h4>
          <div class="d-flex align-center justify-center mt-2">
            <v-icon class="me-1" size="x-small">fa:fas fa-calendar-day</v-icon>
            <small>
              {{ $t("admin_shop.dashboard.customers.new_customers_today") }}
            </small>
          </div>
        </v-col>

        <v-col cols="4" sm="4">
          <h4 class="text-h4">
            {{ numeralFormat(change_week, "0,0a") }}
            <up-down-icon :value="change_week" size="24"></up-down-icon>
          </h4>
          <div class="d-flex align-center justify-center mt-2">
            <v-icon class="me-1" size="x-small">fa:fas fa-calendar-week</v-icon>
            <small>
              {{ $t("admin_shop.dashboard.customers.new_customers_week") }}
            </small>
          </div>
        </v-col>
      </v-row>
    </template>
  </s-widget-box>
</template>

<script lang="ts">
import SWidgetBox from "../../../../ui/widget/box/SWidgetBox.vue";
import { isEmpty } from "lodash-es";

import numeral from "numeral";
import { DateConverter } from "@selldone/core-js/helper/date/DateConverter";
import UpDownIcon from "../../../../ui/icon/UpDownIcon.vue";
import { Club } from "@selldone/core-js";
import TemplateMixin from "@selldone/components-vue/mixin/template/TemplateMixin.ts";

export default {
  name: "BDashboardShopCustomers",
  mixins: [TemplateMixin],
  components: {
    UpDownIcon,
    SWidgetBox,
  },
  props: {
    modern: { type: Boolean, default: false },
    summary: { type: Boolean, default: false },
    report: { type: Boolean, default: false },
    shop: {
      required: true,
      type: Object,
    },

    timeSeries: {
      required: true,
      type: Object,
    },
  },

  data: () => ({
    expanded_clubs: [],
    series: [
      {
        type: "line",
        name: "",
        data: [],
      },

      {
        type: "column",
        name: "",
        data: [],
      },
    ],
    funnel_value: [0, 0, 0, 0],
    //funnel_value:[50,10,5,20],

    start_date: null,
    end_date: null,
  }),

  computed: {
    report_chart_options() {
      const options = this.options;
      const plot = (index) => ({
        ...options,
        dataLabels: { enabled: false },
        colors: [this.$vuetify.theme.current.colors.primary],
        chart: {
          ...options.chart,
          redrawOnParentResize: true,
          redrawOnWindowResize: true,
        },
        yaxis: [{ ...options.yaxis[index], title: { text: undefined } }],
        xaxis: {
          ...options.xaxis,
          labels: { ...options.xaxis.labels, trim: false, rotate: 0 },
        },
        grid: {
          ...options.grid,
          padding: { top: 52, right: 24, bottom: 10, left: 24 },
        },
        responsive: [
          {
            breakpoint: 600,
            options: {
              chart: { height: 340 },
              grid: { padding: { top: 104, right: 24, bottom: 10, left: 24 } },
            },
          },
        ],
        legend: { ...options.legend, show: false },
        tooltip: {
          ...options.tooltip,
          y: { formatter: (value) => numeral(value).format("0,0") },
        },
      });
      return { stock: plot(1), added: plot(0) };
    },
    modern_customer_total() {
      return Number.isFinite(this.lastDayData.users)
        ? this.numeralFormat(this.lastDayData.users, "0,0a")
        : "—";
    },
    has_todayData() {
      return !isEmpty(this.todayData);
    },

    has_yesterdayData() {
      return !isEmpty(this.yesterdayData);
    },

    change_today() {
      if (!this.todayData) return 0;
      return this.todayData.users_add;
    },

    change_week() {
      if (!this.lastWeekData) return 0;
      return this.lastWeekData.users_add;
    },

    max_days_data_exist() {
      return this.timeSeries.days ? this.timeSeries.days : 30;
    },
    origin_date_data_exist() {
      let date = new Date();
      if (this.timeSeries.offset)
        date.setDate(date.getDate() - this.timeSeries.offset);
      return date;
    },
    lastDayData() {
      return this.timeSeries.lastDayData();
    },
    lastdayData() {
      return this.timeSeries.lastdayData();
    },

    todayData() {
      return this.timeSeries.todayData();
    },
    yesterdayData() {
      return this.timeSeries.yesterdayData();
    },
    lastWeekData() {
      return this.timeSeries.lastWeekData();
    },

    previousWeekData() {
      return this.timeSeries.previousWeekData();
    },

    options() {
      return {
        theme: {
          mode: this.modern
            ? this.$vuetify.theme.current.dark
              ? "dark"
              : "light"
            : "dark",
          palette: "palette1",
        },

        legend: {
          show: this.modern || window.innerWidth > 720,
          position: "bottom",
          horizontalAlign: "center",
        },

        colors: this.modern
          ? [
              this.$vuetify.theme.current.colors.primary,
              this.$vuetify.theme.current.colors.success,
            ]
          : ["#ffffff", "#8BC34A"],

        chart: {
          background: this.modern ? "transparent" : this.ThemeColorDeepDark,
          foreColor: this.modern
            ? this.$vuetify.theme.current.colors["on-surface"]
            : undefined,

          stacked: false,

          zoom: {
            enabled: true,
          },

          // 🞇 Toolbar (for line)
          toolbar: {
            show: true,
            tools: {
              download: true,
              selection: true,
              zoom: true,
              zoomin: true,
              zoomout: true,
              pan: true,
              reset: true,
              customIcons: [],
            },
          },

          fontFamily: "var(--font)",
        },
        /*  markers: {
          size: 2
        },*/
        fill: {
          type: this.modern ? "solid" : "gradient",
          gradient: {
            shade: "dark",
            type: "vertical",
            shadeIntensity: 0.1,
            gradientToColors: undefined, // optional, if not defined - uses the shades of same color in series
            inverseColors: false,
            opacityFrom: 1,
            opacityTo: 1,
            stops: [0, 50, 100],
            colorStops: [],
          },
        },

        // 🞇 Stroke chart
        stroke: {
          curve: this.modern ? "straight" : "smooth",
          colors: this.modern ? undefined : "#ffffff",
          width: 2,
          dashArray: 0,
        },

        // 🞇 Bar chart
        plotOptions: {
          bar: {
            horizontal: false,
            endingShape: "flat",
            columnWidth:
              window.innerWidth > 1280
                ? "25%"
                : window.innerWidth > 720
                  ? "50%"
                  : "90%",
            distributed: false,
            colors: {
              ranges: [
                {
                  from: -100000,
                  to: -10,
                  color: "#D32F2F",
                },
                {
                  from: -9,
                  to: 0,
                  color: "#E91E63",
                },
              ],
            },
            dataLabels: {
              position: "top",
              maxItems: 100,
              hideOverflowingLabels: true,
            },
          },
        },

        xaxis: {
          categories: [],
          tickAmount: 4,
          type: "datetime",
          labels: {
            show: true,
            rotate: -45,
            rotateAlways: false,
            hideOverlappingLabels: true,
            showDuplicates: false,
            trim: true,
            minHeight: undefined,
            maxHeight: 60,
            style: {
              colors: [],
              fontSize: "10px",
            },
            offsetX: 0,
            offsetY: 0,
            format: undefined,
            formatter: function (value, timestamp, index) {
              try {
                return DateConverter.ConvertTimestampToShortString(timestamp);
              } catch (e) {
                // console.error(e);

                return "";
              }
            },
          },
        },

        tooltip: {
          x: {
            formatter: function (value, timestamp, index) {
              try {
                return DateConverter.ConvertTimestampToShortString(
                  value,
                  false,
                );
              } catch (e) {
                // console.error(e);
                return "";
              }
            },
          },

          y: {
            formatter: function (value, timestamp, index) {
              return numeral(value).format("0.[0]a");
            },
          },
        },

        yaxis: [
          // 🞧 Y axis ▶ ratings
          {
            seriesName: this.$t(
              "admin_shop.dashboard.customers.chart.new_customers",
            ),
            axisTicks: {
              show: true,
            },
            axisBorder: {
              show: false,
            },
            title: {
              text: this.$t(
                "admin_shop.dashboard.customers.chart.new_customers",
              ),
            },

            labels: {
              formatter: function (value, timestamp, index) {
                return numeral(value).format("0.[0]a");
              },
            },
          },
          // 🞧 Y axis ▶ rating value
          {
            opposite: true,
            seriesName: this.$t(
              "admin_shop.dashboard.customers.chart.customers",
            ),
            axisTicks: {
              show: true,
            },
            axisBorder: {
              show: false,
            },
            title: {
              text: this.$t("admin_shop.dashboard.customers.chart.customers"),
            },

            labels: {
              formatter: function (value, timestamp, index) {
                return numeral(value).format("0.[0]a");
              },
            },
          },
        ],
        grid: {
          show: true,
          borderColor: this.modern
            ? "rgba(var(--v-theme-on-surface), 0.10)"
            : this.ThemeColorLight,
          strokeDashArray: [2, 3],
          position: "back",
          xaxis: {
            lines: {
              show: false,
            },
          },
          yaxis: {
            lines: {
              show: true,
            },
          },
        },
      };
    },

    clubs() {
      return this.shop.clubs;
    },
    levels() {
      // Keep each shop's membership data off the shared level definitions.
      return Object.values(Club.Levels).map((level) => ({
        ...level,
        club: this.clubs?.find((club) => club.level === level.code),
      }));
    },
  },

  watch: {
    timeSeries: {
      immediate: true,
      handler() {
        this.update_series();
      },
    },
  },

  methods: {
    toggleClubDetails(code) {
      this.expanded_clubs = this.expanded_clubs.includes(code)
        ? this.expanded_clubs.filter((item) => item !== code)
        : [...this.expanded_clubs, code];
    },
    update_series() {
      this.calculate_funnel();
      this.options.xaxis.categories =
        this.timeSeries.arrayOfTimeAbsolute("created_at");
      for (const [index, key] of ["users", "users_add"].entries()) {
        this.series[index].data = this.modern
          ? (this.timeSeries.raw_data || []).map((row) => [
              DateConverter.convertToLocalTime(row.created_at, true)?.getTime(),
              typeof row[key] === "number" && Number.isFinite(row[key])
                ? row[key]
                : null,
            ])
          : this.timeSeries.arrayOf(key, true, "created_at");
      }
      this.series[0].name = this.$t(
        "admin_shop.dashboard.customers.chart.customers",
      );
      this.series[1].name = this.$t(
        "admin_shop.dashboard.customers.chart.new_customers",
      );
    },
    sumInTimeSpan(key) {
      return this.timeSeries.totalOf(key, this.start_date, this.end_date);
    },
    calculate_funnel() {
      this.funnel_value = [
        [
          this.sumInTimeSpan("view_products_physical"),
          this.sumInTimeSpan("view_products_virtual"),
          this.sumInTimeSpan("view_products_file"),
          this.sumInTimeSpan("view_products_service"),
        ],
        [
          this.sumInTimeSpan("order_physical_added"),
          this.sumInTimeSpan("order_virtual_added"),
          this.sumInTimeSpan("order_file_added"),
          this.sumInTimeSpan("order_service_added"),
        ],
        [
          this.sumInTimeSpan("order_physical_checkout"),
          this.sumInTimeSpan("order_virtual_checkout"),
          this.sumInTimeSpan("order_file_checkout"),
          this.sumInTimeSpan("order_service_checkout"),
        ],
        [
          this.sumInTimeSpan("sell_products_physical"),
          this.sumInTimeSpan("sell_products_virtual"),
          this.sumInTimeSpan("sell_products_file"),
          this.sumInTimeSpan("sell_products_service"),
        ],
      ];

      //console.log("funnel_value", this.funnel_value);
    },
  },

  mounted() {},
};
</script>

<style lang="scss" scoped>
.b-dashboard-customers-detail.b-dashboard-customers-detail--report {
  gap: 18px;
  font-size: 13px;
  line-height: 1.5;

  .sd-modern-widget {
    --sd-modern-font-body: 13px;
    --sd-modern-font-small: 12px;
    padding: 22px;
    font-size: 13px;
    line-height: 1.5;
  }
  .sd-modern-header {
    margin-block-end: 17px;
  }
  .sd-modern-title-text {
    font-size: 18px;
    font-weight: 600;
    line-height: 24px;
  }
  .sd-modern-subtitle {
    font-size: 12px;
    line-height: 18px;
  }
  .b-dashboard-customers-detail__stats dd {
    font-size: 27px;
    font-weight: 600;
    line-height: 36px;
  }
  .b-dashboard-customers-detail__scope,
  .b-dashboard-customers-detail__stats dd.b-dashboard-customers-detail__scope {
    margin: 4px 0 0;
    color: var(--sd-modern-muted);
    font-size: 11px;
    font-weight: 400;
    line-height: 17px;
  }
  .b-dashboard-customers-detail__plots {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 25px;
    margin-block-start: 24px;
  }
  .b-dashboard-customers-detail__plots > section {
    min-width: 0;
  }
  :deep(.apexcharts-toolbar) {
    --sd-report-chart-tool-size: 36px;
    max-width: 100%;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: 4px;
    padding: 0;
    background: transparent;
    backdrop-filter: none;
  }
  :deep(.apexcharts-toolbar > [class*="-icon"]) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 var(--sd-report-chart-tool-size);
    width: var(--sd-report-chart-tool-size);
    height: var(--sd-report-chart-tool-size);
    padding: 0;
    margin: 0;
    border: 1px solid var(--sd-modern-border);
    border-radius: 9px;
    color: rgb(var(--v-theme-on-surface)) !important;
    background: rgb(var(--v-theme-surface));
  }
  :deep(.apexcharts-toolbar > [class*="-icon"] svg) {
    width: 18px;
    height: 18px;
  }
  :deep(.apexcharts-toolbar > .apexcharts-selected) {
    border-color: rgb(var(--v-theme-primary));
    background: var(--sd-modern-inset);
  }
  @media (max-width: 600px), (pointer: coarse) {
    :deep(.apexcharts-toolbar) {
      --sd-report-chart-tool-size: 44px;
    }
  }
  .b-dashboard-customers-detail__plots > section + section {
    padding-inline-start: 25px;
    border-inline-start: 1px solid var(--sd-modern-border);
  }
  h3 {
    margin: 0;
    font-size: 13px;
    font-weight: 500;
    line-height: 20px;
  }
  .b-dashboard-customers-detail__club-table {
    width: 100%;
    border-collapse: collapse;
  }
  .b-dashboard-customers-detail__club-table th {
    text-align: start;
    padding: 0 10px 10px !important;
  }
  .b-dashboard-customers-detail__club-table td {
    padding: 14px 10px !important;
    vertical-align: middle;
    font-size: 12px;
    font-weight: 400;
    font-variant-numeric: tabular-nums;
    border-block-start: 1px solid var(--sd-modern-border);
  }
  .b-dashboard-customers-detail__club-identity {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .b-dashboard-customers-detail__club-identity img {
    flex: 0 0 28px;
  }
  .b-dashboard-customers-detail__club-identity .sd-modern-status {
    font-size: 11px;
  }
  .b-dashboard-customers-detail__inactive {
    background: var(--sd-modern-muted);
  }
  .b-dashboard-customers-detail__club-action {
    width: 56px;
    text-align: end;
  }
  .b-dashboard-customers-detail__club-expanded td {
    padding-block-start: 0 !important;
    border: 0;
  }
  .b-dashboard-customers-detail__expanded-content {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px 18px;
    background: var(--sd-modern-inset);
    border-radius: 9px;
    padding: 10px 14px;
    overflow-wrap: anywhere;
  }
  :deep(.u--price) {
    font: inherit;
  }

  @media (max-width: 780px) {
    .b-dashboard-customers-detail__plots {
      grid-template-columns: minmax(0, 1fr);
      gap: 23px;
    }
    .b-dashboard-customers-detail__plots > section + section {
      padding-inline-start: 0;
      border-inline-start: 0;
      padding-block-start: 20px;
      border-block-start: 1px solid var(--sd-modern-border);
    }
    .b-dashboard-customers-detail__club-table,
    .b-dashboard-customers-detail__club-table tbody {
      display: block;
    }
    .b-dashboard-customers-detail__club-table thead {
      display: none;
    }
    .b-dashboard-customers-detail__club-row {
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) 44px;
      gap: 8px 15px;
      border-block-start: 1px solid var(--sd-modern-border);
      padding-block: 17px;
    }
    .b-dashboard-customers-detail__club-table td {
      padding: 0 !important;
      border: 0;
      border-block-end: 0 !important;
      text-align: start;
    }
    .b-dashboard-customers-detail__club-id-cell {
      grid-column: 1 / 3;
    }
    .b-dashboard-customers-detail__club-table td[data-label]::before {
      display: block;
      content: attr(data-label);
    }
    .b-dashboard-customers-detail__club-action {
      grid-column: 3;
      grid-row: 1 / 3;
      width: auto;
    }
    .b-dashboard-customers-detail__club-expanded,
    .b-dashboard-customers-detail__club-expanded td {
      display: block;
    }
    .b-dashboard-customers-detail__club-expanded td {
      padding-block-end: 12px !important;
    }
  }
  @media (max-width: 520px) {
    .sd-modern-widget {
      padding: 17px 15px;
    }
  }
}

.b-dashboard-customers-detail {
  display: grid;
  gap: 20px;
  min-width: 0;
  font-family: inherit;
  &__stats {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    margin: 0 0 16px;
  }
  &__stats dt,
  &__benefits dt {
    font-size: 12px;
    color: var(--sd-modern-muted);
  }
  &__stats dd {
    margin: 6px 0 0;
    font-size: 26px;
    font-weight: 400;
    font-variant-numeric: tabular-nums;
  }
  &__clubs {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 20px;
  }
  &__club {
    min-width: 0;
  }
  &__club h3 {
    font: inherit;
    font-size: 14px;
    font-weight: 500;
  }
  &__benefits {
    margin-block: 14px 8px;
  }
  &__benefits > div {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    justify-content: space-between;
    column-gap: 8px;
    padding-block: 4px;
  }
  &__benefits dd {
    margin: 0;
    font-size: 14px;
    font-weight: 400;
    font-variant-numeric: tabular-nums;
  }
  &__benefits :deep(.u--price) {
    font-weight: 400;
  }
  &__description {
    font-size: 12px;
    color: var(--sd-modern-muted);
    overflow-wrap: anywhere;
  }
  @media (max-width: 1100px) {
    &__clubs {
      grid-template-columns: repeat(3, minmax(150px, 1fr));
    }
  }
  @media (max-width: 700px) {
    &__clubs {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
  @media (max-width: 420px) {
    &__clubs {
      grid-template-columns: minmax(0, 1fr);
    }
    &__stats {
      grid-template-columns: minmax(0, 1fr);
      gap: 14px;
    }
  }
}
.s--shop-dashboard-customers-modern {
  :deep(> .widget-body) {
    margin: 0 !important;
  }
  :deep(> .widget-body > .border-top) {
    border-color: var(--sd-modern-border) !important;
  }
  .v-container {
    padding: 0;
    container-type: inline-size;
  }
  &__clubs-header {
    margin-block: 24px 12px;
    padding-block-start: 24px;
    border-block-start: 1px solid var(--sd-modern-border);
  }
  &__clubs {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 150px), 1fr));
    gap: 24px 20px;
    margin: 0;
  }
  &__club {
    flex: none;
    min-width: 0;
    width: 100%;
    max-width: 100%;
    padding: 0;
  }
  &__club > .text-subtitle-2 {
    overflow-wrap: normal;
    word-break: normal;
  }
  &__stats {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    grid-template-rows: auto auto;
    row-gap: 6px;
    margin: 8px 0 0;
  }
  &__stats > div {
    min-width: 0;
    display: grid;
    grid-row: span 2;
    // Keep figures aligned when translated labels wrap to different heights.
    grid-template-rows: subgrid;
  }
  &__stat-label {
    display: flex;
    align-items: baseline;
    gap: 6px;
    color: var(--sd-modern-muted);
    font-size: 12px;
    line-height: 1.4;
  }
  &__stat-label > .v-icon {
    flex-shrink: 0;
  }
  &__stat-value {
    margin: 0;
    font-size: 24px;
    font-weight: 400;
    line-height: 1.3;
  }
  &--summary {
    padding-block: 20px;
    .sd-modern-header {
      gap: 8px;
      margin-block-end: 10px;
    }
    .s--shop-dashboard-customers-modern__stats {
      grid-template-columns: repeat(3, minmax(0, 1fr));
      column-gap: 12px;
      row-gap: 6px;
      margin-block: 0 !important;
      padding-block: 6px;
      text-align: start !important;
    }
    .s--shop-dashboard-customers-modern__stat-value {
      font-size: 22px;
    }
    .s--shop-dashboard-customers-modern__clubs-header {
      margin-block: 12px 6px;
      padding-block-start: 12px;
    }
    .v-container {
      order: 2;
    }
    :deep(> .widget-body > .border-top) {
      order: 1;
      border-block-start: 0 !important;
      margin-block-start: 0 !important;
    }
  }
  &__club-summary {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 4px 16px;
  }
  &__club-summary-row {
    display: flex;
    align-items: center;
    min-width: 0;
    min-height: 44px;
    padding: 5px 8px;
    gap: 8px;
    color: inherit;
    text-align: start;
    text-decoration: none;
    border-radius: 6px;
  }
  &__club-summary-row > img {
    flex: 0 0 24px;
  }
  &__club-summary-row > div {
    display: grid;
    min-width: 0;
    gap: 1px;
  }
  &__club-summary-name {
    font-size: 13px;
    font-weight: 500;
    line-height: 1.4;
    overflow-wrap: normal;
    word-break: normal;
  }
  &__club-summary-row small {
    color: var(--sd-modern-muted);
    font-size: 12px;
    line-height: 1.4;
  }
  &__club-summary-row small b {
    color: rgb(var(--v-theme-on-surface));
    font-weight: 400;
  }
  &__club-summary-row:hover {
    background: var(--sd-modern-inset);
  }
  &__club-summary-row:focus-visible {
    outline: 2px solid rgb(var(--v-theme-primary));
    outline-offset: 2px;
  }
  @container (max-width: 420px) {
    &__club-summary {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
  @container (max-width: 260px) {
    &__club-summary {
      grid-template-columns: minmax(0, 1fr);
    }
  }
  @container (min-width: 381px) and (max-width: 680px) {
    &__clubs {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
  @container (max-width: 380px) {
    &__clubs {
      grid-template-columns: minmax(0, 1fr);
    }
  }
  @media (max-width: 600px) {
    &__stats {
      grid-template-columns: minmax(0, 1fr);
      row-gap: 16px;
    }
  }
}
/*
━━━━━━━━━━━━━━━━━━━━ 🎺 Variables ━━━━━━━━━━━━━━━━━━━━
 */

/*
━━━━━━━━━━━━━━━━━━━━ 🪅 Classes ━━━━━━━━━━━━━━━━━━━━
 */
</style>
