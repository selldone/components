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
    @update:model-value="(value) => $emit('update:modelValue', value)"
    scrollable
    transition="dialog-bottom-transition"
    max-width="860"
  >
    <v-card
      rounded="xl"
      color="#673AB7"
      class="text-start"
      :disabled="busy_ai"
      :loading="busy_ai"
    >
      <v-card-text>
        <div class="text-h4 text-lg-h3 font-weight-thin py-3">
          <u-button-ai-small    class="ms-2 float-end pen" :loading="busy_ai" variant="text" ></u-button-ai-small>
          <span v-html="title"></span>
        </div>

        <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Voice Record ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->
        <v-expand-transition>
          <div v-if="!busy_ai">
            <u-currency-input
              v-if="hasCurrency && shop.currencies?.length > 1"
              :active-currencies="shop.currencies"
              v-model="currency"
              variant="plain"
              class="max-w-400 mx-auto my-5"
              :label="$t('global.commons.currency')"
              placeholder="Select the currency please."
            ></u-currency-input>

            <u-voice-box
              v-model="voice"
              v-model:voice-file="voice_file"
              class="ma-4"
              :max-duration="30"
              @update:voice-file="sendVoiceToServer"
              no-playback
            ></u-voice-box>
          </div>
          <div v-else class="text-center">
            <v-progress-circular
              :size="64"
              :width="4"
              :indeterminate="progress >= 99"
              :model-value="progress"
              color="#D1C4E9"
              class="ma-5"
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
            size="x-large"
            variant="text"
            @click="$emit('update:modelValue', false)"
            prepend-icon="close"
          >
            {{ $t("global.actions.close") }}
          </v-btn>
        </div>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { RouteMixin } from "../../../mixin/RouteMixin";
import UVoiceBox from "../../../community/voice/box/UVoiceBox.vue";
import UCurrencyInput from "../../../ui/currency/input/UCurrencyInput.vue";
import { SetupService } from "@selldone/core-js/server/SetupService";
import UButtonAiSmall from "../../../ui/button/ai/small/UButtonAiSmall.vue";

export default {
  name: "BAiAssistance",
  mixins: [RouteMixin],
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
      this.BlurApp(val);

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
            this.showErrorAlert(null, data.error_msg);
            this.error_msg = data.error_msg;
          } else {
            this.$emit("response", data);

            this.$emit("update:modelValue", false);
            this.showSuccessAlert(null, this.successMessage);
          }
        })
        .catch((error) => {
          this.error_msg = this.errorMessage;
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_ai = false;
        });
    },
  },
};
</script>

<style lang="scss" scoped></style>
