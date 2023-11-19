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
      <span class="me-2">{{ title }}</span>
      <span class="dashed-flex-space"></span>
    </template>

    <v-btn icon @click.stop="show_picker = true" style="background: #9d9d9d33" class="mx-auto">
      <v-icon
        :large="icon === 'lens'"
        :color="(nullable && !value )?'transparent':value"
        :class="{ 'bg-tiny-checkers rounded-circle': !noBg }"
        >{{ (!value )?'cancel':icon }}</v-icon
      >
    </v-btn>

    <v-btn
      v-if="nullable"
      icon
      @click.stop="
        $emit('input', null);
        $emit('change', null);
        $emit('clear');
      "
      class="ms-2"
    >
      <v-icon>close</v-icon>
    </v-btn>

    <v-dialog v-model="show_picker" max-width="360" :dark="dark" scrollable>
      <v-card v-if="show_picker" :color="color">
        <v-card-title>
          <v-icon class="me-1">palette</v-icon>
          <span class="small" v-html="title"></span>
        </v-card-title>

        <v-card-text>
          <v-color-picker
            @click.stop
            :value="value ? value : '#FFFFFFFF'"
            @input="updateValue"
            class="mx-auto bg-transparent"
            show-swatches
            :mode="mode"
            flat
          />
        </v-card-text>

        <v-card-actions> </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
export default {
  name: "ColorSelector",
  props: {
    icon: { default: "lens" },
    noBg: { type: Boolean, default: false },

    color: { default: "#fff" },
    dark: { type: Boolean, default: false },

    title: {},
    value: {},
    default: {},
    nullable: { type: Boolean, default: false },
    mode: {
      default: "hexa",
    },

    noAlpha: { type: Boolean, default: false },
  },
  data() {
    return {
      show_picker: false,
    };
  },

  watch: {
    /* show_picker() {
      this.$emit("change", this.value);
    },*/
  },
  created() {
    this.old_val = this.value;

    if (!this.value && !this.nullable) {
      this.$emit("input", this.default ? this.default : "#333333FF");
    }

    // Correction of rgb value bug: (Specially in get style color in page builder)
    if (this.value && this.value.startsWith("rgb(")) {
      this.$emit("input", rgb2hex(this.value));
    } else if (this.value && this.value.startsWith("rgba(")) {
      this.$emit("input", rgba2hexa(this.value));
    } else if (
      this.value &&
      this.value.startsWith("#") &&
      this.value.length < 9
    ) {
      // Force Alpha chanel!
      let val = "#ffffffff";
      if (this.value.length === 4) {
        val = this.value.replaceAll(
          "#([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])",
          "#$1$1$2$2$3$3"
        );
      } else if (this.value.length === 7) {
        if (this.noAlpha) {
          val = this.value;
        } else {
          val = this.value + "ff";
        }
      }
      this.$emit("input", val);
    }
  },

  methods: {
    updateValue(val) {
      const value = val && val.hexa ? val.hexa : val;
      if (this.old_val === value) return;

      this.$emit("input", value);
      this.$emit("change", value);
      this.old_val = value;
    },
  },
};

function rgb2hex(rgb) {
  rgb = rgb.match(
    /^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i
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

<style scoped lang="scss"></style>
