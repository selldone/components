<template>
  <div class="s--value-box">
    <div class="flex-grow-1 border-end text-start">
      <v-icon v-if="icon" class="me-1">{{ icon }}</v-icon> {{ label }}
    </div>
    <div class="-val subtitle-2" :class="{ vb50: vb50 }">
      <check v-if="isBoolean(value)" :value="value"></check>
      <span v-else>{{ value }}</span>
      <slot name="value"></slot>
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: "SValueBox",
  props: {
    label: {},
    value: {},
    icon: {},
    vb50: {
      type: Boolean,
      default: false,
    },
  },
};
</script>

<style scoped lang="scss">
/*
━━━━━━━━━━━━━━━━━━━━ 🎺 Variables ━━━━━━━━━━━━━━━━━━━━
 */

/*
━━━━━━━━━━━━━━━━━━━━ 🪅 Classes ━━━━━━━━━━━━━━━━━━━━
 */
.s--value-box {
  display: flex;
  align-items: center;
  border: solid thin #ddd;
  border-radius: 12px;
  padding: 3px 8px;
  margin: 4px auto;
  .-val {
    flex-basis: 30%;
    padding: 2px 4px;
    text-align: center;
    &.vb50 {
      flex-basis: 50%;
    }
  }
}
</style>
