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
    class="circle-button-selldone"
    :class="{ '-small': dense ,'--wrap':wrap}"
    @mouseenter="(val) => $emit('mouseenter', val)"
    @mouseleave="(val) => $emit('mouseleave', val)"
    :key="key"
  >
    <v-badge
      :value="badge_value"
      :color="badgeColor"
      :icon="badgeIcon"
      :content="formatedNumberValue"
      overlap
      offset-y="15px"
      offset-x="15px"
      :dot="dot"
    >
      <v-btn
        :to="to"
        :href="href"
        :depressed="isCurrent"
        :color="
          isCurrent
            ? activeColor
              ? activeColor
              : color
            : fill
            ? color
            : 'default'
        "
        :dark="isCurrent"
        :target="target"
        class="mx-1 mx-sm-2"
        :width="large ? 72 : 38"
        :height="large ? 72 : 38"
        :fab="fill || isCurrent"
        :icon="!fill && !isCurrent"
        @click="
          () => {
            onClick();
            in_loading = !!to && !target;
          }
        "
        @click.stop
        exact
        :class="{ disabled: disabled }"
        :loading="(loading || in_loading) && !beInCurrentRoute"
      >
        <!-- ------------------------ HAS BADGE   :disabled="disabled || beInCurrentRoute" ------------------------ -->

        <v-icon
          v-if="icon"
          :small="small"
          :size="adjustForFontAwesome ? 20 : null"
          :color="
            !fill && !isCurrent ? (iconColor ? iconColor : color) : '#fff'
          "
          class="transition-ease-in-out"
        >
          {{ icon }}
        </v-icon>

        <v-avatar
          :color="isCurrent ? this.imageBgSelected : imageBgColor"
          :size="
            (imageSize
              ? imageSize
              : large
              ? 56
              : isCurrent || forceFill
              ? 32
              : 26) * (small ? 0.7 : 1)
          "
          v-else-if="src"
          :tile="tile && !isCurrent"
          :class="isCurrent ? '' : '-scale'"
          class="transition-ease-in-out"
        >
          <img
            :src="src"
            :style="isCurrent || forceFill ? 'padding:3px' : ''"
          />
        </v-avatar>
        <slot v-else></slot>
      </v-btn>
    </v-badge>

    <span
      class="mini-name"
      :class="{ 'dense-text': dense }"
      :style="{ color: color }"
      :title="tooltip"
      >{{ tooltip }}
      <slot name="tooltip"></slot>
    </span>
  </div>
</template>

<script>
import numeral from "numeral";
import { SetupService } from "@core/server/SetupService";

export default {
  name: "SCircleButton",
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
          item.name === this.autoDisabledRouteName || item.name === this.to.name
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

<style scoped lang="scss">
.circle-button-selldone {
  user-select: none;
  position: relative;

  display: inline-block;
  padding: 0 9px;

  &.-small {
    padding: 0 4px;
    .mini-name {
      font-size: 0.72rem;
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
    font-size: 0.77rem;
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
      font-size: 0.72rem;
    }
  }

  &.--wrap{
    .mini-name {
      white-space:normal;
    }
  }
}

.small-badge {
  font-size: 0.8em;
}

.circle-image-internal {
  border-radius: 50%;
  margin: 7%;
}
::v-deep.circle-button-selldone {
  .v-badge__badge {
    .v-icon {
      font-size: 14px;
      vertical-align: initial;
      color: #fff !important;
    }
  }

}
</style>

<style lang="scss"></style>
