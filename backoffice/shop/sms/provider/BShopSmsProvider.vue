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
    class="sms-provider text-start"
    :class="{
      'sms-provider--modern sd-modern-form': modern,
      disabled: !modern && busy,
      'disabled-no-filter': modern && busy,
    }"
    :aria-busy="busy"
  >
    <header
      v-if="modern"
      class="sd-modern-provider-header sd-modern-provider-header--compact sms-provider__identity"
    >
      <div class="sd-modern-title">
        <img
          v-if="selected_provider?.icon"
          :src="selected_provider.icon"
          alt=""
          class="sms-provider__logo"
        />
        <div>
          <h2 class="sd-modern-provider-title">
            {{ selected_provider?.title || $t("shop_sms_provider.title") }}
          </h2>
          <p class="sd-modern-subtitle">
            {{ $t("shop_sms.modern.provider_subtitle") }}
          </p>
        </div>
      </div>
      <v-btn
        v-if="selected_provider?.link"
        :href="selected_provider.link"
        class="sd-modern-button sd-modern-button--inline"
        color="primary"
        target="_blank"
        rel="noopener noreferrer"
        variant="text"
      >
        {{ $t("global.actions.visit") }} {{ selected_provider.title }}
        <v-icon end aria-hidden="true">north_east</v-icon>
      </v-btn>
    </header>
    <!-- ████████████████████████ Service ████████████████████████ -->

    <div :class="modern ? 'sms-provider__settings' : 'widget-box my-5'">
      <section :class="{ 'sd-modern-widget sms-provider__card': modern }">
        <header v-if="modern" class="sms-provider__section-heading">
          <v-icon aria-hidden="true">settings_suggest</v-icon>
          <div>
            <h3>{{ $t("shop_sms.modern.provider_settings") }}</h3>
            <p>{{ $t("shop_sms.modern.provider_preferences_help") }}</p>
          </div>
        </header>
        <u-widget-header
          v-else
          :add-caption="
            sms_service && sms_service.errors > 0
              ? `${$t('shop_sms_provider.reset_error')} (${sms_service.errors})`
              : undefined
          "
          :add-loading="busy_reset"
          add-icon="autorenew"
          icon="private_connectivity"
          :title="$t('shop_sms_provider.title')"
          @click:add="resetErrors"
        >
        </u-widget-header>

        <u-loading-progress v-if="busy"></u-loading-progress>
        <v-alert
          v-if="sms_service?.paused"
          type="warning"
          variant="tonal"
          density="compact"
          class="my-3 sms-provider__paused"
        >
          {{ $t("shop_sms_provider.catalog.paused", { count: sms_service.errors }) }}
          <v-btn
            v-if="!readOnly"
            :loading="busy_reset"
            size="small"
            variant="text"
            @click="resetErrors"
          >
            {{ $t("shop_sms_provider.catalog.resume") }}
          </v-btn>
        </v-alert>
        <v-list-subheader v-if="!modern">
          {{ $t("shop_sms_provider.subtitle") }}
        </v-list-subheader>
        <div v-if="modern && readOnly" class="sd-modern-notice sd-modern-notice--plain sms-provider__read-only" role="status">
          <v-icon aria-hidden="true">visibility</v-icon>
          <p class="sd-modern-notice__content">{{ $t("shop_sms_provider.catalog.read_only") }}</p>
        </div>

        <!-- ████████████████████ Select Service ████████████████████ -->

        <!-- Modern: the saved provider as a card (change it or send a test), otherwise an always-open picker. -->
        <div v-if="modern && !show_picker" class="sms-provider__current">
          <span class="sms-provider__avatar" aria-hidden="true">
            <img v-if="saved_provider.icon" :src="saved_provider.icon" alt="" />
            <span v-else>{{ initials(saved_provider.title) }}</span>
          </span>
          <div class="sms-provider__current-text">
            <p class="sd-modern-eyebrow">{{ $t("shop_sms_provider.catalog.current") }}</p>
            <h4 class="sms-provider__current-title">
              <v-tooltip location="top" content-class="sd-modern-tooltip">
                <template #activator="{ props }">
                  <button v-bind="props" type="button" class="sms-provider__name sms-provider__name--large" @click="info_provider = saved_provider">{{ saved_provider.title }}</button>
                </template>
                {{ $t("shop_sms_provider.catalog.more_info") }}
              </v-tooltip>
              <v-tooltip location="top" content-class="sd-modern-tooltip text-start" max-width="300">
                <template #activator="{ props }">
                  <button v-if="saved_provider.fields" v-bind="props" type="button" class="sms-provider__flags" @click="info_provider = saved_provider">
                                      <span class="sms-provider__globe-slot"><svg v-if="saved_provider.worldwide" class="sms-provider__globe" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9M12 3C9.5 5.6 8.2 8.6 8.2 12s1.3 6.4 3.8 9" /></svg></span>
                                      <span v-for="c in (saved_provider.countries || []).slice(0, 3)" :key="c" class="sms-provider__flag"><flag :iso="c" :squared="false" /></span>
                                      <span v-if="(saved_provider.countries || []).length > 3" class="sms-provider__more">+{{ saved_provider.countries.length - 3 }}</span>
                                    </button>
                </template>
                {{ countriesSummary(saved_provider) }}
              </v-tooltip>
            </h4>
            <p v-if="saved_provider.description" class="sms-provider__muted">{{ saved_provider.description }}</p>
            <div class="sms-provider__chips">
              <span class="sd-modern-status sd-modern-status--plain sms-provider__status" :data-status="saved_status.key">
                <span class="sd-modern-status__dot" :class="`sd-modern-status__dot--${saved_status.dot}`" aria-hidden="true"></span>
                {{ saved_status.text }}
              </span>
              <v-tooltip v-for="cap in capabilitiesOf(saved_provider).filter((c) => c.on)" :key="cap.key" location="top" content-class="sd-modern-tooltip text-start" max-width="300">
                <template #activator="{ props }">
                  <span v-bind="props" tabindex="0" class="sd-modern-tag sms-provider__chip" :data-capability="cap.key"><v-icon aria-hidden="true">{{ cap.icon }}</v-icon>{{ cap.title }}</span>
                </template>
                {{ cap.help }}
              </v-tooltip>
            </div>
          </div>
          <div v-if="!readOnly" class="sms-provider__current-actions">
            <v-btn class="sd-modern-button" variant="outlined" @click="startChange">
              <v-icon start aria-hidden="true">swap_horiz</v-icon>{{ $t("shop_sms_provider.catalog.change") }}
            </v-btn>
            <v-btn class="sd-modern-button" variant="text" color="primary" :disabled="!!test_blocked" @click="openTest">
              <v-icon start aria-hidden="true">send_to_mobile</v-icon>{{ $t("shop_sms_provider.catalog.test_send") }}
            </v-btn>
          </div>
          <p v-if="!readOnly && test_blocked" class="sms-provider__muted sms-provider__current-note">{{ test_blocked }}</p>
        </div>

        <div v-else-if="modern" class="sms-provider__picker">
          <div class="sms-provider__picker-head">
            <v-text-field
              v-model="search"
              :placeholder="$t('shop_sms_provider.catalog.search')"
              :aria-label="$t('shop_sms_provider.catalog.search')"
              prepend-inner-icon="search"
              clearable
              hide-details
              density="compact"
              variant="solo-filled"
              flat
              rounded="lg"
              class="sms-provider__search"
            ></v-text-field>
            <!-- Target country: its own providers first (usually cheaper there), then the worldwide ones. -->
            <s-country-select
              v-model="target_country"
              item-value="alpha2"
              :placeholder="$t('shop_sms_provider.catalog.target_country')"
              :aria-label="$t('shop_sms_provider.catalog.target_country')"
              prepend-inner-icon="flag"
              clearable
              hide-details
              dense
              variant="solo-filled"
              flat
              rounded="lg"
              class="sms-provider__country-filter"
            ></s-country-select>
            <v-btn v-if="saved_provider" class="sd-modern-button" variant="text" @click="cancelChange">
              {{ $t("shop_sms_provider.catalog.cancel_change") }}
            </v-btn>
          </div>
          <div ref="pickerList" class="sms-provider__picker-list" role="group" :aria-label="$t('shop_sms.modern.provider_label')">
            <template v-for="group in picker_groups" :key="group.key">
              <p class="sd-modern-eyebrow sms-provider__picker-caption">{{ group.title }}</p>
              <div
                v-for="p in group.items"
                :key="p.driver"
                class="sms-provider__option"
                :class="{ 'sms-provider__option--active': driver === p.driver }"
              >
                <button
                  type="button"
                  class="sms-provider__option-select"
                  :aria-pressed="driver === p.driver"
                  :aria-label="p.title"
                  :data-driver="p.driver"
                  :disabled="readOnly"
                  @click="driver = p.driver"
                ></button>
                <span class="sms-provider__avatar" aria-hidden="true">
                  <img v-if="p.icon" :src="p.icon" alt="" />
                  <span v-else>{{ initials(p.title) }}</span>
                </span>
                <span class="sms-provider__option-text">
                  <v-tooltip v-if="p.fields" location="top" content-class="sd-modern-tooltip">
                    <template #activator="{ props }">
                      <button v-bind="props" type="button" class="sms-provider__name" @click="info_provider = p">{{ p.title }}</button>
                    </template>
                    {{ $t("shop_sms_provider.catalog.more_info") }}
                  </v-tooltip>
                  <strong v-else>{{ p.title }}</strong>
                  <small v-if="p.description">{{ p.description }}</small>
                </span>
                <span class="sms-provider__option-meta">
                  <span v-if="p.driver === sms_service?.driver" class="sd-modern-tag sms-provider__chip">{{ $t("shop_sms_provider.catalog.current") }}</span>
                  <v-tooltip v-if="p.fields" location="top" content-class="sd-modern-tooltip text-start" max-width="300">
                    <template #activator="{ props }">
                      <button v-if="p.fields" v-bind="props" type="button" class="sms-provider__flags" @click="info_provider = p">
                                          <span class="sms-provider__globe-slot"><svg v-if="p.worldwide" class="sms-provider__globe" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9M12 3C9.5 5.6 8.2 8.6 8.2 12s1.3 6.4 3.8 9" /></svg></span>
                                          <span v-for="c in (p.countries || []).slice(0, 3)" :key="c" class="sms-provider__flag"><flag :iso="c" :squared="false" /></span>
                                          <span v-if="(p.countries || []).length > 3" class="sms-provider__more">+{{ p.countries.length - 3 }}</span>
                                        </button>
                    </template>
                    {{ countriesSummary(p) }}
                  </v-tooltip>
                </span>
                <v-icon class="sms-provider__option-check" aria-hidden="true">{{ driver === p.driver ? "radio_button_checked" : "radio_button_unchecked" }}</v-icon>
              </div>
            </template>
            <p v-if="!picker_count" class="sms-provider__picker-empty">{{ $t("shop_sms_provider.catalog.no_results") }}</p>
          </div>
        </div>

        <v-text-field
          v-if="!modern && catalog_providers.length > 6"
          v-model="search"
          :label="$t('shop_sms_provider.catalog.search')"
          prepend-inner-icon="search"
          clearable
          hide-details
          variant="underlined"
          class="mt-3"
          :class="{ 'sd-modern-underlined-field': modern }"
        ></v-text-field>
        <p v-if="!modern && recommended_count" class="sms-provider__guidance mt-3 mb-0">
          {{ $t("shop_sms_provider.catalog.recommended") }}
        </p>

        <u-smart-select
          v-if="!modern"
          v-model="driver"
          :items="sms_providers"
          class="my-3"
          :class="{
            'sd-modern-smart-select sms-provider__provider-select': modern,
          }"
          :accessible="modern"
          :border="modern"
          item-description="description"
          item-image="icon"
          item-text="title"
          item-value="driver"
          :label="modern ? $t('shop_sms.modern.provider_label') : undefined"
          :title="modern ? undefined : 'Provider'"
        >
        </u-smart-select>
        <v-btn
          v-if="!modern && hidden_count"
          class="sms-provider__show-all"
          size="small"
          variant="text"
          color="primary"
          @click="show_all = true"
        >
          <v-icon start aria-hidden="true">expand_more</v-icon>
          {{ $t("shop_sms_provider.catalog.show_all", { count: hidden_count }) }}
        </v-btn>

        <v-btn
          v-if="!modern && selected_provider?.link"
          :href="selected_provider.link"
          class="font-weight-bold float-end tnt"
          color="primary"
          size="small"
          target="_blank"
          rel="noopener noreferrer"
          variant="text"
        >
          {{ $t("global.actions.visit") }}
          {{ selected_provider.title }}
          <v-icon end>open_in_new</v-icon>
        </v-btn>

        <div v-if="modern && selected_provider && show_picker" class="sms-provider__selected" :data-driver="selected_provider.driver">
          <span class="sms-provider__avatar sms-provider__avatar--small" aria-hidden="true">
            <img v-if="selected_provider.icon" :src="selected_provider.icon" alt="" />
            <span v-else>{{ initials(selected_provider.title) }}</span>
          </span>
          <span class="sms-provider__selected-name">{{ selected_provider.title }}</span>
          <span class="sms-provider__selected-caps">
            <v-tooltip v-for="cap in capabilitiesOf(selected_provider)" :key="cap.key" location="top" content-class="sd-modern-tooltip text-start" max-width="300">
              <template #activator="{ props }">
                <span v-bind="props" tabindex="0" class="sms-provider__cap" :class="{ 'sms-provider__cap--off': !cap.on }" :data-capability="cap.key">
                  <v-icon aria-hidden="true">{{ cap.on ? "check" : "close" }}</v-icon>{{ cap.title }}
                  <span class="sms-provider__sr">{{ cap.on ? $t("shop_sms_provider.catalog.supported") : $t("shop_sms_provider.catalog.not_supported") }}</span>
                </span>
              </template>
              {{ cap.help }}
            </v-tooltip>
          </span>
        </div>
        <div
          v-if="selected_provider && !modern"
          class="d-flex align-center my-2"
        >
          <div
            class="w-50"
            :title="modern ? undefined : 'Support custom text message?'"
          >
            <v-icon
              class="me-1"
              :color="modern ? undefined : '#111'"
              aria-hidden="true"
              >subject</v-icon
            >

            {{ $t("shop_sms_provider.plain_text") }}
            <u-check
              :model-value="selected_provider.support_text"
              class="ms-2"
              read-only
            ></u-check>
          </div>
          <div
            class="w-50"
            :title="modern ? undefined : 'Support custom template message?'"
          >
            <v-icon
              class="me-1"
              :color="modern ? undefined : '#111'"
              aria-hidden="true"
              >data_object</v-icon
            >

            {{ $t("shop_sms_provider.structural_template") }}
            <u-check
              :model-value="selected_provider.support_template"
              class="ms-2"
              read-only
            ></u-check>
          </div>
        </div>

        <!-- ████████████████████ Messages ████████████████████ -->

        <v-expand-transition>
          <div
            v-if="selected_provider?.messages"
            :class="{ 'sms-provider__messages': modern }"
          >
            <ul
              class="mb-6"
              :class="{ 'sms-provider__provider-messages': modern }"
            >
              <li v-for="it in selected_provider.messages" :key="it">
                {{ it }}
              </li>
            </ul>
          </div>
        </v-expand-transition>

        <!-- ████████████████████ Errors ████████████████████ -->

        <v-list-subheader
          v-if="!modern && sms_service && sms_service.errors > 10"
          class="mt-5"
        >
          <v-icon class="me-1" color="amber">warning</v-icon>

          {{ $t("shop_sms_provider.errors_limit_msg") }}
        </v-list-subheader>

        <v-alert
          v-if="!modern && sms_service && sms_service.error"
          class="mt-5"
          color="red"
          text
          type="error"
          density="compact"
          >{{ sms_service.error }}
        </v-alert>
      </section>
      <!-- ████████████████████ Configs ████████████████████ -->

      <section
        v-if="selected_provider && selected_provider?.driver !== 'default' && !(modern && readOnly)"
        :class="{ 'sd-modern-widget sms-provider__card': modern }"
      >
        <u-widget-header
          class="mt-6"
          :class="{ 'sd-modern-form-header sms-provider__subheading': modern }"
          icon="tune"
          :title="modern ? $t('shop_sms.modern.provider_configs') : 'Configs'"
        ></u-widget-header>

        <u-smart-switch
          v-model="enable"
          :false-title="$t('global.commons.disable')"
          :true-title="$t('global.commons.enable')"
          :class="
            modern
              ? 'sd-modern-smart-select sd-modern-smart-select--columns sms-provider__control'
              : 'my-5'
          "
          :accessible="modern"
          :border="modern"
          :false-description="
            $t('shop_sms_provider.enable_input.false_description')
          "
          false-gray
          false-icon="close"
          :true-description="
            $t('shop_sms_provider.enable_input.true_description')
          "
          true-icon="check"
        >
        </u-smart-switch>
        <u-smart-select
          v-model="option"
          :disabled="!enable"
          :items="options"
          class="my-5"
          :class="{
            'sd-modern-smart-select sd-modern-smart-select--columns sms-provider__control':
              modern,
          }"
          :accessible="modern"
          :border="modern"
          :force-show-all="modern"
          item-description="desc"
          item-icon="icon"
          item-text="title"
          item-value="value"
        ></u-smart-select>

        <!-- Sign-in codes: only when the provider has its own verification API. -->
        <u-smart-switch
          v-if="selected_provider?.verify"
          v-model="otp_verify"
          :disabled="!enable"
          :false-title="$t('shop_sms_provider.catalog.otp_selldone')"
          :true-title="$t('shop_sms_provider.catalog.otp_provider')"
          :false-description="$t('shop_sms_provider.catalog.otp_selldone_desc')"
          :true-description="$t('shop_sms_provider.catalog.otp_provider_desc')"
          false-icon="pin"
          true-icon="verified_user"
          :class="
            modern
              ? 'sd-modern-smart-select sd-modern-smart-select--columns sms-provider__control'
              : 'my-5'
          "
          :accessible="modern"
          :border="modern"
        ></u-smart-switch>
      </section>

      <!-- ████████████████████ Tokens ████████████████████ -->

      <section
        v-if="selected_provider?.fields?.length && !(modern && readOnly)"
        :class="{ 'sd-modern-widget sms-provider__card': modern }"
      >
        <u-widget-header
          class="mt-6"
          :class="{ 'sd-modern-form-header sms-provider__subheading': modern }"
          icon="token"
          :title="$t('shop_sms_provider.tokens.title')"
        ></u-widget-header>
        <p v-if="modern" class="sms-provider__guidance">
          {{ $t("shop_sms_provider.tokens.subtitle") }}
        </p>
        <v-list-subheader v-else>{{
          $t("shop_sms_provider.tokens.subtitle")
        }}</v-list-subheader>
        <p v-if="driver_changed && sms_service?.driver !== 'default'" class="sms-provider__guidance">
          {{ $t("shop_sms_provider.catalog.switch_notice") }}
        </p>
        <div :class="{ 'sd-modern-form-grid sms-provider__tokens': modern }">
          <template v-for="field in selected_provider.fields" :key="field.key">
            <!-- A stored secret is never shown: replace it or keep it. -->
            <div
              v-if="field.secret && isStored(field.key) && !replacing[field.key]"
              class="d-flex align-center flex-wrap ga-2 my-3"
              :data-field="field.title"
            >
              <span class="flex-grow-1">
                {{ field.title }}
                <v-icon size="small" color="success" aria-hidden="true">check</v-icon>
                {{ $t("shop_sms_provider.catalog.stored") }}
              </span>
              <v-btn
                :disabled="!enable"
                size="small"
                variant="text"
                color="primary"
                @click="replacing[field.key] = true"
              >
                {{ $t("shop_sms_provider.catalog.replace") }}
              </v-btn>
            </div>
            <v-select
              v-else-if="field.options?.length"
              v-model="credentials[field.key]"
              :items="field.options"
              :disabled="!enable"
              :label="field.title"
              :hint="field.hint || undefined"
              :clearable="!field.required"
              persistent-hint
              variant="underlined"
              :class="{ 'sd-modern-underlined-field': modern }"
              :data-field="field.title"
            ></v-select>
            <v-text-field
              v-else
              v-model="credentials[field.key]"
              :disabled="!enable"
              :label="field.title + (field.required ? ' *' : '')"
              :hint="field.hint || undefined"
              :type="field.secret ? 'password' : 'text'"
              :autocomplete="field.secret ? 'new-password' : 'off'"
              :maxlength="field.max"
              dir="ltr"
              persistent-hint
              variant="underlined"
              :class="{ 'sd-modern-underlined-field': modern }"
              :data-field="field.title"
            >
              <template v-if="field.secret && isStored(field.key)" #append-inner>
                <v-btn
                  size="small"
                  variant="text"
                  @click="cancelReplace(field.key)"
                >
                  {{ $t("shop_sms_provider.catalog.cancel_replace") }}
                </v-btn>
              </template>
            </v-text-field>
          </template>
        </div>
      </section>

      <!-- ████████████████████ Test ████████████████████ -->

      <section
        v-if="!(modern && readOnly)"
        :class="{
          'sd-modern-widget sms-provider__card sms-provider__save-card': modern,
        }"
      >
        <header v-if="modern" class="sms-provider__section-heading">
          <v-icon aria-hidden="true">mark_chat_read</v-icon>
          <div>
            <h3>{{ $t("shop_sms.modern.provider_save_test") }}</h3>
            <p>{{ $t("shop_sms.modern.provider_save_help") }}</p>
          </div>
        </header>
        <!-- Modern pages test the saved provider from its card instead. -->
        <template
          v-if="!modern && USER().phone && driver && driver !== 'default' && enable"
        >
          <hr v-if="!modern" />
          <u-smart-toggle
            v-model="test"
            :accessible="modern"
            :true-description="
              $t('shop_sms_provider.test_input.true_description', {
                phone: USER().phone,
              })
            "
            :class="
              modern ? 'sms-provider__test sd-modern-control-colors' : 'my-5'
            "
            color="success"
            false-gray
            true-icon="ad_units"
            :true-title="$t('shop_sms_provider.test_input.true_title')"
          ></u-smart-toggle>
          <hr v-if="!modern" class="my-5" />
        </template>

        <s-widget-buttons
          auto-fixed-position
          :class="{ 'sd-modern-form-actions sms-provider__actions': modern }"
        >
          <v-btn
            :class="{
              disabled: !selected_provider,
              'sd-modern-button sd-modern-button--primary': modern,
            }"
            :disabled="modern && !selected_provider"
            class="sms-provider__save"
            :loading="busy_set"
            color="primary"
            :size="modern ? 'default' : 'x-large'"
            @click="save"
          >
            <v-icon start>save</v-icon>
            {{ $t("global.actions.save") }}
          </v-btn>
        </s-widget-buttons>
      </section>
    </div>

    <section
      v-if="
        modern && sms_service && (sms_service.errors > 0 || sms_service.error)
      "
      class="sd-modern-widget sms-provider__errors"
    >
      <header class="sms-provider__section-heading">
        <v-icon aria-hidden="true">error_outline</v-icon>
        <div>
          <h3>{{ $t("shop_sms.modern.provider_errors") }}</h3>
          <p
            v-if="sms_service.errors > 0"
            class="sd-modern-status sd-modern-status--plain"
          >
            <span
              class="sd-modern-status__dot sd-modern-status__dot--error"
              aria-hidden="true"
            ></span>
            {{
              $t("shop_sms.modern.provider_errors_count", {
                count: sms_service.errors,
              })
            }}
          </p>
        </div>
        <v-btn
          v-if="sms_service.errors > 0 && !readOnly"
          :loading="busy_reset"
          class="sd-modern-button"
          variant="outlined"
          @click="resetErrors"
        >
          <v-icon start aria-hidden="true">restart_alt</v-icon>
          {{ $t("shop_sms_provider.reset_error") }}
        </v-btn>
      </header>
      <div
        v-if="sms_service.errors > 10"
        class="sd-modern-notice sms-provider__error-notice"
        role="status"
      >
        <v-icon color="warning" aria-hidden="true">warning_amber</v-icon>
        <p class="sd-modern-notice__content">
          {{ $t("shop_sms_provider.errors_limit_msg") }}
        </p>
      </div>
      <div
        v-if="sms_service.error"
        class="sd-modern-notice sms-provider__error-notice"
        role="status"
      >
        <v-icon color="error" aria-hidden="true">error_outline</v-icon>
        <p class="sd-modern-notice__content">{{ sms_service.error }}</p>
      </div>
    </section>

    <!-- ████████████████████████ Actions ████████████████████████ -->
    <div
      v-if="has_sync_action && !readOnly"
      :class="
        modern ? 'sd-modern-widget sms-provider__sync' : 'widget-box my-5'
      "
    >
      <u-widget-header
        :class="{ 'sd-modern-form-header sms-provider__subheading': modern }"
        icon="fact_check"
        :title="$t('shop_sms_provider.sync_action.title')"
      ></u-widget-header>

      <u-loading-progress v-if="busy"></u-loading-progress>
      <v-list-subheader>
        {{ $t("shop_sms_provider.sync_action.subtitle") }}
      </v-list-subheader>

      <u-smart-verify v-model="check" class="mb-3"></u-smart-verify>

      <div
        v-if="has_sync_action"
        class="widget-buttons"
        :class="{ 'sms-provider__sync-actions': modern }"
      >
        <v-btn
          :class="{
            disabled: !check,
            'sd-modern-button sd-modern-button--primary': modern,
          }"
          :disabled="modern && !check"
          :loading="busy_sync"
          color="primary"
          :size="modern ? 'default' : 'x-large'"
          @click="syncContacts()"
        >
          <v-icon start>contacts</v-icon>

          {{ $t("shop_sms_provider.sync_action.action") }}
        </v-btn>
      </div>
    </div>

    <!-- ████████████████████████ Test send ████████████████████████ -->
    <v-dialog v-if="modern && !readOnly" v-model="test_dialog" max-width="460" scrollable>
      <v-card class="sms-provider__dialog" rounded="xl">
        <v-card-title class="sms-provider__dialog-title">
          <v-icon aria-hidden="true">send_to_mobile</v-icon>{{ $t("shop_sms_provider.catalog.test_title") }}
        </v-card-title>
        <v-card-text>
          <dl class="sms-provider__facts">
            <dt>{{ $t("shop_sms_provider.catalog.test_to") }}</dt>
            <dd><bdi dir="ltr">{{ USER().phone }}</bdi></dd>
            <dt>{{ $t("shop_sms_provider.catalog.test_via") }}</dt>
            <dd>{{ saved_provider?.title }}</dd>
          </dl>
          <p class="sms-provider__muted">{{ $t(test_verification ? "shop_sms_provider.catalog.test_verify_note" : "shop_sms_provider.catalog.test_text_note", { shop: shop.title || shop.name }) }}</p>
          <p class="sms-provider__muted">{{ $t("shop_sms_provider.catalog.test_charge", { provider: saved_provider?.title }) }}</p>
          <div v-if="test_result" class="sd-modern-notice sms-provider__test-result" :data-ok="test_result.ok" role="status">
            <v-icon :color="test_result.ok ? 'success' : 'error'" aria-hidden="true">{{ test_result.ok ? "check_circle" : "error_outline" }}</v-icon>
            <p class="sd-modern-notice__content">{{ test_result.ok ? $t("shop_sms_provider.catalog.test_accepted", { provider: saved_provider?.title }) : test_result.message }}</p>
          </div>
        </v-card-text>
        <v-card-actions class="sms-provider__dialog-actions">
          <v-btn class="sd-modern-button" variant="text" @click="test_dialog = false">{{ $t("global.actions.close") }}</v-btn>
          <v-btn class="sd-modern-button sd-modern-button--primary" color="primary" variant="flat" :loading="busy_test" @click="sendTest">
            <v-icon start aria-hidden="true">send</v-icon>{{ $t(test_result ? "shop_sms_provider.catalog.test_again" : "shop_sms_provider.catalog.test_send_action") }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ████████████████████████ Provider details ████████████████████████ -->
    <v-dialog v-if="modern" :model-value="!!info_provider" max-width="440" scrollable
              @update:model-value="(open) => { if (!open) info_provider = null; }">
      <v-card v-if="info_provider" class="sms-provider__dialog" rounded="xl">
        <v-card-title class="sms-provider__dialog-title">
          <span class="sms-provider__dialog-avatar" aria-hidden="true">
            <img v-if="info_provider.icon" :src="info_provider.icon" alt="" />
            <span v-else>{{ initials(info_provider.title) }}</span>
          </span>
          {{ info_provider.title }}
        </v-card-title>
        <v-card-text>
          <p v-if="info_provider.description" class="sms-provider__muted">{{ info_provider.description }}</p>
          <h4 class="sms-provider__dialog-heading">{{ $t("shop_sms_provider.catalog.info_best_for") }}</h4>
          <ul class="sms-provider__country-list">
            <li v-for="c in info_provider.countries" :key="c"><flag :iso="c" :squared="false" />{{ getCountryName(c) }}</li>
          </ul>
          <h4 class="sms-provider__dialog-heading">{{ $t("shop_sms_provider.catalog.info_delivery") }}</h4>
          <p class="sms-provider__muted">
            {{ $t(info_provider.worldwide ? "shop_sms_provider.catalog.info_worldwide" : info_provider.international ? "shop_sms_provider.catalog.info_international" : "shop_sms_provider.catalog.info_local") }}
          </p>
          <div class="sms-provider__dialog-chips">
            <span v-if="info_provider.support_text" class="sms-provider__dialog-chip"><v-icon aria-hidden="true">subject</v-icon>{{ $t("shop_sms_provider.plain_text") }}</span>
            <span v-if="info_provider.support_template" class="sms-provider__dialog-chip"><v-icon aria-hidden="true">data_object</v-icon>{{ $t("shop_sms_provider.structural_template") }}</span>
            <span v-if="info_provider.verify" class="sms-provider__dialog-chip"><v-icon aria-hidden="true">verified_user</v-icon>{{ $t("shop_sms_provider.catalog.verify") }}</span>
          </div>
        </v-card-text>
        <v-card-actions class="sms-provider__dialog-actions">
          <v-btn v-if="info_provider.link" class="sd-modern-button" variant="text" :href="info_provider.link" target="_blank" rel="noopener noreferrer">
            {{ $t("shop_sms_provider.catalog.website") }}<v-icon end aria-hidden="true">north_east</v-icon>
          </v-btn>
          <v-btn v-if="info_provider.docs" class="sd-modern-button" variant="text" :href="info_provider.docs" target="_blank" rel="noopener noreferrer">
            {{ $t("shop_sms_provider.catalog.docs") }}<v-icon end aria-hidden="true">north_east</v-icon>
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn v-if="show_picker && !readOnly && driver !== info_provider.driver" class="sd-modern-button sd-modern-button--primary" color="primary" variant="flat"
                 @click="driver = info_provider.driver; info_provider = null">
            {{ $t("shop_sms_provider.catalog.use", { provider: info_provider.title }) }}
          </v-btn>
          <v-btn v-else class="sd-modern-button" variant="text" @click="info_provider = null">{{ $t("global.actions.close") }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ████████████████████████ Switch provider ████████████████████████ -->
    <v-dialog v-if="modern && !readOnly" v-model="confirm_switch" max-width="460">
      <v-card class="sms-provider__dialog" rounded="xl">
        <v-card-title class="sms-provider__dialog-title">
          <v-icon aria-hidden="true">swap_horiz</v-icon>{{ $t("shop_sms_provider.catalog.switch_title", { from: saved_provider?.title }) }}
        </v-card-title>
        <v-card-text>
          <p>{{ $t("shop_sms_provider.catalog.switch_body", { from: saved_provider?.title, to: selected_provider?.title }) }}</p>
        </v-card-text>
        <v-card-actions class="sms-provider__dialog-actions">
          <v-btn class="sd-modern-button" variant="text" @click="confirm_switch = false">{{ $t("global.actions.cancel") }}</v-btn>
          <v-btn class="sd-modern-button sd-modern-button--primary" color="primary" variant="flat" @click="confirmSwitch">
            {{ $t("shop_sms_provider.catalog.switch_continue", { to: selected_provider?.title }) }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts">
import USmartSwitch from "../../../../ui/smart/switch/USmartSwitch.vue";
import USmartSelect from "../../../../ui/smart/select/USmartSelect.vue";
import { SmsProviders } from "@selldone/core-js/enums/sms/SmsProviders";
import USmartToggle from "../../../../ui/smart/toggle/USmartToggle.vue";
import USmartVerify from "../../../../ui/smart/verify/USmartVerify.vue";
import SWidgetButtons from "../../../../ui/widget/buttons/SWidgetButtons.vue";
import SCountrySelect from "../../../../ui/country/select/SCountrySelect.vue";

import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

export default {
  name: "BShopSmsProvider",
  mixins:[],

  components: {
    SCountrySelect,
    SWidgetButtons,
    USmartVerify,
    USmartToggle,
    USmartSelect,
    USmartSwitch,
  },
  props: {
    shop: {
      required: true,
      type: Object,
    },
    modern: {
      type: Boolean,
      default: false,
    },
    // View only: staff without Settings write access.
    readOnly: {
      type: Boolean,
      default: false,
    },
  },

  data: () => ({
    sms_service: null,
    busy: false,

    // Provider catalog from the backend: { providers, recommended }.
    catalog: null,
    search: "",
    show_all: false,
    // Modern: the picker is open over a saved provider.
    changing: false,
    // Picker filter: ISO code of the country the shop mostly texts.
    target_country: null,
    // Provider shown in the details dialog.
    info_provider: null,
    confirm_switch: false,
    test_dialog: false,
    test_result: null,
    busy_test: false,

    //----------------------------
    option: "all",
    test: false,

    enable: true,
    driver: "default",
    // Edited credential values by field key; stored secrets are never loaded.
    credentials: {},
    // Secret fields the merchant chose to replace.
    replacing: {},
    // Sign-in codes through the provider's own verification service.
    otp_verify: false,

    busy_set: false,

    show_api: false,
    show_password: false,
    //----------------------------
    busy_reset: false,

    //----------------------------
    busy_sync: false,
    check: false,
  }),

  computed: {
    // Backend providers in recommended order, in the shape the form uses.
    catalog_providers() {
      const providers = this.catalog?.providers || [];
      const order = this.catalog?.recommended || [];
      const rank = (p) => (order.includes(p.key) ? order.indexOf(p.key) : order.length);
      return [...providers]
        .sort((a, b) => rank(a) - rank(b))
        .map((p) => ({
          driver: p.key,
          title: p.title,
          description: p.description,
          icon: p.logo,
          link: p.url,
          docs: p.docs_url,
          countries: p.countries || [],
          international: !!p.international,
          worldwide: !!p.worldwide,
          support_text: p.plain_text,
          support_template: p.template !== "none",
          verify: p.verify,
          actions: p.actions || [],
          fields: p.fields || [],
        }));
    },
    recommended_count() {
      return this.catalog?.recommended?.length || 0;
    },
    // The provider saved for the shop (modern card); null for Selldone's default.
    saved_provider() {
      const driver = this.sms_service?.driver;
      if (!driver || driver === "default") return null;
      return this.catalog_providers.find((p) => p.driver === driver)
        || SmsProviders.find((p) => p.driver === driver)
        || { driver, title: driver, icon: null, countries: [] };
    },
    show_picker() {
      return !this.saved_provider || this.changing;
    },
    saved_status() {
      const service = this.sms_service || {};
      if (service.paused) return { key: "paused", dot: "error", text: this.$t("shop_sms_provider.catalog.status_paused") };
      if (!service.enable) return { key: "disabled", dot: "neutral", text: this.$t("shop_sms.modern.disabled") };
      if (service.errors > 0) return { key: "errors", dot: "warning", text: this.$t("shop_sms.modern.provider_errors_count", { count: service.errors }) };
      return { key: "active", dot: "success", text: this.$t("shop_sms_provider.catalog.status_active") };
    },
    // Unsaved edits on the form (a test always uses the saved settings).
    has_changes() {
      const service = this.sms_service;
      if (!service) return this.driver !== "default";
      const values = service.credential_values || {};
      const fields = this.selected_provider?.fields || [];
      return this.driver_changed
        || this.enable !== service.enable
        || this.option !== service.option
        || !!this.otp_verify !== !!service.otp_verify
        || Object.keys(this.replacing).length > 0
        || fields.some((f) => !f.secret && (this.credentials[f.key] ?? null) !== (values[f.key] ?? null))
        || fields.some((f) => f.secret && !!this.credentials[f.key]);
    },
    // Why a test can't be sent now, or null.
    test_blocked() {
      if (!this.saved_provider) return null;
      if (!this.USER().phone) return this.$t("shop_sms.modern.test_phone_required");
      if (!this.sms_service.enable) return this.$t("shop_sms_provider.catalog.test_enable_first");
      if (this.sms_service.paused) return this.$t("shop_sms_provider.catalog.status_paused");
      if (this.has_changes) return this.$t("shop_sms_provider.catalog.test_save_first");
      return null;
    },
    // A shop that sends only codes through the provider's verification service is tested on that path.
    test_verification() {
      return !!this.sms_service?.otp_verify && this.sms_service?.option === "otp";
    },
    // Modern picker, always open. A target country lists its own providers first (usually cheaper there), then the
    // worldwide ones, then the rest; without one, the backend's recommendation. A search narrows every group.
    picker_groups() {
      const selldone = SmsProviders.find((p) => p.driver === "default");
      const all = this.catalog_providers;
      const country = this.target_country;
      let groups;
      if (country) {
        const local = all.filter((p) => p.countries.includes(country));
        const worldwide = all.filter((p) => p.worldwide && !local.includes(p));
        const rest = all.filter((p) => !local.includes(p) && !worldwide.includes(p));
        const name = this.getCountryName(country) || country;
        groups = [
          { key: "local", title: this.$t("shop_sms_provider.catalog.best_for", { country: name }), items: [selldone, ...local].filter(Boolean) },
          { key: "worldwide", title: this.$t("shop_sms_provider.catalog.worldwide_group"), items: worldwide },
          { key: "all", title: this.$t("shop_sms_provider.catalog.all_providers", { count: rest.length }), items: rest },
        ];
      } else {
        const recommended = this.catalog?.recommended || [];
        const top = all.filter((p) => recommended.includes(p.driver));
        const rest = all.filter((p) => !recommended.includes(p.driver));
        groups = [
          { key: "recommended", title: this.$t("shop_sms_provider.catalog.recommended"), items: [selldone, ...top].filter(Boolean) },
          { key: "all", title: this.$t("shop_sms_provider.catalog.all_providers", { count: rest.length }), items: rest },
        ];
      }
      const query = (this.search || "").trim().toLowerCase();
      if (query) {
        const matches = (p) =>
          p.title.toLowerCase().includes(query) ||
          p.driver.includes(query) ||
          (p.countries || []).some((c) => c.toLowerCase() === query || String(this.getCountryName(c) || "").toLowerCase().includes(query));
        groups = groups.map((group) => ({ ...group, items: group.items.filter(matches) }));
      }
      return groups.filter((group) => group.items.length);
    },
    picker_count() {
      return this.picker_groups.reduce((sum, group) => sum + group.items.length, 0);
    },
    // Without a search, only the recommended providers until "Show all" (the full list has dozens).
    hidden_count() {
      const query = (this.search || "").trim();
      if (query || this.show_all || !this.recommended_count) return 0;
      return this.catalog_providers.length - this.recommended_count;
    },
    sms_providers() {
      const query = (this.search || "").trim().toLowerCase();
      const recommended = this.catalog?.recommended || [];
      const found = query
        ? this.catalog_providers.filter(
            (p) =>
              p.title.toLowerCase().includes(query) ||
              p.driver.includes(query) ||
              p.countries.some((c) => c.toLowerCase() === query),
          )
        : this.hidden_count
          ? this.catalog_providers.filter((p) => recommended.includes(p.driver))
          : this.catalog_providers;
      // "Default" (no custom provider) stays first; the selected provider stays visible while searching.
      const selected = this.catalog_providers.find((p) => p.driver === this.driver);
      return [
        SmsProviders.find((p) => p.driver === "default"),
        ...(selected && !found.includes(selected) ? [selected] : []),
        ...found,
      ].filter(Boolean);
    },
    selected_provider() {
      if (!this.driver) return null;
      return (
        this.catalog_providers.find((i) => i.driver === this.driver) ||
        SmsProviders.find((i) => i.driver === this.driver)
      );
    },
    driver_changed() {
      return !!this.sms_service && this.driver !== this.sms_service.driver;
    },

    options() {
      return [
        {
          value: "all",
          title: this.$t('sms_messages_options.all.title'),
          desc:  this.$t('sms_messages_options.all.description'),
          icon: "notifications_active",
        },
        {
          value: "otp",
          title:this.$t('sms_messages_options.otp.title'),
          desc: this.$t('sms_messages_options.otp.description'),
          icon: "pin",
        },
      ];
    },

    has_sync_action() {
      const actions = this.selected_provider?.actions || [];
      return actions.includes("sync_contacts") || actions.includes("sync");
    },
  },

  watch: {
    driver() {
      // Another provider has other fields: start its secrets empty.
      this.replacing = {};
    },
    search() {
      // A new search starts at the top of its results.
      if (this.$refs.pickerList) this.$refs.pickerList.scrollTop = 0;
    },
  },
  created() {
    // Pre load service:
    this.sms_service = this.shop.sms_service;
    this.assign();

    // Full load service info:
    this.fetchShopSmsService();
    this.fetchProviders();
  },

  methods: {
    // Plain text, templates and the verification API, each with what it means for the merchant.
    capabilitiesOf(provider) {
      return [
        { key: "text", icon: "subject", on: !!provider?.support_text, title: this.$t("shop_sms_provider.plain_text"), help: this.$t("shop_sms_provider.catalog.cap_text_help") },
        { key: "template", icon: "data_object", on: !!provider?.support_template, title: this.$t("shop_sms_provider.structural_template"), help: this.$t("shop_sms_provider.catalog.cap_template_help") },
        ...(provider?.verify ? [{ key: "verify", icon: "verified_user", on: true, title: this.$t("shop_sms_provider.catalog.verify"), help: this.$t("shop_sms_provider.catalog.cap_verify_help") }] : []),
      ];
    },
    countriesSummary(provider) {
      const names = (provider?.countries || []).map((c) => this.getCountryName(c) || c).join(", ");
      const best = names ? this.$t("shop_sms_provider.catalog.recommended_for", { countries: names }) : "";
      return provider?.worldwide ? [this.$t("shop_sms_provider.catalog.worldwide"), best].filter(Boolean).join(" · ") : best;
    },
    initials(title) {
      const words = String(title || "").replace(/[^\p{L}\p{N} ]/gu, " ").split(" ").filter(Boolean);
      return words.slice(0, 2).map((word) => word[0]).join("").toUpperCase() || "?";
    },
    startChange() {
      this.search = "";
      this.changing = true;
    },
    cancelChange() {
      this.changing = false;
      this.search = "";
      this.assign();
    },
    // Switching away from a saved provider drops its stored credentials: confirm first.
    save() {
      if (this.modern && this.saved_provider && this.driver_changed) {
        this.confirm_switch = true;
        return;
      }
      this.setSmsService();
    },
    confirmSwitch() {
      this.confirm_switch = false;
      this.setSmsService();
    },
    openTest() {
      this.test_result = null;
      this.test_dialog = true;
    },
    // Tests the saved settings: `test` alone changes no configuration.
    sendTest() {
      this.busy_test = true;
      this.test_result = null;
      axios
        .post(window.API.POST_SET_SHOP_SMS_SERVICE(this.shop.id), { test: true })
        .then(({ data }) => {
          if (data.sms_service) {
            this.sms_service = data.sms_service;
            this.shop.sms_service = data.sms_service;
          }
          this.test_result = data.error ? { ok: false, message: data.error_msg } : { ok: true };
        })
        .catch((error) => {
          this.test_result = { ok: false, message: error?.response?.data?.message || error?.message || this.$t("global.commons.error") };
        })
        .finally(() => {
          this.busy_test = false;
        });
    },
    assign() {
      if (this.sms_service) {
        this.enable = this.sms_service.enable;
        this.driver = this.sms_service.driver;
        // Only non-secret values come back; secrets show as stored.
        this.credentials = { ...(this.sms_service.credential_values || {}) };
        this.replacing = {};
        this.otp_verify = !!this.sms_service.otp_verify;
        this.option = this.sms_service.option;
      } else {
        this.resetToDefault(); // 🞇 Reset to default
      }
    },

    resetToDefault() {
      this.enable = true;
      this.driver = "default";
      this.credentials = {};
      this.replacing = {};
      this.otp_verify = false;
      this.option = "all";
    },

    isStored(key) {
      return (
        !this.driver_changed &&
        this.sms_service?.credentials_status?.[key] === "stored"
      );
    },

    cancelReplace(key) {
      delete this.replacing[key];
      delete this.credentials[key];
    },

    // Changed credentials only: a stored secret is sent only when replaced.
    credentialsPayload() {
      const out = {};
      for (const field of this.selected_provider?.fields || []) {
        const value = this.credentials[field.key];
        if (field.secret && this.isStored(field.key) && !this.replacing[field.key]) continue;
        if (field.secret && (value === undefined || value === "")) {
          if (!this.isStored(field.key) && this.driver_changed) continue;
          if (!this.replacing[field.key]) continue;
        }
        out[field.key] = value === "" || value === undefined ? null : value;
      }
      return out;
    },

    fetchProviders() {
      axios
        .get(window.API.GET_SHOP_SMS_PROVIDERS(this.shop.id))
        .then(({ data }) => {
          if (!data.error) this.catalog = data;
          else NotificationService.showErrorAlert(null, data.error_msg);
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        });
    },

    fetchShopSmsService() {
      this.busy = true;
      axios
        .get(window.API.GET_SHOP_SMS_SERVICE(this.shop.id))
        .then(({ data }) => {
          if (!data.error) {
            this.sms_service = data.sms_service;

            this.assign();
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

    setSmsService() {
      this.busy_set = true;
      axios
        .post(window.API.POST_SET_SHOP_SMS_SERVICE(this.shop.id), {
          enable: this.enable,
          driver: this.driver,
          ...(this.driver === "default" ? {} : { credentials: this.credentialsPayload() }),
          ...(this.selected_provider?.verify ? { otp_verify: this.otp_verify } : {}),
          option: this.option,
          test: this.test,
        })
        .then(({ data }) => {
          if (!data.error) {
            this.sms_service = data.sms_service;
            this.shop.sms_service = data.sms_service;
            this.changing = false;
            this.search = "";
            if (data.sms_service.error) {
              // Some error!
              NotificationService.showWarningAlert(
                "Something goes wrong!",
                data.sms_service.error,
              );
            } else {
              // Success:
              NotificationService.showSuccessAlert(
                null,
                "Shop SMS service updated successfully!",
              );
            }

            this.edit_dialog = false;
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_set = false;
        });
    },

    resetErrors() {
      this.busy_reset = true;
      axios
        .post(window.API.POST_RESET_SHOP_SMS_SERVICE(this.shop.id))
        .then(({ data }) => {
          if (!data.error) {
            this.sms_service = data.sms_service;

            NotificationService.showSuccessAlert(null, "Shop SMS service errors reset!");
            this.edit_dialog = false;
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_reset = false;
        });
    },

    syncContacts() {
      this.busy_sync = true;
      axios
        .post(window.API.POST_SHOP_SMS_SERVICE_ACTION_SYNC(this.shop.id))
        .then(({ data }) => {
          if (!data.error) {
            NotificationService.showSuccessAlert(
              null,
              "Contacts syncing started successfully. <br><hr>" + data.message,
            );
            this.edit_dialog = false;
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_sync = false;
        });
    },
  },
};
</script>

<style lang="scss" scoped>
.sms-provider.sms-provider--modern {
  font-family: inherit;
  font-size: var(--sd-modern-font-body, 14px);
  line-height: 1.55;

  .sms-provider__identity {
    margin-block: 4px 20px;

    .sd-modern-title { gap: 12px; align-items: center; }
    h2 { margin: 0; font-family: inherit; font-size: 18px; font-weight: 500; line-height: 26px; }
    .sd-modern-subtitle { margin-block: 3px 0; font-size: 13px; line-height: 20px; }
  }

  .sms-provider__logo { flex: 0 0 28px; width: 28px; height: 28px; object-fit: contain; }
  .sms-provider__errors,
  .sms-provider__sync { padding: 20px; border-radius: 20px; }
  .sms-provider__settings { position: relative; display: grid; grid-template-columns: minmax(0, 1fr); gap: 8px; }
  .sms-provider__card.sd-modern-widget { min-width: 0; padding: 22px; border: 0; border-radius: 0; box-shadow: none; }
  .sms-provider__card:first-child { border-start-start-radius: 18px; border-start-end-radius: 18px; }
  .sms-provider__card:last-child { border-end-start-radius: 18px; border-end-end-radius: 18px; }
  .sms-provider__errors,
  .sms-provider__sync { margin-block-start: 16px; }

  .sms-provider__section-heading {
    display: flex;
    align-items: flex-start;
    gap: 9px;
    margin-block-end: 18px;

    > .v-icon { flex: 0 0 18px; font-size: 18px; color: var(--sd-modern-muted); margin-block-start: 2px; }
    > div { flex: 1; min-width: 0; }
    h3 { margin: 0; font-family: inherit; font-size: 14px; font-weight: 500; line-height: 22px; }
    p { margin-block: 3px 0; font-size: 13px; line-height: 20px; color: var(--sd-modern-muted); }
  }

  .sms-provider__provider-select { margin-block: 0 18px !important; }
  .sms-provider__capabilities {
    gap: 16px;
    margin-block: 14px 0 !important;
    font-size: 13px;
    line-height: 20px;

    > div { display: flex; align-items: center; flex-wrap: wrap; gap: 4px; min-width: 0; }
    .v-icon { font-size: 18px; color: var(--sd-modern-muted); }
  }

  .sms-provider__messages { display: flow-root; }
  .sms-provider__provider-messages { margin-block: 16px 0 !important; padding-inline-start: 20px; font-size: 13px; line-height: 21px; }
  .sms-provider__control { margin-block: 18px !important; }
  .sms-provider__subheading {
    margin-block: 24px 12px !important;

    :deep(h2) { gap: 9px; font-family: inherit; font-size: 14px; font-weight: 500; line-height: 22px; }
    :deep(.--icon) { font-size: 18px !important; }
  }
  .sms-provider__card > .sms-provider__subheading { margin-block-start: 0 !important; }
  .sms-provider__card > .sms-provider__control:last-child { margin-block-end: 0 !important; }

  .sms-provider__guidance { margin-block: 0 12px; color: var(--sd-modern-muted); font-size: 13px; line-height: 20px; }
  .sms-provider__tokens { gap: 20px; }
  .sms-provider__tokens :deep(input) { direction: ltr; text-align: start; }
  .sms-provider__test { margin-block: 0; }
  .sms-provider__actions { margin-block-start: 20px; }
  .sms-provider__actions :deep(.widget-buttons) {
    width: 100%;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    justify-content: flex-end;
    gap: 10px;
    padding: 0;
  }
  .sms-provider__save.sd-modern-button {
    --v-btn-height: 42px;
    flex: 0 1 auto;
    min-width: 0;
    max-width: 100%;
    min-height: 42px;
    height: auto;
    max-height: none;
    margin: 0;
    padding: 10px 15px;
    border-radius: 9px;
    font-size: 13px;
    font-weight: 500;
    line-height: 20px;

    :deep(.v-icon) { width: 16px; height: 16px; font-size: 16px; }
    :deep(.v-icon--start) { margin-inline: 0 7px; }
    :deep(.v-btn__content) { white-space: normal; }
  }
  .sms-provider__error-notice { padding: 14px; font-size: 13px; line-height: 21px; }
  .sms-provider__error-notice + .sms-provider__error-notice { margin-block-start: 12px; }
  .sms-provider__sync > .sms-provider__subheading { margin-block-start: 0 !important; }
  .sms-provider__sync-actions { justify-content: flex-end; margin-block-start: 16px; }


  // Saved provider: one card with its status, capabilities and the two actions.
  .sms-provider__current {
    display: grid;
    grid-template-columns: 48px minmax(0, 1fr) auto;
    align-items: start;
    gap: 14px;
    padding: 16px;
    border: 1px solid var(--sd-modern-border);
    border-radius: 16px;
    background: var(--sd-modern-inset);

    h4 { margin: 2px 0 0; font-family: inherit; font-size: 16px; font-weight: 600; line-height: 24px; }
    .sd-modern-eyebrow { margin: 0; font-size: 10px; line-height: 15px; letter-spacing: .09em; }
  }
  .sms-provider__current-text { min-width: 0; }
  .sms-provider__current-actions { display: flex; flex-direction: column; align-items: stretch; gap: 6px; }
  .sms-provider__current-note { grid-column: 2 / -1; margin: 0; }
  .sms-provider__muted { margin: 2px 0 0; color: var(--sd-modern-muted); font-size: 12px; line-height: 18px; }
  .sms-provider__chips { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; margin-block-start: 10px; }
  .sms-provider__chip { gap: 4px; padding: 1px 7px; border: 1px solid var(--sd-modern-border); font-size: 11px; line-height: 18px; }
  .sms-provider__chip .v-icon { font-size: 13px; }
  .sms-provider__status { font-size: 12px; line-height: 18px; }
  .sms-provider__avatar {
    display: grid;
    place-items: center;
    flex: 0 0 auto;
    width: 40px;
    height: 40px;
    overflow: hidden;
    border: 1px solid var(--sd-modern-border);
    border-radius: 12px;
    background: rgb(var(--v-theme-surface));
    color: rgb(var(--v-theme-primary));
    font-size: 13px;
    font-weight: 700;
    letter-spacing: .02em;

    img { width: 26px; height: 26px; object-fit: contain; }
  }
  .sms-provider__current > .sms-provider__avatar { width: 48px; height: 48px; border-radius: 14px; img { width: 30px; height: 30px; } }

  // Picker: always open, so a search shows its matches at once.
  .sms-provider__picker { display: grid; gap: 10px; }
  .sms-provider__picker-head { display: flex; align-items: center; gap: 8px; }
  .sms-provider__search { flex: 1 1 auto; min-width: 0; }
  .sms-provider__picker-list {
    max-height: min(440px, 58vh);
    overflow-y: auto;
    overscroll-behavior: contain;
    padding: 4px;
    border: 1px solid var(--sd-modern-border);
    border-radius: 14px;
    scrollbar-gutter: stable;
  }
  // Above the rows' raised content (z-index 1), so scrolled rows slide under the caption.
  .sms-provider__picker-caption { position: sticky; top: -4px; z-index: 2; margin: 0; padding: 10px 10px 6px; background: rgb(var(--v-theme-surface)); font-size: 10px; line-height: 15px; letter-spacing: .09em; }
  // A row selects as a whole (its full-size button sits underneath); the name and the flags open the details.
  .sms-provider__option {
    position: relative;
    display: grid;
    grid-template-columns: 40px minmax(0, 1fr) auto 22px;
    align-items: center;
    gap: 12px;
    min-height: 60px;
    padding: 8px 10px;
    border: 1px solid transparent;
    border-radius: 12px;
    transition: background-color .15s, border-color .15s;

    &:hover { background: var(--sd-modern-inset); }
    > :not(.sms-provider__option-select) { position: relative; z-index: 1; pointer-events: none; }
  }
  .sms-provider__option-select {
    position: absolute;
    inset: 0;
    z-index: 0;
    width: 100%;
    border-radius: inherit;
    cursor: pointer;

    &:focus-visible { outline: 2px solid rgb(var(--v-theme-primary)); outline-offset: -2px; }
    &:disabled { cursor: default; }
  }
  .sms-provider__name,
  .sms-provider__flags { pointer-events: auto; }
  .sms-provider__name {
    align-self: flex-start;
    max-width: 100%;
    padding: 0;
    overflow: hidden;
    color: inherit;
    font: inherit;
    font-size: 13px;
    font-weight: 500;
    line-height: 20px;
    text-align: start;
    text-decoration: underline;
    text-decoration-color: transparent;
    text-underline-offset: 3px;
    text-overflow: ellipsis;
    white-space: nowrap;
    cursor: pointer;
    transition: color .15s, text-decoration-color .15s;

    &:hover, &:focus-visible { color: rgb(var(--v-theme-primary)); text-decoration-color: currentColor; }
    &:focus-visible { outline: 2px solid rgb(var(--v-theme-primary)); outline-offset: 2px; border-radius: 4px; }
  }
  .sms-provider__name--large { font-size: 16px; font-weight: 600; line-height: 24px; }
  .sms-provider__flags {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    min-height: 24px;
    padding: 2px 4px;
    border-radius: 6px;
    cursor: pointer;

    &:hover { background: rgba(var(--v-theme-on-surface), .06); }
    &:focus-visible { outline: 2px solid rgb(var(--v-theme-primary)); outline-offset: 1px; }
  }
  .sms-provider__globe-slot { display: inline-flex; flex: 0 0 14px; width: 14px; height: 14px; }
  .sms-provider__globe { width: 14px; height: 14px; color: rgba(var(--v-theme-on-surface), .78); }
  .sms-provider__flag { display: inline-flex; line-height: 0; }
  .sms-provider__flag :deep(.flag-icon) { width: 16px; height: 12px; border-radius: 2px; box-shadow: 0 0 0 1px rgba(0, 0, 0, .08); }
  .sms-provider__more { padding: 0 5px; border-radius: 5px; background: var(--sd-modern-inset); color: var(--sd-modern-muted); font-size: 10px; font-weight: 600; line-height: 16px; }
  .sms-provider__country-filter { flex: 0 1 230px; min-width: 150px; }
  .sms-provider__picker-head :deep(.v-field) { min-height: 42px; border-radius: 10px; }
  .sms-provider__picker-head :deep(.v-field__input) { min-height: 42px; padding-block: 0; align-items: center; }
  .sms-provider__picker-head > .v-btn { height: 42px; }
  .sms-provider__current-title { display: flex; flex-wrap: wrap; align-items: center; gap: 4px 8px; margin: 2px 0 0; }

  // The provider these capabilities describe, while choosing one.
  .sms-provider__selected { display: flex; flex-wrap: wrap; align-items: center; gap: 8px 10px; margin-block-start: 12px; padding: 10px 12px; border-radius: 12px; background: var(--sd-modern-inset); }
  .sms-provider__avatar--small { width: 28px; height: 28px; border-radius: 8px; font-size: 11px; img { width: 18px; height: 18px; } }
  .sms-provider__selected-name { font-size: 13px; font-weight: 600; }
  .sms-provider__selected-caps { display: flex; flex-wrap: wrap; gap: 6px; margin-inline-start: auto; }
  .sms-provider__cap {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 2px 9px 2px 6px;
    border: 1px solid rgba(var(--v-theme-success), .35);
    border-radius: 8px;
    background: rgb(var(--v-theme-surface));
    font-size: 12px;
    line-height: 18px;
    cursor: help;

    .v-icon { color: rgb(var(--v-theme-success)); font-size: 14px; }
    &:focus-visible { outline: 2px solid rgb(var(--v-theme-primary)); outline-offset: 1px; }
  }
  .sms-provider__cap--off { border-color: var(--sd-modern-border); color: var(--sd-modern-muted); .v-icon { color: var(--sd-modern-muted); } }
  .sms-provider__chip[data-capability] { cursor: help; }
  .sms-provider__sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
  .sms-provider__option--active { border-color: rgba(var(--v-theme-primary), .45); background: rgba(var(--v-theme-primary), .06); }
  .sms-provider__option--active:hover { background: rgba(var(--v-theme-primary), .09); }
  .sms-provider__option-text { display: flex; flex-direction: column; min-width: 0; }
  .sms-provider__option-text strong { font-size: 13px; font-weight: 500; line-height: 20px; }
  .sms-provider__option-text small { overflow: hidden; color: var(--sd-modern-muted); font-size: 12px; line-height: 18px; text-overflow: ellipsis; white-space: nowrap; }
  .sms-provider__option-meta { display: flex; flex-wrap: wrap; align-items: center; justify-content: flex-start; gap: 5px; min-width: 104px; max-width: 190px; }
  .sms-provider__option-check { color: var(--sd-modern-muted); font-size: 20px; }
  .sms-provider__option--active .sms-provider__option-check { color: rgb(var(--v-theme-primary)); }
  .sms-provider__picker-empty { margin: 0; padding: 28px 12px; color: var(--sd-modern-muted); font-size: 13px; text-align: center; }
  .sms-provider__read-only { margin-block: 0 14px; padding: 12px 14px; font-size: 13px; line-height: 20px; }

  @media (max-width: 700px) {
    .sms-provider__current { grid-template-columns: 48px minmax(0, 1fr); }
    .sms-provider__current-actions { grid-column: 1 / -1; flex-direction: row; flex-wrap: wrap; }
    .sms-provider__current-note { grid-column: 1 / -1; }
    .sms-provider__picker-head { flex-wrap: wrap; }
    .sms-provider__search { flex-basis: 100%; }
    .sms-provider__country-filter { flex: 1 1 160px; }
    .sms-provider__option { grid-template-columns: 40px minmax(0, 1fr) 22px; }
    .sms-provider__option-meta { grid-column: 2; grid-row: 2; min-width: 0; max-width: none; }
    .sms-provider__option-check { grid-column: 3; grid-row: 1; }
    .sms-provider__selected-caps { margin-inline-start: 0; }
    .sms-provider__option-text small { display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; white-space: normal; }
  }

  @media (max-width: 600px) {
    .sms-provider__card.sd-modern-widget { padding: 20px 16px; }
    .sms-provider__errors,
    .sms-provider__sync { padding: 18px 16px; }
    .sms-provider__section-heading { flex-wrap: wrap; }
    .sms-provider__section-heading > .v-btn { margin-inline-start: 27px; }
    .sms-provider__capabilities { flex-direction: column; align-items: stretch !important; gap: 12px; }
    .sms-provider__capabilities > div { width: 100% !important; }
  }

  @media (max-width: 600px), (pointer: coarse) {
    .sms-provider__save.sd-modern-button { --v-btn-height: 44px; min-height: 44px; }
  }
}
</style>

<style lang="scss">
// Dialogs render outside the component (Vuetify overlay), so these class names stay unique and unscoped.
.sms-provider__dialog {
  text-align: start;
  font-size: 13px;
  line-height: 20px;

  .sms-provider__dialog-title { display: flex; align-items: center; gap: 10px; padding: 20px 22px 6px; font-size: 16px; font-weight: 600; line-height: 24px; white-space: normal; }
  .sms-provider__dialog-title .v-icon { color: rgb(var(--v-theme-primary)); }
  .v-card-text { padding: 8px 22px 6px !important; }
  .sms-provider__facts { display: grid; grid-template-columns: max-content minmax(0, 1fr); gap: 6px 16px; margin: 0 0 12px; padding: 12px 14px; border-radius: 12px; background: rgba(var(--v-theme-on-surface), .04); }
  .sms-provider__facts dt { color: rgba(var(--v-theme-on-surface), .6); }
  .sms-provider__facts dd { margin: 0; font-weight: 500; overflow-wrap: anywhere; }
  .sms-provider__muted { margin: 0 0 6px; color: rgba(var(--v-theme-on-surface), .62); font-size: 12px; line-height: 18px; }
  .sms-provider__test-result { display: flex; align-items: flex-start; gap: 8px; margin-block-start: 12px; padding: 12px; border-radius: 12px; background: rgba(var(--v-theme-success), .08); }
  .sms-provider__test-result[data-ok='false'] { background: rgba(var(--v-theme-error), .08); }
  .sms-provider__test-result p { margin: 0; }
  .sms-provider__dialog-actions { justify-content: flex-end; gap: 8px; padding: 12px 18px 18px !important; }
  .sms-provider__dialog-actions .v-btn { min-height: 40px; text-transform: none; letter-spacing: normal; }
  .sms-provider__dialog-avatar { display: grid; place-items: center; flex: 0 0 34px; width: 34px; height: 34px; overflow: hidden; border: 1px solid rgba(var(--v-theme-on-surface), .12); border-radius: 10px; color: rgb(var(--v-theme-primary)); font-size: 12px; font-weight: 700; }
  .sms-provider__dialog-avatar img { width: 22px; height: 22px; object-fit: contain; }
  .sms-provider__dialog-heading { margin: 14px 0 6px; font-size: 11px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; color: rgba(var(--v-theme-on-surface), .6); }
  .sms-provider__country-list { display: flex; flex-wrap: wrap; gap: 6px; margin: 0; padding: 0; list-style: none; }
  .sms-provider__country-list li { display: inline-flex; align-items: center; gap: 6px; padding: 3px 9px 3px 5px; border-radius: 8px; background: rgba(var(--v-theme-on-surface), .05); font-size: 12px; line-height: 18px; }
  .sms-provider__country-list .flag-icon { width: 18px; height: 13px; border-radius: 2px; }
  .sms-provider__dialog-chips { display: flex; flex-wrap: wrap; gap: 6px; margin-block-start: 10px; }
  .sms-provider__dialog-chip { display: inline-flex; align-items: center; gap: 4px; padding: 1px 8px; border: 1px solid rgba(var(--v-theme-on-surface), .12); border-radius: 7px; font-size: 11px; line-height: 18px; }
  .sms-provider__dialog-chip .v-icon { font-size: 13px; }
}
</style>
