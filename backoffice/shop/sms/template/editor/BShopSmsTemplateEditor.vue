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
  <v-card class="text-start" flat>
    <v-card-title class="d-flex align-center">
      <v-avatar class="me-1" rounded>
        <v-img :src="getShopImagePath(shop.icon, 128)"></v-img>
      </v-avatar>
      {{
        template
          ? $t("shop_sms.template_edit.title_edit")
          : $t("shop_sms.template_edit.title_add")
      }}
    </v-card-title>
    <v-card-text>
      <!-- ███████████████████████ Template Info ███████████████████████ -->

      <div class="widget-box mb-5">
        <s-widget-header
          icon="tune"
          :title="$t('shop_sms.template_edit.config.title')"
        ></s-widget-header>
        <v-list-subheader>
          {{ $t("shop_sms.template_edit.config.subtitle") }}
        </v-list-subheader>

        <v-text-field
          :model-value="sms.title"
          disabled
          :label="$t('shop_sms.template_edit.config.code')"
          variant="underlined"
          :prepend-inner-icon="sms.icon"
        ></v-text-field>

        <u-language-input
          v-model="language"
          :available-languages="languages"
          prepend-inner-icon="translate"
          clearable
          max-width="unset"
          :messages="$t('shop_sms.template_edit.config.language_msg')"
          persistent-placeholder
          placeholder="Default - All languages"
          :title="$t('global.commons.language')"
          variant="underlined"
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
        >
        </u-smart-switch>

        <u-smart-select
          v-model="mode"
          :items="modes"
          class="my-3"
          item-description="desc"
          item-icon="icon"
          item-text="title"
          item-value="code"
          :disabled="!!template"
        >
        </u-smart-select>
      </div>

      <!-- ███████████████████████ Mode > Text ███████████████████████ -->

      <div v-if="mode === 'text'" class="widget-box mb-5">
        <s-widget-header
          icon="subject"
          :title="$t('shop_sms.template_edit.text.title')"
        ></s-widget-header>
        <v-list-subheader>
          {{ $t("shop_sms.template_edit.text.subtitle") }}
        </v-list-subheader>

        <v-textarea
          v-model="text"
          :rows="3"
          auto-grow
          hide-details
          :label="$t('shop_sms.template_edit.text.message')"
          variant="underlined"
        ></v-textarea>

        <div class="text-end mb-3">
          <v-btn
            :loading="busy_default"
            class="tnt"
            color="primary"
            variant="text"
            @click="getDefaultText()"
          >
            <v-icon class="me-1">restart_alt</v-icon>
            {{ $t("shop_sms.template_edit.text.reset_to_default") }}

            <b class="ms-1">{{ getLanguageName(language) }}</b>
          </v-btn>
        </div>

        <hr class="my-5" />

        <s-widget-header
          :title="$t('shop_sms.template_edit.text.auto_fill.title')"
          icon="auto_awesome"
        >
        </s-widget-header>

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
              <v-scale-transition>
                <v-icon v-if="text && text.includes(`:${key}`)" color="success"
                  >check
                </v-icon>
              </v-scale-transition>
            </template>
          </v-list-item>
        </v-list>

        <s-widget-header
          :title="$t('shop_sms.template_edit.text.sample.title')"
          icon="science"
        >
        </s-widget-header>

        <v-list-subheader class="my-3">
          <div v-html="sms.sample"></div>
        </v-list-subheader>
      </div>

      <!-- ███████████████████████ Mode > Template ███████████████████████ -->

      <div v-if="mode === 'template'" class="widget-box mb-5">
        <s-widget-header
          icon="data_object"
          :title="$t('shop_sms.template_edit.template.title')"
        ></s-widget-header>
        <v-list-subheader>
          <div
            v-html="
              $t('shop_sms.template_edit.template.subtitle', { code: sms.code })
            "
          ></div>
        </v-list-subheader>

        <v-list class="bg-transparent">
          <v-list-item v-for="(it, i) in data" :key="i">
            <div class="d-flex align-stretch border-between">
              <v-text-field
                v-model="it.key"
                :readonly="isPermanent(it.key)"
                :append-inner-icon="isPermanent(it.key) ? 'lock' : undefined"
                flat
                hide-details
                placeholder="Enter a key..."
                label="Key"
                variant="solo"
                rounded="s-xl"
                persistent-placeholder
              >
              </v-text-field>
              <v-text-field
                v-model="it.value"
                flat
                hide-details
                placeholder="Enter a value..."
                label="Value"
                variant="solo"
                rounded="e-xl"
                persistent-placeholder
              >
              </v-text-field>
            </div>

            <template v-slot:append>
              <v-list-item-action>
                <v-btn color="red" icon @click="data.remove(it)" variant="text">
                  <v-icon>close</v-icon>
                </v-btn>
              </v-list-item-action>
            </template>
          </v-list-item>
        </v-list>

        <v-btn
          v-if="sms_provider.template?.has_dynamic_parameters"
          class="ma-2"
          color="primary"
          variant="text"
          @click="data.push({ key: '', value: '' })"
        >
          <v-icon start>add</v-icon>

          {{ $t("shop_sms.template_edit.template.add_new_parameter") }}
        </v-btn>

        <hr class="my-5" />

        <template
          v-if="sms.params && sms_provider.template?.has_dynamic_parameters"
        >
          <s-widget-header
            :title="$t('shop_sms.template_edit.template.auto_fill.title')"
            icon="auto_awesome"
          >
          </s-widget-header>

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

        <template v-if="sample_template">
          <s-widget-header
            :title="$t('shop_sms.template_edit.template.sample.title')"
            icon="chat_bubble_outline"
          >
          </s-widget-header>
          <v-list-subheader>
            {{ $t("shop_sms.template_edit.template.sample.subtitle") }}
          </v-list-subheader>

          <u-text-copy-box
            :value="sample_template"
            small-width-mode
          ></u-text-copy-box>

          <hr class="my-5" />
        </template>

        <template v-if="preview_data">
          <s-widget-header
            :title="$t('shop_sms.template_edit.template.request.title')"
            icon="science"
          >
          </s-widget-header>

          <vue-json-pretty :data="preview_data" class="my-3"></vue-json-pretty>
        </template>
      </div>
    </v-card-text>
    <v-card-actions>
      <div class="widget-buttons">
        <v-btn size="x-large" variant="text" @click="$emit('close')">
          <v-icon start>close</v-icon>
          {{ $t("global.actions.close") }}
        </v-btn>

        <v-btn
          v-if="template"
          :class="{ disabled: !mode }"
          :loading="busy"
          color="primary"
          size="x-large"
          variant="elevated"
          @click="editTemplate()"
        >
          <v-icon start>save</v-icon>

          {{ $t("global.actions.save_changes") }}
        </v-btn>
        <v-btn
          v-else
          :class="{ disabled: !mode }"
          :loading="busy"
          color="primary"
          size="x-large"
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

