<template>
  <img :src="icon" :height="size" :title="value" />
</template>

<script>
import { CampaignMedium } from "@core/enums/campaign/CampaignMedium";

export default {
  name: "MediumIcon",

  props: {
    value: {},
    size:{
      default:16
    }
  },

  computed: {
    icon() {
      const found = this.value
        ? CampaignMedium.find(
            item => item.name.toLowerCase() === this.value.toLowerCase()
          )
        : null;

      return found ? found.icon : require("@core/enums/campaign/assets/mediums/default.svg");
    }
  },
  methods: {}
};
</script>

<style scoped></style>
