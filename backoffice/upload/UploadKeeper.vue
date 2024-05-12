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
  <div v-if="show" class="upload-keeper thin-scroll slideInUp shadow-paper">
    <v-slide-y-transition group hide-on-leave tag="div">
      <div v-for="(item, id) in items" :key="id" class="uf">
        <b class="d-block mb-1 text-start">{{ item.name }}</b>
        <v-progress-linear
          :color="item.color ? item.color : 'light-blue'"
          :model-value="item.progress"
          height="10"
          rounded
          striped
        ></v-progress-linear>
      </div>
    </v-slide-y-transition>
  </div>
</template>

<script>
export default {
  name: "UploadKeeper",
  computed: {
    items() {
      return this.$store.getters.getUploadingKeeper;
    },
    show() {
      return (
        this.items && Object.keys(this.$store.getters.getUploadingKeeper).length
      );
    },
  },
  watch: {
    show(show) {
      if (show) {
        window.onbeforeunload = function () {
          return "You are uploading a file. Are you sure to cancel it?";
        };
      } else {
        window.onbeforeunload = undefined;
      }
    },
  },
  beforeUnmount() {
    window.onbeforeunload = undefined;
  },
};
</script>

<style lang="scss" scoped>
.upload-keeper {
  position: fixed;
  bottom: 8px;
  left: 12px;
  background-color: #fff;
  border-radius: 18px;
  border: solid thin #eee;
  padding: 12px 18px;
  max-height: 400px;
  overflow-y: auto;
  width: 420px;
  max-width: calc(100% - 24px);
  min-height: 48px;
  z-index: 99;

  .uf {
    margin: 4px auto;
  }
}
</style>
