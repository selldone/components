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
    :class="{ dark: dark }"
    :style="{
      '--step-color': dark ? '#000' : color,
      '--step-color-dark': darkColor ? darkColor : SaminColorDarkDeep,
    }"
  >
    <div :class="{ 'mt-5': hasSubscription }" class="container-stepper">
      <div
        :style="`height: 2px;width: ${100 - 100 / length}%;left: ${
          50 / length
        }%;top: 15px;background-color: ${
          dark ? '#000' : color
        };position: absolute;z-index:1`"
      ></div>

      <div
        :style="`height: 2px;width: ${(activeIndex * 100) / length}%;left: ${
          50 / length
        }%;top: 15px;background-color: ${
          dark ? '#fff' : SaminColorDarkDeep
        };position: absolute;z-index:2`"
      ></div>

      <ul
        class="progressbar"
        @mouseenter="
          (e) => {
            if ($refs.target) $emit('mouseEnterToCustomer', $refs.target[0]);
          }
        "
      >
        <li
          v-for="(item, _key, index) in states"
          :key="_key"
          :ref="_key === 'ToCustomer' ? 'target' : undefined"
          :caption="$t(item.name)"
          :class="{
            active: activeIndex >= index,
            'sub-caption b-16px -no-wrap': showCaption,
            '-black': showCaption && dark,
            '-hover': $vuetify.display.xs,
          }"
          :style="`width:${100 / length}%`"
          :title="$t(item.name)"
        >
          <v-icon
            v-if="activeIndex > index"
            class="hide-on-hover"
            color="#fff"
            size="14"
          >
            check_circle
          </v-icon>

          <v-icon
            v-else-if="activeIndex === index"
            class="hide-on-hover"
            color="#fff"
            size="14"
          >
            {{ item.icon ? item.icon : "radio_button_unchecked" }}
          </v-icon>
          <v-icon
            v-else-if="item.icon"
            class="op-0-6 hide-on-hover"
            color="#ccc"
            size="14"
          >
            {{ item.icon }}
          </v-icon>

          <v-icon
            :color="activeIndex >= index ? '#fff' : '#ccc'"
            class="show-on-hover"
            size="14"
          >
            {{ item.icon ? item.icon : "radio_button_unchecked" }}
          </v-icon>
        </li>
      </ul>

      <div
        v-if="hasSubscription"
        :class="{ '-rtl': $vuetify.locale.isRtl }"
        class="top-chain"
      >
        <v-icon class="-ic-1" size="16">shortcut</v-icon>

        <span class="-br"></span>
        <span v-if="isSubscribed">
          <v-icon color="green" size="12">check_circle</v-icon>
          subscribed
        </span>
        <span v-else>
          <v-icon color="red" size="12">cancel</v-icon>
          unsubscribed
        </span>
        <span class="-br"></span>
        <v-icon class="-ic-2" size="16"
          >{{ isSubscribed ? "swipe_left_alt" : "credit_card_off" }}
        </v-icon>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: "SOrderDeliveryStatusStepper",
  emits: ["mouseEnterToCustomer"],
  props: {
    dark: {
      type: Boolean,
      default: false,
    },
    states: {
      required: true,
      type: Array,
    },
    state: {},
    color: {
      default: "#979797",
    },
    showCaption: {
      type: Boolean,
      default: false,
    },
    darkColor: {},

    hasSubscription: {
      type: Boolean,
      default: false,
    },
    isSubscribed: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {};
  },

  computed: {
    activeIndex() {
      let index = 0;
      for (let property in this.states) {
        let state = this.states[property];
        if (state.code === this.state) return index;
        index++;
      }

      return 0;
    },

    length() {
      let length = Object.keys(this.states).length;
      return length ? length : 1;
    },
  },
};
</script>

<style lang="scss" scoped>
$color_1: var(--step-color);
$color_2: white;
$border_color_1: var(--step-color-dark);

.container-stepper {
  position: relative;
  z-index: 1;

  ul {
    padding: 0 !important;
  }
}

.progressbar {
  position: relative;
  z-index: 3;
  counter-reset: step;

  list-style-type: none;

  li {
    float: left;
    width: 14.28%;
    position: relative;
    text-align: center;

    transition: all 0.15s ease-in-out;

    &:hover {
      transform: scale(1.5, 1.5);
      z-index: 1;

      .show-on-hover {
        display: block !important;
      }

      .hide-on-hover {
        display: none !important;
      }
    }

    .hide-on-hover {
      display: block !important;
    }

    .show-on-hover {
      display: none !important;
    }

    i {
      // Icon
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }

    &:before {
      content: "";
      counter-increment: step;
      width: 30px;
      height: 30px;
      border: 2px solid $color_1;
      display: block;
      margin: 0 auto 0px auto;
      border-radius: 50%;
      line-height: 27px;
      background: white;
      color: $color_1;
      text-align: center;
      font-weight: bold;
    }

    /*
        &:after {
          transition: all 0.15s step-end;
    pointer-events: none;
          content: "";
          position: absolute;
          width: 100%;
          height: 3px;
          background: #979797;
          top: 15px;
          left: -50%;
          z-index: -1;
        }

        &:first-child {
          &:after {
            content: none;
          }
        }*/
  }

  li.active {
    &:before {
      border-color: $border_color_1;
      background: $border_color_1;
      color: $color_2;
    }

    /* &:after {
      background: $border_color_1;
    }*/

    li {
      /* &:after {
        background: $border_color_1;
      }*/

      &:before {
        border-color: $border_color_1;
        background: $border_color_1;
        color: $color_2;
      }
    }
  }
}

.top-chain {
  --chain-color: #111;

  position: absolute;
  right: 0;
  width: 52%;
  top: -21px;
  z-index: 11;
  font-size: 8px;
  display: flex;
  align-items: center;
  font-weight: 600;
  color: var(--chain-color);

  .-br {
    margin: 0 3px;
    flex-grow: 1;
    height: 1px;
    background-color: var(--chain-color);
  }

  .-ic-1 {
    transform: rotate(-90deg) scaleX(-1) translateX(5px);
    color: var(--chain-color) !important;
  }

  .-ic-2 {
    color: var(--chain-color) !important;
  }

  &.-rtl {
    flex-direction: row-reverse;
  }
}

$border_color_1_dark: #fff;

.dark {
  .progressbar {
    li {
      &:before {
        border: 2px solid #000;
        background: var(--step-color-dark);
      }

      &:after {
        background: var(--step-color-dark);
      }
    }

    li.active {
      &:before {
        border-color: $border_color_1_dark;
        background: var(--step-color-dark);
      }

      &:after {
        background: $border_color_1_dark;
      }

      li {
        &:after {
          background: $border_color_1_dark;
        }

        &:before {
          border-color: $border_color_1_dark;
          background: $border_color_1_dark;
        }
      }
    }
  }

  .top-chain {
    --chain-color: #fff;
  }
}
</style>
