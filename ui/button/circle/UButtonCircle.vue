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

<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
  <div
    :key="key"
    :class="{ '-small': dense, '--wrap': wrap }"
    class="circle-button-selldone"
    @mouseenter="(val) => $emit('mouseenter', val)"
    @mouseleave="(val) => $emit('mouseleave', val)"
  >
    <v-btn
      :class="{ disabled: disabled }"
      :color="
        isCurrent
          ? activeColor
            ? activeColor
            : color
          : fill
            ? color
            : 'default'
      "
      :exact="true"
      :height="large ? 72 : 38"
      :href="href"
      :icon="true"
      :loading="(loading || in_loading) && !beInCurrentRoute"
      :target="target"
      :to="to"
      :variant="isFilled ? 'flat' : 'text'"
      :width="large ? 72 : 38"
      class="mx-1 mx-sm-2"
      @click="
        () => {
          onClick();
          in_loading = !!to && !target;
        }
      "
      @click.stop
    >
      <v-badge
        :color="badgeColor"
        :content="formatedNumberValue"
        :dot="dot"
        :icon="badgeIcon"
        :model-value="badge_value"
        floating
      >
        <!-- ------------------------ HAS BADGE   :disabled="disabled || beInCurrentRoute" ------------------------ -->

        <v-icon
          v-if="icon"
          :color="
            !fill && !isCurrent ? (iconColor ? iconColor : color) : '#fff'
          "
          :icon="icon"
          :size="adjustForFontAwesome ? 20 : undefined"
          :small="small"
        >
        </v-icon>

        <v-avatar
          v-else-if="src"
          :class="isCurrent ? '' : '-scale'"
          :color="isCurrent ? this.imageBgSelected : imageBgColor"
          :rounded="tile && !isCurrent ? 'sm' : 'circle'"
          :size="
            (imageSize
              ? imageSize
              : large
                ? 56
                : isCurrent || forceFill
                  ? 32
                  : 26) * (small ? 0.7 : 1)
          "
        >
          <img
            :src="src"
            :style="isCurrent || forceFill ? 'padding:3px' : ''"
          />
        </v-avatar>
        <slot v-else></slot>
      </v-badge>
    </v-btn>

    <span
      :class="{ 'dense-text': dense }"
      :style="{ color: color }"
      :title="tooltip"
      class="mini-name"
      >{{ tooltip }}
      <slot name="tooltip"></slot>
    </span>
  </div>
</template>

<script>
import numeral from "numeral";
import { SetupService } from "@selldone/core-js/server/SetupService";

export default {
  name: "UButtonCircle",
  emits: ["click", "mouseenter", "mouseleave"],
  props: {
    icon: {
      required: false,
      type: String,
    },
    src: {
      required: false,
      type: String,
    },
    tile: {
      default: false,
      type: Boolean,
    },

    target: {
      required: false,
      type: String,
    },

    outline: {
      required: false,
      type: Boolean,
      default: false,
    },

    fill: {
      required: false,
      type: Boolean,
      default: false,
    },

    disabled: {
      required: false,
      type: Boolean,
      default: false,
    },

    small: {
      required: false,
      type: Boolean,
      default: false,
    },
    adjustForFontAwesome: {
      required: false,
      type: Boolean,
      default: false,
    },

    dot: {
      required: false,
      type: Boolean,
      default: false,
    },
    imageBgSelected: {
      required: false,
      type: String,
      default: "#fff",
    },

    tooltip: {
      required: false,
      type: String,
    },
    to: {
      required: false,
      type: Object,
    },
    href: {
      required: false,
      type: String,
    },
    color: {
      required: false,
      type: String,
    },
    iconColor: {},
    badgeNumber: {
      required: false,
      type: Number,
      default: 0,
    },
    badgeColor: {
      required: false,
      type: String,
      default: "red",
    },
    badgeIcon: {
      required: false,
      type: String,
      default: null,
    },

    /*  hasBadge: {
      required: false,
      type: Boolean,
      default: false,
    },*/
    persistBadge: {
      required: false,
      type: Boolean,
      default: false,
    },

    dense: {
      required: false,
      type: Boolean,
      default: false,
    },
    wrap: {
      type: Boolean,
    },
    large: {
      required: false,
      type: Boolean,
      default: false,
    },

    imageBgColor: {
      required: false,
      type: String,
      default: "transparent",
    },
    forceFill: {
      required: false,
      type: Boolean,
      default: false,
    },

    autoDisabledRouteName: {
      required: false,
      type: String,
    },

    exact: {
      default: false,
      type: Boolean,
    },

    activeColor: {
      default: SetupService.SelldoneActiveButtonColor(),
    },

    loading: {
      type: Boolean,
      default: false,
    },
    imageSize: {},
  },

  data: () => ({
    clicked: false,
    in_loading: false,
  }),

  computed: {
    key() {
      return this.to ? JSON.stringify(this.to) : undefined;
    },
    isCurrent() {
      return this.outline || this.beInCurrentRoute;
    },
    isFilled() {
      return this.fill || this.isCurrent;
    },

    formatedNumberValue() {
      if (this.badgeIcon) return null;
      return numeral(this.badgeNumber).format("0.[0]a");
    },
    badge_value() {
      return (
        (this.badgeNumber > 0 || this.badgeIcon || this.dot) &&
        (!this.clicked || this.persistBadge) &&
        !(this.isCurrent && this.dot)
      );
    },
    beInCurrentRoute() {
      if (this.exact && this.to) {
        //   console.log('--->',this.$route,this.to)
        return (
          this.$route.name === this.to.name
        ); /*&& this.$route.params === this.to.params*/
      }
      /*   return this.$route.matched.some(

          (item) => {
            console.log('--->',item.params,this.to.params)
            return item.name === this.to.name && item.params === this.to.params
          }
        );*/

      if (!this.autoDisabledRouteName || !this.to) return false;
      return this.$route.matched.some(
        (item) =>
          item.name === this.autoDisabledRouteName ||
          item.name === this.to.name,
      );
    },
  },

  watch: {
    $route() {
      this.in_loading = false;
    },
  },

  methods: {
    onClick($event) {
      this.$emit("click", $event);
      this.clicked = true;
    },
  },
};
</script>

<style lang="scss" scoped>
.circle-button-selldone {
  user-select: none;
  position: relative;

  display: inline-block;
  padding: 0 9px;

  &.-small {
    padding: 0 4px;

    .mini-name {
      font-size: 0.68rem;
    }
  }

  .-scale {
    transition: all 0.3s ease-in-out;
  }

  &:hover {
    .mini-name {
      //  font-weight: 800;
    }

    .-scale {
      transform: scale(1.55, 1.55);
    }
  }

  .mini-name {
    transition: all 0.3s ease-in-out;

    text-align: center;
    font-weight: 500;
    // opacity: 0.9;
    width: 100%;
    user-select: none;
    font-size: 0.72rem;
    //letter-spacing: 0.35px;
    line-height: 1.4em;
    position: absolute;
    bottom: -8px;
    left: 50%;
    -webkit-transform: translateX(-50%) translateY(60%);
    transform: translateX(-50%) translateY(60%);

    //   -webkit-transform: translateY(50%);
    //   transform: translateY(50%);

    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    &.dense-text {
      bottom: -2px;
    }

    @media (max-width: 960px) {
      font-size: 0.68rem;
    }
  }

  &.--wrap {
    .mini-name {
      white-space: normal;
    }
  }
}

.small-badge {
  font-size: 0.76em;
}

.circle-image-internal {
  border-radius: 50%;
  margin: 7%;
}
</style>

<style lang="scss"></style>
