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
  <div>
    <s-setting-group
      v-if="option.type === 'section'"
      :icon="option.icon"
      :subtitle="option.description"
      :title="option.title"
    >
      <b-email-section-editor-row
        v-for="(child, i) in option.children"
        :key="i"
        :loaded-fonts="loadedFonts"
        :option="child"
        :shop="shop"
        :upload-url="uploadUrl"
      ></b-email-section-editor-row>
    </s-setting-group>

    <s-setting-color
      v-else-if="option.type === 'color'"
      v-model="option.object[option.key]"
      :title="option.label ? option.label : key"
      clearable
      icon="palette"
    >
    </s-setting-color>

    <s-setting-toggle
      v-else-if="option.type === 'align'"
      v-model="option.object[option.key]"
      :items="[
        { value: 'left', title: 'Left', icon: 'format_align_left' },
        { value: 'center', title: 'Center', icon: 'format_align_center' },
        { value: 'right', title: 'Right', icon: 'format_align_right' },
      ]"
      :title="option.label"
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

    <s-setting-text-input
      v-else-if="option.type === 'text'"
      v-model="option.object[option.key]"
      :counter="option.counter"
      :messages="option.messages"
      :placeholder="option.placeholder"
      :rules="option.rules"
      :title="option.label ? option.label : key"
      @blur="onUpdate()"
    >
    </s-setting-text-input>

    <div v-else-if="option.type === 'image'" class="text-center">
      <s-image-uploader
        v-if="option.type === 'image'"
        :disabled="!uploadUrl"
        :image="option.object[option.key]"
        :label="option.label ? option.label : key"
        :server="uploadUrl"
        auto-compact
        clearable
        dark
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
      <v-alert v-if="!uploadUrl" color="red" density="compact" type="error"
        >Save the mail to be able upload images.
      </v-alert>
    </div>

    <v-textarea
      v-else-if="option.type === 'json'"
      :label="option.label ? option.label : key"
      :model-value="JSON.stringify(option.object[option.key])"
      :placeholder="option.placeholder"
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
      class="my-3"
      false-gray
      @change="onUpdate()"
    >
    </u-smart-toggle>

    <div v-else-if="option.type === 'delete'" class="widget-buttons">
      <v-btn
        color="red"
        prepend-icon="close"
        size="x-large"
        variant="flat"
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
        append-icon="font_download"
        variant="underlined"
        @blur="onSelectFont"
        @keydown.enter="onSelectFont"
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
            {{ font }} - Sample message to ...</b
          >
        </div>

        <div class="text-end">
          <v-btn
            class="my-2 tnt"
            href="https://fonts.google.com"
            target="_blank"
            variant="text"
            >Find fonts here
          </v-btn>
        </div>
      </div>
    </div>
    <div v-else class="text-red">Invalid! {{ option }}</div>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import USmartToggle from "../../../../../ui/smart/toggle/USmartToggle.vue";
import SSettingGroup from "@selldone/page-builder/styler/settings/group/SSettingGroup.vue";
import SSettingColor from "@selldone/page-builder/styler/settings/color/SSettingColor.vue";
import SImageUploader from "../../../../../ui/uploader/SImageUploader.vue";
import BProductsSelectBox from "../../../../../backoffice/product/select-box/BProductsSelectBox.vue";
import SSettingTextInput from "@selldone/page-builder/styler/settings/text-input/SSettingTextInput.vue";
import SSettingToggle from "@selldone/page-builder/styler/settings/toggle/SSettingToggle.vue";
import WebFont from "webfontloader";

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
  },
  props: {
    shop: {
      type: Object,
      required: true,
    },
    option: {
      type: Object,
      required: true,
    },
    fonts: Array,
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

<style lang="scss" scoped></style>
