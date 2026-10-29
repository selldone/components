<!--
  - Copyright (c) 2024. Selldone® Business OS™
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
  <v-navigation-drawer
    v-if="!modern || dialog_show"
    v-model="dialog_show"
    :class="{ 'b-email-marketing-editor-section--modern': modern }"
    :scrim="false"
    :width="
      modern
        ? Math.min(570, $vuetify.display.width)
        : $vuetify.display.xlAndUp
        ? 560
        : $vuetify.display.lgAndUp
          ? 420
          : undefined
    "
    :location="modern ? 'end' : 'right'"
    temporary
    :theme="modern ? undefined : 'dark'"
  >
    <v-card
      v-if="dialog_options"
      class="text-start"
      :class="{ 'sd-modern-widget b-email-marketing-editor-section__card': modern }"
      :color="modern ? undefined : '#1e1e1e'"
      flat
    >
      <header v-if="modern" class="b-email-marketing-editor-section__header">
        <h2 class="sd-modern-title-text">{{ $t('email_builder.workspace.options_title') }}</h2>
        <v-tooltip
          location="top"
          :open-on-focus="true"
          :persistent="false"
          content-class="sd-modern-tooltip text-start"
        >
          <template #activator="{ props }">
            <v-btn
              v-bind="props"
              class="sd-modern-icon-button"
              icon
              variant="text"
              :aria-label="$t('global.actions.close')"
              @click="dialog_show = false"
            ><v-icon size="18" aria-hidden="true">close</v-icon></v-btn>
          </template>
          {{ $t('global.actions.close') }}
        </v-tooltip>
      </header>
      <v-card-actions v-else>
        <div class="widget-buttons">
          <v-btn size="x-large" variant="text" @click="dialog_show = false">
            <v-icon start>close</v-icon>
            {{ $t("global.actions.close") }}
          </v-btn>
        </div>
      </v-card-actions>

      <v-card-text :class="{ 'b-email-marketing-editor-section__body': modern }">
        <b-email-marketing-editor-section-row
          v-for="(option, index) in dialog_options"
          :key="index"
          :loaded-fonts="loadedFonts"
          :modern="modern"
          :option="option"
          :shop="shop"
          :upload-url="uploadUrl"
          @blur="$emit('blur')"
        ></b-email-marketing-editor-section-row>

        <div v-if="!modern" class="min-height-20vh"></div>
      </v-card-text>
    </v-card>
  </v-navigation-drawer>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import BEmailMarketingEditorSectionRow from "../../../email-marketing/editor/section/row/BEmailMarketingEditorSectionRow.vue";

export default defineComponent({
  name: "BEmailMarketingEditorSection",
  components: {
    BEmailMarketingEditorSectionRow,
  },

  props: {
    modern: { type: Boolean, default: false },
    shop: {
      type: Object,
      require: true,
    },
    email: {
      type: Object,
      require: true,
    },

    loadedFonts: Array,
  },
  data() {
    return {
      dialog_show: false,
      dialog_options: null,
    };
  },

  computed: {
    uploadUrl() {
      if (!this.email) return null;
      return window.API.POST_UPLOAD_IMAGE_EMAIL(this.shop.id, this.email.id);
    },
  },
  created() {},

  methods: {
    /**
     * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     * 🛑 DO NOT CHANGE IT!
     * This function is called externally.
     * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     *
     * @param options
     */
    showEmailSectionEditor(options) {
      this.dialog_options = options;
      this.dialog_show = true;
    },

    removeItemToList(list, item) {
      const index = list.indexOf(item);
      if (index >= 0) {
        list.splice(index, 1);
      }
    },
  },
});
</script>

<style lang="scss" scoped>
.b-email-marketing-editor-section--modern {
  background: rgb(var(--v-theme-surface));
  color: rgb(var(--v-theme-on-surface));

  .b-email-marketing-editor-section__card {
    min-height: 100%;
    margin: 0;
    padding: 0;
    border: 0;
    border-radius: 0;
    font-family: inherit;
    font-size: 13px;
    line-height: 21px;
  }

  .b-email-marketing-editor-section__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 24px;
    border-block-end: 1px solid var(--sd-modern-border);

    h2 { margin: 0; font-size: 18px; font-weight: 500; line-height: 27px; }
  }

  .b-email-marketing-editor-section__body {
    padding: 24px;
    font: inherit;
  }
}
</style>
