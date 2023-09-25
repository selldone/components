<template>
  <div class="s--value-copy-box" :class="{ '-limited-width': !fullWidth }" @click.stop>
    <div
      class="link-box"
      :style="{ backgroundColor: backgroundColor }"
      :class="{ border: border, 'rounded-18px': smallWidthMode }"
    >
      <v-btn
        min-height="64"
        class="-btn"
        :color="color"
        dark
        @click.stop="copyToClipboard(value)"
        tile
        :class="{ 'ma-2 rounded-18px': smallWidthMode }"
      >
        <v-icon>{{ icon }}</v-icon></v-btn
      >
      <v-spacer></v-spacer>
      <span
        v-if="password && !show_pass"
        class="-link text-muted pp"
        @click="show_pass = true"
        >CLICK TO SHOW</span
      >
      <span v-else class="-link"> {{ value }}</span>
      <v-spacer></v-spacer>

      <img
        v-if="image"
        width="46"
        height="auto"
        :src="image"
        class="ms-2 px-2 border-start"
      />
    </div>
    <p v-if="message" class="subtitle-2 text-start my-1">
      <v-icon class="me-1" small>info</v-icon> {{ message }}
    </p>
  </div>
</template>

<script>
export default {
  name: "SValueCopyBox",
  props: {
    value: {},
    message: {},
    icon: { default: "fas fa-copy" },
    image: {},
    color: { default: "primary" },
    backgroundColor: { default: "#fff" },
    fullWidth: { default: false, type: Boolean },
    password: { default: false, type: Boolean },

    smallWidthMode: { default: false, type: Boolean }, // Small width with large content! Rounded button!

    border: { default: true, type: Boolean },
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
.s--value-copy-box{

  &.-limited-width {
    max-width: 1000px;
    margin: 0 auto 12px auto;
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
      margin: 4px 8px;
      flex-grow: 1;
      direction: ltr;
      text-align: center;
      font-size: 1.1rem;
      max-width: calc(100% - 130px);

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
