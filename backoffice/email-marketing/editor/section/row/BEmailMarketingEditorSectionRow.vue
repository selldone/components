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
  <div :class="{ 'b-email-editor-option--modern text-start': modern }">
    <section
      v-if="option.type === 'section' && modern"
      class="b-email-editor-option__group"
    >
      <header class="b-email-editor-option__heading">
        <v-icon v-if="option.icon" size="18" aria-hidden="true">{{ option.icon }}</v-icon>
        <div>
          <h3>{{ option.title }}</h3>
          <p v-if="option.description">{{ option.description }}</p>
        </div>
      </header>
      <b-email-section-editor-row-self
        v-for="(child, i) in option.children"
        :key="i"
        :loaded-fonts="loadedFonts"
        :option="child"
        :shop="shop"
        :upload-url="uploadUrl"
        modern
        @blur="onUpdate()"
      />
    </section>
    <s-setting-group
      v-else-if="option.type === 'section'"
      :icon="option.icon"
      :subtitle="option.description"
      :title="option.title"
    >
      <b-email-section-editor-row-self
        v-for="(child, i) in option.children"
        :key="i"
        :loaded-fonts="loadedFonts"
        :option="child"
        :shop="shop"
        :upload-url="uploadUrl"
      ></b-email-section-editor-row-self>
    </s-setting-group>

    <s-setting-color
      v-else-if="option.type === 'color'"
      v-model="option.object[option.key]"
      :label="option.label ? option.label : key"
      clearable
      icon="palette"
    >
    </s-setting-color>

    <div v-else-if="option.type === 'align' && modern" class="b-email-editor-option__alignment">
      <span>{{ option.label }}</span>
      <v-btn-toggle
        v-model="option.object[option.key]"
        class="b-email-editor-option__align-options"
        :aria-label="option.label"
        variant="text"
      >
        <v-btn
          v-for="alignment in ['left', 'center', 'right']"
          :key="alignment"
          :value="alignment"
          :prepend-icon="`format_align_${alignment}`"
          class="sd-modern-button sd-modern-button--small"
        >{{ $t(`email_builder.workspace.align_${alignment}`) }}</v-btn>
      </v-btn-toggle>
    </div>
    <s-setting-toggle
      v-else-if="option.type === 'align'"
      v-model="option.object[option.key]"
      :items="[
        { value: 'left', title: 'Left', icon: 'format_align_left' },
        { value: 'center', title: 'Center', icon: 'format_align_center' },
        { value: 'right', title: 'Right', icon: 'format_align_right' },
      ]"
      :label="option.label"
    >
    </s-setting-toggle>

    <b-products-select-box
      v-else-if="option.type === 'product'"
      v-model="option.object[option.key]"
      :label="option.label ? option.label : key"
      :placeholder="option.placeholder"
      :shop="shop"
      outlined
      single-product-select
      @change="onUpdate()"
      >{{ $t("global.placeholders.select_products") }}
    </b-products-select-box>

    <v-text-field
      v-else-if="option.type === 'text' && modern"
      v-model="option.object[option.key]"
      :counter="option.counter"
      :messages="option.messages"
      :placeholder="option.placeholder"
      :rules="option.rules"
      :label="option.label || option.key"
      class="sd-modern-underlined-field"
      variant="underlined"
      density="compact"
      hide-details="auto"
      @blur="onUpdate()"
    />
    <s-setting-text-input
      v-else-if="option.type === 'text'"
      v-model="option.object[option.key]"
      :counter="option.counter"
      :messages="option.messages"
      :placeholder="option.placeholder"
      :rules="option.rules"
      :label="option.label ? option.label : key"
      @blur="onUpdate()"
    >
    </s-setting-text-input>

    <div v-else-if="option.type === 'image'" class="text-center">
      <s-image-uploader
        v-if="option.type === 'image'"
        :disabled="!uploadUrl"
        :image="option.object[option.key]"
        :label="option.label ? option.label : key"
        :modern="modern"
        :server="uploadUrl"
        auto-compact
        clearable
        :dark="!modern"
        @onClear="
          option.object[option.key] = null;
          onUpdate();
        "
        @new-url="
          (url) => {
            option.object[option.key] = url;
            onUpdate();
          }
        "
      >
      </s-image-uploader>
      <div v-if="!uploadUrl && modern" class="sd-modern-notice b-email-editor-option__upload-note" role="status">
        <v-icon size="17" aria-hidden="true">info_outline</v-icon>
        <span>{{ $t('email_builder.workspace.save_before_upload') }}</span>
      </div>
      <v-alert v-else-if="!uploadUrl" color="red" density="compact" type="error"
        >Save the mail to be able upload images.
      </v-alert>
    </div>

    <v-textarea
      v-else-if="option.type === 'json'"
      :label="option.label ? option.label : key"
      :model-value="JSON.stringify(option.object[option.key])"
      :placeholder="option.placeholder"
      :class="{ 'sd-modern-underlined-field': modern }"
      variant="underlined"
      @blur="onUpdate()"
      @update:model-value="
        (val) => (option.object[option.key] = JSON.parse(val))
      "
    >
    </v-textarea>

    <v-select
      v-else-if="option.type === 'enum'"
      v-model="option.object[option.key]"
      :items="option.enums"
      :label="option.label ? option.label : key"
      :placeholder="option.placeholder"
      :class="{ 'sd-modern-underlined-field': modern }"
      variant="underlined"
      @update:model-value="onUpdate()"
    >
    </v-select>

    <u-smart-toggle
      v-else-if="option.type === 'boolean'"
      v-model="option.object[option.key]"
      :false-icon="option.false_icon"
      :true-description="option.messages"
      :true-icon="option.true_icon"
      :true-title="option.label ? option.label : key"
      :accessible="modern"
      :border="modern"
      :class="{ 'sd-modern-smart-select': modern }"
      class="my-3"
      false-gray
      @change="onUpdate()"
    >
    </u-smart-toggle>

    <div v-else-if="option.type === 'delete'" class="widget-buttons">
      <v-btn
        :class="{ 'sd-modern-button sd-modern-button--danger': modern }"
        :color="modern ? 'error' : 'red'"
        :prepend-icon="modern ? 'delete' : 'close'"
        :size="modern ? undefined : 'x-large'"
        :variant="modern ? 'elevated' : 'flat'"
        @click="
          () => {
            if (option.callback) {
              option.callback();
            }
          }
        "
      >
        {{ $t("global.actions.delete") }}
      </v-btn>
    </div>

    <div v-else-if="option.type === 'font'">
      <v-combobox
        v-model="option.object[option.key]"
        :items="fonts"
        :label="option.label ? option.label : key"
        :placeholder="option.placeholder"
        :class="{ 'sd-modern-underlined-field': modern }"
        append-icon="font_download"
        variant="underlined"
        @blur="onSelectFont(modern ? option.object[option.key] : $event)"
        @keydown.enter="onSelectFont(modern ? option.object[option.key] : $event)"
      >
        <template v-slot:item="{ item, props }">
          <v-list-item
            :style="`font-family:${item.raw}`"
            :title="item.raw"
            v-bind="props"
          ></v-list-item>
        </template>
      </v-combobox>

      <div v-if="option.show_fonts">
        <div v-for="font in loadedFonts" :key="font" class="row-font">
          <b :style="{ fontFamily: font }">
            <v-icon class="me-1" size="small">font_download</v-icon>
            {{ font }} - {{ modern ? $t('email_builder.workspace.font_sample') : 'Sample message to ...' }}</b
          >
        </div>

        <div class="text-end">
          <v-btn
            class="my-2 tnt"
            :class="{ 'sd-modern-button': modern }"
            href="https://fonts.google.com"
            target="_blank"
            rel="noopener noreferrer"
            variant="text"
            >{{ modern ? $t('email_builder.workspace.find_fonts') : 'Find fonts here' }}
            <v-icon v-if="modern" size="15" class="ms-2" aria-hidden="true">north_east</v-icon>
          </v-btn>
        </div>
      </div>
    </div>
    <div v-else class="text-red">Invalid! {{ option }}</div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import USmartToggle from "../../../../../ui/smart/toggle/USmartToggle.vue";
