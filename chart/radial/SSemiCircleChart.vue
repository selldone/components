<template>
  <ul v-if="show" class="chart-skills" :caption="caption">
    <li
      v-for="(item, i) in value"
      :key="i"
      :style="{
        zIndex: value.length - i,
        '--start': ((sumb(i) * 180) / 100) + 'deg',
        '--end': ((sumb(i+1) * 180) / 100) + 'deg',
        '--color':item.color
      }"
    >
      <span>{{ item.title }}</span>
    </li>
  </ul>
</template>

<script>
export default {
  name: "SSemiCircleChart",
  props: {
    value: {
      required: true,
      type: Array,
    },
    caption:{},

  },
  data: () => ({
    show:true,

  }),
  computed: {},
  watch:{
    value(){
      this.show=false
      this.$nextTick(() => {
        this.show=true
      });
    }
  },
  methods: {
    sumb(i) {
      if(!i)return 0;
      let out = 0;
      this.value.slice(0, i ).forEach((v) => (out += v.val));

      //console.log('sumb',i,out)
      return out
    },
  },
};
</script>

<style scoped lang="scss">
/* RESET STYLES
    –––––––––––––––––––––––––––––––––––––––––––––––––– */

.chart-skills {
  margin: 0 auto;
  padding: 0;
  list-style-type: none;
}

.chart-skills *,
.chart-skills::before {
  box-sizing: border-box;
}

/* CHART-SKILLS STYLES
    –––––––––––––––––––––––––––––––––––––––––––––––––– */

.chart-skills {
  position: relative;
  width: 350px;
  height: 175px;
  overflow: hidden;
}

.chart-skills::before,
.chart-skills::after {
  position: absolute;
}

.chart-skills::before {
  content: "";
  left: 0;
  width: inherit;
  height: inherit;
  border: 45px solid rgba(211, 211, 211, 0.3);
  border-bottom: none;
  border-top-left-radius: 175px;
  border-top-right-radius: 175px;
}

.chart-skills::after {
  content: attr(caption);
  left: 50%;
  bottom: 10px;
  transform: translateX(-50%);
  font-size: 1.1rem;
  font-weight: bold;
  color: cadetblue;
}

.chart-skills li {
  position: absolute;
  top: 100%;
  left: 0;
  width: inherit;
  height: inherit;
  border: 45px solid;
  border-top: none;
  border-bottom-left-radius: 175px;
  border-bottom-right-radius: 175px;
  transform-origin: 50% 0;
  transform-style: preserve-3d;
  backface-visibility: hidden;
  animation-fill-mode: forwards;
  animation-duration: 0.4s;
  animation-timing-function: linear;
}

.chart-skills li:nth-child(1) {
  border-color: var(--color);
  animation-name: rotate-auto;
}

.chart-skills li:nth-child(2) {
  border-color: var(--color);
  animation-name: rotate-auto;
  animation-delay: 0.4s;
}

.chart-skills li:nth-child(3) {
  border-color: var(--color);
  animation-name: rotate-auto;
  animation-delay: 0.8s;
}

.chart-skills li:nth-child(4) {
  border-color: var(--color);
  animation-name: rotate-auto;
  animation-delay: 1.2s;
}

.chart-skills li:nth-child(5) {
  border-color: var(--color);
  animation-name: rotate-auto;
  animation-delay: 1.6s;
}

.chart-skills span {
  position: absolute;
  font-size: 0.85rem;
  backface-visibility: hidden;
  animation: fade-in 0.4s linear forwards;
}
.chart-skills{
  li{
    span{
      font-size: 8px;
      font-weight: 500;
    }
  }
}
.chart-skills li:nth-child(1) span {
  top: 5px;
  left: 10px;
  transform: calc(rotate( var(--start)) * -1);
}

.chart-skills li:nth-child(2) span {
  top: 20px;
  left: 10px;
  transform: calc(rotate( var(--start)) * -1);
  animation-delay: 0.4s;
}

.chart-skills li:nth-child(3) span {
  top: 18px;
  left: 10px;
  transform: calc(rotate( var(--start)) * -1);
  animation-delay: 0.8s;
}

.chart-skills li:nth-child(4) span {
  top: 20px;
  left: 10px;
  transform: calc(rotate( var(--start)) * -1);
  animation-delay: 1.2s;
}

.chart-skills li:nth-child(5) span {
  top: 10px;
  left: 10px;
  transform: calc(rotate( var(--start)) * -1);
  animation-delay: 1.6s;
}

/* ANIMATIONS
    –––––––––––––––––––––––––––––––––––––––––––––––––– */

@keyframes rotate-auto {
  0% {
    transform: rotate(var(--start));
  }
  100% {
    transform: rotate(var(--end));
  }
}

@keyframes rotate-three {
  0% {
    transform: rotate(79.2deg);
  }
  100% {
    transform: rotate(140.4deg);
    /**
             * 34% => 61.2deg
             * 61.2 + 79.2 => 140.4deg
             */
  }
}

@keyframes rotate-four {
  0% {
    transform: rotate(140.4deg);
  }
  100% {
    transform: rotate(180deg);
    /**
             * 22% => 39.6deg
             * 140.4 + 39.6 => 180deg
             */
  }
}

@keyframes fade-in {
  0%,
  90% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}
</style>
