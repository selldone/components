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
  <section class="b-shop-email-provider text-start" :class="{ 'disabled-no-filter': busy }" :aria-busy="busy">
    <div class="b-shop-email-provider__cards">
      <!-- ████████████████████ Provider ████████████████████ -->
      <section class="sd-modern-widget b-shop-email-provider__card">
        <u-loading-progress v-if="busy" class="b-shop-email-provider__progress" />
        <header class="b-shop-email-provider__heading">
          <v-icon aria-hidden="true">send</v-icon>
          <div>
            <h2>{{ $t("shop_email_provider.title") }}</h2>
            <p>{{ $t("shop_email_provider.subtitle") }}</p>
          </div>
        </header>

        <div v-if="readOnly" class="sd-modern-notice sd-modern-notice--plain b-shop-email-provider__read-only" role="status">
          <v-icon aria-hidden="true">visibility</v-icon>
          <p class="sd-modern-notice__content">{{ $t("shop_email_provider.catalog.read_only") }}</p>
        </div>

        <!-- The saved provider as a card (change it or send a test), otherwise an always-open picker. -->
        <div v-if="saved_provider && !changing" class="b-shop-email-provider__current">
          <span class="b-shop-email-provider__avatar" aria-hidden="true">
            <img v-if="saved_provider.logo" :src="saved_provider.logo" alt="" />
            <span v-else>{{ initials(saved_provider.title) }}</span>
          </span>
          <div class="b-shop-email-provider__current-text">
            <p class="sd-modern-eyebrow">{{ $t("shop_email_provider.catalog.current") }}</p>
            <v-tooltip location="top" content-class="sd-modern-tooltip">
              <template #activator="{ props }">
                <button v-bind="props" type="button" class="b-shop-email-provider__name b-shop-email-provider__name--large"
                        @click="info_provider = saved_provider">{{ saved_provider.title }}</button>
              </template>
              {{ $t("shop_email_provider.catalog.more_info") }}
            </v-tooltip>
            <p v-if="saved_provider.description" class="b-shop-email-provider__muted">{{ saved_provider.description }}</p>
            <div class="b-shop-email-provider__chips">
              <span class="sd-modern-status sd-modern-status--plain b-shop-email-provider__status" :data-status="saved_status.key">
                <span class="sd-modern-status__dot" :class="saved_status.dot ? `sd-modern-status__dot--${saved_status.dot}` : null" aria-hidden="true"></span>
                {{ saved_status.text }}
              </span>
              <v-tooltip location="top" content-class="sd-modern-tooltip text-start">
                <template #activator="{ props }">
                  <span v-bind="props" tabindex="0" class="sd-modern-tag b-shop-email-provider__tag" :data-kind="saved_provider.kind">{{ kindLabel(saved_provider) }}</span>
                </template>
                {{ kindHelp(saved_provider) }}
              </v-tooltip>
              <span v-if="mail_service.from" class="b-shop-email-provider__sender">
                <v-icon aria-hidden="true">alternate_email</v-icon><bdi dir="ltr">{{ mail_service.from }}</bdi>
              </span>
            </div>
          </div>
          <div v-if="!readOnly" class="b-shop-email-provider__current-actions">
            <v-btn class="sd-modern-button" variant="outlined" @click="startChange">
              <v-icon start aria-hidden="true">swap_horiz</v-icon>{{ $t("shop_email_provider.catalog.change") }}
            </v-btn>
            <v-btn class="sd-modern-button" variant="text" color="primary" :disabled="!!test_blocked" @click="openTest">
              <v-icon start aria-hidden="true">outgoing_mail</v-icon>{{ $t("shop_email_provider.actions.send_test_email") }}
            </v-btn>
          </div>
          <p v-if="!readOnly && test_blocked" class="b-shop-email-provider__muted b-shop-email-provider__current-note">{{ test_blocked }}</p>
        </div>

        <div v-else-if="!readOnly" class="b-shop-email-provider__picker">
          <div class="b-shop-email-provider__picker-head">
            <v-text-field
              v-model="search"
              :placeholder="$t('shop_email_provider.catalog.search')"
              :aria-label="$t('shop_email_provider.catalog.search')"
              prepend-inner-icon="search"
              clearable
              hide-details
              density="compact"
              variant="solo-filled"
              flat
              rounded="lg"
              class="b-shop-email-provider__search"
            ></v-text-field>
            <v-btn v-if="saved_provider" class="sd-modern-button" variant="text" @click="cancelChange">
              {{ $t("shop_email_provider.catalog.cancel_change") }}
            </v-btn>
          </div>
          <div ref="pickerList" class="b-shop-email-provider__picker-list" role="group" :aria-label="$t('shop_email_provider.provider')">
            <template v-for="group in picker_groups" :key="group.key">
              <p class="sd-modern-eyebrow b-shop-email-provider__picker-caption">{{ group.title }}</p>
              <div v-for="p in group.items" :key="p.key" class="b-shop-email-provider__option"
                   :class="{ 'b-shop-email-provider__option--active': driver === p.key }">
                <button type="button" class="b-shop-email-provider__option-select" :aria-pressed="driver === p.key"
                        :aria-label="p.title" :data-driver="p.key" @click="selectDriver(p.key)"></button>
                <span class="b-shop-email-provider__avatar" aria-hidden="true">
                  <img v-if="p.logo" :src="p.logo" alt="" />
                  <span v-else>{{ initials(p.title) }}</span>
                </span>
                <span class="b-shop-email-provider__option-text">
                  <v-tooltip location="top" content-class="sd-modern-tooltip">
                    <template #activator="{ props }">
                      <button v-bind="props" type="button" class="b-shop-email-provider__name" @click="info_provider = p">{{ p.title }}</button>
                    </template>
                    {{ $t("shop_email_provider.catalog.more_info") }}
                  </v-tooltip>
                  <small v-if="p.description">{{ p.description }}</small>
                </span>
                <span class="b-shop-email-provider__option-meta">
                  <span v-if="p.key === mail_service?.driver" class="sd-modern-tag b-shop-email-provider__tag">{{ $t("shop_email_provider.catalog.current") }}</span>
                  <span class="sd-modern-tag b-shop-email-provider__tag" :data-kind="p.kind">{{ kindLabel(p) }}</span>
                </span>
                <v-icon class="b-shop-email-provider__option-check" aria-hidden="true">{{ driver === p.key ? "radio_button_checked" : "radio_button_unchecked" }}</v-icon>
              </div>
            </template>
            <p v-if="!picker_count" class="b-shop-email-provider__picker-empty">{{ catalog_failed ? $t("shop_email_provider.catalog.load_error") : busy_catalog ? $t("shop_email_provider.catalog.loading") : $t("shop_email_provider.catalog.no_results") }}</p>
          </div>
        </div>

        <div v-if="selected_provider && (changing || !saved_provider) && !readOnly" class="b-shop-email-provider__selected" :data-driver="selected_provider.key">
          <span class="b-shop-email-provider__avatar b-shop-email-provider__avatar--small" aria-hidden="true">
            <img v-if="selected_provider.logo" :src="selected_provider.logo" alt="" />
            <span v-else>{{ initials(selected_provider.title) }}</span>
          </span>
          <span class="b-shop-email-provider__selected-name">{{ selected_provider.title }}</span>
          <span class="sd-modern-tag b-shop-email-provider__tag" :data-kind="selected_provider.kind">{{ kindLabel(selected_provider) }}</span>
          <a v-if="selected_provider.docs_url" :href="selected_provider.docs_url" target="_blank" rel="noopener noreferrer" class="b-shop-email-provider__link">
            {{ $t("shop_email_provider.catalog.setup_guide") }}<v-icon aria-hidden="true">north_east</v-icon>
          </a>
        </div>
      </section>

      <template v-if="selected_provider && !readOnly">
        <!-- ████████████████████ Connection ████████████████████ -->
        <section class="sd-modern-widget b-shop-email-provider__card b-shop-email-provider__connection">
          <header class="b-shop-email-provider__heading">
            <v-icon aria-hidden="true">tune</v-icon>
            <div>
              <h3>{{ $t("shop_email_provider.config.provider_title", { provider: selected_provider.title }) }}</h3>
              <p>{{ $t("shop_email_provider.config.subtitle") }}</p>
            </div>
          </header>

          <u-smart-switch
            v-model="enable"
            :false-title="$t('global.commons.disable')"
            :true-title="$t('global.commons.enable')"
            class="sd-modern-smart-select sd-modern-smart-select--columns b-shop-email-provider__enable"
            :false-description="$t('shop_email_provider.enable_input.false_description')"
            false-gray
            false-icon="close"
            :true-description="$t('shop_email_provider.enable_input.true_description')"
            true-icon="check"
            accessible
            border
          />

          <p v-if="is_preset" class="b-shop-email-provider__guidance">
            <v-icon aria-hidden="true">auto_fix_high</v-icon>
            {{ $t("shop_email_provider.catalog.prefilled", { provider: selected_provider.title }) }}
          </p>
          <p v-if="driver_changed && saved_provider" class="b-shop-email-provider__guidance">
            <v-icon aria-hidden="true">info_outline</v-icon>
            {{ $t("shop_email_provider.catalog.switch_notice", { from: saved_provider.title }) }}
          </p>

          <!-- Keyed by provider: another provider's fields start fresh, without the previous hints. -->
          <div :key="driver" class="sd-modern-form-grid b-shop-email-provider__fields">
            <template v-for="field in selected_provider.fields" :key="field.key">
              <!-- A stored secret is never shown: keep it or replace it. -->
              <div v-if="field.secret && isStored(field.key) && !replacing[field.key]" class="b-shop-email-provider__stored" :data-field="field.key">
                <span class="b-shop-email-provider__stored-label">
                  {{ field.title }}
                  <span class="b-shop-email-provider__stored-state"><v-icon aria-hidden="true">check</v-icon>{{ $t("shop_email_provider.catalog.stored") }}</span>
                </span>
                <v-btn size="small" variant="text" color="primary" class="b-shop-email-provider__inline" @click="replacing[field.key] = true">
                  {{ $t("shop_email_provider.catalog.replace") }}
                </v-btn>
              </div>
              <v-select
                v-else-if="field.type === 'select'"
                v-model="values[field.key]"
                :items="optionsOf(field)"
                item-title="title"
                item-value="value"
                :label="field.title + (field.required ? ' *' : '')"
                :messages="field.hint || undefined"
                variant="underlined"
                class="sd-modern-underlined-field b-shop-email-provider__field"
                :data-field="field.key"
              ></v-select>
              <v-combobox
                v-else-if="field.suggestions?.length"
                v-model="values[field.key]"
                :items="field.suggestions"
                :label="field.title + (field.required ? ' *' : '')"
                :messages="field.hint || undefined"
                :maxlength="field.max"
                dir="ltr"
                variant="underlined"
                class="sd-modern-underlined-field b-shop-email-provider__field b-shop-email-provider__field--ltr"
                :data-field="field.key"
              ></v-combobox>
              <v-text-field
                v-else-if="field.secret"
                v-model="secrets[field.key]"
                :label="field.title + (field.required ? ' *' : '')"
                :messages="field.hint || undefined"
                :type="show_secret[field.key] ? 'text' : 'password'"
                :append-inner-icon="show_secret[field.key] ? 'visibility' : 'visibility_off'"
                autocomplete="new-password"
                :maxlength="field.max"
                dir="ltr"
                variant="underlined"
                class="sd-modern-underlined-field b-shop-email-provider__field b-shop-email-provider__field--ltr"
                :data-field="field.key"
                @click:append-inner="show_secret[field.key] = !show_secret[field.key]"
              >
                <template v-if="isStored(field.key)" #append>
                  <v-btn size="small" variant="text" class="b-shop-email-provider__inline" @click="cancelReplace(field.key)">
                    {{ $t("shop_email_provider.catalog.cancel_replace") }}
                  </v-btn>
                </template>
              </v-text-field>
              <v-text-field
                v-else
                v-model="values[field.key]"
                :label="field.title + (field.required ? ' *' : '')"
                :messages="field.hint || undefined"
                :type="field.type === 'number' ? 'number' : 'text'"
                :maxlength="field.max"
                dir="ltr"
                variant="underlined"
                class="sd-modern-underlined-field b-shop-email-provider__field b-shop-email-provider__field--ltr"
                :data-field="field.key"
              ></v-text-field>
            </template>
          </div>
          <p v-if="selected_provider.kind === 'smtp'" class="b-shop-email-provider__help" v-html="$t('shop_email_provider.messages.encryption_ports_guide')"></p>
        </section>

        <!-- ████████████████████ Sender ████████████████████ -->
        <section class="sd-modern-widget b-shop-email-provider__card">
          <header class="b-shop-email-provider__heading">
            <v-icon aria-hidden="true">contact_mail</v-icon>
            <div>
              <h3>{{ $t("shop_email_provider.sender.title") }}</h3>
              <p>{{ $t("shop_email_provider.sender.subtitle") }}</p>
            </div>
          </header>
          <div class="sd-modern-form-grid b-shop-email-provider__fields">
            <v-text-field
              v-model="from"
              append-inner-icon="alternate_email"
              :label="$t('shop_email_provider.inputs.from.label') + ' *'"
              persistent-placeholder
              placeholder="support@yourdomain.com"
              dir="ltr"
              variant="underlined"
              class="sd-modern-underlined-field b-shop-email-provider__field b-shop-email-provider__field--ltr"
              data-field="from"
            />
            <v-text-field
              v-model="from_name"
              :placeholder="(shop.title || shop.name) + ' team'"
              append-inner-icon="person"
              :label="$t('shop_email_provider.inputs.from_name.label') + ' *'"
              persistent-placeholder
              variant="underlined"
              class="sd-modern-underlined-field b-shop-email-provider__field"
              data-field="from_name"
            />
          </div>
        </section>

        <!-- ████████████████████ Save ████████████████████ -->
        <section class="sd-modern-widget b-shop-email-provider__card b-shop-email-provider__save-card">
          <div class="sd-modern-notice b-shop-email-provider__notice">
            <v-icon aria-hidden="true">info_outline</v-icon>
            <p class="sd-modern-notice__content">{{ $t("shop_email_provider.messages.configuration_not_verified") }}</p>
          </div>
          <p v-if="missing_fields.length" class="b-shop-email-provider__missing" role="status">
            {{ $t("shop_email_provider.catalog.missing_fields", { fields: missing_fields.join(", ") }) }}
          </p>
          <div class="b-shop-email-provider__actions">
            <v-btn
              :disabled="!!missing_fields.length || !has_changes"
              :loading="busy_set"
              class="sd-modern-button sd-modern-button--primary b-shop-email-provider__action"
              color="primary"
              variant="elevated"
              @click="save"
            >
              <v-icon start aria-hidden="true">save</v-icon>{{ $t("global.actions.save") }}
            </v-btn>
          </div>
        </section>
      </template>

      <!-- ████████████████████ Errors ████████████████████ -->
      <section v-if="mail_service && (mail_service.errors > 0 || mail_service.error)" class="sd-modern-widget b-shop-email-provider__card b-shop-email-provider__errors">
        <header class="b-shop-email-provider__heading">
          <v-icon aria-hidden="true">error_outline</v-icon>
          <div>
            <h3>{{ $t("shop_email_provider.catalog.errors_title") }}</h3>
            <p v-if="mail_service.errors > 0" class="sd-modern-status sd-modern-status--plain">
              <span class="sd-modern-status__dot sd-modern-status__dot--error" aria-hidden="true"></span>
              {{ $t("shop_email_provider.catalog.status_errors", { count: mail_service.errors }) }}
            </p>
          </div>
          <v-btn v-if="mail_service.errors > 0 && !readOnly" :loading="busy_reset" class="sd-modern-button" variant="outlined" @click="resetErrors">
            <v-icon start aria-hidden="true">restart_alt</v-icon>{{ $t("shop_email_provider.actions.reset_errors", { count: mail_service.errors }) }}
          </v-btn>
        </header>
        <div v-if="mail_service.errors > 10" class="sd-modern-notice b-shop-email-provider__notice" role="status">
          <v-icon color="warning" aria-hidden="true">warning_amber</v-icon>
          <p class="sd-modern-notice__content">{{ $t("shop_email_provider.messages.provider_error_limit") }}</p>
        </div>
        <div v-if="mail_service.error" class="sd-modern-notice b-shop-email-provider__notice" role="status">
          <v-icon color="error" aria-hidden="true">error_outline</v-icon>
          <p class="sd-modern-notice__content"><bdi dir="ltr">{{ mail_service.error }}</bdi></p>
        </div>
      </section>
    </div>

    <!-- ████████████████████████ Test send ████████████████████████ -->
    <v-dialog v-if="!readOnly" v-model="test_dialog" max-width="460" scrollable>
      <v-card class="b-shop-email-provider-dialog" rounded="xl">
        <v-card-title class="b-shop-email-provider-dialog__title">
          <v-icon aria-hidden="true">outgoing_mail</v-icon>{{ $t("shop_email_provider.actions.send_test_email") }}
        </v-card-title>
        <v-card-text>
          <dl class="b-shop-email-provider-dialog__facts">
            <dt>{{ $t("shop_email_provider.catalog.test_to") }}</dt>
            <dd><bdi dir="ltr">{{ USER().email }}</bdi></dd>
            <dt>{{ $t("shop_email_provider.catalog.test_via") }}</dt>
            <dd>{{ saved_provider?.title }}</dd>
            <dt>{{ $t("shop_email_provider.inputs.from.label") }}</dt>
            <dd><bdi dir="ltr">{{ mail_service?.from }}</bdi></dd>
          </dl>
          <p class="b-shop-email-provider-dialog__muted">{{ $t("shop_email_provider.catalog.test_note") }}</p>
          <div v-if="test_result" class="sd-modern-notice b-shop-email-provider-dialog__result" :data-ok="test_result.ok" role="status">
            <v-icon :color="test_result.ok ? 'success' : 'error'" aria-hidden="true">{{ test_result.ok ? "check_circle" : "error_outline" }}</v-icon>
            <p class="sd-modern-notice__content">{{ test_result.ok ? $t("shop_email_provider.catalog.test_accepted", { provider: saved_provider?.title }) : test_result.message }}</p>
          </div>
        </v-card-text>
        <v-card-actions class="b-shop-email-provider-dialog__actions">
          <v-btn class="sd-modern-button" variant="text" @click="test_dialog = false">{{ $t("global.actions.close") }}</v-btn>
          <v-btn class="sd-modern-button sd-modern-button--primary" color="primary" variant="flat" :loading="busy_test" @click="sendTest">
            <v-icon start aria-hidden="true">send</v-icon>{{ $t(test_result ? "shop_email_provider.catalog.test_again" : "shop_email_provider.catalog.test_send") }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ████████████████████████ Provider details ████████████████████████ -->
    <v-dialog :model-value="!!info_provider" max-width="440" scrollable @update:model-value="(open) => { if (!open) info_provider = null; }">
      <v-card v-if="info_provider" class="b-shop-email-provider-dialog" rounded="xl">
        <v-card-title class="b-shop-email-provider-dialog__title">
          <span class="b-shop-email-provider-dialog__avatar" aria-hidden="true">
            <img v-if="info_provider.logo" :src="info_provider.logo" alt="" />
            <span v-else>{{ initials(info_provider.title) }}</span>
          </span>
          {{ info_provider.title }}
        </v-card-title>
        <v-card-text>
          <p v-if="info_provider.description" class="b-shop-email-provider-dialog__muted">{{ info_provider.description }}</p>
          <h4 class="b-shop-email-provider-dialog__heading">{{ $t("shop_email_provider.catalog.info_kind") }}</h4>
          <p class="b-shop-email-provider-dialog__muted"><strong>{{ kindLabel(info_provider) }}</strong> · {{ kindHelp(info_provider) }}</p>
          <h4 class="b-shop-email-provider-dialog__heading">{{ $t("shop_email_provider.catalog.info_fields") }}</h4>
          <ul class="b-shop-email-provider-dialog__fields">
            <li v-for="field in info_provider.fields" :key="field.key">
              {{ field.title }}<bdi v-if="field.default !== null && field.default !== undefined" dir="ltr">{{ field.default }}</bdi>
            </li>
          </ul>
        </v-card-text>
        <v-card-actions class="b-shop-email-provider-dialog__actions">
          <v-btn v-if="info_provider.url" class="sd-modern-button" variant="text" :href="info_provider.url" target="_blank" rel="noopener noreferrer">
            {{ $t("shop_email_provider.catalog.website") }}<v-icon end aria-hidden="true">north_east</v-icon>
          </v-btn>
          <v-btn v-if="info_provider.docs_url" class="sd-modern-button" variant="text" :href="info_provider.docs_url" target="_blank" rel="noopener noreferrer">
            {{ $t("shop_email_provider.catalog.setup_guide") }}<v-icon end aria-hidden="true">north_east</v-icon>
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn v-if="show_picker && !readOnly && driver !== info_provider.key" class="sd-modern-button sd-modern-button--primary" color="primary" variant="flat"
                 @click="selectDriver(info_provider.key); info_provider = null">
            {{ $t("shop_email_provider.catalog.use", { provider: info_provider.title }) }}
          </v-btn>
          <v-btn v-else class="sd-modern-button" variant="text" @click="info_provider = null">{{ $t("global.actions.close") }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ████████████████████████ Switch provider ████████████████████████ -->
    <v-dialog v-if="!readOnly" v-model="confirm_switch" max-width="460">
      <v-card class="b-shop-email-provider-dialog" rounded="xl">
        <v-card-title class="b-shop-email-provider-dialog__title">
          <v-icon aria-hidden="true">swap_horiz</v-icon>{{ $t("shop_email_provider.catalog.switch_title", { to: selected_provider?.title }) }}
        </v-card-title>
        <v-card-text>
          <p>{{ $t("shop_email_provider.catalog.switch_body", { from: saved_provider?.title, to: selected_provider?.title }) }}</p>
        </v-card-text>
        <v-card-actions class="b-shop-email-provider-dialog__actions">
          <v-btn class="sd-modern-button" variant="text" @click="confirm_switch = false">{{ $t("global.actions.cancel") }}</v-btn>
          <v-btn class="sd-modern-button sd-modern-button--primary" color="primary" variant="flat" @click="confirmSwitch">
            {{ $t("shop_email_provider.catalog.switch_continue", { to: selected_provider?.title }) }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </section>
</template>

<script lang="ts">
import USmartSwitch from "../../../../ui/smart/switch/USmartSwitch.vue";

import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

export default {
  name: "BShopEmailProvider",
  components: { USmartSwitch },
  props: {
    shop: {
      required: true,
      type: Object,
    },
    // Provider catalog `{ providers, recommended }` when the page already loaded it; otherwise it is fetched here.
    catalog: {
      type: Object,
      default: null,
    },
    // View only: staff without Settings write access.
    readOnly: {
      type: Boolean,
      default: false,
    },
  },

  data: () => ({
    mail_service: null,
    busy: false,

    own_catalog: null,
    busy_catalog: false,
    catalog_failed: false,
    search: "",
    // The picker is open over a saved provider.
    changing: false,
    info_provider: null,
    confirm_switch: false,
    test_dialog: false,
    test_result: null,
    busy_test: false,

    //----------------------------
    enable: true,
    driver: null,
    // Non-secret values by column (host, port, username, endpoint, encryption).
    values: {},
    // New secret values by column; stored secrets are never loaded.
    secrets: {},
    // Secret columns the merchant chose to replace.
    replacing: {},
    show_secret: {},
    from: null,
    from_name: null,

    busy_set: false,
    busy_reset: false,
  }),

  computed: {
    providers() {
      return (this.catalog || this.own_catalog)?.providers || [];
    },
    recommended() {
      return (this.catalog || this.own_catalog)?.recommended || [];
    },
    // The provider saved for the shop; a driver missing from the catalog still shows by its key.
    saved_provider() {
      const driver = this.mail_service?.driver;
      if (!driver) return null;
      return this.providers.find((p) => p.key === driver) || { key: driver, title: driver, kind: "smtp", fields: [], logo: null };
    },
    show_picker() {
      return !this.saved_provider || this.changing;
    },
    selected_provider() {
      return this.driver ? this.providers.find((p) => p.key === this.driver) || null : null;
    },
    driver_changed() {
      return !!this.mail_service && this.driver !== this.mail_service.driver;
    },
    // Host, port and encryption come from the provider's own setup guide.
    is_preset() {
      return this.selected_provider?.kind === "smtp" && this.selected_provider?.group !== "custom";
    },
    saved_status() {
      const service = this.mail_service || {};
      if (!service.enable) return { key: "disabled", dot: null, text: this.$t("shop_email_provider.status_disabled") };
      if (service.errors > 0) return { key: "errors", dot: "warning", text: this.$t("shop_email_provider.catalog.status_errors", { count: service.errors }) };
      return { key: "active", dot: "success", text: this.$t("shop_email_provider.status_enabled") };
    },
    // Always-open list: the recommended providers, then delivery services, mailboxes and custom SMTP. A search narrows every group.
    picker_groups() {
      const top = this.recommended.map((key) => this.providers.find((p) => p.key === key)).filter(Boolean);
      const rest = this.providers.filter((p) => !this.recommended.includes(p.key));
      const query = (this.search || "").trim().toLowerCase();
      const matches = (p) => !query || [p.title, p.key, p.description].some((text) => String(text || "").toLowerCase().includes(query));
      return [
        { key: "recommended", title: this.$t("shop_email_provider.catalog.recommended"), items: top },
        { key: "delivery", title: this.$t("shop_email_provider.catalog.group_delivery"), items: rest.filter((p) => p.group === "delivery") },
        { key: "mailbox", title: this.$t("shop_email_provider.catalog.group_mailbox"), items: rest.filter((p) => p.group === "mailbox") },
        { key: "custom", title: this.$t("shop_email_provider.catalog.group_custom"), items: rest.filter((p) => p.group === "custom") },
      ]
        .map((group) => ({ ...group, items: group.items.filter(matches) }))
        .filter((group) => group.items.length);
    },
    picker_count() {
      return this.picker_groups.reduce((sum, group) => sum + group.items.length, 0);
    },
    // Required values still empty, by their titles; Save waits for them.
    missing_fields() {
      const missing = [];
      for (const field of this.selected_provider?.fields || []) {
        if (!field.required) continue;
        const filled = field.secret
          ? (this.isStored(field.key) && !this.replacing[field.key]) || !!String(this.secrets[field.key] || "").trim()
          : String(this.values[field.key] ?? "").trim() !== "";
        if (!filled) missing.push(field.title);
      }
      if (this.enable) {
        if (!String(this.from || "").trim()) missing.push(this.$t("shop_email_provider.inputs.from.label"));
        if (!String(this.from_name || "").trim()) missing.push(this.$t("shop_email_provider.inputs.from_name.label"));
      }
      return missing;
    },
    has_changes() {
      const service = this.mail_service;
      if (!service) return !!this.driver;
      const fields = this.selected_provider?.fields || [];
      return this.driver_changed
        || this.enable !== !!service.enable
        || (this.from || null) !== (service.from || null)
        || (this.from_name || null) !== (service.from_name || null)
        || fields.some((f) => !f.secret && String(this.values[f.key] ?? "") !== String(service[f.key] ?? ""))
        || fields.some((f) => f.secret && !!String(this.secrets[f.key] || "").trim());
    },
    // Why a test can't be sent now, or null.
    test_blocked() {
      if (!this.saved_provider) return null;
      if (!this.mail_service.enable) return this.$t("shop_email_provider.catalog.test_enable_first");
      if (this.has_changes) return this.$t("shop_email_provider.catalog.test_save_first");
      return null;
    },
  },

  watch: {
    search() {
      // A new search starts at the top of its results.
      if (this.$refs.pickerList) this.$refs.pickerList.scrollTop = 0;
    },
  },

  created() {
    this.mail_service = this.shop.mail_service || null;
    this.assign();
    this.fetchShopMailService();
    if (!this.catalog) this.fetchProviders();
  },

  methods: {
    initials(title) {
      const words = String(title || "").replace(/[^\p{L}\p{N} ]/gu, " ").split(" ").filter(Boolean);
      return words.slice(0, 2).map((word) => word[0]).join("").toUpperCase() || "?";
    },
    kindLabel(provider) {
      return this.$t(provider?.kind === "api" ? "shop_email_provider.catalog.kind_api" : "shop_email_provider.catalog.kind_smtp");
    },
    kindHelp(provider) {
      return this.$t(provider?.kind === "api" ? "shop_email_provider.catalog.kind_api_help" : "shop_email_provider.catalog.kind_smtp_help");
    },
    optionsOf(field) {
      const names = { tls: "TLS", ssl: "SSL", none: this.$t("shop_email_provider.encryption.none_title") };
      return (field.options || []).map((value) => ({ value, title: field.key === "encryption" ? names[value] || value : value }));
    },
    isStored(column) {
      return !this.driver_changed && this.mail_service?.credentials_status?.[column] === "stored";
    },
    cancelReplace(column) {
      delete this.replacing[column];
      delete this.secrets[column];
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
    // Picking a provider prefills its own values (SMTP host, port, encryption, region); returning to the saved one restores it.
    selectDriver(key) {
      if (this.driver === key) return;
      this.driver = key;
      this.secrets = {};
      this.replacing = {};
      if (this.mail_service && key === this.mail_service.driver) {
        this.assignValues();
        return;
      }
      const values = {};
      for (const field of this.selected_provider?.fields || []) {
        if (!field.secret) values[field.key] = field.default ?? null;
      }
      this.values = values;
    },

    assign() {
      const service = this.mail_service;
      this.enable = service ? !!service.enable : true;
      this.driver = service?.driver || null;
      this.from = service?.from || null;
      this.from_name = service?.from_name || null;
      this.secrets = {};
      this.replacing = {};
      this.assignValues();
    },
    assignValues() {
      const service = this.mail_service || {};
      const values = {};
      for (const column of ["host", "port", "username", "endpoint", "encryption"]) values[column] = service[column] ?? null;
      this.values = values;
    },

    // The provider's columns: non-secret values always, a secret only when entered (an omitted secret stays stored).
    payload() {
      const out = {
        enable: this.enable,
        driver: this.driver,
        from: this.from || null,
        from_name: this.from_name || null,
      };
      for (const field of this.selected_provider?.fields || []) {
        if (field.secret) {
          const value = String(this.secrets[field.key] || "").trim();
          if (value) out[field.key] = value;
        } else {
          const value = this.values[field.key];
          out[field.key] = value === "" || value === undefined ? null : field.type === "number" && value !== null ? Number(value) : value;
        }
      }
      return out;
    },

    // Switching away from a saved provider drops its stored credentials: confirm first.
    save() {
      if (this.saved_provider && this.driver_changed) {
        this.confirm_switch = true;
        return;
      }
      this.setMailService();
    },
    confirmSwitch() {
      this.confirm_switch = false;
      this.setMailService();
    },

    fetchProviders() {
      this.busy_catalog = true;
      this.catalog_failed = false;
      axios
        .get(window.API.GET_SHOP_EMAIL_PROVIDERS(this.shop.id))
        .then(({ data }) => {
          if (!data.error && Array.isArray(data.providers)) this.own_catalog = data;
          else {
            this.catalog_failed = true;
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          this.catalog_failed = true;
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_catalog = false;
        });
    },

    fetchShopMailService() {
      this.busy = true;
      axios
        .get(window.API.GET_SHOP_MAIL_SERVICE(this.shop.id))
        .then(({ data }) => {
          if (!data.error) {
            this.mail_service = data.mail_service;
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

    setMailService() {
      this.busy_set = true;
      axios
        .post(window.API.POST_SET_SHOP_MAIL_SERVICE(this.shop.id), this.payload())
        .then(({ data }) => {
          if (!data.error) {
            this.mail_service = data.mail_service;
            this.shop.mail_service = data.mail_service;
            this.changing = false;
            this.search = "";
            this.assign();
            NotificationService.showSuccessAlert(null, this.$t("shop_email_provider.messages.saved"));
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
        .post(window.API.POST_RESET_SHOP_MAIL_SERVICE(this.shop.id))
        .then(({ data }) => {
          if (!data.error) {
            this.mail_service = data.mail_service;
            this.shop.mail_service = data.mail_service;
            NotificationService.showSuccessAlert(null, this.$t("shop_email_provider.messages.errors_reset"));
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

    openTest() {
      this.test_result = null;
      this.test_dialog = true;
    },
    // The explicit test route sends one email with the saved settings to the signed-in account.
    sendTest() {
      this.busy_test = true;
      this.test_result = null;
      axios
        .post(window.API.POST_SHOP_MAIL_SERVICE_TEST(this.shop.id))
        .then(({ data }) => {
          this.test_result = data.error ? { ok: false, message: data.error_msg } : { ok: true };
        })
        .catch((error) => {
          this.test_result = { ok: false, message: error?.response?.data?.message || error?.message || this.$t("shop_email_provider.catalog.test_failed") };
        })
        .finally(() => {
          this.busy_test = false;
        });
    },
  },
};
</script>

<style lang="scss" scoped>
.b-shop-email-provider {
  position: relative;
  min-width: 0;
  font-family: inherit;
  font-size: 13px;
  line-height: 1.55;

  &__cards { display: grid; grid-template-columns: minmax(0, 1fr); gap: 8px; }
  &__card.sd-modern-widget { position: relative; min-width: 0; padding: 22px; border: 0; border-radius: 0; box-shadow: none; }
  &__card:first-child { border-start-start-radius: 18px; border-start-end-radius: 18px; }
  &__card:last-child { border-end-start-radius: 18px; border-end-end-radius: 18px; }
  &__progress { position: absolute; inset-block-start: 0; inset-inline: 0; }

  &__heading {
    display: flex;
    align-items: flex-start;
    gap: 9px;
    margin-block-end: 18px;
    > .v-icon { flex: 0 0 18px; margin-block-start: 3px; color: var(--sd-modern-muted); font-size: 18px; }
    > div { flex: 1; min-width: 0; }
    h2 { margin: 0; font-family: inherit; font-size: 16px; font-weight: 500; line-height: 24px; }
    h3 { margin: 0; font-family: inherit; font-size: 14px; font-weight: 500; line-height: 22px; }
    p { margin-block: 3px 0; color: var(--sd-modern-muted); font-size: 13px; line-height: 20px; }
  }
  &__read-only { margin-block: 0 14px; padding: 12px 14px; font-size: 13px; line-height: 20px; }

  // Saved provider: one card with its status, kind, sender and the two actions.
  &__current {
    display: grid;
    grid-template-columns: 48px minmax(0, 1fr) auto;
    align-items: start;
    gap: 14px;
    padding: 16px;
    border: 1px solid var(--sd-modern-border);
    border-radius: 16px;
    background: var(--sd-modern-inset);
    .sd-modern-eyebrow { margin: 0; font-size: 10px; line-height: 15px; letter-spacing: .09em; }
  }
  &__current > &__avatar { width: 48px; height: 48px; border-radius: 14px; img { width: 30px; height: 30px; } }
  &__current-text { min-width: 0; }
  &__current-actions { display: flex; flex-direction: column; align-items: stretch; gap: 6px; }
  &__current-note { grid-column: 2 / -1; margin: 0; }
  &__muted { margin: 2px 0 0; color: var(--sd-modern-muted); font-size: 12px; line-height: 18px; }
  &__chips { display: flex; flex-wrap: wrap; align-items: center; gap: 6px 10px; margin-block-start: 10px; }
  &__status { font-size: 12px; line-height: 18px; }
  &__sender { display: inline-flex; align-items: center; gap: 4px; min-width: 0; color: var(--sd-modern-muted); font-size: 12px; line-height: 18px; overflow-wrap: anywhere; }
  &__sender > .v-icon { font-size: 14px; }
  &__tag { gap: 4px; padding: 1px 7px; border: 1px solid var(--sd-modern-border); background: transparent; font-size: 11px; font-weight: 600; line-height: 18px; letter-spacing: .03em; }
  &__tag[data-kind] { cursor: help; }
  &__avatar {
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
  &__avatar--small { width: 28px; height: 28px; border-radius: 8px; font-size: 11px; img { width: 18px; height: 18px; } }

  // Picker: always open, so a search shows its matches at once.
  &__picker { display: grid; gap: 10px; }
  &__picker-head { display: flex; align-items: center; gap: 8px; }
  &__search { flex: 1 1 auto; min-width: 0; }
  &__picker-head :deep(.v-field) { min-height: 42px; border-radius: 10px; }
  &__picker-head :deep(.v-field__input) { min-height: 42px; padding-block: 0; align-items: center; }
  &__picker-head > .v-btn { height: 42px; }
  &__picker-list {
    max-height: min(440px, 58vh);
    overflow-y: auto;
    overscroll-behavior: contain;
    padding: 4px;
    border: 1px solid var(--sd-modern-border);
    border-radius: 14px;
    scrollbar-gutter: stable;
  }
  &__picker-caption { position: sticky; top: -4px; z-index: 2; margin: 0; padding: 10px 10px 6px; background: rgb(var(--v-theme-surface)); font-size: 10px; line-height: 15px; letter-spacing: .09em; }
  // A row selects as a whole (its full-size button sits underneath); the name opens the details.
  &__option {
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
    > :not(.b-shop-email-provider__option-select) { position: relative; z-index: 1; pointer-events: none; }
  }
  &__option-select {
    position: absolute;
    inset: 0;
    z-index: 0;
    width: 100%;
    border-radius: inherit;
    cursor: pointer;
    &:focus-visible { outline: 2px solid rgb(var(--v-theme-primary)); outline-offset: -2px; }
  }
  &__option--active { border-color: rgba(var(--v-theme-primary), .45); background: rgba(var(--v-theme-primary), .06); }
  &__option--active:hover { background: rgba(var(--v-theme-primary), .09); }
  &__option-text { display: flex; flex-direction: column; align-items: flex-start; min-width: 0; }
  &__option-text small { max-width: 100%; overflow: hidden; color: var(--sd-modern-muted); font-size: 12px; line-height: 18px; text-overflow: ellipsis; white-space: nowrap; }
  &__option-meta { display: flex; flex-wrap: wrap; align-items: center; justify-content: flex-end; gap: 5px; }
  &__option-check { color: var(--sd-modern-muted); font-size: 20px; }
  &__option--active &__option-check { color: rgb(var(--v-theme-primary)); }
  &__picker-empty { margin: 0; padding: 28px 12px; color: var(--sd-modern-muted); font-size: 13px; text-align: center; }
  &__name {
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
    pointer-events: auto;
    transition: color .15s, text-decoration-color .15s;
    &:hover, &:focus-visible { color: rgb(var(--v-theme-primary)); text-decoration-color: currentColor; }
    &:focus-visible { outline: 2px solid rgb(var(--v-theme-primary)); outline-offset: 2px; border-radius: 4px; }
  }
  &__name--large { margin-block-start: 2px; font-size: 16px; font-weight: 600; line-height: 24px; }

  // The provider being set up, with its setup guide.
  &__selected { display: flex; flex-wrap: wrap; align-items: center; gap: 8px 10px; margin-block-start: 12px; padding: 10px 12px; border-radius: 12px; background: var(--sd-modern-inset); }
  &__selected-name { font-size: 13px; font-weight: 600; }
  &__link { display: inline-flex; align-items: center; gap: 4px; margin-inline-start: auto; color: rgb(var(--v-theme-primary)); font-size: 12px; font-weight: 500; }
  &__link .v-icon { font-size: 14px; }

  &__enable { margin-block-end: 18px; }
  &__guidance { display: flex; align-items: flex-start; gap: 7px; margin-block: 0 12px; color: var(--sd-modern-muted); font-size: 12px; line-height: 19px; }
  &__guidance > .v-icon { margin-block-start: 1px; font-size: 16px; }
  &__fields { gap: 22px; }
  &__field--ltr :deep(input) { direction: ltr; text-align: start; }
  &__stored { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px; min-height: 56px; padding-block: 8px; border-block-end: 1px solid var(--sd-modern-border); }
  &__stored-label { display: flex; flex-direction: column; font-size: 12px; line-height: 18px; color: var(--sd-modern-muted); }
  &__stored-state { display: inline-flex; align-items: center; gap: 4px; color: rgb(var(--v-theme-on-surface)); font-size: 13px; line-height: 20px; }
  &__stored-state .v-icon { color: rgb(var(--v-theme-success)); font-size: 16px; }
  &__inline { text-transform: none; letter-spacing: normal; }
  &__help { margin-block: 16px 0; color: var(--sd-modern-muted); font-size: 12px; line-height: 19px; }

  &__notice { gap: 9px; padding: 13px; font-size: 12px; line-height: 19px; }
  &__notice p { margin: 0; }
  &__errors &__notice + &__notice { margin-block-start: 10px; }
  &__errors &__heading { flex-wrap: wrap; }
  &__missing { margin-block: 12px 0; color: var(--sd-modern-muted); font-size: 12px; line-height: 19px; }
  &__actions { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 10px; margin-block-start: 16px; }
  &__action.sd-modern-button {
    --v-btn-height: 42px;
    min-height: 42px;
    padding: 10px 15px;
    border-radius: 9px;
    font-size: 13px;
    font-weight: 500;
    line-height: 20px;
    text-transform: none;
    :deep(.v-icon) { width: 16px; height: 16px; font-size: 16px; }
  }

  @media (max-width: 700px) {
    &__current { grid-template-columns: 48px minmax(0, 1fr); }
    &__current-actions { grid-column: 1 / -1; flex-direction: row; flex-wrap: wrap; }
    &__current-note { grid-column: 1 / -1; }
    &__option { grid-template-columns: 40px minmax(0, 1fr) 22px; }
    &__option-meta { grid-column: 2; grid-row: 2; justify-content: flex-start; }
    &__option-check { grid-column: 3; grid-row: 1; }
    &__option-text small { display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; white-space: normal; }
    &__link { margin-inline-start: 0; }
  }
  @media (max-width: 600px) {
    &__card.sd-modern-widget { padding: 20px 16px; }
    &__fields { grid-template-columns: minmax(0, 1fr); gap: 20px; }
  }
  @media (max-width: 600px), (pointer: coarse) {
    &__action.sd-modern-button { --v-btn-height: 44px; min-height: 44px; }
    &__option { min-height: 64px; }
  }
  // Smart invert flips the content window: keep provider logos in their own colors.
  .smart-invert &__avatar img { filter: invert(1); }
}
</style>

<style lang="scss">
// Dialogs render outside the component (Vuetify overlay), so these class names stay unique and unscoped.
.b-shop-email-provider-dialog {
  text-align: start;
  font-size: 13px;
  line-height: 20px;

  .b-shop-email-provider-dialog__title { display: flex; align-items: center; gap: 10px; padding: 20px 22px 6px; font-size: 16px; font-weight: 600; line-height: 24px; white-space: normal; }
  .b-shop-email-provider-dialog__title .v-icon { color: rgb(var(--v-theme-primary)); }
  .v-card-text { padding: 8px 22px 6px !important; }
  .b-shop-email-provider-dialog__facts { display: grid; grid-template-columns: max-content minmax(0, 1fr); gap: 6px 16px; margin: 0 0 12px; padding: 12px 14px; border-radius: 12px; background: rgba(var(--v-theme-on-surface), .04); }
  .b-shop-email-provider-dialog__facts dt { color: rgba(var(--v-theme-on-surface), .6); }
  .b-shop-email-provider-dialog__facts dd { margin: 0; font-weight: 500; overflow-wrap: anywhere; }
  .b-shop-email-provider-dialog__muted { margin: 0 0 6px; color: rgba(var(--v-theme-on-surface), .62); font-size: 12px; line-height: 18px; }
  .b-shop-email-provider-dialog__result { display: flex; align-items: flex-start; gap: 8px; margin-block-start: 12px; padding: 12px; border-radius: 12px; }
  .b-shop-email-provider-dialog__result p { margin: 0; }
  .b-shop-email-provider-dialog__actions { flex-wrap: wrap; justify-content: flex-end; gap: 8px; padding: 12px 18px 18px !important; }
  .b-shop-email-provider-dialog__actions .v-btn { min-height: 40px; text-transform: none; letter-spacing: normal; }
  .b-shop-email-provider-dialog__avatar { display: grid; place-items: center; flex: 0 0 34px; width: 34px; height: 34px; overflow: hidden; border: 1px solid rgba(var(--v-theme-on-surface), .12); border-radius: 10px; color: rgb(var(--v-theme-primary)); font-size: 12px; font-weight: 700; }
  .b-shop-email-provider-dialog__avatar img { width: 22px; height: 22px; object-fit: contain; }
  .b-shop-email-provider-dialog__heading { margin: 14px 0 6px; font-size: 11px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; color: rgba(var(--v-theme-on-surface), .6); }
  .b-shop-email-provider-dialog__fields { display: grid; gap: 4px; margin: 0; padding: 0; list-style: none; }
  .b-shop-email-provider-dialog__fields li { display: flex; justify-content: space-between; gap: 12px; padding: 4px 9px; border-radius: 8px; background: rgba(var(--v-theme-on-surface), .04); font-size: 12px; line-height: 18px; }
  .b-shop-email-provider-dialog__fields bdi { color: rgba(var(--v-theme-on-surface), .62); font-family: monospace; overflow-wrap: anywhere; }
}
</style>
