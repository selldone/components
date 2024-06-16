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
  <div class="text-start" >
    <h3 v-if="label" class="my-2">
      <v-icon v-if="labelIcon" :color="labelIconColor" class="me-1 flex-grow-0"
        >{{ labelIcon }}
      </v-icon>
      {{ label }}
    </h3>
    <v-list-subheader v-if="hint">{{ hint }}</v-list-subheader>

    <div
      :class="{ disabled: disabled, pp: !readonly && !loading, pen: loading,border:border }"
      class="pa-2 usn rounded-card"
      @click="toggle"
    >
      <div class="d-flex align-center mnh">
        <!-- ------- Toggle ------- -->

        <div
          class="flex-grow-0 d-flex align-center justify-center me-2"
          style="min-width: 32px; min-height: 32px"
        >
          <div
            :class="{ 'avatar-gradient': modelValue }"
            class="-thin -gray position-relative d-flex align-center justify-center"
          >
            <!-- Toggle Icon -->
            <v-icon
              :color="falseGray && !modelValue ? '#666' : color"
              size="24"
            >
              {{ modelValue ? "lens" : "radio_button_unchecked" }}
            </v-icon>
            <!-- Loading -->
            <v-progress-circular
              v-if="loading"
              :color="modelValue ? '#fff' : color"
              :size="14"
              :width="3"
              class="center-absolute"
              indeterminate
            ></v-progress-circular>
          </div>
        </div>

        <div class="flex-grow-1">
          <b>
            <span v-html="title"></span>
            <v-icon
              v-if="readonly"
              :color="dark ? '#fff' : '#111'"
              size="x-small"
              >lock
            </v-icon>
          </b>
          <div v-if="description" class="op-0-7 small">
            <span v-html="description"></span>
          </div>
        </div>

        <v-icon v-if="icon" :size="smallIcon ? 'small' : undefined"
          >{{ icon }}
        </v-icon>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "USmartToggle",
  components: {},
  emits: ["update:modelValue", "change"],
  props: {
    modelValue: {},

    label: {},
    hint: {},

    color: { default: "primary" },

    trueTitle: {},
    falseTitle: {},

    trueDescription: {},
    falseDescription: {},

    trueIcon: {},
    falseIcon: {},

    disabled: {
      default: false,
      type: Boolean,
    },
    readonly: {
      default: false,
      type: Boolean,
    },
    dark: {
      default: false,
      type: Boolean,
    },
    falseGray: {
      default: false,
      type: Boolean,
    },
    smallIcon: {
      default: false,
      type: Boolean,
    },
    loading: {
      default: false,
      type: Boolean,
    },

    labelIcon: {},
    labelIconColor: {},
    border:Boolean,
  },
  computed: {
    icon() {
      return this.modelValue
        ? this.trueIcon
        : this.falseIcon
          ? this.falseIcon
          : this.trueIcon;
    },

    description() {
      return this.modelValue
        ? this.trueDescription
        : this.falseDescription
          ? this.falseDescription
          : this.trueDescription;
    },
    title() {
      return this.modelValue
        ? this.trueTitle
        : this.falseTitle
          ? this.falseTitle
          : this.trueTitle;
    },
  },

  methods: {
    toggle() {
      if (this.readonly) return;
      const val = !this.modelValue;
      this.$emit("update:modelValue", val);

      this.$nextTick(() => {
        this.$emit("change", val);
      });
    },
  },
};
</script>

<style lang="scss" scoped></style>
