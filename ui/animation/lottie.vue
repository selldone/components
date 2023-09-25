<template>
  <div ref="lavContainer" :style="style" />
</template>

<script>
import lottie from "lottie-web/build/player/lottie_light";

export default {
  props: {
    options: {
      type: Object,
      required: true
    },
    height: {
      type: String,
      required: false
    },
    width: {
      type: String,
      required: false
    },
    speed: {
      type: Number,
      required: false
    },
    frame: {
      type: Number,
      required: false
    },

    play: {
      type: Boolean,
      required: false,
      default: true
    }
  },
  data() {
    return {
      style: {
        width: this.width ? `${this.width}` : "100%",
        height: this.height ? `${this.height}` : "100%",
        overflow: "hidden",
        margin: "0 auto"
      },
      anim: null
    };
  },

  watch: {
    play(val) {
      if (val) this.anim.play();
      else {
        if (this.frame) this.anim.goToAndStop(this.frame, true);
        else this.anim.stop();
      }
    }
  },
  mounted() {
    this.anim = lottie.loadAnimation({
      container: this.$refs.lavContainer,
      renderer: "svg",
      loop: this.options.loop !== false,
      autoplay: this.options.autoplay !== false,
      animationData: this.options.animationData,
      path: this.options.path,
      rendererSettings: this.options.rendererSettings
    });
    this.$emit("animCreated", this.anim);
    if (this.speed) this.anim.setSpeed(this.speed);

    if (this.frame) this.anim.goToAndStop(this.frame, true);
  }
};
</script>
