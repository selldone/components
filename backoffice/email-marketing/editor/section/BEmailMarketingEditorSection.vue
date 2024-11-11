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
    v-model="dialog_show"
    :scrim="false"
    :width="
      $vuetify.display.xlAndUp
        ? 560
        : $vuetify.display.lgAndUp
          ? 420
          : undefined
    "
    location="right"
    temporary
    theme="dark"
  >
    <v-card v-if="dialog_options" class="text-start" color="#1e1e1e" flat>
      <v-card-actions>
        <div class="widget-buttons">
          <v-btn size="x-large" variant="text" @click="dialog_show = false">
            <v-icon start>close</v-icon>
            {{ $t("global.actions.close") }}
          </v-btn>
        </div>
      </v-card-actions>

      <v-card-text>
        <b-email-marketing-editor-section-row
          v-for="(option, index) in dialog_options"
          :key="index"
          :loaded-fonts="loadedFonts"
          :option="option"
          :shop="shop"
          :upload-url="uploadUrl"
          @blur="$emit('blur')"
        ></b-email-marketing-editor-section-row>

        <div class="min-height-20vh"></div>
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

<style lang="scss" scoped></style>
