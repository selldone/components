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
  <div class="justify-content-between d-flex align-center py-1">
    <template v-if="title">
      <span class="me-2"
        ><v-icon v-if="prependIcon" class="me-1">{{ prependIcon }}</v-icon>
        {{ title }}</span
      >
      <slot name="append-title"></slot>
      <span class="dashed-flex-space"></span>
    </template>

    <v-btn
      :size="size"
      class="mx-auto"
      color="#9d9d9d33"
      icon
      variant="flat"
      @click.stop="show_picker = true"
    >
      <v-icon
        :class="{ 'bg-tiny-checkers rounded-circle': !noBg }"
        :color="nullable && !modelValue ? 'transparent' : modelValue"
        :size="size ? size * 0.8 : icon === 'lens' ? 'large' : undefined"
        >{{ !modelValue ? "cancel" : icon }}
      </v-icon>
    </v-btn>

    <v-btn
      v-if="nullable"
      :size="size"
      class="ms-2"
      icon
      variant="text"
      @click.stop="
        $emit('update:modelValue', null);
        $emit('change', null);
        $emit('clear');
      "
    >
      <v-icon>close</v-icon>
    </v-btn>

    <v-dialog
      v-model="show_picker"
      :theme="dark ? 'dark' : 'light'"
      max-width="360"
      scrollable
    >
      <v-card v-if="show_picker" :color="color" rounded="xl">
        <v-card-title class="d-flex align-center">
          <v-icon class="me-1">palette</v-icon>
          <span class="small" v-html="dialogTitle ? dialogTitle : title"></span>
        </v-card-title>

        <v-card-text>
          <v-color-picker
            :mode="mode"
            :model-value="modelValue ? modelValue : '#FFFFFFFF'"
            class="mx-auto bg-transparent"
            elevation="0"
            show-swatches
            @click.stop
            @update:model-value="updateValue"
          />
        </v-card-text>

        <v-card-actions></v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
export default {
  name: "SColorSelector",
  emits: ["update:modelValue", "change", "clear"],
  props: {
    modelValue: {},

    icon: { default: "lens" },
    prependIcon: {},
    noBg: { type: Boolean, default: false },

    color: { default: "#fff" },
    dark: { type: Boolean, default: false },

    title: {},
    dialogTitle: {},
    default: {},
    nullable: { type: Boolean, default: false },
    mode: {
      default: "hexa",
    },

    noAlpha: { type: Boolean, default: false },
    size: {
      default: 30,
    },
  },
  data() {
    return {
      show_picker: false,
    };
  },

  watch: {},
  created() {
    this.old_val = this.modelValue;

    if (!this.modelValue && !this.nullable) {
      this.$emit(
        "update:modelValue",
        this.default ? this.default : "#333333FF",
      );
    }

    // Correction of rgb value bug: (Specially in get style color in page builder)
    if (this.modelValue && this.modelValue.startsWith("rgb(")) {
      this.$emit("update:modelValue", rgb2hex(this.value));
    } else if (this.modelValue && this.modelValue.startsWith("rgba(")) {
      this.$emit("update:modelValue", rgba2hexa(this.value));
    } else if (
      this.modelValue &&
      this.modelValue.startsWith("#") &&
      this.modelValue.length < 9
    ) {
      // Force Alpha chanel!
      let val = "#ffffffff";
      if (this.modelValue.length === 4) {
        val = this.modelValue.replaceAll(
          "#([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])",
          "#$1$1$2$2$3$3",
        );
      } else if (this.modelValue.length === 7) {
        if (this.noAlpha) {
          val = this.modelValue;
        } else {
          val = this.modelValue + "ff";
        }
      }
      this.$emit("update:modelValue", val);
    }
  },

  methods: {
    updateValue(val) {
      const value = val && val.hexa ? val.hexa : val;
      if (this.old_val === value) return;

      this.$emit("update:modelValue", value);
      this.$emit("change", value);
      this.old_val = value;
    },
  },
};

function rgb2hex(rgb) {
  rgb = rgb.match(
    /^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i,
  );
  return rgb && rgb.length === 4
    ? "#" +
        ("0" + parseInt(rgb[1], 10).toString(16)).slice(-2) +
        ("0" + parseInt(rgb[2], 10).toString(16)).slice(-2) +
        ("0" + parseInt(rgb[3], 10).toString(16)).slice(-2)
    : "";
}

function rgba2hexa(orig) {
  var a,
    isPercent,
    rgb = orig
      .replace(/\s/g, "")
      .match(/^rgba?\((\d+),(\d+),(\d+),?([^,\s)]+)?/i),
    alpha = ((rgb && rgb[4]) || "").trim(),
    hex = rgb
      ? (rgb[1] | (1 << 8)).toString(16).slice(1) +
        (rgb[2] | (1 << 8)).toString(16).slice(1) +
        (rgb[3] | (1 << 8)).toString(16).slice(1)
      : orig;

  if (alpha !== "") {
    a = alpha;
  } else {
    a = 1;
  }
  // multiply before convert to HEX
  a = ((a * 255) | (1 << 8)).toString(16).slice(1);
  hex = hex + a;

  return "#" + hex;
}
</script>

<style lang="scss" scoped></style>
