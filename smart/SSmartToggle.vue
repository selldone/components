<template>
  <div class="text-start">
    <h3 v-if="label" class="my-2">
      <v-icon
        v-if="labelIcon"
        class="me-1 flex-grow-0"
        :color="labelIconColor"
        >{{ labelIcon }}</v-icon
      >
      {{ label }}
    </h3>
    <v-subheader v-if="hint">{{ hint }}</v-subheader>

    <div
      class="p-2 usn"
      :class="{ disabled: disabled, pp: !readonly && !loading, pen: loading }"
      @click="toggle"
    >
      <div class="d-flex align-center mnh">
        <!-- ------- Toggle ------- -->

        <div
          style="min-width: 28px"
          class="flex-grow-0 d-flex align-center justify-center me-2"
        >
          <div
            :class="{ 'avatar-gradient': value }"
            class="-thin -gray position-relative"
          >
            <!-- Toggle Icon -->
            <v-icon :color="falseGray && !value ? '#666' : color">
              {{ value ? "lens" : "radio_button_unchecked" }}</v-icon
            >
            <!-- Loading -->
            <v-progress-circular
              v-if="loading"
              :color="value ? '#fff' : color"
              class="center-absolute"
              indeterminate
              :size="14"
              :width="3"
            ></v-progress-circular>
          </div>
        </div>

        <div class="flex-grow-1">
          <b>
            <span v-html="title"></span>
            <v-icon v-if="readonly" x-small :color="dark ? '#fff' : '#111'"
              >lock</v-icon
            >
          </b>
          <v-subheader v-if="description" style="height: auto" class="p-0">
            <span v-html="description"></span>
          </v-subheader>
        </div>

        <v-icon v-if="icon" :small="smallIcon">{{ icon }}</v-icon>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "SSmartToggle",
  components: {},
  props: {
    value: {},

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
  },
  computed: {
    icon() {
      return this.value
        ? this.trueIcon
        : this.falseIcon
        ? this.falseIcon
        : this.trueIcon;
    },

    description() {
      return this.value
        ? this.trueDescription
        : this.falseDescription
        ? this.falseDescription
        : this.trueDescription;
    },
    title() {
      return this.value
        ? this.trueTitle
        : this.falseTitle
        ? this.falseTitle
        : this.trueTitle;
    },
  },

  methods: {
    toggle() {
      if (this.readonly) return;
      const val = !this.value;
      this.$emit("input", val);

      this.$nextTick(() => {
        this.$emit("change", val);
      });
    },
  },
};
</script>

<style scoped lang="scss"></style>
