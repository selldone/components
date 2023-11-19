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
  <v-chip
    pill
    :text-color="value > 0 ? '#255e27' : value === 0 ? '#888' : '#922222'"
    :color="value > 0 ? '#F0F4C3' : value === 0 ? '#eee' : '#FFCDD2'"
    label
    class="change"
    small
  >


    <v-icon v-if="value" :color="value > 0?'#255e27':'#922222'" small class="me-1 ic">
      {{value>0?'fas fa-caret-up':'fas fa-caret-down'}}
    </v-icon>



    <price-view
      v-if="currency"
      :amount="value"
      :currency="currency"
    ></price-view>
    <span v-else>{{ value | numeralFormat("0.[00]a") }}</span>

    <slot></slot>
  </v-chip>
</template>

<script>
export default {
  name: "ChangeBadge",
  components: {  },
  props: {
    value: {},
    currency: {},
  },
};
</script>

<style scoped lang="scss">
.change {
  font-size: 12px;
  unicode-bidi: plaintext;
  padding: 0px 6px;
  white-space: nowrap;
  height: auto;
  .ic{
    vertical-align: sub;
  }
}
</style>
