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
    class="s--value-copy-box"
    :class="{ '-limited-width': !fullWidth, '-small': small ,'-text-start':textStart}"
    @click.stop
  >
    <div
      class="link-box"
      :style="{ backgroundColor: backgroundColor }"
      :class="{ border: border, 'rounded-18px': smallWidthMode }"
    >
      <v-btn
        :min-height="small ? 24 : 64"
        class="-btn"
        :color="color"
        @click.stop="copyToClipboard(value)"
        :size="small ? 'small' : undefined"
        :class="{ 'rounded-18px': smallWidthMode ,'ma-2':!small,'ma-1':small }"
      >
        <v-icon>{{ icon }}</v-icon>
      </v-btn>

      <span
        v-if="password && !show_pass"
        class="-link text-muted pp"
        @click="show_pass = true"
        >CLICK TO SHOW</span
      >
      <div v-else class="-link" :class="contentClass">
        <slot name="prepend-value"></slot>
        <span> {{ value }}</span>
      </div>
      <slot name="append-value"></slot>
      <img
        v-if="image"
        :width="small ? 18 : 46"
        height="auto"
        :src="image"
        class="ms-2 px-2 border-start"
      />

    </div>
    <p v-if="message" class="text-subtitle-2 text-start my-1">
      <v-icon class="me-1" size="small">info</v-icon>
      {{ message }}
    </p>
  </div>
</template>

<script>
export default {
  name: "SValueCopyBox",
  props: {
    value: {},
    message: {},
    icon: { default: "fa:fas fa-copy" },
    image: {},
    color: { default: "primary" },
    backgroundColor: { default: "#fff" },
    fullWidth: { default: false, type: Boolean },
    password: { default: false, type: Boolean },

    smallWidthMode: { default: false, type: Boolean }, // Small width with large content! Rounded button!

    border: { default: true, type: Boolean },

    contentClass: {},
    small: Boolean,
    textStart: Boolean,
  },
  data: () => ({
    show_pass: false,
  }),
};
</script>

<style scoped lang="scss">
/*
━━━━━━━━━━━━━━━━━━━━ 🎺 Variables ━━━━━━━━━━━━━━━━━━━━
 */

/*
━━━━━━━━━━━━━━━━━━━━ 🪅 Classes ━━━━━━━━━━━━━━━━━━━━
 */
.s--value-copy-box {
  &.-limited-width {
    max-width: 1000px;
    margin: 0 auto 12px auto;
  }

  &.-small {
    .link-box {
      min-height: 24px;
      .-link {
        font-size: 1rem;
      }
    }


  }
  &.-text-start{
    .link-box {
      .-link {
        text-align: start;
      }
    }

  }

  .link-box {
    display: flex;
    align-items: center;
    justify-content: space-around;
    border-radius: 12px;
    overflow: hidden;
    //border: solid thin #999;
    min-height: 64px;

    .-btn {
      flex-grow: 0;
    }

    .-link {
      flex-grow: 1;
      margin: 4px 8px;
      direction: ltr;
      text-align: center;
      font-size: 1.1rem;

      @media only screen and (max-width: 850px) {
        font-size: 0.8rem;
      }
      @media only screen and (max-width: 600px) {
        font-size: 0.7rem;
      }
    }
  }
}
</style>
