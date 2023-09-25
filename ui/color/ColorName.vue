<template>
  <span class="s--color-name">
    {{ color_name }}
  </span>
</template>

<script>
export default {
  name: "ColorName",
  props: {
    color: {},
  },
  computed: {
    color_name() {
      return this.GetNameOfColor(this.color);
    },
  },
  methods: {},
};
</script>

<style lang="scss">
.s--color-name {
}
</style>
