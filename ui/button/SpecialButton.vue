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
    <div class="info-button" :class="{ 'for-native': isNative }">
      <a :href="href" target="_blank" rel="nofollow">
        <v-img class="icon " :src="src" aspect-ratio="1" contain />
        <p class="small">
          {{ title }}
        </p>
        <p class="big">
          {{ name }}
        </p>
      </a>
    </div>
  </div>
</template>

<script>
export default {
  name: "SpecialButton",

  props: {
    title: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    src: {
      type: String,
      required: true
    },
    href: {
      type: String,
      required: false
    }
  }
};
</script>

<style scoped lang="scss">
.info-button {
  position: relative;

  user-select: none;
  background-color: #000;
  color: white;
  border-radius: 8px;
  margin: 0 auto;
  width: 200px;
  height: 60px;
  padding: 0;
  text-align: right;

  cursor: pointer;

  transition: all 0.65s;

  @media only screen and (max-width: 600px) {
    p {
      display: none !important;
    }
    width: 60px;
    height: 60px;

    border-radius: 18px;
  }
  &.for-native {
    p {
      display: none !important;
    }
    width: 60px;
    height: 60px;

    border-radius: 18px;
  }

  &:hover {
    box-shadow: 10px 10px 10px 0px rgba(0, 0, 0, 0.3);
    transition: all 0.5s;
    z-index: 2;
    transform: translateY(-8px);
    .icon {
      transform: translateY(-4px);
    }
  }

  a {
    color: white !important;
    &:hover {
      color: white !important;
    }
  }

  .icon {
    position: relative;
    transition: all 0.35s;

    width: 40px;
    float: left !important;
    margin-top: 10px;
    margin-left: 10px;
  }
  .small {
    font-size: 0.7rem;
    padding: 12px 16px 0 0;
    margin: 0;
  }
  .big {
    font-weight: 600;
    font-size: 1.2rem;
    margin: 0px 22px 0 0;
  }
}
</style>
