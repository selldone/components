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
  <v-card v-if="!modern || (shop && sms)" class="text-start" :class="{ 'sd-modern-canvas b-shop-sms-template-editor': modern }" flat>
    <v-card-title class="d-flex align-center" :class="{ 'b-shop-sms-template-editor__title': modern }">
      <v-avatar :class="modern ? 'me-2' : 'me-1'" :size="modern ? 32 : undefined" rounded>
        <v-img :src="getShopImagePath(shop.icon, 128)"></v-img>
      </v-avatar>
      <div>
      {{
        template
          ? $t("shop_sms.template_edit.title_edit")
          : $t("shop_sms.template_edit.title_add")
      }}
        <p v-if="modern" class="b-shop-sms-template-editor__event">{{ sms.title }}</p>
      </div>
      <v-spacer v-if="modern" />
      <v-btn v-if="modern" class="sd-modern-icon-button" :disabled="busy" :aria-label="$t('global.actions.close')" icon variant="text" @click="$emit('close')">
        <v-icon aria-hidden="true">close</v-icon>
        <v-tooltip activator="parent" content-class="sd-modern-tooltip text-start" location="top">{{ $t('global.actions.close') }}</v-tooltip>
      </v-btn>
    </v-card-title>
    <v-card-text>
      <div :class="{ 'sd-modern-form b-shop-sms-template-editor__content': modern, 'b-shop-sms-template-editor__content--basics': modern && currentStep === 1 }">
      <template v-if="modern">
        <div class="b-shop-sms-template-editor__context">
          <code dir="ltr">{{ sms.code }}</code>
          <span v-if="sms_provider" class="b-shop-sms-template-editor__provider"><img :src="sms_provider.icon" alt="" />{{ sms_provider.title }}</span>
        </div>
        <v-stepper :model-value="currentStep" class="b-shop-sms-template-editor__steps" flat @update:model-value="goToStep">
          <v-stepper-header>
            <v-stepper-item :value="1" :complete="currentStep > 1" :disabled="busy || busy_default" editable :title="$t('shop_sms.guided.basics')" />
            <v-divider />
            <v-stepper-item :value="2" :complete="currentStep > 2" :disabled="busy || busy_default || !can_continue_basics" editable :title="$t('shop_sms.guided.message')" />
            <v-divider />
            <v-stepper-item :value="3" :disabled="busy || busy_default || !can_continue_message" editable :title="$t('shop_sms.guided.review')" />
          </v-stepper-header>
        </v-stepper>
      </template>
      <!-- ███████████████████████ Template Info ███████████████████████ -->

      <div v-show="!modern || currentStep === 1" :class="modern ? 'sd-modern-widget' : 'widget-box mb-5'">
        <u-widget-header
          :class="{ 'sd-modern-form-header': modern }"
          icon="tune"
          :title="$t(modern ? 'shop_sms.guided.basics' : 'shop_sms.template_edit.config.title')"
        ></u-widget-header>
        <v-list-subheader v-if="!modern">
          {{ $t("shop_sms.template_edit.config.subtitle") }}
        </v-list-subheader>

        <v-text-field
          v-if="!modern"
          :model-value="sms.title"
          disabled
          :label="$t('shop_sms.template_edit.config.code')"
          variant="underlined"
          :prepend-inner-icon="sms.icon"
          :class="{ 'sd-modern-underlined-field': modern }"
        ></v-text-field>

        <div :class="{ 'b-shop-sms-template-editor__basic-fields': modern }">
        <u-language-input
          v-model="language"
          :available-languages="languages"
          prepend-inner-icon="translate"
          clearable
          max-width="unset"
          :messages="$t('shop_sms.template_edit.config.language_msg')"
          persistent-placeholder
          :placeholder="modern ? $t('shop_sms.modern.default_language') : 'Default - All languages'"
          :title="$t('global.commons.language')"
          variant="underlined"
          :class="{ 'sd-modern-underlined-field': modern }"
          :disabled="modern && (busy || busy_default)"
        >
        </u-language-input>

        <u-smart-switch
          v-model="enable"
          :false-title="$t('global.commons.disable')"
          :true-title="$t('global.commons.enable')"
          class="my-3"
          false-gray
          false-icon="close"
          :true-description="$t('shop_sms.template_edit.config.enable_msg')"
          true-icon="check"
          :border="modern"
          :class="{ 'sd-modern-smart-select': modern }"
          :accessible="modern"
          :disabled="modern && (busy || busy_default)"
        >
        </u-smart-switch>
        </div>

        <h3 v-if="modern" class="b-shop-sms-template-editor__format-title">{{ $t('shop_sms.guided.format_title') }}</h3>
        <u-smart-select
          v-model="mode"
          :items="guided_modes"
          class="my-3"
          item-description="desc"
          item-icon="icon"
          item-text="title"
          item-value="code"
          :disabled="!!template || (modern && (busy || busy_default))"
          :border="modern"
          :class="{ 'sd-modern-smart-select sd-modern-smart-select--columns': modern }"
          :accessible="modern"
          :force-show-all="modern"
        >
        </u-smart-select>
        <p v-if="modern && template" class="sd-modern-subtitle">{{ $t('shop_sms.guided.format_locked') }}</p>
      </div>

      <div v-show="!modern || currentStep === 2" :class="{ 'b-shop-sms-template-editor__compose-grid': modern }">
      <!-- ███████████████████████ Mode > Text ███████████████████████ -->

      <div v-if="mode === 'text'" :class="modern ? 'sd-modern-widget' : 'widget-box mb-5'">
        <u-widget-header
          :class="{ 'sd-modern-form-header': modern }"
          icon="subject"
          :title="$t('shop_sms.template_edit.text.title')"
        ></u-widget-header>
        <v-list-subheader>
          {{ $t(modern ? 'shop_sms.guided.write_help' : 'shop_sms.template_edit.text.subtitle') }}
        </v-list-subheader>

        <v-textarea
          ref="messageInput"
          v-model="text"
          :rows="3"
          auto-grow
          hide-details
          :label="$t('shop_sms.template_edit.text.message')"
          variant="underlined"
          :class="{ 'sd-modern-underlined-field': modern }"
          :disabled="modern && (busy || busy_default)"
          @keyup="rememberTextSelection"
          @click="rememberTextSelection"
          @select="rememberTextSelection"
          @blur="rememberTextSelection"
        ></v-textarea>

        <div class="text-end mb-3">
          <v-btn
            :loading="busy_default"
            :disabled="modern && (busy || busy_default)"
            :class="modern ? 'sd-modern-button sd-modern-button--inline' : 'tnt'"
            color="primary"
            variant="text"
            @click="getDefaultText()"
          >
            <v-icon class="me-1">restart_alt</v-icon>
            {{ $t("shop_sms.template_edit.text.reset_to_default") }}

            <b class="ms-1">{{ getLanguageName(language) }}</b>
          </v-btn>
        </div>

        <hr v-if="!modern" class="my-5" />

        <u-widget-header
          :class="{ 'sd-modern-form-header b-shop-sms-template-editor__subheading': modern }"
          :title="$t(modern ? 'shop_sms.guided.insert_parameter' : 'shop_sms.template_edit.text.auto_fill.title')"
          icon="auto_awesome"
        >
        </u-widget-header>

        <v-list-subheader>
          {{ $t("shop_sms.template_edit.text.auto_fill.subtitle") }}
        </v-list-subheader>

        <v-list
          v-if="sms.params"
          class="bg-transparent my-3 border-between-vertical"
          density="compact"
        >
          <v-list-item v-for="(value, key) in sms.params" :key="key">
            <v-list-item-title class="py-2"
              ><b v-copy>:{{ key }}</b></v-list-item-title
            >
            <v-list-item-subtitle>{{ value }}</v-list-item-subtitle>
            <template v-slot:append>
              <v-btn v-if="modern" class="sd-modern-button sd-modern-button--inline" variant="text" color="primary" :aria-label="`${$t('shop_sms.guided.insert')} :${key} — ${value}`" :disabled="busy || busy_default" @click="insertParameter(key)">
                <v-icon start aria-hidden="true">add</v-icon>{{ $t('shop_sms.guided.insert') }}
              </v-btn>
              <v-scale-transition>
                <v-icon v-if="text && text.includes(`:${key}`)" color="success"
                  >check
                </v-icon>
              </v-scale-transition>
            </template>
          </v-list-item>
        </v-list>

        <u-widget-header v-if="!modern"
          :class="{ 'sd-modern-form-header b-shop-sms-template-editor__subheading': modern }"
          :title="$t('shop_sms.template_edit.text.sample.title')"
          icon="science"
        >
        </u-widget-header>

        <v-list-subheader v-if="!modern" class="my-3">
          <div v-html="sms.sample"></div>
        </v-list-subheader>
      </div>

      <!-- ███████████████████████ Mode > Template ███████████████████████ -->

      <div v-if="mode === 'template'" :class="modern ? 'sd-modern-widget' : 'widget-box mb-5'">
        <u-widget-header
          :class="{ 'sd-modern-form-header': modern }"
          icon="data_object"
          :title="$t(modern && is_kavenegar ? 'shop_sms.guided.pattern_title' : 'shop_sms.template_edit.template.title')"
        ></u-widget-header>
        <v-list-subheader>
          <p v-if="modern && is_kavenegar">{{ $t('shop_sms.guided.pattern_help') }}</p>
          <div v-else
            v-html="
              $t('shop_sms.template_edit.template.subtitle', { code: sms.code })
            "
          ></div>
        </v-list-subheader>

        <v-list class="bg-transparent">
          <v-list-item v-for="(it, i) in data" :key="i">
            <div :class="modern ? { 'b-shop-sms-template-editor__parameter': true, 'b-shop-sms-template-editor__parameter--fixed': is_kavenegar && isPermanent(it.key) } : 'd-flex align-stretch border-between'">
              <div v-if="modern && is_kavenegar && isPermanent(it.key)" class="b-shop-sms-template-editor__fixed-key"><code>{{ it.key }}</code><v-icon size="16" aria-hidden="true">lock</v-icon><span>{{ $t('shop_sms.guided.fixed_key') }}</span></div>
              <v-text-field
                v-else
                v-model="it.key"
                :readonly="isPermanent(it.key)"
                :append-inner-icon="isPermanent(it.key) ? 'lock' : undefined"
                flat
                hide-details
                :placeholder="modern ? $t('shop_sms.modern.enter_key') : 'Enter a key...'"
                :label="modern ? $t('shop_sms.modern.parameter_key') : 'Key'"
                :variant="modern ? 'underlined' : 'solo'"
                :rounded="modern ? undefined : 's-xl'"
                :class="{ 'sd-modern-underlined-field': modern }"
                :disabled="modern && (busy || busy_default)"
                persistent-placeholder
              >
              </v-text-field>
              <v-text-field
                v-model="it.value"
                flat
                hide-details
                :placeholder="modern ? $t('shop_sms.modern.enter_value') : 'Enter a value...'"
                :label="modern ? $t(is_kavenegar ? 'shop_sms.guided.pattern_title' : 'shop_sms.modern.parameter_value') : 'Value'"
                :variant="modern ? 'underlined' : 'solo'"
                :rounded="modern ? undefined : 'e-xl'"
                :class="{ 'sd-modern-underlined-field': modern }"
                :disabled="modern && (busy || busy_default)"
                persistent-placeholder
              >
              </v-text-field>
            </div>

            <template v-slot:append>
              <v-list-item-action v-if="!modern || !isPermanent(it.key)">
                <v-btn :color="modern ? undefined : 'red'" :class="{ 'sd-modern-icon-button': modern }" :aria-label="modern ? $t('global.actions.delete') : undefined" :disabled="modern && (busy || busy_default)" icon @click="data.remove(it)" variant="text">
                  <v-icon>close</v-icon>
                  <v-tooltip v-if="modern" activator="parent" content-class="sd-modern-tooltip text-start" location="top">{{ $t('global.actions.delete') }}</v-tooltip>
                </v-btn>
              </v-list-item-action>
            </template>
          </v-list-item>
        </v-list>
        <p v-if="modern && is_kavenegar" class="sd-modern-subtitle">{{ $t('shop_sms.guided.pattern_fallback') }}</p>
        <section v-if="modern && is_kavenegar" class="b-shop-sms-template-editor__automatic">
          <h3>{{ $t('shop_sms.guided.automatic_values') }}</h3>
          <dl v-for="row in provider_token_rows" :key="row.token" class="b-shop-sms-template-editor__mapping"><dt><code v-copy>{{ row.token }}</code></dt><dd><code dir="ltr">{{ row.parameter }}</code><span>{{ row.label }}</span></dd></dl>
        </section>

        <v-btn
          v-if="sms_provider?.template?.has_dynamic_parameters"
          :class="modern ? 'sd-modern-button sd-modern-button--inline' : 'ma-2'"
          color="primary"
          :disabled="modern && (busy || busy_default)"
          variant="text"
          @click="data.push({ key: '', value: '' })"
        >
          <v-icon start>add</v-icon>

          {{ $t("shop_sms.template_edit.template.add_new_parameter") }}
        </v-btn>

        <hr v-if="!modern" class="my-5" />

        <template
          v-if="sms.params && sms_provider?.template?.has_dynamic_parameters"
        >
          <u-widget-header
            :class="{ 'sd-modern-form-header b-shop-sms-template-editor__subheading': modern }"
            :title="$t('shop_sms.template_edit.template.auto_fill.title')"
            icon="auto_awesome"
          >
          </u-widget-header>

          <v-list-subheader>
            {{ $t("shop_sms.template_edit.template.auto_fill.subtitle") }}
          </v-list-subheader>
          <v-list
            class="bg-transparent border-between-vertical"
            density="compact"
          >
            <v-list-item v-for="(value, key) in sms.params" :key="key">
              <v-list-item-title class="py-2"
                ><b v-copy>{{ key }}</b></v-list-item-title
              >
              <v-list-item-subtitle>{{ value }}</v-list-item-subtitle>
              <template v-slot:append>
                <v-scale-transition>
                  <v-icon
                    v-if="data && data.some((d) => d.value === key)"
                    color="success"
                    >check
                  </v-icon>
                </v-scale-transition>
              </template>
            </v-list-item>
          </v-list>
        </template>

        <template v-if="!modern && sample_template && !busy_default">
          <u-widget-header
            :class="{ 'sd-modern-form-header b-shop-sms-template-editor__subheading': modern }"
            :title="$t('shop_sms.template_edit.template.sample.title')"
            icon="chat_bubble_outline"
          >
          </u-widget-header>
          <v-list-subheader>
            {{ $t("shop_sms.template_edit.template.sample.subtitle") }}
          </v-list-subheader>

          <u-text-copy-box
            :value="sample_template"
            small-width-mode
          ></u-text-copy-box>

          <v-chip v-for="(t_value,t_key) in sample_template_tokens" :key="t_key" class="ma-1" :class="{ 'b-shop-sms-template-editor__token': modern }" append-icon="content_copy" @click="copyToClipboard(t_key)" size="small" :title="modern ? undefined : 'Click to copy key'" :aria-label="modern ? $t('shop_sms.modern.copy_key') : undefined">
            <b>{{t_key}}</b> <small class="mx-1">|</small> {{t_value}}
            <v-tooltip v-if="modern" activator="parent" content-class="sd-modern-tooltip text-start" location="top">{{ $t('shop_sms.modern.copy_key') }}: {{ t_key }} · {{ t_value }}</v-tooltip>
          </v-chip>


          <hr v-if="!modern" class="my-5" />
        </template>

        <div class="text-center" v-else-if="busy_default">
          <v-progress-circular class="my-5" size="64" indeterminate>
          </v-progress-circular>
        </div>

        <details v-if="modern && preview_data" class="b-shop-sms-template-editor__details">
          <summary>{{ $t('shop_sms.guided.saved_configuration') }}</summary>
          <vue-json-pretty :data="preview_data" class="my-3" />
        </details>
        <template v-if="!modern && preview_data">
          <u-widget-header
            :class="{ 'sd-modern-form-header b-shop-sms-template-editor__subheading': modern }"
            :title="$t('shop_sms.template_edit.template.request.title')"
            icon="science"
          >
          </u-widget-header>

          <vue-json-pretty :data="preview_data" class="my-3"></vue-json-pretty>
        </template>
      </div>
      <aside v-if="modern && mode" class="sd-modern-widget b-shop-sms-template-editor__preview">
        <u-widget-header class="sd-modern-form-header" icon="smartphone" :title="$t(mode === 'text' ? 'shop_sms.guided.sample_preview' : 'shop_sms.guided.provider_sample')" />
        <p class="sd-modern-subtitle">{{ $t(mode === 'text' ? 'shop_sms.guided.sample_only' : is_kavenegar ? 'shop_sms.guided.kavenegar_sample_help' : 'shop_sms.guided.provider_sample_help') }}</p>
        <div v-if="mode === 'text'" class="b-shop-sms-template-editor__message" dir="auto">{{ text_preview.text }}</div>
        <template v-else>
          <div v-if="sample_template" class="b-shop-sms-template-editor__message" dir="auto">{{ sampleText(sample_template) }}</div>
          <p v-else-if="!busy_default" class="sd-modern-subtitle">{{ $t('shop_sms.guided.unavailable_value') }}</p>
          <div v-for="(value, key) in sample_template_tokens" :key="key" class="b-shop-sms-template-editor__reference-token"><code v-copy>{{ key }}</code><span>{{ value }}</span></div>
        </template>
        <p v-if="mode === 'text' && text_preview.unresolved.length" class="b-shop-sms-template-editor__unresolved">{{ $t('shop_sms.guided.unresolved_help') }} <code>{{ text_preview.unresolved.join(', ') }}</code></p>
        <details v-if="parameter_previews.length" class="b-shop-sms-template-editor__details" open>
          <summary>{{ $t('shop_sms.guided.sample_values') }}</summary>
          <dl v-for="row in parameter_previews" :key="row.key" class="b-shop-sms-template-editor__sample-value"><dt><code v-copy>{{ ':' + row.key }}</code><span>{{ row.label }}</span></dt><dd>{{ row.value ?? $t('shop_sms.guided.unavailable_value') }}</dd></dl>
        </details>
      </aside>
      </div>
      <section v-if="modern && currentStep === 3" class="sd-modern-widget b-shop-sms-template-editor__review">
        <u-widget-header class="sd-modern-form-header" icon="fact_check" :title="$t('shop_sms.guided.review_title')" />
        <p class="sd-modern-subtitle">{{ $t('shop_sms.guided.review_help') }}</p>
        <dl class="sd-modern-form-meta">
          <div><dt>{{ $t('global.commons.language') }}</dt><dd>{{ language ? getLanguageName(language) : $t('shop_sms.modern.default_language') }}</dd></div>
          <div><dt>{{ $t('shop_sms.guided.status') }}</dt><dd class="sd-modern-status sd-modern-status--plain"><span class="sd-modern-status__dot" :class="enable ? 'sd-modern-status__dot--success' : 'sd-modern-status__dot--error'" />{{ $t(enable ? 'shop_sms.modern.enabled' : 'shop_sms.modern.disabled') }}</dd></div>
          <div><dt>{{ $t('shop_sms.guided.format') }}</dt><dd>{{ $t(mode === 'text' ? 'sms_template_mode.text.title' : 'sms_template_mode.template.title') }}</dd></div>
          <div><dt>{{ $t('shop_sms.template_edit.config.code') }}</dt><dd><code dir="ltr">{{ sms.code }}</code></dd></div>
        </dl>
        <div v-if="mode === 'text'" class="b-shop-sms-template-editor__message" dir="auto">{{ text }}</div>
        <vue-json-pretty v-else :data="preview_data" />
      </section>
      </div>
    </v-card-text>
    <v-card-actions :class="{ 'sd-modern-form-actions b-shop-sms-template-editor__actions': modern, 'b-shop-sms-template-editor__actions--basics': modern && currentStep === 1 }">
      <div class="widget-buttons">
        <v-btn :class="{ 'sd-modern-button sd-modern-button--form': modern }" :disabled="modern && busy" :size="modern ? 'default' : 'x-large'" :variant="modern ? 'outlined' : 'text'" @click="$emit('close')">
          <v-icon start>close</v-icon>
          {{ $t("global.actions.close") }}
        </v-btn>

        <v-btn
          v-if="modern && currentStep > 1"
          class="sd-modern-button sd-modern-button--form"
          variant="outlined"
          :disabled="busy || busy_default"
          @click="goToStep(currentStep - 1)"
        ><v-icon start aria-hidden="true">{{ $vuetify.locale.isRtl ? 'arrow_forward' : 'arrow_back' }}</v-icon>{{ $t('shop_sms.guided.back') }}</v-btn>
        <v-btn
          v-if="modern && currentStep < 3"
          class="sd-modern-button sd-modern-button--form sd-modern-button--primary"
          color="primary"
          variant="elevated"
          :disabled="busy || busy_default || (currentStep === 1 ? !can_continue_basics : !can_continue_message)"
          @click="goToStep(currentStep + 1)"
        >{{ $t('shop_sms.guided.continue') }}<v-icon end aria-hidden="true">{{ $vuetify.locale.isRtl ? 'arrow_back' : 'arrow_forward' }}</v-icon></v-btn>
        <v-btn
          v-if="template && (!modern || currentStep === 3)"
          :class="{ disabled: !mode, 'sd-modern-button sd-modern-button--form sd-modern-button--primary': modern }"
          :disabled="modern && !canSubmitTemplate()"
          :loading="busy"
          color="primary"
          :size="modern ? 'default' : 'x-large'"
          variant="elevated"
          @click="editTemplate()"
        >
          <v-icon start>save</v-icon>

          {{ $t("global.actions.save_changes") }}
        </v-btn>
        <v-btn
          v-else-if="!template && (!modern || currentStep === 3)"
          :class="{ disabled: !mode, 'sd-modern-button sd-modern-button--form sd-modern-button--primary': modern }"
          :disabled="modern && !canSubmitTemplate()"
          :loading="busy"
          color="primary"
          :size="modern ? 'default' : 'x-large'"
          variant="elevated"
          @click="addTemplate()"
        >
          <v-icon start>add</v-icon>

          {{ $t("shop_sms.template_edit.template.add_message_action") }}
        </v-btn>
      </div>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts">
