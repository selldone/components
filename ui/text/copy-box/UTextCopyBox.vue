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
    :class="{
      '-limited-width': !fullWidth,
      '-small': small,
      '-text-start': textStart,
    }"
    class="s--value-copy-box"
    @click.stop
  >
    <div
      :class="{ border: border, 'rounded-18px': smallWidthMode }"
      :style="{ backgroundColor: backgroundColor }"
      class="link-box"
    >
      <div class="d-flex align-center justify-center">
        <v-btn
          :class="{
            'rounded-18px': smallWidthMode,
            'ma-2': !small && smallWidthMode,
            'ma-1': small && smallWidthMode,
          }"
          :color="color"
          :min-height="small ? 24 : 64"
          :size="small ? 'small' : undefined"
          class="-btn"
          @click.stop="copyToClipboard(value)"
        >
          <v-icon>{{ icon }}</v-icon>
        </v-btn>
      </div>

      <div class="-link">
        <div v-if="message" class="text-start small op-0-5">
          {{ message }}
        </div>
        <v-spacer></v-spacer>

        <span
          v-if="password && !show_pass"
          class="text-muted pp"
          @click="show_pass = true"
          >CLICK TO SHOW</span
        >
        <div v-else :class="contentClass" class="">
          <slot name="prepend-value"></slot>
          <span :style="{ 'letter-spacing': letterSpacing }"> {{ value }}</span>
        </div>
        <v-spacer :style="message ? 'flex-basis: 14px;' : ''"></v-spacer>
      </div>

      <slot name="append-value"></slot>
      <div
        v-if="image"
        class="ms-2 px-2 border-start flex-grow-0 d-flex align-center justify-center"
      >
        <v-img :src="image" :width="small ? 18 : 36" height="auto" />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "UTextCopyBox",
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
    letterSpacing: {},
  },
  data: () => ({
    show_pass: false,
  }),
};
</script>

<style lang="scss" scoped>
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
        font-size: 0.8rem;
      }
    }
  }

  &.-text-start {
    .link-box {
      .-link {
        text-align: start;
      }
    }
  }

  .link-box {
    display: flex;
    align-items: stretch;
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
      font-size: 1rem;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      align-items: stretch;

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
