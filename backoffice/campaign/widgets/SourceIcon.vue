<template>
  <img :src="icon" :height="size" :width="size" :title="value" />
</template>

<script>
import { Brands } from "@core/enums/social/Brands";

export default {
  name: "SourceIcon",

  props: {
    value: {},
    size: {
      default: 16,
    },
  },

  computed: {
    icon() {
      if(this.value==='direct')return  require("@components/assets/icons/direct-enter.svg");
      const found = this.value
        ? Brands.find(
            (item) => item.name.toLowerCase() === this.value.toLowerCase()
          )
        : null;

      return found
        ? found.icon
        : require("@components/assets/tradmark/default.svg");
    },
  },
  methods: {},
};
</script>

<style scoped></style>
