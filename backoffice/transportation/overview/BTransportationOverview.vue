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
  <div v-if="modern" class="b-transportation-overview text-start">
    <div class="b-transportation-overview__capacity">
      <dl class="b-transportation-overview__facts">
        <div>
          <dt>{{ $t('global.commons.distance') }}</dt>
          <dd><bdi>{{ numeralFormat(transportation.distance, '0,0') }} {{ distance_unit }}</bdi></dd>
        </div>
        <div>
          <dt>{{ $t('global.commons.weight') }}</dt>
          <dd><bdi>{{ numeralFormat(transportation.max_weight, '0,0') }} {{ mass_unit }}</bdi></dd>
        </div>
        <div>
          <dt>{{ $t('global.commons.size') }}</dt>
          <dd>
            <bdi dir="ltr" class="b-transportation-overview__dimensions">
              <span :title="$t('global.commons.width')">{{ numeralFormat(transportation.max_w, '0,0') }} {{ size_unit }}</span>
              ×
              <span :title="$t('global.commons.length')">{{ numeralFormat(transportation.max_l, '0,0') }} {{ size_unit }}</span>
              ×
              <span :title="$t('global.commons.height')">{{ numeralFormat(transportation.max_h, '0,0') }} {{ size_unit }}</span>
            </bdi>
          </dd>
        </div>
      </dl>
      <v-tooltip v-if="showButtons" :text="$t('transportation_page.overview.edit_settings')" location="top" content-class="sd-modern-tooltip">
        <template #activator="{ props }">
          <v-btn v-bind="props" class="sd-modern-icon-button" icon variant="text"
            :aria-label="$t('transportation_page.overview.edit_settings')"
            :to="{ name: 'BPageTransportationSetting', params: { transportation_id: transportation.id } }" @click.stop>
            <v-icon size="16" aria-hidden="true">edit</v-icon>
          </v-btn>
        </template>
      </v-tooltip>
    </div>

    <dl class="b-transportation-overview__schedule">
      <div>
        <dt>{{ $t('global.commons.days') }}</dt>
        <dd>{{ transportation.days.map(it => $t(WeekDays[it].name)).join(' · ') }}</dd>
      </div>
      <div>
        <dt>{{ $t('global.commons.timespan') }}</dt>
        <dd class="b-transportation-overview__timespans">
          <img v-for="timespan in transportation.time_spans" :key="timespan" :src="TimeSpans[timespan].icon"
            :alt="$t(TimeSpans[timespan].name)" :title="$t(TimeSpans[timespan].name)" width="20" height="20" />
        </dd>
      </div>
      <div>
        <dt>{{ $t('global.commons.holiday') }}</dt>
        <dd class="b-transportation-overview__boolean">
          <v-icon size="14" :color="transportation.holidays ? 'success' : undefined" aria-hidden="true">{{ transportation.holidays ? 'check' : 'close' }}</v-icon>
          {{ $t(transportation.holidays ? 'global.actions.yes' : 'global.actions.no') }}
        </dd>
      </div>
    </dl>

    <dl class="b-transportation-overview__fees">
      <div>
        <dt>{{ $t('global.commons.cod') }}</dt>
        <dd class="b-transportation-overview__boolean">
          <v-icon size="14" :color="transportation.cod ? 'success' : undefined" aria-hidden="true">{{ transportation.cod ? 'check' : 'close' }}</v-icon>
          {{ $t(transportation.cod ? 'global.actions.yes' : 'global.actions.no') }}
        </dd>
      </div>
      <div>
        <dt>{{ $t('global.commons.sod') }}</dt>
        <dd class="b-transportation-overview__boolean">
          <v-icon size="14" :color="transportation.sod ? 'success' : undefined" aria-hidden="true">{{ transportation.sod ? 'check' : 'close' }}</v-icon>
          {{ $t(transportation.sod ? 'global.actions.yes' : 'global.actions.no') }}
        </dd>
      </div>
      <template v-if="!transportation.sod">
        <div>
          <dt>{{ $t('global.commons.free_shipping') }}</dt>
          <dd class="b-transportation-overview__boolean">
            <v-icon size="14" :color="transportation.free_shipping ? 'success' : undefined" aria-hidden="true">{{ transportation.free_shipping ? 'check' : 'close' }}</v-icon>
            {{ $t(transportation.free_shipping ? 'global.actions.yes' : 'global.actions.no') }}
          </dd>
        </div>
        <div v-if="transportation.free_shipping">
          <dt>{{ $t('global.commons.min_purchase') }}</dt>
          <dd><u-price :amount="transportation.free_shipping_limit" :currency="transportation.currency" /></dd>
        </div>
      </template>
    </dl>

    <div class="b-transportation-overview__connections">
      <div v-if="showButtons || user_ids?.length" class="b-transportation-overview__connection">
        <span class="b-transportation-overview__connection-label">{{ $t('global.commons.delivery_persons') }} <span>{{ user_ids.length }}</span></span>
        <div class="b-transportation-overview__identities">
          <u-dense-circles-users v-if="user_ids.length" :ids="user_ids" :limit="10" :size="24" />
          <span v-else class="b-transportation-overview__none">{{ $t('global.commons.none') }}</span>
        </div>
        <div v-if="showButtons" class="b-transportation-overview__actions">
          <v-tooltip :text="$t('transportation_page.overview.add_courier')" location="top" content-class="sd-modern-tooltip">
            <template #activator="{ props }">
              <v-btn v-bind="props" class="sd-modern-icon-button" icon variant="text"
                :aria-label="$t('transportation_page.overview.add_courier')"
                :to="{ name: 'BPageTransportationCouriers', params: { transportation_id: transportation.id } }" @click.stop>
                <v-icon size="16" aria-hidden="true">add</v-icon>
              </v-btn>
            </template>
          </v-tooltip>
          <v-tooltip :text="$t('transportation_page.go_to_courier_list')" location="top" content-class="sd-modern-tooltip">
            <template #activator="{ props }">
              <v-btn v-bind="props" class="sd-modern-button sd-modern-button--small" variant="text"
                :aria-label="$t('transportation_page.go_to_courier_list')"
                :to="{ name: 'BPageTransportationCouriers', params: { transportation_id: transportation.id } }" @click.stop>
                {{ $t('global.actions.view') }}
                <v-icon size="16" end aria-hidden="true">{{ $t('icons.chevron_next') }}</v-icon>
              </v-btn>
            </template>
          </v-tooltip>
        </div>
      </div>

      <div v-if="showButtons || service_ids?.length" class="b-transportation-overview__connection">
        <span class="b-transportation-overview__connection-label">{{ $t('global.commons.delivery_services') }} <span>{{ service_ids.length }}</span></span>
        <div class="b-transportation-overview__identities">
          <template v-if="service_ids.length">
            <img v-for="id in service_ids" :key="id" :src="DeliveryServiceHelper.GetDeliveryServiceIconById(id, IMAGE_SIZE_SMALL)"
              class="hover-scale-small" alt="" width="24" height="24" />
          </template>
          <span v-else class="b-transportation-overview__none">{{ $t('global.commons.none') }}</span>
        </div>
        <div v-if="showButtons" class="b-transportation-overview__actions">
          <v-tooltip :text="$t('transportation_page.overview.add_service')" location="top" content-class="sd-modern-tooltip">
            <template #activator="{ props }">
              <v-btn v-bind="props" class="sd-modern-icon-button" icon variant="text"
                :aria-label="$t('transportation_page.overview.add_service')"
                :to="{ name: 'BPageTransportationServices', params: { transportation_id: transportation.id } }" @click.stop>
                <v-icon size="16" aria-hidden="true">add</v-icon>
              </v-btn>
            </template>
          </v-tooltip>
          <v-tooltip :text="$t('transportation_page.go_to_service_list')" location="top" content-class="sd-modern-tooltip">
            <template #activator="{ props }">
              <v-btn v-bind="props" class="sd-modern-button sd-modern-button--small" variant="text"
                :aria-label="$t('transportation_page.go_to_service_list')"
                :to="{ name: 'BPageTransportationServices', params: { transportation_id: transportation.id } }" @click.stop>
                {{ $t('global.actions.view') }}
                <v-icon size="16" end aria-hidden="true">{{ $t('icons.chevron_next') }}</v-icon>
              </v-btn>
            </template>
          </v-tooltip>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="text-start">
    <!-- Top End Buttons -->
    <div v-if="showButtons" class="absolute-top-end text-center">
      <v-btn
        class="mx-1"
        icon
        variant="text"
        @click.stop="
          $router.push({
            name: 'BPageTransportationSetting',
            params: { transportation_id: transportation.id },
          })
        "
      >
        <v-icon size="small"> edit</v-icon>
      </v-btn>
    </div>

    <!-- Play / Pause Mode & Create dates -->
    <div class="d-flex align-items-center">
      <img
        :class="{ 'img-grayscale': !transportation.enable }"
        :src="
          transportation.logo
            ? getShopImagePath(transportation.logo)
            : transportationObj.icon
        "
        class="me-2"
        height="48"
        width="48"
      />

      <div class="flex-grow-1">
        <p class="m-1 small">
          {{ $t("global.commons.distance") }}:
          <b
            >{{ numeralFormat(transportation.distance, "0,0") }}
            {{ distance_unit }}</b
          >
        </p>

        <p class="m-1 small">
          {{ $t("global.commons.weight") }}:
          <b
            >{{ numeralFormat(transportation.max_weight, "0,0") }}
            {{ mass_unit }}</b
          >
        </p>
        <p class="m-1 small">
          {{ $t("global.commons.size") }}:
          <span dir="ltr">
            <b :title="$t('global.commons.width')"
              >{{ numeralFormat(transportation.max_w, "0,0") }} {{ size_unit }}
            </b>
            <v-icon class="mx-1" size="small">fa:fas fa-times</v-icon>
            <b :title="$t('global.commons.length')"
              >{{ numeralFormat(transportation.max_l, "0,0") }} {{ size_unit }}
            </b>
            <v-icon class="mx-1" size="small">fa:fas fa-times</v-icon>
            <b :title="$t('global.commons.height')"
              >{{ numeralFormat(transportation.max_h, "0,0") }} {{ size_unit }}
            </b></span
          >
        </p>
      </div>
    </div>
    <hr class="my-3" />
    <p class="mb-1">
      <small class="me-1">{{ $t("global.commons.days") }}:</small>
      <b>{{
        transportation.days.map((it) => $t(WeekDays[it].name)).join(" , ")
      }}</b>
    </p>
    <p class="mb-1">
      <small class="me-1">{{ $t("global.commons.timespan") }}:</small>
      <img
        v-for="timespan in transportation.time_spans"
        :key="timespan"
        :src="TimeSpans[timespan].icon"
        :title="$t(TimeSpans[timespan].name)"
        class="mx-2"
        height="24"
        width="24"
      />
    </p>
    <p class="mb-1">
      <small class="me-1">{{ $t("global.commons.holiday") }}:</small>
      <u-check :model-value="transportation.holidays" read-only></u-check>
    </p>
    <hr class="my-3" />

    <div class="d-flex">
      <p class="mb-1 w-50">
        <small class="me-1">{{ $t("global.commons.cod") }}:</small>
        <v-chip
          v-if="transportation.cod"
          prepend-icon="monetization_on"
          append-icon="check_circle"
          variant="elevated"
          color="#1976D2"
          size="small"
        >
          COD
        </v-chip>
        <u-check v-else :model-value="transportation.cod" read-only></u-check>
      </p>
      <p class="mb-1 w-50">
        <small class="me-1">{{ $t("global.commons.sod") }}:</small>
        <u-check :model-value="transportation.sod" read-only></u-check>
      </p>
    </div>

    <div v-if="!transportation.sod" class="d-flex">
      <p class="mb-1 w-50">
        <small class="me-1">{{ $t("global.commons.free_shipping") }}:</small>
        <u-check
          :model-value="transportation.free_shipping"
          read-only
        ></u-check>
      </p>
      <p v-if="transportation.free_shipping" class="mb-1 w-50">
        <small class="me-1">{{ $t("global.commons.min_purchase") }}:</small>
        <u-price
          :amount="transportation.free_shipping_limit"
          :currency="transportation.currency"
        >
        </u-price>
      </p>
    </div>
    <div v-else style="min-height: 26px"></div>

    <div
      v-if="showButtons || user_ids?.length"
      style="border-radius: 12px; border: solid thin #aaa"
      class="mt-1 mx-n1 pa-1 d-flex align-stretch"
    >
      <div class="flex-grow-1">
        <small>
          <v-icon class="me-1">people</v-icon>
          {{ $t("global.commons.delivery_persons") }}:</small
        >
        <u-dense-circles-users
          :add="showButtons"
          :ids="user_ids"
          :limit="10"
          @click:add="
            $router.push({
              name: 'BPageTransportationCouriers',
              params: { transportation_id: transportation.id },
            })
          "
        ></u-dense-circles-users>
      </div>

      <div v-if="showButtons" class="flex-grow-0" style="width: 72px">
        <v-btn
          :outlined="outlined"
          @click.stop
          :to="{
            name: 'BPageTransportationCouriers',
            params: { transportation_id: transportation.id },
          }"
          color="#111"
          size="x-large"
          variant="flat"
          stacked
          class="text-wrap tnt text-center px-1"
          density="compact"
          min-width="0"
          height="100%"
          rounded="e-lg"
        >
          <v-icon class="ms-1">{{ $t("icons.chevron_next") }}</v-icon>
          <span style="font-size: 8px">
            {{ $t("transportation_page.go_to_courier_list") }}</span
          >
        </v-btn>
      </div>
    </div>

    <div
      v-if="showButtons || service_ids?.length"
      style="border-radius: 12px; border: solid thin #aaa"
      class="mt-1 mx-n1 pa-1 d-flex align-stretch"
    >
      <div class="flex-grow-1">
        <small>
          <v-icon class="me-1">business</v-icon>
          {{ $t("global.commons.delivery_services") }}:</small
        >

        <div style="padding: 11px">
          <img
            v-for="id in service_ids"
            :key="id"
            :src="DeliveryServiceHelper.GetDeliveryServiceIconById(id, IMAGE_SIZE_SMALL)"
            class="me-2"
            height="32"
            width="32"
          />
          <v-btn
            v-if="showButtons"
            :size="32"
            @click.stop
            :to="{
              name: 'BPageTransportationServices',
              params: { transportation_id: transportation.id },
            }"
            class="ms-2 hover-scale-small"
            color="success"
            icon
            variant="flat"
          >
            <v-icon size="20">add</v-icon>
          </v-btn>
        </div>
      </div>

      <div v-if="showButtons" class="flex-grow-0" style="width: 72px">
        <v-btn
          :outlined="outlined"
          @click.stop
          :to="{
            name: 'BPageTransportationServices',
            params: { transportation_id: transportation.id },
          }"
          color="#111"
          size="x-large"
          variant="flat"
          stacked
          class="text-wrap tnt text-center px-1"
          density="compact"
          min-width="0"
          height="100%"
          rounded="e-lg"
        >
          <v-icon class="ms-1">{{ $t("icons.chevron_next") }}</v-icon>
          <span style="font-size: 8px">
            {{ $t("transportation_page.go_to_service_list") }}</span
          >
        </v-btn>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { ShopTransportations } from "@selldone/core-js/enums/logistic/ShopTransportations";
