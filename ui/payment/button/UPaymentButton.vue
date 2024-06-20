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
  <div
    :class="{ '-small': small, '-blue': blue, '-purple': purple,pen:disabled }"
    class="container-btn border"
  >
    <div class="left-side">
      <div class="card-pay">
        <div class="card-line"></div>
        <div class="buttons"></div>
      </div>
      <div class="post">
        <div class="post-line"></div>
        <div class="screen-pos">
          <div class="dollar">{{ pos }}</div>
        </div>
        <div class="numbers"></div>
        <div class="numbers-line2"></div>
      </div>
    </div>
    <div class="right-side">
      <div class="-right-side-container ms-4">
        <slot></slot>
      </div>

      <v-icon class="arrow me-4">{{ $t("icons.chevron_next") }}</v-icon>
    </div>

    <div v-if="disabled " class="-disable-reason">
      <slot name="disable-reason"></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: "UPaymentButton",
  props: {
    small: {
      type: Boolean,
      default: false,
    },
    blue: {
      type: Boolean,
      default: false,
    },
    purple: {
      type: Boolean,
      default: false,
    },
    pos: {
      default: "$",
    },
    disabled:Boolean,
  },
};
</script>

<style lang="scss" scoped>
.container-btn {
  --background: #33837e;
  --left-side: #5de2a3;
  --card: #c7ffbc;
  --card-line: #80ea69;
  --button-color-3: #26850e;
  --button-color-2: #379e1f;
  --button-color-1: #56be3e;
  --post: #dddde0;
  --numbers: #838183;
  --numbers-2: #aaa9ab;
  --post-line: #757375;
  --post-line2: #545354;
  --dollar: #4b953b;
  --card-shadow: rgba(77, 200, 143, 0.72);

  &.-blue {
    --background: #0288d1;
    --left-side: #03a9f4;
    --card: #b4d4e4;
    --card-line: #03a9f4;
    --button-color-3: #0e7aac;
    --button-color-2: #0775b1;
    --button-color-1: #0288d1;
    --post: #dddde0;
    --numbers: #838183;
    --numbers-2: #aaa9ab;
    --post-line: #757375;
    --post-line2: #545354;
    --dollar: #2295c9;
    --card-shadow: rgb(64, 64, 64);
  }

  &.-purple {
    --background: #c2185b;
    --left-side: #c2185b;
    --card: #fbc02d;
    --card-line: #673ab7;
    --button-color-3: #7b1fa2;
    --button-color-2: #7b1fa2;
    --button-color-1: #512da8;
    --post: #dddde0;
    --numbers: #838183;
    --numbers-2: #aaa9ab;
    --post-line: #757375;
    --post-line2: #545354;
    --dollar: #ffa000;
    --card-shadow: rgb(64, 64, 64);
  }

  --width: 460px;
  --height: 120px;
  --width-hover: 220px;
  --left-side-w: 130px;
  --font-size: 23px;
  --post-top: 120px;
  --scale-factor: 1;

  &.-small {
    --width: 320px;
    --height: 70px;
    --width-hover: 80px;
    --left-side-w: 65px;
    --font-size: 14px;
    --post-top: 90px;
    --scale-factor: 2;
  }

  background-color: #ffffff;
  display: flex;
  width: var(--width);
  height: var(--height);
  position: relative;
  border-radius: 18px;
  transition: 0.3s ease-in-out;
  line-height: normal;
  max-width: 100%;
  text-align: start;

  &:before {
    width: var(--width);
    position: absolute;
    // top: 0;
    // right: 0;

    height: 100%;
    content: "";

    // Important for align center thin button! hover problem solve!
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) !important;
  }

  &:hover {
    transform: scale(1.03);
    width: var(--width-hover);

    .left-side {
      width: 100%;
    }
  }

}

.left-side {
  background-color: var(--left-side);
  width: var(--left-side-w);
  height: var(--height);
  border-radius: 18px;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: 0.3s;
  flex-shrink: 0;
  overflow: hidden;
}

.right-side {
  width: calc(100% - var(--left-side-w));
  display: flex;
  align-items: center;
  overflow: hidden;
  cursor: pointer;
  justify-content: space-between;
  white-space: nowrap;
  transition: 0.3s;

  &:hover {
    background-color: #f9f7f9;
  }
}

.arrow {
  //  width: 20px;
  //  height: 20px;
  // margin-right: 20px;
}

.-right-side-container {
  font-size: var(--font-size);
  color: #333;
  overflow: hidden;
}

.card-pay {
  width: calc(70px / var(--scale-factor));
  height: calc(46px / var(--scale-factor));
  background-color: var(--card);
  border-radius: calc(6px / var(--scale-factor));
  position: absolute;
  display: flex;
  z-index: 10;
  flex-direction: column;
  align-items: center;
  -webkit-box-shadow: 9px 9px 9px -2px var(--card-shadow);
  -moz-box-shadow: 9px 9px 9px -2px var(--card-shadow);
  -webkit-box-shadow: 9px 9px 9px -2px var(--card-shadow);

  box-shadow:
    inset 0 -3em 3em rgba(255, 255, 255, 0.26),
    0 5px 50px 4px rgb(58, 44, 65) !important;
}

