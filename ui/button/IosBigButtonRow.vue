<template>
  <component
          :is="to?'router-link':'div'"
          :to="to"
    class="row-hover rounded-xl border px-5 py-7 d-flex m-2 bg-gray"
    :class="{ disabled: disabled }"
    @click="$emit('click')"

    :style="color?`border-color: ${color} !important; color: ${color}`:null"
  >
    <v-icon v-if="icon" class="me-1" :color="color">{{ icon }}</v-icon>
    <v-spacer></v-spacer>

    <span
      ><v-icon v-if="titleIcon" class="me-1" :color="color?color:'#111'">{{
        titleIcon
      }}</v-icon>
      {{ title }}<br />
      <small :style="{color: color}">{{ subtitle }}</small>
    </span>

    <v-spacer></v-spacer>

    <v-icon :color="color">{{ $t("icons.chevron_next") }}</v-icon>
  </component>
</template>

<script>
export default {
  name: "IosBigButtonRow",
  props: {
    icon: {},
      title: {},
      to: {},
    subtitle: {},
    titleIcon: {},
    disabled: {
      type: Boolean,
      default: false,
    },
    color:{}
  },
};
</script>

<style scoped></style>
