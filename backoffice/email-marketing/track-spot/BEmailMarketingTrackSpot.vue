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
  <a
    :class="{ small: small, 'x-small': xSmall }"
    :style="`--color:${color};--bg-color-1:${bgColor1};--bg-color-2:${bgColor2};--ripple-top:${top};`"
    class="intro-banner-vdo-play-btn pinkBg"
  >
    <i aria-hidden="true" class="label-play">{{ label }}</i>
    <span class="ripple pinkBg"></span>
    <span class="ripple pinkBg"></span>
    <span class="ripple pinkBg"></span>
  </a>
</template>

<script>
export default {
  name: "BEmailMarketingTrackSpot",
  props: {
    label: {},
    color: { default: "#ed184f" },
    bgColor1: { default: "#fd5581" },
    bgColor2: { default: "#fd8b55" },
    top: { default: "50%" },
    small: { default: false, type: Boolean },
    xSmall: { default: false, type: Boolean },
  },
};
</script>

<style lang="scss" scoped>
.label-play {
  color: white;
  font-size: 12px;
  z-index: 1;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  line-height: normal;
}

.pinkBg {
  background-color: var(--color) !important;
  background-image: linear-gradient(
    90deg,
    var(--bg-color-1),
    var(--bg-color-2)
  );
}

.intro-banner-vdo-play-btn {
  height: 60px;
  width: 60px;
  position: absolute;
  top: var(--ripple-top);
  left: 50%;
  text-align: center;
  margin: -30px 0 0 -30px;
  border-radius: 100px;
  z-index: 1;

  .ripple {
    position: absolute;
    width: 160px;
    height: 160px;
    z-index: -1;
    left: 50%;
    top: 50%;
    opacity: 0;
    margin: -80px 0 0 -80px;
    border-radius: 80px;
    -webkit-animation: ripple 1.8s infinite;
    animation: ripple 1.8s infinite;
  }

  .ripple:nth-child(2) {
    animation-delay: 0.3s;
    -webkit-animation-delay: 0.3s;
  }

  .ripple:nth-child(3) {
    animation-delay: 0.6s;
    -webkit-animation-delay: 0.6s;
  }

  &.small {
    height: 40px;
    width: 40px;
    margin: -20px 0 0 -20px;

    .label-play {
      font-size: 10px;
    }

    .ripple {
      width: 120px;
      height: 120px;

      margin: -60px 0 0 -60px;
      border-radius: 60px;
    }
  }

  &.x-small {
    height: 30px;
    width: 30px;
    margin: -15px 0 0 -15px;

    .label-play {
      font-size: 7px;
    }

    .ripple {
      width: 70px;
      height: 70px;

      margin: -35px 0 0 -35px;
      border-radius: 35px;
    }
  }
}

@-webkit-keyframes ripple {
  0% {
    opacity: 1;
    -webkit-transform: scale(0);
    transform: scale(0);
  }
  100% {
    opacity: 0;
    -webkit-transform: scale(1);
    transform: scale(1);
  }
}

@keyframes ripple {
  0% {
    opacity: 1;
    -webkit-transform: scale(0);
    transform: scale(0);
  }
  100% {
    opacity: 0;
    -webkit-transform: scale(1);
    transform: scale(1);
  }
}
</style>
