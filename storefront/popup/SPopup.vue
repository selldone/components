<template>
  <div
    class="popup-dialog-container"
    @click="$emit('close')"
    :class="popup.position"
  >
    <div
      class="position-relative"
      style="max-height: 100%; max-width: 100%"
      :class="[popup.transition]"
      :style="{
        transformOrigin: popup.position
          ? popup.position.replace('-', ' ')
          : 'center',
      }"
    >
      <v-card
        :height="style && style.h ? style.h : Math.min(window.innerHeight, 800)"
        :width="style && style.w ? style.w : Math.min(window.innerWidth, 800)"
        color="#fff"
        class="pop-card overflow-hidden d-flex pa-1 pa-sm-2 pa-md-3"
        @click.stop
        :class="[{ 's--shadow-no-padding': style && style.s }]"
        :style="{
          borderRadius: style && style.r ? style.r : undefined,
        }"
        max-height="100%"
        max-width="100%"
        :flat="!style || !style.s"
        :ripple="false"
        style="cursor: initial"
      >
        <VusePopupRenderer
          v-if="popup.content"
          :data="popup.content"
          class="thin-scroll overflow-y-auto"
          style="max-height: 100%; width: 100%"
        />
      </v-card>

      <v-btn
        @click="$emit('close')"
        class="absolute-top-end zoomIn delay_500"
        fab
        depressed

        color="#fff"
        ><v-icon>close</v-icon></v-btn
      >
    </div>

    <v-row
      v-if="preview"
      class="bottom-bar fadeIn delay_1s"
      no-gutters
      dir="ltr"
    >
      <v-chip v-if="popup.delay" label color="green" class="m-1" small dark
        ><v-icon class="mr-1" small>motion_photos_on</v-icon>
        {{ popup.delay }} s</v-chip
      >
      <v-chip v-if="popup.hide" label color="red" class="m-1" small dark
        ><v-icon class="mr-1" small>hourglass_bottom</v-icon>
        {{ popup.hide }} s</v-chip
      >
      <v-chip v-if="popup.transition" label color="blue" class="m-1" small dark
        ><v-icon class="mr-1" small>timelapse</v-icon>
        {{ getName(popup.transition) }}</v-chip
      >
    </v-row>
  </div>
</template>

<script>
export default {
  name: "SPopup",
  components: {},
  props: {
    popup: {
      require: true,
      type: Object,
    },
    preview: {
      default: false,
      type: Boolean,
    },
  },
  data: () => ({}),

  computed: {
    style() {
      return this.popup.style ? this.popup.style : {};
    },
  },
  watch: {},

  created() {},

  beforeDestroy() {},

  methods: {},
};
</script>

<style lang="scss" scoped>
.popup-dialog-container {
  position: fixed;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  top: 0;
  left: 0;
  transition: all 0.5s;
  flex-direction: column;
  .pop-card {
    position: relative;
    overflow-y: auto;
  }
  &.top-left {
    justify-content: flex-start;
    align-items: flex-start;
  }
  &.top-center {
    justify-content: flex-start;
    align-items: center;
  }
  &.top-right {
    justify-content: flex-start;
    align-items: flex-end;
  }
  &.left-center {
    justify-content: center;
    align-items: flex-start;
  }
  &.right-center {
    justify-content: center;
    align-items: flex-end;
  }
  &.bottom-right {
    justify-content: flex-end;
    align-items: flex-end;
  }
  &.bottom-center {
    justify-content: flex-end;
    align-items: center;
  }

  &.bottom-left {
    justify-content: flex-end;
    align-items: flex-start;
  }

  .bottom-bar {
    flex-grow: 0;
    background: #333;
    padding: 6px;
    border-radius: 6px;
    margin: 8px;
  }
}
</style>
