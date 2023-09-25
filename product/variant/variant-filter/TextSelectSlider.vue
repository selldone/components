<template>
  <v-flex
    d-flex
    align-center
    justify-center
    class="slider-container pointer-pointer"
    :class="selected ? 'active' : ''"
    @click="toggle()"
  >
    <v-icon color="#fff" class="ml-1" small>
      {{ icon }}
    </v-icon>

    <span v-if="show">
      <span
        v-for="item in list"
        :key="item"
        class="card-badge-info"
        dir="auto"
        @click="select(item)"
        @click.stop
      >
        {{ item }}
      </span>
      <span
        class="card-badge-info"
        dir="auto"
        @click="select(null)"
        @click.stop
      >
         {{$t('global.commons.all')}}
      </span>
    </span>
    <span v-else class="card-badge-info" dir="auto">
      {{ selected ? selected : title }}
    </span>
  </v-flex>
</template>

<script>
export default {
  name: "TextSelectSlider",
  props: {
    icon: {
      required: false,
      type: String
    },
    list: {
      required: true,
      type: Array
    },
    value: {
      required: false,
      default: null
    },

    close: {
      required: false,
      default: true
    },

    title: {
      required: false,
      type: String,
      default: "همه"
    }
  },

  data() {
    return {
      show: false,

      selected: null
    };
  },
  watch: {
    value() {
      this.selected = this.value;
    },
    close() {
      this.show = !this.close;
    }
  },
  created() {
    this.selected = this.value;
    this.show = !this.close;
  },

  methods: {
    toggle() {
      this.show = !this.show;
      if (this.show) this.$emit("open");
      else this.$emit("close");
    },
    select(item) {
      this.selected = item;
      this.$emit("select", item);
      this.show = null;
    }
  }
};
</script>

<style scoped lang="scss">
.slider-container {
  user-select: none;

  background: #999;

  color: #fff;
  border-radius: 8px;
  margin: 3px;
  padding: 4px 8px;

  &.active {
    background: var(--theme-dark);
  }
}

.card-badge-info {
  color: #eee;
  user-select: none;
  cursor: pointer;

  padding: 0 4px;
  font-weight: 400;
  margin-right: 4px;

  &:hover {
    color: #ffa000;
    font-weight: 600;
  }
}
</style>
