<template>
  <div :class="['vue-d2b-container', `vue-d2b-${name}`]"></div>
</template>

<script>
import { select, selectAll } from "d3-selection";
import "d3-transition";
import { id } from "d2b";

export default {
  name: "Generator",
  props: {
    data: {
      type: Object,
      required: true,
    },
    generator: {
      type: Function,
    },
    config: Function,
    duration: {
      type: Number,
      default: 250,
    },
    id: {
      type: Function,
      default: id,
    },
    advanced: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      name: "generator",
      unwatch: () => {},
    };
  },
  computed: {
    properties() {
      return {
        generator: this.generator,
        data: this.data,
        config: this.config,
      };
    },
  },
  methods: {
    update(options = { skipTransition: false }) {
      this.unwatcher();
      this.$emit("beforeRender", this.$el, this.generator);

      const data = this.data;

      if (this.config) {
        this.config(this.generator);
      }

      const el = select(this.$el);
      const generator = this.advanced
        ? this.generator.advanced
        : this.generator;

      el.datum(data);
      if (options.skipTransition) {
        el.call(generator);
      } else {
        el.transition().duration(this.duration).call(generator);
      }

      this.$emit("rendered", this.$el, this.generator);
      this.watcher();
    },
    updateNow() {
      this.update({ skipTransition: true });
    },

    updateDefer() {
      setTimeout(this.updateNow, 0);
    },

    unwatcher() {
      if (this.unwatch) {
        this.unwatch();
      }
    },

    watcher() {
      this.unwatcher();
      this.unwatch = this.$watch("properties", this.update, { deep: true });
    },
  },
  mounted() {
    this.updateDefer();
    select(window).on(`resize.${this.id}`, this.updateDefer);
  },
  unmounted() {
    selectAll(".d2b-tooltip").remove();
    select(window).on(`resize.${this.id}`, null);
  },
};
</script>

<style>
.vue-d2b-container {
  height: 100%;
  width: 100%;
}
</style>
