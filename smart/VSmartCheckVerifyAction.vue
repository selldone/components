<template>
  <div class="text-start">
    <h3 v-if="label" class="my-2">{{ label }}</h3>
    <v-subheader v-if="hint">{{ hint }}</v-subheader>

    <div class="p-2 pp usn" :class="{ disabled: disabled }" @click="toggle">
      <div class="d-flex align-center mnh">
        <v-icon
          :color="falseGray && !value?'#33':color"
          class="me-2 -thin -gray flex-grow-0"
          :class="{ 'avatar-gradient': value }"
          >{{ value ? "lens" : "radio_button_unchecked" }}</v-icon
        >
        <div class="flex-grow-1">
          <b> {{ trueTitle }} </b>
          <v-subheader v-if="description" style="height: auto" class="p-0">
            {{ description }}
          </v-subheader>
        </div>
        <v-avatar size="32" class="me-1 avatar-gradient -thin -user">
          <img :src="getUserAvatar(USER_ID())" />
        </v-avatar>

        <v-icon v-if="icon">{{ icon }}</v-icon>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "VSmartCheckVerifyAction",
  components: {},
  props: {
    value: {},

    label: {},
    hint: {},

    color: { default: "primary" },

    trueTitle: { default: "I verify this action." },

    trueDescription: {},
    falseDescription: {},

    trueIcon: {},
    falseIcon: {},

    disabled: {
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
  },

  methods: {
    toggle() {
      const val = !this.value;
      this.$emit("input", val);
      this.$emit("change", val);
    },
  },
};
</script>

<style scoped lang="scss"></style>
