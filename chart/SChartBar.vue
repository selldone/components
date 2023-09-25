<template>
  <div>
    <div class="chart-sam">
      <div
        v-for="(it, i) in chart_sam"
        :key="i"
        :style="{ height: it + 'px' }"
      ></div>
    </div>

    <div class="d-flex align-center justify-space-between border-top">
      <small>Sep 7</small>
      <small>Oct 7</small>
    </div>
  </div>
</template>

<script>
// TODO : create of future!
export default {
  name: "SChartBar",
  props: {
    timeSeries: {
      required: true,
      type: Object,
    },
  },
};
</script>

<style scoped lang="scss">
.chart-sam {
  height: 30px;
  display: flex;
  align-items: flex-end;
  > div {
    background-color: #0b5384;
    flex-grow: 1;
    margin: 1px;
    transition: all 0.5s;
  }
}
</style>
