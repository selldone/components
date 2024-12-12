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

<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
  <!-- ███████████████████████ Dialog > AI ███████████████████████ -->
  <v-dialog
    :model-value="modelValue"
    max-width="860"
    scrollable
    transition="dialog-bottom-transition"
    @update:model-value="(value) => $emit('update:modelValue', value)"
  >
    <v-card
      :disabled="busy_ai"
      class="text-start"
      color="#673AB7"
      rounded="xl"
    >
      <v-card-text>
        <div class="text-h4 text-lg-h3 font-weight-thin py-3">
          <u-button-ai-small
            :class="{pen:busy_ai}"
            class="ms-2 float-end pen"
            variant="text"
          ></u-button-ai-small>
          <span v-html="title"></span>
        </div>

        <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Voice Record ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->
        <v-expand-transition>
          <div v-if="!busy_ai">
            <u-currency-input
              v-if="hasCurrency && shop.currencies?.length > 1"
              v-model="currency"
              :active-currencies="shop.currencies"
              :label="$t('global.commons.currency')"
              class="max-w-400 mx-auto my-5"
              placeholder="Select the currency please."
              variant="plain"
            ></u-currency-input>

            <u-voice-box
              v-model="voice"
              v-model:voice-file="voice_file"
              :max-duration="30"
              class="ma-4"
              no-playback
              @update:voice-file="sendVoiceToServer"
            ></u-voice-box>
          </div>
          <div v-else class="text-center">
            <v-progress-circular
              :indeterminate="progress >= 99"
              :model-value="progress"
              :size="64"
              :width="4"
              class="ma-5"
              color="#D1C4E9"
            >
            </v-progress-circular>
          </div>
        </v-expand-transition>

        <div class="border-top-dashed pt-3 mt-3">
          <p v-if="error_msg" class="text-red">
            <v-icon class="me-1">error</v-icon>
            <span v-html="error_msg"></span>
          </p>
          <template v-else>
            <slot name="tips"></slot>
          </template>
        </div>
      </v-card-text>
      <v-card-actions>
        <div class="widget-buttons">
          <v-btn
            prepend-icon="close"
            size="x-large"
            variant="text"
            @click="$emit('update:modelValue', false)"
          >
            {{ $t("global.actions.close") }}
          </v-btn>
        </div>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { RouteMixin } from "../../../mixin/route/RouteMixin.ts";
import UVoiceBox from "../../../community/voice/box/UVoiceBox.vue";
import UCurrencyInput from "../../../ui/currency/input/UCurrencyInput.vue";
import { SetupService } from "@selldone/core-js/server/SetupService";
import UButtonAiSmall from "../../../ui/button/ai/small/UButtonAiSmall.vue";

import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

export default {
  name: "BAiAssistance",
  mixins: [RouteMixin ],
  emits: ["response", "update:modelValue"],
  components: {
    UButtonAiSmall,
    UCurrencyInput,
    UVoiceBox,
  },

  props: {
    modelValue: {},

    shop: {
      required: true,
      type: Object,
    },
    title: {},

    endpoint: {
      required: true,
    },

    successMessage: {
      default: "Request has done successfully.",
    },
    errorMessage: {
      default: "I can not do this now.",
    },

    hasCurrency: Boolean,
  },

  data: () => ({
    busy_ai: false,
    progress: 0,

    voice: null,
    voice_file: null,
    error_msg: null,
    currency: SetupService.DefaultCurrency(),
  }),

  computed: {},

  watch: {
    modelValue(val) {
      //this.BlurApp(val);

      if (val) {
        this.voice = null;
        this.voice_file = null;
        this.error_msg = null;
        this.progress = 0;
      }
    },
  },

  created() {
    if (
      this.hasCurrency &&
      this.shop.currencies &&
      this.shop.currencies.length > 0 &&
      !this.shop.currencies.includes(this.currency)
    )
      this.currency = this.shop.currencies && this.shop.currencies[0];
  },

  methods: {
    sendVoiceToServer() {
      if (!this.voice_file) return;

      this.busy_ai = true;
      this.progress = 0;

      const formData = new FormData();

      formData.append("voice", this.voice_file, "voice.mp3");

      if (this.hasCurrency && this.currency)
        formData.append("currency", this.currency);

      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (e) => {
          const pval = Math.floor((e.loaded / (e.total + 0.001)) * 100);
          this.progress = pval;
        },
      };

      axios
        .post(this.endpoint, formData, config)
        .then(({ data }) => {
          if (data.error) {
            NotificationService.showErrorAlert(null, data.error_msg);
            this.error_msg = data.error_msg;
          } else {
            this.$emit("response", data);

            this.$emit("update:modelValue", false);
            NotificationService.showSuccessAlert(null, this.successMessage);
          }
        })
        .catch((error) => {
          this.error_msg = this.errorMessage;
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_ai = false;
        });
    },
  },
};
</script>

<style lang="scss" scoped></style>