import { WeekDays } from "@selldone/core-js/enums/logistic/WeekDays";
import { TimeSpans } from "@selldone/core-js/enums/logistic/TimeSpans";
import UDenseCirclesUsers from "../../../ui/dense-circles/users/UDenseCirclesUsers.vue";
import { ShopOptionsHelper } from "@selldone/core-js/helper/shop/ShopOptionsHelper";
import {DeliveryServiceHelper} from "@selldone/core-js/helper";

export default {
  name: "BTransportationOverview",
  components: {
    UDenseCirclesUsers,
  },
  props: {
    modern: { type: Boolean, default: false },
    shop: { require: true },

    transportation: { require: true },
    outlined: { type: Boolean, default: false },
    showButtons: { type: Boolean, default: true },
  },

  data() {
    return {
      WeekDays: WeekDays,
      TimeSpans: TimeSpans,
    };
  },

  computed: {
    DeliveryServiceHelper() {
      return DeliveryServiceHelper
    },
    transportationObj() {
      return ShopTransportations[this.transportation.type];
    },
    info() {
      return this.transportation.info;
    },
    user_ids() {
      return this.info?.user_ids ? this.info.user_ids : [];
    },
    service_ids() {
      return this.info?.service_ids ? this.info.service_ids : [];
    },

    size_unit() {
      return ShopOptionsHelper.GetSizeUnit(this.shop);
    },

    distance_unit() {
      return ShopOptionsHelper.GetDistanceUnit(this.shop);
    },
    mass_unit() {
      return ShopOptionsHelper.GetMassUnit(this.shop);
    },
  },

  methods: {},
};
</script>

