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
  <div>
    <small class="g-small-title" dir="ltr">Google search:</small>
    <div class="g_snippet text-left google-font-style">
      <div class="g_title ng-binding">{{ title.substring(0, 60) }}</div>
      <div class="g_url ng-binding">{{ url }}<span class="caret"></span></div>
      <div class="g_description ng-binding">
        {{ description ? description.substring(0, 180) : "" }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: "BGooglePreview",
  props: {
    title: {},
    url: {},
    description: {},
  },
};
</script>

<style lang="scss" scoped>
.google-font-style {
  font-family: Roboto, HelveticaNeue, Arial, sans-serif !important;
}

.g_snippet {
  display: block;
  background-color: #ffffff;
  padding: 20px;
  border: solid 1px #0000001f;
  max-width: 634px;
  margin: 8px auto;
}

.g_title {
  color: #1a0dab;
  font-size: 18px;
  line-height: 1.33;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  padding-right: 16.5px;
  max-width: 592px;
  height: 1.3em;
}

.g_url {
  color: #006621;
  font-size: 14px;
  line-height: 1.54;
  padding: 2px 0 1px 0;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.g_description {
  color: #545454;
  font-size: 13px;
  line-height: 1.54;
}

.star-bg {
  background-image: url("data:image/svg+xml,\00003csvg width='13px' height='15px' xmlns='http://www.w3.org/2000/svg'>\00003cpath fill='%23d1d1d1' d='m0,7.6l4.7,0,1.5-4.5,1.5,4.5,4.7,0-3.8,2.8,1.5,4.5-3.8-2.8-3.8,2.8,1.5-4.5'/>\00003c/svg>");
  width: 65px;
  height: 15px;
  display: inline-block;
  background-repeat: repeat-x;
  background-size: 13px 15px;
  font-size: 0;
  color: #70757a;
  white-space: nowrap;
}

.star-bg-active {
  background-image: url("data:image/svg+xml,\00003csvg width='13px' height='15px' xmlns='http://www.w3.org/2000/svg'>\00003cpath fill='%23fabb05' d='m0,7.6l4.7,0,1.5-4.5,1.5,4.5,4.7,0-3.8,2.8,1.5,4.5-3.8-2.8-3.8,2.8,1.5-4.5'/>\00003c/svg>") !important;
}

.title-preview {
  margin-left: 10px;
  margin-right: 10px;
}

.google-product-card a {
  text-decoration: none !important;
}

.google-product-card {
  max-width: 634px;
  background-color: #ffffff;
  padding: 20px;
  border: solid 1px #0000001f;
  margin: 8px 0;
}

.g-small-title {
  font-family: Roboto, HelveticaNeue, Arial, sans-serif !important;
  color: #777;
  font-size: 12px;
  margin-top: 12px;
  direction: ltr !important;
}
</style>
