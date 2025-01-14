<template>
  <div class="u-arrow-container pen usn" :class="direction">
    <!-- Top Label -->
    <div class="u-arrow-label top">{{ topLabel }}</div>
    <!-- Arrow -->
    <div class="u-arrow-wrapper">
      <div class="u-arrow"></div>
    </div>
    <!-- Bottom Label -->
    <div class="u-arrow-label bottom">{{ bottomLabel }}</div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "UArrow",
  props: {
    direction: {
      type: String,
      required: true,
      validator: (value) => ["up", "down"].includes(value), // Allow only 'up' or 'down'
    },
    arrowWidth: {
      type: String,
      default: "4px", // Default arrow width
    },
    topLabel: {
      type: String,
      default: "", // Default top label
    },
    bottomLabel: {
      type: String,
      default: "", // Default bottom label
    },
  },
});
</script>

<style scoped lang="scss">
// Variables
$default-arrow-width: 2px;
$label-font-size: 10px;
$margin-no-arrow-side: 6px;
$margin-has-arrow-side: 18px;

.u-arrow-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  width: 24px; // Adjust width as needed

  // Direction-specific styles
  &.down {
    .u-arrow::after {
      top: 100%; // Arrowhead positioned at the bottom
      transform: translateX(-50%) rotate(45deg);
    }

    .u-arrow-label {
      &.top {
        margin-bottom: $margin-no-arrow-side; // Space below the top label
      }

      &.bottom {
        margin-top: $margin-has-arrow-side; // Space above the bottom label
      }
    }
  }

  &.up {
    .u-arrow::after {
      bottom: 100%; // Arrowhead positioned at the top
      transform: translateX(-50%) rotate(-135deg);
    }

    .u-arrow-label {
      &.top {
        margin-bottom: $margin-has-arrow-side; // Space below the top label
      }

      &.bottom {
        margin-top: $margin-no-arrow-side; // Space above the bottom label
      }
    }
  }

  .u-arrow-label {
    font-size: $label-font-size;
    text-align: center;
  }

  .u-arrow-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100px; // Ensures spacing between the labels and the arrow
    flex-grow: 1;
  }

  .u-arrow {
    position: relative;
    width: 0;
    height: 100%; // Matches the height of the container

    &::before {
      content: "";
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
      width: var(
        --arrow-width,
        $default-arrow-width
      ); // Width customizable via props
      height: 100%;
      background-color: black;
    }

    &::after {
      content: "";
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
      border: solid black;
      border-width: 0 var(--arrow-width, $default-arrow-width)
        var(--arrow-width, $default-arrow-width) 0;
      display: inline-block;
      padding: 5px;
    }
  }
}
</style>
