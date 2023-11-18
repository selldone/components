<template>
  <ul class="list">
    <slot />
  </ul>
</template>

<script>
// ―――――――――――――――― A set of vue mixins to turn any list into an animated sortable list ――――――――――――――――
import { ContainerMixin, ElementMixin } from "vue-slicksort";

export default {
  name: "SortableList",
  mixins: [ContainerMixin]
};
</script>

<style scoped></style>