import ULanguageInput from "../../../../../ui/language/input/ULanguageInput.vue";
import USmartSelect from "../../../../../ui/smart/select/USmartSelect.vue";
import { SmsTemplateMode } from "@selldone/core-js/enums/sms/SmsTemplateMode";

import VueJsonPretty from "vue-json-pretty";
import "vue-json-pretty/lib/styles.css";
import USmartSwitch from "../../../../../ui/smart/switch/USmartSwitch.vue";
import { SmsProviders } from "@selldone/core-js/enums/sms/SmsProviders";
import { ShopOptionsHelper } from "@selldone/core-js/helper/shop/ShopOptionsHelper";
import UWidgetHeader from "@selldone/components-vue/ui/widget/header/UWidgetHeader.vue";
import UTextCopyBox from "@selldone/components-vue/ui/text/copy-box/UTextCopyBox.vue";

import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

export default {
  name: "BShopSmsTemplateEditor",
  mixins:[],

  components: {
    UTextCopyBox,
    UWidgetHeader,
    USmartSwitch,
    USmartSelect,
    ULanguageInput,

    VueJsonPretty,
  },
  props: {
    modern: Boolean,
    shop: {
      required: true,
    },
    sms: {
      required: true,
    },
    template: {
      // Edit mode
      required: false,
    },
  },

  data: () => ({
    currentStep: 1,
    draft_scope: null,
    defaultRequest: 0,
    textSelectionStart: 0,
    textSelectionEnd: 0,
    enable: true,

    language: null,
    mode: null,
    text: null,
    data: [],
    code: null,

    busy: false,

    sample_template: null,
    sample_template_tokens:[],
    // ------------------------------
    busy_default: false,
    defaults: {}, // Keep received values!
  }),

  computed: {
    editor_scope() {
      return `${this.shop?.id ?? ''}:${this.sms?.code ?? ''}:${this.template?.id ?? ''}`;
    },
    is_kavenegar() {
      return this.sms_provider?.driver === 'kavenegar';
    },
    guided_modes() {
      if (!this.modern) return this.modes;
      return this.modes.map((mode) => ({
        ...mode,
        desc: mode.code === 'text' ? 'shop_sms.guided.text_help' : 'shop_sms.guided.template_help',
      }));
    },
    can_continue_basics() {
      if (!this.shop?.id || !this.sms?.code || this.sms.verification) return false;
      if (!['text', 'template'].includes(this.mode)) return false;
      if (this.template) return this.mode === this.template.mode;
      return !!this.sms_provider?.[this.mode === 'text' ? 'support_text' : 'support_template'];
    },
    can_continue_message() {
      if (!this.can_continue_basics) return false;
      if (this.mode === 'text') return typeof this.text === 'string' && this.text.trim().length > 0;
      return Array.isArray(this.data) && this.data.every((row) => typeof row.key === 'string' && row.key.trim().length > 0);
    },
    sample_values() {
      return this.extractSampleValues(this.sms?.body, this.sms?.sample);
    },
    text_preview() {
      return this.resolveTextPreview(this.text, this.sample_values);
    },
    parameter_previews() {
      return Object.entries(this.sms?.params || {}).map(([key, label]) => ({ key, label, value: this.sample_values[key] ?? null }));
    },
    provider_token_rows() {
      return ['param1', 'param2', 'param3'].filter((key) => this.sms?.params?.[key]).map((key) => ({
        token: key === 'param1' ? '%token' : `%token${key.slice(5)}`,
        parameter: `:${key}`,
        label: this.sms.params[key],
      }));
    },
    // ▃▃▃▃▃▃▃▃▃▃▃▃▃ Languages ▃▃▃▃▃▃▃▃▃▃▃▃▃
    languages() {
      // Available languages of shop!
      return this.shop && ShopOptionsHelper.GetLanguages(this.shop);
    },

    preview_data() {
      if (!this.data) return null;
      if (this.modern) return Object.fromEntries(this.data.map((row) => [row.key, row.value]));
      const out = { template: this.sms.code }; // DEfault template code!

      this.data.forEach((it) => {
        const found = this.sms.params && this.sms.params[it.value];
        out[it.key] = it.value + (found ? ` — replace with ${found} ♻` : "");
      });

      return out;
    },
    sms_service() {
      return this.shop?.sms_service;
    },
    sms_provider() {
      const driver = this.sms_service ? this.sms_service.driver : "default";
      return SmsProviders.find((i) => i.driver === driver);
    },

    modes() {
      if (!this.sms_provider) return Object.values(SmsTemplateMode);

      const out = [
        Object.assign({}, SmsTemplateMode.text),
        Object.assign({}, SmsTemplateMode.template),
      ];

      // Disable not supported modes:
      out[0].disabled = !this.sms_provider.support_text;
      out[1].disabled = !this.sms_provider.support_template;

      return out;
    },
  },

  watch: {
    mode(mode) {
      if (this.modern) {
        this.defaultRequest++;
        this.busy_default = false;
      }
      if (mode === SmsTemplateMode.template.code) {
        this.getDefaultTemplate();
      }
    },
    language() {
      if (!this.modern) return;
      this.defaultRequest++;
      this.busy_default = false;
      if (this.mode === 'template') this.getDefaultTemplate();
    },
    editor_scope() {
      if (!this.modern) return;
      this.defaultRequest++;
      this.busy = false;
      this.busy_default = false;
      this.currentStep = 1;
      this.defaults = {};
      this.sample_template = null;
      this.sample_template_tokens = [];
      this.assignValues();
    },
    'sms_service.driver'() {
      if (!this.modern) return;
      this.defaultRequest++;
      this.busy_default = false;
      this.defaults = {};
      if (this.mode === 'template') this.getDefaultTemplate();
    },
  },

  methods: {
    goToStep(step) {
      if (!this.modern || this.busy || this.busy_default || ![1, 2, 3].includes(Number(step))) return;
      if (step > 1 && !this.can_continue_basics) return;
      if (step > 2 && !this.can_continue_message) return;
      this.currentStep = Number(step);
    },
    canSubmitTemplate() {
      if (!this.modern) return true;
      if (this.busy || this.busy_default || this.currentStep !== 3 || !this.can_continue_message) return false;
      if (this.draft_scope !== this.editor_scope) return false;
      return !!this.template || !!(this.sms_service?.enable && this.sms_provider && this.sms_provider.driver !== 'default');
    },
    rememberTextSelection(event) {
      if (!this.modern || event?.target?.tagName !== 'TEXTAREA') return;
      this.textSelectionStart = event.target.selectionStart;
      this.textSelectionEnd = event.target.selectionEnd;
    },
    insertParameter(key) {
      if (!this.modern || this.busy || this.busy_default || this.mode !== 'text' || this.draft_scope !== this.editor_scope || !Object.prototype.hasOwnProperty.call(this.sms?.params || {}, key)) return;
      const value = this.text || '';
      const start = Math.min(this.textSelectionStart, value.length);
      const end = Math.max(start, Math.min(this.textSelectionEnd, value.length));
      const token = `:${key}`;
      this.text = value.slice(0, start) + token + value.slice(end);
      this.textSelectionStart = this.textSelectionEnd = start + token.length;
      this.$nextTick(() => {
        const field = this.$refs.messageInput?.$el?.querySelector('textarea');
        field?.focus();
        field?.setSelectionRange(this.textSelectionStart, this.textSelectionEnd);
      });
    },
    sampleText(value) {
      return String(value ?? '').replace(/<br\s*\/?\s*>/gi, '\n').replace(/<\/(?:p|div)>/gi, '\n').replace(/<[^>]*>/g, '').replace(/&(?:amp|lt|gt|quot|apos|nbsp);|&#(?:\d+|x[\da-f]+);/gi, (entity) => {
        const named = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&apos;': "'", '&nbsp;': ' ' };
        if (named[entity.toLowerCase()]) return named[entity.toLowerCase()];
        const code = entity[2].toLowerCase() === 'x' ? parseInt(entity.slice(3, -1), 16) : Number(entity.slice(2, -1));
        return Number.isInteger(code) && code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : entity;
      }).trim();
    },
    extractSampleValues(body, sample) {
      const source = this.sampleText(body).replace(/\s+/g, ' ');
      const example = this.sampleText(sample).replace(/\s+/g, ' ');
      if (!source || !example || /:[a-zA-Z_]\w*\s*:[a-zA-Z_]\w*/.test(source)) return {};
      const tokens = [...source.matchAll(/:([a-zA-Z_]\w*)\b/g)];
      if (!tokens.length) return {};
      const keys = [];
      let pattern = '^';
      let offset = 0;
      for (const token of tokens) {
        pattern += source.slice(offset, token.index).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const index = keys.indexOf(token[1]);
        if (index >= 0) pattern += `\\${index + 1}`;
        else { keys.push(token[1]); pattern += '(.+?)'; }
        offset = token.index + token[0].length;
      }
      pattern += source.slice(offset).replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$';
      const found = example.match(new RegExp(pattern));
      return found ? Object.fromEntries(keys.map((key, index) => [key, found[index + 1]])) : {};
    },
    resolveTextPreview(text, values) {
      const unresolved = [];
      const rendered = String(text ?? '').replace(/:([a-zA-Z_]\w*)\b/g, (token, key) => {
        if (Object.prototype.hasOwnProperty.call(values || {}, key)) return values[key];
        if (!unresolved.includes(token)) unresolved.push(token);
        return token;
      });
      return { text: rendered, unresolved };
    },
    isPermanent(key) {
      return this.sms_provider?.template?.permanent_params?.includes(key);
    },
    addTemplate() {
      if (this.modern && !this.canSubmitTemplate()) return;
      const scope = this.editor_scope;
      this.busy = true;
      axios
        .post(window.API.POST_SHOP_SMS_ADD_TEMPLATE(this.shop.id), {
          code: this.sms.code,
          enable: this.enable,
          language: this.language,
          mode: this.mode,
          text: this.text,
          data: this.data,
        })
        .then(({ data }) => {
          if (this.modern && scope !== this.editor_scope) return;
          if (data.error) {
            NotificationService.showErrorAlert(null, data.error_msg);
          } else {
            this.$emit("add", data.template);
            this.$emit("close");

            NotificationService.showSuccessAlert(
              null,
              "New template has been added successfully.",
            );
          }
        })
        .catch((error) => {
          if (this.modern && scope !== this.editor_scope) return;
          NotificationService.showLaravelError(error);
        })

        .finally(() => {
          if (!this.modern || scope === this.editor_scope) this.busy = false;
        });
    },

    editTemplate() {
      if (this.modern && !this.canSubmitTemplate()) return;
      const scope = this.editor_scope;
      this.busy = true;
      axios
        .put(
          window.API.PUT_SHOP_SMS_EDIT_TEMPLATE(this.shop.id, this.template.id),
          {
            code: this.sms.code,
            enable: this.enable,
            language: this.language,
            mode: this.mode,
            text: this.text,
            data: this.data,
          },
        )
        .then(({ data }) => {
          if (this.modern && scope !== this.editor_scope) return;
          if (data.error) {
            NotificationService.showErrorAlert(null, data.error_msg);
          } else {
            this.$emit("edit", data.template);
            this.$emit("close");

            NotificationService.showSuccessAlert(
              null,
              "This template has been updated successfully.",
            );
          }
        })
        .catch((error) => {
          if (this.modern && scope !== this.editor_scope) return;
          NotificationService.showLaravelError(error);
        })

        .finally(() => {
          if (!this.modern || scope === this.editor_scope) this.busy = false;
        });
    },

    assignValues() {
      if (this.modern) {
        this.draft_scope = this.editor_scope;
        this.enable = true;
        this.mode = null;
        this.text = this.sms?.body || '';
        this.data = [];
        if (!this.shop?.id || !this.sms?.code) return;
      }
      this.code = this.sms.code;

      if (this.template) {
        this.code = this.template.code;
        this.enable = this.template.enable;
        this.language = this.template.language;
        this.mode = this.template.mode;
        this.text = this.template.text;
        this.data = this.modern && Array.isArray(this.template.data) ? this.template.data.map((row) => ({ ...row })) : this.template.data;

        if (!this.data || !Array.isArray(this.data)) this.data = [];

        if (!this.text) this.text = this.sms.body;
      } else {
        this.language = this.shop.language;
        this.data = [];

        if (this.sms_provider?.template?.permanent_params) {
          this.sms_provider.template.permanent_params.forEach((it) => {
            this.data.push({
              key: it,
              value: this.sms.code /*some sample data!*/,
            });
          });
        }
      }
      if (this.modern) {
        for (const key of this.sms_provider?.template?.permanent_params || []) {
          if (!this.data.some((row) => row.key === key)) this.data.push({ key, value: this.sms.code });
        }
      }
    },
    getDefaultText() {
      if (this.modern && (this.busy || this.busy_default || this.mode !== 'text')) return;
      this.getDefault(SmsTemplateMode.text.code, (body,tokens,language) => {
        this.text = body;
        NotificationService.showSuccessAlert(
          this.sms.title + " | " + this.getLanguageName(language),
          `The default message for <b>${this.getLanguageName(
            language,
          )}</b> been loaded successfully.`,
        );
      });
    },
    getDefaultTemplate() {
      if (this.modern && (this.busy || this.mode !== 'template' || !this.shop?.id || !this.sms?.code)) return;
      this.sample_template = null;
      this.sample_template_tokens=[];
      this.getDefault(SmsTemplateMode.template.code, (body,tokens) => {
        this.sample_template = body;
        this.sample_template_tokens=tokens;
      });
    },
    getDefault(mode, callback) {
      const language = this.language ? this.language : "default";
      const driver = this.sms_provider?.driver || 'default';
      const cacheKey = this.modern ? `${mode}:${language}:${driver}` : mode + language;
      const scope = this.editor_scope;
      const originalText = this.text;
      const request = this.modern ? ++this.defaultRequest : 0;
      if (this.modern && (this.busy || this.draft_scope !== scope || !this.shop?.id || !this.sms?.code)) return;

      if (this.modern && this.defaults[cacheKey]) {
        const cached = this.defaults[cacheKey];
        callback(cached.body, cached.tokens, cached.language);
        return;
      }

      // Pre loaded data:
      if (!this.modern && this.defaults[mode + language]) {
        this.text = this.defaults[mode + language];
        return;
      }

      this.busy_default = true;
      axios
        .get(
          window.API.GET_SHOP_SMS_TEMPLATE_DEFAULT_BODY(
            this.shop.id,
            this.code,
            language,
          ),
          {
            params: { mode: mode, driver: driver },
          },
        )
        .then(({ data }) => {
          if (this.modern && (request !== this.defaultRequest || scope !== this.editor_scope)) return;
          if (data.error) {
            NotificationService.showErrorAlert(null, data.error_msg);
          } else {
            if (this.modern) this.defaults[cacheKey] = { body: data.body, tokens: data.tokens, language: data.language };
            else this.defaults[mode + data.language] = data.body;
            if (this.modern && mode === 'text' && this.text !== originalText) return;
            callback(data.body,data.tokens,data.language);
          }
        })
        .catch((error) => {
          if (this.modern && (request !== this.defaultRequest || scope !== this.editor_scope)) return;
          NotificationService.showLaravelError(error);
        })

        .finally(() => {
          if (!this.modern || (request === this.defaultRequest && scope === this.editor_scope)) this.busy_default = false;
        });
    },
  },
  created() {
    this.assignValues();
  },
  beforeUnmount() {
    if (this.modern) this.defaultRequest++;
  },
};
</script>

