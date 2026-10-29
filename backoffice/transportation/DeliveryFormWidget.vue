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
  <div
    class="b-transportation-form text-start font-weight-regular"
    :class="
      modern
        ? 'b-transportation-form--modern sd-modern-underlined-field'
        : 'p-2 content-container'
    "
    v-bind="$attrs"
  >
    <div :class="{ 'b-transportation-form__layout': modern }">
      <nav
        v-if="modern"
        class="b-transportation-form__navigation sd-modern-section-nav"
        :aria-label="$t('transportation_page.menu.setting')"
      >
        <v-btn
          v-for="section in settingsSections"
          :key="section.ref"
          variant="text"
          class="sd-modern-button sd-modern-section-nav__item"
          :aria-current="activeSection === section.ref ? 'location' : undefined"
          :ripple="false"
          @click="activeSection = section.ref"
        >
          <v-icon size="17">{{ section.icon }}</v-icon>
          <span>{{ $t(section.label) }}</span>
        </v-btn>
      </nav>
      <div :class="{
        'b-transportation-form__main': modern,
        'b-transportation-form__main--calculator': modern && activeSection === 'calculator',
      }">
        <div
          :class="{
            'b-transportation-form__sections': modern,
            'sd-modern-widget': modern && !['rates', 'calculator'].includes(activeSection),
          }"
        >
          <!-- ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄  General ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄ -->

          <div
            ref="general"
            v-show="!modern || activeSection === 'general'"
            :class="
              modern ? 'b-transportation-form__section' : 'widget-box mb-5'
            "
          >
            <u-widget-header
              :title="$t(modern ? 'transportation_manage.settings.sections.general' : 'global.commons.general_config')"
              icon="tune"
            ></u-widget-header>

            <v-list-subheader class="b-transportation-form__hint">
              <span>{{
                modern
                  ? $t("transportation_manage.settings.general_hint")
                  : "Configuration of the overall shipping settings for the store."
              }}</span>
              <v-tooltip v-if="modern" location="top" content-class="sd-modern-tooltip text-start" open-on-focus open-on-click>
                <template #activator="{ props }">
                  <v-btn v-bind="props" class="sd-modern-icon-button sd-modern-info-button" variant="text" icon
                    :aria-label="$t('transportation_manage.settings.help_label', { section: $t('transportation_manage.settings.sections.general') })">
                    <v-icon size="18">info_outline</v-icon>
                  </v-btn>
                </template>
                {{ $t('transportation_manage.settings.help.general') }}
              </v-tooltip>
            </v-list-subheader>

            <u-smart-switch
              v-model="transportation.enable"
              :accessible="modern"
              :border="modern"
              :false-title="$t('global.commons.disable')"
              :true-title="$t('global.commons.enable')"
              class="b-transportation-form__smart-control mb-5 mt-3"
              :false-description="
                modern
                  ? $t('transportation_manage.settings.unavailable')
                  : 'The shipping method is unavailable.'
              "
              false-gray
              false-icon="close"
              :true-description="
                modern
                  ? $t('transportation_manage.settings.available')
                  : 'Customers can select this shipping method.'
              "
              true-icon="check"
            ></u-smart-switch>

            <div :class="{ 'sd-modern-form-grid b-transportation-form__fields': modern }">
              <v-text-field
                v-if="modern"
                v-model="transportation.title"
                class="sd-modern-underlined-field"
                :label="$t('global.commons.title')"
                variant="underlined"
              />
              <u-currency-input
                v-model="transportation.currency"
                :class="{ 'sd-modern-underlined-field': modern }"
                :label="
                  $t(
                    'admin_shop.logistic.delivery.delivery_form.currency_input',
                  )
                "
                :messages="
                  $t(
                    'admin_shop.logistic.delivery.delivery_form.currency_input_message',
                  )
                "
                :return-object="false"
                variant="underlined"
              ></u-currency-input>
            </div>
            <s-image-uploader
              v-if="modern && transportation.id"
              class="b-transportation-form__field"
              :image="getShopImagePath(transportation.logo)"
              :server="
                window.API.POST_UPLOAD_TRANSPORTATION_LOGO(
                  shop.id,
                  transportation.id,
                )
              "
              auto-compact
              :label="$t('transportation_manage.settings.custom_logo')"
              maxFileSize="256kb"
              @new-path="(path) => (transportation.logo = path)"
            />
            <p v-if="modern && transportation.id" class="b-transportation-form__secondary mt-2">
              {{ $t('transportation_manage.settings.logo_saved_separately') }}
            </p>
          </div>

          <!-- ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄  Customize ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄ -->
          <div v-if="!modern" class="widget-box mb-5">
            <u-widget-header
              :title="$t('global.commons.customize')"
              icon="design_services"
            >
            </u-widget-header>
            <v-list-subheader
              >{{
                modern
                  ? $t("transportation_manage.settings.customize_hint")
                  : "Personalize the name and logo of your transportation service."
              }}
            </v-list-subheader>

            <v-text-field
              v-model="transportation.title"
              :label="$t('global.commons.title')"
              variant="underlined"
            ></v-text-field>

            <s-image-uploader
              v-if="transportation.id"
              :image="getShopImagePath(transportation.logo)"
              :server="
                window.API.POST_UPLOAD_TRANSPORTATION_LOGO(
                  shop.id,
                  transportation.id,
                )
              "
              auto-compact
              :label="
                modern
                  ? $t('transportation_manage.settings.custom_logo')
                  : 'Custom logo'
              "
              maxFileSize="256kb"
              @new-path="(path) => (transportation.logo = path)"
            />
          </div>

          <!-- ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄  Limits ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄ -->

          <div
            ref="limits"
            v-show="!modern || activeSection === 'limits'"
            :class="
              modern ? 'b-transportation-form__section' : 'widget-box mb-5'
            "
          >
            <u-widget-header
              :title="$t(modern ? 'transportation_manage.settings.sections.limits' : 'admin_shop.logistic.delivery.delivery_form.limits')"
              :icon="modern ? 'inventory_2' : 'archive'"
            ></u-widget-header>

            <v-list-subheader class="b-transportation-form__hint">
              <span v-if="modern">{{
                $t("transportation_manage.settings.limits_hint")
              }}</span>
              <span v-else
                >Once these limits are set, we will use them to determine
                whether a particular shipping destination is available for a
                given product.</span>
              <v-tooltip v-if="modern" location="top" content-class="sd-modern-tooltip text-start" open-on-focus open-on-click>
                <template #activator="{ props }">
                  <v-btn v-bind="props" class="sd-modern-icon-button sd-modern-info-button" variant="text" icon
                    :aria-label="$t('transportation_manage.settings.help_label', { section: $t('transportation_manage.settings.sections.limits') })">
                    <v-icon size="18">info_outline</v-icon>
                  </v-btn>
                </template>
                {{ $t('transportation_manage.settings.help.limits') }}
              </v-tooltip>
            </v-list-subheader>

            <div :class="{ 'sd-modern-form-grid b-transportation-form__fields': modern }">
              <u-number-input
                v-model="transportation.distance"
                :label="
                  $t(
                    modern ? 'transportation_manage.settings.fields.maximum_distance' : 'admin_shop.logistic.delivery.delivery_form.distance_input',
                  )
                "
                :max="100000"
                :messages="modern ? undefined : `${$t(
                  'admin_shop.logistic.delivery.delivery_form.distance_input_message',
                )}`"
                :min="-1"
                :suffix="getDistanceDimension(shop)"
                prepend-inner-icon="fa:fas fa-drafting-compass"
                variant="underlined"
              />

              <u-number-input
                v-model="transportation.max_weight"
                :label="
                  $t(
                    modern ? 'transportation_manage.settings.fields.maximum_weight' : 'admin_shop.logistic.delivery.delivery_form.max_weight_input',
                  )
                "
                :max="100000"
                :messages="modern ? undefined : `${$t(
                  'admin_shop.logistic.delivery.delivery_form.max_weight_input_message',
                )}`"
                :min="-1"
                :suffix="getWeightDimension(shop)"
                prepend-inner-icon="fa:fas fa-weight-hanging"
                variant="underlined"
              />
            </div>
          </div>
          <!-- ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄ Package Limits ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄ -->

          <div
            v-show="!modern || activeSection === 'limits'"
            :class="
              modern ? 'b-transportation-form__section b-transportation-form__section--continued' : 'widget-box mb-5'
            "
          >
            <u-widget-header
              :title="
                $t(modern ? 'transportation_manage.settings.max_package_title' : 'admin_shop.logistic.delivery.delivery_form.max_size_input')
              "
              :icon="modern ? 'straighten' : 'fa:fas fa-ruler-combined'"
            ></u-widget-header>

            <v-list-subheader class="b-transportation-form__hint">
              <span v-if="modern">{{
                $t("transportation_manage.settings.package_hint")
              }}</span>
              <span v-else
                >Enter the appropriate dimensions for the maximum packaging
                size, taking into account the size and weight of the products
                that you sell and the capabilities of your shipping
                carriers.</span>
              <v-tooltip v-if="modern" location="top" content-class="sd-modern-tooltip text-start" open-on-focus open-on-click>
                <template #activator="{ props }">
                  <v-btn v-bind="props" class="sd-modern-icon-button sd-modern-info-button" variant="text" icon
                    :aria-label="$t('transportation_manage.settings.help_label', { section: $t('transportation_manage.settings.max_package_title') })">
                    <v-icon size="18">info_outline</v-icon>
                  </v-btn>
                </template>
                {{ $t('transportation_manage.settings.help.package') }}
              </v-tooltip>
            </v-list-subheader>

            <div :class="{ 'b-transportation-form__dimensions b-transportation-form__fields': modern }">
              <u-number-input
                v-model="transportation.max_w"
                :label="$t(modern ? 'transportation_manage.settings.fields.maximum_width' : 'admin_shop.logistic.delivery.delivery_form.width')"
                :max="100000"
                :min="-1"
                :suffix="getBoxSizeDimension(shop)"
                variant="underlined"
              />

              <u-number-input
                v-model="transportation.max_l"
                :label="$t(modern ? 'transportation_manage.settings.fields.maximum_length' : 'admin_shop.logistic.delivery.delivery_form.length')"
                :max="100000"
                :min="-1"
                :suffix="getBoxSizeDimension(shop)"
                variant="underlined"
              />

              <u-number-input
                v-model="transportation.max_h"
                :label="$t(modern ? 'transportation_manage.settings.fields.maximum_height' : 'admin_shop.logistic.delivery.delivery_form.height')"
                :max="100000"
                :min="-1"
                :suffix="getBoxSizeDimension(shop)"
                variant="underlined"
              />
            </div>
            <u-cube
              v-if="!modern"
              :size="modern ? 140 : 200"
              :x="transportation.max_w"
              :y="transportation.max_l"
              :z="transportation.max_h"
            />
          </div>

          <!-- ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄ Week days / time ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄ -->

          <div
            ref="availability"
            v-show="!modern || activeSection === 'availability'"
            :class="
              modern ? 'b-transportation-form__section' : 'widget-box mb-5'
            "
          >
            <u-widget-header
              :title="
                $t(modern ? 'transportation_manage.settings.sections.availability' : 'admin_shop.logistic.delivery.delivery_form.days_input')
              "
              icon="date_range"
            ></u-widget-header>

            <v-list-subheader v-if="modern" class="b-transportation-form__hint"><span>{{
              $t("transportation_manage.settings.availability_hint")
            }}</span>
              <v-tooltip location="top" content-class="sd-modern-tooltip text-start" open-on-focus open-on-click>
                <template #activator="{ props }">
                  <v-btn v-bind="props" class="sd-modern-icon-button sd-modern-info-button" variant="text" icon
                    :aria-label="$t('transportation_manage.settings.help_label', { section: $t('transportation_manage.settings.sections.availability') })">
                    <v-icon size="18">info_outline</v-icon>
                  </v-btn>
                </template>
                {{ $t('transportation_manage.settings.help.availability') }}
              </v-tooltip>
            </v-list-subheader>

            <!--  ETA: the estimated time of arrival -->
            <u-smart-select
              v-model="eta"
              :accessible="modern"
              :border="modern"
              :items="etaItems"
              class="b-transportation-form__smart-control my-3"
              :hint="
                modern
                  ? $t('transportation_manage.settings.eta_hint')
                  : 'Ask for estimated time of arrival - preferred weekday, timeframe or date.'
              "
              item-description="description"
              item-text="title"
              item-value="code"
              :label="
                modern
                  ? $t('transportation_manage.settings.eta_mode')
                  : 'ETA Mode'
              "
              variant="underlined"
              @change="transportation.eta = eta"
            ></u-smart-select>

            <v-select
              v-if="
                [ETA.weekday_timeframe.code, ETA.weekday.code].includes(eta)
              "
              v-model="transportation.days"
              :class="{ 'b-transportation-form__field': modern }"
              :item-title="
                (item) => {
                  return $t(item.name);
                }
              "
              :items="dayItems"
              :label="$t('global.commons.days')"
              :messages="
                $t('admin_shop.logistic.delivery.delivery_form.days_input')
              "
              :no-data-text="
                $t(
                  'admin_shop.logistic.delivery.delivery_form.days_input_nodata',
                )
              "
              chips
              item-value="value"
              multiple
              prepend-inner-icon="fa:fas fa-calendar-week"
              variant="underlined"
            >
              <template v-slot:chip="{ item, props }">
                <v-chip
                  :class="
                    modern
                      ? 'b-transportation-form__choice'
                      : 'text-body-2 font-weight-bold'
                  "
                  v-bind="props"
                >
                  {{ $t(item.raw.name) }}
                </v-chip>
              </template>
            </v-select>

            <v-select
              v-if="
                [ETA.weekday_timeframe.code, ETA.timeframe.code].includes(eta)
              "
              v-model="transportation.time_spans"
              :class="{ 'b-transportation-form__field': modern }"
              :item-title="
                (item) => {
                  return $t(item.name);
                }
              "
              :items="timeItems"
              :label="$t('global.commons.timespan')"
              :messages="
                $t('admin_shop.logistic.delivery.delivery_form.hours_input')
              "
              :no-data-text="
                $t(
                  'admin_shop.logistic.delivery.delivery_form.hours_input_nodata',
                )
              "
              chips
              item-value="value"
              multiple
              prepend-inner-icon="fa:fas fa-clock"
              variant="underlined"
            >
              <template v-slot:chip="{ item, props }">
                <v-chip v-bind="props">
                  <v-avatar class="m-0">
                    <v-img :src="item.raw.icon" />
                  </v-avatar>
                  <span
                    :class="
                      modern
                        ? 'mx-1 b-transportation-form__choice'
                        : 'mx-1 text-body-2 font-weight-bold'
                    "
                    >{{ $t(item.raw.name) }}</span
                  >
                </v-chip>
              </template>
            </v-select>

            <template v-if="[ETA.date.code, ETA.date_time.code].includes(eta)">
              <u-number-input
                v-model="transportation.etd"
                :class="{ 'b-transportation-form__field': modern }"
                :label="
                  modern ? $t('transportation_manage.settings.etd') : 'ETD'
                "
                :messages="
                  modern
                    ? $t('transportation_manage.settings.etd_hint')
                    : 'The estimated time of departure.'
                "
                prepend-inner-icon="pending_actions"
                :suffix="
                  modern ? $t('transportation_manage.settings.hours') : 'hours'
                "
                variant="underlined"
              >
              </u-number-input>

              <div v-if="!modern" class="d-flex align-center small text-center">
                <span class="mx-2 text-muted">ETA date</span>

                <v-spacer></v-spacer>
                <b class="mx-2">{{ $t("global.commons.today") }} + </b>
                <div style="width: 90px">
                  <div style="background: #000; height: 8px"></div>
                  ETD ({{ transportation.etd }} h)
                </div>
                <div style="width: 130px">
                  <div style="background: #c20e0e; height: 4px"></div>
                  Max lead-time (🛍️)
                </div>
              </div>

              <v-list-subheader :class="{ 'b-transportation-form__field': modern }">
                <div v-if="modern">
                  {{
                    $t("transportation_manage.settings.etd_example", {
                      etd: transportation.etd,
                      total: transportation.etd + 48,
                    })
                  }}
                </div>
                <div v-else>
                  <b>Example:</b> Suppose a customer has two items in her cart
                  with lead times of 48 hours and 12 hours. If you input an
                  estimated time of delivery (ETD) of
                  <b>{{ transportation.etd }} hours</b>, the customer can choose
                  a delivery date starting from
                  <b>{{ transportation.etd + 48 }} hours </b> (48+{{
                    transportation.etd
                  }}) after today.
                </div>
              </v-list-subheader>
            </template>

            <hr class="my-5" />

            <u-smart-toggle
              v-model="transportation.holidays"
              :border="modern"
              :role="modern ? 'switch' : undefined"
              :tabindex="modern ? 0 : undefined"
              :aria-checked="modern ? !!transportation.holidays : undefined"
              :aria-label="$t('admin_shop.logistic.delivery.delivery_form.vacation_input')"
              @keydown.enter.prevent="modern && (transportation.holidays = !transportation.holidays)"
              @keydown.space.prevent="modern && (transportation.holidays = !transportation.holidays)"
              :false-title="$t('global.actions.no')"
              :label="
                $t('admin_shop.logistic.delivery.delivery_form.vacation_input')
              "
              :true-title="$t('global.actions.yes')"
              class="b-transportation-form__smart-control b-transportation-form__keyboard-toggle my-3"
              :false-description="
                modern
                  ? $t('transportation_manage.settings.holidays_false')
                  : 'I only deliver orders on business days.'
              "
              :true-description="
                modern
                  ? $t('transportation_manage.settings.holidays_true')
                  : 'I fulfill and deliver orders throughout the entire week.'
              "
            ></u-smart-toggle>
          </div>

          <!-- ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄ Payment options ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄ -->

          <div :class="modern ? null : 'widget-box mb-5'">
          <div
            ref="payment"
            v-show="!modern || activeSection === 'payment'"
            :class="
              modern ? 'b-transportation-form__section' : null
            "
          >
            <u-widget-header
              :title="$t(modern ? 'transportation_manage.settings.sections.payment' : 'admin_shop.logistic.delivery.delivery_form.payment')"
              icon="monetization_on"
            ></u-widget-header>

            <v-list-subheader class="b-transportation-form__hint">
              <span v-if="modern">{{
                $t("transportation_manage.settings.payment_hint")
              }}</span>
              <span v-else
                >For this shipping method, you can enable Cash on Delivery as a
                payment option. You can also choose whether or not to collect
                the shipping cost upon delivery.</span>
              <v-tooltip v-if="modern" location="top" content-class="sd-modern-tooltip text-start" open-on-focus open-on-click>
                <template #activator="{ props }">
                  <v-btn v-bind="props" class="sd-modern-icon-button sd-modern-info-button" variant="text" icon
                    :aria-label="$t('transportation_manage.settings.help_label', { section: $t('transportation_manage.settings.sections.payment') })">
                    <v-icon size="18">info_outline</v-icon>
                  </v-btn>
                </template>
                {{ $t('transportation_manage.settings.help.payment') }}
              </v-tooltip>
            </v-list-subheader>

            <u-smart-switch
              v-model="transportation.cod"
              :accessible="modern"
              :border="modern"
              :false-title="
                $t('admin_shop.logistic.delivery.delivery_form.cod_false')
              "
              :label="
                $t('admin_shop.logistic.delivery.delivery_form.cod_input')
              "
              :true-title="
                $t('admin_shop.logistic.delivery.delivery_form.cod_true')
              "
              class="b-transportation-form__smart-control mb-3"
              :class="{ 'max-widget-width': !modern }"
              :false-description="
                modern
                  ? $t('transportation_manage.settings.cod_false')
                  : 'Customers are restricted to choosing only the online payment method, as the Cash on Delivery (COD) option will not be visible to them.'
              "
              false-icon="payment"
              :true-description="
                modern
                  ? $t('transportation_manage.settings.cod_true')
                  : 'If the selected shipping method allows for Cash on Delivery (COD) payments, and a COD payment gateway is active for the chosen currency, then the customer can opt for COD payment.'
              "
              true-icon="local_atm"
              force-show-all
              false-gray
            ></u-smart-switch>
            <v-expand-transition :disabled="modern ? true : undefined">
              <div v-if="transportation.cod">
                <div v-if="modern" class="sd-modern-notice b-transportation-form__cod-help" role="status">
                  <v-icon size="18" :color="['missing', 'currency_missing', 'debug', 'disabled'].includes(codGatewayNotice) ? 'warning' : undefined" aria-hidden="true">
                    {{ ['missing', 'currency_missing', 'debug', 'disabled'].includes(codGatewayNotice) ? 'warning_amber' : 'info_outline' }}
                  </v-icon>
                  <div>
                    <h3>{{ $t('transportation_manage.settings.cod_gateways.title') }}</h3>
                    <p>{{ $t(`transportation_manage.settings.cod_gateways.${codGatewayNotice}`, { currency: transportation.currency || $t('transportation_manage.settings.preview.currency_unset') }) }}</p>
                    <ul v-if="codGateways.length" class="b-transportation-form__cod-gateways">
                      <li v-for="gateway in codGateways" :key="gateway.id">
                        <v-avatar size="28" rounded="lg" aria-hidden="true">
                          <v-img :src="getShopImagePath(gateway.icon)" alt="" />
                        </v-avatar>
                        <div class="b-transportation-form__cod-gateway-copy">
                          <strong>{{ gateway.name }}</strong>
                          <span class="b-transportation-form__cod-currency">
                            <u-currency-icon :currency="gateway.currency" small flag-only />
                            <bdi>{{ gateway.currency }}</bdi>
                          </span>
                        </div>
                        <div class="b-transportation-form__cod-gateway-status">
                          <span class="sd-modern-status sd-modern-status--plain">
                            <span class="sd-modern-status__dot" :class="gateway.enabled ? 'bg-success' : 'bg-grey'" aria-hidden="true" />
                            {{ $t(`transportation_manage.settings.preview.${gateway.enabled ? 'enabled' : 'disabled'}`) }}
                          </span>
                          <span class="sd-modern-status sd-modern-status--plain">
                            <span class="sd-modern-status__dot" :class="gateway.live ? 'bg-success' : 'bg-amber'" aria-hidden="true" />
                            {{ $t(gateway.live ? 'global.commons.livemode' : 'global.commons.debug') }}
                          </span>
                        </div>
                      </li>
                    </ul>
                    <p v-if="codGatewayNotice !== 'debug' && codGateways.some(gateway => !gateway.live)" class="b-transportation-form__cod-debug">
                      <span class="sd-modern-status__dot bg-amber" aria-hidden="true" />
                      {{ $t('transportation_manage.settings.cod_gateways.debug_hint') }}
                    </p>
                    <p v-if="codGateways.length" class="b-transportation-form__cod-service-hint">{{ $t('transportation_manage.settings.cod_gateways.service_hint') }}</p>
                    <v-btn
                      v-if="readShopAccess(ShopPermissionRegions.ACCOUNTING.code)"
                      :to="{ name: 'BPageShopFinanceGateways', params: { shop_id: shop.id } }"
                      :active="false"
                      target="_blank"
                      rel="noopener noreferrer"
                      color="primary"
                      variant="text"
                      class="sd-modern-button sd-modern-button--small sd-modern-button--inline mt-2"
                    >
                      {{ $t(codGatewayNotice === 'missing' ? 'transportation_manage.settings.cod_gateways.add_action' : 'transportation_manage.settings.manage_payment_methods') }}
                      <v-icon end size="16" aria-hidden="true">north_east</v-icon>
                    </v-btn>
                  </div>
                </div>
                <v-list-subheader v-else>
                  <v-icon class="me-1">info_outline</v-icon>

                  {{
                    $t(
                      "admin_shop.logistic.delivery.delivery_form.cod_true_message",
                    )
                  }}
                </v-list-subheader>
              </div>
            </v-expand-transition>
          </div>
          <div
            v-show="!modern || activeSection === 'rates'"
            :class="{
              'b-transportation-form__section sd-modern-widget b-transportation-form__rate-card': modern,
              'b-transportation-form__rate-card--start': modern && !transportation.sod,
            }"
          >
            <hr v-if="!modern" class="my-5" />
            <template v-if="modern">
              <u-widget-header
                :title="$t('admin_shop.logistic.delivery.delivery_form.shipping_cost_calculation')"
                icon="local_shipping"
              />
              <v-list-subheader class="b-transportation-form__hint">
                <span>{{ $t('transportation_manage.settings.shipping_cost_hint') }}</span>
                <v-tooltip location="top" content-class="sd-modern-tooltip text-start" open-on-focus open-on-click>
                  <template #activator="{ props }">
                    <v-btn v-bind="props" class="sd-modern-icon-button sd-modern-info-button" variant="text" icon
                      :aria-label="$t('transportation_manage.settings.help_label', { section: $t('admin_shop.logistic.delivery.delivery_form.shipping_cost_calculation') })">
                      <v-icon size="18">info_outline</v-icon>
                    </v-btn>
                  </template>
                  {{ $t('transportation_manage.settings.help.shipping_cost') }}
                </v-tooltip>
              </v-list-subheader>
            </template>

            <u-smart-switch
              v-model="transportation.sod"
              :accessible="modern"
              :border="modern"
              :false-title="
                $t('admin_shop.logistic.delivery.delivery_form.sod_false')
              "
              :force-show-all="false"
              :label="
                modern ? null : $t(
                  'admin_shop.logistic.delivery.delivery_form.shipping_cost_calculation',
                )
              "
              :true-title="
                $t('admin_shop.logistic.delivery.delivery_form.sod_true')
              "
              class="b-transportation-form__smart-control mb-3"
              :class="{ 'max-widget-width': !modern }"
              :false-description="
                modern
                  ? $t('transportation_manage.settings.sod_false')
                  : 'The shipping cost is determined during the checkout process.'
              "
              false-icon="calculate"
              :true-description="
                modern
                  ? $t('transportation_manage.settings.sod_true')
                  : 'Shipping costs are not included in our pricing and will be paid by the customer upon receipt of their order from the courier at the destination.'
              "
              true-icon="hail"
            ></u-smart-switch>

            <v-list-subheader v-if="!modern && transportation.sod"
              >{{
                $t(
                  "admin_shop.logistic.delivery.delivery_form.sod_true_message",
                )
              }}
            </v-list-subheader>
            <p v-if="modern && transportation.sod" class="sd-modern-notice mt-4">
              <v-icon size="18">info_outline</v-icon>
              {{ $t('transportation_manage.settings.sod_rates_hint') }}
            </p>
          </div>
          </div>
          <!-- ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄ Shipping calculation ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄ -->
          <v-expand-transition :disabled="modern ? true : undefined">
            <div
              v-if="!transportation.sod"
              v-show="!modern || activeSection === 'rates'"
              ref="rates"
              :class="
                modern
                  ? 'b-transportation-form__section sd-modern-widget b-transportation-form__rate-card b-transportation-form__rate-card--end'
                  : 'widget-box mb-5 pb-5'
              "
            >
              <u-widget-header
                :title="
                  $t(modern ? 'transportation_manage.settings.sections.rates' : 'admin_shop.logistic.delivery.delivery_form.pricing')
                "
                :add-caption="modern ? null : 'Add Country Profile'"
                icon="calculate"
                @click:add="showAddNewProfile"
                ><template v-if="modern" #actions
                  ><v-btn
                    class="sd-modern-button sd-modern-button--small"
                    variant="outlined"
                    @click="showAddNewProfile"
                    ><v-icon start size="16">add</v-icon
                    >{{
                      $t("transportation_manage.settings.add_country")
                    }}</v-btn
                  ></template
                ></u-widget-header
              >

              <v-list-subheader class="b-transportation-form__hint">
                <span v-if="modern">{{
                  $t("transportation_manage.settings.rates_hint")
                }}</span>
                <span v-else
                  >In this section, you can customize your delivery prices. If
                  your delivery costs vary by country, you can set up a separate
                  profile for each country.</span>
                <v-tooltip v-if="modern" location="top" content-class="sd-modern-tooltip text-start" open-on-focus open-on-click>
                <template #activator="{ props }">
                  <v-btn v-bind="props" class="sd-modern-icon-button sd-modern-info-button" variant="text" icon
                    :aria-label="$t('transportation_manage.settings.help_label', { section: $t('transportation_manage.settings.sections.rates') })">
                    <v-icon size="18">info_outline</v-icon>
                  </v-btn>
                </template>
                {{ $t('transportation_manage.settings.help.rates') }}
              </v-tooltip>
              </v-list-subheader>

              <div v-if="modern" class="b-transportation-form__rates">
                <div class="b-transportation-form__rate">
                  <div class="b-transportation-form__rate-copy">
                    <span class="d-flex align-center"
                      ><v-icon class="me-2" size="18">language</v-icon
                      >{{
                        $t("transportation_manage.settings.worldwide_default")
                      }}</span
                    >
                    <u-price
                      :amount="transportation.const || 0"
                      :currency="transportation.currency"
                      class="b-transportation-form__rate-amount"
                    />
                  </div>
                  <v-btn
                    class="sd-modern-button sd-modern-button--small"
                    variant="outlined"
                    @click="editRate(null)"
                    >{{ $t("transportation_manage.settings.edit_rate") }}</v-btn
                  >
                </div>
                <div
                  v-for="(it, key) in profiles"
                  :key="key"
                  class="b-transportation-form__rate"
                >
                  <div class="b-transportation-form__rate-copy">
                    <span class="d-flex align-center"
                      ><flag :iso="key" :squared="false" class="me-2" />{{
                        getCountryName(key)
                      }}</span
                    >
                    <span class="b-transportation-form__rate-amount"
                      ><u-price
                        :amount="it.const || 0"
                        :currency="transportation.currency"
                      /><span
                        v-if="it.states && !isEmpty(it.states)"
                        class="ms-2"
                        >{{ Object.keys(it.states).length }}
                        {{ $t("global.commons.override") }}</span
                      ></span
                    >
                  </div>
                  <div class="d-flex align-center ga-2">
                    <v-btn
                      class="sd-modern-button sd-modern-button--small"
                      variant="outlined"
                      @click="editRate(key)"
                      >{{ $t("global.actions.edit") }}</v-btn
                    >
                    <v-tooltip
                      :text="
                        $t('transportation_manage.settings.remove_country')
                      "
                      location="top"
                      content-class="sd-modern-tooltip text-start"
                    >
                      <template #activator="{ props }"
                        ><v-btn
                          v-bind="props"
                          class="sd-modern-icon-button"
                          icon="delete_outline"
                          variant="text"
                          :aria-label="
                            $t('transportation_manage.settings.remove_country')
                          "
                          @click="removeCountryProfile(key)"
                      /></template>
                    </v-tooltip>
                  </div>
                </div>
              </div>
              <template v-else>
                <v-row class="my-1" dense>
                  <v-chip
                    class="ma-1"
                    size="small"
                    label
                    :color="!selected_country ? '#000' : '#fff'"
                    variant="flat"
                    @click="selected_country = null"
                    prepend-icon="language"
                  >
                    {{ $t("global.commons.worldwide") }}
                  </v-chip>

                  <v-chip
                    v-for="(it, key) in profiles"
                    class="ma-1"
                    :key="key"
                    size="small"
                    label
                    :color="selected_country === key ? '#000' : '#fff'"
                    variant="flat"
                    @click="
                      selected_country = selected_country === key ? null : key
                    "
                  >
                    <flag :iso="key" :squared="false" class="me-1" />
                    <b>{{ key }}</b>
                    <span
                      v-if="it.states && !isEmpty(it.states)"
                      class="ms-1 text-green"
                      >{{ Object.keys(it.states).length }}🞫
                      {{ $t("global.commons.override") }}</span
                    >

                    <v-icon
                      @click.stop="removeCountryProfile(key)"
                      end
                      class="hover-scale-small"
                      >cancel
                    </v-icon>
                  </v-chip>
                </v-row>

                <s-country-select
                  v-model="selected_country"
                  :filter="profile_countries"
                  :return-object="false"
                  class="mx-0"
                  rounded="lg"
                  clearable
                  bg-color="#fff"
                  item-value="alpha2"
                  messages="⯅ Shipping country profile."
                  placeholder="Worldwide ● Default"
                  :label="$t('global.commons.country')"
                  variant="solo"
                  flat
                  persistent-placeholder
                >
                  <template v-slot:prepend-inner>
                    <v-icon v-if="!selected_country">language</v-icon>
                  </template>
                </s-country-select>

                <shipping-cost-form
                  v-if="selected_profile"
                  v-model="selected_profile"
                  :country="selected_country"
                  :currency="transportation.currency"
                  :shop="shop"
                  auto-select-mode
                  @selectState="(val) => (selected_state = val)"
                ></shipping-cost-form>
                <shipping-cost-form
                  v-else
                  v-model="transportation"
                  :currency="transportation.currency"
                  :shop="shop"
                  auto-select-mode
                ></shipping-cost-form>
              </template>
            </div>
          </v-expand-transition>

          <!-- ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄ Free shipping ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄ -->

          <v-expand-transition :disabled="modern ? true : undefined">
            <div v-if="!transportation.sod" v-show="!modern || activeSection === 'rates'">
              <div
                ref="free"
                :class="
                  modern ? 'b-transportation-form__section sd-modern-widget b-transportation-form__rate-card b-transportation-form__rate-card--separate' : 'widget-box mb-5'
                "
              >
                <u-widget-header
                  :title="$t('global.commons.free_shipping')"
                  icon="cruelty_free"
                ></u-widget-header>

                <v-list-subheader class="b-transportation-form__hint">
                  <span v-if="modern">{{
                    $t("transportation_manage.settings.free_hint")
                  }}</span>
                  <span v-else
                    >This can be a useful way to encourage customers to purchase
                    more items or to spend more money on your shop, as the offer
                    of free shipping can be a strong incentive for many
                    shoppers.</span>
                  <v-tooltip v-if="modern" location="top" content-class="sd-modern-tooltip text-start" open-on-focus open-on-click>
                <template #activator="{ props }">
                  <v-btn v-bind="props" class="sd-modern-icon-button sd-modern-info-button" variant="text" icon
                    :aria-label="$t('transportation_manage.settings.help_label', { section: $t('global.commons.free_shipping') })">
                    <v-icon size="18">info_outline</v-icon>
                  </v-btn>
                </template>
                {{ $t('transportation_manage.settings.help.free') }}
              </v-tooltip>
                </v-list-subheader>

                <u-smart-toggle
                  v-model="transportation.free_shipping"
                  :border="modern"
                  :role="modern ? 'switch' : undefined"
                  :tabindex="modern ? 0 : undefined"
                  :aria-checked="modern ? !!transportation.free_shipping : undefined"
                  :aria-label="$t('global.commons.free_shipping')"
                  @keydown.enter.prevent="modern && (transportation.free_shipping = !transportation.free_shipping)"
                  @keydown.space.prevent="modern && (transportation.free_shipping = !transportation.free_shipping)"
                  :false-title="$t('global.actions.no')"
                  :true-title="
                    $t(
                      'admin_shop.logistic.delivery.delivery_form.free_shipping_input',
                    )
                  "
                  class="b-transportation-form__smart-control b-transportation-form__keyboard-toggle mb-5"
                  false-gray
                ></u-smart-toggle>

                <v-expand-transition :disabled="modern ? true : undefined">
                  <div v-if="transportation.free_shipping">
                    <u-price-input
                      v-model="transportation.free_shipping_limit"
                      :class="{ 'b-transportation-form__field': modern }"
                      :currency="transportation.currency"
                      :decimal="6"
                      :label="
                        $t(
                          'admin_shop.logistic.delivery.delivery_form.free_shipping_limit_input',
                        )
                      "
                      prepend-inner-icon="shopping_bag"
                    />
                  </div>
                </v-expand-transition>
              </div>
            </div>
          </v-expand-transition>

          <!-- ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄ Calculator ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄ -->

          <v-expand-transition :disabled="modern ? true : undefined">
            <div
              v-if="!modern && !transportation.sod"
              ref="calculator"
              :class="{ 'b-transportation-form__section': modern }"
            >
              <b-transportation-calculator
                :modern="modern"
                :country="selected_country"
                :shop="shop"
                :state="selected_state"
                :transportation="transportation"
                @update:country="
                  (value) => {
                    selected_country = value;
                    selected_state = null;
                  }
                "
                @update:state="(value) => (selected_state = value)"
              ></b-transportation-calculator>
            </div>
          </v-expand-transition>

          <!-- ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄ Free shipping ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄ -->

          <div v-if="IS_MARKETPLACE" v-show="!modern || activeSection === 'general'">
            <div
              ref="marketplace"
              :class="
                modern ? 'b-transportation-form__section b-transportation-form__section--continued' : 'widget-box mb-5'
              "
              :style="modern ? null : 'border-top: solid #6548cc medium'"
            >
              <u-widget-header
                :title="
                  modern
                    ? $t('transportation_manage.settings.marketplace')
                    : 'Marketplace & Vendors'
                "
                icon="storefront"
              ></u-widget-header>

              <v-list-subheader class="b-transportation-form__hint">
                <span>{{
                  modern
                    ? $t("transportation_manage.settings.marketplace_hint")
                    : "Here you can enable this shipping method for your vendors."
                }}</span>
                <v-tooltip v-if="modern" location="top" content-class="sd-modern-tooltip text-start" open-on-focus open-on-click>
                <template #activator="{ props }">
                  <v-btn v-bind="props" class="sd-modern-icon-button sd-modern-info-button" variant="text" icon
                    :aria-label="$t('transportation_manage.settings.help_label', { section: $t('transportation_manage.settings.marketplace') })">
                    <v-icon size="18">info_outline</v-icon>
                  </v-btn>
                </template>
                {{ $t('transportation_manage.settings.help.marketplace') }}
              </v-tooltip>
              </v-list-subheader>

              <u-smart-switch
                v-model="transportation.marketplace"
                :border="modern"
                :accessible="modern"
                :false-title="
                  modern
                    ? $t('transportation_manage.settings.vendor_false')
                    : 'Not Available'
                "
                :true-title="
                  modern
                    ? $t('transportation_manage.settings.vendor_true')
                    : 'Available For Vendors'
                "
                :true-description="
                  modern
                    ? $t('transportation_manage.settings.vendor_hint')
                    : 'Vendors can add their shipping services and couriers in their panel.'
                "
                class="b-transportation-form__smart-control my-3"
                false-gray
              ></u-smart-switch>
            </div>
          </div>
          <div
            v-if="modern"
            v-show="activeSection === 'critical'"
            class="b-transportation-form__section sd-modern-critical"
          >
            <u-widget-header
              :title="$t('global.commons.critical_zone')"
              icon="warning_amber"
            />
            <v-list-subheader class="b-transportation-form__hint">
              {{ $t("transportation_manage.settings.critical_hint") }}
            </v-list-subheader>
            <u-smart-verify
              v-model="check_delete"
              color="error"
              false-gray
              class="b-transportation-form__smart-control b-transportation-form__keyboard-toggle"
              role="checkbox"
              tabindex="0"
              :aria-checked="check_delete"
              :aria-label="$t('transportation_manage.settings.verify_remove')"
              @keydown.enter.prevent="check_delete = !check_delete"
              @keydown.space.prevent="check_delete = !check_delete"
              :true-description="
                $t('transportation_manage.settings.verify_hint')
              "
              :true-title="$t('transportation_manage.settings.verify_remove')"
            />
            <v-btn
              class="sd-modern-button sd-modern-button--small sd-modern-button--danger mt-4"
              :disabled="!check_delete || !canWriteLogistics"
              :loading="busy_delete"
              color="error"
              variant="elevated"
              @click="deleteTransportation()"
              ><v-icon start size="16">delete_outline</v-icon
              >{{ $t("global.actions.delete") }}</v-btn
            >
          </div>
        </div>
        <section
          v-if="modern"
          v-show="activeSection === 'calculator'"
          class="sd-modern-widget b-transportation-form__calculator"
        >
          <b-transportation-calculator
            v-show="transportation.sod === false"
            modern
            class="b-transportation-calculator--standalone"
            :country="selected_country"
            :shop="shop"
            :state="selected_state"
            :transportation="transportation"
            @update:country="value => { selected_country = value; selected_state = null; }"
            @update:state="value => selected_state = value"
          />
          <div v-if="transportation.sod !== false" class="b-transportation-form__section">
            <u-widget-header
              :title="$t('transportation_manage.settings.sections.calculator')"
              icon="calculate"
            />
            <div class="sd-modern-notice mt-4" role="status">
              <v-icon size="20" aria-hidden="true">{{ transportation.sod === true ? 'local_shipping' : 'alt_route' }}</v-icon>
              <div>
                <strong>{{ $t(transportation.sod === true ? 'transportation_manage.settings.calculator_unavailable' : 'transportation_manage.settings.preview.fee_pending') }}</strong>
                <p class="mt-1 mb-0">{{ $t(transportation.sod === true ? 'transportation_manage.settings.calculator_unavailable_hint' : 'transportation_manage.settings.preview.fee_pending_hint') }}</p>
                <v-btn
                  variant="text"
                  color="primary"
                  class="sd-modern-button sd-modern-button--small sd-modern-button--inline mt-2"
                  @click="activeSection = 'rates'"
                >{{ $t('transportation_manage.settings.sections.rates') }}</v-btn>
              </div>
            </div>
          </div>
        </section>
        <!-- ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄ Actions ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄ -->

        <s-widget-buttons
          v-if="!modern || !['critical', 'calculator'].includes(activeSection)"
          auto-fixed-position
          :class="{ 'sd-modern-form-actions': modern }"
        >
          <div v-if="modern" class="b-transportation-form__save-copy" role="status">
            <span>{{ $t(hasDraftChanges ? 'transportation_manage.settings.unsaved_changes' : 'transportation_manage.settings.all_saved') }}</span>
            <small>{{ $t('transportation_manage.settings.save_scope') }}</small>
          </div>
          <v-btn
            :loading="busy"
            :disabled="modern && (!hasDraftChanges || !canWriteLogistics)"
            color="primary"
            size="x-large"
            variant="elevated"
            :class="{
              'sd-modern-button sd-modern-button--small b-transportation-form__save': modern,
              'sd-modern-button--primary': modern && hasDraftChanges,
            }"
            @click="updateDelivery"
          >
            <v-icon start :size="modern ? 16 : undefined">save</v-icon>

            {{ $t("global.actions.save") }}
          </v-btn>
        </s-widget-buttons>

        <div v-if="!modern" class="widget-box mb-5 mt-16">
          <h2>
            <v-icon class="me-1">warning</v-icon>
            {{ $t("global.commons.critical_zone") }}
          </h2>
          <v-list-subheader
            >Be cautious while making changes, as your actions can impact the
            functionality of your shop.
          </v-list-subheader>

          <u-smart-verify
            v-model="check_delete"
            color="red"
            true-description="I want to delete this shipping method."
            true-title="Verify removing"
          >
          </u-smart-verify>

          <s-widget-buttons>
            <v-btn
              :class="{ disabled: !check_delete }"
              :loading="busy_delete"
              color="red"
              lang
              size="x-large"
              variant="text"
              @click="deleteTransportation()"
            >
              <v-icon class="me-1">delete</v-icon>

              {{ $t("global.actions.delete") }}
            </v-btn>
          </s-widget-buttons>
        </div>
      </div>
      <aside v-if="modern" v-show="!['critical', 'calculator'].includes(activeSection)" class="b-transportation-form__preview">
        <b-transportation-settings-preview
          class="sd-modern-widget"
          :section="activeSection"
          :transportation="transportation"
          :shop="shop"
          :eta="eta"
        />
      </aside>
    </div>
  </div>

  <!-- ██████████████████████ Dialog ██████████████████████ -->

  <v-dialog
    v-model="dialog_new_profile"
    :fullscreen="!modern || $vuetify.display.smAndDown"
    :max-width="modern ? 640 : undefined"
    :aria-label="modern ? $t('transportation_manage.settings.add_profile_title') : undefined"
    scrollable
    transition="dialog-bottom-transition"
  >
    <v-card
      class="text-start"
      :class="{
        'b-transportation-rate-dialog b-transportation-add-profile-dialog sd-modern-widget sd-modern-underlined-field': modern,
        'rounded-18px': modern && !$vuetify.display.smAndDown,
      }"
    >
      <header v-if="modern" class="b-transportation-add-profile-dialog__header">
        <v-icon size="20" aria-hidden="true">public</v-icon>
        <div>
          <h2>{{ $t('transportation_manage.settings.add_profile_title') }}</h2>
          <p>{{ $t('transportation_manage.settings.add_profile_subtitle') }}</p>
        </div>
      </header>
      <v-card-title v-else class="d-flex align-center">
        <v-icon class="me-1" color="#111">share_location</v-icon>
        Add new shipping profile
      </v-card-title>
      <v-card-text :class="{ 'b-transportation-add-profile-dialog__body': modern }">
        <div
          :class="
            modern ? 'b-transportation-form__dialog-content' : 'widget-box mb-5'
          "
        >
          <u-widget-header
            v-if="!modern"
            :title="$t('admin_shop.logistic.delivery.delivery_form.pricing')"
            icon="calculate"
          ></u-widget-header>
          <v-list-subheader v-if="!modern"
            >The pricing model can be established based on the destination country of the order.
          </v-list-subheader>

          <s-country-select
            v-model="new_profile_country"
            :class="{ 'sd-modern-underlined-field b-transportation-add-profile-dialog__country': modern }"
            :label="modern ? $t('transportation_manage.settings.country_label') : undefined"
            :variant="modern ? 'underlined' : undefined"
            :hide-details="modern"
            v-bind="modern ? { 'aria-label': $t('transportation_manage.settings.country_label') } : {}"
            :return-object="false"
            item-value="alpha2"
            :placeholder="$t('global.placeholders.select_a_country')"
          >
          </s-country-select>

          <shipping-cost-form
            v-model="new_profile"
            :currency="transportation.currency"
            :shop="shop"
            :modern="modern"
          ></shipping-cost-form>
        </div>
      </v-card-text>

      <v-card-actions v-if="modern" class="b-transportation-add-profile-dialog__footer">
        <p>{{ $t('transportation_manage.settings.profile_draft_hint') }}</p>
        <div class="b-transportation-add-profile-dialog__actions">
          <v-btn
            class="sd-modern-button sd-modern-button--small"
            variant="outlined"
            @click="dialog_new_profile = false"
          >{{ $t('global.actions.cancel') }}</v-btn>
          <v-btn
            class="sd-modern-button sd-modern-button--small sd-modern-button--primary"
            color="primary"
            variant="elevated"
            :disabled="!new_profile_country"
            @click="addProfile()"
          >
            <v-icon start size="16" aria-hidden="true">add</v-icon>
            {{ $t('transportation_manage.settings.add_rate_action') }}
          </v-btn>
        </div>
      </v-card-actions>
      <v-card-actions v-else>
        <div class="widget-buttons">
          <v-btn
            size="x-large"
            variant="text"
            :class="{ 'sd-modern-button sd-modern-button--small': modern }"
            @click="dialog_new_profile = false"
          >
            <v-icon start>close</v-icon>
            {{ $t("global.actions.close") }}
          </v-btn>

          <v-btn
            color="primary"
            size="x-large"
            variant="elevated"
            :class="{
              'sd-modern-button sd-modern-button--small sd-modern-button--primary':
                modern,
            }"
            @click="addProfile()"
          >
            <v-icon start>save</v-icon>
            {{ $t("global.actions.save") }}
          </v-btn>
        </div>
      </v-card-actions>
    </v-card>
  </v-dialog>
  <v-dialog
    v-if="modern"
    v-model="dialog_edit_profile"
    :fullscreen="$vuetify.display.smAndDown"
    max-width="610"
    scrollable
  >
    <v-card class="b-transportation-rate-dialog sd-modern-widget text-start">
      <v-card-title class="d-flex align-center ga-2">
        <flag
          v-if="selected_country"
          :iso="selected_country"
          :squared="false"
        />
        <v-icon v-else size="20">language</v-icon>
        {{
          selected_country
            ? getCountryName(selected_country)
            : $t("transportation_manage.settings.worldwide_default")
        }}
      </v-card-title>
      <v-card-text>
        <p class="sd-modern-subtitle mb-4">
          {{ $t("transportation_manage.settings.rate_dialog_hint") }}
        </p>
        <shipping-cost-form
          v-if="selected_profile"
          v-model="selected_profile"
          :country="selected_country"
          :currency="transportation.currency"
          :shop="shop"
          modern
          auto-select-mode
          @selectState="(val) => (selected_state = val)"
        />
        <shipping-cost-form
          v-else
          v-model="transportation"
          :currency="transportation.currency"
          :shop="shop"
          modern
          auto-select-mode
        />
      </v-card-text>
      <v-card-actions class="justify-end"
        ><v-btn
          class="sd-modern-button sd-modern-button--small"
          variant="outlined"
          @click="dialog_edit_profile = false"
          >{{ $t("global.actions.close") }}</v-btn
        ></v-card-actions
      >
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import UNumberInput from "../../ui/number/input/UNumberInput.vue";
import { WeekDays } from "@selldone/core-js/enums/logistic/WeekDays";
import { TimeSpans } from "@selldone/core-js/enums/logistic/TimeSpans";
import UPriceInput from "../../ui/price/input/UPriceInput.vue";
import UCurrencyInput from "../../ui/currency/input/UCurrencyInput.vue";
import UCube from "../../ui/cube/UCube.vue";
import USmartSwitch from "../../ui/smart/switch/USmartSwitch.vue";
import USmartToggle from "../../ui/smart/toggle/USmartToggle.vue";
import SImageUploader from "../../ui/uploader/SImageUploader.vue";
import USmartVerify from "../../ui/smart/verify/USmartVerify.vue";
import USmartSelect from "../../ui/smart/select/USmartSelect.vue";
import { ETA } from "@selldone/core-js/enums/logistic/ETA";
import SCountrySelect from "../../ui/country/select/SCountrySelect.vue";
import ShippingCostForm from "../transportation/ShippingCostForm.vue";
import BTransportationCalculator from "../transportation/calculator/BTransportationCalculator.vue";
import BTransportationSettingsPreview from "./settings/BTransportationSettingsPreview.vue";
import SWidgetButtons from "../../ui/widget/buttons/SWidgetButtons.vue";
import { ShopOptionsHelper } from "@selldone/core-js/helper/shop/ShopOptionsHelper";
import { BusinessModel } from "@selldone/core-js/enums/shop/BusinessModel";
import { ShopPermissionRegions } from "@selldone/core-js/enums/permission/ShopPermissions";
import UCurrencyIcon from "../../ui/currency/icon/UCurrencyIcon.vue";
import { isEmpty } from "lodash-es";

import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

export default {
  name: "DeliveryFormWidget",
  mixins: [],
  components: {
    UCurrencyIcon,
    BTransportationSettingsPreview,
    SWidgetButtons,
    BTransportationCalculator,
    ShippingCostForm,
    SCountrySelect,
    USmartSelect,
    USmartVerify,
    SImageUploader,
    USmartToggle,
    USmartSwitch,
    UCube,
    UCurrencyInput,
    UPriceInput,
    UNumberInput,
  },
  emits: ["update:modelValue", "delete"],
  props: {
    shop: {
      required: true,
      type: Object,
    },

    modelValue: {},
    modern: { type: Boolean, default: false },
  },

  data: () => ({
    ETA: ETA,
    activeSection: "general",
    savedDraft: "",

    test: null,
    busy: false,

    dayItems: [
      WeekDays.Saturday,
      WeekDays.Sunday,
      WeekDays.Monday,
      WeekDays.Tuesday,
      WeekDays.Wednesday,
      WeekDays.Thursday,
      WeekDays.Friday,
    ],

    timeItems: [
      TimeSpans.Morning,
      TimeSpans.Evening,
      TimeSpans.Night,
      TimeSpans.Instant,
    ],

    transportation: null,

    //-----------------------
    cal_dis: 0,
    cal_w: 0,
    cal_p: 0,
    val_dw: 0,

    //-----------------------
    check_delete: false,
    busy_delete: false,

    //-----------------------

    eta: null,

    selected_country: null,
    selected_state: null,

    //-----------------------
    new_profile_country: null,
    new_profile: null,
    dialog_new_profile: false,
    dialog_edit_profile: false,
  }),
  computed: {
    ShopPermissionRegions() {
      return ShopPermissionRegions;
    },
    codGatewaysKnown() {
      return Array.isArray(this.shop.shop_gateways)
        && this.shop.shop_gateways.every(item => typeof item?.gateway?.cod === 'boolean');
    },
    codGateways() {
      if (!this.codGatewaysKnown) return [];
      // Shop info already projects identity/status metadata; never request gateway configuration here.
      return this.shop.shop_gateways.filter(item => item.gateway?.cod === true).map(item => ({
        id: item.id,
        name: item.gateway.name,
        icon: item.gateway.icon,
        currency: item.gateway.currency,
        enabled: item.enable === true && item.gateway.enable === true,
        live: item.livemode === true,
      }));
    },
    codGatewayNotice() {
      if (!this.codGatewaysKnown || !this.transportation.currency) return 'unknown';
      if (!this.codGateways.length) return 'missing';
      const matching = this.codGateways.filter(gateway => gateway.currency === this.transportation.currency);
      if (!matching.length) return 'currency_missing';
      if (matching.some(gateway => gateway.enabled && gateway.live)) return 'ready';
      return matching.some(gateway => gateway.enabled) ? 'debug' : 'disabled';
    },
    draftSnapshot() {
      // The image uploader saves separately; its logo change is not a form draft.
      const { logo, ...settings } = this.transportation || {};
      return JSON.stringify(settings);
    },
    hasDraftChanges() {
      return this.draftSnapshot !== this.savedDraft;
    },
    etaItems() {
      return Object.entries(ETA).map(([key, item]) =>
        this.modern
          ? {
              ...item,
              title: this.$t(
                `transportation_manage.eta_modes.${key.toLowerCase()}`,
              ),
              description: this.$t("transportation_manage.settings.eta_hint"),
            }
          : item,
      );
    },
    canWriteLogistics() {
      return !this.modern || this.writeShopAccess(ShopPermissionRegions.LOGISTIC.code);
    },
    settingsSections() {
      return [
        { ref: "general", icon: "tune", label: "transportation_manage.settings.sections.general" },
        {
          ref: "limits",
          icon: "inventory_2",
          label: "transportation_manage.settings.sections.limits",
        },
        {
          ref: "availability",
          icon: "date_range",
          label: "transportation_manage.settings.sections.availability",
        },
        {
          ref: "payment",
          icon: "payments",
          label: "transportation_manage.settings.sections.payment",
        },
        { ref: "rates", icon: "calculate", label: "transportation_manage.settings.sections.rates" },
        { ref: "calculator", icon: "functions", label: "transportation_manage.settings.sections.calculator" },
        { ref: "critical", icon: "warning_amber", label: "global.commons.critical_zone" },
      ];
    },
    IS_MARKETPLACE() {
      return this.shop.model === BusinessModel.MARKETPLACE.code;
    },

    size_unit() {
      return ShopOptionsHelper.GetSizeUnit(this.shop);
    },

    mass_unit() {
      return ShopOptionsHelper.GetMassUnit(this.shop);
    },

    profiles() {
      return this.transportation?.profiles ? this.transportation.profiles : {};
    },
    profile_countries() {
      return Object.keys(this.profiles);
    },
    selected_profile() {
      return (
        this.selected_country &&
        this.profiles &&
        this.profiles[this.selected_country]
      );
    },
  },

  watch: {
    activeSection(section) {
      if (this.modern && section !== "critical") this.check_delete = false;
    },
    "transportation.id"() {
      if (this.modern) this.check_delete = false;
    },
    canWriteLogistics(allowed) {
      if (this.modern && !allowed) this.check_delete = false;
    },
  },
  created() {
    this.transportation = this.modelValue;

    this.eta = this.transportation.eta;
    this.savedDraft = this.draftSnapshot;
  },

  methods: {
    isEmpty,
    editRate(country) {
      this.selected_country = country;
      this.selected_state = null;
      this.dialog_edit_profile = true;
    },
    updateDelivery() {
      // Recheck current Logistics access immediately before the protected write.
      if (this.modern && (this.activeSection === 'calculator' || this.busy || !this.hasDraftChanges || !this.writeShopAccess(ShopPermissionRegions.LOGISTIC.code))) return;
      this.busy = true;

      axios
        .post(
          window.API.POST_SET_TRANSPORTATION(this.shop.id),
          this.transportation,
        )

        .then(({ data }) => {
          if (!data.error) {
            NotificationService.showSuccessAlert(
              null,
              this.$t(
                "admin_shop.logistic.delivery.delivery_form.notifications.update_success",
              ),
            );
            this.transportation = data.transportation;
            this.eta = data.transportation.eta;
            this.savedDraft = this.draftSnapshot;
            this.$emit("update:modelValue", data.transportation);
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy = false;
        });
    },

    deleteTransportation() {
      if (this.modern && (!this.check_delete || this.busy_delete || !this.writeShopAccess(ShopPermissionRegions.LOGISTIC.code))) return;
      NotificationService.openDangerAlert(
        this.modern
          ? this.$t("transportation_manage.settings.remove_method_title")
          : "Remove transportation",
        this.modern
          ? this.$t("transportation_manage.settings.remove_method_hint")
          : "Are you sure to remove this transportation? This action would not clear the history of transportation.",
        this.modern ? this.$t("global.actions.delete") : "Yes, Delete Now",
        () => {
          // Confirmation can outlive a permission change or verification reset.
          if (this.modern && (!this.check_delete || this.busy_delete || !this.writeShopAccess(ShopPermissionRegions.LOGISTIC.code))) return;
          this.busy_delete = true;

          axios
            .delete(
              window.API.DELETE_TRANSPORTATION(
                this.shop.id,
                this.transportation.id,
              ),
            )

            .then(({ data }) => {
              if (!data.error) {
                NotificationService.showSuccessAlert(
                  null,
                  this.modern
                    ? this.$t("transportation_manage.settings.removed")
                    : "Transportation removed successfully.",
                );
                this.$emit("delete", data.id);
                this.$router.push({
                  name: "BPageShopLogisticShipping",
                });
              } else {
                NotificationService.showErrorAlert(null, data.error_msg);
              }
            })
            .catch((error) => {
              NotificationService.showLaravelError(error);
            })
            .finally(() => {
              this.busy_delete = false;
            });
        },
      );
    },

    showAddNewProfile() {
      this.new_profile_country = null;
      this.new_profile = {};
      this.dialog_new_profile = true;
    },
    addProfile() {
      if (!this.new_profile_country) {
        return NotificationService.showErrorAlert(
          this.modern ? null : "Select a country!",
          this.modern
            ? this.$t("transportation_manage.settings.select_country")
            : "Please select a country to create a profile.",
        );
      }

      if (
        !this.transportation.profiles ||
        Array.isArray(this.transportation.profiles)
      )
        this.transportation.profiles = {};

      this.transportation.profiles = Object.assign(
        {},
        this.transportation.profiles,
      );
      this.transportation.profiles[this.new_profile_country] = this.new_profile;

      this.dialog_new_profile = false;
      this.selected_country = this.new_profile_country; // Select new profile!
    },

    removeCountryProfile(country) {
      NotificationService.openDangerAlert(
        this.modern
          ? this.$t("transportation_manage.settings.remove_country")
          : `Remove Profile for ${this.getCountryName(country)}`,
        this.modern
          ? this.$t("transportation_manage.settings.remove_country_hint", {
              country: this.getCountryName(country),
            })
          : `Are you sure you want to remove the country profile for ${this.getCountryName(country)}? This action cannot be undone.`,
        this.modern ? this.$t("global.actions.delete") : "Yes,Remove Profile",
        () => {
          delete this.transportation.profiles[country];
          if (this.selected_country === country) {
            this.selected_country = null;
            this.selected_state = null;
          }
        },
      );
    },
  },
};
</script>

<style lang="scss" scoped>
.b-transportation-form--modern {
  min-width: 0;
  font-size: 12px;
  line-height: 1.5;

  .b-transportation-form__smart-control,
  .b-transportation-form__fields,
  .b-transportation-form__field {
    width: 100%;
    max-width: 560px;
    margin-inline: 0;
  }

  .b-transportation-form__layout {
    display: grid;
    grid-template-columns: 147px minmax(0, 1fr) 276px;
    align-items: start;
    gap: 20px;
  }

  .b-transportation-form__sections {
    padding: 0;
    min-width: 0;
    overflow: visible;
  }

  .b-transportation-form__main,
  .b-transportation-form__preview {
    min-width: 0;
  }

  .b-transportation-form__main--calculator {
    grid-column: 2 / -1;
  }

  .b-transportation-form__calculator {
    padding: 0;
    min-width: 0;
  }

  .b-transportation-form__preview {
    display: grid;
    gap: 16px;
    padding: 0;
  }

  .b-transportation-form__section {
    padding: 22px 24px;
    min-width: 0;
  }

  .b-transportation-form__section--continued {
    border-block-start: 1px solid var(--sd-modern-border);
  }

  .b-transportation-form__rate-card {
    font-size: 12px;
    line-height: 1.5;
  }

  .b-transportation-form__rate-card--start {
    border-end-start-radius: 0;
    border-end-end-radius: 0;
    border-block-end: 0;
    box-shadow: none;
  }

  .b-transportation-form__rate-card--end {
    border-start-start-radius: 0;
    border-start-end-radius: 0;
  }

  .b-transportation-form__rate-card--separate {
    margin-block-start: 16px;
  }

  .b-transportation-form__cod-help p {
    margin: 0;
    font: inherit;
  }

  .b-transportation-form__cod-help {
    display: grid;
    grid-template-columns: 18px minmax(0, 1fr);
    align-items: start;
    gap: 10px;
    padding: 16px;
    font-size: 12px;
    line-height: 1.6;

    > div { min-width: 0; }
    h3 { margin: 0 0 6px; font-size: 13px; font-weight: 500; line-height: 1.45; }
  }

  .b-transportation-form__cod-gateways {
    margin: 12px 0;
    padding: 0;
    list-style: none;

    li { display: grid; grid-template-columns: 28px minmax(0, 1fr) auto; align-items: center; gap: 10px; padding-block: 10px; }
    li + li { border-block-start: 1px solid var(--sd-modern-border); }
  }

  .b-transportation-form__cod-gateway-copy {
    min-width: 0;
    strong { display: block; font-weight: 500; overflow-wrap: anywhere; }
  }

  .b-transportation-form__cod-currency {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    color: var(--sd-modern-muted);
    font-size: 11px;
  }

  .b-transportation-form__cod-gateway-status {
    display: grid;
    justify-items: start;
    gap: 4px;
    font-size: 11px;
  }

  .b-transportation-form__cod-help .b-transportation-form__cod-debug {
    display: flex;
    align-items: baseline;
    gap: 7px;
    margin-block-start: 10px;
    > .sd-modern-status__dot { flex-shrink: 0; }
  }

  .b-transportation-form__cod-help .b-transportation-form__cod-service-hint {
    margin-block-start: 10px;
    color: var(--sd-modern-muted);
  }

  .b-transportation-form__dimensions {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 18px;
  }

  .b-transportation-form__navigation {
    display: grid;
    gap: 4px;
  }

  .b-transportation-form__rate {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 12px;
    padding-block: 13px;
    border-block-end: 1px solid var(--sd-modern-border);

    &:last-child {
      border-block-end: 0;
    }
  }

  .b-transportation-form__rate-copy {
    display: grid;
    gap: 5px;
  }
  .b-transportation-form__rate-amount {
    color: var(--sd-modern-muted);
    font-size: 11px;
  }

  .b-transportation-form__secondary,
  .b-transportation-form__save-copy small {
    color: var(--sd-modern-muted);
    font-size: 11px;
    line-height: 16px;
  }

  .b-transportation-form__save-copy {
    display: grid;
    gap: 2px;
    text-align: start;
    margin-inline-end: auto;
    min-width: 0;
  }

  .b-transportation-form__save.v-btn--disabled {
    color: rgba(var(--v-theme-on-surface), 0.38) !important;
    background: rgba(var(--v-theme-on-surface), 0.1) !important;
    border-color: transparent;
    box-shadow: none;
  }

  .sd-modern-form-actions :deep(.widget-buttons) {
    justify-content: space-between;
    gap: 16px;
    padding: 13px 16px;
    width: 100%;
    max-width: 690px;

    > .sd-modern-button {
      flex: 0 0 auto;
      width: auto;
      min-width: 100px;
      margin: 0;
    }
  }

  :deep(.s--widget-header) {
    margin-block-end: 7px;

    h2 {
      font-size: 15px;
      font-weight: 500;
      line-height: 1.4;
    }
    .--icon {
      color: var(--sd-modern-muted);
      font-size: 18px !important;
    }
  }

  :deep(.v-list-subheader) {
    min-height: 0;
    margin-block-end: 16px;
    padding: 0;
    color: var(--sd-modern-muted);
    font-size: 12px;
    line-height: 1.5;
    white-space: normal;
  }
  :deep(.v-list-subheader__text) {
    overflow: visible;
    text-overflow: clip;
    white-space: normal;
  }

  .b-transportation-form__hint :deep(.v-list-subheader__text) {
    display: flex;
    align-items: center;
    gap: 8px;

    > span { min-width: 0; }
    > .sd-modern-info-button { flex-shrink: 0; }
  }

  :deep(.v-field__input) {
    font-family: inherit;
    font-size: 12px;
    font-weight: 400;
    line-height: 20px;
  }
  :deep(.v-field__prepend-inner > .v-icon) {
    font-size: 20px;
  }
  :deep(.v-messages) {
    color: var(--sd-modern-muted);
    font-size: 11px;
    line-height: 16px;
  }
  .b-transportation-form__choice {
    font-size: 12px;
    font-weight: 400;
  }

  :deep(.b-transportation-form__smart-control) {
    h3, b {
      font-size: 12px;
      font-weight: 500;
      line-height: 18px;
    }
    .small {
      font-size: 11px;
      line-height: 16px;
    }
  }

  .b-transportation-form__keyboard-toggle:focus-visible {
    outline: 2px solid rgb(var(--v-theme-primary));
    outline-offset: 3px;
    border-radius: 8px;
  }

  @media (max-width: 1100px) {
    .b-transportation-form__layout {
      grid-template-columns: 147px minmax(0, 1fr) 246px;
      gap: 16px;
    }
    .b-transportation-form__section {
      padding: 20px;
    }
  }

  @media (max-width: 960px) {
    .b-transportation-form__main--calculator {
      grid-column: 1 / -1;
    }

    .b-transportation-form__layout {
      grid-template-columns: minmax(0, 1fr) 260px;
    }
    .b-transportation-form__navigation {
      grid-column: 1 / -1;
      display: flex;
      flex-wrap: wrap;
      gap: 6px;

      .sd-modern-button {
        padding-inline: 12px;
      }
    }
  }

  @media (max-width: 720px) {
    .b-transportation-form__layout {
      grid-template-columns: minmax(0, 1fr);
    }
    .b-transportation-form__dimensions {
      gap: 12px;
    }
  }

  @media (max-width: 600px) {
    .b-transportation-form__navigation {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));

      .sd-modern-button {
        width: 100%;
        padding-inline: 8px;
      }

      .sd-modern-button:last-child:nth-child(odd) {
        grid-column: 1 / -1;
      }

    }
    .b-transportation-form__section {
      padding: 20px 16px;
    }
    .b-transportation-form__dimensions {
      grid-template-columns: minmax(0, 1fr);
      gap: 8px;
    }
    .sd-modern-form-actions :deep(.widget-buttons) {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      align-items: center;
      max-width: calc(100vw - 32px);
      gap: 10px;
      padding: 12px;

      > .sd-modern-button {
        width: auto !important;
      }
    }
    .b-transportation-form__save-copy small {
      display: none;
    }
  }

  @media (pointer: coarse), (max-width: 600px) {
    .b-transportation-form__navigation .sd-modern-button {
      min-height: 44px;
    }
  }
}

.b-transportation-rate-dialog {
  padding: 0;
  font-size: 12px;

  .b-transportation-form__dialog-content {
    width: 100%;
    max-width: 560px;
    margin-inline: 0;
  }

  :deep(.v-card-title) {
    padding: 20px 22px;
    font-size: 15px;
    font-weight: 500;
    line-height: 1.4;
  }
  :deep(.v-card-text) {
    padding: 20px 22px;
  }
  :deep(.v-card-actions) {
    padding: 16px 22px;
    border-block-start: 1px solid var(--sd-modern-border);
  }
  :deep(.s--widget-header h2) {
    font-size: 15px;
    font-weight: 500;
    line-height: 1.4;
  }
}

.b-transportation-add-profile-dialog {
  .b-transportation-add-profile-dialog__header {
    flex: 0 0 auto;
    display: grid;
    grid-template-columns: 20px minmax(0, 1fr);
    align-items: start;
    gap: 10px;
    padding: 24px;
    border-block-end: 1px solid var(--sd-modern-border);

    > .v-icon {
      margin-block-start: 1px;
      color: var(--sd-modern-muted);
    }
    h2 {
      margin: 0;
      font-family: inherit;
      font-size: 15px !important;
      font-weight: 500 !important;
      line-height: 21px !important;
    }
    p {
      margin: 5px 0 0;
      color: var(--sd-modern-muted);
      font-size: 11px;
      line-height: 16px;
    }
  }

  .b-transportation-add-profile-dialog__body {
    padding: 24px;
    font-size: 12px;
    line-height: 1.5;
  }

  .b-transportation-add-profile-dialog__country {
    width: 100%;
    max-width: 560px;
    margin-block-end: 16px;

    :deep(.v-field__input) {
      font-family: inherit;
      font-size: 12px;
      font-weight: 400;
      line-height: 20px;
    }
  }

  .b-transportation-add-profile-dialog__footer {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    gap: 16px;
    padding: 16px 24px;

    > p {
      margin: 0;
      color: var(--sd-modern-muted);
      font-size: 11px;
      line-height: 16px;
    }
  }

  .b-transportation-add-profile-dialog__actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: 8px;

    > .sd-modern-button {
      flex: 0 0 auto;
      width: auto;
      margin: 0;
    }

    > .v-btn--disabled {
      color: rgba(var(--v-theme-on-surface), 0.38) !important;
      background: rgba(var(--v-theme-on-surface), 0.1) !important;
      box-shadow: none;
    }
  }

  @media (max-width: 600px) {
    .b-transportation-add-profile-dialog__footer {
      grid-template-columns: minmax(0, 1fr);
      gap: 12px;
    }
  }
}

.disabled {
  opacity: 0.5;
  user-select: none;
  pointer-events: none;
}

.cal-card {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-radius: 12px;

  .cal-in {
    max-width: 140px;
    border: solid #aaa thin;
    margin: 0 6px;
  }

  i:not(.large) {
    margin: 0 6px;
    font-size: 100%;
  }
}
</style>
