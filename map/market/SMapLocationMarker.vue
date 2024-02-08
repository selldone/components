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
  <div class="marker-samin">
    <div class="market-pin">
      <img
        width="64px"
        :src="require('@components/assets/icons/location-center-icon.svg')"
      />
      <img
        v-if="pinImage"
        style="position: absolute; top: 15px; left: 23px"
        width="18px"
        :src="pinImage"
      />
      <v-icon
        v-if="pinIcon"
        style="position: absolute; top: 15px; left: 23px"
        size="18"
      >
        {{ pinIcon }}
      </v-icon>
    </div>

    <div class="pulse"></div>
  </div>
</template>

<script>
import {defineComponent} from "vue";

export default defineComponent({
  name: "SMapLocationMarker",
  props: {
    pinImage: {
      require: false,
      type: String,
      default: require("@components/assets/icons/Truck-fill.svg"),
    },

    pinIcon: {
      require: false,
      type: String,
      default: null,
    },
  },

  created() {
  }
});
</script>

<style scoped lang="scss">
.marker-samin {
  width: 64px;
  height: 64px;
  display: block;
}

.pulse {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 50%;
  height: 14px;
  width: 14px;
  position: absolute;
  left: 36px;
  top: 70%;
  margin: 11px 0px 0px -12px;
  transform: rotateX(55deg);
  z-index: -2;
}
.pulse:after {
  content: "";
  border-radius: 50%;
  height: 40px;
  width: 40px;
  position: absolute;
  // margin: -13px 0 0 -13px;
  animation: pulsate 1s ease-out;
  animation-iteration-count: infinite;
  opacity: 0;
  box-shadow: 0 0 1px 2px #89849b;
  animation-delay: 1.1s;
  left: -13px;
  top: -13px;
}
@-moz-keyframes pulsate {
  0% {
    transform: scale(0.1, 0.1);
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    transform: scale(1.2, 1.2);
    opacity: 0;
  }
}
@-webkit-keyframes pulsate {
  0% {
    transform: scale(0.1, 0.1);
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    transform: scale(1.2, 1.2);
    opacity: 0;
  }
}
@-o-keyframes pulsate {
  0% {
    transform: scale(0.1, 0.1);
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    transform: scale(1.2, 1.2);
    opacity: 0;
  }
}
@keyframes pulsate {
  0% {
    transform: scale(0.1, 0.1);
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    transform: scale(1.2, 1.2);
    opacity: 0;
  }
}
@-moz-keyframes bounce {
  0% {
    opacity: 0;
    transform: translateY(-2000px) rotate(-45deg);
  }
  60% {
    opacity: 1;
    transform: translateY(30px) rotate(-45deg);
  }
  80% {
    transform: translateY(-10px) rotate(-45deg);
  }
  100% {
    transform: translateY(0) rotate(-45deg);
  }
}
@-webkit-keyframes bounce {
  0% {
    opacity: 0;
    transform: translateY(-2000px) rotate(-45deg);
  }
  60% {
    opacity: 1;
    transform: translateY(30px) rotate(-45deg);
  }
  80% {
    transform: translateY(-10px) rotate(-45deg);
  }
  100% {
    transform: translateY(0) rotate(-45deg);
  }
}
@-o-keyframes bounce {
  0% {
    opacity: 0;
    transform: translateY(-2000px) rotate(-45deg);
  }
  60% {
    opacity: 1;
    transform: translateY(30px) rotate(-45deg);
  }
  80% {
    transform: translateY(-10px) rotate(-45deg);
  }
  100% {
    transform: translateY(0) rotate(-45deg);
  }
}
@keyframes bounce {
  0% {
    opacity: 0;
    transform: translateY(-2000px) rotate(-45deg);
  }
  60% {
    opacity: 1;
    transform: translateY(30px) rotate(-45deg);
  }
  80% {
    transform: translateY(-10px) rotate(-45deg);
  }
  100% {
    transform: translateY(0) rotate(-45deg);
  }
}
</style>
