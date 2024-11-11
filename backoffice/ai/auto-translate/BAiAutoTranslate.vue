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
  <v-bottom-sheet
    :model-value="modelValue"
    content-class="no-shadow-dialog"
    max-width="640"
    scrollable
    width="90%"
    @update:model-value="(val) => $emit('update:modelValue', val)"
  >
    <v-card v-if="toLanguage" class="text-start" rounded="t-xl">
      <v-card-title>
        <v-icon class="me-1" color="#333">translate</v-icon>
        Auto Translate
      </v-card-title>
      <v-card-text>
        <div class="max-widget-width">
          <v-list-subheader>
            This feature is not free. But you can use it as an early adopter
            with fair usage.
          </v-list-subheader>
          <div class="d-flex align-center my-5 mx-3">
            <div class="pod">
              <flag
                :iso="getLanguageObject(fromLanguage).flag"
                :squared="false"
                class="mb-1"
                style="font-size: 17px"
              ></flag>

              {{ getLanguageObject(fromLanguage).title }}
            </div>

            <div class="flex-grow-1 sph">
              <span class="dot -reverse"></span>
            </div>
            <div class="pod">
              <v-icon class="mb-1" color="#111" size="24">g_translate</v-icon>

              AI*
            </div>
            <div class="flex-grow-1 sph">
              <span class="dot -reverse"></span>
            </div>

            <div class="pod">
              <flag
                :iso="getLanguageObject(toLanguage).flag"
                :squared="false"
                class="mb-1"
                style="font-size: 17px"
              />

              {{ getLanguageObject(toLanguage).title }}
            </div>
          </div>

          <v-list-subheader
            >* Enterprise-grade translation machine.
          </v-list-subheader>

          <u-smart-verify v-model="check" class="my-3"></u-smart-verify>
        </div>
      </v-card-text>

      <v-card-actions>
        <div class="widget-buttons">
          <v-btn
            size="x-large"
            variant="text"
            @click="$emit('update:modelValue', false)"
          >
            <v-icon start>close</v-icon>
            {{ $t("global.actions.close") }}
          </v-btn>

          <v-btn
            :class="{ disabled: !check }"
            :loading="busy"
            color="primary"
            size="x-large"
            variant="elevated"
            @click="$emit('requestTranslate', toLanguage)"
          >
            <v-icon class="me-1">check</v-icon>
            Translate now
          </v-btn>
        </div>
      </v-card-actions>
    </v-card>
  </v-bottom-sheet>
</template>

<script lang="ts">
import USmartVerify from "../../../ui/smart/verify/USmartVerify.vue";

export default {
  name: "BAiAutoTranslate",
  components: { USmartVerify },
  emits: ["update:modelValue", "requestTranslate"],
  props: {
    shop: {
      required: true,
      type: Object,
    },
    modelValue: {},
    fromLanguage: { required: true },
    toLanguage: {},
    busy: {},
  },
  data: () => ({
    check: true,
  }),
};
</script>

<style scoped></style>