import SSettingGroup from "@selldone/page-builder/styler/settings/group/SSettingGroup.vue";
import SSettingColor from "@selldone/page-builder/styler/settings/color/SSettingColor.vue";
import SImageUploader from "../../../../../ui/uploader/SImageUploader.vue";
import BProductsSelectBox from "../../../../../backoffice/product/select-box/BProductsSelectBox.vue";
import SSettingTextInput from "@selldone/page-builder/styler/settings/text-input/SSettingTextInput.vue";
import SSettingToggle from "@selldone/page-builder/styler/settings/toggle/SSettingToggle.vue";
import WebFont from "webfontloader";
import { defineAsyncComponent } from 'vue';

export default defineComponent({
  name: "BEmailMarketingEditorSectionRow",
  components: {
    SSettingToggle,
    SSettingTextInput,
    BProductsSelectBox,
    SImageUploader,
    SSettingColor,
    SSettingGroup,
    USmartToggle,
    BEmailSectionEditorRowSelf: defineAsyncComponent(() => import('./BEmailMarketingEditorSectionRow.vue'))
  },
  props: {
    modern: { type: Boolean, default: false },
    shop: {
      type: Object,
      required: true,
    },
    option: {
      type: Object,
      required: true,
    },
    loadedFonts: Array,
    uploadUrl: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      fonts: [
        "Playfair Display",
        "Roboto",
        "Montserrat",
        "Josefin Sans",
        "Open Sans",
        "Spicy Rice",
        "Pacifico",
        "Lobster",
        "Titan One",
        "Great Vibes",
        "Pacifico",
        "Tahoma",
      ],
    };
  },

  created() {},

  methods: {
    onUpdate() {
      this.$emit("blur");
    },

    onSelectFont(font) {
      if (!font) return;
      this.option.object[this.option.key] = font;
      if (!font || this.loadedFonts.includes(font)) return;
      this.loadedFonts.push(font);

      WebFont.load({
        google: {
          families: [`${font}:wght@300,400,500,700,900`],
        },
      });
    },
  },
});
</script>

