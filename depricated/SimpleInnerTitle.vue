<template>
  <div
    class="text-start px-lg-4 px-3 mt-4 mt-md-2"
    :class="{ dark: dark }"
  >
    <b v-if="!!this.$slots.title">
      <slot name="title"></slot>
    </b>
    <p v-if="!!this.$slots['sub-title']" class="small text-muted">
      <slot name="sub-title"></slot>
    </p>
    <p v-if="!!this.$slots.info">
      <i class="fas fa-dot-circle text-success "></i>
      <slot name="info"></slot>
    </p>
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: "SimpleInnerTitle",
  props: {
    dark: {
      type: Boolean,
      default: false
    }
  }
};
</script>

<style scoped lang="scss">
.dark {
  color: white;

  .small {
    &.text-muted {
      color: rgba(255, 255, 255, 0.87);
    }
  }
}
</style>
