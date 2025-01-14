<template>
  <div class="text-decimal">
    <!-- Display the real part -->
    <span class="real">{{ realPart }}</span>
    <!-- Display the decimal part smaller and in compact format if enabled -->
    <span class="decimal">
      {{ decimalPart }}
    </span>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import numeral from 'numeral'; // Import numeral.js for formatting

export default defineComponent({
  name: "UTextDecimal",
  props: {
    value: {
      type: Number,
      required: true
    },
    decimals: {
      type: Number,
      default: 0 // Default decimal places
    },
    compact: {
      type: Boolean,
      default: false // Determines compact mode
    }
  },
  setup(props) {
    // Extract the real part of the number
    const realPart = computed(() => Math.trunc(props.value));

    // Extract and format the decimal part
    const decimalPart = computed(() => {
      const decimal = props.value - realPart.value; // Get fractional part
      const formatted = props.compact?numeral(decimal).format(`0.[${'0'.repeat(props.decimals)}]`): numeral(decimal).format(`0.${'0'.repeat(props.decimals)}`); // Format to given decimals
      return formatted.substring(1); // Remove the "0." prefix
    });

    return {
      realPart,
      decimalPart
    };
  }
});
</script>

<style scoped lang="scss">
.text-decimal {
  display: inline-block;

  .real {

  }

  .decimal {
    font-size: 80%; /* Make the decimal part smaller */
  }
}
</style>