<style lang="scss" scoped>
.b-email-editor-option--modern {
  min-width: 0;
  color: rgb(var(--v-theme-on-surface));
  font-family: inherit;
  font-size: 13px;
  line-height: 21px;

  + .b-email-editor-option--modern { margin-block-start: 21px; }

  .b-email-editor-option__heading {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    margin-block-end: 18px;

    > .v-icon { margin-block-start: 2px; color: var(--sd-modern-muted); }
    > div { min-width: 0; }
    h3 { margin: 0; font-size: 14px; font-weight: 500; line-height: 22px; }
    p { margin-block: 5px 0; color: var(--sd-modern-muted); font-size: 12px; line-height: 20px; overflow-wrap: anywhere; }
  }

  .b-email-editor-option__group > .b-email-editor-option--modern + .b-email-editor-option--modern { margin-block-start: 18px; }

  .b-email-editor-option__alignment {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    font-size: 12px;
  }

  .b-email-editor-option__align-options {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    height: auto;
    padding: 4px;
    overflow: visible;

    :deep(.v-btn) { border-radius: 8px !important; }
    :deep(.v-btn--active) { background: rgb(var(--v-theme-surface)); box-shadow: var(--sd-modern-selected-shadow); }
    :deep(.v-btn--active .v-btn__overlay) { opacity: 0; }
  }

  .b-email-editor-option__upload-note { margin-block-start: 14px; text-align: start; }

  :deep(.v-field__input), :deep(.v-label) { font-family: inherit; font-size: 13px; line-height: 20px; }
  :deep(.v-messages), :deep(.v-counter) { font-size: 11px; line-height: 18px; }
  :deep(.s--setting-color) { padding-inline: 0; }
  :deep(.s--setting-color .-label) { min-width: 0; font: inherit; }
  :deep(.s--setting-color .v-list-item__prepend) { min-width: 0; white-space: normal; }
  :deep(.row-font) { margin-block: 10px; overflow-wrap: anywhere; }
  :deep(.row-font b) { font-size: 13px; font-weight: 400; line-height: 21px; }

  @media (max-width: 600px), (pointer: coarse) {
    .b-email-editor-option__align-options :deep(.v-btn) { min-height: 44px; }
  }
}
</style>