<style lang="scss" scoped>
.b-transportation-overview {
  min-width: 0;
  font-family: inherit;
  font-size: 12px;
  line-height: 1.5;
  color: rgb(var(--v-theme-on-surface));

  dl, dd { margin: 0; }
  dt { color: var(--sd-modern-muted); font-size: 11px; font-weight: 400; }
  dd { min-width: 0; font-size: 12px; font-weight: 400; font-variant-numeric: tabular-nums; overflow-wrap: anywhere; }

  &__capacity { display: flex; align-items: flex-start; gap: 12px; padding-block-end: 12px; }
  &__facts { display: grid; flex: 1; min-width: 0; grid-template-columns: 1fr 1fr minmax(0, 1.7fr); gap: 12px; }
  &__facts dd { margin-block-start: 3px; }
  &__dimensions span { white-space: nowrap; }

  &__schedule { display: grid; gap: 7px; padding-block: 12px; border-block-start: 1px solid var(--sd-modern-border); }
  &__schedule > div { display: grid; grid-template-columns: 78px minmax(0, 1fr); align-items: start; gap: 12px; }
  &__timespans { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
  &__timespans img { object-fit: contain; }
  &__boolean { display: flex; align-items: center; gap: 4px; }

  &__fees { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px 18px; padding-block: 12px; border-block-start: 1px solid var(--sd-modern-border); }
  &__fees > div { display: flex; flex-wrap: wrap; align-items: baseline; justify-content: space-between; gap: 3px 8px; }
  &__fees dd { flex-shrink: 0; }

  &__connections { border-block-start: 1px solid var(--sd-modern-border); }
  &__connection { display: grid; grid-template-columns: minmax(86px, 0.4fr) minmax(0, 1fr) auto; align-items: center; gap: 10px; padding-block-start: 10px; min-height: 46px; }
  &__connection-label { color: var(--sd-modern-muted); font-size: 11px; }
  &__connection-label > span { margin-inline-start: 5px; font-variant-numeric: tabular-nums; }
  &__identities { display: flex; flex-wrap: wrap; align-items: center; gap: 7px; min-width: 0; }
  &__identities > img { object-fit: contain; }
  &__identities :deep(.circles-container) { padding: 3px !important; overflow: visible; min-width: 0; }
  &__none { color: var(--sd-modern-muted); font-size: 11px; }
  &__actions { display: flex; align-items: center; gap: 5px; }
  &__actions .sd-modern-button { padding-inline: 8px; }
}

@media (max-width: 700px) {
  .b-transportation-overview {
    &__connection { grid-template-columns: minmax(0, 1fr) auto; gap: 5px 10px; }
    &__identities { grid-column: 1 / -1; grid-row: 2; }
    &__actions { grid-column: 2; grid-row: 1; }
    &__facts { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    &__facts > div:last-child { grid-column: 1 / -1; }
    &__schedule > div { grid-template-columns: 70px minmax(0, 1fr); gap: 8px; }
  }
}

@media (prefers-reduced-motion: reduce) {
  .b-transportation-overview__identities :deep(.circles-container .citm) { transition: none; }
}
</style>
