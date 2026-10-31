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
    :content-class="modern ? 'rounded-t-xl rounded-b-0' : 'no-shadow-dialog'"
    :aria-label="modern ? $t('product_admin.edit_article.modern.translate_dialog_title') : undefined"
    :persistent="modern && busy"
    max-width="640"
    scrollable
    width="90%"
    @update:model-value="(val) => $emit('update:modelValue', val)"
  >
    <v-card
      v-if="modern && toLanguage"
      class="b-ai-auto-translate sd-modern-widget rounded-t-xl rounded-b-0 text-start"
      rounded="t-xl"
    >
      <header class="b-ai-auto-translate__header">
        <v-icon size="20" aria-hidden="true">translate</v-icon>
        <h2 class="sd-modern-title-text">{{ $t('product_admin.edit_article.modern.translate_dialog_title') }}</h2>
      </header>
      <div class="b-ai-auto-translate__body">
        <p class="b-ai-auto-translate__explanation">
          {{ $t('product_admin.edit_article.modern.translate_dialog_subtitle', {
            from: getLanguageObject(fromLanguage).title,
            to: getLanguageObject(toLanguage).title,
          }) }}
        </p>
        <div class="b-ai-auto-translate__languages" aria-hidden="true">
          <span>
            <flag :iso="getLanguageObject(fromLanguage).flag" :squared="false" />
            {{ getLanguageObject(fromLanguage).title }}
          </span>
          <v-icon size="18" class="b-ai-auto-translate__arrow">arrow_forward</v-icon>
          <span>
            <flag :iso="getLanguageObject(toLanguage).flag" :squared="false" />
            {{ getLanguageObject(toLanguage).title }}
          </span>
        </div>
        <u-smart-verify
          v-model="check"
          class="b-ai-auto-translate__verify"
          :true-title="$t('product_admin.edit_article.modern.translate_dialog_confirm')"
          :disabled="busy"
          role="checkbox"
          :aria-label="$t('product_admin.edit_article.modern.translate_dialog_confirm')"
          :aria-checked="check"
          :aria-disabled="!!busy"
          tabindex="0"
          @keydown.space.prevent="!busy && (check = !check)"
          @keydown.enter.prevent="!busy && (check = !check)"
        />
      </div>
      <v-card-actions class="b-ai-auto-translate__actions">
        <v-btn
          class="sd-modern-button"
          variant="text"
          :disabled="busy"
          @click="$emit('update:modelValue', false)"
        >{{ $t('global.actions.cancel') }}</v-btn>
        <v-btn
          class="sd-modern-button sd-modern-button--primary"
          color="primary"
          variant="elevated"
          :disabled="!check || busy"
          :loading="busy"
          prepend-icon="translate"
          @click="check && !busy && $emit('requestTranslate', toLanguage)"
        >{{ $t('product_admin.edit_article.modern.translate_dialog_action') }}</v-btn>
      </v-card-actions>
    </v-card>
    <v-card v-else-if="toLanguage" class="text-start" rounded="t-xl">
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
    modern: { type: Boolean, default: false },
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

<style lang="scss" scoped>
.b-ai-auto-translate {
  padding: 24px;
  font-family: inherit;
  color: rgb(var(--v-theme-on-surface));
  .b-ai-auto-translate__header { display: flex; align-items: center; gap: 10px; }
  .b-ai-auto-translate__header > .v-icon { flex-shrink: 0; color: var(--sd-modern-muted); }
  .b-ai-auto-translate__header h2 { margin: 0; font-family: inherit; font-size: 20px; font-weight: 500; line-height: 26px; }
  .b-ai-auto-translate__body { padding-block-start: 18px; }
  .b-ai-auto-translate__explanation { margin: 0; font-size: var(--sd-modern-font-body, 14px); line-height: 23px; }
  .b-ai-auto-translate__languages { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; padding-block: 22px; font-size: var(--sd-modern-font-small, 13px); line-height: 20px; }
  .b-ai-auto-translate__languages > span { display: inline-flex; align-items: center; gap: 8px; }
  .b-ai-auto-translate__arrow { color: var(--sd-modern-muted); }
  .b-ai-auto-translate__verify { font-family: inherit; font-size: var(--sd-modern-font-small, 13px); line-height: 21px; }
  .b-ai-auto-translate__verify :deep(.ok > b) { font-weight: 400; }
  .b-ai-auto-translate__verify:focus-visible { outline: 2px solid rgb(var(--v-theme-primary)); outline-offset: 3px; border-radius: 8px; }
  .b-ai-auto-translate__actions { display: flex; justify-content: flex-end; align-items: center; gap: 8px; flex-wrap: wrap; padding: 22px 0 0; }
}
.v-locale--is-rtl .b-ai-auto-translate__arrow { transform: rotate(180deg); }
@media (max-width: 600px), (pointer: coarse) {
  .b-ai-auto-translate {
    padding: 22px 18px;
    .b-ai-auto-translate__actions .sd-modern-button { min-height: 44px; }
    .b-ai-auto-translate__verify :deep(.pp) { min-height: 44px; }
  }
}
</style>