<script>
import ULanguageInput from "../../../../../ui/language/input/ULanguageInput.vue";
import USmartSelect from "../../../../../ui/smart/select/USmartSelect.vue";
import { SmsTemplateMode } from "@selldone/core-js/enums/sms/SmsTemplateMode";

import VueJsonPretty from "vue-json-pretty";
import "vue-json-pretty/lib/styles.css";
import USmartSwitch from "../../../../../ui/smart/switch/USmartSwitch.vue";
import { SmsProviders } from "@selldone/core-js/enums/sms/SmsProviders";
import { ShopOptionsHelper } from "@selldone/core-js/helper/shop/ShopOptionsHelper";
import SWidgetHeader from "@selldone/components-vue/ui/widget/header/SWidgetHeader.vue";
import UTextCopyBox from "@selldone/components-vue/ui/text/copy-box/UTextCopyBox.vue";

export default {
  name: "BShopSmsTemplateEditor",
  components: {
    UTextCopyBox,
    SWidgetHeader,
    USmartSwitch,
    USmartSelect,
    ULanguageInput,

    VueJsonPretty,
  },
  props: {
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
    enable: true,

    language: null,
    mode: SmsTemplateMode.text.code,
    text: null,
    data: [],
    code: null,

    busy: false,

    sample_template: null,
    // ------------------------------
    busy_default: false,
    defaults: {}, // Keep received values!
  }),

  computed: {
    // ▃▃▃▃▃▃▃▃▃▃▃▃▃ Languages ▃▃▃▃▃▃▃▃▃▃▃▃▃
    languages() {
      // Available languages of shop!
      return this.shop && ShopOptionsHelper.GetLanguages(this.shop);
    },

    preview_data() {
      if (!this.data) return null;
      const out = { template: this.sms.code }; // DEfault template code!

      this.data.forEach((it) => {
        const found = this.sms.params && this.sms.params[it.value];
        out[it.key] = it.value + (found ? ` — replace with ${found} ♻` : "");
      });

      return out;
    },
    sms_service() {
      return this.shop.sms_service;
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
      if (mode === SmsTemplateMode.template.code) {
        this.getDefaultTemplate();
      }
    },
  },

  methods: {
    isPermanent(key) {
      return this.sms_provider.template?.permanent_params?.includes(key);
    },
    addTemplate() {
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
          if (data.error) {
            this.showErrorAlert(null, data.error_msg);
          } else {
            this.$emit("add", data.template);
            this.$emit("close");

            this.showSuccessAlert(
              null,
              "New template has been added successfully.",
            );
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })

        .finally(() => {
          this.busy = false;
        });
    },

    editTemplate() {
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
          if (data.error) {
            this.showErrorAlert(null, data.error_msg);
          } else {
            this.$emit("edit", data.template);
            this.$emit("close");

            this.showSuccessAlert(
              null,
              "This template has been updated successfully.",
            );
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })

        .finally(() => {
          this.busy = false;
        });
    },

    assignValues() {
      this.code = this.sms.code;

      if (this.template) {
        this.code = this.template.code;
        this.enable = this.template.enable;
        this.language = this.template.language;
        this.mode = this.template.mode;
        this.text = this.template.text;
        this.data = this.template.data;

        if (!this.data || !Array.isArray(this.data)) this.data = [];

        if (!this.text) this.text = this.sms.body;
      } else {
        this.language = this.shop.language;
        this.data = [];

        if (this.sms_provider.template?.permanent_params) {
          this.sms_provider.template.permanent_params.forEach((it) => {
            this.data.push({
              key: it,
              value: this.sms.code /*some sample data!*/,
            });
          });
        }
      }
    },
    getDefaultText() {
      this.getDefault(SmsTemplateMode.text.code, (body) => {
        this.text = body;
      });
    },
    getDefaultTemplate() {
      this.sample_template = null;
      this.getDefault(SmsTemplateMode.template.code, (body) => {
        this.sample_template = body;
      });
    },
    getDefault(mode, callback) {
      const language = this.language ? this.language : "default";

      // Pre loaded data:
      if (this.defaults[mode + language]) {
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
            params: { mode: mode, driver: this.sms_provider.driver },
          },
        )
        .then(({ data }) => {
          if (data.error) {
            this.showErrorAlert(null, data.error_msg);
          } else {
            this.defaults[mode + data.language] = data.body;
            callback(data.body);
            this.showSuccessAlert(
              this.sms.title + " | " + this.getLanguageName(data.language),
              `The default message for <b>${this.getLanguageName(
                data.language,
              )}</b> been loaded successfully.`,
            );
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })

        .finally(() => {
          this.busy_default = false;
        });
    },
  },
  created() {
    this.assignValues();
  },
};
</script>

<style scoped></style>
