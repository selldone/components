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
  <s-fade-scroll class="text-start">
    <div class="d-flex" title="Dynamic values auto fill by augmentation.">
      <v-chip label v-for="it in array" :key="it" x-small class="me-1">{{
        it
      }}</v-chip>
    </div>
  </s-fade-scroll>
</template>

<script>
import SFadeScroll from "@components/ui/fade-scroll/SFadeScroll.vue";

export default {
  name: "SBackofficeAugmentKeysFinder",
  components: { SFadeScroll },
  props: {
    value: {},
  },

  data: function () {
    return {
      show_add: false,
    };
  },
  computed: {
    array() {
      return this.value?.findAllDynamicAugmentKeys().unique(); // Find all {{key}}
    },
  },

  watch: {},

  created() {

  },

  methods: {},
};
</script>

<style scoped lang="scss"></style>
