<!-- UMarquee.vue -->
<template>
  <div :id="id" :class="$style.marqueeSlider">
    <div
      :class="$style.marqueeSliderContainer"
      :style="containerStyle"
      ref="container"
    >
      <!-- Repeat the slot content using v-for -->
      <div
        v-for="n in totalItems"
        :key="n"
        :style="itemStyle"
        class="$style.marqueeItem"
      >
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, nextTick } from "vue";

export default defineComponent({
  name: "UMarquee",
  props: {
    autoWidth: {
      type: Boolean,
      default: false,
    },
    id: {
      type: String,
      required: true,
      default: "id",
    },
    paused: {
      type: Boolean,
      default: false,
    },
    repeat: {
      type: Number,
      default: 10,
    },
    reverse: {
      type: Boolean,
      default: false,
    },
    space: {
      type: Number,
      default: 200,
    },
    duration: {
      type: String,
      default: "10s",
    },
    width: {
      type: Number,
      default: 100,
    },
  },
  data() {
    return {
      containerWidth: 0,
      slotContentLength: 1,
    };
  },
  computed: {
    containerStyle() {
      return {
        animationDuration: this.duration,
        animationDirection: this.reverse ? "reverse" : "normal",
        animationPlayState: this.paused ? "paused" : "running",
        display: "flex",
        width: this.autoWidth ? `${this.containerWidth}px` : "auto",
      };
    },
    itemStyle() {
      return {
        marginRight: `${this.space}px`,
        minWidth: this.autoWidth ? "auto" : `${this.width}px`,
        objectFit: this.autoWidth ? "contain" : "initial",
      };
    },
    totalItems() {
      return this.repeat * this.slotContentLength;
    },
  },
  mounted() {
    this.calculateContainerWidth();
  },
  methods: {
    calculateContainerWidth() {
      nextTick(() => {
        const container = this.$refs.container as HTMLElement;
        if (container && this.autoWidth) {
          this.containerWidth = container.scrollWidth;
        }
        this.slotContentLength = this.getSlotContentLength();
      });
    },
    getSlotContentLength() {
      const slotContent = this.$slots.default ? this.$slots.default() : [];
      return slotContent.length || 1;
    },
  },
});
</script>

<style lang="css" module>
.marqueeSlider {
  overflow: hidden;
}

.marqueeSliderContainer {
  animation-name: marqueeAnimation;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
}

@keyframes marqueeAnimation {
  0% {
    transform: translateX(0%);
  }
  100% {
    transform: translateX(-50%);
  }
}
</style>
