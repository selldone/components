<template>
  <v-btn
    depressed
    :color="busy ? 'default' : color"
    dark
    rounded
    :class="{ disabled: disabled }"
    @click="busy ? '' : $emit('click')"
  >
    <slot v-if="!this.busy" />

    <lottie
      v-else
      :options="{ path: '/animation/719-loading.json', loop: true }"
      height="84px"
      width="100px"
      :speed="1"
    />
  </v-btn>
</template>

<script>
export default {
  name: "LoadingButton",

  props: {
    busy: {
      required: false,
      type: Boolean,
      default: false
    },

    disabled: {
      required: false,
      type: Boolean,
      default: false
    },
    color: {
      required: false,
      default: "success"
    }
  },

  data: () => ({}),

  computed: {}
};
</script>

<style scoped></style>
