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
  <v-card flat class="text-start">
    <v-card-title  class="d-flex align-center">
      <v-avatar class="me-1" rounded>
        <v-img :src="getShopImagePath(shop.icon, 128)"></v-img>
      </v-avatar>
      {{ template ? "Edit message template" : "Add new message template" }}
    </v-card-title>
    <v-card-text>
      <!-- ███████████████████████ Template Info ███████████████████████ -->

      <div class="widget-box mb-5">
        <s-widget-header icon="tune" title="Message Config"></s-widget-header>
        <v-list-subheader>You can create a template for the SMS message on your SMS provider's website, then specify its code and data structure here. We'll forward this information to your provider, where the actual SMS message will be generated.</v-list-subheader>

        <v-text-field
          :append-icon="sms.icon"
          :model-value="sms.title"
          disabled
          label="Code" variant="underlined"
        ></v-text-field>

        <u-language-input
          v-model="language"
          :available-languages="languages"
          append-icon="translate"
          clearable
          max-width="unset"
          messages="Leave it empty to set it as default."
          persistent-placeholder
          placeholder="Default - All languages"
          title="Language"  variant="underlined"
        ></u-language-input>

        <u-smart-switch
          v-model="enable"
          :false-title="$t('global.commons.disable')"
          :true-title="$t('global.commons.enable')"
          class="my-3"
          false-gray
          false-icon="close"
          true-description="This template will be used to create messages."
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
        >
        </u-smart-select>
      </div>

      <!-- ███████████████████████ Mode > Text ███████████████████████ -->

      <div v-if="mode === 'text'" class="widget-box mb-5">
        <s-widget-header icon="subject" title="Plain text"></s-widget-header>
        <v-list-subheader>Enter a personalized SMS message here. Dynamic values will be substituted with their actual values before being sent to the user.</v-list-subheader>

        <v-textarea
          v-model="text"
          :rows="3"
          auto-grow
          hide-details
          label="Message" variant="underlined"
        ></v-textarea>

        <div class="text-end mb-3">
          <v-btn
            :loading="busy_default"
            class="tnt"
            color="primary"
            variant="text"
            @click="getDefault()"
          >
            <v-icon class="me-1">restart_alt</v-icon>
            Reset to default

            <b class="ms-1">{{ getLanguageName(language) }}</b>
          </v-btn>
        </div>

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

        <v-list-subheader>
          <div>
            <b class="d-block">Sample message:</b>

            <div class="my-3" v-html="sms.sample"></div>
          </div>
        </v-list-subheader>
      </div>

      <!-- ███████████████████████ Mode > Template ███████████████████████ -->

      <div v-if="mode === 'template'" class="widget-box mb-5">
        <s-widget-header
          icon="data_object"
          title="Structural Template"
        ></s-widget-header>
        <v-list-subheader>
          <div>
            You can set template code in the value with the
            <code>template</code> key. The template should be exactly what you
            set in your SMS service provider. If <code>template</code> be empty
            then <code>{{ sms.code }}</code> consider as template code.
          </div>
        </v-list-subheader>

        <v-list class="border-between-vertical bg-transparent">
          <v-list-item v-for="(it, i) in data" :key="i">
            <v-list-item-title>
              <v-text-field
                v-model="it.key"
                flat
                hide-details
                placeholder="Enter a key..."
                prefix="Key: "
                variant="solo"
              >
              </v-text-field>
            </v-list-item-title>
            <v-list-item-title>
              <v-text-field
                v-model="it.value"
                flat
                hide-details
                placeholder="Enter a value..."
                prefix="Value: "
                variant="solo"
              >
              </v-text-field>
            </v-list-item-title>
            <v-list-item-action>
              <v-btn color="red" icon @click="data.remove(it)">
                <v-icon>close</v-icon>
              </v-btn>
            </v-list-item-action>
          </v-list-item>
        </v-list>

        <v-btn
          class="ma-2"
          color="primary"
          variant="text"
          @click="data.push({ key: '', value: '' })"
        >
          <v-icon start>add</v-icon>
          Add new parameter
        </v-btn>

        <div v-if="sms.params" class="my-3">
          <b class="d-block">Auto fill parameters:</b>
          <v-list-subheader
            >You can set each of these parameters as a value, and Selldone will
            replace them with the corresponding value.
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
        </div>

        <template v-if="preview_data">
          <b class="d-block">Sample payload:</b>
          <vue-json-pretty :data="preview_data" class="my-3"></vue-json-pretty>
        </template>
      </div>
    </v-card-text>
    <v-card-actions>
      <div class="widget-buttons">
        <v-btn size="x-large" variant="text" @click="$emit('close')">
          <v-icon start>close</v-icon>
          Close
        </v-btn>

        <v-btn
          v-if="template"
          :class="{ disabled: !mode }"
          :loading="busy"
          color="primary" variant="elevated"
          size="x-large"
          @click="editTemplate()"
        >
          <v-icon start>save</v-icon>
          Save changes
        </v-btn>
        <v-btn
          v-else
          :class="{ disabled: !mode }"
          :loading="busy"
          color="primary"
          size="x-large"
          @click="addTemplate()"
        >
          <v-icon start>add</v-icon>
          Add message template
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

export default {
  name: "BShopSmsTemplateEditor",
  components: {
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

  watch: {},

  methods: {
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
        this.data = [{ key: "template", value: this.sms.code }];
      }
    },

    getDefault() {
      const language = this.language ? this.language : "default";

      // Pre loaded data:
      if (this.defaults[language]) {
        this.text = this.defaults[language];
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
        )
        .then(({ data }) => {
          if (data.error) {
            this.showErrorAlert(null, data.error_msg);
          } else {
            this.defaults[data.language] = data.body;
            this.text = data.body;
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