<style lang="scss" scoped>
.b-shop-sms-template-editor {
  &__event { margin: 4px 0 0; color: var(--sd-modern-muted); font-size: 13px; font-weight: 400; line-height: 20px; }
  &__context { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; color: var(--sd-modern-muted); font-size: 12px; }
  &__context > code { min-width: 0; max-width: 100%; white-space: normal; overflow-wrap: anywhere; }
  &__provider { display: inline-flex; align-items: center; gap: 6px; color: rgb(var(--v-theme-on-surface)); }
  &__provider > img { width: 20px; height: 20px; object-fit: contain; }
  &__steps { background: transparent; }
  &__steps :deep(.v-stepper-header) { box-shadow: none; }
  &__steps :deep(.v-stepper-item) { padding: 16px 12px; }
  &__steps :deep(.v-stepper-item__title) { font-family: inherit; font-size: 13px; font-weight: 500; line-height: 20px; }
  &__basic-fields { display: grid; grid-template-columns: minmax(0, 1fr); align-items: start; gap: 16px; }
  &__format-title { margin-block: 20px 8px; font-size: 14px; font-weight: 500; line-height: 22px; }
  &__compose-grid { display: grid; grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr); align-items: stretch; gap: 16px; }
  &__compose-grid > .sd-modern-widget { padding: 20px; border: 0; border-radius: 20px; }
  &__message { margin-block: 18px; padding: 16px; border-radius: 14px; background: var(--sd-modern-inset); color: rgb(var(--v-theme-on-surface)); font-size: 14px; font-weight: 400; line-height: 23px; white-space: pre-wrap; overflow-wrap: anywhere; }
  &__unresolved { color: var(--sd-modern-muted); font-size: 13px; line-height: 21px; overflow-wrap: anywhere; }
  &__details { margin-block-start: 20px; font-size: 13px; line-height: 21px; }
  &__details > summary { min-height: 40px; padding-block: 10px; font-weight: 500; }
  &__sample-value { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 12px; margin: 0; padding-block: 12px; border-block-start: 1px solid var(--sd-modern-border); }
  &__sample-value dt { display: grid; gap: 4px; color: var(--sd-modern-muted); }
  &__sample-value dd { margin: 0; overflow-wrap: anywhere; }
  &__automatic { margin-block-start: 24px; }
  &__automatic h3 { font-size: 14px; font-weight: 500; line-height: 22px; }
  &__mapping { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; margin: 0; padding-block: 12px; border-block-end: 1px solid var(--sd-modern-border); font-size: 13px; }
  &__mapping dd { display: grid; gap: 4px; margin: 0; text-align: end; }
  &__mapping dd > span { color: var(--sd-modern-muted); }
  &__reference-token { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; margin-block: 10px; color: var(--sd-modern-muted); font-size: 13px; }
  &__fixed-key { display: flex; align-items: center; gap: 8px; color: var(--sd-modern-muted); font-size: 12px; }
  &__parameter.b-shop-sms-template-editor__parameter--fixed { grid-template-columns: minmax(0, 1fr); gap: 6px; }
  &__title {
    gap: 8px;
    padding: 20px 24px;
    font-family: inherit;
    font-size: 20px;
    font-weight: 500;
    line-height: 28px;
    white-space: normal;
  }

  &__content {
    width: min(760px, 98%);
    min-width: 0;
    display: grid;
    gap: 20px;
    padding-block: 8px 20px;

    > .sd-modern-widget {
      padding: 20px;
      border: 0;
      border-radius: 20px;
    }

    :deep(.sd-modern-form-header.s--widget-header h2) {
      font-size: 14px;
      font-weight: 500;
      line-height: 22px;
    }

    :deep(.sd-modern-form-header.s--widget-header .--icon) {
      min-width: 18px;
      font-size: 18px !important;
    }

    :deep(.v-list-subheader) {
      min-height: 0;
      margin-block: 0 18px;
      padding: 0;
      color: var(--sd-modern-muted);
      font-size: 13px;
      font-weight: 400;
      line-height: 21px;
      white-space: normal;
    }
    :deep(.v-list-subheader__text) { overflow: visible; text-overflow: clip; white-space: normal; }

    :deep(.v-list-item-title) { font-size: 14px; line-height: 22px; }
    :deep(.v-list-item-subtitle) { color: var(--sd-modern-muted); font-size: 13px; line-height: 20px; opacity: 1; }
    :deep(.v-list-item__content) { min-width: 0; }
    :deep(.vue-json-pretty) { max-width: 100%; overflow: auto; }
  }

  &__content--basics { width: min(620px, 98%); }

  &__actions {
    padding: 12px 24px 20px;

    > .widget-buttons {
      flex: 0 1 auto;
      min-width: 0;
      flex-direction: row;
      align-items: center;
      justify-content: flex-end;
      gap: 10px;
      width: min(760px, 98%);
      max-width: 100%;
      margin-inline: auto;
      padding: 0;
      transition: none;
    }

    &--basics > .widget-buttons { width: min(620px, 98%); }

    > .widget-buttons > .sd-modern-button {
      --v-btn-height: 42px;
      flex: 0 1 auto;
      width: auto;
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

      &.v-btn--variant-outlined { border-color: var(--sd-modern-border); }
      :deep(.v-btn__content) { color: inherit; font: inherit; white-space: normal; }
      :deep(.v-icon) { width: 16px; height: 16px; font-size: 16px; }
      :deep(.v-icon--start) { margin-inline: 0 7px; }
      :deep(.v-icon--end) { margin-inline: 7px 0; }
    }
  }

  &__subheading { margin-block-start: 28px; }
  &__parameter { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 20px; width: 100%; }
  &__token { max-width: calc(100% - 8px); }
  &__token :deep(.v-chip__content) { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

  @media (max-width: 600px) {
    &__title { padding: 16px; font-size: 18px; line-height: 26px; }
    > .v-card-text { padding-inline: 12px; }
    &__content > .sd-modern-widget { padding: 18px 16px; }
    &__parameter { grid-template-columns: minmax(0, 1fr); gap: 4px; }
    &__basic-fields, &__compose-grid { grid-template-columns: minmax(0, 1fr); gap: 16px; }
    &__steps :deep(.v-stepper-header) { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 6px; }
    &__steps :deep(.v-stepper-header > .v-divider) { display: none; }
    &__steps :deep(.v-stepper-item) { flex: 1 1 auto; flex-direction: column; justify-content: flex-start; min-width: 0; gap: 6px; padding: 12px 4px; }
    &__steps :deep(.v-stepper-item__content) { min-width: 0; text-align: center; }
    &__steps :deep(.v-stepper-item__title) { display: block; font-size: 12px; white-space: normal; overflow-wrap: anywhere; }
    &__steps :deep(.v-stepper-item__avatar) { margin-inline: 0; }
    &__compose-grid > .sd-modern-widget { padding: 18px 16px; }
    &__actions { padding: 12px 12px 16px; }
  }
  @media (max-width: 600px), (pointer: coarse) {
    &__actions > .widget-buttons > .sd-modern-button {
      --v-btn-height: 44px;
      min-height: 44px;
    }
  }
  @media (max-width: 900px) { &__compose-grid { grid-template-columns: minmax(0, 1fr); } }
}
</style>
