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
  <span
    class="stamp"
    :class="{
      'is-nope': isDeclined,
      'is-approved': isApproved,
      'is-draft': isDraft,
    }"
  >
    <slot></slot>
  </span>
</template>

<script>
export default {
  name: "Stamp",
  props: {
    isDeclined: {
      type: Boolean,
      default: false,
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    isDraft: {
      type: Boolean,
      default: false,
    },
  },
};
</script>

<style scoped lang="scss">
.stamp {
  transform: rotate(12deg);
  color: #555;
  font-size: 2.1rem;
  font-weight: 700;
  border: 0.25rem solid #555;
  display: inline-block;
  padding: 0.25rem 1rem;
  text-transform: uppercase;
  border-radius: 1rem;
  -webkit-mask-image: url("./assets/noise.png");
  -webkit-mask-size: 380px 168px;
  mix-blend-mode: multiply;
  mask-image: url("./assets/noise.png");
}

.is-nope {
  color: #d23;
  border: 0.5rem double #d23;
  -webkit-mask-position: 13rem 6rem;
  transform: rotate(-14deg);
}

.is-approved {
  color: #0a9928;
  border: 0.5rem solid #0a9928;
  -webkit-mask-position: 13rem 6rem;
  transform: rotate(-14deg);
}

.is-draft {
  color: #c4c4c4;
  border: 1rem double #c4c4c4;
  -webkit-mask-position: 13rem 6rem;
  transform: rotate(-14deg);
}
</style>
