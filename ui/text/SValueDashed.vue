<template>
  <div class="s--value-dashed">
    <slot name="label"></slot>
    <div class="dashed-flex-space"></div>
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: "SValueDashed",
  props: {},
};
</script>

<style scoped lang="scss">
/*
━━━━━━━━━━━━━━━━━━━━ 🎺 Variables ━━━━━━━━━━━━━━━━━━━━
 */

/*
━━━━━━━━━━━━━━━━━━━━ 🪅 Classes ━━━━━━━━━━━━━━━━━━━━
 */
.s--value-dashed{
  display: flex;
  align-items: center;
  padding-top: 4px;
  padding-bottom: 4px;
}
</style>