.card-line {
  width: calc(65px / var(--scale-factor));
  height: calc(13px / var(--scale-factor));
  background-color: var(--card-line);
  border-radius: 2px;
  margin-top: calc(7px / var(--scale-factor));
}

@media only screen and (max-width: 480px) {
  .container-btn {
    transform: scale(0.9);

    &:hover {
      transform: scale(0.94);
    }
  }
  .-right-side-container {
    font-size: 14px;
  }
}

.buttons {
  width: calc(8px / var(--scale-factor));
  height: calc(8px / var(--scale-factor));
  background-color: var(--button-color-2);
  box-shadow:
    0 calc(-10px / var(--scale-factor)) 0 0 var(--button-color-3),
    0 calc(10px / var(--scale-factor)) 0 0 var(--button-color-1);
  border-radius: 50%;
  margin-top: calc(5px / var(--scale-factor));
  transform: rotate(90deg);
  margin: calc(10px / var(--scale-factor)) 0 0 calc(-30px / var(--scale-factor));
}

.container-btn:hover .card-pay {
  animation: slide-top 1.2s cubic-bezier(0.645, 0.045, 0.355, 1) both;
}

.container-btn:hover .post {
  animation: slide-post 1s cubic-bezier(0.165, 0.84, 0.44, 1) both;
}

@keyframes slide-top {
  0% {
    -webkit-transform: translateY(0);
    transform: translateY(0);
  }
  50% {
    -webkit-transform: translateY(-70px) rotate(90deg);
    transform: translateY(-70px) rotate(90deg);
  }
  60% {
    -webkit-transform: translateY(-70px) rotate(90deg);
    transform: translateY(-70px) rotate(90deg);
  }
  100% {
    -webkit-transform: translateY(-8px) rotate(90deg);
    transform: translateY(-8px) rotate(90deg);
  }
}

.post {
  width: calc(63px / var(--scale-factor));
  height: calc(75px / var(--scale-factor));
  background-color: var(--post);
  position: absolute;
  z-index: 11;
  bottom: calc(10px / 2);
  top: var(--post-top);
  border-radius: 6px;
  overflow: hidden;
}

.post-line {
  width: calc(47px / var(--scale-factor));
  height: calc(9px / var(--scale-factor));
  background-color: var(--post-line2);
  position: absolute;
  border-radius: 0px 0px 3px 3px;
  right: calc(8px / var(--scale-factor));
  top: calc(8px / var(--scale-factor));

  &:before {
    content: "";
    position: absolute;
    width: calc(47px / var(--scale-factor));
    height: calc(9px / var(--scale-factor));
    background-color: var(--post-line);
    top: calc(-8px / var(--scale-factor));
    left: 0;
  }
}

.screen-pos {
  width: calc(47px / var(--scale-factor));
  height: calc(23px / var(--scale-factor));
  background-color: #ffffff;
  position: absolute;
  top: calc(22px / var(--scale-factor));
  right: calc(8px / var(--scale-factor));
  border-radius: 3px;
}

.numbers {
  width: calc(12px / var(--scale-factor));
  height: calc(12px / var(--scale-factor));
  background-color: var(--numbers);
  box-shadow:
    0 calc(-18px / var(--scale-factor)) 0 0 var(--numbers),
    0 calc(18px / var(--scale-factor)) 0 0 var(--numbers);
  border-radius: calc(2px / var(--scale-factor));
  position: absolute;
  transform: rotate(90deg);
  left: calc(25px / var(--scale-factor));
  top: calc(52px / var(--scale-factor));
}

.numbers-line2 {
  width: calc(12px / var(--scale-factor));
  height: calc(12px / var(--scale-factor));
  background-color: var(--numbers-2);
  box-shadow:
    0 calc(-18px / var(--scale-factor)) 0 0 var(--numbers-2),
    0 calc(18px / var(--scale-factor)) 0 0 var(--numbers-2);
  border-radius: calc(2px / var(--scale-factor));
  position: absolute;
  transform: rotate(90deg);
  left: calc(25px / var(--scale-factor));
  top: calc(68px / var(--scale-factor));
}

@keyframes slide-post {
  50% {
    -webkit-transform: translateY(0);
    transform: translateY(0);
  }
  100% {
    -webkit-transform: translateY(-70px);
    transform: translateY(-70px);
  }
}

.dollar {
  position: absolute;
  font-size: calc(16px / var(--scale-factor));
  width: 100%;
  left: 0;
  top: 0;
  color: var(--dollar);
  text-align: center;
}

.container-btn:hover .dollar {
  animation: fade-in-fwd 0.3s 1s backwards;
}

@keyframes fade-in-fwd {
  0% {
    opacity: 0;
    transform: translateY(-5px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.-disable-reason{
  position: absolute;
  left: 10px;
  right:10px;
  top: 10px;
  bottom:10px;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
background-color: #00000055;
  color: #fff;
  backdrop-filter: blur(1px);
  border-radius: 12px;
  font-size: 13px;
  font-weight: 500;
}
</style>
