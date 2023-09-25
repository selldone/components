<template>
  <div
    :style="{
      '--top': top,
      '--left': left,
      '--top-s': top680 ? top680 : top,
      '--left-s': left680 ? left680 : left,
    }"
    class="ribbon"
    :class="{ '-no-res': !top680 }"
  >
    <img :src="src" class="approved-bg" />

    <div class="approved-container single-line"><slot></slot></div>
  </div>
</template>

<script>
export default {
  name: "Ribbon",
  props: {
    red: {
      type: Boolean,
      default: false,
    },
    green: {
      type: Boolean,
      default: false,
    },

    top: {
      default: "-4px",
    },
    left: {
      default: "-5px",
    },

    top680: {},
    left680: {},
  },

  computed: {
    src() {
      return this.green
        ? require("@/Components/assets/icons/approve-badge.svg")
        : require("@/Components/assets/icons/countdown-badge.svg");
    },
  },
};
</script>

<style lang="scss">
.ribbon {
  .approved-bg {
    position: absolute;
    top: var(--top);
    left: var(--left);
    z-index: 3;
    width: 100px;
    pointer-events: none;
    transform: scaleX(-1);

  }
  .approved-container {
    pointer-events: none;
    position: absolute;

    user-select: none;
    text-transform: uppercase;

    top: calc(14px + var(--top));
    left: calc(5px + var(--left));
    z-index: 4;
    padding: 6px;
    color: #fff;

    transform: rotate(-41deg) translate(-18%, -35%);
    transform-origin: center;
    width: 100px;
    font-weight: 500;
    font-size: 12px;
    //  background: rgba(194, 24, 91, 0.8);
    transform-origin: center;
    text-align: center;
  }

  // Change in small screen:
 /* &:not(.-no-res) {
    @media only screen and (max-width: 680px) {
      .approved-container {
        top: 18px;
        transform: rotate(-41deg) translate(-20%, 8%);
      }
      .approved-bg {
        top: var(--top-s);
        left: var(--left-s);
      }
    }
  }*/
}
</style>
